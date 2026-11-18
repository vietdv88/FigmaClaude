<!-- SINH TỰ ĐỘNG từ mds-docs /ds/checklist-pd (2026-11-18) — không sửa tay -->
# Checklist PD

> Việc UI/UX Designer cần tự soát trước khi bàn giao thiết kế và khi review bản dựng: biến chuẩn, bố cục, component, trạng thái, danh sách, biểu đồ.

::: tip Cách dùng
Tick từng mục khi đã kiểm — tiến độ được lưu trên trình duyệt của bạn. Mỗi mục có link tới quy chuẩn liên quan; chưa chắc thì hỏi **AVA** trên thanh tiêu đề (dán ảnh màn hình để AVA soát theo quy chuẩn).
:::

## Trước khi bàn giao thiết kế

::: checklist Màu sắc, chữ, biến chuẩn
- Mọi màu lấy từ biến đúng nhóm: chữ → Text, nền → Background, viền → Border (Stroke), icon → Icon — tra ở [Biến chuẩn](/ds/design-tokens), không dùng màu gốc (palette) trực tiếp
- Chữ nội dung tối thiểu 13px (Body), tiêu đề theo [Kiểu chữ](/ds/typography); không dùng 11–12px cho chữ đọc
- Icon trung tính một màu Icon/Neutral ở mọi trạng thái; icon AI dùng gradient AI — xem [Icons](/ds/icons)
- Số tiền, số lượng định dạng 1.234.567,89 — [Quy định phân cách số](/ds/number-separation-rules)
- Chính tả, cách viết hoa, câu chữ đúng [Quy tắc chính tả](/ds/spelling-rules) và [Nội dung](/ds/contents)
:::

::: checklist Bố cục, khoảng cách, bo góc, bóng đổ
- Lề nội dung 16px, card cách nhau 16px, đệm trong card 16px — [Bố cục trang](/ds/layout)
- Card trên nền xám: bo 8px + bóng All 2, không viền · popup / dialog: bo 12px + bóng Bottom 12 — [Popup](/ds/popup)
- Có viền thì không đổ bóng; không để 2 đường viền chồng nhau (viền đôi)
- Hiển thị tốt ở màn hình 1366 × 768 (và 375px nếu có mobile) — [Yêu cầu hiển thị](/ds/display-requirement)
:::

::: checklist Component và trạng thái
- Dùng đúng component trong Figma MDS (Button, Text field, ComboBox, Tag, Accordion…) — không tự vẽ biến thể mới
- Mỗi control có đủ trạng thái: Default · Hover · Focus · Disabled · Readonly · Lỗi — [Trạng thái tương tác](/ds/interaction-states)
- Màn hình có đủ trạng thái: đang tải ([Loading](/ds/loading)), không có dữ liệu ([Empty state](/ds/empty-state)), lỗi ([Error pages](/ds/error-page))
- Form: nút Lưu / Hủy ghim cuối form (không đặt đầu form); ô bắt buộc có dấu *; ô nhập số căn trái — [Text field](/ds/text-field)
- ComboBox không bắt buộc cho phép bỏ chọn về “Chưa chọn” — [ComboBox](/ds/combobox)
- Menu xổ ra có đệm 8px, mục bo góc, rê chuột nền Brand Light — [Context Menu](/ds/contextmenu)
- Tooltip không lặp lại chữ đã hiện trên màn hình
:::

::: checklist Danh sách, bảng, biểu đồ
- Bảng theo [Bảng dữ liệu](/ds/data-table): hover dòng, thao tác dòng, lọc, phân trang, cột số căn phải
- Bảng trong popup giãn hết chiều cao, phân trang ghim đáy — [Popup](/ds/popup) › Popup chứa danh sách
- Biểu đồ theo [Biểu đồ](/ds/data-visualization): màu theo bộ Chart Colors của chủ đề, thẻ KPI cao bằng nhau
:::

## Trước khi gửi review

::: checklist Tự soát cuối
- Upload ảnh màn hình cho **AVA** soát theo quy chuẩn, sửa hết điểm “Cần sửa”
- Ghi chú hành vi đặc biệt (phím tắt, cảnh báo rời trang, giới hạn ký tự…) ngay trên thiết kế cho DEV
- Kiểm tra lại các màn cùng loại trong ứng dụng đã đồng nhất (vị trí nút, bộ lọc, phân trang)
:::

## Khi review bản dựng của DEV

::: checklist So bản dựng với thiết kế
- Bật **Đo** trên khung ví dụ của trang tài liệu (hoặc Inspect trình duyệt) để so số đo, màu với thiết kế
- Thử đủ trạng thái: hover, focus, disabled, lỗi, trống, đang tải
- Thử ở mật độ hiển thị Nhỏ / Trung bình / Rộng và màn 1366
:::
