/* ═══════════════════════════════════════════════════════════════════════════
   Tài liệu MISA Design System — CHẠY RIÊNG (không cần PD Point)
     node server/standalone.js        (đọc cấu hình từ mds-docs/.env nếu có)
   Khác với khi gắn vào PD Point:
     · Đăng nhập: tài khoản nội bộ (email + mật khẩu) lưu ở <dữ liệu>/accounts.json — chỉ người BIÊN TẬP cần đăng nhập, ai cũng đọc được
     · Quản trị đầu tiên: tạo từ ADMIN_EMAIL + ADMIN_PASSWORD (+ ADMIN_NAME) khi chưa có tài khoản nào
     · Khóa AI cho AVA: AI_API_KEY, AI_MODEL trong .env
   Biến môi trường: PORT (8080) · HOST (0.0.0.0) · MDS_DOCS_DATA (mds-docs/data) · SESSION_SECRET · APP_URL (https → cookie Secure)
   ═══════════════════════════════════════════════════════════════════════════ */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { parseEnv } from 'node:util'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
/* .env của mds-docs — biến đã đặt sẵn (systemd, dòng lệnh) được ưu tiên */
for (const f of [path.join(ROOT, '.env'), path.join(ROOT, 'server', '.env')]) {
  if (!fs.existsSync(f)) continue
  for (const [k, v] of Object.entries(parseEnv(fs.readFileSync(f, 'utf8')))) if (process.env[k] === undefined) process.env[k] = v
  break
}

const { default: express } = await import('express')
const { default: compression } = await import('compression')
const { mountDocs } = await import('./docs.js')

const PORT = Number(process.env.PORT) || 8080
const HOST = process.env.HOST || '0.0.0.0'
const DATA = path.resolve(process.env.MDS_DOCS_DATA || path.join(ROOT, 'data'))
const SECURE = /^https:/i.test(process.env.APP_URL || '')
fs.mkdirSync(DATA, { recursive: true })

/* ── Khóa phiên: SESSION_SECRET, không có thì tự sinh 1 lần và lưu trong thư mục dữ liệu ── */
let SECRET = process.env.SESSION_SECRET
if (!SECRET) {
  const f = path.join(DATA, '.session-secret')
  if (!fs.existsSync(f)) fs.writeFileSync(f, crypto.randomBytes(32).toString('hex'), { mode: 0o600 })
  SECRET = fs.readFileSync(f, 'utf8').trim()
}

/* ── Tài khoản nội bộ: <dữ liệu>/accounts.json { accounts: [{ id, name, email, role: admin|editor, status: active|disabled, salt, hash, createdAt }] } ── */
const ACC_FILE = path.join(DATA, 'accounts.json')
const readAccounts = () => { try { return JSON.parse(fs.readFileSync(ACC_FILE, 'utf8')).accounts || [] } catch { return [] } }
const saveAccounts = list => { const t = `${ACC_FILE}.${process.pid}.tmp`; fs.writeFileSync(t, JSON.stringify({ accounts: list }, null, 1), { mode: 0o600 }); fs.renameSync(t, ACC_FILE) }
const hashPw = (pw, salt) => crypto.scryptSync(String(pw), salt, 64).toString('hex')
const normEmail = e => String(e || '').trim().toLowerCase()
const pub = a => ({ id: a.id, name: a.name, email: a.email, role: a.role, status: a.status, createdAt: a.createdAt })
function newAccount({ name, email, password, role }) {
  const salt = crypto.randomBytes(16).toString('hex')
  return { id: crypto.randomUUID(), name: String(name || '').trim() || normEmail(email), email: normEmail(email), role: role === 'admin' ? 'admin' : 'editor', status: 'active', salt, hash: hashPw(password, salt), createdAt: new Date().toISOString() }
}
if (!readAccounts().length) {
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    saveAccounts([newAccount({ name: process.env.ADMIN_NAME || 'Quản trị', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'admin' })])
    console.log(`✓ Đã tạo tài khoản Quản trị đầu tiên: ${normEmail(process.env.ADMIN_EMAIL)} (đổi mật khẩu sau khi đăng nhập)`)
  } else console.warn('⚠️  Chưa có tài khoản nào — đặt ADMIN_EMAIL + ADMIN_PASSWORD trong .env rồi khởi động lại để tạo Quản trị đầu tiên.')
}

