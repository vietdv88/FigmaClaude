import { reactive, computed } from 'vue'
import { api, backend } from './api.js'
import { userName, projectById } from './db.js'
import { FIELD_LABELS, ROLES } from './scoring.js'
import { audienceLabel } from './chat.js'

/* ═══ Thông báo (quả chuông trên header) — tải khi vào app, thông báo mới đến tức thì qua kênh realtime (patch.notifications) ═══ */
export const notes = reactive({ list: [], loaded: false })
/* Luồng “Hoạt động”: ai thêm / sửa / xóa việc ở dự án mình tham gia (Quản trị: mọi dự án) — tab riêng, không tính vào số chưa đọc trên chuông */
export const isActivity = n => n.type === 'task_activity'
export const unreadCount = computed(() => notes.list.filter(n => !n.readAt && !isActivity(n)).length)
export const unreadActivity = computed(() => notes.list.filter(n => !n.readAt && isActivity(n)).length)

export async function loadNotifications() {
  if (!backend.enabled) return
  try { notes.list = (await api.get('/api/notifications')).notifications; notes.loaded = true } catch { /* bỏ qua lần này */ }
}
export function onNotificationsPatch(list) {
  for (const n of list ?? []) {
    const i = notes.list.findIndex(x => x.id === n.id)
    if (i >= 0) notes.list.splice(i, 1)
    notes.list.unshift(n)                       // mới / vừa gộp → lên đầu
  }
  notes.list.sort((a, b) => b.at.localeCompare(a.at))
}
export function markRead(ids) {
  const at = new Date().toISOString(), set = new Set(ids)
  const todo = notes.list.filter(n => !n.readAt && set.has(n.id))
  if (!todo.length) return
  todo.forEach(n => { n.readAt = at })
  api.post('/api/notifications/read', { ids: todo.map(n => n.id) }).catch(() => {})
}
/** Đã đọc hết — theo tab đang xem: activity = true → chỉ luồng Hoạt động, false → chỉ thông báo của mình */
export function markAllRead(activity = false) {
  markRead(notes.list.filter(n => !n.readAt && isActivity(n) === activity).map(n => n.id))
}

/* ── Hiển thị: biểu tượng · nội dung · nơi mở khi bấm ── */
const roleName = v => ROLES.find(r => r.value === v)?.label ?? v ?? ''
const fieldList = fields => {
  const names = [...new Set((fields ?? []).map(f => (f === 'baStatus' ? 'duyệt phân tích' : FIELD_LABELS[f] ?? f)))]
  return names.length > 3 ? `${names.slice(0, 3).join(', ')} và ${names.length - 3} trường khác` : names.join(', ')
}
const taskName = d => `${d.pbi ? `${d.pbi} · ` : ''}${d.content || 'công việc'}`
const taskLink = d => ({ path: `/du-an/${d.projectId}`, query: { vl: d.iterationId, cv: d.taskId } })

export function notificationView(n) {
  const d = n.data ?? {}, actor = userName(d.actorId) || 'Ai đó'
  switch (n.type) {
    case 'user_pending':
      return { icon: 'user-plus', tone: 'warning', title: `${d.name} (${d.code}) đăng ký tài khoản`, sub: 'Đang chờ duyệt — bấm để xem và cấp quyền', to: { path: '/nguoi-dung', query: { duyet: d.userId } } }
    case 'user_approved':
      return { icon: 'circle-check', tone: 'success', title: 'Tài khoản của bạn đã được duyệt', sub: `${actor} cấp quyền${d.role ? ` với vai trò ${roleName(d.role)}` : ''}. Chào mừng bạn!`, to: { path: '/' } }
    case 'task_assigned':
      return { icon: 'clipboard-check', tone: 'brand', title: `${actor} giao cho bạn làm ${d.role || 'người thực hiện'}`, sub: taskName(d), to: taskLink(d) }
    case 'task_updated': {
      const approved = (d.fields ?? []).includes('baStatus')
      return { icon: approved ? 'circle-check' : 'pencil', tone: approved ? 'success' : 'neutral', title: `${actor} cập nhật ${fieldList(d.fields) || 'công việc'}`, sub: taskName(d), to: taskLink(d) }
    }
    case 'task_activity': {
      const proj = projectById(d.projectId)?.name ?? ''
      if (d.action === 'import') return { icon: 'list-details', tone: 'brand', title: `${actor} nhập ${d.count} công việc`, sub: proj, to: { path: `/du-an/${d.projectId}`, query: { vl: d.iterationId } } }
      if (d.action === 'delete') return { icon: 'trash', tone: 'danger', title: `${actor} xóa công việc`, sub: [taskName(d), proj].filter(Boolean).join(' · '), to: { path: `/du-an/${d.projectId}`, query: { vl: d.iterationId } } }
      if (d.action === 'create') return { icon: 'plus', tone: 'brand', title: `${actor} thêm công việc`, sub: [taskName(d), proj].filter(Boolean).join(' · '), to: taskLink(d) }
      return { icon: 'pencil', tone: 'neutral', title: `${actor} cập nhật ${fieldList(d.fields) || 'công việc'}`, sub: [taskName(d), proj].filter(Boolean).join(' · '), to: taskLink(d) }
    }
    case 'tasks_imported':
      return { icon: 'list-details', tone: 'brand', title: `${actor} thêm ${d.count} công việc giao cho bạn`, sub: projectById(d.projectId)?.name ?? '', to: { path: `/du-an/${d.projectId}`, query: { vl: d.iterationId } } }
    case 'announcement':   // thông báo chung (chat) — bấm mở kênh 📢 trong khung chat
      return { icon: 'speakerphone', tone: 'brand', title: `${actor} gửi thông báo chung${d.audience && d.audience !== '__all__' ? ` cho ${audienceLabel(d.audience)}` : ''}`, sub: d.preview || '', to: null, chatAnn: true }
    case 'chat_reaction':   // ai đó thả cảm xúc vào tin nhắn của mình — bấm mở đúng cuộc trò chuyện
      return { icon: 'mood-smile', tone: 'brand', title: `${actor} đã bày tỏ cảm xúc ${d.emoji || ''} về tin nhắn của bạn`, sub: d.preview ? `“${d.preview}”` : '', to: null, chatPeer: d.peer || d.actorId }
    default:
      return { icon: 'bell', tone: 'neutral', title: 'Thông báo', sub: '', to: null }
  }
}
