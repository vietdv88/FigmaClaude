<template>
  <!-- ── Global Header ── -->
  <header class="global-header" :class="{ 'global-header--white': currentMode === 'light' }">
    <!-- Left -->
    <div class="header-left">
      <button class="btn-icon-white"><TIcon name="grid-dots" /></button>
      <div class="app-logo-box">
        <TIcon name="calculator" />
      </div>
      <span class="app-name-header">{{ appName }}</span>
      <div class="divider-v-header"></div>
      <slot name="header-meta">
        <button class="header-company">
          Công ty mẫu <TIcon name="chevron-down" />
        </button>
        <span class="header-year-badge">
          <span class="year-dot"></span>
          Dữ liệu năm 2025
        </span>
      </slot>
    </div>

    <!-- Center -->
    <div class="header-center">
      <slot name="header-search">
        <div class="search-popover-wrap" ref="searchWrapRef">
          <div class="search-box-header" @click="openSearch">
            <TIcon name="search" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Tìm kiếm..."
              @focus="openSearch"
              @keydown.escape="closeSearch"
            />
          </div>
        </div>
      </slot>
    </div>

    <!-- Right — thứ tự chuẩn: Settings → MISA AI → AMIS Chat → Bell → Help → More -->
    <div class="header-right">
      <slot name="header-actions" />
      <button ref="toolsBtnRef" class="btn-icon-white" title="Các tiện ích và thiết lập" @click="openToolsPopover">
        <TIcon name="settings" :stroke-width="2" />
      </button>
      <button class="btn-icon-white" title="MISA AI">
        <IconMisaAI />
      </button>
      <button class="btn-icon-white" title="AMIS Chat" style="position:relative">
        <img :src="amisChatSrc" width="24" height="24" alt="" aria-hidden="true" style="border-radius:6px;display:block" />
        <span class="header-badge">20</span>
      </button>
      <button class="btn-icon-white" title="Thông báo" style="position:relative">
        <TIcon name="bell" />
        <span class="header-badge">9</span>
      </button>
      <button class="btn-icon-white" title="Trợ giúp">
        <TIcon name="help-circle" />
      </button>
      <button class="btn-icon-white" title="Thêm tùy chọn">
        <TIcon name="dots-circle-horizontal" />
      </button>
      <div class="header-avatar">VT</div>
    </div>
  </header>

  <!-- ── Search Popover ── -->
  <Teleport to="body">
    <Transition name="search-pop">
      <div v-if="showSearchPopover" ref="popoverRef" class="search-popover" :style="popoverStyle">
        <div class="search-pop-section">
          <p class="search-pop-label">Top từ khóa tìm nhiều nhất</p>
          <div class="search-pop-chips">
            <span v-for="kw in topKeywords" :key="kw" class="search-chip" @mousedown.prevent="selectKeyword(kw)">{{ kw }}</span>
          </div>
        </div>
        <div class="search-pop-divider"></div>
        <div class="search-pop-section">
          <p class="search-pop-label">Gần đây</p>
          <div class="search-pop-recents">
            <button v-for="r in recentKeywords" :key="r" class="search-recent-item" @mousedown.prevent="selectKeyword(r)">
              <TIcon name="history" />
              <span>{{ r }}</span>
            </button>
          </div>
        </div>
        <div class="search-pop-divider"></div>
        <div class="search-pop-hints">
          <div class="search-hint-card">
            <p class="search-hint-title">Gợi ý cách nhập từ khóa tìm kiếm cơ bản</p>
            <p class="search-hint-item"><strong>Tìm kiếm chứng từ:</strong> Nhập số chứng từ, số hóa đơn, ngày chứng từ, tên đối tượng (VD: PC00001)</p>
            <p class="search-hint-item"><strong>Tìm kiếm danh mục:</strong> Nhập mã hoặc tên danh mục (VD: KH00002)</p>
            <p class="search-hint-item"><strong>Tìm kiếm tính năng, báo cáo hoặc tùy chọn:</strong> Nhập tên chức năng, tên báo cáo hoặc tên tùy chọn (VD: Thêm mới khách hàng)</p>
          </div>
          <div class="search-hint-card">
            <p class="search-hint-title">Gợi ý cách nhập từ khóa tìm kiếm nhiều điều kiện</p>
            <p class="search-hint-item">Ví dụ 1: Tìm phiếu chi tiền cho Nguyễn Minh Anh trong tháng này.</p>
            <p class="search-hint-item">Ví dụ 2: Tìm chứng từ bán hàng cho Công ty cổ phần ABC trong tháng này.</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ── Tools & Settings Popover ── -->
  <Teleport to="body">
    <Transition name="search-pop">
      <div v-if="showToolsPopover" ref="toolsPopoverRef" class="tools-popover" :style="toolsPopoverStyle">
        <p class="tools-popover__title">Các tiện ích và thiết lập</p>
        <div class="tools-popover__body">
          <div class="tools-popover__columns">
            <div v-for="col in toolColumns" :key="col.title" class="tools-col">
              <p class="tools-col__title">{{ col.title }}</p>
              <button
                v-for="item in col.items" :key="item.label"
                class="tools-item"
                @click="onToolItemClick(item)"
              >
                {{ item.label }}
                <span v-if="item.tag" class="tools-item__tag">{{ item.tag }}</span>
              </button>
            </div>
          </div>
          <div class="tools-popover__side">
            <div v-for="sec in toolSideSections" :key="sec.title" class="tools-col">
              <p class="tools-col__title">{{ sec.title }}</p>
              <button
                v-for="item in sec.items" :key="item.label"
                class="tools-item"
                @click="onToolItemClick(item)"
              >
                {{ item.label }}
                <span v-if="item.tag" class="tools-item__tag">{{ item.tag }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ── Settings Dialog ── -->
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="showSettings" class="dialog-overlay" @mousedown.self="cancelSettings">
        <Transition name="dialog">
          <div class="settings-dialog" @click.stop>
            <!-- Header -->
            <div class="settings-dialog__header">
              <span class="h2">Thiết lập màu sắc và hiển thị</span>
              <button class="btn-icon" @click="cancelSettings"><TIcon name="x" /></button>
            </div>

            <!-- Tabs -->
            <div class="settings-dialog__tabs">
              <button
                v-for="tab in dialogTabs" :key="tab.id"
                class="dialog-tab"
                :class="{ 'dialog-tab--active': activeTab === tab.id }"
                @click="activeTab = tab.id"
              >{{ tab.label }}</button>
            </div>

            <!-- Body -->
            <div class="settings-dialog__body">

              <!-- ── Tab: Thiết lập màu sắc ── -->
              <template v-if="activeTab === 'color'">

                <!-- Tiêu đề + Nền + Sidebar — luôn nằm trên, thấy ngay khi mở -->
                <div class="settings-options-row">
                  <div class="srow">
                    <span class="srow__label">Tiêu đề</span>
                    <div class="srow__btns">
                      <button
                        v-for="m in modes" :key="m.value"
                        class="sopt"
                        :class="{ 'sopt--active': draftMode === m.value }"
                        type="button"
                        @click="draftMode = m.value"
                      >
                        <span class="sopt__dot" />
                        {{ m.label }}
                      </button>
                    </div>
                  </div>
                  <div class="srow">
                    <span class="srow__label">Nền</span>
                    <div class="srow__btns">
                      <button
                        v-for="t in bgTints" :key="t.value"
                        class="sopt"
                        :class="{ 'sopt--active': draftBgTint === t.value }"
                        type="button"
                        @click="draftBgTint = t.value"
                      >
                        <span class="sopt__dot" />
                        {{ t.label }}
                      </button>
                    </div>
                  </div>
                  <div class="srow">
                    <span class="srow__label">Sidebar</span>
                    <div class="srow__btns">
                      <button
                        v-for="s in sidebarModes" :key="s.value"
                        class="sopt"
                        :class="{ 'sopt--active': draftSidebarMode === s.value }"
                        type="button"
                        @click="draftSidebarMode = s.value"
                      >
                        <span class="sopt__dot" />
                        {{ s.label }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Color swatches -->
                <div class="settings-section-title">Lựa chọn màu sắc bạn muốn hiển thị trên phần mềm</div>
                <div class="color-swatches">
                  <div
                    v-for="c in COLORS" :key="c.id"
                    class="color-swatch"
                    :class="{ 'color-swatch--selected': draftColor === c.id }"
                    :style="draftColor === c.id ? { borderColor: c.main } : {}"
                    @click="draftColor = c.id"
                  >
                    <div class="color-swatch__preview">
                      <div
                        v-if="draftColor === c.id"
                        class="color-swatch__check"
                        :style="{ background: c.main }"
                      >
                        <TIcon name="check" />
                      </div>
                      <div class="color-swatch__block-left"  :style="{ background: c.light }"></div>
                      <div class="color-swatch__block-right" :style="{ background: c.gradient || c.main }"></div>
                    </div>
                    <span class="color-swatch__label">{{ c.label }}</span>
                  </div>
                </div>

                <!-- App mini preview -->
                <div class="preview-wrap" ref="previewWrapRef">
                  <div class="preview-inner" ref="previewInnerRef">
                    <!-- Mini App Shell -->
                    <div class="mini-app">
                      <!-- Mini Header -->
                      <div class="mini-header" :style="miniHeaderStyle">
                        <div class="mini-header-left">
                          <div style="width:14px;height:14px;border-radius:3px;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center">
                            <div style="width:8px;height:8px;border-radius:50%;background:var(--bg-brand)"></div>
                          </div>
                          <div style="width:60px;height:8px;background:rgba(255,255,255,0.8);border-radius:3px"></div>
                        </div>
                        <div style="display:flex;align-items:center;gap:6px">
                          <div style="width:120px;height:18px;background:rgba(255,255,255,0.2);border-radius:4px"></div>
                        </div>
                        <div style="display:flex;align-items:center;gap:5px">
                          <div v-for="i in 5" :key="i" style="width:18px;height:18px;border-radius:4px;background:rgba(255,255,255,0.2)"></div>
                          <div style="width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,0.9)"></div>
                        </div>
                      </div>
                      <!-- Mini Sub-nav -->
                      <div class="mini-subnav">
                        <div v-for="(t,i) in ['Trợ lý AI','Tổng quan','Tính năng mới']" :key="i"
                          class="mini-subnav-tab"
                          :class="{ active: i===1 }"
                          :style="i===1 ? { color: previewColor.main, borderBottomColor: previewColor.main } : {}"
                        >{{ t }}</div>
                        <div style="flex:1"></div>
                        <div style="display:flex;align-items:center;gap:4px;font-size:9px;color:var(--text-brand);padding-bottom:6px" :style="{color: previewColor.main}">
                          <TIcon name="player-play" style="font-size:9px" /> Bắt đầu sử dụng
                        </div>
                      </div>
                      <!-- Mini Body -->
                      <div class="mini-body" :style="{ background: draftBgTint === 'color' ? previewColor.light : '#f0f2f4' }">
                        <!-- Mini Sidebar -->
                        <div class="mini-sidebar" :style="miniSidebarStyle">
                          <div style="padding:6px 4px 4px">
                            <div style="width:100%;height:16px;border-radius:3px;border:1px solid"
                              :style="{ borderColor: draftSidebarMode === 'dark' ? 'rgba(255,255,255,0.2)' : previewColor.main }"></div>
                          </div>
                          <div style="display:flex;flex-direction:column;gap:2px;padding:4px">
                            <div v-for="(item,i) in sidebarItems" :key="i"
                              style="display:flex;align-items:center;gap:4px;height:20px;padding:0 4px;border-radius:3px"
                              :style="i===activeNav
                                ? (draftSidebarMode === 'dark' ? { background: previewColor.main } : { background: previewColor.light })
                                : {}"
                            >
                              <div style="width:10px;height:10px;border-radius:2px;flex-shrink:0"
                                :style="{ background: i===activeNav ? 'rgba(255,255,255,0.9)' : (draftSidebarMode === 'dark' ? 'rgba(255,255,255,0.28)' : '#d5d7da') }"></div>
                              <div style="height:6px;border-radius:2px;flex:1"
                                :style="{ background: i===activeNav ? 'rgba(255,255,255,0.7)' : (draftSidebarMode === 'dark' ? 'rgba(255,255,255,0.2)' : '#d5d7da') }"></div>
                            </div>
                          </div>
                        </div>
                        <!-- Mini Main -->
                        <div class="mini-main">
                          <!-- Page header -->
                          <div style="display:flex;align-items:center;justify-content:space-between;height:28px;padding:0 10px;background:white;border-bottom:1px solid #e9eaeb;flex-shrink:0;gap:6px">
                            <div style="display:flex;align-items:center;gap:6px">
                              <div style="height:16px;width:90px;background:#f0f2f4;border-radius:3px;border:1px solid #d5d7da"></div>
                              <div style="height:16px;width:70px;background:#f0f2f4;border-radius:3px;border:1px solid #d5d7da"></div>
                              <div style="height:16px;width:55px;background:#f0f2f4;border-radius:3px;border:1px solid #d5d7da"></div>
                            </div>
                            <div style="display:flex;gap:5px">
                              <div style="height:16px;padding:0 8px;border-radius:3px;display:flex;align-items:center;font-size:7px;font-weight:600;white-space:nowrap"
                                :style="{ background: previewColor.light, color: previewColor.main }">
                                Phân tích với AVA
                              </div>
                              <div style="height:16px;padding:0 8px;border-radius:3px;border:1px solid #d5d7da;display:flex;align-items:center;font-size:7px;color:#717680">Tùy chỉnh</div>
                            </div>
                          </div>
                          <!-- Content -->
                          <div style="flex:1;overflow:hidden;padding:8px;display:flex;flex-direction:column;gap:8px">
                            <!-- Row 1: 3 stat cards -->
                            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
                              <div v-for="i in 3" :key="i" style="background:white;border-radius:5px;padding:8px;box-shadow:0 0 2px rgba(0,0,0,0.1)">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
                                  <div style="height:7px;width:60px;background:#f0f2f4;border-radius:2px"></div>
                                  <div style="height:14px;width:40px;background:#f0f2f4;border-radius:2px"></div>
                                </div>
                                <div style="height:14px;width:70%;background:#e9eaeb;border-radius:3px;margin-bottom:4px"></div>
                                <div style="height:7px;width:50%;background:#f0f2f4;border-radius:2px"></div>
                              </div>
                            </div>
                            <!-- Row 2: chart + pie -->
                            <div style="display:grid;grid-template-columns:2fr 1fr;gap:8px;flex:1">
                              <div style="background:white;border-radius:5px;padding:8px;box-shadow:0 0 2px rgba(0,0,0,0.1)">
                                <div style="height:7px;width:80px;background:#f0f2f4;border-radius:2px;margin-bottom:8px"></div>
                                <div style="height:60%;position:relative;overflow:hidden">
                                  <svg width="100%" height="100%" viewBox="0 0 300 80" preserveAspectRatio="none">
                                    <polyline
                                      :points="`0,60 40,45 80,55 120,30 160,40 200,20 240,35 280,15 300,25`"
                                      fill="none" :stroke="previewColor.main" stroke-width="1.5"
                                    />
                                    <polyline
                                      :points="`0,70 40,65 80,68 120,50 160,60 200,45 240,55 280,40 300,50`"
                                      fill="none" stroke="#f79009" stroke-width="1.5" stroke-dasharray="3,2"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <div style="background:white;border-radius:5px;padding:8px;box-shadow:0 0 2px rgba(0,0,0,0.1);display:flex;flex-direction:column;align-items:center;justify-content:center">
                                <svg width="60" height="60" viewBox="0 0 60 60">
                                  <circle cx="30" cy="30" r="22" fill="none" stroke="#e9eaeb" stroke-width="8"/>
                                  <circle cx="30" cy="30" r="22" fill="none" :stroke="previewColor.main" stroke-width="8"
                                    stroke-dasharray="80 58" stroke-dashoffset="-14" stroke-linecap="round"/>
                                </svg>
                                <div style="display:flex;flex-direction:column;gap:4px;margin-top:6px;width:100%">
                                  <div v-for="i in 4" :key="i" style="display:flex;align-items:center;gap:4px">
                                    <div style="width:7px;height:7px;border-radius:2px;flex-shrink:0"
                                      :style="{ background: i===1 ? previewColor.main : '#d5d7da' }"></div>
                                    <div style="height:5px;flex:1;background:#f0f2f4;border-radius:2px"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- ── Tab: Thiết lập hiển thị ── -->
              <template v-else-if="activeTab === 'display'">
                <div class="settings-placeholder">
                  <TIcon name="layout-dashboard" style="font-size:48px;color:var(--text-hint)" />
                  <p class="text-secondary" style="margin-top:12px">Đang phát triển...</p>
                </div>
              </template>

              <!-- ── Tab placeholders ── -->
              <template v-else>
                <div class="settings-placeholder">
                  <TIcon name="tool" style="font-size:48px;color:var(--text-hint)" />
                  <p class="text-secondary" style="margin-top:12px">Đang phát triển...</p>
                </div>
              </template>
            </div>

            <!-- Footer -->
            <div class="settings-dialog__footer">
              <button class="btn btn--outline" @click="cancelSettings">Hủy</button>
              <button class="btn btn--primary" @click="saveSettings">Lưu</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { COLORS, currentTheme, applyTheme, currentMode, applyMode, currentBgTint, applyBgTint, currentSidebarMode, applySidebarMode } from '@mds/theme.js'
import IconMisaAI from '@mds/components/IconMisaAI.vue'
import TIcon      from '@mds/components/TIcon.vue'
import amisChatSrc from '@mds/assets/icon-amis-chat.png'

const props = defineProps({
  appName: { type: String, default: 'Kế toán' }
})

/* ── Search popover ── */
const searchWrapRef     = ref(null)
const searchInputRef    = ref(null)
const popoverRef        = ref(null)
const searchQuery       = ref('')
const showSearchPopover = ref(false)
const popoverStyle      = ref({})

const topKeywords = [
  'Phiếu chi tiền', 'Hóa đơn đầu vào', 'Phiếu thu tiền',
  'Báo cáo tổng hợp', 'Khách hàng', 'Nhà cung cấp',
]
const recentKeywords = [
  'PC00001', 'KH00002', 'Thêm mới khách hàng',
  'Báo cáo doanh thu', 'Phiếu nhập kho',
]

function openSearch() {
  console.log('[Search] openSearch called, searchWrapRef:', searchWrapRef.value)
  if (searchWrapRef.value) {
    const rect = searchWrapRef.value.getBoundingClientRect()
    console.log('[Search] rect:', rect)
    popoverStyle.value = {
      position: 'fixed',
      top:  (rect.bottom + 6) + 'px',
      left: (rect.left + rect.width / 2 - 260) + 'px',
      width: '520px',
      zIndex: 9500,
      background: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 12px 16px -4px rgba(16,24,40,0.08), 0 4px 6px -2px rgba(16,24,40,0.03)',
      border: '1px solid #e9eaeb',
      overflow: 'hidden',
      fontFamily: 'InterVariable, sans-serif',
    }
  }
  showSearchPopover.value = true
  console.log('[Search] showSearchPopover:', showSearchPopover.value)
}
function closeSearch() { showSearchPopover.value = false }
function selectKeyword(kw) { searchQuery.value = kw; closeSearch() }

function onDocMousedown(e) {
  const inWrap    = searchWrapRef.value?.contains(e.target)
  const inPopover = popoverRef.value?.contains(e.target)
  if (!inWrap && !inPopover) closeSearch()

  const inToolsBtn = toolsBtnRef.value?.contains(e.target)
  const inToolsPop = toolsPopoverRef.value?.contains(e.target)
  if (!inToolsBtn && !inToolsPop) closeToolsPopover()
}
function onDocKeydown(e) {
  if (e.key !== 'Escape') return
  closeSearch()
  closeToolsPopover()
}
onMounted(() => {
  document.addEventListener('mousedown', onDocMousedown)
  document.addEventListener('keydown', onDocKeydown)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onDocMousedown)
  document.removeEventListener('keydown', onDocKeydown)
})

/* ── Tools & Settings popover ── */
const toolsBtnRef      = ref(null)
const toolsPopoverRef  = ref(null)
const showToolsPopover = ref(false)
const toolsPopoverStyle = ref({})

const toolColumns = [
  {
    title: 'Nghiệp vụ',
    items: [
      { label: 'Quản lý danh mục' },
      { label: 'Nhập số dư ban đầu' },
    ],
  },
  {
    title: 'Tiện ích',
    items: [
      { label: 'Bảo trì dữ liệu' },
      { label: 'Ghi sổ/bỏ ghi theo lô' },
      { label: 'Đánh lại số chứng từ' },
      { label: 'Phục hồi chứng từ đã xóa nhầm' },
      { label: 'Lấy chứng từ từ dữ liệu khác' },
      { label: 'Kiểm tra đối chiếu chứng từ, sổ sách' },
      { label: 'Kiểm soát hồ sơ và hạch toán', tag: 'Mới' },
      { label: 'Gợi ý, nhắc nhở thông minh' },
      { label: 'Tra cứu thông tin doanh nghiệp' },
      { label: 'Nhật ký truy cập' },
      { label: 'Mã QR thanh toán' },
    ],
  },
  {
    title: 'Công cụ khác',
    items: [
      { label: 'Hướng dẫn chuyển đổi từ SME' },
      { label: 'Chuyển đổi từ AMIS Kế toán bản cũ' },
      { label: 'Danh sách lệnh tính giá, bảo trì,... đang thực hiện' },
      { label: 'Xóa bộ nhớ đệm nâng cao' },
      { label: 'Cập nhật số dư từ dữ liệu năm trước' },
      { label: 'Danh sách người dùng đang truy cập', tag: 'Mới' },
    ],
  },
]

const toolSideSections = [
  {
    title: 'Công ty của bạn',
    items: [
      { label: 'Thông tin công ty' },
      { label: 'Quản lý người dùng và phân quyền', tag: 'Mới' },
      { label: 'Quản lý dữ liệu' },
    ],
  },
  {
    title: 'Thiết lập',
    items: [
      { label: 'Tùy chọn' },
      { label: 'Ngày hạch toán' },
      { label: 'Kết nối ứng dụng' },
      { label: 'Ngôn ngữ' },
      { label: 'Thiết lập cấu hình gửi email' },
      { label: 'Thiết lập ký số' },
      { label: 'Thiết lập màu sắc và hiển thị', action: 'color-settings' },
    ],
  },
]

function openToolsPopover() {
  if (toolsBtnRef.value) {
    const rect = toolsBtnRef.value.getBoundingClientRect()
    toolsPopoverStyle.value = {
      position: 'fixed',
      top:   (rect.bottom + 8) + 'px',
      right: (window.innerWidth - rect.right) + 'px',
      zIndex: 9500,
    }
  }
  showToolsPopover.value = true
}
function closeToolsPopover() { showToolsPopover.value = false }
function onToolItemClick(item) {
  closeToolsPopover()
  if (item.action === 'color-settings') openSettings()
}

/* ── Dialog state ── */
const showSettings      = ref(false)
const activeTab         = ref('color')
const draftColor        = ref(currentTheme.value)
const draftMode         = ref(currentMode.value)
const draftBgTint       = ref(currentBgTint.value)
const draftSidebarMode  = ref(currentSidebarMode.value)

const dialogTabs = [
  { id: 'color',   label: 'Thiết lập màu sắc' },
  { id: 'display', label: 'Thiết lập hiển thị' },
  { id: 'tab3',    label: 'Tab' },
  { id: 'tab4',    label: 'Tab' },
]
const modes = [
  { value: 'color', label: 'Màu đang chọn' },
  { value: 'light', label: 'Màu trắng' },
]
const bgTints = [
  { value: 'color', label: 'Màu đang chọn' },
  { value: 'gray',  label: 'Màu xám' },
]
const sidebarModes = [
  { value: 'light', label: 'Nền trắng' },
  { value: 'dark',  label: 'Nền tối' },
]
const sidebarItems = Array(14).fill(0)
const activeNav    = ref(1)

const previewColor = computed(() => {
  return COLORS.find(c => c.id === draftColor.value) || COLORS[0]
})

const miniHeaderStyle = computed(() =>
  draftMode.value === 'light'
    ? { background: 'white', borderBottom: '1px solid #e9eaeb' }
    : { background: previewColor.value.gradient || previewColor.value.main }
)

const miniSidebarStyle = computed(() =>
  draftSidebarMode.value === 'dark'
    ? { background: '#1c1e26', borderRightColor: 'rgba(255,255,255,0.07)' }
    : {}
)

function openSettings() {
  activeTab.value        = 'color'
  draftColor.value       = currentTheme.value
  draftMode.value        = currentMode.value
  draftBgTint.value      = currentBgTint.value
  draftSidebarMode.value = currentSidebarMode.value
  showSettings.value = true
  nextTick(() => scalePreview())
}
function cancelSettings() {
  showSettings.value = false
}
function saveSettings() {
  applyTheme(draftColor.value)
  applyMode(draftMode.value)
  applyBgTint(draftBgTint.value)
  applySidebarMode(draftSidebarMode.value)
  showSettings.value = false
}

/* ── Preview scaling ── */
const previewWrapRef  = ref(null)
const previewInnerRef = ref(null)

function scalePreview() {
  if (!previewWrapRef.value || !previewInnerRef.value) return
  const w = previewWrapRef.value.offsetWidth
  const scale = w / 1440
  previewInnerRef.value.style.transform = `scale(${scale})`
  previewWrapRef.value.style.height = `${Math.round(650 * scale)}px`
}

watch(showSettings, (v) => { if (v) nextTick(scalePreview) })
</script>

<style scoped>
/* ── Settings Dialog ── */
.dialog-overlay {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(16,24,40,0.45);
  display: flex; align-items: flex-start; justify-content: center;
  padding: 20px 20px 20px;
  overflow-y: auto;
}
.settings-dialog {
  background: var(--bg-white);
  border-radius: var(--radius-dialog);
  width: 100%; max-width: 1440px;
  display: flex; flex-direction: column;
  max-height: calc(100vh - 40px);
  overflow: hidden;
  flex-shrink: 0;
}

/* Header */
.settings-dialog__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--dialog-py) var(--dialog-px);
  border-bottom: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0;
}

