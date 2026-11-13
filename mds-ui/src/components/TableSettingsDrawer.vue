<template>
  <!-- Thiết lập bảng — Figma MDS (19929:26845): drawer phải · tìm cột · bảng cột: kéo thả đổi thứ tự, tick ẩn / hiện, đổi tên hiển thị,
       độ rộng, ghim · (tuỳ chọn) Thiết lập dòng: gom nhóm · chân: Lấy lại mặc định | Hủy · Lưu (ghim đáy) -->
  <Teleport to="body">
    <div class="tsd-overlay" @mousedown.self="$emit('close')">
      <aside class="tsd" role="dialog" aria-modal="true" aria-labelledby="tsd-title">
        <div class="tsd__head">
          <h2 id="tsd-title" class="tsd__title">{{ title }}</h2>
          <button type="button" class="btn-icon" aria-label="Đóng (Esc)" @click="$emit('close')"><TIcon name="x" /></button>
        </div>

        <div class="tsd__body">
          <template v-if="groupOptions.length">
            <p class="tsd__section">Thiết lập dòng</p>
            <div class="radio-group">
              <AppRadio v-for="g in groupOptions" :key="g.value" v-model="draftGroup" :value="g.value" :label="g.label" name="tsd-group" />
            </div>
            <p class="tsd__section">Thiết lập cột</p>
          </template>
          <AppSearchbox v-model="q" class="tsd__search" placeholder="Tìm kiếm" />

          <div class="tsd-grid" role="table" aria-label="Danh sách cột">
            <div class="tsd-row tsd-row--head" role="row">
              <span class="tsd-c tsd-c--drag" />
              <span class="tsd-c tsd-c--check"><AppCheckbox :model-value="allState" @update:model-value="toggleAll" aria-label="Hiện tất cả cột" /></span>
              <span class="tsd-c tsd-c--field">Tên trường</span>
              <span class="tsd-c tsd-c--label">Tên cột hiển thị</span>
              <span class="tsd-c tsd-c--width">Độ rộng cột</span>
              <span class="tsd-c tsd-c--pin" />
            </div>
            <div v-for="c in shown" :key="c.key" class="tsd-row" role="row"
              :class="{ 'tsd-row--drag': dragKey === c.key, 'tsd-row--over': overKey === c.key && dragKey !== c.key }"
              :draggable="dragKey === c.key" @dragstart="onDragStart($event, c)" @dragover.prevent="overKey = c.key" @drop.prevent="onDrop(c)" @dragend="dragKey = overKey = null">
              <span class="tsd-c tsd-c--drag" v-tip="q ? 'Xoá ô tìm kiếm để kéo đổi thứ tự' : 'Kéo để đổi thứ tự'" @mousedown="!q && (dragKey = c.key)" @mouseup="dragKey = null">
                <TIcon name="grip-vertical" />
              </span>
              <span class="tsd-c tsd-c--check" v-tip="c.locked ? 'Cột mặc định bắt buộc hiển thị, không thể ẩn' : null"><AppCheckbox :model-value="!c.hidden" :disabled="c.locked" @update:model-value="v => (c.hidden = !v)" :aria-label="`Hiện cột ${c.field}`" /></span>
              <span class="tsd-c tsd-c--field" v-tip="c.field">{{ c.field }}</span>
              <span class="tsd-c tsd-c--label"><input v-model="c.label" class="tsd-input" type="text" :aria-label="`Tên hiển thị của ${c.field}`" /></span>
              <span class="tsd-c tsd-c--width"><input v-model.number="c.width" class="tsd-input tsd-input--num" type="number" min="40" :aria-label="`Độ rộng cột ${c.field}`" /></span>
              <span class="tsd-c tsd-c--pin">
                <button type="button" class="tsd-pin" :class="{ 'tsd-pin--on': c.pinned }" :aria-pressed="c.pinned" v-tip="c.pinned ? 'Bỏ ghim cột' : 'Ghim cột (đứng yên khi kéo ngang)'"
                  :aria-label="c.pinned ? 'Bỏ ghim cột' : 'Ghim cột'" @click="c.pinned = !c.pinned"><TIcon name="pinned" /></button>
              </span>
            </div>
            <p v-if="!shown.length" class="tsd-empty">Không tìm thấy cột phù hợp</p>
          </div>
        </div>

        <div class="tsd__foot">
          <button type="button" class="btn btn--outline btn--neutral" @click="reset">Lấy lại mặc định</button>
          <span class="tsd__spacer" />
          <button type="button" class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
          <button type="button" class="btn btn--primary" @click="save">Lưu</button>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import TIcon from './TIcon.vue'
import AppCheckbox from './AppCheckbox.vue'
import AppRadio from './AppRadio.vue'
import AppSearchbox from './AppSearchbox.vue'
import { vTip } from '../utils/tooltip.js'
import { matchText } from '../utils/search.js'
import { useEscClose } from '../utils/escStack.js'

const props = defineProps({
  title:    { type: String, default: 'Thiết lập bảng' },
  /** Cột hiện tại: [{ key, label, field? (tên trường gốc — mặc định = label), width?, hidden?, pinned?, locked? (không cho ẩn) }] — bỏ qua cột tick chọn */
  columns:  { type: Array, default: () => [] },
  /** Cấu hình mặc định để “Lấy lại mặc định” (cùng dạng columns) */
  defaults: { type: Array, default: null },
  /** Thiết lập dòng (gom nhóm): [{ value, label }] — bỏ trống thì ẩn phần này */
  groupOptions: { type: Array, default: () => [] },
  groupBy:  { default: '' },
})
const emit = defineEmits(['save', 'close'])
useEscClose(() => emit('close'))

