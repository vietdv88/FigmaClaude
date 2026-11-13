import * as core from './importCore.js'
import { IMPORT_COLUMNS, parseCsv } from './importCore.js'
import { db, membersOf, closedDateError, ownProjectFor, iterationById } from './db.js'
import { downloadCsv } from './csv.js'

/* Nhập công việc trên trình duyệt — lõi kiểm tra ở importCore.js (dùng chung với máy chủ), ngữ cảnh lấy từ kho dữ liệu db.js */
export { IMPORT_COLUMNS, parseCsv, parsePastedTable, parseOcrText, looksLikeTaskSheet } from './importCore.js'
const ctx = () => ({ membersOf, closedDateError, ownProjectFor, tasks: db.tasks, allUsers: db.users, iterationName: id => iterationById(id)?.name ?? '' })
export const validateRows = (rawRows, projectId, opts = {}) => core.validateRows(rawRows, projectId, opts, ctx())
export const markDuplicatePbis = (items, projectId, pbiOf) => core.markDuplicatePbis(items, projectId, pbiOf, ctx())

/* ── File mẫu ── */
export function downloadImportTemplate() {
  const header = IMPORT_COLUMNS.map(c => c.label + (c.required ? ' *' : ''))
  // Cột PD / BA: điền mã nhân viên (app khớp người theo mã trước, rồi email, họ tên)
  const example = {
    pbi: '684901', content: 'Màn hình danh sách đơn hàng', pdId: 'B01-0001', baId: 'B01-0002', expectedDate: '20/10/2026',
    solutionBy: 'PD và BA', complexity: 'Trung bình', platform: 'Web', concept: '', isOwnProject: 'Có',
    designStatus: 'Đang thực hiện', designLink: '', devmodeLink: '', completedDate: '', mainScreens: 2, subScreens: 3,
    qualityRating: '', ratingReason: '',
  }
  downloadCsv('mau-nhap-cong-viec.csv', header, [IMPORT_COLUMNS.map(c => example[c.field])])
}

/* ── Đọc file → danh sách sheet [{ name, rows }] (CSV = 1 sheet) ── */
export async function readSheets(file) {
  if (/\.xlsx$/i.test(file.name)) {
    const { default: readXlsxFile } = await import('read-excel-file/browser')
    const sheets = await readXlsxFile(file)
    return sheets.map(s => ({ name: s.sheet, rows: s.data }))
  }
  if (/\.(csv|txt)$/i.test(file.name)) return [{ name: file.name, rows: parseCsv(await file.text()) }]
  throw new Error('Chỉ hỗ trợ file .xlsx hoặc .csv')
}