/* Tabs */
.settings-dialog__tabs {
  display: flex; align-items: flex-end;
  padding: 0 var(--dialog-px);
  border-bottom: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0;
}
.dialog-tab {
  height: 44px; padding: 0 16px;
  font-size: 13px; font-weight: var(--fw-medium);
  color: var(--text-secondary);
  border: none; background: transparent; cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}
.dialog-tab:hover { color: var(--text-primary); }
.dialog-tab--active { color: var(--text-brand); border-bottom-color: var(--stroke-brand); font-weight: var(--fw-semibold); }

/* Body */
.settings-dialog__body {
  flex: 1; overflow-y: auto;
  padding: 24px var(--dialog-px) 16px;
  display: flex; flex-direction: column; gap: 20px;
}

/* Section title */
.settings-section-title {
  font-size: var(--text-h2); font-weight: var(--fw-semibold);
  color: var(--text-primary);
  text-align: center; line-height: var(--text-h2-lh);
}

/* Settings option rows */
.settings-options-row {
  display: flex; align-items: center; gap: 24px;
  justify-content: center;
  flex-wrap: wrap; row-gap: 12px;
}
.srow { display: flex; align-items: center; gap: 10px; }
.srow__label {
  font-size: 11px; font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: 0.06em;
  min-width: 44px; text-align: right; white-space: nowrap;
}
.srow__btns { display: flex; gap: 6px; }
.sopt {
  display: flex; align-items: center; gap: 6px;
  height: 28px; padding: 0 12px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--stroke-neutral);
  background: var(--bg-white);
  font-size: 12px; font-weight: var(--fw-medium);
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.sopt:hover {
  border-color: var(--stroke-brand);
  color: var(--text-brand);
}
.sopt--active {
  border-color: var(--stroke-brand);
  background: var(--bg-brand-light);
  color: var(--text-brand);
  font-weight: var(--fw-semibold);
}
.sopt__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--stroke-neutral);
  flex-shrink: 0;
  transition: background 0.15s;
}
.sopt--active .sopt__dot { background: var(--text-brand); }

