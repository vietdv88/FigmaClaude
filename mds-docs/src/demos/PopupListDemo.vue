<template>
  <div class="demo-stack">
    <!-- Popup chứa danh sách (quy chuẩn /ds/popup › Popup chứa danh sách): khung bảng giãn HẾT chiều cao còn lại của popup, phân trang ghim đáy khung bảng.
         Đổi số dòng để thấy phân trang luôn đứng yên; chọn “Sai” để so sánh lỗi hay gặp (bảng co theo số dòng, phân trang nổi giữa popup). -->
    <div class="demo-row pl-opts" data-dsi-ignore>
      <span class="demo-muted">Dữ liệu:</span>
      <AppSegmented v-model="mode" :options="MODES" aria-label="Số dòng dữ liệu" />
      <span class="demo-muted">Cách vẽ:</span>
      <AppSegmented v-model="right" :options="WAYS" aria-label="Cách vẽ" />
    </div>
    <span v-if="!right" class="demo-muted pl-warn"><TIcon name="alert-triangle" />Sai quy chuẩn: khung bảng co theo số dòng → phân trang nổi giữa popup, bên dưới trống tới footer.</span>

    <div class="pl-frame">
      <AppFormPanel title="Chọn nhân viên" class="pl-popup" :tab-fields-only="false">
        <template #header-end>
          <button type="button" class="btn-icon" aria-label="Phóng to" v-tip="'Phóng to'"><TIcon name="maximize" /></button>
          <button type="button" class="btn-icon" aria-label="Đóng (Esc)" v-tip="'Đóng (Esc)'"><TIcon name="x" /></button>
        </template>
        <div class="pl-body">
          <div class="pl-filters">
            <AppSearchbox v-model="q" placeholder="Tìm kiếm" class="pl-search" />
            <AppCombobox v-model="pos" :options="POSITIONS" placeholder="Tất cả vị trí" class="pl-combo" />
            <AppCombobox v-model="unit" :options="UNITS" placeholder="Tất cả đơn vị" class="pl-combo" />
          </div>
          <!-- ĐÚNG: .table-panel--fill giãn hết phần còn lại → phân trang ghim đáy, ít dòng thì khoảng trống nằm TRONG bảng -->
          <div class="table-panel table-panel--bordered pl-table" :class="right && 'table-panel--fill'">
            <div class="table-scroll">
              <DataTable :columns="COLS" :rows="paged" :selected="selected" :hide-blank-rows="false" @update:selected="v => (selected = v)" />
              <div v-if="!filtered.length" class="pl-empty">
                <EmptyArt variant="search" :width="96" />
                <p class="pl-empty__title">Không tìm thấy nhân viên</p>
                <p class="demo-muted">Thử từ khóa khác hoặc bỏ bớt điều kiện lọc.</p>
              </div>
            </div>
            <TablePaging :total="filtered.length" v-model:page="page" v-model:page-size="pageSize" :page-size-options="[10, 20, 50]" />
          </div>
        </div>
        <template #footer>
          <button type="button" class="btn btn--outline btn--neutral">Hủy</button>
          <button type="button" class="btn btn--primary">Đồng ý<template v-if="selected.length"> ({{ selected.length }})</template></button>
        </template>
      </AppFormPanel>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppFormPanel from '@mds/components/AppFormPanel.vue'
import AppSegmented from '@mds/components/AppSegmented.vue'
import AppSearchbox from '@mds/components/AppSearchbox.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import DataTable from '@mds/components/DataTable.vue'
import TablePaging from '@mds/components/TablePaging.vue'
import EmptyArt from '@mds/components/EmptyArt.vue'
import { vTip } from '@mds/utils/tooltip.js'

