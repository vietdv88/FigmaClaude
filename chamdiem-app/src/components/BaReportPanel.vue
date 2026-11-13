<template>
  <!-- Tổng quan BA: điểm thực nhận theo tháng (theo Ngày hoàn thành BA) — người đã chốt dùng bản chốt -->
  <div class="content-wrapper">
    <slot />
    <div class="kpi-row kpi-row--5">
      <div v-for="k in kpis" :key="k.label" class="kpi-card">
        <div class="kpi-card__head">
          <span class="kpi-title">{{ k.label }}</span>
          <div class="kpi-icon" :class="`kpi-icon--${k.theme}`"><TIcon :name="k.icon" /></div>
        </div>
        <div class="kpi-num">{{ typeof k.value === 'number' ? fmtNum(k.value) : k.value }}</div>
        <span v-if="k.sub" class="kpi-sub">{{ k.sub }}</span>
      </div>
    </div>

    <div class="charts-row">
      <div class="card">
        <div class="card__head"><span class="card-title">Điểm BA theo người</span></div>
        <div ref="barEl" class="chart-area" />
      </div>
      <div class="card">
        <div class="card__head"><span class="card-title">Phân bổ chất lượng</span></div>
        <div ref="pieEl" class="chart-area" />
      </div>
      <UpcomingTasks :project-id="projectId" phase="analysis" />
    </div>

    <div class="table-card">
      <div class="table-card__head">
        <div class="table-card__title">
          <span class="card-title">Tổng hợp theo BA
            <InfoTip text="Điểm BA tháng = tổng Điểm thực nhận các việc có Ngày hoàn thành (BA) trong tháng. Hệ số tiến độ / chất lượng = tổng Point tiến độ / chất lượng ÷ Point năng suất (bình quân theo BA Point). Người đã chốt hiển thị theo bản chốt." />
          </span>
          <span class="table-card__hint">{{ rows.length ? `${rows.length} người có Điểm BA trong tháng ${monthLabelOf(month)}` : '' }}</span>
        </div>
      </div>
      <DataTable :columns="COLUMNS" :line-count="0" :rows="view.processed.value" :hide-blank-rows="false" :selected="selectedId ? [selectedId] : []"
        :row-actions="[{ icon: 'eye', title: 'Xem chi tiết', emit: 'view' }]" @row-click="r => (selectedId = r.id)" @view="r => (selectedId = r.id)"
        @column-sort="view.onSort" @column-filter="view.onFilter" />
      <div v-if="!rows.length" class="empty-state">Chưa có ai có Điểm BA trong tháng {{ monthLabelOf(month) }}.</div>
    </div>

    <!-- Chi tiết 1 BA -->
    <Teleport to="body">
      <Transition name="pd-drawer">
        <aside v-if="selected" class="pd-drawer" tabindex="-1" v-resizable-drawer="{ key: 'report-ba', min: 480 }">
          <div class="pd-drawer__head">
            <div class="pd-drawer__title">
              <span class="card-title">{{ userName(selected.id) }}</span>
              <AppTag :label="selected.closing ? 'Đã chốt' : 'Chưa chốt'" :color="selected.closing ? 'success' : 'neutral'" :dot="true" />
            </div>
            <button class="btn-icon" type="button" v-tip="'Đóng'" aria-label="Đóng" @click="selectedId = null"><TIcon name="x" /></button>
          </div>
          <div class="pd-drawer__sum">
            <span>Tháng {{ monthLabelOf(month) }}</span><span>·</span>
            <span>Điểm BA tháng <strong>{{ fmt(selected.total) }}</strong></span><span>·</span>
            <span>Tiến độ {{ pct(selected.progressRate) }}</span><span>·</span><span>Chất lượng {{ pct(selected.qualityRate) }}</span>
          </div>
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
  </div>
</template>

