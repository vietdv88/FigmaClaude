# ECharts Dashboard — Patterns & Config Reference

> Dùng lại các pattern ECharts đã chuẩn hóa từ dự án `ketoan-dashboard`.  
> CHỈ dùng **Apache ECharts** — NGHIÊM CẤM Chart.js, D3, Recharts, hay thư viện khác.  
> Font bắt buộc: `InterVariable, "Inter var", sans-serif` — không hardcode font khác.

---

## 1. Setup

### CDN (thêm vào `index.html`)
```html
<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
```

### Container HTML
```html
<!-- width/height tường minh là bắt buộc — không dùng <canvas> -->
<div class="chart-wrap" :ref="el => setChartEl(el, w.id)"></div>
```
```css
.chart-wrap { flex: 1; width: 100%; min-height: 0; }
```

---

## 2. State & Helpers (trong `<script setup>`)

```js
/* ── ECharts state ── */
const chartEls       = {}   // DOM refs
const chartInstances = {}   // chart instances

function setChartEl(el, id) { if (el) chartEls[id] = el }
```

### Dark mode + font constants
```js
function getChartOpt(w) {
  const dark = isDark.value   // boolean — ref từ theme system
  const tc   = dark ? 'rgba(255,255,255,0.55)' : '#6b707a'   // text color axes/labels
  const gc   = dark ? 'rgba(255,255,255,0.08)' : '#e9eaeb'   // grid line color
  const lc   = dark ? '#ffffff'                : '#383c40'   // data label color
  const font = 'InterVariable, "Inter var", sans-serif'
  // ...
}
```

---

## 3. Gradient Helper

```js
const LG = (x1, y1, x2, y2, ...stops) =>
  new echarts.graphic.LinearGradient(x1, y1, x2, y2,
    stops.map(([o, c]) => ({ offset: o, color: c }))
  )

// Palette chuẩn — dùng nhất quán trong 1 dashboard
const G_MINT  = LG(0,0,0,1, [0,'#34d399'], [1,'#06b6d4'])   // teal → cyan
const G_ROSE  = LG(0,0,0,1, [0,'#fb7185'], [1,'#f97316'])   // rose → orange
const G_SKY   = LG(0,0,0,1, [0,'#60a5fa'], [1,'#818cf8'])   // blue → violet
const G_LAVEN = LG(0,0,0,1, [0,'#c084fc'], [1,'#a78bfa'])   // purple → violet
const G_AMBER = LG(0,0,0,1, [0,'#fbbf24'], [1,'#f97316'])   // amber → orange

// Màu điểm tương ứng (cho dots, legend)
const C_MINT  = '#2dd4bf'
const C_ROSE  = '#f87171'
const C_SKY   = '#60a5fa'
const C_LAVEN = '#a78bfa'
const C_AMBER = '#fbbf24'
```

---

## 4. Tooltip Preset

```js
const tooltip = {
  backgroundColor: dark ? 'rgba(20,16,32,0.92)' : '#fff',
  borderColor:     dark ? 'rgba(255,255,255,0.15)' : '#e9eaeb',
  textStyle: { color: dark ? '#ffffff' : '#10141b', fontFamily: font, fontSize: 12 },
}
// Dùng: tooltip: { ...tooltip, trigger:'axis', formatter: ... }
```

---

## 5. Axis Presets

```js
// X-axis category (dùng cho line, bar, cashflow)
const xAxisCategory = (data) => ({
  type: 'category', data,
  axisLine:  { show: false },
  axisTick:  { show: false },
  axisLabel: { color: tc, fontFamily: font, fontSize: 12 },
  splitLine: { show: false },
})

// Y-axis value
const yAxisValue = (formatter) => ({
  type: 'value',
  axisLabel: { color: tc, fontFamily: font, fontSize: 12, formatter },
  splitLine: { lineStyle: { color: gc } },
  axisLine:  { show: false },
  axisTick:  { show: false },
})

// Formatter tiền VND tỷ đồng
const fmtBillion = v => (v / 1e9).toFixed(1) + 'T'
```

---

## 6. Chart Configs

