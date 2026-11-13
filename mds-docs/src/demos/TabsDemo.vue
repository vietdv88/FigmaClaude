<template>
  <div class="demo-stack">
    <AppCheckbox v-model="underline" label="Đường kẻ dưới (Underline)" data-dsi-ignore />

    <!-- Các kiểu tab theo Figma Tab Horizontal Item, xếp dọc để so sánh — tab có icon + số đếm, 1 tab khoá -->
    <div v-for="v in VARIANTS" :key="v.value" class="demo-tabs-row">
      <p class="demo-label">{{ v.label }}</p>
      <AppTabs v-model="tab[v.value]" :items="ITEMS" :variant="v.value" :underline="underline" :aria-label="`Hồ sơ nhân viên — ${v.label}`" />
    </div>

    <p class="demo-label">Tab đi kèm nội dung</p>
    <div class="demo-tabs-card">
      <AppTabs v-model="tab.brand" :items="ITEMS" :underline="underline" aria-label="Hồ sơ nhân viên" />
      <div class="demo-tabs-panel" role="tabpanel">{{ PANEL[tab.brand] }}</div>
    </div>
    <span class="demo-muted">Bấm tab, hoặc dùng phím ← → Home End khi đang ở thanh tab. Tab nhiều không đủ chỗ thì cuộn ngang.</span>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import AppTabs from '@mds/components/AppTabs.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'

const VARIANTS = [
  { value: 'brand',   label: 'Brand · Text' },
  { value: 'filled',  label: 'Brand · Filled' },
  { value: 'solid',   label: 'Brand · Solid' },
  { value: 'neutral', label: 'Neutral · Text' },
]
const underline = ref(true)
const ITEMS = [
  { value: 'info', label: 'Thông tin chung', icon: 'user' },
  { value: 'contract', label: 'Hợp đồng', icon: 'file-text', badge: 3 },
  { value: 'salary', label: 'Lương & phụ cấp', icon: 'cash' },
  { value: 'leave', label: 'Nghỉ phép', icon: 'calendar', badge: 12 },
  { value: 'lock', label: 'Đánh giá', icon: 'award', disabled: true },
]
const PANEL = {
  info: 'Họ tên, ngày sinh, phòng ban, chức danh…',
  contract: '3 hợp đồng: thử việc, 1 năm, không thời hạn.',
  salary: 'Lương cơ bản 15.000.000 · Phụ cấp ăn trưa 730.000.',
  leave: 'Còn 12 ngày phép năm 2026.',
}
const tab = reactive({ brand: 'info', filled: 'contract', solid: 'info', neutral: 'salary' })
</script>

<style scoped>
.demo-label { margin: 0 0 6px; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.demo-tabs-row { display: flex; flex-direction: column; min-width: 0; }
.demo-tabs-card { display: flex; flex-direction: column; min-width: 0; }
.demo-tabs-panel { padding: 16px 4px 4px; font-size: var(--text-body); color: var(--text-primary); }
</style>
