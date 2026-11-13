/* ═══ Thanh cuộn mảnh — CHỈ khi hệ điều hành đang dùng thanh cuộn "cổ điển" (luôn hiện, chiếm chỗ) ═══
   Mặc định mds-ui để thanh cuộn của hệ điều hành (macOS “khi cuộn” = overlay tự ẩn — đẹp sẵn, không đụng vào).
   Máy hiện thanh cuộn cổ điển (Windows, macOS “luôn hiện”, chuột ngoài…) → rãnh xám thô → gắn <html class="classic-scrollbars">
   để style.css vẽ thanh cuộn mảnh: rãnh trong suốt, con trượt bo tròn xám nhạt, đậm lên khi rê. */
export function detectClassicScrollbars() {
  if (typeof document === 'undefined') return
  const check = () => {
    const el = document.createElement('div')
    el.style.cssText = 'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;visibility:hidden'
    document.body.appendChild(el)
    const classic = el.offsetWidth - el.clientWidth > 0   // thanh cuộn chiếm chỗ → cổ điển
    el.remove()
    document.documentElement.classList.toggle('classic-scrollbars', classic)
  }
  if (document.body) check(); else document.addEventListener('DOMContentLoaded', check, { once: true })
  window.matchMedia?.('(pointer: fine)').addEventListener?.('change', check)   // cắm / rút chuột → macOS có thể đổi kiểu
}