### 6.1 Line Chart — xu hướng đơn
```js
// type: 'chart-line'
{
  backgroundColor: 'transparent',
  grid: { top: 36, right: 16, bottom: 36, left: 64 },
  xAxis: xAxisCategory(['T1','T2','T3','T4','T5','T6']),
  yAxis: yAxisValue(fmtBillion),
  series: [{
    type: 'line',
    data: [3200000000, 3800000000, 4100000000, 3900000000, 4400000000, 4850000000],
    smooth: 0.4,
    lineStyle: { width: 2.5, color: LG(0,0,1,0, [0,'#60a5fa'], [1,'#2dd4bf']) },
    itemStyle: { color: C_MINT },
    symbol: 'circle', symbolSize: 7,
    emphasis: { focus: 'series' },
    label: {
      show: true, position: 'top',
      fontFamily: font, fontSize: 11, fontWeight: 700, color: lc,
      formatter: p => (p.value / 1e9).toFixed(2) + 'T',
    },
    areaStyle: { color: LG(0,0,0,1, [0,'rgba(96,165,250,0.28)'], [1,'rgba(45,212,191,0)']) },
  }],
  tooltip: { ...tooltip, trigger: 'axis',
    formatter: p => `${p[0].name}<br/><b>${(p[0].value/1e9).toFixed(2)} tỷ</b>`,
  },
}
```

### 6.2 Bar Chart — so sánh 2 series
```js
// type: 'chart-bar'
{
  backgroundColor: 'transparent',
  grid: { top: 40, right: 16, bottom: 36, left: 64 },
  legend: { top: 8, right: 16, textStyle: { color: tc, fontFamily: font, fontSize: 12 }, itemWidth: 10, itemHeight: 10, itemGap: 14 },
  xAxis: xAxisCategory(['T1','T2','T3','T4','T5','T6']),
  yAxis: yAxisValue(fmtBillion),
  series: [
    {
      name: 'Doanh thu', type: 'bar', barWidth: '28%',
      data: [3200000000, 3800000000, 4100000000, 3900000000, 4400000000, 4850000000],
      itemStyle: { color: G_MINT, borderRadius: [4,4,0,0] },
      label: { show: true, position: 'top', fontFamily: font, fontSize: 10, fontWeight: 700, color: lc, formatter: p => (p.value/1e9).toFixed(1)+'T' },
    },
    {
      name: 'Chi phí', type: 'bar', barWidth: '28%',
      data: [2100000000, 2300000000, 2600000000, 2400000000, 2700000000, 2950000000],
      itemStyle: { color: G_ROSE, borderRadius: [4,4,0,0] },
      label: { show: true, position: 'top', fontFamily: font, fontSize: 10, fontWeight: 700, color: lc, formatter: p => (p.value/1e9).toFixed(1)+'T' },
    },
  ],
  tooltip: { ...tooltip, trigger: 'axis',
    formatter: p => `${p[0].axisValue}<br/>` + p.map(s => `${s.seriesName}: <b>${(s.value/1e9).toFixed(2)} tỷ</b>`).join('<br/>'),
  },
}
```

### 6.3 Cashflow Chart — 2 lines + area fill
```js
// type: 'chart-cashflow'
{
  backgroundColor: 'transparent',
  grid: { top: 40, right: 16, bottom: 36, left: 64 },
  legend: { top: 8, right: 16, textStyle: { color: tc, fontFamily: font, fontSize: 12 }, itemWidth: 10, itemHeight: 10, itemGap: 14 },
  xAxis: xAxisCategory(['T1','T2','T3','T4','T5','T6']),
  yAxis: yAxisValue(fmtBillion),
  series: [
    {
      name: 'Thu', type: 'line', smooth: 0.4,
      data: [3200000000, 3800000000, 4100000000, 3900000000, 4400000000, 4850000000],
      lineStyle: { width: 2.5, color: LG(0,0,1,0, [0,'#34d399'], [1,'#06b6d4']) },
      itemStyle: { color: C_MINT },
      symbol: 'circle', symbolSize: 6,
      label: { show: true, position: 'top', fontFamily: font, fontSize: 10, fontWeight: 700, color: lc, formatter: p => (p.value/1e9).toFixed(1)+'T' },
      areaStyle: { color: LG(0,0,0,1, [0,'rgba(52,211,153,0.28)'], [1,'rgba(6,182,212,0)']) },
    },
    {
      name: 'Chi', type: 'line', smooth: 0.4,
      data: [2100000000, 2300000000, 2600000000, 2400000000, 2700000000, 2950000000],
      lineStyle: { width: 2.5, color: LG(0,0,1,0, [0,'#fb7185'], [1,'#f97316']) },
      itemStyle: { color: C_ROSE },
      symbol: 'circle', symbolSize: 6,
      label: { show: true, position: 'top', fontFamily: font, fontSize: 10, fontWeight: 700, color: lc, formatter: p => (p.value/1e9).toFixed(1)+'T' },
      areaStyle: { color: LG(0,0,0,1, [0,'rgba(251,113,133,0.24)'], [1,'rgba(249,115,22,0)']) },
    },
  ],
  tooltip: { ...tooltip, trigger: 'axis',
    formatter: p => `${p[0].axisValue}<br/>` + p.map(s => `${s.seriesName}: <b>${(s.value/1e9).toFixed(2)} tỷ</b>`).join('<br/>'),
  },
}
```

