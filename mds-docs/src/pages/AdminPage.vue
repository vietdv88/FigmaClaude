<template>
  <div class="ds-admin">
    <div v-if="!state.me.user && meLoaded" class="ds-gate card">
      <TIcon name="login" class="ds-gate__icon" />
      <h1 class="h2">Đăng nhập để biên tập tài liệu</h1>
      <p class="ds-muted">Dùng tài khoản MISA Solution Point. Người đọc tài liệu không cần đăng nhập.</p>
      <a :href="loginUrl('/ds/quan-tri')" class="btn btn--primary">Đăng nhập</a>
    </div>
    <div v-else-if="meLoaded && !state.me.canEdit" class="ds-gate card">
      <TIcon name="lock" class="ds-gate__icon" />
      <h1 class="h2">Bạn chưa có quyền biên tập</h1>
      <p class="ds-muted">Nhờ Quản trị thêm bạn vào danh sách “Người biên tập” để thêm, sửa trang tài liệu.</p>
      <RouterLink to="/" class="btn btn--outline btn--neutral">Về trang tài liệu</RouterLink>
    </div>
    <template v-else-if="meLoaded">
      <div class="ds-admin__head">
        <h1 class="h2">{{ TITLES[tab] || TITLES.pages }}<template v-if="tab === 'pages'"> ({{ state.pages.length }})</template></h1>
        <RouterLink v-if="tab === 'pages'" to="/quan-tri/moi" class="btn btn--primary"><TIcon name="plus" />Thêm trang</RouterLink>
        <button v-if="tab === 'notes'" type="button" class="btn btn--primary" @click="notesRef?.openNew()"><TIcon name="plus" />Thêm tri thức</button>
        <button v-if="tab === 'links'" type="button" class="btn btn--primary" @click="linksRef?.openNew()"><TIcon name="plus" />Thêm liên kết</button>
      </div>

      <!-- Trang -->
      <div v-if="tab === 'pages'" class="table-panel ds-admin__panel">
        <TableHeader v-model="q" search-placeholder="Tìm theo tiêu đề, đường dẫn" :search-width="narrow ? 200 : 260" :hide-ai="true" :hide-tools="['export', 'col-settings', 'filter']" @refresh="reload">
          <template #filters>
            <AppCombobox v-if="!narrow" v-model="groupFilter" class="ds-admin__filter" :options="state.groups" placeholder="Nhóm: Tất cả" />
          </template>
        </TableHeader>
        <div class="table-scroll">
          <DataTable :columns="pageCols" :rows="pageRows" :hide-blank-rows="false" :row-actions="pageActions"
            @row-click="r => router.push('/quan-tri/' + r.id)" @view="r => router.push('/' + r.id)" @edit="r => router.push('/quan-tri/' + r.id)" @delete="askDelete" />
        </div>
      </div>

      <!-- Nhóm -->
      <div v-else-if="tab === 'groups'" class="card ds-admin__groups">
        <p class="ds-muted">Thứ tự nhóm trên menu trái. Đổi nhóm của một trang trong màn sửa trang.</p>
        <div v-for="(g, i) in groupList" :key="g" class="ds-group-row">
          <span class="ds-group-row__name">{{ g }}</span>
          <span class="ds-muted">{{ countOf(g) }} trang</span>
          <button type="button" class="btn-icon btn-icon--sm" :disabled="i === 0" aria-label="Lên trên" @click="moveGroup(i, -1)"><TIcon name="arrow-up" /></button>
          <button type="button" class="btn-icon btn-icon--sm" :disabled="i === groupList.length - 1" aria-label="Xuống dưới" @click="moveGroup(i, 1)"><TIcon name="arrow-down" /></button>
        </div>
      </div>

      <!-- Thùng rác -->
      <div v-else-if="tab === 'trash'" class="table-panel ds-admin__panel">
        <!-- Thanh trên bảng: số trang trong thùng rác · Dọn sạch (xóa vĩnh viễn tất cả) -->
        <div v-if="trash.length" class="ds-admin__trashbar">
          <span class="ds-muted">{{ trash.length }} trang trong thùng rác</span>
          <button type="button" class="btn btn--outline-danger" @click="purging = 'all'"><TIcon name="trash" />Dọn sạch thùng rác</button>
        </div>
        <div class="table-scroll">
          <DataTable :columns="trashCols" :rows="trashRows" :hide-blank-rows="false"
            :row-actions="[{ icon: 'restore', title: 'Khôi phục', emit: 'restore' }, { icon: 'trash-x', title: 'Xóa vĩnh viễn', emit: 'purge', danger: true }]"
            @restore="restore" @purge="r => (purging = r)">
            <template #empty>
              <EmptyArt variant="cleared" :width="160" class="dt-empty-state__art" />
              <p class="dt-empty-state__title">Thùng rác trống</p>
              <p class="dt-empty-state__desc">Trang tài liệu bị xóa sẽ nằm ở đây — khôi phục hoặc xóa vĩnh viễn.</p>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- Lịch sử hỏi AVA (CSDL riêng của tài liệu) -->
      <AvaLogsTab v-else-if="tab === 'ava'" />

      <!-- Tri thức AVA: quy tắc ban biên tập tự nhập, AVA luôn đọc -->
      <AvaNotesTab v-else-if="tab === 'notes'" ref="notesRef" />

      <!-- Liên kết hữu ích (hiện ở trang chủ) -->
      <LinksTab v-else-if="tab === 'links'" ref="linksRef" />

      <!-- Đánh giá nội dung: sao + góp ý của người đọc cuối mỗi trang -->
      <RatingsTab v-else-if="tab === 'ratings'" />

      <!-- Người biên tập -->
      <div v-else-if="tab === 'editors'" class="card ds-admin__editors">
        <p class="ds-muted">Quản trị luôn được biên tập. Thêm người khác để họ được thêm, sửa, xóa trang và tải ảnh lên.</p>
        <AppInput label="Người biên tập">
          <AppCombobox v-model="editors" :options="userOptions" multiple placeholder="Chọn người dùng" />
        </AppInput>
      </div>
      <div v-if="tab === 'editors'" class="ds-form-foot">
        <button type="button" class="btn btn--outline btn--neutral" :disabled="!editorsDirty" @click="editors = [...savedEditors]">Hủy</button>
        <button type="button" class="btn btn--primary" :disabled="saving || !editorsDirty" @click="saveEditors">Lưu</button>
      </div>
    </template>
    <!-- Xóa vĩnh viễn (1 trang / dọn sạch): KHÔNG khôi phục được → hỏi rõ hậu quả, nút đỏ -->
    <AppDialogConfirm v-if="purging" :title="purging === 'all' ? 'Dọn sạch thùng rác?' : 'Xóa vĩnh viễn trang?'" :confirm-label="purging === 'all' ? 'Dọn sạch' : 'Xóa vĩnh viễn'" danger
      @confirm="doPurge" @cancel="purging = null">
      <template v-if="purging === 'all'">Xóa vĩnh viễn <b>{{ trash.length }} trang</b> trong thùng rác cùng lịch sử sửa của chúng. Không khôi phục lại được.</template>
      <template v-else>Trang “<b>{{ purging.title }}</b>” và lịch sử sửa của trang bị xóa hẳn. Không khôi phục lại được.</template>
    </AppDialogConfirm>
    <AppDialogConfirm v-if="deleting" title="Xóa trang tài liệu?" confirm-label="Xóa" danger
      @confirm="doDelete" @cancel="deleting = null">Trang “<b>{{ deleting.title }}</b>” được chuyển vào Thùng rác, khôi phục lại được bất cứ lúc nào.</AppDialogConfirm>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TIcon from '@mds/components/TIcon.vue'
