<template>
  <div ref="rootEl" class="table-header" :class="{ 'table-header--compact': compact, 'table-header--bulk-compact': bulkCompact }">

    <!-- ── BULK ACTION MODE: đè lên toàn bộ nội dung header ── -->
    <template v-if="bulkAction">
      <div class="table-header__bulk">
        <!-- Search giữ nguyên vị trí bên trái -->
        <div v-if="search && !bulkCompact" class="ibox table-header__bulk-search">
          <TIcon name="search" class="ibox__icon" />
          <input
            ref="searchEl"
            class="ibox__native"
            :placeholder="searchPlaceholder"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            @keydown.esc="modelValue && clearSearch($event)"
          />
          <!-- Ô tìm kiếm: × hiện SẴN khi có chữ (tìm xong xóa nhanh để tìm điều kiện khác) — control khác không có × (quy chuẩn) -->
          <button v-if="modelValue" type="button" tabindex="-1" class="ibox__icon ibox__icon--clear ibox__search-clear" aria-label="Xóa tìm kiếm" @click="clearSearch"><TIcon name="x" /></button>
        </div>
        <!-- Action area: selected info + deselect + bulk buttons -->
        <div class="bulk-action">
          <!-- Chọn tất cả trên danh sách (quy chuẩn Data table): tick ô tiêu đề chỉ chọn trang đang xem → hiện “Chọn tất cả N trên bảng”;
               đã chọn tất cả → “Đã chọn tất cả N trên bảng” — Figma Bulk Action Table (6019:136351): Selected · Selected All Page · Selected All Table -->
          <span class="bulk-selected">
            <template v-if="allPagesSelected">Đã chọn tất cả <strong>{{ totalCount }}</strong> trên bảng</template>
            <template v-else>Đã chọn <strong>{{ selectedCount }}</strong></template>
          </span>
          <button class="bulk-deselect" @click="$emit('deselect-all')">Bỏ chọn</button>
          <button v-if="!allPagesSelected && pageAllSelected && totalCount > selectedCount" class="bulk-deselect bulk-select-all" @click="$emit('select-all-pages')">Chọn tất cả <strong>{{ totalCount }}</strong> trên bảng</button>
          <div class="bulk-buttons">
            <slot name="bulk-buttons" />
          </div>
        </div>
      </div>
    </template>

    <!-- ── NORMAL MODE ── -->
    <template v-else>
      <!-- Left: search + filter slots -->
      <div ref="leftEl" class="table-header__left">
        <!-- search-mode="ai" → ô Tìm kiếm thông minh (AI Searchbox, Figma 17455:70653); Enter / icon phân tích → @ai-search(câu hỏi).
             Chọn kiểu tìm kiếm do APP quyết định (VD tùy chọn “Tìm kiếm: Thường / Thông minh”), không có nút chuyển trong ô -->
        <AppAiSearchbox v-if="search && searchMode === 'ai'" class="table-header__search" :width="searchWidth" :placeholder="aiPlaceholder"
          :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" @submit="q => $emit('ai-search', q)"
          :parsed="aiParsed" :analyzing="aiAnalyzing" :results="aiResults" :loading="aiLoading" :results-panel="aiResultsPanel"
          @analyze="t => $emit('ai-analyze', t)" @clear="$emit('ai-clear')" @select="(it, g) => $emit('ai-select', it, g)" @more="(g, q) => $emit('ai-more', g, q)"
          :more-items="aiMoreItems" :more-total="aiMoreTotal" :more-loading="aiMoreLoading" />
        <div v-else-if="search" class="ibox table-header__search" :style="`width:${searchWidth}px`">
          <TIcon name="search" class="ibox__icon" />
          <input
            ref="searchEl"
            class="ibox__native"
            :placeholder="searchPlaceholder"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            @keydown.esc="modelValue && clearSearch($event)"
          />
          <!-- Ô tìm kiếm: × hiện SẴN khi có chữ (tìm xong xóa nhanh để tìm điều kiện khác) — control khác không có × (quy chuẩn) -->
          <button v-if="modelValue" type="button" tabindex="-1" class="ibox__icon ibox__icon--clear ibox__search-clear" aria-label="Xóa tìm kiếm" @click="clearSearch"><TIcon name="x" /></button>
        </div>
        <!-- Ô lọc bày sẵn: thanh đủ rộng thì nằm ngay đây; chật thì chuyển vào popover “Bộ lọc” của icon lọc (thanh luôn 1 dòng) -->
        <slot v-if="!compact" name="filters" />
      </div>

      <!-- Right: icon group + divider + main buttons -->
      <div class="table-header__right">
        <div class="table-header__icon-group">
          <BorderBeamButton v-if="!hideAi" class="btn-icon btn-icon--outline" v-tip="'Gợi ý AI'" aria-label="Gợi ý AI" @click="$emit('show-ai')">
            <TIcon name="sparkles" />
          </BorderBeamButton>
          <button v-if="!hideTools.includes('refresh')" class="btn-icon btn-icon--outline" v-tip="'Làm mới'" aria-label="Làm mới"        @click="$emit('refresh')">       <TIcon name="refresh" /></button>
          <!-- Ẩn / hiện thống kê phía trên bảng: đang hiện = xanh brand, đang ẩn = neutral -->
          <button v-if="chartsVisible !== null" class="btn-icon btn-icon--outline table-header__charts"
            :class="chartsVisible ? 'table-header__charts--on' : 'table-header__charts--off'"
            v-tip="chartsVisible ? 'Ẩn thống kê (để danh sách hiển thị nhiều hơn)' : 'Hiện thống kê'" :aria-label="chartsVisible ? 'Ẩn thống kê (để danh sách hiển thị nhiều hơn)' : 'Hiện thống kê'" @click="$emit('toggle-charts')">
            <TIcon name="chart-bar" />
          </button>
          <button v-if="!hideTools.includes('export')" class="btn-icon btn-icon--outline" v-tip="'Xuất file'" aria-label="Xuất file"       @click="$emit('export')">        <slot name="export-icon"><TIcon name="file-export" /></slot></button>
          <button v-if="!hideTools.includes('col-settings')" class="btn-icon btn-icon--outline" v-tip="'Thiết lập cột'" aria-label="Thiết lập cột"   @click="$emit('col-settings')">  <TIcon name="settings" /></button>
          <button v-if="!hideTools.includes('filter') || (compact && hasFilters)" ref="filterBtn" class="btn-icon btn-icon--outline table-header__filter" :class="{ 'table-header__filter--active': filterCount }"
            :aria-expanded="filterOpen || popOpen ? 'true' : 'false'"
            v-tip="filterCount ? `Bộ lọc (${filterCount} điều kiện)` : 'Bộ lọc'" :aria-label="filterCount ? `Bộ lọc (${filterCount} điều kiện)` : 'Bộ lọc'" @click="onFilterClick">
            <TIcon name="filter" />
            <span v-if="filterCount" class="table-header__filter-count">{{ filterCount }}</span>
          </button>
        </div>
        <template v-if="mainFunctionButton">
          <div class="table-header__divider" />
          <div class="table-header__main-group">
            <slot name="main-buttons" />
          </div>
        </template>
      </div>
    </template>

    <!-- Popover “Bộ lọc” khi thanh chật (giống bộ lọc cơ bản): các ô lọc bày sẵn xếp dọc, đổi là áp dụng ngay -->
    <Teleport to="body">
      <div v-if="popOpen && compact" ref="popEl" class="thf" role="dialog" aria-label="Bộ lọc" :style="popPos">
        <div class="thf__head">
          <h3 class="thf__title">Bộ lọc</h3>
          <button type="button" class="icon-swap icon-swap--16 icon-swap--action" v-tip="'Đóng'" aria-label="Đóng bộ lọc" @click="popOpen = false"><TIcon name="x" /></button>
        </div>
        <div class="thf__fields"><slot name="filters" /></div>
        <button v-if="!hideTools.includes('filter')" type="button" class="btn btn--text thf__more" @click="popOpen = false; $emit('open-filter', filterBtn)"><TIcon name="filter" />Bộ lọc khác</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, useSlots } from 'vue'
