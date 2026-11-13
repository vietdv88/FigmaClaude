import { reactive } from 'vue'
import { api } from './store.js'

/* Ai đang xem tài liệu (như app Chấm điểm): mỗi tab báo máy chủ 30 giây / lần — trang đang xem + bao lâu chưa thao tác.
   Chỉ tính thao tác thật (click, gõ phím, cuộn, chạm); tab ẩn vẫn báo để biết còn mở, nhưng thời gian không thao tác cứ tăng. */
const EVERY = 30000
// Mã phiên của tab — không dùng crypto.randomUUID (chỉ có trên https / localhost; vào bằng http://IP sẽ lỗi)
const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('')
const cid = (() => { try { let v = sessionStorage.getItem('ds-cid'); if (!v) { v = newId(); sessionStorage.setItem('ds-cid', v) } return v } catch { return newId() } })()
let lastInteract = Date.now(), started = false
const send = body => fetch('/api/ds/presence', { method: 'POST', credentials: 'same-origin', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cid, ...body }) }).catch(() => {})
export const ping = () => send({ page: location.pathname, idleMs: Date.now() - lastInteract })

export function startPresence() {
  if (started) return; started = true
  const mark = () => { const was = Date.now() - lastInteract; lastInteract = Date.now(); if (was > 60000) ping() }   // quay lại sau > 1 phút → báo ngay
  for (const e of ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll']) window.addEventListener(e, mark, { passive: true, capture: true })
  window.addEventListener('pagehide', () => send({ leave: true }))
  ping(); setInterval(ping, EVERY)
}

/* Danh sách người đang xem (chỉ người biên tập) — 1 vòng tải 30 giây dù nhiều chỗ dùng */
export const presence = reactive({ visitors: [], idleMinutes: 10, loaded: false, loadedAt: 0 })
let users = 0, timer = null
async function load() {
  try { const r = await api('/presence'); presence.visitors = r.visitors; presence.idleMinutes = r.idleMinutes; presence.loaded = true; presence.loadedAt = Date.now() } catch { /* bỏ qua lần này */ }
}
export const watchPresence = () => { if (users++ === 0) { load(); timer = setInterval(load, EVERY) } }
export const unwatchPresence = () => { if (--users === 0) { clearInterval(timer); timer = null } }
export const reloadPresence = load

export const timeOf = ms => { const d = new Date(ms); const today = d.toDateString() === new Date().toDateString()
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + (today ? '' : ' ' + d.toLocaleDateString('vi-VN')) }
export const ago = ms => { const m = Math.round((Date.now() - ms) / 60000); return m < 1 ? 'vừa xong' : m < 60 ? `${m} phút trước` : `${Math.round(m / 60)} giờ trước` }
