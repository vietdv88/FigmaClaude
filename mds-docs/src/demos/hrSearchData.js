/* Dữ liệu mẫu cho ô tìm kiếm toàn cục của Header bar (phần mềm Nhân sự) — dùng trong HeaderDemo */
import { normVi } from '@mds/utils/search.js'

/* ── Dữ liệu mẫu phần mềm Nhân sự — mỗi phân hệ có danh sách bản ghi RIÊNG (một người có thể có mặt ở nhiều phân hệ) ── */
const STAFF = [
  ['Nguyễn Văn Bình', 'Phòng Kế toán', 'Kế toán tổng hợp'], ['Trần Thị Thanh Bình', 'Phòng Nhân sự', 'Chuyên viên tuyển dụng'], ['Lê Hoàng Nam', 'Phòng Kinh doanh', 'Trưởng nhóm kinh doanh'],
  ['Nguyễn Thị Lan', 'Phòng Marketing', 'Chuyên viên nội dung'], ['Phạm Quốc Bảo', 'Phòng Công nghệ', 'Lập trình viên'], ['Nguyễn Minh Châu', 'Phòng Kế toán', 'Kế toán thuế'],
  ['Vũ Thị Hồng Nhung', 'Phòng Hành chính', 'Nhân viên hành chính'], ['Đặng Văn Hùng', 'Phòng Công nghệ', 'Kiểm thử viên'], ['Nguyễn Hữu Phước', 'Phòng Kinh doanh', 'Nhân viên kinh doanh'],
  ['Bùi Thị Mai Anh', 'Phòng Nhân sự', 'Chuyên viên C&B'], ['Trần Quang Huy', 'Phòng Công nghệ', 'Trưởng phòng Công nghệ'], ['Nguyễn Thị Bích Ngọc', 'Phòng Marketing', 'Thiết kế đồ họa'],
  ['Hoàng Văn Long', 'Phòng Kinh doanh', 'Nhân viên kinh doanh'], ['Lê Thị Thu Hà', 'Phòng Kế toán', 'Kế toán trưởng'], ['Đỗ Thanh Tùng', 'Phòng Công nghệ', 'Lập trình viên'],
  ['Nguyễn Đức Thắng', 'Phòng Hành chính', 'Lái xe'], ['Phan Thị Ngọc Bích', 'Phòng Nhân sự', 'Trưởng phòng Nhân sự'], ['Trần Văn Bình An', 'Phòng Kinh doanh', 'Giám đốc kinh doanh'],
  ['Lương Thị Kim Chi', 'Phòng Marketing', 'Trưởng phòng Marketing'], ['Nguyễn Anh Tuấn', 'Phòng Công nghệ', 'Lập trình viên'], ['Hà Thị Thu Trang', 'Phòng Hành chính', 'Lễ tân'],
  ['Ngô Minh Quân', 'Phòng Kinh doanh', 'Nhân viên kinh doanh'], ['Nguyễn Thị Phương Thảo', 'Phòng Kế toán', 'Kế toán công nợ'], ['Trịnh Công Sơn', 'Phòng Công nghệ', 'Quản trị hệ thống'],
  ['Lê Văn Bình', 'Phòng Marketing', 'Chuyên viên SEO'],
].map(([name, dept, role], i) => ({ name, dept, role, code: 'NV' + String(i + 12).padStart(4, '0') }))
const CANDIDATES = ['Nguyễn Thanh Bình', 'Trần Thị Lan Anh', 'Phạm Hữu Nghĩa', 'Nguyễn Hoài Nam', 'Lê Thị Bảo Ngọc', 'Đinh Văn Khánh', 'Nguyễn Quỳnh Chi', 'Võ Minh Bình']
const CONTRACTS = [['Không xác định thời hạn', '01/03/2022'], ['Xác định thời hạn 12 tháng', '01/07/2025'], ['Xác định thời hạn 36 tháng', '15/01/2024'], ['Thử việc 2 tháng', '01/09/2026']]
const BENEFITS = [['Bảo hiểm sức khỏe PVI', '1.200.000 đ / năm'], ['Hỗ trợ ăn trưa', '730.000 đ / tháng'], ['Du lịch công ty 2026', '5.000.000 đ / năm'], ['Hỗ trợ gửi xe', '120.000 đ / tháng']]
const COURSES = ['An toàn thông tin', 'Kỹ năng giao tiếp', 'Quy trình nội bộ', 'Phòng cháy chữa cháy']
const pick = (arr, i) => arr[i % arr.length]

