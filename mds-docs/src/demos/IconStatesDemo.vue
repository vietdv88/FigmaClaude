<template>
  <div class="demo-stack">
    <span class="demo-muted">Icon Swap (Figma 6019:66690) — icon trần không nền. Cột <b>Hover</b> / <b>Disabled</b> hiển thị tĩnh để so sánh; cột <b>Thử</b> là icon bấm được thật (<code>.icon-swap--action</code>) — rê chuột để xem đổi màu.</span>
    <div class="demo-is">
      <table class="demo-is__table">
        <thead>
          <tr><th>Color</th><th>Default</th><th>Hover</th><th>Disabled</th><th>Filled</th><th>Filled · Disabled</th><th>Thử</th><th>Token</th></tr>
        </thead>
        <tbody>
          <tr v-for="c in COLORS" :key="c.id" :class="{ 'demo-is__row--dark': c.id === 'white' }">
            <td class="demo-is__name">{{ c.label }}</td>
            <td><span class="icon-swap icon-swap--24" :class="c.cls"><TIcon name="star" /></span></td>
            <td><span class="icon-swap icon-swap--24 demo-is--hover" :class="c.cls"><TIcon name="star" /></span></td>
            <td><span class="icon-swap icon-swap--24 icon-swap--disabled" :class="c.cls"><TIcon name="star" /></span></td>
            <td><span class="icon-swap icon-swap--24 demo-is--fill" :class="c.cls"><TIcon name="star-filled" /></span></td>
            <td><span class="icon-swap icon-swap--24 icon-swap--disabled demo-is--fill" :class="c.cls"><TIcon name="star-filled" /></span></td>
            <td><button type="button" class="icon-swap icon-swap--24 icon-swap--action" :class="c.cls" :aria-label="`Icon ${c.label}`" v-tip="`Icon ${c.label}`"><TIcon name="star" /></button></td>
            <td class="demo-is__tok"><code>{{ c.tok }}</code></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="demo-label">Kích thước</p>
    <div class="demo-row demo-is__sizes">
      <span v-for="s in SIZES" :key="s" class="demo-is__size"><span class="icon-swap" :class="`icon-swap--${s}`"><TIcon name="star" /></span><small>{{ s }}</small></span>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { ensureAiGradient } from '@mds/utils/aiGradient.js'

onMounted(ensureAiGradient)
const COLORS = [
  { id: 'neutral', cls: '', label: 'Neutral', tok: 'Icon/Neutral · hover Icon/Brand' },
  { id: 'white', cls: 'icon-swap--white', label: 'White', tok: 'Icon/White · hover White Hover' },
  { id: 'ai', cls: 'icon-swap--ai', label: 'AI', tok: 'AI 600 · hover AI 700 · disabled AI 300' },
  { id: 'brand', cls: 'icon-swap--brand', label: 'Brand', tok: 'Icon/Brand · hover Brand Hover' },
  { id: 'accent', cls: 'icon-swap--accent', label: 'Accent', tok: 'Icon/Accent · hover Accent Hover' },
  { id: 'link', cls: 'icon-swap--link', label: 'Link', tok: 'Icon/Link · hover Brand Hover' },
  { id: 'info', cls: 'icon-swap--info', label: 'Info', tok: 'Icon/Info · hover Info Hover' },
  { id: 'warning', cls: 'icon-swap--warning', label: 'Warning', tok: 'Icon/Warning · hover Warning Hover' },
  { id: 'danger', cls: 'icon-swap--danger', label: 'Danger', tok: 'Icon/Danger · hover Danger Hover' },
  { id: 'success', cls: 'icon-swap--success', label: 'Success', tok: 'Icon/Success · hover Success Hover' },
]
const SIZES = [12, 16, 20, 24, 28, 32, 36, 40, 44, 48]
</script>

<style scoped>
.demo-label { margin: 8px 0 0; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.demo-is { overflow-x: auto; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-card); }
.demo-is__table { width: 100%; border-collapse: collapse; font-size: var(--text-body); }
.demo-is__table th { border: none; padding: 8px 12px; text-align: left; font-weight: var(--fw-semibold); background: var(--dt-header-bg); white-space: nowrap; }
.demo-is__table td { border: none; padding: 8px 12px; border-top: 1px solid var(--stroke-neutral-light); vertical-align: middle; }
.demo-is__name { font-weight: var(--fw-medium); white-space: nowrap; }
.demo-is__tok { color: var(--text-secondary); white-space: nowrap; }
.demo-is__row--dark td:not(.demo-is__name):not(.demo-is__tok) { background: var(--bg-brand); }
/* Ô “Hover” tĩnh: ép màu hover để so sánh cạnh nhau (chỉ trong ví dụ) */
.demo-is--hover { color: var(--is-h); }
.demo-is--hover.icon-swap--ai :deep(svg *) { stroke: url(#ai-icon-gradient-hover); }
/* Filled: icon tô đặc dùng fill = màu icon */
.demo-is--fill.icon-swap--ai :deep(svg *) { stroke: none; fill: url(#ai-icon-gradient); }
.demo-is--fill.icon-swap--ai.icon-swap--disabled :deep(svg *) { fill: url(#ai-icon-gradient-disabled); }
.demo-is__sizes { align-items: flex-end; gap: 20px; }
.demo-is__size { display: inline-flex; flex-direction: column; align-items: center; gap: 4px; }
.demo-is__size small { font-size: var(--text-body); color: var(--text-secondary); }
</style>
