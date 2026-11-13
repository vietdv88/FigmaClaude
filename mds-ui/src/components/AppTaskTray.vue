<template>
  <!-- Khay tiến trình chạy ngầm (quy chuẩn /ds/background-tasks) — nhập khẩu / xuất khẩu / cập nhật hàng loạt… mất > 10 giây.
       Neo góc dưới phải màn hình (inline = nằm trong bố cục, dùng cho trang tài liệu). Header Brand: “N tiến trình đang xử lý” / “Đã xong N tiến trình” · thu gọn · đóng.
       Mỗi dòng: icon trạng thái · tên (1 dòng, cắt …) · dòng phụ (thanh tiến độ + số bản ghi / kết quả) · nút thao tác theo trạng thái · ✕ (đang chạy = Hủy, đã xong = Ẩn khỏi khay).
       Trạng thái: queued (chờ) · running (đang chạy, có % hoặc chưa rõ %) · success · partial (xong một phần, có dòng lỗi) · error · canceled -->
  <section v-if="tasks.length" class="task-tray" :class="{ 'task-tray--inline': inline, 'task-tray--collapsed': collapsed }" aria-label="Tiến trình chạy ngầm">
    <header class="task-tray__head" @click="collapsed && setCollapsed(false)">
      <h2 class="task-tray__title">{{ headTitle }}</h2>
      <button type="button" class="btn-icon task-tray__hbtn" :aria-label="collapsed ? 'Mở rộng' : 'Thu gọn'" v-tip="collapsed ? 'Mở rộng' : 'Thu gọn'" @click.stop="setCollapsed(!collapsed)"><TIcon :name="collapsed ? 'chevron-up' : 'chevron-down'" /></button>
      <button type="button" class="btn-icon task-tray__hbtn" aria-label="Đóng" v-tip="'Đóng'" @click.stop="$emit('close')"><TIcon name="x" /></button>
    </header>
    <!-- Thanh tiến độ chung khi thu gọn: vẫn thấy hệ thống đang chạy -->
    <div v-if="collapsed && runningCount" class="task-tray__mini" role="progressbar" :aria-valuenow="overall ?? undefined" aria-valuemin="0" aria-valuemax="100" aria-label="Tiến độ chung">
      <span class="task-tray__bar-fill" :class="{ 'task-tray__bar-fill--indet': overall == null }" :style="overall != null ? { width: overall + '%' } : null" />
    </div>

    <ul v-show="!collapsed" class="task-tray__list" aria-live="polite">
      <!-- Dòng có kết quả (Thành công / Xong một phần) bấm được = nút chính (Tải xuống · Xem · Tải file lỗi): hover Brand Light, Enter / Space.
           Đang chạy / chờ / đã hủy / LỖI: không bấm dòng (Thử lại phải bấm đúng nút ↻ — tránh chạy lại do lỡ tay) -->
      <li v-for="t in ordered" :key="t.id" class="task-tray__item" :class="[`task-tray__item--${t.status}`, { 'task-tray__item--link': rowAction(t) }]"
        :tabindex="rowAction(t) ? 0 : undefined" :aria-label="rowAction(t) ? `${t.title} — ${rowAction(t).label}` : undefined"
        @click="rowAction(t) && $emit('action', t, rowAction(t).id)" @keydown.enter.self.prevent="rowAction(t) && $emit('action', t, rowAction(t).id)" @keydown.space.self.prevent="rowAction(t) && $emit('action', t, rowAction(t).id)">
        <span class="task-tray__status" :aria-label="STATUS_LABEL[t.status]">
          <span v-if="t.status === 'running'" class="spinner spinner--sm" />
          <TIcon v-else :name="STATUS_ICON[t.status]" />
        </span>
        <div class="task-tray__body">
          <span class="task-tray__name" v-tip="t.title">{{ t.title }}</span>
          <div v-if="t.status === 'running' || t.status === 'queued'" class="task-tray__progress">
            <span class="task-tray__bar" role="progressbar" :aria-valuenow="pct(t) ?? undefined" aria-valuemin="0" aria-valuemax="100" :aria-label="t.title">
              <span class="task-tray__bar-fill" :class="{ 'task-tray__bar-fill--indet': t.status === 'running' && pct(t) == null }" :style="pct(t) != null ? { width: pct(t) + '%' } : null" />
            </span>
            <span class="task-tray__sub">{{ subText(t) }}</span>
          </div>
          <span v-else class="task-tray__sub" :class="{ 'task-tray__sub--danger': t.status === 'error', 'task-tray__sub--warning': t.status === 'partial' }">{{ subText(t) }}</span>
        </div>
        <div class="task-tray__acts">
          <!-- Thao tác kết quả = nút icon (tooltip + aria-label): Tải xuống · Xem · Tải file lỗi · Thử lại -->
          <button v-for="a in actionsOf(t)" :key="a.id" type="button" class="btn-icon btn-icon--sm task-tray__act" :aria-label="a.label" v-tip="a.label" @click.stop="$emit('action', t, a.id)"><TIcon :name="a.icon" /></button>
          <button type="button" class="btn-icon btn-icon--sm" :aria-label="isActive(t) ? 'Hủy tiến trình' : 'Ẩn khỏi danh sách'" v-tip="isActive(t) ? 'Hủy tiến trình' : 'Ẩn khỏi danh sách'"
            @click.stop="isActive(t) ? $emit('cancel', t) : $emit('dismiss', t)"><TIcon name="x" /></button>
        </div>
      </li>
    </ul>
    <footer v-if="!collapsed && historyLabel" class="task-tray__foot">
      <button type="button" class="btn btn--sm btn--text" @click="$emit('history')">{{ historyLabel }}</button>
    </footer>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import TIcon from './TIcon.vue'
