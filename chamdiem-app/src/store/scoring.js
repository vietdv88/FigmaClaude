/* ═══════════════════════════════════════════════════════════════════════════
   Quy tắc chấm điểm thiết kế — theo tài liệu "Quy tắc tính điểm" của công ty.
   Danh mục + diễn giải dùng chung cho form, drawer và màn Quy tắc chấm điểm.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Trạng thái thiết kế */
export const DESIGN_STATUSES = [
  // iconColor: màu icon ở cột Nội dung — “Đang / Chờ” = warning, “Đã” = success (đã chốt điểm = danger, đặt ở danh sách)
  // desc: ý nghĩa trạng thái — hiện trong ô chọn trạng thái + nạp cho AVA (đừng để AI tự đoán)
  { value: 'Đang thực hiện',      color: 'brand',   icon: 'clock',        iconColor: 'warning', desc: 'PD đang thiết kế, chưa xong.' },
  { value: 'Chờ sửa thiết kế',    color: 'warning', icon: 'pencil',       iconColor: 'warning', desc: 'Thiết kế có góp ý, PD cần sửa lại.' },
  { value: 'Đã thiết kế',         color: 'success', icon: 'circle-check', iconColor: 'success', desc: 'PD đã thiết kế xong, chờ BA đồng ý cho chuyển Local.' },
  { value: 'OK --> Chuyển Local', color: 'success', icon: 'circle-check', iconColor: 'success', desc: 'BA đã đồng ý cho phép chuyển link thiết kế vào Local để dev thi công — nhưng CHƯA chắc PD đã chuyển.' },
  { value: 'PD đã chuyển Local',  color: 'success', icon: 'circle-check', iconColor: 'success', desc: 'PD đã chuyển link thiết kế vào Local cho dev thi công (chắc chắn đã chuyển).' },
  { value: 'Pending',             color: 'neutral', icon: 'hand-stop',    iconColor: 'neutral', desc: 'Công việc tạm dừng (chờ quyết định, chờ bên khác…) — KHÔNG tính vào việc quá hạn / sắp đến hạn và không tính điểm cho tới khi chuyển lại trạng thái khác.' },
]
import { baWorkItemScore, baOnTime, BA_UNRATED } from './baScoring.js'
export const DEFAULT_STATUS = 'Đang thực hiện'
/** Lựa chọn trạng thái thiết kế cho ô chọn — kèm mô tả ý nghĩa */
export const DESIGN_STATUS_OPTIONS = DESIGN_STATUSES.map(s => ({ value: s.value, label: s.value, description: s.desc }))
/** Trạng thái coi là đã thiết kế xong — nên có Ngày hoàn thành */
export const DONE_STATUSES = ['Đã thiết kế', 'OK --> Chuyển Local', 'PD đã chuyển Local']
/** Trạng thái tạm dừng — việc Pending không lên thống kê quá hạn / sắp đến hạn, không tính điểm mặc định */
export const PENDING_STATUS = 'Pending'
export const isPending = t => t?.designStatus === PENDING_STATUS

/* ═══ GIAI ĐOẠN CÔNG VIỆC — 1 công việc có thể gồm Phân tích (BA) và / hoặc Thiết kế (PD) ═══
   design   = Chỉ thiết kế (mặc định, mọi công việc cũ) — giữ nguyên trường + cách chấm của PD
   analysis = Chỉ phân tích — trường + cách chấm của BA (Điểm thực nhận)
   both     = Phân tích → Thiết kế — BA phân tích, PO / quản lý trực tiếp của BA duyệt & chuyển thiết kế, rồi PD vẽ.
   Mỗi giai đoạn có người làm, ngày hoàn thành và điểm riêng (tháng tính theo ngày hoàn thành của giai đoạn đó). */
export const STAGES = [
  { value: 'analysis', label: 'Chỉ phân tích',         short: 'BA',      hint: 'Làm rõ yêu cầu, họp CCB, nghiên cứu, viết PBI… không cần thiết kế — chỉ tính điểm BA' },
  { value: 'both',     label: 'Phân tích → Thiết kế', short: 'BA → PD', hint: 'BA phân tích, được duyệt rồi PD thiết kế — tính điểm cho cả BA và PD' },
  { value: 'design',   label: 'Chỉ thiết kế',          short: 'PD',      hint: 'Việc PD làm thẳng không qua phân tích — chỉ tính điểm PD (như hiện tại)' },
]
export const stageOf     = t => (['analysis', 'both'].includes(t?.stage) ? t.stage : 'design')
export const stageLabel  = v => (STAGES.find(s => s.value === v) ?? STAGES.find(s => s.value === 'design')).label
export const hasAnalysis = t => stageOf(t) !== 'design'
export const hasDesign   = t => stageOf(t) !== 'analysis'
/** Trạng thái giai đoạn Phân tích — TỰ CHUYỂN theo dữ liệu, không chọn tay:
    Chỉ phân tích: Đang phân tích (chưa có ngày hoàn thành) → Chờ chấm điểm (thiếu Point / chất lượng) → Hoàn thành
    Phân tích → Thiết kế: Đang phân tích → Chờ duyệt (đã có ngày hoàn thành) → PO / quản lý trực tiếp bấm “Duyệt & chuyển thiết kế”
    baStatus chỉ còn là dấu đã duyệt (BA_APPROVED) của việc 2 giai đoạn. */
export const BA_STATUSES = [
  { value: 'Đang phân tích', color: 'brand',   icon: 'pencil',       iconColor: 'warning' },
  { value: 'Chờ chấm điểm',  color: 'warning', icon: 'clock',        iconColor: 'warning' },
  { value: 'Chờ duyệt',      color: 'warning', icon: 'clock',        iconColor: 'warning' },
  { value: 'Hoàn thành',     color: 'success', icon: 'circle-check', iconColor: 'success' },
]
export const BA_DEFAULT_STATUS = ''
export const BA_APPROVED = 'Đã duyệt'
/** Giai đoạn đang làm: việc 2 giai đoạn chưa được duyệt → đang Phân tích; đã duyệt → Thiết kế */
/** NHẬN VIỆC: thành viên dự án tự nhận việc CHƯA CÓ NGƯỜI THỰC HIỆN (chỉ gán chính mình)
    slot 'pd': việc có thiết kế, đang ở phần thiết kế, ô PD trống, người nhận thuộc bộ phận PD
    slot 'ba': việc có phân tích, ô BA trống, phân tích chưa hoàn thành / chưa duyệt, người nhận thuộc bộ phận BA
    projectRole: vai trò của người nhận trong dự án ('manager' | 'member' — 'viewer' / QA không nhận) */
export function canClaimSlot(t, slot, user, projectRole) {
  if (!t || !user || !['manager', 'member'].includes(projectRole)) return false
  if (slot === 'pd') return isPdRole(user.role) && stageOf(t) !== 'analysis' && phaseOfTask(t) === 'design' && !t.pdId
  if (slot === 'ba') return user.role === 'BA' && stageOf(t) !== 'design' && !t.baId && !t.baCompletedDate && t.baStatus !== BA_APPROVED
  return false
}
const phaseOfTask = t => (stageOf(t) === 'analysis' || (stageOf(t) === 'both' && t.baStatus !== BA_APPROVED) ? 'analysis' : 'design')
export const phaseOf = t => (stageOf(t) === 'analysis' || (stageOf(t) === 'both' && t.baStatus !== BA_APPROVED) ? 'analysis' : 'design')
/** Trạng thái phân tích tự suy từ dữ liệu */
export function baStatusOf(t) {
  if (!t.baCompletedDate) return 'Đang phân tích'
  if (stageOf(t) === 'both') return 'Chờ duyệt'
  return missingBaFields(t).length ? 'Chờ chấm điểm' : 'Hoàn thành'
}
/** Trạng thái hiển thị chung (cột Trạng thái) theo giai đoạn đang làm */
export const taskStatusOf = t => (phaseOf(t) === 'analysis' ? baStatusOf(t) : (t.designStatus || ''))
export const taskStatusMeta = t => [...BA_STATUSES, ...DESIGN_STATUSES].find(s => s.value === taskStatusOf(t))
/** Trường của giai đoạn Phân tích — chấm điểm (PO / quản lý trực tiếp của BA nhập) */
export const BA_SCORE_FIELDS = ['baPoint', 'baDeadline', 'baCompletedDate', 'baExempt', 'baExemptReason', 'baQuality']
export const BA_PHASE_FIELDS = ['baStatus', ...BA_SCORE_FIELDS]
/** BA của việc tự điền được (khi chưa duyệt, tháng chưa chốt) — miễn trừ + duyệt vẫn chỉ PO / quản lý trực tiếp */
export const BA_SELF_FIELDS = ['baPoint', 'baDeadline', 'baCompletedDate', 'baQuality']

