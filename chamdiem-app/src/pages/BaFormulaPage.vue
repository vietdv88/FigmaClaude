<template>
  <AppShell>
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title h2">Quy tắc chấm điểm BA</h1>
      </div>
      <div v-if="admin" class="page-header__right">
        <button class="btn btn--outline btn--neutral" @click="restoreDefault">Khôi phục mặc định</button>
        <button class="btn btn--primary" :disabled="!dirty || weightSum !== 100" @click="save">Lưu hệ số</button>
      </div>
      <div v-else class="page-header__right">
        <span class="pdp-ro-note"><TIcon name="lock" />Chỉ xem — chỉ Quản trị được sửa hệ số</span>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Quy trình: tương tự PD -->
      <div class="card stack">
        <span class="card-title">Quy trình chấm điểm BA</span>
        <ol class="pdp-flow pdp-flow--7">
          <li v-for="(f, i) in BA_FLOW" :key="i" class="pdp-flow__step" :style="{ '--c': f.color }">
            <span class="pdp-flow__dot"><TIcon :name="f.icon" /><span class="pdp-flow__no">{{ i + 1 }}</span></span>
            <span class="pdp-flow__title">{{ f.title }}</span>
            <span class="pdp-flow__who">{{ f.who }}</span>
            <span class="pdp-flow__desc">{{ f.desc }}</span>
          </li>
        </ol>
        <p class="pdp-flow__note"><TIcon name="info-circle" /><span>Điểm tính theo <strong>Ngày hoàn thành thực tế</strong>, không theo vòng lặp — Work Item xong ngày nào được cộng vào tháng của ngày đó, dù thuộc vòng lặp nào.</span></p>
      </div>

      <!-- Công thức — các mục 1 → 4 bên dưới giải thích từng thành phần -->
      <div class="card stack">
        <span class="card-title">Công thức</span>
        <p class="formula">
          <strong>Điểm thực nhận</strong> =
          <a class="f-term" href="#ba-muc-1" @click.prevent="goSec(1)">① BA Point</a> × {{ c.weights.point }}% +
          <a class="f-term" href="#ba-muc-2" @click.prevent="goSec(2)">② Point tiến độ</a> × {{ c.weights.progress }}% +
          <a class="f-term" href="#ba-muc-3" @click.prevent="goSec(3)">③ Point chất lượng</a> × {{ c.weights.quality }}%
        </p>
        <p class="formula"><strong>Điểm tháng của BA</strong> = Tổng <a class="f-term" href="#ba-muc-4" @click.prevent="goSec(4)">④ Điểm thực nhận</a> có Ngày hoàn thành thực tế trong tháng</p>
        <p class="muted">Work Item đã hoàn thành nhưng còn “{{ BA_UNRATED }}” chất lượng → chưa tính Điểm thực nhận (cảnh báo dữ liệu, không coi là 0%). Đọc lần lượt các mục bên dưới.</p>
      </div>

      <!-- ① BA Point -->
      <div id="ba-muc-1" class="card stack sec-card">
        <span class="card-title"><span class="sec-no">1</span>BA Point (Story Point)</span>
        <p class="rule-text">Số Point của từng Work Item, do <strong>PO</strong> (hoặc dự án / PM / Lead) chấm và thống nhất với BA, căn cứ mức độ công việc. Đây cũng là <strong>Point năng suất</strong> khi Work Item hoàn thành.</p>
        <div class="field-grid ba-weight"><AppInput label="Trọng số BA Point (%)"><AppNumberbox v-model="cfg.weights.point" :min="0" :max="100" :step="5" :state="ro" /></AppInput></div>
        <span class="sub-title">Lưu ý khi chấm Point</span>
        <ul class="rule-row__list"><li v-for="r in BA_POINT_RULES" :key="r">{{ r }}</li></ul>
      </div>

      <!-- ② Tiến độ -->
      <div id="ba-muc-2" class="card stack sec-card">
        <span class="card-title"><span class="sec-no">2</span>Tiến độ</span>
        <div class="rule-row">
          <span class="rule-row__key">Hệ số tiến độ</span>
          <ul class="rule-row__list">
            <li><strong>100%</strong> — hoàn thành đúng hạn (Ngày hoàn thành thực tế ≤ Deadline), hoặc trễ nhưng được <strong>miễn trừ trễ</strong> hợp lệ.</li>
            <li><strong>0%</strong> — trễ mà không được miễn trừ.</li>
            <li>Chưa hoàn thành → để trống. Đã hoàn thành mà thiếu Deadline → bổ sung trước khi chốt.</li>
          </ul>
        </div>
        <div class="rule-row"><span class="rule-row__key">Point tiến độ</span><span class="rule-text">= BA Point × Hệ số tiến độ — số Point hoàn thành đúng hạn của Work Item.</span></div>
        <div class="rule-row"><span class="rule-row__key">Miễn trừ trễ</span><span class="rule-text">Chỉ chọn “Có” khi trễ do nguyên nhân khách quan được chấp nhận; bắt buộc ghi rõ lý do ở Ghi chú.</span></div>
        <div class="field-grid ba-weight"><AppInput label="Trọng số Point tiến độ (%)"><AppNumberbox v-model="cfg.weights.progress" :min="0" :max="100" :step="5" :state="ro" /></AppInput></div>
      </div>

      <!-- ③ Chất lượng -->
      <div id="ba-muc-3" class="card stack sec-card">
        <span class="card-title"><span class="sec-no">3</span>Chất lượng — khung 3 mức</span>
        <p class="formula"><strong>Point chất lượng</strong> = BA Point × Hệ số chất lượng</p>
        <div v-for="q in BA_QUALITY_LEVELS" :key="q.value" class="rule-row ba-q-row">
          <div class="rule-row__key coef-key">
            <AppTag :label="`${n(c.quality[q.value])}% · ${q.value}`" :color="q.color" />
            <AppNumberbox v-model="cfg.quality[q.value]" :min="0" :max="100" :step="5" :state="ro" />
          </div>
          <span class="rule-text">{{ q.criteria }}</span>
        </div>
        <div class="rule-row ba-q-row">
          <div class="rule-row__key"><AppTag :label="BA_UNRATED" color="neutral" /></div>
          <span class="rule-text">Giá trị mặc định — chưa tính Point chất lượng và Điểm thực nhận.</span>
        </div>
        <span class="sub-title">Nguyên tắc ghi nhận và chấm chất lượng</span>
        <ul class="rule-row__list"><li v-for="p in BA_PRINCIPLES" :key="p.key"><strong>{{ p.key }}</strong>: {{ p.text }}</li></ul>
        <div class="field-grid ba-weight"><AppInput label="Trọng số Point chất lượng (%)"><AppNumberbox v-model="cfg.weights.quality" :min="0" :max="100" :step="5" :state="ro" /></AppInput></div>
      </div>
      <p v-if="weightSum !== 100" class="warn ba-sum"><TIcon name="alert-triangle" />Tổng trọng số BA Point + Point tiến độ + Point chất lượng đang là {{ weightSum }}% — phải bằng 100% mới lưu được.</p>

      <!-- ④ Điểm Work Item & điểm tháng -->
      <div id="ba-muc-4" class="card stack sec-card">
        <span class="card-title"><span class="sec-no">4</span>Điểm thực nhận & điểm tháng</span>
        <p class="formula"><strong>Điểm thực nhận</strong> = BA Point × {{ c.weights.point }}% + Point tiến độ × {{ c.weights.progress }}% + Point chất lượng × {{ c.weights.quality }}% — hệ thống tự tính khi đủ dữ liệu.</p>
        <span class="sub-title">Ví dụ</span>
        <div class="ba-table-wrap">
          <table class="ba-table">
            <thead><tr><th>Công việc</th><th class="num">BA Point</th><th>Deadline</th><th>Hoàn thành</th><th class="num">HS tiến độ</th><th class="num">Point tiến độ</th><th class="num">HS chất lượng</th><th class="num">Point chất lượng</th><th class="num">Điểm thực nhận</th></tr></thead>
            <tbody>
              <tr v-for="e in examples" :key="e.title">
                <td>{{ e.title }}</td><td class="num">{{ n(e.point) }}</td><td>{{ e.deadline }}</td><td>{{ e.done }}</td>
                <td class="num">{{ e.s.progressRate }}%</td><td class="num">{{ n(e.s.progressPoint) }}</td>
                <td class="num">{{ e.s.qualityRate }}%</td><td class="num">{{ n(e.s.qualityPoint) }}</td><td class="num"><strong>{{ n(e.s.actual) }}</strong></td>
              </tr>
            </tbody>
            <tfoot><tr><td colspan="8">Điểm tháng của BA (cả 3 việc hoàn thành trong tháng)</td><td class="num"><strong>{{ n(exampleTotal) }}</strong></td></tr></tfoot>
          </table>
        </div>
        <span class="sub-title">Tổng hợp & chốt điểm cuối tháng</span>
        <ul class="rule-row__list">
          <li><strong>Điểm tháng</strong>: cộng Điểm thực nhận các Work Item có Ngày hoàn thành thực tế trong tháng — không tính lại từ BA Point ban đầu.</li>
          <li><strong>Point năng suất</strong>: tổng BA Point các Work Item đã hoàn thành, có đầu ra dùng được trong tháng.</li>
          <li><strong>Hệ số tiến độ tháng</strong> = Tổng Point tiến độ ÷ Point năng suất · <strong>Hệ số chất lượng tháng</strong> = Tổng Point chất lượng ÷ Point năng suất (bình quân theo BA Point).</li>
          <li>Quản lý trực tiếp (hoặc Quản trị) vào chốt điểm cuối tháng cho các BA mình quản lý; rà soát cảnh báo (thiếu Deadline, “{{ BA_UNRATED }}” chất lượng) trước khi chốt.</li>
        </ul>
      </div>

      <!-- Tính thử 1 Work Item -->
      <div class="card stack">
        <span class="card-title"><TIcon name="calculator" class="ba-calc__icon" />Tính thử điểm một Work Item</span>
        <div class="ba-calc">
          <div class="field-grid">
            <AppInput label="BA Point"><AppNumberbox v-model="calc.point" :min="0" :step="0.5" /></AppInput>
            <AppInput label="Tiến độ"><AppCombobox v-model="calc.progress" :options="PROGRESS_OPTIONS" :clearable="false" /></AppInput>
            <AppInput label="Kết quả chất lượng" class="span-2"><AppCombobox v-model="calc.quality" :options="qualityOptions" :clearable="false" /></AppInput>
          </div>
          <div class="ba-calc__out">
            <div v-for="o in calcOut" :key="o.label" class="ba-calc__item" :class="{ 'ba-calc__item--main': o.main }">
              <span class="ba-calc__label">{{ o.label }}</span><span class="ba-calc__value">{{ o.value }}</span>
            </div>
            <p v-if="calcResult?.missingQuality" class="warn ba-calc__note"><TIcon name="info-circle" />Chưa đánh giá chất lượng → chưa tính Điểm thực nhận.</p>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { fmtNum } from '@mds/utils/number.js'
