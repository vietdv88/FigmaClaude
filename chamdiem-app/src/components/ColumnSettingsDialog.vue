<template>
  <DialogShell title="Thiết lập cột" :width="440" @close="$emit('close')">
    <div class="cols">
      <div class="cols__bar">
        <span class="cols__count">Đang hiện {{ visibleCount }}/{{ draft.length }} cột · kéo <TIcon name="grip-vertical" /> để đổi thứ tự</span>
        <div class="cols__bulk">
          <button class="cols__link" type="button" @click="setAll(true)">Hiện tất cả</button>
          <button class="cols__link" type="button" @click="setAll(false)">Ẩn tất cả</button>
        </div>
      </div>
      <ul class="cols__list">
        <li
          v-for="(item, i) in draft" :key="item.key"
          class="cols__item"
          :class="{ 'cols__item--dragging': dragIndex === i, 'cols__item--over': overIndex === i && dragIndex !== i }"
          draggable="true"
          @dragstart="onDragStart(i, $event)"
          @dragover.prevent="overIndex = i"
          @dragleave="overIndex === i && (overIndex = null)"
          @drop.prevent="onDrop(i)"
          @dragend="dragIndex = overIndex = null"
        >
          <span class="cols__grip" v-tip="'Kéo để đổi thứ tự'"><TIcon name="grip-vertical" /></span>
          <span v-if="locked.includes(item.key)" class="cols__locked">
            <span class="icon-swap icon-swap--16"><TIcon name="lock" /></span>{{ labelOf(item.key) }}
            <span class="cols__locked-note">luôn hiện</span>
          </span>
          <AppCheckbox v-else :model-value="item.visible" :label="labelOf(item.key)" @update:model-value="v => item.visible = v" />
        </li>
      </ul>
    </div>
    <template #footer>
      <button class="btn btn--outline btn--neutral cols__reset" @click="draft = defaults()">Khôi phục mặc định</button>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
      <button class="btn btn--primary" @click="$emit('apply', draft); $emit('close')">Áp dụng</button>
    </template>
  </DialogShell>
</template>

<script setup>
import { vTip } from '@mds/utils/tooltip.js'
import { ref, computed } from 'vue'
import DialogShell from './DialogShell.vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'

const props = defineProps({
  columns:  { type: Array,    required: true },  // định nghĩa cột gốc (lấy label)
  state:    { type: Array,    required: true },  // [{ key, visible }] theo thứ tự hiện tại
  locked:   { type: Array,    default: () => [] },
  defaults: { type: Function, required: true },
})
defineEmits(['apply', 'close'])

const draft = ref(props.state.map(s => ({ ...s })))
const labelOf = k => props.columns.find(c => c.key === k)?.label ?? k
const visibleCount = computed(() => draft.value.filter(s => s.visible || props.locked.includes(s.key)).length)
function setAll(v) { draft.value.forEach(s => { s.visible = v || props.locked.includes(s.key) }) }

/* Kéo thả đổi thứ tự (HTML5 drag & drop) */
const dragIndex = ref(null)
const overIndex = ref(null)
function onDragStart(i, e) {
  dragIndex.value = i
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', String(i))
}
function onDrop(i) {
  const from = dragIndex.value
  if (from == null || from === i) return
  const list = [...draft.value]
  const [moved] = list.splice(from, 1)
  list.splice(i, 0, moved)
  draft.value = list
  dragIndex.value = overIndex.value = null
}
</script>

<style scoped>
.cols { display: flex; flex-direction: column; gap: 8px; }
.cols__bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.cols__count { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-sm); color: var(--text-secondary); }
.cols__bulk { display: flex; gap: 12px; }
.cols__link { padding: 0; border: none; background: none; cursor: pointer; font-family: inherit; font-size: var(--text-body); color: var(--text-link); }
.cols__link:hover { text-decoration: underline; }
.cols__list {
  list-style: none; margin: 0; padding: 4px;
  max-height: 52vh; overflow-y: auto;
  border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default);
}
.cols__item {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 8px; border-radius: var(--radius-inner);
  border-top: 2px solid transparent;
  cursor: grab; background: var(--bg-white);
}
.cols__item:hover { background: var(--bg-brand-light); }
.cols__item--dragging { opacity: 0.4; }
.cols__item--over { border-top-color: var(--stroke-brand); }
.cols__grip { display: inline-flex; color: var(--icon-neutral); font-size: 16px; }
.cols__locked { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; line-height: 20px; color: var(--text-primary); }
.cols__locked .icon-swap { width: 20px; }
.cols__locked-note { font-size: var(--text-body); color: var(--text-secondary); }
.cols__reset { margin-right: auto; }
</style>
