<template>
  <div class="demo-stack">
    <div class="demo-row">
      <AppTextbox v-model="q" type="search" placeholder="Tìm icon (VD: user, file, chart)" class="demo-icons__search" />
      <span class="demo-muted">Cỡ:</span>
      <div class="seg" role="group" aria-label="Cỡ icon">
        <button v-for="s in SIZES" :key="s" type="button" class="seg__item" :class="{ 'seg__item--active': size === s }" :aria-pressed="size === s" @click="size = s">{{ s }}px</button>
      </div>
      <span class="demo-muted">{{ list.length + customList.length }} icon có sẵn trong mds-ui — bấm để chép code</span>
    </div>
    <!-- Đổi màu icon: đúng các màu Icon của Figma (Icon Swap) — cả lưới đổi theo, code chép kèm class màu -->
    <div class="demo-row">
      <span class="demo-muted">Màu:</span>
      <div class="seg demo-icons__colors" role="group" aria-label="Màu icon">
        <button v-for="c in COLORS" :key="c.id" type="button" class="seg__item" :class="{ 'seg__item--active': color === c.id }" :aria-pressed="color === c.id" @click="color = c.id">
          <span class="demo-icons__dot" :class="`demo-icons__dot--${c.id}`" :style="c.id === 'ai' ? null : { background: `var(${c.tok})` }" aria-hidden="true" />{{ c.label }}
        </button>
      </div>
      <code class="demo-icons__tok">{{ cur.tok }}</code>
    </div>
    <!-- Trạng thái + kiểu nét theo Figma Icon Swap (6019:66690): State Default / Hover / Disabled · Filled No / Yes (Filled không có Hover) -->
    <div class="demo-row">
      <span class="demo-muted">Trạng thái:</span>
      <div class="seg" role="group" aria-label="Trạng thái icon">
        <button v-for="st in STATES" :key="st.id" type="button" class="seg__item" :class="{ 'seg__item--active': state === st.id }" :aria-pressed="state === st.id"
          :disabled="filled && st.id === 'action'" @click="state = st.id">{{ st.label }}</button>
      </div>
      <span class="demo-muted">Kiểu:</span>
      <div class="seg" role="group" aria-label="Kiểu icon">
        <button v-for="f in FILLS" :key="f.id" type="button" class="seg__item" :class="{ 'seg__item--active': filled === f.id }" :aria-pressed="filled === f.id" @click="filled = f.id">{{ f.label }}</button>
      </div>
      <span class="demo-muted">{{ STATE_TIP[state] }}</span>
    </div>
    <!-- Icon custom của MDS (Figma › Icons › Custom): logo / icon nhiều màu giữ màu gốc, không đổi theo màu chọn -->
    <template v-if="!filled">
    <p class="demo-icons__group">Icon custom MDS <span class="demo-muted">— {{ customList.length }} icon vẽ riêng trong Figma · icon có nhãn “Giữ màu” là logo / nhiều màu, không đổi theo màu chọn</span></p>
    <div class="demo-icons" :class="gridCls" :style="{ '--demo-icon': size + 'px' }">
      <button v-for="c in customList" :key="c.name" type="button" class="demo-icons__item" :aria-label="`Chép tên icon ${c.name}`" @click="copy(c.name, c.color === 'fixed')">
        <span class="icon-swap" :class="[c.color === 'fixed' ? '' : cur.cls, stateCls]"><TIcon :name="c.name" /></span>
        <span class="demo-icons__name">{{ c.name }}</span>
        <span v-if="c.color !== 'mono'" class="demo-icons__keep">Giữ màu</span>
      </button>
      <span v-if="!customList.length" class="demo-muted">Không có icon custom nào khớp “{{ q }}”</span>
    </div>
    </template>
    <p class="demo-icons__group">Bộ icon Tabler <span class="demo-muted">— {{ list.length }} icon{{ filled ? ' dạng đặc (tên có đuôi -filled)' : '' }}</span></p>
    <div class="demo-icons" :class="gridCls" :style="{ '--demo-icon': size + 'px' }">
      <button v-for="n in list" :key="n" type="button" class="demo-icons__item" :aria-label="`Chép tên icon ${n}`" @click="copy(n)">
        <span class="icon-swap" :class="[cur.cls, stateCls]"><TIcon :name="n" /></span>
        <span class="demo-icons__name">{{ n }}</span>
      </button>
      <span v-if="!list.length" class="demo-muted">Không có icon nào khớp “{{ q }}” — tìm thêm tại tabler.io/icons rồi khai báo vào TIcon.vue{{ filled ? ' (bản -filled)' : '' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ensureAiGradient } from '@mds/utils/aiGradient.js'
import TIcon from '@mds/components/TIcon.vue'
import { CUSTOM_ICONS } from '@mds/icons/customIcons.js'
import AppTextbox from '@mds/components/AppTextbox.vue'
import { toast } from '@mds/utils/toast.js'
import { copyText } from '../copyText.js'
import { matchText } from '@mds/utils/search.js'
import tIconSource from '@mds/components/TIcon.vue?raw'

// Danh sách tên lấy thẳng từ bảng MAP trong TIcon.vue → luôn khớp bộ icon thật đang có
const NAMES = [...tIconSource.matchAll(/^\s+'([a-z0-9-]+)':\s+Icon/gm)].map(m => m[1])
const SIZES = [16, 20, 24, 32]
const q = ref(''), size = ref(20)
// Màu icon theo Figma (Icon Swap 6019:66690) — Neutral mặc định 1 mã --icon-neutral; White dùng trên nền tối / nền màu
const COLORS = [
  { id: 'neutral', cls: '', label: 'Neutral', tok: '--icon-neutral' },
  { id: 'brand', cls: 'icon-swap--brand', label: 'Brand', tok: '--icon-brand' },
  { id: 'accent', cls: 'icon-swap--accent', label: 'Accent', tok: '--icon-accent' },
  { id: 'link', cls: 'icon-swap--link', label: 'Link', tok: '--icon-link' },
  { id: 'info', cls: 'icon-swap--info', label: 'Info', tok: '--icon-info' },
  { id: 'warning', cls: 'icon-swap--warning', label: 'Warning', tok: '--icon-warning' },
  { id: 'danger', cls: 'icon-swap--danger', label: 'Danger', tok: '--icon-danger' },
  { id: 'success', cls: 'icon-swap--success', label: 'Success', tok: '--icon-success' },
  { id: 'white', cls: 'icon-swap--white', label: 'White', tok: '--icon-white' },
  { id: 'ai', cls: 'icon-swap--ai', label: 'AI', tok: 'AI gradient (#ai-icon-gradient)' },
]
const color = ref('neutral')
const cur = computed(() => COLORS.find(c => c.id === color.value))
onMounted(ensureAiGradient)
const STATES = [{ id: 'default', label: 'Mặc định' }, { id: 'action', label: 'Bấm được (Hover)' }, { id: 'disabled', label: 'Disabled' }]
const FILLS = [{ id: false, label: 'Nét' }, { id: true, label: 'Đặc (Filled)' }]
const STATE_TIP = {
  default: 'Icon minh họa, không bấm — không có Hover.',
  action: 'Rê chuột lên icon để xem màu Hover · mã chép là thẻ <button>.',
  disabled: 'Màu Disabled của từng màu.',
}
const state = ref('default'), filled = ref(false)
watch(filled, f => { if (f && state.value === 'action') state.value = 'default' })   // Figma: Filled không có trạng thái Hover
const stateCls = computed(() => (state.value === 'disabled' ? 'icon-swap--disabled' : ''))
const gridCls = computed(() => ({ 'demo-icons--dark': color.value === 'white', 'demo-icons--action': state.value === 'action' }))
const list = computed(() => NAMES.filter(n => n.endsWith('-filled') === filled.value && (!q.value.trim() || matchText(n, q.value))))
const customList = computed(() => Object.entries(CUSTOM_ICONS).map(([name, v]) => ({ name, ...v })).filter(c => !q.value.trim() || matchText([c.name, c.label], q.value)))
async function copy(n, keepColor = false) {
  // Cỡ có sẵn của Icon Swap (Figma): 12 · 16 · 24 · 28 · 32 … → kèm class cỡ; cỡ khác (20) để theo chữ chứa nó
  // Mã chép LUÔN theo cỡ + màu đang chọn (trước đây Neutral bỏ mất cỡ). 20px = cỡ mặc định của .icon-swap → không cần class cỡ.
  // Icon “Giữ màu” (logo) chỉ ăn cỡ, không thêm class màu. Icon đặt trong nút (.btn / .btn-icon) thì chỉ lấy phần <TIcon … /> (màu, cỡ theo nút).
  const sz = size.value !== 20 && [12, 16, 24, 28, 32, 36, 40, 44, 48].includes(size.value) ? ` icon-swap--${size.value}` : ''
  const cls = `icon-swap${sz}${cur.value.cls && !keepColor ? ' ' + cur.value.cls : ''}`
  // Trạng thái: Bấm được → <button> + icon-swap--action (có Hover / focus), bắt buộc aria-label + v-tip · Disabled → icon-swap--disabled
  const code = state.value === 'action'
    ? `<button type="button" class="${cls} icon-swap--action" aria-label="Mô tả hành động" v-tip="'Mô tả hành động'"><TIcon name="${n}" /></button>`
    : `<span class="${cls}${state.value === 'disabled' ? ' icon-swap--disabled' : ''}"><TIcon name="${n}" /></span>`
  if (await copyText(code)) toast.success(`Đã chép ${code}`); else toast.info(code)
}
</script>

<style scoped>
.demo-icons__search { width: 280px; max-width: 100%; }
.demo-icons { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 8px; max-height: 420px; overflow-y: auto; }
.demo-icons__item {
  display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 0; padding: 12px 8px;
  border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); background: var(--bg-white); color: var(--text-primary); font: inherit; cursor: pointer;
}
.demo-icons__item:hover { border-color: var(--stroke-brand); background: var(--bg-brand-light); }
.demo-icons__item .icon-swap { font-size: var(--demo-icon); }
/* Bấm được: rê lên ô → icon đổi sang màu Hover của màu đang chọn (giống .icon-swap--action:hover) */
.demo-icons--action .demo-icons__item:hover .icon-swap { color: var(--is-h); }
.demo-icons--action .demo-icons__item:hover .icon-swap--ai :deep(svg *) { stroke: url(#ai-icon-gradient-hover); }
.demo-icons--dark .demo-icons__item { border-color: transparent; background: var(--bg-brand); }   /* màu White: xem trên nền màu như header */
.demo-icons--dark .demo-icons__item:hover { border-color: var(--alpha-white-500); background: var(--bg-brand-hover); }
.demo-icons--dark .demo-icons__name { color: var(--alpha-white-800); }
.demo-icons__dot { display: inline-block; width: 10px; height: 10px; margin-right: 6px; border-radius: 50%; flex-shrink: 0; vertical-align: -1px; }
.demo-icons__dot--white { box-shadow: inset 0 0 0 1px var(--stroke-neutral); }
.demo-icons__dot--ai { background: linear-gradient(110deg, var(--ai-begin-600), var(--ai-end-600)); }
.demo-icons__colors { flex-wrap: wrap; }
.demo-icons__group { margin: 8px 0 0; font-weight: var(--fw-semibold); color: var(--text-primary); }
.demo-icons__group .demo-muted { font-weight: var(--fw-regular); }
.demo-icons__item { position: relative; }
.demo-icons__keep { position: absolute; top: 4px; right: 4px; padding: 0 6px; border-radius: var(--radius-pill); background: var(--bg-neutral-light); color: var(--text-secondary); font-size: var(--text-caption); line-height: var(--text-caption-lh); }
.demo-icons__tok { font-size: var(--text-body); color: var(--text-secondary); }
.demo-icons__name { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: var(--text-body); color: var(--text-secondary); }
</style>
