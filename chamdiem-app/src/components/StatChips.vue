<template>
  <!-- Dải thống kê nhỏ (chi tiết 1 người): mỗi mục = nhãn + số; tone tô màu số (success / warning / danger / brand) -->
  <div class="stc">
    <span v-for="(it, i) in items.filter(Boolean)" :key="i" class="stc__item" v-tip="it.tip || ''">
      <span class="stc__label">{{ it.label }}</span>
      <strong class="stc__value" :class="it.tone && `stc__value--${it.tone}`">{{ it.value }}</strong>
    </span>
  </div>
</template>

<script setup>
import { vTip } from '@mds/utils/tooltip.js'
defineProps({ items: { type: Array, default: () => [] } })   // [{ label, value, tone?, tip? }]
</script>

<style scoped>
.stc { display: flex; flex-wrap: wrap; gap: 8px; }
.stc__item { display: inline-flex; align-items: baseline; gap: 6px; padding: 6px 10px; border-radius: var(--radius-default); background: var(--bg-neutral-light); font-size: var(--text-body); line-height: var(--text-body-lh); }
.stc__label { color: var(--text-secondary); }
.stc__value { color: var(--text-primary); font-weight: var(--fw-semibold); }
.stc__value--success { color: var(--text-success); }
.stc__value--warning { color: var(--text-warning); }
.stc__value--danger  { color: var(--text-danger); }
.stc__value--brand   { color: var(--text-brand); }
</style>
