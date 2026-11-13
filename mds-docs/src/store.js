import { reactive } from 'vue'

/* Dữ liệu dùng chung của app tài liệu: danh sách trang, nhóm, người đang xem (quyền biên tập) */
/** Mở AVA từ chỗ khác trong app: askAva('câu hỏi') */
export const avaBus = reactive({ q: '', n: 0 })
export const askAva = q => { avaBus.q = q || ''; avaBus.n++ }
export const state = reactive({ pages: [], groups: [], redirects: {}, me: { user: null, canEdit: false, isAdmin: false, aiEnabled: false }, loaded: false })

export async function api(url, { method = 'GET', body, raw, type } = {}) {
  const res = await fetch('/api/ds' + url, {
    method,
    headers: raw ? { 'Content-Type': type } : body ? { 'Content-Type': 'application/json' } : {},
    body: raw ?? (body ? JSON.stringify(body) : undefined),
    credentials: 'same-origin',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) { const e = new Error(data.error || `Lỗi ${res.status}`); e.status = res.status; throw e }
  return data
}

export async function loadPages() {
  const d = await api('/pages')
  state.pages = d.pages; state.groups = d.groups; state.redirects = d.redirects || {}
  state.loaded = true
}
export async function loadMe() {
  try { state.me = await api('/me') } catch { state.me = { user: null, canEdit: false, isAdmin: false } }
}

/** Menu: [{ group, pages: [...] }] theo thứ tự nhóm trong cài đặt, trang theo order */
export function navGroups() {
  const by = new Map(state.groups.map(g => [g, []]))
  for (const p of state.pages) { if (!by.has(p.group)) by.set(p.group, []); by.get(p.group).push(p) }
  return [...by].filter(([, list]) => list.length).map(([group, list]) => ({ group, pages: list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title)) }))
}
/** Danh sách phẳng theo thứ tự menu (trang trước / sau) */
export const flatPages = () => navGroups().flatMap(g => g.pages)

export const loginUrl = next => `/dang-nhap?next=${encodeURIComponent(next || location.pathname)}`
export const fmtDate = iso => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` }
export const fmtDateTime = iso => { if (!iso) return ''; const d = new Date(iso); return `${fmtDate(iso)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
