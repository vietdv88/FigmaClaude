<template>
  <!-- Menu trái của Quản trị nội dung — cùng sidebar chuẩn mds-ui như trang tài liệu (thay cho dãy tab) -->
  <AppSidebar :items="items" :active-id="activeId" hide-quick-add default-expanded storage-key="mds-docs-admin-sidebar"
    :force-expanded="forceExpanded" @nav="go" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from '@mds/components/AppSidebar.vue'
import { state } from '../store.js'

defineProps({ forceExpanded: { type: Boolean, default: false } })
const emit = defineEmits(['navigate'])
const route = useRoute(), router = useRouter()
const DOCS = '__docs'
const items = computed(() => [
  { id: 'pages', icon: 'file-text', label: 'Trang tài liệu' },
  { id: 'groups', icon: 'folders', label: 'Nhóm' },
  { id: 'links', icon: 'link', label: 'Liên kết hữu ích' },
  { id: 'trash', icon: 'trash', label: 'Thùng rác' },
  { id: 'notes', icon: 'bulb', label: 'Tri thức AVA' },
  { id: 'ava', icon: 'sparkles', label: 'Lịch sử hỏi AVA' },
  { id: 'ratings', icon: 'star', label: 'Đánh giá nội dung' },
  ...(state.me.isAdmin ? [{ id: 'editors', icon: 'users', label: 'Người biên tập' }] : []),
  { id: DOCS, icon: 'book', label: 'Về trang tài liệu' },
])
// Đang sửa / thêm trang (/quan-tri/:slug) → sáng mục “Trang tài liệu”
const activeId = computed(() => (route.params.slug ? 'pages' : String(route.query.tab || 'pages')))
function go(id) {
  emit('navigate')
  if (id === DOCS) return router.push('/')
  router.push({ path: '/quan-tri', query: id === 'pages' ? {} : { tab: id } })
}
</script>
