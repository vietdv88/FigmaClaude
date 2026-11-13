<template>
  <!-- Host reserves space in flex layout; sidebar inside is always position:absolute -->
  <div class="sidebar-host" :class="{ 'sidebar-host--expanded': isExpanded || forceExpanded }">
  <aside
    class="sidebar"
    :class="{ expanded: isExpanded || forceExpanded, 'sidebar--fly': !!flyout, 'sidebar--accordion': accordion }"
    @mouseleave="flyout && scheduleClose()"
  >
    <!-- Inner scrollable content -->
    <div class="sidebar-inner">
      <!-- Quick add button -->
      <button v-if="!hideQuickAdd" class="btn-add-quick" @click="$emit('quick-add')">
        <TIcon name="plus" />
        <span class="btn-add-text">{{ quickAddLabel }}</span>
      </button>

      <!-- Nav items -->
      <nav class="sidebar-nav">
        <!-- item.children:
             · childrenMode 'flyout' (mặc định): rê chuột / bấm → xổ menu con sang phải (chuẩn menu xổ ra .dropdown-menu); không tooltip
             · childrenMode 'accordion': bấm → mở / đóng danh sách con ngay bên dưới (nhóm của mục đang xem tự mở) — sidebar thu gọn thì rê vào giãn ra như thường -->
        <!-- items có thể chứa: { group: 'Tên nhóm' } (tiêu đề nhóm — thu gọn thành vạch ngang) · { separator: true } -->
        <template v-for="(item, ii) in items" :key="item.id ?? 'g' + ii">
          <div v-if="item.group" class="sidebar-group" role="presentation"><span class="sidebar-group__label">{{ item.group }}</span></div>
          <div v-else-if="item.separator" class="sidebar-sep" role="separator" />
          <template v-else>
          <button
            class="sidebar-item"
            :class="{
              active: activeId === item.id || (isChildActive(item) && !(accordion && isOpen(item))),
              'sidebar-item--parent-active': accordion && isOpen(item) && isChildActive(item),
              'sidebar-item--open': flyout?.item.id === item.id,
            }"
            v-tip="item.children ? '' : item.label" :aria-label="item.label"
            :aria-haspopup="item.children && !accordion ? 'menu' : undefined"
            :aria-expanded="item.children ? (accordion ? isOpen(item) : flyout?.item.id === item.id) : undefined"
            @mouseenter="item.children && !accordion ? openFlyout(item, $event.currentTarget) : closeFlyout()"
            @mouseleave="item.children && !accordion && scheduleClose()"
            @click="item.children ? (accordion ? toggleOpen(item) : openFlyout(item, $event.currentTarget, true)) : $emit('nav', item.id)"
          >
            <TIcon :name="item.icon" />
            <span class="sidebar-item__label">{{ item.label }}</span>
            <!-- item.badge: nhãn nhỏ cạnh tên mục (VD "Beta") — ẩn cùng tên khi sidebar thu gọn -->
            <span v-if="item.badge" class="sidebar-item__badge">{{ item.badge }}</span>
            <!-- item.count: số đếm canh phải (việc chờ, tin mới…) — sidebar thu gọn: số nhỏ ở góc icon · > 99 → 99+ -->
            <span v-if="countText(countOf(item)) && !(item.count == null && accordion && isOpen(item) && (isExpanded || forceExpanded))" class="sidebar-item__count" :class="{ 'sidebar-item__count--sum': item.count == null }" :aria-label="`${countOf(item)} mục`">{{ countText(countOf(item)) }}</span>
            <TIcon v-if="item.children" :name="accordion ? 'chevron-down' : 'chevron-right'" class="sidebar-item__more" :class="{ 'sidebar-item__more--open': accordion && isOpen(item) }" />
          </button>
          <!-- Cấp 2 (và cấp 3 lồng bên trong) — mục con có thể có icon hoặc chỉ chữ; { group } = tiêu đề nhóm nhỏ trong danh sách con -->
          <div v-if="accordion && item.children && isOpen(item)" class="sidebar-sub" role="group" :aria-label="item.label">
            <template v-for="(c, i) in item.children" :key="c.id ?? 'sep' + i">
              <div v-if="c.separator" class="sidebar-sub__sep" />
              <div v-else-if="c.group" class="sidebar-sub__group">{{ c.group }}</div>
              <template v-else-if="c.children">
                <button type="button" class="sidebar-subitem sidebar-subitem--parent" :class="{ 'sidebar-subitem--parent-active': isChildActive(c) }" :aria-expanded="isOpen(c)" @click="toggleOpen(c)">
                  <TIcon v-if="c.icon" :name="c.icon" class="sidebar-subitem__icon" /><span class="sidebar-subitem__label">{{ c.label }}</span>
                  <span v-if="!isOpen(c) && countText(countOf(c))" class="sidebar-item__count">{{ countText(countOf(c)) }}</span>
                  <TIcon name="chevron-down" class="sidebar-subitem__chev" :class="{ 'sidebar-item__more--open': isOpen(c) }" />
                </button>
                <div v-if="isOpen(c)" class="sidebar-sub sidebar-sub--l3" :class="{ 'sidebar-sub--l3-ic': c.icon }" role="group" :aria-label="c.label">
                  <template v-for="(g, k) in c.children" :key="g.id ?? 'sep' + k">
                    <div v-if="g.separator" class="sidebar-sub__sep" />
                    <div v-else-if="g.group" class="sidebar-sub__group">{{ g.group }}</div>
                    <button v-else type="button" class="sidebar-subitem" :class="{ active: activeId === g.id }" :aria-current="activeId === g.id ? 'page' : undefined" @click="$emit('nav', g.id)">
                      <TIcon v-if="g.icon" :name="g.icon" class="sidebar-subitem__icon" /><span class="sidebar-subitem__label">{{ g.label }}</span><span v-if="countText(g.count)" class="sidebar-item__count">{{ countText(g.count) }}</span>
                    </button>
                  </template>
                </div>
              </template>
              <a v-else-if="c.href" :href="c.href" class="sidebar-subitem" :class="{ active: activeId === c.id }" :aria-current="activeId === c.id ? 'page' : undefined"
                @click="onSubLink($event, c)"><TIcon v-if="c.icon" :name="c.icon" class="sidebar-subitem__icon" /><span class="sidebar-subitem__label">{{ c.label }}</span><span v-if="countText(c.count)" class="sidebar-item__count">{{ countText(c.count) }}</span></a>
              <button v-else type="button" class="sidebar-subitem" :class="{ active: activeId === c.id }" :aria-current="activeId === c.id ? 'page' : undefined" @click="$emit('nav', c.id)"><TIcon v-if="c.icon" :name="c.icon" class="sidebar-subitem__icon" /><span class="sidebar-subitem__label">{{ c.label }}</span><span v-if="countText(c.count)" class="sidebar-item__count">{{ countText(c.count) }}</span></button>
            </template>
          </div>
          </template>
        </template>
      </nav>
    </div>

    <!-- Collapse/Expand button — absolute at bottom -->
    <button v-if="!forceExpanded" class="btn-collapse" @click="onCollapseClick" v-tip="isExpanded ? 'Thu gọn' : 'Ghim mở rộng'" :aria-label="isExpanded ? 'Thu gọn' : 'Ghim mở rộng'">
      <!-- expanded → show collapse icon (lines right + left arrow) -->
      <svg v-if="isExpanded" viewBox="0 0 16.5 9.83333" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="11">
        <path d="M9.08333 0.75H15.75M9.08333 9.08333H15.75M12.4167 4.91667H15.75M0.75 4.91667H9.08333M4.5 1.16667L0.75 4.91667L4.5 8.66667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <!-- collapsed → show expand icon (lines left + right arrow) -->
      <svg v-else viewBox="0 0 16.5 9.83333" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="11">
        <path d="M0.75 0.75H7.41667M0.75 9.08333H7.41667M0.75 4.91667H4.08333M15.75 4.91667H7.41667M12 1.16667L15.75 4.91667L12 8.66667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </aside>
  </div>

  <!-- Menu con của mục sidebar (item.children) — nổi bên phải, cùng chuẩn menu xổ ra; mục có children → rê vào xổ tiếp menu cấp 3 sang phải -->
  <Teleport to="body">
    <Transition name="dropdown">
      <div v-if="flyout" ref="flyEl" class="dropdown-menu sidebar-flyout" :class="{ 'sidebar-flyout--dark': flyout.dark }" role="menu" :aria-label="flyout.item.label"
        :style="{ top: flyout.top + 'px', left: flyout.left + 'px' }"
        @mouseenter="cancelClose" @mouseleave="scheduleClose">
        <template v-for="(c, i) in flyout.item.children" :key="c.id ?? 'sep' + i">
          <div v-if="c.separator" class="dropdown-menu__separator" />
          <div v-else-if="c.group" class="sidebar-flyout__group">{{ c.group }}</div>
          <button v-else type="button" role="menuitem" class="dropdown-menu__item"
            :class="{ 'dropdown-menu__item--active': activeId === c.id || isChildActive(c), 'sidebar-flyout__item--open': fly2?.item.id === c.id }"
            :aria-haspopup="c.children ? 'menu' : undefined" :aria-expanded="c.children ? fly2?.item.id === c.id : undefined"
            @mouseenter="c.children ? openFly2(c, $event.currentTarget) : (fly2 = null)" @click="c.children ? openFly2(c, $event.currentTarget) : pick(c)">
            <TIcon v-if="c.icon" :name="c.icon" class="dropdown-menu__icon" />
            <span class="dropdown-menu__label">{{ c.label }}</span>
            <span v-if="countText(countOf(c))" class="sidebar-item__count">{{ countText(countOf(c)) }}</span>
            <TIcon v-if="c.children" name="chevron-right" class="sidebar-flyout__chev" />
          </button>
        </template>
      </div>
    </Transition>
    <Transition name="dropdown">
      <div v-if="flyout && fly2" ref="fly2El" class="dropdown-menu sidebar-flyout" :class="{ 'sidebar-flyout--dark': flyout.dark }" role="menu" :aria-label="fly2.item.label"
        :style="{ top: fly2.top + 'px', left: fly2.left + 'px' }"
        @mouseenter="cancelClose" @mouseleave="scheduleClose">
        <template v-for="(g, k) in fly2.item.children" :key="g.id ?? 'sep' + k">
          <div v-if="g.separator" class="dropdown-menu__separator" />
          <div v-else-if="g.group" class="sidebar-flyout__group">{{ g.group }}</div>
          <button v-else type="button" role="menuitem" class="dropdown-menu__item" :class="{ 'dropdown-menu__item--active': activeId === g.id }" @click="pick(g)">
            <TIcon v-if="g.icon" :name="g.icon" class="dropdown-menu__icon" />
            <span class="dropdown-menu__label">{{ g.label }}</span>
            <span v-if="countText(g.count)" class="sidebar-item__count">{{ countText(g.count) }}</span>
          </button>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { vTip } from '../utils/tooltip.js'
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import TIcon from './TIcon.vue'
import { fmtNum } from '../utils/number.js'