import TableHeader from '@mds/components/TableHeader.vue'
import DataTable from '@mds/components/DataTable.vue'
import EmptyArt from '@mds/components/EmptyArt.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import AppInput from '@mds/components/AppInput.vue'
import { toast } from '@mds/utils/toast.js'
import { matchText } from '@mds/utils/search.js'
import { setPageTitle } from '@mds/utils/docTitle.js'
import AppDialogConfirm from '../components/AppDialogConfirm.vue'
import AvaLogsTab from '../components/AvaLogsTab.vue'
import AvaNotesTab from '../components/AvaNotesTab.vue'
import LinksTab from '../components/LinksTab.vue'
import RatingsTab from '../components/RatingsTab.vue'
import { state, api, loadPages, loadMe, loginUrl, fmtDateTime } from '../store.js'

const router = useRouter(), route = useRoute()
const meLoaded = ref(false)
const narrow = ref(window.innerWidth < 600)   // màn hẹp: bỏ ô lọc nhóm cho vừa thanh công cụ
// Mục đang xem chọn ở menu trái (AdminNav) → ?tab= trên đường dẫn
const tab = computed(() => String(route.query.tab || 'pages'))
const notesRef = ref(null), linksRef = ref(null)
const TITLES = { pages: 'Trang tài liệu', groups: 'Nhóm', trash: 'Thùng rác', links: 'Liên kết hữu ích', ava: 'Lịch sử hỏi AVA', notes: 'Tri thức AVA', ratings: 'Đánh giá nội dung', editors: 'Người biên tập' }
watch(tab, t => setPageTitle([TITLES[t] || TITLES.pages, 'Quản trị nội dung']))

