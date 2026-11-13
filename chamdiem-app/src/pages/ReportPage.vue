<template>
  <AppShell>
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title h2">Tổng quan</h1>
        <!-- Báo cáo theo vai trò: PD → chỉ PD · BA → chỉ BA · vai trò khác → cả hai -->
        <div v-if="roleTabs.length > 1" class="role-switch" role="tablist" aria-label="Báo cáo của">
          <button v-for="r in roleTabs" :key="r" type="button" class="role-switch__btn" :class="{ 'role-switch__btn--on': role === r }" role="tab" :aria-selected="role === r" @click="role = r">Báo cáo {{ r }}</button>
        </div>
      </div>
      <div class="page-header__right">
        <!-- Tháng: lùi / tiến nhanh từng tháng, vẫn xổ chọn được -->
        <div class="month-nav">
          <button class="btn-icon btn-icon--outline" type="button" v-tip="'Tháng trước'" aria-label="Tháng trước" @click="month = shiftMonth(month, -1)"><TIcon name="chevron-left" /></button>
          <AppCombobox :clearable="false" v-model="month" class="hdr-box" :options="monthOptions" icon-left="calendar" />
          <button class="btn-icon btn-icon--outline" type="button" v-tip="'Tháng sau'" aria-label="Tháng sau" :disabled="month >= thisMonth" @click="month = shiftMonth(month, 1)"><TIcon name="chevron-right" /></button>
        </div>
        <AppCombobox :clearable="false" v-model="projectFilter" class="hdr-box hdr-box--wide" :options="projectOptions" />
      </div>
    </div>

    <!-- Hôm nay của bạn (điểm tháng + dự báo · việc cần làm · AVA gợi ý · thành tựu) — đầu trang, mỗi lúc chỉ 1 bản theo báo cáo đang xem -->
    <BaReportPanel v-if="role === 'BA'" :month="month" :project-id="projectFilter === ALL ? '' : projectFilter"><ClosingReminder /><TodayPanel /><FavProjects /></BaReportPanel>
    <div v-show="role === 'PD'" class="content-wrapper">
      <ClosingReminder v-if="role === 'PD'" />
      <TodayPanel v-if="role === 'PD'" />
      <FavProjects />
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
          <div class="card__head"><span class="card-title">Điểm và điểm kỳ vọng theo PD</span></div>
          <div ref="barEl" class="chart-area" />
        </div>
        <div class="card">
          <div class="card__head"><span class="card-title">Phân bổ mức đánh giá</span></div>
          <div ref="pieEl" class="chart-area" />
        </div>
        <!-- Cột 3: việc của tôi sắp đến hạn -->
        <UpcomingTasks :project-id="projectFilter === ALL ? '' : projectFilter" phase="design" />
      </div>

      <div class="table-card">
        <div class="table-card__head">
          <div class="table-card__title">
            <span class="card-title">Tổng hợp theo PD
              <InfoTip text="Điểm tháng = tổng Điểm sau đánh giá các công việc có Ngày hoàn thành trong tháng (việc chưa đánh giá = 0 điểm). Điểm kỳ vọng = Effort % × Điểm kỳ vọng level × Ngày làm thực tế ÷ Ngày làm việc của tháng. PD đã chốt hiển thị theo bảng điểm và thông số (nghỉ lễ, ngày làm thực tế, effort) do quản lý trực tiếp nhập khi chốt; chưa chốt tạm tính đủ ngày, effort 100%." />
            </span>
            <span class="table-card__hint">{{ scopeHint }}</span>
          </div>
        </div>
        <DataTable
          :columns="summaryCols"
          :line-count="0"
          :show-footer="summaryRows.length > 0"
          :rows="summaryView.processed.value"
          :hide-blank-rows="false"
          :selected="selectedPd ? [selectedPd] : []"
          :row-actions="[{ icon: 'eye', title: 'Xem chi tiết', emit: 'view' }]"
          @row-click="r => selectedPd = r.id"
          @view="r => selectedPd = r.id"
          @column-sort="summaryView.onSort"
          @column-filter="summaryView.onFilter"
        />
        <div v-if="!summaryRows.length" class="empty-state">Chưa có PD nào trong phạm vi xem.</div>
      </div>

    </div>

    <!-- Chi tiết PD: popup toàn màn hình — trái: danh sách nhân viên (bấm / ↑↓ để chuyển), phải: chi tiết người đang chọn -->
    <Teleport to="body">
      <div v-if="selected" class="pdp-pdview" role="dialog" aria-modal="true">
        <div class="pdp-pdview__head">
          <span class="pdp-pdview__title">Chi tiết điểm PD – tháng {{ monthLabel }}</span>
          <button class="btn-icon btn-icon--outline" v-tip="'Đóng (Esc)'" aria-label="Đóng (Esc)" @click="selectedPd = null"><TIcon name="x" /></button>
        </div>
        <div class="pdp-pdview__body">
          <aside class="pdp-pdview__list">
            <div class="pdp-pdview__search"><AppSearchbox v-model="pdSearch" placeholder="Tìm nhân viên" /></div>
            <div ref="pdListEl" class="pdp-pdview__items">
              <button v-for="r in pdListRows" :key="r.id" type="button" class="pdp-pdview__item" :class="{ 'pdp-pdview__item--on': r.id === selectedPd }" @click="selectedPd = r.id">
                <UserAvatar class="pdp-pdview__avatar" :name="r.pd.text" :picture="r.pd.avatar" />
                <span class="pdp-pdview__text">
                  <span class="pdp-pdview__name">{{ r.pd.text }}</span>
                  <span class="pdp-pdview__sub">{{ fmtNum(r.final) }} điểm<template v-if="r.rate"> · {{ r.rate.label }}</template> · {{ r.closed.label }}</span>
                </span>
              </button>
              <p v-if="!pdListRows.length" class="pdp-pdview__empty">Không tìm thấy nhân viên</p>
            </div>
          </aside>
          <section class="pdp-pdview__detail">
            <div class="table-card">
        <div class="table-card__head">
          <div class="pd-head">
            <span class="card-title">{{ userName(selected.pdId) }} – tháng {{ monthLabel }}</span>
            <AppTag :label="selected.closing ? 'Đã chốt' : 'Chưa chốt'" :color="selected.closing ? 'success' : 'neutral'" :dot="true" />
          </div>
          <div class="pd-head">
            <button v-if="canReopenPd(selected.pdId) || canClosePd(selected.pdId)" class="btn btn--outline btn--neutral"
              @click="router.push({ path: '/chot-diem', query: { thang: month, pd: selected.pdId } })"><TIcon name="lock" />Đến Tổng hợp điểm</button>
          </div>
        </div>

        <div class="pd-params">
          <p v-if="selected.closing" class="rule-note rule-note--closed">
            <TIcon name="lock" />
            <span>Đã chốt lúc <strong>{{ formatDateTime(selected.closing.closedAt) }}</strong> bởi <strong>{{ userName(selected.closing.closedBy) }}</strong>.
            Số liệu giữ nguyên theo hệ số và thông số tại thời điểm chốt; công việc của PD trong tháng bị khóa chỉnh sửa.</span>
          </p>
          <div class="pd-params__row">
            <AppInput v-for="f in PARAM_FIELDS" :key="f.key" :label="f.label" class="pd-params__field">
              <span class="pd-params__value">{{ selected[f.key] }}</span>
            </AppInput>
            <div class="pd-params__result">
              <span class="pd-params__label">Điểm kỳ vọng</span>
              <span class="pd-params__num">{{ selected.expected ?? '–' }}</span>
              <span class="pd-params__label">· Tỷ lệ đạt</span>
              <AppTag v-if="selected.rate != null" :label="selected.rate + '%'" :color="rateColor(selected.rate)" />
              <span v-else class="pd-params__num">–</span>
            </div>
          </div>
          <span v-if="!selected.closing" class="table-card__hint">Chưa chốt — tạm tính đủ ngày, effort 100%. Quản lý trực tiếp nhập thông số thật khi chốt.</span>
        </div>

        <!-- Thống kê nhanh + bảng việc có phân trang (dòng Tổng tính trên TOÀN BỘ việc) -->
        <StatChips v-if="detailRows.length" class="pd-detail-stats" :items="pdTaskStats(selected.tasks)" />
        <DataTable v-if="detailRows.length" :columns="detailCols" :rows="detailView.paged.value" :hide-blank-rows="false" :show-footer="true"
          :selected="drawerTaskId ? [drawerTaskId] : []" @row-click="r => drawerTaskId = r.id"
          @column-sort="detailView.onSort" @column-filter="detailView.onFilter" />
        <TablePaging v-if="detailRows.length" :total="detailView.processed.value.length" v-model:page="detailView.page.value" v-model:page-size="detailView.pageSize.value" />
        <div v-else class="empty-state">PD chưa có công việc nào có ngày hoàn thành trong tháng này{{ selected.full ? '' : ' (trong các dự án bạn tham gia)' }}.</div>
            </div>
          </section>
        </div>
      </div>
    </Teleport>
    <TaskDrawer :task-id="drawerTaskId" @close="drawerTaskId = null" />
  </AppShell>
