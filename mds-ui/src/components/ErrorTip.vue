<template>
  <!-- Tooltip lỗi: nền đỏ chữ trắng, nổi phía dưới control (không chiếm chỗ trong form) -->
  <Teleport to="body">
    <div v-if="open && message" class="error-tip" :class="`error-tip--${side}`" :style="pos" role="alert">{{ message }}</div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  open:    { type: Boolean, default: false },
  message: { type: String,  default: '' },
  anchor:  { type: Object,  default: null },   // element control để canh vị trí
})

const pos = ref({})
const side = ref('bottom')
const MAX_W = 320

function place() {
  const el = props.anchor
  if (!el) return
  const r = el.getBoundingClientRect()
  const left = Math.min(Math.max(8, r.left), window.innerWidth - Math.min(MAX_W, r.width + 120) - 8)
  // Mặc định phía dưới ô; sát mép dưới màn hình thì lật lên trên
  if (window.innerHeight - r.bottom > 48) { side.value = 'bottom'; pos.value = { left: left + 'px', top: r.bottom + 6 + 'px', maxWidth: MAX_W + 'px' } }
  else                                    { side.value = 'top';    pos.value = { left: left + 'px', bottom: window.innerHeight - r.top + 6 + 'px', maxWidth: MAX_W + 'px' } }
}

function listen(on) {
  const fn = on ? 'addEventListener' : 'removeEventListener'
  window[fn]('scroll', place, true)
  window[fn]('resize', place)
}
watch(() => props.open && !!props.message, v => { if (v) place(); listen(v) }, { immediate: true })
onBeforeUnmount(() => listen(false))
</script>

<style scoped>
.error-tip {
  position: fixed; z-index: 9700;
  padding: 6px 10px; border-radius: var(--radius-default);
  background: var(--bg-danger); color: var(--text-white);
  font-family: var(--font-family); font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-medium);
  box-shadow: var(--shadow-popover);
  pointer-events: none;
  animation: error-tip-in 0.12s ease;
}
/* Mũi nhọn chỉ vào ô */
.error-tip::after {
  content: ''; position: absolute; left: 14px;
  border: 5px solid transparent;
}
.error-tip--top::after    { top: 100%;    border-top-color: var(--bg-danger); }
.error-tip--bottom::after { bottom: 100%; border-bottom-color: var(--bg-danger); }
@keyframes error-tip-in { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; } }
</style>
