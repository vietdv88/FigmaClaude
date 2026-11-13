<!--
  Border Beam — control dùng chung cho mọi chức năng "AI có điểm nhấn" (kỹ thuật gốc
  magicui.design/docs/components/border-beam): giữ nguyên viền xám mặc định của nút
  (do class .btn-icon--outline/.btn--outline quy định), bên trong có 1 đốm gradient
  chạy dọc viền đó (offset-path), tốc độ chậm-nhanh-chậm (ease-in-out, không đều),
  icon bên trong phập phồng nhẹ theo cùng nhịp. Dùng đúng 2 mã AI Gradient
  (#1482ff → #cf11ff) đã định nghĩa ở .btn--ai-outline — không dùng preset màu xấp xỉ
  của thư viện ngoài (đã thử @stevebauman/vue-border-beam nhưng không tuỳ biến được màu/tốc độ).

  Cách dùng (kéo ra là chạy, không cần setup gì thêm):
    <BorderBeamButton class="btn-icon btn-icon--outline" title="..." @click="...">
      <TIcon name="sparkles" />
    </BorderBeamButton>
-->
<template>
  <button class="btn--border-beam" v-bind="$attrs">
    <slot />
    <span class="border-beam-mask"><span class="border-beam"></span></span>
  </button>
</template>

<script setup>
import { onMounted } from 'vue'
import { ensureAiGradient } from '../utils/aiGradient.js'

defineOptions({ inheritAttrs: false })

// Gradient AI cho icon: inject 1 lần (dùng chung với mục menu AI)
onMounted(ensureAiGradient)
</script>
