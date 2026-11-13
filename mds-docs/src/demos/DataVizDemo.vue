<template>
  <div class="demo-stack">
    <!-- Bộ màu biểu đồ từ Figma › Variables › 🌈 Chart Colors: 10 họ màu (theo màu chủ đề) × 3 kiểu -->
    <div class="demo-row dv-pick" data-dsi-ignore>
      <span class="demo-muted">Bộ màu:</span>
      <div class="dv-fams" role="radiogroup" aria-label="Họ màu biểu đồ">
        <button v-for="(f, id) in CHART_COLORS" :key="id" type="button" class="dv-fam" :class="{ 'dv-fam--on': family === id }" role="radio" :aria-checked="family === id"
          v-tip="`${f.label} (Figma: ${f.figma})`" :aria-label="f.label" @click="family = id; picked = true">
          <span v-for="c in f[mode].slice(0, 4)" :key="c" :style="{ background: c }" />
        </button>
      </div>
      <span class="demo-muted">Kiểu:</span>
      <div class="seg" role="group" aria-label="Kiểu bộ màu">
        <button v-for="m in CHART_MODES" :key="m.id" type="button" class="seg__item" :class="{ 'seg__item--active': mode === m.id }" :aria-pressed="mode === m.id" @click="mode = m.id">{{ m.label }}</button>
      </div>
    </div>
    <!-- Biểu đồ nhỏ trong KPI: tắt · mỗi thẻ 1 kiểu (theo ý nghĩa chỉ số) · tất cả cùng 1 kiểu -->
    <div class="demo-row dv-pick" data-dsi-ignore>
      <span class="demo-muted">Biểu đồ nhỏ trong KPI:</span>
      <AppSegmented v-model="sparkMode" :options="SPARK_MODES" aria-label="Biểu đồ nhỏ trong KPI" />
    </div>
    <!-- Xem thử các thuộc tính hay dùng của biểu đồ: nhãn số liệu · chú thích (vị trí) · đường lưới · tên trục · đường cong mượt · tên tháng ngắn / dài -->
    <div class="demo-row dv-pick dv-opts" data-dsi-ignore>
      <AppCheckbox v-model="labels" label="Nhãn số liệu (data label)" />
      <AppCheckbox v-model="gridOn" label="Đường lưới (grid line)" />
      <AppCheckbox v-model="axisTitle" label="Tên trục (axis title)" />
      <AppCheckbox v-model="smooth" label="Đường cong mượt (smooth)" />
      <span class="demo-muted">Chú thích (legend):</span>
      <div class="seg" role="group" aria-label="Vị trí chú thích">
        <button v-for="m in LEGEND_POS" :key="m.id" type="button" class="seg__item" :class="{ 'seg__item--active': legendPos === m.id }" :aria-pressed="legendPos === m.id" @click="legendPos = m.id">{{ m.label }}</button>
      </div>
      <span class="demo-muted">Tên tháng / thứ:</span>
      <div class="seg" role="group" aria-label="Kiểu tên tháng và thứ">
        <button v-for="m in MONTH_MODES" :key="m.id" type="button" class="seg__item" :class="{ 'seg__item--active': monthMode === m.id }" :aria-pressed="monthMode === m.id" @click="monthMode = m.id">{{ m.label }}</button>
      </div>
    </div>
    <div class="dv-swatches" data-dsi-ignore aria-label="7 màu của bộ đang chọn">
      <span v-for="(c, i) in pal" :key="i" class="dv-swatch"><i :style="{ background: c }" />{{ i + 1 }} · {{ c }}</span>
    </div>
    <span class="demo-muted">Score card + biểu đồ phổ biến vẽ bằng Apache ECharts (cột bo 4px đỉnh · donut khe 2px · tooltip số 1.234.567). Màu lấy theo thứ tự cố định 1 → 7 của bộ đang chọn; mặc định theo màu chủ đề. Rê chuột lên biểu đồ để xem giá trị.</span>
    <div ref="dvEl" class="dv">
      <!-- KPI card (score card): mặc định chỉ số + icon; bật “Biểu đồ nhỏ trong KPI” → thêm sparkline dưới icon. Tiêu đề H3 · số lớn + đơn vị · % thay đổi so với kỳ trước bên trái;
           icon outline nền nhạt góc phải trên, đường xu hướng (nét 2px, nền gradient rất nhạt, đánh dấu điểm cao nhất) góc phải dưới — cùng 1 màu với icon -->
      <div class="dv-kpis dv-kpis--spark">
        <div v-for="k in SPARKS" :key="k.id" class="card dv-spark" :class="{ 'dv-spark--full': sparkMode === 'progress-full' }">
          <div class="dv-spark__main">
            <span class="dv-chart__title">{{ k.label }}</span>
            <div class="kpi-value"><span class="kpi-value__num">{{ fmtNum(k.value, { decimals: k.decimals ?? 0 }) }}</span><span class="kpi-value__unit">{{ k.unit }}</span></div>
            <span class="dv-kpi__delta" :class="k.good ? 'dv-kpi__delta--up' : 'dv-kpi__delta--down'">
              <TIcon :name="k.delta > 0 ? 'trending-up' : 'trending-down'" />{{ k.delta > 0 ? '+' : '' }}{{ fmtNum(k.delta, { decimals: 1 }) }}%
              <span class="dv-kpi__vs">so với kỳ trước</span>
            </span>
          </div>
          <div class="dv-spark__side">
            <div :ref="el => (iconEls[k.id] = el)" class="kpi-icon" :class="`kpi-icon--${k.theme}`"><TIcon :name="k.icon" /></div>
            <div v-show="sparkMode !== 'off' && !kindOf(k).startsWith('progress')" :ref="el => (sparkEls[k.id] = el)" class="dv-spark__chart" role="img" :aria-label="`Xu hướng ${k.label}`" />
            <!-- Dạng thanh tiến độ: nằm ĐÚNG CHỖ biểu đồ nhỏ (cột phải, dưới icon) → thẻ không cao thêm · màu = màu icon, nền BG Neutral Light, % bên phải -->
            <div v-if="kindOf(k) === 'progress'" class="dv-prog" :class="`dv-prog--${k.theme}`" role="progressbar" :aria-valuenow="k.goal" aria-valuemin="0" aria-valuemax="100" :aria-label="`${k.label}: ${k.goalLabel} ${k.goal}%`">
              <span class="dv-prog__track"><span class="dv-prog__fill" :style="{ width: k.goal + '%' }" /></span>
              <span class="dv-prog__pct">{{ k.goal }}%</span>
            </div>
          </div>
          <!-- Tiến độ DÀI: thanh hết bề ngang thẻ, nằm dưới (thẻ cao hơn — cả hàng cao bằng nhau) -->
          <div v-if="kindOf(k) === 'progress-full'" class="dv-prog dv-prog--full" :class="`dv-prog--${k.theme}`" role="progressbar" :aria-valuenow="k.goal" aria-valuemin="0" aria-valuemax="100" :aria-label="`${k.label}: ${k.goalLabel} ${k.goal}%`">
            <span class="dv-prog__track"><span class="dv-prog__fill" :style="{ width: k.goal + '%' }" /></span>
            <span class="dv-prog__pct">{{ k.goal }}%</span>
          </div>
        </div>
      </div>

      <div class="dv-charts">
        <div v-for="c in CHARTS" :key="c.id" class="card dv-chart" :class="{ 'dv-chart--wide': c.wide }">
          <div class="dv-chart__head">
            <span class="dv-chart__title">{{ c.title }}</span>
            <span v-if="!narrow" class="dv-chart__type">{{ c.type }}</span>
          </div>
          <div :ref="el => (els[c.id] = el)" class="dv-chart__area" :class="[c.tall && 'dv-chart__area--tall', c.xl && 'dv-chart__area--xl']" role="img" :aria-label="c.title" />
        </div>
        <!-- Danh sách trong card (.card-list của mds-ui): KHÔNG header cột — mỗi dòng: avatar / icon · tên + dòng phụ · giá trị + dòng phụ bên phải.
             Dùng khi chỉ cần “tên ↔ giá trị” (top nhân viên, đơn gần đây, công việc quá hạn); cần so sánh nhiều cột → DataTable. -->
        <div v-for="l in LISTS" :key="l.id" class="card dv-chart dv-list">
          <div class="dv-chart__head">
            <span class="dv-chart__title">{{ l.title }}<span v-if="l.count" class="dv-list__count">{{ l.count }}</span></span>
            <span v-if="!narrow" class="dv-chart__type">Danh sách</span>
            <a href="#" class="btn btn--text dv-list__more" @click.prevent>Xem tất cả</a>
          </div>
          <ul class="card-list">
            <li v-for="it in l.items" :key="it.title" class="card-list__item" tabindex="0">
              <AppAvatar v-if="it.person" :name="it.person" :size="32" color="auto" />
              <span v-else class="card-list__icon" :class="it.iconColor && `card-list__icon--${it.iconColor}`"><TIcon :name="it.icon" /></span>
              <div class="card-list__body">
                <span class="card-list__title">{{ it.title }}</span>
                <span class="card-list__sub">{{ it.sub }}</span>
              </div>
              <div class="card-list__end">
                <span v-if="it.value" class="card-list__value" :class="it.valueColor && `card-list__value--${it.valueColor}`">{{ it.value }}</span>
                <AppTag v-if="it.tag" :label="it.tag.label" :color="it.tag.color" dot />
                <span v-if="it.meta" class="card-list__sub">{{ it.meta }}</span>
              </div>
            </li>
          </ul>
        </div>
        <!-- Dạng 2 — Bảng có header cột: DataTable chuẩn + prop summary (bảng tóm tắt chỉ xem) — không ghi đè style riêng.
             Khi cần so sánh nhiều thuộc tính theo cột (giá trị · tiến độ · trạng thái…). -->
        <div v-for="t in TABLES" :key="t.id" class="card dv-chart dv-list">
          <div class="dv-chart__head">
            <span class="dv-chart__title">{{ t.title }}</span>
            <span v-if="!narrow" class="dv-chart__type">Bảng</span>
            <a href="#" class="btn btn--text dv-list__more" @click.prevent>Xem tất cả</a>
          </div>
          <DataTable :columns="t.cols.map(c => ({ ...c, hidden: narrow && c.narrowHide, ...(narrow && c.narrowWidth ? { width: c.narrowWidth } : {}) }))" :rows="t.rows" summary :hide-blank-rows="false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import TIcon from '@mds/components/TIcon.vue'
import AppAvatar from '@mds/components/AppAvatar.vue'
import AppTag from '@mds/components/AppTag.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'
import AppSegmented from '@mds/components/AppSegmented.vue'
import DataTable from '@mds/components/DataTable.vue'
import { fmtNum } from '@mds/utils/number.js'
import { currentTheme } from '@mds/theme.js'
import { CHART_COLORS, CHART_MODES, chartColors } from '@mds/utils/chartColors.js'
import { vTip } from '@mds/utils/tooltip.js'