/* Color swatches */
.color-swatches {
  display: flex; gap: 10px;
  flex-wrap: nowrap; overflow-x: auto;
  padding-bottom: 4px;
  justify-content: center;
}
.color-swatch {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  cursor: pointer; flex-shrink: 0;
  padding: 8px; border-radius: var(--radius-default);
  border: 2px solid transparent;
  transition: border-color 0.15s, background 0.15s;
  background: var(--bg-white);
  min-width: 100px;
}
.color-swatch:hover { background: var(--bg-neutral-light); }
.color-swatch--selected { background: var(--bg-white); }

.color-swatch__preview {
  width: 80px; height: 56px;
  border-radius: 8px; overflow: hidden;
  display: flex; position: relative;
  border: 1px solid var(--stroke-neutral-light);
}
.color-swatch__block-left  { flex: 1; }
.color-swatch__block-right { flex: 1.6; }
.color-swatch__check {
  position: absolute; top: 4px; right: 4px;
  width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  z-index: 1;
}
.color-swatch__check .ti { font-size: 10px; color: white; font-weight: 700; }
.color-swatch__label {
  font-size: 12px; font-weight: var(--fw-medium);
  color: var(--text-primary); white-space: nowrap;
}

/* Preview wrap */
.preview-wrap {
  width: 100%; overflow: hidden;
  border-radius: var(--radius-default);
  border: 1px solid var(--stroke-neutral-light);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}