/* ── Quy tắc xác định người đưa giải pháp thiết kế ── */
export const SOLUTION_RULES = [
  { value: 'BA', criteria: [
    'Các yêu cầu bổ sung các trường thông tin, thay đổi thông tin có chỉ định vị trí',
    'Vẽ theo biểu mẫu có sẵn',
    'Vẽ form theo giải pháp chi tiết đã có sẵn, chỉ định các thông tin mà PD sau đó không đưa ra được thay đổi gì giải pháp trên thiết kế',
    'Vẽ theo wireframe, Google AI Studio của BA mà PD không cần chỉnh sửa hay sáng tạo thêm gì (wireframe cần đủ nội dung, câu từ; banner hoặc website đã chốt nội dung, layout vị trí, ảnh, text; ảnh mong muốn hiển thị là gì, hiển thị như thế nào hoặc có mẫu để PD làm theo)',
  ] },
  { value: 'PD và BA', criteria: [
    'Vẽ form theo yêu cầu của BA có mô tả các giải pháp sơ bộ, PD vẫn theo giải pháp ấy, có đóng góp thay đổi hoặc trao đổi làm rõ chi tiết giải pháp',
    'PD có đưa giải pháp nhưng sau đó giải pháp chốt thay đổi theo hướng khác do BA đưa ra (có đưa được giải pháp nhưng chưa phù hợp)',
    'Các yêu cầu mà BA đưa giải pháp, đã thông báo chốt giải pháp chuyển thiết kế, sau đó sửa lại nội dung, sắp xếp từ 2 lần trở lên (sửa miễn phí cho BA 1 lần)',
  ] },
  { value: 'PD', criteria: [
    'Yêu cầu chỉ có câu chuyện nghiệp vụ, PD tự chủ động trao đổi BA để lên giải pháp. Giải pháp này sau đó được PD trình bày bảo vệ và lên thiết kế chốt',
    'Yêu cầu mà BA có giải pháp, nhưng thiết kế thấy không phù hợp và PD đưa ra giải pháp khác, giải pháp này sau đó được PD trình bày bảo vệ và lên thiết kế chốt',
    'Thiết kế các phần mà BA không thể nêu được giải pháp: banner, website, tờ rơi, animation, icon, logo (BA chỉ cung cấp nội dung thông báo, text, không có bố cục, mô tả cách thức thể hiện)',
  ] },
]
export const SOLUTION_ROLES = SOLUTION_RULES.map(r => r.value)

/* ── ĐỘ PHỨC TẠP THIẾT KẾ (hệ số chính) — đo phần GIẢI PHÁP GIAO DIỆN PD phải nghĩ & vẽ, KHÔNG đo độ khó nghiệp vụ / lập trình ──
   Nghiệp vụ phức tạp mà giao diện đơn giản → chọn mức thấp ở đây + Hệ số nghiệp vụ cao (bên dưới). Mỗi mức: tóm tắt · dấu hiệu · ví dụ */
export const COMPLEXITY_RULES = [
  { value: 'Rất đơn giản', summary: 'Chỉ sửa trên thiết kế đã có — không tạo khung mới, không đổi bố cục.',
    criteria: [
      'Không tạo màn, popup hay trạng thái màn hình mới',
      'Không đổi bố cục, không đổi thứ tự thao tác',
      'Không cần mô tả hành vi / tương tác mới cho dev',
    ],
    examples: ['Đổi icon, màu, chữ trên nút', 'Sửa nội dung thông báo có sẵn', 'Thêm cột / trường theo đúng kiểu đã có (màn bị sửa vẫn khai 1 màn hình chính)', 'Localize'] },
  { value: 'Đơn giản', summary: 'Màn / popup mới dựng từ mẫu có sẵn trong design system, ít trạng thái.',
    criteria: [
      'Tạo mới màn, popup theo khuôn đã có (danh sách, form, chi tiết chỉ đọc)',
      'Chỉ 1–2 trạng thái (bình thường, trống); không có nhánh giao diện theo điều kiện',
      'Sắp xếp lại bố cục, thêm / bớt một bước thao tác',
    ],
    examples: ['Popup xác nhận xóa', 'Màn trống “Chưa có dữ liệu”', 'Màn xem thông tin chỉ đọc', 'Màn bật / tắt kết nối kèm danh sách nhật ký'] },
  { value: 'Trung bình', summary: 'Nhiều trạng thái / biến thể giao diện phải vẽ, luồng thẳng.',
    criteria: [
      'Từ 3 trạng thái / biến thể trở lên (trống, lỗi, đang tải, có dữ liệu, chỉ đọc…)',
      'Form có kiểm tra lỗi, thông báo, gợi ý nhập; bảng có thao tác trên dòng, lọc, tìm kiếm',
      'Nhập / xuất theo file mẫu; mẫu in, báo cáo theo khuôn có sẵn',
    ],
    examples: ['Danh mục có thêm / sửa / xóa + kiểm tra trùng', 'Nhập khẩu danh sách từ Excel', 'Mẫu in phiếu', 'Màn cài đặt nhiều tuỳ chọn'] },
  { value: 'Phức tạp', summary: 'Luồng nhiều bước, giao diện đổi theo điều kiện / vai trò, tương tác hoặc hiển thị dữ liệu phức tạp.',
    criteria: [
      'Luồng nhiều bước / wizard; giao diện, nút, quyền thay đổi theo trạng thái hoặc vai trò',
      'Đối tượng chính + danh sách chi tiết sửa trực tiếp trên cùng màn',
      'Tương tác mới: kéo thả, sửa trực tiếp trên bảng, chọn nhiều + thao tác hàng loạt',
      'Hiển thị dữ liệu phức tạp: dashboard, biểu đồ, so sánh nhiều chiều',
    ],
    examples: ['Đơn hàng nhiều dòng sản phẩm sửa trên lưới', 'Luồng duyệt nhiều cấp có nút khác nhau theo bước', 'Bảng Kanban kéo thả', 'Dashboard KPI theo phòng ban'] },
  { value: 'Rất phức tạp', summary: 'Phải tạo mẫu / thành phần mới chưa có hoặc trải nghiệm mới, thử nhiều phương án.',
    criteria: [
      'Tạo thành phần / mẫu giao diện mới chưa có trong design system',
      'Trình cấu hình cho người dùng tự thiết lập (quy trình, công thức, biểu mẫu, bố cục)',
      'Trải nghiệm mới phải nghiên cứu, làm prototype, trình bày nhiều phương án',
      'Ảnh hưởng thống nhất tới nhiều phân hệ / nhiều màn (đổi khung chung, điều hướng)',
    ],
    examples: ['Trình thiết lập quy trình duyệt kéo thả', 'Trình tạo biểu mẫu tuỳ biến', 'Thiết kế lại điều hướng toàn sản phẩm', 'Trải nghiệm onboarding hoàn toàn mới'] },
]
/** Cây quyết định (theo CÔNG THIẾT KẾ): trả lời lần lượt, dừng ở câu đầu tiên “Không” → mức tương ứng; câu cuối “Có” → Rất phức tạp */
export const COMPLEXITY_STEPS = [
  { q: 'Có tạo khung mới (màn, popup, trạng thái) hoặc đổi bố cục / luồng thao tác không?', no: 'Rất đơn giản' },
  { q: 'Có phải vẽ từ 3 trạng thái / biến thể trở lên, hoặc form có kiểm tra lỗi, bảng có thao tác không?', no: 'Đơn giản' },
  { q: 'Có luồng nhiều bước, giao diện đổi theo điều kiện / vai trò, tương tác mới hoặc hiển thị dữ liệu phức tạp không?', no: 'Trung bình' },
  { q: 'Có phải tạo thành phần / mẫu mới chưa có, trình cấu hình, hoặc trải nghiệm mới cần thử nhiều phương án không?', no: 'Phức tạp', yes: 'Rất phức tạp' },
]
/* ── HỆ SỐ NGHIỆP VỤ (phụ, biên độ nhỏ) — ghi nhận công tìm hiểu nghiệp vụ (đọc tài liệu, họp làm rõ) dù giao diện đơn giản. Bỏ trống = Bình thường (× 1) ── */
export const BUSINESS_LEVELS = [
  { value: 'Bình thường',  summary: 'Nghiệp vụ quen thuộc, hiểu ngay từ yêu cầu.' },
  { value: 'Phức tạp',     summary: 'Nhiều quy tắc, đối tượng liên quan, trạng thái, duyệt / phân quyền — phải trao đổi để hiểu.' },
  { value: 'Rất phức tạp', summary: 'Tích hợp hệ thống khác, tự động xử lý, xử lý hàng loạt, ảnh hưởng nhiều phân hệ — phải nghiên cứu sâu.' },
]
export const BUSINESS_VALUES = BUSINESS_LEVELS.map(b => b.value)
/** Lựa chọn cho ô chọn — kèm tóm tắt mức (hiện dưới mỗi lựa chọn) */
export const BUSINESS_OPTIONS = BUSINESS_LEVELS.map(b => ({ value: b.value, label: b.value, description: b.summary }))
export const DEFAULT_BUSINESS = 'Bình thường'
export const BUSINESS_HINT = 'Độ khó để HIỂU nghiệp vụ (không phải công vẽ). Bỏ trống = Bình thường × 1.'
/** Tháng bắt đầu chấm Độ phức tạp theo định nghĩa thiết kế + Hệ số nghiệp vụ (việc cũ giữ nguyên mức → điểm không đổi) */
export const COMPLEXITY_SINCE = '2026-11'
export const COMPLEXITY_CHANGE_NOTE = 'Từ tháng 11/2026: “Độ phức tạp” đo công THIẾT KẾ (không còn đo nghiệp vụ); độ khó nghiệp vụ tách sang “Hệ số nghiệp vụ” (× 1 / 1,1 / 1,2). Việc đã khai giữ nguyên mức cũ, điểm không đổi; tháng đã chốt không tính lại.'
export const COMPLEXITY_TIE = 'Một việc rơi vào nhiều mức → chọn theo phần chiếm phần lớn công thiết kế.'
export const COMPLEXITIES = COMPLEXITY_RULES.map(r => r.value)
export const COMPLEXITY_OPTIONS = COMPLEXITY_RULES.map(r => ({ value: r.value, label: r.value, description: r.summary }))
/** Tên gọi khác của mức độ phức tạp → tên chuẩn (dùng khi nhập file) */
export const COMPLEXITY_ALIASES = { 'Rất dễ': 'Rất đơn giản', 'Dễ': 'Đơn giản', 'Khó': 'Phức tạp', 'Rất khó': 'Rất phức tạp' }
export const COMPLEXITY_NOTE = 'Các yêu cầu mà BA lên giải pháp, đã có sẵn Google AI Studio → độ phức tạp mặc định là “Trung bình”.'

