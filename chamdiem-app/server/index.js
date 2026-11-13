import './env.js'   // nạp .env trước mọi module khác
import express from 'express'
import compression from 'compression'
import { precompressed } from './precompressed.js'
import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import * as store from './store.js'
import { seedIfEmpty } from './seed.js'
import { mergeHistoryEntry, overflowIds, compactHistory } from '../src/store/historyMerge.js'
import { achievementsOf } from '../src/store/achievements.js'
import { demoProxy, startDemo, demoVisitors, DEMO_ENABLED, DEMO_ENTER } from './demo.js'
import { scheduleRetention, archiveOld, restoreArchive } from './retention.js'
import { userUsage, usageMessage } from '../src/store/userUsage.js'
import { notify, notifyPendingUser, notifyTaskChange, notifyTasksImported, notifyTaskDeleted, resolveNotifications, purgeNotifications, ACTIVITY } from './notify.js'
import { GOOGLE_CLIENT_ID, findByLogin, registerUser, DEV_LOGIN, OPEN_DEMO, loadUser, requireActive, loginWithGoogle, setSession, clearSession, ADMIN_EMAILS, sessionSecret,
  publicUser, loginWithPassword, issueSetupToken, userByToken, setPasswordByToken, checkPasswordRule, verifyPassword, hashPassword, MIN_PASSWORD } from './auth.js'
import { misaEnabled, startLogin, finishLogin, loginWithMisa } from './misaid.js'
import { mailEnabled, sendInvite, sendTest, mailInfo, sendPasswordLink } from './mail.js'
import {
  BadRequest, deny, isAdmin, deptAdminOf, isMember, canManage, projectRole, canCreateProject, isLocked,
  visibleProjectIds, checkTaskWrite, canSeeTask, canClosePd, canReopenPd, closingFor, fullViewOf, isManagerOf,
  baClosingFor, canCloseBa, isLeadOf,
} from './rules.js'
import { viewOf, summariesFor, pdProjectsFor, closingFor as closingView, monthFor, userFor } from './view.js'
import { hasAnalysis, hasDesign } from '../src/store/scoring.js'
import { DEFAULT_CONFIG, DEFAULT_DIVISIONS, deptOfRole, buildClosing, buildBaClosing, closingParams, pdProjectsOf, managerIdsOf, primaryProjectIdsOf, workingDaysOf } from '../src/store/scoring.js'
import { extractTasksWithGemini, DEFAULT_AI_MODEL } from '../src/store/aiExtract.js'
import { suggestComplexityWithGemini } from '../src/store/aiComplexity.js'
import { askAvaWithGemini, cleanImages, avaKnowledgeStamp } from '../src/store/aiAva.js'
import { qSig, qSim, isDeictic, isPersonal } from './avaReuse.js'
import { saveAvaImages, avaImagePath, purgeAvaImages } from './avaImages.js'
import { createAvaRepeat, createAvaSimilar, createAvaPace, REPEAT_NOTE, STOP_TEXT, PENDING_TEXT, SIMILAR_NOTE, SPAM_TEXT } from './avaRepeat.js'
import { sheetCsvUrl, sheetIdOf, planIteration, applySync, addMembers, planView, planProject, applyProject, projectPlanView, SYNC_MODES } from './sheetSync.js'

/* ═══════════════════════════════════════════════════════════════════════════
   Solution Point — máy chủ API + phục vụ giao diện (1 container)
   ENV: PORT, APP_URL, GOOGLE_CLIENT_ID, SESSION_SECRET, ADMIN_EMAILS, DATA_DIR, SEED, SMTP_*
   ═══════════════════════════════════════════════════════════════════════════ */

const here    = path.dirname(fileURLToPath(import.meta.url))
const PORT    = Number(process.env.PORT || 8080)
const APP_URL = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, '')
const SECURE  = APP_URL.startsWith('https://')
/* Địa chỉ trong link gửi email (mời / đặt lại mật khẩu) = địa chỉ đang mở app → máy nào chạy thì link trỏ về máy đó.
   Chỉ nhận địa chỉ hợp lệ của app (APP_URL, APP_HOSTS, localhost) — chặn giả mạo Host để lấy mã đặt mật khẩu; khác thì dùng APP_URL. */
const ALLOWED_HOSTS = new Set([new URL(APP_URL).host, `localhost:${PORT}`, `127.0.0.1:${PORT}`,
  ...String(process.env.APP_HOSTS || '').split(',').map(s => s.trim()).filter(Boolean)])
function linkBase(req) {
  const host = String(req.get('host') || '').toLowerCase()
  if (!ALLOWED_HOSTS.has(host)) return APP_URL
  const proto = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http'
  return `${proto}://${host}`
}
const DIST    = path.resolve(here, '../dist')

seedIfEmpty()
/* Một lần: việc còn trống “Là dự án phụ trách” mà đã có PD → tự điền theo dự án phụ trách của PD (như đồng bộ Sheet).
   Chi tiết công việc giờ là checkbox — không còn trạng thái “chưa chọn”. Tháng đã chốt dùng bản chụp nên không đổi. */
/* Một lần: gộp lại lịch sử điểm cũ theo quy tắc mới (đỡ tốn dung lượng) */
if (!store.get('settings', 'mig-history-compact')) {
  const byTask = new Map()
  for (const h of store.all('history')) (byTask.get(h.taskId) ?? byTask.set(h.taskId, []).get(h.taskId)).push(h)
  let removed = 0, updated = 0
  store.tx(() => {
    for (const list of byTask.values()) {
      const keep = compactHistory(list), keepIds = new Map(keep.map(h => [h.id, h]))
      for (const h of list) {
        if (!keepIds.has(h.id)) { store.del('history', h.id); removed++ }
        else if (keepIds.get(h.id) !== h) { store.put('history', keepIds.get(h.id)); updated++ }
      }
    }
    store.put('settings', { id: 'mig-history-compact', at: new Date().toISOString(), removed, updated })
  })
  if (removed) console.log(`🗜️  Gộp lịch sử điểm: bỏ ${removed} dòng, cập nhật ${updated} dòng`)
}
if (!store.get('settings', 'mig-own-project')) {
  const users = new Map(store.all('users').map(u => [u.id, u]))
  const fill = store.all('tasks').filter(t => !t.isOwnProject && t.pdId && users.has(t.pdId))
  store.tx(() => {
    for (const t of fill) store.put('tasks', { ...t, isOwnProject: primaryProjectIdsOf(users.get(t.pdId)).includes(t.projectId) ? 'Có' : 'Không' })
    store.put('settings', { id: 'mig-own-project', at: new Date().toISOString(), count: fill.length })
  })
  if (fill.length) console.log(`✓ Tự điền “Là dự án phụ trách” cho ${fill.length} công việc còn trống`)
}

const app = express()
app.set('trust proxy', true)
// Nén gzip mọi phản hồi (JS/CSS/JSON) — trừ kênh realtime SSE
/* Tài liệu MISA Design System (/ds, /api/ds) — code + dữ liệu riêng ở mds-docs, chỉ dùng chung cổng / tên miền.
   Gắn TRƯỚC bản dùng thử để ai cũng đọc được; lỗi bên tài liệu không làm dừng app chấm điểm. Tắt: MDS_DOCS=0 */
if (process.env.MDS_DOCS !== '0') {
  try {
    const docsDir = process.env.MDS_DOCS_DIR || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../mds-docs')
    const { mountDocs } = await import(pathToFileURL(path.join(docsDir, 'server/docs.js')).href)
    mountDocs(app, { express, loadUser, compress: compression(), users: () => store.all('users'), ai: () => aiSettings() })   // AVA tài liệu dùng chung khóa AI
  } catch (e) { console.warn('ℹ️  Chưa bật tài liệu Design System (/ds):', e.message) }
}
app.use(demoProxy)   // bản dùng thử: chuyển tiếp trình duyệt đang dùng thử sang tiến trình demo (trước khi đọc body / nén)
app.use(compression({ filter: (req, res) => req.path !== '/api/events' && compression.filter(req, res) }))
app.use(express.json({ limit: '12mb' }))   // ảnh chụp gửi AI bóc tách
app.use(loadUser)
/* Lần THAO TÁC gần nhất của từng người (trong bộ nhớ — khởi động lại máy chủ thì tính lại từ lần đăng nhập).
   Chỉ tính thao tác thật: tín hiệu /api/presence (click, gõ phím, cuộn…) + mọi lần ghi dữ liệu — không tính tải ngầm / realtime */
const lastSeen = new Map()   // userId → ms
app.use((req, _res, next) => { if (req.user && req.method !== 'GET' && req.path !== '/api/presence') lastSeen.set(req.user.id, Date.now()); next() })   // /api/presence tự ghi (có trừ thời gian vắng)

const ok  = (res, data = {}) => res.json({ ok: true, ...data })
const uid = p => p + crypto.randomUUID()
/** Bọc handler: bắt lỗi quyền / dữ liệu → JSON lỗi */
const h = fn => async (req, res) => {
  try { await fn(req, res) }
  catch (e) { res.status(e.status || 500).json({ error: e.message || 'Lỗi máy chủ', ...(e.code ? { code: e.code } : {}) }); if (!e.status) console.error(e) }
}

/* ── Realtime (Server-Sent Events) ──
   Mỗi máy đang mở app giữ 1 kết nối. Có thay đổi → máy chủ gửi cho TỪNG người đúng phần thay đổi họ được xem
   (công việc, vòng lặp, bản chốt, tổng điểm…) — người khác không phải tải lại toàn bộ dữ liệu.
   Chỉ khi đổi dự án / vai trò / hệ số (hiếm, ảnh hưởng quyền xem hoặc mọi điểm) mới báo tải lại. */
const clients = new Map()   // res → { userId, seq }
const BOOT = crypto.randomUUID().slice(0, 8)   // mốc dữ liệu kèm mã lần khởi động: máy chủ khởi động lại → máy đang mở tải lại
const stamp = () => `${BOOT}:${store.currentSeq()}`
const RELOAD_KINDS = new Set(['projects', 'config', 'catalog'])
const ymOf = d => d?.completedDate?.slice(0, 7)
function patchFor(user, changes) {
  const v = viewOf(user)
  const put = {}, del = {}, pairs = new Map(), months = {}
  let chat = null
  const add = (k, x) => (put[k] ??= []).push(x)
  const rm = (k, x) => (del[k] ??= []).push(x)
  const pair = (ym, pd) => { if (ym && pd) pairs.set(ym + '|' + pd, [ym, pd]) }
  let notes = null
  for (const { kind, id, prev, next } of changes) {
    if (RELOAD_KINDS.has(kind)) return { reload: true }
    if (kind === 'notifications') { if (next && next.userId === user.id) (notes ??= []).push(next); continue }
    // Người tự đăng ký (mới tạo / bị xóa khi còn chờ duyệt) → chỉ Quản trị cần thấy, không bắt mọi máy tải lại
    if (kind === 'users' && ((!prev && next?.status === 'pending') || (prev?.status === 'pending' && !next))) {
      if (v.admin) { if (next) add('users', userFor(v, next)); else rm('users', id) }
      continue
    }
    if (kind === 'users') {
      // Đổi vai trò / quản lý trực tiếp / trạng thái → quyền xem thay đổi → tải lại
      const rel = x => JSON.stringify([x?.role, x?.status, x?.deptAdmin ?? '', managerIdsOf(x ?? {})])
      if (rel(prev) !== rel(next)) return { reload: true }
      if (next) add('users', userFor(v, next)); else rm('users', id)
    } else if (kind === 'tasks') {
      if (next && v.seeTask(next)) add('tasks', next)
      else if (prev && v.seeTask(prev)) rm('tasks', id)
      pair(ymOf(prev), prev?.pdId); pair(ymOf(next), next?.pdId)
    } else if (kind === 'iterations') {
      if (next && (v.admin || v.memberPids.has(next.projectId))) add('iterations', next)
      else if (prev) rm('iterations', id)
    } else if (kind === 'history') {
      if (next && (v.admin || v.memberPids.has(next.projectId))) add('history', next)
      else if (!next) rm('history', id)   // dòng bị gộp / bỏ (kind lạnh không có bản cũ — chỉ gửi mã)
    } else if (kind === 'closings') {
      const c = next ?? prev
      if (!c.pdId) return { reload: true }                       // bản chốt cả tháng kiểu cũ
      const shown = next && closingView(v, next)
      if (shown) add('closings', shown); else rm('closings', { month: c.month, pdId: c.pdId })
      pair(c.month, c.pdId)
    } else if (kind === 'baClosings') {
      const c = next ?? prev
      const shown = v.baAll || c.baId === user.id || v.managed.has(c.baId) || (c.items ?? []).some(i => v.realPids.has(i.projectId))
      if (next && shown) add('baClosings', next); else if (!next) rm('baClosings', id)
    } else if (kind === 'months') {
      if (next) { const { id: ym, ...rest } = monthFor(v, next); months[ym] = rest }
    } else if (kind === 'messages') {
      // Chat nội bộ: chỉ người gửi + người nhận
      if (next && (next.ann ? annVisible(user, next) : (next.from === user.id || next.to === user.id))) (chat ??= []).push(next)
    }
  }
  const out = {}
  if (chat) out.chat = chat
  if (notes) out.notifications = notes
  if (Object.keys(put).length) out.put = put
  if (Object.keys(del).length) out.del = del
  if (Object.keys(months).length) out.months = months
  if (pairs.size) { const sm = summariesFor(v, [...pairs.values()]); if (Object.keys(sm).length) out.summaries = sm }
  return Object.keys(out).length ? out : null
}
function broadcast(req) {
  const by = req.get('x-client-id') || '', seq = store.currentSeq()
  for (const [res, c] of clients) {
    if (c.seq >= seq) continue
    const changes = store.changesSince(c.seq)
    const user = store.get('users', c.userId)
    c.seq = seq
    if (!user || user.status !== 'active') { res.end(); clients.delete(res); continue }
    const patch = changes ? patchFor(user, changes) : { reload: true }
    if (patch) res.write(`id: ${BOOT}:${seq}\ndata: ${JSON.stringify({ by, ...patch })}\n\n`)
  }
}
app.get('/api/events', requireActive, (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' })
  res.flushHeaders()
  res.write('retry: 5000\n\n')
  // Mốc dữ liệu máy này đang có: lần đầu = seq của bootstrap; kết nối lại = id sự kiện cuối trình duyệt đã nhận
  const [boot, n] = String(req.get('last-event-id') ?? req.query.since ?? '').split(':')
  const c = { userId: req.user.id, cid: String(req.query.cid || ''), seq: store.currentSeq(), since: Date.now(), lastActive: Date.now(), ip: String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim().replace(/^::ffff:/, ''), ua: req.get('user-agent') || '' }
  clients.set(res, c)
  if (boot !== BOOT || !Number.isFinite(Number(n)) || Number(n) > c.seq) res.write(`id: ${stamp()}\ndata: ${JSON.stringify({ reload: true })}\n\n`)
  else if (Number(n) < c.seq) { c.seq = Number(n); broadcast(req) }   // bỏ lỡ thay đổi lúc mất kết nối → gửi bù ngay
  const ping = setInterval(() => res.write(': ping\n\n'), 25000)
  req.on('close', () => { clearInterval(ping); clients.delete(res) })
})
const changed = (req, res, data) => { broadcast(req); ok(res, data) }

