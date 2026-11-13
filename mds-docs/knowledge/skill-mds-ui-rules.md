<!-- source: Quy chuẩn mds-ui (skill mds-ui-rules) -->

# MDS UI Rules — quy chuẩn thi công giao diện (bản đầy đủ)

Nguồn: Figma **MDS Web Components v2.0** (file `1DP5RJM3MsZJ8SnUWgTavS`, đọc Variables / Effect Styles / Text Styles 2026-10-29, Menu List 2026-10-30; đồng bộ lại toàn bộ với code ngày 2026-10-30) + thư viện `mds-ui` (`mds-ui/src/style.css`, import qua alias `@mds`) + skill nội bộ `mds-webapp-developer`.

Cấu trúc file:
- **Nguyên tắc gốc + quy tắc nền**
- **Phần A** — Quy tắc bắt buộc đầy đủ (khoảng cách, card, form, menu, trạng thái tương tác, header, tiêu đề tab, toast, định dạng số, chống tràn…)
- **Phần B** — Đặc tả từng loại (màu dùng khi nào, cỡ chữ, bo góc & shadow, khoảng cách, chiều cao control, nút, menu, Sub Menu, avatar, bảng, màn chi tiết, AI…)
- **Phần C** — Toàn bộ token (CSS lấy nguyên từ `style.css` + bảng ánh xạ Figma + 10 theme + Space theo component + màu biểu đồ)
- **Phần D** — Quy tắc chi tiết của mds-ui (nguyên văn): hover, viền, gap, căn lề bảng, cỡ nút theo vị trí, mật độ, tooltip, header, khung màn hình, Esc…
- **Checklist** trước khi báo xong

## Nguyên tắc gốc

1. **Chỉ dùng token, không gõ số / mã màu tay.** Màu, bo góc, shadow, khoảng cách, cỡ chữ, chiều cao control đều lấy từ `var(--…)` ở Phần C. Thấy mình gõ `#xxxxxx`, `box-shadow: 0 …`, `border-radius: 10px`, `gap: 6px` → dừng lại, tìm token.
2. **Dùng lại class / component có sẵn trong mds-ui trước khi viết CSS mới.** `.btn`, `.btn-icon`, `.card`, `.surface`, `DropdownMenu`, `AppCombobox`, `DataTable`, `AppAvatar`, `DetailField`, `.sub-menu`… Chỉ được khác nhau ở chữ / icon / dữ liệu. Chỉ tự viết CSS khi không có class nào đúng nghĩa, và vẫn phải dựa trên token.
3. **Kiểm tra bằng trình duyệt trước khi báo xong** (Playwright hoặc DevTools): đo chiều cao, khoảng cách, `getComputedStyle` của shadow / radius; rê chuột thử mọi thứ bấm được; mở mọi popup ở dữ liệu dài nhất.

---

### Quy tắc nền

- **Cỡ chữ mặc định 13px** (`var(--text-body)`): mọi chữ đọc được (nội dung, nhãn, mô tả phụ, chữ trong ô / chip / thẻ, popover). ⛔ Không dùng 12px / 11px cho chữ nội dung — chỉ ngoại lệ badge đếm số rất nhỏ.
- **Chữ / icon liên quan AI = màu AI Primary:** chữ dùng `.text-ai-primary` (gradient `#1482ff → #cf11ff`), icon `.ti--ai`, nút `.btn--ai` / `.btn--ai-outline`. ⛔ Không tô đơn sắc `var(--text-ai)` cho chữ AI.
- **Dashboard tĩnh — lưới 24 cột:** mọi hàng card dùng chung `grid-template-columns: repeat(24, minmax(0, 1fr))`, khe `var(--card-col-gap)`; 4 KPI = 6 ô, biểu đồ chính 12 ô, card phụ 6 ô, bảng 24 ô. ⛔ Không dùng `2fr 1fr 1fr` / `repeat(4, 1fr)` riêng từng hàng.
- **Tài liệu tra cứu Design System — `/ds` (app `mds-docs`):** <http://pdpoint.sdcthin.local/ds/> — chuyển từ Figma Site “MISA Design System” (42 trang), ai cũng đọc được, có **ví dụ sống** chạy bằng chính control mds-ui (`mds-docs/src/demos/*Demo.vue`, chèn vào trang bằng khối `::: demo <mã>`). Nội dung sửa qua **CMS** `/ds/quan-tri` (Quản trị PD Point + “Người biên tập”): thêm / sửa trang Markdown, dán / kéo thả ảnh, lịch sử sửa, thùng rác. **Thêm / đổi control trong mds-ui → cập nhật ví dụ tương ứng trong `mds-docs/src/demos`** (thêm 1 dòng vào `demos/index.js` nếu là ví dụ mới) để tài liệu luôn khớp code. Code + dữ liệu tách hẳn app chấm điểm (`/opt/mds-docs`), chỉ gắn chung cổng qua `mountDocs()` (lỗi bên tài liệu không làm dừng PD Point).
- **Combobox chọn nhiều (`multiple`) — hành xử như Vaadin Multi-Select Combo Box (chốt 03/11/2026):** thẻ đã chọn nằm **1 hàng trong ô, ô KHÔNG cao lên**; thẻ không đủ chỗ gộp thành thẻ **“+N” ở đầu** (rê chuột → tooltip tên các mục ẩn), luôn hiện các mục chọn SAU CÙNG, thẻ còn 1 mà vẫn dài thì cắt “…” · chọn xong **danh sách vẫn mở**, mục đã chọn có ✓ · đang gõ lọc mà chọn → **ô gõ tự xóa** · ↓ mở, ↑↓ di chuyển, Enter chọn / bỏ, Esc đóng · **Backspace khi ô trống: lần 1 làm sáng thẻ cuối, lần 2 mới bỏ** · × trên thẻ bỏ 1 mục (không mở danh sách) · × cuối ô xóa hết (từ 2 thẻ). Style theo Figma **Combobox Multiple** (6019:50293): thẻ Tag Small cao = ô − 8 (24 ở ô 32), đệm 8, chữ ↔ × 6, bo 8, nền Neutral Light + viền 1px Stroke/Neutral, × 12px, thẻ cách 4, ô lề trái 4 · thẻ đếm = ô vuông chứa số (không dấu +) + 2 mép thẻ xếp chồng bên trái (asset `mds-ui/src/assets/tag-stack.svg`) · chữ thẻ 13px Medium (Figma 12 → giữ 13 theo quy chuẩn chữ). Đã có sẵn trong `AppCombobox` — không tự dựng.
- **Cây nhiều cấp (cơ cấu tổ chức, danh mục) = `<AppTree>`** (Figma Pattern Organization Tree 46155:6035): dòng 32, đệm 16, cách 4, thụt 24 / cấp, mũi tên 16 → ô tick 16 → tên 13/20 (cách 8), đã chọn chữ brand, hover nền brand nhạt; panel đệm 12 bo 8 bóng Bottom 20, ô tìm kiếm trên cùng. `checkable` (độc lập) / `cascade` (cả nhánh) / không tick (chọn 1).
- **Mục Sidebar (cha & con) LUÔN cao 36px cố định, KHÔNG theo mật độ hiển thị** (Nhỏ / Trung bình / Rộng đều 36), cách nhau **4px** (chuẩn Sidebar control) — đã đặt sẵn trong `.sidebar-item` / `.sidebar-subitem` của mds-ui, không ghi đè.
- **Menu trái có nhóm (nhiều trang) = `AppSidebar children-mode="accordion"`**: nhóm có icon, bấm mở / đóng mục con bên dưới, thu gọn còn cột icon như sidebar thường — ⛔ không tự dựng danh sách nhóm riêng.
- **Cảnh báo thoát khi đang nhập liệu** (bấm ✕ / Hủy / Esc / chuyển phân hệ): đúng mẫu Figma — tiêu đề **“Thoát và không lưu?”**, mô tả “Nếu bạn thoát, các dữ liệu đang nhập liệu sẽ không được lưu lại.”, 2 nút **Ở lại** (viền) · **Thoát, không lưu** (primary, bên phải). Chỉ hiện khi người dùng ĐÃ nhập liệu; F5 / đóng tab dùng cảnh báo mặc định của trình duyệt (`beforeunload`). ⛔ Không hỏi “Có muốn lưu không?”. Ví dụ: `/ds/leave-page-warning`.
- **Số đếm trên sidebar (việc chờ xử lý) = `count` của item `AppSidebar`** (ô đỏ sát phải, thu gọn chỉ còn Badge Dot 8px góc icon, không số, mục cha tự cộng mục con) — ⛔ không tự vẽ badge số riêng, không dùng `badge` (nhãn chữ) để hiện số.
- **AVA của tài liệu `/ds` đọc bộ skill này + code mds-ui** (`mds-docs/knowledge`, sinh bằng `npm run build` trong mds-docs): sửa skill / token / control → build lại mds-docs và deploy `knowledge/` để AVA trả lời theo quy chuẩn mới.
- **Quy tắc gap 8px (`--gap-control`) CHỈ cho control rời đặt cạnh nhau** (Button–Button, Button–Textbox, Searchbox–Combobox…). ⛔ Thành phần đã đóng thành component (Header, Toolbar, Sidebar, Data table, Paging, Dialog…) theo **đúng khoảng cách trong Figma của component đó**, không ép về 8px. VD **Global Header** (Figma 6019:195346): lề 16 · nút 9 chấm → logo 12 · logo → tên app 12 · cụm logo → thông tin bên cạnh 16 · ô tìm kiếm → cụm icon 16 · nút icon ↔ nút icon ↔ avatar **8** (cụm `.header-tools` trong ControlHeader — có sẵn, app không tự đặt gap cho header) · nhãn / nút có chữ trong cụm icon (VD “1 đang hoạt động”) cách bên cạnh 16.
- **Ô nhập chat / hỏi AI (Enter để gửi):** gửi xong phải **xóa trắng ô**. Bắt Enter bằng hàm riêng: `if (e.isComposing || e.keyCode === 229) return` (bộ gõ tiếng Việt Telex / VNI đang gạch chữ → Enter để chốt chữ, chưa gửi), rồi lấy nội dung từ `textarea.value` và xóa cả biến lẫn `textarea.value`. ⛔ Không dùng `@keydown.enter.prevent="send()"` thẳng với `v-model` — bộ gõ chốt chữ SAU khi ô đã xóa → chữ hiện lại + câu gửi thiếu chữ cuối (lỗi đã gặp ở AVA trang tài liệu). Test: giả lập `compositionstart` → Enter (`keyCode 229, isComposing`) → không gửi; `compositionend` → Enter → gửi đủ câu, ô trắng.
- **Danh sách xổ xuống của Combobox (AppCombobox):** rộng **tối thiểu = bề rộng ô combobox**; dữ liệu dài → danh sách **giãn rộng hơn ô** theo chữ dài nhất (tới 480px, quá nữa thì xuống dòng) để đọc trọn, không cắt chữ; luôn nằm trong màn hình (không đủ chỗ bên phải → canh mép phải theo ô, giãn sang trái; cách mép 8px). Có sẵn trong mds-ui — ⛔ không ép `width` danh sách bằng đúng ô ở app.
- **Nền mục đã chọn (chọn nhiều — AppCombobox `multiple`, DropdownMenu `checked`):** các mục đã chọn **liền nhau nối nền thành 1 khối** — chỉ bo 2 góc trên của mục đầu và 2 góc dưới của mục cuối, mục ở giữa không bo (không thành từng viên rời có khe bo). Chọn 1: mục đã chọn bo đủ 4 góc. Có sẵn trong mds-ui.
- **Nút × CHỈ có ở ô tìm kiếm** (AppSearchbox, ô tìm của TableHeader): hiện SẴN khi có chữ (không chờ rê chuột), bấm / Esc → xóa trắng, con trỏ ở lại ô để tìm điều kiện khác. ⛔ Ô nhập chữ (AppTextbox — `clearable` chỉ có tác dụng với `type="search"`), Combobox, Datebox… KHÔNG hiện × (`.ibox__icon--clear`) khi có giá trị (`clearable` mặc định `false`) — đổi bằng cách chọn giá trị khác. Cần quay về rỗng: ô lọc placeholder dạng “…: Tất cả” tự có mục **“Tất cả”** đầu danh sách; trường KHÔNG bắt buộc trong form (AppInput / TipField, có placeholder) → mds-ui TỰ thêm mục **“Chưa chọn”** đầu danh sách (đổi chữ: `empty-option="Chưa giao"`), Backspace / Delete khi mở ô hoặc xóa trắng chữ rồi rời ô cũng = bỏ chọn, Esc giữ giá trị cũ; ô luôn phải có giá trị → `:clearable="false"`. Chọn nhiều: bỏ từng giá trị bằng × trên thẻ (không có × xóa hết). Trường bắt buộc không có mục để trống. Datebox giữ chữ “Xóa” trong lịch cho ngày không bắt buộc.
- **Mục 1 dòng trong danh sách xổ ra** (Combobox, menu 3 chấm, menu cột bảng, bộ lọc người…): cao **ĐÚNG `--menu-item-h`** (32 · Rộng 36) ở MỌI Font size — `min-height: var(--menu-item-h); padding: 0 var(--menu-item-px)`, căn giữa dọc. ⛔ Không cộng đệm dọc (VD `padding: 6px 12px`): ở Font size Trung bình / Lớn chữ cao 22 → 6 + 22 + 6 = 34px (lỗi đã gặp ở AppCombobox).
- **Mục 2 dòng trong danh sách xổ ra** (tên + mã / email / mô tả — AppCombobox có `description`, danh sách chọn người / dự án): **cao theo nội dung** = đệm 6 + dòng 20 + khe 2 + dòng 20 + đệm 6 (54px), cả 2 dòng `line-height: var(--text-body-lh)`. ⛔ Không dùng `min-height` của mục 1 dòng theo mật độ (`--menu-item-h`) cho mục 2 dòng — chữ 2 dòng sẽ dính nhau (lỗi đã gặp ở “Thêm dự án”). Ô tìm kiếm đầu menu cách danh sách 8px.
- **Tiêu đề form / popup / drawer = H2: 20px Semi Bold, dòng 28px** (`--text-h2` — Figma MDS Form 6019:124359, đổi từ 16px). Khung tiêu đề đệm 24 / 24 / 16 / 24, nút đóng 32px icon × 20px → cao 72. Có sẵn trong `AppFormPanel` (`.form-header__title`); drawer / popup tự dựng cũng dùng `--text-h2`. Tiêu đề card, section, nhóm trường trong form vẫn H3 16px. Tiêu đề popup xác nhận nên ngắn (1 dòng) — tên đối tượng dài đưa xuống nội dung.
- **Ô chỉ đọc (readonly) phải trông KHÔNG bấm được:** nền xám `--bg-neutral-light`, không viền brand khi rê; Combobox chỉ đọc **không có mũi tên ⌄**, Datebox chỉ đọc **không icon lịch / đồng hồ**, Textarea chỉ đọc **không góc kéo giãn** (có sẵn trong mds-ui). Khóa hẳn (disabled) vẫn giữ icon nhưng mờ. Người chỉ có quyền xem (QA, HRBP, Hạn chế…) thấy toàn bộ form ở trạng thái này.
- **Ô số (AppNumberbox) hiển thị theo quy chuẩn số TT200:** không gõ → `50.000.000` (qua `fmtNum`, theo `setNumberLocale`), bấm vào gõ → số thô `50000000` để sửa, dán `3.400.000` vẫn hiểu đúng (`parseNum`), ↑ ↓ tăng / giảm theo `step`, rời ô thì kẹp theo `min` / `max` rồi phát `change`. Có sẵn trong mds-ui — ⛔ không dùng `<input type="number">` trần (trình duyệt không hiện dấu phân cách hàng nghìn). ⛔ **Ô nhập số trong form luôn căn trái** (kể cả số tiền, đơn giá) — không truyền `align="right"`; chỉ ô số **trên bảng** (DataTable `numberbox`, cột số) căn phải để dễ cộng số giữa các dòng.
- **Dialog xác nhận / thông báo = `<AppAlertDialog>`** (Figma Alert Dialog 6019:180746): rộng 432, đệm 24, các phần cách 16, KHÔNG vạch ngăn; tiêu đề H3 16/22 Semi Bold (tối đa 2 dòng) + icon đóng 20px; nội dung 13/20; hàng nút căn phải cách 8 — Hủy (viền) · nút phụ (nếu có) · nút chính ngoài cùng phải (`type="danger"` → đỏ cho Xóa); bo 12 (`--radius-dialog`), bóng Bottom 12. Props: `title` `message` `type` `confirm-label` `cancel-label` `secondary-label` `link-label` `hide-cancel` `loading` `persistent`; Esc = Hủy, focus sẵn nút chính. ⛔ Không dựng dialog xác nhận bằng AppFormPanel (tiêu đề 20px, nút đóng 32px là của FORM).
- **Header mọi app = `ControlHeader`** (kể cả trang công khai như tài liệu `/ds`): bánh răng mở **Thiết lập màu sắc và hiển thị** (màu chủ đề, tiêu đề, nền, sidebar, mật độ, hình nền). Menu trái tự dựng phải theo `data-sidebar="dark"` / `data-wallpaper` như `.sidebar`. Hộp thiết lập: dãy màu dùng `justify-content: safe center` (màn hẹp vẫn cuộn tới màu đầu — đã sửa 02/11/2026).
- **⛔ Tổ hợp Tiêu đề (header) × Sidebar chỉ có 3 kiểu:** header **màu** + sidebar **sáng** · header **trắng** + sidebar **sáng** · header **trắng** + sidebar **tối**. **Cấm header màu + sidebar tối.** `theme.js` đã tự khóa: `applySidebarMode('dark')` khi header màu → về `'light'`; `applyMode('color')` khi sidebar tối → sidebar về sáng; helper `sidebarDarkAllowed(headerMode)`. Hộp Thiết lập màu sắc: chọn Tiêu đề “Màu đang chọn” → Sidebar tự về “Nền trắng”, nút “Nền tối” mờ (`aria-disabled`, tooltip “Chỉ dùng được khi Tiêu đề màu trắng”). App đặt mặc định riêng (VD sidebar tối) thì phải đi kèm header trắng; dựng ảnh / ví dụ / Figma cũng theo đúng 3 kiểu này.
- **Chỉ dùng control đã có trong mds-ui** (Button, Button Icon, Textbox, Combobox, Datebox, Numberbox, Checkbox, DataTable, DropdownMenu, AvatarFilter, AppAvatar, DetailField, SubNavTabs, Sub Menu, Toast…). Element chưa có → báo người phụ trách design system, không tự vẽ.

---

## Phần A — Quy tắc bắt buộc (đầy đủ, từ skill mds-webapp-developer)

