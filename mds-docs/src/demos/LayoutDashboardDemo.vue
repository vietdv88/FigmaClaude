<template>
  <div class="demo-stack">
    <span class="demo-muted">Bấm <b>Tùy chỉnh</b> để kéo thả đổi vị trí widget, đổi độ rộng (1/3 · 2/3 · cả hàng), thêm biểu đồ — nút Hủy / Lưu ghim cuối trang như mọi màn hình nhập liệu.</span>
    <LayoutFrame :active="0">
      <DashboardScreen />
    </LayoutFrame>
  </div>
</template>

<script setup>
import LayoutFrame from './layout/LayoutFrame.vue'
import DashboardScreen from './layout/DashboardScreen.vue'
</script>
