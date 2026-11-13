<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-muted">Chế độ:</span>
      <div class="seg" role="group" aria-label="Chế độ tìm kiếm">
        <button v-for="m in MODES" :key="m.id" type="button" class="seg__item" :class="{ 'seg__item--active': mode === m.id }" :aria-pressed="mode === m.id" @click="mode = m.id">{{ m.label }}</button>
      </div>
      <template v-if="mode === 'normal'">
        <span class="demo-muted">Kiểu:</span>
        <div class="seg" role="group" aria-label="Kiểu ô tìm kiếm">
          <button v-for="v in VARIANTS" :key="v.id" type="button" class="seg__item" :class="{ 'seg__item--active': variant === v.id }" :aria-pressed="variant === v.id" @click="variant = v.id">{{ v.label }}</button>
        </div>
      </template>
    </div>

    <!-- Tìm kiếm thường: lọc ngay khi gõ -->
    <template v-if="mode === 'normal'">
      <div class="demo-sb-stage" :class="{ 'demo-sb-stage--brand': variant === 'filled-white' }">
        <AppSearchbox v-model="q" :variant="variant" placeholder="Tìm theo tên, mã khách hàng" :width="320" />
        <AppSearchbox :variant="variant" placeholder="Không dùng được" disabled :width="200" />
      </div>
      <ul class="demo-sb-list" aria-live="polite">
        <li v-for="c in filtered" :key="c.code"><b>{{ c.code }}</b><span>{{ c.name }}</span></li>
        <li v-if="!filtered.length" class="demo-muted">Không tìm thấy khách hàng nào khớp “{{ q }}”</li>
      </ul>
      <span class="demo-muted">Gõ để lọc ngay (không dấu cũng được) · ✕ hoặc Esc để xóa. <template v-if="variant === 'filled-white'">Filled White chỉ đặt trên nền màu (VD Global Header).</template></span>
    </template>

    <!-- Tìm kiếm thông minh: gõ câu tự nhiên → bấm icon phân tích xem AI bóc tách trường / giá trị · Enter → popup kết quả theo nhóm -->
    <template v-else>
      <div class="demo-sb-stage">
        <AppAiSearchbox v-model="ai" :width="420" placeholder="Hỏi bằng câu tự nhiên…" :parsed="parsed" :results="results" :panel-width="640"
          @analyze="t => (parsed = parse(t))" @submit="search" @more="onMore" :more-items="moreItems" :more-total="moreTotal" @select="it => toast.info(`Mở hồ sơ ${it.name}`)" @clear="results = null" />
        <AppAiSearchbox placeholder="Tìm kiếm thông minh" disabled :width="200" />
      </div>
      <div class="demo-row demo-sb-try">
        <span class="demo-muted">Thử:</span>
        <button v-for="t in TRY" :key="t" type="button" class="btn btn--outline btn--neutral btn--sm" @click="ai = t">{{ t }}</button>
      </div>
      <span class="demo-muted">Bấm icon phân tích (màn hình) để xem AI bóc tách được trường nào, giá trị gì · <b>Enter</b> để xem kết quả theo nhóm.</span>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppSearchbox from '@mds/components/AppSearchbox.vue'
import AppAiSearchbox from '@mds/components/AppAiSearchbox.vue'
import { toast } from '@mds/utils/toast.js'

const MODES = [{ id: 'normal', label: 'Thường' }, { id: 'ai', label: 'Thông minh' }]
const VARIANTS = [{ id: 'outline', label: 'Outline' }, { id: 'filled', label: 'Filled' }, { id: 'filled-white', label: 'Filled White' }]
const mode = ref('normal'), variant = ref('outline')
const CUSTOMERS = [
  { code: 'KH0101', name: 'Công ty TNHH An Phát', city: 'Hà Nội', debt: 125000000 },
  { code: 'KH0108', name: 'Công ty CP Bình Minh', city: 'TP. Hồ Chí Minh', debt: 42500000 },
  { code: 'KH0115', name: 'Cửa hàng Cường Thịnh', city: 'Hà Nội', debt: 8300000 },
  { code: 'KH0122', name: 'Công ty CP Dược phẩm Cát Tường', city: 'Đà Nẵng', debt: 312000000 },
  { code: 'KH0130', name: 'Công ty TNHH Logistics Long Hải', city: 'Hải Phòng', debt: 0 },
]
// So khớp không dấu: “cuong thinh” vẫn ra “Cường Thịnh”
const plain = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
const q = ref('')
const filtered = computed(() => { const k = plain(q.value.trim()); return k ? CUSTOMERS.filter(c => plain(c.name + ' ' + c.code).includes(k)) : CUSTOMERS })

