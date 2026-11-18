<!-- SINH TỰ ĐỘNG từ mds-docs /ds/text-field (2026-11-18) — không sửa tay -->
# Text field

> Trường văn bản cho phép người dùng nhập và chỉnh sửa văn bản. Link components: **[tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-3895&m=dev&t=1S0zBdtFYvQw6tLk-1)**

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — thao tác thử, đổi mật độ hiển thị, bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/TextFieldDemo.vue`
## Sử dụng

Hỗ trợ 3 dạng hiển thị lable như sau:

### Dạng label ngang

Dùng cho các form có nhiều thông tin và label thường ít chữ và mong muốn tối ưu theo chiều dọc để không phải cuộn chuột nhiều khi nhập liệu.

**Ưu điểm:**
- Tiết kiệm diện tích khi form có quá nhiều thông tin cần nhập liệu
- Chế độ view và chế độ Edit vị trí label và value không thay đổi, dễ dàng đọc thông tin

**Nhược điểm:**
- Label dài nhiều dòng sẽ khó hiển thị, có thể gây tốn diện tích hoặc hiển thị nhiều dòng form khó cân đối.

![](/ds/files/a6b0642b1113abcecc1c416170dbd65406585ddc.png)

### Dạng label trên, control dưới

- Dùng cho các form không có quá nhiều thông tin, label thường dài hoặc kèm giải thích
- Dùng cho các màn hình có độ rộng nhỏ hoặc các form cần hiển thị dạng responsive trên mobile

**Ưu điểm:**
- Dễ nhập liệu từ trên xuống dưới không cần đảo mắt trái phải, trên dưới
- Hiển thị tốt với label dài, form dễ căn chỉnh không lo bị xô lệch bố cục
- Dễ dàng hiển thị responsive trên mọi thiết bị.

**Nhược điểm:
- Form dài nhiều trường thông tin sẽ phải cuộn chuột nhiều mới nhập được hết**

![](/ds/files/bee560fa9152522008ac3e82cc5e944e530030ba.png)

### Không dùng label

- Dùng khi ngữ cảnh đã rõ ràng, người dùng hiểu ngay nội dung cần nhập mà không cần nhãn.
- Thường áp dụng cho form cực ngắn (1–3 trường) hoặc tác vụ lặp lại quen thuộc. Ví dụ: Ô tìm kiếm, lọc dữ liệu, đăng nhập nhanh, nhập mã OTP, comment box, tác vụ mini trong sidebar hoặc toolbar.

**Ưu điểm:
- Giao diện sạch, gọn, tiết kiệm không gian.**

**Nhược điểm:
- Thiếu nhãn gây mơ hồ nếu placeholder biến mất sau khi nhập.
- Khó truy cập (accessibility) và dễ nhầm khi nhiều trường tương tự.**

![](/ds/files/7b88c7f375aeb32a7508b97f9c5800e14b054907.png)

::: warning
Lưu ý: Mỗi form nên chỉ dùng một kiểu label để đảm bảo đồng nhất giao diện.
:::

## Trạng thái

#### Normal

![](/ds/files/3aef7cfb3f84e0aebf569b380df11e5e4dda6383.png)

#### Hover

![](/ds/files/f4800f76ef32da1bb2d6aaaa0856dad0656f36c2.png)

#### Focus

![](/ds/files/f6ae2c654eed0008a77d5421d8b214a5cb7b3d4a.png)

#### Readonly

![](/ds/files/f19975c688116a499c02e642d4839809deab7df5.png)

#### Error

![](/ds/files/ae9fe7e0aaaa1728700dcef1813a06fb275a5699.png)

#### Validate

![](/ds/files/3840dd240e4ee1b126cebbfa2626489754905fa3.png)

#### Verifying

![](/ds/files/31e1143c51bfcea11a31fba02ee09457a4290ea8.png)

::: warning
Lưu ý: 
Với trạng thái Lỗi, ngay khi focus vào ô đang lỗi thì tự động hiển thị luôn tooltip để người dùng nhìn thấy ngay lỗi gì.
Khi focus vào ô nhập liệu các giá trị tự động bôi đen hết để sửa giá trị nhanh hơn, nếu muốn sửa riêng lẻ từng ký tự bấm lại chuột vào vị trí cần sửa sẽ bỏ bôi đen toàn bộ text để sửa từng ký tự riêng lẻ.
:::

## Khuyến nghị

### Đánh dấu tùy chọn thay vì bắt buộc

Hãy đảm bảo rằng bạn không hỏi người dùng những thông tin không cần thiết. Khi số lượng các trường tùy chọn trong biểu mẫu gần như bằng 0, phần lớn các trường sẽ là bắt buộc. Thay vì đánh dấu tất cả các trường bắt buộc thì hãy chỉ đánh dấu các trường tùy chọn. Có thể sử dụng "tùy chọn" trong nhãn để cung cấp cho người dùng dấu hiệu rõ ràng.

![](/ds/files/shot-text-field-275-494.png)

### Không phải lúc nào cũng cần gợi ý

Văn bản trong trường nhập có thể cho người dùng biết nội dung nào được mong đợi. Và không bắt buộc đối với các trường đơn giản như "Họ và tên", nhưng nó có thể cực kỳ có giá trị đối với các trường yêu cầu dữ liệu ở định dạng cụ thể.

![](/ds/files/shot-text-field-275-547.png)
