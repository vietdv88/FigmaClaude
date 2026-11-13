<template>
  <!-- Bắt đầu sử dụng (Onboarding) — Figma “Quy chuẩn chung” › Băt đầu sử dụng (34302:9413) · quy chuẩn /ds/onboarding-start
       Popup 1032: header (Xin chào + hướng dẫn) · trái: “Bắt đầu sử dụng” + Cơ bản / Nâng cao + % tổng, các BƯỚC dạng accordion (tiến độ từng bước,
       bước tiếp theo viền Brand + tooltip “Tiếp tục”, mở bước → nhóm việc / việc + video) · phải 360: Hướng dẫn sử dụng + Kênh hỗ trợ.
       Đóng popup khi còn việc → nút nổi góc dưới trái “Bắt đầu sử dụng” + số việc còn lại (bấm mở lại). -->
  <div v-if="modelValue" class="ob-overlay" @mousedown.self="close" @keydown.esc="close">
    <section ref="dlgEl" class="ob" role="dialog" aria-modal="true" :aria-labelledby="tid">
      <header class="ob__head">
        <div class="ob__head-txt">
          <h2 :id="tid" class="ob__title">Xin chào, {{ userName }} <span aria-hidden="true">👋</span></h2>
          <p class="ob__sub">Để có thể bắt đầu sử dụng phần mềm {{ product }}, bạn vui lòng thực hiện theo các bước sau</p>
        </div>
        <button ref="closeEl" type="button" class="btn-icon ob__close" aria-label="Đóng (Esc)" v-tip="'Đóng'" @click="close"><TIcon name="x" /></button>
      </header>

      <div class="ob__body">
        <div ref="mainEl" class="ob__main" @scroll.passive="placeTip">
          <div class="ob__bar">
            <h3 class="ob__h3">Bắt đầu sử dụng</h3>
            <AppSegmented v-if="levels.length > 1" :model-value="level" :options="levels" aria-label="Mức độ hướng dẫn" @update:model-value="v => $emit('update:level', v)" />
            <span class="ob__sp" />
            <span class="ob-progress" role="progressbar" :aria-valuenow="pct" aria-valuemin="0" aria-valuemax="100" aria-label="Tiến độ bắt đầu sử dụng">
              <span class="ob-progress__track"><span class="ob-progress__fill" :class="{ 'ob-progress__fill--done': pct === 100 }" :style="{ width: pct + '%' }" /></span>
              <b class="ob-progress__num">{{ pct }}%</b>
            </span>
          </div>

          <div class="ob__steps">
            <div v-for="(s, i) in steps" :key="s.id" :ref="el => (stepEls[s.id] = el)" class="ob-step"
              :class="{ 'ob-step--done': stepDone(s), 'ob-step--next': nextStep?.id === s.id, 'ob-step--open': openStep === s.id }">
              <!-- Icon đầu bước = Icon Swap của Figma: icon riêng của từng bước (step.icon) · show-icons=false → ẩn -->
              <button type="button" class="ob-step__head" :aria-expanded="openStep === s.id" @click="toggleStep(s)">
                <TIcon v-if="showIcons && s.icon" :name="s.icon" class="ob-step__icon" />
                <span class="ob-step__title">{{ i + 1 }}. {{ s.title }}</span>
                <span class="ob-progress ob-progress--step" :aria-label="`${count(s).done}/${count(s).total}`">
                  <span class="ob-progress__track"><span class="ob-progress__fill" :class="{ 'ob-progress__fill--done': stepDone(s) }" :style="{ width: (count(s).total ? count(s).done / count(s).total * 100 : 0) + '%' }" /></span>
                  <b class="ob-progress__num">{{ count(s).done }}/{{ count(s).total }}</b>
                </span>
                <TIcon :name="openStep === s.id ? 'chevron-up' : 'chevron-down'" class="ob-step__chev" />
              </button>

              <div v-if="openStep === s.id" class="ob-step__body">
                <!-- Bước có nhóm (VD Khai báo danh mục › Hàng hóa / Khách hàng): mỗi nhóm co / mở, ✓ khi xong hết việc trong nhóm -->
                <template v-if="s.groups">
                  <div v-for="g in s.groups" :key="g.id" class="ob-group">
                    <div class="ob-group__row">
                      <button type="button" class="ob-group__head" :aria-expanded="openGroups.has(g.id)" @click="toggleGroup(g)">
                        <TIcon :name="openGroups.has(g.id) ? 'chevron-down' : 'chevron-right'" class="ob-group__chev" />
                        <span class="ob-group__title">{{ g.title }}</span>
                      </button>
                      <!-- Ô tick tròn của nhóm (checkbox): tick = xong mọi việc trong nhóm · bỏ tick = chưa xong -->
                      <button type="button" class="ob-group__check" role="checkbox" :aria-checked="groupDone(g)"
                        :aria-label="`${groupDone(g) ? 'Bỏ đánh dấu' : 'Đánh dấu'} hoàn thành nhóm ${g.title}`" v-tip="groupDone(g) ? 'Bỏ đánh dấu hoàn thành' : 'Đánh dấu hoàn thành'" @click="tickGroup(g, s)">
                        <TIcon :name="groupDone(g) ? 'circle-check-filled' : 'circle'" class="ob-group__status" :class="{ 'ob-group__status--done': groupDone(g) }" />
                      </button>
                    </div>
                    <ul v-if="openGroups.has(g.id)" class="ob-tasks">
                      <li v-for="t in g.tasks" :key="t.id" class="ob-task" :class="{ 'ob-task--active': t.id === activeTask, 'ob-task--done': t.done }">
                        <button type="button" class="ob-task__link" @click="doTask(t, s)"><TIcon v-if="t.done" name="circle-check-filled" class="ob-task__check" aria-label="Đã xong" />{{ t.label }}</button>
                        <button v-if="t.video !== false" type="button" class="ob-video" :aria-label="`Xem video: ${t.label}`" v-tip="'Xem video hướng dẫn'" @click="$emit('video', t, s)"><span class="ob-video__play"><TIcon name="player-play-filled" /></span></button>
                      </li>
                    </ul>
                  </div>
                </template>
                <ul v-else class="ob-tasks">
                  <li v-for="t in s.tasks" :key="t.id" class="ob-task" :class="{ 'ob-task--active': t.id === activeTask, 'ob-task--done': t.done }">
                    <button type="button" class="ob-task__link" @click="doTask(t, s)"><TIcon v-if="t.done" name="circle-check-filled" class="ob-task__check" aria-label="Đã xong" />{{ t.label }}</button>
                    <button v-if="t.video !== false" type="button" class="ob-video" :aria-label="`Xem video: ${t.label}`" v-tip="'Xem video hướng dẫn'" @click="$emit('video', t, s)"><span class="ob-video__play"><TIcon name="player-play-filled" /></span></button>
                  </li>
                </ul>
                <!-- Đánh dấu xong cả bước (mọi việc) → tự mở bước tiếp theo · đã xong: bỏ đánh dấu -->
                <div class="ob-step__foot">
                  <button type="button" class="btn btn--sm" :class="stepDone(s) ? 'btn--text-neutral' : 'btn--text'" @click="tickStep(s)">
                    <TIcon :name="stepDone(s) ? 'arrow-back-up' : 'checks'" />{{ stepDone(s) ? 'Bỏ đánh dấu hoàn thành' : 'Đánh dấu hoàn thành cả bước' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="ob__side">
          <section class="ob-side-sec">
            <h3 class="ob__h3">{{ guidesTitle }}</h3>
            <div class="ob-links">
              <button v-for="g in guides" :key="g.id" type="button" class="ob-link" @click="$emit('guide', g)">
                <TIcon :name="g.icon" class="ob-link__icon" :class="`ob-tone--${g.tone || 'brand'}`" />
                <span class="ob-link__label">{{ g.label }}</span>
                <span v-if="g.progress" class="ob-progress ob-progress--sm" :aria-label="`${g.progress.done}/${g.progress.total}`">
                  <span class="ob-progress__track"><span class="ob-progress__fill" :style="{ width: (g.progress.total ? g.progress.done / g.progress.total * 100 : 0) + '%' }" /></span>
                  <b class="ob-progress__num">{{ g.progress.done }}/{{ g.progress.total }}</b>
                </span>
              </button>
            </div>
          </section>
          <section class="ob-side-sec">
            <h3 class="ob__h3">{{ supportsTitle }}</h3>
            <div class="ob-links">
              <button v-for="sp in supports" :key="sp.id" type="button" class="ob-link" @click="$emit('support', sp)">
                <!-- icon: 'misa-ai' = đúng icon MISA AI trên Global Header (IconMisaAI) -->
                <span v-if="sp.icon === 'misa-ai'" class="ob-link__ai" aria-hidden="true"><IconMisaAI /></span>
                <img v-else-if="sp.img" :src="sp.img" alt="" class="ob-link__img" />
                <TIcon v-else :name="sp.icon" class="ob-link__icon" :class="`ob-tone--${sp.tone || 'brand'}`" />
                <span class="ob-link__label" :class="{ 'text-ai-primary': sp.ai }">{{ sp.label }}</span>
              </button>
            </div>
          </section>
        </aside>
      </div>

      <!-- Tooltip “Tiếp tục” chỉ vào bước cần làm tiếp (nằm trên cùng popup để không bị cột trái cắt) -->
      <span v-if="tip" class="ob-tip" :style="{ top: tip.y + 'px', left: tip.x + 'px' }" aria-hidden="true">Tiếp tục</span>
    </section>
  </div>

  <!-- Nút nổi: popup đóng mà còn việc → góc dưới trái, số việc còn lại · bấm mở lại -->
  <!-- Kéo để đặt ở bất kỳ đâu trên màn hình (nhớ vị trí); kéo không tính là bấm · phím mũi tên khi focus cũng dời được -->
  <button v-else-if="fab && remaining" ref="fabEl" type="button" class="btn btn--primary ob-fab" :class="{ 'ob-fab--drag': dragging }" :style="fabPos ? { left: fabPos.x + 'px', top: fabPos.y + 'px', bottom: 'auto' } : null"
    :aria-label="`Bắt đầu sử dụng — còn ${remaining} việc. Kéo để di chuyển`" v-tip="dragging ? '' : 'Kéo để di chuyển'"
    @pointerdown="fabDown" @click="fabClick" @keydown.left.prevent="nudge(-16, 0)" @keydown.right.prevent="nudge(16, 0)" @keydown.up.prevent="nudge(0, -16)" @keydown.down.prevent="nudge(0, 16)">
    <TIcon name="player-play" />Bắt đầu sử dụng<span class="ob-fab__count">{{ remaining }}</span>
  </button>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import TIcon from './TIcon.vue'
import AppSegmented from './AppSegmented.vue'
import IconMisaAI from './IconMisaAI.vue'
import { vTip } from '../utils/tooltip.js'

const props = defineProps({
  modelValue:   { type: Boolean, default: false },   // v-model: popup đang mở
  userName:     { type: String, default: '' },
  product:      { type: String, default: 'AMIS' },
  /** [{ id, title, tasks?: [{ id, label, done, video? }], groups?: [{ id, title, tasks }] }] — bước có groups: tiến độ = số nhóm xong / số nhóm */
  steps:        { type: Array, default: () => [] },
  level:        { type: String, default: 'basic' },   // v-model:level
  levels:       { type: Array, default: () => [{ value: 'basic', label: 'Cơ bản' }, { value: 'advanced', label: 'Nâng cao' }] },
  activeTask:   { type: [String, Number], default: null },   // việc vừa làm / đang làm → nền Brand Light
  guidesTitle:  { type: String, default: 'Hướng dẫn sử dụng' },
  /** [{ id, icon, tone: 'brand'|'danger'|'success', label, progress?: { done, total } }] */
  guides:       { type: Array, default: () => [] },
  supportsTitle:{ type: String, default: 'Kênh hỗ trợ phần mềm' },
  /** [{ id, icon | img, tone?, label, ai? (chữ gradient AI) }] — icon: 'misa-ai' = icon MISA AI của Global Header */
  supports:     { type: Array, default: () => [] },
  fab:          { type: Boolean, default: true },   // nút nổi khi popup đóng mà còn việc
  /** Bước mở sẵn khi mở popup (mặc định: không mở bước nào) */
  initialStep:  { type: [String, Number], default: null },
  /** Khóa nhớ vị trí nút nổi (localStorage) — '' = không nhớ */
  fabKey:       { type: String, default: 'mds-onboarding-fab' },
  /** Hiện icon đầu mỗi bước (step.icon — Icon Swap trong Figma) */
  showIcons:    { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue', 'update:level', 'task', 'step-done', 'group-done', 'video', 'guide', 'support', 'close'])
const tid = 'ob-' + Math.random().toString(36).slice(2, 8)
const dlgEl = ref(null), mainEl = ref(null), closeEl = ref(null), stepEls = reactive({})

/* ── Tiến độ ── */
const tasksOf = s => (s.groups ? s.groups.flatMap(g => g.tasks) : s.tasks || [])
const count = s => s.groups ? { done: s.groups.filter(g => g.tasks.every(t => t.done)).length, total: s.groups.length } : { done: tasksOf(s).filter(t => t.done).length, total: tasksOf(s).length }
const stepDone = s => tasksOf(s).length > 0 && tasksOf(s).every(t => t.done)
const all = computed(() => props.steps.flatMap(tasksOf))
const pct = computed(() => (all.value.length ? Math.round(all.value.filter(t => t.done).length / all.value.length * 100) : 0))
const remaining = computed(() => all.value.filter(t => !t.done).length)
const nextStep = computed(() => props.steps.find(s => !stepDone(s)) || null)

/* ── Co / mở ── */
const openStep = ref(props.initialStep), openGroups = ref(new Set())
function openFirstGroup(s) { const g = s?.groups?.find(x => x.tasks.some(t => !t.done)) || s?.groups?.[0]; openGroups.value = new Set(g ? [g.id] : []) }
function toggleStep(s) { openStep.value = openStep.value === s.id ? null : s.id; if (openStep.value) openFirstGroup(s) }
function toggleGroup(g) { const n = new Set(openGroups.value); n.has(g.id) ? n.delete(g.id) : n.add(g.id); openGroups.value = n }
watch(() => props.initialStep, v => { if (v != null) { openStep.value = v; openFirstGroup(props.steps.find(s => s.id === v)) } })
watch(() => props.level, () => { openStep.value = null })

/* ── Tooltip “Tiếp tục”: bên phải bước tiếp theo, giữa hàng tiêu đề; ẩn khi bước đó cuộn khuất ── */
const tip = ref(null)
function placeTip() {
  const s = nextStep.value, el = s && stepEls[s.id], dlg = dlgEl.value, main = mainEl.value
  if (!el || !dlg || !main) { tip.value = null; return }
  const k = dlg.getBoundingClientRect().width / dlg.offsetWidth || 1   // khung bị thu nhỏ (transform scale) → quy về px thật
  const d = dlg.getBoundingClientRect(), r = el.querySelector('.ob-step__head').getBoundingClientRect(), m = main.getBoundingClientRect()
  const cy = r.top + r.height / 2
  if (cy < m.top + 8 || cy > m.bottom - 8) { tip.value = null; return }
  tip.value = { x: (r.right - d.left) / k + 8, y: (cy - d.top) / k }
}
watch([() => props.modelValue, openStep, openGroups, nextStep, () => props.steps], () => nextTick(placeTip), { deep: true })
function close() { emit('update:modelValue', false); emit('close') }

/* ── Bấm việc = xong việc đó (app nghe @task để mở đúng màn) · tick đầu bước = xong cả bước → mở bước tiếp theo ── */
function doTask(t, s) { emit('task', t, s) }
const groupDone = g => g.tasks.length > 0 && g.tasks.every(t => t.done)
/* Tick nhóm: app đặt done cho mọi việc của nhóm (@group-done) · nếu cả bước xong nhờ đó → mở bước tiếp theo */
async function tickGroup(g, s) {
  const done = !groupDone(g)
  emit('group-done', g, done, s)
  await nextTick()
  if (done && stepDone(s)) advanceFrom()
}
async function advanceFrom() { const n = props.steps.find(x => !stepDone(x)); openStep.value = n ? n.id : null; if (n) { openFirstGroup(n); await nextTick(); stepEls[n.id]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) } }
async function tickStep(s) {
  const done = !stepDone(s)
  emit('step-done', s, done)   // app đặt done cho mọi việc của bước
  await nextTick()
  if (done) advanceFrom()
}

/* ── Nút nổi kéo được: pointer kéo > 4px = di chuyển (không mở); giới hạn trong khung chứa (màn hình, hoặc khung có transform) ── */
const fabEl = ref(null), fabPos = ref(null), dragging = ref(false)
let drag = null, moved = false
try { const v = props.fabKey && JSON.parse(localStorage.getItem(props.fabKey) || 'null'); if (v && isFinite(v.x)) fabPos.value = v } catch { /* bỏ qua */ }
function boxOf(el) {   // khung chứa của position: fixed = tổ tiên có transform (VD khung xem thu nhỏ) hoặc cửa sổ
  for (let p = el.parentElement; p; p = p.parentElement) { if (getComputedStyle(p).transform !== 'none') { const r = p.getBoundingClientRect(); return { r, w: p.offsetWidth, h: p.offsetHeight, k: r.width / p.offsetWidth || 1 } } }
  return { r: { left: 0, top: 0 }, w: window.innerWidth, h: window.innerHeight, k: 1 }
}
const clampPos = (x, y, el, b) => ({ x: Math.round(Math.min(Math.max(8, x), b.w - el.offsetWidth - 8)), y: Math.round(Math.min(Math.max(8, y), b.h - el.offsetHeight - 8)) })
function fabDown(e) {
  if (e.button !== 0) return
  const el = fabEl.value, b = boxOf(el), r = el.getBoundingClientRect()
  drag = { b, dx: (e.clientX - r.left) / b.k, dy: (e.clientY - r.top) / b.k, sx: e.clientX, sy: e.clientY }; moved = false
  el.setPointerCapture?.(e.pointerId)
  el.addEventListener('pointermove', fabMove); el.addEventListener('pointerup', fabUp); el.addEventListener('pointercancel', fabUp)
}
function fabMove(e) {
  if (!drag) return
  if (!moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return
  moved = true; dragging.value = true
  const { b } = drag
  fabPos.value = clampPos((e.clientX - b.r.left) / b.k - drag.dx, (e.clientY - b.r.top) / b.k - drag.dy, fabEl.value, b)
}
function fabUp() {
  const el = fabEl.value
  el?.removeEventListener('pointermove', fabMove); el?.removeEventListener('pointerup', fabUp); el?.removeEventListener('pointercancel', fabUp)
  drag = null; setTimeout(() => (dragging.value = false))
  if (moved && props.fabKey) try { localStorage.setItem(props.fabKey, JSON.stringify(fabPos.value)) } catch { /* bỏ qua */ }
}
function fabClick(e) { if (moved) { e.preventDefault(); moved = false; return } emit('update:modelValue', true) }
function nudge(dx, dy) {
  const el = fabEl.value; if (!el) return
  const b = boxOf(el), r = el.getBoundingClientRect()
  fabPos.value = clampPos((r.left - b.r.left) / b.k + dx, (r.top - b.r.top) / b.k + dy, el, b)
  if (props.fabKey) try { localStorage.setItem(props.fabKey, JSON.stringify(fabPos.value)) } catch { /* bỏ qua */ }
}
function onKey(e) { if (e.key === 'Escape' && props.modelValue) close() }
let ro
onMounted(() => { window.addEventListener('keydown', onKey); window.addEventListener('resize', placeTip); ro = new ResizeObserver(placeTip) })
watch(dlgEl, el => { if (el) { ro?.observe(el); nextTick(() => closeEl.value?.focus()) } })
onBeforeUnmount(() => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', placeTip); ro?.disconnect() })
</script>

<style scoped>
/* Lớp phủ + khung popup: rộng 1032 · bo Radius/Dialog 12 · bóng dialog · cao tối đa vừa màn hình, thân cuộn */
.ob-overlay { container-type: inline-size; position: fixed; inset: 0; z-index: var(--z-dialog); display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--bg-overlay); }
.ob { position: relative; display: flex; flex-direction: column; width: 1032px; max-width: 100%; max-height: 100%; background: var(--bg-white); border-radius: var(--radius-dialog); box-shadow: var(--shadow-dialog); overflow: hidden; }
/* Header: đệm 24 / 24 / 16 · tiêu đề H2 · mô tả Body · ✕ icon 20 */
.ob__head { flex-shrink: 0; display: flex; align-items: center; gap: 12px; padding: 24px 24px 16px; border-bottom: 1px solid var(--stroke-neutral-light); }
.ob__head-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.ob__title { margin: 0; font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ob__sub { margin: 0; color: var(--text-primary); }
.ob__close { margin-right: calc((var(--btn-height) - 20px) / -2); }
.ob__close .ti { font-size: 20px; }
/* Thân: trái nền Neutral Light (đệm 32, các bước cuộn) · phải 360 nền trắng, vạch trái */
.ob__body { flex: 1; min-height: 0; display: flex; background: var(--bg-white); }
.ob__main { flex: 1; min-width: 0; overflow-y: auto; padding: 32px; background: var(--bg-page); }   /* cột trái: BG/Page */
.ob__bar { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.ob__sp { flex: 1; }
.ob__h3 { margin: 0; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
/* Thanh tiến độ: cao 8 · bo 8 · nền Neutral/300 · Brand (đang làm) / Success (xong) · số Semi Bold */
.ob-progress { display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; }
.ob-progress__track { width: 100px; height: 8px; border-radius: var(--radius-default); background: var(--bg-neutral-hover); overflow: hidden; }   /* rãnh thanh tiến độ: BG/Neutral Hover */
.ob-progress--sm .ob-progress__track { width: 30px; }
.ob-progress__fill { display: block; height: 100%; border-radius: inherit; background: var(--bg-brand); transition: width 0.3s ease; }
.ob-progress__fill--done { background: var(--bg-success); }
.ob-progress__num { min-width: 28px; text-align: right; font-weight: var(--fw-semibold); color: var(--text-primary); font-feature-settings: 'tnum'; }
/* Bước (Accordion Item): nền trắng · viền Stroke/Neutral · bo 8 · đệm 16 · xong: nền Neutral/100 · bước tiếp theo: viền Brand · đang mở: tiêu đề Brand */
.ob__steps { display: flex; flex-direction: column; gap: 12px; }
.ob-step { border: 1px solid var(--stroke-neutral); border-radius: var(--radius-default); background: var(--bg-white); }
.ob-step--done { background: var(--bg-neutral-lighter); }   /* sáng hơn BG/Page một nấc — vẫn khác bước chưa xong (trắng) */
.ob-step--next { border-color: var(--stroke-brand); }
.ob-step__head { display: flex; align-items: center; gap: 8px; width: 100%; padding: 16px; border: none; border-radius: inherit; background: none; font: inherit; color: inherit; text-align: left; cursor: pointer; }
.ob-step__head:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: -2px; }
.ob-step__head { border-radius: calc(var(--radius-default) - 1px); transition: background 0.15s; }   /* bo trong = bo ngoài 8 − viền 1 */
.ob-step--open .ob-step__head { border-radius: calc(var(--radius-default) - 1px) calc(var(--radius-default) - 1px) 0 0; }
.ob-step__head:hover { background: var(--bg-brand-light); }   /* quy tắc hover chung: nền Brand Light, chữ giữ nguyên */
.ob-step__head:active { background: var(--bg-brand-light-hover); }
.ob-step__icon { font-size: 24px; color: var(--icon-neutral); flex-shrink: 0; }   /* icon bước Icon/Neutral (cả khi đã xong) */
.ob-step--open .ob-step__icon { color: var(--icon-brand); }   /* bước đang mở: icon Brand cùng tiêu đề */
.ob-step__title { flex: 1; min-width: 0; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ob-step--open .ob-step__title { color: var(--text-brand); }
.ob-step__chev { font-size: 20px; color: var(--icon-neutral); flex-shrink: 0; }
.ob-step__body { padding: 0 16px 12px; margin-top: -4px; }
.ob-step__foot { display: flex; justify-content: flex-end; padding-top: 4px; border-top: 1px solid var(--stroke-neutral-light); }
/* Nhóm việc trong bước: tiêu đề H3 + ✓ / ○ bên phải · vạch ngăn giữa các nhóm */
.ob-group + .ob-group { border-top: 1px solid var(--stroke-neutral); }
.ob-group__row { display: flex; align-items: center; gap: 8px; }
.ob-group__check { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; margin-right: -4px; padding: 0; border: none; border-radius: 50%; background: none; cursor: pointer; transition: background 0.15s; }   /* vùng bấm 28 · icon 20 thẳng mép phải */
.ob-group__check:hover { background: var(--bg-brand-light); }
.ob-group__check:hover .ob-group__status:not(.ob-group__status--done) { color: var(--icon-brand); }
.ob-group__check:active { background: var(--bg-brand-light-hover); }
.ob-group__check:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: -2px; }
.ob-group__head { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; padding: 16px 0; border: none; background: none; font: inherit; text-align: left; cursor: pointer; }
.ob-group__head:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: 2px; border-radius: 4px; }
.ob-group__chev { font-size: 20px; color: var(--icon-neutral); flex-shrink: 0; }
.ob-group__title { flex: 1; min-width: 0; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ob-group__status { font-size: 20px; color: var(--icon-neutral); flex-shrink: 0; }
.ob-group__status--done { color: var(--icon-success); }
.ob-group .ob-tasks { border-top: 1px solid var(--stroke-neutral); }
/* Việc: link Brand + ô video 64 × 40 · rê / đang làm: nền Brand Light */
.ob-tasks { list-style: none; margin: 0; padding: 12px 0 8px; display: flex; flex-direction: column; gap: 12px; }
.ob-step__body > .ob-tasks { padding-top: 4px; }
.ob-task { display: flex; align-items: center; gap: 12px; padding-left: 16px; border-radius: var(--radius-default); transition: background 0.15s; }
.ob-task:hover, .ob-task--active { background: var(--bg-brand-light); }
.ob-task__link { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; min-height: 40px; padding: 0; border: none; background: none; font: inherit; color: var(--text-link); text-align: left; cursor: pointer; }
.ob-task__link:hover { text-decoration: underline; }
.ob-task__link:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: 2px; border-radius: 4px; }
.ob-task__check { font-size: 16px; color: var(--icon-success); flex-shrink: 0; }
.ob-video { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 40px; padding: 0; border: none; border-radius: var(--radius-default);
  background: linear-gradient(135deg, var(--bg-brand-light), var(--bg-brand-light-hover)); cursor: pointer; }
.ob-video:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: 1px; }
.ob-video__play { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: var(--alpha-black-500); transition: transform 0.15s; }
.ob-video:hover .ob-video__play { transform: scale(1.12); }
.ob-video__play .ti { font-size: 12px; color: var(--icon-white); }
/* Cột phải: Hướng dẫn sử dụng · Kênh hỗ trợ — mỗi mục cao 44, icon 20 có màu, chữ Body Medium */
.ob__side { width: 360px; flex-shrink: 0; display: flex; flex-direction: column; overflow-y: auto; padding: 16px 24px; background: var(--bg-white); border-left: 1px solid var(--stroke-neutral-light); }
.ob-side-sec { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
.ob-side-sec + .ob-side-sec { padding-top: 16px; }
.ob-links { display: flex; flex-direction: column; margin: 0 -8px; }
.ob-link { display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 8px; border: none; border-radius: var(--radius-default); background: none; font: inherit; font-weight: var(--fw-medium); color: var(--text-primary); text-align: left; cursor: pointer; transition: background 0.15s; }
.ob-link:hover { background: var(--bg-brand-light); }
.ob-link:active { background: var(--bg-brand-light-hover); }
.ob-link:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: -2px; }
.ob-link__icon { font-size: 20px; flex-shrink: 0; }
.ob-link__img { width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; }
.ob-link__ai { display: inline-flex; flex-shrink: 0; width: 20px; height: 20px; }
.ob-link__ai :deep(svg) { width: 20px; height: 20px; }
.ob-link__label { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ob-tone--brand { color: var(--icon-brand); } .ob-tone--danger { color: var(--icon-danger); } .ob-tone--success { color: var(--icon-success); }
/* Tooltip “Tiếp tục”: nền Brand, chữ trắng, mũi nhọn trái */
.ob-tip { position: absolute; z-index: 2; transform: translateY(-50%); padding: 6px 12px; border-radius: var(--radius-default); background: var(--bg-brand); color: var(--text-white);
  font-size: var(--text-body); line-height: var(--text-body-lh); white-space: nowrap; pointer-events: none; box-shadow: var(--shadow-all-4); }
.ob-tip::before { content: ''; position: absolute; left: -6px; top: 50%; transform: translateY(-50%); border: 6px solid transparent; border-left: 0; border-right-color: var(--bg-brand); }
/* Nút nổi góc dưới trái + số việc còn lại (badge đỏ như header) */
.ob-fab { position: fixed; left: 24px; bottom: 24px; z-index: calc(var(--z-drawer) + 5); box-shadow: var(--shadow-popover); cursor: grab; touch-action: none; user-select: none; }
.ob-fab--drag { cursor: grabbing; box-shadow: var(--shadow-bottom-20); }
.ob-fab__count { min-width: 16px; height: 16px; padding: 0 4px; border-radius: var(--radius-pill); background: var(--bg-danger); color: var(--text-white); font-size: 10px; font-weight: var(--fw-bold); line-height: 16px; text-align: center; }
@container (max-width: 760px) {   /* theo bề rộng vùng phủ (không theo cửa sổ) — đúng cả khi nằm trong khung xem thu nhỏ */
  .ob__body { flex-direction: column; overflow-y: auto; }
  .ob__main, .ob__side { overflow: visible; }
  .ob__main { padding: 16px; }
  .ob__side { width: auto; border-left: 0; border-top: 1px solid var(--stroke-neutral-light); }
  .ob__bar { flex-wrap: wrap; }
  .ob-progress--step .ob-progress__track { width: 48px; }
}
</style>
