import * as store from './store.js'
import { isHrbp, canClaimSlot, deptAdminOf, fieldScopeOf, DEPT_FIELDS, projectRoleOf, managerIdsOf, leadsOf, cleanLinks, sameValue, stageOf, hasAnalysis, hasDesign, phaseOf, BA_APPROVED, BA_DEFAULT_STATUS, BA_SCORE_FIELDS, BA_SELF_FIELDS, BA_PHASE_FIELDS, DEFAULT_STATUS, missingBaFields } from '../src/store/scoring.js'

/* ═══ Phân quyền phía máy chủ — cùng luật với app (src/store/db.js) ═══════════
   - Quản trị: toàn quyền; chốt / mở chốt điểm mọi PD.
   - PO: tạo dự án (người tạo là Quản trị của dự án).
   - Vai trò trong dự án: Quản trị (sửa mọi việc, quản lý dự án) · Thành viên (chỉ sửa việc của mình) · Hạn chế (chỉ xem).
   - Quản lý trực tiếp (user.managerIds, có thể nhiều người): xem công việc của người mình quản lý ở mọi dự án;
     chốt / mở chốt điểm + nhập thông số tháng cho PD mình quản lý.
   - Thành viên PD: nhóm thiết kế trên việc của mình · Thành viên BA: nghiệp vụ + đánh giá trên việc của mình.
   - Phạm vi xem: dự án mình tham gia + việc của chính mình + việc của người mình quản lý trực tiếp.
   - Công việc của PD đã chốt tháng: không ai sửa / xóa được.
   ═══════════════════════════════════════════════════════════════════════════ */

export class Forbidden extends Error { constructor(msg) { super(msg); this.status = 403 } }
export class BadRequest extends Error { constructor(msg) { super(msg); this.status = 400 } }
export const deny = msg => { throw new Forbidden(msg) }

export const BA_FIELDS = ['content', 'baId', 'solutionBy', 'concept', 'solutionBrief', 'expectedDate', 'complexity', 'businessLevel', 'qualityRating', 'ratingReason']
export const COMPLEXITY_FIELDS = ['complexity', 'businessLevel']   // PD thực hiện + người thêm việc đều sửa được
/** THÔNG TIN công việc mà NGƯỜI THÊM việc sửa thoải mái trên việc do mình thêm (tên, PBI, loại việc, PD / BA, link, màn hình, nền tảng, giải pháp, độ phức tạp, ngày kỳ vọng…).
    KHÔNG gồm kết quả thực hiện & chấm điểm: ngày hoàn thành, trạng thái thiết kế, mức hài lòng, điểm nhập tay, vai trò Lead, phần Phân tích của BA — vẫn theo quyền riêng. Tháng đã chốt điểm thì việc vẫn bị khóa. */
export const CREATOR_FIELDS = ['pbi', 'content', 'stage', 'pdId', 'baId', 'isOwnProject', 'designLink', 'devmodeLink', 'moreLinks', 'mainScreens', 'subScreens', 'platform',
  'solutionBy', 'concept', 'solutionBrief', 'complexity', 'businessLevel', 'expectedDate']
export const PD_FIELDS = ['designLink', 'designStatus', 'devmodeLink', 'moreLinks', 'completedDate', 'mainScreens', 'subScreens', 'platform', 'solutionBrief', 'complexity', 'businessLevel']
export const TASK_FIELDS = [
  'pbi', 'content', 'designLink', 'designStatus', 'solutionBy', 'devmodeLink', 'concept', 'pdId', 'baId',
  'expectedDate', 'completedDate', 'complexity', 'businessLevel', 'mainScreens', 'subScreens', 'isOwnProject', 'platform',
  'qualityRating', 'ratingReason', 'manualScore', 'moreLinks', 'solutionBrief', 'leadRole', 'leadSolution',
  'stage', ...BA_PHASE_FIELDS,   // giai đoạn + trường giai đoạn Phân tích (baReviewedBy / baReviewedAt do máy chủ tự ghi)
]

