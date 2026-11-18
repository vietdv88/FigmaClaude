<!-- SINH TỰ ĐỘNG từ mds-docs /ds/css-terms (2026-11-18) — không sửa tay -->
# Thuật ngữ CSS

> Padding, Margin, Gap, Border, Border radius, Font size, Line height… là gì — giải thích cho người không làm code

Giải thích các thông số CSS hay gặp — khi đọc thông số trong Figma, trong công cụ **Đo** ở mỗi khung ví dụ (nút **Đo** trên thanh khung), hay khi trao đổi với dev. Tên thuộc tính giữ nguyên tiếng Anh như trong CSS / Figma.

## Ví dụ trực quan

> Ví dụ chạy thật: `mds-docs/src/demos/CssTermsDemo.vue`
## Bảng thuật ngữ

| Thuật ngữ | Là gì | Ví dụ / token thường dùng |
|---|---|---|
| **Size** (W × H) | Kích thước phần tử: rộng × cao, tính tới hết viền (Border) | Nút, ô nhập cao `--btn-height` / `--input-height` = 32px (Trung bình) · 28px (Nhỏ) · 36px (Rộng) |
| **Padding** | Khoảng đệm **bên trong** viền — giữa viền và nội dung. Viết đủ 4 phía: Padding top / right / bottom / left | Nút: Padding left / right 12px · card: Padding 16px |
| **Margin** | Khoảng trống **bên ngoài** viền — đẩy phần tử khác ra xa | Ít dùng trực tiếp trong mds-ui, thường thay bằng Gap của khung chứa |
| **Gap** | Khoảng cách **giữa các phần tử nằm cạnh nhau** trong cùng một nhóm (hàng / cột / lưới). Do khung chứa đặt, chia đều cho mọi phần tử con | Nút Hủy – Lưu cách nhau 8px = `--gap-control` |
| **Border** | Đường viền: độ dày (width) + kiểu (solid / dashed) + màu. Có thể chỉ một phía: Border bottom… | Ô nhập: 1px solid `--stroke-neutral` · đang chọn: `--stroke-brand` |
| **Border radius** | Độ bo tròn của góc. Có thể khác nhau từng góc: top-left / top-right / bottom-right / bottom-left | Control, card 8px (`--radius-default`, `--radius-card`) · popup / dialog 12px (`--radius-dialog`) |
| **Background** | Màu nền | `--bg-white`, `--bg-page`, `--bg-brand`, `--bg-brand-light` |
| **Color** | Màu chữ (hoặc màu icon) | Chữ `--text-primary`, `--text-secondary` · icon `--icon-neutral`, `--icon-white` |
| **Font** (font family) | Kiểu chữ | Inter (InterVariable) cho mọi ứng dụng |
| **Font size** | Cỡ chữ | Body 13px `--text-body` · H3 16px · H2 20px |
| **Line height** | Chiều cao một dòng chữ (gồm khoảng trống trên dưới chữ) — luôn lớn hơn Font size. Thấp quá dễ cắt mất dấu chữ HOA tiếng Việt | 13px → 20px `--text-body-lh` · 16px → 22px |
| **Font weight** | Độ đậm của chữ | 400 Regular · 500 Medium · 600 Semi Bold · 700 Bold (`--fw-regular` … `--fw-bold`) |
| **Letter spacing** | Khoảng cách giữa các chữ cái | Thường để mặc định |
| **Box shadow** | Bóng đổ quanh phần tử | Card `--shadow-card` · menu, popover `--shadow-popover` — đã có Border thì không thêm Box shadow |
| **Outline** | Đường viền vẽ **ngoài** Border, không chiếm chỗ — dùng cho trạng thái focus (bấm Tab) | 2px `--stroke-brand` |
| **Opacity** | Độ trong suốt: 1 = rõ hẳn, 0 = ẩn | Control bị khóa thường mờ đi |
| **Token** | Tên biến dùng chung thay cho con số cứng, VD `--btn-height`, `--bg-brand`. Đổi theme / mật độ là mọi chỗ dùng token tự đổi theo | Công cụ Đo hiện tên token cạnh giá trị; giá trị không có token là đang viết số cứng |

## Phân biệt nhanh Padding · Margin · Gap

- **Padding**: đệm **trong** một phần tử (chữ trong nút cách mép nút bao nhiêu).
- **Margin**: khoảng trống **ngoài** một phần tử (phần tử này đẩy phần tử khác ra bao xa).
- **Gap**: khoảng cách **giữa** các phần tử con do khung chứa quy định (các nút trong một hàng cách nhau bao nhiêu).
