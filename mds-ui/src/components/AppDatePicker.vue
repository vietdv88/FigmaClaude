<template>
  <!-- Ô chọn thời gian nâng cao — Figma ❖ Date Time Picker (Section 15258:153109).
       type: date · week · month · quarter · half (6 tháng) · year · time · datetime  ·  range: chọn khoảng (2 bảng cạnh nhau)
       presets (chỉ date + range): danh sách chọn nhanh bên trái (7 ngày qua, Tháng này…) · time + range: lưới khung giờ 30 phút -->
  <div ref="boxEl" class="ibox dp-box" :style="boxStyle" v-bind="$attrs" :class="{ 'ibox--disabled': disabled, 'ibox--readonly': readonly, 'dp-box--open': open, 'dp-box--typeable': typeable }" @click="onBoxClick">
    <!-- date / time / datetime (chọn 1): gõ trực tiếp được (DD/MM/YYYY · HH:mm · DD/MM/YYYY HH:mm) — Enter / rời ô để nhận; các type khác bấm để chọn -->
    <input ref="inputEl" class="ibox__native dp-box__text" :value="typeable ? text : display" :placeholder="placeholder || (typeable ? TYPE_HINT[type] : PLACEHOLDER[type])" :readonly="!typeable || readonly" :disabled="disabled"
      :aria-expanded="String(open)" aria-haspopup="dialog" @input="text = typeable ? onMaskedInput($event, type, seconds) : $event.target.value" @focus="typeable && openPanel()"
      @keydown.enter.prevent="typeable ? commitText(true) : toggle()" @keydown.down.prevent="openPanel" @keydown.tab="typeable && commitText(true)" @blur="typeable && commitText(false)" />
    <button v-if="clearable && hasValue && !disabled && !readonly" type="button" class="ibox__icon ibox__icon--clear ibox__clear-btn" tabindex="-1" aria-label="Xóa" @click.stop="clear"><TIcon name="x" /></button>
    <TIcon :name="type === 'time' ? 'clock' : 'calendar'" class="ibox__icon" />
  </div>

  <Teleport to="body">
    <div v-if="open" ref="panelEl" class="dp" :class="[`dp--${type}`, { 'dp--range': range }]" :style="panelStyle" role="dialog" :aria-label="PLACEHOLDER[type]" @mousedown.prevent>
      <div class="dp__body">
        <!-- Chọn nhanh (khoảng ngày) -->
        <ul v-if="showPresets" class="dp__presets">
          <li v-for="p in PRESETS" :key="p.id"><button type="button" class="dp__preset" :class="{ 'dp__preset--on': presetOn === p.id }" @click="applyPreset(p)">{{ p.label }}</button></li>
        </ul>

        <!-- Lưới khung giờ (time + range) -->
        <div v-if="type === 'time' && range" class="dp__pane">
          <div class="dp__slots">
            <button v-for="s in SLOTS" :key="s" type="button" class="dp-cell dp-cell--slot" :class="slotClass(s)" @mouseenter="hoverSlot = s" @mouseleave="hoverSlot = ''" @click="pickSlot(s)">{{ s }}</button>
          </div>
        </div>

        <template v-else>
          <div v-for="(pane, pi) in (type === 'time' ? [] : panes)" :key="pi" class="dp__pane">
            <!-- Header: ‹‹ ‹ [tháng] [năm] › ›› -->
            <div class="dp__head">
              <span class="dp__nav">
                <button v-if="pi === 0" type="button" class="btn-icon btn-icon--sm" :aria-label="BIG_STEP_LABEL[view]" v-tip="BIG_STEP_LABEL[view]" @click="shift(-1, true)"><TIcon name="chevrons-left" /></button>
                <button v-if="pi === 0 && view === 'days'" type="button" class="btn-icon btn-icon--sm" aria-label="Tháng trước" v-tip="'Tháng trước'" @click="shift(-1)"><TIcon name="chevron-left" /></button>
              </span>
              <span class="dp__title">
                <template v-if="view === 'days'">
                  <button type="button" class="dp__title-btn" @click="view = 'months'">Thg {{ pane.getMonth() + 1 }}</button>
                  <button type="button" class="dp__title-btn" @click="view = 'years'">{{ pane.getFullYear() }}</button>
                </template>
                <button v-else-if="view === 'years'" type="button" class="dp__title-btn" @click="view = 'decades'">{{ decadeOf(pane) }} - {{ decadeOf(pane) + 9 }}</button>
                <span v-else-if="view === 'decades'" class="dp__title-btn dp__title-btn--static">{{ centuryOf(pane) }} - {{ centuryOf(pane) + 99 }}</span>
                <button v-else type="button" class="dp__title-btn" @click="view = 'years'">{{ pane.getFullYear() }}</button>
              </span>
              <span class="dp__nav dp__nav--end">
                <button v-if="pi === panes.length - 1 && view === 'days'" type="button" class="btn-icon btn-icon--sm" aria-label="Tháng sau" v-tip="'Tháng sau'" @click="shift(1)"><TIcon name="chevron-right" /></button>
                <button v-if="pi === panes.length - 1 && view !== 'time'" type="button" class="btn-icon btn-icon--sm" :aria-label="BIG_STEP_LABEL[view].replace('trước', 'sau')" v-tip="BIG_STEP_LABEL[view].replace('trước', 'sau')" @click="shift(1, true)"><TIcon name="chevrons-right" /></button>
              </span>
            </div>
            <div class="dp__divider" />

            <!-- Ngày / tuần -->
            <div v-if="view === 'days'" class="dp__days" @mouseleave="hover = null">
              <span v-for="(d, i) in WEEKDAYS" :key="d" class="dp__wd" :class="{ 'dp__wd--sun': i === 6 }">{{ d }}</span>
              <button v-for="c in daysOf(pane)" :key="c.key" type="button" class="dp-cell" :class="cellClass(c)" @mouseenter="hover = c.ord" @click="pick(c)">{{ c.label }}</button>
            </div>

            <!-- Tháng / quý / 6 tháng / năm / thập kỷ -->
            <div v-else-if="view !== 'time'" class="dp__grid" :class="`dp__grid--${view}`" @mouseleave="hover = null">
              <button v-for="c in gridOf(pane)" :key="c.key" type="button" class="dp-cell dp-cell--wide" :class="cellClass(c)" @mouseenter="hover = c.ord" @click="pick(c)">
                <template v-if="view === 'decades'"><span>{{ c.label }}</span><span>{{ c.label2 }}</span></template>
                <template v-else>{{ c.label }}</template>
              </button>
            </div>
          </div>

          <!-- Cột giờ : phút : giây (time · datetime) — time: chỉ khối này (giờ đang chọn ở trên + các cột), không có lịch -->
          <div v-if="type === 'time' || type === 'datetime'" class="dp__pane dp__pane--time">
            <div class="dp__head dp__head--time"><span class="dp__title-btn dp__title-btn--static">{{ timeText(draftTime) }}</span></div>
            <div class="dp__divider" />
            <div class="dp__cols">
              <div v-for="(col, ci) in TIME_COLS" :key="ci" :ref="el => (colEls[ci] = el)" class="dp__col">
                <button v-for="n in col" :key="n" type="button" class="dp-cell dp-cell--time" :class="{ 'dp-cell--sel': draftTime[ci] === n }" @click="setTime(ci, n)">{{ pad(n) }}</button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Chân: Hôm nay / Tháng này… (chọn 1) · Bây giờ + Đồng ý (giờ) · Đồng ý (khoảng có chọn nhanh, ngày giờ) -->
      <template v-if="footer">
        <div class="dp__divider" />
        <div class="dp__foot" :class="{ 'dp__foot--split': needConfirm && nowLabel }">
          <button v-if="nowLabel" type="button" class="btn btn--sm btn--text" :class="{ 'dp__now--full': !needConfirm }" @click="pickNow">{{ nowLabel }}</button>
          <button v-if="needConfirm" type="button" class="btn btn--sm btn--primary" :disabled="!canConfirm" @click="confirm">Đồng ý</button>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import TIcon from './TIcon.vue'
