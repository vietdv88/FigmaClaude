<!--
  AppGlobalAlert — thông báo Global Inline (Figma Thông báo › Global Inline): dải thông báo toàn app, nằm TRÊN CÙNG, phía trên thanh header
  (hết hạn dùng thử, sắp bảo trì, chậm / treo hệ thống…). Có thể có nút × hoặc không tùy trường hợp.
  <AppGlobalAlert type="warning" title="Sắp bảo trì" action-label="Chi tiết" closable @action="…" @close="…">Hệ thống bảo trì lúc 22:00 hôm nay.</AppGlobalAlert>
  type: info | warning | danger | success | neutral · variant: solid (nền màu đặc, chữ trắng — mặc định) | light (nền nhạt, chữ + nút theo màu)
-->
<template>
  <div class="gal" :class="[`gal--${type}`, `gal--${variant}`]" role="status">
    <TIcon class="gal__icon" :name="icon || ICON[type]" />
    <span class="gal__text"><strong v-if="title" class="gal__title">{{ title }}</strong><slot /></span>
    <button v-if="actionLabel" type="button" class="btn btn--sm gal__action" :class="actionClass" @click="$emit('action')">{{ actionLabel }}</button>
    <button v-if="closable" type="button" class="btn-icon btn-icon--sm gal__close" aria-label="Đóng thông báo" @click="$emit('close')"><TIcon name="x" /></button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TIcon from './TIcon.vue'
const props = defineProps({
  type: { type: String, default: 'info' },
  variant: { type: String, default: 'solid' },
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
  /** Nhãn nút thao tác (bỏ trống = không có nút) */
  actionLabel: { type: String, default: '' },
  closable: { type: Boolean, default: false },
})
defineEmits(['action', 'close'])
const ICON = { info: 'info-circle', warning: 'alert-triangle', danger: 'alert-circle', success: 'circle-check', neutral: 'circle' }
// Nút thao tác: nền đặc → nút trắng; nền nhạt → nút đặc cùng màu loại (neutral = đen)
const actionClass = computed(() => (props.variant === 'solid' ? 'btn--white' : `btn--${props.type === 'neutral' ? 'black' : props.type}`))
</script>

<style scoped>
.gal { display: flex; align-items: center; gap: 8px; box-sizing: border-box; width: 100%; min-height: 36px; padding: 4px 16px; font-size: var(--text-body); line-height: var(--text-body-lh); }
.gal__icon { font-size: 18px; flex-shrink: 0; }
.gal__text { flex: 1; min-width: 0; }
.gal__title { font-weight: var(--fw-semibold); margin-right: 8px; }
.gal__action { flex-shrink: 0; }
.gal__close { flex-shrink: 0; }
/* Nền đặc: chữ + icon trắng */
.gal--solid { color: var(--text-white); }
.gal--solid .gal__icon, .gal--solid .gal__close { color: var(--icon-white); }
.gal--solid .gal__close:hover { background: var(--alpha-white-200); }
.gal--solid.gal--info { background: var(--bg-info); }
.gal--solid.gal--warning { background: var(--bg-warning); }
.gal--solid.gal--danger { background: var(--bg-danger); }
.gal--solid.gal--success { background: var(--bg-success); }
.gal--solid.gal--neutral { background: var(--bg-black); }
/* Nền nhạt: chữ thường, tiêu đề + icon theo màu loại, nút × neutral */
.gal--light { color: var(--text-primary); }
.gal--light .gal__close { color: var(--icon-neutral); }
.gal--light.gal--info { background: var(--bg-info-light); } .gal--light.gal--info .gal__icon, .gal--light.gal--info .gal__title { color: var(--text-info); }
.gal--light.gal--warning { background: var(--bg-warning-light); } .gal--light.gal--warning .gal__icon, .gal--light.gal--warning .gal__title { color: var(--text-warning); }
.gal--light.gal--danger { background: var(--bg-danger-light); } .gal--light.gal--danger .gal__icon, .gal--light.gal--danger .gal__title { color: var(--text-danger); }
.gal--light.gal--success { background: var(--bg-success-light); } .gal--light.gal--success .gal__icon, .gal--light.gal--success .gal__title { color: var(--text-success); }
.gal--light.gal--neutral { background: var(--bg-neutral-light); } .gal--light.gal--neutral .gal__icon, .gal--light.gal--neutral .gal__title { color: var(--text-primary); }
</style>
