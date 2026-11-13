import { uuid } from './uuid.js'
import { reactive } from 'vue'

/* ═══════════════════════════════════════════════════════════════════════════
   Kết nối máy chủ (server/). Không có máy chủ (chạy `npm run dev` một mình)
   → app tự chuyển sang chế độ demo, dữ liệu lưu trong trình duyệt.
   ═══════════════════════════════════════════════════════════════════════════ */

const CLIENT_ID = uuid()   // bỏ qua sự kiện realtime do chính tab này gây ra
/* Bản dùng thử có địa chỉ riêng /dung-thu/… (server/demo.js) — tab này đang ở bản dùng thử thì mọi request gửi kèm X-Pdp-Demo
   để máy chủ chuyển sang tiến trình demo; tab bản thật không bị ảnh hưởng */
export const DEMO_BASE = '/dung-thu'
export const inDemoUrl = location.pathname === DEMO_BASE || location.pathname.startsWith(DEMO_BASE + '/')
const MODE_HEADERS = inDemoUrl ? { 'X-Pdp-Demo': '1' } : {}

export const backend = reactive({
  enabled: false,      // có máy chủ
  user: null,          // người đăng nhập (kể cả đang chờ duyệt)
  publicConfig: {},    // { googleClientId, mailEnabled, devLogin }
  error: '',           // lỗi đồng bộ gần nhất (hiện toast)
  sessionLost: '',     // '' · 'expired' (hết phiên / đăng xuất ở tab khác) · 'switched' (tab khác đăng nhập tài khoản khác) → App.vue hiện hộp thoại
})
/* Phiên đăng nhập mất giữa chừng → KHÔNG để người dùng nhập tiếp rồi mới báo lỗi khi Lưu:
   · request bị 401 khi đang đăng nhập → báo ngay (trang giữ nguyên, dữ liệu đang nhập còn đó, đăng nhập lại ở tab mới rồi bấm Lưu lại)
   · quay lại tab sau ≥ 60 giây → hỏi máy chủ phiên còn không, mất thì báo trước khi người dùng kịp nhập */
const isAuthUrl = url => /^\/api\/(auth|session)\b/.test(url)
let lastSessionCheck = Date.now()
export async function checkSession(force = false) {
  if (!backend.enabled || backend.publicConfig?.openDemo || backend.user?.status !== 'active') return
  if (!force && Date.now() - lastSessionCheck < 60e3) return
  lastSessionCheck = Date.now()
  try {
    const r = await fetch('/api/session', { credentials: 'same-origin', headers: MODE_HEADERS })
    if (!r.ok) return
    const u = (await r.json())?.user
    backend.sessionLost = !u || u.status !== 'active' ? 'expired' : u.id !== backend.user.id ? 'switched' : ''
  } catch { /* mất mạng — để lần sau */ }
}
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkSession(!!backend.sessionLost) })
  window.addEventListener('focus', () => { if (backend.sessionLost) checkSession(true) })   // vừa đăng nhập lại ở tab khác → tự tắt hộp thoại
}

async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Client-Id': CLIENT_ID, ...MODE_HEADERS },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401 && !isAuthUrl(url) && backend.user?.status === 'active' && !backend.publicConfig?.openDemo) backend.sessionLost = 'expired'
  if (!res.ok) throw Object.assign(new Error(data.error || `Lỗi ${res.status}`), { status: res.status, code: data.code })
  return data
}
export const api = {
  get:  url => request('GET', url),
  put:  (url, body) => request('PUT', url, body),
  post: (url, body) => request('POST', url, body ?? {}),
  del:  url => request('DELETE', url),
}

/** 1 request: có máy chủ không + cấu hình công khai + người đang đăng nhập */
export async function detectBackend() {
  try {
    const r = await fetch('/api/session', { credentials: 'same-origin', headers: MODE_HEADERS })
    const d = r.ok ? await r.json() : null
    backend.enabled = d?.ok === true
    if (backend.enabled) { backend.publicConfig = d.publicConfig ?? {}; backend.user = d.user ?? null }
  } catch { backend.enabled = false }
  return backend.enabled
}

export async function fetchMe() {
  try { backend.user = (await api.get('/api/me')).user } catch { backend.user = null }
  return backend.user
}

