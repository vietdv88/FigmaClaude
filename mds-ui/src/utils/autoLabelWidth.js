/* ═══ v-auto-label-width — độ rộng nhãn trái tự tính theo nhãn dài nhất của CẢ vùng (màn chi tiết / form nhãn trái) ═══
   Đặt 1 lần ở khung bao TẤT CẢ các card / nhóm của màn → mọi cột giá trị thẳng hàng từ trên xuống dưới.
     <div v-auto-label-width>…DetailField / AppInput :vertical="false"…</div>
     <div v-auto-label-width="{ labels: allLabels }">…</div>   ← form cấu hình động: truyền đủ nhãn từ cấu hình
   Độ rộng = nhãn dài nhất + pad, kẹp trong [min, max] → ghi vào biến --form-label-w của khung (mặc định 200px).
   TỰ ĐỘNG: mọi AppInput nhãn trái (:vertical="false") tự đăng ký với khung form gần nhất (registerAutoLabel) — không cần gắn directive.
   Quy chuẩn (user chốt 03/11/2026): cột nhãn = nhãn dài nhất + 8px (8px = khoảng cách nhãn → ô --form-label-gap-h), mọi ô thẳng hàng dọc.
   Nhãn dài hơn max → xuống dòng (không cắt "…").
   Tự tính lại khi: thêm / bớt / đổi trường (kéo thả, bật “dữ liệu trống”, mở phần thu gọn), font tải xong.
   `labels` = mọi nhãn trong cấu hình (kể cả phần đang thu gọn / trường đang ẩn) → độ rộng ổn định, không nhảy. */
const LABEL_SEL = '.detail-field__label, .input-field--row .input-field__label-wrap'
/* pad 0: khoảng 8px nhãn → ô đã nằm ở gap của .input-field--row · max 200: nhãn dài hơn thì xuống dòng */
const DEFAULTS = { min: 0, max: 200, pad: 0 }

function measure(el) {
  const opt = { ...DEFAULTS, ...(el.__alwOpt || {}) }
  let widest = 0
  // 1. Nhãn đang hiển thị (đo đúng font, dấu *, icon ⓘ…)
  el.classList.add('alw-measuring')
  // offsetWidth làm tròn XUỐNG (113.4 → 113) → thiếu phần lẻ làm nhãn xuống dòng: +1px bù phần lẻ (không dùng getBoundingClientRect vì bị scale trong khung xem thử)
  for (const l of el.querySelectorAll(LABEL_SEL)) widest = Math.max(widest, l.offsetWidth + 1)
  // 2. Nhãn từ cấu hình chưa render (phần thu gọn, trường ẩn)
  if (opt.labels?.length) {
    const probe = document.createElement('span')
    probe.className = 'detail-field__label'
    el.appendChild(probe)
    for (const text of opt.labels) { probe.textContent = text; widest = Math.max(widest, probe.offsetWidth + 1) }
    probe.remove()
  }
  el.classList.remove('alw-measuring')
  const w = widest ? Math.min(opt.max, Math.max(opt.min, Math.ceil(widest) + opt.pad)) : opt.max
  if (el.__alwW !== w) { el.__alwW = w; el.style.setProperty('--form-label-w', w + 'px') }
}

function schedule(el) {
  if (el.__alwRaf) return
  el.__alwRaf = requestAnimationFrame(() => { el.__alwRaf = 0; measure(el) })
}

export const vAutoLabelWidth = {
  mounted(el, { value }) {
    el.__alwOpt = value || {}
    measure(el)
    // Form kéo thả / ẩn hiện trường → DOM đổi → tính lại (gộp nhiều thay đổi vào 1 frame)
    el.__alwMo = new MutationObserver(muts => {
      if (muts.every(m => m.type === 'attributes' && m.target === el)) return   // bỏ qua chính style mình vừa ghi
      schedule(el)
    })
    el.__alwMo.observe(el, { childList: true, subtree: true, characterData: true })
    document.fonts?.ready.then(() => measure(el))
  },
  updated(el, { value }) {
    el.__alwOpt = value || {}
    schedule(el)
  },
  unmounted(el) {
    el.__alwMo?.disconnect()
    cancelAnimationFrame(el.__alwRaf)
  },
}

/* ── Tự động cho form nhãn trái: AppInput :vertical="false" gọi registerAutoLabel(rootEl) khi mount ──
   Khung chung = [data-label-group] (tự chọn vùng) → .form-body (thân popup / form) → .form-fields → cha trực tiếp.
   Khung đã gắn v-auto-label-width thì để directive lo. Tính lại khi đổi cỡ chữ / mật độ (thuộc tính trên <html>). */
const GROUP_SEL = '[data-label-group], .form-body, .form-fields'
const autoBoxes = new Set()
let htmlMo = null
export function registerAutoLabel(fieldEl) {
  const box = fieldEl?.closest?.(GROUP_SEL) || fieldEl?.parentElement
  if (!box || box.__alwMo) return null   // đã có directive
  box.__alwRefs = (box.__alwRefs || 0) + 1
  autoBoxes.add(box)
  schedule(box)
  if (!htmlMo && typeof MutationObserver !== 'undefined') {
    htmlMo = new MutationObserver(() => autoBoxes.forEach(schedule))
    htmlMo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-font-size', 'data-density'] })
    document.fonts?.ready.then(() => autoBoxes.forEach(schedule))
  }
  return box
}
export function unregisterAutoLabel(box) {
  if (!box) return
  box.__alwRefs = Math.max(0, (box.__alwRefs || 1) - 1)
  if (!box.__alwRefs) { autoBoxes.delete(box); box.style.removeProperty('--form-label-w'); box.__alwW = undefined }
  else schedule(box)
}
export const remeasureAutoLabel = box => box && schedule(box)