import { vTip } from '../utils/tooltip.js'
import { fmtNum } from '../utils/number.js'

const props = defineProps({
  /** [{ id, kind: 'export'|'import'|'other', title, status, done?, total?, progress? (0–100, bỏ trống = chưa rõ %), eta? ('còn khoảng 2 phút'),
        result? (dòng phụ khi xong), errors? (số dòng lỗi), startedAt?, finishedAt? ('14:32'), actions? [{ id, label, icon }] (ghi đè nút mặc định) }] */
  tasks:        { type: Array,   default: () => [] },
  collapsed:    { type: Boolean, default: false },   // v-model:collapsed
  inline:       { type: Boolean, default: false },   // nằm trong bố cục thay vì neo góc màn hình
  historyLabel: { type: String,  default: '' },   // link chân khay (VD 'Xem lịch sử tiến trình') — mặc định không có: kết quả xem lại ở Thông báo
})
const emit = defineEmits(['update:collapsed', 'close', 'action', 'cancel', 'dismiss', 'history'])
const setCollapsed = v => emit('update:collapsed', v)

const STATUS_ICON = { queued: 'clock', success: 'circle-check', partial: 'alert-triangle', error: 'alert-circle', canceled: 'circle-x' }   // outline, màu theo trạng thái
const STATUS_LABEL = { queued: 'Đang chờ', running: 'Đang xử lý', success: 'Hoàn thành', partial: 'Hoàn thành, có lỗi', error: 'Lỗi', canceled: 'Đã hủy' }
const ORDER = { running: 0, queued: 1, error: 2, partial: 3, success: 4, canceled: 5 }

const isActive = t => t.status === 'running' || t.status === 'queued'
const runningCount = computed(() => props.tasks.filter(isActive).length)
const headTitle = computed(() => {
  const n = runningCount.value, all = props.tasks.length
  if (n) return `${n} tiến trình đang xử lý`
  const bad = props.tasks.filter(t => t.status === 'error').length
  return bad ? `Đã xong ${all} tiến trình · ${bad} lỗi` : `Đã xong ${all} tiến trình`
})
/* Đang chạy lên đầu (theo thứ tự bắt đầu), rồi lỗi → xong một phần → thành công → đã hủy */
const ordered = computed(() => props.tasks.map((t, i) => ({ t, i })).sort((a, b) => (ORDER[a.t.status] - ORDER[b.t.status]) || (a.i - b.i)).map(x => x.t))
const pct = t => t.progress != null ? Math.round(t.progress) : (t.total ? Math.round((t.done || 0) / t.total * 100) : null)
const overall = computed(() => { const r = props.tasks.filter(t => t.status === 'running'); const ps = r.map(pct); return ps.length && ps.every(p => p != null) ? Math.round(ps.reduce((a, b) => a + b, 0) / ps.length) : null })

function subText(t) {
  if (t.status === 'queued') return 'Đang chờ đến lượt'
  if (t.status === 'running') {
    const p = pct(t)
    if (p == null) return t.eta || 'Đang chuẩn bị…'
    return [t.total ? `${fmtNum(t.done || 0)}/${fmtNum(t.total)} bản ghi` : `${p}%`, t.eta].filter(Boolean).join(' · ')
  }
  if (t.result) return t.result
  if (t.status === 'success') return [t.total && `${fmtNum(t.total)} bản ghi`, t.finishedAt && `Xong lúc ${t.finishedAt}`].filter(Boolean).join(' · ')
  if (t.status === 'partial') return `${fmtNum((t.total || 0) - (t.errors || 0))}/${fmtNum(t.total || 0)} bản ghi thành công · ${fmtNum(t.errors || 0)} dòng lỗi`
  if (t.status === 'error') return 'Không thực hiện được — chưa có bản ghi nào được thay đổi'
  return 'Đã hủy'
}
/* Bấm cả dòng = nút chính — chỉ dòng Thành công / Xong một phần */
const rowAction = t => (t.status === 'success' || t.status === 'partial') ? actionsOf(t)[0] || null : null
/* Nút mặc định theo trạng thái + loại (ghi đè bằng task.actions) */
function actionsOf(t) {
  if (t.actions) return t.actions
  if (t.status === 'success') return t.kind === 'export' ? [{ id: 'download', label: 'Tải xuống', icon: 'download' }] : [{ id: 'view', label: 'Xem', icon: 'eye' }]
  if (t.status === 'partial') return [{ id: 'errors', label: 'Tải file lỗi', icon: 'file-alert' }]
  if (t.status === 'error') return [{ id: 'retry', label: 'Thử lại', icon: 'refresh' }]
  return []
}
</script>
