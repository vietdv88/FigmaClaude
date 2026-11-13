<template>
  <!-- Thẻ xác nhận thao tác AVA đề xuất — sửa / bỏ từng dòng rồi bấm nút mới ghi dữ liệu (gọi đúng hàm như nhập tay: kiểm quyền, lịch sử, thông báo) -->
  <div class="aact" :class="{ 'aact--done': state?.done }">
    <!-- ① Sửa công việc đang mở -->
    <template v-if="action.type === 'update_task'">
      <div class="aact__head"><TIcon name="pencil" /><span>Cập nhật công việc <strong>{{ task ? taskName(task) : '(không còn mở)' }}</strong></span></div>
      <p v-if="action.reason" class="aact__reason">{{ action.reason }}</p>
      <p v-if="!task" class="aact__warn">Không tìm thấy công việc — mở lại công việc rồi hỏi AVA.</p>
      <div v-else class="aact__rows">
        <label v-for="f in upd" :key="f.key" class="aact__field" :class="{ 'aact__field--off': !f.can }">
          <AppCheckbox v-model="f.on" :disabled="!f.can || state?.done" />
          <span class="aact__flabel">{{ f.label }}<small>{{ f.can ? `hiện tại: ${f.cur === '' || f.cur == null ? '—' : f.cur}` : 'không có quyền sửa' }}</small></span>
          <AppNumberbox v-if="f.num" v-model="f.val" :min="0" size="sm" class="aact__ctl" :state="f.can && !state?.done ? 'default' : 'readonly'" />
          <AppCombobox v-else v-model="f.val" :options="f.options" :clearable="false" size="sm" class="aact__ctl" :state="f.can && !state?.done ? 'default' : 'readonly'" />
        </label>
      </div>
      <div v-if="task && !state?.done" class="aact__foot">
        <button class="btn btn--primary btn--sm" :disabled="busy || !upd.some(f => f.on && f.can)" @click="doUpdate">Áp dụng vào công việc đang mở</button>
        <button class="btn btn--outline btn--neutral btn--sm" @click="cancel">Bỏ qua</button>
      </div>
    </template>

    <!-- ② Tạo công việc -->
    <template v-else-if="action.type === 'create_tasks'">
      <div class="aact__head"><TIcon name="list-details" /><span>Tạo <strong>{{ rows.filter(r => r.on).length }}</strong> công việc</span></div>
      <div class="aact__where">
        <AppCombobox v-model="projectId" :options="addProjects" placeholder="Chọn dự án" size="sm" :clearable="false" :state="state?.done ? 'readonly' : 'default'" />
        <AppCombobox v-model="iterationId" :options="iterOptions" placeholder="Chọn vòng lặp" size="sm" :clearable="false" :state="state?.done ? 'readonly' : 'default'" />
      </div>
      <p v-if="projectId && !canAddTask(projectId)" class="aact__warn">Bạn không có quyền thêm việc vào dự án này.</p>
      <div class="aact__rows">
        <div v-for="(r, i) in rows" :key="i" class="aact__task" :class="{ 'aact__task--off': !r.on }">
          <div class="aact__task-top">
            <AppCheckbox v-model="r.on" :disabled="state?.done" />
            <AppTextbox v-model="r.content" size="sm" class="aact__grow" placeholder="Nội dung" :state="state?.done ? 'readonly' : 'default'" />
          </div>
          <div class="aact__task-grid">
            <AppTextbox v-model="r.pbi" size="sm" placeholder="PBI" :state="state?.done ? 'readonly' : 'default'" />
            <AppCombobox v-model="r.pdId" :options="memberOptions" size="sm" placeholder="PD" :state="state?.done ? 'readonly' : 'default'" />
            <AppNumberbox v-model="r.mainScreens" :min="0" size="sm" v-tip="'Màn hình chính'" :state="state?.done ? 'readonly' : 'default'" />
            <AppNumberbox v-model="r.subScreens" :min="0" size="sm" v-tip="'Màn hình phụ'" :state="state?.done ? 'readonly' : 'default'" />
            <AppCombobox v-model="r.complexity" :options="COMPLEXITIES" size="sm" :clearable="false" v-tip="'Độ phức tạp thiết kế'" :state="state?.done ? 'readonly' : 'default'" />
            <AppCombobox v-model="r.businessLevel" :options="BUSINESS_VALUES" size="sm" :clearable="false" v-tip="'Hệ số nghiệp vụ'" :state="state?.done ? 'readonly' : 'default'" />
            <AppCombobox v-model="r.solutionBy" :options="SOLUTION_ROLES" size="sm" :clearable="false" v-tip="'Người đưa giải pháp'" :state="state?.done ? 'readonly' : 'default'" />
            <AppCombobox v-model="r.platform" :options="PLATFORMS" size="sm" :clearable="false" v-tip="'Nền tảng'" :state="state?.done ? 'readonly' : 'default'" />
          </div>
          <span v-if="r.warn" class="aact__warn">{{ r.warn }}</span>
        </div>
      </div>
      <div v-if="!state?.done" class="aact__foot">
        <button class="btn btn--primary btn--sm" :disabled="busy || !canCreateTasks" @click="doCreateTasks">Tạo {{ rows.filter(r => r.on && r.content.trim()).length }} công việc</button>
        <button class="btn btn--outline btn--neutral btn--sm" @click="cancel">Bỏ qua</button>
      </div>
    </template>

    <!-- ③ Tạo dự án (+ thành viên, vòng lặp đầu) -->
    <template v-else-if="action.type === 'create_project'">
      <div class="aact__head"><TIcon name="briefcase" /><span>Tạo dự án mới</span></div>
      <p v-if="!canCreateProject()" class="aact__warn">Bạn không có quyền tạo dự án.</p>
      <div class="aact__form">
        <AppTextbox v-model="proj.name" size="sm" placeholder="Tên dự án" :state="state?.done ? 'readonly' : 'default'" />
        <AppTextbox v-model="proj.code" size="sm" placeholder="Mã dự án" :state="state?.done ? 'readonly' : 'default'" />
        <AppCombobox v-model="proj.divisionId" :options="divisionOptions()" size="sm" placeholder="Chọn khối" :state="state?.done ? 'readonly' : 'default'" />
        <AppCombobox v-model="proj.memberIds" :options="allUserOptions" multiple tag-avatar size="sm" placeholder="Thành viên" :state="state?.done ? 'readonly' : 'default'" />
        <span v-for="w in proj.warns" :key="w" class="aact__warn">{{ w }}</span>
        <AppCheckbox v-if="action.iteration" v-model="proj.withIter" :disabled="state?.done" :label="`Tạo luôn vòng lặp “${action.iteration.name}”${action.iteration.startDate ? ` (${action.iteration.startDate} → ${action.iteration.endDate || '?'})` : ''}`" />
      </div>
      <div v-if="!state?.done" class="aact__foot">
        <button class="btn btn--primary btn--sm" :disabled="busy || !canCreateProject() || !proj.name.trim() || !proj.code.trim() || !proj.divisionId" @click="doCreateProject">Tạo dự án</button>
        <button class="btn btn--outline btn--neutral btn--sm" @click="cancel">Bỏ qua</button>
      </div>
    </template>

    <!-- ④ Tạo vòng lặp cho dự án đang mở -->
    <template v-else-if="action.type === 'create_iteration'">
      <div class="aact__head"><TIcon name="calendar" /><span>Tạo vòng lặp cho <strong>{{ projectById(ctxProjectId)?.name ?? '(chưa mở dự án)' }}</strong></span></div>
      <p v-if="!ctxProjectId || !canManageProject(ctxProjectId)" class="aact__warn">Cần mở dự án bạn là Quản trị để tạo vòng lặp.</p>
      <div class="aact__form">
        <AppTextbox v-model="iter.name" size="sm" placeholder="Tên vòng lặp" :state="state?.done ? 'readonly' : 'default'" />
        <div class="aact__where">
          <label class="aact__date"><span>Từ ngày</span><AppDatebox v-model="iter.startDate" size="sm" :state="state?.done ? 'readonly' : 'default'" /></label>
          <label class="aact__date"><span>Đến ngày</span><AppDatebox v-model="iter.endDate" size="sm" :state="state?.done ? 'readonly' : 'default'" /></label>
        </div>
      </div>
      <div v-if="!state?.done" class="aact__foot">
        <button class="btn btn--primary btn--sm" :disabled="busy || !ctxProjectId || !canManageProject(ctxProjectId) || !iter.name.trim() || !iter.startDate || !iter.endDate || iter.endDate < iter.startDate" @click="doCreateIteration">Tạo vòng lặp</button>
        <button class="btn btn--outline btn--neutral btn--sm" @click="cancel">Bỏ qua</button>
      </div>
    </template>

    <!-- ⑤ Thêm thành viên vào dự án đang mở -->
    <template v-else-if="action.type === 'add_members'">
      <div class="aact__head"><TIcon name="user-plus" /><span>Thêm thành viên vào <strong>{{ projectById(ctxProjectId)?.name ?? '(chưa mở dự án)' }}</strong></span></div>
      <p v-if="!ctxProjectId || !canManageProject(ctxProjectId)" class="aact__warn">Cần mở dự án bạn là Quản trị để thêm thành viên.</p>
      <div class="aact__rows">
        <div v-for="(m, i) in mems" :key="i" class="aact__task" :class="{ 'aact__task--off': !m.on }">
          <div class="aact__task-top">
            <AppCheckbox v-model="m.on" :disabled="state?.done" />
            <AppCombobox v-model="m.userId" :options="allUserOptions" size="sm" class="aact__grow" placeholder="Chọn người" tag-avatar :state="state?.done ? 'readonly' : 'default'" />
          </div>
          <AppCombobox v-model="m.role" :options="ROLE_OPTS" size="sm" :clearable="false" :state="state?.done ? 'readonly' : 'default'" />
          <span v-if="m.warn" class="aact__warn">{{ m.warn }}</span>
          <span v-else-if="isMember(m.userId)" class="aact__warn">Đã là thành viên — sẽ cập nhật vai trò</span>
        </div>
      </div>
      <div v-if="!state?.done" class="aact__foot">
        <button class="btn btn--primary btn--sm" :disabled="busy || !ctxProjectId || !canManageProject(ctxProjectId) || !mems.some(m => m.on && m.userId)" @click="doAddMembers">Thêm {{ mems.filter(m => m.on && m.userId).length }} thành viên</button>
        <button class="btn btn--outline btn--neutral btn--sm" @click="cancel">Bỏ qua</button>
      </div>
    </template>

    <!-- Kết quả -->
    <p v-if="state?.done" class="aact__result" :class="{ 'aact__result--cancel': state.cancelled }">
      <TIcon :name="state.cancelled ? 'circle-x' : 'circle-check'" />{{ state.text }}
      <button v-if="state.link" type="button" class="btn btn--link btn--sm" @click="router.push(state.link)">Mở</button>
    </p>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import TIcon from '@mds/components/TIcon.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import AppDatebox from '@mds/components/AppDatebox.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'
