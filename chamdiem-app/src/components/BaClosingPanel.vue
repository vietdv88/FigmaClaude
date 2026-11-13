<template>
  <!-- Chốt điểm BA theo tháng: ai có Điểm BA (việc có phân tích, hoàn thành trong tháng) đều hiện — kể cả PO / Lead kiêm BA -->
  <div class="content-wrapper content-wrapper--fill">
    <!-- KPI giống tab Điểm PD: Đã chốt · Tổng Điểm BA · Work Item được tính · Việc thiếu dữ liệu chấm (ẩn / hiện bằng nút biểu đồ trên thanh bảng) -->
    <div v-if="showKpi" class="kpi-row kpi-row--5">
      <div v-for="k in kpis" :key="k.label" class="kpi-card">
        <div class="kpi-card__head">
          <span class="kpi-title">{{ k.label }}</span>
          <div class="kpi-icon" :class="`kpi-icon--${k.theme}`"><TIcon :name="k.icon" /></div>
        </div>
        <div class="kpi-num">{{ typeof k.value === 'number' ? fmtNum(k.value) : k.value }}</div>
        <span v-if="k.sub" class="kpi-sub">{{ k.sub }}</span>
      </div>
    </div>
    <div class="list-split">
      <div class="table-panel">
        <TableHeader v-model="search" search-placeholder="Tìm nhân viên" :search-width="220" :hide-ai="true" :hide-tools="['col-settings', 'filter']"
          :charts-visible="showKpi" @toggle-charts="toggleKpi"
          :main-function-button="closeIds.length > 0" :bulk-action="checked.length > 0" :selected-count="checked.length" @deselect-all="checked = []"
          @refresh="search = ''" @export="exportCsv">
          <template #filters>
            <AppCombobox v-model="statusFilter" class="filter-box" :options="STATUS_OPTIONS" placeholder="Trạng thái: Tất cả" />
          </template>
          <template #main-buttons>
            <button v-if="closeIds.length" class="btn btn--primary" @click="openClose()"><TIcon name="lock" />Chốt điểm</button>
          </template>
          <template #bulk-buttons>
            <button v-if="closeIds.length" class="btn btn--primary" @click="openClose()"><TIcon name="lock" />Chốt {{ closeIds.length }} người</button>
            <button v-if="reopenIds.length" class="btn btn--outline btn--neutral" @click="askReopenMany(reopenIds)"><TIcon name="lock-open" />Mở chốt {{ reopenIds.length }} người</button>
          </template>
        </TableHeader>
        <div class="table-scroll">
          <DataTable :columns="COLUMNS" :rows="view.paged.value" :line-count="0" :hide-blank-rows="false" :row-actions="rowActions"
            :selected="checked" @update:selected="v => (checked = v)"
            @row-click="r => (selectedId = r.id)" @view="r => (selectedId = r.id)"
            @column-sort="view.onSort" @column-filter="view.onFilter" />
          <div v-if="!all.length" class="empty-state">Chưa có ai có Điểm BA trong tháng {{ monthLabelOf(month) }} — Điểm BA tính cho việc “Chỉ phân tích” / “Phân tích → Thiết kế” có Ngày hoàn thành (BA) trong tháng.</div>
          <div v-else-if="!view.processed.value.length" class="empty-state">Không có nhân viên phù hợp.</div>
        </div>
        <TablePaging :total="view.processed.value.length" v-model:page="view.page.value" v-model:page-size="view.pageSize.value" />
      </div>
    </div>

    <!-- Công việc được tính của 1 BA -->
    <Teleport to="body">
      <Transition name="pd-drawer">
        <aside v-if="selected" class="pd-drawer" tabindex="-1" v-resizable-drawer="{ key: 'closing-ba', min: 480 }">
          <div class="pd-drawer__head">
            <div class="pd-drawer__title">
              <span class="card-title">{{ userName(selected.id) }}</span>
              <AppTag :label="selected.closing ? 'Đã chốt' : 'Chưa chốt'" :color="selected.closing ? 'success' : 'neutral'" :dot="true" />
            </div>
            <div class="pd-drawer__actions">
              <button v-if="!selected.closing && selected.canClose" class="btn btn--primary" @click="openClose([selected.id])"><TIcon name="lock" />Chốt điểm BA</button>
              <button v-else-if="selected.closing && selected.canClose" class="btn btn--outline btn--neutral" @click="askReopen(selected.id)"><TIcon name="lock-open" />Mở chốt</button>
              <button class="btn-icon" type="button" v-tip="'Đóng'" aria-label="Đóng" @click="selectedId = null"><TIcon name="x" /></button>
            </div>
          </div>
          <div class="pd-drawer__sum">
            <span>Tháng {{ monthLabelOf(month) }}</span><span>·</span>
            <span>Điểm BA tháng <strong>{{ fmt(selected.total) }}</strong></span>   <!-- số việc, đúng hạn, chất lượng… ở dải thống kê bên dưới -->
          </div>
          <p v-if="selected.closing" class="closed-note"><TIcon name="lock" />
            <span>Chốt lúc <strong>{{ formatDateTime(selected.closing.closedAt) }}</strong> bởi <strong>{{ userName(selected.closing.closedBy) || '—' }}</strong> — phần phân tích của các việc này đã khóa.</span>
          </p>
          <p v-else-if="selected.missing" class="pd-drawer__hint"><TIcon name="alert-triangle" />
            <span>{{ selected.missing }} việc đã hoàn thành nhưng thiếu dữ liệu chấm (BA Point / deadline / chất lượng) — chưa tính, sẽ không vào bản chốt.</span>
          </p>
          <StatChips v-if="detailRows.length" class="pd-drawer__stats" :items="baItemStats(selected.items, baConfigOf(db.config))" />
          <div class="pd-drawer__list">
            <DataTable v-if="detailRows.length" :columns="DETAIL_COLUMNS" :rows="detailView.paged.value" :line-count="2" :hide-blank-rows="false" :show-footer="true"
              :selected="taskId ? [taskId] : []" @row-click="r => (taskId = r.id)"
              @column-sort="detailView.onSort" @column-filter="detailView.onFilter" />
            <TablePaging v-if="detailRows.length" :total="detailView.processed.value.length" v-model:page="detailView.page.value" v-model:page-size="detailView.pageSize.value" />
            <div v-else class="empty-state">Chưa có việc nào hoàn thành trong tháng.</div>
          </div>
        </aside>
      </Transition>
    </Teleport>
    <TaskDrawer v-if="taskId" :task-id="taskId" @close="taskId = null" />

    <!-- Chốt điểm BA: chọn tháng · nghỉ lễ · ngày làm việc · danh sách BA (giống chốt điểm PD) -->
    <CloseBasDialog v-if="closeDlg" :month="month" :months="months.length ? months : [month]" :rows-for="closeRowsFor" @close="closeDlg = null" @confirm="doCloseMany" />
    <ConfirmDialog v-if="confirm" :title="confirm.type === 'close' ? 'Chốt điểm BA' : 'Mở chốt điểm BA'"
      :confirm-label="confirm.type === 'close' ? 'Chốt điểm' : 'Mở chốt'" :message="confirm.message"
      @cancel="confirm = null" @confirm="doConfirm" />
  </div>
