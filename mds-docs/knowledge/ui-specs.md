<!-- source: Đặc tả chi tiết & quy tắc bổ sung (ui-specs) -->
# Đặc tả chi tiết & quy tắc bổ sung (ui-specs)

> Tài liệu tham chiếu của skill `mds-webapp-developer`. Chứa phần KHÔNG có ở `SKILL.md`, `vue-controls.md`, `design-tokens.md`: nguyên tắc gốc, đặc tả từng loại (màu dùng khi nào, cỡ chữ, bo góc, khoảng cách, menu, avatar, bảng, màn chi tiết, AI, số, chống tràn, tiêu đề tab), mẫu email, font Inter, thuật ngữ CSS, empty state, loading, tiến trình nền…
> Quy tắc bắt buộc → `SKILL.md` · Control & props → `references/vue-controls.md` · Token → `references/design-tokens.md` + `mds-ui/src/style.css`.

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
| Nội dung ↔ sidebar / lề phải / lề dưới trình duyệt | **trái / phải / dưới 16px · trên 0** (Page Header ghép liền, tự đệm 12px 16px) | `--page-gutter` |
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
- [ ] Bóng card không bị cắt: cha có `overflow` chừa đệm ≥ 2px quanh card sát mép (mép trên `.content-wrapper` đã có đệm 2 + margin âm 2)
- [ ] Lề phải thẳng hàng khi có thanh cuộn cổ điển: thanh cuộn nằm trong lề 16px (`scrollbar-gutter: stable` + đệm phải `16 − --sb-w`), nút phải Page Header `.right` = card `.right`
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


## Checklist lỗi hay lặp lại (đúc kết từ phản hồi người dùng — đọc nhanh trước khi báo xong)

> Mỗi dòng = 1 lỗi đã từng mắc. Vi phạm = làm lại. Quy tắc người dùng dạy trực tiếp trên /ds nằm ở `ds-notes.md` (sinh tự động) — KHÔNG chép lại ở đây.

### Tab · Menu · Segmented
- **Tab gạch chân (AppTabs) — nguồn: tri thức AVA “Quy chuẩn style của tab gạch chân”:** tab được bọc trong 1 vùng bọc full-width (nền trắng hoặc không nền) và **vùng bọc có `border-bottom` kéo dài cả vùng**; trong đó CHỈ tab đang chọn có gạch chân, tab chưa chọn TẮT gạch chân (`:baseline="false"`) để không double border. Vùng bọc đặt tên riêng (`.tabbar`), KHÔNG đặt `.tabs`. Kiểm tra: dải tab có đúng 1 vạch dài (của vùng bọc), không vạch trong dải. **Gạch xanh tab đang chọn phải ĐÈ LÊN vạch của vùng bọc, không nằm cạnh phía trên nó:** `.tabbar :deep(.tabs) { margin-bottom: -1px }`; vạch vùng bọc dùng `--stroke-neutral` như vạch kẻ dòng bảng. Kiểm tra: chụp ×3 chỗ tab đang chọn. (2026-11-17, /ds/layout Master trên · Detail dưới) (2026-11-13: trước đó tắt baseline mà quên viền vùng bọc → mất vạch)
- Chọn 1 trong 2–7 cách xem → AppSegmented, không tự dựng. **Segmented chứa tối đa 5–7 mục và chỉ khi đủ đất hiển thị trọn; nhiều hơn 7 hoặc nhãn dài / chật → Combobox** (không cuộn ngang, không gom “⋯”). Bộ lọc trạng thái dùng Segmented có thể kèm `badge` số lượng; gõ tìm kiếm → tự về “Tất cả”. (2026-11-17, /ds/layout)
- **Tab = nội dung / layout khác hẳn; chỉ lọc dữ liệu = Segmented. Danh sách có nhiều tab → Nhập khẩu / Thêm ở thanh công cụ bảng của TỪNG tab, không để ở tiêu đề chung** (tiêu đề chỉ giữ chức năng cả phân hệ: Báo cáo, Cài đặt, “⋯”) — người dùng không biết nút ở tiêu đề thêm cho tab nào. Tab chỉ là bộ lọc cùng một đối tượng → Segmented, nút Thêm ở tiêu đề. Kiểm tra: mọi màn có AppTabs, nút Thêm / Nhập khẩu nằm trong tab, không nằm ở tiêu đề. (2026-11-17, /ds/layout)

