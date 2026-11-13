<template>
  <div class="pagination-bar">
    <!-- Sum area -->
    <div class="pagination-bar__sums">
      <div
        v-for="(sum, i) in displaySums" :key="i"
        class="pagination-bar__sum-item"
        :class="{ 'pagination-bar__sum-item--vertical': sumVertical }"
      >
        <span class="pagination-bar__sum-label">{{ sum.label }}</span>
        <span class="pagination-bar__sum-value">{{ sum.value }}</span>
      </div>
    </div>

    <!-- Pagination controls -->
    <div class="pagination-bar__controls">
      <span class="pagination-bar__label">Số dòng/trang</span>

      <AppCombobox
        :model-value="String(pageSize)"
        :options="pageSizeOptions.map(String)"
        style="width:80px"
        @update:model-value="onPageSizeChange"
      />

      <!-- Basic: khoảng “1 - 10” + 4 nút · Advance (Figma Paging Type=Advance): bỏ khoảng, thêm dãy số trang giữa nút trước / sau -->
      <span v-if="type !== 'advance'" class="pagination-bar__range">{{ rangeText }}</span>

      <div class="pagination-bar__nav" :class="{ 'paging__nav--advance': type === 'advance' }">
        <button class="pagination-bar__nav-btn" :disabled="currentPage <= 1" @click="go(1)" v-tip="'Trang đầu'" aria-label="Trang đầu">
          <TIcon name="chevron-left-pipe" />
        </button>
        <button class="pagination-bar__nav-btn" :disabled="currentPage <= 1" @click="go(currentPage - 1)" v-tip="'Trang trước'" aria-label="Trang trước">
          <TIcon name="chevron-left" />
        </button>
        <template v-if="type === 'advance'">
          <template v-for="n in nums" :key="n">
            <span v-if="typeof n === 'string'" class="paging-num paging-num--gap" aria-hidden="true">…</span>
            <button v-else type="button" class="paging-num" :class="{ 'paging-num--on': n === currentPage }" :aria-current="n === currentPage ? 'page' : undefined" :aria-label="`Trang ${n}`" @click="go(n)">{{ n }}</button>
          </template>
        </template>
        <button class="pagination-bar__nav-btn" :disabled="currentPage >= totalPages" @click="go(currentPage + 1)" v-tip="'Trang sau'" aria-label="Trang sau">
          <TIcon name="chevron-right" />
        </button>
        <button class="pagination-bar__nav-btn" :disabled="currentPage >= totalPages" @click="go(totalPages)" v-tip="'Trang cuối'" aria-label="Trang cuối">
          <TIcon name="chevron-right-pipe" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { vTip } from '../utils/tooltip.js'
import { computed } from 'vue'
import TIcon from './TIcon.vue'
import AppCombobox from './AppCombobox.vue'
import { usePageSizePref } from '../utils/pageSizePref.js'
import { pageNumbers } from '../utils/pageNumbers.js'

const props = defineProps({
  total:           { type: Number, default: 0 },
  pageSize:        { type: Number, default: 10 },
  currentPage:     { type: Number, default: 1 },
  pageSizeOptions: { type: Array,  default: () => [10, 20, 50, 100] },
  sums:            { type: Array,  default: () => [] }, // [{label, value}]
  sumVertical:     { type: Boolean, default: false },
  /** 'basic' (mặc định) | 'advance' — phân trang dạng số (Figma Paging Type=Advance) */
  type:            { type: String,  default: 'basic' },
})

const emit = defineEmits(['update:currentPage', 'update:pageSize'])

// Nhớ số dòng/trang chọn gần nhất theo người dùng (utils/pageSizePref.js)
const saveSize = usePageSizePref(props, n => { emit('update:pageSize', n); emit('update:currentPage', 1) })

// Mặc định hiện "Tổng số: N" giống TablePaging khi cha không truyền sums riêng
const displaySums = computed(() => props.sums.length ? props.sums : [{ label: 'Tổng số:', value: props.total }])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const nums = computed(() => pageNumbers(props.currentPage, totalPages.value))

const rangeText = computed(() => {
  const start = Math.min(props.total, (props.currentPage - 1) * props.pageSize + 1)
  const end   = Math.min(props.total, props.currentPage * props.pageSize)
  return props.total > 0 ? `${start} - ${end}` : '0 - 0'
})

function go(page) {
  const p = Math.max(1, Math.min(page, totalPages.value))
  if (p !== props.currentPage) emit('update:currentPage', p)
}

function onPageSizeChange(val) {
  const size = Number(val)
  if (size !== props.pageSize) {
    emit('update:pageSize', size)
    emit('update:currentPage', 1)
    saveSize(size)
  }
}
</script>
