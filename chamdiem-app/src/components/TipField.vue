<template>
  <!-- Giống AppInput (class input-field + quy chuẩn lỗi của mds-ui) + icon ⓘ cạnh label, giải thích nằm trong tooltip -->
  <div class="input-field" :class="{ 'input-field--error': fe.hasError.value }" :data-field="field || null"
    @focusin="fe.onFocusIn" @focusout="fe.onFocusOut">
    <div v-if="label" class="input-field__label-wrap">
      <span class="input-field__label" :class="{ 'input-field__label--abbr': abbrTip(label) }" v-tip="abbrTip(label)">{{ label }}</span>
      <span v-if="required" class="input-field__required">*</span>
      <span v-if="tip || tipItems.length || tipNote" class="tip-field__icon"><InfoTip :text="tip" :items="tipItems" :note="tipNote" /></span>
      <span v-if="highlight" class="tip-field__need">Cần nhập</span>
      <!-- Nút phụ cạnh nhãn, căn phải (VD “Nhận việc”) -->
      <span v-if="$slots.action" class="tip-field__action"><slot name="action" /></span>
    </div>
    <div ref="bodyEl" class="input-field__body">
      <slot />
      <!-- Lỗi → tooltip đỏ + icon trong control (mds-ui); cảnh báo → in dưới ô -->
      <span v-if="message && messageType !== 'error'" class="input-field__message" :class="`input-field__message--${messageType}`">
        <TIcon name="alert-triangle" />{{ message }}
      </span>
    </div>
    <ErrorTip :open="fe.open.value" :message="fe.message.value" :anchor="bodyEl?.firstElementChild" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TIcon    from '@mds/components/TIcon.vue'
import ErrorTip from '@mds/components/ErrorTip.vue'
import { provideFieldError, provideFieldRequired } from '@mds/utils/fieldError.js'
import InfoTip from './InfoTip.vue'
import { abbrTip } from '@mds/utils/abbr.js'
import { vTip } from '@mds/utils/tooltip.js'

const props = defineProps({
  label:       { type: String,  default: '' },
  required:    { type: Boolean, default: false },
  tip:         { type: String,  default: '' },
  tipItems:    { type: Array,   default: () => [] },
  tipNote:     { type: String,  default: '' },
  message:     { type: String,  default: '' },
  messageType: { type: String,  default: 'error' },
  /** Đánh dấu trường bắt buộc để có điểm đang còn trống */
  highlight:   { type: Boolean, default: false },
  /** Khóa trường (data-field) để cuộn / focus tới */
  field:       { type: String,  default: '' },
})

const bodyEl = ref(null)
const fe = provideFieldError(() => props.message, () => props.messageType)
provideFieldRequired(() => props.required)   // trường bắt buộc → combobox / datebox con không hiện nút bỏ chọn (quy chuẩn mds-ui)
</script>

<style scoped>
.tip-field__icon { display: inline-flex; margin-left: 2px; }
.tip-field__need {
  margin-left: auto; padding: 0 6px; border-radius: var(--radius-sm);
  background: var(--bg-warning-light); color: var(--text-warning);
  font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-medium); white-space: nowrap;
}
.tip-field__action { margin-left: auto; display: inline-flex; }
.tip-field__action .btn { height: auto; padding: 0; }
</style>
