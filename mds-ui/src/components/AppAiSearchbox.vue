<template>
  <!-- Ô tìm kiếm AI — Figma MDS “AI Searchbox” (17455:70653), Style Outline:
       viền gradient AI · icon Search Spark · chưa gõ: placeholder chữ gradient AI + huy hiệu “AI” · đã gõ: chữ thường + ✕ xóa + icon phân tích (Device Analytics)
       Hover: nền gradient AI 50, viền AI 700 · Focus: viền AI + quầng sáng · Disabled: nền Neutral Light, viền AI 300, chữ Hint
       Popup (Figma Quy chuẩn chung › Search Global engine):
       · Bấm icon phân tích → xem AI bóc tách được TRƯỜNG nào, GIÁ TRỊ gì (prop parsed) — kiểm tra trước khi tìm
       · Enter → “Kết quả tìm kiếm với AI”: dòng điều kiện đã bóc tách + kết quả theo nhóm (prop results) -->
  <label ref="boxEl" v-bind="$attrs" class="ais" :class="{ 'ais--typed': !!modelValue, 'ais--disabled': disabled }" :style="width ? { width: typeof width === 'number' ? width + 'px' : width } : null">
    <TIcon name="mds-search-spark" class="ais__icon" />
    <input ref="inputEl" class="ais__native" :value="modelValue" :placeholder="placeholder" :disabled="disabled" :aria-label="placeholder"
      :aria-expanded="String(!!panel)" aria-haspopup="dialog"
      @input="onInput" @keydown.enter.prevent="submit" @keydown.esc="onEsc" @focus="results && modelValue && submitted === modelValue && (panel = 'results')" />
    <template v-if="modelValue && !disabled">
      <button type="button" class="ais__btn" tabindex="-1" aria-label="Xóa nội dung tìm kiếm" @click.prevent="clear"><TIcon name="x" /></button>
      <button type="button" class="ais__btn" :class="{ 'ais__btn--on': panel === 'parsed' }" v-tip="analyzeLabel" :aria-label="analyzeLabel" :aria-pressed="panel === 'parsed'" @click.prevent="toggleParsed"><TIcon name="mds-device-analytics" /></button>
    </template>
    <!-- Huy hiệu AI: bấm được khi có @badge-click (VD chuyển về tìm kiếm thường) -->
    <button v-else-if="badgeTip" type="button" class="ais__badge ais__badge--btn" v-tip="badgeTip" :aria-label="badgeTip" :disabled="disabled" @click.prevent="$emit('badge-click')"><span class="ais__badge-t">AI</span></button>
    <span v-else class="ais__badge" aria-hidden="true"><span class="ais__badge-t">AI</span></span>
  </label>

  <Teleport to="body">
    <!-- Xem trường AI bóc tách: icon phân tích + “Trường: “giá trị”, …” -->
    <div v-if="panel === 'parsed'" ref="panelEl" class="ais-pop ais-pop--parsed" :style="popStyle" role="dialog" aria-label="Điều kiện AI bóc tách">
      <p v-if="analyzing" class="ais-cond"><TIcon name="mds-device-analytics" class="ais-cond__icon" /><span class="ais-muted">Đang phân tích câu tìm kiếm…</span></p>
      <p v-else-if="parsed.length" class="ais-cond"><TIcon name="mds-device-analytics" class="ais-cond__icon" /><span><template v-for="(f, i) in parsed" :key="f.label">{{ i ? ', ' : '' }}{{ f.label }}: “<b>{{ f.value }}</b>”</template></span></p>
      <p v-else class="ais-cond"><TIcon name="mds-device-analytics" class="ais-cond__icon" /><span class="ais-muted">Chưa bóc tách được điều kiện nào — thử ghi rõ hơn (VD “nhân viên ở Hà Nội”)</span></p>
    </div>

    <!-- Kết quả tìm kiếm với AI -->
    <div v-else-if="panel === 'results'" ref="panelEl" class="ais-pop ais-pop--results" :style="popStyle" role="dialog" aria-label="Kết quả tìm kiếm với AI">
      <div class="ais-res__head">
        <p class="ais-res__title"><TIcon name="mds-ai-sparkles" class="ais-res__spark" /><span class="text-ai-primary">Kết quả tìm kiếm với AI</span></p>
        <p v-if="parsed.length" class="ais-cond"><TIcon name="mds-device-analytics" class="ais-cond__icon" /><span><template v-for="(f, i) in parsed" :key="f.label">{{ i ? ', ' : '' }}{{ f.label }}: “<b>{{ f.value }}</b>”</template></span></p>
      </div>
      <div class="ais-res__body">
        <p v-if="loading" class="ais-res__empty ais-muted">AVA đang tìm…</p>
        <p v-else-if="!results?.length" class="ais-res__empty ais-muted">Không tìm thấy kết quả phù hợp với điều kiện trên.</p>
        <section v-for="g in (loading ? [] : results)" :key="g.key || g.title" class="ais-res__group">
          <h4 class="ais-res__gtitle">{{ g.title }}</h4>
          <div class="ais-res__items">
            <button v-for="it in g.items" :key="it.id" type="button" class="ais-res__item" @click="pick(it, g)">
              <AppAvatar v-if="it.avatar !== false && (it.avatar || it.name)" :src="it.avatar || ''" :name="it.name" :size="32" />
              <span class="ais-res__text">
                <span class="ais-res__name">{{ it.name }}</span>
                <span v-if="it.subtitle" class="ais-res__sub">{{ it.subtitle }}</span>
                <span v-if="it.meta" class="ais-res__meta">{{ it.meta }}</span>
              </span>
            </button>
            <button v-if="(g.total ?? g.items.length) > g.items.length" type="button" class="btn btn--link ais-res__more" @click="openMore(g)">Xem thêm</button>
          </div>
          <AppTag class="ais-res__count" color="neutral" :label="`${fmtNum(g.total ?? g.items.length)} kết quả`" />
        </section>
      </div>
    </div>
  </Teleport>
  <!-- “Xem thêm” của 1 nhóm → popup chỉ chứa kết quả của đúng nhóm đó (cùng popup với ô tìm kiếm toàn cục ở Global header): app nạp toàn bộ kết quả của nhóm theo @more(group, câu) -->
  <AppSearchResultsDialog v-if="more" :group-title="more.group.title" :keyword="more.q" :items="moreItems || []" :total="moreTotal" :loading="moreLoading || moreItems === null"
    @search="q => emit('more', more.group, q)" @select="it => { emit('select', it, more.group); more = null }" @close="more = null" />
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import TIcon from './TIcon.vue'
import AppAvatar from './AppAvatar.vue'
import AppTag from './AppTag.vue'
import AppSearchResultsDialog from './AppSearchResultsDialog.vue'
import { vTip } from '../utils/tooltip.js'
import { fmtNum } from '../utils/number.js'
import { ensureAiGradient } from '../utils/aiGradient.js'

