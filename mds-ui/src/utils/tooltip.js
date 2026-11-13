/* ═══ v-tip — tooltip nền tối (thay tooltip mặc định của trình duyệt `title`) ═══
   <span v-tip="'Nội dung'">…</span> · giá trị rỗng / null → không hiện.
   Hiện ngay khi hover / focus, mũi tên chỉ vào phần tử, tự lật xuống dưới khi thiếu chỗ phía trên.
   ⛔ QUY TẮC CHUNG (tự áp, không cần nhớ ở từng chỗ): tooltip CHỈ hiện khi nó cho thêm thông tin —
     · phần tử chỉ có icon / chữ đang bị ẩn (VD sidebar thu gọn) → hiện
     · chữ bị cắt "…" / tràn → hiện
     · chữ viết tắt (PBI, BA…) hoặc tooltip là câu giải thích KHÁC chữ đang hiện → hiện
     · chữ hiện ĐẦY ĐỦ và tooltip chỉ lặp lại đúng chữ đó (VD mục sidebar mở rộng) → KHÔNG hiện
   Cần ép hiện dù trùng chữ (hiếm): v-tip.always. */
let tipEl = null
const norm = s => (s || '').replace(/\s+/g, ' ').trim().toLowerCase()
/* Tooltip có thừa không: chữ đang hiện đầy đủ (không bị cắt) và đã chứa trọn nội dung tooltip */
function redundant(el, text) {
  const { visible, truncated, shown } = textState(el)
  if (!visible || truncated) return false
  const t = norm(text)
  return !!t && norm(shown).includes(t)
}
function show(el) {
  const text = el.__tipText
  if (!text) return
  if (!el.__tipAlways && redundant(el, text)) return
  hide()
  tipEl = document.createElement('div')
  tipEl.className = 'mds-tip'
  tipEl.setAttribute('role', 'tooltip')
  tipEl.textContent = text
  document.body.appendChild(tipEl)
  const r = el.getBoundingClientRect(), t = tipEl.getBoundingClientRect()
  const above = r.top - t.height - 8 >= 4
  const left = Math.min(Math.max(4, r.left + r.width / 2 - t.width / 2), window.innerWidth - t.width - 4)
  tipEl.style.left = left + 'px'
  tipEl.style.top = (above ? r.top - t.height - 8 : r.bottom + 8) + 'px'
  tipEl.style.setProperty('--arrow-x', (r.left + r.width / 2 - left) + 'px')
  tipEl.classList.add(above ? 'mds-tip--top' : 'mds-tip--bottom')
}
function hide() { tipEl?.remove(); tipEl = null }

export const vTip = {
  mounted(el, { value, modifiers }) {
    el.__tipText = value || ''
    el.__tipAlways = !!modifiers?.always
    el.__tipShow = () => show(el)
    // focus chỉ hiện khi đi bằng bàn phím — bấm chuột cũng gây focus, không được bật lại tooltip vừa ẩn (tooltip treo sau khi bấm)
    el.__tipFocus = () => { if (el.matches(':focus-visible')) show(el) }
    el.addEventListener('mouseenter', el.__tipShow)
    el.addEventListener('focus', el.__tipFocus)
    el.addEventListener('mousedown', hide)
    el.addEventListener('mouseleave', hide)
    el.addEventListener('blur', hide)
    window.addEventListener('scroll', hide, true)
  },
  updated(el, { value, modifiers }) { el.__tipText = value || ''; el.__tipAlways = !!modifiers?.always },
  beforeUnmount(el) {
    el.removeEventListener('mouseenter', el.__tipShow)
    el.removeEventListener('focus', el.__tipFocus)
    el.removeEventListener('mousedown', hide)
    el.removeEventListener('mouseleave', hide)
    el.removeEventListener('blur', hide)
    window.removeEventListener('scroll', hide, true)
    hide()
  },
}

/* ═══ Tooltip TỰ ĐỘNG cho mọi nút — gọi 1 lần ở main.js: enableAutoTooltips() ═══
   Rê chuột vào nút / link có `title` → hiện tooltip mds-ui ngay (không phải tooltip trình duyệt chậm, nhỏ, khó nhìn);
   `title` được chuyển sang `aria-label` (trình đọc màn hình vẫn đọc). Nút chỉ có icon mà có aria-label cũng hiện tooltip.
   Phần tử dùng v-tip tự lo tooltip của mình → bỏ qua. Vue đổi :title động → lần rê sau đọc lại giá trị mới. */
let autoOn = false
/* Chữ trong nút: có đang hiện không (sidebar thu gọn: nhãn bị ẩn / bề rộng 0 → coi như chỉ có icon) · có bị cắt không (… / tràn) */
function textState(el) {
  let visible = false, truncated = false, shown = ''
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue
    const host = n.parentElement, cs = host && getComputedStyle(host), r = host?.getBoundingClientRect()
    if (!host || !r || r.width < 2 || r.height < 2 || cs.visibility === 'hidden' || Number(cs.opacity) < 0.15) continue
    visible = true
    shown += ' ' + n.textContent
    if (host.scrollWidth > host.clientWidth + 1 || host.scrollHeight > host.clientHeight + 2) truncated = true
  }
  return { visible, truncated, shown }
}
export function enableAutoTooltips() {
  if (autoOn || typeof document === 'undefined') return
  autoOn = true
  document.addEventListener('mouseover', e => {
    const el = e.target.closest?.('button, a, [role="button"], .btn-icon, .icon-swap, .btn-icon-white')
    if (!el || el.__tipShow || el.disabled) return
    const t = el.getAttribute('title')
    if (t) { el.removeAttribute('title'); el.dataset.autotip = t; if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', t) }
    // Quy tắc: chỉ hiện khi nút CHỈ có icon (không có chữ đang hiện) hoặc chữ bị cắt / viết tắt — chữ hiện đầy đủ thì không cần tooltip
    const { visible, truncated } = textState(el)
    if (visible && !truncated) return
    const text = el.dataset.autotip || el.getAttribute('aria-label')
    if (!text) return
    el.__tipText = text
    show(el)
    el.addEventListener('mouseleave', hide, { once: true })
  }, true)
  document.addEventListener('mousedown', hide, true)          // bấm → ẩn tooltip (tránh che menu / hộp thoại vừa mở)
  window.addEventListener('scroll', hide, true)
}
