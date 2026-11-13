<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <img class="auth-brand__logo" src="/logo.svg" width="36" height="36" alt="" />
        <span class="auth-brand__name">{{ APP_NAME }}</span>
      </div>
      <template v-if="user?.status === 'disabled'">
        <h1 class="auth-title">Tài khoản đã bị khóa</h1>
        <p class="auth-desc">Tài khoản <strong>{{ user.email }}</strong> không còn quyền truy cập. Liên hệ Quản trị nếu cần mở lại.</p>
      </template>
      <template v-else>
        <h1 class="auth-title">{{ user?.registeredAt ? 'Đăng ký thành công — đang chờ duyệt' : 'Đang chờ cấp quyền' }}</h1>
        <p v-if="user?.registeredAt" class="auth-desc">
          Tài khoản <strong>{{ user.name }} ({{ user.code }})</strong> đã được gửi tới Quản trị. Khi được duyệt và gán vai trò, dự án,
          trang này tự chuyển vào ứng dụng — lần sau đăng nhập bằng mã nhân viên và mật khẩu bạn vừa đặt.
        </p>
        <p v-else class="auth-desc">
          Bạn đã đăng nhập bằng <strong>{{ user?.email }}</strong> nhưng chưa được cấp quyền vào ứng dụng.
          Quản trị sẽ duyệt và gán bộ phận, dự án cho bạn — sau đó bấm “Kiểm tra lại”.
        </p>
      </template>
      <p v-if="msg" class="auth-status">{{ msg }}</p>
      <div class="auth-actions">
        <button class="btn btn--outline btn--neutral" @click="doLogout">Đăng xuất</button>
        <button v-if="user?.status !== 'disabled'" class="btn btn--primary" @click="recheck"><TIcon name="refresh" />Kiểm tra lại</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { APP_NAME } from '../store/app.js'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import TIcon from '@mds/components/TIcon.vue'
import { backend, fetchMe } from '../store/api.js'
import { enterApp, signOut } from '../store/session.js'

const router = useRouter()
const user = computed(() => backend.user)
const msg = ref('')

async function recheck() {
  const u = await fetchMe()
  if (!u) return router.replace('/dang-nhap')
  if (u.status === 'active') { await enterApp(); router.replace('/') }
  else msg.value = 'Vẫn chưa được cấp quyền.'
}
async function doLogout() { await signOut(); router.replace('/') }
/* Tự kiểm tra lại mỗi 20 giây — được duyệt là vào app luôn */
let timer = null
onMounted(() => { timer = setInterval(async () => {
  if (document.visibilityState !== 'visible' || user.value?.status === 'disabled') return
  const u = await fetchMe().catch(() => null)
  if (u?.status === 'active') { clearInterval(timer); await enterApp(); router.replace('/') }
}, 20000) })
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--card-col-gap); background: var(--bg-page); }
.auth-card { width: 440px; max-width: 100%; display: flex; flex-direction: column; gap: 16px; padding: 32px; border-radius: var(--radius-dialog); background: var(--bg-white); box-shadow: var(--shadow-card); }
.auth-brand { display: flex; align-items: center; gap: 8px; }
.auth-brand__logo { width: 36px; height: 36px; flex-shrink: 0; }
.auth-brand__name { font-size: var(--text-h3); font-weight: var(--fw-semibold); color: var(--text-primary); }
.auth-title { font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.auth-desc { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.auth-desc strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.auth-status { font-size: var(--text-body); color: var(--text-warning); }
.auth-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>
