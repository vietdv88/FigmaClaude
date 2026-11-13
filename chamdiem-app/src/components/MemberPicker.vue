<template>
  <button ref="btnEl" class="btn btn--link" type="button" @click="toggle">
    <TIcon name="plus" />{{ label }}
  </button>
  <Teleport to="body">
    <div v-if="open" ref="popEl" class="mpick" :style="popStyle">
      <AppSearchbox v-model="q" :placeholder="kind === 'user' ? 'Tìm theo tên, email, tài khoản…' : 'Tìm theo tên, mã dự án…'" @keydown="onKey" />
      <div class="mpick__list" role="listbox">
        <template v-for="(u, i) in results" :key="u.id">
        <!-- Chưa gõ tìm: nhóm “Gần đây” (người vừa chọn) lên đầu · sau đó là tất cả -->
        <p v-if="recentCount && i === 0" class="mpick__group"><TIcon name="clock" />Gần đây</p>
        <p v-if="frequentCount && i === recentCount" class="mpick__group"><TIcon name="star" />Hay được chọn</p>
        <p v-if="(recentCount || frequentCount) && i === recentCount + frequentCount" class="mpick__group">Tất cả</p>
        <button
          type="button"
          class="mpick__item" :class="{ 'mpick__item--active': i === active }"
          role="option" @mouseenter="active = i" @click="add(u)"
        >
          <UserAvatar v-if="kind === 'user'" class="mpick__avatar" :name="u.name" :picture="avatarOf(u)" />
          <span v-else class="mpick__icon"><TIcon name="briefcase" /></span>
          <span class="mpick__text">
            <span class="mpick__name">{{ u.name }}</span>
            <span v-if="subOf(u)" class="mpick__sub">{{ subOf(u) }}</span>
          </span>
          <span v-if="frequentCounts[u.id] && i >= recentCount && i < recentCount + frequentCount" class="mpick__count" v-tip="`Đang là quản lý của ${frequentCounts[u.id]} người`">{{ frequentCounts[u.id] }}</span>
          <AppTag v-if="kind === 'user'" :label="roleLabelOf(u) || '—'" :color="ROLE_COLOR[u.role] ?? 'neutral'" />
        </button>
        </template>
        <p v-if="!results.length" class="mpick__empty">{{ q ? `Không tìm thấy ${noun} phù hợp` : `Đã thêm hết ${noun}` }}</p>
      </div>
      <p class="mpick__hint">↑ ↓ chọn · Enter thêm · Esc đóng</p>
    </div>
  </Teleport>
</template>

<script setup>
import { avatarOf } from '../store/avatar.js'
import { useEscClose } from '@mds/utils/escStack.js'
import { matchText } from '@mds/utils/search.js'
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import TIcon        from '@mds/components/TIcon.vue'
import AppTag       from '@mds/components/AppTag.vue'
import AppSearchbox from '@mds/components/AppSearchbox.vue'
import { roleLabelOf } from '../store/db.js'
import UserAvatar from './UserAvatar.vue'
import { readPref, writePref } from '../store/userPrefs.js'
import { vTip } from '@mds/utils/tooltip.js'

const props = defineProps({
  users:      { type: Array,  required: true },     // ứng viên có thể thêm
  excludeIds: { type: Array,  default: () => [] },  // đã là thành viên
  label:      { type: String, default: 'Thêm nhân viên' },
  kind:       { type: String, default: 'user' },    // 'user' | 'project' (item có name + code)
  recentKey:  { type: String, default: '' },        // có → nhớ người / dự án vừa chọn (theo người dùng), hiện nhóm “Gần đây” lên đầu
  frequent:   { type: Array,  default: () => [] },  // [{ id, count }] — nhóm “Hay được chọn” (VD người đang làm quản lý cho nhiều người nhất), sau “Gần đây"
})
const RECENT_MAX = 8
const recentIds = ref(props.recentKey ? readPref(props.recentKey, []) : [])
const noun  = computed(() => (props.kind === 'user' ? 'nhân viên' : 'dự án'))
const subOf = u => (props.kind === 'user' ? (u.email || u.code) : u.code)
const emit = defineEmits(['add'])
const ROLE_COLOR = { admin: 'danger', QA: 'neutral', PO: 'brand', BA: 'warning', PD: 'success' }

const open = ref(false), q = ref(''), active = ref(0)
const btnEl = ref(null), popEl = ref(null), popStyle = ref({})

