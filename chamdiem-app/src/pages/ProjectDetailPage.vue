<template>
  <AppShell>
    <template v-if="project">
      <div class="page-header">
        <div class="page-header__left">
          <button class="btn-icon" type="button" v-tip="'Quay lại danh sách dự án'" aria-label="Quay lại danh sách dự án" @click="router.push('/du-an')">
            <TIcon name="arrow-left" />
          </button>
          <span class="pdp-logo" :class="{ 'pdp-logo--initials': !project.logo }">
            <img v-if="project.logo" :src="project.logo" alt="" /><template v-else>{{ projectInitials }}</template>
          </span>
          <h1 class="page-header__title h2">{{ project.name }}</h1>
          <StarToggle :project-id="project.id" />
          <span v-if="myRole" class="my-role" v-tip="myRole.hint"><AppTag :label="myRole.label" :color="myRole.color" /></span>
          <!-- Xem theo: Tất cả (cột tùy chỉnh) · BA (cột chung + cột BA) · PD (cột chung + cột PD) — bộ lọc trạng thái / người cũng theo -->
          <template v-if="!pdOnly">
          <span class="view-switch__k">Xem theo</span>
          <div class="view-switch" role="tablist" aria-label="Xem theo">
            <button v-for="v in VIEW_MODES" :key="v.id" type="button" role="tab" class="view-switch__btn" :class="{ 'view-switch__btn--on': viewMode === v.id }"
              :aria-selected="viewMode === v.id" v-tip="v.tip" @click="viewMode = v.id"><i v-if="v.dot" class="view-switch__dot" :style="{ background: v.dot }" />{{ v.label }}</button>
          </div>
          </template>
        </div>
        <div class="page-header__right">
          <template v-if="manage">
            <!-- Cả dự án 1 file Google Sheet (mỗi trang tính = 1 vòng lặp) -->
            <template v-if="project.sheetUrl">
              <span v-if="project.sheetSync?.error" class="sheet-state sheet-state--error" v-tip="project.sheetSync.error"><TIcon name="alert-triangle" />Đồng bộ lỗi</span>
              <span v-else-if="project.sheetSync?.at" class="sheet-state" v-tip="projectSyncTip(project.sheetSync)">Đồng bộ {{ sheetAgo(project.sheetSync.at) }}<template v-if="project.sheetSync.newTabs"> · {{ project.sheetSync.newTabs }} trang tính mới</template></span>
              <button class="btn btn--outline btn--neutral" @click="projectSyncing = true"><TIcon name="refresh" />Đồng bộ Sheet</button>
            </template>
            <button class="btn btn--outline btn--neutral" @click="iterEditing = {}">
              <TIcon name="plus" />Thêm vòng lặp
            </button>
            <DropdownMenu :items="projectMenu" placement="bottom-end" :min-width="160" @select="projectEditing = true">
              <template #trigger="{ toggle }">
                <button class="btn-icon btn-icon--outline" v-tip="'Thao tác dự án'" aria-label="Thao tác dự án" @click.stop="toggle"><TIcon name="dots" /></button>
              </template>
            </DropdownMenu>
          </template>
        </div>
      </div>

      <!-- Tab vòng lặp -->
      <div v-if="iterations.length" class="sub-nav">
        <!-- Nhiều vòng lặp: tab vừa chỗ + "Xem thêm (n)" chứa các vòng cũ -->
        <SubNavTabs :items="iterations.map(it => ({ id: it.id, label: it.name }))" :model-value="activeIterId" @select="selectIteration" />
        <div v-if="activeIter" class="sub-nav-right">
          <!-- Vòng lặp gắn Google Sheet: bấm đồng bộ (xem trước → chọn cách áp dụng) · trạng thái lần đồng bộ gần nhất -->
          <template v-if="activeIter.sheetUrl && manage">
            <span v-if="activeIter.sheetSync?.error" class="sheet-state sheet-state--error" v-tip="activeIter.sheetSync.error"><TIcon name="alert-triangle" />Đồng bộ lỗi</span>
            <span v-else-if="activeIter.sheetSync?.at" class="sheet-state" v-tip="sheetSyncTip(activeIter.sheetSync)">Đồng bộ {{ sheetAgo(activeIter.sheetSync.at) }}</span>
            <button class="btn btn--outline btn--neutral" @click="syncIterId = activeIter.id"><TIcon name="refresh" />Đồng bộ Sheet</button>
          </template>
          <span class="iter-range"><TIcon name="calendar" />{{ formatDate(activeIter.startDate) }} – {{ formatDate(activeIter.endDate) }}</span>
          <DropdownMenu v-if="manage" :items="iterMenu" placement="bottom-end" :min-width="180" @select="onIterMenu">
            <template #trigger="{ toggle }">
              <button class="btn-icon btn-icon--outline" v-tip="'Thao tác vòng lặp'" aria-label="Thao tác vòng lặp" @click.stop="toggle"><TIcon name="dots" /></button>
            </template>
          </DropdownMenu>
        </div>
      </div>

      <div v-if="!activeIter" class="content-wrapper">
        <div class="card empty-card">
          <p class="empty-card__text">Dự án chưa có vòng lặp nào.</p>
          <button v-if="manage" class="btn btn--primary" @click="iterEditing = {}"><TIcon name="plus" />Thêm vòng lặp</button>
          <p v-else class="empty-card__hint">Quản trị của dự án sẽ tạo vòng lặp và giao công việc.</p>
        </div>
      </div>

      <div v-else class="content-wrapper content-wrapper--fill">
        <!-- Tổng quan vòng lặp -->
        <div v-if="showKpi" class="kpi-row">
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
            <TableHeader
              v-model="search" search-placeholder="Tìm PBI, nội dung, người thực hiện" :search-width="260"
              :main-function-button="canAdd" :hide-ai="true" :filter-count="adv.active.value.length"
              @refresh="resetFilters" @export="exportCsv"
              @col-settings="showCols = true" @open-filter="showFilter = !showFilter"
              :charts-visible="showKpi" @toggle-charts="toggleKpi"
              :bulk-action="checked.length > 0" :selected-count="checked.length" @deselect-all="checked = []"
            >
              <template #bulk-buttons>
                <!-- Không đủ chỗ → các nút còn lại gom vào ⋯ -->
                <OverflowActions :actions="bulkActions" @select="onBulkAction" />
              </template>
              <template #filters>
                <!-- Trạng thái tách riêng theo phần việc: PD (thiết kế) · BA (phân tích) — vai trò PD / BA chỉ thấy ô của mình -->
                <AppCombobox v-if="viewMode !== 'BA'" v-model="pdStatusFilter" class="filter-box" :options="pdStatusOptions" placeholder="Trạng thái PD: Tất cả" />
                <AppCombobox v-if="viewMode !== 'PD' && iterTasks.some(hasAnalysis)" v-model="baStatusFilter" class="filter-box" :options="baStatusOptions" placeholder="Trạng thái BA: Tất cả" />
                <!-- Lọc theo người: dãy avatar PD · BA (BA chỉ hiện khi vòng lặp có việc giao BA) -->
                <AvatarFilter v-if="viewMode !== 'BA' && peopleOf('pdId').length" v-model="pdPeopleFilter" label="PD" accent="var(--role-pd)" :accent-tip="ACCENT_TIP.PD" :people="peopleOf('pdId')" />
                <AvatarFilter v-if="viewMode !== 'PD' && peopleOf('baId').length" v-model="baPeopleFilter" label="BA" accent="var(--role-ba)" :accent-tip="ACCENT_TIP.BA" :people="peopleOf('baId')" />
              </template>
              <template #main-buttons>
                <!-- Thêm công việc ▾ : thêm 1 việc (form đầy đủ) · Nhập nhanh nhiều việc (mỗi dòng 1 việc, cập nhật chi tiết sau) -->
                <div class="btn-split">
                  <button class="btn btn--primary" @click="taskEditing = {}"><TIcon name="plus" />Thêm công việc</button>
                  <DropdownMenu :items="addMenu" placement="bottom-end" :min-width="240" @select="onAddMenu">
                    <template #trigger="{ toggle }">
                      <button class="btn btn--primary btn-split__arrow" v-tip="'Cách thêm khác'" aria-label="Cách thêm khác" @click.stop="toggle"><TIcon name="chevron-down" /></button>
                    </template>
                  </DropdownMenu>
                </div>
                <!-- Nhập từ file Excel / Dán từ TFS / Ảnh chụp (AI) / file mẫu: ai THÊM ĐƯỢC việc (Quản trị + Thành viên dự án) đều dùng được -->
                <DropdownMenu v-if="canAdd" :items="moreMenu" placement="bottom-end" :min-width="220" @select="onMoreMenu">
                  <template #trigger="{ toggle }">
                    <button class="btn-icon btn-icon--outline" v-tip="'Thêm thao tác'" aria-label="Thêm thao tác" @click.stop="toggle"><TIcon name="dots" /></button>
                  </template>
                </DropdownMenu>
              </template>
            </TableHeader>
            <FilterChips :fmt-date="formatDate" :active="adv.active.value" :mode="adv.filter.value.mode" :field-of="adv.fieldOf"
              @remove="adv.remove" @clear="adv.clear" @edit="showFilter = true" />
            <div class="table-scroll">
              <DataTable
                :columns="tableColumns"
              @column-wrap="(c, v) => cols.setWrap(c.key, v)" @column-resize="(c, w) => cols.setWidth(c.key, w)"
                :rows="view.paged.value"
                :selected="bulkable ? checked : (drawerTaskId ? [drawerTaskId] : [])"
                @update:selected="v => (checked = v)"
                :hide-blank-rows="false"
                :row-actions="rowActions" :max-row-actions="4"
                @row-click="openTask"
                @open="openTask"
                @delete="r => askDeleteTask(r._task)"
                @duplicate="r => duplicateTask(r._task)"
                @claim="r => claimRow(r._task)"
                @column-sort="view.onSort"
                @column-filter="view.onFilter"
              />
              <div v-if="!rows.length" class="empty-state">Không có công việc phù hợp.</div>
            </div>
            <TablePaging :total="view.processed.value.length" v-model:page="view.page.value" v-model:page-size="view.pageSize.value" />
          </div>
          <AdvancedFilterPanel v-if="showFilter" :fields="filterFields" :filter="adv.filter.value" @apply="adv.apply" @close="showFilter = false" />
        </div>
      </div>
    </template>

    <div v-else class="content-wrapper content-wrapper--fill">
      <div class="card empty-card">
        <p class="empty-card__text">Không tìm thấy dự án hoặc bạn không có quyền truy cập.</p>
        <button class="btn btn--outline btn--neutral" @click="router.push('/du-an')">Về danh sách dự án</button>
      </div>
    </div>

    <TaskDrawer :task-id="drawerTaskId" @close="drawerTaskId = null" @delete="askDeleteTask" @duplicate="duplicateTask" />
    <ImportTasksDialog v-if="importing && activeIter" :project-id="project.id" :iteration="activeIter" :mode="importing"
      @close="importing = false" />
    <ColumnSettingsDialog v-if="showCols" :columns="columns" :state="cols.state.value" :locked="['content']" :defaults="cols.defaults"
      @apply="cols.save" @close="showCols = false" />
    <ConfirmDialog v-if="infoMessage" title="Không thực hiện được" :message="infoMessage"
      :hide-confirm="true" cancel-label="Đóng" @cancel="infoMessage = ''" />
    <TaskDialog v-if="taskEditing && activeIter"
      :task="taskEditing.id ? taskEditing : null" :copy-from="taskEditing.copyFrom ?? null"
      :project-id="project.id" :iteration-id="activeIter.id"
      @close="taskEditing = null" />
    <QuickAddTasksDialog v-if="quickAdding && activeIter" :project-id="project.id" :iteration="activeIter" @close="quickAdding = false" />
    <!-- Xóa hàng loạt: cảnh báo + phải gõ đúng “Chắc chắn” -->
    <ConfirmDialog v-if="bulkDeleting" :title="`Xóa ${deletable.length} công việc`" require-text="Chắc chắn" :confirm-label="`Xóa ${deletable.length} công việc`"
      @cancel="bulkDeleting = false" @confirm="onBulkDelete">
      <p class="bulk-del__warn"><TIcon name="alert-triangle" /><span>Sắp <strong>xóa vĩnh viễn {{ deletable.length }} công việc</strong> cùng lịch sử điểm của chúng — <strong>không khôi phục được</strong>.</span></p>
      <ul class="bulk-del__list">
        <li v-for="t in deletable.slice(0, 8)" :key="t.id">{{ t.pbi ? t.pbi + ' · ' : '' }}{{ t.content }}</li>
        <li v-if="deletable.length > 8" class="bulk-del__more">… và {{ deletable.length - 8 }} công việc khác</li>
      </ul>
      <p v-if="lockedChecked.length" class="bulk-del__skip"><TIcon name="lock" />{{ lockedChecked.length }} công việc thuộc tháng đã chốt điểm — không xóa được, sẽ bỏ qua.</p>
    </ConfirmDialog>
    <BulkFieldDialog v-if="bulkField" :field="bulkField" :task-ids="checked" :project-id="project.id" @done="checked = []" @close="bulkField = ''" />
    <MoveTasksDialog v-if="moving && activeIter" :task-ids="checked" :project-id="project.id" :from-id="activeIter.id"
      @moved="() => (checked = [])" @close="moving = false" />
    <ProjectDialog v-if="projectEditing" :project="project" @sync="projectSyncing = true" @close="projectEditing = false" />
    <ProjectSheetSyncDialog v-if="projectSyncing" :project="project" @close="projectSyncing = false" />
    <IterationDialog v-if="iterEditing"
      :iteration="iterEditing.id ? iterEditing : null" :project-id="project.id"
      @saved="selectIteration" @sync="id => (syncIterId = id)" @close="iterEditing = null" />
    <SheetSyncDialog v-if="syncIter" :iteration="syncIter" @close="syncIterId = null" />
    <ConfirmDialog v-if="taskDeleting" title="Xóa công việc"
      :message="`Xóa công việc “${taskDeleting.content}”?`"
      @cancel="taskDeleting = null" @confirm="onDeleteTask" />
    <ConfirmDialog v-if="iterDeleting" title="Xóa vòng lặp"
      :message="`Xóa “${iterDeleting.name}” cùng toàn bộ công việc bên trong?`"
      @cancel="iterDeleting = null" @confirm="onDeleteIteration" />
  </AppShell>
