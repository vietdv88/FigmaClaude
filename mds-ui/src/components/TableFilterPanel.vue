<template>
  <!-- Bộ lọc Advance (Figma “Body Filter / Advance Expand” 6019:136462) — chuyển nguyên từ app Chấm điểm (AdvancedFilterPanel):
       panel bên phải bảng, đẩy danh sách sang trái · tick 1 trường → hiện toán tử + giá trị ngay dưới (tại chỗ) ·
       Áp dụng = thỏa mãn TẤT CẢ trường đã tick · (tuỳ chọn) Đã lưu: bộ lọc lưu sẵn, mục đang dùng nền Brand Light + nút … -->
  <aside class="afp">
    <div class="afp__head">
      <span class="afp__title">Bộ lọc</span>
      <button class="btn-icon" type="button" v-tip="'Đóng'" aria-label="Đóng" @click="$emit('close')"><TIcon name="x" /></button>
    </div>
    <template v-if="saved.length">
      <button type="button" class="afp__section" :aria-expanded="savedOpen" @click="savedOpen = !savedOpen">
        <span>Đã lưu</span><TIcon :name="savedOpen ? 'chevron-up' : 'chevron-down'" />
      </button>
      <div v-if="savedOpen" class="afp__saved" role="listbox" aria-label="Bộ lọc đã lưu">
        <div v-for="sv in saved" :key="sv.id" class="afp__saved-item" :class="{ 'afp__saved-item--on': sv.id === activeSaved }"
          role="option" :aria-selected="sv.id === activeSaved" tabindex="0" @click="useSaved(sv)" @keydown.enter.prevent="useSaved(sv)">
          <span class="afp__saved-label">{{ sv.label }}</span>
          <DropdownMenu v-if="sv.id === activeSaved && savedActions.length" :items="savedActions" placement="bottom-end" :min-width="160" @select="a => $emit('saved-action', { action: a.id, item: sv })">
            <template #trigger="{ toggle }">
              <button type="button" class="icon-swap icon-swap--16 icon-swap--action icon-swap--brand" v-tip="'Thao tác'" aria-label="Thao tác với bộ lọc đã lưu" @click.stop="toggle"><TIcon name="dots" /></button>
            </template>
          </DropdownMenu>
        </div>
      </div>
      <p class="afp__section afp__section--static">Tiêu chí lọc</p>
    </template>
    <div class="afp__search">
      <AppSearchbox v-model="q" placeholder="Tìm kiếm" />
    </div>

    <div class="afp__list">
      <div v-for="f in shownFields" :key="f.key" class="afp__item" :class="{ 'afp__item--on': draft[f.key] }">
        <AppCheckbox :model-value="!!draft[f.key]" :label="f.label" @update:model-value="v => toggle(f, v)" />
        <div v-if="draft[f.key]" :ref="el => (bodyEls[f.key] = el)" class="afp__body">
          <!-- Toán tử + giá trị: FilterConditionEditor dùng chung với lọc theo cột trên tiêu đề DataTable -->
          <FilterConditionEditor :field="f" :model-value="draft[f.key]" @update:model-value="c => (draft[f.key] = c)" @enter="apply" />
        </div>
      </div>
      <p v-if="!shownFields.length" class="afp__empty">Không tìm thấy trường phù hợp</p>
    </div>

    <div class="afp__foot">
      <button class="btn btn--outline btn--neutral" type="button" :disabled="!hasDraft && !filter.conditions.length" @click="clearAll">Bỏ lọc</button>
      <button class="btn btn--primary" type="button" @click="apply">Áp dụng</button>
    </div>
  </aside>
</template>

<script setup>
import { vTip } from '../utils/tooltip.js'
import { ref, computed, watch, nextTick } from 'vue'
import TIcon        from './TIcon.vue'
import AppCheckbox  from './AppCheckbox.vue'
import AppSearchbox from './AppSearchbox.vue'
import FilterConditionEditor from './FilterConditionEditor.vue'
import DropdownMenu from './DropdownMenu.vue'
import { newCondition } from '../utils/advancedFilter.js'

/* Bộ lọc nâng cao dạng panel bên phải (đẩy danh sách sang trái):
   tick 1 trường → hiện toán tử + giá trị ngay dưới; Áp dụng = thỏa mãn TẤT CẢ trường đã tick. */