const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase()
const available = computed(() => props.users.filter(u => !props.excludeIds.includes(u.id)))
/* Người / dự án vừa chọn (còn chọn được) — chỉ hiện khi chưa gõ tìm */
const recentList = computed(() => (q.value.trim() ? [] : recentIds.value.map(id => available.value.find(u => u.id === id)).filter(Boolean)))
const recentCount = computed(() => recentList.value.length)
const frequentCounts = computed(() => Object.fromEntries(props.frequent.map(f => [f.id, f.count])))
const frequentList = computed(() => (q.value.trim() ? [] : props.frequent.map(f => available.value.find(u => u.id === f.id)).filter(u => u && !recentList.value.includes(u)).slice(0, 6)))
const frequentCount = computed(() => frequentList.value.length)
const results = computed(() => {
  const k = norm(q.value.trim())
  const rest = available.value
    .filter(u => !k || matchText([u.name, u.email, u.companyEmail, u.code], k))   // bỏ dấu + chữ cái đầu
    .filter(u => !recentList.value.includes(u) && !frequentList.value.includes(u))
  return [...recentList.value, ...frequentList.value, ...rest].slice(0, 60)
})
watch(results, () => { active.value = 0 })

function place() {
  const r = btnEl.value.getBoundingClientRect()
  const W = 360, H = 360
  const left = Math.min(Math.max(8, r.left), window.innerWidth - W - 8)
  popStyle.value = window.innerHeight - r.bottom >= H + 8
    ? { left: left + 'px', top: r.bottom + 4 + 'px', width: W + 'px' }
    : { left: left + 'px', bottom: window.innerHeight - r.top + 4 + 'px', width: W + 'px' }
}
async function toggle() {
  if (open.value) return close()
  place(); open.value = true; q.value = ''
  await nextTick()
  popEl.value?.querySelector('input')?.focus()
  document.addEventListener('mousedown', onOutside, true)
  window.addEventListener('resize', place)
}
function close() {
  open.value = false
  document.removeEventListener('mousedown', onOutside, true)
  window.removeEventListener('resize', place)
}
function onOutside(e) {
  if (popEl.value?.contains(e.target) || btnEl.value?.contains(e.target)) return
  close()
}
/** Thêm xong vẫn mở để thêm tiếp nhiều người */
function add(u) {
  if (props.recentKey) { recentIds.value = [u.id, ...recentIds.value.filter(id => id !== u.id)].slice(0, RECENT_MAX); writePref(props.recentKey, recentIds.value) }
  emit('add', u.id)
  nextTick(() => popEl.value?.querySelector('input')?.focus())
}
function onKey(e) {
  if (e.key === 'ArrowDown') { e.preventDefault(); active.value = Math.min(active.value + 1, results.value.length - 1) }
  if (e.key === 'ArrowUp')   { e.preventDefault(); active.value = Math.max(active.value - 1, 0) }
  if (e.key === 'Enter' && results.value[active.value]) { e.preventDefault(); add(results.value[active.value]) }
}
onBeforeUnmount(close)
useEscClose(() => close(), () => !!open.value)   // ESC đóng ô tìm (lớp trên popup chứa nó)
</script>

<style scoped>
.mpick {
  position: fixed; z-index: 9600;
  display: flex; flex-direction: column; gap: 8px;   /* ô tìm kiếm ↔ danh sách 8px (chuẩn ô tìm kiếm trong menu: đệm dưới 8) */
  padding: var(--menu-pad); border-radius: var(--menu-radius);
  background: var(--bg-white); box-shadow: var(--shadow-popover);   /* chuẩn menu xổ ra mds-ui */
}
.mpick__list { max-height: 260px; overflow-y: auto; display: flex; flex-direction: column; gap: var(--menu-gap); }
.mpick__item {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 6px var(--menu-item-px); border: none; border-radius: var(--menu-radius); background: transparent;   /* 2 dòng (tên + mã / email): cao theo nội dung 6 + 20 + 2 + 20 + 6 — không theo chiều cao mục 1 dòng của mật độ */
  cursor: pointer; text-align: left; font-family: inherit;
}
.mpick__item--active { background: var(--bg-brand-light); }
.mpick__avatar {
  width: 28px; height: 28px; flex-shrink: 0; border-radius: var(--radius-pill);
  box-sizing: border-box; border: 1px solid var(--stroke-neutral-light);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: var(--text-sm); font-weight: var(--fw-semibold);
}
.mpick__icon {
  width: 28px; height: 28px; flex-shrink: 0; border-radius: var(--radius-default);
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--bg-brand-light); color: var(--icon-brand); font-size: 16px;
}
.mpick__text { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.mpick__name { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mpick__sub  { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mpick__group { display: flex; align-items: center; gap: 4px; padding: 6px 8px 2px; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-secondary); }
.mpick__group .ti { font-size: 14px; }
.mpick__count { min-width: 20px; padding: 0 6px; border-radius: var(--radius-pill); background: var(--bg-neutral-light); font-size: 11px; line-height: 18px; font-weight: var(--fw-semibold); color: var(--text-secondary); text-align: center; }
.mpick__empty { padding: 12px 8px; font-size: var(--text-body); color: var(--text-secondary); }
.mpick__hint { font-size: var(--text-body); color: var(--text-hint); }
</style>
