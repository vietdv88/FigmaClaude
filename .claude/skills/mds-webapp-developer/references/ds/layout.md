<!-- SINH TỰ ĐỘNG từ mds-docs /ds/layout (2026-11-18) — không sửa tay -->
# Bố cục trang

> Quy định về các loại bố cục, khi nào sử dụng

## Màn hình tổng quan

> Ví dụ chạy thật: `mds-docs/src/demos/LayoutDashboardDemo.vue`
Giao diện màn hình tổng quan của các ứng dụng

![](/ds/files/992c69398592d1d789be63ba587f0de39d5e0f2f.png)

Cho phép tạo ra nhiều màn hình Giao diện (mỗi giao diện chứa nhiều loại biểu đồ khác nhau theo nhu cầu), có thể kéo thả vị trí, điều chỉnh độ rộng...Đồng nhất nút Lưu, Hủy phía cuối trang như các loại giao diện khác.

![](/ds/files/a19534bce6224231891e8e98d1bac4378d522e98.png)

## Màn hình danh sách

> Ví dụ chạy thật: `mds-docs/src/demos/LayoutListDemo.vue`
Màn hình danh sách có màu nền xám, có khoảng cách giữa bảng và lề xung quanh để giao diện nhìn thoáng.

Thông thường nếu không phải dạng giao diện Master-Detail thì sẽ bấm vào dòng để chuyển vào trang chi tiết hoặc bật popup để xem dữ liệu chi tiết.

![](/ds/files/f3b1e0076f492789fc6e450904cf99c0c1f74fde.png)

Trên đây là các thành phần chính trên toolbar của bảng.

<br>**Quy tắc sắp xếp:**
- Bên trái: Hiển thị tiêu đề của bảng.
- Bên phải: Chứa các chức năng thao tác với bảng.
   - Nút chính: Luôn đặt ở vị trí ngoài cùng bên phải.
   - Nút phụ: Đặt bên trái nút chính. Các chức năng phụ thường dùng sẽ được đưa ra đây.
   - Nút "More": Nếu có nhiều chức năng khác, nút "More" sẽ nằm ngay bên phải nút chính. Vị trí này phù hợp với thói quen UX, khi các tính năng bổ sung thường được đặt bên phải giao diện.

### Một số dạng thể hiện khác của màn hình danh sách

#### Danh sách có chứa nhiều tab

Dạng danh sách có chứa nhiều tab, mỗi tab là một danh sách khác nhau. Ví dụ: Kế toán trong phân hệ Tiền gửi có các tab: Quy trình, Đề nghị chi tiền, Thu, chi tiền...mỗi tab có một nội dung khác nhau.

![](/ds/files/b8f854376b7911261b6c12e17c4dad5b22b4c446.png)

#### Danh sách dạng Master bên trái rộng, Detail bên phải nhỏ

**Đặc điểm:**
- Cột master (bên trái) hiển thị bảng/thông tin nhiều trường hoặc dữ liệu phong phú.
- Cột detail (bên phải) chỉ thể hiện thông tin chi tiết ngắn gọn, tóm tắt, đôi khi chỉ là preview hoặc các thuộc tính phụ.
<br>**Phù hợp với:**
- Khi cần quản lý khối lượng lớn bản ghi và thao tác liên tục trên nhiều mục (như bảng dữ liệu lớn, danh mục sản phẩm, danh sách hồ sơ…).
- Người dùng cần xem và xử lý nhanh trên danh sách nhiều thông tin, trong khi chi tiết chỉ là tham khảo, không cần thao tác sâu.
- Tác vụ lọc, kiểm tra, duyệt nhanh các bản ghi mà không cần chỉnh sửa quá sâu từng mục.

![](/ds/files/31a8a48844843b33a431f17cad1c84a3fe924523.png)

#### Danh sách dạng Master bên trái nhỏ, Detail bên phải rộng

