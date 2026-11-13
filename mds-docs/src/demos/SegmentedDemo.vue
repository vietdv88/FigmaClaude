<template>
  <div class="demo-stack">
    <div v-for="v in VARIANTS" :key="v.value" class="demo-seg-row">
      <span class="demo-muted demo-seg-row__label">{{ v.label }}</span>
      <div class="demo-row">
        <AppSegmented v-model="period[v.value]" :options="PERIODS" :variant="v.value" :aria-label="`Kỳ — ${v.label}`" />
        <AppSegmented v-model="view[v.value]" :options="VIEWS" :variant="v.value" :aria-label="`Kiểu xem — ${v.label}`" />
      </div>
    </div>

    <p class="demo-label">Chia đều cả khung (Fix Width)</p>
    <AppSegmented v-model="fitVal" :options="FIT" fit aria-label="Trạng thái" class="demo-seg-fit" />
    <AppSegmented v-model="fitVal" :options="FIT" variant="solid" fit aria-label="Trạng thái (Solid)" class="demo-seg-fit" />

    <p class="demo-label">Có icon · có mục khoá</p>
    <AppSegmented v-model="mixed" :options="MIXED" aria-label="Hiển thị" />
    <span class="demo-muted">Bấm để chọn; khi đang ở nhóm, phím ← → chuyển lựa chọn. Mục chỉ có icon phải có tooltip ghi tên.</span>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import AppSegmented from '@mds/components/AppSegmented.vue'

const VARIANTS = [{ value: 'text', label: 'Brand Text' }, { value: 'solid', label: 'Brand Solid' }, { value: 'filled', label: 'Brand Filled' }]
const PERIODS = [{ value: 'd', label: 'Ngày' }, { value: 'w', label: 'Tuần' }, { value: 'm', label: 'Tháng' }]
const VIEWS = [
  { value: 'list', icon: 'list', tip: 'Danh sách' },
  { value: 'kanban', icon: 'layout-kanban', tip: 'Kanban' },
  { value: 'calendar', icon: 'calendar', tip: 'Lịch' },
]
const period = reactive({ text: 'd', solid: 'w', filled: 'm' })
const view = reactive({ text: 'list', solid: 'kanban', filled: 'calendar' })
const FIT = [{ value: 'all', label: 'Tất cả' }, { value: 'todo', label: 'Chưa làm' }, { value: 'doing', label: 'Đang làm' }, { value: 'done', label: 'Hoàn thành' }]
const fitVal = ref('all')
const MIXED = [
  { value: 'chart', label: 'Biểu đồ', icon: 'chart-bar' },
  { value: 'table', label: 'Bảng số liệu', icon: 'table' },
  { value: 'map', label: 'Bản đồ', icon: 'map-pin', disabled: true },
]
const mixed = ref('chart')
</script>

<style scoped>
.demo-label { margin: 8px 0 0; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.demo-seg-row { display: grid; grid-template-columns: 96px minmax(0, 1fr); align-items: center; gap: 8px; }
.demo-seg-fit { max-width: 480px; }
@media (max-width: 640px) { .demo-seg-row { grid-template-columns: minmax(0, 1fr); gap: 4px; } }
</style>
