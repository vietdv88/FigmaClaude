<template>
  <!-- Dự án yêu thích (☆) — 1 hàng chip lối tắt (không phải KPI): bấm → vòng lặp đang chạy (bỏ ghim ở danh sách Dự án / trang dự án) -->
  <section class="fav">
    <div class="fav__head">
      <span class="fav__title"><TIcon name="star-filled" class="fav__star" />Dự án yêu thích</span>
      <router-link class="btn btn--link btn--sm fav__all" to="/du-an">Tất cả dự án<TIcon name="chevron-right" /></router-link>
    </div>
    <p v-if="!chips.length" class="fav__empty">Bấm ☆ ở danh sách Dự án (hoặc cạnh tên dự án) để ghim dự án hay dùng lên đây.</p>
    <div v-else class="fav__list">
      <div v-for="c in chips" :key="c.id" class="fav__chip" role="link" tabindex="0" v-tip="c.tip" @click="open(c)" @keydown.enter="open(c)">
        <span class="fav__logo" :class="{ 'fav__logo--initials': !c.logo }"><img v-if="c.logo" :src="c.logo" alt="" /><template v-else>{{ c.initials }}</template></span>
        <span class="fav__name">{{ c.name }}</span>
        <span v-if="c.iter" class="fav__iter">· {{ c.iter.name }}</span>
        <span v-if="c.count" class="fav__count" :class="{ 'fav__count--warn': c.warn }">{{ c.count }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import TIcon from '@mds/components/TIcon.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { favProjectIds } from '../store/favorites.js'
import { db, currentUser, projectById, iterationsOf, canApproveBa } from '../store/db.js'
import { phaseOf, taskStatusOf, DONE_STATUSES } from '../store/scoring.js'

const router = useRouter()
const initialsOf = name => String(name ?? '').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
/* Việc của tôi chưa xong: phần đang làm là của mình và chưa hoàn thành */
const isMineOpen = (t, me) => (phaseOf(t) === 'analysis' ? t.baId === me && !t.baCompletedDate : t.pdId === me && !DONE_STATUSES.includes(t.designStatus))

const chips = computed(() => favProjectIds.value.map(projectById).filter(Boolean).map(p => {
  const today = new Date().toISOString().slice(0, 10), its = iterationsOf(p.id)
  const iter = its.find(i => i.startDate <= today && today <= i.endDate) ?? its[0] ?? null
  const me = currentUser.value?.id, tasks = db.tasks.filter(t => t.projectId === p.id)
  const mine = tasks.filter(t => isMineOpen(t, me)).length
  const waiting = tasks.filter(t => ['Chờ duyệt', 'Chờ chấm điểm'].includes(taskStatusOf(t)) && canApproveBa(t)).length
  const parts = [mine ? `${mine} việc của tôi chưa xong` : '', waiting ? `${waiting} việc chờ duyệt / chấm` : ''].filter(Boolean)
  return { id: p.id, name: p.name, logo: p.logo, initials: initialsOf(p.name), iter,
    count: mine + waiting, warn: !!waiting,
    tip: `${p.name}${iter ? ` — vòng lặp ${iter.name}` : ''}${parts.length ? ` · ${parts.join(' · ')}` : ''}` }
}))

function open(c) { router.push({ path: `/du-an/${c.id}`, query: c.iter ? { vl: c.iter.id } : {} }) }
</script>

<style scoped>
.fav { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; min-width: 0; }   /* tiêu đề 1 dòng, chip dòng dưới */
.fav__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.fav__title { display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); white-space: nowrap; }
.fav__star { font-size: 16px; color: #f5b301; }
.fav__empty { min-width: 0; font-size: var(--text-body); color: var(--text-secondary); }
.fav__list { min-width: 0; display: flex; align-items: center; gap: 16px; overflow-x: auto; scrollbar-width: thin;
  padding: 8px 8px 12px; margin: -8px -8px -12px; }   /* chừa chỗ cho bóng / nhấc khi rê (vùng cuộn cắt phần tràn) — margin âm bù lại để vẫn thẳng hàng tiêu đề */
.fav__chip {
  position: relative; flex-shrink: 0; display: inline-flex; align-items: center; gap: 8px;
  height: calc(var(--btn-height) + 8px); padding: 0 12px 0 8px; border-radius: var(--radius-card);   /* bo góc mặc định 8 (không bo tròn) */
  /* Cùng kiểu với card bên dưới (bóng đổ, không viền) → khoảng cách 16px nhìn đều như lưới card */
  background: var(--bg-white); border: none; box-shadow: var(--shadow-card); cursor: pointer; transition: box-shadow 0.18s, transform 0.18s;
}
/* Rê chuột: nhấc nhẹ + bóng nổi lên (không dùng viền — tránh bị cắt) */
.fav__chip:hover { transform: translateY(-2px); box-shadow: var(--shadow-bottom-8); }
.fav__chip:focus-visible { box-shadow: var(--shadow-bottom-8), 0 0 0 2px var(--stroke-brand); outline: none; }
.fav__chip:active { transform: translateY(0); box-shadow: var(--shadow-card); }
.fav__logo { width: calc(var(--btn-height) - 4px); height: calc(var(--btn-height) - 4px); flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: transparent; }   /* logo giữ nguyên dáng gốc (không bo / không cắt) */
.fav__logo img { width: 100%; height: 100%; object-fit: contain; }
.fav__logo--initials { border-radius: calc(var(--radius-default) - 2px); background: var(--bg-brand-light); color: var(--text-brand); font-size: 11px; font-weight: var(--fw-semibold); }
.fav__name { max-width: 200px; font-size: var(--text-body); font-weight: var(--fw-medium); color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fav__iter { font-size: var(--text-body); color: var(--text-secondary); white-space: nowrap; }
.fav__count { min-width: 18px; padding: 0 5px; border-radius: var(--radius-pill); background: var(--bg-brand-light); color: var(--text-brand); font-size: 11px; line-height: 18px; font-weight: var(--fw-semibold); text-align: center; }
.fav__count--warn { background: var(--bg-warning-light); color: var(--text-warning); }
.fav__all { flex-shrink: 0; padding: 0; height: auto; gap: 2px; white-space: nowrap; }
.fav__all .ti { font-size: 14px; }
</style>
