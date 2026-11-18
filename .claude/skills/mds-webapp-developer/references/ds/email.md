<!-- SINH TỰ ĐỘNG từ mds-docs /ds/email (2026-11-18) — không sửa tay -->
# Mẫu email

> Toàn bộ các email sẽ hiển thị tối đa **kích thước hiển thị tối đa là 600px**. Vì một số lý do sau:

## Ví dụ trực quan

Ba mẫu email code sẵn (MISA chung · Nền tảng · Ứng dụng trong nền tảng) — chọn **Máy tính / Điện thoại** để xem responsive: điện thoại thẻ trắng vẫn bo góc 8px, cách mép màn hình 8px, lề nội dung trái / phải **16px** (máy tính 40px). Bên dưới là **mã HTML** để dev sao chép hoặc tải file.

::: warning
Do một số trình email không hỗ trợ định dạng SVG, nên cần export logo dưới dạng ảnh PNG (tỷ lệ 2x). Để tránh lỗi hiển thị khi người dùng tăng kích thước font chữ trên thiết bị di động (khiến tên ứng dụng bị nhảy dòng hoặc lỗi layout), ảnh export nên bao gồm cả logo và tên ứng dụng đi kèm.
:::

> Ví dụ chạy thật: `mds-docs/src/demos/EmailDemo.vue`
## Quy chuẩn kỹ thuật email HTML (responsive)

Áp dụng cho mọi email MISA gửi khách hàng. Mẫu code sẵn ở phần **Ví dụ trực quan** (MISA chung · Nền tảng · Ứng dụng trong nền tảng) — sao chép mã HTML rồi chỉ sửa vùng “NỘI DUNG EMAIL”.

### Khung và khoảng cách

| Thành phần | Máy tính | Điện thoại (màn ≤ 620px) |
|---|---|---|
| Nền ngoài | xám #ECEDEF (BG/Page) | xám #ECEDEF |
| Lề ngoài quanh thẻ trắng | trên 60px · hai bên 10px | trên 16px · hai bên **8px** (để vẫn thấy thẻ bo góc) |
| Thẻ trắng (`.email-card`) | rộng cố định **600px**, căn giữa | rộng 100% màn hình trừ 8px mỗi bên |
| Lề nội dung trái / phải (header, nội dung, dòng ghi chú) | **40px** | **16px** — tối ưu chỗ cho chữ |
| Khối logo header (nền trắng, cao 48px) | đỉnh thẻ → khối logo **24px** · khối logo → nội dung **24px** | 24px · 24px |
| Khối có viền trong nội dung (chi tiết đơn hàng, thông tin tài khoản, banner) | đệm 24–32px | đệm **16px** |
| Footer (bản quyền, địa chỉ, website) | cách thẻ trắng 24px · dưới 32px | cách thẻ 24px · hai bên 16px · dưới 24px |

### Bo góc