/* ── Quy tắc đếm màn hình thiết kế ── */
export const SCREEN_RULES = [
  'Ngày hoàn thành: là ngày hoàn thành thiết kế sau khi sửa theo các góp ý trong vòng lặp phân tích thiết kế.',
  'Màn hình được tính là các màn hình thiết kế đã được chốt trong vòng lặp phân tích thiết kế.',
  'Màn hình chính: các màn hình không thuộc danh sách màn phụ.',
  'Màn phụ: chi tiết combo xổ ra, tooltip, chi tiết các chức năng trong nút 3 chấm, nút thêm, nút khác, màn thông báo, cảnh báo, toast message — mỗi màn phụ tính 0,2 màn hình chính.',
  'Website, Tổng quan, các màn dài quá 3 lần chiều cao màn thiết kế chuẩn mà thiết kế mới: tính số lượng màn hình chính theo số lượt cuộn theo chiều cao của màn hình thiết kế.',
  'Animation: quy ra màn hình — PD ước lượng số, PO điều chỉnh.',
  'Logo: 3 điểm / phương án (nhập 3 màn hình chính cho mỗi phương án).',
  'Tờ rơi: 1 màn hình / 1 page.',
  'Không tính các màn hình copy thiết kế có sẵn vào để làm đủ luồng.',
  'Màn có sẵn chỉ sửa / bổ sung (thêm 1–2 trường, cột theo kiểu đã có): vẫn đếm 1 màn hình chính cho mỗi màn bị sửa, chọn độ phức tạp “Rất đơn giản” — không khai thành màn phụ.',
  'Dự án mới từ alpha đến RC1 (nghiệp vụ thay đổi nhiều): tính điểm cho mỗi phiên bản thiết kế chốt được về nghiệp vụ với PO để mang trình bày. Từ bản RC2, đo đếm như cách bình thường.',
]
/* Màn có sẵn chỉ sửa / bổ sung — vẫn là màn chính, công ít thể hiện qua độ phức tạp “Rất đơn giản” (không trừ 2 lần bằng cách khai màn phụ) */
export const EDIT_SCREEN_GUIDE = {
  rule: 'Sửa trên màn đã thiết kế sẵn (thêm / bớt 1–2 trường, thêm cột, đổi nhãn, đổi vị trí theo kiểu đã có): mỗi màn bị sửa vẫn khai 1 Màn hình chính, chọn Độ phức tạp = “Rất đơn giản”.',
  why: 'Công sửa ít đã được tính qua hệ số Rất đơn giản. Nếu khai thêm thành màn phụ thì bị giảm 2 lần (màn phụ × Rất đơn giản), điểm thấp hơn công thực tế.',
  steps: [
    'Màn hình chính: số màn có sẵn bị sửa (sửa 3 màn → 3)',
    'Màn hình phụ: 0 — trừ khi có thiết kế mới phần bật ra (VD thêm 1 combo mới vẽ riêng → 1 màn phụ)',
    'Độ phức tạp: Rất đơn giản (không tạo khung mới, không đổi bố cục)',
    'Sửa làm đổi bố cục, thêm khu vực / popup / trạng thái mới → không còn là Rất đơn giản, chọn mức theo 4 câu hỏi độ phức tạp',
  ],
}
/* Định nghĩa chi tiết màn phụ (quy tắc 4) — để PD tự phân biệt màn phụ / màn chính */
export const SUB_SCREEN_GUIDE = {
  rule: 'Màn phụ là phần giao diện nhỏ bật ra hoặc gắn vào một màn chính khi người dùng thao tác — không thay đổi bố cục của màn chính, không có ô nhập liệu hay luồng nghiệp vụ riêng.',
  sub: [
    'Danh sách xổ ra của combo / dropdown, chọn ngày, chọn màu',
    'Tooltip, popover gợi ý khi rê chuột',
    'Menu chức năng của nút 3 chấm, nút “Thêm”, nút “Khác” (danh sách lệnh xổ ra)',
    'Hộp thoại thông báo / cảnh báo / xác nhận chỉ có nội dung và nút (Đồng ý, Hủy…)',
    'Toast message, thanh thông báo ngắn',
  ],
  main: [
    'Popup / form có ô nhập liệu (thêm mới, sửa, cấu hình, lọc nâng cao…)',
    'Panel / drawer xem hoặc sửa chi tiết',
    'Màn chuyển trang, tab có nội dung khác hẳn, các bước của wizard',
    'Màn thiết kế lại bố cục (VD bản mobile của màn web) — mỗi bố cục là 1 màn chính',
  ],
  tip: 'Mẹo: che phần bật ra đi mà màn chính vẫn đủ ý nghĩa, và phần đó không có ô nhập / luồng xử lý riêng → màn phụ. Có ô nhập, nhiều bước, hoặc thay cả nội dung màn → màn chính.',
  /* Hỏi lần lượt — gặp “Có” ở câu nào thì kết luận màn chính ngay; qua hết cả 4 câu đều “Không” → màn phụ */
  checks: [
    'Có thay cả nội dung / bố cục màn (chuyển trang, đổi tab nội dung khác hẳn, bản mobile của màn web) không?',
    'Có ô nhập liệu (textbox, ô tìm kiếm, form) để người dùng điền rồi lưu / xử lý không?',
    'Có luồng riêng nhiều bước (wizard, chọn → xác nhận → kết quả) không?',
    'Có phải panel / drawer / popup lớn để xem hoặc sửa chi tiết một đối tượng không?',
  ],
  examples: [
    ['Combo “Phòng ban” bấm ra danh sách để chọn', 'phụ'],
    ['Lịch chọn ngày (date picker) bật ra từ ô ngày', 'phụ'],
    ['Tooltip giải thích một chỉ số khi rê chuột', 'phụ'],
    ['Menu nút 3 chấm: Sửa / Nhân bản / Xóa', 'phụ'],
    ['Danh sách chọn nhanh của nút “Thêm” (Thêm việc / Thêm vòng lặp…)', 'phụ'],
    ['Bộ lọc nhanh xổ ra chỉ tick chọn, không có ô nhập', 'phụ'],
    ['Hộp thoại “Bạn có chắc muốn xóa?” chỉ có nút Đồng ý / Hủy', 'phụ'],
    ['Toast “Lưu thành công”, cảnh báo ngắn trên đầu trang', 'phụ'],
    ['Popup “Thêm nhân viên” có các ô nhập', 'chính'],
    ['Popup chọn đối tượng có ô tìm kiếm + danh sách + bộ lọc', 'chính'],
    ['Drawer / panel xem chi tiết đơn hàng bên phải', 'chính'],
    ['Wizard nhập khẩu 3 bước', 'chính (mỗi bước 1 màn)'],
    ['Tab “Lịch sử” trong màn chi tiết, nội dung khác hẳn tab chính', 'chính'],
    ['Bản mobile của một màn web đã có', 'chính'],
    ['Màn danh sách có sẵn, chỉ thêm 2 cột theo kiểu đã có', 'chính — độ phức tạp Rất đơn giản, không khai màn phụ'],
    ['Form có sẵn, bổ sung 1 ô nhập + đổi nhãn 2 trường', 'chính — độ phức tạp Rất đơn giản'],
  ],
  notes: [
    'Mỗi phần bật ra thiết kế riêng đếm 1 màn phụ; một màn chính có thể kèm nhiều màn phụ (VD popup Thêm nhân viên = 1 màn chính, combo Phòng ban trong đó = 1 màn phụ).',
    'Không tính phần copy nguyên từ thiết kế có sẵn (VD combo, toast dùng lại y hệt từ màn khác).',
    'Trạng thái của chính màn đó (hover, lỗi nhập, đang tải, danh sách rỗng) và các trường hợp nằm giữa: quy định chưa nêu rõ → PD khai theo thực tế đã thiết kế, PO quyết khi rà soát.',
  ],
}
export const MAIN_SCREEN_HINT = 'Màn có sẵn chỉ sửa / thêm 1–2 trường: vẫn đếm 1 màn chính, chọn độ phức tạp Rất đơn giản. Không tính màn copy từ thiết kế có sẵn. Màn dài > 3 lần chiều cao chuẩn: đếm theo số lượt cuộn. Logo: 3 / phương án. Tờ rơi: 1 / page.'
export const SUB_SCREEN_HINT  = 'Phần nhỏ bật ra trên màn chính, không có ô nhập: combo xổ ra, tooltip, menu nút 3 chấm / nút thêm, thông báo, cảnh báo, toast — mỗi màn tính 0,2 màn chính. Popup / form có nhập liệu → màn chính.'
export const COMPLETED_DATE_HINT = 'Ngày hoàn thành thiết kế sau khi sửa theo góp ý trong vòng lặp phân tích thiết kế.'

