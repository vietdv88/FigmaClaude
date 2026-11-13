<template>
  <div class="demo-stack">
  <!-- Sân khấu như màn danh sách của app: nền BG Page, bảng + panel Bộ lọc Advance là 2 khối cạnh nhau (list-split) -->
  <div class="demo-dt-stage" :class="{ 'demo-dt-stage--full': full }">
    <!-- 2 kiểu bộ lọc của bảng (Figma): Cơ bản = popover ngay dưới nút lọc · Advance = panel bên phải, đẩy bảng hẹp lại -->
    <!-- Tùy chọn của ví dụ: chia 3 khối có tiêu đề (Thanh công cụ · Bảng · Phân trang), nhãn nằm trên nút chọn — dễ phân biệt từng vùng -->
    <div class="demo-dt-opts">
      <!-- Loại bảng mẫu: Danh sách chứng từ (bảng chuẩn đầy đủ tính năng) · Bảng lương (header gộp ô: nhóm cột + vạch ngăn nét liền) -->
      <section class="demo-dt-opts__group" aria-label="Loại bảng">
        <h4 class="demo-dt-opts__title">Loại bảng</h4>
        <div class="demo-dt-opts__row">
          <div class="demo-dt-opt">
            <span class="demo-dt-opt__label">Ví dụ</span>
            <div class="seg" role="group" aria-label="Loại bảng mẫu">
              <button v-for="x in TABLE_KINDS" :key="x.id" type="button" class="seg__item" :class="{ 'seg__item--active': tableKind === x.id }" :aria-pressed="tableKind === x.id" @click="tableKind = x.id">{{ x.label }}</button>
            </div>
          </div>
        </div>
      </section>
      <section v-if="tableKind === 'list'" class="demo-dt-opts__group" aria-label="Thanh công cụ">
        <h4 class="demo-dt-opts__title">Thanh công cụ</h4>
        <div class="demo-dt-opts__row">
          <div class="demo-dt-opt">
            <span class="demo-dt-opt__label">Tìm kiếm</span>
            <div class="seg" role="group" aria-label="Kiểu tìm kiếm">
              <button v-for="x in SEARCH_MODES" :key="x.id" type="button" class="seg__item" :class="{ 'seg__item--active': searchMode === x.id }" :aria-pressed="searchMode === x.id" @click="searchMode = x.id">{{ x.label }}</button>
            </div>
          </div>
          <div class="demo-dt-opt">
            <span class="demo-dt-opt__label">Bộ lọc</span>
            <div class="seg" role="group" aria-label="Kiểu bộ lọc">
              <button v-for="x in FILTER_KINDS" :key="x.id" type="button" class="seg__item" :class="{ 'seg__item--active': filterKind === x.id }" :aria-pressed="filterKind === x.id" @click="switchKind(x.id)">{{ x.label }}</button>
            </div>
          </div>
          <div v-if="filterKind === 'basic'" class="demo-dt-opt">
            <span class="demo-dt-opt__label">Bố cục bộ lọc</span>
            <div class="seg" role="group" aria-label="Bố cục bộ lọc cơ bản">
              <button v-for="x in LAYOUTS" :key="x.id" type="button" class="seg__item" :class="{ 'seg__item--active': basicLayout === x.id }" :aria-pressed="basicLayout === x.id" @click="basicLayout = x.id">{{ x.label }}</button>
            </div>
          </div>
        </div>
      </section>
      <section class="demo-dt-opts__group" aria-label="Bảng">
        <h4 class="demo-dt-opts__title">Bảng</h4>
        <div class="demo-dt-opts__row">
          <!-- Bảng trong card: ẩn được thanh công cụ + ô tìm kiếm phía trên bảng (bảng ít dòng / chỉ để xem) -->
          <div v-if="tableKind === 'card'" class="demo-dt-opt">
            <span class="demo-dt-opt__label">Số dòng dữ liệu</span>
            <div class="seg" role="group" aria-label="Lượng dữ liệu của bảng trong card">
              <button v-for="x in CARD_DATA" :key="x.id" type="button" class="seg__item" :class="{ 'seg__item--active': cardData === x.id }" :aria-pressed="cardData === x.id" @click="cardData = x.id">{{ x.label }}</button>
            </div>
          </div>
          <div v-if="tableKind === 'card'" class="demo-dt-opt">
            <span class="demo-dt-opt__label">Thanh công cụ</span>
            <div class="seg" role="group" aria-label="Thanh công cụ và tìm kiếm phía trên bảng">
              <button v-for="x in CARD_TOOLBAR" :key="x.id" type="button" class="seg__item" :class="{ 'seg__item--active': cardToolbar === x.on }" :aria-pressed="cardToolbar === x.on" @click="cardToolbar = x.on">{{ x.label }}</button>
            </div>
          </div>
          <div v-if="tableKind === 'list'" class="demo-dt-opt">
            <span class="demo-dt-opt__label">Thao tác dòng</span>
            <div class="seg" role="group" aria-label="Cách hiện thao tác dòng">
              <button v-for="x in ACTION_MODES" :key="x.id" type="button" class="seg__item" :class="{ 'seg__item--active': actionMode === x.id }" :aria-pressed="actionMode === x.id" @click="actionMode = x.id">{{ x.label }}</button>
            </div>
          </div>
          <div class="demo-dt-opt">
            <span class="demo-dt-opt__label">Vạch ngăn cột</span>
            <div class="seg" role="group" aria-label="Vạch ngăn cột">
              <button v-for="x in COL_LINES" :key="x.id" type="button" class="seg__item" :class="{ 'seg__item--active': lineMode === x.id }" :aria-pressed="lineMode === x.id" @click="lineMode = x.id">{{ x.label }}</button>
            </div>
          </div>
        </div>
      </section>
      <section v-if="tableKind === 'list'" class="demo-dt-opts__group" aria-label="Phân trang">
        <h4 class="demo-dt-opts__title">Phân trang</h4>
        <div class="demo-dt-opts__row">
          <div class="demo-dt-opt">
            <span class="demo-dt-opt__label">Kiểu</span>
            <div class="seg" role="group" aria-label="Loại phân trang">
              <button v-for="x in PAGING_TYPES" :key="x.id" type="button" class="seg__item" :class="{ 'seg__item--active': pagingType === x.id }" :aria-pressed="pagingType === x.id" @click="pagingType = x.id">{{ x.label }}</button>
            </div>
          </div>
        </div>
      </section>
      <button type="button" class="btn btn--sm btn--text-neutral demo-dt-opts__full" @click="full = !full"><TIcon :name="full ? 'minimize' : 'maximize'" />{{ full ? 'Thu nhỏ (Esc)' : 'Xem toàn màn hình' }}</button>
    </div>
  <!-- BẢNG LƯƠNG: header gộp ô — cột khai báo `group` → ô nhóm phía trên (Lương chuẩn · Phụ cấp · Làm thêm · Khấu trừ); cột không nhóm: tiêu đề cao 2 hàng; vạch ngăn cột nét liền (column-line-style="solid") -->
  <div v-if="tableKind === 'payroll'" class="demo-dt-split">
  <div class="table-panel demo-table demo-dt-table">
    <TableHeader v-model="payQ" search-placeholder="Tìm theo tên, mã" :search-width="220" :hide-ai="true" :hide-tools="['col-settings', 'filter']" :total-count="payFiltered.length"
      @refresh="payQ = ''" @export="toast.info('Ví dụ: xuất bảng lương')" />
    <div class="demo-table__body">
    <div class="table-scroll">
      <DataTable :columns="PAY_COLS" :rows="payPaged" :hide-blank-rows="false" show-footer :column-lines="lineMode !== 'none'" :column-line-style="lineMode === 'solid' ? 'solid' : 'dotted'" />
    </div>
    </div>
    <TablePaging :total="payFiltered.length" v-model:page="payPage" v-model:page-size="payPageSize" :page-size-options="[10, 20, 50]" />
  </div>
  </div>
  <!-- BẢNG TRONG CARD: bảng nằm TRONG 1 card trắng → card đệm 16 đều 4 phía như mọi card, nên bảng KHÔNG còn sát mép card: khung bảng có VIỀN 1px Stroke/Neutral + BO GÓC cả 4 góc
       (.table-panel--bordered — trắng trên trắng dùng viền, không bóng). Tiêu đề card H3 → khung bảng cách 12 (--card-gap). Toolbar / tiêu đề cột / phân trang nằm TRONG khung viền -->
  <div v-else-if="tableKind === 'card'" class="demo-dt-split demo-dt-split--card">
  <section class="card demo-dt-card">
    <h3 class="card__title demo-dt-card__title">Chứng từ thu tiền gần đây</h3>
    <div class="table-panel table-panel--bordered demo-dt-card__table">
      <TableHeader v-if="cardToolbar" v-model="q" search-placeholder="Tìm theo tên, mã" :search-width="220" :hide-ai="true" :hide-tools="['col-settings', 'filter']" :total-count="cardFiltered.length"
        @refresh="q = ''" @export="toast.info('Ví dụ: xuất khẩu danh sách')" />
      <div class="demo-table__body">
      <div class="table-scroll">
        <DataTable :columns="CARD_COLS" :rows="cardPaged" :hide-blank-rows="false" show-footer :column-lines="lineMode !== 'none'" :column-line-style="lineMode === 'solid' ? 'solid' : 'dotted'" />
      </div>
      </div>
      <TablePaging :total="cardFiltered.length" v-model:page="cardPage" v-model:page-size="cardPageSize" :page-size-options="[10, 20, 50]" />
    </div>
  </section>
  </div>
  <div v-else class="demo-dt-split">
  <div class="table-panel demo-table demo-dt-table">
    <!-- Công cụ: Xuất khẩu → Thiết lập (drawer Thiết lập bảng) → Bộ lọc (panel bên phải bảng) -->
    <TableHeader v-model="q" search-placeholder="Tìm theo tên, mã" :search-width="220" :hide-ai="true"
      :search-mode="searchMode" :ai-parsed="aiParsed" :ai-results="aiResults" :ai-more-items="aiMoreItems" :ai-more-total="aiMoreTotal" @ai-analyze="analyzeAi" @ai-search="runAi" @ai-clear="clearAi" @ai-select="aiSelect" @ai-more="aiMore"
      :bulk-action="selected.length > 0" :selected-count="selectedCount" :filter-count="filterKind === 'basic' ? basicCount : advCount" :filter-open="showFilter"
      :total-count="filtered.length" :page-all-selected="pageAllSelected" :all-pages-selected="allPages" @select-all-pages="selectAllPages"
      @deselect-all="deselectAll" @refresh="q = ''; adv = EMPTY(); basic = {}" @export="toast.info('Ví dụ: xuất khẩu danh sách')"
      @col-settings="showSettings = true" @open-filter="el => { filterAnchor = el; showFilter = !showFilter }">
      <!-- Nút hàng loạt tự co theo bề rộng: thiếu chỗ → gom vào “⋯” (OverflowActions) — thanh công cụ luôn 1 dòng -->
      <template #bulk-buttons>
        <OverflowActions :actions="BULK_ACTIONS" @select="onBulk" />
      </template>
      <template #filters>
        <AppCombobox v-model="status" class="demo-filter" :options="statusOptions" placeholder="Trạng thái: Tất cả" />
      </template>
      <template #main-buttons>
        <button class="btn btn--primary" @click="toast.info('Ví dụ: mở form thêm chứng từ')"><TIcon name="plus" />Thêm</button>
      </template>
    </TableHeader>
    <!-- Đang lọc: mỗi điều kiện 1 tag Trường · Điều kiện · Giá trị (Figma _Conditonal Filter / Box) -->
    <TableFilterTags :active="advActive" :mode="adv.mode" :field-of="k => FILTER_FIELDS.find(f => f.key === k)"
      @remove="id => (adv = { ...adv, conditions: adv.conditions.filter(c => c.id !== id) })" @clear="adv = EMPTY()" @edit="showFilter = true" />
    <div class="demo-table__body">
    <div class="table-scroll">
      <!-- v-model:filter + filter-fields: lọc theo cột trên tiêu đề LIÊN THÔNG với bộ lọc Advance (cùng 1 bộ điều kiện) → lọc cột thì panel tự tick, lọc ở panel thì cột hiện đang lọc -->
      <DataTable :columns="columns" :rows="paged" :selected="selected" :hide-blank-rows="false" show-footer v-model:filter="adv" :filter-fields="FILTER_FIELDS"
        :row-actions="ROW_ACTIONS" :more-actions="MORE_ACTIONS" :action-mode="actionMode" :column-lines="lineMode !== 'none'" :column-line-style="lineMode === 'solid' ? 'solid' : 'dotted'" actions-label="Thao tác" @more-action="e => toast.info(`Ví dụ: ${e.action.label} ${e.row.code}`)"
        @update:selected="onSelect" @post="r => setState(r, 'done')" @unpost="r => setState(r, 'draft')" @edit="r => toast.info(`Sửa ${r.code}`)" @delete="r => remove([r.id])" />
    </div>
    </div>
    <TableSettingsDrawer v-if="showSettings" :columns="colState" :defaults="BASE_COLS" @save="saveSettings" @close="showSettings = false" />
    <TablePaging :total="filtered.length" v-model:page="page" v-model:page-size="pageSize" :page-size-options="[10, 20, 50]" :type="pagingType" />
  </div>
  <!-- Bộ lọc Advance: panel bên phải, đẩy bảng hẹp lại (chuyển nguyên từ app Chấm điểm) -->
  <TableFilterPanel v-if="showFilter && filterKind === 'advance'" :fields="FILTER_FIELDS" :filter="adv" :saved="SAVED"
    @apply="v => { adv = v; page = 1; toast.success(v.conditions.length ? `Đã lọc theo ${v.conditions.length} điều kiện` : 'Đã bỏ lọc') }"
    @saved-action="e => toast.info(`Ví dụ: ${e.action === 'delete' ? 'xóa' : 'đổi tên'} “${e.item.label}”`)" @close="showFilter = false" />
  </div>
  </div>
    <TableFilterPopover v-if="showFilter && filterKind === 'basic'" v-model="basic" :fields="BASIC_FIELDS" :anchor="filterAnchor" :layout="basicLayout"
      @apply="v => { page = 1; showFilter = false; toast.success(basicCountOf(v) ? `Đã lọc theo ${basicCountOf(v)} điều kiện` : 'Đã bỏ lọc') }" @close="showFilter = false" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import OverflowActions from '@mds/components/OverflowActions.vue'
