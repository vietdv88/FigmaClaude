<template>
  <AppShell>
    <!-- Khung trang chuẩn (giống Dự án): page-header → sub-nav (tab tháng của năm đang chọn, mới nhất bên trái) -->
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title h2">Tổng hợp điểm</h1>
        <!-- Tổng hợp điểm theo vai trò: PD (như cũ) · BA (Điểm thực nhận) — nút chốt vẫn là “Chốt điểm” -->
        <div v-if="roleTabs.length > 1" class="role-switch" role="tablist" aria-label="Tổng hợp điểm cho">
          <button v-for="r in roleTabs" :key="r" type="button" class="role-switch__btn" :class="{ 'role-switch__btn--on': role === r }" role="tab" :aria-selected="role === r" @click="role = r">Điểm {{ r }}</button>
        </div>
      </div>
      <div class="page-header__right">
        <AppCombobox :model-value="year" class="year-box" :options="yearOptions" icon-left="calendar" :clearable="false" @update:model-value="setYear" />
      </div>
    </div>
    <div class="sub-nav">
      <SubNavTabs :items="tabMonths.map(m => ({ id: m, label: `Tháng ${m.slice(5)}`, tag: pendingOf(m) ? `${pendingOf(m)} chưa chốt` : '' }))" :model-value="month" @select="setMonth">
        <template #tab="{ item }">{{ item.label }}<span v-if="pendingOf(item.id)" class="tab-pending" v-tip="`Còn ${pendingOf(item.id)} người chưa chốt`" /></template>
      </SubNavTabs>
    </div>

    <BaClosingPanel v-if="role === 'BA'" :month="month" :months="allMonths" />
    <div v-else class="content-wrapper content-wrapper--fill">
      <div v-if="!scopeIds.length" class="card empty-card">
        <p class="empty-card__text">Chưa có PD nào để xem điểm.</p>
        <p class="empty-card__hint">Bạn xem được điểm của PD mình quản lý trực tiếp và PD làm cùng dự án. Chỉ quản lý trực tiếp (hoặc Quản trị) mới chốt điểm được.</p>
      </div>

      <template v-else>
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

        <!-- Bảng theo quy chuẩn chung: toolbar (tìm kiếm, lọc, làm mới, xuất, thiết lập cột, lọc nâng cao) + phân trang -->
        <div class="list-split">
          <div class="table-panel">
            <TableHeader v-model="search" search-placeholder="Tìm nhân viên" :search-width="220" :hide-ai="true"
              :main-function-button="closeIds.length > 0" :filter-count="adv.active.value.length"
              :bulk-action="checked.length > 0" :selected-count="checked.length" @deselect-all="checked = []"
              :charts-visible="showKpi" @toggle-charts="toggleKpi"
              @refresh="search = ''; statusFilter = ''; divisionFilter = ''" @export="exportCsv" @col-settings="showCols = true" @open-filter="showFilter = !showFilter">
              <template #filters>
                <AppCombobox v-model="divisionFilter" class="filter-box pdp-division-filter" :options="divisionFilterOptions" placeholder="Khối: Tất cả" collapsible />
                <AppCombobox v-model="statusFilter" class="filter-box" :options="STATUS_OPTIONS" placeholder="Trạng thái: Tất cả" />
              </template>
              <template #main-buttons>
                <button v-if="closeIds.length" class="btn btn--primary" @click="showClose = true"><TIcon name="lock" />Chốt điểm</button>
              </template>
              <template #bulk-buttons>
                <button v-if="closeIds.length" class="btn btn--primary" @click="showClose = true"><TIcon name="lock" />Chốt {{ closeIds.length }} người</button>
                <button v-if="reopenIds.length" class="btn btn--outline btn--neutral" @click="confirmReopen = true"><TIcon name="lock-open" />Mở chốt {{ reopenIds.length }} người</button>
              </template>
            </TableHeader>
            <FilterChips :fmt-date="formatDate" :active="adv.active.value" :mode="adv.filter.value.mode" :field-of="adv.fieldOf"
              @remove="adv.remove" @clear="adv.clear" @edit="showFilter = true" />
            <div class="table-scroll">
              <DataTable
                :columns="tableCols"
                :show-footer="view.processed.value.length > 0"
              @column-wrap="(c, v) => cols.setWrap(c.key, v)" @column-resize="(c, w) => cols.setWidth(c.key, w)"
                :rows="view.paged.value"
                :line-count="0"
                :hide-blank-rows="false"
                :selected="checked"
                :row-actions="[{ icon: 'eye', title: 'Xem công việc', emit: 'view' }]"
                @update:selected="v => checked = v"
                @row-click="r => selectedPd = r.id"
                @view="r => selectedPd = r.id"
                @column-sort="view.onSort"
                @column-filter="view.onFilter"
              />
              <div v-if="!view.processed.value.length" class="empty-state">Không có nhân viên phù hợp.</div>
            </div>
            <TablePaging :total="view.processed.value.length" v-model:page="view.page.value" v-model:page-size="view.pageSize.value" />
          </div>
          <AdvancedFilterPanel v-if="showFilter" :fields="filterFields" :filter="adv.filter.value" @apply="adv.apply" @close="showFilter = false" />

        </div>

      </template>
    </div>

    <!-- Công việc được tính của 1 người: drawer nổi bên phải (không làm hẹp bảng); drawer công việc mở chồng lên trên -->
    <Teleport to="body">
      <Transition name="pd-drawer">
          
              <aside v-if="selected" class="pd-drawer" tabindex="-1" v-resizable-drawer="{ key: 'closing-pd', min: 480 }">
                <div class="pd-drawer__head">
                  <div class="pd-drawer__title">
                    <span class="card-title">{{ userName(selected.pdId) }}</span>
                    <AppTag :label="selected.closing ? 'Đã chốt' : 'Chưa chốt'" :color="selected.closing ? 'success' : 'neutral'" :dot="true" />
                  </div>
                  <div class="pd-drawer__actions">
                    <!-- Chốt / mở chốt riêng người đang xem -->
                    <button v-if="!selected.closing && canClosePd(selected.pdId)" class="btn btn--primary" @click="openCloseFor(selected.pdId)"><TIcon name="lock" />Chốt điểm</button>
                    <button v-else-if="selected.closing && canReopenPd(selected.pdId)" class="btn btn--outline btn--neutral" @click="openReopenFor(selected.pdId)"><TIcon name="lock-open" />Mở chốt</button>
                    <button class="btn-icon" type="button" v-tip="'Đóng'" aria-label="Đóng" @click="selectedPd = null"><TIcon name="x" /></button>
                  </div>
                </div>
                <div class="pd-drawer__sum">
                  <span>Tháng {{ monthLabelOf(month) }}</span><span>·</span>
                  <span>Điểm tháng <strong>{{ fmtNum(selected.final) }}</strong></span>   <!-- số việc, màn hình, mức hài lòng… ở dải thống kê bên dưới -->
                  <template v-if="selected.lead"><span>·</span><span>tự làm {{ fmtNum(selected.own) }} + dẫn dắt {{ fmtNum(selected.lead) }}</span></template>
                </div>
                <p v-if="selected.closing" class="closed-note">
                  <TIcon name="lock" />
                  <span>Chốt lúc <strong>{{ formatDateTime(selected.closing.closedAt) }}</strong> bởi <strong>{{ userName(selected.closing.closedBy) || '—' }}</strong>
                  · nghỉ lễ {{ selected.holidays ?? 0 }} ngày · làm {{ selected.actualDays }}/{{ selected.workingDays }} ngày · effort {{ selected.effort }}%.</span>
                </p>
                <p v-if="selected.hidden" class="pd-drawer__hint">
                  <TIcon name="info-circle" />
                  <span>{{ selected.hidden }} công việc ở dự án bạn không tham gia — đã tính vào điểm nhưng không hiện chi tiết.</span>
                </p>
                <!-- PD Lead: tab Việc tự làm | Dẫn dắt (việc của PD mình quản lý được tính điểm dẫn dắt) -->
                <div v-if="leadAll.length" class="pd-drawer__tabs">
                  <div class="role-switch" role="tablist" aria-label="Loại điểm">
                    <button type="button" class="role-switch__btn" :class="{ 'role-switch__btn--on': detailTab === 'own' }" role="tab" :aria-selected="detailTab === 'own'" @click="detailTab = 'own'">Việc tự làm ({{ selected.tasks.length }})</button>
                    <button type="button" class="role-switch__btn" :class="{ 'role-switch__btn--on': detailTab === 'lead' }" role="tab" :aria-selected="detailTab === 'lead'" @click="detailTab = 'lead'">Dẫn dắt ({{ selected.leadItems.length }}/{{ leadAll.length }})</button>
                  </div>
                </div>
                <div v-if="detailTab === 'lead' && leadAll.length" class="pd-drawer__list">
                  <p class="pd-drawer__hint">
                    <TIcon name="info-circle" />
                    <span>Điểm dẫn dắt = Điểm sau đánh giá × {{ leadRateText }}; Không tham gia (mặc định) = 0. Chia đều nếu PD có nhiều Lead.</span>
                  </p>
                  <!-- Chọn vai trò hàng loạt: tick việc → chọn vai trò (chỉ việc mình được sửa, PD chưa chốt) -->
                  <div v-if="leadEditable" class="lead-bulk">
                    <span class="lead-bulk__count">{{ leadChecked.length ? `Đã chọn ${leadChecked.length} việc` : 'Tick các việc rồi chọn vai trò của Lead' }}</span>
                    <AppCombobox class="lead-bulk__box" :model-value="null" :options="LEAD_BULK_OPTIONS" placeholder="Đặt vai trò…" :clearable="false"
                      :disabled="!leadChecked.length" @update:model-value="applyLeadRole" />
                  </div>
                  <DataTable :columns="leadCols" :rows="leadView.paged.value" :line-count="2" :hide-blank-rows="false" :show-footer="true"
                    :selected="leadEditable ? leadChecked : (drawerTaskId ? [drawerTaskId] : [])" @update:selected="v => (leadChecked = v)" @row-click="r => drawerTaskId = r.id"
                    @column-sort="leadView.onSort" @column-filter="leadView.onFilter" />
                  <TablePaging :total="leadView.processed.value.length" v-model:page="leadView.page.value" v-model:page-size="leadView.pageSize.value" />
                </div>
                <StatChips v-if="detailTab === 'own' && detailRows.length" class="pd-drawer__stats" :items="pdTaskStats(selected.tasks)" />
                <div v-if="detailTab === 'own' || !selected.leadItems.length" class="pd-drawer__list">
                  <DataTable v-if="detailRows.length" :columns="detailCols" :rows="detailView.paged.value" :line-count="2" :hide-blank-rows="false" :show-footer="true"
                    :selected="drawerTaskId ? [drawerTaskId] : []" @row-click="r => drawerTaskId = r.id"
                    @column-sort="detailView.onSort" @column-filter="detailView.onFilter" />
                  <TablePaging v-if="detailRows.length" :total="detailView.processed.value.length" v-model:page="detailView.page.value" v-model:page-size="detailView.pageSize.value" />
                  <div v-else class="empty-state">Chưa có công việc nào có ngày hoàn thành trong tháng này.</div>
                </div>
              </aside>
      </Transition>
    </Teleport>
    <TaskDrawer :task-id="drawerTaskId" @close="drawerTaskId = null" />
    <ColumnSettingsDialog v-if="showCols" :columns="columns" :state="cols.state.value" :locked="LOCKED" :defaults="cols.defaults"
      @apply="cols.save" @close="showCols = false" />
    <ClosePdsDialog v-if="showClose" :month="month" :months="allMonths" :rows-for="closeRowsFor"
      @close="showClose = false; onlyPd = null" @confirm="onClose" />
    <ConfirmDialog v-if="confirmReopen" title="Mở chốt điểm" confirm-label="Mở chốt"
      :message="`Mở chốt tháng ${monthLabelOf(month)} cho ${reopenIds.map(userName).join(', ')}? Bảng điểm đã chốt bị hủy, công việc được sửa lại và điểm tính lại theo hệ số hiện hành.`"
      @cancel="confirmReopen = false; onlyPd = null" @confirm="onReopen" />
  </AppShell>
