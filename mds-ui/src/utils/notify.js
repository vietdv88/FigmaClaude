import { reactive } from 'vue'

/* ═══ Notification (quy chuẩn): thẻ thông báo sự kiện quan trọng ở GÓC PHẢI PHÍA TRÊN (dưới header), KHÔNG tự đóng ═══
   notify.success({ title: 'Nhập khẩu Hồ sơ thành công', message: '50 hồ sơ đã được nhập khẩu…' }) · notify.error / warning / info
   Mới nhất ở trên cùng, cũ đẩy xuống; người dùng bấm × thì thẻ bên dưới tự đẩy lên. Cần đặt <AppNotifier /> 1 lần trong khung app.
   Khác Toast: Toast = phản hồi nhanh thao tác vừa làm (tự ẩn sau vài giây) · Notification = hệ thống báo, cần đọc / xử lý, thường kèm chuông. */
export const notifications = reactive([])
let seq = 0
export function dismissNotification(id) { const i = notifications.findIndex(n => n.id === id); if (i >= 0) notifications.splice(i, 1) }
export function notify({ type = 'info', title, message = '' } = {}) {
  if (!title) return
  const n = { id: ++seq, type, title, message }
  notifications.unshift(n)
  if (notifications.length > 5) notifications.length = 5   // tối đa 5 thẻ cùng lúc
  return n.id
}
notify.success = o => notify({ ...o, type: 'success' })
notify.error   = o => notify({ ...o, type: 'error' })
notify.warning = o => notify({ ...o, type: 'warning' })
notify.info    = o => notify({ ...o, type: 'info' })