import { ref, reactive, computed, watch } from 'vue'
import AppShell     from '../components/AppShell.vue'
import TIcon        from '@mds/components/TIcon.vue'
import AppTag       from '@mds/components/AppTag.vue'
import AppInput     from '@mds/components/AppInput.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import AppCombobox  from '@mds/components/AppCombobox.vue'
import { db, isAdmin, saveConfig, myDeptAdmin } from '../store/db.js'
import {
  BA_FLOW, BA_QUALITY_LEVELS, BA_UNRATED, BA_POINT_RULES, BA_PRINCIPLES, 
  DEFAULT_BA_CONFIG, baConfigOf, baWorkItemScore,
} from '../store/baScoring.js'

const admin = computed(() => isAdmin() || myDeptAdmin() === 'BA')   // Quản trị hệ thống / Quản trị BA sửa hệ số BA
const ro = computed(() => (admin.value ? 'default' : 'readonly'))
const clone = o => JSON.parse(JSON.stringify(o))
const n = v => (v == null ? '—' : fmtNum(v, { decimals: 2 }))

// Hệ số BA lưu ở cấu hình chung (config.ba) — sửa bản nháp, bấm Lưu mới ghi
const cfg = ref(clone(baConfigOf(db.config)))
watch(() => db.config, v => { cfg.value = clone(baConfigOf(v)) })
const c = computed(() => cfg.value)
const dirty = computed(() => JSON.stringify(cfg.value) !== JSON.stringify(baConfigOf(db.config)))
const weightSum = computed(() => ['point', 'progress', 'quality'].reduce((a, k) => a + (Number(cfg.value.weights[k]) || 0), 0))
function save() { saveConfig({ ...db.config, ba: clone(cfg.value) }) }
function restoreDefault() { cfg.value = clone(DEFAULT_BA_CONFIG) }

