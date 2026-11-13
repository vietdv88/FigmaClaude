import { avatarOf } from './avatar.js'
import { userUsage, usageMessage } from './userUsage.js'
import { reactive, computed, watch } from 'vue'
import { backend, api } from './api.js'
import { uuid } from './uuid.js'
import { MAJOR_FIELDS, MARK_ONLY_FIELDS } from './historyMerge.js'
import {
  DEFAULT_CONFIG, DEFAULT_DIVISIONS, DEFAULT_STATUS, divisionPathOf, divisionTree, divisionDescendantIds, DEFAULT_RATING, FIELD_LABELS, TASK_FIELDS,
  computeScore, computeFinalScore, sameValue, monthLabelOf, workingDaysOf, buildClosing, personParams, closingParams, devmodeLinkOf, autoDevmodeLink,
  ROLES, PROJECT_ROLES, projectRoleOf, defaultProjectRole, managerIdsOf, primaryProjectIdsOf, pdProjectsOf,
  deptAdminOf, DEPT_FIELDS, DEPT_ADMINS, canClaimSlot,
  stageOf, hasAnalysis, hasDesign, phaseOf, BA_PHASE_FIELDS, BA_SELF_FIELDS, BA_APPROVED, baScoreOf, baItemsOf, buildBaClosing,
  leadsOf, teamOf, leadItemsOf, isPdRole, fieldScopeOf, deptOfRole,
} from './scoring.js'

/* ═══════════════════════════════════════════════════════════════════════════
   Kho dữ liệu dùng chung (reactive).
   - Có máy chủ: dữ liệu tải từ /api/bootstrap; mỗi thao tác cập nhật ngay trên
     giao diện rồi gửi lên máy chủ (lỗi → báo + tải lại để khớp dữ liệu thật).
   - Chế độ demo (không có máy chủ): lưu localStorage, có ô "Đăng nhập với".
   ═══════════════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'chamdiem-db-v6'   // v6: dữ liệu demo rút gọn (1 PO · 5 PD + 1 PD Lead · 3 BA)

export { ROLES }   // định nghĩa ở scoring.js (dùng chung với máy chủ / trợ lý AVA)
export const roleLabel = r => ROLES.find(x => x.value === r)?.label ?? r
/** Bộ phận / vai trò + quyền Quản trị bộ phận (VD “BA · Quản trị BA”) */
export const roleLabelOf = u => [roleLabel(u?.role), deptAdminOf(u) && `Quản trị ${deptAdminOf(u)}`].filter(Boolean).join(' · ')
export { DEPT_ADMINS, deptAdminOf }

const uid = p => p + uuid()

/** Ảnh chụp bảng điểm tháng của 1 PD tại thời điểm chốt */
/* ── Dữ liệu khởi tạo (seed-real.json) ── */
let seedReal = null   // chỉ chế độ demo mới cần → tải riêng (không nằm trong bundle chính)
function seed() {
  const d = JSON.parse(JSON.stringify(seedReal))
  return {
    users: d.users, projects: d.projects, iterations: d.iterations, tasks: d.tasks,
    config: structuredClone(DEFAULT_CONFIG),
    history: [], monthSettings: d.monthSettings, closings: [], baClosings: [], divisions: structuredClone(DEFAULT_DIVISIONS),
    currentUserId: 'u_admin',
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      data.config   = { ...structuredClone(DEFAULT_CONFIG), ...data.config }
      data.history  ??= []
      data.closings ??= []
      data.baClosings ??= []
      data.monthSettings ??= {}
      data.divisions ??= structuredClone(DEFAULT_DIVISIONS)
      // Bản demo cũ có “Nhóm dự án” (đã bỏ) → chuyển thành khối con trong cây, dự án thuộc nhóm → thuộc khối con
      if (data.projectGroups?.length) {
        data.projectGroups.forEach(g => { if (!data.divisions.some(d => d.id === g.id)) data.divisions.push({ id: g.id, name: g.name, parentId: g.divisionId }) })
        data.projects.forEach(p => { if (p.groupId) p.divisionId = p.groupId; delete p.groupId })
      }
      delete data.projectGroups
      return data
    }
  } catch { /* dữ liệu hỏng → nạp lại dữ liệu mẫu */ }
  return seed()
}

const EMPTY = () => ({ hotFrom: '', taskMonths: [], performerIds: [], hasBaWork: false, projectTaskCount: {}, loadGen: 0, users: [], projects: [], iterations: [], tasks: [], history: [], closings: [], baClosings: [], monthSettings: {}, divisions: [], config: structuredClone(DEFAULT_CONFIG), currentUserId: '', pdSummaries: {}, pdProjects: {}, seq: '' })

export const db = reactive(EMPTY())

/** Chế độ demo: nạp từ localStorage và tự lưu mỗi khi đổi */
let demoWatch = null
export async function startDemo() {
  seedReal = (await import('./seed-real.json')).default
  Object.assign(db, load())
  // Dữ liệu mẫu chưa có trạng thái tài khoản: Quản trị = Hoạt động, có Gmail = Đã mời, chưa có Gmail = Chưa mời
  db.users.forEach(u => { u.status ??= u.role === 'admin' ? 'active' : (u.email ? 'invited' : 'none') })
  // Người dùng QA mẫu (chỉ xem) — thêm cả vào dữ liệu demo đã lưu trước đây để thử vai trò QA
  if (!db.users.some(u => u.role === 'QA')) db.users.push({ id: 'u_qa_demo', name: 'QA Demo', code: 'B01-0099', email: 'qa.demo@congty.vn', companyEmail: 'qa.demo@congty.vn', role: 'QA', status: 'active', target: 0 })
  const persist = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)) } catch { /* bỏ qua */ } }
  persist()
  demoWatch ??= watch(db, persist, { deep: true })
}

/** Có máy chủ: thay toàn bộ dữ liệu bằng bản mới nhất người dùng được xem */
export async function loadFromServer(prefetched) {
  const d = await (prefetched ?? api.get('/api/bootstrap'))
  loaded.clear()
  // Tháng từ hotFrom trở đi đã có đủ trong bootstrap (dữ liệu nóng) → không cần tải lại
  for (const ym of d.taskMonths ?? []) if (d.hotFrom && ym >= d.hotFrom.slice(0, 7)) loaded.add('month:' + ym)
  Object.assign(db, { ...EMPTY(), ...d, loadGen: db.loadGen + 1, config: { ...structuredClone(DEFAULT_CONFIG), ...(d.config ?? {}) } })
}

/* ═══ Tải công việc theo phần (dữ liệu lớn: không tải hết 1 lần) ═══
   Bootstrap chỉ có “dữ liệu nóng” (việc đang làm + việc của tháng này / tháng trước). Mở vòng lặp, xem tháng cũ, mở 1 việc,
   xem lịch sử… → tải đúng phần đó 1 lần rồi giữ trong bộ nhớ (realtime vẫn cập nhật). Tải lại toàn bộ (loadGen đổi) → tải lại khi cần. */