</template>

<script setup>
import { vTip } from '@mds/utils/tooltip.js'
import { fmtNum } from '@mds/utils/number.js'
import { baConfigOf } from '../store/baScoring.js'
import StatChips from './StatChips.vue'
import { baItemStats } from '../store/detailStats.js'
import { avatarOf } from '../store/avatar.js'
import { useEscClose } from '@mds/utils/escStack.js'
import { vResizableDrawer } from '@mds/utils/resizableDrawer.js'
import { ref, computed, watch } from 'vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppTag      from '@mds/components/AppTag.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import TableHeader from '@mds/components/TableHeader.vue'
import DataTable   from '@mds/components/DataTable.vue'
import { sumBy } from '@mds/utils/tableTotals.js'
import TablePaging from '@mds/components/TablePaging.vue'
import { toast } from '@mds/utils/toast.js'
import { matchText } from '@mds/utils/search.js'
import TaskDrawer    from './TaskDrawer.vue'
import CloseBasDialog from './CloseBasDialog.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { db, userById, userName, roleLabelOf, canSeeTask, baClosingFor, canCloseBa, closeBa, reopenBa, projectById, seesAllBa, viewsAllBa, canSeeReportOf, ensureMonthTasks, baMonthTasks } from '../store/db.js'
import { baItemsOf, baItemOf, baMonthSummary, monthLabelOf, formatDate, round } from '../store/scoring.js'
import { useTableView } from '../store/useTableView.js'
import { downloadCsv } from '../store/csv.js'