import TableHeader from '@mds/components/TableHeader.vue'
import DataTable from '@mds/components/DataTable.vue'
import TablePaging from '@mds/components/TablePaging.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import TableSettingsDrawer from '@mds/components/TableSettingsDrawer.vue'
import TableFilterPanel from '@mds/components/TableFilterPanel.vue'
import TableFilterPopover from '@mds/components/TableFilterPopover.vue'
import TableFilterTags from '@mds/components/TableFilterTags.vue'
import { testRow, isComplete, describeParts } from '@mds/utils/advancedFilter.js'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'
import { fmtNum } from '@mds/utils/number.js'

const STATUS = { done: { label: 'Đã ghi sổ', color: 'success' }, draft: { label: 'Chưa ghi sổ', color: 'warning' } }
const names = ['Công ty TNHH An Phát', 'Công ty CP Bình Minh', 'Cửa hàng Cường Thịnh', 'Công ty TNHH Đại Dương', 'HTX Hòa Bình', 'Công ty CP Gia Phú', 'Công ty TNHH Hưng Long', 'Siêu thị Kim Ngân', 'Công ty CP Lạc Việt', 'Nhà sách Minh Trí', 'Công ty TNHH Nam Sơn', 'Công ty CP Phương Đông']
const STAFF = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Thu Dung']
const DEPTS = ['Kinh doanh', 'Kế toán', 'Bán lẻ', 'Dự án']
const STREETS = ['Lê Lợi, Q.1, TP.HCM', 'Trần Duy Hưng, Cầu Giấy, Hà Nội', 'Hùng Vương, Hải Châu, Đà Nẵng', 'Nguyễn Trãi, Thanh Xuân, Hà Nội']
// 200 phiếu (lặp tên khách) → đủ 20 trang để xem phân trang dạng số “1 … 5 6 7 … 20”
const all = ref(Array.from({ length: 200 }, (_, i) => names[i % names.length]).map((n, i) => ({
  id: i + 1, code: `PT${String(i + 1).padStart(5, '0')}`, date: `${String((i % 27) + 1).padStart(2, '0')}/10/2026`,
  customer: n, amount: 1250000 * ((i * 7) % 11 + 1), state: i % 3 ? 'done' : 'draft',
  custCode: `KH${String(101 + i * 7).padStart(4, '0')}`, taxCode: `0${String(310245678 + i * 1379)}`.slice(0, 10), address: `${12 + i * 3} ${STREETS[i % 4]}`,
  payer: STAFF[(i + 2) % 4].replace(/^\S+/, 'Anh'), desc: `Thu tiền hàng theo hóa đơn ${String(1201 + i * 11).padStart(7, '0')}`,
  debit: '1111', credit: i % 2 ? '131' : '5111', currency: 'VND', collector: STAFF[i % 4], dept: DEPTS[i % 4], createdBy: STAFF[(i + 1) % 4],
})))
const q = ref(''), status = ref(''), selected = ref([]), page = ref(1), pageSize = ref(10)
const statusOptions = [{ value: 'done', label: 'Đã ghi sổ' }, { value: 'draft', label: 'Chưa ghi sổ' }]
const EMPTY = () => ({ mode: 'all', conditions: [] })
/* Thao tác dòng: Rê chuột (nút hiện khi hover) · Icons / Link ghim cột cuối (Figma ReadOnly Column Table · Type=Icons / Link Action Icon) */
const ACTION_MODES = [{ id: 'hover', label: 'Rê chuột' }, { id: 'icons', label: 'Icons ghim' }, { id: 'link', label: 'Link ghim' }]
const actionMode = ref('hover')
/* Vạch ngăn giữa các cột: Nét chấm (mặc định) · Nét liền (column-line-style="solid" — bảng có header gộp ô) · Ẩn (column-lines=false) */
const COL_LINES = [{ id: 'dotted', label: 'Nét chấm' }, { id: 'solid', label: 'Nét liền' }, { id: 'none', label: 'Ẩn' }]
const lineMode = ref('dotted')
/* Loại bảng mẫu — chọn Bảng lương thì tự dùng vạch nét liền (khuyến nghị cho header gộp ô), về Danh sách chứng từ thì nét chấm */
const TABLE_KINDS = [{ id: 'list', label: 'Danh sách chứng từ' }, { id: 'payroll', label: 'Bảng lương (header gộp ô)' }, { id: 'card', label: 'Bảng trong card' }]
const tableKind = ref('list')
watch(tableKind, k => { lineMode.value = k === 'payroll' ? 'solid' : 'dotted' })
/* Bảng lương mẫu — nhóm cột: Lương chuẩn · Phụ cấp · Làm thêm · Khấu trừ (cột trong nhóm có width cố định để ô nhóm khớp bề rộng) */
const PAY_STAFF = [['Nguyễn Văn An', 'Kế toán'], ['Trần Thị Bình', 'Nhân sự'], ['Lê Hoàng Cường', 'Kinh doanh'], ['Phạm Thu Dung', 'Marketing'], ['Vũ Minh Đức', 'Công nghệ'], ['Đặng Thị Hà', 'Kế toán'],
  ['Bùi Quốc Hưng', 'Kinh doanh'], ['Hoàng Lan Hương', 'Nhân sự'], ['Ngô Văn Khánh', 'Công nghệ'], ['Đỗ Thị Linh', 'Marketing'], ['Phan Anh Minh', 'Kinh doanh'], ['Lương Thu Nga', 'Hành chính']]
