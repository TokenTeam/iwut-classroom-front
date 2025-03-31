<!-- RoomView.vue -->
<template>
  <div class="one-view-container">

      <h2 class="floor-title">{{ currentFloor }}详情</h2>

      <!-- 共享的动态内容区域 -->
    <div class="dynamic-content">
<!--      <router-view v-slot="{ Component }">-->
<!--        <keep-alive :include="cacheKeys">-->
<!--          <component-->
<!--            :is="Component"-->
<!--            :key="$route.meta.cacheKey"-->
<!--          />-->
<!--        </keep-alive>-->
<!--      </router-view>-->
      <floor-detail :current-floor-index="props.currentFloorIndex"/>
    </div>


  </div>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue';
import FloorDetail from "@/views/FloorDetail.vue";
// import {useRoute, useRouter} from 'vue-router';

// const router = useRouter();
// const route = useRoute();
const cacheKeys = ref(['floor-one', 'floor-two', 'floor-three', 'floor-four', 'floor-five'])

// 获取当前楼层信息
const props = defineProps(['currentFloorIndex']);
const currentFloor = computed(()=>{
  const floorMap: { [key: string]: string } = {
    '1': '一楼',
    '2': '二楼',
    '3': '三楼',
    '4': '四楼',
    '5': '五楼'
  };
  return floorMap[props.currentFloorIndex] || '未知楼层';
})
// const currentFloor = computed(() => {
//   const floorMap: { [key: string]: string } = {
//     '/newworld/one': '一楼',
//     '/newworld/two': '二楼',
//     '/newworld/three': '三楼',
//     '/newworld/four': '四楼',
//     '/newworld/five': '五楼'
//   };
//   return floorMap[route.path] || '未知楼层';
// });

// 返回按钮处理
// const handleBack = () => {
//   router.push('/newworld');
// };
</script>

<style lang="less" scoped>

// 关键样式改进
.one-view-container {
  height: 100vh; // 全屏高度
  display: flex; // 弹性布局
  flex-direction: column; // 纵向排列

  .floor-content {
    flex: 1; // 内容区域自动填充
    overflow-y: auto; // 独立滚动
  }

  .fixed-action-bar {
    position: sticky;
    bottom: 0;
    background: var(--td-bg-color-container);
    padding: 16px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
    z-index: 100;

    .t-button {
      width: 100%;
    }
  }
}

.floor-title {
  color: var(--td-text-color-primary);
  margin-bottom: 16px;
}

.dynamic-content {
  min-height: calc(100vh - 160px);
}
</style>