import { reactive, ref, computed, watch } from 'vue'
import { api, backend } from './api.js'
import { currentUser } from './db.js'

/* ═══ Chat nội bộ 1-1 — tin nhắn đến tức thì qua kênh realtime (patch.chat), danh bạ + trạng thái online làm mới 30 giây ═══ */
export const chat = reactive({
  open: false, peer: null,                    // khung chat đang mở · người đang nhắn
  contacts: [], states: {}, seen: {}, unread: {}, lastAt: {},   // seen: lần hoạt động gần nhất (ms) của từng người
  messages: {},                               // peerId → [tin nhắn, cũ → mới]
  more: {}, loading: false, sound: true,
  ann: { unread: 0, lastAt: '', last: null, audiences: [] },   // kênh “📢 Thông báo chung” (audiences: nhóm mình được gửi)
  previews: [],                               // thẻ xem trước tin mới dưới icon chat: { key, peer, from, name, text, ann, count, at }
})
/** Mã kênh thông báo chung (dùng như 1 “người” trong chat.peer / chat.messages) */
export const ANN = '__ann__'
/* Nhóm nhận thông báo chung — m.to có thể nhiều nhóm nối dấu phẩy ('__dept:BA,__role:PO') */
export const AUD_LABEL = { __all__: 'Tất cả', '__dept:PD': 'Bộ phận PD', '__dept:BA': 'Bộ phận BA', '__role:PO': 'PO', '__role:QA': 'QA' }
export const audienceLabel = to => String(to || '__all__').split(',').map(g => AUD_LABEL[g] ?? g).join(' + ')
export const totalUnread = computed(() => Object.values(chat.unread).reduce((a, n) => a + n, 0) + (chat.ann?.unread || 0))

export async function loadContacts() {
  if (!backend.enabled || !currentUser.value) return
  try { Object.assign(chat, await api.get('/api/chat/contacts')) } catch { return /* bỏ qua lần này */ }
  // Đang mở đúng cuộc trò chuyện → tin của người đó coi như đã đọc (không báo chưa đọc ở header)
  if (chat.open && chat.peer && (chat.peer === ANN ? chat.ann.unread : chat.unread[chat.peer]) && document.visibilityState === 'visible') markRead(chat.peer)
}
let timer = null
export function startChat() { if (timer) return; loadContacts(); timer = setInterval(loadContacts, 30000) }

const peerOf = m => (m.ann ? ANN : m.from === currentUser.value?.id ? m.to : m.from)
function upsert(m) {
  const k = peerOf(m), list = (chat.messages[k] ??= [])
  const i = list.findIndex(x => x.id === m.id)
  // Tin realtime không kèm “ai đã xem” → giữ phần đã có
  if (i >= 0) list[i] = m.seen || !list[i].seen ? m : { ...m, seen: list[i].seen }
  else { list.push(m); list.sort((a, b) => a.at.localeCompare(b.at)) }
  if (!chat.lastAt[k] || m.at > chat.lastAt[k]) chat.lastAt[k] = m.at
}

export async function openPeer(id) {
  chat.open = true; chat.peer = id
  stopBlink()
  if (!chat.messages[id]) {
    chat.loading = true
    try { const r = await api.get(`/api/chat/messages?with=${encodeURIComponent(id)}`); chat.messages[id] = r.messages; chat.more[id] = r.more }
    catch { chat.messages[id] = [] }
    finally { chat.loading = false }
  }
  markRead(id)
}
export async function loadOlder(id) {
  const first = chat.messages[id]?.[0]
  if (!first || !chat.more[id]) return
  const r = await api.get(`/api/chat/messages?with=${encodeURIComponent(id)}&before=${encodeURIComponent(first.at)}`)
  chat.messages[id] = [...r.messages, ...chat.messages[id]]; chat.more[id] = r.more
}
/* force: tin vừa đến lúc đang mở đúng cuộc trò chuyện — máy chưa đếm chưa đọc nhưng máy chủ vẫn đếm → vẫn phải báo đã đọc */
function markRead(id, force = false) {
  if (id === ANN) { if (!chat.ann.unread && !force) return; chat.ann.unread = 0; api.post('/api/chat/read', { with: ANN }).catch(() => {}); return }
  if (!chat.unread[id] && !force) return
  chat.unread[id] = 0
  api.post('/api/chat/read', { with: id }).catch(() => {})
}
/* Mặt cười gõ bằng chữ → emoji khi gửi (phía sau phải là khoảng trắng / hết câu — không đụng link, giờ “10:30”…) */
const EMOTICONS = [
  [":'(", '😢'], [':((', '😭'], [':))', '😂'], ['=))', '😆'], [':-)', '🙂'], [':-(', '🙁'], [':-D', '😄'], [';-)', '😉'],
  [':)', '🙂'], [':(', '🙁'], [':D', '😄'], [':d', '😄'], [';)', '😉'], [':P', '😛'], [':p', '😛'], [':O', '😮'], [':o', '😮'],
  [':*', '😘'], ['^^', '😊'], ['^_^', '😊'], ['-_-', '😑'], [':|', '😐'], ['<3', '❤️'], ['</3', '💔'], ['(y)', '👍'], ['(Y)', '👍'], ['B-)', '😎'], ['8-)', '😎'],
]
const escRe = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// Bắt đầu bằng dấu câu (:)) ;) =)) ^^…) → gõ dính chữ vẫn nhận (“ok:))”); bắt đầu bằng chữ / số (<3, (y), B-)…) → phải đứng riêng
const alt = list => [...list].sort((a, b) => b[0].length - a[0].length).map(([k]) => escRe(k)).join('|')
const PUNCT = EMOTICONS.filter(([k]) => /^[:;=^-]/.test(k)), WORDY = EMOTICONS.filter(([k]) => !/^[:;=^-]/.test(k))
const EMO_RE = new RegExp(`(^|\\s|)(${alt(PUNCT)})(?=\\s|$)|(^|\\s)(${alt(WORDY)})(?=\\s|$)`, 'g')
const EMO_MAP = Object.fromEntries(EMOTICONS)
export const emoticonsToEmoji = t => t.replace(EMO_RE, (_, p1, k1, p2, k2) => (p1 ?? p2 ?? '') + EMO_MAP[k1 ?? k2])

