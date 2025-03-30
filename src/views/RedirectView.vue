<!-- RedirectView.vue -->
<template>
  <div class="redirect-container">
    <t-loading :loading="true" text="正在刷新..."/>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

onMounted(() => {
  const redirectPath = route.params.path as string || '/';
  router.replace({
    path: redirectPath,
    query: { ...route.query, _t: Date.now() }
  });
});
</script>