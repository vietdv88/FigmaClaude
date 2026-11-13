<template>
  <div class="demo-stack">
    <div class="demo-row">
      <DropdownMenu :items="items" placement="bottom-start" @select="pick">
        <template #trigger="{ toggle }">
          <button class="btn-icon btn-icon--outline" aria-label="Thêm tùy chọn" @click.stop="toggle"><TIcon name="dots" /></button>
        </template>
      </DropdownMenu>
      <span class="demo-muted">Bấm nút 3 chấm, hoặc chuột phải vào vùng bên dưới</span>
    </div>
    <DropdownMenu ref="ctx" :items="items" @select="pick">
      <template #trigger>
        <div class="demo-ctx-area" @contextmenu.prevent="ctx.openAt($event)">Chuột phải vào đây</div>
      </template>
    </DropdownMenu>
    <div v-if="last" class="demo-muted">Đã chọn: <b>{{ last }}</b></div>

    <!-- Menu List có checkbox (Figma Menu List Item · Show Checkbox): chọn nhiều, menu giữ mở -->
    <div class="demo-row">
      <DropdownMenu :items="colItems" checkbox placement="bottom-start" :min-width="220" @select="toggleCol">
        <template #trigger="{ toggle }">
          <button class="btn btn--outline btn--neutral" @click.stop="toggle"><TIcon name="table-column" />Cột hiển thị ({{ cols.length }})</button>
        </template>
      </DropdownMenu>
      <span class="demo-muted">Menu có checkbox: tick nhiều mục, menu giữ mở · bấm ra ngoài hoặc Esc để đóng</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import DropdownMenu from '@mds/components/DropdownMenu.vue'
const ctx = ref(null), last = ref('')
const items = [
  { id: 'view', icon: 'eye', label: 'Xem' },
  { id: 'edit', icon: 'pencil', label: 'Sửa' },
  { id: 'copy', icon: 'copy', label: 'Nhân bản' },
  { separator: true },
  { id: 'delete', icon: 'trash', label: 'Xóa', danger: true },
]
const pick = item => { last.value = item.label }
const COLS = ['Ngày chứng từ', 'Số chứng từ', 'Khách hàng', 'Diễn giải', 'Số tiền', 'Trạng thái']
const cols = ref(['Ngày chứng từ', 'Số chứng từ', 'Số tiền'])
const colItems = computed(() => COLS.map(c => ({ id: c, label: c, checked: cols.value.includes(c) })))
const toggleCol = item => { cols.value = cols.value.includes(item.id) ? cols.value.filter(c => c !== item.id) : [...cols.value, item.id] }
</script>
