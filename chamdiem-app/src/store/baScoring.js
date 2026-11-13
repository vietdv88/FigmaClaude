/* ═══ QUY TẮC CHẤM ĐIỂM BA — 1 nguồn duy nhất cho trang Quy tắc BA (và phần chấm điểm BA sau này) ═══
   Theo “Template đánh giá năng suất BA — dùng chung cho các dự án” (bản điều chỉnh: chấm theo TỪNG Work Item).
   Điểm thực nhận = BA Point × 60% + Point tiến độ × 20% + Point chất lượng × 20%;
   Điểm tháng của BA = Σ Điểm thực nhận có Ngày hoàn thành thực tế trong tháng.
   Hệ số lưu ở cấu hình chung: config.ba (Quản trị sửa ở trang Quy tắc BA). */

/** Hệ số mặc định (%) — chỉ đổi khi có thống nhất chung */
export const DEFAULT_BA_CONFIG = {
  weights: { point: 60, progress: 20, quality: 20 },   // trọng số BA Point (năng suất) · Point tiến độ · Point chất lượng
  quality: { 'Gần như đạt ngay lần đầu': 100, 'Dùng ngay, cần bổ sung': 80, 'Sửa đáng kể / nhiều lần': 50 },
}
/** Cấu hình BA đang áp dụng (cấu hình chung chưa có phần BA → mặc định; bỏ qua khóa cũ không còn dùng) */
export function baConfigOf(cfg) {
  const b = cfg?.ba ?? {}
  const w = b.weights ?? {}
  return {
    weights: { point: w.point ?? w.productivity ?? DEFAULT_BA_CONFIG.weights.point, progress: w.progress ?? DEFAULT_BA_CONFIG.weights.progress, quality: w.quality ?? DEFAULT_BA_CONFIG.weights.quality },
    quality: { ...DEFAULT_BA_CONFIG.quality, ...b.quality },
  }
}

/** Quy trình chấm điểm BA — tương tự PD */
export const BA_FLOW = [
  { icon: 'calendar',        color: 'var(--chart-c1)', title: 'Tạo vòng lặp',          who: 'Quản trị dự án',   desc: 'Đặt khoảng ngày, chuyển việc chưa xong từ vòng trước' },
  { icon: 'plus',            color: 'var(--chart-c5)', title: 'Khai báo công việc',    who: 'Thành viên dự án', desc: 'Đầu vòng lặp: khai báo Work Item (PBI / Task), giao BA thực hiện' },
  { icon: 'star',            color: 'var(--chart-c6)', title: 'Chấm BA Point',         who: 'PO',               desc: 'Cho Story Point (BA Point) từng việc — thống nhất với BA, chỉ gán 1 lần' },
  { icon: 'pencil',          color: '#ee46bc', title: 'Thực hiện',             who: 'BA',               desc: 'Phân tích, viết PBI, làm rõ yêu cầu… tới khi có đầu ra dùng được' },
  { icon: 'clipboard-check', color: 'var(--chart-c2)', title: 'Cập nhật kết quả',      who: 'PO',               desc: 'Deadline, ngày hoàn thành thực tế, miễn trừ trễ, kết quả chất lượng' },
  { icon: 'calculator',      color: 'var(--chart-c3)', title: 'Tính điểm thực nhận',   who: 'Tự động',          desc: 'Hệ số tiến độ, Point tiến độ, Point chất lượng → Điểm thực nhận' },
  { icon: 'lock',            color: 'var(--bg-brand)', title: 'Chốt điểm cuối tháng',  who: 'PO',               desc: 'Cộng Điểm thực nhận các Work Item hoàn thành trong tháng của từng BA' },
]

/** Khung chất lượng — 3 mức + Chưa đánh giá */
/* Màu tag (và màu biểu đồ — store/ratingColors.js) ĐỒNG NHẤT với mức đánh giá PD: đạt = brand (như Hài lòng) · cần bổ sung = cam · sửa đáng kể = đỏ (như Không hài lòng) · chưa đánh giá = xám */
export const BA_QUALITY_LEVELS = [
  { value: 'Gần như đạt ngay lần đầu', color: 'brand',   criteria: 'Gần như đạt ngay lần đầu, sửa ít hoặc rất ít; kết quả đầu ra dùng được ngay.' },
  { value: 'Dùng ngay, cần bổ sung',   color: 'warning', criteria: 'Kết quả đầu ra dùng được ngay nhưng vẫn cần bổ sung thêm theo các góp ý của các bên.' },
  { value: 'Sửa đáng kể / nhiều lần',  color: 'danger',  criteria: 'Kết quả đầu ra không dùng được ngay, phải sửa hoặc bổ sung đáng kể mới dùng được, hoặc phải sửa chữa nhiều lần.' },
]
export const BA_UNRATED = 'Chưa đánh giá'   // mặc định — chưa tính Point chất lượng & Điểm thực nhận

