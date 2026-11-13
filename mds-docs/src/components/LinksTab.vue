<template>
  <!-- Liên kết hữu ích: ban biên tập nhập link hướng dẫn hay dùng (tiêu đề · đường dẫn · nhóm · mô tả) → hiện ở trang chủ /ds, lọc theo nhóm + tìm nhanh -->
  <div class="ds-links-admin">
    <div class="table-panel ds-links-admin__panel">
      <TableHeader v-model="q" search-placeholder="Tìm theo tiêu đề, nhóm, đường dẫn" :search-width="narrow ? 200 : 280" :hide-ai="true" :hide-tools="['export', 'col-settings', 'filter']" @refresh="load(true)" />
      <div class="table-scroll">
        <DataTable :columns="cols" :rows="rows" :hide-blank-rows="false" :row-actions="actions"
          @row-click="openEdit" @edit="openEdit" @open="r => openUrl(r.url)" @delete="r => (deleting = r)">
          <template #empty>
            <EmptyArt :variant="links.length ? 'search' : 'doc'" :width="160" class="dt-empty-state__art" />
            <p class="dt-empty-state__title">{{ links.length ? `Không tìm thấy liên kết khớp “${q}”` : 'Chưa có liên kết nào' }}</p>
            <p class="dt-empty-state__desc">{{ links.length ? 'Thử từ khóa khác.' : 'Thêm các link hướng dẫn hay dùng — hiện ở trang chủ tài liệu.' }}</p>
            <div class="dt-empty-state__acts">
              <button v-if="links.length" type="button" class="btn btn--outline btn--neutral" @click="q = ''"><TIcon name="x" />Xóa tìm kiếm</button>
              <button v-else type="button" class="btn btn--outline btn--neutral" @click="openNew"><TIcon name="plus" />Thêm liên kết</button>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <AppDialog v-if="editing" :title="editing.id ? 'Sửa liên kết' : 'Thêm liên kết'" :width="560" @close="tryClose">
      <div class="form-fields">
        <AppInput label="Tiêu đề" required :message="err.title">
          <AppTextbox v-model="editing.title" :maxlength="120" placeholder="VD: Bộ component MDS trên Figma" />
        </AppInput>
        <AppInput label="Đường dẫn" required :message="err.url">
          <AppTextbox v-model="editing.url" placeholder="https://…" />
        </AppInput>
        <AppInput label="Nhóm" caption="Chọn nhóm có sẵn hoặc gõ tên nhóm mới — trang chủ lọc theo nhóm">
          <AppTextbox v-model="editing.group" :maxlength="60" placeholder="VD: Figma, Công cụ, Hướng dẫn" />
          <div v-if="groupNames.length" class="ds-links-admin__chips">
            <button v-for="g in groupNames" :key="g" type="button" class="btn btn--sm" :class="editing.group === g ? 'btn--outline btn--active' : 'btn--outline btn--neutral'" @click="editing.group = g">{{ g }}</button>
          </div>
        </AppInput>
        <AppInput label="Mô tả" :caption="`${editing.desc.length} / 300 ký tự`">
          <AppTextarea v-model="editing.desc" :min-height="72" :max-height="160" autosize :maxlength="300" placeholder="1–2 câu: link này dùng khi nào" />
        </AppInput>
      </div>
      <template #footer>
        <button type="button" class="btn btn--outline btn--neutral" @click="tryClose">Hủy</button>
        <button type="button" class="btn btn--primary" :disabled="saving" @click="save">Lưu</button>
      </template>
    </AppDialog>

    <AppDialogConfirm v-if="leaving" title="Thoát và không lưu?" cancel-label="Ở lại" confirm-label="Thoát, không lưu"
      @cancel="leaving = false" @confirm="leaving = false; editing = null">Nếu bạn thoát, các dữ liệu đang nhập liệu sẽ không được lưu lại.</AppDialogConfirm>
    <AppDialogConfirm v-if="deleting" title="Xóa liên kết?" confirm-label="Xóa" danger
      @confirm="doDelete" @cancel="deleting = null">Liên kết “<b>{{ deleting.title }}</b>” bị gỡ khỏi trang chủ. Không khôi phục lại được.</AppDialogConfirm>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import TableHeader from '@mds/components/TableHeader.vue'