export const isAdmin = u => u?.role === 'admin'   // Quản trị hệ thống
export { deptAdminOf }
/** Xem mọi dự án / công việc: Quản trị hệ thống + Quản trị PD / BA · QA chỉ xem các dự án được gán (thành viên) */
/** Xem mọi dự án / công việc (CHỈ quyền xem — sửa / chốt dùng các hàm riêng): Quản trị, Quản trị PD / BA, HRBP */
export const seesAll = u => isAdmin(u) || !!deptAdminOf(u) || isHrbp(u)
/** Xem điểm / chốt điểm toàn bộ PD · toàn bộ BA */
export const seesAllPd = u => isAdmin(u) || deptAdminOf(u) === 'PD'
export const seesAllBa = u => isAdmin(u) || deptAdminOf(u) === 'BA'
/** Quản trị THẬT của dự án (vai trò trong dự án) — Quản trị bộ phận chỉ được sửa trường bộ phận mình */
export const realManager = (u, projectId) => isAdmin(u) || (!['QA', 'PDL', 'HRBP'].includes(u?.role) && projectRoleOf(store.get('projects', projectId), u) === 'manager')   // PD Lead: Quản trị dự án nhưng chỉ sửa phần PD
const deptFieldOk = (u, projectId, field) => realManager(u, projectId) || (DEPT_FIELDS[fieldScopeOf(u)] ?? []).includes(field)
export const isMember = (u, projectId) =>
  isAdmin(u) || !!store.get('projects', projectId)?.memberIds?.includes(u.id)
// QA: luôn chỉ xem (Hạn chế) ở mọi dự án — kể cả được thêm vào dự án với vai trò cao hơn
// Quản trị PD / BA: như Quản trị ở mọi dự án (vòng lặp, thêm / xóa việc, thành viên) — sửa trường thì giới hạn theo bộ phận (canEditField)
export const projectRole = (u, projectId) => (isAdmin(u) || deptAdminOf(u) ? 'manager' : ['QA', 'HRBP'].includes(u?.role) ? 'viewer' : projectRoleOf(store.get('projects', projectId), u))   // QA / HRBP: luôn chỉ xem
export const canManage = (u, projectId) => projectRole(u, projectId) === 'manager'
export const canCreateProject = u => ['admin', 'PO', 'PDL'].includes(u.role) || !!deptAdminOf(u)

/* Chốt điểm theo từng PD: id = "YYYY-MM:pdId" · bản chốt cũ id = "YYYY-MM" áp cho cả tháng */
export const closingFor = (ym, pdId) => store.get('closings', `${ym}:${pdId}`) ?? store.get('closings', ym)
export const isPdClosed = (ym, pdId) => !!ym && !!pdId && !!closingFor(ym, pdId)
export const dateClosedFor = (date, pdId) => !!date && isPdClosed(String(date).slice(0, 7), pdId)
export const isLocked = task => dateClosedFor(task?.completedDate, task?.pdId)

export const isManagerOf = (me, u) => !!me && !!u && managerIdsOf(u).includes(me.id)
/** Là Lead của PD: quản lý trực tiếp thuộc bộ phận PD */
export const isLeadOf = (me, pdId) => { const pd = pdId && store.get('users', pdId); return !!me && !!pd && leadsOf(pd, store.all('users')).some(l => l.id === me.id) }
/** TẠM THỜI (02/11/2026): PD Lead tự đánh giá mức hài lòng việc của chính mình — tắt: đặt false (cùng cờ ở src/store/db.js) */
export const PDL_SELF_RATING = true
/** PD Lead đánh giá mức hài lòng: Lead trực tiếp của PD thực hiện, vai trò PD Lead là Quản trị dự án · việc của chính mình: theo PDL_SELF_RATING */
export const canRateAsLead = (u, task) => !!u && !!task?.pdId && (task.pdId === u.id
  ? PDL_SELF_RATING && u.role === 'PDL'
  : isLeadOf(u, task.pdId) || (u.role === 'PDL' && projectRole(u, task.projectId) === 'manager'))
