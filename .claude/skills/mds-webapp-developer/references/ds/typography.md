<!-- SINH TỰ ĐỘNG từ mds-docs /ds/typography (2026-11-18) — không sửa tay -->
# Kiểu chữ

> Quy định về loại font chữ, kích thước sử dụng

## Ví dụ trực quan

Bộ Text Styles đang dùng trong mds-ui, hiển thị bằng chữ thật. Chọn **mode** của collection 🔢 Font Size (Small · Medium · Large · Mobile Responsive) để xem cỡ chữ và chiều cao dòng thay đổi — người dùng đổi cho cả ứng dụng ở **Thiết lập hiển thị › Cỡ chữ**; màn ≤ 640px tự dùng mode Mobile Responsive. Bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/TypographyDemo.vue`
MISA thống nhất sử dụng font chữ Inter cho tất cả các ứng dụng.

Font chữ Inter là một font chữ sans-serif hiện đại, được thiết kế tối ưu cho giao diện số và đọc trên màn hình. Nó có các đặc điểm như: nét chữ rõ ràng, cân đối, độ rộng và chiều cao ký tự phù hợp giúp tăng khả năng đọc.

Chi tiết về font chữ Inter xem tại đây: https://rsms.me/inter/

![](/ds/files/577112633d19eb9f1174ec94a52025f8d5ce5359.png)

Kích thước font chữ tiêu chuẩn hiển thị là 13px, một số chữ hiển thị như nội dung văn bản dài thì có thể linh hoạt chọn trong bộ Text Styles đã định nghĩa sẵn bên dưới.

#### Text Styles

#### H1 - Banner Title

Dành cho các tiêu đề lớn trên các banner

![](/ds/files/a4b0a3e2712210f6a7fa0f029761259337fa31e0.png)

#### H2 - App, Page Title

Dùng cho tiêu đề app, tiêu đề của page

![](/ds/files/f66b8489586abe33422ac52242db6123e5823b01.png)

![](/ds/files/shot-typography-46-1220.png)

#### H3 - Form, Card, Section, Group Title

Dùng cho tiêu đề các form, popup, Dialog, Section, Group...Các thông tin cần nhấn mạnh hơn chữ tiêu chuẩn bình thường

![](/ds/files/14e5db936d2292f056e46a2608b63560123290c0.png)

![](/ds/files/shot-typography-44-1204.png)

#### Body Regular

Đây là font size tiêu chuẩn, sử dụng thường xuyên nhất, nếu không có lý do gì đặc biệt thì toàn bộ sử dụng font size này

![](/ds/files/9770af4883a599b2656f3209b77c3f93868d6980.png)

- **Regular:** Font chữ bình thường hiển thị cho các label, dữ liệu trên bảng, mô tả...toàn bộ các dữ liệu thông thường khác.
- **Medium:** Dành cho các chữ bên trong Button, Tag, Header của bảng, Navigation text
- **Semi Bold:** Dành cho một số nội dung hiển thị cần phân cấp mạnh hơn medium. Ví dụ: Tên người
- **Bold:** Dành cho các Data number cần nhấn mạnh

#### Body Large

Dùng cho các đoạn văn bản lớn, text động trong các control như Rich Text, nội dung bài viết.

![](/ds/files/7726bb46933733f68c1fad9938cca7b712905ad8.png)

![](/ds/files/34dc5bcdd7ca2b704abec07b4023fc61aee78b39.png)

![](/ds/files/shot-typography-47-1272.png)

## Hướng dẫn dev thi công font chữ (tránh mất dấu chữ HOA tiếng Việt)

Lỗi hay gặp: chữ HOA có **dấu chồng** như “CÔNG TY CỔ PHẦN”, “Ỷ”, “Ẩ”, “Ỗ”, “Ầ” bị **cụt dấu hỏi / huyền / ngã** ở ô nhập, nút, tag, ô bảng bị cắt “…”. Dấu chồng của chữ HOA nằm **cao hơn** khung chữ thường. Chỗ nào **cắt nội dung** (`overflow: hidden`, ô nhập, chiều cao cố định) mà **line-height thấp** thì phần dấu bị cắt mất. Làm đủ 7 bước dưới đây. Dùng mds-ui thì bước 1–4 đã có sẵn trong `style.css`, chỉ cần không ghi đè sai.

#### Bước 1 — Tự host font Inter bản đầy đủ (có tiếng Việt)

Lấy 2 file `InterVariable.woff2` và `InterVariable-Italic.woff2` trong `mds-ui/src/fonts/` (Inter v4, rsms.me/inter), đặt cạnh file CSS. ⛔ Không dùng bản Inter cắt bớt chỉ có bộ chữ `latin`: chữ có dấu sẽ lấy font khác, dấu lệch và cao thấp không đều.

```css
@font-face {
  font-family: InterVariable;
  font-style: normal;
  font-weight: 100 900;          /* font biến thiên: 1 file đủ mọi độ đậm */
  font-display: swap;
  src: url('./fonts/InterVariable.woff2') format('woff2');
}
@font-face {
  font-family: InterVariable;
  font-style: italic;
  font-weight: 100 900;
  font-display: swap;
  src: url('./fonts/InterVariable-Italic.woff2') format('woff2');
}
```

(Tùy chọn) Nạp font sớm để không bị nháy chữ: đặt font ở thư mục `public/fonts/` để đường dẫn không đổi sau khi build, rồi thêm vào `<head>` của `index.html`. Dùng mds-ui (font nạp qua `style.css`, tên file có mã băm) thì bỏ qua bước này.

```html
<link rel="preload" href="/fonts/InterVariable.woff2" as="font" type="font/woff2" crossorigin>
```

#### Bước 2 — Khai báo font cho toàn trang, ô nhập và lớp nổi

```css
:root { --font-family: InterVariable, 'Inter var', sans-serif; }

