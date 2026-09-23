<template>
  <div class="app-shell">
    <ControlHeader app-name="Kế toán">
      <template #ai-icon><IconAvaKeToan /></template>
      <template #header-meta>
        <button class="header-company">
          Công ty cổ phần Đại Việt <TIcon name="chevron-down" />
        </button>
        <span class="header-year-badge">
          <span style="width:6px;height:6px;border-radius:50%;background:#12b76a;flex-shrink:0;box-shadow:0 0 0 1.5px white"></span>
          Dữ liệu năm 2023
        </span>
      </template>
      <template #header-search>
        <HeaderSearchBox />
      </template>
    </ControlHeader>

    <div class="body-row">
      <AppSidebar :items="sidebarItems" :active-id="activeSidebarId" :default-expanded="true" @nav="onNav" />

      <main class="main-content">
        <!-- Sub-nav -->
        <div class="sub-nav">
          <div class="sub-nav-left">
            <button v-for="tab in subTabs" :key="tab.id"
              class="sub-nav-tab" :class="{ active: activeSubTab === tab.id }"
              @click="activeSubTab = tab.id"
            >
              <TIcon v-if="tab.icon" :name="tab.icon" />
              {{ tab.label }}
              <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
            </button>
          </div>
          <div class="sub-nav-right">
            <button class="btn btn--ghost" style="gap:6px;color:var(--text-brand)">
              <TIcon name="player-play" style="font-size:11px" />
              Bắt đầu sử dụng
            </button>
          </div>
        </div>

        <!-- ── Tab: Tính năng mới (Editorial/Blog style) ── -->
        <div v-if="activeSubTab === 'tinhnangmoi'" class="tnm-wrapper">
          <div class="tnm-inner">

            <!-- Page header -->
            <div class="tnm-page-hd">
              <div class="tnm-page-hd__text">
                <div class="tnm-page-hd__title">Tính năng mới AMIS Kế toán</div>
                <div class="tnm-page-hd__sub">Khám phá các cập nhật và tính năng mới nhất giúp nâng cao hiệu quả kế toán</div>
              </div>
              <button class="btn btn--outline btn--neutral" style="flex-shrink:0;white-space:nowrap;gap:6px">
                Xem nhật ký phát hành
                <TIcon name="external-link" style="font-size: 13px" />
              </button>
            </div>

            <!-- Hero: text left, visual right -->
            <div class="tnm-hero">
              <div class="tnm-hero__body">
                <span class="tnm-tag" :style="{ background: colorBgMap['warning'], color: colorMap['warning'] }">
                  <TIcon name="flame-filled" style="font-size:11px;margin-right:3px" />Nổi bật
                </span>
                <div class="tnm-hero__title">{{ featuredFeatures[0].title }}</div>
                <div class="tnm-hero__meta">
                  <TIcon name="calendar" style="font-size: 13px" /><span>{{ featuredFeatures[0].date }}</span>
                  <span class="tnm-dot">·</span>
                  <TIcon name="eye" style="font-size: 13px" /><span>{{ featuredFeatures[0].views }} lượt xem</span>
                </div>
                <div class="tnm-hero__desc">{{ featuredFeatures[0].desc }}</div>
                <div class="tnm-hero__actions">
                  <button class="btn btn--primary" style="gap:6px">Dùng ngay <TIcon name="arrow-up-right" style="font-size:14px" /></button>
                  <button class="tnm-link" style="gap:6px">
                    Xem chi tiết
                    <TIcon name="arrow-right" style="font-size:12px" />
                  </button>
                </div>
              </div>
              <div class="tnm-hero__thumb" :style="{ background: colorBgMap[featuredFeatures[0].color] }">
                <div class="tnm-ss" style="--ac:#245fdf">
                  <div class="tnm-ss__tb"></div>
                  <div class="tnm-ss__tr tnm-ss__tr--hd"><span></span><span></span><span></span><span></span></div>
                  <div class="tnm-ss__tr"><span></span><span></span><span></span><span></span></div>
                  <div class="tnm-ss__tr"><span></span><span></span><span></span><span></span></div>
                  <div class="tnm-ss__tr"><span></span><span></span><span></span><span></span></div>
                  <div class="tnm-ss__tr"><span></span><span></span><span></span><span></span></div>
                  <div class="tnm-ss__tr"><span></span><span></span><span></span><span></span></div>
                  <div class="tnm-ss__tr"><span></span><span></span><span></span><span></span></div>
                </div>
                <button v-if="featuredFeatures[0].video" class="tnm-play-btn" @click.stop title="Xem video">
                  <TIcon name="player-play-filled" />
                </button>
              </div>
            </div>

            <!-- 3-col grid: Tính năng nổi bật -->
            <div class="tnm-sec-hd">
              <span class="tnm-sec-hd__label">Tính năng nổi bật</span>
            </div>
            <div class="tnm-grid3">
              <div v-for="f in gridFeatures" :key="f.id" class="tnm-grid3-card">
                <div class="tnm-grid3-card__thumb" :style="{ background: colorBgMap[f.color] }">
                  <div class="tnm-ss" :style="{ '--ac': colorMap[f.color] }">
                    <div class="tnm-ss__tb"></div>
                    <div class="tnm-ss__tr tnm-ss__tr--hd"><span></span><span></span><span></span></div>
                    <div class="tnm-ss__tr" v-for="n in 4" :key="n"><span></span><span></span><span></span></div>
                  </div>
                  <button v-if="f.video" class="tnm-play-btn" @click.stop title="Xem video">
                    <TIcon name="player-play-filled" />
                  </button>
                </div>
                <div class="tnm-grid3-card__body">
                  <div class="tnm-grid3-card__title">{{ f.title }}</div>
                  <div class="tnm-grid3-card__meta">
                    <TIcon name="calendar" style="font-size:12px" />{{ f.date }}
                    <span class="tnm-dot">·</span>
                    <TIcon name="eye" style="font-size:12px" />{{ f.views }} lượt xem
                  </div>
                  <div class="tnm-grid3-card__desc">{{ f.desc }}</div>
                  <button class="tnm-link" style="gap:5px">Xem chi tiết <TIcon name="arrow-right" style="font-size:12px" /></button>
                </div>
              </div>
            </div>

            <!-- Alternating rows: Các tính năng mới khác -->
            <div class="tnm-sec-hd">
              <span class="tnm-sec-hd__label">Các tính năng mới khác</span>
            </div>
            <div class="tnm-alt-list">
              <div v-for="(f, idx) in altFeatures" :key="f.id"
                   class="tnm-alt-row" :class="{ 'tnm-alt-row--rev': idx % 2 === 1 }">
                <div class="tnm-alt-row__thumb" :style="{ background: colorBgMap[f.color] }">
                  <div class="tnm-ss" :style="{ '--ac': colorMap[f.color] }">
                    <div class="tnm-ss__tb"></div>
                    <div class="tnm-ss__tr tnm-ss__tr--hd"><span></span><span></span><span></span><span></span></div>
                    <div class="tnm-ss__tr" v-for="n in 6" :key="n"><span></span><span></span><span></span><span></span></div>
                  </div>
                  <button v-if="f.video" class="tnm-play-btn" @click.stop title="Xem video">
                    <TIcon name="player-play-filled" />
                  </button>
                </div>
                <div class="tnm-alt-row__body">
                  <span class="tnm-tag" :style="{ background: colorBgMap[tagMap[f.tag]], color: colorMap[tagMap[f.tag]] }">{{ f.tag }}</span>
                  <div class="tnm-alt-row__title">{{ f.title }}</div>
                  <div class="tnm-alt-row__meta">
                    <TIcon name="calendar" style="font-size: 13px" />{{ f.date }}
                    <span class="tnm-dot">·</span>
                    <TIcon name="eye" style="font-size: 13px" />{{ f.views }} lượt xem
                  </div>
                  <div class="tnm-alt-row__desc">{{ f.desc }}</div>
                  <div class="tnm-alt-row__actions">
                    <button v-if="f.usable" class="btn btn--primary" style="gap:6px">Dùng ngay <TIcon name="arrow-up-right" style="font-size:14px" /></button>
                    <button class="tnm-link" style="gap:6px">
                      Xem chi tiết
                      <TIcon name="arrow-right" style="font-size:12px" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Xem thêm -->
            <div class="tnm-loadmore">
              <button class="btn btn--outline" style="gap:6px">Xem thêm <TIcon name="chevron-down" style="font-size:14px" /></button>
            </div>

          </div>
        </div>

        <div v-else class="content-wrapper">

          <!-- Chi nhánh filter -->
          <div class="branch-bar">
            <div class="branch-bar__left">
              <span class="branch-bar__label">Chi nhánh</span>
              <button class="branch-bar__btn">
                Công ty TNHH Dịch vụ ăn uống và nhà hàng
                <TIcon name="chevron-down" style="font-size:14px" />
              </button>
            </div>
            <button class="btn btn--ai-outline">
              <IconMisaAI />Phân tích với AVA
            </button>
          </div>

          <!-- ── Row 1: Tình hình tài chính + 2 nợ cards ── -->
          <div class="card-row" style="grid-template-columns:minmax(0,1.7fr) minmax(0,1fr) minmax(0,1fr)">

            <!-- Tình hình tài chính -->
            <div class="card">
              <div class="card__title">
                Tình hình tài chính
                <div class="head-right">
                  <button class="btn-icon btn-icon--sm"><TIcon name="refresh" /></button>
                  <select v-model="periodTch" class="period-sel">
                    <option>Tháng này</option><option>Quý này</option><option>Năm nay</option>
                  </select>
                </div>
              </div>
              <div class="unit-line">Đvt: Triệu đồng</div>
              <div class="tch-body">
                <div class="tch-col">
                  <div class="tch-row tch-row--head">
                    <span>TỔNG TIỀN</span>
                    <span class="tch-val--bold">196.024</span>
                  </div>
                  <div v-for="r in tchLeft" :key="r.l" class="tch-row tch-row--sub">
                    <span>{{ r.l }}</span>
                    <span class="tch-val--link">{{ r.v }}</span>
                  </div>
                </div>
                <div class="tch-sep"></div>
                <div class="tch-col">
                  <div v-for="r in tchRight" :key="r.l" class="tch-row">
                    <span>{{ r.l }}</span>
                    <span class="tch-val--link">{{ r.v }}</span>
                  </div>
                </div>
              </div>
              <div class="card-foot">Số liệu tính đến: 15h47 <button class="foot-link">Tải lại</button></div>
            </div>

            <!-- Nợ phải thu -->
            <div class="card">
              <div class="card__title">
                Nợ phải thu theo hạn nợ
                <button class="btn-icon btn-icon--sm"><TIcon name="refresh" /></button>
              </div>
              <div class="kpi-value" style="margin-top:8px">
                <span class="kpi-value__num">34.446</span>
                <span class="kpi-value__unit">Triệu đồng</span>
              </div>
              <div class="debt-lbl">TỔNG</div>
              <div class="debt-row">
                <div>
                  <div class="debt-sub-num debt-sub-num--over">232 <span class="debt-sub-unit">Triệu đồng</span></div>
                  <div class="debt-sub-lbl debt-sub-lbl--over">QUÁ HẠN</div>
                </div>
                <div style="text-align:right">
                  <div class="debt-sub-num">34.214 <span class="debt-sub-unit">Triệu đồng</span></div>
                  <div class="debt-sub-lbl">TRONG HẠN</div>
                </div>
              </div>
              <div class="debt-bar"><div class="debt-bar__fill" style="width:0.67%"></div></div>
              <div class="card-foot">Số liệu tính đến: 14h58 ngày 02/10/2026 <button class="foot-link">Tải lại</button></div>
            </div>

            <!-- Nợ phải trả -->
            <div class="card">
              <div class="card__title">
                Nợ phải trả theo hạn nợ
                <button class="btn-icon btn-icon--sm"><TIcon name="refresh" /></button>
              </div>
              <div class="kpi-value" style="margin-top:8px">
                <span class="kpi-value__num">0</span>
                <span class="kpi-value__unit">Triệu đồng</span>
              </div>
              <div class="debt-lbl">TỔNG</div>
              <div class="debt-row">
                <div>
                  <div class="debt-sub-num debt-sub-num--over">0 <span class="debt-sub-unit">Triệu đồng</span></div>
                  <div class="debt-sub-lbl debt-sub-lbl--over">QUÁ HẠN</div>
                </div>
                <div style="text-align:right">
                  <div class="debt-sub-num">0 <span class="debt-sub-unit">Triệu đồng</span></div>
                  <div class="debt-sub-lbl">TRONG HẠN</div>
                </div>
              </div>
              <div class="debt-bar debt-bar--empty"><div class="debt-bar__fill" style="width:100%"></div></div>
              <div class="card-foot">Số liệu tính đến: 14h58 ngày 02/10/2026 <button class="foot-link">Tải lại</button></div>
            </div>
          </div>

          <!-- ── Row 2: Bar chart + Hàng tồn kho ── -->
          <div class="card-row" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)">

            <!-- Doanh thu, chi phí, lợi nhuận -->
            <div class="card">
              <div class="card__title">
                Doanh thu, chi phí, lợi nhuận
                <div class="head-right">
                  <button class="btn-icon btn-icon--sm"><TIcon name="refresh" /></button>
                  <select v-model="periodBar" class="period-sel">
                    <option>Năm nay</option><option>Tháng này</option><option>Quý này</option>
                  </select>
                </div>
              </div>
              <div class="unit-line">Đvt: Triệu đồng</div>
              <div class="chart-metrics">
                <div class="chart-metric">
                  <div class="chart-metric__num">399.568</div>
                  <div class="chart-metric__lbl">DOANH THU</div>
                </div>
                <div class="chart-metric">
                  <div class="chart-metric__num">221.349</div>
                  <div class="chart-metric__lbl">CHI PHÍ</div>
                </div>
                <div class="chart-metric">
                  <div class="chart-metric__num">178.219</div>
                  <div class="chart-metric__lbl">LỢI NHUẬN</div>
                </div>
              </div>
              <div ref="barChartRef" class="chart-area"></div>
              <div class="chart-legend">
                <div v-for="l in barLegends" :key="l.label" class="chart-legend__item">
                  <span class="chart-legend__dot" :style="{background:l.color, borderRadius: l.line ? '0' : '50%'}"></span>
                  {{ l.label }}
                </div>
              </div>
              <div class="card-foot">Số liệu tính đến: 15h47 <button class="foot-link">Tải lại</button></div>
            </div>

            <!-- Hàng hóa tồn kho -->
            <div class="card">
              <div class="card__title">
                Hàng hóa tồn kho
                <div class="head-right">
                  <button class="btn-icon btn-icon--sm"><TIcon name="refresh" /></button>
                  <button class="btn-icon btn-icon--sm"><TIcon name="settings" /></button>
                </div>
              </div>
              <div class="unit-line">Đvt: Triệu đồng</div>
              <div class="kpi-value" style="margin-bottom:2px">
                <span class="kpi-value__num" style="font-size:22px">217.872</span>
                <span class="kpi-value__unit">Triệu đồng</span>
              </div>
              <div class="card__sub" style="margin-bottom:8px">TỔNG GIÁ TRỊ</div>
              <table class="dash-tbl">
                <thead><tr>
                  <th>Tên</th>
                  <th class="col-r">Số lượng</th>
                  <th class="col-r">Giá trị</th>
                </tr></thead>
                <tbody>
                  <tr v-for="r in hangTonKhoRows" :key="r.ten">
                    <td><span class="dot-c" :style="{background:r.color}"></span>{{ r.ten }}</td>
                    <td class="col-r">{{ r.sl }}</td>
                    <td class="col-r col-amt">{{ r.gt }}</td>
                  </tr>
                </tbody>
              </table>
              <div style="padding:6px 0"><button class="foot-link">Xem thêm</button></div>
              <div class="card-foot">Số liệu tính đến: 14h58 ngày 02/10/2026 <button class="foot-link">Tải lại</button></div>
            </div>
          </div>

          <!-- ── Row 3: Doanh thu (line) + Mặt hàng bán chạy ── -->
          <div class="card-row" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)">

            <!-- Doanh thu line chart -->
            <div class="card">
              <div class="card__title">
                Doanh thu
                <div class="head-right">
                  <button class="btn-icon btn-icon--sm"><TIcon name="refresh" /></button>
                  <select v-model="periodRev" class="period-sel">
                    <option>Năm nay</option><option>Tháng này</option><option>Quý này</option>
                  </select>
                </div>
              </div>
              <div class="unit-line">Đvt: Triệu đồng</div>
              <div class="kpi-value" style="margin-bottom:2px">
                <span class="kpi-value__num" style="font-size:22px">399.568</span>
                <span class="kpi-value__unit">Triệu đồng</span>
              </div>
              <div class="card__sub" style="margin-bottom:4px">TỔNG DOANH THU</div>
              <div ref="revChartRef" class="chart-area"></div>
              <div class="card-foot">Số liệu tính đến: 15h47 <button class="foot-link">Tải lại</button></div>
            </div>

            <!-- Mặt hàng bán chạy -->
            <div class="card">
              <div class="card__title">
                Mặt hàng bán chạy
                <div class="head-right">
                  <button class="btn-icon btn-icon--sm"><TIcon name="refresh" /></button>
                  <button class="btn-icon btn-icon--sm"><TIcon name="settings" /></button>
                  <select v-model="periodSell" class="period-sel">
                    <option>Năm nay</option><option>Tháng này</option><option>Quý này</option>
                  </select>
                </div>
              </div>
              <div class="unit-line">Đvt: Triệu đồng</div>
              <div class="kpi-value" style="margin-bottom:2px">
                <span class="kpi-value__num" style="font-size:22px">399.568</span>
                <span class="kpi-value__unit">Triệu đồng</span>
              </div>
              <div class="card__sub" style="margin-bottom:8px">TỔNG DOANH THU</div>
              <table class="dash-tbl">
                <thead><tr>
                  <th>Tên</th>
                  <th class="col-r">Số lượng</th>
                  <th class="col-r">Doanh thu</th>
                </tr></thead>
                <tbody>
                  <tr v-for="r in banChayRows" :key="r.ten">
                    <td><span class="dot-c" :style="{background:r.color}"></span>{{ r.ten }}</td>
                    <td class="col-r">{{ r.sl }}</td>
                    <td class="col-r col-amt">{{ r.dt }}</td>
                  </tr>
                </tbody>
              </table>
              <div style="padding:6px 0"><button class="foot-link">Xem thêm</button></div>
              <div class="card-foot">Số liệu tính đến: 15h47 <button class="foot-link">Tải lại</button></div>
            </div>
          </div>

          <!-- ── Row 4: Dòng tiền + Chi phí ── -->
          <div class="card-row" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)">

            <!-- Dòng tiền multi-line -->
            <div class="card">
              <div class="card__title">
                Dòng tiền
                <div class="head-right">
                  <button class="btn-icon btn-icon--sm"><TIcon name="refresh" /></button>
                  <select v-model="periodCash" class="period-sel">
                    <option>Năm nay</option><option>Tháng này</option><option>Quý này</option>
                  </select>
                </div>
              </div>
              <div class="unit-line">Đvt: Triệu đồng</div>
              <div class="chart-metrics">
                <div class="chart-metric">
                  <div class="chart-metric__num">473.169</div>
                  <div class="chart-metric__lbl">TỔNG THU</div>
                </div>
                <div class="chart-metric">
                  <div class="chart-metric__num">118.267</div>
                  <div class="chart-metric__lbl">TỔNG CHI</div>
                </div>
                <div class="chart-metric">
                  <div class="chart-metric__num">409.484</div>
                  <div class="chart-metric__lbl">TỒN</div>
                </div>
              </div>
              <div ref="cashChartRef" class="chart-area"></div>
              <div class="chart-legend">
                <div v-for="l in cashLegends" :key="l.label" class="chart-legend__item">
                  <span class="chart-legend__dot" :style="{background:l.color,borderRadius:'50%'}"></span>
                  {{ l.label }}
                </div>
              </div>
              <div class="card-foot">Số liệu tính đến: 16h15 <button class="foot-link">Tải lại</button></div>
            </div>

            <!-- Chi phí donut -->
            <div class="card">
              <div class="card__title">
                Chi phí
                <div class="head-right">
                  <button class="btn-icon btn-icon--sm"><TIcon name="refresh" /></button>
                  <button class="btn-icon btn-icon--sm"><TIcon name="settings" /></button>
                  <select v-model="periodCost" class="period-sel">
                    <option>Năm nay</option><option>Tháng này</option><option>Quý này</option>
                  </select>
                </div>
              </div>
              <div class="unit-line">Đvt: Triệu đồng</div>
              <div class="kpi-value" style="margin-bottom:2px">
                <span class="kpi-value__num" style="font-size:22px">1.173</span>
                <span class="kpi-value__unit">Triệu đồng</span>
              </div>
              <div class="card__sub" style="margin-bottom:4px">TỔNG</div>
              <div class="cost-area">
                <div ref="costChartRef" style="width:160px;height:160px;flex-shrink:0"></div>
                <div class="cost-legend">
                  <div v-for="item in costData" :key="item.name" class="cost-legend__item">
                    <span class="chart-legend__dot" :style="{background:item.color,borderRadius:'50%'}"></span>
                    <span>{{ item.name }}</span>
                  </div>
                </div>
              </div>
              <div class="card-foot">Số liệu tính đến: 15h47 <button class="foot-link">Tải lại</button></div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import ControlHeader    from '@mds/components/ControlHeader.vue'
