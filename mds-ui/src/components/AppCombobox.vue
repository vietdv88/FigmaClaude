<template>
  <div ref="boxEl" class="ibox" :class="boxClass" :style="{ cursor: locked ? 'default' : 'pointer' }" @click="onBoxClick">
    <TIcon v-if="iconLeft" :name="iconLeft" class="ibox__icon" />

    <!-- Danh sách tự vẽ (KHÔNG dùng <select> mặc định). Ô là input: gõ ngay để lọc danh sách (không có ô tìm riêng trong popup) -->
    <span ref="fieldEl" class="cb-field">
      <!-- Chọn nhiều (hành xử như Vaadin Multi-Select Combo Box): thẻ 1 hàng, ô không cao lên · thẻ không đủ chỗ gộp thành thẻ “+N” ở đầu
           (rê chuột xem tên) — luôn hiện các mục chọn SAU CÙNG · gõ tiếp ngay sau thẻ -->
      <span v-if="multiple && selectedValues.length" ref="tagsEl" class="cb-tags" :class="{ 'cb-tags--measure': measuring }">
        <span v-if="hiddenCount && !measuring" class="cb-tag cb-tag--more" v-tip="hiddenValues.map(labelOf).join(', ')" :aria-label="`Còn ${hiddenCount} mục: ${hiddenValues.map(labelOf).join(', ')}`">{{ hiddenCount }}</span>
        <span v-for="(val, i) in shownValues" :key="val" class="cb-tag" :class="{ 'cb-tag--custom': creatable && !optionOf(val), 'cb-tag--focus': tagFocus && i === shownValues.length - 1 }"
          v-tip="creatable && !optionOf(val) ? 'Tự nhập (không có trong danh sách)' : null" :aria-label="creatable && !optionOf(val) ? 'Tự nhập (không có trong danh sách)' : null">
          <!-- tagAvatar: tag có ảnh / chữ cái đầu như dòng trong danh sách · giá trị tự nhập (creatable) → icon bút -->
          <TIcon v-if="creatable && !optionOf(val)" name="pencil" class="cb-tag__ic" />
          <span v-else-if="tagAvatar && optionOf(val)?.avatar !== undefined" class="cb-avatar cb-avatar--tag" :class="{ 'cb-avatar--square': avatarSquare }">
            <img v-if="optionOf(val).avatar && !brokenAv[optionOf(val).avatar]" :src="optionOf(val).avatar" alt="" referrerpolicy="no-referrer" @error="brokenAv[optionOf(val).avatar] = true" />
            <span v-else :style="{ background: avatarColor(optionOf(val).avatarName ?? optionOf(val).label).bg }">{{ avatarInitials(optionOf(val).avatarName ?? optionOf(val).label) }}</span>
          </span>
          <span class="cb-tag__label">{{ labelOf(val) }}</span>
          <span v-if="!locked" class="cb-tag__x" v-tip="'Bỏ'" aria-label="Bỏ" @click.stop="toggleValue(val)"><TIcon name="x" /></span>
        </span>
      </span>
      <input ref="triggerEl" class="ibox__native cb-trigger" :class="{ 'cb-trigger--typing': listOpen, 'cb-trigger--tight': multiple && selectedValues.length && !listOpen }"
        :value="inputText" :placeholder="inputPlaceholder" :readonly="locked" :disabled="disabled || state === 'disabled'"
        autocomplete="off" spellcheck="false" role="combobox" :aria-expanded="listOpen"
        @mousedown.stop="onInputMouseDown" @focus="onFocus" @input="onInput" @keydown="onKey" />
    </span>

    <!-- Lỗi: icon chấm than đỏ, hover → tooltip lỗi (nằm trong AppInput có lỗi) -->
    <span v-if="fe?.hasError.value" class="ibox__icon ibox__icon--error" @mouseenter="fe.show()" @mouseleave="fe.hide()"><TIcon name="alert-circle" /></span>
    <!-- Đã chọn → nút × bỏ chọn (về trạng thái chưa chọn) -->
    <button v-if="showClear" type="button" tabindex="-1" class="ibox__icon ibox__icon--clear ibox__clear-btn" v-tip="'Bỏ chọn'" aria-label="Bỏ chọn" @click.stop="clearAll"><TIcon name="x" /></button>
    <TIcon v-if="iconRight" :name="iconRight" class="ibox__icon" :class="{ 'ibox__icon--brand': iconRight === 'plus' }" />
    <!-- Chỉ đọc: không có mũi tên (không mở được danh sách) — trông như ô chữ chỉ đọc, không gây hiểu nhầm là chọn được -->
    <TIcon v-if="!(state === 'readonly' && !disabled) && !splitIcon" name="chevron-down" class="ibox__icon cb-chevron" :class="{ 'cb-chevron--open': listOpen }" />
    <!-- Combobox Split (Figma Combobox Single Split): ô phải ngăn bằng vạch, bấm icon = lựa chọn nâng cao (quản lý danh sách / tìm nâng cao) -->
    <button v-if="splitIcon" type="button" class="cb-split" :disabled="locked" v-tip="splitTip" :aria-label="splitTip || 'Lựa chọn nâng cao'" @mousedown.stop @click.stop="closeList(); $emit('split')"><TIcon :name="splitIcon" /></button>

    <Teleport to="body">
      <div v-if="listOpen" ref="listEl" class="cb-list" :class="{ 'cb-list--table': columns.length }" :style="[listStyle, columns.length ? { '--cb-cols': colTemplate } : null]" role="listbox" :aria-multiselectable="multiple" @keydown="onKey">
        <!-- Dạng bảng: hàng tiêu đề cột (đứng yên khi cuộn) -->
        <div v-if="columns.length" class="cb-thead" aria-hidden="true"><span v-for="c in columns" :key="c.key" class="cb-th">{{ c.label }}</span></div>
        <div class="cb-list__scroll">
          <!-- Đang tải dữ liệu (prop loading — VD tải khi mở @open): vòng xoay nhỏ giữa danh sách (quy chuẩn /ds/loading), không hiện “Không có lựa chọn” -->
          <div v-if="loading" class="cb-list__loading" role="status" aria-label="Đang tải dữ liệu"><span class="spinner spinner--sm" /></div>
          <p v-else-if="!filtered.length && !createItem" class="cb-list__empty">Không có lựa chọn phù hợp</p>
          <template v-for="(opt, i) in (loading ? [] : filtered)" :key="opt.value">
          <!-- recentKey: nhóm “Gần đây” (đã chọn gần nhất) trên cùng, rồi “Tất cả” -->
          <p v-if="opt._recent && !filtered[i - 1]?._recent" class="cb-list__group">Gần đây</p>
          <p v-else-if="!opt._recent && !opt._all && i > 0 && filtered[i - 1]._recent" class="cb-list__group cb-list__group--sep">Tất cả</p>
          <button type="button" role="option" :aria-selected="isSelected(opt.value)"
            class="cb-list__item"
            :class="{ 'cb-list__item--active': i === activeIdx, 'cb-list__item--selected': isSelected(opt.value), 'cb-list__item--parent': opt.parent && !searching, 'cb-list__item--person': opt.avatar !== undefined && !avatarSquare }"
            :style="opt.depth && !searching ? { paddingLeft: `calc(var(--menu-item-px) + ${opt.depth} * 20px)` } : null"
            :disabled="opt.disabled" @mouseenter="activeIdx = i" @click="choose(opt)">
            <!-- Dạng cây (option.depth): mục con thụt lề + ↳ · collapsible: mũi tên co / giãn nhánh · đang gõ tìm → hiện đường dẫn đầy đủ (label) -->
            <template v-if="collapsible && !searching">
              <span v-if="opt.parent" class="cb-list__toggle" role="button" :aria-expanded="!collapsed.has(opt.value)"
                v-tip="collapsed.has(opt.value) ? 'Mở nhánh' : 'Thu gọn nhánh'" :aria-label="collapsed.has(opt.value) ? 'Mở nhánh' : 'Thu gọn nhánh'" @mousedown.prevent @click.stop="toggleNode(opt.value)">
                <TIcon :name="collapsed.has(opt.value) ? 'chevron-right' : 'chevron-down'" />
              </span>
              <span v-else class="cb-list__toggle cb-list__toggle--leaf" />
            </template>
            <TIcon v-else-if="opt.depth && !searching" name="corner-down-right" class="cb-list__tree" />
            <!-- option.avatar (url, '' = chữ cái đầu): danh sách người -->
            <!-- Figma Dropdown Menu “Multi Line”: avatar 32px theo AppAvatar, dòng cao 48px -->
            <AppAvatar v-if="opt.avatar !== undefined && !avatarSquare" :name="opt.avatarName ?? opt.label" :src="opt.avatar" :size="32" />
            <span v-else-if="opt.avatar !== undefined" class="cb-avatar cb-avatar--square">
              <img v-if="opt.avatar && !brokenAv[opt.avatar]" :src="opt.avatar" alt="" referrerpolicy="no-referrer" @error="brokenAv[opt.avatar] = true" />
              <span v-else :style="{ background: avatarColor(opt.avatarName ?? opt.label).bg }">{{ avatarInitials(opt.avatarName ?? opt.label) }}</span>
            </span>
            <span v-if="columns.length" class="cb-tr"><span v-for="c in columns" :key="c.key" class="cb-td" :title="String(opt[c.key] ?? '')">{{ opt[c.key] }}</span></span>
            <span v-else class="cb-list__text">
              <span class="cb-list__label">{{ searching ? opt.label : (opt.text ?? opt.label) }}</span>
              <span v-if="opt.description" class="cb-list__desc">{{ opt.description }}</span>
            </span>
            <!-- Chọn nhiều: dấu ✓ ở các dòng đã chọn -->
            <TIcon v-if="multiple && isSelected(opt.value)" name="check" class="cb-list__check" />
          </button>
          </template>
          <!-- creatable: chữ đang gõ không trùng mục nào → thêm làm giá trị tự nhập -->
          <button v-if="createItem" type="button" role="option" class="cb-list__item cb-list__create"
            :class="{ 'cb-list__item--active': activeIdx === filtered.length }" @mouseenter="activeIdx = filtered.length" @click="choose(createItem)">
            <template v-if="multiple"><TIcon name="plus" class="cb-list__create-ic" /><span class="cb-list__text"><span class="cb-list__label">{{ createLabel }} “{{ createItem.value }}”</span></span></template>
            <span v-else class="cb-list__create-link">Nhấn Enter để thêm mới</span>
          </button>
        </div>
        <!-- Chân danh sách (VD dạng bảng: “Thêm mới (F9) · Tìm nhanh (F3)”) -->
        <div v-if="$slots.footer" class="cb-list__foot" @mousedown.prevent><slot name="footer" :close="closeList" :query="q" /></div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { vTip } from '../utils/tooltip.js'
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, reactive, useSlots } from 'vue'
import AppAvatar from './AppAvatar.vue'
import TIcon from './TIcon.vue'
import { useFieldError, useFieldRequired } from '../utils/fieldError.js'
import { matchText } from '../utils/search.js'
import { avatarInitials, avatarColor } from '../utils/avatar.js'

