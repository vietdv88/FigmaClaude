import { currentUser } from './db.js'
import { backend, api } from './api.js'

/* Kho nhớ độ rộng cột cho MỌI DataTable (provide('dtWidthStore') ở main.js) — theo TÀI KHOẢN trên máy chủ (user.prefs.tableWidths),
   bản sao localStorage để mở nhanh / chế độ demo. Bảng có thiết lập cột riêng (useColumnSettings) tự lưu, không qua kho này. */
const LOCAL = () => 'pdpoint-tablewidths:' + (currentUser.value?.id ?? 'guest')
const readLocal = () => { try { return JSON.parse(localStorage.getItem(LOCAL())) || {} } catch { return {} } }
let timer = null, pending = {}

export const tableWidthStore = {
  get(key) { return currentUser.value?.prefs?.tableWidths?.[key] ?? readLocal()[key] ?? null },
  set(key, colKey, px) {
    const cur = { ...(this.get(key) ?? {}) }
    if (px == null) delete cur[colKey]; else cur[colKey] = Math.max(60, Math.min(1200, Math.round(px)))
    const value = Object.keys(cur).length ? cur : null
    const local = readLocal(); if (value) local[key] = value; else delete local[key]
    try { localStorage.setItem(LOCAL(), JSON.stringify(local)) } catch { /* bỏ qua */ }
    const u = currentUser.value
    if (u) u.prefs = { ...(u.prefs ?? {}), tableWidths: { ...(u.prefs?.tableWidths ?? {}), [key]: value ?? undefined } }
    if (!backend.enabled) return
    pending[key] = value
    clearTimeout(timer)
    timer = setTimeout(() => { const body = pending; pending = {}; api.put('/api/me/prefs', { tableWidths: body }).catch(() => {}) }, 400)   // gộp nhiều lần kéo liên tiếp
  },
}
