<template>
  <div class="Front-View">
    <t-dropdown-menu style="width: 100%;">
      <!-- 校区选择 -->
      <t-dropdown-item
        :options="schoolOptions"
        v-model="selectedSchool"
        @update:model-value="handleSelectionChange"
      />

      <!-- 时间选择 -->
      <t-dropdown-item
        :options="productOptions"
        v-model="selectedProduct"
        @update:model-value="handleSelectionChange"
      />

      <!-- 节数筛选 -->
      <t-dropdown-item
        :options="sorterOptions"
        v-model="selectedSorter"
        @update:model-value="handleSelectionChange"
      />
    </t-dropdown-menu>
  </div>
</template>

<script lang="ts" setup>
import {reactive, ref} from "vue";

// 响应式选择值
const selectedSchool = ref('0101');
const selectedProduct = ref('day');
const selectedSorter = ref('default');

// 选项配置（可保持静态）
const schoolOptions = [
  { value: '0101', label: '东院' },
  { value: '0102', label: '西院' },
  { value: '0201', label: '鉴湖' },
  { value: '0202', label: '南湖' },
  { value: '0301', label: '余区' }
];

const productOptions = [
  { value: 'day', label: '开始节数' },
  { value: '1', label: '1小节' },
  { value: '2', label: '2小节' },
  { value: '3', label: '3小节' },
  { value: '4', label: '4小节' },
  { value: '5', label: '5小节' },
  { value: '6', label: '6小节' },
  { value: '7', label: '7小节' },
  { value: '8', label: '8小节' },
  { value: '9', label: '9小节' },
  { value: '10', label: '10小节' },
  { value: '11', label: '11小节' },
  { value: '12', label: '12小节' },
];

const sorterOptions = [
  { value: 'default', label: '结束节数' },
  { value: '2', label: '2小节' },
  { value: '3', label: '3小节' },
  { value: '4', label: '4小节' },
  { value: '5', label: '5小节' },
  { value: '6', label: '6小节' },
  { value: '7', label: '7小节' },
  { value: '8', label: '8小节' },
  { value: '9', label: '9小节' },
  { value: '10', label: '10小节' },
  { value: '11', label: '11小节' },
  { value: '12', label: '12小节' },
  { value: '13', label: '13小节' },
];
// 在 Vue 组件中
import { useSelectionStore } from '@/stores/selectionStore'

const store = useSelectionStore()

const handleSelectionChange = () => {
  store.updateSelections({
    campus: selectedSchool.value,
    time: selectedProduct.value,
    section: selectedSorter.value
  })
}
</script>