<script setup>
import { vTip } from '@mds/utils/tooltip.js'
import { fmtNum } from '@mds/utils/number.js'
import StatChips from './StatChips.vue'
import TablePaging from '@mds/components/TablePaging.vue'
import { baItemStats } from '../store/detailStats.js'
import { avatarOf } from '../store/avatar.js'
import { useEscClose } from '@mds/utils/escStack.js'
import { vResizableDrawer } from '@mds/utils/resizableDrawer.js'
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import TIcon     from '@mds/components/TIcon.vue'
import AppTag    from '@mds/components/AppTag.vue'
import DataTable from '@mds/components/DataTable.vue'
import { sumBy } from '@mds/utils/tableTotals.js'
import InfoTip   from './InfoTip.vue'
import TaskDrawer from './TaskDrawer.vue'
import UpcomingTasks from './UpcomingTasks.vue'
import { currentTheme } from '@mds/theme.js'
import { ratingChartColors } from '../store/ratingColors.js'
import { chartColors } from '@mds/utils/chartColors.js'
import { db, userById, userName, canSeeTask, baClosingFor, projectById, ensureMonthTasks, baMonthTasks } from '../store/db.js'
import { baItemsOf, baItemOf, baMonthSummary, monthLabelOf, formatDate, round } from '../store/scoring.js'
import { BA_QUALITY_LEVELS, BA_UNRATED, baConfigOf } from '../store/baScoring.js'
import { useTableView } from '../store/useTableView.js'

const props = defineProps({
  month:     { type: String, required: true },
  projectId: { type: String, default: '' },   // '' = tất cả dự án
})
watch([() => props.month, () => db.loadGen], ([m]) => ensureMonthTasks(m), { immediate: true })   // tải công việc của tháng đang xem
const fmt = n => (n == null ? '—' : fmtNum(n))
const pct = n => (n == null ? '—' : `${fmtNum(n, { decimals: 2 })}%`)
const inProject = i => !props.projectId || i.projectId === props.projectId

/* Người có Điểm BA trong tháng (việc mình xem được) + người đã có bản chốt BA tháng này */
const people = computed(() => {
  const ids = new Set(baMonthTasks(props.month).filter(t => canSeeTask(t) && inProject(t) && baItemsOf(props.month, t.baId, [t]).length).map(t => t.baId))
  db.baClosings.filter(c => c.month === props.month && c.items.some(inProject)).forEach(c => ids.add(c.baId))
  return [...ids].filter(id => userById(id)?.status !== 'disabled')
})
const all = computed(() => people.value.map(id => {
  const closing = baClosingFor(props.month, id) ?? null
  const items = (closing ? closing.items : baItemsOf(props.month, id, baMonthTasks(props.month)).map(t => baItemOf(t, db.config))).filter(inProject)
  return { id, closing, items, ...baMonthSummary(items) }
}))

const COLUMNS = [
  { key: 'person',   label: 'Nhân viên',        type: 'avatar-subtext', minWidth: 220 },
  { key: 'total',    label: 'Điểm BA tháng',    width: 150, align: 'right' },
  { key: 'count',    label: 'Số việc',          width: 100, align: 'right' },
  { key: 'point',    label: 'Point năng suất',  width: 150, align: 'right' },
  { key: 'progress', label: 'Hệ số tiến độ',    width: 140, align: 'right' },
  { key: 'quality',  label: 'Hệ số chất lượng', width: 160, align: 'right' },
  { key: 'missing',  label: 'Thiếu dữ liệu',    type: 'status', width: 150 },
  { key: 'closed',   label: 'Chốt điểm',        type: 'status', width: 130 },
]
const rows = computed(() => all.value.map(r => ({
  id: r.id, _sort: { total: r.total, count: r.count, point: r.point, progress: r.progressRate ?? -1, quality: r.qualityRate ?? -1, missing: r.missing },
  person: { text: userName(r.id), subtext: userById(r.id)?.code || '', avatar: avatarOf(userById(r.id)) },
  total: fmt(r.total), count: r.count, point: fmt(r.point), progress: pct(r.progressRate), quality: pct(r.qualityRate),
  missing: r.missing ? { label: `${r.missing} việc`, color: 'warning' } : { label: 'Đủ', color: 'success' },
  closed: r.closing ? { label: 'Đã chốt', color: 'success' } : { label: 'Chưa chốt', color: 'neutral' },
})))
const view = useTableView(rows, { sortValue: (r, k) => r._sort[k] ?? (r[k]?.label ?? r[k]?.text ?? r[k]) })

