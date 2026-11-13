<template>
  <!-- Tự đăng ký: thông tin như form mời người dùng nhưng KHÔNG bắt buộc Gmail, KHÔNG chọn vai trò (Quản trị gán khi duyệt), có mật khẩu -->
  <div class="auth-page">
    <div class="auth-card">
      <router-link class="auth-brand" to="/">
        <img class="auth-brand__logo" src="/logo.svg" width="36" height="36" alt="" />
        <span class="auth-brand__name">{{ APP_NAME }}</span>
      </router-link>
      <h1 class="auth-title">Đăng ký tài khoản</h1>
      <p class="auth-desc">Sau khi đăng ký, Quản trị duyệt và gán vai trò, dự án cho bạn — được duyệt là đăng nhập dùng ngay.</p>

      <form ref="formEl" class="auth-form" novalidate @submit.prevent="submit">
        <div class="auth-grid">
          <AppInput label="Mã nhân viên" :required="true" :message="errors.code">
            <AppTextbox v-model="form.code" placeholder="VD: B01-0001" autocomplete="username" :state="errors.code ? 'error' : 'default'" />
          </AppInput>
          <AppInput label="Họ và tên" :required="true" :message="errors.name">
            <AppTextbox v-model="form.name" placeholder="Nguyễn Văn A" autocomplete="name" :state="errors.name ? 'error' : 'default'" />
          </AppInput>
        </div>
        <AppInput label="Email công ty" :required="true" :message="errors.companyEmail">
          <AppTextbox v-model="form.companyEmail" type="email" placeholder="ten@misa.com.vn" autocomplete="email" :state="errors.companyEmail ? 'error' : 'default'" />
        </AppInput>
        <TipField label="Gmail (không bắt buộc)" :message="errors.email" tip="Có Gmail thì đăng nhập được bằng Gmail và nhận link khi quên mật khẩu. Không có cũng được — đăng nhập bằng mã nhân viên.">
          <AppTextbox v-model="form.email" type="email" placeholder="ten@gmail.com" :state="errors.email ? 'error' : 'default'" />
        </TipField>
        <TipField label="Dự án (không bắt buộc)" tip="Chọn các dự án bạn tham gia (chọn được nhiều) — không thấy trong danh sách thì gõ tên rồi Enter để tự nhập. Quản trị dựa vào đây để phân quyền khi duyệt.">
          <AppCombobox v-model="form.projects" :options="projectOptions" multiple creatable create-label="Tự nhập dự án" tag-avatar avatar-square placeholder="Chọn hoặc gõ tên dự án" />
        </TipField>
        <div class="auth-grid">
          <AppInput label="Mật khẩu" :required="true" :message="errors.password">
            <AppTextbox v-model="form.password" type="password" placeholder="Ít nhất 8 ký tự, có chữ và số" autocomplete="new-password" :state="errors.password ? 'error' : 'default'" />
          </AppInput>
          <AppInput label="Nhập lại mật khẩu" :required="true" :message="errors.confirm">
            <AppTextbox v-model="form.confirm" type="password" autocomplete="new-password" :state="errors.confirm ? 'error' : 'default'" />
          </AppInput>
        </div>
        <p v-if="error" class="auth-note auth-note--error"><TIcon name="circle-x" /><span>{{ error }}</span></p>
        <button class="btn btn--primary btn--lg auth-submit" type="submit" :disabled="busy">{{ busy ? 'Đang gửi…' : 'Đăng ký' }}</button>
      </form>
      <p class="auth-switch">Đã có tài khoản? <router-link to="/dang-nhap">Đăng nhập</router-link></p>
      <router-link class="btn btn--link auth-back" to="/"><TIcon name="arrow-left" />Về trang giới thiệu</router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import TIcon      from '@mds/components/TIcon.vue'
