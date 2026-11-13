<template>
  <AppShell>
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title h2">Người dùng &amp; phân quyền</h1>
      </div>
      <div class="page-header__right">
        <button v-if="admin || deptView" class="btn btn--primary" @click="editing = {}"><TIcon name="send" />Mời người dùng</button>
      </div>
    </div>

    <div v-if="!admin && !deptView && !managerView" class="content-wrapper">
      <div class="card"><p class="empty-text">Chỉ Quản trị hoặc quản lý trực tiếp mới truy cập được trang này.</p></div>
    </div>

    <div v-else class="content-wrapper content-wrapper--fill">
      <!-- Người tự đăng ký từ trang giới thiệu đang chờ duyệt (Quản trị) -->
      <div v-if="admin && pendingUsers.length" class="pending-bar">
        <TIcon name="user-plus" class="pending-bar__icon" />
        <span><strong>{{ pendingUsers.length }} người đăng ký</strong> đang chờ duyệt — mở từng người, chọn bộ phận / dự án rồi bấm “Duyệt &amp; cấp quyền”.</span>
        <button v-if="statusFilter !== 'pending'" class="btn btn--outline btn--sm" @click="statusFilter = 'pending'">Xem người chờ duyệt</button>
        <button v-else class="btn btn--link btn--sm" @click="statusFilter = ''">Xem tất cả</button>
      </div>
      <div class="list-split">
          <div class="table-panel">
          <TableHeader v-model="search" search-placeholder="Tìm người dùng" :search-width="240" :hide-ai="true" :filter-count="adv.active.value.length"
            @refresh="search = ''" @col-settings="showCols = true" @open-filter="showFilter = !showFilter">
            <template #filters>
              <AppCombobox v-model="roleFilter" class="filter-box" :options="roleOptions" placeholder="Bộ phận: Tất cả" />
              <AppCombobox v-model="statusFilter" class="filter-box" :options="statusOptions" placeholder="Trạng thái: Tất cả" />
              <AppCombobox v-model="divisionFilter" class="filter-box pdp-division-filter" :options="divisionFilterOptions" placeholder="Khối: Tất cả" collapsible />
              <!-- Gom theo khối (cây cha › con): mỗi khối hiện số nhân sự — khối cha kèm tổng gồm khối con -->
              <button type="button" class="btn btn--outline btn--neutral" :class="{ 'btn--active': grouped }" :aria-pressed="grouped" @click="grouped = !grouped"
                v-tip="grouped ? 'Đang gom theo khối — bấm để xem dạng danh sách' : 'Gom người dùng theo khối để xem mỗi khối có bao nhiêu nhân sự'">
                <TIcon name="folders" />Gom theo khối
              </button>
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
              :group-by="grouped ? '_groupKey' : ''" :group-label="groupLabel" group-storage-key="pdpoint-users"
              :hide-blank-rows="false"
              :row-actions="rowActions"
              @row-click="r => editing = userById(r.id)"
              @edit="r => editing = userById(r.id)"
              @delete="askDelete"
              @invite="onInviteRow"
              @column-sort="view.onSort"
              @column-filter="view.onFilter"
            />
          </div>
          <TablePaging v-if="!grouped" :total="view.processed.value.length" v-model:page="view.page.value" v-model:page-size="view.pageSize.value" />
        </div>
        <AdvancedFilterPanel v-if="showFilter" :fields="filterFields" :filter="adv.filter.value" @apply="adv.apply" @close="showFilter = false" />
      </div>
    </div>

    <ColumnSettingsDialog v-if="showCols" :columns="columns" :state="cols.state.value" :locked="LOCKED" :defaults="cols.defaults"
      @apply="cols.save" @close="showCols = false" />
    <UserDialog v-if="editing" :user="editing.id ? editing : null" @close="editing = null" @invited="(r, u) => inviteResult = { r, u }" />
    <InviteResultDialog v-if="inviteResult" :result="inviteResult.r" :user="inviteResult.u" @close="inviteResult = null" />
    <ConfirmDialog v-if="deleting" title="Xóa người dùng"
      :message="`Xóa vĩnh viễn “${deleting.name}” khỏi ứng dụng và mọi dự án? Người này không còn dữ liệu nào (công việc, chốt điểm, người được quản lý).`"
      confirm-label="Xóa" @cancel="deleting = null" @confirm="onDelete" />
    <ConfirmDialog v-if="info" title="Thông báo" :message="info" :hide-confirm="true" cancel-label="Đóng" @cancel="info = ''" />
  </AppShell>
