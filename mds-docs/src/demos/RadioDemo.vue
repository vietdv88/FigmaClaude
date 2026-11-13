<template>
  <div class="demo-stack">
    <div class="demo-stack demo-stack--sm">
      <span class="demo-label">Loại khách hàng (nhóm ngang)</span>
      <div class="radio-group" role="radiogroup" aria-label="Loại khách hàng">
        <AppRadio v-for="o in KINDS" :key="o.value" v-model="kind" :value="o.value" :label="o.label" name="demo-kind" />
      </div>
    </div>
    <div class="demo-stack demo-stack--sm">
      <span class="demo-label">Kỳ báo cáo (nhóm dọc)</span>
      <div class="radio-group radio-group--vertical" role="radiogroup" aria-label="Kỳ báo cáo">
        <AppRadio v-for="o in PERIODS" :key="o.value" v-model="period" :value="o.value" :label="o.label" name="demo-period" :disabled="o.disabled" />
      </div>
    </div>
    <div class="demo-stack demo-stack--sm">
      <span class="demo-label">Hình thức thanh toán <span class="text-danger">*</span></span>
      <div class="radio-group" role="radiogroup" aria-label="Hình thức thanh toán">
        <AppRadio v-for="o in PAYS" :key="o.value" v-model="pay" :value="o.value" :label="o.label" name="demo-pay" :error="!pay" />
      </div>
      <span v-if="!pay" class="demo-error">Chọn hình thức thanh toán</span>
    </div>
    <span class="demo-muted">Đang chọn: {{ KINDS.find(o => o.value === kind)?.label }} · {{ PERIODS.find(o => o.value === period)?.label }} · {{ PAYS.find(o => o.value === pay)?.label || 'chưa chọn' }} — Tab vào nhóm, phím mũi tên để đổi lựa chọn</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppRadio from '@mds/components/AppRadio.vue'

const KINDS = [{ value: 'org', label: 'Tổ chức' }, { value: 'person', label: 'Cá nhân' }, { value: 'household', label: 'Hộ kinh doanh' }]
const PERIODS = [{ value: 'month', label: 'Tháng' }, { value: 'quarter', label: 'Quý' }, { value: 'year', label: 'Năm' }, { value: 'custom', label: 'Tùy chọn (chưa hỗ trợ)', disabled: true }]
const PAYS = [{ value: 'cash', label: 'Tiền mặt' }, { value: 'bank', label: 'Chuyển khoản' }]
const kind = ref('org'), period = ref('quarter'), pay = ref('')
</script>
