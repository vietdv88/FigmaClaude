<template>
  <!-- type="time" | "datetime-local": gõ trực tiếp (HH:MM · DD/MM/YYYY HH:MM) hoặc bấm xổ Time Picker / Date Time Picker (Figma) — dùng AppDatePicker, không cột giây -->
  <AppDatePicker v-if="type !== 'date'" v-bind="$attrs" :model-value="modelValue" :type="type === 'time' ? 'time' : 'datetime'" :seconds="false"
    :placeholder="placeholder || placeholderByType" :disabled="isDisabled" :readonly="isReadonly" :clearable="clearable && !required && !fieldRequired()"
    :class="boxClass" @update:model-value="emitValue" />

  <!-- type="date": ô nhập dd/mm/yyyy + popover lịch -->
  <div v-else ref="boxEl" class="ibox" :class="[boxClass, { 'ibox--open': open }]" style="width: calc(9ch + 72px); max-width: 100%" v-bind="$attrs" @mousedown="onBoxMousedown">
    <input
      ref="inputEl"
      class="ibox__native"
      type="text"
      inputmode="numeric"
      :value="text"
      :placeholder="placeholder || 'DD/MM/YYYY'"
      :disabled="isDisabled"
      :readonly="isReadonly"
      @focus="openPicker"
      @input="text = onMaskedInput($event, 'date')"
      @keydown.enter.prevent="commitText(); close()"
      @keydown.esc="e => { if (open) { e.stopPropagation(); close() } }"
      @keydown.tab="commitText(); close()"
      @blur="commitText"
    />
    <!-- Lỗi: icon chấm than đỏ, hover → tooltip lỗi (nằm trong AppInput có lỗi) -->
    <span v-if="fe?.hasError.value" class="ibox__icon ibox__icon--error" @mouseenter="fe.show()" @mouseleave="fe.hide()"><TIcon name="alert-circle" /></span>
    <TIcon v-if="!isReadonly || isDisabled" name="calendar" class="ibox__icon" />
  </div>

  <Teleport to="body">
    <div v-if="open" ref="popEl" class="date-pop" :style="popStyle" @mousedown.prevent>
      <!-- Header: điều hướng tháng / năm -->
      <div class="date-pop__head">
        <button class="btn-icon btn-icon--sm" type="button" v-tip="view === 'day' ? 'Tháng trước' : 'Năm trước'" :aria-label="view === 'day' ? 'Tháng trước' : 'Năm trước'" @click="step(-1)">
          <TIcon name="chevron-left" />
        </button>
        <button class="date-pop__title" type="button" v-tip="view === 'day' ? 'Chọn tháng, năm' : 'Quay lại chọn ngày'" :aria-label="view === 'day' ? 'Chọn tháng, năm' : 'Quay lại chọn ngày'" @click="view = view === 'day' ? 'month' : 'day'">
          {{ view === 'day' ? `Tháng ${viewMonth + 1}, ${viewYear}` : `Năm ${viewYear}` }}
          <TIcon :name="view === 'day' ? 'chevron-down' : 'chevron-up'" />
        </button>
        <button class="btn-icon btn-icon--sm" type="button" v-tip="view === 'day' ? 'Tháng sau' : 'Năm sau'" :aria-label="view === 'day' ? 'Tháng sau' : 'Năm sau'" @click="step(1)">
          <TIcon name="chevron-right" />
        </button>
      </div>

      <!-- Lưới ngày -->
      <template v-if="view === 'day'">
        <div class="date-pop__weekdays">
          <span v-for="w in WEEKDAYS" :key="w">{{ w }}</span>
        </div>
        <div class="date-pop__grid">
          <button
            v-for="d in days" :key="d.iso" type="button"
            class="date-pop__day"
            :class="{
              'date-pop__day--muted': !d.inMonth,
              'date-pop__day--today': d.iso === todayIso,
              'date-pop__day--selected': d.iso === modelValue,
            }"
            @click="pick(d.iso)"
          >{{ d.day }}</button>
        </div>
      </template>

      <!-- Lưới tháng -->
      <div v-else class="date-pop__months">
        <button
          v-for="m in 12" :key="m" type="button"
          class="date-pop__month"
          :class="{ 'date-pop__month--selected': selYear === viewYear && selMonth === m - 1, 'date-pop__month--today': todayY === viewYear && todayM === m - 1 }"
          @click="viewMonth = m - 1; view = 'day'"
        >Th{{ m }}</button>
      </div>

      <!-- Footer: Hôm nay (khi đang xem tháng khác) + Xóa -->
      <div v-if="showToday || modelValue" class="date-pop__foot">
        <button v-if="modelValue && clearable && !required && !fieldRequired()" class="date-pop__link date-pop__link--muted" type="button" @click="pick('')">Xóa</button>
        <button v-if="showToday" class="date-pop__link" type="button" @click="goToday">Hôm nay</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { vTip } from '../utils/tooltip.js'
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import TIcon from './TIcon.vue'
import AppDatePicker from './AppDatePicker.vue'
import { useFieldError, useFieldRequired } from '../utils/fieldError.js'
import { parseDateText, onMaskedInput } from '../utils/dateInput.js'

