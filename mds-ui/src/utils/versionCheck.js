import { ref } from 'vue'

/* ═══ Báo có bản mới — app build ra /version.json { build }; trình duyệt đang chạy bản khác → cần tải lại ═══
   Kiểm tra định kỳ (mặc định 60 giây) + mỗi khi quay lại tab. current rỗng (chạy dev) → không kiểm tra. */
export const updateAvailable = ref(false)
let timer = null
export function startVersionCheck(current, { url = '/version.json', interval = 60000 } = {}) {
  if (!current || timer || typeof window === 'undefined') return
  const check = async () => {
    if (updateAvailable.value) return
    try {
      const r = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store' })
      if (!r.ok) return
      const { build } = await r.json()
      if (build && build !== current) updateAvailable.value = true
    } catch { /* mất mạng / máy chủ đang khởi động lại → thử lần sau */ }
  }
  timer = setInterval(check, interval)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check() })
  setTimeout(check, 5000)
}
