<script setup lang="ts">
import TimeView from "@/components/TimeView.vue";
import ClassView from "@/components/ClassView.vue";
import { onMounted } from 'vue';
import { fetchAllClassroomData } from '../request';

onMounted(async () => {
  await fetchAllClassroomData();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <main class="flex-1 flex flex-col">
      <div class="p-4 bg-white mb-2 flex-shrink-0">
        <TimeView/>
      </div>
      <div class="p-4 bg-white flex-1 overflow-y-auto">
        <ClassView/>
      </div>
    </main>
  </div>
</template>