const props = defineProps({
  /** [{ key, label, type: 'text' | 'enum' | 'number' | 'date', options?, multi?, get(row) }] */
  fields: { type: Array,  required: true },
  /** Bộ lọc đang áp: { mode: 'all' | 'any', conditions } — lọc dòng bằng testRow() trong utils/advancedFilter.js */
  filter: { type: Object, required: true },
  /** Bộ lọc đã lưu (tuỳ chọn): [{ id, label, filter: { mode, conditions } }] */
  saved:  { type: Array,  default: () => [] },
  /** Thao tác nút … của bộ lọc đã lưu đang dùng → emit('saved-action', { action, item }) */
  savedActions: { type: Array, default: () => [{ id: 'rename', label: 'Đổi tên', icon: 'pencil' }, { id: 'delete', label: 'Xóa', icon: 'trash', danger: true }] },
})
const emit = defineEmits(['apply', 'close', 'saved-action'])
const savedOpen = ref(true), activeSaved = ref('')
/* Chọn bộ lọc đã lưu → nạp vào bản nháp (bấm Áp dụng để lọc) */
function useSaved(sv) {
  activeSaved.value = sv.id
  const d = {}
  for (const c of sv.filter?.conditions || []) if (!d[c.key]) d[c.key] = { ...c }
  draft.value = d
}

const q = ref('')
const draft = ref({})          // { [fieldKey]: condition }
const bodyEls = {}

/* Nạp lại khi bộ lọc đổi từ ngoài (bỏ chip, xóa tất cả…) — mỗi trường 1 điều kiện */
watch(() => props.filter, f => {
  const d = {}
  for (const c of f.conditions) if (!d[c.key] && props.fields.some(x => x.key === c.key)) d[c.key] = { ...c }
  draft.value = d
}, { immediate: true, deep: true })

const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase()
const shownFields = computed(() => {
  const k = norm(q.value.trim())
  return k ? props.fields.filter(f => norm(f.label).includes(k)) : props.fields
})
const hasDraft = computed(() => Object.keys(draft.value).length > 0)

async function toggle(f, on) {
  if (!on) { delete draft.value[f.key]; return }
  draft.value[f.key] = newCondition(f)
  await nextTick()
  bodyEls[f.key]?.querySelectorAll('input, select, .cb-trigger')[1]?.focus()   // ô giá trị (sau ô toán tử)
}
function apply() {
  emit('apply', { mode: 'all', conditions: Object.values(draft.value).map(c => ({ ...c })) })
}
function clearAll() {
  draft.value = {}; activeSaved.value = ''
  emit('apply', { mode: 'all', conditions: [] })
}
</script>

<style scoped>
.afp {
  width: 300px; flex-shrink: 0; min-height: 0;
  display: flex; flex-direction: column;
  background: var(--bg-white); border-radius: var(--radius-card); box-shadow: var(--shadow-card);
  overflow: hidden;
}
.afp__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: var(--card-py) var(--card-px) 0; }
.afp__title { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.afp__search { padding: 12px var(--card-px) 8px; }
/* Đã lưu (Figma Menu Header + Menu List): tiêu đề nhóm 13 Semi Bold cao 32 · mục cao 32, đệm 12, bo 8 · đang dùng: Brand Light + chữ Brand + nút … */
.afp__section { display: flex; align-items: center; justify-content: space-between; gap: 8px; height: 32px; margin: 8px calc(var(--card-px) - 8px) 0; padding: 0 8px; border: none; background: none;
  font: inherit; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); text-align: left; cursor: pointer; }
.afp__section .ti { font-size: 16px; color: var(--icon-neutral); }
.afp__section--static { cursor: default; margin-bottom: 0; }
.afp__saved { display: flex; flex-direction: column; padding: 0 calc(var(--card-px) - 8px); }
.afp__saved-item { display: flex; align-items: center; gap: 8px; height: 32px; padding: 0 12px; border-radius: var(--radius-default); font-size: var(--text-body); color: var(--text-primary); cursor: pointer; }
.afp__saved-item:hover { background: var(--bg-brand-light); }
.afp__saved-item:active { background: var(--bg-brand-light-pressed); }
.afp__saved-item:focus-visible { outline: 1px solid var(--stroke-brand); outline-offset: -1px; }
.afp__saved-item--on { background: var(--bg-brand-light); color: var(--text-brand); }
.afp__saved-item--on:hover { background: var(--bg-brand-light-hover); }
.afp__saved-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.afp__list { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; padding: 0 calc(var(--card-px) - 8px) 12px; }
.afp__item { display: flex; flex-direction: column; gap: 8px; padding: 6px 8px; border-radius: var(--radius-default); }
.afp__item--on { background: var(--bg-brand-light); padding: 8px 8px 12px; margin: 4px 0; }
.afp__body { display: flex; flex-direction: column; gap: 8px; }
.afp__empty { padding: 12px 8px; font-size: var(--text-body); color: var(--text-secondary); }
.afp__foot {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: var(--footer-py) var(--card-px);
  border-top: 1px solid var(--stroke-form-footer);
  background: var(--bg-form-footer);
}
</style>