const props = defineProps({
  modelValue:  { type: [String, Array], default: () => '' },
  options:     { type: Array,   default: () => [] }, // string[] | { value, label, disabled?, description? }[]
  placeholder: { type: String,  default: '' },
  multiple:    { type: Boolean, default: false },
  state:       { type: String,  default: 'default' },
  outline:     { type: Boolean, default: true },
  iconLeft:    { type: String,  default: '' },
  iconRight:   { type: String,  default: '' },
  size:        { type: String,  default: 'md' },
  disabled:    { type: Boolean, default: false },
  ghost:       { type: Boolean, default: false },
  clearable:   { type: Boolean, default: undefined },  // true: nút × bỏ chọn (MẶC ĐỊNH KHÔNG — quy chuẩn: chỉ ô tìm kiếm có ×) · false: tắt hẳn bỏ chọn (kể cả mục “Chưa chọn”) — dùng cho ô luôn phải có giá trị
  /** Mục “để trống” đầu danh sách (chọn 1) — VD 'Chưa giao' / 'Để trống': cách bỏ chọn thay cho nút × (quy chuẩn không có ×).
      Ô lọc có placeholder “…: Tất cả” tự có mục “Tất cả”, không cần truyền */
  emptyOption: { type: String, default: '' },
  /** Trường bắt buộc → không có nút × (đổi bằng cách chọn giá trị khác). Nằm trong <AppInput required> thì tự nhận, không cần truyền */
  required:    { type: Boolean, default: false },
  collapsible: { type: Boolean, default: false },
  creatable:   { type: Boolean, default: false },  // chọn nhiều: cho tự nhập giá trị ngoài danh sách (gõ → “Thêm …” / Enter) — giá trị = chữ đã gõ
  createLabel: { type: String,  default: 'Thêm' },
  /** Dạng bảng: [{ key, label, width? (px) }] — danh sách có hàng tiêu đề cột, mỗi dòng hiện option[key]; tìm theo mọi cột */
  columns:     { type: Array,   default: () => [] },
  /** Dạng Split: icon ở ô phải ngăn bằng vạch (VD 'dots' = quản lý danh sách giá trị, 'search' = tìm nâng cao) → emit('split') */
  splitIcon:   { type: String,  default: '' },
  splitTip:    { type: String,  default: '' },
  tagAvatar:   { type: Boolean, default: false },  // chọn nhiều: tag hiện avatar / logo của option (option.avatar)
  avatarSquare:{ type: Boolean, default: false },
  recentKey:   { type: String,  default: '' },     // nhớ giá trị chọn gần đây (localStorage) → hiện nhóm “Gần đây” trên đầu danh sách (khi chưa gõ tìm)
  recentMax:   { type: Number,  default: 5 },
  /** Đang tải danh sách (VD gọi API khi mở — nghe @open): danh sách xổ ra hiện vòng xoay nhỏ ở giữa */
  loading:     { type: Boolean, default: false },  // avatar vuông bo góc (logo dự án…) — cả danh sách và tag  // dạng cây: co / giãn các mục có con (option.parent) — mở danh sách: chỉ mở nhánh chứa mục đang chọn (+ mục có open: true)
})
const emit = defineEmits(['update:modelValue', 'change', 'create', 'split', 'add', 'quick-search', 'open'])
const slots = useSlots()
const slotsFooter = () => !!slots.footer