/** Chốt / mở chốt / nhập thông số tháng của người thực hiện (bộ phận nào cũng được): Quản trị hoặc quản lý trực tiếp */
export function canClosePd(u, pdId) {
  const pd = store.get('users', pdId)
  return !!pd && (seesAllPd(u) || isManagerOf(u, pd))
}
/** Mở chốt: Quản trị hệ thống / Quản trị PD luôn được (kể cả người đã đổi bộ phận / bị xóa) · quản lý trực tiếp của người đó */
export const canReopenPd = (u, pdId) => seesAllPd(u) || isManagerOf(u, store.get('users', pdId))
export function canSeeTask(u, t) {
  if (seesAll(u) || isMember(u, t.projectId) || t.pdId === u.id || t.baId === u.id) return true
  return isManagerOf(u, store.get('users', t.pdId)) || isManagerOf(u, store.get('users', t.baId))
}
/** Xem trọn điểm tháng của PD (mọi dự án, thông số tháng): chính mình, quản lý trực tiếp, Quản trị */
export const fullViewOf = (u, pdId) => seesAllPd(u) || isHrbp(u) || u.id === pdId || isManagerOf(u, store.get('users', pdId))

/* Chốt điểm BA: id = "YYYY-MM:baId" (kind baClosings — tách bản chốt PD) */
export const baClosingFor = (ym, baId) => (ym && baId ? store.get('baClosings', `${ym}:${baId}`) : null)
export const isBaLocked = task => hasAnalysis(task) && !!baClosingFor(String(task?.baCompletedDate || '').slice(0, 7), task?.baId)
/** Chốt / mở chốt điểm BA: Quản trị hệ thống / Quản trị BA · quản lý trực tiếp của người đó.
    KHÔNG cho PO / Quản trị dự án chốt người không thuộc mình quản lý (kể cả khi mọi việc của người đó nằm trong dự án mình quản lý) */
export function canCloseBa(u, baId, _ym) {
  const ba = store.get('users', baId)
  if (!ba) return isAdmin(u)
  return seesAllBa(u) || isManagerOf(u, ba)
}

/** Duyệt / chấm điểm giai đoạn Phân tích: Quản trị dự án (PO) hoặc quản lý trực tiếp của BA */
export const canApproveBa = (u, task) => realManager(u, task.projectId) || deptAdminOf(u) === 'BA' || isManagerOf(u, store.get('users', task.baId))

export function canEditField(u, task, field) {
  // Giai đoạn Phân tích — chốt điểm PD không khóa phần của BA
  if (BA_PHASE_FIELDS.includes(field)) {
    if (!hasAnalysis(task) || isBaLocked(task)) return false   // tháng của BA đã chốt → khóa phần phân tích
    if (canApproveBa(u, task)) return true
    // BA của việc tự điền BA Point, deadline, ngày hoàn thành, chất lượng (chưa duyệt); miễn trừ + duyệt: PO / quản lý trực tiếp
    return BA_SELF_FIELDS.includes(field) && task.baId === u.id && ['member', 'manager'].includes(projectRole(u, task.projectId)) && task.baStatus !== BA_APPROVED
  }
  // Đổi BA của việc có phân tích: đã có kết quả (hoàn thành / đã duyệt) → chỉ PO / quản lý trực tiếp (điểm chuyển sang người mới); tháng đã chốt → không đổi
  if (field === 'baId' && hasAnalysis(task)) {
    if (isBaLocked(task)) return false
    if (task.baCompletedDate || task.baStatus === BA_APPROVED) return canApproveBa(u, task)
  }
  if (field === 'stage') return projectRole(u, task.projectId) === 'manager' || canApproveBa(u, task)   // Quản trị PD / BA đổi được loại việc
    || (projectRole(u, task.projectId) === 'member' && [task.pdId, task.baId].includes(u.id))
    || (task.createdBy === u.id && projectRole(u, task.projectId) === 'member')   // người thêm việc đổi loại việc của việc mình thêm
  if (isLocked(task)) return false
  // Vai trò của Lead: Lead của PD thực hiện (quản lý trực tiếp thuộc bộ phận PD) tự chọn — kể cả không là thành viên dự án
  if (['leadRole', 'leadSolution'].includes(field) && isLeadOf(u, task.pdId)) return true
  // Mức hài lòng: PD Lead đánh giá việc của PD mình quản lý (hoặc ở dự án mình là Quản trị) — không tự đánh việc của chính mình
  if (['qualityRating', 'ratingReason'].includes(field) && canRateAsLead(u, task)) return true
  const role = projectRole(u, task.projectId)
  // NGƯỜI THÊM việc sửa thoải mái thông tin của việc mình thêm (xem CREATOR_FIELDS) — kể cả khi là Quản trị dự án (không bị giới hạn theo bộ phận); QA / HRBP / Hạn chế chỉ xem
  if (task.createdBy === u.id && ['member', 'manager'].includes(role) && CREATOR_FIELDS.includes(field)) return true
  if (role === 'manager') return deptFieldOk(u, task.projectId, field)   // Quản trị bộ phận: chỉ trường của bộ phận mình
  if (role !== 'member') return false
  // Việc 2 giai đoạn chưa được duyệt: PD chưa được làm phần thiết kế
  if (stageOf(task) === 'both' && phaseOf(task) === 'analysis' && PD_FIELDS.includes(field) && !BA_FIELDS.includes(field)) return false
  // Thành viên: người thực hiện (cột PD) sửa nhóm trường PD, BA của việc sửa nhóm trường BA — không phụ thuộc bộ phận
  if (task.pdId === u.id && PD_FIELDS.includes(field)) return true
  if (task.baId === u.id && BA_FIELDS.includes(field)) return true
  // (Người thêm việc sửa thông tin việc mình thêm: đã xử lý ở trên — CREATOR_FIELDS)
  return false
}

