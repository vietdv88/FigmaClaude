<template>
  <div v-if="items.length || note" class="rule-hint">
    <ul v-if="items.length" class="rule-hint__list">
      <li v-for="(c, i) in items" :key="i">{{ c }}</li>
    </ul>
    <p v-if="note" class="rule-hint__note"><TIcon name="info-circle" />{{ note }}</p>
  </div>
</template>

<script setup>
import TIcon from '@mds/components/TIcon.vue'

defineProps({
  items: { type: Array,  default: () => [] },
  note:  { type: String, default: '' },
})
</script>

<style scoped>
.rule-hint {
  display: flex; flex-direction: column; gap: 4px;
  padding: 8px 12px; border-radius: var(--radius-default);
  background: var(--bg-neutral-light);
}
.rule-hint__list {
  margin: 0; padding-left: 16px;
  display: flex; flex-direction: column; gap: 2px;
  font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary);
}
.rule-hint__note {
  display: flex; align-items: flex-start; gap: 4px;
  font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-warning);
}
</style>