import { vTip } from '../utils/tooltip.js'
import TIcon from './TIcon.vue'
import BorderBeamButton from './BorderBeamButton.vue'
import AppAiSearchbox from './AppAiSearchbox.vue'

const props = defineProps({
  modelValue:         { type: String,  default: '' },
  searchPlaceholder:  { type: String,  default: 'Tìm kiếm...' },
  searchWidth:        { type: Number,  default: 240 },
  search:             { type: Boolean, default: true },
  mainFunctionButton: { type: Boolean, default: false },
  bulkAction:         { type: Boolean, default: false },
  selectedCount:      { type: Number,  default: 0 },
  /** Tổng số bản ghi của danh sách (mọi trang, sau khi lọc) — cần để hiện “Chọn tất cả trên DS” */
  totalCount:         { type: Number,  default: 0 },
  /** Đã tick hết các dòng của trang đang xem */
  pageAllSelected:    { type: Boolean, default: false },
  /** Đang chọn tất cả bản ghi trên mọi trang */
  allPagesSelected:   { type: Boolean, default: false },
  /** Ẩn nút "Gợi ý AI" (app chưa có tính năng AI) */
  hideAi:             { type: Boolean, default: false },
  /** Số điều kiện lọc nâng cao đang áp dụng → badge trên nút Bộ lọc */
  filterCount:        { type: Number,  default: 0 },
  /** Bộ lọc (popover / panel) đang mở → nút lọc hiện Brand Outline */
  filterOpen:         { type: Boolean, default: false },
  /** Có hàng thống kê phía trên bảng → nút ẩn / hiện (true = đang hiện, false = đang ẩn, null = không có nút) */
  chartsVisible:      { type: Boolean, default: null },
  /** Kiểu ô tìm kiếm: 'normal' (Tìm kiếm thường) | 'ai' (Tìm kiếm thông minh — AI Searchbox; Enter → @ai-search(câu hỏi)) */
  searchMode:         { type: String,  default: 'normal' },
  aiPlaceholder:      { type: String,  default: 'Tìm kiếm thông minh' },
  /** Điều kiện AI bóc tách (popup khi bấm icon phân tích): [{ label: 'Trạng thái', value: 'Chưa ghi sổ' }, …] — app đặt sau khi nhận @ai-analyze(câu) */
  aiParsed:           { type: Array,   default: () => [] },
  aiAnalyzing:        { type: Boolean, default: false },
  /** Kết quả tìm kiếm thông minh theo nhóm — popover “Kết quả tìm kiếm với AI” như ô ở /ds/search-box: [{ key, title, total, items: [{ id, name, subtitle, meta, avatar }] }] (null = chưa tìm) */
  aiResults:          { type: Array,   default: null },
  aiLoading:          { type: Boolean, default: false },
  /** Popup “Xem thêm” của 1 nhóm kết quả: toàn bộ kết quả của nhóm đó (null = đang nạp) — app nạp khi nhận @ai-more(group, câu) */
  aiMoreItems:        { type: Array,   default: null },
  aiMoreTotal:        { type: Number,  default: null },
  aiMoreLoading:      { type: Boolean, default: false },
  /** true (mặc định): Enter → popover kết quả theo nhóm · false: Enter chỉ emit @ai-search, app tự lọc chính bảng (không popover) */
  aiResultsPanel:     { type: Boolean, default: true },
  /** Ẩn nút công cụ không dùng: 'refresh' | 'export' | 'col-settings' | 'filter' */
  hideTools:          { type: Array,   default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'show-ai', 'refresh', 'toggle-charts', 'export', 'col-settings', 'open-filter', 'deselect-all', 'select-all-pages', 'ai-search', 'ai-analyze', 'ai-clear', 'ai-select', 'ai-more'])
const searchEl = ref(null)
/** Xóa ô tìm kiếm (nút × / Esc) — con trỏ ở lại ô để gõ điều kiện khác */
function clearSearch(e) { e?.stopPropagation?.(); emit('update:modelValue', ''); searchEl.value?.focus() }

/* ── Thanh luôn 1 dòng ──
   Thường: ô tìm kiếm co trước (tối thiểu ~120px); vẫn không đủ chỗ → ẩn ô lọc bày sẵn, gom vào popover “Bộ lọc” của icon lọc (compact).
   Rộng ra đủ chỗ như lúc chưa gom → bày lại. Chọn hàng loạt: chật thì ẩn ô tìm kiếm (bulkCompact); nút hàng loạt dùng OverflowActions để tự gom vào “⋯”. */
const slots = useSlots()
const hasFilters = computed(() => !!slots.filters)
const rootEl = ref(null), leftEl = ref(null), filterBtn = ref(null), popEl = ref(null)
const compact = ref(false), bulkCompact = ref(false), popOpen = ref(false), popPos = ref({})
let needFull = 0, needBulk = 0, ro = null
const overflowing = () => { const r = rootEl.value, l = leftEl.value; return !!r && (r.scrollWidth > r.clientWidth + 1 || (!!l && l.scrollWidth > l.clientWidth + 1)) }
async function fit() {
  const r = rootEl.value; if (!r) return
  const w = r.clientWidth
  if (props.bulkAction) {
    if (!bulkCompact.value && overflowing()) { needBulk = r.scrollWidth; bulkCompact.value = true }
    else if (bulkCompact.value && w >= needBulk) { bulkCompact.value = false; await nextTick(); if (overflowing()) bulkCompact.value = true }
    return
  }
  if (!hasFilters.value) { compact.value = false; return }
  if (!compact.value && overflowing()) { needFull = r.scrollWidth; compact.value = true }
  else if (compact.value && w >= needFull) { compact.value = false; popOpen.value = false; await nextTick(); if (overflowing()) compact.value = true }
}
watch(() => props.bulkAction, () => nextTick(fit))
function onFilterClick(e) {
  if (compact.value && hasFilters.value) { popOpen.value = !popOpen.value; return }
  emit('open-filter', e.currentTarget)
}
watch(popOpen, async v => {
  if (!v) return
  await nextTick()
  const b = filterBtn.value?.getBoundingClientRect(); if (!b) return
  const w = Math.min(320, window.innerWidth - 16)
  popPos.value = { top: b.bottom + 4 + 'px', left: Math.max(8, Math.min(b.right - w, window.innerWidth - w - 8)) + 'px', width: w + 'px' }
})
const onDoc = e => { if (popOpen.value && !popEl.value?.contains(e.target) && !filterBtn.value?.contains(e.target) && !e.target.closest?.('.cb-list, .app-cb__list, .dropdown-menu, .dp-pop, .datepicker')) popOpen.value = false }
const onEsc = e => { if (e.key === 'Escape' && popOpen.value) popOpen.value = false }
onMounted(() => {
  ro = new ResizeObserver(() => fit()); ro.observe(rootEl.value); if (leftEl.value) ro.observe(leftEl.value)
  document.addEventListener('mousedown', onDoc, true); document.addEventListener('keydown', onEsc)
  nextTick(fit)
})
onBeforeUnmount(() => { ro?.disconnect(); document.removeEventListener('mousedown', onDoc, true); document.removeEventListener('keydown', onEsc) })
</script>

<style scoped>
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;   /* luôn 1 dòng — chật thì co ô tìm kiếm, rồi gom ô lọc vào icon lọc (xem fit() trong script) */
  gap: 8px;
  padding: 8px 12px;   /* trái = phải 12px */
  background: var(--bg-white);
  flex-shrink: 0;
}