const props = defineProps({
  items:           { type: Array,   default: () => [] },
  activeId:        { type: String,  default: '' },
  defaultExpanded: { type: Boolean, default: false },
  hideQuickAdd:    { type: Boolean, default: false },
  quickAddLabel:   { type: String,  default: 'Thêm nhanh' },   // chữ trên nút thêm nhanh (VD “Thêm việc”)
  /** Khóa lưu trạng thái mở / thu gọn (mỗi app nên có khóa riêng) */
  storageKey:      { type: String,  default: 'mds-sidebar-expanded' },
  /** Cách hiện item.children: 'flyout' (menu con xổ sang phải) | 'accordion' (mở / đóng ngay bên dưới — menu dài nhiều nhóm, VD trang tài liệu) */
  childrenMode:    { type: String,  default: 'flyout' },
  /** Luôn mở rộng, ẩn nút thu gọn (VD sidebar nằm trong ngăn trượt ở màn hẹp) */
  forceExpanded:   { type: Boolean, default: false },
})
const emit = defineEmits(['nav', 'quick-add'])

/* ── Menu con (item.children = [{ id, label, icon?, count?, children? (cấp 3) } | { group: 'Tiêu đề nhóm' } | { separator: true }]) ──
   Rê vào mục → mở ngay cạnh phải; rời mục / menu → đóng sau 150ms (đủ để kéo chuột sang menu). Bấm mục cũng mở (cảm ứng / bàn phím).
   Chọn mục con → emit('nav', child.id). */