/* ═══ Công khai ═══ */
app.get('/api/health', (_req, res) => res.json({ ok: true }))
/* Cài đặt AI (Google AI Studio) — key CHỈ nằm trên máy chủ, không gửi xuống trình duyệt */
// Bản dùng thử: chưa cấu hình trong DB demo → dùng key app chính truyền qua biến môi trường (chỉ nội bộ máy chủ)
const aiSettings = () => store.get('settings', 'ai') ?? { id: 'ai', apiKey: process.env.AI_API_KEY || '', model: process.env.AI_MODEL || DEFAULT_AI_MODEL }
const publicConfig = () => ({ googleClientId: GOOGLE_CLIENT_ID, misaLogin: misaEnabled(), openDemo: OPEN_DEMO, demoUrl: OPEN_DEMO ? '' : DEMO_ENABLED ? DEMO_ENTER : (process.env.DEMO_URL || ''), officialUrl: OPEN_DEMO ? (process.env.OFFICIAL_URL || '') : '', homeUrl: OPEN_DEMO ? (process.env.HOME_URL || '') : '', mailEnabled, devLogin: DEV_LOGIN, aiEnabled: !!aiSettings().apiKey, selfRegister: true })
app.get('/api/public-config', (_req, res) => res.json(publicConfig()))
/** Khởi động app: 1 request trả về cấu hình công khai + người đăng nhập (thay cho health + public-config + me) */
/* Trang giới thiệu (công khai, không cần đăng nhập): hệ số chấm điểm PD / BA đang áp dụng để hiện quy tắc + chấm thử */
/* Danh sách dự án (chỉ tên + mã) cho form tự đăng ký chọn “Dự án” — không bắt buộc, để Quản trị phân quyền nhanh */
// Logo trả qua link riêng (ảnh nhúng có thể lớn) — ?v= theo độ dài + đuôi data URL để trình duyệt cache, đổi logo thì đổi link
const logoVer = l => l.length.toString(36) + l.slice(-8).replace(/[^\w]/g, '')
app.get('/api/public/projects', (_req, res) => res.json({ ok: true, projects: store.all('projects').filter(p => !p.archived)
  .map(p => ({ id: p.id, name: p.name, code: p.code || '', logo: p.logo ? `/api/public/project-logo/${encodeURIComponent(p.id)}?v=${logoVer(p.logo)}` : '' })) }))
