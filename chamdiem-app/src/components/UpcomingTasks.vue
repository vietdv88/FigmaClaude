<template>
  <!-- Việc sắp đến hạn (thẻ nhỏ, 1 cột cạnh biểu đồ): việc chưa xong theo deadline phần đang làm — chỉ tên việc + thời hạn.
       Người quản lý (Quản trị hệ thống / Quản trị PD, BA / Quản trị dự án / quản lý trực tiếp): chuyển “Của tôi | Tất cả” — Tất cả = việc của mọi người mình quản lý / được xem -->
  <div class="card upc">
    <div class="card__head">
      <span class="card-title upc__title">Việc sắp đến hạn
        <InfoTip :text="scope === 'all' ? allTip : 'Việc của bạn chưa xong, theo deadline phần bạn đang làm: phân tích → Deadline phân tích · thiết kế → Deadline thiết kế. Quá hạn lâu nhất lên đầu, rồi đến hôm nay, sắp tới.'" />
        <span v-if="items.length" class="upc__count">{{ total > items.length ? `${items.length}/${total}` : items.length }}</span>
      </span>
      <div v-if="canAll" class="upc-seg" role="tablist" aria-label="Việc của">
        <button v-for="o in SCOPES" :key="o.id" type="button" role="tab" class="upc-seg__btn" :class="{ 'upc-seg__btn--on': scope === o.id }" :aria-selected="scope === o.id" @click="scope = o.id">{{ o.label }}</button>
      </div>
    </div>
    <div class="upc__list">
      <p v-if="!items.length" class="upc__empty">Không có việc nào sắp đến hạn</p>
      <button v-for="x in items" :key="x.t.id" type="button" class="upc__item" :class="{ 'upc__item--on': taskId === x.t.id }" @click="taskId = x.t.id">
        <!-- Xem “Tất cả”: avatar người đang phụ trách phần việc -->
        <UserAvatar v-if="scope === 'all'" class="upc__av" :name="x.who" :picture="avatarOf(userById(x.whoId))" :title="x.who" />
        <span class="upc__main">
          <span class="upc__name" v-tip="x.t.content">{{ x.t.content }}</span>
          <span v-if="scope === 'all' && x.who" class="upc__who">{{ x.who }}</span>
        </span>
        <span class="upc__due" :class="`upc__due--${x.tone}`">{{ x.label }}</span>
      </button>
    </div>
    <TaskDrawer v-if="taskId" :task-id="taskId" @close="taskId = null" />
  </div>
</template>

<script setup>
import { vTip } from '@mds/utils/tooltip.js'
import { avatarOf } from '../store/avatar.js'
import { ref, computed } from 'vue'
import InfoTip from './InfoTip.vue'
import TaskDrawer from './TaskDrawer.vue'
import UserAvatar from './UserAvatar.vue'
import { db, currentUser, userById, userName, isAdmin, myDeptAdmin, realManager, isManagerOf, canSeeTask } from '../store/db.js'
import { userPref } from '../store/userPrefs.js'
import { phaseOf, DONE_STATUSES, isPending } from '../store/scoring.js'

// phase: chỉ phần đó khi xem “Tất cả” — Báo cáo PD: 'design' · Báo cáo BA: 'analysis' ('' = cả hai)
const props = defineProps({ projectId: { type: String, default: '' }, limit: { type: Number, default: 30 }, phase: { type: String, default: '' } })
const taskId = ref(null)
const DAY = 86400e3
/* Phần đang làm là của tôi và chưa xong: phân tích (BA) / thiết kế (PD) */
// Việc Pending (tạm dừng) không tính là quá hạn / sắp đến hạn
const mineNow = (t, me) => !isPending(t) && (phaseOf(t) === 'analysis' ? t.baId === me && !t.baCompletedDate : t.pdId === me && !t.completedDate && !DONE_STATUSES.includes(t.designStatus))
/* Deadline phần đang làm: phân tích → Deadline phân tích · thiết kế → Deadline thiết kế */
const dueOf = t => (phaseOf(t) === 'analysis' ? t.baDeadline : t.expectedDate)

/* Phần đang làm chưa xong (của bất kỳ ai) + người đang làm phần đó */
const openNow = t => !isPending(t) && (phaseOf(t) === 'analysis' ? !!t.baId && !t.baCompletedDate : !!t.pdId && !t.completedDate && !DONE_STATUSES.includes(t.designStatus))
const assigneeOf = t => (phaseOf(t) === 'analysis' ? t.baId : t.pdId)

/* “Tất cả” cho người quản lý: Quản trị hệ thống mọi việc · Quản trị PD phần thiết kế · Quản trị BA phần phân tích ·
   Quản trị dự án việc trong dự án mình quản trị · quản lý trực tiếp việc của người mình quản lý */
