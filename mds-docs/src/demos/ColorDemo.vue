<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-muted">Màu chủ đề:</span>
      <button v-for="c in COLORS" :key="c.id" type="button" class="demo-theme" :class="{ 'demo-theme--on': currentTheme === c.id }"
        :style="{ background: c.main }" :aria-label="c.label" v-tip="c.label" @click="applyTheme(c.id)" />
    </div>
    <div v-for="g in groups" :key="g.title" class="demo-stack demo-stack--sm">
      <div class="demo-label">{{ g.title }}</div>
      <div class="demo-swatches">
        <div v-for="t in g.tokens" :key="t" class="demo-swatch">
          <span class="demo-swatch__chip" :style="{ background: `var(${t})` }" />
          <code>{{ t }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { COLORS, currentTheme, applyTheme } from '@mds/theme.js'
import { vTip } from '@mds/utils/tooltip.js'
const groups = [
  { title: 'Base — màu cấp 1', tokens: ['--bg-brand', '--bg-info', '--bg-success', '--bg-warning', '--bg-danger'] },
  { title: 'Nền nhạt', tokens: ['--bg-brand-light', '--bg-info-light', '--bg-success-light', '--bg-warning-light', '--bg-danger-light'] },
  { title: 'Chữ', tokens: ['--text-primary', '--text-secondary', '--text-brand', '--text-link', '--text-danger'] },
  { title: 'Viền', tokens: ['--stroke-neutral', '--stroke-neutral-light', '--stroke-brand', '--stroke-divider'] },
]
</script>
