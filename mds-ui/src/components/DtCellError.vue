<template>
  <!-- Ô sửa trực tiếp trong DataTable có lỗi (VD bắt buộc mà bị xóa trắng) — cùng quy chuẩn báo lỗi của input (utils/fieldError.js):
       viền đỏ + icon chấm than tròn đỏ bên phải trong ô · hover icon / đang focus ô → tooltip lỗi đỏ phía dưới.
       Control App* bên trong (AppCombobox) tự vẽ viền + icon qua useFieldError → icon riêng chỉ cho input / textarea thường (prop icon). -->
  <div ref="el" class="dt-err" :class="{ 'dt-err--on': fe.hasError.value, 'dt-err--icon': icon && fe.hasError.value }" @focusin="fe.onFocusIn" @focusout="fe.onFocusOut">
    <slot />
    <span v-if="icon && fe.hasError.value" class="dt-err__icon" @mouseenter="fe.show()" @mouseleave="fe.hide()"><TIcon name="alert-circle" /></span>
    <ErrorTip :open="fe.open.value" :message="fe.message.value" :anchor="el" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TIcon from './TIcon.vue'
import ErrorTip from './ErrorTip.vue'
import { provideFieldError } from '../utils/fieldError.js'

const props = defineProps({
  message: { type: String,  default: '' },    // rỗng = không lỗi
  icon:    { type: Boolean, default: true },  // false khi control con tự vẽ icon lỗi (AppCombobox)
})
const el = ref(null)
const fe = provideFieldError(() => props.message)
</script>