const props = defineProps({
  month:  { type: String, required: true },
  months: { type: Array, default: () => [] },   // tháng chọn được trong hộp thoại chốt (giống chốt PD)
})
watch([() => props.month, () => db.loadGen], ([m]) => ensureMonthTasks(m), { immediate: true })   // tải công việc của tháng đang xem
const fmt = n => (n == null ? '—' : fmtNum(n))
const pct = n => (n == null ? '—' : `${fmtNum(n, { decimals: 2 })}%`)

/* Người hiện ra: có việc phân tích hoàn thành trong tháng (mình xem được) hoặc đã có bản chốt BA tháng này */
/* Người trong danh sách Điểm BA: người thuộc BỘ PHẬN BA trong phạm vi xem (kể cả chưa có điểm tháng này)
   + người THỰC SỰ có Điểm BA trong tháng ở việc mình xem được (PO / Lead kiêm BA) + người đã có bản chốt BA tháng.
   Không lấy người chỉ từng bị gán cột BA ở việc nào đó (VD PD bị gán nhầm khi nhập) */
function peopleOf(ym) {
  const ids = new Set(db.users.filter(u => u.role === 'BA' && u.status !== 'disabled' && (viewsAllBa() || canSeeReportOf(u.id))).map(u => u.id))
  baMonthTasks(ym).filter(t => canSeeTask(t) && baItemsOf(ym, t.baId, [t]).length).forEach(t => ids.add(t.baId))
  db.baClosings.filter(c => c.month === ym).forEach(c => ids.add(c.baId))
  return [...ids].filter(id => userById(id)?.status !== 'disabled')
}
const itemsFor = (id, ym = props.month) => {
  const c = baClosingFor(ym, id)
  return c ? c.items : baItemsOf(ym, id, baMonthTasks(ym)).map(t => baItemOf(t, db.config))
}
/* Dòng điểm BA của 1 tháng (dùng cho bảng tháng đang xem + hộp thoại chốt chọn tháng khác) */
const allFor = ym => peopleOf(ym).map(id => {
  const closing = baClosingFor(ym, id) ?? null, items = itemsFor(id, ym), s = closing?.summary ?? baMonthSummary(items)
  return { id, closing, items, canClose: canCloseBa(id, ym), ...s }
})
const all = computed(() => allFor(props.month))

const search = ref(''), statusFilter = ref('')
const STATUS_OPTIONS = [{ value: '', label: 'Trạng thái: Tất cả' }, { value: 'open', label: 'Chưa chốt' }, { value: 'closed', label: 'Đã chốt' }]
const COLUMNS = [
  { key: 'check',    label: '',                   type: 'checkbox', width: 48 },
  { key: 'person',   label: 'Nhân viên',          type: 'avatar-subtext', minWidth: 220 },
  { key: 'total',    label: 'Điểm BA tháng',      width: 150, align: 'right' },   // Điểm trước Trạng thái
  { key: 'status',   label: 'Trạng thái',         type: 'status', width: 130 },
  { key: 'count',    label: 'Số việc',            width: 100, align: 'right' },
  { key: 'point',    label: 'Point năng suất',    width: 150, align: 'right' },
  { key: 'progress', label: 'Hệ số tiến độ',      width: 140, align: 'right' },
  { key: 'quality',  label: 'Hệ số chất lượng',   width: 160, align: 'right' },
  { key: 'missing',  label: 'Thiếu dữ liệu',      type: 'status', width: 150 },
  { key: 'closedBy', label: 'Người chốt',         width: 170 },
]
const selectedId = ref(null), taskId = ref(null)   // người đang mở drawer · việc đang mở — khai báo trước bảng (đánh dấu dòng đang xem)
const rows = computed(() => all.value
  .filter(r => !search.value.trim() || matchText([userName(r.id), userById(r.id)?.code], search.value))
  .filter(r => !statusFilter.value || (statusFilter.value === 'closed') === !!r.closing)
  .map(r => ({
    id: r.id, _mark: r.id === selectedId.value ? 'current' : '',   // dòng đang mở drawer — độc lập với ô tick chọn
    _sort: { total: r.total, count: r.count, point: r.point, progress: r.progressRate ?? -1, quality: r.qualityRate ?? -1, missing: r.missing },
    person: { text: userName(r.id), subtext: [userById(r.id)?.code, roleLabelOf(userById(r.id))].filter(Boolean).join(' · '), avatar: avatarOf(userById(r.id)) },
    status: r.closing ? { label: 'Đã chốt', color: 'success' } : { label: 'Chưa chốt', color: 'neutral' },
    total: fmt(r.total), count: r.count, point: fmt(r.point), progress: pct(r.progressRate), quality: pct(r.qualityRate),
    missing: r.missing ? { label: `${r.missing} việc`, color: 'warning' } : { label: 'Đủ', color: 'success' },
    closedBy: r.closing ? userName(r.closing.closedBy) : '',
  })))
