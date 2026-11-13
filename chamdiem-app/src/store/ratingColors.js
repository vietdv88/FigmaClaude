/* ═══ Màu biểu đồ cho MỨC ĐÁNH GIÁ — dùng chung PD (Phân bổ mức đánh giá) và BA (Chất lượng BA) ═══
   Biểu đồ đi theo đúng màu TAG của mức đó trên danh sách, nhưng lấy từ bộ Chart Colors của theme (/ds/data-visualization):
   · brand   → Palette[0] (màu brand chính)              — Hài lòng · Gần như đạt ngay lần đầu
   · success → màu Palette thiên xanh lá, không có thì --bg-success — Rất hài lòng
   · danger  → màu Palette thiên đỏ,  không có thì --bg-danger      — Không hài lòng · Sửa đáng kể / nhiều lần
   · warning → màu Palette thiên cam, không có thì --bg-warning     — Dùng ngay, cần bổ sung (BA)
   · neutral → xám --text-placeholder                             — Chưa đánh giá (cả PD và BA, tag Neutral)
   Xanh lá quá gần brand (theme Green / Teal) → “Rất hài lòng” dùng màu Palette khác hẳn brand.
   “Thiên về” = sắc độ (hue) lệch ≤ 15° so với màu trạng thái; bộ màu không có màu đủ gần (VD theme Cam không có đỏ) → dùng luôn màu trạng thái. */
import { chartColors } from '@mds/utils/chartColors.js'

const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
const toHex = v => { if (!v) return ''; if (v.startsWith('#')) return v.slice(0, 7); const m = v.match(/\d+/g) || [0, 0, 0]; return '#' + m.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('') }
export const hueOf = hex => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn
  if (!d) return 0
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  return (h * 60 + 360) % 360
}
export const hueDist = (a, b) => { const x = Math.abs(a - b) % 360; return Math.min(x, 360 - x) }
function nearestTo(pal, hex, used) {
  const c = pal.filter(x => !used.includes(x)).sort((a, b) => hueDist(hueOf(a), hueOf(hex)) - hueDist(hueOf(b), hueOf(hex)))[0]
  return c && hueDist(hueOf(c), hueOf(hex)) <= 15 ? c : hex
}
const FALLBACK = { success: '#12b76a', danger: '#f04438', warning: '#f79009' }

/** { brand, success, danger, warning } → mã màu biểu đồ theo theme hiện tại */
export function ratingChartColors(theme) {
  const pal = chartColors(theme, 'palette'), out = { brand: pal[0] }
  for (const k of ['success', 'danger', 'warning']) out[k] = nearestTo(pal, toHex(cssVar(`--bg-${k}`)) || FALLBACK[k], Object.values(out))
  // Theme có brand cùng tông xanh lá (VD Green, Teal): “xanh lá” trùng màu brand → đổi sang màu Palette khác hẳn brand (lệch ≥ 90°) và xa đỏ / cam
  if (hueDist(hueOf(out.success), hueOf(out.brand)) < 40)
    out.success = pal.slice(1).find(c => hueDist(hueOf(c), hueOf(out.brand)) >= 90 && ![out.danger, out.warning].some(x => hueDist(hueOf(c), hueOf(x)) < 30)) ?? pal[3]
  out.neutral = cssVar('--text-placeholder') || '#98a2b3'
  return out
}