const payAll = PAY_STAFF.map(([name, dept], i) => {
  const base = 9000000 + (i % 5) * 1500000, insured = Math.round(base * 0.8), lunch = 730000, fuel = i % 3 ? 500000 : 300000, resp = i % 4 === 0 ? 1000000 : 0
  const otHours = (i * 5) % 17, otAmount = Math.round(base / 26 / 8 * 1.5 * otHours), bhxh = Math.round(insured * 0.105), tax = Math.max(0, Math.round((base + resp - 11000000) * 0.05))
  return { id: i + 1, code: `NV${String(i + 12).padStart(4, '0')}`, name, dept, base, insured, lunch, fuel, resp, otHours, otAmount, bhxh, tax, net: base + lunch + fuel + resp + otAmount - bhxh - tax }
})
/* Bảng trong card: thanh công cụ (ô tìm kiếm + nút) phía trên bảng có thể ẩn — ẩn thì hàng tiêu đề cột là dòng đầu tiên của khung viền */
/* Số dòng dữ liệu của bảng trong card: Nhiều (200 dòng, có phân trang) · Ít (4 dòng) — xem dòng tổng + phân trang xử lý thế nào khi ít / nhiều dòng */
const CARD_DATA = [{ id: 'many', label: 'Nhiều (200)' }, { id: 'few', label: 'Ít (4 dòng)' }, { id: 'none', label: 'Không có' }]
const cardData = ref('many'), cardPage = ref(1), cardPageSize = ref(10)
const cardFiltered = computed(() => (cardData.value === 'none' ? [] : cardData.value === 'few' ? filtered.value.slice(0, 4) : filtered.value))
watch([cardData, cardPageSize, q], () => { cardPage.value = 1 })
const cardPaged = computed(() => cardFiltered.value.slice((cardPage.value - 1) * cardPageSize.value, cardPage.value * cardPageSize.value).map(r => ({ ...r, amountText: fmtNum(r.amount), status: STATUS[r.state] })))
const CARD_TOOLBAR = [{ id: 'on', on: true, label: 'Hiện' }, { id: 'off', on: false, label: 'Ẩn' }]
const cardToolbar = ref(true)
watch(cardToolbar, v => { if (!v) q.value = '' })   // ẩn ô tìm kiếm thì bỏ luôn từ khóa đang lọc (không lọc ngầm)
/* Bảng trong card: ít cột hơn (card hẹp hơn trang) — cột Khách hàng giãn theo chỗ còn lại */
const CARD_COLS = computed(() => [
  { key: 'date', label: 'Ngày', width: 120 },
  { key: 'code', label: 'Số chứng từ', width: 120, link: true },
  { key: 'customer', label: 'Khách hàng', minWidth: 180 },
  { key: 'amountText', label: 'Số tiền', width: 130, align: 'right', footerText: fmtNum(cardFiltered.value.reduce((a, r) => a + r.amount, 0)) },
  { key: 'status', label: 'Trạng thái', type: 'status', width: 140 },
])
const payQ = ref(''), payPage = ref(1), payPageSize = ref(10)
const payFiltered = computed(() => payAll.filter(r => !payQ.value.trim() || `${r.code} ${r.name}`.toLowerCase().includes(payQ.value.trim().toLowerCase())))
watch([payQ, payPageSize], () => { payPage.value = 1 })
const payPaged = computed(() => payFiltered.value.slice((payPage.value - 1) * payPageSize.value, payPage.value * payPageSize.value).map(r => ({
  ...r, ...Object.fromEntries(['base', 'insured', 'lunch', 'fuel', 'resp', 'otAmount', 'bhxh', 'tax', 'net'].map(k => [k + 'T', fmtNum(r[k])])), otHoursT: fmtNum(r.otHours) })))