export const PLATFORMS = ['Web', 'Mobile']
export const YES_NO    = ['Có', 'Không']
export const OWN_PROJECT_HINT = 'Không (hỗ trợ dự án khác) được nhân hệ số 1,2.'

/* ── Mức độ hài lòng về chất lượng thiết kế và phối hợp ── */
export const QUALITY_RATINGS = [
  { value: 'Rất hài lòng',   color: 'success', note: 'Cộng thêm 10% điểm của PBI' },
  { value: 'Hài lòng',       color: 'brand',   note: 'Giữ nguyên điểm' },
  { value: 'Không hài lòng', color: 'danger',  note: 'Trừ 20% điểm của PBI' },
]
/** Thứ tự hiện tag “Mức đánh giá” ở các danh sách: mức cần chú ý trước (Rất hài lòng · Không hài lòng · Chưa đánh giá), Hài lòng (phổ biến) cuối */
export const RATING_DISPLAY_ORDER = ['Rất hài lòng', 'Không hài lòng', 'Chưa đánh giá', 'Hài lòng']
export const sortRatingKeys = keys => [...keys].sort((a, b) => (RATING_DISPLAY_ORDER.indexOf(a) + 1 || 99) - (RATING_DISPLAY_ORDER.indexOf(b) + 1 || 99))
/** Công việc mới mặc định “Hài lòng” — người đánh giá chọn lại sau nếu khác */
export const DEFAULT_RATING = 'Hài lòng'
/** Lý do đánh giá bắt buộc điền với các mức này */
export const REASON_REQUIRED = ['Không hài lòng', 'Rất hài lòng']

export const statusColor  = v => DESIGN_STATUSES.find(s => s.value === v)?.color ?? 'neutral'
export const qualityColor = v => QUALITY_RATINGS.find(s => s.value === v)?.color ?? 'neutral'
export const solutionCriteria   = v => SOLUTION_RULES.find(r => r.value === v)?.criteria ?? []
/** Gợi ý khi chọn độ phức tạp: chưa chọn → cây quyết định · đã chọn → dấu hiệu + ví dụ của mức đó */
export const complexityCriteria = v => {
  const r = COMPLEXITY_RULES.find(x => x.value === v)
  if (!r) return COMPLEXITY_STEPS.map((st, i) => `${i + 1}. ${st.q} → Không: ${st.no}${st.yes ? ` · Có: ${st.yes}` : ''}`)
  return [...r.criteria, `Ví dụ: ${r.examples.join('; ')}`]
}
export const complexityTip = v => { const r = COMPLEXITY_RULES.find(x => x.value === v); return r ? `${r.value}: ${r.summary}` : 'Chưa chọn → Điểm = 0. Chọn mức bằng cách trả lời lần lượt, dừng ở câu đầu tiên “Không”:' }

/* ── Cấu hình hệ số ── */
export const DEFAULT_CONFIG = {
  mainScreenPoint: 1,
  subScreenPoint:  0.2,
  complexity: { 'Rất đơn giản': 0.2, 'Đơn giản': 1, 'Trung bình': 1.2, 'Phức tạp': 1.5, 'Rất phức tạp': 1.8 },
  business:   { 'Bình thường': 1, 'Phức tạp': 1.1, 'Rất phức tạp': 1.2 },   // Hệ số nghiệp vụ
  platform:   { 'Web': 1, 'Mobile': 0.5 },
  solution:   { 'BA': 0.5, 'PD và BA': 1, 'PD': 1.5 },
  ownProject: { 'Có': 1, 'Không': 1.2 },
  rating:     { 'Rất hài lòng': 1.1, 'Hài lòng': 1, 'Không hài lòng': 0.8 },
  /** Điểm dẫn dắt của PD Lead: tỷ lệ trên Điểm sau đánh giá của việc PD mình quản lý — review (giao việc + review) · chốt giải pháp */
  lead:       { review: 0.1, solution: 0.2 },
  /** Chưa đánh giá: false = Điểm sau đánh giá bằng 0 · true = tính như Hài lòng */
  unratedCountsAsSatisfied: false,
  /** Trạng thái được tính điểm tháng (mặc định tất cả — chỉ lọc theo Ngày hoàn thành) */
  countedStatuses: DESIGN_STATUSES.map(s => s.value).filter(v => v !== 'Pending'),   // Pending (tạm dừng) không tính điểm
}
export const UNCONFIRMED_KEYS = []

const round3 = n => Math.round(n * 1000) / 1000

/** Số màn hình quy đổi = màn chính × điểm màn chính + màn phụ × điểm màn phụ */
export function screenUnits(task, cfg) {
  return (Number(task.mainScreens) || 0) * cfg.mainScreenPoint + (Number(task.subScreens) || 0) * cfg.subScreenPoint
}

/** Có điểm nhập tay (việc không đếm được màn hình: nghiên cứu, khảo sát…) */
export const hasManualScore = task => task.manualScore !== '' && task.manualScore != null && !isNaN(Number(task.manualScore))

/** Điểm (trước đánh giá) = số màn × độ phức tạp thiết kế × người đưa giải pháp × dự án × nền tảng × hệ số nghiệp vụ. Thiếu độ phức tạp / người đưa giải pháp / dự án phụ trách / nền tảng → 0 */
export function computeScore(task, cfg) {
  if (hasManualScore(task)) return round3(Number(task.manualScore))
  const k = [
    cfg.complexity[task.complexity], solutionFactor(task, cfg),
    cfg.ownProject[task.isOwnProject], cfg.platform[task.platform],
  ]
  if (k.some(v => v == null)) return 0
  return round3(screenUnits(task, cfg) * k.reduce((a, b) => a * b, 1) * businessFactor(task, cfg))
}
/** Hệ số người đưa giải pháp — Lead chốt giải pháp: PD không bị trừ, tính tối thiểu như “PD và BA” (kể cả chưa chọn người đưa giải pháp) */
export function solutionFactor(task, cfg) {
  const f = cfg.solution[task.solutionBy]
  if (!isLeadSolution(task)) return f
  return Math.max(f ?? 0, cfg.solution['PD và BA'] ?? 1)
}
/** Vai trò của Lead trong việc: '' không tham gia (mặc định — VD PO giao thẳng cho PD) · 'review' giao việc & review · 'solution' chốt giải pháp.
    Dữ liệu cũ: leadSolution = 'Có' → chốt giải pháp */
export const leadRoleOf = task => (['review', 'solution'].includes(task?.leadRole) ? task.leadRole : task?.leadSolution === 'Có' ? 'solution' : '')
export const isLeadSolution = task => leadRoleOf(task) === 'solution'
/** Hệ số nghiệp vụ — bỏ trống / cấu hình cũ chưa có → Bình thường (× 1) */
export function businessFactor(task, cfg) {
  const b = cfg.business ?? DEFAULT_CONFIG.business
  return b[task.businessLevel || DEFAULT_BUSINESS] ?? 1
}

/** Hệ số đánh giá — chưa đánh giá → 0 (hoặc 1 nếu cấu hình cho phép) */
export function ratingFactor(task, cfg) {
  if (!task.qualityRating) return cfg.unratedCountsAsSatisfied ? 1 : 0
  return cfg.rating[task.qualityRating] ?? 0
}

/** Điểm sau đánh giá */
export function computeFinalScore(task, cfg) {
  // Điểm nhập tay = điểm sau đánh giá (không áp hệ số đánh giá)
  if (hasManualScore(task)) return round3(Number(task.manualScore))
  return round3(computeScore(task, cfg) * ratingFactor(task, cfg))
}

/* ── Trường bắt buộc để có điểm ── */
export const SCORE_FIELD_LABELS = {
  solutionBy: 'Người đưa giải pháp', complexity: 'Độ phức tạp thiết kế', platform: 'Nền tảng', isOwnProject: 'Là dự án phụ trách',
  screens: 'Số lượng màn hình', qualityRating: 'Mức hài lòng', completedDate: 'Ngày hoàn thành',
}
export const SCORE_FIELD_EFFECT = {
  solutionBy: 'Điểm = 0', complexity: 'Điểm = 0', platform: 'Điểm = 0', isOwnProject: 'Điểm = 0',
  screens: 'Điểm = 0', qualityRating: 'Điểm sau đánh giá = 0', completedDate: 'Chưa được tính vào tháng nào',
}
/** Các trường còn thiếu khiến công việc chưa có điểm / chưa được tính vào tháng (có Điểm nhập tay → chỉ cần Ngày hoàn thành) */
export function missingScoreFields(task, cfg) {
  const m = []
  if (!hasManualScore(task)) {
    for (const k of ['solutionBy', 'complexity', 'platform', 'isOwnProject']) if (!task[k] && !(k === 'solutionBy' && isLeadSolution(task))) m.push(k)
    if (!(Number(task.mainScreens) > 0 || Number(task.subScreens) > 0)) m.push('screens')
    if (!task.qualityRating && !cfg.unratedCountsAsSatisfied) m.push('qualityRating')
  }
  if (!task.completedDate) m.push('completedDate')
  return m
}

