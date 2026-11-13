<template>
  <!-- Segmented — Figma MDS ❖ Segmented (6019:80533). CSS dùng chung: .seg / .seg__item trong style.css.
       variant: text (Brand Text — mặc định) · solid (Brand Solid) · filled (Brand Filled) · fit = chia đều cả khung (Fix Width) ·
       mục chỉ có icon (không label) → vuông, bắt buộc có tip để đọc được tên -->
  <div class="seg" :class="[variant !== 'text' && `seg--${variant}`, { 'seg--fit': fit }]" role="radiogroup" :aria-label="ariaLabel" @keydown="onKey">
    <button v-for="(o, i) in options" :key="o.value" ref="btns" type="button" class="seg__item"
      :class="{ 'seg__item--active': o.value === modelValue, 'seg__item--icon': o.icon && !o.label }"
      role="radio" :aria-checked="o.value === modelValue" :aria-label="!o.label ? o.tip : null" :tabindex="o.value === modelValue || (modelValue == null && i === 0) ? 0 : -1"
      :disabled="o.disabled" v-tip="!o.label ? o.tip : ''" @click="select(o)">
      <TIcon v-if="o.icon" :name="o.icon" />
      <span v-if="o.label">{{ o.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TIcon from './TIcon.vue'
import { vTip } from '../utils/tooltip.js'

const props = defineProps({
  /** [{ value, label?, icon?, tip? (bắt buộc khi chỉ có icon), disabled? }] */
  options:    { type: Array, default: () => [] },
  modelValue: { default: null },
  variant:    { type: String, default: 'text' },   // text | solid | filled
  fit:        { type: Boolean, default: false },
  ariaLabel:  { type: String, default: null },
})
const emit = defineEmits(['update:modelValue', 'change'])
const btns = ref([])
function select(o) { if (o.disabled || o.value === props.modelValue) return; emit('update:modelValue', o.value); emit('change', o.value) }

/* ← → chuyển lựa chọn như nhóm radio */
function onKey(e) {
  const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
  if (!d) return
  e.preventDefault()
  const ok = props.options.map((o, i) => (o.disabled ? -1 : i)).filter(i => i >= 0)
  if (!ok.length) return
  const pos = ok.indexOf(props.options.findIndex(o => o.value === props.modelValue))
  const next = ok[(pos + d + ok.length) % ok.length]
  select(props.options[next]); btns.value[next]?.focus()
}
</script>
