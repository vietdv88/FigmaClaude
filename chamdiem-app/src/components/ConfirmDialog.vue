<template>
  <DialogShell :title="title" :width="requireText ? 520 : 440" :autofocus="!!requireText" @close="$emit('cancel')">
    <div class="confirm">
      <p v-if="message" class="confirm-msg">{{ message }}</p>
      <slot />
      <!-- Thao tác nguy hiểm: phải gõ đúng cụm chữ xác nhận mới bấm được -->
      <AppInput v-if="requireText" :label="`Nhập “${requireText}” để xác nhận`" :required="true">
        <AppTextbox v-model="typed" :placeholder="requireText" @keydown.enter="matched && $emit('confirm')" />
      </AppInput>
    </div>
    <template #footer>
      <button class="btn btn--outline btn--neutral" @click="$emit('cancel')">{{ cancelLabel }}</button>
      <button v-if="!hideConfirm" class="btn" :class="danger ? 'btn--danger' : 'btn--primary'" :disabled="!matched" @click="$emit('confirm')">{{ confirmLabel }}</button>
    </template>
  </DialogShell>
</template>

<script setup>
import { ref, computed } from 'vue'
import DialogShell from './DialogShell.vue'
import AppInput    from '@mds/components/AppInput.vue'
import AppTextbox  from '@mds/components/AppTextbox.vue'

const props = defineProps({
  title:        { type: String, default: 'Xác nhận' },
  message:      { type: String, default: '' },
  confirmLabel: { type: String, default: 'Xóa' },
  danger:       { type: Boolean, default: true },
  cancelLabel:  { type: String,  default: 'Hủy' },
  hideConfirm:  { type: Boolean, default: false },   // dùng làm hộp thông báo
  /** Cụm chữ phải gõ đúng mới cho xác nhận (VD "Chắc chắn") — dùng cho xóa hàng loạt / không khôi phục được */
  requireText:  { type: String, default: '' },
})
defineEmits(['confirm', 'cancel'])
const typed = ref('')
const norm = v => String(v ?? '').normalize('NFC').trim()
const matched = computed(() => !props.requireText || norm(typed.value) === norm(props.requireText))
</script>

<style scoped>
.confirm { display: flex; flex-direction: column; gap: var(--input-row-gap); }
.confirm-msg { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
</style>
