<!-- SINH TỰ ĐỘNG từ mds-docs /ds/design-tokens (2026-11-18) — không sửa tay -->
# Biến chuẩn

> Danh sách toàn bộ biến chuẩn (CSS custom properties) của mds-ui theo nhóm: Chữ, Nền, Viền, Icon, Bo góc, Bóng, Khoảng cách, Kích thước control, Kiểu chữ, Biểu đồ — bấm để chép var(--…).

## Danh sách biến chuẩn

Toàn bộ biến CSS (design token) của bộ control **mds-ui**, đọc thẳng từ file CSS nên luôn khớp code. Giá trị hiển thị là giá trị **đang áp dụng** — đổi màu chủ đề / mật độ hiển thị thì giá trị đổi theo. Bấm tên biến để chép `var(--…)`.

> Ví dụ chạy thật: `mds-docs/src/demos/TokensDemo.vue`
## Nguyên tắc dùng biến

- **Không gõ số / mã màu trực tiếp** (hardcode) — luôn dùng `var(--tên-biến)`; muốn biết 1 phần tử đang dùng biến nào: bật **Đo** trên khung ví dụ → Alt + bấm → **Xem CSS (biến chuẩn)**.
- **Màu dùng đúng nhóm:** chữ → biến **Text** (`--text-*`), nền → **Background** (`--bg-*`), viền / đường kẻ → **Border** (`--stroke-*`), icon → **Icon** (`--icon-*`). Icon không lấy màu theo chữ.
- **Màu gốc (palette)** như `--brand-600`, `--neutral-200` chỉ để định nghĩa các biến trên — không dùng trực tiếp trong giao diện (đổi chủ đề, chế độ tối sẽ sai).
- **Kích thước control** (nút, ô nhập, menu, dòng bảng) lấy theo biến mật độ (`--btn-height`, `--input-height`…), không đặt chiều cao px cố định.
- Giá trị chưa có biến → hỏi nhóm Design System bổ sung biến, không tự đặt số.
