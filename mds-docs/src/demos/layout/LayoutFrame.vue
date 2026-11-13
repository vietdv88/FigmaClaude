<template>
  <!-- Khung “màn hình thu nhỏ” cho demo bố cục: dựng ở kích thước thật 1280 × 720 (header 48 · sidebar 56 · nền BG Page)
       rồi thu nhỏ vừa bề ngang khung bài viết — vẫn bấm, gõ, kéo được. “Xem toàn màn hình” để xem ở tỉ lệ lớn (Esc để thu nhỏ). -->
  <div class="lf-wrap">
  <div class="lf-bar" data-dsi-ignore>
    <slot name="bar" />
    <button type="button" class="btn btn--sm btn--text-neutral" @click="full = true"><TIcon name="maximize" />Xem toàn màn hình</button>
  </div>
  <div ref="host" class="lf-host" :class="{ 'lf-host--full': full }" :style="full ? null : { height: H * scale + 'px' }">
    <div class="lf" :class="{ 'lf--panel': $slots.panel }" :style="{ width: W + 'px', height: H + 'px', transform: `scale(${scale})` }">
      <!-- Vùng app (header + sidebar + nội dung). Có panel phải (slot panel) → app co lại, tối thiểu 1024px, hẹp hơn thì cuộn ngang -->
      <div class="lf-app"><div class="lf-app__in">
      <!-- Header THẬT của mds-ui (ControlHeader) — giống app thật: 9 chấm · logo · tên app · tìm kiếm · AI · thông báo · trợ giúp · ⋯ · bánh răng · avatar -->
      <ControlHeader :app-name="app" no-meta hide-trial-banner home-href="#" settings-only avatar-name="Quân Trần" :help-menu="helpMenu" @help-select="it => emit('help-select', it)">
        <template v-if="$slots['header-actions']" #header-actions><slot name="header-actions" /></template>
        <!-- Logo thống nhất cho mọi màn hình mẫu: MISA Design System (header nền màu → bản trắng · nền trắng → bản màu) -->
        <template #logo-icon><img class="lf-logo-img" :src="currentMode === 'light' ? logoColor : logoWhite" width="32" height="32" alt="" /></template>
      </ControlHeader>
      <div class="lf-main">
        <nav class="lf-side" aria-label="Menu ứng dụng">
          <!-- navigable: mục bấm được → emit('nav', i) (VD ví dụ Loading: chuyển trang → chỉ vùng nội dung hiện khung xương) -->
          <template v-if="navigable"><button v-for="(ic, i) in MENU" :key="ic" type="button" class="lf-side__item lf-side__item--btn" :class="{ 'lf-side__item--on': i === active }" :aria-current="i === active ? 'page' : null" :aria-label="MENU_LABELS[i]" v-tip="MENU_LABELS[i]" @click="emit('nav', i)"><TIcon :name="ic" /></button></template>
          <template v-else><span v-for="(ic, i) in MENU" :key="ic" class="lf-side__item" :class="{ 'lf-side__item--on': i === active }"><TIcon :name="ic" /></span></template>
        </nav>
        <div class="lf-content"><slot /></div>
      </div>
      </div></div>
      <!-- Panel phải (chat agent / AMIS Chat / Trợ giúp): nằm cạnh app, cao hết màn hình — slot nhận scale để quy đổi khi kéo đổi rộng -->
      <slot name="panel" :scale="scale" />
    </div>
    <!-- Toàn màn hình: ô chọn dạng (slot controls) ở góc trên — đổi dạng ngay, không phải thu nhỏ -->
    <div v-if="full && $slots.controls" class="lf-controls" data-dsi-ignore><slot name="controls" /></div>
    <!-- Toàn màn hình che thanh của khung ví dụ → bật / tắt Đo (+ Giải thích) ngay tại đây; dùng chung trạng thái với nút Đo trên thanh -->
    <div v-if="full" class="lf-tools" data-dsi-ignore>
      <AppCheckbox v-if="inspect" v-model="explain" label="Giải thích" class="lf-tools__cb" />
      <button type="button" class="btn btn--outline btn--neutral lf-tools__btn" :class="{ 'btn--active': inspect }" :aria-pressed="inspect" @click="inspect = !inspect">
        <TIcon name="ruler-measure" />{{ inspect ? 'Tắt đo' : 'Đo' }}
      </button>
      <button type="button" class="btn-icon btn-icon--outline lf-tools__btn" aria-label="Thu nhỏ (Esc)" v-tip="'Thu nhỏ (Esc)'" @click="full = false">
        <TIcon name="minimize" />
      </button>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import ControlHeader from '@mds/components/ControlHeader.vue'
import { currentMode } from '@mds/theme.js'
import logoColor from '../../assets/logo-ds-color.svg'
import logoWhite from '../../assets/logo-ds-white.svg'
import { vTip } from '@mds/utils/tooltip.js'
import AppCheckbox from '@mds/components/AppCheckbox.vue'
import { demoInspect as inspect, demoExplain as explain } from '../../demoBg.js'

