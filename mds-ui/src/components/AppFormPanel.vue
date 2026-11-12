<template>
  <div :class="['form-panel', { 'form-panel--maximized': maximizable && maximized }]">
    <!-- Header -->
    <div class="form-header" :class="{ 'form-header--divider': divider }">
      <span class="form-header__title">
        <slot name="title">{{ title }}</slot>
      </span>
      <slot name="header-end">
        <button v-if="maximizable" type="button" class="btn-icon" :aria-label="maximized ? 'Thu nhỏ' : 'Phóng to'" :title="maximized ? 'Thu nhỏ' : 'Phóng to'" @click="maximized = !maximized">
          <TIcon :name="maximized ? 'minimize' : 'maximize'" />
        </button>
        <button v-if="closable" class="btn-icon" aria-label="Đóng (Esc)" @click="$emit('close')">
          <TIcon name="x" />
        </button>
      </slot>
    </div>

    <!-- Toolbar slot — for tabs, toolbars, sub-headers (rendered outside form-body) -->
    <slot name="toolbar" />

    <!-- Body -->
    <div ref="bodyEl" class="form-body">
      <slot />
    </div>

    <!-- Footer (only rendered if slot is provided) -->
    <div v-if="$slots.footer" class="form-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import TIcon from './TIcon.vue'
import { focusFirstField, fieldsOnlyTab } from '../utils/autofocus.js'

const props = defineProps({
  title:     { type: String,  default: '' },
  divider:   { type: Boolean, default: false },   // quy chuẩn popup: header KHÔNG có gạch dưới
  closable:  { type: Boolean, default: true },
  /** Hiển thị nút phóng to / thu nhỏ trong header */
  maximizable: { type: Boolean, default: false },
  /** Form thêm mới → mở ra là con trỏ ở ô nhập đầu tiên (quy chuẩn) */
  autofocus: { type: Boolean, default: false },
  /** Tab chỉ đi qua ô nhập trong thân form (quy chuẩn) — tắt khi thân form không phải form nhập liệu */
  tabFieldsOnly: { type: Boolean, default: true },
})
const maximized = ref(false)
const bodyEl = ref(null)
let stopTab = null
onMounted(() => {
  if (props.tabFieldsOnly) stopTab = fieldsOnlyTab(bodyEl.value)
  if (props.autofocus) focusFirstField(bodyEl.value)
})
onBeforeUnmount(() => stopTab?.())

defineEmits(['close'])
</script>
