<template>
  <!-- Tabs — Figma MDS Tab Horizontal Item (6019:101046). CSS dùng chung: .tabs / .tab trong style.css.
       variant: brand (mặc định) · filled · solid · neutral · underline = đường kẻ dưới cả hàng + gạch dưới tab đang chọn · baseline=false: bỏ đường kẻ dưới tab chưa chọn -->
  <div class="tabs" :class="[`tabs--${variant}`, { 'tabs--line': underline, 'tabs--no-baseline': underline && !baseline }]" role="tablist" :aria-label="ariaLabel" @keydown="onKey">
    <button v-for="t in items" :key="t.value" ref="btns" type="button" class="tab" :class="{ 'tab--active': t.value === modelValue }"
      role="tab" :aria-selected="t.value === modelValue" :tabindex="t.value === modelValue ? 0 : -1" :disabled="t.disabled"
      @click="select(t)">
      <TIcon v-if="t.icon" :name="t.icon" />
      <span>{{ t.label }}</span>
      <span v-if="t.badge != null && t.badge !== ''" class="tab__badge">{{ t.badge }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TIcon from './TIcon.vue'

const props = defineProps({
  /** [{ value, label, icon?, badge?, disabled? }] */
  items:      { type: Array, default: () => [] },
  modelValue: { default: null },
  variant:    { type: String, default: 'brand' },   // brand | filled | solid | neutral
  underline:  { type: Boolean, default: true },
  /** false: bỏ vạch nền dưới các tab CHƯA chọn (chỉ tab đang chọn còn gạch Brand) — dùng khi dải tab nằm sát viền / vạch ngăn của khung chứa, tránh 2 đường kẻ chồng nhau */
  baseline:   { type: Boolean, default: true },
  ariaLabel:  { type: String, default: null },
})
const emit = defineEmits(['update:modelValue', 'change'])
const btns = ref([])
function select(t) { if (t.disabled || t.value === props.modelValue) return; emit('update:modelValue', t.value); emit('change', t.value) }

/* ← → Home End: chuyển tab (bỏ qua tab khoá) — chuẩn ARIA tablist */
function onKey(e) {
  const keys = { ArrowRight: 1, ArrowLeft: -1, Home: 'first', End: 'last' }
  if (!(e.key in keys)) return
  e.preventDefault()
  const list = props.items, ok = list.map((t, i) => (t.disabled ? -1 : i)).filter(i => i >= 0)
  if (!ok.length) return
  const cur = list.findIndex(t => t.value === props.modelValue)
  let next
  if (keys[e.key] === 'first') next = ok[0]
  else if (keys[e.key] === 'last') next = ok[ok.length - 1]
  else { const pos = ok.indexOf(cur); next = ok[(pos + keys[e.key] + ok.length) % ok.length] }
  select(list[next]); btns.value[next]?.focus()
}
</script>
