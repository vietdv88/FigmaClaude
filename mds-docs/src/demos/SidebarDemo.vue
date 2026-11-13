<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-muted">Menu con:</span>
      <div class="seg" role="group" aria-label="Kiểu menu con">
        <button v-for="m in MODES" :key="m.id" type="button" class="seg__item" :class="{ 'seg__item--active': mode === m.id }" :aria-pressed="mode === m.id" @click="mode = m.id">{{ m.label }}</button>
      </div>
      <template v-for="o in OPTS" :key="o.key">
        <span class="demo-muted">{{ o.label }}:</span>
        <div class="seg" role="group" :aria-label="o.label">
          <button v-for="x in o.values" :key="String(x.v)" type="button" class="seg__item" :class="{ 'seg__item--active': opt[o.key] === x.v }" :aria-pressed="opt[o.key] === x.v" @click="opt[o.key] = x.v">{{ x.label }}</button>
        </div>
      </template>
      <span class="demo-muted">Nền sidebar:</span>
      <div class="seg" role="group" aria-label="Nền sidebar">
        <button v-for="t in TONES" :key="t.id" type="button" class="seg__item" :class="{ 'seg__item--active': tone === t.id }" :aria-pressed="tone === t.id"
          :disabled="t.id === 'light' && rootDark" @click="tone = t.id">{{ t.label }}</button>
      </div>
      <span class="demo-muted">Badge:</span>
      <div class="seg" role="group" aria-label="Badge số đếm">
        <button v-for="b in BADGES" :key="b.id" type="button" class="seg__item" :class="{ 'seg__item--active': showBadge === b.on }" :aria-pressed="showBadge === b.on" @click="showBadge = b.on">{{ b.label }}</button>
      </div>
    </div>
    <div class="demo-muted">Bấm nút ở đáy sidebar để thu gọn / ghim mở rộng, rê chuột vào cột icon để xem nhanh. Sidebar Tối chỉ dùng khi header nền trắng; header màu thì sidebar luôn Sáng.<template v-if="rootDark"> Đang chọn sidebar Tối cho cả trang (bánh răng › Thiết lập hiển thị) nên ví dụ luôn tối.</template></div>
    <!-- Khung ứng dụng thu nhỏ: sidebar + vùng nội dung -->
    <div class="demo-app sidebar-scope" :data-sidebar="tone === 'dark' ? 'dark' : null">
      <AppSidebar :key="mode + opt.levels + opt.groups" :items="items" :active-id="active" :children-mode="mode" default-expanded
        quick-add-label="Thêm nhanh" storage-key="ds-demo-sidebar" @nav="id => (active = id)" @quick-add="toast.info('Ví dụ: mở form thêm nhanh')" />
      <div class="demo-app__main">
        <span class="demo-app__title">{{ titleOf(active) }}</span>
        <span class="demo-muted">Nội dung màn hình “{{ titleOf(active) }}”. Số đỏ bên phải mục = số việc cần xem (> 99 hiện 99+); mục cha tự cộng số của mục con; thu gọn sidebar chỉ còn chấm đỏ ở góc icon.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import AppSidebar from '@mds/components/AppSidebar.vue'
import { toast } from '@mds/utils/toast.js'

