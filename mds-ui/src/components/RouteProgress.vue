<template>
  <!-- Thanh tiến trình mảnh trên cùng khi chuyển trang (quy chuẩn) — đặt 1 lần ở App.vue -->
  <div v-if="phase" class="route-progress" :class="`route-progress--${phase}`" role="progressbar" aria-label="Đang tải trang">
    <div class="route-progress__bar" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { routeProgress } from '../utils/routeProgress.js'

/* phase: '' (ẩn) → 'run' (chạy dần tới ~85%) → 'done' (chạy nốt 100% rồi mờ dần) */
const phase = ref('')
let hideTimer = null
watch(() => routeProgress.active, on => {
  clearTimeout(hideTimer)
  if (on) phase.value = 'run'
  else if (phase.value) { phase.value = 'done'; hideTimer = setTimeout(() => { phase.value = '' }, 350) }
})
</script>
