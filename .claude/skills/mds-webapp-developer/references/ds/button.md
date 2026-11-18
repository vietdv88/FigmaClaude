<!-- SINH TỰ ĐỘNG từ mds-docs /ds/button (2026-11-18) — không sửa tay -->
# Button

> Link components: [Tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-3884&m=dev)

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — thao tác thử, đổi mật độ hiển thị, bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/ButtonDemo.vue`
Button (Nút) cho phép người dùng thực hiện các hành động và lựa chọn chỉ với 1 lần nhấn.

## Sử dụng

Bột components đang hỗ trợ đầy đủ các dạng button

Bộ màu của button hiện tại đang hỗ trợ 7 màu lần lượt theo thứ tự của từng cột ở ảnh trên: Brand (Màu chính của app), Info (Màu nút thông tin), Warning (Màu cho các nút cảnh báo), Danger (Màu cho các nút nguy hiểm), Success (Màu các nút thành công), Neutral (Màu nút trung tính tối), Neutral Inverse (Màu nút trung tính sáng)

![](/ds/files/93ef620c48bc0e15af04c87d62ce05bce5197e6d.png)

#### Nút chính

- Nút Primary là nút hành động chính, màu Brand theo màu chính của ứng dụng, giúp người dùng dễ dàng nhận ra và thực hiện thao tác quan trọng như: Lưu, Gửi, Đăng nhập, Mua ngay. **Thường chỉ có một nút Primary trên mỗi màn hình** để định hướng rõ hành động chính.
- Dạng nút đặc có màu brand và không có viền, chữ trắng

![](/ds/files/1b472bb0f84e686819683ae9093155a48ca6427a.png)

#### Nút phụ

- Nút phụ (Secondary) là nút hỗ trợ, ít nổi bật hơn nút chính, dùng cho các thao tác phụ như: Hủy, Quay lại, hoặc các lựa chọn không quan trọng nhất.
- Dạng nút rỗng có stroke và chữ màu đen.
- Trong 1 form nếu có nút chính và nhiều nút phụ thì tất cả nút phụ đều dùng chung một style trên

![](/ds/files/372793990034bbbd4eb919d5f78c785b1096baa4.png)

#### Link button

Link button là nút dạng liên kết, thường có giao diện giống một dòng chữ có thể bấm, dùng để chuyển hướng người dùng tới trang hoặc chức năng khác mà không nhấn mạnh hành động như nút chính hoặc nút phụ.

- Theo component Figma **Button — Style=Text**: cao, khoảng đệm, độ rộng tối thiểu (80px) và bo góc giống nút thường; **không nền, không viền**, chữ 13px Medium màu Brand.
- Rê chuột: hiện nền nhạt (Brand/100) · Bấm: nền đậm hơn (Brand Light Pressed) · Focus bằng bàn phím: vòng màu Brand bao ngoài · Không bấm được: chữ nhạt màu (Brand Disabled).
- Có đủ các màu như nút thường: Brand (mặc định), Neutral (chữ đen, icon xám), Info, Warning, Danger (VD nút Xóa), Success.
- Dùng cho nút đứng riêng dạng link: "Xem tất cả", "+ Thêm dòng", "Tải mẫu"… Liên kết **chèn trong câu** thì dùng chữ link thường (rê chuột gạch chân), không dùng Link button.
- Thi công: class `btn btn--text` (màu khác: `btn--text-neutral`, `btn--text-danger`…) hoặc `<AppButton variant="text">`.

![](/ds/files/6f6fdf02992f6431c03a315970c753f28e97cd13.png)

#### Icon Button

Icon button là nút chỉ hiển thị một biểu tượng (icon), không có chữ, thường dùng cho các thao tác nhanh như: tìm kiếm, xóa, chỉnh sửa, hoặc đóng cửa sổ.

![](/ds/files/b52359b2f4208c1bffad9fddc337716da68580a0.png)

#### Button Split

Button Split là nút được chia thành hai phần: một phần chính thực hiện hành động mặc định, phần còn lại là mũi tên nhỏ mở ra các lựa chọn thêm liên quan đến hành động đó.

![](/ds/files/shot-button-233-381.png)

## Mô tả chi tiết

Kích thước và khoảng cách

![](/ds/files/91b1e25b817bf0bc363fb97a8d82cd2481c1ba99.png)

#### Nút chính

![](/ds/files/e943fdea4a7df64bb9e76df6d9f8832457983043.png)

#### Icon button

![](/ds/files/697ae07026e6956b24ef1506e3a46494c09af764.png)

#### Button Split

Kích thước độ rộng tối thiểu (Min-width) của button là 80px

![](/ds/files/1d94f5b15c24b8f567d4a07403328ffb555186cc.png)

**Radius** của button là: 8px.

## Phân cấp

Sử dụng loại nút tùy theo mức độ nhấn mạnh của hành động trên màn hình. Khi sử dụng nhiều nút, hãy đảm bảo trạng thái khả dụng của một nút không giống trạng thái đã tắt của nút khác.

![](/ds/files/1f681edb635aacf6b0cf7d440c63b22e2550ad1c.png)

## Trạng thái

#### Enable

Trạng thái enable sẽ cho biết một thành phần, phần tử tương tác.

![](/ds/files/ba9ced5870c6da0a01cb544bf4760f9e1de7501c.png)

#### Disable

Là trạng thái bị vô hiệu hóa cho biết một thành phần, phần tử không tương tác được.

Trên các form hạn chế sử dụng nút disable do người dùng khó khăn khi không biết làm gì để có thể enable nút lên bấm được. Hãy enable sẵn, khi người dùng bấm nút mà một số việc nào đó chưa thực hiện thì thông báo lỗi để người dùng thực hiện.

![](/ds/files/7b0cce9cc120dc9836097567cf6e4a94f016a4fc.png)

#### Hover

Là trạng thái khi đang di chuyển chuột của người dùng và dừng lại trên một phần tử. Nó có thể được áp dụng cho tất cả các thành phần tương tác.

![](/ds/files/7acfc1066017100bdacac5a390914d4ea2f84a1e.png)

#### Pressed

Trạng thái pressed cho biết thao tác chạm hoặc nhấp do người dùng thực hiện bằng con trỏ, bàn phím. Trạng thái này áp dụng cho tất cả các thành phần tương tác.

![](/ds/files/82b93aa7a9481f288720c0afa5f32737101ed160.png)

#### Focus

Trạng thái focus của button là lúc nút được viền sáng nổi bật khi người dùng tab tới, giúp biết đang chọn nút nào để dễ bấm nhanh bằng phím tắt.

Trạng thái focus luôn có một viền bên ngoài dày 2px màu Brand (`--stroke-brand`) và cách với button là 2px bằng **khe trắng** (`--white`), bo góc ngoài 12px (= bo nút 8px + 4px). Áp dụng cho **mọi màu và mọi kiểu** (Solid, Outline, Text), chỉ hiện khi người dùng dùng bàn phím (Tab). **Nút icon (Icon Button) và icon button trên header cũng theo đúng quy tắc focus này.** Thi công: class `.btn` / `.btn-icon` đã có sẵn — không tự viết `outline` / vòng mặc định của trình duyệt

![](/ds/files/68104255ab97fcc2ecec5aa1226ce304b720127a.png)

## Khuyến nghị khác

Khi **đặt text trong nút thì nên đặt sao cho ngắn gọn nhất** mà vẫn đầy đủ ý nghĩa muốn truyền tải, **tối đa nên khoảng 3 ký tự**, trừ những trường hợp đặc biệt không thể rút ngắn được ký tự thì mới đặt lớn hơn 3 ký tự.

Ví dụ: Tên nút đặt là Thêm mới hồ sơ nhân viên chỉ cần đặt là Thêm mới vì bản chất đang nằm trong phân hệ hồ sơ rồi nên chỉ cần đặt là Thêm mới người dùng vẫn hiểu được đang thêm cái gì.