const loaded = new Set()   // 'iter:<id>' | 'project:<id>' | 'month:<ym>' | 'task:<id>' | 'hist:<id>'
export const tasksLoading = reactive({ n: 0 })
function mergeTasks(list = []) {
  const have = new Set(db.tasks.map(t => t.id))
  const add = list.filter(t => !have.has(t.id))   // việc đã có giữ nguyên (có thể đang sửa dở / realtime đã cập nhật)
  if (add.length) db.tasks.push(...add)
}
async function ensure(key, url, apply) {
  if (!backend.enabled || !key || loaded.has(key)) return
  loaded.add(key); tasksLoading.n++
  try { apply(await api.get(url)) } catch { loaded.delete(key) } finally { tasksLoading.n-- }
}
const q = encodeURIComponent
export const ensureIterationTasks = id => ensure(id && 'iter:' + id, `/api/tasks?iterationId=${q(id)}`, d => mergeTasks(d.tasks))
export const ensureProjectTasks   = id => ensure(id && 'project:' + id, `/api/tasks?projectId=${q(id)}`, d => mergeTasks(d.tasks))
export const ensureMonthTasks     = ym => ensure(/^\d{4}-\d{2}$/.test(ym ?? '') && 'month:' + ym, `/api/tasks?month=${q(ym)}`, d => mergeTasks(d.tasks))
export const ensureTask = id => (id && !db.tasks.some(t => t.id === id) ? ensure('task:' + id, `/api/tasks?ids=${q(id)}`, d => mergeTasks(d.tasks)) : Promise.resolve())
export const ensureHistory = taskId => ensure(taskId && 'hist:' + taskId, `/api/tasks/${q(taskId)}/history`, d => {
  const have = new Set(db.history.map(h => h.id))
  db.history.push(...(d.history ?? []).filter(h => !have.has(h.id)))
})
/* ── Bảng tra công việc: theo id · theo (tháng, PD) · theo (tháng, BA) — dựng lại 1 lần mỗi khi công việc đổi.
      Tránh mỗi dòng báo cáo / chốt điểm lại quét toàn bộ db.tasks (chậm khi hàng chục nghìn việc) ── */
const taskIndex = computed(() => {
  const byId = new Map(), pdMonth = new Map(), baMonth = new Map()
  const push = (m, k, t) => { const l = m.get(k); if (l) l.push(t); else m.set(k, [t]) }
  for (const t of db.tasks) {
    byId.set(t.id, t)
    if (t.pdId && t.completedDate) push(pdMonth, t.completedDate.slice(0, 7), t)
    if (t.baId && t.baCompletedDate) push(baMonth, String(t.baCompletedDate).slice(0, 7), t)
  }
  return { byId, pdMonth, baMonth }
})
export const taskById = id => taskIndex.value.byId.get(id)
/** Việc có Ngày hoàn thành (PD) trong tháng ym */
export const pdMonthTasks = ym => taskIndex.value.pdMonth.get(ym) ?? []
/** Việc có Ngày hoàn thành (BA) trong tháng ym */
export const baMonthTasks = ym => taskIndex.value.baMonth.get(ym) ?? []

/** Tháng có công việc (cả phần chưa tải) — để hiện tab / danh sách tháng */
export const knownTaskMonths = () => {
  const set = new Set(db.taskMonths ?? [])
  db.tasks.forEach(t => { if (t.completedDate) set.add(t.completedDate.slice(0, 7)); if (t.baCompletedDate) set.add(t.baCompletedDate.slice(0, 7)) })
  return set
}
/** Người thực hiện PD (cả phần chưa tải) */
export const performerSet = () => new Set([...(db.performerIds ?? []), ...db.tasks.map(t => t.pdId)])

/** Áp phần thay đổi máy chủ gửi về (realtime) — không tải lại toàn bộ.
    isOwn: thay đổi do chính tab này gây ra → giữ bản đang có (đã cập nhật sẵn), chỉ nhận tổng điểm / bản chốt từ máy chủ. */
let reloadTimer = null
export function applyServerPatch(p, isOwn) {
  if (p.reload) {
    // Giãn thời điểm tải lại của các máy (tránh mọi người cùng tải 1 lúc)
    clearTimeout(reloadTimer)
    reloadTimer = setTimeout(() => loadFromServer().catch(() => {}), Math.random() * 2000)
    return
  }
  const byId = (list, x) => { const i = list.findIndex(o => o.id === x.id); if (i >= 0) list[i] = x; else list.push(x) }
  const sameClosing = (a, b) => a.month === b.month && a.pdId === b.pdId
  for (const [kind, list] of Object.entries(p.put ?? {})) {
    if (isOwn && !['closings', 'baClosings'].includes(kind)) continue
    for (const x of list) {
      if (kind === 'closings') { const i = db.closings.findIndex(c => sameClosing(c, x)); if (i >= 0) db.closings[i] = x; else db.closings.push(x) }
      else if (db[kind]) byId(db[kind], x)
    }
  }
  for (const [kind, list] of Object.entries(p.del ?? {})) {
    if (isOwn && !['closings', 'baClosings'].includes(kind)) continue
    if (kind === 'closings') db.closings = db.closings.filter(c => !list.some(x => sameClosing(c, x)))
    else if (db[kind]) { const ids = new Set(list); db[kind] = db[kind].filter(o => !ids.has(o.id)) }
  }
  if (p.months) Object.assign(db.monthSettings, p.months)
  for (const [ym, m] of Object.entries(p.summaries ?? {})) db.pdSummaries[ym] = { ...(db.pdSummaries[ym] ?? {}), ...m }
}

/** Gửi thay đổi lên máy chủ (chế độ demo: bỏ qua). Lỗi → báo + tải lại cho khớp dữ liệu thật */
function sync(fn) {
  if (!backend.enabled) return Promise.resolve(null)
  return fn().catch(async e => {
    backend.error = e.message || 'Không lưu được lên máy chủ'
    await loadFromServer().catch(() => {})
    throw e
  })
}
const silent = p => p.catch(() => {})

export function resetDemoData() {
  Object.assign(db, seed())
}

/* ── Truy vấn ── */
export const userById      = id => db.users.find(u => u.id === id)
export const userName      = id => userById(id)?.name ?? ''
export const projectById   = id => db.projects.find(p => p.id === id)
export const iterationById = id => db.iterations.find(i => i.id === id)

export const currentUser = computed(() => userById(db.currentUserId) ?? (backend.enabled ? null : db.users[0]))

export function setCurrentUser(id) { db.currentUserId = id }

/** Dự án người dùng hiện tại được vào */
export const myProjects = computed(() => {
  const me = currentUser.value
  if (!me) return []
  return seesAll() ? db.projects : db.projects.filter(p => p.memberIds.includes(me.id))
})

/** Vòng lặp của dự án — mới nhất trước: ngày bắt đầu giảm dần → ngày kết thúc → tên (R98 trước R97) */
/** Vòng lặp của dự án: đồng bộ từ Google Sheet cả dự án → đúng thứ tự trang tính (sheetIndex); còn lại mới nhất trước */
const hasSheetIndex = i => Number.isInteger(i.sheetIndex)
export const iterationsOf = projectId =>
  db.iterations.filter(i => i.projectId === projectId)
    .sort((a, b) => (hasSheetIndex(a) && hasSheetIndex(b) ? a.sheetIndex - b.sheetIndex : hasSheetIndex(b) - hasSheetIndex(a))
      || (b.startDate || '').localeCompare(a.startDate || '') || (b.endDate || '').localeCompare(a.endDate || '')
      || (b.name || '').localeCompare(a.name || '', 'vi', { numeric: true }))

/** Công việc của vòng lặp — mới thêm lên đầu (createdAt giảm dần); việc cũ chưa có ngày tạo giữ thứ tự gốc ở sau */
export const tasksOf = iterationId => db.tasks.filter(t => t.iterationId === iterationId)
  .map((t, i) => [t, i])
  .sort(([a, i], [b, j]) => (b.createdAt || '').localeCompare(a.createdAt || '') || i - j)
  .map(([t]) => t)

