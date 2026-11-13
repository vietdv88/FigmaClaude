/* Dãy số trang cho phân trang dạng số (Figma Paging Type=Advance 45296:28045):
   luôn có trang đầu + trang cuối · cửa sổ 3 trang bắt đầu từ trang đang xem (cuối danh sách thì lùi lại cho đủ 3)
   · khoảng trống ≥ 2 trang → “…”, trống đúng 1 trang thì hiện luôn số đó.
   VD 20 trang: đang ở 1 → 1 2 3 … 20 · ở 5 → 1 … 5 6 7 … 20 · ở 20 → 1 … 18 19 20
   Trả về mảng: số trang | 'gap-l' | 'gap-r' */
export function pageNumbers(current, total, size = 3) {
  if (total <= size + 2) return Array.from({ length: total }, (_, i) => i + 1)
  const start = Math.max(1, Math.min(current, total - size + 1))
  const win = Array.from({ length: size }, (_, i) => start + i)
  const out = []
  if (win[0] > 1) { out.push(1); if (win[0] === 3) out.push(2); else if (win[0] > 3) out.push('gap-l') }
  out.push(...win)
  const last = win[win.length - 1]
  if (last < total) { if (last === total - 2) out.push(total - 1); else if (last < total - 2) out.push('gap-r'); out.push(total) }
  return out
}