/* ── Phiên đăng nhập: cookie ký HMAC { uid, exp } — 30 ngày ── */
const COOKIE = 'mdsd_sess', MAX_AGE = 30 * 24 * 3600e3
const sign = v => crypto.createHmac('sha256', SECRET).update(v).digest('base64url')
const makeToken = uid => { const v = Buffer.from(JSON.stringify({ uid, exp: Date.now() + MAX_AGE })).toString('base64url'); return `${v}.${sign(v)}` }
function readToken(t) {
  const [v, s] = String(t || '').split('.')
  if (!v || !s || s.length !== sign(v).length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(sign(v)))) return null
  try { const p = JSON.parse(Buffer.from(v, 'base64url').toString()); return p.exp > Date.now() ? p.uid : null } catch { return null }
}
const cookieOf = req => Object.fromEntries(String(req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(x => x[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]))
const setCookie = (res, val, maxAge) => res.append('Set-Cookie', `${COOKIE}=${val}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(maxAge / 1000)}${SECURE ? '; Secure' : ''}`)
function loadUser(req, _res, next) {
  const uid = readToken(cookieOf(req)[COOKIE])
  const a = uid && readAccounts().find(x => x.id === uid && x.status === 'active')
  req.user = a ? pub(a) : null
  next()
}

const app = express()
app.set('trust proxy', true)
app.disable('x-powered-by')

/* ── Đăng nhập / đăng xuất ── */
const tries = new Map()   // chặn dò mật khẩu: tối đa 10 lần sai / 15 phút / IP
app.post('/api/auth/login', express.json(), (req, res) => {
  const ip = req.ip || '?', now = Date.now(), list = (tries.get(ip) || []).filter(t => now - t < 15 * 60e3)
  if (list.length >= 10) return res.status(429).json({ ok: false, error: 'Sai quá nhiều lần — thử lại sau 15 phút' })
  const a = readAccounts().find(x => x.email === normEmail(req.body?.email))
  if (!a || a.status !== 'active' || !crypto.timingSafeEqual(Buffer.from(hashPw(req.body?.password || '', a.salt)), Buffer.from(a.hash))) {
    list.push(now); tries.set(ip, list)
    return res.status(401).json({ ok: false, error: a?.status === 'disabled' ? 'Tài khoản đã bị khóa — liên hệ Quản trị' : 'Email hoặc mật khẩu không đúng' })
  }
  tries.delete(ip)
  setCookie(res, makeToken(a.id), MAX_AGE)
  res.json({ ok: true, user: pub(a) })
})
app.post('/api/auth/logout', (_req, res) => { setCookie(res, '', 0); res.json({ ok: true }) })
/* Tự đổi mật khẩu (mọi tài khoản đang đăng nhập) */
app.post('/api/auth/password', express.json(), loadUser, (req, res) => {
  if (!req.user) return res.status(401).json({ ok: false, error: 'Đăng nhập để tiếp tục' })
  const list = readAccounts(), a = list.find(x => x.id === req.user.id)
  if (!crypto.timingSafeEqual(Buffer.from(hashPw(req.body?.current || '', a.salt)), Buffer.from(a.hash))) return res.status(400).json({ ok: false, error: 'Mật khẩu hiện tại không đúng' })
  if (String(req.body?.password || '').length < 8) return res.status(400).json({ ok: false, error: 'Mật khẩu mới tối thiểu 8 ký tự' })
  a.salt = crypto.randomBytes(16).toString('hex'); a.hash = hashPw(req.body.password, a.salt)
  saveAccounts(list); res.json({ ok: true })
})

/* ── Tài khoản (chỉ Quản trị) ── */
const acc = express.Router()
acc.use(express.json(), loadUser)
acc.use((req, res, next) => (req.user?.role === 'admin' ? next() : res.status(req.user ? 403 : 401).json({ ok: false, error: req.user ? 'Chỉ Quản trị được thực hiện' : 'Đăng nhập để tiếp tục' })))
const bad = (res, msg) => res.status(400).json({ ok: false, error: msg })
const validPw = pw => String(pw || '').length >= 8
acc.get('/', (_req, res) => { res.set('Cache-Control', 'no-store'); res.json({ accounts: readAccounts().map(pub) }) })
acc.post('/', (req, res) => {
  const b = req.body || {}, list = readAccounts()
  if (!/^\S+@\S+\.\S+$/.test(normEmail(b.email))) return bad(res, 'Email không hợp lệ')
  if (list.some(a => a.email === normEmail(b.email))) return bad(res, 'Email này đã có tài khoản')
  if (!validPw(b.password)) return bad(res, 'Mật khẩu tối thiểu 8 ký tự')
  const a = newAccount(b); saveAccounts([...list, a]); res.json({ account: pub(a) })
})
acc.put('/:id', (req, res) => {
  const b = req.body || {}, list = readAccounts(), a = list.find(x => x.id === req.params.id)
  if (!a) return res.status(404).json({ ok: false, error: 'Không tìm thấy tài khoản' })
  const role = b.role === 'admin' ? 'admin' : b.role === 'editor' ? 'editor' : a.role
  const status = b.status === 'disabled' ? 'disabled' : b.status === 'active' ? 'active' : a.status
  const adminsLeft = list.filter(x => x.id !== a.id && x.role === 'admin' && x.status === 'active').length
  if (a.role === 'admin' && (role !== 'admin' || status !== 'active') && !adminsLeft) return bad(res, 'Phải còn ít nhất 1 Quản trị đang hoạt động')
  if (b.password != null && b.password !== '') { if (!validPw(b.password)) return bad(res, 'Mật khẩu tối thiểu 8 ký tự'); a.salt = crypto.randomBytes(16).toString('hex'); a.hash = hashPw(b.password, a.salt) }
  Object.assign(a, { name: String(b.name ?? a.name).trim() || a.email, role, status })
  saveAccounts(list); res.json({ account: pub(a) })
})
acc.delete('/:id', (req, res) => {
  const list = readAccounts(), a = list.find(x => x.id === req.params.id)
  if (!a) return res.status(404).json({ ok: false, error: 'Không tìm thấy tài khoản' })
  if (a.id === req.user.id) return bad(res, 'Không xóa được tài khoản đang đăng nhập')
  if (a.role === 'admin' && !list.some(x => x.id !== a.id && x.role === 'admin' && x.status === 'active')) return bad(res, 'Phải còn ít nhất 1 Quản trị đang hoạt động')
  saveAccounts(list.filter(x => x.id !== a.id)); res.json({ ok: true })
})
app.use('/api/ds-accounts', acc)

/* ── Tài liệu ── */
mountDocs(app, {
  express, loadUser, compress: compression(), dataDir: DATA, standalone: true,
  users: () => readAccounts().map(pub),
  isAdmin: u => u?.role === 'admin',
  isEditor: u => u?.role === 'editor',
  ai: () => ({ apiKey: process.env.AI_API_KEY || '', model: process.env.AI_MODEL || '' }),
})
app.get('/', (_req, res) => res.redirect(302, '/ds/'))
app.get('/dang-nhap', (req, res) => res.redirect(302, '/ds/dang-nhap' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '')))
app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, HOST, () => console.log(`✓ Tài liệu MISA Design System chạy tại http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/ds/ · dữ liệu: ${DATA}${process.env.AI_API_KEY ? '' : ' · ⚠️ chưa có AI_API_KEY (AVA tắt)'}`))
