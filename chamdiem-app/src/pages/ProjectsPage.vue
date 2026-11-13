<template>
  <AppShell>
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title h2">Dự án</h1>
      </div>
      <div class="page-header__right">
        <button v-if="canCreate" class="btn btn--primary" @click="editing = {}"><TIcon name="plus" />Thêm dự án</button>
      </div>
    </div>

    <div class="content-wrapper content-wrapper--fill">
      <div class="list-split">
          <div class="table-panel">
          <TableHeader v-model="search" search-placeholder="Tìm dự án" :search-width="240" :hide-ai="true" :filter-count="adv.active.value.length"
            @refresh="search = ''; divisionFilter = ''" @export="exportCsv" @col-settings="showCols = true" @open-filter="showFilter = !showFilter">
            <template #filters>
              <AppCombobox v-model="divisionFilter" class="filter-box pdp-division-filter" :options="divisionFilterOptions" placeholder="Khối: Tất cả" collapsible />
              <!-- Gom theo khối trong cây (mở / đóng từng khối) — tắt để xem dạng danh sách có phân trang -->
              <button type="button" class="btn btn--outline btn--neutral" :class="{ 'btn--active': grouped }" :aria-pressed="grouped" @click="toggleGrouped"
                v-tip="grouped ? 'Đang gom theo khối (cây cha › con) — bấm để xem dạng danh sách' : 'Gom dự án theo khối (cây cha › con)'">
                <TIcon name="folders" />Gom theo khối
              </button>
              <!-- Đang gom: 1 nút thu gọn / mở rộng TẤT CẢ khối -->
              <button v-if="grouped" type="button" class="btn-icon btn-icon--outline" :aria-label="allCollapsed ? 'Mở rộng tất cả' : 'Thu gọn tất cả'"
                v-tip="allCollapsed ? 'Mở rộng tất cả khối' : 'Thu gọn tất cả khối'" @click="allCollapsed ? tableRef?.expandAll() : tableRef?.collapseAll()">
                <TIcon :name="allCollapsed ? 'unfold' : 'fold'" />
              </button>
            </template>
          </TableHeader>
          <FilterChips :fmt-date="formatDate" :active="adv.active.value" :mode="adv.filter.value.mode" :field-of="adv.fieldOf"
            @remove="adv.remove" @clear="adv.clear" @edit="showFilter = true" />
        
          <div class="table-scroll">
            <DataTable ref="tableRef"
              :columns="cols.columns.value"
              @column-wrap="(c, v) => cols.setWrap(c.key, v)" @column-resize="(c, w) => cols.setWidth(c.key, w)"
              :line-count="0"
              :rows="grouped ? groupedRows : view.paged.value"
              :group-by="grouped ? '_groupKey' : ''" :group-label="groupLabel" group-storage-key="pdpoint-projects"
              :hide-blank-rows="false"
              :row-actions="rowActions"
              @row-click="r => router.push('/du-an/' + r.id)"
              @edit="onEdit"
              @delete="r => deleting = projectById(r.id)"
              @column-sort="view.onSort"
              @column-filter="view.onFilter"
            />
            <div v-if="!rows.length" class="empty-state">
              {{ canCreate ? 'Chưa có dự án nào. Bấm “Thêm dự án” để tạo dự án đầu tiên.' : 'Bạn chưa được phân quyền vào dự án nào. Liên hệ PO hoặc Quản trị để được thêm vào dự án.' }}
            </div>
          </div>
          <TablePaging v-if="!grouped" :total="view.processed.value.length" v-model:page="view.page.value" v-model:page-size="view.pageSize.value" />
          <div v-else class="pdp-grouped-total">Tổng số: <strong>{{ view.processed.value.length }}</strong> dự án · {{ groupCount }} khối</div>
        </div>
        <AdvancedFilterPanel v-if="showFilter" :fields="filterFields" :filter="adv.filter.value" @apply="adv.apply" @close="showFilter = false" />
      </div>
    </div>

    <ColumnSettingsDialog v-if="showCols" :columns="columns" :state="cols.state.value" :locked="LOCKED" :defaults="cols.defaults"
      @apply="cols.save" @close="showCols = false" />
    <ConfirmDialog v-if="notice" title="Không có quyền" :message="notice" :hide-confirm="true" cancel-label="Đóng" @cancel="notice = ''" />
    <ProjectDialog v-if="editing" :project="editing.id ? editing : null" @sync="id => router.push({ path: '/du-an/' + id, query: { dongbo: '1' } })" @close="editing = null" />
    <ConfirmDialog v-if="deleting" title="Xóa dự án"
      :message="`Xóa dự án “${deleting.name}” sẽ xóa toàn bộ vòng lặp và công việc bên trong. Bạn chắc chắn?`"
      @cancel="deleting = null" @confirm="onDeleteProject" />
    <ConfirmDialog v-if="infoMessage" title="Không thể xóa dự án" :message="infoMessage"
      :hide-confirm="true" cancel-label="Đóng" @cancel="infoMessage = ''" />
  </AppShell>