</template>

<script setup>
import { fmtNum } from '@mds/utils/number.js'
import { avatarOf } from '../store/avatar.js'
import OverflowActions from '@mds/components/OverflowActions.vue'
import { matchText } from '@mds/utils/search.js'
import AvatarFilter from '@mds/components/AvatarFilter.vue'
import StarToggle from '../components/StarToggle.vue'
import { useArrowNav } from '@mds/utils/arrowNav.js'
import { toast } from '@mds/utils/toast.js'
import QuickAddTasksDialog from '../components/QuickAddTasksDialog.vue'
import MoveTasksDialog from '../components/MoveTasksDialog.vue'
import BulkFieldDialog from '../components/BulkFieldDialog.vue'
import SubNavTabs from '@mds/components/SubNavTabs.vue'
import { useDocTitle } from '@mds/utils/docTitle.js'
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell        from '../components/AppShell.vue'
import TaskDialog      from '../components/TaskDialog.vue'
import TaskDrawer      from '../components/TaskDrawer.vue'
import IterationDialog from '../components/IterationDialog.vue'
import SheetSyncDialog from '../components/SheetSyncDialog.vue'
import ProjectSheetSyncDialog from '../components/ProjectSheetSyncDialog.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { userPref } from '../store/userPrefs.js'
import ProjectDialog   from '../components/ProjectDialog.vue'
import ConfirmDialog   from '../components/ConfirmDialog.vue'
import LinkCell        from '../components/LinkCell.vue'
import ImportTasksDialog from '../components/ImportTasksDialog.vue'
import ColumnSettingsDialog from '../components/ColumnSettingsDialog.vue'
import AdvancedFilterPanel  from '@mds/components/TableFilterPanel.vue'
import FilterChips          from '@mds/components/TableFilterTags.vue'
import { useColumnSettings } from '../store/useColumnSettings.js'
import { useAdvancedFilter } from '../store/advancedFilter.js'
import TIcon        from '@mds/components/TIcon.vue'
import TableHeader  from '@mds/components/TableHeader.vue'
import DataTable    from '@mds/components/DataTable.vue'
import TablePaging  from '@mds/components/TablePaging.vue'
import AppCombobox  from '@mds/components/AppCombobox.vue'
import DropdownMenu from '@mds/components/DropdownMenu.vue'
import AppTag       from '@mds/components/AppTag.vue'
import { performerOptions,
  db, projectById, iterationsOf, tasksOf, membersOf, userName,
  isMember, canManageProject, canAddTask, myProjectRole, PROJECT_ROLES, deleteTask, deleteIteration, currentUser,
  isTaskLocked, userById, canDeleteTask, canBulkTask, isOwnTask, roleLabelOf, ensureIterationTasks, ensureProjectTasks, ensureTask, canClaim, claimTask } from '../store/db.js'
