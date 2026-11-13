<template>
  <!-- Ô tìm kiếm của Global header (quy chuẩn /ds/hearder-bar › Ô tìm kiếm toàn cục):
       gõ từ khóa (VD tên người) → TỰ tìm trong các phân hệ (không cần Enter) → popup kết quả theo NHÓM PHÂN HỆ:
       trái = tên phân hệ · giữa = các bản ghi tìm thấy · phải = số kết quả (cùng khuôn popup “Kết quả tìm kiếm với AI” của AppAiSearchbox)
       Dùng nguyên kiểu ô của header (.search-box-header: nền mờ trên header màu, xám nhạt trên header trắng) — KHÔNG viền gradient AI (đó là ô tìm kiếm thông minh). -->
  <label ref="boxEl" v-bind="$attrs" class="search-box-header gs-box">
    <TIcon name="search" />
    <input ref="inputEl" type="text" class="gs-input" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" autocomplete="off"
      :value="text" :placeholder="placeholder" :aria-label="placeholder" :aria-expanded="String(open)" :aria-controls="open ? listId : undefined" :aria-activedescendant="activeId"
      @input="onInput" @keydown="onKey" @focus="onFocus" />
    <button v-if="text" type="button" class="gs-clear" tabindex="-1" aria-label="Xóa nội dung tìm kiếm" @mousedown.prevent @click="clear"><TIcon name="x" /></button>
  </label>

  <Teleport to="body">
    <div v-if="open" ref="panelEl" :id="listId" class="gs-pop" :style="popStyle" role="listbox" aria-label="Kết quả tìm kiếm">
      <!-- Đang tìm: spinner NGAY khi gõ (không đợi dữ liệu về) -->
      <p v-if="busy" class="gs-state" role="status"><span class="spinner spinner--sm" aria-hidden="true" />Đang tìm “{{ text.trim() }}”…</p>
      <template v-else-if="groups.length">
        <section v-for="g in groups" :key="g.key || g.title" class="gs-group" role="group" :aria-label="g.title">
          <h4 class="gs-group__title">{{ g.title }}</h4>
          <div class="gs-group__items">
            <button v-for="it in g.items" :id="idOf(it)" :key="it.id" type="button" class="gs-item" :class="{ 'gs-item--active': flat[active]?.it === it }" role="option" :aria-selected="flat[active]?.it === it"
              @mousemove="setActiveItem(it)" @click="pick(it, g)">
              <AppAvatar v-if="it.avatar !== false && (it.avatar || it.name)" :src="it.avatar || ''" :name="it.name" :size="32" />
              <span class="gs-item__text">
                <span class="gs-item__name"><template v-for="(p, i) in marks(it.name)" :key="i"><mark v-if="p.m" class="gs-hl">{{ p.t }}</mark><template v-else>{{ p.t }}</template></template></span>
                <span v-if="it.subtitle" class="gs-item__sub"><template v-for="(p, i) in marks(it.subtitle)" :key="i"><mark v-if="p.m" class="gs-hl">{{ p.t }}</mark><template v-else>{{ p.t }}</template></template></span>
                <span v-if="it.meta" class="gs-item__meta">{{ it.meta }}</span>
              </span>
            </button>
            <button v-if="(g.total ?? g.items.length) > g.items.length" type="button" class="btn btn--link gs-more" @click="more(g)">Xem thêm</button>
          </div>
          <AppTag class="gs-group__count" color="neutral" :label="`${fmtNum(g.total ?? g.items.length)} kết quả`" />
        </section>
      </template>
      <!-- Không phân hệ nào có kết quả → KHÔNG hiện nhóm rỗng -->
      <div v-else class="gs-empty">
        <p class="gs-empty__t">Không tìm thấy kết quả cho “{{ text.trim() }}”</p>
        <p class="gs-empty__s">Kiểm tra chính tả hoặc thử từ khóa ngắn hơn (VD chỉ gõ tên).</p>
      </div>
      <p v-if="!busy && groups.length" class="gs-foot">↑ ↓ để chọn · Enter để mở · Esc để đóng</p>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount, getCurrentInstance } from 'vue'
import TIcon from './TIcon.vue'
import AppAvatar from './AppAvatar.vue'
import AppTag from './AppTag.vue'
import { fmtNum } from '../utils/number.js'
import { highlightParts } from '../utils/search.js'