</template>

<script setup>
import { isPdRole } from '../store/scoring.js'
import { vTip } from '@mds/utils/tooltip.js'
import { fmtNum } from '@mds/utils/number.js'
import StatChips from '../components/StatChips.vue'
import { pdTaskStats } from '../store/detailStats.js'
import { avatarOf } from '../store/avatar.js'
import { useEscClose } from '@mds/utils/escStack.js'
import { vResizableDrawer } from '@mds/utils/resizableDrawer.js'
import BaClosingPanel from '../components/BaClosingPanel.vue'
import { userPref } from '../store/userPrefs.js'
const rolePref = userPref('closing-role', 'PD')   // tab Điểm PD / BA — nhớ theo người dùng
// Vai trò nào chỉ xem phần của vai trò đó: PD → chỉ PD · BA → chỉ BA · vai trò khác (Quản trị, QA, PO…) → cả hai
const roleTabs = computed(() => reportRoleTabs())   // + bộ phận mình là Quản trị PD / BA
const role = computed({ get: () => (roleTabs.value.includes(rolePref.value) ? rolePref.value : roleTabs.value[0]), set: v => { rolePref.value = v } })
import { useArrowNav } from '@mds/utils/arrowNav.js'
import { matchText } from '@mds/utils/search.js'
import SubNavTabs from '@mds/components/SubNavTabs.vue'
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell       from '../components/AppShell.vue'
import TaskDrawer     from '../components/TaskDrawer.vue'
import ConfirmDialog  from '../components/ConfirmDialog.vue'
import ClosePdsDialog from '../components/ClosePdsDialog.vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppTag      from '@mds/components/AppTag.vue'
import DataTable   from '@mds/components/DataTable.vue'
import { sumBy } from '@mds/utils/tableTotals.js'
import AppCombobox from '@mds/components/AppCombobox.vue'
import TableHeader from '@mds/components/TableHeader.vue'
import TablePaging from '@mds/components/TablePaging.vue'
import FilterChips          from '@mds/components/TableFilterTags.vue'
import AdvancedFilterPanel  from '@mds/components/TableFilterPanel.vue'
import ColumnSettingsDialog from '../components/ColumnSettingsDialog.vue'
import { useTableView } from '../store/useTableView.js'
import { useColumnSettings } from '../store/useColumnSettings.js'
import { useAdvancedFilter } from '../store/advancedFilter.js'
import { downloadCsv } from '../store/csv.js'
import { seesAllPd, viewsAllPd, reportRoleTabs,
  db, isAdmin, userById, userName as baseName, projectById, canSeeReportOf,
  canClosePd, canReopenPd, closingFor, closePds, reopenPd, pdParams, pdWorkingDays, currentUser, ensureMonthTasks, knownTaskMonths, performerSet, taskById, pdMonthTasks,
  leadItemsFor, isPdLead, setLeadRole, canEditField, updateTaskFields, divisionOptions, divisionWithChildren } from '../store/db.js'
