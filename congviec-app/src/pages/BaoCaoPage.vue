<template>
  <AppShell>
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title h2">Báo cáo</h1>
      </div>
      <div class="page-header__right">
        <select class="period-sel" v-model="period">
          <option>Tuần này</option>
          <option>Tháng này</option>
          <option>Quý này</option>
          <option>Năm nay</option>
        </select>
      </div>
    </div>

    <div class="content-wrapper">

      <!-- KPI row -->
      <div class="kpi-row">
        <div class="kpi-card" v-for="k in kpiCards" :key="k.label">
          <div class="kpi-card__head">
            <div class="kpi-title-wrap">
              <span class="kpi-title">{{ k.label }}</span>
              <button class="card__btn-icon"><TIcon name="refresh" /></button>
            </div>
            <div class="kpi-icon" :class="`kpi-icon--${k.color}`">
              <TIcon :name="k.icon" />
            </div>
          </div>
          <div class="kpi-value">{{ k.val }}</div>
          <div class="kpi-sub">{{ k.sub }}</div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="charts-row">

        <div class="card card--chart-lg">
          <div class="card__head">
            <div class="card__title-wrap">
              <span class="card__title">Tiến độ công việc theo tuần</span>
              <button class="card__btn-icon"><TIcon name="refresh" /></button>
            </div>
            <div class="head-right">
              <button class="card__btn-icon" style="opacity:1"><TIcon name="settings" /></button>
            </div>
          </div>
          <div ref="chartTienDo" class="chart-area"></div>
        </div>

        <div class="card card--chart-sm">
          <div class="card__head">
            <div class="card__title-wrap">
              <span class="card__title">Phân bổ theo loại</span>
              <button class="card__btn-icon"><TIcon name="refresh" /></button>
            </div>
          </div>
          <div ref="chartPhanBo" class="chart-area"></div>
        </div>

      </div>

      <!-- Table: Top công việc quá hạn -->
      <div class="table-panel">
        <div class="th-wrapper">
          <TableHeader
            v-model="searchText"
            search-placeholder="Tìm công việc..."
            @refresh="() => {}"
            @export="() => {}"
          />
        </div>
        <div class="table-scroll">
          <DataTable
            :columns="columns"
            :rows="pagedRows"
            :row-actions="rowActions"
            :hide-blank-rows="true"
          />
        </div>
        <AppPagination
          :total="reportRows.length"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
        />
      </div>

    </div>
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as echarts from 'echarts'
import AppShell      from '../components/AppShell.vue'
import TableHeader   from '@mds/components/TableHeader.vue'
import DataTable     from '@mds/components/DataTable.vue'
import AppPagination from '@mds/components/AppPagination.vue'
import TIcon         from '@mds/components/TIcon.vue'

const period      = ref('Tuần này')
const searchText  = ref('')
const currentPage = ref(1)
const pageSize    = ref(20)

const kpiCards = [
  { label: 'Tổng công việc',     val: '13',  sub: 'Trong kỳ báo cáo',   icon: 'clipboard-list', color: 'brand'   },
  { label: 'Đã hoàn thành',      val: '1',   sub: 'Tỷ lệ: 7.7%',        icon: 'circle-check',   color: 'success' },
  { label: 'Đang thực hiện',     val: '4',   sub: 'Chưa quá hạn',        icon: 'clock-hour-4',   color: 'info'    },
  { label: 'Quá hạn',            val: '8',   sub: 'Cần xử lý ngay',      icon: 'alert-triangle', color: 'danger'  },
]

const columns = [
  { key: 'stt',      label: 'STT',             width: 48,  align: 'center', noFilter: true, noMenu: true },
  { key: 'task',     label: 'Tên công việc',   minWidth: 220 },
  { key: 'assignee', label: 'Người thực hiện', width: 180 },
  { key: 'deadline', label: 'Hạn chót',        width: 110 },
  { key: 'overdueDays', label: 'Số ngày trễ',  width: 110, align: 'right' },
  { key: 'status',   label: 'Trạng thái',      type: 'status', width: 130 },
]

