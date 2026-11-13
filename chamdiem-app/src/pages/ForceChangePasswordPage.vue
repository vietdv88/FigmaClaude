<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <img class="auth-brand__logo" src="/logo.svg" width="36" height="36" alt="" />
        <span class="auth-brand__name">{{ APP_NAME }}</span>
      </div>
      <h1 class="auth-title">Đổi mật khẩu</h1>
      <p class="auth-desc">
        Mật khẩu của <strong>{{ backend.user?.email }}</strong> do Quản trị đặt. Để bảo mật, bạn cần <strong>đặt mật khẩu của riêng mình</strong> trước khi vào ứng dụng.
      </p>
      <form ref="formEl" class="auth-form" @submit.prevent="submit">
        <AppInput label="Mật khẩu hiện tại" :required="true" :message="errors.current">
          <AppTextbox v-model="current" type="password" autocomplete="current-password" placeholder="Mật khẩu Quản trị gửi cho bạn" :state="errors.current ? 'error' : 'default'" />
        </AppInput>
        <TipField label="Mật khẩu mới" :required="true" :message="errors.next" tip="Ít nhất 8 ký tự, có cả chữ và số, khác mật khẩu hiện tại.">
          <AppTextbox v-model="next" type="password" autocomplete="new-password" placeholder="Nhập mật khẩu mới" :state="errors.next ? 'error' : 'default'" />
        </TipField>
        <AppInput label="Nhập lại mật khẩu mới" :required="true" :message="errors.confirm">
          <AppTextbox v-model="confirm" type="password" autocomplete="new-password" placeholder="Nhập lại mật khẩu mới" :state="errors.confirm ? 'error' : 'default'" />
        </AppInput>
        <p v-if="error" class="auth-note auth-note--error"><TIcon name="circle-x" /><span>{{ error }}</span></p>
        <button class="btn btn--primary btn--lg auth-submit" type="submit" :disabled="busy">Đổi mật khẩu & vào ứng dụng</button>
        <button class="btn btn--link auth-back" type="button" tabindex="-1" @click="doLogout"><TIcon name="logout" />Đăng xuất</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TIcon      from '@mds/components/TIcon.vue'
import AppInput   from '@mds/components/AppInput.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import TipField   from '../components/TipField.vue'
import { backend, changePassword } from '../store/api.js'
import { enterApp, signOut } from '../store/session.js'
import { APP_NAME } from '../store/app.js'
import { focusFirstField } from '@mds/utils/autofocus.js'

/* Bắt buộc đổi mật khẩu sau khi Quản trị đặt / đặt lại — không vào được app cho tới khi đổi xong */
const router = useRouter()
const current = ref(''), next = ref(''), confirm = ref(''), busy = ref(false), error = ref('')
const errors = reactive({}), formEl = ref(null)
onMounted(() => focusFirstField(formEl.value))

async function submit() {
  Object.keys(errors).forEach(k => delete errors[k]); error.value = ''
  if (!current.value) errors.current = 'Nhập mật khẩu hiện tại'
  if (next.value.length < 8) errors.next = 'Mật khẩu cần ít nhất 8 ký tự'
  else if (!/[A-Za-zÀ-ỹ]/.test(next.value) || !/\d/.test(next.value)) errors.next = 'Mật khẩu cần có cả chữ và số'
  else if (next.value === current.value) errors.next = 'Mật khẩu mới phải khác mật khẩu hiện tại'
  if (confirm.value !== next.value) errors.confirm = 'Mật khẩu nhập lại không khớp'
  if (Object.keys(errors).length) return
  busy.value = true
  try {
    await changePassword(current.value, next.value)
    backend.user = { ...backend.user, mustChangePassword: false, hasPassword: true }
    await enterApp()
    router.replace('/')
  } catch (e) {
    if (/hiện tại/.test(e.message)) errors.current = e.message; else error.value = e.message
  } finally { busy.value = false }
}
async function doLogout() { await signOut(); router.replace('/dang-nhap') }
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--card-col-gap); background: var(--bg-page); }
.auth-card { width: 400px; max-width: 100%; display: flex; flex-direction: column; gap: 16px; padding: 32px; border-radius: var(--radius-dialog); background: var(--bg-white); box-shadow: var(--shadow-card); }
.auth-brand { display: flex; align-items: center; gap: 8px; }
.auth-brand__logo { width: 36px; height: 36px; flex-shrink: 0; }
.auth-brand__name { font-size: var(--text-h3); font-weight: var(--fw-semibold); color: var(--text-primary); }
.auth-title { font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.auth-desc { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.auth-desc strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.auth-form { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.auth-submit { width: 100%; }
.auth-back { align-self: center; }
.auth-note { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); font-size: var(--text-body); line-height: var(--text-body-lh); }
.auth-note--error { background: var(--bg-danger-light); color: var(--text-danger); }
</style>