defineOptions({ inheritAttrs: false })   // gốc gồm ô + popup (Teleport) → class / style truyền vào gắn cho ô
const props = defineProps({
  modelValue:   { type: String,  default: '' },
  placeholder:  { type: String,  default: 'Tìm kiếm thông minh' },
  disabled:     { type: Boolean, default: false },
  width:        { type: [Number, String], default: null },
  /** Tooltip của icon phân tích (đã gõ) */
  analyzeLabel: { type: String,  default: 'Xem điều kiện AI bóc tách' },
  /** Có giá trị → huy hiệu “AI” thành nút (VD “Chuyển về tìm kiếm thường”) → emit('badge-click') */
  badgeTip:     { type: String,  default: '' },
  /** Điều kiện AI bóc tách từ câu tìm kiếm: [{ label: 'Họ và tên', value: 'Trần Văn Bình' }, …] */
  parsed:       { type: Array,   default: () => [] },
  /** Đang bóc tách (sau emit 'analyze') */
  analyzing:    { type: Boolean, default: false },
  /** Kết quả theo nhóm: [{ key, title: 'Hồ sơ', total, items: [{ id, name, subtitle, meta, avatar }] }] — null = chưa tìm */
  results:      { type: Array,   default: null },
  loading:      { type: Boolean, default: false },
  /** Bề rộng popup kết quả (tối thiểu bằng ô) */
  panelWidth:   { type: Number,  default: 640 },
  /** Enter có mở popup “Kết quả tìm kiếm với AI” (kết quả theo nhóm) không. false = kết quả hiện ở CHÍNH màn hình (VD lọc bảng — TableHeader dùng false): Enter chỉ emit('submit') */
  resultsPanel: { type: Boolean, default: true },
  /** Popup “Xem thêm” của 1 nhóm: toàn bộ kết quả của nhóm đó [{ id, name, subtitle, meta, avatar }] (null = đang nạp) — app nạp khi nhận @more(group, câu hỏi) */
  moreItems:    { type: Array,   default: null },
  moreTotal:    { type: Number,  default: null },
  moreLoading:  { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'submit', 'analyze', 'clear', 'select', 'more', 'badge-click'])
const inputEl = ref(null), boxEl = ref(null), panelEl = ref(null)
const panel = ref(null)            // null | 'parsed' | 'results'
const submitted = ref('')
const popStyle = ref({})

function place() {
  const r = boxEl.value?.getBoundingClientRect(); if (!r) return
  const w = Math.min(Math.max(r.width, panel.value === 'results' ? props.panelWidth : r.width), window.innerWidth - 16)
  const left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8))
  popStyle.value = { top: r.bottom + 4 + 'px', left: left + 'px', width: panel.value === 'parsed' ? 'auto' : w + 'px', maxWidth: window.innerWidth - 16 + 'px', maxHeight: Math.max(160, window.innerHeight - r.bottom - 16) + 'px' }
}
async function open(kind) { panel.value = kind; await nextTick(); place() }
function close() { panel.value = null }