import {
  db, currentUser, canAddTask, canManageProject, canCreateProject, canEditField, updateTaskFields, importTasks, saveProject, saveIteration, projectSaved,
  ownProjectFor, projectById, iterationsOf, divisionOptions,
} from '../store/db.js'
import { COMPLEXITIES, BUSINESS_VALUES, SOLUTION_ROLES, PLATFORMS, DEFAULT_STATUS, DEFAULT_RATING, DEFAULT_BUSINESS, FIELD_LABELS } from '../store/scoring.js'

const props = defineProps({ action: { type: Object, required: true }, state: { type: Object, default: null } })
const emit = defineEmits(['update:state'])
const router = useRouter()
const busy = ref(false)
const finish = (text, link = null) => emit('update:state', { done: true, text, link })
const cancel = () => emit('update:state', { done: true, cancelled: true, text: 'Đã bỏ qua thao tác này' })
const taskName = t => (t.pbi ? `${t.pbi} · ` : '') + (t.content || 'Công việc')

/* Khớp tên / mã NV AI trả về với người dùng thật — trùng nhiều người hoặc không thấy → để trống + cảnh báo (không đoán) */
const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().trim()
function resolveUser(who, pool) {
  if (!who) return { id: '' }
  const n = norm(who)
  let hit = pool.filter(u => u.code && norm(u.code) === n)
  if (!hit.length) hit = pool.filter(u => norm(u.name) === n)
  if (!hit.length) hit = pool.filter(u => norm(u.name).includes(n))
  return hit.length === 1 ? { id: hit[0].id } : { id: '', warn: hit.length ? `“${who}” trùng ${hit.length} người — chọn lại` : `Không tìm thấy “${who}” trong dự án` }
}
const userOpt = u => ({ value: u.id, label: u.name, description: u.code || '' })
const activeUsers = computed(() => db.users.filter(u => u.status !== 'disabled'))
const allUserOptions = computed(() => activeUsers.value.map(userOpt))

