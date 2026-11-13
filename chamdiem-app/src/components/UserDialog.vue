<template>
  <DialogShell :title="title" :width="560" :autofocus="isNew" @close="$emit('close')">
    <div ref="formEl" class="dlg-form">
      <p v-if="isPending" class="dlg-note dlg-note--brand">
        <TIcon name="info-circle" />
        <span v-if="user?.registeredAt"><strong>{{ form.name }}</strong> ({{ form.code }}) tự đăng ký lúc {{ registeredLabel }} và đã đặt mật khẩu. Kiểm tra thông tin, chọn bộ phận / vai trò, dự án rồi bấm “Duyệt &amp; cấp quyền” — sau đó họ đăng nhập bằng mã nhân viên và mật khẩu đã đặt.</span>
        <span v-else><strong>{{ form.email }}</strong> đã tự đăng nhập Google và đang chờ cấp quyền. Chọn bộ phận, dự án rồi bấm “Duyệt &amp; cấp quyền”.</span>
      </p>

      <!-- Dự án người dùng khai khi tự đăng ký: chọn từ danh sách (đã điền sẵn ở tab Dự án tham gia lúc duyệt) · tự nhập (chưa có trong hệ thống) -->
      <div v-if="requestedProjects.length || requestedCustom.length" class="reqp">
        <span class="reqp__label">Dự án khai khi đăng ký</span>
        <div class="reqp__list">
          <span v-for="p in requestedProjects" :key="p.id" class="reqp__chip" v-tip="isPending ? 'Đã điền sẵn ở tab Dự án tham gia' : p.code">
            <span class="reqp__logo"><img v-if="p.logo" :src="p.logo" alt="" /><span v-else :style="{ background: avatarColor(p.name).bg }">{{ avatarInitials(p.name) }}</span></span>{{ p.name }}
          </span>
          <span v-for="n in requestedCustom" :key="n" class="reqp__chip reqp__chip--custom" v-tip="'Tự nhập — chưa có trong danh sách dự án, cần phân vào dự án phù hợp'"><TIcon name="pencil" />{{ n }}</span>
        </div>
        <span v-if="requestedCustom.length" class="reqp__hint">Viền nét đứt = tên dự án tự nhập, không có trong hệ thống — thêm người này vào dự án tương ứng ở tab Dự án tham gia.</span>
      </div>

      <TipField :label="misa ? 'Tài khoản MISA ID' : 'Gmail đăng nhập'" :required="!user?.registeredAt" :message="errors.email"
        :tip="misa ? 'Email công ty hoặc tên đăng nhập MISA ID của người này. Họ đăng nhập qua id.misa.vn — app nhận diện theo tài khoản này.' : 'Gmail nhận link mời, link quên mật khẩu và dùng để đăng nhập'">
        <AppTextbox v-model="form.email" :type="misa ? 'text' : 'email'" :placeholder="misa ? 'ten@misa.com.vn' : 'ten@gmail.com'" :state="(isPending && !user?.registeredAt) || limited ? 'readonly' : (errors.email ? 'error' : 'default')" />
      </TipField>
      <div class="dlg-grid-2">
        <TipField label="Mã nhân viên" :required="true" :message="errors.code"
          tip="Dùng để khớp đúng người dùng khi nhập công việc từ file Google Sheet: cột PD / BA trong Sheet điền mã nhân viên này.">
          <AppTextbox v-model="form.code" placeholder="VD: B01-0001" :state="limited ? 'readonly' : errors.code ? 'error' : 'default'" />
        </TipField>
        <AppInput label="Họ và tên" :required="true" :message="errors.name">
          <AppTextbox v-model="form.name" :state="limited ? 'readonly' : errors.name ? 'error' : 'default'" />
        </AppInput>
      </div>
      <TipField label="Email công ty" :required="true" :message="errors.companyEmail" tip="Email công việc của người này (khác Gmail đăng nhập nếu dùng Gmail cá nhân) — để nhận diện và liên hệ.">
        <AppTextbox v-model="form.companyEmail" type="email" placeholder="ten@misa.com.vn" :state="limited ? 'readonly' : errors.companyEmail ? 'error' : 'default'" />
      </TipField>
      <div class="dlg-grid-2">
        <AppInput label="Bộ phận / vai trò" :required="true" :message="errors.role">
          <AppCombobox v-model="roleChoice" :options="deptOnly ? ROLE_CHOICES.filter(o => o.value === myDeptAdmin() || (myDeptAdmin() === 'PD' && o.value === 'PDL') || (o.value === roleChoiceOf(user) && user)) : ROLE_CHOICES" placeholder="Chọn bộ phận" :state="limited ? 'readonly' : errors.role ? 'error' : 'default'" />
        </AppInput>
        <!-- Khối: dùng chung danh mục khối (cây) với dự án — để thống kê nhân sự theo khối ở màn Người dùng -->
        <TipField label="Khối" tip="Khối / nhóm người này thuộc về — danh mục dạng cây (cha › con) do Quản trị cấu hình ở Cài đặt hệ thống, dùng chung với dự án. Chọn mục cụ thể nhất; màn Người dùng gom theo khối để thống kê số nhân sự.">
          <AppCombobox v-model="form.divisionId" :options="divisionOptions()" placeholder="Chọn khối" :state="limited ? 'readonly' : 'default'" />
        </TipField>
      </div>
      <!-- PO (hoặc vai trò khác ngoài PD / BA) kiêm Quản trị PD / BA — PD / BA thì chọn thẳng “Quản trị PD / BA” ở ô vai trò -->
      <TipField v-if="form.role === 'PO' && !deptOnly" label="Kiêm Quản trị bộ phận"
        tip="Quản trị PD / Quản trị BA: xem mọi dự án; tạo dự án, vòng lặp, thêm việc ở mọi dự án nhưng chỉ sửa phần của bộ phận mình; xem & chốt điểm toàn bộ người thuộc bộ phận đó; sửa hệ số của bộ phận. Quản lý người dùng thuộc bộ phận mình (không xóa, không gán quyền quản trị). Không xem điểm bộ phận kia.">
        <AppCombobox v-model="form.deptAdmin" :options="DEPT_ADMINS" :clearable="false" :state="limited ? 'readonly' : 'default'" />
      </TipField>
      <TipField v-if="form.role" label="Điểm kỳ vọng level" tip="Điểm/tháng khi làm đủ ngày, effort 100% — dùng để tính tỷ lệ đạt khi người này là người thực hiện công việc (bộ phận nào cũng được)">
        <AppNumberbox v-model="form.target" :min="0" :stepper="false" :state="self ? 'readonly' : 'default'" />
      </TipField>

      <!-- Phần quan hệ tách tab cho form gọn: Dự án tham gia · Quản lý trực tiếp · Đang quản lý -->
      <!-- Quản trị hệ thống / Quản trị PD / BA: xem & quản lý toàn bộ → Dự án tham gia, Tôi quản lý, Quản lý của tôi thừa → ẩn (dữ liệu cũ giữ nguyên khi lưu) -->
      <p v-if="hideRelations" class="dlg-note dlg-note--brand"><TIcon name="info-circle" /><span>{{ roleChoiceOf(form) === 'admin' ? 'Quản trị hệ thống' : `Quản trị ${form.deptAdmin}` }} xem được mọi dự án và quản lý toàn bộ {{ roleChoiceOf(form) === 'admin' ? 'người dùng' : `người thuộc bộ phận ${form.deptAdmin}` }} — không cần khai Dự án tham gia, Tôi quản lý, Quản lý của tôi.</span></p>
      <p v-if="self && !hideRelations" class="dlg-note dlg-note--brand"><TIcon name="info-circle" /><span>Bạn tự tick <strong>Dự án phụ trách</strong> ở tab Dự án tham gia (dùng để tự tick “Là dự án phụ trách” khi thêm việc — việc đã có giữ nguyên). Thông tin khác do Quản trị cập nhật ở màn Người dùng.</span></p>
      <div v-if="!hideRelations" class="utabs">
        <div class="utabs__bar">
          <button v-for="t in TABS" :key="t.id" type="button" class="sub-nav-tab" :class="{ active: tab === t.id }" @click="tab = t.id">
            {{ t.label }}<span class="utabs__count">{{ t.count() }}</span><InfoTip :text="t.tip" />
          </button>
        </div>

        <!-- ① Dự án tham gia (+ tick dự án phụ trách) -->
        <div v-if="tab === 'projects'" class="plist">
          <div class="plist__head">
            <MemberPicker v-if="!self" kind="project" label="Thêm dự án" recent-key="recent-pick-projects" :users="db.projects" :exclude-ids="form.projectIds" @add="addProject" />
          </div>
          <div v-if="pickedProjects.length" class="plist__list">
            <div v-for="p in pickedProjects" :key="p.id" class="plist__item">
              <span class="plist__icon"><TIcon name="briefcase" /></span>
              <span class="plist__text">
                <span class="plist__name">{{ p.name }}</span>
                <span class="plist__sub">{{ p.code }}</span>
              </span>
              <!-- Vai trò trong dự án: Quản trị / Thành viên / Hạn chế -->
              <AppCombobox v-if="form.role === 'QA'" :model-value="'viewer'" :options="PROJECT_ROLES" :clearable="false" class="plist__role" disabled title="QA luôn chỉ xem" />
              <AppCombobox v-else v-model="projectRoles[p.id]" :options="PROJECT_ROLES" :clearable="false" class="plist__role" :disabled="self || (limited && !canManageProject(p.id))" />
              <AppCheckbox v-model="form.primaryProjectIds" :value="p.id" label="Dự án phụ trách" />
              <button v-if="!self" class="btn-icon btn-icon--sm btn-icon--danger" type="button" v-tip="'Bỏ khỏi dự án'" aria-label="Bỏ khỏi dự án"
                @click="removeProject(p.id)"><TIcon name="trash" /></button>
            </div>
          </div>
          <p v-else class="plist__empty">{{ form.role === 'admin' ? 'Quản trị luôn xem được mọi dự án — không cần thêm.' : form.role === 'HRBP' ? 'HRBP luôn xem được mọi dự án, công việc và điểm (chỉ xem) — không cần thêm.' : form.role === 'QA' ? 'QA chỉ xem được dự án được thêm ở đây (và thành viên các dự án đó) — chưa có dự án nào.' : 'Chưa tham gia dự án nào.' }}</p>
        </div>

        <!-- ② Quản lý trực tiếp của người này -->
        <div v-else-if="tab === 'managers'" class="plist">
          <div class="plist__head">
            <MemberPicker v-if="!self" label="Thêm quản lý" recent-key="recent-pick-managers" :frequent="frequentManagers" :users="managerCandidates" :exclude-ids="form.managerIds" @add="id => form.managerIds.push(id)" />
          </div>
          <div v-if="pickedManagers.length" class="plist__list">
            <div v-for="u in pickedManagers" :key="u.id" class="plist__item">
              <UserAvatar class="plist__avatar" :name="u.name" :picture="avatarOf(u)" />
              <span class="plist__text">
                <span class="plist__name">{{ u.name }}</span>
                <span class="plist__sub">{{ u.email || u.code }}</span>
              </span>
              <AppTag :label="roleLabel(u.role) || '—'" color="neutral" />
              <button v-if="!self" class="btn-icon btn-icon--sm btn-icon--danger" type="button" v-tip="'Bỏ quản lý'" aria-label="Bỏ quản lý"
                @click="form.managerIds = form.managerIds.filter(x => x !== u.id)"><TIcon name="trash" /></button>
            </div>
          </div>
          <p v-else class="plist__empty">Chưa có quản lý (cấp trên).</p>
        </div>

        <!-- ③ Người này đang quản lý trực tiếp những ai -->
        <div v-else class="plist">
          <div class="plist__head">
            <MemberPicker v-if="!self" label="Thêm nhân viên" recent-key="recent-pick-reports" :users="reportCandidates" :exclude-ids="reportIds" @add="id => reportIds.push(id)" />
          </div>
          <div v-if="pickedReports.length" class="plist__list">
            <div v-for="u in pickedReports" :key="u.id" class="plist__item">
              <UserAvatar class="plist__avatar" :name="u.name" :picture="avatarOf(u)" />
              <span class="plist__text">
                <span class="plist__name">{{ u.name }}</span>
                <span class="plist__sub">{{ u.email || u.code }}</span>
              </span>
              <AppTag :label="roleLabel(u.role) || '—'" color="neutral" />
              <button v-if="!self" class="btn-icon btn-icon--sm btn-icon--danger" type="button" v-tip="'Bỏ khỏi danh sách quản lý'" aria-label="Bỏ khỏi danh sách quản lý"
                @click="reportIds = reportIds.filter(x => x !== u.id)"><TIcon name="trash" /></button>
            </div>
          </div>
          <p v-else class="plist__empty">Chưa quản lý ai (cấp dưới).</p>
        </div>
      </div>

      <!-- Mật khẩu: Quản trị đặt / đặt lại trực tiếp (reset cứng) -->
      <div v-if="canSetPassword" class="dlg-pw">
        <TIcon name="lock" />
        <span>Mật khẩu: <strong>{{ user.hasPassword ? 'Đã đặt' : 'Chưa đặt' }}</strong></span>
        <button class="btn btn--link" type="button" @click="showPw = true">{{ user.hasPassword ? 'Đặt lại mật khẩu' : 'Đặt mật khẩu' }}</button>
      </div>
      <div v-if="canLock" class="dlg-lock">
        <AppCheckbox v-model="locked" label="Khóa quyền truy cập (nghỉ việc, chuyển bộ phận…)" />
      </div>
      <p v-if="serverError" class="dlg-note dlg-note--danger"><TIcon name="circle-x" /><span>{{ serverError }}</span></p>
    </div>

    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">{{ self ? 'Đóng' : 'Hủy' }}</button>
      <button v-if="self" class="btn btn--primary" :disabled="busy || !primaryDirty" @click="saveSelf">Lưu</button>
      <template v-else-if="isPending">
        <button class="btn btn--primary" :disabled="busy" @click="save('approve')">Duyệt &amp; cấp quyền</button>
      </template>
      <template v-else-if="canInvite">
        <button class="btn btn--outline btn--neutral" :disabled="busy" @click="save()">Lưu</button>
        <button class="btn btn--primary" :disabled="busy" @click="save('invite')">
          <TIcon name="send" />{{ user?.status === 'invited' ? 'Lưu & gửi lại lời mời' : 'Lưu & gửi lời mời' }}
        </button>
      </template>
      <button v-else class="btn btn--primary" :disabled="busy" @click="save()">Lưu</button>
    </template>
  </DialogShell>
  <SetUserPasswordDialog v-if="showPw" :user="user" @close="showPw = false" />
