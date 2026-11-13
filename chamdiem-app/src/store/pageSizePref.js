import { currentUser } from './db.js'
import { backend, api } from './api.js'

/* Số dòng/trang chọn gần nhất cho MỌI danh sách (provide('pageSizeStore') ở main.js, mds-ui TablePaging / AppPagination tự dùng)
   — theo TÀI KHOẢN trên máy chủ (user.prefs.pageSize), bản sao localStorage để mở nhanh / chế độ demo. */
const LOCAL = () => 'pdpoint-pagesize:' + (currentUser.value?.id ?? 'guest')
const readLocal = () => { try { return Number(localStorage.getItem(LOCAL())) || null } catch { return null } }

export const pageSizeStore = {
  get() { return Number(currentUser.value?.prefs?.pageSize) || readLocal() },
  set(n) {
    try { localStorage.setItem(LOCAL(), String(n)) } catch { /* bỏ qua */ }
    const u = currentUser.value
    if (u) u.prefs = { ...(u.prefs ?? {}), pageSize: n }
    if (backend.enabled) api.put('/api/me/prefs', { pageSize: n }).catch(() => {})
  },
}