</template>

<script setup>
import { isPdRole } from '../store/scoring.js'
import { vTip } from '@mds/utils/tooltip.js'
import { fmtNum } from '@mds/utils/number.js'
import StatChips from '../components/StatChips.vue'
import TablePaging from '@mds/components/TablePaging.vue'
import { pdTaskStats } from '../store/detailStats.js'
import { avatarOf } from '../store/avatar.js'
import { useEscClose } from '@mds/utils/escStack.js'
import { matchText } from '@mds/utils/search.js'
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell       from '../components/AppShell.vue'
import TaskDrawer     from '../components/TaskDrawer.vue'
import UserAvatar     from '../components/UserAvatar.vue'
import AppSearchbox   from '@mds/components/AppSearchbox.vue'
import { useDocTitle } from '@mds/utils/docTitle.js'
import InfoTip        from '../components/InfoTip.vue'
import TIcon        from '@mds/components/TIcon.vue'
import AppTag       from '@mds/components/AppTag.vue'
import AppInput     from '@mds/components/AppInput.vue'
import DataTable    from '@mds/components/DataTable.vue'
import TodayPanel   from '../components/TodayPanel.vue'
import ClosingReminder from '../components/ClosingReminder.vue'
import { sumBy } from '@mds/utils/tableTotals.js'
import AppCombobox  from '@mds/components/AppCombobox.vue'
import { seesAllPd, viewsAllPd, reportRoleTabs,
  db, currentUser, isAdmin, myProjects, myTeam, projectById, userById, userName as baseName, membersOf, isManagerOf, managerIdsOf, primaryProjectIdsOf,
  canSeeTask, canSeeReportOf, canClosePd, canReopenPd, closingFor,
  monthParams, pdParams, pdWorkingDays, ensureMonthTasks, knownTaskMonths, performerSet, taskById, pdMonthTasks, leadItemsFor, isPdLead } from '../store/db.js'
