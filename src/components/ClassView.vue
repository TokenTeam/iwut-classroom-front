<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useSelectionStore } from '../stores/selectionStore';
import { fetchAllClassroomData } from '../request';

const store = useSelectionStore();

// 类型定义
interface Floor {
  name: string;
  rooms: string[];
}

interface Building {
  name: string;
  code: string;
  count: number;
  floors: Floor[];
}

// 计算属性 - 使用API返回的数据
const buildings = computed<Building[]>(() => {
  if (!store.classroomData || Object.keys(store.classroomData).length === 0) {
    return [];
  }

  return Object.entries(store.classroomData).map(([name, data]: [string, any]) => ({
    name,
    code: data.code,
    count: data.count,
    floors: data.floors || []
  }));
});

const totalClassrooms = computed(() =>
  buildings.value.reduce((total: number, building: Building) => total + building.count, 0)
);

// 折叠状态
const expandedBuildings = ref<{ [key: string]: boolean }>({})

// 初始化折叠状态
const initializeExpandedState = () => {
  buildings.value.forEach((building: Building, index: number) => {
    expandedBuildings.value[building.name] = index === 0;
  });
}

const toggleBuilding = (buildingName: string) => {
  expandedBuildings.value[buildingName] = !expandedBuildings.value[buildingName]
}

// 监听和副作用
watch(totalClassrooms, (newTotal: number) => {
  store.setTotalClassrooms(newTotal);
}, { immediate: true });

watch(buildings, initializeExpandedState, { immediate: true });

// 组件挂载时获取数据
onMounted(async () => {
  if (Object.keys(store.classroomData).length === 0) {
    await fetchAllClassroomData();
  }
});
</script>

<template>
  <div>
    <div v-if="buildings.length === 0" class="text-center py-8 text-gray-500">
      该校区暂无教学楼数据
    </div>

    <div v-else v-for="(building, index) in buildings" :key="building.name" class="mb-4">
      <!-- 教学楼标题 -->
      <div class="flex justify-between items-center py-3 cursor-pointer" @click="toggleBuilding(building.name)">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ building.name }}<span class="text-sm font-normal text-gray-500 ml-1">（{{ building.count }}）</span>
        </h3>
        <svg class="w-4 h-4 text-gray-500 transition-transform" :class="{ 'transform rotate-180': expandedBuildings[building.name] }"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>

      <!-- 教学楼内容 -->
      <div v-if="expandedBuildings[building.name]" class="mt-2">
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div v-for="floor in building.floors" :key="floor.name" class="mb-3 last:mb-0">
            <h4 class="text-sm text-gray-600 mb-2 font-medium">{{ floor.name }}（{{ floor.rooms.length }}）</h4>
            <div class="flex flex-wrap gap-2 ml-2">
              <span v-for="room in floor.rooms" :key="room"
                    class="px-3 py-1 border border-blue-500 text-gray-900 rounded-full text-sm font-medium bg-white">
                {{ room }}
              </span>
            </div>
          </div>

          <!-- 如果没有教室数据 -->
          <div v-if="building.floors.length === 0" class="text-center py-4 text-gray-500">
            暂无可用教室
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div v-if="index !== buildings.length - 1" class="h-px bg-gray-200 my-4"/>
    </div>
  </div>
</template>