<template>
  <!-- Lịch sử hỏi AVA của tài liệu (CSDL riêng data/ava.db) — chuyển từ màn “Lịch sử hỏi AVA” của Solution Point -->
  <div class="ds-alog">
    <div class="ds-alog__stats">
      <div v-for="s in stats" :key="s.label" class="card ds-alog__stat">
        <span class="ds-alog__stat-label"><TIcon :name="s.icon" :style="{ color: s.color }" />{{ s.label }}</span>
        <span class="ds-alog__stat-value">{{ typeof s.value === 'number' ? fmtNum(s.value) : s.value }}</span>
        <span v-if="s.sub" class="ds-alog__stat-sub">{{ s.sub }}</span>
      </div>
    </div>

    <div class="ds-alog__body">
      <div class="table-panel ds-alog__panel">
        <TableHeader v-model="search" search-placeholder="Tìm trong câu hỏi / trả lời" :search-width="narrow ? 200 : 260" :hide-ai="true" :hide-tools="['filter']"
          @refresh="load" @export="exportCsv" @col-settings="showSettings = true">
          <template #filters>
            <AppCombobox v-model="period" class="ds-alog__filter" :options="PERIODS" :clearable="false" />
            <AppCombobox v-model="person" class="ds-alog__filter ds-alog__filter--wide" :options="personOptions" placeholder="Người hỏi: Tất cả" />
            <AppCombobox v-model="status" class="ds-alog__filter" :options="STATUS_OPTIONS" placeholder="Kết quả: Tất cả" />
            <AppCombobox v-model="voteFilter" class="ds-alog__filter" :options="VOTE_OPTIONS" placeholder="Đánh giá: Tất cả" />
          </template>
        </TableHeader>
        <div class="table-scroll">
          <DataTable :columns="columns" :rows="paged" :line-count="2" :hide-blank-rows="false" @row-click="r => (detail = byId.get(r.id))" />
          <p v-if="loaded && !rows.length" class="ds-alog__empty">{{ logs.length ? 'Không có lượt hỏi nào khớp bộ lọc.' : 'Chưa có ai hỏi AVA.' }}</p>
        </div>
        <TablePaging :total="rows.length" v-model:page="page" v-model:page-size="pageSize" />
      </div>
      <TableSettingsDrawer v-if="showSettings" :columns="colState" :defaults="BASE_COLS" @save="saveSettings" @close="showSettings = false" />

      <!-- Câu hỏi lặp lại nhiều → nên bổ sung / làm rõ trong tài liệu -->
      <aside class="card ds-alog__top">
        <span class="ds-alog__top-title">Câu hỏi hay gặp</span>
        <p class="ds-muted ds-alog__hint">Hỏi lặp lại nhiều → nên làm rõ hoặc bổ sung vào trang tài liệu tương ứng.</p>
        <p v-if="!topQuestions.length" class="ds-muted ds-alog__hint">Chưa có dữ liệu.</p>
        <ol class="ds-alog__top-list">
          <li v-for="q in topQuestions" :key="q.key">
            <button type="button" class="ds-alog__top-q" @click="search = q.text">{{ q.text }}</button>
            <span class="ds-alog__top-n">{{ q.count }}</span>
          </li>
        </ol>
      </aside>
    </div>
    <p class="ds-muted ds-alog__keep">Lưu {{ keepDays }} ngày gần nhất · cơ sở dữ liệu riêng của tài liệu (không dùng chung Solution Point)</p>

    <AppDialog v-if="detail" title="Chi tiết lượt hỏi AVA" :width="680" @close="detail = null">
      <div class="ds-alog__detail">
        <div class="ds-alog__who">
          <span class="ds-alog__who-text">
            <span class="ds-alog__who-name">{{ askerName(detail) }}</span>
            <span class="ds-muted">{{ [timeText(detail.at), detail.page ? `trang /ds/${detail.page}` : '', MODE[detail.mode], detail.ms ? `${fmtNum(detail.ms / 1000, { decimals: 1 })} giây` : ''].filter(Boolean).join(' · ') }}</span>
          </span>
          <AppTag :label="STATUS[detail.status].label" :color="STATUS[detail.status].color" />
        </div>
        <span class="ds-alog__label">Câu hỏi</span>
        <div class="ds-alog__q">{{ detail.question }}</div>
        <!-- Ảnh người hỏi gửi kèm (lưu 30 ngày) — bấm để xem cỡ thật -->
        <div v-if="detail.images?.length" class="ds-alog__imgs">
          <a v-for="f in detail.images" :key="f" :href="'/api/ds/ava-images/' + f" target="_blank" rel="noopener" class="ds-alog__img" v-tip="'Mở ảnh cỡ thật'">
            <img :src="'/api/ds/ava-images/' + f" alt="Ảnh người hỏi gửi kèm" loading="lazy" @error="e => e.target.closest('a').classList.add('ds-alog__img--gone')" />
          </a>
        </div>
        <span class="ds-alog__label">{{ detail.status === 'error' ? 'Lỗi' : 'AVA trả lời' }}</span>
        <div v-if="detail.answer" class="ds-alog__a ds-prose" v-html="render(detail.answer)" />
        <div v-else class="ds-muted">(Lượt hỏi cũ — chưa lưu câu trả lời)</div>
        <template v-if="detail.vote">
          <span class="ds-alog__label">Người hỏi đánh giá</span>
          <div class="ds-alog__vote"><AppTag :label="VOTE[detail.vote].label" :color="VOTE[detail.vote].color" /><span v-if="detail.voteNote">{{ detail.voteNote }}</span></div>
        </template>
        <template v-if="canReuse(detail) || detail.reuseOf">
          <span class="ds-alog__label">Dùng lại câu trả lời</span>
          <div class="ds-muted">{{ detail.reuseOf ? 'Lượt này lấy câu trả lời đã có — không gọi AI, không tốn token.'
            : detail.noReuse ? 'Đã tắt — AVA không gợi ý / trả lời lại bằng câu này.'
            : `AVA gợi ý câu này cho câu hỏi giống và trả lời ngay câu hỏi trùng (khi tài liệu liên quan chưa sửa)${detail.reuseCount ? ` · đã dùng lại ${fmtNum(detail.reuseCount)} lần` : ''}.` }}</div>
        </template>
      </div>
      <template #footer>
        <button v-if="canReuse(detail)" type="button" class="btn btn--outline btn--neutral" @click="toggleReuse(detail)">{{ detail.noReuse ? 'Cho dùng lại' : 'Không dùng lại' }}</button>
        <button type="button" class="btn btn--outline btn--neutral" @click="detail = null">Đóng</button>
      </template>
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Marked } from 'marked'
import DOMPurify from 'dompurify'
import TIcon from '@mds/components/TIcon.vue'
import AppTag from '@mds/components/AppTag.vue'
import TableHeader from '@mds/components/TableHeader.vue'
import DataTable from '@mds/components/DataTable.vue'
import TablePaging from '@mds/components/TablePaging.vue'
import TableSettingsDrawer from '@mds/components/TableSettingsDrawer.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import { matchText } from '@mds/utils/search.js'
import { fmtNum } from '@mds/utils/number.js'
import { toast } from '@mds/utils/toast.js'
import { vTip } from '@mds/utils/tooltip.js'
import AppDialog from './AppDialog.vue'
import { api } from '../store.js'