import IconAvaKeToan    from '../components/IconAvaKeToan.vue'
import AppSidebar       from '@mds/components/AppSidebar.vue'
import TIcon            from '@mds/components/TIcon.vue'
import { currentTheme, COLORS } from '@mds/theme.js'
import IconMisaAI       from '@mds/components/IconMisaAI.vue'
import HeaderSearchBox  from '../components/HeaderSearchBox.vue'

const router = useRouter()

/* ── Navigation ── */
const activeSubTab    = ref('tongquan')
const activeSidebarId = ref('banlam')

const NAV_ROUTES = { tienmat: '/tien-mat', tiengui: '/tien-gui', banhang: '/ban-hang', 'mau-email': '/thiet-lap-mau-email' }
function onNav(id) {
  activeSidebarId.value = id
  if (NAV_ROUTES[id]) router.push(NAV_ROUTES[id])
}

/* ── Tính năng mới ── */
const featuredFeatures = [
  { id: 1, icon: 'sparkles',      color: 'brand',   date: '29/05/2026', views: '2.847', video: true,  title: 'Tự động hạch toán giao dịch ngân hàng với AVA Kế toán',       desc: 'AVA Kế toán tự động lập chứng từ hạch toán các giao dịch ngân hàng dựa trên lịch sử giao dịch tương đồng trước đó.' },
  { id: 2, icon: 'file-invoice',  color: 'brand',   date: '26/05/2026', views: '1.523',              title: 'Tự động hạch toán hóa đơn dịch vụ đầu vào với AVA Kế toán',    desc: 'Hỗ trợ tự động nhận diện nhà cung cấp và xác định loại dịch vụ trên hóa đơn khi đồng bộ hóa đơn đầu vào.' },
  { id: 3, icon: 'cpu',           color: 'accent',  date: '11/07/2025', views: '3.102', video: true,  title: 'Tích hợp chuyên gia kế toán AI trên AMIS Kế toán',             desc: 'Chuyên gia kế toán AI tích hợp trực tiếp trên phần mềm để hỗ trợ công tác kế toán tại đơn vị 24/7.' },
]
const otherFeatures = [
  { id: 4,  icon: 'file-check',       color: 'warning', date: '20/06/2025', views: '987',   title: 'Đáp ứng Nghị định 70/2025/NĐ-CP về hóa đơn điện tử',       desc: 'AMIS Kế toán đáp ứng các thay đổi quản lý và phát hành hóa đơn theo Nghị định mới về hóa đơn điện tử.' },
  { id: 5,  icon: 'scale',            color: 'warning', date: '12/12/2025', views: '1.234', usable: false, tag: 'Pháp lý',   title: 'Đáp ứng Thông tư 99/2025/TT-BTC',                          desc: 'Phần mềm đáp ứng Thông tư 99/2025 quy định về chế độ kế toán doanh nghiệp, hiệu lực từ 01/01/2026.' },
  { id: 6,  icon: 'chart-bar',        color: 'accent',  date: '21/08/2025', views: '2.156', usable: true, video: true, tag: 'Tiện ích',   title: 'Phân tích tài chính nâng cao với Trợ lý số MISA AVA',       desc: 'Trợ lý MISA AVA hỗ trợ phân tích tài chính chuyên sâu dựa trên số liệu cập nhật tức thời.' },
  { id: 7,  icon: 'file-analytics',   color: 'brand',   date: '12/03/2025', views: '876',   usable: true,              tag: 'Tiện ích',   title: 'Gợi ý bộ hồ sơ hợp lệ đi kèm chứng từ với AI-AVA',        desc: 'Tích hợp với Trợ lý MISA AVA để hướng dẫn kiểm tra, đối chiếu hồ sơ chứng từ theo nghiệp vụ.' },
  { id: 8,  icon: 'arrows-left-right',color: 'success', date: '12/03/2025', views: '743',   usable: false,             tag: 'Thu tiền',   title: 'Tự động đối chiếu công nợ nhà cung cấp với MISA AVA',       desc: 'AMIS Kế toán tích hợp AVA để tự động đọc và đối chiếu dữ liệu báo cáo công nợ nhà cung cấp.' },
  { id: 9,  icon: 'pencil',           color: 'success', date: '12/03/2025', views: '654',   title: 'Kết nối AMIS WeSign để tự động ký chứng từ',               desc: 'Kết nối với AMIS WeSign để thực hiện ký số trên các chứng từ kế toán ở bất kỳ đâu.' },
  { id: 10, icon: 'shopping-cart',    color: 'info',    date: '23/12/2024', views: '1.021', title: 'Kết nối với sàn thương mại điện tử TikTok',                desc: 'Kết nối TikTok để đồng bộ đơn hàng và tự động sinh chứng từ hạch toán.' },
  { id: 11, icon: 'link',             color: 'info',    date: '05/12/2024', views: '892',   title: 'Hiển thị mã QR thanh toán trên chứng từ gửi khách hàng',   desc: 'Hiển thị mã QR thanh toán trên chứng từ để khách hàng thực hiện thanh toán nhanh chóng.' },
  { id: 12, icon: 'building-bank',    color: 'success', date: '28/11/2024', views: '1.345', title: 'Tự động đối chiếu sao kê ngân hàng với MISA AVA',          desc: 'Hỗ trợ tự động đối chiếu sao kê ngân hàng khi kết nối với hệ thống ngân hàng điện tử.' },
]
const gridFeatures = computed(() => [...featuredFeatures.slice(1), otherFeatures[0]])
const altFeatures  = computed(() => otherFeatures.slice(1, 5))