</template>

<script setup>
import { isPdRole, formatDate } from '../store/scoring.js'
import { avatarOf } from '../store/avatar.js'
import { ROLE_CHOICES, roleChoiceOf, deptOfRole } from '../store/scoring.js'
import { usePresence, stateOf, idleFor, ago } from '../store/presence.js'
import { matchText } from '@mds/utils/search.js'
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserAvatar from '../components/UserAvatar.vue'
import { api, backend } from '../store/api.js'
import AppShell      from '../components/AppShell.vue'
import UserDialog    from '../components/UserDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import TIcon       from '@mds/components/TIcon.vue'
import TableHeader from '@mds/components/TableHeader.vue'
import DataTable   from '@mds/components/DataTable.vue'
import TablePaging from '@mds/components/TablePaging.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import InviteResultDialog from '../components/InviteResultDialog.vue'
import { isDirectManager, isManagerOf, db, ROLES, USER_STATUSES, roleLabelOf, userName, userById, managerIdsOf, primaryProjectIdsOf, isAdmin, deleteUser, inviteUser, currentUser, usageOfUser, myDeptAdmin, divisionOptions, divisionPath, divisionWithChildren } from '../store/db.js'
import { userPref } from '../store/userPrefs.js'
import { vTip } from '@mds/utils/tooltip.js'
import { usageMessage } from '../store/userUsage.js'
import ColumnSettingsDialog from '../components/ColumnSettingsDialog.vue'
import AdvancedFilterPanel  from '@mds/components/TableFilterPanel.vue'
import FilterChips          from '@mds/components/TableFilterTags.vue'
import { useColumnSettings } from '../store/useColumnSettings.js'
import { useAdvancedFilter } from '../store/advancedFilter.js'
import { useTableView } from '../store/useTableView.js'

const admin      = computed(() => isAdmin())
// Quản lý trực tiếp (không phải Quản trị): chỉ thấy người mình quản lý, sửa giới hạn (điểm kỳ vọng, dự án, quản lý)
const managerView = computed(() => !admin.value && isDirectManager())
// Quản trị PD / BA: thấy + sửa đầy đủ người thuộc bộ phận mình (kèm người mình quản lý trực tiếp — sửa giới hạn)
const dept = computed(() => (admin.value ? '' : myDeptAdmin()))
const deptView = computed(() => !!dept.value)
const search     = ref('')
const roleFilter = ref('')
const editing    = ref(null)
const deleting   = ref(null)
const inviteResult = ref(null)
const info = ref('')

