<script setup lang="ts">
import {ref, computed, watch, onMounted} from "vue";
import {useSelectionStore} from '../stores/selectionStore';
import {fetchAllClassroomData} from '../request';
import type {CollapseValue} from "tdesign-mobile-vue";

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

// 监听和副作用
watch(totalClassrooms, (newTotal: number) => {
  store.setTotalClassrooms(newTotal);
}, {immediate: true});


// 组件挂载时获取数据
onMounted(async () => {
  if (Object.keys(store.classroomData).length === 0) {
    await fetchAllClassroomData();
  }
});
const openingCards = ref<Array<string | number>>([0]);
// 初始化折叠状态
const initializeExpandedState = () => {
  openingCards.value = [0];
}
defineExpose({initializeExpandedState});
watch(buildings, initializeExpandedState, {immediate: true});

const handleChange = (val: CollapseValue) => {
  openingCards.value = val;
};
</script>

<template>
  <div>
    <div v-if="buildings.length === 0" class="text-center py-8 text-gray-500">
      该校区暂无教学楼数据
    </div>
    <div v-else>
      <t-collapse theme="card" :value="openingCards" @change="handleChange">
        <t-collapse-panel v-for="(building,index) of buildings" :key="building.name" :value="index">
          <template #header>
            <h3 class="text-base leading-6 font-semibold text-gray-900">
              {{ building.name }}<span class="text-sm font-normal text-gray-500">（{{ building.count }}）</span>
            </h3>
          </template>
          <div class="content">
            <div class="bg-[#f4f5f9] rounded-[10px] p-4 border border-gray-100">
              <!-- 如果没有教室数据 -->
              <div v-if="building.floors.length === 0" class="text-center py-4 text-gray-500">
                暂无可用教室
              </div>
              <div v-else>
                <div v-for="floor in building.floors" :key="floor.name" class="mb-3 last:mb-0">
                  <h4 class="text-sm text-gray-600 mb-2 font-medium">{{ floor.name }}</h4>
                  <div class="flex flex-wrap gap-2">
                    <div v-for="room in floor.rooms" :key="room"
                         class="w-[52px] h-[25px] flex border-1 border-blue-600 rounded-[10px] font-medium bg-white justify-center items-center">
                      <div class="text-[13px] font-bold leading-[22px]">
                        {{ room }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </t-collapse-panel>
      </t-collapse>
    </div>
  </div>
</template>

<style scoped>
:deep(.t-collapse--card) {
  margin: 0 4px;
}

:deep(.t-collapse-panel__content) {
  padding: 0 16px 16px 16px;
}
</style>