<!-- SINH TỰ ĐỘNG từ mds-docs /ds/segmented (2026-11-18) — không sửa tay -->
# Segmented

> Nhóm nút chọn 1 theo Figma ❖ Segmented: Brand Text, Brand Solid, Brand Filled; dạng chữ hoặc icon; Fix Width

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — bấm chọn, thử phím ← →. Bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/SegmentedDemo.vue`
Theo component Figma **❖ Segmented** (Segmented, Segmented Icon, Segmented Item, Segmented Icon Item).

## Các kiểu

| Style | Khung | Mục đang chọn (Active = True) |
|---|---|---|
| **Brand Text** | nền Neutral/200 | nền trắng + bóng Drop Shadow/Neutral/Bottom 4, chữ Brand Semi Bold |
| **Brand Solid** | nền trắng | nền BG/Brand/Brand, chữ trắng Semi Bold |
| **Brand Filled** | nền trắng | nền BG/Brand/Brand Light, chữ Brand Semi Bold |

**Fix Width = True:** các mục chia đều toàn bộ bề ngang khung. **False:** các mục co theo nội dung.

**Segmented Icon:** mục chỉ có icon, vuông.

## Thành phần và kích thước

| Thành phần | Quy chuẩn (token Figma) |
|---|---|
| Khung | cao **32px** (Components/Segmented/Fix Height — theo chiều cao nút của mật độ), đệm **2px**, bo Radius/Default 8px |
| Mục | cao **28px** (Fix Height Item), đệm ngang **12px**, bo Radius/Inner 6px, icon / chữ cách **8px** |
| Chữ | Body Regular 13/20 — Medium, đang chọn **Semi Bold** |
| Icon | 16px |

## Trạng thái (mục chưa chọn)

| Trạng thái | Hiển thị |
|---|---|
| Default | nền trong suốt, chữ Text/Primary Neutral |
| Hover | nền **BG/Brand/Brand Light** |
| Pressed | nền **BG/Brand/Brand Light Hover** |
| Focus | viền 2px Stroke/Brand |
| Disabled | chữ Text Disabled |

## Hành vi (bản thi công mds-ui)

- Luôn có đúng 1 mục được chọn; khi đang ở nhóm, phím **← →** chuyển lựa chọn.
- Mục chỉ có icon có tooltip ghi tên (để đọc được bằng trình đọc màn hình).

## Code

`<AppSegmented v-model="v" :options="[{ value, label?, icon?, tip?, disabled? }]" variant="text|solid|filled" fit />`
