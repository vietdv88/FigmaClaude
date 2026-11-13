<template>
  <!-- Bộ lọc Cơ bản — Figma MDS “Body Filter / Basic” (6019:136455): popover 320px xổ ngay dưới nút lọc (không đẩy bảng).
       Đầu: “Bộ lọc” + ✕ · thân: các trường lọc cố định (Combobox / Datebox / khoảng ngày) — layout 'vertical' (nhãn trên) | 'horizontal' (nhãn trái)
       · chân: Bỏ lọc | Áp dụng. Đóng khi bấm ra ngoài / Esc. -->
  <Teleport to="body">
    <div ref="popEl" class="tfb" role="dialog" aria-label="Bộ lọc" :style="pos" @mousedown.stop>
      <div class="tfb__body">
        <div class="tfb__head">
          <h3 class="tfb__title">Bộ lọc</h3>
          <button type="button" class="icon-swap icon-swap--16 icon-swap--action" v-tip="'Đóng'" aria-label="Đóng bộ lọc" @click="$emit('close')"><TIcon name="x" /></button>
        </div>
        <div class="tfb__fields" :class="`tfb__fields--${layout}`" data-label-group>
          <template v-for="f in fields" :key="f.key">
            <!-- Khoảng ngày: dọc → 2 ô cạnh nhau, mỗi ô 1 nhãn · ngang → 2 dòng -->
            <div v-if="f.type === 'daterange' && layout === 'vertical'" class="tfb__range">
              <AppInput :label="f.labels?.[0] || 'Từ ngày'"><AppDatebox v-model="draft[f.key][0]" /></AppInput>
              <AppInput :label="f.labels?.[1] || 'Đến ngày'"><AppDatebox v-model="draft[f.key][1]" /></AppInput>
            </div>
            <template v-else-if="f.type === 'daterange'">
              <AppInput :label="f.labels?.[0] || 'Từ ngày'" :vertical="false"><AppDatebox v-model="draft[f.key][0]" /></AppInput>
              <AppInput :label="f.labels?.[1] || 'Đến ngày'" :vertical="false"><AppDatebox v-model="draft[f.key][1]" /></AppInput>
            </template>
            <AppInput v-else :label="f.label" :vertical="layout === 'vertical'">
              <AppDatebox v-if="f.type === 'date'" v-model="draft[f.key]" />
              <AppCombobox v-else v-model="draft[f.key]" :options="[{ value: '', label: 'Tất cả' }, ...(f.options || [])]" required :clearable="false" />
            </AppInput>
          </template>
        </div>
      </div>
      <div class="tfb__foot">
        <button type="button" class="btn btn--outline btn--neutral" @click="clear">Bỏ lọc</button>
        <button type="button" class="btn btn--primary" @click="apply">Áp dụng</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import TIcon from './TIcon.vue'
import AppInput from './AppInput.vue'
import AppCombobox from './AppCombobox.vue'
import AppDatebox from './AppDatebox.vue'
import { vTip } from '../utils/tooltip.js'
import { useEscClose } from '../utils/escStack.js'

const props = defineProps({
  /** Trường lọc: [{ key, label, type?: 'select' (mặc định) | 'date' | 'daterange', options?: [{ value, label }], labels?: [từ, đến] }] */
  fields:     { type: Array, default: () => [] },
  /** Giá trị đang áp: { [key]: value | [from, to] } — '' = Tất cả */
  modelValue: { type: Object, default: () => ({}) },
  /** Nút lọc để neo popover (TableHeader emit('open-filter', el)) */
  anchor:     { default: null },
  /** 'vertical' (nhãn trên ô) | 'horizontal' (nhãn trái) */
  layout:     { type: String, default: 'vertical' },
})
const emit = defineEmits(['update:modelValue', 'apply', 'close'])
useEscClose(() => emit('close'))

const empty = f => (f.type === 'daterange' ? ['', ''] : '')
const draft = reactive(Object.fromEntries(props.fields.map(f => [f.key, JSON.parse(JSON.stringify(props.modelValue[f.key] ?? empty(f)))])))
function apply() { const v = JSON.parse(JSON.stringify(draft)); emit('update:modelValue', v); emit('apply', v) }
function clear() { props.fields.forEach(f => { draft[f.key] = empty(f) }); apply() }

/* Neo ngay dưới nút lọc, căn mép phải theo nút; không đủ chỗ bên trái → căn trái màn hình 8px */
const popEl = ref(null), pos = ref({ top: '0px', left: '0px' })
function place() {
  const a = props.anchor?.getBoundingClientRect?.(); if (!a) return
  const w = popEl.value?.offsetWidth || 320
  pos.value = { top: a.bottom + 4 + 'px', left: Math.max(8, Math.min(a.right - w, window.innerWidth - w - 8)) + 'px' }
}
function onDown(e) { if (!popEl.value?.contains(e.target) && !props.anchor?.contains?.(e.target) && !e.target.closest?.('.cb-list, .date-pop')) emit('close') }
onMounted(() => { place(); window.addEventListener('resize', place); window.addEventListener('scroll', place, true); setTimeout(() => document.addEventListener('mousedown', onDown), 0) })
onBeforeUnmount(() => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); document.removeEventListener('mousedown', onDown) })
</script>

<style scoped>
/* Popover 320px · bo 8 · bóng All 2 · đệm trên 12 · thân đệm ngang 12 · vùng trường đệm 8, các trường cách 12 · chân Neutral 100 */
.tfb { position: fixed; z-index: 9500; width: 320px; max-width: calc(100vw - 16px); max-height: calc(100vh - 16px); display: flex; flex-direction: column; gap: 8px; padding-top: 12px; box-sizing: border-box;
  background: var(--bg-white); border-radius: var(--radius-default); box-shadow: var(--shadow-popover); overflow: hidden; }
.tfb__body { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding: 0 12px; }
.tfb__head { display: flex; align-items: center; gap: 8px; height: 32px; padding: 0 8px; flex-shrink: 0; }
.tfb__title { flex: 1; min-width: 0; margin: 0; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.tfb__fields { display: flex; flex-direction: column; gap: 12px; padding: 8px; }
/* Nhãn trái: cột nhãn = nhãn dài nhất + 8px (tự tính chung mds-ui — utils/autoLabelWidth.js), ô nhập lấp phần còn lại, mọi ô thẳng hàng */
.tfb__fields--horizontal :deep(.input-field--row .input-field__body) { flex: 1; min-width: 0; }
.tfb__range { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.tfb__foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 24px; flex-shrink: 0; background: var(--bg-form-footer); border-top: 1px solid var(--stroke-form-footer); }
</style>
