<template>
  <div class="demo-stack">
    <AppCheckbox :model-value="allState" label="Chọn tất cả quyền" @update:model-value="toggleAll" />
    <div class="demo-indent demo-stack">
      <AppCheckbox v-for="p in perms" :key="p" v-model="picked" :value="p" :label="p" />
    </div>
    <div class="demo-row">
      <AppCheckbox :model-value="true" label="Đã chọn, không sửa được" disabled />
      <AppCheckbox :model-value="false" label="Không sửa được" disabled />
      <AppCheckbox :model-value="null" label="Một phần được chọn, không sửa được" disabled />
    </div>

    <!-- Trạng thái lỗi khi required chưa được chọn — wrap AppInput để tooltip đúng quy chuẩn -->
    <div class="demo-sep"></div>
    <div ref="formEl" class="demo-stack" style="gap:12px">
      <AppInput :message="errMsg" label="Điều khoản" :vertical="true" required>
        <AppCheckbox v-model="agreed" label="Tôi đồng ý với Điều khoản sử dụng" />
      </AppInput>
      <div class="demo-row">
        <button type="button" class="btn btn--primary" @click="submit">Đăng ký</button>
        <button type="button" class="btn btn--outline btn--neutral" @click="reset">Đặt lại</button>
      </div>
      <span v-if="success" class="demo-muted" style="color:var(--text-success)">✓ Đăng ký thành công</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'
import AppInput from '@mds/components/AppInput.vue'
import { focusFirstError } from '@mds/utils/fieldError.js'

const perms = ['Xem', 'Thêm', 'Sửa', 'Xóa']
const picked = ref(['Xem', 'Sửa'])
const allState = computed(() => (picked.value.length === perms.length ? true : picked.value.length ? null : false))
const toggleAll = v => { picked.value = v ? [...perms] : [] }

const agreed = ref(false)
const submitted = ref(false)
const success = ref(false)
const formEl = ref(null)
const errMsg = computed(() => submitted.value && !agreed.value ? 'Bạn cần đồng ý với điều khoản để tiếp tục' : '')

async function submit() {
  submitted.value = true
  success.value = false
  if (!agreed.value) { await nextTick(); focusFirstError(formEl.value); return }
  success.value = true
  submitted.value = false
}
function reset() { agreed.value = false; submitted.value = false; success.value = false }
</script>

<style scoped>
.demo-sep { height: 1px; background: var(--stroke-neutral-light); margin: 4px 0; }
</style>
