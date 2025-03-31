<script setup>
import {RouterLink} from "vue-router";
import {ref} from "vue";
// const myObject = [
//   "学习是开启梦想之门的钥匙，握紧它，勇敢地去追求你的理想。",
//   "在知识的花园里，辛勤耕耘，终将收获满园芬芳。",
//   "学习是自我投资的最佳方式，它的回报将伴随你一生。"
// ]

// const randomInt = Math.floor(Math.random() * 3);
const content = ref('');
const author = ref('');
// fetch("https://v1.hitokoto.cn/?c=d&c=i&c=k")
//     .then(response => response.json())
//     .then(data => {
//       console.log(data);
//       content.value = data.hitokoto;
//       author.value = data.from;
//     })
//     .catch(error => {
//       console.error('Error:', error);
//     });

async function hitokoto() {
  try {
    const response = await fetch('https://v1.hitokoto.cn?c=d&c=i&c=k');
    const data = await response.json();
    const hitokoto = document.querySelector('#hitokoto');
    hitokoto.innerText = data.from_who
        ? `${data.hitokoto}——${data.from_who}「${data.from}」`
        : `${data.hitokoto}——「${data.from}」`;
  } catch (error) {
    console.error(error);
  }
}
hitokoto();
</script>

<template>
  <div class="container">
    <!-- 图片区域 -->
    <div class="image-container">
      <img src="../assets/favicon.ico" alt="Logo" class="logo">
    </div>

    <!-- 文本输入区域 -->
    <div class="text-input">
    <span id="hitokoto"></span>
<!--      {{ myObject[randomInt] }}-->
    </div>

    <!-- 按钮区域 -->
    <nav>
      <RouterLink to="/classroom" >开始自习</RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  gap: 2rem;
}

/* 移动端布局调整 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    justify-content: space-between;
    padding: 1rem;
    gap: 0;
  }

  .image-container {
    flex: 0.25;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .text-input {
    flex: 0.25;
    width: 100%;
    max-width: none;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  nav {
    flex: 0.5;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 0;
  }

  nav a {
    padding: 1rem 2rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background-color: var(--color-primary);
    color: green;
    text-decoration: none;
    transition: background-color 0.3s ease;
  }

  nav a:hover {
    background-color: var(--color-primary-dark);
  }
}

/* 通用样式 */
.logo {
  max-width: 200px;
  height: auto;
}

/* 大屏样式保持不变 */
@media (min-width: 1024px) {
  .container {
    flex-direction: row;
    align-items: center;
    gap: 4rem;
    padding: 4rem;
  }

  .image-container {
    flex: 1;
  }

  .text-input {
    flex: 2;
    max-width: 600px;
  }

  nav {
    margin-top: 0;
    justify-content: flex-end;
  }
}
</style>
