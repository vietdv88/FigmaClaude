<template>
  <!-- Màn hình mẫu TỔNG QUAN (nội dung bên phải sidebar) — dùng chung: /ds/layout (Bố cục › Tổng quan), cửa sổ chat AI Agent, Trợ giúp (panel phải) -->
  <div class="db-page">
    <!-- Dải tab phân hệ con (như /ds/onboarding-start): Trợ lý AI (icon + chữ gradient AI) · Tổng quan · Tính năng mới (tag “Mới”) — bên phải: slot #subnav-right -->
    <div v-if="tabs" class="sub-nav db-subnav">
      <SubNavTabs :model-value="curTab" :items="TABS" @update:model-value="setTab">
        <template #tab="{ item }">
          <TIcon v-if="item.id === 'ai'" name="sparkles" class="db-ai-icon ti--ai" />
          <span :class="{ 'text-ai-primary': item.id === 'ai' }">{{ item.label }}</span>
          <span v-if="item.id === 'new'" class="badge-new db-new">Mới</span>
        </template>
      </SubNavTabs>
      <div v-if="$slots['subnav-right']" class="sub-nav-right"><slot name="subnav-right" /></div>
    </div>
    <div v-if="tabs && curTab !== 'overview'" class="db-tabholder"><span class="demo-muted">Ví dụ: nội dung tab “{{ TABS.find(t => t.id === curTab).label }}”.</span></div>
    <template v-else>
    <!-- Page header nằm NGOÀI vùng cuộn (luôn trên cùng, nội dung không chạy bên dưới).
         Bù thêm đúng bề rộng thanh cuộn của vùng dưới vào lề phải → nút Tùy chỉnh thẳng mép phải card -->
    <div class="db-head" :style="{ paddingRight: `calc(16px + ${sbw}px)` }">
      <h2 class="db-title">Tổng quan</h2>
      <AppCombobox v-model="view" :options="VIEWS" required :clearable="false" class="db-view" />
      <span class="db-sp" />
      <template v-if="!editing">
        <AppCombobox v-model="period" :options="PERIODS" required :clearable="false" class="db-period" />
        <button type="button" class="btn btn--outline btn--neutral" @click="startEdit"><TIcon name="adjustments" />Tùy chỉnh</button>
      </template>
      <span v-else class="demo-muted">Đang tùy chỉnh “{{ VIEWS.find(v => v.value === view).label }}”</span>
    </div>
    <div ref="scrollEl" class="db-scroll">
      <!-- Tài khoản mới (empty='new'): hình minh họa CHỈ 1 LẦN cho cả màn, ở khối đầu trang + nút bắt đầu · các card bên dưới giữ khung, hiện biểu đồ mờ -->
      <section v-if="empty === 'new'" class="db-start surface">
        <EmptyArt variant="chart" :width="120" />
        <div class="db-start__txt">
          <h3 class="db-start__title">Chưa có dữ liệu kinh doanh</h3>
          <p class="db-start__desc">Khai báo danh mục và lập chứng từ đầu tiên — các chỉ số và biểu đồ bên dưới sẽ tự cập nhật.</p>
          <div class="db-start__cta">
            <button type="button" class="btn btn--outline btn--neutral" @click="emit('empty-action', 'import')"><TIcon name="file-import" />Nhập khẩu dữ liệu</button>
            <button type="button" class="btn btn--primary" @click="emit('empty-action', 'start')"><TIcon name="player-play" />Bắt đầu sử dụng</button>
          </div>
        </div>
      </section>
      <!-- Khối cố định trên cùng vùng nội dung (VD thanh “Tiện ích” quảng cáo bán chéo — /ds/advertising-cross-selling) -->
      <slot name="top" />
      <div class="card-row card-row--4 db-kpis">
        <div v-for="k in KPIS" :key="k.label" class="kpi-card db-kpi surface">
          <!-- Đang tải: khung xương NẰM TRONG chính thẻ thật, mỗi dòng cao đúng chữ thật (nhãn 20 · số .kpi-value 34 + lề 4 · % 20) + ô icon 44 → tải xong không xê dịch -->
          <template v-if="loading">
            <div class="db-kpi__body" aria-hidden="true">
              <span class="db-sk-line"><span class="skel" style="width: 55%" /></span>
              <span class="db-sk-line db-sk-line--val"><span class="skel" style="width: 70%" /></span>
              <span class="db-sk-line"><span class="skel" style="width: 40%" /></span>
            </div>
            <span class="skel db-kpi__icon" aria-hidden="true" />
          </template>
          <template v-else>
          <!-- Score card chuẩn (/ds/data-visualization): nhãn 13 Text/Secondary · số lớn .kpi-value + đơn vị · % so với kỳ trước (màu theo TỐT / XẤU, không theo tăng / giảm)
               · icon outline .kpi-icon--{màu} góc trên phải -->
          <div class="db-kpi__body">
            <span class="db-kpi__label">{{ k.label }}</span>
            <!-- Trống: số = 0 (đúng là chưa phát sinh), ẩn so sánh kỳ trước — KHÔNG dùng hình / empty state trong thẻ KPI -->
            <template v-if="empty"><div class="kpi-value"><span class="kpi-value__num">0</span><span class="kpi-value__unit">{{ k.unit }}</span></div><span class="demo-muted">Chưa phát sinh {{ empty === 'new' ? '' : 'trong ' + periodLabel }}</span></template>
            <template v-else>
            <div class="kpi-value"><span class="kpi-value__num">{{ k.value }}</span><span class="kpi-value__unit">{{ k.unit }}</span></div>
            <span class="db-delta" :class="k.good ? 'db-up' : 'db-down'"><TIcon :name="k.up ? 'trending-up' : 'trending-down'" />{{ k.up ? '+' : '−' }}{{ k.delta }}<span class="db-vs">so với kỳ trước</span></span>
            </template>
          </div>
          <span class="kpi-icon" :class="`kpi-icon--${k.tone}`" aria-hidden="true"><TIcon :name="k.icon" /></span>
          </template>
        </div>
      </div>

      <div class="db-grid">
        <section v-for="(w, i) in list" :key="w.id" class="db-widget surface" :class="[`db-widget--${w.span}`, { 'db-widget--edit': editing, 'db-widget--over': overIdx === i && dragIdx !== i }]"
          :draggable="editing" @dragstart="dragIdx = i" @dragover.prevent="overIdx = i" @drop.prevent="drop(i)" @dragend="dragIdx = overIdx = null">
          <header class="db-widget__head">
            <TIcon v-if="editing" name="grip-vertical" class="db-grip" />
            <h3 class="db-widget__title">{{ w.title }}</h3>
            <!-- Thao tác của card: chỉ hiện khi hover / focus vào card đó (hoặc đang mở menu), góc trên bên phải -->
            <div v-if="!editing" class="db-widget__acts" :class="{ 'db-widget__acts--open': menuFor === w.id, 'db-widget__acts--wait': loading || empty }">
              <button v-if="w.type !== 'list'" type="button" class="btn-icon btn-icon--sm" v-tip="w.table ? 'Xem biểu đồ' : 'Xem dạng bảng'" :aria-label="w.table ? 'Xem biểu đồ' : 'Xem dạng bảng'" :aria-pressed="!!w.table" @click="w.table = !w.table"><TIcon :name="w.table ? 'chart-bar' : 'table'" /></button>
              <DropdownMenu :items="CARD_MENU" placement="bottom-end" :min-width="200" @select="it => cardAction(it, w)" @update:open="o => (menuFor = o ? w.id : menuFor === w.id ? null : menuFor)">
                <template #trigger="{ toggle }"><button type="button" class="btn-icon btn-icon--sm" v-tip="'Thiết lập'" aria-label="Thiết lập" @click.stop="toggle"><TIcon name="settings" /></button></template>
              </DropdownMenu>
            </div>
            <template v-if="editing">
              <DropdownMenu :items="SPANS" :active-id="w.span" placement="bottom-end" :min-width="160" @select="s => (w.span = s.id)">
                <template #trigger="{ toggle }"><button type="button" class="btn-icon btn-icon--sm" v-tip="'Độ rộng'" aria-label="Độ rộng" @click.stop="toggle"><TIcon name="columns-2" /></button></template>
              </DropdownMenu>
            </template>
          </header>
          <!-- Đang tải: tiêu đề card (tĩnh) hiện luôn · vùng biểu đồ là khung xương cùng hình dạng (cột / donut / thanh ngang / đường / danh sách), cao không vượt vùng thật -->
          <!-- Trống (empty): CÙNG hình dạng nhưng ĐỨNG YÊN, nhạt hơn (“biểu đồ mờ”) + 1 dòng nói đúng cái thiếu & kỳ + link hành động — card giữ nguyên chiều cao -->
          <div v-if="loading" class="db-sk-chart" :class="`db-sk-chart--${w.type === 'list' ? 'list' : w.chart.type}`" aria-hidden="true">
            <template v-if="w.type === 'list'"><span v-for="j in 5" :key="j" class="db-sk-row"><span class="skel" :style="{ width: 40 + (j * 13) % 30 + '%' }" /><span class="skel db-sk-num" /></span></template>
            <template v-else-if="w.chart.type === 'donut'"><span class="skel db-sk-donut" /><span class="db-sk-legend"><span v-for="j in 4" :key="j" class="db-sk-line"><span class="skel" :style="{ width: 85 - j * 10 + '%' }" /></span></span></template>
            <template v-else-if="w.chart.type === 'hbar'"><span v-for="(h, j) in [100, 88, 36, 22, 16]" :key="j" class="db-sk-row"><span class="skel db-sk-label" /><span class="skel db-sk-hbar" :style="{ width: h * 0.55 + '%' }" /></span></template>
            <template v-else>
              <span class="db-sk-legend db-sk-legend--row"><span v-for="j in 3" :key="j" class="skel db-sk-chip" /></span>
              <span class="db-sk-plot"><span v-for="(h, j) in SK_BARS" :key="j" class="skel" :style="{ height: h + '%' }" /></span>
            </template>
          </div>
          <!-- Trống (empty): KHUNG BIỂU ĐỒ RỖNG thật — lưới mảnh + nhãn trục (cột / đường) · vòng rỗng “0” (donut) · tên dòng + rãnh rỗng “0” (thanh ngang)
               + 1 dòng chữ phụ nói đúng cái thiếu & kỳ (KHÔNG link hành động) — không khối xám to, không đóng khung lời nhắn · card giữ nguyên chiều cao -->
          <div v-else-if="empty" class="db-empty" :class="`db-empty--${w.type === 'list' ? 'list' : w.chart.type}`">
            <template v-if="w.type !== 'list' && ['stack', 'line', 'diverge'].includes(w.chart.type)">
              <div class="db-empty__plot">
                <span v-for="i in 4" :key="i" class="db-empty__grid" :class="{ 'db-empty__grid--base': i === 4 }" />
                <!-- Biểu đồ thu nhỏ trang trí: cột mảnh 10px thấp (cột / phân kỳ) hoặc 1 đường mảnh (đường) — xám nhạt, dưới lời nhắn -->
                <div v-if="w.chart.type !== 'line'" class="db-empty__bars" aria-hidden="true"><span v-for="(h, j) in MINI" :key="j" :style="{ height: h + '%' }" /></div>
                <svg v-else class="db-empty__line" viewBox="0 0 120 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,24 11,21 22,22 33,17 44,19 55,14 66,16 77,11 88,15 99,12 110,9 120,8" /></svg>
                <div class="db-empty__note">
                  <span class="db-empty__msg">{{ emptyMsg(w).text }}</span>
                </div>
              </div>
              <div class="db-empty__axis" aria-hidden="true"><span v-for="c in w.chart.cats" :key="c">{{ c }}</span></div>
            </template>
            <template v-else-if="w.type !== 'list' && w.chart.type === 'donut'">
              <div class="db-empty__ring" aria-hidden="true"><b>0</b><small>{{ w.chart.unit }}</small></div>
              <div class="db-empty__note db-empty__note--left">
                <span class="db-empty__msg">{{ emptyMsg(w).text }}</span>
              </div>
            </template>
            <template v-else-if="w.type !== 'list' && w.chart.type === 'hbar'">
              <ul class="db-empty__rows" aria-hidden="true"><li v-for="(r, j) in w.chart.rows" :key="r.label"><span class="db-empty__rlabel">{{ r.label }}</span><span class="db-empty__track"><span :style="{ width: [18, 14, 9, 6, 4][j % 5] + '%' }" /></span><b>0</b></li></ul>
              <div class="db-empty__note db-empty__note--left">
                <span class="db-empty__msg">{{ emptyMsg(w).text }}</span>
              </div>
            </template>
            <!-- Danh sách xếp hạng trống: 5 dòng mờ (số thứ tự · avatar tròn · vạch tên · 0) + lời nhắn dưới -->
            <template v-else>
              <ul class="db-empty__rank" aria-hidden="true">
                <li v-for="(wd, j) in [62, 48, 70, 40, 55]" :key="j"><span class="db-empty__no">{{ j + 1 }}</span><span class="db-empty__av" /><span class="db-empty__name" :style="{ width: wd + '%' }" /><b>0</b></li>
              </ul>
              <div class="db-empty__note db-empty__note--left">
                <span class="db-empty__msg">{{ emptyMsg(w).text }}</span>
              </div>
            </template>
          </div>
          <!-- Danh sách xếp hạng = Danh sách trong card chuẩn (.card-list — /ds/data-visualization Dạng 1): icon · tên + dòng phụ · giá trị + dòng phụ bên phải -->
          <ul v-else-if="w.type === 'list'" class="card-list">
            <li v-for="r in TOP" :key="r.name" class="card-list__item" tabindex="0">
              <span class="card-list__icon card-list__icon--brand"><TIcon name="building" /></span>
              <div class="card-list__body"><span class="card-list__title">{{ r.name }}</span><span class="card-list__sub">{{ r.sub }}</span></div>
              <div class="card-list__end"><span class="card-list__value">{{ r.value }}</span><span class="card-list__sub">{{ r.share }}</span></div>
            </li>
          </ul>
          <!-- Biểu đồ: mỗi widget một loại (cột chồng · donut · thanh ngang · đường · cột phân kỳ), có nút xem dạng bảng số liệu -->
          <DbChart v-else :chart="w.chart" :title="w.title" :table="w.table" />
        </section>
        <button v-if="editing" type="button" class="db-add" @click="addWidget"><TIcon name="plus" />Thêm biểu đồ</button>
      </div>
    </div>

    <!-- Lưu / Hủy ghim cuối trang (quy chuẩn: không đặt ở đầu trang) -->
    <footer v-if="editing" class="db-foot">
      <button type="button" class="btn btn--outline btn--neutral" @click="cancel">Hủy</button>
      <button type="button" class="btn btn--primary" @click="save">Lưu</button>
    </footer>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import { currentTheme } from '@mds/theme.js'
