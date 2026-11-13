<template>
  <AppShell>
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title h2">Lịch sử hỏi AVA</h1>
      </div>
      <div v-if="admin && backend.enabled" class="page-header__right">
        <span class="ava-log__keep">Lưu {{ keepDays }} ngày gần nhất</span>
      </div>
    </div>

    <div v-if="!admin" class="content-wrapper">
      <div class="card"><p class="empty-state">Chỉ Quản trị mới truy cập được trang này.</p></div>
    </div>
    <div v-else-if="!backend.enabled" class="content-wrapper">
      <div class="card"><p class="empty-state">Lịch sử hỏi AVA chỉ có ở bản chạy trên máy chủ.</p></div>
    </div>

    <div v-else class="content-wrapper content-wrapper--fill ava-log">
      <!-- Thống kê theo bộ lọc hiện tại -->
      <div class="ava-log__stats">
        <div v-for="s in stats" :key="s.label" class="card ava-log__stat">
          <span class="ava-log__stat-label"><TIcon :name="s.icon" :style="{ color: s.color }" />{{ s.label }}</span>
          <span class="ava-log__stat-value">{{ s.value }}</span>
          <span v-if="s.sub" class="ava-log__stat-sub">{{ s.sub }}</span>
        </div>
      </div>

      <div class="ava-log__body">
        <div class="table-panel">
          <TableHeader v-model="search" search-placeholder="Tìm trong câu hỏi / trả lời" :search-width="260" :hide-ai="true" :hide-tools="['col-settings', 'filter']"
            @refresh="load" @export="exportCsv">
            <template #filters>
              <AppCombobox v-model="period" class="ava-log__filter" :options="PERIODS" :clearable="false" />
              <AppCombobox v-model="person" class="ava-log__filter ava-log__filter--wide" :options="personOptions" placeholder="Người hỏi: Tất cả" />
              <AppCombobox v-model="status" class="ava-log__filter" :options="STATUS_OPTIONS" placeholder="Kết quả: Tất cả" />
              <AppCombobox v-model="voteFilter" class="ava-log__filter" :options="VOTE_OPTIONS" placeholder="Đánh giá: Tất cả" />
            </template>
          </TableHeader>
          <div class="table-scroll">
            <DataTable :columns="columns" :rows="view.paged.value" :line-count="2" :hide-blank-rows="false"
              @row-click="r => (detail = logById.get(r.id))" @column-sort="view.onSort" @column-filter="view.onFilter" />
            <p v-if="loaded && !rows.length" class="ava-log__empty">{{ logs.length ? 'Không có lượt hỏi nào khớp bộ lọc.' : 'Chưa có ai hỏi AVA.' }}</p>
          </div>
          <TablePaging :total="view.processed.value.length" v-model:page="view.page.value" v-model:page-size="view.pageSize.value" />
        </div>

        <!-- Câu hỏi lặp lại nhiều → gợi ý bổ sung FAQ / làm rõ quy tắc -->
        <aside class="card ava-log__top">
          <span class="card-title">Câu hỏi hay gặp</span>
          <p class="ava-log__hint">Hỏi lặp lại nhiều → nên làm rõ quy tắc hoặc bổ sung vào Câu hỏi thường gặp.</p>
          <p v-if="!topQuestions.length" class="ava-log__hint">Chưa có dữ liệu.</p>
          <ol class="ava-log__top-list">
            <li v-for="q in topQuestions" :key="q.key">
              <button type="button" class="ava-log__top-q" v-tip="'Lọc theo câu hỏi này'" @click="search = q.text">{{ q.text }}</button>
              <span class="ava-log__top-n">{{ q.count }}</span>
            </li>
          </ol>
        </aside>
      </div>
    </div>

    <!-- Chi tiết 1 lượt hỏi -->
    <DialogShell v-if="detail" title="Chi tiết lượt hỏi AVA" :width="680" :tab-fields-only="false" @close="detail = null">
      <div class="ava-log__detail">
        <div class="ava-log__who">
          <UserAvatar class="ava-log__avatar" :name="userOf(detail).name" :picture="avatarOf(userOf(detail))" />
          <div class="ava-log__who-text">
            <span class="ava-log__who-name">{{ userOf(detail).name }}</span>
            <span class="ava-log__who-sub">{{ [userOf(detail).code, timeText(detail.at)].filter(Boolean).join(' · ') }}</span>
          </div>
          <AppTag :label="STATUS[detail.status].label" :color="STATUS[detail.status].color" />
        </div>
        <span class="ava-log__label">Câu hỏi<template v-if="detail.images"> · kèm {{ detail.images }} ảnh</template></span>
        <div class="ava-log__q">{{ detail.question }}</div>
        <!-- Ảnh người hỏi gửi kèm (lưu 30 ngày rồi tự xóa) — bấm để xem ảnh đầy đủ -->
        <div v-if="detail.imageFiles?.length && imgFresh(detail)" class="ava-log__imgs">
          <a v-for="f in detail.imageFiles" :key="f" :href="`/api/admin/ava-images/${f}`" target="_blank" rel="noopener" v-tip="'Xem ảnh đầy đủ'"><img :src="`/api/admin/ava-images/${f}`" alt="Ảnh đính kèm" loading="lazy" /></a>
        </div>
        <span v-else-if="detail.images" class="ava-log__img-gone">Ảnh đính kèm đã quá 30 ngày nên đã tự xóa.</span>
        <span class="ava-log__label">{{ detail.status === 'error' ? 'Lỗi' : 'AVA trả lời' }}</span>
        <!-- eslint-disable-next-line vue/no-v-html — đã escape HTML trong avaHtml -->
        <div class="ava-log__a" v-html="avaHtml(detail.answer)" />
        <template v-if="detail.vote">
          <span class="ava-log__label">Người hỏi đánh giá</span>
          <div class="ava-log__vote"><AppTag :label="VOTE[detail.vote].label" :color="VOTE[detail.vote].color" /><span v-if="detail.voteNote">{{ detail.voteNote }}</span></div>
        </template>
      </div>
      <template #footer>
        <button v-if="canReuse(detail)" class="btn btn--outline btn--neutral" @click="toggleReuse(detail)">{{ detail.noReuse ? 'Cho dùng lại' : 'Không dùng lại' }}</button>
        <button class="btn btn--outline btn--neutral" @click="detail = null">Đóng</button>
      </template>
    </DialogShell>
  </AppShell>
