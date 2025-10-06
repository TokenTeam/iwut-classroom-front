<script setup lang="ts">
import TimeView from "@/components/TimeView.vue";
import ClassView from "@/components/ClassView.vue";
import {onMounted, ref} from 'vue';
import {fetchAllClassroomData} from '../request';
import ChooseView from "@/components/ChooseView.vue";

onMounted(async () => {
  await fetchAllClassroomData();
});
let showPopup = ref(false);
</script>

<template>
  <div class="h-screen bg-[#f0f2f5]">
    <div class="py-[10px]">
    <TimeView @open="showPopup = true" class="mb-[10px] flex-shrink-0"/>
    <ClassView class="bg-white overflow-y-auto"/>
    </div>
    <t-popup v-model="showPopup" placement="bottom" destroy-on-close class="h-5/6" :z-index="1000">
      <ChooseView @close="showPopup = false" />
    </t-popup>
  </div>
</template>