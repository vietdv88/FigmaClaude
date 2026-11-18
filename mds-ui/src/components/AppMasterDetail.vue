<template>
  <!-- AppMasterDetail — các dạng danh sách Master-Detail của /ds/layout, đặt trong <AppPage>:
       'wide'   = Master trái rộng (bảng nhiều cột) · Detail phải nhỏ (tóm tắt dòng đang chọn, 300px)
       'narrow' = Master trái nhỏ (tên / mã / trạng thái, 280px) · Detail phải rộng (làm việc sâu với bản ghi)
       'bottom' = Master trên · Detail dưới (tab chi tiết dòng đang chọn)
       Dạng drawer (đè bên phải, vẫn bấm được dòng) → dùng <AppDrawer> trong AppPage.
       Hai vùng là card (.surface / .table-panel) cách nhau 16 (--card-col-gap); dòng đang xem đánh dấu bằng _mark: 'current' của DataTable. -->
  <div class="app-md" :class="`app-md--${layout}`">
    <div class="app-md__master" :style="layout === 'narrow' && masterWidth ? { width: masterWidth + 'px' } : null"><slot name="master" /></div>
    <div class="app-md__detail" :style="layout === 'wide' && detailWidth ? { width: detailWidth + 'px' } : null"><slot name="detail" /></div>
  </div>
</template>

<script setup>
defineProps({
  layout:      { type: String, default: 'wide' },   // wide | narrow | bottom
  masterWidth: { type: Number, default: null },     // narrow: mặc định 280
  detailWidth: { type: Number, default: null },     // wide: mặc định 300
})
</script>