// Bấm số trong Công thức → cuộn tới mục + nháy viền
function goSec(i) {
  const el = document.getElementById(`ba-muc-${i}`)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  el.classList.remove('sec-card--flash'); void el.offsetWidth; el.classList.add('sec-card--flash')
}

/* Ví dụ trong template (tính lại theo hệ số đang cấu hình) */
const EXAMPLES = [
  { title: 'Làm rõ YCPT (3 mã, độ phức tạp trung bình)', point: 10, deadline: '01/08', done: '01/08', onTime: true,  quality: 'Dùng ngay, cần bổ sung' },
  { title: 'Chốt giải pháp phân quyền chi tiết qua họp CCB', point: 5, deadline: '01/08', done: '05/08 (trễ)', onTime: false, quality: 'Sửa đáng kể / nhiều lần' },
  { title: 'Hoàn thành concept Giao việc không theo dự án', point: 10, deadline: '01/08', done: '01/08', onTime: true,  quality: 'Gần như đạt ngay lần đầu' },
]
const examples = computed(() => EXAMPLES.map(e => ({ ...e, s: baWorkItemScore({ point: e.point, done: true, onTime: e.onTime, quality: e.quality }, cfg.value) })))
const exampleTotal = computed(() => examples.value.reduce((a, e) => a + (e.s.actual ?? 0), 0))