const MODULES = [
  { key: 'profile', title: 'Hồ sơ', records: STAFF.map(p => ({ id: 'p-' + p.code, name: p.name, code: p.code, subtitle: `${p.code} · ${p.dept}`, meta: p.role })) },
  { key: 'contract', title: 'Hợp đồng', records: STAFF.filter((_, i) => i % 3 !== 2).map((p, i) => { const [type, from] = pick(CONTRACTS, i); return { id: 'c-' + p.code, name: p.name, code: p.code, subtitle: `HĐ-2026-${String(231 + i).padStart(4, '0')} · ${type}`, meta: `Hiệu lực từ ${from}` } }) },
  { key: 'benefit', title: 'Phúc lợi', records: STAFF.filter((_, i) => i % 2 === 0).map((p, i) => { const [b, v] = pick(BENEFITS, i); return { id: 'b-' + p.code, name: p.name, code: p.code, subtitle: b, meta: v } }) },
  { key: 'time', title: 'Chấm công', records: STAFF.filter((_, i) => i % 4 !== 1).map((p, i) => ({ id: 't-' + p.code, name: p.name, code: p.code, subtitle: `${p.code} · Tháng 10/2026`, meta: `${22 - (i % 3)}/22 công · nghỉ phép ${i % 3} ngày` })) },
  { key: 'recruit', title: 'Tuyển dụng', records: CANDIDATES.map((n, i) => ({ id: 'r-' + i, name: n, code: '', subtitle: `Ứng viên · ${pick(['Lập trình viên', 'Kế toán tổng hợp', 'Nhân viên kinh doanh'], i)}`, meta: `Vòng ${1 + (i % 3)} · nộp hồ sơ ${String(3 + i).padStart(2, '0')}/10/2026` })) },
  { key: 'training', title: 'Đào tạo', records: STAFF.filter((_, i) => i % 4 !== 3).map((p, i) => ({ id: 'd-' + p.code, name: p.name, code: p.code, subtitle: `Khóa ${pick(COURSES, i)}`, meta: i % 3 === 0 ? 'Đang học' : 'Hoàn thành' })) },
]
export const SHOW = 3   // mỗi phân hệ hiện tối đa 3 bản ghi, còn lại “Xem thêm”


/** Tìm giả lập: mọi từ trong từ khóa phải khớp tên, mã hoặc dòng phụ (phòng ban, số hợp đồng, gói, khóa…), không phân biệt hoa thường / dấu.
 *  Trả về các nhóm phân hệ CÓ kết quả (phân hệ không có kết quả thì không đưa vào). */
export function searchHr(q) {
  const words = normVi(q).split(/\s+/).filter(Boolean)
  return MODULES.map(m => {
    const hit = m.records.filter(r => { const hay = normVi(r.name + ' ' + r.code + ' ' + r.subtitle); return words.every(w => hay.includes(w)) })
    return { key: m.key, title: m.title, total: hit.length, items: hit.slice(0, SHOW) }
  }).filter(g => g.items.length)
}

/** Toàn bộ kết quả của MỘT phân hệ (cho popup “Xem thêm”) */
export function searchHrModule(key, q) {
  const words = normVi(q).split(/\s+/).filter(Boolean)
  const m = MODULES.find(x => x.key === key); if (!m) return { total: 0, items: [] }
  const items = m.records.filter(r => { const hay = normVi(r.name + ' ' + r.code + ' ' + r.subtitle); return words.every(w => hay.includes(w)) })
  return { total: items.length, items }
}
