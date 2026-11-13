<!-- source: Số đo đang chạy trong code mds-ui -->
# SỐ ĐO ĐANG CHẠY TRONG CODE mds-ui (nguồn đúng nhất — ưu tiên số này)

Ba mật độ hiển thị: **Trung bình** (mặc định) · **Nhỏ** · **Rộng** (người dùng chọn ở bánh răng → Thiết lập hiển thị). Mỗi dòng: thuộc tính = khai báo CSS → giá trị Trung bình / Nhỏ / Rộng.

**Tự đo thông số trên trang tài liệu:** khi trả lời câu hỏi về thông số (cao, rộng, Padding, Gap, Border, Border radius, màu, font, khoảng cách…) của control / màn mẫu, cuối câu trả lời luôn gợi ý thêm: mở trang tài liệu của control đó (VD [Button](/ds/button)) → khung **Ví dụ trực quan** → công cụ **Đo** trên thanh khung ví dụ (mặc định đã bật; xem toàn màn hình cũng có nút Đo) → rê chuột lên phần tử để xem đủ thông số kèm tên token (Alt + bấm để ghim, ↑ chọn phần tử cha, Esc tắt); đổi **Mật độ** / **Font size** trên thanh để xem từng mode. Giải thích thuật ngữ: [Thuật ngữ CSS](/ds/css-terms).

## Button (nút) — mọi loại: .btn--primary (nút chính), .btn--outline.btn--neutral (nút phụ)… — class `.btn`
- Chiều cao: `var(--btn-height)` → Trung bình **32px** · Nhỏ **28px** · Rộng **36px**
- Rộng tối thiểu: `var(--btn-min-width)` → **80px** (mọi mật độ)
- Đệm (padding): `0 var(--btn-px)` → Trung bình **0 12px** · Nhỏ **0 12px** · Rộng **0 14px**
- Khoảng cách trong (gap): `var(--btn-gap)` → **8px** (mọi mật độ)
- Bo góc: `var(--radius-default)` → Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- Cỡ chữ: `var(--text-body)` → **13px** (mọi mật độ)
- Độ đậm chữ: `500` → **500** (mọi mật độ)
- Viền: `1px solid transparent` → **1px solid transparent** (mọi mật độ)

## Button nhỏ (.btn--sm) — class `.btn--sm`
- Chiều cao: `calc(var(--btn-height) - 4px)` → Trung bình **28px** · Nhỏ **24px** · Rộng **32px**
- Rộng tối thiểu: `56px` → **56px** (mọi mật độ)
- Đệm (padding): `0 12px` → **0 12px** (mọi mật độ)
- Khoảng cách trong (gap): `8px` → **8px** (mọi mật độ)
- Cỡ chữ: `var(--text-body)` → **13px** (mọi mật độ)

## Button lớn (.btn--lg) — class `.btn--lg`
- Chiều cao: `calc(var(--btn-height) + 8px)` → Trung bình **40px** · Nhỏ **36px** · Rộng **44px**
- Rộng tối thiểu: `88px` → **88px** (mọi mật độ)
- Đệm (padding): `0 16px` → **0 16px** (mọi mật độ)
- Cỡ chữ: `14px` → **14px** (mọi mật độ)

## Button icon (nút chỉ có icon) — class `.btn-icon`
- Chiều cao: `var(--btn-height)` → Trung bình **32px** · Nhỏ **28px** · Rộng **36px**
- Rộng: `var(--btn-height)` → Trung bình **32px** · Nhỏ **28px** · Rộng **36px**
- Đệm (padding): `0` → **0** (mọi mật độ)
- Bo góc: `var(--radius-default)` → Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- Nền: `transparent` → **transparent** (mọi mật độ)
- Viền: `1px solid transparent` → **1px solid transparent** (mọi mật độ)

## Button icon nhỏ — class `.btn-icon--sm`
- Chiều cao: `calc(var(--btn-height) - 4px)` → Trung bình **28px** · Nhỏ **24px** · Rộng **32px**
- Rộng: `calc(var(--btn-height) - 4px)` → Trung bình **28px** · Nhỏ **24px** · Rộng **32px**

