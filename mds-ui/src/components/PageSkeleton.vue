<template>
  <!-- Khung xương khi chờ tải trang / dữ liệu — CHỈ phủ vùng nội dung (cha position: relative), header + sidebar giữ nguyên.
       variant 'list' (mặc định): tiêu đề · dãy card KPI · bảng
       variant 'dashboard': giống màn Tổng quan — tiêu đề + ô chọn giao diện · bộ lọc kỳ + nút bên phải · 4 card KPI (chữ + ô icon) · lưới biểu đồ 3 cột (2/3 + 1/3 …) -->
  <div class="page-skeleton" :class="{ 'page-skeleton--dashboard': variant === 'dashboard' }" aria-busy="true" aria-label="Đang tải">
    <template v-if="variant === 'dashboard'">
      <div class="page-skeleton__head">
        <span class="skel skel--title page-skeleton__htitle" /><span class="skel skel--field" />
        <span class="skel skel--field page-skeleton__push" /><span class="skel skel--btn page-skeleton__nopush" />
      </div>
      <div class="page-skeleton__cards">
        <div v-for="i in cards" :key="i" class="page-skeleton__card page-skeleton__card--kpi">
          <div class="page-skeleton__kpi"><span class="skel skel--sm" /><span class="skel skel--num" /><span class="skel skel--xs" /></div>
          <span class="skel skel--icon" />
        </div>
      </div>
      <div class="page-skeleton__grid">
        <div v-for="(w, i) in WIDGETS" :key="i" class="page-skeleton__widget" :class="`page-skeleton__widget--${w.span}`">
          <span class="skel skel--h3" />
          <!-- cột -->
          <div v-if="w.kind === 'bars'" class="page-skeleton__bars"><span v-for="(h, j) in BARS" :key="j" class="skel" :style="{ height: h + '%' }" /></div>
          <!-- donut + chú thích -->
          <div v-else-if="w.kind === 'donut'" class="page-skeleton__donut"><span class="skel skel--donut" /><div class="page-skeleton__legend"><span v-for="j in 4" :key="j" class="skel" /></div></div>
          <!-- thanh ngang -->
          <div v-else class="page-skeleton__hbars"><span v-for="(h, j) in HBARS" :key="j" class="page-skeleton__hbar"><span class="skel skel--label" /><span class="skel" :style="{ width: h + '%' }" /></span></div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="page-skeleton__head"><span class="skel skel--title" /></div>
      <div v-if="cards" class="page-skeleton__cards">
        <div v-for="i in cards" :key="i" class="page-skeleton__card">
          <span class="skel skel--sm" /><span class="skel skel--num" /><span class="skel skel--xs" />
        </div>
      </div>
      <div class="page-skeleton__table">
        <div class="page-skeleton__toolbar"><span class="skel skel--search" /><span class="skel skel--btn" /></div>
        <div v-for="i in rows" :key="i" class="page-skeleton__row">
          <span class="skel skel--avatar" />
          <span class="skel" :style="{ width: `${30 + ((i * 37) % 35)}%` }" />
          <span class="skel skel--cell" />
          <span class="skel skel--cell" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  /** 'list' (trang danh sách) | 'dashboard' (màn Tổng quan) */
  variant: { type: String, default: 'list' },
  cards: { type: Number, default: 4 },   // 0 = không có dãy card
  rows:  { type: Number, default: 8 },
})
const WIDGETS = [{ span: 2, kind: 'bars' }, { span: 1, kind: 'donut' }, { span: 1, kind: 'hbars' }, { span: 2, kind: 'bars' }]
const BARS = [45, 60, 52, 75, 68, 88, 70, 92, 64, 80, 86, 100]
const HBARS = [100, 86, 40, 26, 18]
</script>
