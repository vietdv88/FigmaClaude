<template>
  <!-- Ô nhập 1 điều kiện lọc: toán tử (theo kiểu trường) + giá trị — DÙNG CHUNG cho bộ lọc Advance (TableFilterPanel) và lọc theo cột trên tiêu đề (DataTable)
       → 2 nơi cùng toán tử, cùng control: text = ô chữ · number = ô số (Trong khoảng: Từ / Đến) · date = ô ngày (Từ / Đến) · enum = combobox giá trị -->
  <div class="fce">
    <AppCombobox :model-value="modelValue.op" :options="OPERATORS[field.type]" required :clearable="false" aria-label="Điều kiện lọc"
      @update:model-value="op => $emit('update:modelValue', { ...modelValue, op, value: '', value2: '' })" />
    <template v-if="!NO_VALUE_OPS.includes(modelValue.op)">
      <AppCombobox v-if="field.type === 'enum'" :model-value="modelValue.value" :options="optionsOf(field)" placeholder="Chọn giá trị" @update:model-value="set('value', $event)" />
      <template v-else-if="field.type === 'date'">
        <AppDatebox :model-value="modelValue.value" :placeholder="range ? 'Từ ngày' : 'DD/MM/YYYY'" @update:model-value="set('value', $event)" />
        <AppDatebox v-if="range" :model-value="modelValue.value2" placeholder="Đến ngày" @update:model-value="set('value2', $event)" />
      </template>
      <template v-else-if="field.type === 'number'">
        <AppNumberbox :model-value="modelValue.value" :stepper="false" :placeholder="range ? 'Từ' : 'Nhập giá trị'" @update:model-value="set('value', $event)" @keydown.enter="$emit('enter')" />
        <AppNumberbox v-if="range" :model-value="modelValue.value2" :stepper="false" placeholder="Đến" @update:model-value="set('value2', $event)" @keydown.enter="$emit('enter')" />
      </template>
      <AppTextbox v-else :model-value="modelValue.value" placeholder="Nhập giá trị" @update:model-value="set('value', $event)" @keydown.enter="$emit('enter')" />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppCombobox  from './AppCombobox.vue'
import AppTextbox   from './AppTextbox.vue'
import AppNumberbox from './AppNumberbox.vue'
import AppDatebox   from './AppDatebox.vue'
import { OPERATORS, NO_VALUE_OPS, RANGE_OPS, optionsOf } from '../utils/advancedFilter.js'

const props = defineProps({
  /** Trường lọc: { key, label, type: 'text' | 'enum' | 'number' | 'date', options? } */
  field:      { type: Object, required: true },
  /** Điều kiện: { id, key, op, value, value2 } (v-model) */
  modelValue: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue', 'enter'])
const range = computed(() => RANGE_OPS.includes(props.modelValue.op))
const set = (k, v) => emit('update:modelValue', { ...props.modelValue, [k]: v })
</script>

<style scoped>
.fce { display: flex; flex-direction: column; gap: 8px; }
</style>
