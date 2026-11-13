import crypto from 'node:crypto'
import * as store from './store.js'
import { TASK_FIELDS } from './rules.js'

/* ═══ Thông báo trong app (quả chuông trên header) ═══
   Bản ghi kind 'notifications': { id, userId, type, at, readAt?, data }
   type:
     user_pending   → Quản trị: có người tự đăng ký chờ duyệt          data { userId, name, code }
     user_approved  → người vừa được duyệt                                data { actorId, role }
     task_assigned  → được giao làm PD / BA một công việc                 data { taskId, projectId, iterationId, content, pbi, actorId, role }
     task_updated   → ai đó sửa công việc mình là PD / BA                 data { …như trên, fields: [tên trường] }
     tasks_imported → ai đó nhập nhiều việc giao cho mình                 data { projectId, iterationId, actorId, count }
     task_activity  → Quản trị + thành viên dự án: ai đó thêm / sửa / xóa / nhập việc trong dự án   data { action: 'create'|'update'|'delete'|'import', …việc, fields?, count? }
                      tab “Hoạt động” riêng — không tính vào số chưa đọc trên chuông
   Đẩy tức thì qua kênh realtime (patchFor → notifications, chỉ người nhận). Giữ KEEP_DAYS ngày. */
export const NOTIFY_KEEP_DAYS = 60
const MERGE_MS = 30 * 60e3   // cùng người sửa cùng việc trong 30 phút (chưa đọc) → gộp 1 thông báo

const activeUser = id => { const u = store.get('users', id); return u && u.status === 'active' ? u : null }

export function notify(userId, type, data, mergeKey = '') {
  if (!activeUser(userId)) return
  const now = new Date().toISOString()
  if (mergeKey) {
    const old = store.all('notifications').find(n => n.userId === userId && n.mergeKey === mergeKey && !n.readAt && Date.now() - Date.parse(n.at) < MERGE_MS)
    if (old) {
      const fields = [...new Set([...(old.data?.fields ?? []), ...(data.fields ?? [])])]
      store.put('notifications', { ...old, at: now, data: { ...old.data, ...data, fields } })
      return
    }
  }
  store.put('notifications', { id: 'n_' + crypto.randomUUID(), userId, type, at: now, data, ...(mergeKey ? { mergeKey } : {}) })
}

/** Xóa hẳn các thông báo đã xử lý xong — VD “chờ duyệt” khi người đó đã được duyệt / bị xóa (đỡ nặng dữ liệu, chuông không còn mục thừa) */
export function resolveNotifications(pred) {
  store.all('notifications').filter(pred).forEach(n => store.del('notifications', n.id))
}

/** Người tự đăng ký → báo mọi Quản trị đang hoạt động */
export function notifyPendingUser(u) {
  for (const a of store.all('users').filter(x => x.role === 'admin' && x.status === 'active')) {
    notify(a.id, 'user_pending', { userId: u.id, name: u.name, code: u.code })
  }
}

const taskBase = (t, actor) => ({ taskId: t.id, projectId: t.projectId, iterationId: t.iterationId, content: t.content, pbi: t.pbi ?? '', actorId: actor.id })
const same = (a, b) => JSON.stringify(a ?? '') === JSON.stringify(b ?? '')
// Giá trị máy chủ tự điền mặc định (việc cũ chưa có Loại việc → “Chỉ thiết kế”) không tính là “sửa”
const DEFAULTS = { stage: 'design' }
const changedField = (old, t, f) => !same(old?.[f], t[f]) && !(old && !old[f] && DEFAULTS[f] === t[f])