export async function sendMessage(text) {
  const to = chat.peer, t = emoticonsToEmoji(String(text ?? '').trim())
  if (!to || !t) return
  const { message } = await api.post('/api/chat/messages', { to, text: t })
  upsert(message)
}

/** Gửi thông báo chung cho 1 nhóm (Tất cả / Bộ phận PD / BA) */
/** Làm mới “ai đã xem” các thông báo chung đang hiện (người gửi / Quản trị) — gọi định kỳ khi đang mở kênh */
export async function refreshAnnSeen() {
  const list = chat.messages[ANN]; if (!list?.length) return
  const { messages } = await api.get(`/api/chat/messages?with=${ANN}`)
  for (const m of messages) { const i = list.findIndex(x => x.id === m.id); if (i >= 0 && m.seen) list[i] = { ...list[i], seen: m.seen } }
}
export async function sendAnnouncement(text, audience) {
  const t = emoticonsToEmoji(String(text ?? '').trim())
  if (!t) return
  const { message } = await api.post('/api/chat/announcements', { text: t, audience })
  upsert(message)
}

/** Gửi riêng từng người (1 lần → mỗi người 1 tin 1-1): { audience } hoặc { userIds } */
export async function sendBroadcast(text, target) {
  const t = emoticonsToEmoji(String(text ?? '').trim())
  if (!t) return 0
  const { messages, count } = await api.post('/api/chat/broadcast', { text: t, ...target })
  for (const m of messages ?? []) upsert(m)
  return count
}

/** Thả / đổi / bỏ cảm xúc cho 1 tin (mỗi người 1 emoji; chọn lại emoji đang thả → bỏ) */
export const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']
/** Thu hồi tin nhắn của mình */
export async function recallMessage(id) {
  const { message } = await api.post(`/api/chat/messages/${encodeURIComponent(id)}/recall`)
  upsert(message)
  if (message.ann && chat.ann.last && chat.ann.lastAt === message.at) chat.ann.last = { ...chat.ann.last, text: 'Tin nhắn đã được thu hồi' }
}
export async function reactMessage(id, emoji) {
  const { message } = await api.post(`/api/chat/messages/${encodeURIComponent(id)}/react`, { emoji })
  upsert(message)
}

/** Tin nhắn mới từ kênh realtime */
export function onChatPatch(list) {
  for (const m of list ?? []) {
    const isNew = !(chat.messages[peerOf(m)] ?? []).some(x => x.id === m.id)
    upsert(m)
    if (isNew && m.ann && m.from !== currentUser.value?.id) {   // thông báo chung mới
      chat.ann.lastAt = m.at; chat.ann.last = { from: m.from, text: m.recalled ? 'Tin nhắn đã được thu hồi' : m.text.slice(0, 80) }
      if (chat.open && chat.peer === ANN && document.visibilityState === 'visible') markRead(ANN, true)
      else { chat.ann.unread = (chat.ann.unread || 0) + 1; alertNewMessage(m) }
      continue
    }
    if (isNew && m.to === currentUser.value?.id && !m.readAt) {
      if (chat.open && chat.peer === m.from && document.visibilityState === 'visible') markRead(m.from, true)
      else { chat.unread[m.from] = (chat.unread[m.from] ?? 0) + 1; alertNewMessage(m) }
    }
  }
}

