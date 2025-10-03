<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useSelectionStore } from '../stores/selectionStore'
import CalendarPopup from '../components/CalendarPopup.vue'
import { fetchAllClassroomData } from "@/request.ts";

const router = useRouter()
const store = useSelectionStore()

const showCalendar = ref(false)
const showTimeDropdown = ref(false)
const selectedCampus = ref(store.selectedCampuses[0] || '0202')

const selectedDateDisplay = computed(() => store.selectedDateDisplay)
const selectedTime = computed(() => store.selectedTime)

const timeOptions = [
  { value: '8:00 - 9:35', label: '8:00 - 9:35     1-2节' },
  { value: '9:55 - 12:20', label: '9:55 - 12:20     3-5节' },
  { value: '14:00 - 16:25', label: '14:00 - 16:25   6-8节' },
  { value: '16:45 - 18:20', label: '16:45 - 18:20  9-10节' },
  { value: '19:00 - 21:25', label: '19:00 - 21:25 11-13节' }
]

const campusOptions = [
  { value: '0101', label: '东院校区' },
  { value: '0102', label: '西院校区' },
  { value: '0201', label: '鉴湖校区' },
  { value: '0202', label: '南湖校区' },
  { value: '0301', label: '余家头校区' }
]

const goBack = () => router.back()

const resetFilters = () => {
  store.updateSelectedDate(new Date())
  store.updateSelectedTime('8:00 - 9:35')
  selectedCampus.value = '0202'
  store.updateSelectedCampuses([selectedCampus.value])

  setTimeout(() => {
    fetchAllClassroomData();
  }, 100);
}

const handleDateConfirm = (date: Date) => {
  console.log('选择的日期:', date)
}

const handleTimeSelect = (time: string) => {
  store.updateSelectedTime(time)
  showTimeDropdown.value = false
}

const handleCampusSelect = (campusValue: string) => {
  selectedCampus.value = campusValue
}

const handleComplete = () => {
  store.updateSelectedCampuses([selectedCampus.value])
  goBack()
}

onMounted(() => {
  if (store.selectedCampuses.length > 0) {
    selectedCampus.value = store.selectedCampuses[0]
  }
})
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <div class="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
      <button class="flex items-center text-gray-600 text-base" @click="goBack">
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        返回
      </button>
      <h1 class="text-lg font-semibold text-gray-900">全部筛选</h1>
      <div class="w-15"></div>
    </div>

    <div class="flex-1 p-4">
      <div class="mb-4">
        <h3 class="text-base font-medium text-gray-900 mb-2">日期</h3>
        <div class="flex justify-between items-center p-3 rounded-full border border-blue-500 text-blue-500 bg-white cursor-pointer"
             @click="showCalendar = true">
          <div>{{ selectedDateDisplay }}</div>
          <div class="text-sm">选择日期</div>
        </div>
      </div>

      <div class="mb-4">
        <h3 class="text-base font-medium text-gray-900 mb-2">时间</h3>
        <div class="relative">
          <div class="flex justify-between items-center p-3 rounded-full border border-blue-500 text-blue-500 bg-white cursor-pointer"
               @click="showTimeDropdown = !showTimeDropdown">
            <div>{{ selectedTime }}</div>
            <div class="text-sm">选择时间</div>
          </div>

          <div v-if="showTimeDropdown" class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            <div v-for="option in timeOptions" :key="option.value"
                 class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                 :class="selectedTime === option.value ? 'text-blue-500 bg-blue-50' : 'text-gray-900'"
                 @click="handleTimeSelect(option.value)">
              {{ option.label }}
            </div>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <h3 class="text-base font-medium text-gray-900 mb-2">校区</h3>
        <div class="flex flex-wrap gap-2">
          <div v-for="campus in campusOptions" :key="campus.value"
               class="px-4 py-2 rounded-full border cursor-pointer transition-colors"
               :class="selectedCampus === campus.value ? 'border-blue-500 text-blue-500 bg-white' : 'border-gray-300 text-gray-900 bg-white hover:border-gray-400'"
               @click="handleCampusSelect(campus.value)">
            {{ campus.label }}
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 border-t border-gray-200">
      <div class="flex gap-3">
        <button class="flex-1 py-3 bg-white text-blue-500 border border-blue-500 rounded font-medium" @click="resetFilters">
          重置
        </button>
        <button class="flex-1 py-3 bg-blue-500 text-white rounded font-medium" @click="handleComplete">
          完成
        </button>
      </div>
    </div>

    <CalendarPopup v-model:visible="showCalendar" @confirm="handleDateConfirm"/>

    <div v-if="showTimeDropdown" class="fixed inset-0 z-0" @click="showTimeDropdown = false"/>
  </div>
</template>