import { backend } from '../store/api.js'
import {
  QUALITY_RATINGS, computeScore, computeFinalScore, countsInMonth, expectedScore, achievementRate,
  formatDate, formatDateTime, monthLabelOf, qualityColor, round,
  workingDaysOf,
  reasonMissing, sortRatingKeys, DEFAULT_BUSINESS, leadTotalOf } from '../store/scoring.js'
import { useTableView } from '../store/useTableView.js'
import { currentTheme } from '@mds/theme.js'
import { ratingChartColors } from '../store/ratingColors.js'
import { chartColors } from '@mds/utils/chartColors.js'
import BaReportPanel from '../components/BaReportPanel.vue'
import FavProjects from '../components/FavProjects.vue'
import UpcomingTasks from '../components/UpcomingTasks.vue'
import { userPref } from '../store/userPrefs.js'
const rolePref = userPref('report-role', 'PD')
const roleTabs = computed(() => reportRoleTabs())   // + bộ phận mình là Quản trị PD / BA
const role = computed({ get: () => (roleTabs.value.includes(rolePref.value) ? rolePref.value : roleTabs.value[0]), set: v => { rolePref.value = v } })
import { downloadCsv } from '../store/csv.js'

/* Người đã bị xóa nhưng còn bản chốt → vẫn hiện để Quản trị mở chốt */
const userName = id => baseName(id) || (id ? 'Người dùng đã xóa' : '')

/* ── Bộ chọn tháng / dự án ── */
const thisMonth = new Date().toISOString().slice(0, 7)
const route = useRoute()
const router = useRouter()
const month = ref(/^\d{4}-\d{2}$/.test(route.query.thang ?? '') ? route.query.thang : thisMonth)
const shiftMonth = (ym, n) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
const monthOptions = computed(() => {
  const set = new Set([thisMonth, month.value, ...knownTaskMonths()])   // tháng đang xem luôn có trong danh sách (kể cả tháng chưa có dữ liệu / chưa tải)
  db.closings.forEach(c => set.add(c.month))
  return [...set].sort().reverse().map(ym => ({ value: ym, label: 'Tháng ' + monthLabelOf(ym) }))
})
const monthLabel = computed(() => monthLabelOf(month.value))
watch([month, () => db.loadGen], ([m]) => ensureMonthTasks(m), { immediate: true })   // tải công việc của tháng đang xem
const params = computed(() => monthParams(month.value))

/* Dự án trong phạm vi: dự án mình tham gia + dự án có công việc của người mình quản lý trực tiếp */
const ALL = '__all'
const projectFilter = ref(ALL)
const scopeProjects = computed(() => {
  const ids = new Set(myProjects.value.map(p => p.id))
  db.tasks.forEach(t => canSeeTask(t) && ids.add(t.projectId))
  return db.projects.filter(p => ids.has(p.id))
})
const projectOptions = computed(() => [{ value: ALL, label: 'Tất cả dự án' }, ...scopeProjects.value.map(p => ({ value: p.id, label: p.name }))])
const inFilter = pid => projectFilter.value === ALL || pid === projectFilter.value

/** Xem trọn điểm của PD (mọi dự án → có điểm kỳ vọng, tỷ lệ đạt): chính mình, quản lý trực tiếp, Quản trị.
    Người khác chỉ thấy phần công việc trong dự án mình tham gia. */
function fullView(pdId) {
  const me = currentUser.value
  return !!me && (viewsAllPd() || me.id === pdId || isManagerOf(me, userById(pdId)))
}

/* ── Công việc được tính trong tháng ──
   PD đã chốt → đọc bảng điểm đã chốt; chưa chốt → tính trực tiếp theo hệ số hiện hành. */
const liveItems = computed(() => pdMonthTasks(month.value)
  .filter(t => t.pdId && countsInMonth(t, month.value, db.config) && canSeeTask(t))
  .map(t => ({ ...t, taskId: t.id, score: computeScore(t, db.config), final: computeFinalScore(t, db.config) })))

function itemsOf(pdId) {
  const c = closingFor(month.value, pdId)
  const src = c ? c.items.filter(i => i.pdId === pdId && canSeeTask(i)).map(i => ({ ...i, id: i.taskId })) : liveItems.value.filter(t => t.pdId === pdId)
  return src.filter(t => inFilter(t.projectId))
}

