<template>
  <!-- Tag (Figma MDS Web Components v2.0 › Tag, node 15146:127716): Tag · Tag Icon · Tag Avatar · Tag Dot · Tag Icon (chỉ icon) × X Small 20 / Small 24 / Medium 28
       × Solid / Outline (Tag Dot thêm Text) × 7 màu × Default / Hover / Pressed / Focus / Disabled (Hover–Focus chỉ khi tag bấm được: clickable) -->
  <component
    :is="clickable ? 'button' : 'span'"
    :type="clickable ? 'button' : undefined"
    class="app-tag"
    :class="[
      `app-tag--${color}`, `app-tag--${variant}`, `app-tag--${size}`,
      {
        'app-tag--dot': dot, 'app-tag--avatar': !dot && (avatar || avatarSrc), 'app-tag--icon-only': iconOnly,
        'app-tag--clickable': clickable, 'app-tag--disabled': disabled,
      },
    ]"
    :disabled="clickable && disabled ? true : undefined"
    :aria-disabled="!clickable && disabled ? 'true' : undefined"
    :aria-label="iconOnly ? (ariaLabel || label || icon) : undefined"
  >
    <span v-if="dot" class="app-tag__dot" />
    <AppAvatar v-else-if="avatar || avatarSrc" class="app-tag__avatar" :name="avatar" :src="avatarSrc" :size="size === 'md' ? 16 : 12" color="auto" />
    <TIcon v-if="icon" :name="icon" class="app-tag__icon" />
    <span v-if="label && !iconOnly" class="app-tag__label">{{ label }}</span>
    <TIcon v-if="iconRight && !iconOnly" :name="iconRight" class="app-tag__icon" />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import TIcon from './TIcon.vue'
import AppAvatar from './AppAvatar.vue'

const props = defineProps({
  /** Chữ trong tag (bỏ trống khi chỉ có icon) */
  label:     { type: String,  default: '' },
  /** Màu: neutral | brand | accent | info | warning | danger | success */
  color:     { type: String,  default: 'neutral' },
  /** Kiểu: 'outline' (mặc định — nền nhạt + viền nhạt + chữ màu) · 'solid' (nền đậm, chữ trắng) · 'text' (chỉ chấm + chữ, không nền — dùng với dot) */
  variant:   { type: String,  default: 'outline' },
  /** Cỡ: 'xs' (X Small 20) · 'sm' (Small 24 — mặc định) · 'md' (Medium 28) */
  size:      { type: String,  default: 'sm' },
  /** Chấm màu 6px bên trái (Tag Dot) — tag trạng thái */
  dot:       { type: Boolean, default: false },
  /** Icon bên trái (tên TIcon) · iconRight: icon bên phải */
  icon:      { type: String,  default: '' },
  iconRight: { type: String,  default: '' },
  /** Avatar bên trái (Tag Avatar): tên người → chữ cái đầu màu tự động, hoặc ảnh avatarSrc */
  avatar:    { type: String,  default: '' },
  avatarSrc: { type: String,  default: '' },
  /** Tag bấm được (lọc nhanh, chọn) → render <button>, có Hover / Pressed / Focus */
  clickable: { type: Boolean, default: false },
  disabled:  { type: Boolean, default: false },
  ariaLabel: { type: String,  default: '' },
})
/* Tag Icon (chỉ icon, vuông 20 / 24 / 28): có icon, không chữ */
const iconOnly = computed(() => !!props.icon && !props.label)
</script>
