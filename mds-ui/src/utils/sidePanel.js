/* ═══ v-side-panel — panel bên phải (chat, trợ lý AI…) cao FULL màn hình, ĐẨY cả trang (kể cả header) sang trái thay vì đè lên nội dung ═══
   Cách dùng: <Teleport to="body"><aside v-if="open" class="side-panel" v-side-panel>…</aside></Teleport>
   · Panel phải nằm ngoài .app-shell (Teleport to body) — .app-shell co lại theo biến --side-panel-w (độ rộng panel, theo dõi khi kéo đổi độ rộng).
   · .app-shell có `contain: layout` → drawer / popover position: fixed bên trong neo theo trang đã co, không chui xuống dưới panel.
   · Mỗi lúc chỉ nên mở 1 panel (panel mở sau ghi đè biến). */
const root = () => document.documentElement
let owner = null, relayout = null
// Trang co / giãn xong (transition 0.2s) → báo resize để biểu đồ, bảng… vẽ lại theo độ rộng mới
const notify = () => { clearTimeout(relayout); relayout = setTimeout(() => window.dispatchEvent(new Event('resize')), 230) }

export const vSidePanel = {
  mounted(el) {
    owner = el
    const set = () => { if (owner === el) { root().style.setProperty('--side-panel-w', el.offsetWidth + 'px'); notify() } }
    set()
    el._sidePanelRO = new ResizeObserver(set)
    el._sidePanelRO.observe(el)
  },
  unmounted(el) {
    el._sidePanelRO?.disconnect()
    if (owner === el) { owner = null; root().style.removeProperty('--side-panel-w'); notify() }
  },
}
