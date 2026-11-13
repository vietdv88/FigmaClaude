<template>
  <!-- Đánh dấu dự án yêu thích → hiện ở Tổng quan -->
  <button type="button" class="star-toggle" :class="{ 'star-toggle--on': on }" :aria-pressed="on"
    v-tip="on ? 'Bỏ khỏi dự án yêu thích' : 'Thêm vào dự án yêu thích (hiện ở Tổng quan)'" @click.stop="toggleFavProject(projectId)">
    <TIcon :name="on ? 'star-filled' : 'star'" />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { isFavProject, toggleFavProject, favProjectIds } from '../store/favorites.js'

const props = defineProps({ projectId: { type: String, required: true } })
const on = computed(() => (favProjectIds.value, isFavProject(props.projectId)))
</script>

<style scoped>
.star-toggle { display: inline-flex; align-items: center; justify-content: center; padding: 4px; border: none; border-radius: var(--radius-default); background: transparent; color: var(--icon-neutral); cursor: pointer; }
.star-toggle:hover { background: var(--bg-neutral-light); color: var(--text-warning); }
.star-toggle .ti { font-size: 18px; }
.star-toggle--on { color: #f5b301; }
.star-toggle--on:hover { color: #e0a200; }
</style>