</template>

<script setup>
import { avatarOf } from '../store/avatar.js'
import { ref, computed, onMounted } from 'vue'
import AppShell    from '../components/AppShell.vue'
import DialogShell from '../components/DialogShell.vue'
import UserAvatar  from '../components/UserAvatar.vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppTag      from '@mds/components/AppTag.vue'
import TableHeader from '@mds/components/TableHeader.vue'
import DataTable   from '@mds/components/DataTable.vue'
import TablePaging from '@mds/components/TablePaging.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { matchText } from '@mds/utils/search.js'
import { toast } from '@mds/utils/toast.js'
import { api, backend } from '../store/api.js'
import { isAdmin, roleLabelOf } from '../store/db.js'
import { useTableView } from '../store/useTableView.js'
import { downloadCsv } from '../store/csv.js'
import { avaHtml } from '../store/avaFormat.js'

const admin = computed(() => isAdmin())
const STATUS = {
  answered: { label: 'Đã trả lời',   color: 'success' },
  refused:  { label: 'Ngoài phạm vi', color: 'warning' },
  error:    { label: 'Lỗi',           color: 'danger' },
}
const STATUS_OPTIONS = Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))
/* Đánh giá của người hỏi (Like / Dislike trong khung AVA) */
const VOTE = { up: { label: '👍 Hữu ích', color: 'success' }, down: { label: '👎 Chưa đúng / đủ', color: 'danger' }, none: { label: 'Chưa đánh giá', color: 'neutral' } }
const VOTE_OPTIONS = Object.entries(VOTE).map(([value, v]) => ({ value, label: v.label }))
const PERIODS = [
  { value: '7',  label: '7 ngày gần nhất' },
  { value: '30', label: '30 ngày gần nhất' },
  { value: '90', label: '90 ngày gần nhất' },
  { value: 'all', label: 'Tất cả' },
]

const logs = ref([]), users = ref({}), keepDays = ref(180), loaded = ref(false)
const search = ref(''), period = ref('30'), person = ref(''), status = ref(''), voteFilter = ref(''), detail = ref(null)

async function load() {
  if (!backend.enabled || !admin.value) return
  try {
    const r = await api.get('/api/admin/ava-logs')
    logs.value = r.logs; users.value = r.users; keepDays.value = r.keepDays ?? 180
  } catch (e) { toast.error(e.message || 'Không tải được lịch sử hỏi AVA') }
  finally { loaded.value = true }
}
onMounted(load)

const logById = computed(() => new Map(logs.value.map(l => [l.id, l])))
// Lượt khách hỏi trong bản dùng thử: chưa đăng nhập → “Khách N”; đã đăng nhập bản thật → tên thật (kèm nhãn Dùng thử)
const userOf = l => (l.demo && !l.userId ? { name: l.guest || 'Khách', code: ['Dùng thử', l.device, l.ip].filter(Boolean).join(' · '), guest: true }
  : users.value[l.userId] ?? { name: 'Người dùng đã xóa', code: '' })