export async function loginGoogle(credential, devEmail, invite) {
  backend.user = (await api.post('/api/auth/google', { credential, devEmail, invite })).user
  return backend.user
}
/* Email + mật khẩu */
export async function loginPassword(email, password, remember = true) {
  backend.user = (await api.post('/api/auth/login', { email, password, remember })).user
  return backend.user
}
/** Tự đăng ký (trang giới thiệu) → tài khoản chờ duyệt, đăng nhập luôn để thấy trang chờ */
export async function registerAccount(data) {
  backend.user = (await api.post('/api/auth/register', data)).user
  return backend.user
}
/** Hệ số chấm điểm đang áp dụng — công khai cho trang giới thiệu (không cần đăng nhập) */
export const fetchPublicRules = () => api.get('/api/public/rules')
/** Dự án (tên + mã) cho form đăng ký chọn — công khai */
export const fetchPublicProjects = () => api.get('/api/public/projects')
export const getSetupInfo  = token => api.get('/api/auth/setup?token=' + encodeURIComponent(token))
export async function setupPassword(token, password) {
  backend.user = (await api.post('/api/auth/setup', { token, password })).user
  return backend.user
}
export const forgotPassword = email => api.post('/api/auth/forgot', { email })
export const changePassword = (current, next) => api.post('/api/auth/password', { current, next })

export async function logout() {
  await api.post('/api/auth/logout').catch(() => {})
  backend.user = null
}

/** Nghe thay đổi realtime: máy chủ gửi đúng phần thay đổi mình được xem → onPatch(patch, isOwn)
    since = mốc dữ liệu của lần tải gần nhất (máy chủ gửi bù nếu có thay đổi xen giữa).

    DÙNG CHUNG 1 KẾT NỐI CHO MỌI TAB: trình duyệt chỉ cho ~6 kết nối HTTP/1.1 tới 1 địa chỉ — mỗi tab giữ 1 kết nối
    realtime thì mở 6 tab là hết chỗ, mọi request khác (tải phân hệ, lưu dữ liệu) phải xếp hàng → app đơ.
    → 1 tab “trưởng” giữ kết nối, chuyển tiếp sự kiện cho các tab khác qua BroadcastChannel; tab trưởng đóng → tab khác
    tự nhận (bầu chọn bằng localStorage, vì Web Locks chỉ chạy trên HTTPS / localhost). */
// Tab ẩn lâu bị trình duyệt hãm đồng hồ (~1 lần/phút) → tab đang ẩn chỉ nhận làm trưởng khi trưởng im > 90 giây (tránh tranh nhau)
const LEADER_KEY = 'pdpoint-sse-leader', BEAT = 2000, STALE = 5000, HIDDEN_STALE = 90000
const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('pdpoint-sse') : null
let es = null, onPatchFn = null, lastId = '', beatTimer = null, listening = false, retryMs = 2000
const readLeader = () => { try { return JSON.parse(localStorage.getItem(LEADER_KEY) || 'null') } catch { return null } }
const writeLeader = () => { try { localStorage.setItem(LEADER_KEY, JSON.stringify({ id: CLIENT_ID, ts: Date.now() })) } catch { /* bỏ qua */ } }
const isLeader = () => !!es

