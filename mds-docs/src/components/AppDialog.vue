<template>
  <Teleport to="body">
    <div class="ds-modal-overlay" @mousedown.self="$emit('close')">
      <div class="ds-modal" :class="{ 'ds-modal--fill': fill }" :style="{ width: width + 'px' }">
        <AppFormPanel :title="title" :tab-fields-only="false" @close="$emit('close')">
          <slot />
          <template #footer><slot name="footer" /></template>
        </AppFormPanel>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import AppFormPanel from '@mds/components/AppFormPanel.vue'
import { useEscClose } from '@mds/utils/escStack.js'

/* Khung popup chung của app tài liệu (overlay + AppFormPanel của mds-ui, ESC đóng) */
defineProps({
  title: { type: String, default: '' },
  width: { type: Number, default: 560 },
  /** Cao cố định 90vh — thân là cột flex, nội dung tự cuộn */
  fill: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])
useEscClose(() => emit('close'))
</script>

<style scoped>
.ds-modal-overlay {
  position: fixed; inset: 0; z-index: var(--z-dialog, 1000);
  background: var(--bg-overlay);
  display: flex; align-items: center; justify-content: center;
  padding: var(--card-col-gap, 16px);
}
.ds-modal {
  max-width: 100%; max-height: 90vh;
  display: flex; flex-direction: column;
  background: var(--bg-white);
  border-radius: var(--radius-dialog);
  box-shadow: var(--shadow-dialog);
  overflow: hidden;
}
.ds-modal > .form-panel { flex: 1; min-height: 0; }
.ds-modal--fill { height: 90vh; }
.ds-modal--fill :deep(.form-body) { display: flex; flex-direction: column; }
.ds-modal--fill :deep(.form-body) > * { flex: 1 1 auto; min-height: 0; }
</style>
