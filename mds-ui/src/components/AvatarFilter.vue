<!--
  AvatarFilter — lọc theo người bằng dãy avatar (VD “Người thực hiện” trên danh sách công việc).
  - Bấm avatar → lọc (chọn nhiều được, bấm lại để bỏ); người đang lọc có viền màu chính, người khác mờ đi.
  - Hover avatar → tooltip tên đầy đủ. Không đủ chỗ → nút “+N”; bấm xổ danh sách có ô tìm kiếm (quy tắc tìm chung: không dấu, chữ cái đầu).
  - Người được chọn trong danh sách xổ ra luôn được đưa lên dãy avatar để nhìn thấy.
  Cách dùng:
    <AvatarFilter v-model="ids" label="Người thực hiện" :people="[{ id, name, picture, sub }]" accent="var(--role-pd)" />   (accent: tùy chọn)
-->
<template>
  <div class="avf">
    <span v-if="label" class="avf__label"><span v-if="accent" class="avf__accent" v-tip="accentTip" :aria-label="accentTip || undefined"><span class="avf__accent-in" :style="{ background: accent }" /></span>{{ label }}</span>
    <div class="avf__list" role="group" :aria-label="label || 'Lọc theo người'">
      <button v-for="p in visible" :key="p.id" type="button" class="avf__avatar" :class="{ 'avf__avatar--on': isOn(p.id), 'avf__avatar--dim': modelValue.length && !isOn(p.id) }"
        :aria-pressed="isOn(p.id)" v-tip="p.name + (p.sub ? ` · ${p.sub}` : '')" @click="toggle(p.id)">
        <img v-if="p.picture && !broken[p.id]" :src="p.picture" :alt="p.name" referrerpolicy="no-referrer" @error="broken[p.id] = true" />
        <span v-else class="avf__initials" :style="{ background: avatarColor(p.name).bg }">{{ avatarInitials(p.name) }}</span>
      </button>
      <!-- Chỉ khi danh sách dài quá chỗ: +N → xổ danh sách có ô tìm kiếm -->
      <button v-if="hiddenCount" ref="moreEl" type="button" class="avf__more" :class="{ 'avf__more--open': open }" v-tip="`Thêm ${hiddenCount} người — bấm để tìm`" @click="toggleOpen">+{{ hiddenCount }}</button>
      <button v-if="modelValue.length" type="button" class="btn-icon btn-icon--sm avf__clear" v-tip="'Bỏ lọc người'" @click="emit('update:modelValue', [])"><TIcon name="x" /></button>
    </div>

    <Teleport to="body">
      <div v-if="open" ref="popEl" class="avf-pop" :style="popStyle" @keydown.esc="open = false">
        <div class="avf-pop__search"><AppSearchbox ref="searchEl" v-model="q" placeholder="Tìm người (gõ không dấu được)" /></div>
        <div class="avf-pop__list">
          <button v-for="p in filtered" :key="p.id" type="button" class="avf-pop__item" :class="{ 'avf-pop__item--on': isOn(p.id) }" @click="toggle(p.id)">
            <span class="avf__avatar avf__avatar--sm">
              <img v-if="p.picture && !broken[p.id]" :src="p.picture" :alt="p.name" referrerpolicy="no-referrer" @error="broken[p.id] = true" />
              <span v-else class="avf__initials" :style="{ background: avatarColor(p.name).bg }">{{ avatarInitials(p.name) }}</span>
            </span>
            <span class="avf-pop__text"><span class="avf-pop__name">{{ p.name }}</span><span v-if="p.sub" class="avf-pop__sub">{{ p.sub }}</span></span>
            <TIcon v-if="isOn(p.id)" name="check" class="avf-pop__check" />
          </button>
          <p v-if="!filtered.length" class="avf-pop__empty">Không tìm thấy người phù hợp</p>
        </div>
        <div v-if="modelValue.length" class="avf-pop__foot">
          <span>Đang lọc {{ modelValue.length }} người</span>
          <button type="button" class="btn btn--link btn--sm" @click="emit('update:modelValue', [])">Bỏ lọc</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import TIcon from './TIcon.vue'
