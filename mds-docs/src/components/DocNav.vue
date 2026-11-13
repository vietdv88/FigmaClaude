<template>
  <!-- Sidebar chuẩn mds-ui: nhóm có icon, bấm mở / đóng danh sách trang · thu gọn còn cột icon (rê vào giãn ra) · màn hẹp: nằm trong ngăn trượt, luôn mở rộng -->
  <AppSidebar :items="items" :active-id="activeId" hide-quick-add default-expanded children-mode="accordion" storage-key="mds-docs-sidebar"
    :force-expanded="forceExpanded" @nav="go" />
</template>

<script setup>
import { computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from '@mds/components/AppSidebar.vue'
import { state, navGroups } from '../store.js'

defineProps({ forceExpanded: { type: Boolean, default: false } })
const emit = defineEmits(['navigate'])
const route = useRoute(), router = useRouter()
const HOME = '__home'
// Icon theo nhóm (nhóm mới tạo trong CMS → icon thư mục)
const GROUP_ICONS = { 'Bắt đầu': 'school', Checklist: 'checklist', General: 'book', Styles: 'palette', Communication: 'message-circle', Components: 'layout-grid', Patterns: 'layout-dashboard', Others: 'dots-circle-horizontal' }
const items = computed(() => [
  { id: HOME, icon: 'home', label: 'Tổng quan' },
  ...navGroups().map(g => ({
    id: 'group:' + g.group, icon: GROUP_ICONS[g.group] || 'folders', label: g.group,
    children: g.pages.map(p => ({ id: p.slug, label: p.title, href: '/ds/' + p.slug })),
  })),
])
const activeId = computed(() => (route.path === '/' ? HOME : String(route.params.slug || '')))
function go(id) {
  if (id.startsWith('group:')) return
  router.push(id === HOME ? '/' : '/' + id)
  emit('navigate')
}
// Mở trang bằng link → cuộn menu tới mục đang xem
watch(() => [activeId.value, state.loaded], async () => {
  await nextTick()
  document.querySelector('.ds-nav .sidebar-subitem.active, .ds-nav .sidebar-item.active')?.scrollIntoView({ block: 'nearest' })
}, { immediate: true })
</script>