// Mô phỏng AI (ứng dụng thật gửi câu hỏi lên máy chủ để AI bóc tách điều kiện rồi tìm)
const ORG = 'Khối KD Thị trường Doanh nghiệp'
const STAFF = [
  { id: 'B05-0011', name: 'Hoàng Ngọc Mai', pos: 'Trưởng phòng kinh doanh', unit: 'Phòng bán thêm GP HDDT 02', months: 18, flag: 'ok' },
  { id: 'B05-0012', name: 'Nguyễn Ngọc Mai', pos: 'Phó phòng kinh doanh', unit: 'Nhóm Quản lý', months: 9, flag: 'ok' },
  { id: 'B05-0013', name: 'Thân Ngọc Mai', pos: 'Phó phòng kinh doanh', unit: 'Phòng KD GP DN lớn', months: 7, flag: 'ok' },
  { id: 'B05-0014', name: 'Trần Thị Mai', pos: 'Phó phòng kinh doanh', unit: 'Phòng KD GP DN lớn', months: 4, flag: 'ok' },
  { id: 'B05-0015', name: 'Vũ Ngọc Mai', pos: 'Trưởng nhóm kinh doanh', unit: 'Phòng KD GP DN lớn', months: 12, flag: 'ok' },
  { id: 'B05-0016', name: 'Lê Văn Hùng', pos: 'Trưởng nhóm kinh doanh', unit: 'Phòng KD Miền Bắc', months: 26, flag: 'kl' },
  { id: 'B05-0017', name: 'Đỗ Minh Châu', pos: 'Trưởng phòng kinh doanh', unit: 'Phòng KD Miền Nam', months: 30, flag: 'ok' },
  { id: 'B05-0018', name: 'Phạm Quốc Anh', pos: 'Trưởng nhóm kinh doanh', unit: 'Phòng KD Miền Trung', months: 8, flag: 'ok' },
  { id: 'D02-0101', name: 'Trần Văn Bình', pos: 'DEV Lead', unit: 'Phòng Phát triển sản phẩm', months: 20, flag: 'ok', org: 'Khối Công nghệ' },
]
const REWARDS = [{ id: 'kt-2023', name: 'Đợt khen thưởng nhân viên cuối năm 2023', staff: ['B05-0011', 'B05-0017', 'D02-0101'] }]
const TRY = ['Trưởng, phó phòng kinh doanh giữ chức vụ trên 6 tháng, không vi phạm kỷ luật', 'Trần Văn Bình DEV Lead']
const POSITIONS = [...new Set(STAFF.map(s => s.pos))]
const ai = ref(''), parsed = ref([]), results = ref(null), limit = ref(5)
function parse(text) {
  const t = plain(text), out = []
  const name = STAFF.find(s => t.includes(plain(s.name)))
  if (name) out.push({ label: 'Họ và tên', value: name.name, test: s => s.id === name.id })
  // Khớp đúng tên chức vụ + hiểu cách viết gộp “Trưởng, phó … kinh doanh” → mọi chức vụ Trưởng / Phó thuộc kinh doanh
  const pos = POSITIONS.filter(p => t.includes(plain(p)) || (t.includes('kinh doanh') && /kinh doanh/i.test(p) && ((/\btruong\b/.test(t) && /^Trưởng/.test(p)) || (/\bpho\b/.test(t) && /^Phó/.test(p)))))
  if (pos.length) out.push({ label: name ? 'Vị trí công việc' : 'Quá trình công tác_Chức vụ', value: pos.join(', '), test: s => pos.includes(s.pos) })
  const m = t.match(/(\d+)\s*thang/)
  if (m) out.push({ label: 'Thời gian giữ chức vụ', value: `≥ ${m[1]} tháng`, test: s => s.months >= +m[1] })
  if (/ky luat|vi pham/.test(t)) out.push({ label: 'Kỷ luật', value: 'Không vi phạm', test: s => s.flag !== 'kl' })
  return out
}
/** Toàn bộ kết quả theo nhóm cho 1 câu hỏi (AI bóc tách điều kiện rồi tìm) */
function fullOf(text) {
  const conds = parse(text)
  const hits = conds.length ? STAFF.filter(s => conds.every(c => c.test(s))) : STAFF.filter(s => plain(s.name + ' ' + s.pos).includes(plain(text)))
  const ids = new Set(hits.map(h => h.id))
  return {
    parsed: conds,
    profile: hits.map(s => ({ id: s.id, name: `${s.name} (${s.id})`, subtitle: s.pos, meta: `${s.org || ORG}  →  ${s.unit}` })),
    reward: REWARDS.filter(r => r.staff.some(id => ids.has(id))).map(r => ({ id: r.id, name: r.name, avatar: false })),
  }
}
function search(text) {
  const f = fullOf(text); parsed.value = f.parsed
  results.value = [
    f.profile.length && { key: 'profile', title: 'Hồ sơ', total: f.profile.length, items: f.profile.slice(0, limit.value) },
    f.reward.length && { key: 'reward', title: 'Khen thưởng', total: f.reward.length, items: f.reward },
  ].filter(Boolean)
}
/* “Xem thêm” của 1 nhóm → popup chỉ chứa kết quả của đúng nhóm đó (cùng popup với ô tìm kiếm toàn cục ở Global header) */
const moreItems = ref(null), moreTotal = ref(null)
let moreTimer = 0
function onMore(g, text) {
  moreItems.value = null; clearTimeout(moreTimer)
  moreTimer = setTimeout(() => { const list = fullOf(text)[g.key] ?? []; moreItems.value = list; moreTotal.value = list.length }, 400)
}
</script>

<style scoped>
.demo-sb-stage { display: flex; flex-wrap: wrap; align-items: center; gap: var(--gap-control); padding: 16px; border-radius: var(--radius-card); background: var(--bg-white); box-shadow: var(--shadow-all-2); }
.demo-sb-stage--brand { background: var(--bg-brand); }
.demo-sb-stage > * { max-width: 100%; }
.demo-sb-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.demo-sb-list li { display: flex; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--stroke-neutral-light); }
.demo-sb-list b { width: 64px; flex-shrink: 0; font-weight: var(--fw-semibold); }
.demo-sb-list span:not(.demo-sb-debt) { flex: 1; min-width: 0; }
.demo-sb-debt { font-feature-settings: 'tnum'; }
.demo-sb-try { flex-wrap: wrap; }
.demo-sb-try .btn { max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
</style>
