<template>
  <!-- Cắt ảnh đại diện: chọn ảnh (bấm / kéo thả / dán Ctrl+V) → kéo để căn mặt, kéo thanh trượt / lăn chuột để phóng to.
       Ảnh được cắt vuông + thu nhỏ NGAY TRÊN MÁY (mặc định 256×256) → chỉ gửi ảnh nhỏ lên máy chủ. Lấy kết quả: ref.crop() -->
  <div class="avc" :class="{ 'avc--drag': dragOver }" @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="onDrop">
    <div v-if="img" ref="stage" class="avc__stage" :style="{ width: size + 'px', height: size + 'px' }"
      @pointerdown="startPan" @wheel.prevent="onWheel">
      <img :src="img.src" alt="" class="avc__img" draggable="false"
        :style="{ width: img.naturalWidth + 'px', height: img.naturalHeight + 'px', transform: `translate(-50%, -50%) translate(${ox}px, ${oy}px) scale(${scale})` }" />
      <span class="avc__mask" />
    </div>
    <button v-else type="button" class="avc__empty" :style="{ width: size + 'px', height: size + 'px' }" @click="pick">
      <TIcon name="photo-up" /><span>Chọn ảnh</span><small>hoặc kéo thả / dán ảnh (Ctrl + V)</small>
    </button>

    <div v-if="img" class="avc__zoom">
      <TIcon name="zoom-out" />
      <input v-model.number="zoom" type="range" min="1" max="4" step="0.01" aria-label="Phóng to / thu nhỏ" />
      <TIcon name="zoom-in" />
    </div>
    <div class="avc__actions">
      <button type="button" class="btn btn--outline btn--neutral btn--sm" @click="pick"><TIcon name="upload" />{{ img ? 'Chọn ảnh khác' : 'Tải ảnh lên' }}</button>
    </div>
    <span v-if="error" class="avc__error"><TIcon name="circle-x" />{{ error }}</span>
    <input ref="fileEl" type="file" accept="image/png,image/jpeg,image/webp" hidden @change="e => { use(e.target.files?.[0]); e.target.value = '' }" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import TIcon from './TIcon.vue'

const props = defineProps({
  size:     { type: Number, default: 240 },    // khung cắt (px)
  output:   { type: Number, default: 256 },    // ảnh xuất ra (px, vuông)
  maxKb:    { type: Number, default: 500 },    // ảnh xuất ra tối đa (KB) — tự giảm chất lượng cho vừa
  maxInputMb: { type: Number, default: 10 },   // ảnh chọn vào tối đa (MB) — chỉ để đọc trên máy, không gửi đi
})
const emit = defineEmits(['change'])
const fileEl = ref(null), stage = ref(null), img = ref(null), error = ref(''), dragOver = ref(false)
const zoom = ref(1), ox = ref(0), oy = ref(0)
// Tỉ lệ để ảnh PHỦ KÍN khung (cạnh ngắn = khung) × mức phóng to
const baseScale = computed(() => (img.value ? props.size / Math.min(img.value.naturalWidth, img.value.naturalHeight) : 1))
const scale = computed(() => baseScale.value * zoom.value)

const pick = () => fileEl.value?.click()
function onDrop(e) { dragOver.value = false; use([...(e.dataTransfer?.files ?? [])].find(f => f.type.startsWith('image/'))) }
function onPaste(e) { const f = [...(e.clipboardData?.items ?? [])].find(i => i.kind === 'file' && i.type.startsWith('image/'))?.getAsFile(); if (f) { e.preventDefault(); use(f) } }
onMounted(() => document.addEventListener('paste', onPaste))
onBeforeUnmount(() => document.removeEventListener('paste', onPaste))

function use(file) {
  error.value = ''
  if (!file) return
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { error.value = 'Chỉ nhận ảnh PNG, JPG hoặc WebP'; return }
  if (file.size > props.maxInputMb * 1024 * 1024) { error.value = `Ảnh quá lớn (tối đa ${props.maxInputMb} MB)`; return }
  const url = URL.createObjectURL(file), i = new Image()
  i.onload = () => { if (img.value) URL.revokeObjectURL(img.value.src); img.value = i; zoom.value = 1; ox.value = 0; oy.value = 0; emit('change') }
  i.onerror = () => { URL.revokeObjectURL(url); error.value = 'Không đọc được ảnh này' }
  i.src = url
}

/* Giữ ảnh luôn phủ kín khung: không cho kéo lộ nền */
function clamp() {
  if (!img.value) return
  const mx = Math.max(0, (img.value.naturalWidth * scale.value - props.size) / 2)
  const my = Math.max(0, (img.value.naturalHeight * scale.value - props.size) / 2)
  ox.value = Math.min(mx, Math.max(-mx, ox.value)); oy.value = Math.min(my, Math.max(-my, oy.value))
}
watch(zoom, clamp)
let pan = null
function startPan(e) {
  pan = { x: e.clientX, y: e.clientY, ox: ox.value, oy: oy.value }
  stage.value?.setPointerCapture?.(e.pointerId)
  const move = ev => { ox.value = pan.ox + ev.clientX - pan.x; oy.value = pan.oy + ev.clientY - pan.y; clamp() }
  const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); pan = null; emit('change') }
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
}
function onWheel(e) { zoom.value = Math.min(4, Math.max(1, zoom.value - e.deltaY * 0.002)) }

/** Ảnh đã cắt (data URL WebP / JPG) — null nếu chưa chọn ảnh */
function crop() {
  if (!img.value) return null
  const s = scale.value, nw = img.value.naturalWidth, nh = img.value.naturalHeight
  const sw = props.size / s, sx = nw / 2 + (-props.size / 2 - ox.value) / s, sy = nh / 2 + (-props.size / 2 - oy.value) / s
  const c = document.createElement('canvas'); c.width = c.height = props.output
  const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'
  g.fillStyle = '#fff'; g.fillRect(0, 0, props.output, props.output)
  g.drawImage(img.value, sx, sy, sw, sw, 0, 0, props.output, props.output)
  const webp = c.toDataURL('image/webp', 0.9).startsWith('data:image/webp')
  for (let q = 0.9; q >= 0.4; q -= 0.1) {
    const out = c.toDataURL(webp ? 'image/webp' : 'image/jpeg', q)
    if (out.length * 0.75 <= props.maxKb * 1024) return out
  }
  return null
}
defineExpose({ crop, hasImage: () => !!img.value })
</script>
