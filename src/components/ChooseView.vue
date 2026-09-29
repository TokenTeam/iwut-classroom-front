<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSelectionStore } from '../stores/selectionStore.ts'
import { loadClassroomData } from "@/request.ts";
import { saveCampusToNativeRPC } from "@/rpc.ts";

const store = useSelectionStore()

const showCalendar = ref(false)
const showTimeDropdown = ref(false)
const selectedCampus = ref(store.selectedCampuses[0] || '南湖校区')

const selectedDateDisplay = computed(() => store.selectedDateDisplay)
const selectedTime = computed(() => store.selectedTime)

const timeOptions = [
  { value: '8:00 - 9:35', label: '8:00 - 9:35     1-2节' },
  { value: '9:55 - 12:20', label: '9:55 - 12:20   3-5节' },
  { value: '14:00 - 16:25', label: '14:00 - 16:25  6-8节' },
  { value: '16:45 - 18:20', label: '16:45 - 18:20 9-10节' },
  { value: '19:00 - 21:25', label: '19:00 - 21:25 11-13节' }
]

const campusOptions = [
  { value: '南湖校区', label: '南湖校区' },
  { value: '马房山校区', label: '马房山校区' }
]

const resetFilters = async () => {
  store.updateSelectedDate(new Date())
  // store.updateSelectedTime('8:00 - 9:35') @note: 此处可以根据实际情况设置默认时间段 @lichx
  store.syncSelectedTimeWithCurrentTime()
  selectedCampus.value = '南湖校区'
  store.updateSelectedCampuses([selectedCampus.value])
  await saveCampusToNativeRPC(selectedCampus.value)

  setTimeout(async () => {
    await loadClassroomData();
  }, 100);
}

const handleDateConfirm = (date: Date) => {
  store.updateSelectedDate(date)
  console.log('选择的日期:', date)
}

const handleTimeSelect = (time: string) => {
  store.updateSelectedTime(time)
  showTimeDropdown.value = false
}

const handleCampusSelect = async (campusValue: string) => {
  selectedCampus.value = campusValue
}

const handleComplete = async () => {
  await saveCampusToNativeRPC(selectedCampus.value)
  store.updateSelectedCampuses([selectedCampus.value])
  close()
  await loadClassroomData();
}

onMounted(() => {
  if (store.selectedCampuses.length > 0) {
    selectedCampus.value = store.selectedCampuses[0]
  }
})

const emit = defineEmits(['close']);

function close() {
  emit('close');
}
</script>

<template>
  <div class="h-full bg-white flex flex-col">
    <svg class="absolute top-4.25 right-4" @click="close" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="asxclose"><path id="stroke1" d="M16.9503 7.05029L12.0005 12M12.0005 12L7.05078 16.9498M12.0005 12L16.9503 16.9498M12.0005 12L7.05078 7.05029" stroke-linecap="square" stroke-width="2" stroke="currentColor"/></g></svg>
    <div class="p-4 flex justify-center text-lg leading-6.5 font-bold">全部筛选</div>
    <div class="flex-1 px-4">
      <div class="my-4">
        <div class="text-sm leading-5.5 font-medium text-gray-900 mb-2">日期</div>
        <div class="flex justify-between items-center cursor-pointer"
             @click="showCalendar = true">
          <div>{{ selectedDateDisplay }}</div>
          <t-button size="small" theme="primary" variant="outline" shape="round">选择日期</t-button>
        </div>
      </div>
      <hr class="border-neutral-200" />
      <div class="my-4">
        <div class="text-sm leading-5.5 font-medium text-gray-900 mb-2">时间</div>
        <div class="relative">
          <div class="flex justify-between items-center cursor-pointer"
               @click="showTimeDropdown = !showTimeDropdown">
            <div>{{ selectedTime }}</div>
            <t-button size="small" theme="primary" variant="outline" shape="round">选择时间</t-button>
          </div>

          <div v-if="showTimeDropdown" class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
            <div v-for="option in timeOptions" :key="option.value"
                 class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                 :class="selectedTime === option.value ? 'text-blue-500 bg-blue-50' : 'text-gray-900'"
                 @click="handleTimeSelect(option.value)">
              {{ option.label }}
            </div>
          </div>
        </div>
      </div>
      <hr class="border-neutral-200" />
      <div class="my-4">
        <div class="text-sm leading-5.5 font-medium text-gray-900 mb-2">校区</div>
        <div class="grid grid-cols-3 grid-rows-2 gap-3">
          <t-check-tag v-for="campus in campusOptions" :key="campus.value" :checked="campus.value === selectedCampus" shape="round" variant="light-outline"
                       size="large" class="w-full min-h-10 flex justify-center items-center" @click="handleCampusSelect(campus.value)">
            {{ campus.label }}
          </t-check-tag>
        </div>
      </div>
    </div>

    <div class="p-4">
      <div class="flex gap-4">
        <t-button class="flex-1" size="large" theme="light" @click="resetFilters">
          重置
        </t-button>
        <t-button class="flex-1" size="large" theme="primary" @click="handleComplete">
          完成
        </t-button>
      </div>
    </div>
    <t-calendar
        v-model:visible="showCalendar"
        :value="new Date(store.selectedDate)"
        @confirm="handleDateConfirm"
    />

    <div v-if="showTimeDropdown" class="fixed inset-0 z-0" @click="showTimeDropdown = false"/>
  </div>
</template>