const CHARTS = [
  { id: 'donut', title: 'Cơ cấu doanh thu theo kênh', type: 'Donut' },
  { id: 'column', title: 'Doanh thu theo tháng', type: 'Column' },
  { id: 'bar', title: 'Top 5 sản phẩm bán chạy', type: 'Bar' },
  { id: 'line', title: 'Doanh thu 2026 so với 2025', type: 'Line' },
  { id: 'stackColumn', title: 'Doanh thu theo kênh từng quý', type: 'Stacked column' },
  { id: 'stackBar', title: 'Tiến độ công việc theo phòng ban', type: 'Stacked bar (100%)' },
  { id: 'radar', title: 'Đánh giá năng lực đội ngũ', type: 'Radar (Spiderweb)', tall: true },
  { id: 'bubble', title: 'Giá bán × số lượng × doanh thu', type: 'Bubble', tall: true },
  { id: 'area', title: 'Lượt truy cập website 30 ngày qua', type: 'Area', wide: true },
]
/* Biểu đồ thêm (theo mẫu ECharts): area + thanh kéo vùng xem · cột + đường 2 trục · cột có nền · area chồng gradient nhạt · thanh ngang 2 năm ·
   cột nhóm từ dataset · heatmap · phễu · đồng hồ · phân cụm · bản đồ */
CHARTS.push(
  { id: 'areaZoom', title: 'Giá trị giao dịch hằng ngày năm 2025', type: 'Area + kéo vùng xem', wide: true },
  { id: 'mixLineBar', title: 'Doanh thu, chi phí và biên lợi nhuận', type: 'Column + line (2 trục)' },
  { id: 'barBg', title: 'Đơn hàng theo ngày trong tuần', type: 'Column (có nền)' },
  { id: 'areaStack', title: 'Lượt truy cập theo kênh', type: 'Area (gradient)' },
  { id: 'barY', title: 'Doanh số theo khu vực', type: 'Bar (so sánh 2 năm)' },
  { id: 'dataset', title: 'Doanh số theo dòng sản phẩm', type: 'Column nhóm (dataset)' },
  { id: 'heatmap', title: 'Đơn hàng theo giờ trong tuần', type: 'Heatmap' },
  { id: 'funnel', title: 'Phễu chuyển đổi bán hàng', type: 'Funnel' },
  { id: 'gauge', title: 'Hoàn thành chỉ tiêu năm', type: 'Gauge' },
  { id: 'cluster', title: 'Phân cụm khách hàng', type: 'Scatter (phân cụm)', wide: true, tall: true },
  { id: 'geo', title: 'Doanh thu xuất khẩu theo thị trường', type: 'Bản đồ (choropleth + điểm)', wide: true, xl: true },
)
/* KPI có biểu đồ nhỏ: spark = 12 kỳ gần nhất (kỳ cuối = giá trị hiện tại), dáng TỰ NHIÊN — thấp → lên dần, chững / giảm nhẹ rồi lại lên (không giật) — đỉnh (chấm) rơi trong chuỗi, không phải lúc nào cũng ở cuối;
   màu card (icon + đường) theo Ý NGHĨA: chỉ số tăng là XẤU (chi phí, tỷ lệ hoàn đơn…) → danger */