const clone = list => list.filter(c => c.type !== 'checkbox' && c.type !== 'radio')
  .map(c => ({ key: c.key, field: c.field || c.label, label: c.label, width: c.width ?? c.minWidth ?? 120, hidden: !!c.hidden, pinned: !!c.pinned, locked: !!c.locked }))
const draft = ref(clone(props.columns)), draftGroup = ref(props.groupBy)
const q = ref('')
const shown = computed(() => draft.value.filter(c => matchText([c.field, c.label], q.value)))
const allState = computed(() => { const on = shown.value.filter(c => !c.hidden).length; return on === 0 ? false : on === shown.value.length ? true : null })
function toggleAll(v) { const on = allState.value !== true; shown.value.forEach(c => { if (!c.locked) c.hidden = !on }) }
function reset() { draft.value = clone(props.defaults || props.columns); draftGroup.value = '' ; q.value = '' }
function save() { emit('save', { columns: draft.value.map(({ field, ...c }) => ({ ...c, field })), groupBy: draftGroup.value }) }

/* Kéo thả đổi thứ tự (chỉ khi không lọc) — nắm biểu tượng ⋮⋮ để kéo */
const dragKey = ref(null), overKey = ref(null)
function onDragStart(e, c) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', c.key) }
function onDrop(target) {
  const from = draft.value.findIndex(c => c.key === dragKey.value), to = draft.value.findIndex(c => c.key === target.key)
  if (from >= 0 && to >= 0 && from !== to) { const list = [...draft.value]; const [m] = list.splice(from, 1); list.splice(to, 0, m); draft.value = list }
  dragKey.value = overKey.value = null
}
</script>

<style scoped>
.tsd-overlay { position: fixed; inset: 0; z-index: var(--z-dialog); background: var(--bg-overlay); display: flex; justify-content: flex-end; }
.tsd { width: 625px; max-width: 100vw; height: 100%; display: flex; flex-direction: column; background: var(--bg-white); box-shadow: var(--shadow-dialog); }
.tsd__head { display: flex; align-items: center; gap: 12px; padding: 24px 24px 16px; }
.tsd__title { flex: 1; min-width: 0; margin: 0; font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.tsd__body { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 12px; padding: 0 24px 24px; }
.tsd__section { margin: 4px 0 0; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.tsd__search { width: 240px; max-width: 100%; }
.tsd__foot { display: flex; align-items: center; gap: var(--gap-control); padding: 16px 24px; background: var(--bg-form-footer); border-top: 1px solid var(--stroke-form-footer); }
.tsd__spacer { flex: 1; }
/* Bảng cột — cùng nhịp DataTable: tiêu đề nền Table Header, dòng cao --dt-row-height, kẻ ngang */
.tsd-grid { border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-card); overflow: hidden; }
.tsd-row { display: flex; align-items: center; height: var(--dt-row-height); border-top: 1px solid var(--stroke-neutral-light); background: var(--bg-white); font-size: var(--text-body); color: var(--text-primary); }
.tsd-row--head { border-top: none; background: var(--dt-header-bg); font-weight: var(--fw-semibold); }
.tsd-row:not(.tsd-row--head):hover { background: var(--bg-brand-light); }
.tsd-row--drag { opacity: 0.5; }
.tsd-row--over { box-shadow: inset 0 2px 0 var(--stroke-brand); }
.tsd-c { display: flex; align-items: center; min-width: 0; padding: 0 8px; box-sizing: border-box; }
.tsd-c--drag { width: 40px; justify-content: center; color: var(--icon-neutral); cursor: grab; }
.tsd-c--drag .ti { font-size: 16px; }
.tsd-c--check { width: 40px; justify-content: center; }
.tsd-c--field { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; line-height: var(--dt-row-height); }
.tsd-c--label { width: 160px; }
.tsd-c--width { width: 120px; justify-content: flex-end; }
.tsd-row--head .tsd-c--width { justify-content: flex-end; }
.tsd-c--pin { width: 44px; justify-content: center; }
/* Ô sửa trong dòng: không viền khi nghỉ, rê dòng / focus mới hiện viền (như bảng sửa trực tiếp) */
.tsd-input { width: 100%; height: calc(var(--input-height) - 4px); padding: 0 8px; box-sizing: border-box; border: 1px solid transparent; border-radius: var(--radius-default);
  background: transparent; font: inherit; font-size: var(--text-body); color: var(--text-primary); outline: none; }
.tsd-input--num { text-align: right; font-feature-settings: 'tnum'; -moz-appearance: textfield; }
.tsd-input--num::-webkit-inner-spin-button, .tsd-input--num::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.tsd-row:hover .tsd-input { border-color: var(--stroke-neutral); background: var(--bg-white); }
.tsd-input:hover, .tsd-row:hover .tsd-input:hover { border-color: var(--stroke-brand); }
.tsd-input:focus { border-color: var(--stroke-brand); background: var(--bg-white); }
.tsd-pin { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; border: none; border-radius: var(--radius-default); background: transparent; color: var(--icon-brand); cursor: pointer; }
.tsd-pin .ti { font-size: 16px; }
.tsd-pin:hover { background: var(--bg-brand-light); }
.tsd-pin--on :deep(svg) { fill: currentColor; }   /* đã ghim: ghim tô đặc */
.tsd-empty { margin: 0; padding: 12px; font-size: var(--text-body); color: var(--text-secondary); border-top: 1px solid var(--stroke-neutral-light); }
@media (max-width: 640px) { .tsd-c--label { width: 120px; } .tsd-c--width { width: 84px; } }
</style>
