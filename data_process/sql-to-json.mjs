/**
 * 将 empty_classrooms 的 INSERT 导出转为前端可用的按「校区 + 日历周（周一键）」合并的 JSON。
 *
 * 默认：第一教学周周一 = 2026-09-07（可通过 --term=YYYY-MM-DD 覆盖）。
 * 输出：{ [buildingName]: { [dayOfWeek1-7]: { [classNum1-13]: string[] } } } }
 *
 * 用法：node data_process/sql-to-json.mjs --input=classroom20260928.sql
 *   [--out=cos-upload/classroom] [--term=2026-09-07]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function parseArgs() {
  const out = {
    input: 'classroom20260928.sql',
    dir: 'cos-upload/classroom',
    term: '2026-09-07'
  }
  for (const a of process.argv.slice(2)) {
    if (a.startsWith('--input=')) out.input = a.slice(8)
    else if (a.startsWith('--out=')) out.dir = a.slice(6)
    else if (a.startsWith('--term=')) out.term = a.slice(7)
  }
  return out
}

function getDayOfWeekMon1Sun7(d) {
  let dw = d.getDay()
  return dw === 0 ? 7 : dw
}

/** 与 src/request.ts 中 getFirstDayOfWeek 一致 */
function mondayKeyFromDate(date) {
  const d = new Date(date)
  const day = getDayOfWeekMon1Sun7(d)
  const monday = new Date(d)
  monday.setDate(d.getDate() - day + 1)
  return `${monday.getFullYear()}.${monday.getMonth() + 1}.${monday.getDate()}`
}

function parseTermStartMonday(isoDate) {
  const d = new Date(isoDate + 'T12:00:00')
  if (Number.isNaN(d.getTime())) throw new Error(`无效学期起始日: ${isoDate}`)
  return d
}

function slotCalendarDate(termStartMonday, week, dayOfWeek) {
  const d = new Date(termStartMonday)
  d.setDate(d.getDate() + (week - 1) * 7 + (dayOfWeek - 1))
  return d
}

function roomsToArray(raw) {
  if (!raw || raw.trim() === '') return []
  return raw
    .split(',')
    .map((room) => room.trim())
    .filter(Boolean)
    // 新导出中教室为“校园-楼栋-房间号”，前端只需要房间号。
    .map((room) => room.slice(room.lastIndexOf('-') + 1).trim())
    // 源数据中有少量“1508 1510”这样的多房间记录。
    .flatMap((room) => room.split(/\s+/).filter(Boolean))
}

function main() {
  const { input: inputRel, dir: outRel, term } = parseArgs()
  const sqlPath = path.resolve(ROOT, inputRel)
  const outRoot = path.resolve(ROOT, outRel)
  const termStart = parseTermStartMonday(term)

  if (!fs.existsSync(sqlPath)) throw new Error(`SQL 文件不存在: ${sqlPath}`)

  const content = fs.readFileSync(sqlPath, 'utf8')
  const tupleRe =
    /\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*(\d+),\s*'([^']*)'\)/g

  /** @type {Map<string, Record<string, Record<string, Record<string, string[]>>>>} */
  const buckets = new Map()
  let m
  let rowCount = 0
  while ((m = tupleRe.exec(content)) !== null) {
    rowCount++
    const week = Number(m[1])
    const dayOfWeek = Number(m[2])
    const campus = m[3]
    const building = m[4]
    const classNum = Number(m[5])
    const rooms = roomsToArray(m[6])

    const cal = slotCalendarDate(termStart, week, dayOfWeek)
    const fileKey = `${campus}/${mondayKeyFromDate(cal)}`
    const dow = getDayOfWeekMon1Sun7(cal)

    if (!buckets.has(fileKey)) buckets.set(fileKey, {})
    const campusWeek = buckets.get(fileKey)
    if (!campusWeek[building]) campusWeek[building] = {}
    if (!campusWeek[building][dow]) campusWeek[building][dow] = {}
    campusWeek[building][dow][classNum] = rooms
  }

  if (rowCount === 0) throw new Error(`未从 SQL 中解析到数据: ${sqlPath}`)

  fs.rmSync(outRoot, { recursive: true, force: true })
  for (const [fileKey, payload] of buckets) {
    const target = path.join(outRoot, ...fileKey.split('/')) + '.json'
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, JSON.stringify(payload), 'utf8')
  }

  console.log(
    `sql-to-json: ${rowCount} 行 → ${buckets.size} 个文件，输出目录 ${outRoot}，第一教学周 ${term}`
  )
}

main()