/* options: [{ value, label, description?, disabled?, avatar? (url — '' = chữ cái đầu; có trường này → hiện avatar), avatarName? (tên lấy chữ cái đầu, mặc định label), search? (chuỗi tìm thêm) }] · dạng cây thêm: depth (cấp), text (tên ngắn hiện trong danh sách; label = đường dẫn đầy đủ để hiện khi đã chọn / khi tìm), parent (có mục con) */
const normalizedOptions = computed(() => props.options.map(o => (typeof o === 'object' ? o : { value: String(o), label: String(o) })))
const selectedValues = computed(() => (props.multiple ? (Array.isArray(props.modelValue) ? props.modelValue : []) : []))
/* Ảnh avatar lỗi → chữ cái đầu (avatar chỉ hiện trong danh sách xổ ra; đã chọn thì ô chỉ hiện chữ) */
const brokenAv = reactive({})
const hasValue  = computed(() => (props.multiple ? selectedValues.value.length > 0 : !!props.modelValue))
const locked    = computed(() => props.disabled || props.state === 'disabled' || props.state === 'readonly')
/* Nút × (quy chuẩn): chỉ khi “để trống” là hợp lệ — ô bắt buộc không có ×; chọn nhiều: × xoá hết chỉ khi từ 2 thẻ (bỏ 1 thẻ dùng × trên thẻ);
   chỉ hiện khi rê chuột / đang focus (CSS .ibox__clear-btn), máy cảm ứng hiện sẵn */
const fieldRequired = useFieldRequired()
const inField = !!useFieldError()   // nằm trong trường form (AppInput / TipField…) — không phải ô lọc trên thanh công cụ
const showClear = computed(() => props.clearable && !props.required && !fieldRequired() && hasValue.value && !locked.value
  && (!props.multiple || selectedValues.value.length >= 2))
const hasDesc   = computed(() => normalizedOptions.value.some(o => o.description))
const selectedLabel = computed(() => normalizedOptions.value.find(o => o.value === props.modelValue)?.label ?? '')
const optionOf   = val => normalizedOptions.value.find(o => o.value === val)
const labelOf    = val => optionOf(val)?.label ?? val
const isSelected = val => (props.multiple ? selectedValues.value.includes(val) : val === props.modelValue)

function emitValue(v) { emit('update:modelValue', v); emit('change', v) }

/* ── Gần đây (recentKey): giá trị vừa chọn lên đầu, tối đa recentMax; lưu theo trình duyệt ── */
const RECENT_STORE = () => 'cb-recent:' + props.recentKey
const loadRecent = () => { try { const v = JSON.parse(localStorage.getItem(RECENT_STORE()) || '[]'); return Array.isArray(v) ? v : [] } catch { return [] } }
const recents = ref(props.recentKey ? loadRecent() : [])
function rememberRecent(val) {
  if (!props.recentKey || val === '' || val == null) return
  recents.value = [val, ...loadRecent().filter(x => x !== val)].slice(0, props.recentMax)
  try { localStorage.setItem(RECENT_STORE(), JSON.stringify(recents.value)) } catch { /* bỏ qua */ }
}
function toggleValue(val) {
  const list = selectedValues.value
  emitValue(list.includes(val) ? list.filter(v => v !== val) : [...list, val])
}
function clearAll() { emitValue(props.multiple ? [] : '') }