/* ── Normal mode ── */
.table-header__left {
  display: flex; align-items: center; gap: 8px; flex: 1 1 auto; min-width: 0;   /* tràn → fit() đo scrollWidth rồi gom ô lọc vào popover — KHÔNG overflow:hidden (cắt mất quầng sáng focus 3px của ô nhập) */
}
.table-header__left > :deep(*) { flex-shrink: 0; }   /* ô lọc giữ bề rộng — không bóp méo */
/* Ô tìm kiếm: bề rộng đặt (search-width) là tối đa — thanh hẹp thì co lại trước khi phải gom ô lọc */
.table-header__left > .table-header__search { flex: 0 1 auto; min-width: 120px; max-width: 100%; }
.table-header__search .ibox__native { min-width: 0; }
.table-header__right {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
.table-header__icon-group {
  display: flex; align-items: center; gap: 8px;
}
.table-header__filter { position: relative; }
.table-header__charts--on  { color: var(--icon-brand); }
.table-header__charts--off { color: var(--icon-neutral); }   /* đang ẩn: màu neutral như các icon khác */
.table-header__filter--active { border-color: var(--stroke-brand); color: var(--icon-brand); background: var(--bg-brand-light); }
.table-header__filter-count {
  position: absolute; top: -6px; right: -6px;
  min-width: 16px; height: 16px; padding: 0 4px; border-radius: var(--radius-pill);
  background: var(--bg-brand); color: var(--text-white);
  font-size: 10px; font-weight: var(--fw-bold); line-height: 16px; text-align: center;
}
/* Nút "Gợi ý AI" dùng component dùng chung <BorderBeamButton> — style xem ở .btn--border-beam trong style.css */
.table-header__divider {
  width: 1px; height: 20px; background: var(--stroke-neutral-light); flex-shrink: 0;
}
.table-header__main-group {
  display: flex; align-items: center; gap: 8px;
}

/* ── Bulk action mode ── */
.table-header__bulk {
  display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0;
}
.table-header__bulk-search { width: 200px; flex: 0 1 200px; min-width: 120px; }   /* chật: co, rồi ẩn hẳn (bulkCompact) */
.bulk-action {
  display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0; white-space: nowrap;
}
.table-header--bulk-compact .bulk-action { gap: 12px; }
.bulk-selected {
  font-size: var(--text-body); color: var(--text-primary); display: flex; gap: 4px; align-items: center; flex-shrink: 0;
}
.bulk-selected strong, .bulk-select-all strong { font-weight: var(--fw-bold); }   /* Figma: số đếm Bold */
.bulk-deselect {
  background: none; border: none; padding: 0; cursor: pointer;
  font-size: var(--text-body); color: var(--text-link); flex-shrink: 0;
}
.bulk-select-all { display: inline-flex; gap: 4px; align-items: baseline; }
.bulk-deselect:hover { text-decoration: underline; }
.bulk-buttons {
  display: flex; align-items: center; gap: 8px; flex: 1 1 auto; min-width: 0;   /* chiếm phần còn lại → OverflowActions đo được chỗ trống */
}
/* Popover “Bộ lọc” khi thanh chật — cùng kiểu bộ lọc cơ bản (TableFilterPopover): 320px, bo 8, đầu “Bộ lọc” + ✕, ô lọc xếp dọc đầy chiều ngang */
.thf { position: fixed; z-index: 9500; max-width: calc(100vw - 16px); max-height: calc(100vh - 16px); overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding: 12px; box-sizing: border-box;
  background: var(--bg-white); border-radius: var(--radius-default); box-shadow: var(--shadow-popover); }
.thf__head { display: flex; align-items: center; gap: 8px; height: 32px; padding: 0 8px; }
.thf__title { flex: 1; min-width: 0; margin: 0; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.thf__fields { display: flex; flex-direction: column; gap: 12px; padding: 8px; }
.thf__fields > :deep(*) { width: 100% !important; max-width: none !important; }
.thf__more { align-self: flex-start; margin: 0 8px; }
</style>