import {
  computeScore, computeFinalScore, countsInMonth, expectedScore, achievementRate, workingDaysOf,
  formatDate, formatDateTime, monthLabelOf, qualityColor, round,
  reasonMissing, pdProjectsOf, QUALITY_RATINGS, RATING_DISPLAY_ORDER, LEAD_KINDS, LEAD_ROLE_OPTIONS, leadTotalOf } from '../store/scoring.js'
import { toast } from '@mds/utils/toast.js'
import { backend } from '../store/api.js'

/* Chốt điểm: quản lý trực tiếp chốt cho người mình quản lý (Quản trị: mọi PD).
   Người chốt tự điền nghỉ lễ / ngày làm thực tế / effort / kỳ vọng trong hộp thoại chốt. */
const route = useRoute(), router = useRouter()
const userName = id => baseName(id) || (id ? 'Người dùng đã xóa' : '')

/* ── Tháng ── */
const thisMonth = new Date().toISOString().slice(0, 7)
const shift = (ym, n) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
const allMonths = computed(() => {
  const set = new Set([thisMonth, ...knownTaskMonths()])   // gồm cả tháng chưa tải chi tiết
  db.closings.forEach(c => set.add(c.month))
  return [...set].filter(m => m <= thisMonth).sort().reverse()
})
const month = ref(/^\d{4}-\d{2}$/.test(route.query.thang ?? '') ? route.query.thang : thisMonth)   // mặc định tháng hiện tại
watch([month, () => db.loadGen], ([m]) => ensureMonthTasks(m), { immediate: true })   // tải công việc của tháng đang xem
function setMonth(m) { month.value = m; router.replace({ query: { ...route.query, thang: m, pd: undefined } }) }

