<!-- TwoNewView.vue 二级子路由组件 -->
<template>
  <div class="two-new-container">
    <t-side-bar
      :value="activeIndex"
      @change="handleRouteChange"
      class="fixed-sidebar"
    >
      <t-side-bar-item
        v-for="(item, index) in navItems"
        :key="index"
        :value="index"
        :label="item.label"
        :badge-props="getBadgeStatus(item.path)"
      />
    </t-side-bar>

    <router-view v-slot="{ Component }">
      <keep-alive :include="cachedViews">
        <component :is="Component" :key="$route.fullPath"/>
      </keep-alive>
    </router-view>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref  } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchAllData } from '@/request'
import { useSelectionStore } from '@/stores/selectionStore'


const router = useRouter();
const route = useRoute();
const store = useSelectionStore();

// 导航项配置
const navItems = ref([
  { path: '/newworld/one', label: '一楼', refreshCount: 0 },
  { path: '/newworld/two', label: '二楼', refreshCount: 0 },
  { path: '/newworld/three', label: '三楼', refreshCount: 0 },
  { path: '/newworld/four', label: '四楼', refreshCount: 0 },
  { path: '/newworld/five', label: '五楼', refreshCount: 0 },
]);

// 状态管理
const errorMessage = ref('');

// 获取当前激活索引
const activeIndex = computed(() => {
  return navItems.value.findIndex(item => {
    const basePath = item.path.split('/').slice(0, 3).join('/');
    return route.path.indexOf(basePath) === 0; // 使用 indexOf 替代 startsWith
  });
});
// 修改后的 handleRouteChange 方法
const handleRouteChange = (index: number) => { // 移除 async
  // 原有的事件派发逻辑
  window.dispatchEvent(new CustomEvent('side-bar-item-click', {
    detail: {
      index: index,
      path: navItems.value[index].path
    }
  }));

  // 路由跳转逻辑
  const targetPath = navItems.value[index].path;
  if (route.path !== targetPath) {
    router.push(targetPath);
  }

  // 使用 fetchAllData 获取数据
  fetchAllData()
    .then(data => {
      console.log('完整建筑教室数据:', data);
      // 将数据存储到 Pinia Store
      store.setAvailableBuildings(Object.keys(data)); // 存储建筑列表
      store.setClassroomData(data); // 存储完整数据
    })
    .catch(error => {
      console.error('数据请求失败:', error.message);
      errorMessage.value = '数据加载失败，请稍后重试';
    });
};

// 徽章状态显示刷新次数
const getBadgeStatus = (path: string) => {
  const item = navItems.value.find(i => i.path === path);
  return item && item.refreshCount > 0
    ? { count: item.refreshCount, color: 'var(--td-brand-color)' }
    : null;
};

// 缓存视图列表
const cachedViews = ref<string[]>([]);

// 提供刷新方法给子组件
const refreshCurrent = () => {
  const currentItem = navItems.value[activeIndex.value];
  if (currentItem) {
    currentItem.refreshCount += 1;

    // 强制刷新当前路由
    cachedViews.value = cachedViews.value.filter(v => v !== route.name);
    router.replace({
      path: '/redirect' + route.fullPath,
      query: { _t: Date.now() }
    });
  }
};
// 暴露方法给子组件
defineExpose({ refreshCurrent });
</script>
<style scoped>
/* 新增样式 */
.two-new-container {
  position: relative;
  width: 100%;
  overflow-x: hidden; /* 隐藏横向滚动条 */

}

.fixed-sidebar {
  display: flex;
  width: 95%;
  margin: 0 2.5%; /* 左右各留2.5%空隙 */
  transform: translateZ(0); /* 触发硬件加速 */
}

/* 深度选择器覆盖组件库默认样式 */
:deep(.t-side-bar) {
  display: flex !important;
  flex-direction: row !important;
  width: 100%;
  gap: 0 !important; /* 消除项间距 */
}

:deep(.t-side-bar-item) {
  /* 基础居中设置 */
  display: flex !important;
  justify-content: center;
  align-items: center;

  /* 确保内容区域占满 */
  width: 100%;

  /* 重置可能影响布局的样式 */
  padding: 0 !important;
  margin: 0 !important;
}

/* 隐藏滚动条（根据浏览器兼容性选择） */
:deep(::-webkit-scrollbar) {
  display: none;
}

:deep(.t-side-bar) {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
/* 针对文本容器的深度选择器 */
:deep(.t-side-bar-item__text) {
  display: block;
  width: 100%;
  text-align: center;

  /* 处理长文本 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 如果存在图标容器 */
:deep(.t-side-bar-item__icon) {
  display: none !important; /* 如果不需要图标 */
  /* 或 */
  margin-right: 0 !important; /* 如果需要保留图标 */
}
</style>