## Ô nhập liệu (Textbox / Combobox / Datebox / Numberbox / Searchbox — khung .ibox) — class `.ibox`
- Chiều cao: `var(--input-height)` → Trung bình **32px** · Nhỏ **28px** · Rộng **36px**
- Rộng: `100%` → **100%** (mọi mật độ)
- Đệm (padding): `0 8px 0 12px` → **0 8px 0 12px** (mọi mật độ)
- Khoảng cách trong (gap): `8px` → **8px** (mọi mật độ)
- Bo góc: `var(--radius-default)` → Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- Nền: `var(--bg-white)` → **#ffffff** (mọi mật độ)
- Viền: `1px solid var(--stroke-neutral)` → **1px solid #ced1d6** (mọi mật độ)

## Search box thường (AppSearchbox) — Outline / Filled / Filled White; tìm thông minh = AppAiSearchbox — class `.ibox--search`
- Đệm (padding): `0 8px` → **0 8px** (mọi mật độ)

## Search box kiểu Filled (variant="filled") — class `.ibox--filled`
- Nền: `var(--neutral-200)` → **#ecedef** (mọi mật độ)

## Ô dữ liệu trong bảng (DataTable) — dòng bảng cao --dt-row-height — class `.dt-cell-inner`
- Chiều cao: `calc(var(--dt-row-height) - 4px)` → Trung bình **28px** · Nhỏ **28px** · Rộng **32px**
- Rộng: `100%` → **100%** (mọi mật độ)
- Đệm (padding): `0 12px` → **0 12px** (mọi mật độ)
- Khoảng cách trong (gap): `8px` → **8px** (mọi mật độ)

## Tab (SubNavTabs) — class `.sub-nav-tab`
- Chiều cao: `var(--tab-h)` → Trung bình **36px** · Nhỏ **36px** · Rộng **40px**
- Đệm (padding): `0 var(--tab-px)` → Trung bình **0 12px** · Nhỏ **0 12px** · Rộng **0 20px**
- Khoảng cách trong (gap): `8px` → **8px** (mọi mật độ)
- Bo góc: `var(--radius-default) var(--radius-default) 0 0` → Trung bình **8px 8px 0 0** · Nhỏ **6px 6px 0 0** · Rộng **8px 8px 0 0**
- Cỡ chữ: `var(--text-body)` → **13px** (mọi mật độ)
- Độ đậm chữ: `var(--fw-regular)` → **400** (mọi mật độ)
- Nền: `transparent` → **transparent** (mọi mật độ)
- Viền: `none` → **none** (mọi mật độ)

## Mục trong menu xổ ra (DropdownMenu / Combobox) — class `.dropdown-menu__item`
- Cao tối thiểu: `var(--menu-item-h)` → Trung bình **32px** · Nhỏ **32px** · Rộng **36px**
- Rộng: `100%` → **100%** (mọi mật độ)
- Đệm (padding): `0 var(--menu-item-px)` → Trung bình **0 12px** · Nhỏ **0 12px** · Rộng **0 16px**
- Khoảng cách trong (gap): `var(--menu-item-gap)` → **8px** (mọi mật độ)
- Bo góc: `var(--menu-radius)` → Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- Cỡ chữ: `var(--text-body)` → **13px** (mọi mật độ)
- Độ đậm chữ: `var(--fw-regular)` → **400** (mọi mật độ)
- Nền: `transparent` → **transparent** (mọi mật độ)
- Viền: `none` → **none** (mọi mật độ)

## Mục sidebar — class `.sidebar-item`
- Chiều cao: `36px` → **36px** (mọi mật độ)
- Rộng: `100%` → **100%** (mọi mật độ)
- Đệm (padding): `0` → **0** (mọi mật độ)
- Khoảng cách trong (gap): `8px` → **8px** (mọi mật độ)
- Bo góc: `var(--radius-default)` → Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- Cỡ chữ: `var(--text-body)` → **13px** (mọi mật độ)
- Độ đậm chữ: `var(--fw-regular)` → **400** (mọi mật độ)
- Nền: `transparent` → **transparent** (mọi mật độ)
- Viền: `none` → **none** (mọi mật độ)

