<template>
  <!-- Đăng nhập (bản tài liệu CHẠY RIÊNG — tài khoản nội bộ). Gắn trong PD Point thì dùng trang đăng nhập của PD Point, không vào trang này.
       Chỉ người biên tập cần đăng nhập — ai cũng đọc được tài liệu. -->
  <div class="ds-login">
    <form class="ds-login__card surface" @submit.prevent="submit">
      <img class="ds-login__logo" :src="logoColor" alt="" width="40" height="40" />
      <h1 class="ds-login__title">Đăng nhập biên tập</h1>
      <p class="ds-login__sub">Tài liệu MISA Design System — chỉ người biên tập cần đăng nhập. Người đọc không cần tài khoản.</p>
      <div class="form-fields">
        <AppInput label="Email" required :message="err.email">
          <AppTextbox v-model="email" type="email" autocomplete="username" placeholder="ten@congty.vn" />
        </AppInput>
        <AppInput label="Mật khẩu" required :message="err.password">
          <AppTextbox v-model="password" type="password" autocomplete="current-password" placeholder="Mật khẩu" />
        </AppInput>
      </div>
      <AppInlineAlert v-if="error" type="danger">{{ error }}</AppInlineAlert>
      <button type="submit" class="btn btn--primary ds-login__btn" :class="{ 'btn--loading': busy }" :disabled="busy">
        <span v-if="busy" class="spinner spinner--sm" />Đăng nhập
      </button>
      <RouterLink to="/" class="btn btn--text ds-login__back"><TIcon name="arrow-left" />Về trang tài liệu</RouterLink>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TIcon from '@mds/components/TIcon.vue'
import AppInput from '@mds/components/AppInput.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import AppInlineAlert from '@mds/components/AppInlineAlert.vue'
import { setPageTitle } from '@mds/utils/docTitle.js'
import logoColor from '../assets/logo-ds-color.svg'
import { loadMe, state } from '../store.js'

const route = useRoute(), router = useRouter()
const email = ref(''), password = ref(''), busy = ref(false), error = ref('')
const err = reactive({ email: '', password: '' })
watch(email, v => { if (v.trim()) err.email = '' })
watch(password, v => { if (v) err.password = '' })
/* next: đường dẫn đầy đủ /ds/… (từ nút Đăng nhập) → bỏ tiền tố /ds để router (base /ds/) điều hướng */
const nextPath = () => { const n = String(route.query.next || '/ds/'); return n.startsWith('/ds') ? n.slice(3) || '/' : '/' }

async function submit() {
  err.email = email.value.trim() ? '' : 'Nhập email'
  err.password = password.value ? '' : 'Nhập mật khẩu'
  if (err.email || err.password) { nextTick(() => document.querySelector('.ds-login .input-field--error input')?.focus()); return }
  busy.value = true; error.value = ''
  try {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.value, password: password.value }) })
    const d = await res.json().catch(() => ({}))
    if (!res.ok) { error.value = d.error || 'Không đăng nhập được'; return }
    await loadMe()
    router.replace(state.me.canEdit && nextPath() === '/' ? '/quan-tri' : nextPath())
  } catch { error.value = 'Không kết nối được máy chủ' } finally { busy.value = false }
}
onMounted(() => { setPageTitle(['Đăng nhập']); if (state.me.user) router.replace(nextPath()) })
</script>

<style scoped>
.ds-login { min-height: calc(100vh - 160px); display: flex; align-items: center; justify-content: center; padding: 24px 16px; }
.ds-login__card { width: 400px; max-width: 100%; display: flex; flex-direction: column; gap: 16px; padding: var(--box-padding); }
.ds-login__logo { display: block; }
.ds-login__title { margin: 0; font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); }
.ds-login__sub { margin: -8px 0 0; color: var(--text-secondary); }
.ds-login__btn { width: 100%; }
.ds-login__back { align-self: center; }
</style>
