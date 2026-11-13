<template>
  <!-- Ô ☆ trong danh sách dự án (DataTable swap-component) -->
  <StarToggle :project-id="row.id" />
</template>

<script setup>
import StarToggle from './StarToggle.vue'
defineProps({ row: Object, col: Object })
</script>