### 6.4 Donut Chart — phân bổ cơ cấu
```js
// type: 'chart-donut'
{
  backgroundColor: 'transparent',
  legend: {
    orient: 'vertical', right: 8, top: 'middle',
    textStyle: { color: tc, fontFamily: font, fontSize: 12 },
    icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 10,
  },
  series: [{
    type: 'pie', radius: ['48%','72%'], center: ['38%','50%'],
    avoidLabelOverlap: true,
    label: { show: true, fontFamily: font, fontSize: 11, fontWeight: 700, color: lc, formatter: p => p.percent.toFixed(0)+'%' },
    labelLine: { show: true, length: 8, length2: 6, lineStyle: { color: dark ? 'rgba(255,255,255,0.35)' : '#ced1d6', width: 1 } },
    emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold', fontFamily: font } },
    itemStyle: { borderRadius: 4, borderWidth: 0 },
    data: [
      { value: 2350000000, name: 'Bán hàng',  itemStyle: { color: G_MINT  } },
      { value: 1200000000, name: 'Dịch vụ',   itemStyle: { color: G_SKY   } },
      { value: 850000000,  name: 'Xuất khẩu', itemStyle: { color: G_LAVEN } },
      { value: 450000000,  name: 'Khác',       itemStyle: { color: G_AMBER } },
    ],
  }],
  tooltip: { ...tooltip, trigger: 'item',
    formatter: p => `${p.name}<br/><b>${(p.value/1e9).toFixed(2)} tỷ</b> (${p.percent.toFixed(1)}%)`,
  },
}
```

---

### 6.5 Stacked column / Stacked bar — cơ cấu trong từng nhóm
- Mỗi series cùng `stack: '<tên>'`; màu theo thứ tự cố định P(0), P(1)… của bộ màu biểu đồ.
- Khe 2px màu nền giữa các đoạn: `itemStyle: { borderColor: var(--bg-white), borderWidth: 1 }`.
- Chỉ đoạn NGOÀI CÙNG bo 4px: cột `[4, 4, 0, 0]`, thanh ngang `[0, 4, 4, 0]`; các đoạn khác `0`.
- Stacked bar 100%: `xAxis.max: 100`, nhãn trục `v + '%'`; nhãn trong đoạn chỉ hiện khi ≥ 20% (`label.position: 'inside'`, chữ `--text-white`).
- Luôn có chú thích (≥ 2 series); chừa `grid.bottom` đủ cho nhãn trục + chú thích (khung hẹp chú thích xuống 2 dòng → tăng thêm ~24px).

### 6.6 Radar (Spiderweb) — so sánh nhiều tiêu chí
- `radar.indicator: [{ name, max }]`, `splitArea.show: false`, `splitLine` / `axisLine` màu `--stroke-neutral-light`, tên trục `--text-secondary` 13px.
- Tối đa 2–3 series; series so sánh (trung bình, năm trước) nét đứt + nền nhạt hơn (alpha 14 so với 33) → phân biệt cả khi không nhìn màu.
- Khung hẹp: `radius` nhỏ lại (~46%) và tên trục dài xuống 2 dòng (`axisName.formatter`, `lineHeight: 18`) để không cụt mép.