import { vTip } from '../utils/tooltip.js'
import { parseDateText, parseTimeText, parseDateTimeText, onMaskedInput } from '../utils/dateInput.js'

const props = defineProps({
  /** date 'YYYY-MM-DD' · week 'YYYY-MM-DD' (thứ 2 đầu tuần) · month 'YYYY-MM' · quarter 'YYYY-Q1' · half 'YYYY-H1' · year 'YYYY' · time 'HH:mm:ss' · datetime 'YYYY-MM-DDTHH:mm:ss' · range → [đầu, cuối] */
  modelValue:  { type: [String, Array], default: '' },
  type:        { type: String,  default: 'date' },
  range:       { type: Boolean, default: false },
  /** Danh sách chọn nhanh bên trái (type="date" + range) */
  presets:     { type: Boolean, default: false },
  placeholder: { type: String,  default: '' },
  clearable:   { type: Boolean, default: true },
  disabled:    { type: Boolean, default: false },
  readonly:    { type: Boolean, default: false },
  /** time / datetime: có cột giây (HH:mm:ss) — false → HH:mm */
  seconds:     { type: Boolean, default: true },
})
defineOptions({ inheritAttrs: false })   // gốc gồm ô + bảng (Teleport) → class / style truyền vào gắn cho ô
const emit = defineEmits(['update:modelValue', 'change'])