/** Người dùng còn quyền truy cập — người đã bị cắt quyền (Đã khóa) ẩn ở mọi danh sách chọn / thành viên / lọc */
export const isActiveUser = u => !!u && u.status !== 'disabled'
/** Người thực hiện ở cột PD / BA: MỌI thành viên dự án (PO, Lead… kiêm PD / BA được) — người đúng bộ phận xếp trước, người khác ghi kèm bộ phận */
const ROLE_SHORT = { admin: 'Quản trị hệ thống', HRBP: 'HRBP', QA: 'QA', PO: 'PO', PDL: 'PD Lead', BA: 'BA', PD: 'PD' }
const sameDept = (role, prefer) => role === prefer || (prefer === 'PD' && role === 'PDL')   // PD Lead xếp cùng nhóm PD
export const performerOptions = (projectId, prefer = 'PD') => membersOf(projectId).filter(u => !['QA', 'HRBP'].includes(u.role))   // QA / HRBP chỉ xem — không giao việc
  .sort((a, b) => (sameDept(a.role, prefer) ? 0 : 1) - (sameDept(b.role, prefer) ? 0 : 1) || a.name.localeCompare(b.name, 'vi'))
  .map(u => ({
    value: u.id, label: u.role === prefer || !ROLE_SHORT[u.role] ? u.name : `${u.name} (${ROLE_SHORT[u.role]})`,
    avatar: avatarOf(u), avatarName: u.name, description: u.companyEmail || u.email || u.code || '', search: u.code || '',   // avatar + họ tên + email trong ô chọn
  }))
export const baPerformerOptions = projectId => performerOptions(projectId, 'BA')
/** Có công việc được giao ở cột PD (người thực hiện) — dùng để đưa người bộ phận khác vào chốt điểm / tổng quan */
export const isPerformer = id => (db.performerIds ?? []).includes(id) || db.tasks.some(t => t.pdId === id)   // cả việc chưa tải
export const membersOf = (projectId, role) => {
  const p = projectById(projectId)
  if (!p) return []
  return db.users.filter(u => p.memberIds.includes(u.id) && isActiveUser(u) && (!role || u.role === role || (role === 'PD' && u.role === 'PDL')))   // PD gồm cả PD Lead
}

/* ═══ PHÂN QUYỀN ═══════════════════════════════════════════════════════════
   - Quản trị: toàn quyền, quản lý người dùng / dự án / quy tắc; chốt / mở chốt điểm mọi PD.
   - PO: tạo dự án (người tạo là Quản trị của dự án đó).
   - Vai trò trong từng dự án (project.memberRoles):
       Quản trị   → xem & sửa mọi công việc, tạo vòng lặp, giao việc, sửa thông tin + thành viên dự án;
       Thành viên → xem mọi công việc, chỉ cập nhật việc của mình (PD: nhóm thiết kế · BA: nghiệp vụ + đánh giá);
       Hạn chế    → chỉ xem.
   - Quản lý trực tiếp (user.managerIds — 1 người có thể có nhiều quản lý): xem công việc của người mình quản lý
     ở mọi dự án; chốt / mở chốt điểm + nhập thông số tháng cho PD mình quản lý.
   - Phạm vi xem: công việc, điểm, thành viên trong các dự án mình tham gia (+ người mình quản lý trực tiếp).
   - Công việc của PD đã chốt điểm tháng: không ai sửa được (mở chốt trước).
   ═══════════════════════════════════════════════════════════════════════════ */

const BA_FIELDS = ['content', 'baId', 'solutionBy', 'concept', 'solutionBrief', 'expectedDate', 'complexity', 'businessLevel', 'qualityRating', 'ratingReason']
const COMPLEXITY_FIELDS = ['complexity', 'businessLevel']   // PD thực hiện + người thêm việc đều sửa được
/** THÔNG TIN công việc mà NGƯỜI THÊM việc sửa thoải mái trên việc do mình thêm (tên, PBI, loại việc, PD / BA, link, màn hình, nền tảng, giải pháp, độ phức tạp, ngày kỳ vọng…).
    KHÔNG gồm kết quả thực hiện & chấm điểm: ngày hoàn thành, trạng thái thiết kế, mức hài lòng, điểm nhập tay, vai trò Lead, phần Phân tích của BA — vẫn theo quyền riêng. Tháng đã chốt điểm thì việc vẫn bị khóa. */
const CREATOR_FIELDS = ['pbi', 'content', 'stage', 'pdId', 'baId', 'isOwnProject', 'designLink', 'devmodeLink', 'moreLinks', 'mainScreens', 'subScreens', 'platform',
  'solutionBy', 'concept', 'solutionBrief', 'complexity', 'businessLevel', 'expectedDate']
const PD_FIELDS = ['designLink', 'designStatus', 'devmodeLink', 'moreLinks', 'completedDate', 'mainScreens', 'subScreens', 'platform', 'solutionBrief', 'complexity', 'businessLevel']

export const isAdmin = () => currentUser.value?.role === 'admin'
/** Quản trị bộ phận của người đang đăng nhập: 'PD' | 'BA' | '' */
export const myDeptAdmin = () => deptAdminOf(currentUser.value)
/** Xem mọi dự án / công việc: Quản trị hệ thống + Quản trị PD / BA · QA chỉ xem các dự án được gán (Dự án tham gia) */
/** HRBP: xem toàn bộ dự án, công việc, điểm — chỉ xem (không sửa / chốt) */
export const isHrbpMe = () => currentUser.value?.role === 'HRBP'
export const seesAll = () => currentUser.value?.role === 'admin' || !!myDeptAdmin() || isHrbpMe()   // CHỈ quyền xem (+ HRBP)
/** Xem điểm / chốt điểm toàn bộ PD · toàn bộ BA */
export const seesAllPd = () => currentUser.value?.role === 'admin' || myDeptAdmin() === 'PD'
export const seesAllBa = () => currentUser.value?.role === 'admin' || myDeptAdmin() === 'BA'
/** Xem điểm của mọi PD / BA (CHỈ xem — chốt / mở chốt vẫn dùng seesAllPd / seesAllBa): + HRBP */
export const viewsAllPd = () => seesAllPd() || isHrbpMe()
export const viewsAllBa = () => seesAllBa() || isHrbpMe()
/** Quản trị THẬT của dự án (vai trò trong dự án) — Quản trị bộ phận chỉ sửa được trường bộ phận mình */
export const realManager = projectId => { const me = currentUser.value; return !!me && (me.role === 'admin' || (!['QA', 'PDL', 'HRBP'].includes(me.role) && projectRoleOf(projectById(projectId), me) === 'manager')) }
/** Nút Điểm PD | Điểm BA (Tổng quan, Tổng hợp điểm): vai trò PD / BA chỉ thấy phần mình (+ bộ phận mình quản trị) · vai trò khác thấy cả hai */
export const reportRoleTabs = () => {
  const me = currentUser.value, own = isPdRole(me?.role) ? ['PD'] : me?.role === 'BA' ? ['BA'] : null   // PD Lead: chỉ phần PD
  return own ? [...new Set([...own, myDeptAdmin()].filter(Boolean))].sort((a, b) => (a === 'PD' ? -1 : 1)) : ['PD', 'BA']
}

export function isMember(projectId) {
  const me = currentUser.value
  return !!me && (seesAll() || !!projectById(projectId)?.memberIds.includes(me.id))
}