/* PD hiển thị: PD có điểm + thành viên PD các dự án trong phạm vi + PD mình quản lý trực tiếp */
const visiblePds = computed(() => {
  const ids = new Set(liveItems.value.map(t => t.pdId))
  db.closings.filter(c => c.month === month.value).forEach(c => (c.pdId ? [c.pdId] : c.items.map(i => i.pdId)).forEach(id => ids.add(id)))
  // Người thực hiện = bộ phận PD hoặc bộ phận khác có công việc được giao ở cột PD
  const performers = performerSet()
  const isPd = u => isPdRole(u?.role) || performers.has(u?.id)
  scopeProjects.value.filter(p => inFilter(p.id) && myProjects.value.includes(p)).forEach(p => membersOf(p.id).filter(isPd).forEach(u => ids.add(u.id)))
  if (projectFilter.value === ALL) myTeam.value.filter(isPd).forEach(u => ids.add(u.id))
  if (isPd(currentUser.value) && projectFilter.value === ALL) ids.add(currentUser.value.id)
  // PD Lead chỉ có điểm dẫn dắt (không tự vẽ việc nào trong tháng) vẫn hiện khi xem Tất cả dự án
  if (projectFilter.value === ALL) {
    if (backend.enabled) Object.entries(db.pdSummaries?.[month.value] ?? {}).forEach(([id, s]) => { if (s.lead > 0) ids.add(id) })
    else db.users.filter(u => isPdLead(u.id) && leadItemsFor(month.value, u.id).length).forEach(u => ids.add(u.id))
  }
  const closedIds = new Set(db.closings.filter(c => c.month === month.value).flatMap(c => (c.pdId ? [c.pdId] : c.items.map(i => i.pdId))))
  return [...ids].filter(id => id && (isPd(userById(id)) || closedIds.has(id)) && (canSeeReportOf(id) || viewsAllPd()))
})

const summary = computed(() => visiblePds.value.map(pdId => {
  const tasks = itemsOf(pdId)
  const closing = closingFor(month.value, pdId) ?? null
  const full = fullView(pdId)
  const showExpected = full && projectFilter.value === ALL
  const p = pdParams(month.value, pdId)
  // PD Lead: + điểm dẫn dắt (chỉ khi xem Tất cả dự án — điểm dẫn dắt tính trên việc của PD mình quản lý ở mọi dự án)
  const leadPts = projectFilter.value !== ALL ? 0
    : backend.enabled ? round(db.pdSummaries?.[month.value]?.[pdId]?.lead ?? 0) : leadTotalOf(leadItemsFor(month.value, pdId))
  const final = round(tasks.reduce((a, t) => a + t.final, 0) + leadPts)
  const expected = showExpected ? round(expectedScore(p, pdWorkingDays(month.value, pdId))) : null
  const ratings = {}
  tasks.forEach(t => { const k = t.qualityRating || 'Chưa đánh giá'; ratings[k] = (ratings[k] ?? 0) + 1 })
  return {
    pdId, tasks, final, leadPts, closing, full,
    score:   round(tasks.reduce((a, t) => a + t.score, 0)),
    screens: tasks.reduce((a, t) => a + (Number(t.mainScreens) || 0), 0),
    pbis:    tasks.length,
    unrated: tasks.filter(t => !t.qualityRating).length,
    actualDays: p.actualDays, target: p.target, effort: p.effort,
    expected, rate: showExpected ? achievementRate(final, expected) : null,
    ratings,
  }
}).sort((a, b) => b.final - a.final))

const countedTasks = computed(() => summary.value.flatMap(s => s.tasks))
const closedCount  = computed(() => summary.value.filter(s => s.closing).length)
const scopeHint = computed(() => {
  const me = currentUser.value
  if (viewsAllPd()) return 'Toàn bộ PD · điểm kỳ vọng / tỷ lệ đạt tính khi xem Tất cả dự án'
  const team = myTeam.value.length ? ' + người bạn quản lý trực tiếp' : ''
  return `PD trong các dự án bạn tham gia${team} · điểm kỳ vọng / tỷ lệ đạt chỉ hiện với bản thân, quản lý trực tiếp và Quản trị`
})

const kpis = computed(() => {
  const s = summary.value
  const total = round(s.reduce((a, x) => a + x.final, 0))
  const rates = s.map(x => x.rate).filter(r => r != null)
  const unrated = countedTasks.value.filter(t => !t.qualityRating).length
  const scored = s.filter(x => x.final > 0)   // trung bình bỏ PD 0 điểm (chưa dùng / chưa có việc)
  return [
    { label: 'Tổng điểm sau đánh giá', value: total, icon: 'trophy', theme: 'purple', sub: `${scored.length} PD có điểm · đã chốt ${closedCount.value}/${s.length}` },
    { label: 'Điểm TB / PD',           value: scored.length ? round(total / scored.length) : '–', icon: 'math-avg', theme: 'brand', sub: scored.length ? `Trên ${scored.length} PD có điểm (bỏ 0 điểm)` : 'Chưa có PD có điểm' },
    { label: 'Số PBI được tính',       value: countedTasks.value.length, icon: 'clipboard-check', theme: 'blue', sub: `${fmtNum(s.reduce((a, x) => a + x.screens, 0))} màn hình chính` },
    { label: 'Tỷ lệ đạt trung bình',   value: rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) + '%' : '–', icon: 'chart-bar', theme: 'success', sub: rates.length ? `${rates.filter(r => r >= 100).length}/${rates.length} PD đạt kỳ vọng` : 'Chưa có PD trong phạm vi tính' },
    { label: 'Việc chưa đánh giá',     value: unrated, icon: 'alert-triangle', theme: 'warning', sub: unrated ? 'Đang tính 0 điểm — cần PO/BA đánh giá' : 'Đã đánh giá đầy đủ' },
  ]
})