/* ── ① Sửa công việc đang mở ── */
const task = computed(() => db.tasks.find(t => t.id === props.action.taskId) ?? null)
const NUM = new Set(['mainScreens', 'subScreens'])
const OPTS = { complexity: COMPLEXITIES, businessLevel: BUSINESS_VALUES, solutionBy: SOLUTION_ROLES, platform: PLATFORMS, isOwnProject: ['Có', 'Không'] }
const upd = reactive(Object.entries(props.action.fields ?? {}).map(([key, val]) => {
  const t = db.tasks.find(x => x.id === props.action.taskId), cur = key === 'businessLevel' ? (t?.[key] || DEFAULT_BUSINESS) : t?.[key]
  const can = !!t && canEditField(t, key)
  return { key, label: FIELD_LABELS[key] ?? key, cur, val, num: NUM.has(key), options: OPTS[key] ?? [], can, on: can && String(cur ?? '') !== String(val ?? '') }
}))
function doUpdate() {
  const patch = Object.fromEntries(upd.filter(f => f.on && f.can).map(f => [f.key, f.num ? Math.max(0, Number(f.val) || 0) : f.val]))
  busy.value = true
  const r = updateTaskFields(task.value.id, patch)
  busy.value = false
  if (r !== true) return toast.error(r)
  toast.success('Đã cập nhật công việc')
  finish(`Đã cập nhật ${Object.keys(patch).length} trường: ${Object.keys(patch).map(k => FIELD_LABELS[k] ?? k).join(', ')}`)
}

