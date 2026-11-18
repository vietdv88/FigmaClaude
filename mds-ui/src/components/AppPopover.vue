<template>
  <!-- AppPopover — lớp nổi NỘI DUNG TUỲ Ý (danh sách chọn riêng, panel lọc, chọn người, form nhỏ…). Danh sách lệnh đơn giản → dùng DropdownMenu.
       Định vị chung utils/floating.js (dưới nút · thiếu chỗ thì lật lên · không tràn mép) · teleport body · bấm ra ngoài / Esc để đóng
       (bấm vào danh sách Combobox, lịch… mở từ bên trong KHÔNG tính là ra ngoài) · nút mở tự mang aria-expanded (CSS active sẵn).
       variant: 'menu' = khung Menu List (đệm --menu-pad 8, bo --menu-radius, item dùng .dropdown-menu__item)
                'panel' = khung Figma Body Filter (đầu: tiêu đề H3 + ✕ · thân đệm 12 · chân nền Form Footer) -->
  <span v-if="$slots.trigger" ref="wrapRef" class="mds-popover-anchor">
    <slot name="trigger" :toggle="toggle" :open="show" :close="close" :is-open="isOpen" />
  </span>
  <Teleport to="body">
    <div v-if="isOpen" ref="popRef" class="mds-popover" :class="[`mds-popover--${variant}`]" :style="popStyle"
      :role="role" :aria-label="ariaLabel || title || undefined" @keydown="onKey">
      <template v-if="variant === 'panel'">
        <div class="mds-popover__body">
          <div v-if="title || $slots.header" class="mds-popover__head">
            <slot name="header" :close="close"><h3 class="mds-popover__title">{{ title }}</h3></slot>
            <button v-if="closable" type="button" class="icon-swap icon-swap--16 icon-swap--action" v-tip="'Đóng'" aria-label="Đóng" @click="close"><TIcon name="x" /></button>
          </div>
          <div class="mds-popover__content"><slot :close="close" /></div>
        </div>
        <div v-if="$slots.footer" class="mds-popover__foot"><slot name="footer" :close="close" /></div>
      </template>
      <slot v-else :close="close" />
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import TIcon from './TIcon.vue'
import { vTip } from '../utils/tooltip.js'
import { useEscClose } from '../utils/escStack.js'
import { placeFloating, floatingStyle, FLOATING_LAYERS } from '../utils/floating.js'

const props = defineProps({
  /** v-model:open (tuỳ chọn — không truyền thì tự quản lý qua slot trigger) */
  open:      { type: Boolean, default: undefined },
  /** 'bottom-start' (mép trái thẳng nút) | 'bottom-end' (mép phải thẳng nút — nút ở bên phải màn hình) */
  placement: { type: String, default: 'bottom-start' },
  /** 'menu' | 'panel' */
  variant:   { type: String, default: 'menu' },
  /** Độ rộng cố định (px). Bỏ trống: menu tự co theo nội dung (200–360), panel 320 */
  width:     { type: Number, default: null },
  /** Phần tử neo ngoài (khi không dùng slot trigger) — VD nút lọc TableHeader emit('open-filter', el) */
  anchor:    { default: null },
  title:     { type: String, default: '' },
  closable:  { type: Boolean, default: true },
  role:      { type: String, default: 'dialog' },
  /** Lớp chồng: mặc định 9500 (dưới danh sách Combobox 9600). Popover xổ từ HEADER (tài khoản, thông báo…) → var(--z-header-pop) = 9600 */
  zIndex:    { type: Number, default: 9500 },
  ariaLabel: { type: String, default: '' },
})
const emit = defineEmits(['update:open', 'open', 'close'])

const wrapRef = ref(null), popRef = ref(null)
const inner = ref(false)
const isOpen = computed(() => (props.open === undefined ? inner.value : props.open))
const pos = ref({ top: -9999, left: -9999, right: 0, minWidth: 0 })

function setOpen(v) { inner.value = v; emit('update:open', v); emit(v ? 'open' : 'close') }
function show() { if (!isOpen.value) setOpen(true) }
function close() { if (isOpen.value) setOpen(false) }
function toggle() { isOpen.value ? close() : show() }
defineExpose({ open: show, close, toggle, reposition: place })

const anchorEl = () => props.anchor?.getBoundingClientRect ? props.anchor : wrapRef.value?.firstElementChild || wrapRef.value
function place() {
  const a = anchorEl(); if (!a) return
  const m = popRef.value?.getBoundingClientRect()
  pos.value = placeFloating(a.getBoundingClientRect(), { width: m?.width, height: m?.height }, { placement: props.placement, matchWidth: props.variant === 'menu' })
}
const popStyle = computed(() => {
  const s = floatingStyle(pos.value, props.placement, props.zIndex)   // mặc định dưới danh sách Combobox (9600) → Combobox trong popover xổ ra đè lên được
  if (props.width) { s.width = props.width + 'px'; s.minWidth = '0px' }
  return s
})

function onDown(e) {
  const t = e.target
  if (popRef.value?.contains(t) || anchorEl()?.contains?.(t) || wrapRef.value?.contains(t)) return
  if (t.closest?.(FLOATING_LAYERS)) return
  close()
}
function onKey(e) { if (e.key === 'Escape' && !e.isComposing) { e.stopPropagation(); close() } }
useEscClose(close, () => isOpen.value)

function bind(on) {
  const f = on ? 'addEventListener' : 'removeEventListener'
  document[f]('pointerdown', onDown, true)
  window[f]('resize', place)
  window[f]('scroll', place, true)
}
watch(isOpen, async v => {
  const trig = wrapRef.value?.querySelector('button, [role="button"]')
  if (trig) trig.setAttribute('aria-expanded', v ? 'true' : 'false')
  bind(false)
  if (!v) return
  await nextTick(); place(); await nextTick(); place()   // lần 2: đã đo được kích thước thật → lật nếu thiếu chỗ
  bind(true)
}, { immediate: true })
onBeforeUnmount(() => bind(false))
</script>
