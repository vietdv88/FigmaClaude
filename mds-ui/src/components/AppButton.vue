<template>
  <button
    class="btn"
    :class="btnClass"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="spinner spinner--sm" role="status" aria-label="Đang xử lý" />
    <TIcon v-if="iconLeft" :name="iconLeft" />
    <span v-if="label || $slots.default" class="btn__label">
      <slot>{{ label }}</slot>
    </span>
    <TIcon v-if="iconRight" :name="iconRight" />
  </button>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import TIcon from './TIcon.vue'

const props = defineProps({
  label:    { type: String,  default: '' },
  variant:  { type: String,  default: 'filled' }, // filled | outline | ghost | text (Figma Style=Text — nút dạng link)
  color:    { type: String,  default: 'primary' }, // primary | neutral | success | warning | danger | black | white
  size:     { type: String,  default: 'md' },      // sm | md | lg
  iconLeft: { type: String,  default: '' },
  iconRight:{ type: String,  default: '' },
  disabled: { type: Boolean, default: false },
  loading:  { type: Boolean, default: false },
  block:    { type: Boolean, default: false },
})

defineOptions({ inheritAttrs: false })

const slots = useSlots()

const VARIANT_MAP = {
  filled: {
    primary: 'btn--primary',
    neutral: 'btn--neutral',
    success: 'btn--success',
    warning: 'btn--warning',
    danger:  'btn--danger',
    black:   'btn--black',
    white:   'btn--white',
  },
  outline: {
    primary: 'btn--outline',
    neutral: 'btn--neutral',
    success: 'btn--outline-success',
    warning: 'btn--outline-warning',
    danger:  'btn--outline-danger',
  },
  ghost: {
    primary: 'btn--ghost',
    neutral: 'btn--ghost',
    success: 'btn--ghost',
    warning: 'btn--ghost',
    danger:  'btn--ghost',
  },
  text: {
    primary: 'btn--text',
    neutral: 'btn--text-neutral',
    info:    'btn--text-info',
    success: 'btn--text-success',
    warning: 'btn--text-warning',
    danger:  'btn--text-danger',
  },
}

const btnClass = computed(() => {
  const variantClass = VARIANT_MAP[props.variant]?.[props.color] ?? 'btn--primary'
  const hasLabel = !!props.label || !!slots.default
  return [
    variantClass,
    props.size === 'sm' && 'btn--sm',
    props.size === 'lg' && 'btn--lg',
    props.block && 'btn--block',
    props.loading && 'btn--loading',
    !hasLabel && (props.iconLeft || props.iconRight) && 'btn--icon-only',
  ].filter(Boolean)
})
</script>

<style scoped>
</style>
