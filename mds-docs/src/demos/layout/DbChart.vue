<template>
  <!-- Biểu đồ mẫu cho layout Tổng quan — vẽ bằng Apache ECharts theo QUY CHUẨN BIỂU ĐỒ (/ds/data-visualization · skill echarts-dashboard.md):
       màu bộ Chart Colors theo màu chủ đề, thứ tự cố định 1 → n (phân kỳ: bộ Divergent 2 cực) · cột bo 4px đỉnh · donut khe 2px + tổng ở tâm ·
       lưới nét đứt 1px chỉ trục giá trị · tên trục / đơn vị · chú thích dưới (≥ 2 dãy) · tooltip nền tối, số 1.234.567 · có nút xem dạng bảng (DataTable summary) -->
  <div class="dbc">
    <DataTable v-if="table" class="dbc-table" :columns="tableCols" :rows="tableRows" summary :hide-blank-rows="false" />
    <div v-else ref="el" class="dbc-chart" role="img" :aria-label="title" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import DataTable from '@mds/components/DataTable.vue'
import { fmtNum } from '@mds/utils/number.js'

const props = defineProps({
  chart: { type: Object, required: true },
  title: { type: String, default: '' },
  /** Hiện bảng số liệu thay biểu đồ */
  table: { type: Boolean, default: false },
})
const el = ref(null)
let ch = null, ro = null
const c = computed(() => props.chart)
const FONT = 'InterVariable, "Inter var", sans-serif'
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
/* màu chuỗi có thể là var(--…) → đổi ra mã màu thật cho ECharts */
const col = v => (v && v.startsWith('var(') ? cssVar(v.slice(4, -1)) : v)
const fmt = v => fmtNum(v)
const unitName = computed(() => (c.value.unit === 'triệu' ? 'Triệu đồng' : c.value.unit || ''))

function base() {
  const hint = cssVar('--text-secondary'), grid = cssVar('--stroke-neutral-light')
  return {
    hint, grid,
    axisCat: { type: 'category', axisTick: { show: false }, axisLine: { lineStyle: { color: grid } }, axisLabel: { color: hint, fontSize: 13 } },
    axisVal: { type: 'value', splitLine: { lineStyle: { color: grid, type: 'dashed' } }, axisLabel: { color: hint, fontSize: 13, formatter: fmt },
      name: unitName.value, nameTextStyle: { color: hint, fontSize: 13, align: 'left' } },
    tooltip: { backgroundColor: cssVar('--neutral-900'), borderWidth: 0, textStyle: { color: cssVar('--text-white'), fontSize: 13, fontFamily: FONT }, extraCssText: 'border-radius:8px;box-shadow:none;' },
    legend: { bottom: 0, icon: 'roundRect', itemWidth: 12, itemHeight: 12, itemGap: 16, textStyle: { color: cssVar('--text-primary'), fontSize: 13 } },
  }
}
const narrowW = () => (el.value?.clientWidth || 600) < 440   // thẻ hẹp (1/3 hàng): chú thích xuống dưới, tự xuống dòng (không lật trang)