async function onInviteRow(r) {
  const u = userById(r.id)
  if (!u.email) { editing.value = u; return }            // chưa có email → mở form để nhập
  if (u.status === 'pending') { editing.value = u; return }  // người tự đăng nhập → duyệt
  try { inviteResult.value = { r: await inviteUser(u.id), u } } catch (e) { info.value = e.message }
}
/* Bấm xóa: còn dữ liệu → báo còn những gì + cách xử lý (không cho xóa); hết dữ liệu → hỏi xác nhận */
function askDelete(r) {
  const u = userById(r.id)
  if (!u) return
  if (u.id === currentUser.value?.id) { info.value = 'Không thể xóa chính mình.'; return }
  const usage = usageOfUser(u.id)
  if (usage.length) { info.value = usageMessage(u.name, usage); return }
  deleting.value = u
}
async function onDelete() {
  const u = deleting.value
  deleting.value = null
  if (u.id === currentUser.value?.id) { info.value = 'Không thể xóa chính mình.'; return }
  try { await deleteUser(u.id) }
  catch (e) { info.value = e.message }
}
const pendingUsers = computed(() => db.users.filter(u => u.status === 'pending'))
/* Từ thông báo (quả chuông): ?duyet=<id> → mở luôn hộp thoại duyệt người đó */
const route = useRoute(), router = useRouter()
watch([() => route.query.duyet, () => db.users.length], ([id]) => {
  if (!id || !admin.value) return
  const u = userById(id)
  if (!u) return
  editing.value = u
  router.replace({ query: { ...route.query, duyet: undefined } })
}, { immediate: true })
const ALL = '__all'
const roleOptions = [{ value: ALL, label: 'Bộ phận: Tất cả' }, ...ROLE_CHOICES.map(({ value, label }) => ({ value, label }))]   // ô lọc: không cần mô tả
const statusFilter = ref('')
const statusOptions = [{ value: ALL, label: 'Trạng thái: Tất cả' }, ...Object.entries(USER_STATUSES).map(([value, s]) => ({ value, label: s.label }))]

const ROLE_COLOR = { admin: 'danger', QA: 'neutral', PO: 'brand', BA: 'warning', PD: 'success' }

const columns = [
  { key: 'user',     label: 'Người dùng', type: 'avatar-subtext', minWidth: 260 },
  { key: 'code',     label: 'Mã nhân viên', width: 130 },
  { key: 'companyEmail', label: 'Email công ty', width: 220 },
  { key: 'status',   label: 'Trạng thái', type: 'status', width: 140 },
  { key: 'activity', label: 'Hoạt động',  type: 'status', width: 170 },
  { key: 'role',     label: 'Bộ phận',    type: 'tag', width: 180 },
  { key: 'division', label: 'Khối',       width: 220 },
  { key: 'managers', label: 'Quản lý trực tiếp', width: 200 },
  { key: 'target',   label: 'Điểm kỳ vọng level', width: 170, align: 'right' },
  { key: 'primary',  label: 'Dự án phụ trách', width: 180 },
  { key: 'projects', label: 'Dự án được tham gia', type: 'tag', minWidth: 500, noFilter: true },
]
const rowActions = computed(() => (deptView.value ? [
  { icon: 'pencil', title: 'Sửa', emit: 'edit' },
  { icon: 'send',   title: 'Gửi lời mời / link đặt lại mật khẩu', emit: 'invite' },
] : admin.value ? [
  { icon: 'pencil', title: 'Sửa / duyệt', emit: 'edit' },
  { icon: 'send',   title: 'Gửi lời mời / link đặt lại mật khẩu', emit: 'invite' },
  { icon: 'trash',  title: 'Gỡ quyền truy cập', emit: 'delete', danger: true },
] : [{ icon: 'pencil', title: 'Sửa điểm kỳ vọng / dự án / quản lý', emit: 'edit' }]))

/* ── Thiết lập cột & lọc nâng cao ── */
const LOCKED = ['user']
const cols = useColumnSettings('users', columns, { locked: LOCKED })
const showCols = ref(false), showFilter = ref(false)
/* ── Ai đang dùng hệ thống: dữ liệu dùng chung với cụm “đang hoạt động” trên header (store/presence.js) ── */
const pres = usePresence()
const activity = computed(() => pres.activity), activityLoaded = computed(() => pres.loaded)