/* ── Bảng tổng hợp ── */
const rateColor = r => (r == null ? 'neutral' : r >= 100 ? 'success' : r >= 80 ? 'warning' : 'danger')
/* Thứ tự theo mức người xem quan tâm: điểm → đạt kỳ vọng chưa → đã chốt chưa → chất lượng → khối lượng → thông số tính → tổ chức */
/* Dòng Tổng: cộng trên các PD đang xem (đã lọc) — điểm trung bình / PD nằm ở thẻ KPI phía trên */
const sumOf = k => fmtNum(sumBy(summaryView.processed.value, r => Number(r[k]) || 0))
const summaryCols = computed(() => [
  { key: 'rank',       label: 'Hạng',              width: 88,  align: 'center', noFilter: true },
  { key: 'pd',         label: 'Nhân viên',         type: 'avatar-subtext', minWidth: 200 },
  { key: 'final',      label: 'Điểm',              width: 100, align: 'right', footerText: sumOf('final') },
  { key: 'leadPts',    label: 'Điểm dẫn dắt',      width: 140, align: 'right', footerText: sumOf('leadPts'), tip: 'PD Lead: % Điểm sau đánh giá các việc của PD mình quản lý trực tiếp — đã cộng vào Điểm (chỉ tính khi xem Tất cả dự án)' },
  { key: 'rate',       label: 'Tỷ lệ đạt',         type: 'status', width: 120 },
  { key: 'expected',   label: 'Điểm kỳ vọng',      width: 130, align: 'right', footerText: sumOf('expected') },
  { key: 'closed',     label: 'Chốt điểm',         type: 'status', width: 120 },
  { key: 'ratings',    label: 'Mức đánh giá',      type: 'tag', minWidth: 240, noFilter: true },
  { key: 'pbis',       label: 'Số PBI',            width: 100, align: 'right', footerText: sumOf('pbis') },
  { key: 'screens',    label: 'Màn hình chính',    width: 160, align: 'right', footerText: sumOf('screens') },
  { key: 'actualDays', label: 'Ngày làm thực tế',  width: 160, align: 'right' },
  { key: 'target',     label: 'Kỳ vọng level',     width: 130, align: 'right' },
  { key: 'effort',     label: 'Effort (%)',        width: 110, align: 'right' },
  { key: 'lead',       label: 'Quản lý trực tiếp', width: 190 },
  { key: 'primary',    label: 'Dự án phụ trách',   width: 190 },
])
const RATING_COLOR = { ...Object.fromEntries(QUALITY_RATINGS.map(r => [r.value, r.color])), 'Chưa đánh giá': 'neutral' }
const hide = (s, v) => (s.full ? v : '–')
const summaryRows = computed(() => summary.value.map((s, i) => ({
  id: s.pdId,
  rank: i + 1,
  pd: { text: userName(s.pdId), subtext: userById(s.pdId)?.code || userById(s.pdId)?.email, avatar: avatarOf(userById(s.pdId)) },
  closed: s.closing ? { label: 'Đã chốt', color: 'success' } : { label: 'Chưa chốt', color: 'neutral' },
  final: s.final, leadPts: s.leadPts || '–', screens: s.screens, pbis: s.pbis,
  actualDays: hide(s, s.actualDays), target: hide(s, s.target), effort: hide(s, s.effort),
  expected: s.expected == null ? '–' : s.expected,
  rate: s.rate == null ? null : { label: s.rate + '%', color: rateColor(s.rate) },
  _rate: s.rate ?? -1,
  lead: managerIdsOf(userById(s.pdId)).map(userName).join(', '),
  primary: primaryProjectIdsOf(userById(s.pdId)).map(id => projectById(id)?.name).filter(Boolean).join(', '),
  ratings: sortRatingKeys(Object.keys(s.ratings)).map(k => ({ label: `${k}: ${s.ratings[k]}`, color: RATING_COLOR[k] ?? 'neutral' })),   // Rất hài lòng · Không hài lòng · Chưa đánh giá · Hài lòng
})))
const summaryView = useTableView(summaryRows, {
  sortValue: (r, k) => (k === 'pd' ? r.pd.text : k === 'rate' ? r._rate : k === 'closed' ? r.closed.label : r[k]),
})