</template>

<script setup>
import { vTip } from '@mds/utils/tooltip.js'
import { avatarOf } from '../store/avatar.js'
import { ROLE_CHOICES, roleChoiceOf } from '../store/scoring.js'
import { avatarInitials, avatarColor } from '@mds/utils/avatar.js'
import { useDocTitle } from '@mds/utils/docTitle.js'
import { reactive, ref, computed, watch } from 'vue'
import { focusFirstError } from '@mds/utils/fieldError.js'
import DialogShell  from './DialogShell.vue'
import SetUserPasswordDialog from './SetUserPasswordDialog.vue'
import TIcon        from '@mds/components/TIcon.vue'
import AppTag       from '@mds/components/AppTag.vue'
import AppInput     from '@mds/components/AppInput.vue'
import TipField     from './TipField.vue'
import AppTextbox   from '@mds/components/AppTextbox.vue'
import AppCombobox  from '@mds/components/AppCombobox.vue'
import AppCheckbox  from '@mds/components/AppCheckbox.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import MemberPicker from './MemberPicker.vue'
import InfoTip      from './InfoTip.vue'
import { isAdmin, isManagerOf, canManageProject, db, ROLES, USER_STATUSES, currentUser, roleLabel, saveUser, inviteUser, managerIdsOf, primaryProjectIdsOf, PROJECT_ROLES, projectRoleOf, defaultProjectRole, DEPT_ADMINS, canManageUser, myDeptAdmin, divisionOptions } from '../store/db.js'
import UserAvatar from './UserAvatar.vue'
import { api, backend } from '../store/api.js'
import { toast } from '@mds/utils/toast.js'
/* Máy chủ bật MISA ID → ô tài khoản nhận email công ty / tên đăng nhập MISA */
const misa = computed(() => !!backend.publicConfig?.misaLogin)

