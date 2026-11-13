<template>
  <!-- Khối “::: checklist Tiêu đề” trong trang CMS: danh sách việc tick được ngay trên trang + thanh tiến độ.
       Lưu theo trình duyệt (localStorage, theo trang + tiêu đề khối) — dùng cho lộ trình người mới, checklist tự soát… -->
  <section class="ds-check">
    <header class="ds-check__head">
      <span class="ds-check__title"><TIcon name="checklist" />{{ title || 'Danh sách việc' }}</span>
      <span class="ds-check__count">{{ done }}/{{ items.length }}</span>
      <button v-if="done" type="button" class="btn btn--text btn--sm" @click="reset">Làm lại</button>
    </header>
    <div class="dt-progress ds-check__bar" role="progressbar" :aria-valuenow="done" :aria-valuemax="items.length"><div class="dt-progress-bar" :style="{ width: pct + '%' }" /></div>
    <ul class="ds-check__list">
      <li v-for="it in items" :key="it.id" class="ds-check__item">
        <AppCheckbox :model-value="!!ticks[it.id]" @update:model-value="v => set(it.id, v)" />
        <!-- eslint-disable-next-line vue/no-v-html — đã lọc DOMPurify ở md.js -->
        <span class="ds-check__text" v-html="it.html" />
      </li>
    </ul>
  </section>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import TIcon from '@mds/components/TIcon.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'

const props = defineProps({ id: { type: String, default: 'ds' }, title: { type: String, default: '' }, items: { type: Array, default: () => [] } })
const route = useRoute()
const KEY = `ds-check:${route.params.slug || 'home'}:${props.id}`
let saved = {}
try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') } catch { /* trình duyệt chặn lưu */ }
const ticks = reactive(saved)
const done = computed(() => props.items.filter(it => ticks[it.id]).length)
const pct = computed(() => (props.items.length ? Math.round(done.value / props.items.length * 100) : 0))
function persist() { try { localStorage.setItem(KEY, JSON.stringify(ticks)) } catch { /* bỏ qua */ } }
function set(id, v) { if (v) ticks[id] = true; else delete ticks[id]; persist() }
function reset() { for (const k of Object.keys(ticks)) delete ticks[k]; persist() }
</script>

<style scoped>
.ds-check { display: flex; flex-direction: column; gap: 12px; margin: 16px 0; padding: 16px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-card); background: var(--bg-white); }
.ds-check__head { display: flex; align-items: center; gap: 8px; min-height: var(--btn-height); }
.ds-check__title { display: inline-flex; align-items: center; gap: 8px; flex: 1; min-width: 0; font-size: var(--text-h4, var(--text-body-md)); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ds-check__title .ti { font-size: 20px; color: var(--icon-neutral); flex-shrink: 0; }
.ds-check__count { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-secondary); font-feature-settings: 'tnum' 1; }
.ds-check__bar { flex: none; height: 6px; }
.ds-check__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.ds-check__item { display: flex; align-items: flex-start; gap: 8px; margin: 0; }
.ds-check__item :deep(.app-cb) { margin-top: 2px; flex-shrink: 0; }
.ds-check__text { flex: 1; min-width: 0; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.ds-check__text :deep(p) { margin: 0; }
</style>