const flyout = ref(null)
const flyEl = ref(null)
let closeTimer = 0
const FLY_GAP = 0    // menu con nằm sát mép phải sidebar (không khe)
const isChildActive = item => !!item.children?.some(c => (c.id && c.id === props.activeId) || isChildActive(c))   // tìm cả cấp 3
function cancelClose() { clearTimeout(closeTimer) }
function scheduleClose() { cancelClose(); closeTimer = setTimeout(closeFlyout, 150) }
function closeFlyout() { cancelClose(); flyout.value = null; fly2.value = null }
/* Menu cấp 3: rê / bấm mục cấp 2 có children → xổ tiếp sát mép phải menu cấp 2, mục đầu thẳng hàng mục vừa rê */
const fly2 = ref(null), fly2El = ref(null)
async function openFly2(c, el) {
  cancelClose()
  if (fly2.value?.item.id === c.id) return
  const r = el.getBoundingClientRect(), m = flyEl.value?.getBoundingClientRect()
  const pad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--menu-pad')) || 8
  fly2.value = { item: c, left: (m ? m.right : r.right) + 4, top: r.top - pad }
  await nextTick()
  const w = fly2El.value?.offsetWidth ?? 0, h = fly2El.value?.offsetHeight ?? 0
  if (!fly2.value) return
  if (fly2.value.left + w > window.innerWidth - 8) fly2.value.left = Math.max(8, (m ? m.left : r.left) - w - 4)   // hết chỗ bên phải → xổ sang trái
  if (fly2.value.top + h > window.innerHeight - 8) fly2.value.top = Math.max(8, window.innerHeight - 8 - h)
}
async function openFlyout(item, el, toggle = false) {
  cancelClose()
  if (toggle && flyout.value?.item.id === item.id) { closeFlyout(); return }
  const r = el.getBoundingClientRect()
  const root = getComputedStyle(document.documentElement)
  const pad = parseFloat(root.getPropertyValue('--menu-pad')) || 12
  // Sidebar thu gọn đang giãn ra (hover) → lấy mép phải theo bề rộng MỞ RỘNG, không theo kích thước lúc đo
  const side = el.closest('.sidebar')?.getBoundingClientRect()
  const right = side ? side.left + Math.max(side.width, parseFloat(root.getPropertyValue('--layout-sidebar-w')) || 200) : r.right
  // Sidebar tối (data-sidebar="dark" ở :root hoặc khung .sidebar-scope) → menu xổ ra cũng nền tối (menu nằm ở <body> nên tự gắn cờ)
  const dark = !!el.closest('[data-sidebar="dark"]')
  fly2.value = null
  flyout.value = { item, dark, left: right + FLY_GAP, top: r.top - pad }   // sát sidebar · item đầu menu thẳng hàng mục sidebar
  await nextTick()
  const h = flyEl.value?.offsetHeight ?? 0
  if (flyout.value && flyout.value.top + h > window.innerHeight - 8) flyout.value.top = Math.max(8, window.innerHeight - 8 - h)
}
function pick(c) { closeFlyout(); emit('nav', c.id) }
/** Số đếm hiển thị: rỗng / 0 → không hiện · > 99 → “99+” (số dùng fmtNum chuẩn số) */
/** Số của mục: item.count · mục cha không có số riêng → tổng số các mục con (thu gọn / nhóm đóng vẫn biết bên trong có việc) */
const countOf = item => item.count ?? (item.children ?? []).reduce((t, c) => t + (Number(c.group || c.separator ? 0 : countOf(c)) || 0), 0)   // cộng dồn cả cấp 3
const countText = n => (Number(n) > 0 ? (Number(n) > 99 ? '99+' : fmtNum(Number(n))) : '')

