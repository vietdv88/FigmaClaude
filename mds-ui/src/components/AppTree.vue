<template>
  <!-- Tree — Figma MDS “Pattern Organization Tree” (46155:6035): ô tìm kiếm + cây nhiều cấp, có / không có ô tick.
       Dòng cao 32 (theo --menu-item-h), đệm ngang 16, dòng cách 4 · mỗi cấp thụt 24 · mũi tên 16 → ô tick 16 → chữ 13/20 (cách 8) ·
       mục đã chọn chữ brand · rê chuột / phím ↑↓ nền brand nhạt · panel: nền trắng, đệm 12, bo 8, bóng Bottom 20 -->
  <div class="tree" :class="{ 'tree--panel': panel }">
    <AppSearchbox v-if="searchable" v-model="q" class="tree__search" :placeholder="searchPlaceholder" @keydown.down.prevent="focusFirst" />
    <div ref="listEl" class="tree__list" role="tree" :aria-multiselectable="checkable || null" :style="maxHeight ? { maxHeight: maxHeight + 'px' } : null" @keydown="onKey">
      <div v-for="(r, i) in rows" :key="r.node[idKey]" class="tree__item"
        :class="{ 'tree__item--active': i === activeIdx, 'tree__item--selected': isSel(r.node), 'tree__item--disabled': r.node.disabled }"
        role="treeitem" :aria-level="r.depth + 1" :aria-expanded="r.hasKids ? isOpen(r.node) : null" :aria-selected="isSel(r.node)"
        :aria-disabled="r.node.disabled || null" :tabindex="i === focusIdx ? 0 : -1"
        :style="{ '--tree-depth': r.depth }" @click="onRow(r, i)" @mouseenter="activeIdx = i" @focus="activeIdx = i">
        <span class="tree__toggle" :class="{ 'tree__toggle--leaf': !r.hasKids }" @click.stop="r.hasKids && toggleOpen(r.node)">
          <TIcon v-if="r.hasKids" :name="isOpen(r.node) ? 'chevron-down' : 'chevron-right'" />
        </span>
        <AppCheckbox v-if="checkable" class="tree__check" :model-value="checkState(r.node)" :disabled="r.node.disabled" tabindex="-1"
          @click.stop @update:model-value="toggleCheck(r.node)" />
        <span class="tree__label" v-tip="r.node[labelKey]">{{ r.node[labelKey] }}</span>
      </div>
      <p v-if="!rows.length" class="tree__empty">{{ q.trim() ? 'Không tìm thấy kết quả phù hợp' : emptyText }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import TIcon from './TIcon.vue'
import AppCheckbox from './AppCheckbox.vue'
import AppSearchbox from './AppSearchbox.vue'
import { vTip } from '../utils/tooltip.js'
import { matchText } from '../utils/search.js'

const props = defineProps({
  /** [{ id, label, children?: [...], disabled? }] */
  items:      { type: Array, default: () => [] },
  /** checkable: mảng id đã tick · không checkable: id đang chọn (1 mục) */
  modelValue: { default: null },
  checkable:  { type: Boolean, default: false },
  /** Tick cha → chọn cả nhánh, cha hiện “chọn một phần” khi con chọn dở (mặc định: chọn từng mục độc lập như Figma) */
  cascade:    { type: Boolean, default: false },
  searchable: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: 'Tìm kiếm' },
  /** Mở sẵn: true = mở hết · số = mở tới cấp đó (1 = chỉ gốc) · mảng id */
  defaultExpanded: { type: [Boolean, Number, Array], default: 1 },
  /** Khung panel trắng có bóng (dùng khi cây đứng riêng / xổ ra) */
  panel:      { type: Boolean, default: false },
  maxHeight:  { type: Number, default: 0 },
  emptyText:  { type: String, default: 'Chưa có dữ liệu' },
  idKey:      { type: String, default: 'id' },
  labelKey:   { type: String, default: 'label' },
})
const emit = defineEmits(['update:modelValue', 'select'])

/* ── Mở / đóng nhánh ── */
const open = ref(new Set())
function initOpen() {
  const s = new Set(), d = props.defaultExpanded
  const walk = (list, depth) => list.forEach(n => {
    if (!n.children?.length) return
    if (d === true || (typeof d === 'number' && depth < d) || (Array.isArray(d) && d.includes(n[props.idKey]))) s.add(n[props.idKey])
    walk(n.children, depth + 1)
  })
  walk(props.items, 0); open.value = s
}
initOpen()
watch(() => props.items, initOpen)
const isOpen = n => open.value.has(n[props.idKey])
function toggleOpen(n, v = !isOpen(n)) { const s = new Set(open.value); v ? s.add(n[props.idKey]) : s.delete(n[props.idKey]); open.value = s }

/* ── Tìm kiếm: giữ mục khớp + toàn bộ tổ tiên, tự mở nhánh chứa kết quả ── */
const q = ref('')
const matchIds = computed(() => {
  const t = q.value.trim(); if (!t) return null
  const keep = new Set()
  const walk = (list, path) => list.forEach(n => {
    if (matchText([n[props.labelKey]], t)) { keep.add(n[props.idKey]); path.forEach(p => keep.add(p)) }
    if (n.children?.length) walk(n.children, [...path, n[props.idKey]])
  })
  walk(props.items, []); return keep
})