import {
  DESIGN_STATUSES, COMPLEXITIES, BUSINESS_VALUES, DEFAULT_BUSINESS, PLATFORMS, SOLUTION_ROLES, YES_NO, QUALITY_RATINGS,
  statusColor, qualityColor, computeScore, computeFinalScore, formatDate, missingScoreFields,
  reasonMissing, STAGES, stageOf, phaseOf, taskStatusOf, taskStatusMeta, BA_STATUSES, baScoreOf, missingBaFields, hasDesign, hasAnalysis, baStatusOf, BA_APPROVED, DEFAULT_STATUS,
} from '../store/scoring.js'
import { BA_QUALITY_LEVELS, baConfigOf } from '../store/baScoring.js'
import { downloadImportTemplate } from '../store/taskImport.js'
import { useTableView } from '../store/useTableView.js'
import { downloadCsv } from '../store/csv.js'

const route  = useRoute()
const router = useRouter()

const project = computed(() => {
  const p = projectById(route.params.id)
  return p && isMember(p.id) ? p : null
})
// Logo dự án cạnh tên; chưa có logo → chữ cái đầu (giống avatar)
const projectInitials = computed(() => (project.value?.name || '').trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase())
/* Tiêu đề tab: Tên dự án | Dự án | MISA Solution Point */
useDocTitle(() => [project.value?.name, 'Dự án'])
const manage     = computed(() => !!project.value && canManageProject(project.value.id))
const canAdd     = computed(() => !!project.value && canAddTask(project.value.id))
const projectEditing = ref(false)
const myRole     = computed(() => project.value && PROJECT_ROLES.find(r => r.value === myProjectRole(project.value.id)))
const iterations = computed(() => project.value ? iterationsOf(project.value.id) : [])

/* ── Vòng lặp đang chọn (lưu trên URL ?vl=) ── */
const activeIterId = computed(() => {
  const list = iterations.value
  if (list.some(i => i.id === route.query.vl)) return route.query.vl
  const today = new Date().toISOString().slice(0, 10)
  return (list.find(i => i.startDate <= today && today <= i.endDate) ?? list[0])?.id
})
const activeIter = computed(() => iterations.value.find(i => i.id === activeIterId.value))
function selectIteration(id) { router.replace({ query: { vl: id } }) }

const projectMenu = [{ id: 'edit', icon: 'pencil', label: 'Sửa dự án' }]
const iterMenu = computed(() => [
  { id: 'edit',   icon: 'pencil', label: 'Sửa vòng lặp' },
  { id: 'sheet',  icon: 'file-spreadsheet', label: activeIter.value?.sheetUrl ? 'Đổi link Google Sheet' : 'Gắn link Google Sheet' },
  { separator: true },
  { id: 'delete', icon: 'trash',  label: 'Xóa vòng lặp', danger: true },
])
/* Đồng bộ Google Sheet — cả dự án (vừa tạo dự án có link → mở luôn qua ?dongbo=1) */
const projectSyncing = ref(route.query.dongbo === '1')
if (projectSyncing.value) router.replace({ query: { ...route.query, dongbo: undefined } })
const projectSyncTip = s => `${s.auto ? 'Tự đồng bộ' : 'Đồng bộ'} lúc ${new Date(s.at).toLocaleString('vi-VN')}${s.by ? ' bởi ' + userName(s.by) : ''}: ${s.created ? `tạo ${s.created} vòng lặp, ` : ''}${s.members?.length ? `thêm ${s.members.length} thành viên (${s.members.join(', ')}), ` : ''}thêm ${s.added ?? 0}, cập nhật ${s.updated ?? 0} công việc${s.newTabs ? ` · ${s.newTabs} trang tính mới chờ tạo vòng lặp — bấm Đồng bộ Sheet` : ''}`
/* Đồng bộ Google Sheet — 1 vòng lặp */
const syncIterId = ref(null)
const syncIter = computed(() => iterations.value.find(i => i.id === syncIterId.value) ?? null)
const sheetAgo = iso => { const m = Math.round((Date.now() - Date.parse(iso)) / 60000)
  return m < 1 ? 'vừa xong' : m < 60 ? `${m} phút trước` : m < 1440 ? `${Math.round(m / 60)} giờ trước` : `${Math.round(m / 1440)} ngày trước` }
const sheetSyncTip = s => `${s.auto ? 'Tự đồng bộ' : 'Đồng bộ'} lúc ${new Date(s.at).toLocaleString('vi-VN')}${s.by ? ' bởi ' + userName(s.by) : ''}: thêm ${s.added ?? 0}, cập nhật ${s.updated ?? 0}${s.errors ? `, ${s.errors} dòng lỗi` : ''}${s.mode === 'add' ? ' (chỉ thêm mới)' : ''}`
const iterEditing  = ref(null)
const iterDeleting = ref(null)
function onIterMenu(item) {
  if (item.id === 'edit' || item.id === 'sheet') iterEditing.value = activeIter.value
  if (item.id === 'delete') iterDeleting.value = activeIter.value
}
function onDeleteIteration() {
  const ok = deleteIteration(iterDeleting.value.id)
  iterDeleting.value = null
  if (ok) router.replace({ query: {} })
  else infoMessage.value = 'Vòng lặp có công việc thuộc tháng đã chốt điểm nên không thể xóa. Quản trị cần mở chốt tháng đó trước.'
}

