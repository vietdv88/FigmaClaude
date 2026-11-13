/* Dữ liệu mẫu Bắt đầu sử dụng (AMIS CRM) — dùng chung: /ds/onboarding-start, /ds/empty-state (Tổng quan › Tài khoản mới) */
/* ── Dữ liệu các bước (task: label · cta = nút thực hiện trên màn đích · screen = tên màn đích) ── */
const T = (id, label, cta, screen, done = false) => ({ id, label, cta, screen, done })
export const buildSteps = () => ({
  basic: [
    { id: 'b1', title: 'Giới thiệu tổng quan', icon: 'info-circle', tasks: [T('b1a', 'Xem giới thiệu phần mềm', 'Xem giới thiệu', 'Giới thiệu AMIS CRM', true), T('b1b', 'Tham quan màn hình làm việc', 'Bắt đầu tham quan', 'Tham quan', true), T('b1c', 'Cập nhật thông tin cá nhân', 'Cập nhật', 'Thông tin cá nhân', true)] },
    { id: 'b2', title: 'Thiết lập ban đầu', icon: 'settings', tasks: [T('b2a', 'Khai báo thông tin công ty', 'Cập nhật', 'Thông tin công ty', true), T('b2b', 'Thiết lập cơ cấu tổ chức', 'Thêm đơn vị', 'Cơ cấu tổ chức'), T('b2c', 'Thêm người dùng và phân quyền', 'Thêm người dùng', 'Người dùng')] },
    { id: 'b3', title: 'Khai báo danh mục', icon: 'category', groups: [
      { id: 'g-hh', title: 'Hàng hóa', tasks: [T('b3a', 'Khai báo loại hàng hóa', 'Thêm loại hàng hóa', 'Loại hàng hóa'), T('b3b', 'Khai báo hàng hóa', 'Thêm hàng hóa', 'Hàng hóa'), T('b3c', 'Đồng bộ hàng hóa từ AMIS Kế toán', 'Đồng bộ ngay', 'Hàng hóa')] },
      { id: 'g-kh', title: 'Khách hàng', tasks: [T('b3d', 'Nhập khẩu khách hàng từ Excel', 'Nhập khẩu', 'Khách hàng'), T('b3e', 'Thêm khách hàng', 'Thêm khách hàng', 'Khách hàng')] },
    ] },
    { id: 'b4', title: 'Quản lý bán hàng', icon: 'shopping-cart', tasks: [T('b4a', 'Tạo báo giá', 'Thêm báo giá', 'Báo giá'), T('b4b', 'Tạo đơn hàng', 'Thêm đơn hàng', 'Đơn hàng'), T('b4c', 'Ghi nhận thanh toán', 'Ghi nhận thanh toán', 'Thanh toán'), T('b4d', 'Xuất hóa đơn', 'Xuất hóa đơn', 'Hóa đơn'), T('b4e', 'Xem báo cáo doanh số', 'Xem báo cáo', 'Báo cáo doanh số')] },
    { id: 'b5', title: 'Hướng dẫn sử dụng trên mobile', icon: 'device-mobile', tasks: [T('b5a', 'Cài ứng dụng AMIS CRM trên điện thoại', 'Gửi link cài đặt', 'Ứng dụng di động')] },
    { id: 'b6', title: 'Thiết lập khác', icon: 'adjustments-horizontal', tasks: [T('b6a', 'Thiết lập mẫu in', 'Thêm mẫu in', 'Mẫu in'), T('b6b', 'Thiết lập email gửi đi', 'Kết nối email', 'Email gửi đi'), T('b6c', 'Thiết lập thông báo', 'Thiết lập', 'Thông báo'),
      T('b6d', 'Tùy chỉnh trường thông tin', 'Thêm trường', 'Trường thông tin'), T('b6e', 'Thiết lập quy trình duyệt', 'Thêm quy trình', 'Quy trình duyệt'), T('b6f', 'Kết nối tổng đài', 'Kết nối', 'Tổng đài')] },
  ],
  advanced: [
    { id: 'a1', title: 'Tự động hóa', icon: 'adjustments', tasks: [T('a1a', 'Tạo quy trình tự động', 'Thêm quy trình', 'Quy trình tự động'), T('a1b', 'Thiết lập chiến dịch email', 'Thêm chiến dịch', 'Chiến dịch email')] },
    { id: 'a2', title: 'Tích hợp', icon: 'plug-connected', tasks: [T('a2a', 'Kết nối AMIS Kế toán', 'Kết nối', 'Tích hợp'), T('a2b', 'Kết nối Zalo OA', 'Kết nối', 'Tích hợp')] },
    { id: 'a3', title: 'Báo cáo nâng cao', icon: 'chart-bar', tasks: [T('a3a', 'Tạo báo cáo tùy chỉnh', 'Thêm báo cáo', 'Báo cáo tùy chỉnh'), T('a3b', 'Đặt lịch gửi báo cáo', 'Đặt lịch', 'Lịch gửi báo cáo')] },
  ],
})

export const SUPPORTS = [
  { id: 'ava', icon: 'misa-ai', label: 'Chat với trợ lý số MISA AVA', ai: true },   // icon MISA AI giống Global Header
  { id: 'community', icon: 'users', tone: 'brand', label: 'Cộng đồng sử dụng AMIS CRM' },
  { id: 'chat', icon: 'message-circle', tone: 'success', label: 'Chat với nhân viên hỗ trợ' },
]
export const guidesOf = watched => [
  { id: 'video', icon: 'video', tone: 'brand', label: 'Xem phim hướng dẫn', progress: { done: watched, total: 17 } },
  { id: 'article', icon: 'book-2', tone: 'danger', label: 'Xem bài viết hướng dẫn' },
  { id: 'class', icon: 'school', tone: 'success', label: 'Học với giảng viên MISA' },
]
export const tasksOf = s => (s.groups ? s.groups.flatMap(g => g.tasks) : s.tasks)
