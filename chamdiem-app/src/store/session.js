import { listenChanges, stopListening, logout as apiLogout } from './api.js'
import { db, loadFromServer, applyServerPatch } from './db.js'
import { onChatPatch, startChat } from './chat.js'
import { loadNotifications, onNotificationsPatch } from './notifications.js'

/** Sau khi đăng nhập thành công: tải dữ liệu + nghe thay đổi (chỉ phần mình được xem) */
export async function enterApp(prefetched) {
  await loadFromServer(prefetched)
  // Thay đổi dữ liệu + tin nhắn chat nội bộ (patch.chat) cùng 1 kênh realtime
  listenChanges(db.seq, (p, own) => { applyServerPatch(p, own); if (p.chat) onChatPatch(p.chat); if (p.notifications) onNotificationsPatch(p.notifications) })
  startChat()
  loadNotifications()
}

export async function signOut() {
  stopListening()
  await apiLogout()
}