/* ── Chọn nhiều: xếp thẻ 1 hàng — đo bề rộng từng thẻ, giữ các thẻ CUỐI vừa chỗ (chừa ô gõ 40px), phần còn lại gộp thành “+N” ── */
const fieldEl = ref(null), tagsEl = ref(null), hiddenCount = ref(0), measuring = ref(false), tagFocus = ref(false)
const shownValues  = computed(() => (measuring.value ? selectedValues.value : selectedValues.value.slice(hiddenCount.value)))
const hiddenValues = computed(() => selectedValues.value.slice(0, hiddenCount.value))
const TAG_GAP = 4, MORE_W = 40   // thẻ đếm: 8 (mép xếp chồng) + ô vuông 24 + chừa số 2 chữ số
/* Chỗ gõ: đang mở danh sách chừa 40px để gõ lọc · đóng thì nhường gần hết cho thẻ */
const inputMin = () => (listOpen.value ? 40 : 8)
let fitting = false
async function fitTags() {
  if (!props.multiple || fitting) return
  if (!selectedValues.value.length) { hiddenCount.value = 0; return }
  fitting = true; measuring.value = true
  await nextTick()
  const field = fieldEl.value, w = [...(tagsEl.value?.querySelectorAll('.cb-tag:not(.cb-tag--more)') ?? [])].map(t => t.offsetWidth)
  if (field && w.length) {
    const avail = field.clientWidth - inputMin() - TAG_GAP
    let used = 0, k = 0
    for (let i = w.length - 1; i >= 0; i--) { const add = w[i] + (k ? TAG_GAP : 0); if (used + add > avail) break; used += add; k++ }
    if (k < w.length) {   // có thẻ bị ẩn → chừa chỗ cho thẻ “+N”
      while (k > 0 && used + MORE_W + TAG_GAP > avail) { used -= w[w.length - k] + (k > 1 ? TAG_GAP : 0); k-- }
      k = Math.max(k, 1)   // luôn hiện ít nhất thẻ mới chọn (chữ dài → cắt “…”)
    }
    hiddenCount.value = w.length - k
  } else hiddenCount.value = 0
  measuring.value = false; fitting = false
}
watch(selectedValues, () => { tagFocus.value = false; fitTags() }, { deep: true })
let ro = null
onMounted(() => {
  fitTags()
  if (props.multiple && window.ResizeObserver && fieldEl.value) { let lastW = 0; ro = new ResizeObserver(([e]) => { const cw = Math.round(e.contentRect.width); if (cw !== lastW) { lastW = cw; fitTags() } }); ro.observe(fieldEl.value) }
})
onBeforeUnmount(() => ro?.disconnect())

/* ── Danh sách xổ xuống ── */
const boxEl = ref(null), triggerEl = ref(null), listEl = ref(null)
const listOpen = ref(false), activeIdx = ref(-1), listStyle = ref({}), q = ref('')
watch(listOpen, () => fitTags())   // mở / đóng danh sách → chỗ gõ đổi bề rộng, xếp lại thẻ
/* Ô nhập: đóng → hiện nhãn đang chọn · mở → chữ đang gõ (nhãn đang chọn hiện mờ làm gợi ý) */
const inputText = computed(() => (listOpen.value ? q.value : (props.multiple ? '' : selectedLabel.value)))
const inputPlaceholder = computed(() => {
  if (props.multiple) return selectedValues.value.length ? (listOpen.value ? 'Gõ để tìm…' : '') : props.placeholder
  return listOpen.value ? ((!clearing.value && selectedLabel.value) || props.placeholder || 'Gõ để tìm…') : props.placeholder
})
const searching = computed(() => !!q.value.trim())
/* Cây co / giãn: ẩn mọi mục nằm dưới 1 mục cha đang co (dựa vào thứ tự cha trước con + depth) */
const collapsed = ref(new Set())
const visibleTree = computed(() => {
  const out = []; let hideBelow = null
  for (const o of normalizedOptions.value) {
    const d = o.depth ?? 0
    if (hideBelow !== null) { if (d > hideBelow) continue; hideBelow = null }
    out.push(o)
    if (o.parent && collapsed.value.has(o.value)) hideBelow = d
  }
  return out
})
function toggleNode(v) { const n = new Set(collapsed.value); n.has(v) ? n.delete(v) : n.add(v); collapsed.value = n }
// Mở danh sách: co hết, chỉ mở các mục cha dẫn tới mục đang chọn
function initCollapsed() {
  const stack = [], keepOpen = new Set(), sel = props.multiple ? selectedValues.value : [props.modelValue]
  for (const o of normalizedOptions.value) {
    const d = o.depth ?? 0; stack.length = d; stack[d] = o.value
    if (sel.includes(o.value)) stack.slice(0, d).forEach(v => keepOpen.add(v))
  }
  collapsed.value = new Set(normalizedOptions.value.filter(o => o.parent && !o.open && !keepOpen.has(o.value)).map(o => o.value))   // option.open → luôn mở sẵn (VD nút gốc “Tất cả”)
}
/* Ô lọc (placeholder dạng “Trạng thái: Tất cả”, chọn 1): mục “Tất cả” đầu danh sách = bỏ lọc (giá trị '') — thay cho nút × */
const allOption = computed(() => {
  if (props.multiple || props.required || fieldRequired()) return null
  // Danh sách đã có sẵn mục “… Tất cả” / mục giá trị rỗng (VD “Trạng thái: Tất cả”) → không thêm nữa, tránh trùng
  if (normalizedOptions.value.some(o => o.value === '' || /Tất cả\s*$/.test(String(o.text ?? o.label)))) return null
  /* QUY CHUẨN: ô chọn trong form KHÔNG bắt buộc → chọn xong phải bỏ chọn được về “Chưa chọn” (mục đầu danh sách, hoặc xóa trắng chữ rồi rời ô).
     Tự bật khi: chọn 1, nằm trong trường form, không bắt buộc, có placeholder (ô có trạng thái chưa chọn), không đặt :clearable="false".
     Đặt empty-option để đổi chữ (VD “Chưa giao”, “Giao sau khi duyệt”). Ô lọc trên thanh công cụ dùng “…: Tất cả”. */
  const auto = inField && props.placeholder && props.clearable !== false ? 'Chưa chọn' : ''
  const label = props.emptyOption || (/Tất cả\s*$/.test(props.placeholder) ? 'Tất cả' : '') || auto
  return label ? { value: '', label, _all: true } : null
})
const filtered = computed(() => {
  const list = baseFiltered.value
  if (!allOption.value || (q.value.trim() && !matchText([allOption.value.label], q.value))) return list
  return [allOption.value, ...list]
})
const baseFiltered = computed(() => {
  if (q.value.trim()) return normalizedOptions.value.filter(o => matchText([o.label, o.description, o.search, ...props.columns.map(c => o[c.key])], q.value))   // bỏ dấu + chữ cái đầu (kqq → Khuất Quang Quân); tìm cả mô tả (VD email)
  if (props.collapsible) return visibleTree.value
  if (!props.recentKey || !recents.value.length) return normalizedOptions.value
  // Gần đây (chỉ giá trị còn trong danh sách, không bị khóa) → rồi phần còn lại
  const rec = recents.value.map(v => normalizedOptions.value.find(o => o.value === v && !o.disabled)).filter(Boolean)
  if (!rec.length) return normalizedOptions.value
  const set = new Set(rec.map(o => o.value))
  return [...rec.map(o => ({ ...o, _recent: true })), ...normalizedOptions.value.filter(o => !set.has(o.value))]
})
watch(q, () => { activeIdx.value = 0 })
// Tải xong (loading → false) khi đang mở: canh lại vị trí (danh sách đổi chiều cao) + chọn sẵn mục đang chọn
watch(() => props.loading, async v => { if (v || !listOpen.value) return; await nextTick(); placeList(); activeIdx.value = Math.max(0, filtered.value.findIndex(o => isSelected(o.value))) })
/* creatable: dòng “Thêm …” khi chữ gõ không trùng nhãn nào (không phân biệt hoa thường) và chưa chọn */
const createItem = computed(() => {
  const t = q.value.trim()
  if (!props.creatable || !t) return null
  const lc = t.toLowerCase()
  if (normalizedOptions.value.some(o => String(o.label).toLowerCase() === lc) || selectedValues.value.some(v => String(labelOf(v)).toLowerCase() === lc)) return null
  return { value: t, label: t, _create: true }
})