const rowActions = [
  { icon: 'eye',    title: 'Xem chi tiết', emit: 'view' },
]

const reportRows = [
  { id:1, task:'Việc của tôi',           assignee:'Đoàn Văn Việt',   deadline:'25/09/2020', overdueDays: 2101 },
  { id:2, task:'Công việc kiểm thử',      assignee:'Nguyễn Thị Mai',  deadline:'14/09/2023', overdueDays: 285  },
  { id:3, task:'Review tài liệu kỹ thuật',assignee:'Trần Văn Hùng',   deadline:'29/09/2023', overdueDays: 270  },
  { id:4, task:'Phê duyệt đơn nghỉ phép', assignee:'Đoàn Văn Việt',  deadline:'30/01/2023', overdueDays: 512  },
  { id:5, task:'Họp tổng kết quý',        assignee:'Lê Thị Hoa',     deadline:'31/12/2023', overdueDays: 177  },
  { id:6, task:'Kiểm tra báo cáo tháng',  assignee:'Phạm Quốc Bảo',  deadline:'15/10/2023', overdueDays: 254  },
  { id:7, task:'Cập nhật quy trình nội bộ',assignee:'Hoàng Minh Tuấn',deadline:'20/11/2023', overdueDays: 218  },
  { id:8, task:'Báo cáo cuối năm',        assignee:'Đoàn Văn Việt',  deadline:'31/12/2023', overdueDays: 177  },
]

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return reportRows.slice(start, start + pageSize.value).map((r, i) => ({
    id:          r.id,
    stt:         start + i + 1,
    task:        r.task,
    assignee:    r.assignee,
    deadline:    r.deadline,
    overdueDays: r.overdueDays + ' ngày',
    status:      { label: 'Quá hạn', color: 'danger' },
  }))
})

const chartTienDo = ref(null)
const chartPhanBo = ref(null)

function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() }
const FONT = 'InterVariable, "Inter var", sans-serif'

onMounted(() => {
  // Line chart — tiến độ công việc
  const c1 = echarts.init(chartTienDo.value)
  c1.setOption({ textStyle: { fontFamily: FONT } })
  c1.setOption({
    grid: { top: 20, right: 20, bottom: 40, left: 48 },
    tooltip: { trigger: 'axis' },
    legend: {
      bottom: 0,
      textStyle: { fontFamily: FONT, fontSize: 12, color: cssVar('--text-secondary') },
    },
    xAxis: {
      type: 'category',
      data: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      axisLine: { lineStyle: { color: cssVar('--stroke-neutral-light') } },
      axisTick: { show: false },
      axisLabel: { fontFamily: FONT, color: cssVar('--text-hint'), fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: cssVar('--stroke-neutral-light'), type: 'dashed' } },
      axisLabel: { fontFamily: FONT, color: cssVar('--text-hint'), fontSize: 11 },
      axisLine: { show: false }, axisTick: { show: false },
    },
    series: [
      {
        name: 'Đã hoàn thành', type: 'line', smooth: true,
        data: [0, 0, 0, 1, 0, 0, 0],
        lineStyle: { color: cssVar('--chart-c2') },
        itemStyle: { color: cssVar('--chart-c2'), borderColor: '#fff', borderWidth: 2 },
        symbol: 'circle', symbolSize: 6,
      },
      {
        name: 'Quá hạn', type: 'line', smooth: true,
        data: [8, 8, 8, 8, 8, 8, 8],
        lineStyle: { color: cssVar('--chart-c4') },
        itemStyle: { color: cssVar('--chart-c4'), borderColor: '#fff', borderWidth: 2 },
        symbol: 'circle', symbolSize: 6,
      },
    ],
  })

  // Donut — phân bổ theo loại
  const c2 = echarts.init(chartPhanBo.value)
  c2.setOption({ textStyle: { fontFamily: FONT } })
  c2.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: {
      bottom: 0,
      textStyle: { fontFamily: FONT, fontSize: 12, color: cssVar('--text-secondary') },
    },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['50%', '42%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: [
        { value: 9,  name: 'Công việc',  itemStyle: { color: cssVar('--chart-c1') } },
        { value: 2,  name: 'Quy trình',  itemStyle: { color: cssVar('--chart-c3') } },
        { value: 2,  name: 'Lịch họp',   itemStyle: { color: cssVar('--chart-c2') } },
      ],
    }],
  })

  const onResize = () => { c1.resize(); c2.resize() }
  window.addEventListener('resize', onResize)
})
</script>