/* self: mở từ menu avatar “Thông tin tài khoản” — cùng form, mọi thứ chỉ xem trừ tick “Dự án phụ trách” (lưu qua /api/me/primary-projects) */
const props = defineProps({ user: { type: Object, default: null }, self: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'invited'])
/* Tiêu đề tab khi thêm mới: Thêm … | Cha | MISA Solution Point (sửa thì giữ tiêu đề trang) */
useDocTitle(() => (props.user ? [] : ['Mời người dùng']))

const form = reactive({
  code: '', name: '', email: '', companyEmail: '', role: '', target: 0, deptAdmin: '', divisionId: '', ...(props.user ?? {}),
  managerIds: [...managerIdsOf(props.user)],
  primaryProjectIds: [...primaryProjectIdsOf(props.user)],
  projectIds: props.user ? db.projects.filter(p => p.memberIds.includes(props.user.id)).map(p => p.id) : [],
  ...(props.user?.status === 'pending' && props.user.requestedProjectIds?.length
    ? { projectIds: [...new Set([...db.projects.filter(p => p.memberIds.includes(props.user.id)).map(p => p.id), ...props.user.requestedProjectIds.filter(pid => db.projects.some(p => p.id === pid))])] } : {}),   // người tự đăng ký: điền sẵn dự án họ chọn
})
delete form.leadId; delete form.isLead; delete form.primaryProjectId   // trường cũ
const errors = reactive({})
const busy = ref(false), serverError = ref('')
const locked = ref(props.user?.status === 'disabled')

