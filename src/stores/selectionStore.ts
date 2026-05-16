import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface ClassroomData {
  [key: string]: any
}

interface UpdateSelectionsPayload {
  campus: string
  time: string
  section: string
}

const timeMap: Record<string, { start: number; end: number }> = {
  '8:00 - 9:35': { start: 1, end: 2 },
  '9:55 - 12:20': { start: 3, end: 5 },
  '12:25 - 13:50': { start: 6, end: 7 },
  '14:00 - 16:25': { start: 8, end: 10 },
  '16:45 - 18:20': { start: 11, end: 12 },
  '18:20 - 18:55': { start: 13, end: 13 },
  '19:00 - 21:25': { start: 14, end: 16 }
}

const getCurrentTimeSlotKey = (date: Date = new Date()): string => {
  const currentMinutes = date.getHours() * 60 + date.getMinutes()

  const parseMinutes = (timeText: string): number => {
    const [hoursText, minutesText] = timeText.split(':')
    return Number(hoursText) * 60 + Number(minutesText)
  }

  const orderedSlots = Object.keys(timeMap).map((label) => {
    const [startText, endText] = label.split(' - ')
    return {
      label,
      startMinutes: parseMinutes(startText),
      endMinutes: parseMinutes(endText)
    }
  }).sort((a, b) => a.startMinutes - b.startMinutes) // 确保按开始时间排序

  // 1. 优先找包含当前时间的时间段
  const currentSlot = orderedSlots.find(
    (slot) => currentMinutes >= slot.startMinutes && currentMinutes <= slot.endMinutes
  )
  
  if (currentSlot) return currentSlot.label

  // 2. 找不到则找下一个即将开始的时间段（向后看）
  const nextSlot = orderedSlots.find(
    (slot) => currentMinutes < slot.startMinutes
  )
  
  if (nextSlot) return nextSlot.label

  // 3. 如果连下一个都没有（即当前时间晚于所有时间段），返回最后一个
  return orderedSlots[orderedSlots.length - 1]?.label || '8:00 - 9:35'
}

const formatDateDisplay = (date: Date): string => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekday = weekdays[date.getDay()]
  return `${month}月${day}日 ${weekday}`
}

export const useSelectionStore = defineStore('selections', () => {
  const campus = ref<string>('0202')
  const time = ref<number>(1) // 改为 number 类型
  const section = ref<number>(2) // 改为 number 类型
  const availableBuildings = ref<string[]>([])
  const classroomData = ref<ClassroomData>({})
  const isLoading = ref<boolean>(true)

  const selectedDate = ref<string>(new Date().toISOString().split('T')[0])
  const selectedDateDisplay = ref<string>(formatDateDisplay(new Date()))
  const selectedTime = ref<string>(getCurrentTimeSlotKey())
  const selectedCampuses = ref<string[]>(['0202'])
  const selectedBuildings = ref<string[]>(['博学主楼'])
  const totalClassrooms = ref<number>(0)

  const updateTimeFromSelectedTime = (timeValue: string) => {
    const timeConfig = timeMap[timeValue]
    if (timeConfig) {
      time.value = timeConfig.start
      section.value = timeConfig.end
    }
  }

  const updateSelections = (payload: UpdateSelectionsPayload): void => {
    campus.value = payload.campus
    time.value = Number(payload.time) // 确保转换为数字
    section.value = Number(payload.section) // 确保转换为数字
  }

  const updateSelectedDate = (date: Date): void => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    selectedDate.value = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    selectedDateDisplay.value = formatDateDisplay(date)
  }

  const updateSelectedTime = (timeValue: string): void => {
    selectedTime.value = timeValue
    updateTimeFromSelectedTime(timeValue)
  }

  const syncSelectedTimeWithCurrentTime = (): void => {
    updateSelectedTime(getCurrentTimeSlotKey())
  }

  const updateSelectedCampuses = (campuses: string[]): void => {
    selectedCampuses.value = campuses
    campus.value = campuses[0] || '0202'
  }

  const updateSelectedBuildings = (buildings: string[]): void => { selectedBuildings.value = buildings }
  const setTotalClassrooms = (count: number): void => { totalClassrooms.value = count }
  const setAvailableBuildings = (buildings: string[]): void => { availableBuildings.value = buildings }
  const setClassroomData = (data: ClassroomData): void => { classroomData.value = data }
  const setLoading = (loading: boolean): void => { isLoading.value = loading }

  const reset = (): void => {
    campus.value = '0202'
    availableBuildings.value = []
    classroomData.value = {}
    isLoading.value = false

    const today = new Date()
    selectedDate.value = today.toISOString().split('T')[0]
    selectedDateDisplay.value = formatDateDisplay(today)
    selectedCampuses.value = ['0202']
    selectedBuildings.value = ['博学主楼']
    totalClassrooms.value = 0

    syncSelectedTimeWithCurrentTime()
  }

  const hasClassroomData = computed(() => Object.keys(classroomData.value).length > 0)
  const totalBuildings = computed(() => availableBuildings.value.length)

  // 初始化时间映射
  updateTimeFromSelectedTime(selectedTime.value)

  return {
    campus, time, section, availableBuildings, classroomData, isLoading,
    selectedDate, selectedDateDisplay, selectedTime, selectedCampuses,
    selectedBuildings, totalClassrooms,

    updateSelections, updateSelectedDate, updateSelectedTime, updateSelectedCampuses,
    updateSelectedBuildings, setTotalClassrooms, setAvailableBuildings,
    setClassroomData, setLoading, reset,
    syncSelectedTimeWithCurrentTime,

    hasClassroomData, totalBuildings
  }
})