**Đặc điểm:
- Cột master (bên trái) chỉ hiển thị thông tin tóm tắt như tên, mã, tiêu đề hoặc trạng thái.
- Cột detail (bên phải) hiển thị nội dung chi tiết phong phú và đầy đủ, có thể bao gồm nhiều trường, bảng phụ, lịch sử, mô tả chi tiết…<br>
Phù hợp với:
- Khi người dùng cần chọn nhanh mục tiêu từ danh sách (chỉ cần thông tin nhận diện ngắn gọn) và làm việc sâu với từng bản ghi (xem chi tiết, chỉnh sửa, xử lý nghiệp vụ sâu...).
- Ứng dụng các tình huống: quản lý hồ sơ khách hàng, xem chi tiết hợp đồng, soạn thảo tài liệu, duyệt lịch sử phiếu, xử lý workflow phức tạp…**

![](/ds/files/f9ef7db7accecf74807d75ed103ffc1232516786.png)

#### Danh sách dạng Master ở trên, detail ở dưới

**Đặc điểm
- Phần master nằm phía trên hiển thị danh sách (thường là dạng bảng hoặc danh sách lớn).
- Phần detail nằm phía dưới và hiển thị thông tin chi tiết, có thể dạng tab hoặc từng vùng mở rộng tương ứng dòng đang chọn ở master.
- Thường áp dụng nhiều ở các ứng dụng quản lý dữ liệu dạng bảng, khi người dùng muốn xem nhanh chi tiết mà không rời khỏi ngữ cảnh danh sách tổng.<br>
Phù hợp với:
- Quản lý danh sách lớn trên không gian dọc: Sử dụng tối ưu màn hình rộng, phù hợp với thao tác desktop.
- Cần so sánh/cập nhật liên tục nhiều bản ghi: Có thể chuyển nhanh dòng trong bảng và xem hoặc sửa chi tiết của từng dòng ngay phía dưới mà không mất vị trí trên danh sách.
- Giao diện dashboard hoặc màn hình tổng hợp: Khi cần tổng hợp vừa xem vừa thao tác trên cả bảng tổng và chi tiết, như các ứng dụng CRM, quản lý công việc, đơn hàng…
- Làm việc với các nghiệp vụ phức hợp: Khi detail thường chứa nhiều tab hoặc module con, việc đặt xuống dưới giúp không gian detail rộng hơn, dễ thao tác.**

![](/ds/files/f25e592588c2fc380eb8c598a3c12c0bf0a8d811.png)

#### Danh sách dạng Master ở bên trái, detail dạng drawer bên phải

**Đặc điểm
- Phần master nằm ở bên trái, khi bật xem detail bên phải dạng drawer vẫn có thể bấm vào từng dòng detail bên trái để load detail trên drawer (khác popup không thể bấm được dòng khi show popup)
- Phần detail che đè lên danh sách gần giống popup, có thể co kéo độ rộng của để xem nhiều thông tin hơn.<br>
Phù hợp với:
- Giao diện cần độ rộng của thông tin chi tiết linh hoạt mà không làm xô lệch giao diện của danh sách bên dưới.
- Giao diện danh sách bên dưới là các card như Công việc...muốn xem nhanh nội dung chi tiết của từng công việc.**

![](/ds/files/ecc6b8da4a1267994c8d19287b119f184725f2e3.png)

#### Danh sách dạng card

**Đặc điểm:
- Sắp xếp hiện đại, bố cục trực quan, đẹp mắt.
- Dòng thoáng, khoảng cách hợp lý, không bị rối mắt.
- Hiển thị linh hoạt nhiều thông tin phi cấu trúc: mô tả dài, tag, trạng thái, hình ảnh, nút thao tác…
- Phù hợp khi muốn làm nổi bật từng mục, hoặc khi mỗi bản ghi có thông tin hiển thị đa dạng, không theo mẫu cố định.<br>
Phù hợp với:
- Danh sách cần nổi bật từng mục: task, tuyển dụng, ticket, sản phẩm, thông báo...
- Khi muốn thao tác trực tiếp nhanh trên từng đối tượng.
- Giao diện hiện đại, trực quan, đặc biệt tối ưu cho mobile.**

![](/ds/files/e3cc4765fc27e78831355509c5cae5316ff9b235.png)

## Màn hình thêm và sửa

