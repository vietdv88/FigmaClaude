<!-- SINH TỰ ĐỘNG từ mds-docs /ds/avatar (2026-11-18) — không sửa tay -->
# Avatar

> Avatar theo Figma: ảnh, chữ cái đầu (Color Brand theo theme / Neutral), trống; 9 cỡ 12–80px; badge Dot, Text & Icon Top, Text & Icon Bottom

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — đổi theme để thấy nền avatar chữ cái đổi màu theo. Bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/AvatarDemo.vue`
Theo component Figma **Avatar**, **_Avatar Type Item** và **_Avatar Color Item**.

## Loại (Type)

| Type | Hiển thị |
|---|---|
| **Image** | ảnh phủ kín hình tròn, viền 1px Stroke/Neutral |
| **Initials** | chữ cái đầu viết hoa (Trần Hậu → **TH**), chữ Text/Primary Neutral, viền Stroke/White |
| **Empty** | hình người mặc định, viền Stroke/White |

### Màu nền avatar chữ cái (_Avatar Color Item)

| Color | Nền |
|---|---|
| **Brand** | **BG/Brand/Brand Light Hover** — đổi theo theme đang chọn |
| **Neutral** | BG/Neutral/Neutral Light |

## Kích thước (Size)

12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 80px. Cỡ chữ cái đầu theo Figma: 12–16 → 8px · 20–24 → 10px · 32–40 → 12px · 48 → 16px · 56 → 20px · 80 → 40px.

## Badge (Badge Type)

| Badge Type | Hiển thị |
|---|---|
| **Dot** | chấm viền trắng — góc trên phải nền **BG/Danger**, góc dưới phải nền **BG/Success** |
| **Text & Icon Top** | góc trên: badge số nền BG/Danger, chữ trắng Semi Bold, lệch ra ngoài · góc dưới: chấm Dot |
| **Text & Icon Bottom** | góc trên: chấm Dot · góc dưới: badge icon nền Neutral 600, icon trắng, lệch ra ngoài |

Kích thước badge theo cỡ avatar (đo từ Figma):

| Cỡ avatar | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 56 | 80 |
|---|---|---|---|---|---|---|---|---|---|
| Chấm (Dot) | 4 | 6 | 8 | 8 | 8 | 12 | 12 | 16 | 20 |
| Badge số / icon | – | – | – | 16 | 16 | 20 | 20 | 24 | 28 |
| Lệch ra ngoài | – | – | – | 4 (trên 8) | 4 | 4 | 4 | 2 | 4 |

Cỡ 12 – 20 chỉ có badge Dot.

## Trạng thái (State)

| State | Hiển thị |
|---|---|
| Default | viền theo loại (Image: Stroke/Neutral · Initials / Empty: Stroke/White) |
| Hover + Active | vòng **Stroke/Brand Light** dày 2px — áp dụng cho **cả 3 loại: Ảnh, Chữ cái, Trống** |

- **Hover** là khi rê chuột lên avatar bấm được (mở hồ sơ, chọn người…); **Active** là avatar đang được chọn (giữ nguyên vòng như Hover).
- Vòng viền nằm **ngoài** khung avatar: **ảnh giữ nguyên kích thước, không co lại** khi rê chuột. Không tăng độ dày viền bên trong khung.
- Xem đủ 3 loại × 9 cỡ, Default đặt cạnh Hover + Active, ở **Ví dụ trực quan** (mục *State Hover + Active*); hàng dưới cùng rê chuột / bấm thử thật.

## Code

`<AppAvatar :size="32" name="Trần Hậu" :src="url" color="brand|neutral" dot online :count="6" badge-icon="camera" interactive />` · màu dùng ở chỗ tự vẽ avatar: `avatarColor()` trong `mds-ui/utils/avatar.js`.
