<script setup lang="ts">
import { computed } from 'vue'
import { useSelectionStore } from '../stores/selectionStore'

const store = useSelectionStore()

interface CampusOptions {
  [key: string]: string
}

const campusOptions: CampusOptions = {
  '0101': '东院校区',
  '0102': '西院校区',
  '0201': '鉴湖校区',
  '0202': '南湖校区',
  '0301': '余家头校区'
}

const classroomCount = computed(() => store.totalClassrooms || 0)
const campuses = computed(() => store.selectedCampuses.map(campus => campusOptions[campus] || campus))
const timeRange = computed(() => `${store.selectedDateDisplay} ${store.selectedTime}`)

const goToChooseView = () => emit('open');
const emit = defineEmits(['open'])
</script>

<template>
  <div class="bg-white px-5 py-3">
    <div class="mb-2">
      <h1 class="text-lg leading-[26px] font-bold text-gray-900 mb-2">查询到 {{ classroomCount }} 间可用教室</h1>
    </div>
    <div class="flex justify-between">
      <div>
        <div class="flex items-center text-sm leading-[22px] mb-1">
          <span class="text-neutral-600 w-14">校区：</span>
            <span v-for="campus in campuses" :key="campus"
                  class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {{ campus }}
            </span>
        </div>
        <div class="flex items-center">
          <span class="text-neutral-600 text-sm w-14">时间：</span>
          <span class="text-neutral-600 text-sm">{{ timeRange }}</span>
        </div>
      </div>
      <t-button size="small" theme="primary" variant="outline" shape="round" @click="goToChooseView"> 修改条件 </t-button>
    </div>
  </div>
</template>