/* ── Color maps for feature cards ── */
const colorMap     = { brand:'#245fdf', accent:'#7a5af8', warning:'#f79009', success:'#12b76a', info:'#0ba5ec', danger:'#f04438' }
const colorBgMap   = { brand:'#eff6ff', accent:'#f5f3ff', warning:'#fffbeb', success:'#f0fdf4', info:'#f0f9ff', danger:'#fef3f2' }
const tagMap = {
  'Pháp lý':  'warning',
  'Tiện ích': 'accent',
  'Thu tiền': 'success',
  'Chi tiền': 'danger',
  'Ngân hàng':'info',
}
const colorGradMap = {
  brand:   'linear-gradient(135deg,#1a4fc4 0%,#3b7de8 100%)',
  accent:  'linear-gradient(135deg,#5b3fc0 0%,#9c6bf5 100%)',
  warning: 'linear-gradient(135deg,#c97000 0%,#f6a623 100%)',
  success: 'linear-gradient(135deg,#05874a 0%,#2dd07c 100%)',
  info:    'linear-gradient(135deg,#0777a8 0%,#29b6f6 100%)',
}

/* ── Sub-nav tabs ── */
const subTabs = [
  { id: 'tongquan',    label: 'Tổng quan',    icon: 'home' },
  { id: 'tinhnangmoi', label: 'Tính năng mới', badge: 'mới' },
]

