<template>
  <!-- Accordion (Figma MDS Web Components v2.0 › Accordion 6019:928): Style Outline = True (mục tách rời, viền + bo 8, cách 12) · False (liền khối, kẻ ngang)
       Mục: đệm 16, tiêu đề H3 16/22 Semi Bold + chevron 20 (đóng ⌄ · mở ⌃), tiêu đề → nội dung cách 12, nội dung Body 13/20 -->
  <div class="accordion" :class="outline ? 'accordion--outline' : 'accordion--flat'">
    <div v-for="it in items" :key="it.key" class="accordion__item" :class="{ 'accordion__item--open': isOpen(it.key), 'accordion__item--disabled': it.disabled }">
      <button
        :id="`${uid}-h-${it.key}`" type="button" class="accordion__header"
        :aria-expanded="isOpen(it.key)" :aria-controls="`${uid}-p-${it.key}`" :disabled="it.disabled"
        @click="toggle(it.key)"
      >
        <span class="accordion__title">
          <slot name="title" :item="it" :open="isOpen(it.key)">{{ it.title }}</slot>
        </span>
        <TIcon :name="isOpen(it.key) ? 'chevron-up' : 'chevron-down'" class="accordion__chevron" />
      </button>
      <div v-show="isOpen(it.key)" :id="`${uid}-p-${it.key}`" class="accordion__body" role="region" :aria-labelledby="`${uid}-h-${it.key}`">
        <slot :name="`item-${it.key}`" :item="it"><slot :item="it">{{ it.content }}</slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TIcon from './TIcon.vue'

const props = defineProps({
  /** [{ key, title, content?, disabled? }] — nội dung dài / có control: slot #item-{key} (hoặc slot mặc định nhận { item }) */
  items:      { type: Array,   default: () => [] },
  /** Các mục đang mở (v-model) — mảng key */
  modelValue: { type: Array,   default: () => [] },
  /** Figma “Style Outline”: true = mục tách rời có viền + bo góc · false = liền khối, chỉ kẻ ngang */
  outline:    { type: Boolean, default: true },
  /** false = mở 1 mục thì đóng các mục khác */
  multiple:   { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue', 'toggle'])
let seq = 0
const uid = 'acc-' + (++seq) + '-' + Math.random().toString(36).slice(2, 7)   // id cho aria-controls / aria-labelledby
const open = computed(() => new Set(props.modelValue))
const isOpen = k => open.value.has(k)
function toggle(k) {
  const was = isOpen(k)
  const next = was ? props.modelValue.filter(x => x !== k) : (props.multiple ? [...props.modelValue, k] : [k])
  emit('update:modelValue', next)
  emit('toggle', k, !was)
}
</script>
