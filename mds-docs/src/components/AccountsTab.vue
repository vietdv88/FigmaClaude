<template>
  <!-- Tài khoản (bản tài liệu CHẠY RIÊNG): Quản trị tạo tài khoản đăng nhập cho người biên tập — Quản trị: mọi quyền + quản lý tài khoản · Biên tập: sửa nội dung -->
  <div class="ds-acc">
    <div class="table-panel ds-acc__panel">
      <TableHeader v-model="q" search-placeholder="Tìm theo tên, email" :search-width="narrow ? 200 : 260" :hide-ai="true" :hide-tools="['export', 'col-settings', 'filter']" @refresh="load(true)" />
      <div class="table-scroll">
        <DataTable :columns="cols" :rows="rows" :hide-blank-rows="false" :row-actions="actions"
          @row-click="openEdit" @edit="openEdit" @toggle="toggleLock" @delete="r => (deleting = r)">
          <template #empty>
            <EmptyArt variant="search" :width="160" class="dt-empty-state__art" />
            <p class="dt-empty-state__title">Không tìm thấy tài khoản khớp “{{ q }}”</p>
            <div class="dt-empty-state__acts"><button type="button" class="btn btn--outline btn--neutral" @click="q = ''"><TIcon name="x" />Xóa tìm kiếm</button></div>
          </template>
        </DataTable>
      </div>
    </div>

    <AppDialog v-if="editing" :title="editing.id ? 'Sửa tài khoản' : 'Thêm tài khoản'" :width="520" @close="tryClose">
      <div class="form-fields">
        <AppInput label="Họ tên">
          <AppTextbox v-model="editing.name" placeholder="VD: Nguyễn Văn An" />
        </AppInput>
        <AppInput label="Email đăng nhập" :required="!editing.id" :message="err.email">
          <AppTextbox v-model="editing.email" type="email" :disabled="!!editing.id" placeholder="ten@congty.vn" />
        </AppInput>
        <AppInput :label="editing.id ? 'Đặt lại mật khẩu' : 'Mật khẩu'" :required="!editing.id" :message="err.password" :caption="editing.id ? 'Bỏ trống nếu không đổi · tối thiểu 8 ký tự' : 'Tối thiểu 8 ký tự — gửi cho người dùng qua kênh riêng'">
          <AppTextbox v-model="editing.password" type="password" autocomplete="new-password" placeholder="Mật khẩu" />
        </AppInput>
        <AppInput label="Vai trò">
          <div class="radio-group">
            <AppRadio v-model="editing.role" value="editor" name="acc-role" label="Biên tập — sửa nội dung tài liệu" />
            <AppRadio v-model="editing.role" value="admin" name="acc-role" label="Quản trị — thêm quản lý tài khoản" />
          </div>
        </AppInput>
      </div>
      <template #footer>
        <button type="button" class="btn btn--outline btn--neutral" @click="tryClose">Hủy</button>
        <button type="button" class="btn btn--primary" :disabled="saving" @click="save">Lưu</button>
      </template>
    </AppDialog>

    <AppDialogConfirm v-if="leaving" title="Thoát và không lưu?" cancel-label="Ở lại" confirm-label="Thoát, không lưu"
      @cancel="leaving = false" @confirm="leaving = false; editing = null">Nếu bạn thoát, các dữ liệu đang nhập liệu sẽ không được lưu lại.</AppDialogConfirm>
    <AppDialogConfirm v-if="deleting" title="Xóa tài khoản?" confirm-label="Xóa" danger
      @confirm="doDelete" @cancel="deleting = null">“<b>{{ deleting.name }}</b>” ({{ deleting.email }}) không đăng nhập được nữa. Nội dung người này đã sửa vẫn giữ nguyên.</AppDialogConfirm>
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
import AppRadio from '@mds/components/AppRadio.vue'
import { toast } from '@mds/utils/toast.js'
import { matchText } from '@mds/utils/search.js'
import AppDialog from './AppDialog.vue'
import AppDialogConfirm from './AppDialogConfirm.vue'
import { state, fmtDateTime } from '../store.js'