/* ── Sidebar ── */
const sidebarItems = [
  { id: 'banlam',     icon: 'ti-home',                 label: 'Tổng quan' },
  { id: 'tienmat',    icon: 'ti-cash',                 label: 'Tiền mặt' },
  { id: 'tiengui',    icon: 'ti-building-bank',        label: 'Tiền gửi' },
  { id: 'muahang',    icon: 'ti-package',              label: 'Mua hàng' },
  { id: 'banhang',    icon: 'ti-shopping-cart',        label: 'Bán hàng' },
  { id: 'ketnoihd',   icon: 'ti-file-check',           label: 'Kết nối HĐ điện tử' },
  { id: 'kho',        icon: 'ti-building-warehouse',   label: 'Kho' },
  { id: 'congcu',     icon: 'ti-tool',                 label: 'Công cụ dụng cụ' },
  { id: 'tienluong',  icon: 'ti-users',                label: 'Tiền lương' },
  { id: 'thue',       icon: 'ti-file-invoice',         label: 'Thuế' },
  { id: 'baocao',     icon: 'ti-chart-bar',            label: 'Báo cáo' },
  { id: 'ketoadv',    icon: 'ti-book',                 label: 'Kế toán dịch vụ' },
  { id: 'danhmuc',    icon: 'ti-list',                 label: 'Danh mục' },
  { id: 'sodubandau', icon: 'ti-coin',                 label: 'Số dư ban đầu' },
  { id: 'mau-email',  icon: 'ti-mail',                 label: 'Thiết lập mẫu email' },
]

