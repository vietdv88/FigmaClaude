<template>
  <div class="ibox" :class="boxClass">
    <!-- decimal: ô chữ inputmode="decimal" — gõ được cả dấu phẩy (5,75) lẫn dấu chấm (5.75), giữ nguyên số lẻ (không bị ép theo step) -->
    <input v-if="decimal"
      class="ibox__native"
      :class="{ 'ibox__native--right': align === 'right' }"
      type="text" inputmode="decimal" autocomplete="off"
      :value="text"
      :placeholder="placeholder"
      :disabled="disabled || state === 'disabled'"
      :readonly="readonly || state === 'readonly'"
      @input="onDecInput"
      @blur="onDecBlur"
      @keydown.enter="onDecBlur"
    />
    <!-- Số thường: không gõ → hiện theo quy chuẩn số (TT200: 50.000.000 qua fmtNum) · đang gõ → số thô dễ sửa · ↑ ↓ tăng / giảm theo step
         (không dùng type="number": trình duyệt không hiện được dấu phân cách hàng nghìn) -->
    <input v-else
      class="ibox__native"
      :class="{ 'ibox__native--right': align === 'right' }"
      type="text" :inputmode="Number.isInteger(step) && (min == null || min >= 0) ? 'numeric' : 'decimal'" autocomplete="off"
      :value="focused ? rawText : fmtNum(modelValue)"
      :placeholder="placeholder"
      :disabled="disabled || state === 'disabled'"
      :readonly="readonly || state === 'readonly'"
      @focus="onFocus"
      @input="onNumInput"
      @blur="onNumBlur"
      @keydown.enter="onNumBlur"
      @keydown.up.prevent="!isLocked && increment()"
      @keydown.down.prevent="!isLocked && decrement()"
    />
    <!-- Lỗi: icon chấm than đỏ, hover → tooltip lỗi (nằm trong AppInput có lỗi) -->
    <span v-if="fe?.hasError.value" class="ibox__icon ibox__icon--error" @mouseenter="fe.show()" @mouseleave="fe.hide()"><TIcon name="alert-circle" /></span>
    <div v-if="stepper && !readonly && state !== 'readonly'" class="ibox__stepper">
      <button
        class="ibox__stepper-btn"
        type="button"
        tabindex="-1"
        :disabled="disabled || state === 'disabled' || (min != null && Number(modelValue) <= min)"
        @click="decrement"
      >
        <TIcon name="minus" />
      </button>
      <button
        class="ibox__stepper-btn"
        type="button"
        tabindex="-1"
        :disabled="disabled || state === 'disabled' || (max != null && Number(modelValue) >= max)"
        @click="increment"
      >
        <TIcon name="plus" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import TIcon from './TIcon.vue'
import { useFieldError } from '../utils/fieldError.js'
import { fmtNum, parseNum } from '../utils/number.js'

