<!-- SINH TỰ ĐỘNG từ mds-docs /ds/general-usability-requirements (2026-11-18) — không sửa tay -->
# Yêu cầu tiện dụng chung

### Quy tắc về chính tả

Xem chi tiết quy tắc chính tả: [tại đây](/ds/spelling-rules)

### Tab order, focus nhập liệu

- Khi mở form nhập liệu phải focus vào ô nhập số liệu đầu tiên.
- Thiết lập TabOrder giữa các control phải đặt chế độ SelectAll khi focus vào ô nhập liệu .
- Sử dụng phím Tab để di chuyển.
- Sử dụng tổ hợp phím Shift+Tab để di chuyển ngược trở về Control trước Control được chọn.

**TabIndex**
- Theo thứ tự từ trái → phải tiếp đến từ trên → dưới

![](/ds/files/shot-general-usability-requirements-129-54708.png)

Ví dụ thứ tự TabIndex cho form đăng ký

- Một số trường hợp gom nhóm thông tin thì các thông tin trong cùng 1 nhóm sẽ được chuyển tab bên trong nhóm trước sau đó mới chuyển sang nhóm khác.

![](/ds/files/shot-general-usability-requirements-130-54808.png)

TabIndex sẽ được chuyển lần lượt theo quy tắc Trái → Phải → Trên → Dưới khi hết control ở nhóm 1 mới chuyển sang nhóm 2, hết nhóm 2 sẽ chuyển xuống nhóm 3

### Phím tắt

- Tất cả các hoạt động trên sản phẩm đều có thể sử dụng phím tắt
- Với tất cả những chức năng và tiện ích có sử dụng phím tắt thì phải show cho người dùng thấy được phải dùng phím tắt gì, có thể show bằng cách dùng tooltip hoặc status
- Quy định về các phím tắt phổ biến: [Quy định phím tắt](/ds/shortcut-key)

### Tooltip

- Tất cả các từ viết tắt phải có Tooltip
- Phải diễn giải đầy đủ một chức năng, một thông tin mà tên của nó không thể hiện được đầy đủ

### HotTrack

- Khi di chuyển chuột qua thì đối tượng được đổi màu để người dùng dễ quan sát
- Các đối tượng cần sử dụng HotTrack: Tab, Sidebar, Toolbar, Button, Combo...
- Các action mà người dùng có thể bấm được icon chuột phải là hình bàn tay

### Label

Tất cả các Label chỉ được viết tắt khi có từ 4 từ trở lên, **khi viết tắt bắt buộc phải có tooltip để giải thích ý nghĩa đầy đủ**.