/* ── Period state ── */
const periodTch  = ref('Tháng này')
const periodBar  = ref('Năm nay')
const periodRev  = ref('Năm nay')
const periodSell = ref('Năm nay')
const periodCash = ref('Năm nay')
const periodCost = ref('Năm nay')

/* ── Theme ── */
const brandColor = computed(() => {
  const c = COLORS.find(c => c.id === currentTheme.value)
  return c ? c.main : '#0e9a62'
})

/* ── Tình hình tài chính data ── */
const tchLeft = [
  { l: 'Tiền mặt',  v: '280' },
  { l: 'Tiền gửi',  v: '195.744' },
  { l: 'Phải thu',  v: '26.197' },
  { l: 'Phải trả',  v: '383.873' },
]
const tchRight = [
  { l: 'Doanh thu',     v: '30.064' },
  { l: 'Chi phí',       v: '16.869' },
  { l: 'Lợi nhuận',     v: '13.195' },
  { l: 'Hàng tồn kho',  v: '296.934' },
]

/* ── Hàng hóa tồn kho ── */
const hangTonKhoRows = [
  { ten: 'Trà xanh Nhật Bản',      sl: '302,080.00', gt: '2,577.21', color: '#f59e0b' },
  { ten: 'Rau rocket (arugula)',    sl: '284,415.30', gt: '1,844.62', color: '#3b82f6' },
  { ten: 'Rượu vang đỏ Bordeaux',  sl: '210,899.00', gt: '1,000.52', color: '#8b5cf6' },
  { ten: 'Salad Caesar',           sl: '172,458.00', gt: '3,778.34', color: '#6b7280' },
  { ten: 'Pizza Margherita',       sl: '161,876.00', gt: '2,335.96', color: '#ef4444' },
]

/* ── Mặt hàng bán chạy ── */
const banChayRows = [
  { ten: 'Rau rocket (arugula)',   sl: '193,000', dt: '2.702', color: '#3b82f6' },
  { ten: 'Trà xanh Nhật Bản',     sl: '183,000', dt: '2.745', color: '#8b5cf6' },
  { ten: 'Pizza Margherita',       sl: '137,000', dt: '2.740', color: '#f59e0b' },
  { ten: 'Salad Caesar',           sl: '122,000', dt: '3.660', color: '#6b7280' },
  { ten: 'Súp hành kiểu Pháp',    sl: '111.049', dt: '37.841', color: '#f97316' },
]

/* ── Chi phí donut ── */
const costData = [
  { name: 'Chi phí quảng cáo',           color: '#f43f5e', value: 50 },
  { name: 'Chi phí sửa chữa, bảo dưỡng', color: '#3b82f6', value: 20 },
  { name: 'Chi phí tiếp khách',           color: '#a78bfa', value: 15 },
  { name: 'Chi phí khác',                 color: '#1e293b', value: 15 },
]

/* ── Chart legends ── */
const barLegends = computed(() => [
  { label: 'DOANH THU', color: brandColor.value },
  { label: 'CHI PHÍ',   color: '#98a2b3' },
  { label: 'LỢI NHUẬN', color: '#f79009', line: true },
])
const cashLegends = [
  { label: 'THU', color: '#12b76a' },
  { label: 'CHI', color: '#f79009' },
  { label: 'TỒN', color: '#0ba5ec' },
]

/* ── Chart refs ── */
const barChartRef  = ref(null)
const revChartRef  = ref(null)
const cashChartRef = ref(null)
const costChartRef = ref(null)
let barChart, revChart, cashChart, costChart

const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']

function getLabelRotate(el) {
  return el && el.clientWidth < 640 ? 30 : 0
}

function updateXAxisRotate() {
  if (barChart  && barChartRef.value)  barChart.setOption({ xAxis: { axisLabel: { rotate: getLabelRotate(barChartRef.value) } } })
  if (revChart  && revChartRef.value)  revChart.setOption({ xAxis: { axisLabel: { rotate: getLabelRotate(revChartRef.value) } } })
  if (cashChart && cashChartRef.value) cashChart.setOption({ xAxis: { axisLabel: { rotate: getLabelRotate(cashChartRef.value) } } })
}