/* Tính thử (không lưu) */
const PROGRESS_OPTIONS = [
  { value: 'ontime', label: 'Đúng hạn' },
  { value: 'exempt', label: 'Trễ — được miễn trừ' },
  { value: 'late',   label: 'Trễ — không miễn trừ' },
]
const qualityOptions = computed(() => [...BA_QUALITY_LEVELS.map(q => ({ value: q.value, label: `${n(c.value.quality[q.value])}% — ${q.value}` })), { value: BA_UNRATED, label: BA_UNRATED }])
const calc = reactive({ point: 10, progress: 'ontime', quality: 'Dùng ngay, cần bổ sung' })
const calcResult = computed(() => baWorkItemScore({ point: calc.point, done: true, onTime: calc.progress !== 'late', quality: calc.quality }, cfg.value))
const calcOut = computed(() => {
  const r = calcResult.value
  return [
    { label: 'Hệ số tiến độ', value: r ? `${r.progressRate}%` : '—' },
    { label: 'Point tiến độ', value: n(r?.progressPoint) },
    { label: 'Hệ số chất lượng', value: r?.qualityRate != null ? `${r.qualityRate}%` : '—' },
    { label: 'Point chất lượng', value: n(r?.qualityPoint) },
    { label: 'Điểm thực nhận', value: n(r?.actual), main: true },
  ]
})
</script>

<style scoped src="../styles/rulePage.css"></style>

<style scoped>
.pdp-flow--7 { grid-template-columns: repeat(7, minmax(0, 1fr)); }
.pdp-flow--7::before { left: calc(100% / 14); right: calc(100% / 14);
  background: linear-gradient(90deg, var(--chart-c1), var(--chart-c5), var(--chart-c6), #ee46bc, var(--chart-c2), var(--chart-c3), var(--bg-brand)); }
@media (max-width: 1100px) { .pdp-flow--7 { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.rule-row__list strong, .rule-text strong { font-weight: var(--fw-semibold); }
.ba-weight { max-width: 280px; grid-template-columns: minmax(0, 1fr); }
.ba-sum { margin-top: calc(var(--card-col-gap) * -0.5); }
.ba-q-row { grid-template-columns: 280px minmax(0, 1fr); }
.ba-q-row .coef-key { max-width: 280px; }
.ba-q-row .coef-key > :last-child { width: 160px; }
/* Bảng ví dụ */
.ba-table-wrap { overflow-x: auto; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); }
.ba-table { width: 100%; border-collapse: collapse; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.ba-table th, .ba-table td { padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--stroke-divider); white-space: nowrap; }
.ba-table td:first-child { white-space: normal; min-width: 220px; }
.ba-table th { background: var(--bg-neutral-light); font-weight: var(--fw-semibold); color: var(--text-secondary); font-size: var(--text-body); }
.ba-table .num { text-align: right; }
.ba-table tbody tr:last-child td { border-bottom: none; }
.ba-table tfoot td { border-top: 1px solid var(--stroke-neutral-light); border-bottom: none; background: var(--bg-brand-light); font-weight: var(--fw-semibold); }
.ba-table strong { font-weight: var(--fw-semibold); }
/* Tính thử */
.ba-calc { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 24px; align-items: start; }
.ba-calc .span-2 { grid-column: 1 / -1; }
.ba-calc__icon { font-size: 20px; color: var(--icon-brand); }
.ba-calc__out { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; padding: 12px; border-radius: var(--radius-default); background: var(--bg-neutral-light); }
.ba-calc__item { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border-radius: var(--radius-default); background: var(--bg-white); }
.ba-calc__item--main { grid-column: 1 / -1; background: var(--bg-brand-light); }
.ba-calc__label { font-size: var(--text-body); color: var(--text-secondary); }
.ba-calc__value { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.ba-calc__note { grid-column: 1 / -1; }
@media (max-width: 1100px) { .ba-calc { grid-template-columns: minmax(0, 1fr); } }
</style>
