import { ref, watch } from 'vue'
import { userPref } from './userPrefs.js'
import { currentUser } from './db.js'
import { api, backend } from './api.js'

/* Dự án yêu thích (đánh dấu ☆) — hiện ở vùng “Dự án yêu thích” trên Tổng quan.
   Có máy chủ: lưu THEO TÀI KHOẢN trên máy chủ (user.prefs.favProjects) → đổi trình duyệt / máy / http ↔ https / IP vẫn còn,
   Safari không tự xóa. Lần đầu (máy chủ chưa có) → chuyển danh sách đang lưu ở trình duyệt lên. Không có máy chủ (demo): lưu trình duyệt. */
const local = userPref('fav-projects', [])
export const favProjectIds = ref([...local.value])
let migratedFor = ''
// theo dõi cả bản trình duyệt (nạp theo tài khoản sau khi đăng nhập) → lần chuyển lên đầu tiên dùng đúng danh sách của tài khoản đó
watch(() => [currentUser.value?.id, currentUser.value?.prefs?.favProjects, local.value], ([id, server]) => {
  if (!backend.enabled || !id) { favProjectIds.value = [...local.value]; return }
  if (Array.isArray(server)) { favProjectIds.value = [...server]; return }
  favProjectIds.value = [...local.value]                              // chưa có trên máy chủ → dùng bản trình duyệt
  if (local.value.length && migratedFor !== id) { migratedFor = id; save(local.value) }   // …và chuyển lên 1 lần
}, { immediate: true })

function save(ids) {
  local.value = [...ids]                                              // giữ bản trình duyệt làm dự phòng
  if (!backend.enabled || !currentUser.value) return
  const u = currentUser.value
  u.prefs = { ...(u.prefs ?? {}), favProjects: [...ids] }
  api.put('/api/me/prefs', { favProjects: ids }).catch(() => {})
}
export const isFavProject = id => favProjectIds.value.includes(id)
export function toggleFavProject(id) {
  favProjectIds.value = isFavProject(id) ? favProjectIds.value.filter(x => x !== id) : [...favProjectIds.value, id]
  save(favProjectIds.value)
}