function initCharts() {
  if (!window.echarts) return
  const brand = brandColor.value

  const axisStyle = { axisLine: { lineStyle: { color: '#e9eaeb' } }, axisLabel: { color: '#717680', fontSize: 11 } }
  const splitLine = { splitLine: { lineStyle: { color: '#f0f2f4' } } }
  const grid24    = { top: 8, right: 8, bottom: 48, left: 52 }

  /* ── Bar chart: Doanh thu, Chi phí, Lợi nhuận ── */
  const dtData = [33644,8028,12628,14711,33195,3000,9942,36767,35294,18419,25048,27644]
  const cpData = [18000,5000,8500,9000,20000,1500,6500,22000,20000,11000,15000,15500]
  const lnData = dtData.map((v,i) => v - cpData[i])

  barChart?.dispose()
  barChart = echarts.init(barChartRef.value)
  barChart.setOption({
    grid: grid24,
    tooltip: { trigger: 'axis', textStyle: { fontSize: 12 } },
    xAxis: { type: 'category', data: MONTHS, ...axisStyle, axisLabel: { ...axisStyle.axisLabel, rotate: getLabelRotate(barChartRef.value) } },
    yAxis: { type: 'value', axisLabel: { formatter: v => (v/1000).toFixed(0)+'k', fontSize: 11, color: '#717680' }, ...splitLine },
    series: [
      { name: 'DOANH THU', type: 'bar', data: dtData, barMaxWidth: 12, itemStyle: { color: brand, borderRadius: [4,4,0,0] } },
      { name: 'CHI PHÍ',   type: 'bar', data: cpData, barMaxWidth: 12, itemStyle: { color: '#98a2b3', borderRadius: [4,4,0,0] } },
      { name: 'LỢI NHUẬN', type: 'line', data: lnData, smooth: true,
        symbol: 'circle', symbolSize: 4,
        lineStyle: { color: '#f79009', width: 2 },
        itemStyle: { color: '#f79009' } },
    ]
  })

  /* ── Revenue area chart ── */
  const revData = [28439,22516,31138,33147,30064,10050,26566,37402,33050,41156,60423,55617]

  revChart?.dispose()
  revChart = echarts.init(revChartRef.value)
  revChart.setOption({
    grid: grid24,
    tooltip: { trigger: 'axis', textStyle: { fontSize: 12 } },
    xAxis: { type: 'category', data: MONTHS, ...axisStyle, axisLabel: { ...axisStyle.axisLabel, rotate: getLabelRotate(revChartRef.value) } },
    yAxis: { type: 'value', axisLabel: { formatter: v => (v/1000).toFixed(0)+'k', fontSize: 11, color: '#717680' }, ...splitLine },
    series: [{
      type: 'line', data: revData, smooth: true,
      symbol: 'circle', symbolSize: 4,
      lineStyle: { color: brand, width: 2 },
      itemStyle: { color: brand },
      areaStyle: { color: { type:'linear',x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:brand+'44'},{offset:1,color:brand+'00'}] } }
    }]
  })

  /* ── Cashflow multi-line ── */
  const tonData = [92632,103133,134136,176798,196024,194727,227053,245787,272367,315644,375461,409484]
  const thuData = tonData.map(v => Math.round(v * 1.18))
  const chiData = [20000,28000,38000,50000,58000,55000,65000,75000,88000,102000,115000,118267]

  cashChart?.dispose()
  cashChart = echarts.init(cashChartRef.value)
  cashChart.setOption({
    grid: grid24,
    tooltip: { trigger: 'axis', textStyle: { fontSize: 12 } },
    xAxis: { type: 'category', data: MONTHS, ...axisStyle, axisLabel: { ...axisStyle.axisLabel, rotate: getLabelRotate(cashChartRef.value) } },
    yAxis: { type: 'value', axisLabel: { formatter: v => (v/1000).toFixed(0)+'k', fontSize: 11, color: '#717680' }, ...splitLine },
    series: [
      { name:'THU', type:'line', data:thuData, smooth:true, symbol:'circle', symbolSize:4, lineStyle:{color:'#12b76a',width:2}, itemStyle:{color:'#12b76a'} },
      { name:'CHI', type:'line', data:chiData, smooth:true, symbol:'circle', symbolSize:4, lineStyle:{color:'#f79009',width:2}, itemStyle:{color:'#f79009'} },
      { name:'TỒN', type:'line', data:tonData, smooth:true, symbol:'circle', symbolSize:4, lineStyle:{color:'#0ba5ec',width:2}, itemStyle:{color:'#0ba5ec'} },
    ]
  })

  /* ── Cost donut ── */
  costChart?.dispose()
  costChart = echarts.init(costChartRef.value)
  costChart.setOption({
    tooltip: { trigger: 'item', textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie', radius: ['50%','80%'], center: ['50%','50%'],
      padAngle: 2, borderRadius: 4,
      label: { show: false },
      data: costData.map(d => ({ name: d.name, value: d.value, itemStyle: { color: d.color } }))
    }]
  })
}

onMounted(() => {
  if (window.echarts) { initCharts(); updateXAxisRotate() }
  else {
    const t = setInterval(() => { if (window.echarts) { initCharts(); updateXAxisRotate(); clearInterval(t) } }, 100)
  }
  window.addEventListener('resize', () => {
    barChart?.resize(); revChart?.resize(); cashChart?.resize(); costChart?.resize()
    updateXAxisRotate()
  })
})

watch(currentTheme, () => initCharts())
</script>

<style scoped>
/* min-width đảm bảo dashboard không co < 600px khi panel mở rộng.
   Kết hợp với --ava-panel-width trên :root và body min-width trong style.css
   → viewport scroll ngang khi sidebar + panel + content > cửa sổ trình duyệt. */
/* Override width: 100vw của mds-ui */
.app-shell { width: 100%; }

/* ── Branch filter ── */
.branch-bar {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 13px; color: var(--text-secondary);
  margin-bottom: -4px;
}
.branch-bar__left { display: flex; align-items: center; gap: 8px; }
.branch-bar__label { flex-shrink: 0; }
.branch-bar__btn {
  display: flex; align-items: center; gap: 4px;
  background: none; border: none; cursor: pointer;
  font-size: 13px; color: var(--text-primary); padding: 0;
  white-space: nowrap; flex-shrink: 0;
}
.branch-bar__btn:hover { color: var(--text-brand); }

