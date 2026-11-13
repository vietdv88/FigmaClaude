<template>
  <!-- Ô tìm kiếm thường — Figma MDS “Searchbox” (6019:50140): icon kính lúp 16 · đệm ngang 8 · cách 8 · cao = ô nhập
       variant 'outline' (mặc định): nền trắng, viền Neutral · 'filled': nền Neutral/200 không viền · 'filled-white': nền trắng 20% trên nền màu (header)
       Hover / Focus (outline, filled): nền trắng + viền Brand · Đã gõ: hiện ✕ xóa (Esc cũng xóa) · Disabled: nền Neutral Light, chữ Hint
       Tìm kiếm thông minh (AI) → dùng AppAiSearchbox -->
  <label class="ibox ibox--search" :class="boxClass" :style="width ? { width: typeof width === 'number' ? width + 'px' : width } : null">
    <TIcon name="search" class="ibox__icon" />
    <input
      ref="inputEl"
      class="ibox__native"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-label="placeholder"
      :disabled="isDisabled"
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown.enter="$emit('search', modelValue)"
      @keydown.esc="modelValue && clear($event)"
    />
    <button v-if="clearable && modelValue && !isDisabled" type="button" class="ibox__icon ibox__icon--clear ibox-search__clear" tabindex="-1" aria-label="Xóa nội dung tìm kiếm" @click.prevent="clear">
      <TIcon name="x" />
    </button>
  </label>
</template>

<script setup>
import { ref, computed } from 'vue'
import TIcon from './TIcon.vue'

const props = defineProps({
  modelValue:  { type: String,  default: '' },
  placeholder: { type: String,  default: 'Tìm kiếm' },
  /** 'outline' | 'filled' | 'filled-white' ('header' = tên cũ của filled-white) */
  variant:     { type: String,  default: 'outline' },
  state:       { type: String,  default: 'default' },
  /** Tên cũ: :outline="false" = variant 'filled' */
  outline:     { type: Boolean, default: true },
  clearable:   { type: Boolean, default: true },
  size:        { type: String,  default: 'md' },
  disabled:    { type: Boolean, default: false },
  width:       { type: [Number, String], default: null },
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])
const inputEl = ref(null)
const isDisabled = computed(() => props.disabled || props.state === 'disabled')
const kind = computed(() => (props.variant === 'header' ? 'filled-white' : !props.outline && props.variant === 'outline' ? 'filled' : props.variant))

const boxClass = computed(() => ({
  'ibox--filled':       kind.value === 'filled',
  'ibox--header':       kind.value === 'filled-white',
  'ibox--error':        props.state === 'error',
  'ibox--disabled':     isDisabled.value,
  'ibox--sm':           props.size === 'sm',
}))

function clear(e) { e?.stopPropagation?.(); emit('update:modelValue', ''); emit('clear'); inputEl.value?.focus() }
defineExpose({ focus: () => inputEl.value?.focus() })
</script>
