<!-- SINH TỰ ĐỘNG từ mds-docs /ds/announcement (2026-11-18) — không sửa tay -->
# Thông báo

> Thông báo hiển thị cho người dùng biết về những thông tin, thông báo, cảnh báo từ ứng dụng. Nội dung thông báo đảm bảo đúng [quy tắc về nội dung](/ds/contents) đã quy định.

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — thao tác thử, đổi mật độ hiển thị, bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/AlertDemo.vue`
## Thông báo kêu gọi hành động

Các thông báo hiển thị dạng dialog trực tiếp trên màn hình của người dùng, yêu cầu người dùng phải đưa ra lựa chọn trước khi tiếp tục hành động.

![](/ds/files/c0e72f1338a61a0d45ab505bde59ea52cc250c49.png)

![](/ds/files/aa55d0b1b297af44b2b754ed5cbe82acac4b619c.png)

Xem chi tiết đặc tả về Dialog [tại đây](/ds/dialog)

## Thông báo dạng Toast

Có 4 loại thông báo: Thành công, Lỗi, Cảnh báo, Thông tin. Link components [tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-84433&m=dev&t=oDBVOcfa6RjIVhx3-1)

### Ngữ cảnh sử dụng

- **Thông báo nhanh** trạng thái thao tác, hiển thị cho mọi người dùng, không cần tương tác xử lý. **Chỉ hiển thị 5 giây sau đó tự động đóng** đi mà người dùng không cần phải thao tác đóng.
- Luôn hiển thị tối đa 3 thông báo gần nhất, nhiều hơn 3 thông báo liên tục tự động ẩn các thông báo trước đó.
- Cách hiển thị: Hiển thị theo độ rộng của dữ liệu và max-width (độ rộng tối đa) là 400px.

#### Thành công

Thông báo thành công hiển thị cho người dùng biết hành động vừa thực hiện đã thành công.

![](/ds/files/6e5377e852d4c9992bf2e3a92b19725d61bd1b1d.png)

#### Lỗi

Thông báo lỗi hiển thị cho người dùng biết hành động vừa chọn đã không xảy ra theo đúng mong muốn và gặp phải một số trục trặc trong quá trình thực hiện.

![](/ds/files/21863a2c5c212e01b23909c6a45547409e60762c.png)

#### Cảnh báo

Thông báo cảnh báo cho người dùng biết về những điều không mong muốn, sai lệch có thể ảnh hưởng tới hoạt động của người dùng nhưng không phải là lỗi.

Thông báo cảnh báo trước người dùng về hành động sắp xảy ra, những ảnh hưởng khi thực hiện một thao tác nào đó hay những xung đột đã xảy ra với dữ liệu đang thao tác...

![](/ds/files/693f636434a350d8c793536a2780c2f0db928c18.png)

#### Thông tin

Thông báo dạng thông tin sẽ hiển thị những thông tin mang tính hướng dẫn, trợ giúp: những lưu ý, những chính sách, tính năng mới cập nhật...

![](/ds/files/5b695287200a94e7309b6b74c27aedc379fb8a4a.png)

### Cách sử dụng

#### Độ rộng tối đa của toast là 400px

::: do
![](/ds/files/401ff9a4b41bae9f23508c473836cdab8e606333.png)

Độ rộng tối đa của toast là 400px, khi chữ dài quá sẽ xuống dòng và nên tối đa là 2 dòng để hiển thị dữ liệu tốt nhất và người dùng có thể đọc nhanh được thông tin.
:::

::: dont
![](/ds/files/4d63981b7a0aaa83622cb51590accc6f4be2cbec.png)

Không nên kéo dài độ rộng của toast, các loại thông báo khác đang để độ rộng tối đa là 400px.
:::

#### Khi chữ thông báo nhỏ hơn độ rộng tối đa của toast

::: do
![](/ds/files/bf40531e6b5834b68394f18f0c17e0d630e48286.png)

Khi dữ liệu ngắn thì hiển thị độ rộng của toast theo độ rộng của chữ.
:::

::: dont
![](/ds/files/9b180c9cbd0403d46f5bb234c668e6a5e9b14c00.png)

Không nên fix-width của ô hiển thị rộng không cần thiết che mất dữ liệu bên dưới
:::

#### Hiển thị

Các loại thông báo này luôn hiển thị ở **phía trên, dưới của header bar** và thời gian hiển thị mỗi thông báo là 5s sau đó tự động ẩn đi.

<br>**Thứ tự hiển thị:** Thông báo mới nhất sẽ hiển thị trên cùng, cũ hơn đẩy xuống phía dưới

![](/ds/files/8ab68779e4bd5003863bed869deed279b4fb05c6.png)

## Thông báo dạng Notification

Có 4 loại thông báo: Thành công, Lỗi, Cảnh báo, Thông tin. Link components [tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-85274&m=dev&t=oDBVOcfa6RjIVhx3-1)

### Ngữ cảnh sử dụng

- **Thông báo các sự kiện quan trọng**, cần được xem lại sau (ví dụ: tin nhắn mới, nhắc việc, cảnh báo hệ thống,...), các thông báo này thường do hệ thống tự động bắn lên, không phải do hành động của người dùng vừa thực hiện và có phản hồi ngay lập tức.
- Thường các thông báo này sẽ đồng thời bắn cả thông báo trong quả chuông
- Hiển thị nhiều thông tin để người dùng đọc có thể có các hành động cần xử lý
- Không tự động đóng, người dùng cần bấm X để tắt thông báo.
- Cách hiển thị: Hiển thị theo độ rộng của dữ liệu và max-width (độ rộng tối đa) là 400px.

#### Thành công

![](/ds/files/6045b44ce4ed91f3af5847da66ae64c1f88df2a6.png)

![](/ds/files/817b97aefa9173d30d182c319e85f639c0310076.png)

#### Lỗi

![](/ds/files/ed23a6303acc9e220ebab6b56e97d9008eb44d2d.png)

#### Cảnh báo

![](/ds/files/fb8d6a9bd52c9bc61e09b7edfa74a05a1463291c.png)

#### Thông tin

![](/ds/files/accf477db89f49855e7ebef91ee84da8f41342f6.png)

#### Hiển thị

Tương tự với thông báo dạng Toast, thông báo này cũng hiển thị ở **phía trên, góc phải của ứng dụng.** Các thông báo này sẽ không tự động tắt đi, người dùng sẽ tự bấm nút X để tắt thông báo.

**Thứ tự hiển thị:** Thông báo mới nhất sẽ hiển thị trên cùng, cũ hơn đẩy xuống phía dưới, sau khi người dùng tắt thông báo bên trên thì thông báo bên dưới sẽ tự động đẩy lên, đảm bảo các thông báo luôn sắp xếp cạnh nhau theo thứ tự.

![](/ds/files/9c043ae1d273c93a40ebb7149e85888938148542.png)

#### Hiển thị cùng với thông báo dạng Toast

Quy tắc về thứ tự hiển thị vẫn tương tự như đã mô tả trước đó.

![](/ds/files/234f8a6d1b6c612b1b9d2ba540d33a141dbfe22f.png)

## Thông báo dạng Inline

Có 4 loại thông báo: Thành công, Lỗi, Cảnh báo, Thông tin. Link components [tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-3936&m=dev&t=D7zYzkn6b47IuDne-1)

### Ngữ cảnh sử dụng

**- Hiển thị trực tiếp bên trong nội dung chính (gần khu vực thao tác/ngữ cảnh liên quan), chứ không nổi lên toàn giao diện như toast notification.
- Inline notification thích hợp cho các thông báo liên quan trực tiếp đến từng khu vực, không làm gián đoạn, giúp người dùng dễ theo dõi và xử lý ngay tại chỗ.**

#### Thành công

![](/ds/files/585a8317f6249acfeba5fde8d29236c0777ecb8e.png)

![](/ds/files/3d313d1daebfd9a00263c03bc1029acf87fdbbab.png)

Tiêu đề ngắn cần tối ưu chiều cao hiển thị có thể sử dụng dạng thông báo căn nội dung và tiêu đề trên cùng 1 dòng

#### Lỗi

![](/ds/files/82d1002794582ec951d210f78b49b605e34bb68e.png)

![](/ds/files/d82268513702bf107f3f45685625c8cd0cb432d8.png)

#### Cảnh báo

![](/ds/files/812c08b71dfcf135063a6fa2aa88320ad7891bb5.png)

![](/ds/files/629f3a1b62a40e00573fce594d4ca2b9b1881038.png)

#### Thông tin

![](/ds/files/8fbd5ae4b9726992670eaff0bc47576fd5a48a41.png)

![](/ds/files/273fac9c7f111aceb1ec0d99b72b664fe3c7ef16.png)

#### Hiển thị

- Hiển thị ngay trên trang hoặc trên nội dung của popup, card...
- Có thể có icon X để tắt hoặc không có tùy vào từng trường hợp.

![](/ds/files/7e03f209b863ea85684f02a01853f918955b3800.png)

## Thông báo dạng Global Inline

Có 4 loại thông báo: Thành công, Lỗi, Cảnh báo, Thông tin. Link components [tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-3936&m=dev&t=D7zYzkn6b47IuDne-1)

### Ngữ cảnh sử dụng

Thích hợp cho các thông báo hết thời hạn sử dụng, thông báo cảnh báo hệ thống sắp bảo trì, chậm treo...

![](/ds/files/38ebe56e5bc25d51df94e9539e652ba0b50f57d0.png)

#### Hiển thị

- Hiển thị ở trên cùng của app, phía trên của thanh header.
- Tùy trường hợp có thể có icon X để tắt hoặc không

![](/ds/files/b88007460c5f2e29ed7e0d9d838b4cb61f012019.png)
