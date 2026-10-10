import { useSelectionStore } from './stores/selectionStore'

function getFirstDayOfWeek(date?: Date): string {
  const selectedDate = date || new Date()
  const day = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay()
  const monday = new Date(selectedDate)
  monday.setDate(selectedDate.getDate() - day + 1)

  return `${monday.getFullYear()}.${monday.getMonth() + 1}.${monday.getDate()}`
}

function getDayOfWeek(date?: Date): number {
  const today = date || new Date()
  const dayOfWeek = today.getDay()
  return dayOfWeek === 0 ? 7 : dayOfWeek
}

type FloorClassroom = {
  name: string
  rooms: string[]
}

type BuildingClassroom = {
  code: string
  count: number
  floors: FloorClassroom[]
}

type OccupancyBundle = {
  schemaVersion: 3
  campus: string
  week: number
  monday: string
  buildings: Record<string, Record<string, number[]>>
}

function getFloorName(room: string): string {
  const numericRange = room.match(/^(\d+)-(\d{3,})/)
  if (numericRange) {
    const floorSource = numericRange[1].length >= 3 ? numericRange[1] : numericRange[2]
    return `${Number(floorSource.slice(0, -2))}楼`
  }

  const leadingRoomNumber = room.match(/^(\d{3,})/)
  if (leadingRoomNumber) return `${Number(leadingRoomNumber[1].slice(0, -2))}楼`
  if (/^[A-Za-zＡ-Ｚａ-ｚ南北东西中]-?\d/.test(room)) return `${room.charAt(0)}楼`
  if (/^\d+$/.test(room)) return '场地'
  return '场地'
}

const baseURL = (import.meta.env.VITE_OSS_URL ?? '') as string
const datasetPath = (import.meta.env.VITE_CLASSROOM_DATASET ?? 'v3/2026-fall')
  .replace(/^\/+|\/+$/g, '')

/** v3 周占用位图：/{dataset}/{campus}/{周一键}.json */
function classroomBundleUrl(campus: string, mondayKey: string): string {
  const dataPath = `${datasetPath}/${encodeURIComponent(campus)}/${mondayKey}.json`
  if (baseURL === '/' || baseURL === '') return `/${dataPath}`
  return `${baseURL.replace(/\/$/, '')}/${dataPath}`
}

export async function loadClassroomData(): Promise<void> {
  const store = useSelectionStore()
  store.setLoading(true)
  const campus = store.campus
  const targetDate = new Date(store.selectedDate)
  const mondayKey = getFirstDayOfWeek(targetDate)
  const result = new Map<string, BuildingClassroom>()
  let count = 0
  const dayIndex = getDayOfWeek(targetDate) - 1
  const firstSection = Number(store.time)
  const lastSection = Number(store.section)

  const url = classroomBundleUrl(campus, mondayKey)
  let bundle: OccupancyBundle | null = null
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('网络请求失败，url: ' + url)
    bundle = await response.json() as OccupancyBundle
    if (bundle.schemaVersion !== 3 || !bundle.buildings) {
      throw new Error('不支持的教室数据格式，url: ' + url)
    }
  } catch (error) {
    console.error(`获取校区 ${campus} 课表数据失败:`, error)
  }

  let requestedMask = 0
  for (let section = firstSection; section <= lastSection; section++) {
    requestedMask |= 1 << (section - 1)
  }

  for (const [building, rooms] of Object.entries(bundle?.buildings ?? {})) {
    const availableRooms = Object.entries(rooms)
      .filter(([, dailyOccupancy]) => ((dailyOccupancy[dayIndex] ?? 0) & requestedMask) === 0)
      .map(([room]) => room)
      .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }))

    const buildingResult: BuildingClassroom = {
      code: building,
      count: availableRooms.length,
      floors: []
    }
    const floors = new Map<string, string[]>()

    for (const room of availableRooms) {
      const floorName = getFloorName(room)
      if (!floors.has(floorName)) floors.set(floorName, [])
      floors.get(floorName)!.push(room)
    }

    for (const [name, floorRooms] of floors) {
      buildingResult.floors.push({ name, rooms: floorRooms })
    }
    buildingResult.floors.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }))
    buildingResult.floors.forEach((floor) => {
      floor.rooms.sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }))
    })

    result.set(building, buildingResult)
    count += availableRooms.length
  }

  store.setClassroomData(Object.fromEntries(result))
  store.setTotalClassrooms(count)
  store.setLoading(false)
}
