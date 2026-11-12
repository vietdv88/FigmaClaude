<template>
  <label
    class="app-cb"
    :class="{
      'app-cb--checked':       isChecked,
      'app-cb--indeterminate': showIndeterminate,
      'app-cb--disabled':      disabled,
      'app-cb--error':         hasError,
    }"
  >
    <span class="app-cb__wrap">
      <input
        type="checkbox"
        class="app-cb__native"
        :checked="isChecked"
        :disabled="disabled"
        @change="onChange"
      />
      <span class="app-cb__box">
        <!-- Checkmark -->
        <svg v-if="isChecked && !showIndeterminate" class="app-cb__icon" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 3.5L3.8 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <!-- Indeterminate dash -->
        <svg v-else-if="showIndeterminate" class="app-cb__icon" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0.5 1H9.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
    </span>
    <span v-if="label || $slots.default" class="app-cb__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
import { computed } from 'vue'
import { useFieldError } from '../utils/fieldError.js'

const props = defineProps({
  modelValue:    { default: false },      // Boolean | null | Array
  value:         { default: undefined },  // used when modelValue is Array
  label:         { type: String,  default: '' },
  disabled:      { type: Boolean, default: false },
  indeterminate: { type: Boolean, default: false },
  /** Trạng thái lỗi trực tiếp — dùng khi không wrap trong AppInput; ưu tiên field error context từ AppInput */
  error:         { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
// Lấy error context từ AppInput cha (nếu có) — giống cách AppTextbox / AppCombobox làm
const fe = useFieldError()

const showIndeterminate = computed(() =>
  props.indeterminate || props.modelValue === null
)

const isChecked = computed(() => {
  if (showIndeterminate.value) return false
  if (Array.isArray(props.modelValue)) return props.modelValue.includes(props.value)
  return !!props.modelValue
})

/** Có lỗi khi: context AppInput báo lỗi HOẶC prop error=true, và chưa được chọn */
const hasError = computed(() =>
  (fe ? fe.hasError.value : props.error) && !isChecked.value && !showIndeterminate.value
)

function onChange(e) {
  if (props.disabled) return
  if (Array.isArray(props.modelValue)) {
    const arr = [...props.modelValue]
    if (e.target.checked) {
      if (!arr.includes(props.value)) arr.push(props.value)
    } else {
      const idx = arr.indexOf(props.value)
      if (idx >= 0) arr.splice(idx, 1)
    }
    emit('update:modelValue', arr)
  } else {
    emit('update:modelValue', e.target.checked)
  }
}
</script>

<style scoped>
.app-cb {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

.app-cb--disabled { cursor: not-allowed; }   /* giữ con trỏ cấm + tooltip (ô nhập native đã disabled nên không đổi được giá trị) */

/* 20×20 hover-ring container */
.app-cb__wrap {
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.12s;
}

.app-cb:not(.app-cb--disabled):hover  .app-cb__wrap { background: var(--bg-brand-light); }
.app-cb:not(.app-cb--disabled):active .app-cb__wrap { background: var(--bg-brand-light-hover); }

/* Native input — visually hidden, stays focusable */
.app-cb__native {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  margin: 0;
}

/* Visible box: 16×16 */
.app-cb__box {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-sm);   /* Figma: Radius/Small 4 */
  border: 1.5px solid var(--stroke-neutral);
  background: var(--bg-white);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
  transition: background 0.1s, border-color 0.1s;
}

/* Hover: border → brand */
.app-cb:not(.app-cb--disabled):hover .app-cb__box { border-color: var(--stroke-brand); }

/* Error: viền đỏ khi chưa chọn + trường bắt buộc */
.app-cb--error .app-cb__box { border-color: var(--stroke-danger); }

/* Checked & indeterminate: fill brand */
.app-cb--checked .app-cb__box,
.app-cb--indeterminate .app-cb__box {
  background: var(--bg-brand);
  border-color: var(--bg-brand);
}

/* Focus ring via hidden native input */
.app-cb__native:focus-visible + .app-cb__box {
  outline: 2px solid var(--stroke-brand);
  outline-offset: 2px;
}

/* Disabled (Figma Checkbox 6019:33623):
   · Unchecked  = nền BG/Neutral Light + viền Stroke/Neutral
   · Checked / Indeterminate = nền BG/Brand/Brand Disable (tick / gạch trắng) — ⛔ không dùng nền xám cho ô đã tick (tick trắng sẽ biến mất)
   · Chữ nhãn GIỮ màu Text/Primary Neutral (Figma không đổi màu chữ khi disabled) */
.app-cb--disabled .app-cb__box {
  background: var(--bg-neutral-light);
  border-color: var(--stroke-neutral);
}
.app-cb--disabled.app-cb--checked .app-cb__box,
.app-cb--disabled.app-cb--indeterminate .app-cb__box {
  background: var(--bg-brand-disable);
  border-color: var(--bg-brand-disable);
}

.app-cb__icon {
  display: block;
  width: 10px;
  flex-shrink: 0;
}

.app-cb__label {
  font-size: var(--text-body);   /* Figma Body Regular 13 / dòng 20 */
  line-height: var(--text-body-lh);
  color: var(--text-primary);
}

</style>