/* Độ rộng danh sách (quy chuẩn): TỐI THIỂU = bề rộng ô combobox · dữ liệu dài → giãn theo chữ tới LIST_MAX_W (rộng hơn ô) để đọc trọn,
   quá nữa thì xuống dòng · không bao giờ tràn mép màn hình: giãn sang phải không đủ chỗ → canh mép phải theo ô (giãn sang trái) */
const LIST_MAX_W = 480, EDGE = 8
const colTemplate = computed(() => props.columns.map(c => (c.width ? c.width + 'px' : 'minmax(120px, 1fr)')).join(' '))
const tableW = computed(() => props.columns.reduce((t, c) => t + (c.width || 160), 0) + (props.columns.length - 1) * 16 + 40)   // + khe cột 16 + đệm 2 bên (8 + 12) × 2
async function placeList() {
  const box = boxEl.value?.getBoundingClientRect(); if (!box) return
  const below = window.innerHeight - box.bottom
  const vw = window.innerWidth
  const minW = Math.min(Math.max(box.width, hasDesc.value ? 300 : 0, props.columns.length ? tableW.value : 0), vw - EDGE * 2)
  listStyle.value = {
    left: Math.max(EDGE, Math.min(box.left, vw - EDGE - minW)) + 'px',
    width: 'max-content',   // rộng theo chữ dài nhất (trong min / max) — không bị co theo khoảng trống còn lại bên phải
    minWidth: minW + 'px',
    maxWidth: Math.min(Math.max(box.width, LIST_MAX_W, props.columns.length ? tableW.value : 0), vw - EDGE * 2) + 'px',
    ...(below >= 300 ? { top: box.bottom + 4 + 'px' } : { bottom: window.innerHeight - box.top + 4 + 'px' }),
  }
  await nextTick()
  const w = listEl.value?.offsetWidth ?? 0
  if (w && box.left + w > vw - EDGE) listStyle.value = { ...listStyle.value, left: Math.max(EDGE, Math.min(box.right, vw - EDGE) - w) + 'px' }
}
function onBoxClick(e) {
  if (locked.value || e.target === triggerEl.value || e.target.closest('.ibox__clear-btn, .cb-tag__x')) return   // bấm ô nhập đã xử lý ở mousedown
  if (listOpen.value) closeList(); else { triggerEl.value?.focus(); openList() }
}
function onInputMouseDown() { if (locked.value) return; if (listOpen.value) closeList(); else openList() }
function onFocus() { /* không tự mở khi Tab vào — mở khi bấm / gõ / mũi tên */ }
/* Xóa trắng chữ trong ô rồi rời đi (Tab / bấm ra ngoài) = BỎ CHỌN — chỉ với ô có mục giá trị rỗng (emptyOption / “Tất cả”, tức ô không bắt buộc).
   Trước đây xóa chữ xong rời ô thì tên cũ hiện lại → người dùng tưởng không bỏ chọn được. Esc = hủy, giữ giá trị cũ. */