/** me là quản lý trực tiếp của u */
export const isManagerOf = (me, u) => !!me && !!u && managerIdsOf(u).includes(me.id)
/** Là Lead của PD (quản lý trực tiếp thuộc bộ phận PD) — được tính điểm dẫn dắt + tick “Lead chốt giải pháp” */
export const isLeadOf = (me, pdId) => { const pd = userById(pdId); return !!me && !!pd && leadsOf(pd, db.users).some(l => l.id === me.id) }
/** Người này có PD để dẫn dắt không */
export const isPdLead = id => !!id && teamOf(id, db.users).length > 0
/** Việc tính điểm dẫn dắt của Lead trong tháng: đã chốt → bản chốt · chưa chốt → tính từ việc của PD mình quản lý */
export function leadItemsFor(ym, leadId, all = false) {
  const c = db.closings.find(x => x.month === ym && x.pdId === leadId)
  if (c) return c.leadItems ?? []
  return leadItemsOf(ym, leadId, { tasks: pdMonthTasks(ym), users: db.users, closings: db.closings, config: db.config }, all)
}

/** Người tôi quản lý: Quản trị dự án → PD/BA trong dự án · Quản lý trực tiếp → người được gán cho mình */
/** Đang là quản lý trực tiếp của ít nhất 1 người → được vào trang Người dùng (chỉ thấy + sửa giới hạn người mình quản lý) */
export const isDirectManager = () => { const me = currentUser.value; return !!me && db.users.some(u => isManagerOf(me, u)) }
/** Sửa người dùng: Quản trị (toàn bộ) · quản lý trực tiếp (chỉ Điểm kỳ vọng, Dự án tham gia, Quản lý trực tiếp, Đang quản lý) */
/** Quản trị PD / BA: quản lý đầy đủ người dùng thuộc bộ phận mình (Quản trị hệ thống: mọi người) */
export const canManageUser = u => isAdmin() || (!!myDeptAdmin() && (!u || deptOfRole(u.role) === myDeptAdmin()))   // Quản trị PD: cả PD Lead
export const canEditUserLimited = u => !!u && !isAdmin() && isManagerOf(currentUser.value, u)
export const managedIds = computed(() => {
  const me = currentUser.value
  if (!me) return new Set()
  if (me.role === 'admin') return new Set(db.users.map(u => u.id))
  const ids = new Set()
  {
    db.projects.filter(p => projectRoleOf(p, me) === 'manager').forEach(p => p.memberIds.forEach(id => {
      if (isPdRole(userById(id)?.role) || userById(id)?.role === 'BA') ids.add(id)
    }))
  }
  db.users.filter(u => isManagerOf(me, u)).forEach(u => ids.add(u.id))
  return ids
})
/** Người mình quản lý trực tiếp */
export const myTeam = computed(() => db.users.filter(u => isActiveUser(u) && isManagerOf(currentUser.value, u)))

/** Xem được công việc: trong dự án mình tham gia, việc của mình, hoặc của người mình quản lý trực tiếp */
export function canSeeTask(t) {
  const me = currentUser.value
  if (!me) return false
  if (seesAll() || isMember(t.projectId) || t.pdId === me.id || t.baId === me.id) return true
  return isManagerOf(me, userById(t.pdId)) || isManagerOf(me, userById(t.baId))
}

/** Xem được điểm của PD: chính mình, cùng dự án, quản lý trực tiếp, Quản trị */
export function canSeeReportOf(pdId) {
  const me = currentUser.value
  if (!me) return false
  if (viewsAllPd() || me.id === pdId || isManagerOf(me, userById(pdId))) return true
  return db.projects.some(p => p.memberIds.includes(me.id) && p.memberIds.includes(pdId))
}

/** Tạo dự án mới: Quản trị và PO */
export function canCreateProject() {
  return ['admin', 'PO', 'PDL'].includes(currentUser.value?.role) || !!myDeptAdmin()
}

/** Tạo vòng lặp, tạo/xóa công việc, giao việc, sửa thông tin & thành viên dự án */
export function canManageProject(projectId) {
  const me = currentUser.value
  return !!me && (me.role === 'admin' || myProjectRole(projectId) === 'manager')
}
/** Vai trò của người dùng hiện tại trong dự án (Quản trị hệ thống = 'manager') */
export function myProjectRole(projectId) {
  const me = currentUser.value
  if (!me) return null
  return me.role === 'admin' || myDeptAdmin() ? 'manager' : ['QA', 'HRBP'].includes(me.role) ? 'viewer' : projectRoleOf(projectById(projectId), me)   // QA: luôn chỉ xem · Quản trị PD / BA: như Quản trị mọi dự án
}
export { PROJECT_ROLES, projectRoleOf, defaultProjectRole }

/** Quản trị dự án: mọi trường · Thành viên: chỉ việc của mình, theo nhóm trường của bộ phận · Hạn chế: không sửa */
/** Duyệt / chấm điểm giai đoạn Phân tích: Quản trị dự án (PO) hoặc quản lý trực tiếp của BA */
export const canApproveBa = task => !!task && (realManager(task.projectId) || myDeptAdmin() === 'BA' || isManagerOf(currentUser.value, userById(task.baId)))

/** TẠM THỜI (02/11/2026): PD Lead tự đánh giá mức hài lòng việc của chính mình — tắt: đặt false (cùng cờ ở server/rules.js) */
export const PDL_SELF_RATING = true
/** PD Lead đánh giá mức hài lòng: Lead trực tiếp của PD thực hiện, vai trò PD Lead là Quản trị dự án · việc của chính mình: theo PDL_SELF_RATING */
export function canRateAsLead(task) {
  const me = currentUser.value
  if (!me || !task?.pdId) return false
  if (task.pdId === me.id) return PDL_SELF_RATING && me.role === 'PDL'
  return isLeadOf(me, task.pdId) || (me.role === 'PDL' && myProjectRole(task.projectId) === 'manager')
}
export function canEditField(task, field) {
  const me = currentUser.value
  if (!me) return false
  // Giai đoạn Phân tích — chốt điểm PD không khóa phần của BA
  if (BA_PHASE_FIELDS.includes(field)) {
    if (!hasAnalysis(task) || isBaLocked(task)) return false   // tháng của BA đã chốt → khóa phần phân tích
    if (canApproveBa(task)) return true
    // BA của việc tự điền BA Point, deadline, ngày hoàn thành, chất lượng (chưa duyệt); miễn trừ + duyệt: PO / quản lý trực tiếp
    return BA_SELF_FIELDS.includes(field) && task.baId === me.id && ['member', 'manager'].includes(myProjectRole(task.projectId)) && task.baStatus !== BA_APPROVED
  }
  // Đổi BA của việc có phân tích: đã có kết quả → chỉ PO / quản lý trực tiếp; tháng đã chốt → không đổi
  if (field === 'baId' && hasAnalysis(task)) {
    if (isBaLocked(task)) return false
    if (task.baCompletedDate || task.baStatus === BA_APPROVED) return canApproveBa(task)
  }
  if (field === 'stage') return myProjectRole(task.projectId) === 'manager' || canApproveBa(task)
    || (myProjectRole(task.projectId) === 'member' && [task.pdId, task.baId].includes(me.id))
    || (task.createdBy === me.id && myProjectRole(task.projectId) === 'member')   // người thêm việc đổi loại việc của việc mình thêm
  if (isTaskLocked(task)) return false
  if (['leadRole', 'leadSolution'].includes(field) && isLeadOf(me, task.pdId)) return true   // Lead của PD tự chọn vai trò của mình trong việc
  // Mức hài lòng: PD Lead đánh giá việc của PD mình quản lý (hoặc ở dự án mình là Quản trị) — không tự đánh việc của chính mình
  if (['qualityRating', 'ratingReason'].includes(field) && canRateAsLead(task)) return true
  const role = myProjectRole(task.projectId)
  // NGƯỜI THÊM việc sửa thoải mái thông tin của việc mình thêm (CREATOR_FIELDS) — cùng luật máy chủ (server/rules.js)
  if (task.createdBy === me.id && ['member', 'manager'].includes(role) && CREATOR_FIELDS.includes(field)) return true
  if (role === 'manager') return realManager(task.projectId) || (DEPT_FIELDS[fieldScopeOf(me)] ?? []).includes(field)   // Quản trị bộ phận: chỉ trường của bộ phận mình
  if (role !== 'member') return false
  // Việc 2 giai đoạn chưa được duyệt: PD chưa được làm phần thiết kế
  if (stageOf(task) === 'both' && phaseOf(task) === 'analysis' && PD_FIELDS.includes(field) && !BA_FIELDS.includes(field)) return false
  // Thành viên: người thực hiện (cột PD) sửa nhóm trường PD, BA của việc sửa nhóm trường BA — không phụ thuộc bộ phận
  if (task.pdId === me.id && PD_FIELDS.includes(field)) return true
  if (task.baId === me.id && BA_FIELDS.includes(field)) return true
  // (Người thêm việc sửa thông tin việc mình thêm: đã xử lý ở trên — CREATOR_FIELDS)
  return false
}