.preview-inner {
  width: 1440px;
  transform-origin: top left;
}

/* ── Mini App Styles ── */
.mini-app {
  display: flex; flex-direction: column;
  width: 1440px; height: 650px;
  background: var(--bg-page);
  font-family: var(--font-family);
  overflow: hidden;
}
.mini-header {
  display: flex; align-items: center; justify-content: space-between;
  height: 48px; padding: 0 16px; flex-shrink: 0; gap: 12px;
}
.mini-header-left { display: flex; align-items: center; gap: 8px; flex: 1; }
.mini-subnav {
  display: flex; align-items: flex-end;
  height: 44px; padding: 0 16px;
  background: white; border-bottom: 1px solid #e9eaeb;
  flex-shrink: 0; gap: 0;
}
.mini-subnav-tab {
  display: flex; align-items: center;
  height: 44px; padding: 0 14px;
  font-size: 10px; font-weight: 500; color: #717680;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}
.mini-subnav-tab.active { font-weight: 600; }
.mini-body {
  display: flex; flex: 1; overflow: hidden;
}
.mini-sidebar {
  width: 200px; flex-shrink: 0;
  background: white; border-right: 1px solid #e9eaeb;
  display: flex; flex-direction: column;
  transition: background 0.2s, border-color 0.2s;
}
.mini-main {
  display: flex; flex-direction: column; flex: 1; overflow: hidden;
}

/* Footer */
.settings-dialog__footer {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 12px; padding: 12px var(--dialog-px);
  background: var(--neutral-50);
  border-top: 1px solid var(--stroke-neutral-light);
  border-radius: 0 0 var(--radius-dialog) var(--radius-dialog);
  flex-shrink: 0;
}

/* Placeholder */
.settings-placeholder {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; min-height: 200px;
}

/* Transitions */
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s ease; }
.overlay-enter-from,  .overlay-leave-to      { opacity: 0; }
.dialog-enter-active, .dialog-leave-active   { transition: transform 0.22s ease, opacity 0.22s ease; }
.dialog-enter-from,  .dialog-leave-to        { transform: translateY(-16px); opacity: 0; }

