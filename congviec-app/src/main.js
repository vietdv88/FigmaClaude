import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import TongQuanPage   from './pages/TongQuanPage.vue'
import ViecCuaToiPage from './pages/ViecCuaToiPage.vue'
import BaoCaoPage     from './pages/BaoCaoPage.vue'
import '@mds/style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',              redirect: '/viec-cua-toi' },
    { path: '/tong-quan',     component: TongQuanPage },
    { path: '/viec-cua-toi',  component: ViecCuaToiPage },
    { path: '/du-an/:id',     component: ViecCuaToiPage },
    { path: '/bao-cao',       component: BaoCaoPage },
    { path: '/:pathMatch(.*)*', redirect: '/tong-quan' },
  ]
})

createApp(App).use(router).mount('#app')