const SPARKS = [
  { id: 'rev', label: 'Doanh thu', value: 318, unit: 'tỷ đồng', delta: 50, good: true, icon: 'currency-dollar', theme: 'success', kind: 'area', goal: 67, goalLabel: 'đạt chỉ tiêu', spark: [236, 244, 256, 270, 266, 282, 298, 316, 328, 320, 312, 318] },
  { id: 'profit', label: 'Lợi nhuận gộp', value: 86.4, decimals: 1, unit: 'tỷ đồng', delta: 12.3, good: true, icon: 'chart-line', theme: 'brand', kind: 'bar', goal: 78, goalLabel: 'đạt chỉ tiêu', spark: [70, 72, 75, 78, 77, 80, 84, 88, 90, 87, 85, 86.4] },
  { id: 'back', label: 'Khách hàng quay lại', value: 41.8, decimals: 1, unit: '%', delta: 3.6, good: true, icon: 'users', theme: 'info', kind: 'line', goal: 84, goalLabel: 'đạt mục tiêu', spark: [37.0, 37.6, 38.3, 39.1, 38.9, 39.8, 40.9, 42.0, 42.6, 42.1, 41.6, 41.8] },
  { id: 'orders', label: 'Đơn hàng mới', value: 1284, unit: 'đơn', delta: -8.4, good: false, icon: 'shopping-cart', theme: 'danger', kind: 'progress', goal: 62, goalLabel: 'đạt chỉ tiêu', spark: [1520, 1498, 1466, 1442, 1471, 1424, 1392, 1408, 1361, 1333, 1302, 1284] },   // GIẢM và XẤU → ↘ đỏ
]
/* Số ngẫu nhiên CỐ ĐỊNH (seed) — dữ liệu mẫu giống nhau mỗi lần tải */
const rng = (seed = 7) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
/* Chữ trên nền màu: nền đậm → Text/White, nền nhạt → Text/Primary (độ sáng tương đối) */
const lum = hex => { const n = parseInt(hex.slice(1, 7), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] }
const ink = hex => (lum(hex) > 0.4 ? cssVar('--text-primary') : cssVar('--text-white'))
/* Bản đồ: geoJSON thế giới (tên nước tiếng Anh) tải khi cần · tên hiển thị tiếng Việt */
const COUNTRY_VI = { 'United States': 'Hoa Kỳ', Japan: 'Nhật Bản', Korea: 'Hàn Quốc', China: 'Trung Quốc', Germany: 'Đức', Australia: 'Úc', France: 'Pháp', 'United Kingdom': 'Anh', India: 'Ấn Độ', Thailand: 'Thái Lan', Canada: 'Canada', Singapore: 'Singapore', Malaysia: 'Malaysia', Netherlands: 'Hà Lan', Vietnam: 'Việt Nam', Cambodia: 'Campuchia', 'Lao PDR': 'Lào', Brazil: 'Brazil', 'United Arab Emirates': 'UAE', Indonesia: 'Indonesia', Philippines: 'Philippines' }
const EXPORT = { 'United States': 1250, China: 980, Japan: 640, Korea: 560, Germany: 310, Netherlands: 240, 'United Kingdom': 210, Australia: 190, India: 170, Canada: 150, France: 140, Thailand: 130, Malaysia: 120, Cambodia: 95, Indonesia: 90, Philippines: 85, 'United Arab Emirates': 70, Brazil: 45, 'Lao PDR': 30 }
const OFFICES = [['Hà Nội', 105.85, 21.03, 'Trụ sở'], ['TP. Hồ Chí Minh', 106.66, 10.76, 'Chi nhánh'], ['Tokyo', 139.69, 35.68, 'Văn phòng'], ['Seoul', 126.98, 37.57, 'Văn phòng'], ['Singapore', 103.82, 1.35, 'Văn phòng'], ['Los Angeles', -118.24, 34.05, 'Văn phòng'], ['Rotterdam', 4.48, 51.92, 'Kho'], ['Sydney', 151.21, -33.87, 'Văn phòng']]
const geoReady = ref(false)
async function loadGeo() {
  if (echarts.getMap('world')) { geoReady.value = true; return }
  try { const r = await fetch(import.meta.env.BASE_URL + 'geo/world.json'); echarts.registerMap('world', await r.json()); geoReady.value = true } catch { /* không tải được bản đồ → để trống card */ }
}
/* Danh sách trong card (không header cột): person → avatar màu theo tên · icon (+ iconColor) · value / tag / meta ở bên phải */
const LISTS = [
  { id: 'staff', title: 'Nhân viên bán hàng xuất sắc', items: [
    { person: 'Nguyễn Thu Hà', title: 'Nguyễn Thu Hà', sub: 'Chi nhánh Hà Nội', value: '1.248 tr', meta: '100% chỉ tiêu' },
    { person: 'Trần Minh Quân', title: 'Trần Minh Quân', sub: 'Chi nhánh TP.HCM', value: '1.105 tr', meta: '92% chỉ tiêu' },
    { person: 'Lê Hoàng Yến', title: 'Lê Hoàng Yến', sub: 'Chi nhánh Đà Nẵng', value: '986 tr', meta: '85% chỉ tiêu' },
    { person: 'Phạm Đức Anh', title: 'Phạm Đức Anh', sub: 'Chi nhánh Hà Nội', value: '874 tr', meta: '76% chỉ tiêu' },
    { person: 'Vũ Ngọc Ánh', title: 'Vũ Ngọc Ánh', sub: 'Chi nhánh Cần Thơ', value: '712 tr', meta: '64% chỉ tiêu' },
  ] },
]
/* Tên tháng: ngắn T1 (mặc định — gọn, đủ hiểu) · dài “Tháng 1” → nhãn trục tự xử lý (monthAxis) */
/* Dạng bảng trong card — narrowHide: ẩn khi khung hẹp · narrowWidth: độ rộng cột khi khung hẹp */
const TABLES = [
  { id: 'ordersT', title: 'Đơn hàng chờ xử lý', cols: [
    { key: 'code', label: 'Đơn hàng', type: 'subtext', minWidth: 112 },
    { key: 'value', label: 'Giá trị', align: 'right', width: 116, narrowHide: true },
    { key: 'status', label: 'Trạng thái', type: 'status', width: 148, narrowWidth: 132 },
  ], rows: [
    { id: 1, code: { text: 'DH-10246', subtext: 'Siêu thị Hoàng Gia' }, value: 86200000, status: { label: 'Chờ duyệt', color: 'warning' } },
    { id: 2, code: { text: 'DH-10244', subtext: 'Công ty TNHH An Phát' }, value: 23900000, status: { label: 'Chờ thanh toán', color: 'info' } },
    { id: 3, code: { text: 'DH-10241', subtext: 'Cửa hàng Bình Minh' }, value: 9650000, status: { label: 'Đang đóng gói', color: 'brand' } },
    { id: 4, code: { text: 'DH-10239', subtext: 'Đại lý Hưng Thịnh' }, value: 31400000, status: { label: 'Chờ duyệt', color: 'warning' } },
  ] },
]
const MONTH_MODES = [{ id: 'short', label: 'T1 · T2' }, { id: 'long', label: 'Tháng 1 · Thứ 2' }]   // áp cho CẢ tên tháng lẫn tên thứ trong tuần
const monthMode = ref('short'), labels = ref(false)
/* Biểu đồ nhỏ trong KPI: off · mixed (mỗi thẻ 1 kiểu hợp ý nghĩa: area / bar / line / progress) · area · bar · line · progress (tất cả cùng kiểu) — KHÔNG dùng biểu đồ tròn trong KPI */
const SPARK_MODES = [{ value: 'off', label: 'Không' }, { value: 'mixed', label: 'Mỗi thẻ 1 kiểu' }, { value: 'area', label: 'Area' }, { value: 'bar', label: 'Cột' }, { value: 'line', label: 'Đường' }, { value: 'progress', label: 'Thanh tiến độ' }, { value: 'progress-full', label: 'Tiến độ dài' }]
const sparkMode = ref('mixed')
/* Thuộc tính hay dùng: đường lưới (mặc định bật, nét đứt mảnh) · tên trục / đơn vị (bật) · đường cong mượt (bật) · chú thích dưới / trên / ẩn */
const gridOn = ref(true), axisTitle = ref(true), smooth = ref(true), legendPos = ref('bottom')
const LEGEND_POS = [{ id: 'bottom', label: 'Dưới' }, { id: 'top', label: 'Trên' }, { id: 'none', label: 'Ẩn' }]
/* Tên thứ trong tuần theo cùng tùy chọn: ngắn T2…T7, CN · dài Thứ 2…Thứ 7, Chủ nhật (trước đây gõ cứng “T2…” nên không đổi theo, lại dễ nhầm với tháng 2) */
const WEEK_OF = { short: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'], long: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'] }
const MONTHS_OF = { short: Array.from({ length: 12 }, (_, i) => `T${i + 1}`), long: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`) }

const els = reactive({}), charts = {}
/* Khung hẹp (< 520px, VD điện thoại): biểu đồ chừa thêm chỗ cho chú thích xuống dòng, thưa nhãn trục, radar thu nhỏ */
const dvEl = ref(null), narrow = ref(false)
/* Bộ màu đang xem: mặc định theo màu chủ đề (đổi chủ đề → đổi theo, trừ khi người xem đã tự chọn) */
const family = ref(CHART_COLORS[currentTheme.value] ? currentTheme.value : 'blue'), mode = ref('divergent'), picked = ref(false)   // kiểu bộ màu mặc định: Divergent
const pal = computed(() => chartColors(family.value, mode.value))
const P = i => pal.value[i % pal.value.length]
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
const FONT = 'InterVariable, "Inter var", sans-serif'
const fmt = (d = 0) => v => fmtNum(v, { decimals: d })
/* Nhãn trục danh mục DÀI (VD “Tháng 1” × 12 cột): KHÔNG để ECharts tự ẩn bớt nhãn (mất tháng) — xử lý theo bề rộng mỗi cột:
   1. Đủ chỗ → 1 dòng.  2. Thiếu chỗ → xuống 2 dòng tại khoảng trắng (“Tháng” / “1”), rộng tối đa = bề rộng 1 cột.
   3. Hẹp nữa (mỗi cột < 36px, VD điện thoại) → nghiêng 45°. Luôn hiện đủ mọi nhãn (interval: 0). Tên rất dài (tên sản phẩm…) → đổi sang biểu đồ thanh ngang. */
function catLabel(id, n, plotPad = 56) {
  const base = { color: cssVar('--text-secondary'), fontSize: 13, interval: 0 }
  if (monthMode.value !== 'long') return base
  const w = ((els[id]?.clientWidth || 600) - plotPad) / n
  if (w >= 64) return base
  if (w >= 36) return { ...base, width: w - 4, overflow: 'break', lineHeight: 16 }
  return { ...base, rotate: 45, margin: 10 }
}
/* Nhãn trục danh mục DÀY (VD 15 mốc giờ, 30 ngày): mỗi mốc có bề rộng < minW → GỘP BỚT (chỉ hiện mỗi k mốc, luôn bắt đầu từ mốc đầu) cho khỏi đè nhau; theo bề rộng khung THẬT nên rộng ra thì hiện nhiều hơn.
   hideOverlap là lưới an toàn cuối cùng. Tooltip vẫn đủ mọi mốc. */
function thinLabel(id, n, minW, plotPad = 56) {
  const w = ((els[id]?.clientWidth || 600) - plotPad) / n
  return { interval: Math.max(1, Math.ceil(minW / w)) - 1, hideOverlap: true }
}
const catBottom = (id, n, normal) => normal   // grid containLabel đã tự chừa chỗ cho nhãn 2 dòng / nghiêng
/* Nhãn số liệu (data label): chữ dùng token chữ (Text/Primary ngoài cột · Text/White trong cột), không dùng màu series */
const lbl = (extra = {}) => ({ show: labels.value, color: cssVar('--text-primary'), fontSize: 12, fontFamily: FONT, ...extra })

function base() {
  const hint = cssVar('--text-secondary'), grid = cssVar('--stroke-neutral-light')
  return {
    hint, grid,
    axisCat: { type: 'category', axisTick: { show: false }, axisLine: { lineStyle: { color: grid } }, axisLabel: { color: hint, fontSize: 13 } },
    axisVal: { type: 'value', splitLine: { show: gridOn.value, lineStyle: { color: grid, type: 'dashed' } }, axisLabel: { color: hint, fontSize: 13, formatter: fmt(0) } },
    tooltip: { backgroundColor: cssVar('--neutral-900'), borderWidth: 0, textStyle: { color: cssVar('--text-white'), fontSize: 13, fontFamily: FONT }, extraCssText: 'border-radius:8px;box-shadow:none;' },
    legend: { bottom: 0, icon: 'roundRect', itemWidth: 12, itemHeight: 12, itemGap: 16, textStyle: { color: cssVar('--text-primary'), fontSize: 13 } },
  }
}

const OPTIONS = {
  donut() {
    const b = base(), data = [
      { name: 'Cửa hàng', value: 5240, c: 0 }, { name: 'Website', value: 3120, c: 1 },
      { name: 'Sàn TMĐT', value: 2410, c: 2 }, { name: 'Đại lý', value: 1710, c: 3 },
    ], total = data.reduce((a, d) => a + d.value, 0)
    return {
      tooltip: { ...b.tooltip, trigger: 'item', formatter: p => `${p.marker}${p.name}: <b>${fmtNum(p.value)}</b> triệu (${fmtNum(p.percent, { decimals: 1 })}%)` },
      // ≥ 2 nhóm → luôn có chú thích kèm % (màu không là cách nhận biết duy nhất)
      legend: { ...b.legend, orient: 'vertical', bottom: 'auto', left: '58%', top: 'middle', formatter: n => { const d = data.find(x => x.name === n); return `${n}  ${fmtNum(d.value / total * 100, { decimals: 1 })}%` } },
      // Số tổng nằm đúng tâm vòng (title căn giữa theo tâm donut)
      title: { text: fmtNum(total / 1000, { decimals: 2 }), subtext: 'tỷ đồng', left: '28%', top: 'center', textAlign: 'center', itemGap: 2,
        textStyle: { fontFamily: FONT, fontSize: 20, fontWeight: 600, color: cssVar('--text-primary') }, subtextStyle: { fontFamily: FONT, fontSize: 13, color: b.hint } },
      series: [{ type: 'pie', radius: labels.value ? ['40%', '72%'] : ['46%', '68%'],   // bật nhãn % → vòng dày hơn cho chữ nằm gọn trong vòng
 center: ['28%', '50%'], label: lbl({ position: 'inside', color: cssVar('--text-white'), fontWeight: 600, formatter: p => fmtNum(p.percent, { decimals: 0 }) + '%' }), labelLine: { show: false },
        itemStyle: { borderRadius: [4, 0], borderColor: cssVar('--bg-white'), borderWidth: 2 }, emphasis: { scale: true, scaleSize: 4 },
        data: data.map(d => ({ name: d.name, value: d.value, itemStyle: { color: P(d.c) } })) }],
    }
  },
  column() {
    const b = base(), v = [0.82, 0.76, 0.94, 1.02, 0.98, 1.11, 1.05, 1.16, 1.08, 1.21, 1.14, 1.21]
    return {
      grid: { top: 28, right: 8, bottom: catBottom('column', 12, 40), left: 8, containLabel: true },
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: cssVar('--alpha-black-50') } }, valueFormatter: fmt(2) },
      legend: { ...b.legend, data: ['Doanh thu', 'Mục tiêu'] },
      xAxis: { ...b.axisCat, data: [...MONTHS_OF[monthMode.value]], axisLabel: catLabel('column', 12) }, yAxis: { ...b.axisVal, name: 'Tỷ đồng', nameTextStyle: { color: b.hint, fontSize: 13, align: 'left' }, axisLabel: { ...b.axisVal.axisLabel, formatter: fmt(1) } },
      series: [
        { name: 'Doanh thu', type: 'bar', data: v, barMaxWidth: 28, itemStyle: { color: P(0), borderRadius: [4, 4, 0, 0] }, labelLayout: { hideOverlap: true }, label: lbl({ position: 'top', formatter: p => fmtNum(p.value, { decimals: 2 }) }) },
        { name: 'Mục tiêu', type: 'line', data: MONTHS_OF.short.map(() => 1), symbol: 'none', lineStyle: { color: P(5), width: 2, type: 'dashed' }, itemStyle: { color: P(5) } },
      ],
    }
  },
  bar() {
    const b = base(), items = [['Laptop Pro 14', 642], ['Tai nghe không dây', 588], ['Màn hình 27 inch', 421], ['Bàn phím cơ', 356], ['Chuột công thái học', 298]].reverse()
    return {
      grid: { top: 8, right: 48, bottom: 8, left: 152 },   // lề trái cố định cho nhãn tên (ECharts đo font Inter hẹp hơn thực tế → containLabel cắt chữ)
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: cssVar('--alpha-black-50') } }, valueFormatter: fmt(0) },
      xAxis: { ...b.axisVal, splitLine: { show: false }, axisLabel: { show: false } },
      yAxis: { ...b.axisCat, axisLine: { show: false }, data: items.map(i => i[0]), axisLabel: { color: cssVar('--text-primary'), fontSize: 13, width: 136, overflow: 'truncate', margin: 12 } },
      series: [{ type: 'bar', name: 'Số đơn', data: items.map(i => i[1]), barMaxWidth: 20, itemStyle: { color: P(0), borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', color: cssVar('--text-primary'), fontSize: 13, formatter: p => fmtNum(p.value) } }],   // 1 dãy → ghi số cuối thanh, không cần chú thích
    }
  },
  line() {
    const b = base(), y1 = [0.82, 0.76, 0.94, 1.02, 0.98, 1.11, 1.05, 1.16, 1.08, 1.21, 1.14, 1.21], y0 = [0.71, 0.69, 0.8, 0.86, 0.9, 0.93, 0.97, 0.99, 1.01, 1.04, 1.06, 1.12]
    const s = (name, data, c, dashed) => ({ name, type: 'line', data, smooth: smooth.value, symbol: 'circle', symbolSize: 8, showSymbol: false,
      lineStyle: { color: c, width: 2, ...(dashed ? { type: 'dashed' } : {}) }, itemStyle: { color: c, borderColor: cssVar('--bg-white'), borderWidth: 2 } })
    return {
      grid: { top: 28, right: 16, bottom: catBottom('line', 12, 40), left: 8, containLabel: true },
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: { type: 'line', lineStyle: { color: b.grid } }, valueFormatter: fmt(2) },
      legend: { ...b.legend, data: ['Năm 2026', 'Năm 2025'] },
      xAxis: { ...b.axisCat, data: [...MONTHS_OF[monthMode.value]], boundaryGap: false, axisLabel: catLabel('line', 12) }, yAxis: { ...b.axisVal, name: 'Tỷ đồng', nameTextStyle: { color: b.hint, fontSize: 13, align: 'left' }, axisLabel: { ...b.axisVal.axisLabel, formatter: fmt(1) } },
      series: [{ ...s('Năm 2026', y1, P(0)), showSymbol: labels.value, labelLayout: { hideOverlap: true },   // nhãn chồng nhau (khung hẹp) → tự ẩn bớt
        label: lbl({ position: 'top', formatter: p => fmtNum(p.value, { decimals: 2 }) }) }, s('Năm 2025', y0, P(2), true)],   // năm trước nét đứt → phân biệt cả khi không nhìn màu · nhãn chỉ ghi cho dãy chính (2 dãy cùng ghi → rối)
    }
  },
  stackColumn() {
    const b = base(), Q = ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'], S = [['Cửa hàng', [1.32, 1.41, 1.38, 1.52]], ['Website', [0.74, 0.82, 0.91, 1.04]], ['Sàn TMĐT', [0.52, 0.61, 0.66, 0.78]], ['Đại lý', [0.41, 0.43, 0.45, 0.48]]]
    return {
      grid: { top: 28, right: 8, bottom: narrow.value ? 64 : 40, left: 8, containLabel: true },   // khung hẹp: chú thích 4 mục xuống 2 dòng
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: cssVar('--alpha-black-50') } }, valueFormatter: fmt(2) },
      legend: b.legend,
      xAxis: { ...b.axisCat, data: Q }, yAxis: { ...b.axisVal, name: 'Tỷ đồng', nameTextStyle: { color: b.hint, fontSize: 13, align: 'left' }, axisLabel: { ...b.axisVal.axisLabel, formatter: fmt(1) } },
      // Khe 2px màu nền giữa các đoạn (viền trắng) · chỉ đoạn TRÊN CÙNG bo 4px
      series: S.map(([name, data], i) => ({ name, type: 'bar', stack: 'kenh', data, barMaxWidth: 40,
        itemStyle: { color: P(i), borderColor: cssVar('--bg-white'), borderWidth: 1, borderRadius: i === S.length - 1 ? [4, 4, 0, 0] : 0 },
        label: lbl({ position: 'inside', color: cssVar('--text-white'), formatter: p => fmtNum(p.value, { decimals: 2 }) }) })),
    }
  },
  stackBar() {
    const b = base(), D = ['Kinh doanh', 'Marketing', 'Kỹ thuật', 'Kế toán', 'Nhân sự'].reverse()
    const S = [['Hoàn thành', [62, 48, 71, 80, 55].reverse()], ['Đang làm', [28, 37, 21, 15, 33].reverse()], ['Quá hạn', [10, 15, 8, 5, 12].reverse()]]
    return {
      grid: { top: 8, right: 24, bottom: narrow.value ? 72 : 64, left: 96 },   // chừa chỗ nhãn trục % + chú thích dưới
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: cssVar('--alpha-black-50') } }, valueFormatter: v => fmtNum(v) + '%' },
      legend: b.legend,
      xAxis: { ...b.axisVal, max: 100, interval: narrow.value ? 50 : 20, axisLabel: { ...b.axisVal.axisLabel, formatter: v => v + '%' } },
      yAxis: { ...b.axisCat, axisLine: { show: false }, data: D, axisLabel: { color: cssVar('--text-primary'), fontSize: 13, width: 84, overflow: 'truncate', margin: 12 } },
      series: S.map(([name, data], i) => ({ name, type: 'bar', stack: 'tien-do', data, barMaxWidth: 20,
        itemStyle: { color: P(i), borderColor: cssVar('--bg-white'), borderWidth: 1, borderRadius: i === S.length - 1 ? [0, 4, 4, 0] : 0 },
        label: lbl({ position: 'inside', color: cssVar('--text-white'), formatter: p => (p.value >= 10 ? p.value + '%' : '') }) })),   // đoạn < 10% quá hẹp → không ghi
    }
  },
  radar() {
    // khung hẹp: tên trục dài xuống 2 dòng (axisName.formatter), không bị cắt mép
    const b = base(), K = ['Chuyên môn', 'Giao tiếp', 'Làm việc nhóm', 'Sáng tạo', 'Kỷ luật', 'Giải quyết vấn đề']
    const s = (name, value, c, dashed) => ({ name, value, symbol: 'circle', symbolSize: 8, lineStyle: { color: c, width: 2, ...(dashed ? { type: 'dashed' } : {}) },
      itemStyle: { color: c, borderColor: cssVar('--bg-white'), borderWidth: 2 }, areaStyle: { color: c + (dashed ? '14' : '33') } })
    return {
      tooltip: { ...b.tooltip, trigger: 'item', formatter: p => `<b>${p.name}</b><br>` + K.map((k, i) => `${k}: <b>${fmtNum(p.value[i], { decimals: 1 })}</b>`).join('<br>') },
      legend: { ...b.legend, data: ['Đội A', 'Trung bình công ty'] },
      radar: { center: ['50%', '46%'], radius: narrow.value ? '46%' : '64%', indicator: K.map(name => ({ name, max: 5 })), splitNumber: 5,
        axisName: { color: b.hint, fontSize: 13, lineHeight: 18, formatter: n => (narrow.value ? n.replace(/^(\S+ \S+) /, '$1\n') : n) },
        splitLine: { lineStyle: { color: b.grid } }, splitArea: { show: false }, axisLine: { lineStyle: { color: b.grid } } },
      series: [{ type: 'radar', data: [{ ...s('Đội A', [4.5, 3.8, 4.2, 3.4, 4.6, 4.0], P(0)), label: lbl({ formatter: p => fmtNum(p.value, { decimals: 1 }) }) }, s('Trung bình công ty', [3.8, 3.6, 3.9, 3.2, 4.0, 3.6], P(2), true)] }],
    }
  },
  bubble() {
    const b = base(), G = [
      ['Điện tử', [[12.5, 420, 5.2], [18.9, 260, 4.9], [7.2, 610, 4.4], [24.0, 140, 3.4]]],
      ['Gia dụng', [[3.2, 880, 2.8], [5.6, 520, 2.9], [1.8, 1240, 2.2]]],
      ['Thời trang', [[0.6, 1650, 1.0], [1.2, 940, 1.1], [2.1, 480, 1.0]]],
    ]
    const r = Math.sqrt   // diện tích bong bóng tỉ lệ doanh thu (bán kính ∝ căn bậc hai) — tránh phóng đại số lớn
    return {
      grid: { top: 28, right: 24, bottom: narrow.value ? 80 : 56, left: 8, containLabel: true },
      tooltip: { ...b.tooltip, trigger: 'item', formatter: p => `${p.marker}${p.seriesName}<br>Giá bán: <b>${fmtNum(p.value[0], { decimals: 1 })}</b> triệu<br>Số lượng: <b>${fmtNum(p.value[1])}</b><br>Doanh thu: <b>${fmtNum(p.value[2], { decimals: 1 })}</b> tỷ` },
      legend: b.legend,
      xAxis: { ...b.axisVal, name: 'Giá bán (triệu)', nameLocation: 'middle', nameGap: 30, nameTextStyle: { color: b.hint, fontSize: 13 }, splitLine: { show: false }, axisLine: { show: true, lineStyle: { color: b.grid } } },
      yAxis: { ...b.axisVal, name: 'Số lượng bán', nameTextStyle: { color: b.hint, fontSize: 13, align: 'left' } },
      series: G.map(([name, data], i) => ({ name, type: 'scatter', data, symbolSize: v => 12 + r(v[2]) * 16, label: lbl({ position: 'inside', color: cssVar('--text-white'), fontWeight: 600, formatter: p => fmtNum(p.value[2], { decimals: 1 }) }),
        itemStyle: { color: P(i) + 'b3', borderColor: cssVar('--bg-white'), borderWidth: 2 }, emphasis: { itemStyle: { color: P(i) } } })),   // bong bóng chồng nhau → vòng 2px màu nền + hơi trong
    }
  },
  area() {
    const b = base(), c = P(0), days = Array.from({ length: 30 }, (_, i) => `${String((i % 30) + 4 > 30 ? (i + 4) - 30 : i + 4).padStart(2, '0')}/${i + 4 > 30 ? '11' : '10'}`)
    const v = days.map((_, i) => Math.round(4200 + 900 * Math.sin(i / 3) + i * 60 + (i % 7 === 5 || i % 7 === 6 ? -900 : 0)))
    return {
      grid: { top: 16, right: 16, bottom: 8, left: 8, containLabel: true },
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: { type: 'line', lineStyle: { color: b.grid } }, valueFormatter: fmt(0) },
      xAxis: { ...b.axisCat, data: days, boundaryGap: false, axisLabel: { ...b.axisCat.axisLabel, ...thinLabel('area', 30, 56, 40) } }, yAxis: b.axisVal,   // 30 ngày: gộp bớt theo bề rộng thật

      series: [{ name: 'Lượt truy cập', type: 'line', data: v, smooth: smooth.value, symbol: 'circle', symbolSize: 8, showSymbol: false,
        lineStyle: { color: c, width: 2 }, itemStyle: { color: c, borderColor: cssVar('--bg-white'), borderWidth: 2 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: c + '40' }, { offset: 1, color: c + '00' }]) },
        // 30 điểm → không ghi nhãn từng điểm (rối); bật nhãn chỉ đánh dấu điểm cao nhất / thấp nhất
        markPoint: labels.value ? { symbol: 'circle', symbolSize: 8, itemStyle: { color: c, borderColor: cssVar('--bg-white'), borderWidth: 2 },
          label: { position: 'top', distance: 6, color: cssVar('--text-primary'), fontSize: 12, fontFamily: FONT, formatter: p => `${p.name === 'max' ? 'Cao nhất' : 'Thấp nhất'}: ${fmtNum(p.value)}` },
          data: [{ type: 'max', name: 'max' }, { type: 'min', name: 'min' }] } : undefined }],
    }
  },
  /* area-simple: chuỗi dài (365 ngày) → thanh kéo vùng xem (dataZoom slider) màu token + kéo / cuộn trong biểu đồ */
  areaZoom() {
    const b = base(), c = P(0), r = rng(11), days = [], v = []
    let x = 820
    for (let d = new Date(2025, 0, 1); d.getFullYear() === 2025; d.setDate(d.getDate() + 1)) {
      x = Math.max(300, x + (r() - 0.48) * 60); days.push(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`); v.push(Math.round(x))
    }
    return {
      grid: { top: 28, right: 16, bottom: 56, left: 8, containLabel: true },
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: { type: 'line', lineStyle: { color: b.grid } }, valueFormatter: v => fmtNum(v) + ' triệu' },
      xAxis: { ...b.axisCat, data: days, boundaryGap: false }, yAxis: { ...b.axisVal, name: 'Triệu đồng', nameTextStyle: { color: b.hint, fontSize: 13, align: 'left' } },
      dataZoom: [{ type: 'inside', start: 60, end: 100 }, {
        type: 'slider', start: 60, end: 100, height: 24, bottom: 8, borderColor: b.grid, borderRadius: 4, fillerColor: c + '1f',
        backgroundColor: cssVar('--bg-white'), dataBackground: { lineStyle: { color: cssVar('--stroke-neutral'), width: 1 }, areaStyle: { color: cssVar('--bg-neutral-light'), opacity: 1 } },
        selectedDataBackground: { lineStyle: { color: c, width: 1 }, areaStyle: { color: c, opacity: 0.12 } },
        handleIcon: 'path://M-2,-8 h4 a2,2 0 0 1 2,2 v12 a2,2 0 0 1 -2,2 h-4 a2,2 0 0 1 -2,-2 v-12 a2,2 0 0 1 2,-2 z', handleSize: '80%',
        handleStyle: { color: cssVar('--bg-white'), borderColor: c, borderWidth: 1.5 }, moveHandleSize: 0,
        textStyle: { color: b.hint, fontSize: 12 }, labelFormatter: (_, s) => s, brushSelect: false,
        emphasis: { handleStyle: { borderColor: c }, moveHandleStyle: { color: c } } }],
      series: [{ name: 'Giá trị giao dịch', type: 'line', data: v, smooth: smooth.value, symbol: 'none', sampling: 'lttb',
        lineStyle: { color: c, width: 2 }, itemStyle: { color: c },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: c + '33' }, { offset: 1, color: c + '00' }]) } }],
    }
  },
  /* mix-line-bar: 2 cột (tỷ đồng, trục trái) + 1 đường % (trục phải) — tên trục ghi rõ đơn vị từng bên */
  mixLineBar() {
    const b = base(), rev = [8.2, 7.6, 9.4, 10.2, 9.8, 11.1, 10.5, 11.6, 10.8, 12.1, 11.4, 12.6], cost = [6.1, 5.9, 6.8, 7.2, 7.0, 7.6, 7.5, 7.9, 7.7, 8.3, 8.1, 8.6]
    const margin = rev.map((r, i) => Math.round((r - cost[i]) / r * 1000) / 10)
    return {
      grid: { top: 36, right: 8, bottom: narrow.value ? 64 : 40, left: 8, containLabel: true },
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: cssVar('--alpha-black-50') } },
        formatter: ps => `${ps[0].name}<br>` + ps.map(p => `${p.marker}${p.seriesName}: <b>${fmtNum(p.value, { decimals: 1 })}</b>${p.seriesType === 'line' ? '%' : ' tỷ'}`).join('<br>') },
      legend: { ...b.legend, data: ['Doanh thu', 'Chi phí', 'Biên lợi nhuận'] },
      xAxis: { ...b.axisCat, data: [...MONTHS_OF[monthMode.value]], axisLabel: { ...catLabel('mixLineBar', 12, 96), ...(narrow.value && monthMode.value !== 'long' ? { interval: 1 } : {}) } },   // 2 trục → vùng vẽ hẹp hơn · điện thoại: cách 1 tháng ghi 1 nhãn
      yAxis: [
        { ...b.axisVal, name: 'Tỷ đồng', nameTextStyle: { color: b.hint, fontSize: 13, align: 'left' } },
        { ...b.axisVal, name: '%', min: 0, max: 50, splitLine: { show: false }, nameTextStyle: { color: b.hint, fontSize: 13, align: 'right' }, axisLabel: { ...b.axisVal.axisLabel, formatter: v => v + '%' } },
      ],
      series: [
        { name: 'Doanh thu', type: 'bar', data: rev, barMaxWidth: 14, barGap: '20%', itemStyle: { color: P(0), borderRadius: [4, 4, 0, 0] } },
        { name: 'Chi phí', type: 'bar', data: cost, barMaxWidth: 14, itemStyle: { color: P(2), borderRadius: [4, 4, 0, 0] } },
        { name: 'Biên lợi nhuận', type: 'line', yAxisIndex: 1, data: margin, smooth: smooth.value, symbol: 'circle', symbolSize: 8, showSymbol: labels.value,
          lineStyle: { color: P(5), width: 2 }, itemStyle: { color: P(5), borderColor: cssVar('--bg-white'), borderWidth: 2 },
          label: lbl({ position: 'top', formatter: p => fmtNum(p.value, { decimals: 1 }) + '%' }), labelLayout: { hideOverlap: true } },
      ],
    }
  },
  /* bar-background: cột có nền mờ phía sau (thấy rõ phần còn thiếu so với mức cao nhất) — nền = BG Neutral Light, cùng bo góc */
  barBg() {
    const b = base(), d = [...WEEK_OF[monthMode.value]], v = [420, 380, 455, 470, 520, 610, 560]
    return {
      grid: { top: 28, right: 8, bottom: 8, left: 8, containLabel: true },
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: { type: 'none' }, valueFormatter: v => fmtNum(v) + ' đơn' },
      xAxis: { ...b.axisCat, data: d, axisLabel: catLabel('barBg', 7, 56) }, yAxis: { ...b.axisVal, name: 'Đơn hàng', nameTextStyle: { color: b.hint, fontSize: 13, align: 'left' } },
      series: [{ name: 'Đơn hàng', type: 'bar', data: v, barMaxWidth: 28, showBackground: true,
        backgroundStyle: { color: cssVar('--bg-neutral-light'), borderRadius: [4, 4, 0, 0] }, itemStyle: { color: P(0), borderRadius: [4, 4, 0, 0] },
        label: lbl({ position: 'top', formatter: p => fmtNum(p.value) }) }],
    }
  },
  /* area gradient nhiều dãy (theo mẫu area-stack-gradient nhưng KHÔNG chồng): tối đa 3 dãy — nền gradient RẤT NHẠT (đỉnh ~16% → 0) để các lớp không đè màu nhau; nét 2px giữ màu đầy */
  areaStack() {
    const b = base(), d = [...MONTHS_OF[monthMode.value]]
    // 3 kênh theo 12 tháng, KHÔNG chồng (stack): dáng TỰ NHIÊN — đầu năm thấp, lên dần, có lúc chững / giảm nhẹ rồi lại lên;
    // các kênh cùng xu hướng, chỉ đan nhẹ ở T10 (mạng xã hội nhích qua tìm kiếm rồi lại xuống) — không giật cục
    const S = [
      ['Tìm kiếm',    [900, 980, 1080, 1200, 1340, 1300, 1420, 1560, 1700, 1660, 1800, 1950]],
      ['Mạng xã hội', [600, 680, 790, 930, 1100, 1180, 1350, 1500, 1620, 1700, 1760, 1880]],
      ['Quảng cáo',   [500, 560, 640, 720, 800, 780, 860, 950, 1040, 1010, 1100, 1180]],
    ]
    return {
      grid: { top: 28, right: narrow.value ? 16 : 56, bottom: narrow.value ? 64 : 40,   /* điện thoại: chú thích 3 mục xuống 2 dòng · máy tính: chừa chỗ số cuối kỳ */ left: 8, containLabel: true },
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: { type: 'line', lineStyle: { color: b.grid } }, valueFormatter: fmt(0), order: 'valueDesc' },
      legend: b.legend,
      xAxis: { ...b.axisCat, data: d, boundaryGap: false, axisLabel: { ...catLabel('areaStack', 12), ...(narrow.value && monthMode.value !== 'long' ? { interval: 1 } : {}) } }, yAxis: { ...b.axisVal, name: 'Lượt', nameTextStyle: { color: b.hint, fontSize: 13, align: 'left' } },
      // Đẹp + dễ đọc: chỉ kênh CHÍNH có nền gradient (3 lớp nền chồng nhau → đục màu), kênh phụ chỉ nét;
      // số cuối kỳ ghi ở đầu mỗi đường (endLabel, cùng màu đường)
      series: S.map(([name, data], i) => ({ name, type: 'line', data, smooth: smooth.value ? 0.4 : false, smoothMonotone: 'x', symbol: 'circle', symbolSize: 8, showSymbol: false,   // cong vừa phải + đơn điệu theo trục x → không gợn sóng thừa
        lineStyle: { color: P(i), width: i === 0 ? 2.5 : 2 }, itemStyle: { color: P(i), borderColor: cssVar('--bg-white'), borderWidth: 2 },
        areaStyle: i === 0 ? { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: P(i) + '2e' }, { offset: 1, color: P(i) + '00' }]) } : undefined,
        endLabel: { show: !narrow.value, formatter: p => fmtNum(p.value), color: P(i), fontSize: 12, fontWeight: 600, fontFamily: FONT, distance: 6 },
        labelLayout: { moveOverlap: 'shiftY' },
        emphasis: { focus: 'series' } })),
    }
  },
  /* bar-y-category: thanh ngang 2 năm cạnh nhau — năm nay màu 1, năm trước màu 3 */
  barY() {
    const b = base(), R2 = ['Tây Nguyên', 'Bắc Trung Bộ', 'Đồng bằng sông Cửu Long', 'Duyên hải miền Trung', 'Đông Nam Bộ', 'Đồng bằng sông Hồng']   // trục danh mục ngang: mục đầu nằm DƯỚI cùng → lớn nhất ở trên
    const y25 = [18.2, 23.4, 29.0, 34.1, 61.4, 68.0], y26 = [21.3, 25.1, 33.8, 38.6, 70.2, 74.5]
    return {
      grid: { top: 8, right: narrow.value ? 16 : 40, bottom: 64, left: narrow.value ? 100 : 176 },   // chừa nhãn trục giá trị + chú thích dưới
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: cssVar('--alpha-black-50') } }, valueFormatter: v => fmtNum(v, { decimals: 1 }) + ' tỷ' },
      legend: { ...b.legend, data: ['Năm 2025', 'Năm 2026'] },
      xAxis: { ...b.axisVal, splitNumber: narrow.value ? 2 : 5, axisLabel: { ...b.axisVal.axisLabel, formatter: fmt(0) } },
      yAxis: { ...b.axisCat, axisLine: { show: false }, data: R2, axisLabel: { color: cssVar('--text-primary'), fontSize: 13, width: narrow.value ? 88 : 164, overflow: 'truncate', margin: 12 } },
      series: [
        { name: 'Năm 2025', type: 'bar', data: y25, barMaxWidth: 10, itemStyle: { color: P(2), borderRadius: [0, 4, 4, 0] }, label: lbl({ position: 'right', formatter: p => fmtNum(p.value, { decimals: 1 }) }) },
        { name: 'Năm 2026', type: 'bar', data: y26, barMaxWidth: 10, itemStyle: { color: P(0), borderRadius: [0, 4, 4, 0] }, label: lbl({ position: 'right', formatter: p => fmtNum(p.value, { decimals: 1 }) }) },
      ],
    }
  },
  /* dataset-simple0: dữ liệu dạng bảng (dataset.source) — dòng đầu là tên cột, mỗi cột sau = 1 dãy; series chỉ khai báo kiểu */
  dataset() {
    const b = base(), src = [['Dòng sản phẩm', '2024', '2025', '2026'], ['Laptop', 43.3, 85.8, 93.7], ['Điện thoại', 83.1, 73.4, 55.1], ['Phụ kiện', 86.4, 65.2, 82.5], ['Màn hình', 72.4, 53.9, 39.1]]
    return {
      grid: { top: 28, right: 8, bottom: 40, left: 8, containLabel: true },
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: cssVar('--alpha-black-50') } }, valueFormatter: v => fmtNum(v, { decimals: 1 }) + ' tỷ' },
      legend: b.legend,
      dataset: { source: src },
      xAxis: { ...b.axisCat }, yAxis: { ...b.axisVal, name: 'Tỷ đồng', nameTextStyle: { color: b.hint, fontSize: 13, align: 'left' } },
      series: [0, 1, 2].map(i => ({ type: 'bar', barMaxWidth: 16, itemStyle: { color: P(i), borderRadius: [4, 4, 0, 0] }, label: lbl({ position: 'top', formatter: p => fmtNum(p.value[i + 1], { decimals: 0 }) }), labelLayout: { hideOverlap: true } })),
    }
  },
  /* heatmap-cartesian: độ lớn theo 2 chiều → bộ màu SINGLE HUE (nhạt = ít, đậm = nhiều), ô cách nhau 2px màu nền, thang màu dưới */
  heatmap() {
    const b = base(), H = Array.from({ length: 15 }, (_, i) => `${i + 8}h`), D = [...WEEK_OF[monthMode.value]].reverse(), r = rng(5), data = []   // trục dọc: CN ở dưới cùng … T2 trên cùng
    D.forEach((d, y) => H.forEach((h, x) => { const peak = Math.exp(-((x - 4) ** 2) / 6) + Math.exp(-((x - 12) ** 2) / 5) * 1.2, wk = y <= 1 ? 1.25 : 1; data.push([x, y, Math.round((peak * 40 + r() * 14 + 4) * wk)]) }))
    const sh = chartColors(family.value, 'single'), max = Math.max(...data.map(d => d[2]))
    return {
      grid: { top: 8, right: 8, bottom: 56, left: 8, containLabel: true },
      tooltip: { ...b.tooltip, trigger: 'item', formatter: p => `${D[p.value[1]]} · ${H[p.value[0]]}<br>Đơn hàng: <b>${fmtNum(p.value[2])}</b>` },
      xAxis: { ...b.axisCat, data: H, splitArea: { show: false }, axisLine: { show: false }, axisLabel: { ...b.axisCat.axisLabel, ...thinLabel('heatmap', 15, 36, monthMode.value === 'long' ? 104 : 56) } },   // 15 mốc giờ: hẹp thì gộp bớt (8h, 10h, 12h…)
      yAxis: { ...b.axisCat, data: D, axisLine: { show: false } },
      visualMap: { min: 0, max, calculable: false, orient: 'horizontal', left: 'center', bottom: 0, itemWidth: 12, itemHeight: 160, text: ['Nhiều', 'Ít'], textGap: 8,
        textStyle: { color: b.hint, fontSize: 13 }, inRange: { color: [...sh].reverse() } },
      series: [{ type: 'heatmap', data, itemStyle: { borderColor: cssVar('--bg-white'), borderWidth: 2, borderRadius: 4 },
        label: lbl({ formatter: p => p.value[2], textBorderColor: cssVar('--bg-white'), textBorderWidth: 2 }), emphasis: { itemStyle: { borderColor: cssVar('--text-primary'), borderWidth: 1 } } }],
    }
  },
  /* funnel: hình phễu RÕ — mỗi tầng hẹp dần ĐỀU thành hình tam giác (100 → 80 → 60 → 40 → 20%, đáy nhọn), không tỉ lệ theo số (số chênh lớn làm các tầng dưới gần bằng nhau);
     màu SINGLE HUE đậm → nhạt; tên + % so với bước đầu ghi TRONG từng tầng, chữ tự Text/White hoặc Text/Primary theo độ sáng nền;
     tầng cuối (tam giác nhỏ): tên / % 2 dòng, đẩy lên phần rộng của tam giác · điện thoại: tên / % 2 dòng, 2 tầng cuối ghi bên phải */
  funnel() {
    const b = base(), sh = chartColors(family.value, 'single'), st = [['Lượt truy cập', 10000], ['Xem sản phẩm', 6200], ['Thêm vào giỏ', 2800], ['Thanh toán', 1500], ['Hoàn tất đơn', 1100]]
    const pct = r => fmtNum(r / st[0][1] * 100, { decimals: 0 }) + '%', n = st.length
    return {
      tooltip: { ...b.tooltip, trigger: 'item', formatter: p => `${p.marker}${p.name}: <b>${fmtNum(p.data.real)}</b> (${pct(p.data.real)})` },
      series: [{ type: 'funnel', left: 8, right: narrow.value ? 88 : 8, top: 8, bottom: 8, min: 0, max: 100, minSize: '0%', maxSize: '100%', sort: 'descending', gap: 2,
        label: { show: true, position: 'inside', fontSize: 13, fontFamily: FONT, lineHeight: 18, textBorderColor: 'transparent', textBorderWidth: 0,
          formatter: p => `${p.name}${narrow.value ? '\n' : '  '}${pct(p.data.real)}` },
        labelLine: { show: true, length: 12, lineStyle: { color: cssVar('--stroke-neutral'), width: 1 } },
        itemStyle: { borderWidth: 0 }, emphasis: { label: { fontWeight: 600 } },
        data: st.map(([name, real], i) => {
          const tip = i === n - 1, out = narrow.value && i >= n - 2   // điện thoại: 2 tầng cuối quá hẹp → ghi bên phải
          return { name, real, value: 100 - i * (100 / n), itemStyle: { color: sh[i] },
            label: out ? { position: 'right', color: cssVar('--text-primary') }
              : { color: ink(sh[i]), ...(tip ? { formatter: p => `${p.name}\n${pct(p.data.real)}`, offset: [0, -12] } : {}) },
            labelLine: { show: out } }
        }) }],
    }
  },
  /* gauge (kiểu gauge-temperature): vòng tiến độ dày màu 1 trên nền BG Neutral Light, vạch chia + số trục màu chữ phụ, số lớn ở giữa */
  gauge() {
    const b = base(), c = P(0), v = 78.4
    const ring = { type: 'gauge', center: ['50%', '58%'], radius: narrow.value ? '62%' : '76%', startAngle: 200, endAngle: -20, min: 0, max: 100, splitNumber: 10 }
    return {
      series: [
        { ...ring, progress: { show: true, width: narrow.value ? 14 : 20, roundCap: true, itemStyle: { color: c } }, pointer: { show: false }, anchor: { show: false },
          axisLine: { roundCap: true, lineStyle: { width: narrow.value ? 14 : 20, color: [[1, cssVar('--bg-neutral-light')]] } },
          axisTick: { distance: -40, splitNumber: 5, lineStyle: { width: 1, color: cssVar('--stroke-neutral') } },
          splitLine: { distance: -46, length: 10, lineStyle: { width: 2, color: cssVar('--stroke-neutral') } },
          axisLabel: { distance: -20, color: b.hint, fontSize: 12, formatter: v => (v % 20 === 0 ? v : '') },
          title: { offsetCenter: [0, '30%'], color: b.hint, fontSize: 13, fontFamily: FONT },
          detail: { valueAnimation: true, offsetCenter: [0, '-2%'], fontSize: narrow.value ? 24 : 32, fontWeight: 600, fontFamily: FONT, color: cssVar('--text-primary'), formatter: v => fmtNum(v, { decimals: 1 }) + '%' },
          data: [{ value: v, name: narrow.value ? '94,1 / 120 tỷ' : 'Đã đạt 94,1 / 120 tỷ' }] },
        ...(narrow.value ? [] : [{ ...ring, radius: '58%', progress: { show: true, width: 4, itemStyle: { color: c + '66' } }, pointer: { show: false }, anchor: { show: false },
          axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }, detail: { show: false }, title: { show: false },
          data: [{ value: v }] }]),   // vòng mảnh bên trong: chỉ khi đủ rộng (điện thoại đè chữ)
      ],
    }
  },
  /* scatter-clustering: mỗi cụm 1 màu theo thứ tự bộ màu + chú thích tên cụm; tâm cụm đánh dấu hình thoi viền trắng */
  cluster() {
    const SHAPES = ['circle', 'rect', 'triangle', 'diamond']
    const b = base(), r = rng(3), C = [['Khách VIP', 82, 46], ['Khách trung thành', 60, 24], ['Khách mới', 18, 12], ['Khách ngủ đông', 30, 38]]
    const g = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) }
    return {
      grid: { top: 28, right: 24, bottom: narrow.value ? 80 : 64, left: 8, containLabel: true },
      tooltip: { ...b.tooltip, trigger: 'item', formatter: p => `${p.marker}${p.seriesName}<br>Số lần mua / năm: <b>${fmtNum(p.value[0], { decimals: 0 })}</b><br>Giá trị TB / đơn: <b>${fmtNum(p.value[1], { decimals: 1 })}</b> triệu` },
      legend: { ...b.legend, data: C.map(([name], i) => ({ name, icon: SHAPES[i] })) },   // chú thích cùng hình điểm của cụm
      xAxis: { ...b.axisVal, name: 'Số lần mua / năm', nameLocation: 'middle', nameGap: 30, nameTextStyle: { color: b.hint, fontSize: 13 }, splitLine: { show: false }, axisLine: { show: true, lineStyle: { color: b.grid } } },
      yAxis: { ...b.axisVal, name: 'Giá trị TB / đơn (triệu)', nameTextStyle: { color: b.hint, fontSize: 13, align: 'left' } },
      // mỗi cụm 1 màu + 1 HÌNH điểm riêng (tròn / vuông / tam giác / thoi) → vẫn phân biệt khi 2 màu gần nhau hoặc người xem mù màu
      series: C.map(([name, cx, cy], i) => ({ name, type: 'scatter', symbolSize: 8, symbol: SHAPES[i],
        data: Array.from({ length: 36 }, () => [Math.max(1, cx + g() * 7), Math.max(1, cy + g() * 4.5)]),
        itemStyle: { color: P(i), opacity: 0.8 }, emphasis: { itemStyle: { opacity: 1, borderColor: cssVar('--bg-white'), borderWidth: 2 } },
        markPoint: { symbol: SHAPES[i], symbolSize: 18, data: [{ coord: [cx, cy], name: 'Tâm cụm' }], label: { show: false }, itemStyle: { color: P(i), borderColor: cssVar('--bg-white'), borderWidth: 2 } } })),
    }
  },
  /* geo-choropleth-scatter: tô nước theo doanh thu (SINGLE HUE, thang màu bên trái) + điểm văn phòng (màu nhấn trong palette, viền trắng);
     nước không có số liệu = BG Neutral Light, ranh giới 0,5px màu nền */
  geo() {
    const b = base(), sh = chartColors(family.value, 'single'), acc = P(5)
    if (!geoReady.value) return { title: { text: 'Đang tải bản đồ…', left: 'center', top: 'middle', textStyle: { color: b.hint, fontSize: 13, fontWeight: 400, fontFamily: FONT } } }
    const vi = n => COUNTRY_VI[n] || n
    return {
      tooltip: { ...b.tooltip, trigger: 'item', formatter: p => p.seriesType === 'scatter' ? `${p.marker}<b>${p.name}</b> · ${p.value[2]}` : (p.value ? `${vi(p.name)}: <b>${fmtNum(p.value)}</b> triệu USD` : vi(p.name)) },
      visualMap: { type: 'continuous', seriesIndex: 0, min: 0, max: 1300, ...(narrow.value ? { orient: 'horizontal', left: 'center', bottom: 0, itemHeight: 140 } : { left: 8, bottom: 8, itemHeight: 120 }), itemWidth: 12, text: ['Triệu USD', ''], textGap: 8, calculable: false,
        textStyle: { color: b.hint, fontSize: 13 }, inRange: { color: [sh[6], sh[4], sh[2], sh[0]] }, outOfRange: { color: cssVar('--bg-neutral-light') }, formatter: fmt(0) },
      geo: { map: 'world', roam: true, scaleLimit: { min: 1, max: 8 }, boundingCoords: [[-170, 80], [180, -50]], layoutCenter: ['50%', narrow.value ? '42%' : '50%'], layoutSize: Math.max(200, (els.geo?.clientWidth || 600) - 16), silent: false,   // layoutSize (px theo bề rộng khung — % tính theo cạnh NGẮN nên bản đồ bị nhỏ) giữ đúng tỉ lệ; top/left/right/bottom sẽ kéo méo
        itemStyle: { areaColor: cssVar('--bg-neutral-light'), borderColor: cssVar('--bg-white'), borderWidth: 0.5 },
        emphasis: { label: { show: false }, itemStyle: { areaColor: cssVar('--bg-neutral-light') } }, select: { disabled: true }, regions: [] },
      series: [
        { type: 'map', geoIndex: 0, data: Object.entries(EXPORT).map(([name, value]) => ({ name, value })) },
        { type: 'scatter', coordinateSystem: 'geo', symbolSize: 10, data: OFFICES.map(([name, x, y, kind]) => ({ name, value: [x, y, kind] })),
          itemStyle: { color: acc, borderColor: cssVar('--bg-white'), borderWidth: 2 },
          label: { show: !narrow.value, position: 'right', formatter: p => p.name, color: cssVar('--text-primary'), fontSize: 12, fontFamily: FONT, textBorderColor: cssVar('--bg-white'), textBorderWidth: 3 },
          labelLayout: { hideOverlap: true }, emphasis: { scale: 1.4 } },
      ],
    }
  },
}

