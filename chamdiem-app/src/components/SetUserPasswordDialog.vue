<template>
  <DialogShell title="Đặt mật khẩu" :width="460" :autofocus="true" @close="$emit('close')">
    <div ref="formEl" class="dlg-form">
      <p class="pdp-sp-who">
        Đặt mật khẩu mới cho <strong>{{ user.name }}</strong> ({{ user.email }}). Có hiệu lực ngay; người này bị đăng xuất khỏi mọi máy và <strong>bắt buộc tự đổi mật khẩu</strong> ở lần đăng nhập tới.
      </p>
      <TipField label="Mật khẩu mới" :required="true" :message="errors.password" tip="Ít nhất 8 ký tự, có cả chữ và số. Gửi cho người dùng qua kênh riêng (chat / gặp trực tiếp), nhắc họ tự đổi sau khi đăng nhập.">
        <AppTextbox v-model="password" :type="shown ? 'text' : 'password'" autocomplete="new-password" :state="errors.password ? 'error' : 'default'" />
      </TipField>
      <button class="btn btn--link pdp-sp-gen" type="button" @click="generate"><TIcon name="sparkles" />Tạo mật khẩu ngẫu nhiên</button>
      <div v-if="done" class="pdp-sp-done">
        <TIcon name="circle-check" />
        <span>Đã đặt mật khẩu. {{ wasInactive ? 'Tài khoản đã chuyển sang Hoạt động. ' : '' }}Gửi cho <strong>{{ user.email }}</strong>:</span>
        <div class="pdp-sp-copy">
          <AppTextbox :model-value="password" state="readonly" />
          <button class="btn btn--outline btn--neutral" type="button" @click="copy"><TIcon :name="copied ? 'check' : 'copy'" />{{ copied ? 'Đã sao chép' : 'Sao chép' }}</button>
        </div>
      </div>
      <p v-if="error" class="pdp-sp-err"><TIcon name="circle-x" />{{ error }}</p>
    </div>
    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">{{ done ? 'Đóng' : 'Hủy' }}</button>
      <button v-if="!done" class="btn btn--primary" :disabled="busy" @click="save">Đặt mật khẩu</button>
    </template>
  </DialogShell>
</template>

<script setup>
import { ref, reactive } from 'vue'
import DialogShell from './DialogShell.vue'
import TipField    from './TipField.vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppTextbox  from '@mds/components/AppTextbox.vue'
import { focusFirstError } from '@mds/utils/fieldError.js'
import { adminSetPassword } from '../store/db.js'

const props = defineProps({ user: { type: Object, required: true } })
const emit = defineEmits(['close', 'saved'])
const password = ref(''), shown = ref(false), busy = ref(false), done = ref(false), copied = ref(false), error = ref('')
const errors = reactive({}), formEl = ref(null)
const wasInactive = props.user.status !== 'active'   // ghi lại trước khi đặt (đặt xong trạng thái đổi ngay)

/* Mật khẩu ngẫu nhiên 12 ký tự: chữ hoa, chữ thường, số (bỏ ký tự dễ nhầm 0/O, 1/l/I) */
function generate() {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnpqrstuvwxyz', '23456789']
  const all = sets.join(''), rnd = n => crypto.getRandomValues(new Uint32Array(1))[0] % n
  const chars = sets.map(s => s[rnd(s.length)])
  while (chars.length < 12) chars.push(all[rnd(all.length)])
  password.value = chars.sort(() => rnd(3) - 1).join('')
  shown.value = true; delete errors.password
}
async function save() {
  delete errors.password; error.value = ''
  if (password.value.length < 8) errors.password = 'Mật khẩu cần ít nhất 8 ký tự'
  else if (!/[A-Za-zÀ-ỹ]/.test(password.value) || !/\d/.test(password.value)) errors.password = 'Mật khẩu cần có cả chữ và số'
  if (errors.password) return focusFirstError(formEl.value)
  busy.value = true
  try { await adminSetPassword(props.user.id, password.value); done.value = true; emit('saved') }
  catch (e) { error.value = e.message }
  finally { busy.value = false }
}
async function copy() {
  try { if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(password.value); else throw 0 }
  catch {   // http qua IP LAN không có clipboard API → cách cũ
    const t = document.createElement('textarea'); t.value = password.value; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove()
  }
  copied.value = true; setTimeout(() => (copied.value = false), 1500)
}
</script>

<style scoped>
.dlg-form { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.pdp-sp-who { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.pdp-sp-who strong, .pdp-sp-done strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
.pdp-sp-gen { align-self: flex-start; margin-top: -8px; }
.pdp-sp-done { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-default); background: var(--bg-success-light, var(--bg-brand-light)); font-size: var(--text-body); color: var(--text-primary); }
.pdp-sp-done > .ti { color: var(--icon-success); }
.pdp-sp-copy { display: flex; gap: 8px; width: 100%; }
.pdp-sp-copy > :first-child { flex: 1; }
.pdp-sp-err { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); color: var(--text-danger); }
</style>
