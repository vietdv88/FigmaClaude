<!-- Nhắc chốt điểm — đầu trang Tổng quan, chỉ hiện từ ngày 28 đến mùng 5 tháng sau. Ẩn (×) thì nhớ theo kỳ chốt, kỳ sau hiện lại -->
<template>
  <AppInlineAlert v-if="period && !hidden" type="warning" :title="`Sắp chốt điểm tháng ${period.label}`" closable @close="hide">
    Từ ngày 1–5 hàng tháng các quản lý sẽ chốt điểm, nên mọi người cần cập nhật <strong>Ngày hoàn thành</strong> để tránh điểm không được ghi nhận.
  </AppInlineAlert>
</template>

<script setup>
import { computed, ref } from 'vue'
import AppInlineAlert from '@mds/components/AppInlineAlert.vue'

// Kỳ đang chốt: 28–31 → tháng này · 1–5 → tháng trước · ngày khác → không hiện
function closingPeriod(now = new Date()) {
  const d = now.getDate()
  if (d >= 6 && d < 28) return null
  const m = new Date(now.getFullYear(), now.getMonth() - (d <= 5 ? 1 : 0), 1)
  return { key: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`, label: `${m.getMonth() + 1}/${m.getFullYear()}` }
}

const period = computed(() => closingPeriod())
const storeKey = () => `chamdiem-closing-reminder-${period.value?.key}`
const hidden = ref((() => { try { return !!localStorage.getItem(storeKey()) } catch { return false } })())
function hide() {
  hidden.value = true
  try { localStorage.setItem(storeKey(), '1') } catch { /* chặn lưu trữ → chỉ ẩn lần này */ }
}
</script>
