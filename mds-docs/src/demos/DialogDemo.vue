<template>
  <div class="demo-stack">
    <div class="demo-row">
      <button type="button" class="btn btn--outline btn--neutral" @click="show('delete')"><TIcon name="trash" />Xóa khách hàng</button>
      <button type="button" class="btn btn--outline btn--neutral" @click="show('filter')">Lưu bộ lọc (3 nút)</button>
      <button type="button" class="btn btn--outline btn--neutral" @click="show('info')">Thông báo (1 nút)</button>
    </div>
    <span class="demo-muted">Bấm để mở dialog thật. Nút xếp 1 hàng, ưu tiên từ phải sang trái: nút chính ngoài cùng bên phải · nút phụ (nếu có) · Hủy. Esc / ✕ / Hủy để đóng.</span>
    <!-- Bố cục Alert Dialog đặt tĩnh trong khung ví dụ (Figma: Type=Default · Type=Danger) -->
    <div class="demo-dialogs">
      <AppAlertDialog inline title="Lưu thay đổi bộ lọc?" message="Bộ lọc “Đơn hàng quá hạn” sẽ được cập nhật theo điều kiện bạn vừa chọn." confirm-label="Đồng ý" />
      <AppAlertDialog inline type="danger" :title="DIALOGS.delete.title" :message="DIALOGS.delete.message" confirm-label="Xóa" />
    </div>
    <AppAlertDialog v-if="cur" :title="cur.title" :message="cur.message" :type="cur.danger ? 'danger' : 'default'" :hide-cancel="!cur.cancel"
      :secondary-label="cur.secondary?.label || ''" :confirm-label="cur.primary.label"
      @cancel="cur = null" @secondary="done(cur.secondary.done)" @confirm="done(cur.primary.done)" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppAlertDialog from '@mds/components/AppAlertDialog.vue'
import { toast } from '@mds/utils/toast.js'

// Tiêu đề = câu hỏi / cụm từ ngắn về hành động · mô tả = KẾT QUẢ sau khi xác nhận (không hỏi lại “Bạn có chắc…?”)
const DIALOGS = {
  delete: { title: 'Xóa khách hàng Công ty TNHH An Phát?', message: 'Khách hàng và 12 chứng từ liên quan sẽ bị xóa vĩnh viễn, không thể khôi phục.',
    danger: true, cancel: true, primary: { label: 'Xóa', done: 'Đã xóa khách hàng Công ty TNHH An Phát' } },
  filter: { title: 'Lưu thay đổi bộ lọc “Đơn hàng quá hạn”?', message: 'Cập nhật để thay bộ lọc hiện tại, hoặc lưu thành bộ lọc mới để giữ cả bộ lọc cũ.',
    cancel: true, secondary: { label: 'Lưu thành bộ lọc mới', done: 'Đã lưu bộ lọc mới' }, primary: { label: 'Cập nhật', done: 'Đã cập nhật bộ lọc' } },
  info: { title: 'Đã hết hạn chỉnh sửa kỳ kế toán', message: 'Kỳ tháng 09/2026 đã khóa sổ ngày 05/10/2026. Liên hệ kế toán trưởng để mở khóa nếu cần sửa.',
    primary: { label: 'Đóng' } },
}
const cur = ref(null)
const show = id => { cur.value = DIALOGS[id] }
function done(msg) { cur.value = null; if (msg) toast.success(msg) }
</script>

<style scoped>
.demo-dialogs { display: flex; flex-direction: column; align-items: flex-start; gap: 24px; padding: 24px; border-radius: var(--radius-card); background: var(--bg-page); }
.demo-dialogs > * { width: 100%; }
@media (max-width: 600px) { .demo-dialogs { padding: 12px; gap: 12px; } }
</style>