</template>

<script setup>
import { formatDate } from '../store/scoring.js'
import { avatarOf } from '../store/avatar.js'
import StarCell from '../components/StarCell.vue'
import { userPref } from '../store/userPrefs.js'
import { vTip } from '@mds/utils/tooltip.js'
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppShell      from '../components/AppShell.vue'
import ProjectDialog from '../components/ProjectDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import TIcon       from '@mds/components/TIcon.vue'
import TableHeader from '@mds/components/TableHeader.vue'
import DataTable   from '@mds/components/DataTable.vue'
import TablePaging from '@mds/components/TablePaging.vue'
import { divisionPath, divisionOptions, divisionWithChildren, db, myProjects, projectById, iterationsOf, membersOf, isAdmin, canCreateProject, canManageProject, myProjectRole, PROJECT_ROLES, deleteProject, divisionName } from '../store/db.js'
import AppCombobox from '@mds/components/AppCombobox.vue'
import ColumnSettingsDialog from '../components/ColumnSettingsDialog.vue'
import AdvancedFilterPanel  from '@mds/components/TableFilterPanel.vue'
import FilterChips          from '@mds/components/TableFilterTags.vue'
import { useColumnSettings } from '../store/useColumnSettings.js'
import { useAdvancedFilter } from '../store/advancedFilter.js'
import { useTableView } from '../store/useTableView.js'
import { downloadCsv } from '../store/csv.js'

const router   = useRouter()
const infoMessage = ref('')
function onDeleteProject() {
  if (!deleteProject(deleting.value.id)) infoMessage.value = `Dự án “${deleting.value.name}” có công việc thuộc tháng đã chốt điểm nên không thể xóa.`
  deleting.value = null
}
const search   = ref('')
const editing  = ref(null)
const deleting = ref(null)
const admin     = computed(() => isAdmin())
const canCreate = computed(() => canCreateProject())

const columns = [
  { key: 'fav',        label: '',            type: 'swap-component', component: StarCell, width: 48, noFilter: true },   // ☆ dự án yêu thích → Tổng quan
  { key: 'code',       label: 'Mã',          width: 96 },
  { key: 'name',       label: 'Tên dự án',   type: 'avatar-subtext', avatarSquare: true, minWidth: 280, link: true },   // logo (trống → chữ cái đầu)
  { key: 'division',   label: 'Khối',        width: 280 },
  { key: 'myRole',     label: 'Vai trò của bạn', type: 'status', width: 150 },
  { key: 'po',         label: 'PO',          type: 'group-avatar', width: 120, noFilter: true },
  { key: 'ba',         label: 'BA',          type: 'group-avatar', width: 120, noFilter: true },
  { key: 'pd',         label: 'PD',          type: 'group-avatar', width: 140, noFilter: true },
  { key: 'iterations', label: 'Số vòng lặp', width: 130, align: 'right' },
  { key: 'tasks',      label: 'Số công việc', width: 140, align: 'right' },
]
// Quản trị dự án sửa được thông tin + thành viên; chỉ Quản trị hệ thống được xóa
const rowActions = computed(() => [
  ...(myProjects.value.some(p => canManageProject(p.id)) ? [{ icon: 'pencil', title: 'Sửa', emit: 'edit' }] : []),
  ...(admin.value ? [{ icon: 'trash', title: 'Xóa', emit: 'delete', danger: true }] : []),
])

/* ── Thiết lập cột & lọc nâng cao ── */
const LOCKED = ['name']
const cols = useColumnSettings('projects-v2', columns, { locked: LOCKED })
const showCols = ref(false), showFilter = ref(false)
const filterFields = computed(() => [
  { key: 'code',       label: 'Mã',           type: 'text',   get: r => r.code },
  { key: 'name',       label: 'Tên dự án',    type: 'text',   get: r => r.name.text },
  { key: 'division',   label: 'Khối',         type: 'enum',   options: divisionOptions(), get: r => r._divisionId },
  { key: 'members',    label: 'Thành viên',   type: 'enum',   options: db.users.filter(u => u.role !== 'admin' && u.status !== 'disabled').map(u => ({ value: u.id, label: u.name })), get: r => r._memberIds, multi: true },
  { key: 'iterations', label: 'Số vòng lặp',  type: 'number', get: r => r.iterations },
  { key: 'tasks',      label: 'Số công việc', type: 'number', get: r => r.tasks },
])
const adv = useAdvancedFilter('projects', filterFields)