body {
  font-family: var(--font-family);
  font-size: var(--text-body);          /* 13px */
  line-height: var(--text-body-lh);     /* 20px — không để 'normal' hay 1 */
  font-weight: var(--fw-regular);       /* 400 */
  font-feature-settings: 'liga' 1, 'calt' 1, 'tnum' 1, 'lnum' 1;   /* số đều độ rộng, thẳng hàng trong bảng */
  -webkit-font-smoothing: subpixel-antialiased;
}
/* Trình duyệt KHÔNG cho ô nhập kế thừa font → ép kế thừa */
button, input, select, textarea { font-family: inherit; font-size: inherit; }
/* Popup / menu / tooltip gắn thẳng vào <body> (Teleport) cũng phải có font */
body > * { font-family: var(--font-family); }
```

#### Bước 3 — Luôn dùng cặp token cỡ chữ + chiều cao dòng

Không viết `line-height: 1`, `line-height: normal` hay chiều cao cố định thấp hơn chiều cao dòng. Chiều cao dòng phải **≥ 1,4 lần cỡ chữ**.

| Kiểu chữ | Cỡ chữ / chiều cao dòng | Token |
|---|---|---|
| Body (mặc định) | 13 / 20 | `--text-body` · `--text-body-lh` |
| H3 | 16 / 22 | `--text-h3` · `--text-h3-lh` |
| H2 | 20 / 28 | `--text-h2` · `--text-h2-lh` |
| Caption | 10 / 15 | `--text-caption` · `--text-caption-lh` |

```css
/* ✅ Đúng */
.card__title { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); }
/* ⛔ Sai — dấu hỏi trên Ổ bị cắt khi khối có overflow:hidden */
.card__title { font-size: 16px; line-height: 1; overflow: hidden; }
```

#### Bước 4 — Ô nhập: chiều cao của `<input>` = chiều cao dòng

Chrome cắt chữ trong `<input>` theo **chiều cao dòng của vùng soạn thảo bên trong**, không theo chiều cao ô. Với `line-height: normal` (khoảng 16px), dấu chồng của chữ HOA bị cắt. Cách sửa: cho `<input>` cao gần bằng cả khung và **line-height bằng đúng chiều cao đó**.

```css
.ibox { display: flex; align-items: center; height: var(--input-height); padding: 0 8px 0 12px; }
.ibox__native {
  flex: 1; min-width: 0; align-self: center; padding: 0; border: none;
  height: calc(var(--input-height) - 8px);        /* 24px ở mật độ Trung bình */
  line-height: calc(var(--input-height) - 8px);   /* = height → chữ tự căn giữa dọc, đủ chỗ cho dấu */
  overflow-clip-margin: 6px;                      /* cho dấu được vẽ tràn nhẹ ra ngoài vùng cắt */
}
```

⛔ Không ghi đè `height` / `line-height` cho input nằm trong `.ibox`. Dùng sẵn `AppTextbox` / `AppCombobox` / `AppDatebox` thì đã đúng.

**Chữ gợi ý (placeholder) bị cắt dấu kể cả khi ô đủ cao.** Chrome vẽ placeholder trong một khối riêng, chiều cao đúng bằng dòng chữ và có `overflow` ẩn. Nới khối đó ra rồi kéo lại bằng margin âm: chữ không dịch, dấu không bị cắt. mds-ui đã có sẵn:

```css
input::placeholder { padding: 4px 0; margin: -4px 0; }
```

**Ô có viền đặt thẳng trên `<input>`** (không bọc khung `.ibox`): `line-height` phải bằng **cả chiều cao ô** (VD ô 28px → `line-height: 28px`). Nhỏ hơn dù 2px cũng bị cắt dấu. Tốt nhất là không tự dựng: **ô sửa trực tiếp trên bảng cũng dùng control chuẩn** (DataTable `editable` đã dùng `AppTextbox` / `AppNumberbox` / `AppCombobox` kiểu `ghost`).

#### Bước 5 — Chữ một dòng bị cắt “…”

`overflow: hidden` cắt luôn cả phần dấu nhô lên. Giữ chiều cao dòng theo token. Nếu khối buộc phải thấp (tag, chip) thì canh giữa bằng `display: inline-flex; align-items: center` và **không** đặt `line-height` nhỏ hơn token.

```css
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: var(--text-body-lh); }
.tag { display: inline-flex; align-items: center; height: 24px; padding: 0 8px; line-height: var(--text-body-lh); }
```

#### Bước 6 — Chuẩn hóa dữ liệu tiếng Việt về NFC

Dữ liệu dán từ Word, Excel hay máy Mac đôi khi ở dạng **tổ hợp** (NFD): chữ và dấu là 2 ký tự riêng. Khi đó dấu chồng hiển thị lệch, so sánh và tìm kiếm cũng sai. Chuẩn hóa khi nhập liệu và khi nhập file:

```js
const clean = s => String(s ?? '').normalize('NFC').trim()
// Ô nhập: lưu clean(value) · nhập Excel/CSV: clean() từng ô · tìm kiếm: so sánh clean(a) với clean(b)
```

#### Bước 7 — Kiểm tra trước khi bàn giao

Dán chuỗi thử dưới đây vào **ô nhập, nút, tag, ô bảng bị cắt “…”, tiêu đề popup**:

```
CÔNG TY CỔ PHẦN MISA — Ỷ Ẩ Ỗ Ầ Ở Ễ Ữ Ậ — công ty cổ phần
```

- Xem ở cả 3 mật độ **Nhỏ / Trung bình / Rộng**: Nhỏ có ô thấp nhất nên dễ lỗi nhất.
- Chrome, Edge, Safari, Firefox; Windows ở tỉ lệ màn hình 100% và 125%.
- Mọi dấu hỏi, ngã, huyền trên chữ HOA phải hiện đủ, không bị cắt ngang. Khi gõ trong ô, vùng bôi đen cách viền ô 4px trên dưới.

#### Thử trực tiếp

Ô nhập, nút, tag và bảng sửa trực tiếp dưới đây dùng control thật của mds-ui, điền sẵn chữ HOA có dấu chồng. Bấm vào ô để gõ / sửa và kiểm tra dấu không bị cắt.

> Ví dụ chạy thật: `mds-docs/src/demos/FontCheckDemo.vue`