import AppSearchbox from './AppSearchbox.vue'
import { vTip } from '../utils/tooltip.js'
import { matchText } from '../utils/search.js'
import { avatarInitials, avatarColor } from '../utils/avatar.js'

const props = defineProps({
  people:     { type: Array, default: () => [] },   // [{ id, name, picture?, sub?, code? }]
  modelValue: { type: Array, default: () => [] },   // id đang lọc
  label:      { type: String, default: '' },
  max:        { type: Number, default: 0 },          // số avatar tối đa; 0 = tự theo bề rộng màn hình
  accent:     { type: String, default: '' },         // màu CSS: chấm màu trước nhãn (khớp màu nhóm cột của DataTable — col.accent)
  accentTip:  { type: String, default: '' },         // tooltip khi di lên chấm màu
})
const emit = defineEmits(['update:modelValue'])
const broken = reactive({})
const isOn = id => props.modelValue.includes(id)
function toggle(id) { emit('update:modelValue', isOn(id) ? props.modelValue.filter(x => x !== id) : [...props.modelValue, id]) }

/* Số avatar hiện được: theo bề rộng màn hình (3 → 10) */
const vw = ref(typeof window === 'undefined' ? 1440 : window.innerWidth)
const onResize = () => { vw.value = window.innerWidth; if (open.value) place() }
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => { window.removeEventListener('resize', onResize); document.removeEventListener('mousedown', onDoc) })
const capacity = computed(() => props.max || Math.min(10, Math.max(3, Math.floor((vw.value - 1000) / 38))))
/* Đủ chỗ → hiện hết, giữ nguyên thứ tự (chọn không nhảy vị trí).
   Quá chỗ → hiện N người đầu; người được chọn từ danh sách xổ ra mà đang bị ẩn → thêm vào CUỐI dãy (người đang hiện giữ nguyên chỗ). */
const visible = computed(() => {
  const all = props.people, cap = capacity.value
  if (all.length <= cap) return all
  const hiddenOn = all.slice(cap).filter(p => isOn(p.id))
  const base = all.slice(0, Math.max(0, cap - hiddenOn.length))
  const baseOnOut = all.slice(base.length, cap).filter(p => isOn(p.id))   // người đã chọn bị đẩy khỏi base → vẫn giữ
  return [...base, ...baseOnOut, ...hiddenOn]
})
const hiddenCount = computed(() => Math.max(0, props.people.length - visible.value.length))

/* Danh sách xổ ra */
const open = ref(false), q = ref(''), moreEl = ref(null), popEl = ref(null), searchEl = ref(null), popStyle = ref({})
const filtered = computed(() => props.people.filter(p => matchText([p.name, p.sub, p.code], q.value)))
function place() {
  const r = moreEl.value?.getBoundingClientRect(); if (!r) return
  const w = 280, left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8)
  popStyle.value = { top: `${r.bottom + 6}px`, left: `${left}px`, width: `${w}px` }
}
function onDoc(e) { if (!popEl.value?.contains(e.target) && !moreEl.value?.contains(e.target)) open.value = false }
async function toggleOpen() {
  open.value = !open.value
  if (!open.value) return
  q.value = ''; place()
  await nextTick()
  popEl.value?.querySelector('input')?.focus()
}
watch(open, v => (v ? document.addEventListener('mousedown', onDoc) : document.removeEventListener('mousedown', onDoc)))
</script>