/* ── Nhập từ file / file mẫu ── */
const importing = ref(false)
const infoMessage = ref('')
const moreMenu = [
  { id: 'import-file',  icon: 'file-spreadsheet', label: 'Nhập từ file Excel' },
  { id: 'import-paste', icon: 'clipboard',        label: 'Dán từ TFS' },
  { id: 'import-image', icon: 'sparkles',         label: 'Nhập từ ảnh chụp (AI)', ai: true },
  { separator: true },
  { id: 'template', icon: 'download',    label: 'Tải file mẫu nhập công việc' },
]
function onMoreMenu(item) {
  if (item.id?.startsWith('import-')) importing.value = item.id.slice(7)   // 'file' | 'paste' | 'image'
  if (item.id === 'template') downloadImportTemplate()
}

/* ── Bộ lọc ── */
const search       = ref('')
const pdPeopleFilter = ref([]), baPeopleFilter = ref([])   // id PD / BA đang lọc
const pdStatusFilter = ref(''), baStatusFilter = ref('')
const ALL = '__all'
// Người có việc trong vòng lặp đang xem theo cột (pdId / baId)
const peopleOf = field => [...new Set(iterTasks.value.map(t => t[field]).filter(Boolean))].map(userById).filter(Boolean)
  .map(u => ({ id: u.id, name: u.name, picture: avatarOf(u), code: u.code, sub: [u.code, roleLabelOf(u)].filter(Boolean).join(' · ') }))
/* Trạng thái riêng từng phần: PD = trạng thái thiết kế (việc có thiết kế; chưa duyệt phân tích → “Chưa thiết kế”) · BA = trạng thái phân tích (đã duyệt → Hoàn thành) */
const PD_NOT_STARTED = 'Chưa thiết kế'
const pdStatusOf = t => (phaseOf(t) === 'analysis' ? PD_NOT_STARTED : t.designStatus || DEFAULT_STATUS)
const baPartStatusOf = t => (t.baStatus === BA_APPROVED ? 'Hoàn thành' : baStatusOf(t))
const pdStatusOptions = [{ value: ALL, label: 'Trạng thái PD: Tất cả' }, ...[PD_NOT_STARTED, ...DESIGN_STATUSES.map(s => s.value)].map(v => ({ value: v, label: v }))]
const baStatusOptions = [{ value: ALL, label: 'Trạng thái BA: Tất cả' }, ...BA_STATUSES.map(s => ({ value: s.value, label: s.value }))]
const on = f => f.value && f.value !== ALL
function resetFilters() { search.value = ''; pdPeopleFilter.value = []; baPeopleFilter.value = []; pdStatusFilter.value = ''; baStatusFilter.value = '' }
watch(activeIterId, () => { resetFilters(); drawerTaskId.value = null; checked.value = [] })
/* Tải công việc của vòng lặp đang xem (bootstrap chỉ có dữ liệu nóng) · nhập khẩu cần cả dự án để kiểm tra trùng PBI */
watch([activeIterId, () => db.loadGen], ([id]) => ensureIterationTasks(id), { immediate: true })
watch([importing, () => project.value?.id], ([on, pid]) => { if (on && pid) ensureProjectTasks(pid) })
watch(() => route.query.cv, cv => ensureTask(cv), { immediate: true })

/* Thêm công việc ▾ */
const addMenu = [{ id: 'quick', icon: 'list-details', label: 'Nhập nhanh công việc' }]
const quickAdding = ref(false)
function onAddMenu(item) { if (item.id === 'quick') quickAdding.value = true }
/* Chọn nhiều công việc → chuyển sang vòng lặp khác (Quản trị dự án) */
/* Ẩn / hiện card thống kê (nhớ theo trình duyệt) */
const KPI_KEY = 'pdpoint-hide-kpi'
let hideSaved = false
try { hideSaved = localStorage.getItem(KPI_KEY) === '1' } catch { /* storage bị chặn */ }
const showKpi = ref(!hideSaved)
function toggleKpi() { showKpi.value = !showKpi.value; try { localStorage.setItem(KPI_KEY, showKpi.value ? '0' : '1') } catch { /* bỏ qua */ } }
const checked = ref([]), moving = ref(false)
const drawerTaskId = ref(null)   // việc đang mở drawer — khai báo sớm: bảng đánh dấu dòng đang xem (_mark 'current')
const bulkField = ref('')   // 'pdId' | 'baId' | 'designStatus' | 'qualityRating' — cập nhật hàng loạt
/* Thao tác hàng loạt (theo thứ tự ưu tiên hiện; thiếu chỗ → vào ⋯). Xóa luôn cuối */
const bulkActions = computed(() => [
  { id: 'pdId', label: 'Gán PD', icon: 'user' },
  { id: 'baId', label: 'Gán BA', icon: 'user' },
  // Trạng thái / mức hài lòng: chỉ Quản trị dự án — Thành viên chỉ xóa, gán PD / BA, chuyển vòng lặp việc mình thêm
  // Trạng thái thiết kế: chỉ khi mọi việc đã chọn đều có phần thiết kế (có việc “Chỉ phân tích” → ẩn)
  manage.value && checkedTasks.value.length && checkedTasks.value.every(hasDesign) ? { id: 'designStatus', label: 'Cập nhật trạng thái', icon: 'circle-check' } : null,
  // Mức hài lòng: chỉ khi TẤT CẢ việc đã chọn là “Chỉ thiết kế” — lẫn loại việc khác → ẩn
  manage.value && checkedTasks.value.length && checkedTasks.value.every(t => stageOf(t) === 'design') ? { id: 'qualityRating', label: 'Cập nhật mức hài lòng', icon: 'mood-smile' } : null,
  iterations.value.length > 1 ? { id: 'move', label: 'Chuyển sang vòng lặp khác', icon: 'arrows-exchange' } : null,
  { id: 'delete', label: 'Xóa', icon: 'trash', danger: true },
].filter(Boolean))
function onBulkAction(id) {
  if (id === 'move') moving.value = true
  else if (id === 'delete') bulkDeleting.value = true
  else bulkField.value = id
}
/* Xóa hàng loạt (bỏ qua việc thuộc tháng đã chốt) */
const bulkDeleting = ref(false)
const checkedTasks  = computed(() => db.tasks.filter(t => checked.value.includes(t.id)))
const lockedChecked = computed(() => checkedTasks.value.filter(isTaskLocked))
const deletable     = computed(() => checkedTasks.value.filter(t => !isTaskLocked(t)))
function onBulkDelete() {
  const ids = deletable.value.map(t => t.id)
  let n = 0
  for (const id of ids) if (deleteTask(id)) n++
  if (ids.includes(drawerTaskId.value)) drawerTaskId.value = null
  bulkDeleting.value = false; checked.value = []
  toast.success(`Đã xóa ${n} công việc${lockedChecked.value.length ? ` · bỏ qua ${lockedChecked.value.length} việc đã chốt` : ''}`)
}
const CHECK_COL = { key: 'check', label: '', type: 'checkbox', width: 48 }
/* Cột tick: Quản trị dự án chọn mọi việc · Thành viên chọn được việc mình thêm (việc của người khác: ô tick mờ) */
const bulkable = computed(() => manage.value || (canAdd.value && iterTasks.value.some(isOwnTask)))
const tableColumns = computed(() => (bulkable.value ? [CHECK_COL, ...viewColumns.value] : viewColumns.value))