const props = defineProps({
  modelValue:  { type: [Number, String], default: '' },
  placeholder: { type: String,  default: '' },
  /** Ô nhập số trong form LUÔN căn trái (kể cả số tiền) · chỉ ô số trên bảng (DataTable numberbox) mới căn phải để dễ cộng số giữa các dòng */
  align:       { type: String,  default: 'left' },   // left | right
  min:         { type: Number,  default: null },
  max:         { type: Number,  default: null },
  step:        { type: Number,  default: 1 },
  state:       { type: String,  default: 'default' },
  outline:     { type: Boolean, default: true },
  /** Viền ẩn, chỉ hiện khi rê / focus — dùng cho ô sửa trực tiếp trên bảng (DataTable editable), giống AppCombobox ghost */
  ghost:       { type: Boolean, default: false },
  size:        { type: String,  default: 'md' },
  stepper:     { type: Boolean, default: true },
  disabled:    { type: Boolean, default: false },
  readonly:    { type: Boolean, default: false },
  /** Cho nhập số thập phân tự do (Point, điểm…): nhận “,” hoặc “.” làm dấu thập phân, không ép theo step */
  decimal:     { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'change'])

/* ── Chế độ thập phân: giữ chữ đang gõ (VD “5,” chưa xong) — chỉ phát số khi hợp lệ ── */
const show = v => (v === '' || v == null || !Number.isFinite(Number(v)) ? '' : String(v).replace('.', ','))
const text = ref(show(props.modelValue))
watch(() => props.modelValue, v => { if (parse(text.value) !== (v === '' || v == null ? '' : Number(v))) text.value = show(v) })
function parse(s) {
  const t = String(s ?? '').trim().replace(/\s/g, '').replace(',', '.')
  if (t === '') return ''
  if (!/^-?\d*\.?\d*$/.test(t) || t === '.' || t === '-') return null   // chưa gõ xong / sai
  let n = Number(t)
  if (props.min != null) n = Math.max(props.min, n)
  if (props.max != null) n = Math.min(props.max, n)
  return n
}
function onDecInput(e) {
  const raw = e.target.value.replace(/[^\d.,-]/g, '')   // chỉ nhận số, dấu phẩy / chấm, dấu trừ
  if (raw !== e.target.value) e.target.value = raw
  text.value = raw
  const n = parse(raw)
  if (n !== null) emit('update:modelValue', n)
}
function onDecBlur() {
  const n = parse(text.value)
  const v = n === null ? (props.modelValue ?? '') : n
  text.value = show(v)
  emit('update:modelValue', v); emit('change', v)
}

/* ── Số thường: hiện định dạng khi không gõ, số thô khi đang gõ ── */
const focused = ref(false), rawText = ref(''), startVal = ref('')
const isLocked = computed(() => props.disabled || props.readonly || props.state === 'disabled' || props.state === 'readonly')
const clamp = n => (props.min != null && n < props.min ? props.min : props.max != null && n > props.max ? props.max : n)
function onFocus() { focused.value = true; startVal.value = props.modelValue; rawText.value = show(props.modelValue) }
function onNumInput(e) {
  const raw = e.target.value.replace(/[^\d.,-]/g, '')
  if (raw !== e.target.value) e.target.value = raw
  rawText.value = raw
  if (raw.trim() === '') return emit('update:modelValue', '')
  const n = parseNum(raw)                                  // nhận cả số dán vào dạng 50.000.000 / 1,5
  if (Number.isFinite(n)) emit('update:modelValue', n)
}
function onNumBlur() {
  if (!focused.value) return
  const v = props.modelValue === '' || props.modelValue == null ? '' : clamp(Number(props.modelValue))
  if (v !== props.modelValue) emit('update:modelValue', v)
  focused.value = false
  if (v !== startVal.value) emit('change', v)
}
watch(() => props.modelValue, v => { if (focused.value && parseNum(rawText.value) !== v && !(rawText.value.trim() === '' && v === '')) rawText.value = show(v) })   // tăng / giảm bằng ↑ ↓ / nút

function decrement() {
  const cur = props.modelValue === '' ? 0 : Number(props.modelValue)
  const next = cur - props.step
  const val = props.min != null ? Math.max(next, props.min) : next
  emit('update:modelValue', val)
  emit('change', val)
}

function increment() {
  const cur = props.modelValue === '' ? 0 : Number(props.modelValue)
  const next = cur + props.step
  const val = props.max != null ? Math.min(next, props.max) : next
  emit('update:modelValue', val)
  emit('change', val)
}

const fe = useFieldError()
const boxClass = computed(() => ({
  'ibox--ghost':     props.ghost,
  'ibox--no-border': !props.ghost && !props.outline,
  'ibox--error':     props.state === 'error' || !!fe?.hasError.value,
  'ibox--success':   props.state === 'success',
  'ibox--warning':   props.state === 'warning',
  'ibox--disabled':  props.state === 'disabled' || props.disabled,
  'ibox--readonly':  props.state === 'readonly'  || props.readonly,
  'ibox--sm':        props.size === 'sm',
}))
</script>
