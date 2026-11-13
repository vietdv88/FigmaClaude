import { spawn } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadUser } from './auth.js'
import * as store from './store.js'
import { saveAvaImages } from './avaImages.js'

/* ═══ BẢN DÙNG THỬ — cùng cổng, cùng địa chỉ, chung code, chỉ khác database ═══
   App chính tự chạy 1 tiến trình con (OPEN_DEMO, SEED=demo, DB riêng) chỉ nghe 127.0.0.1:DEMO_PORT — bên ngoài không vào thẳng được.
   Bản dùng thử có ĐỊA CHỈ RIÊNG /dung-thu/… (trước đây bật bằng cookie chung cả trình duyệt → mở dùng thử ở 1 tab là mọi tab bản thật
   cũng bị chuyển sang demo, đang nhập dở bấm Lưu báo “chưa đăng nhập”). Giờ chỉ tab đang ở /dung-thu mới là bản dùng thử:
   · trang /dung-thu/… → bỏ tiền tố rồi chuyển sang tiến trình demo
   · request con (/api, /assets…) của trang /dung-thu: nhận ra qua header X-Pdp-Demo (app tự gửi) hoặc Referer — KHÔNG áp cho lượt chuyển trang (navigate)
   Bấm “Dùng thử” → /api/demo/enter → /dung-thu/ · “Dùng bản chính thức” → /api/demo/exit?next=… về bản thật. Phiên đăng nhập bản thật giữ nguyên.
   Dữ liệu demo tự làm mới lúc 2 giờ sáng (xóa DB → tiến trình con khởi động lại và nạp dữ liệu mẫu).
   Tắt: DEMO=0. Tiến trình con không gửi mail, không đăng nhập MISA ID / Google, không có API key AI. */

const here = path.dirname(fileURLToPath(import.meta.url))
export const DEMO_ENABLED = process.env.DEMO !== '0' && process.env.OPEN_DEMO !== '1'
const PORT = Number(process.env.DEMO_PORT || 8091)
const DIR = process.env.DEMO_DATA_DIR || path.resolve(here, '../data-demo')
const MODE_COOKIE = 'pdp_mode'
export const DEMO_ENTER = '/api/demo/enter', DEMO_EXIT = '/api/demo/exit', DEMO_BASE = '/dung-thu'

let child = null, ready = false, stopping = false, getAi = () => ({})

function start() {
  fs.mkdirSync(DIR, { recursive: true })
  ready = false
  // Môi trường tối thiểu, KHÔNG kế thừa biến của app chính (tránh mang theo SMTP, khóa bí mật…); biến rỗng chặn env.js nạp lại từ .env
  const env = {
    PATH: process.env.PATH, HOME: process.env.HOME, NODE_NO_WARNINGS: '1', NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: String(PORT), HOST: '127.0.0.1', DATA_DIR: DIR, SEED: 'demo', OPEN_DEMO: '1', DEMO: '0', MDS_DOCS: '0',
    SESSION_COOKIE: 'pdpoint_demo_sid', SESSION_SECRET: crypto.randomBytes(24).toString('hex'),
    APP_URL: process.env.APP_URL || '', OFFICIAL_URL: `${DEMO_EXIT}?next=/dang-nhap`, HOME_URL: `${DEMO_EXIT}?next=/`,
    SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '', SMTP_FROM: '', GOOGLE_CLIENT_ID: '', ADMIN_EMAILS: '',
    MISA_ID_CLIENT_ID: '', MISA_ID_CLIENT_SECRET: '', HTTPS_CERT: '', HTTPS_KEY: '', HTTPS_REDIRECT: '0',
    ARCHIVE_AFTER_MONTHS: '0', RETENTION_MONTHS: '0',
    // AVA trong bản dùng thử: dùng chung key của app chính (đọc lúc khởi động / làm mới mỗi đêm); tiến trình demo tự giới hạn lượt
    AI_API_KEY: getAi()?.apiKey || '', AI_MODEL: getAi()?.model || '',
  }
  // Bảo vệ hiệu năng bản thật: tiến trình demo giới hạn bộ nhớ 256 MB + độ ưu tiên CPU thấp (máy bận → bản thật được ưu tiên)
  child = spawn(process.execPath, ['--max-old-space-size=256', path.join(here, 'index.js')], { env, stdio: ['ignore', 'pipe', 'pipe'] })
  try { os.setPriority(child.pid, 15) } catch { /* không đổi được thì thôi */ }
  const log = buf => String(buf).split('\n').filter(Boolean).forEach(l => { console.log('[demo] ' + l); if (l.includes('Solution Point chạy tại')) ready = true })
  child.stdout.on('data', log); child.stderr.on('data', log)
  child.on('exit', code => {
    child = null; ready = false
    if (!stopping) { console.warn(`[demo] tiến trình dùng thử dừng (mã ${code}) — chạy lại sau 3 giây`); setTimeout(start, 3000).unref() }
  })
}

