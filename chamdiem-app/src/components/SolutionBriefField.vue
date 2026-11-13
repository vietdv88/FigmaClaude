<template>
  <!-- Chưa có nội dung → chỉ là link; bấm mới hiện ô nhập. Có nội dung → nút sparkles (màu AI) ở góc dưới phải, bấm mới phân tích độ phức tạp -->
  <button v-if="!open && !hasText && !readonly" type="button" class="btn btn--link sbf-link" @click="expand">
    <TIcon name="plus" />Thêm mô tả giải pháp sơ bộ
  </button>
  <TipField v-else-if="open || hasText" label="Mô tả giải pháp sơ bộ" :tip="TIP">
    <div ref="wrap" class="sbf" :class="{ 'sbf--ai': showAi }">
      <AppTextarea :model-value="modelValue" :min-height="40" :max-height="240" autosize :state="state"
        placeholder="VD: Thêm màn danh sách đơn nghỉ phép, đơn có trạng thái Chờ duyệt / Đã duyệt, duyệt 2 cấp theo quản lý"
        @update:model-value="v => emit('update:modelValue', v)" @focusout="onBlur" />
      <button v-if="showAi" type="button" class="sbf__ai" :class="{ 'sbf__ai--pulse': !analyzed && !loading }" :disabled="loading"
        v-tip="aiTip" :aria-label="aiTip"
        @mousedown.prevent @click="emit('analyze')">
        <TIcon :name="loading ? 'loader-2' : 'sparkles'" class="ti--ai" :class="{ 'sbf__spin': loading }" />
      </button>
    </div>
  </TipField>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppTextarea from '@mds/components/AppTextarea.vue'
import TipField    from './TipField.vue'
import { ensureAiGradient } from '@mds/utils/aiGradient.js'
import { vTip } from '@mds/utils/tooltip.js'

ensureAiGradient()   // icon sparkles tô gradient AI Primary

const props = defineProps({
  modelValue: { type: String, default: '' },
  state:      { type: String, default: 'default' },
  aiEnabled:  { type: Boolean, default: false },
  analyzed:   { type: Boolean, default: false },   // nội dung hiện tại đã được AI phân tích → icon thôi nhấp nháy
  loading:    { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'commit', 'analyze'])

const TIP = 'Mô tả ngắn giải pháp THIẾT KẾ: thêm / sửa những màn, popup, trạng thái nào; luồng thao tác; quy tắc, cảnh báo hiển thị trên giao diện… Bấm biểu tượng ✦ ở góc ô → AI phân tích độ phức tạp theo quy tắc chấm điểm (chỉ tính phần thiết kế, không tính công lập trình).'
const readonly = computed(() => props.state === 'readonly' || props.state === 'disabled')
const hasText  = computed(() => !!String(props.modelValue ?? '').trim())
const showAi   = computed(() => props.aiEnabled && hasText.value && !readonly.value)
const open = ref(false), wrap = ref(null)
const aiTip = computed(() => props.loading ? 'AI đang phân tích độ phức tạp…'
  : props.analyzed ? 'Phân tích lại độ phức tạp nghiệp vụ bằng AI'
  : 'AI phân tích độ phức tạp nghiệp vụ từ mô tả này theo quy tắc chấm điểm')

async function expand() {
  open.value = true
  await nextTick()
  wrap.value?.querySelector('textarea')?.focus()
}
function onBlur() {
  emit('commit')
  if (!hasText.value) open.value = false   // để trống → thu lại thành link
}
</script>

<style scoped>
.sbf-link { justify-self: start; padding: 0; height: auto; gap: 4px; }
.sbf-link .ti { font-size: 14px; }
.sbf { position: relative; }
.sbf--ai :deep(.ibox__native--area) { padding-right: 32px; }
.sbf__ai {
  position: absolute; right: 6px; bottom: 6px; display: inline-flex; align-items: center; justify-content: center;
  padding: 3px; border: none; border-radius: var(--radius-default);
  background: none; cursor: pointer;
}
.sbf__ai:hover:not(:disabled) { background: var(--bg-ai-light); }
.sbf__ai:disabled { cursor: default; }
.sbf__ai .ti { font-size: 16px; }
.sbf__ai--pulse .ti { animation: sbf-pulse 1.2s ease-in-out infinite; }
@keyframes sbf-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.35; transform: scale(0.82); } }
.sbf__spin { animation: sbf-spin 0.9s linear infinite; }
@keyframes sbf-spin { to { transform: rotate(360deg); } }
</style>