const isNew     = computed(() => !props.user)
// Quản lý trực tiếp (không phải Quản trị): chỉ sửa Điểm kỳ vọng + 3 tab Dự án tham gia / Quản lý trực tiếp / Đang quản lý
const limited = computed(() => props.self || !canManageUser(props.user))   // Quản trị PD / BA: sửa đầy đủ người bộ phận mình
const hideRelations = computed(() => ['admin', 'PD@admin', 'BA@admin'].includes(roleChoiceOf(form)))
const deptOnly = computed(() => !isAdmin() && !!myDeptAdmin())   // chỉ chọn được bộ phận mình, không gán quyền Quản trị bộ phận
/* Ô vai trò gộp Quản trị PD / BA: chọn → bộ phận PD / BA + deptAdmin · chọn PD / BA thường → bỏ quyền quản trị · Quản trị hệ thống / QA → bỏ */
const roleChoice = computed({
  get: () => roleChoiceOf(form),
  set: v => {
    const [role, adm] = String(v ?? '').split('@')
    form.role = role
    if (adm) form.deptAdmin = role
    else if (role !== 'PO') form.deptAdmin = ''
  },
})
const isPending = computed(() => props.user?.status === 'pending' && !limited.value)
const requestedProjects = computed(() => (props.user?.requestedProjectIds ?? []).map(pid => db.projects.find(p => p.id === pid)).filter(Boolean))
const requestedCustom = computed(() => props.user?.requestedProjectNames ?? [])
const registeredLabel = computed(() => (props.user?.registeredAt ? new Date(props.user.registeredAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : ''))
const canInvite = computed(() => !limited.value && (isNew.value || ['none', 'invited'].includes(props.user?.status)))
const canSetPassword = computed(() => !props.self && !limited.value && !isNew.value && !isPending.value && !!props.user?.email && props.user?.status !== 'disabled')
const showPw = ref(false)
const canLock   = computed(() => !limited.value && !isNew.value && !isPending.value && props.user.id !== currentUser.value?.id)
const title = computed(() => (props.self ? 'Thông tin tài khoản' : isNew.value ? 'Mời người dùng' : isPending.value ? 'Duyệt người dùng' : 'Sửa người dùng'))
/* “Hay được chọn” làm quản lý trực tiếp: người đang là quản lý của nhiều người nhất (tính từ dữ liệu sẵn có) */
const frequentManagers = computed(() => {
  const c = {}
  for (const u of db.users) if (u.status !== 'disabled') for (const m of managerIdsOf(u)) c[m] = (c[m] ?? 0) + 1
  return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ id, count }))
})
/* Quản lý trực tiếp: bất kỳ người dùng nào (trừ chính mình, người đã khóa) */
const managerCandidates = computed(() => db.users.filter(u => u.id !== form.id && u.status !== 'disabled')
  .sort((a, b) => a.name.localeCompare(b.name, 'vi')))