/* ── Dòng đang hiện (cây phẳng theo thứ tự) ── */
const rows = computed(() => {
  const out = [], m = matchIds.value
  const walk = (list, depth) => list.forEach(n => {
    if (m && !m.has(n[props.idKey])) return
    const hasKids = !!n.children?.length
    out.push({ node: n, depth, hasKids })
    if (hasKids && (m ? true : isOpen(n))) walk(n.children, depth + 1)
  })
  walk(props.items, 0); return out
})

/* ── Chọn ── */
const checked = computed(() => new Set(props.checkable && Array.isArray(props.modelValue) ? props.modelValue : []))
const descIds = n => (n.children ?? []).flatMap(c => [c[props.idKey], ...descIds(c)])
const leafIds = n => (n.children?.length ? n.children.flatMap(leafIds) : [n[props.idKey]])
function checkState(n) {
  if (!props.cascade || !n.children?.length) return checked.value.has(n[props.idKey])
  const leaves = leafIds(n), on = leaves.filter(id => checked.value.has(id)).length
  return on === 0 ? false : on === leaves.length ? true : null   // null = chọn một phần
}
function toggleCheck(n) {
  if (n.disabled) return
  const s = new Set(checked.value), id = n[props.idKey]
  if (props.cascade && n.children?.length) {
    const all = [id, ...descIds(n)], turnOn = checkState(n) !== true
    all.forEach(x => (turnOn ? s.add(x) : s.delete(x)))
  } else (s.has(id) ? s.delete(id) : s.add(id))
  emit('update:modelValue', [...s])
}
const isSel = n => (props.checkable ? checkState(n) === true : props.modelValue === n[props.idKey])
function onRow(r, i) {
  activeIdx.value = i; focusIdx.value = i
  if (r.node.disabled) return
  if (props.checkable) toggleCheck(r.node)
  else { emit('update:modelValue', r.node[props.idKey]); emit('select', r.node) }
}

/* ── Bàn phím: ↑↓ di chuyển · → mở / xuống con · ← đóng / lên cha · Space / Enter chọn ── */
const listEl = ref(null), activeIdx = ref(-1), focusIdx = ref(0)
const focusRow = i => { if (i < 0 || i >= rows.value.length) return; focusIdx.value = activeIdx.value = i; listEl.value?.children[i]?.focus() }
function focusFirst() { focusRow(0) }
function onKey(e) {
  const i = activeIdx.value < 0 ? 0 : activeIdx.value, r = rows.value[i]
  if (!r) return
  if (e.key === 'ArrowDown') { e.preventDefault(); focusRow(i + 1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); focusRow(i - 1) }
  else if (e.key === 'ArrowRight' && r.hasKids) { e.preventDefault(); isOpen(r.node) || q.value.trim() ? focusRow(i + 1) : toggleOpen(r.node, true) }
  else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    if (r.hasKids && isOpen(r.node) && !q.value.trim()) toggleOpen(r.node, false)
    else { for (let k = i - 1; k >= 0; k--) if (rows.value[k].depth < r.depth) { focusRow(k); break } }
  }
  else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onRow(r, i) }
}
watch(rows, v => { if (activeIdx.value >= v.length) activeIdx.value = -1; if (focusIdx.value >= v.length) focusIdx.value = 0 })
</script>

<style scoped>
.tree { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.tree--panel { padding: 12px; border-radius: var(--radius-card); background: var(--bg-white); box-shadow: var(--shadow-bottom-20); }
.tree__search { width: 100%; }
.tree__list { display: flex; flex-direction: column; gap: 4px; overflow-y: auto; min-height: 0; }
.tree__item {
  --tree-indent: 24px;
  display: flex; align-items: center; gap: 8px; flex-shrink: 0; box-sizing: border-box;
  height: var(--menu-item-h, 32px); padding: 0 16px 0 calc(16px + var(--tree-depth) * var(--tree-indent));
  border-radius: var(--menu-radius, var(--radius-default));   /* nền hover / đang trỏ bo góc như mục Menu List — không chạm mép khung (panel đệm 12) */
  font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); cursor: pointer; outline: none;
}
.tree__item--active { background: var(--bg-brand-light); }
.tree__item:focus-visible { box-shadow: inset 0 0 0 2px var(--stroke-brand); }
.tree__item--selected .tree__label { color: var(--text-brand); }
.tree__item--disabled { cursor: not-allowed; color: var(--text-disabled); }
.tree__toggle { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; width: 16px; height: 16px; color: var(--icon-neutral); }
.tree__toggle .ti { font-size: 16px; }
.tree__toggle--leaf { cursor: inherit; }
.tree__check { flex-shrink: 0; }
.tree__label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tree__empty { margin: 0; padding: 6px 16px; font-size: var(--text-body); color: var(--text-secondary); }
</style>