/* ── Tab badge ── */
.tab-badge {
  font-size: 10px; font-weight: 700; color: white;
  background: var(--text-warning, #f79009);
  padding: 1px 5px; border-radius: 10px; margin-left: 4px;
  vertical-align: middle;
}

/* ── Card head helpers ── */
.head-right { display: flex; align-items: center; gap: 6px; }
.unit-line  { font-size: 11px; color: var(--text-secondary); text-align: right; margin: -2px 0 8px; }

/* Icon buttons (reload, settings) ẩn mặc định, hiện khi hover vào card */
.card .head-right .btn-icon { opacity: 0; transition: opacity 0.15s; }
.card:hover .head-right .btn-icon { opacity: 1; }

/* ── Period select ── */
.period-sel {
  border: none; outline: none; font-size: 12px; color: var(--text-secondary);
  cursor: pointer; padding: 2px 4px; border-radius: 4px;
  background: transparent;
}
.period-sel:hover { background: var(--bg-neutral-hover); }

/* ── Card footer ── */
.card-foot {
  font-size: 11px; color: var(--text-secondary);
  margin-top: 10px; padding-top: 8px;
  border-top: 1px solid var(--stroke-neutral-light);
}
.foot-link {
  background: none; border: none; padding: 0; cursor: pointer;
  font-size: 11px; color: var(--text-brand);
}
.foot-link:hover { text-decoration: underline; }

/* ── Tình hình tài chính body ── */
.tch-body { display: flex; gap: 0; margin: 4px 0 10px; }
.tch-col  { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0; }
.tch-sep  { width: 1px; background: var(--stroke-neutral-light); margin: 0 16px; flex-shrink: 0; }
.tch-row  { display: flex; justify-content: space-between; align-items: center; padding: 5px 0;
            font-size: 13px; color: var(--text-secondary);
            border-bottom: 1px solid var(--stroke-neutral-light); }
.tch-row:last-child { border-bottom: none; }
.tch-row--head { font-size: 12px; font-weight: var(--fw-semibold); color: var(--text-secondary); text-transform: uppercase; }
.tch-row--sub  { padding-left: 8px; }
.tch-val--bold { font-weight: var(--fw-semibold); color: var(--text-primary); font-size: 13px; }
.tch-val--link { color: var(--text-brand); font-weight: var(--fw-semibold); font-size: 13px; }

/* ── Debt card ── */
.debt-lbl     { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; margin: 0 0 10px; }
.debt-row     { display: flex; justify-content: space-between; margin-bottom: 10px; }
.debt-sub-num { font-size: 14px; font-weight: var(--fw-semibold); color: var(--text-primary); }
.debt-sub-num--over { color: var(--text-warning, #f79009); }
.debt-sub-unit { font-size: 11px; font-weight: 400; color: var(--text-secondary); }
.debt-sub-lbl  { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; margin-top: 2px; }
.debt-sub-lbl--over { color: var(--text-warning, #f79009); }
.debt-bar      { height: 6px; border-radius: 3px; background: var(--stroke-neutral-light); overflow: hidden; }
.debt-bar__fill { height: 100%; background: var(--text-warning, #f79009); border-radius: 3px; }
.debt-bar--empty .debt-bar__fill { background: var(--text-warning, #f79009); opacity: 0.4; }

/* ── Chart metrics row (big 3 numbers above chart) ── */
.chart-metrics { display: flex; gap: 24px; margin: 4px 0 8px; }
.chart-metric__num { font-size: 18px; font-weight: var(--fw-bold); color: var(--text-primary); }
.chart-metric__lbl { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; margin-top: 1px; }

/* ── Chart area ── */
.chart-area { width: 100%; height: 200px; }

/* ── Chart legend ── */
.chart-legend { display: flex; gap: 16px; justify-content: center; padding: 6px 0 2px; }
.chart-legend__item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-secondary); text-transform: uppercase; }
.chart-legend__dot  { display: inline-block; width: 8px; height: 8px; flex-shrink: 0; }

/* ── Dashboard tables ── */
.dash-tbl { width: 100%; border-collapse: collapse; }
.dash-tbl th {
  height: var(--dt-row-height); padding: 0 8px;
  font-size: 12px; font-weight: var(--fw-semibold); color: var(--text-secondary);
  text-align: left; border-bottom: 1px solid var(--stroke-neutral-light);
}
.dash-tbl td {
  height: var(--dt-row-height); padding: 0 8px;
  font-size: 12px; color: var(--text-primary);
  border-bottom: 1px solid var(--stroke-neutral-light);
}
.dash-tbl tbody tr:last-child td { border-bottom: none; }
.dash-tbl tbody tr:hover td { background: var(--bg-neutral-hover); }
.col-r   { text-align: right; }
.col-amt { font-weight: var(--fw-semibold); }
.dot-c   { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; flex-shrink: 0; vertical-align: middle; }

/* ── Chi phí donut layout ── */
.cost-area { display: flex; align-items: center; gap: 12px; margin: 4px 0; }
.cost-legend { display: flex; flex-direction: column; gap: 8px; }
.cost-legend__item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); }

/* ══════════════════════════════════════════════
   Tính năng mới — Editorial / Blog style
══════════════════════════════════════════════ */
.tnm-wrapper {
  flex: 1; overflow-y: auto;
  padding: 24px 24px 48px;
  display: flex; justify-content: center;
}
.tnm-inner {
  width: 100%; max-width: 1280px;
  display: flex; flex-direction: column; gap: 16px;
}

/* Button lớn kiểu website — chỉ áp riêng cho trang Tính năng mới, không đụng .btn chung */
.tnm-wrapper .btn {
  height: 48px;
  padding: 0 24px;
  font-size: 15px;
}

/* ── Shared atoms ── */
.tnm-tag {
  display: inline-flex; align-items: center; align-self: flex-start;
  height: 24px;
  font-size: var(--text-sm); font-weight: var(--fw-medium);
  padding: 0 8px; border-radius: var(--radius-inner);
  border: 1px solid color-mix(in srgb, currentColor 28%, transparent);
  white-space: nowrap;
}
.tnm-dot { color: var(--text-secondary); }

/* ── Video play button overlay ── */
.tnm-play-btn {
  position: absolute; bottom: 18px; right: 18px; z-index: 3;
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--bg-success);
  color: var(--text-white);
  border: 5px solid #ffffff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(18,183,106,0.45);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: tnm-play-pulse 2.2s ease-out infinite;
}
.tnm-play-btn .ti { font-size: 16px; margin-left: 1px; }
.tnm-play-btn:hover {
  transform: scale(1.12);
  animation-play-state: paused;
  box-shadow: 0 6px 20px rgba(18,183,106,0.55);
}
@keyframes tnm-play-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(18,183,106,0.5), 0 4px 14px rgba(18,183,106,0.35); }
  65%  { box-shadow: 0 0 0 14px rgba(18,183,106,0), 0 4px 14px rgba(18,183,106,0.35); }
  100% { box-shadow: 0 0 0 0 rgba(18,183,106,0),   0 4px 14px rgba(18,183,106,0.35); }
}
.tnm-link {
  display: inline-flex; align-items: center;
  font-size: var(--text-sm); font-weight: var(--fw-semibold);
  color: var(--text-brand); background: none; border: none;
  cursor: pointer; padding: 0; font-family: var(--font-family);
  margin-top: 4px;
}
.tnm-link:hover { text-decoration: underline; }

/* ── Page header ── */
.tnm-page-hd {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  padding-bottom: 4px;
}
.tnm-page-hd__text { display: flex; flex-direction: column; gap: 4px; }
.tnm-page-hd__title {
  font-size: var(--text-h2); font-weight: var(--fw-bold);
  line-height: var(--text-h2-lh); color: var(--text-primary);
}
.tnm-page-hd__sub { font-size: 13px; color: var(--text-secondary); }

/* ── Section heading ── */
.tnm-sec-hd { display: flex; align-items: center; margin-top: 8px; }
.tnm-sec-hd__label {
  font-size: var(--text-h3); font-weight: var(--fw-semibold);
  line-height: var(--text-h3-lh); color: var(--text-primary);
}

/* ════ Hero card: text LEFT, visual RIGHT ════ */
.tnm-hero {
  display: flex; align-items: center;
  padding: 24px; gap: 24px;
  border-radius: var(--radius-dialog);
  background: var(--bg-white);
  box-shadow: var(--shadow-card);
  cursor: pointer; transition: box-shadow 0.2s, transform 0.2s;
}
.tnm-hero:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }

.tnm-hero__body {
  flex: 1;
  display: flex; flex-direction: column; gap: 12px; justify-content: center;
  min-width: 0;
}
.tnm-hero__title {
  font-size: 32px; font-weight: var(--fw-bold);
  line-height: 40px; color: var(--text-primary);
}
.tnm-hero__meta {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--text-sm); color: var(--text-secondary);
  margin-top: -8px;
}
.tnm-hero__desc {
  font-size: 16px; color: var(--text-primary);
  line-height: 24px;
}
.tnm-hero__actions { display: flex; gap: 12px; margin-top: 4px; align-items: center; }

