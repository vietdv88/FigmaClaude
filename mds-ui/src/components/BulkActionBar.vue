<template>
  <!-- Thanh thao tác hàng loạt đặt THAY tiêu đề trang (danh sách chỉ có tiêu đề bên trái): tick dòng → che tiêu đề, ẩn Thêm / Nhập khẩu bên phải;
       thanh công cụ của bảng giữ nguyên. Nội dung như thanh hàng loạt trong TableHeader (Figma Bulk Action Table 6019:136351):
       “Đã chọn N · Bỏ chọn · Chọn tất cả N trên bảng” + nút thao tác (dùng OverflowActions để tự gom vào “⋯” khi chật) -->
  <div class="bulk-bar" role="toolbar" aria-label="Thao tác hàng loạt">
    <span class="bulk-bar__count">
      <template v-if="allPagesSelected">Đã chọn tất cả <strong>{{ totalCount }}</strong> trên bảng</template>
      <template v-else>Đã chọn <strong>{{ selectedCount }}</strong></template>
    </span>
    <button type="button" class="bulk-bar__link" @click="$emit('deselect-all')">Bỏ chọn</button>
    <button v-if="!allPagesSelected && pageAllSelected && totalCount > selectedCount" type="button" class="bulk-bar__link" @click="$emit('select-all-pages')">Chọn tất cả <strong>{{ totalCount }}</strong> trên bảng</button>
    <div class="bulk-bar__buttons"><slot /></div>
  </div>
</template>

<script setup>
defineProps({
  selectedCount:    { type: Number,  default: 0 },
  /** Tổng số bản ghi của danh sách (mọi trang) — để hiện “Chọn tất cả N trên bảng” */
  totalCount:       { type: Number,  default: 0 },
  /** Đã tick hết các dòng của trang đang xem */
  pageAllSelected:  { type: Boolean, default: false },
  /** Đang chọn tất cả bản ghi trên mọi trang */
  allPagesSelected: { type: Boolean, default: false },
})
defineEmits(['deselect-all', 'select-all-pages'])
</script>

<style scoped>
.bulk-bar { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0; min-height: var(--btn-height); white-space: nowrap; }
.bulk-bar__count { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; font-size: var(--text-body); color: var(--text-primary); }
.bulk-bar__count strong, .bulk-bar__link strong { font-weight: var(--fw-bold); }   /* Figma: số đếm Bold */
.bulk-bar__link { display: inline-flex; align-items: baseline; gap: 4px; flex-shrink: 0; padding: 0; border: none; background: none; cursor: pointer; font: inherit; font-size: var(--text-body); color: var(--text-link); }
.bulk-bar__link:hover { text-decoration: underline; }
.bulk-bar__link:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: 2px; border-radius: var(--radius-sm, 4px); }
.bulk-bar__buttons { display: flex; align-items: center; gap: var(--gap-control); flex: 1; min-width: 0; }   /* phần còn lại → OverflowActions đo được chỗ trống */
</style>
