<template>
  <RouteProgress />
  <RouterView />
  <!-- Mất phiên đăng nhập giữa chừng (hết hạn / đăng xuất / tab khác đổi tài khoản): giữ nguyên trang để không mất dữ liệu đang nhập,
       đăng nhập lại ở TAB MỚI rồi quay lại bấm Lưu lần nữa (api.js tự tắt hộp thoại khi phiên quay lại) -->
  <AppAlertDialog v-if="backend.sessionLost" persistent hide-close
    :title="backend.sessionLost === 'switched' ? 'Tài khoản đã đổi ở tab khác' : 'Phiên đăng nhập đã hết'"
    :confirm-label="backend.sessionLost === 'switched' ? 'Tải lại trang' : 'Đăng nhập lại ở tab mới'" cancel-label="Tải lại trang"
    :hide-cancel="backend.sessionLost === 'switched'" @confirm="onSessionConfirm" @cancel="reloadPage">
    <template v-if="backend.sessionLost === 'switched'">Trình duyệt này vừa đăng nhập tài khoản khác. Tải lại trang để làm việc đúng tài khoản — dữ liệu đang nhập dở chưa lưu sẽ mất.</template>
    <template v-else>Dữ liệu bạn đang nhập vẫn còn trên trang này. Đăng nhập lại ở tab mới, xong quay lại đây và bấm Lưu lần nữa — hộp thông báo này tự đóng khi bạn đã đăng nhập lại.</template>
  </AppAlertDialog>
</template>

<script setup>
import { onMounted } from 'vue'
import AppAlertDialog from '@mds/components/AppAlertDialog.vue'
import { backend, checkSession } from './store/api.js'
const reloadPage = () => location.reload()
function onSessionConfirm() {
  if (backend.sessionLost === 'switched') return reloadPage()
  window.open(`${location.pathname.startsWith('/dung-thu') ? '/dung-thu' : ''}/dang-nhap`, '_blank', 'noopener')
  setTimeout(() => checkSession(true), 3000)
}
import RouteProgress from '@mds/components/RouteProgress.vue'
import { applyTheme, currentTheme, applyDensity, currentDensity, applyMode, applySidebarMode, currentSidebarMode, currentFontSize, applyFontSize } from '@mds/theme.js'
/* App mặc định theme Xanh lá (Green): chuyển 1 lần cho trình duyệt đã lưu màu khác trước đây,
   sau đó người dùng vẫn tự đổi được trong Thiết lập → Màu sắc */
const THEME_INIT = 'chamdiem-theme-default-green'
/* Hiển thị mặc định: Trung bình · Tiêu đề Có màu nền · Sidebar Nền trắng — cũng áp 1 lần cho mọi trình duyệt
   (kể cả đã lưu lựa chọn khác trước đây), sau đó người dùng tự đổi trong Thiết lập → Hiển thị */
const DISPLAY_INIT = 'chamdiem-display-default-v2'   // v1 đặt tiêu đề Màu trắng → v2 đưa về tiêu đề Có màu nền 1 lần cho mọi máy
const SIDEBAR_INIT = 'chamdiem-sidebar-light-v2'   // v1 từng đặt sidebar nền tối → v2 đưa về nền trắng 1 lần cho mọi máy
onMounted(() => {
  let theme = currentTheme.value
  try { if (!localStorage.getItem(THEME_INIT)) { theme = 'green'; localStorage.setItem(THEME_INIT, '1') } } catch { /* bỏ qua */ }
  let density = currentDensity.value, mode = localStorage.getItem('mds-header-mode') || 'color', sidebar = currentSidebarMode.value
  try {
    if (!localStorage.getItem(DISPLAY_INIT)) { density = 'medium'; mode = 'color'; localStorage.setItem(DISPLAY_INIT, '1') }
    if (!localStorage.getItem(SIDEBAR_INIT)) { sidebar = 'light'; localStorage.setItem(SIDEBAR_INIT, '1') }
  } catch { /* bỏ qua */ }
  applyTheme(theme)
  applyDensity(density)
  applyFontSize(currentFontSize.value)
  applyMode(mode)
  applySidebarMode(sidebar)
})
</script>
