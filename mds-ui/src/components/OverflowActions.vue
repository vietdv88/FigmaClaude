<template>
  <!-- Dãy nút thao tác tự co theo bề rộng: nút nào không đủ chỗ → gom vào nút ⋯ (bấm xổ menu). Nút “nguy hiểm” (danger) luôn xếp cuối -->
  <div ref="boxEl" class="ofa">
    <!-- Đo bề rộng thật của từng nút (ẩn, không chiếm chỗ) -->
    <div ref="measureEl" class="ofa__measure" aria-hidden="true">
      <button v-for="a in list" :key="a.id" type="button" tabindex="-1" class="btn" :class="a.danger ? 'btn--outline-danger' : 'btn--outline btn--neutral'">
        <TIcon v-if="a.icon" :name="a.icon" />{{ a.label }}
      </button>
    </div>
    <button v-for="a in shown" :key="a.id" type="button" class="btn" :class="a.danger ? 'btn--outline-danger' : 'btn--outline btn--neutral'" @click="$emit('select', a.id)">
      <TIcon v-if="a.icon" :name="a.icon" />{{ a.label }}
    </button>
    <DropdownMenu v-if="hidden.length" :items="hidden.map(a => ({ id: a.id, icon: a.icon, label: a.label, danger: a.danger }))" placement="bottom-end" :min-width="200"
      @select="it => $emit('select', it.id)">
      <template #trigger="{ toggle }">
        <button type="button" class="btn-icon btn-icon--outline" :aria-label="moreLabel" v-tip="moreLabel" @click.stop="toggle"><TIcon name="dots" /></button>
      </template>
    </DropdownMenu>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import TIcon from './TIcon.vue'
import DropdownMenu from './DropdownMenu.vue'
import { vTip } from '../utils/tooltip.js'

/* actions: [{ id, label, icon?, danger? }] — thứ tự ưu tiên hiện (nút đầu luôn hiện trước) · @select(id) */
const props = defineProps({
  actions:   { type: Array,  default: () => [] },
  moreLabel: { type: String, default: 'Thao tác khác' },
  gap:       { type: Number, default: 8 },
})
defineEmits(['select'])

const list = computed(() => props.actions.filter(Boolean))
const boxEl = ref(null), measureEl = ref(null), fit = ref(Infinity)

function measure() {
  const box = boxEl.value, m = measureEl.value
  if (!box || !m) return
  const avail = box.clientWidth
  const widths = [...m.children].map(el => el.getBoundingClientRect().width)
  const total = widths.reduce((s, w) => s + w, 0) + props.gap * Math.max(0, widths.length - 1)
  if (total <= avail) { fit.value = widths.length; return }
  const more = (m.firstElementChild?.getBoundingClientRect().height || 32) + props.gap   // nút ⋯ vuông = cao nút
  let used = more, n = 0
  for (const w of widths) { if (used + w + (n ? props.gap : 0) > avail) break; used += w + (n ? props.gap : 0); n++ }
  fit.value = n
}
const shown = computed(() => list.value.slice(0, fit.value))
const hidden = computed(() => list.value.slice(fit.value))

let ro = null
onMounted(() => {
  measure()
  ro = new ResizeObserver(() => measure()); ro.observe(boxEl.value)
})
onBeforeUnmount(() => ro?.disconnect())
watch(list, () => nextTick(measure), { deep: true })
</script>

<style scoped>
.ofa { position: relative; flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; }
.ofa__measure { position: absolute; left: 0; top: 0; display: flex; gap: 8px; visibility: hidden; pointer-events: none; white-space: nowrap; height: 0; overflow: visible; }
.ofa > .btn { flex-shrink: 0; white-space: nowrap; }
</style>