const paySum = k => fmtNum(payFiltered.value.reduce((a, r) => a + r[k], 0))
const PAY_COLS = computed(() => [
  { key: 'code', label: 'Mã NV', width: 90, pinned: true, footerText: 'Tổng' },
  { key: 'name', label: 'Họ và tên', width: 170, pinned: true },
  { key: 'dept', label: 'Phòng ban', width: 130 },
  { key: 'baseT', label: 'Lương cơ bản', width: 130, align: 'right', group: 'Lương chuẩn', footerText: paySum('base') },
  { key: 'insuredT', label: 'Lương đóng BH', width: 150, align: 'right', group: 'Lương chuẩn', footerText: paySum('insured') },
  { key: 'lunchT', label: 'Ăn trưa', width: 110, align: 'right', group: 'Phụ cấp', footerText: paySum('lunch') },
  { key: 'fuelT', label: 'Xăng xe', width: 110, align: 'right', group: 'Phụ cấp', footerText: paySum('fuel') },
  { key: 'respT', label: 'Trách nhiệm', width: 130, align: 'right', group: 'Phụ cấp', footerText: paySum('resp') },
  { key: 'otHoursT', label: 'Số giờ', width: 90, align: 'right', group: 'Làm thêm', footerText: paySum('otHours') },
  { key: 'otAmountT', label: 'Thành tiền', width: 120, align: 'right', group: 'Làm thêm', footerText: paySum('otAmount') },
  { key: 'bhxhT', label: 'BHXH', width: 110, align: 'right', group: 'Khấu trừ', footerText: paySum('bhxh') },
  { key: 'taxT', label: 'Thuế TNCN', width: 120, align: 'right', group: 'Khấu trừ', footerText: paySum('tax') },
  { key: 'netT', label: 'Thực lĩnh', width: 140, align: 'right', footerText: paySum('net') },
])
/* Phân trang (Figma Paging): Ngắn gọn = khoảng 1 - 10 + nút trước / sau · Dạng số = 1 … 5 6 7 … 20 (prop type="advance") */
const PAGING_TYPES = [{ id: 'basic', label: 'Ngắn gọn' }, { id: 'advance', label: 'Dạng số' }]
const pagingType = ref('basic')
/* Tìm kiếm AI (giả lập trong trang mẫu — app thật gửi câu hỏi cho AI / máy chủ ở @ai-search):
   hiểu vài ý trong câu: “chưa / đã ghi sổ”, “trên / dưới N triệu”, tên khách hàng, mã phiếu */
