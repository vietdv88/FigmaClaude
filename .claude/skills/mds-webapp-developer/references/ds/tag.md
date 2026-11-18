<!-- SINH TỰ ĐỘNG từ mds-docs /ds/tag (2026-11-18) — không sửa tay -->
# Tag

> Nhãn ngắn đánh dấu trạng thái, phân loại theo Figma Tag: Solid / Outline / Text, 3 cỡ 20 · 24 · 28, 7 màu, kèm icon, avatar, chấm; nhóm tag “+N” trong dữ liệu chỉ hiển thị. Link components: **[tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=15146-127716)**

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — chọn Kiểu / Cỡ / Loại để xem đúng biến thể trong Figma; bật **Bấm được** rồi rê chuột, nhấn, Tab để xem Hover / Pressed / Focus. Bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/TagDemo.vue`
Theo component Figma **Tag** (MDS Web Components v2.0): Tag, Tag Icon (icon + chữ), Tag Avatar, Tag Dot, Tag Icon (chỉ icon), Tag Group Table.

## Kích thước

| Cỡ | Cao | Đệm ngang chữ | Khoảng cách icon / chữ | Bo góc | Chữ | Icon |
|---|---|---|---|---|---|---|
| **X Small** | 20px | 4px | 4px | Radius/Small 4px | Body Small 12/18 — Medium | 12px |
| **Small** | 24px | 8px | 6px | Radius/Default 8px | Body Small 12/18 — Medium | 12px |
| **Medium** | 28px | 8px | 4px | Radius/Default 8px | Body Regular 13/20 — Medium | 16px |

Đệm trái khi có chấm (Padding Badge): **6 / 8 / 8px**. Khi có avatar (Padding Avatar): **4 / 6 / 6px**, avatar **ảnh** tròn **12 / 12 / 16px**, viền 1px Stroke/Neutral nằm trong cỡ ảnh. Tag chỉ icon: vuông **20 / 24 / 28px**, icon **12 / 16 / 16px**.

## Kiểu (Style)

| Kiểu | Nền | Viền | Chữ / icon / chấm |
|---|---|---|---|
| **Solid** | BG/{Màu}/{Màu} (Neutral: Neutral/950) | — | Text/White · Icon/White |
| **Outline** | BG/{Màu}/{Màu} Light (Neutral: BG/Neutral/Neutral Light) | 1px Stroke/{Màu} Light (Neutral: Stroke/Neutral) | Text/{Màu} · Icon/{Màu} (Neutral: Text/Primary Neutral; Tag Dot: Text/Secondary Neutral) |
| **Text** *(chỉ Tag Dot)* | không | không | chấm + chữ Body Regular 13/20 **Regular** màu Text/{Màu}, không đệm |

## Màu

**Brand · Accent · Info · Warning · Danger · Success · Neutral** — 7 màu cho mọi kiểu và mọi cỡ.

## Trạng thái

Tag thường chỉ có **Default** và **Disabled**. Tag Medium có thêm Hover / Pressed / Focus cho tag bấm được.

| Trạng thái | Solid | Outline |
|---|---|---|
| Default | BG/{Màu} | BG/{Màu} Light |
| Hover | BG/{Màu} Hover (Neutral: Neutral/800) | BG/{Màu} Light Hover |
| Pressed | BG/{Màu} Pressed (Neutral: Neutral/900) | BG/{Màu} Light Pressed |
| Focus | vòng 2px Stroke/Brand cách 2px, bo Radius/Ring Focus 12px | như Solid |
| Disabled | BG/{Màu} Disable (Neutral: Neutral/400), chữ Text/White Disabled (trắng 70%) | nền trắng 70%, chữ / icon / chấm {Màu} Disabled (Neutral: viền Stroke/Neutral Disable, chữ Text/Disabled Neutral) |

## Nhóm tag (Tag Group)

Chỉ dùng cho dữ liệu **chỉ để hiển thị** — ô trong Bảng dữ liệu, thông tin ở màn chi tiết:

| Thành phần | Quy chuẩn |
|---|---|
| Khoảng cách giữa các tag | **4px** (Gap Tag Group) |
| Tag | mỗi tag 1 màu, kiểu Outline |
| Tag dư **“+N”** | Neutral Outline, chữ Text/Secondary Neutral, đặt **cuối** nhóm; rê chuột hiện tooltip các mục còn lại |

Chọn nhiều giá trị trong **ô nhập** → dùng [ComboBox](/ds/combobox) chọn nhiều (control đã có sẵn cách hiển thị tag riêng), không ghép AppTag vào ô nhập.

## Code

```vue
<AppTag label="Đã duyệt" color="success" />                       <!-- Outline · Small 24 (mặc định) -->
<AppTag label="Mới" color="brand" variant="solid" size="md" />
<AppTag label="Đang làm" color="info" dot />                      <!-- Tag Dot -->
<AppTag label="Chưa chốt" color="warning" variant="text" dot />   <!-- Tag Dot kiểu Text -->
<AppTag label="Thiết kế" icon="tag" />                            <!-- Tag Icon: icon + chữ -->
<AppTag :avatar-src="user.photo" avatar="Nguyễn Thu Hà" label="Thu Hà" />   <!-- Tag Avatar: ảnh (không ảnh → chữ cái đầu) -->
<AppTag icon="star" color="warning" aria-label="Quan trọng" />    <!-- chỉ icon (kèm v-tip ghi tên) -->
<AppTag label="Thiết kế" clickable @click="…" />                  <!-- bấm được: Hover / Pressed / Focus -->
<div class="app-tag-group"><AppTag … /><AppTag label="+3" class="app-tag--more" v-tip="…" /></div>   <!-- chỉ dữ liệu hiển thị -->
```

Thuộc tính: `label` · `color` (neutral | brand | accent | info | warning | danger | success) · `variant` (outline | solid | text) · `size` (xs | sm | md) · `dot` · `icon` · `icon-right` · `avatar` / `avatar-src` · `clickable` · `disabled`.