const PLACEHOLDER = { date: 'Chọn ngày', week: 'Chọn tuần', month: 'Chọn tháng', quarter: 'Chọn quý', half: 'Chọn 6 tháng', year: 'Chọn năm', time: 'Chọn giờ', datetime: 'Chọn ngày giờ' }
const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const BIG_STEP_LABEL = { days: 'Năm trước', months: 'Năm trước', quarters: 'Năm trước', halves: 'Năm trước', years: '10 năm trước', decades: '100 năm trước', time: '' }
const TIME_ALL = [Array.from({ length: 24 }, (_, i) => i), Array.from({ length: 60 }, (_, i) => i), Array.from({ length: 60 }, (_, i) => i)]
const TIME_COLS = computed(() => (props.seconds ? TIME_ALL : TIME_ALL.slice(0, 2)))
const TYPE_HINT = { date: 'DD/MM/YYYY', time: 'HH:MM', datetime: 'DD/MM/YYYY HH:MM' }
/* Độ rộng mặc định theo dữ liệu dài nhất của type (ch ≈ 1 chữ số) + 72px (đệm 12/8 · viền · nút xóa · icon) — không giãn hết cột.
   class / style truyền vào (vd. style="width:100%") vẫn ghi đè được. */
const WIDTH_CH = { date: 9, week: 23, month: 8.5, quarter: 9.5, half: 18, year: 8, time: 6, datetime: 13.5 }
const RANGE_CH = { date: 19, week: 47, month: 15.5, quarter: 20, half: 37, year: 10, time: 10.5, datetime: 28 }
const boxStyle = computed(() => {
  const ch = (props.range ? RANGE_CH : WIDTH_CH)[props.type] + (props.seconds && (props.type === 'time' || props.type === 'datetime') ? 2.5 * (props.range ? 2 : 1) : 0)
  return { width: `calc(${ch}ch + 72px)`, maxWidth: '100%' }
})
const SLOTS = (() => { const out = []; for (let c = 0; c < 6; c++) for (let r = 0; r < 8; r++) { const m = (c * 8 + r) * 30; out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`) } return out })()
const PRESETS = [
  { id: '7d', label: '7 ngày qua' }, { id: '30d', label: '30 ngày qua' }, { id: 'tw', label: 'Tuần này' }, { id: 'lw', label: 'Tuần trước' },
  { id: 'tm', label: 'Tháng này' }, { id: 'lm', label: 'Tháng trước' }, { id: 'ty', label: 'Năm nay' }, { id: 'ly', label: 'Năm trước' },
]

/* ── Ngày ↔ số thứ tự (so sánh / khoảng) ── */
function pad(n) { return String(n).padStart(2, '0') }
const DAY = 86400000
const dOrd = d => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY)
const ordDate = o => { const u = new Date(o * DAY); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()) }
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parseYmd = s => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null }
const monday = d => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x }
const isoWeek = d => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / DAY + 1) / 7) }
const decadeOf = d => Math.floor(d.getFullYear() / 10) * 10
const centuryOf = d => Math.floor(d.getFullYear() / 100) * 100
const today = () => new Date(new Date().setHours(0, 0, 0, 0))

/* Giá trị chuỗi ↔ số thứ tự theo đơn vị của type */
const unit = computed(() => ({ date: 'day', datetime: 'day', week: 'day', month: 'month', quarter: 'quarter', half: 'half', year: 'year' }[props.type]))
function toOrd(s) {
  if (!s) return null
  switch (unit.value) {
    case 'day': { const d = parseYmd(s); return d ? dOrd(d) : null }
    case 'month': { const m = /^(\d{4})-(\d{2})/.exec(s); return m ? +m[1] * 12 + +m[2] - 1 : null }
    case 'quarter': { const m = /^(\d{4})-Q(\d)/.exec(s); return m ? +m[1] * 4 + +m[2] - 1 : null }
    case 'half': { const m = /^(\d{4})-H(\d)/.exec(s); return m ? +m[1] * 2 + +m[2] - 1 : null }
    case 'year': return /^\d{4}$/.test(s) ? +s : null
  }
  return null
}
function fromOrd(o) {
  switch (unit.value) {
    case 'day': return ymd(ordDate(o))
    case 'month': return `${Math.floor(o / 12)}-${pad(o % 12 + 1)}`
    case 'quarter': return `${Math.floor(o / 4)}-Q${o % 4 + 1}`
    case 'half': return `${Math.floor(o / 2)}-H${o % 2 + 1}`
    case 'year': return String(o)
  }
}
/* Hiển thị trong ô */
function fmt(s) {
  if (!s) return ''
  const t = props.type
  if (t === 'time') return s
  if (t === 'datetime') { const d = parseYmd(s); return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${(s.split('T')[1] || '00:00:00').slice(0, props.seconds ? 8 : 5)}` : '' }
  if (t === 'date') { const d = parseYmd(s); return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : '' }
  if (t === 'week') { const d = parseYmd(s); if (!d) return ''; const e = new Date(d); e.setDate(e.getDate() + 6); return `Tuần ${isoWeek(d)} (${pad(d.getDate())}/${pad(d.getMonth() + 1)} – ${pad(e.getDate())}/${pad(e.getMonth() + 1)}/${e.getFullYear()})` }
  if (t === 'month') return s.replace(/^(\d{4})-(\d{2})$/, '$2/$1')
  if (t === 'quarter') return s.replace(/^(\d{4})-Q(\d)$/, 'Quý $2/$1')
  if (t === 'half') return s.replace(/^(\d{4})-H1$/, '6 tháng đầu năm $1').replace(/^(\d{4})-H2$/, '6 tháng cuối năm $1')
  return s
}
const hasValue = computed(() => (Array.isArray(props.modelValue) ? props.modelValue.some(Boolean) : !!props.modelValue))
const display = computed(() => {
  if (props.range) { const [a, b] = Array.isArray(props.modelValue) ? props.modelValue : []; return a || b ? `${fmt(a)} – ${fmt(b)}` : '' }
  return fmt(props.modelValue)
})

/* ── Trạng thái bảng ── */
const open = ref(false), boxEl = ref(null), panelEl = ref(null), panelStyle = ref({})
const BASE_VIEW = { date: 'days', week: 'days', datetime: 'days', month: 'months', quarter: 'quarters', half: 'halves', year: 'years', time: 'time' }
const view = ref('days'), cursor = ref(today()), hover = ref(null), hoverSlot = ref('')
const draft = ref([null, null])          // khoảng: số thứ tự đầu / cuối đang chọn
const draftDay = ref(null)               // datetime: ngày đang chọn
const draftTime = ref([0, 0, 0])
const draftSlots = ref(['', ''])
const presetOn = ref('')
const colEls = []
const showPresets = computed(() => props.presets && props.range && props.type === 'date')
const needConfirm = computed(() => props.type === 'time' || props.type === 'datetime' || showPresets.value || (props.range && props.type === 'time'))
const canConfirm = computed(() => (props.range ? (props.type === 'time' ? draftSlots.value.every(Boolean) : draft.value[0] != null && draft.value[1] != null) : props.type !== 'datetime' || draftDay.value != null))
const NOW_LABEL = { date: 'Hôm nay', week: 'Tuần này', month: 'Tháng này', quarter: 'Quý này', half: '', year: 'Năm nay', time: 'Bây giờ', datetime: 'Bây giờ' }
const nowLabel = computed(() => (props.range ? '' : NOW_LABEL[props.type]))
const footer = computed(() => needConfirm.value || !!nowLabel.value)

// Bảng hiển thị: 1 (chọn 1) hoặc 2 (khoảng: bảng phải = bảng trái + 1 tháng / 1 năm / 10 năm)
const panes = computed(() => {
  const c = cursor.value
  if (!props.range || props.type === 'time') return [c]
  const n = new Date(c)
  if (view.value === 'days') n.setMonth(n.getMonth() + 1)
  else if (view.value === 'years') n.setFullYear(n.getFullYear() + 10)
  else if (view.value === 'decades') n.setFullYear(n.getFullYear() + 100)
  else n.setFullYear(n.getFullYear() + 1)
  return [c, n]
})
function shift(dir, big = false) {
  const c = new Date(cursor.value)
  if (view.value === 'days' && !big) c.setMonth(c.getMonth() + dir)
  else if (view.value === 'years') c.setFullYear(c.getFullYear() + 10 * dir)
  else if (view.value === 'decades') c.setFullYear(c.getFullYear() + 100 * dir)
  else c.setFullYear(c.getFullYear() + dir)
  cursor.value = c
}

/* Ô ngày của 1 tháng: 6 hàng × 7, bắt đầu thứ 2 */
function daysOf(m) {
  const first = new Date(m.getFullYear(), m.getMonth(), 1), start = monday(first), out = []
  for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); out.push({ key: ymd(d), ord: dOrd(d), label: d.getDate(), other: d.getMonth() !== m.getMonth(), col: i % 7, date: d, kind: 'day' }) }
  return out
}
/* Lưới tháng / quý / 6 tháng / năm / thập kỷ */
function gridOf(p) {
  const y = p.getFullYear()
  if (view.value === 'months') return Array.from({ length: 12 }, (_, i) => ({ key: i, ord: y * 12 + i, label: `Thg ${i + 1}`, kind: 'month', y, i }))
  if (view.value === 'quarters') return Array.from({ length: 4 }, (_, i) => ({ key: i, ord: y * 4 + i, label: `Quý ${i + 1}`, kind: 'quarter' }))
  if (view.value === 'halves') return [{ key: 0, ord: y * 2, label: '6 Thg đầu năm', kind: 'half' }, { key: 1, ord: y * 2 + 1, label: '6 Thg cuối năm', kind: 'half' }]
  if (view.value === 'years') { const d0 = decadeOf(p); return Array.from({ length: 12 }, (_, i) => ({ key: i, ord: d0 - 1 + i, label: d0 - 1 + i, other: i === 0 || i === 11, kind: 'year' })) }
  const c0 = centuryOf(p); return Array.from({ length: 12 }, (_, i) => { const s = c0 - 10 + i * 10; return { key: i, ord: s, label: s, label2: s + 9, other: i === 0 || i === 11, kind: 'decade' } })
}
const todayOrd = computed(() => {
  const t = today()
  return { day: dOrd(t), month: t.getFullYear() * 12 + t.getMonth(), quarter: t.getFullYear() * 4 + Math.floor(t.getMonth() / 3), half: t.getFullYear() * 2 + (t.getMonth() < 6 ? 0 : 1), year: t.getFullYear(), decade: Math.floor(t.getFullYear() / 10) * 10 }
})
// Ô đang ở đúng đơn vị chọn của type? (VD type date đang xem lưới tháng để điều hướng → không tô chọn trong lưới tháng)
const KIND_UNIT = { day: 'day', month: 'month', quarter: 'quarter', half: 'half', year: 'year', decade: 'decade' }
function selRange() {
  if (props.range) {
    const [a, b] = draft.value
    if (a != null && b == null && hover.value != null && hoverKindMatches.value) return [Math.min(a, hover.value), Math.max(a, hover.value), true]
    if (a != null && b != null) return [Math.min(a, b), Math.max(a, b), false]
    if (a != null) return [a, a, false]
    return null
  }
  if (props.type === 'datetime') return draftDay.value != null ? [draftDay.value, draftDay.value] : null
  const o = toOrd(props.modelValue); if (o == null) return null
  return props.type === 'week' ? [o, o + 6] : [o, o]
}
const hoverKindMatches = computed(() => view.value === BASE_VIEW[props.type])
function cellClass(c) {
  const cls = []
  if (c.other) cls.push('dp-cell--other')
  const own = KIND_UNIT[c.kind] === unit.value || (c.kind === 'day' && unit.value === 'day')
  const tOrd = todayOrd.value[c.kind === 'day' ? 'day' : c.kind]
  const r = own ? selRange() : null
  // Tuần: rê vào 1 ngày → nền nhạt cả hàng tuần đó
  if (props.type === 'week' && c.kind === 'day' && hover.value != null && !props.range) {
    const hs = dOrd(monday(ordDate(hover.value)))
    if (c.ord >= hs && c.ord <= hs + 6 && !(r && c.ord >= r[0] && c.ord <= r[1])) cls.push('dp-cell--in', c.ord === hs ? 'dp-cell--start-soft' : '', c.ord === hs + 6 ? 'dp-cell--end-soft' : '')
  }
  if (r && c.ord >= r[0] && c.ord <= r[1] && !(c.other && c.kind === 'day' && props.range)) {
    const single = r[0] === r[1]
    if (single) cls.push('dp-cell--sel')
    else if (props.type === 'week' && !props.range) cls.push('dp-cell--band', c.ord === r[0] ? 'dp-cell--start' : '', c.ord === r[1] ? 'dp-cell--end' : '')
    else if (c.ord === r[0] || c.ord === r[1]) cls.push('dp-cell--sel', c.ord === r[0] ? 'dp-cell--start' : '', c.ord === r[1] ? 'dp-cell--end' : '')
    else cls.push('dp-cell--in')
  } else if (c.ord === tOrd && own && !c.other) cls.push('dp-cell--today')   // ngày của tháng khác (mờ) không viền “hôm nay”
  return cls
}

