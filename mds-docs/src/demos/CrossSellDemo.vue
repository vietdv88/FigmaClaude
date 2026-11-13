<template>
  <div class="demo-stack">
    <span class="demo-muted">Thanh <b>Tiện ích</b> luôn nằm trên cùng màn Tổng quan, phía trên các chỉ số và biểu đồ. Thu nhỏ cửa sổ → mục không đủ chỗ tự ẩn vào <b>Xem thêm</b>; bấm để mở rộng (trượt xuống, đẩy nội dung bên dưới), <b>Thu gọn</b> để về như lúc mới vào.</span>
    <LayoutFrame :active="0">
      <DashboardScreen>
        <template #top>
          <AppCrossSell :items="ITEMS" @select="it => toast.info(`Mở ${it.label}`)" />
        </template>
      </DashboardScreen>
    </LayoutFrame>
  </div>
</template>

<script setup>
import LayoutFrame from './layout/LayoutFrame.vue'
import DashboardScreen from './layout/DashboardScreen.vue'
import AppCrossSell from '@mds/components/AppCrossSell.vue'
import { toast } from '@mds/utils/toast.js'

/* Mục liên kết: icon outline trên nền nhạt cùng tông (màu nhận diện từng mục, theo token) */
const ITEMS = [
  { id: 'community', label: 'Cộng đồng MISA', icon: 'users', tone: 'brand' },
  { id: 'loan', label: 'Kết nối vay vốn', icon: 'cash', tone: 'success' },
  { id: 'insurance', label: 'Kết nối bảo hiểm', icon: 'shield-check', tone: 'info' },
  { id: 'mobile', label: 'Ứng dụng Mobile', icon: 'device-mobile', tone: 'pink' },
  { id: 'knowledge', label: 'Kiến thức hữu ích', icon: 'bulb', tone: 'warning' },
  { id: 'cart', label: 'Giỏ hàng', icon: 'shopping-cart', tone: 'purple' },
  { id: 'einvoice', label: 'Hóa đơn điện tử', icon: 'file-invoice', tone: 'brand' },
  { id: 'ebank', label: 'Ngân hàng điện tử', icon: 'building-bank', tone: 'success' },
  { id: 'esign', label: 'Chữ ký số', icon: 'signature', tone: 'purple' },
  { id: 'fb', label: 'Cộng đồng kế toán MISA', icon: 'brand-facebook', tone: 'info' },
]
</script>