/* Kiểu ô tìm kiếm trên thanh công cụ: Thường (ô tìm kiếm) · Thông minh (AI Searchbox) — prop search-mode của TableHeader */
const SEARCH_MODES = [{ id: 'normal', label: 'Thường' }, { id: 'ai', label: 'Thông minh' }]
const searchMode = ref('normal')
const norm = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase()
/* Tìm kiếm thông minh trên bảng — hành xử Y HỆT control ở /ds/search-box:
   · gõ → bấm icon phân tích: popup “Điều kiện AI bóc tách” (Trường: “giá trị”)
   · Enter: popover “Kết quả tìm kiếm với AI” — dòng điều kiện đã bóc tách + kết quả theo NHÓM (trái: tên nhóm · phải: bản ghi tìm thấy); bấm bản ghi → mở bản ghi
   Bảng KHÔNG bị lọc — kết quả nằm trong popover (muốn lọc bảng thì dùng bộ lọc / ô tìm kiếm Thường).
   (giả lập trong trang mẫu — app thật gửi câu hỏi cho AI / máy chủ ở @ai-search) hiểu: “chưa / đã ghi sổ”, “trên / dưới N triệu”, tên khách hàng, mã phiếu */
const aiParsed = ref([]), aiResults = ref(null)
function parseAi(question) {
  const t = norm(question), out = []
  const cond = (key, op, value) => out.push({ id: 'ai-' + key + '-' + op + '-' + out.length, key, op, value, value2: '' })
  if (/chua ghi so|nhap|chua duyet/.test(t)) cond('state', 'is', 'draft'); else if (/da ghi so|da duyet/.test(t)) cond('state', 'is', 'done')
  const money = (m, unit) => Number(m.replace(',', '.')) * (/ty/.test(unit) ? 1e9 : /trieu|tr\b/.test(unit) ? 1e6 : 1)
  const over = t.match(/(tren|lon hon|>)\s*([\d.,]+)\s*(ty|trieu|tr)?/); if (over) cond('amount', 'gt', money(over[2], over[3] || ''))
  const under = t.match(/(duoi|nho hon|<)\s*([\d.,]+)\s*(ty|trieu|tr)?/); if (under) cond('amount', 'lt', money(under[2], under[3] || ''))
  const code = t.match(/pt\d{3,5}/); if (code) cond('code', 'contains', code[0].toUpperCase())
  const cust = names.find(n => t.includes(norm(n).replace(/^(cong ty (tnhh|cp)|cua hang|htx|sieu thi|nha sach)\s*/, ''))); if (cust) cond('customer', 'contains', cust)
  return out
}
/** Điều kiện → dòng “Trường: giá trị” cho popup bóc tách */
const describeAi = conds => conds.map(c => { const f = FILTER_FIELDS.find(x => x.key === c.key), d = describeParts(c, f); return { label: d.field, value: d.op === 'là' || d.op === 'chứa' ? d.value : `${d.op} ${d.value}` } })
function analyzeAi(text) { aiParsed.value = describeAi(parseAi(text)) }
/** Tìm theo điều kiện AI bóc tách (không bóc được điều kiện → tìm theo chữ trong mã / khách hàng) → TOÀN BỘ kết quả của từng nhóm: Chứng từ · Khách hàng */
function aiFull(question, conds) {
  const kw = norm(question.trim())
  const hits = all.value.filter(r => (conds.length ? testRow(r, { mode: 'all', conditions: conds }, FILTER_FIELDS) : norm(`${r.code} ${r.customer}`).includes(kw)))
  const byCust = new Map(); hits.forEach(r => { const c = byCust.get(r.customer) ?? { name: r.customer, n: 0, sum: 0, code: r.custCode }; c.n++; c.sum += r.amount; byCust.set(r.customer, c) })
  return {
    voucher: hits.map(r => ({ id: r.id, name: `${r.code} · ${r.customer}`, subtitle: `${r.date} · ${fmtNum(r.amount)} đ`, meta: STATUS[r.state].label, avatar: false })),
    customer: [...byCust.values()].sort((a, b) => b.sum - a.sum).map(c => ({ id: c.name, name: c.name, subtitle: `${c.code} · ${c.n} chứng từ`, meta: `Tổng ${fmtNum(c.sum)} đ` })),
  }
}
function runAi(question) {
  const conds = parseAi(question); aiParsed.value = describeAi(conds)
  const f = aiFull(question, conds)
  aiResults.value = [
    f.voucher.length && { key: 'voucher', title: 'Chứng từ', total: f.voucher.length, items: f.voucher.slice(0, 5) },
    f.customer.length && { key: 'customer', title: 'Khách hàng', total: f.customer.length, items: f.customer.slice(0, 5) },
  ].filter(Boolean)
}
/* “Xem thêm” của 1 nhóm → popup chỉ chứa kết quả của đúng nhóm đó (cùng popup với ô tìm kiếm toàn cục) — nạp toàn bộ kết quả của nhóm (giả lập độ trễ ~0,4 giây; cũng chạy khi sửa từ khóa trong popup) */
const aiMoreItems = ref(null), aiMoreTotal = ref(null)
let aiMoreTimer = 0
function aiMore(g, text) {
  aiMoreItems.value = null; clearTimeout(aiMoreTimer)
  aiMoreTimer = setTimeout(() => { const list = aiFull(text, parseAi(text))[g.key] ?? []; aiMoreItems.value = list; aiMoreTotal.value = list.length }, 400)
}
const aiSelect = (it, g) => toast.info(g.key === 'voucher' ? `Ví dụ: mở chứng từ ${it.name.split(' · ')[0]}` : `Ví dụ: mở khách hàng ${it.name}`)
function clearAi() { aiParsed.value = []; aiResults.value = null }
watch(searchMode, () => { clearAi(); q.value = '' })   // đổi kiểu tìm kiếm → bỏ điều kiện AI + chữ cũ
const BULK_ACTIONS = [{ id: 'approve', label: 'Duyệt', icon: 'check' }, { id: 'delete', label: 'Xóa', icon: 'trash', danger: true }]
function onBulk(id) { if (id === 'approve') { toast.success(`Đã duyệt ${selectedCount.value} chứng từ`); deselectAll() } else remove(selected.value) }
/* Chức năng chính đổi theo trạng thái dòng (mục đầu tiên đang hiện = chức năng chính): Chưa ghi sổ → Ghi sổ · Đã ghi sổ → Bỏ ghi */
const ROW_ACTIONS = [
  { icon: 'check', title: 'Ghi sổ', label: 'Ghi sổ', emit: 'post', show: r => r.state === 'draft' },
  { icon: 'arrow-back-up', title: 'Bỏ ghi', label: 'Bỏ ghi', emit: 'unpost', show: r => r.state === 'done' },
  { icon: 'pencil', title: 'Sửa', label: 'Sửa', emit: 'edit' },
  { icon: 'trash', title: 'Xóa', label: 'Xóa', emit: 'delete', danger: true },
]
function setState(row, state) { const r = all.value.find(x => x.id === row.id); if (r) r.state = state; toast.success(`${state === 'done' ? 'Đã ghi sổ' : 'Đã bỏ ghi'} ${row.code}`) }
const MORE_ACTIONS = [{ id: 'copy', label: 'Nhân bản', icon: 'copy' }, { id: 'print', label: 'In phiếu thu', icon: 'printer' }]
const showSettings = ref(false), showFilter = ref(false), adv = ref(EMPTY()), full = ref(false)
/* Bộ lọc Advance — trường theo kiểu dữ liệu (text / number / date / enum), lọc bằng testRow() của mds-ui */
const FILTER_FIELDS = [
  { key: 'customer', label: 'Khách hàng', type: 'text', get: r => r.customer },
  { key: 'code', label: 'Số chứng từ', type: 'text', get: r => r.code },
  { key: 'date', label: 'Ngày chứng từ', type: 'date', get: r => r.date.split('/').reverse().join('-') },
  { key: 'amount', label: 'Số tiền', type: 'number', get: r => r.amount },
  { key: 'state', label: 'Trạng thái', type: 'enum', options: statusOptions, get: r => r.state },
  { key: 'dept', label: 'Phòng ban', type: 'enum', options: DEPTS, get: r => r.dept },
  { key: 'collector', label: 'Nhân viên thu', type: 'enum', options: STAFF, get: r => r.collector },
  { key: 'payer', label: 'Người nộp', type: 'text', get: r => r.payer },
  { key: 'desc', label: 'Diễn giải', type: 'text', get: r => r.desc },
  { key: 'custCode', label: 'Mã khách hàng', type: 'text', get: r => r.custCode },
  { key: 'taxCode', label: 'Mã số thuế', type: 'text', get: r => r.taxCode },
  { key: 'address', label: 'Địa chỉ', type: 'text', get: r => r.address },
  { key: 'debit', label: 'TK Nợ', type: 'enum', options: ['1111'], get: r => r.debit },
  { key: 'credit', label: 'TK Có', type: 'enum', options: ['131', '5111'], get: r => r.credit },
  { key: 'currency', label: 'Loại tiền', type: 'enum', options: ['VND'], get: r => r.currency },
  { key: 'createdBy', label: 'Người tạo', type: 'enum', options: STAFF, get: r => r.createdBy },
]
const SAVED = [
  { id: 'big', label: 'Phiếu thu trên 10 triệu', filter: { mode: 'all', conditions: [{ id: 's1', key: 'amount', op: 'gt', value: 10000000, value2: '' }] } },
  { id: 'kd', label: 'Phòng Kinh doanh', filter: { mode: 'all', conditions: [{ id: 's2', key: 'dept', op: 'is', value: 'Kinh doanh', value2: '' }] } },
]
const advActive = computed(() => adv.value.conditions.filter(isComplete))
const advCount = computed(() => advActive.value.length)
/* Bộ lọc Cơ bản: các trường cố định (Combobox “Tất cả” · khoảng ngày) */
const FILTER_KINDS = [{ id: 'advance', label: 'Advance — panel bên phải' }, { id: 'basic', label: 'Cơ bản — popover' }]
const LAYOUTS = [{ id: 'vertical', label: 'Nhãn trên' }, { id: 'horizontal', label: 'Nhãn trái' }]
const filterKind = ref('advance'), basicLayout = ref('vertical'), basic = ref({}), filterAnchor = ref(null)
const opt = list => list.map(v => ({ value: v, label: v }))
const BASIC_FIELDS = [
  { key: 'state', label: 'Trạng thái', options: statusOptions }, { key: 'dept', label: 'Phòng ban', options: opt(DEPTS) },
  { key: 'collector', label: 'Nhân viên thu', options: opt(STAFF) }, { key: 'createdBy', label: 'Người tạo', options: opt(STAFF) },
  { key: 'period', type: 'daterange', labels: ['Từ ngày', 'Đến ngày'] },
]
const basicCountOf = v => Object.entries(v || {}).filter(([, x]) => (Array.isArray(x) ? x.some(Boolean) : x)).length
const basicCount = computed(() => basicCountOf(basic.value))
const iso = d => d.split('/').reverse().join('-')   // dd/mm/yyyy → yyyy-mm-dd
function matchBasic(r) {
  const b = basic.value
  for (const k of ['state', 'dept', 'collector', 'createdBy']) if (b[k] && r[k] !== b[k]) return false
  const [from, to] = b.period || []
  return (!from || iso(r.date) >= from) && (!to || iso(r.date) <= to)
}
function switchKind(k) { filterKind.value = k; showFilter.value = false }
const filtered = computed(() => all.value.filter(r => (!status.value || r.state === status.value)
  && (searchMode.value === 'ai' || !q.value || `${r.code} ${r.customer}`.toLowerCase().includes(q.value.toLowerCase()))   // kiểu Thông minh: điều kiện AI đã nằm trong bộ lọc (adv), chữ trong ô không tự lọc
  && (filterKind.value !== 'basic' || matchBasic(r)) && testRow(r, adv.value, FILTER_FIELDS)))   // điều kiện lọc cột (= bộ lọc Advance) áp ở cả 2 kiểu
