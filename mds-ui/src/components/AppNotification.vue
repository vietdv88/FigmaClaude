<!--
  AppNotification — thẻ thông báo dạng Notification (Figma Thông báo › Notification): sự kiện quan trọng cần xem lại, KHÔNG tự đóng, bấm × để tắt.
  Thẻ trắng nổi (shadow-popover, bo 12) · icon trong vòng tròn màu nhạt theo loại · tiêu đề + nội dung · nút × góc phải · rộng theo nội dung, tối đa 400px.
  Dùng qua notify.success({ title, message }) + <AppNotifier /> (xếp góc phải phía trên, dưới header); đặt tĩnh trong trang thì dùng thẳng thẻ này.
  type: success | error | warning | info
-->
<template>
  <div class="notif" :class="`notif--${type}`" role="status">
    <span class="notif__ico"><TIcon :name="ICON[type] || 'info-circle'" /></span>
    <div class="notif__body">
      <strong class="notif__title">{{ title }}</strong>
      <span v-if="message || $slots.default" class="notif__msg"><slot>{{ message }}</slot></span>
      <div v-if="$slots.actions" class="notif__actions"><slot name="actions" /></div>
    </div>
    <button type="button" class="btn-icon btn-icon--sm notif__close" aria-label="Đóng thông báo" @click="$emit('close')"><TIcon name="x" /></button>
  </div>
</template>

<script setup>
import TIcon from './TIcon.vue'
defineProps({
  type: { type: String, default: 'info' },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
})
defineEmits(['close'])
const ICON = { success: 'circle-check', error: 'alert-circle', warning: 'alert-triangle', info: 'info-circle' }
</script>

<style scoped>
.notif {
  display: flex; align-items: flex-start; gap: 16px; box-sizing: border-box;
  width: fit-content; min-width: 320px; max-width: min(400px, 100%);
  padding: 16px; border-radius: var(--radius-dialog); background: var(--bg-white); box-shadow: var(--shadow-popover);
  color: var(--text-primary); font-size: var(--text-body); line-height: var(--text-body-lh);
}
.notif__ico { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; }
.notif--success .notif__ico { background: var(--bg-success-light); color: var(--icon-success); }
.notif--error   .notif__ico { background: var(--bg-danger-light);  color: var(--icon-danger); }
.notif--warning .notif__ico { background: var(--bg-warning-light); color: var(--icon-warning); }
.notif--info    .notif__ico { background: var(--bg-info-light);    color: var(--icon-info); }
.notif__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; padding-top: 1px; }
.notif__title { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); }
.notif__msg { color: var(--text-primary); }
.notif__actions { display: flex; gap: 8px; margin-top: 8px; }
.notif__close { flex-shrink: 0; color: var(--icon-neutral); margin: -4px -4px 0 0; }
</style>