// Tự xem (self): người dùng thường có thể chưa tải đủ danh bạ → lấy thêm quản lý / người mình quản lý từ /api/me/profile
const extraUsers = ref([])
const userLookup = id => db.users.find(u => u.id === id) ?? extraUsers.value.find(u => u.id === id)
const pickedManagers = computed(() => form.managerIds.map(userLookup).filter(u => u && u.status !== 'disabled'))
/* Đang quản lý: người có managerIds chứa người này — sửa ở đây thì lưu ngược vào hồ sơ từng người */
const initialReports = props.user ? db.users.filter(u => managerIdsOf(u).includes(props.user.id)).map(u => u.id) : []
const reportIds = ref([...initialReports])
const reportCandidates = computed(() => db.users.filter(u => u.id !== form.id && u.status !== 'disabled' && !form.managerIds.includes(u.id) && (!limited.value || isManagerOf(currentUser.value, u)))   // quản lý trực tiếp: chỉ thêm người mình đang quản lý
  .sort((a, b) => a.name.localeCompare(b.name, 'vi')))
const pickedReports = computed(() => reportIds.value.map(userLookup).filter(u => u && u.status !== 'disabled'))
if (props.self) api.get('/api/me/profile').then(r => {
  extraUsers.value = [...r.managers, ...r.reports]
  reportIds.value = r.reports.map(u => u.id)
  form.managerIds = r.managers.map(u => u.id)
  for (const p of r.projects) if (!form.projectIds.includes(p.id)) form.projectIds.push(p.id)
}).catch(() => {})