/* ── ② Tạo công việc ── */
const ctxProjectId = computed(() => props.action.projectId || '')
const addProjects = computed(() => db.projects.filter(p => canAddTask(p.id)).map(p => ({ value: p.id, label: p.name, description: p.code || '' })))
const projectId = ref(props.action.projectId && canAddTask(props.action.projectId) ? props.action.projectId : (addProjects.value[0]?.value ?? ''))
const iterOptions = computed(() => (projectId.value ? iterationsOf(projectId.value) : []).map(i => ({ value: i.id, label: i.name })))
const iterationId = ref(props.action.iterationId && iterOptions.value.some(o => o.value === props.action.iterationId) ? props.action.iterationId : (iterOptions.value[0]?.value ?? ''))
watch(projectId, () => { if (!iterOptions.value.some(o => o.value === iterationId.value)) iterationId.value = iterOptions.value[0]?.value ?? '' })
const members = computed(() => { const p = projectById(projectId.value); return p ? activeUsers.value.filter(u => p.memberIds.includes(u.id)) : [] })
const memberOptions = computed(() => members.value.map(userOpt))
const rows = reactive((props.action.tasks ?? []).map(t => {
  const p = projectById(props.action.projectId), pool = p ? db.users.filter(u => p.memberIds.includes(u.id)) : db.users
  const pd = resolveUser(t.pd, pool), ba = resolveUser(t.ba, pool)
  return { on: true, content: t.content, pbi: t.pbi ?? '', pdId: pd.id, baId: ba.id, stage: t.stage || 'design', mainScreens: t.mainScreens ?? 0, subScreens: t.subScreens ?? 0,
    complexity: t.complexity || 'Trung bình', businessLevel: t.businessLevel || DEFAULT_BUSINESS, solutionBy: t.solutionBy || 'PD và BA', platform: t.platform || 'Web',
    expectedDate: t.expectedDate || '', warn: [pd.warn, ba.warn].filter(Boolean).join(' · ') }
}))
const canCreateTasks = computed(() => projectId.value && iterationId.value && canAddTask(projectId.value) && rows.some(r => r.on && r.content.trim()))
function doCreateTasks() {
  const list = rows.filter(r => r.on && r.content.trim()).map(r => ({
    projectId: projectId.value, iterationId: iterationId.value, pbi: r.pbi.trim(), content: r.content.trim(), pdId: r.pdId || '', baId: r.baId || '', stage: r.stage,
    designStatus: DEFAULT_STATUS, solutionBy: r.solutionBy, complexity: r.complexity, businessLevel: r.businessLevel, platform: r.platform,
    isOwnProject: r.pdId ? ownProjectFor(r.pdId, projectId.value) : 'Có', mainScreens: Number(r.mainScreens) || 0, subScreens: Number(r.subScreens) || 0,
    designLink: '', devmodeLink: '', concept: '', solutionBrief: '', expectedDate: r.expectedDate, completedDate: '', qualityRating: DEFAULT_RATING, ratingReason: '', manualScore: '',
  }))
  busy.value = true
  importTasks(list)
  busy.value = false
  toast.success(`Đã tạo ${list.length} công việc`)
  finish(`Đã tạo ${list.length} công việc vào ${projectById(projectId.value)?.name} › ${iterOptions.value.find(o => o.value === iterationId.value)?.label ?? ''}`,
    { path: `/du-an/${projectId.value}`, query: { vl: iterationId.value } })
}