/* Biểu đồ nhỏ trong KPI card: không trục / lưới / chú thích; nét 2px + nền gradient rất nhạt; điểm cao nhất = chấm viền màu + quầng nhạt */
/* Dáng mẫu cho dạng area (theo ảnh mẫu): 23 kỳ, nét gấp khúc đi lên, có lúc giảm, 1 đỉnh giữa chừng (chấm có quầng), kỳ cuối vượt lên cao nhất.
   Giá trị = kỳ đầu + (hiện tại − kỳ đầu) × tỉ lệ dáng — kết thúc đúng giá trị trên thẻ */
const SHAPE = [0, 0.12, 0.04, 0.16, 0.08, 0.2, 0.12, 0.32, 0.44, 0.4, 0.48, 0.34, 0.24, 0.4, 0.54, 0.58, 0.8, 0.6, 0.48, 0.62, 0.52, 0.68, 0.72, 0.86, 1]
const BAR_SHAPE = [0.32, 0.64, 0.2, 0.52, 1, 0.3, 0.86]   // dáng cột mẫu: lên xuống rõ, cột thứ 5 cao nhất
const SHAPE_DOT = 16   // vị trí chấm đánh dấu (đỉnh giữa chừng)
const waveOf = k => { const up = k.value >= k.spark[0], a = up ? k.spark[0] * 0.8 : k.spark[0] * 1.1, b = k.value; return SHAPE.map(r => Math.round((a + (b - a) * r) * 10) / 10) }   // chỉ số giảm → dáng đi xuống
const kindOf = k => (sparkMode.value === 'mixed' ? k.kind : sparkMode.value)   // dạng biểu đồ nhỏ của thẻ: area · bar · line · progress
function sparkOption(k0, c) {
  const k = { ...k0, kind: kindOf(k0) }
  /* Mỗi KPI 1 dạng biểu đồ nhỏ hợp ý nghĩa chỉ số (kind): area (xu hướng tích lũy) · bar (giá trị từng kỳ, kỳ hiện tại đậm) ·
     line (đường không nền) · progress (thanh tiến độ dưới thẻ). Chung: không trục / lưới / chú thích, 1 màu = màu icon */
  const i = k.spark.indexOf(Math.max(...k.spark)), last = k.spark.length - 1
  const fmtV = v => fmtNum(v, { decimals: k.decimals ?? 0 })
  const tip = { backgroundColor: cssVar('--neutral-900'), borderWidth: 0, padding: [4, 8], textStyle: { color: cssVar('--text-white'), fontSize: 13, fontFamily: FONT }, extraCssText: 'border-radius:8px;box-shadow:none;' }
  const base = {
    grid: { top: 10, right: 4, bottom: 4, left: 4 },
    xAxis: { type: 'category', show: false, boundaryGap: k.kind === 'bar', data: k.spark.map((_, j) => j) },
    yAxis: { type: 'value', show: false, min: v => v.min - (v.max - v.min) * (k.kind === 'bar' ? 0.6 : 0.15) },
    tooltip: { ...tip, trigger: 'axis', axisPointer: { type: 'none' }, formatter: ps => `Kỳ ${ps[0].dataIndex + 1}: <b>${fmtV(ps[0].value)}</b>` },
  }
  if (k.kind === 'bar') {
    /* cột (theo ảnh mẫu): 7 kỳ, cột MẢNH, cao thấp chênh rõ, gốc từ 0 · cột cao nhất tô màu thẻ, còn lại xám Stroke/Neutral */
    const bars = (k0.delta < 0 ? [...BAR_SHAPE].reverse() : BAR_SHAPE).map(r => Math.round(k0.value * r * 10) / 10), top = bars.indexOf(Math.max(...bars))   // chỉ số giảm → cột cao ở đầu, thấp dần
    return { ...base, grid: { top: 4, right: 4, bottom: 2, left: 'auto', width: bars.length * 11 }, xAxis: { ...base.xAxis, data: bars.map((_, j) => j) }, yAxis: { type: 'value', show: false, min: 0 },   // cột 7px cách nhau 4px, cụm sát mép phải
      series: [{ type: 'bar', data: bars.map((v, j) => ({ value: v, itemStyle: { color: j === top ? c : cssVar('--stroke-neutral') } })), barWidth: 7, barCategoryGap: '40%',
        itemStyle: { borderRadius: [2, 2, 0, 0] }, emphasis: { disabled: true } }] }
  }
  const dot = [
    { type: 'scatter', data: [[i, k.spark[i]]], symbolSize: 16, itemStyle: { color: c + '33' }, silent: true, z: 3 },
    { type: 'scatter', data: [[i, k.spark[i]]], symbolSize: 8, itemStyle: { color: cssVar('--bg-white'), borderColor: c, borderWidth: 2 }, silent: true, z: 4 },
  ]
  if (k.kind === 'line') return { ...base,
    // đường không nền (gọn) + điểm cao nhất
    series: [{ type: 'line', data: k.spark, smooth: smooth.value ? 0.4 : false, smoothMonotone: 'x', symbol: 'none', lineStyle: { color: c, width: 2 }, emphasis: { disabled: true } }, ...dot] }
  /* area: theo ô “Đường cong mượt” (tắt = nét gấp khúc như ảnh mẫu) — đi lên có lúc giảm · nền gradient rất nhạt · chấm trắng viền màu + quầng nhạt ở đỉnh giữa chừng */
  const w = waveOf(k0)
  return { ...base, xAxis: { ...base.xAxis, data: w.map((_, j) => j) },
    yAxis: { type: 'value', show: false, min: v => v.min - (v.max - v.min) * 0.4, max: v => v.max + (v.max - v.min) * 0.06 },   // đáy trục hạ thấp → đường ở nửa trên, nền gradient bên dưới đủ cao để thấy rõ
    series: [
      { type: 'line', data: w, smooth: smooth.value ? 0.6 : false, symbol: 'none', lineStyle: { color: c, width: 2, cap: 'round', join: 'round' }, emphasis: { disabled: true },   // theo ô “Đường cong mượt”: bật = cong, tắt = gấp khúc
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: c + '5c' }, { offset: 0.9, color: c + '0d' }, { offset: 1, color: c + '00' }]) } },
      { type: 'scatter', data: [[SHAPE_DOT, w[SHAPE_DOT]]], symbolSize: 18, itemStyle: { color: c + '2e' }, silent: true, z: 3 },
      { type: 'scatter', data: [[SHAPE_DOT, w[SHAPE_DOT]]], symbolSize: 9, itemStyle: { color: cssVar('--bg-white'), borderColor: c, borderWidth: 2 }, silent: true, z: 4 },
    ] }
}
const iconEls = reactive({}), sparkEls = reactive({}), sparks = {}
/* màu hex của icon KPI (getComputedStyle trả rgb()) → hex để ghép độ trong suốt */
const toHex = rgb => '#' + (rgb.match(/\d+/g) || [0, 0, 0]).slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('')
function renderSparks() {
  for (const k of SPARKS) {
    const el = sparkEls[k.id]; if (!el) continue
    const c = toHex(getComputedStyle(iconEls[k.id]).color)
    const ch = sparks[k.id] || (sparks[k.id] = echarts.init(el, null, { renderer: 'svg' }))
    ch.setOption({ textStyle: { fontFamily: FONT }, animationDuration: 500, ...sparkOption(k, c) }, true)
  }
}

