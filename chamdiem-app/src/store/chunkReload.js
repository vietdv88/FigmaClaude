/* Lỗi tải phần mở rộng của app (file JS tách riêng, VD bộ đọc Excel, OCR, trang con):
   xảy ra khi tab đang mở bản cũ / máy chủ đang khởi động lại lúc deploy. Trình duyệt nhớ lỗi đó tới khi tải lại trang
   → tự tải lại 1 lần (tối đa 1 lần / phút, tránh lặp vô hạn). */
const KEY = 'pdpoint-chunk-reload'
export const isChunkError = e => /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading (CSS )?chunk|Unable to preload/i.test(String(e?.message ?? e ?? ''))
export function reloadForChunk() {
  let last = 0
  try { last = Number(sessionStorage.getItem(KEY)) || 0 } catch { /* bỏ qua */ }
  if (Date.now() - last < 60000) return false
  try { sessionStorage.setItem(KEY, String(Date.now())) } catch { /* bỏ qua */ }
  setTimeout(() => location.reload(), 900)   // để kịp hiện thông báo
  return true
}
