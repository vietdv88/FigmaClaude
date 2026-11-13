import crypto from 'node:crypto'
import { OAuth2Client } from 'google-auth-library'
import * as store from './store.js'

/* ═══ Đăng nhập Google + phiên đăng nhập (cookie ký HMAC, httpOnly) ═══ */

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const SECRET = process.env.SESSION_SECRET || (() => {
  console.warn('⚠️  Chưa đặt SESSION_SECRET — dùng khóa tạm, đăng nhập sẽ mất khi khởi động lại.')
  return crypto.randomBytes(32).toString('hex')
})()
// ADMIN_EMAILS: Gmail / tài khoản MISA ID của Quản trị đầu tiên (cách nhau dấu phẩy)
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
export const sessionSecret = () => SECRET
const COOKIE = process.env.SESSION_COOKIE || 'chamdiem_sid'   // bản dùng thử chạy cùng máy (khác cổng) → đặt tên khác để không đè phiên của bản thật
const MAX_AGE_DAYS = 30
const google = new OAuth2Client(GOOGLE_CLIENT_ID)

const sign = v => crypto.createHmac('sha256', SECRET).update(v).digest('base64url')

/** remember = false (không “Ghi nhớ đăng nhập”): cookie phiên — đóng trình duyệt là hết.
    Hạn ký trong cookie vẫn 30 ngày (để tính đúng thời điểm cấp phiên khi kiểm tra thu hồi phiên). */
export function setSession(res, userId, secure, remember = true) {
  const exp = Date.now() + MAX_AGE_DAYS * 86400e3
  const value = `${userId}.${exp}`
  res.cookie(COOKIE, `${value}.${sign(value)}`, { httpOnly: true, sameSite: 'lax', secure, path: '/', ...(remember ? { maxAge: MAX_AGE_DAYS * 86400e3 } : {}) })
}
export const clearSession = res => res.clearCookie(COOKIE, { path: '/' })

function readCookie(req) {
  const raw = (req.headers.cookie || '').split(/;\s*/).find(c => c.startsWith(COOKIE + '='))
  return raw ? decodeURIComponent(raw.slice(COOKIE.length + 1)) : ''
}

/** Middleware: gắn req.user (đọc lại trạng thái mỗi request → khóa tài khoản có hiệu lực ngay) */
export function loadUser(req, _res, next) {
  const [id, exp, sig] = readCookie(req).split('.')
  if (id && exp && sig && Number(exp) > Date.now()) {
    const expect = sign(`${id}.${exp}`)
    if (sig.length === expect.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) {
      const u = store.get('users', id) ?? null
      // Phiên cấp trước lúc bị thu hồi (Quản trị đặt lại mật khẩu / tự đổi mật khẩu) → hết hiệu lực
      const issuedAt = Number(exp) - MAX_AGE_DAYS * 86400e3
      req.user = u && !(u.sessionsRevokedAt && issuedAt < u.sessionsRevokedAt) ? u : null
    }
  }
  // Quản trị đầu tiên (ADMIN_EMAILS): luôn là Quản trị + Hoạt động — sửa vai trò / trạng thái nếu bị đổi
  if (req.user && ADMIN_EMAILS.includes((req.user.email || '').toLowerCase()) && (req.user.role !== 'admin' || req.user.status !== 'active')) {
    req.user = { ...req.user, role: 'admin', status: 'active' }
    store.put('users', req.user)
  }
  // OPEN_DEMO: chưa chọn người → mặc định Quản trị đầu tiên (không cần đăng nhập)
  if (!req.user && OPEN_DEMO) { const a = store.all('users').find(u => u.role === 'admin' && u.status !== 'disabled'); req.user = a ? structuredClone(a) : null }
  next()
}

/* Mật khẩu do Quản trị đặt → BẮT BUỘC tự đổi trước khi dùng app: chỉ cho gọi đổi mật khẩu / xem phiên / đăng xuất */
const MUST_CHANGE_ALLOWED = ['/api/auth/password', '/api/auth/logout', '/api/session', '/api/me']
export const requireActive = (req, res, next) => {
  if (req.user?.status !== 'active') return res.status(401).json({ error: 'Chưa đăng nhập hoặc chưa được cấp quyền' })
  if (req.user.mustChangePassword && !MUST_CHANGE_ALLOWED.includes(req.originalUrl.split('?')[0])) {
    return res.status(403).json({ error: 'Bạn cần đổi mật khẩu trước khi tiếp tục', code: 'must_change_password' })
  }
  next()
}

/* Bản copy (dữ liệu trong bộ đệm của store là chỉ đọc) */
const findByEmail = email => { const u = store.all('users').find(x => (x.email || '').toLowerCase() === email); return u ? structuredClone(u) : undefined }