### Control & kích thước
- Không gõ px cho height/width của nút, ô nhập, icon-button → `var(--btn-height)` / `var(--input-height)`; nhỏ = −4px, lớn = +8px. Dùng sẵn `.btn`, `.btn-icon`, `.ibox`.
- Chữ nội dung 13px (`var(--text-body)`), không 12/11px.
- Mọi icon trung tính = `--icon-neutral`, không `currentColor` từ chữ. Token đúng nhóm: chữ Text/, icon Icon/, viền Stroke/, nền BG/.

### Khung · Card · Viền
- Card trên BG Page: bo 8 (`--radius-card`) + `--shadow-card`, KHÔNG viền; popup/dialog bo 12. Có border thì không shadow.
- Không viền đôi (2 đường kẻ chồng nhau) ở mọi trạng thái — chạy double-border-check.
- **Box có NỀN MÀU (hero, banner, khối gradient AI, alert…) đặt trên nền xám (BG Page) → bắt buộc viền trắng 1px bên ngoài (`border: 1px solid var(--stroke-white)`, không shadow — chỉ 1px, không 2px)** để tách box khỏi nền. Box nền trắng thì dùng `--shadow-card` như thường. Kiểm tra: soi mọi hero/banner màu trên nền xám. (2026-11-13, survey-app .hero)
- Card padding 16 mọi nơi. Bảng trên nền xám cần thanh công cụ (TableHeader nền trắng) phía trên.
- Bo góc lồng nhau: bo ngoài chuẩn, con sát mép = bo ngoài − đệm.

### Scrollbar · Class đặt tên
- **Mọi app phải gọi `detectClassicScrollbars()` (from `@mds/utils/scrollbars.js`) trong main.js** → thanh cuộn mảnh, KHÔNG có nền track, như chamdiem-app. Không tự viết `::-webkit-scrollbar` riêng. Kiểm tra: máy dùng chuột có thanh cuộn cổ điển, mọi vùng cuộn (trang, bảng, panel, popup) không thấy nền xám sau thanh cuộn. (2026-11-13)
- Không đặt tên class trong style scoped trùng class mds-ui (`.tabs`, `.card`, `.btn`, `.tab`…): scoped CSS lọt vào root của component con (VD `.tabs` làm AppTabs có thêm viền dưới). Dùng tiền tố riêng (`.tabbar`, `.sv-card`). (2026-11-13)

### Header · Sidebar
- ControlHeader: để cấu hình MẶC ĐỊNH như mds-docs (`no-meta hide-trial-banner settings-only`, logo-icon slot); không tự ẩn/thêm công cụ khi người dùng không yêu cầu. (2026-11-13)
- Header màu chỉ đi với sidebar sáng; sidebar cố định 36px/gap 4px, không theo mật độ.

### Form · Dialog
- Nút Lưu/Hủy ghim đáy form, cấm đặt ở đầu form. Xác nhận = AppAlertDialog; nút link đứng riêng = `.btn--text`.
- Ô nhập số căn trái trong form; chỉ ô số trong bảng căn phải. Định dạng số 1.234.567,89 (fmtNum).
- Combobox không bắt buộc có “Chưa chọn”; ô luôn có giá trị → `:clearable="false"`.
- Menu xổ ra: đệm 8, item bo góc, hover không chạm 2 mép; không bị che ở dòng cuối bảng.
- Tooltip không lặp chữ (chỉ icon / chữ bị cắt / viết tắt).

### Biểu đồ
- **Màu biểu đồ lấy từ `chartColors(currentTheme.value, mode)` (`@mds/utils/chartColors.js`), không gõ hex / không dùng màu success-warning-danger tự chọn.** 1 chuỗi → palette[0]; nhiều nhóm → palette (≤4 nhóm lấy màu cách quãng 1·3·5·7) kèm chú thích + giá trị; độ lớn → `single`; lệch quanh mốc (NPS, tăng/giảm) → `divergent`. Chú thích (legend) phải cùng màu với biểu đồ. (2026-11-13)

### Ví dụ & tài liệu
- Ví dụ /ds dùng control mds-ui (Segmented `.seg`), gắn vào “Ví dụ trực quan” có sẵn; chỉ ghi những gì có trong Figma.