/* ── Bảng công việc ── */
/* Thứ tự theo mức người xem quan tâm: việc gì → đủ điểm chưa / được bao nhiêu → trạng thái → ai làm → hạn → đánh giá
   → thông số tính điểm → thông tin tham khảo (giải pháp, link, concept) ở cuối */
const columns = [
  /* Nguyên tắc: cột nào TÍNH TỪ cột khác thì nằm SAU các cột đó (đọc trái → phải đúng thứ tự công thức) */
  { key: 'pbi',           label: 'PBI',                    width: 100 },
  { key: 'content',       label: 'Nội dung',               type: 'icon-text', minWidth: 280 },
  { key: 'stage',         label: 'Loại việc',              type: 'tag', width: 130 },
  { key: 'designStatus',  label: 'Trạng thái',             type: 'status', width: 180 },
  { key: 'ba',            label: 'BA',                     type: 'avatar-text', width: 190 },
  { key: 'pd',            label: 'PD',                     type: 'avatar-text', width: 190 },
  // Điểm PD thực nhận đứng ngay sau tên PD — nhìn người là thấy điểm (ngoại lệ của thứ tự công thức)
  { key: 'finalScore',    label: 'Điểm PD sau đánh giá',   width: 190, align: 'right', tip: 'Điểm PD thực nhận = Điểm PD × hệ số mức hài lòng — điểm được cộng vào tháng' },
  // BA: BA Point · deadline + ngày hoàn thành ⇒ Point tiến độ · chất lượng ⇒ Point chất lượng ⇒ Điểm thực nhận
  { key: 'baPoint',       label: 'BA Point',               width: 124, align: 'right', tip: 'Điểm PO chấm ban đầu cho phần phân tích (Story Point) — gốc để tính Point tiến độ, Point chất lượng và Điểm thực nhận' },
  { key: 'baDeadline',    label: 'Deadline phân tích',     width: 170, tip: 'Hạn phân tích — hoàn thành sau ngày này mà không được miễn trừ thì Point tiến độ = 0' },
  { key: 'baCompletedDate', label: 'Ngày hoàn thành (BA)', width: 190, tip: 'Ngày phân tích xong, có đầu ra dùng được — Điểm thực nhận tính vào tháng của ngày này' },
  { key: 'baProgressPoint', label: 'Point tiến độ',        width: 156, align: 'right', tip: 'Point tiến độ = BA Point × Hệ số tiến độ (100% đúng hạn / được miễn trừ trễ · 0% trễ) — theo template Chi tiết công việc BA' },
  { key: 'baQuality',     label: 'Chất lượng (BA)',        type: 'tag', width: 220, tip: 'Kết quả chất lượng PO chấm (100% / 80% / 50%) — Point chất lượng = BA Point × hệ số này' },
  { key: 'baQualityPoint', label: 'Point chất lượng',      width: 176, align: 'right', tip: 'Point chất lượng = BA Point × Hệ số chất lượng — chưa đánh giá chất lượng thì để trống' },
  { key: 'baScore',       label: 'Điểm thực nhận',         width: 176, align: 'right', tip: 'Điểm thực nhận của BA cho việc này = BA Point × tỷ trọng + Point tiến độ × tỷ trọng + Point chất lượng × tỷ trọng (theo Quy tắc BA) — cộng vào Điểm BA tháng' },
  // PD: ngày (tháng tính điểm) · số màn · hệ số (độ phức tạp, người đưa giải pháp, dự án phụ trách, nền tảng) ⇒ Điểm PD · mức hài lòng (Điểm PD sau đánh giá đã đưa lên cạnh cột PD)
  { key: 'expectedDate',  label: 'Deadline thiết kế',      width: 170, tip: 'Hạn hoàn thành phần thiết kế của PD' },
  { key: 'completedDate', label: 'Ngày hoàn thành (PD)',   width: 190, tip: 'Ngày thiết kế xong — Điểm PD tính vào tháng của ngày này' },
  { key: 'mainScreens',   label: 'Số lượng màn hình chính', width: 210, align: 'right' },
  { key: 'subScreens',    label: 'Số lượng màn hình phụ',  width: 200, align: 'right' },
  { key: 'complexity',    label: 'Độ phức tạp thiết kế',   width: 200 },
  { key: 'businessLevel', label: 'Hệ số nghiệp vụ',        width: 170 },
  { key: 'solutionBy',    label: 'Người đưa giải pháp',    width: 190 },
  { key: 'isOwnProject',  label: 'Là dự án phụ trách',     width: 170 },
  { key: 'platform',      label: 'Nền tảng',               width: 130 },
  { key: 'score',         label: 'Điểm PD',                width: 124, align: 'right', tip: 'Điểm thiết kế của PD = Số màn quy đổi × hệ số độ phức tạp × người đưa giải pháp × dự án phụ trách × nền tảng (chưa tính mức hài lòng)' },
  { key: 'qualityRating', label: 'Mức hài lòng (PD)',      type: 'tag', width: 180, tip: 'Đánh giá chất lượng thiết kế — nhân hệ số vào Điểm PD để ra Điểm PD sau đánh giá' },
  { key: 'ratingReason',  label: 'Lý do đánh giá (PD)',    minWidth: 260 },
  // Tính điểm: kiểm tra đủ mọi trường phía trên → đứng sau cùng
  { key: 'readiness',     label: 'Tính điểm',              type: 'status', width: 150, tip: 'Đã đủ các trường để có điểm chưa (theo giai đoạn đang làm: phân tích → Điểm BA, thiết kế → Điểm PD)' },
  // Tham khảo
  { key: 'designLink',    label: 'Link thiết kế',          type: 'swap-component', component: LinkCell, width: 140, noFilter: true },
  { key: 'devmodeLink',   label: 'Link devmode',           type: 'swap-component', component: LinkCell, width: 140, noFilter: true },
  { key: 'concept',       label: 'Concept',                width: 220 },
]
/* Nhận biết cột của ai: chấm màu trước tên cột (BA tím · PD xanh ngọc) — cột chung (PBI, Nội dung, Loại việc, Trạng thái, Tính điểm) không màu */
const BA_COLS = ['ba', 'baPoint', 'baScore', 'baDeadline', 'baCompletedDate', 'baProgressPoint', 'baQuality', 'baQualityPoint']   // cột của BA (chấm tím) — ẩn ở chế độ xem PD
const PD_COLS = ['pd', 'score', 'finalScore', 'expectedDate', 'completedDate', 'qualityRating', 'mainScreens', 'subScreens', 'complexity', 'businessLevel', 'platform', 'isOwnProject', 'ratingReason', 'solutionBy', 'designLink', 'devmodeLink', 'concept']
const ACCENT_TIP = { BA: 'Chấm tím: cột của BA (giai đoạn phân tích)', PD: 'Chấm xanh: cột của PD (giai đoạn thiết kế)' }
for (const c of columns) {
  const who = BA_COLS.includes(c.key) ? 'BA' : PD_COLS.includes(c.key) ? 'PD' : ''
  if (who) Object.assign(c, { accent: `var(--role-${who.toLowerCase()})`, accentTip: ACCENT_TIP[who] })
}