let typedSinceOpen = false
const clearing = ref(false)   // đã xóa trắng ô (Backspace / Delete khi ô đang trống) → chữ mờ đổi về placeholder, rời ô là bỏ chọn
function onInput(e) {
  typedSinceOpen = true
  q.value = e.target.value
  clearing.value = !q.value.trim()
  if (!listOpen.value) openList(false)
  activeIdx.value = filtered.value.length || createItem.value ? 0 : -1
}
function toggleList() { if (listOpen.value) closeList(); else openList() }
async function openList(resetQuery = true) {
  if (locked.value || listOpen.value) return
  if (resetQuery) q.value = ''
  typedSinceOpen = !resetQuery
  if (resetQuery) clearing.value = false
  if (props.collapsible) initCollapsed()
  listOpen.value = true; placeList()   // mở trước rồi mới canh vị trí → đo được bề rộng thật của danh sách
  emit('open')   // app tải dữ liệu khi mở (đặt :loading trong lúc chờ)
  activeIdx.value = Math.max(0, filtered.value.findIndex(o => isSelected(o.value)))
  await nextTick()
  listEl.value?.querySelector('.cb-list__item--selected')?.scrollIntoView({ block: 'nearest' })
  document.addEventListener('mousedown', onOutside, true)
  window.addEventListener('resize', placeList)
  window.addEventListener('scroll', onScroll, true)
}
function closeList() {
  if (typedSinceOpen && !q.value.trim() && !props.multiple && allOption.value && hasValue.value && !locked.value) emitValue('')
  typedSinceOpen = false; clearing.value = false
  listOpen.value = false
  q.value = ''
  tagFocus.value = false
  document.removeEventListener('mousedown', onOutside, true)
  window.removeEventListener('resize', placeList)
  window.removeEventListener('scroll', onScroll, true)
}
function onScroll(e) { if (!listEl.value?.contains(e.target)) closeList() }   // cuộn trang → đóng (tránh danh sách lệch khỏi ô)
function onOutside(e) { if (!listEl.value?.contains(e.target) && !boxEl.value?.contains(e.target)) closeList() }
function choose(opt) {
  if (!opt || opt.disabled) return
  if (!opt._all && !(props.multiple && isSelected(opt.value))) rememberRecent(opt.value)
  if (opt._create) emit('create', opt.value)   // thêm giá trị mới: app thêm vào danh sách gốc (và lưu lại cho lần sau)
  if (props.multiple) { toggleValue(opt.value); q.value = ''; triggerEl.value?.focus(); return }   // chọn nhiều: giữ danh sách mở để chọn tiếp
  typedSinceOpen = false
  emitValue(opt.value); closeList(); triggerEl.value?.focus()
}
function move(d) {
  const n = filtered.value.length + (createItem.value ? 1 : 0); if (!n) return
  activeIdx.value = (activeIdx.value + d + n) % n
  nextTick(() => listEl.value?.querySelector('.cb-list__item--active')?.scrollIntoView({ block: 'nearest' }))
}
function onKey(e) {
  if (e.key !== 'Backspace') tagFocus.value = false
  // Ô chọn 1 đang mở, ô trống (tên đang chọn chỉ hiện mờ): Backspace / Delete = muốn bỏ chọn → rời ô (Tab / bấm ra ngoài) là về “Chưa chọn”
  if ((e.key === 'Backspace' || e.key === 'Delete') && !props.multiple && listOpen.value && !q.value && hasValue.value && allOption.value && !locked.value) {
    e.preventDefault(); typedSinceOpen = true; clearing.value = true; activeIdx.value = 0; return   // Enter lúc này = chọn “Chưa chọn” (mục đầu)
  }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!listOpen.value) openList(); else move(e.key === 'ArrowDown' ? 1 : -1) }
  else if (e.key === 'Enter') { e.preventDefault(); if (!listOpen.value) openList(); else choose(filtered.value[activeIdx.value] ?? createItem.value) }
  // Cây co / giãn: → mở nhánh, ← thu gọn nhánh của mục đang trỏ
  else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && props.collapsible && listOpen.value && !searching.value) {
    const o = filtered.value[activeIdx.value]
    if (o?.parent && collapsed.value.has(o.value) === (e.key === 'ArrowRight')) { e.preventDefault(); toggleNode(o.value) }
  }
  // Backspace khi ô trống: lần 1 làm sáng thẻ cuối, lần 2 bỏ thẻ đó (tránh lỡ tay xóa — như Vaadin)
  else if (e.key === 'Backspace' && props.multiple && !q.value && selectedValues.value.length && !locked.value) {
    e.preventDefault()
    if (!tagFocus.value) tagFocus.value = true
    else toggleValue(selectedValues.value[selectedValues.value.length - 1])
  }
  else if ((e.key === 'F9' || e.key === 'F3') && listOpen.value && slotsFooter()) { e.preventDefault(); const t = q.value.trim(); closeList(); emit(e.key === 'F9' ? 'add' : 'quick-search', t) }   // dạng bảng: phím tắt chân danh sách
  else if (e.key === 'Escape' && listOpen.value) { e.preventDefault(); e.stopPropagation(); typedSinceOpen = false; closeList(); triggerEl.value?.focus() }
  else if (e.key === 'Tab' && listOpen.value) closeList()
}
onBeforeUnmount(closeList)

const fe = useFieldError()
const boxClass = computed(() => ({
  'ibox--ghost':     props.ghost,
  'ibox--no-border': !props.ghost && !props.outline,
  'ibox--error':     props.state === 'error' || !!fe?.hasError.value,
  'ibox--success':   props.state === 'success',
  'ibox--warning':   props.state === 'warning',
  'ibox--disabled':  props.state === 'disabled' || props.disabled,
  'ibox--readonly':  props.state === 'readonly',
  'ibox--sm':        props.size === 'sm',
  'ibox--focus':     listOpen.value,
  'ibox--tags':      props.multiple && selectedValues.value.length > 0,
}))
</script>

