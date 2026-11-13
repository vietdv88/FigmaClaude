<template>
  <div class="demo-grid">
    <AppInput label="Phòng ban">
      <AppCombobox v-model="dept" :options="depts" placeholder="Chọn phòng ban" />
    </AppInput>
    <AppInput label="Trạng thái (có mô tả)">
      <AppCombobox v-model="status" :options="statuses" placeholder="Chọn trạng thái" :clearable="false" />
    </AppInput>
    <AppInput label="Không chọn được">
      <AppCombobox model-value="Kế toán" :options="depts" disabled />
    </AppInput>
  </div>
</template>

<script setup>
import AppInput from '@mds/components/AppInput.vue'
import { ref } from 'vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
const depts = ['Kế toán', 'Nhân sự', 'Kinh doanh', 'Sản xuất', 'Công nghệ thông tin']
const statuses = [
  { value: 'draft', label: 'Nháp', description: 'Chưa gửi duyệt' },
  { value: 'pending', label: 'Chờ duyệt', description: 'Đang chờ quản lý duyệt' },
  { value: 'done', label: 'Đã duyệt' },
]
const dept = ref(''), status = ref('pending')
</script>