/* ── Thiết lập cột & lọc nâng cao (lưu theo từng người xem) ── */
/* Xem theo (cạnh tên dự án): Tất cả = cột tùy chỉnh (mặc định đủ) · BA = cột chung + cột BA · PD = cột chung + cột PD (giữ thứ tự đã kéo) */
const VIEW_MODES = [
  { id: 'all', label: 'Tất cả', tip: 'Hiện các cột theo Thiết lập cột (kéo / ẩn / hiện tùy ý)' },
  { id: 'BA', label: 'BA', dot: 'var(--role-ba)', tip: 'Chỉ cột chung + cột của BA' },
  { id: 'PD', label: 'PD', dot: 'var(--role-pd)', tip: 'Chỉ cột chung + cột của PD' },
]
const viewPref = userPref('task-view-mode', 'all')
/* PD Lead: chỉ phía PD — luôn xem cột chung + cột PD, không thấy cột / lọc BA */
const pdOnly = computed(() => currentUser.value?.role === 'PDL')
const viewMode = computed({ get: () => (pdOnly.value ? 'PD' : viewPref.value), set: v => { viewPref.value = v } })
const cols = useColumnSettings('tasks-v9-all', columns, { locked: ['content'] })   // v9: Điểm PD sau đánh giá lên cạnh cột PD
const viewColumns = computed(() => {
  if (viewMode.value === 'all') return cols.columns.value
  const hide = viewMode.value === 'BA' ? PD_COLS : BA_COLS   // cùng danh sách cột chấm xanh (PD) / chấm tím (BA) trên tiêu đề
  // BA / PD: mọi cột của vai trò + cột chung đều hiện, theo thứ tự người dùng đã kéo
  return cols.state.value.map(st => columns.find(c => c.key === st.key)).filter(c => c && !hide.includes(c.key))
})
const showCols   = ref(false)
const showFilter = ref(false)
const users = (role) => performerOptions(project.value?.id, role)   // mọi thành viên (PO / Lead kiêm PD / BA)
const filterFields = computed(() => [
  { key: 'pbi',           label: 'PBI',                     type: 'text',   get: t => t.pbi },
  { key: 'content',       label: 'Nội dung',                type: 'text',   get: t => t.content },
  { key: 'readiness',     label: 'Tính điểm',               type: 'enum',   options: ['Đã chấm', 'Thiếu tiêu chí'], get: t => ((phaseOf(t) === 'analysis' ? missingBaFields(t) : missingScoreFields(t, db.config)).length ? 'Thiếu tiêu chí' : 'Đã chấm') },
  { key: 'stage',         label: 'Loại việc',               type: 'enum',   options: STAGES.map(s => s.label), get: t => STAGES.find(s => s.value === stageOf(t))?.label },
  { key: 'designStatus',  label: 'Trạng thái',              type: 'enum',   options: [...BA_STATUSES, ...DESIGN_STATUSES].map(s => s.value), get: t => taskStatusOf(t) },
  { key: 'pdId',          label: 'PD',                      type: 'enum',   options: users('PD'), get: t => t.pdId },
  { key: 'baId',          label: 'BA',                      type: 'enum',   options: users('BA'), get: t => t.baId },
  { key: 'solutionBy',    label: 'Người đưa giải pháp',     type: 'enum',   options: SOLUTION_ROLES, get: t => t.solutionBy },
  { key: 'complexity',    label: 'Độ phức tạp thiết kế',    type: 'enum',   options: COMPLEXITIES, get: t => t.complexity },
  { key: 'businessLevel', label: 'Hệ số nghiệp vụ',         type: 'enum',   options: BUSINESS_VALUES, get: t => t.businessLevel || DEFAULT_BUSINESS },
  { key: 'platform',      label: 'Nền tảng',                type: 'enum',   options: PLATFORMS, get: t => t.platform },
  { key: 'isOwnProject',  label: 'Là dự án phụ trách',      type: 'enum',   options: YES_NO, get: t => t.isOwnProject },
  { key: 'qualityRating', label: 'Mức hài lòng (PD)',       type: 'enum',   options: QUALITY_RATINGS.map(r => r.value), get: t => t.qualityRating },
  { key: 'baQuality',     label: 'Chất lượng (BA)',         type: 'enum',   options: BA_QUALITY_LEVELS.map(q => q.value), get: t => t.baQuality },
  { key: 'baPoint',       label: 'BA Point',                type: 'number', get: t => Number(t.baPoint) || 0 },
  { key: 'baCompletedDate', label: 'Ngày hoàn thành (BA)',  type: 'date',   get: t => t.baCompletedDate },
  { key: 'expectedDate',  label: 'Deadline thiết kế',       type: 'date',   get: t => t.expectedDate },
  { key: 'completedDate', label: 'Ngày hoàn thành (PD)',    type: 'date',   get: t => t.completedDate },
  { key: 'mainScreens',   label: 'Số lượng màn hình chính', type: 'number', get: t => Number(t.mainScreens) || 0 },
  { key: 'subScreens',    label: 'Số lượng màn hình phụ',   type: 'number', get: t => Number(t.subScreens) || 0 },
  { key: 'score',         label: 'Điểm',                    type: 'number', get: t => computeScore(t, db.config) },
  { key: 'finalScore',    label: 'Điểm sau đánh giá',       type: 'number', get: t => computeFinalScore(t, db.config) },
  { key: 'concept',       label: 'Concept',                 type: 'text',   get: t => t.concept },
  { key: 'designLink',    label: 'Link thiết kế',           type: 'text',   get: t => t.designLink },
  { key: 'devmodeLink',   label: 'Link devmode',            type: 'text',   get: t => t.devmodeLink },
  { key: 'ratingReason',  label: 'Lý do đánh giá',          type: 'text',   get: t => t.ratingReason },
])
const adv = useAdvancedFilter('tasks', filterFields)

const rowActions = computed(() => [
  { icon: 'eye', title: 'Xem / cập nhật', emit: 'open' },
  // Nhận việc: chỉ hiện ở dòng còn trống PD / BA mà mình nhận được (đúng bộ phận, thành viên dự án)
  { icon: 'user-plus', title: 'Nhận việc (gán chính mình)', emit: 'claim', show: r => canClaim(r._task, 'pd') || canClaim(r._task, 'ba') },
  ...(canAddTask(project.value?.id) ? [{ icon: 'copy', title: 'Nhân bản', emit: 'duplicate' }] : []),
  // Quản trị dự án + PO của dự án: xóa mọi việc · Thành viên: chỉ việc mình thêm (bấm việc khác → báo không có quyền)
  ...(manage.value || myProjectRole(project.value?.id) === 'member' ? [{ icon: 'trash', title: 'Xóa', emit: 'delete', danger: true }] : []),
])

function claimRow(t) {
  const slot = canClaim(t, 'pd') ? 'pd' : 'ba'
  const r = claimTask(t, slot)
  r === true ? toast.success(`Đã nhận việc “${t.content}” — bạn là ${slot === 'pd' ? 'PD thực hiện' : 'BA phân tích'}`) : toast.warning(r)
}
const iterTasks = computed(() => activeIter.value ? tasksOf(activeIter.value.id) : [])

