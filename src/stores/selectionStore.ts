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
  '14:00 - 16:25': { start: 6, end: 8 },
  '16:45 - 18:20': { start: 9, end: 10 },
  '19:00 - 21:25': { start: 11, end: 13 }
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
  const selectedTime = ref<string>('8:00 - 9:35')
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
    time.value = 1
    section.value = 2
    availableBuildings.value = []
    classroomData.value = {}
    isLoading.value = false

    const today = new Date()
    selectedDate.value = today.toISOString().split('T')[0]
    selectedDateDisplay.value = formatDateDisplay(today)
    selectedTime.value = '8:00 - 9:35'
    selectedCampuses.value = ['0202']
    selectedBuildings.value = ['博学主楼']
    totalClassrooms.value = 0
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

    hasClassroomData, totalBuildings
  }
})