/* ── Accordion: nhóm đang mở (nhớ theo storageKey) · nhóm chứa mục đang xem luôn tự mở ── */
const accordion = computed(() => props.childrenMode === 'accordion')
const OPEN_KEY = () => props.storageKey + '-open'
let savedOpen = []
try { savedOpen = JSON.parse(localStorage.getItem(OPEN_KEY()) || '[]') } catch { /* storage bị chặn */ }
const openIds = ref(new Set(Array.isArray(savedOpen) ? savedOpen : []))
const isOpen = item => openIds.value.has(item.id)
function toggleOpen(item) {
  const next = new Set(openIds.value)
  next.has(item.id) ? next.delete(item.id) : next.add(item.id)
  openIds.value = next
  try { localStorage.setItem(OPEN_KEY(), JSON.stringify([...next])) } catch { /* bỏ qua */ }
}
// Mở sẵn mọi nhóm (cấp 1 + cấp 2) trên đường tới mục đang xem
watch(() => [props.activeId, props.items], () => {
  if (!accordion.value) return
  const path = []
  const walk = list => list?.some(it => it.id === props.activeId || (isChildActive(it) && (path.push(it.id), walk(it.children), true)))
  walk(props.items)
  if (path.some(id => !openIds.value.has(id))) openIds.value = new Set([...openIds.value, ...path])
}, { immediate: true })
// Mục con có href: bấm thường → app tự điều hướng (emit nav); Ctrl / Cmd / chuột giữa → để trình duyệt mở tab mới
function onSubLink(e, c) {
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return
  e.preventDefault(); emit('nav', c.id)
}
const onKey = e => { if (e.key === 'Escape' && flyout.value) closeFlyout() }
document.addEventListener('keydown', onKey)
onBeforeUnmount(() => { cancelClose(); document.removeEventListener('keydown', onKey) })

/* Chỉ lưu khi người dùng tự bấm thu gọn / mở rộng — chưa bấm lần nào thì theo defaultExpanded */
let stored = null
try { stored = localStorage.getItem(props.storageKey) } catch { /* storage bị chặn */ }
const isExpanded = ref(stored !== null ? stored === 'true' : props.defaultExpanded)

function onCollapseClick() {
  isExpanded.value = !isExpanded.value
  try { localStorage.setItem(props.storageKey, String(isExpanded.value)) } catch { /* bỏ qua */ }
}
</script>