function onInput(e) { emit('update:modelValue', e.target.value); if (panel.value) close() }
function submit() {
  if (props.disabled || !props.modelValue.trim()) return
  submitted.value = props.modelValue
  emit('submit', props.modelValue.trim())
  if (props.resultsPanel) open('results'); else close()
}
function toggleParsed() {
  if (panel.value === 'parsed') return close()
  emit('analyze', props.modelValue.trim()); open('parsed')
}
const more = ref(null)   // { group, q } — popup “Xem thêm” đang mở
function openMore(g) { more.value = { group: g, q: props.modelValue.trim() }; close(); emit('more', g, more.value.q) }
function clear(e) {
  e?.stopPropagation?.(); emit('update:modelValue', ''); emit('clear'); close()
  submitted.value = ''   // quên lần tìm trước: focus() ngay dưới chạy khi props.modelValue CHƯA cập nhật → nếu không, @focus mở lại popup kết quả cũ (trống)
  inputEl.value?.focus()
}
function onEsc(e) { if (panel.value) { e.stopPropagation(); close() } else if (props.modelValue) clear(e) }
function pick(it, g) { emit('select', it, g); close() }

const onDoc = e => { if (panel.value && !panelEl.value?.contains(e.target) && !boxEl.value?.contains(e.target)) close() }
const onWin = () => panel.value && place()
watch(panel, v => {
  if (v) { document.addEventListener('mousedown', onDoc, true); window.addEventListener('resize', onWin); window.addEventListener('scroll', onWin, true) }
  else { document.removeEventListener('mousedown', onDoc, true); window.removeEventListener('resize', onWin); window.removeEventListener('scroll', onWin, true) }
})
watch(() => [props.results, props.parsed, props.loading], () => panel.value && nextTick(place))
onMounted(ensureAiGradient)
onBeforeUnmount(close)
defineExpose({ focus: () => inputEl.value?.focus(), close })
</script>

