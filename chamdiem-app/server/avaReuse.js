/* ═══ Dùng lại câu trả lời AVA đã có (Lịch sử hỏi AVA) cho câu hỏi giống — không gọi AI, không tốn token ═══
   Cùng cách làm với AVA của tài liệu Design System (mds-docs/server/ava.js) — xem skill ai-assistant-cost.
   · Dấu hiệu câu hỏi = tập từ có nghĩa: bỏ dấu, gộp cách viết khác nhau của cùng khái niệm, bỏ hư từ → so trùng / gần giống.
   · Câu trả lời ở app này CÁ NHÂN HÓA theo người hỏi (vai trò, dự án, link) → chỉ dùng lại khi cùng nhóm vai trò, cùng chủ đề PD / BA,
     tri thức (quy tắc + hệ số) chưa đổi, và câu trả lời không chứa thông tin riêng (link dự án, việc đang mở, tên người hỏi). */
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()
const STOP = new Set('a ah nhe nhi vay the thi cho toi minh em anh chi ban giup hoi ve cua co khong ko k duoc dc nhu nao gi la va voi o trong cac nhung mot thuong hay se can phai di xem tim vui long please hien tai dang oi'.split(' '))
const FIX = [
  [/man hinh phu|man phu/g, 'manphu'], [/man hinh chinh|man chinh/g, 'manchinh'], [/do phuc tap/g, 'phuctap'], [/he so nghiep vu/g, 'hesonghiepvu'],
  [/nguoi dua giai phap/g, 'nguoidualgp'], [/muc hai long|hai long/g, 'hailong'], [/chot diem/g, 'chotdiem'], [/vong lap|sprint|iteration/g, 'vonglap'],
  [/ngay hoan thanh/g, 'ngayhoanthanh'], [/diem ky vong/g, 'kyvong'], [/ba point/g, 'bapoint'], [/diem thuc nhan/g, 'thucnhan'],
  [/cong viec|\bviec\b|\btask\b|\bpbi\b/g, 'congviec'], [/du an|project/g, 'duan'], [/pop ?up|dialog|hop thoai/g, 'popup'],
  [/bao nhieu|the nao|nhu the nao|ra sao/g, 'hoi'], [/tinh diem|cham diem|duoc diem|len diem/g, 'tinhdiem'],
]
export function qSig(q) {
  let s = norm(q)
  for (const [re, r] of FIX) s = s.replace(re, ' ' + r + ' ')
  return [...new Set((s.match(/[a-z0-9]+/g) ?? []).filter(t => t.length > 1 && !STOP.has(t)))].sort()
}
/** Độ giống (Jaccard) + số từ chung */
export function qSim(a, b) {
  const B = new Set(b), shared = a.filter(t => B.has(t)).length
  return { j: shared / (new Set([...a, ...b]).size || 1), shared }
}
/** Câu hỏi chỉ vào thứ đang mở trên màn hình → câu trả lời phụ thuộc ngữ cảnh, không dùng lại */
export const isDeictic = q => /\b(nay|day|dang mo|hien tai|o tren|ben canh)\b/.test(norm(q))
/** Câu trả lời có thông tin riêng của người hỏi (link dự án / việc, việc đang mở, gọi tên) → không dùng lại cho người khác */
export function isPersonal(text, name = '') {
  if (/\]\(\/du-an\/[^)\s?#]+/.test(text) || /viec dang mo|dang mo/.test(norm(text))) return true
  const first = String(name).trim().split(/\s+/).pop()
  return !!first && first.length > 1 && new RegExp(`(^|[\\s,.!:(])${first.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s,.!:)]|$)`).test(text)
}
export const hashText = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) }
