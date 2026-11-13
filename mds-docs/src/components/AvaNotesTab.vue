<template>
  <!-- Tri thức AVA: ban biên tập tự nhập quy tắc / lưu ý mới → AVA đọc ngay ở câu hỏi kế tiếp, không cần sửa code -->
  <div class="ds-anote">
    <div class="ds-anote__intro">
      <TIcon name="sparkles" class="ds-anote__intro-icon" />
      <span>AVA coi các mục ở đây là quy tắc mới nhất (đè lên tài liệu cũ nếu khác nhau). Để tiết kiệm chi phí AI, mỗi câu hỏi AVA chỉ đọc các mục LIÊN QUAN — nên đặt tiêu đề nói đúng chủ đề, mỗi mục 1 chủ đề. Mục áp dụng cho mọi câu hỏi thì chọn “Luôn gửi kèm” (dùng ít, tổng dưới khoảng 6.000 ký tự).</span>
    </div>
    <div class="table-panel ds-anote__panel">
      <TableHeader v-model="q" search-placeholder="Tìm theo tiêu đề, nội dung" :search-width="narrow ? 200 : 260" :hide-ai="true" :hide-tools="['export', 'col-settings', 'filter']" @refresh="load(true)" />
      <div class="table-scroll">
        <DataTable :columns="cols" :rows="rows" :hide-blank-rows="false" :row-actions="actions"
          @row-click="openEdit" @edit="openEdit" @delete="r => (deleting = r)" @cell-update="toggle" />
      </div>
      <div v-if="loaded && !notes.length" class="ds-muted ds-anote__empty">Chưa có mục tri thức nào — bấm “Thêm tri thức” để dặn AVA quy tắc mới.</div>
    </div>

    <AppDialog v-if="editing" :title="editing.id ? 'Sửa tri thức AVA' : 'Thêm tri thức AVA'" :width="720" @close="tryClose">
      <div class="form-fields">
        <AppInput label="Tiêu đề" required :message="err.title">
          <AppTextbox v-model="editing.title" placeholder="VD: Nút Lưu, Hủy trên form nhập liệu" />
        </AppInput>
        <AppInput label="Nội dung" required :message="err.body" :caption="`${editing.body.length.toLocaleString('vi-VN')} / 8.000 ký tự · dùng được Markdown: **đậm**, danh sách, bảng`">
          <AppTextarea v-model="editing.body" :min-height="240" :max-height="420" autosize :maxlength="8000"
            placeholder="VD: Thanh nút Lưu, Hủy luôn ghim ở đáy form. Không đặt nút Lưu, Hủy ở đầu form." />
        </AppInput>
        <AppCheckbox v-model="editing.enabled" label="Đang dùng (bỏ chọn để AVA tạm không đọc mục này)" />
        <AppCheckbox v-model="editing.always" label="Luôn gửi kèm mọi câu hỏi (chỉ chọn cho quy tắc chung — mặc định AVA chỉ đọc mục liên quan tới câu hỏi)" />
      </div>
      <template #footer>
        <button type="button" class="btn btn--outline btn--neutral" @click="tryClose">Hủy</button>
        <button type="button" class="btn btn--primary" :disabled="saving" @click="save">Lưu</button>
      </template>
    </AppDialog>

    <AppDialogConfirm v-if="leaving" title="Thoát và không lưu?" cancel-label="Ở lại" confirm-label="Thoát, không lưu"
      @cancel="leaving = false" @confirm="leaving = false; editing = null">Nếu bạn thoát, các dữ liệu đang nhập liệu sẽ không được lưu lại.</AppDialogConfirm>
    <AppDialogConfirm v-if="deleting" title="Xóa mục tri thức?" confirm-label="Xóa" danger
      @confirm="doDelete" @cancel="deleting = null">AVA sẽ không còn dùng mục “<b>{{ deleting.title }}</b>”. Không khôi phục lại được.</AppDialogConfirm>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import TableHeader from '@mds/components/TableHeader.vue'
import DataTable from '@mds/components/DataTable.vue'
import AppInput from '@mds/components/AppInput.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import AppTextarea from '@mds/components/AppTextarea.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'
import { toast } from '@mds/utils/toast.js'
import { matchText } from '@mds/utils/search.js'
import AppDialog from './AppDialog.vue'
import AppDialogConfirm from './AppDialogConfirm.vue'
import { api, fmtDateTime } from '../store.js'