const props = defineProps({
  app:      { type: String, default: 'MISA Design System' },   // tên app thống nhất cho mọi màn hình mẫu (cùng logo MISA Design System)
  active:   { type: Number, default: 1 },
  width:    { type: Number, default: 1280 },   // kích thước màn hình mô phỏng (demo panel phải dùng 1440 × 800)
  height:   { type: Number, default: 720 },
  helpMenu: { type: Array, default: () => [] },   // menu ? Trợ giúp của ControlHeader (Header_Help)
  navigable: { type: Boolean, default: false },   // mục sidebar bấm được → emit('nav', index)
})
const emit = defineEmits(['help-select', 'nav'])
const W = props.width, H = props.height
const MENU = ['layout-dashboard', 'users', 'file-invoice', 'chart-bar', 'calendar', 'settings']
const MENU_LABELS = ['Tổng quan', 'Khách hàng', 'Hóa đơn', 'Báo cáo', 'Lịch', 'Thiết lập']
const host = ref(null), scale = ref(1), full = ref(false)
let ro
function fit() {
  const el = host.value; if (!el) return
  // Toàn màn hình: chừa dải 56px phía trên cho ô chọn dạng + lề 16px (khớp CSS .lf-host--full)
  const w = full.value ? el.clientWidth - 32 : el.clientWidth, h = full.value ? el.clientHeight - 72 : Infinity
  scale.value = Math.min(1, w / W, h / H)
}
function onKey(e) { if (e.key === 'Escape' && full.value) { e.stopPropagation(); full.value = false } }
watch(full, () => nextTick(fit))
onMounted(() => { ro = new ResizeObserver(fit); ro.observe(host.value); fit(); window.addEventListener('keydown', onKey, true) })
onBeforeUnmount(() => { ro?.disconnect(); window.removeEventListener('keydown', onKey, true) })
</script>

<style scoped>
.lf-wrap { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.lf-bar { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
.lf-host { position: relative; width: 100%; overflow: hidden; border-radius: var(--radius-card); box-shadow: var(--shadow-card); }
.lf-host--full { position: fixed; inset: 0; z-index: var(--z-dialog); width: auto; height: auto !important; display: flex; align-items: center; justify-content: center;
  padding: 56px 16px 16px; box-sizing: border-box; border-radius: 0; background: var(--neutral-200); box-shadow: none; }
.lf-host--full .lf { position: relative; transform-origin: center center; }
.lf { position: absolute; top: 0; left: 0; transform-origin: top left; display: flex; background: var(--bg-page); color: var(--text-primary); font-size: var(--text-body); }
.lf-host--full .lf { position: relative; flex-shrink: 0; }
.lf-logo-img { display: block; flex-shrink: 0; }
.lf-app { flex: 1; min-width: 0; height: 100%; }
.lf-app__in { height: 100%; display: flex; flex-direction: column; }
/* Có panel phải: app tối thiểu 1024px → hẹp hơn hiện thanh cuộn ngang (LUÔN hiện, không để overlay tự ẩn) dưới cùng vùng app */
.lf--panel .lf-app { overflow-x: auto; overflow-y: hidden; scrollbar-width: auto; scrollbar-color: var(--neutral-400) var(--neutral-100); }
.lf--panel .lf-app::-webkit-scrollbar { height: 12px; }
.lf--panel .lf-app::-webkit-scrollbar-track { background: var(--neutral-100); }
.lf--panel .lf-app::-webkit-scrollbar-thumb { background: var(--neutral-400); border-radius: var(--radius-pill); border: 3px solid var(--neutral-100); }
.lf--panel .lf-app__in { min-width: 1024px; }
.lf :deep(.global-header) { position: relative; top: auto; left: auto; right: auto; flex-shrink: 0; z-index: 1; }   /* header thật nằm trong khung thu nhỏ (không fixed theo cửa sổ) */
.lf-main { flex: 1; min-height: 0; display: flex; }
.lf-side { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 56px; flex-shrink: 0; padding: 12px 0; background: var(--bg-white); border-right: 1px solid var(--stroke-neutral-light); }
.lf-side__item { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: var(--radius-default); color: var(--icon-neutral); }
.lf-side__item .ti { font-size: 20px; }
.lf-side__item--on { background: var(--bg-brand-light); color: var(--icon-brand); }
.lf-side__item--btn { border: none; padding: 0; background: transparent; cursor: pointer; transition: background 0.15s; }
.lf-side__item--btn:hover:not(.lf-side__item--on) { background: var(--bg-brand-light); }
.lf-side__item--btn.lf-side__item--on:hover { background: var(--bg-brand-light-hover); }   /* đang chọn (Brand Light) → rê Light Hover */
.lf-side__item--btn:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: -2px; }
/* KHÔNG đặt position ở đây: lớp phủ popup (position: absolute) tính theo cả khung .lf → che cả header + sidebar như popup thật */
.lf-content { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.lf-controls { position: absolute; top: 10px; left: 16px; z-index: 2; display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: var(--radius-default); background: var(--bg-white); box-shadow: var(--shadow-card); }
.lf-tools { position: absolute; top: 12px; right: 16px; z-index: 2; display: flex; align-items: center; gap: var(--gap-control); }   /* chỉ hiện khi toàn màn hình, nằm ngoài khung màn hình thu nhỏ */
.lf-tools__btn { background: var(--bg-white); }
.lf-tools__cb { padding: 0 8px; height: var(--btn-height); border-radius: var(--radius-default); background: var(--bg-white); }
/* Trong khung luôn là màn 1280px: form 2 cột không tự về 1 cột theo bề ngang trình duyệt */
.lf :deep(.form-fields--2col) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
</style>
