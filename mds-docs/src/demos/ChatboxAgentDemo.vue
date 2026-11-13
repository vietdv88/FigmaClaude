<template>
  <!-- Cửa sổ chat AI Agent (quy chuẩn /ds/chatbox-ai-agent): bấm avatar agent trên header → panel chat bên phải, đẩy app sang trái (không che).
       Logo AMIS Chat trên header mở box chat ở CHÍNH vị trí này. Kéo cạnh trái panel để đổi rộng (350px → 50% màn hình); app < 1024px → cuộn ngang. -->
  <div class="demo-stack">
    <span class="demo-muted">Bấm avatar agent / biểu tượng AMIS Chat trên header để mở · đóng · chuyển panel. Rê chuột vào cạnh trái panel rồi kéo để đổi độ rộng; gõ câu hỏi hoặc bấm gợi ý để xem hiệu ứng trả lời.</span>
    <SidePanelFrame initial="agent" />
  </div>
</template>

<script setup>
import SidePanelFrame from './layout/SidePanelFrame.vue'
</script>