/** Công việc có được tính điểm cho tháng `ym` (YYYY-MM) không */
export function countsInMonth(task, ym, cfg) {
  return !!task.completedDate
    && task.completedDate.slice(0, 7) === ym
    && cfg.countedStatuses.includes(task.designStatus)
}

/** Số ngày làm việc của tháng = NETWORKDAYS(đầu tháng, cuối tháng) − số ngày nghỉ lễ */
export function workingDaysOf(ym, holidays = 0) {
  const [y, m] = ym.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  let n = 0
  for (let d = 1; d <= last; d++) { const w = new Date(y, m - 1, d).getDay(); if (w !== 0 && w !== 6) n++ }
  return n - (Number(holidays) || 0)
}

/** Điểm kỳ vọng theo effort và ngày làm việc = Effort% × Điểm kỳ vọng level × Ngày làm thực tế / Ngày làm việc của tháng */
export function expectedScore({ target, effort, actualDays }, monthDays) {
  if (!monthDays) return 0
  return (Number(effort) || 0) * (Number(target) || 0) * (Number(actualDays) || 0) / monthDays / 100
}
/** Tỷ lệ đạt (%) = ROUND(Điểm / Điểm kỳ vọng × 100) */
export const achievementRate = (score, expected) => (expected ? Math.round(score / expected * 100) : null)

export const round = round3

export function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}
export function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = n => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}
export const monthLabelOf = ym => `${ym.slice(5)}/${ym.slice(0, 4)}`

/** Tên hiển thị các trường của công việc (dùng cho lịch sử, nhập file) */
export const FIELD_LABELS = {
  content: 'Nội dung', designLink: 'Link thiết kế', designStatus: 'Trạng thái thiết kế',
  solutionBy: 'Người đưa giải pháp', devmodeLink: 'Link devmode', concept: 'Concept', solutionBrief: 'Mô tả giải pháp sơ bộ',
  pbi: 'PBI', pdId: 'PD', baId: 'BA', expectedDate: 'Deadline thiết kế', completedDate: 'Ngày hoàn thành (PD)',
  complexity: 'Độ phức tạp thiết kế', businessLevel: 'Hệ số nghiệp vụ', mainScreens: 'Số lượng màn hình chính', subScreens: 'Số lượng màn hình phụ',
  isOwnProject: 'Là dự án phụ trách', platform: 'Nền tảng',
  qualityRating: 'Đánh giá chất lượng thiết kế và phối hợp của PD', ratingReason: 'Lý do đánh giá',
  manualScore: 'Điểm nhập tay', moreLinks: 'Link thiết kế khác', leadRole: 'Vai trò của Lead', leadSolution: 'Lead chốt giải pháp',
  stage: 'Loại việc', baStatus: 'Trạng thái phân tích', baPoint: 'BA Point', baDeadline: 'Deadline phân tích',
  baCompletedDate: 'Ngày hoàn thành (BA)', baExempt: 'Miễn trừ trễ', baExemptReason: 'Lý do miễn trừ', baQuality: 'Kết quả chất lượng BA',
  iterationId: 'Vòng lặp',
}
export const TASK_FIELDS = Object.keys(FIELD_LABELS).filter(f => f !== 'iterationId')

/* ═══ BẢN CHỐT ĐIỂM (dùng chung app + máy chủ) ═══════════════════════════ */
/** Thông số của PD trong tháng — mặc định: làm đủ ngày, effort 100%, kỳ vọng theo level của PD */
export function personParams(ym, monthEntry, user) {
  const wd = workingDaysOf(ym, monthEntry?.holidays ?? 0)
  return { actualDays: wd, effort: 100, target: Number(user?.target) || 0, ...(monthEntry?.people?.[user?.id] ?? {}) }
}
export function closingParams(ym, monthEntry, user) {
  const holidays = monthEntry?.holidays ?? 0
  return { holidays, workingDays: workingDaysOf(ym, holidays), person: personParams(ym, monthEntry, user) }
}
/** Chụp bảng điểm tháng ym của 1 PD theo hệ số + thông số hiện tại */
export function buildClosing(ym, pdId, tasks, config, userId, params, at = new Date().toISOString(), team = null) {
  const items = tasks
    .filter(t => t.pdId === pdId && countsInMonth(t, ym, config))
    .map(t => ({
      taskId: t.id, pdId: t.pdId, baId: t.baId, projectId: t.projectId, iterationId: t.iterationId, pbi: t.pbi,
      content: t.content, completedDate: t.completedDate, complexity: t.complexity, businessLevel: t.businessLevel || DEFAULT_BUSINESS, platform: t.platform,
      solutionBy: t.solutionBy, leadRole: leadRoleOf(t), mainScreens: t.mainScreens, subScreens: t.subScreens,
      qualityRating: t.qualityRating, score: computeScore(t, config), final: computeFinalScore(t, config),
    }))
  // Điểm dẫn dắt (PD Lead): chụp luôn các việc của PD mình quản lý — cần users + closings để tính
  const leadItems = team ? leadItemsOf(ym, pdId, { tasks, config, ...team }) : []
  return { id: `${ym}:${pdId}`, month: ym, pdId, closedAt: at, closedBy: userId, items, leadItems, config: JSON.parse(JSON.stringify(config)), params }
}

/* ═══ ĐIỂM DẪN DẮT — PD LEAD (dùng chung app + máy chủ) ═══════════════════
   Lead của 1 PD = quản lý trực tiếp của PD đó và thuộc BỘ PHẬN PD (PO / Quản trị đứng tên quản lý không được tính).
   Mỗi việc được tính điểm của PD trong tháng → Lead nhận Điểm sau đánh giá × tỷ lệ (review 10% · chốt giải pháp 20%);
   PD có nhiều Lead → chia đều. Điểm tháng của Lead = điểm tự vẽ + điểm dẫn dắt. */
export const LEAD_KINDS = { '': 'Không tham gia', review: 'Giao việc & review', solution: 'Chốt giải pháp' }
export const LEAD_ROLE_OPTIONS = [
  { value: '',         label: 'Không tham gia',      description: 'Lead không giao / review việc này (VD PO giao thẳng cho PD) — Lead không được điểm' },
  { value: 'review',   label: 'Giao việc & review',  description: 'Lead giao việc và review thiết kế' },
  { value: 'solution', label: 'Chốt giải pháp',      description: 'Lead quyết hướng giải pháp, PD vẽ theo — PD không bị trừ hệ số người đưa giải pháp' },
]
export const leadRates = cfg => ({ ...DEFAULT_CONFIG.lead, ...(cfg?.lead ?? {}) })
/** Các Lead (người dùng) của 1 PD */
export const leadsOf = (pd, users) => managerIdsOf(pd)
  .filter(id => id !== pd?.id)
  .map(id => users.find(u => u.id === id))
  .filter(u => u && isPdRole(u.role))
/** PD mà người này là Lead */
export const teamOf = (leadId, users) => users.filter(u => u.id !== leadId && leadsOf(u, users).some(l => l.id === leadId))
/** Việc của 1 PD được tính trong tháng: theo bản chốt của PD nếu đã chốt, không thì tính từ công việc */
function pdItemsOf(ym, pdId, { tasks, closings, config }) {
  const c = (closings ?? []).find(x => x.month === ym && (x.pdId === pdId || !x.pdId))
  if (c) return (c.items ?? []).filter(i => i.pdId === pdId)
  return tasks.filter(t => t.pdId === pdId && countsInMonth(t, ym, config))
    .map(t => ({ taskId: t.id, pdId, projectId: t.projectId, pbi: t.pbi, content: t.content, completedDate: t.completedDate,
      leadRole: leadRoleOf(t), qualityRating: t.qualityRating, final: computeFinalScore(t, config) }))
}
/** Danh sách việc tính điểm dẫn dắt của Lead trong tháng ym — all: kèm cả việc Lead không tham gia (điểm 0, để chọn vai trò) */
export function leadItemsOf(ym, leadId, { tasks, users, closings, config }, all = false) {
  const r = leadRates(config), out = []
  for (const pd of teamOf(leadId, users ?? [])) {
    const share = 1 / leadsOf(pd, users).length
    for (const i of pdItemsOf(ym, pd.id, { tasks, closings, config })) {
      const kind = leadRoleOf(i), rate = kind ? Number(r[kind]) || 0 : 0
      if (!kind && !all) continue
      out.push({ taskId: i.taskId, pdId: pd.id, projectId: i.projectId, pbi: i.pbi, content: i.content, completedDate: i.completedDate,
        qualityRating: i.qualityRating, final: Number(i.final) || 0, kind, rate, share, point: round3((Number(i.final) || 0) * rate * share) })
    }
  }
  return out
}
/** Tổng điểm dẫn dắt — cộng trên giá trị chưa làm tròn từng dòng (khớp đúng tổng hợp của máy chủ) */
export const leadTotalOf = items => round3((items ?? []).reduce((a, i) => a + (i.rate != null ? (Number(i.final) || 0) * i.rate * (i.share ?? 1) : Number(i.point) || 0), 0))

