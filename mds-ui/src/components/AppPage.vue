<template>
  <!-- AppPage — KHUNG MÀN HÌNH chuẩn /ds/layout. Mọi màn (danh sách · thêm/sửa dạng page · chi tiết dạng page · tổng quan) dựng TRONG AppPage,
       app chỉ điền nội dung vào slot — ⛔ không tự viết hàng tiêu đề / lề trang / dải tab / chân Lưu-Hủy.
       Hàng tiêu đề: [← Quay lại] Tiêu đề [title-extra] ········ [actions: nút phụ → nút chính → ⋯ (More LUÔN ngoài cùng phải)]
       Slot bulk có nội dung (tick dòng) → thay cả hàng tiêu đề bằng BulkActionBar (chỉ dạng danh sách KHÔNG có tab). -->
  <div class="app-page" :class="[`app-page--${body}`, tabs?.length ? `app-page--tabs-${tabsStyle}` : null, { 'app-page--sub': back }]">
    <div v-if="tabs?.length && tabsStyle === 'top'" class="app-page__toptabs">
      <AppTabs :model-value="tab" :items="tabs" :baseline="false" :aria-label="tabsLabel" @update:model-value="v => emit('update:tab', v)" />
    </div>
    <div v-else class="app-page__top">
      <div class="app-page__head">
        <slot v-if="$slots.bulk && hasBulk" name="bulk" />
        <template v-else>
          <button v-if="back" type="button" class="btn-icon" v-tip="'Quay lại'" aria-label="Quay lại" @click="emit('back')"><TIcon name="arrow-left" /></button>
          <h2 class="app-page__title" :title="title">{{ title }}</h2>
          <slot name="title-extra" />
          <span class="app-page__spacer" />
          <div v-if="$slots.actions" class="app-page__actions"><slot name="actions" /></div>
        </template>
      </div>
      <div v-if="tabs?.length" class="app-page__tabs">
        <AppTabs :model-value="tab" :items="tabs" :baseline="tabsStyle !== 'white'" :aria-label="tabsLabel" @update:model-value="v => emit('update:tab', v)" />
      </div>
    </div>
    <div class="app-page__body"><slot /></div>
    <footer v-if="$slots.footer" class="app-page__footer"><slot name="footer" /></footer>
  </div>
</template>

<script setup>
import { computed, useSlots, Comment, Fragment } from 'vue'
import TIcon from './TIcon.vue'
import AppTabs from './AppTabs.vue'
import { vTip } from '../utils/tooltip.js'

defineProps({
  title:     { type: String, default: '' },
  /** Nút ← Quay lại trước tiêu đề (màn thêm / sửa / chi tiết dạng page) → emit('back') */
  back:      { type: Boolean, default: false },
  /** Tab phân hệ: [{ value, label, badge? }] — mỗi tab là đối tượng / layout KHÁC nhau. Chỉ lọc cùng một bảng → AppSegmented, không dùng tab */
  tabs:      { type: Array, default: null },
  tab:       { default: null },
  /** 'below' = tiêu đề + dải tab bên dưới · 'white' = cả vùng tiêu đề + tab nền trắng tràn 2 mép · 'top' = tab phân hệ con thay tiêu đề */
  tabsStyle: { type: String, default: 'below' },
  tabsLabel: { type: String, default: 'Phân hệ' },
  /** 'fill' = nội dung lấp đầy, bảng / panel tự cuộn bên trong (danh sách) · 'scroll' = cả vùng nội dung cuộn (form, chi tiết, tổng quan) */
  body:      { type: String, default: 'fill' },
})
const emit = defineEmits(['back', 'update:tab'])

/* Slot bulk chỉ thay tiêu đề khi thực sự có nội dung (VD <BulkActionBar v-if="selected.length">) */
const slots = useSlots()
const real = nodes => (nodes || []).some(n => n.type === Fragment ? real(n.children) : n.type !== Comment)
const hasBulk = computed(() => real(slots.bulk?.()))
</script>