<style scoped>
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  height: var(--layout-page-header-h); padding: 0 16px;
  background: var(--bg-white); border-bottom: 1px solid var(--stroke-divider);
  flex-shrink: 0;
}
.page-header__left  { display: flex; align-items: center; }
.page-header__title { margin: 0; }
.page-header__right { display: flex; gap: 8px; }

.period-sel {
  height: 32px; padding: 0 10px;
  border: 1px solid var(--stroke-neutral-light);
  border-radius: var(--radius-default);
  font-size: 13px; color: var(--text-secondary);
  background: var(--bg-white); cursor: pointer; outline: none;
}

.content-wrapper {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
  gap: 16px; padding: 16px; overflow-y: auto; background: var(--bg-page);
}

/* KPI row */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.kpi-card {
  background: var(--bg-white);
  border-radius: var(--radius-default);
  box-shadow: var(--shadow-card);
  padding: 16px;
}
.kpi-card__head {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 10px;
}
.kpi-title-wrap { display: flex; align-items: center; gap: 6px; flex: 1; }
.kpi-title { font-size: 13px; font-weight: var(--fw-semibold); color: var(--text-secondary); flex: 1; }
.kpi-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
}
.kpi-icon .ti { font-size: 20px; }
.kpi-icon--brand   { background: var(--bg-brand-light);   color: var(--text-brand);   }
.kpi-icon--success { background: var(--bg-success-light); color: var(--text-success); }
.kpi-icon--info    { background: var(--bg-info-light, #eff8ff); color: var(--text-info, #2563eb); }
.kpi-icon--danger  { background: var(--bg-danger-light);  color: var(--text-danger);  }
.kpi-value { font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1; margin-bottom: 4px; }
.kpi-sub   { font-size: 12px; color: var(--text-secondary); }
.card__btn-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border: none; background: transparent;
  border-radius: 6px; cursor: pointer; color: var(--text-secondary);
  padding: 0;
  opacity: 0; transition: opacity 0.15s;
}
.kpi-card:hover .card__btn-icon,
.card:hover .card__btn-icon { opacity: 1; }
.card__btn-icon:hover { background: var(--bg-neutral-hover); color: var(--text-primary); }
.card__btn-icon .ti { font-size: 15px; }

/* Charts row */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
}
.card {
  background: var(--bg-white);
  border-radius: var(--radius-default);
  box-shadow: var(--shadow-card);
  padding: 16px;
}
.card__head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; margin-bottom: 12px;
}
.card__title-wrap { display: flex; align-items: center; gap: 6px; flex: 1; }
.card__title { font-size: 14px; font-weight: var(--fw-semibold); color: var(--text-primary); }
.head-right { display: flex; align-items: center; gap: 6px; }
.chart-area { height: 200px; }

/* Table panel */
.table-panel {
  display: flex; flex-direction: column;
  background: var(--bg-white); border-radius: var(--radius-default);
  box-shadow: var(--shadow-card);
  min-height: 0;
}
.th-wrapper  { padding: 0; }
.table-scroll { flex: 1; overflow: auto; max-height: 320px; }
</style>