watch([q, status, pageSize, adv, basic], () => { page.value = 1 })
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
  .map(r => ({ ...r, amountText: fmtNum(r.amount), status: STATUS[r.state] })))
// Nhiều cột để thấy rõ ghim cột + kéo ngang: Số chứng từ ghim sẵn (pinned) + bắt buộc hiển thị (locked) — bấm ⋮ ở tiêu đề cột hoặc ⚙ Thiết lập để ghim / ẩn / đổi thứ tự
const BASE_COLS = [
  { key: 'date', label: 'Ngày', width: 124 },
  { key: 'code', label: 'Số chứng từ', width: 120, link: true, pinned: true, locked: true },   // locked: cột bắt buộc hiển thị — ⚙ Thiết lập: ô tick khóa (tick sẵn, không bỏ được) · menu ⋮ không có “Ẩn cột”
  { key: 'custCode', label: 'Mã khách hàng', width: 130 },
  { key: 'customer', label: 'Khách hàng', width: 220 },
  { key: 'taxCode', label: 'Mã số thuế', width: 130 },
  { key: 'address', label: 'Địa chỉ', width: 280 },
  { key: 'payer', label: 'Người nộp', width: 150 },
  { key: 'desc', label: 'Diễn giải', width: 280 },
  { key: 'debit', label: 'TK Nợ', width: 90 },
  { key: 'credit', label: 'TK Có', width: 90 },
  { key: 'currency', label: 'Loại tiền', width: 100 },
  { key: 'amountText', label: 'Số tiền', width: 130, align: 'right', filterKey: 'amount' },   // filterKey: cột hiển thị ≠ trường lọc
  { key: 'collector', label: 'Nhân viên thu', width: 160 },
  { key: 'dept', label: 'Phòng ban', width: 130 },
  { key: 'createdBy', label: 'Người tạo', width: 160 },
  { key: 'status', label: 'Trạng thái', type: 'status', width: 130, filterKey: 'state' },
]
// Thiết lập bảng: thứ tự, tên hiển thị, độ rộng, ẩn / hiện, ghim — lưu từ drawer
const colState = ref(BASE_COLS.map(c => ({ ...c, field: c.label })))
function saveSettings({ columns }) { colState.value = columns.map(c => ({ ...BASE_COLS.find(b => b.key === c.key), ...c })); showSettings.value = false; toast.success('Đã lưu thiết lập bảng') }
const columns = computed(() => [{ key: 'checkbox', type: 'checkbox', width: 40 },
  ...colState.value.map(c => (c.key === 'amountText' ? { ...c, footerText: fmtNum(filtered.value.reduce((s, r) => s + r.amount, 0)) } : c))])
