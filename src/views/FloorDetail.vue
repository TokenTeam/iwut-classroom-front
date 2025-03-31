<!-- FloorDetail.vue 最终优化版 -->
<template>
  <div class="floor-detail">
    <t-loading :loading="isLoading"/>
      <div
          v-for="(rooms, buildingCode) in store.classroomData"
          :key="buildingCode"
          class="building-section"
      >
        <!-- 显示建筑名称 -->
        {{ getBuildingName(buildingCode) }}

        <div class="room-list">
          <div
              v-for="room in filterRoomsByFloor(rooms)"
              :key="`${buildingCode}-${room}`"
              class="room-item"
          >
            {{ room }}
          </div>

          <div v-if="filterRoomsByFloor(rooms).length === 0" class="empty-tip">
            当前楼层暂无教室
          </div>
        </div>
      </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import {useRoute} from 'vue-router'
import {useSelectionStore} from '@/stores/selectionStore'
import {storeToRefs} from "pinia";

const route = useRoute()
const store = useSelectionStore()

// 楼层映射配置
// const floorConfig = {
//   one: { number: 1, label: '一楼' },
//   two: { number: 2, label: '二樓' },
//   three: { number: 3, label: '三樓' },
//   four: { number: 4, label: '四樓' },
//   five: { number: 5, label: '五樓' }
// }
const floorConfig = {
  1: {number: 1, label: '一楼'},
  2: {number: 2, label: '二樓'},
  3: {number: 3, label: '三樓'},
  4: {number: 4, label: '四樓'},
  5: {number: 5, label: '五樓'}
}
// 建筑名称映射表
const buildingNameMap: Record<string, string> = {
  '010102': '弘毅楼（附楼）',
  '010103': '弘毅楼（主楼）',
  '010106': '致远楼',
  '010201': '东教学楼',
  '020101': '爱特楼',
  '020102': '北教一',
  '020103': '北教二',
  '020104': '北教三',
  '020105': '学海楼',
  '020201': '博学北楼',
  '020202': '博学东楼',
  '020203': '博学西楼',
  '020204': '博学主楼',
  '030102': '教学大楼',
  '030201': '航海楼'
}
// 获取建筑名称方法
const getBuildingName = (code: string) => {
  return buildingNameMap[code] || `未知建筑（${code}）`
}
// 获取当前楼层信息
// const currentFloor = computed(() => {
//   const pathSegments = route.path.split('/')
//   const floorKey = pathSegments[pathSegments.length - 1] as keyof typeof floorConfig
//   return floorConfig[floorKey] || { number: 0, label: '未知楼层' }
// })
const props = defineProps(["currentFloorIndex"]);
const currentFloor = computed(() => floorConfig[props.currentFloorIndex] || {number: 0, label: '未知楼层'})

// 显示标签
// const currentFloorLabel = computed(() => currentFloor.value.label)

// 教室筛选逻辑
const filterRoomsByFloor = (rooms: string[]) => {
  return rooms.filter(room => {
    // 匹配教室编号首数字（兼容1位或2位楼层号）
    const floorNumber = parseInt(room.substring(0, Math.max(room.indexOf('0'), 1)))
    return floorNumber === currentFloor.value.number
  })
}

const {isLoading} =storeToRefs(store);
</script>

<style scoped>
.building-section {
  margin: 24px 0;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 112px;
}

h3 {
  margin: 0 0 16px;
  color: #333;
  font-size: 18px;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
}

.room-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); /* 将最小宽度减半 */
  gap: 0;
}

.room-item {
  padding: 0;
  background: #f8f9fa;
  border: 0;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 40px; /* 添加最小宽度保证显示 */
  box-sizing: border-box;

  &:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }
}

.empty-tip {
  color: #6c757d;
  padding: 16px;
  text-align: center;
  grid-column: 1 / -1;
}
</style>