const STATUS = { answered: { label: 'Đã trả lời', color: 'success' }, refused: { label: 'Ngoài phạm vi', color: 'warning' }, error: { label: 'Lỗi', color: 'danger' } }
const STATUS_OPTIONS = Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))
const VOTE = { up: { label: '👍 Hữu ích', color: 'success' }, down: { label: '👎 Chưa đúng / đủ', color: 'danger' }, none: { label: 'Chưa đánh giá', color: 'neutral' } }
const VOTE_OPTIONS = Object.entries(VOTE).map(([value, v]) => ({ value, label: v.label }))
const MODE = { plain: 'Dễ hiểu', dev: 'Kỹ thuật', build: 'Thi công' }
const PERIODS = [{ value: '7', label: '7 ngày gần nhất' }, { value: '30', label: '30 ngày gần nhất' }, { value: '90', label: '90 ngày gần nhất' }, { value: 'all', label: 'Tất cả' }]
const GUEST = '__guest'

const logs = ref([]), keepDays = ref(180), loaded = ref(false)
const search = ref(''), period = ref('30'), person = ref(''), status = ref(''), voteFilter = ref(''), detail = ref(null)
const page = ref(1), pageSize = ref(20)
const narrow = window.innerWidth < 600

async function load() {
  try { const r = await api('/ava-logs'); logs.value = r.logs; keepDays.value = r.keepDays ?? 180 }
  catch (e) { toast.error(e.message || 'Không tải được lịch sử hỏi AVA') }
  finally { loaded.value = true }
}
onMounted(load)