### 6.7 Bubble — 3 đại lượng (x, y, kích thước)
- `type: 'scatter'`, `data: [[x, y, size]]`, `symbolSize: v => 12 + Math.sqrt(v[2]) * k` (diện tích ∝ giá trị — không để bán kính ∝ giá trị vì phóng đại số lớn).
- Bong bóng chồng nhau: màu hơi trong (`+ 'b3'`) + vòng 2px màu nền (`borderColor: var(--bg-white)`); hover về màu đặc.
- Tooltip ghi đủ 3 giá trị kèm đơn vị; tên 2 trục ghi đơn vị.

### 6.7a KPI card có biểu đồ nhỏ (sparkline)
- Khoảng cách dọc trong thẻ: tiêu đề → số chính 8px · số chính (H1 24/32) → dòng “% so với kỳ trước” 4px (sát số). Cột phải: icon 44 · cách 6 · biểu đồ nhỏ 112 × 36 → thẻ 118px, có / không biểu đồ cao như nhau.
- Hàng / lưới KPI: mọi thẻ CAO BẰNG NHAU (`.card-row` đã có `grid-auto-rows: 1fr`) và tối ưu THẤP: biểu đồ nhỏ / thanh tiến độ nằm cột phải (không thêm hàng dưới) để mọi thẻ chỉ cao 3 dòng chữ + đệm.
- Biểu đồ nhỏ là TÙY CHỌN: màn đã nhiều biểu đồ thì KPI chỉ số + icon (không sparkline) cho gọn; chỉ thêm sparkline khi xu hướng của chính chỉ số đó quan trọng. Một màn chỉ 1 hàng KPI.
- Trái: tiêu đề H3 Semi Bold · số lớn `.kpi-value` (+ đơn vị `.kpi-value__unit` chữ Regular 13 Text/Secondary — chỉ số đậm, đơn vị KHÔNG đậm) · % thay đổi (icon trending + số Semi Bold Text/Success hoặc Text/Danger theo TỐT / XẤU, không theo tăng / giảm) + “so với kỳ trước” Text/Secondary.
- Phải: icon outline `.kpi-icon--{theme}` sát GÓC TRÊN PHẢI (mọi KPI card — không căn giữa dọc), sparkline 112 × 48 (điện thoại 88) dưới cùng — CÙNG màu icon (đọc `getComputedStyle(icon).color`).
- Màu thẻ (icon + sparkline) theo Ý NGHĨA chỉ số: chỉ số mà tăng là XẤU (chi phí, tỷ lệ hoàn / huỷ…) đang tăng → `danger`; còn lại màu nhận diện của thẻ. Dữ liệu sparkline thể hiện XU HƯỚNG — dao động vừa phải, không giật lên xuống.
- Dạng biểu đồ nhỏ chọn theo ý nghĩa chỉ số (mỗi thẻ có thể khác nhau): **area** — xu hướng (doanh thu): nền gradient đỉnh ~30% → gần trong suốt ở đáy (rõ hơn area lớn vì biểu đồ nhỏ); đáy trục hạ thấp (min = thấp nhất − 40% biên độ), gradient đỉnh ~36% để đường nằm nửa trên, vùng nền đủ cao, nét 2px (cong mượt hoặc gấp khúc — theo tùy chọn smooth chung của màn) đi lên có lúc giảm, nền gradient rất nhạt, chấm trắng viền màu + quầng ở đỉnh giữa chừng · **bar** — ~7 cột MẢNH (7px, cách nhau 4px, cụm sát mép phải) gốc từ 0, cao thấp chênh rõ; cột cao nhất tô màu thẻ, còn lại xám Stroke/Neutral · **line** — đường không nền, không kẻ vạch trung bình (gọn).
- ⛔ Không dùng biểu đồ tròn / vòng trong thẻ KPI.
- Dạng **thanh tiến độ** dưới thẻ (% đạt chỉ tiêu / đã dùng ngân sách): thanh cao 6px bo tròn, đặt ĐÚNG CHỖ biểu đồ nhỏ (cột phải dưới icon, rộng ~112px, ngang dòng % so với kỳ trước — thẻ không cao thêm), màu = màu icon thẻ, nền BG Neutral Light, % bên phải cách 8px chữ 13 Semi Bold Text/Primary; dùng thay biểu đồ nhỏ, không dùng cùng lúc. Biến thể **tiến độ dài**: thanh hết bề ngang thẻ ở hàng dưới (cách dòng % 8px) — thẻ cao hơn, cả hàng vẫn cao bằng nhau; dùng khi tiến độ là thông tin chính của thẻ.
- Sparkline: không trục / lưới / chú thích; đường cong vừa phải (`smooth: 0.4` + `smoothMonotone: 'x'` — không gợn sóng thừa), nét 2px, nền gradient rất nhạt (đỉnh ~16% → 0); điểm cao nhất = chấm trắng viền màu 2px + quầng màu 20%; tooltip “Kỳ n: giá trị”.