/** Làm mới dữ liệu: dừng tiến trình con → xóa DB → chạy lại (tự nạp dữ liệu mẫu, ngày dời theo tháng hiện tại) */
function reset() {
  const wipe = () => {
    for (const f of ['chamdiem.db', 'chamdiem.db-shm', 'chamdiem.db-wal']) fs.rmSync(path.join(DIR, f), { force: true })
    stopping = false; start(); console.log('[demo] đã làm mới dữ liệu dùng thử')
  }
  if (!child) return wipe()
  stopping = true
  child.once('exit', wipe)
  child.kill()
}
function scheduleNightly() {
  const now = new Date(), next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 2, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  setTimeout(() => { reset(); scheduleNightly() }, next - now).unref()
}

export function startDemo(aiGetter) {
  if (!DEMO_ENABLED) return
  if (aiGetter) getAi = aiGetter
  start(); scheduleNightly()
  process.on('exit', () => { stopping = true; child?.kill() })
  for (const sig of ['SIGTERM', 'SIGINT']) process.once(sig, () => { stopping = true; child?.kill(); process.exit(0) })
}

const cookieOf = (req, name) => (req.headers.cookie || '').split(/;\s*/).find(c => c.startsWith(name + '='))?.slice(name.length + 1) ?? ''
const pathDemo = p => p === DEMO_BASE || p.startsWith(DEMO_BASE + '/')
/** Request con của trang đang ở /dung-thu (fetch, ảnh, EventSource, file tĩnh) — lượt CHUYỂN TRANG thì không (bấm sang bản thật phải ra bản thật) */
function refDemo(req) {
  const mode = req.headers['sec-fetch-mode']
  if (mode === 'navigate' || (!mode && req.method === 'GET' && /text\/html/.test(req.headers.accept || ''))) return false
  if (req.headers['x-pdp-demo'] === '1') return true
  try { return pathDemo(new URL(String(req.headers.referer || ''), 'http://x').pathname) } catch { return false }
}

/* ── Ai đang dùng thử (Quản trị xem chung trong danh sách “đang hoạt động”) ──
   Mỗi trình duyệt 1 mã (cookie pdp_demo_id). Đã đăng nhập bản thật → biết là ai; chưa → “Khách N”.
   Đang mở = còn kết nối realtime; thao tác = tín hiệu /api/presence hoặc ghi dữ liệu; vai trò đang xem đọc từ phản hồi /api/session, /api/auth/switch. */