<style scoped>
/* Avatar trong tag đã chọn / logo vuông (avatarSquare) — dòng danh sách người dùng AppAvatar 32px */
.cb-avatar { flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; overflow: hidden; box-sizing: border-box; border: 1px solid var(--stroke-neutral-light); display: inline-flex; }
.cb-avatar img, .cb-avatar span { width: 100%; height: 100%; object-fit: cover; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: var(--fw-semibold); color: var(--text-primary); line-height: 1; }
.cb-field { flex: 1; min-width: 0; height: 100%; display: flex; align-items: center; gap: 4px; overflow: hidden; }
.cb-trigger {
  flex: 1; min-width: 40px; padding: 0;
  border: none; background: none; text-align: left; cursor: pointer;
  text-overflow: ellipsis;
}
.cb-trigger--typing { cursor: text; }
.cb-trigger--tight { min-width: 8px; }   /* chọn nhiều, đang đóng: thẻ dùng gần hết bề rộng */
.cb-trigger[readonly], .cb-trigger:disabled { cursor: default; }
.cb-chevron { transition: transform 0.15s; }
.cb-chevron--open { transform: rotate(180deg); }
.cb-tags { display: inline-flex; gap: 4px; overflow: hidden; vertical-align: middle; flex: 0 1 auto; min-width: 0; }
/* Thẻ cuối được co + cắt “…” khi 1 thẻ cũng không đủ chỗ; lúc đo thì giữ nguyên bề rộng thật */
.cb-tags:not(.cb-tags--measure) .cb-tag:last-child { flex-shrink: 1; min-width: 0; }
.cb-tag__label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
/* Chọn nhiều — Figma MDS “Combobox Multiple” (6019:50293): ô lề trái 4px (tính cả viền 1px), thẻ Tag Small cao = ô − 8 (32 → 24 · Nhỏ 20 · Rộng 28) */
.ibox--tags { --cb-tag-h: calc(var(--input-height) - 8px); padding-left: 3px; }
.ibox--tags.ibox--sm { --cb-tag-h: calc(var(--input-height) - 12px); }
.cb-tag {
  /* Tag Small: nền Neutral Light, viền 1px Stroke/Neutral · bo Radius/Inner (bo lồng nhau: ô 8 − đệm 2 = 6; Nhỏ 6 − 2 = 4) · đệm ngang 8 · chữ ↔ × 6 · thẻ cách nhau 4 (gap của .cb-tags) */
  display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; box-sizing: border-box;
  height: var(--cb-tag-h, 24px); padding: 0 8px; border-radius: var(--radius-inner);
  background: var(--bg-neutral-light); border: 1px solid var(--stroke-neutral);
  font-size: var(--text-body); font-weight: var(--fw-medium); line-height: 18px; color: var(--text-primary);   /* Figma Body Small 12 → giữ 13px theo quy chuẩn chữ tối thiểu */
  transition: background 0.12s, border-color 0.12s;
}
.cb-tag--custom { border-style: dashed; background: var(--bg-white); }   /* tự nhập (creatable) */
/* Thẻ đếm “Tag More”: ô vuông chứa số mục ẩn + 2 mép thẻ xếp phía sau (Figma “Subtract” 8×24, lệch nhau 4px) */
.cb-tag.cb-tag--more { position: relative; justify-content: center; min-width: var(--cb-tag-h, 24px); padding: 0 6px; margin-left: 8px; cursor: default; }
.cb-tag--more::before, .cb-tag--more::after { content: ''; position: absolute; top: -1px; bottom: -1px; width: 8px; background: url('../assets/tag-stack.svg') no-repeat center / 100% 100%; }
.cb-tag--more::before { left: -9px; }
.cb-tag--more::after  { left: -5px; }
/* Backspace lần 1: thẻ cuối sáng màu brand (lần 2 mới bỏ) */
.cb-tag.cb-tag--focus { border-color: var(--stroke-brand); background: var(--bg-brand-light); color: var(--text-brand); }
.cb-tag__ic { font-size: 12px; color: var(--icon-neutral); }
.cb-avatar--tag { width: 14px; height: 14px; margin-right: 2px; }   /* giữ viền 1px như mọi avatar người */
.cb-avatar--tag img, .cb-avatar--tag span { font-size: 7px; }
.cb-avatar--square { border-radius: 4px; border: none; background: transparent; }
.cb-avatar--square img { object-fit: contain; background: transparent; }   /* logo: không nền, không viền */
.cb-avatar--tag.cb-avatar--square { border-radius: 3px; }
.cb-list__create { color: var(--text-brand); }
.cb-list__create-link { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-link); }   /* chọn 1: link “Nhấn Enter để thêm mới” (Figma) */
/* Split: ô phải ngăn vạch, cao bằng ô · icon 16 */
.cb-split { display: inline-flex; align-items: center; justify-content: center; align-self: stretch; flex-shrink: 0; width: calc(var(--input-height) - 2px); margin: 0 -8px 0 0;
  border: none; border-left: 1px solid var(--stroke-neutral); border-radius: 0 calc(var(--radius-default) - 1px) calc(var(--radius-default) - 1px) 0; background: transparent; color: var(--icon-neutral); cursor: pointer; }