### 6.7b Biểu đồ khác (mẫu sống ở /ds/data-visualization)
| Loại | Khi dùng | Quy chuẩn màu / hiển thị |
|---|---|---|
| Area + kéo vùng xem (dataZoom) | Chuỗi dài (365 ngày) | `dataZoom` inside + slider cao 24: viền Stroke/Neutral Light, vùng chọn màu 1 ~12%, tay kéo trắng viền màu 1; `sampling: 'lttb'` |
| Column + line 2 trục | 2 đại lượng khác đơn vị (tỷ đồng + %) | Ghi tên trục / đơn vị ở CẢ 2 bên; đường trục phải không kẻ lưới; đường dùng màu khác hẳn cột |
| Column có nền | Thấy phần còn thiếu so với mức cao nhất | `showBackground`, nền BG Neutral Light, cùng bo 4px đỉnh |
| Area gradient nhiều dãy | So sánh 2–3 dãy theo thời gian | KHÔNG chồng (stack); dữ liệu dáng TỰ NHIÊN (thấp → lên dần, thỉnh thoảng chững / giảm nhẹ rồi lại lên, đan cắt nhẹ — không giật cục); `smooth: 0.4` + `smoothMonotone: 'x'` (không gợn sóng thừa); tối đa 3 dãy; CHỈ dãy chính có nền gradient (~18% → 0, nét 2,5px), dãy phụ chỉ nét 2px (nhiều lớp nền chồng → đục màu); số cuối kỳ ở đầu đường (`endLabel` cùng màu, `labelLayout.moveOverlap`) |
| Bar ngang 2 năm | So sánh khu vực / tên dài | Năm nay màu 1, năm trước màu 3; mục lớn nhất ở trên |
| Column nhóm từ `dataset` | Dữ liệu dạng bảng | `dataset.source` dòng đầu = tên cột; series chỉ khai báo kiểu |
| Heatmap | Độ lớn theo 2 chiều (giờ × thứ) | Bộ **Single Hue** (nhạt = ít → đậm = nhiều), ô cách 2px màu nền, bo 4px, thang màu “Ít → Nhiều” dưới |
| Funnel | Các bước nối tiếp giảm dần | Hình phễu tam giác RÕ: mỗi tầng hẹp dần ĐỀU (`value: 100 - i × 100/n`, `minSize: '0%'`, `min 0 / max 100` → đáy nhọn), số thật để trường riêng; KHÔNG tỉ lệ độ rộng theo số (chênh lớn → tầng dưới gần bằng nhau); **Single Hue** đậm → nhạt; tên + % ghi TRONG tầng, chữ Text/White hoặc Text/Primary theo độ sáng nền; tầng cuối (tam giác) tên / % 2 dòng đẩy lên `offset [0, -12]`; điện thoại mọi tầng 2 dòng, tầng cuối ghi bên phải |
| Gauge | 1 chỉ số so với mục tiêu | Vòng tiến độ màu 1 trên nền BG Neutral Light, bo đầu; vạch / số trục Stroke/Neutral + Text/Secondary; số lớn giữa, dòng phụ “Đã đạt x / y” |
| Scatter phân cụm | Nhóm đối tượng theo 2 đại lượng | Mỗi cụm 1 màu (thứ tự 1 → n) + 1 HÌNH điểm (tròn / vuông / tam giác / thoi) — chú thích cùng hình; tâm cụm = hình to viền trắng |
| Bản đồ choropleth + điểm | Số liệu theo quốc gia / vùng | Tô vùng **Single Hue**, vùng không số liệu BG Neutral Light, ranh giới 0,5px màu nền; điểm = màu nhấn trong palette viền trắng, nhãn có viền chữ trắng; giữ tỉ lệ bản đồ (`layoutCenter` + `layoutSize`, không dùng top/left/right/bottom); tên nước hiện tiếng Việt |