const byId = computed(() => new Map(logs.value.map(l => [l.id, l])))
const askerName = l => l.userName || 'Khách (chưa đăng nhập)'
const pad = n => String(n).padStart(2, '0')
const timeText = iso => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` }
const personOptions = computed(() => {
  const names = [...new Map(logs.value.filter(l => l.userId).map(l => [l.userId, l.userName])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'vi'))
  return [...(logs.value.some(l => !l.userId) ? [{ value: GUEST, label: 'Khách (chưa đăng nhập)' }] : []), ...names.map(([value, label]) => ({ value, label }))]
})
const inScope = computed(() => {
  const from = period.value === 'all' ? '' : new Date(Date.now() - Number(period.value) * 86400e3).toISOString()
  return logs.value.filter(l => (!from || l.at >= from) && (!person.value || (person.value === GUEST ? !l.userId : l.userId === person.value))
    && (!status.value || l.status === status.value) && (!voteFilter.value || (l.vote || 'none') === voteFilter.value))
})
const filtered = computed(() => { const q = search.value.trim(); return q ? inScope.value.filter(l => matchText([l.question, l.answer], q)) : inScope.value })
watch([search, period, person, status, voteFilter, pageSize], () => { page.value = 1 })

const short = (s, n) => { const t = String(s ?? '').replace(/[*#`>|]/g, '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t }
// Cột mặc định. “Câu hỏi” là cột định danh → locked (bắt buộc hiển thị, không ẩn được trong ⚙ Thiết lập bảng)
const BASE_COLS = [
  { key: 'at', label: 'Thời gian', width: 150 },
  { key: 'user', label: 'Người hỏi', type: 'subtext', width: 200 },
  { key: 'question', label: 'Câu hỏi', minWidth: 240, locked: true },
  { key: 'answer', label: 'AVA trả lời', minWidth: 240 },
  { key: 'tok', label: 'Token vào / ra', width: 170, align: 'right', tip: 'Token Google AI của lượt hỏi: vào (trong đó phần được cache, tính rẻ hơn) / ra · câu trả lời nhớ sẵn = 0' },
  { key: 'vote', label: 'Đánh giá', type: 'status', width: 170 },
  { key: 'reuse', label: 'Dùng lại', width: 150, tip: 'Câu trả lời này được lấy lại cho câu hỏi giống mấy lần (không gọi AI, không tốn token)' },
]
/* ⚙ Thiết lập bảng: ẩn / hiện, thứ tự, tên, độ rộng, ghim — nhớ theo trình duyệt (mỗi quản trị viên tự chỉnh bảng của mình) */
const COLS_KEY = 'ds-alog-cols'
function loadCols() {
  try {
    const saved = JSON.parse(localStorage.getItem(COLS_KEY) || 'null')
    if (Array.isArray(saved)) {
      const list = saved.filter(c => BASE_COLS.some(b => b.key === c.key)).map(c => ({ ...BASE_COLS.find(b => b.key === c.key), ...c, locked: !!BASE_COLS.find(b => b.key === c.key).locked, hidden: BASE_COLS.find(b => b.key === c.key).locked ? false : !!c.hidden }))
      BASE_COLS.forEach(b => { if (!list.some(c => c.key === b.key)) list.push({ ...b, field: b.label }) })   // cột mới thêm sau này vẫn hiện
      return list
    }
  } catch { /* bỏ qua */ }
  return BASE_COLS.map(c => ({ ...c, field: c.label }))
}
const colState = ref(loadCols()), showSettings = ref(false)
const columns = computed(() => colState.value)
function saveSettings({ columns: cols }) {
  colState.value = cols.map(c => ({ ...BASE_COLS.find(b => b.key === c.key), ...c }))
  try { localStorage.setItem(COLS_KEY, JSON.stringify(colState.value.map(({ key, label, width, hidden, pinned }) => ({ key, label, width, hidden, pinned })))) } catch { /* bỏ qua */ }
  showSettings.value = false; toast.success('Đã lưu thiết lập bảng')
}
const rows = computed(() => filtered.value.map(l => ({
  id: l.id, at: timeText(l.at),
  user: { text: askerName(l), subtext: [l.page ? `/ds/${l.page}` : 'Trang tổng quan', MODE[l.mode]].filter(Boolean).join(' · ') },
  question: short(l.question, 200),
  // Cột “Kết quả” đã bỏ (gần như luôn là “Đã trả lời”) — chỉ dòng BẤT THƯỜNG mới ghi nhãn ở đầu ô trả lời
  answer: (l.status && l.status !== 'answered' && STATUS[l.status] ? `[${STATUS[l.status].label}] ` : '') + short(l.answer, 220),
  tok: l.tokens ? (l.tokens.in ? `${fmtK(l.tokens.in)} (${fmtK(l.tokens.cached)} cache) / ${fmtK(l.tokens.out)}` : 'Nhớ sẵn · 0') : '–',
  vote: l.vote ? { ...VOTE[l.vote], tip: l.voteNote || '' } : null,
  reuse: l.reuseOf ? 'Lấy từ câu đã có' : l.noReuse ? 'Đã tắt' : l.reuseCount ? `${fmtNum(l.reuseCount)} lần` : '–',
})))
/* Bật / tắt dùng lại câu trả lời (gợi ý “Có phải bạn định hỏi…” + trả lời ngay câu hỏi trùng) */
const canReuse = l => l && l.status === 'answered' && !l.reuseOf && l.reusable && l.vote !== 'down'
async function toggleReuse(l) {
  try { await api(`/ava-logs/${l.id}/reuse`, { method: 'PUT', body: { on: l.noReuse } }); l.noReuse = !l.noReuse; toast.success(l.noReuse ? 'AVA sẽ không dùng lại câu trả lời này' : 'AVA được dùng lại câu trả lời này cho câu hỏi giống') }
  catch (e) { toast.error(e.message) }
}
const paged = computed(() => rows.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))

