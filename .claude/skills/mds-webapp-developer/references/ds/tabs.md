<!-- SINH TỰ ĐỘNG từ mds-docs /ds/tabs (2026-11-18) — không sửa tay -->
# Tabs

> Thanh tab theo Figma Tab Horizontal Item: Brand (Text · Filled · Solid) và Neutral (Text), có / không đường kẻ dưới

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — các kiểu tab xếp dọc để so sánh, bật / tắt đường kẻ dưới, thử bằng bàn phím. Bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/TabsDemo.vue`
Theo component Figma **Tab Horizontal Item** (MDS Web Components v2.0).

## Các kiểu

| Color · Style | Tab đang chọn (Actived) |
|---|---|
| **Brand · Text** (mặc định) | nền trắng, chữ Brand Bold, gạch dưới 2px Stroke/Brand |
| **Brand · Filled** | nền BG/Brand/Brand Light, chữ Brand Bold, gạch dưới 2px Stroke/Brand |
| **Brand · Solid** | nền BG/Brand/Brand, chữ trắng Bold |
| **Neutral · Text** | nền BG/Neutral/Neutral Light, chữ Primary Bold |

**Underline = True:** kẻ 1px Stroke/Neutral dưới cả hàng, tab bo 2 góc trên. **Underline = False:** không kẻ, tab bo 8px cả 4 góc.

## Thành phần và kích thước

| Thành phần | Quy chuẩn (token Figma) |
|---|---|
| Chiều cao | **36px** (Components/Tabs/Medium/Fix-Height) — cố định ở mọi mật độ |
| Đệm ngang | **12px** (Padding Horizontal) · icon / chữ / badge cách **8px** (Gap Content) |
| Chữ | Body Regular 13/20 — Regular, đang chọn **Bold** |
| Icon trái / phải | 16px |
| Badge | 16px, bo tròn |
| Bo góc | Radius/Default 8px |

## Trạng thái

| Trạng thái | Hiển thị |
|---|---|
| Inactived | nền trong suốt, chữ Text/Primary Neutral |
| Hover | nền **BG/Brand/Brand Light** (quy tắc hover chung) |
| Pressed | nền **BG/Brand/Brand Light Hover** |
| Actived | theo kiểu ở bảng trên |
| Focus | viền 2px Stroke/Brand |
| Disabled | chữ Text Disabled |

## Hành vi (bản thi công mds-ui)

- Bấm tab để chuyển; khi đang ở thanh tab, phím **← →** chuyển tab, **Home / End** về tab đầu / cuối (bỏ qua tab Disabled).
- Tab nhiều hơn bề ngang → thanh tab cuộn ngang.

## Code

`<AppTabs v-model="tab" :items="[{ value, label, icon?, badge?, disabled? }]" variant="brand|filled|solid|neutral" :underline="true" />`