### 6.8 Danh sách trong card dashboard — 2 dạng
**Chung:** mọi card (KPI, biểu đồ, danh sách, bảng) padding **16px** đều 4 phía (`--box-padding`) — như mọi card khác. Tiêu đề card (H3 Semi Bold) → nội dung cách `--card-gap` (12px) — giống card biểu đồ; nội dung nằm trong padding card (chữ thẳng mép tiêu đề, dòng cuối cách đáy đúng padding). Link **Xem tất cả** (`.btn--text`) cuối hàng tiêu đề: bù padding nút (`margin-right: calc(-1 * var(--btn-px))`) để chữ thẳng mép phải nội dung, margin dọc âm `calc((var(--text-h3-lh) - var(--btn-height)) / 2)` để hàng tiêu đề không cao hơn dòng H3.

**Dạng 1 — Danh sách (`.card-list`, KHÔNG header cột):** widget chỉ cần **tên ↔ giá trị** (top nhân viên, đơn hàng gần đây, công việc quá hạn…).
- Mỗi dòng `li.card-list__item` (cao tối thiểu 56px, gap 12):
  - Trái: `AppAvatar :size="32" color="auto"` (người — nền cố định theo tên, chữ Text/Primary) hoặc `span.card-list__icon` (icon 16 trên nền 32×32; `--brand|success|warning|danger`).
  - Giữa `.card-list__body`: `.card-list__title` (Medium, Text/Primary) + `.card-list__sub` (Text/Secondary) — cắt “…” 1 dòng.
  - Phải `.card-list__end`: `.card-list__value` (Semi Bold, số tnum; `--success|warning|danger` cho trạng thái như “Quá hạn 3 ngày”) + `AppTag dot` hoặc `.card-list__sub` (VD “100% chỉ tiêu”, “Hạn 03/11/2026”).
- Nền hover Brand Light bo góc tràn 8px ra 2 bên + đáy (`.card-list` margin `0 -8px -8px`); vạch ngăn 1px Stroke/Neutral Light giữa các dòng (ẩn khi hover).
- Số đếm cạnh tiêu đề (VD Công việc quá hạn 4): chip tròn nền Danger Light chữ Text/Danger.

**Dạng 2 — Bảng có header cột (DataTable `summary` — bảng tóm tắt chỉ xem):** khi cần so sánh nhiều thuộc tính theo cột (doanh thu · tiến độ · trạng thái…).
- `<DataTable summary …/>`: style y bảng chuẩn, bỏ vách ngăn cột + lọc cột + header ghim; vẫn sắp xếp (menu cột chỉ còn Sắp xếp) và kéo đổi độ rộng cột (chi tiết: vue-controls.md → “Bảng tóm tắt chỉ xem”). KHÔNG ghi đè style riêng trong card.
- Ô 2 dòng: `avatar-subtext` (+ `avatarColor: 'auto'`) · `subtext`; số tiền căn phải; `progress`, `status`.
- Khung hẹp (< 520px): ẩn cột phụ (`hidden`) và thu độ rộng cột thay vì bắt cuộn ngang.

Mẫu sống cả 2 dạng: [/ds/data-visualization](/ds/data-visualization).

### 6.9 Thuộc tính hay dùng (xem thử bật / tắt ở /ds/data-visualization)
| Thuộc tính | Mặc định | Quy chuẩn |
|---|---|---|
| Nhãn số liệu (data label) | Tắt (trừ bar 1 dãy luôn ghi số cuối thanh) | Chữ 12px token chữ: Text/Primary ngoài cột, Text/White trong cột / đoạn — không dùng màu series. Line 2 dãy: chỉ ghi dãy chính. Stacked: đoạn < 10% không ghi. Area nhiều điểm: chỉ đánh dấu Cao nhất / Thấp nhất (`markPoint`). Donut: % trong vòng (vòng dày hơn khi bật). `labelLayout: { hideOverlap: true }` khi dày |
| Chú thích (legend) | Dưới | ≥ 2 dãy luôn có; đưa lên trên thì cộng grid.top 24px (khung hẹp ≥ 3 mục: 48px) và bớt grid.bottom. Donut: chú thích dọc bên phải kèm % |
| Đường lưới (grid line) | Bật | Chỉ trục giá trị, nét đứt 1px Stroke/Neutral Light |
| Tên trục / đơn vị (axis title) | Bật | Ghi đơn vị (Tỷ đồng, triệu…) ở đầu trục giá trị, Text/Secondary 13px |
| Đường cong mượt (smooth) | Bật | Line / area `smooth: true`; dữ liệu cần thấy điểm gãy thật → tắt |