const view = useTableView(rows, { sortValue: (r, k) => r._sort[k] ?? (r[k]?.label ?? r[k]?.text ?? r[k]), defaultSort: { key: 'total', dir: 'desc' } })   // mặc định điểm cao nhất lên đầu
const rowActions = [{ icon: 'eye', title: 'Xem công việc', emit: 'view' }]

/* ── KPI (giống tab Điểm PD) — tính trên cả tháng, không theo ô tìm kiếm ── */
const KPI_KEY = 'pdpoint-hide-kpi-closing'   // dùng chung nút ẩn / hiện KPI với tab Điểm PD
let hideSaved = false
try { hideSaved = localStorage.getItem(KPI_KEY) === '1' } catch { /* storage bị chặn */ }
const showKpi = ref(!hideSaved)
function toggleKpi() { showKpi.value = !showKpi.value; try { localStorage.setItem(KPI_KEY, showKpi.value ? '0' : '1') } catch { /* bỏ qua */ } }
const kpis = computed(() => {
  const list = all.value, closed = list.filter(r => r.closing).length
  const sum = k => list.reduce((a, r) => a + (Number(r[k]) || 0), 0)
  const missing = sum('missing')
  const scored = list.filter(r => r.total > 0)   // trung bình bỏ BA 0 điểm (chưa dùng / chưa có việc)
  return [
    { label: 'Đã chốt', value: `${closed}/${list.length}`, icon: 'lock', theme: 'success', sub: !list.length ? 'Chưa có BA có điểm' : closed === list.length ? 'Đã chốt đủ' : `Còn ${list.length - closed} người chưa chốt` },
    { label: 'Tổng Điểm BA tháng', value: fmt(sum('total')), icon: 'trophy', theme: 'purple', sub: `${scored.length} người có điểm` },
    { label: 'Điểm TB / BA', value: scored.length ? fmt(sum('total') / scored.length) : '—', icon: 'math-avg', theme: 'brand', sub: scored.length ? `Trên ${scored.length} BA có điểm (bỏ 0 điểm)` : 'Chưa có BA có điểm' },
    { label: 'Work Item được tính', value: sum('count'), icon: 'clipboard-check', theme: 'blue', sub: `Tổng BA Point ${fmt(sum('point'))}` },
    { label: 'Việc thiếu dữ liệu chấm', value: missing, icon: 'alert-triangle', theme: 'warning', sub: missing ? 'Chưa tính điểm — bổ sung BA Point / deadline / chất lượng' : 'Đủ dữ liệu' },
  ]
})

/* Hộp thoại chốt: only = danh sách người cố định (chốt từ drawer 1 người) · không có → người đang chọn / mọi người đủ điều kiện */
const closeDlg = ref(null)
function openClose(only) { closeDlg.value = { only: only ?? (checked.value.length ? [...checked.value] : null) } }
const closeRowsFor = ym => allFor(ym).filter(r => !r.closing && r.canClose && (!closeDlg.value?.only || closeDlg.value.only.includes(r.id)))
function doCloseMany(ym, entries) {
  closeDlg.value = null
  const fails = entries.map(e => closeBa(ym, e.baId, { holidays: e.holidays, workingDays: e.workingDays, actualDays: e.actualDays, effort: e.effort })).filter(r => r !== true)
  fails.length ? toast.warning(fails[0]) : toast.success(entries.length > 1 ? `Đã chốt điểm BA tháng ${monthLabelOf(ym)} cho ${entries.length} người` : `Đã chốt điểm BA tháng ${monthLabelOf(ym)}`)
  checked.value = []
}

