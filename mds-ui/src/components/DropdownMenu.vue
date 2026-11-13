<template>
  <div class="dropdown-wrap" ref="wrapRef">
    <slot name="trigger" :toggle="toggle" :close="close" :is-open="isOpen" />

    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="isOpen"
          class="dropdown-menu"
          :class="{ 'dropdown-menu--check': checkbox }"
          :style="menuStyle"
          ref="menuRef"
          @click.stop
        >
          <template v-for="(item, i) in items" :key="i">
            <div v-if="item.separator" class="dropdown-menu__separator" />
            <button
              v-else
              class="dropdown-menu__item"
              :class="{
                'dropdown-menu__item--danger':   item.danger,
                'dropdown-menu__item--active':   (item.id != null && item.id === activeId) || item.checked,
                'dropdown-menu__item--disabled': item.disabled,
                'dropdown-menu__item--ai':       item.ai,
              }"
              :disabled="item.disabled"
              @click="onSelect(item)"
            >
              <!-- Show Checkbox (Figma Menu List Item): ô tick bên trái, trạng thái theo item.checked -->
              <AppCheckbox v-if="checkbox" :model-value="!!item.checked" tabindex="-1" aria-hidden="true" />
              <!-- Ảnh thay icon (VD logo ứng dụng ở menu 9 chấm) -->
              <img v-if="item.img" :src="item.img" alt="" class="dropdown-menu__img" />
              <TIcon v-else-if="item.icon" :name="item.icon" class="dropdown-menu__icon" />
              <span class="dropdown-menu__label">{{ item.label }}</span>
              <span v-if="item.tag" class="dropdown-menu__tag">{{ item.tag }}</span>
              <!-- Chọn nhiều (item.checked) → nền brand nhạt + chữ đậm + ✓ cuối dòng (Figma: Multi Select) -->
              <TIcon v-if="item.checked && !checkbox" name="check" class="dropdown-menu__check" />
            </button>
          </template>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import TIcon from './TIcon.vue'
import AppCheckbox from './AppCheckbox.vue'
import { ensureAiGradient } from '../utils/aiGradient.js'

const props = defineProps({
  items:     { type: Array,             default: () => [] },
  placement: { type: String,            default: 'bottom-start' }, // 'bottom-start' | 'bottom-end'
  activeId:  { type: [String, Number],  default: null },
  minWidth:  { type: Number,            default: 0 },
  /** Menu List có checkbox (chọn nhiều): mỗi mục 1 ô tick bên trái theo item.checked — thay cho dấu ✓ cuối dòng */
  checkbox:  { type: Boolean,           default: false },
})
const emit = defineEmits(['select', 'update:open'])

const wrapRef = ref(null)
const menuRef = ref(null)
const isOpen  = ref(false)
const atPoint = ref(null)   // mở bằng chuột phải → toạ độ con trỏ (null = mở dưới nút trigger)
const pos     = ref({ top: 0, left: 0, right: 0, minWidth: 0 })

/* Canh vị trí: mặc định dưới nút · KHÔNG đủ chỗ phía dưới (VD dòng cuối bảng sát đáy màn hình) → LẬT lên trên nút ·
   cả 2 phía đều thiếu → ghim sát đáy màn hình (cách 8) · tràn ngang → kéo vào trong (cách mép 8) */
function computePos() {
  if (!wrapRef.value) return
  const r = wrapRef.value.getBoundingClientRect()
  const m = menuRef.value?.getBoundingClientRect()
  const h = m?.height ?? 0, w = Math.max(m?.width ?? 0, props.minWidth, r.width)
  const vh = window.innerHeight, vw = window.innerWidth, gap = 4, edge = 8
  let top = r.bottom + gap
  if (h && top + h > vh - edge) top = r.top - gap - h >= edge ? r.top - gap - h : Math.max(edge, vh - edge - h)
  let left = r.left, right = vw - r.right
  if (props.placement === 'bottom-end') right = Math.max(edge, Math.min(right, vw - w - edge))
  else left = Math.max(edge, Math.min(left, vw - w - edge))
  pos.value = { top, left, right, minWidth: Math.max(props.minWidth, r.width) }
}

const menuStyle = computed(() => {
  if (atPoint.value) return { position: 'fixed', top: atPoint.value.y + 'px', left: atPoint.value.x + 'px', minWidth: props.minWidth + 'px', zIndex: 9999 }
  const s = {
    position: 'fixed',
    top:      pos.value.top + 'px',
    minWidth: pos.value.minWidth + 'px',
    zIndex:   9999,
  }
  if (props.placement === 'bottom-end') s.right = pos.value.right + 'px'
  else                                  s.left  = pos.value.left  + 'px'
  return s
})

async function toggle() {
  atPoint.value = null
  isOpen.value = !isOpen.value
  if (isOpen.value) { await nextTick(); computePos(); await nextTick(); computePos() }   // lần 2: đã đo được chiều cao menu thật → lật nếu cần
}

/* Menu chuột phải: <div @contextmenu.prevent="menu.openAt($event)"> — mở ngay tại con trỏ, tự lật vào trong màn hình */
async function openAt(e) {
  atPoint.value = { x: e.clientX, y: e.clientY }
  isOpen.value = true
  await nextTick()
  const m = menuRef.value?.getBoundingClientRect()
  const w = m?.width ?? 200, h = m?.height ?? 0
  atPoint.value = {
    x: Math.max(8, Math.min(e.clientX, window.innerWidth  - w - 8)),
    y: e.clientY + h + 8 > window.innerHeight ? Math.max(8, e.clientY - h) : e.clientY,
  }
}
/* Nút mở menu (phần tử bấm được đầu tiên trong slot trigger) mang aria-expanded theo trạng thái mở —
   CSS: .btn-icon[aria-expanded="true"] = Brand Outline (quy tắc: nút icon đang mở popover hiện trạng thái active) */
watch(isOpen, open => { const t = wrapRef.value?.querySelector('button, [role="button"]'); if (t) t.setAttribute('aria-expanded', open ? 'true' : 'false') })
defineExpose({ open: toggle, openAt, close })

function close() { isOpen.value = false; atPoint.value = null }

function onSelect(item) {
  if (item.disabled) return
  emit('select', item)
  if (!props.checkbox) close()   // menu có checkbox: chọn nhiều → giữ mở, bấm ra ngoài / Esc để đóng
}

function onClickOutside(e) {
  if (menuRef.value?.contains(e.target)) return
  if (wrapRef.value?.contains(e.target)) return
  close()
}

function onKeyDown(e) {
  if (e.key === 'Escape') { e.stopPropagation(); close() }   // chỉ đóng menu, không đóng popup / drawer bên dưới
}

watch(isOpen, val => {
  emit('update:open', val)
  if (val) {
    document.addEventListener('pointerdown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
  } else {
    document.removeEventListener('pointerdown', onClickOutside)
    document.removeEventListener('keydown', onKeyDown)
  }
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onClickOutside)
  document.removeEventListener('keydown', onKeyDown)
})

// Mục AI (item.ai): icon tô gradient AI → cần định nghĩa gradient trong document
onMounted(() => { if (props.items?.some(it => it.ai)) ensureAiGradient() })
</script>
