/* ═══ Định dạng số hiển thị — quy chuẩn chung mọi app ═══
   Mặc định theo Thông tư 200/2014/TT-BTC (Việt Nam): dấu chấm (.) phân tách hàng nghìn, dấu phẩy (,) phân tách thập phân
     1.000 · 1.234.567 · 1,25 · 12.350,50 · 1.234.567,89
   App phục vụ nhiều thị trường: setNumberLocale('en-US') → 1,234,567.89 (thiết lập theo người dùng / đơn vị).
   ⛔ Không tự viết String(n) / toFixed / replace('.', ',') để hiển thị số — luôn qua fmtNum. */
let locale = 'vi-VN'
const cache = new Map()

/** Đổi quy tắc hiển thị số cho cả app (VD 'vi-VN' mặc định · 'en-US') */
export function setNumberLocale(l) { locale = l || 'vi-VN'; cache.clear() }
export const getNumberLocale = () => locale

function formatter(decimals, min) {
  const k = `${decimals}|${min}`
  if (!cache.has(k)) cache.set(k, new Intl.NumberFormat(locale, { maximumFractionDigits: decimals, minimumFractionDigits: min }))
  return cache.get(k)
}

/** Số → chuỗi hiển thị. decimals: số lẻ tối đa (mặc định 3) · min: số lẻ tối thiểu (VD tiền 0, tỷ lệ 2). Trống / không phải số → giữ nguyên */
export function fmtNum(v, { decimals = 3, min = 0 } = {}) {
  if (v === '' || v == null) return ''
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n)) return String(v)
  return formatter(decimals, Math.min(min, decimals)).format(n)
}

/** Phần trăm: 91,5% */
export const fmtPct = (v, decimals = 1) => (v === '' || v == null ? '' : `${fmtNum(v, { decimals })}%`)

/** Chuỗi người dùng gõ / dán (theo quy tắc đang dùng) → số; không đọc được → NaN */
export function parseNum(s) {
  if (typeof s === 'number') return s
  const t = String(s ?? '').trim().replace(/\s/g, '')
  if (!t) return NaN
  const dec = formatter(1, 1).format(1.1).replace(/\d/g, '')   // ',' (vi-VN) hoặc '.' (en-US)
  const grp = dec === ',' ? '.' : ','
  return Number(t.split(grp).join('').replace(dec, '.'))
}
