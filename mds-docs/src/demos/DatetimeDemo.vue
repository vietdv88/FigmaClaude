<template>
  <!-- Gom 3 nhóm theo cách dùng: Nhập nhanh (gõ tay) · Chọn 1 giá trị · Chọn khoảng — mỗi nhóm chia Ngày & giờ / Theo kỳ -->
  <div class="demo-stack">
    <section class="dtg">
      <header class="dtg__head"><h3 class="dtg__title">Nhập nhanh — gõ trực tiếp hoặc chọn</h3><span class="demo-muted">AppDatebox · gõ <b>20102026</b> → 20/10/2026, <b>1030</b> → 10:30 · dấu / : tự chèn khi gõ</span></header>
      <div class="demo-dt">
        <AppInput label="Ngày chứng từ"><AppDatebox v-model="date" /></AppInput>
        <AppInput label="Hạn hoàn thành (ngày giờ)"><AppDatebox v-model="dt" type="datetime-local" /></AppInput>
        <AppInput label="Giờ bắt đầu"><AppDatebox v-model="time" type="time" /></AppInput>
      </div>
    </section>

    <!-- Bảng chọn nâng cao theo Figma Date Time Picker — AppDatePicker -->
    <section class="dtg">
      <header class="dtg__head"><h3 class="dtg__title">Chọn một giá trị</h3><span class="demo-muted">AppDatePicker · bấm ô để xổ bảng chọn</span></header>
      <div class="dtg__sub">
        <span class="dtg__cap">Ngày &amp; giờ</span>
        <div class="demo-dt">
          <AppInput label="Ngày (Date Picker)"><AppDatePicker v-model="v.date" type="date" /></AppInput>
          <AppInput label="Giờ (Time Picker)"><AppDatePicker v-model="v.time" type="time" /></AppInput>
          <AppInput label="Ngày giờ (Date Time Picker)"><AppDatePicker v-model="v.datetime" type="datetime" /></AppInput>
        </div>
      </div>
      <div class="dtg__sub">
        <span class="dtg__cap">Theo kỳ</span>
        <div class="demo-dt">
          <AppInput label="Tuần (Week Picker)"><AppDatePicker v-model="v.week" type="week" /></AppInput>
          <AppInput label="Tháng (Month Picker)"><AppDatePicker v-model="v.month" type="month" /></AppInput>
          <AppInput label="Quý (Quarter Picker)"><AppDatePicker v-model="v.quarter" type="quarter" /></AppInput>
          <AppInput label="6 tháng (6 Months Picker)"><AppDatePicker v-model="v.half" type="half" /></AppInput>
          <AppInput label="Năm (Year Picker)"><AppDatePicker v-model="v.year" type="year" /></AppInput>
        </div>
      </div>
    </section>

    <section class="dtg">
      <header class="dtg__head"><h3 class="dtg__title">Chọn khoảng</h3><span class="demo-muted">2 bảng cạnh nhau · bấm ô đầu rồi ô cuối (rê chuột xem trước khoảng)</span></header>
      <div class="dtg__sub">
        <span class="dtg__cap">Ngày &amp; giờ</span>
        <div class="demo-dt">
          <AppInput label="Khoảng ngày, có chọn nhanh (Date Range Picker)"><AppDatePicker v-model="r.datePreset" type="date" range presets /></AppInput>
          <AppInput label="Khoảng ngày (không chọn nhanh)"><AppDatePicker v-model="r.date" type="date" range /></AppInput>
          <AppInput label="Khung giờ (Time Range Picker)"><AppDatePicker v-model="r.time" type="time" range /></AppInput>
        </div>
      </div>
      <div class="dtg__sub">
        <span class="dtg__cap">Theo kỳ</span>
        <div class="demo-dt">
          <AppInput label="Khoảng tuần (Week Range Picker)"><AppDatePicker v-model="r.week" type="week" range /></AppInput>
          <AppInput label="Khoảng tháng (Month Range Picker)"><AppDatePicker v-model="r.month" type="month" range /></AppInput>
          <AppInput label="Khoảng quý (Quarter Range Picker)"><AppDatePicker v-model="r.quarter" type="quarter" range /></AppInput>
          <AppInput label="Khoảng 6 tháng (6 Months Range Picker)"><AppDatePicker v-model="r.half" type="half" range /></AppInput>
          <AppInput label="Khoảng năm (Year Range Picker)"><AppDatePicker v-model="r.year" type="year" range /></AppInput>
        </div>
      </div>
    </section>
    <span class="demo-muted">Bấm tiêu đề tháng / năm trên bảng để nhảy nhanh lên chọn tháng, năm, thập kỷ · Esc hoặc bấm ra ngoài để đóng.</span>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import AppInput from '@mds/components/AppInput.vue'
import AppDatebox from '@mds/components/AppDatebox.vue'
import AppDatePicker from '@mds/components/AppDatePicker.vue'
const today = new Date().toISOString().slice(0, 10)
const date = ref(today), dt = ref(`${today}T17:30`), time = ref('08:00')
const y = new Date().getFullYear()
const v = reactive({ date: today, week: '', month: `${y}-06`, quarter: `${y}-Q2`, half: '', year: String(y), time: '05:02:00', datetime: '' })
const r = reactive({ datePreset: ['', ''], date: ['', ''], week: ['', ''], month: [`${y}-06`, `${y + 1}-02`], quarter: ['', ''], half: ['', ''], year: ['', ''], time: ['08:00', '14:00'] })
</script>

<style scoped>
/* Ô ngày giờ rộng theo dữ liệu (AppDatePicker / AppDatebox tự tính) — không kéo giãn theo cột lưới */
.demo-dt { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px 24px; }
.demo-dt > * { width: auto; max-width: 100%; }
/* Khung nhóm: viền nhạt, không bóng (khối trắng nằm trên nền trắng của khung ví dụ) · bo 8 · Padding 16 */
.dtg { display: flex; flex-direction: column; gap: 16px; padding: 16px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-card); }
.dtg__head { display: flex; flex-direction: column; gap: 4px; }
.dtg__title { margin: 0; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.dtg__sub { display: flex; flex-direction: column; gap: 8px; }
.dtg__sub + .dtg__sub { padding-top: 16px; border-top: 1px solid var(--stroke-divider); }
.dtg__cap { font-size: var(--text-caption); line-height: var(--text-caption-lh); font-weight: var(--fw-medium); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.02em; }
</style>