/* ── Chi tiết PD ── */
const selectedPd   = ref(route.query.pd || null)   // mở từ công việc đã chốt: ?thang=YYYY-MM&pd=…
const drawerTaskId = ref(null)
watch([month, projectFilter], () => { selectedPd.value = null; drawerTaskId.value = null })
watch(selectedPd, () => { drawerTaskId.value = null })
/* Popup chi tiết: danh sách nhân viên bên trái (cùng thứ tự bảng), tìm nhanh, ↑ ↓ để chuyển người */
const pdSearch = ref(''), pdListEl = ref(null)
const pdListRows = computed(() => summaryView.processed.value.filter(r => matchText([r.pd.text, r.pd.subtext], pdSearch.value)))
function onPdKey(e) {
  if (!selectedPd.value) return
  if (drawerTaskId.value) return
  if (!['ArrowDown', 'ArrowUp'].includes(e.key) || ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
  e.preventDefault()
  const list = pdListRows.value, i = list.findIndex(r => r.id === selectedPd.value)
  const next = list[Math.min(list.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))]
  if (next) { selectedPd.value = next.id; nextTick(() => pdListEl.value?.querySelector('.pdp-pdview__item--on')?.scrollIntoView({ block: 'nearest' })) }
}
// Bắt ở pha capture: chạy trước Esc của drawer → Esc lần 1 chỉ đóng drawer, lần 2 mới đóng popup
useEscClose(() => { selectedPd.value = null }, () => !!selectedPd.value)   // ESC: drawer công việc (lớp trên) đóng trước, rồi tới popup
onMounted(() => document.addEventListener('keydown', onPdKey, true))
onBeforeUnmount(() => document.removeEventListener('keydown', onPdKey, true))
watch(selectedPd, v => { document.body.style.overflow = v ? 'hidden' : ''; if (!v) pdSearch.value = '' })
onBeforeUnmount(() => { document.body.style.overflow = '' })
const selected = computed(() => summary.value.find(s => s.pdId === selectedPd.value) ?? null)
/* Tiêu đề tab khi mở chi tiết: Tên PD | Tổng quan | MISA Solution Point */
useDocTitle(() => (selected.value ? [userName(selected.value.pdId), 'Tổng quan'] : []))
const PARAM_FIELDS = [
  { key: 'actualDays', label: 'Số ngày làm việc thực tế' },
  { key: 'target',     label: 'Điểm kỳ vọng level' },
  { key: 'effort',     label: 'Effort (%)' },
]

const detailCols = computed(() => {
  const tasks = selected.value?.tasks ?? []
  const sum = k => fmtNum(sumBy(tasks, k))   // dòng Tổng: cộng trên toàn bộ việc (mds-ui tableTotals)
  return [
    // Ưu tiên điểm: được bao nhiêu → hài lòng không → thực nhận; thông tin khác + dự án ra sau
    { key: 'pbi',           label: 'PBI',               width: 100 },
    { key: 'content',       label: 'Nội dung',          minWidth: 260 },
    { key: 'score',         label: 'Điểm',              width: 90,  align: 'right', footerText: sum('score') },
    { key: 'qualityRating', label: 'Mức hài lòng',      type: 'tag', width: 160 },
    { key: 'finalScore',    label: 'Điểm thực nhận',    width: 150, align: 'right', footerText: sum('final') },
    { key: 'completedDate', label: 'Ngày hoàn thành',   width: 140 },
    { key: 'complexity',    label: 'Độ phức tạp thiết kế', width: 170 },
    { key: 'businessLevel', label: 'Hệ số nghiệp vụ',   width: 150 },
    { key: 'solutionBy',    label: 'Người đưa giải pháp', width: 170 },
    { key: 'screens',       label: 'Màn chính / phụ',   width: 140, align: 'right' },
    { key: 'project',       label: 'Dự án',             width: 170 },
  ]
})
const detailRows = computed(() => [...(selected.value?.tasks ?? [])]
  .sort((a, b) => a.completedDate.localeCompare(b.completedDate))
  .map(t => ({
    id: t.id,
    pbi: t.pbi ?? '',
    content: t.content,
    project: projectById(t.projectId)?.name,
    completedDate: formatDate(t.completedDate),
    complexity: t.complexity,
    businessLevel: t.businessLevel || DEFAULT_BUSINESS,
    solutionBy: t.solutionBy,
    screens: `${t.mainScreens} / ${t.subScreens}`,
    score: t.score,
    qualityRating: { label: t.qualityRating || 'Chưa đánh giá', color: t.qualityRating ? qualityColor(t.qualityRating) : 'neutral' },
    _mark: reasonMissing(taskById(t.id) ?? t) ? 'warning' : '',   // Rất / Không hài lòng mà chưa có lý do

    finalScore: t.final,
  })))

const detailView = useTableView(detailRows, { sortValue: (r, k) => (r[k]?.label ?? r[k]?.text ?? r[k]) })
watch(selectedPd, () => { detailView.page.value = 1 })
function exportCsv() {
  downloadCsv(`tong-hop-diem-${month.value}.csv`,
    ['Nhân viên', 'Tài khoản', 'Chốt điểm', 'Điểm', 'Tổng số lượng màn hình', 'Tổng số PBI', 'Số ngày làm việc thực tế trong tháng',
      'Điểm kỳ vọng level mới', 'Effort (%)', 'Điểm kỳ vọng theo effort và ngày làm việc', 'Tỷ lệ đạt (%)', 'Quản lý trực tiếp', 'Dự án phụ trách'],
    summaryView.processed.value.map(r => [r.pd.text, r.pd.subtext, r.closed.label, r.final, r.screens, r.pbis, r.actualDays, r.target, r.effort,
      r.expected, r.rate?.label?.replace('%', '') ?? '', r.lead, r.primary]))
}

