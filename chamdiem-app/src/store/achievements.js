import { isPdRole } from './scoring.js'
/* ═══ THÀNH TỰU (huy hiệu) — tính từ dữ liệu thật của từng người, 3 cấp Đồng / Bạc / Vàng ═══
   Máy chủ tính (đủ mọi công việc, kể cả tháng cũ chưa nén) → trang Tổng quan hiển thị + chúc mừng khi lên cấp.
   group: 'pd' | 'ba' | 'all' — chỉ hiện nhóm liên quan tới người đó (có việc PD / BA, hoặc vai trò PD / BA). */
import { hasDesign, hasAnalysis, expectedScore } from './scoring.js'
import { baOnTime } from './baScoring.js'

export const LEVELS = [
  { id: 1, label: 'Đồng', color: '#c27c3e' },
  { id: 2, label: 'Bạc',  color: '#8a94a6' },
  { id: 3, label: 'Vàng', color: '#e0a100' },
]

export const BADGES = [
  { id: 'pd-done',      group: 'pd',  icon: 'pencil',          title: 'Nhà thiết kế chăm chỉ', unit: 'việc thiết kế hoàn thành',          goals: [10, 50, 150] },
  { id: 'pd-loved',     group: 'pd',  icon: 'heart',           title: 'Được yêu thích',         unit: 'lần được đánh giá Rất hài lòng',     goals: [3, 10, 30] },
  { id: 'pd-ontime',    group: 'pd',  icon: 'clock',           title: 'Đúng hẹn',               unit: 'việc thiết kế đúng hạn liên tiếp (chuỗi dài nhất)', goals: [5, 10, 20] },
  { id: 'pd-solution',  group: 'pd',  icon: 'bulb',            title: 'Người đưa giải pháp',    unit: 'việc do PD đưa giải pháp',           goals: [3, 10, 30] },
  { id: 'pd-team',      group: 'pd',  icon: 'users',           title: 'Đồng đội',               unit: 'dự án khác đã hỗ trợ',               goals: [1, 3, 5] },
  { id: 'pd-beyond',    group: 'pd',  icon: 'trophy',          title: 'Vượt kỳ vọng',           unit: 'tháng đạt từ 100% kỳ vọng (đã chốt)', goals: [1, 3, 6] },
  { id: 'ba-done',      group: 'ba',  icon: 'clipboard-check', title: 'Phân tích vững',         unit: 'việc phân tích hoàn thành',          goals: [10, 50, 150] },
  { id: 'ba-first',     group: 'ba',  icon: 'star',            title: 'Chuẩn ngay lần đầu',     unit: 'việc “Gần như đạt ngay lần đầu”',    goals: [3, 10, 30] },
  { id: 'ba-ontime',    group: 'ba',  icon: 'clock',           title: 'BA đúng hạn',            unit: 'việc phân tích đúng hạn',            goals: [5, 20, 50] },
  { id: 'loyal',        group: 'all', icon: 'calendar',        title: 'Gắn bó',                 unit: 'tháng có việc hoàn thành',           goals: [3, 6, 12] },
]

/** Chuỗi dài nhất các phần tử liên tiếp thỏa ok() */
const longestStreak = (list, ok) => { let best = 0, cur = 0; for (const x of list) { cur = ok(x) ? cur + 1 : 0; best = Math.max(best, cur) } return best }

/** Số liệu từng huy hiệu của 1 người: tasks = mọi công việc, closings = bản chốt PD */
export function achievementCounts(userId, tasks, closings) {
  const pd = tasks.filter(t => t.pdId === userId && hasDesign(t) && t.completedDate).sort((a, b) => a.completedDate.localeCompare(b.completedDate))
  const ba = tasks.filter(t => t.baId === userId && hasAnalysis(t) && t.baCompletedDate)
  const months = new Set([...pd.map(t => t.completedDate.slice(0, 7)), ...ba.map(t => t.baCompletedDate.slice(0, 7))])
  const beyond = closings.filter(c => c.pdId === userId).filter(c => {
    const person = c.params?.person ?? c.params?.people?.[userId], days = c.params?.workingDays
    const exp = person && days ? expectedScore(person, days) : 0
    const score = (c.items ?? []).reduce((a, i) => a + (Number(i.final) || 0), 0)
    return exp > 0 && score >= exp
  }).length
  return {
    'pd-done': pd.length,
    'pd-loved': pd.filter(t => t.qualityRating === 'Rất hài lòng').length,
    'pd-ontime': longestStreak(pd.filter(t => t.expectedDate), t => t.completedDate <= t.expectedDate),
    'pd-solution': pd.filter(t => t.solutionBy === 'PD').length,
    'pd-team': new Set(pd.filter(t => t.isOwnProject === 'Không').map(t => t.projectId)).size,
    'pd-beyond': beyond,
    'ba-done': ba.length,
    'ba-first': ba.filter(t => t.baQuality === 'Gần như đạt ngay lần đầu').length,
    'ba-ontime': ba.filter(t => baOnTime({ deadline: t.baDeadline, completedDate: t.baCompletedDate, exempt: t.baExempt })).length,
    loyal: months.size,
    _hasPd: pd.length > 0, _hasBa: ba.length > 0,
  }
}

/** Danh sách huy hiệu kèm cấp đạt được + tiến độ tới cấp sau */
export function achievementsOf(user, tasks, closings) {
  const c = achievementCounts(user.id, tasks, closings)
  const showPd = c._hasPd || isPdRole(user.role), showBa = c._hasBa || user.role === 'BA'
  return BADGES.filter(b => b.group === 'all' || (b.group === 'pd' && showPd) || (b.group === 'ba' && showBa)).map(b => {
    const n = c[b.id] ?? 0, level = b.goals.filter(g => n >= g).length
    return { id: b.id, icon: b.icon, title: b.title, unit: b.unit, n, level, next: b.goals[level] ?? null, goals: b.goals }
  })
}