function activityTag(id) {
  const a = activity.value[id]
  if (!activityLoaded.value) return null
  const st = stateOf(id), many = a?.sessions?.length > 1 ? ` · ${a.sessions.length} máy` : ''
  if (st === 'active') return { label: 'Đang hoạt động' + many, color: 'success' }
  if (st === 'idle') return { label: `Không hoạt động ${idleFor(a.lastActiveAt)}` + many, color: 'warning' }
  // Quản trị có “lần cuối hoạt động”; quản lý trực tiếp chỉ biết đang mở app hay không → Offline
  return a?.lastSeenAt ? { label: ago(a.lastSeenAt), color: 'neutral' } : { label: admin.value ? 'Chưa đăng nhập' : 'Offline', color: 'neutral' }
}

// Sắp xếp cột Hoạt động: đang hoạt động → không hoạt động (thao tác gần hơn trước) → offline (lần cuối gần hơn trước)
const seenRank = id => { const a = activity.value[id], st = stateOf(id)
  return st === 'active' ? 4e15 : st === 'idle' ? 2e15 + (a.lastActiveAt ?? 0) : (a?.lastSeenAt ?? 0) }

const filterFields = computed(() => [
  { key: 'online',  label: 'Hoạt động', type: 'enum', options: [{ value: 'active', label: 'Đang hoạt động' }, { value: 'idle', label: 'Không hoạt động (vẫn mở app)' }, { value: 'offline', label: 'Offline' }], get: u => stateOf(u.id) },
  { key: 'name',    label: 'Họ và tên',          type: 'text',   get: u => u.name },
  { key: 'companyEmail', label: 'Email công ty', type: 'text',   get: u => u.companyEmail ?? '' },
  { key: 'email',   label: 'Email',              type: 'text',   get: u => u.email },
  { key: 'role',    label: 'Bộ phận',            type: 'enum',   options: ROLES.map(({ value, label }) => ({ value, label })), get: u => u.role },
  { key: 'division', label: 'Khối',              type: 'enum',   options: [{ value: '', label: 'Chưa chọn khối' }, ...divisionOptions().map(o => ({ value: o.value, label: o.label }))], get: u => u.divisionId || '' },
  { key: 'managers', label: 'Quản lý trực tiếp',  type: 'enum',   options: db.users.filter(u => u.status !== 'disabled').map(u => ({ value: u.id, label: u.name })), multi: true, get: u => managerIdsOf(u) },
  { key: 'target',  label: 'Điểm kỳ vọng level', type: 'number', get: u => Number(u.target) || 0 },
  { key: 'primary', label: 'Dự án phụ trách',    type: 'enum',   options: db.projects.map(p => ({ value: p.id, label: p.name })), multi: true, get: u => primaryProjectIdsOf(u) },
  { key: 'project', label: 'Dự án tham gia',     type: 'enum',   options: db.projects.map(p => ({ value: p.id, label: p.name })), multi: true,
    get: u => db.projects.filter(p => p.memberIds.includes(u.id)).map(p => p.id) },
])
const adv = useAdvancedFilter('users', filterFields)

