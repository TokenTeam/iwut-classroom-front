<script setup lang="ts">
import TimeView from "@/components/TimeView.vue";
import ClassView from "@/components/ClassView.vue";
import {onMounted} from 'vue';
import {fetchAllClassroomData} from '../request';

onMounted(async () => {
  await fetchAllClassroomData();
});
</script>

<template>
  <div class="min-h-screen bg-[#f0f2f5]">
    <TimeView class="mt-[10px] mb-[10px] flex-shrink-0"/>
    <ClassView class="bg-white overflow-y-auto"/>
  </div>
</template>