/* Chọn tất cả trên DS: tick ô tiêu đề chỉ chọn trang đang xem → nút “Chọn tất cả trên DS” chọn mọi bản ghi (sau lọc) của mọi trang */
const allPages = ref(false)
const pageIds = computed(() => paged.value.map(r => r.id))
const pageAllSelected = computed(() => pageIds.value.length > 0 && pageIds.value.every(id => selected.value.includes(id)))
const selectedCount = computed(() => (allPages.value ? filtered.value.length : selected.value.length))
function selectAllPages() { allPages.value = true; selected.value = filtered.value.map(r => r.id) }
function deselectAll() { allPages.value = false; selected.value = [] }
function onSelect(ids) {
  // Bỏ tick 1 dòng khi đang chọn tất cả → thoát chế độ “tất cả”, giữ các dòng còn tick
  if (allPages.value && ids.length < selected.value.length) allPages.value = false
  selected.value = ids
}
watch([filtered], () => { if (allPages.value) selected.value = filtered.value.map(r => r.id) })
/* Xem toàn màn hình: Esc để thu nhỏ */
const onKey = e => { if (e.key === 'Escape' && full.value && !document.querySelector('.tsd-overlay, .tfb')) { e.stopPropagation(); full.value = false } }
onMounted(() => window.addEventListener('keydown', onKey, true))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey, true))
function remove(ids) {
  const set = new Set(ids), before = all.value
  all.value = all.value.filter(r => !set.has(r.id)); deselectAll()
  toast.success(`Đã xóa ${set.size} chứng từ`, { action: { label: 'Hoàn tác', icon: 'arrow-back-up', onClick: () => { all.value = before } } })
}
</script>

