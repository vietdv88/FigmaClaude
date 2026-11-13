/* ═══ Quy chuẩn tiện dụng ô nhập — cài 1 lần cho cả app: installInputBehaviors() (VD trong main.js) ═══
   • Focus vào ô nhập 1 dòng (Tab / Shift+Tab / bấm chuột) → CHỌN HẾT nội dung (Select All) để gõ đè ngay.
   • Không áp dụng: textarea (nội dung dài), checkbox / radio / file, ô chỉ đọc, ô có data-no-select-all. */
const SELECTABLE = new Set(['text', 'search', 'email', 'url', 'tel', 'password', 'number', ''])
const eligible = el => el instanceof HTMLInputElement && SELECTABLE.has(el.type) && !el.readOnly && !el.disabled && !el.closest('[data-no-select-all]')

let installed = false
export function installInputBehaviors() {
  if (installed || typeof document === 'undefined') return
  installed = true
  let justFocused = null
  document.addEventListener('focusin', e => {
    const el = e.target
    if (!eligible(el)) return
    justFocused = el
    requestAnimationFrame(() => { try { if (document.activeElement === el) el.select() } catch { /* type không hỗ trợ select */ } })
  })
  // Bấm chuột để focus: trình duyệt đặt con trỏ ở chỗ bấm sau khi focus → giữ lại vùng chọn hết (chỉ lần bấm đầu tiên)
  document.addEventListener('mouseup', e => {
    if (justFocused && e.target === justFocused) { e.preventDefault(); try { justFocused.select() } catch { /* bỏ qua */ } }
    justFocused = null
  }, true)
  document.addEventListener('keydown', () => { justFocused = null }, true)
}