/* Năm: mặc định năm của tháng đang xem (= năm hiện tại); tab = các tháng của năm đó, tới tháng hiện tại */
const year = computed(() => month.value.slice(0, 4))
const yearOptions = computed(() => [...new Set(allMonths.value.map(m => m.slice(0, 4)))].sort().reverse().map(y => ({ value: y, label: 'Năm ' + y })))
const tabMonths = computed(() => Array.from({ length: 12 }, (_, i) => `${year.value}-${String(12 - i).padStart(2, '0')}`).filter(m => m <= thisMonth))
function setYear(y) { if (y && y !== year.value) setMonth(y === thisMonth.slice(0, 4) ? thisMonth : `${y}-12`) }

/* ── Phạm vi: PD mình quản lý trực tiếp + PD làm cùng dự án (chỉ xem) · Quản trị: mọi PD — kèm người đã có bản chốt trong tháng.
      “PD” = người bộ phận PD + người bộ phận khác có công việc được giao ở cột PD (người thực hiện) ── */
const scopeIds = computed(() => {
  const performers = performerSet()
  const ids = new Set(db.users.filter(u => (isPdRole(u.role) || performers.has(u.id)) && u.status !== 'disabled' && (viewsAllPd() || canSeeReportOf(u.id))).map(u => u.id))
  db.closings.filter(c => c.month === month.value && c.pdId && canReopenPd(c.pdId) && userById(c.pdId)?.status !== 'disabled').forEach(c => ids.add(c.pdId))
  return [...ids]
})

/** Số việc đánh giá Rất hài lòng / Không hài lòng nhưng chưa có lý do */
const noReasonOf = tasks => tasks.filter(t => reasonMissing(taskById(t.id) ?? t)).length
function itemsOf(ym, pdId) {
  const c = closingFor(ym, pdId)
  if (c) return c.items.filter(i => i.pdId === pdId).map(i => ({ ...i, id: i.taskId }))
  return pdMonthTasks(ym).filter(t => t.pdId === pdId && countsInMonth(t, ym, db.config))
    .map(t => ({ ...t, score: computeScore(t, db.config), final: computeFinalScore(t, db.config) }))
}
/* Dự án tham gia: lúc chốt (lưu trong bản chốt) · chưa chốt / bản chốt cũ: hiện tại */
const projectsOf = (pdId, closing) => closing?.projects
  ?? (backend.enabled ? db.pdProjects?.[pdId] : null) ?? pdProjectsOf(db.projects, pdId)
const NO_SCORE = { final: 0, pbis: 0, unrated: 0, noReason: 0 }
const rows = computed(() => scopeIds.value.map(pdId => {
  const closing = closingFor(month.value, pdId) ?? null
  const tasks = itemsOf(month.value, pdId)          // chỉ công việc mình được xem
  // Có máy chủ: tổng điểm đầy đủ (mọi dự án của PD) do máy chủ tính — người làm cùng dự án không thấy hết công việc
  const sum = backend.enabled ? (db.pdSummaries?.[month.value]?.[pdId] ?? NO_SCORE) : null   // không có = chưa có việc trong tháng
  const p = pdParams(month.value, pdId)
  const workingDays = pdWorkingDays(month.value, pdId)
  // Điểm tháng = điểm tự vẽ + điểm dẫn dắt (PD Lead — việc của PD mình quản lý)
  const leadItems = leadItemsFor(month.value, pdId)
  const lead = sum ? round(sum.lead ?? 0) : leadTotalOf(leadItems)
  const final = sum ? round(sum.final) : round(tasks.reduce((a, t) => a + t.final, 0) + lead)
  const expected = closing ? round(expectedScore(p, workingDays)) : null
  return {
    pdId, closing, tasks, leadItems, lead, own: round(final - lead), final, workingDays,
    holidays: closing?.params?.holidays ?? null,
    actualDays: closing ? p.actualDays : null, effort: closing ? p.effort : null, target: p.target,
    expected, rate: closing ? achievementRate(final, expected) : null,
    pbis: sum?.pbis ?? tasks.length, unrated: sum?.unrated ?? tasks.filter(t => !t.qualityRating).length,
    noReason: Math.max(sum?.noReason ?? 0, noReasonOf(tasks)),
    hidden: Math.max(0, (sum?.pbis ?? tasks.length) - tasks.length),   // số việc ở dự án mình không tham gia
    projects: projectsOf(pdId, closing), canClose: canClosePd(pdId),
  }
}).sort((a, b) => userName(a.pdId).localeCompare(userName(b.pdId), 'vi')))   // thứ tự cố định theo tên — chốt / mở chốt không làm nhảy dòng

const kpis = computed(() => {
  const scored = rows.value.filter(r => r.final > 0)   // trung bình bỏ người 0 điểm (chưa dùng / chưa có việc)
  const unrated = rows.value.reduce((a, r) => a + r.unrated, 0)
  return [
    { label: 'Đã chốt',            value: `${closedCount.value}/${rows.value.length}`, icon: 'lock', theme: 'success', sub: closedCount.value === rows.value.length ? 'Đã chốt đủ' : `Còn ${rows.value.length - closedCount.value} người chưa chốt` },
    { label: 'Tổng điểm',          value: totalScore.value, icon: 'trophy', theme: 'purple', sub: `${scored.length} người có điểm` },
    { label: 'Điểm TB / người', value: scored.length ? round(totalScore.value / scored.length) : '–', icon: 'math-avg', theme: 'brand', sub: scored.length ? `Trên ${scored.length} người có điểm (bỏ 0 điểm)` : 'Chưa có người có điểm' },
    { label: 'Ngày làm việc',      value: workingDaysOf(month.value, 0), icon: 'calendar', theme: 'blue', sub: 'Chưa trừ nghỉ lễ' },
    { label: 'Việc chưa đánh giá', value: unrated, icon: 'alert-triangle', theme: 'warning', sub: unrated ? 'Đang tính 0 điểm' : 'Đã đánh giá đầy đủ' },
  ]
})
const closedCount = computed(() => rows.value.filter(r => r.closing).length)
const totalScore  = computed(() => round(rows.value.reduce((a, r) => a + r.final, 0)))
/* Số người còn chưa chốt trong tháng: có công việc được tính trong tháng nhưng chưa có bản chốt */
const pendingOf = m => scopeIds.value.filter(id => canClosePd(id) && !closingFor(m, id)
  && ((db.pdSummaries?.[m]?.[id]?.pbis ?? 0) > 0 || (db.pdSummaries?.[m]?.[id]?.lead ?? 0) > 0
    || pdMonthTasks(m).some(t => t.pdId === id && countsInMonth(t, m, db.config)) || (!backend.enabled && isPdLead(id) && leadItemsFor(m, id).length))).length   // máy chủ tính cả tháng chưa tải

