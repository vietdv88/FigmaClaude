<template>
  <div class="auth-page">
    <div class="auth-card">
      <router-link class="auth-brand" to="/">
        <img class="auth-brand__logo" src="/logo.svg" width="36" height="36" alt="" />
        <span class="auth-brand__name">{{ APP_NAME }}</span>
      </router-link>
      <h1 class="auth-title">{{ mode === 'login' ? 'Đăng nhập' : 'Quên mật khẩu' }}</h1>
      <p class="auth-desc">{{ mode === 'login' ? 'Đăng nhập bằng mã nhân viên (hoặc Gmail) và mật khẩu.' : 'Nhập mã nhân viên hoặc Gmail đăng nhập — app gửi link đặt lại mật khẩu vào Gmail của bạn.' }}</p>

      <p v-if="otherUser" class="auth-note auth-note--warn">
        <TIcon name="alert-triangle" />
        <span>Trình duyệt đang đăng nhập bằng <strong>{{ otherUser }}</strong>. Đăng nhập tài khoản khác để chuyển sang.</span>
      </p>

      <!-- Email + mật khẩu (mật khẩu do người dùng tự đặt qua link trong email mời) -->
      <form v-if="mode === 'login'" class="auth-form" @submit.prevent="signInPassword">
        <AppInput label="Mã nhân viên hoặc Gmail" :required="true">
          <AppTextbox v-model="email" placeholder="VD: B01-0001 hoặc ten@gmail.com" autocomplete="username" />
        </AppInput>
        <AppInput label="Mật khẩu" :required="true">
          <AppTextbox v-model="password" type="password" placeholder="Nhập mật khẩu" autocomplete="current-password" />
        </AppInput>
        <!-- Ghi nhớ: giữ đăng nhập 30 ngày + điền sẵn tài khoản lần sau · bỏ chọn (máy dùng chung): đóng trình duyệt là đăng xuất -->
        <div class="auth-row">
          <AppCheckbox v-model="remember" class="auth-remember" label="Ghi nhớ đăng nhập" v-tip="'Giữ đăng nhập 30 ngày và điền sẵn tài khoản lần sau. Máy dùng chung thì bỏ chọn — đóng trình duyệt là tự đăng xuất.'" />
          <button class="btn btn--link auth-forgot" type="button" tabindex="-1" @click="toForgot">Quên mật khẩu?</button>
        </div>
        <button class="btn btn--primary btn--lg auth-submit" type="submit" :disabled="busy">Đăng nhập</button>
      </form>
      <form v-else class="auth-form" @submit.prevent="sendForgot">
        <AppInput label="Mã nhân viên hoặc Gmail" :required="true">
          <AppTextbox v-model="email" placeholder="VD: B01-0001 hoặc ten@gmail.com" autocomplete="username" />
        </AppInput>
        <p v-if="forgotSent" class="auth-note auth-note--info">
          <TIcon name="mail" /><span>Nếu <strong>{{ email }}</strong> có trong hệ thống, link đặt lại mật khẩu đã được gửi tới Gmail của tài khoản đó (có hạn 1 giờ). Kiểm tra cả mục Spam.</span>
        </p>
        <button class="btn btn--primary btn--lg auth-submit" type="submit" :disabled="busy || !email.trim()">Gửi link đặt lại mật khẩu</button>
        <button class="btn btn--link auth-back" type="button" @click="backToLogin"><TIcon name="arrow-left" />Quay lại đăng nhập</button>
      </form>

      <!-- Google: chỉ hiện ở địa chỉ Google cho phép (https + tên miền công khai, hoặc localhost) -->
      <template v-if="mode === 'login' && googleUsable">
        <div class="auth-or"><span>hoặc</span></div>
        <div ref="gBtn" class="auth-google" />
      </template>

      <p v-if="busy" class="auth-status"><TIcon name="loader-2" />Đang đăng nhập…</p>
      <!-- Chưa được mời → không có quyền truy cập -->
      <div v-if="denied" class="auth-denied">
        <span class="auth-denied__icon"><TIcon name="lock" /></span>
        <div>
          <p class="auth-denied__title">Bạn không có quyền truy cập</p>
          <p class="auth-denied__text">{{ error }}</p>
        </div>
      </div>
      <p v-else-if="error" class="auth-note auth-note--error"><TIcon name="circle-x" /><span>{{ error }}</span></p>

      <template v-if="mode === 'login'">
        <p class="auth-switch">Chưa có tài khoản? <router-link to="/dang-ky">Đăng ký</router-link></p>
        <router-link class="btn btn--link auth-back" to="/"><TIcon name="arrow-left" />Về trang giới thiệu</router-link>
        <router-link class="auth-cert" to="/cai-chung-chi"><TIcon name="lock" />Báo “không an toàn”? Cài chứng chỉ HTTPS</router-link>
      </template>
      <!-- Chỉ hiện khi máy chủ bật DEV_LOGIN (phát triển trên máy) -->
      <div v-if="devLogin" class="auth-dev">
        <span class="auth-dev__label">Đăng nhập thử (DEV_LOGIN)</span>
        <div class="auth-dev__row">
          <AppTextbox v-model="devEmail" type="email" placeholder="email@gmail.com" @keydown.enter="devSignIn" />
          <button class="btn btn--outline btn--neutral" @click="devSignIn">Vào</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TIcon      from '@mds/components/TIcon.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import { backend, loginGoogle, loginPassword, forgotPassword } from '../store/api.js'