| Thành phần | Bo góc |
|---|---|
| Thẻ trắng `.email-card` | **12px** (Radius/Dialog-Card-Popover) — cả máy tính và điện thoại (không bỏ bo góc trên mobile) |
| Khối có viền trong nội dung (viền #99C5F7 liền / nét đứt) | **12px** |
| Nút hành động (Thanh toán ngay, Kích hoạt ngay…) | 8px |
| Logo ứng dụng vuông (VD Quy trình) | 8px (đã vẽ sẵn trong ảnh) |

Thẻ trắng có bóng rất nhẹ `0 0 2px rgba(0,0,0,0.10)` để tách khỏi nền xám.

### Chữ

- Nội dung 14/20 màu #10141B; chữ phụ 13/20 màu #6B707A; footer 12/16 màu #6B707A; link #1570EF không gạch chân.
- Dòng “* Đây là email tự động từ hệ thống, Quý khách vui lòng không phản hồi.” luôn đặt **cuối nội dung**, chữ nghiêng 13px màu phụ.
- Footer cố định cho mọi email: © 1994 - năm hiện tại MISA JSC · địa chỉ · Website **www.misa.vn** · Email support@misa.com.vn.

### Header logo

- MISA chung: chỉ logo MISA · Nền tảng: logo + tên nền tảng · Ứng dụng: logo nền tảng bên trái | logo + tên ứng dụng bên phải.
- Logo **và tên ứng dụng gộp thành 1 ảnh PNG @2x**, **bọc nền trắng** (xem “Xuất ảnh logo có bọc nền trắng” bên dưới): người đọc tăng cỡ chữ trên điện thoại thì header giữ nguyên, chỉ chữ nội dung to lên.
- Ảnh logo responsive: `width` = cỡ hiển thị 1x, style `max-width:100%; height:auto` → màn hẹp tự thu nhỏ, không tràn khung.
- Luôn có `alt` (VD “MISA AMIS – Quy trình”) để vẫn đọc được khi ứng dụng mail chặn ảnh.

#### Xuất ảnh logo có bọc nền trắng

Ảnh logo / tên ứng dụng ở header **phải có nền trắng đặc bọc quanh logo** — không xuất nền trong suốt. Lý do: logo chữ đen trên nền trong suốt sẽ **chìm** khi người dùng mở email bằng **Gmail dark mode** (nền email bị đổi sang tối).

Cách xuất từ Figma (mỗi ảnh là 1 file PNG @2x):

1. Trong Figma, khối header là khung **520×48** (thẻ 600px trừ lề 40px mỗi bên), nền **trắng #FFFFFF**, **bo góc 8px**; logo nằm **chính giữa** khung với **kích thước chuẩn** (MISA 98×40 · MISA AMIS 174×32 · MISA AMIS | Quy trình 341×32). **Không phóng to / thu nhỏ logo.**
2. Xuất **PNG @2x** khung đó, rồi **cắt sát khung logo, chừa đệm 8px mỗi bên (trái / phải)** — ảnh gửi trong email KHÔNG phải cả khung 520px (xem lý do bên dưới). Trên / dưới giữ nguyên chiều cao 48px.
3. Bốn góc bo 8px (16px ở @2x) để **trong suốt**, phần còn lại là trắng đặc.
4. Chèn vào email: `width` = chiều rộng 1x của ảnh đã cắt, `height:auto; max-width:100%; border-radius:8px`, kèm `alt` đầy đủ. Ảnh chỉ thu nhỏ khi màn hình hẹp hơn chính nó.
5. **Khoảng cách không đổi**: đỉnh thẻ → ảnh logo 24px · ảnh logo → nội dung 24px (đệm quanh logo nằm trong ảnh, không cộng thêm ngoài HTML).

| Header | Khung logo (Figma) | Ảnh trong email (1x) | File xuất (@2x) |
|---|---|---|---|
| MISA chung | 98×40 | 114×48 | 228×96 |
| Nền tảng (AMIS) | 174×32 | 190×48 | 380×96 |
| Ứng dụng (AMIS Quy trình) | 341×32 | 357×48 | 714×96 |

**Vì sao không dùng cả khung 520px?** Ảnh rộng 520px bị thu theo bề ngang trên điện thoại (còn ~327px) làm logo nhỏ theo, còn chuyển ảnh bằng media query thì không hoạt động ở ứng dụng mail bỏ khối `<style>`. Ảnh cắt sát logo luôn giữ đúng cỡ trên mọi ứng dụng; riêng logo “MISA AMIS | Quy trình” (341px) rộng hơn vùng nội dung của điện thoại nên thu nhỏ còn ~92% — chấp nhận được.

### Lưu ý giới hạn của các ứng dụng email

- **Không dùng ảnh SVG**: Gmail (web và app) và Outlook Windows không hiển thị SVG → dùng **PNG @2x** (hoặc JPG cho ảnh chụp).
- **Không dùng JavaScript** (`<script>`): mọi ứng dụng mail đều chặn. Năm bản quyền, tên khách hàng… phải do hệ thống gửi mail điền sẵn.
- **Bố cục bằng `<table role="presentation">`**, không dùng flex / grid / position — Outlook dùng bộ hiển thị của Word, chỉ hiểu bảng.
- **CSS viết inline** trên từng thẻ (`style="…"`); khối `<style>` chỉ để chứa `@media` cho điện thoại (Gmail app có thể bỏ khối `<style>` → email vẫn đọc được ở bố cục máy tính co lại).
- Outlook Windows **không hiện bo góc, bóng đổ, `max-width`, gradient** → thiết kế vẫn phải ổn khi mất các hiệu ứng này (banner gradient cần màu nền đơn dự phòng).
- **Dark mode (Gmail, Apple Mail)** tự đảo màu và **không có `!important` nào thắng được**: chữ trắng đặt trên nền màu (nút, banner) dùng `#fffffe` (không dùng `#ffffff`) kèm `-webkit-text-fill-color`; nền màu của nút / banner đặt thêm `background-image: linear-gradient(màu, màu)` cùng màu nền — phần tử có ảnh nền không bị đảo màu (nền không ngả tím, chữ không bị đổi sang đen). Logo header xử lý bằng nền trắng bọc trong ảnh (xem “Xuất ảnh logo có bọc nền trắng”).
- **Ảnh phải là đường dẫn tuyệt đối** `https://…` trên máy chủ công khai; đường dẫn tương đối `images/…` chỉ dùng khi xem thử.
- Font web (Inter) nhiều ứng dụng không tải → luôn khai báo dự phòng `font-family: Inter, Arial, sans-serif`.
- Chuỗi dài không có khoảng trắng (email, link) cần `word-break: break-word` để không đẩy tràn khung trên màn hẹp.
- Thêm `-webkit-text-size-adjust:100%` cho body để iPhone không tự phóng chữ khi xoay ngang.
- Nút hành động dùng thẻ `<a>` có nền + đệm + bo góc (không dùng `<button>`, không dùng ảnh làm nút).
- **Link văn bản** theo quy chuẩn link chung: màu Info 700 `#1570ef`, **bình thường không gạch chân**, rê chuột vào thì **gạch chân** và đổi sang Info 800 `#175cd3` (`--text-link-default-hover`). Đặt class `email-link` cho link và thêm vào `<style>`: `.email-link:hover { text-decoration:underline !important; color:#175cd3 !important; }`. Link dài (địa chỉ web hiển thị nguyên văn) cũng theo quy tắc này, không gạch chân cố định. Giới hạn hover giống nút bên dưới.
- **Trạng thái Hover của nút**: CSS inline không viết được `:hover`, nên đặt class `email-btn` cho nút và thêm 1 dòng trong `<style>`: `.email-btn:hover { background-color:#2753ce !important; }` (= `--bg-brand-hover`, cùng màu hover của nút chính trên web app: theme xanh mặc định là Brand 700 `#2753ce`; theme khác lấy `--bg-brand-hover` của theme đó, VD AMIS Quy trình (Cyan) là Brand 800 `#066986`). Hover hiện ở **Apple Mail, Gmail (web + app), Outlook Mac / iOS**; **Outlook Windows** và một số ứng dụng bỏ `<style>` thì không hiện — nút vẫn bấm bình thường, nên hover chỉ là phần thêm, không được là cách duy nhất để nhận ra nút. Không có Pressed / Focus / Disabled: ứng dụng mail không hỗ trợ ổn định, không thiết kế các trạng thái này cho email.

- Tương thích tốt với hầu hết ứng dụng email như Gmail, Outlook, Apple Mail.
- Hiển thị ổn định trong khung đọc email trên máy tính.
- Dễ đọc hơn, tránh dòng văn bản quá dài.
- Thân thiện với thiết bị di động, dễ dàng co giãn theo màn hình.
- Hạn chế lỗi vỡ bố cục giữa các ứng dụng email.


![](/ds/files/ea8080c8fcf2a65f235383fe3212cbc7d02966a2.png)

Cấu trúc của email sẽ chia làm 3 vùng chính:

1. **Header:** Chứa các logo cty, logo nền tảng, logo sản phẩm tùy vào từng trường hợp liệt kê bên dưới
2. **Nội dung:** Tự do thiết kế nhưng đảm bảo nội dung responsive được để dễ dàng xem được email ở nhiều thiết bị khác nhau. Tuy nhiên dòng này “* Đây là email tự động từ hệ thống, Quý khách vui lòng không phản hồi” cần đặt cố định ở cuối của nội dung
3. **Footer:** Cố định, tất cả các loại email đều cố định các thông tin này

Header và nội dung email cần đặt trong box có nền trắng và các thông số về khoảng cách như trên hình, nền chung của email bên ngoài là nền xám theo mã màu BG/Page của DS 2.0

### Phần Header của email sẽ thay đổi logo theo các trường hợp sau:

- **Loại email gửi từ MISA chung không thuộc 1 nền tảng hay sản phẩm cụ thể nào**, ví dụ email từ MISA ID, MISA Store...thì **chỉ hiển thị logo MISA ở vùng này**

![](/ds/files/8ce5b1c81efd46b2efebc02489ecfba74261f6d6.png)

Ví dụ email đặt hàng từ MISA Store

![](/ds/files/7fa330d5ea0af8b9f519a075443237b9a27f42e6.png)

Ví dụ email tạo tài khoản MISA ID cho khách hàng từ MISA Store

- **Loại email gửi thông báo chung từ 1 nền tảng của MISA mà không phải là của 1 app cụ thể nào**, ví dụ email gửi thông báo KH vừa đăng ký tài khoản dùng thử trên MISA AMIS, iHOS, iGOV thì sẽ **chỉ hiển thị logo của nền tảng chung.**

![](/ds/files/91871fa760ef2fe9e80d720a889ad863c08a4561.png)

- **Loại email gửi thông báo từ cụ thể 1 ứng dụng trong 1 nền tảng**, ví dụ: Thông báo công việc mới từ AMIS Công việc, thông báo đơn nghỉ phép được duyệt từ AMIS Chấm công, thông báo quy trình cần thực hiện từ AMIS Quy trình...thì **cần hiển thị 2 logo là logo nền tảng bên trái, logo của app bên phải.** Mục đích tăng độ nhận diện sản phẩm của nền tảng và đang gửi từ cụ thể app nào để dễ theo dõi.

![](/ds/files/d6a31cbcda84a302ff72fdea5c0b0d1950494ff0.png)

Ví dụ email gửi từ app AMIS Quy trình trong MISA AMIS

![](/ds/files/90dc398f019f435fecc139e602b9541525bbc9b6.png)

Ví dụ email gửi từ app AMIS Wesign trong MISA AMIS

![](/ds/files/480159f2cafbda4559503e15a5ae2875c24de227.png)

Ví dụ email gửi từ app AMIS Chấm công trong MISA AMIS

### Vì sao 2 trường hợp sau không hiển thị cả logo MISA?

Phần footer của email đã chứa đầy đủ thông tin về công ty MISA, địa chỉ, website, email...nên không cần thiết phải đưa thêm logo vào sẽ gây rối cho người dùng.

### Các email dạng bảng thì xử lý thế nào?

![](/ds/files/70a5d3b0b6314a89ccfd2c833dfbe0e3c73e3641.png)

Hầu hết người dùng sử dụng các thiết bị mobile nên khi thiết kế cần phải tính toán để làm sao responsive được. Ví dụ email trên có thể thiết kế lại dạng bảng thành dạng như ảnh bên dưới.

![](/ds/files/6cda6a2076a24b662f3a50663ef6fed782b2ba8a.png)

Template thiết kế email đặt tại đây: [https://www.figma.com/design/rkaeZokeZ53UB4e9fO98l7/Quy-chu%E1%BA%A9n-chung?node-id=38557-3362&m=dev&t=Q30bQwKhoD9fEW1E-1](https://www.figma.com/design/rkaeZokeZ53UB4e9fO98l7/Quy-chu%E1%BA%A9n-chung?node-id=38557-3362&m=dev&t=Q30bQwKhoD9fEW1E-1)