const rows = computed(() => {
  const q = search.value.trim()
  // Tìm theo nhiều tiêu chí (quy tắc chung: không dấu, chữ cái đầu): PBI, nội dung, PD / BA (tên, mã, email), trạng thái
  const person = id => { const u = userById(id); return u ? [u.name, u.code, u.email, u.companyEmail] : [] }
  return iterTasks.value
    .filter(t => !q || matchText([t.pbi, t.content, ...person(t.pdId), ...person(t.baId), taskStatusOf(t)], q))
    .filter(t => !pdPeopleFilter.value.length || pdPeopleFilter.value.includes(t.pdId))
    .filter(t => !baPeopleFilter.value.length || baPeopleFilter.value.includes(t.baId))
    .filter(t => !on(pdStatusFilter) || (hasDesign(t) && pdStatusOf(t) === pdStatusFilter.value))
    .filter(t => !on(baStatusFilter) || (hasAnalysis(t) && baPartStatusOf(t) === baStatusFilter.value))
    .filter(t => adv.test(t))
    .map(t => {
      const pd = hasDesign(t), ba = baScoreOf(t, db.config)
      const score = pd ? computeScore(t, db.config) : ''
      const finalScore = pd ? computeFinalScore(t, db.config) : ''
      const miss = phaseOf(t) === 'analysis' ? missingBaFields(t) : missingScoreFields(t, db.config)
      return {
        id: t.id,
        _task: t,
        // Dòng đang mở drawer luôn được đánh dấu (nền + vạch xanh đầu dòng) — độc lập với ô tick chọn hàng loạt
        _mark: t.id === drawerTaskId.value ? 'current' : reasonMissing(t) ? 'warning' : '',   // Rất / Không hài lòng mà chưa có lý do → vạch cam đầu dòng
        _noSelect: !canBulkTask(t),   // Thành viên: việc người khác thêm → không tick được
        _sort: { expectedDate: t.expectedDate, completedDate: t.completedDate, baDeadline: t.baDeadline, baCompletedDate: t.baCompletedDate, baPoint: Number(t.baPoint) || 0, score, finalScore, baScore: ba?.actual ?? -1, baProgressPoint: ba?.progressPoint ?? -1, baQualityPoint: ba?.qualityPoint ?? -1, mainScreens: t.mainScreens, subScreens: t.subScreens, readiness: miss.length },
        pbi: t.pbi ?? '',
        // Mọi dòng đều có icon → chữ thẳng hàng: đã chốt = khóa, còn lại = icon trạng thái thiết kế
        content: isTaskLocked(t)
          ? { icon: 'lock', iconColor: 'danger', iconTitle: 'Đã chốt điểm — không sửa được', text: t.content }
          : (st => ({ icon: st?.icon ?? 'clock', iconColor: st?.iconColor ?? 'warning', iconTitle: taskStatusOf(t) || 'Chưa có trạng thái', text: t.content }))(taskStatusMeta(t)),
        stage: (x => ({ label: x.short, color: x.value === 'design' ? 'neutral' : x.value === 'analysis' ? 'warning' : 'brand' }))(STAGES.find(x => x.value === stageOf(t))),
        readiness: miss.length ? { label: `Thiếu ${miss.length} tiêu chí`, color: 'warning' } : { label: 'Đã chấm', color: 'success' },
        baScore: ba ? (ba.actual ?? '—') : '',
        // Point tiến độ / chất lượng (template Chi tiết công việc BA): chỉ có khi đã có Ngày hoàn thành (BA); chất lượng chưa đánh giá → '—'
        baProgressPoint: hasAnalysis(t) ? (ba ? ba.progressPoint : '') : '',
        baQualityPoint: hasAnalysis(t) ? (ba ? (ba.qualityPoint ?? '—') : '') : '',
        baPoint: hasAnalysis(t) ? (t.baPoint === '' || t.baPoint == null ? '' : t.baPoint) : '',
        baDeadline: formatDate(t.baDeadline),
        baCompletedDate: formatDate(t.baCompletedDate),
        baQuality: hasAnalysis(t) && t.baQuality ? { label: `${baConfigOf(db.config).quality[t.baQuality] ?? ''}% — ${t.baQuality}`, color: BA_QUALITY_LEVELS.find(q => q.value === t.baQuality)?.color ?? 'neutral' } : null,
        designLink: t.designLink,
        designStatus: { label: taskStatusOf(t), color: taskStatusMeta(t)?.color ?? 'neutral' },
        solutionBy: t.solutionBy,
        devmodeLink: t.devmodeLink,
        concept: t.concept,
        pd: t.pdId ? { text: userName(t.pdId), avatar: avatarOf(userById(t.pdId)) } : null,
        ba: t.baId ? { text: userName(t.baId), avatar: avatarOf(userById(t.baId)) } : null,
        expectedDate: formatDate(t.expectedDate),
        completedDate: formatDate(t.completedDate),
        complexity: t.complexity,
        businessLevel: t.businessLevel || (t.complexity ? DEFAULT_BUSINESS : ''),
        mainScreens: t.mainScreens,
        subScreens: t.subScreens,
        isOwnProject: t.isOwnProject,
        platform: t.platform,
        score,
        qualityRating: t.qualityRating ? { label: t.qualityRating, color: qualityColor(t.qualityRating) } : null,
        finalScore,
        ratingReason: t.ratingReason,
      }
    })
})

const view = useTableView(rows, { sortValue: (r, k) => r._sort[k] ?? (r[k]?.label ?? r[k]?.text ?? r[k]) })

/* KPI vòng lặp — theo ô “Xem theo”: Tất cả = PD + BA · BA = phần phân tích · PD = phần thiết kế
   Xong: PD theo Ngày hoàn thành (PD) · BA theo Ngày hoàn thành (BA) · Tất cả: việc đã xong phần cuối cùng của nó */
const r1 = n => Math.round(n * 10) / 10
const kpis = computed(() => {
  const list = iterTasks.value, mode = viewMode.value
  const pdDone = t => hasDesign(t) && !!t.completedDate, baDone = t => hasAnalysis(t) && !!t.baCompletedDate
  const pdPts = r1(list.filter(pdDone).reduce((a, t) => a + computeFinalScore(t, db.config), 0))
  const baPts = r1(list.filter(baDone).reduce((a, t) => a + (baScoreOf(t, db.config)?.actual ?? 0), 0))
  const scope = mode === 'BA' ? list.filter(hasAnalysis) : mode === 'PD' ? list.filter(hasDesign) : list
  const isDone = mode === 'BA' ? baDone : mode === 'PD' ? pdDone : t => (hasDesign(t) ? pdDone(t) : baDone(t))
  const done = scope.filter(isDone).length
  const doneLabel = mode === 'BA' ? 'Đã hoàn thành (BA)' : mode === 'PD' ? 'Đã hoàn thành (PD)' : 'Đã hoàn thành'
  return [
    { label: mode === 'all' ? 'Tổng công việc' : `Công việc có phần ${mode}`, value: scope.length, icon: 'clipboard-list', theme: 'blue',
      sub: mode === 'all' ? `${list.filter(hasAnalysis).length} có phân tích · ${list.filter(hasDesign).length} có thiết kế` : '' },
    { label: doneLabel, value: done, icon: 'circle-check', theme: 'success' },
    { label: 'Đang thực hiện', value: scope.length - done, icon: 'clock', theme: 'warning' },
    mode === 'BA' ? { label: 'Điểm thực nhận (đã xong)', value: baPts, icon: 'trophy', theme: 'purple', sub: 'Tổng Điểm thực nhận các việc' }
      : mode === 'PD' ? { label: 'Điểm PD sau đánh giá (đã xong)', value: pdPts, icon: 'trophy', theme: 'purple' }
      : { label: 'Tổng điểm (đã xong)', value: r1(pdPts + baPts), icon: 'trophy', theme: 'purple', sub: `PD ${fmtNum(pdPts)} · BA ${fmtNum(baPts)}` },
  ]
})