const rows = computed(() => {
  const q = search.value.trim().toLowerCase()
  const ORDER = { pending: 0, invited: 1, active: 2, none: 3, disabled: 4 }
  return [...db.users].sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9))
    .filter(u => admin.value || (deptView.value && deptOfRole(u.role) === dept.value) || isManagerOf(currentUser.value, u))   // Quản trị bộ phận: người bộ phận mình · quản lý trực tiếp: người mình quản lý
    .filter(u => !q || matchText([u.name, u.email, u.companyEmail, u.code], q))   // bỏ dấu + chữ cái đầu
    .filter(u => !roleFilter.value || roleFilter.value === ALL || (roleFilter.value.endsWith('@admin') ? roleChoiceOf(u) === roleFilter.value : u.role === roleFilter.value))   // Quản trị PD / BA: lọc theo quyền
    // Tất cả = người còn quyền; người đã bị cắt quyền chỉ hiện khi lọc “Đã khóa” (để mở khóa lại khi cần)
    .filter(u => (!statusFilter.value || statusFilter.value === ALL) ? u.status !== 'disabled' : u.status === statusFilter.value)
    .filter(u => !divisionFilter.value || divisionWithChildren(divisionFilter.value).has(u.divisionId))   // lọc khối cha → gồm cả khối con
    .filter(u => adv.test(u))
    .map(u => ({
      division: divisionPath(u.divisionId) || '', _groupKey: divisionPath(u.divisionId) ? u.divisionId : '',
      id: u.id,
      user: { text: u.name, subtext: u.email || 'Chưa có Gmail', avatar: avatarOf(u) },
      status: { label: USER_STATUSES[u.status]?.label ?? '—', color: USER_STATUSES[u.status]?.color ?? 'neutral' },
      code: u.code, companyEmail: u.companyEmail || '',
      activity: activityTag(u.id), _seen: seenRank(u.id),
      target: isPdRole(u.role) || Number(u.target) ? (u.target ?? 0) : '',
      primary: primaryProjectIdsOf(u).map(id => db.projects.find(p => p.id === id)?.name).filter(Boolean).join(', '),
      role: { label: roleLabelOf(u), color: ROLE_COLOR[u.role] },
      managers: managerIdsOf(u).filter(id => userById(id)?.status !== 'disabled').map(userName).filter(Boolean).join(', '),
      projects: u.role === 'admin'
        ? [{ label: 'Tất cả dự án', color: 'neutral' }]
        : db.projects.filter(p => p.memberIds.includes(u.id)).map(p => ({ label: p.name, color: 'neutral' })),
    }))
})
/* ── Khối: lọc + gom theo cây (hiện hết, không phân trang; khối xếp theo cây, người chưa chọn khối cuối cùng) ── */
const divisionFilter = userPref('users-division', '')
const divisionFilterOptions = computed(() => [
  { value: '', label: 'Khối: Tất cả', text: 'Tất cả', depth: 0, parent: true, open: true },
  ...divisionOptions().map(o => ({ ...o, depth: o.depth + 1 })),
])
const grouped = userPref('users-grouped', false)
const tableRef = ref(null)
const allCollapsed = computed(() => !!tableRef.value?.allCollapsed)
const treeOrder = computed(() => new Map(divisionOptions().map((o, i) => [o.value, i])))
/* Khối cha: kèm tổng số người gồm cả khối con (số trên nhãn nhóm chỉ đếm người gán thẳng vào khối đó) */
const groupedRows = computed(() => [...view.processed.value].sort((a, b) => (treeOrder.value.get(a._groupKey) ?? 1e9) - (treeOrder.value.get(b._groupKey) ?? 1e9)))
const groupLabel = key => {
  if (!key) return 'Chưa chọn khối'
  const ids = divisionWithChildren(key)
  const total = ids.size > 1 ? view.processed.value.filter(r => ids.has(r._groupKey)).length : 0
  return divisionPath(key) + (total ? ` · tổng ${total} người gồm khối con` : '')
}
const view = useTableView(rows, { sortValue: (r, k) => (k === 'user' ? r.user.text : k === 'activity' ? r._seen : r[k]?.label ?? r[k]) })
</script>

<style scoped>
.pending-bar { display: flex; align-items: center; gap: 10px; flex-shrink: 0; padding: 10px 12px 10px 14px; border-radius: var(--radius-default); background: var(--bg-warning-light); font-size: var(--text-body); color: var(--text-primary); }
.pending-bar strong { font-weight: var(--fw-semibold); }
.pending-bar__icon { font-size: 18px; color: var(--icon-warning); flex-shrink: 0; }
.pending-bar .btn { margin-left: auto; flex-shrink: 0; }
/* Chấm trạng thái: xanh = đang hoạt động (có nhịp sáng), vàng = không hoạt động */
.empty-text { font-size: var(--text-body); color: var(--text-secondary); }
.pdp-division-filter { width: 240px; }
</style>