/* ── Bảng ── */
const rateColor = r => (r == null ? 'neutral' : r >= 100 ? 'success' : r >= 80 ? 'warning' : 'danger')
const columns = [
  { key: 'check',      label: '',               type: 'checkbox', width: 48 },
  { key: 'pd',         label: 'Nhân viên',      type: 'avatar-subtext', minWidth: 180 },
  { key: 'final',      label: 'Điểm',           width: 110, align: 'right' },   // Điểm trước Trạng thái
  { key: 'lead',       label: 'Điểm dẫn dắt',   width: 140, align: 'right', tip: 'PD Lead: % Điểm sau đánh giá các việc của PD mình quản lý trực tiếp (giao việc & review / chốt giải pháp) — đã cộng vào Điểm' },
  { key: 'status',     label: 'Trạng thái',     type: 'status', width: 120 },
  { key: 'ratings',    label: 'Mức đánh giá',   type: 'tag', minWidth: 240, noFilter: true, tip: 'Số việc theo từng mức hài lòng (việc có Ngày hoàn thành trong tháng)' },
  { key: 'projects',   label: 'Dự án tham gia', type: 'tag', minWidth: 220, maxTags: 2, noFilter: true },
  { key: 'pbis',       label: 'Số PBI',         width: 100,  align: 'right' },
  { key: 'unrated',    label: 'Chưa đánh giá',  width: 140, align: 'right' },
  { key: 'holidays',   label: 'Nghỉ lễ',        width: 100,  align: 'right' },
  { key: 'actualDays', label: 'Ngày làm',       width: 110, align: 'right' },
  { key: 'effort',     label: 'Effort',         width: 90,  align: 'right' },
  { key: 'expected',   label: 'Kỳ vọng',        width: 110, align: 'right' },
  { key: 'rate',       label: 'Tỷ lệ đạt',      type: 'status', width: 110 },
  { key: 'closedBy',   label: 'Người chốt',     minWidth: 160 },
]
const dash = v => (v == null ? '–' : v)
/* Tìm kiếm + lọc trạng thái + lọc nâng cao trên danh sách người */
/* Ẩn / hiện dãy card KPI (nút icon trên toolbar, như Chi tiết vòng lặp) — nhớ theo trình duyệt */
const KPI_KEY = 'pdpoint-hide-kpi-closing'
let hideSaved = false
try { hideSaved = localStorage.getItem(KPI_KEY) === '1' } catch { /* storage bị chặn */ }
const showKpi = ref(!hideSaved)
function toggleKpi() { showKpi.value = !showKpi.value; try { localStorage.setItem(KPI_KEY, showKpi.value ? '0' : '1') } catch { /* bỏ qua */ } }