import AppInput   from '@mds/components/AppInput.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { focusFirstField } from '@mds/utils/autofocus.js'
import { enterApp } from '../store/session.js'
import { APP_NAME } from '../store/app.js'

const route = useRoute(), router = useRouter()
const clientId = computed(() => backend.publicConfig.googleClientId)
const devLogin = computed(() => backend.publicConfig.devLogin)
/* Google chỉ chấp nhận https + tên miền có đuôi công khai (localhost được dùng http) — tên miền .local / IP thì ẩn nút */
const host = location.hostname
const googleUsable = computed(() => !!clientId.value && (host === 'localhost'
  || (location.protocol === 'https:' && !/\.(local|lan|internal|localdomain)$/i.test(host) && !/^[\d.]+$/.test(host))))
const invite   = computed(() => route.query.invite || '')
const otherUser = computed(() => (backend.user && invite.value && backend.user.email?.toLowerCase() !== String(invite.value).toLowerCase() ? backend.user.email : ''))
const gBtn = ref(null)
const busy = ref(false), error = ref(route.query.error ? String(route.query.error) : ''), devEmail = ref(invite.value)
const denied = ref(false)   // chưa được mời / bị khóa
const mode = ref('login')   // login | forgot
/* Ghi nhớ tài khoản trên máy (chỉ lưu mã nhân viên / Gmail — KHÔNG lưu mật khẩu; mật khẩu để trình duyệt tự quản lý) */
const LS_LOGIN = 'pdpoint-login-id', LS_REMEMBER = 'pdpoint-login-remember'
const lsGet = k => { try { return localStorage.getItem(k) } catch { return null } }
const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch { /* bỏ qua */ } }
const remember = ref(lsGet(LS_REMEMBER) !== '0')
const email = ref(String(route.query.invite || route.query.email || (remember.value ? lsGet(LS_LOGIN) || '' : ''))), password = ref('')
const forgotSent = ref(false)
async function signInPassword() {
  if (!email.value.trim() || !password.value) { error.value = 'Nhập mã nhân viên (hoặc Gmail) và mật khẩu'; denied.value = false; return }
  busy.value = true; error.value = ''; denied.value = false
  try {
    const u = await loginPassword(email.value.trim(), password.value, remember.value)
    lsSet(LS_REMEMBER, remember.value ? '1' : '0'); lsSet(LS_LOGIN, remember.value ? email.value.trim() : null)
    await afterLogin(u)
  }
  catch (e) { error.value = e.message; denied.value = ['not_invited', 'disabled'].includes(e.code) }
  finally { busy.value = false }
}
function toForgot() { mode.value = 'forgot'; error.value = ''; denied.value = false; forgotSent.value = false }
function backToLogin() { mode.value = 'login'; forgotSent.value = false; error.value = '' }
async function sendForgot() {
  busy.value = true; error.value = ''
  try { await forgotPassword(email.value.trim()); forgotSent.value = true }
  catch (e) { error.value = e.message }
  finally { busy.value = false }
}