/** Thêm công việc vào dự án: Quản trị dự án + Thành viên (Hạn chế chỉ xem) */
export function canAddTask(projectId) {
  return ['manager', 'member'].includes(myProjectRole(projectId))
}

/** Việc do chính mình (Thành viên) thêm — được chọn hàng loạt để xóa, gán PD / BA, chuyển vòng lặp */
export const isOwnTask = task => !!task?.createdBy && task.createdBy === currentUser.value?.id && myProjectRole(task.projectId) === 'member'
/** Chọn được việc để thao tác hàng loạt: Quản trị dự án mọi việc · Thành viên chỉ việc mình thêm */
export const canBulkTask = task => canManageProject(task.projectId) || isOwnTask(task)
/** Xóa công việc: Quản trị dự án + PO của dự án (kể cả vai trò Thành viên) xóa mọi việc · Thành viên xóa việc do chính mình thêm
    · việc thuộc tháng đã chốt không xóa được */
export const canDeleteTask = task => !isTaskLocked(task) && (canManageProject(task.projectId)
  || (['PO', 'PDL'].includes(currentUser.value?.role) && myProjectRole(task.projectId) === 'member')
  || (myProjectRole(task.projectId) === 'member' && !!task.createdBy && task.createdBy === currentUser.value?.id))

/* ═══ CHỐT ĐIỂM (theo từng PD, từng tháng) ═════════════════════════════════
   Chốt = chụp lại bảng điểm tháng của PD (theo hệ số + thông số lúc chốt) và khóa các công việc
   của PD đó có Ngày hoàn thành trong tháng. Quản lý trực tiếp chốt cho PD mình quản lý; Quản trị chốt mọi PD.
   (Bản chốt kiểu cũ không có pdId = áp cho cả tháng — vẫn được tôn trọng.)
   ═══════════════════════════════════════════════════════════════════════════ */
export const closingFor = (ym, pdId) => db.closings.find(c => c.month === ym && (!c.pdId || c.pdId === pdId))
export const isPdClosed = (ym, pdId) => !!ym && !!pdId && !!closingFor(ym, pdId)
export const isTaskLocked = task => !!task?.completedDate && !!task.pdId && isPdClosed(task.completedDate.slice(0, 7), task.pdId)

/* ═══ CHỐT ĐIỂM BA (theo người, theo tháng — tách riêng bản chốt PD; chỉ khóa phần phân tích) ═══ */
export const baClosingFor = (ym, baId) => db.baClosings.find(c => c.month === ym && c.baId === baId)
export const isBaLocked = task => hasAnalysis(task) && !!baClosingFor(String(task?.baCompletedDate || '').slice(0, 7), task?.baId)
/** Chốt / mở chốt điểm BA: Quản trị hệ thống / Quản trị BA · quản lý trực tiếp của người đó
    (PO / Quản trị dự án KHÔNG chốt được người không thuộc mình quản lý) */
export function canCloseBa(baId, _ym) {
  const me = currentUser.value
  return !!me && (seesAllBa() || isManagerOf(me, userById(baId)))
}
/** params: { holidays, workingDays, actualDays, effort } — thông số người chốt nhập (lưu kèm bản chốt) */
export function closeBa(ym, baId, params = null) {
  if (baClosingFor(ym, baId)) return
  const c = { ...buildBaClosing(ym, baId, db.tasks, db.config, currentUser.value?.id), ...(params ? { params } : {}) }
  db.baClosings.push(c)
  silent(sync(() => api.put(`/api/ba-closings/${ym}/${baId}`, { params })))
  return true
}
export function reopenBa(ym, baId) {
  db.baClosings = db.baClosings.filter(c => !(c.month === ym && c.baId === baId))
  silent(sync(() => api.del(`/api/ba-closings/${ym}/${baId}`)))
}

/** Được chốt điểm của PD: Quản trị hoặc quản lý trực tiếp của PD đó */
export function canClosePd(pdId) {
  const me = currentUser.value
  const u = userById(pdId)
  return !!me && !!u && (seesAllPd() || isManagerOf(me, u))   // người thực hiện bộ phận nào cũng được
}

/** Mở chốt: Quản trị LUÔN mở được (kể cả người đã đổi bộ phận / bị xóa) · quản lý trực tiếp mở cho người mình quản lý */
export function canReopenPd(pdId) {
  const me = currentUser.value
  return !!me && (seesAllPd() || isManagerOf(me, userById(pdId)))
}

/** Thông số người chốt nhập khi chốt → params của bản chốt */
export function closingInput(ym, { holidays = 0, actualDays, effort = 100, target = 0 }) {
  const h = Math.max(0, Number(holidays) || 0)
  const wd = workingDaysOf(ym, h)
  return {
    holidays: h, workingDays: wd,
    person: { actualDays: actualDays === '' || actualDays == null ? wd : Math.max(0, Number(actualDays) || 0), effort: Math.max(0, Number(effort) || 0), target: Math.max(0, Number(target) || 0) },
  }
}
/** Gợi ý số ngày nghỉ lễ của tháng: lấy theo bản chốt gần nhất trong tháng (người khác đã điền), chưa có → 0 */
export function suggestedHolidays(ym) {
  const last = db.closings.filter(c => c.month === ym && c.params?.holidays != null).sort((a, b) => (b.closedAt || '').localeCompare(a.closedAt || ''))[0]
  return last?.params.holidays ?? db.monthSettings[ym]?.holidays ?? 0
}
/** Chốt điểm: entries = [{ pdId, holidays, actualDays, effort, target }] (người chốt tự điền) — hoặc mảng pdId (dùng mặc định) */
export function closePds(ym, entries) {
  let n = 0
  for (const e of entries) {
    const pdId = typeof e === 'string' ? e : e.pdId
    if (!canClosePd(pdId) || isPdClosed(ym, pdId)) continue
    const params = typeof e === 'string' ? snapshotParams(db, ym, pdId) : closingInput(ym, e)
    const c = buildClosing(ym, pdId, db.tasks, db.config, currentUser.value.id, params, undefined, { users: db.users, closings: db.closings })
    c.projects = pdProjectsOf(db.projects, pdId)
    db.closings.push(c)
    silent(sync(() => api.put(`/api/closings/${ym}/${pdId}`, { params: { holidays: params.holidays, ...params.person } })))
    n++
  }
  return n
}
export function reopenPd(ym, pdId) {
  const c = closingFor(ym, pdId)
  if (!c) return false
  if (!c.pdId) {                                 // bản chốt cả tháng kiểu cũ → chỉ Quản trị mở
    if (!isAdmin()) return false
    db.closings = db.closings.filter(x => x !== c)
    silent(sync(() => api.del(`/api/closings/${ym}`)))
    return true
  }
  if (!canReopenPd(pdId)) return false
  db.closings = db.closings.filter(x => x !== c)
  silent(sync(() => api.del(`/api/closings/${ym}/${pdId}`)))
  return true
}