/* Áp tuỳ chọn chung lên option từng biểu đồ: chú thích ngang (dưới) → đưa lên trên / ẩn (grid co giãn theo, 24px = 1 dòng chú thích) · bỏ tên trục */
function tweak(o) {
  const L = o.legend
  if (L && L.orient !== 'vertical') {   // donut chú thích dọc bên phải — giữ nguyên
    const g = o.grid
    const cut = g?.containLabel ? 32 : 24   // phần đáy grid dành cho chú thích (containLabel: nhãn trục đã nằm trong grid)
    if (legendPos.value === 'none') { o.legend = { ...L, show: false }; if (g && typeof g.bottom === 'number') g.bottom = Math.max(8, g.bottom - cut); if (o.radar) o.radar.center = ['50%', '50%'] }
    else if (legendPos.value === 'top') {
      o.legend = { ...L, top: 0, bottom: 'auto' }
      const up = narrow.value && (L.data?.length ?? o.series?.length ?? 0) > 2 ? 48 : 24   // khung hẹp: ≥ 3 mục chú thích xuống 2 dòng
      if (g) { g.top = (g.top || 0) + up; if (typeof g.bottom === 'number') g.bottom = Math.max(8, g.bottom - cut) }
      if (o.radar) o.radar.center = ['50%', '56%']
    }
  }
  if (o.xAxis?.axisLabel?.rotate && o.grid) o.grid.left = 28   // nhãn nghiêng 45° → chừa lề trái cho nhãn đầu không bị cắt
  if (!axisTitle.value) for (const k of ['xAxis', 'yAxis']) if (o[k]?.name) { o[k] = { ...o[k], name: '' }; if (k === 'yAxis' && o.grid) o.grid.top = Math.max(8, (o.grid.top || 0) - 20) }
  return o
}
function render() {
  for (const c of CHARTS) {
    const el = els[c.id]; if (!el) continue
    const ch = charts[c.id] || (charts[c.id] = echarts.init(el, null, { renderer: 'svg' }))
    ch.setOption({ textStyle: { fontFamily: FONT }, animationDuration: 500, ...tweak(OPTIONS[c.id]()) }, true)
  }
  renderSparks()
}
let ro = null, ro2 = null
onMounted(async () => {
  await nextTick(); render()
  loadGeo()
  ro = new ResizeObserver(() => {
    const n = (dvEl.value?.clientWidth || 999) < 520
    if (n !== narrow.value) { narrow.value = n; nextTick(render) }
    Object.values(charts).forEach(ch => ch.resize())
    if (charts.geo && geoReady.value) charts.geo.setOption({ geo: { layoutSize: Math.max(200, (els.geo?.clientWidth || 600) - 16) } })   // bản đồ: cỡ theo bề rộng mới
  })
  ro2 = new ResizeObserver(() => Object.values(sparks).forEach(ch => ch.resize()))
  Object.values(els).forEach(el => el && ro.observe(el)); dvEl.value && ro.observe(dvEl.value)
  Object.values(sparkEls).forEach(el => el && ro2.observe(el))
})
watch(currentTheme, t => { if (!picked.value && CHART_COLORS[t]) family.value = t; nextTick(render) })   // đổi màu chủ đề → bộ màu theo (nếu chưa tự chọn)
watch([pal, labels, monthMode, gridOn, axisTitle, smooth, legendPos, geoReady], () => nextTick(render))
watch(sparkMode, v => v !== 'off' && nextTick(() => { renderSparks(); Object.values(sparks).forEach(ch => ch.resize()) }))
onBeforeUnmount(() => { ro?.disconnect(); ro2?.disconnect(); [...Object.values(charts), ...Object.values(sparks)].forEach(ch => ch.dispose()) })
</script>