/* ── Biểu đồ ── */
const barEl = ref(null)
const pieEl = ref(null)
let bar = null, pie = null
const FONT = 'InterVariable, "Inter var", sans-serif'
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim()

function renderCharts() {
  if (!bar || !pie) return
  const list = summary.value
  const axisLabel = { fontFamily: FONT, color: cssVar('--text-secondary'), fontSize: 11, formatter: v => (typeof v === 'number' ? fmtNum(v) : v) }
  const series = [
    { name: 'Điểm', type: 'bar', barMaxWidth: 32, data: list.map(s => s.final), itemStyle: { color: chartColors(currentTheme.value, 'palette')[0], borderRadius: [4, 4, 0, 0] } },   // màu đầu bộ Chart Colors của theme (/ds/data-visualization)
  ]
  if (projectFilter.value === ALL) series.push({
    name: 'Điểm kỳ vọng', type: 'line', data: list.map(s => s.expected), symbol: 'circle', symbolSize: 8,
    lineStyle: { color: cssVar('--chart-target'), width: 2, type: 'dashed' }, itemStyle: { color: cssVar('--chart-target'), borderColor: '#fff', borderWidth: 2 },
  })
  bar.setOption({
    grid: { top: 32, right: 16, bottom: 28, left: 44 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => fmtNum(v) },
    legend: { top: 0, right: 0, textStyle: { fontFamily: FONT, fontSize: 12, color: cssVar('--text-secondary') } },
    xAxis: { type: 'category', data: list.map(s => userName(s.pdId)), axisTick: { show: false }, axisLine: { lineStyle: { color: cssVar('--stroke-neutral-light') } }, axisLabel },
    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, axisLabel, splitLine: { lineStyle: { color: cssVar('--stroke-neutral-light'), type: 'dashed' } } },
    series,
  }, { notMerge: true })

  /* Màu donut = màu TAG của mức đánh giá, lấy từ bộ Chart Colors của theme — dùng chung với BA (store/ratingColors.js):
     Hài lòng = brand · Rất hài lòng = xanh lá · Không hài lòng = đỏ · Chưa đánh giá = xám (như tag Neutral) */
  const RC = ratingChartColors(currentTheme.value)
  const RATING_FILL = { ...Object.fromEntries(QUALITY_RATINGS.map(r => [r.value, RC[r.color]])), 'Chưa đánh giá': RC.neutral }
  // Quy tắc donut: miếng LỚN NHẤT bắt đầu từ 12 giờ, nhỏ dần theo chiều kim đồng hồ (kể cả “Chưa đánh giá”)
  const counts = [
    ...QUALITY_RATINGS.map(r => ({ name: r.value, value: countedTasks.value.filter(t => t.qualityRating === r.value).length, itemStyle: { color: RATING_FILL[r.value] } })),
    { name: 'Chưa đánh giá', value: countedTasks.value.filter(t => !t.qualityRating).length, itemStyle: { color: RATING_FILL['Chưa đánh giá'] } },
  ].sort((a, b) => b.value - a.value)
  pie.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { fontFamily: FONT, fontSize: 12, color: cssVar('--text-secondary') } },
    series: [{
      type: 'pie', radius: ['48%', '72%'], center: ['50%', '42%'], startAngle: 90, clockwise: true,
      label: { show: false }, labelLine: { show: false },
      itemStyle: { borderRadius: [4, 0], borderColor: '#fff', borderWidth: 2 },
      data: counts.filter(c => c.value),
    }],
  }, { notMerge: true })
}

const onResize = () => { bar?.resize(); pie?.resize() }
onMounted(async () => {
  const echarts = await import('echarts')   // thư viện biểu đồ ~1 MB: chỉ tải khi vào màn này
  await nextTick()
  if (!barEl.value) return
  bar = echarts.init(barEl.value); bar.setOption({ textStyle: { fontFamily: FONT } })
  pie = echarts.init(pieEl.value); pie.setOption({ textStyle: { fontFamily: FONT } })
  renderCharts()
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  bar?.dispose(); pie?.dispose()
})
watch([summary, countedTasks], renderCharts)
watch(currentTheme, () => nextTick(renderCharts))
watch(role, v => { if (v === 'PD') nextTick(() => { onResize(); renderCharts() }) })   // biểu đồ PD vẽ lại khi quay về tab PD   // đổi theme → vẽ lại theo màu mới
</script>

