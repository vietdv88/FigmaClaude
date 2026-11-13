<template>
  <!-- Chọn ảnh (logo, ảnh đại diện…): bấm chọn file · dán ảnh (Ctrl/Cmd + V) · kéo thả. Nhận SVG / PNG / WebP / JPG.
       v-model = data URL (chuỗi rỗng = chưa có ảnh). Ảnh bitmap tự thu nhỏ về tối đa `maxSize` px để nhẹ. -->
  <div class="img-up" :class="{ 'img-up--drag': dragOver }" @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="onDrop">
    <button type="button" class="img-up__box" :class="{ 'img-up__box--empty': !modelValue }" v-tip="modelValue ? 'Đổi ảnh' : 'Chọn ảnh'" :aria-label="modelValue ? 'Đổi ảnh' : 'Chọn ảnh'"
      :style="{ width: size + 'px', height: size + 'px' }" @click="pick" @paste="onPaste">
      <img v-if="modelValue" :src="modelValue" alt="" class="img-up__img" />
      <span v-else-if="placeholderText" class="img-up__initials">{{ placeholderText }}</span>
      <TIcon v-else name="photo" />
    </button>
    <div class="img-up__side">
      <div class="img-up__actions">
        <button type="button" class="btn btn--outline btn--neutral btn--sm" @click="pick"><TIcon name="upload" />{{ modelValue ? 'Đổi ảnh' : 'Tải ảnh lên' }}</button>
        <button v-if="modelValue" type="button" class="btn btn--link btn--sm img-up__remove" @click="$emit('update:modelValue', '')">Xóa</button>
      </div>
      <span class="img-up__hint">{{ hint }}</span>
      <span v-if="error" class="img-up__error"><TIcon name="circle-x" />{{ error }}</span>
    </div>
    <input ref="fileEl" type="file" accept="image/svg+xml,image/png,image/webp,image/jpeg" hidden @change="onFile" />
  </div>
</template>

<script setup>
import { vTip } from '../utils/tooltip.js'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import TIcon from './TIcon.vue'

const props = defineProps({
  modelValue:      { type: String,  default: '' },
  size:            { type: Number,  default: 64 },          // khung xem trước (px)
  maxSize:         { type: Number,  default: 256 },         // ảnh bitmap thu nhỏ về tối đa (px, cạnh dài)
  maxSvgKb:        { type: Number,  default: 150 },
  placeholderText: { type: String,  default: '' },          // chưa có ảnh → chữ cái đầu (VD mã dự án)
  hint:            { type: String,  default: 'SVG, PNG, WebP hoặc JPG — bấm chọn, kéo thả hoặc dán ảnh (Ctrl + V)' },
  pasteScope:      { type: String,  default: '.modal, [role="dialog"]' },   // dán ảnh ở bất kỳ đâu trong hộp thoại chứa control
})
const emit = defineEmits(['update:modelValue'])
const fileEl = ref(null), error = ref(''), dragOver = ref(false)
const TYPES = ['image/svg+xml', 'image/png', 'image/webp', 'image/jpeg']

const pick = () => fileEl.value?.click()
function onFile(e) { use(e.target.files?.[0]); e.target.value = '' }
function onDrop(e) { dragOver.value = false; use([...(e.dataTransfer?.files ?? [])].find(f => f.type.startsWith('image/'))) }
function imageFromClipboard(e) { return [...(e.clipboardData?.items ?? [])].find(i => i.kind === 'file' && i.type.startsWith('image/'))?.getAsFile() }
function onPaste(e) { const f = imageFromClipboard(e); if (f) { e.preventDefault(); e.stopPropagation(); use(f) } }

/* Dán ảnh khi đang ở trong cùng hộp thoại (không cần focus đúng ô ảnh) — trừ khi đang gõ trong ô nhập chữ */
let host = null
function onHostPaste(e) {
  const f = imageFromClipboard(e)
  if (!f) return
  if (e.target.closest?.('input, textarea, [contenteditable="true"]') && !e.target.closest('.img-up')) return
  e.preventDefault(); use(f)
}
onMounted(() => {
  host = (fileEl.value?.closest(props.pasteScope)) || document
  host.addEventListener('paste', onHostPaste)
})
onBeforeUnmount(() => host?.removeEventListener('paste', onHostPaste))

const readAs = (file, how) => new Promise((ok, fail) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = fail; r[how](file) })
async function use(file) {
  error.value = ''
  if (!file) return
  if (!TYPES.includes(file.type)) { error.value = 'Chỉ nhận ảnh SVG, PNG, WebP hoặc JPG'; return }
  try {
    if (file.type === 'image/svg+xml') {
      if (file.size > props.maxSvgKb * 1024) { error.value = `Ảnh SVG tối đa ${props.maxSvgKb} KB`; return }
      emit('update:modelValue', await readAs(file, 'readAsDataURL'))
      return
    }
    // Bitmap: thu nhỏ về tối đa maxSize px (giữ tỉ lệ, giữ nền trong suốt) → WebP (trình duyệt cũ: PNG)
    const url = await readAs(file, 'readAsDataURL')
    const img = await new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = url })
    const k = Math.min(1, props.maxSize / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k))
    const c = document.createElement('canvas'); c.width = w; c.height = h
    c.getContext('2d').drawImage(img, 0, 0, w, h)
    let out = c.toDataURL('image/webp', 0.9)
    if (!out.startsWith('data:image/webp')) out = c.toDataURL('image/png')
    emit('update:modelValue', out)
  } catch { error.value = 'Không đọc được ảnh này' }
}
</script>