/* ── Search Popover ── */
.search-popover-wrap {
  position: relative;
}
.search-popover {
  background: var(--bg-white);
  border-radius: var(--radius-dialog);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--stroke-neutral-light);
  overflow: hidden;
  font-family: var(--font-family);
}
.search-pop-section {
  padding: 12px 16px 10px;
}
.search-pop-label {
  font-size: 11px;
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 8px;
}
.search-pop-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.search-chip {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  background: var(--bg-brand-light);
  color: var(--text-brand);
  font-size: 12px;
  font-weight: var(--fw-medium);
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}
.search-chip:hover { background: var(--bg-brand-hover); }
.search-pop-recents {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.search-recent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 8px;
  border: none;
  background: transparent;
  border-radius: var(--radius-default);
  cursor: pointer;
  font-size: 13px;
  color: var(--text-primary);
  text-align: left;
  width: 100%;
  transition: background 0.15s;
  font-family: var(--font-family);
}
.search-recent-item:hover { background: var(--bg-neutral-hover); }
.search-recent-item .ti { color: var(--text-hint); font-size: 14px; flex-shrink: 0; }
.search-pop-divider {
  height: 1px;
  background: var(--stroke-divider);
}
.search-pop-hints {
  padding: 12px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.search-hint-card {
  border-radius: var(--radius-default);
  padding: 12px 14px 10px;
  background: var(--bg-white);
  border: 1px solid var(--stroke-neutral-light);
  position: relative;
  overflow: hidden;
}
.search-hint-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
}
.search-hint-title {
  font-size: 13px;
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 8px;
}
.search-hint-item {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 20px;
  margin: 0 0 4px;
}
.search-hint-item:last-child { margin-bottom: 0; }