/* KPI */
const kpis = computed(() => {
  const s = baMonthSummary(all.value.flatMap(r => r.items))
  const scored = all.value.filter(r => r.total > 0)   // trung bình bỏ BA 0 điểm (chưa dùng / chưa có việc)
  return [
    { label: 'Điểm BA tháng',     value: fmt(s.total), sub: `${all.value.length} người có điểm`, icon: 'chart-bar', theme: 'purple' },
    { label: 'Điểm TB / BA',      value: scored.length ? fmt(scored.reduce((a, r) => a + r.total, 0) / scored.length) : '—', sub: scored.length ? `Trên ${scored.length} BA có điểm (bỏ 0 điểm)` : 'Chưa có BA có điểm', icon: 'math-avg', theme: 'brand' },
    { label: 'Việc hoàn thành',   value: s.count, sub: s.missing ? `${s.missing} việc thiếu dữ liệu chấm` : 'Đủ dữ liệu chấm', icon: 'circle-check', theme: s.missing ? 'warning' : 'success' },
    { label: 'Hệ số tiến độ',     value: pct(s.progressRate), sub: 'Point đúng hạn ÷ Point năng suất', icon: 'clock', theme: 'blue' },
    { label: 'Hệ số chất lượng',  value: pct(s.qualityRate), sub: 'Bình quân theo BA Point', icon: 'star', theme: 'pink' },
  ]
})

/* Chi tiết */
const selectedId = ref(null), taskId = ref(null)
watch(() => [props.month, props.projectId], () => { selectedId.value = null; taskId.value = null })
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
  id: i.taskId, pbi: i.pbi, content: i.content, point: i.baPoint === '' ? '—' : i.baPoint, done: formatDate(i.baCompletedDate),
  progress: i.progressRate == null ? '—' : `${i.progressRate}%`, quality: i.qualityRate == null ? '—' : `${i.qualityRate}%`, actual: fmt(i.actual),
  progressPoint: i.progressRate == null ? '—' : fmt(i.progressPoint), qualityPoint: i.qualityRate == null ? '—' : fmt(i.qualityPoint),
  project: projectById(i.projectId)?.name ?? '',
})))

const detailView = useTableView(detailRows, { sortValue: (r, k) => (r[k]?.label ?? r[k]?.text ?? r[k]) })
watch(selectedId, () => { detailView.page.value = 1 })