const pad = n => String(n).padStart(2, '0')
const timeText = iso => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` }
const personOptions = computed(() => [
  ...(logs.value.some(l => l.demo) ? [{ value: '__guest', label: 'Khách (bản dùng thử)', description: 'Mọi lượt hỏi từ bản dùng thử' }] : []),
  ...Object.values(users.value)
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    .map(u => ({ value: u.id, label: u.name, description: [u.code, roleLabelOf(u)].filter(Boolean).join(' · ') })),
])

// Lọc theo thời gian + người + kết quả (thống kê & câu hay gặp dùng chung) → rồi mới lọc theo ô tìm kiếm cho bảng
const inScope = computed(() => {
  const from = period.value === 'all' ? '' : new Date(Date.now() - Number(period.value) * 86400e3).toISOString()
  return logs.value.filter(l => (!from || l.at >= from) && (!person.value || (person.value === '__guest' ? l.demo : l.userId === person.value)) && (!status.value || l.status === status.value) && (!voteFilter.value || (l.vote || 'none') === voteFilter.value))
})
const filtered = computed(() => { const q = search.value.trim(); return q ? inScope.value.filter(l => matchText([l.question, l.answer], q)) : inScope.value })

const short = (s, n) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t }
const columns = [
  { key: 'at',       label: 'Thời gian',  width: 170 },
  { key: 'user',     label: 'Người hỏi',  type: 'avatar-subtext', width: 200 },
  { key: 'question', label: 'Câu hỏi',    minWidth: 240 },
  { key: 'answer',   label: 'AVA trả lời', minWidth: 240 },
  { key: 'status',   label: 'Kết quả',    type: 'status', width: 150 },
  { key: 'vote',     label: 'Đánh giá',   type: 'status', width: 170 },
  { key: 'reuse',    label: 'Dùng lại',   width: 150, tip: 'Câu trả lời này được lấy lại cho câu hỏi giống mấy lần (không gọi AI, không tốn token)' },
]
/** Ảnh lưu 30 ngày (máy chủ tự xóa) */
const imgFresh = l => Date.now() - Date.parse(l.at) < 30 * 86400e3
const rows = computed(() => filtered.value.map(l => {
  const u = userOf(l)
  return {
    id: l.id, _at: l.at, at: timeText(l.at),
    user: { text: u.name, subtext: u.code || u.email || '', avatar: avatarOf(u) },
    question: (l.images ? `[${l.images} ảnh] ` : '') + short(l.question, 200), answer: short(l.answer.replace(/\*\*/g, ''), 220),
    status: STATUS[l.status] ?? STATUS.answered,
    vote: l.vote ? { ...VOTE[l.vote], tip: l.voteNote || '' } : null,
    reuse: l.reuseOf ? 'Lấy từ câu đã có' : l.noReuse ? 'Đã tắt' : l.reuseCount ? `${l.reuseCount} lần` : '–',
  }
}))
/* Bật / tắt dùng lại câu trả lời (gợi ý “Có phải bạn định hỏi…” + trả lời ngay câu hỏi trùng) */
const canReuse = l => l && l.status === 'answered' && !l.reuseOf && !l.images && l.vote !== 'down' && l.reusable !== false
async function toggleReuse(l) {
  try { await api.put(`/api/admin/ava-logs/${l.id}/reuse`, { on: !!l.noReuse }); l.noReuse = !l.noReuse; toast.success(l.noReuse ? 'AVA sẽ không dùng lại câu trả lời này' : 'AVA được dùng lại câu trả lời này cho câu hỏi giống') }
  catch (e) { toast.error(e.message) }
}
const view = useTableView(rows, { sortValue: (r, k) => (k === 'at' ? r._at : k === 'user' ? r.user.text : r[k]?.label ?? r[k]) })

const stats = computed(() => {
  const list = inScope.value
  return [
    { label: 'Lượt hỏi',      icon: 'message-circle', color: 'var(--text-brand)',   value: list.length },
    { label: 'Người hỏi',     icon: 'users',          color: 'var(--text-success)', value: new Set(list.map(l => l.userId || `g:${l.guest}`)).size },
    { label: 'Ngoài phạm vi', icon: 'alert-triangle', color: 'var(--text-warning)', value: list.filter(l => l.status === 'refused').length },
    { label: 'Lỗi',           icon: 'circle-x',       color: 'var(--text-danger)',  value: list.filter(l => l.status === 'error').length },
    { label: 'Chưa đúng / đủ', icon: 'thumb-down', color: 'var(--text-danger)', value: list.filter(l => l.vote === 'down').length,
      sub: `${list.filter(l => l.vote === 'up').length} lượt 👍 hữu ích` },
  ]
})
// Câu hay gặp: gộp câu giống nhau (bỏ dấu câu, khoảng trắng, hoa thường) — chỉ tính câu AVA đã trả lời
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

function exportCsv() {
  downloadCsv('lich-su-hoi-ava.csv', ['Thời gian', 'Người hỏi', 'Mã nhân viên', 'Câu hỏi', 'AVA trả lời', 'Kết quả', 'Đánh giá', 'Góp ý'],
    filtered.value.map(l => { const u = userOf(l); return [timeText(l.at), u.name, u.code ?? '', l.question, l.answer, STATUS[l.status]?.label ?? '', l.vote ? VOTE[l.vote].label : '', l.voteNote ?? ''] }))
}
</script>

<style scoped>
.ava-log__vote { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ava-log { display: flex; flex-direction: column; gap: var(--card-col-gap); }
.ava-log__keep { font-size: var(--text-body); color: var(--text-secondary); }
.ava-log__stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--card-col-gap); flex-shrink: 0; }
.ava-log__stat { display: flex; flex-direction: column; gap: 4px; padding: var(--box-padding); }
.ava-log__stat-label { display: flex; align-items: center; gap: 6px; font-size: var(--text-body); color: var(--text-secondary); }
.ava-log__stat-label .ti { font-size: 16px; }
.ava-log__stat-sub { font-size: var(--text-body); color: var(--text-secondary); }
.ava-log__stat-value { font-size: 24px; line-height: 32px; font-weight: var(--fw-semibold); color: var(--text-primary); }
.ava-log__body { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: var(--card-col-gap); }
.ava-log__body > .table-panel { min-height: 0; }
.ava-log__filter { width: 180px; }
.ava-log__filter--wide { width: 220px; }
.ava-log__empty { padding: 24px; text-align: center; font-size: var(--text-body); color: var(--text-secondary); }
.ava-log__top { display: flex; flex-direction: column; gap: 8px; min-height: 0; overflow-y: auto; align-self: start; max-height: 100%; }
.ava-log__hint { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.ava-log__top-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; }
.ava-log__top-list li { display: flex; align-items: flex-start; gap: 8px; padding: 8px 0; border-top: 1px solid var(--stroke-divider); }
.ava-log__top-list li:first-child { border-top: none; }
.ava-log__top-q { flex: 1; min-width: 0; padding: 0; border: none; background: none; font-family: inherit; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); text-align: left; cursor: pointer; }
.ava-log__top-q:hover { color: var(--text-brand); text-decoration: underline; }
.ava-log__top-n { flex-shrink: 0; min-width: 24px; padding: 0 8px; border-radius: var(--radius-pill); background: var(--bg-brand-light); font-size: var(--text-sm); line-height: 20px; font-weight: var(--fw-semibold); color: var(--text-brand); text-align: center; }
@media (max-width: 1100px) {
  .ava-log__body { grid-template-columns: minmax(0, 1fr); }
  .ava-log__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.ava-log__detail { display: flex; flex-direction: column; gap: 8px; }
.ava-log__who { display: flex; align-items: center; gap: 10px; padding-bottom: 12px; border-bottom: 1px solid var(--stroke-divider); }
.ava-log__avatar { width: 36px; height: 36px; border-radius: var(--radius-pill); display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: var(--fw-semibold); flex-shrink: 0; }
.ava-log__who-text { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.ava-log__who-name { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ava-log__who-sub { font-size: var(--text-body); color: var(--text-secondary); }
.ava-log__label { margin-top: 6px; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-secondary); }
.ava-log__q { padding: 10px 12px; border-radius: var(--radius-default); background: var(--bg-brand-light); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); white-space: pre-wrap; word-break: break-word; }
.ava-log__a { max-height: 50vh; overflow-y: auto; padding: 10px 12px; border-radius: var(--radius-default); background: var(--bg-neutral-light); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); word-break: break-word; }
.ava-log__a :deep(p) { margin: 0 0 6px; }
.ava-log__a :deep(p:last-child) { margin-bottom: 0; }
.ava-log__a :deep(ul), .ava-log__a :deep(ol) { margin: 0 0 6px; padding-left: 18px; }
.ava-log__a :deep(strong) { font-weight: var(--fw-semibold); }
.ava-log__a :deep(li > ul), .ava-log__a :deep(li > ol) { margin: 2px 0; color: var(--text-secondary); }
.ava-log__a :deep(h4) { margin: 8px 0 4px; font-weight: var(--fw-semibold); color: var(--text-brand); }
.ava-log__a :deep(h4:first-child) { margin-top: 0; }
.ava-log__a :deep(code) { padding: 0 4px; border-radius: 4px; background: var(--bg-white); }
.ava-log__imgs { display: flex; flex-wrap: wrap; gap: 8px; }
.ava-log__imgs img { display: block; max-width: 200px; max-height: 160px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); object-fit: cover; }
.ava-log__img-gone { font-size: var(--text-body); color: var(--text-secondary); }
</style>