/** Công việc được thêm / sửa → báo PD, BA của việc (trừ chính người sửa). old = undefined khi thêm mới */
/** Người nhận luồng “Hoạt động” của 1 dự án: Quản trị + thành viên dự án đang hoạt động (trừ người thao tác) */
function activityRecipients(projectId, actorId) {
  const members = new Set(store.get('projects', projectId)?.memberIds ?? [])
  return store.all('users').filter(u => u.status === 'active' && u.id !== actorId && (u.role === 'admin' || members.has(u.id)))
}
export const ACTIVITY = 'task_activity'
function notifyActivity(actor, data, mergeKey = '') {
  for (const u of activityRecipients(data.projectId, actor.id)) notify(u.id, ACTIVITY, { ...data, actorId: actor.id }, mergeKey)
}
/** Xóa việc → báo Quản trị */
export function notifyTaskDeleted(actor, t) { notifyActivity(actor, { ...taskBase(t, actor), action: 'delete' }) }

export function notifyTaskChange(actor, old, t) {
  const fields = TASK_FIELDS.filter(f => changedField(old, t, f))
  if (old && !fields.length) return
  // Quản trị: luồng hoạt động (thêm / sửa) — sửa nhiều lần trong 30 phút gộp 1 dòng
  notifyActivity(actor, { ...taskBase(t, actor), action: old ? 'update' : 'create', ...(old ? { fields } : {}) }, old ? `act:${t.id}:${actor.id}` : '')
  const roles = new Map()   // userId → 'PD' | 'BA' | 'PD + BA'
  for (const [f, role] of [['pdId', 'PD'], ['baId', 'BA']]) if (t[f]) roles.set(t[f], roles.has(t[f]) ? 'PD + BA' : role)
  for (const [uid, role] of roles) {
    if (uid === actor.id) continue
    const newlyAssigned = !old || (t.pdId === uid && old.pdId !== uid) || (t.baId === uid && old.baId !== uid)
    if (newlyAssigned) notify(uid, 'task_assigned', { ...taskBase(t, actor), role })
    else notify(uid, 'task_updated', { ...taskBase(t, actor), fields }, `task:${t.id}:${actor.id}`)
  }
}

/** Nhập nhiều việc 1 lần (Excel / ảnh / dán TFS) → mỗi người nhận 1 thông báo gộp */
export function notifyTasksImported(actor, created) {
  const by = new Map()
  for (const t of created) for (const uid of new Set([t.pdId, t.baId].filter(Boolean))) {
    if (uid === actor.id) continue
    const k = `${uid}|${t.iterationId}`
    const x = by.get(k) ?? { uid, projectId: t.projectId, iterationId: t.iterationId, count: 0 }
    x.count++; by.set(k, x)
  }
  for (const x of by.values()) notify(x.uid, 'tasks_imported', { projectId: x.projectId, iterationId: x.iterationId, actorId: actor.id, count: x.count })
  // Quản trị: 1 dòng gộp cho mỗi vòng lặp được nhập
  const byIter = new Map()
  for (const t of created) { const x = byIter.get(t.iterationId) ?? { projectId: t.projectId, iterationId: t.iterationId, count: 0 }; x.count++; byIter.set(t.iterationId, x) }
  for (const x of byIter.values()) notifyActivity(actor, { action: 'import', ...x })
}

export function purgeNotifications() {
  // “Chờ duyệt” của người đã duyệt / đã khóa / đã xóa → xóa (dữ liệu cũ trước khi đổi sang xóa ngay khi duyệt)
  const users = new Map(store.all('users').map(u => [u.id, u]))
  const done = store.all('notifications').filter(n => n.type === 'user_pending' && users.get(n.data?.userId)?.status !== 'pending')
  if (done.length) { store.tx(() => done.forEach(n => store.del('notifications', n.id))); console.log(`🧹 Xóa ${done.length} thông báo chờ duyệt đã xử lý`) }
  const cutoff = new Date(Date.now() - NOTIFY_KEEP_DAYS * 86400e3).toISOString()
  const old = store.all('notifications').filter(n => n.at < cutoff)
  if (old.length) { store.tx(() => old.forEach(n => store.del('notifications', n.id))); console.log(`🧹 Dọn ${old.length} thông báo cũ hơn ${NOTIFY_KEEP_DAYS} ngày`) }
}