/** Lưu ý khi chấm BA Point */
export const BA_POINT_RULES = [
  'Point do dự án / PO / PM / Lead thống nhất với BA, căn cứ mức độ công việc — nhập thủ công, không tự động.',
  'Một Work Item chỉ ghi nhận Point một lần; cập nhật các lần sửa trên cùng Work Item.',
  'Không cộng thêm Point vì sửa lại nhiều lần, vì làm chậm hơn dự kiến hay do OT.',
  'Point cần được team thống nhất để cùng loại công việc được đánh giá theo cùng nguyên tắc.',
  'Việc chưa xong không đưa vào kỳ chấm: làm tháng này nhưng tháng sau mới xong thì ghi vào tháng sau.',
  'Việc đủ lớn thì tách nhỏ để ghi nhận đúng năng suất trong kỳ, tránh kỳ trước điểm thấp dồn kết quả sang kỳ sau.',
]

/** Nguyên tắc ghi nhận và chấm chất lượng */
export const BA_PRINCIPLES = [
  { key: 'Chỉ ghi nhận khi có đầu ra', text: 'Chỉ nhập Ngày hoàn thành thực tế khi công việc đã hoàn thành và có đầu ra sử dụng được. Chưa có đầu ra: để trống Ngày hoàn thành và Kết quả chất lượng; không tự gán mức 50%.' },
  { key: 'Thời điểm chấm',             text: 'Chốt chất lượng khi công việc hoàn thành; căn cứ khả năng dùng ngay của đầu ra và mức độ sửa trong quá trình hoàn thiện. Không nâng thành 100% chỉ vì bản cuối đã dùng được sau nhiều lần sửa.' },
  { key: 'Phân biệt 100% / 80%',       text: 'Cả hai mức đều có đầu ra dùng được ngay. Mức 100%: gần như đạt lần đầu, chỉ sửa ít / rất ít. Mức 80%: vẫn cần bổ sung theo góp ý của các bên.' },
  { key: 'Trường hợp 50%',             text: 'Đầu ra không dùng được ngay, phải sửa / bổ sung đáng kể hoặc sửa nhiều lần. Không có mốc 0%: công việc làm đi làm lại nhưng cuối cùng đã có đầu ra được xếp mức 50%.' },
  { key: 'Dữ liệu thiếu / sai',        text: 'Đã hoàn thành nhưng còn “Chưa đánh giá” chất lượng: cảnh báo dữ liệu, chưa tính Điểm thực nhận — không tự quy đổi thành 0% hay 50%. Rà soát trước khi chốt kỳ.' },
]

/* ── Tính điểm Work Item ── */
const r2 = n => Math.round(n * 100) / 100
/**
 * Điểm 1 Work Item. onTime: true = hoàn thành ≤ deadline hoặc được miễn trừ trễ hợp lệ. quality: tên mức (hoặc rỗng / Chưa đánh giá).
 * Chưa hoàn thành → null · thiếu chất lượng → { ..., actual: null, missingQuality: true }.
 */
export function baWorkItemScore({ point, done, onTime, quality }, cfg) {
  const c = baConfigOf({ ba: cfg })
  const p = Number(point) || 0
  if (!done) return null
  const progressRate = onTime ? 100 : 0
  const progressPoint = p * progressRate / 100
  const qualityRate = c.quality[quality]
  if (qualityRate == null) return { progressRate, progressPoint: r2(progressPoint), qualityRate: null, qualityPoint: null, actual: null, missingQuality: true }
  const qualityPoint = p * qualityRate / 100
  const w = c.weights
  const actual = (p * w.point + progressPoint * w.progress + qualityPoint * w.quality) / 100
  return { progressRate, progressPoint: r2(progressPoint), qualityRate, qualityPoint: r2(qualityPoint), actual: r2(actual), missingQuality: false }
}
/** Đúng hạn: ngày hoàn thành ≤ deadline (YYYY-MM-DD) hoặc được miễn trừ trễ */
export const baOnTime = ({ deadline, completedDate, exempt }) => !!exempt || (!!deadline && !!completedDate && completedDate <= deadline)
