import { ref, computed, watch } from 'vue'
import { currentUser } from './db.js'
import { backend, api } from './api.js'

/**
 * Thiết lập cột của 1 bảng: ẩn/hiện + thứ tự + xuống dòng — THEO TỪNG NGƯỜI, ai tự chỉnh thì giữ của người đó.
 * - Lưu theo tài khoản trên máy chủ (user.prefs.cols[<bảng>]) → đổi máy / trình duyệt vẫn còn; bản sao localStorage để mở nhanh.
 * - Chỉ lưu khi người dùng tự chỉnh; chưa chỉnh → luôn theo thứ tự mặc định mới nhất. “Về mặc định” → xóa thiết lập riêng.
 * - Đổi thứ tự mặc định / thêm cột KHÔNG xóa thiết lập riêng: cột mới tự chèn sau cột đứng trước nó.
 * - key có hậu tố phiên bản cũ (VD 'tasks-v9-all') → gộp về 1 bảng ('tasks-all'); thiết lập lưu ở phiên bản cũ được lấy lại.
 * baseColumns: định nghĩa cột gốc của DataTable. locked: các cột luôn hiển thị.
 */
export function useColumnSettings(key, baseColumns, { locked = [] } = {}) {
  const table = key.replace(/-v\d+/, '')                     // bỏ hậu tố phiên bản → 1 thiết lập / bảng
  const LOCAL = 'chamdiem-cols-' + table + ':' + (currentUser.value?.id ?? 'guest')
  const defaults = () => baseColumns.map(c => ({ key: c.key, visible: !c.hidden }))

  /* Ghép thiết lập đã lưu với danh sách cột hiện tại: bỏ cột không còn, chèn cột mới sau cột đứng trước nó */
  function merge(saved) {
    const out = saved.filter(s => baseColumns.some(c => c.key === s.key))
    baseColumns.forEach((c, i) => {
      if (out.some(s => s.key === c.key)) return
      const prev = baseColumns.slice(0, i).reverse().find(p => out.some(s => s.key === p.key))
      const at = prev ? out.findIndex(s => s.key === prev.key) + 1 : 0
      out.splice(at, 0, { key: c.key, visible: !c.hidden })
    })
    return out
  }
  const readLocal = k => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }
  /* Thiết lập cũ (trước khi lưu theo tài khoản): 'chamdiem-cols-<key có phiên bản>' — lấy phiên bản mới nhất có lưu */
  function legacy() {
    try {
      const m = key.match(/^(.*?)-v\d+(.*)$/)
      const re = m ? new RegExp(`^chamdiem-cols-${m[1].replace(/[-]/g, '\\-')}-v(\\d+)${m[2].replace(/[-]/g, '\\-')}$`) : null
      let best = null, ver = -1
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k === 'chamdiem-cols-' + key || k === 'chamdiem-cols-' + table) { best = k; ver = 1e9; continue }
        const mm = re && k.match(re)
        if (mm && Number(mm[1]) > ver) { best = k; ver = Number(mm[1]) }
      }
      if (!best) return null
      const cols = readLocal(best), wraps = readLocal(best + '-wrap')
      return Array.isArray(cols) ? { cols, wraps: wraps && typeof wraps === 'object' ? wraps : {} } : null
    } catch { return null }
  }
  /* Nguồn: máy chủ (theo tài khoản) → bản sao trên trình duyệt → thiết lập cũ */
  const source = () => currentUser.value?.prefs?.cols?.[table] ?? readLocal(LOCAL) ?? legacy()

  const state = ref([]), wraps = ref({}), widths = ref({}), custom = ref(false)
  function load() {
    const s = source()
    custom.value = !!(s && ((Array.isArray(s.cols) && s.cols.length) || Object.keys(s.widths ?? {}).length))
    state.value = s && Array.isArray(s.cols) && s.cols.length ? merge(s.cols) : defaults()
    wraps.value = s?.wraps && typeof s.wraps === 'object' ? { ...s.wraps } : {}
    widths.value = s?.widths && typeof s.widths === 'object' ? { ...s.widths } : {}
  }
  load()
  // Đăng nhập xong / dữ liệu tài khoản về sau khi bảng đã hiện / đổi người dùng → nạp lại thiết lập của người đó
  watch(() => [currentUser.value?.id, JSON.stringify(currentUser.value?.prefs?.cols?.[table] ?? null)], load)

  function persist(value) {
    try { value ? localStorage.setItem(LOCAL, JSON.stringify(value)) : localStorage.removeItem(LOCAL) } catch { /* bỏ qua */ }
    const u = currentUser.value
    if (u) u.prefs = { ...(u.prefs ?? {}), cols: { ...(u.prefs?.cols ?? {}), [table]: value ?? undefined } }
    if (backend.enabled) api.put('/api/me/prefs', { cols: { [table]: value } }).catch(() => {})
  }
  const snapshot = () => ({ cols: state.value, wraps: wraps.value, widths: widths.value })
  /** Độ rộng cột người dùng kéo (px) · null = về mặc định */
  function setWidth(k, w) {
    const next = { ...widths.value }
    if (w == null) delete next[k]; else next[k] = Math.max(60, Math.min(1200, Math.round(w)))
    widths.value = next
    if (!custom.value) { custom.value = true }
    persist(snapshot())
  }

  function setWrap(k, v) {
    wraps.value = { ...wraps.value, [k]: !!v }
    custom.value = true
    persist(snapshot())
  }
  const columns = computed(() => state.value
    .filter(s => s.visible || locked.includes(s.key))
    .map(s => baseColumns.find(c => c.key === s.key))
    .filter(Boolean)
    .map(c => (c.key in wraps.value ? { ...c, wrap: wraps.value[c.key] } : c))
    // Độ rộng đã lưu → cột cố định đúng độ rộng đó; defaultWidth để “nhấp đúp về mặc định”
    .map(c => (c.key in widths.value ? { ...c, defaultWidth: c.width ?? c.minWidth, width: widths.value[c.key] } : c)))
  const isCustom = computed(() => JSON.stringify(state.value) !== JSON.stringify(defaults()))

  function save(next) {
    state.value = next.map(s => ({ key: s.key, visible: s.visible || locked.includes(s.key) }))
    custom.value = true
    persist(snapshot())
  }
  /** Về mặc định: xóa thiết lập riêng → theo thứ tự mặc định (kể cả khi mặc định đổi sau này) */
  function reset() {
    state.value = defaults(); wraps.value = {}; widths.value = {}; custom.value = false
    persist(null)
  }

  return { state, columns, isCustom, save, reset, defaults, locked, setWrap, setWidth }
}