defineExpose({ openNew })
const narrow = ref(window.innerWidth < 600)
const notes = ref([]), loaded = ref(false), q = ref('')
const cols = [
  { key: 'title', label: 'Tiêu đề', minWidth: 240, link: true },
  { key: 'enabled', label: 'Đang dùng', width: 136, type: 'toggle', align: 'center' },
  { key: 'sendMode', label: 'Cách AVA đọc', width: 150, type: 'status', tip: 'Theo câu hỏi: chỉ đọc khi câu hỏi liên quan · Luôn gửi kèm: đọc ở mọi câu hỏi (tốn token hơn)' },
  { key: 'size', label: 'Số ký tự', width: 110, align: 'right' },
  { key: 'updated', label: 'Cập nhật', width: 170 },
  { key: 'updatedBy', label: 'Người sửa', width: 170 },
]
const actions = [{ icon: 'pencil', title: 'Sửa', emit: 'edit' }, { icon: 'trash', title: 'Xóa', emit: 'delete', danger: true }]
const rows = computed(() => notes.value.filter(n => matchText([n.title, n.body], q.value))
  .map(n => ({ ...n, size: n.body.length.toLocaleString('vi-VN'), sendMode: n.enabled === false ? { label: 'Không đọc', color: 'neutral' } : n.always ? { label: 'Luôn gửi kèm', color: 'brand' } : { label: 'Theo câu hỏi', color: 'neutral' }, updated: fmtDateTime(n.updatedAt) })))

async function load(tell) {
  try { notes.value = (await api('/ava-notes')).notes; loaded.value = true; if (tell) toast.info('Đã tải lại danh sách') }
  catch (e) { toast.error(e.message) }
}
onMounted(load)

/* ── Thêm / sửa ── */
const editing = ref(null), original = ref(''), saving = ref(false), leaving = ref(false)
const err = reactive({ title: '', body: '' })
watch(() => editing.value?.title, v => { if (v?.trim()) err.title = '' })   // gõ vào là bỏ báo lỗi
watch(() => editing.value?.body, v => { if (v?.trim()) err.body = '' })
const snap = n => JSON.stringify([n.title.trim(), n.body.trim(), n.enabled, n.always])
function openNew() { open({ id: '', title: '', body: '', enabled: true, always: false }) }
function openEdit(r) { const n = notes.value.find(x => x.id === r.id); if (n) open({ id: n.id, title: n.title, body: n.body, enabled: n.enabled !== false, always: !!n.always }) }
function open(n) { editing.value = n; original.value = snap(n); err.title = err.body = '' }
function tryClose() { if (snap(editing.value) !== original.value) leaving.value = true; else editing.value = null }
async function save() {
  const n = editing.value
  err.title = n.title.trim() ? '' : 'Nhập tiêu đề tri thức'
  err.body = n.body.trim() ? '' : 'Nhập nội dung tri thức'
  if (err.title || err.body) { nextTick(() => document.querySelector('.ds-modal .input-field--error input, .ds-modal .input-field--error textarea')?.focus()); return }   // focus ô lỗi đầu tiên
  saving.value = true
  try {
    await api(n.id ? '/ava-notes/' + n.id : '/ava-notes', { method: n.id ? 'PUT' : 'POST', body: { title: n.title, body: n.body, enabled: n.enabled, always: n.always } })
    toast.success(n.id ? `Đã cập nhật “${n.title.trim()}” — AVA dùng ngay từ câu hỏi tiếp theo` : `Đã thêm “${n.title.trim()}” — AVA dùng ngay từ câu hỏi tiếp theo`)
    editing.value = null; await load()
  } catch (e) { toast.error(e.message) } finally { saving.value = false }
}

/* Bật / tắt nhanh ngay trên bảng */
async function toggle({ row, value }) {
  const n = notes.value.find(x => x.id === row.id); if (!n) return
  try {
    await api('/ava-notes/' + n.id, { method: 'PUT', body: { title: n.title, body: n.body, enabled: value, always: !!n.always } })
    await load(); toast.success(value ? `AVA đã dùng lại “${n.title}”` : `AVA tạm không đọc “${n.title}”`)
  } catch (e) { toast.error(e.message) }
}

/* ── Xóa ── */
const deleting = ref(null)
async function doDelete() {
  const r = deleting.value; deleting.value = null
  try { await api('/ava-notes/' + r.id, { method: 'DELETE' }); await load(); toast.success(`Đã xóa “${r.title}”`) }
  catch (e) { toast.error(e.message) }
}
</script>

<style scoped>
.ds-anote { display: flex; flex-direction: column; gap: var(--card-col-gap); min-width: 0; }
.ds-anote__intro { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: var(--radius-card); background: var(--bg-brand-light); color: var(--text-primary); font-size: var(--text-body); line-height: var(--text-body-lh); }
.ds-anote__intro-icon { flex-shrink: 0; width: 20px; height: 20px; color: var(--icon-brand); }
.ds-anote__panel { height: calc(100vh - 212px); min-height: 360px; position: relative; display: flex; flex-direction: column; }
.ds-anote__panel .table-scroll { flex: 1; min-height: 0; }   /* bảng cuộn trong khung — thiếu dòng này thì các dòng dưới bị cắt mất, không cuộn được */
.ds-anote__empty { position: absolute; left: 0; right: 0; top: 50%; text-align: center; padding: 0 16px; }
@media (max-width: 600px) { .ds-anote__panel { height: calc(100vh - 300px); } }
</style>
