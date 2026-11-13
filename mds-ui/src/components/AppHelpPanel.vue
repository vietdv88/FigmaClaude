<template>
  <!-- Panel Trợ giúp — Figma MDS “Help Frame” (51535:79812) · rộng 500 (đặt ở khung chứa) · cao hết màn hình
       variant 'default' (51535:79558): header nền trắng — dùng cho app có header MÀU
       variant 'brand'   (51535:79813): header nền Brand, chữ + icon trắng — dùng cho app có header TRẮNG
       Header 48 (tiêu đề H3 · mở cửa sổ mới · đóng) → ô tìm kiếm trên nền Neutral/100 → nội dung bài viết (slot, tự cuộn) → chân “Kênh hỗ trợ”. -->
  <section class="help-panel" :class="`help-panel--${variant}`" :aria-label="title">
    <header class="help-panel__head">
      <h2 class="help-panel__title">{{ title }}</h2>
      <button v-if="showOpenNew" type="button" class="btn-icon help-panel__hbtn" aria-label="Mở trong cửa sổ mới" v-tip="'Mở trong cửa sổ mới'" @click="$emit('open-new')"><TIcon name="external-link" /></button>
      <button type="button" class="btn-icon help-panel__hbtn" aria-label="Đóng" v-tip="'Đóng'" @click="$emit('close')"><TIcon name="x" /></button>
    </header>

    <div class="help-panel__search">
      <AppSearchbox :model-value="modelValue" :placeholder="placeholder" @update:model-value="v => $emit('update:modelValue', v)" @search="v => $emit('search', v)" />
    </div>

    <div ref="bodyEl" class="help-panel__body"><slot /></div>

    <!-- Chân “Kênh hỗ trợ” — Figma _Help Footer (54669:60753): State=Default (1 hàng icon, ^ mở rộng) · State=Expand (tiêu đề H3 + danh sách Menu List Item icon + tên, ✕ thu gọn) -->
    <footer v-if="channels.length && !footExpanded" class="help-panel__foot">
      <span class="help-panel__foot-label">{{ channelsLabel }}</span>
      <div class="help-panel__channels">
        <button v-for="c in channels" :key="c.id" type="button" class="btn-icon help-panel__fbtn" :aria-label="c.label" v-tip="c.label" @click="$emit('channel', c)"><TIcon :name="c.icon" /></button>
      </div>
      <button ref="expandBtn" type="button" class="btn-icon help-panel__fbtn" aria-label="Mở rộng kênh hỗ trợ" :aria-expanded="false" v-tip="'Mở rộng'" @click="setExpanded(true, $event)"><TIcon name="chevron-up" /></button>
    </footer>
    <footer v-else-if="channels.length" class="help-panel__foot help-panel__foot--expand" @keydown.esc="setExpanded(false)">
      <div class="help-panel__foot-main">
        <h3 class="help-panel__foot-title">{{ channelsLabel }}</h3>
        <div class="help-panel__foot-list" role="list">
          <button v-for="c in channels" :key="c.id" type="button" role="listitem" class="dropdown-menu__item help-panel__foot-item" @click="$emit('channel', c)">
            <TIcon :name="c.icon" class="dropdown-menu__icon help-panel__foot-ic" /><span class="dropdown-menu__label">{{ c.label }}</span>
          </button>
        </div>
      </div>
      <!-- ✕ = icon Neutral không viền (Figma); không gắn aria-expanded="true" vì .btn-icon[aria-expanded="true"] là kiểu Brand Outline của nút đang mở menu -->
      <button ref="collapseBtn" type="button" class="btn-icon help-panel__fbtn help-panel__foot-close" aria-label="Thu gọn kênh hỗ trợ" v-tip="'Thu gọn'" @click="setExpanded(false, $event)"><TIcon name="x" /></button>
    </footer>
  </section>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import TIcon from './TIcon.vue'
import AppSearchbox from './AppSearchbox.vue'
import { vTip } from '../utils/tooltip.js'

defineProps({
  /** 'default' (header trắng — app header màu) | 'brand' (header Brand — app header trắng) */
  variant:       { type: String, default: 'default' },
  title:         { type: String, default: 'Trợ giúp' },
  modelValue:    { type: String, default: '' },   // từ khóa ô tìm kiếm (v-model)
  placeholder:   { type: String, default: 'Tìm kiếm câu hỏi, từ khóa hoặc chủ đề' },
  showOpenNew:   { type: Boolean, default: true },
  channelsLabel: { type: String, default: 'Kênh hỗ trợ' },
  /** Icon kênh hỗ trợ ở chân panel: [{ id, icon (tên TIcon), label (tooltip / aria) }] — [] = ẩn chân */
  channels: { type: Array, default: () => [
    { id: 'facebook', icon: 'brand-facebook', label: 'Cộng đồng MISA' },
    { id: 'video',    icon: 'video',          label: 'Lịch đào tạo/chia sẻ Online' },
    { id: 'youtube',  icon: 'brand-youtube',  label: 'Hướng dẫn qua video' },
    { id: 'academy',  icon: 'school',         label: 'Kho tri thức nghiệp vụ' },
  ] },
})
defineEmits(['update:modelValue', 'search', 'close', 'open-new', 'channel'])

const bodyEl = ref(null)
function toTop() { bodyEl.value?.scrollTo({ top: 0, behavior: 'smooth' }) }
/* ^ ở chân panel = MỞ RỘNG danh sách kênh hỗ trợ (tên đầy đủ) · ✕ / Esc = thu gọn; focus chuyển sang nút còn lại để dùng bàn phím liền mạch */
const footExpanded = ref(false), expandBtn = ref(null), collapseBtn = ref(null)
async function setExpanded(v, e) {
  const kb = !e || e.detail === 0   // mở / đóng bằng bàn phím (Enter / Space / Esc) → hiện viền focus; bấm chuột → không
  footExpanded.value = v
  await nextTick()
  if (kb) (v ? collapseBtn : expandBtn).value?.focus()   // chỉ chuyển focus khi dùng bàn phím — bấm chuột thì ✕ / ^ giữ dạng icon Neutral không viền như Figma
}
defineExpose({ toTop, body: bodyEl, setExpanded })
</script>