/* Search pop transition */
.search-pop-enter-active, .search-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.search-pop-enter-from, .search-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Tools & Settings Popover ── */
.tools-popover {
  width: 880px;
  max-width: calc(100vw - 32px);
  background: var(--bg-white);
  border-radius: var(--radius-dialog);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--stroke-neutral-light);
  font-family: var(--font-family);
  padding: 20px 24px 24px;
}
.tools-popover__title {
  font-size: 16px;
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 20px;
}
.tools-popover__body {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.tools-popover__columns {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 24px;
}
.tools-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tools-popover__columns .tools-col:first-child { flex: 0 0 140px; }
.tools-popover__side {
  flex: 0 0 240px;
  background: var(--bg-neutral-light);
  border-radius: var(--radius-default);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.tools-col__title {
  font-size: 13px;
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0;
}
.tools-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 8px;
  margin: 0 -8px;
  border: none;
  background: transparent;
  border-radius: var(--radius-default);
  font-size: 13px;
  font-family: var(--font-family);
  color: var(--text-primary);
  text-align: left;
  line-height: 20px;
  cursor: pointer;
  transition: background 0.12s;
}
.tools-item:hover { background: var(--bg-neutral-hover); }
.tools-item__tag {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  background: var(--bg-warning);
  color: var(--text-white);
  font-size: 10px;
  font-weight: var(--fw-bold);
  border-radius: var(--radius-pill);
  flex-shrink: 0;
}
</style>
