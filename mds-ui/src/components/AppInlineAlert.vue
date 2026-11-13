<!--
  AppInlineAlert — thông báo inline nằm trong luồng trang (đầu trang / đầu form), không nổi, không tự tắt.
  <AppInlineAlert type="warning" title="Sắp chốt điểm tháng 10" stacked closable @close="…">Nội dung…<template #actions>…</template></AppInlineAlert>
  type: info | warning | success | danger · icon mặc định theo type
-->
<template>
  <div class="inline-alert" :class="[`inline-alert--${type}`, { 'inline-alert--stacked': stacked }]" role="status">
    <TIcon class="inline-alert__icon" :name="icon || ICONS[type] || 'info-circle'" />
    <div class="inline-alert__body">
      <strong v-if="title" class="inline-alert__title">{{ title }}</strong>
      <span class="inline-alert__text"><slot /></span>
    </div>
    <div v-if="$slots.actions" class="inline-alert__actions"><slot name="actions" /></div>
    <button v-if="closable" type="button" class="btn-icon btn-icon--sm inline-alert__close" aria-label="Ẩn thông báo" @click="$emit('close')"><TIcon name="x" /></button>
  </div>
</template>

<script setup>
import TIcon from './TIcon.vue'

defineProps({
  /** info | warning | success | danger */
  type: { type: String, default: 'info' },
  /** Tiêu đề in đậm đứng trước nội dung (tùy chọn) */
  title: { type: String, default: '' },
  /** Tên icon Tabler — bỏ trống dùng icon theo type */
  icon: { type: String, default: '' },
  /** Hiện nút × để ẩn (phát sự kiện close — nơi dùng tự nhớ trạng thái ẩn) */
  closable: { type: Boolean, default: false },
  /** Tiêu đề 1 dòng riêng, nội dung xuống dòng dưới (Figma: Inline có tiêu đề + nội dung dài). Mặc định: tiêu đề và nội dung cùng 1 hàng */
  stacked: { type: Boolean, default: false },
})
defineEmits(['close'])

const ICONS = { info: 'info-circle', warning: 'alert-triangle', success: 'circle-check', danger: 'alert-circle' }
</script>