/** Giá trị mặc định theo giai đoạn: có Phân tích → trạng thái phân tích; Thiết kế bắt đầu khi chuyển sang (việc 2 giai đoạn đã duyệt) */
function applyStageDefaults(task) {
  task.stage = stageOf(task)
  if (hasAnalysis(task) && !task.baStatus) task.baStatus = BA_DEFAULT_STATUS
  if (hasDesign(task) && phaseOf(task) === 'design' && !task.designStatus) task.designStatus = DEFAULT_STATUS
  if (!hasDesign(task)) task.designStatus = task.designStatus || ''
}
/** Đổi giai đoạn: không được bỏ giai đoạn đã có dữ liệu chấm điểm (tránh mất điểm của ai) */
function checkStage(old, task) {
  if (stageOf(old) === stageOf(task)) return
  if (hasAnalysis(old) && !hasAnalysis(task) && (Number(old.baPoint) > 0 || old.baCompletedDate || (old.baQuality && old.baQuality !== 'Chưa đánh giá')))
    throw new BadRequest('Phần phân tích đã có dữ liệu chấm điểm BA — không đổi loại việc sang “Chỉ thiết kế” được')
  if (hasDesign(old) && !hasDesign(task) && (old.completedDate || Number(old.mainScreens) > 0 || Number(old.subScreens) > 0 || old.designLink))
    throw new BadRequest('Phần thiết kế đã có dữ liệu của PD — không đổi loại việc sang “Chỉ phân tích” được')
}

export const visibleProjectIds = u =>
  new Set(store.all('projects').filter(p => seesAll(u) || p.memberIds?.includes(u.id)).map(p => p.id))