/* Chọn ô */
function pick(c) {
  // Đang điều hướng ở cấp cao hơn đơn vị chọn → đi xuống
  if (view.value === 'decades') { const d = new Date(cursor.value); d.setFullYear(c.ord + (c.ord % 10 ? 0 : 0)); cursor.value = d; view.value = 'years'; return }
  if (view.value === 'years' && props.type !== 'year') { const d = new Date(cursor.value); d.setFullYear(c.ord); cursor.value = d; view.value = BASE_VIEW[props.type] === 'days' ? 'months' : BASE_VIEW[props.type]; return }
  if (view.value === 'months' && BASE_VIEW[props.type] === 'days') { cursor.value = new Date(c.y, c.i, 1); view.value = 'days'; return }
  let ord = c.ord
  if (props.type === 'week') ord = dOrd(monday(ordDate(ord)))
  if (props.type === 'datetime') { draftDay.value = ord; return }
  if (props.range) {
    presetOn.value = ''
    const [a, b] = draft.value
    if (a == null || b != null) draft.value = [ord, null]
    else { draft.value = [Math.min(a, ord), Math.max(a, ord)]; if (!needConfirm.value) commitRange() }
    return
  }
  commit(fromOrd(ord))
}
function commit(v) { emit('update:modelValue', v); emit('change', v); close() }
function commitRange() {
  const [a, b] = draft.value
  let end = b
  if (props.type === 'week') end = b   // giá trị tuần = thứ 2 của tuần cuối
  commit([fromOrd(a), fromOrd(end)])
}