// Có 2 node gốc (ô nhập + Teleport popover) → tự gắn class/style từ ngoài vào ô nhập
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue:  { type: String,  default: '' },       // ISO: YYYY-MM-DD (date) | HH:MM | YYYY-MM-DDTHH:MM
  type:        { type: String,  default: 'date' },   // date | datetime-local | time
  placeholder: { type: String,  default: '' },
  state:       { type: String,  default: 'default' },
  outline:     { type: Boolean, default: true },
  size:        { type: String,  default: 'md' },
  disabled:    { type: Boolean, default: false },
  readonly:    { type: Boolean, default: false },
  clearable:   { type: Boolean, default: true },     // hiện "Xóa" trong popover khi đã có giá trị — trường bắt buộc thì ẩn
  required:    { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'change'])
const fieldRequired = useFieldRequired()   // nằm trong <AppInput required> → ẩn “Xóa”

const isDisabled = computed(() => props.disabled || props.state === 'disabled')
const isReadonly = computed(() => props.readonly || props.state === 'readonly')
const placeholderByType = computed(() => (props.type === 'time' ? 'HH:MM' : 'DD/MM/YYYY HH:MM'))

function emitValue(v) {
  emit('update:modelValue', v)
  emit('change', v)
}

/* ── Chuyển đổi ISO ↔ dd/mm/yyyy ── */
const pad = n => String(n).padStart(2, '0')
const toIso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`
const fmt = iso => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '')
/* Gõ nhanh: 20/10/2026 · 20102026 · 201026 · 20/10 (năm nay) — utils/dateInput.js */
const parse = s => parseDateText(s)

const text = ref(fmt(props.modelValue))
watch(() => props.modelValue, v => { text.value = fmt(v) })

/** Gõ tay: hợp lệ → lưu; trống → xóa; sai → trả lại giá trị cũ */
let picking = false
function commitText() {
  if (picking || props.type !== 'date' || isReadonly.value || isDisabled.value) return
  const t = text.value.trim()
  if (!t) { if (props.modelValue) emitValue(''); return }
  const iso = parse(t)
  if (iso && iso !== props.modelValue) emitValue(iso)
  else text.value = fmt(props.modelValue)
}

/* ── Lịch ── */
const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const now = new Date()
const todayY = now.getFullYear(), todayM = now.getMonth()
const todayIso = toIso(todayY, todayM, now.getDate())

const open = ref(false)
const view = ref('day')
const viewYear = ref(todayY)
const viewMonth = ref(todayM)
const selYear  = computed(() => (props.modelValue ? +props.modelValue.slice(0, 4) : null))
const selMonth = computed(() => (props.modelValue ? +props.modelValue.slice(5, 7) - 1 : null))

const showToday = computed(() => view.value === 'month' || viewYear.value !== todayY || viewMonth.value !== todayM)

/** 6 tuần (42 ô), tuần bắt đầu từ thứ Hai */
const days = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const offset = (first.getDay() + 6) % 7
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(viewYear.value, viewMonth.value, 1 - offset + i)
    return { iso: toIso(d.getFullYear(), d.getMonth(), d.getDate()), day: d.getDate(), inMonth: d.getMonth() === viewMonth.value }
  })
})

function step(dir) {
  if (view.value === 'month') { viewYear.value += dir; return }
  const d = new Date(viewYear.value, viewMonth.value + dir, 1)
  viewYear.value = d.getFullYear(); viewMonth.value = d.getMonth()
}
function goToday() { viewYear.value = todayY; viewMonth.value = todayM; view.value = 'day' }

/** Chọn 1 ngày → lấy giá trị và đóng luôn */
function pick(iso) {
  picking = true
  if (iso !== props.modelValue) emitValue(iso)
  text.value = fmt(iso)
  close()
  inputEl.value?.blur()
  picking = false
}

/* ── Mở / đóng & định vị popover ── */
const boxEl = ref(null), popEl = ref(null), inputEl = ref(null)
const popStyle = ref({})
const POP_W = 280, POP_H = 340

function place() {
  if (!boxEl.value) return
  const r = boxEl.value.getBoundingClientRect()
  const left = Math.min(Math.max(8, r.left), window.innerWidth - POP_W - 8)
  const below = window.innerHeight - r.bottom >= POP_H + 8 || r.top < POP_H + 8
  popStyle.value = below
    ? { left: left + 'px', top: r.bottom + 4 + 'px' }
    : { left: left + 'px', bottom: window.innerHeight - r.top + 4 + 'px' }
}
function openPicker() {
  if (isReadonly.value || isDisabled.value || open.value) return
  const y = selYear.value ?? todayY, m = selMonth.value ?? todayM
  viewYear.value = y; viewMonth.value = m; view.value = 'day'
  place()
  open.value = true
  nextTick(() => {
    document.addEventListener('mousedown', onOutside, true)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
  })
}
function close() {
  if (!open.value) return
  open.value = false
  document.removeEventListener('mousedown', onOutside, true)
  window.removeEventListener('resize', place)
  window.removeEventListener('scroll', place, true)
}
function onOutside(e) {
  if (boxEl.value?.contains(e.target) || popEl.value?.contains(e.target)) return
  commitText()
  close()
}
/** Bấm vào bất kỳ đâu trên ô (kể cả icon lịch) → focus input để mở lịch */
function onBoxMousedown(e) {
  if (isReadonly.value || isDisabled.value) return
  if (e.target !== inputEl.value) { e.preventDefault(); inputEl.value?.focus() }
  if (!open.value) openPicker()
}
onBeforeUnmount(close)

const fe = useFieldError()
const boxClass = computed(() => ({
  'ibox--no-border': !props.outline,
  'ibox--error':     props.state === 'error' || !!fe?.hasError.value,
  'ibox--success':   props.state === 'success',
  'ibox--warning':   props.state === 'warning',
  'ibox--disabled':  isDisabled.value,
  'ibox--readonly':  isReadonly.value,
  'ibox--sm':        props.size === 'sm',
}))
</script>

<style scoped>
.ibox--open { border-color: var(--stroke-brand); }

.date-pop {
  position: fixed; z-index: 9600;
  width: 280px; padding: 12px;
  background: var(--bg-white);
  border-radius: var(--radius-dialog);
  box-shadow: var(--shadow-popover);
  display: flex; flex-direction: column; gap: 8px;
  font-family: var(--font-family);
  user-select: none;
}
.date-pop__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.date-pop__title {
  display: inline-flex; align-items: center; gap: 4px;
  height: calc(var(--btn-height) - 4px); padding: 0 8px;
  border: none; border-radius: var(--radius-default); background: transparent; cursor: pointer;
  font-family: inherit; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary);
}
.date-pop__title:hover { background: var(--bg-brand-light); }
.date-pop__title :deep(svg) { color: var(--icon-neutral); }

.date-pop__weekdays, .date-pop__grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.date-pop__weekdays span {
  text-align: center; font-size: var(--text-body); line-height: var(--text-body-lh);
  font-weight: var(--fw-medium); color: var(--text-secondary); padding: 2px 0;
}
.date-pop__day {
  height: calc(var(--btn-height) - 4px); border: 1px solid transparent; border-radius: var(--radius-default);
  background: transparent; cursor: pointer;
  font-family: inherit; font-size: var(--text-body); color: var(--text-primary); font-feature-settings: 'tnum' 1;
}
.date-pop__day:hover { background: var(--bg-brand-light); }
.date-pop__day--muted { color: var(--text-hint); }
.date-pop__day--today { border-color: var(--stroke-brand); color: var(--text-brand); font-weight: var(--fw-semibold); }
.date-pop__day--selected,
.date-pop__day--selected:hover { background: var(--bg-brand); border-color: var(--bg-brand); color: var(--text-white); font-weight: var(--fw-semibold); }

.date-pop__months { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 4px 0; }
.date-pop__month {
  height: var(--btn-height); border: 1px solid transparent; border-radius: var(--radius-default);
  background: transparent; cursor: pointer;
  font-family: inherit; font-size: var(--text-body); color: var(--text-primary);
}
.date-pop__month:hover { background: var(--bg-brand-light); }
.date-pop__month--today { border-color: var(--stroke-brand); color: var(--text-brand); }
.date-pop__month--selected,
.date-pop__month--selected:hover { background: var(--bg-brand); border-color: var(--bg-brand); color: var(--text-white); font-weight: var(--fw-semibold); }

.date-pop__foot {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding-top: 8px; border-top: 1px solid var(--stroke-divider);
}
.date-pop__link {
  margin-left: auto;
  border: none; background: transparent; cursor: pointer; padding: 0;
  font-family: inherit; font-size: var(--text-body); font-weight: var(--fw-medium); color: var(--text-link);
}
.date-pop__link:hover { text-decoration: underline; }
.date-pop__link--muted { margin-left: 0; color: var(--text-secondary); font-weight: var(--fw-regular); }
</style>