<style scoped>
.role-switch { display: inline-flex; margin-left: 8px; padding: 2px; gap: 2px; border-radius: var(--radius-default); background: var(--bg-neutral-light); }   /* sát tiêu đề trang: 8px gap + 8px = 16px */
.role-switch__btn { font-weight: var(--fw-semibold); height: calc(var(--btn-height) - 4px); padding: 0 12px; border: none; border-radius: calc(var(--radius-default) - 2px); background: transparent;
  font-family: inherit; font-size: var(--text-body); color: var(--text-primary); cursor: pointer; white-space: nowrap; }
.role-switch__btn:hover:not(.role-switch__btn--on) { color: var(--text-primary); background: var(--bg-brand-light); }
.role-switch__btn--on { background: var(--bg-white); color: var(--text-brand); box-shadow: var(--shadow-sm); }
.pdp-pdview { position: fixed; inset: 0 var(--side-panel-w, 0px) 0 0; z-index: 850; display: flex; flex-direction: column; background: var(--bg-page); }
.pdp-pdview__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; height: 56px; padding: 0 16px 0 24px; flex-shrink: 0; background: var(--bg-white); border-bottom: 1px solid var(--stroke-neutral-light); }
.pdp-pdview__title { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.pdp-pdview__body { flex: 1; min-height: 0; display: flex; gap: 16px; padding: 16px; }
.pdp-pdview__list { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; min-height: 0; background: var(--bg-white); border-radius: var(--radius-card); box-shadow: var(--shadow-card); overflow: hidden; }
.pdp-pdview__search { padding: 12px 12px 8px; }
.pdp-pdview__items { flex: 1; min-height: 0; overflow-y: auto; padding: 0 0 8px; display: flex; flex-direction: column; }
.pdp-pdview__item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; border: none; border-left: 3px solid transparent; background: transparent; text-align: left; cursor: pointer; font-family: inherit; }
.pdp-pdview__item:hover { background: var(--bg-brand-light); }
.pdp-pdview__item--on { background: var(--bg-brand-light); border-left-color: var(--stroke-brand); }
.pdp-pdview__item--on .pdp-pdview__name { color: var(--text-brand); }
.pdp-pdview__avatar { width: 32px; height: 32px; flex-shrink: 0; border-radius: var(--radius-pill); display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: var(--fw-semibold); }
.pdp-pdview__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pdp-pdview__name { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pdp-pdview__sub { font-size: var(--text-body); color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pdp-pdview__empty { padding: 8px 12px; font-size: var(--text-body); color: var(--text-secondary); }
.pdp-pdview__detail { flex: 1; min-width: 0; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; }
/* Bảng việc tự cuộn trong phần còn lại → tiêu đề ghim trên, dòng Tổng ghim dưới; thông tin người + phân trang đứng yên (màn thấp: cả khung cuộn, bảng vẫn cao tối thiểu 240px) */
.pdp-pdview__detail > .table-card { flex: 1 0 auto; min-height: 0; display: flex; flex-direction: column; }
.pdp-pdview__detail > .table-card > :not(.datatable) { flex-shrink: 0; }
.pdp-pdview__detail > .table-card > .datatable { flex: 1 1 0; min-height: 240px; overflow: auto; }

.hdr-box { width: 180px; }
.month-nav { display: flex; align-items: center; gap: 8px; }
.month-nav .btn-icon:disabled { opacity: 0.4; cursor: not-allowed; }
.hdr-box--wide { width: 200px; }

.rule-note {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  font-size: var(--text-body); color: var(--text-secondary);
}
.rule-note strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.rule-note--closed {
  padding: 8px 12px; border-radius: var(--radius-default);
  background: var(--bg-success-light); color: var(--text-primary);
}


.pd-head { display: flex; align-items: center; gap: 8px; }
.pd-params__label { font-size: var(--text-body); color: var(--text-secondary); white-space: nowrap; }
.pd-params__num { font-size: var(--text-body-md); font-weight: var(--fw-semibold); color: var(--text-primary); font-feature-settings: 'tnum' 1; }
.card-title .info-tip { margin-left: 4px; vertical-align: middle; }
.pd-params { display: flex; flex-direction: column; gap: 8px; padding: 0 var(--card-px) var(--card-gap); }
.pd-params__row { display: flex; align-items: flex-end; gap: var(--form-col-gap-sm); flex-wrap: wrap; }
.pd-params__field { width: 200px; }
.pd-params__value { display: flex; align-items: center; height: var(--input-height); font-size: var(--text-body-md); font-weight: var(--fw-semibold); font-feature-settings: 'tnum' 1; }
.pd-params__result { display: flex; align-items: center; gap: 8px; height: var(--input-height); }
  /* chừa chỗ cho icon absolute */

.card__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.card-title { font-size: var(--text-h3); font-weight: var(--fw-semibold); line-height: var(--text-h3-lh); color: var(--text-primary); }
.chart-area { height: 260px; margin-top: var(--card-gap); }

.table-card {
  flex-shrink: 0;
  background: var(--bg-white); border-radius: var(--radius-card); box-shadow: var(--shadow-card);
  overflow: hidden;
}
.table-card__head {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: var(--card-py) var(--card-px) var(--card-gap);
}
.table-card__title { display: flex; flex-direction: column; gap: 2px; }
.table-card__hint { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }

.pd-detail-stats { padding: 0 var(--card-px) var(--card-gap); }
</style>
