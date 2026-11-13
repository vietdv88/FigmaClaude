<template>
  <div
    ref="rootEl"
    class="input-field"
    :class="{ 'input-field--row': !vertical, 'input-field--error': fe.hasError.value }"
    @focusin="fe.onFocusIn" @focusout="fe.onFocusOut"
  >
    <div v-if="label" class="input-field__label-wrap">
      <span class="input-field__label" :class="{ 'input-field__label--abbr': abbrTip(label) }" v-tip="abbrTip(label)">{{ label }}</span>
      <span v-if="required" class="input-field__required">*</span>
    </div>
    <div ref="bodyEl" class="input-field__body">
      <slot />
      <span v-if="caption" class="input-field__caption">{{ caption }}</span>
      <!-- Lỗi (error): KHÔNG in dưới ô — hiện bằng tooltip đỏ + icon trong control. Cảnh báo / thông tin: in dưới ô -->
      <span v-if="message && messageType !== 'error'" class="input-field__message" :class="`input-field__message--${messageType}`">
        <TIcon v-if="messageType === 'success'" name="circle-check" />
        <TIcon v-else-if="messageType === 'warning'" name="alert-triangle" />
        <TIcon v-else-if="messageType === 'info'" name="info-circle" />
        {{ message }}
      </span>
    </div>
    <ErrorTip :open="fe.open.value" :message="fe.message.value" :anchor="bodyEl?.firstElementChild" />
  </div>
</template>

<script setup>
import { abbrTip } from '../utils/abbr.js'
import { vTip } from '../utils/tooltip.js'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import TIcon    from './TIcon.vue'
import ErrorTip from './ErrorTip.vue'
import { provideFieldError, provideFieldRequired } from '../utils/fieldError.js'
import { registerAutoLabel, unregisterAutoLabel, remeasureAutoLabel } from '../utils/autoLabelWidth.js'

const props = defineProps({
  label:       { type: String,  default: '' },
  required:    { type: Boolean, default: false },
  vertical:    { type: Boolean, default: true },
  caption:     { type: String,  default: '' },
  message:     { type: String,  default: '' },
  messageType: { type: String,  default: 'error' }, // error | success | warning | info
})

const bodyEl = ref(null)
const fe = provideFieldError(() => props.message, () => props.messageType)
provideFieldRequired(() => props.required)   // ô bắt buộc → combobox / datebox con không hiện nút bỏ chọn

/* Nhãn trái: cột nhãn của cả form = nhãn dài nhất + 8px, mọi ô thẳng hàng dọc (utils/autoLabelWidth.js) */
const rootEl = ref(null)
let labelBox = null
const attach = () => { if (!props.vertical && props.label && !labelBox) labelBox = registerAutoLabel(rootEl.value) }
const detach = () => { unregisterAutoLabel(labelBox); labelBox = null }
onMounted(attach)
onBeforeUnmount(detach)
watch(() => props.vertical, () => { detach(); attach() })
watch(() => [props.label, props.required], () => { if (labelBox) remeasureAutoLabel(labelBox); else attach() })
</script>