import { CHART_COLORS, chartColors } from '@mds/utils/chartColors.js'
import TIcon from '@mds/components/TIcon.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import DropdownMenu from '@mds/components/DropdownMenu.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'
import DbChart from './DbChart.vue'
import EmptyArt from '@mds/components/EmptyArt.vue'
import SubNavTabs from '@mds/components/SubNavTabs.vue'
import { ensureAiGradient } from '@mds/utils/aiGradient.js'

const props = defineProps({
  loading: { type: Boolean, default: false },   // đang tải dữ liệu → khung xương trong chính các thẻ (không phủ cả trang)
  empty:   { type: String,  default: '' },      // '' | 'period' (kỳ đang lọc không có dữ liệu) | 'new' (tài khoản mới, chưa có gì)
  tabs:    { type: Boolean, default: true },    // dải tab Trợ lý AI · Tổng quan · Tính năng mới trên đầu màn
  tab:     { type: String,  default: null },    // v-model:tab (bỏ trống → tự giữ)
})
const emit = defineEmits(['empty-action', 'update:tab'])
onMounted(ensureAiGradient)
const TABS = [{ id: 'ai', label: 'Trợ lý AI' }, { id: 'overview', label: 'Tổng quan' }, { id: 'new', label: 'Tính năng mới' }]
const ownTab = ref('overview')
const curTab = computed(() => props.tab ?? ownTab.value)
function setTab(v) { ownTab.value = v; emit('update:tab', v) }
const MINI = [16, 24, 20, 28, 22, 32, 26, 34, 24, 28, 30, 36]   // cột trang trí của card trống (% chiều cao vùng biểu đồ)
const SK_BARS = [42, 58, 50, 72, 64, 84, 68, 90, 60, 78, 82, 96]
const VIEWS = [{ value: 'ceo', label: 'Giao diện Giám đốc' }, { value: 'kt', label: 'Giao diện Kế toán trưởng' }]
const PERIODS = [{ value: 'm', label: 'Tháng này' }, { value: 'q', label: 'Quý này' }, { value: 'y', label: 'Năm nay' }]
const view = ref('ceo'), period = ref('m')
const periodLabel = computed(() => PERIODS.find(p => p.value === period.value).label.toLowerCase())
/* Lời nhắn trống của từng card: nói đúng cái thiếu + kỳ */
function emptyMsg(w) {   // card trống: CHỈ thông báo (không link hành động trong card)
  const isNew = props.empty === 'new', k = periodLabel.value
  const M = {
    rev:    isNew ? 'Chưa có doanh thu' : `Chưa có doanh thu trong ${k}`,
    cost:   isNew ? 'Chưa có chi phí' : `Chưa có chi phí trong ${k}`,
    branch: isNew ? 'Chưa có doanh thu theo chi nhánh' : `Các chi nhánh chưa có doanh thu trong ${k}`,
    profit: isNew ? 'Cần ít nhất 2 kỳ có dữ liệu để so sánh' : `Chưa có lợi nhuận trong ${k} để so sánh`,
    cash:   isNew ? 'Chưa có thu, chi tiền' : `Chưa có thu, chi tiền trong ${k}`,
    top:    isNew ? 'Chưa có khách hàng phát sinh doanh thu' : `Chưa có khách hàng mua hàng trong ${k}`,
  }
  return { text: M[w.id] || (isNew ? 'Chưa có dữ liệu' : `Chưa có dữ liệu trong ${k}`) }
}
const KPIS = [
  // good: chỉ số đổi theo hướng TỐT → xanh, XẤU → đỏ (chi phí / công nợ giảm là tốt)
  { label: 'Doanh thu', value: '4,83', unit: 'tỷ', delta: '12,4%', up: true, good: true, icon: 'coin', tone: 'brand' },
  { label: 'Chi phí', value: '2,14', unit: 'tỷ', delta: '3,1%', up: false, good: true, icon: 'wallet', tone: 'warning' },
  { label: 'Lợi nhuận', value: '2,68', unit: 'tỷ', delta: '18,9%', up: true, good: true, icon: 'chart-line', tone: 'success' },
  { label: 'Công nợ phải thu', value: '1,03', unit: 'tỷ', delta: '5,2%', up: true, good: false, icon: 'file-invoice', tone: 'purple' },
]
const SPANS = [{ id: 1, label: '1/3 hàng' }, { id: 2, label: '2/3 hàng' }, { id: 3, label: 'Cả hàng' }]
// Số liệu mẫu (triệu đồng). Màu chuỗi = palette biểu đồ THEO MÀU CHỦ ĐỀ (Figma 🌈 Chart Colors — như trang Biểu đồ), lấy thứ tự cố định 1 → 2 → 3 → 4; kỳ so sánh dùng xám nét đứt
const MONTHS = Array.from({ length: 12 }, (_, i) => 'T' + (i + 1))
const C = ['', '', '', '']   // gán màu thật ở applyPalette() theo màu chủ đề
const CHARTS = reactive({
  rev: { type: 'stack', unit: 'triệu', catLabel: 'Tháng', cats: MONTHS, series: [
    { label: 'Bán hàng', color: C[0], data: [210, 245, 228, 290, 276, 318, 300, 342, 286, 305, 336, 372] },
    { label: 'Dịch vụ',  color: C[1], data: [96, 102, 110, 118, 124, 131, 128, 140, 122, 134, 146, 158] },
    { label: 'Khác',     color: C[2], data: [24, 30, 22, 36, 28, 40, 34, 38, 30, 33, 42, 46] },
  ] },
  cost: { type: 'donut', unit: 'triệu', segs: [
    { label: 'Giá vốn hàng bán', value: 1180, color: C[0] }, { label: 'Lương nhân viên', value: 520, color: C[1] },
    { label: 'Marketing', value: 260, color: C[2] }, { label: 'Chi phí khác', value: 180, color: C[3] },
  ] },
  branch: { type: 'hbar', unit: 'triệu', rows: [
    { label: 'Hà Nội', value: 1850 }, { label: 'TP. Hồ Chí Minh', value: 1620 }, { label: 'Đà Nẵng', value: 640 }, { label: 'Cần Thơ', value: 410 }, { label: 'Hải Phòng', value: 305 },
  ] },
  profit: { type: 'line', unit: 'triệu', catLabel: 'Tháng', cats: MONTHS, series: [
    { label: 'Năm nay', color: C[0], data: [120, 138, 126, 170, 162, 196, 184, 215, 172, 190, 224, 248] },
    { label: 'Năm trước', color: C[2], dash: true, data: [98, 110, 118, 132, 128, 150, 158, 166, 150, 160, 176, 190] },
  ] },
  cash: { type: 'diverge', unit: 'triệu', catLabel: 'Tháng', cats: MONTHS, data: [85, 42, -36, 120, 64, -58, 96, 140, -22, 75, 110, 160],
    poles: [{ label: 'Thu nhiều hơn chi', color: C[0] }, { label: 'Chi nhiều hơn thu', color: C[1] }] },
})
/* Đổi màu chủ đề → đổi palette biểu đồ (thứ tự màu cố định theo vị trí chuỗi) */
function applyPalette(p, dv) {
  CHARTS.rev.series.forEach((s, i) => (s.color = p[i]))
  CHARTS.cost.segs.forEach((s, i) => (s.color = p[i]))
  CHARTS.branch.color = p[0]
  CHARTS.profit.series[0].color = p[0]; CHARTS.profit.series[1].color = p[2]   // năm trước: màu 3 + nét đứt (như trang Biểu đồ)
  CHARTS.cash.poles[0].color = dv[0]; CHARTS.cash.poles[1].color = dv[dv.length - 1]   // tăng / giảm quanh mốc 0 → 2 cực bộ Divergent
}
watchEffect(() => { const f = CHART_COLORS[currentTheme.value] ? currentTheme.value : 'blue'; applyPalette(chartColors(f, 'palette'), chartColors(f, 'divergent')) })
const DEFAULT = [
  { id: 'rev', title: 'Doanh thu theo nhóm', type: 'chart', span: 2, chart: CHARTS.rev },
  { id: 'cost', title: 'Cơ cấu chi phí', type: 'chart', span: 1, chart: CHARTS.cost },
  { id: 'branch', title: 'Doanh thu theo chi nhánh', type: 'chart', span: 1, chart: CHARTS.branch },
  { id: 'profit', title: 'Lợi nhuận so với cùng kỳ', type: 'chart', span: 2, chart: CHARTS.profit },
  { id: 'cash', title: 'Dòng tiền thuần theo tháng', type: 'chart', span: 2, chart: CHARTS.cash },
  { id: 'top', title: 'Khách hàng doanh thu cao', type: 'list', span: 1 },
]
const clone = l => l.map(w => ({ ...w }))
const list = reactive(clone(DEFAULT))
let saved = clone(DEFAULT)
const TOP = [
  { name: 'Công ty CP Năng lượng Phú Gia', sub: 'Hà Nội · 18 đơn', value: '540,3 tr', share: '11,2% doanh thu' },
  { name: 'Công ty CP Dược phẩm Cát Tường', sub: 'TP. Hồ Chí Minh · 12 đơn', value: '312,0 tr', share: '6,5% doanh thu' },
  { name: 'Công ty CP Logistics Long Hải', sub: 'Hải Phòng · 9 đơn', value: '230,0 tr', share: '4,8% doanh thu' },
  { name: 'Công ty CP Thương mại An Phát', sub: 'Đà Nẵng · 7 đơn', value: '125,4 tr', share: '2,6% doanh thu' },
]

