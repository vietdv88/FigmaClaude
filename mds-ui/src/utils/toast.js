import { reactive } from 'vue'

/* ═══ Toast (quy chuẩn): thông báo ngắn ở GIỮA PHÍA TRÊN màn hình, tự ẩn ═══
   toast.success('Cập nhật thành công') · toast.error(msg) · toast.warning(msg) · toast.info(msg)
   Có thao tác hoàn tác: toast.success('Đã cập nhật…', { action: { label: 'Hoàn tác', onClick: undo } }) → hiện 8 giây, rê chuột vào thì dừng đếm.
   Cần đặt <AppToaster /> 1 lần trong khung app (VD AppShell). Cùng nội dung bắn liên tiếp → gộp 1 cái (làm mới thời gian). */
export const toasts = reactive([])
let seq = 0
const DURATION = { success: 5000, info: 5000, warning: 5000, error: 5000 }   // quy chuẩn: mọi loại hiện 5 giây rồi tự ẩn
const ACTION_MS = 8000   // có nút thao tác (VD Hoàn tác) → hiện lâu hơn để kịp bấm

export function dismissToast(id) {
  const i = toasts.findIndex(t => t.id === id)
  if (i >= 0) { clearTimeout(toasts[i].timer); toasts.splice(i, 1) }
}
/* Rê chuột vào toast → dừng đếm giờ · rời ra → đếm lại (đủ thời gian đọc / bấm Hoàn tác) */
export function pauseToast(id) { const t = toasts.find(x => x.id === id); if (t) clearTimeout(t.timer) }
export function resumeToast(id) { const t = toasts.find(x => x.id === id); if (t) { clearTimeout(t.timer); t.timer = setTimeout(() => dismissToast(t.id), Math.min(t.ms, 4000)) } }
/** Bấm nút thao tác: chạy action rồi đóng toast */
export function runToastAction(id) {
  const t = toasts.find(x => x.id === id)
  if (!t?.action) return
  dismissToast(id)
  t.action.onClick?.()
}
/** opts: { type, duration, action: { label, onClick } } — có action → mặc định hiện 8 giây, không gộp với toast cũ (mỗi cái 1 thao tác riêng) */
export function toast(message, { type = 'success', duration, action } = {}) {
  if (!message) return
  const ms = duration ?? (action ? ACTION_MS : DURATION[type] ?? 3000)
  const same = toasts.find(t => t.message === message && t.type === type)
  if (same && !action && !same.action) { clearTimeout(same.timer); same.timer = setTimeout(() => dismissToast(same.id), ms); return same.id }
  if (same) dismissToast(same.id)   // cùng nội dung có thao tác → thay bằng cái mới (Hoàn tác theo lần sửa mới nhất)
  const t = { id: ++seq, type, message, action: action ?? null, ms, timer: null }
  t.timer = setTimeout(() => dismissToast(t.id), ms)
  toasts.unshift(t)   // mới nhất ở trên cùng, cũ đẩy xuống
  if (toasts.length > 3) dismissToast(toasts.at(-1).id)   // quy chuẩn: tối đa 3 cái cùng lúc, nhiều hơn thì ẩn cái cũ
  return t.id
}
toast.success = (m, o) => toast(m, { ...o, type: 'success' })
toast.error   = (m, o) => toast(m, { ...o, type: 'error' })
toast.warning = (m, o) => toast(m, { ...o, type: 'warning' })
toast.info    = (m, o) => toast(m, { ...o, type: 'info' })