/* ── Dialog công việc ── */
const taskEditing  = ref(null)
// Từ Tổng quan (Dự án yêu thích → Thêm việc): ?them=1 → mở form thêm công việc vào vòng lặp đang chọn
watch(activeIter, it => {
  if (route.query.them !== '1' || !it) return
  router.replace({ query: { ...route.query, them: undefined } })
  if (canAddTask(project.value?.id)) taskEditing.value = {}
}, { immediate: true })
/* Nhân bản: mở form Thêm công việc điền sẵn (vào vòng lặp đang xem) */
function duplicateTask(t) { if (!t) return; drawerTaskId.value = null; taskEditing.value = { copyFrom: t } }
const taskDeleting = ref(null)
/* ── Drawer xem nhanh: bấm dòng → mở bên phải, sửa trường nào lưu trường đó ── */
// Từ thông báo (quả chuông): ?cv=<id công việc> → mở luôn bảng chi tiết của việc đó
watch([() => route.query.cv, () => db.tasks.length], ([cv]) => {
  if (!cv || !db.tasks.some(t => t.id === cv)) return
  drawerTaskId.value = cv
  router.replace({ query: { ...route.query, cv: undefined } })
}, { immediate: true })
function openTask(r) { drawerTaskId.value = r.id }
/* Drawer đang mở → ↑ / ↓ chuyển công việc trước / sau (theo đúng thứ tự đang lọc + sắp xếp, sang trang khác nếu cần) */
useArrowNav({
  ids: () => view.processed.value.map(r => r.id), current: drawerTaskId,
  select: (id, i) => { drawerTaskId.value = id; view.page.value = Math.floor(i / view.pageSize.value) + 1 },
})
function askDeleteTask(t) {
  if (isTaskLocked(t)) infoMessage.value = `“${t.content}” thuộc tháng đã chốt điểm nên không thể xóa.`
  else if (!canDeleteTask(t)) infoMessage.value = `Bạn chỉ xóa được công việc do chính mình thêm — “${t.content}” do người khác thêm.`
  else taskDeleting.value = t
}
function onDeleteTask() {
  if (drawerTaskId.value === taskDeleting.value.id) drawerTaskId.value = null
  if (deleteTask(taskDeleting.value.id)) toast.success('Đã xóa công việc')
  taskDeleting.value = null
}

function exportCsv() {
  const header = columns.map(c => c.label)
  // Dữ liệu theo đúng thứ tự cột (tiêu đề = nhãn cột)
  const valueOf = (r, k) => {
    const t = r._task
    return ({ content: t.content, stage: STAGES.find(x => x.value === stageOf(t))?.label, readiness: r.readiness?.label, designStatus: taskStatusOf(t),
      pd: userName(t.pdId), ba: userName(t.baId), qualityRating: t.qualityRating, designLink: t.designLink, devmodeLink: t.devmodeLink })[k] ?? (typeof r[k] === 'object' ? (r[k]?.label ?? r[k]?.text ?? '') : r[k])
  }
  const data = view.processed.value.map(r => columns.map(c => valueOf(r, c.key) ?? ''))
  downloadCsv(`${project.value.code}-${activeIter.value.name}.csv`, header, data)
}
/* Link “làm ngay” (VD AVA gửi): ?mo=vong-lap | cong-viec | nhap-nhanh | nhap-excel | sua-du-an → mở hộp thoại tương ứng nếu có quyền */
watch([() => route.query.mo, project], ([mo, p]) => {
  if (!mo || !p) return
  router.replace({ query: { ...route.query, mo: undefined } })
  const needIter = ['cong-viec', 'nhap-nhanh', 'nhap-excel'].includes(mo)
  if (mo === 'vong-lap' || mo === 'sua-du-an') {
    if (!manage.value) { infoMessage.value = 'Bạn chưa phải Quản trị của dự án này nên chưa tạo vòng lặp / sửa dự án được. Nhờ Quản trị hệ thống hoặc Quản trị dự án đặt vai trò “Quản trị” cho bạn.'; return }
    if (mo === 'vong-lap') iterEditing.value = {}; else projectEditing.value = true
  } else if (needIter) {
    if (!canAdd.value) { infoMessage.value = 'Bạn chỉ có quyền xem ở dự án này nên chưa thêm công việc được.'; return }
    if (!activeIter.value) { if (manage.value) { iterEditing.value = {}; infoMessage.value = 'Dự án chưa có vòng lặp — tạo vòng lặp trước, sau đó thêm công việc vào vòng lặp đó.' } else infoMessage.value = 'Dự án chưa có vòng lặp — nhờ Quản trị dự án tạo vòng lặp trước.'; return }
    if (mo === 'cong-viec') taskEditing.value = {}
    else if (mo === 'nhap-nhanh') quickAdding.value = true
    else importing.value = 'file'
  }
}, { immediate: true })
</script>

<style scoped>
.sheet-state { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-body); color: var(--text-secondary); cursor: default; }
.sheet-state--error { color: var(--text-danger); }
.sheet-state .ti { font-size: 14px; }
.pdp-logo { width: 32px; height: 32px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; overflow: hidden; border-radius: var(--radius-default); background: var(--bg-white); }
.pdp-logo img { width: 100%; height: 100%; object-fit: contain; }
.pdp-logo--initials { border: 1px solid var(--stroke-neutral-light); background: var(--bg-brand-light); color: var(--text-brand); font-size: 12px; font-weight: var(--fw-semibold); }
.bulk-del__warn { /* box thấp 1–2 dòng → icon căn giữa dọc (skill: Box / card thấp) */ display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--radius-default); background: var(--bg-danger-light); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.bulk-del__warn .ti { color: var(--icon-danger); flex-shrink: 0; }
.bulk-del__warn strong { font-weight: var(--fw-semibold); color: var(--text-danger); }
.bulk-del__list { margin: 0; padding-left: 20px; max-height: 180px; overflow-y: auto; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.bulk-del__more { color: var(--text-secondary); list-style: none; margin-left: -20px; }
.bulk-del__skip { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-warning); }
.my-role { display: inline-flex; cursor: help; }
.iter-range { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-body); color: var(--text-primary); white-space: nowrap; }
.iter-range .ti { font-size: 16px; color: var(--icon-neutral); }
  /* chừa chỗ cho icon absolute */


.empty-card { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
.empty-card__text { font-size: var(--text-body-md); color: var(--text-primary); }
.empty-card__hint { font-size: var(--text-body); color: var(--text-secondary); }

@media (max-width: 1024px) { .kpi-row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.view-switch { display: inline-flex; align-items: center; gap: 2px; padding: 2px; border-radius: var(--radius-default); background: var(--bg-neutral-light); }
.view-switch__k { margin-left: 16px; font-size: var(--text-body); color: var(--text-secondary); white-space: nowrap; }   /* nhãn đứng ngoài segment cho khỏi nhầm là 1 lựa chọn */
.view-switch__btn { font-weight: var(--fw-semibold); display: inline-flex; align-items: center; gap: 6px; height: calc(var(--btn-height) - 4px); padding: 0 12px; border: none; border-radius: calc(var(--radius-default) - 2px); background: transparent;
  font-family: inherit; font-size: var(--text-body); color: var(--text-primary); cursor: pointer; white-space: nowrap; }
.view-switch__btn:hover:not(.view-switch__btn--on) { color: var(--text-primary); background: var(--bg-brand-light); }
.view-switch__btn--on { background: var(--bg-white); color: var(--text-brand); box-shadow: var(--shadow-sm); }
.view-switch__dot { width: 6px; height: 6px; border-radius: 50%; }
</style>