const CARD_MENU = [{ id: 'refresh', label: 'Làm mới số liệu', icon: 'refresh' }, { id: 'setup', label: 'Thiết lập biểu đồ', icon: 'adjustments' }, { id: 'hide', label: 'Ẩn khỏi Tổng quan', icon: 'eye-off' }]
const menuFor = ref(null)
function cardAction(it, w) {
  if (it.id === 'refresh') toast.success(`Đã làm mới “${w.title}”`)
  else if (it.id === 'setup') toast.info('Mở thiết lập biểu đồ (mẫu)')
  else { const i = list.indexOf(w); list.splice(i, 1); saved = clone(list); toast.success(`Đã ẩn “${w.title}”`) }
}
const scrollEl = ref(null), sbw = ref(0)
let ro
onMounted(() => { ro = new ResizeObserver(() => { const e = scrollEl.value; if (e) sbw.value = e.offsetWidth - e.clientWidth }); ro.observe(scrollEl.value); ro.observe(scrollEl.value.firstElementChild) })
onBeforeUnmount(() => ro?.disconnect())
const editing = ref(false), dragIdx = ref(null), overIdx = ref(null)
function startEdit() { saved = clone(list); editing.value = true }
function cancel() { list.splice(0, list.length, ...clone(saved)); editing.value = false }
function save() { saved = clone(list); editing.value = false; toast.success('Đã lưu giao diện') }
function drop(i) { if (dragIdx.value == null || dragIdx.value === i) return; const [m] = list.splice(dragIdx.value, 1); list.splice(i, 0, m); dragIdx.value = overIdx.value = null }
function addWidget() { list.push({ id: 'n' + Date.now(), title: 'Biểu đồ mới', type: 'chart', span: 1, chart: CHARTS.branch }) }
</script>