/* ═══ DANH MỤC KHỐI DỰ ÁN (mặc định — Quản trị sửa ở Cài đặt hệ thống) ═══ */
export const DEFAULT_DIVISIONS = [
  'Ban Công nghệ', 'Ban Công nghệ thông tin', 'Khối sản phẩm Doanh nghiệp', 'Khối sản phẩm Hành chính sự nghiệp',
  'Khối sản phẩm Bán lẻ', 'Khối nền tảng Giáo dục', 'Khối nền tảng Kế toán dịch vụ', 'Khối nền tảng Thị trường nước ngoài',
  'Khối thị trường khách hàng cá nhân',
].map((name, i) => ({ id: 'dv' + (i + 1), name }))

/* ═══ DANH MỤC KHỐI DẠNG CÂY (cha › con, nhiều cấp) — item: { id, name, parentId? } ═══ */
/** Đường dẫn đầy đủ “Khối › Nhóm › …” của 1 mục ('' nếu không có) */
export function divisionPathOf(list, id, sep = ' › ') {
  const byId = new Map((list ?? []).map(d => [d.id, d])), names = [], seen = new Set()
  for (let d = byId.get(id); d && !seen.has(d.id); d = byId.get(d.parentId)) { seen.add(d.id); names.unshift(d.name) }
  return names.join(sep)
}
/** Mục + mọi mục con cháu (lọc theo khối cha → gồm cả dự án của khối con) */
export function divisionDescendantIds(list, id) {
  const out = new Set(id ? [id] : [])
  let grew = true
  while (grew) { grew = false; for (const d of list ?? []) if (d.parentId && out.has(d.parentId) && !out.has(d.id)) { out.add(d.id); grew = true } }
  return out
}
/** Duyệt cây cha trước con (giữ thứ tự nhập) → [{ ...item, depth }] — mục có cha không tồn tại coi như gốc */
export function divisionTree(list) {
  const items = list ?? [], ids = new Set(items.map(d => d.id)), out = [], seen = new Set()
  const walk = (parent, depth) => items.filter(d => (parent ? d.parentId === parent : !d.parentId || !ids.has(d.parentId)))
    .forEach(d => { if (seen.has(d.id)) return; seen.add(d.id); out.push({ ...d, depth }); walk(d.id, depth + 1) })
  walk(null, 0)
  return out
}

/** Dự án PD đang tham gia (lưu kèm bản chốt — giữ đúng tại thời điểm chốt) */
export const pdProjectsOf = (projects, pdId) => projects
  .filter(p => p.memberIds?.includes(pdId))
  .map(p => ({ id: p.id, code: p.code, name: p.name }))
  .sort((a, b) => String(a.code || a.name).localeCompare(String(b.code || b.name), 'vi'))

/** Tổng hợp điểm tháng của 1 PD (bản chốt nếu đã chốt, không thì tính từ công việc) — dùng cho Chốt điểm */
export function pdMonthSummary(ym, pdId, tasks, closing, config) {
  const list = closing
    ? (closing.items ?? []).filter(i => i.pdId === pdId)
    : tasks.filter(t => t.pdId === pdId && countsInMonth(t, ym, config)).map(t => ({ ...t, final: computeFinalScore(t, config) }))
  return {
    final: Math.round(list.reduce((a, t) => a + (Number(t.final) || 0), 0) * 1000) / 1000,
    pbis: list.length,
    unrated: list.filter(t => !t.qualityRating).length,
    noReason: closing ? 0 : list.filter(t => reasonMissing(t)).length,
  }
}

/* ═══ VAI TRÒ TRONG DỰ ÁN (dùng chung app + máy chủ) ═══════════════════════
   project.memberRoles = { [userId]: 'manager' | 'member' | 'viewer' }
   Chưa đặt → PO là Quản trị, người khác là Thành viên (dữ liệu cũ). */
/** Vai trò hệ thống */
export const ROLES = [
  { value: 'admin', label: 'Quản trị hệ thống',    description: 'Toàn quyền cả PD và BA: người dùng, mọi dự án, quy tắc chấm điểm, cài đặt; chốt / mở chốt điểm của mọi người' },
  { value: 'HRBP',  label: 'HRBP (xem toàn bộ)',  description: 'Xem MỌI dự án, công việc và điểm PD / BA của tất cả thành viên (Tổng quan, Tổng hợp điểm, báo cáo) — không thêm / sửa / xóa / chốt gì' },
  { value: 'QA',    label: 'QA (chỉ xem)',        description: 'Chỉ xem các dự án được gán (Dự án tham gia) và thành viên trong các dự án đó — không thêm / sửa / xóa / chốt gì' },
  { value: 'PO',    label: 'PO',                  description: 'Tạo dự án và là Quản trị của dự án mình tạo: tạo vòng lặp, giao việc, sửa mọi công việc, đánh giá' },
  { value: 'PDL',   label: 'PD Lead',             description: 'Như PO nhưng chỉ phía PD: tạo dự án, quản trị dự án (vòng lặp, thành viên, giao việc, xóa việc), sửa phần thiết kế, đánh giá mức hài lòng việc của PD; được chấm điểm như PD + điểm dẫn dắt PD mình quản lý; không xem phần / điểm BA' },
  { value: 'BA',    label: 'BA',                  description: 'Cập nhật nghiệp vụ và đánh giá chất lượng PD trên công việc mình phụ trách' },
  { value: 'PD',    label: 'PD (UI/UX Designer)', description: 'Thực hiện thiết kế, cập nhật thông tin thiết kế trên công việc của mình; được tính điểm hằng tháng' },
]
/* ═══ QUẢN TRỊ BỘ PHẬN (user.deptAdmin) — gán thêm cho người dùng (không đổi bộ phận / vai trò) ═══
   PD | BA: xem MỌI dự án, công việc; tạo / sửa dự án, vòng lặp, thêm / xóa công việc ở mọi dự án (như Quản trị dự án)
   nhưng chỉ sửa TRƯỜNG CỦA BỘ PHẬN MÌNH; xem điểm, báo cáo, chốt / mở chốt điểm của TOÀN BỘ người thuộc bộ phận mình;
   sửa hệ số chấm điểm của bộ phận mình; sửa / mời người dùng thuộc bộ phận mình. Không xem điểm của bộ phận kia (trừ dự án mình thật sự tham gia). */
export const DEPT_ADMINS = [
  { value: '',   label: 'Không' },
  { value: 'PD', label: 'Quản trị PD', description: 'Xem mọi dự án; tạo dự án, vòng lặp, thêm việc; sửa phần thiết kế; xem & chốt điểm mọi PD; sửa hệ số PD; sửa / mời người dùng bộ phận PD' },
  { value: 'BA', label: 'Quản trị BA', description: 'Xem mọi dự án; tạo dự án, vòng lặp, thêm việc; sửa phần phân tích; xem & chốt điểm mọi BA; sửa hệ số BA; sửa / mời người dùng bộ phận BA' },
]
/** Ô “Bộ phận / vai trò” (mời / sửa người dùng): Quản trị PD / BA chọn thẳng ở đây = bộ phận PD / BA + deptAdmin. Giá trị 'PD@admin' | 'BA@admin' */
export const ROLE_CHOICES = [
  ROLES[0],
  { value: 'PD@admin', label: 'Quản trị PD', description: 'Bộ phận PD + quản trị toàn bộ PD: xem mọi dự án; tạo dự án, vòng lặp, thêm việc; sửa phần thiết kế; xem & chốt điểm mọi PD; sửa hệ số PD; sửa / mời người dùng bộ phận PD' },
  { value: 'BA@admin', label: 'Quản trị BA', description: 'Bộ phận BA + quản trị toàn bộ BA: xem mọi dự án; tạo dự án, vòng lặp, thêm việc; sửa phần phân tích; xem & chốt điểm mọi BA; sửa hệ số BA; sửa / mời người dùng bộ phận BA' },
  ...ROLES.slice(1),
]
/** Giá trị ô vai trò ↔ (role, deptAdmin) */
export const roleChoiceOf = u => (u?.deptAdmin && u.role === u.deptAdmin ? `${u.role}@admin` : u?.role ?? '')
/** 'PD' | 'BA' | '' — Quản trị hệ thống / QA không cần (đã toàn quyền / chỉ xem) */
/** HRBP: xem toàn bộ dự án, công việc, điểm của mọi người — chỉ xem, không sửa / chốt */
export const isHrbp = u => u?.role === 'HRBP'
export const deptAdminOf = u => (u && !['admin', 'QA', 'HRBP'].includes(u.role) && ['PD', 'BA'].includes(u.deptAdmin) ? u.deptAdmin : '')
/** Trường Quản trị bộ phận được sửa ở dự án mình không phải Quản trị thật (trường chung + phần của bộ phận) */
export const DEPT_FIELDS = {
  // PD: phần thiết kế + thông số chấm điểm PD (mức hài lòng là BA / PO / PD Lead của PD đánh giá — quyền riêng canRateAsLead, không gồm ở đây)
  PD: ['pbi', 'content', 'stage', 'pdId', 'designLink', 'designStatus', 'devmodeLink', 'moreLinks', 'completedDate', 'expectedDate', 'mainScreens', 'subScreens',
       'platform', 'isOwnProject', 'complexity', 'businessLevel', 'solutionBy', 'concept', 'solutionBrief', 'manualScore', 'leadRole', 'leadSolution'],
  // BA: phần phân tích + nhóm trường BA của việc (giải pháp, độ phức tạp, đánh giá chất lượng thiết kế…) như BA thường của việc
  BA: ['pbi', 'content', 'stage', 'baId', 'solutionBy', 'concept', 'solutionBrief', 'complexity', 'businessLevel', 'qualityRating', 'ratingReason', ...BA_PHASE_FIELDS],
}
export const PROJECT_ROLES = [
  { value: 'manager', label: 'Quản trị',   color: 'brand',   hint: 'Xem và sửa mọi công việc; tạo vòng lặp, giao việc, sửa thông tin & thành viên dự án' },
  { value: 'member',  label: 'Thành viên', color: 'success', hint: 'Xem công việc của mọi người, thêm việc mới, chỉ cập nhật công việc của mình (PD: nhóm thiết kế · BA: nghiệp vụ + đánh giá) · việc do mình thêm thì sửa thoải mái thông tin (tên, PD / BA, link…)' },
  { value: 'viewer',  label: 'Hạn chế',    color: 'neutral', hint: 'Chỉ xem công việc, không thêm hay cập nhật được gì' },
].map(r => ({ ...r, description: r.hint }))   // description: dòng mô tả dưới mỗi lựa chọn trong combobox
export const defaultProjectRole = user => (['PO', 'PDL'].includes(user?.role) ? 'manager' : 'member')
/** Role thuộc bộ phận PD: PD + PD Lead */
export const isPdRole = role => role === 'PD' || role === 'PDL'
export const deptOfRole = role => (isPdRole(role) ? 'PD' : role === 'BA' ? 'BA' : '')
/** Phạm vi trường được sửa khi là Quản trị dự án mà không phải Quản trị thật: Quản trị bộ phận · PD Lead (chỉ phần PD) */
export const fieldScopeOf = u => deptAdminOf(u) || (u?.role === 'PDL' ? 'PD' : '')
/** Vai trò của user trong dự án; null = không phải thành viên */
export function projectRoleOf(project, user) {
  if (!project || !user || !project.memberIds?.includes(user.id)) return null
  return project.memberRoles?.[user.id] ?? defaultProjectRole(user)
}

