<template>
  <!-- Trường ở màn Chi tiết (quy chuẩn MDS): nhãn 200px · giá trị gạch chân mảnh · bấm vào giá trị → sửa nhanh 1 trường (✓ lưu / ✕ hủy) -->
  <div class="detail-field" :class="{ 'detail-field--editing': editing }">
    <span class="detail-field__label" :class="{ 'input-field__label--abbr': abbrTip(label) }" v-tip="abbrTip(label)">{{ label }}</span>
    <template v-if="editing">
      <AppTextbox ref="boxEl" v-model="draft" class="detail-field__input" @keydown.enter="save" @keydown.esc="cancel" />
      <span class="detail-field__acts">
        <button class="btn-icon btn-icon--sm detail-field__ok" type="button" v-tip="'Lưu'" aria-label="Lưu" @click="save"><TIcon name="circle-check-filled" /></button>
        <button class="btn-icon btn-icon--sm" type="button" v-tip="'Hủy'" aria-label="Hủy" @click="cancel"><TIcon name="circle-x" /></button>
      </span>
    </template>
    <div v-else class="detail-field__value" :class="{ 'detail-field__value--empty': empty, 'detail-field__value--editable': editable && !isLink }" @click="start">
      <slot>
        <a v-if="isLink" class="btn btn--link" :href="modelValue.href" @click.stop>{{ modelValue.link }}</a>
        <template v-else>{{ empty ? '-' : modelValue }}</template>
      </slot>
      <!-- Hover → hiện bút chì cuối ô: báo trường này bấm vào sửa được -->
      <TIcon v-if="editable && !isLink" name="pencil" class="detail-field__pen" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import TIcon from './TIcon.vue'
import AppTextbox from './AppTextbox.vue'
import { abbrTip } from '../utils/abbr.js'
import { vTip } from '../utils/tooltip.js'

const props = defineProps({
  label:      { type: String, default: '' },
  modelValue: { type: [String, Number, Object], default: '' },  // Object = { link, href } → hiển thị dạng link
  editable:   { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue', 'save'])

const isLink = computed(() => typeof props.modelValue === 'object' && props.modelValue !== null)
const empty  = computed(() => props.modelValue === '' || props.modelValue == null)

const editing = ref(false)
const draft = ref('')
const boxEl = ref(null)

async function start() {
  if (!props.editable || isLink.value) return
  draft.value = empty.value ? '' : String(props.modelValue)
  editing.value = true
  await nextTick()
  boxEl.value?.$el.querySelector('input')?.focus()
}
function save() {
  emit('update:modelValue', draft.value)
  emit('save', draft.value)
  editing.value = false
}
function cancel() { editing.value = false }
</script>
