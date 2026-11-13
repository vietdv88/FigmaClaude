<template>
  <!-- Mode của collection 🔢 Font Size (Figma) — đổi trong CẢ khung ví dụ (.font-size-scope bao luôn hàng chọn mode), không đổi cả trang -->
  <div ref="scope" class="demo-stack font-size-scope" :data-font-size="mode">
    <div class="demo-row">
      <span class="demo-muted">Font Size (mode):</span>
      <div class="seg" role="group" aria-label="Mode cỡ chữ">
        <button v-for="m in MODES" :key="m.id" type="button" class="seg__item" :class="{ 'seg__item--active': mode === m.id }" :aria-pressed="mode === m.id" @click="mode = m.id">{{ m.label }}</button>
      </div>
    </div>
    <span class="demo-muted">{{ MODES.find(m => m.id === mode).hint }} Đặt cho cả ứng dụng: bánh răng trên header › <b>Thiết lập hiển thị › Cỡ chữ</b> (<code>applyFontSize()</code>).</span>

    <div class="demo-type">
      <div v-for="s in STYLES" :key="s.name" class="demo-type__row">
        <div class="demo-type__meta">
          <strong>{{ s.name }}</strong>
          <span class="demo-muted">{{ s.use }}</span>
          <code>{{ size[s.sizeVar] }}/{{ size[s.lhVar] }} · {{ s.weightLabel }} · {{ s.sizeVar }}</code>
        </div>
        <div class="demo-type__sample" :style="{ fontSize: `var(${s.sizeVar})`, lineHeight: `var(${s.lhVar})`, fontWeight: `var(${s.weightVar})` }">{{ s.sample }}</div>
      </div>
      <!-- Control thật của mds-ui: chữ đổi theo cùng mode -->
      <div class="demo-type__row">
        <div class="demo-type__meta"><strong>Control</strong><span class="demo-muted">Nút, ô nhập, nhãn dùng chung token chữ</span></div>
        <div class="demo-type__ctrls">
          <AppInput label="Tên khách hàng"><AppTextbox v-model="name" /></AppInput>
          <div class="demo-row"><button type="button" class="btn btn--outline btn--neutral">Hủy</button><button type="button" class="btn btn--primary">Lưu</button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick } from 'vue'
import AppInput from '@mds/components/AppInput.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import { currentFontSize } from '@mds/theme.js'

const MODES = [
  { id: 'small', label: 'Small', hint: 'Mặc định của web — Body 13/20.' },
  { id: 'medium', label: 'Medium', hint: 'Chữ thường 14/22 — dễ đọc hơn.' },
  { id: 'large', label: 'Large', hint: 'Chữ thường 14/22, tiêu đề H2 24 · H3 20 — màn hình to.' },
  { id: 'mobile', label: 'Mobile Responsive', hint: 'Tự áp trên màn ≤ 640px — Body 14/18.' },
]
const mode = ref(currentFontSize.value || 'small')
const name = ref('Công ty TNHH An Phát')
// Text Styles theo Figma (tên biến Font Size / Line Height)
const STYLES = [
  { name: 'H1 · Banner Title', use: 'Tiêu đề lớn trên banner', sizeVar: '--text-h1', lhVar: '--text-h1-lh', weightVar: '--fw-semibold', weightLabel: 'Semi Bold', sample: 'Chào mừng đến với AMIS Kế toán' },
  { name: 'H2 · App / Page / Form Title', use: 'Tiêu đề app, trang, popup', sizeVar: '--text-h2', lhVar: '--text-h2-lh', weightVar: '--fw-semibold', weightLabel: 'Semi Bold', sample: 'Danh sách hóa đơn bán hàng' },
  { name: 'H3 · Form, Card, Section, Group Title', use: 'Tiêu đề nhóm, card', sizeVar: '--text-h3', lhVar: '--text-h3-lh', weightVar: '--fw-semibold', weightLabel: 'Semi Bold', sample: 'Thông tin chung' },
  { name: 'Body Large', use: 'Văn bản dài cần dễ đọc', sizeVar: '--text-body-lg', lhVar: '--text-body-lg-lh', weightVar: '--fw-regular', weightLabel: 'Regular', sample: 'Nội dung bài viết, hướng dẫn sử dụng.' },
  { name: 'Body Medium', use: 'Nhấn nhẹ hơn chữ thường', sizeVar: '--text-body-md', lhVar: '--text-body-md-lh', weightVar: '--fw-regular', weightLabel: 'Regular', sample: 'Tổng tiền thanh toán: 12.500.000' },
  { name: 'Body Regular (mặc định)', use: 'Chữ chuẩn của mọi control, bảng, form', sizeVar: '--text-body', lhVar: '--text-body-lh', weightVar: '--fw-regular', weightLabel: 'Regular', sample: 'Công ty TNHH An Phát · Hạn thanh toán 15/11/2026' },
  { name: 'Body Small', use: 'Chú thích phụ (hạn chế dùng)', sizeVar: '--text-body-sm', lhVar: '--text-body-sm-lh', weightVar: '--fw-regular', weightLabel: 'Regular', sample: 'Cập nhật lần cuối 08:30' },
  { name: 'Caption', use: 'Nhãn rất nhỏ: badge, số đếm', sizeVar: '--text-caption', lhVar: '--text-caption-lh', weightVar: '--fw-semibold', weightLabel: 'Semi Bold', sample: '12 việc' },
  { name: 'Overline', use: 'Nhãn chữ in hoa phía trên tiêu đề', sizeVar: '--text-overline', lhVar: '--text-overline-lh', weightVar: '--fw-semibold', weightLabel: 'Semi Bold', sample: 'MỚI' },
]
/* Đọc giá trị token thực tế của mode đang chọn (đúng với CSS của mds-ui) */
const scope = ref(null), size = reactive({})
function readTokens() {
  const cs = scope.value && getComputedStyle(scope.value); if (!cs) return
  for (const s of STYLES) { size[s.sizeVar] = parseInt(cs.getPropertyValue(s.sizeVar)); size[s.lhVar] = parseInt(cs.getPropertyValue(s.lhVar)) }
}
watch(mode, () => nextTick(readTokens))
onMounted(readTokens)
</script>

<style scoped>
.demo-type { display: flex; flex-direction: column; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); background: var(--bg-white); }
.demo-type__row { display: grid; grid-template-columns: 260px 1fr; gap: 16px; align-items: center; padding: 12px 16px; }
.demo-type__row + .demo-type__row { border-top: 1px solid var(--stroke-neutral-light); }
.demo-type__meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.demo-type__meta code { font-size: var(--text-body); color: var(--text-secondary); overflow-wrap: anywhere; }
.demo-type__sample { min-width: 0; color: var(--text-primary); overflow-wrap: anywhere; }
.demo-type__ctrls { display: flex; flex-direction: column; gap: 12px; max-width: 360px; }
@media (max-width: 640px) { .demo-type__row { grid-template-columns: 1fr; gap: 4px; } }
</style>
