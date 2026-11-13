import {
  DESIGN_STATUSES, DEFAULT_STATUS, DONE_STATUSES, COMPLEXITIES, COMPLEXITY_ALIASES, BUSINESS_VALUES, PLATFORMS, SOLUTION_ROLES, YES_NO,
  QUALITY_RATINGS, REASON_REQUIRED, DEFAULT_RATING, STAGES, hasAnalysis, hasDesign,
} from './scoring.js'
import { BA_QUALITY_LEVELS, BA_UNRATED, DEFAULT_BA_CONFIG } from './baScoring.js'

/* ═══════════════════════════════════════════════════════════════════════════
   LÕI NHẬP CÔNG VIỆC — thuần, dùng chung trình duyệt (taskImport.js) + máy chủ (đồng bộ Google Sheet).
   Không đụng tới kho dữ liệu: mọi thứ cần tra cứu đều nhận qua `ctx`:
     ctx.membersOf(projectId, role) → [user]       ctx.closedDateError(date, pdId) → '' | thông báo
     ctx.ownProjectFor(pdId, projectId) → 'Có'|'Không'   ctx.tasks → [task]   ctx.iterationName(id) → tên
   Nhập công việc từ Excel (.xlsx) / CSV.
   Cột được khớp theo TIÊU ĐỀ (không phân biệt hoa thường, dấu, dấu *), thứ tự cột tùy ý.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Tiêu đề cột của file nhập (khớp theo tên, thứ tự tùy ý) */
export const IMPORT_COLUMNS = [
  { field: 'pbi',           label: 'PBI',      headers: ['ID', 'Work Item ID', 'Mã PBI'] },
  { field: 'content',       label: 'Nội dung', required: true, headers: ['Title', 'Tiêu đề', 'Tên công việc'] },
  { field: 'pdId',          label: 'PD', required: true, kind: 'user', role: 'PD', headers: ['Assigned To', 'Người thực hiện', 'Mã nhân viên PD'] },   // điền mã nhân viên (ưu tiên), email hoặc họ tên
  { field: 'baId',          label: 'BA', kind: 'user', role: 'BA', headers: ['Mã nhân viên BA'] },
  // Giai đoạn Phân tích (BA) — trống Loại việc → mặc định Chỉ thiết kế (hoặc loại việc chọn chung khi nhập ảnh)
  { field: 'stage',           label: 'Loại việc', kind: 'stage', headers: ['Giai đoạn'] },
  { field: 'baPoint',         label: 'BA Point', kind: 'decimal', headers: ['Point BA'] },
  { field: 'baDeadline',      label: 'Deadline phân tích', kind: 'date', headers: ['Deadline BA'] },
  { field: 'baCompletedDate', label: 'Ngày hoàn thành (BA)', kind: 'date', headers: ['Ngày hoàn thành BA'] },
  { field: 'baQuality',       label: 'Chất lượng (BA)', kind: 'baQuality', headers: ['Kết quả chất lượng', 'Kết quả chất lượng BA'] },
  { field: 'expectedDate',  label: 'Deadline thiết kế', kind: 'date', headers: ['Thời hạn mong muốn', 'Thời hạn', 'Deadline'] },   // file mẫu cũ vẫn nhận
  { field: 'solutionBy',    label: 'Người đưa giải pháp', kind: 'enum', options: SOLUTION_ROLES, default: 'PD và BA' },
  { field: 'complexity',    label: 'Độ phức tạp thiết kế', kind: 'enum', options: COMPLEXITIES, aliases: COMPLEXITY_ALIASES, default: 'Trung bình', headers: ['Độ phức tạp nghiệp vụ', 'Độ phức tạp'] },
  { field: 'businessLevel', label: 'Hệ số nghiệp vụ', kind: 'enum', options: BUSINESS_VALUES, default: 'Bình thường' },
  { field: 'platform',      label: 'Nền tảng', kind: 'enum', options: PLATFORMS, default: 'Web' },
  { field: 'concept',       label: 'Concept' },
  { field: 'isOwnProject',  label: 'Là dự án phụ trách', kind: 'enum', options: YES_NO, default: '' },
  { field: 'designStatus',  label: 'Trạng thái thiết kế', kind: 'enum', options: DESIGN_STATUSES.map(s => s.value), aliases: { '--': DEFAULT_STATUS }, default: DEFAULT_STATUS },
  { field: 'designLink',    label: 'Link thiết kế' },
  { field: 'devmodeLink',   label: 'Link devmode' },
  { field: 'completedDate', label: 'Ngày hoàn thành', kind: 'date' },
  { field: 'mainScreens',   label: 'Số lượng màn hình chính', kind: 'number' },
  { field: 'subScreens',    label: 'Số lượng màn hình phụ', kind: 'number' },
  { field: 'qualityRating', label: 'Đánh giá chất lượng thiết kế và phối hợp của PD', kind: 'enum', options: QUALITY_RATINGS.map(r => r.value), default: DEFAULT_RATING },
  { field: 'ratingReason',  label: 'Lý do đánh giá', prefix: true },
  { field: 'manualScore',   label: 'Điểm nhập tay', kind: 'decimal' },
]