<style scoped>
.avf { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }
.avf + .avf { margin-left: 12px; }   /* 2 nhóm lọc liền nhau (VD PD · BA) → tách rõ */
/* Chấm 6px như chấm ở tiêu đề cột DataTable · vùng di chuột 14px cho tooltip */
.avf__accent { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin: 0 1px 0 -4px; vertical-align: middle; cursor: help; }
.avf__accent-in { width: 6px; height: 6px; border-radius: 50%; }
.avf__label { flex-shrink: 0; font-size: var(--text-body); color: var(--text-secondary); white-space: nowrap; }
.avf__list { display: inline-flex; align-items: center; gap: 8px; }
/* Avatar = nút bấm → cỡ theo token mật độ (nhỏ: btn-height − 4px) */
.avf__avatar {
  position: relative; flex-shrink: 0; width: calc(var(--btn-height) - 4px); height: calc(var(--btn-height) - 4px);
  padding: 0; border: none; border-radius: 50%; background: none; cursor: pointer; overflow: visible;
  transition: opacity 0.15s, transform 0.15s;
}
.avf__avatar img, .avf__initials { width: 100%; height: 100%; border-radius: 50%; display: block; object-fit: cover; box-sizing: border-box; border: 1px solid var(--stroke-neutral); }   /* Figma Avatar: ảnh viền Stroke/Neutral · chữ cái viền trắng (dưới) — cùng cỡ */
.avf__initials { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; border: 1px solid var(--stroke-white);
  font-size: 10px; font-weight: var(--fw-medium); color: var(--text-primary); line-height: 1; font-feature-settings: 'lnum' 1, 'tnum' 1; }   /* Figma Avatar: chữ 10 Medium Text/Primary, viền trắng 1px — chỉ nền đổi */
.avf__avatar:hover { transform: translateY(-1px); }
.avf__avatar--on { box-shadow: 0 0 0 2px var(--bg-white), 0 0 0 4px var(--bg-brand); }
.avf__avatar--dim { opacity: 0.45; }
.avf__avatar--dim:hover { opacity: 1; }
.avf__avatar--sm { width: 28px; height: 28px; cursor: inherit; }
.avf__avatar--sm:hover { transform: none; }
.avf__more {
  flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
  min-width: calc(var(--btn-height) - 4px); height: calc(var(--btn-height) - 4px); padding: 0 6px;
  border: 1px solid var(--stroke-neutral); border-radius: var(--radius-pill); background: var(--bg-white);
  font-family: inherit; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-secondary); cursor: pointer;
}
.avf__more:hover, .avf__more--open { border-color: var(--stroke-brand); color: var(--text-brand); }
.avf__more .ti { font-size: 14px; }
/* Popover chọn người — chuẩn menu xổ ra (Figma MDS Dropdown Menu, có ô tìm kiếm + dạng Multi Line) */
.avf-pop { position: fixed; z-index: 1100; display: flex; flex-direction: column; max-height: 360px; border-radius: var(--menu-radius); background: var(--bg-white); box-shadow: var(--shadow-popover); }
.avf-pop__search { padding: 4px var(--menu-item-px) var(--menu-pad); }   /* Figma Search: 4 · 12 · 8 · 12 */
.avf-pop__list { flex: 1; overflow-y: auto; padding: var(--menu-pad); display: flex; flex-direction: column; gap: var(--menu-gap); }
.avf-pop__item { display: flex; align-items: center; gap: 8px; flex-shrink: 0; width: 100%; min-height: var(--menu-item-h); padding: 0 var(--menu-item-px); border: none; border-radius: var(--radius-default); background: none; font-family: inherit; text-align: left; cursor: pointer; transition: background 0.12s; }
.avf-pop__item:has(.avf-pop__sub) { min-height: 0; padding-top: 6px; padding-bottom: 6px; }   /* 1 dòng = ĐÚNG --menu-item-h (32 · Rộng 36), không cộng đệm dọc · có dòng phụ = cao theo nội dung: đệm 6 + 20 + khe 2 + 20 + đệm 6 (quy tắc mục 2 dòng) */
.avf-pop__item:hover { background: var(--bg-brand-light); }
.avf-pop__item:active { background: color-mix(in srgb, var(--bg-brand) 12%, var(--bg-white)); }
.avf-pop__item--on { background: var(--bg-brand-light); }
.avf-pop__item--on .avf-pop__name { color: var(--text-brand); font-weight: var(--fw-semibold); }
.avf-pop__text { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.avf-pop__name { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.avf-pop__sub { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.avf-pop__check { font-size: 16px; color: var(--icon-brand); flex-shrink: 0; }
.avf-pop__empty { padding: 12px; text-align: center; font-size: var(--text-body); color: var(--text-secondary); }
.avf-pop__foot { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-top: 1px solid var(--stroke-divider); font-size: var(--text-body); color: var(--text-secondary); }
.avf-pop__foot .btn { padding: 0; height: auto; }
</style>
