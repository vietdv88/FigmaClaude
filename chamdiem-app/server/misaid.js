import crypto from 'node:crypto'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import * as store from './store.js'

/* ═══════════════════════════════════════════════════════════════════════════
   Đăng nhập bằng MISA ID (OpenID Connect · Authorization Code + PKCE)
   App → /api/auth/misa/login → id.misa.vn đăng nhập → /api/auth/misa/callback → tạo phiên → vào app.
   ENV:
     MISA_ID_CLIENT_ID, MISA_ID_CLIENT_SECRET   (đội MISA ID cấp)
     MISA_ID_BASE         mặc định https://id.misa.vn          — nơi đọc /.well-known/openid-configuration
     MISA_ID_ISSUER       mặc định theo discovery (hiện là https://id.misa.com.vn)
     MISA_ID_REDIRECT_URI mặc định APP_URL + /api/auth/misa/callback (phải đăng ký với MISA ID)
     MISA_ID_SCOPES       mặc định "openid profile"
     MISA_ID_USER_CLAIM   claim nhận diện nhân viên, mặc định "email,preferred_username" (lấy cái đầu tiên có giá trị)
   Người đăng nhập lần đầu (chưa có trong danh sách) → tạo tài khoản Hoạt động, chưa thuộc dự án nào (không thấy dữ liệu)
   cho tới khi Quản trị thêm vào dự án.
   ═══════════════════════════════════════════════════════════════════════════ */

export const MISA = {
  clientId:     process.env.MISA_ID_CLIENT_ID || '',
  clientSecret: process.env.MISA_ID_CLIENT_SECRET || '',
  base:         (process.env.MISA_ID_BASE || 'https://id.misa.vn').replace(/\/$/, ''),
  issuer:       process.env.MISA_ID_ISSUER || '',
  scopes:       process.env.MISA_ID_SCOPES || 'openid profile',
  claims:       (process.env.MISA_ID_USER_CLAIM || 'email,preferred_username').split(',').map(s => s.trim()).filter(Boolean),
}
export const misaEnabled = () => !!MISA.clientId

let discovery = null, jwks = null
async function meta() {
  if (discovery) return discovery
  const r = await fetch(MISA.base + '/.well-known/openid-configuration')
  if (!r.ok) throw new Error(`Không đọc được cấu hình MISA ID (${r.status})`)
  discovery = await r.json()
  jwks = createRemoteJWKSet(new URL(discovery.jwks_uri))
  return discovery
}

const b64url = buf => Buffer.from(buf).toString('base64url')
const rand = () => b64url(crypto.randomBytes(32))

/* Trạng thái tạm của 1 lượt đăng nhập (state, nonce, code_verifier, next) — cookie ký HMAC, sống 10 phút */
const FLOW_COOKIE = 'pdp_oidc'
const signFlow = (secret, v) => crypto.createHmac('sha256', secret).update(v).digest('base64url')
function saveFlow(res, secret, data, secure) {
  const v = b64url(JSON.stringify({ ...data, exp: Date.now() + 10 * 60e3 }))
  res.cookie(FLOW_COOKIE, `${v}.${signFlow(secret, v)}`, { httpOnly: true, sameSite: 'lax', secure, maxAge: 10 * 60e3, path: '/api/auth/misa' })
}
function readFlow(req, secret) {
  const raw = (req.headers.cookie || '').split(/;\s*/).find(c => c.startsWith(FLOW_COOKIE + '='))
  if (!raw) return null
  const [v, sig] = decodeURIComponent(raw.slice(FLOW_COOKIE.length + 1)).split('.')
  const expect = signFlow(secret, v || '')
  if (!v || !sig || sig.length !== expect.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null
  const data = JSON.parse(Buffer.from(v, 'base64url').toString())
  return data.exp > Date.now() ? data : null
}
const clearFlow = res => res.clearCookie(FLOW_COOKIE, { path: '/api/auth/misa' })

/** Bước 1: tạo URL đăng nhập MISA ID (lưu state / nonce / PKCE vào cookie) */
export async function startLogin(res, { secret, redirectUri, next, secure }) {
  const m = await meta()
  const state = rand(), nonce = rand(), verifier = rand()
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest())
  saveFlow(res, secret, { state, nonce, verifier, next: safeNext(next) }, secure)
  const q = new URLSearchParams({
    client_id: MISA.clientId, response_type: 'code', redirect_uri: redirectUri, scope: MISA.scopes,
    state, nonce, code_challenge: challenge, code_challenge_method: 'S256',
  })
  return `${m.authorization_endpoint}?${q}`
}
const safeNext = n => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : '/')