const ID_COOKIE = 'pdp_demo_id'
const visitors = new Map()   // id → { id, guestNo, userId, ua, ip, since, lastActive, lastSeen, streams, viewAs }
let guestSeq = 0, lastPrune = 0
/** Dọn khách đã rời (không còn kết nối realtime quá 2 phút) — tối đa 1 lần / phút, giữ tối đa 500 khách → bộ nhớ không phình */
function pruneVisitors(now) {
  if (now - lastPrune < 60e3 && visitors.size < 500) return
  lastPrune = now
  for (const v of visitors.values()) if (!v.streams && now - v.lastSeen > 120e3) visitors.delete(v.id)
  while (visitors.size > 500) visitors.delete(visitors.keys().next().value)
}
/* Mã lượt bên bản demo → mã lượt ghi ở bản thật (để ghi đánh giá 👍/👎 không phải quét cả lịch sử) — giữ tối đa 2000 */
const avaLogIds = new Map()
const ipOf = req => { const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim().replace(/^::ffff:/, ''); return ['::1', '127.0.0.1'].includes(ip) ? 'localhost' : ip }
function track(req) {
  const id = cookieOf(req, ID_COOKIE); if (!id) return null
  const now = Date.now()
  pruneVisitors(now)
  let v = visitors.get(id)
  if (!v) { v = { id, guestNo: ++guestSeq, since: now, lastActive: now, streams: 0, viewAs: null }; visitors.set(id, v) }
  loadUser(req, null, () => {})   // phiên bản thật (nếu có) → biết là ai
  Object.assign(v, { userId: req.user?.id || '', ua: String(req.headers['user-agent'] || ''), ip: ipOf(req), lastSeen: now })
  if (req.method !== 'GET' || req.path === '/api/presence') v.lastActive = now
  return v
}
/** Ghi lượt khách hỏi AVA (hoặc đánh giá) vào avaLogs của bản thật — đánh dấu demo: true, tên “Khách N” nếu chưa đăng nhập */
function logGuestAva(v, isAsk, status, reqBody, resBody) {
  const body = JSON.parse(reqBody || '{}'), out = JSON.parse(resBody || '{}')
  if (!isAsk) {   // đánh giá: tìm lượt tương ứng theo mã lượt bên bản demo
    if (!(status >= 200 && status < 300)) return
    const id = avaLogIds.get(String(body.logId ?? '')), log = id && store.get('avaLogs', id)
    if (log) store.put('avaLogs', { ...log, vote: out.vote ?? '', voteNote: out.note ?? '', votedAt: out.vote ? new Date().toISOString() : '' })
    return
  }
  const msgs = Array.isArray(body.messages) ? body.messages : []
  const question = String([...msgs].reverse().find(m => m?.role === 'user')?.text ?? '').trim().slice(0, 2000)
  if (!question) return
  const ok = status >= 200 && status < 300
  const id = 'ava_' + crypto.randomUUID()
  if (out.logId) { avaLogIds.set(String(out.logId), id); if (avaLogIds.size > 2000) avaLogIds.delete(avaLogIds.keys().next().value) }
  store.put('avaLogs', {
    id, at: new Date().toISOString(), demo: true,
    userId: v.userId || '', guest: v.userId ? '' : `Khách ${v.guestNo}`, ip: v.ip, ua: v.ua, viewAs: v.viewAs?.name ?? '',
    question, answer: String(ok ? out.text ?? '' : out.error ?? 'Lỗi').slice(0, 8000),
    status: !ok ? 'error' : out.refused ? 'refused' : 'answered', focus: ['PD', 'BA'].includes(body.focus) ? body.focus : '', childLogId: out.logId ?? '',
    ...(() => { const files = saveAvaImages(id, msgs.at(-1)?.images); return files.length ? { images: files.length, imageFiles: files } : {} })(),
  })
}
/** Danh sách người đang dùng thử — bỏ người đã đóng (không còn kết nối realtime quá 2 phút) */
export function demoVisitors(idleMs) {
  const now = Date.now(), out = []
  for (const v of visitors.values()) {
    if (!v.streams && now - v.lastSeen > 120e3) { visitors.delete(v.id); continue }
    out.push({ id: v.id, guest: v.userId ? '' : `Khách ${v.guestNo}`, userId: v.userId, ua: v.ua, ip: v.ip, since: v.since, lastActive: v.lastActive,
      idle: now - v.lastActive > idleMs, viewAs: v.viewAs })
  }
  return out.sort((a, b) => a.since - b.since)
}

