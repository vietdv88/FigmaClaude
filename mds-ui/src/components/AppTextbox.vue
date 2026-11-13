<template>
  <div class="ibox" :class="boxClass">
    <TIcon v-if="iconLeft"  :name="iconLeft"  class="ibox__icon" />
    <input
      class="ibox__native"
      :class="{ 'ibox__native--right': align === 'right' }"
      :type="showPassword ? 'text' : inputType"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled || state === 'disabled'"
      :readonly="readonly || state === 'readonly'"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <!-- Lỗi: icon chấm than đỏ, hover → tooltip lỗi (nằm trong AppInput có lỗi) -->
    <span v-if="fe?.hasError.value" class="ibox__icon ibox__icon--error" @mouseenter="fe.show()" @mouseleave="fe.hide()"><TIcon name="alert-circle" /></span>
    <!-- Password toggle -->
    <span v-if="inputType === 'password'" class="ibox__icon ibox__icon--action" @click="showPassword = !showPassword">
      <TIcon :name="showPassword ? 'eye-off' : 'eye'" />
    </span>
    <!-- Nút × (quy chuẩn): CHỈ ô tìm kiếm (type="search") — ô nhập chữ thường không có × khi có giá trị, kể cả truyền clearable -->
    <span v-else-if="clearable && type === 'search' && modelValue" class="ibox__icon ibox__icon--clear" @click="$emit('update:modelValue', ''); $emit('clear')">
      <TIcon name="x" />
    </span>
    <TIcon v-else-if="iconRight" :name="iconRight" class="ibox__icon" :class="{ 'ibox__icon--brand': iconRight === 'plus' }" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TIcon from './TIcon.vue'
import { useFieldError } from '../utils/fieldError.js'

const props = defineProps({
  modelValue:  { type: String,  default: '' },
  type:        { type: String,  default: 'text' }, // text | password | email | tel | url
  placeholder: { type: String,  default: '' },
  state:       { type: String,  default: 'default' }, // default | error | success | warning | disabled | readonly
  outline:     { type: Boolean, default: true },
  /** Viền ẩn, chỉ hiện khi rê / focus — dùng cho ô sửa trực tiếp trên bảng (DataTable editable), giống AppCombobox ghost */
  ghost:       { type: Boolean, default: false },
  iconLeft:    { type: String,  default: '' },
  iconRight:   { type: String,  default: '' },
  clearable:   { type: Boolean, default: false },   // chỉ có tác dụng khi type="search" (ô tìm kiếm) — ô tìm kiếm nên dùng AppSearchbox
  align:       { type: String,  default: 'left' }, // left | right
  size:        { type: String,  default: 'md' },   // md | sm
  disabled:    { type: Boolean, default: false },
  readonly:    { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'clear'])

const showPassword = ref(false)

const inputType = computed(() => props.type === 'password' ? 'password' : props.type)

const fe = useFieldError()
const boxClass = computed(() => ({
  'ibox--ghost':     props.ghost,
  'ibox--no-border': !props.ghost && !props.outline,
  'ibox--error':     props.state === 'error' || !!fe?.hasError.value,
  'ibox--success':   props.state === 'success',
  'ibox--warning':   props.state === 'warning',
  'ibox--disabled':  props.state === 'disabled' || props.disabled,
  'ibox--readonly':  props.state === 'readonly'  || props.readonly,
  'ibox--sm':        props.size === 'sm',
}))
</script>
