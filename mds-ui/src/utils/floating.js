/* ═══ Định vị lớp NỔI (menu xổ ra, popover, panel lọc…) — MỘT thuật toán cho mọi lớp nổi của mds-ui ═══
   DropdownMenu, AppPopover dùng chung → lớp nổi nào cũng: mở dưới nút (cách 4) · thiếu chỗ phía dưới (dòng cuối bảng, nút sát đáy)
   → LẬT lên trên · cả 2 phía thiếu → ghim cách đáy 8 · tràn ngang → kéo vào trong cách mép 8.
   ⛔ Không tự viết position: absolute / fixed + tính toạ độ trong app — dùng <AppPopover> / <DropdownMenu>. */

export const FLOAT_GAP = 4
export const FLOAT_EDGE = 8

/**
 * @param {DOMRect} anchor  khung nút / phần tử neo
 * @param {{width:number,height:number}} size  kích thước lớp nổi (0 khi chưa đo được)
 * @param {{placement?: 'bottom-start'|'bottom-end', minWidth?: number, matchWidth?: boolean}} opts
 * @returns {{top:number,left:number,right:number,minWidth:number,flipped:boolean}}
 */
export function placeFloating(anchor, size = {}, { placement = 'bottom-start', minWidth = 0, matchWidth = true } = {}) {
  const vh = window.innerHeight, vw = window.innerWidth
  const h = size.height || 0
  const mw = Math.max(minWidth, matchWidth ? anchor.width : 0)
  const w = Math.max(size.width || 0, mw)
  let top = anchor.bottom + FLOAT_GAP, flipped = false
  if (h && top + h > vh - FLOAT_EDGE) {
    const above = anchor.top - FLOAT_GAP - h
    if (above >= FLOAT_EDGE) { top = above; flipped = true } else top = Math.max(FLOAT_EDGE, vh - FLOAT_EDGE - h)
  }
  let left = anchor.left, right = vw - anchor.right
  if (placement === 'bottom-end') right = Math.max(FLOAT_EDGE, Math.min(right, vw - w - FLOAT_EDGE))
  else left = Math.max(FLOAT_EDGE, Math.min(left, vw - w - FLOAT_EDGE))
  return { top, left, right, minWidth: mw, flipped }
}

/** Style fixed từ kết quả placeFloating */
export function floatingStyle(p, placement = 'bottom-start', zIndex = 9999) {
  const s = { position: 'fixed', top: p.top + 'px', minWidth: p.minWidth + 'px', zIndex }
  if (placement === 'bottom-end') s.right = p.right + 'px'
  else s.left = p.left + 'px'
  return s
}

/** Bấm vào các lớp nổi khác (danh sách Combobox, lịch, menu, popover con) KHÔNG được tính là "bấm ra ngoài" */
export const FLOATING_LAYERS = '.cb-list, .date-pop, .dropdown-menu, .mds-popover, .v-tip, [data-floating]'