<style scoped>
.dv-pick { flex-wrap: wrap; }
.dv-fams { display: flex; flex-wrap: wrap; gap: 6px; }
.dv-fam { display: inline-flex; width: 40px; height: 24px; padding: 2px; gap: 1px; box-sizing: border-box; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); background: var(--bg-white); cursor: pointer; overflow: hidden; }
.dv-fam span { flex: 1; border-radius: 2px; }
.dv-fam:hover { border-color: var(--stroke-brand); }
.dv-fam--on { border-color: var(--stroke-brand); box-shadow: 0 0 0 1px var(--stroke-brand); }
.dv-swatches { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: var(--text-body); color: var(--text-secondary); font-feature-settings: 'tnum'; }
.dv-swatch { display: inline-flex; align-items: center; gap: 6px; }
.dv-swatch i { width: 14px; height: 14px; border-radius: var(--radius-sm); box-shadow: inset 0 0 0 1px var(--alpha-black-100); }
.dv { container-type: inline-size; display: flex; flex-direction: column; gap: var(--card-col-gap); padding: 16px; border-radius: var(--radius-card); background: var(--bg-page); }
/* Chia cột theo BỀ RỘNG KHUNG (container query), không theo màn hình — khung bài viết hẹp hơn màn hình nhiều */
.dv-kpis { display: grid; grid-template-columns: minmax(0, 1fr); grid-auto-rows: 1fr; gap: var(--card-col-gap); }   /* thẻ KPI cao bằng nhau mọi hàng (= .card-row) */
.kpi-value { white-space: nowrap; }
.dv-kpi__label { font-size: var(--text-body); color: var(--text-secondary); }
.dv-kpi__delta { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 4px; font-size: var(--text-body); font-weight: var(--fw-semibold); }
.dv-kpi__delta .ti { font-size: 16px; }
.dv-kpi__delta--up { color: var(--text-success); }
.dv-kpi__delta--down { color: var(--text-danger); }
.dv-kpi__vs { font-weight: var(--fw-regular); color: var(--text-secondary); }
.dv-charts { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--card-col-gap); }
.dv-chart { display: flex; flex-direction: column; gap: var(--card-gap); min-width: 0; }   /* tiêu đề card → nội dung: --card-gap 12px (mọi card: biểu đồ / danh sách / bảng) */
.dv-chart--wide { grid-column: 1 / -1; }
.dv-chart__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.dv-chart__title { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;  padding-block: 2px; margin-block: -2px;   /* cắt “…” không cụt dấu chồng */ }
.dv-chart__type { flex-shrink: 0; padding: 0 8px; border-radius: var(--radius-default); background: var(--bg-neutral-light); font-size: var(--text-body); line-height: 22px; color: var(--text-secondary); }
.dv-chart__area { height: 260px; min-width: 0; }
.dv-chart__area--tall { height: 300px; }
.dv-chart__area--xl { height: 360px; }
/* KPI có biểu đồ nhỏ: chữ bên trái · icon (trên) + sparkline (dưới) bên phải */
.dv-spark { display: flex; align-items: stretch; gap: 16px; min-width: 0; }
.dv-prog { width: 112px; display: flex; align-items: center; gap: 8px; height: 20px; }   /* thay chỗ biểu đồ nhỏ, ngang dòng % so với kỳ trước */
.dv-spark--full { flex-wrap: wrap; row-gap: 8px; }   /* Tiến độ dài: xuống hàng dưới, cách dòng % 8px */
.dv-prog--full { width: auto; flex: 1 0 100%; }
.dv-prog__track { flex: 1; height: 6px; border-radius: var(--radius-pill); background: var(--bg-neutral-light); overflow: hidden; }
.dv-prog__fill { display: block; height: 100%; border-radius: inherit; background: var(--prog-c, var(--icon-brand)); transition: width .4s ease; }
.dv-prog__pct { min-width: 32px; text-align: right; font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); color: var(--text-primary); font-feature-settings: 'tnum'; }
.dv-prog--success { --prog-c: var(--icon-success); } .dv-prog--brand { --prog-c: var(--icon-brand); } .dv-prog--info { --prog-c: var(--icon-info); }
.dv-prog--warning { --prog-c: var(--icon-warning); } .dv-prog--danger { --prog-c: var(--icon-danger); }
.dv-spark__main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.dv-spark .kpi-value { margin: 4px 0 0; }   /* tiêu đề → số 8 · số → dòng % so với kỳ trước 4 (sát số) */
.dv-spark__side { flex-shrink: 0; width: auto; min-width: 44px; display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 6px; }
.dv-spark__side .kpi-icon { align-self: flex-end; }   /* sát mép phải, trên cùng */
.dv-spark__chart { width: 112px; height: 36px; }   /* icon 44 + cách 6 + 36 = vừa 3 dòng chữ → thẻ có / không biểu đồ cao như nhau */
.dv-spark .dv-chart__title { white-space: normal; }   /* tiêu đề KPI xuống dòng thay vì cắt “…” */
.dv-list__more { flex-shrink: 0; margin: calc((var(--text-h3-lh) - var(--btn-height)) / 2) calc(-1 * var(--btn-px)) calc((var(--text-h3-lh) - var(--btn-height)) / 2) auto; }   /* nút chữ: chữ thẳng mép phải nội dung (bù padding nút) · không làm hàng tiêu đề cao hơn dòng H3 → gap tiêu đề → nội dung đúng --card-gap */
.dv-list .dv-chart__head .dv-chart__title { flex: 0 1 auto; }
.dv-list__count { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; margin-left: 8px; padding: 0 6px; border-radius: var(--radius-default); background: var(--bg-danger-light); color: var(--text-danger); font-size: var(--text-body); line-height: 20px; font-weight: var(--fw-semibold); vertical-align: 2px; box-sizing: border-box; }
@container (min-width: 480px) { .dv-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 1200px) { .dv-kpis--spark { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@container (min-width: 680px) { .dv-charts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 960px) { .dv-kpis:not(.dv-kpis--spark) { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@container (max-width: 519px) {
  .dv-chart__area--xl { height: 240px; }
  .dv-spark__chart { width: 88px; }
}
@media (max-width: 600px) { .dv { padding: 12px; } }
</style>