/** Kiểm tra lưu 1 công việc (thêm mới hoặc cập nhật) — trả về object sạch để ghi */
export function checkTaskWrite(u, incoming) {
  const old = store.get('tasks', incoming.id)
  const iteration = store.get('iterations', incoming.iterationId ?? old?.iterationId)
  if (!iteration) throw new BadRequest('Vòng lặp không tồn tại')
  const projectId = iteration.projectId

  if (!old) {
    const role = projectRole(u, projectId)
    if (!['manager', 'member'].includes(role)) deny('Chỉ Quản trị hoặc Thành viên của dự án được thêm công việc')
    if (dateClosedFor(incoming.completedDate, incoming.pdId)) deny('Ngày hoàn thành rơi vào tháng PD đã chốt điểm')
    const task = { id: incoming.id, projectId, iterationId: iteration.id, createdBy: u.id, createdAt: new Date().toISOString() }
    for (const f of TASK_FIELDS) task[f] = incoming[f] ?? ''
    task.moreLinks = cleanLinks(incoming.moreLinks)
    if (!realManager(u, projectId) && fieldScopeOf(u)) for (const f of TASK_FIELDS) if (!DEPT_FIELDS[fieldScopeOf(u)].includes(f) && !['stage', 'pbi', 'content'].includes(f)) task[f] = f === 'moreLinks' ? [] : ''
    applyStageDefaults(task)
    // Điểm giai đoạn Phân tích chỉ PO / quản lý trực tiếp của BA nhập
    // BA của việc (Thành viên / Quản trị) tự điền được BA Point, deadline, ngày hoàn thành, chất lượng — miễn trừ thì không
    if (hasAnalysis(task) && !canApproveBa(u, task)) {
      const self = task.baId === u.id && ['manager', 'member'].includes(role)
      for (const f of BA_SCORE_FIELDS) if (!(self && BA_SELF_FIELDS.includes(f))) task[f] = ''
      if (task.baStatus === BA_APPROVED) task.baStatus = BA_DEFAULT_STATUS
    }
    if (task.baStatus === BA_APPROVED) Object.assign(task, { baReviewedBy: u.id, baReviewedAt: new Date().toISOString() })
    // Thành viên tạo việc: không tự đánh giá / nhập điểm tay ngay lúc tạo
    if (role !== 'manager') for (const f of ['qualityRating', 'ratingReason', 'manualScore']) task[f] = ''
    if (!String(task.content).trim()) throw new BadRequest('Nội dung không được để trống')
    return task
  }

  const task = { ...old }
  // Chuyển vòng lặp: người quản lý cả 2 dự án · Thành viên chuyển việc mình thêm sang vòng lặp khác CÙNG dự án
  if (incoming.iterationId && incoming.iterationId !== old.iterationId) {
    const ownMove = old.createdBy === u.id && projectId === old.projectId && projectRole(u, old.projectId) === 'member'
    if (!ownMove && (!canManage(u, old.projectId) || !canManage(u, projectId))) deny('Không có quyền chuyển vòng lặp')
    if (isLocked(old)) deny('Công việc thuộc tháng PD đã chốt điểm')
    task.iterationId = iteration.id
    task.projectId = projectId
  }
  for (const f of TASK_FIELDS) {
    if (f === 'moreLinks' && f in incoming) incoming[f] = cleanLinks(incoming[f])
    if (!(f in incoming) || sameValue(incoming[f], old[f])) continue
    // Duyệt & chuyển thiết kế: người duyệt (PO / quản lý trực tiếp của BA) được chọn luôn PD thiết kế
    const approvingPd = f === 'pdId' && incoming.baStatus === BA_APPROVED && hasAnalysis(old) && canApproveBa(u, old)
    // Nhận việc: ô PD / BA đang trống → thành viên đúng bộ phận tự gán CHÍNH MÌNH
    const claiming = (f === 'pdId' || f === 'baId') && incoming[f] === u.id && !isLocked(old)
      && canClaimSlot(old, f === 'pdId' ? 'pd' : 'ba', u, projectRole(u, old.projectId))
    if (!approvingPd && !claiming && !canEditField(u, old, f)) deny(isLocked(old) && !BA_PHASE_FIELDS.includes(f) ? 'Công việc thuộc tháng PD đã chốt điểm' : `Bạn không có quyền sửa trường "${f}"`)
    task[f] = incoming[f]
  }
  checkStage(old, task)
  if (task.baStatus !== old.baStatus) {
    if (task.baStatus && task.baStatus !== BA_APPROVED) task.baStatus = ''   // chỉ lưu dấu “đã duyệt”; trạng thái khác tự suy từ dữ liệu
    const approving = task.baStatus === BA_APPROVED, unapproving = old.baStatus === BA_APPROVED
    if ((approving || unapproving) && !canApproveBa(u, old)) deny('Chỉ PO hoặc quản lý trực tiếp của BA được duyệt giai đoạn phân tích')
    if (approving && missingBaFields(task).length) throw new BadRequest('Nhập đủ BA Point, deadline, ngày hoàn thành và kết quả chất lượng trước khi duyệt')
    if (approving) Object.assign(task, { baReviewedBy: u.id, baReviewedAt: new Date().toISOString() })
    if (unapproving) Object.assign(task, { baReviewedBy: '', baReviewedAt: '' })
  }
  applyStageDefaults(task)
  // Ngày hoàn thành / PD mới không được rơi vào tháng PD đã chốt
  if ((task.completedDate !== old.completedDate || task.pdId !== old.pdId) && isLocked(task)) deny('Ngày hoàn thành rơi vào tháng PD đã chốt điểm')
  if (!String(task.content).trim()) throw new BadRequest('Nội dung không được để trống')
  return task
}
