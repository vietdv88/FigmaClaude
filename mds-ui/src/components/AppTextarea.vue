<template>
  <div class="ibox ibox--area" :class="boxClass">
    <textarea
      ref="el"
      class="ibox__native ibox__native--area"
      :style="{
        minHeight: minHeight + 'px',
        height: fixHeight && !autosize ? minHeight + 'px' : undefined,
        maxHeight: maxHeight ? maxHeight + 'px' : undefined,
        resize: autosize || fixHeight || readonly || disabled || state === 'readonly' || state === 'disabled' ? 'none' : (resize ? 'vertical' : 'none'),   // Fix Height / tự giãn / chỉ đọc / khóa: không có góc kéo giãn
        overflowY: autosize && !(maxHeight && overflowing) ? 'hidden' : undefined,
      }"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxlength || undefined"
      :disabled="disabled || state === 'disabled'"
      :readonly="readonly || state === 'readonly'"
      @input="onInput"
    />
    <!-- Lỗi: icon chấm than đỏ, hover → tooltip lỗi (nằm trong AppInput có lỗi) -->
    <span v-if="fe?.hasError.value" class="ibox__icon ibox__icon--error" @mouseenter="fe.show()" @mouseleave="fe.hide()"><TIcon name="alert-circle" /></span>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useFieldError } from '../utils/fieldError.js'
import TIcon from './TIcon.vue'

const props = defineProps({
  modelValue:  { type: String,  default: '' },
  placeholder: { type: String,  default: '' },
  state:       { type: String,  default: 'default' }, // default | error | success | warning | disabled | readonly
  outline:     { type: Boolean, default: true },
  /** Chiều cao tối thiểu của vùng gõ — mặc định 58 → cả ô cao 72px (Figma Textarea, Fix Height = False) */
  minHeight:   { type: Number,  default: 58 },
  /** Figma Fix Height = True: chiều cao cố định (minHeight), KHÔNG có góc kéo giãn — nội dung dài thì cuộn trong ô.
      Mặc định (False): có góc kéo ở dưới phải để người dùng kéo cao thêm. autosize: tự giãn theo nội dung (maxHeight 0 = giãn mãi, không cuộn) */
  fixHeight:   { type: Boolean, default: false },
  maxHeight:   { type: Number,  default: 0 },
  resize:      { type: Boolean, default: true },
  /** Tự giãn chiều cao theo nội dung (từ minHeight tới maxHeight; 0 = không giới hạn) */
  autosize:    { type: Boolean, default: false },
  maxlength:   { type: Number,  default: 0 },
  disabled:    { type: Boolean, default: false },
  readonly:    { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const el = ref(null)
const overflowing = ref(false)

function fit() {
  const t = el.value
  if (t && !props.autosize) { t.style.height = ''; return }   // không tự giãn: bỏ chiều cao do tự giãn đặt trước đó
  if (!t) return
  t.style.height = 'auto'
  const h = Math.max(t.scrollHeight + (t.offsetHeight - t.clientHeight), props.minHeight)
  overflowing.value = !!props.maxHeight && h > props.maxHeight
  t.style.height = (props.maxHeight ? Math.min(h, props.maxHeight) : h) + 'px'
}
function onInput(e) {
  emit('update:modelValue', e.target.value)
  fit()
}

watch(() => [props.modelValue, props.fixHeight, props.autosize], () => nextTick(fit))
// Đo lại khi ô đổi bề rộng (mở drawer, đổi cột lưới…) vì số dòng thay đổi theo bề rộng
let ro = null
onMounted(() => {
  nextTick(fit)
  if (props.autosize && window.ResizeObserver) { ro = new ResizeObserver(() => fit()); ro.observe(el.value) }
})
onBeforeUnmount(() => ro?.disconnect())

const fe = useFieldError()
const boxClass = computed(() => ({
  'ibox--no-border': !props.outline,
  'ibox--error':     props.state === 'error' || !!fe?.hasError.value,
  'ibox--success':   props.state === 'success',
  'ibox--warning':   props.state === 'warning',
  'ibox--disabled':  props.state === 'disabled' || props.disabled,
  'ibox--readonly':  props.state === 'readonly'  || props.readonly,
}))
</script>
