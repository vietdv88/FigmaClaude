<template>
  <a v-if="url" class="link-cell" :href="url" target="_blank" rel="noopener" v-tip="url" @click.stop>
    <TIcon name="external-link" />
    <span>Mở link</span>
  </a>
  <span v-else class="dt-empty">–</span>
</template>

<script setup>
import { vTip } from '@mds/utils/tooltip.js'
import { computed } from 'vue'
import TIcon from '@mds/components/TIcon.vue'

const props = defineProps({ row: Object, col: Object })
const url = computed(() => props.row?.[props.col.key])
</script>

<style scoped>
.link-cell {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--text-body); color: var(--text-link); text-decoration: none;
  white-space: nowrap;
}
.link-cell:hover { text-decoration: underline; }
</style>