function option() {
  const b = base(), t = c.value.type, u = c.value.unit ? ' ' + c.value.unit : ''
  const shadow = { type: 'shadow', shadowStyle: { color: cssVar('--alpha-black-50') } }
  if (t === 'stack') {
    const S = c.value.series
    return {
      grid: { top: 28, right: 8, bottom: 32, left: 8, containLabel: true },
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: shadow, valueFormatter: v => fmt(v) + u },
      legend: b.legend,
      xAxis: { ...b.axisCat, data: c.value.cats }, yAxis: b.axisVal,
      // khe 1px màu nền giữa các đoạn · chỉ đoạn TRÊN CÙNG bo 4px
      series: S.map((s, i) => ({ name: s.label, type: 'bar', stack: 'a', data: s.data, barMaxWidth: 28,
        itemStyle: { color: col(s.color), borderColor: cssVar('--bg-white'), borderWidth: 1, borderRadius: i === S.length - 1 ? [4, 4, 0, 0] : 0 } })),
    }
  }
  if (t === 'donut') {
    const segs = c.value.segs, total = segs.reduce((a, s) => a + s.value, 0), nar = narrowW()
    const cx = nar ? '50%' : '30%'
    return {
      tooltip: { ...b.tooltip, trigger: 'item', formatter: p => `${p.marker}${p.name}: <b>${fmt(p.value)}</b>${u} (${fmtNum(p.percent, { decimals: 1 })}%)` },
      // ≥ 2 nhóm → luôn có chú thích kèm % · khung hẹp: chú thích xuống dưới
      legend: nar ? { ...b.legend, itemGap: 12, formatter: n => { const s = segs.find(x => x.label === n); return `${n} ${fmtNum(s.value / total * 100, { decimals: 0 })}%` } }
        : { ...b.legend, orient: 'vertical', bottom: 'auto', left: '60%', top: 'middle', itemGap: 12,
            formatter: n => { const s = segs.find(x => x.label === n); return `${n}  ${fmtNum(s.value / total * 100, { decimals: 1 })}%` } },
      title: { text: fmt(total), subtext: c.value.unit || '', left: cx, top: nar ? '27%' : 'center', textAlign: 'center', itemGap: 2,
        textStyle: { fontFamily: FONT, fontSize: 20, fontWeight: 600, color: cssVar('--text-primary') }, subtextStyle: { fontFamily: FONT, fontSize: 13, color: b.hint } },
      series: [{ type: 'pie', radius: nar ? ['36%', '54%'] : ['46%', '68%'], center: [cx, nar ? '36%' : '50%'], label: { show: false }, labelLine: { show: false },
        itemStyle: { borderRadius: [4, 0], borderColor: cssVar('--bg-white'), borderWidth: 2 }, emphasis: { scale: true, scaleSize: 4 },
        data: segs.map(s => ({ name: s.label, value: s.value, itemStyle: { color: col(s.color) } })) }],
    }
  }
  if (t === 'hbar') {
    const rows = [...c.value.rows].sort((a, x) => a.value - x.value)   // trục danh mục ngang: mục đầu nằm dưới → lớn nhất ở trên
    const total = rows.reduce((a, r) => a + r.value, 0)
    return {
      grid: { top: 8, right: 56, bottom: 8, left: 120 },   // lề trái cố định cho tên (containLabel đo Inter hẹp → cắt chữ)
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: shadow, formatter: ps => `${ps[0].name}<br>Doanh thu: <b>${fmt(ps[0].value)}</b>${u}<br>Tỷ trọng: <b>${fmtNum(ps[0].value / total * 100, { decimals: 1 })}%</b>` },
      xAxis: { ...b.axisVal, name: '', splitLine: { show: false }, axisLabel: { show: false } },
      yAxis: { ...b.axisCat, axisLine: { show: false }, data: rows.map(r => r.label), axisLabel: { color: cssVar('--text-primary'), fontSize: 13, width: 108, overflow: 'truncate', margin: 12 } },
      // 1 dãy → ghi số cuối thanh, không cần chú thích
      series: [{ type: 'bar', data: rows.map(r => r.value), barMaxWidth: 20, itemStyle: { color: col(c.value.color), borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', color: cssVar('--text-primary'), fontSize: 13, fontFamily: FONT, formatter: p => fmt(p.value) } }],
    }
  }
  if (t === 'line') {
    return {
      grid: { top: 28, right: 16, bottom: 32, left: 8, containLabel: true },
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: { type: 'line', lineStyle: { color: b.grid } }, valueFormatter: v => fmt(v) + u },
      legend: b.legend,
      xAxis: { ...b.axisCat, data: c.value.cats, boundaryGap: false }, yAxis: b.axisVal,
      // kỳ so sánh nét đứt → phân biệt cả khi không nhìn màu · đường cong vừa phải, không gợn sóng thừa
      series: c.value.series.map(s => ({ name: s.label, type: 'line', data: s.data, smooth: 0.4, smoothMonotone: 'x', symbol: 'circle', symbolSize: 8, showSymbol: false,
        lineStyle: { color: col(s.color), width: 2, ...(s.dash ? { type: 'dashed' } : {}) }, itemStyle: { color: col(s.color), borderColor: cssVar('--bg-white'), borderWidth: 2 } })),
    }
  }
  if (t === 'diverge') {
    const [pos, neg] = c.value.poles
    return {
      grid: { top: 28, right: 8, bottom: 32, left: 8, containLabel: true },
      tooltip: { ...b.tooltip, trigger: 'axis', axisPointer: shadow, formatter: ps => { const v = ps[0].value, p = v >= 0 ? pos : neg; return `${ps[0].name}<br>${ps[0].marker}${p.label}: <b>${v > 0 ? '+' : ''}${fmt(v)}</b>${u}` } },
      legend: { ...b.legend, data: [pos.label, neg.label] },
      xAxis: { ...b.axisCat, data: c.value.cats, axisLine: { show: false } },
      yAxis: { ...b.axisVal, splitLine: { lineStyle: { color: b.grid, type: 'dashed' } } },
      // 2 cực màu (bộ Divergent): dương lên, âm xuống · bo 4px ở đầu xa mốc 0 · mốc 0 kẻ liền đậm hơn
      series: [
        { name: pos.label, type: 'bar', stack: 'd', barMaxWidth: 24, data: c.value.data.map(v => (v >= 0 ? v : '-')), itemStyle: { color: col(pos.color), borderRadius: [4, 4, 0, 0] },
          markLine: { silent: true, symbol: 'none', label: { show: false }, lineStyle: { color: cssVar('--stroke-neutral'), type: 'solid', width: 1 }, data: [{ yAxis: 0 }] } },
        { name: neg.label, type: 'bar', stack: 'd', barMaxWidth: 24, data: c.value.data.map(v => (v < 0 ? v : '-')), itemStyle: { color: col(neg.color), borderRadius: [0, 0, 4, 4] } },
      ],
    }
  }
  return {}
}