defineOptions({ inheritAttrs: false })   // gốc gồm ô + popup (Teleport) → class / style truyền vào gắn cho ô
const props = defineProps({
  modelValue:  { type: String,  default: '' },
  placeholder: { type: String,  default: 'Tìm kiếm' },
  /** Kết quả theo nhóm phân hệ: [{ key, title: 'Hồ sơ', total, items: [{ id, name, subtitle, meta, avatar }] }] — null = chưa tìm. Phân hệ không có kết quả KHÔNG đưa vào */
  results:     { type: Array,   default: null },
  /** Đang tìm (cha đặt true khi nhận 'search', false khi có kết quả) */
  loading:     { type: Boolean, default: false },
  /** Số ký tự tối thiểu mới tìm */
  minChars:    { type: Number,  default: 2 },
  /** Chờ người dùng ngừng gõ (ms) rồi mới emit 'search' */
  debounce:    { type: Number,  default: 300 },
  /** Bề rộng popup kết quả (tối thiểu bằng ô) */
  panelWidth:  { type: Number,  default: 640 },
})
const emit = defineEmits(['update:modelValue', 'search', 'select', 'more', 'clear'])
const inst = getCurrentInstance()
// Không có cha bắt @search → chỉ là ô nhập thường (popup không mở, khỏi quay spinner mãi)
const searchable = computed(() => !!inst?.vnode.props?.onSearch)

const uid = Math.random().toString(36).slice(2, 8), listId = 'gs-' + uid
const boxEl = ref(null), inputEl = ref(null), panelEl = ref(null)
const text = ref(props.modelValue), open = ref(false), waiting = ref(false), active = ref(-1), popStyle = ref({})
watch(() => props.modelValue, v => { if (v !== text.value) text.value = v })
const busy = computed(() => waiting.value || props.loading)
const groups = computed(() => (props.results || []).filter(g => g?.items?.length))
const flat = computed(() => groups.value.flatMap(g => g.items.map(it => ({ it, g }))))
const idOf = it => `${listId}-${it.id}`
const activeId = computed(() => (open.value && flat.value[active.value] ? idOf(flat.value[active.value].it) : undefined))

const marks = str => highlightParts(str, text.value)   // tô đậm phần khớp từ khóa (không phân biệt hoa thường / dấu)

let timer = 0
function onInput(e) {
  text.value = e.target.value; emit('update:modelValue', text.value)
  clearTimeout(timer); active.value = -1
  const q = text.value.trim()
  if (!searchable.value || q.length < props.minChars) { waiting.value = false; open.value = false; return }   // chưa đủ ký tự → không mở gì cả
  waiting.value = true; show()                   // mở popup + spinner ngay
  timer = setTimeout(() => { waiting.value = false; emit('search', q) }, props.debounce)
}
function onFocus() { if (searchable.value && text.value.trim().length >= props.minChars && (props.results !== null || busy.value)) show() }   // bấm vào ô trống: KHÔNG xổ gì — gõ mới tìm
async function show() { open.value = true; await nextTick(); place() }
function close() { open.value = false; active.value = -1 }
function clear() { text.value = ''; emit('update:modelValue', ''); emit('clear'); clearTimeout(timer); waiting.value = false; close(); inputEl.value?.focus() }
function pick(it, g) { emit('select', it, g); close() }
function more(g) { emit('more', g, text.value.trim()); close() }   // “Xem thêm” → app mở popup kết quả của đúng phân hệ đó
function setActiveItem(it) { const i = flat.value.findIndex(x => x.it === it); if (i >= 0) active.value = i }

function onKey(e) {
  if (e.isComposing || e.keyCode === 229) return   // đang gõ chữ có dấu (Telex / VNI) — để bộ gõ chốt chữ
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!open.value) { if (searchable.value && props.results && text.value.trim().length >= props.minChars) show(); return }
    if (!flat.value.length) return
    e.preventDefault()
    const n = flat.value.length
    active.value = e.key === 'ArrowDown' ? (active.value + 1) % n : (active.value - 1 + n) % n
    nextTick(() => panelEl.value?.querySelector('.gs-item--active')?.scrollIntoView({ block: 'nearest' }))
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const cur = flat.value[active.value]
    const first = flat.value[0]   // chưa chọn dòng nào → mở bản ghi đầu tiên
    if (open.value && (cur || first) && !busy.value) pick((cur || first).it, (cur || first).g)
  } else if (e.key === 'Escape') {
    if (open.value) { e.stopPropagation(); close() } else if (text.value) { e.stopPropagation(); clear() }
  }
}

/* Độ cao popup BÁM THEO màn hình thực tế (trừ lề 24px để không dính mép / không bị che) — danh sách dài thì cuộn trong popup.
   · tính theo viewport nhìn thấy thật (visualViewport: màn điện thoại đã trừ bàn phím ảo)
   · chỗ phía dưới ô < 240px mà phía trên rộng hơn (ô nằm thấp trên màn hình) → xổ LÊN trên, không để tràn khỏi màn hình */