/* ── ③ Tạo dự án ── */
const projWarns = [], projMembers = []
for (const m of props.action.members ?? []) { const r = resolveUser(m.who, db.users.filter(u => u.status !== 'disabled')); if (r.id) projMembers.push({ id: r.id, role: m.role }); else projWarns.push(r.warn) }
const proj = reactive({ name: props.action.name ?? '', code: props.action.code ?? '', divisionId: '', memberIds: [...new Set([currentUser.value?.id, ...projMembers.map(m => m.id)].filter(Boolean))], warns: projWarns, withIter: true })
async function doCreateProject() {
  busy.value = true
  const roles = Object.fromEntries(proj.memberIds.map(id => [id, projMembers.find(m => m.id === id)?.role ?? (id === currentUser.value?.id ? 'manager' : 'member')]))
  const id = saveProject({ code: proj.code.trim(), name: proj.name.trim(), description: '', divisionId: proj.divisionId, logo: '', sheetUrl: '', sheetAuto: true, memberIds: [...proj.memberIds], memberRoles: roles })
  let iterText = ''
  const it = props.action.iteration
  if (proj.withIter && it?.name && it.startDate && it.endDate) {
    await projectSaved(id)   // vòng lặp cần dự án đã có trên máy chủ
    saveIteration({ projectId: id, name: it.name, startDate: it.startDate, endDate: it.endDate, sheetUrl: '', sheetAuto: true })
    iterText = ` · vòng lặp “${it.name}”`
  }
  busy.value = false
  toast.success('Đã tạo dự án')
  finish(`Đã tạo dự án “${proj.name.trim()}” (${proj.memberIds.length} thành viên)${iterText}`, { path: `/du-an/${id}` })
}

