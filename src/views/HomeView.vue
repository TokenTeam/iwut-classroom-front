<script setup lang="ts">
import TimeView from "@/components/TimeView.vue";
import ClassView from "@/components/ClassView.vue";
import {ref} from 'vue';
import ChooseView from "@/components/ChooseView.vue";

let showPopup = ref(false);
let classView = ref<{ initializeExpandedState: () => void } | null>(null);

function resetTimeView() {
  classView.value?.initializeExpandedState();
}
</script>

<template>
  <div class="h-screen bg-[#f0f2f5]">
    <div class="py-[10px]">
      <TimeView @open="showPopup = true" class="mb-[10px] flex-shrink-0"/>
      <ClassView ref="classView" class="bg-white overflow-y-auto"/>
    </div>
    <t-popup v-model="showPopup" placement="bottom" destroy-on-close class="h-5/6" :z-index="1000"
             @close="resetTimeView">
      <ChooseView @close="()=>{showPopup = false; resetTimeView();}"/>
    </t-popup>
  </div>
</template>