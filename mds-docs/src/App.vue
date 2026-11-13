<template>
  <RouteProgress />
  <div class="ds-app">
    <!-- Header chuẩn mds-ui (như PD Point): bánh răng → Thiết lập màu sắc & hiển thị · người biên tập có thêm “Quản trị nội dung” -->
    <ControlHeader app-name="MISA Design System" home-href="/ds/" no-meta hide-trial-banner
      :hide-tools="['ai', 'notify', 'help', 'more']" :apps="APPS" current-app="ds"
      :settings-only="!settingsMenu.length" :settings-menu="settingsMenu" @settings-select="onSettings" @home="router.push('/')"
      :hide-avatar="!state.me.user" :avatar-name="state.me.user?.name || ''" :profile-menu="PROFILE_MENU" @profile-select="onProfile"
      v-on="state.me.user ? { logout } : {}">
      <template #header-start>
        <button v-if="!isAdmin || state.me.canEdit" type="button" class="btn-icon-white ds-header__menu" aria-label="Mở menu" @click="navOpen = !navOpen"><TIcon name="menu-2" /></button>
      </template>
      <template #logo-icon><img class="ds-logo" :src="currentMode === 'light' ? logoColor : logoWhite" alt="" width="32" height="32" /></template>
      <template #header-search><DocSearch /></template>
      <template #header-actions>
        <!-- Đường dẫn dự phòng (IP) + nút sao chép — như app Chấm điểm -->
        <AccessLinkCopy />
        <!-- Ai đang xem tài liệu (như app Chấm điểm) — chỉ người biên tập thấy: tên / Khách, máy, IP, trang đang xem -->
        <OnlineUsersBadge v-if="state.me.canEdit" />
        <!-- App mẫu code đúng quy chuẩn: app Chấm điểm (MISA Solution Point) bản dùng thử — dữ liệu mẫu, không cần đăng nhập -->
        <a :href="DEMO_APP_URL" target="_blank" rel="noopener" class="btn btn--ghost-white ds-header__demo"
          v-tip="'App Chấm điểm bản dùng thử — code theo đúng quy chuẩn này, dữ liệu mẫu, không cần đăng nhập'" aria-label="Xem app mẫu (mở tab mới)">
          <TIcon name="player-play" /><span class="ds-header__demo-label">Xem app mẫu</span>
        </a>
        <DocAva v-if="state.me.aiEnabled" />
      </template>
      <template #header-end>
        <a v-if="!state.me.user" :href="loginUrl(route.fullPath === '/' ? '/ds/' : '/ds' + route.fullPath)" class="ds-header__login">Đăng nhập</a>
      </template>
    </ControlHeader>
    <div class="ds-body">
      <template v-if="!isAdmin || state.me.canEdit">
        <div v-if="navOpen" class="ds-nav-backdrop" @click="navOpen = false" />
        <div class="ds-nav" :class="{ 'ds-nav--open': navOpen }">
          <AdminNav v-if="isAdmin" :force-expanded="narrow" @navigate="navOpen = false" />
          <DocNav v-else :force-expanded="narrow" @navigate="navOpen = false" />
        </div>
      </template>
      <main class="ds-main" :class="{ 'ds-main--admin': isAdmin }">
        <RouterView :key="isAdmin ? route.path : route.params.slug || '/'" />
      </main>
    </div>
  </div>
  <AppToaster />
  <AppNotifier />
  <StickyNotes :user="state.me.user" :login-url="loginUrl(route.fullPath === '/' ? '/ds/' : '/ds' + route.fullPath)" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RouteProgress from '@mds/components/RouteProgress.vue'
import ControlHeader from '@mds/components/ControlHeader.vue'
import AccessLinkCopy from './components/AccessLinkCopy.vue'
import OnlineUsersBadge from './components/OnlineUsersBadge.vue'
import { startPresence } from './presence.js'
import AppToaster from '@mds/components/AppToaster.vue'
import AppNotifier from '@mds/components/AppNotifier.vue'
import TIcon from '@mds/components/TIcon.vue'
import { DEMO_APP_URL, APPS } from './demoApp.js'
import { vTip } from '@mds/utils/tooltip.js'
import { applyTheme, currentTheme, applyDensity, currentDensity, applyMode, currentMode, applySidebarMode, currentSidebarMode, applyBgTint, currentBgTint, applyWallpaper, currentFontSize, applyFontSize } from '@mds/theme.js'
import DocNav from './components/DocNav.vue'
// Logo DS: header nền trắng (chế độ sáng) → bản màu · header nền màu chủ đề → bản trắng
import logoColor from './assets/logo-ds-color.svg'
import logoWhite from './assets/logo-ds-white.svg'
import AdminNav from './components/AdminNav.vue'
import DocSearch from './components/DocSearch.vue'
import DocAva from './components/DocAva.vue'
import StickyNotes from '@mds/components/StickyNotes.vue'
import { state, loadPages, loadMe, loginUrl } from './store.js'

const route = useRoute(), router = useRouter()
const navOpen = ref(false)
// Màn hẹp (≤ 1024px): sidebar nằm trong ngăn trượt, luôn mở rộng
const narrowMq = window.matchMedia('(max-width: 1024px)')
const narrow = ref(narrowMq.matches)
narrowMq.addEventListener('change', e => { narrow.value = e.matches })
const isAdmin = computed(() => !!route.meta.admin)
const settingsMenu = computed(() => (state.me.canEdit ? [isAdmin.value ? { id: 'docs', icon: 'book', label: 'Về trang tài liệu' } : { id: 'admin', icon: 'file-text', label: 'Quản trị nội dung' }] : []))
const onSettings = it => router.push(it.id === 'admin' ? '/quan-tri' : '/')
const PROFILE_MENU = [{ id: 'pdpoint', icon: 'external-link', label: 'Mở MISA Solution Point' }]
const onProfile = it => { if (it.id === 'pdpoint') window.open('/', '_blank', 'noopener') }
async function logout() { await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {}); await loadMe() }
watch(() => route.fullPath, () => { navOpen.value = false })

onMounted(() => {
  // Cùng tên miền với PD Point → dùng lại mật độ / kiểu hiển thị đã chọn bên đó; màu chủ đề lưu riêng (mặc định Xanh dương — main.js)
  applyTheme(currentTheme.value)
  applyDensity(currentDensity.value)
  applyFontSize(currentFontSize.value)
  applyMode(currentMode.value)
  applySidebarMode(currentSidebarMode.value)
  applyBgTint(currentBgTint.value)
  try { applyWallpaper(localStorage.getItem('mds-wallpaper') || 'none') } catch { /* bỏ qua */ }
  loadPages()
  loadMe()
  startPresence()   // báo máy chủ tab này đang mở tài liệu (mọi người đọc, không cần đăng nhập)
})
</script>
