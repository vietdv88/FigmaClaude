import { nextTick } from 'vue'

/* ═══ Quy chuẩn: mở form THÊM → con trỏ nằm sẵn ở ô nhập đầu tiên (bỏ qua ô chỉ đọc / bị khóa / ẩn) ═══ */
const FIELD = [
  'input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not([readonly]):not([disabled])',
  'textarea:not([readonly]):not([disabled])',
  'select:not([disabled])',
].join(', ')

/** Đặt con trỏ vào ô nhập đầu tiên đang hiện trong `root`. Trả về ô đã focus (hoặc null). */
export async function focusFirstField(root) {
  await nextTick()
  const el = [...(root?.querySelectorAll(FIELD) ?? [])].find(e => e.offsetParent !== null)
  el?.focus({ preventScroll: true })
  return el ?? null
}

/* ═══ Quy chuẩn: trong form, phím Tab chỉ đi qua các Ô NHẬP (input, textarea, select, combobox, checkbox) ═══
   Nút / link / icon ⓘ / tab / nút xóa dòng trong thân form → tabindex=-1 (vẫn bấm chuột được).
   Nút ở chân form (Lưu / Hủy) nằm ngoài thân form nên vẫn Tab tới được. */
const NON_FIELD = 'button, a[href], summary, [tabindex]:not([tabindex="-1"])'
export function fieldsOnlyTab(root) {
  if (!root) return () => {}
  const apply = () => root.querySelectorAll(NON_FIELD).forEach(el => {
    if (!el.matches('input, textarea, select')) el.setAttribute('tabindex', '-1')
  })
  apply()
  const mo = new MutationObserver(apply)   // phần hiện thêm sau (tab, dòng mới…) cũng áp dụng
  mo.observe(root, { subtree: true, childList: true })
  return () => mo.disconnect()
}
