<template>
  <!-- Loại việc — 1 dòng: nhãn + 3 nút chọn (gọn, không chiếm nhiều chiều cao) -->
  <div class="stage-picker" role="radiogroup" aria-label="Loại việc">
    <span class="stage-picker__k">Loại việc</span>
    <div class="stage-picker__opts">
      <button v-for="x in STAGES" :key="x.value" type="button" class="stage-picker__opt" :class="{ 'stage-picker__opt--on': modelValue === x.value }"
        role="radio" :aria-checked="modelValue === x.value" :disabled="readonly && modelValue !== x.value" v-tip="x.hint"
        @click="!readonly && modelValue !== x.value && emit('update:modelValue', x.value)">{{ x.label }}</button>
    </div>
  </div>
</template>

<script setup>
import { STAGES } from '../store/scoring.js'
import { vTip } from '@mds/utils/tooltip.js'

defineProps({
  modelValue: { type: String, default: 'design' },
  readonly:   { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
.stage-picker { display: flex; align-items: center; gap: 12px; min-width: 0; }
.stage-picker__k { flex-shrink: 0; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.stage-picker__opts { display: inline-flex; flex: 1; min-width: 0; padding: 2px; gap: 2px; border-radius: var(--radius-default); background: var(--bg-neutral-light); }
.stage-picker__opt { font-weight: var(--fw-semibold);
  flex: 1 1 auto; min-width: 0; height: calc(var(--btn-height) - 4px); padding: 0 8px; border: none; border-radius: calc(var(--radius-default) - 2px);
  background: transparent; font-family: inherit; font-size: var(--text-body); color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;
}
.stage-picker__opt:hover:not(:disabled):not(.stage-picker__opt--on) { color: var(--text-primary); background: var(--bg-brand-light); }
.stage-picker__opt--on { background: var(--bg-white); color: var(--text-brand); box-shadow: var(--shadow-sm); cursor: default; }
.stage-picker__opt:disabled { cursor: not-allowed; opacity: 0.55; }
</style>
