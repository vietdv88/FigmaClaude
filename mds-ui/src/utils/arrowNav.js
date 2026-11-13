import { onMounted, onBeforeUnmount, nextTick } from 'vue'

/**
 * Danh sách + drawer xem chi tiết (quy chuẩn): drawer đang mở → phím ↑ / ↓ chuyển sang dòng trước / sau, khỏi bấm chuột.
 *   ids()      → mảng id theo ĐÚNG thứ tự đang hiển thị (đã lọc + sắp xếp, gồm cả các trang khác)
 *   current    → ref id đang mở drawer (null = drawer đóng → không làm gì)
 *   active()   → điều kiện thêm (VD có 2 tầng drawer: chỉ tầng trên cùng nhận phím)
 *   select(id, index) → mặc định gán current; truyền vào để đổi trang khi sang dòng ở trang khác
 *   scroll     → bộ chọn CSS của dòng đang mở để cuộn vào tầm nhìn (mặc định '.dt-row--selected')
 * Không chiếm phím khi đang gõ trong ô nhập, đang mở danh sách thả xuống hoặc hộp thoại.
 */
export function useArrowNav({ ids, current, active = () => true, select, scroll = '.dt-row--selected' }) {
  function onKey(e) {
    if ((e.key !== 'ArrowDown' && e.key !== 'ArrowUp') || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
    if (!current.value || !active()) return
    if (e.target?.closest?.('input, textarea, select, [contenteditable="true"], .cb-list, .dropdown-menu')) return
    if (document.querySelector('.modal-overlay, [role="dialog"][aria-modal="true"]')) return
    const list = ids(), i = list.indexOf(current.value)
    if (i < 0) return
    const j = i + (e.key === 'ArrowDown' ? 1 : -1)
    if (j < 0 || j >= list.length) return
    e.preventDefault()
    if (select) select(list[j], j); else current.value = list[j]
    nextTick(() => document.querySelector(scroll)?.scrollIntoView({ block: 'nearest' }))
  }
  onMounted(() => window.addEventListener('keydown', onKey))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
}