**Nhãn trục danh mục DÀI** (VD “Tháng 1” thay “T1”): không để ECharts tự ẩn bớt nhãn (mất tháng) → `axisLabel.interval: 0` và xử lý theo bề rộng mỗi cột: ≥ 64px 1 dòng · 36–64px xuống 2 dòng tại khoảng trắng (`width: <bề rộng cột>, overflow: 'break', lineHeight: 16`) · < 36px (điện thoại) nghiêng 45° (`rotate: 45`, grid.left ≥ 28 để nhãn đầu không cắt). Ưu tiên tên ngắn (T1…T12) khi trục đã rõ là tháng; tên rất dài (tên sản phẩm, phòng ban) → đổi sang biểu đồ thanh ngang.

**Nhãn trục DÀY (nhiều mốc: 15 mốc giờ, 30 ngày…)**: nhãn không được đè nhau → **gộp bớt** theo bề rộng khung THẬT (rộng ra thì hiện nhiều hơn): mỗi mốc có bề rộng `w = (bề rộng khung − lề trục) / số mốc`; nếu `w` < bề rộng 1 nhãn + khe (~36px cho “22h”, ~56px cho “04/10”) thì chỉ hiện mỗi `k = ceil(minW / w)` mốc: `axisLabel: { interval: k − 1, hideOverlap: true }` (hideOverlap là lưới an toàn). Mốc đầu luôn hiện, tooltip vẫn đủ mọi mốc. ⛔ Không để `interval: 0` cố định cho trục dày. Demo: hàm `thinLabel(id, n, minW, plotPad)` trong `mds-docs/src/demos/DataVizDemo.vue`.
**Tên thứ trong tuần theo cùng tùy chọn với tên tháng**: ngắn `T2…T7, CN` · dài `Thứ 2…Thứ 7, Chủ nhật` — không gõ cứng `T2…` ở một số biểu đồ (không đổi theo tùy chọn, lại dễ nhầm với tháng 2).

## 7. Lifecycle Management

```js
function initCharts() {
  const CHART_TYPES = ['chart-line', 'chart-donut', 'chart-bar', 'chart-cashflow']
  nextTick(() => {
    widgets.value.filter(w => CHART_TYPES.includes(w.type)).forEach(w => {
      const el = chartEls[w.id]
      if (!el) return
      if (chartInstances[w.id]) chartInstances[w.id].dispose()
      const chart = echarts.init(el, null, { renderer: 'canvas' })
      chartInstances[w.id] = chart
      chart.setOption(getChartOpt(w))
    })
  })
}

function resizeCharts() {
  Object.values(chartInstances).forEach(c => c?.resize())
}

// Re-init khi đổi dark/light theme
watch(isDark, () => initCharts())

// ResizeObserver để chart resize theo container
const ro = new ResizeObserver(resizeCharts)

onMounted(async () => {
  await nextTick()
  initCharts()
  if (mainEl.value) ro.observe(mainEl.value)
})

onUnmounted(() => {
  ro.disconnect()
  Object.values(chartInstances).forEach(c => c?.dispose())
})
```

---

## 8. Checklist trước khi dùng

- [ ] `echarts` CDN đã có trong `index.html`
- [ ] Container chart là `<div>` có `width/height` tường minh (flex:1 + min-height:0)
- [ ] `font` constant dùng `InterVariable, "Inter var", sans-serif` — không font khác
- [ ] Tất cả màu lấy từ palette `G_*` / `C_*` — không hardcode hex tự sinh
- [ ] Gọi `resizeCharts()` sau mọi thao tác thay đổi kích thước layout
- [ ] `dispose()` tất cả instances trong `onUnmounted`
- [ ] `watch(isDark, () => initCharts())` để chart tự cập nhật khi đổi theme
