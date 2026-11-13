import * as store from './store.js'
import { hasAnalysis, hasDesign } from '../src/store/scoring.js'

/* ═══════════════════════════════════════════════════════════════════════════
   NÉN DỮ LIỆU CŨ — giữ kho chính nhẹ (tải nhanh), KHÔNG xóa mất dữ liệu.
   Công việc (+ lịch sử, vòng lặp đã hết việc) được chuyển sang bảng lưu trữ nén (gzip) trong cùng DB, chia theo năm × dự án:
     • cũ hơn ARCHIVE_AFTER_MONTHS tháng (mặc định 12), thuộc năm trước, VÀ tháng đó đã chốt điểm (PD / BA tương ứng) — điểm vẫn còn trong bản chốt;
     • hoặc cũ hơn ARCHIVE_FORCE_MONTHS tháng (mặc định 24) dù chưa chốt.
   Bản chốt điểm, thông số tháng, dự án, người dùng giữ nguyên. Quản trị xem / tải về / khôi phục ở Cài đặt → Dữ liệu lưu trữ.
   Chạy lúc khởi động + mỗi ngày. ARCHIVE_AFTER_MONTHS=0 → không nén.
   ═══════════════════════════════════════════════════════════════════════════ */

const AFTER = Number(process.env.ARCHIVE_AFTER_MONTHS ?? 12)
const FORCE = Number(process.env.ARCHIVE_FORCE_MONTHS ?? process.env.RETENTION_MONTHS ?? 24)

/** Đầu tháng của (tháng hiện tại − months + 1) → giữ đủ `months` tháng gần nhất */
export function cutoffDate(now = new Date(), months = AFTER) {
  const d = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

const ym = d => String(d || '').slice(0, 7)
const closedPd = (m, pdId) => !!store.get('closings', `${m}:${pdId}`) || !!store.get('closings', m)
const closedBa = (m, baId) => !!store.get('baClosings', `${m}:${baId}`)

/** Ngày đại diện: ngày hoàn thành muộn nhất (PD / BA) → ngày kết thúc vòng lặp → ngày tạo */
function dateOf(t, iterations) {
  const done = [t.completedDate, t.baCompletedDate].filter(Boolean).sort().pop()
  return done || iterations.get(t.iterationId)?.endDate || String(t.createdAt || '').slice(0, 10)
}
/** Mọi phần có ngày hoàn thành đều đã chốt điểm */
function fullyClosed(t) {
  // Phần có ngày hoàn thành phải có người thực hiện VÀ người đó đã chốt tháng đó (chưa gán người → coi như chưa chốt, chờ quá hạn bắt buộc)
  if (hasDesign(t) && t.completedDate && !(t.pdId && closedPd(ym(t.completedDate), t.pdId))) return false
  if (hasAnalysis(t) && t.baCompletedDate && !(t.baId && closedBa(ym(t.baCompletedDate), t.baId))) return false
  return !!(t.completedDate || t.baCompletedDate)
}

export function archiveOld(now = new Date()) {
  if (!(AFTER > 0)) return null
  const soft = [cutoffDate(now, AFTER), `${now.getFullYear()}-01-01`].sort()[0]   // chỉ năm trước trở về trước
  const hard = FORCE > 0 ? cutoffDate(now, FORCE) : ''
  const iterations = new Map(store.all('iterations').map(i => [i.id, i]))
  const old = store.all('tasks').filter(t => {
    const d = dateOf(t, iterations)
    return d && ((hard && d < hard) || (d < soft && fullyClosed(t)))
  })
  const oldIds = new Set(old.map(t => t.id))
  const keptIters = new Set(store.all('tasks').filter(t => !oldIds.has(t.id)).map(t => t.iterationId))
  const oldIters = store.all('iterations').filter(i => i.endDate && i.endDate < soft && !keptIters.has(i.id))
  if (!old.length && !oldIters.length) return { tasks: 0, iterations: 0, history: 0 }

  // Gom theo năm × dự án; lịch sử của các việc này đi kèm
  const history = old.length ? store.all('history').filter(h => oldIds.has(h.taskId)) : []
  const chunks = new Map()
  const chunk = (year, pid) => { const k = `${year}:${pid || '-'}`; if (!chunks.has(k)) chunks.set(k, { year, projectId: pid || '', tasks: [], history: [], iterations: [] }); return chunks.get(k) }
  const yearOfTask = new Map()
  for (const t of old) { const y = dateOf(t, iterations).slice(0, 4); yearOfTask.set(t.id, y); chunk(y, t.projectId).tasks.push(t) }
  for (const h of history) chunk(yearOfTask.get(h.taskId), h.projectId).history.push(h)
  for (const i of oldIters) chunk(i.endDate.slice(0, 4), i.projectId).iterations.push(i)

  store.tx(() => {
    for (const [key, c] of chunks) {
      const prev = store.archiveGet(key)   // năm × dự án đã có lưu trữ → gộp thêm
      const merged = prev ? { ...c, tasks: [...prev.tasks, ...c.tasks], history: [...prev.history, ...c.history], iterations: [...prev.iterations, ...c.iterations] } : c
      store.archivePut(key, merged)
    }
    old.forEach(t => store.del('tasks', t.id))
    history.forEach(h => store.del('history', h.id))
    oldIters.forEach(i => store.del('iterations', i.id))
  })
  return { tasks: old.length, history: history.length, iterations: oldIters.length, chunks: chunks.size }
}

/** Khôi phục 1 phần lưu trữ (năm × dự án) về kho chính — bỏ qua bản ghi đã có */
export function restoreArchive(key) {
  const a = store.archiveGet(key)
  if (!a) return null
  store.tx(() => {
    for (const i of a.iterations) if (!store.get('iterations', i.id)) store.put('iterations', i)
    for (const t of a.tasks) if (!store.get('tasks', t.id)) store.put('tasks', t)
    for (const h of a.history) store.put('history', h)
    store.archiveDel(key)
  })
  return { tasks: a.tasks.length, history: a.history.length, iterations: a.iterations.length }
}

/** Chạy ngay + mỗi 24 giờ; onArchived(result) khi có dữ liệu được nén (để báo các máy đang mở) */
export function scheduleRetention(onArchived) {
  if (!(AFTER > 0)) { console.log('ℹ️  ARCHIVE_AFTER_MONTHS=0 — không nén dữ liệu cũ.'); return }
  const run = () => {
    try {
      const r = archiveOld()
      if (r?.tasks || r?.iterations) {
        console.log(`🗜️  Nén dữ liệu cũ: ${r.tasks} công việc, ${r.iterations} vòng lặp, ${r.history} lịch sử → ${r.chunks} phần lưu trữ`)
        if (r.tasks >= 1000) { const t = Date.now(); store.vacuum(); console.log(`🗜️  Thu gọn file DB (${Date.now() - t} ms)`) }   // trả lại dung lượng trống
        onArchived?.(r)
      }
    } catch (e) { console.error('Nén dữ liệu cũ lỗi:', e) }
  }
  run()
  setInterval(run, 24 * 3600e3).unref()
}