/** Ngày hoàn thành mới có rơi vào tháng PD đã được chốt không */
export function closedDateError(date, pdId) {
  return date && pdId && isPdClosed(date.slice(0, 7), pdId)
    ? `Điểm tháng ${monthLabelOf(date.slice(0, 7))} của PD đã chốt — không thể chọn ngày hoàn thành trong tháng này`
    : ''
}

/* ═══ THÔNG SỐ THÁNG (nghỉ lễ, ngày làm thực tế, điểm kỳ vọng, effort) ═══ */
function monthEntry(data, ym) {
  data.monthSettings[ym] ??= { holidays: 0, people: {} }
  return data.monthSettings[ym]
}
/** Thông số 1 PD trong tháng — mặc định: làm đủ ngày, effort 100%, kỳ vọng theo level của PD */
const pdParamsIn = (data, ym, pdId) => personParams(ym, data.monthSettings[ym], data.users.find(x => x.id === pdId))
const snapshotParams = (data, ym, pdId) => closingParams(ym, data.monthSettings[ym], data.users.find(x => x.id === pdId))

/** Thông số chung của tháng (nghỉ lễ, ngày làm việc) */
export function monthParams(ym) {
  const holidays = db.monthSettings[ym]?.holidays ?? 0
  return { holidays, workingDays: workingDaysOf(ym, holidays) }
}
/** Thông số của PD — PD đã chốt → theo bản chốt */
export function pdParams(ym, pdId) {
  const c = closingFor(ym, pdId)
  if (c?.params?.person) return c.params.person
  if (c?.params?.people?.[pdId]) return c.params.people[pdId]
  return pdParamsIn(db, ym, pdId)
}
/** Số ngày làm việc tính cho PD (PD đã chốt → theo bản chốt) */
export function pdWorkingDays(ym, pdId) {
  return closingFor(ym, pdId)?.params?.workingDays ?? monthParams(ym).workingDays
}
/** Nghỉ lễ áp cho cả công ty → chỉ Quản trị sửa */
export const canEditHolidays = () => isAdmin()
/** Ngày làm thực tế / effort / kỳ vọng: quản lý trực tiếp của PD hoặc Quản trị, khi PD chưa chốt tháng */
export const canEditPdParams = (ym, pdId) => canClosePd(pdId) && !isPdClosed(ym, pdId)

const syncMonth = ym => silent(sync(() => api.put(`/api/months/${ym}`, db.monthSettings[ym])))
export function setHolidays(ym, n) {
  if (!canEditHolidays()) return
  monthEntry(db, ym).holidays = Math.max(0, Number(n) || 0)
  syncMonth(ym)
}
export function setPdParam(ym, pdId, field, value) {
  if (!canEditPdParams(ym, pdId)) return
  const m = monthEntry(db, ym)
  m.people[pdId] = { ...(m.people[pdId] ?? {}), [field]: Math.max(0, Number(value) || 0) }
  syncMonth(ym)
}

/** Gợi ý "Là dự án phụ trách": dự án của công việc = dự án phụ trách của PD */
export const ownProjectFor = (pdId, projectId) => (primaryProjectIdsOf(userById(pdId)).includes(projectId) ? 'Có' : 'Không')
export { managerIdsOf, primaryProjectIdsOf }

/* ═══ LỊCH SỬ — chỉ ghi SỰ KIỆN LỚN (historyMerge.js): ai tạo / nhập việc · ai sửa thông tin chính (tên, PD / BA, loại việc, ngày hoàn thành) · ai đổi điểm ═══════════ */
function scoresOf(t) { return { score: computeScore(t, db.config), final: computeFinalScore(t, db.config), ba: baScoreOf(t, db.config)?.actual ?? '' } }
/** Ghi lịch sử khi có SỰ KIỆN LỚN: tạo / nhập việc (luôn ghi) · sửa thông tin chính · đổi điểm (kèm điểm cũ → mới + trường gây ra thay đổi).
    Chữ dài (tên việc, lý do…) chỉ ghi “đã sửa”, không lưu nội dung → đỡ tốn dung lượng. Sửa ô nhỏ không ảnh hưởng điểm thì KHÔNG ghi. */
function logTaskChange(task, before, action, fieldChanges = []) {
  const a = scoresOf(before), b = scoresOf(task)
  const scoreChanged = !(a.score === b.score && a.final === b.final && a.ba === b.ba)
  const slim = c => (MARK_ONLY_FIELDS.has(c.field) ? { field: c.field } : c)
  const major = fieldChanges.filter(c => MAJOR_FIELDS.has(c.field)).map(slim)
  if (action === 'update' && !scoreChanged && !major.length) return
  const changes = [
    ...(a.ba !== b.ba ? [{ field: 'baScore', from: a.ba, to: b.ba }] : []),
    ...(a.final !== b.final ? [{ field: 'finalScore', from: a.final, to: b.final }] : []),
    ...(a.score !== b.score ? [{ field: 'score', from: a.score, to: b.score }] : []),
    ...(scoreChanged ? fieldChanges.filter(c => !MAJOR_FIELDS.has(c.field)).map(slim) : []),   // trường phụ chỉ kèm khi đổi điểm (để giải thích)
    ...major,
  ]
  logHistory(task, action, action === 'update' ? changes : changes.filter(c => ['baScore', 'finalScore', 'score'].includes(c.field)))   // tạo / nhập: chỉ ghi điểm khởi đầu, không liệt kê từng trường
}
function logHistory(task, action, changes = []) {
  const entry = {
    id: uid('h'), taskId: task.id, projectId: task.projectId, taskContent: task.content,
    at: new Date().toISOString(), userId: currentUser.value?.id, action, changes,
  }
  // Máy chủ gộp lượt sửa liên tục của cùng 1 người (historyMerge.js) → thay dòng tạm bằng kết quả gộp / bỏ dòng thừa
  db.history.push(entry)
  silent(sync(() => api.post('/api/history', entry)).then(r => {
    if (!r) return
    const drop = new Set([...(r.del ?? []), ...(r.put && r.put.id !== entry.id ? [entry.id] : []), ...(!r.put ? [entry.id] : [])])
    db.history = db.history.filter(h => !drop.has(h.id))
    if (r.put) { const i = db.history.findIndex(h => h.id === r.put.id); if (i >= 0) db.history[i] = r.put; else db.history.push(r.put) }
  }))
}
export const historyOf = taskId =>
  db.history.filter(h => h.taskId === taskId).sort((a, b) => b.at.localeCompare(a.at))

