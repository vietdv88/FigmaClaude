/* ═══ LỊCH SỬ — chỉ ghi SỰ KIỆN LỚN, gộp để đỡ tốn dung lượng (dùng chung máy chủ + trình duyệt + dọn dữ liệu cũ) ═══
   Ghi: AI TẠO / nhập việc · AI SỬA THÔNG TIN CHÍNH (đổi tên, PD / BA thực hiện, loại việc, ngày hoàn thành) · AI ĐỔI ĐIỂM (giữ điểm cũ → mới).
   KHÔNG ghi từng ô nhỏ; chữ dài (tên việc, lý do đánh giá…) chỉ ghi "đã sửa", không lưu nội dung.
   • Cùng 1 người sửa liên tục 1 việc (lần sau cách lần trước ≤ 30 phút) → gộp vào 1 dòng: giữ giá trị TRƯỚC khi sửa + giá trị SAU CÙNG.
     Sửa qua lại mà không còn gì thay đổi → bỏ hẳn dòng đó.
   • Người khác sửa, hoặc cùng người nhưng cách > 30 phút → dòng mới.
   • Mỗi việc giữ tối đa 20 dòng gần nhất (luôn giữ dòng tạo / nhập đầu tiên). */
export const HISTORY_MERGE_MS = 30 * 60e3
export const HISTORY_MAX_PER_TASK = 20
const SCORE_FIELDS = new Set(['score', 'finalScore', 'baScore'])
/** Trường thông tin CHÍNH được ghi khi sửa (không đổi điểm cũng ghi). Trường chữ dài chỉ lưu dấu “đã sửa” (không có from / to) */
export const MAJOR_FIELDS = new Set(['content', 'pdId', 'baId', 'stage', 'completedDate'])
export const MARK_ONLY_FIELDS = new Set(['content', 'ratingReason', 'solutionBrief', 'concept'])
const same = (a, b) => String(a ?? '') === String(b ?? '')

/** Gộp lượt sửa mới (entry) vào dòng trước (prev) → { merged } · { drop: true } (gộp xong điểm không đổi) · null (không gộp, ghi dòng mới) */
export function mergeHistoryEntry(prev, entry) {
  if (!prev || !entry || prev.taskId !== entry.taskId || prev.userId !== entry.userId) return null
  if (prev.action !== 'update' || entry.action !== 'update') return null
  if (Date.parse(entry.at) - Date.parse(prev.at) > HISTORY_MERGE_MS) return null
  const byField = new Map((prev.changes ?? []).map(c => [c.field, { ...c }]))
  for (const c of entry.changes ?? []) { const o = byField.get(c.field); if (o) { if ('to' in c) o.to = c.to } else byField.set(c.field, { ...c }) }
  let changes = [...byField.values()].filter(c => !('from' in c || 'to' in c) || !same(c.from, c.to))   // dấu “đã sửa” (không from / to) luôn giữ
  const hasScore = changes.some(c => SCORE_FIELDS.has(c.field))
  changes = changes.filter(c => SCORE_FIELDS.has(c.field) || MAJOR_FIELDS.has(c.field) || hasScore)   // trường phụ chỉ giữ khi còn đổi điểm (để giải thích)
  if (!changes.length) return { drop: true }
  return { merged: { ...prev, at: entry.at, taskContent: entry.taskContent ?? prev.taskContent, changes } }
}

/** Mã các dòng vượt quá 20 dòng / việc (bỏ cũ nhất, giữ dòng tạo / nhập đầu tiên) */
export function overflowIds(list) {
  const sorted = [...list].sort((a, b) => a.at.localeCompare(b.at))
  if (sorted.length <= HISTORY_MAX_PER_TASK) return []
  const pool = sorted[0].action !== 'update' ? sorted.slice(1) : sorted
  return pool.slice(0, sorted.length - HISTORY_MAX_PER_TASK).map(h => h.id)
}

/** Gộp lại toàn bộ lịch sử 1 việc theo quy tắc trên (dọn dữ liệu cũ) → danh sách giữ lại */
export function compactHistory(list) {
  const out = []
  for (const e of [...list].sort((a, b) => a.at.localeCompare(b.at))) {
    const r = mergeHistoryEntry(out.at(-1), e)
    if (r?.merged) out[out.length - 1] = r.merged
    else if (r?.drop) out.pop()
    else out.push(e)
  }
  const extra = new Set(overflowIds(out))
  return out.filter(h => !extra.has(h.id))
}