/* Chọn & chốt / mở chốt hàng loạt — giống tab PD: không chọn ai → nút Chốt điểm áp cho mọi người đủ điều kiện */
const checked = ref([])
watch(() => props.month, () => { checked.value = [] })
const pool = computed(() => (checked.value.length ? all.value.filter(r => checked.value.includes(r.id)) : all.value))
const closeIds  = computed(() => pool.value.filter(r => !r.closing && r.canClose).map(r => r.id))   // giống PD: chốt được cả người 0 điểm (máy chủ kiểm tra quyền)
const reopenIds = computed(() => (checked.value.length ? pool.value : []).filter(r => r.closing && r.canClose).map(r => r.id))

/* Chi tiết */
watch(() => props.month, () => { selectedId.value = null; taskId.value = null })
const selected = computed(() => all.value.find(r => r.id === selectedId.value) ?? null)
/* Dòng Tổng (ghim đáy bảng) — cộng trên TOÀN BỘ việc của người đang xem, không chỉ trang hiện tại */
const detailSum = k => fmt(sumBy(selected.value?.items, k))
const DETAIL_COLUMNS = computed(() => [
  // Ưu tiên điểm: BA Point → tiến độ, chất lượng → thực nhận; ngày + dự án ra sau
  { key: 'pbi',      label: 'PBI',              width: 80 },
  { key: 'content',  label: 'Nội dung',         minWidth: 220 },
  { key: 'point',    label: 'BA Point',         width: 90, align: 'right', footerText: detailSum('baPoint') },
  // Theo template “Chi tiết công việc BA”: hệ số → Point của tiến độ / chất lượng
  { key: 'progress', label: 'Hệ số tiến độ',    width: 120, align: 'right' },
  { key: 'progressPoint', label: 'Point tiến độ', width: 120, align: 'right', footerText: detailSum('progressPoint') },
  { key: 'quality',  label: 'Hệ số chất lượng', width: 140, align: 'right' },
  { key: 'qualityPoint', label: 'Point chất lượng', width: 140, align: 'right', footerText: detailSum('qualityPoint') },
  { key: 'actual',   label: 'Điểm thực nhận',   width: 130, align: 'right', footerText: detailSum('actual') },
  { key: 'done',     label: 'Hoàn thành',       width: 110 },
  { key: 'project',  label: 'Dự án',            width: 150 },
])
const detailRows = computed(() => (selected.value?.items ?? []).map(i => ({
  id: i.taskId, pbi: i.pbi, content: i.content, point: i.baPoint === '' ? '—' : i.baPoint,
  done: formatDate(i.baCompletedDate),
  progress: i.progressRate == null ? '—' : `${i.progressRate}%`, quality: i.qualityRate == null ? '—' : `${i.qualityRate}%`, actual: fmt(i.actual),
  progressPoint: i.progressRate == null ? '—' : fmt(i.progressPoint), qualityPoint: i.qualityRate == null ? '—' : fmt(i.qualityPoint),
  project: projectById(i.projectId)?.name ?? '',
})))

const detailView = useTableView(detailRows, { sortValue: (r, k) => (r[k]?.label ?? r[k]?.text ?? r[k]) })
watch(selectedId, () => { detailView.page.value = 1 })