import AppInput   from '@mds/components/AppInput.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import TipField   from '../components/TipField.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import { focusFirstError } from '@mds/utils/fieldError.js'
import { registerAccount, fetchPublicProjects } from '../store/api.js'
import { APP_NAME } from '../store/app.js'

const router = useRouter()
const form = reactive({ code: '', name: '', companyEmail: '', email: '', password: '', confirm: '', projects: [] })   // projects: id dự án đã chọn + tên tự nhập
const projectOptions = ref([])
fetchPublicProjects().then(r => { projectOptions.value = (r.projects ?? []).map(p => ({ value: p.id, label: p.name, description: p.code, avatar: p.logo || '' })).sort((a, b) => a.label.localeCompare(b.label, 'vi')) }).catch(() => {})
const errors = reactive({}), error = ref(''), busy = ref(false), formEl = ref(null)
const isMail = v => /^\S+@\S+\.\S+$/.test(v)

function validate() {
  for (const k of Object.keys(errors)) delete errors[k]
  if (!form.code.trim()) errors.code = 'Nhập mã nhân viên'
  else if (!/^[\w.-]{2,30}$/.test(form.code.trim())) errors.code = 'Chỉ gồm chữ, số, dấu chấm, gạch (2–30 ký tự)'
  if (!form.name.trim()) errors.name = 'Nhập họ và tên'
  if (!form.companyEmail.trim()) errors.companyEmail = 'Nhập email công ty'
  else if (!isMail(form.companyEmail.trim())) errors.companyEmail = 'Email công ty không hợp lệ'
  if (form.email.trim() && !isMail(form.email.trim())) errors.email = 'Gmail không hợp lệ'
  if (form.password.length < 8) errors.password = 'Ít nhất 8 ký tự'
  else if (!/[A-Za-zÀ-ỹ]/.test(form.password) || !/\d/.test(form.password)) errors.password = 'Cần có cả chữ và số'
  if (form.confirm !== form.password) errors.confirm = 'Mật khẩu nhập lại không khớp'
  return !Object.keys(errors).length
}
async function submit() {
  error.value = ''
  if (!validate()) return focusFirstError(formEl.value)
  busy.value = true
  try {
    const { confirm, projects, ...data } = form
    const ids = new Set(projectOptions.value.map(o => o.value))
    data.projectIds = projects.filter(v => ids.has(v)); data.projectNames = projects.filter(v => !ids.has(v))
    await registerAccount({ ...data, code: data.code.trim(), name: data.name.trim(), companyEmail: data.companyEmail.trim(), email: data.email.trim() })
    router.replace('/cho-cap-quyen')
  } catch (e) { error.value = e.message || 'Không đăng ký được' }
  finally { busy.value = false }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--card-col-gap); background: var(--bg-page); }
.auth-card { width: 520px; max-width: 100%; display: flex; flex-direction: column; gap: 16px; padding: 32px; border-radius: var(--radius-dialog); background: var(--bg-white); box-shadow: var(--shadow-card); }
@media (max-width: 560px) { .auth-card { padding: 24px 16px; } }
.auth-brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
.auth-brand__logo { width: 36px; height: 36px; flex-shrink: 0; }
.auth-brand__name { font-size: var(--text-h3); font-weight: var(--fw-semibold); color: var(--text-primary); }
.auth-title { font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.auth-desc { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); margin-top: -8px; }
.auth-form { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.auth-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--input-row-gap) var(--form-col-gap-sm); }
@media (max-width: 560px) { .auth-grid { grid-template-columns: minmax(0, 1fr); } }
.auth-submit { width: 100%; }
.auth-switch { text-align: center; font-size: var(--text-body); color: var(--text-secondary); }
.auth-switch a { color: var(--text-brand); font-weight: var(--fw-medium); }
.auth-back { align-self: center; }
.auth-note { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); font-size: var(--text-body); line-height: var(--text-body-lh); }
.auth-note--error { background: var(--bg-danger-light); color: var(--text-danger); }
</style>
