/* Thống kê nhanh ở màn chi tiết 1 người (Tổng quan · Tổng hợp điểm) — PD và BA */
import { RATING_DISPLAY_ORDER, reasonMissing } from './scoring.js'
import { BA_QUALITY_LEVELS, BA_UNRATED } from './baScoring.js'
import { fmtNum } from '@mds/utils/number.js'

const r1 = n => fmtNum(Number(n) || 0)   // quy tắc số chung (TT200)
const RATING_TONE = { 'Rất hài lòng': 'success', 'Không hài lòng': 'danger', 'Chưa đánh giá': 'neutral', 'Hài lòng': 'brand' }

/** PD: tasks có score / final / qualityRating / mainScreens / subScreens */
export function pdTaskStats(tasks = []) {
  const n = tasks.length, sum = k => tasks.reduce((a, t) => a + (Number(t[k]) || 0), 0)
  const rate = {}; for (const t of tasks) { const k = t.qualityRating || 'Chưa đánh giá'; rate[k] = (rate[k] ?? 0) + 1 }
  const noReason = tasks.filter(t => reasonMissing(t)).length
  return [
    { label: 'Số việc', value: n },
    { label: 'Màn hình chính / phụ', value: `${sum('mainScreens')} / ${sum('subScreens')}` },
    { label: 'Điểm', value: r1(sum('score')) },
    { label: 'Điểm thực nhận', value: r1(sum('final')), tone: 'brand' },
    ...RATING_DISPLAY_ORDER.filter(k => rate[k]).map(k => ({ label: k, value: rate[k], tone: RATING_TONE[k] })),
    noReason ? { label: 'Thiếu lý do đánh giá', value: noReason, tone: 'warning', tip: 'Rất hài lòng / Không hài lòng nhưng chưa nhập lý do' } : null,
  ]
}

/** BA: items (baItemOf) có baPoint / progressRate / qualityRate / baQuality / actual */
export function baItemStats(items = [], cfg) {
  const done = items.filter(i => i.progressRate != null)
  const late = done.filter(i => i.progressRate === 0).length
  const q = {}; for (const i of items) { const k = i.baQuality || BA_UNRATED; q[k] = (q[k] ?? 0) + 1 }
  const missing = items.filter(i => i.actual == null).length
  return [
    { label: 'Số việc', value: items.length },
    { label: 'Tổng BA Point', value: r1(items.reduce((a, i) => a + (Number(i.baPoint) || 0), 0)) },
    { label: 'Đúng hạn', value: done.length - late, tone: 'success' },
    late ? { label: 'Trễ hạn', value: late, tone: 'danger' } : null,
    ...BA_QUALITY_LEVELS.filter(l => q[l.value]).map(l => ({ label: `${cfg?.quality?.[l.value] ?? ''}% ${l.value}`.trim(), value: q[l.value] })),
    q[BA_UNRATED] ? { label: BA_UNRATED, value: q[BA_UNRATED], tone: 'warning' } : null,
    missing ? { label: 'Thiếu dữ liệu chấm', value: missing, tone: 'warning' } : null,
    { label: 'Điểm thực nhận', value: r1(items.reduce((a, i) => a + (Number(i.actual) || 0), 0)), tone: 'brand' },
  ]
}