const canAll = computed(() => isAdmin() || !!myDeptAdmin() || db.projects.some(p => realManager(p.id)) || db.users.some(u => isManagerOf(currentUser.value, u)))
const SCOPES = [{ id: 'mine', label: 'Của tôi' }, { id: 'all', label: 'Tất cả' }]
const scopePref = userPref('upcoming-scope', 'all')
const scope = computed({ get: () => (canAll.value ? scopePref.value : 'mine'), set: v => { scopePref.value = v } })
const allTip = 'Việc chưa xong của mọi người bạn quản lý / được xem (Quản trị: mọi việc · Quản trị PD / BA: phần của bộ phận · Quản trị dự án: dự án mình · quản lý trực tiếp: người mình quản lý), theo deadline phần đang làm. Quá hạn lâu nhất lên đầu.'
function managesTask(t) {
  if (!canSeeTask(t)) return false
  if (isAdmin()) return true
  const ph = phaseOf(t) === 'analysis' ? 'BA' : 'PD'
  if (myDeptAdmin() === ph) return true
  if (realManager(t.projectId)) return true
  return isManagerOf(currentUser.value, userById(assigneeOf(t)))
}
const inPhase = t => !props.phase || (props.phase === 'analysis' ? phaseOf(t) === 'analysis' : phaseOf(t) !== 'analysis')

const all = computed(() => {
  const me = currentUser.value?.id, now = new Date(new Date().toISOString().slice(0, 10)).getTime(), everyone = scope.value === 'all'
  return db.tasks
    .filter(t => dueOf(t) && (!props.projectId || t.projectId === props.projectId)
      && (everyone ? openNow(t) && inPhase(t) && (assigneeOf(t) === me || managesTask(t)) : mineNow(t, me)))
    .map(t => ({ t, days: Math.round((new Date(dueOf(t)).getTime() - now) / DAY) }))
    .sort((a, b) => a.days - b.days)   // quá hạn lâu nhất lên đầu → quá hạn ít → hôm nay → sắp tới (gần trước)
})
const total = computed(() => all.value.length)
const items = computed(() => all.value
    .slice(0, props.limit)
    .map(x => ({ ...x, whoId: assigneeOf(x.t), who: userName(assigneeOf(x.t)),
      label: x.days < 0 ? `Quá hạn ${-x.days} ngày` : x.days === 0 ? 'Hôm nay' : x.days === 1 ? 'Ngày mai' : `Còn ${x.days} ngày`,
      tone: x.days < 0 ? 'danger' : x.days <= 2 ? 'warning' : 'neutral' })))
</script>

<style scoped>
.upc { display: flex; flex-direction: column; min-width: 0; }
.card__head { display: flex; align-items: center; justify-content: space-between; gap: 6px 8px; flex-wrap: wrap; }
.card-title { font-size: var(--text-h3); font-weight: var(--fw-semibold); line-height: var(--text-h3-lh); color: var(--text-primary); }
.upc__title { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.upc__count { min-width: 22px; padding: 0 6px; border-radius: var(--radius-pill); background: var(--bg-neutral-light); font-size: var(--text-sm); line-height: 20px; font-weight: var(--fw-semibold); color: var(--text-secondary); text-align: center; }
/* Cùng chiều cao vùng biểu đồ (260px) để thẳng hàng các cột */
.upc__list { height: 260px; margin-top: var(--card-gap); overflow-y: auto; display: flex; flex-direction: column; margin-left: -8px; margin-right: -8px; }
.upc__empty { margin: auto; font-size: var(--text-body); color: var(--text-secondary); }
.upc__item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px; border: none; border-radius: calc(var(--radius-default) - 2px); background: none; font-family: inherit; text-align: left; cursor: pointer; }
.upc__item { position: relative; }
/* Vạch ngăn mảnh giữa các việc (thụt 8px 2 bên cho khớp nền bo góc khi rê chuột / đang chọn) */
.upc__item + .upc__item::before { content: ''; position: absolute; top: 0; left: 8px; right: 8px; height: 1px; background: var(--stroke-neutral-light); }
.upc__item:hover::before, .upc__item:hover + .upc__item::before, .upc__item--on::before, .upc__item--on + .upc__item::before { opacity: 0; }
.upc__item:hover { background: var(--bg-brand-light); }
.upc__item--on { background: var(--bg-brand-light); }
.upc__name { flex: 1; min-width: 0; font-size: var(--text-body); font-weight: var(--fw-medium); color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.upc__main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }   /* tên việc · người phụ trách — giãn nhẹ cho dễ đọc */
.upc__av { width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; }
.upc__main .upc__name { flex: none; }
.upc__who { font-size: var(--text-body); line-height: var(--text-sm-lh, 16px); color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.upc-seg { display: inline-flex; align-items: center; gap: 2px; padding: 2px; border-radius: var(--radius-default); background: var(--bg-neutral-light); flex-shrink: 0; }
.upc-seg__btn { font-weight: var(--fw-semibold); height: calc(var(--btn-height) - 8px); padding: 0 8px; border: none; border-radius: calc(var(--radius-default) - 2px); background: transparent; font-family: inherit; font-size: var(--text-body); color: var(--text-primary); cursor: pointer; white-space: nowrap; }
.upc-seg__btn:hover:not(.upc-seg__btn--on) { color: var(--text-primary); background: var(--bg-brand-light); }
.upc-seg__btn--on { background: var(--bg-white); color: var(--text-brand); box-shadow: var(--shadow-sm); }
.upc__due { flex-shrink: 0; font-size: var(--text-body); font-weight: var(--fw-medium); white-space: nowrap; }
.upc__due--danger { color: var(--text-danger); }
.upc__due--warning { color: var(--text-warning); }
.upc__due--neutral { color: var(--text-secondary); }
</style>
