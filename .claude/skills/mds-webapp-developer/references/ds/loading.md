<!-- SINH TỰ ĐỘNG từ mds-docs /ds/loading (2026-11-18) — không sửa tay -->
# Loading

> Trạng thái loading giúp trấn an người dùng rằng hệ thống vẫn đang làm việc, tránh người dùng hiểu nhầm hệ thống bị treo.

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — thao tác thử, đổi mật độ hiển thị, bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/LoadingDemo.vue`
Khi thời gian chờ load dữ liệu > 1s thì bắt buộc phải hiển thị trạng thái loading, < 1s thì cân nhắc sử dụng. Nếu thời gian load > 4s thì sử dụng Progress bar.

## Các loại Loading sử dụng

### 1. Spinner

Là cách sử dụng ảnh gif, hoặc svg động có hiệu ứng xoay tròn mỗi khi người dùng bấm vào một chức năng nào đó cần phải chờ đợi thời gian xử lý.

Loại spinner sử dụng là loại đường tròn liền khuyết 1 góc và xoay tròn đều, màu của đường tròn có thể tùy chỉnh theo từng ứng dụng. Link chạy thử spinner xem tại đây: [https://jsfiddle.net/vietdv/5b18mhtw/9/](https://jsfiddle.net/vietdv/5b18mhtw/9/)

#### Sử dụng trong màn hình chi tiết

Khi bấm mở một màn hình chi tiết, 1 popup hiển thị thông tin chi tiết nào đó cần phải chờ đợi mới hiển thị được đầy đủ giao diện.

![](/ds/files/62ec6222fdfbd28990ece711507ea7730f22ce19.png)

#### Sử dụng trong các control

Hiển thị trạng thái loading trong các control khi các control này phải load dữ liệu trước khi hiển thị ra hoặc cần xử lý tính toán trước khi thực hiện một hành động nào khác.

![](/ds/files/6778fbe326ff2a0f841c5c6e012b81142dfdd8e7.png)

![](/ds/files/3350b3988952152ee7cbbf3c5bea8ac50099c980.png)

![](/ds/files/3562b1cb1aa3ba1f70f3cb0b8d71e26fb98337c7.png)

#### Mô tả chi tiết spinner

![](/ds/files/ac830b05b305d5ddda0c15d6e367bc2ec9f71305.png)

Kích thước thông thường  Border: 3px.

![](/ds/files/564c6fdda633db9e3af85ae5019bd4b9f4f2a803.png)

Kích thước nhỏ trong các control  Border: 2px.

#### Màu sắc: Màu sắc của spinner tùy thuộc vào style của từng ứng dụng.

### 2. Loading Skeleton

Loading dạng skeleton sẽ giúp người dùng hình dung trước được khi dữ liệu tải xong thì sẽ hiển thị theo bố cục như thế nào. Loading skeleton sẽ cung cấp cho người dùng cái nhìn trực quan hơn so với sử dụng spinner.

::: note
Lưu ý: Những thành phần nào đã có sẵn dữ liệu thì hiển thị luôn mà không cần thể hiện trạng thái loading.
:::

#### Sử dụng cho màn hình tổng quan có nhiều thông tin cùng load dữ liệu đồng thời.

Với các màn hình tổng quan dạng báo cáo nên thiết kế dạng skeleton thể hiện được hình dạng của biểu đồ sẽ giúp người dùng hình dung trước được khi tải dữ liệu xong thì sẽ hiển thị lên giao diện biểu đồ như thế nào.

![](/ds/files/b75e02b09236117e6aa8997f99680656d1f7ebde.png)

Màn hình tổng quan

![](/ds/files/a7cfcb79242bcfce90016c9cabaf3bc96b6312cb.png)

Màn hình có nhiều thông tin load đồng thời và hiển thị dạng card

![](/ds/files/4df1447fdc31946e1a234770dbf7ef15d108aba6.png)

Màn hình thông tin dạng card

#### Sử dụng trong màn danh sách

Các phần dữ liệu tĩnh không cần load từ database lên thì hiển thị luôn, các danh sách cần load dữ liệu sử dụng skeleton để thể hiện trạng thái loading.

![](/ds/files/7380c516a64caac4059888c98dc9f90db6e32c0d.png)

Các màn hình skeleton sẽ tùy vào PD của từng ứng dụng tự thiết kế. Không có kích thước cố định. Tuy nhiên, thiết kế nên thể hiện được đúng layout mà nội dung thật sẽ hiển thị sau khi loading xong.

### 3. Trường hợp làm việc với các thao tác phải chờ đợi lâu

Khi làm việc với dữ liệu lớn để tránh người dùng phải chờ đợi xong thao tác mới có thể làm được việc khác thì có thể thiết kế dạng tiến trình ở góc phải màn hình để báo cho người dùng biết hành động vẫn đang được thực hiện và có trạng thái để biết được tình trạng của hành động.

**Khuyến nghị:** Khi các thao tác có thể làm đồng thời và thời gian chờ >10s thì nên hiển thị dạng tiến trình.

![](/ds/files/f65a415843ea1849fcd7a4ccaed09c30e1d65f8b.png)

Khi bấm nút X (Đóng) ở thanh trên cùng sẽ bật cảnh báo xác nhận hủy bỏ các tiến trình đang thực hiện chưa xong. Bấm X ở từng dòng thì sẽ chỉ hủy bỏ các tiến trình của dòng đó.

![](/ds/files/9887f1be102a1fcc1e29b980d61bac51ced66506.png)

Trường hợp thu gọn các tiến trình

### 4. Tham khảo

https://www.lightningdesignsystem.com/guidelines/loading/#site-main-content

https://cultureamp.design/guidelines/loading-patterns/
