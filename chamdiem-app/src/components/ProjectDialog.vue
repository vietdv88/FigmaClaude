<template>
  <DialogShell :title="form.id ? 'Sửa dự án' : 'Thêm dự án'" :width="600" :autofocus="!form.id" @close="$emit('close')">
    <div ref="formEl" class="dlg-form">
      <div class="dlg-grid">
        <AppInput label="Mã dự án" :required="true" :message="errors.code">
          <AppTextbox v-model="form.code" placeholder="VD: KTO" :state="errors.code ? 'error' : 'default'" />
        </AppInput>
        <AppInput label="Tên dự án" :required="true" :message="errors.name">
          <AppTextbox v-model="form.name" :state="errors.name ? 'error' : 'default'" />
        </AppInput>
      </div>
      <AppInput label="Logo dự án">
        <AppImageUpload v-model="form.logo" :placeholder-text="logoInitials" />
      </AppInput>
      <TipField label="Khối" :required="true" :message="errors.divisionId" tip="Khối / nhóm phụ trách dự án — danh mục dạng cây (cha › con) do Quản trị cấu hình ở Cài đặt hệ thống. Chọn mục cụ thể nhất.">
        <AppCombobox v-model="form.divisionId" :options="divisionOptions" placeholder="Chọn khối" :state="errors.divisionId ? 'error' : 'default'" />
      </TipField>
      <AppInput label="Mô tả">
        <AppTextarea v-model="form.description" :min-height="56" />
      </AppInput>
      <!-- Cả dự án 1 file Google Sheet: mỗi trang tính = 1 vòng lặp -->
      <SheetLinkField v-model="form.sheetUrl" v-model:auto="form.sheetAuto" :error="errors.sheetUrl" scope="project" />
      <!-- Thành viên: chỉ hiện người đã thêm; thêm qua ô tìm kiếm -->
      <div class="members">
        <div class="members__head">
          <span class="members__title">
            Thành viên <span class="members__count">{{ members.length }}</span>
            <InfoTip text="Vai trò trong dự án:" :items="PROJECT_ROLES.map(r => `${r.label}: ${r.hint}`)" />
          </span>
          <MemberPicker :users="candidates" :exclude-ids="form.memberIds" @add="add" />
        </div>
        <div v-if="members.length" class="members__list">
          <div v-for="u in members" :key="u.id" class="members__item">
            <UserAvatar class="members__avatar" :name="u.name" :picture="avatarOf(u)" />
            <span class="members__text">
              <span class="members__name">{{ u.name }}<span v-if="u.id === currentUser?.id" class="members__me"> (bạn)</span></span>
              <span class="members__sub">{{ u.email || u.code }}</span>
            </span>
            <AppTag :label="roleLabelOf(u) || '—'" :color="ROLE_COLOR[u.role] ?? 'neutral'" />
            <AppCombobox :clearable="false" v-model="form.memberRoles[u.id]" class="members__role" :options="PROJECT_ROLES" />
            <button class="btn-icon btn-icon--sm btn-icon--danger" type="button" v-tip="'Xóa khỏi dự án'" aria-label="Xóa khỏi dự án" @click="remove(u.id)"><TIcon name="trash" /></button>
          </div>
        </div>
        <p v-else class="members__empty">Chưa có thành viên — bấm “Thêm nhân viên” để tìm và thêm PO, BA, PD vào dự án.</p>
      </div>
    </div>
    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
      <button class="btn btn--primary" @click="save">Lưu</button>
    </template>
  </DialogShell>
</template>

<script setup>
import { vTip } from '@mds/utils/tooltip.js'
import { avatarOf } from '../store/avatar.js'
import { useDocTitle } from '@mds/utils/docTitle.js'
import { reactive, ref, computed, watch } from 'vue'
import { focusFirstError } from '@mds/utils/fieldError.js'
import DialogShell from './DialogShell.vue'
import AppInput    from '@mds/components/AppInput.vue'
import AppTextbox  from '@mds/components/AppTextbox.vue'
import AppTextarea from '@mds/components/AppTextarea.vue'
import AppTag      from '@mds/components/AppTag.vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import AppImageUpload from '@mds/components/AppImageUpload.vue'
import SheetLinkField, { isSheetUrl } from './SheetLinkField.vue'
import MemberPicker from './MemberPicker.vue'
import InfoTip     from './InfoTip.vue'
import TipField    from './TipField.vue'
import { db, currentUser, saveProject, divisionOptions as divisionTreeOptions, roleLabelOf, PROJECT_ROLES, projectRoleOf, defaultProjectRole } from '../store/db.js'
import UserAvatar from './UserAvatar.vue'

const props = defineProps({ project: { type: Object, default: null } })
const emit = defineEmits(['close', 'sync'])
const initialSheetUrl = props.project?.sheetUrl ?? ''   // nhớ link lúc mở form (saveProject sửa thẳng vào object dự án)
/* Tiêu đề tab khi thêm mới: Thêm … | Cha | MISA Solution Point (sửa thì giữ tiêu đề trang) */
useDocTitle(() => (props.project ? [] : ['Thêm dự án']))