> Ví dụ chạy thật: `mds-docs/src/demos/LayoutFormDemo.vue`
Đối với màn hình Thêm, Sửa ở tất cả các dạng thì **nút Lưu và Hủy luôn ghim ở vị trí cuối cùng của trang**, theo đúng thói quen của người dùng khi nhập liệu từ trên xuống sẽ bấm Lưu, thay vì phải đưa chuột lên trên để tìm bấm nút Lưu.

#### Màn hình thêm dạng page

Dành cho các ứng dụng có màn hình thêm dữ liệu không quá nhiều trường thông tin cần phải mở rộng full trang

![](/ds/files/95cc01f8986fd6a7a9b99830e8260de5f13ce574.png)

#### Màn hình thêm dạng Popup nhỏ

Áp dụng cho các màn hình danh mục, các thông tin trên màn hình thêm ít và đơn giản.

![](/ds/files/9f7e61a6e83de62dc6cc5ff9b4f1810bad13a04a.png)

#### Màn hình thêm dạng Popup full màn hình

- Áp dụng cho các màn hình thêm phân hệ chứa rất nhiều thông tin, cần tối ưu hết mức không gian hiển thị để thể hiện.
- Các thông tin trên popup có thể bố trí tùy thuộc vào nghiệp vụ của mỗi ứng dụng.

![](/ds/files/f078adbf0d5c7a3248a5fa66dc42c012dd9f334d.png)

## Màn hình chi tiết

> Ví dụ chạy thật: `mds-docs/src/demos/LayoutDetailDemo.vue`
#### Tách màn hình xem riêng khác với cách bố trí thông tin của màn hình sửa

- Dùng cho các giao diện phức tạp, khi thêm hoặc sửa thường chỉ thêm sửa một số thông tin cơ bản, còn khi vào xem chi tiết bản ghi có thể làm cập nhật thêm nhiều thông tin chi tiết khác. Ví dụ: Hồ sơ nhân viên, Tiềm năng, Cơ hội trong CRM...
- Giao diện xem cần bố trí thông tin khác biệt hẳn so với view sửa.
- Luôn ghim các phím chức năng thao tác với bản ghi ở góc trên, bên phải.
- Hover vào từng trường thông tin chi tiết cho phép chỉnh sửa, khi nhu cầu chỉnh chi tiết 1 vài trường thì sửa luôn mà không cần mở cả form sửa.

![](/ds/files/544f2d48770e0aeefb9e64a0eaca999a787c24c7.png)

Giao diện xem chi tiết dạng page có thêm các thông tin tổng quan, chi tiết có chưa nhiều tab chia nhóm các thông tin khác nhau.

![](/ds/files/fdd40bc95cf6912b79c7918fb2f4ea52f006a7e0.png)

Màn hình xem dạng Popup ít thông tin

![](/ds/files/7ead76652cad9f576f54dc6dd40b64f21a7fbbeb.png)

Màn hình xem dạng Popup full page chứa nhiều thông tin

![](/ds/files/6e4c8be7906a013cc7d1c7f8268a4760c80a5d86.png)

#### Sử dụng chung màn hình sửa nhưng disable các control

- Giao diện xem và sửa y hệt nhau
- Đồng nhất giao diện khi xem vừa sửa
- Không phát sinh nhu cầu tùy biến UI khi xem
- Tận dụng được giao diện sửa không phải thi công nhiều

![](/ds/files/16fc083736b9298b33f60344e9c08570c376079d.png)

#### Không tách mode xem riêng, bấm xem đồng thời sửa luôn

Dùng cho các form dữ liệu đơn giản, thao tác cập nhật là chính, rủi ro thấp của việc chỉnh sửa. Ví dụ: Các bước trong quy trình, mở vào xem cập nhật rồi chuyển tiếp hoặc duyệt...

![](/ds/files/2f2cf00773f723ed897a415a063694fc7abb5b1b.png)

::: warning
Lưu ý: Quy tắc hiển thị các nút Primary và More (icon 3 chấm)
Nút More luôn nằm phía bên phải của nút Primary, và 2 nút này luôn nằm phía ngoài cùng bên phải của form.
:::