/* ── Biểu đồ (ECharts, tải khi cần) — cột: màu chính theo theme · bánh: màu trạng thái cố định ── */
const barEl = ref(null), pieEl = ref(null)
let bar = null, pie = null
const FONT = 'InterVariable, "Inter var", sans-serif'
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
function render() {
  if (!bar || !pie) return
  const list = [...all.value].sort((a, b) => b.total - a.total)
  const axisLabel = { fontFamily: FONT, color: cssVar('--text-secondary'), fontSize: 11, formatter: v => (typeof v === 'number' ? fmtNum(v) : v) }
  bar.setOption({
    grid: { top: 16, right: 16, bottom: 28, left: 44 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => fmtNum(v) },
    xAxis: { type: 'category', data: list.map(r => userName(r.id)), axisTick: { show: false }, axisLine: { lineStyle: { color: cssVar('--stroke-neutral-light') } }, axisLabel },
    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, axisLabel, splitLine: { lineStyle: { color: cssVar('--stroke-neutral-light'), type: 'dashed' } } },
    series: [{ name: 'Điểm BA tháng', type: 'bar', barMaxWidth: 32, data: list.map(r => r.total), itemStyle: { color: chartColors(currentTheme.value, 'palette')[0], borderRadius: [4, 4, 0, 0] } }],
  }, { notMerge: true })
  const cfg = baConfigOf(db.config), items = all.value.flatMap(r => r.items)
  // Màu = màu TAG của mức chất lượng, từ bộ Chart Colors của theme — ĐỒNG NHẤT với donut mức đánh giá PD (store/ratingColors.js):
  // Gần như đạt ngay = brand (như Hài lòng) · Dùng ngay, cần bổ sung = cam · Sửa đáng kể = đỏ (như Không hài lòng) · Chưa đánh giá = xám
  const RC = ratingChartColors(currentTheme.value)
  const data = [
    ...BA_QUALITY_LEVELS.map(q => ({ name: `${cfg.quality[q.value]}% — ${q.value}`, value: items.filter(it => it.baQuality === q.value).length, itemStyle: { color: RC[q.color] } })),
    { name: BA_UNRATED, value: items.filter(i => !i.baQuality).length, itemStyle: { color: RC.neutral } },
  ].filter(d => d.value).sort((a, b) => b.value - a.value)   // miếng lớn nhất từ 12 giờ, nhỏ dần theo chiều kim đồng hồ
  pie.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { fontFamily: FONT, fontSize: 12, color: cssVar('--text-secondary') } },
    series: [{ type: 'pie', radius: ['48%', '72%'], center: ['50%', '42%'], startAngle: 90, clockwise: true, label: { show: false }, labelLine: { show: false },
      itemStyle: { borderRadius: [4, 0], borderColor: '#fff', borderWidth: 2 }, data }],
  }, { notMerge: true })
}
const onResize = () => { bar?.resize(); pie?.resize() }
onMounted(async () => {
  const echarts = await import('echarts')
  if (!barEl.value) return
  bar = echarts.init(barEl.value); pie = echarts.init(pieEl.value)
  render()
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => { window.removeEventListener('resize', onResize); bar?.dispose(); pie?.dispose() })
watch(all, () => nextTick(render), { deep: true })
watch(currentTheme, () => nextTick(render))
useEscClose(() => { selectedId.value = null }, () => !!selectedId.value)   // ESC đóng drawer chi tiết
</script>

<style scoped>
.card__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.chart-area { height: 260px; margin-top: var(--card-gap); }
.card-title { font-size: var(--text-h3); font-weight: var(--fw-semibold); line-height: var(--text-h3-lh); color: var(--text-primary); }
.table-card { flex-shrink: 0; background: var(--bg-white); border-radius: var(--radius-card); box-shadow: var(--shadow-card); overflow: hidden; }
.table-card__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: var(--card-py) var(--card-px) var(--card-gap); }
.table-card__title { display: flex; flex-direction: column; gap: 2px; }
.table-card__hint { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.empty-state { padding: 24px; text-align: center; font-size: var(--text-body); color: var(--text-secondary); }
.pd-drawer { position: fixed; z-index: 890; top: var(--layout-header-h); right: var(--side-panel-w, 0px); bottom: 0;   /* chat / AVA mở → neo theo mép trang đã co */ width: 760px; max-width: 100vw; display: flex; flex-direction: column; background: var(--bg-white); box-shadow: var(--shadow-dialog); outline: none; }
.pd-drawer__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: var(--card-py) var(--card-px) 4px; }
.pd-drawer__title { display: flex; align-items: center; gap: 8px; min-width: 0; }
.pd-drawer__sum { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 var(--card-px) var(--card-gap); font-size: var(--text-body); color: var(--text-secondary); }
.pd-drawer__sum strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.pd-drawer__list { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: auto; }
.pd-drawer__list > .datatable { flex: 1 1 auto; min-height: 0; overflow: auto; }   /* bảng tự cuộn → dòng Tổng ghim đáy */
.pd-drawer-enter-active, .pd-drawer-leave-active { transition: transform 0.2s ease; }
.pd-drawer-enter-from, .pd-drawer-leave-to { transform: translateX(100%); }
.pd-drawer__stats { padding: 0 var(--card-px) var(--card-gap); }
</style>