/* Giờ */
function timeText(t) { return t.slice(0, props.seconds ? 3 : 2).map(pad).join(':') }
function setTime(ci, n) { const t = [...draftTime.value]; t[ci] = n; draftTime.value = t }
function scrollCols() { nextTick(() => colEls.forEach((el, i) => { const b = el?.querySelectorAll('.dp-cell')[draftTime.value[i]]; if (b) el.scrollTop = b.offsetTop - el.offsetTop })) }

/* Khung giờ (time + range) */
function slotClass(s) {
  const [a, b] = draftSlots.value, h = hoverSlot.value
  const lo = a && !b && h ? (a < h ? a : h) : a, hi = a && !b && h ? (a < h ? h : a) : b
  if (!lo) return ''
  if (s === lo || s === hi) return 'dp-cell--sel'
  return hi && s > lo && s < hi ? 'dp-cell--in' : ''
}
function pickSlot(s) { const [a, b] = draftSlots.value; draftSlots.value = !a || b ? [s, ''] : (s < a ? [s, a] : [a, s]) }

/* Hôm nay / Bây giờ */
function pickNow() {
  const t = today(), now = new Date()
  if (props.type === 'time') { draftTime.value = [now.getHours(), now.getMinutes(), now.getSeconds()]; scrollCols(); return }
  if (props.type === 'datetime') { draftDay.value = dOrd(t); draftTime.value = [now.getHours(), now.getMinutes(), now.getSeconds()]; cursor.value = new Date(t.getFullYear(), t.getMonth(), 1); scrollCols(); return }
  const o = todayOrd.value
  const ord = { day: o.day, month: o.month, quarter: o.quarter, half: o.half, year: o.year }[unit.value]
  commit(fromOrd(props.type === 'week' ? dOrd(monday(t)) : ord))
}
function applyPreset(p) {
  const t = today(), y = t.getFullYear(), m = t.getMonth(), mon = monday(t)
  const R = {
    '7d': [new Date(y, m, t.getDate() - 6), t], '30d': [new Date(y, m, t.getDate() - 29), t],
    tw: [mon, new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6)], lw: [new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() - 7), new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() - 1)],
    tm: [new Date(y, m, 1), new Date(y, m + 1, 0)], lm: [new Date(y, m - 1, 1), new Date(y, m, 0)],
    ty: [new Date(y, 0, 1), new Date(y, 11, 31)], ly: [new Date(y - 1, 0, 1), new Date(y - 1, 11, 31)],
  }[p.id]
  draft.value = [dOrd(R[0]), dOrd(R[1])]; presetOn.value = p.id
  cursor.value = new Date(R[0].getFullYear(), R[0].getMonth(), 1)
}
function confirm() {
  if (!canConfirm.value) return
  if (props.type === 'time' && props.range) return commit([...draftSlots.value])
  if (props.type === 'time') return commit(timeText(draftTime.value))
  if (props.type === 'datetime') return commit(`${ymd(ordDate(draftDay.value))}T${timeText(draftTime.value)}`)
  commitRange()
}
function clear() { const v = props.range ? ['', ''] : ''; emit('update:modelValue', v); emit('change', v) }

