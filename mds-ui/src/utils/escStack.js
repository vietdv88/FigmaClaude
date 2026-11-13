import { watch, onBeforeUnmount, getCurrentInstance } from 'vue'

/* ═══ ESC đóng lớp trên cùng — quy chuẩn chung cho popup / drawer / panel ═══
   Mỗi lớp đang mở đăng ký 1 hàm đóng; bấm ESC (ở bất kỳ đâu, không cần focus trong lớp) → đóng lớp mở SAU CÙNG.
   VD popup mở đè drawer: ESC lần 1 đóng popup, lần 2 đóng drawer.
   Control con tự xử lý ESC trước (danh sách xổ của AppCombobox, DropdownMenu, sửa tiêu đề…) thì phải e.stopPropagation()
   → ESC chỉ đóng control đó, không đóng popup. Đang gõ bộ gõ tiếng Việt (isComposing) → bỏ qua. */
const stack = []
let bound = false
function onKey(e) {
  if (e.key !== 'Escape' || e.isComposing || e.defaultPrevented || !stack.length) return
  e.preventDefault()
  stack[stack.length - 1].close()
}
/** Đăng ký 1 lớp → trả về hàm hủy đăng ký */
export function pushEsc(close) {
  const entry = { close }
  stack.push(entry)
  if (!bound && typeof window !== 'undefined') { window.addEventListener('keydown', onKey); bound = true }
  return () => { const i = stack.indexOf(entry); if (i >= 0) stack.splice(i, 1) }
}
/** Dùng trong component: useEscClose(() => emit('close')) · lớp bật / tắt theo điều kiện: useEscClose(close, () => !!selected.value) */
export function useEscClose(close, isOpen = () => true) {
  let off = null
  const stop = watch(isOpen, open => {
    if (open && !off) off = pushEsc(() => close())
    else if (!open && off) { off(); off = null }
  }, { immediate: true })
  if (getCurrentInstance()) onBeforeUnmount(() => { stop(); off?.(); off = null })
  return () => { stop(); off?.(); off = null }
}
