<template>
  <!-- “Hôm nay của bạn” (đầu Tổng quan) — 1 hàng gọn, mỗi mục 1 dòng tóm tắt; bấm mục để xổ chi tiết. Tính từ dữ liệu đã tải, không tốn lượt AI -->
  <section v-if="me" ref="rootEl" class="today card">
    <!-- Trái: lời chào + dòng dưới là thời tiết hôm nay (cách 4px) · Phải: các ô tóm tắt -->
    <div class="today__left">
      <span class="today__hello">{{ greeting }}, {{ firstName }} 👋</span>
      <span class="today__weather"><span class="today__wx-text" v-tip="weather ? `${dayText} · ${weather.sentence}` : ''"><template v-for="(x, i) in dayParts" :key="'d' + i"><strong v-if="x.b">{{ x.t }}</strong><template v-else>{{ x.t }}</template></template><template v-if="weather"> · <span class="today__wx-icon">{{ weather.icon }}</span> <template v-for="(x, i) in weather.parts" :key="'w' + i"><strong v-if="x.b">{{ x.t }}</strong><template v-else>{{ x.t }}</template></template></template></span></span>
    </div>
    <div class="today__right">

    <!-- ① Điểm tháng: 1 dòng — vòng nhỏ % (so kỳ vọng / tháng trước) · điểm · dự báo -->
    <div v-for="s in scoreCards" :key="s.kind" class="today__cell today__cell--grow" v-tip="s.tip">
      <svg class="today__ring" viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="15" class="today__ring-bg" />
        <circle cx="18" cy="18" r="15" class="today__ring-fg" :class="`today__ring-fg--${s.tone}`" :stroke-dasharray="`${ringLen * Math.min(1, (s.rate ?? 0) / 100)} ${ringLen}`" />
      </svg>
      <span class="today__line"><strong>{{ fmt(s.score) }}</strong> điểm {{ s.kind }}<span v-if="s.rate != null" class="today__sep" :class="`today__t--${s.tone}`">· {{ s.rate }}%</span><span v-if="s.forecastShort" class="today__sep" :class="`today__t--${s.forecastTone}`">· dự báo {{ s.forecastShort }}</span></span>
    </div>

    <!-- ② Việc cần làm: 1 dòng tổng — bấm xổ danh sách -->
    <button type="button" class="today__cell today__cell--btn" :class="{ 'today__cell--on': pop === 'todo' }" @click="e => toggle('todo', e)">
      <TIcon :name="todos.length ? 'alert-triangle' : 'circle-check'" :class="todos.length ? 'today__t--warn' : 'today__t--good'" />
      <span class="today__line">{{ todos.length ? `${todoTotal} việc cần xử lý` : 'Không có việc cần xử lý' }}</span>
      <TIcon v-if="todos.length" name="chevron-down" class="today__chev" />
    </button>

    <!-- ③ AVA gợi ý: 1 dòng — bấm xổ các gợi ý -->
    <button type="button" class="today__cell today__cell--btn" :class="{ 'today__cell--on': pop === 'ava' }" :disabled="!tips.length" @click="e => toggle('ava', e)">
      <IconMisaAI class="today__ava-logo" />
      <span class="today__line text-ai-primary">{{ tips.length ? `${tips.length} gợi ý từ AVA` : 'AVA: ổn cả' }}</span>
      <TIcon v-if="tips.length" name="chevron-down" class="today__chev" />
    </button>

    <!-- ④ Thành tựu: 1 dòng — số cấp + huy hiệu sắp đạt · bấm xổ toàn bộ huy hiệu -->
    <button v-if="badges.length" type="button" class="today__cell today__cell--btn" :class="{ 'today__cell--on': pop === 'badge' }" v-tip="nextBadge ? `Sắp đạt: ${nextBadge}` : ''" @click="e => toggle('badge', e)">
      <TIcon name="trophy" class="today__t--gold" />
      <span class="today__line"><strong>{{ earnedCount }}/{{ badges.length * 3 }}</strong> huy hiệu</span>
      <TIcon name="chevron-down" class="today__chev" />
    </button>

    </div>

    <!-- Chi tiết xổ ra -->
    <div v-if="pop" class="today__pop" :style="{ left: popLeft + 'px' }" @click.stop>
      <ul v-if="pop === 'todo'" class="today__todos">
        <li v-for="t in todos" :key="t.key">
          <button type="button" class="today__todo" :class="`today__todo--${t.tone}`" @click="pop = ''; t.go()">
            <TIcon :name="t.icon" /><span class="today__todo-text"><strong>{{ t.title }}</strong><span>{{ t.sub }}</span></span><TIcon name="chevron-right" class="today__chev" />
          </button>
        </li>
      </ul>
      <template v-else-if="pop === 'ava'">
        <div v-for="t in tips" :key="t.key" class="today__tip">
          <span class="today__tip-text">{{ t.text }}</span>
          <span class="today__tip-actions">
            <button type="button" class="btn btn--link btn--sm" @click="pop = ''; openTask(t.task)">Mở việc</button>
            <button v-if="aiEnabled" type="button" class="btn btn--link btn--sm" @click="pop = ''; askAvaNow(t.question, t.focus)"><TIcon name="sparkles" class="ti--ai" /><span class="text-ai-primary">Hỏi AVA</span></button>
          </span>
        </div>
      </template>
      <div v-else class="today__badge-grid">
        <div v-for="b in badges" :key="b.id" class="today__badge" :class="{ 'today__badge--locked': !b.level }">
          <span class="today__badge-icon" :style="b.level ? { background: LEVELS[b.level - 1].color } : null"><TIcon :name="b.icon" /></span>
          <span class="today__badge-text"><strong>{{ b.title }}</strong><span>{{ b.level ? `Cấp ${LEVELS[b.level - 1].label}` : 'Chưa đạt' }} · {{ b.n }}{{ b.next ? '/' + b.next : '' }} {{ b.unit }}</span></span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { isPdRole } from '../store/scoring.js'
