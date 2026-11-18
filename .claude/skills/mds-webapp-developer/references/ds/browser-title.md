<!-- SINH TỰ ĐỘNG từ mds-docs /ds/browser-title (2026-11-18) — không sửa tay -->
# Tiêu đề trình duyệt

> Khi người dùng mở nhiều tab trên trình duyệt để làm việc, họ nhìn trên danh sách các tab đang mở thì nhận biết nhanh được tab nào đang mở phần mềm gì và đang ở phân hệ gì để có thể chọn nhanh được tới tab mà mình mong muốn.

- Khi sử dụng các công cụ thống kê như GA, Mixpanel...dễ dàng biết được người dùng đang sử dụng ở màn hình nào, phân hệ nào....

## Ngữ cảnh sử dụng

### Người dùng có tài khoản đăng nhập chỉ 1 công ty, đơn vị

#### MÀN HÌNH DANH SÁCH

Tên phân hệ hiện tại | Tên phân hệ cha, ông... (nếu có)  | Tên ứng dụng

Ví dụ: Rút dự toán | Kho bạc | Mimosa Online

![](/ds/files/2c9ad6bbdacffd0bfa8d0ac62a4e65cc352ccd1d.png)

#### MÀN HÌNH CHI TIẾT

**Màn hình thêm:** Thêm [Tên phân hệ hiện tại] | Tên phân hệ cha, ông...(nếu có) | Tên ứng dụng.

Ví dụ: Thêm rút dự toán | Kho bạc | MISA Mimosa Online

**Màn hình sửa:  Sửa [Mã (nếu có) - Tên bản ghi (nếu có) | Tên phân hệ hiện tại | Tên phân hệ cha, ông...(nếu có) | Tên ứng dụng.**

Ví dụ: Sửa RDT00012 | Rút dự toán | Kho bạc | MISA Mimosa Online

**Màn hình xem: [Mã (nếu có)] - Tên bản ghi chi tiết | Tên phân hệ hiện tại | Tên phân hệ cha, ông...(nếu có) | Tên ứng dụng.**

Ví dụ: RDT00012 - Rút dự toán | Kho bạc | MISA Mimosa Online

#### Trường hợp màn hình xem chi tiết mà không có tên bản ghi:

- Không có tên nhưng có mã bản ghi thì đặt theo quy tắc: Mã bản ghi | Tên phân hệ hiện tại | Tên phân hệ cha, ông...(nếu có) | Tên ứng dụng.<br><br>Ví dụ: ĐMH00002 | Đơn mua hàng | Mua hàng | AMIS Kế toán

- Không có tên không có mã bản ghi thì đặt theo quy tắc: Tên đối tượng chính | Tên phân hệ hiện tại | Tên phân hệ cha, ông...(nếu có) | Tên ứng dụng.<br><br>Ví dụ: Nguyễn Văn A | Tôi duyệt | Đơn xin nghỉ | AMIS Nhân viên

### Người dùng có tài khoản đăng nhập nhiều công ty, đơn vị

#### MÀN HÌNH DANH SÁCH

Tên phân hệ hiện tại | Tên phân hệ cha, ông... (nếu có)  | Mã đơn vị (nếu có) - Tên công ty, đơn vị | Tên ứng dụng

Ví dụ: Rút dự toán | Kho bạc | Trường THPT Hà Tiên | Mimosa Online

![](/ds/files/3a73c0d9594d6303decdb13d85af988828457652.png)

#### MÀN HÌNH CHI TIẾT

**Màn hình thêm:** Thêm [Tên phân hệ hiện tại] | Tên phân hệ cha, ông...(nếu có)  | Mã đơn vị (nếu có) - Tên công ty, đơn vị | Tên ứng dụng.

Ví dụ: Thêm rút dự toán | Kho bạc | Trường THPT Hà Tiên | MISA Mimosa Online

**Màn hình sửa:** Sửa [Mã (nếu có) - Tên bản ghi (nếu có) | Tên phân hệ hiện tại | Tên phân hệ cha, ông...(nếu có)  | Mã đơn vị (nếu có) - Tên công ty, đơn vị | Tên ứng dụng.

Ví dụ: Sửa RDT00012 | Rút dự toán | Kho bạc | Trường THPT Hà Tiên | MISA Mimosa Online

**Màn hình xem: [Mã (nếu có)] - Tên bản ghi chi tiết | Tên phân hệ hiện tại | Tên phân hệ cha, ông...(nếu có)  | Mã đơn vị (nếu có) - Tên công ty, đơn vị | Tên ứng dụng.**

Ví dụ: RDT00012 - Rút dự toán | Kho bạc | Trường THPT Hà Tiên | MISA Mimosa Online

#### Trường hợp màn hình xem chi tiết mà không có tên bản ghi:

- Không có tên nhưng có mã bản ghi thì đặt theo quy tắc: Mã bản ghi | Tên phân hệ hiện tại | Tên phân hệ cha, ông...(nếu có) | Mã đơn vị (nếu có) - Tên công ty, đơn vị | Tên ứng dụng.<br><br>Ví dụ: ĐMH00002 | Đơn mua hàng | Mua hàng | Công ty cổ phần MISA | AMIS Kế toán

- Không có tên không có mã bản ghi thì đặt theo quy tắc: Tên đối tượng chính | Tên phân hệ hiện tại | Tên phân hệ cha, ông...(nếu có) | Mã đơn vị (nếu có) - Tên công ty, đơn vị | Tên ứng dụng.<br><br>Ví dụ: Nguyễn Văn A | Tôi duyệt | Đơn xin nghỉ | Công ty cổ phần MISA | AMIS Nhân viên

### Thành phần

![](/ds/files/247cbe21e86181d526434de14f26b3b381006695.png)

::: warning
Lưu ý: Trường hợp tên phân hệ dài, nhiều phân hệ thì trình duyệt sẽ tự hiển thị theo tứ tự từ trái qua phải, dài quá sẽ hiển thị ... khi hover tooltip lên.
:::