const tab = ref('projects')
const TABS = [
  { id: 'projects', label: 'Dự án tham gia',    count: () => form.projectIds.length, tip: 'Tick “Dự án phụ trách” cho dự án người này phụ trách (được nhiều dự án) — gợi ý cột “Là dự án phụ trách” khi giao việc.' },
  { id: 'reports',  label: 'Tôi quản lý',     count: () => pickedReports.value.length, tip: 'Các nhân viên người dùng này quản lý (cấp dưới) — được xem, sửa (điểm kỳ vọng, dự án…) và chốt / mở chốt điểm của họ. Thêm / bỏ ở đây cập nhật vào hồ sơ từng nhân viên.' },
  { id: 'managers', label: 'Quản lý của tôi', count: () => pickedManagers.value.length, tip: 'Người khác quản lý người dùng này (cấp trên) — được xem, sửa và chốt / mở chốt điểm của người này.' },
]

/* Vai trò trong từng dự án tham gia — dự án đã có: vai trò hiện tại; thêm mới: mặc định theo bộ phận (PO = Quản trị, còn lại = Thành viên) */
const projectRoles = reactive(Object.fromEntries(form.projectIds.map(pid => [pid, projectRoleOf(db.projects.find(p => p.id === pid), props.user) ?? defaultProjectRole(form)])))
function addProject(id) { form.projectIds.push(id); projectRoles[id] = defaultProjectRole(form) }
function removeProject(id) {
  form.projectIds = form.projectIds.filter(x => x !== id)
  form.primaryProjectIds = form.primaryProjectIds.filter(x => x !== id)
}
const pickedProjects = computed(() => form.projectIds.map(id => db.projects.find(p => p.id === id)).filter(Boolean)
  .sort((a, b) => a.name.localeCompare(b.name, 'vi')))