/* Mở / đóng / vị trí */
function initDraft() {
  view.value = BASE_VIEW[props.type]; hover.value = null; presetOn.value = ''
  const v = props.modelValue
  if (props.type === 'time') {
    if (props.range) { draftSlots.value = Array.isArray(v) ? [v[0] || '', v[1] || ''] : ['', '']; return }
    const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(v || ''); draftTime.value = m ? [+m[1], +m[2], +(m[3] || 0)] : [0, 0, 0]; return
  }
  if (props.type === 'datetime') {
    const d = parseYmd(v); draftDay.value = d ? dOrd(d) : null
    const m = /T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(v || ''); draftTime.value = m ? [+m[1], +m[2], +(m[3] || 0)] : [0, 0, 0]
    cursor.value = d ? new Date(d.getFullYear(), d.getMonth(), 1) : new Date(today().getFullYear(), today().getMonth(), 1); return
  }
  const first = Array.isArray(v) ? v[0] : v
  draft.value = Array.isArray(v) ? [toOrd(v[0]), toOrd(v[1])] : [null, null]
  const o = toOrd(first), t = today()
  let c
  if (o == null) c = new Date(t.getFullYear(), t.getMonth(), 1)
  else if (unit.value === 'day') { const d = ordDate(o); c = new Date(d.getFullYear(), d.getMonth(), 1) }
  else if (unit.value === 'month') c = new Date(Math.floor(o / 12), o % 12, 1)
  else if (unit.value === 'quarter') c = new Date(Math.floor(o / 4), 0, 1)
  else if (unit.value === 'half') c = new Date(Math.floor(o / 2), 0, 1)
  else c = new Date(o, 0, 1)
  cursor.value = c
}
async function openPanel() {
  if (open.value || props.disabled || props.readonly) return
  initDraft(); open.value = true
  await nextTick(); place(); scrollCols()
  document.addEventListener('mousedown', onOutside, true); document.addEventListener('keydown', onKey, true)
  window.addEventListener('resize', place); window.addEventListener('scroll', onScroll, true)
}
function close() {
  open.value = false
  document.removeEventListener('mousedown', onOutside, true); document.removeEventListener('keydown', onKey, true)
  window.removeEventListener('resize', place); window.removeEventListener('scroll', onScroll, true)
}
function toggle() { open.value ? close() : openPanel() }
function onBoxClick(e) { if (typeable.value && e.target === inputEl.value) { openPanel(); return } toggle() }