/* ═══ QUẢN LÝ TRỰC TIẾP & DỰ ÁN PHỤ TRÁCH (dùng chung app + máy chủ) ═══════
   user.managerIds        = [userId…]    — nhiều quản lý; quản lý được theo dõi + chốt điểm người này
   user.primaryProjectIds = [projectId…] — phụ trách nhiều dự án (gợi ý cột "Là dự án phụ trách")
   Dữ liệu cũ: leadId / primaryProjectId (1 giá trị) vẫn đọc được. */
export const managerIdsOf = u => (Array.isArray(u?.managerIds) ? u.managerIds : (u?.leadId ? [u.leadId] : []))
export const primaryProjectIdsOf = u => (Array.isArray(u?.primaryProjectIds) ? u.primaryProjectIds : (u?.primaryProjectId ? [u.primaryProjectId] : []))

/* ═══ LINK DEVMODE — tự sinh từ Link thiết kế ═══════════════════════════════
   Thêm query m=dev: chưa có "?" → "?m=dev", có rồi → "&m=dev" (đã có m=… → đổi thành m=dev). */
export function devmodeLinkOf(designLink) {
  const s = String(designLink ?? '').trim()
  if (!s) return ''
  const hashAt = s.indexOf('#')
  const base = hashAt >= 0 ? s.slice(0, hashAt) : s, hash = hashAt >= 0 ? s.slice(hashAt) : ''
  if (/[?&]m=dev(&|$)/.test(base)) return s
  if (/[?&]m=[^&]*/.test(base)) return base.replace(/([?&])m=[^&]*/, '$1m=dev') + hash
  return base + (base.includes('?') ? '&' : '?') + 'm=dev' + hash
}
/** Link devmode mới khi đổi Link thiết kế: chỉ tự điền nếu devmode đang trống hoặc là bản tự sinh từ link cũ */
export function autoDevmodeLink(oldDesign, newDesign, currentDevmode) {
  const cur = String(currentDevmode ?? '').trim()
  return !cur || cur === devmodeLinkOf(oldDesign) ? devmodeLinkOf(newDesign) : null   // null = giữ nguyên
}

/** Link thiết kế thêm (ngoài link chính designLink / devmodeLink): [{ design, devmode }] — chuẩn hóa, bỏ dòng trống, tối đa 20 */
export const cleanLinks = v => (Array.isArray(v) ? v : [])
  .map(x => ({ design: String(x?.design ?? '').trim(), devmode: String(x?.devmode ?? '').trim() }))
  .filter(x => x.design || x.devmode).slice(0, 20)
/** So sánh giá trị trường (mảng / object so theo nội dung) */
export const sameValue = (a, b) => (typeof a === 'object' || typeof b === 'object')
  ? JSON.stringify(a ?? '') === JSON.stringify(b ?? '') : String(a ?? '') === String(b ?? '')

/** Đánh giá Rất hài lòng / Không hài lòng nhưng chưa có lý do (bắt buộc) */
export const reasonMissing = t => REASON_REQUIRED.includes(t?.qualityRating) && !String(t?.ratingReason ?? '').trim()

/* ── Quy trình + câu hỏi thường gặp ── */
const nv = v => String(v).replace('.', ',')
/** Quy trình chấm điểm (khối đầu trang Quy tắc + trợ lý AVA) */
export const SCORING_FLOW = [
  { icon: 'calendar',     color: 'var(--chart-c1)', title: 'Tạo vòng lặp',          who: 'Quản trị dự án',     desc: 'Đặt khoảng ngày, chuyển việc chưa xong từ vòng trước' },
  { icon: 'plus',         color: 'var(--chart-c5)', title: 'Thêm công việc',        who: 'Quản trị · Thành viên', desc: 'Thêm, nhập nhanh hoặc nhập Excel; giao PD, BA, thời hạn' },
  { icon: 'pencil',       color: 'var(--chart-c6)', title: 'Thiết kế & cập nhật',   who: 'PD',                 desc: 'Trạng thái, link thiết kế, số màn hình, độ phức tạp thiết kế, hệ số nghiệp vụ' },
  { icon: 'circle-check', color: 'var(--chart-c2)', title: 'Hoàn thành & đánh giá', who: 'PD · BA / PO / Lead', desc: 'Điền ngày hoàn thành, đánh giá mức hài lòng (BA / PO / PD Lead) → có điểm' },
  { icon: 'lock',         color: 'var(--chart-c3)', title: 'Chốt điểm cuối tháng',  who: 'Quản lý trực tiếp',  desc: 'Chốt việc xong trong tháng; nhập ngày làm, effort' },
  { icon: 'chart-bar',    color: 'var(--bg-brand)', title: 'Xem kết quả',           who: 'Mọi người',          desc: 'Điểm, điểm kỳ vọng, tỷ lệ đạt ở Tổng quan' },
]