const search = ref(''), statusFilter = ref('')
/* Khối: lọc theo cây như màn Người dùng — chọn khối cha gồm cả khối con */
const divisionFilter = userPref('closing-division', '')
const divisionFilterOptions = computed(() => [
  { value: '', label: 'Khối: Tất cả', text: 'Tất cả', depth: 0, parent: true, open: true },
  ...divisionOptions().map(o => ({ ...o, depth: o.depth + 1 })),
])
const STATUS_OPTIONS = [{ value: '', label: 'Trạng thái: Tất cả' }, { value: 'open', label: 'Chưa chốt' }, { value: 'closed', label: 'Đã chốt' }]
const filterFields = computed(() => [
  { key: 'name',    label: 'Nhân viên',     type: 'text',   get: r => userName(r.pdId) + ' ' + (userById(r.pdId)?.code ?? '') },
  { key: 'division', label: 'Khối',         type: 'enum',   options: [{ value: '', label: 'Chưa chọn khối' }, ...divisionOptions().map(o => ({ value: o.value, label: o.label }))], get: r => userById(r.pdId)?.divisionId || '' },
  { key: 'status',  label: 'Trạng thái',    type: 'enum',   options: STATUS_OPTIONS.slice(1), get: r => (r.closing ? 'closed' : 'open') },
  { key: 'final',   label: 'Điểm',          type: 'number', get: r => r.final },
  { key: 'lead',    label: 'Điểm dẫn dắt',  type: 'number', get: r => r.lead },
  { key: 'pbis',    label: 'Số PBI',        type: 'number', get: r => r.pbis },
  { key: 'unrated', label: 'Chưa đánh giá', type: 'number', get: r => r.unrated },
  { key: 'rate',    label: 'Tỷ lệ đạt (%)', type: 'number', get: r => r.rate ?? '' },
])
const adv = useAdvancedFilter('closing', filterFields)
const showFilter = ref(false), showCols = ref(false)
const LOCKED = ['check', 'pd']
const cols = useColumnSettings('closing-v4', columns, { locked: LOCKED })   // v4: thêm Điểm dẫn dắt sau Điểm
const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return rows.value
    .filter(r => !q || matchText([userName(r.pdId), userById(r.pdId)?.code, userById(r.pdId)?.email], q))
    .filter(r => !divisionFilter.value || divisionWithChildren(divisionFilter.value).has(userById(r.pdId)?.divisionId))
    .filter(r => !statusFilter.value || (statusFilter.value === 'closed') === !!r.closing)
    .filter(r => adv.test(r))
})
/* Người đang xem (drawer nhân viên) · công việc đang xem (drawer công việc) — khai báo trước vì bảng tô dòng đang mở */
const selectedPd   = ref(route.query.pd || null)
const drawerTaskId = ref(null)
/* Mức đánh giá: đếm việc theo mức hài lòng (giống Tổng quan) — “Hài lòng: 40 · Rất hài lòng: 2 · Chưa đánh giá: 1” */
const RATING_COLOR = { ...Object.fromEntries(QUALITY_RATINGS.map(q => [q.value, q.color])), 'Chưa đánh giá': 'neutral' }
function ratingTags(tasks) {
  const c = {}
  for (const t of tasks ?? []) { const k = t.qualityRating || 'Chưa đánh giá'; c[k] = (c[k] ?? 0) + 1 }
  return RATING_DISPLAY_ORDER.filter(k => c[k]).map(k => ({ label: `${k}: ${c[k]}`, color: RATING_COLOR[k] ?? 'neutral' }))
}
const tableRows = computed(() => filteredRows.value.map(r => ({
  id: r.pdId,
  pd: { text: userName(r.pdId), subtext: userById(r.pdId)?.code || userById(r.pdId)?.email || '', avatar: avatarOf(userById(r.pdId)) },
  ratings: ratingTags(r.tasks),
  projects: r.projects.map(p => ({ label: p.code || p.name, color: 'neutral' })),
  status: r.closing ? { label: 'Đã chốt', color: 'success' } : { label: 'Chưa chốt', color: 'neutral' },
  final: r.final, lead: r.lead || '–', pbis: r.pbis, unrated: r.unrated || '–',
  holidays: dash(r.holidays), actualDays: r.closing ? `${r.actualDays}/${r.workingDays}` : '–', effort: r.closing ? r.effort + '%' : '–',
  expected: dash(r.expected),
  rate: r.rate == null ? null : { label: r.rate + '%', color: rateColor(r.rate) },
  _mark: r.pdId === selectedPd.value ? 'current' : r.noReason ? 'warning' : '',   // đang mở drawer · có việc Rất / Không hài lòng chưa có lý do
  closedBy: r.closing ? `${userName(r.closing.closedBy) || '—'} · ${formatDate(r.closing.closedAt?.slice(0, 10))}` : '',
  _rate: r.rate ?? -1,
})))
/* Dòng Tổng (cuối bảng): cộng trên danh sách đang lọc — điểm trung bình / người nằm ở thẻ KPI phía trên */
const tableCols = computed(() => {
  const sumOf = k => fmtNum(sumBy(view.processed.value, r => Number(r[k]) || 0))
  const foot = { final: sumOf('final'), lead: sumOf('lead'), pbis: sumOf('pbis'),
    expected: view.processed.value.some(r => typeof r.expected === 'number') ? sumOf('expected') : '' }   // chỉ người đã chốt mới có kỳ vọng
  return cols.columns.value.map(c => (foot[c.key] ? { ...c, footerText: foot[c.key] } : c))
})
const view = useTableView(tableRows, { sortValue: (r, k) => (k === 'pd' ? r.pd.text : k === 'rate' ? r._rate : r[k]?.label ?? r[k]), defaultSort: { key: 'final', dir: 'desc' } })   // mặc định điểm cao nhất lên đầu

function exportCsv() {
  downloadCsv(`chot-diem-${month.value}.csv`,
    ['Nhân viên', 'Tài khoản', 'Trạng thái', 'Điểm', 'Điểm dẫn dắt', 'Dự án tham gia', 'Số PBI', 'Chưa đánh giá', 'Nghỉ lễ', 'Ngày làm thực tế', 'Effort (%)', 'Điểm kỳ vọng', 'Tỷ lệ đạt (%)', 'Người chốt'],
    view.processed.value.map(r => [r.pd.text, r.pd.subtext, r.status.label, r.final, r.lead === '–' ? 0 : r.lead, r.projects.map(p => p.label).join(', '), r.pbis, r.unrated, r.holidays, r.actualDays, r.effort, r.expected, r.rate?.label?.replace('%', '') ?? '', r.closedBy]))
}

/* ── Chọn & chốt / mở chốt ── */
const checked = ref([])
watch(month, () => { checked.value = []; selectedPd.value = null; drawerTaskId.value = null })
const pool = computed(() => (checked.value.length ? rows.value.filter(r => checked.value.includes(r.pdId)) : rows.value))
const closeIds  = computed(() => pool.value.filter(r => !r.closing && canClosePd(r.pdId)).map(r => r.pdId))
const reopenIds = computed(() => (onlyPd.value ? [onlyPd.value]
  : (checked.value.length ? pool.value : []).filter(r => r.closing && canReopenPd(r.pdId)).map(r => r.pdId)))
/* Chốt / mở chốt riêng 1 người (nút trong drawer) — dùng lại đúng hộp thoại chốt / mở chốt hàng loạt */
const onlyPd = ref(null)
const openCloseFor  = id => { onlyPd.value = id; showClose.value = true }
const openReopenFor = id => { onlyPd.value = id; confirmReopen.value = true }