const MODES = [{ value: 'few', label: '1 dòng' }, { value: 'many', label: '25 dòng' }, { value: 'none', label: 'Không có dữ liệu' }]
const WAYS = [{ value: true, label: 'Đúng quy chuẩn' }, { value: false, label: 'Sai — bảng co theo dòng' }]
const POSITIONS = ['Nhân viên kinh doanh', 'Kế toán viên', 'Chuyên viên nhân sự', 'Nhân viên lập kế hoạch sản xuất'].map(v => ({ value: v, label: v }))
const UNITS = ['Phòng Kinh doanh', 'Phòng Kế toán', 'Phòng Nhân sự', 'Phòng Triển khai & Hỗ trợ'].map(v => ({ value: v, label: v }))
const FIRST = ['Ngô Thế Anh', 'Nguyễn Thu Hà', 'Trần Minh Quân', 'Lê Hoàng Yến', 'Phạm Đức Anh', 'Vũ Ngọc Ánh', 'Đỗ Hải Nam', 'Bùi Thanh Tâm', 'Hoàng Mai Linh', 'Đặng Quốc Bảo']
const ALL = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1, code: `NV-${String(145 + i).padStart(5, '0')}`, name: { text: FIRST[i % FIRST.length] + (i >= FIRST.length ? ` ${Math.floor(i / FIRST.length) + 1}` : '') },
  position: POSITIONS[i % 4].label, unit: UNITS[(i + 1) % 4].label,
}))
const COLS = [
  { key: 'checkbox', type: 'checkbox', width: 40 },
  { key: 'code', label: 'Mã nhân viên', width: 130 },
  { key: 'name', label: 'Họ và tên', type: 'avatar-text', minWidth: 180 },
  { key: 'position', label: 'Vị trí công việc', minWidth: 200 },
  { key: 'unit', label: 'Đơn vị công tác', minWidth: 180 },
]
const mode = ref('few'), right = ref(true), q = ref(''), pos = ref(null), unit = ref(null)
const page = ref(1), pageSize = ref(10), selected = ref([1])
const source = computed(() => (mode.value === 'none' ? [] : mode.value === 'few' ? ALL.slice(0, 1) : ALL))
const filtered = computed(() => source.value.filter(r =>
  (!q.value || (r.name.text + r.code).toLowerCase().includes(q.value.toLowerCase())) && (!pos.value || r.position === pos.value) && (!unit.value || r.unit === unit.value)))
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
watch([mode, q, pos, unit, pageSize], () => { page.value = 1 })
</script>

<style scoped>
.pl-opts { flex-wrap: wrap; }
.pl-warn { display: inline-flex; align-items: center; gap: 6px; color: var(--text-danger); }
.pl-warn .ti { font-size: 16px; }
/* Khung đặt popup: chiều cao CỐ ĐỊNH theo cỡ popup (không co giãn theo số dòng) */
.pl-frame { height: 600px; max-width: 920px; padding: 24px; box-sizing: border-box; border-radius: var(--radius-default); background: var(--alpha-black-400, rgba(0, 0, 0, .4)); }
.pl-popup { height: 100%; border-radius: var(--radius-dialog); box-shadow: var(--shadow-dialog); }
.pl-popup :deep(.form-body) { display: flex; flex-direction: column; overflow: hidden; }   /* thân popup: flex cột → khung bảng giãn phần còn lại */
.pl-body { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 12px; }
.pl-filters { display: flex; gap: var(--gap-control); flex-wrap: wrap; }
.pl-search { flex: 1 1 200px; min-width: 0; }
.pl-combo { flex: 1 1 150px; min-width: 0; }
/* Bảng trong popup = trắng trên trắng → .table-panel--bordered (viền 1px Stroke/Neutral, KHÔNG bóng) */
.pl-table { position: relative; }
.pl-table:not(.table-panel--fill) { flex: none; }   /* minh họa SAI: khung co theo số dòng */
.pl-empty { position: absolute; inset: 40px 0 var(--paging-h, 48px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-align: center; pointer-events: none; }
.pl-empty p { margin: 0; }
.pl-empty__title { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
@media (max-width: 640px) { .pl-frame { padding: 8px; height: 560px; } }
</style>
