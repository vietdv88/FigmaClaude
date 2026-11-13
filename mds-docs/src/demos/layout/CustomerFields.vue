<template>
  <!-- Bộ trường “Khách hàng” dùng chung cho các demo bố cục — control thật của mds-ui (AppInput + Textbox / Combobox / Datebox / Numberbox / Textarea) -->
  <div class="form-fields form-fields--h" :class="{ 'form-fields--2col': cols === 2 }">
    <AppInput label="Mã khách hàng" required :vertical="false"><AppTextbox v-model="m.code" :disabled="disabled" /></AppInput>
    <AppInput label="Tên khách hàng" required :vertical="false"><AppTextbox v-model="m.name" placeholder="Nhập tên" :disabled="disabled" /></AppInput>
    <AppInput label="Nhóm khách hàng" :vertical="false"><AppCombobox v-model="m.group" :options="GROUPS" placeholder="Chọn nhóm" :disabled="disabled" /></AppInput>
    <AppInput label="Người phụ trách" :vertical="false"><AppCombobox v-model="m.owner" :options="OWNERS" placeholder="Chọn người" :disabled="disabled" /></AppInput>
    <AppInput label="Điện thoại" :vertical="false"><AppTextbox v-model="m.phone" :disabled="disabled" /></AppInput>
    <AppInput label="Email" :vertical="false"><AppTextbox v-model="m.email" :disabled="disabled" /></AppInput>
    <template v-if="full">
      <AppInput label="Ngày hợp tác" :vertical="false"><AppDatebox v-model="m.date" :disabled="disabled" /></AppInput>
      <AppInput label="Hạn mức nợ" :vertical="false"><AppNumberbox v-model="m.limit" :stepper="false" :disabled="disabled" /></AppInput>
      <AppInput label="Địa chỉ" :vertical="false"><AppTextbox v-model="m.address" :disabled="disabled" /></AppInput>
      <AppInput label="Ghi chú" :vertical="false"><AppTextarea v-model="m.note" :min-height="64" :disabled="disabled" /></AppInput>
    </template>
  </div>
</template>

<script setup>
import AppInput from '@mds/components/AppInput.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import AppDatebox from '@mds/components/AppDatebox.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import AppTextarea from '@mds/components/AppTextarea.vue'

defineProps({
  m:        { type: Object, required: true },
  cols:     { type: Number, default: 1 },
  full:     { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
const GROUPS = [{ value: 'vip', label: 'Khách hàng VIP' }, { value: 'si', label: 'Khách sỉ' }, { value: 'le', label: 'Khách lẻ' }]
const OWNERS = ['Lê Minh', 'Trần Hậu', 'Phạm Quân', 'Vũ Lan', 'Nguyễn An'].map(n => ({ value: n, label: n }))
</script>