/**
 * Xác thực ID token Google → tìm / tạo người dùng.
 *  - Email trong ADMIN_EMAILS: luôn là Quản trị.
 *  - Đã được mời (invited) / đã có email trong danh sách (none): đăng nhập = accept → active.
 *  - Đã khóa (disabled): từ chối.
 *  - Chưa có trong danh sách (chưa được mời): từ chối — không có quyền truy cập.
 */
/** Chỉ để phát triển trên máy (DEV_LOGIN=1, không phải production): đăng nhập bằng email, bỏ qua Google */
export const DEV_LOGIN = process.env.DEV_LOGIN === '1' && process.env.NODE_ENV !== 'production'
/** Dùng thử chung (OPEN_DEMO=1): KHÔNG có form đăng nhập — mở app là vào (mặc định Quản trị),
    chuyển người dùng bằng ô “Đăng nhập với” trên header. Quyền vẫn kiểm tra ở máy chủ. Tắt khi dùng thật. */
export const OPEN_DEMO = process.env.OPEN_DEMO === '1'

export async function loginWithGoogle(credential, devEmail, invite = '') {
  let p
  if (DEV_LOGIN && devEmail) {
    p = { email: devEmail, email_verified: true, name: devEmail.split('@')[0] }
  } else {
    if (!GOOGLE_CLIENT_ID) throw Object.assign(new Error('Máy chủ chưa cấu hình GOOGLE_CLIENT_ID'), { status: 500 })
    const ticket = await google.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID })
    p = ticket.getPayload()
  }
  if (!p?.email || !p.email_verified) throw Object.assign(new Error('Tài khoản Google chưa xác minh email'), { status: 401 })
  const email = p.email.toLowerCase()
  const now = new Date().toISOString()
  const isBootAdmin = ADMIN_EMAILS.includes(email)

  let u = findByEmail(email)
  // Mở từ link mời nhưng chọn nhầm tài khoản Google khác (chưa có trong danh sách) → báo chọn lại, không tạo yêu cầu chờ duyệt thừa
  const invited = String(invite || '').trim().toLowerCase()
  if (invited && invited !== email && !u && !isBootAdmin) {
    throw Object.assign(new Error(`Lời mời được gửi tới ${invited}, nhưng bạn đang chọn tài khoản ${email}. Hãy đăng nhập lại bằng đúng tài khoản được mời.`), { status: 403, code: 'invite_mismatch' })
  }
  if (u?.status === 'disabled' && !isBootAdmin) throw Object.assign(new Error('Tài khoản đã bị khóa. Liên hệ Quản trị.'), { status: 403, code: 'disabled' })
  // Chỉ người đã được Quản trị thêm / mời mới vào được (không còn tự đăng ký chờ duyệt)
  if (!isBootAdmin && (!u || u.status === 'pending')) {
    throw Object.assign(new Error(`Tài khoản ${email} chưa được mời vào MISA Solution Point nên không có quyền truy cập. Liên hệ Quản trị để được mời.`), { status: 403, code: 'not_invited' })
  }
  if (!u) {
    u = { id: 'u_' + crypto.randomUUID(), code: email.split('@')[0], name: p.name || email, email, role: 'admin', status: 'active', createdAt: now }
  } else {
    if (isBootAdmin) { u.role = 'admin'; u.status = 'active' }
    else if (u.status === 'invited' || u.status === 'none') { u.status = 'active'; u.acceptedAt = now }
    if (!u.name || u.name === u.code) u.name = p.name || u.name
  }
  // Ảnh người dùng tự tải lên (data URL) → giữ, không ghi đè bằng ảnh Google
  if (!String(u.picture ?? '').startsWith('data:')) u.picture = p.picture || ''
  u.lastLoginAt = now
  store.put('users', u)
  return u
}

/* ═══ Đăng nhập bằng email + mật khẩu ═══════════════════════════════════════
   Quản trị mời → email chứa link đặt mật khẩu (mã dùng 1 lần, chỉ lưu bản băm) → người dùng tự đặt mật khẩu.
   Mật khẩu băm scrypt + salt riêng. Sai nhiều lần → khóa tạm theo email + IP. */
