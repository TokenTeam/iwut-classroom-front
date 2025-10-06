<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSelectionStore } from '../stores/selectionStore'

const router = useRouter()
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

const goToChooseView = () => router.push('/ChooseView')
</script>

<template>
  <div class="bg-white pl-5 pr-5 pt-3 pb-3">
    <div class="mb-4">
      <h1 class="text-xl font-bold text-gray-900 mb-2">查询到 {{ classroomCount }} 间可用教室</h1>
    </div>
    <div class="flex">
      <div class="mb-4">
        <div class="flex items-start mb-2">
          <span class="text-gray-600 text-sm w-12 mr-2">校区：</span>
          <div class="flex flex-wrap gap-1">
            <span v-for="campus in campuses" :key="campus"
                  class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {{ campus }}
            </span>
          </div>
        </div>

        <div class="flex items-center">
          <span class="text-gray-600 text-sm w-12 mr-2">时间：</span>
          <span class="text-gray-900 text-sm">{{ timeRange }}</span>
        </div>
      </div>
      <button class="px-4 py-2 border border-blue-500 text-blue-500 rounded-full text-sm hover:bg-blue-50 transition-colors self-center"
              @click="goToChooseView">
        修改条件
      </button>
    </div>


  </div>
</template>