function openStream() {
  es?.close()
  const since = lastId
  es = new EventSource('/api/events?cid=' + CLIENT_ID + (since ? '&since=' + encodeURIComponent(since) : ''))
  // Mỗi lần (kết nối lại) — kể cả tự nối lại sau khi máy chủ khởi động lại / rớt mạng — báo đúng lần thao tác thật gần nhất,
  // để người đang vắng không bị tính lại “Đang hoạt động” chỉ vì kết nối mới
  es.onopen = () => { retryMs = 2000; reportPresence() }
  // Rớt mạng / máy chủ tắt: trình duyệt tự nối lại. Riêng khi máy chủ trả lỗi (502 / 503… lúc đang khởi động lại, proxy)
  // trình duyệt ĐÓNG HẲN kết nối (readyState 2) → tự mở lại, giãn dần 2s → 30s (không thì thành “Offline” tới khi tải lại trang)
  const cur = es
  es.onerror = () => {
    if (cur.readyState !== EventSource.CLOSED) return   // đang tự nối lại → để trình duyệt lo
    setTimeout(() => { if (es === cur && listening) openStream() }, retryMs + Math.random() * 1000)
    retryMs = Math.min(retryMs * 2, 30000)
  }
  es.onmessage = e => {
    if (e.lastEventId) lastId = e.lastEventId
    const d = JSON.parse(e.data || '{}')
    onPatchFn?.(d, d.by === CLIENT_ID)
    channel?.postMessage({ type: 'patch', d, id: lastId })
  }
}
function becomeLeader() { writeLeader(); openStream() }
function resign() { es?.close(); es = null }
// Nhịp kiểm tra: trưởng → gia hạn; tab khác → nhận làm trưởng nếu trưởng cũ im quá lâu (tab đã đóng / treo).
// localStorage đồng bộ giữa các tab có độ trễ → 2 tab có thể cùng nhận: tab có id nhỏ hơn giữ, tab kia nhường (không bao giờ cùng nhường)
function tick() {
  const l = readLeader(), fresh = l && Date.now() - l.ts < (document.visibilityState === 'visible' ? STALE : HIDDEN_STALE)
  if (isLeader()) {
    if (fresh && l.id !== CLIENT_ID && l.id < CLIENT_ID) resign()
    else writeLeader()
  } else if (l?.id === CLIENT_ID) {
    openStream()                                                          // khóa đang ghi tên mình mà chưa mở kết nối → mở
  } else if (!fresh) {
    writeLeader()
    setTimeout(() => { if (listening && readLeader()?.id === CLIENT_ID && !isLeader()) openStream() }, 150)   // ghi xong đọc lại
  }
}
channel?.addEventListener('message', ({ data: m }) => {
  if (!listening) return
  if (m.type === 'patch' && !isLeader()) { if (m.id) lastId = m.id; onPatchFn?.(m.d, m.d.by === CLIENT_ID) }
  else if (m.type === 'resign' && !isLeader()) tick()                       // trưởng vừa đóng tab → nhận ngay, khỏi chờ
  else if (m.type === 'activity') { lastActivityAt = Date.now(); if (isLeader()) sendPresence() }   // tab khác có thao tác → trưởng báo máy chủ
})
// Đóng / tải lại tab: trả khóa nếu khóa đang mang tên mình (kể cả vừa nhận mà chưa kịp mở kết nối) → tab khác nhận ngay
window.addEventListener('pagehide', () => {
  let mine = isLeader()
  try { if (readLeader()?.id === CLIENT_ID) { localStorage.removeItem(LEADER_KEY); mine = true } } catch { /* bỏ qua */ }
  resign()
  if (mine) channel?.postMessage({ type: 'resign' })
})

export function listenChanges(since, onPatch) {
  onPatchFn = onPatch; lastId = since || lastId; listening = true
  if (!channel) openStream()                                                 // trình duyệt cũ: mỗi tab 1 kết nối như trước
  else {
    resign()
    const l = readLeader()
    if (!l || l.id === CLIENT_ID || Date.now() - l.ts > STALE) becomeLeader()
    clearInterval(beatTimer); beatTimer = setInterval(tick, BEAT)
  }
  trackPresence(true)
}
export const stopListening = () => {
  listening = false; clearInterval(beatTimer)
  if (isLeader()) { try { if (readLeader()?.id === CLIENT_ID) localStorage.removeItem(LEADER_KEY) } catch { /* bỏ qua */ } channel?.postMessage({ type: 'resign' }) }
  resign(); trackPresence(false)
}

/** Trạng thái hoạt động: có thao tác thật (click, gõ phím, cuộn, di chuột, quay lại tab) → báo máy chủ,
    tối đa 1 lần / phút. Quá N phút không báo → máy chủ tính “Không hoạt động” (N đặt ở Cài đặt hệ thống).
    Báo theo kết nối realtime (của tab trưởng) → tab khác có thao tác thì nhờ tab trưởng báo hộ */
const PRESENCE_EVENTS = ['pointerdown', 'keydown', 'wheel', 'mousemove', 'touchstart', 'scroll']
const PRESENCE_EVERY = 60000
let presenceSent = 0, activitySent = 0
let lastActivityAt = Date.now()   // lần thao tác thật gần nhất (tab này hoặc tab khác báo qua kênh) — mở trang = vừa thao tác
const reportPresence = () => fetch('/api/presence', { method: 'POST', credentials: 'same-origin',
  headers: { 'X-Client-Id': CLIENT_ID, 'X-Idle-Ms': String(Math.max(0, Date.now() - lastActivityAt)) } }).catch(() => {})
function sendPresence() {
  if (Date.now() - presenceSent < PRESENCE_EVERY) return
  presenceSent = Date.now()
  reportPresence()
}
function onUserActivity() {
  if (document.visibilityState !== 'visible') return
  lastActivityAt = Date.now()
  if (isLeader() || !channel) sendPresence()
  else if (Date.now() - activitySent >= PRESENCE_EVERY / 2) { activitySent = Date.now(); channel.postMessage({ type: 'activity' }) }
}
function trackPresence(on) {
  const fn = on ? 'addEventListener' : 'removeEventListener'
  PRESENCE_EVENTS.forEach(t => window[fn](t, onUserActivity, { passive: true, capture: true }))
  document[fn]('visibilitychange', onUserActivity)
  if (on) presenceSent = Date.now()   // mở kết nối realtime = vừa hoạt động
}
