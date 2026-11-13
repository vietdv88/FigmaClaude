/* ═══ Dòng Tổng của DataTable (show-footer) — quy tắc chung ═══
   • Cộng trên TOÀN BỘ dữ liệu đang xem (đã lọc), KHÔNG chỉ trang hiện tại.
   • Chỉ cộng cột cộng được: điểm, point, số lượng, tiền. KHÔNG cộng %, hệ số, tỷ lệ, ngày, trạng thái.
   • Định dạng giống ô trong cột (cùng số chữ số thập phân), căn phải như cột số — số qua fmtNum (TT200: 1.234.567,89). */

import { fmtNum } from './number.js'

/** Tổng 1 trường (key) hoặc hàm lấy giá trị — bỏ qua ô trống / không phải số */
export function sumBy(items, key) {
  const get = typeof key === 'function' ? key : x => x?.[key]
  return (items ?? []).reduce((a, x) => { const n = Number(get(x)); return Number.isFinite(n) ? a + n : a }, 0)
}

/** Gắn footerText cho các cột cần cộng: footerTotals(columns, items, { score: 'score', final: x => x.final }, fmt) */
export function footerTotals(columns, items, sums, fmt = v => fmtNum(v)) {
  return columns.map(c => (c.key in sums ? { ...c, footerText: fmt(sumBy(items, sums[c.key])) } : c))
}