function diff(before, after, fields = TASK_FIELDS) {
  return fields
    .filter(f => f in after && String(before[f] ?? '') !== String(after[f] ?? ''))
    .map(f => ({ field: f, from: before[f] ?? '', to: after[f] ?? '' }))
}

/* ── CRUD ── */
const projectSaving = new Map()   // id → promise lưu lên máy chủ (đồng bộ Sheet dự án cần chờ)
export const projectSaved = id => projectSaving.get(id) ?? Promise.resolve()
export function saveProject(data) {
  let p
  if (data.id) p = Object.assign(projectById(data.id), data)
  else {
    // PO tạo dự án thì tự động là Quản trị của dự án đó
    const me = currentUser.value
    const isPO = ['PO', 'PDL'].includes(me?.role)   // PO / PD Lead tạo dự án → Quản trị dự án đó
    const memberIds = isPO && !data.memberIds.includes(me.id) ? [...data.memberIds, me.id] : data.memberIds
    const memberRoles = { ...(data.memberRoles ?? {}), ...(isPO ? { [me.id]: 'manager' } : {}) }
    p = { ...data, memberIds, memberRoles, id: uid('p'), createdBy: me?.id }
    db.projects.push(p)
  }
  projectSaving.set(p.id, silent(sync(() => api.put(`/api/projects/${p.id}`, p))))
  return p.id
}
/* ── Khối dự án ── */
export const divisionName = id => db.divisions.find(d => d.id === id)?.name ?? ''
/** Danh mục khối dạng CÂY: đường dẫn đầy đủ “Khối › Nhóm › …” · lựa chọn theo thứ tự cây (nhãn = đường dẫn, gõ tìm được) */
export const divisionPath = id => divisionPathOf(db.divisions, id)
export const divisionOptions = () => divisionTree(db.divisions).map(d => ({
  value: d.id, label: divisionPathOf(db.divisions, d.id),   // label = đường dẫn (hiện khi đã chọn / khi gõ tìm)
  text: d.name, depth: d.depth, parent: db.divisions.some(x => x.parentId === d.id),   // danh sách thả xuống hiện dạng cây
}))
export const divisionWithChildren = id => divisionDescendantIds(db.divisions, id)
export async function saveDivisions(items) {
  if (backend.enabled) db.divisions = (await api.put('/api/divisions', { items })).items
  else db.divisions = items.map(x => ({ id: x.id || uid('dv'), name: x.name.trim(), ...(x.parentId ? { parentId: x.parentId } : {}) }))
}

export const projectHasLockedTasks = id => db.tasks.some(t => t.projectId === id && isTaskLocked(t))
export function deleteProject(id) {
  if (projectHasLockedTasks(id)) return false
  db.tasks = db.tasks.filter(t => t.projectId !== id)
  db.iterations = db.iterations.filter(i => i.projectId !== id)
  db.projects = db.projects.filter(p => p.id !== id)
  silent(sync(() => api.del(`/api/projects/${id}`)))
  return true
}

const iterationSaving = new Map()   // id → promise lưu lên máy chủ (đồng bộ Sheet cần chờ vòng lặp có trên máy chủ)
export function saveIteration(data) {
  const it = data.id ? Object.assign(iterationById(data.id), data) : { ...data, id: uid('i') }
  if (!data.id) db.iterations.push(it)
  iterationSaving.set(it.id, silent(sync(() => api.put(`/api/iterations/${it.id}`, it))))
  return it.id
}
export const iterationSaved = id => iterationSaving.get(id) ?? Promise.resolve()
export const iterationHasLockedTasks = id => db.tasks.some(t => t.iterationId === id && isTaskLocked(t))
export function deleteIteration(id) {
  if (iterationHasLockedTasks(id)) return false
  db.tasks = db.tasks.filter(t => t.iterationId !== id)
  db.iterations = db.iterations.filter(i => i.id !== id)
  silent(sync(() => api.del(`/api/iterations/${id}`)))
  return true
}

/** Công việc chưa xong (chưa có Ngày hoàn thành) của 1 vòng lặp — để chuyển sang vòng lặp mới */
export const unfinishedTasksOf = iterationId =>
  tasksOf(iterationId).filter(t => !t.completedDate)

export function moveTasks(taskIds, toIterationId) {
  const to = iterationById(toIterationId)
  for (const t of db.tasks.filter(x => taskIds.includes(x.id))) {
    const from = iterationById(t.iterationId)
    t.iterationId = to.id
    t.projectId = to.projectId
    silent(sync(() => api.put(`/api/tasks/${t.id}`, { iterationId: to.id })))
  }
}

export function saveTask(data) {
  if (data.id) {
    const task = db.tasks.find(t => t.id === data.id)
    const before = { ...task }
    const changes = diff(task, data)
    Object.assign(task, data)
    silent(sync(() => api.put(`/api/tasks/${task.id}`, task)))
    logTaskChange(task, before, 'update', changes)
  } else {
    const task = { ...data, id: uid('t'), createdBy: currentUser.value?.id, createdAt: new Date().toISOString() }
    db.tasks.push(task)
    // Tạo trước, ghi lịch sử sau (lịch sử cần công việc đã tồn tại ở máy chủ)
    sync(() => api.put(`/api/tasks/${task.id}`, task)).then(() => logTaskChange(task, {}, 'create')).catch(() => {})
  }
}

/** Nhập nhiều công việc 1 lần (từ file) */
/** Nhập nhanh: nhiều công việc chỉ có PBI + nội dung (+ PD / BA chung) — các trường khác theo mặc định, cập nhật sau */
export function quickAddTasks(projectId, iterationId, lines, { pdId = '', baId = '', platform = 'Web' } = {}) {
  importTasks(lines.map(x => ({
    projectId, iterationId, pbi: x.pbi, content: x.content, pdId, baId,
    designStatus: DEFAULT_STATUS, solutionBy: 'PD và BA', complexity: 'Trung bình', platform: platform || 'Web',
    isOwnProject: pdId ? ownProjectFor(pdId, projectId) : 'Có', mainScreens: 0, subScreens: 0,
    designLink: '', devmodeLink: '', concept: '', solutionBrief: '', expectedDate: '', completedDate: '', qualityRating: DEFAULT_RATING, ratingReason: '', manualScore: '',
  })))
}

export function importTasks(list) {
  const at = new Date().toISOString()
  const created = list.map(data => ({ ...data, devmodeLink: data.devmodeLink || devmodeLinkOf(data.designLink), id: uid('t'), createdBy: currentUser.value?.id, createdAt: at }))
  db.tasks.push(...created)
  const logAll = () => created.forEach(t => logTaskChange(t, {}, 'import'))
  if (backend.enabled) sync(() => api.post('/api/tasks/bulk', { tasks: created })).then(logAll).catch(() => {})
  else logAll()
}