> **📐 KHOẢNG CÁCH & BO GÓC CHUẨN — áp dụng MỌI màn, MỌI app (tránh lỗi vặt UI, thi công đồng nhất).** Token đã có trong `mds-ui/src/style.css` — chỉ dùng token, KHÔNG gõ số tay:
>
> | Quy chuẩn | Giá trị | Token / class mds-ui |
> |---|---|---|
> | **MỌI khối nền trắng đặt trên nền BG Page** (card, KPI, panel bảng, mục lục, khối tóm tắt, khối tự dựng…) | bo góc **8px** (`--radius-card` = Radius/Default 8, cố định mọi mật độ) + shadow **Drop Shadow / Neutral / All 2**, KHÔNG viền. **Chỉ popup / dialog mới bo 12px** (`--radius-dialog`); mọi bo góc thường khác dùng 8px; control đã có sẵn bo góc trong component thì giữ nguyên | `--radius-card` + `--shadow-card` — dùng `.card` / `.surface` (`.kpi-card`, `.table-panel`, `.data-panel--*` đã áp sẵn). Ngoại lệ: thanh full ngang (page-header, sub-nav) |
> | **Hover / nhấn** mọi control trên nền sáng (segment, tab, mục menu, dòng bảng, mục sidebar sáng, mục cây, ô lịch…) — Button & Button icon theo ngoại lệ cuối ô | Nền hiện tại **KHÔNG phải Brand Light** → hover **Brand Light**, nhấn **Brand Light Hover**. Nền hiện tại **ĐÃ là Brand Light** (đang chọn / đang bật / dòng đang chọn, hoặc control nằm trên nền Brand Light như nút trong dòng đang rê) → hover **Brand Light Hover**, nhấn **Brand Light Pressed**. CẤM hover bằng Neutral Light / Neutral Hover hay color-mix tự pha. Ngoại lệ: header, sidebar tối, nền ảnh/nền màu, biến thể Danger · Warning · Success · Info · AI, nút đặc (Primary…) giữ màu riêng. **Riêng Button (`.btn*`) VÀ Button icon (`.btn-icon`, mọi nút chỉ có icon) theo đúng Figma Button, hai loại cùng màu**: Brand Outline/Text hover Brand Light → nhấn **Brand Light Pressed**; **Neutral Outline/Text hover Neutral Light → nhấn Neutral Light Pressed** (KHÔNG dùng Brand Light); Info/Warning/Danger/Success hover Light → nhấn Light Pressed; Neutral Inverse hover Alpha White 200 → nhấn 300; **AI**: Solid gradient AI 600 → hover 700 → nhấn 800, Outline / Text / Icon nền hover gradient AI 50 → nhấn AI 100 (`--ai-grad-*`) | `--bg-brand-light` → `--bg-brand-light-hover` → `--bg-brand-light-pressed`; control đặt trong khối nền Brand Light tự dựng → gắn class `.on-brand-light` cho khối đó |
> | **Màu icon Neutral** (icon trong nút icon, nút Neutral / Ghost / Neutral Inverse, menu, sidebar, toolbar…) | **MỘT mã duy nhất** Icon/Neutral = `--icon-neutral` (#6B707A) ở mọi trạng thái — thường, rê chuột, nhấn, đang chọn. CẤM để icon ăn `currentColor` từ chữ Text/Primary (#10141B), CẤM đổi icon sang `--text-primary` / `--icon-neutral-hover` khi hover | đặt `color: var(--icon-neutral)` cho `.ti` hoặc nút chứa icon; chỉ nền đổi khi hover. Ngoại lệ duy nhất: **Icon Swap** (icon trần bấm được, không nền — `.icon-swap--action`) hover theo Figma: Neutral → Icon/Brand, màu khác → Icon/<Màu> Hover |
> | **Icon custom MDS** (Figma › Icons › Custom 17454:49925) | Dùng `<TIcon name="mds-…" />` (16 icon: `mds-search-spark`, `mds-collapse`, `mds-expand`, `mds-onedrive`, `mds-dropbox`, `mds-desktop`, `mds-google-drive`, `mds-send`, `mds-misa-lending`, `mds-knowledge`, `mds-resize`, `mds-export-excel`, `mds-chat`, `mds-support`, `mds-youtube`, `mds-blogger`) — SVG gốc trong `mds-ui/src/icons/customIcons.js`. Loại `mono` đổi màu theo token như icon Tabler; `fixed` (logo OneDrive / Dropbox / Google Drive / Desktop, Send, Knowledge, Search Spark gradient AI) **giữ màu gốc**, không gắn class màu; `mixed` (Export Excel) khung theo màu, dấu X giữ xanh | Thêm icon custom mới: xuất SVG từ Figma rồi thêm 1 dòng vào `customIcons.js` (thay `black` bằng `currentColor` nếu là icon 1 màu). ⛔ Không chèn `<svg>` rời trong app |
> | **Cỡ chữ** (mọi chữ trong app) | Dùng token `--text-*` theo collection Figma 🔢 Font Size — mode Small mặc định (Body 13/20), Medium / Large người dùng chọn ở Thiết lập hiển thị, Mobile Responsive tự áp màn ≤ 640px. CẤM ghi cứng px cho chữ | `var(--text-body)` · `var(--text-h2)` … · `applyFontSize()` |
> | **Form nhãn trái** (AppInput `:vertical="false"`) | Cột nhãn = **nhãn dài nhất + 8px** (8px = khoảng nhãn → ô), mọi ô nhập **thẳng hàng dọc** trong cả form; tối đa 200px, nhãn dài hơn thì xuống dòng. mds-ui tự tính (không ghi cứng 200px / 120px) | tự động theo khung `.form-body` / `.form-fields`; tự chọn vùng chung bằng `data-label-group` |
> | **Chân form** (thanh Lưu / Hủy, Bỏ lọc / Áp dụng) | Figma Form Footer: nền **Neutral/100** (#F4F4F6), viền trên 1px **Stroke/Neutral**, đệm 12 × 24 | `--bg-form-footer` · `--stroke-form-footer` · `.form-footer` |
> | Card ↔ card (ngang lẫn dọc) | **16px** | `--card-col-gap` |
> | **Đệm TRONG card / khối nền** (card, khối AI, ô hồ sơ, mục lục, khối tóm tắt, panel con trong card…) | **16px ĐỀU 4 phía — MỌI card có padding xung quanh, kể cả card màn Tổng quan / dashboard (KPI, biểu đồ, danh sách, bảng, widget)** — KHÔNG để trên-dưới 1 số, trái-phải 1 số (VD `8px 12px`) trừ khi người dùng yêu cầu riêng | `--box-padding` (`.card` đã dùng). Nội dung cần thẳng mép (link, nút cuối hàng) thì bỏ padding RIÊNG của control đó, không giảm đệm khối |
> | Control ↔ control đặt cạnh nhau: Button–Button, Button–Textbox, Searchbox–Combobox, icon-button–icon-button | **8px** | `--gap-control` (`.control-row`, `.page-header__right`, `.sub-nav-right`, `.table-toolbar__left/right` đã dùng sẵn) |
> | **Box / card THẤP** (cao ~1–2 dòng: inline alert, thanh thông báo, chip, tag, hàng thông tin, card nhỏ có icon + chữ + nút) | Khoảng cách chữ → mép trên và chữ → mép dưới gần như bằng nhau ⇒ icon, chữ, nút **CĂN GIỮA DỌC** (`align-items: center`), KHÔNG `flex-start` + `margin-top` bù tay cho icon. Chỉ căn đỉnh khi nội dung nhiều dòng thật sự (≥ 3 dòng / có đoạn văn dài) | `.inline-alert` (AppInlineAlert) đã căn giữa — box tự dựng dùng `display:flex; align-items:center` |
> | **Menu xổ ra** (3 chấm, chuột phải, Combobox, menu cột bảng, popover chọn…) | bo **Radius/Default** (8 · Nhỏ 6) + bóng Bottom 12 (`--shadow-popover`), không viền · đệm **8px** · item cao **32px** (Rộng 36, không theo nút) xếp **sát nhau** · ngăn nhóm bằng **Divider** 1px cách 4px · hover/chọn nền brand nhạt | `DropdownMenu` (chuột phải: `openAt($event)`) · token `--menu-pad`, `--menu-item-h`, `--menu-item-px`, `--menu-radius`, `--shadow-popover` — xem Phần B/D › DropdownMenu |
> | **Menu dọc BÊN PHẢI Sidebar chính** (mục lục chi tiết, menu cài đặt, menu danh mục…) | LUÔN dạng Figma **Sub Menu** 1 cột, ẩn Title · item cao **36px** cách nhau **4px**, đệm ngang 12px, bo 8px · hover nền xám nhạt · đang chọn nền brand nhạt + chữ brand Bold · chữ dài 1 dòng “…” + tooltip | `<aside class="card sub-menu"><nav class="menu-list">` + `.menu-list__item` / `--active` / `.menu-list__label` — xem Phần B/D › Sub Menu |
> | **Menu con của mục Sidebar chính** (VD Đề xuất → các loại đề xuất) | rê chuột xổ sang phải, **sát mép sidebar (0px)**, chuẩn menu xổ ra (bo Radius/Default, shadow Bottom 12, đệm 8, item 32 sát nhau, Divider ngăn nhóm) | `AppSidebar` item `children: [...]` — xem Phần B/D › AppSidebar — menu con |
> | Vùng nội dung ↔ sidebar / lề phải / lề dưới trình duyệt | **16px** | `--page-gutter` (`.content-wrapper` padding) |
> | **Thanh nút Lưu, Hủy của form nhập liệu** (popup, drawer, trang thêm / sửa) | **LUÔN ghim ở ĐÁY form** (nút chính bên phải), nội dung form cuộn bên trên, thanh nút luôn thấy. **⛔ KHÔNG đặt nút Lưu / Hủy ở đầu form** (cạnh tiêu đề, trên cùng), kể cả form dài — cũng không đặt 2 nơi | slot `#footer` của `<AppFormPanel>` (đã ghim đáy) · trang thêm / sửa toàn màn: thanh dính đáy `position: sticky; bottom: 0` + `--shadow-top-4` |
> | Form nhãn TRÁI – ô PHẢI | nhãn rộng **200px**, Regular · nhãn → ô **8px** · các hàng cách **12px** | `<AppInput :vertical="false">` trong `.form-fields.form-fields--h` |
> | Form nhãn TRÊN – ô DƯỚI | nhãn Semibold · nhãn → ô **4px** · các trường cách **16px** | `<AppInput>` (mặc định) trong `.form-fields` |
> | Form / màn chi tiết 2 cột | 2 cột cách **80px**, < 760px về 1 cột | `.form-fields--2col` / `.detail-grid` |
> | Nhiều NHÓM trường trong 1 card (VD "Thông tin chung" → "CMND/CCCD") | nhóm cách nhau **32px**, tiêu đề nhóm 13px semibold cách lưới **12px** — xa hơn hẳn khoảng cách hàng (12px) để thấy rõ phân cấp | `--form-group-gap`, `--form-group-title-gap` — `.detail-groups > .detail-group > .detail-group__title + .detail-grid` |
> | Màn **chi tiết** (xem) | nhãn 200px (hoặc động theo nhãn dài nhất cả màn: `v-auto-label-width` ở khung bao mọi card, 120–200px) + giá trị gạch chân mảnh; hover → gạch chân brand + bút chì cuối ô; bấm → sửa nhanh (✓ / ✕) | `<DetailField>` trong `.detail-grid` |
>
> Nguồn: Figma MDS Web Components v2.0 — Input Group (node `6019:51148`), Màn hình chi tiết (node `20191:63630`).
> ⛔ Cấm: tự viết `background:#fff; border-radius:…; box-shadow:…` cho khối trắng (dùng `.surface`/`.card`) · dùng `--radius-default` cho card (Nhỏ thành 6px) · `margin-left` để tách 2 nút (dùng `gap` của container) · `gap: 4px/6px/10px/12px` giữa các control ngang hàng · `border-radius: 6px/var(--radius-inner)` cho card · padding content-wrapper khác 16px · khoảng cách hàng form tự chế (10px, 20px, 24px…) · nhãn trái rộng tùy ý (120px, 160px…).
> Chỉ 2 kiểu form: nhãn trái / nhãn trên — KHÔNG trộn 2 kiểu trong cùng 1 nhóm trường.
>
> **📦 CHỐNG TRÀN KHUNG — bắt buộc test trước khi báo xong (lỗi cơ bản đã lặp lại: link “Đã đọc hết” trong popup thông báo tràn ra ngoài, ô Nền tảng tràn lề form nhập nhanh):**
>
> - **Nguyên nhân hay gặp:** 1 hàng flex chứa nhiều thứ dài thay đổi theo dữ liệu (tiêu đề + tab có số đếm “99+” + link/nút `white-space: nowrap; flex-shrink: 0`) trong khung cố định (popup 460px, dialog, card) · lưới `grid-template-columns: 1fr 1fr 1fr` (1fr = `minmax(auto, 1fr)` → cột giãn theo độ rộng tối thiểu của combobox / input) · flex child thiếu `min-width: 0`.
> - **Cách làm đúng:** lưới luôn `repeat(n, minmax(0, 1fr))` · flex child chứa chữ/control: `min-width: 0` + chữ dài `text-overflow: ellipsis` · hàng đầu popup / card có nội dung thay đổi (tab, số đếm, nút phụ) → **cho xuống 2 hàng** (`flex-wrap: wrap`, tab `order` xuống hàng dưới) thay vì nhồi 1 hàng · không đặt `nowrap + flex-shrink:0` cho thứ không có chỗ dự phòng.
> - **Hàng đầu popup / panel (thông báo, chat, danh sách nổi):** 1 hàng = tiêu đề · tab · nút **⋯** (`btn-icon btn-icon--sm` + `DropdownMenu placement="bottom-end"`) sát lề phải. Thao tác phụ (“Đánh dấu đã đọc hết”, “Xóa lịch sử”, “Cài đặt thông báo”…) cho VÀO MENU ⋯ — KHÔNG đặt link chữ trên hàng tiêu đề. Nút ⋯ luôn hiện (mục trong menu `disabled` khi không áp dụng) → hàng đầu không đổi khi đổi tab. `margin-left: auto` đặt cho phần tử con trực tiếp của hàng flex (`.dropdown-wrap`), không phải nút bên trong. Khung hẹp (`@container (max-width: 420px)`) ẩn chữ tiêu đề để đủ chỗ cho tab. Bấm trong menu (gắn vào body) không được đóng popup cha (`e.target.closest('.dropdown-menu')`).
> - **Segmented — mục CHƯA chọn: chữ Text/Primary** (không dùng Text/Secondary cho chữ segment), nền trong suốt; mục đang chọn đổi nền / màu theo kiểu (Brand Text · Solid · Filled). Dùng `AppSegmented` / `.seg`, không tự dựng.
> - **Tab dạng segmented:** mọi tab CÙNG độ đậm chữ (tab đang chọn chỉ đổi nền / màu, KHÔNG đổi font-weight) — đậm hơn làm tab rộng thêm → thanh tab rung khi bấm.
> - **⛔ KHÔNG NHẢY BỐ CỤC khi đổi trạng thái** (lỗi đã gặp: sửa tràn bằng `flex-wrap` → link “Đã đọc hết” ẩn / hiện theo tab làm hàng tab nhảy lên / xuống mỗi lần bấm): bố cục KHÔNG được phụ thuộc phần tử điều kiện (`v-if` nút / link / badge). Chia hàng bằng **markup cố định** (div hàng 1, div hàng 2), KHÔNG dựa vào `flex-wrap` tự xuống dòng; hàng chứa phần tử điều kiện đặt `min-height` = chiều cao phần tử đó (VD `var(--btn-height)`). Đổi tab / bộ lọc / chọn dòng → các thanh tab, toolbar, tiêu đề phải đứng yên.
> - **Test bắt buộc (Playwright, không chỉ nhìn):** mở ĐỦ mọi popup / dropdown / dialog / drawer vừa làm hoặc vừa sửa, ở **dữ liệu tối đa** (số đếm 99+, tên dài, mọi nút/link điều kiện đều hiện — giả lập bằng `page.route` nếu dữ liệu demo không có) và **2 bề rộng 1366px + 375px**, rồi chạy `overflow-check.js` (Phụ lục) → `window.__overflow('<selector khung>')` phải trả `[]`. Chụp màn hình khung để xem lại. **Đồng thời bấm qua lại MỌI tab / trạng thái** (kể cả kịch bản dữ liệu làm phần tử điều kiện ẩn ↔ hiện: chỉ tab A có dữ liệu, chỉ tab B, không tab nào, cả hai) và đo `getBoundingClientRect()` của thanh tab / toolbar / vùng danh sách — vị trí và chiều cao phải GIỐNG HỆT giữa các lần bấm (`window.__layoutKey(sel)` trong overflow-check.js).
> - **⛔ Viền đôi (double border) — test bắt buộc:** 2 viền 1px nằm sát nhau thành vạch dày 2px (lỗi đã gặp: nút thu gọn sidebar có `border-right` nằm sát viền phải của `.sidebar` ở chế độ thu gọn). Nguyên tắc: **mỗi đường ranh giới chỉ do 1 phần tử vẽ** — phần tử con nằm sát mép khung cha đã có viền thì KHÔNG thêm viền cùng cạnh; 2 ô / card đặt sát nhau thì chỉ 1 bên có viền (hoặc dùng `gap` / viền chung của khung). Muốn vạch nhấn PHỦ lên viền khung (VD gạch chân tab đang chọn) thì dùng margin âm để đè lên, không đặt sát bên trong. Test: chạy `double-border-check.js` (cùng chỗ với overflow-check.js) → `window.__doubleBorders('<selector>')` phải trả `[]` ở MỌI trạng thái của component vừa làm / sửa (thu gọn, mở rộng, rê chuột, đang chọn, sáng / tối) × 1366px + 375px.

> **🔢 ĐỊNH DẠNG SỐ HIỂN THỊ — bắt buộc MỌI app (Thông tư 200/2014/TT-BTC, mọi biểu mẫu / bảng biểu / báo cáo):** dấu **chấm (.) phân tách hàng nghìn**, dấu **phẩy (,) phân tách thập phân**.
>
> | Đúng (vi-VN) | Sai |
> |---|---|
> | `1.000` · `1.234.567` · `12.345.600` | `1000` · `1,234,567` · `1 234 567` |
> | `1,25` · `12.350,50` · `1.234.567,89` · `91,5%` | `1.25` · `12,350.50` · `1163.389` |
>
> - **Luôn dùng `fmtNum` / `fmtPct` của mds-ui** (`@mds/utils/number.js`, dùng `Intl.NumberFormat`): `fmtNum(1163.389)` → `1.163,389` · `fmtNum(v, { decimals: 2 })` · `fmtNum(v, { decimals: 0, min: 0 })` (tiền) · `fmtPct(91.5)` → `91,5%`. ⛔ KHÔNG tự viết `String(n)`, `n.toFixed()`, `.replace('.', ',')`, `toLocaleString()` không truyền locale để HIỂN THỊ số.
> - **Áp ở mọi nơi hiện số:** ô bảng, dòng Tổng, thẻ KPI (`kpi-num`), câu mô tả có số (“Tổng BA Point 1.250”), tooltip / trục biểu đồ ECharts (`valueFormatter: v => fmtNum(v)`, `axisLabel.formatter`), xuất PDF / in. DataTable đã tự định dạng ô **căn phải** có giá trị kiểu `number` (`col.decimals` để đổi số lẻ; `col.format: false` cho cột mã / năm / số điện thoại không được chèn dấu chấm). `footerTotals` mặc định dùng `fmtNum`.
> - **Không định dạng:** mã (PBI, mã nhân viên, số chứng từ), năm (2026), số điện thoại, số tài khoản — đây là chuỗi định danh, không phải số lượng.
> - **Ô nhập số:** hiển thị & nhận dấu phẩy thập phân (`AppNumberbox decimal`: gõ `5,75` hoặc `5.75` đều được, hiện `5,75`); đọc chuỗi người dùng dán vào bằng `parseNum`. Giá trị LƯU trong dữ liệu / gửi API vẫn là số JS (dấu chấm) — chỉ đổi lúc hiển thị.
> - **Nhiều thị trường:** quy tắc theo locale — app phục vụ nhiều quốc gia phải có thiết lập “Định dạng số” cho người dùng / đơn vị và gọi `setNumberLocale('en-US')` (→ `1,234,567.89`). Mặc định luôn `vi-VN`.

> **📍 DÒNG ĐANG XEM (danh sách + drawer chi tiết) — rule UX chung, bắt buộc:** bấm 1 dòng mở drawer → dòng đó **luôn được đánh dấu** (nền brand nhạt + vạch brand 3px đầu dòng) suốt lúc drawer mở, để người dùng biết đang xem dòng nào.
> - Đánh dấu bằng `row._mark = 'current'` (`.dt-row--mark-current`) — **ĐỘC LẬP với ô tick chọn hàng loạt**. ⛔ Không dùng `:selected` cho dòng đang mở khi bảng có cột tick (lỗi đã gặp: `:selected="canBulk ? checked : [drawerId]"` → người có quyền tick chọn thì mất dấu dòng đang xem). Bảng không có cột tick mới được dùng `:selected="[drawerId]"`.
> - Ưu tiên: `current` hơn `warning` (`_mark: id === drawerId ? 'current' : thiếu dữ liệu ? 'warning' : ''`).
> - ↑ / ↓ (useArrowNav) chuyển việc → dấu đi theo và cuộn dòng vào tầm nhìn · đóng drawer → bỏ dấu · tick / bỏ tick dòng khác KHÔNG làm mất dấu · đổi trang / lọc mà dòng vẫn còn → vẫn giữ dấu.
> - Áp cho MỌI danh sách có drawer (cả bảng chi tiết lồng trong drawer). Danh sách mở hộp thoại (modal) thì không cần.
> - **Test (Playwright):** mở dòng → đúng 1 `.dt-row--mark-current` ở đúng dòng · tick dòng khác → dấu vẫn ở dòng cũ · ↓ → dấu sang dòng kế · Esc → không còn dấu. Chạy với cả tài khoản có quyền tick chọn (Quản trị) lẫn không.
> - ⚠️ Biến `drawerId` dùng trong `computed` của dòng bảng phải **khai báo TRƯỚC** computed đó trong `<script setup>` (dùng trước khai báo → `Cannot access … before initialization`, cả trang / panel trắng trơn). Sau mỗi lần sửa: mở mọi trang + tab liên quan, bắt `pageerror` / console error = 0.

> **🖱️ TRẠNG THÁI TƯƠNG TÁC — bắt buộc:**
> - **Mọi icon rời bấm được** (sửa, xóa, ⋯, làm mới, cài đặt, chevron thu gọn, pager ‹ ›, đóng…) → **Button Icon Medium** `btn-icon` (32px) hoặc **Button Icon Small** `btn-icon btn-icon--sm` (28px) — Figma node `6019:3884`; có đủ Default / Hover / Pressed / Focus / Disabled. ⛔ Cấm `<TIcon @click>`, tự dựng nút icon (`width:24px…`), dùng `icon-swap--action` cho icon rời. **Back ←, ✕ đóng panel/drawer cũng là `btn-icon`** (style Icon); chỉ icon nằm bên trong control (✕ trong ô nhập, ✕ trên chip lọc) mới không phải Button Icon.
> - **Mọi thứ bấm được khi hover PHẢI có trạng thái thể hiện** (đổi nền / viền / màu) — chỉ đổi `cursor: pointer` là lỗi. Vùng lớn bấm được (tiêu đề phần, card, dòng) → hover nền nhạt hoặc làm nút icon bên trong hiện hover. Chi tiết: Phần B/D › “Button Icon Medium / Small” và “Quy tắc trạng thái hover”.

> **Header (ControlHeader) — 2 quy chuẩn bắt buộc:**
> 1. **Cài đặt chung đặt ở icon bánh răng trên header, xổ menu xuống** (`settings-menu`): mục đầu “Thiết lập hiển thị”, sau đó các mục cài đặt của app (VD “Cài đặt hệ thống” chỉ Quản trị). KHÔNG đặt mục cài đặt ở sidebar.
> 2. **Bấm logo / tên app trên header → về trang chủ** (`home-href` + `@home="router.push(...)"`).
> 3. **Tài khoản = avatar góc phải header**: bấm avatar → menu thông tin cá nhân (avatar, họ tên, email, vai trò) + **Đăng xuất** ở dưới (`user-email`, `user-role`, `user-picture`, `@logout`). KHÔNG đặt tên / vai trò / nút đăng xuất rời trên header.
>
> **Tiêu đề tab trình duyệt (document.title) — quy chuẩn MISA, bắt buộc:**
> - Màn danh sách: `Tên phân hệ hiện tại | Tên phân hệ cha, ông… (nếu có) | Tên ứng dụng` — VD `Rút dự toán | Kho bạc | MISA Mimosa Online`.
> - Màn thêm (trang hoặc popup thêm mới): `Thêm [tên phân hệ hiện tại] | Cha, ông… | Tên ứng dụng` — VD `Thêm rút dự toán | Kho bạc | MISA Mimosa Online`. Màn chi tiết một bản ghi: `Tên bản ghi | Phân hệ | Tên ứng dụng`.
> - Tên ứng dụng có tiền tố **MISA** (VD `MISA PD Point`), khai báo 1 hằng dùng chung cho header, `<title>` trong index.html, trang đăng nhập.
> - Dùng `@mds/utils/docTitle.js`: `setAppTitle(APP_NAME)` + `router.afterEach(to => setPageTitle(to.meta.title))` với `meta.title: ['Phân hệ', 'Cha']`; màn chi tiết / popup thêm gọi `useDocTitle(() => ['Thêm …', cha…])` (tự trả tiêu đề khi đóng; trả `[]` = giữ tiêu đề trang, VD popup ở chế độ sửa).
>
> **Form thêm mới (popup / trang thêm):** mở ra là **con trỏ nằm sẵn ở ô nhập đầu tiên** (bỏ qua ô chỉ đọc / bị khóa). Dùng `<AppFormPanel :autofocus="isNew">` (hoặc `focusFirstField(el)` từ `@mds/utils/autofocus.js` cho form tự dựng); form **sửa** thì không tự focus. Danh sách dòng nhập (VD “+ Thêm khối”) → con trỏ vào ô vừa thêm.
>
> **Tab sub-nav nhiều mục (VD vòng lặp, tháng):** KHÔNG để tràn ẩn mất — dùng `<SubNavTabs :items v-model>` (mds-ui): hiện số tab vừa chỗ, phần tràn gom vào nút **“Xem thêm (n) ▾”** (danh sách cuộn được), tab đang chọn luôn hiện trên thanh, tự tính lại khi đổi kích thước; slot `#tab` để thêm chấm đỏ / badge.
>
> **Người dùng bị cắt quyền (Đã khóa):** ẩn ở MỌI danh sách chọn người, thành viên, bộ lọc, avatar, tổng hợp — lọc tập trung ở hàm lấy thành viên của store (VD `membersOf`, `myTeam`), không lọc rải rác. Màn quản lý người dùng: “Tất cả” = người còn quyền, người đã khóa chỉ hiện khi lọc “Đã khóa” (để mở khóa lại). Dữ liệu cũ (công việc đã giao) vẫn giữ tên.
>
> **Báo có bản mới (sau mỗi lần deploy):** đặt `<AppUpdateNotice :build="__APP_BUILD__" />` 1 lần trong khung app; `vite.config` sinh mã phiên bản (`define: { __APP_BUILD__ }`) + xuất `version.json` lúc build. App tự kiểm tra 60 giây / khi quay lại tab → thông báo góc trên bên phải “Đã có phiên bản mới — Tải lại ngay”. Xem mẫu ở `chamdiem-app/vite.config.js`.
>
> **Toast (⛔ bắt buộc sau thao tác lưu):** thêm / cập nhật / chuyển… thành công → toast ở **GIỮA PHÍA TRÊN màn hình** (VD “Cập nhật thành công”, “Đã thêm 3 công việc”), tự ẩn ~3 giây; lỗi → toast lỗi (6 giây). Dùng `toast.success(msg)` / `toast.error(msg)` từ `@mds/utils/toast.js` + đặt `<AppToaster />` 1 lần trong khung app. Không tự dựng toast riêng từng màn. **Giao diện chuẩn:** nền màu đặc theo loại — thông tin `#3a63e6` (icon `info-circle`) · cảnh báo `#e38c2c` (`alert-triangle`) · lỗi `#d94b3a` (`alert-circle`) · thành công `#4aab66` (`circle-check`); chữ + icon + nút × màu trắng, bo góc 12px, đổ bóng nhẹ. Dùng `toast.info` / `toast.warning` / `toast.error` / `toast.success` đúng loại. **⛔ Lưu ngay khi đổi (không có nút Lưu — VD chi tiết công việc, đổi vai trò hàng loạt) → toast thành công PHẢI có nút “Hoàn tác”:** `toast.success('Đã cập nhật “Độ phức tạp thiết kế”', { action: { label: 'Hoàn tác', icon: 'arrow-back-up', onClick: undo } })` → hiện **8 giây**, rê chuột vào thì dừng đếm; `undo` ghi lại giá trị TRƯỚC khi sửa và trả lại đúng như cũ (các trường lưu cùng 1 lượt gộp 1 toast, hoàn tác trả lại tất cả), xong báo `toast.info('Đã hoàn tác')`. Nêu tên trường trong câu thông báo.
>
> **Nút split (chính ▾):** `.btn-split` > nút chính + `DropdownMenu` bọc nút mũi tên `.btn btn--primary btn-split__arrow` (VD “Thêm công việc ▾” → “Nhập nhanh công việc”).
>
> **Màn có hàng card thống kê (kpi-row) + danh sách:** nút icon ẩn / hiện thống kê nằm trong nhóm icon của TableHeader, **giữa Làm mới và Xuất file** — dùng `<TableHeader :charts-visible="showKpi" @toggle-charts="…">`: đang hiện = icon xanh brand, đang ẩn = icon màu neutral (như các icon khác, không làm mờ); để danh sách hiển thị được nhiều dòng nhất; nhớ lựa chọn theo trình duyệt (localStorage, bọc try/catch).
>
> **Tìm kiếm (⛔ bắt buộc mọi ô tìm / combobox):** không phân biệt dấu & hoa thường + **tìm theo chữ cái đầu** (VD gõ “kqq” ra “Khuất Quang Quân”). Dùng `matchText(text | [tên, email…], query)` từ `@mds/utils/search.js` — AppCombobox đã dùng sẵn; ô tìm tự viết trong app cũng phải dùng hàm này, không tự `toLowerCase().includes()`.
>
> **Quy chuẩn tiện dụng nhập liệu (⛔ bắt buộc mọi form / control):**
> - **Focus:** mở form nhập liệu → con trỏ ở ô nhập đầu tiên (`<AppFormPanel :autofocus>` / `focusFirstField`).
> - **Select All:** focus vào ô nhập 1 dòng (Tab, Shift+Tab hoặc bấm chuột) → chọn hết nội dung để gõ đè. Cài 1 lần trong `main.js`: `installInputBehaviors()` (`@mds/utils/inputBehavior.js`). Textarea không áp dụng; ô cần tắt → `data-no-select-all`.
> - **Tab / Shift+Tab:** Tab đi tới, Shift+Tab đi lùi; chỉ dừng ở ô nhập (nút / link / icon ⓘ trong thân form `tabindex=-1` — AppFormPanel tự làm).
> - **Thứ tự Tab (TabIndex):** trái → phải, rồi trên → dưới. Thông tin chia nhóm thì đi hết các ô trong nhóm 1 (trái → phải → trên → dưới) rồi mới sang nhóm 2, nhóm 3 → bố cục DOM phải đúng thứ tự này (lưới 2 cột: hàng nào xong hàng đó), không dùng `tabindex` dương.
> - **Tooltip:** mọi từ viết tắt phải có tooltip giải thích; chức năng / thông tin mà tên chưa nói đủ nghĩa phải có tooltip (ⓘ) diễn giải. Khai báo từ điển 1 lần: `registerAbbreviations({ PD: '…', PBI: '…' })` (`@mds/utils/abbr.js`) → tiêu đề cột DataTable, nhãn AppInput / TipField có từ viết tắt tự gạch chấm + tooltip; cột cần giải thích riêng dùng `col.tip`.
> - **⛔ Tooltip KHÔNG lặp lại chữ đang hiện đủ** (lỗi tái diễn nhiều lần, VD mục sidebar mở rộng hover lại hiện đúng tên mục): tooltip CHỈ khi nó cho thêm thông tin — phần tử **chỉ có icon** / chữ đang ẩn (sidebar thu gọn), chữ **bị cắt "…"**, **viết tắt**, hoặc câu **giải thích khác** chữ đang hiện. Chữ đầy đủ mà tooltip = đúng chữ đó → không hiện. Đã khóa sẵn trong mds-ui: `v-tip` và `enableAutoTooltips()` tự bỏ qua tooltip trùng chữ đang hiện (cần ép hiện: `v-tip.always`, hiếm). Bấm chuột thì tooltip ẩn; focus chỉ hiện tooltip khi đi bằng bàn phím (`:focus-visible`) — không để tooltip treo lại sau khi bấm.
> - **Label:** chỉ viết tắt khi nhãn có **từ 4 từ trở lên**, và khi viết tắt bắt buộc có tooltip giải thích đầy đủ (VD không viết “Ngày HT” cho “Ngày hoàn thành”).
> - **HotTrack:** rê chuột qua Tab, Sidebar, Toolbar, Button, Combo, dòng danh sách… → đổi màu nền để dễ nhận biết; mọi thứ bấm được có **con trỏ bàn tay** (style.css đã đặt chung cho button / role=button / a / summary / checkbox label).
>
> **Sidebar:** mặc định **mở rộng** (`:default-expanded="true"`) và đặt `storage-key` riêng cho từng app (VD `pdpoint-sidebar-expanded`) — chỉ lưu trạng thái khi người dùng tự bấm thu gọn / mở rộng.
>
> **Đồng nhất màn hình:** mọi màn cùng loại trong 1 app dùng chung 1 khung (page-header → sub-nav tab hàng riêng → content-wrapper → kpi-row → list-split > table-panel full chiều cao) và chung CSS khung đặt ở 1 file dùng chung — không chép CSS khung vào từng màn. Nút không bấm được thì ẩn, không disable. Chi tiết: Phần B/D › “Đồng nhất khung màn hình”.

```
1. CHỈ dùng token màu, spacing, radius, typography từ file này.
   NGHIÊM CẤM hardcode hex màu, px tùy ý ngoài bảng token.

2. MỌI component PHẢI dùng đúng class/token tương ứng với MDS design.
   Không được tự đặt tên class random.

3. Đọc kỹ input trước khi viết code — không tự đoán label, tên field, cột bảng.

4. Output phải là code chạy được ngay — không để placeholder "//TODO" hay "..."

5. Vue component: dùng Composition API (<script setup>) trừ khi user yêu cầu Options API.

6. Sau khi viết xong: đối chiếu lại checklist cuối file trước khi trả kết quả.

7. CARD/PANEL trắng trên nền --bg-page: PHẢI dùng box-shadow: var(--shadow-card).
   ⛔ NGHIÊM CẤM TUYỆT ĐỐI dùng border để tạo viền cho card/panel nền trắng đặt trên nền xám (--bg-page).
   Áp dụng với MỌI loại card: .card, .tnm-hero, .tnm-grid3-card, .tnm-alt-row, stat card, KPI card, và bất kỳ block nền trắng nào trên nền xám.
   PRE-SUBMIT SCAN: trước khi trả code, bắt buộc grep toàn bộ style block — nếu thấy bất kỳ selector nào vừa có background: var(--bg-white) vừa có border: ... → XÓA border đó ngay.
   TIÊU ĐỀ CARD — phân biệt theo loại card:
   • Scorecard / KPI card (nhỏ, chỉ hiện 1 chỉ số): tiêu đề font-size: var(--text-body) 13px; font-weight: var(--fw-semibold); color: var(--text-secondary). Số value: font-size: var(--text-h2) 20px; font-weight: var(--fw-bold); color: var(--text-primary).
     Icon minh hoạ (nếu có): BẮT BUỘC icon dạng OUTLINE (TIcon nét, không filled / emoji) trong ô bo góc NỀN MÀU NHẠT cùng tông — dùng `.kpi-icon .kpi-icon--{theme}` của mds-ui; các card cùng hàng khác màu nhau.
   • Card lớn (biểu đồ, danh sách, bảng, nội dung phong phú): tiêu đề PHẢI dùng H3 — font-size: var(--text-h3) 16px; font-weight: var(--fw-semibold); line-height: var(--text-h3-lh); color: var(--text-primary).
   NGHIÊM CẤM nhầm lẫn giữa hai loại: Scorecard KHÔNG dùng H3 cho title, Card lớn KHÔNG dùng 13px cho title.

8. FONT CHỮ: LUÔN LUÔN CHỈ dùng Inter Variable (InterVariable) — NGHIÊM CẤM TUYỆT ĐỐI dùng bất kỳ font nào khác.
   ⛔ NGHIÊM CẤM: Arial, Helvetica, system-ui, Segoe UI, Roboto, Google Fonts, hay bất kỳ font nào ngoài Inter.
   ⛔ NGHIÊM CẤM: hardcode font-family trực tiếp trong code — chỉ được dùng var(--font-family).
   ✓ Font self-hosted trong mds-ui/src/fonts/ — KHÔNG cần CDN, KHÔNG cần thêm <link> vào index.html.
   CSS var: --font-family: InterVariable, 'Inter var', sans-serif;
   Tên font-family đúng (v4.1): InterVariable  (KHÔNG dùng 'Inter var', KHÔNG dùng 'Inter')
   body phải có: font-optical-sizing: auto; font-feature-settings: 'liga' 1,'calt' 1,'cv02','cv03','cv04','cv11'; -webkit-font-smoothing: antialiased;
   Cho JavaScript/ECharts: const FONT = 'InterVariable, "Inter var", sans-serif' — KHÔNG ĐƯỢC thay bằng bất kỳ font nào khác.
   ⚠️ VITE DEV SERVER: Font file nằm trong mds-ui/src/fonts/ (ngoài project root) — bắt buộc thêm fs.allow vào vite.config.js:
     server: { fs: { allow: [path.resolve(__dirname, '..')] } }
   Thiếu dòng này → Vite chặn font file → browser fallback sang Arial.

9. BIỂU ĐỒ: CHỈ dùng Apache ECharts (https://echarts.apache.org/examples).
   CDN: <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
   NGHIÊM CẤM dùng Chart.js, D3, Recharts hay bất kỳ thư viện chart nào khác.
   - Container là <div> (không phải <canvas>), phải có width/height tường minh.
   - Màu sắc đọc từ CSS variable qua cssVar() helper, KHÔNG hardcode hex trong setOption().
   - Khởi tạo lazy khi panel/tab hiển thị, gọi chart.resize() khi window resize.

9. MÀU SẮC THEME: MỌI giá trị màu PHẢI lấy từ Phần C2.1 (thang Brand 10 theme).
   NGHIÊM CẤM tự tính toán / sinh ra hover, disable, pressed, light từ màu gốc.
   NGHIÊM CẤM lên Figma đọc lại khi đã có trong Phần C2.1.
   Ví dụ SAI: lấy #0e9384 rồi tự tối hơn 10% để làm hover, hoặc gọi Figma MCP để lấy màu đã có sẵn.
   Ví dụ ĐÚNG: mở Phần C2.1 → copy đúng giá trị → paste vào code.
   Nếu biến cần chưa có trong Phần C2.1 → hỏi user bổ sung, KHÔNG tự bịa.
   → Xem toàn bộ 10 theme và CSS override template tại: Phần C2.1

10. BORDER-RADIUS:
    • CARD / PANEL nền trắng trên BG Page (card, kpi-card, table-panel, skeleton card…) + MỌI bo góc thường khác: 8px mọi mật độ → var(--radius-card), shadow var(--shadow-card) (Neutral All 2).
    • CHỈ POPUP / DIALOG (và popover nổi dạng thẻ) bo 12px → var(--radius-dialog).
    • Component đã set sẵn bo góc (nút, ô nhập, menu, tag, badge…) → dùng nguyên, không ghi đè.
    • CONTROL (input, button, combobox, datebox, tag, badge, dropdown item…) dùng var(--radius-default):
      Nhỏ = 6px (mds-ui tự đổi token), Medium / Comfortable = 8px.
    NGHIÊM CẤM hardcode 6px hay 8px — card dùng --radius-card, control dùng --radius-default / --radius-inner.
    Bo góc lồng nhau: bo NGOÀI luôn theo chuẩn (card 8, control 8, dialog 12 — không nới cho vừa con). Chỉ khi con nằm SÁT mép (đệm < bo ngoài, 2–4px) mới tính bo trong = bo ngoài − đệm (ô 8 − đệm 2 = 6 → --radius-inner, VD tag trong Combobox, mục Segmented). Đệm ≥ bo ngoài (card đệm 16, popover đệm 8) → con giữ bo chuẩn của nó.
    ⛔ KHÔNG viết override kiểu `[data-density="compact"] .card { border-radius: 6px }`.

11. MÀU TEXT TRUNG TÍNH — chỉ có 3 loại, KHÔNG ĐƯỢC tự sinh mã hex từ bất kỳ nguồn nào:
    • Text Primary   = var(--text-primary)   → heading, nội dung chính, label, title, body text
    • Text Secondary = var(--text-secondary) → mô tả phụ, metadata, ngày tháng, lượt xem, caption
    • Text Hint      = var(--text-hint)      → placeholder trong input, watermark
    NGHIÊM CẤM đọc màu từ ảnh/Figma/screenshot rồi hardcode hex vào color text.

12. CONTROLS & LAYOUT: CHỈ dùng components và patterns đã được duyệt trong vue-controls.md.
    NGHIÊM CẤM tự thi công control mới khi chưa được phép — dù ảnh mockup hay Figma mô tả khác đi.
    Thiếu control → bỏ trống, báo user. Xem đầy đủ tại: Phần B + Phần D

11. MÀU TEXT TRUNG TÍNH — chỉ có 3 loại, KHÔNG ĐƯỢC tự sinh mã hex từ bất kỳ nguồn nào:
    • Text Primary   = var(--text-primary)   → heading, nội dung chính, label, title, body text
    • Text Secondary = var(--text-secondary) → mô tả phụ, metadata, ngày tháng, lượt xem, caption
    • Text Hint      = var(--text-hint)      → placeholder trong input, watermark
    NGHIÊM CẤM đọc màu từ ảnh/Figma/screenshot rồi hardcode hex vào color text.
    NGHIÊM CẤM dùng token màu khác (brand, accent, success, warning...) cho text trung tính.
    NGHIÊM CẤM tự ý sinh màu trung tính thứ 4 ngoài 3 loại trên.
    Ngoại lệ DUY NHẤT: user cung cấp đúng hex và yêu cầu rõ ràng → mới được dùng hex đó.

12. ⛔ FORBIDDEN PATTERNS — CẤM TUYỆT ĐỐI VIẾT CÁC PATTERN SAU TRONG CODE NGƯỜI DÙNG:

    Bảng "nếu mày nghĩ X → phải dùng Y":

    | ❌ NGHIÊM CẤM viết thủ công | ✅ PHẢI dùng component | Lý do |
    |---|---|---|
    | `<input class="ibox__native"` | `<AppTextbox>` | AppTextbox đã xử lý đúng |
    | `<select class="ibox__native` | `<AppCombobox>` | AppCombobox tự render chevron |
    | `<button class="ibox__icon ibox__icon--action"` | không tồn tại độc lập — nằm trong App* | icon-action button chỉ được render bởi AppTextbox/AppCombobox nội bộ |
    | `<i class="ti ti-` | `<TIcon name="...">` | Font icon không được load — chỉ TIcon SVG hoạt động |
    | `class="ibox__icon--action"` trên button do user viết | N/A | Button ngoài App* → dùng `btn-icon btn-icon--outline` |
    | `type="text" v-model` trong raw `<input>` | `<AppTextbox v-model>` | |
    | `type="number"` trong raw `<input>` (standalone) | `<AppNumberbox v-model>` | |
    | `type="date"` trong raw `<input>` | `<AppDatebox v-model>` | |
    | `<textarea class=` | `<AppTextarea v-model>` | |
    | `type="text" placeholder="Tìm"` kèm icon search | `<AppSearchbox v-model>` | |

    **Trường hợp được phép dùng raw ibox (không thay bằng App*):**
    - Composite control: label text + input + separator + text label (VD: "Kèm theo N chứng từ gốc") — KHÔNG có component nào cover case này
    - Inline currency selector trong tab bar: ibox wrap {label + select + TIcon chevron} — native select, TIcon là span không phải button
    - Trong nội bộ chính các AppXxx component (mds-ui source) — đương nhiên

    **Chiều cao ô nhập (.ibox__native):** input bên trong PHẢI cao bằng cả khung `.ibox` (`height` = `line-height` = `calc(var(--input-height) - 8px)`, căn giữa dọc `align-self: center` → cách viền 4px trên/dưới; ibox--sm: `- 12px`) — KHÔNG để `line-height: normal` (~16px): Chrome cắt chữ theo dòng của vùng soạn thảo bên trong input, vì sẽ cắt mất dấu chồng của chữ HOA tiếng Việt (VD "CÔNG TY CỔ PHẦN": dấu hỏi/huyền trên Ổ, Ầ, Ỗ, Ỷ). Không ghi đè `height`/`line-height` cho input trong ibox. Khi sửa ô nhập, kiểm tra bằng chuỗi "CÔNG TY CỔ PHẦN Ỷ Ẩ Ỗ" ở cả mật độ Nhỏ.

    **PRE-SUBMIT SCAN — trước khi trả code, grep ngay trong file vừa viết:**
    ```
    Grep cho: ibox__native   → nếu thấy → thay bằng App*
    Grep cho: ibox__icon--action → nếu thấy → chỉ hợp lệ trong App* source, không trong user code
    Grep cho: <i class="ti  → nếu thấy → thay bằng <TIcon name="...">
    Grep cho: <input type=  → nếu thấy ngoài composite ibox → thay bằng App*
    ```

11. QUY TRÌNH BẮT BUỘC KHI NHẬN YÊU CẦU VẼ MÀN HÌNH:
    BƯỚC 1 — Xác định loại màn hình: danh sách / form / dashboard / detail...
    BƯỚC 2 — Glob mds-ui/src/components/*.vue để liệt kê toàn bộ components hiện có.
    BƯỚC 3 — Với mỗi vùng UI: lấy component tương ứng từ mds-ui, BÊ NGUYÊN vào, CHỈ thay đổi text/label/data theo yêu cầu.
    BƯỚC 4 — Vùng nào không có component phù hợp → ĐỂ TRỐNG, liệt kê cho user biết. KHÔNG tự vẽ HTML thay thế.
    ⛔ NGHIÊM CẤM: Thêm slot/prop/CSS không có trong component gốc để "bổ sung tính năng".
    ⛔ NGHIÊM CẤM: Dùng :deep() hay scoped CSS để override built-in của component.
    ⛔ NGHIÊM CẤM: Tự ý cập nhật skill/vue-controls.md trừ khi user yêu cầu tường minh.
    ✓ Mỗi component luôn lấy trạng thái/variant mặc định (default) khi không có yêu cầu cụ thể.
    ✓ User sẽ tự prompt thêm cho từng app — không đoán trước hay bổ sung ngoài yêu cầu.
```

---

## Phần B — Đặc tả chi tiết

Token đầy đủ ở **Phần C**. Bảng dưới là cách DÙNG token.

### B2. Màu chữ và màu nền — dùng khi nào

| Trường hợp | Token | ⛔ Sai thường gặp |
|---|---|---|
| Nội dung chính, tiêu đề, nhãn | `--text-primary` | `#000`, `#333`, mã màu lấy từ ảnh |
| Mô tả phụ, ngày, caption, dòng phụ trong bảng | `--text-secondary` | `--text-hint` cho chữ đọc được |
| Placeholder | `--text-hint` | |
| Mục đang chọn, số nổi bật, link | `--text-brand` / `--text-link` | `#245fdf` gõ tay → không theo theme |
| Lỗi / xóa / nguy hiểm | `--text-danger` + `--icon-danger` | |
| Chữ liên quan AI | class `.text-ai-primary` (gradient) | `--text-ai` đơn sắc |
| Nền trang | `--bg-page` | |
| Card, popup, menu | `--bg-white` | |
| Hover nút trung tính / nút icon | `--bg-neutral-light` | `--bg-neutral-hover` cho mọi thứ |
| Nhấn (pressed) nút trung tính | `--bg-neutral-pressed` | |
| Mục đang chọn (menu, danh sách, tab kiểu Filled) | `--bg-brand-light` (tab gạch chân `.sub-nav-tab` đang chọn: nền trắng + chữ Bold brand + gạch 2px brand; hover tab: `--bg-neutral-hover`) | `rgba(…)` tự pha |
| Khối nội dung AI | `--bg-ai-gradient-light` | |

- Chỉ 3 mức chữ trung tính: primary / secondary / hint. Không tự sinh mức xám thứ 4.
- Viền ô nhập, nút outline: `--stroke-neutral`. Vạch ngăn: `--stroke-divider`. Viền focus: `--stroke-brand`.

### B3. Cỡ chữ

- **Mọi chữ đọc được dùng 13px** (`--text-body`, line-height 20px): nội dung, nhãn, mô tả phụ, chữ trong ô, chip, menu, popover. ⛔ Không dùng 12px / 11px cho nội dung; 12px chỉ cho badge đếm số rất nhỏ.
- Tiêu đề card lớn / khối: H3 16px Semibold. Tiêu đề trang: theo page header.
- Thẻ KPI nhỏ: tiêu đề 13px Semibold `--text-secondary`, số 20px Bold `--text-primary`.
- Nhãn form nhãn trên: Semibold. Nhãn form nhãn trái và nhãn màn chi tiết: Regular.

### B4. Bo góc và shadow

| Thành phần | Bo góc | Shadow | Viền |
|---|---|---|---|
| **Mọi khối nền trắng đặt trên nền trang** (card, KPI, panel bảng, mục lục, khối tóm tắt, khối tự dựng) | `--radius-card` **8px** (mọi mật độ) | `--shadow-card` (Neutral All 2) | **Không** |
| Nút, ô nhập, item menu | `--radius-default` | — | theo control |
| **Menu xổ ra** (3 chấm, chuột phải, danh sách Combobox, menu cột bảng, chọn người, menu con sidebar) | `--menu-radius` = Radius/Default **8px** (Nhỏ 6) | `--shadow-popover` | **Không** |
| **Popover dạng thẻ** (lịch chọn ngày, lọc cột, popover hồ sơ / công cụ) | `--radius-dialog` **12px** | `--shadow-popover` | **Không** |
| **Popup / dialog** / drawer | `--radius-dialog` **12px** (Figma Radius/Popup-Dialog — chỉ popup, dialog mới bo 12) | `--shadow-dialog` = Drop Shadow/Neutral/**Bottom 12** (`0 4px 12px 0` Alpha Black 100 — ⛔ không dùng bóng to / đậm kiểu `0 8px 24px`) | Không |
| Avatar, badge tròn | `--radius-pill` | — | theo B9 |

⛔ Cấm:
- Tự viết `background:#fff; border-radius:…; box-shadow:…` cho khối trắng → dùng `.card` / `.surface`.
- Dùng `--radius-default` cho card (Nhỏ sẽ thành 6px).
- Dùng `--shadow-lg` / `--shadow-md` / bóng gõ tay (`0 8px 24px…`) ở BẤT KỲ đâu — chỉ dùng token Figma: card `--shadow-card` (All 2) · lớp nổi (menu, popover, tooltip, toast, popup, dialog) `--shadow-popover` / `--shadow-dialog` (Bottom 12) · nổi khi rê chuột `--shadow-bottom-8` · panel ghim phải / sidebar bung `--shadow-left-8` / `--shadow-right-12`. `--shadow-md` / `--shadow-lg` chỉ còn để tương thích code cũ.
- Thêm viền 1px cho card / popover đã có shadow.
- Dùng shadow cho khối trắng đặt trên nền trắng khác (card con trong card, khối trong popup / drawer) → dùng nền màu hoặc viền `--stroke-neutral-light`.

> **Shadow hay Stroke (viền) — chọn MỘT (user chốt 2026-11-05):**
> 1. **Đã có border thì KHÔNG thêm shadow** (và ngược lại: khối đã có shadow thì không thêm viền 1px). Không bao giờ vừa viền vừa bóng cho cùng một khối.
> 2. **Khối nền trắng đặt trên một nền TRẮNG khác** (card con trong card, ô tóm tắt trong popup / dialog / drawer, khối trong form trắng) → **KHÔNG dùng shadow**; tách lớp bằng **nền màu** (`--bg-page` / `--bg-neutral-light` / `--bg-brand-light`…) **hoặc viền** `1px solid var(--stroke-neutral-light)` (`--stroke-divider`).
> 3. Shadow chỉ dùng khi khối **nổi trên nền khác màu / lớp khác**: card trắng trên nền trang xám (`--shadow-card`), menu / popover xổ ra (`--shadow-popover`), popup / dialog / drawer (`--shadow-dialog`), thanh / cột dính (`--shadow-top-*`, `--shadow-right-*`).
> Tư vấn nhanh: “nền trắng trên nền xám → shadow All 2, không viền” · “trắng trên trắng → viền Stroke Neutral Light hoặc đổi nền màu, không shadow” · “nổi lên trên nội dung (menu, popup) → shadow, không viền”.

### B5. Khoảng cách

| Quy chuẩn | Giá trị | Token / class |
|---|---|---|
| Card ↔ card (ngang và dọc) | **16px** | `--card-col-gap` |
| Đệm TRONG card / khối nền (card, khối AI, ô hồ sơ, mục lục, panel con) | **16px đều 4 phía** cho mọi card có padding (cả màn Tổng quan) — không để trên-dưới một số, trái-phải một số | `--box-padding` (`.card` có sẵn) |
| Control ↔ control đặt cạnh nhau (Button–Button, Button–Textbox, Searchbox–Combobox, icon button–icon button) | **8px** | `--gap-control` (`.control-row`, `.page-header__right`, `.table-toolbar__left/right`) |
| Nội dung ↔ sidebar / lề phải / lề dưới trình duyệt | **16px** | `--page-gutter` |
| Form nhãn TRÁI – ô PHẢI | nhãn rộng **200px** · nhãn → ô **8px** · các hàng **12px** | `.form-fields.form-fields--h` |
| Form nhãn TRÊN – ô DƯỚI | nhãn → ô **4px** · các trường **16px** | `.form-fields` |
| Form / màn chi tiết 2 cột | 2 cột cách **80px**; dưới 760px về 1 cột | `.form-fields--2col` / `.detail-grid` |
| Nhiều nhóm trường trong 1 card | nhóm cách **32px**, tiêu đề nhóm 13px Semibold cách lưới **12px** | `--form-group-gap`, `--form-group-title-gap` |

- Tách 2 nút bằng `gap` của container, **không** dùng `margin-left`.
- ⛔ Cấm `gap: 4px / 6px / 10px / 12px` giữa các control ngang hàng; khoảng cách hàng form tự chế (10, 20, 24px); nhãn trái rộng tùy ý (120, 160px). Ngoại lệ có chủ đích: item trong Sub Menu cách nhau 4px (B8).
- Nội dung cần thẳng mép (link, nút cuối hàng) → bỏ padding riêng của control đó, **không** giảm đệm khối.
- Chỉ 2 kiểu form: nhãn trái hoặc nhãn trên; không trộn 2 kiểu trong cùng một nhóm trường.

**Box / card THẤP** (cao 1–2 dòng: inline alert, thanh thông báo, chip, tag, hàng thông tin, card nhỏ có icon + chữ + nút) → icon, chữ, nút **căn giữa dọc** (`display:flex; align-items:center`). Không dùng `flex-start` rồi `margin-top` bù tay cho icon. Chỉ căn đỉnh khi nội dung thật sự ≥ 3 dòng.

**Card / dòng công việc ĐÃ HOÀN THÀNH** (card Kanban, dòng danh sách, việc con, checklist):
- Nền **giữ nguyên `--bg-white`** như card thường. ⛔ Không tô nền xanh nhạt — cột "Hoàn thành" trên Kanban vốn đã ánh xanh nên card bị chìm vào nền cột.
- ⛔ Không thêm vạch màu ở mép trái / viền màu — đã thử 3px rồi 2px, đều nhìn thô và rối.
- Chỉ thể hiện bằng **2 tín hiệu**: nút tích tròn đặc màu `var(--bg-success)` + dấu ✓ trắng, và tên **gạch ngang** (vẫn giữ `--text-primary`).
- Tag, ngày, người thực hiện… **giữ trạng thái bình thường** — ⛔ không `opacity` / làm xám.
- Màu xanh "xong" luôn lấy token `--bg-success` (nền nút tích) / `--text-success` (icon, chữ) — ⛔ không hardcode `#16a34a`, `#12b76a`.

### B6. Chiều cao control và mật độ hiển thị

- **Không bao giờ viết `height` / `width` px cứng cho nút, ô nhập, nút icon.** Lấy từ `var(--btn-height)` / `var(--input-height)` để đổi theo mật độ (Nhỏ 28 / Trung bình 32 / Rộng 36).
- Cần nhỏ hoặc lớn hơn thì dùng đúng bước mds-ui đang dùng:
  - nhỏ: `calc(var(--btn-height) - 4px)` (= `.btn--sm`, `.btn-icon--sm`)
  - lớn: `calc(var(--btn-height) + 8px)` (= `.btn--lg`)
  - Không tự chế bước khác (`-12px`, `-16px`…).
- Icon trong mọi nút: 16px.
- Ngoại lệ cố định (không theo mật độ): mục Sidebar chính 36px, item Sub Menu 36px, dòng bảng 2–3 dòng chữ 56 / 72px.

### B7. Nút và trạng thái tương tác

**Mọi icon rời bấm được** (sửa, xóa, ⋯, làm mới, cài đặt, chevron thu gọn, ‹ ›, đóng, quay lại ←) → **Button Icon Medium** `btn-icon` hoặc **Small** `btn-icon btn-icon--sm`. Có đủ trạng thái:

| Trạng thái | Giao diện |
|---|---|
| Default | nền trong suốt, icon `--icon-neutral` |
| Hover | nền `--bg-neutral-light`, icon `--text-primary` |
| Pressed | nền `--bg-neutral-pressed` |
| Focus (bàn phím) | viền `--stroke-brand` + vòng sáng brand 20% |
| Disabled | mờ 45%, không hover |

- ⛔ Cấm `<TIcon @click>`, tự dựng nút icon (`width:24px…`), dùng `icon-swap--action` cho icon rời. Chỉ icon nằm **bên trong** một control (✕ trong ô nhập, ✕ trên chip lọc) mới không phải Button Icon.
- **Mọi thứ bấm được khi rê chuột PHẢI có trạng thái thể hiện** (đổi nền / viền / màu). Chỉ đổi `cursor: pointer` là lỗi. Vùng lớn bấm được (tiêu đề phần, card, dòng) → hover nền nhạt, hoặc làm nút icon bên trong hiện hover.
- Nút chữ: `.btn` + biến thể (`--primary`, `--outline`, `--neutral`, `--link`, `--ai`, `--ai-outline`); cao `--btn-height`, rộng tối thiểu 80px, chữ 13px Medium.

### B8. Menu

#### B8.1 Menu xổ ra — Figma "Dropdown Menu" (node `6019:42469`)

Áp cho **mọi** menu xổ ra: nút 3 chấm, chuột phải, danh sách Combobox, menu tiêu đề cột bảng, popover chọn người, và menu tự dựng trong app.

| Phần | Giá trị | Token |
|---|---|---|
| Khung | nền trắng, bo **Radius/Default** (8px · Nhỏ 6px), bóng **Drop Shadow / Neutral / Bottom 12**, **KHÔNG viền**, rộng tối thiểu 200px (Min-Width 80 · Rộng 96) | `--menu-radius`, `--shadow-popover`, `--menu-min-w` |
| Đệm khung danh sách | **8px** đều 4 phía | `--menu-pad` |
| Giữa các item | **0** — item xếp sát nhau (7 item × 32 = 224) | `--menu-gap` |
| Item | cao **32px** (Nhỏ cũng 32 · Rộng 36; dòng có chữ phụ 48 · Rộng 52) — **KHÔNG theo `--btn-height`**, đệm ngang **12px** (Rộng 16), bo Radius/Default, icon ↔ chữ 8px, chữ 13/20 Regular | `--menu-item-h`, `--menu-item-h-2`, `--menu-item-px`, `--menu-item-gap`, `--menu-radius` |
| Icon trái | **20px**, màu `--icon-neutral` | `--menu-icon` |
| Hover / phím ↑↓ | nền **brand nhạt** (`--bg-brand-light`) — KHÔNG dùng nền xám | |
| Đang chọn | nền brand nhạt + chữ **brand Semibold**; chọn nhiều thêm **✓ 16px** cuối dòng | |
| Nguy hiểm (Xoá…) | chữ + icon `--text-danger` | `danger: true` |
| Ngăn nhóm | **Divider** 1px `--stroke-divider`, cách item trên / dưới **4px** (Padding-Vertical-Small · Rộng 8). Không dùng khoảng trống thay vạch ngăn | `--menu-sep-my` · `{ separator: true }` |
| Ô tìm kiếm trong menu | trên cùng, đệm **4 · 12 · 8 · 12** (trái/phải theo `--menu-item-px`) | |

Nguồn: Figma MDS “Dropdown Menu” `6019:42469` + biến `Components/Menu List/*` (đọc lại 2026-10-30). Popover dạng thẻ (hồ sơ, lịch chọn ngày, panel công cụ) KHÔNG phải menu → bo `--radius-dialog` (12px).

**⛔ Mọi danh sách xổ ra đều theo Menu List — kể cả popover dạng thẻ có danh sách bấm được** (menu tài khoản trên header, bảng thông báo, "đang hoạt động", việc cần làm, chọn người…): khung đệm **`--menu-pad` (8px)** 4 phía, item đệm ngang `--menu-item-px` + **bo `--menu-radius`** → **hover / nền chọn / nền chưa đọc KHÔNG chạm 2 mép trái phải** (lỗi đã gặp: item `padding: 0 16px` sát mép khung `padding: 4px 0`). Hover = nền **brand nhạt** (`--bg-brand-light`; item đã có nền brand nhạt như thông báo chưa đọc → hover đậm hơn 1 bậc `color-mix(in srgb, var(--bg-brand) 12%, var(--bg-white))`), không dùng nền xám. Khung **không viền**, bóng `--shadow-popover`. Ngăn nhóm: Divider trong vùng đệm (`margin: var(--menu-sep-my) 0`), không kẻ vạch tràn mép giữa các item. Test: mở từng menu, đo `item.left − pop.left ≥ 8` và `pop.right − item.right ≥ 8`, `border-radius` ≠ 0, ở 1366 + 375.

**⛔ Lớp chồng (z-index):** menu / popover xổ từ **header** (tài khoản, thông báo, đang hoạt động, tiện ích, chọn vai trò…) LUÔN nằm trên drawer và panel chat / AVA → dùng `z-index: var(--z-header-pop)` (9600) **và Teleport ra `body`** (để trong header thì bị z-index 100 của header giới hạn → drawer đè lên, lỗi đã gặp). Thang chung trong mds-ui: nội dung < header 100 < drawer `--z-drawer` 900 < dialog `--z-dialog` 1000 < panel chat / AVA `--z-side-panel` 1050 < menu header `--z-header-pop` 9600 ≈ menu / combobox / lịch < tooltip < toast. Test: mở drawer (+ panel chat) rồi mở từng menu header, `document.elementFromPoint` ở giữa / các góc menu phải thuộc menu.

- Dùng component `DropdownMenu` của mds-ui. Item: `{ id, icon, label, danger?, checked?, disabled?, ai?, tag? }` hoặc `{ separator: true }`.
- Menu chuột phải: không tự dựng popup riêng, dùng `DropdownMenu` mở tại con trỏ.
  ```vue
  <div @contextmenu.prevent="menu.openAt($event)">
  ```
  Menu tự lật vào trong màn hình khi sát mép.
- Menu tự dựng trong app → dùng các token trên; không gõ tay `box-shadow`, `padding`.

#### B8.2 Sub Menu — menu dọc bên phải Sidebar chính (Figma node `8266:95709`)

Bắt buộc cho **mọi** menu dọc nằm cạnh phải Sidebar chính: mục lục màn chi tiết, menu cài đặt, menu danh mục, menu nhóm báo cáo. Dạng **1 cột, ẩn Title**.

```vue
<aside class="card sub-menu">
  <AppSearchbox v-model="q" placeholder="Tìm kiếm" />   <!-- tuỳ chọn -->
  <nav class="menu-list">
    <button v-for="s in items" :key="s.id" class="menu-list__item"
      :class="{ 'menu-list__item--active': s.id === activeId }"
      v-tip="s.title.length > 28 ? s.title : ''" @click="go(s.id)">
      <TIcon v-if="s.icon" :name="s.icon" />
      <span class="menu-list__label">{{ s.title }}</span>
    </button>
  </nav>
</aside>
```

| Phần | Giá trị |
|---|---|
| Khung | `.card` (trắng, bo 8px, shadow card, đệm 16px); ô tìm → danh sách cách 8px |
| Item | cao **36px cố định**, đệm ngang 12px, bo 8px, icon trái 16px cách chữ 8px |
| Giữa các item | **4px** |
| Hover / Nhấn | nền `--bg-neutral-light` / `--bg-neutral-pressed`, chữ giữ màu thường |
| Đang chọn | nền `--bg-brand-light` + chữ `--text-brand` **Bold 700**, icon brand |
| Chữ dài | 1 dòng + "…", tooltip hiện đủ tên. Không để xuống dòng làm vỡ chiều cao 36px |

#### B8.3 Menu con trên Sidebar chính (AppSidebar `item.children`)
**Menu con trên Sidebar chính (`item.children`)** — phân hệ có nhiều nghiệp vụ con (VD “Đề xuất” → Tiếp nhận chính thức, Ký mới hợp đồng…):
```js
{ id: 'de-xuat', label: 'Đề xuất', icon: 'bulb', children: [
  { id: 'de-xuat-tiep-nhan', label: 'Tiếp nhận chính thức' },
  { separator: true },
  { id: 'de-xuat-ky-moi-hd', label: 'Ký mới hợp đồng' }, …
] }
```
- Rê chuột vào mục → menu con xổ sang **phải, sát mép sidebar (0px)**, item đầu thẳng hàng mục sidebar (sát đáy màn hình thì tự đẩy lên); rời mục / menu → đóng sau 150ms. Bấm mục cũng mở (cảm ứng / bàn phím), Esc đóng. Chọn mục con → `@nav(child.id)`.
- Menu con theo **đúng chuẩn menu xổ ra** (`.dropdown-menu.sidebar-flyout`: bo Radius/Default, `--shadow-popover`, đệm 8px, item 32px xếp sát nhau, nhóm ngăn bằng Divider; rộng tối thiểu 240px); mục có menu con có mũi tên › cuối mục, không tooltip; sidebar thu gọn giữ mở rộng trong lúc menu con đang mở; mục cha sáng khi đang ở 1 mục con.
- Danh sách phân hệ sidebar khai báo **1 nơi** trong app (VD `src/data/sidebar.js`) — mọi màn import chung, không chép lại.

### B9. Avatar — Figma "_Avatar Type Item" (node `6019:6149`)

Dùng component `AppAvatar`; trong bảng dùng cột avatar của `DataTable`.

```vue
<AppAvatar :name="name" :src="url" :size="40" interactive />
```

| Loại | Khi nào | Viền | Nội dung |
|---|---|---|---|
| Image | có ảnh | 1px `--stroke-neutral` | ảnh phủ kín; ảnh lỗi → Initials |
| Initials | không ảnh, có tên | 1px trắng | chữ cái đầu (tối đa 2), `--text-primary` Medium, nền theo tên (8 tone) |
| Empty | không ảnh, không tên | 1px trắng | hình người xám |

- **Chỉ 9 cỡ:** 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 80. Không tự chọn 28, 36, 64.
- Cỡ chữ Initials theo cỡ avatar:

  | Cỡ avatar | Cỡ chữ |
  |---|---|
  | 12, 16 | 8px |
  | 20, 24 | 10px |
  | 32, 40 | 12px |
  | 48 | 16px |
  | 56 | 20px Semibold |
  | 80 | 40px |

- Hover / đang chọn (avatar bấm được): viền 2px xanh nhạt theo màu thương hiệu.
- ⛔ Không tự dựng `<span class="xxx-avatar">` với viền / shadow riêng.

### B10. Bảng (DataTable)

- **Dòng có 2 dòng chữ LUÔN cao 56px** (`--dt-row-height-2`): cột tên + dòng phụ (`subtext`), avatar + dòng phụ (`avatar-subtext`), logo sản phẩm (`product-logo`), hoặc ô tự render 2 dòng chữ.
  - Hai dòng chữ cách nhau 2px và cách đều mép trên / dưới.
  - ⛔ Không để 2 dòng chữ chen trong dòng 32–36px (chữ dính nhau, dính viền).
  - ⛔ Không truyền `:line-count="1"` hay CSS ép `height` dòng "cho gọn" khi bảng có cột 2 dòng.
- Bảng hoặc danh sách tự dựng có 2 dòng chữ: `min-height: 56px` + `padding` dọc, không đặt `height` cố định.
- Dòng 1 dòng chữ: `--dt-row-height` (theo mật độ).
- Tiêu đề cột không được bị cắt "…" ở bề rộng mặc định — nới `width` cột cho đủ chữ.
- Cột tính từ cột khác phải đặt **sau** các cột nguồn.
- Menu tiêu đề cột theo chuẩn menu xổ ra (B8.1), chia nhóm hợp lý: Sắp xếp / Vị trí / Thêm–ẩn cột / Hiển thị dòng.
- **Paging & dòng Tổng (Figma Data Table 6435:22421):**
  - **Column Footer (Figma 6624:102337):** ô cao `--dt-footer-h` (36 · Nhỏ 32 · Rộng 40, viền dưới 1px `--stroke-neutral` nằm TRONG ô), đệm ngang 4px, nền `--dt-footer-bg`; nội dung cao `--input-height`, đệm ngang 12px, gap 8px; chữ 13/20 **Semi Bold** (cả nhãn "Tổng" lẫn số — ⛔ không Bold) `--text-primary`, cột số căn phải; **không** vạch ngăn giữa các ô footer. Có sẵn trong `.dt-row--footer .dt-cell--footer`.
  - Paging (`TablePaging`, cao `--paging-h` 48 · Nhỏ 40 · Rộng 56, đệm ngang `--paging-px` 16 · Nhỏ 12 · Rộng 16, gap 8px) **KHÔNG có viền trên** — dòng dữ liệu cuối / dòng Tổng đã có viền dưới. "Tổng số: 10" có khoảng cách 4px giữa nhãn và số.
  - **Số dòng/trang nhớ theo người dùng**: chọn 1 lần → mọi danh sách mở sau dùng lại giá trị đó (có sẵn trong TablePaging / AppPagination; app provide `pageSizeStore` để lưu theo tài khoản) — ⛔ không tự lưu riêng từng trang.
  - Dòng Tổng **ít dòng** → bám ngay sau dòng dữ liệu cuối (khoảng trắng nằm giữa dòng Tổng và Paging).
  - Dòng Tổng **nhiều dòng, phải cuộn dọc** → ghim đáy vùng cuộn, **sát ngay trên Paging** — cuộn vẫn luôn thấy tổng + phân trang.
  - Điều kiện: chỉ bảng tự cuộn (`.table-scroll` / `.datatable { overflow:auto }`), `TablePaging` đặt ngay sau khung cuộn. ⛔ Không để cả trang cuộn còn bảng thì không.
  - Khung `.table-panel` có chiều cao cố định: mds-ui đã cho `.table-panel` xếp dọc (flex) + `.table-panel > .table-scroll { flex: 1 1 auto; min-height: 0 }` → bảng cuộn trong khung. ⛔ Đừng ghi đè mất 2 dòng này — thiếu là dòng dưới bị cắt, không cuộn được.
  - Vạch trên dòng Tổng vẽ bằng `box-shadow` (không chiếm chỗ) → bám sau dòng cuối không thành vạch đôi 2px. ⛔ Không thêm `border-top` cho dòng Tổng / Paging.

### B11. Màn chi tiết (xem hồ sơ / bản ghi)

- Trường: dùng `DetailField`.
  - Nhãn rộng 200px, hoặc tự co theo nhãn dài nhất cả màn (120–200px, directive `v-auto-label-width`).
  - Giá trị có gạch chân mảnh để phân biệt với nhãn.
- Rê chuột lên giá trị: gạch chân đổi màu brand + **bút chì** cuối ô.
- Bấm vào giá trị: sửa nhanh tại chỗ, có nút ✓ lưu / ✕ hủy (Button Icon Small, cách nhau 8px).
- Nhóm trường: `.detail-groups > .detail-group > .detail-group__title + .detail-grid` (nhóm cách 32px).
- Màn chi tiết có 2–3 tab: được đặt tab ngay trên page header, cạnh tiêu đề.
- Mục lục bên trái: Sub Menu (B8.2).

### B12. AI

- Chữ gắn với AI (tên trợ lý, "AI gợi ý", "Hỏi AVA", tiêu đề khối AI): class `.text-ai-primary` (chữ gradient `#1482ff → #cf11ff`). Icon AI: `.ti--ai`. Nút AI: `.btn--ai` / `.btn--ai-outline`.
- Khối nội dung AI: nền `--bg-ai-gradient-light`, đệm 16px đều.
- Đoạn văn AI tạo ra (nhận định, tóm tắt, đề xuất): **in đậm** các cụm cần nhấn (số, mốc thời gian, tên đơn vị / chức danh, kết luận, rủi ro, hành động), 1–2 cụm mỗi câu.
  - Dữ liệu viết `**cụm**`, khi render tách thành `<strong>`.
  - ⛔ Không dùng `v-html`.

### B13. Định dạng số (Thông tư 200/2014/TT-BTC)

- Dấu **chấm** tách hàng nghìn, dấu **phẩy** tách thập phân: `1.234.567,89`, `91,5%`.
- Luôn dùng `fmtNum` / `fmtPct` của mds-ui (`@mds/utils/number.js`). ⛔ Không dùng `toFixed()`, `String(n)`, `toLocaleString()` không truyền locale để hiển thị.
- Không định dạng mã, năm, số điện thoại, số tài khoản.

### B14. Chống tràn và nhảy bố cục

- Lưới luôn `repeat(n, minmax(0, 1fr))`. Flex child chứa chữ / control: `min-width: 0`; chữ dài dùng `text-overflow: ellipsis`.
- Hàng có nội dung thay đổi theo dữ liệu (tab, số đếm 99+, link điều kiện): chia hàng bằng markup cố định, không dựa vào `flex-wrap` tự xuống dòng. Hàng chứa phần tử điều kiện đặt `min-height` bằng chiều cao phần tử đó.
- Đổi tab / bộ lọc / chọn dòng → thanh tab, toolbar, tiêu đề phải **đứng yên**.

### B15. Tiêu đề tab trình duyệt

`Tên màn | Phân hệ cha (nếu có) | Tên ứng dụng`. Màn chi tiết: `Tên bản ghi | Phân hệ | Tên ứng dụng`. Màn thêm: `Thêm … | … | Tên ứng dụng`. Dùng `setAppTitle` / `useDocTitle` của `@mds/utils/docTitle.js`.

---

## Phần C — Toàn bộ token (Figma Variables → CSS)

Nguồn: Figma **MDS Web Components v2.0** (`1DP5RJM3MsZJ8SnUWgTavS`) › Variables, Effect Styles, Text Styles — đọc trực tiếp bằng Plugin API ngày 2026-10-29.
Thư viện `mds-ui/src/style.css` đã đồng bộ phần màu, shadow, bo góc, cỡ chữ theo bảng dưới.

**Cách dùng:** trong code CHỈ dùng token ngữ nghĩa (`--text-*`, `--icon-*`, `--bg-*`, `--stroke-*`, `--shadow-card`, `--shadow-popover`, `--radius-*`, `--gap-control`…). Thang màu gốc (`--brand-600`, `--neutral-400`, `--info-700`…) chỉ để tham chiếu / định nghĩa token, không dùng trực tiếp trong component trừ khi không có token ngữ nghĩa phù hợp.

Bộ biến Figma:

| Bộ | Số biến | Mode |
|---|---|---|
| 🖌️ Base Colors | 118 | 1 |
| 🎨 Themes | 136 | Blue (mặc định) · Green · Blue gray · Teal · Cyan · Indigo · Purple · Pink · Red · Orange |
| 📏 Space | 319 | Standard (= Trung bình) · Nhỏ · Comfortable (= Rộng) · Mobile Responsive |
| 🔢 Font Size | 21 | Small (= web mặc định) · Medium · Large · Mobile Responsive |
| 🅰️ Font Family | 8 | Inter |
| #️⃣ Number | 90 | thang số 0–320 (spacing, width-height, icon size, border width) |
| 🌈 Chart Colors | 70 | Palette · Single Hue · Divergent |

---

### C1. Toàn bộ token CSS (`mds-ui/src/style.css`)

```css
:root {
  /* ════════════════════════════════════════════════════════════════════════
     MÀU — đồng bộ 100% Figma MDS Web Components v2.0 › Variables
     (🖌️ Base Colors + 🎨 Themes). Thang --brand-* đổi theo theme (xem Theme Overrides);
     token ngữ nghĩa (--text-*, --icon-*, --stroke-*, --bg-*) tham chiếu thang → tự đổi theo theme.
     ⛔ Không gõ mã màu tay trong component — chỉ dùng token ngữ nghĩa.
  ════════════════════════════════════════════════════════════════════════ */

  /* ── Base Colors ── */
  --brand-50:  #f0f6fe; --brand-100: #ddeafc; --brand-200: #c2dbfb; --brand-300: #99c5f7; --brand-400: #68a6f2;
  --brand-500: #4584ec; --brand-600: #245fdf; --brand-700: #2753ce; --brand-800: #2644a7; --brand-900: #243d84;

  --neutral-50:  #fbfbfc; --neutral-100: #f4f4f6; --neutral-150: #f2f2f4; --neutral-200: #ecedef; --neutral-250: #e6e7ea;
  --neutral-300: #e5e6e9; --neutral-350: #d7dade; --neutral-400: #ced1d6; --neutral-450: #b6bac1; --neutral-500: #9da2ac;
  --neutral-600: #8f949d; --neutral-700: #6b707a; --neutral-800: #484e59; --neutral-900: #303642; --neutral-950: #10141b;

  --info-50: #f5faff; --info-100: #eff8ff; --info-200: #d1e9ff; --info-300: #b2ddff; --info-400: #84caff; --info-500: #53b1fd;
  --info-600: #2e90fa; --info-700: #1570ef; --info-800: #175cd3; --info-900: #1849a9; --info-950: #194185;
  --warning-50: #fffcf5; --warning-100: #fffaeb; --warning-200: #fef0c7; --warning-300: #fedf89; --warning-400: #fec84b; --warning-500: #fdb022;
  --warning-600: #f79009; --warning-700: #dc6803; --warning-800: #b54708; --warning-900: #93370d; --warning-950: #7a2e0e;
  --danger-50: #fffbfa; --danger-100: #fef3f2; --danger-200: #fee4e2; --danger-300: #fecdca; --danger-400: #fda29b; --danger-500: #f97066;
  --danger-600: #f04438; --danger-700: #d92d20; --danger-800: #b42318; --danger-900: #912018; --danger-950: #7a271a;
  --success-50: #f6fef9; --success-100: #ecfdf3; --success-200: #d1fadf; --success-300: #a6f4c5; --success-400: #6ce9a6; --success-500: #32d583;
  --success-600: #12b76a; --success-700: #039855; --success-800: #027a48; --success-900: #05603a; --success-950: #054f31;
  --accent-50: #fcfaff; --accent-100: #f9f5ff; --accent-200: #f4ebff; --accent-300: #e9d7fe; --accent-400: #d6bbfb; --accent-500: #b692f6;
  --accent-600: #9e77ed; --accent-700: #7f56d9; --accent-800: #6941c6; --accent-900: #53389e; --accent-950: #42307d;
  --ai-begin-50: #edf9ff; --ai-begin-100: #d7efff; --ai-begin-200: #b9e5ff; --ai-begin-300: #88d6ff; --ai-begin-400: #50beff; --ai-begin-500: #289eff;
  --ai-begin-600: #1482ff; --ai-begin-700: #0a68eb; --ai-begin-800: #0f53be; --ai-begin-900: #134995; --ai-begin-950: #112d5a;
  --ai-end-50: #fef2ff; --ai-end-100: #fae3ff; --ai-end-200: #f6c6ff; --ai-end-300: #f499ff; --ai-end-400: #ee5dff; --ai-end-500: #e021ff;
  --ai-end-600: #cf11ff; --ai-end-700: #aa00cf; --ai-end-800: #8c00a9; --ai-end-900: #760689; --ai-end-950: #4f005e;

  --alpha-white-0: #ffffff00; --alpha-white-50: #ffffff0d; --alpha-white-100: #ffffff1a; --alpha-white-200: #ffffff33; --alpha-white-300: #ffffff4d;
  --alpha-white-400: #ffffff66; --alpha-white-500: #ffffff80; --alpha-white-600: #ffffff99; --alpha-white-700: #ffffffb2; --alpha-white-800: #ffffffcc;
  --alpha-white-900: #ffffffe5; --alpha-white-950: #fffffff2;
  --alpha-black-0: #00000000; --alpha-black-50: #0000000d; --alpha-black-100: #0000001a; --alpha-black-200: #00000033; --alpha-black-300: #0000004d;
  --alpha-black-400: #00000066; --alpha-black-500: #00000080; --alpha-black-600: #00000099; --alpha-black-700: #000000b2; --alpha-black-800: #000000cc;
  --alpha-black-900: #000000e5; --alpha-black-950: #000000f2;
  --black: #000000; --white: #ffffff;

  /* ── TEXT — chữ trung tính CHỈ 3 loại: primary (nội dung, tiêu đề, nhãn) · secondary (mô tả phụ, ngày, caption) · hint (placeholder)
     ⛔ Không dùng token brand/accent cho chữ trung tính · không hardcode hex từ ảnh/Figma ── */
  --text-primary:          var(--neutral-950);
  --text-secondary:        var(--neutral-700);
  --text-hint:             var(--neutral-500);
  --text-disabled:         var(--neutral-500);
  --text-brand:            var(--brand-600);
  --text-brand-disabled:   var(--brand-400);
  --text-link:             var(--brand-600);   /* link mang màu thương hiệu (theme Green: brand-700) */
  --text-link-default:     var(--info-700);    /* link xanh mặc định, không theo theme */
  --text-link-disabled:    var(--brand-400);
  --text-link-hover:       var(--brand-800);   /* Text/Link Action Hover */
  --text-link-default-hover: var(--info-800);  /* Text/Link Action Blue Hover */
  --text-white:            var(--white);
  --text-white-disabled:   var(--alpha-white-700);
  --text-info:             var(--info-700);     --text-info-disabled:    var(--info-400);
  --text-warning:          var(--warning-700);  --text-warning-disabled: var(--warning-400);
  --text-danger:           var(--danger-600);   --text-danger-disabled:  var(--danger-400);
  --text-success:          var(--success-700);  --text-success-disabled: var(--success-400);
  --text-accent:           var(--accent-600);   --text-accent-disabled:  var(--accent-400);

  /* ── AI ── */
  --text-ai:              var(--ai-begin-600);
  --stroke-ai:            var(--ai-begin-600);
  --bg-ai-light:          rgba(20, 130, 255, 0.06);
  --bg-ai-gradient:       linear-gradient(110deg, var(--ai-begin-600) 9%, var(--ai-end-600) 100%);    /* chữ / chấm / thanh chỉ báo AI */
  --bg-ai-gradient-light: linear-gradient(111deg, var(--ai-begin-50) 8.87%, #fee2ff 100%);            /* nền khối nội dung AI (khung phân tích AVA…) — cùng hover của btn--ai-outline */

  /* ── ICON ── */
  --icon-neutral:          var(--neutral-700);
  --icon-neutral-hover:    var(--brand-600);
  --icon-neutral-disabled: var(--neutral-400);
  --icon-brand:            var(--brand-600);  --icon-brand-hover:   var(--brand-500);   --icon-brand-disabled:   var(--brand-400);
  --icon-link:             var(--brand-700);  --icon-link-default:  var(--info-700);    --icon-link-disabled:    var(--brand-400);
  --icon-white:            var(--white);      --icon-white-hover:   var(--alpha-white-500); --icon-white-disabled: var(--alpha-white-700);
  --icon-info:             var(--info-700);     --icon-info-hover:    var(--info-500);    --icon-info-disabled:    var(--info-400);
  --icon-warning:          var(--warning-700);  --icon-warning-hover: var(--warning-500); --icon-warning-disabled: var(--warning-400);
  --icon-danger:           var(--danger-600);   --icon-danger-hover:  var(--danger-500);  --icon-danger-disabled:  var(--danger-400);
  --icon-success:          var(--success-700);  --icon-success-hover: var(--success-500); --icon-success-disabled: var(--success-400);
  --icon-accent:           var(--accent-600);   --icon-accent-hover:  var(--accent-500);  --icon-accent-disabled:  var(--accent-400);

  /* ── BACKGROUND ── */
  --bg-page:              var(--neutral-150);   /* BG/Page */
  --bg-white:             var(--white);
  --bg-black:             var(--black);
  --dt-header-bg:         var(--neutral-150);   /* BG/Table Header (theme khác Blue: neutral-200) */
  --dt-footer-bg:         var(--neutral-150);   /* BG/Table Footer */
  --bg-brand:             var(--brand-600);
  --bg-brand-hover:       var(--brand-700);     /* nút chính khi hover */
  --bg-brand-pressed:     var(--brand-800);     /* nút chính khi nhấn */
  --bg-brand-light:       var(--brand-50);      /* mục đang chọn, hover menu xổ ra */
  --bg-brand-light-hover: var(--brand-100);
  --bg-brand-light-pressed: var(--brand-200);
  --bg-brand-disable:     var(--brand-400);
  --bg-neutral:           var(--neutral-600);
  --bg-neutral-light:     var(--neutral-150);   /* hover nút icon / nút trung tính, mục Sub Menu */
  --bg-neutral-hover:     var(--neutral-200);   /* BG/Neutral/Neutral Light Hover */
  --bg-neutral-pressed:   var(--neutral-250);   /* BG/Neutral/Neutral Light Pressed */
  --bg-neutral-disable:   var(--neutral-400);
  --bg-info:    var(--info-700);    --bg-info-hover:    var(--info-800);    --bg-info-pressed:    var(--info-900);
  --bg-info-light:    var(--info-100);    --bg-info-light-hover:    var(--info-200);    --bg-info-light-pressed:    var(--info-300);    --bg-info-disable:    var(--info-400);
  --bg-warning: var(--warning-600); --bg-warning-hover: var(--warning-700); --bg-warning-pressed: var(--warning-800);
  --bg-warning-light: var(--warning-100); --bg-warning-light-hover: var(--warning-200); --bg-warning-light-pressed: var(--warning-300); --bg-warning-disable: var(--warning-400);
  --bg-danger:  var(--danger-600);  --bg-danger-hover:  var(--danger-700);  --bg-danger-pressed:  var(--danger-800);
  --bg-danger-light:  var(--danger-100);  --bg-danger-light-hover:  var(--danger-200);  --bg-danger-light-pressed:  var(--danger-300);  --bg-danger-disable:  var(--danger-400);
  --bg-success: var(--success-600); --bg-success-hover: var(--success-700); --bg-success-pressed: var(--success-800);
  --bg-success-light: var(--success-100); --bg-success-light-hover: var(--success-200); --bg-success-light-pressed: var(--success-300); --bg-success-disable: var(--success-400);
  --bg-accent:  var(--accent-600);  --bg-accent-hover:  var(--accent-600);  --bg-accent-pressed:  var(--accent-700);
  --bg-accent-light:  var(--accent-100);  --bg-accent-light-hover:  var(--accent-200);  --bg-accent-light-pressed:  var(--accent-300);  --bg-accent-disable:  var(--accent-400);

  /* ── STROKE ── */
  --stroke-neutral:         var(--neutral-400);   /* viền ô nhập, nút outline, avatar có ảnh */
  --stroke-neutral-light:   var(--neutral-300);
  --stroke-neutral-disable: var(--neutral-200);
  --stroke-divider:         var(--neutral-300);   /* Divider */
  --stroke-brand:           var(--brand-600);     /* viền focus, đang chọn */
  --stroke-brand-light:     var(--brand-300);
  --stroke-brand-disabled:  var(--brand-400);
  --stroke-white:           var(--white);
  --stroke-white-disabled:  var(--alpha-white-700);
  --stroke-info:    var(--info-700);    --stroke-info-light:    var(--info-300);    --stroke-info-disabled:    var(--info-400);
  --stroke-warning: var(--warning-700); --stroke-warning-light: var(--warning-300); --stroke-warning-disabled: var(--warning-400);
  --stroke-danger:  var(--danger-600);  --stroke-danger-light:  var(--danger-300);  --stroke-danger-disabled:  var(--danger-400);
  --stroke-success: var(--success-700); --stroke-success-light: var(--success-300); --stroke-success-disabled: var(--success-400);
  --stroke-accent:  var(--accent-600);  --stroke-accent-light:  var(--accent-300);  --stroke-accent-disabled:  var(--accent-400);

  /* Bo góc — Figma Space › Radius (Nhỏ: default 6 · inner 4 · focus 8) */
  --radius-sm:      4px;     /* Radius/Small */
  --radius-inner:   6px;     /* Radius/Inner */
  --radius-default: 8px;     /* Radius/Defaullt — control */
  --radius-focus:   12px;    /* Radius/Focus — vòng focus quanh control */
  --radius-dialog:  12px;    /* Radius/Dialog — popup / dialog / popover nổi: 12 mọi mật độ (chỉ popup, dialog mới bo 12) */
  --radius-pill:    9999px;  /* Radius/Pill */

  --btn-height:     32px;
  --btn-min-width:  80px;
  --btn-px:         12px;
  --btn-gap:        8px;

  --input-height:   32px;
  --input-px:       12px;
  --tab-px:         12px;   /* Components/Tabs/Medium/Padding-Horizontal: 12 · Nhỏ 12 · Rộng 20 */
  --tab-h:          36px;   /* Components/Tabs/Medium/Fix-Height: 36 · Nhỏ 36 · Rộng 40 */
  /* DataTable row heights — chỉ --dt-row-height bị ảnh hưởng bởi density setting */
  --dt-row-height:  32px;   /* 1-line: thay đổi theo compact/comfortable */
  --dt-row-height-2: 56px;  /* 2-line (subtext, avatar+subtext): CỐ ĐỊNH, không đổi theo density */
  --dt-row-height-3: 72px;  /* 3-line: CỐ ĐỊNH */
  --dt-footer-h:    36px;   /* Patterns/DataTable/Fix-Height-Footer: 36 · Nhỏ 32 · Rộng 40 */
  --paging-px:      16px;   /* Patterns/DataTable/Padding-Paging-Horizontal: 16 · Nhỏ 12 · Rộng 16 */
  --paging-h:       48px;   /* Components/Pagination/Overflow/Fix-Height: 48 · Nhỏ 40 · Rộng 56 */
  --input-py:       8px;
  --input-label-gap:4px;   /* label → control */

  --card-px:        16px;
  --card-py:        16px;
  --card-gap:       12px;
  --card-col-gap:   16px;   /* card ↔ card: LUÔN 16px */

  /* ── Quy chuẩn khoảng cách chung (KHÔNG đổi theo density) ── */
  --radius-card:    8px;     /* card / khối trắng trên BG Page + bo góc thường: Radius/Default 8 — cố định mọi mật độ (Nhỏ không về 6) */
  --gap-control:    8px;     /* control ↔ control đặt cạnh nhau: Button–Button, Button–Textbox, Searchbox–Combobox… */
  --page-gutter:    16px;    /* vùng nội dung ↔ sidebar / lề phải / lề dưới trình duyệt */
  --box-padding:    16px;    /* đệm TRONG mọi card / khối nền (card, khối AI, ô hồ sơ, mục lục…): ĐỀU 4 phía, không trên-dưới 1 số trái-phải 1 số — MỌI card có padding xung quanh (kể cả màn Tổng quan) */
  /* Form (Figma MDS Input Group) */
  --form-label-w:      200px; /* form ngang: nhãn trái rộng 200px */
  --form-label-gap-h:  8px;   /* form ngang: nhãn → ô nhập */
  --form-row-gap-h:    12px;  /* form ngang: giữa các hàng */
  --form-row-gap-v:    16px;  /* form dọc: giữa các trường (nhãn trên → ô dưới cách 4px = --input-label-gap) */
  --form-group-gap:    32px;  /* giữa 2 NHÓM trường trong cùng 1 card — xa hơn hẳn khoảng cách hàng để thấy rõ phân cấp */
  --form-group-title-gap: 12px; /* tiêu đề nhóm → lưới trường */
  /* Menu xổ ra (Figma MDS Dropdown Menu 6019:42469, cập nhật 2026-10-30) — menu 3 chấm, chuột phải, danh sách combobox, menu cột bảng…
     Biến Figma: Components/Menu List/* · Comfortable đổi ở khối [data-density="comfortable"] */
  --menu-pad:          8px;   /* đệm khung danh sách (Spacing-Padding/8px) */
  --menu-gap:          0px;   /* giữa các item — Figma xếp sát nhau (7 item × 32 = 224) */
  --menu-item-h:       32px;  /* Fix-Height-1-Line: 32 (Nhỏ cũng 32) · Rộng 36 — KHÔNG theo --btn-height */
  --menu-item-h-2:     48px;  /* Fix-Height-2-Line (item có dòng phụ) · Rộng 52 */
  --menu-item-px:      12px;  /* Padding-Text-Horizontal · Rộng 16 */
  --menu-item-gap:     8px;   /* Gap-Content: icon ↔ chữ */
  --menu-icon:         20px;  /* icon trái item */
  --menu-sep-my:       4px;   /* Padding-Vertical-Small: divider ngang cách item trên / dưới · Rộng 8 */
  --menu-radius:       var(--radius-default);   /* khung + item: Radius/Defaullt (8 · Nhỏ 6) */
  --menu-min-w:        80px;  /* Min-Width · Rộng 96 */

  --dialog-px:      24px;
  --dialog-py:      16px;

  --layout-header-h:      48px;
  --layout-sidebar-w:     200px;
  --layout-sidebar-sm-w:  64px;
  --layout-page-header-h: 56px;

  /* Inter Variable v4+: tên chính = InterVariable; 'Inter var' = alias cũ */
  --font-family: InterVariable, 'Inter var', sans-serif;
  --text-h1: 24px; --text-h1-lh: 36px;
  --text-h2: 20px; --text-h2-lh: 28px;
  --text-h3: 16px; --text-h3-lh: 22px;
  --text-body: 13px; --text-body-lh: 20px;
  --text-body-md: 14px; --text-body-md-lh: 20px;
  --text-sm: 12px; --text-sm-lh: 16px;
  /* Text styles Figma (Font Size mode Small = mặc định web): H1 24/32 · H2 20/28 · H3 16/22 (Semi Bold) ·
     Body Regular 13/20 · Body Small 12/18 · Body Medium 14/20 · Body Large 16/24 · Caption 10/15 · Overline 11/16 */
  --text-body-lg: 16px; --text-body-lg-lh: 24px;
  --text-body-sm-lh: 18px;
  --text-caption: 10px; --text-caption-lh: 15px;

  --fw-regular:  400;
  --fw-medium:   500;
  --fw-semibold: 600;
  --fw-bold:     700;

  /* ── Chart color palette ── */
  --chart-c1: #245fdf;  /* brand blue   */
  --chart-c2: #12b76a;  /* success green */
  --chart-c3: #f79009;  /* warning orange */
  --chart-c4: #f04438;  /* danger red    */
  --chart-c5: #0ba5ec;  /* info cyan     */
  --chart-c6: #7a5af8;  /* accent purple */
  /* Màu chính của biểu đồ theo theme (thước đo chính: cột / đường điểm…) — các màu trạng thái c2–c4 giữ cố định.
     --chart-target: đường mục tiêu / kỳ vọng nét đứt đi kèm; theme Cam đổi sang tím để không trùng màu chính (đã kiểm tra bằng validator ΔE). */
  --chart-primary: var(--bg-brand);
  --chart-target:  var(--chart-c3);

  /* ── Shadow — Figma Effect Styles "Drop Shadow / Neutral / …" (màu Alpha Black/100) ── */
  --shadow-all-2:     0 0 2px 0 var(--alpha-black-100);
  --shadow-all-4:     0 0 4px 0 var(--alpha-black-100);
  --shadow-all-8:     0 0 8px 0 var(--alpha-black-100);
  --shadow-all-12:    0 0 12px 0 var(--alpha-black-100);
  --shadow-bottom-2:  0 1px 2px 0 var(--alpha-black-100);
  --shadow-bottom-4:  0 1px 4px 0 var(--alpha-black-100);
  --shadow-bottom-8:  0 2px 8px 0 var(--alpha-black-100);
  --shadow-bottom-12: 0 4px 12px 0 var(--alpha-black-100);
  --shadow-bottom-16: 0 4px 16px 0 var(--alpha-black-100);
  --shadow-bottom-20: 0 6px 20px 0 var(--alpha-black-100);
  --shadow-top-4:     0 -1px 4px 0 var(--alpha-black-100);
  --shadow-top-8:     0 -2px 8px 0 var(--alpha-black-100);
  --shadow-top-12:    0 -4px 12px 0 var(--alpha-black-100);
  --shadow-right-4:   1px 0 4px 0 var(--alpha-black-100);
  --shadow-right-8:   2px 0 8px 0 var(--alpha-black-100);
  --shadow-right-12:  4px 0 12px 0 var(--alpha-black-100);
  --shadow-left-4:    -1px 0 4px 0 var(--alpha-black-100);
  --shadow-left-8:    -2px 0 8px 0 var(--alpha-black-100);
  --shadow-left-12:   -4px 0 12px 0 var(--alpha-black-100);
  /* Tên theo vai trò — DÙNG CÁC TOKEN NÀY trong component */
  --shadow-card:    var(--shadow-all-2);       /* khối trắng trên nền --bg-page */
  --shadow-popover: var(--shadow-bottom-12);   /* menu xổ ra, popover nổi */
  /* Token cũ (giữ để không vỡ code cũ — code mới dùng tên theo vai trò ở trên) */
  --shadow-sm:     var(--shadow-bottom-2);    /* tương thích code cũ → token Figma Bottom 2 */
  --shadow-md:     var(--shadow-bottom-8);    /* tương thích code cũ → Bottom 8 (nổi khi rê chuột) */
  --shadow-lg:     var(--shadow-bottom-12);   /* tương thích code cũ → Bottom 12 (lớp nổi) */
  --shadow-dialog: var(--shadow-bottom-12);   /* Popup / Dialog = Figma Drop Shadow/Neutral/Bottom 12: 0 4px 12px 0 Alpha Black 100 (rgba 0,0,0,.10) */
}

/* ── Theme Overrides — Figma 🎨 Themes (10 mode: Blue mặc định · Green · Blue gray · Teal · Cyan · Indigo · Purple · Pink · Red · Orange).
   Chỉ đổi thang --brand-* (+ vài ánh xạ khác Blue theo Figma); mọi token ngữ nghĩa brand tự đổi theo. ── */
:root[data-theme="green"] {
  --brand-50: #e6f5ef; --brand-100: #cdeadf; --brand-200: #a8d9c8; --brand-300: #7cc7ae; --brand-400: #59b89a;
  --brand-500: #2fa77a; --brand-600: #0e9a62; --brand-700: #0b7d52; --brand-800: #0b5a3d; --brand-900: #0a4a33;
  --text-link: var(--brand-700); --dt-header-bg: var(--neutral-200);
}
:root[data-theme="blue-gray"] {
  --brand-50: #f5f5fa; --brand-100: #eeeff7; --brand-200: #d5d9eb; --brand-300: #babfde; --brand-400: #9aa2d0;
  --brand-500: #717bbc; --brand-600: #4e5ba6; --brand-700: #3e4784; --brand-800: #363f72; --brand-900: #293056;
  --bg-brand-hover: var(--brand-800); --bg-brand-pressed: var(--brand-900); --dt-header-bg: var(--neutral-200);
}
:root[data-theme="teal"] {
  --brand-50: #f1fefc; --brand-100: #e8fdfa; --brand-200: #9af5e2; --brand-300: #5fe9d0; --brand-400: #2ed3ba;
  --brand-500: #15b7a1; --brand-600: #0e9384; --brand-700: #10756b; --brand-800: #125d57; --brand-900: #134e49;
  --bg-brand-hover: var(--brand-800); --bg-brand-pressed: var(--brand-900); --dt-header-bg: var(--neutral-200);
}
:root[data-theme="cyan"] {
  --brand-50: #f0fcff; --brand-100: #e5f9ff; --brand-200: #b9eefe; --brand-300: #7ce3fd; --brand-400: #36d6fa;
  --brand-500: #0cc1eb; --brand-600: #00a2cf; --brand-700: #017da3; --brand-800: #066986; --brand-900: #0b566f;
  --bg-brand-hover: var(--brand-800); --bg-brand-pressed: var(--brand-900); --dt-header-bg: var(--neutral-200);
}
:root[data-theme="indigo"] {
  --brand-50: #f0f2fe; --brand-100: #e7e9fe; --brand-200: #c2d9ff; --brand-300: #9dbeff; --brand-400: #759aff;
  --brand-500: #5576ff; --brand-600: #4155f5; --brand-700: #2a3ad8; --brand-800: #2534ae; --brand-900: #263389;
  --dt-header-bg: var(--neutral-200);
}
:root[data-theme="purple"] {
  --brand-50: #f6f3fb; --brand-100: #f0ecf9; --brand-200: #e1def6; --brand-300: #cac3ef; --brand-400: #ada0e5;
  --brand-500: #9179d9; --brand-600: #744ec7; --brand-700: #6e49b8; --brand-800: #5c3d9a; --brand-900: #4d347e;
  --bg-brand-hover: var(--brand-800); --bg-brand-pressed: var(--brand-900); --dt-header-bg: var(--neutral-200);
}
:root[data-theme="pink"] {
  --brand-50: #fbf3f8; --brand-100: #f9ecf3; --brand-200: #f5d5ec; --brand-300: #eeb3db; --brand-400: #e383c3;
  --brand-500: #d75daa; --brand-600: #c64691; --brand-700: #a82e72; --brand-800: #8c285e; --brand-900: #752651;
  --dt-header-bg: var(--neutral-200);
}
:root[data-theme="red"] {
  --brand-50: #fbf3f6; --brand-100: #f9ecef; --brand-200: #f5d5e2; --brand-300: #eeb3c9; --brand-400: #e284a5;
  --brand-500: #d55f85; --brand-600: #c34266; --brand-700: #a72f4d; --brand-800: #8b2941; --brand-900: #742739;
  --dt-header-bg: var(--neutral-200);
}
:root[data-theme="orange"] {
  --brand-50: #fef5f0; --brand-100: #feefe7; --brand-200: #fed7aa; --brand-300: #fdba74; --brand-400: #fb923c;
  --brand-500: #f97316; --brand-600: #ea580c; --brand-700: #c2410c; --brand-800: #9a3412; --brand-900: #7c2d12;
  --dt-header-bg: var(--neutral-200); --chart-target: var(--chart-c6);   /* cam chính trùng cam mục tiêu → mục tiêu dùng tím */
}

/* ── Density Overrides ── */
/* Background tint mode — dùng --bg-brand (màu chính, độ bão hòa nhất quán) ở tỷ lệ nhỏ
   Quy tắc: brand × 6% + base xám nhạt → tất cả theme cho độ sáng đồng đều, chỉ hue thay đổi */
:root[data-bg-tint="color"] {
  --bg-page:      color-mix(in srgb, var(--bg-brand) 3%, #F2F2F4);
  --dt-header-bg: color-mix(in srgb, var(--bg-brand) 4%, #E8EAEE);
  --dt-footer-bg: color-mix(in srgb, var(--bg-brand) 3%, #EBECF0);
}

/* Nhỏ: chiều cao control 28px */
:root[data-density="compact"] {
  --input-height:   28px;
  --btn-height:     28px;
  --dt-row-height:  32px;
  --dt-footer-h:    32px;
  --paging-px:      12px;
  --paging-h:       40px;
  --radius-default: 6px;
  --radius-inner:   4px;
  --radius-focus:   8px;
}
/* Comfortable: chiều cao control 36px */
:root[data-density="comfortable"] {
  --input-height:  36px;
  --btn-height:    36px;
  --btn-px:        14px;
  --dt-row-height: 36px;
  --dt-footer-h:   40px;
  --tab-px:        20px;
  --tab-h:         40px;
  --paging-h:      56px;
  --menu-item-h:   36px;   /* Menu List — Comfortable */
  --menu-item-h-2: 52px;
  --menu-item-px:  16px;
  --menu-sep-my:   8px;
  --menu-min-w:    96px;
}
```

---

### C2. Bảng ánh xạ Figma → CSS (màu)

| Figma | CSS | Blue (mặc định) |
|---|---|---|
| Text/Primary Neutral | `--text-primary` | Neutral/950 `#10141b` |
| Text/Secondary Neutral | `--text-secondary` | Neutral/700 `#6b707a` |
| Text/Hint Neutral, Disabled Neutral | `--text-hint`, `--text-disabled` | Neutral/500 `#9da2ac` |
| Text/Brand · Brand Disabled | `--text-brand` · `--text-brand-disabled` | Brand/600 · Brand/400 |
| Text/Link Brand | `--text-link` | Brand/600 (Green: Brand/700) |
| Text/Link Default | `--text-link-default` | Info/700 `#1570ef` |
| Text/Link Action Hover · Blue Hover | `--text-link-hover` · `--text-link-default-hover` | Brand/800 · Info/800 |
| Text/Info · Warning · Danger · Success · Accent | `--text-info` … `--text-accent` | Info/700 · Warning/700 · Danger/600 · Success/700 · Accent/600 |
| Text/… Disabled | `--text-*-disabled` | thang /400 |
| Icon/Neutral · Hover · Disabled | `--icon-neutral` · `--icon-neutral-hover` · `--icon-neutral-disabled` | Neutral/700 · Brand/600 · Neutral/400 |
| Icon/Brand · Hover · Disabled | `--icon-brand*` | Brand/600 · /500 · /400 |
| Icon/Info · Warning · Danger · Success · Accent (+ Hover /500, Disabled /400) | `--icon-*` | như Text |
| Stroke/Neutral · Neutral Light · Neutral Disable · Divider | `--stroke-neutral` · `--stroke-neutral-light` · `--stroke-neutral-disable` · `--stroke-divider` | Neutral/400 · /300 · /200 · /300 |
| Stroke/Brand · Brand Light · Brand Disabled | `--stroke-brand*` | Brand/600 · /300 · /400 |
| Stroke/Info · Warning · Danger · Success · Accent (+ Light /300, Disabled /400) | `--stroke-*` | như Text |
| BG/Brand/Brand · Hover · Pressed | `--bg-brand` · `--bg-brand-hover` · `--bg-brand-pressed` | Brand/600 · /700 · /800 (Blue gray, Teal, Cyan, Purple: /800 · /900) |
| BG/Brand/Brand Light · Light Hover · Light Pressed · Disable | `--bg-brand-light*` · `--bg-brand-disable` | Brand/50 · /100 · /200 · /400 |
| BG/Info · Warning · Danger · Success · Accent (Hover, Pressed, Light, Light Hover, Light Pressed, Disable) | `--bg-*` | xem khối CSS |
| BG/Neutral/Neutral · Light · Light Hover · Light Pressed · Disable | `--bg-neutral` · `--bg-neutral-light` · `--bg-neutral-hover` · `--bg-neutral-pressed` · `--bg-neutral-disable` | Neutral/600 · /150 · /200 · /250 · /400 |
| BG/Page · Table Header · Table Footer | `--bg-page` · `--dt-header-bg` · `--dt-footer-bg` | Neutral/150 (Table Header các theme khác Blue: Neutral/200) |
| BG/White · Black | `--bg-white` · `--bg-black` | |

#### C2.1 Thang Brand theo theme (Figma 🎨 Themes)

| Theme (`data-theme`) | 50 | 100 | 200 | 300 | 400 | 500 | **600 (chính)** | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|
| Blue (mặc định) | `#f0f6fe` | `#ddeafc` | `#c2dbfb` | `#99c5f7` | `#68a6f2` | `#4584ec` | `#245fdf` | `#2753ce` | `#2644a7` | `#243d84` |
| Green `green` | `#e6f5ef` | `#cdeadf` | `#a8d9c8` | `#7cc7ae` | `#59b89a` | `#2fa77a` | `#0e9a62` | `#0b7d52` | `#0b5a3d` | `#0a4a33` |
| Blue gray `blue-gray` | `#f5f5fa` | `#eeeff7` | `#d5d9eb` | `#babfde` | `#9aa2d0` | `#717bbc` | `#4e5ba6` | `#3e4784` | `#363f72` | `#293056` |
| Teal `teal` | `#f1fefc` | `#e8fdfa` | `#9af5e2` | `#5fe9d0` | `#2ed3ba` | `#15b7a1` | `#0e9384` | `#10756b` | `#125d57` | `#134e49` |
| Cyan `cyan` | `#f0fcff` | `#e5f9ff` | `#b9eefe` | `#7ce3fd` | `#36d6fa` | `#0cc1eb` | `#00a2cf` | `#017da3` | `#066986` | `#0b566f` |
| Indigo `indigo` | `#f0f2fe` | `#e7e9fe` | `#c2d9ff` | `#9dbeff` | `#759aff` | `#5576ff` | `#4155f5` | `#2a3ad8` | `#2534ae` | `#263389` |
| Purple `purple` | `#f6f3fb` | `#f0ecf9` | `#e1def6` | `#cac3ef` | `#ada0e5` | `#9179d9` | `#744ec7` | `#6e49b8` | `#5c3d9a` | `#4d347e` |
| Pink `pink` | `#fbf3f8` | `#f9ecf3` | `#f5d5ec` | `#eeb3db` | `#e383c3` | `#d75daa` | `#c64691` | `#a82e72` | `#8c285e` | `#752651` |
| Red `red` | `#fbf3f6` | `#f9ecef` | `#f5d5e2` | `#eeb3c9` | `#e284a5` | `#d55f85` | `#c34266` | `#a72f4d` | `#8b2941` | `#742739` |
| Orange `orange` | `#fef5f0` | `#feefe7` | `#fed7aa` | `#fdba74` | `#fb923c` | `#f97316` | `#ea580c` | `#c2410c` | `#9a3412` | `#7c2d12` |

---

### C3. Shadow — Figma Effect Styles (màu Alpha Black/100 = `#0000001a`)

| Style | CSS `box-shadow` | Token | Dùng cho |
|---|---|---|---|
| Neutral / All 2 | `0 0 2px 0` | `--shadow-all-2` = **`--shadow-card`** | MỌI khối trắng trên nền trang (card, panel bảng, KPI, mục lục) |
| Neutral / All 4 · 8 · 12 | `0 0 4px` · `0 0 8px` · `0 0 12px` | `--shadow-all-4/8/12` | |
| Neutral / Bottom 2 · 4 · 8 | `0 1px 2px` · `0 1px 4px` · `0 2px 8px` | `--shadow-bottom-2/4/8` | |
| Neutral / Bottom 12 | `0 4px 12px 0` | `--shadow-bottom-12` = **`--shadow-popover`** | MỌI menu xổ ra / popover nổi |
| Neutral / Bottom 16 · 20 | `0 4px 16px` · `0 6px 20px` | `--shadow-bottom-16/20` | |
| Neutral / Top 4 · 8 · 12 | `0 -1px 4px` · `0 -2px 8px` · `0 -4px 12px` | `--shadow-top-4/8/12` | thanh dính đáy (footer form) |
| Neutral / Right 4 · 8 · 12 | `1px 0 4px` · `2px 0 8px` · `4px 0 12px` | `--shadow-right-4/8/12` | cột ghim trái |
| Neutral / Left 4 · 8 · 12 | `-1px 0 4px` · `-2px 0 8px` · `-4px 0 12px` | `--shadow-left-4/8/12` | cột ghim phải, drawer phải |

`--shadow-sm/md/lg/dialog` là token cũ của mds-ui (không có trong Figma) — giữ để không vỡ code cũ, code mới dùng các token trên.

---

### C4. Typography — Figma Text Styles (Font: Inter / InterVariable)

| Style | Cỡ / dòng | Đậm | Token |
|---|---|---|---|
| H1 – Banner Title | 24 / 32 | Semi Bold | `--text-h1` |
| H2 – App, Page Title, Form title, Dialog Welcome | 20 / 28 | Semi Bold | `--text-h2` |
| H3 – Card, Section, Group Title | 16 / 22 | Semi Bold | `--text-h3` |
| **Body Regular** (mặc định mọi nội dung) | **13 / 20** | Regular · Medium · Semi Bold · Bold | `--text-body` |
| Body Small | 12 / 18 | Regular · Medium · Semi Bold · Bold | `--text-sm` |
| Body Medium | 14 / 20 (Medium, Semi Bold: 22) | | `--text-body-md` |
| Body Large | 16 / 24 | | `--text-body-lg` |
| Caption | 10 / 15 (Small · Medium · Large) · 12 / 15 (Mobile Responsive) | Regular · Medium · Semi Bold | `--text-caption` |
| Overline | 11 / 16 | Regular · Medium · Semi Bold · Bold | |

Font weight: Regular 400 · Medium 500 · Semi Bold 600 · Bold 700 (`--fw-*`).

Bộ 🔢 Font Size (mode): Body Regular 13 (Small) · 14 (Medium/Large) — web dùng mode **Small**. H2 20 → 24, H3 16 → 20 ở Large / Mobile.

---

### C5. Space — kích thước & khoảng cách theo component (Figma 📏 Space)

Giá trị: **Trung bình | Nhỏ | Rộng | Mobile** (tên mode gốc trong Figma: Standard · Compact · Comfortable · Mobile); một số = giống nhau mọi mode.
Trong mds-ui: chiều cao control theo `--btn-height` / `--input-height` (32 · 28 · 36); bảng 1 dòng `--dt-row-height`.

**Accordion**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Gap-Body | 12 | 12 | 16 | 16 |
| Gap-Container | 12 | 12 | 16 | 16 |
| Gap-Accordion | 12 | 12 | 16 | 16 |

**Alert**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Inline Alert/Padding-Horizontal | 12 | 12 | 16 | 16 |
| Inline Alert/Padding-Vertical | 12 | 12 | 16 | 16 |
| Inline Alert/Gap-Alert | 12 | 12 | 16 | 16 |
| Inline Alert/Gap-Container | 12 | 12 | 16 | 16 |
| Inline Alert/Gap-Content | 8 | 8 | 12 | 12 |

**Avatar**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Gap-Text | 8 | 8 | 8 | 8 |
| Size-12 | 12 | 12 | 16 | 16 |
| Size-16 | 16 | 16 | 20 | 20 |
| Size-20 | 20 | 20 | 24 | 24 |
| Size-24 | 24 | 24 | 28 | 28 |

**Breadcrumb**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Gap-Breadcrumb | 8 | 8 | 8 | 8 |
| Gap-Content | 8 | 8 | 8 | 8 |

**Button**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Small/Fix-Height | 28 | 24 | 32 | 32 |
| Small/Fix-Width | 28 | 24 | 32 | 32 |
| Small/Min-Width | 56 | 48 | 64 | 64 |
| Small/Padding-Text-Horizontal | 12 | 8 | 12 | 12 |
| Small/Padding-Icon-Horizontal | 6 | 4 | 8 | 8 |
| Small/Gap-Content | 8 | 4 | 8 | 8 |
| Small/Gap-Button-Group | 8 | 4 | 8 | 12 |
| Medium/Fix-Height | 32 | 28 | 36 | 44 |
| Medium/Fix-Width | 32 | 28 | 36 | 36 |
| Medium/Min-Width | 80 | 72 | 96 | 96 |
| Medium/Min-Width Split | 56 | 48 | 60 | 60 |
| Medium/Padding-Text-Horizontal | 12 | 12 | 16 | 16 |
| Medium/Padding-Icon-Horizontal | 8 | 6 | 8 | 8 |
| Medium/Gap-Content | 8 | 8 | 8 | 8 |
| Medium/Gap-Button-Group | 8 | 8 | 12 | 12 |

**Checkbox**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Size | 16 | 16 | 20 | 20 |
| Gap-Text | 8 | 8 | 8 | 8 |
| Gap-Horizontal-Group | 24 | 24 | 32 | 32 |
| Gap-Vertical-Group | 8 | 8 | 12 | 12 |

**Chip**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Medium/Fix-Height | 28 | 24 | 32 | 32 |
| Medium/Padding-Text-Horizontal | 8 | 8 | 8 | 8 |
| Medium/Padding-Avatar-Horizontal | 6 | 4 | 6 | 6 |
| Medium/Gap-Content | 8 | 8 | 8 | 8 |
| Medium/Gap-Chip-Group | 4 | 4 | 8 | 8 |

**Choice Box**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical | 12 | 12 | 16 | 16 |
| Gap-Content | 8 | 8 | 8 | 8 |

**Collapse Expand**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-L2 | 24 | 24 | 28 | 28 |
| Padding-L3 | 48 | 48 | 56 | 56 |
| Padding-L4 | 72 | 72 | 84 | 84 |

**Date Time Picker**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Width-Date | 32 | 28 | 36 | 36 |
| Fix-Height-Date | 32 | 28 | 36 | 44 |
| Fix-Width-Month | 56 | 52 | 60 | 60 |
| Fix-Height-Month | 56 | 52 | 60 | 60 |
| Fix-Width-Quater | 56 | 52 | 60 | 60 |
| Fix-Height-Quater | 32 | 28 | 36 | 44 |
| Fix-Width-6-Months | 112 | 100 | 120 | 120 |
| Fix-Height-6-Months | 32 | 28 | 36 | 44 |
| Fix-Width-Time | 56 | 52 | 60 | 60 |
| Fix-Height-Time | 32 | 28 | 36 | 44 |
| Fix-Height-Date-Name | 32 | 28 | 36 | 44 |
| Padding-Horizontal | 12 | 8 | 12 | 12 |
| Padding-Vertical | 12 | 8 | 12 | 12 |
| Padding-Divider-Vertical | 8 | 8 | 8 | 8 |

**File Upload**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Gap-Content | 8 | 8 | 12 | 12 |
| Gap-Container | 12 | 12 | 16 | 16 |
| Gap-File-Item | 8 | 8 | 12 | 12 |

**File Upload Item**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 12 | 12 | 16 | 16 |
| Padding-Vertical | 12 | 12 | 16 | 16 |
| Padding-Icon-Vertical | 8 | 8 | 12 | 12 |
| Gap-Content | 8 | 8 | 8 | 8 |
| Gap-Subtext-Vertical | 4 | 4 | 4 | 4 |
| Gap-File-Vertical | 12 | 12 | 16 | 16 |
| Gap-File-Horizontal | 12 | 12 | 16 | 16 |
| Gap-Icon-Horizontal | 8 | 8 | 8 | 8 |

**Icon**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Size-12 | 12 | 12 | 16 | 16 |
| Size-16 | 16 | 16 | 20 | 20 |
| Size-20 | 20 | 20 | 24 | 24 |
| Size-24 | 24 | 24 | 28 | 28 |
| Stroke-12 | 1.5 | 1.5 | 1.5 | 1.5 |
| Stroke-16 | 1.5 | 1.5 | 1.5 | 1.5 |
| Stroke-20 | 1.5 | 1.5 | 1.5 | 1.5 |
| Stroke-24 | 1.5 | 1.5 | 2 | 2 |
| Gap-Icon-Group | 12 | 12 | 12 | 12 |

**Input**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Height | 32 | 28 | 36 | 44 |
| Fix-Width | 32 | 28 | 36 | 36 |
| Min-Height-Label | 32 | 28 | 36 | 44 |
| Min-Height-Multiple | 72 | 64 | 72 | 88 |
| Max-Height-Multiple | 164 | 148 | 192 | 192 |
| Min-Width-TextBox | 80 | 80 | 96 | 96 |
| Min-Width-DateBox | 112 | 112 | 128 | 128 |
| Min-Width-TimeBox | 80 | 96 | 96 | 96 |
| Min-Width-Stepper | 40 | 36 | 48 | 48 |
| Padding-Icon-Horizontal | 8 | 8 | 8 | 8 |
| Padding-Text-Horizontal | 12 | 12 | 12 | 12 |
| Padding-Text-Vertical | 8 | 6 | 10 | 10 |
| Padding-Tag-Vertical | 4 | 4 | 4 | 4 |
| Gap-Content | 8 | 8 | 8 | 8 |
| Gap-Label-Horizontal | 8 | 8 | 8 | 8 |
| Gap-Label-Vertical | 4 | 4 | 8 | 8 |
| Gap-Subtext-Vertical | 2 | 2 | 2 | 2 |
| Gap-Box-Horizontal | 8 | 8 | 8 | 8 |
| Gap-Message | 4 | 4 | 4 | 4 |
| Gap-Input-Vertical | 16 | 8 | 20 | 20 |
| Gap-Input-Horizontal | 12 | 8 | 16 | 16 |
| Gap-Input-Group-Vertical | 24 | 16 | 24 | 24 |

**Keyboard**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Height | 24 | 20 | 28 | 28 |
| Padding-Horizontal | 8 | 4 | 8 | 8 |
| Gap-Content | 4 | 4 | 4 | 4 |
| Gap-Keyboard | 4 | 4 | 4 | 4 |

**Menu List**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Height-1-Line | 32 | 32 | 36 | 44 |
| Fix-Height-2-Line | 48 | 48 | 52 | 52 |
| Min-Width | 80 | 80 | 96 | 96 |
| Padding-Icon-Horizontal | 8 | 8 | 8 | 8 |
| Padding-Text-Horizontal | 12 | 12 | 16 | 16 |
| Padding-Vertical | 8 | 8 | 12 | 12 |
| Padding-Vertical-Small | 4 | 4 | 8 | 8 |
| Padding-Divider-Vertical | 12 | 12 | 12 | 12 |
| Gap-Content | 8 | 8 | 8 | 8 |
| Gap-Item | 4 | 4 | 4 | 4 |
| Gap-Label | 8 | 8 | 8 | 8 |
| Gap-Subtext-Vertical | 4 | 4 | 4 | 4 |
| Gap-Dual-List-Box | 16 | 16 | 16 | 16 |

**Message**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Toast Message/Fix-Height | 32 | 28 | 36 | 36 |
| Toast Message/Padding-Text-Horizontal | 12 | 12 | 16 | 16 |
| Toast Message/Gap-Content | 8 | 8 | 8 | 8 |
| Inline Message/Gap-Content-Medium | 8 | 8 | 8 | 8 |
| Inline Message/Gap-Content-Small | 8 | 8 | 8 | 8 |

**Notification**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Gap-Content | 4 | 4 | 8 | 8 |
| Gap-Body | 12 | 12 | 16 | 16 |
| Gap-Container | 16 | 16 | 20 | 20 |

**Pagination**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Numbered/Fix-Height | 32 | 28 | 36 | 36 |
| Numbered/Fix-Width | 32 | 28 | 36 | 36 |
| Numbered/Gap | 8 | 8 | 8 | 8 |
| Overflow/Fix-Height | 48 | 40 | 56 | 56 |
| Overflow/Gap | 8 | 8 | 8 | 8 |

**Radio Button**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Size | 16 | 16 | 20 | 20 |
| Size-Selector | 8 | 8 | 10 | 10 |
| Gap-Text | 8 | 8 | 8 | 8 |
| Gap-Horizontal-Group | 24 | 24 | 32 | 32 |
| Gap-Vertical-Group | 8 | 8 | 12 | 12 |

**Scroll Bar**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Width-Small | 12 | 12 | 16 | 16 |
| Fix-Height-Small | 12 | 12 | 16 | 16 |
| Fix-Width-Medium | 16 | 16 | 20 | 20 |
| Fix-Height Medium | 16 | 16 | 20 | 20 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical 2 | 8 | 8 | 8 | 8 |
| Padding-Horizontal 2 | 8 | 8 | 8 | 8 |
| Size-Small | 4 | 4 | 4 | 4 |
| Size-Medium | 6 | 6 | 6 | 6 |
| Size-Large | 8 | 8 | 8 | 8 |

**Segmented**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Height | 32 | 28 | 36 | 44 |
| Fix-Height-Item | 28 | 24 | 28 | 28 |
| Min-Width-Item | 40 | 40 | 52 | 52 |
| Padding-Text-Horizontal | 12 | 12 | 16 | 16 |
| Padding-Icon-Horizontal | 6 | 4 | 4 | 4 |
| Padding-Segmented | 2 | 2 | 4 | 4 |
| Gap-Content | 8 | 8 | 8 | 8 |

**Steps**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Height | 32 | 28 | 36 | 44 |
| Fix-Height-Small | 24 | 20 | 28 | 36 |
| Padding-Text-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Text-Vertical | 4 | 2 | 4 | 4 |
| Gap-Container | 8 | 8 | 8 | 8 |
| Gap-Step | 12 | 8 | 8 | 8 |

**Tabs**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Medium/Fix-Height | 36 | 36 | 40 | 44 |
| Medium/Fix-Height-Underline | 40 | 36 | 44 | 44 |
| Medium/Fix-Height-Vertical | 52 | 48 | 56 | 56 |
| Medium/Padding-Horizontal | 12 | 12 | 20 | 20 |
| Medium/Padding-Horizontal-Filled | 12 | 12 | 20 | 20 |
| Medium/Padding-Vertical | 8 | 8 | 12 | 12 |
| Medium/Gap-Content | 8 | 8 | 8 | 8 |
| Medium/Gap-Content-Vertical | 6 | 6 | 6 | 6 |
| Medium/Gap-Tabs | 8 | 8 | 8 | 8 |
| Large/Fix-Height | 56 | 52 | 60 | 60 |
| Large/Padding-Horizontal | 20 | 20 | 24 | 24 |
| Large/Padding-Horizontal-Filled | 12 | 12 | 16 | 16 |
| Large/Padding-Vertical | 8 | 8 | 12 | 12 |
| Large/Gap-Content | 8 | 8 | 8 | 8 |

**Tag**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| X Small/Fix-Height | 20 | 16 | 24 | 24 |
| X Small/Padding-Text-Horizontal | 4 | 4 | 4 | 4 |
| X Small/Padding-Icon-Horizontal | 4 | 4 | 4 | 4 |
| X Small/Padding-Avatar-Horizontal | 4 | 4 | 6 | 6 |
| X Small/Padding-Badge-Horizontal | 6 | 4 | 8 | 8 |
| X Small/Gap-Content | 4 | 4 | 4 | 4 |
| X Small/Gap-Tag-Group | 4 | 4 | 4 | 4 |
| Small/Fix-Height | 24 | 20 | 28 | 28 |
| Small/Padding-Text-Horizontal | 8 | 8 | 8 | 8 |
| Small/Padding-Icon-Horizontal | 4 | 4 | 6 | 6 |
| Small/Padding-Avatar-Horizontal | 6 | 6 | 8 | 8 |
| Small/Padding-Badge-Horizontal | 8 | 8 | 12 | 12 |
| Small/Gap-Content | 6 | 6 | 6 | 6 |
| Small/Gap-Tag-Group | 4 | 4 | 4 | 4 |
| Medium/Fix-Height | 28 | 24 | 32 | 44 |
| Medium/Padding-Text-Horizontal | 8 | 8 | 12 | 12 |
| Medium/Padding-Icon-Horizontal | 6 | 6 | 8 | 8 |
| Medium/Padding-Avatar-Horizontal | 6 | 6 | 8 | 8 |
| Medium/Padding-Badge-Horizontal | 8 | 8 | 12 | 12 |
| Medium/Gap-Content | 4 | 4 | 8 | 8 |
| Medium/Gap-Tag-Group | 4 | 4 | 8 | 8 |

**Text**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Title/Gap-Title | 8 | 8 | 8 | 8 |
| Title/Gap-Subtitle | 8 | 8 | 8 | 8 |
| Title/Gap-Subtitle-Small | 4 | 4 | 4 | 4 |
| Title/Gap-Divider | 16 | 16 | 20 | 20 |
| Text/Gap-Text | 8 | 8 | 8 | 8 |
| Text/Gap-Subtext | 4 | 4 | 4 | 4 |
| Text/Gap-Text-Group | 16 | 16 | 16 | 16 |
| Text/Gap-Text-Group-Dot | 8 | 8 | 8 | 8 |
| Caption/Gap-Caption | 8 | 8 | 8 | 8 |
| Caption/Gap-Text-Group | 16 | 16 | 16 | 16 |
| Caption/Gap-Text-Group-Dot | 8 | 8 | 8 | 8 |

**Toggle Switch**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Height | 16 | 16 | 20 | 20 |
| Width | 28 | 28 | 36 | 36 |
| Selector | 12 | 12 | 16 | 16 |
| Gap-Text | 8 | 8 | 8 | 8 |
| Gap-Horizontal-Group | 24 | 24 | 32 | 32 |
| Gap-Vertical-Group | 8 | 8 | 12 | 12 |

**Tooltip**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Gap-Content-Horizontal | 8 | 8 | 8 | 8 |
| Gap-Content-Vertical | 4 | 4 | 8 | 8 |
| Gap-Container | 16 | 16 | 16 | 16 |
| Padding-Horizontal | 12 | 8 | 16 | 16 |
| Padding-Vertical | 8 | 6 | 8 | 8 |
| Padding-Horizontal-Rich | 16 | 16 | 20 | 20 |
| Padding-Vertical-Rich | 16 | 16 | 20 | 20 |

**Tree**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Height-1-Line | 32 | 28 | 36 | 36 |
| Fix-Height-2-Line | 48 | 44 | 52 | 52 |
| Min-Width | 80 | 80 | 96 | 96 |
| Padding-Text-Horizontal | 16 | 16 | 20 | 20 |
| Gap-Content | 8 | 8 | 8 | 8 |
| Gap-Subtext-Vertical | 4 | 4 | 4 | 4 |

**Pattern · Button Bar**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical | 12 | 8 | 16 | 16 |
| Gap-Container | 16 | 12 | 20 | 20 |

**Pattern · Card**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Gap-Body | 12 | 8 | 16 | 16 |
| Gap-Container | 16 | 12 | 20 | 20 |
| Gap-Icon-Shape | 12 | 8 | 16 | 16 |

**Pattern · Chart**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Gap-Body | 12 | 12 | 16 | 16 |
| Gap-Container | 16 | 16 | 20 | 20 |
| Gap-Icon-Shape | 12 | 12 | 16 | 16 |

**Pattern · Chat**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Message/Fix-Height | 32 | 28 | 36 | 36 |
| Message/Max-Width | 384 | 384 | 384 | 384 |
| Message/Padding-Horizontal | 12 | 12 | 16 | 16 |
| Message/Padding-Vertical | 8 | 6 | 10 | 10 |
| Message/Gap-Content | 8 | 8 | 8 | 8 |
| Message/Gap-Message-Group | 4 | 4 | 4 | 4 |
| Link/Padding-Horizontal | 12 | 12 | 16 | 16 |
| Link/Padding-Vertical | 12 | 12 | 16 | 16 |
| Link/Gap-Body | 8 | 8 | 14 | 14 |
| Content/Padding-Horizontal | 16 | 16 | 20 | 20 |
| Content/Padding-Vertical | 16 | 16 | 20 | 20 |
| Content/Gap-Body | 12 | 12 | 16 | 16 |

**Pattern · Comment**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Gap-Content | 8 | 8 | 8 | 8 |
| Gap-Action | 16 | 16 | 16 | 16 |

**Pattern · DataTable**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Height-Cell-1-Line | 36 | 32 | 40 | 40 |
| Fix-Height-Cell-2-Line | 56 | 52 | 60 | 60 |
| Fix-Height-Cell-3-Line | 72 | 64 | 80 | 80 |
| Fix-Height-Header-1-Row | 36 | 32 | 40 | 40 |
| Fix-Height-Header-2-Row | 56 | 52 | 60 | 60 |
| Fix-Height-Header-3-Row | 72 | 64 | 80 | 80 |
| Fix-Height-Footer | 36 | 32 | 40 | 40 |
| Advance/Padding-Vertical | 2 | 2 | 2 | 2 |
| Advance/Fix-Height-Cell-1-Line | 36 | 32 | 40 | 40 |
| Advance/Fix-Height-Cell-2-Line | 56 | 52 | 60 | 60 |
| Advance/Fix-Height-Cell-3-Line | 72 | 64 | 80 | 80 |
| Advance/Fix-Height-Header-1-Row | 36 | 32 | 40 | 40 |
| Advance/Fix-Height-Header-2-Row | 56 | 52 | 60 | 60 |
| Advance/Fix-Height-Header-3-Row | 72 | 64 | 80 | 80 |
| Advance/Fix-Height-Footer | 36 | 32 | 40 | 40 |
| Padding-Horizontal | 4 | 4 | 4 | 4 |
| Padding-Paging-Horizontal | 16 | 12 | 16 | 16 |
| Min-Width-Column | 40 | 40 | 44 | 44 |

**Pattern · Dialog**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 24 | 16 | 20 | 20 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Gap-Body | 12 | 12 | 16 | 16 |
| Gap-Icon-Shape | 12 | 12 | 16 | 16 |
| Gap-Container | 16 | 16 | 20 | 20 |

**Pattern · Form**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 24 | 24 | 24 | 24 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Padding-Vertical-Footer | 12 | 12 | 16 | 16 |
| Gap-Body-Vertical | 16 | 16 | 20 | 20 |
| Gap-Body-Horizontal | 32 | 28 | 36 | 36 |

**Pattern · Media**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 12 | 20 | 20 |
| Padding-Vertical | 12 | 8 | 16 | 16 |
| Gap-Container | 12 | 8 | 16 | 16 |

**Pattern · Side Bar**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 12 | 16 | 16 |
| Padding-Vertical | 16 | 12 | 16 | 16 |
| Gap | 8 | 8 | 12 | 12 |

**Radius**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Defaullt | 8 | 6 | 8 | 8 |
| Small | 4 | 4 | 4 | 4 |
| Inner | 6 | 4 | 6 | 6 |
| Focus | 12 | 8 | 12 | 12 |
| Pill | 9999 | 9999 | 9999 | 9999 |
| Dialog-Card-Popover | 12 | 12 | 12 | 12 |

#### C5.1 Thang số (#️⃣ Number)
- Spacing-Padding: 0 · 2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 36 · 40 · 44 · 48 · 52 · 56 · 60 · 64 · 68 · 72 · 76 · 80 · 84
- Width-Height: 0 · 2 · 4 · … · 80 · 88 · 96 · 108 · 112 · 120 · 128 · 132 · 140 · 144 · 148 · 160 · 164 · 176 · 192 · 208 · 224 · 240 · 256 · 288 · 320
- Icon Size: 8 · 12 · 16 · 20 · 24 · 28 · 32 · 36 · 40 · 44 · 48 · Border Width: 0 · 1 · 2 · 3 · 4
- ⛔ Không dùng giá trị ngoài thang (VD 5px, 7px, 9px, 11px, 13px, 15px, 22px, 30px).

---

### C6. Màu biểu đồ (🌈 Chart Colors) — 7 màu / theme

Màu 1 = màu chính theme. Mỗi ô: **Palette · Single Hue · Divergent**. Palette = nhiều nhóm khác nhau; Single Hue = 1 chuỗi đậm → nhạt; Divergent = thang 2 đầu.

| Theme | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| Blue | `#245fdf` | #ad63e1 · #5481f2 · #ad8ae7 | #f157c0 · #7693f5 · #e6b2e4 | #ff5f96 · #93a6f8 · #ffe4f1 | #ff7e6d · #adb9fb · #ffcdd0 | #ffa54d · #c5ccfd · #ffc28e | #ffcc42 · #dce0ff · #ffcc42 |
| Green | `#0e9a62` | #4d9a3e · #3ca669 · #77b967 | #759a28 · #5cb47c · #bed984 | #989815 · #78c291 · #fff9ac | #bb9311 · #92d0a5 · #fbd57c | #db8c24 · #acdebb · #faae55 | #f9823e · #c5ecd0 · #f9823e |
| Blue Gray | `#4e5ba6` | #7b4f8a · #595e98 · #8b71a3 | #aa5b87 · #7476ac · #caa2c3 | #cc6e7f · #8e8fc0 · #ffdaea | #e28977 · #a9a9d5 · #ffcdcc | #eba975 · #c4c4ea · #ffc8a4 | #e9cc81 · #e0dfff · #e9cc81 |
| Teal | `#0e9384` | #4bb882 · #43c0a9 · #73d09f | #72b765 · #5fc9b4 · #b1e8a4 | #97b34b · #77d2bf · #edffb2 | #bbac39 · #8ddbca · #f0df82 | #dea137 · #a3e4d5 · #f8bb5c | #ff9248 · #b7ede0 · #ff9248 |
| Cyan | `#00a2cf` | #00bac7 · #41b8db · #42cbd7 | #08c4ae · #5fc2e2 · #7be6d6 | #5eca8e · #77cce9 · #b5ffd6 | #96cd6f · #8dd6f0 · #c2f1a5 | #cbca5a · #a1e1f8 · #dedd77 | #ffc259 · #b5ebff · #ffc259 |
| Indigo | `#4155f5` | #c465df · #7d83f5 · #be89e7 | #fd5dbc · #9494f8 · #ebade1 | #ff6994 · #a9a6fa · #ffdaea | #ff876f · #bdb8fc · #ffc9c9 | #ffab54 · #d0cbfd · #ffbe57 | #ffce4e · #e2deff · #ffce4e |
| Purple | `#744ec7` | #dd46d5 · #926ffa · #de70d5 | #ff48aa · #a685fb · #ffa3c6 | #ff6a83 · #b99afc · #ffdbdc | #ff9567 · #cbb0fd · #ffd4c3 | #ffbf5e · #dbc6fe · #ffd698 | #ffe471 · #eaddff · #ffe471 |
| Pink | `#c64691` | #ff71a7 · #f883ce · #ff91a3 | #ff8181 · #fa94d5 · #ffbd9f | #ff9d5d · #fca5dc · #ffe8a1 | #ffbd3d · #fdb6e2 · #ffe8a1 | #f9de30 · #fec6e9 · #f3f186 | #c9fb4d · #ffd6ef · #c9fb4d |
| Rosé (Red) | `#c34266` | #ff7f73 · #ff829b · #ff9a81 | #ff955a · #ff93a8 · #ffc58c | #f9af48 · #ffa4b5 · #ffedae | #e1c846 · #ffb5c2 · #e9ee95 | #c0e059 · #ffc5cf · #c7f184 | #93f57f · #ffd5dc · #93f57f |
| Orange | `#cd6731` | #dc9829 · #ff9451 · #f7b350 | #baa52f · #ffa268 · #f1db7b | #98ae45 · #ffb07e · #f0feb1 | #77b463 · #ffbe95 · #b8e7a5 | #59b681 · #ffccac · #80cf9f | #43b69c · #ffdac4 · #43b69c |

---

### C7. Lệch giữa Figma và mds-ui (còn giữ, có chủ đích hoặc chờ quyết định)

| Hạng mục | Figma | mds-ui hiện tại |
|---|---|---|
| Dòng bảng 1 dòng | 36 · 32 · 40 | `--dt-row-height` 32 · 32 · 36 |
| Dòng bảng 2 / 3 dòng | 56 · 52 · 60 / 72 · 64 · 80 | cố định 56 / 72 |
| Item menu xổ ra (Menu List 1 dòng) | 32 · 32 · 36 | `--menu-item-h` 32 · 32 · 36 (riêng, không theo nút) |
| Divider trong menu | Padding-Divider-Vertical 12 | cách item 4px (theo yêu cầu thiết kế dự án) |
| Item Sub Menu (Tabs Medium) | 36 · 36 · 40 | cố định 36 |
| H1 line-height | 32 | `--text-h1-lh` 36 |
| Body Small line-height | 18 | `--text-sm-lh` 16 (thêm `--text-body-sm-lh` 18) |

#### C8. Sidebar tối (`data-sidebar="dark"`)
Chỉ dùng khi header **nền trắng** (header màu → sidebar luôn sáng — xem quy tắc tổ hợp ở Phần A).
Sidebar tối KHÔNG có border-right (nền `#1c1e26` đã tự tách khỏi vùng nội dung). mds-ui đặt `border-right: none` (sidebar định vị absolute theo bề rộng nên không xô vùng nội dung; để viền trong suốt sẽ hở 1px nền tối ở mép phải — VD làm hụt ảnh trang trí góc), kể cả biến thể có hình nền (`data-wallpaper`). Sidebar sáng giữ vạch `--stroke-neutral-light` như cũ.

---

## Phần D — Quy tắc chi tiết của mds-ui (nguyên văn từ `vue-controls.md`)

### D1. ⛔ Tên class tự đặt phải đủ dài, khó trùng

Không dùng tiền tố 2–3 ký tự (`cp-`, `af-`, `imp-`…) cho class tự viết trong app: extension trình duyệt hay dùng tên ngắn kiểu `.cp-body` và CSS của chúng sẽ đè lên (đã gặp: popup Chốt điểm bị đổi font + đẩy lệch vì `.cp-body` trùng extension).
Đặt theo `<tên-app>-<thành phần>__phần`, VD `pdp-close-body`, `pdp-close-table`. Class của mds-ui giữ nguyên.

### D2. ⛔ Tooltip: KHÔNG dùng tooltip mặc định của trình duyệt (`title`)

Dùng directive `v-tip` của mds-ui: nền tối `--neutral-900`, chữ trắng 12px, có mũi tên, hiện ngay khi hover / focus, tự lật xuống khi thiếu chỗ.
```js
import { vTip } from '@mds/utils/tooltip.js'   // <script setup>: dùng thẳng v-tip
```
```vue
<span v-tip="'Đã chốt điểm — không sửa được'"><TIcon name="lock" /></span>
```
DataTable đã dùng sẵn cho icon `icon-text` (`iconTitle`) và tag bị cắt / `+n`. Giải thích dài cho label form vẫn dùng ⓘ (InfoTip).

### D3. Tooltip: luôn dùng `v-tip` (mds-ui), không dùng `title` mặc định của trình duyệt

Nút icon (thao tác trên dòng bảng, nút công cụ…), avatar, chữ viết tắt → `v-tip="'Nội dung'"` + `aria-label` cho trình đọc màn hình. **Không dùng thuộc tính `title`** (tooltip trình duyệt: hiện chậm, chữ nhỏ, khó nhìn, không theo theme). DataTable đã đổi hết (nút thao tác dòng, “Thêm thao tác”, “Lọc cột”, nút trong ô, tên thành viên ở nhóm avatar).

**⛔ Tooltip KHÔNG lặp lại chữ đang hiện đủ** (lỗi tái diễn nhiều lần, VD mục sidebar mở rộng hover lại hiện đúng tên mục): tooltip CHỈ khi nó cho thêm thông tin — phần tử **chỉ có icon** / chữ đang ẩn (sidebar thu gọn), chữ **bị cắt "…"**, **viết tắt**, hoặc câu **giải thích khác** chữ đang hiện. Chữ đầy đủ mà tooltip = đúng chữ đó → không hiện. Đã khóa sẵn trong mds-ui: `v-tip` và `enableAutoTooltips()` tự bỏ qua tooltip trùng chữ đang hiện (cần ép hiện: `v-tip.always`, hiếm). Bấm chuột thì tooltip ẩn; focus chỉ hiện tooltip khi đi bằng bàn phím (`:focus-visible`) — không để tooltip treo lại sau khi bấm.
Kiểm tra trước khi giao: Playwright hover từng thứ có tooltip → chữ hiện đủ mà vẫn ra `.mds-tip` trùng chữ là lỗi; bấm nút rồi rời chuột → không còn `.mds-tip`.

### D4. Font trong popup / drawer / menu gắn vào `<body>`

mds-ui đặt sẵn `body > * { font-family: var(--font-family) }` — mọi lớp nổi Teleport ra `<body>` luôn dùng Inter. Lớp nổi tự viết ở app cũng phải Teleport vào `body` (không gắn vào chỗ khác) để hưởng quy tắc này; không tự đặt font khác.

### D5. ⛔ Header ứng dụng (ControlHeader) — quy chuẩn chung

```vue
<ControlHeader app-name="Tên app" :settings-only="true"
  :settings-menu="isAdmin ? [{ id: 'system', icon: 'adjustments', label: 'Cài đặt hệ thống' }] : []"
  @settings-select="item => item.id === 'system' && router.push('/cai-dat')"
  home-href="/tong-quan" @home="router.push('/tong-quan')"
  :avatar-name="me.name" :user-email="me.email" :user-role="roleLabel" @logout="doLogout" />
```
1. **Cài đặt chung** (Cài đặt hệ thống, tích hợp, cấu hình…) → menu **bánh răng trên header** xổ xuống. Mục đầu luôn là “Thiết lập hiển thị” (màu sắc / mật độ). **Không** đặt mục cài đặt ở sidebar; mục chỉ Quản trị thì chỉ truyền khi là Quản trị.
2. **Logo + tên app** trên header là link **về trang chủ** (màn mặc định, VD Tổng quan).
3. **Tài khoản = avatar góc phải**: bấm avatar → menu thông tin cá nhân (avatar, họ tên, email, vai trò) và **Đăng xuất** phía dưới. Truyền `:avatar-name`, `:user-email`, `:user-role`, `:user-picture`, bắt `@logout`. Không đặt tên / vai trò / nút đăng xuất rời trên header.
4. **Ô tìm kiếm trên header** (`.search-box-header`, Figma MDS “Searchbox” node 6019:50140) — có đủ trạng thái, ⛔ không để hover “chết”. Header nền màu = Style **Filled White**: nền `--alpha-white-200` (trắng 20%), không viền · **hover nền `--alpha-white-300` (30%) + viền trắng 1px** · focus nền 20% + viền trắng 1px · icon / placeholder trắng 70%, hover / focus / đã gõ icon trắng 100%, chữ gõ trắng. Header sáng (`.global-header--white`) = Style **Filled**: nền Neutral/200 · hover + focus nền trắng + viền `--stroke-brand` 1px. Viền vẽ bằng `box-shadow: inset 0 0 0 1px` (không xô bố cục); khung là `<label>` để bấm vào icon cũng focus ô nhập; placeholder “Tìm kiếm”. Slot `#header-search` tự dựng phải theo đúng các trạng thái này.

### D6. ⛔ Đồng nhất khung màn hình trong 1 ứng dụng (bắt buộc)

Mọi màn cùng loại PHẢI dùng **cùng khung + cùng class**, nhìn giống hệt nhau. Không tự “sáng tạo” bố cục riêng cho 1 màn.

**1. Khung màn danh sách (chuẩn duy nhất):**
```
page-header (56px: tiêu đề trái · bộ chọn phạm vi / nút trang bên phải)
└ sub-nav (48px) — CHỈ khi có tab cấp trang (vòng lặp, tháng…). Tab LUÔN ở hàng riêng này, KHÔNG nhét vào page-header
   ✅ NGOẠI LỆ — màn CHI TIẾT 1 bản ghi có ít tab (2–3 tab cố định, VD “Hồ sơ nhân viên | Hồ sơ năng lực”): đặt tab NGAY TRÊN thanh tiêu đề cho gọn
      `<nav class="page-header__tabs">` sau tiêu đề (dùng lại .sub-nav-tab; tab cao bằng page-header, gạch chân đè viền dưới).
      Công cụ của tab (chế độ xem, bật/tắt…) chuyển sang page-header__right, đứng trước nút chính.
      Màn < 1280px: nút dài thu về chỉ icon + v-tip (KHÔNG để thanh tiêu đề tràn / xuống dòng). Tab động / nhiều tab → vẫn dùng sub-nav hàng riêng.
content-wrapper content-wrapper--fill (padding 16, gap 16, không cuộn trang)
├ kpi-row (tuỳ chọn) — 4 thẻ .kpi-card (title + số to + icon góc phải + kpi-sub). KHÔNG dùng thanh chữ mỏng thay KPI
└ list-split
   ├ table-panel: TableHeader (toolbar) → [FilterChips] → table-scroll > DataTable → TablePaging (sát đáy)
   └ AdvancedFilterPanel (panel lọc, đẩy bảng sang trái)
```
- Bảng luôn **full chiều cao**: phân trang sát đáy, thân bảng co giãn theo màn hình.
- Xem chi tiết 1 dòng = **drawer nổi bên phải** (không làm hẹp bảng). Panel đẩy bảng chỉ dùng cho bộ lọc.
- Màn báo cáo / dashboard (nhiều card, biểu đồ) mới được cuộn trang (`content-wrapper` không `--fill`).

**2. CSS khung đặt 1 chỗ duy nhất** (file CSS dùng chung của app, VD `src/app.css`): `.content-wrapper--fill`, `.kpi-row/.kpi-card/.kpi-*`, `.list-split`, `.table-panel`, `.table-scroll`, `.filter-box`, `.empty-state`.
⛔ KHÔNG chép lại các class này vào `<style scoped>` của từng màn — chép qua chép lại là nguồn gốc lệch giao diện. `<style scoped>` chỉ chứa phần riêng của màn đó.

**3. Thanh công cụ & thao tác hàng loạt** dùng TableHeader: `main-buttons` cho nút chính, `bulk-action` + `bulk-buttons` khi tick chọn dòng.
⛔ Nút không bấm được trong ngữ cảnh hiện tại thì **ẩn (`v-if`)**, KHÔNG hiện rồi `disabled` (VD chọn toàn người đã chốt → ẩn nút “Chốt”, chỉ hiện “Mở chốt”).

**4. Chiều cao dòng bảng theo nội dung, không theo màn:** dòng 1 dòng chữ = `--dt-row-height`; dòng có avatar + dòng phụ (`avatar-subtext`) cao hơn — giống nhau ở mọi màn có cùng kiểu cột.

**5. Trước khi giao màn mới:** đặt cạnh 1 màn cùng loại đã có, so header / tab / KPI / toolbar / bảng / phân trang — khác chỗ nào phải sửa về chuẩn.

### D7. Quy tắc trạng thái hover (⛔ mọi control bấm / nhập được PHẢI đổi màu khi hover)

**⛔ BẤT KỲ thứ gì bấm được (có `@click`, `cursor: pointer`, `role="button"`, `<a>`, `<button>`) PHẢI có trạng thái hover nhìn thấy được** — đổi nền, đổi màu viền hoặc đổi màu chữ/icon; chỉ đổi `cursor` là CHƯA đủ. Nút thì có thêm pressed (`:active`) và focus (`:focus-visible`).
- Vùng lớn bấm được (dòng tiêu đề phần bấm để thu gọn, card bấm để mở, dòng danh sách, avatar mở menu…) → hover đổi nền nhạt (`--bg-neutral-light` / `--bg-brand-light`) HOẶC làm nút icon bên trong hiện hover (VD `.sec__hd:hover .btn-icon { background: var(--bg-neutral-light) }`).
- Chữ bấm được CHÈN TRONG CÂU / tên bản ghi dạng link → `btn btn--link` (hover gạch chân); **nút đứng riêng dạng link** (“Xem tất cả”, “+ Thêm dòng”) → `btn btn--text` = Figma Button Style=Text (cao/đệm/min-width như nút thường, không nền viền, hover nền Brand/100, nhấn Light Pressed, disabled chữ Disabled; màu `-neutral` `-info` `-warning` `-danger` `-success`; Vue `<AppButton variant="text">`) — KHÔNG để chữ thường + `@click`.
- Trước khi giao: rê chuột qua TỪNG thứ bấm được trên màn (Playwright `hover()` + so `getComputedStyle` trước/sau) — cái nào không đổi là lỗi.

| Control | Hover |
|---|---|
| Input (`.ibox`: Textbox, Combobox, Datebox, Numberbox, Searchbox, Textarea; cả `--no-border`, `--ghost`) | Viền `--stroke-brand` giống focus (focus có thêm quầng sáng 3px) |
| Ô lọc trong bảng (`.dt-filter-input/select`), ô sửa trực tiếp (`.dt-input/select`) | Viền / outline `--stroke-brand` |
| Tab (`.sub-nav-tab`, `.dialog-tab`) — Figma Tab Horizontal Item | Nền `--bg-neutral-hover` (Neutral Light Hover, ⛔ KHÔNG xanh brand), chữ giữ nguyên; tab cao `--tab-h` (36 · 36 · 40) — ⛔ không kéo cao bằng thanh chứa (nền hover sẽ lộ cả khối cao); nhấn `--bg-neutral-pressed`; tab đang chọn rê chuột vẫn nền trắng |
| Segment (`role-switch`, `view-switch`) | Theo control segment sẵn có |
| Button | Theo biến thể sẵn có (`btn--primary` → pressed, `btn--outline/neutral` → nền light, `btn-icon` / `btn-icon--outline` → nền `--bg-neutral-light`, nhấn `--bg-neutral-pressed`) |
| Dòng bảng | `--bg-brand-light` · tiêu đề cột bấm được → `--bg-neutral-hover` |
| Checkbox | Viền ô brand + nền tròn brand light |
| Menu item / dropdown | `--bg-neutral-hover` (danger → `--bg-danger-light`) |
| Icon rời bấm được | `btn-icon` / `btn-icon--sm` (Button Icon Medium / Small) — nền hover + pressed. `icon-swap--action` (đổi màu brand) CHỈ cho icon nằm trong control nhỏ (✕ trên chip) — Back ←, đóng panel cũng là `btn-icon` |
| Link chữ | Gạch chân |

Hover đã có trong mds-ui — dùng đúng class, KHÔNG tự viết hover khác. Control tự thi công trong app (không có class mds-ui) phải tự thêm hover theo bảng trên. Disabled / readonly KHÔNG đổi màu khi hover.

### D8. Quy tắc border cho controls (⛔ Tuyệt đối — không tái phạm)

```
LUÔN dùng --stroke-neutral cho border của mọi input control (textbox, select, combobox, datebox, numberbox, search box, ibox...).
NGHIÊM CẤM dùng --stroke-neutral-light cho border của control.

--stroke-neutral-light CHỈ dùng cho:
  - Divider / separator ngang/dọc giữa các vùng layout
  - Border trong/nội bộ của table (ht-row, ht-cell, dt-row, dt-cell)
  - Border của container/card/panel/wrapper (bọc nhiều thứ bên trong)
  - Popup/dropdown/popover container
  - Disabled state của control (border nhạt hơn khi control bị vô hiệu)
  - Avatar, decoration border
```

```css
/* ✅ ĐÚNG */
.my-input     { border: 1px solid var(--stroke-neutral); }
.search-box   { border: 1px solid var(--stroke-neutral); }
.ibox         { border: 1px solid var(--stroke-neutral); }

/* ❌ SAI — control không được dùng stroke-neutral-light */
.my-input     { border: 1px solid var(--stroke-neutral-light); }
.search-box   { border: 1px solid var(--stroke-neutral-light); }
.ibox         { border: 1px solid var(--stroke-neutral-light); }

/* ✅ ĐÚNG — container, divider dùng stroke-neutral-light */
.table-wrap   { border: 1px solid var(--stroke-neutral-light); }
.info-card    { border: 1px solid var(--stroke-neutral-light); }
.popup-menu   { border: 1px solid var(--stroke-neutral-light); }
.ibox--disabled { border-color: var(--stroke-neutral-light); }  /* disabled OK */
```

---

### D9. Quy tắc gap giữa controls (Rule #9 — chi tiết)

```
┌─────────────────────────────────────────────────────────┐
│  Tình huống                          │  gap    │  Token  │
│──────────────────────────────────────┼─────────┼─────────│
│  2+ control trong cùng row/group     │  8px    │  --gap-control   │
│  Input + button kèm (search box…)    │  8px    │  --gap-control   │
│  Form nhãn TRÊN: giữa các trường     │  16px   │  --form-row-gap-v│
│  Form nhãn TRÁI: giữa các hàng       │  12px   │  --form-row-gap-h│
│  Form / chi tiết: giữa 2 cột         │  80px   │  .form-fields--2col / .detail-grid │
│  Card ↔ card                         │  16px   │  --card-col-gap  │
│  Nội dung ↔ sidebar/lề phải/lề dưới  │  16px   │  --page-gutter   │
└─────────────────────────────────────────────────────────┘
```

```css
/* ✅ ĐÚNG — 2 button cạnh nhau trong cùng row */
.toolbar { display: flex; align-items: center; gap: var(--gap-control); }   /* hoặc dùng class .control-row */

/* ✅ ĐÚNG — search + button inline */
.search-row { display: flex; gap: 8px; }

/* ❌ SAI */
.toolbar { gap: 10px; }   /* không phải token */
.toolbar { gap: 12px; }   /* 12px chỉ dùng cho card gap, không phải control gap */
.toolbar { gap: 6px; }    /* quá hẹp */
```

**Row hỗn hợp (icon/avatar + text + control):** nếu 1 row có cả phần trang trí (icon, avatar, tiêu đề) LẪN control (button, icon-button) — ví dụ header của 1 card: `[icon] [tên + trạng thái] [button Hướng dẫn] [button Kết nối]` — thì gap của row cha (giữa icon/text/control-group) được phép khác 8px (12px, 16px...), nhưng 2 control (2 button) đứng cạnh nhau ở cuối row PHẢI được bọc riêng trong 1 wrapper `gap: 8px`, không dùng chung gap của row cha.

```css
/* ❌ SAI — 1 gap dùng chung cho cả icon/text lẫn 2 button, button cách nhau 12px thay vì 8px */
.card__head { display: flex; align-items: center; gap: 12px; }
/* <icon /> <title /> <button>Hướng dẫn</button> <button>Kết nối</button> */

/* ✅ ĐÚNG — tách 2 button vào wrapper riêng, gap 8px; row cha vẫn giữ 12px cho icon/text */
.card__head    { display: flex; align-items: center; gap: 12px; }
.card__actions { display: flex; align-items: center; gap: 8px; }
/* <icon /> <title /> <div class="card__actions"><button>Hướng dẫn</button><button>Kết nối</button></div> */
```

> **Nguồn:** CSS token `--btn-group-gap: 8px` (định nghĩa trong SKILL.md Section 1). Áp dụng cho mọi nơi: toolbar, page-header right, form inline group, filter bar, footer action bar.

---

### D10. Quy tắc căn lề (alignment) trong DataTable

**NGHIÊM CẤM căn giữa (center) cột văn bản thông thường.**

| Loại dữ liệu | align | Ghi chú |
|---|---|---|
| Text / string | *(không set — mặc định left)* | Tên, địa chỉ, mô tả, trạng thái… |
| **Số tiền / số lượng / %** | `align: 'right'` | Bắt buộc right để các chữ số thẳng hàng |
| **Ngày / giờ** | *(không set — mặc định left)* | ⛔ KHÔNG căn phải — header và data đều căn trái |
| STT (serial number) | `align: 'center'` | Chỉ cột số thứ tự |
| Icon-only / checkbox / radio | `align: 'center'` | Chỉ cột không có text |

> ⚠️ **BUG THƯỜNG GẶP — `<button>` mặc định `text-align: center`**
>
> Khi dùng `<button>` làm link/text trong cell (ví dụ: tên nhân viên dạng clickable), browser UA stylesheet set `text-align: center` cho button. Nếu button bị stretch full-width (do nằm trong flex column container), text sẽ hiện **căn giữa** dù không set gì.
>
> **Fix bắt buộc:** Luôn set `text-align: left` trên button text trong cell. Class `.dt-action-link` đã có sẵn rule này trong `style.css`. Nếu tự thi công button không dùng class này → **bắt buộc thêm `text-align: left` vào CSS của button đó**.
>
> ```css
> /* ✅ Đúng — đã có trong .dt-action-link */
> .dt-action-link { text-align: left; }
>
> /* ❌ Sai — button sẽ căn giữa nếu nằm trong flex column */
> .my-cell-btn { background: none; border: none; cursor: pointer; }
> /* → bị thiếu text-align: left */
> ```

**Ví dụ đúng:**
```js
const columns = [
  { key: 'stt',      label: 'STT',          width: 48,  align: 'center' },  // ✓ STT
  { key: 'name',     label: 'Họ và tên',    minWidth: 200 },                // ✓ text — không set align
  { key: 'dept',     label: 'Phòng ban',    width: 160 },                   // ✓ text — không set align
  { key: 'salary',   label: 'Lương (VNĐ)',  width: 130, align: 'right' },   // ✓ số tiền → right
  { key: 'joinDate', label: 'Ngày vào làm', width: 112 },                   // ✓ ngày → left (không set align)
]
```

---

### D11. Quy tắc kích thước button theo vị trí

`btn--sm` (28px) và `btn-icon--sm` (28px) CHỈ được dùng trong: **row actions, sidebar nav, toolbar icon nhỏ, paging control**.

**KHÔNG dùng `btn--sm` trong page-header** — page-header luôn dùng button standard (32px) để bằng height với input controls cạnh đó.

| Vị trí | Size | Class |
|--------|------|-------|
| Page header (ngang với ibox/input) | Standard (var(--btn-height)) | `btn btn--primary`, `btn btn--outline btn--neutral`, `btn-icon btn-icon--outline` |
| TableHeader toolbar (filter area) | Standard | Như trên |
| Compound input (textbox + icon) | Standard `btn-icon btn-icon--outline` | **KHÔNG dùng `btn-icon--sm`** |
| Row actions (cuối mỗi hàng bảng) | Standard `btn-icon btn-icon--outline` | Chỉ dùng `btn-icon--sm` khi user yêu cầu tường minh |
| Paging, sidebar | Standard | Chỉ dùng `btn-icon--sm` khi user yêu cầu tường minh |

**Ví dụ page-header đúng:**
```html
<div class="page-header__right">
  <button class="btn btn--outline btn--neutral">Nhập từ Excel</button>
  <button class="btn btn--outline btn--neutral">Xuất</button>
  <div class="btn-split">
    <button class="btn btn--primary">Thêm nhân viên</button>
    <button class="btn btn--primary btn-split__arrow"><TIcon name="chevron-down" /></button>
  </div>
  <DropdownMenu ...>
    <button class="btn-icon btn-icon--outline"><!-- KHÔNG dùng btn-icon--sm -->
      <TIcon name="dots" />
    </button>
  </DropdownMenu>
</div>
```

---

### D12. ⛔ 3 Density Modes — QUY TẮC BẮT BUỘC TUYỆT ĐỐI

> **Đây là lỗi tái lặp nhiều nhất.** Đọc kỹ và tuân thủ triệt để.

#### 12.1 Ba chế độ density (từ `mds-ui/src/style.css`)

```css
/* Standard / Tiêu chuẩn (mặc định) */
:root {
  --input-height:    36px;
  --btn-height:      36px;   /* = --input-height — btn-icon luôn bằng chiều cao input */
  --dt-row-height:   36px;
}

/* Nhỏ */
:root[data-density="compact"] {
  --input-height:    28px;
  --btn-height:      28px;
  --dt-row-height:   32px;
}

/* Comfortable / Rộng */
:root[data-density="comfortable"] {
  --input-height:    40px;
  --btn-height:      40px;   /* = --input-height */
  --dt-row-height:   40px;
}
```

> **Nguyên tắc bất di bất dịch:** `--btn-height` LUÔN LUÔN bằng `--input-height` trong mọi density mode.
> Lý do: btn-icon đặt cạnh input phải cùng chiều cao — nếu chênh là lỗi layout nghiêm trọng.

Người dùng chọn density trong Settings → `document.documentElement.dataset.density = 'compact'` (hoặc xóa attribute để về mặc định).

#### 12.2 ⛔ NGHIÊM CẤM hardcode chiều cao px

```css
/* ❌ SAI — hardcode cứng, không đổi theo density */
.my-input    { height: 32px; }
.my-input    { height: 28px; }
.my-button   { height: 36px; }
.ht-input    { height: 28px; }   /* ← lỗi hay gặp trong inline-editable table */
.ht-row      { height: 28px; }

/* ✅ ĐÚNG — tự động đổi theo density */
.my-input    { height: var(--input-height); }
.my-button   { height: var(--btn-height); }
.ht-input    { height: var(--input-height); }
.ht-row      { height: var(--input-height); min-height: var(--input-height); }
```

**Quy tắc đơn giản:**
- Input / textbox / select → `height: var(--input-height)`
- Button → `height: var(--btn-height)` (tự động qua `.btn` class)
- DataTable 1-line row → `height: var(--dt-row-height)` (tự động trong DataTable component)
- DataTable 2-line row → **luôn 56px cố định**, không đổi theo density

#### 12.3 Pattern chuẩn cho Inline-Editable Table (ht-input)

Bảng nhập liệu trực tiếp (hàng hóa trong chứng từ) — mỗi ô là input không border (chỉ show border khi focus).

```html
<!-- ✅ Pattern đúng — height dùng token, không hardcode -->
<div class="ht-wrapper">
  <!-- Header row -->
  <div class="ht-header">
    <div class="ht-cell ht-cell--header" style="width:40px">STT</div>
    <div class="ht-cell ht-cell--header" style="flex:1;min-width:200px">Tên hàng hóa, dịch vụ</div>
    <div class="ht-cell ht-cell--header" style="width:80px;text-align:right">Số lượng</div>
    <div class="ht-cell ht-cell--header" style="width:120px;text-align:right">Đơn giá</div>
    <div class="ht-cell ht-cell--header" style="width:120px;text-align:right">Thành tiền</div>
  </div>

  <!-- Data rows -->
  <div v-for="(row, i) in rows" class="ht-row" :class="{ 'ht-row--active': activeHtRow === i }">
    <div class="ht-cell" style="width:40px;text-align:center">{{ i + 1 }}</div>
    <div class="ht-cell" style="flex:1;min-width:200px">
      <input class="ht-input" v-model="row.name" placeholder="Chọn hàng hóa..." />
    </div>
    <div class="ht-cell ht-cell--num" style="width:80px">
      <input class="ht-input ht-input--right" v-model="row.qty" type="number" />
    </div>
    <div class="ht-cell ht-cell--num" style="width:120px">
      <input class="ht-input ht-input--right" v-model="row.price" type="number" />
    </div>
    <div class="ht-cell ht-cell--num" style="width:120px">
      <span class="ht-cell__readonly">{{ formatMoney(row.qty * row.price) }}</span>
    </div>
  </div>

  <!-- Add row button -->
  <div class="ht-add-row" @click="addRow">
    <TIcon name="plus" /><span>Thêm dòng</span>
  </div>
</div>
```

```css
/* ✅ CSS chuẩn — KHÔNG hardcode px, dùng var(--input-height) */
.ht-wrapper {
  display: flex; flex-direction: column;
  border: 1px solid var(--stroke-neutral-light);
  border-radius: var(--radius-default);
  overflow: hidden;
}
.ht-header {
  display: flex; align-items: center;
  height: var(--table-header-height, 36px); /* header luôn 36px */
  background: var(--dt-header-bg, #E4E6EA);
  border-bottom: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0;
}
.ht-cell--header {
  font-size: var(--text-sm); font-weight: var(--fw-medium);
  color: var(--text-secondary);
  padding: 0 8px;
  display: flex; align-items: center;
}
.ht-row {
  display: flex; align-items: stretch;
  /* ✅ ĐÚNG: dùng token, KHÔNG hardcode */
  min-height: var(--input-height);
  border-bottom: 1px solid var(--stroke-neutral-light);
  transition: background 0.1s;
}
.ht-row:last-of-type { border-bottom: none; }
.ht-row:hover { background: var(--bg-neutral-hover); }
.ht-row--active { background: var(--bg-brand-light); }
.ht-cell {
  display: flex; align-items: center;
  border-right: 1px solid var(--stroke-neutral-light);
  padding: 0;
  overflow: hidden;
}
.ht-cell:last-child { border-right: none; }
.ht-cell--num { justify-content: flex-end; }
.ht-input {
  /* ✅ ĐÚNG: height đổi theo density */
  width: 100%; height: var(--input-height);
  padding: 0 8px;
  border: none; outline: none;
  background: transparent;
  font-size: var(--text-body); font-family: var(--font-family);
  color: var(--text-primary);
}
.ht-input--right { text-align: right; }
.ht-input:focus {
  background: var(--bg-white);
  box-shadow: inset 0 0 0 1px var(--stroke-brand);
  border-radius: 2px;
}
.ht-cell__readonly {
  padding: 0 8px;
  font-size: var(--text-body);
  color: var(--text-primary);
  font-feature-settings: 'tnum' 1;
}
.ht-add-row {
  display: flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 12px;
  color: var(--text-brand); font-size: var(--text-body);
  cursor: pointer;
  border-top: 1px solid var(--stroke-neutral-light);
}
.ht-add-row:hover { background: var(--bg-brand-light); }
```

#### 12.4 Kiểm tra density trước khi submit code

**Checklist density (bắt buộc kiểm tra trước khi hoàn thành bất kỳ form/bảng nào):**

- [ ] Tất cả `<input>`, `<select>` custom đều dùng `height: var(--input-height)` — không có `height: 28px`, `height: 32px`, `height: 36px` cứng
- [ ] Tất cả button custom đều dùng `height: var(--btn-height)` hoặc dùng class `.btn` / `.btn-icon`
- [ ] Các ô `.ht-row` / `.ht-input` trong bảng nhập liệu dùng `min-height: var(--input-height)`
- [ ] DataTable 2-line row (subtext, avatar-subtext, product-logo) được giữ cố định 56px — không cần token
- [ ] Không có `height: px` nào ngoài: card header (48px fixed), dialog (theo spec), border-radius, avatar size

> **Ghi nhớ:** Mở DevTools → `document.documentElement.dataset.density = 'compact'` → tất cả control phải co lại. Nếu có gì không co → đó là chỗ đang hardcode px.

#### ESC đóng lớp trên cùng — `@mds/utils/escStack.js` (quy chuẩn chung)

```js
import { useEscClose } from '@mds/utils/escStack.js'
useEscClose(() => emit('close'))                                       // popup: đóng khi mở
useEscClose(() => { selected.value = null }, () => !!selected.value)   // drawer / panel bật theo điều kiện
```
- **Mọi popup / drawer / panel nổi phải đóng bằng ESC** — bấm ở đâu cũng được (không cần focus trong lớp). Nhiều lớp chồng nhau → ESC đóng lớp mở **sau cùng** (popup trên drawer: ESC lần 1 đóng popup, lần 2 đóng drawer).
- Không dùng `@keydown.esc` trên `<aside>` / khung (chỉ chạy khi focus ở trong) — dùng `useEscClose`.
- Control con tự xử lý ESC (danh sách xổ AppCombobox, DropdownMenu, lịch AppDatebox, sửa tiêu đề inline…) phải `e.stopPropagation()` khi đang mở → ESC chỉ đóng control đó, không đóng popup. AppCombobox / DropdownMenu / AppDatebox đã làm sẵn.
- Đang gõ bộ gõ (IME, `isComposing`) → bỏ qua.

#### DataTable gom nhóm — thu gọn / mở rộng tất cả

`groupBy` + `groupLabel` + `groupStorageKey` → dòng tiêu đề nhóm bấm để đóng / mở (nhớ theo storage key). Nút "thu gọn / mở rộng tất cả" đặt ở thanh công cụ, gọi qua ref:
```vue
<DataTable ref="tableRef" :group-by="'_groupKey'" ... />
<button class="btn-icon btn-icon--outline" @click="tableRef.allCollapsed ? tableRef.expandAll() : tableRef.collapseAll()">
  <TIcon :name="tableRef?.allCollapsed ? 'unfold' : 'fold'" />
</button>
```
- `defineExpose`: `collapseAll()`, `expandAll()`, `allCollapsed` (true khi mọi nhóm đang đóng → đổi icon / tooltip). Icon: `fold` (thu gọn) · `unfold` (mở rộng).

#### AppNumberbox `decimal` — nhập số thập phân (Point, điểm…)

```vue
<AppNumberbox v-model="form.baPoint" :min="0" decimal :stepper="false" />
```
- Ô chữ `inputmode="decimal"` (bàn phím số trên điện thoại): nhận **cả “,” lẫn “.”** làm dấu thập phân (người Việt quen gõ 5,75), lọc ký tự lạ, không ép theo `step` (5,75 giữ nguyên).
- Đang gõ dở (“5,”) không phát giá trị; rời ô / Enter → chuẩn hóa, kẹp `min` / `max`, hiện lại dạng dấu phẩy. `v-model` luôn là Number (hoặc `''` khi trống).
- Số nguyên thuần (số màn hình, số ngày…) vẫn dùng AppNumberbox thường.

#### AppCombobox `recent-key` — nhóm “Gần đây” khi chọn người / dự án

```vue
<AppCombobox v-model="form.pdId" :options="pdOptions" recent-key="pick-pd" />
```
- Nhớ tối đa `recent-max` (mặc định 5) giá trị vừa chọn theo khóa (localStorage `cb-recent:<key>`) — dùng CHUNG khóa cho mọi ô cùng loại (VD mọi ô chọn PD: `pick-pd`, BA: `pick-ba`) để chọn ở đâu cũng nhớ.
- Mở danh sách (chưa gõ tìm): nhóm **Gần đây** trên cùng → đường kẻ → **Tất cả** (không lặp lại người đã ở Gần đây). Gõ tìm → danh sách lọc bình thường. Giá trị không còn trong options / bị khóa thì không hiện.

#### DataTable — nút thao tác theo từng dòng

`rowActions: [{ icon, title, emit, danger?, show?(row) }]` — `show(row)` trả `false` → ẩn nút đó ở dòng đó (VD “Nhận việc” chỉ ở việc chưa có người). `max-row-actions` (mặc định 3) = số nút tối đa mỗi dòng, tính SAU khi lọc `show`.

#### Tooltip: luôn dùng `v-tip` (mds-ui), không dùng `title` mặc định của trình duyệt

Nút icon (thao tác trên dòng bảng, nút công cụ…), avatar, chữ viết tắt → `v-tip="'Nội dung'"` + `aria-label` cho trình đọc màn hình. **Không dùng thuộc tính `title`** (tooltip trình duyệt: hiện chậm, chữ nhỏ, khó nhìn, không theo theme). DataTable đã đổi hết (nút thao tác dòng, “Thêm thao tác”, “Lọc cột”, nút trong ô, tên thành viên ở nhóm avatar).

**⛔ Tooltip KHÔNG lặp lại chữ đang hiện đủ** (lỗi tái diễn nhiều lần, VD mục sidebar mở rộng hover lại hiện đúng tên mục): tooltip CHỈ khi nó cho thêm thông tin — phần tử **chỉ có icon** / chữ đang ẩn (sidebar thu gọn), chữ **bị cắt "…"**, **viết tắt**, hoặc câu **giải thích khác** chữ đang hiện. Chữ đầy đủ mà tooltip = đúng chữ đó → không hiện. Đã khóa sẵn trong mds-ui: `v-tip` và `enableAutoTooltips()` tự bỏ qua tooltip trùng chữ đang hiện (cần ép hiện: `v-tip.always`, hiếm). Bấm chuột thì tooltip ẩn; focus chỉ hiện tooltip khi đi bằng bàn phím (`:focus-visible`) — không để tooltip treo lại sau khi bấm.
Kiểm tra trước khi giao: Playwright hover từng thứ có tooltip → chữ hiện đủ mà vẫn ra `.mds-tip` trùng chữ là lỗi; bấm nút rồi rời chuột → không còn `.mds-tip`.

#### Thanh cuộn — `detectClassicScrollbars()` (`@mds/utils/scrollbars.js`)

Gọi 1 lần ở `main.js`. Mặc định giữ thanh cuộn hệ điều hành (macOS overlay tự ẩn — không đè CSS). Máy hiện thanh cuộn **cổ điển** (luôn hiện, chiếm chỗ: Windows, macOS “luôn hiện”) → tự gắn `html.classic-scrollbars` → style.css vẽ thanh cuộn **mảnh**: rãnh trong suốt, con trượt bo tròn xám nhạt (`--text-secondary` 32%), đậm hơn khi rê. Không tự viết `::-webkit-scrollbar` riêng ở từng màn.

#### OverflowActions — dãy nút tự co, thiếu chỗ thì gom vào ⋯

```vue
<OverflowActions :actions="[{ id: 'pd', label: 'Gán PD', icon: 'user' }, …, { id: 'delete', label: 'Xóa', icon: 'trash', danger: true }]" @select="onAction" />
```
- Đo bề rộng thật từng nút + theo dõi kích thước (ResizeObserver): đủ chỗ → hiện hết; thiếu → hiện các nút đầu theo thứ tự `actions`, phần còn lại vào nút icon ⋯ (DropdownMenu, `danger` = chữ đỏ). Xếp nút quan trọng trước, nguy hiểm (Xóa) cuối.
- Dùng cho thanh thao tác hàng loạt (TableHeader `#bulk-buttons` — vùng này đã `flex: 1; min-width: 0`) và mọi dãy nút có thể tràn.

#### DataTable — lưu độ rộng cột người dùng kéo

`@column-resize="(col, width) => …"` phát khi THẢ chuột sau khi kéo vạch chia (width px) hoặc khi **nhấp đúp vạch chia** (width = `null` → về mặc định). App lưu theo người dùng rồi truyền lại qua `col.width` (đổi `col.width` → bảng nhận độ rộng mới); kèm `col.defaultWidth` để nhấp đúp quay về. Với `useColumnSettings` (chamdiem-app): `@column-resize="(c, w) => cols.setWidth(c.key, w)"` — lưu cùng thứ tự / ẩn hiện / xuống dòng theo tài khoản.

- **Mọi bảng tự nhớ độ rộng:** app `provide('dtWidthStore', { get(key), set(key, colKey, px | null) })` (chamdiem-app: `store/tableWidths.js`, lưu theo tài khoản). DataTable tự dùng kho này, khóa = `persist-key` (nếu đặt) hoặc tự sinh theo bộ cột. Bảng nào đã tự xử lý `@column-resize` thì DataTable không ghi vào kho chung (tránh lưu trùng).

- **Tooltip tự động cho mọi nút:** gọi `enableAutoTooltips()` (`@mds/utils/tooltip.js`) 1 lần ở `main.js` → rê vào nút / link có `title` / `aria-label` hiện tooltip mds-ui ngay (title chuyển sang `aria-label`) — **chỉ khi** nút chỉ có icon (không có chữ đang hiện, VD sidebar thu gọn) hoặc chữ bị cắt / viết tắt; **chữ hiện đầy đủ thì không hiện tooltip** (VD sidebar mở rộng). ⛔ Nút icon nào cũng phải có `title` / `aria-label` / `v-tip` — không để nút icon trơn không nhãn.

### D13. ⛔ Button Icon Medium / Small — BẮT BUỘC cho MỌI icon rời bấm được

Figma MDS: **Button Icon Medium** (node `6019:13890`, 32px) · **Button Icon Small** (node `6019:14107`, 28px). Icon 16px.
Mọi icon đứng rời mà bấm được — sửa, xóa, ⋯ thêm, làm mới, cài đặt, copy, thu gọn/mở rộng (chevron), trang trước/sau (‹ ›), đóng panel… — PHẢI là `btn-icon` để có đủ trạng thái:

| Trạng thái | `.btn-icon` (Style=Icon) | `.btn-icon--outline` (Style=Outline) |
|---|---|---|
| Default | nền trong suốt, icon `--icon-neutral` | nền trắng, viền `--stroke-neutral` |
| Hover | nền `--bg-neutral-light`, icon đậm hơn | nền `--bg-neutral-light` |
| Pressed (`:active`) | nền `--bg-neutral-pressed` | nền `--bg-neutral-pressed` |
| Focus (bàn phím) | viền `--stroke-brand` + quầng brand | như trái |
| Disabled | mờ 45%, không hover | như trái |

```vue
<!-- Medium (32px theo density) — hàng toolbar, page header, card header lớn -->
<button class="btn-icon" type="button" v-tip="'Làm mới'" @click="reload"><TIcon name="refresh" /></button>
<button class="btn-icon btn-icon--outline" type="button" v-tip="'Thêm'"><TIcon name="dots" /></button>
<!-- Small (28px) — trong card, cạnh tiêu đề phần, pager ‹ ›, chevron thu gọn -->
<button class="btn-icon btn-icon--sm" type="button" v-tip="'Thu gọn'"><TIcon name="chevron-up" /></button>
<button class="btn-icon btn-icon--sm btn-icon--danger" type="button" v-tip="'Xóa'"><TIcon name="trash" /></button>
```
⛔ CẤM: `<TIcon @click>` / `<span @click><TIcon/></span>` / `<i @click>` · tự dựng class nút icon riêng (`.card__btn-icon { width:24px… }`, `.xxx-icon-btn`) · `icon-swap--action` cho icon rời (nó chỉ đổi màu, không có nền hover/pressed).
✅ Kể cả **nút Back ←** cạnh tiêu đề, nút **✕ đóng** panel / drawer, ✓/✕ sửa nhanh của `DetailField`, icon thao tác trong dòng bảng → đều là `btn-icon` (style Icon).
✅ Chỉ icon nằm **bên trong** 1 control mới không phải Button Icon: ✕ xóa nhanh / 👁 trong ô nhập (do AppTextbox, AppCombobox… tự vẽ), ✕ trên chip lọc (`icon-swap icon-swap--16 icon-swap--action`), nút tăng giảm Numberbox, nút lọc ở tiêu đề cột. Ngoài ra: sidebar (ngoại lệ cố định px), nút đóng trên toast nền màu.
Nút icon ẩn chỉ hiện khi rê vào card: vẫn là `btn-icon btn-icon--sm`, chỉ thêm class app `opacity: 0` → `.card:hover … { opacity: 1 }` (và `:focus-visible` để dùng được bằng bàn phím).

### D14. ESC đóng lớp trên cùng — `@mds/utils/escStack.js` (quy chuẩn chung)

```js
import { useEscClose } from '@mds/utils/escStack.js'
useEscClose(() => emit('close'))                                       // popup: đóng khi mở
useEscClose(() => { selected.value = null }, () => !!selected.value)   // drawer / panel bật theo điều kiện
```
- **Mọi popup / drawer / panel nổi phải đóng bằng ESC** — bấm ở đâu cũng được (không cần focus trong lớp). Nhiều lớp chồng nhau → ESC đóng lớp mở **sau cùng** (popup trên drawer: ESC lần 1 đóng popup, lần 2 đóng drawer).
- Không dùng `@keydown.esc` trên `<aside>` / khung (chỉ chạy khi focus ở trong) — dùng `useEscClose`.
- Control con tự xử lý ESC (danh sách xổ AppCombobox, DropdownMenu, lịch AppDatebox, sửa tiêu đề inline…) phải `e.stopPropagation()` khi đang mở → ESC chỉ đóng control đó, không đóng popup. AppCombobox / DropdownMenu / AppDatebox đã làm sẵn.
- Đang gõ bộ gõ (IME, `isComposing`) → bỏ qua.

### D15. DataTable — Dòng Tổng (`show-footer`) — quy tắc chung

Áp dụng cho MỌI danh sách có cột số cần xem tổng (điểm, point, số lượng, tiền) — đặc biệt bảng chi tiết trong drawer.

1. **Vị trí theo Figma Data Table (6435:22421):**
   - **Ít dòng** (không phải cuộn) → dòng Tổng bám ngay sau dòng dữ liệu cuối; khoảng trắng còn lại nằm giữa dòng Tổng và Paging.
   - **Nhiều dòng, phải cuộn dọc** → dòng Tổng ghim đáy vùng cuộn, **sát ngay trên Paging** (như header ghim đỉnh) — cuộn vẫn luôn thấy tổng + phân trang.
   - CSS có sẵn trong `style.css`: `.dt-row--footer { position: sticky; bottom: var(--dt-pager-h, 0) }`. Vạch trên vẽ bằng `box-shadow: 0 -1px 0` (không chiếm chỗ → bám sau dòng cuối không thành vạch đôi), có `border-bottom` như dòng cuối. ⛔ Không thêm `border-top`.
   - Phân trang dựng sẵn (`:pagination="true"`, AppPagination nằm TRONG vùng cuộn) → DataTable tự thêm `.datatable--paged`: thanh phân trang ghim đáy, dòng Tổng ghim ngay trên (`--dt-pager-h: 48px`).
   - Kiểm tra: đo ở khung cao (ít dòng: `footer.top == lastRow.bottom`) và khung thấp + cuộn (`paging.top - footer.bottom == 0`).
2. **Bảng phải tự cuộn dọc** thì mới ghim được: bọc trong `.table-scroll`, hoặc trong khung flex cột cho `.datatable { flex: 1 1 auto; min-height: 0 (hoặc ~240px trong drawer); overflow: auto }`. Phần thông tin phía trên + `TablePaging` đứng yên. ⛔ Đừng để cả drawer / trang cuộn còn bảng thì không — dòng Tổng sẽ trôi.
3. **Nhãn “Tổng”:** KHÔNG tự gắn `footerText: 'Tổng'` vào cột nào — DataTable tự đặt ở cột đầu tiên đang hiện (`footer-label` để đổi chữ).
4. **Cộng trên TOÀN BỘ dữ liệu đang xem (đã lọc), không chỉ trang hiện tại** — dùng `sumBy` / `footerTotals` trong `@mds/utils/tableTotals.js`.
5. **Chỉ cộng cột cộng được:** điểm, point, số lượng, tiền. ⛔ KHÔNG cộng %, hệ số, tỷ lệ, ngày, trạng thái (để trống ô footer).
6. **Định dạng** giống ô trong cột (cùng số chữ số thập phân), căn phải như cột số.
   **Giao diện ô = Column Footer (Figma 6624:102337)** — có sẵn trong mds-ui, ⛔ không tự ghi đè:
   - Ô cao `--dt-footer-h` (36 · Nhỏ 32 · Rộng 40), tách khỏi chiều cao dòng thân bảng. Viền dưới 1px `--stroke-neutral` nằm TRONG ô. Đệm ngang 4px, nền `--dt-footer-bg` (Neutral/150).
   - Nội dung (Footer Items) cao `--input-height`, đệm ngang 12px, gap 8px.
   - Chữ 13/20 **Semi Bold** `--text-primary` cho cả nhãn “Tổng” lẫn số (⛔ không Bold 700).
   - Không vạch ngăn giữa các ô footer.
7. **Các màn cùng loại phải có dòng Tổng như nhau** (VD bảng chi tiết điểm PD có thì bảng chi tiết điểm BA cũng phải có).

```js
import { sumBy, footerTotals } from '@mds/utils/tableTotals.js'
// cách 1: tự gắn từng cột
const cols = computed(() => [
  { key: 'pbi',    label: 'PBI', width: 80 },                       // nhãn “Tổng” tự hiện ở đây
  { key: 'point',  label: 'BA Point', align: 'right', footerText: fmt(sumBy(allItems.value, 'baPoint')) },
  { key: 'rate',   label: 'Hệ số tiến độ', align: 'right' },         // % → không cộng
])
// cách 2: gắn hàng loạt
const cols2 = computed(() => footerTotals(BASE_COLS, allItems.value, { point: 'baPoint', actual: 'actual' }, fmt))
```
```vue
<div class="table-scroll" style="flex: 1; min-height: 0">
  <DataTable :columns="cols" :rows="view.paged.value" :show-footer="true" />
</div>
<TablePaging … />
```

### D16. fmtNum / fmtPct / parseNum — định dạng số (TT200, bắt buộc)

```js
import { fmtNum, fmtPct, parseNum, setNumberLocale } from '@mds/utils/number.js'
fmtNum(1163.389)              // '1.163,389'  (mặc định tối đa 3 số lẻ)
fmtNum(12350.5, { decimals: 2, min: 2 })  // '12.350,50'
fmtNum(1500000, { decimals: 0 })          // '1.500.000'
fmtPct(91.5)                  // '91,5%'
parseNum('1.234,5')           // 1234.5  (đọc chuỗi người dùng gõ / dán)
setNumberLocale('en-US')      // app nhiều thị trường: 1,234,567.89
```

- DataTable tự định dạng ô **căn phải** có giá trị `number`; `col.decimals` đổi số lẻ, `col.format: false` giữ nguyên (mã, năm). Ô truyền sẵn chuỗi thì phải tự `fmtNum` trước.
- KPI: `<div class="kpi-num">{{ typeof k.value === 'number' ? fmtNum(k.value) : k.value }}</div>` · dòng Tổng: `footerText: fmtNum(sumBy(rows, 'score'))`.
- ECharts: `tooltip.valueFormatter: v => fmtNum(v)`, `yAxis.axisLabel.formatter: v => fmtNum(v)`.

### D17. AppInlineAlert — thông báo inline trong luồng trang

Thanh thông báo nằm **trong nội dung** (đầu trang / đầu form), không nổi, không tự tắt — dùng cho nhắc việc theo thời điểm, lưu ý quan trọng của màn hình. Thông báo tức thời sau thao tác → dùng `toast()`; lỗi ô nhập → `ErrorTip`.

```vue
import AppInlineAlert from '@mds/components/AppInlineAlert.vue'

<AppInlineAlert type="warning" title="Sắp chốt điểm tháng 10/2026" closable @close="hide">
  Từ ngày 1–5 hàng tháng các quản lý sẽ chốt điểm…
  <template #actions><button class="btn btn--outline btn--sm">Xem việc</button></template>
</AppInlineAlert>
```

| Prop | Ý nghĩa |
|---|---|
| `type` | `info` (mặc định) · `warning` · `success` · `danger` — nền `--bg-*-light`, viền `--stroke-*-light`, icon theo màu type |
| `title` | Tiêu đề in đậm đứng trước nội dung (tùy chọn) |
| `icon` | Tên icon Tabler; bỏ trống → `info-circle` / `alert-triangle` / `circle-check` / `alert-circle` |
| `closable` | Hiện nút × (`.btn-icon--sm`), phát `close` — nơi dùng tự nhớ trạng thái ẩn (VD localStorage theo kỳ) |

Quy tắc: icon, chữ, nút × **căn giữa theo chiều dọc** (box thấp — xem quy tắc “Box / card thấp” trong SKILL.md); đặt làm phần tử **đầu tiên trong `.content-wrapper`** (cuộn cùng trang, cách card bên dưới bằng gap sẵn có); chữ 13px; tối đa 1 thanh mỗi trang; ⛔ không tự vẽ hộp thông báo màu khác. CSS: `.inline-alert*` trong `mds-ui/src/style.css`.

### D18. Thanh cuộn — `detectClassicScrollbars()` (`@mds/utils/scrollbars.js`)

Gọi 1 lần ở `main.js`. Mặc định giữ thanh cuộn hệ điều hành (macOS overlay tự ẩn — không đè CSS). Máy hiện thanh cuộn **cổ điển** (luôn hiện, chiếm chỗ: Windows, macOS “luôn hiện”) → tự gắn `html.classic-scrollbars` → style.css vẽ thanh cuộn **mảnh**: rãnh trong suốt, con trượt bo tròn xám nhạt (`--text-secondary` 32%), đậm hơn khi rê. Không tự viết `::-webkit-scrollbar` riêng ở từng màn.

### D19. OverflowActions — dãy nút tự co, thiếu chỗ thì gom vào ⋯

```vue
<OverflowActions :actions="[{ id: 'pd', label: 'Gán PD', icon: 'user' }, …, { id: 'delete', label: 'Xóa', icon: 'trash', danger: true }]" @select="onAction" />
```
- Đo bề rộng thật từng nút + theo dõi kích thước (ResizeObserver): đủ chỗ → hiện hết; thiếu → hiện các nút đầu theo thứ tự `actions`, phần còn lại vào nút icon ⋯ (DropdownMenu, `danger` = chữ đỏ). Xếp nút quan trọng trước, nguy hiểm (Xóa) cuối.
- Dùng cho thanh thao tác hàng loạt (TableHeader `#bulk-buttons` — vùng này đã `flex: 1; min-width: 0`) và mọi dãy nút có thể tràn.

---

## Phần E — Mẫu email (HTML gửi khách hàng) · trang /ds/email

Áp dụng cho mọi email MISA gửi khách hàng. Mẫu code sẵn ở phần **Ví dụ trực quan** (MISA chung · Nền tảng · Ứng dụng trong nền tảng · Khách hàng gửi khách của họ) — sao chép mã HTML rồi chỉ sửa vùng “NỘI DUNG EMAIL”.

### E. Khung và khoảng cách

| Thành phần | Máy tính | Điện thoại (màn ≤ 620px) |
|---|---|---|
| Nền ngoài | xám #ECEDEF (BG/Page) | xám #ECEDEF |
| Lề ngoài quanh thẻ trắng | trên 60px · hai bên 10px | trên 16px · hai bên **8px** (để vẫn thấy thẻ bo góc) |
| Thẻ trắng (`.email-card`) | rộng cố định **600px**, căn giữa | rộng 100% màn hình trừ 8px mỗi bên |
| Lề nội dung trái / phải (header, nội dung, dòng ghi chú) | **40px** | **16px** — tối ưu chỗ cho chữ |
| Khoảng trên header logo | 24px | 24px |
| Khối có viền trong nội dung (chi tiết đơn hàng, thông tin tài khoản, banner) | đệm 24–32px | đệm **16px** |
| Footer (bản quyền, địa chỉ, website) | đệm 12px trên · 32px dưới | đệm 12px · hai bên 16px · dưới 24px |

### E. Bo góc

| Thành phần | Bo góc |
|---|---|
| Thẻ trắng `.email-card` | **8px** — cả máy tính và điện thoại (không bỏ bo góc trên mobile) |
| Khối có viền trong nội dung (viền #99C5F7 liền / nét đứt) | **8px** |
| Nút hành động (Thanh toán ngay, Kích hoạt ngay…) | 8px |
| Logo ứng dụng vuông (VD Quy trình) | 8px (đã vẽ sẵn trong ảnh) |

Thẻ trắng có bóng rất nhẹ `0 0 2px rgba(0,0,0,0.10)` để tách khỏi nền xám.

### E. Chữ

- Nội dung 14/20 màu #10141B; chữ phụ 13/20 màu #6B707A; footer 12/16 màu #6B707A; link #1570EF không gạch chân.
- Dòng “* Đây là email tự động từ hệ thống, Quý khách vui lòng không phản hồi.” luôn đặt **cuối nội dung**, chữ nghiêng 13px màu phụ.
- Footer cố định cho mọi email: © 1994 - năm hiện tại MISA JSC · địa chỉ · Website **www.misa.vn** · Email support@misa.com.vn.

### E. Header logo

- MISA chung: chỉ logo MISA · Nền tảng: logo + tên nền tảng · Ứng dụng: logo nền tảng bên trái | logo + tên ứng dụng bên phải.
- Logo **và tên ứng dụng gộp thành 1 ảnh PNG @2x** (VD hiển thị 338×32 thì file 678×64): người đọc tăng cỡ chữ trên điện thoại thì header giữ nguyên, chỉ chữ nội dung to lên.
- Ảnh logo responsive: `width` = cỡ hiển thị 1x, style `max-width:100%; height:auto` → màn hẹp tự thu nhỏ, không tràn khung.
- Luôn có `alt` (VD “MISA AMIS – Quy trình”) để vẫn đọc được khi ứng dụng mail chặn ảnh.

### E. Email khách hàng của MISA gửi cho khách của họ (hóa đơn, biên bản, phiếu… — VD MISA meInvoice) · mẫu `khachhang.html`

Khung, lề, bo góc, chữ, nút, giới hạn ứng dụng mail **giống các mẫu trên**, khác 2 chỗ:
- **Không có header logo** (không logo MISA, không logo công ty, không logo ứng dụng) — email mang danh đơn vị khách hàng:
  - Đơn vị **đã tự cấu hình mẫu** (logo / banner riêng) → dùng phần đầu của họ.
  - **Chưa cấu hình** → ứng dụng tự dùng **banner tiêu đề**: nền xanh sóng (ảnh nền `banner-bg.jpg` + gradient Figma #116ADD → #6CA7F4 + sóng trắng mờ gộp sẵn trong ảnh @2x; màu nền dự phòng #116ADD cho Outlook), chữ trắng 20/28 đậm “[Tên đơn vị] thông báo gửi [loại chứng từ] cho Quý khách”, đệm 32px trên dưới · 40px hai bên (điện thoại 24 / 16, chữ 18/26).
- **Footer chỉ 1 dòng** (thay bản quyền / địa chỉ MISA): “Thông báo được gửi qua **[Tên sản phẩm]** - Một sản phẩm của **MISA**.” — [Tên sản phẩm] in đậm, link tới website sản phẩm (VD www.meinvoice.vn); “MISA” link tới **www.misa.vn**. Chữ 12/16 màu #6B707A, link #1570EF.
- **Mẫu footer dùng cho MỌI sản phẩm** (chỉ thay [Tên sản phẩm] và link): 
  `Thông báo được gửi qua <a href="[website sản phẩm]"><b>[Tên sản phẩm]</b></a> - Một sản phẩm của <a href="https://www.misa.vn">MISA</a>.`
  VD: “Thông báo được gửi qua **AMIS Quy trình** - Một sản phẩm của MISA.” · “… qua **AMIS Công việc** …” · “… qua **AMIS Kế toán** …” · “… qua **MISA meInvoice** …” — [Tên sản phẩm] link tới website của chính sản phẩm đó (hỏi đội sản phẩm lấy đúng địa chỉ, không tự bịa), “MISA” luôn link www.misa.vn.
- Khối thông tin chứng từ: nền #EFF4FF + viền 1px #99C5F7, bo 8, đệm 16/24, các dòng con thụt 24px (điện thoại 12px); không bóng đổ.
- Ký tên cuối thư bằng **tên đơn vị gửi** (in đậm), không “Công ty Cổ phần MISA”; không cần dòng “* Đây là email tự động…” nếu đơn vị không yêu cầu.

### E. Lưu ý giới hạn của các ứng dụng email

- **Không dùng ảnh SVG**: Gmail (web và app) và Outlook Windows không hiển thị SVG → dùng **PNG @2x** (hoặc JPG cho ảnh chụp).
- **Nền xám ngoài cùng đặt ở bảng ngoài cùng** (`<table … bgcolor="#ecedef" style="background-color:#ecedef">` + ô `email-outer` cũng vậy), không chỉ ở `<body>`: Gmail bỏ toàn bộ style / thuộc tính của `<body>` → nền xám mất, thẻ trắng nằm trên nền trắng. Trang /ds/email có chế độ xem **Như Gmail** để soát.
- **Không dùng JavaScript** (`<script>`): mọi ứng dụng mail đều chặn. Năm bản quyền, tên khách hàng… phải do hệ thống gửi mail điền sẵn.
- **Bố cục bằng `<table role="presentation">`**, không dùng flex / grid / position — Outlook dùng bộ hiển thị của Word, chỉ hiểu bảng.
- **CSS viết inline** trên từng thẻ (`style="…"`); khối `<style>` chỉ để chứa `@media` cho điện thoại (Gmail app có thể bỏ khối `<style>` → email vẫn đọc được ở bố cục máy tính co lại).
- Outlook Windows **không hiện bo góc, bóng đổ, `max-width`, gradient** → thiết kế vẫn phải ổn khi mất các hiệu ứng này (banner gradient cần màu nền đơn dự phòng).
- **Ảnh phải là đường dẫn tuyệt đối** `https://…` trên máy chủ công khai; đường dẫn tương đối `images/…` chỉ dùng khi xem thử.
- Font web (Inter) nhiều ứng dụng không tải → luôn khai báo dự phòng `font-family: Inter, Arial, sans-serif`.
- Chuỗi dài không có khoảng trắng (email, link) cần `word-break: break-word` để không đẩy tràn khung trên màn hẹp.
- Thêm `-webkit-text-size-adjust:100%` cho body để iPhone không tự phóng chữ khi xoay ngang.
- Nút hành động dùng thẻ `<a>` có nền + đệm + bo góc (không dùng `<button>`, không dùng ảnh làm nút).

## Checklist trước khi báo xong

- [ ] Không còn mã màu, `box-shadow`, `border-radius`, `gap` gõ tay — tất cả là token.
- [ ] Khối trắng trên nền trang: bo 8px + `--shadow-card`, không viền, đệm 16px đều.
- [ ] Menu xổ ra: `--menu-radius` (8 · Nhỏ 6) + `--shadow-popover`, không viền, đệm 8px, item 32px xếp sát nhau, ngăn nhóm bằng Divider 1px cách 4px. Popover dạng thẻ (lịch, lọc cột, hồ sơ): `--radius-dialog` + `--shadow-popover`.
- [ ] Menu con sidebar: xổ sang phải sát mép sidebar (0px), item đầu thẳng hàng mục sidebar.
- [ ] Card cách card 16px; control rời cạnh nhau cách 8px (component đã đóng theo Figma của nó); lề nội dung 16px.
- [ ] Không viền đôi: `double-border-check.js` → `window.__doubleBorders(sel)` = `[]` ở mọi trạng thái (thu gọn / mở rộng / hover / đang chọn / tối).
- [ ] Chiều cao nút / ô nhập theo `--btn-height` / `--input-height`; thử đủ 3 mật độ.
- [ ] Mọi icon rời bấm được là `btn-icon`; mọi thứ bấm được có hover rõ ràng.
- [ ] Chữ nội dung 13px; chữ phụ `--text-secondary`; chữ brand dùng `--text-brand` (đổi theme thử).
- [ ] Dòng bảng có 2 dòng chữ = 56px (đo thật); tiêu đề cột không bị cắt.
- [ ] Avatar chỉ dùng 9 cỡ chuẩn, qua `AppAvatar`.
- [ ] Menu dọc cạnh Sidebar dùng Sub Menu; chữ dài 1 dòng + "…" + tooltip.
- [ ] Số hiển thị qua `fmtNum` / `fmtPct`.
- [ ] Mở mọi popup / dropdown ở dữ liệu dài nhất, bề rộng 1366px và 375px: không tràn, không nhảy bố cục.

---

---

---

---

## Phụ lục — `overflow-check.js`

Dán vào trang (Playwright `page.addScriptTag({ content })` hoặc DevTools) rồi gọi `window.__overflow('<selector khung>')` → phải trả `[]`; `window.__layoutKey(sel)` để so vị trí giữa các trạng thái.

```js
/* ═══ Dò phần tử TRÀN KHỎI KHUNG (popup, dropdown, dialog, card, header…) — dùng khi test bằng Playwright ═══
   page.addInitScript(fs.readFileSync('overflow-check.js', 'utf8'))
   rồi: await page.evaluate(() => window.__overflow('.bell-pop'))  → [] là đạt; có phần tử → in tên + số px vượt
   Bỏ qua phần tử ẩn và phần tử nằm trong vùng cuộn của chính nó (overflow auto/scroll/hidden). */
// Dò phần tử tràn khỏi khung chứa: trả về danh sách phần tử con có cạnh vượt ra ngoài container (bỏ qua phần tử ẩn / nằm trong vùng cuộn)
window.__overflow = sel => [...document.querySelectorAll(sel)].flatMap(box => {
  const B = box.getBoundingClientRect()
  return [...box.querySelectorAll('*')].filter(el => {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false
    let p = el.parentElement; while (p && p !== box) { const o = getComputedStyle(p); if (/(auto|scroll|hidden)/.test(o.overflowX + o.overflowY)) { const pr = p.getBoundingClientRect(); if (r.right > pr.right + 1 || r.left < pr.left - 1) return false } p = p.parentElement }
    return r.right > B.right + 1 || r.left < B.left - 1
  }).map(el => `${sel} › ${el.className || el.tagName} "${(el.innerText || '').trim().slice(0, 30)}" vượt ${Math.round(Math.max(el.getBoundingClientRect().right - B.right, B.left - el.getBoundingClientRect().left))}px`)
})

// Khóa vị trí bố cục: so sánh giữa các lần bấm tab / đổi trạng thái — phải giống hệt (không nhảy)
// VD: const k = []; for (const t of tabs) { await click(t); k.push(await page.evaluate(() => window.__layoutKey('.bell-pop__tabs', '.bell-pop__list'))) }; new Set(k).size === 1
window.__layoutKey = (...sels) => sels.map(s => { const r = document.querySelector(s)?.getBoundingClientRect(); return r ? [r.top, r.left, r.width, r.height].map(Math.round).join(',') : 'x' }).join(' | ')
```

## Phụ lục — `double-border-check.js`

File gốc: `Claude/.claude/skills/mds-webapp-developer/references/double-border-check.js` (bản sao dưới đây).

```js
/* ═══ Dò VIỀN ĐÔI (double border) — 2 đường viền 1px nằm sát nhau thành vạch dày 2px ═══
   page.addInitScript(fs.readFileSync('<skill>/references/double-border-check.js', 'utf8'))
   rồi: await page.evaluate(() => window.__doubleBorders('.sidebar'))  → [] là đạt; có phần tử → in cặp bị trùng + cạnh
   Bắt 2 kiểu:
   · Con – cha: viền của phần tử con nằm sát viền CÙNG CẠNH của phần tử cha (VD nút trong sidebar có border-right, sidebar cũng có border-right)
   · Kề nhau: viền phải của A chạm viền trái của B (hoặc dưới A – trên B) — VD 2 ô / 2 card đặt sát nhau mỗi cái 1 viền
   Không tính: phần tử ẩn, viền trong suốt, box-shadow, và viền ĐÈ LÊN nhau có chủ đích (margin âm để phủ vạch — VD tab đang chọn). */
window.__doubleBorders = (sel = 'body') => {
  const SIDES = ['top', 'right', 'bottom', 'left']
  const has = (cs, s) => parseFloat(cs[`border-${s}-width`]) > 0 && cs[`border-${s}-style`] !== 'none' && !/rgba\([^)]*,\s*0\)|transparent/.test(cs[`border-${s}-color`])
  const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0' }
  const name = el => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`
  const edge = (r, s) => ({ top: r.top, right: r.right, bottom: r.bottom, left: r.left })[s]
  const out = []
  for (const root of document.querySelectorAll(sel)) {
    const els = [root, ...root.querySelectorAll('*')].filter(vis)
    for (const el of els) {
      const cs = getComputedStyle(el), r = el.getBoundingClientRect()
      // 1) Con – cha cùng cạnh: mép ngoài của con trùng mép TRONG viền của cha (cha có viền cạnh đó)
      for (let p = el.parentElement, depth = 0; p && depth < 4; p = p.parentElement, depth++) {
        const pcs = getComputedStyle(p), pr = p.getBoundingClientRect()
        for (const s of SIDES) {
          if (!has(cs, s) || !has(pcs, s)) continue
          const bw = parseFloat(pcs[`border-${s}-width`])
          const inner = s === 'top' || s === 'left' ? edge(pr, s) + bw : edge(pr, s) - bw
          // chỉ tính khi con trải dọc / ngang theo cạnh đó (không phải 1 điểm chạm)
          const along = s === 'top' || s === 'bottom' ? Math.min(r.right, pr.right) - Math.max(r.left, pr.left) : Math.min(r.bottom, pr.bottom) - Math.max(r.top, pr.top)
          // Nằm SÁT bên trong viền cha (mép con = mép trong viền cha) → 2 vạch liền nhau = viền đôi.
          // Đè LÊN viền cha (mép con = mép ngoài cha, VD gạch chân tab đang chọn phủ vạch đáy thanh tab) → cố ý, không tính.
          if (Math.abs(edge(r, s) - inner) <= 0.5 && along > 8) out.push(`${name(el)} viền ${s} trùng viền ${s} của ${name(p)}`)
        }
        if (p === root) break
      }
    }
    // 2) Kề nhau: A.right ≈ B.left (cùng có viền) hoặc A.bottom ≈ B.top, có đoạn chồng lên nhau > 8px
    for (let i = 0; i < els.length; i++) for (let j = 0; j < els.length; j++) {
      if (i === j) continue
      const a = els[i], b = els[j]
      if (a.contains(b) || b.contains(a)) continue
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(), ca = getComputedStyle(a), cb = getComputedStyle(b)
      if (has(ca, 'right') && has(cb, 'left') && Math.abs(ra.right - rb.left) <= 0.5 && Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top) > 8) out.push(`${name(a)} viền phải chạm viền trái ${name(b)}`)
      if (has(ca, 'bottom') && has(cb, 'top') && Math.abs(ra.bottom - rb.top) <= 0.5 && Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left) > 8) out.push(`${name(a)} viền dưới chạm viền trên ${name(b)}`)
    }
  }
  return [...new Set(out)]
}
```

### Thi công font chữ Inter (tránh mất dấu chữ HOA tiếng Việt) — chi tiết ở trang /ds/typography (tránh mất dấu chữ HOA tiếng Việt)

Lỗi hay gặp: chữ HOA có **dấu chồng** như “CÔNG TY CỔ PHẦN”, “Ỷ”, “Ẩ”, “Ỗ”, “Ầ” bị **cụt dấu hỏi / huyền / ngã** ở ô nhập, nút, tag, ô bảng bị cắt “…”. Dấu chồng của chữ HOA nằm **cao hơn** khung chữ thường. Chỗ nào **cắt nội dung** (`overflow: hidden`, ô nhập, chiều cao cố định) mà **line-height thấp** thì phần dấu bị cắt mất. Làm đủ 7 bước dưới đây. Dùng mds-ui thì bước 1–4 đã có sẵn trong `style.css`, chỉ cần không ghi đè sai.

**Bước 1 — Tự host font Inter bản đầy đủ (có tiếng Việt)**

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

Nạp sớm để không bị nháy font (đặt trong `<head>` của `index.html`, đường dẫn là file sau khi build):

```html
<link rel="preload" href="/assets/InterVariable.woff2" as="font" type="font/woff2" crossorigin>
```

**Bước 2 — Khai báo font cho toàn trang, ô nhập và lớp nổi**

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

**Bước 3 — Luôn dùng cặp token cỡ chữ + chiều cao dòng**

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

**Bước 4 — Ô nhập: chiều cao của `<input>` = chiều cao dòng**

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

**Bước 5 — Chữ một dòng bị cắt “…”**

`overflow: hidden` cắt luôn cả phần dấu nhô lên. Giữ chiều cao dòng theo token. Nếu khối buộc phải thấp (tag, chip) thì canh giữa bằng `display: inline-flex; align-items: center` và **không** đặt `line-height` nhỏ hơn token.

```css
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: var(--text-body-lh); }
.tag { display: inline-flex; align-items: center; height: 24px; padding: 0 8px; line-height: var(--text-body-lh); }
```

**Bước 6 — Chuẩn hóa dữ liệu tiếng Việt về NFC**

Dữ liệu dán từ Word, Excel hay máy Mac đôi khi ở dạng **tổ hợp** (NFD): chữ và dấu là 2 ký tự riêng. Khi đó dấu chồng hiển thị lệch, so sánh và tìm kiếm cũng sai. Chuẩn hóa khi nhập liệu và khi nhập file:

```js
const clean = s => String(s ?? '').normalize('NFC').trim()
// Ô nhập: lưu clean(value) · nhập Excel/CSV: clean() từng ô · tìm kiếm: so sánh clean(a) với clean(b)
```

**Bước 7 — Kiểm tra trước khi bàn giao**

Dán chuỗi thử dưới đây vào **ô nhập, nút, tag, ô bảng bị cắt “…”, tiêu đề popup**:

```
CÔNG TY CỔ PHẦN MISA — Ỷ Ẩ Ỗ Ầ Ở Ễ Ữ Ậ — công ty cổ phần
```

- Xem ở cả 3 mật độ **Nhỏ / Trung bình / Rộng**: Nhỏ có ô thấp nhất nên dễ lỗi nhất.
- Chrome, Edge, Safari, Firefox; Windows ở tỉ lệ màn hình 100% và 125%.
- Mọi dấu hỏi, ngã, huyền trên chữ HOA phải hiện đủ, không bị cắt ngang. Khi gõ trong ô, vùng bôi đen cách viền ô 4px trên dưới.
- Lỗi đã gặp (2026-11-05): `.app-tag` đặt `line-height: 1` + nhãn `overflow:hidden` → “CỔ PHẦN Ở Ễ” thành “CÕ PHĂN Ơ Ê”; ô sửa trực tiếp của bảng (`.dt-input`) để `line-height: normal`. Đã sửa trong mds-ui: tag dùng `--text-body-lh`, `.dt-input` line-height = `--btn-height − 2px` + `text-overflow: ellipsis`. Trang /ds/typography có khối **Thử trực tiếp** (`::: demo font-check`) để soát lại.
- Đo thật trên Chrome (2026-11-05): **placeholder luôn cụt dấu** → mds-ui có `input::placeholder { padding: 4px 0; margin: -4px 0 }`; **input có viền tự thân** phải `line-height` = cả chiều cao ô. **Ô sửa trực tiếp trên DataTable dùng control chuẩn** `AppTextbox` / `AppNumberbox` / `AppCombobox` với prop `ghost` (class `.dt-ctl`: rê dòng viền Neutral, rê / focus viền Brand, lỗi viền đỏ + icon qua DtCellError) — ⛔ không tự dựng `<input class="dt-input">` (chỉ còn ô nhiều dòng `dt-textarea`).
- Rà toàn bộ /ds + app Chấm điểm (2026-11-05): chữ có cắt “…” / `overflow:hidden` mà `line-height` thấp (tên app header 20/20, `line-height: normal`, tiêu đề H3 16/22) → thêm `line-height` theo token + `padding-block: 2px; margin-block: -2px` (nới vùng cắt, bố cục không đổi); khối `-webkit-line-clamp` chỉ nới phía trên (`padding-top: 2px; margin-top: -2px`). Ô tìm kiếm header (`.search-box-header input`) đặt `height` = `line-height` = `--input-height − 8px` như `.ibox__native`.

## Phần F — Thuật ngữ CSS (giải thích cho người không làm code) · trang /ds/css-terms

Khi trả lời về thông số giao diện: giữ tên thuộc tính CSS chuẩn (Padding, Margin, Gap, Border, Border radius, Font size, Line height, Font weight…), giải thích bằng tiếng Việt. Công cụ **Đo** (nút “Đo” trên thanh mỗi khung ví dụ ở /ds) hiện các thông số này khi rê chuột.

### F. Bảng thuật ngữ

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

### F. Công cụ **Đo** — xem chi tiết thông số ngay trên trang tài liệu /ds
Khi người dùng hỏi thông số của một control / màn mẫu (cao bao nhiêu, Padding, Border radius, màu gì, cách nhau bao xa…) → ngoài trả lời, **giới thiệu họ tự đo**:
1. Mở trang tài liệu của control (VD /ds/button, /ds/text-field, /ds/layout), tới khung **Ví dụ trực quan**.
2. Nút **Đo** trên thanh trên cùng của khung ví dụ (cạnh Màu nền, Mật độ, Font size, Xem code) — **mặc định đã bật** ở mọi trang; không thích thì bấm **Tắt đo** (trình duyệt nhớ lựa chọn cho mọi trang).
3. Rê chuột lên phần tử bất kỳ: khung xanh + **Size**, vùng xanh lá = **Padding**, đường đứt đỏ có số = khoảng cách tới phần tử bên cạnh / mép khung cha (**Gap**). Thẻ thông số hiện Font, Font size / Line height, Font weight, Color, Background, Border, Border radius, Padding (từng phía), Gap, Box shadow… **kèm tên token** (`--btn-height`, `--bg-brand`, `--radius-default`…) — giá trị không có token là đang viết số cứng.
4. Phím: **Alt + bấm** ghim thẻ · **↑** chọn phần tử cha (VD từ chữ trong ô lên cả khung ô) · **↓** quay lại · **Esc** tắt. Bấm thường vẫn dùng control → mở popup, menu, dialog, bảng chọn ngày rồi đo tiếp được; đo được cả email trong khung xem trước.
5a. Đo **chỉ áp vào vùng hiển thị mẫu** — bỏ qua phần tham số của khung ví dụ (ô chọn kiểu, bộ màu, checkbox tuỳ chọn, nhãn mô tả). Dev thêm khối tham số mới trong demo thì gắn `data-dsi-ignore` (hoặc dùng `.demo-seg`).
5. Ô **Giải thích** (mặc định tắt cho thẻ gọn — thẻ thông số có dòng nhắc tick vào khi cần) bật dòng giải thích ngắn dưới mỗi thông số; link **Thuật ngữ CSS** mở trang /ds/css-terms.
6. Khung bố cục trang bị thu nhỏ: cuối thẻ có lưu ý “Khung xem đang thu nhỏ còn N%” — **Size / khoảng cách đã quy đổi về kích thước thật**, số đo đúng quy chuẩn. **Xem toàn màn hình** cũng có nút **Đo / Tắt đo** + ô **Giải thích** ở góc trên phải.
Đổi **Mật độ** / **Font size** ở thanh khung ví dụ trước khi đo để xem thông số ở từng mode.

## Panel phải (Chat AI Agent · AMIS Chat · Trợ giúp)

Quy chuẩn chung cho cửa sổ chat agent ([/ds/chatbox-ai-agent](/ds/chatbox-ai-agent)), AMIS Chat và panel Trợ giúp ([/ds/help](/ds/help)):
- Panel nằm **bên phải, dưới UI của app** — **đẩy giao diện app sang trái, KHÔNG đè lên nội dung**; cao hết màn hình (ngang hàng header app).
- Rê chuột vào cạnh trái panel → tay kéo chuẩn `.drawer-resize` của mds-ui (`v-resizable-drawer`, truyền `maxRatio: 0.5`): vạch Stroke/Brand 2px + nút tròn ↔ (`.drawer-resize__knob`), nhấp đúp về mặc định; kéo để đổi rộng: **tối thiểu 350px**, **tối đa 50% màn hình** (bàn phím ← / → cũng chỉnh được, `role="separator"`). Mặc định mở 400px.
- App bên trái co **tối thiểu 1024px**; hẹp hơn → **thanh cuộn ngang LUÔN hiện** dưới cùng vùng app (style scrollbar riêng, không để overlay tự ẩn).
- Chỉ **1 panel** tại một thời điểm, chung vị trí: avatar agent trên header → Chat agent; logo AMIS Chat → AMIS Chat; **? › Hướng dẫn sử dụng (F1)** (hoặc phím F1) → Trợ giúp. Đang mở Chat AVA mà mở Trợ giúp → **ẩn Chat AVA, hiện Trợ giúp**.
- Header panel 56px: (Quay lại) · avatar / icon · tên + dòng phụ · ⋯ · Đóng. Agent: tên + tag Beta, mascot + lời chào, câu hỏi gõ dần (typing, chữ gradient Brand → tím), gợi ý dạng nút outline cuộn ngang, ô nhập (+ tải tệp/ảnh · micro · nút gửi tròn `--ai-grad-600`) — **viền ô nhập chat AI = AI Primary `--ai-grad-600`** (như AppAiSearchbox; rê → AI 700, focus thêm quầng AI); ô nhập AMIS Chat (chat với người) dùng viền thường. Chữ lời chào gõ dần = gradient AI Primary. Dòng phụ dưới tên agent ngắn gọn (VD “Trợ lý AI”) để không vỡ header. Tên / avatar / mascot agent tuỳ biến theo sản phẩm.
- Trợ giúp = component **`AppHelpPanel`** (mds-ui, Figma MDS “Help Frame” 51535:79812), rộng mặc định **500**: header 48 (tiêu đề H3 · ↗ mở cửa sổ mới · ✕) → ô tìm “Tìm kiếm câu hỏi, từ khóa hoặc chủ đề” trên nền Neutral/100 (đệm 12/20) → nội dung bài viết = **slot**, tự cuộn (đệm 16/20, cách 16; class `.help-article__title` H1 · `__media` ảnh/video rộng hết · `__text` · `__links` danh sách link chấm tròn màu `--text-link-default`) → chân 44 “Kênh hỗ trợ” + icon kênh 20 cách 20 (prop `channels`, `@channel`) + ^ lên đầu bài. Bóng Left 8, **không viền trái**.
  - **2 biến thể, chọn theo header app:** `variant="default"` (header trắng) cho app **header màu** · `variant="brand"` (header nền Brand, chữ/icon trắng) cho app **header trắng** → `:variant="currentMode === 'light' ? 'brand' : 'default'"`. ⛔ Không tự thêm “Vẫn cần hỗ trợ?”, danh sách thẻ bài viết… — Figma không có.
- **Cửa sổ chat AI Agent** (Figma MÔ TẢ QUY CHUẨN “AVA Default” 782:72148): rộng mặc định **350** · header **60** (đệm ngang 16, icon ‹ ⋯ ✕ cỡ **24**, avatar 32 nền `--ai-grad-300` viền trong trắng 80%, tên **Body Bold** màu gradient AI `.text-ai-primary` + `AppTag size="sm"` “Beta”, dòng phụ Body Small 12 Text Secondary) · lời chào **sát trên** (cách header 16 + 24): ảnh agent 173×176 có lớp mờ trắng ở chân → cách 20 → “Xin chào …” Body Large → câu hỏi H2 gradient AI gõ dần · gợi ý nút outline neutral 1 hàng (tràn thì cuộn ngang) · ô nhập đệm 12, bo 12 (`--radius-dialog`), viền gradient AI, **không bóng** (đã có viền): + tròn 24 nền Neutral/200 · chữ gợi ý Text Hint · micro tròn 24 icon màu AI · gửi tròn 24 nền `--ai-grad-300` (chưa gõ) → `--ai-grad-600` (đã gõ), icon `location-filled` trắng.
- Nội dung bài Trợ giúp (slot `AppHelpPanel`): `.help-article__head` (H1 + `__meta` Body Small) · `__lead` · `__figure` (`__media` bo 8 + `__caption`) · `__section` (`__h` H3 + `__count`) · `__links` link dạng dòng icon + chữ, rê nền Brand Light · khối lưu ý = `AppInlineAlert type="info"`.
- Mẫu sống: component `SidePanelFrame` (mds-docs/src/demos/layout) — demo `chatbox-agent`, `help-panel`.

## Loading — khung xương
- Chuyển trang: header + sidebar giữ nguyên, chỉ vùng nội dung tải. Màn có bố cục cố định (Tổng quan…) → khung xương nằm **trong chính các thẻ thật**, phần tĩnh hiện luôn, mỗi dòng cao đúng line-height chữ thật → tải xong không giật (đo vị trí thẻ lúc tải và lúc xong phải trùng). `PageSkeleton` chỉ khi chưa có khung trang.
- Combo / dropdown tải dữ liệu khi mở: `AppCombobox :loading` + `@open` → **vòng xoay nhỏ (spinner) giữa danh sách** — KHÔNG dùng khung xương cho combo. Spinner dùng chung `.spinner` (40 · viền 3) / `.spinner--sm` (20 · viền 2, trong control); nút đang xử lý: vòng xoay thay chỗ chữ, giữ bề rộng. Ví dụ sống: /ds/loading.

## Xử lý tiến trình (chạy ngầm) — /ds/background-tasks
- Thao tác người dùng bấm mà mất > 10 giây hoặc không rõ thời gian (nhập / xuất khẩu nhiều bản ghi, cập nhật hàng loạt, tổng hợp báo cáo) → chạy ngầm trên máy chủ + `AppTaskTray` góc dưới phải. 1–4 giây: spinner tại chỗ; 4–10 giây: thanh tiến độ trong popup.
- Bắt đầu: đóng popup + toast “Đã bắt đầu … Bạn có thể tiếp tục làm việc — hệ thống sẽ báo khi xong.” · Xong: khay mở thì chỉ đổi dòng; khay thu gọn / đóng thì toast có nút (Tải xuống / Xem / Tải file lỗi) + mục Thông báo.
- Dòng trong khay: tên tiến trình **Semi Bold**, dòng phụ Body Small Secondary, không vạch ngăn giữa các dòng. Dòng Thành công / Xong một phần bấm cả dòng = nút chính (hover Brand Light, thụt 8); Đang chạy / chờ / hủy / Lỗi không bấm dòng (Thử lại chỉ qua nút ↻).
- **Icon Tiến trình (`loader-2`, đứng yên) trên Global Header:** chỉ hiện khi khay còn dòng (đang chạy / chờ / xong chưa ẩn), đầu cụm icon trước MISA AI (`#header-actions`). Badge: đang chạy → số (`.header-badge` đỏ chuẩn như Thông báo) · hết chạy + có Lỗi / Xong một phần chưa xem → chấm đỏ (`.header-badge--dot`) · chỉ còn thành công → không badge · khay trống → ẩn icon. Bấm: khay ẩn / thu gọn → mở rộng; đang mở rộng → ẩn. Mở rộng khay = đã xem (tắt chấm). F5: hiện lại nếu còn chạy / kết quả chưa xem trong 24 giờ, khay thu gọn.
- Hủy dòng đang chạy: AppAlertDialog danger nêu hậu quả. Đóng khay khi còn chạy: không hỏi, toast “vẫn chạy ngầm”. Nhập khẩu có dòng lỗi: nhập phần hợp lệ → “Xong một phần” + Tải file lỗi (file gốc chỉ còn dòng lỗi + cột Lý do lỗi). File xuất giữ 7 ngày. Trạng thái lưu máy chủ — F5 / máy khác vẫn thấy.

## Data table — lọc theo cột liên thông bộ lọc Advance
- Lọc 1 cột trên tiêu đề và bộ lọc Advance bên phải là **cùng một bộ điều kiện**: lọc cột → panel tự tick trường + đúng toán tử / giá trị, tag + số đếm cập nhật; lọc / bỏ ở panel hoặc tag → tiêu đề cột tự hiện / bỏ đang lọc. Code: `DataTable v-model:filter="adv" :filter-fields="FIELDS"` + `TableFilterPanel :filter="adv"`; popover cột và panel dùng chung `FilterConditionEditor`; cột ↔ trường qua `col.filterKey ?? col.key`.

## Bắt đầu sử dụng (Onboarding) — /ds/onboarding-start · `AppOnboarding`
- Điểm vào: nút chữ Brand “▷ Bắt đầu sử dụng” góc phải dải tab màn Tổng quan (`.sub-nav-right`) · lần đầu đăng nhập tự mở 1 lần · popup đóng mà còn việc → nút nổi góc dưới trái + số việc còn lại (badge đỏ), xong hết thì ẩn.
- Popup 1032, bo 12: header H2 “Xin chào, Tên 👋” + mô tả · trái nền **BG/Page** đệm 32 (bước đã xong nền **BG/Neutral Lighter** `--bg-neutral-lighter` — sáng hơn BG/Page một nấc): H3 + Segmented Cơ bản / Nâng cao + % tổng, các bước accordion (viền Stroke/Neutral, bo 8, đệm 16; bước tiếp theo viền Brand + tooltip “Tiếp tục”; đang mở tiêu đề Brand; xong nền BG/Neutral Lighter + thanh xanh) · phải 360 trắng: Hướng dẫn sử dụng + Kênh hỗ trợ (mục cao 44, icon 20 có màu).
- Việc = link Brand + ô video 64×40; **bấm việc = tính xong** → đóng popup, tới đúng màn làm thật, hộp Success + “Tiếp tục” mở lại popup ở bước kế. Icon đầu bước = icon riêng của bước (Icon Swap, `step.icon`, tuỳ chọn `show-icons`), Icon/Neutral (kể cả đã xong), **bước đang mở: icon Brand cùng tiêu đề** — KHÔNG phải ô tick; mục Chat với AVA dùng icon MISA AI của Global Header (`icon: 'misa-ai'`); **Đánh dấu hoàn thành cả bước** = nút chữ cuối thân bước → tự mở bước tiếp theo. Ô tròn bên phải mỗi **nhóm** (Hàng hóa, Khách hàng…) là **checkbox**: tick = xong mọi việc trong nhóm (`@group-done`). Nút nổi **kéo thả được** khắp màn hình, nhớ vị trí, kéo không tính là bấm.
- Màu chỉ dùng token ngữ nghĩa (BG/, Stroke/, Text/, Icon/ — có `--icon-ai` cho icon AI), không chép mã màu bảng gốc từ Figma.

## Empty state màn Tổng quan nhiều card (/ds/empty-state › Màn Tổng quan)
- ⛔ Không đặt hình minh họa trong từng card. Card trống giữ nguyên khung, tiêu đề, **chiều cao**; vùng biểu đồ = **khung biểu đồ rỗng**: cột / đường → lưới mảnh (nét đứt Stroke/Neutral Light, trục Stroke/Neutral) + nhãn trục thật (T1…T12, Text/Hint) + **biểu đồ thu nhỏ trang trí**: cột mảnh 10px thấp ≤ 36% (BG/Neutral Hover) / 1 đường mảnh — nằm dưới lời nhắn; donut → vòng rỗng BG/Neutral Hover, giữa “0 <đơn vị>”; thanh ngang → tên dòng thật + rãnh rỗng có đoạn ngắn xám nhạt + “0” · lời nhắn 1 dòng Text/Secondary nói đúng cái thiếu + kỳ (“Chưa có doanh thu trong tháng này”) — **chỉ thông báo, không link / nút hành động trong card**, không đóng khung, không khối xám to.
- Thẻ KPI: hiện **0** + “Chưa phát sinh trong <kỳ>”, ẩn so sánh kỳ trước — không empty state trong KPI. Card danh sách xếp hạng: 5 dòng mờ (số thứ tự · avatar tròn BG/Neutral Hover · vạch tên BG/Neutral Light · “0”) + lời nhắn dưới.
- Hình minh họa = component **`EmptyArt`** (SVG, token màu; props `variant` doc | cleared | search | chart, `:width` px — cao = 0,8 × rộng): cùng 1 bố cục **hình chính** (thẻ chứng từ / biểu đồ) + **hình phụ** huy hiệu tròn góc dưới phải (+ Brand · thùng rác Icon/Neutral · kính lúp Brand) — không ghép icon lẻ. 3 dạng danh sách dùng **cùng cỡ 160**.
- Tài khoản mới (chưa có gì): hình minh họa **1 lần** ở khối đầu trang (`EmptyArt variant="chart"`, nút **Bắt đầu sử dụng** mở popup `AppOnboarding`) (hình trái, H3 + mô tả + Nhập khẩu dữ liệu / Bắt đầu sử dụng), các card bên dưới vẫn biểu đồ mờ + link tạo dữ liệu.
- Lỗi tải / không có quyền: giữ khung card, thay biểu đồ mờ bằng icon nhỏ + lời nhắn (+ Thử lại).

## Empty state — 4 dạng (/ds/empty-state)
1. **Màn Tổng quan** — xem mục trên (biểu đồ mờ trong card, minh họa 1 lần khi tài khoản mới).
2. **Danh sách lần đầu** (chưa từng có dữ liệu): KHÔNG thanh công cụ / bảng; `<EmptyArt variant="doc" :width="160" />` + tiêu đề “Chưa có <đối tượng>” + 1 câu lợi ích + Nhập khẩu (outline) · Thêm (primary) + link “Xem hướng dẫn”; nút Thêm không lặp trên tiêu đề trang.
3. **Đã xóa hết** (từng có dữ liệu): giữ thanh công cụ (ẩn Xuất / Lọc vì không có gì) + **hàng tiêu đề cột**; thân bảng `DataTable #empty`: `<EmptyArt variant="cleared" :width="160" />` + “Chưa có <đối tượng> nào” + 1 dòng + nút outline Thêm; không minh họa lớn, không giới thiệu lại. Xóa luôn có toast **Hoàn tác**.
4. **Tìm kiếm / lọc không ra**: giữ nguyên bảng **đủ cột**, giữ từ khóa trong ô tìm; thân bảng: `<EmptyArt variant="search" :width="160" />` + “Không tìm thấy <đối tượng> khớp “từ khóa”” + gợi ý + **Xóa tìm kiếm** (đang lọc thêm **Bỏ lọc**).
- Code: `<DataTable :rows="rows"><template #empty>…class dt-empty-state__icon / __title / __desc / __acts…</template></DataTable>` — hiện khi `rows` rỗng, giữ hàng tiêu đề, căn giữa vùng đang thấy.

## ⛔ Tìm kiếm có gợi ý (typeahead) — phản hồi NGAY, loading tại chỗ (quy tắc UX chung)
- Gõ là **mở ô gợi ý ngay** (< 100 ms) — không đợi dữ liệu về mới hiện.
- Hiện trước kết quả **có sẵn ở máy** (danh sách đã tải, cache, tìm gần đây, khớp tiêu đề…); dữ liệu từ máy chủ đang về → **dòng spinner nhỏ** (`.spinner--sm` + chữ phụ “Đang tìm…”) ở cuối / đầu danh sách, kết quả tự bổ sung khi về.
- ⛔ Không thay cả danh sách bằng chữ “Đang tải…”; không xóa trắng kết quả cũ khi gõ thêm (giữ kết quả cũ tới khi có kết quả mới → không nháy).
- “Không tìm thấy …” chỉ hiện khi **đã tìm xong** mọi nguồn.
- Gọi API: debounce 200–300 ms, hủy request cũ (AbortController) khi gõ tiếp; chỉ mục / danh sách nhỏ → **tải trước khi rảnh** (requestIdleCallback), không đợi người dùng bấm vào ô.
- ⛔ **Gõ tiếng Việt (bộ gõ Telex / VNI = IME):** ô tìm / lọc / ô chat cập nhật theo TỪNG lần gõ, kể cả lúc chữ còn đang soạn — KHÔNG dùng `v-model` trên `<input>` / `<textarea>` gốc (Vue chờ chốt chữ mới cập nhật → gợi ý chỉ hiện khi bấm ra ngoài). Dùng `:value="q" @input="q = $event.target.value"` hoặc control mds-ui (AppSearchbox, AppCombobox đã làm sẵn). Phím Enter khi đang soạn (`e.isComposing`) không được chạy lệnh (mở kết quả, gửi chat).
- Ví dụ thi công: ô tìm kiếm Global Header của /ds (`mds-docs/src/components/DocSearch.vue`).

## ⛔ Menu xổ ra / popover không được bị che (dòng cuối DataTable, nút sát đáy màn hình)
- `DropdownMenu` (mds-ui) tự canh: mặc định mở **dưới** nút; phía dưới không đủ chỗ (dòng cuối bảng sát đáy, nút ở chân trang) → **tự lật lên trên** nút; cả 2 phía thiếu → ghim cách đáy 8; tràn ngang → kéo vào trong cách mép 8; menu dài → cuộn trong menu (max-height). Menu teleport ra `body` + `position: fixed` → không bị `overflow` của bảng / card cắt.
- DataTable: nút “…” của thao tác dòng (rê chuột) đang mở menu → nhóm nút trên dòng **giữ hiện** dù chuột đã rời dòng sang menu (`.row-actions:has([aria-expanded="true"])`).
- ⛔ Không tự viết menu / popover `position: absolute` trong ô bảng (bị che, bị cắt). Popover tự làm phải đo chỗ trống và lật như trên.
- Kiểm tra bắt buộc: đặt dòng cuối của bảng sát đáy cửa sổ → rê dòng → bấm “…” → menu nằm trọn trong màn hình (lật lên) và chọn được chức năng.