/* Hộp thoại chốt: đổi tháng trong hộp thoại → tính lại danh sách cho tháng đó */
function closeRowsFor(ym) {
  const ids = onlyPd.value ? [onlyPd.value] : checked.value.length ? checked.value : scopeIds.value
  return ids.filter(id => canClosePd(id) && !closingFor(ym, id)).map(pdId => {
    const tasks = itemsOf(ym, pdId)
    return { pdId, pbis: tasks.length, final: round(tasks.reduce((a, t) => a + t.final, 0) + leadTotalOf(leadItemsFor(ym, pdId))), unrated: tasks.filter(t => !t.qualityRating).length, noReason: noReasonOf(tasks) }
  })
}
function onClose(ym, entries) {
  closePds(ym, entries)
  if (!onlyPd.value) checked.value = []
  showClose.value = false; onlyPd.value = null
  if (ym !== month.value) setMonth(ym)
}
function onReopen() {
  reopenIds.value.forEach(id => reopenPd(month.value, id))
  if (!onlyPd.value) checked.value = []
  confirmReopen.value = false; onlyPd.value = null
}
const showClose = ref(false), confirmReopen = ref(false)

/* ── Chi tiết công việc của 1 người ── */
const selected = computed(() => rows.value.find(r => r.pdId === selectedPd.value) ?? null)
watch(selectedPd, () => { drawerTaskId.value = null })
/* ↑ / ↓ chuyển dòng khi đang xem: drawer công việc mở → chuyển công việc · chỉ drawer nhân viên mở → chuyển nhân viên */
useArrowNav({ ids: () => (detailTab.value === 'lead' ? leadView.processed.value : detailRows.value).map(r => r.id), current: drawerTaskId, scroll: '.pd-drawer .dt-row--selected' })
useArrowNav({
  ids: () => view.processed.value.map(r => r.id), current: selectedPd, active: () => !drawerTaskId.value, scroll: '.table-panel .dt-row--mark-current',
  select: (id, i) => { selectedPd.value = id; view.page.value = Math.floor(i / view.pageSize.value) + 1 },
})

const detailCols = computed(() => {
  const t = selected.value?.tasks ?? []
  const sum = k => fmtNum(sumBy(t, k))   // dòng Tổng: cộng trên toàn bộ việc (mds-ui tableTotals)
  return [
    // Ưu tiên điểm: được bao nhiêu → hài lòng không → thực nhận; ngày + dự án ra sau
    { key: 'content',       label: 'Công việc',      minWidth: 220 },
    { key: 'score',         label: 'Điểm',           width: 80, align: 'right', footerText: sum('score') },
    { key: 'qualityRating', label: 'Mức hài lòng',   type: 'tag', width: 140 },
    { key: 'finalScore',    label: 'Điểm thực nhận', width: 130, align: 'right', footerText: sum('final') },
    { key: 'completedDate', label: 'Ngày hoàn thành', width: 140 },
    { key: 'project',       label: 'Dự án',          width: 150 },
  ]
})
const detailRows = computed(() => [...(selected.value?.tasks ?? [])]
  .sort((a, b) => (a.completedDate || '').localeCompare(b.completedDate || ''))
  .map(t => ({
    id: t.id, pbi: t.pbi ?? '', content: (t.pbi ? t.pbi + ' · ' : '') + t.content, project: projectById(t.projectId)?.name,
    completedDate: formatDate(t.completedDate), screens: `${t.mainScreens} / ${t.subScreens}`, score: t.score,
    qualityRating: { label: t.qualityRating || 'Chưa đánh giá', color: t.qualityRating ? qualityColor(t.qualityRating) : 'neutral' },
    _mark: reasonMissing(taskById(t.id) ?? t) ? 'warning' : '',   // Rất / Không hài lòng mà chưa có lý do

    finalScore: t.final,
  })))
const detailView = useTableView(detailRows, { sortValue: (r, k) => (r[k]?.label ?? r[k]?.text ?? r[k]) })
watch(selectedPd, () => { detailView.page.value = 1; leadView.page.value = 1; detailTab.value = 'own' })