/** Câu hỏi thường gặp — hướng dẫn người chấm / người đánh giá; hệ số lấy theo cấu hình hiện tại (trang Quy tắc + trợ lý AVA dùng chung) */
const pv = v => String(Math.round((Number(v) || 0) * 1000) / 10).replace('.', ',') + '%'
export const scoringFaqs = cfg => [
  { q: 'PD Lead có được đánh giá mức hài lòng không?',
    a: ['Có — PD Lead đánh giá Mức hài lòng (kèm Lý do) cho việc của PD mình quản lý trực tiếp, kể cả không là thành viên dự án, và mọi việc ở dự án mình là Quản trị. Việc Lead tự vẽ: hiện TẠM THỜI Lead được tự cập nhật mức hài lòng (PO / BA vẫn đánh giá được như thường).'] },
  { q: 'PD Lead chuyên giao việc, review, chốt giải pháp (ít tự vẽ) thì chấm điểm thế nào?',
    a: [`Điểm tháng của Lead = điểm việc tự vẽ (chấm như PD thường) + Điểm dẫn dắt. Điểm dẫn dắt = Σ Điểm sau đánh giá của các việc PD mình quản lý trực tiếp có Ngày hoàn thành trong tháng × tỷ lệ theo “Vai trò của Lead” của từng việc: Không tham gia → 0 (mặc định, VD PO giao thẳng cho PD) · Giao việc & review → ${pv(leadRates(cfg).review)} · Chốt giải pháp → ${pv(leadRates(cfg).solution)}; PD có nhiều Lead thì chia đều.`,
        'Lead = quản lý trực tiếp của PD (Người dùng → Quản lý trực tiếp) và thuộc bộ phận PD — PO / Quản trị đứng tên quản lý không được tính. Lead tự chọn vai trò ở ô “Vai trò của Lead” trong chi tiết công việc, hoặc chọn hàng loạt ở Tổng hợp điểm → bấm tên mình → tab Dẫn dắt → tick việc → Đặt vai trò.',
        'Lead chốt giải pháp thì PD vẽ theo không bị trừ: hệ số Người đưa giải pháp của PD tính tối thiểu như “PD và BA”. Việc chất lượng kém (Không hài lòng) thì điểm Lead cũng giảm theo.',
        'Việc quản lý không quy ra điểm (họp, kèm người mới…) → người chốt giảm Effort (%) của Lead để điểm kỳ vọng tương ứng. Xem chi tiết ở Tổng hợp điểm → bấm tên Lead → tab Dẫn dắt.'] },
  { q: 'PD làm việc phát sinh không nằm trong quy tắc chấm điểm (nghiên cứu, khảo sát, workshop, hỗ trợ demo, review…) thì chấm thế nào?',
    a: ['Dùng “Điểm nhập tay”: tạo công việc như bình thường, ghi rõ nội dung việc, điền Ngày hoàn thành; PO / Quản trị dự án (hoặc Quản trị PD) nhập số điểm vào ô “Điểm nhập tay” ở phần Tính điểm trong chi tiết công việc.',
        'Có Điểm nhập tay → bỏ qua công thức số màn hình và mọi hệ số (kể cả mức hài lòng); số đó chính là Điểm sau đánh giá, cộng vào tháng của Ngày hoàn thành. Không cần điền số màn hình, độ phức tạp, người đưa giải pháp.',
        'PD không tự nhập được Điểm nhập tay — thống nhất mức điểm với PO rồi PO nhập. Xóa Điểm nhập tay → việc quay lại tính theo công thức.'] },
  { q: 'BA / PO đổi yêu cầu sau khi PD đã thiết kế xong thì phần sửa chấm thế nào?',
    a: ['Tách phần sửa thành một công việc mới (cùng hoặc khác vòng lặp), đếm số màn hình theo phần phải sửa và chấm như công việc bình thường. Không cộng dồn vào công việc cũ.',
        'Sửa do PD tự làm sai / làm thiếu thì không tạo công việc mới.'] },
  { q: 'Công việc bị hủy giữa chừng thì có được tính điểm không?',
    a: ['Có — vẫn coi như đã hoàn thành (done): chọn trạng thái đã thiết kế, điền Ngày hoàn thành và số màn hình PD đã thiết kế, chấm như công việc bình thường.'] },
  { q: 'Công việc trễ hạn thì đánh giá mức hài lòng thế nào?',
    a: ['Trễ hạn = Ngày hoàn thành sau Deadline thiết kế. Người đánh giá chọn Mức hài lòng “Không hài lòng” và ghi lý do “Trễ hạn” (kèm thời hạn và ngày hoàn thành thực tế).',
        `Hệ số Không hài lòng hiện tại: × ${nv(cfg.rating['Không hài lòng'])}.`] },
  { q: 'Nghiệp vụ rất phức tạp nhưng giao diện chỉ đơn giản thì chọn thế nào?',
    a: [`Độ phức tạp thiết kế chọn theo phần giao diện PD phải vẽ (VD Đơn giản × ${String(cfg.complexity?.['Đơn giản'] ?? 1).replace('.', ',')}), còn độ khó nghiệp vụ chọn ở Hệ số nghiệp vụ (Rất phức tạp × ${String((cfg.business ?? DEFAULT_CONFIG.business)['Rất phức tạp']).replace('.', ',')}).`, 'Áp dụng từ tháng 11/2026; việc khai trước đó giữ nguyên mức cũ, điểm không đổi.'] },
  { q: 'Yêu cầu BA đã lên giải pháp và có sẵn Google AI Studio thì chọn độ phức tạp nào?',
    a: ['Chọn độ phức tạp “Trung bình”.'] },
  { q: 'Việc không đếm được màn hình (nghiên cứu, khảo sát, phỏng vấn người dùng…) chấm thế nào?',
    a: ['PO nhập Điểm nhập tay — có giá trị thì bỏ qua công thức, đây chính là Điểm sau đánh giá (không nhân hệ số mức hài lòng). Chỉ cần thêm Ngày hoàn thành để tính vào tháng.'] },
  { q: 'PD hỗ trợ thiết kế cho dự án không phải dự án mình phụ trách thì chọn gì?',
    a: [`Chọn “Là dự án phụ trách” = Không → hệ số × ${nv(cfg.ownProject['Không'])} (dự án phụ trách: × ${nv(cfg.ownProject['Có'])}). Dự án phụ trách của PD được đặt ở Người dùng → Dự án tham gia.`] },
  { q: 'Màn hình rất dài (Website, Tổng quan…) đếm thế nào?',
    a: ['Màn dài quá 3 lần chiều cao màn thiết kế chuẩn mà thiết kế mới: số màn hình chính = số lượt cuộn theo chiều cao màn thiết kế chuẩn.'] },
  { q: 'Chưa đánh giá mức hài lòng thì điểm ra sao?',
    a: [cfg.unratedCountsAsSatisfied ? 'Hiện đang tính như Hài lòng (giữ nguyên điểm).' : 'Điểm sau đánh giá = 0 cho tới khi được đánh giá — nhớ đánh giá trước khi chốt điểm tháng.'] },
  { q: 'Điểm của công việc được tính vào tháng nào? Sửa được sau khi chốt không?',
    a: ['Tính vào tháng của Ngày hoàn thành. Sau khi quản lý trực tiếp chốt điểm tháng của PD, các công việc đó bị khóa; muốn sửa phải mở chốt ở màn Tổng hợp điểm rồi chốt lại.'] },
]

/* ── Điểm BA của 1 công việc (giai đoạn Phân tích) — Điểm thực nhận theo trang Quy tắc BA ── */
export function baScoreOf(t, config) {
  if (!hasAnalysis(t)) return null
  return baWorkItemScore({
    point: t.baPoint, done: !!t.baCompletedDate, quality: t.baQuality,
    onTime: baOnTime({ deadline: t.baDeadline, completedDate: t.baCompletedDate, exempt: t.baExempt === 'Có' }),
  }, config?.ba)
}
/** Trường giai đoạn Phân tích còn thiếu để có Điểm thực nhận */
export const BA_FIELD_LABELS = { baPoint: 'BA Point', baDeadline: 'Deadline phân tích', baCompletedDate: 'Ngày hoàn thành (BA)', baQuality: 'Kết quả chất lượng', baExempt: 'Miễn trừ trễ', baExemptReason: 'Lý do miễn trừ', baStatus: 'Trạng thái phân tích' }
export function missingBaFields(t) {
  if (!hasAnalysis(t)) return []
  const m = []
  if (!(Number(t.baPoint) > 0)) m.push('baPoint')
  if (!t.baDeadline) m.push('baDeadline')
  if (!t.baCompletedDate) m.push('baCompletedDate')
  if (!t.baQuality || t.baQuality === BA_UNRATED) m.push('baQuality')
  return m
}

/* ═══ CHỐT ĐIỂM BA (theo người, theo tháng — tách riêng bản chốt PD) ═══
   Việc được tính: có giai đoạn Phân tích, BA = người đó, Ngày hoàn thành (BA) trong tháng, đã có Điểm thực nhận. */
export const baItemsOf = (ym, baId, tasks) => tasks.filter(t => hasAnalysis(t) && t.baId === baId && String(t.baCompletedDate || '').slice(0, 7) === ym)
export function baMonthSummary(items) {
  const s = { total: 0, count: 0, missing: 0, point: 0, progressPoint: 0, qualityPoint: 0 }
  for (const i of items) {
    if (i.actual == null) { s.missing++; continue }
    s.count++; s.total += i.actual; s.point += Number(i.baPoint) || 0; s.progressPoint += i.progressPoint || 0; s.qualityPoint += i.qualityPoint || 0
  }
  s.total = round3(s.total)
  s.progressRate = s.point ? Math.round(s.progressPoint / s.point * 1000) / 10 : null
  s.qualityRate  = s.point ? Math.round(s.qualityPoint / s.point * 1000) / 10 : null
  return s
}
/** Dòng điểm BA của 1 công việc (dùng cho bảng chốt + bản chụp lúc chốt) */
export function baItemOf(t, config) {
  const r = baScoreOf(t, config)
  return {
    taskId: t.id, projectId: t.projectId, iterationId: t.iterationId, pbi: t.pbi ?? '', content: t.content, stage: stageOf(t),
    baPoint: t.baPoint, baDeadline: t.baDeadline, baCompletedDate: t.baCompletedDate, baExempt: t.baExempt, baQuality: t.baQuality,
    progressRate: r?.progressRate ?? null, progressPoint: r?.progressPoint ?? 0, qualityRate: r?.qualityRate ?? null, qualityPoint: r?.qualityPoint ?? 0,
    actual: r?.actual ?? null,
  }
}
export function buildBaClosing(ym, baId, tasks, config, userId, at = new Date().toISOString()) {
  const items = baItemsOf(ym, baId, tasks).map(t => baItemOf(t, config)).filter(i => i.actual != null)
  return { id: `${ym}:${baId}`, month: ym, baId, closedAt: at, closedBy: userId, items, ba: JSON.parse(JSON.stringify(config?.ba ?? {})), summary: baMonthSummary(items) }
}