function render() {
  if (props.table || !el.value) return
  ch = ch || echarts.init(el.value, null, { renderer: 'svg' })
  ch.setOption({ textStyle: { fontFamily: FONT }, animationDuration: 500, ...option() }, true)
}
onMounted(async () => {
  await nextTick(); render()
  ro = new ResizeObserver(() => { ch?.resize(); if (c.value.type === 'donut') render() })   // donut đổi bố cục chú thích theo bề rộng
  el.value && ro.observe(el.value)
})
watch(() => props.table, async v => {
  if (v) { ch?.dispose(); ch = null; return }
  await nextTick(); render(); el.value && ro?.observe(el.value)
})
watch(() => JSON.stringify(props.chart), () => nextTick(render))
onBeforeUnmount(() => { ro?.disconnect(); ch?.dispose() })

/* Bảng số liệu (DataTable summary — bảng tóm tắt chỉ xem): cột đầu = danh mục, các cột số căn phải */
const tableCats = computed(() => {
  const t = c.value.type
  if (t === 'hbar') return [...c.value.rows].sort((a, x) => x.value - a.value).map(r => r.label)
  if (t === 'donut') return c.value.segs.map(s => s.label)
  return c.value.cats
})
const tableSeries = computed(() => {
  const t = c.value.type
  if (t === 'hbar') return [{ label: 'Giá trị', data: [...c.value.rows].sort((a, x) => x.value - a.value).map(r => r.value) }]
  if (t === 'donut') return [{ label: 'Giá trị', data: c.value.segs.map(s => s.value) }]
  if (t === 'diverge') return [{ label: 'Giá trị', data: c.value.data }]
  return c.value.series
})
const tableCols = computed(() => [
  { key: 'cat', label: c.value.catLabel || (c.value.type === 'donut' ? 'Khoản mục' : 'Danh mục'), minWidth: 120 },
  ...tableSeries.value.map((s, i) => ({ key: 's' + i, label: s.label + (c.value.unit ? ` (${c.value.unit})` : ''), align: 'right', minWidth: 110 })),
])
const tableRows = computed(() => tableCats.value.map((cat, j) => ({ id: j, cat, ...Object.fromEntries(tableSeries.value.map((s, i) => ['s' + i, fmtNum(s.data[j])])) })))
</script>

<style scoped>
.dbc { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.dbc-chart { flex: 1; min-height: 220px; min-width: 0; }
.dbc-table { flex: 1; min-height: 0; overflow: auto; }
</style>