<style scoped>
.db-page { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.db-subnav { position: relative; z-index: 7; flex-shrink: 0; }
.db-ai-icon { color: var(--ai-begin-600); }   /* màu dự phòng — icon tô gradient AI qua .ti--ai (Icon/AI là gradient) */
.db-new { margin-left: 4px; background: var(--bg-warning); color: var(--text-white); }   /* tag “Mới” cam như Figma */
.db-tabholder { flex: 1; display: flex; align-items: center; justify-content: center; }
.db-head { position: relative; z-index: 6; flex-shrink: 0; display: flex; align-items: center; gap: var(--gap-control); padding: 16px 16px 10px; background: var(--bg-page); }   /* control ↔ control 8; tiêu đề → KPI 12 (10 + 2 đệm trên vùng cuộn để không cắt bóng card) */
.db-title { margin: 0; font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); }
.db-view { width: 240px; }
.db-period { width: 140px; }
.db-sp { flex: 1; }
.db-scroll { container-type: inline-size; flex: 1; min-height: 0; overflow: auto; padding: 2px 16px 16px; display: flex; flex-direction: column; gap: var(--card-col-gap); }
.db-kpi { display: flex; align-items: flex-start; gap: 12px; padding: var(--box-padding); }
.db-kpi__body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.db-kpi__label { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.db-kpi .kpi-value { white-space: nowrap; }
.db-delta { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 4px; font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); }
.db-delta .ti { font-size: 16px; }
.db-vs { font-weight: var(--fw-regular); color: var(--text-secondary); }
.db-kpi__icon { width: 44px; height: 44px; flex-shrink: 0; border-radius: 10px; }   /* khung xương = đúng cỡ .kpi-icon */
.db-up, .db-down { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-body); white-space: nowrap; min-width: 0; }
/* App co hẹp (VD mở panel chat / Trợ giúp → vùng app còn ~1024px): số KPI vẫn 1 dòng — giảm về cỡ H3, ẩn chữ “so với kỳ trước” */
@container (max-width: 1000px) { .db-vs { display: none; } }
.db-up { color: var(--text-success); }
.db-down { color: var(--text-danger); }
.db-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--card-col-gap); }   /* card ↔ card 16 */
.db-widget { display: flex; flex-direction: column; gap: 12px; padding: var(--card-py) var(--card-px); min-height: 260px; min-width: 0; }
.db-widget--1 { grid-column: span 1; }
.db-widget--2 { grid-column: span 2; }
.db-widget--3 { grid-column: span 3; }
.db-widget--edit { cursor: grab; outline: 1px dashed var(--stroke-brand-light); }
.db-widget--over { outline: 2px solid var(--stroke-brand); }
.db-widget__head { display: flex; align-items: center; gap: 8px; min-height: var(--text-h3-lh); }
.db-widget__title { flex: 1; min-width: 0; margin: 0; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;  padding-block: 2px; margin-block: -2px;   /* cắt “…” không cụt dấu chồng */ }   /* = .card__title (H3 16 semibold) */
.db-widget__acts { display: flex; align-items: center; gap: 4px; margin: calc((var(--text-h3-lh) - var(--btn-height) + 4px) / 2) 0;   /* nút sm cao hơn dòng tiêu đề → bù âm để hàng tiêu đề không đẩy padding trên rộng ra */
  opacity: 0; transition: opacity 0.15s; }