async function afterLogin(u) {
  if (u.status === 'active' && u.mustChangePassword) router.replace('/doi-mat-khau')   // mật khẩu Quản trị đặt → bắt đổi
  else if (u.status === 'active') {
    const next = String(route.query.next || '/')
    if (/^\/ds(\/|$)/.test(next)) return location.assign(next)   // về trang tài liệu Design System (app riêng cùng tên miền)
    await enterApp()
    router.replace(next)
  } else router.replace('/cho-cap-quyen')
}
async function signIn(credential, email) {
  busy.value = true; error.value = ''; denied.value = false
  try { await afterLogin(await loginGoogle(credential, email, invite.value)) }
  catch (e) {
    error.value = e.message
    denied.value = ['not_invited', 'disabled'].includes(e.code)
    window.google?.accounts?.id?.disableAutoSelect?.()   // chọn nhầm tài khoản → lần sau Google hỏi lại tài khoản
  }
  finally { busy.value = false }
}
const devSignIn = () => devEmail.value && signIn(null, devEmail.value.trim())

/* Google Identity Services — nút "Đăng nhập bằng Google" chính thức */
function loadGis() {
  if (window.google?.accounts?.id) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true; s.onload = resolve; s.onerror = () => reject(new Error('Không tải được Google Sign-In'))
    document.head.appendChild(s)
  })
}
onMounted(async () => {
  focusFirstField(document.querySelector('.auth-form'))
  if (!googleUsable.value) return
  try {
    await loadGis()
    await nextTick()
    window.google.accounts.id.initialize({
      client_id: clientId.value,
      callback: r => signIn(r.credential),
      login_hint: invite.value || undefined,
      ux_mode: 'popup',
    })
    window.google.accounts.id.renderButton(gBtn.value, { theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular', locale: 'vi', width: gBtn.value?.clientWidth || 336 })
  } catch (e) { error.value = e.message }
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: var(--card-col-gap); background: var(--bg-page);
}
.auth-card {
  width: 400px; max-width: 100%;
  display: flex; flex-direction: column; gap: 16px;
  padding: 32px; border-radius: var(--radius-dialog);
  background: var(--bg-white); box-shadow: var(--shadow-card);
}
.auth-brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
.auth-switch { text-align: center; font-size: var(--text-body); color: var(--text-secondary); }
.auth-switch a { color: var(--text-brand); font-weight: var(--fw-medium); }
.auth-cert { display: inline-flex; align-items: center; justify-content: center; gap: 4px; font-size: var(--text-body); color: var(--text-secondary); text-decoration: none; }
.auth-cert:hover { color: var(--text-brand); }
.auth-brand__logo { width: 36px; height: 36px; flex-shrink: 0; }
.auth-brand__name { font-size: var(--text-h3); font-weight: var(--fw-semibold); color: var(--text-primary); }
.auth-title { font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.auth-desc { font-size: var(--text-body); color: var(--text-secondary); margin-top: -8px; }
.auth-google { min-height: 44px; display: flex; justify-content: center; }
.auth-form { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.auth-submit { width: 100%; }
.auth-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: -4px; }
.auth-remember { flex: 0 1 auto; width: auto; min-width: 0; }
.auth-forgot { margin-left: auto; padding: 0; height: auto; }
.auth-back { align-self: center; }
.auth-or { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-secondary); }
.auth-or::before, .auth-or::after { content: ''; flex: 1; height: 1px; background: var(--stroke-divider); }
.auth-denied { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: var(--radius-default); background: var(--bg-danger-light); }
.auth-denied__icon { width: 32px; height: 32px; flex-shrink: 0; border-radius: var(--radius-pill); display: inline-flex; align-items: center; justify-content: center; background: var(--bg-white); color: var(--icon-danger); font-size: 16px; }
.auth-denied__title { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-danger); }
.auth-denied__text { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.auth-status { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-secondary); }
.auth-note {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: var(--radius-default);
  font-size: var(--text-body); line-height: var(--text-body-lh);
}
.auth-note strong { font-weight: var(--fw-semibold); }
.auth-note code { font-family: var(--font-family); font-weight: var(--fw-semibold); font-size: inherit; }
.auth-note--info  { background: var(--bg-brand-light);   color: var(--text-primary); }
.auth-note--warn  { background: var(--bg-warning-light); color: var(--text-warning); }
.auth-note--error { background: var(--bg-danger-light);  color: var(--text-danger); }
.auth-dev { display: flex; flex-direction: column; gap: var(--input-label-gap); padding-top: 16px; border-top: 1px dashed var(--stroke-neutral-light); }
.auth-dev__label { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-secondary); }
.auth-dev__row { display: flex; gap: 8px; }
</style>
