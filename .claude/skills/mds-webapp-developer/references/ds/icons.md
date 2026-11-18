<!-- SINH TỰ ĐỘNG từ mds-docs /ds/icons (2026-11-18) — không sửa tay -->
# Icons

> Quy định về các kích thước phổ biến của icon, lưới vẽ, stroke...

## Ví dụ trực quan

Tra cứu bộ icon đang có sẵn trong mds-ui — gõ để tìm, đổi cỡ 16 / 20 / 24 / 32px, bấm icon để chép mã. Bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/IconsDemo.vue`
## Cách thi công

Dành cho lập trình viên: lấy mã icon ở khung trên, dán vào màn hình đang làm, không cần tải file SVG.

#### 1. Chép mã icon

1. Ở khung **Ví dụ trực quan** phía trên: gõ tên để tìm (VD `user`, `trash`, `chart`).
2. Chọn **Cỡ**, **Màu**, **Trạng thái** (Mặc định · Bấm được có Hover · Disabled) và **Kiểu** (Nét · Đặc) — theo component Icon Swap trên Figma. Chọn **Bấm được** rồi rê chuột lên icon để xem màu Hover.
3. Bấm vào icon → mã được chép sẵn vào clipboard (góc màn hình báo “Đã chép …”).

Mã chép được luôn theo **Cỡ**, **Màu** và **Trạng thái** đang chọn:

| Lựa chọn | Mã chép được |
|---|---|
| Neutral · 20px (mặc định) | `<span class="icon-swap"><TIcon name="search" /></span>` |
| Neutral · 16px | `<span class="icon-swap icon-swap--16"><TIcon name="search" /></span>` |
| Brand · 24px | `<span class="icon-swap icon-swap--24 icon-swap--brand"><TIcon name="search" /></span>` |
| Bấm được (Hover) · Brand | `<button type="button" class="icon-swap icon-swap--brand icon-swap--action" aria-label="Mô tả hành động" v-tip="'Mô tả hành động'"><TIcon name="search" /></button>` |
| Disabled · Neutral | `<span class="icon-swap icon-swap--disabled"><TIcon name="search" /></span>` |

20px là cỡ mặc định của `icon-swap` nên không có class cỡ. Icon có nhãn “Giữ màu” (logo) chỉ kèm class cỡ. **Đặt icon trong nút** (`.btn`, `.btn-icon`) thì chỉ lấy phần `<TIcon name="…" />` — màu và cỡ tự theo nút (xem mục 3).

**Dán thử:** dán mã vừa chép (hoặc code mẫu ở các mục dưới) vào ô bên trái → bên phải hiện đúng giao diện thật, kèm cảnh báo nếu dùng sai quy chuẩn (tên icon không có, gán màu tay, dán SVG trực tiếp…). Chọn **Mẫu** để xem nhanh các cách dùng, đổi **Nền** để xem icon trên nền xám / nền tối. Icon **Bấm được** rê chuột vào để xem Hover; nhớ đổi `aria-label` / `v-tip` thành đúng tên hành động.

> Ví dụ chạy thật: `mds-docs/src/demos/IconPlaygroundDemo.vue`
#### 2. Dán vào đâu

Dán vào `<template>` của file `.vue`, đúng chỗ cần hiện icon. Trong `<script setup>` của file đó thêm 1 lần:

```js
import TIcon from '@mds/components/TIcon.vue'
```

App dùng mds-ui đã có sẵn alias `@mds` (trỏ tới `mds-ui/src`, khai báo trong `vite.config.js`) và `import '@mds/style.css'` trong `main.js` — chưa có thì thêm 2 chỗ này trước.

#### 3. Dùng theo từng chỗ

**Icon trong nút có chữ** — đặt `TIcon` trước chữ, KHÔNG bọc `icon-swap`, màu và cỡ icon tự theo nút:

```html
<button type="button" class="btn btn--primary"><TIcon name="plus" />Thêm mới</button>
```

**Nút chỉ có icon** — dùng `.btn-icon`, bắt buộc có `aria-label` và tooltip (`v-tip`):

```html
<button type="button" class="btn-icon" aria-label="Xóa" v-tip="'Xóa'"><TIcon name="trash" /></button>
```

```js
import { vTip } from '@mds/utils/tooltip.js'   // trong <script setup> → dùng được v-tip
```

**Icon đứng riêng, chỉ để minh họa** (không bấm) — bọc `icon-swap`, thêm class cỡ / màu:

```html
<span class="icon-swap icon-swap--16"><TIcon name="calendar" /></span>
```

**Icon bấm được, không khung nền** (VD icon sửa nhanh trong dòng) — dùng thẻ `<button>` + `icon-swap--action` để có hover / focus / disabled:

```html
<button type="button" class="icon-swap icon-swap--action" aria-label="Sửa" v-tip="'Sửa'"><TIcon name="pencil" /></button>
```

**Icon AI (màu gradient)** — class `icon-swap--ai`, và gọi `ensureAiGradient()` 1 lần khi màn hình mở:

```js
import { onMounted } from 'vue'
import { ensureAiGradient } from '@mds/utils/aiGradient.js'
onMounted(ensureAiGradient)
```

#### 4. Cỡ và màu

- Cỡ mặc định của `icon-swap` là **20px**. Cỡ khác dùng class `icon-swap--12` · `--16` · `--24` · `--28` · `--32` … `--48`.
- Màu: `icon-swap--brand` · `--accent` · `--link` · `--info` · `--warning` · `--danger` · `--success` · `--white` · `--ai` (không thêm class = Neutral). Màu lấy từ token `--icon-*`, tra tại [Biến chuẩn](/ds/design-tokens).
- ⛔ Không gán màu tay (`style="color:#…"`, `color: red`), không đổi nét `stroke-width` (luôn 1.5px), không tự set `width / height` cho svg.

#### 5. Icon chưa có trong danh sách

**Icon Tabler** — tìm tại [tabler.io/icons](https://tabler.io/icons), rồi khai báo vào `mds-ui/src/components/TIcon.vue` (2 dòng):

```js
// phần import (tên Icon + PascalCase theo Tabler)
import IconRocket from '@tabler/icons-vue/dist/esm/icons/IconRocket.mjs'

