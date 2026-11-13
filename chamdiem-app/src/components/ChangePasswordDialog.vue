<template>
  <DialogShell title="Đổi mật khẩu" :width="440" :autofocus="true" @close="$emit('close')">
    <div ref="formEl" class="dlg-form">
      <AppInput v-if="hasPassword" label="Mật khẩu hiện tại" :required="true" :message="errors.current">
        <AppTextbox v-model="form.current" type="password" autocomplete="current-password" :state="errors.current ? 'error' : 'default'" />
      </AppInput>
      <TipField label="Mật khẩu mới" :required="true" :message="errors.next" tip="Ít nhất 8 ký tự, có cả chữ và số.">
        <AppTextbox v-model="form.next" type="password" autocomplete="new-password" :state="errors.next ? 'error' : 'default'" />
      </TipField>
      <AppInput label="Nhập lại mật khẩu mới" :required="true" :message="errors.confirm">
        <AppTextbox v-model="form.confirm" type="password" autocomplete="new-password" :state="errors.confirm ? 'error' : 'default'" />
      </AppInput>
      <p v-if="done" class="pdp-pw-msg pdp-pw-msg--ok"><TIcon name="circle-check" />Đã đổi mật khẩu.</p>
    </div>
    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">{{ done ? 'Đóng' : 'Hủy' }}</button>
      <button v-if="!done" class="btn btn--primary" :disabled="busy" @click="save">Lưu</button>
    </template>
  </DialogShell>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { focusFirstError } from '@mds/utils/fieldError.js'
import DialogShell from './DialogShell.vue'
import TipField    from './TipField.vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppInput    from '@mds/components/AppInput.vue'
import AppTextbox  from '@mds/components/AppTextbox.vue'
import { backend, changePassword } from '../store/api.js'

defineEmits(['close'])
const hasPassword = computed(() => backend.user?.hasPassword !== false)
const form = reactive({ current: '', next: '', confirm: '' })
const errors = reactive({}), busy = ref(false), done = ref(false), formEl = ref(null)

async function save() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (hasPassword.value && !form.current) errors.current = 'Nhập mật khẩu hiện tại'
  if (form.next.length < 8) errors.next = 'Mật khẩu cần ít nhất 8 ký tự'
  else if (!/[A-Za-zÀ-ỹ]/.test(form.next) || !/\d/.test(form.next)) errors.next = 'Mật khẩu cần có cả chữ và số'
  if (form.confirm !== form.next) errors.confirm = 'Mật khẩu nhập lại không khớp'
  if (Object.keys(errors).length) return focusFirstError(formEl.value)
  busy.value = true
  try { await changePassword(form.current, form.next); done.value = true; if (backend.user) backend.user.hasPassword = true }
  catch (e) { (/hiện tại/.test(e.message) ? errors.current = e.message : errors.next = e.message); focusFirstError(formEl.value) }
  finally { busy.value = false }
}
</script>

<style scoped>
.dlg-form { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.pdp-pw-msg { display: flex; align-items: center; gap: 8px; font-size: var(--text-body); }
.pdp-pw-msg--ok { color: var(--text-success); }
</style>