export const norm = s => String(s ?? '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd')
  .replace(/\*/g, '').replace(/\s+/g, ' ').trim().toLowerCase()

/** Sheet có dòng tiêu đề chứa cột "Nội dung" (để chọn mặc định) */
export const looksLikeTaskSheet = rows => (rows.find(r => r.some(c => String(c ?? '').trim())) ?? []).some(c => norm(c) === norm('Nội dung'))

export function parseCsv(text) {
  text = text.replace(/^﻿/, '')
  const firstLine = text.split(/\r?\n/, 1)[0]
  const sep = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ','
  const rows = []
  let row = [], cell = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === sep) { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += ch
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows
}

/* ── Chuyển giá trị ô ── */
const pad = n => String(n).padStart(2, '0')
export function toIsoDate(v) {
  if (v === '' || v == null) return ''
  if (v instanceof Date && !isNaN(v)) return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`
  if (typeof v === 'number') {               // số serial ngày của Excel
    const d = new Date(Math.round((v - 25569) * 86400000))
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
  }
  const s = String(v).trim()
  let m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (m) return valid(+m[3], +m[2], +m[1])
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return valid(+m[1], +m[2], +m[3])
  return null
}
function valid(y, mo, d) {
  const dt = new Date(y, mo - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d ? `${y}-${pad(mo)}-${pad(d)}` : null
}

/** Dòng tiêu đề → { field: chỉ số cột }. Khớp đúng tên cột; cột "prefix" (VD "Lý do đánh giá (Bắt buộc điền với: …)") khớp theo phần đầu */
export function mapColumns(headerRow) {
  const header = headerRow.map(norm)
  const colIndex = {}
  IMPORT_COLUMNS.forEach(c => {
    const keys = [c.label, ...(c.headers ?? [])].map(norm)
    const i = header.findIndex(h => keys.includes(h) || (c.prefix && h.startsWith(keys[0])))
    if (i >= 0) colIndex[c.field] = i
  })
  return colIndex
}
/** Các giá trị (khác rỗng, không trùng) của 1 cột trong dữ liệu thô — VD mã nhân viên ở cột PD / BA */
export function columnValues(rawRows, field) {
  const nonEmpty = rawRows.filter(r => r.some(c => String(c ?? '').trim() !== ''))
  if (!nonEmpty.length) return []
  const i = mapColumns(nonEmpty[0])[field]
  return i == null ? [] : [...new Set(nonEmpty.slice(1).map(r => String(r[i] ?? '').trim()).filter(Boolean))]
}

/**
 * Kiểm tra & chuyển các dòng đã đọc thành dữ liệu công việc.
 * Trả { missingColumns, rows: [{ rowNo, data, errors[], warnings[] }] }
 */
/** Trường BA nhận từ file / ảnh */
export const BA_IMPORT_FIELDS = ['baPoint', 'baDeadline', 'baCompletedDate', 'baQuality']
/** Chuỗi kết quả chất lượng → mức chuẩn: khớp theo chữ (bỏ “NN% -” ở đầu) hoặc theo % mặc định */
export function baQualityOf(raw) {
  const s = String(raw ?? '').trim()
  if (!s) return ''
  if (norm(s) === norm(BA_UNRATED)) return BA_UNRATED
  const text = s.replace(/^\s*\d+(?:[.,]\d+)?\s*%\s*[-–:]?\s*/, '')
  const byText = BA_QUALITY_LEVELS.find(q => norm(q.value) === norm(text) || (text && norm(q.value).startsWith(norm(text))))
  if (byText) return byText.value
  const pct = Number((s.match(/(\d+(?:[.,]\d+)?)\s*%/)?.[1] ?? '').replace(',', '.'))
  return Object.entries(DEFAULT_BA_CONFIG.quality).find(([, v]) => v === pct)?.[0] ?? null
}

export function validateRows(rawRows, projectId, { defaultPdId = '', defaultBaId = '', pdOptional = false, anyRole = false, defaultStage = '' } = {}, ctx) {
  const { membersOf, closedDateError, ownProjectFor } = ctx
  const nonEmpty = rawRows.filter(r => r.some(c => String(c ?? '').trim() !== ''))
  if (!nonEmpty.length) return { missingColumns: IMPORT_COLUMNS.filter(c => c.required).map(c => c.label), rows: [] }

  const colIndex = mapColumns(nonEmpty[0])
  // Có “PD cho dòng chưa có PD” → cột PD không bắt buộc
  const missingColumns = IMPORT_COLUMNS.filter(c => c.required && colIndex[c.field] == null && !(c.field === 'pdId' && (defaultPdId || pdOptional))).map(c => c.label)
  if (missingColumns.length) return { missingColumns, rows: [] }

  // anyRole (đồng bộ Google Sheet): cột PD / BA nhận MỌI thành viên dự án, không phân biệt bộ phận
  // Cột PD / BA nhận MỌI thành viên dự án (PO, Lead… kiêm PD / BA được), không phân biệt bộ phận
  const people = { PD: membersOf(projectId), BA: membersOf(projectId) }
  /* Không khớp thành viên → nói rõ lý do: mã chưa có trong hệ thống / sai bộ phận / đã khóa / chưa thuộc dự án */
  const ROLE_NAMES = { admin: 'Quản trị hệ thống', HRBP: 'HRBP', QA: 'QA', PO: 'PO', PDL: 'PD Lead', BA: 'BA', PD: 'PD' }
  const whyNotUser = (c, v) => {
    const qs = [String(v), String(v).replace(/<[^>]*>/g, '').trim()].map(norm)
    const u = (ctx.allUsers ?? []).find(x => x.code && qs.includes(norm(x.code)))
      ?? (ctx.allUsers ?? []).find(x => qs.some(q => norm(x.email) === q || norm(x.companyEmail) === q || norm(x.name) === q))
    if (!u) return `${c.label} “${v}”: mã nhân viên chưa có trong hệ thống — thêm người dùng có mã này trước`
    if (u.status === 'disabled') return `${c.label} “${v}” là ${u.name} — tài khoản đã bị khóa`
    return `${c.label} “${v}” là ${u.name} — chưa là thành viên dự án (thêm vào dự án trước)`
  }
  const findUser = (role, v) => {
    const raw = String(v)
    const acc = raw.match(/\\([^\\>\s]+)\s*>?\s*$/)?.[1]          // "Tên <MISA\\pqhuy6>" → pqhuy6
    const name = raw.replace(/<[^>]*>/g, '').trim()
    const qs = [raw, name, acc].filter(Boolean).map(norm)
    // Ưu tiên MÃ NHÂN VIÊN (duy nhất) → email → họ tên (có thể trùng tên)
    return people[role].find(u => u.code && qs.includes(norm(u.code)))
      ?? people[role].find(u => qs.some(q => norm(u.email) === q || norm(u.companyEmail) === q))
      ?? people[role].find(u => qs.some(q => norm(u.name) === q))
      ?? byPrefix(role, name)
  }
  // Tên bị cắt trên ảnh chụp TFS (cột hẹp): "SEN TRUO..." → khớp phần đầu họ tên / mã / email nếu CHỈ 1 người khớp
  const byPrefix = (role, name) => {
    const m = String(name).match(/^(.{3,}?)\s*(?:\.{2,}|…)$/)
    if (!m) return undefined
    const p = norm(m[1])
    const hits = people[role].filter(u => [u.name, u.code, u.email, u.companyEmail].some(x => x && norm(x).startsWith(p)))
    return hits.length === 1 ? hits[0] : undefined
  }

  // Bỏ qua dòng không có Nội dung (trang tính kéo sẵn công thức tới cuối trang)
  const contentIdx = colIndex.content
  const rows = nonEmpty.slice(1).map((cells, idx) => ({ cells, rowNo: rawRows.indexOf(cells) + 1 }))
    .filter(({ cells }) => String(cells[contentIdx] ?? '').trim() !== '')
    .map(({ cells, rowNo }) => {
    const errors = [], warnings = [], notes = []   // notes: thông tin, không ảnh hưởng kết quả
    const data = {}
    const filled = {}                              // ô nào trên file có giá trị (đồng bộ: ô trống không xóa dữ liệu đang có)
    let assigneeBa = null
    for (const c of IMPORT_COLUMNS) {
      const raw = colIndex[c.field] != null ? cells[colIndex[c.field]] : ''
      const str = raw instanceof Date ? raw : String(raw ?? '').trim()
      const empty = str === ''
      filled[c.field] = !empty
      if (c.field === 'pdId' && empty && defaultPdId) { data.pdId = defaultPdId; continue }   // PD mặc định cho dòng chưa có PD
      if (c.field === 'baId' && empty && defaultBaId) { data.baId = defaultBaId; continue }   // BA mặc định cho dòng chưa có BA
      if (c.field === 'pdId' && empty && pdOptional) { data.pdId = ''; continue }   // ảnh chụp: chưa giao PD là bình thường
      if (c.required && empty) { errors.push(`Thiếu ${c.label}`); data[c.field] = ''; continue }

      switch (c.kind) {
        case 'user': {
          if (empty) { data[c.field] = ''; break }
          const u = findUser(c.role, str)
          if (u) data[c.field] = u.id
          else if (c.field === 'pdId' && (pdOptional || defaultPdId)) {
            // Người được giao trên TFS không phải PD của dự án (BA, dev…) → không lỗi: dùng PD gán sẵn / để trống
            assigneeBa = findUser('BA', str)
            data.pdId = defaultPdId
            if (!assigneeBa) notes.push(`Người được giao “${str}” không phải PD của dự án — ${defaultPdId ? 'dùng PD đã gán' : 'chưa giao PD'}`)
          }
          else if (c.field === 'baId' && defaultBaId) {
            // BA trên ảnh / file không khớp ai (tên bị cắt, người ngoài dự án…) → dùng BA gán chung (BA tự nhập: chính mình)
            data.baId = defaultBaId
            notes.push(`BA “${str}” không khớp thành viên dự án — dùng BA đã gán`)
          }
          else if (c.required) errors.push(whyNotUser(c, str))
          else { warnings.push(`${whyNotUser(c, str)} — bỏ qua`); data[c.field] = '' }
          break
        }
        case 'stage': {   // nhận tên (Chỉ phân tích…), tên ngắn (BA / BA → PD / PD) hoặc mã (analysis / both / design)
          if (empty) { data.stage = defaultStage; break }
          const st = STAGES.find(x => [x.label, x.short, x.value, x.short.replace('→', '->')].some(k => norm(k) === norm(str)))
          if (st) data.stage = st.value
          else { errors.push(`Loại việc “${str}” không hợp lệ (${STAGES.map(x => x.label).join(' / ')})`); data.stage = defaultStage }
          break
        }
        case 'baQuality': {   // “100% - Gần như đạt ngay lần đầu” · “Gần như đạt…” · “80%” → đúng mức; trống → để trống
          if (empty) { data.baQuality = ''; break }
          const q = baQualityOf(str)
          if (q) data.baQuality = q
          else { errors.push(`Chất lượng (BA) “${str}” không hợp lệ (${BA_QUALITY_LEVELS.map(x => x.value).join(' / ')})`); data.baQuality = '' }
          break
        }
        case 'enum': {
          if (empty) { data[c.field] = c.default; break }
          const alias = Object.entries(c.aliases ?? {}).find(([k]) => norm(k) === norm(str))?.[1]
          const opt = alias ?? c.options.find(o => norm(o) === norm(str))
          if (opt) data[c.field] = opt
          else { errors.push(`${c.label} “${str}” không hợp lệ (${c.options.join(' / ')})`); data[c.field] = c.default }
          break
        }
        case 'date': {
          const iso = toIsoDate(raw)
          if (iso === null) { errors.push(`${c.label} “${str}” sai định dạng (dd/mm/yyyy)`); data[c.field] = '' }
          else data[c.field] = iso
          break
        }
        case 'decimal': {
          const n = Number(String(str).replace(',', '.'))
          if (empty) data[c.field] = ''
          else if (!Number.isFinite(n) || n < 0) { errors.push(`${c.label} “${str}” phải là số ≥ 0`); data[c.field] = '' }
          else data[c.field] = n
          break
        }
        case 'number': {
          if (empty) { data[c.field] = 0; break }
          const n = Number(String(str).replace(',', '.'))
          if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) { errors.push(`${c.label} “${str}” phải là số nguyên ≥ 0`); data[c.field] = 0 }
          else data[c.field] = n
          break
        }
        default:
          data[c.field] = String(str)
      }
    }
    if (assigneeBa) {
      if (!data.baId || data.baId === defaultBaId) data.baId = assigneeBa.id   // BA trên TFS ưu tiên hơn BA gán chung
      notes.push(`Người được giao “${assigneeBa.name}” là BA${data.baId === assigneeBa.id ? ' — đưa vào cột BA' : ''}`)
    }
    // Chỉ khi biết Loại việc (có cột / chọn chung) — đồng bộ Sheet không có cột Loại việc thì giữ loại việc trong app
    const stageKnown = filled.stage || !!defaultStage
    // Có số liệu BA nhưng loại việc không có phần phân tích → không lưu, nhắc chọn lại Loại việc
    if (stageKnown && !hasAnalysis(data) && BA_IMPORT_FIELDS.some(f => data[f] !== '' && data[f] != null)) {
      warnings.push('Có số liệu BA (Point / deadline / ngày hoàn thành / chất lượng) nhưng Loại việc là “Chỉ thiết kế” — số liệu BA bị bỏ qua')
      for (const f of BA_IMPORT_FIELDS) { data[f] = ''; filled[f] = false }
    }
    if (stageKnown && !hasDesign(data) && data.designStatus === DEFAULT_STATUS && !filled.designStatus) data.designStatus = ''   // chỉ phân tích: không có trạng thái thiết kế
    // Thiếu cột / ô trống (deadline, chất lượng…) → để trống, người dùng cập nhật sau — không cảnh báo
    if (data.completedDate && closedDateError(data.completedDate, data.pdId)) errors.push(closedDateError(data.completedDate, data.pdId))
    if (!data.isOwnProject) data.isOwnProject = data.pdId ? ownProjectFor(data.pdId, projectId) : 'Có'
    if (REASON_REQUIRED.includes(data.qualityRating) && !data.ratingReason) warnings.push(`Đánh giá “${data.qualityRating}” nhưng chưa có lý do`)
    if (DONE_STATUSES.includes(data.designStatus) && !data.completedDate) warnings.push('Đã thiết kế nhưng chưa có Ngày hoàn thành — chưa được tính điểm')
    // Mới giao việc thì chưa có số màn hình là bình thường — chỉ nhắc khi đã thiết kế xong
    if (DONE_STATUSES.includes(data.designStatus) && !data.mainScreens && !data.subScreens) warnings.push('Đã thiết kế nhưng chưa có số lượng màn hình — điểm = 0')
    return { rowNo, data, errors, warnings, notes, filled }
  })
  markDuplicatePbis(rows, projectId, r => r.data.pbi, ctx)
  return { missingColumns: [], rows }
}

/* ═══ DÁN TỪ TFS — các dòng copy từ lưới TFS (cột cách nhau bằng Tab) ═══
   Có dòng tiêu đề (ID / Title / Assigned To… hoặc tên cột file mẫu) → khớp theo tên.
   Không có tiêu đề → đoán: cột toàn số = PBI, cột chữ dài nhất = Nội dung. */
const KNOWN_HEADERS = new Set(IMPORT_COLUMNS.flatMap(c => [c.label, ...(c.headers ?? [])]).map(norm))
/** Cảnh báo trùng mã PBI khi nhập: trùng công việc đã có trong dự án (kể cả việc thêm tay) / trùng dòng khác trong dữ liệu nhập.
    items: [{ rowNo, warnings[] }], pbiOf(item) → mã PBI — ghi thêm cảnh báo + cờ dupPbi vào từng item; trả số dòng trùng */
export function markDuplicatePbis(items, projectId, pbiOf = it => it.pbi, ctx) {
  const key = v => String(v ?? '').trim()
  const existing = new Map()
  for (const t of ctx.tasks) if (t.projectId === projectId && key(t.pbi) && !existing.has(key(t.pbi))) existing.set(key(t.pbi), t)
  const seen = new Map()
  let count = 0
  for (const it of items) {
    const k = key(pbiOf(it))
    if (!k) continue
    const t = existing.get(k)
    if (t) {
      const name = String(t.content ?? '').trim()
      it.warnings.push(`PBI ${k} đã có trong dự án (${ctx.iterationName(t.iterationId) || 'vòng lặp khác'}: “${name.length > 40 ? name.slice(0, 40) + '…' : name}”) — nhập sẽ tạo bản trùng`)
    }
    if (seen.has(k)) it.warnings.push(`PBI ${k} trùng với dòng ${seen.get(k)} trong dữ liệu nhập`)
    else seen.set(k, it.rowNo)
    if (t || seen.get(k) !== it.rowNo) { it.dupPbi = true; count++ }
  }
  return count
}

export function parsePastedTable(text) {
  const rows = String(text ?? '').replace(/\r/g, '').split('\n').filter(l => l.trim()).map(l => l.split('\t').map(c => c.trim()))
  if (!rows.length) return []
  if (rows[0].some(c => KNOWN_HEADERS.has(norm(c)))) return rows
  const width = Math.max(...rows.map(r => r.length))
  const header = Array(width).fill('')
  const isId = i => rows.filter(r => /^\d{3,8}$/.test(r[i] ?? '')).length >= rows.length * 0.6
  const idCol = [...Array(width).keys()].find(isId)
  if (idCol != null) header[idCol] = 'PBI'
  const avgLen = i => rows.reduce((a, r) => a + (r[i] ?? '').length, 0) / rows.length
  const textCol = [...Array(width).keys()].filter(i => i !== idCol).sort((a, b) => avgLen(b) - avgLen(a))[0]
  if (textCol != null) header[textCol] = 'Nội dung'
  return [header, ...rows]
}

/* ═══ TỪ ẢNH CHỤP — chữ OCR → dòng [PBI, Nội dung] ═══
   Mỗi dòng bắt đầu bằng mã số (4–8 chữ số) là 1 công việc; bỏ chữ loại công việc / trạng thái TFS ở đầu / cuối. */
// OCR hay đọc sai chữ (VD “Item” → “tem”, “lem”) → bỏ “Product Backlog” + 1 từ ngắn theo sau
const TFS_TYPES  = /^(product\s+backlog(\s+\S{2,5})?|backlog\s+item|user\s+story|feature|bug|task|epic|pbi)(?=[\s:|.,–-]|$)[\s:|.,–-]*/i
const TFS_STATES = /[\s|.,–-]+(new|approved|committed|done|removed|in progress|active|closed|resolved|to do|doing)\s*$/i
/** Ô Nội dung 1 công việc bắt đầu bằng mã PBI (dán từ TFS / gõ “1283922 - Khi lập tờ khai…”) → tách { pbi, content }.
    Nhận: “1283922 - …”, “1283922: …”, “#1283922 …”, “Product Backlog Item 1283922: …”, “Bug 1283922 …”. Mã 5–8 chữ số (tránh nhầm năm “2026 …”).
    Không khớp → null. Chỉ bỏ mã ở ĐẦU — phần còn lại (kể cả nhiều dòng) giữ nguyên. */
const PBI_HEAD = /^\s*(?:(?:product\s+backlog\s+item|backlog\s+item|user\s+story|pbi|bug|task|feature)\s*[:#]?\s*)?#?(\d{5,8})(?:\s*[-–—:|.)\]]+\s*|\s+)(?=\S)/i
export function splitPbiContent(text) {
  const s = String(text ?? ''), m = s.match(PBI_HEAD)
  if (!m) return null
  const content = s.slice(m[0].length).replace(/^[\s:|.,–-]+/, '').trim()
  return content.length >= 3 ? { pbi: m[1], content } : null
}
export function parseOcrText(text) {
  const out = [['PBI', 'Nội dung']]
  for (const line of String(text ?? '').split('\n')) {
    const l = line.replace(/^[^\p{L}\p{N}]+/u, '').trim()
    const m = l.match(/^(\d{4,8})\b[\s|:.,)\]-]*(.+)$/)
    if (!m) continue
    let content = m[2].replace(TFS_TYPES, '').replace(TFS_STATES, '').replace(/^[\s:|.,–-]+|[\s:|,–-]+$/g, '').replace(/\s{2,}/g, ' ').trim()
    if (content.length >= 3) out.push([m[1], content])
  }
  return out
}