defineExpose({ openNew })
const narrow = ref(window.innerWidth < 600)
const accounts = ref([]), q = ref('')
const cols = [
  { key: 'name', label: 'Họ tên', minWidth: 200, link: true },
  { key: 'email', label: 'Email', width: 260 },
  { key: 'roleText', label: 'Vai trò', width: 140 },
  { key: 'status', label: 'Trạng thái', type: 'status', width: 150 },
  { key: 'created', label: 'Tạo lúc', width: 160 },
]
const actions = [{ icon: 'pencil', title: 'Sửa', emit: 'edit' }, { icon: 'lock', title: 'Khóa / mở khóa', emit: 'toggle' }, { icon: 'trash', title: 'Xóa', emit: 'delete', danger: true }]
const rows = computed(() => accounts.value.filter(a => matchText([a.name, a.email], q.value)).map(a => ({
  ...a, roleText: a.role === 'admin' ? 'Quản trị' : 'Biên tập', created: fmtDateTime(a.createdAt),
  status: a.status === 'active' ? { label: 'Đang hoạt động', color: 'success' } : { label: 'Đã khóa', color: 'neutral' },
  name: a.id === state.me.user?.id ? `${a.name} (bạn)` : a.name,
})))

async function call(url, opt = {}) {
  const res = await fetch('/api/ds-accounts' + url, { ...opt, headers: opt.body ? { 'Content-Type': 'application/json' } : {} })
  const d = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(d.error || 'Có lỗi xảy ra')
  return d
}
async function load(tell) { try { accounts.value = (await call('')).accounts; if (tell) toast.info('Đã tải lại danh sách') } catch (e) { toast.error(e.message) } }
onMounted(load)

/* ── Thêm / sửa ── */
const editing = ref(null), original = ref(''), saving = ref(false), leaving = ref(false)
const err = reactive({ email: '', password: '' })
watch(() => editing.value?.email, v => { if (v?.trim()) err.email = '' })
watch(() => editing.value?.password, v => { if (!v || v.length >= 8) err.password = '' })
const snap = a => JSON.stringify([a.name.trim(), a.email.trim(), a.password, a.role])
function openNew() { open({ id: '', name: '', email: '', password: '', role: 'editor' }) }
function openEdit(r) { const a = accounts.value.find(x => x.id === r.id); if (a) open({ id: a.id, name: a.name, email: a.email, password: '', role: a.role }) }
function open(a) { editing.value = a; original.value = snap(a); err.email = err.password = '' }
function tryClose() { if (snap(editing.value) !== original.value) leaving.value = true; else editing.value = null }
async function save() {
  const a = editing.value
  err.email = a.id || /^\S+@\S+\.\S+$/.test(a.email.trim()) ? '' : (a.email.trim() ? 'Email không hợp lệ' : 'Nhập email')
  err.password = (!a.id && !a.password) ? 'Nhập mật khẩu' : (a.password && a.password.length < 8 ? 'Tối thiểu 8 ký tự' : '')
  if (err.email || err.password) { nextTick(() => document.querySelector('.ds-modal .input-field--error input')?.focus()); return }
  saving.value = true
  try {
    if (a.id) await call('/' + a.id, { method: 'PUT', body: JSON.stringify({ name: a.name, role: a.role, password: a.password || undefined }) })
    else await call('', { method: 'POST', body: JSON.stringify({ name: a.name, email: a.email, password: a.password, role: a.role }) })
    toast.success(a.id ? `Đã cập nhật tài khoản ${a.email}` : `Đã tạo tài khoản ${a.email.trim()}`)
    editing.value = null; await load()
  } catch (e) { toast.error(e.message) } finally { saving.value = false }
}
async function toggleLock(r) {
  const a = accounts.value.find(x => x.id === r.id); if (!a) return
  try { await call('/' + a.id, { method: 'PUT', body: JSON.stringify({ status: a.status === 'active' ? 'disabled' : 'active' }) }); await load(); toast.success(a.status === 'active' ? `Đã khóa ${a.email}` : `Đã mở khóa ${a.email}`) }
  catch (e) { toast.error(e.message) }
}
/* ── Xóa ── */
const deleting = ref(null)
async function doDelete() {
  const r = deleting.value; deleting.value = null
  try { await call('/' + r.id, { method: 'DELETE' }); await load(); toast.success(`Đã xóa tài khoản ${r.email}`) }
  catch (e) { toast.error(e.message) }
}
</script>

<style scoped>
.ds-acc { display: flex; flex-direction: column; gap: var(--card-col-gap); min-width: 0; }
.ds-acc__panel { height: calc(100vh - 128px); min-height: 360px; display: flex; flex-direction: column; }
</style>
