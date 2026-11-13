<template>
  <div class="paging">
    <span class="paging__total">
      <span class="paging__total-label">Tổng số:</span>
      <strong class="paging__total-value">{{ total }}</strong>
    </span>
    <div class="paging__right">
      <span class="paging__label">Số dòng/trang</span>
      <AppCombobox class="paging__size" :clearable="false" :model-value="String(pageSize)"
        :options="pageSizeOptions.map(n => ({ value: String(n), label: String(n) }))"
        @update:model-value="onSize" />
      <!-- Basic: khoảng “1 - 10” + 4 nút · Advance (Figma Paging Type=Advance): bỏ khoảng, thêm dãy số trang giữa nút trước / sau -->
      <span v-if="type !== 'advance'" class="paging__range">{{ rangeStart }} - {{ rangeEnd }}</span>
      <div class="paging__nav" :class="{ 'paging__nav--advance': type === 'advance' }">
        <button class="btn-icon" :class="{ 'btn-icon--sm': type !== 'advance' }" aria-label="Trang đầu" v-tip="'Trang đầu'" :disabled="page <= 1" @click="$emit('update:page', 1)">
          <TIcon name="chevron-left-pipe" />
        </button>
        <button class="btn-icon" :class="{ 'btn-icon--sm': type !== 'advance' }" aria-label="Trang trước" v-tip="'Trang trước'" :disabled="page <= 1" @click="$emit('update:page', page - 1)">
          <TIcon name="chevron-left" />
        </button>
        <template v-if="type === 'advance'">
          <template v-for="n in nums" :key="n">
            <span v-if="typeof n === 'string'" class="paging-num paging-num--gap" aria-hidden="true">…</span>
            <button v-else type="button" class="paging-num" :class="{ 'paging-num--on': n === page }" :aria-current="n === page ? 'page' : undefined" :aria-label="`Trang ${n}`" @click="$emit('update:page', n)">{{ n }}</button>
          </template>
        </template>
        <button class="btn-icon" :class="{ 'btn-icon--sm': type !== 'advance' }" aria-label="Trang sau" v-tip="'Trang sau'" :disabled="page >= totalPages" @click="$emit('update:page', page + 1)">
          <TIcon name="chevron-right" />
        </button>
        <button class="btn-icon" :class="{ 'btn-icon--sm': type !== 'advance' }" aria-label="Trang cuối" v-tip="'Trang cuối'" :disabled="page >= totalPages" @click="$emit('update:page', totalPages)">
          <TIcon name="chevron-right-pipe" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TIcon from './TIcon.vue'
import AppCombobox from './AppCombobox.vue'
import { usePageSizePref } from '../utils/pageSizePref.js'
import { pageNumbers } from '../utils/pageNumbers.js'
import { vTip } from '../utils/tooltip.js'

const props = defineProps({
  total:           { type: Number, default: 0 },
  page:            { type: Number, default: 1 },
  pageSize:        { type: Number, default: 20 },
  pageSizeOptions: { type: Array,  default: () => [20, 50, 100] },
  /** 'basic' (mặc định — ngắn gọn: khoảng 1 - 10 + nút trước / sau) | 'advance' (dạng số: 1 … 5 6 7 … 20 — app cần xử lý / xuất khẩu lần lượt từng trang, VD Kế toán) */
  type:            { type: String, default: 'basic' },
})

const emit = defineEmits(['update:page', 'update:pageSize'])

// Nhớ số dòng/trang chọn gần nhất theo người dùng (utils/pageSizePref.js)
const saveSize = usePageSizePref(props, n => emit('update:pageSize', n))
function onSize(v) { emit('update:pageSize', +v); saveSize(+v) }

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const rangeStart = computed(() => props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1)
const rangeEnd   = computed(() => Math.min(props.page * props.pageSize, props.total))
const nums       = computed(() => pageNumbers(props.page, totalPages.value))
</script>

<style scoped>
.paging {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  height: var(--paging-h, 48px); padding: 0 var(--paging-px, 16px); flex-shrink: 0; box-sizing: border-box;   /* Figma: Paging KHÔNG có viền trên — dòng cuối bảng / dòng Tổng đã có viền dưới */
  background: var(--bg-white);   /* cùng nền trắng với dòng bảng */
  container-type: inline-size;   /* nút con co theo bề rộng thanh phân trang (@container bên dưới) */
}
.paging__total { display: inline-flex; align-items: baseline; gap: 4px; white-space: nowrap; flex-shrink: 0; }   /* “Tổng số: 10” — Vue bỏ khoảng trắng giữa 2 thẻ span nên cần gap */
.paging__total-label { font-size: var(--text-body); color: var(--text-secondary); font-weight: var(--fw-regular); }
.paging__total-value { font-size: var(--text-body); color: var(--text-primary);   font-weight: var(--fw-semibold); }
.paging__right  { display: flex; align-items: center; gap: 8px; min-width: 0; }
/* Bảng hẹp (VD đang mở panel Bộ lọc): ẩn nhãn “Số dòng/trang” trước, giữ tổng số + khoảng + nút trang trên 1 dòng */
@container (max-width: 520px) { .paging__label { display: none; } }
.paging__size   { width: 80px; }
.paging__label  { font-size: var(--text-body); color: var(--text-primary); white-space: nowrap; }
.paging__range  { font-size: var(--text-body); color: var(--text-primary); font-weight: var(--fw-semibold); white-space: nowrap; }
.paging__nav    { display: flex; align-items: center; gap: 2px; }
.paging__nav--advance { gap: 0; }   /* dạng số: nhóm nút liền nhau như Figma */
/* Dạng số trên thanh hẹp: bớt số trang — còn trang đầu / đang xem / cuối, rồi chỉ trang đang xem */
@container (max-width: 560px) { .paging__nav--advance .paging-num:not(.paging-num--on):not(.paging-num--gap):not(:nth-child(3)):not(:nth-last-child(3)) { display: none; } }
@container (max-width: 420px) { .paging__nav--advance .paging-num:not(.paging-num--on) { display: none; } }
/* Màn rất hẹp (điện thoại): bỏ nhãn “Số dòng/trang” (ô chọn vẫn còn) để thanh phân trang không tràn */
@media (max-width: 480px) { .paging { gap: 12px; } .paging__label { display: none; } }
</style>
