import { ref, watch } from 'vue'
import { currentUser } from './db.js'

/* Ghi nhớ lựa chọn theo TỪNG NGƯỜI DÙNG trên trình duyệt (bộ lọc, chế độ xem…) — máy dùng chung không lẫn của nhau.
   key: tên lựa chọn · def: giá trị mặc định · legacyKey: khóa cũ (lưu chung) → chuyển sang người dùng hiện tại 1 lần */
const keyOf = key => `pdpoint-pref:${currentUser.value?.id ?? 'guest'}:${key}`

export function readPref(key, def, legacyKey) {
  try {
    const raw = localStorage.getItem(keyOf(key)) ?? (legacyKey ? localStorage.getItem(legacyKey) : null)
    return raw == null ? def : JSON.parse(raw)
  } catch { return def }
}
export function writePref(key, value) {
  try { localStorage.setItem(keyOf(key), JSON.stringify(value)) } catch { /* storage bị chặn → bỏ qua */ }
}

/** ref tự lưu theo người dùng; đổi người dùng (demo / đăng nhập lại) → nạp lại lựa chọn của người đó */
export function userPref(key, def, legacyKey) {
  const r = ref(readPref(key, def, legacyKey))
  watch(r, v => writePref(key, v), { deep: true })
  watch(() => currentUser.value?.id, () => { r.value = readPref(key, def) })
  return r
}