/* Gõ trực tiếp (date · time · datetime, chọn 1) */
const inputEl = ref(null)
const typeable = computed(() => !props.range && ['date', 'time', 'datetime'].includes(props.type))
const text = ref('')
watch(display, v => { text.value = v }, { immediate: true })
/* Gõ nhanh: 20102026 / 20/10/2026 → 20/10/2026 · 1030 / 10:30 / 10h30 → 10:30 (xem utils/dateInput.js) */
function parseTyped(t) {
  const T = a => a.slice(0, props.seconds ? 3 : 2).map(pad).join(':')
  if (props.type === 'time') { const a = parseTimeText(t); return a ? T(a) : null }
  if (props.type === 'date') return parseDateText(t)
  const v = parseDateTimeText(t); return v ? `${v.date}T${T(v.time)}` : null
}
function commitText(closeAfter) {
  const t = text.value.trim()
  if (t === display.value) { if (closeAfter) close(); return }
  if (!t) { clear(); if (closeAfter) close(); return }
  const v = parseTyped(t)
  if (v) { emit('update:modelValue', v); emit('change', v); if (closeAfter) close() }
  else text.value = display.value   // gõ sai → trả lại giá trị cũ
}

function onOutside(e) { if (!panelEl.value?.contains(e.target) && !boxEl.value?.contains(e.target)) close() }
function onScroll(e) { if (!panelEl.value?.contains(e.target)) place() }
function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close() } }
function place() {
  const r = boxEl.value?.getBoundingClientRect(), el = panelEl.value; if (!r || !el) return
  const w = el.offsetWidth, h = el.offsetHeight, vw = window.innerWidth, vh = window.innerHeight
  const left = Math.max(8, Math.min(r.left, vw - w - 8))
  const top = r.bottom + 4 + h <= vh - 8 || r.top - 4 - h < 8 ? r.bottom + 4 : r.top - 4 - h
  panelStyle.value = { left: left + 'px', top: Math.max(8, top) + 'px' }
}
watch(view, () => nextTick(place))
onBeforeUnmount(close)
</script>

<style scoped>
.dp-box { cursor: pointer; }
.dp-box__text { cursor: pointer; text-overflow: ellipsis; }
.dp-box--typeable .dp-box__text { cursor: text; }
.dp-box--open { border-color: var(--stroke-brand); }
</style>

<style>
/* Bảng chọn (nằm ở <body>) — Figma Date Time Picker: nền trắng · bo 12 · bóng Bottom 12 · đệm 12 trên-dưới / 12 hai bên · ô 32×32 bo 8 */
.dp { position: fixed; z-index: var(--z-header-pop, 9600); display: flex; flex-direction: column; padding: 12px 0; max-width: calc(100vw - 16px); background: var(--bg-white); border-radius: var(--radius-dialog, 12px); box-shadow: var(--shadow-popover); font-family: var(--font-family); color: var(--text-primary); overflow-x: auto; }
.dp__body { display: flex; align-items: stretch; }
.dp__pane { display: flex; flex-direction: column; padding: 0 12px; }
.dp__pane + .dp__pane { border-left: 1px solid var(--stroke-divider); }
.dp__head { display: flex; align-items: center; justify-content: space-between; gap: 4px; min-height: 28px; }
.dp__head--time { justify-content: center; }
.dp__nav { display: flex; min-width: 56px; }
.dp__nav--end { justify-content: flex-end; }
.dp__nav .btn-icon { border-radius: var(--radius-sm, 4px); }
.dp__title { display: flex; align-items: center; justify-content: center; flex: 1; }
.dp__title-btn { height: 28px; padding: 0 8px; border: none; border-radius: var(--radius-default); background: transparent; font: inherit; font-size: var(--text-body); font-weight: var(--fw-medium); color: var(--text-primary); cursor: pointer; white-space: nowrap; }
.dp__title-btn:hover:not(.dp__title-btn--static) { background: var(--bg-neutral-light); }
.dp__title-btn--static { cursor: default; display: inline-flex; align-items: center; }
.dp__divider { height: 1px; margin: 12px 0; background: var(--stroke-divider); flex-shrink: 0; }
.dp__pane > .dp__divider { margin: 12px -12px; }
.dp__days { display: grid; grid-template-columns: repeat(7, 32px); row-gap: 4px; }
.dp__wd { display: inline-flex; align-items: center; justify-content: center; height: 32px; font-size: var(--text-caption); line-height: var(--text-caption-lh); color: var(--text-primary); }
.dp__wd--sun { color: var(--text-danger); }
.dp__grid { display: grid; grid-template-columns: repeat(4, 56px); row-gap: 12px; }
.dp__grid--quarters { grid-template-columns: repeat(4, 56px); }
.dp__grid--halves { grid-template-columns: repeat(2, 112px); }
/* Ô ngày / tháng / năm */
.dp-cell { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; height: 32px; min-width: 32px; padding: 0; border: 1px solid transparent; border-radius: var(--radius-default); background: transparent;
  font: inherit; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); cursor: pointer; font-feature-settings: 'tnum'; }
