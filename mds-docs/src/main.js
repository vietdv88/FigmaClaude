import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { state } from './store.js'
import { setAppTitle } from '@mds/utils/docTitle.js'
import { installInputBehaviors } from '@mds/utils/inputBehavior.js'
import { enableAutoTooltips } from '@mds/utils/tooltip.js'
import { detectClassicScrollbars } from '@mds/utils/scrollbars.js'
import { installRouteProgress } from '@mds/utils/routeProgress.js'
import { useThemeStorage } from '@mds/theme.js'
import '@mds/style.css'

// Màu chủ đề riêng của tài liệu (mặc định Xanh dương) — không dùng chung với PD Point cùng tên miền
useThemeStorage('mds-docs-theme', 'blue')
import './app.css'

setAppTitle('MISA Design System')
enableAutoTooltips()
detectClassicScrollbars()
installInputBehaviors()

const router = createRouter({
  history: createWebHistory('/ds/'),
  routes: [
    { path: '/', component: () => import('./pages/HomePage.vue') },
    { path: '/quan-tri', component: () => import('./pages/AdminPage.vue'), meta: { admin: true } },
    { path: '/quan-tri/:slug', component: () => import('./pages/EditorPage.vue'), meta: { admin: true } },
    { path: '/:slug', component: () => import('./pages/DocPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: (to, _from, saved) => saved || (to.hash ? { el: decodeURIComponent(to.hash), top: 72, behavior: 'smooth' } : { top: 0 }),
})
installRouteProgress(router)
/* Số dòng/trang chọn gần nhất theo tài khoản PD Point — cùng tên miền nên dùng chung bản lưu với PD Point (pdpoint-pagesize:<id>) */
const pageKey = () => 'pdpoint-pagesize:' + (state.me.user?.id ?? 'guest')
const pageSizeStore = {
  get() { void state.me.user; try { return Number(localStorage.getItem(pageKey())) || null } catch { return null } },
  set(n) { try { localStorage.setItem(pageKey(), String(n)) } catch { /* bỏ qua */ } },
}
createApp(App).use(router).provide('pageSizeStore', pageSizeStore).mount('#app')
