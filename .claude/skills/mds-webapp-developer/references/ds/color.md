<!-- SINH TỰ ĐỘNG từ mds-docs /ds/color (2026-11-18) — không sửa tay -->
# Màu sắc

> Mô tả quy chuẩn về các màu sắc sử dụng thường xuyên, phân chia theo từng loại màu, từng thành phần sử dụng

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — thao tác thử, đổi mật độ hiển thị, bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/ColorDemo.vue`
![](/ds/files/b86fe835582c4ad1a66dde5805e3a0c4f837f171.png)

### Mô tả chi tiết

Danh sách các bộ sưu tập màu

![](/ds/files/shot-color-12-752.png)

**Nhóm Base - Nhóm màu cấp 1**<br>
- Brand: Là màu chính của app
- Accent: Là màu nhấn mạnh (ít sử dụng_
- Info: Màu dành cho các thông tin mang tính hướng dẫn
- Warning: Màu dành cho các thông báo cảnh báo
- Danger: Màu dành cho các hành động nguy hiểm như: Xóa, hủy dữ liệu...
- Success: Màu dành cho các thông báo thành công
- Neutral: Màu trung tính dùng cho: Text, border, background...
- Alpha White: Màu trắng có opacity dành cho: Text, border, background nằm trên 1 nền màu đậm
- Alpha Black: Màu đen có opacity dành cho: Text, border, background nằm trên 1 nền màu trắng

![](/ds/files/shot-color-12-754.png)

Các ứng dụng có thể tùy chỉnh màu của nhóm Base theo ứng dụng của mình

Công cụ sinh màu dựa vào mã màu chính: https://uicolors.app/generate/1f1f1f

**Nhóm Text (Màu chữ), Icon (Màu icon), Stroke (Màu viền), Bg (Màu nền) - Nhóm màu cấp 2**<br>
- Đây là nhóm màu không khai báo trực tiếp biến màu mà gọi link tới màu đã khai báo tại nhóm Base cấp 1

![](/ds/files/shot-color-12-756.png)

Dự án không cần chỉnh màu ở đây, khi màu ở nhóm Base được chỉnh sẽ tự ăn màu của nhóm này