.cb-split .ti { font-size: 16px; }
.cb-split:hover:not(:disabled) { background: var(--bg-neutral-light); }
.ibox:focus-within .cb-split, .ibox:hover .cb-split { border-left-color: var(--stroke-brand); }
/* Dạng bảng (Figma Combobox Single › Dạng bảng): hàng tiêu đề nền xám nhạt chữ đậm · dòng kẻ ngang · chân danh sách link */
.cb-thead, .cb-tr { display: grid; grid-template-columns: var(--cb-cols); column-gap: 16px; width: 100%; }
.cb-thead { padding: 0 calc(var(--menu-pad) + var(--menu-item-px)); min-height: var(--menu-item-h); align-items: center; background: var(--bg-neutral-light); border-bottom: 1px solid var(--stroke-neutral-light);
  font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.cb-th, .cb-td { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: var(--text-body); line-height: var(--text-body-lh); }
.cb-td { color: var(--text-primary); }
.cb-list--table .cb-list__item--selected .cb-td { color: var(--text-brand); font-weight: var(--fw-semibold); }
.cb-list--table { overflow-x: auto; }   /* màn hẹp hơn bảng → cuộn ngang cả tiêu đề lẫn dòng */
.cb-list--table .cb-thead, .cb-list--table .cb-list__scroll { min-width: max-content; }
.cb-list--table .cb-list__scroll { padding: 0; gap: 0; overflow-y: auto; }
.cb-list--table .cb-list__item { min-height: calc(var(--menu-item-h) + 4px); padding: 6px calc(var(--menu-pad) + var(--menu-item-px)); border-radius: 0; border-bottom: 1px solid var(--stroke-neutral-light); }
.cb-list--table .cb-list__item:last-child { border-bottom: none; }
.cb-list__foot { display: flex; align-items: center; gap: 12px; padding: 8px calc(var(--menu-pad) + var(--menu-item-px)); border-top: 1px solid var(--stroke-neutral-light); background: var(--bg-neutral-light); }
.cb-list__create-ic { color: var(--icon-brand); }
.cb-tag__x { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; color: var(--icon-neutral); }
.cb-tag__x .ti { font-size: 12px; }   /* Figma icon × 12px */
.cb-tag__x:hover { color: var(--text-primary); }

/* ── Danh sách xổ xuống — Figma MDS Dropdown Menu (6019:42469): khung trắng bo 12px + bóng Bottom 12, đệm 12px, item cách nhau 8px;
   item bo góc, đệm ngang 12px; hover / phím ↑↓ = nền brand nhạt; đã chọn = nền brand nhạt + chữ brand đậm (+ ✓ khi chọn nhiều) ── */
.cb-list {
  position: fixed; z-index: 9600;
  display: flex; flex-direction: column;
  background: var(--bg-white); border-radius: var(--menu-radius); box-shadow: var(--shadow-popover);
  overflow: hidden;
}
.cb-list__scroll { max-height: 320px; overflow-y: auto; padding: var(--menu-pad); display: flex; flex-direction: column; gap: var(--menu-gap); }
.cb-list__group { margin: 0; padding: 0 var(--menu-item-px); font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); color: var(--text-secondary); }
/* Tách nhóm bằng Divider: 1 dòng như item, nằm trong đệm 12px, cách item / nhãn nhóm 4px (½ --menu-gap) */
.cb-list__group--sep { margin-top: var(--menu-sep-my); padding-top: var(--menu-sep-my); border-top: 1px solid var(--stroke-divider); }
.cb-list__loading { display: flex; align-items: center; justify-content: center; padding: 24px 0; }
.cb-list__empty { margin: 0; padding: 6px var(--menu-item-px); font-size: var(--text-body); color: var(--text-secondary); }
.cb-list__item {
  display: flex; align-items: center; gap: var(--menu-item-gap); flex-shrink: 0;
  width: 100%; min-height: var(--menu-item-h); padding: 0 var(--menu-item-px);   /* 1 dòng = ĐÚNG --menu-item-h (32 · Rộng 36) ở mọi Font size — không cộng đệm dọc (đệm 6 + chữ 22 ở cỡ Trung bình / Lớn → 34) */
  border: none; border-radius: var(--menu-radius); background: transparent;
  text-align: left; cursor: pointer; font-family: inherit;
  transition: background 0.12s;
}
.cb-list__item--person { min-height: var(--menu-item-h-2); }   /* dòng có avatar 32px → cao Fix-Height-2-Line (48 · Rộng 52) */
.cb-list__item--active { background: var(--bg-brand-light); }
.cb-list__item--selected { background: var(--bg-brand-light); }
/* Nhiều mục đã chọn nằm liền nhau → nền nối thành 1 khối: chỉ bo 2 góc trên của mục đầu, 2 góc dưới của mục cuối, mục giữa không bo */
.cb-list__item--selected + .cb-list__item--selected { border-top-left-radius: 0; border-top-right-radius: 0; }
.cb-list__item--selected:has(+ .cb-list__item--selected) { border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
.cb-list__item:active:not(:disabled) { background: color-mix(in srgb, var(--bg-brand) 12%, var(--bg-white)); }
.cb-list__item:disabled { opacity: 0.5; cursor: not-allowed; }
.cb-list__text { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.cb-list__label { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
/* Mục 2 dòng (có mô tả): cao theo nội dung — đệm 6 + 20 + khe 2 + 20 + 6, KHÔNG theo chiều cao mục 1 dòng của mật độ (Nhỏ / Rộng) */
.cb-list__item:has(.cb-list__desc) { min-height: 0; padding-top: 6px; padding-bottom: 6px; align-items: flex-start; }
.cb-list__item--selected .cb-list__label { color: var(--text-brand); font-weight: var(--fw-semibold); }
.cb-list__desc { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); white-space: normal; }
.cb-list__check { color: var(--icon-brand); font-size: 16px; flex-shrink: 0; }
/* Dạng cây */
.cb-list__tree { font-size: 14px; flex-shrink: 0; color: var(--icon-neutral); margin-right: -2px; }
.cb-list__toggle { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex-shrink: 0; margin: 0 -2px 0 -4px;
  border-radius: var(--radius-sm); color: var(--icon-neutral); font-size: 14px; cursor: pointer; }
.cb-list__toggle:hover { background: var(--bg-brand-light-hover); color: var(--icon-neutral); }
.cb-list__toggle--leaf { cursor: default; }
.cb-list__toggle--leaf:hover { background: none; }
.cb-list__item--parent .cb-list__label { font-weight: var(--fw-semibold); }
</style>
