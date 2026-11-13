<template>
  <label class="app-rb" :class="{ 'app-rb--checked': checked, 'app-rb--disabled': disabled, 'app-rb--error': error }">
    <span class="app-rb__wrap">
      <!-- Radio thật (ẩn) → Tab / phím mũi tên trong nhóm cùng `name` như radio gốc của trình duyệt -->
      <input type="radio" class="app-rb__native" :name="name || undefined" :value="value" :checked="checked" :disabled="disabled"
        :aria-invalid="error || undefined" @change="!disabled && $emit('update:modelValue', value)" />
      <span class="app-rb__dot" />
    </span>
    <span v-if="label || $slots.default" class="app-rb__label"><slot>{{ label }}</slot></span>
  </label>
</template>

<script setup>
import { computed } from 'vue'

/* Radio button (Figma MDS Radio Button) — chọn DUY NHẤT 1 trong nhóm. Nhóm: bọc trong .radio-group (ngang) / .radio-group--vertical (dọc).
   <AppRadio v-model="kind" value="ca-nhan" name="kind" label="Cá nhân" /> */
const props = defineProps({
  modelValue: { default: undefined },
  value:      { default: undefined },
  label:      { type: String,  default: '' },
  name:       { type: String,  default: '' },
  disabled:   { type: Boolean, default: false },
  error:      { type: Boolean, default: false },   // trạng thái lỗi: viền đỏ (thông báo lỗi đặt ở AppInput / dưới nhóm)
})
defineEmits(['update:modelValue'])
const checked = computed(() => props.modelValue === props.value)
</script>

<style scoped>
/* Kích thước theo Figma: vòng 16 (Rộng 20) · chấm chọn 8 (Rộng 10) · cách chữ 8 */
.app-rb { --rb-size: 16px; --rb-dot: 8px; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; -webkit-user-select: none; }
:global([data-density="comfortable"]) .app-rb { --rb-size: 20px; --rb-dot: 10px; }
.app-rb--disabled { cursor: not-allowed; }

/* Vòng hover 20 (Rộng 24) quanh nút — như AppCheckbox */
.app-rb__wrap {
  position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: calc(var(--rb-size) + 4px); height: calc(var(--rb-size) + 4px); border-radius: 50%; transition: background 0.12s;
}
.app-rb:not(.app-rb--disabled):hover  .app-rb__wrap { background: var(--bg-brand-light); }
.app-rb:not(.app-rb--disabled):active .app-rb__wrap { background: var(--bg-brand-light-hover); }
.app-rb__native { position: absolute; opacity: 0; width: 0; height: 0; margin: 0; pointer-events: none; }

.app-rb__dot {
  display: flex; align-items: center; justify-content: center; box-sizing: border-box;
  width: var(--rb-size); height: var(--rb-size); border-radius: 50%;
  border: 1.5px solid var(--stroke-neutral); background: var(--bg-white); transition: border-color 0.1s;
}
.app-rb__dot::after { content: ''; width: var(--rb-dot); height: var(--rb-dot); border-radius: 50%; background: var(--bg-brand); transform: scale(0); transition: transform 0.12s; }
.app-rb:not(.app-rb--disabled):hover .app-rb__dot { border-color: var(--stroke-brand); }
.app-rb--checked .app-rb__dot { border-color: var(--bg-brand); }
.app-rb--checked .app-rb__dot::after { transform: scale(1); }
.app-rb__native:focus-visible + .app-rb__dot { outline: 2px solid var(--stroke-brand); outline-offset: 2px; }

.app-rb--error .app-rb__dot, .app-rb--error:not(.app-rb--disabled):hover .app-rb__dot { border-color: var(--stroke-danger); }
.app-rb--disabled .app-rb__dot { background: var(--bg-neutral-light); border-color: var(--stroke-neutral); }
.app-rb--disabled.app-rb--checked .app-rb__dot::after { background: var(--text-disabled); }

.app-rb__label { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.app-rb--disabled .app-rb__label { color: var(--text-disabled); }
</style>