const GAP = 4, EDGE = 24, MIN_ROOM = 240
function place() {
  const r = boxEl.value?.getBoundingClientRect(); if (!r) return
  const w = Math.min(Math.max(r.width, props.panelWidth), window.innerWidth - 16)
  const left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8))
  const vh = window.visualViewport?.height ?? window.innerHeight
  const below = vh - r.bottom - GAP - EDGE, above = r.top - GAP - EDGE
  const up = below < MIN_ROOM && above > below
  popStyle.value = { left: left + 'px', width: w + 'px', maxHeight: Math.max(120, up ? above : below) + 'px', ...(up ? { bottom: window.innerHeight - r.top + GAP + 'px' } : { top: r.bottom + GAP + 'px' }) }
}
const onDoc = e => { if (open.value && !panelEl.value?.contains(e.target) && !boxEl.value?.contains(e.target)) close() }
const onWin = () => open.value && place()
watch(open, v => {
  if (v) { document.addEventListener('mousedown', onDoc, true); window.addEventListener('resize', onWin); window.addEventListener('scroll', onWin, true); window.visualViewport?.addEventListener('resize', onWin) }
  else { document.removeEventListener('mousedown', onDoc, true); window.removeEventListener('resize', onWin); window.removeEventListener('scroll', onWin, true); window.visualViewport?.removeEventListener('resize', onWin) }
})
watch(() => [props.results, props.loading], () => { if (open.value) nextTick(place) })
onBeforeUnmount(() => { clearTimeout(timer); close() })
defineExpose({ focus: () => inputEl.value?.focus(), close })
</script>

<style>
/* Nút ✕ xóa trong ô — màu theo nền header (nền màu: trắng mờ · header trắng: icon Neutral) */
.gs-clear { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; width: 20px; height: 20px; padding: 0; border: none; border-radius: var(--radius-sm, 4px); background: transparent; cursor: pointer; }
.gs-clear .ti { font-size: 16px; color: var(--alpha-white-700); }
.gs-clear:hover { background: var(--alpha-white-200); }
.gs-clear:hover .ti { color: var(--icon-white); }
.global-header--white .gs-clear .ti { color: var(--icon-neutral); }
.global-header--white .gs-clear:hover { background: var(--bg-neutral-hover); }

/* Popup kết quả (ở <body>) — cùng khuôn popup “Kết quả tìm kiếm với AI”: nền trắng · bo 8 · bóng popover · đệm 16 */
.gs-pop { position: fixed; z-index: var(--z-header-pop, 9600); box-sizing: border-box; overflow: auto; padding: var(--box-padding, 16px); background: var(--bg-white); border-radius: var(--radius-default); box-shadow: var(--shadow-popover); font-family: var(--font-family); color: var(--text-primary); }
.gs-state { display: flex; align-items: center; gap: 8px; margin: 0; padding: 4px 0; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.gs-empty { padding: 4px 0; }
.gs-empty__t { margin: 0; font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); overflow-wrap: anywhere; }
.gs-empty__s { margin: 4px 0 0; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
/* Nhóm phân hệ: tên phân hệ 120px VIẾT HOA chữ phụ (trái) · bản ghi (giữa) · số kết quả — Tag Neutral (phải) */
.gs-group { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-top: 1px solid var(--stroke-neutral-light); }
.gs-group:first-child { padding-top: 0; border-top: none; }
.gs-group__title { width: 120px; flex-shrink: 0; margin: 0; padding: 8px 0;   /* 8 = đệm trên của dòng kết quả → chữ phân hệ thẳng hàng với dòng đầu của bản ghi */
  font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); color: var(--text-secondary); text-transform: uppercase; overflow-wrap: anywhere; }
.gs-group__items { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.gs-group__count { flex-shrink: 0; margin-top: 8px; }
.gs-item { display: flex; align-items: flex-start; gap: 8px; width: 100%; padding: 8px; border: none; border-radius: var(--radius-default); background: none; text-align: left; font: inherit; color: inherit; cursor: pointer; }   /* đệm ĐỀU 8 bốn phía (trước 4 trên-dưới / 8 trái-phải → vùng hover nhìn lệch) */
.gs-item:hover, .gs-item--active { background: var(--bg-brand-light); }
.gs-item:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: -2px; }
.gs-item__text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.gs-item__name { font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gs-item__sub, .gs-item__meta { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); overflow-wrap: anywhere; }
.gs-item__meta { margin-top: 4px; }
.gs-hl { padding: 0; background: none; color: var(--text-brand); font-weight: var(--fw-semibold); }   /* phần khớp từ khóa */
.gs-more { align-self: flex-start; margin: 4px 8px; }
.gs-foot { margin: 4px 0 0; padding-top: 12px; border-top: 1px solid var(--stroke-neutral-light); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
@media (max-width: 640px) {
  .gs-group { flex-wrap: wrap; gap: 4px 12px; }
  .gs-group__title { width: auto; flex: 1; }
  .gs-group__items { order: 3; flex-basis: 100%; }
  .gs-foot { display: none; }
}
</style>
