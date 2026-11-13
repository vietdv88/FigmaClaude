<template>
  <!-- Bắt đầu sử dụng (quy chuẩn /ds/onboarding-start · Figma Quy chuẩn chung 34302:9413) — component mds-ui AppOnboarding.
       Màn hình mẫu Tổng quan + dải tab Trợ lý AI · Tổng quan · Tính năng mới + nút “Bắt đầu sử dụng” → popup các bước →
       bấm 1 việc: popup đóng, chuyển tới màn thực hiện (hộp hướng dẫn + nút làm) → làm xong: tiến độ tăng, “Tiếp tục” mở lại popup ở bước kế tiếp.
       Popup đóng mà còn việc → nút nổi góc dưới trái + số việc còn lại. -->
  <div class="demo-stack">
    <span class="demo-muted">Bấm <b>Bắt đầu sử dụng</b> (góc phải dải tab) → mở bước, bấm tên việc (tính là xong, chuyển tới màn thực hiện) hoặc <b>Đánh dấu hoàn thành cả bước</b> ở cuối bước (tự mở bước sau); bấm ô video để xem hướng dẫn. Đóng popup → nút nổi góc dưới trái, <b>kéo đi đâu cũng được</b>, bấm để mở lại.</span>
    <LayoutFrame :active="screen === 'task' ? 1 : 0">
      <template #bar>
        <AppCheckbox v-model="showIcons" label="Hiện icon đầu bước" />
        <button type="button" class="btn btn--sm btn--text-neutral" @click="reset"><TIcon name="refresh" />Đặt lại tiến độ</button>
      </template>

      <!-- ── Màn Tổng quan: dải tab phân hệ con + nút Bắt đầu sử dụng ── -->
      <div v-if="screen === 'home'" class="obd-page">
        <!-- Dải tab Trợ lý AI · Tổng quan · Tính năng mới dựng sẵn trong màn mẫu Tổng quan · nút Bắt đầu sử dụng ở bên phải -->
        <DashboardScreen v-model:tab="tab">
          <template #subnav-right>
            <button type="button" class="btn btn--text" @click="openOb()"><TIcon name="player-play" />Bắt đầu sử dụng</button>
          </template>
        </DashboardScreen>
      </div>

      <!-- ── Màn thực hiện 1 việc (đi từ popup) ── -->
      <div v-else class="obd-page obd-task">
        <div class="obd-task__head">
          <button type="button" class="btn-icon" aria-label="Về Tổng quan" v-tip="'Về Tổng quan'" @click="screen = 'home'"><TIcon name="chevron-left" /></button>
          <h2 class="obd-task__title">{{ cur.screen }}</h2>
          <span class="obd-sp" />
          <button type="button" class="btn btn--primary" @click="doTask"><TIcon name="plus" />{{ cur.task.cta }}</button>
        </div>
        <!-- Hộp hướng dẫn: đang làm việc nào của Bắt đầu sử dụng · làm xong → mời làm tiếp -->
        <AppInlineAlert v-if="!cur.task.done" type="info" :title="`Bắt đầu sử dụng · ${cur.task.label}`">
          Bấm <b>{{ cur.task.cta }}</b> ở góc phải để thực hiện. Cần xem trước? Bấm Xem video hướng dẫn.
          <template #actions><button type="button" class="btn btn--sm btn--outline btn--neutral" @click="watch(cur.task)"><TIcon name="player-play" />Xem video</button></template>
        </AppInlineAlert>
        <AppInlineAlert v-else type="success" :title="`Đã hoàn thành: ${cur.task.label}`">
          Tiến độ bắt đầu sử dụng: {{ pctOf(level) }}%.<template v-if="remainingOf(level)"> Còn {{ remainingOf(level) }} việc.</template>
          <template #actions><button v-if="remainingOf(level)" type="button" class="btn btn--sm btn--primary" @click="continueNext">Tiếp tục</button></template>
        </AppInlineAlert>
        <div class="obd-card surface">
          <ul v-if="made[cur.task.id]?.length" class="obd-list">
            <li v-for="(m, i) in made[cur.task.id]" :key="i"><TIcon name="circle-check-filled" class="obd-ok" />{{ m }}</li>
          </ul>
          <div v-else class="obd-empty">
            <TIcon name="inbox" class="obd-empty__icon" />
            <p class="obd-empty__title">Chưa có dữ liệu</p>
            <p class="demo-muted">{{ cur.task.label }} để bắt đầu.</p>
            <button type="button" class="btn btn--primary" @click="doTask"><TIcon name="plus" />{{ cur.task.cta }}</button>
          </div>
        </div>
      </div>

      <AppOnboarding v-model="obOpen" v-model:level="level" user-name="Trần Thanh Phương" product="AMIS CRM" :steps="STEPS[level]" :active-task="activeTask" :initial-step="startStep" :show-icons="showIcons"
        guides-title="Hướng dẫn sử dụng AMIS CRM" :guides="guides" :supports="SUPPORTS"
        @task="goTask" @group-done="(g, done) => { g.tasks.forEach(t => (t.done = done)); if (done) toast.success(`Hoàn thành: ${g.title}`) }" @step-done="(s, done) => { tasksOf(s).forEach(t => (t.done = done)); if (done) toast.success(`Hoàn thành bước: ${s.title}`) }" @video="t => watch(t)" @guide="g => toast.info(`Ví dụ: mở “${g.label}”`)" @support="s => toast.info(`Ví dụ: mở “${s.label}”`)" />
    </LayoutFrame>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppOnboarding from '@mds/components/AppOnboarding.vue'