/* Chốt / mở chốt */
const confirm = ref(null)
function askClose(id) {
  const r = all.value.find(x => x.id === id)
  if (!r) return
  if (r.closing) return askReopen(id)
  if (!r.canClose) return toast.warning('Chỉ quản lý trực tiếp của người này hoặc Quản trị được chốt điểm')
  if (!r.count) return toast.warning('Chưa có việc nào đủ dữ liệu để chốt')
  confirm.value = { type: 'close', id, message: `Chốt điểm BA tháng ${monthLabelOf(props.month)} của ${userName(id)}: ${r.count} việc, ${fmt(r.total)} điểm.${r.missing ? ` ${r.missing} việc thiếu dữ liệu sẽ không được tính.` : ''} Phần phân tích của các việc này sẽ bị khóa.` }
}
function askReopen(id) {
  const r = all.value.find(x => x.id === id)
  if (!r?.closing) return
  if (!r.canClose) return toast.warning('Bạn không có quyền mở chốt điểm BA này')
  confirm.value = { type: 'reopen', id, message: `Mở chốt điểm BA tháng ${monthLabelOf(props.month)} của ${userName(id)}? Phần phân tích của các việc sẽ được sửa lại.` }
}
function askCloseMany(ids) {
  if (ids.length === 1) return askClose(ids[0])
  const list = all.value.filter(r => ids.includes(r.id)), total = list.reduce((a, r) => a + r.total, 0), miss = list.reduce((a, r) => a + r.missing, 0)
  confirm.value = { type: 'close', ids, message: `Chốt điểm BA tháng ${monthLabelOf(props.month)} cho ${ids.length} người (tổng ${fmt(total)} điểm).${miss ? ` ${miss} việc thiếu dữ liệu sẽ không được tính.` : ''} Phần phân tích của các việc này sẽ bị khóa.` }
}
function askReopenMany(ids) {
  if (ids.length === 1) return askReopen(ids[0])
  confirm.value = { type: 'reopen', ids, message: `Mở chốt điểm BA tháng ${monthLabelOf(props.month)} cho ${ids.length} người? Phần phân tích của các việc sẽ được sửa lại.` }
}
function doConfirm() {
  const { type } = confirm.value, ids = confirm.value.ids ?? [confirm.value.id]
  confirm.value = null
  if (type === 'close') {
    const fails = ids.map(id => closeBa(props.month, id)).filter(r => r !== true)
    fails.length ? toast.warning(fails[0]) : toast.success(ids.length > 1 ? `Đã chốt điểm BA cho ${ids.length} người` : 'Đã chốt điểm BA')
  } else { ids.forEach(id => reopenBa(props.month, id)); toast.success(ids.length > 1 ? `Đã mở chốt cho ${ids.length} người` : 'Đã mở chốt điểm BA') }
  checked.value = []
}

function exportCsv() {
  downloadCsv(`chot-diem-ba-${props.month}.csv`, ['Nhân viên', 'Trạng thái', 'Điểm BA tháng', 'Số việc', 'Point năng suất', 'Hệ số tiến độ', 'Hệ số chất lượng', 'Thiếu dữ liệu', 'Người chốt'],
    all.value.map(r => [userName(r.id), r.closing ? 'Đã chốt' : 'Chưa chốt', fmt(r.total), r.count, fmt(r.point), pct(r.progressRate), pct(r.qualityRate), r.missing, r.closing ? userName(r.closing.closedBy) : '']))
}
useEscClose(() => { selectedId.value = null }, () => !!selectedId.value)   // ESC đóng drawer chi tiết
</script>

<style scoped>
.empty-card { padding: 32px; text-align: center; }
.empty-card__text { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.empty-card__hint { margin-top: 4px; font-size: var(--text-body); color: var(--text-secondary); }
.filter-box { width: 180px; }
/* Ngăn kéo chi tiết — cùng kiểu tab Điểm PD (Tổng hợp điểm) */
.pd-drawer {
  position: fixed; z-index: 890;   /* dưới drawer công việc (900) → mở việc thì chồng lên */
  top: var(--layout-header-h); right: var(--side-panel-w, 0px); bottom: 0;   /* chat / AVA mở → neo theo mép trang đã co */
  width: 760px; max-width: 100vw;
  display: flex; flex-direction: column;
  background: var(--bg-white); box-shadow: var(--shadow-dialog); outline: none;
}
.pd-drawer__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: var(--card-py) var(--card-px) 4px; }
.pd-drawer__actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.pd-drawer__title { display: flex; align-items: center; gap: 8px; min-width: 0; }
.pd-drawer__sum { display: flex; gap: 6px; padding: 0 var(--card-px) var(--card-gap); font-size: var(--text-body); color: var(--text-secondary); }
.pd-drawer__sum strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.pd-drawer__list { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: auto; }
.pd-drawer__list > .datatable { flex: 1 1 auto; min-height: 0; overflow: auto; }
.pd-drawer__stats { padding: 0 var(--card-px) var(--card-gap); }
.pd-drawer-enter-active, .pd-drawer-leave-active { transition: transform 0.2s ease; }
.pd-drawer-enter-from, .pd-drawer-leave-to { transform: translateX(100%); }
.pd-drawer__hint { display: flex; align-items: center; gap: 8px; margin: 0 var(--card-px) var(--card-gap); font-size: var(--text-body); color: var(--text-secondary); }
.pd-drawer__hint .ti { font-size: 16px; flex-shrink: 0; }
.closed-note {
  display: flex; align-items: center; gap: 8px; margin: 0 var(--card-px) var(--card-gap);
  padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-success-light);
  font-size: var(--text-body); color: var(--text-primary);
}
.closed-note strong { font-weight: var(--fw-semibold); }
</style>