/* ── ⑤ Thêm thành viên vào dự án đang mở (vai trò trong dự án; QA luôn chỉ xem) ── */
const ROLE_OPTS = [{ value: 'manager', label: 'Quản trị dự án' }, { value: 'member', label: 'Thành viên' }, { value: 'viewer', label: 'Hạn chế (chỉ xem)' }]
const mems = reactive((props.action.members ?? []).map(m => { const r = resolveUser(m.who, db.users.filter(u => u.status !== 'disabled')); return { on: !!r.id, userId: r.id, role: m.role || 'member', warn: r.warn ? r.warn.replace(' trong dự án', '') : '' } }))
const isMember = id => !!id && !!projectById(ctxProjectId.value)?.memberIds?.includes(id)
function doAddMembers() {
  const p = projectById(ctxProjectId.value); if (!p) return
  const pick = mems.filter(m => m.on && m.userId)
  const memberIds = [...new Set([...p.memberIds, ...pick.map(m => m.userId)])]
  const memberRoles = { ...(p.memberRoles ?? {}) }
  for (const m of pick) memberRoles[m.userId] = db.users.find(u => u.id === m.userId)?.role === 'QA' ? 'viewer' : m.role
  busy.value = true
  saveProject({ id: p.id, memberIds, memberRoles })
  busy.value = false
  toast.success(`Đã thêm ${pick.length} thành viên`)
  finish(`Đã thêm / cập nhật ${pick.length} thành viên: ${pick.map(m => db.users.find(u => u.id === m.userId)?.name).join(', ')}`, { path: `/du-an/${p.id}` })
}

/* ── ④ Tạo vòng lặp ── */
const iter = reactive({ name: props.action.name ?? '', startDate: props.action.startDate ?? '', endDate: props.action.endDate ?? '' })
function doCreateIteration() {
  busy.value = true
  const id = saveIteration({ projectId: ctxProjectId.value, name: iter.name.trim(), startDate: iter.startDate, endDate: iter.endDate, sheetUrl: '', sheetAuto: true })
  busy.value = false
  toast.success('Đã tạo vòng lặp')
  finish(`Đã tạo vòng lặp “${iter.name.trim()}”`, { path: `/du-an/${ctxProjectId.value}`, query: { vl: id } })
}
</script>

<style scoped>
.aact { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; padding: 10px; border-radius: var(--radius-default); border: 1px solid var(--stroke-neutral-light); background: var(--bg-white); }
.aact__head { display: flex; align-items: center; gap: 6px; font-size: var(--text-body); color: var(--text-primary); }
.aact__head .ti { color: var(--icon-brand); flex-shrink: 0; }
.aact__head strong { font-weight: var(--fw-semibold); }
.aact__reason { margin: 0; font-size: var(--text-body); color: var(--text-secondary); }
.aact__warn { font-size: var(--text-body); color: var(--text-warning); }
p.aact__warn { margin: 0; }
.aact__rows { display: flex; flex-direction: column; gap: 6px; max-height: 420px; overflow-y: auto; }
.aact__field { display: grid; grid-template-columns: auto minmax(0, 1fr) 150px; align-items: center; gap: 8px; }
.aact__field--off { opacity: 0.55; }
.aact__flabel { display: flex; flex-direction: column; font-size: var(--text-body); color: var(--text-primary); min-width: 0; }
.aact__flabel small { font-size: var(--text-body); color: var(--text-secondary); }
.aact__ctl { min-width: 0; }
.aact__where { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }   /* minmax(0) → cột co theo khung, ô ngày / combobox không tràn */
.aact__where > *, .aact__task-grid > * { min-width: 0; }
.aact :deep(.ibox) { min-width: 0; }
.aact :deep(.ibox__native) { min-width: 0; width: 100%; }
.aact__date { display: flex; flex-direction: column; gap: 2px; min-width: 0; font-size: var(--text-body); color: var(--text-secondary); }
.aact__task { display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: var(--radius-default); background: var(--bg-neutral-light); }
.aact__task--off { opacity: 0.5; }
.aact__task-top { display: flex; align-items: center; gap: 6px; }
.aact__grow { flex: 1; min-width: 0; }
.aact__task-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.aact__form { display: flex; flex-direction: column; gap: 6px; }
.aact__foot { display: flex; gap: 6px; flex-wrap: wrap; }
.aact__result { display: flex; align-items: center; gap: 6px; margin: 0; font-size: var(--text-body); color: var(--text-success); }
.aact__result--cancel { color: var(--text-secondary); }
.aact--done .aact__rows { max-height: 160px; }
</style>