import AppInlineAlert from '@mds/components/AppInlineAlert.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'
import { toast } from '@mds/utils/toast.js'
import { vTip } from '@mds/utils/tooltip.js'
import LayoutFrame from './layout/LayoutFrame.vue'
import DashboardScreen from './layout/DashboardScreen.vue'
import { buildSteps, SUPPORTS, guidesOf, tasksOf } from './layout/onboardingData.js'

const showIcons = ref(true)
const tab = ref('overview'), screen = ref('home'), obOpen = ref(false), level = ref('basic'), activeTask = ref(null), startStep = ref(null)

const build = buildSteps
const STEPS = reactive(build())
const allOf = lv => STEPS[lv].flatMap(tasksOf)
const pctOf = lv => Math.round(allOf(lv).filter(t => t.done).length / allOf(lv).length * 100)
const remainingOf = lv => allOf(lv).filter(t => !t.done).length

/* ── Cột phải ── */
const watched = ref(0)
const guides = computed(() => guidesOf(watched.value))

/* ── Luồng ── */
const cur = reactive({ task: null, step: null, screen: '' })
const made = reactive({})
function openOb(stepId = null) { startStep.value = null; obOpen.value = true; if (stepId) setTimeout(() => (startStep.value = stepId)) }
function goTask(t, s) {   // bấm việc = tính đã xong việc đó, rồi chuyển tới màn thực hiện
  if (!t.done) { t.done = true; toast.success(`Hoàn thành: ${t.label}`) }
  Object.assign(cur, { task: t, step: s, screen: t.screen }); activeTask.value = t.id; obOpen.value = false; screen.value = 'task'
}
function doTask() {
  const t = cur.task
  ;(made[t.id] ||= []).push(`${t.screen} mẫu ${made[t.id].length + 1}`)
  toast.success(`Đã thêm ${t.screen.toLowerCase()} mẫu`)
}
function watch(t) { if (watched.value < 17) watched.value++; toast.info(`Ví dụ: phát video “${t.label}”`) }
function continueNext() { const s = STEPS[level.value].find(x => tasksOf(x).some(t => !t.done)); openOb(s?.id) }
function reset() { Object.assign(STEPS, build()); Object.keys(made).forEach(k => delete made[k]); watched.value = 0; activeTask.value = null; screen.value = 'home'; tab.value = 'overview'; obOpen.value = false }
</script>

<style scoped>
.obd-page { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.obd-task { gap: 16px; padding: 16px; }
.obd-task__head { display: flex; align-items: center; gap: var(--gap-control); }
.obd-task__title { margin: 0; font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); }
.obd-sp { flex: 1; }
.obd-card { flex: 1; min-height: 0; padding: var(--box-padding); display: flex; flex-direction: column; }
.obd-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.obd-list li { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid var(--stroke-neutral-light); }
.obd-ok { color: var(--icon-success); font-size: 16px; }
.obd-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; }
.obd-empty p { margin: 0; }
.obd-empty__icon { font-size: 40px; color: var(--icon-neutral); }
.obd-empty__title { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); }
</style>