.db-widget:hover .db-widget__acts, .db-widget:focus-within .db-widget__acts, .db-widget__acts--open { opacity: 1; }
@media (hover: none) { .db-widget__acts { opacity: 1; } }   /* màn cảm ứng không có hover → luôn hiện */
.db-grip { color: var(--icon-neutral); }
.db-add { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 220px; border: 1px dashed var(--stroke-neutral); border-radius: var(--radius-card); background: transparent; color: var(--text-brand); font: inherit; cursor: pointer; }
.db-add:hover { background: var(--bg-brand-light); border-color: var(--stroke-brand); }
.db-foot { display: flex; justify-content: flex-end; gap: var(--gap-control); padding: 12px 16px; background: var(--bg-form-footer); border-top: 1px solid var(--stroke-form-footer); }

/* ── Khung xương khi đang tải (prop loading): giữ nguyên khung thẻ thật → tải xong không giật ── */
.db-sk-line { display: flex; align-items: center; height: var(--text-body-lh); }
.db-sk-line--val { height: var(--text-h1-lh); margin: 4px 0; }   /* = .kpi-value: số H1 (dòng 32) + lề 4 trên / dưới → tải xong không xê dịch */
.db-sk-line--val .skel { height: 20px; }
.db-sk-chart { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 12px; overflow: hidden; }
.db-sk-legend { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 0; }
.db-sk-legend--row { flex: 0 0 auto; flex-direction: row; gap: 16px; }
.db-sk-chip { width: 64px; height: 12px; }
.db-sk-plot { flex: 1; min-height: 0; display: flex; align-items: flex-end; gap: 12px; padding-bottom: 24px; }   /* chừa dải nhãn trục ngang như biểu đồ thật */
.db-sk-plot .skel { flex: 1; min-width: 0; border-radius: var(--radius-sm) var(--radius-sm) 0 0; }
.db-sk-chart--donut { flex-direction: row; align-items: center; gap: 16px; }
.db-sk-donut { width: 128px; height: 128px; flex-shrink: 0; border-radius: var(--radius-pill); }
.db-sk-chart--hbar, .db-sk-chart--list { justify-content: space-around; }
.db-sk-row { display: flex; align-items: center; gap: 12px; height: var(--text-body-lh); }
.db-sk-row .skel:first-child { flex: 0 1 auto; }
.db-sk-chart--list .db-sk-row { justify-content: space-between; }
.db-sk-label { width: 88px; flex-shrink: 0; }
.db-sk-num { width: 48px; flex-shrink: 0; }
.db-widget__acts--wait { visibility: hidden; }   /* đang tải: giữ chỗ cụm nút (không bấm được) → tiêu đề không đổi bề rộng */

