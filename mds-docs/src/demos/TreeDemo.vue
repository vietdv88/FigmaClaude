<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-muted">Kiểu:</span>
      <div class="seg" role="group" aria-label="Kiểu cây">
        <button v-for="t in TYPES" :key="t.id" type="button" class="seg__item" :class="{ 'seg__item--active': type === t.id }" :aria-pressed="type === t.id" @click="type = t.id">{{ t.label }}</button>
      </div>
    </div>
    <span class="demo-muted">Gõ vào ô tìm kiếm để lọc (giữ cả nhánh cha). Bấm mũi tên để mở / đóng nhánh; phím ↑ ↓ di chuyển, → mở, ← đóng, Space / Enter chọn.</span>
    <div class="demo-tree-wrap">
      <!-- Có ô tick: chọn nhiều đơn vị độc lập (như Figma) · Tick cả nhánh: cascade -->
      <AppTree v-if="type !== 'single'" :key="type" v-model="checked" :items="ORG" checkable :cascade="type === 'cascade'" panel :default-expanded="['misa', 'sx']" :max-height="420" class="demo-tree" />
      <!-- Không ô tick: chọn 1 đơn vị -->
      <AppTree v-else v-model="current" :items="ORG" panel :default-expanded="['misa', 'sx']" :max-height="420" class="demo-tree" @select="n => toast.info(`Đã chọn: ${n.label}`)" />
      <div class="demo-tree-result">
        <span class="demo-muted">{{ type === 'single' ? 'Đang chọn' : `Đã chọn (${checked.length})` }}</span>
        <span>{{ type === 'single' ? labelOf(current) : (checked.map(labelOf).join(', ') || '—') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppTree from '@mds/components/AppTree.vue'
import { toast } from '@mds/utils/toast.js'

const TYPES = [{ id: 'check', label: 'Có ô tick' }, { id: 'cascade', label: 'Tick cả nhánh' }, { id: 'single', label: 'Không ô tick' }]
const type = ref('check')
const ORG = [{ id: 'misa', label: 'Công ty cổ phần MISA', children: [
  { id: 'hdqt', label: 'Hội đồng quản trị', children: [{ id: 'hdqt-tk', label: 'Thư ký Hội đồng quản trị' }] },
  { id: 'bdh', label: 'Ban điều hành', children: [{ id: 'bdh-tgd', label: 'Văn phòng Tổng giám đốc' }] },
  { id: 'sx', label: 'Khối sản xuất', children: [
    { id: 'sx-bgd', label: 'Ban giám đốc khối sản xuất' },
    { id: 'sx-th', label: 'Phòng Tích hợp hệ thống', children: [{ id: 'sx-th-1', label: 'Tổ tích hợp 1' }, { id: 'sx-th-2', label: 'Tổ tích hợp 2' }] },
    { id: 'sx-qt', label: 'Phòng Quản trị hệ thống', children: [{ id: 'sx-qt-1', label: 'Tổ vận hành' }] },
    { id: 'sx-ht', label: 'Phòng Hỗ trợ kỹ thuật' },
    { id: 'sx-nc', label: 'Ban Nghiên cứu Thị trường & Sản phẩm' },
    { id: 'sx-an', label: 'Ban An ninh thông tin' },
    { id: 'sx-vp', label: 'Văn phòng sản xuất' },
  ] },
  { id: 'an', label: 'Ban An Ninh thông tin', children: [{ id: 'an-1', label: 'Tổ giám sát' }] },
  { id: 'vp', label: 'Văn phòng sản xuất', children: [{ id: 'vp-1', label: 'Tổ hành chính' }] },
] }]
const labels = new Map(); const walk = l => l.forEach(n => { labels.set(n.id, n.label); n.children && walk(n.children) }); walk(ORG)
const labelOf = id => labels.get(id) || '—'
const checked = ref(['sx-th', 'sx-qt'])
const current = ref('sx-th')
watch(type, t => { checked.value = t === 'cascade' ? ['sx-th', 'sx-th-1', 'sx-th-2'] : ['sx-th', 'sx-qt'] })
</script>

<style scoped>
.demo-tree-wrap { display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start; padding: 24px; border-radius: var(--radius-card); background: var(--bg-page); }
.demo-tree { width: 398px; max-width: 100%; }
.demo-tree-result { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 200px; font-size: var(--text-body); }
@media (max-width: 600px) { .demo-tree-wrap { padding: 12px; } }
</style>
