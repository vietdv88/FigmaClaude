<template>
  <Teleport to="body">
    <div class="modal-overlay" @mousedown.self="$emit('close')">
      <div class="modal" :class="{ 'modal--fill': fill }" :style="{ width: width + 'px' }">
        <AppFormPanel :title="title" :autofocus="autofocus" :tab-fields-only="tabFieldsOnly" @close="$emit('close')">
          <slot />
          <template #footer>
            <slot name="footer" />
          </template>
        </AppFormPanel>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useEscClose } from '@mds/utils/escStack.js'
import AppFormPanel from '@mds/components/AppFormPanel.vue'

defineProps({
  title: { type: String, default: '' },
  width: { type: Number, default: 560 },
  /** Form thêm mới → con trỏ ở ô nhập đầu tiên */
  autofocus: { type: Boolean, default: false },
  /** Tab chỉ qua ô nhập (tắt cho popup không phải form nhập liệu, VD chọn file / ảnh) */
  tabFieldsOnly: { type: Boolean, default: true },
  /** Cao cố định 90vh, phần thân là cột flex — nội dung (VD bảng xem trước) tự giãn lấp phần còn lại → chỉ 1 thanh cuộn (của bảng) */
  fill: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])
useEscClose(() => emit('close'))   // ESC đóng popup (quy chuẩn chung — lớp trên cùng)
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(16, 24, 40, 0.4);
  display: flex; align-items: center; justify-content: center;
  padding: var(--card-col-gap);
}
.modal {
  max-width: 100%; max-height: 90vh;
  display: flex; flex-direction: column;
  background: var(--bg-white);
  border-radius: var(--radius-dialog);
  box-shadow: var(--shadow-dialog);
  overflow: hidden;
}
.modal > .form-panel { flex: 1; min-height: 0; }
.modal--fill { height: 90vh; }
.modal--fill :deep(.form-body) { display: flex; flex-direction: column; }
.modal--fill :deep(.form-body) > * { flex: 1 1 auto; min-height: 0; }
</style>