import { fmtNum } from '@mds/utils/number.js'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useEscClose } from '@mds/utils/escStack.js'
import { useRouter } from 'vue-router'
import TIcon from '@mds/components/TIcon.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'
import IconMisaAI from '@mds/components/IconMisaAI.vue'
import { api, backend } from '../store/api.js'
import { db, currentUser, pdParams, pdWorkingDays, isTaskLocked, myProjectRole, primaryProjectIdsOf, canEditField } from '../store/db.js'
import { computeFinalScore, countsInMonth, expectedScore, achievementRate, DONE_STATUSES, isPending, REASON_REQUIRED, hasDesign, hasAnalysis, missingScoreFields, SCORE_FIELD_LABELS, baScoreOf } from '../store/scoring.js'
import { unreadCount } from '../store/notifications.js'
import { totalUnread, chat } from '../store/chat.js'
import { aiEnabled } from '../store/ai.js'
import { askAvaNow } from '../store/avaBus.js'
import { LEVELS } from '../store/achievements.js'

const router = useRouter()
const me = computed(() => currentUser.value)
const cfg = computed(() => db.config)
const pad = n => String(n).padStart(2, '0')
const now = new Date(), ym = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`, today = `${ym}-${pad(now.getDate())}`
const monthNo = now.getMonth() + 1
const firstName = computed(() => String(me.value?.name ?? '').trim().split(/\s+/).pop() || 'bạn')
const greeting = now.getHours() < 11 ? 'Chào buổi sáng' : now.getHours() < 14 ? 'Chào buổi trưa' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
const fmt = n => fmtNum(Number(n) || 0, { decimals: 2 })
const ringLen = 2 * Math.PI * 15

/* Thời tiết hôm nay (máy chủ lấy từ Open-Meteo, lưu tạm 30 phút) — mã thời tiết WMO → biểu tượng + mô tả */
const WX = [
  [[0], '☀️', '🌙', 'Trời quang'], [[1], '🌤️', '🌙', 'Ít mây'], [[2], '⛅', '☁️', 'Có mây'], [[3], '☁️', '☁️', 'Nhiều mây'],
  [[45, 48], '🌫️', '🌫️', 'Sương mù'], [[51, 53, 55, 56, 57], '🌦️', '🌧️', 'Mưa phùn'], [[61, 63, 66, 80, 81], '🌧️', '🌧️', 'Có mưa'],
  [[65, 67, 82], '🌧️', '🌧️', 'Mưa to'], [[71, 73, 75, 77, 85, 86], '🌨️', '🌨️', 'Có tuyết'], [[95, 96, 99], '⛈️', '⛈️', 'Dông'],
]
const wxRaw = ref(null)
const weather = computed(() => {
  const w = wxRaw.value; if (!w || w.temp == null) return null
  const m = WX.find(x => x[0].includes(w.code)) ?? WX[2]
  const r = n => Math.round(Number(n))
  // Lời nhắc thân thiện theo thời tiết
  const hint = w.rain >= 60 || [61, 63, 65, 80, 81, 82, 95, 96, 99].includes(w.code) ? ', nhớ mang ô ☂️' : w.max >= 34 ? ', nhớ uống đủ nước 💧' : w.min <= 15 ? ', nhớ mặc ấm 🧣' : ''
  return { icon: w.day ? m[1] : m[2],
    sentence: `${w.place} trời ${m[3].toLowerCase()}, ${r(w.temp)}°C${w.min != null ? ` (${r(w.min)}–${r(w.max)}°)` : ''}${w.rain != null ? `, khả năng mưa ${w.rain}%` : ''}${hint}`,
    // Từng đoạn để in đậm số liệu (nhiệt độ, khoảng nhiệt, % mưa)
    parts: [{ t: `${w.place} trời ${m[3].toLowerCase()}, ` }, { t: `${r(w.temp)}°C`, b: true },
      ...(w.min != null ? [{ t: ' (' }, { t: `${r(w.min)}–${r(w.max)}°`, b: true }, { t: ')' }] : []),
      ...(w.rain != null ? [{ t: ', khả năng mưa ' }, { t: `${w.rain}%`, b: true }] : []), { t: hint }] }
})
/* “Hôm nay thứ Năm, 22/10” */
const weekday = now.toLocaleDateString('vi-VN', { weekday: 'long' }).toLowerCase(), dateNo = `${now.getDate()}/${now.getMonth() + 1}`
const dayText = `Hôm nay ${weekday}, ${dateNo}`
const dayParts = [{ t: `Hôm nay ${weekday}, ` }, { t: dateNo, b: true }]   // in đậm ngày tháng
onMounted(() => { if (backend.enabled) api.get('/api/weather').then(r => { wxRaw.value = r }).catch(() => {}) })

/* Xổ chi tiết 1 mục — bấm ra ngoài / Esc để đóng */
const pop = ref(''), rootEl = ref(null)
const popLeft = ref(0)
// Bấm 1 ô → xổ chi tiết ngay dưới ô đó (không tràn mép phải khung)
function toggle(k, e) {
  if (pop.value === k) { pop.value = ''; return }
  const box = rootEl.value?.getBoundingClientRect(), cell = e?.currentTarget?.getBoundingClientRect()
  popLeft.value = box && cell ? Math.max(8, Math.min(cell.left - box.left, box.width - Math.min(520, box.width - 16) - 8)) : 14
  pop.value = k
}
const onDoc = e => { if (pop.value && !rootEl.value?.contains(e.target)) pop.value = '' }
onMounted(() => document.addEventListener('mousedown', onDoc))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDoc))
useEscClose(() => { pop.value = '' }, () => !!pop.value)

/* Ngày làm việc (T2–T6) đã qua trong tháng → dự báo cuối tháng theo nhịp hiện tại */
const elapsedDays = (() => { let n = 0; for (let d = 1; d <= now.getDate(); d++) { const w = new Date(now.getFullYear(), now.getMonth(), d).getDay(); if (w && w !== 6) n++ } return n })()
const myId = computed(() => me.value?.id)
const myPdTasks = computed(() => db.tasks.filter(t => t.pdId === myId.value && hasDesign(t)))
const myBaTasks = computed(() => db.tasks.filter(t => t.baId === myId.value && hasAnalysis(t)))

/* Điểm tháng: có điểm kỳ vọng → so với kỳ vọng · chưa có (đang chưa ai nhập) → so với điểm THÁNG TRƯỚC của chính mình; dự báo cuối tháng theo nhịp hiện tại */
const prevD = new Date(now.getFullYear(), now.getMonth() - 1, 1), prevYm = `${prevD.getFullYear()}-${pad(prevD.getMonth() + 1)}`
const toneOf = r => (r == null ? 'neutral' : r >= 100 ? 'good' : r >= 60 ? 'neutral' : 'warn')
function card(kind, score, prev, count, exp, days) {
  const pace = elapsedDays >= 3 && days ? score * days / Math.min(elapsedDays, days) : null   // điểm dự kiến cuối tháng
  if (exp > 0) {
    const rate = achievementRate(score, exp), f = pace != null ? Math.round(pace / exp * 100) : null
    return { kind, score, rate, tone: toneOf(rate), ring: 'kỳ vọng', sub: `Kỳ vọng ${fmt(exp)} · ${count} việc được tính`,
      forecastShort: f != null ? `~${f}%` : '', tip: `Điểm kỳ vọng ${fmt(exp)} · ${count} việc được tính${f != null ? ` · giữ nhịp này cuối tháng đạt ~${f}% kỳ vọng` : ''}`,
      forecast: f != null ? `Giữ nhịp này, cuối tháng đạt ~${f}% kỳ vọng` : '', forecastTone: f == null ? 'neutral' : f >= 100 ? 'good' : f >= 80 ? 'neutral' : 'warn' }
  }
  const rate = prev > 0 ? Math.round(score / prev * 100) : null
  return { kind, score, rate, tone: toneOf(rate), ring: 'so tháng trước', noTarget: true,
    forecastShort: pace != null ? `~${fmt(Math.round(pace))} điểm` : '',
    tip: `${prev > 0 ? `Tháng trước ${fmt(prev)} điểm` : 'Tháng trước chưa có điểm'} · ${count} việc được tính${pace != null ? ` · giữ nhịp này cuối tháng ~${fmt(Math.round(pace))} điểm` : ''} · Chưa có điểm kỳ vọng nên đang so với tháng trước (quản lý trực tiếp nhập điểm kỳ vọng level để xem tỷ lệ đạt)`,
    sub: `${prev > 0 ? `Tháng trước ${fmt(prev)} điểm` : 'Tháng trước chưa có điểm'} · ${count} việc được tính`,
    forecast: pace != null ? `Giữ nhịp này, cuối tháng ~${fmt(Math.round(pace))} điểm` : '', forecastTone: pace == null || !prev ? 'neutral' : pace >= prev ? 'good' : 'warn' }
}
const scoreCards = computed(() => {
  const out = [], days = pdWorkingDays(ym, myId.value)
  const pdIn = m => myPdTasks.value.filter(t => countsInMonth(t, m, cfg.value))
  const pdMonth = pdIn(ym)
  if (pdMonth.length || isPdRole(me.value?.role)) {
    const sum = list => list.reduce((a, t) => a + computeFinalScore(t, cfg.value), 0)
    out.push(card('PD', sum(pdMonth), sum(pdIn(prevYm)), pdMonth.length, expectedScore(pdParams(ym, myId.value), days), days))
  }
  const baIn = m => myBaTasks.value.filter(t => String(t.baCompletedDate ?? '').startsWith(m))
  const baMonth = baIn(ym)
  if (baMonth.length || me.value?.role === 'BA') {
    const sum = list => list.reduce((a, t) => a + (Number(baScoreOf(t, cfg.value)?.actual) || 0), 0)
    out.push(card('BA', sum(baMonth), sum(baIn(prevYm)), baMonth.length, 0, days))
  }
  return out
})

const taskLink = t => ({ path: `/du-an/${t.projectId}`, query: { vl: t.iterationId, cv: t.id } })
const openTask = t => router.push(taskLink(t))
const name = t => (t.pbi ? `${t.pbi} · ` : '') + (t.content || 'Công việc')

/* Việc cần làm ngay — mỗi nhóm 1 dòng, bấm mở việc đầu tiên (hoặc màn tương ứng) */
const todos = computed(() => {
  const list = []
  const mine = myPdTasks.value.filter(t => !isTaskLocked(t))
  const noDate = mine.filter(t => DONE_STATUSES.includes(t.designStatus) && !t.completedDate)
  if (noDate.length) list.push({ key: 'nodate', tone: 'warn', icon: 'calendar', title: `${noDate.length} việc đã thiết kế nhưng chưa có Ngày hoàn thành`, sub: `Chưa được tính điểm — VD ${name(noDate[0])}`, go: () => openTask(noDate[0]) })
  const missing = mine.filter(t => countsInMonth(t, ym, cfg.value)).map(t => ({ t, m: missingScoreFields(t, cfg.value).filter(k => k !== 'qualityRating' && k !== 'completedDate') })).filter(x => x.m.length)
  if (missing.length) list.push({ key: 'missing', tone: 'danger', icon: 'alert-triangle', title: `${missing.length} việc đang 0 điểm vì thiếu thông tin`, sub: `Thiếu ${[...new Set(missing.flatMap(x => x.m))].map(k => SCORE_FIELD_LABELS[k] ?? k).join(', ')}`, go: () => openTask(missing[0].t) })
  const unrated = mine.filter(t => countsInMonth(t, ym, cfg.value) && !t.qualityRating)
  if (unrated.length && !cfg.value.unratedCountsAsSatisfied) list.push({ key: 'unrated', tone: 'neutral', icon: 'clock', title: `${unrated.length} việc chờ PO / BA đánh giá`, sub: 'Đang tính 0 điểm cho tới khi có mức hài lòng — nhắc người đánh giá nhé', go: () => openTask(unrated[0]) })
  // Việc chờ chính mình đánh giá (Quản trị dự án)
  const toRate = db.tasks.filter(t => hasDesign(t) && t.completedDate && countsInMonth(t, ym, cfg.value) && !t.qualityRating && t.pdId !== myId.value && canEditField(t, 'qualityRating'))   // ai được đánh giá (PO / Quản trị dự án, BA của việc, PD Lead của PD…) — đã gồm kiểm tra tháng chốt
  if (toRate.length) list.push({ key: 'torate', tone: 'brand', icon: 'star', title: `${toRate.length} việc chờ bạn đánh giá mức hài lòng`, sub: `VD ${name(toRate[0])}`, go: () => openTask(toRate[0]) })
  const soon = new Date(now.getTime() + 3 * 86400e3).toISOString().slice(0, 10)
  const due = mine.filter(t => t.expectedDate && t.expectedDate <= soon && !t.completedDate && !isPending(t))   // Pending (tạm dừng) không tính quá hạn
  if (due.length) list.push({ key: 'due', tone: due.some(t => t.expectedDate < today) ? 'danger' : 'warn', icon: 'clock', title: `${due.length} việc ${due.some(t => t.expectedDate < today) ? 'quá hạn / ' : ''}sắp đến hạn thiết kế`, sub: `Gần nhất: ${name([...due].sort((a, b) => a.expectedDate.localeCompare(b.expectedDate))[0])}`, go: () => openTask([...due].sort((a, b) => a.expectedDate.localeCompare(b.expectedDate))[0]) })
  if (totalUnread.value) list.push({ key: 'chat', tone: 'brand', icon: 'message-circle', title: `${totalUnread.value} tin nhắn chưa đọc`, sub: 'Mở khung chat để xem', go: () => { chat.open = true } })
  if (unreadCount.value) list.push({ key: 'bell', tone: 'neutral', icon: 'bell', title: `${unreadCount.value} thông báo chưa đọc`, sub: 'Bấm quả chuông trên header để xem', go: () => document.querySelector('.bell-btn')?.click() })
  return list.slice(0, 6)
})
// Tổng số việc trong các nhóm (số đầu dòng tiêu đề mỗi nhóm)
const todoTotal = computed(() => todos.value.reduce((a, t) => a + (parseInt(t.title, 10) || 0), 0))

/* AVA gợi ý — quy tắc đơn giản trên việc của mình (+ việc mình đánh giá), tối đa 3 */
const tips = computed(() => {
  const out = [], seen = new Set()
  const push = (t, text, question, focus = 'PD') => { if (out.length < 3 && !seen.has(t.id)) { seen.add(t.id); out.push({ key: t.id + text.length, task: t, text, question, focus }) } }
  const since = new Date(now.getFullYear(), now.getMonth() - 1, 1), from = `${since.getFullYear()}-${pad(since.getMonth() + 1)}-01`   // việc chưa xong hoặc xong từ tháng trước
  const recent = db.tasks.filter(t => hasDesign(t) && !isTaskLocked(t) && (!t.completedDate || t.completedDate >= from))
  for (const t of recent.filter(t => t.pdId === myId.value)) {
    const main = Number(t.mainScreens) || 0, sub = Number(t.subScreens) || 0
    if (main >= 6 && t.complexity === 'Rất đơn giản')
      push(t, `“${name(t)}” có ${main} màn hình chính nhưng chọn độ phức tạp Rất đơn giản — chỉ đúng khi toàn bộ là sửa trên màn có sẵn.`, `Việc có ${main} màn hình chính đang chọn độ phức tạp thiết kế "Rất đơn giản" — khi nào thì đúng, khi nào nên chọn mức cao hơn?`)
    else if (t.complexity === 'Rất phức tạp' && main <= 1 && sub <= 2 && !t.manualScore)
      push(t, `“${name(t)}” chỉ ${main} màn hình chính nhưng chọn Rất phức tạp — kiểm tra lại theo 4 câu hỏi độ phức tạp thiết kế.`, `Việc chỉ có ${main} màn hình chính mà chọn độ phức tạp thiết kế "Rất phức tạp" có hợp lý không? Cách xác định đúng mức?`)
    else if (t.isOwnProject === 'Không' && primaryProjectIdsOf(me.value).includes(t.projectId))
      push(t, `“${name(t)}” đang tính “hỗ trợ dự án khác” nhưng dự án này là dự án phụ trách của bạn.`, 'Khi nào thì chọn "Là dự án phụ trách" và khi nào là hỗ trợ dự án khác?')
    else if (main > 0 && sub >= main * 5)
      push(t, `“${name(t)}” có ${sub} màn phụ so với ${main} màn chính — kiểm tra lại có phần nào nên tính là màn chính không.`, `Việc có ${main} màn hình chính và ${sub} màn hình phụ — làm sao phân biệt màn chính và màn phụ cho đúng?`)
  }
  for (const t of recent.filter(t => REASON_REQUIRED.includes(t.qualityRating) && !String(t.ratingReason ?? '').trim() && myProjectRole(t.projectId) === 'manager'))
    push(t, `“${name(t)}” được đánh giá “${t.qualityRating}” nhưng chưa có lý do — mức này bắt buộc nhập lý do.`, `Đánh giá mức "${t.qualityRating}" có bắt buộc nhập lý do không? Nên ghi lý do thế nào?`)
  return out
})

/* Thành tựu: tải từ máy chủ · cấp mới đạt (chưa chúc mừng) → toast chúc mừng rồi đánh dấu đã xem */
const badges = ref([])
const earnedCount = computed(() => badges.value.reduce((a, b) => a + b.level, 0))
// Gợi ý huy hiệu gần đạt nhất (tỷ lệ tiến độ tới cấp sau cao nhất)
const nextBadge = computed(() => {
  const n = badges.value.filter(b => b.next).sort((a, b) => b.n / b.next - a.n / a.next)[0]
  return n ? `${n.title} ${LEVELS[n.level].label}` : ''
})
onMounted(async () => {
  if (!backend.enabled) return
  try {
    const r = await api.get('/api/me/achievements')
    badges.value = r.badges
    const seen = new Set(r.seen), fresh = []
    for (const b of r.badges) for (let l = 1; l <= b.level; l++) if (!seen.has(`${b.id}:${l}`)) fresh.push({ b, l })
    if (fresh.length) {
      for (const { b, l } of fresh.slice(-3)) toast.success(`🏅 Chúc mừng! Bạn mở khoá huy hiệu “${b.title}” — cấp ${LEVELS[l - 1].label}`)
      api.put('/api/me/achievements/seen', { keys: fresh.map(({ b, l }) => `${b.id}:${l}`) }).catch(() => {})
    }
  } catch { /* bỏ qua — không chặn trang */ }
})
</script>

<style scoped>
/* 1 hàng gọn: lời chào · điểm tháng · việc cần làm · AVA gợi ý · thành tựu — mỗi ô 1 dòng, tràn thì xuống hàng */
.today { position: relative; display: flex; align-items: center; gap: 16px; padding: 8px 12px; }
.today__right { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex: 0 0 auto; }
.today__left { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; flex: 1 1 auto; min-width: 0; }
.today__left > * { max-width: 100%; }
.today__weather { display: flex; align-items: center; gap: 6px; min-width: 0;
  font-size: var(--text-body); color: var(--text-secondary); }
.today__wx-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.today__wx-text strong { font-weight: var(--fw-semibold); color: var(--text-primary); }   /* 1 dòng — thiếu chỗ thì … (rê chuột xem đủ) */
.today__wx-icon { font-size: 15px; line-height: 1; }   /* biểu tượng nắng / mưa đứng ngay trước câu thời tiết */
@media (max-width: 1100px) { .today, .today__right { flex-wrap: wrap; } .today__right { justify-content: flex-start; } }
.today__hello { flex-shrink: 0; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); white-space: nowrap; }
.today__cell { display: inline-flex; align-items: center; gap: 8px; min-width: 0; flex: 0 0 auto; height: calc(var(--btn-height) + 4px); padding: 0 12px; border: none; border-radius: var(--radius-default); background: var(--bg-neutral-light); font-family: inherit; font-size: var(--text-body); color: var(--text-primary); }
.today__cell--grow { flex: 0 0 auto; }   /* ô dài (điểm, huy hiệu) co lại kèm … khi chật */
.today__cell--btn { cursor: pointer; }
.today__cell--btn:hover:not(:disabled), .today__cell--on { background: var(--bg-brand-light); }
.today__cell--on:hover:not(:disabled) { background: var(--bg-brand-light-hover); }
.today__cell--btn:disabled { cursor: default; color: var(--text-secondary); }
.today__cell > .ti { font-size: 16px; flex-shrink: 0; }
.today__line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: var(--text-body-lh); padding-block: 2px; margin-block: -2px; }   /* cắt “…” không cụt dấu chồng */
.today__line strong { font-weight: var(--fw-semibold); }
.today__sep { margin-left: 4px; }
.today__chev { font-size: 14px !important; color: var(--icon-neutral); }
.today__ava-logo { width: 18px; height: 18px; flex-shrink: 0; }
.today__t--good { color: var(--text-success); }
.today__t--warn { color: var(--text-warning); }
.today__t--neutral { color: var(--text-secondary); }
.today__t--gold { color: #e0a100; }
.today__ring { width: 22px; height: 22px; flex-shrink: 0; transform: rotate(-90deg); }
.today__ring-bg { fill: none; stroke: var(--stroke-neutral); stroke-width: 5; }
.today__ring-fg { fill: none; stroke-width: 5; stroke-linecap: round; stroke: var(--text-brand); transition: stroke-dasharray 0.8s ease; }
.today__ring-fg--good { stroke: var(--text-success); }
.today__ring-fg--warn { stroke: var(--text-warning); }
/* Căn giữa theo mắt nhìn: Inter chừa khoảng dưới (đuôi chữ) → chữ trông lệch lên → hạ chữ 1px (không cắt dấu / đuôi chữ) */
.today__hello, .today__wx-text { position: relative; top: 1px; }   /* chữ trong các ô (.today__line, 13px) đã cân giữa — không hạ thêm */
/* Chi tiết xổ ra dưới hàng */
.today__pop { position: absolute; z-index: 20; top: calc(100% + 6px); width: min(520px, calc(100% - 16px)); max-height: 420px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: var(--menu-pad); background: var(--bg-white); border-radius: var(--radius-dialog); box-shadow: var(--shadow-popover); }   /* popover chuẩn: không viền, Bottom 12 · đệm như Menu List */
.today__todos { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--menu-gap); }
.today__todo { width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px var(--menu-item-px); border: none; border-radius: var(--menu-radius); transition: background 0.12s; background: transparent; font-family: inherit; text-align: left; cursor: pointer; }
.today__todo:hover { background: var(--bg-brand-light); }   /* hover Menu List: brand nhạt */
.today__todo > .ti:first-child { flex-shrink: 0; font-size: 18px; }
.today__todo--danger > .ti:first-child { color: var(--icon-danger); }
.today__todo--warn > .ti:first-child { color: var(--icon-warning); }
.today__todo--brand > .ti:first-child { color: var(--icon-brand); }
.today__todo--neutral > .ti:first-child { color: var(--icon-neutral); }
.today__todo-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.today__todo-text strong { font-size: var(--text-body); font-weight: var(--fw-medium); color: var(--text-primary); }
.today__todo-text span { font-size: var(--text-body); color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.today__tip { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border-radius: var(--radius-default); background: color-mix(in srgb, var(--chart-c6) 6%, var(--bg-white)); }
.today__tip-text { font-size: var(--text-body); color: var(--text-primary); line-height: var(--text-body-lh); }
.today__tip-actions { display: flex; gap: 4px; margin-left: -6px; }
.today__badge-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.today__badge { display: flex; align-items: center; gap: 10px; padding: 6px 8px; border-radius: var(--radius-default); }
.today__badge-icon { width: 32px; height: 32px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; color: #fff; background: var(--bg-neutral-light); }
.today__badge-icon .ti { font-size: 16px; }
.today__badge--locked .today__badge-icon { color: var(--icon-neutral); }
.today__badge-text { display: flex; flex-direction: column; min-width: 0; }
.today__badge-text strong { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.today__badge--locked .today__badge-text strong { color: var(--text-secondary); }
.today__badge-text span { font-size: var(--text-body); color: var(--text-secondary); }
</style>