function validate(needEmail) {
  Object.keys(errors).forEach(k => delete errors[k])
  if (limited.value) return true   // quản lý trực tiếp không sửa thông tin định danh → không kiểm tra lại (máy chủ giữ nguyên)
  const email = form.email.trim().toLowerCase()
  if (!form.name.trim()) errors.name = 'Nhập họ tên'
  const code = String(form.code ?? '').trim()
  if (!code) errors.code = 'Nhập mã nhân viên'
  else if (db.users.some(u => u.id !== form.id && String(u.code ?? '').trim().toLowerCase() === code.toLowerCase())) errors.code = 'Mã nhân viên này đã có trong danh sách'
  const work = String(form.companyEmail ?? '').trim().toLowerCase()
  if (!work) errors.companyEmail = 'Nhập email công ty'
  else if (!/^\S+@\S+\.\S+$/.test(work)) errors.companyEmail = 'Email công ty không hợp lệ'
  else if (db.users.some(u => u.id !== form.id && (u.companyEmail || '').toLowerCase() === work)) errors.companyEmail = 'Email công ty này đã có trong danh sách'
  if (!form.role) errors.role = 'Chọn bộ phận'
  const what = misa.value ? 'tài khoản MISA ID' : 'Gmail'
  if (needEmail && !email) errors.email = `Nhập ${what} để gửi lời mời`
  else if (email && (misa.value ? !/^[\w.+@-]+$/.test(email) : !/^\S+@\S+\.\S+$/.test(email))) errors.email = `${what[0].toUpperCase() + what.slice(1)} không hợp lệ`
  else if (email && db.users.some(u => u.id !== form.id && (u.email || '').toLowerCase() === email)) errors.email = `${what[0].toUpperCase() + what.slice(1)} này đã có trong danh sách`
  return !Object.keys(errors).length
}

/** action: undefined = lưu · 'invite' = lưu + gửi lời mời · 'approve' = duyệt người chờ cấp quyền */
const formEl = ref(null)
/* Sửa ô nào → lỗi ô đó tự mất (không chờ bấm Lưu lại) */
watch(() => ({ ...form }), (n, o) => { for (const k in errors) if (String(n[k] ?? '') !== String(o[k] ?? '')) delete errors[k] })

/* Tự lưu dự án phụ trách (chế độ self) */
const initialPrimary = JSON.stringify([...form.primaryProjectIds].sort())
const primaryDirty = computed(() => JSON.stringify([...form.primaryProjectIds].sort()) !== initialPrimary)
async function saveSelf() {
  busy.value = true; serverError.value = ''
  try {
    const r = await api.put('/api/me/primary-projects', { ids: form.primaryProjectIds.filter(id => form.projectIds.includes(id)) })
    const me = db.users.find(u => u.id === props.user.id); if (me) me.primaryProjectIds = r.primaryProjectIds
    toast.success('Đã lưu dự án phụ trách'); emit('close')
  } catch (e) { serverError.value = e.message || 'Không lưu được' }
  finally { busy.value = false }
}
async function save(action) {
  if (!validate(action === 'invite')) return focusFirstError(formEl.value)
  busy.value = true; serverError.value = ''
  try {
    const { projectIds, ...data } = form
    data.email = data.email.trim().toLowerCase()
    data.companyEmail = String(data.companyEmail ?? '').trim().toLowerCase()
    data.code = String(data.code ?? '').trim()
    data.target = Number(data.target) || 0
    data.divisionId = data.divisionId || ''   // bỏ chọn khối → gửi '' (máy chủ giữ khối cũ khi không gửi trường này)
    delete data.baLevel
    data.managerIds = [...new Set(data.managerIds)].filter(id => id !== data.id)
    data.primaryProjectIds = data.primaryProjectIds.filter(id => projectIds.includes(id))
    if (action === 'approve') data.status = 'active'
    else if (canLock.value) data.status = locked.value ? 'disabled' : (props.user.status === 'disabled' ? 'active' : props.user.status)
    const u = await saveUser(data, projectIds, Object.fromEntries(projectIds.map(pid => [pid, projectRoles[pid]])))
    // Lưu ngược "Đang quản lý" vào hồ sơ người được thêm / bỏ
    const added = reportIds.value.filter(id => !initialReports.includes(id))
    const removed = initialReports.filter(id => !reportIds.value.includes(id))
    for (const id of [...added, ...removed]) {
      const r = db.users.find(x => x.id === id); if (!r) continue
      const ids = managerIdsOf(r).filter(m => m !== u.id)
      await saveUser({ ...r, managerIds: added.includes(id) ? [...ids, u.id] : ids })
    }
    if (action === 'invite') emit('invited', await inviteUser(u.id), u)
    emit('close')
  } catch (e) {
    serverError.value = e.message
  } finally { busy.value = false }
}
</script>

