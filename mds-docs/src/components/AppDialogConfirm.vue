<template>
  <!-- Hộp xác nhận của app tài liệu = Alert Dialog chuẩn mds-ui (Figma 6019:180746) -->
  <AppAlertDialog :title="title" :type="danger ? 'danger' : 'default'" :confirm-label="confirmLabel" :cancel-label="cancelLabel"
    @confirm="$emit('confirm')" @cancel="$emit('cancel')"><slot /></AppAlertDialog>
</template>

<script setup>
import AppAlertDialog from '@mds/components/AppAlertDialog.vue'

defineProps({
  title:        { type: String, default: 'Xác nhận' },
  confirmLabel: { type: String, default: 'Đồng ý' },
  cancelLabel:  { type: String, default: 'Hủy' },
  danger:       { type: Boolean, default: false },
})
defineEmits(['confirm', 'cancel'])
</script>
