import { reactive, onMounted, onBeforeUnmount } from 'vue'
import { backend, api } from './api.js'
import { isAdmin } from './db.js'

/* Ai đang dùng hệ thống (mọi người dùng; Quản trị xem thêm máy / IP từng phiên) — dùng chung cho cụm “đang hoạt động” trên header + cột Hoạt động ở trang Người dùng.
   active = mở app + có thao tác trong N phút · idle = mở app nhưng quá N phút không thao tác · offline = không mở app.
   Chỉ 1 vòng gọi máy chủ (30 giây) dù nhiều chỗ cùng dùng. */
export const presence = reactive({ activity: {}, demo: [], idleMinutes: 10, loaded: false, loadedAt: 0, people: {} })   // demo: người đang dùng thử (chỉ Quản trị)   // people: thông tin người (danh bạ chat) cho người không có trong dữ liệu đã tải

async function load() {
  if (!backend.enabled) return
  try {
    if (isAdmin()) {
      const r = await api.get('/api/admin/activity')   // chi tiết: máy, IP, thời gian từng phiên
      presence.activity = r.activity; presence.demo = r.demo ?? []; presence.idleMinutes = r.idleMinutes ?? 10
    } else {
      // Người dùng khác: chỉ trạng thái (đang hoạt động / không hoạt động) — lấy từ danh bạ chat, không có máy / IP
      const r = await api.get('/api/chat/contacts')
      presence.activity = Object.fromEntries(Object.entries(r.states ?? {}).map(([id, state]) => [id, { state, online: true, sessions: [] }]))
      presence.idleMinutes = r.idleMinutes ?? 10
      presence.people = Object.fromEntries((r.contacts ?? []).map(u => [u.id, u]))
    }
    presence.loaded = true; presence.loadedAt = Date.now()
  } catch { /* bỏ qua lần này */ }
}
let users = 0, timer = null
export function usePresence() {
  onMounted(() => { if (users++ === 0) { load(); timer = setInterval(load, 30000) } })
  onBeforeUnmount(() => { if (--users === 0) { clearInterval(timer); timer = null } })
  return presence
}

export const stateOf = id => presence.activity[id]?.state ?? (presence.activity[id]?.online ? 'active' : 'offline')
export const idleFor = ms => { const m = Math.max(1, Math.round((Date.now() - ms) / 60000)); return m < 60 ? `${m} phút` : `${Math.floor(m / 60)} giờ${m % 60 ? ' ' + (m % 60) + ' phút' : ''}` }
export const timeOf = ms => { const d = new Date(ms); const today = d.toDateString() === new Date().toDateString()
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + (today ? '' : ' ' + d.toLocaleDateString('vi-VN')) }
export const ago = ms => {
  const m = Math.round((Date.now() - ms) / 60000)
  if (m < 1) return 'vừa xong'
  if (m < 60) return `${m} phút trước`
  if (m < 1440) return `${Math.round(m / 60)} giờ trước`
  if (m < 43200) return `${Math.round(m / 1440)} ngày trước`
  return new Date(ms).toLocaleDateString('vi-VN')
}
