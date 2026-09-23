<template>
  <RouterView />
</template>

<script setup>
import { onMounted } from 'vue'
import { applyTheme, currentTheme, applyDensity, currentDensity, applyMode, currentMode, applyWallpaper, currentWallpaper, applySidebarMode, currentSidebarMode } from '@mds/theme.js'
onMounted(() => {
  applyTheme(currentTheme.value)
  applyDensity(currentDensity.value)
  applyMode(localStorage.getItem('mds-header-mode') || 'light')
  applySidebarMode(currentSidebarMode.value)
  // Init wallpaper (default aurora nếu chưa chọn)
  if (!localStorage.getItem('mds-wallpaper')) applyWallpaper('fogmtn')
  else applyWallpaper(currentWallpaper.value)
})
</script>