/* Hero thumbnail (right side) — tỉ lệ chuẩn CMS 670:418 */
.tnm-hero__thumb {
  width: 670px; flex-shrink: 0;
  aspect-ratio: 670 / 418;
  position: relative; padding: 20px;
  border-radius: var(--radius-default); overflow: hidden;
}
.tnm-hero__ico {
  position: absolute; bottom: 20px; right: 24px;
  width: 64px; height: 64px; border-radius: 18px;
  background: rgba(255,255,255,0.20);
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; color: #fff;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

/* CSS fake-UI mock inside hero thumb */
.tnm-mock-ui {
  position: absolute; inset: 16px 16px 50px 16px;
  background: rgba(255,255,255,0.14);
  border-radius: 8px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 8px 24px rgba(0,0,0,0.10);
}
.tnm-mock-bar { height: 26px; background: rgba(255,255,255,0.22); flex-shrink: 0; }
.tnm-mock-content { flex: 1; display: flex; }
.tnm-mock-sidebar { width: 52px; background: rgba(255,255,255,0.10); flex-shrink: 0; }
.tnm-mock-main { flex: 1; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
.tnm-mock-row { height: 8px; background: rgba(255,255,255,0.30); border-radius: 4px; }
.tnm-mock-row--sm { width: 58%; opacity: 0.7; }

/* ════ 3-col grid: Tính năng nổi bật ════ */
.tnm-grid3 {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
}
.tnm-grid3-card {
  display: flex; flex-direction: column;
  padding: 16px; gap: 16px;
  border-radius: var(--radius-dialog);
  background: var(--bg-white);
  box-shadow: var(--shadow-card);
  cursor: pointer; transition: box-shadow 0.15s, transform 0.15s;
}
.tnm-grid3-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }

.tnm-grid3-card__thumb {
  aspect-ratio: 670 / 418; flex-shrink: 0;
  position: relative; padding: 16px;
  border-radius: var(--radius-default); overflow: hidden;
}
.tnm-thumb-ico {
  width: 56px; height: 56px; border-radius: 16px;
  background: rgba(255,255,255,0.22);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.tnm-grid3-card__body {
  flex: 1;
  display: flex; flex-direction: column; gap: 6px;
}
.tnm-grid3-card__title {
  font-size: var(--text-body-md); font-weight: var(--fw-semibold);
  color: var(--text-primary); line-height: 20px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.tnm-grid3-card__meta {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--text-sm); color: var(--text-secondary);
}
.tnm-grid3-card__desc {
  font-size: 13px; color: var(--text-primary);
  line-height: var(--text-body-lh); flex: 1;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* ════ Alternating rows: Các tính năng mới khác ════ */
.tnm-alt-list { display: flex; flex-direction: column; gap: 16px; }
.tnm-alt-row {
  display: flex; align-items: center; gap: 24px;
  padding: 24px;
  border-radius: var(--radius-dialog);
  background: var(--bg-white);
  box-shadow: var(--shadow-card);
  cursor: pointer; transition: box-shadow 0.15s, transform 0.15s;
}
.tnm-alt-row:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.tnm-alt-row--rev { flex-direction: row-reverse; }

.tnm-alt-row__thumb {
  width: 36%; flex-shrink: 0;
  aspect-ratio: 670 / 418;
  position: relative; padding: 20px;
  border-radius: var(--radius-default); overflow: hidden;
}
.tnm-alt-row__body {
  flex: 1;
  display: flex; flex-direction: column; gap: 10px; justify-content: center;
}
.tnm-alt-row__title {
  font-size: var(--text-h3); font-weight: var(--fw-semibold);
  color: var(--text-primary); line-height: var(--text-h3-lh);
}
.tnm-alt-row__meta {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--text-sm); color: var(--text-secondary);
}
.tnm-alt-row__actions { display: flex; align-items: center; gap: 16px; margin-top: 14px; }
.tnm-alt-row__actions .tnm-link,
.tnm-hero__actions .tnm-link { margin-top: 0; align-self: center; }
.tnm-grid3-card__body .tnm-link { margin-top: 18px; }
.tnm-alt-row__desc {
  font-size: var(--text-body-md); color: var(--text-primary);
  line-height: var(--text-body-md-lh);
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}

/* ── Software screenshot mockup ── */
.tnm-ss {
  width: 100%; height: 100%; overflow: hidden;
  background: white; display: flex; flex-direction: column;
  border-radius: var(--radius-inner);
  box-shadow: var(--shadow-md);
}
.tnm-ss__tb { display: none; }
.tnm-ss__tr {
  display: flex; align-items: center; gap: 10px;
  padding: 0 14px; height: 32px; flex-shrink: 0;
  border-bottom: 1px solid #f0f2f4;
}
.tnm-ss__tr--hd { background: #f5f5f5; }
.tnm-ss__tr span { height: 7px; border-radius: 3px; background: #e9eaeb; }
.tnm-ss__tr span:nth-child(1) { width: 14px; flex-shrink: 0; }
.tnm-ss__tr span:nth-child(2) { flex: 2.5; }
.tnm-ss__tr span:nth-child(3) { flex: 1.5; }
.tnm-ss__tr span:nth-child(4) { flex: 1; }
.tnm-ss__tr--hd span { background: #d5d7da; }
/* accent color on first data cell of non-header rows */
.tnm-ss__tr:not(.tnm-ss__tr--hd) span:nth-child(1) { background: var(--ac, var(--bg-brand)); opacity: 0.35; }

/* ── Arrow icon slides right on card hover ── */
.tnm-link .ti { transition: transform 0.2s ease; display: inline-flex; }
.tnm-hero:hover .tnm-link .ti,
.tnm-grid3-card:hover .tnm-link .ti,
.tnm-alt-row:hover .tnm-link .ti,
.tnm-link:hover .ti { transform: translateX(5px); }

/* ── Load more ── */
.tnm-loadmore { display: flex; justify-content: center; padding: 8px 0; }
</style>
