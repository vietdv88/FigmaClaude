<template>
  <!-- Avatar — Figma MDS “Avatar” (6019:6258) + “_Avatar Type Item” (6019:6149)
       Type: Image (có ảnh) · Initials (chữ cái đầu, nền theo theme) · Empty (không ảnh, không tên → hình người xám)
       Size: 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 80 · State: Default / Hover+Active (vòng 2px Stroke/Brand Light — cả Ảnh · Chữ cái · Trống)
       Badge (đúng 3 kiểu Figma): Dot — chấm đỏ góc trên (dot) + chấm xanh góc dưới (online) · Text & Icon Top — số đỏ góc trên (count) · Text & Icon Bottom — icon nền xám góc dưới (badgeIcon) -->
  <span
    class="app-avatar"
    :class="[`app-avatar--${type}`, { 'app-avatar--interactive': interactive, 'app-avatar--active': active }]"
    :style="boxStyle" :aria-label="label || undefined" :role="label ? 'img' : undefined"
  >
    <img v-if="type === 'image'" class="app-avatar__img" :src="src" :alt="name" @error="failed = true" />
    <img v-else-if="type === 'empty'" class="app-avatar__img" :src="emptyImg" alt="" />
    <span v-else class="app-avatar__initials" aria-hidden="true">{{ size <= 16 ? avatarInitials(name).slice(0, 1) : avatarInitials(name) }}</span>
    <span v-if="count" class="app-avatar__count">{{ count > 99 ? '99+' : count }}</span>
    <span v-else-if="dot" class="app-avatar__dot app-avatar__dot--top" />
    <span v-if="badgeIcon" class="app-avatar__icon"><TIcon :name="badgeIcon" /></span>
    <span v-else-if="online" class="app-avatar__dot app-avatar__dot--bottom app-avatar__dot--online" />
  </span>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import TIcon from './TIcon.vue'
import { avatarInitials, avatarColor } from '../utils/avatar.js'
import emptyImg from '../assets/avatar-empty.png'

const props = defineProps({
  name:        { type: String,  default: '' },
  src:         { type: String,  default: '' },
  size:        { type: Number,  default: 32 },     // 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 80 (Figma)
  color:       { type: String,  default: 'brand' }, // avatar chữ cái: brand (nền Brand Light Hover — theo theme) | neutral (nền Neutral Light) | auto (màu cố định theo tên — danh sách người)
  interactive: { type: Boolean, default: false },  // bấm được (mở hồ sơ, chọn người…) → hover vòng 2px Brand Light (ảnh không co)
  active:      { type: Boolean, default: false },  // đang chọn → giữ viền như hover
  dot:         { type: Boolean, default: false },  // chấm đỏ góc trên — có thông báo mới
  count:       { type: Number,  default: 0 },      // số đỏ góc trên (thay cho dot)
  online:      { type: Boolean, default: false },  // chấm xanh góc dưới
  badgeIcon:   { type: String,  default: '' },     // icon nhỏ góc dưới (VD 'camera' đổi ảnh, 'check' đã duyệt)
})

const failed = ref(false)
watch(() => props.src, () => { failed.value = false })

const type = computed(() => (props.src && !failed.value ? 'image' : props.name ? 'initials' : 'empty'))
const label = computed(() => [props.name, props.online ? 'đang trực tuyến' : '', props.count ? `${props.count} thông báo` : ''].filter(Boolean).join(' · '))

/* Cỡ chữ cái đầu theo Figma — [font-size, font-weight] · cỡ 12 / 16 chỉ đủ chỗ 1 chữ cái */
const FONT = { 12: [8, 500], 16: [8, 500], 20: [10, 500], 24: [10, 500], 32: [12, 500], 40: [12, 500], 48: [16, 500], 56: [20, 600], 80: [40, 500] }
const fontOf = size => {
  const k = Object.keys(FONT).map(Number).reduce((a, b) => (Math.abs(b - size) < Math.abs(a - size) ? b : a))
  return FONT[k]
}

/* Badge theo Figma Avatar (6019:6258) — số đo từng cỡ: [chấm, badge số / icon, lệch phải, lệch trên (số), lệch dưới (icon), cỡ chữ số, cỡ icon] */
const BADGE = {
  12: [4, 16, -4, -4, -4, 10, 10], 16: [6, 16, -4, -4, -4, 10, 10], 20: [8, 16, -4, -4, -4, 10, 10],
  24: [8, 16, -4, -8, -8, 10, 10], 32: [8, 16, -4, -4, -4, 10, 10], 40: [12, 20, -4, -4, -4, 11, 12],
  48: [12, 20, -4, -4, -4, 11, 12], 56: [16, 24, -2, -2, -2, 13, 14], 80: [20, 28, -4, -4, -4, 13, 16],
}
const badgeOf = size => BADGE[Object.keys(BADGE).map(Number).reduce((a, b) => (Math.abs(b - size) < Math.abs(a - size) ? b : a))]

const boxStyle = computed(() => {
  const [fs, fw] = fontOf(props.size)
  const [dot, bs, r, t, btm, bfs, bic] = badgeOf(props.size)
  return {
    width: props.size + 'px', height: props.size + 'px', fontSize: fs + 'px', fontWeight: fw,
    '--av-dot': dot + 'px', '--av-badge': bs + 'px', '--av-r': r + 'px', '--av-t': t + 'px', '--av-b': btm + 'px', '--av-bfs': bfs + 'px', '--av-bic': bic + 'px',
    ...(type.value === 'initials' ? { background: avatarColor(props.name, props.color).bg } : {}),   // chữ luôn Text/Primary — chỉ nền đổi theo color
  }
})
</script>