// trong bảng MAP (tên kebab-case — đây là name dùng trong <TIcon name="…">)
  'rocket': IconRocket,
```

Lưu lại là mọi app dùng mds-ui đều có icon mới, và icon tự hiện trong khung tra cứu trang này.

**Icon riêng của MDS** (Figma › Icons › Custom) — xuất SVG từ Figma, thêm 1 dòng vào `mds-ui/src/icons/customIcons.js`:

```js
"mds-ten-icon": { label: "Tên hiển thị", color: 'mono', svg: "<svg …>…</svg>" },
```

`color`: `'mono'` = 1 màu, đổi theo class màu (nét dùng `stroke="currentColor"`) · `'mixed'` = khung theo màu, phần nhấn giữ màu gốc · `'fixed'` = logo nhiều màu, giữ nguyên. Dùng: `<TIcon name="mds-ten-icon" />`.

⛔ Không import icon thẳng từ `@tabler/icons-vue` trong code app, không dán SVG trực tiếp vào màn hình — luôn đi qua `TIcon` để cả hệ thống dùng chung 1 bộ, đúng nét 1.5px và đổi màu theo token.


MISA sử dụng bộ icon dạng stroke, nét là 1.5px. Bao gồm các kích thước phổ biến như: 16px, 20px, 24px, 32px.

Bộ icon sử dụng nét 1.5px nhằm tạo sự cân bằng giữa độ rõ và độ tinh tế. Độ dày này giúp icon hiển thị sắc nét trên mọi kích thước và màn hình, đồng thời mang lại cảm giác nhẹ, hiện đại và hài hòa với typography, border và các thành phần UI khác.

<br>So với nét 2px truyền thống, nét 1.5px giúp giao diện trông thoáng hơn, chuyên nghiệp hơn, đặc biệt phù hợp cho web app, dashboard và các hệ thống nhiều dữ liệu, nơi yếu tố thị giác cần tinh gọn nhưng vẫn đảm bảo khả năng nhận diện cao.

Hầu hết các icon sẽ được sử dụng tại bộ icon opensource của Tabler tại đây: [https://tabler.io/icons](https://tabler.io/icons)

![](/ds/files/526c5f1ab53dc29f4ea8c3173f6d43fe2e4cc581.png)

### Bố cục

![](/ds/files/8f5482ed62f9171cc094824541527a451318e926.png)

Các biểu tượng (icon) được tạo trên lưới (grid) dựa trên các hình dạng cơ bản.<br>

Trong mẫu lưới có sẵn hình tròn, hình vuông và hình chữ nhật (theo cả hướng ngang và dọc).<br>

Việc sử dụng các hình này làm hướng dẫn thiết kế giúp những icon có tỷ lệ khác nhau vẫn giữ được độ nặng thị giác tương đương, tránh việc một icon nào đó trở nên quá nổi bật hoặc quá nhỏ so với phần còn lại của bộ biểu tượng.

![](/ds/files/54e0d6c17045a885f058eb0ca1bfd56142d26f17.png)

### Kích thước

Các biểu tượng (icon) có thể được thu phóng theo 3 kích thước tiêu chuẩn: nhỏ (16px), trung bình (24px) và lớn (32px).<br>

Kích thước mặc định của icon là trung bình (24px), tuy nhiên nhà thiết kế có thể sử dụng kích thước nhỏ hoặc lớn hơn khi cần thiết.

![](/ds/files/e518ea57a80d9ade899b03d158673daca6c16d94.png)

### Khoảng cách

Các icon cần có khoảng trống xung quanh icon để đảm bảo tính dễ đọc và dễ thao tác.<br>Khi một icon có chức năng tương tác được sử dụng riêng lẻ, nó cần có vùng chạm tối thiểu là 40px để người dùng có thể nhấn chính xác và thoải mái.

![](/ds/files/46596d17555a27dad580c68f71ae07dd024772c9.png)

Kích thước của icon nên khớp với chiều cao dòng (line height) của phần văn bản đi kèm để đảm bảo sự cân đối và hài hòa trong giao diện.

![](/ds/files/f257eb67b316abee596bf3206c356b1635e0bb71.png)

### Màu sắc

> Ví dụ chạy thật: `mds-docs/src/demos/IconStatesDemo.vue`
Màu sắc của icon sẽ thay đổi tùy theo nền hiển thị, mức độ quan trọng của chúng trên trang (ví dụ: màu chính, màu đậm, màu nhấn...), và chủ đề màu (color theme) đang được sử dụng.

![](/ds/files/aec83cbdaa91b2b45d939cb560a3e1724eff2894.png)

### Stroke

Bộ icon của chúng tôi sử dụng nét vẽ đồng nhất dày 1.5px cho cả đường nét bên trong và bên ngoài.<br>

Các nét được kết thúc bằng đầu tròn (rounded terminus) hoặc đầu phẳng (butt-cap) với độ dày 1.5px, giúp đảm bảo sự thống nhất và cân bằng trong toàn bộ hệ thống biểu tượng.

![](/ds/files/54e299b463fadd694976c7db6265d83b36aa5823.png)

### Radius

Các icon của chúng tôi thường có đường viền ngoài bo cong với bán kính 3px để tạo cảm giác mềm mại và thân thiện.

<br>Đối với những icon có chi tiết phức tạp hơn, có thể sử dụng bán kính 2px nhằm giữ cho hình dạng gọn gàng và rõ nét hơn.

![](/ds/files/c0ffabdec68576b368ad39bde1773048b6676509.png)

### Fill

Sử dụng icon dạng đặc (filled icon) trong hai trường hợp sau:

1. **Trạng thái hoạt động và không hoạt động:**<br>Dùng icon đặc cùng với icon viền (outlined) để thể hiện trạng thái active và inactive của cùng một biểu tượng.

1. **Khi icon đứng một mình trên nền phức tạp:**<br>Khi được sử dụng riêng lẻ, icon dạng đặc giúp tạo độ tương phản cao hơn trên những nền có nhiều chi tiết hoặc màu sắc phức tạp.<br>Ví dụ: một biểu tượng vị trí (location pin) dạng đặc trên bản đồ sẽ dễ nhìn và nổi bật hơn.

![](/ds/files/d0cb5b13addf2d8bf3637c0b965d9e71b321fe61.png)