/* ── Trang ── */
const q = ref(''), groupFilter = ref('')
const pageCols = [
  { key: 'title', label: 'Tiêu đề', minWidth: 220, link: true },
  { key: 'group', label: 'Nhóm', width: 150 },
  { key: 'path', label: 'Đường dẫn', width: 220 },
  { key: 'updated', label: 'Cập nhật', width: 170 },
  { key: 'updatedBy', label: 'Người sửa', width: 170 },
]
const pageActions = [{ icon: 'eye', title: 'Xem trang', emit: 'view' }, { icon: 'pencil', title: 'Sửa', emit: 'edit' }, { icon: 'trash', title: 'Xóa', emit: 'delete', danger: true }]
const pageRows = computed(() => state.pages
  .filter(p => (!groupFilter.value || p.group === groupFilter.value) && matchText([p.title, p.slug], q.value))
  .sort((a, b) => state.groups.indexOf(a.group) - state.groups.indexOf(b.group) || (a.order ?? 0) - (b.order ?? 0))
  .map(p => ({ id: p.slug, title: p.title, group: p.group, path: '/ds/' + p.slug, updated: fmtDateTime(p.updatedAt), updatedBy: p.updatedBy || '' })))
const deleting = ref(null)
const askDelete = r => { deleting.value = r }
async function doDelete() {
  const r = deleting.value; deleting.value = null
  try { await api('/pages/' + r.id, { method: 'DELETE' }); await loadPages(); toast.success(`Đã chuyển “${r.title}” vào Thùng rác`) }
  catch (e) { toast.error(e.message) }
}
async function reload() { await loadPages(); toast.info('Đã tải lại danh sách') }

/* ── Nhóm ── */
const groupList = computed(() => state.groups.filter(g => state.pages.some(p => p.group === g)))
const countOf = g => state.pages.filter(p => p.group === g).length
async function moveGroup(i, d) {
  const list = [...groupList.value];[list[i], list[i + d]] = [list[i + d], list[i]]
  try { await api('/order', { method: 'PUT', body: { groups: list } }); await loadPages() }
  catch (e) { toast.error(e.message) }
}

/* ── Thùng rác ── */
const trash = ref([])
const trashCols = [
  { key: 'title', label: 'Tiêu đề', minWidth: 220 },
  { key: 'group', label: 'Nhóm', width: 150 },
  { key: 'deleted', label: 'Xóa lúc', width: 170 },
  { key: 'deletedBy', label: 'Người xóa', width: 170 },
]
const trashRows = computed(() => trash.value.map(t => ({ ...t, deleted: fmtDateTime(t.deletedAt) })))
const purging = ref(null)   // null | 'all' | dòng thùng rác
async function doPurge() {
  const x = purging.value; purging.value = null
  try {
    if (x === 'all') { const { removed } = await api('/trash', { method: 'DELETE' }); toast.success(`Đã dọn sạch thùng rác (${removed} trang)`) }
    else { await api(`/trash/${x.id}`, { method: 'DELETE' }); toast.success(`Đã xóa vĩnh viễn “${x.title}”`) }
    await loadTrash()
  } catch (e) { toast.error(e.message) }
}
async function loadTrash() { try { trash.value = (await api('/trash')).items } catch (e) { toast.error(e.message) } }
async function restore(r) {
  try { const { page } = await api(`/trash/${r.id}/restore`, { method: 'POST' }); await Promise.all([loadPages(), loadTrash()]); toast.success(`Đã khôi phục “${page.title}”`) }
  catch (e) { toast.error(e.message) }
}

/* ── Người biên tập ── */
const editors = ref([]), savedEditors = ref([]), users = ref([]), saving = ref(false)
const editorsDirty = computed(() => JSON.stringify([...editors.value].sort()) !== JSON.stringify([...savedEditors.value].sort()))
const userOptions = computed(() => users.value.filter(u => !u.admin).map(u => ({ value: u.id, label: u.name, description: u.email })))
async function loadEditors() {
  try { const d = await api('/editors'); users.value = d.users; editors.value = d.editors; savedEditors.value = [...d.editors] } catch (e) { toast.error(e.message) }
}
async function saveEditors() {
  saving.value = true
  try { await api('/editors', { method: 'PUT', body: { editors: editors.value } }); savedEditors.value = [...editors.value]; toast.success('Đã lưu danh sách người biên tập') }
  catch (e) { toast.error(e.message) } finally { saving.value = false }
}

watch(tab, t => { if (t === 'trash') loadTrash(); if (t === 'editors') loadEditors() }, { immediate: true })
onMounted(async () => { setPageTitle([TITLES[tab.value] || TITLES.pages, 'Quản trị nội dung']); await loadMe(); meLoaded.value = true })
</script>