app.get('/api/public/project-logo/:id', (req, res) => {
  const m = /^data:(image\/(?:png|jpeg|webp|svg\+xml));base64,(.+)$/.exec(store.get('projects', req.params.id)?.logo || '')
  if (!m) return res.status(404).end()
  res.set({ 'Content-Type': m[1], 'Cache-Control': 'public, max-age=604800', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'", 'X-Content-Type-Options': 'nosniff' })
  res.send(Buffer.from(m[2], 'base64'))
})
app.get('/api/public/rules', (_req, res) => res.json({ ok: true, config: store.getConfig() }))
app.get('/api/session', (req, res) => res.json({ ok: true, publicConfig: publicConfig(), user: publicUser(req.user) ?? null }))

/* ═══ Đăng nhập ═══ */
app.post('/api/auth/google', h(async (req, res) => {
  const u = await loginWithGoogle(req.body?.credential, req.body?.devEmail, req.body?.invite)
  setSession(res, u.id, SECURE)
  broadcast(req)   // người mới chờ duyệt / người được mời vừa nhận lời → cập nhật màn Người dùng của Quản trị
  ok(res, { user: publicUser(u) })
}))

/* ── Email + mật khẩu ── */
const clientIp = req => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim()
app.post('/api/auth/login', h((req, res) => {
  const u = loginWithPassword(req.body?.email, req.body?.password, clientIp(req))
  setSession(res, u.id, SECURE, req.body?.remember !== false)   // bỏ “Ghi nhớ đăng nhập” → đóng trình duyệt là đăng xuất
  ok(res, { user: publicUser(u) })
}))
/* ── Tự đăng ký (trang giới thiệu) → chờ duyệt: đăng nhập luôn để thấy trang chờ; báo Quản trị qua quả chuông ── */
app.post('/api/auth/register', h((req, res) => {
  const u = registerUser(req.body, clientIp(req))
  notifyPendingUser(u)
  setSession(res, u.id, SECURE)
  changed(req, res, { user: publicUser(u) })
}))
/** Mở link đặt mật khẩu: kiểm tra mã còn hạn → email, tên, mục đích (invite | reset) */
app.get('/api/auth/setup', h((req, res) => {
  const u = userByToken(req.query.token)
  ok(res, { email: u.email, name: u.name, purpose: u.setupPurpose, minLength: MIN_PASSWORD })
}))
app.post('/api/auth/setup', h((req, res) => {
  const u = setPasswordByToken(req.body?.token, req.body?.password)
  setSession(res, u.id, SECURE)
  broadcast(req)   // người được mời vừa kích hoạt → màn Người dùng của Quản trị cập nhật
  ok(res, { user: publicUser(u) })
}))
/** Quên mật khẩu: luôn trả lời giống nhau (không lộ email nào có trong hệ thống) */
app.post('/api/auth/forgot', h(async (req, res) => {
  // Quên mật khẩu: nhập mã nhân viên hoặc Gmail → gửi link về Gmail của người đó
  const found = findByLogin(req.body?.email)
  const u = found && found.email && ['active', 'invited', 'none'].includes(found.status) ? found : null
  if (u && mailEnabled) {
    const token = issueSetupToken(u, u.status === 'active' ? 'reset' : 'invite')
    await sendPasswordLink({ to: u.email, name: u.name, link: `${linkBase(req)}/dat-mat-khau?token=${token}`, purpose: u.status === 'active' ? 'reset' : 'invite' }).catch(e => console.error('Gửi email đặt lại mật khẩu lỗi:', e.message))
  }
  ok(res, { mailEnabled })
}))
/* Lựa chọn cá nhân lưu trên máy chủ theo tài khoản — VD dự án yêu thích (trước lưu ở trình duyệt: đổi http/https/IP
   hay Safari tự xóa sau ~7 ngày không vào là mất). Chỉ nhận các khóa đã biết. */
app.put('/api/me/prefs', requireActive, h((req, res) => {
  const b = req.body ?? {}, prefs = { ...(store.get('users', req.user.id).prefs ?? {}) }
  if ('favProjects' in b) {
    if (!Array.isArray(b.favProjects)) throw new BadRequest('favProjects phải là danh sách')
    prefs.favProjects = [...new Set(b.favProjects.map(String))].filter(id => store.get('projects', id)).slice(0, 50)
  }
  // Thiết lập cột từng bảng (thứ tự, ẩn / hiện, xuống dòng) theo TÀI KHOẢN: { cols: { <bảng>: { cols: [{ key, visible }], wraps: { key: bool } } | null } } — null = về mặc định
  if (b.cols && typeof b.cols === 'object') {
    const cols = { ...(prefs.cols ?? {}) }
    for (const [table, v] of Object.entries(b.cols)) {
      if (!/^[\w-]{1,40}$/.test(table)) continue
      if (v == null) { delete cols[table]; continue }
      const list = (Array.isArray(v.cols) ? v.cols : []).slice(0, 80)
        .filter(c => c && typeof c.key === 'string' && c.key.length <= 40).map(c => ({ key: c.key, visible: !!c.visible }))
      const wraps = Object.fromEntries(Object.entries(v.wraps ?? {}).slice(0, 80).filter(([k]) => k.length <= 40).map(([k, w]) => [k, !!w]))
      const widths = Object.fromEntries(Object.entries(v.widths ?? {}).slice(0, 80).filter(([k, w]) => k.length <= 40 && Number.isFinite(Number(w))).map(([k, w]) => [k, Math.max(60, Math.min(1200, Math.round(Number(w))))]))
      cols[table] = { cols: list, wraps, widths }
    }
    if (Object.keys(cols).length > 40) throw new BadRequest('Quá nhiều bảng')
    prefs.cols = cols
  }
  // Số dòng/trang chọn gần nhất (mọi danh sách): { pageSize: 20 }
  if ('pageSize' in b) {
    const n = Math.round(Number(b.pageSize))
    if (!Number.isFinite(n) || n < 5 || n > 500) throw new BadRequest('Số dòng/trang không hợp lệ')
    prefs.pageSize = n
  }
  // Độ rộng cột của các bảng khác (kho chung DataTable): { tableWidths: { <khóa bảng>: { colKey: px } | null } }
  if (b.tableWidths && typeof b.tableWidths === 'object') {
    const tw = { ...(prefs.tableWidths ?? {}) }
    for (const [key, v] of Object.entries(b.tableWidths)) {
      if (typeof key !== 'string' || key.length > 600) continue
      if (v == null) { delete tw[key]; continue }
      const m = Object.fromEntries(Object.entries(v).slice(0, 80).filter(([k, w]) => k.length <= 40 && Number.isFinite(Number(w))).map(([k, w]) => [k, Math.max(60, Math.min(1200, Math.round(Number(w))))]))
      if (Object.keys(m).length) tw[key] = m; else delete tw[key]
    }
    const keys = Object.keys(tw); for (const k of keys.slice(0, Math.max(0, keys.length - 80))) delete tw[k]   // giữ tối đa 80 bảng gần nhất
    prefs.tableWidths = tw
  }
  const u = { ...store.get('users', req.user.id), prefs }
  store.put('users', u)
  changed(req, res, { prefs })
}))
/** Ảnh đại diện: người dùng tự cập nhật (ảnh đã cắt vuông trên máy) — PNG / JPG / WebP, tối đa 500 KB; '' = xóa */
const MAX_AVATAR = 500 * 1024
/* Thời tiết hôm nay (khối “Hôm nay của bạn”) — Open-Meteo (miễn phí, không cần key), chỉ gửi toạ độ cố định; lưu tạm 30 phút.
   Mặc định Hà Nội — đổi bằng WEATHER_LAT / WEATHER_LON / WEATHER_PLACE. Lỗi mạng → trả rỗng, giao diện tự ẩn. */
const weatherCache = { at: 0, data: null }
app.get('/api/weather', requireActive, h(async (_req, res) => {
  if (Date.now() - weatherCache.at < 30 * 60e3 && weatherCache.data) return ok(res, weatherCache.data)
  const lat = Number(process.env.WEATHER_LAT || 21.0285), lon = Number(process.env.WEATHER_LON || 105.8542), place = process.env.WEATHER_PLACE || 'Hà Nội'
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FBangkok&forecast_days=1`
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) }).then(x => x.json())
    const data = { place, temp: r.current?.temperature_2m, code: r.current?.weather_code, day: !!r.current?.is_day,
      min: r.daily?.temperature_2m_min?.[0], max: r.daily?.temperature_2m_max?.[0], rain: r.daily?.precipitation_probability_max?.[0] }
    if (data.temp == null) throw new Error('no data')
    Object.assign(weatherCache, { at: Date.now(), data })
    ok(res, data)
  } catch { ok(res, weatherCache.data ?? {}) }
}))
/* Thành tựu (huy hiệu) của chính mình — tính từ mọi công việc + bản chốt. seen = các cấp đã chúc mừng (prefs.badgesSeen).
   Lần đầu: coi mọi cấp đang có là đã xem (không chúc mừng dồn dập cho dữ liệu cũ). */
app.get('/api/me/achievements', requireActive, h((req, res) => {
  const me = store.get('users', req.user.id)
  const badges = achievementsOf(me, store.all('tasks'), store.all('closings'))
  const keys = badges.flatMap(b => Array.from({ length: b.level }, (_, i) => `${b.id}:${i + 1}`))
  let seen = me.prefs?.badgesSeen
  if (!Array.isArray(seen)) { seen = keys; store.put('users', { ...me, prefs: { ...(me.prefs ?? {}), badgesSeen: seen } }) }
  ok(res, { badges, seen })
}))
app.put('/api/me/achievements/seen', requireActive, h((req, res) => {
  const me = store.get('users', req.user.id)
  const add = (Array.isArray(req.body?.keys) ? req.body.keys : []).map(String).filter(k => /^[a-z-]+:[1-3]$/.test(k))
  const seen = [...new Set([...(me.prefs?.badgesSeen ?? []), ...add])].slice(-200)
  store.put('users', { ...me, prefs: { ...(me.prefs ?? {}), badgesSeen: seen } })
  ok(res, { seen })
}))
/* Thông tin tài khoản (menu avatar): ai quản lý mình · mình đang quản lý ai · dự án tham gia · dự án phụ trách (tự chọn) */
const brief = u => ({ id: u.id, name: u.name, code: u.code ?? '', email: u.email ?? '', picture: u.picture ?? '', role: u.role, deptAdmin: u.deptAdmin ?? '', divisionId: u.divisionId ?? '' })
app.get('/api/me/profile', requireActive, h((req, res) => {
  const me = store.get('users', req.user.id), users = store.all('users').filter(u => u.status !== 'disabled')
  const mgr = new Set(managerIdsOf(me))
  const projects = store.all('projects').filter(p => p.memberIds?.includes(me.id))
    .map(p => ({ id: p.id, name: p.name, code: p.code ?? '', logo: p.logo ?? '', role: projectRole(me, p.id) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  ok(res, {
    user: publicUser(me),
    managers: users.filter(u => mgr.has(u.id)).map(brief),
    reports: users.filter(u => u.id !== me.id && managerIdsOf(u).includes(me.id)).map(brief).sort((a, b) => a.name.localeCompare(b.name, 'vi')),
    projects, primaryProjectIds: primaryProjectIdsOf(me),
  })
}))
/** Tự chọn dự án phụ trách — chỉ trong các dự án mình tham gia (dùng để tự tick “Là dự án phụ trách” khi thêm việc) */
app.put('/api/me/primary-projects', requireActive, h((req, res) => {
  const me = store.get('users', req.user.id)
  const mine = new Set(store.all('projects').filter(p => p.memberIds?.includes(me.id)).map(p => p.id))
  const ids = [...new Set((Array.isArray(req.body?.ids) ? req.body.ids : []).map(String))]
  if (ids.some(id => !mine.has(id))) throw new BadRequest('Chỉ chọn được dự án bạn đang tham gia')
  const u = { ...me, primaryProjectIds: ids }
  delete u.primaryProjectId
  store.put('users', u)
  changed(req, res, { user: publicUser(u), primaryProjectIds: ids })
}))
app.put('/api/me/avatar', requireActive, h((req, res) => {
  const pic = String(req.body?.picture ?? '')
  if (pic) {
    const m = pic.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/)
    if (!m) throw new BadRequest('Ảnh đại diện phải là PNG, JPG hoặc WebP')
    if (Math.floor(m[2].length * 3 / 4) > MAX_AVATAR) throw new BadRequest('Ảnh đại diện tối đa 500 KB')
  }
  const u = { ...store.get('users', req.user.id), picture: pic }
  store.put('users', u)
  changed(req, res, { user: publicUser(u) })
}))
/** Đổi mật khẩu (đang đăng nhập) */
app.post('/api/auth/password', requireActive, h((req, res) => {
  const u = store.get('users', req.user.id)
  if (u.passwordHash && !verifyPassword(req.body?.current, u.passwordHash)) throw Object.assign(new Error('Mật khẩu hiện tại không đúng'), { status: 400 })
  checkPasswordRule(req.body?.next)
  if (u.passwordHash && verifyPassword(req.body.next, u.passwordHash)) throw Object.assign(new Error('Mật khẩu mới phải khác mật khẩu hiện tại'), { status: 400 })
  // Đổi mật khẩu → đăng xuất các máy khác, cấp lại phiên cho máy đang dùng; hết yêu cầu bắt đổi
  const next = { ...u, passwordHash: hashPassword(req.body.next), passwordSetAt: new Date().toISOString(), sessionsRevokedAt: Date.now() }
  delete next.mustChangePassword
  store.put('users', next)
  setSession(res, u.id, SECURE)
  ok(res)
}))
app.post('/api/auth/logout', (_req, res) => { clearSession(res); ok(res) })

/* ═══ OPEN_DEMO: dùng thử chung không cần đăng nhập — danh sách người + chuyển người dùng ═══ */
app.get('/api/auth/demo-users', (_req, res) => {
  if (!OPEN_DEMO) return res.status(404).json({ error: 'Không bật OPEN_DEMO' })
  res.json({ users: store.all('users').filter(u => u.status !== 'disabled').map(u => ({ id: u.id, name: u.name, role: u.role })) })
})
app.post('/api/auth/switch', (req, res) => {
  if (!OPEN_DEMO) return res.status(404).json({ error: 'Không bật OPEN_DEMO' })
  const u = store.get('users', req.body?.userId)
  if (!u || u.status === 'disabled') return res.status(400).json({ error: 'Người dùng không hợp lệ' })
  if (u.status !== 'active') store.put('users', { ...u, status: 'active' })
  setSession(res, u.id, SECURE)
  ok(res, { user: store.get('users', u.id) })
})

/* ═══ Đăng nhập MISA ID (OpenID Connect) — app → id.misa.vn → callback → vào app ═══ */
const MISA_REDIRECT = process.env.MISA_ID_REDIRECT_URI || `${APP_URL}/api/auth/misa/callback`
app.get('/api/auth/misa/login', h(async (req, res) => {
  if (!misaEnabled()) throw new BadRequest('Chưa cấu hình MISA ID')
  res.redirect(await startLogin(res, { secret: sessionSecret(), redirectUri: MISA_REDIRECT, next: req.query.next, secure: SECURE }))
}))
app.get('/api/auth/misa/callback', async (req, res) => {
  try {
    const p = await finishLogin(req, res, { secret: sessionSecret(), redirectUri: MISA_REDIRECT })
    const u = loginWithMisa(p, ADMIN_EMAILS)
    setSession(res, u.id, SECURE)
    broadcast(req)
    res.redirect(p.next && p.next !== '/' ? p.next : '/')
  } catch (e) {
    res.redirect('/dang-nhap?error=' + encodeURIComponent(e.message || 'Đăng nhập MISA ID thất bại'))
  }
})
app.get('/api/me', (req, res) => (req.user ? ok(res, { user: publicUser(req.user) }) : res.status(401).json({ error: 'Chưa đăng nhập' })))

/* ═══ Ghi chú nhanh (StickyNotes của mds-ui) — riêng từng người, chỉ chủ ghi chú đọc / sửa được ═══
   store kind 'stickyNotes': 1 bản ghi / người { id: userId, notes: [{ id, text, done, createdAt, updatedAt }] }.
   Trình duyệt lưu localStorage trước rồi mới gửi, lỗi thì gửi lại → POST nhận id do trình duyệt đặt và GHI ĐÈ nếu đã có (gửi lại không sinh bản trùng).
   Không gọi changed() — ghi chú không phải dữ liệu chấm điểm, không đẩy realtime cho ai. */
const NOTE_ID = /^[\w-]{8,64}$/, NOTE_MAX = 500
const noteText = v => String(v ?? '').trim().slice(0, 200)
const notesOf = req => store.get('stickyNotes', req.user.id)?.notes ?? []
const saveNotes = (req, notes) => store.put('stickyNotes', { id: req.user.id, notes: notes.slice(0, NOTE_MAX) })
const noNote = res => res.status(404).json({ ok: false, error: 'Không tìm thấy ghi chú' })
app.get('/api/notes', requireActive, (req, res) => { res.set('Cache-Control', 'no-store'); ok(res, { notes: notesOf(req) }) })
app.post('/api/notes', requireActive, h((req, res) => {
  const b = req.body ?? {}, text = noteText(b.text), id = b.id == null ? crypto.randomUUID() : String(b.id)
  if (!text) throw new BadRequest('Nội dung ghi chú không được trống')
  if (!NOTE_ID.test(id)) throw new BadRequest('Mã ghi chú không hợp lệ')
  const list = notesOf(req), now = new Date().toISOString()
  let note = list.find(n => n.id === id)
  if (note) Object.assign(note, { text, done: !!b.done, updatedAt: now })
  else list.unshift(note = { id, text, done: !!b.done, createdAt: now, updatedAt: now })
  saveNotes(req, list); ok(res, { note })
}))
app.put('/api/notes/:id', requireActive, h((req, res) => {
  const list = notesOf(req), n = list.find(x => x.id === req.params.id)
  if (!n) return noNote(res)
  const { text, done } = req.body ?? {}
  if (text !== undefined) n.text = noteText(text) || n.text
  if (done !== undefined) n.done = !!done
  n.updatedAt = new Date().toISOString()
  saveNotes(req, list); ok(res, { note: n })
}))
app.delete('/api/notes/:id', requireActive, h((req, res) => {
  const list = notesOf(req), rest = list.filter(x => x.id !== req.params.id)
  if (rest.length === list.length) return noNote(res)
  saveNotes(req, rest); ok(res)
}))

/* ═══ Toàn bộ dữ liệu người dùng được xem ═══
   Không phải Quản trị: dự án mình tham gia + việc của mình + việc của người mình quản lý trực tiếp;
   người dùng = thành viên các dự án đó + người mình quản lý + quản lý của mình. */
app.get('/api/bootstrap', requireActive, (req, res) => res.json(bootstrapFor(req.user)))
/* ── Tải theo phần: bootstrap chỉ gửi “dữ liệu nóng” (việc đang làm + việc hoàn thành / tạo từ đầu tháng trước);
      phần còn lại trình duyệt tải khi cần: theo vòng lặp, tháng, dự án, từng việc · lịch sử: theo từng việc ── */
const hotFrom = () => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7) + '-01' }
const isHot = (t, from) => (hasDesign(t) && !t.completedDate) || (hasAnalysis(t) && !t.baCompletedDate)
  || (t.completedDate || '') >= from || (t.baCompletedDate || '') >= from || (t.createdAt || '') >= from
function bootstrapFor(u) {
  const v = viewOf(u), from = hotFrom()
  const visible = store.all('tasks').filter(v.seeTask)
  const tasks = visible.filter(t => isHot(t, from))
  // Tóm tắt toàn bộ việc được xem (không gửi chi tiết): tháng có việc, người thực hiện PD, số việc theo dự án
  const taskMonths = new Set(), performerIds = new Set(), projectTaskCount = {}
  let hasBaWork = false
  for (const t of visible) {
    if (t.completedDate) taskMonths.add(t.completedDate.slice(0, 7))
    if (t.baCompletedDate) taskMonths.add(t.baCompletedDate.slice(0, 7))
    if (t.pdId) performerIds.add(t.pdId)
    if (t.baId && hasAnalysis(t)) hasBaWork = true
    projectTaskCount[t.projectId] = (projectTaskCount[t.projectId] ?? 0) + 1
  }
  const pids = new Set([...v.memberPids, ...visible.map(t => t.projectId)])
  const projects = store.all('projects').filter(p => pids.has(p.id))

  const allUsers = store.all('users')
  const uids = new Set([u.id, ...managerIdsOf(u), ...v.managed, ...v.peerPds])
  projects.filter(p => v.memberPids.has(p.id)).forEach(p => p.memberIds.forEach(id => uids.add(id)))
  visible.forEach(t => { uids.add(t.pdId); uids.add(t.baId) })

  const closings = store.all('closings').map(c => closingView(v, c, uids)).filter(Boolean)
  closings.forEach(c => uids.add(c.closedBy))
  const months = {}
  store.all('months').forEach(m => { const { id, ...rest } = monthFor(v, m); months[id] = rest })

  return {
    seq: stamp(),
    pdSummaries: summariesFor(v), pdProjects: pdProjectsFor(v),
    users: allUsers.filter(x => v.all || uids.has(x.id)).map(x => userFor(v, x)),
    projects,
    iterations: store.all('iterations').filter(i => pids.has(i.projectId)),
    tasks, hotFrom: from, taskMonths: [...taskMonths].sort(), performerIds: [...performerIds], hasBaWork, projectTaskCount,
    history:    [],   // tải theo từng công việc: GET /api/tasks/:id/history
    closings,
    baClosings: store.all('baClosings').filter(c => v.baAll || c.baId === u.id || v.managed.has(c.baId) || (c.items ?? []).some(i => v.realPids.has(i.projectId))),
    monthSettings: months,
    config: store.getConfig(),
    divisions: divisionsList(),
    currentUserId: u.id,
  }
}

app.use('/api', (req, res, next) => (req.path.startsWith('/auth') ? next() : requireActive(req, res, next)))
/* Bản dùng thử (không cần đăng nhập): giới hạn gọi AI để không tốn quota — mỗi IP 15 lượt / giờ, cả bản demo 300 lượt / ngày */
const demoAi = { byIp: new Map(), day: '', dayCount: 0 }
if (OPEN_DEMO) app.use('/api/ai', (req, res, next) => {
  if (req.method !== 'POST') return next()
  const now = Date.now(), ip = clientIp(req) || '?', today = new Date().toISOString().slice(0, 10)
  if (demoAi.day !== today) { demoAi.day = today; demoAi.dayCount = 0; demoAi.byIp.clear() }
  const hits = (demoAi.byIp.get(ip) ?? []).filter(t => now - t < 3600e3)
  if (hits.length >= 15) return res.status(429).json({ error: 'Bản dùng thử giới hạn 15 câu hỏi AI mỗi giờ — thử lại sau ít phút, hoặc đăng nhập để dùng không giới hạn.' })
  if (demoAi.dayCount >= 300) return res.status(429).json({ error: 'Bản dùng thử đã hết lượt hỏi AI hôm nay — đăng nhập để tiếp tục dùng AVA.' })
  hits.push(now); demoAi.byIp.set(ip, hits); demoAi.dayCount++
  next()
})

/** Công việc theo phần (chỉ việc mình được xem): ?iterationId= · ?projectId= · ?month=YYYY-MM (ngày hoàn thành PD hoặc BA) · ?ids=a,b */
app.get('/api/tasks', h((req, res) => {
  const v = viewOf(req.user), q = req.query
  const ids = q.ids ? new Set(String(q.ids).split(',').slice(0, 500)) : null
  const month = /^\d{4}-\d{2}$/.test(q.month ?? '') ? q.month : null
  if (!q.iterationId && !q.projectId && !month && !ids) throw new BadRequest('Thiếu điều kiện lọc')
  const tasks = store.all('tasks').filter(t => (!q.iterationId || t.iterationId === q.iterationId) && (!q.projectId || t.projectId === q.projectId)
    && (!month || (t.completedDate || '').startsWith(month) || (t.baCompletedDate || '').startsWith(month)) && (!ids || ids.has(t.id)) && v.seeTask(t))
  ok(res, { tasks })
}))
/** Lịch sử 1 công việc (tải khi mở chi tiết) */
/* ── Dữ liệu lưu trữ (nén) — Quản trị: xem danh sách, tải về JSON, khôi phục, nén ngay ── */
app.get('/api/admin/archive', h((req, res) => {
  adminOnly(req)
  const names = Object.fromEntries(store.all('projects').map(p => [p.id, p.name]))
  ok(res, { items: store.archiveList().map(a => ({ ...a, projectName: names[a.projectId] ?? '(dự án đã xóa)' })) })
}))
app.get('/api/admin/archive/:key', h((req, res) => {
  adminOnly(req)
  const a = store.archiveGet(req.params.key)
  if (!a) return res.status(404).json({ error: 'Không có phần lưu trữ này' })
  res.set('Content-Disposition', `attachment; filename="luu-tru-${a.year}-${encodeURIComponent(a.projectId || 'khac')}.json"`)
  res.json(a)
}))
app.post('/api/admin/archive/:key/restore', h((req, res) => {
  adminOnly(req)
  const r = restoreArchive(req.params.key)
  if (!r) throw new BadRequest('Không có phần lưu trữ này')
  changed(req, res, r)
}))
app.post('/api/admin/archive/run', h((req, res) => {
  adminOnly(req)
  const r = archiveOld()
  if (r?.tasks || r?.iterations) { store.vacuum(); changed(req, res, r) } else ok(res, r ?? { tasks: 0 })
}))

app.get('/api/tasks/:id/history', h((req, res) => {
  const v = viewOf(req.user), t = store.get('tasks', req.params.id)
  if (t && !v.seeTask(t)) deny('Không có quyền')
  ok(res, { history: store.byTask('history', req.params.id).sort((a, b) => b.at.localeCompare(a.at)) })
}))

/* ═══ Dự án ═══ */
app.put('/api/projects/:id', h((req, res) => {
  const u = req.user, id = req.params.id, body = req.body
  const old = store.get('projects', id)
  if (old ? !canManage(u, id) : !canCreateProject(u)) deny('Không có quyền với dự án này')
  if (!String(body.code ?? '').trim() || !String(body.name ?? '').trim()) throw new BadRequest('Thiếu mã hoặc tên dự án')
  const creatorPO = !old && ['PO', 'PDL'].includes(u.role)   // PO / PD Lead tạo dự án → Quản trị dự án
  const memberIds = [...new Set([...(body.memberIds ?? []), ...(creatorPO ? [u.id] : [])])]
  // Vai trò trong dự án: chỉ nhận giá trị hợp lệ của thành viên hiện có
  const memberRoles = {}
  for (const mid of memberIds) {
    const r = body.memberRoles?.[mid] ?? old?.memberRoles?.[mid]
    if (['manager', 'member', 'viewer'].includes(r)) memberRoles[mid] = r
  }
  if (creatorPO) memberRoles[u.id] = 'manager'
  const divisionId = divisionsList().some(d => d.id === body.divisionId) ? body.divisionId : (old?.divisionId ?? '')
  // Logo: ảnh nhúng (data URL) SVG / PNG / WebP / JPG, tối đa ~300 KB; '' = xóa logo; không gửi = giữ logo cũ
  let logo = old?.logo ?? ''
  if ('logo' in body) {
    logo = String(body.logo ?? '')
    if (logo && (!/^data:image\/(png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(logo) || logo.length > 400000)) throw new BadRequest('Logo phải là ảnh SVG, PNG, WebP hoặc JPG, tối đa 300 KB')
  }
  const p = { ...(old ?? { createdBy: u.id }), id, code: body.code, name: body.name, description: body.description ?? '', divisionId, memberIds, memberRoles, logo }
  // Link Google Sheet của cả dự án (mỗi trang tính = 1 vòng lặp) — tùy chọn
  if ('sheetUrl' in body) {
    const url = String(body.sheetUrl ?? '').trim()
    if (url && !sheetIdOf(url)) throw new BadRequest('Link không phải Google Sheet (cần dạng https://docs.google.com/spreadsheets/d/…)')
    if (url !== (old?.sheetUrl ?? '')) { p.sheetUrl = url; p.sheetBy = url ? u.id : ''; if (!url) delete p.sheetSync }
  }
  if ('sheetAuto' in body) p.sheetAuto = !!body.sheetAuto
  store.put('projects', p)
  changed(req, res, { project: p })
}))
app.delete('/api/projects/:id', h((req, res) => {
  if (!isAdmin(req.user)) deny('Chỉ Quản trị hệ thống được xóa dự án')
  const id = req.params.id
  if (store.all('tasks').some(t => t.projectId === id && isLocked(t))) deny('Dự án có công việc thuộc tháng đã chốt điểm')
  store.tx(() => {
    store.all('tasks').filter(t => t.projectId === id).forEach(t => store.del('tasks', t.id))
    store.all('iterations').filter(i => i.projectId === id).forEach(i => store.del('iterations', i.id))
    store.del('projects', id)
  })
  changed(req, res)
}))

/* ═══ Vòng lặp ═══ */
app.put('/api/iterations/:id', h((req, res) => {
  const b = req.body
  if (!canManage(req.user, b.projectId)) deny('Chỉ PO của dự án hoặc Quản trị được sửa vòng lặp')
  const old = store.get('iterations', req.params.id)
  const it = { ...(old ?? {}), id: req.params.id, projectId: b.projectId, name: b.name, startDate: b.startDate, endDate: b.endDate }
  if (!String(it.name ?? '').trim()) throw new BadRequest('Thiếu tên vòng lặp')
  // Link Google Sheet để đồng bộ công việc (tùy chọn) — đổi / gỡ link thì người gắn = người sửa
  if ('sheetUrl' in b) {
    const url = String(b.sheetUrl ?? '').trim()
    if (url && !sheetCsvUrl(url)) throw new BadRequest('Link không phải Google Sheet (cần dạng https://docs.google.com/spreadsheets/d/…)')
    if (url !== (old?.sheetUrl ?? '')) { it.sheetUrl = url; it.sheetBy = url ? req.user.id : ''; if (!url) delete it.sheetSync }
  }
  if ('sheetAuto' in b) it.sheetAuto = !!b.sheetAuto
  store.put('iterations', it)
  changed(req, res, { iteration: it })
}))
/* ═══ Chat nội bộ 1-1 (mọi người dùng đang hoạt động) ═══
   Tin nhắn: { id, from, to, text, at, readAt?, reactions?: { userId: emoji } } — đẩy tức thì qua kênh realtime (patchFor → chat), giữ 180 ngày. */
const CHAT_MAX = 2000, CHAT_KEEP_DAYS = 180
// Trạng thái online cho danh bạ chat (ai cũng xem được): active · idle · offline
/** Mở app nhưng quá 1 giờ không thao tác → coi như đã rời đi: ẩn khỏi danh sách “đang hoạt động” (đỡ dài).
    Quản trị đặt mốc “không hoạt động” > 1 giờ → ẩn sau mốc đó thêm 10 phút (vẫn kịp thấy trạng thái không hoạt động) */
const goneMs = () => Math.max(60 * 60e3, idleMinutes() * 60000 + 10 * 60e3)
function onlineStates() {
  const now = Date.now(), idleMs = idleMinutes() * 60000, last = new Map()
  for (const c of clients.values()) last.set(c.userId, Math.max(last.get(c.userId) ?? 0, c.lastActive))
  const gone = goneMs()
  return Object.fromEntries([...last].filter(([, t]) => now - t <= gone).map(([id, t]) => [id, now - t > idleMs ? 'idle' : 'active']))
}
/* ═══ Kênh “📢 Thông báo chung” — 1 người gửi cho tất cả / 1 bộ phận ═══
   Lưu chung kind 'messages' với ann: true, to = '__all__' | '__dept:PD' | '__dept:BA'.
   Gửi: Quản trị hệ thống (mọi nhóm) · Quản trị PD / BA (chỉ bộ phận mình). Nhận: đọc + thả cảm xúc, trả lời = nhắn riêng người gửi.
   Đã đọc theo từng người: user.prefs.annReadAt (không ghi lại từng tin khi 200 người cùng đọc). */
const ANN = '__ann__', ANN_AUDIENCES = { __all__: 'Tất cả', '__dept:PD': 'Bộ phận PD', '__dept:BA': 'Bộ phận BA', '__role:PO': 'PO', '__role:QA': 'QA' }
const annAudiencesOf = u => (isAdmin(u) ? Object.keys(ANN_AUDIENCES) : deptAdminOf(u) ? [`__dept:${deptAdminOf(u)}`] : [])
/* Gửi cho nhiều nhóm cùng lúc (VD BA + PO): m.to = các nhóm nối bằng dấu phẩy ('__dept:BA,__role:PO') — tin cũ 1 nhóm vẫn đọc được */
const inAudience = (u, to) => String(to || '').split(',').some(g => g === '__all__' || g === `__dept:${deptOfRole(u.role) || u.role}` || g === `__role:${u.role}`)   // PD Lead thuộc Bộ phận PD
/** body.audience (chuỗi | mảng) → khóa nhóm đã kiểm quyền; có “Tất cả” thì chỉ còn Tất cả */
function audienceKey(raw, me, fallback = '') {
  const list = [...new Set((Array.isArray(raw) ? raw : String(raw ?? fallback).split(',')).map(String).filter(Boolean))]
  if (!list.length) return ''
  const allowed = annAudiencesOf(me)
  if (list.some(g => !allowed.includes(g))) deny('Bạn không có quyền gửi cho nhóm này')
  return list.includes('__all__') ? '__all__' : Object.keys(ANN_AUDIENCES).filter(g => list.includes(g)).join(',')
}
const annVisible = (u, m) => !!m?.ann && (m.from === u.id || isAdmin(u) || inAudience(u, m.to))
app.get('/api/chat/contacts', requireActive, h((req, res) => {
  const me = req.user.id, unread = {}
  for (const m of store.all('messages')) if (!m.ann && m.to === me && !m.readAt) unread[m.from] = (unread[m.from] ?? 0) + 1
  // Người nhắn gần nhất với mình (để xếp danh bạ)
  const lastAt = {}
  for (const m of store.all('messages')) if (!m.ann && (m.from === me || m.to === me)) { const o = m.from === me ? m.to : m.from; if (!lastAt[o] || m.at > lastAt[o]) lastAt[o] = m.at }
  // Kênh thông báo chung: số tin chưa đọc (của người khác, sau lần đọc cuối) · tin cuối · quyền gửi
  const readAt = store.get('users', me)?.prefs?.annReadAt ?? '', anns = store.all('messages').filter(m => annVisible(req.user, m))
  const annLast = anns.reduce((a, m) => (!a || m.at > a.at ? m : a), null)
  const ann = { unread: anns.filter(m => m.from !== me && m.at > readAt).length, lastAt: annLast?.at ?? '', last: annLast ? { from: annLast.from, text: annLast.recalled ? 'Tin nhắn đã được thu hồi' : annLast.text.slice(0, 80) } : null,
    audiences: annAudiencesOf(req.user).map(v => ({ value: v, label: ANN_AUDIENCES[v] })) }
  const contacts = store.all('users').filter(u => u.id !== me && u.status !== 'disabled' && u.status !== 'pending')
    .map(u => ({ id: u.id, name: u.name, picture: u.picture ?? '', role: u.role, code: u.code ?? '' }))
  // Lần hoạt động gần nhất (ms) — hiện “Hoạt động … trước” cho người không hoạt động / offline; máy chủ khởi động lại thì lấy lần đăng nhập cuối
  const active = new Map()
  for (const c of clients.values()) active.set(c.userId, Math.max(active.get(c.userId) ?? 0, c.lastActive))
  const seen = Object.fromEntries(store.all('users').filter(u => u.id !== me)
    .map(u => [u.id, Math.max(lastSeen.get(u.id) ?? 0, active.get(u.id) ?? 0) || (u.lastLoginAt ? Date.parse(u.lastLoginAt) : 0)]).filter(([, t]) => t))
  ok(res, { contacts, states: onlineStates(), seen, unread, lastAt, idleMinutes: idleMinutes(), ann })
}))
/* Thông báo chung — ai đã xem: người nhận (đang hoạt động, thuộc nhóm nhận, trừ người gửi) có lần mở kênh cuối (prefs.annReadAt) ≥ lúc gửi.
   Chỉ người gửi, Quản trị hệ thống, Quản trị bộ phận (thông báo gửi bộ phận mình) xem được. */
const canSeeAnnSeen = (u, m) => m.from === u.id || isAdmin(u) || (!!deptAdminOf(u) && m.to === `__dept:${deptAdminOf(u)}`)
function annSeenOf(m, users = store.all('users')) {
  const rec = users.filter(u => u.id !== m.from && u.status === 'active' && inAudience(u, m.to))
  const seen = rec.filter(u => (u.prefs?.annReadAt ?? '') >= m.at).sort((a, b) => (b.prefs.annReadAt).localeCompare(a.prefs.annReadAt))
  return { rec, seen }
}
const faceOf = u => ({ id: u.id, name: u.name, picture: u.picture ?? '', code: u.code ?? '' })
/** Tóm tắt kèm tin: số đã xem / tổng + tối đa 5 mặt người xem gần nhất */
const annSeenBrief = (m, users) => { const { rec, seen } = annSeenOf(m, users); return { n: seen.length, total: rec.length, faces: seen.slice(0, 5).map(faceOf) } }
app.get('/api/chat/messages', requireActive, h((req, res) => {
  const me = req.user.id, other = String(req.query.with ?? ''), before = String(req.query.before ?? '')
  const list = store.all('messages').filter(m => (other === ANN ? annVisible(req.user, m) : !m.ann && ((m.from === me && m.to === other) || (m.from === other && m.to === me))) && (!before || m.at < before))
    .sort((a, b) => a.at.localeCompare(b.at))
  let page = list.slice(-50)
  if (other === ANN) { const users = store.all('users'); page = page.map(m => (canSeeAnnSeen(req.user, m) ? { ...m, seen: annSeenBrief(m, users) } : m)) }
  ok(res, { messages: page, more: list.length > 50 })
}))
/** Danh sách đầy đủ ai đã xem / chưa xem 1 thông báo chung */
app.get('/api/chat/announcements/:id/seen', requireActive, h((req, res) => {
  const m = store.get('messages', req.params.id)
  if (!m?.ann || !canSeeAnnSeen(req.user, m)) deny('Chỉ người gửi hoặc Quản trị xem được ai đã xem')
  const { rec, seen } = annSeenOf(m), seenIds = new Set(seen.map(u => u.id))
  ok(res, {
    seen: seen.map(u => ({ ...faceOf(u), role: u.role, at: u.prefs.annReadAt })),
    unseen: rec.filter(u => !seenIds.has(u.id)).map(u => ({ ...faceOf(u), role: u.role })).sort((a, b) => a.name.localeCompare(b.name, 'vi')),
  })
}))
app.post('/api/chat/messages', requireActive, h((req, res) => {
  const to = String(req.body?.to ?? ''), text = String(req.body?.text ?? '').trim()
  const peer = store.get('users', to)
  if (!peer || peer.status === 'disabled' || to === req.user.id) throw new BadRequest('Người nhận không hợp lệ')
  if (!text) throw new BadRequest('Tin nhắn trống')
  if (text.length > CHAT_MAX) throw new BadRequest(`Tin nhắn tối đa ${CHAT_MAX} ký tự`)
  const m = { id: uid('m'), from: req.user.id, to, text, at: new Date().toISOString() }
  store.put('messages', m)
  changed(req, res, { message: m })
}))
/** Gửi thông báo chung: { text, audience: nhóm | [nhóm…] } — nhóm: '__all__' | '__dept:PD' | '__dept:BA' | '__role:PO' | '__role:QA' */
app.post('/api/chat/announcements', requireActive, h((req, res) => {
  const text = String(req.body?.text ?? '').trim(), audience = audienceKey(req.body?.audience, req.user, '__all__')
  if (!audience) throw new BadRequest('Chọn nhóm nhận thông báo')
  if (!text) throw new BadRequest('Thông báo trống')
  if (text.length > CHAT_MAX) throw new BadRequest(`Thông báo tối đa ${CHAT_MAX} ký tự`)
  const m = { id: uid('m'), from: req.user.id, to: audience, ann: true, text, at: new Date().toISOString() }
  store.tx(() => {
    store.put('messages', m)
    // Quả chuông của từng người nhận (kể cả ai đang không mở chat)
    for (const u of store.all('users')) if (u.id !== req.user.id && u.status === 'active' && inAudience(u, audience))
      notify(u.id, 'announcement', { messageId: m.id, actorId: req.user.id, audience, preview: text.slice(0, 120) })
  })
  changed(req, res, { message: { ...m, seen: annSeenBrief(m) } })
}))
/** Gửi riêng từng người (1 lần → mỗi người 1 tin trong cuộc trò chuyện 1-1 với người gửi, như chat bình thường)
    { text, audience?: '__all__' | '__dept:PD' | '__dept:BA', userIds?: [...] } — cùng quyền với thông báo chung.
    Quản trị PD / BA: chỉ người thuộc bộ phận mình. Tối đa 500 người / lần. */
app.post('/api/chat/broadcast', requireActive, h((req, res) => {
  const me = req.user, text = String(req.body?.text ?? '').trim(), audiences = annAudiencesOf(me)
  if (!audiences.length) deny('Bạn không có quyền gửi cho nhiều người')
  if (!text) throw new BadRequest('Tin nhắn trống')
  if (text.length > CHAT_MAX) throw new BadRequest(`Tin nhắn tối đa ${CHAT_MAX} ký tự`)
  const audience = audienceKey(req.body?.audience, me)
  const picked = new Set(Array.isArray(req.body?.userIds) ? req.body.userIds.map(String) : [])
  const dept = deptAdminOf(me)
  const targets = store.all('users').filter(u => u.id !== me.id && u.status === 'active'
    && (audience ? inAudience(u, audience) : picked.has(u.id)) && (isAdmin(me) || (dept && deptOfRole(u.role) === dept)))
  if (!targets.length) throw new BadRequest('Chưa chọn người nhận hợp lệ')
  if (targets.length > 500) throw new BadRequest('Tối đa 500 người mỗi lần')
  const at = new Date().toISOString(), batch = uid('b')
  const messages = targets.map(u => ({ id: uid('m'), from: me.id, to: u.id, text, at, batch }))
  store.tx(() => messages.forEach(m => store.put('messages', m)))
  changed(req, res, { messages, count: messages.length })
}))
// Thả cảm xúc: mỗi người 1 emoji / tin (chọn lại emoji đang thả → bỏ) — chỉ người gửi / người nhận
const CHAT_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']
/* Thu hồi tin nhắn: chỉ người gửi — xóa hẳn nội dung + cảm xúc trên máy chủ, 2 phía thấy “Tin nhắn đã được thu hồi”; gỡ thông báo chuông liên quan */
app.post('/api/chat/messages/:id/recall', requireActive, h((req, res) => {
  const m = store.get('messages', req.params.id)
  if (!m || m.from !== req.user.id) throw new BadRequest('Chỉ người gửi được thu hồi tin nhắn')
  if (m.recalled) return ok(res, { message: m })
  const next = { ...m, text: '', reactions: {}, recalled: true, recalledAt: new Date().toISOString() }
  store.tx(() => {
    store.put('messages', next)
    resolveNotifications(n => n.data?.messageId === m.id)   // chuông: thông báo chung / cảm xúc về tin này
  })
  changed(req, res, { message: next })
}))
app.post('/api/chat/messages/:id/react', requireActive, h((req, res) => {
  const me = req.user.id, m = store.get('messages', req.params.id), emoji = String(req.body?.emoji ?? '')
  if (!m || (m.ann ? !annVisible(req.user, m) : (m.from !== me && m.to !== me))) throw new BadRequest('Tin nhắn không tồn tại')
  if (m.recalled) throw new BadRequest('Tin nhắn đã được thu hồi')
  if (emoji && !CHAT_REACTIONS.includes(emoji)) throw new BadRequest('Cảm xúc không hợp lệ')
  const reactions = { ...(m.reactions ?? {}) }
  if (!emoji || reactions[me] === emoji) delete reactions[me]; else reactions[me] = emoji
  const next = { ...m, reactions }
  // Báo người gửi tin: ai vừa thả cảm xúc (đổi emoji trong 30 phút → gộp 1 thông báo; gỡ cảm xúc → xóa thông báo chưa đọc)
  const key = `react:${m.id}:${me}`
  store.tx(() => {
    store.put('messages', next)
    if (m.from !== me) {
      if (reactions[me]) notify(m.from, 'chat_reaction', { messageId: m.id, actorId: me, emoji: reactions[me], preview: String(m.text || '').slice(0, 80), peer: m.ann ? ANN : me }, key)
      else resolveNotifications(n => n.mergeKey === key && !n.readAt)
    }
  })
  changed(req, res, { message: next })
}))
app.post('/api/chat/read', requireActive, h((req, res) => {
  const me = req.user.id, other = String(req.body?.with ?? ''), at = new Date().toISOString()
  if (other === ANN) {   // kênh thông báo chung: ghi mốc đã đọc của người này
    const u = store.get('users', me); store.put('users', { ...u, prefs: { ...(u.prefs ?? {}), annReadAt: at } })
    return ok(res, { read: true })
  }
  const unread = store.all('messages').filter(m => m.from === other && m.to === me && !m.readAt)
  if (unread.length) { store.tx(() => unread.forEach(m => store.put('messages', { ...m, readAt: at }))); broadcast(req) }
  ok(res, { read: unread.length })
}))
/* ═══ Thông báo (quả chuông) — chỉ của chính mình ═══ */
app.get('/api/notifications', requireActive, h((req, res) => {
  // Thông báo của mình (100 mới nhất) + luồng Hoạt động của Quản trị (150 mới nhất) — tách để hoạt động không đẩy mất thông báo riêng
  const mine = store.all('notifications').filter(n => n.userId === req.user.id).sort((a, b) => b.at.localeCompare(a.at))
  const own = mine.filter(n => n.type !== ACTIVITY), act = mine.filter(n => n.type === ACTIVITY)
  ok(res, { notifications: [...own.slice(0, 100), ...act.slice(0, 150)], unread: own.filter(n => !n.readAt).length })
}))
/** Đánh dấu đã đọc: { ids: [...] } hoặc { all: true } */
app.post('/api/notifications/read', requireActive, h((req, res) => {
  const ids = new Set(Array.isArray(req.body?.ids) ? req.body.ids : []), at = new Date().toISOString()
  const list = store.all('notifications').filter(n => n.userId === req.user.id && !n.readAt && (req.body?.all || ids.has(n.id)))
  if (list.length) store.tx(() => list.forEach(n => store.put('notifications', { ...n, readAt: at })))
  changed(req, res, { read: list.length })
}))
setTimeout(purgeNotifications, 180e3).unref(); setInterval(purgeNotifications, 24 * 3600e3).unref()
const AVA_KEEP_DAYS = Number(process.env.AVA_KEEP_DAYS ?? 180)
function purgeAva() {
  const cutoff = new Date(Date.now() - AVA_KEEP_DAYS * 86400e3).toISOString()
  const demoCutoff = new Date(Date.now() - 30 * 86400e3).toISOString()   // lượt khách hỏi trong bản dùng thử: chỉ giữ 30 ngày
  const old = store.all('avaLogs').filter(l => l.at < cutoff || (l.demo && l.at < demoCutoff))
  if (old.length) { store.tx(() => old.forEach(l => store.del('avaLogs', l.id))); console.log(`🧹 Dọn ${old.length} lượt hỏi AVA cũ hơn ${AVA_KEEP_DAYS} ngày`) }
}
setTimeout(purgeAva, 150e3).unref(); setInterval(purgeAva, 24 * 3600e3).unref()
// Ảnh gửi AVA: dọn lúc khởi động + mỗi 6 giờ (quá 30 ngày / vượt trần dung lượng)
setTimeout(purgeAvaImages, 60e3).unref(); setInterval(purgeAvaImages, 6 * 3600e3).unref()
function purgeChat() {
  const cutoff = new Date(Date.now() - CHAT_KEEP_DAYS * 86400e3).toISOString()
  const old = store.all('messages').filter(m => m.at < cutoff)
  if (old.length) { store.tx(() => old.forEach(m => store.del('messages', m.id))); console.log(`🧹 Dọn ${old.length} tin nhắn chat cũ hơn ${CHAT_KEEP_DAYS} ngày`) }
}
setTimeout(purgeChat, 120e3).unref(); setInterval(purgeChat, 24 * 3600e3).unref()

/* ═══ Đồng bộ vòng lặp từ Google Sheet ═══ */
function sheetIteration(req) {
  const it = store.get('iterations', req.params.id)
  if (!it) throw Object.assign(new Error('Vòng lặp không tồn tại'), { status: 404 })
  if (!canManage(req.user, it.projectId)) deny('Chỉ Quản trị dự án được đồng bộ từ Google Sheet')
  if (!it.sheetUrl) throw new BadRequest('Vòng lặp chưa gắn link Google Sheet')
  return it
}
// Xem trước: đọc Sheet + lập kế hoạch, CHƯA ghi gì
app.post('/api/iterations/:id/sheet/preview', h(async (req, res) => {
  const it = sheetIteration(req)
  ok(res, { plan: planView(await planIteration(it)), mode: it.sheetMode ?? 'merge' })
}))
// Áp dụng: đọc lại Sheet (không dùng kế hoạch cũ) → ghi theo cách đã chọn; nhớ cách chọn cho lần tự đồng bộ
app.post('/api/iterations/:id/sheet/apply', h(async (req, res) => {
  const it = sheetIteration(req)
  const mode = SYNC_MODES.includes(req.body?.mode) ? req.body.mode : 'merge'
  const result = runSheetSync(req.user, it, await planIteration(it), mode)
  changed(req, res, { result })
}))
function runSheetSync(user, it, plan, mode) {
  const members = addMembers(it.projectId, plan.newMembers)   // thêm thành viên trước để công việc giao cho họ ghi được
  const r = applySync(user, it, plan, mode)
  const result = { at: new Date().toISOString(), by: user.id, mode, added: r.added, updated: r.updated,
    errors: plan.errors.length, skipped: plan.skipped.length, missing: plan.missing, members: members.map(m => m.name), failed: r.failed.slice(0, 20) }
  store.put('iterations', { ...store.get('iterations', it.id), sheetMode: mode, sheetSync: result })
  return result
}
/* ═══ Đồng bộ cả dự án từ 1 file Google Sheet (mỗi trang tính = 1 vòng lặp) ═══ */
function sheetProject(req) {
  const p = store.get('projects', req.params.id)
  if (!p) throw Object.assign(new Error('Dự án không tồn tại'), { status: 404 })
  if (!canManage(req.user, p.id)) deny('Chỉ Quản trị dự án được đồng bộ từ Google Sheet')
  if (!p.sheetUrl) throw new BadRequest('Dự án chưa gắn link Google Sheet')
  return p
}
const newIteration = projectId => data => { const it = { id: uid('i'), projectId, ...data, createdFromSheet: true }; store.put('iterations', it); return it }
app.post('/api/projects/:id/sheet/preview', h(async (req, res) => {
  const p = sheetProject(req)
  ok(res, { ...projectPlanView(await planProject(p)), mode: p.sheetMode ?? 'merge' })
}))
app.post('/api/projects/:id/sheet/apply', h(async (req, res) => {
  const p = sheetProject(req)
  const mode = SYNC_MODES.includes(req.body?.mode) ? req.body.mode : 'merge'
  const planned = await planProject(p)
  const r = applyProject(req.user, p, planned, req.body?.picks, mode, newIteration(p.id))
  const result = { at: new Date().toISOString(), by: req.user.id, mode, added: r.added, updated: r.updated, created: r.created, tabs: r.tabs, members: r.members.map(m => m.name), failed: r.failed.slice(0, 20) }
  store.put('projects', { ...store.get('projects', p.id), sheetMode: mode, sheetSync: result })
  changed(req, res, { result })
}))
async function autoProjectSync() {
  for (const p of store.all('projects').filter(x => x.sheetUrl && x.sheetAuto !== false)) {
    if (p.sheetSync?.at && Date.now() - Date.parse(p.sheetSync.at) < 24 * 3600e3) continue
    const user = store.get('users', p.sheetBy)
    let sync
    try {
      if (!user || user.status !== 'active' || !canManage(user, p.id)) throw new Error('Người gắn link không còn quyền Quản trị dự án — cần gắn lại link')
      const planned = await planProject(p)
      // Tự động: chỉ cập nhật vòng lặp đã có — trang tính mới cần người bấm Đồng bộ để xác nhận ngày
      const picks = planned.tabs.filter(t => t.status === 'existing').map(t => ({ gid: t.gid }))
      const r = applyProject(user, p, planned, picks, p.sheetMode ?? 'merge', newIteration(p.id))
      sync = { at: new Date().toISOString(), auto: true, by: user.id, mode: p.sheetMode ?? 'merge', added: r.added, updated: r.updated, created: 0, tabs: r.tabs, members: r.members.map(m => m.name),
        newTabs: planned.tabs.filter(t => t.status === 'new').length, failed: r.failed.slice(0, 20) }
      console.log(`🔄 Đồng bộ Sheet dự án “${p.name}”: ${r.tabs} vòng lặp, +${r.added} thêm, ${r.updated} cập nhật${sync.newTabs ? `, ${sync.newTabs} trang tính mới chờ tạo vòng lặp` : ''}`)
    } catch (e) {
      sync = { ...(p.sheetSync ?? {}), at: new Date().toISOString(), auto: true, error: e.message }
      console.warn(`⚠️  Đồng bộ Sheet dự án “${p.name}” lỗi: ${e.message}`)
    }
    store.put('projects', { ...store.get('projects', p.id), sheetSync: sync })
    broadcast({ get: () => '' })
  }
}

/* Tự đồng bộ: mỗi giờ kiểm tra — vòng lặp bật tự đồng bộ mà quá 24 giờ chưa đồng bộ → chạy với quyền người gắn link */
async function autoSheetSync() {
  for (const it of store.all('iterations').filter(i => i.sheetUrl && i.sheetAuto !== false)) {
    if (it.sheetSync?.at && Date.now() - Date.parse(it.sheetSync.at) < 24 * 3600e3) continue
    const user = store.get('users', it.sheetBy)
    try {
      if (!user || user.status !== 'active' || !canManage(user, it.projectId)) throw new Error('Người gắn link không còn quyền Quản trị dự án — cần gắn lại link')
      const r = runSheetSync(user, it, await planIteration(it), it.sheetMode ?? 'merge')
      console.log(`🔄 Đồng bộ Sheet “${it.name}”: +${r.added} thêm, ${r.updated} cập nhật, ${r.errors} lỗi`)
    } catch (e) {
      store.put('iterations', { ...store.get('iterations', it.id), sheetSync: { ...(it.sheetSync ?? {}), at: new Date().toISOString(), auto: true, error: e.message } })
      console.warn(`⚠️  Đồng bộ Sheet “${it.name}” lỗi: ${e.message}`)
    }
    broadcast({ get: () => '' })
  }
}

app.delete('/api/iterations/:id', h((req, res) => {
  const it = store.get('iterations', req.params.id)
  if (!it) return ok(res)
  if (!canManage(req.user, it.projectId)) deny('Không có quyền xóa vòng lặp')
  const tasks = store.all('tasks').filter(t => t.iterationId === it.id)
  if (tasks.some(isLocked)) deny('Vòng lặp có công việc thuộc tháng đã chốt điểm')
  store.tx(() => { tasks.forEach(t => store.del('tasks', t.id)); store.del('iterations', it.id) })
  changed(req, res)
}))

/* ═══ Công việc ═══ */
app.put('/api/tasks/:id', h((req, res) => {
  const old = store.get('tasks', req.params.id)
  const t = checkTaskWrite(req.user, { ...req.body, id: req.params.id })
  store.tx(() => { store.put('tasks', t); notifyTaskChange(req.user, old ?? undefined, t) })
  changed(req, res, { task: t })
}))
app.post('/api/tasks/bulk', h((req, res) => {
  const list = Array.isArray(req.body?.tasks) ? req.body.tasks : []
  const checked = list.map(t => checkTaskWrite(req.user, { ...t, id: t.id || uid('t') }))
  const at = new Date().toISOString()   // cùng ngày tạo → giữ đúng thứ tự trong file
  const created = checked.filter(t => !store.get('tasks', t.id))
  created.forEach(t => { t.createdAt = at })
  store.tx(() => { checked.forEach(t => store.put('tasks', t)); notifyTasksImported(req.user, created) })
  changed(req, res, { count: checked.length })
}))
app.delete('/api/tasks/:id', h((req, res) => {
  const t = store.get('tasks', req.params.id)
  if (!t) return ok(res)
  // Quản trị dự án + PO của dự án (kể cả vai trò Thành viên) xóa mọi việc · Thành viên xóa việc do chính mình thêm
  const member = projectRole(req.user, t.projectId) === 'member'
  const own = member && t.createdBy && t.createdBy === req.user.id
  const po = member && ['PO', 'PDL'].includes(req.user.role)
  if (!canManage(req.user, t.projectId) && !own && !po) deny('Chỉ Quản trị dự án, PO của dự án hoặc người đã thêm công việc được xóa')
  if (isLocked(t)) deny('Công việc thuộc tháng đã chốt điểm')
  store.tx(() => { store.del('tasks', t.id); notifyTaskDeleted(req.user, t) })
  changed(req, res)
}))

/* ═══ Lịch sử điểm ═══ */
/* Gộp để đỡ tốn dung lượng (historyMerge.js): cùng người sửa liên tục ≤ 30 phút → 1 dòng; người khác / cách lâu → dòng mới; tối đa 20 dòng / việc.
   Trả về { put, del } để trình duyệt thay dòng tạm bằng kết quả gộp. */
app.post('/api/history', h((req, res) => {
  const e = { ...req.body, id: req.body?.id || uid('h'), userId: req.user.id, at: req.body?.at || new Date().toISOString() }
  // Thành viên dự án · Lead của PD thực hiện (sửa Vai trò của Lead / Mức hài lòng mà không là thành viên dự án)
  const task = store.get('tasks', e.taskId)
  if (!isMember(req.user, e.projectId) && !(task && task.projectId === e.projectId && isLeadOf(req.user, task.pdId))) deny('Không có quyền')
  const list = store.byTask('history', e.taskId)
  const prev = list.reduce((a, h) => (!a || h.at > a.at ? h : a), null)
  const r = mergeHistoryEntry(prev, e)
  let put = null
  const del = []
  store.tx(() => {
    if (r?.drop) { store.del('history', prev.id); del.push(prev.id) }
    else if (r?.merged) { put = r.merged; store.put('history', put) }
    else { put = e; store.put('history', put) }
    const after = [...list.filter(h => !del.includes(h.id) && h.id !== put?.id), ...(put ? [put] : [])]
    for (const id of overflowIds(after)) { store.del('history', id); del.push(id) }
  })
  changed(req, res, { put, del })
}))

/* ═══ Người dùng (Quản trị) ═══ */
const adminOnly = req => { if (!isAdmin(req.user)) deny('Chỉ Quản trị hệ thống') }
const ROLES = ['admin', 'HRBP', 'QA', 'PO', 'PDL', 'BA', 'PD']

/** Quản trị PD / BA quản lý người dùng thuộc bộ phận mình (bộ phận cũ và mới đều phải là bộ phận đó) */
const deptUserAdmin = (actor, target, newRole = target?.role) => { const d = deptAdminOf(actor); return !!d && (!target || deptOfRole(target.role) === d) && deptOfRole(newRole) === d }   // Quản trị PD: cả PD Lead
const userAdminOnly = (req, target) => { if (!isAdmin(req.user) && !deptUserAdmin(req.user, target)) deny('Chỉ Quản trị hệ thống hoặc Quản trị bộ phận của người này') }
app.put('/api/users/:id', h((req, res) => {
  const id = req.params.id, old = store.get('users', id)
  let b = req.body
  // Quản trị PD / BA: sửa đầy đủ người thuộc bộ phận mình (không đổi sang bộ phận khác, không gán / gỡ quyền Quản trị bộ phận)
  const deptEdit = !isAdmin(req.user) && deptUserAdmin(req.user, old, b?.role)
  if (deptEdit) b = { ...b, deptAdmin: old?.deptAdmin ?? '' }
  // Quản lý trực tiếp (không phải Quản trị): chỉ sửa NGƯỜI MÌNH QUẢN LÝ, chỉ Điểm kỳ vọng · Quản lý trực tiếp · Dự án tham gia / phụ trách.
  // Gmail, mã, tên, bộ phận, trạng thái… giữ nguyên. Dự án ngoài phạm vi mình thấy → giữ nguyên; vai trò trong dự án chỉ đổi ở dự án mình quản trị.
  if (!isAdmin(req.user) && !deptEdit) {
    if (!old || !isManagerOf(req.user, old)) deny('Chỉ Quản trị hệ thống, Quản trị bộ phận hoặc quản lý trực tiếp của người này được sửa')
    const visible = visibleProjectIds(req.user)
    const projectIds = Array.isArray(b.projectIds)
      ? [...new Set([...b.projectIds.filter(pid => visible.has(pid)), ...store.all('projects').filter(p => !visible.has(p.id) && p.memberIds.includes(id)).map(p => p.id)])]
      : undefined
    const projectRoles = {}
    for (const pid of projectIds ?? []) {
      const cur = store.get('projects', pid)?.memberRoles?.[id]
      projectRoles[pid] = canManage(req.user, pid) ? (b.projectRoles?.[pid] ?? cur ?? 'member') : (cur ?? 'member')
    }
    b = { ...old, target: b.target, managerIds: b.managerIds, primaryProjectIds: b.primaryProjectIds, projectIds, projectRoles }
  }
  const email = String(b.email ?? '').trim().toLowerCase()
  if (email && store.all('users').some(x => x.id !== id && (x.email || '').toLowerCase() === email)) throw new BadRequest('Gmail này đã có trong danh sách người dùng')
  if (b.role && !ROLES.includes(b.role)) throw new BadRequest('Vai trò không hợp lệ')
  const work = String(b.companyEmail ?? '').trim().toLowerCase()
  if (work && !/^\S+@\S+\.\S+$/.test(work)) throw new BadRequest('Email công ty không hợp lệ')
  if (work && store.all('users').some(x => x.id !== id && (x.companyEmail || '').toLowerCase() === work)) throw new BadRequest('Email công ty này đã có trong danh sách')
  if (old?.id === req.user.id && isAdmin(req.user) && (b.role !== 'admin' || b.status === 'disabled')) throw new BadRequest('Không thể tự hạ quyền / khóa chính mình')
  // Mã nhân viên: bắt buộc, không trùng — dùng để khớp người khi nhập công việc từ Excel / Google Sheet
  const code = String(b.code ?? '').trim()
  if (!code) throw new BadRequest('Thiếu mã nhân viên')
  if (store.all('users').some(x => x.id !== id && String(x.code ?? '').trim().toLowerCase() === code.toLowerCase())) throw new BadRequest('Mã nhân viên này đã có trong danh sách')
  const u = {
    ...(old ?? { createdAt: new Date().toISOString(), status: 'none' }),
    id, email, name: b.name, code, role: b.role || '', target: Number(b.target) || 0,
    // Quản trị bộ phận (Quản trị PD / BA) — chỉ Quản trị hệ thống gán; người không phải Quản trị: giữ nguyên (b = old ở nhánh trên)
    deptAdmin: ['PD', 'BA'].includes(b.deptAdmin) && !['admin', 'QA', 'HRBP'].includes(b.role) ? b.deptAdmin : '',
    companyEmail: String(b.companyEmail ?? old?.companyEmail ?? '').trim().toLowerCase(),
    // Khối (danh mục cây ở Cài đặt hệ thống, dùng chung với dự án) — để thống kê nhân sự theo khối; không bắt buộc
    divisionId: (dv => (divisionsList().some(d => d.id === dv) ? dv : ''))(b.divisionId ?? old?.divisionId),
    // Quản lý trực tiếp: người dùng có thật, không phải chính mình
    managerIds: [...new Set(Array.isArray(b.managerIds) ? b.managerIds : managerIdsOf(old))].filter(m => m !== id && store.get('users', m)),
    // Dự án phụ trách: phải nằm trong các dự án tham gia
    primaryProjectIds: [...new Set(Array.isArray(b.primaryProjectIds) ? b.primaryProjectIds : primaryProjectIdsOf(old))]
      .filter(pid => store.get('projects', pid) && (Array.isArray(b.projectIds) ? b.projectIds.includes(pid) : store.get('projects', pid).memberIds.includes(id))),
    status: ['none', 'invited', 'pending', 'active', 'disabled'].includes(b.status) ? b.status : (old?.status ?? 'none'),
  }
  delete u.leadId; delete u.isLead; delete u.primaryProjectId; delete u.baLevel   // baLevel: Level BA đã bỏ   // trường cũ → đã thay bằng managerIds / primaryProjectIds
  // Đổi email đăng nhập → phải mời lại, bỏ mật khẩu / link cũ (đổi danh tính đăng nhập)
  if (old && old.email && email !== old.email) {
    if (u.status === 'active') u.status = 'none'
    for (const k of ['passwordHash', 'setupTokenHash', 'setupTokenExp', 'setupPurpose']) delete u[k]
  }
  // Duyệt người tự đăng ký → báo người đó; thông báo “chờ duyệt” của các Quản trị coi như đã xử lý
  const approved = old?.status === 'pending' && u.status === 'active'
  store.tx(() => {
    store.put('users', u)
    if (approved) { notify(u.id, 'user_approved', { actorId: req.user.id, role: u.role }); resolveNotifications(n => n.type === 'user_pending' && n.data?.userId === u.id) }
    // Đồng bộ dự án tham gia
    if (Array.isArray(b.projectIds)) {
      store.all('projects').forEach(p => {
        const has = p.memberIds.includes(id), want = b.projectIds.includes(p.id)
        const role = ['manager', 'member', 'viewer'].includes(b.projectRoles?.[p.id]) ? b.projectRoles[p.id] : null   // vai trò trong dự án
        if (!has && !want) return
        if (has && want && (!role || p.memberRoles?.[id] === role)) return
        const memberRoles = { ...(p.memberRoles ?? {}) }
        if (!want) delete memberRoles[id]
        else if (role) memberRoles[id] = role
        store.put('projects', { ...p, memberIds: want ? [...new Set([...p.memberIds, id])] : p.memberIds.filter(m => m !== id), memberRoles })
      })
    }
  })
  changed(req, res, { user: publicUser(u) })
}))

/* ═══ Quản trị đặt / đặt lại mật khẩu cho người dùng (reset cứng) ═══
   Mật khẩu mới có hiệu lực ngay; chưa nhận lời mời → Hoạt động luôn; mọi phiên cũ của người đó bị đăng xuất; link đặt mật khẩu cũ hết hiệu lực. */
app.post('/api/users/:id/password', h((req, res) => {
  const u = store.get('users', req.params.id)
  userAdminOnly(req, u)
  if (!u) throw new BadRequest('Không tìm thấy người dùng')
  if (!u.email) throw new BadRequest('Người dùng chưa có Gmail đăng nhập')
  if (u.status === 'disabled') throw new BadRequest('Tài khoản đang bị khóa — mở khóa trước khi đặt mật khẩu')
  checkPasswordRule(req.body?.password)
  const now = new Date().toISOString()
  // Quản trị đặt cho người khác → người đó bắt buộc tự đổi ở lần đăng nhập tới (tự đặt cho mình thì không)
  const next = { ...u, passwordHash: hashPassword(req.body.password), passwordSetAt: now, passwordSetBy: req.user.id, sessionsRevokedAt: Date.now(), mustChangePassword: u.id !== req.user.id }
  if (u.status !== 'active') Object.assign(next, { status: 'active', acceptedAt: now })
  for (const k of ['setupTokenHash', 'setupTokenExp', 'setupPurpose']) delete next[k]
  store.put('users', next)
  if (u.id === req.user.id) setSession(res, u.id, SECURE)   // tự đặt cho chính mình → giữ đăng nhập máy này
  changed(req, res, { user: publicUser(next) })
}))

/* ═══ Ai đang dùng hệ thống (Quản trị) — 3 trạng thái:
   active  = đang mở app VÀ có thao tác trong N phút gần nhất
   idle    = vẫn mở app nhưng quá N phút không thao tác
   offline = không mở app (lần thao tác cuối = lastSeenAt) ═══ */
const DEFAULT_IDLE_MINUTES = 10
const idleMinutes = () => store.get('settings', 'presence')?.idleMinutes ?? DEFAULT_IDLE_MINUTES
// Tín hiệu thao tác từ trình duyệt (tối đa ~1 lần / phút / tab) → đánh dấu tab đó đang hoạt động
// X-Idle-Ms: số ms từ lần thao tác thật gần nhất (gửi kèm khi kết nối realtime mở lại) → không coi kết nối mới là “vừa hoạt động”
app.post('/api/presence', requireActive, (req, res) => {
  const now = Date.now(), cid = req.get('x-client-id') || ''
  const at = now - Math.min(Math.max(0, Number(req.get('x-idle-ms')) || 0), 24 * 3600e3)
  for (const c of clients.values()) if (c.userId === req.user.id && c.cid === cid) c.lastActive = at
  lastSeen.set(req.user.id, Math.max(lastSeen.get(req.user.id) ?? 0, at))
  res.status(204).end()
})
app.get('/api/presence/settings', h((req, res) => { adminOnly(req); ok(res, { idleMinutes: idleMinutes() }) }))
app.put('/api/presence/settings', h((req, res) => {
  adminOnly(req)
  const n = Math.round(Number(req.body?.idleMinutes))
  if (!Number.isFinite(n) || n < 1 || n > 240) throw new BadRequest('Thời gian không thao tác phải từ 1 đến 240 phút')
  store.put('settings', { id: 'presence', idleMinutes: n, updatedBy: req.user.id, updatedAt: new Date().toISOString() })
  ok(res, { idleMinutes: n })
}))
const deviceOf = ua => {
  const b = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Trình duyệt khác'
  const o = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : ''
  return o ? `${b} · ${o}` : b
}
app.get('/api/admin/activity', requireActive, h((req, res) => {
  adminOnly(req)
  const out = {}, now = Date.now(), idleMs = idleMinutes() * 60000, gone = goneMs()
  for (const c of clients.values()) {
    if (now - c.lastActive > gone) continue   // quá 1 giờ không thao tác → ẩn (coi như đã rời đi)
    const a = (out[c.userId] ??= { online: true, sessions: [], lastActiveAt: 0 })
    a.sessions.push({ since: c.since, lastActive: c.lastActive, idle: now - c.lastActive > idleMs, ip: ['::1', '127.0.0.1'].includes(c.ip) ? 'localhost' : c.ip, device: deviceOf(c.ua) })
    a.lastActiveAt = Math.max(a.lastActiveAt, c.lastActive)
  }
  for (const u of store.all('users')) {
    const a = (out[u.id] ??= { online: false, sessions: [] })
    a.state = !a.online ? 'offline' : now - a.lastActiveAt > idleMs ? 'idle' : 'active'
    a.lastSeenAt = Math.max(lastSeen.get(u.id) ?? 0, a.lastActiveAt ?? 0) || (u.lastLoginAt ? Date.parse(u.lastLoginAt) : null)
    a.lastLoginAt = u.lastLoginAt ?? null
  }
  // Người đang dùng thử (bản demo) — hiện chung trong danh sách “đang hoạt động” của Quản trị
  const demo = demoVisitors(idleMs).filter(v => now - v.lastActive <= gone).map(v => ({ ...v, device: deviceOf(v.ua), ua: undefined }))
  ok(res, { activity: out, demo, idleMinutes: idleMinutes(), at: now })
}))

/* ═══ Danh mục Khối dự án (Cài đặt hệ thống) ═══ */
function divisionsList() { return store.get('catalog', 'divisions')?.items ?? DEFAULT_DIVISIONS }
app.put('/api/divisions', h((req, res) => {
  adminOnly(req)
  // Danh mục khối dạng CÂY: { id, name, parentId } — trình duyệt tự sinh id cho mục mới (để mục con trỏ được tới cha mới)
  const list = Array.isArray(req.body?.items) ? req.body.items : []
  const items = [], ids = new Set()
  for (const x of list) {
    const name = String(x?.name ?? '').trim()
    if (!name) throw new BadRequest('Tên khối không được để trống')
    const id = /^[\w-]{1,40}$/.test(x?.id ?? '') ? x.id : uid('dv')
    if (ids.has(id)) throw new BadRequest('Danh mục khối bị trùng mã')
    ids.add(id); items.push({ id, name, parentId: String(x?.parentId ?? '') })
  }
  for (const d of items) {
    if (d.parentId && !ids.has(d.parentId)) throw new BadRequest(`Khối cha của “${d.name}” không tồn tại`)
    for (let p = d.parentId, n = 0; p; p = items.find(x => x.id === p)?.parentId, n++) if (p === d.id || n > 50) throw new BadRequest(`“${d.name}” không thể là con của chính nó`)
  }
  const sib = new Set()
  for (const d of items) { const k = `${d.parentId}|${d.name.toLowerCase()}`; if (sib.has(k)) throw new BadRequest(`“${d.name}” bị trùng trong cùng cấp`); sib.add(k) }
  // Không xóa khối đang có dự án
  const used = new Set(store.all('projects').map(p => p.divisionId).filter(Boolean))
  const removed = divisionsList().filter(d => used.has(d.id) && !ids.has(d.id))
  if (removed.length) throw new BadRequest(`Khối “${removed[0].name}” đang có dự án — chuyển dự án sang khối khác trước khi xóa`)
  // Khối có người dùng: xóa khối thì gỡ khối khỏi những người đó (thông tin thống kê, không chặn xóa)
  const gone = new Set(divisionsList().map(d => d.id).filter(i => !ids.has(i)))
  const freed = store.all('users').filter(u => u.divisionId && gone.has(u.divisionId))
  store.tx(() => {
    store.put('catalog', { id: 'divisions', items: items.map(d => (d.parentId ? d : { id: d.id, name: d.name })) })
    freed.forEach(u => store.put('users', { ...u, divisionId: '' }))
  })
  changed(req, res, { items: divisionsList() })
}))

/* Chuyển dữ liệu cũ: danh mục “Nhóm dự án” (đã bỏ) → mục con của khối trong cây; dự án thuộc nhóm → thuộc mục con đó */
;(function migrateProjectGroups() {
  const groups = store.get('catalog', 'groups')?.items
  if (!groups?.length) return
  const divs = divisionsList()
  store.put('catalog', { id: 'divisions', items: [...divs, ...groups.filter(g => !divs.some(d => d.id === g.id)).map(g => ({ id: g.id, name: g.name, parentId: g.divisionId }))] })
  for (const p of store.all('projects').filter(x => x.groupId)) { const { groupId, ...rest } = p; store.put('projects', { ...rest, divisionId: groupId }) }
  store.del('catalog', 'groups')
  console.log(`🌳 Chuyển ${groups.length} nhóm dự án thành khối con trong cây`)
})()

/* ═══ Email gửi lời mời (Cài đặt hệ thống) — cấu hình SMTP nằm trong .env, ở đây chỉ xem + gửi thử ═══ */
app.get('/api/mail/settings', h((req, res) => { adminOnly(req); ok(res, mailInfo()) }))
app.post('/api/mail/test', h(async (req, res) => {
  adminOnly(req)
  const to = String(req.body?.to || req.user.email || '').trim()
  if (!to) throw new BadRequest('Chưa có email nhận thư thử')
  try { await sendTest(to) } catch (e) { throw Object.assign(new Error('Gửi thử thất bại: ' + (e.message || e)), { status: e.status || 502 }) }
  ok(res, { to })
}))

app.post('/api/users/:id/invite', h(async (req, res) => {
  const u = store.get('users', req.params.id)
  userAdminOnly(req, u)
  if (!u) throw new BadRequest('Không tìm thấy người dùng')
  if (!u.email) throw new BadRequest('Người dùng chưa có Gmail')
  if (u.status === 'disabled') throw new BadRequest('Tài khoản đang bị khóa — mở khóa trước khi mời')
  // Chưa hoạt động → lời mời (link đặt mật khẩu 7 ngày) · đã hoạt động → link đặt lại mật khẩu (1 giờ)
  const purpose = u.status === 'active' ? 'reset' : 'invite'
  if (purpose === 'invite') store.put('users', { ...u, status: 'invited', invitedAt: new Date().toISOString(), invitedBy: req.user.id })
  const token = issueSetupToken(u, purpose)
  const projects = store.all('projects').filter(p => p.memberIds.includes(u.id)).map(p => p.name).join(', ')
  const link = `${linkBase(req)}/dat-mat-khau?token=${token}`
  let sent = false, mailError = ''
  try {
    sent = purpose === 'invite'
      ? await sendInvite({ to: u.email, name: u.name, inviter: req.user.name, role: u.role || 'chưa phân', projects, link })
      : await sendPasswordLink({ to: u.email, name: u.name, link, purpose })
  } catch (e) { mailError = e.message }
  changed(req, res, { sent, link, mailError, mailEnabled, purpose })
}))

app.delete('/api/users/:id', h((req, res) => {
  adminOnly(req)
  const id = req.params.id
  if (id === req.user.id) throw new BadRequest('Không thể xóa chính mình')
  const target = store.get('users', id)
  if (!target) return ok(res)
  // Còn dữ liệu ở bất kỳ đâu (công việc PD / BA, bản chốt điểm, đang làm quản lý của người khác) → KHÔNG cho xóa
  const usage = userUsage(id, { tasks: store.all('tasks'), users: store.all('users'), closings: store.all('closings'), baClosings: store.all('baClosings') })
  if (usage.length) throw Object.assign(new BadRequest(usageMessage(target.name, usage)), { code: 'user_in_use' })
  store.tx(() => {
    store.all('projects').filter(p => p.memberIds.includes(id))
      .forEach(p => { const memberRoles = { ...(p.memberRoles ?? {}) }; delete memberRoles[id]; store.put('projects', { ...p, memberIds: p.memberIds.filter(m => m !== id), memberRoles }) })
    store.del('users', id)
    resolveNotifications(n => n.type === 'user_pending' && n.data?.userId === id)   // từ chối người chờ duyệt
  })
  changed(req, res, { deleted: true })
}))

/* ═══ Hệ số, chốt tháng, thông số tháng ═══ */
app.put('/api/config', h((req, res) => {
  // Quản trị hệ thống: mọi hệ số · Quản trị PD: hệ số PD (giữ nguyên phần BA) · Quản trị BA: chỉ phần BA (config.ba)
  const dept = deptAdminOf(req.user)
  if (!isAdmin(req.user) && !dept) deny('Chỉ Quản trị hệ thống / Quản trị PD / Quản trị BA được sửa hệ số')
  if (dept) {
    const old = { ...DEFAULT_CONFIG, ...(store.getConfig() ?? {}) }, next = req.body ?? {}
    const same = k => JSON.stringify(next[k] ?? null) === JSON.stringify(old[k] ?? null)
    if (dept === 'PD' && !same('ba')) deny('Quản trị PD chỉ sửa được hệ số PD')
    if (dept === 'BA' && Object.keys({ ...old, ...next }).some(k => k !== 'ba' && !same(k))) deny('Quản trị BA chỉ sửa được hệ số BA')
  }
  const c = req.body
  // Chỉ nhận bộ hệ số đủ khóa — tránh ghi đè cấu hình bằng body rỗng / thiếu
  if (!c || typeof c !== 'object' || Array.isArray(c) || Object.keys(DEFAULT_CONFIG).some(k => !(k in c))) {
    throw Object.assign(new Error('Bộ hệ số không hợp lệ'), { status: 400 })
  }
  store.setConfig(c); changed(req, res)
}))

/* ═══ AI bóc tách ảnh chụp → danh sách công việc ═══ */
const maskKey = k => (k ? k.slice(0, 4) + '•'.repeat(8) + k.slice(-4) : '')
app.get('/api/ai/settings', h((req, res) => { adminOnly(req); const a = aiSettings(); ok(res, { hasKey: !!a.apiKey, keyMasked: maskKey(a.apiKey), model: a.model || DEFAULT_AI_MODEL }) }))
app.put('/api/ai/settings', h((req, res) => {
  adminOnly(req)
  const a = aiSettings(), b = req.body ?? {}
  const next = { id: 'ai', apiKey: 'apiKey' in b ? String(b.apiKey ?? '').trim() : a.apiKey, model: String(b.model || a.model || DEFAULT_AI_MODEL), updatedBy: req.user.id, updatedAt: new Date().toISOString() }
  store.put('settings', next)
  changed(req, res, { hasKey: !!next.apiKey, keyMasked: maskKey(next.apiKey), model: next.model })
}))
/* AI gợi ý độ phức tạp nghiệp vụ từ nội dung + mô tả giải pháp sơ bộ (quy tắc lấy từ scoring.js — trang Quy tắc chấm điểm) */
/* Trợ lý AVA: hỏi đáp cách chấm điểm / dùng app — kiến thức theo quy tắc + hệ số đang cấu hình; câu ngoài phạm vi AVA tự từ chối */
// Chặn hỏi lặp cùng 1 câu (spam) → trả lại câu trả lời trước, không gọi AI (server/avaRepeat.js)
const avaRepeat = createAvaRepeat()
// Hỏi lại GẦN GIỐNG câu vừa hỏi → gửi lại câu trả lời trước · hỏi DỒN DẬP không đọc → tạm khóa 3 phút (skill ai-assistant-cost, mục 4b)
const avaSimilar = createAvaSimilar(qSig, qSim), avaPace = createAvaPace()
/* Từ chung chung (không mang nội dung) — câu CHỈ gồm các từ này (“giải thích đi”, “hướng dẫn”, “cái này sao”) = câu mơ hồ → hỏi lại */
const VAGUE_WORDS = new Set('giai thich huong dan chi tiet hon nua cai nay do kia sao tom tat noi ro them lam di nhe duoc khong kiem tra dung chuan chua cach tiep tuc vi du hoi gi day nao roi hieu biet muon can tro giup support help explain'.split(' '))
const ctxHash = o => { const t = o ? JSON.stringify(o) : ''; let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return h.toString(36) }
/* ── Dùng lại câu trả lời trong Lịch sử hỏi AVA (không gọi AI) — server/avaReuse.js ──
   · Lượt hỏi đầu, không ảnh, câu hỏi TRÙNG nghĩa từ với câu đã trả lời (cùng nhóm vai trò + chủ đề PD / BA + tri thức chưa đổi) → trả lời luôn
   · Câu GẦN GIỐNG → khung AVA hiện “Có phải bạn định hỏi…” khi đang gõ, người hỏi bấm chọn mới dùng lại
   Không dùng: câu bị 👎, Quản trị tắt, câu kèm ảnh / có thao tác / có thông tin riêng của người hỏi, câu cũ hơn REUSE_DAYS ngày */
const REUSE_DAYS = 60, LEGACY_DAYS = 14, sigMemo = new Map()
const roleGroupOf = u => `${u?.role || ''}/${deptAdminOf(u) || ''}`
const sigOf = l => { let v = sigMemo.get(l.id); if (!v) { v = qSig(l.question); sigMemo.set(l.id, v) } return v }
function reusePool(me, focus) {
  const group = roleGroupOf(me), stamp = avaKnowledgeStamp(store.getConfig()), since = new Date(Date.now() - REUSE_DAYS * 86400e3).toISOString()
  const legacySince = new Date(Date.now() - LEGACY_DAYS * 86400e3).toISOString(), users = new Map(store.all('users').map(u => [u.id, u]))
  return store.all('avaLogs').filter(l => l.status === 'answered' && !l.reuseOf && !l.noReuse && l.vote !== 'down' && !l.images && !l.demo && l.question && l.answer
    && (l.focus || '') === focus && l.at >= since)
    .map(l => {
      if (l.kstamp) return l.reusable && l.rgroup === group && l.kstamp === stamp ? { l, exact: true } : null
      // Lượt hỏi cũ (chưa ghi dấu) → chỉ GỢI Ý (người hỏi tự chọn): cùng nhóm vai trò với người hỏi cũ, không có thông tin riêng, trong LEGACY_DAYS ngày
      const u = users.get(l.userId)
      return l.at >= legacySince && roleGroupOf(u) === group && !isPersonal(l.answer, u?.name) && !isDeictic(l.question) ? { l, exact: false } : null
    }).filter(Boolean).sort((a, b) => b.l.at.localeCompare(a.l.at))
}
function reuseLog(req, src, focus, question) {
  const log = { id: uid('ava'), userId: req.user.id, at: new Date().toISOString(), question: question || src.question, answer: src.answer, status: 'answered', focus, rgroup: roleGroupOf(req.user), reuseOf: src.id }
  store.put('avaLogs', log)
  return { text: src.answer, logId: log.id, refused: false, reused: true }
}
/* Đang gõ → câu đã có câu trả lời gần giống */
app.get('/api/ai/ava/similar', requireActive, h((req, res) => {
  const focus = ['PD', 'BA'].includes(req.query.focus) ? req.query.focus : '', s = qSig(String(req.query.q || '').slice(0, 500))
  if (s.length < 2) return ok(res, { items: [] })
  const seen = new Set(), out = []
  for (const { l } of reusePool(req.user, focus)) {
    const cs = sigOf(l), k = cs.join(' ')
    if (seen.has(k)) continue
    const { j, shared } = qSim(s, cs)
    if (shared < 2 || j < 0.5) continue
    seen.add(k); out.push({ l, score: j + (l.vote === 'up' ? 0.05 : 0) })
  }
  ok(res, { items: out.sort((a, b) => b.score - a.score).slice(0, 3).map(({ l }) => ({ id: l.id, question: l.question })) })
}))
/* Người hỏi bấm chọn câu gợi ý → lấy câu trả lời đã có; câu đã cũ → 410, khung AVA hỏi AI như thường */
app.post('/api/ai/ava/reuse', requireActive, h((req, res) => {
  const focus = ['PD', 'BA'].includes(req.body?.focus) ? req.body.focus : ''
  const hit = reusePool(req.user, focus).find(x => x.l.id === String(req.body?.id || ''))
  if (!hit) throw Object.assign(new Error('Câu trả lời này đã cũ — AVA sẽ trả lời lại'), { status: 410 })
  ok(res, reuseLog(req, hit.l, focus))
}))
/* Quản trị tắt / bật dùng lại 1 câu trả lời (Lịch sử hỏi AVA) */
app.put('/api/admin/ava-logs/:id/reuse', h((req, res) => {
  adminOnly(req)
  const l = store.get('avaLogs', req.params.id)
  if (!l) throw Object.assign(new Error('Không tìm thấy lượt hỏi'), { status: 404 })
  store.put('avaLogs', { ...l, noReuse: !req.body?.on }); ok(res, { ok: true })
}))
app.post('/api/ai/ava', requireActive, h(async (req, res) => {
  const a = aiSettings()
  if (!a.apiKey) throw new BadRequest('Quản trị chưa cấu hình API key Google AI Studio')
  const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : []
  const question = String([...messages].reverse().find(m => m?.role === 'user')?.text ?? '').trim().slice(0, 2000)
  // Lưu lịch sử hỏi (Quản trị xem ở “Lịch sử hỏi AVA”, giữ AVA_KEEP_DAYS ngày) — lỗi AI cũng lưu để biết AVA có trả lời được không
  const focus = ['PD', 'BA'].includes(req.body?.focus) ? req.body.focus : ''
  const imageCount = cleanImages(messages.at(-1)?.images).length   // ảnh chỉ đi kèm lượt hỏi cuối
  const rep = imageCount ? { key: '', hit: null } : avaRepeat.check(req.user.id, question, `${focus}|${ctxHash(req.body?.context)}`)
  if (rep.hit) {
    if (rep.hit.kind === 'cached') return ok(res, { ...rep.hit.answer, text: REPEAT_NOTE + rep.hit.answer.text, repeated: true })
    return ok(res, { text: rep.hit.kind === 'pending' ? PENDING_TEXT : STOP_TEXT, repeated: true })
  }
  const simCtx = `${focus}|${ctxHash(req.body?.context)}`
  if (!imageCount && question) {
    if (avaPace.blocked(req.user.id)) return ok(res, { text: SPAM_TEXT, repeated: true, spam: true })
    const sim = avaSimilar.find(req.user.id, simCtx, question)
    if (sim) return ok(res, { ...sim, text: SIMILAR_NOTE + sim.text, repeated: true })
    // Lượt ĐẦU, không ngữ cảnh màn hình, câu gần như không có nội dung (≤ 1 từ có nghĩa) → hỏi lại, không gọi AI
    if (messages.filter(m => m?.role === 'user').length === 1 && !req.body?.context && !qSig(question).some(t => !VAGUE_WORDS.has(t)))
      return ok(res, { text: 'Bạn muốn hỏi cụ thể về phần nào? Câu hỏi còn hơi chung nên AVA chưa trả lời ngay (tránh trả lời lan man, không đúng ý). Nói rõ thêm 1 chút, VD:\n\n- “PD cần cập nhật những trường nào để được tính điểm?”\n- “Màn phụ khác màn chính thế nào?”\n- “Khi nào chốt điểm tháng?”', clarify: true })
  }
  // Câu hỏi trùng (lượt đầu, không ảnh, không chỉ vào thứ đang mở) → dùng lại câu trả lời đã có, không gọi AI, không tính lượt
  const firstTurn = !imageCount && messages.filter(m => m?.role === 'user').length === 1 && !(req.body?.context && isDeictic(question))
  if (firstTurn && question && !OPEN_DEMO) {
    const k = qSig(question).join(' ')
    const same = k && reusePool(req.user, focus).find(x => x.exact && sigOf(x.l).join(' ') === k)
    if (same) { const out = reuseLog(req, same.l, focus, question); avaRepeat.done(rep.key, out); return ok(res, out) }
  }
  avaRepeat.start(rep.key)
  const log = { id: uid('ava'), userId: req.user.id, at: new Date().toISOString(), question, answer: '', status: 'answered', focus, rgroup: roleGroupOf(req.user), kstamp: avaKnowledgeStamp(store.getConfig()), ...(imageCount ? { images: imageCount } : {}) }
  // Lưu ảnh 30 ngày cho Quản trị xem (tự xóa) — tiến trình bản dùng thử không lưu: lượt khách do bản thật ghi + lưu ảnh (demo.js)
  if (imageCount && !OPEN_DEMO) log.imageFiles = saveAvaImages(log.id, messages.at(-1).images)
  try {
    // Người hỏi: vai trò + quyền thật (đếm theo dự án / người mình quản lý) → AVA hướng dẫn đúng việc họ làm được
    const me = req.user, cnt = { manager: 0, member: 0, viewer: 0 }
    for (const p of store.all('projects')) if (p.memberIds?.includes(me.id)) { const r0 = projectRole(me, p.id); if (cnt[r0] !== undefined) cnt[r0]++ }
    // Dự án người hỏi vào được (+ vai trò, vòng lặp hiện tại) → AVA chỉ đúng dự án, gửi link làm ngay. Dự án mình tham gia xếp trước, tối đa 120
    const vv = viewOf(me), today = new Date().toISOString().slice(0, 10), its = store.all('iterations')
    const projects = store.all('projects').filter(p => vv.memberPids.has(p.id))
      .sort((a, b) => (b.memberIds?.includes(me.id) ? 1 : 0) - (a.memberIds?.includes(me.id) ? 1 : 0)).slice(0, 120)
      .map(p => {
        const list = its.filter(i => i.projectId === p.id)
        const cur = list.find(i => i.startDate <= today && today <= i.endDate) ?? [...list].sort((x, y) => (y.startDate || '').localeCompare(x.startDate || ''))[0]
        return { id: p.id, name: p.name, code: p.code || '', role: projectRole(me, p.id), member: !!p.memberIds?.includes(me.id), iterations: list.length, current: cur?.name || '' }
      })
    const asker = { name: me.name, role: me.role, deptAdmin: deptAdminOf(me), projects, canCreateProject: canCreateProject(me), ...cnt, reports: store.all('users').filter(x => x.status !== 'disabled' && managerIdsOf(x).includes(me.id)).length }
    // Ngữ cảnh màn đang mở (dự án / vòng lặp / việc đang xem) — để AVA đề xuất thao tác đúng chỗ; giới hạn kích thước
    const context = req.body?.context && JSON.stringify(req.body.context).length < 30000 ? req.body.context : null
    const r = await askAvaWithGemini({ apiKey: a.apiKey, model: a.model, cfg: store.getConfig(), messages, focus, asker, context })
    Object.assign(log, { answer: r.text.slice(0, 8000), status: r.refused ? 'refused' : 'answered',
      reusable: firstTurn && !r.refused && !r.action && !isPersonal(r.text, me.name) })   // dùng lại được cho người cùng nhóm vai trò hỏi trùng
    avaRepeat.done(rep.key, { ...r, logId: log.id })
    if (!imageCount && !r.refused && !r.action) avaSimilar.add(req.user.id, simCtx, question, { ...r, logId: log.id })
    avaPace.done(req.user.id, (r.text || '').length)
    ok(res, { ...r, logId: log.id })   // logId → người hỏi bấm Like / Dislike cho đúng lượt này
  } catch (e) { avaRepeat.fail(rep.key); Object.assign(log, { answer: e.message || 'Lỗi', status: 'error' }); throw e }
  finally { if (question) store.put('avaLogs', log) }
}))
/* Người hỏi đánh giá câu trả lời: { logId, vote: 'up' | 'down' | '' (bỏ), note? } — chỉ lượt của chính mình; Quản trị xem ở Lịch sử hỏi AVA */
app.post('/api/ai/ava/feedback', requireActive, h((req, res) => {
  const log = store.get('avaLogs', String(req.body?.logId ?? ''))
  if (!log || log.userId !== req.user.id) throw new BadRequest('Không tìm thấy câu trả lời')
  const vote = ['up', 'down'].includes(req.body?.vote) ? req.body.vote : ''
  const note = vote === 'down' ? String(req.body?.note ?? '').trim().slice(0, 500) : ''
  const next = { ...log, vote, voteNote: note, votedAt: vote ? new Date().toISOString() : '' }
  store.put('avaLogs', next)
  // Câu dùng lại bị chê → thôi dùng lại câu gốc (Quản trị bật lại được ở Lịch sử hỏi AVA)
  if (vote === 'down' && log.reuseOf) { const src = store.get('avaLogs', log.reuseOf); if (src) store.put('avaLogs', { ...src, noReuse: true }) }
  ok(res, { vote, note })
}))
/* Ảnh người dùng gửi AVA (lưu 30 ngày) — chỉ Quản trị */
app.get('/api/admin/ava-images/:day/:file', h((req, res) => {
  adminOnly(req)
  const p = avaImagePath(req.params.day, req.params.file)
  if (!p) throw Object.assign(new Error('Ảnh đã hết hạn lưu (30 ngày) hoặc không tồn tại'), { status: 404 })
  res.set('Cache-Control', 'private, max-age=86400').sendFile(p)
}))
/* Lịch sử hỏi AVA — chỉ Quản trị; lọc / thống kê làm ở trình duyệt */
app.get('/api/admin/ava-logs', h((req, res) => {
  adminOnly(req)
  const logs = [...store.all('avaLogs')].sort((x, y) => y.at.localeCompare(x.at)).slice(0, 5000)
    .map(l => (l.demo ? { ...l, device: deviceOf(l.ua || ''), ua: undefined } : l))   // lượt khách (bản dùng thử): kèm máy / trình duyệt
  const ids = new Set(logs.map(l => l.userId))
  const users = Object.fromEntries(store.all('users').filter(u => ids.has(u.id)).map(u => [u.id, { id: u.id, name: u.name, code: u.code, email: u.email, picture: u.picture, role: u.role }]))
  const reuseCount = new Map(); for (const l of logs) if (l.reuseOf) reuseCount.set(l.reuseOf, (reuseCount.get(l.reuseOf) || 0) + 1)
  ok(res, { logs: logs.map(l => (reuseCount.has(l.id) ? { ...l, reuseCount: reuseCount.get(l.id) } : l)), users, keepDays: AVA_KEEP_DAYS })
}))
app.post('/api/ai/suggest-complexity', requireActive, h(async (req, res) => {
  const a = aiSettings()
  if (!a.apiKey) throw new BadRequest('Quản trị chưa cấu hình API key Google AI Studio')
  const content = String(req.body?.content ?? '').slice(0, 2000), brief = String(req.body?.brief ?? '').slice(0, 4000), concept = String(req.body?.concept ?? '').slice(0, 2000)
  if (!brief.trim() && !content.trim()) throw new BadRequest('Chưa có nội dung / mô tả giải pháp để đánh giá')
  ok(res, await suggestComplexityWithGemini({ apiKey: a.apiKey, model: a.model, content, brief, concept }))
}))
app.post('/api/ai/extract-tasks', h(async (req, res) => {
  const a = aiSettings()
  if (!a.apiKey) throw new BadRequest('Quản trị chưa cấu hình API key Google AI Studio')
  const { imageBase64, mimeType, test } = req.body ?? {}
  if (test) { adminOnly(req) }                               // nút “Kiểm tra kết nối” ở trang Cài đặt
  else if (!imageBase64) throw new BadRequest('Thiếu ảnh')
  try {
    const rows = await extractTasksWithGemini({ apiKey: a.apiKey, model: a.model, imageBase64: imageBase64 || TEST_PNG, mimeType: mimeType || 'image/png' })
    ok(res, { rows })
  } catch (e) { throw new BadRequest('AI: ' + e.message) }
}))
// Ảnh 1×1 trắng — dùng kiểm tra key
const TEST_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='

/* Chốt điểm theo từng PD — máy chủ tự chụp bảng điểm (không tin dữ liệu gửi lên) */
app.put('/api/closings/:month/:pdId', h((req, res) => {
  const { month, pdId } = req.params
  if (!/^\d{4}-\d{2}$/.test(month)) throw new BadRequest('Tháng không hợp lệ')
  if (!canClosePd(req.user, pdId)) deny('Chỉ quản lý trực tiếp của PD hoặc Quản trị được chốt điểm')
  if (closingFor(month, pdId)) throw new BadRequest('PD đã được chốt điểm tháng này')
  // Thông số do người chốt điền (nghỉ lễ, ngày làm thực tế, effort, kỳ vọng) — thiếu thì lấy mặc định
  const def = closingParams(month, store.get('months', month), store.get('users', pdId))
  const inp = req.body?.params
  const num = (v, d) => (v === '' || v == null || !Number.isFinite(Number(v)) ? d : Math.max(0, Number(v)))
  const params = inp ? (() => {
    const holidays = num(inp.holidays, 0), workingDays = workingDaysOf(month, holidays)
    return { holidays, workingDays, person: { actualDays: num(inp.actualDays, workingDays), effort: num(inp.effort, 100), target: num(inp.target, def.person.target) } }
  })() : def
  const c = buildClosing(month, pdId, store.all('tasks'), store.getConfig(), req.user.id, params, undefined, { users: store.all('users'), closings: store.all('closings') })
  c.projects = pdProjectsOf(store.all('projects'), pdId)   // dự án tham gia lúc chốt
  store.put('closings', c)
  changed(req, res, { closing: c })
}))
/* ═══ Chốt điểm BA (theo người, theo tháng) ═══ */
app.put('/api/ba-closings/:month/:baId', h((req, res) => {
  const { month, baId } = req.params
  if (!/^\d{4}-\d{2}$/.test(month)) throw new BadRequest('Tháng không hợp lệ')
  if (!canCloseBa(req.user, baId, month)) deny('Chỉ quản lý trực tiếp của người này hoặc Quản trị được chốt điểm')
  if (baClosingFor(month, baId)) throw new BadRequest('Điểm BA tháng này đã được chốt')
  const c = buildBaClosing(month, baId, store.all('tasks'), store.getConfig(), req.user.id)
  // Thông số người chốt nhập (giống chốt PD): nghỉ lễ, ngày làm việc, ngày làm thực tế, effort — chốt được cả người 0 điểm
  const inp = req.body?.params, num = (v, d) => (v === '' || v == null || !Number.isFinite(Number(v)) ? d : Math.max(0, Number(v)))
  if (inp) { const wd = workingDaysOf(month, num(inp.holidays, 0)); c.params = { holidays: num(inp.holidays, 0), workingDays: wd, actualDays: num(inp.actualDays, wd), effort: num(inp.effort, 100) } }
  store.put('baClosings', c)
  changed(req, res, { closing: c })
}))
app.delete('/api/ba-closings/:month/:baId', h((req, res) => {
  const { month, baId } = req.params
  if (!canCloseBa(req.user, baId, month)) deny('Không có quyền mở chốt điểm BA này')
  store.del('baClosings', `${month}:${baId}`)
  changed(req, res)
}))
app.delete('/api/closings/:month/:pdId', h((req, res) => {
  const { month, pdId } = req.params
  if (!canReopenPd(req.user, pdId)) deny('Chỉ quản lý trực tiếp của PD hoặc Quản trị được mở chốt')
  store.del('closings', `${month}:${pdId}`)
  changed(req, res)
}))
/* Bản chốt cả tháng kiểu cũ — chỉ Quản trị mở */
app.delete('/api/closings/:month', h((req, res) => { adminOnly(req); store.del('closings', req.params.month); changed(req, res) }))

/* Thông số tháng: nghỉ lễ — Quản trị; ngày làm / effort / kỳ vọng — quản lý trực tiếp của PD hoặc Quản trị, khi PD chưa chốt.
   Chỉ ghi phần mình được sửa, phần còn lại giữ nguyên (người dùng chỉ thấy một phần dữ liệu). */
app.put('/api/months/:month', h((req, res) => {
  const u = req.user, month = req.params.month
  const old = store.get('months', month) ?? { holidays: 0, people: {} }
  const { holidays = old.holidays, people = {} } = req.body
  const next = { id: month, holidays: old.holidays ?? 0, people: { ...(old.people ?? {}) } }
  if (Number(holidays) !== Number(old.holidays ?? 0)) {
    if (!isAdmin(u) && deptAdminOf(u) !== 'PD') deny('Chỉ Quản trị hệ thống / Quản trị PD được sửa ngày nghỉ lễ')
    next.holidays = Math.max(0, Number(holidays) || 0)
  }
  for (const [pdId, val] of Object.entries(people)) {
    if (JSON.stringify(val) === JSON.stringify(old.people?.[pdId])) continue
    if (!canClosePd(u, pdId)) deny('Chỉ quản lý trực tiếp của PD hoặc Quản trị được nhập thông số')
    if (closingFor(month, pdId)) deny('PD đã chốt điểm tháng này')
    const clean = {}
    for (const k of ['actualDays', 'effort', 'target']) if (k in (val ?? {})) clean[k] = Math.max(0, Number(val[k]) || 0)
    next.people[pdId] = clean
  }
  store.put('months', next)
  changed(req, res)
}))

/* ═══ Giao diện (build Vite) — SPA fallback ═══ */
if (fs.existsSync(DIST)) {
  // File có hash trong tên (assets/) → cache 1 năm; index.html luôn lấy bản mới để nhận phiên bản app mới
  app.use('/assets', precompressed(path.join(DIST, 'assets')))   // bản .br / .gz nén sẵn lúc build → không nén lại mỗi lượt tải
  app.use('/assets', express.static(path.join(DIST, 'assets'), { immutable: true, maxAge: '1y', index: false }))
  // File cài chứng chỉ HTTPS (trang /cai-chung-chi): đúng kiểu nội dung để iPhone / iPad / Android nhận ra
  const CERT_TYPES = { '.mobileconfig': 'application/x-apple-aspen-config', '.crt': 'application/x-x509-ca-cert', '.bat': 'application/octet-stream' }
  app.use(express.static(DIST, { index: false, maxAge: '1h', setHeaders: (res, p) => { const t = CERT_TYPES[path.extname(p)]; if (t) res.setHeader('Content-Type', t) } }))
  app.get(/^\/(?!api\/).*/, (_req, res) => { res.set('Cache-Control', 'no-cache'); res.sendFile(path.join(DIST, 'index.html')) })
}

/* ── Cổng: HTTP (PORT, mặc định 8080) + HTTPS (HTTPS_PORT, mặc định 443) khi có chứng chỉ HTTPS_CERT / HTTPS_KEY.
   HTTPS_REDIRECT=1: cổng HTTP chỉ chuyển hướng sang https (bật khi chứng chỉ đã được trình duyệt tin cậy). ── */
function onReady() {
  console.log(`✓ Solution Point chạy tại ${APP_URL} (cổng ${PORT}${tls ? ` · https ${HTTPS_PORT}` : ''}) · DB: ${store.DB_FILE}`)
  if (OPEN_DEMO) console.warn('⚠️  OPEN_DEMO=1 — không cần đăng nhập, ai mở app cũng vào được và chuyển sang bất kỳ người dùng nào. Chỉ dùng để thử.')
  if (!GOOGLE_CLIENT_ID) console.warn('⚠️  Chưa đặt GOOGLE_CLIENT_ID — chưa đăng nhập được.')
  if (!mailEnabled) console.warn('ℹ️  Chưa cấu hình SMTP — lời mời sẽ hiện link để Quản trị tự gửi.')
  // Nén dữ liệu cũ (năm trước đã chốt / quá 2 năm) vào bảng lưu trữ — xong báo các máy đang mở bỏ dữ liệu đã nén
  scheduleRetention(() => broadcast({ get: () => '' }))
  startDemo(() => aiSettings())   // bản dùng thử (tiến trình con, DB riêng) — dùng chung key AI (có giới hạn lượt)
  // Đồng bộ Google Sheet tự động (vòng lặp có gắn link) — kiểm tra mỗi giờ, mỗi vòng lặp tối đa 1 lần / ngày
  const autoAll = () => autoSheetSync().then(autoProjectSync).catch(e => console.error('Đồng bộ Sheet lỗi:', e))
  setTimeout(autoAll, 60e3).unref()
  setInterval(autoAll, 3600e3).unref()
}
const HTTPS_PORT = Number(process.env.HTTPS_PORT || 443)
const tls = process.env.HTTPS_CERT && process.env.HTTPS_KEY && fs.existsSync(process.env.HTTPS_CERT) && fs.existsSync(process.env.HTTPS_KEY)
  ? { cert: fs.readFileSync(process.env.HTTPS_CERT), key: fs.readFileSync(process.env.HTTPS_KEY) } : null
if (tls) {
  https.createServer(tls, app).listen(HTTPS_PORT)
  if (process.env.HTTPS_REDIRECT === '1') {
    http.createServer((req, res) => {
      const host = String(req.headers.host || '').replace(/:\d+$/, '')
      res.writeHead(301, { Location: `https://${host}${HTTPS_PORT === 443 ? '' : ':' + HTTPS_PORT}${req.url}` }).end()
    }).listen(PORT, onReady)
  } else app.listen(PORT, process.env.HOST || undefined, onReady)
} else app.listen(PORT, process.env.HOST || undefined, onReady)   // HOST=127.0.0.1: tiến trình dùng thử chỉ nghe nội bộ