import DataTable from '@mds/components/DataTable.vue'
import EmptyArt from '@mds/components/EmptyArt.vue'
import AppInput from '@mds/components/AppInput.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import AppTextarea from '@mds/components/AppTextarea.vue'
import { toast } from '@mds/utils/toast.js'
import { matchText } from '@mds/utils/search.js'
import AppDialog from './AppDialog.vue'
import AppDialogConfirm from './AppDialogConfirm.vue'
import { api, fmtDateTime } from '../store.js'

defineExpose({ openNew })
const narrow = ref(window.innerWidth < 600)
const links = ref([]), q = ref('')
const cols = [
  { key: 'title', label: 'Tiêu đề', minWidth: 220, link: true },
  { key: 'group', label: 'Nhóm', width: 150 },
  { key: 'url', label: 'Đường dẫn', width: 280 },
  { key: 'desc', label: 'Mô tả', minWidth: 240 },
  { key: 'updated', label: 'Cập nhật', width: 160 },
]
const actions = [{ icon: 'external-link', title: 'Mở liên kết', emit: 'open' }, { icon: 'pencil', title: 'Sửa', emit: 'edit' }, { icon: 'trash', title: 'Xóa', emit: 'delete', danger: true }]
const rows = computed(() => links.value.filter(l => matchText([l.title, l.group, l.url, l.desc], q.value))
  .map(l => ({ ...l, updated: fmtDateTime(l.updatedAt) })))
const groupNames = computed(() => [...new Set(links.value.map(l => l.group).filter(Boolean))])
const openUrl = u => window.open(u, '_blank', 'noopener')

async function load(tell) {
  try { links.value = (await api('/links')).links; if (tell) toast.info('Đã tải lại danh sách') }
  catch (e) { toast.error(e.message) }
}
onMounted(load)

/* ── Thêm / sửa ── */
const editing = ref(null), original = ref(''), saving = ref(false), leaving = ref(false)
const err = reactive({ title: '', url: '' })
watch(() => editing.value?.title, v => { if (v?.trim()) err.title = '' })
watch(() => editing.value?.url, v => { if (/^https?:\/\/\S+$/i.test(v?.trim() || '')) err.url = '' })
const snap = l => JSON.stringify([l.title.trim(), l.url.trim(), l.group.trim(), l.desc.trim()])
function openNew() { open({ id: '', title: '', url: '', group: groupNames.value[0] || '', desc: '' }) }
function openEdit(r) { const l = links.value.find(x => x.id === r.id); if (l) open({ id: l.id, title: l.title, url: l.url, group: l.group || '', desc: l.desc || '' }) }
function open(l) { editing.value = l; original.value = snap(l); err.title = err.url = '' }
function tryClose() { if (snap(editing.value) !== original.value) leaving.value = true; else editing.value = null }
async function save() {
  const l = editing.value
  if (l.url.trim() && !/^https?:\/\//i.test(l.url.trim())) l.url = 'https://' + l.url.trim()   // gõ thiếu https:// → tự thêm
  err.title = l.title.trim() ? '' : 'Nhập tiêu đề liên kết'
  err.url = !l.url.trim() ? 'Nhập đường dẫn' : /^https?:\/\/\S+$/i.test(l.url.trim()) ? '' : 'Đường dẫn không hợp lệ'
  if (err.title || err.url) { nextTick(() => document.querySelector('.ds-modal .input-field--error input')?.focus()); return }
  saving.value = true
  try {
    await api(l.id ? '/links/' + l.id : '/links', { method: l.id ? 'PUT' : 'POST', body: { title: l.title, url: l.url, group: l.group, desc: l.desc } })
    toast.success(l.id ? `Đã cập nhật “${l.title.trim()}”` : `Đã thêm “${l.title.trim()}” lên trang chủ`)
    editing.value = null; await load()
  } catch (e) { toast.error(e.message) } finally { saving.value = false }
}

/* ── Xóa ── */
const deleting = ref(null)
async function doDelete() {
  const r = deleting.value; deleting.value = null
  try { await api('/links/' + r.id, { method: 'DELETE' }); await load(); toast.success(`Đã xóa “${r.title}”`) }
  catch (e) { toast.error(e.message) }
}
</script>

<style scoped>
.ds-links-admin { display: flex; flex-direction: column; gap: var(--card-col-gap); min-width: 0; }
.ds-links-admin__panel { height: calc(100vh - 128px); min-height: 360px; display: flex; flex-direction: column; }
.ds-links-admin__chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
</style>