/* ── Trống: khung biểu đồ rỗng (lưới mảnh, nhãn trục, vòng rỗng, rãnh rỗng) + 1 dòng chữ phụ + link nhỏ ── */
.db-empty { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 8px; }
.db-empty__plot { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: space-between; padding-top: 8px; }
.db-empty__grid { display: block; height: 0; border-top: 1px dashed var(--stroke-neutral-light); }
.db-empty__grid--base { border-top-style: solid; border-top-color: var(--stroke-neutral); }
.db-empty__axis { display: flex; justify-content: space-around; font-size: var(--text-body-sm); line-height: var(--text-sm-lh); color: var(--text-hint); }
.db-empty__note { display: flex; flex-direction: column; align-items: center; gap: 0; text-align: center; }
.db-empty__plot .db-empty__note { position: absolute; left: 50%; top: 42%; transform: translate(-50%, -50%); z-index: 1; max-width: 80%; padding: 4px 12px; background: var(--bg-white); }   /* nền trắng chỉ để ngắt đường lưới sau chữ · hơi cao hơn giữa để không chạm cột nhỏ */
.db-empty__note--left { align-items: flex-start; text-align: left; }
.db-empty__msg { color: var(--text-secondary); }
.db-empty--donut { flex-direction: row; align-items: center; gap: 24px; }
.db-empty__ring { flex-shrink: 0; width: 128px; height: 128px; border-radius: 50%; box-sizing: border-box; border: 16px solid var(--bg-neutral-hover); display: flex; flex-direction: column; align-items: center; justify-content: center; }
.db-empty__ring b { font-size: var(--text-body-lg); line-height: 1.2; color: var(--text-secondary); }
.db-empty__ring small { font-size: var(--text-body); color: var(--text-hint); }
.db-empty--hbar { justify-content: space-between; }
.db-empty__rows { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.db-empty__rows li { display: flex; align-items: center; gap: 12px; color: var(--text-hint); }
.db-empty__rlabel { width: 110px; flex-shrink: 0; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.db-empty__track { flex: 1; height: 8px; border-radius: var(--radius-pill); background: var(--bg-neutral-light); overflow: hidden; }
.db-empty__track > span { display: block; height: 100%; border-radius: inherit; background: var(--bg-neutral-hover); }
/* Cột / đường trang trí trong vùng biểu đồ trống: nhỏ, mảnh, xám nhạt, nằm thấp dưới lời nhắn */
.db-empty__bars { position: absolute; left: 0; right: 0; bottom: 1px; height: 100%; display: flex; justify-content: space-around; align-items: flex-end; pointer-events: none; }
.db-empty__bars span { width: 10px; border-radius: 3px 3px 0 0; background: var(--bg-neutral-hover); }
.db-empty__line { position: absolute; left: 0; right: 0; bottom: 4px; width: 100%; height: 34%; pointer-events: none; overflow: visible; }
.db-empty__line polyline { fill: none; stroke: var(--bg-neutral-pressed); stroke-width: 2; vector-effect: non-scaling-stroke; stroke-linecap: round; stroke-linejoin: round; }
.db-empty__rows b { width: 40px; text-align: right; font-weight: var(--fw-semibold); color: var(--text-hint); }
.db-empty--list { justify-content: space-between; }
.db-empty__rank { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.db-empty__rank li { display: flex; align-items: center; gap: 10px; }
.db-empty__no { width: 12px; flex-shrink: 0; text-align: center; font-size: var(--text-body-sm); color: var(--text-hint); }
.db-empty__av { width: 20px; height: 20px; flex-shrink: 0; border-radius: 50%; background: var(--bg-neutral-hover); }
.db-empty__name { height: 8px; border-radius: var(--radius-pill); background: var(--bg-neutral-light); }
.db-empty__rank b { margin-left: auto; font-weight: var(--fw-semibold); color: var(--text-hint); }
/* Tài khoản mới: khối đầu trang có hình minh họa (1 lần) — hình trái, chữ + nút phải */
.db-start { display: flex; align-items: center; gap: 24px; padding: var(--box-padding) 24px; }
.db-start__txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.db-start__title { margin: 0; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.db-start__desc { margin: 0; color: var(--text-secondary); }
.db-start__cta { display: flex; gap: var(--gap-control); margin-top: 12px; }
</style>
