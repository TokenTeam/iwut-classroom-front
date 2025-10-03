<template>
  <div v-if="visible" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="close"/>

    <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl transform transition-transform duration-300 ease-out max-h-[85vh] overflow-hidden flex flex-col"
         :class="visible ? 'translate-y-0' : 'translate-y-full'">

      <div class="flex justify-center pt-3 pb-2">
        <div class="w-12 h-1 bg-gray-300 rounded-full"/>
      </div>

      <div class="flex justify-between items-center px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <button @click="prevMonth" class="p-2 text-gray-500 hover:text-gray-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <div class="text-lg font-semibold text-gray-900">{{ currentYear }}年{{ currentMonth }}月</div>

        <div class="flex items-center">
          <button @click="nextMonth" class="p-2 text-gray-500 hover:text-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <button @click="close" class="ml-2 text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-7 text-center py-4 border-b border-gray-200 flex-shrink-0">
        <div v-for="day in weekdays" :key="day" class="text-sm font-medium text-gray-500">{{ day }}</div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div class="grid grid-cols-7 gap-2 p-4">
          <div v-for="day in calendarDays" :key="day.date.getTime()"
               class="aspect-square flex items-center justify-center text-sm cursor-pointer rounded-full"
               :class="getDayClass(day)"
               @click="selectDate(day)">
            {{ day.day }}
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <button @click="confirmSelection" class="w-full py-4 bg-blue-500 text-white rounded-lg font-medium text-base">
          完成
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSelectionStore } from '../stores/selectionStore'

interface CalendarDay {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
}

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', value: Date): void
}>()

const store = useSelectionStore()
const currentDate = ref(new Date())
const selectedDate = ref<Date>(new Date(store.selectedDate))
const today = new Date()

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)
const hasSelectedDifferentDay = computed(() => !isSameDay(selectedDate.value, today))

const calendarDays = computed((): CalendarDay[] => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  const firstDayWeekday = firstDay.getDay()

  const days: CalendarDay[] = []

  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i)
    days.push(createCalendarDay(date, false))
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push(createCalendarDay(date, true))
  }

  const totalCells = 42
  const nextMonthDays = totalCells - days.length
  for (let i = 1; i <= nextMonthDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push(createCalendarDay(date, false))
  }

  return days
})

const isToday = (date: Date): boolean => date.toDateString() === today.toDateString()
const isSameDay = (date1: Date, date2: Date): boolean => date1.toDateString() === date2.toDateString()

const createCalendarDay = (date: Date, isCurrentMonth: boolean): CalendarDay => ({
  date,
  day: date.getDate(),
  isCurrentMonth,
  isToday: isToday(date),
  isSelected: isSameDay(date, selectedDate.value)
})

const getDayClass = (day: CalendarDay): string => {
  const baseClasses = ['transition-colors duration-200']

  if (!day.isCurrentMonth) return [...baseClasses, 'text-gray-400'].join(' ')
  if (day.isSelected) return [...baseClasses, 'bg-blue-500 text-white'].join(' ')
  if (day.isToday && !hasSelectedDifferentDay.value) return [...baseClasses, 'bg-blue-500 text-white'].join(' ')

  return [...baseClasses, 'text-gray-900 hover:bg-gray-100'].join(' ')
}

const prevMonth = (): void => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = (): void => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const selectDate = (day: CalendarDay): void => {
  if (!day.isCurrentMonth) {
    currentDate.value = new Date(day.date.getFullYear(), day.date.getMonth(), 1)
  }
  selectedDate.value = day.date
}

const confirmSelection = (): void => {
  store.updateSelectedDate(selectedDate.value)
  emit('confirm', selectedDate.value)
  close()
}

const close = (): void => {
  emit('update:visible', false)
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    selectedDate.value = new Date(store.selectedDate)
  }
})
</script>