const MODES = [{ id: 'accordion', label: 'Mở xuống' }, { id: 'flyout', label: 'Xổ sang phải' }]
const mode = ref('accordion')
// Nền sidebar Sáng / Tối chỉ trong khung ví dụ (.sidebar-scope) — không đổi thiết lập của cả trang
const TONES = [{ id: 'light', label: 'Sáng' }, { id: 'dark', label: 'Tối' }]
const rootDark = document.documentElement.getAttribute('data-sidebar') === 'dark'
const tone = ref(rootDark ? 'dark' : 'light')
// Tùy chọn cấu trúc menu: số cấp · chia nhóm · icon ở mục con
const OPTS = [
  { key: 'levels', label: 'Số cấp', values: [{ v: 2, label: '2 cấp' }, { v: 3, label: '3 cấp' }] },
  { key: 'groups', label: 'Chia nhóm', values: [{ v: false, label: 'Không' }, { v: true, label: 'Có' }] },
  { key: 'subIcons', label: 'Mục con', values: [{ v: false, label: 'Chỉ chữ' }, { v: true, label: 'Có icon' }] },
]
const opt = reactive({ levels: 3, groups: true, subIcons: false })
// count: số đếm canh phải (badge) · badge: nhãn chữ sát tên (VD “Mới”) · { group } = tiêu đề nhóm · children lồng children = cấp 3
function buildItems({ levels, groups, subIcons }) {
  const ic = (icon, x) => (subIcons ? { icon, ...x } : x)
  const l3 = (kids, x) => (levels === 3 ? { ...x, children: kids } : { ...x, count: kids.reduce((t, k) => t + (k.count || 0), 0) || undefined })
  const planKids = [
    ...(groups ? [{ group: 'Lập kế hoạch' }] : []),
    ic('list-details', { id: 'plan-all', label: 'Kế hoạch tổng thể' }),
    ic('calendar', { id: 'plan-detail', label: 'Kế hoạch chi tiết', count: 4 }),
    ...(groups ? [{ group: 'Nguyên vật liệu' }] : []),
    ic('box', { id: 'plan-material', label: 'Kế hoạch nguyên vật liệu' }),
    ic('shopping-cart', { id: 'plan-request', label: 'Yêu cầu mua NVL', count: 7 }),
  ]
  const stockKids = [
    ic('arrow-down', l3([{ id: 'in-buy', label: 'Nhập mua hàng', count: 120 }, { id: 'in-product', label: 'Nhập thành phẩm', count: 8 }, { id: 'in-return', label: 'Nhập hàng bán trả lại' }], { id: 'stock-in', label: 'Nhập kho' })),
    ic('arrow-up', l3([{ id: 'out-sale', label: 'Xuất bán hàng' }, { id: 'out-prod', label: 'Xuất cho sản xuất' }, { id: 'out-move', label: 'Xuất chuyển kho' }], { id: 'stock-out', label: 'Xuất kho' })),
    ic('clipboard-list', { id: 'stock-check', label: 'Kiểm kê kho' }),
  ]
  return [
    { id: 'home', icon: 'home', label: 'Tổng quan' },
    ...(groups ? [{ group: 'Nghiệp vụ' }] : []),
    { id: 'orders', icon: 'file-text', label: 'Đơn đặt hàng', count: 12 },
    { id: 'plan', icon: 'list', label: 'Kế hoạch sản xuất', children: planKids },
    { id: 'stock', icon: 'package', label: 'Kho vật tư', children: stockKids },
    ...(groups ? [{ group: 'Quản lý' }] : []),
    { id: 'tasks', icon: 'circle-check', label: 'Giao việc', count: 3 },
    { id: 'report', icon: 'chart-bar', label: 'Báo cáo', badge: 'Mới' },
  ]
}
// Bật / tắt badge (số đếm + nhãn chữ) để xem sidebar khi không có thông báo
const BADGES = [{ id: 'on', on: true, label: 'Hiện' }, { id: 'off', on: false, label: 'Ẩn' }]
const showBadge = ref(false)   // mặc định ẩn badge
const strip = ({ count, badge, children, ...it }) => ({ ...it, ...(children ? { children: children.map(strip) } : {}) })
const full = computed(() => buildItems(opt))
const items = computed(() => (showBadge.value ? full.value : full.value.map(strip)))
const active = ref('plan-detail')
watch(() => opt.levels, () => { if (!titleOf(active.value)) active.value = 'stock-in' })   // về 2 cấp mà đang xem mục cấp 3 → chọn mục cha
// Tìm tên mục ở mọi cấp (2 hoặc 3 cấp)
const titleOf = (id, list = full.value) => { for (const it of list) { if (it.id === id) return it.label; const t = it.children && titleOf(id, it.children); if (t) return t } return '' }
</script>
