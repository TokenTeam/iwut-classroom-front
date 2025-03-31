<script setup>
import {useRouter} from 'vue-router';
import TopBar from "@/views/TopBar.vue";
import TwoNewView from "@/views/TwoNewView.vue";

const router = useRouter();
// const handleClick = () => {
//   router.push('/');
// }
</script>
<!-- 主布局组件 -->
<!-- ClassRoom.vue -->
<template>
  <div class="container">
    <!-- 固定头部 -->
    <TopBar />

    <!-- 主要内容容器 -->
    <main class="main-container">
      <!-- 二级路由出口（渲染TwoNewView） -->
      <TwoNewView/>
    </main>
  </div>
</template>
<style scoped>
.container {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.main-container {
  margin-top: 20px;
  height: calc(100vh - 60px);
}

</style>