/* Chi phí AI ước tính theo bảng giá Gemini 2.5 Flash (USD / 1 triệu token) — chỉ tính lượt đã ghi token (từ 09/11/2026) */
const PRICE = { in: 0.30, cached: 0.03, out: 2.50 }
const fmtK = n => (n >= 1000 ? (n / 1000).toFixed(1).replace('.', ',') + 'k' : String(n || 0))
const costOf = t => (t ? ((t.in - t.cached) * PRICE.in + t.cached * PRICE.cached + t.out * PRICE.out) / 1e6 : 0)
const usd = (v, d) => 'US$' + v.toFixed(d).replace('.', ',')
const stats = computed(() => {
  const list = inScope.value
  const measured = list.filter(l => l.tokens), cost = measured.reduce((s, l) => s + costOf(l.tokens), 0)
  return [
    { label: 'Lượt hỏi', icon: 'message-circle', color: 'var(--text-brand)', value: list.length },
    { label: 'Chi phí AI ước tính', icon: 'coin', color: 'var(--text-warning)', value: measured.length ? usd(cost, 3) : '–',
      sub: measured.length ? `${measured.length} lượt có số đo · TB ${usd(cost / measured.length, 4)}/lượt` : 'Bắt đầu ghi từ 09/11/2026' },
    { label: 'Người hỏi', icon: 'users', color: 'var(--text-success)', value: new Set(list.map(l => l.userId || `ip:${l.ip}`)).size },
    { label: 'Ngoài phạm vi', icon: 'alert-triangle', color: 'var(--text-warning)', value: list.filter(l => l.status === 'refused').length },
    { label: 'Lỗi', icon: 'circle-x', color: 'var(--text-danger)', value: list.filter(l => l.status === 'error').length },
    { label: 'Chưa đúng / đủ', icon: 'thumb-down', color: 'var(--text-danger)', value: list.filter(l => l.vote === 'down').length, sub: `${fmtNum(list.filter(l => l.vote === 'up').length)} lượt 👍 hữu ích` },
  ]
})
const norm = s => String(s).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
const topQuestions = computed(() => {
  const m = new Map()
  for (const l of inScope.value) {
    if (l.status !== 'answered') continue
    const key = norm(l.question); if (!key) continue
    const e = m.get(key) ?? { key, text: short(l.question, 120), count: 0 }
    e.count++; m.set(key, e)
  }
  return [...m.values()].filter(e => e.count > 1).sort((a, b) => b.count - a.count).slice(0, 10)
})

