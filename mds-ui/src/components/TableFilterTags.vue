<template>
  <!-- Dòng điều kiện đang lọc — Figma “_Conditonal Filter / Box” (6019:136495): mỗi điều kiện 1 tag
       Trường · Điều kiện (chữ Brand) · Giá trị + ✕ bỏ điều kiện · tag nền trắng, viền Stroke/Neutral, bo 8, cao 36, đệm 12 × 8, phần chữ cách 4, ✕ cách 8
       · cuối dòng: Sửa bộ lọc · Xóa tất cả (như app Chấm điểm) -->
  <div v-if="active.length" class="tft" role="group" aria-label="Điều kiện đang lọc">
    <span v-for="c in active" :key="c.id" class="tft__tag">
      <span class="tft__text" v-tip="fullText(c)">
        <span class="tft__field">{{ parts(c).field }}</span>
        <span class="tft__op">{{ parts(c).op }}</span>
        <span v-if="parts(c).value" class="tft__value">{{ parts(c).value }}</span>
      </span>
      <button class="icon-swap icon-swap--16 icon-swap--action" type="button" v-tip="'Bỏ điều kiện'" :aria-label="`Bỏ điều kiện ${fullText(c)}`" @click="$emit('remove', c.id)"><TIcon name="x" /></button>
    </span>
    <span v-if="mode === 'any'" class="tft__mode">(thỏa mãn bất kỳ)</span>
    <button v-if="editable" class="tft__link" type="button" @click="$emit('edit')">Sửa bộ lọc</button>
    <button class="tft__link tft__link--muted" type="button" @click="$emit('clear')">Xóa tất cả</button>
  </div>
</template>

<script setup>
import TIcon from './TIcon.vue'
import { vTip } from '../utils/tooltip.js'
import { describeParts } from '../utils/advancedFilter.js'

const props = defineProps({
  /** Điều kiện đang áp (đã nhập đủ): [{ id, key, op, value, value2 }] */
  active:   { type: Array,    required: true },
  mode:     { type: String,   default: 'all' },
  /** key → field { label, type, options } */
  fieldOf:  { type: Function, required: true },
  /** Định dạng ngày ISO → hiển thị (mặc định DD/MM/YYYY) */
  fmtDate:  { type: Function, default: undefined },
  /** Hiện link “Sửa bộ lọc” (mở lại panel bộ lọc) */
  editable: { type: Boolean,  default: true },
})
defineEmits(['remove', 'clear', 'edit'])
const parts = c => describeParts(c, props.fieldOf(c.key), props.fmtDate)
const fullText = c => { const p = parts(c); return [p.field, p.op, p.value].filter(Boolean).join(' ') }
</script>

<style scoped>
.tft { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 0 12px 8px; font-size: var(--text-body); }
.tft__tag { display: inline-flex; align-items: center; gap: 8px; max-width: 360px; height: 36px; padding: 8px 12px; box-sizing: border-box;
  border: 1px solid var(--stroke-neutral); border-radius: var(--radius-default); background: var(--bg-white); }
.tft__text { display: inline-flex; align-items: center; gap: 4px; min-width: 0; overflow: hidden; white-space: nowrap; line-height: var(--text-body-lh); }
.tft__field, .tft__value { color: var(--text-primary); }
.tft__op { color: var(--text-brand); flex-shrink: 0; }
.tft__value { overflow: hidden; text-overflow: ellipsis; }
.tft__field { flex-shrink: 0; }
.tft__mode { color: var(--text-secondary); }
.tft__link { padding: 0; border: none; background: none; cursor: pointer; font: inherit; font-size: var(--text-body); color: var(--text-link); }
.tft__link:hover { text-decoration: underline; }
.tft__link--muted { color: var(--text-secondary); }
</style>
