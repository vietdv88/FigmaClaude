import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as store from './store.js'
import { DEFAULT_CONFIG } from '../src/store/scoring.js'

/* ═══ Khởi tạo dữ liệu lần đầu (DB trống) — SEED=sample (mặc định) | empty | demo ═══
   demo: bản dùng thử (OPEN_DEMO) — dữ liệu GIẢ đã ẩn danh (seed-demo.json), mọi ngày dời theo tháng hiện tại để luôn có số liệu “tháng này”. */
const here = path.dirname(fileURLToPath(import.meta.url))

/** Dời 1 chuỗi ngày 'YYYY-MM-DD…' thêm n tháng (ngày cuối tháng tự co lại) */
function shiftMonths(s, n) {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1 + n, 1)), last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate()
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(Math.min(d, last)).padStart(2, '0')}${s.slice(10)}`
}
function seedDemo() {
  const d = JSON.parse(fs.readFileSync(path.join(here, '../src/store/seed-demo.json'), 'utf8'))
  const isDate = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)
  // Tháng có nhiều việc hoàn thành nhất → tháng hiện tại (Tổng quan / Tổng hợp điểm “tháng này” luôn có số liệu)
  const byMonth = {}
  for (const t of d.tasks) if (t.completedDate) byMonth[t.completedDate.slice(0, 7)] = (byMonth[t.completedDate.slice(0, 7)] ?? 0) + 1
  const busiest = Object.entries(byMonth).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
  const now = new Date(), n = busiest ? (now.getFullYear() - Number(busiest.slice(0, 4))) * 12 + (now.getMonth() + 1 - Number(busiest.slice(5, 7))) : 0
  const pad = x => String(x).padStart(2, '0')
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`, thisMonth = today.slice(0, 7)
  const monthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const shift = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, isDate(v) ? shiftMonths(v, n) : v]))
  // Ngày hoàn thành không được ở tương lai: trong tháng này mà sau hôm nay → co lại từ đầu tháng tới hôm nay; sang tháng sau → thành việc đang làm
  const fixDone = t => {
    for (const k of ['completedDate', 'baCompletedDate']) {
      const v = t[k]; if (!v || v <= today) continue
      if (v.slice(0, 7) === thisMonth) t[k] = `${thisMonth}-${pad(Math.max(1, Math.ceil(Number(v.slice(8, 10)) * now.getDate() / monthDays)))}`
      else { t[k] = ''; if (k === 'completedDate') { t.designStatus = 'Đang thực hiện'; t.qualityRating = '' } }
    }
    return t
  }
  // Ghim sẵn vài dự án yêu thích (Tổng quan có mục Dự án yêu thích ngay) — 3 dự án đầu có người đó tham gia (không có thì 3 dự án đầu)
  const favOf = u => { const mine = d.projects.filter(p => p.memberIds?.includes(u.id)).map(p => p.id); return (mine.length >= 2 ? mine : d.projects.map(p => p.id)).slice(0, 3) }
  d.users.forEach(u => store.put('users', { ...u, status: 'active', prefs: { ...(u.prefs ?? {}), favProjects: favOf(u) } }))
  d.projects.forEach(p => store.put('projects', p))
  d.iterations.forEach(i => store.put('iterations', shift(i)))
  d.tasks.forEach(t => store.put('tasks', { ...fixDone(shift(t)), createdAt: now.toISOString() }))
  Object.entries(d.monthSettings ?? {}).forEach(([month, v]) => store.put('months', { id: shiftMonths(month + '-01', n).slice(0, 7), ...v }))
}
export function seedIfEmpty() {
  if (!store.isEmpty()) return
  const mode = (process.env.SEED || 'sample').toLowerCase()
  store.tx(() => {
    store.setConfig(structuredClone(DEFAULT_CONFIG))
    if (mode === 'empty') return
    if (mode === 'demo') return seedDemo()
    const d = JSON.parse(fs.readFileSync(path.join(here, '../src/store/seed-real.json'), 'utf8'))
    // Người dùng mẫu chưa có Gmail → trạng thái "Chưa mời"; Quản trị sẽ nhập Gmail và gửi lời mời
    d.users.filter(u => u.role !== 'admin').forEach(u => store.put('users', { ...u, email: u.email || '', status: 'none' }))
    d.projects.forEach(p => store.put('projects', p))
    d.iterations.forEach(i => store.put('iterations', i))
    d.tasks.forEach(t => store.put('tasks', t))
    Object.entries(d.monthSettings ?? {}).forEach(([month, v]) => store.put('months', { id: month, ...v }))
  })
  console.log(`✓ Đã khởi tạo dữ liệu (${mode})`)
}