const notice = ref('')
function onEdit(r) {
  if (canManageProject(r.id)) editing.value = projectById(r.id)
  else notice.value = 'Chỉ Quản trị của dự án mới sửa được thông tin và thành viên dự án.'
}

/* Lọc theo khối: Tất cả hoặc 1 khối */
const divisionFilter = userPref('projects-division', '')   // nhớ khối đang lọc theo người dùng
// Cây lọc khối: nút gốc “Tất cả” (bỏ lọc, luôn mở sẵn) → các khối là con của nó · nhãn = đường dẫn “Khối › Nhóm”
const divisionFilterOptions = computed(() => [
  { value: '', label: 'Khối: Tất cả', text: 'Tất cả', depth: 0, parent: true, open: true },
  ...divisionOptions().map(o => ({ ...o, depth: o.depth + 1 })),
])
const rows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return myProjects.value
    .filter(p => !q || (p.name + ' ' + p.code).toLowerCase().includes(q))
    .filter(p => !divisionFilter.value || divisionWithChildren(divisionFilter.value).has(p.divisionId))   // lọc khối cha → gồm cả khối con
    .map(p => {
      const people = role => membersOf(p.id, role).map(u => ({ name: u.name, avatar: avatarOf(u) }))
      return {
        id: p.id,
        code: p.code,
        name: { text: p.name, subtext: p.description, avatar: p.logo || '' },
        division: divisionPath(p.divisionId) || '–', _divisionId: p.divisionId || '', _groupKey: divisionPath(p.divisionId) ? p.divisionId : '',
        myRole: (r => r && { label: r.label, color: r.color })(PROJECT_ROLES.find(x => x.value === myProjectRole(p.id))),
        po: people('PO'), ba: people('BA'), pd: people('PD'),
        iterations: iterationsOf(p.id).length,
        tasks: db.projectTaskCount?.[p.id] ?? db.tasks.filter(t => t.projectId === p.id).length,   // máy chủ đếm cả việc chưa tải
        _memberIds: p.memberIds,
      }
    })
    .filter(r => adv.test(r))
})

const view = useTableView(rows)
/* Link “làm ngay” (VD AVA gửi): /du-an?mo=them → mở hộp thoại Thêm dự án nếu được tạo */
const route = useRoute()
watch(() => route.query.mo, mo => {
  if (mo !== 'them') return
  router.replace({ query: { ...route.query, mo: undefined } })
  if (canCreate.value) editing.value = {}
}, { immediate: true })

/* ── Gom theo khối trong cây: hiện hết (không phân trang), khối xếp theo thứ tự cây (cha trước con), dự án chưa chọn khối cuối cùng ── */
const grouped = userPref('projects-grouped', true)
const tableRef = ref(null)
const allCollapsed = computed(() => !!tableRef.value?.allCollapsed)
function toggleGrouped() { grouped.value = !grouped.value }
const treeOrder = computed(() => new Map(divisionOptions().map((o, i) => [o.value, i])))
const groupedRows = computed(() => [...view.processed.value].sort((a, b) => (treeOrder.value.get(a._groupKey) ?? 1e9) - (treeOrder.value.get(b._groupKey) ?? 1e9)))
const groupCount = computed(() => new Set(groupedRows.value.map(r => r._groupKey)).size)
const groupLabel = key => divisionPath(key) || 'Chưa chọn khối'

function exportCsv() {
  downloadCsv('du-an.csv',
    ['Mã', 'Tên dự án', 'Khối', 'Mô tả', 'Số vòng lặp', 'Số công việc'],
    view.processed.value.map(r => [r.code, r.name.text, r.division === '–' ? '' : r.division, r.name.subtext, r.iterations, r.tasks]))
}
</script>

<style scoped>
.pdp-grouped-total { display: flex; align-items: center; justify-content: flex-end; gap: 4px; padding: 8px 16px; border-top: 1px solid var(--stroke-divider); font-size: var(--text-body); color: var(--text-secondary); }
.pdp-grouped-total strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.pdp-division-filter { width: 240px; }
</style>
