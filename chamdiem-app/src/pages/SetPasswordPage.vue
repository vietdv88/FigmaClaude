<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <img class="auth-brand__logo" src="/logo.svg" width="36" height="36" alt="" />
        <span class="auth-brand__name">{{ APP_NAME }}</span>
      </div>
      <h1 class="auth-title">{{ info?.purpose === 'reset' ? 'Đặt lại mật khẩu' : 'Đặt mật khẩu' }}</h1>

      <p v-if="loading" class="auth-status"><TIcon name="loader-2" />Đang kiểm tra link…</p>

      <!-- Link hết hạn / đã dùng -->
      <template v-else-if="!info">
        <p class="auth-note auth-note--error"><TIcon name="circle-x" /><span>{{ error }}</span></p>
        <button class="btn btn--outline btn--neutral" @click="router.replace('/dang-nhap')"><TIcon name="arrow-left" />Về trang đăng nhập</button>
      </template>

      <form v-else class="auth-form" @submit.prevent="submit">
        <p class="auth-desc">
          {{ info.purpose === 'reset' ? 'Đặt mật khẩu mới cho' : `Chào ${info.name || ''}, đặt mật khẩu để vào ứng dụng với` }}
          tài khoản <strong>{{ info.email }}</strong>. Lần sau đăng nhập bằng Gmail này và mật khẩu vừa đặt.
        </p>
        <TipField label="Mật khẩu mới" :required="true" :message="errors.password" :tip="`Ít nhất ${info.minLength} ký tự, có cả chữ và số.`">
          <AppTextbox v-model="password" type="password" autocomplete="new-password" placeholder="Nhập mật khẩu" :state="errors.password ? 'error' : 'default'" />
        </TipField>
        <AppInput label="Nhập lại mật khẩu" :required="true" :message="errors.confirm">
          <AppTextbox v-model="confirm" type="password" autocomplete="new-password" placeholder="Nhập lại mật khẩu" :state="errors.confirm ? 'error' : 'default'" />
        </AppInput>
        <p v-if="error" class="auth-note auth-note--error"><TIcon name="circle-x" /><span>{{ error }}</span></p>
        <button class="btn btn--primary btn--lg auth-submit" type="submit" :disabled="busy">
          {{ info.purpose === 'reset' ? 'Lưu mật khẩu & đăng nhập' : 'Đặt mật khẩu & vào ứng dụng' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TIcon      from '@mds/components/TIcon.vue'
import AppInput   from '@mds/components/AppInput.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import TipField   from '../components/TipField.vue'
import { getSetupInfo, setupPassword } from '../store/api.js'
import { enterApp } from '../store/session.js'
import { APP_NAME } from '../store/app.js'
import { focusFirstField } from '@mds/utils/autofocus.js'

/* Mở từ link trong email mời / quên mật khẩu: /dat-mat-khau?token=… → đặt mật khẩu → vào app luôn */
const route = useRoute(), router = useRouter()
const token = String(route.query.token || '')
const info = ref(null), loading = ref(true), busy = ref(false), error = ref('')
const password = ref(''), confirm = ref('')
const errors = reactive({})

onMounted(async () => {
  try { info.value = await getSetupInfo(token) }
  catch (e) { error.value = e.message }
  finally { loading.value = false }
  if (info.value) focusFirstField(document.querySelector('.auth-form'))
})

async function submit() {
  Object.keys(errors).forEach(k => delete errors[k]); error.value = ''
  const min = info.value.minLength
  if (password.value.length < min) errors.password = `Mật khẩu cần ít nhất ${min} ký tự`
  else if (!/[A-Za-zÀ-ỹ]/.test(password.value) || !/\d/.test(password.value)) errors.password = 'Mật khẩu cần có cả chữ và số'
  if (confirm.value !== password.value) errors.confirm = 'Mật khẩu nhập lại không khớp'
  if (Object.keys(errors).length) return
  busy.value = true
  try {
    await setupPassword(token, password.value)
    await enterApp()
    router.replace('/')
  } catch (e) { error.value = e.message }
  finally { busy.value = false }
}
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
.auth-status { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-secondary); }
.auth-note { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); font-size: var(--text-body); line-height: var(--text-body-lh); }
.auth-note--error { background: var(--bg-danger-light); color: var(--text-danger); }
</style>