/* ═══ Báo tin mới (chạy được trên http): âm báo · tiêu đề tab nhấp nháy khi đang ở tab khác · icon chat rung (ChatPanel) ═══ */
const SOUND_KEY = 'pdpoint-chat-sound'
chat.sound = (() => { try { return localStorage.getItem(SOUND_KEY) !== '0' } catch { return true } })()
export function toggleSound() { chat.sound = !chat.sound; try { localStorage.setItem(SOUND_KEY, chat.sound ? '1' : '0') } catch { /* bỏ qua */ } if (chat.sound) beep() }
let audioCtx = null
function beep() {
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)()
    const t = audioCtx.currentTime
    ;[[880, 0], [1320, 0.12]].forEach(([f, d]) => {   // “ting-ting” ngắn, nhỏ
      const o = audioCtx.createOscillator(), g = audioCtx.createGain()
      o.type = 'sine'; o.frequency.value = f
      g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.12, t + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.25)
      o.connect(g).connect(audioCtx.destination); o.start(t + d); o.stop(t + d + 0.3)
    })
  } catch { /* trình duyệt chặn âm thanh khi chưa có thao tác → bỏ qua */ }
}
/* Tiêu đề tab nháy báo tin mới: xen kẽ “💬 Tên nhắn tin” ↔ tiêu đề thật của trang.
   realTitle = tiêu đề thật (tự cập nhật khi app đổi trang — MutationObserver), nên chuyển màn lúc đang nháy không bị lẫn.
   Tab đang ẩn → nháy tới khi quay lại tab · tab đang xem → nháy ~12 giây rồi tự dừng · mở đúng cuộc trò chuyện → dừng ngay. */
let blinkTimer = null, blinkStop = null, blinkText = '', realTitle = document.title
/** Số thông báo chuông chưa đọc (NotificationBell cập nhật) — cộng chung với tin chat chưa đọc vào “(n)” trên tiêu đề tab */
export const bellUnread = ref(0)
const titleCount = computed(() => totalUnread.value + bellUnread.value)
const titleEl = () => document.querySelector('title')
function watchTitle() {
  const el = titleEl(); if (!el) return
  new MutationObserver(() => {
    if (document.title === blinkText) return
    // App đổi tiêu đề khi chuyển trang → giữ số tin chưa đọc “(n) …” phía trước
    const n = titleCount.value, base = document.title.replace(/^\(\d+\)\s*/, ''), want = n ? `(${n}) ${base}` : base
    realTitle = want
    if (document.title !== want) document.title = want
  }).observe(el, { childList: true, characterData: true, subtree: true })
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchTitle, { once: true }); else watchTitle()
export function stopBlink() {
  clearInterval(blinkTimer); clearTimeout(blinkStop); blinkTimer = blinkStop = null
  if (blinkText && document.title === blinkText) document.title = realTitle
  blinkText = ''
}
/** Nháy tiêu đề tab — dùng chung cho tin chat và thông báo chuông */
export function blinkTitle(text) {
  stopBlink()
  blinkText = text
  let on = false
  const tick = () => { on = !on; document.title = on ? blinkText : realTitle }
  tick(); blinkTimer = setInterval(tick, 900)
  if (document.visibilityState === 'visible') blinkStop = setTimeout(stopBlink, 12000)   // đang xem tab → chỉ nháy ~12 giây
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && blinkTimer) blinkStop = setTimeout(stopBlink, 1500) })   // quay lại tab → nháy thêm chút rồi dừng
/* Thẻ xem trước tin mới (dưới icon chat): tối đa 3 thẻ, cùng người gửi gộp 1 thẻ (nội dung mới nhất + số tin), tự ẩn sau PREVIEW_MS
   — rê chuột vào thẻ thì giữ (ChatPanel gọi holdPreview / releasePreview) */
const PREVIEW_MS = 7000, previewTimers = new Map()
export function dismissPreview(key) { clearTimeout(previewTimers.get(key)); previewTimers.delete(key); chat.previews = chat.previews.filter(x => x.key !== key) }
export function holdPreview(key) { clearTimeout(previewTimers.get(key)) }
export function releasePreview(key) { clearTimeout(previewTimers.get(key)); previewTimers.set(key, setTimeout(() => dismissPreview(key), 3000)) }
function showPreview(m, name) {
  const peer = m.ann ? ANN : m.from, key = peer
  const old = chat.previews.find(x => x.key === key)
  const item = { key, peer, from: m.from, name, ann: !!m.ann, text: m.recalled ? 'Tin nhắn đã được thu hồi' : String(m.text || '').slice(0, 200), count: (old?.count ?? 0) + 1, at: m.at }
  chat.previews = [item, ...chat.previews.filter(x => x.key !== key)].slice(0, 3)
  clearTimeout(previewTimers.get(key)); previewTimers.set(key, setTimeout(() => dismissPreview(key), PREVIEW_MS))
}
function alertNewMessage(m) {
  const name = chat.contacts.find(c => c.id === m.from)?.name ?? 'Đồng nghiệp'
  if (!chat.open) showPreview(m, name)   // đang mở khung chat → đã thấy danh bạ / tin, không cần thẻ
  if (chat.sound) beep()
  blinkTitle(m.ann ? `📢 Thông báo từ ${name}` : `💬 ${name} nhắn tin`)
}

/* Số tin chat + thông báo chuông chưa đọc lên tiêu đề tab trình duyệt: “(2) Tổng quan | MISA Solution Point” */
watch(titleCount, n => {
  const base = realTitle.replace(/^\(\d+\)\s*/, ''), next = n ? `(${n}) ${base}` : base
  realTitle = next
  if (document.title !== blinkText) document.title = next
})
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && chat.open && chat.peer) markRead(chat.peer) })
