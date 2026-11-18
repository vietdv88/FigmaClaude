<!-- SINH TỰ ĐỘNG từ mds-docs /ds/general-design-rules (2026-11-18) — không sửa tay -->
# Nguyên tắc chung

### Dễ học, dễ nhớ (Thiết kế)

1. Các chức năng được sắp xếp theo thứ tự tác nghiệp của người dùng trong thực tế
2. Các chức năng chính, hay được sử dụng cần đặt tại vị trí dễ nhận biết, không phải thao tác qua nhiều bước để tìm đến
3. Biểu tượng (Icon) của các chức năng giống nhau phải đồng nhất
4. Phím tắt dễ nhớ, có tooltip, dễ thực hiện, phím tắt cho các chức năng giống nhau phải đồng nhất trong toàn bộ chương trình
5. Các chức năng phức tạp cần có thông tin hướng dẫn ngay trên form

### Dễ dàng nhập liệu (Thiết kế - Thi công)

1. Các thông tin cần nhập liệu được sắp xếp theo thứ tự phù hợp với thói quen thao tác của người dùng
2. Có giá trị mặc định hợp lý
3. Có các hướng dẫn nhập liệu ngay trên màn hình thao tác (ví dụ: real-time cho biết số ký tự còn được nhập trên các ô Text, chỉ ra các phím tắt để nhập nhanh, tìm nhanh...)
4. Tự động nhập liệu thay người dùng khi có thể (ví dụ điền mã khách hàng chương trình tự động điền các thông tin liên quan từ danh mục hoặc nhập đơn giá, số lượng tự động tính thành tiền...)

### Đối với Commbo box: các thông tin người dùng hay nhập/chọn sẽ xuất hiện trên cùng. Khuyến nghị:

1. Dùng Combo box với các dữ liệu >8 bản ghi, dùng Dropdown (chỉ có chọn, không có gõ tìm) với dữ liệu 4-8 bản ghi, dùng Radio/Checkbox với dữ liệu 2-3 bản ghi.
2. Combo box dùng LoadOndemand để đảm bảo hiệu năng với các dữ liệu danh mục có thể nhiều hơn 5 lần cuộn (5x8 = 40 bản ghi)
3. Đối với các Textbox, combobox cần có AutoComplete một cách hợp lý
4. Nên có chức năng nhân bản hoặc sinh từ bản ghi có sẵn
5. Hạn chế phải dùng cả chuột và bàn phím mới có thể nhập liệu được
6. Cho phép được thêm nhanh các danh mục liên quan tại giao diện nhập liệu nghiệp vụ
7. Cho phép ẩn hiện những chức năng người dùng không sử dụng

### Kiểm soát được thao tác người dùng (Thi công)

1. Chương trình phải phản hồi lại với mỗi thao tác của người dùng: Đổi mầu khi Hover/Click, Disable các button hoặc có Busy Indicator sau khi Click để không bị thực hiện nhiều lần ngoài ý muốn, ...Chi tiết trạng thái tương tác đã được mô tả [tại đây.](/ds/interaction-states)
2. Chức năng xử lý lâu cần có thông báo trước khi thực hiện. Các chức năng xử lý lâu hơn 5s cần có thanh tiến trình hiển thị % thực hiện, chuyển biểu tượng con trỏ chuột sang chế độ chờ

### Kiểm soát được lỗi

Có cảnh báo khi người dùng thao tác sai, nội dung cảnh báo dễ hiểu, focus vào ô nhập liệu bị lỗi đầu tiên

### Bo góc và đổ bóng (Thiết kế - Thi công)

1. **Card / khối nền trắng đặt trên nền xám BG Page** (card, KPI, panel bảng, mục lục, khối tóm tắt…): bo góc **8px** (token Radius/Default) và đổ bóng **Drop Shadow / Neutral / All 2**, không kẻ viền. Thi công: dùng class `.card` / `.surface` của mds-ui (token `--radius-card` = 8px, `--shadow-card` = Neutral All 2).
2. **Chỉ popup / dialog mới bo góc 12px** (token Radius/Dialog trên Figma, `--radius-dialog`).
3. **Mọi chỗ bo góc thông thường khác do mình tự dựng** (card, khối, ô, ảnh, vùng bo góc…): dùng token mặc định **8px** — thi công bằng `--radius-card` (8px cố định ở mọi mật độ, Nhỏ vẫn 8px); không dùng `--radius-default` cho khối (Nhỏ về 6px), không tự đặt số khác.
4. **Control / component đã có sẵn bo góc** (nút, ô nhập, combobox, menu xổ ra, tag, badge…): giữ nguyên theo component (các control này tự theo `--radius-default`: 8px, Nhỏ 6px), không ghi đè.