<style scoped>
.demo-dt-sp { flex: 1; }
/* Sân khấu nền BG Page (như màn danh sách của app) — cao 640, bảng + panel Advance cách nhau như list-split của app */
.demo-dt-stage { position: relative; height: auto; padding: 12px; box-sizing: border-box; border-radius: var(--radius-card); background: var(--bg-page); display: flex; flex-direction: column; gap: 12px; }
.demo-dt-controls { flex-shrink: 0; }
/* Khu tùy chọn: card trắng · mỗi khối 1 hàng (tiêu đề trái 112px · các tùy chọn phải, nhãn nằm trên nút chọn) · khối ngăn bằng vạch ngang */
.demo-dt-opts { flex-shrink: 0; position: relative; display: flex; flex-direction: column; padding: 4px 16px; border-radius: var(--radius-card); background: var(--bg-white); box-shadow: var(--shadow-card); }
.demo-dt-opts__group { display: grid; grid-template-columns: 112px minmax(0, 1fr); gap: 4px 12px; align-items: start; padding: 10px 0; }
.demo-dt-opts__group:first-of-type { padding-right: 150px; }   /* chừa chỗ nút “Xem toàn màn hình” */
.demo-dt-opts__group + .demo-dt-opts__group { border-top: 1px solid var(--stroke-divider); }
.demo-dt-opts__title { margin: 0; padding-top: 2px; font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.demo-dt-opts__row { display: flex; flex-wrap: wrap; gap: 8px 20px; min-width: 0; }
.demo-dt-opt { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.demo-dt-opt__label { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.demo-dt-opts__full { position: absolute; top: 8px; right: 8px; }
/* Hẹp: tiêu đề khối nằm trên các tùy chọn */
@media (max-width: 640px) {
  .demo-dt-opts__group { grid-template-columns: minmax(0, 1fr); }
  .demo-dt-opts__group:first-of-type { padding-right: 0; padding-top: 44px; }
}

.demo-dt-stage--full { position: fixed; inset: 0; z-index: var(--z-dialog); height: auto; padding: 16px; border-radius: 0; }
.demo-dt-split { flex: 1; min-width: 0; min-height: 0; display: flex; gap: var(--card-col-gap, 12px); height: 496px; }   /* vừa đủ thanh công cụ + 10 dòng + dòng Tổng + phân trang — khu tùy chọn không chiếm chỗ của bảng */
.demo-dt-stage--full .demo-dt-split { height: auto; }
.demo-dt-split--card { flex: none; height: 580px; }   /* chiều cao CỐ ĐỊNH như vùng nội dung thật của màn hình → khung bảng giãn hết, phân trang ghim đáy; (không đặt flex: none thì khung co theo số dòng) */   /* card: đệm 16 + tiêu đề + khung bảng (thanh công cụ + 10 dòng + dòng Tổng + phân trang) */
.demo-dt-card { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--card-gap); }
.demo-dt-card__title { margin: 0; }
.demo-dt-card__table { flex: 1; min-height: 0; }
.demo-dt-table { flex: 1; min-width: 0; height: auto; border: none; border-radius: var(--radius-card); box-shadow: var(--shadow-card); background: var(--bg-white); }
/* Màn hẹp: panel Advance nổi đè bên phải bảng (không bóp bảng còn vài chục px) */
@media (max-width: 640px) {
  .demo-dt-split { position: relative; }
  .demo-dt-split > :deep(.afp) { position: absolute; top: 0; right: 0; bottom: 0; z-index: 3; max-width: calc(100% - 24px); box-shadow: var(--shadow-dialog); }
}
/* Bảng + panel Bộ lọc nằm cạnh nhau, panel cao bằng vùng bảng */
.demo-table__body { display: flex; flex: 1; min-height: 0; }
.demo-table__body > .table-scroll { flex: 1; min-width: 0; }
</style>
