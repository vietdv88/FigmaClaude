<template>
  <DialogShell :title="result.purpose === 'reset' ? 'Đặt lại mật khẩu' : 'Lời mời'" :width="520" @close="$emit('close')">
    <div class="inv">
      <p v-if="result.sent" class="inv__msg inv__msg--ok">
        <TIcon name="circle-check" />
        <span>Đã gửi email {{ result.purpose === 'reset' ? 'đặt lại mật khẩu' : 'mời' }} tới <strong>{{ user.email }}</strong>. Người nhận bấm link trong email để đặt mật khẩu rồi vào app.</span>
      </p>
      <template v-else>
        <p class="inv__msg inv__msg--warn">
          <TIcon name="info-circle" />
          <span v-if="result.demo">Bản demo chưa gửi được email thật.</span>
          <span v-else-if="result.mailError">Gửi email thất bại: {{ result.mailError }}</span>
          <span v-else>Máy chủ chưa cấu hình gửi email nên chưa tự gửi.</span>
          <span>Gửi link dưới đây cho <strong>{{ user.email }}</strong> qua chat / email — họ mở link để đặt mật khẩu (link dùng 1 lần).</span>
        </p>
        <div class="inv__link">
          <AppTextbox :model-value="result.link" state="readonly" />
          <button class="btn btn--outline btn--neutral" @click="copy"><TIcon :name="copied ? 'check' : 'copy'" />{{ copied ? 'Đã sao chép' : 'Sao chép' }}</button>
        </div>
      </template>
      <p class="inv__hint">
        <template v-if="result.purpose === 'reset'">Link có hạn <strong>1 giờ</strong>. Mật khẩu cũ vẫn dùng được cho tới khi người dùng đặt mật khẩu mới.</template>
        <template v-else>Link có hạn <strong>7 ngày</strong>. Trạng thái chuyển sang <strong>Đã mời</strong>; đặt mật khẩu xong sẽ thành <strong>Hoạt động</strong>.</template>
      </p>
    </div>
    <template #footer>
      <button class="btn btn--primary" @click="$emit('close')">Đóng</button>
    </template>
  </DialogShell>
</template>

<script setup>
import { ref } from 'vue'
import DialogShell from './DialogShell.vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppTextbox  from '@mds/components/AppTextbox.vue'

const props = defineProps({ result: { type: Object, required: true }, user: { type: Object, required: true } })
defineEmits(['close'])
const copied = ref(false)
async function copy() {
  // navigator.clipboard chỉ có ở https / localhost → mở qua IP LAN dùng cách cũ (execCommand)
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(props.result.link)
    else { const t = document.createElement('textarea'); t.value = props.result.link; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove() }
    copied.value = true; setTimeout(() => { copied.value = false }, 2000)
  } catch { /* trình duyệt chặn clipboard */ }
}
</script>

<style scoped>
.inv { display: flex; flex-direction: column; gap: 12px; }
.inv__msg { /* box thấp 1–2 dòng → icon căn giữa dọc (skill: Box / card thấp) */ display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px 12px; border-radius: var(--radius-default); font-size: var(--text-body); line-height: var(--text-body-lh); }
.inv__msg strong { font-weight: var(--fw-semibold); }
.inv__msg--ok   { background: var(--bg-success-light); color: var(--text-primary); }
.inv__msg--warn { background: var(--bg-warning-light); color: var(--text-primary); }
.inv__link { display: flex; gap: 8px; }
.inv__link > :first-child { flex: 1; min-width: 0; }
.inv__hint { font-size: var(--text-body); color: var(--text-secondary); }
.inv__hint strong { color: var(--text-primary); font-weight: var(--fw-semibold); }
</style>