/** Lưu ngay 1 trường (dùng cho drawer xem nhanh) — trả true hoặc chuỗi lỗi */
/** Nhận việc chưa có người thực hiện: slot 'pd' | 'ba' (chỉ gán chính mình) */
export const canClaim = (task, slot) => !!task && !isTaskLocked(task) && canClaimSlot(task, slot, currentUser.value, myProjectRole(task.projectId))
export function claimTask(task, slot) {
  if (!canClaim(task, slot)) return 'Việc này không nhận được (đã có người thực hiện hoặc bạn không thuộc bộ phận phù hợp)'
  return updateTaskField(task.id, slot === 'pd' ? 'pdId' : 'baId', currentUser.value.id, true)
}
export function updateTaskField(id, field, value, claiming = false) {
  const task = db.tasks.find(t => t.id === id)
  if (!task) return 'Không tìm thấy công việc'
  if (isTaskLocked(task) && !BA_PHASE_FIELDS.includes(field) && field !== 'stage') return 'Công việc thuộc tháng đã chốt điểm'
  if (!claiming && !canEditField(task, field)) return 'Bạn không có quyền sửa trường này'
  if (field === 'baStatus' || field === 'stage') return updateTaskFields(id, { [field]: value })
  if (field === 'completedDate' && closedDateError(value, task.pdId)) return closedDateError(value, task.pdId)
  if (field === 'pdId' && closedDateError(task.completedDate, value)) return closedDateError(task.completedDate, value)
  if (sameValue(task[field], value)) return true
  const before = { ...task }
  task[field] = value
  const payload = { [field]: value }
  // Đổi Link thiết kế → tự điền Link devmode (thêm m=dev) nếu devmode đang trống / là bản tự sinh từ link cũ
  if (field === 'designLink' && canEditField(task, 'devmodeLink')) {
    const dev = autoDevmodeLink(before.designLink, value, before.devmodeLink)
    if (dev !== null && dev !== (before.devmodeLink ?? '')) payload.devmodeLink = task.devmodeLink = dev
  }
  silent(sync(() => api.put(`/api/tasks/${id}`, payload)))
  logTaskChange(task, before, 'update', [{ field, from: before[field] ?? '', to: value ?? '' }])
  return true
}
/** Lưu nhiều trường 1 lần (VD Duyệt & chuyển thiết kế: trạng thái phân tích + PD) — trả true hoặc chuỗi lỗi */
export function updateTaskFields(id, patch) {
  const task = db.tasks.find(t => t.id === id)
  if (!task) return 'Không tìm thấy công việc'
  const approvingPd = f => f === 'pdId' && patch.baStatus === BA_APPROVED && hasAnalysis(task) && canApproveBa(task)   // duyệt → chọn luôn PD thiết kế
  for (const f in patch) if (!sameValue(task[f], patch[f]) && !approvingPd(f) && !canEditField(task, f)) return 'Bạn không có quyền sửa trường này'
  const changes = Object.keys(patch).filter(f => !sameValue(task[f], patch[f]))
  if (!changes.length) return true
  const before = { ...task }
  Object.assign(task, patch)
  if (patch.baStatus === BA_APPROVED && before.baStatus !== BA_APPROVED) Object.assign(task, { baReviewedBy: currentUser.value?.id, baReviewedAt: new Date().toISOString() })
  if (hasDesign(task) && phaseOf(task) === 'design' && !task.designStatus) task.designStatus = DEFAULT_STATUS
  silent(sync(() => api.put(`/api/tasks/${id}`, { ...patch, ...(task.designStatus !== before.designStatus ? { designStatus: task.designStatus } : {}) })))
  logTaskChange(task, before, 'update', changes.map(f => ({ field: f, from: before[f] ?? '', to: patch[f] ?? '' })))
  return true
}
/** Chọn vai trò của Lead trong việc ('' | 'review' | 'solution') — xóa luôn dấu “Lead chốt giải pháp” kiểu cũ */
export function setLeadRole(id, role) {
  const task = db.tasks.find(t => t.id === id)
  if (!task) return 'Không tìm thấy công việc'
  return updateTaskFields(id, { leadRole: role, ...(task.leadSolution ? { leadSolution: '' } : {}) })
}
export function deleteTask(id) {
  const task = db.tasks.find(t => t.id === id)
  if (!task || isTaskLocked(task)) return false
  db.tasks = db.tasks.filter(t => t.id !== id)
  silent(sync(() => api.del(`/api/tasks/${id}`)))
  return true
}

/* ═══ NGƯỜI DÙNG (Quản trị) ═══
   status: none (chưa mời) · invited (đã mời, chờ đăng nhập Google) · pending (tự đăng nhập, chờ duyệt)
           active (hoạt động) · disabled (đã khóa) */
export const USER_STATUSES = {
  none:     { label: 'Chưa mời',      color: 'neutral' },
  invited:  { label: 'Đã mời',        color: 'warning' },
  pending:  { label: 'Chờ duyệt',     color: 'brand' },
  active:   { label: 'Hoạt động',     color: 'success' },
  disabled: { label: 'Đã khóa',       color: 'danger' },
}

/** Lưu người dùng + dự án tham gia; trả về user đã lưu */
export async function saveUser(data, projectIds, projectRoles = {}) {
  let u = data.id ? userById(data.id) : null
  if (u) Object.assign(u, data)
  else { u = { status: 'none', ...data, id: uid('u') }; db.users.push(u) }
  delete u.leadId; delete u.isLead; delete u.primaryProjectId   // trường cũ → managerIds / primaryProjectIds
  if (Array.isArray(projectIds)) {
    db.projects.forEach(p => {
      const has = p.memberIds.includes(u.id), want = projectIds.includes(p.id)
      if (has && !want) { p.memberIds = p.memberIds.filter(m => m !== u.id); if (p.memberRoles) delete p.memberRoles[u.id] }
      if (!has && want) p.memberIds.push(u.id)
      if (want && projectRoles[p.id]) p.memberRoles = { ...(p.memberRoles ?? {}), [u.id]: projectRoles[p.id] }   // vai trò trong dự án
    })
  }
  await sync(() => api.put(`/api/users/${u.id}`, { ...u, projectIds, projectRoles }))
  return u
}

/** Gửi lời mời: máy chủ gửi email (nếu có SMTP) và trả về link mời */
/** Quản trị đặt mật khẩu cho người dùng (reset cứng) */
export async function adminSetPassword(id, password) {
  const u = userById(id)
  if (backend.enabled) await api.post(`/api/users/${id}/password`, { password })
  if (u) { u.hasPassword = true; if (u.status !== 'active' && u.status !== 'disabled') u.status = 'active' }
}

export async function inviteUser(id) {
  const u = userById(id)
  if (!backend.enabled) {
    if (u && u.status !== 'active') u.status = 'invited'
    return { sent: false, demo: true, link: `${location.origin}/dang-nhap?invite=${encodeURIComponent(u?.email ?? '')}` }
  }
  const r = await sync(() => api.post(`/api/users/${id}/invite`))
  if (u && u.status !== 'active') u.status = 'invited'
  return r
}

/** Dữ liệu còn gắn với người dùng (còn → không cho xóa) — theo dữ liệu trình duyệt đang có; máy chủ kiểm tra lại lần nữa */
export const usageOfUser = id => userUsage(id, { tasks: db.tasks, users: db.users, closings: db.closings, baClosings: db.baClosings })
export async function deleteUser(id) {
  const u = userById(id), usage = usageOfUser(id)
  if (usage.length) throw new Error(usageMessage(u?.name ?? '', usage))
  await sync(() => api.del(`/api/users/${id}`))   // máy chủ từ chối (còn dữ liệu mà trình duyệt chưa thấy) → báo lỗi, không xóa
  db.projects.forEach(p => { p.memberIds = p.memberIds.filter(m => m !== id) })
  db.users = db.users.filter(x => x.id !== id)
  if (!backend.enabled && db.currentUserId === id) db.currentUserId = db.users[0]?.id
  return { deleted: true }
}

export function saveConfig(cfg) {
  db.config = JSON.parse(JSON.stringify(cfg))
  silent(sync(() => api.put('/api/config', db.config)))
}

export { FIELD_LABELS }