// Dự án mới do PO tạo: tick sẵn chính PO đó
const defaultMembers = ['PO', 'PDL'].includes(currentUser.value?.role) ? [currentUser.value.id] : []
const form = reactive({ code: '', name: '', description: '', divisionId: '', logo: '', sheetUrl: '', sheetAuto: true, memberIds: defaultMembers, ...(props.project ? { ...props.project, memberIds: [...props.project.memberIds] } : {}) })
// Vai trò từng thành viên — điền sẵn theo dữ liệu cũ (PO = Quản trị, còn lại = Thành viên)
form.memberRoles = Object.fromEntries(form.memberIds.map(id => {
  const u = db.users.find(x => x.id === id)
  return [id, (props.project && projectRoleOf(props.project, u)) || (id === currentUser.value?.id && !props.project ? 'manager' : defaultProjectRole(u))]
}))
const errors = reactive({})
// Chưa có logo → chữ cái đầu của tên (giống avatar ở danh sách dự án)
const logoInitials = computed(() => (form.name || form.code || '').trim().split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase())
// Khối dạng cây: chọn bất kỳ mục nào (nhãn = đường dẫn “Khối › Nhóm”, gõ để tìm)
const divisionOptions = computed(() => divisionTreeOptions())

const ROLE_COLOR = { admin: 'danger', QA: 'neutral', PO: 'brand', BA: 'warning', PD: 'success' }
const ROLE_ORDER = { PO: 0, BA: 1, PD: 2 }
/** Có thể thêm: PO / BA / PD chưa bị khóa (Quản trị luôn xem được mọi dự án nên không cần thêm) */
const candidates = computed(() => db.users
  .filter(u => ['PO', 'PDL', 'BA', 'PD'].includes(u.role) && u.status !== 'disabled')
  .sort((a, b) => (ROLE_ORDER[a.role] - ROLE_ORDER[b.role]) || a.name.localeCompare(b.name, 'vi')))
/** Danh sách đã thêm — xếp PO → BA → PD, rồi theo tên */
const members = computed(() => form.memberIds.map(id => db.users.find(u => u.id === id)).filter(u => u && u.status !== 'disabled')
  .sort((a, b) => ((ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9)) || a.name.localeCompare(b.name, 'vi')))
function add(id) {
  form.memberIds.push(id)
  form.memberRoles[id] = defaultProjectRole(db.users.find(u => u.id === id))
}
function remove(id) {
  form.memberIds = form.memberIds.filter(m => m !== id)
  delete form.memberRoles[id]
}

const formEl = ref(null)
/* Sửa ô nào → lỗi ô đó tự mất (không chờ bấm Lưu lại) */
watch(() => ({ ...form }), (n, o) => { for (const k in errors) if (String(n[k] ?? '') !== String(o[k] ?? '')) delete errors[k] })

function save() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.code.trim()) errors.code = 'Nhập mã dự án'
  if (!form.name.trim()) errors.name = 'Nhập tên dự án'
  if (!form.divisionId) errors.divisionId = 'Chọn khối'
  form.sheetUrl = String(form.sheetUrl ?? '').trim()
  if (form.sheetUrl && !isSheetUrl(form.sheetUrl)) errors.sheetUrl = 'Link không phải Google Sheet (cần dạng https://docs.google.com/spreadsheets/d/…)'
  if (Object.keys(errors).length) return focusFirstError(formEl.value)
  const id = saveProject({ ...form, memberIds: [...form.memberIds], memberRoles: { ...form.memberRoles } })
  // Vừa gắn / đổi link Sheet dự án → mở luôn bước đồng bộ
  if (form.sheetUrl && form.sheetUrl !== initialSheetUrl) emit('sync', id)
  emit('close')
}
</script>

<style scoped>
.dlg-form { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.dlg-grid { display: grid; grid-template-columns: 160px minmax(0, 1fr); gap: var(--form-row-gap) var(--form-col-gap-sm); }
.members { display: flex; flex-direction: column; gap: 8px; }
.members__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.members__title { display: inline-flex; align-items: center; gap: 6px; font-size: var(--text-body); font-weight: var(--fw-semibold); line-height: var(--text-body-lh); color: var(--text-primary); }
.members__count { padding: 0 6px; border-radius: var(--radius-pill); background: var(--bg-neutral-light); color: var(--text-secondary); font-size: var(--text-sm); font-weight: var(--fw-medium); }
.members__list {
  display: flex; flex-direction: column; max-height: 320px; overflow-y: auto;
  border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default);
}
.members__item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; }
.members__item + .members__item { border-top: 1px solid var(--stroke-divider); }
.members__avatar {
  width: 28px; height: 28px; flex-shrink: 0; border-radius: var(--radius-pill);
  box-sizing: border-box; border: 1px solid var(--stroke-neutral-light);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: var(--text-sm); font-weight: var(--fw-semibold);
}
.members__text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.members__name { font-size: var(--text-body); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.members__role { width: 140px; flex-shrink: 0; }
.members__me { color: var(--text-secondary); }
.members__sub { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.members__empty { padding: 12px; border-radius: var(--radius-default); background: var(--bg-neutral-light); font-size: var(--text-body); color: var(--text-secondary); }
</style>
