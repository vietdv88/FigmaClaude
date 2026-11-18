<!-- SINH TỰ ĐỘNG từ mds-docs /ds/interaction-states (2026-11-18) — không sửa tay -->
# Trạng thái tương tác

## Mục đích

Trạng thái tương tác giúp người dùng có thể nhận biết:
- Phần tử nào có thể bấm hoặc chọn được.
- Thao tác đã được ghi nhận hay chưa.
- Phần tử đang được chọn, xử lý hay tạm thời không sử dụng được.

::: warning
Nguyên tắc: Mọi phần tử có thể bấm, chọn hoặc thao tác đều phải có phản hồi rõ ràng.
:::

![](/ds/files/854c0ce0fa97d7d07d4c1f32709ce53181a719c4.png)

Các trạng thái của Button trên component. Một số loại button khác như Button Small, Button Icon thì cắt vợi trạng thái cho nhẹ control nhưng về hành xử y hệt như Button Medium đã thiết kế. Xem chi tiết component [tại đây.](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-11920&m=dev)

![](/ds/files/adf8d7e21c27e8584e137396714323ab33e9a587.png)

Các trạng thái của Textbox trên component. Chi tiết component [tại đây.](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-49946&m=dev)

::: note
Lưu ý: Hầu hết các component đã set đầy đủ các loại trạng thái trên MDS Web Components - V2.0
:::

## Phạm vi áp dụng

Áp dụng cho tất cả phần tử có thể tương tác, như:
- Button, link và icon button.
- Menu item, tab và dropdown item.
- Card hoặc dòng dữ liệu có thể bấm.
- Checkbox, radio button và switch.
- Input, vùng điều hướng và vùng mở rộng nội dung.

## Các trạng thái cần có

**Default:** Trạng thái bình thường khi người dùng chưa thao tác.
- Hiển thị rõ vai trò của phần tử.
- Không tạo cảm giác bị vô hiệu hóa.

**Hover:** Hiển thị khi di chuột lên phần tử.

Có thể thể hiện bằng:
- Đổi màu nền, màu chữ hoặc màu viền.
- Tăng shadow hoặc cảm giác nổi lên.
- Gạch chân link.
- **Đổi cursor thành pointer** .
Lưu ý: Hover phải dễ nhận biết nhưng không làm thay đổi kích thước hoặc vị trí phần tử.

**Focus:** Hiển thị khi người dùng dùng phím Tab hoặc công cụ hỗ trợ để chọn phần tử.
- Phải có dấu hiệu rõ ràng, như focus ring hoặc viền nổi bật.
- Không được xóa trạng thái focus nếu chưa có cách thay thế.<br>
**Pressed hoặc Active:** Hiển thị khi người dùng đang nhấn hoặc phần tử đang được kích hoạt.

Có thể thể hiện bằng:
- Đổi màu nền.
- Giảm shadow.
- Đổi màu viền hoặc biểu tượng.

**Selected:** Hiển thị khi phần tử đã được chọn.

Áp dụng cho tab, menu item, checkbox, radio button, bộ lọc và danh sách.
- Màu sắc khi selected phải khác rõ với trạng thái mặc định.
- Có thể thêm các icon check để thể hiện trạng thái selected.

**Disabled hoặc Readonly:** Hiển thị khi phần tử không thể thao tác.
- Không cho phép click, chạm hoặc điều hướng bằng bàn phím.
- Giảm mức độ nổi bật nhưng vẫn phải dễ đọc.
- Không tạo cảm giác phần tử vẫn có thể bấm.<br>
**Loading:** Hiển thị khi hệ thống đang xử lý.
- Cho người dùng biết thao tác đang được thực hiện.
- Ngăn thao tác lặp nếu cần.
- Dùng spinner hoặc nội dung phù hợp.
- Không làm giao diện thay đổi kích thước đột ngột.

## Trách nhiệm của các bộ phận

**Design**
- Thiết kế đầy đủ các trạng thái cần thiết để bàn giao cho DEV.
- Quy định rõ cách thể hiện từng trạng thái.
- Đảm bảo sự đồng nhất cách thể hiện trạng thái đối với cùng loại hành động (control).
- Kiểm tra khả năng nhận biết và độ tương phản.<br>
**Dev**
- Đảm bảo thi công đúng và đầy đủ các trạng thái theo thiết kế cung cấp.
- Kiểm tra đầy đủ trạng thái trước khi chuyển QC.<br>
**QC**

Kiểm tra để đảm bảo thi công đúng theo checklist sau:

✅️ Phần tử có thể bấm có trạng thái hover hay không, biểu tượng chuột đã là Pointer hay chưa?

✅️ Focus có hiển thị khi dùng phím Tab hay không?.

✅️ Pressed, selected, disabled và loading có hoạt động đúng hay không?

✅️ Phần tử không thể bấm có bị hiểu nhầm là có thể bấm hay không?

✅️ Trạng thái có hiển thị đúng trên các biến thể và nền khác nhau hay không?

::: warning
Luồng xử lý khi phát hiện thi công chưa có trạng thái: 
QC kiểm tra thấy không có trạng thái như đã liệt kê bên trên hoặc trạng thái giữa các thành phần tương tự nhau nhưng thể hiện khác nhau → Post Bug → Dev kiểm tra lại nguyên nhân do đâu:  - Nếu do thi công sai → Ghi nhận và sửa Bug - Nếu do thiết kế thiếu → Yêu cầu Design bổ sung trạng thái thể hiện cho phù hợp.
:::