/** Đặt TRƯỚC mọi middleware khác (chưa đọc body): vào / thoát bản dùng thử + chuyển tiếp request của trình duyệt đang dùng thử */
export function demoProxy(req, res, next) {
  if (!DEMO_ENABLED) return pathDemo(req.path) ? res.redirect('/') : next()
  if (cookieOf(req, MODE_COOKIE)) res.clearCookie(MODE_COOKIE, { path: '/' })   // cookie chế độ cũ (bật demo cho cả trình duyệt) → xóa
  if (req.path === DEMO_ENTER) {
    if (!cookieOf(req, ID_COOKIE)) res.cookie(ID_COOKIE, crypto.randomBytes(8).toString('hex'), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 30 * 86400e3 })
    return res.redirect(DEMO_BASE + '/')
  }
  if (req.path === DEMO_EXIT) {   // ?next=/dang-nhap → về thẳng trang đăng nhập bản thật (chỉ nhận đường dẫn nội bộ)
    const nx = String(req.query.next || '/')
    visitors.delete(cookieOf(req, ID_COOKIE))
    return res.redirect(/^\/(?!\/)/.test(nx) && !pathDemo(nx) ? nx : '/')
  }
  const byPath = pathDemo(req.path)
  if (!byPath && !refDemo(req)) return next()
  // /dung-thu/abc?x → /abc?x cho tiến trình demo (tiến trình demo chạy ở gốc “/”)
  let upPath = req.originalUrl
  if (byPath) { upPath = upPath.slice(DEMO_BASE.length); if (!upPath.startsWith('/')) upPath = '/' + upPath }
  if (!ready) {
    res.status(503).set('Retry-After', '3').type('html')
    return res.send(`<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="3"><title>Bản dùng thử</title>
      <body style="font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;color:#344054">
      <div style="text-align:center"><p>Bản dùng thử đang khởi động, tự tải lại sau vài giây…</p><a href="${DEMO_EXIT}">Về bản chính thức</a></div>`)
  }
  const v = track(req)
  const stream = req.path === '/api/events'
  if (v && stream) { v.streams++; res.on('close', () => { v.streams = Math.max(0, v.streams - 1); v.lastSeen = Date.now() }) }
  const peek = v && ['/api/session', '/api/auth/switch', '/api/me'].includes(req.path)   // đọc người đang xem trong demo (phản hồi JSON nhỏ)
  // Khách hỏi AVA → ghi vào Lịch sử hỏi AVA của bản thật (Quản trị xem); đánh giá 👍/👎 của khách cũng ghi theo
  const avaAsk = v && req.method === 'POST' && req.path === '/api/ai/ava'
  const avaRate = v && req.method === 'POST' && req.path === '/api/ai/ava/feedback'
  const reqChunks = []
  if (avaAsk || avaRate) req.on('data', c => { if (reqChunks.length < 400) reqChunks.push(c) })
  // x-forwarded-for = IP thật của kết nối (không tin header trình duyệt tự gửi) → tiến trình demo giới hạn lượt AI theo IP
  const up = http.request({ host: '127.0.0.1', port: PORT, method: req.method, path: upPath,
    headers: { ...req.headers, 'x-forwarded-proto': req.secure ? 'https' : 'http', 'x-forwarded-for': String(req.socket.remoteAddress || '').replace(/^::ffff:/, ''), ...(peek || avaAsk || avaRate ? { 'accept-encoding': 'identity' } : {}) } }, r => {
    // Tiến trình demo chuyển hướng tới đường dẫn nội bộ → giữ trong /dung-thu (trừ lối ra bản chính thức /api/demo/…)
    const loc = r.headers.location
    if (loc && /^\/(?!\/)/.test(loc) && !loc.startsWith('/api/demo/') && !pathDemo(loc)) r.headers.location = DEMO_BASE + loc
    res.writeHead(r.statusCode ?? 502, r.headers)
    if (peek && !/gzip|br|deflate/.test(String(r.headers['content-encoding'] || ''))) {
      const chunks = []
      r.on('data', c => chunks.push(c))
      r.on('end', () => { try { const u = JSON.parse(Buffer.concat(chunks).toString()).user; if (u?.name) v.viewAs = { name: u.name, role: u.role } } catch { /* bỏ qua */ } })
    }
    if ((avaAsk || avaRate) && !/gzip|br|deflate/.test(String(r.headers['content-encoding'] || ''))) {
      const chunks = []
      r.on('data', c => chunks.push(c))
      r.on('end', () => { try { logGuestAva(v, avaAsk, r.statusCode, Buffer.concat(reqChunks).toString(), Buffer.concat(chunks).toString()) } catch { /* bỏ qua */ } })
    }
    r.pipe(res)
  })
  up.on('error', () => { if (!res.headersSent) res.status(502).send('Bản dùng thử tạm thời không phản hồi — thử lại sau ít phút.'); else res.end() })
  req.on('aborted', () => up.destroy())
  res.on('close', () => up.destroy())   // trình duyệt đóng luồng realtime (SSE) → đóng luôn kết nối tới tiến trình demo
  req.pipe(up)
}