<style scoped>
/* Viền gradient AI vẽ bằng 2 lớp nền (padding-box trắng / border-box gradient) — bo góc giữ nguyên */
.ais {
  display: inline-flex; align-items: center; gap: 8px; width: 240px; max-width: 100%; height: var(--input-height); padding: 0 8px; box-sizing: border-box;
  border: 1px solid transparent; border-radius: var(--radius-default);
  background: linear-gradient(var(--bg-white), var(--bg-white)) padding-box, var(--ai-grad-600) border-box;
  cursor: text; transition: box-shadow 0.15s;
}
.ais:hover:not(.ais--disabled) {
  background: linear-gradient(135deg, var(--ai-begin-50), var(--ai-end-50)) padding-box, var(--ai-grad-700) border-box;
}
.ais:focus-within:not(.ais--disabled) {
  background: linear-gradient(var(--bg-white), var(--bg-white)) padding-box, var(--ai-grad-600) border-box;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ai-end-600) 14%, transparent);
}
.ais__icon { font-size: 16px; flex-shrink: 0; }
.ais__native { flex: 1; min-width: 0; height: 100%; padding: 0; border: none; outline: none; background: transparent;
  font-family: inherit; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
/* Placeholder: chữ gradient AI 400 (AI_Hint) */
.ais__native::placeholder { color: var(--ai-begin-400); background: linear-gradient(135deg, var(--ai-begin-400), var(--ai-end-400)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; opacity: 1; }
.ais__btn { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; width: 20px; height: 20px; padding: 0; border: none; border-radius: var(--radius-sm, 4px); background: transparent; cursor: pointer; color: var(--icon-neutral); font-size: 16px; }
.ais__btn:hover { background: var(--bg-neutral-light); }
.ais__btn--on { background: var(--bg-neutral-light); }
/* Huy hiệu “AI”: 16×16 bo 4, nền gradient AI 200, chữ 11 Medium gradient AI 600 */
.ais__badge { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; min-width: 16px; height: 16px; padding: 0 3px; box-sizing: border-box; border: none; border-radius: var(--radius-sm, 4px);
  background: linear-gradient(98deg, var(--ai-begin-200), var(--ai-end-200)); font-family: inherit; font-size: var(--text-caption); line-height: var(--text-caption-lh); font-weight: var(--fw-medium); }
.ais__badge-t { color: var(--ai-begin-600); background: linear-gradient(95deg, var(--ai-begin-600), var(--ai-end-600)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.ais__badge--btn { cursor: pointer; }
.ais__badge--btn:hover { box-shadow: 0 0 0 2px color-mix(in srgb, var(--ai-end-600) 20%, transparent); }
.ais__badge--btn:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: 1px; }
.ais--disabled { cursor: not-allowed; background: linear-gradient(var(--bg-neutral-light), var(--bg-neutral-light)) padding-box, linear-gradient(var(--ai-begin-300), var(--ai-begin-300)) border-box; }
.ais--disabled .ais__native::placeholder { background: none; -webkit-text-fill-color: var(--text-hint); color: var(--text-hint); }
.ais--disabled .ais__icon { opacity: 0.5; }
</style>

<style>
/* Popup của ô tìm kiếm AI (nằm ở <body>) — Figma Search Global engine: nền trắng · bo 8 · bóng popover */
.ais-pop { position: fixed; z-index: var(--z-header-pop, 9600); box-sizing: border-box; overflow: auto; background: var(--bg-white); border-radius: var(--radius-default); box-shadow: var(--shadow-popover); font-family: var(--font-family); color: var(--text-primary); }
.ais-pop--parsed { padding: var(--box-padding, 16px); max-width: 560px; }   /* đệm khối đều 4 phía (quy chuẩn) */
.ais-pop--results { padding: var(--box-padding, 16px); }
.ais-res__group:last-child { padding-bottom: 0; }
.ais-muted { color: var(--text-secondary); }
/* Dòng điều kiện: icon phân tích 16 + “Trường: “giá trị”” — giá trị đậm */
.ais-cond { display: flex; align-items: flex-start; gap: 8px; margin: 0; font-size: var(--text-body); line-height: var(--text-body-lh); }   /* chữ UI tối thiểu Body 13 */
.ais-cond b { font-weight: var(--fw-semibold); }
.ais-cond__icon.ti { flex-shrink: 0; font-size: 16px; margin-top: 2px; }
.ais-res__head { display: flex; flex-direction: column; gap: 8px; padding-bottom: 12px; }
.ais-res__title { display: flex; align-items: center; gap: 8px; margin: 0; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); }   /* đúng kiểu chữ H3 (Semi Bold) — chỉ đổi màu sang .text-ai-primary */
.ais-res__spark.ti { font-size: 20px; }
.ais-res__body { display: flex; flex-direction: column; }
.ais-res__empty { margin: 0; padding: 12px 0 16px; border-top: 1px solid var(--stroke-neutral-light); font-size: var(--text-body); }
/* Nhóm kết quả: nhãn nhóm 120px VIẾT HOA chữ phụ · danh sách · số kết quả (Tag X Small) bên phải */
.ais-res__group { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-top: 1px solid var(--stroke-neutral-light); }
.ais-res__gtitle { width: 120px; flex-shrink: 0; margin: 0; padding: 8px 0; font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); color: var(--text-secondary); text-transform: uppercase; }
.ais-res__items { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.ais-res__item { display: flex; align-items: flex-start; gap: 8px; width: 100%; padding: 8px; border: none; border-radius: var(--radius-default); background: none; text-align: left; font: inherit; color: inherit; cursor: pointer; }
.ais-res__item:hover { background: var(--bg-brand-light); }
.ais-res__item:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: -2px; }
.ais-res__text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ais-res__name { font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-semibold); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ais-res__sub, .ais-res__meta { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); overflow-wrap: anywhere; }   /* đường dẫn đơn vị dài → xuống dòng (Figma), không cắt */
.ais-res__meta { margin-top: 4px; }
.ais-res__more { align-self: flex-start; margin: 4px 8px; }
.ais-res__count { flex-shrink: 0; margin-top: 8px; }   /* AppTag Neutral chuẩn */
@media (max-width: 640px) {
  .ais-pop--results { padding: var(--box-padding, 16px); }
  .ais-res__group { flex-wrap: wrap; gap: 4px 12px; }
  .ais-res__gtitle { width: auto; flex: 1; }
  .ais-res__items { order: 3; flex-basis: 100%; }
}
</style>
