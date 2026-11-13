<template>
  <div class="demo-stack">
    <div class="demo-grid">
      <AppInput label="Đơn giá"><AppNumberbox v-model="price" :stepper="false" /></AppInput>
      <AppInput label="Số lượng"><AppNumberbox v-model="qty" decimal /></AppInput>
      <AppInput label="Thành tiền"><AppNumberbox :model-value="total" :stepper="false" readonly /></AppInput>
    </div>
    <span class="demo-muted">Gõ số bất kỳ: khi rời ô, số tự hiện dấu chấm (.) ngăn hàng nghìn và dấu phẩy (,) ngăn phần thập phân — VD gõ 1234567,5 → 1.234.567,5</span>
    <table class="demo-num-table">
      <thead><tr><th>Giá trị</th><th>Hiển thị đúng (TT200)</th><th>Không dùng</th></tr></thead>
      <tbody>
        <tr v-for="r in SAMPLES" :key="r.v"><td>{{ r.label }}</td><td class="demo-num-table__ok">{{ fmtNum(r.v, { decimals: 2 }) }}</td><td class="demo-num-table__bad">{{ r.wrong }}</td></tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppInput from '@mds/components/AppInput.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import { fmtNum } from '@mds/utils/number.js'

const price = ref(1250000), qty = ref(2.5)
const total = computed(() => Math.round((Number(price.value) || 0) * (Number(qty.value) || 0)))
// fmtNum (mds-ui/utils/number.js): định dạng chuẩn cho MỌI số hiển thị — ô nhập, bảng, báo cáo
const SAMPLES = [
  { label: 'Một nghìn', v: 1000, wrong: '1,000' },
  { label: 'Hơn một triệu', v: 1234567, wrong: '1 234 567' },
  { label: 'Có phần thập phân', v: 12350.5, wrong: '12,350.50' },
  { label: 'Tiền lớn', v: 1234567.89, wrong: '1,234,567.89' },
]
</script>

<style scoped>
.demo-num-table { width: 100%; max-width: 560px; border-collapse: collapse; font-size: var(--text-body); }
.demo-num-table th, .demo-num-table td { padding: 6px 12px; border-bottom: 1px solid var(--stroke-neutral-light); text-align: left; }
.demo-num-table th { font-weight: var(--fw-semibold); color: var(--text-secondary); }
.demo-num-table td:nth-child(n+2), .demo-num-table th:nth-child(n+2) { text-align: right; font-variant-numeric: tabular-nums; }
.demo-num-table__ok { color: var(--text-success); font-weight: var(--fw-semibold); }
.demo-num-table__bad { color: var(--text-danger); text-decoration: line-through; }
</style>