const md = new Marked({ gfm: true, breaks: true })
const render = t => DOMPurify.sanitize(md.parse(t || ''))
function exportCsv() {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const head = ['Thời gian', 'Người hỏi', 'Trang', 'Chế độ', 'Câu hỏi', 'AVA trả lời', 'Kết quả', 'Đánh giá', 'Góp ý']
  const lines = filtered.value.map(l => [timeText(l.at), askerName(l), l.page ? `/ds/${l.page}` : '', MODE[l.mode] || '', l.question, l.answer, STATUS[l.status]?.label, l.vote ? VOTE[l.vote].label : '', l.voteNote].map(esc).join(','))
  const blob = new Blob(['﻿' + [head.map(esc).join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lich-su-hoi-ava-tai-lieu.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
</script>

<style scoped>
.ds-alog { display: flex; flex-direction: column; gap: var(--card-col-gap); }
.ds-alog__stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: var(--card-col-gap); }
.ds-alog__stat { display: flex; flex-direction: column; gap: 4px; padding: 12px 16px; }
.ds-alog__stat-label { display: flex; align-items: center; gap: 6px; font-size: var(--text-body); color: var(--text-secondary); }
.ds-alog__stat-label .ti { font-size: 16px; }
.ds-alog__stat-value { font-size: var(--text-h1); line-height: var(--text-h1-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ds-alog__stat-sub { font-size: var(--text-body); color: var(--text-secondary); }
.ds-alog__body { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: var(--card-col-gap); }
.ds-alog__panel { height: calc(100vh - 284px); min-height: 360px; display: flex; flex-direction: column; }
.ds-alog__panel .table-scroll { flex: 1; min-height: 0; }
.ds-alog__filter { width: 170px; max-width: 100%; }   /* màn hẹp: ô lọc co theo hàng, không tràn */
.ds-alog__filter--wide { width: 210px; }
/* Thanh công cụ luôn 1 dòng: bảng chật thì TableHeader tự gom các ô lọc vào icon lọc (mds-ui) */

.ds-alog__empty { padding: 24px; text-align: center; color: var(--text-secondary); }
.ds-alog__top { display: flex; flex-direction: column; gap: 8px; align-self: start; max-height: calc(100vh - 284px); overflow-y: auto; }
.ds-alog__top-title { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); }
.ds-alog__hint { margin: 0; }
.ds-alog__top-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; }
.ds-alog__top-list li { display: flex; align-items: flex-start; gap: 8px; padding: 8px 0; border-top: 1px solid var(--stroke-divider); }
.ds-alog__top-list li:first-child { border-top: none; }
.ds-alog__top-q { flex: 1; min-width: 0; padding: 0; border: none; background: none; font: inherit; color: var(--text-primary); text-align: left; cursor: pointer; }
.ds-alog__top-q:hover { color: var(--text-brand); text-decoration: underline; }
.ds-alog__top-n { flex-shrink: 0; min-width: 24px; padding: 0 8px; border-radius: var(--radius-default); background: var(--bg-brand-light); font-size: var(--text-body); line-height: 20px; font-weight: var(--fw-semibold); color: var(--text-brand); text-align: center; }
.ds-alog__keep { margin: 0; }
.ds-alog__detail { display: flex; flex-direction: column; gap: 8px; }
.ds-alog__imgs { display: flex; flex-wrap: wrap; gap: 8px; }
.ds-alog__img { display: block; width: 160px; height: 110px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); overflow: hidden; background: var(--bg-neutral-light); }
.ds-alog__img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ds-alog__img--gone { display: none; }
.ds-alog__who { display: flex; align-items: center; gap: 10px; padding-bottom: 12px; border-bottom: 1px solid var(--stroke-divider); }
.ds-alog__who-text { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.ds-alog__who-name { font-weight: var(--fw-semibold); }
.ds-alog__label { margin-top: 6px; font-weight: var(--fw-semibold); color: var(--text-secondary); }
.ds-alog__q { padding: 10px 12px; border-radius: var(--radius-default); background: var(--bg-brand-light); white-space: pre-wrap; word-break: break-word; }
.ds-alog__a { max-height: 50vh; overflow-y: auto; padding: 10px 12px; border-radius: var(--radius-default); background: var(--bg-neutral-light); font-size: var(--text-body); line-height: var(--text-body-lh); }
.ds-alog__a :deep(p) { margin: 0 0 6px; }
.ds-alog__a :deep(h4) { margin: 8px 0 4px; font-size: var(--text-body); color: var(--text-brand); }
.ds-alog__vote { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
@media (max-width: 1100px) {
  .ds-alog__body { grid-template-columns: minmax(0, 1fr); }
  .ds-alog__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ds-alog__top { max-height: none; }
}
</style>
