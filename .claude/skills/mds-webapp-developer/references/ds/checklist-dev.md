<!-- SINH TỰ ĐỘNG từ mds-docs /ds/checklist-dev (2026-11-18) — không sửa tay -->
# Checklist DEV

> Việc lập trình viên cần tự soát khi dựng màn hình và trước khi bàn giao QC: dùng biến chuẩn, control có sẵn, form, phím tắt, trạng thái.

::: tip Cách dùng
Tick từng mục khi đã kiểm — tiến độ được lưu trên trình duyệt của bạn. Mỗi mục có link tới quy chuẩn liên quan; chưa chắc thì hỏi **AVA** trên thanh tiêu đề (dán ảnh màn hình để AVA soát theo quy chuẩn).
:::

## Khi dựng màn hình

::: checklist Biến chuẩn, không gõ số tay
- Không gõ trực tiếp mã màu, px kích thước, bóng đổ — dùng `var(--…)` theo [Biến chuẩn](/ds/design-tokens)
- Lấy CSS đúng biến: trang tài liệu → **Đo** → Alt + bấm phần tử → **Xem CSS (biến chuẩn)** → Sao chép
- Màu đúng nhóm: `color` dùng `--text-*`, `background` dùng `--bg-*`, `border` dùng `--stroke-*`, icon dùng `--icon-*`
- Chiều cao nút / ô nhập theo mật độ (`--btn-height`, `--input-height`), không đặt cứng 28 / 32 / 36px
- Card: `--radius-card` + `--shadow-card` · popup: `--radius-dialog` + `--shadow-dialog` · có viền thì không bóng
:::

::: checklist Dùng control có sẵn
- Dùng control của bộ thư viện (Button, Text field, ComboBox, DataTable, Tag, Accordion…) — không tự dựng lại
- Không tự vẽ chip / badge / khối thu gọn riêng — dùng [Tag](/ds/tag), [Accordion](/ds/accordion)
- Bảng tóm tắt trong card dùng chế độ `summary` của DataTable — [Biểu đồ](/ds/data-visualization)
- Bảng trong popup: khung `.table-panel--fill.table-panel--bordered`, phân trang ghim đáy — [Popup](/ds/popup)
:::

::: checklist Form và thao tác
- Mở form: con trỏ tự vào ô nhập đầu tiên; bấm vào ô có chữ thì chọn hết chữ — [Yêu cầu tiện dụng chung](/ds/general-usability-requirements)
- Thứ tự Tab đi đúng thứ tự trên màn hình; ComboBox chọn được bằng phím ↑ ↓ Enter
- Ctrl + S lưu, Esc đóng popup — [Phím tắt](/ds/shortcut-key)
- Đang sửa mà F5 / rời trang → cảnh báo mất dữ liệu — [Cảnh báo thoát trang](/ds/leave-page-warning)
- Bấm Lưu: nút chuyển trạng thái đang xử lý, bấm 2 lần nhanh không tạo 2 bản ghi
- Lưu thiếu trường bắt buộc: viền đỏ + tooltip lỗi, focus vào ô lỗi đầu tiên; không disable nút Lưu
- Số hiển thị 1.234.567,89; ô nhập số trên form căn trái, trên bảng căn phải
:::

::: checklist Danh sách và trạng thái
- F5 giữ nguyên màn hình và tham số đang xem (trang, bộ lọc trên URL)
- Đang tải: spinner / khung xương đúng [Loading](/ds/loading); không có dữ liệu: [Empty state](/ds/empty-state)
- Dòng bấm được vào chi tiết: con trỏ hình bàn tay, rê chuột nền Brand Light
- Menu ⋯ ở dòng cuối tự lật lên, không bị che
:::

## Trước khi bàn giao QC

::: checklist Tự kiểm tra
- Không tràn khung ở 1366 × 768 và 375px (nếu có mobile), không viền đôi
- Không lỗi JavaScript trong Console khi thao tác các luồng chính
- Thử 3 mật độ hiển thị Nhỏ / Trung bình / Rộng
- Favicon và tiêu đề trình duyệt đúng — [Tiêu đề trình duyệt](/ds/browser-title)
:::