const SECRET_FIELDS = ['passwordHash', 'setupTokenHash', 'setupTokenExp', 'setupPurpose', 'sessionsRevokedAt']
/** Bỏ các trường bí mật trước khi gửi xuống trình duyệt */
export function publicUser(u) {
  if (!u) return u
  const x = { ...u, hasPassword: !!u.passwordHash }
  for (const k of SECRET_FIELDS) delete x[k]
  return x
}
export const MIN_PASSWORD = 8
export function hashPassword(pw) {
  const salt = crypto.randomBytes(16)
  return `scrypt$${salt.toString('base64url')}$${crypto.scryptSync(String(pw), salt, 64).toString('base64url')}`
}
export function verifyPassword(pw, stored) {
  const [alg, salt, hash] = String(stored || '').split('$')
  if (alg !== 'scrypt' || !salt || !hash) return false
  const a = crypto.scryptSync(String(pw), Buffer.from(salt, 'base64url'), 64), b = Buffer.from(hash, 'base64url')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
export function checkPasswordRule(pw) {
  const s = String(pw ?? '')
  if (s.length < MIN_PASSWORD) throw Object.assign(new Error(`Mật khẩu cần ít nhất ${MIN_PASSWORD} ký tự`), { status: 400 })
  if (!/[A-Za-zÀ-ỹ]/.test(s) || !/\d/.test(s)) throw Object.assign(new Error('Mật khẩu cần có cả chữ và số'), { status: 400 })
}
const tokenHash = t => crypto.createHash('sha256').update(String(t)).digest('base64url')
/** Tạo link đặt mật khẩu cho người dùng: purpose 'invite' (7 ngày) | 'reset' (1 giờ). Trả về mã gốc để gửi email. */
export function issueSetupToken(user, purpose) {
  const token = crypto.randomBytes(32).toString('base64url')
  const ttl = purpose === 'invite' ? 7 * 86400e3 : 3600e3
  store.put('users', { ...store.get('users', user.id), setupTokenHash: tokenHash(token), setupTokenExp: Date.now() + ttl, setupPurpose: purpose })
  return token
}
/** Người dùng của 1 mã đặt mật khẩu còn hạn (không thì lỗi) */
export function userByToken(token) {
  const h = tokenHash(token || '')
  const u = store.all('users').find(x => x.setupTokenHash && x.setupTokenHash === h)
  if (!u || !(u.setupTokenExp > Date.now())) throw Object.assign(new Error('Link đã hết hạn hoặc đã được dùng. Nhờ Quản trị gửi lại lời mời, hoặc dùng “Quên mật khẩu”.'), { status: 400, code: 'token_invalid' })
  if (u.status === 'disabled') throw Object.assign(new Error('Tài khoản đã bị khóa. Liên hệ Quản trị.'), { status: 403, code: 'disabled' })
  return structuredClone(u)
}
/** Đặt mật khẩu bằng mã → kích hoạt tài khoản, xóa mã (dùng 1 lần) */
export function setPasswordByToken(token, password) {
  const u = userByToken(token)
  checkPasswordRule(password)
  const now = new Date().toISOString()
  const next = { ...u, passwordHash: hashPassword(password), passwordSetAt: now, status: 'active', lastLoginAt: now, ...(ADMIN_EMAILS.includes((u.email || '').toLowerCase()) ? { role: 'admin' } : {}) }
  if (u.status !== 'active') next.acceptedAt = now
  for (const k of ['setupTokenHash', 'setupTokenExp', 'setupPurpose', 'mustChangePassword']) delete next[k]
  store.put('users', next)
  return next
}

/* Chống dò mật khẩu: tối đa 8 lần sai / 15 phút cho mỗi (email, IP) */
const fails = new Map()
const FAIL_MAX = 8, FAIL_WINDOW = 15 * 60e3
/** Tài khoản đăng nhập: có “@” → Gmail; không có → MÃ NHÂN VIÊN (không phân biệt hoa thường) */
export function findByLogin(login) {
  const v = String(login || '').trim().toLowerCase()
  if (!v) return null
  if (v.includes('@')) return findByEmail(v)
  return store.all('users').find(u => String(u.code ?? '').trim().toLowerCase() === v && u.status !== 'disabled')
    ?? store.all('users').find(u => String(u.code ?? '').trim().toLowerCase() === v) ?? null
}

/* ═══ Tự đăng ký từ trang giới thiệu → chờ Quản trị duyệt ═══
   Thông tin như form mời người dùng nhưng KHÔNG bắt buộc Gmail, KHÔNG chọn vai trò (Quản trị gán khi duyệt), có mật khẩu.
   Tạo người dùng trạng thái pending; đăng nhập bằng mã nhân viên (hoặc Gmail nếu có) + mật khẩu. Tối đa 5 lần / giờ / IP. */
const regHits = new Map()
const REG_MAX = 5, REG_WINDOW = 3600e3
const bad = msg => Object.assign(new Error(msg), { status: 400 })
export function registerUser(b = {}, ip = '') {
  const hits = (regHits.get(ip) ?? []).filter(t => Date.now() - t < REG_WINDOW)
  if (hits.length >= REG_MAX) throw Object.assign(new Error('Đăng ký quá nhiều lần. Thử lại sau 1 giờ.'), { status: 429 })
  const code = String(b.code ?? '').trim(), name = String(b.name ?? '').trim()
  const companyEmail = String(b.companyEmail ?? '').trim().toLowerCase(), email = String(b.email ?? '').trim().toLowerCase()
  if (!code) throw bad('Nhập mã nhân viên')
  if (!/^[\w.-]{2,30}$/.test(code)) throw bad('Mã nhân viên chỉ gồm chữ, số, dấu chấm, gạch (2–30 ký tự)')
  if (!name) throw bad('Nhập họ và tên')
  if (name.length > 80) throw bad('Họ và tên tối đa 80 ký tự')
  if (!companyEmail) throw bad('Nhập email công ty')
  if (!/^\S+@\S+\.\S+$/.test(companyEmail)) throw bad('Email công ty không hợp lệ')
  if (email && !/^\S+@\S+\.\S+$/.test(email)) throw bad('Gmail không hợp lệ')
  checkPasswordRule(b.password)
  const users = store.all('users'), lc = v => String(v ?? '').trim().toLowerCase()
  if (users.some(u => lc(u.code) === code.toLowerCase())) throw bad('Mã nhân viên này đã có tài khoản — đăng nhập, hoặc dùng “Quên mật khẩu”')
  if (users.some(u => lc(u.companyEmail) === companyEmail)) throw bad('Email công ty này đã có tài khoản')
  if (email && users.some(u => lc(u.email) === email)) throw bad('Gmail này đã có tài khoản')
  regHits.set(ip, [...hits, Date.now()])
  const now = new Date().toISOString()
  // Dự án người đăng ký tự chọn (không bắt buộc) — chỉ là đề xuất; Quản trị duyệt mới thêm vào dự án
  const requestedProjectIds = [...new Set(Array.isArray(b.projectIds) ? b.projectIds : [])].filter(pid => store.get('projects', pid)).slice(0, 30)
  // Dự án tự nhập (chưa có trong danh sách) — hiện ở chi tiết người dùng để Quản trị biết phân vào đâu
  const requestedProjectNames = [...new Set((Array.isArray(b.projectNames) ? b.projectNames : []).map(v => String(v ?? '').trim().slice(0, 80)).filter(Boolean))].slice(0, 10)
  const u = { id: 'u_' + crypto.randomUUID(), code, name, companyEmail, email, role: '', target: 0, status: 'pending', requestedProjectIds, requestedProjectNames,
    registeredAt: now, createdAt: now, passwordHash: hashPassword(b.password), passwordSetAt: now, lastLoginAt: now }
  store.put('users', u)
  return u
}

export function loginWithPassword(login, password, ip = '') {
  const id = String(login || '').trim()
  const u = findByLogin(id)
  // Đếm sai theo tài khoản thật (gõ mã hay Gmail đều chung 1 bộ đếm)
  const key = `${u?.id ?? id.toLowerCase()}|${ip}`
  const f = fails.get(key)
  if (f && f.n >= FAIL_MAX && Date.now() - f.at < FAIL_WINDOW) throw Object.assign(new Error('Sai mật khẩu quá nhiều lần. Thử lại sau 15 phút hoặc dùng “Quên mật khẩu”.'), { status: 429 })
  const mail = String(u?.email ?? (id.includes('@') ? id : '')).toLowerCase()
  const isBootAdmin = !!mail && ADMIN_EMAILS.includes(mail)
  if (!u && !id.includes('@')) throw Object.assign(new Error(`Không tìm thấy mã nhân viên ${id}. Kiểm tra lại, hoặc đăng nhập bằng Gmail.`), { status: 403, code: 'not_invited' })
  // Tự đăng ký (registeredAt) → vẫn đăng nhập được để thấy trang “Đang chờ duyệt”; API khác bị requireActive chặn tới khi được duyệt
  if (!u || (u.status === 'pending' && !u.registeredAt && !isBootAdmin)) throw Object.assign(new Error(`Tài khoản ${id} chưa được mời vào MISA Solution Point nên không có quyền truy cập. Liên hệ Quản trị để được mời.`), { status: 403, code: 'not_invited' })
  if (u.status === 'disabled') throw Object.assign(new Error('Tài khoản đã bị khóa. Liên hệ Quản trị.'), { status: 403, code: 'disabled' })
  if (!u.passwordHash) throw Object.assign(new Error('Tài khoản chưa đặt mật khẩu. Mở link trong email mời để đặt, hoặc bấm “Quên mật khẩu” để nhận link mới.'), { status: 400, code: 'no_password' })
  if (!verifyPassword(password, u.passwordHash)) {
    fails.set(key, { n: (f && Date.now() - f.at < FAIL_WINDOW ? f.n : 0) + 1, at: Date.now() })
    throw Object.assign(new Error('Tài khoản hoặc mật khẩu không đúng'), { status: 401 })
  }
  fails.delete(key)
  const next = { ...u, lastLoginAt: new Date().toISOString(), ...(isBootAdmin ? { role: 'admin' } : {}) }
  store.put('users', next)
  return next
}