### Chữ & icon AI · Ngắt dòng chữ
- Chữ AI (nhãn, tiêu đề, tag AI) dùng `.text-ai-primary` (gradient Text/AI — KHÔNG gán `color: var(--text-ai)`); icon AI (✨ sparkles…) dùng class `.ti--ai` + gọi `ensureAiGradient()` trong main.js. Tag AI: nền `--bg-ai-light`, viền `--stroke-ai`, chữ gradient. Không dùng màu accent/brand cho phần tử AI. (2026-11-13)
- **Đoạn chữ ngắn (mô tả, phụ đề, thông báo 1–2 câu) không được rớt 1–2 chữ lẻ xuống dòng cuối** (“gửi đi.” một mình): chỉnh `max-width` đủ rộng để vừa 1 dòng, hoặc nếu phải 2 dòng thì cân đều (`text-wrap: balance`) — soi ở 1366 và 375. Chữ canh giữa càng phải kiểm tra. (2026-11-13)
- **Phân cấp khoảng cách (Gestalt) trong hero / khối giới thiệu:** KHÔNG dùng 1 `gap` đều cho mọi phần tử. Thông tin liên quan đứng gần (tiêu đề → mô tả ~8px), nhóm khác nhau cách xa hơn (mô tả → ô nhập chính ~28px, ô nhập → gợi ý ~20px), đệm trên/dưới khối rộng hơn hai bên (40/32). Nhìn lướt phải thấy 3 cụm: nhãn+tiêu đề+mô tả · ô nhập chính · gợi ý phụ. (2026-11-13)
- Nhóm chip gợi ý: nhãn ngắn + icon, cùng 1 hàng, không để câu dài làm xuống 2 hàng lệch.

### Phân cấp thông tin (hierarchy) — áp cho MỌI màn, nhất là màn đầu vào / hero
1. **Mỗi khối có 1 tâm điểm** (việc người dùng cần làm trước): to nhất / tương phản nhất / có viền-màu nhấn (VD ô nhập prompt AI). Mọi thứ khác lùi xuống. Mỗi màn 1 nút Primary.
2. **3 bậc chữ rõ ràng**: tiêu đề (H1/H2, Bold/Semi Bold, `--text-primary`) → nội dung (13px Regular `--text-primary`) → phụ (13px `--text-secondary` / `--text-hint`). Phân bậc bằng cỡ + đậm + màu token, không bằng nhiều màu lạ. Không có 2 phần tử cùng bậc mà khác kiểu.
3. **Khoảng cách thể hiện quan hệ (Gestalt — gần = liên quan)**: KHÔNG dùng 1 `gap` đều cho tất cả. Trong cùng cụm: gần (4–8px); giữa các cụm: xa hơn (16–28px); giữa các khối lớn: 16px (card) / 32px (nhóm trường). Đệm của khối rộng hơn khoảng cách bên trong. Test: nheo mắt vẫn thấy được các cụm.
4. **Thứ tự đọc**: trên → dưới, trái → phải: nhãn/tiêu đề → mô tả → hành động chính → hành động phụ / gợi ý. Hành động chính nằm gần nơi mắt dừng (cuối cụm, bên phải); gợi ý / lối tắt nhẹ hơn (chip viền, nền trắng), đặt sau.
5. **Mức nhấn tương ứng độ quan trọng**: nhấn (màu AI, Primary, đậm) chỉ cho thứ quan trọng nhất; thứ cấp dùng Outline Neutral / chữ phụ. Nhấn nhiều chỗ = không chỗ nào được nhấn (Von Restorff).
6. **Nhóm ≤ 7 mục / cụm** (Miller); danh sách dài chia nhóm có tiêu đề; chỗ quan trọng ở đầu và cuối (Serial position). Ít lựa chọn trên màn đầu vào (Hick): 1 ô nhập chính + ≤ 4 gợi ý + vài lối tắt.
7. **Căn lề thẳng**: các phần tử cùng cấp cùng lề (nhãn thẳng nhau, cột ô nhập thẳng nhau); chữ canh giữa chỉ dùng cho khối ngắn (hero, empty state), đoạn dài canh trái.
8. **Kiểm tra bằng mắt trước khi báo xong**: chụp màn ở 1366 → tự trả lời: (a) mắt dừng ở đâu đầu tiên? có đúng tâm điểm không; (b) có thấy rõ các cụm không; (c) có chỗ nào khoảng cách đều đều làm các cụm dính nhau không; (d) có chữ lẻ rớt dòng không. (2026-11-13, hero survey-app gap đều 12px → phân cấp 16/8/28/20)

### Trước khi báo xong
1. Soi từng trang ở 1366 và 375; overflow-check = []; không có chữ lẻ rớt dòng (widow).
2. double-border-check = [] ở mọi trạng thái (kể cả tab chưa chọn).
3. Rê chuột thử mọi thứ bấm được; mở popup ở dữ liệu dài nhất.
4. Đọc lại checklist này đối chiếu — nhất là các dòng có ngày gần nhất.
