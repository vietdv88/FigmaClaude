/* ═══ v-resizable-drawer — co kéo độ rộng drawer / panel neo bên phải màn hình ═══
   Rê chuột vào mép trái → tay kéo (vạch màu thương hiệu); kéo để đổi độ rộng; nhấp đúp mép → về độ rộng mặc định (CSS).
   Nhớ độ rộng theo `key` (localStorage). Phần tử cần position fixed / absolute neo `right: 0`.
   Cách dùng:
     <aside class="pd-drawer" v-resizable-drawer="{ key: 'closing-pd', min: 420 }">…</aside>
     · key: tên lưu độ rộng (bỏ trống = không nhớ) · min: px nhỏ nhất (mặc định 360) · max: px lớn nhất (mặc định 92% bề ngang màn hình; panel chat / Trợ giúp: max = 50% màn hình — truyền maxRatio: 0.5) */
const STORE = k => 'mds-drawer-w:' + k
const clamp = (w, min, max) => Math.round(Math.min(Math.max(w, min), max))

function setup(el, opts = {}) {
  const min = opts.min ?? 360
  const maxOf = () => Math.min(opts.max ?? Infinity, window.innerWidth * (opts.maxRatio ?? 0.92))
  // độ rộng đã lưu
  if (opts.key) {
    try { const w = Number(localStorage.getItem(STORE(opts.key))); if (w) el.style.width = clamp(w, min, maxOf()) + 'px' } catch { /* storage bị chặn */ }
  }
  const handle = document.createElement('div')
  handle.className = 'drawer-resize'
  const knob = document.createElement('span'); knob.className = 'drawer-resize__knob'; handle.appendChild(knob)   // nút ↔ hiện khi rê chuột / đang kéo
  handle.title = 'Kéo để đổi độ rộng · nhấp đúp để về mặc định'
  handle.addEventListener('pointerdown', e => {
    if (e.button !== 0) return
    e.preventDefault()
    el.classList.add('drawer-resizing')
    handle.setPointerCapture?.(e.pointerId)
    const move = ev => { el.style.width = clamp(window.innerWidth - ev.clientX, min, maxOf()) + 'px' }
    const up = () => {
      el.classList.remove('drawer-resizing')
      handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); handle.removeEventListener('pointercancel', up)
      if (opts.key) try { localStorage.setItem(STORE(opts.key), String(parseInt(el.style.width, 10))) } catch { /* bỏ qua */ }
    }
    handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', up); handle.addEventListener('pointercancel', up)
  })
  handle.addEventListener('dblclick', () => {
    el.style.width = ''
    if (opts.key) try { localStorage.removeItem(STORE(opts.key)) } catch { /* bỏ qua */ }
  })
  el.appendChild(handle)
  el._drawerResize = handle
}

export const vResizableDrawer = {
  mounted(el, binding) { setup(el, binding.value || {}) },
  unmounted(el) { el._drawerResize?.remove() },
}
