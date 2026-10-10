/**
 * 将逐教室课程表转换为前端使用的 v2 周占用位图。
 *
 * 输出：{out}/{campus}/{mondayKey}.json
 * 每个教室对应 7 个整数；整数第 N 位为 1，表示当天第 N+1 节被占用。
 *
 * 用法：
 * node data_process/classes-to-json.mjs \
 *   --input=/path/to/classes.tar \
 *   --out=cos-upload/classroom/v2/2026-fall \
 *   --term=2026-09-07
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const MAX_SECTION = 16

const TARGET_CAMPUS_BY_LOCATION = new Map([
  ['南院/博学北楼', '南湖校区'],
  ['南院/博学东楼', '南湖校区'],
  ['南院/博学西楼', '南湖校区'],
  ['南院/博学主楼', '南湖校区'],
  ['东院/弘毅楼（主楼）', '东院'],
  ['东院/弘毅楼（附楼）', '东院'],
  ['东院/致远楼', '东院'],
  ['西院/东教学楼', '西院'],
  ['西院/南配楼', '西院'],
  ['西院/工大楼', '西院'],
  ['马区西/工大楼', '西院'],
  ['北院/爱特楼', '鉴湖'],
  ['北院/北院第一教学楼', '鉴湖'],
  ['北院/北院第二教学楼', '鉴湖'],
  ['北院/北院第三教学楼', '鉴湖'],
  ['北院/学海楼', '鉴湖'],
  ['余区/东配楼', '余家头校区'],
  ['余区/西配楼', '余家头校区'],
  ['余区/航海楼', '余家头校区'],
  ['余区/余区教学大楼', '余家头校区']
])

const TARGET_CAMPUS_BY_AREA = new Map([
  ['军山', '军山校区'],
  ['军山校区', '军山校区']
])

function parseArgs() {
  const options = {
    input: '',
    out: 'cos-upload/classroom/v2/2026-fall',
    term: '2026-09-07'
  }

  for (const argument of process.argv.slice(2)) {
    if (argument.startsWith('--input=')) options.input = argument.slice(8)
    else if (argument.startsWith('--out=')) options.out = argument.slice(6)
    else if (argument.startsWith('--term=')) options.term = argument.slice(7)
    else throw new Error(`未知参数: ${argument}`)
  }

  if (!options.input) throw new Error('必须指定 --input=教室目录或tar文件')
  return options
}

function parseIsoDate(value) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime()) || date.getDay() !== 1) {
    throw new Error(`--term 必须是有效的周一日期: ${value}`)
  }
  return date
}

function formatMonday(date) {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}

function formatIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function findJsonFiles(directory) {
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...findJsonFiles(target))
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(target)
  }
  return files.sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }))
}

function openSource(inputPath) {
  const resolved = path.resolve(ROOT, inputPath)
  if (!fs.existsSync(resolved)) throw new Error(`输入不存在: ${resolved}`)

  if (fs.statSync(resolved).isDirectory()) {
    return { directory: resolved, cleanup: () => {}, sourceHash: null }
  }

  const entries = execFileSync('tar', ['-tf', resolved], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
  if (entries.some((entry) => path.isAbsolute(entry) || entry.split('/').includes('..'))) {
    throw new Error('tar 文件包含不安全路径')
  }

  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'iwut-classrooms-'))
  execFileSync('tar', ['-xf', resolved, '-C', tempDirectory])
  const sourceHash = crypto.createHash('sha256').update(fs.readFileSync(resolved)).digest('hex')

  return {
    directory: tempDirectory,
    cleanup: () => fs.rmSync(tempDirectory, { recursive: true, force: true }),
    sourceHash
  }
}

function parseRoomLocation(name) {
  if (name.includes('不要教室') || name === '校外教学') return null

  const firstSeparator = name.indexOf('-')
  if (firstSeparator < 1) return null
  const area = name.slice(0, firstSeparator)
  const areaCampus = TARGET_CAMPUS_BY_AREA.get(area)

  const location = name.slice(firstSeparator + 1)
  const secondSeparator = location.indexOf('-')
  if (secondSeparator >= 1) {
    const building = location.slice(0, secondSeparator)
    const campus = areaCampus ?? TARGET_CAMPUS_BY_LOCATION.get(`${area}/${building}`)
    if (!campus) return null
    return {
      campus,
      building,
      room: location.slice(secondSeparator + 1)
    }
  }

  const venue = location.match(/^(.+?)(\d+)$/u)
  if (!venue) throw new Error(`无法拆分楼栋和教室: ${name}`)
  const campus = areaCampus ?? TARGET_CAMPUS_BY_LOCATION.get(`${area}/${venue[1]}`)
  return campus ? { campus, building: venue[1], room: venue[2] } : null
}

function parseExplicitWeeks(value) {
  if (value == null) return null
  if (typeof value !== 'string' || value.trim() === '') return []

  const weeks = new Set()
  for (const segment of value.split(',')) {
    const match = segment.trim().match(/^(\d+)(?:-(\d+))?周(?:\((单|双)\))?$/u)
    if (!match) throw new Error(`无法解析周次: ${value}`)
    const start = Number(match[1])
    const end = Number(match[2] ?? match[1])
    const parity = match[3]
    if (start < 1 || end < start) throw new Error(`无效周次: ${value}`)

    for (let week = start; week <= end; week++) {
      if (parity === '单' && week % 2 === 0) continue
      if (parity === '双' && week % 2 === 1) continue
      weeks.add(week)
    }
  }
  return [...weeks].sort((a, b) => a - b)
}

function sectionMask(start, end) {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > MAX_SECTION || end < start) {
    throw new Error(`无效节次范围: ${start}-${end}`)
  }

  let mask = 0
  for (let section = start; section <= end; section++) mask |= 1 << (section - 1)
  return mask
}

function sortMap(value) {
  return Object.fromEntries(
    [...value.entries()].sort(([a], [b]) => a.localeCompare(b, 'zh-CN', { numeric: true }))
  )
}

function main() {
  const options = parseArgs()
  const termStart = parseIsoDate(options.term)
  const outputRoot = path.resolve(ROOT, options.out)
  const source = openSource(options.input)

  try {
    const files = findJsonFiles(source.directory)
    if (files.length === 0) throw new Error(`没有找到 JSON: ${source.directory}`)

    const classrooms = []
    let excludedFiles = 0
    let maxWeek = 0

    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (typeof data.name !== 'string' || !Array.isArray(data.courses)) {
        throw new Error(`教室文件格式错误: ${file}`)
      }

      const location = parseRoomLocation(data.name)
      if (!location) {
        excludedFiles++
        continue
      }

      const courses = data.courses.map((course) => {
        const weeks = parseExplicitWeeks(course.weeks)
        const isBlockingPlaceholder = course.course == null && course.class == null && course.teacher == null
        if (!isBlockingPlaceholder && weeks?.length) maxWeek = Math.max(maxWeek, ...weeks)
        return {
          weeks,
          weekday: Number(course.weekday),
          mask: sectionMask(Number(course.start), Number(course.end))
        }
      })
      classrooms.push({ ...location, courses })
    }

    if (maxWeek === 0) throw new Error('源数据中没有有效周次')

    /** @type {Map<string, Map<string, Map<string, number[][]>>>} */
    const campuses = new Map()
    let duplicateRooms = 0

    for (const classroom of classrooms) {
      if (!campuses.has(classroom.campus)) campuses.set(classroom.campus, new Map())
      const buildings = campuses.get(classroom.campus)
      if (!buildings.has(classroom.building)) buildings.set(classroom.building, new Map())
      const rooms = buildings.get(classroom.building)

      if (!rooms.has(classroom.room)) {
        rooms.set(classroom.room, Array.from({ length: maxWeek }, () => Array(7).fill(0)))
      } else {
        duplicateRooms++
      }

      const occupancy = rooms.get(classroom.room)
      for (const course of classroom.courses) {
        if (!Number.isInteger(course.weekday) || course.weekday < 1 || course.weekday > 7) {
          throw new Error(`无效星期: ${classroom.campus}/${classroom.building}/${classroom.room}`)
        }
        const weeks = course.weeks ?? Array.from({ length: maxWeek }, (_, index) => index + 1)
        for (const week of weeks) {
          if (week <= maxWeek) occupancy[week - 1][course.weekday - 1] |= course.mask
        }
      }
    }

    fs.rmSync(outputRoot, { recursive: true, force: true })
    fs.mkdirSync(outputRoot, { recursive: true })

    const manifestCampuses = []
    let outputFiles = 0
    let roomCount = 0

    for (const [campus, buildingMap] of [...campuses.entries()].sort(([a], [b]) => a.localeCompare(b, 'zh-CN'))) {
      const campusDirectory = path.join(outputRoot, campus)
      fs.mkdirSync(campusDirectory, { recursive: true })
      const campusRoomCount = [...buildingMap.values()].reduce((sum, rooms) => sum + rooms.size, 0)
      roomCount += campusRoomCount

      for (let week = 1; week <= maxWeek; week++) {
        const buildings = new Map()
        for (const [building, roomMap] of buildingMap) {
          const rooms = new Map()
          for (const [room, occupancy] of roomMap) rooms.set(room, occupancy[week - 1])
          buildings.set(building, sortMap(rooms))
        }

        const monday = addDays(termStart, (week - 1) * 7)
        const payload = {
          schemaVersion: 2,
          campus,
          week,
          monday: formatMonday(monday),
          buildings: sortMap(buildings)
        }
        fs.writeFileSync(
          path.join(campusDirectory, `${formatMonday(monday)}.json`),
          JSON.stringify(payload)
        )
        outputFiles++
      }

      manifestCampuses.push({
        name: campus,
        buildingCount: buildingMap.size,
        roomCount: campusRoomCount
      })
    }

    const manifest = {
      schemaVersion: 2,
      termStart: options.term,
      termEnd: formatIsoDate(addDays(termStart, maxWeek * 7 - 1)),
      weekCount: maxWeek,
      maxSection: MAX_SECTION,
      source: {
        jsonFiles: files.length,
        excludedFiles,
        duplicateRooms,
        sha256: source.sourceHash
      },
      campuses: manifestCampuses
    }
    fs.writeFileSync(path.join(outputRoot, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')

    console.log(
      `classes-to-json: ${files.length} 个源文件（排除 ${excludedFiles}）→ ` +
      `${roomCount} 间教室、${manifestCampuses.length} 个校区、${outputFiles} 个周文件；` +
      `教学周 1-${maxWeek}，输出 ${outputRoot}`
    )
  } finally {
    source.cleanup()
  }
}

main()