/* ── Điểm dẫn dắt (PD Lead) ── */
const detailTab = ref('own')
const pct = n => fmtNum(Math.round((Number(n) || 0) * 1000) / 10) + '%'
const leadRateText = computed(() => { const r = { ...db.config.lead }; return `${pct(r.review ?? 0.1)} (giao việc & review) / ${pct(r.solution ?? 0.2)} (chốt giải pháp)` })
/* Mọi việc của PD mình quản lý trong tháng (kể cả Không tham gia) — đã chốt: chỉ việc có trong bản chốt */
const leadAll = computed(() => (selected.value ? leadItemsFor(month.value, selected.value.pdId, true) : []))
const leadCanEdit = id => { const t = taskById(id); return !!t && canEditField(t, 'leadRole') }
const leadEditable = computed(() => !selected.value?.closing && leadAll.value.some(i => leadCanEdit(i.taskId)))
const leadChecked = ref([])
watch(selectedPd, () => { leadChecked.value = [] })
/* Combobox: giá trị rỗng = “bỏ chọn” → dùng 'none' cho Không tham gia */
const LEAD_BULK_OPTIONS = LEAD_ROLE_OPTIONS.map(o => ({ ...o, value: o.value || 'none' }))
function applyLeadRole(v) {
  if (!v) return
  const role = v === 'none' ? '' : v
  // Ghi lại vai trò cũ từng việc → Hoàn tác trả lại đúng như trước
  const prev = leadChecked.value.map(id => { const t = taskById(id); return { id, leadRole: t?.leadRole ?? '', leadSolution: t?.leadSolution ?? '' } })
  const done = [], fails = []
  for (const p of prev) { const r = setLeadRole(p.id, role); r === true ? done.push(p) : fails.push(r) }
  const undo = () => { done.forEach(p => updateTaskFields(p.id, { leadRole: p.leadRole, ...(p.leadSolution ? { leadSolution: p.leadSolution } : {}) })); toast.info('Đã hoàn tác') }
  const action = done.length ? { label: 'Hoàn tác', icon: 'arrow-back-up', onClick: undo } : undefined
  fails.length ? toast.warning(`Đã cập nhật ${done.length} việc · ${fails.length} việc không sửa được (${fails[0]})`, { action })
    : toast.success(`Đã đặt “${LEAD_KINDS[role]}” cho ${done.length} việc`, { action })
  leadChecked.value = []
}
const leadCols = computed(() => {
  const t = leadAll.value
  return [
    // Vừa drawer 760px (không cuộn ngang): cột Điểm dẫn dắt luôn thấy — tỷ lệ theo vai trò ghi ở dòng giải thích
    ...(leadEditable.value ? [{ key: 'check', label: '', type: 'checkbox', width: 48 }] : []),
    { key: 'content', label: 'Công việc',     minWidth: 160 },
    { key: 'pd',      label: 'PD thực hiện',  width: 130 },
    { key: 'kind',    label: 'Vai trò Lead',  type: 'tag', width: 160 },
    { key: 'final',   label: 'Điểm việc',     width: 110, align: 'right', noFilter: true, footerText: fmtNum(sumBy(t, 'final')), tip: 'Điểm sau đánh giá của việc (điểm PD nhận)' },
    { key: 'point',   label: 'Điểm dẫn dắt',  width: 130, align: 'right', noFilter: true, footerText: fmtNum(leadTotalOf(t)) },
  ]
})
const leadRows = computed(() => [...leadAll.value]
  .sort((a, b) => (a.completedDate || '').localeCompare(b.completedDate || ''))
  .map(i => ({
    id: i.taskId, content: (i.pbi ? i.pbi + ' · ' : '') + (i.content ?? ''), pd: userName(i.pdId),
    kind: { label: LEAD_KINDS[i.kind] ?? i.kind, color: i.kind === 'solution' ? 'brand' : i.kind === 'review' ? 'success' : 'neutral' },
    final: i.final, point: i.point || '–',
    _noSelect: !leadCanEdit(i.taskId),
    _mark: i.taskId === drawerTaskId.value ? 'current' : '',
  })))
const leadView = useTableView(leadRows, { sortValue: (r, k) => (r[k]?.label ?? r[k]) })
useEscClose(() => { selectedPd.value = null }, () => !!selectedPd.value)   // ESC đóng drawer chi tiết
</script>

<style scoped>
.pdp-division-filter { width: 240px; }
.role-switch { display: inline-flex; margin-left: 8px; padding: 2px; gap: 2px; border-radius: var(--radius-default); background: var(--bg-neutral-light); }   /* sát tiêu đề trang: 8px gap + 8px = 16px */
.role-switch__btn { font-weight: var(--fw-semibold); height: calc(var(--btn-height) - 4px); padding: 0 12px; border: none; border-radius: calc(var(--radius-default) - 2px); background: transparent;
  font-family: inherit; font-size: var(--text-body); color: var(--text-primary); cursor: pointer; white-space: nowrap; }
.role-switch__btn:hover:not(.role-switch__btn--on) { color: var(--text-primary); background: var(--bg-brand-light); }
.role-switch__btn--on { background: var(--bg-white); color: var(--text-brand); box-shadow: var(--shadow-sm); }
.year-box { width: 140px; }   /* không overflow → gạch active 2px không bị cắt */
.tab-pending { width: 6px; height: 6px;  /* tab có gap 8px (Figma Gap-Content) → cách chữ 8px */ border-radius: 50%; background: var(--bg-danger); flex-shrink: 0; }
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
.pd-drawer__title .card-title { font-size: var(--text-h2); line-height: var(--text-h2-lh); }   /* tiêu đề drawer = tiêu đề form H2 20px */
.pd-drawer__sum { display: flex; gap: 6px; padding: 0 var(--card-px) var(--card-gap); font-size: var(--text-body); color: var(--text-secondary); }
.pd-drawer__sum strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.pd-drawer__list { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: auto; }
.pd-drawer__list > .datatable { flex: 1 1 auto; min-height: 0; overflow: auto; }
.pd-drawer__stats { padding: 0 var(--card-px) var(--card-gap); }
.pd-drawer__tabs { padding: 0 var(--card-px) var(--card-gap); }
.pd-drawer__tabs .role-switch { margin-left: 0; }
.lead-bulk { display: flex; align-items: center; gap: 8px; padding: 0 var(--card-px) var(--card-gap); min-width: 0; }
.lead-bulk__count { flex: 1; min-width: 0; font-size: var(--text-body); color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lead-bulk__box { width: 200px; flex-shrink: 0; }
.pd-drawer-enter-active, .pd-drawer-leave-active { transition: transform 0.2s ease; }
.pd-drawer-enter-from, .pd-drawer-leave-to { transform: translateX(100%); }
.pd-head { display: flex; align-items: center; gap: 8px; }
.card-title { font-size: var(--text-h3); font-weight: var(--fw-semibold); line-height: var(--text-h3-lh); color: var(--text-primary); }
.pd-drawer__hint { display: flex; align-items: center; gap: 8px; margin: 0 var(--card-px) var(--card-gap); font-size: var(--text-body); color: var(--text-secondary); }
.pd-drawer__hint .ti { font-size: 16px; flex-shrink: 0; }
.closed-note {
  display: flex; align-items: center; gap: 8px; margin: 0 var(--card-px) var(--card-gap);
  padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-success-light);
  font-size: var(--text-body); color: var(--text-primary);
}
.closed-note strong { font-weight: var(--fw-semibold); }
.empty-card { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.empty-card__text { font-size: var(--text-body-md); font-weight: var(--fw-semibold); color: var(--text-primary); }
.empty-card__hint { font-size: var(--text-body); color: var(--text-secondary); }
</style>
