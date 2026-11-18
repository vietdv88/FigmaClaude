<!-- SINH TỰ ĐỘNG từ mds-docs /ds/checklist-qc (2026-11-18) — không sửa tay -->
# Checklist QC

> Checklist kiểm tra giao diện trước khi phát hành (39 mục): Chung, Màn danh sách, Màn chi tiết, Layout & Visual, Trạng thái.

::: tip Cách dùng
Tick từng mục khi đã kiểm — tiến độ được lưu trên trình duyệt của bạn. Mỗi mục có link tới quy chuẩn liên quan; chưa chắc thì hỏi **AVA** trên thanh tiêu đề (dán ảnh màn hình để AVA soát theo quy chuẩn).
:::

## Kiểm tra trước khi phát hành

::: checklist Chung
- **Favicon.ico**: Đã có chưa?
- **Tiêu đề trình duyệt**: Đã đúng quy chuẩn chưa? — [Tiêu đề trình duyệt](/ds/browser-title)
- **HeaderBar**: Logo đúng kích thước chưa, các icon liên quan như: Avatar, quả chuông, thiết lập...đã đồng nhất và đúng chuẩn chưa? — [Header bar](/ds/hearder-bar)
- **SideBar**: Đã đúng quy chuẩn chưa?
- **Đa ngôn ngữ**: Thi công đã đúng chuẩn chưa?
:::

::: checklist Màn hình danh sách
- **Màn hình trống**: Đã có chưa? đúng chuẩn chưa? Đồng nhất style giữa các màn hình trong toàn bộ ứng dụng chưa?
- **Trạng thái hover trên dòng dữ liệu**: Dòng bấm được vào chi tiết thì con trỏ chuột đã là bàn tay thể hiện bấm được chưa?
- **Các chức năng: Sửa, xóa...trên dòng dữ liệu**: Vị trí hiển thị đã đúng chuẩn chưa, đồng nhất với các danh sách khác trong ứng dụng chưa?
- **Checkbox chọn hành động hàng loạt**: Vị trí hiển thị đã đúng chuẩn chưa, đồng nhất với các danh sách khác trong ứng dụng chưa?
- **Các chức năng: Sắp xếp cột, thiết lập ẩn hiện cột.**: Kiểm tra lại vị trí đã đồng nhất với các màn hình khác chưa?
- **Bộ lọc trên danh sách**: Đã có chưa? đúng chuẩn chưa?
- **Phân trang**: Đã có chưa? đúng chuẩn chưa?
- **Phím tắt trên màn hình danh sách**: Đã có chưa? đúng chuẩn chưa? — [Header bar](/ds/hearder-bar)
- **Trạng thái loading**: Khi đang load dữ liệu đã có trạng thái loading chưa, và đã theo quy chuẩn chung chưa? — [Loading](/ds/loading)
- **Bấm F5 trên màn hình danh sách**: Khi load xong vẫn phải giữ được đúng màn hình danh sách đang mở, chỉ làm mới lại dữ liệu chứ không ra một page khác
:::

::: checklist Màn hình chi tiết
- **Tự động focus vào ô nhập liệu đầu tiên**: Đã có chưa? đúng chuẩn chưa? — [Yêu cầu tiện dụng chung](/ds/general-usability-requirements)
- **Click chuột vào từng ô nhập liệu**: Đã tự động bôi đen tất cả text chưa?
- **Thứ tự tabindex**: Đã có chưa? Khi bấm tab nhảy đúng yêu cầu mong muốn chưa?
- **Các control: Button, Textbox, Combo...**: - Đã đúng chuẩn chưa? Hover lên các control đã có trạng thái thể hiện chưa? - Các combo xổ ra giá trị sử dụng phím mũi tên trên bàn phím có di chuyển được giữa các bản ghi chưa? Bấm enter đã select được bản ghi chưa?
- **Bấm F5 hay tắt trình duyệt khi đang nhập liệu**: Đã cảnh báo mất dữ liệu và khuyến nghị người dùng lưu lại chưa? — [Cảnh báo thoát trang](/ds/leave-page-warning)
- **Bấm F5 trên màn hình xem dữ liệu chi tiết**: Khi load xong vẫn phải giữ được đúng màn hình chi tiết đang mở, chỉ làm mới lại dữ liệu chứ không ra một page khác
- **Phím tắt trên màn hình chi tiết**: CTR+S: Lưu, ESC đóng popup... — [Phím tắt](/ds/shortcut-key)
- **Trạng thái khi bấm vào các hành động**: Khi bấm lưu hoặc thao tác cần gọi server lấy dữ liệu đã có trạng thái loading trên nút báo cho người dùng biết phần mềm đang thực hiện để tránh khách hàng bấm nhiều lần gây dupplicate dữ liệu hoặc lỗi hay chưa? — [Trạng thái tương tác](/ds/interaction-states)
- **Khả năng hiển thị trên màn hình tiêu chuẩn**: Check lại trên màn hình tiêu chuẩn các thông tin đã hiển thị tối ưu hay chưa? — [Yêu cầu hiển thị](/ds/display-requirement)
:::

::: checklist Layout & Visual
- **Spacing**: Kiểm tra padding, margin và gap giữa các thành phần
- **Alignment**: Kiểm tra độ chính xác của căn lề trái, phải, giữa
- **Shadow**: Kiểm tra hiệu ứng đổ bóng có đúng thiết kế không
- **Typography**: Kiểm tra font size, weight, color và line-height
- **Visual**: Kiểm tra màu nền, màu border, icon, border-radius của card/button/input
- **Icon**: Kiểm tra đúng loại icon, kích thước và màu sắc
:::

::: checklist Trạng thái
- **Hover**: Link/button phải đổi màu hoặc gạch chân
- **Focus**: Input phải có border highlight rõ ràng
- **Disabled**: Trạng thái mờ, không thể click được
- **Readonly**: Trạng thái nền mờ, vẫn cho phép copy được text
- **Empty state**: Có thông báo phù hợp khi không có dữ liệu
- **Error state**: Có màu cảnh báo và thông báo lỗi rõ ràng
- **Button Hover**: Màu nền thay đổi theo quy chuẩn
- **Active/Selected**: Phải phân biệt rõ với trạng thái mặc định
- **Loading state**: Phải có spinner hoặc skeleton hiển thị
:::

## Mẹo kiểm tra nhanh

- Bật **Đo** trên khung ví dụ của trang tài liệu để so số đo, màu với quy chuẩn; Alt + bấm → **Xem CSS (biến chuẩn)**.
- Làm chậm mạng (DevTools › Network › Slow 3G) để thấy trạng thái đang tải.
- Thử màn 1366 × 768, 3 mật độ hiển thị, và 375px nếu có giao diện mobile.
- Dán ảnh màn hình cho **AVA** để soát nhanh theo quy chuẩn.