## Card — khối nền trắng đặt trên nền trang xám — class `.card`
- Đệm (padding): `var(--box-padding)` → **16px** (mọi mật độ)
- Bo góc: `var(--radius-card)` → **8px** (mọi mật độ)
- Nền: `var(--bg-white)` → **#ffffff** (mọi mật độ)
- Bóng đổ: `var(--shadow-card)` → **0 0 2px 0 #0000001a** (mọi mật độ) (Figma Effect style: Neutral / All 2)

## Khối nền trắng (surface) trên nền trang — class `.surface`
- Bo góc: `var(--radius-card)` → **8px** (mọi mật độ)
- Nền: `var(--bg-white)` → **#ffffff** (mọi mật độ)
- Bóng đổ: `var(--shadow-card)` → **0 0 2px 0 #0000001a** (mọi mật độ) (Figma Effect style: Neutral / All 2)

## Tag (AppTag) — class `.app-tag`
- Chiều cao: `var(--tg-h)` → **var(--tg-h)** (mọi mật độ)
- Đệm (padding): `0 var(--tg-px)` → **0 var(--tg-px)** (mọi mật độ)
- Khoảng cách trong (gap): `var(--tg-gap)` → **var(--tg-gap)** (mọi mật độ)
- Bo góc: `var(--tg-r)` → **var(--tg-r)** (mọi mật độ)
- Cỡ chữ: `var(--tg-fs)` → **var(--tg-fs)** (mọi mật độ)
- Độ đậm chữ: `var(--fw-medium)` → **500** (mọi mật độ)
- Viền: `1px solid transparent` → **1px solid transparent** (mọi mật độ)

## Thông báo inline (AppInlineAlert) — class `.inline-alert`
- Đệm (padding): `8px 8px 8px 12px` → **8px 8px 8px 12px** (mọi mật độ)
- Khoảng cách trong (gap): `8px` → **8px** (mọi mật độ)
- Bo góc: `var(--radius-default)` → Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- Cỡ chữ: `var(--text-body)` → **13px** (mọi mật độ)
- Viền: `1px solid` → **1px solid** (mọi mật độ)

## Token chung
- Cỡ chữ mặc định (chữ nội dung, nhãn, ô, bảng) `--text-body`: **13px** (mọi mật độ)
- Bo góc mặc định (nút, ô nhập, menu, tag) `--radius-default`: Trung bình **8px** · Nhỏ **6px** · Rộng **8px**
- Bo góc dialog / card / popover `--radius-dialog`: **12px** (mọi mật độ)
- Chiều cao ô nhập `--input-height`: Trung bình **32px** · Nhỏ **28px** · Rộng **36px**
- Chiều cao nút `--btn-height`: Trung bình **32px** · Nhỏ **28px** · Rộng **36px**
- Rộng tối thiểu nút (code) `--btn-min-width`: **80px** (mọi mật độ)
- Chiều cao dòng bảng `--dt-row-height`: Trung bình **32px** · Nhỏ **32px** · Rộng **36px**
- Chiều cao header `--layout-header-h`: **48px** (mọi mật độ)
- Sidebar mở rộng `--layout-sidebar-w`: **200px** (mọi mật độ)
- Sidebar thu gọn `--layout-sidebar-sm-w`: **64px** (mọi mật độ)
- Khoảng cách giữa các control cạnh nhau `--gap-control`: **8px** (mọi mật độ)
- Khoảng cách giữa các card `--card-col-gap`: **16px** (mọi mật độ)

Ghi chú: tên mode Figma Standard · Compact · Comfortable · Mobile = Trung bình | Nhỏ | Rộng | Mobile — luôn gọi bằng tên tiếng Việt (Mobile KHÔNG dùng cho web). Khi Figma và code lệch nhau (VD Figma Min-Width nút 80 / 72 / 96 nhưng code `--btn-min-width` 80px mọi mật độ) → nêu số trong code là số đang chạy, kèm ghi chú Figma.