<style scoped>
.dlg-grid-2 { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: var(--form-row-gap) var(--form-col-gap-sm); }
.dlg-form { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.dlg-pw { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-secondary); }
.dlg-pw strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.dlg-pw .btn--link { margin-left: auto; }
.dlg-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--form-row-gap) var(--form-col-gap-sm); align-items: start; }
.utabs { display: flex; flex-direction: column; gap: 12px; }
.utabs__bar { display: flex; border-bottom: 1px solid var(--stroke-neutral-light); }
.utabs__count { margin-left: 6px; padding: 0 6px; border-radius: var(--radius-pill); background: var(--bg-neutral-light); color: var(--text-secondary); font-size: var(--text-sm); font-weight: var(--fw-medium); }
.plist { display: flex; flex-direction: column; gap: 8px; min-height: 160px; }
.utabs__bar .info-tip { margin-left: 4px; }
.utabs__bar .sub-nav-tab { margin-bottom: -1px; }   /* gạch chân đè viền dưới thanh tab */
.plist__head { display: flex; align-items: center; justify-content: flex-start; gap: 8px; }
.plist__list { display: flex; flex-direction: column; max-height: 240px; overflow-y: auto; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); }
.plist__item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; }
.plist__role { width: 140px; flex-shrink: 0; }
.plist__item + .plist__item { border-top: 1px solid var(--stroke-divider); }
.plist__avatar { width: 28px; height: 28px; flex-shrink: 0; border-radius: var(--radius-pill); box-sizing: border-box; border: 1px solid var(--stroke-neutral-light); display: inline-flex; align-items: center; justify-content: center; font-size: var(--text-sm); font-weight: var(--fw-semibold); }
.plist__icon { width: 28px; height: 28px; flex-shrink: 0; border-radius: var(--radius-default); display: inline-flex; align-items: center; justify-content: center; background: var(--bg-brand-light); color: var(--icon-brand); font-size: 16px; }
.plist__text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.plist__name { font-size: var(--text-body); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.plist__sub { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.plist__empty { padding: 12px; border-radius: var(--radius-default); background: var(--bg-neutral-light); font-size: var(--text-body); color: var(--text-secondary); }
.dlg-lock { padding-top: 12px; border-top: 1px solid var(--stroke-divider); }
.reqp { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border-radius: var(--radius-default); background: var(--bg-neutral-light); }
.reqp__label { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-secondary); }
.reqp__list { display: flex; flex-wrap: wrap; gap: 6px; }
.reqp__chip { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px 2px 3px; border-radius: 6px; background: var(--bg-white); box-shadow: 0 0 0 1px var(--stroke-neutral-light); font-size: var(--text-body); color: var(--text-primary); }
.reqp__chip--custom { padding-left: 8px; box-shadow: none; border: 1px dashed var(--stroke-neutral); }
.reqp__chip--custom .ti { font-size: 14px; color: var(--icon-neutral); }
.reqp__logo { width: 20px; height: 20px; border-radius: 4px; overflow: hidden; display: inline-flex; flex-shrink: 0; }
.reqp__logo img { width: 100%; height: 100%; object-fit: contain; }
.reqp__logo span { width: 100%; height: 100%; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; font-weight: var(--fw-semibold); color: var(--text-primary); }
.reqp__hint { font-size: var(--text-body); color: var(--text-secondary); }
.dlg-note { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); font-size: var(--text-body); line-height: var(--text-body-lh); }
.dlg-note strong { font-weight: var(--fw-semibold); }
.dlg-note--brand  { background: var(--bg-brand-light);  color: var(--text-primary); }
.dlg-note--danger { background: var(--bg-danger-light); color: var(--text-danger); }
</style>