/** Bước 2: callback — đổi code lấy token, kiểm tra id_token, trả { identity, name, claims, next } */
export async function finishLogin(req, res, { secret, redirectUri }) {
  const flow = readFlow(req, secret); clearFlow(res)
  if (req.query.error) throw new Error(`MISA ID: ${req.query.error_description || req.query.error}`)
  if (!flow || req.query.state !== flow.state) throw new Error('Phiên đăng nhập đã hết hạn hoặc không hợp lệ — thử lại')
  const m = await meta()
  const tokenRes = await fetch(m.token_endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      authorization: 'Basic ' + Buffer.from(`${encodeURIComponent(MISA.clientId)}:${encodeURIComponent(MISA.clientSecret)}`).toString('base64'),
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code: String(req.query.code || ''), redirect_uri: redirectUri, code_verifier: flow.verifier }),
  })
  const tok = await tokenRes.json().catch(() => ({}))
  if (!tokenRes.ok || !tok.id_token) throw new Error(`MISA ID không cấp token: ${tok.error_description || tok.error || tokenRes.status}`)
  const { payload } = await jwtVerify(tok.id_token, jwks, { issuer: MISA.issuer || m.issuer, audience: MISA.clientId })
  if (payload.nonce !== flow.nonce) throw new Error('Token không khớp phiên đăng nhập (nonce)')
  // Bổ sung thông tin từ userinfo (email / preferred_username có thể chỉ có ở đây)
  let info = {}
  if (tok.access_token && m.userinfo_endpoint) {
    const u = await fetch(m.userinfo_endpoint, { headers: { authorization: 'Bearer ' + tok.access_token } })
    if (u.ok) info = await u.json().catch(() => ({}))
  }
  const claims = { ...info, ...payload }
  const identity = MISA.claims.map(k => claims[k]).find(v => typeof v === 'string' && v.trim())?.trim().toLowerCase()
  if (!identity) throw new Error(`MISA ID không trả về ${MISA.claims.join(' / ')} để nhận diện tài khoản`)
  const name = claims.name || [claims.family_name, claims.middle_name, claims.given_name].filter(Boolean).join(' ') || identity
  return { identity, sub: payload.sub, name, email: typeof claims.email === 'string' ? claims.email.toLowerCase() : '', next: flow.next }
}

/** Tìm / tạo người dùng theo tài khoản MISA. Chưa có → Hoạt động, chưa thuộc dự án nào (Quản trị thêm vào dự án sau) */
export function loginWithMisa({ identity, sub, name, email }, adminAccounts) {
  const now = new Date().toISOString()
  const isBootAdmin = adminAccounts.includes(identity) || (email && adminAccounts.includes(email))
  const all = store.all('users')
  let u = all.find(x => x.misaSub && x.misaSub === sub)
    ?? all.find(x => [x.email, x.code].filter(Boolean).map(v => v.toLowerCase()).some(v => v === identity || (email && v === email)))
  if (u) u = structuredClone(u)   // bộ đệm store chỉ đọc
  if (u?.status === 'disabled' && !isBootAdmin) throw Object.assign(new Error('Tài khoản đã bị khóa. Liên hệ Quản trị.'), { status: 403 })
  if (!u) {
    u = { id: 'u_' + crypto.randomUUID(), code: identity.split('@')[0], name, email: email || identity, role: isBootAdmin ? 'admin' : '', status: 'active', createdAt: now, selfJoined: true }
  } else {
    if (isBootAdmin) u.role = 'admin'
    if (u.status !== 'disabled' || isBootAdmin) { if (u.status !== 'active') u.acceptedAt = now; u.status = 'active' }
    if (!u.name || u.name === u.code) u.name = name
  }
  u.misaSub = sub
  u.lastLoginAt = now
  store.put('users', u)
  return u
}