.dp-cell--wide { height: 40px; }
.dp__grid--decades .dp-cell { line-height: 15px; font-size: var(--text-body); }
.dp-cell:hover { background: var(--bg-neutral-light); }
.dp-cell--other { color: var(--text-disabled, var(--text-hint)); }
.dp-cell--today { border-color: var(--stroke-brand); color: var(--text-brand); font-weight: var(--fw-medium); }
.dp-cell--today:hover { background: var(--bg-brand-light-hover); }
.dp-cell--in, .dp-cell--in:hover { border-radius: 0; background: var(--bg-brand-light); color: var(--text-primary); }
.dp-cell--start-soft { border-top-left-radius: var(--radius-default); border-bottom-left-radius: var(--radius-default); }
.dp-cell--end-soft { border-top-right-radius: var(--radius-default); border-bottom-right-radius: var(--radius-default); }
.dp-cell--sel, .dp-cell--sel:hover, .dp-cell--band, .dp-cell--band:hover { background: var(--bg-brand); border-color: transparent; color: var(--text-white); font-weight: var(--fw-medium); }
.dp-cell--band { border-radius: 0; }
.dp-cell--start:not(.dp-cell--end) { border-top-right-radius: 0; border-bottom-right-radius: 0; }
.dp-cell--end:not(.dp-cell--start) { border-top-left-radius: 0; border-bottom-left-radius: 0; }
.dp-cell--band.dp-cell--start { border-top-left-radius: var(--radius-default); border-bottom-left-radius: var(--radius-default); }
.dp-cell--band.dp-cell--end { border-top-right-radius: var(--radius-default); border-bottom-right-radius: var(--radius-default); }
.dp-cell:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: 1px; }
/* Cột giờ : phút : giây — cuộn từng cột, ngăn bằng vạch */
.dp__pane--time { min-width: 0; }
.dp--time .dp__pane--time { flex: 1; }   /* chỉ chọn giờ: khối giờ lấp hết bề ngang, cột chia đều */
.dp--time .dp__col { flex: 1; }
.dp__cols { display: flex; height: 224px; }
.dp__col { display: flex; flex-direction: column; gap: 4px; width: 64px; padding: 0 8px; overflow-y: auto; scrollbar-width: none; }
.dp__col::-webkit-scrollbar { display: none; }
.dp__col + .dp__col { border-left: 1px solid var(--stroke-divider); }
.dp-cell--time { flex-shrink: 0; width: 100%; }
/* Khung giờ 30 phút */
.dp__slots { display: grid; grid-template-rows: repeat(8, 32px); grid-auto-flow: column; grid-auto-columns: 56px; row-gap: 4px; }
.dp-cell--slot { font-size: var(--text-body); }
/* Chọn nhanh */
.dp__presets { list-style: none; margin: -12px 0; padding: 12px 8px; border-right: 1px solid var(--stroke-divider); display: flex; flex-direction: column; gap: 4px; }
.dp__preset { width: 100%; min-height: 32px; padding: 0 12px; border: none; border-radius: var(--radius-default); background: transparent; text-align: left; font: inherit; font-size: var(--text-body); color: var(--text-primary); cursor: pointer; white-space: nowrap; }
.dp__preset:hover { background: var(--bg-brand-light); }
.dp__preset--on { background: var(--bg-brand-light); color: var(--text-brand); font-weight: var(--fw-semibold); }
/* Chân */
.dp__foot { display: flex; align-items: center; justify-content: flex-end; gap: var(--gap-control); padding: 0 12px; }
.dp__foot--split { justify-content: space-between; }
.dp__now--full { flex: 1; }
</style>
