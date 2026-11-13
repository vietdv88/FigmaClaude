<!-- source: Quy chuẩn dựng web app MDS (skill mds-webapp-developer) -->
# MDS Web App Developer

Skill build UI **Vue.js + HTML/CSS** theo chuẩn design system **MDS Web Components v2.0**.

> Skill này tách biệt hoàn toàn khỏi Figma. Dùng khi prompt build thẳng ra HTML/CSS/Vue — không cần mở Figma.

**MANDATORY — Load ngay khi bắt đầu:**
- [vue-controls.md](references/vue-controls.md) — Danh sách Vue components, button classes, datatable structure, master-detail layout đã được duyệt. Đọc trước khi code bất kỳ màn hình nào.
- [LIST-PAGE.md](LIST-PAGE.md) — Layout pattern màn hình danh sách.
- [echarts-dashboard.md](references/echarts-dashboard.md) — ECharts patterns chuẩn hóa: line, bar, cashflow, donut; gradient palette, dark mode, tooltip preset, lifecycle management. Đọc khi build màn hình dashboard có biểu đồ.
- **Dashboard tĩnh (không kéo thả) — lưới 24 cột bắt buộc:** mọi hàng card (KPI, biểu đồ, card phụ) dùng CHUNG `grid-template-columns: repeat(24, minmax(0, 1fr))` với khe đều `var(--card-col-gap)` (= khe dọc giữa các hàng); mỗi card chiếm số ô chia hết để mép các hàng thẳng nhau — 4 KPI = 6 ô, biểu đồ chính = 12 ô (= 2 KPI), card phụ = 6 ô (= 1 KPI), bảng = 24 ô. ⛔ Không dùng `2fr 1fr 1fr` / `repeat(4, 1fr)` riêng từng hàng (số khe khác nhau → lệch nửa khe; `1fr` không có `minmax(0, …)` bị nội dung đẩy rộng). Màn hẹp: KPI 12 ô, biểu đồ 24 ô. Mẫu: `chamdiem-app/src/app.css` (`.kpi-row`, `.charts-row`).
- **Chữ / icon liên quan AI = màu AI Primary (BẮT BUỘC):** mọi chữ gắn với AI (tên trợ lý AI, “AI gợi ý”, “Hỏi AVA”, “N gợi ý từ AVA”, nhãn / tiêu đề tính năng AI) dùng class `.text-ai-primary` (chữ gradient `#1482ff→#cf11ff`); icon AI dùng `.ti--ai`; nút AI dùng `.btn--ai` / `.btn--ai-outline`. ⛔ Không tô xanh đơn sắc `var(--text-ai)` cho chữ AI. Chi tiết: `references/vue-controls.md` (mục AI).
- **Cỡ chữ mặc định 13px (`var(--text-body)`):** mọi chữ đọc được (nội dung, nhãn, mô tả phụ, chữ trong ô / chip / thẻ, popover) dùng 13px. ⛔ Không dùng 12px (`--text-sm`) hay 11px cho chữ nội dung — chỉ ngoại lệ cho badge đếm số rất nhỏ (VD số trên chấm đỏ).
- [widget-grid.md](references/widget-grid.md) — Widget grid kéo thả: 24-col square cells, edit mode, drag & drop với offset chuột, push-aside, resize handle, ghost tile, CSS states & animations. Đọc khi build dashboard có widget tùy chỉnh.
- [drag-drop.md](references/drag-drop.md) — Kanban card drag & drop: ghost placeholder đẩy card, chống jitter, setTimeout trick, pointer-events none, 4 state bắt buộc. Đọc khi build bất kỳ giao diện kéo thả card/item nào.
- [viewport-scroll.md](references/viewport-scroll.md) — **VIEWPORT MIN-WIDTH SCROLL**: Khi toàn bộ trang (header+sidebar+content) cần scroll ngang ở cấp viewport thay vì responsive. 3 rules bắt buộc (html/body/app-shell), CSS variable cho resizable panel. Đọc khi app cần min-width cứng không co giao diện.

---

## 🔴 LUỒNG BẮT BUỘC — CHẠY TRƯỚC KHI VIẾT BẤT KỲ DÒNG CODE NÀO

> Đây là bước PRE-FLIGHT. Không được skip dù yêu cầu đơn giản hay có ảnh mockup rõ ràng.

```
╔══════════════════════════════════════════════════════════╗
║  Nhận yêu cầu vẽ màn hình / component / UI element      ║
╚══════════════════════════════════════════════════════════╝
                          ↓
╔══════════════════════════════════════════════════════════╗
║  BƯỚC 1 — Đọc vue-controls.md                           ║
║  Xác định toàn bộ UI elements cần dùng trong màn hình   ║
╚══════════════════════════════════════════════════════════╝
                          ↓
╔══════════════════════════════════════════════════════════╗
║  BƯỚC 2 — Với MỖI element, hỏi: "Có trong danh sách     ║
║  vue-controls.md chưa?"                                  ║
╚══════════════════════════════════════════════════════════╝
           ↙ CÓ                              ↘ CHƯA CÓ
╔═══════════════════╗              ╔═══════════════════════╗
║  BÊ NGUYÊN ra     ║              ║  DỪNG — ĐỂ TRỐNG      ║
║  CHỈ thay         ║              ║  Báo user: "Chưa có   ║
║  text/label/data  ║              ║  [tên element] trong  ║
╚═══════════════════╝              ║  danh sách. Cần bổ    ║
                                   ║  sung trước."         ║
                                   ╚═══════════════════════╝
```

**⛔ NGHIÊM CẤM tuyệt đối:**
- Tự vẽ HTML/CSS cho element đã có trong vue-controls.md (dù "sửa cho nhanh")
- Tự vẽ element chưa có khi chưa được user cho phép tường minh
- Dùng ảnh mockup / Figma làm lý do để bỏ qua danh sách đã duyệt
- Thêm prop/slot/CSS override lên component gốc để "bổ sung tính năng"

**✓ Chỉ được phép xây control mới khi:**
1. User xác nhận tường minh "hãy build control mới" hoặc cung cấp Figma link
2. Control đó thực sự KHÔNG CÓ trong vue-controls.md (đã kiểm tra kỹ)
3. Sau khi build xong và được duyệt → cập nhật ngay vào vue-controls.md

---

## 📚 Tài liệu Design System (/ds)

**Tài liệu tra cứu Design System — `/ds` (app `mds-docs`):** <http://pdpoint.sdcthin.local/ds/> — chuyển từ Figma Site “MISA Design System” (42 trang), ai cũng đọc được, có **ví dụ sống** chạy bằng chính control mds-ui (`mds-docs/src/demos/*Demo.vue`, chèn vào trang bằng khối `::: demo <mã>`). Nội dung sửa qua **CMS** `/ds/quan-tri` (Quản trị PD Point + “Người biên tập”): thêm / sửa trang Markdown, dán / kéo thả ảnh, lịch sử sửa, thùng rác. **Thêm / đổi control trong mds-ui → cập nhật ví dụ tương ứng trong `mds-docs/src/demos`** (thêm 1 dòng vào `demos/index.js` nếu là ví dụ mới) để tài liệu luôn khớp code. Code + dữ liệu tách hẳn app chấm điểm (`/opt/mds-docs`), chỉ gắn chung cổng qua `mountDocs()` (lỗi bên tài liệu không làm dừng PD Point).

## ⛔ QUY TẮC BẮT BUỘC TUYỆT ĐỐI

> **📐 KHOẢNG CÁCH & BO GÓC CHUẨN — áp dụng MỌI màn, MỌI app (tránh lỗi vặt UI, thi công đồng nhất).** Token đã có trong `mds-ui/src/style.css` — chỉ dùng token, KHÔNG gõ số tay:
>
> | Quy chuẩn | Giá trị | Token / class mds-ui |
> |---|---|---|
> | **MỌI khối nền trắng đặt trên nền BG Page** (card, KPI, panel bảng, mục lục, khối tóm tắt, khối tự dựng…) | bo góc **8px** (`--radius-card` = Radius/Default 8, cố định mọi mật độ) + shadow **Drop Shadow / Neutral / All 2**, KHÔNG viền. **Chỉ popup / dialog mới bo 12px** (`--radius-dialog`); mọi bo góc thường khác dùng 8px; control đã có sẵn bo góc trong component thì giữ nguyên | `--radius-card` + `--shadow-card` — dùng `.card` / `.surface` (`.kpi-card`, `.table-panel`, `.data-panel--*` đã áp sẵn). Ngoại lệ: thanh full ngang (page-header, sub-nav) |
> | Card ↔ card (ngang lẫn dọc) | **16px** | `--card-col-gap` |
> | **Đệm TRONG card / khối nền** (card, khối AI, ô hồ sơ, mục lục, khối tóm tắt, panel con trong card…) | **16px ĐỀU 4 phía** — KHÔNG để trên-dưới 1 số, trái-phải 1 số (VD `8px 12px`) trừ khi người dùng yêu cầu riêng | `--box-padding` (`.card` đã dùng). Nội dung cần thẳng mép (link, nút cuối hàng) thì bỏ padding RIÊNG của control đó, không giảm đệm khối |
> | Control ↔ control đặt cạnh nhau: Button–Button, Button–Textbox, Searchbox–Combobox, icon-button–icon-button | **8px** | `--gap-control` (`.control-row`, `.page-header__right`, `.sub-nav-right`, `.table-toolbar__left/right` đã dùng sẵn) |
> | **Box / card THẤP** (cao ~1–2 dòng: inline alert, thanh thông báo, chip, tag, hàng thông tin, card nhỏ có icon + chữ + nút) | Khoảng cách chữ → mép trên và chữ → mép dưới gần như bằng nhau ⇒ icon, chữ, nút **CĂN GIỮA DỌC** (`align-items: center`), KHÔNG `flex-start` + `margin-top` bù tay cho icon. Chỉ căn đỉnh khi nội dung nhiều dòng thật sự (≥ 3 dòng / có đoạn văn dài) | `.inline-alert` (AppInlineAlert) đã căn giữa — box tự dựng dùng `display:flex; align-items:center` |
> | **Menu xổ ra** (3 chấm, chuột phải, Combobox, menu cột bảng, popover chọn…) | bo **Radius/Default** (8 · Nhỏ 6) + bóng Bottom 12 (`--shadow-popover`), không viền · đệm **8px** · item cao **32px** (Rộng 36, không theo nút) xếp **sát nhau** · ngăn nhóm bằng **Divider** 1px cách 4px · hover/chọn nền brand nhạt | `DropdownMenu` (chuột phải: `openAt($event)`) · token `--menu-pad`, `--menu-item-h`, `--menu-item-px`, `--menu-radius`, `--shadow-popover` — xem `references/vue-controls.md` › DropdownMenu |
> | **Menu dọc BÊN PHẢI Sidebar chính** (mục lục chi tiết, menu cài đặt, menu danh mục…) | LUÔN dạng Figma **Sub Menu** 1 cột, ẩn Title · item cao **36px** cách nhau **4px**, đệm ngang 12px, bo 8px · hover nền xám nhạt · đang chọn nền brand nhạt + chữ brand Bold · chữ dài 1 dòng “…” + tooltip | `<aside class="card sub-menu"><nav class="menu-list">` + `.menu-list__item` / `--active` / `.menu-list__label` — xem `references/vue-controls.md` › Sub Menu |
> | **Menu con của mục Sidebar chính** (VD Đề xuất → các loại đề xuất) | rê chuột xổ sang phải, **sát mép sidebar (0px)**, chuẩn menu xổ ra (bo Radius/Default, shadow Bottom 12, đệm 8, item 32 sát nhau, Divider ngăn nhóm) | `AppSidebar` item `children: [...]` — xem `references/vue-controls.md` › AppSidebar — menu con |
> | Vùng nội dung ↔ sidebar / lề phải / lề dưới trình duyệt | **16px** | `--page-gutter` (`.content-wrapper` padding) |
> | **Thanh nút Lưu, Hủy của form nhập liệu** (popup, drawer, trang thêm / sửa) | **LUÔN ghim ở ĐÁY form** (nút chính bên phải), nội dung form cuộn bên trên, thanh nút luôn thấy. **⛔ KHÔNG đặt nút Lưu / Hủy ở đầu form** (cạnh tiêu đề, trên cùng), kể cả form dài — cũng không đặt 2 nơi | slot `#footer` của `<AppFormPanel>` (đã ghim đáy) · trang thêm / sửa toàn màn: thanh dính đáy `position: sticky; bottom: 0` + `--shadow-top-4` |
> | **Dialog xác nhận / thông báo** | `<AppAlertDialog>`: rộng 432, đệm 24, cách 16, tiêu đề 16/22 Semi Bold + icon đóng 20, nút căn phải cách 8, bo 12, bóng Bottom 12, không vạch ngăn | `AppAlertDialog` (Figma 6019:180746) |
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
> - **Tab dạng segmented:** mọi tab CÙNG độ đậm chữ (tab đang chọn chỉ đổi nền / màu, KHÔNG đổi font-weight) — đậm hơn làm tab rộng thêm → thanh tab rung khi bấm.
> - **⛔ KHÔNG NHẢY BỐ CỤC khi đổi trạng thái** (lỗi đã gặp: sửa tràn bằng `flex-wrap` → link “Đã đọc hết” ẩn / hiện theo tab làm hàng tab nhảy lên / xuống mỗi lần bấm): bố cục KHÔNG được phụ thuộc phần tử điều kiện (`v-if` nút / link / badge). Chia hàng bằng **markup cố định** (div hàng 1, div hàng 2), KHÔNG dựa vào `flex-wrap` tự xuống dòng; hàng chứa phần tử điều kiện đặt `min-height` = chiều cao phần tử đó (VD `var(--btn-height)`). Đổi tab / bộ lọc / chọn dòng → các thanh tab, toolbar, tiêu đề phải đứng yên.
> - **Test bắt buộc (Playwright, không chỉ nhìn):** mở ĐỦ mọi popup / dropdown / dialog / drawer vừa làm hoặc vừa sửa, ở **dữ liệu tối đa** (số đếm 99+, tên dài, mọi nút/link điều kiện đều hiện — giả lập bằng `page.route` nếu dữ liệu demo không có) và **2 bề rộng 1366px + 375px**, rồi chạy `references/overflow-check.js` → `window.__overflow('<selector khung>')` phải trả `[]`. Chụp màn hình khung để xem lại. **Đồng thời bấm qua lại MỌI tab / trạng thái** (kể cả kịch bản dữ liệu làm phần tử điều kiện ẩn ↔ hiện: chỉ tab A có dữ liệu, chỉ tab B, không tab nào, cả hai) và đo `getBoundingClientRect()` của thanh tab / toolbar / vùng danh sách — vị trí và chiều cao phải GIỐNG HỆT giữa các lần bấm (`window.__layoutKey(sel)` trong overflow-check.js).
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
> - **Mọi thứ bấm được khi hover PHẢI có trạng thái thể hiện** (đổi nền / viền / màu) — chỉ đổi `cursor: pointer` là lỗi. Vùng lớn bấm được (tiêu đề phần, card, dòng) → hover nền nhạt hoặc làm nút icon bên trong hiện hover. Chi tiết: `references/vue-controls.md` › “Button Icon Medium / Small” và “Quy tắc trạng thái hover”.

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
> - **⛔ Menu xổ từ header luôn trên drawer / panel:** `z-index: var(--z-header-pop)` + Teleport ra body (để trong header bị giới hạn z-index 100). Xem `references/vue-controls.md` › DropdownMenu.
> - **⛔ Danh sách xổ ra (menu, popover có danh sách: tài khoản, thông báo…) theo Menu List:** khung đệm `--menu-pad`, item bo `--menu-radius` → hover không tràn chạm 2 mép trái phải; hover nền brand nhạt; khung không viền + `--shadow-popover`. Xem `references/vue-controls.md` › DropdownMenu.
> - **Label:** chỉ viết tắt khi nhãn có **từ 4 từ trở lên**, và khi viết tắt bắt buộc có tooltip giải thích đầy đủ (VD không viết “Ngày HT” cho “Ngày hoàn thành”).
> - **HotTrack:** rê chuột qua Tab, Sidebar, Toolbar, Button, Combo, dòng danh sách… → đổi màu nền để dễ nhận biết; mọi thứ bấm được có **con trỏ bàn tay** (style.css đã đặt chung cho button / role=button / a / summary / checkbox label).
>
> **Sidebar:** mặc định **mở rộng** (`:default-expanded="true"`) và đặt `storage-key` riêng cho từng app (VD `pdpoint-sidebar-expanded`) — chỉ lưu trạng thái khi người dùng tự bấm thu gọn / mở rộng.
>
> **Đồng nhất màn hình:** mọi màn cùng loại trong 1 app dùng chung 1 khung (page-header → sub-nav tab hàng riêng → content-wrapper → kpi-row → list-split > table-panel full chiều cao) và chung CSS khung đặt ở 1 file dùng chung — không chép CSS khung vào từng màn. Nút không bấm được thì ẩn, không disable. Chi tiết: `references/vue-controls.md` › “Đồng nhất khung màn hình”.

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

9. MÀU SẮC THEME: MỌI giá trị màu PHẢI lấy từ file THEMES.md (cùng thư mục — đã cache sẵn từ Figma).
   NGHIÊM CẤM tự tính toán / sinh ra hover, disable, pressed, light từ màu gốc.
   NGHIÊM CẤM lên Figma đọc lại khi đã có trong THEMES.md.
   Ví dụ SAI: lấy #0e9384 rồi tự tối hơn 10% để làm hover, hoặc gọi Figma MCP để lấy màu đã có sẵn.
   Ví dụ ĐÚNG: mở THEMES.md → copy đúng giá trị → paste vào code.
   Nếu biến cần chưa có trong THEMES.md → hỏi user bổ sung, KHÔNG tự bịa.
   → Xem toàn bộ 10 theme và CSS override template tại: THEMES.md (cùng thư mục)

10. BORDER-RADIUS:
    • CARD / PANEL nền trắng trên BG Page (card, kpi-card, table-panel, skeleton card…) + MỌI bo góc thường khác: 8px mọi mật độ → var(--radius-card), shadow var(--shadow-card) (Neutral All 2).
    • CHỈ POPUP / DIALOG (và popover nổi dạng thẻ) bo 12px → var(--radius-dialog).
    • Component đã set sẵn bo góc (nút, ô nhập, menu, tag, badge…) → dùng nguyên, không ghi đè.
    • CONTROL (input, button, combobox, datebox, tag, badge, dropdown item…) dùng var(--radius-default):
      Nhỏ = 6px (mds-ui tự đổi token), Medium / Comfortable = 8px.
    NGHIÊM CẤM hardcode 6px hay 8px — card dùng --radius-card, control dùng --radius-default / --radius-inner.
    ⛔ KHÔNG viết override kiểu `[data-density="compact"] .card { border-radius: 6px }`.

11. MÀU TEXT TRUNG TÍNH — chỉ có 3 loại, KHÔNG ĐƯỢC tự sinh mã hex từ bất kỳ nguồn nào:
    • Text Primary   = var(--text-primary)   → heading, nội dung chính, label, title, body text
    • Text Secondary = var(--text-secondary) → mô tả phụ, metadata, ngày tháng, lượt xem, caption
    • Text Hint      = var(--text-hint)      → placeholder trong input, watermark
    NGHIÊM CẤM đọc màu từ ảnh/Figma/screenshot rồi hardcode hex vào color text.

12. CONTROLS & LAYOUT: CHỈ dùng components và patterns đã được duyệt trong vue-controls.md.
    NGHIÊM CẤM tự thi công control mới khi chưa được phép — dù ảnh mockup hay Figma mô tả khác đi.
    Thiếu control → bỏ trống, báo user. Xem đầy đủ tại: references/vue-controls.md

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

## 1. CSS DESIGN TOKENS — đồng bộ 100% Figma Variables

**Nguồn duy nhất:** `mds-ui/src/style.css` (import qua `@mds`), đã đồng bộ với Figma MDS Web Components v2.0 › Variables (Base Colors, Themes, Space, Font Size, Number, Chart Colors) + Effect Styles + Text Styles.
**Danh sách ĐẦY ĐỦ** (mọi token, bảng ánh xạ Figma → CSS, thang Brand 10 theme, 19 shadow, text style, ~300 biến Space theo component × 4 mật độ, màu biểu đồ): **`references/design-tokens.md`** — đọc khi cần một giá trị cụ thể. KHÔNG tự chép bảng token khác vào app.

Token hay dùng nhất (Blue, mật độ Trung bình):

| Nhóm | Token → giá trị |
|---|---|
| Chữ | `--text-primary` #10141b · `--text-secondary` #6b707a · `--text-hint` #9da2ac · `--text-brand` brand-600 · `--text-link` brand-600 · `--text-link-default` #1570ef · `--text-danger` #f04438 · `--text-warning` #dc6803 · `--text-success` #039855 · `--text-info` #1570ef · `--text-accent` #9e77ed |
| Icon | `--icon-neutral` #6b707a (hover `--icon-neutral-hover` brand) · `--icon-brand` · `--icon-danger/success/warning/info/accent` |
| Nền | `--bg-page` #f2f2f4 · `--bg-white` · `--bg-brand` #245fdf / hover #2753ce / pressed #2644a7 / disable #68a6f2 · `--bg-brand-light` #f0f6fe (hover #ddeafc, pressed #c2dbfb) · `--bg-neutral-light` #f2f2f4 / `--bg-neutral-hover` #ecedef / `--bg-neutral-pressed` #e6e7ea · `--bg-danger/success/warning/info/accent(-light)` |
| Viền | `--stroke-neutral` #ced1d6 · `--stroke-neutral-light` = `--stroke-divider` #e5e6e9 · `--stroke-brand` · `--stroke-*-light` |
| Bo góc | `--radius-sm` 4 · `--radius-inner` 6 · `--radius-default` 8 (Nhỏ 6) · `--radius-card` 8 (card trên BG Page, mọi mật độ) · `--radius-focus` 12 · `--radius-dialog` 12 (chỉ popup / dialog) · `--radius-pill` |
| Shadow | `--shadow-card` (All 2) cho khối trắng · `--shadow-popover` (Bottom 12) cho menu / popover · thang `--shadow-all-*`, `--shadow-bottom-*`, `--shadow-top-*`, `--shadow-left-*`, `--shadow-right-*` |
| Chữ | `--text-body` 13/20 (mặc định) · `--text-h3` 16/22 · `--text-h2` 20/28 · `--text-h1` 24 · `--text-sm` 12 · `--text-caption` 11 · `--fw-regular/medium/semibold/bold` |
| Control | `--btn-height` / `--input-height` 32 (Nhỏ 28 · Rộng 36) · nhỏ `calc(var(--btn-height) - 4px)` · lớn `+ 8px` · `--btn-min-width` 80 · `--btn-px` 12 |
| Khoảng cách | `--gap-control` 8 · `--card-col-gap` 16 · `--box-padding` 16 · `--page-gutter` 16 · form `--form-*` · menu `--menu-*` |

> **Bo góc lồng nhau (inner radius):** bo góc **ngoài luôn theo chuẩn** (card 8, control 8, popup / dialog 12) — ⛔ KHÔNG nới bo ngoài cho vừa phần tử con. Chỉ tính **bo trong = bo ngoài − đệm** khi phần tử con nằm **sát** mép (đệm < bo ngoài, thường 2–4px): tag trong Combobox chọn nhiều (8 − 2 = 6 → `--radius-inner`), mục trong Segmented / nhóm nút, nút trong ô nhập. Đệm ≥ bo ngoài (card đệm 16, popover đệm 8…) → phần tử con giữ bo chuẩn của nó (control 8, card con 8), không tính theo công thức. Kết quả < 2px thì dùng `--radius-sm` 4.
>
> **Shadow hay Stroke (viền) — chọn MỘT (user chốt 2026-11-05):**
> 1. **Đã có border thì KHÔNG thêm shadow** (và ngược lại: khối đã có shadow thì không thêm viền 1px). Không bao giờ vừa viền vừa bóng cho cùng một khối.
> 2. **Khối nền trắng đặt trên một nền TRẮNG khác** (card con trong card, ô tóm tắt trong popup / dialog / drawer, khối trong form trắng) → **KHÔNG dùng shadow**; tách lớp bằng **nền màu** (`--bg-page` / `--bg-neutral-light` / `--bg-brand-light`…) **hoặc viền** `1px solid var(--stroke-neutral-light)` (`--stroke-divider`).
> 3. Shadow chỉ dùng khi khối **nổi trên nền khác màu / lớp khác**: card trắng trên nền trang xám (`--shadow-card`), menu / popover xổ ra (`--shadow-popover`), popup / dialog / drawer (`--shadow-dialog`), thanh / cột dính (`--shadow-top-*`, `--shadow-right-*`).
> Tư vấn nhanh: “nền trắng trên nền xám → shadow All 2, không viền” · “trắng trên trắng → viền Stroke Neutral Light hoặc đổi nền màu, không shadow” · “nổi lên trên nội dung (menu, popup) → shadow, không viền”.

Theme: `<html data-theme="green|blue-gray|teal|cyan|indigo|purple|pink|red|orange">` chỉ đổi thang `--brand-50…900`; mọi token brand tự đổi theo. ⛔ Không gõ `#245fdf` (sẽ không đổi theo theme). Mật độ: `data-density="compact|comfortable"`.

---

## 2. UTILITY CSS BASE

```css
/* Reset nhẹ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-family); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); background: var(--bg-page); font-feature-settings: 'cv02','cv03','cv04','cv11'; -webkit-font-smoothing: antialiased; }

/* ── Heading ── */
/* .h1 — ÍT DÙNG: chỉ cho graphic/display text cần kích thước to đặc biệt */
.h1 { font-size: var(--text-h1); font-weight: var(--fw-semibold); line-height: var(--text-h1-lh); }
/* .h2 — App Title, Page Title, FORM / POPUP / DRAWER title (Figma MDS Form 6019:124359 — đổi từ h3 lên 20px), Dialog Welcome title */
.h2 { font-size: var(--text-h2); font-weight: var(--fw-semibold); line-height: var(--text-h2-lh); }
/* .h3 — Card title, Section title, Group title (nhóm trường trong form) — ⛔ KHÔNG dùng cho tiêu đề form / popup nữa */
.h3 { font-size: var(--text-h3); font-weight: var(--fw-semibold); line-height: var(--text-h3-lh); }

/* ── Body Regular (13px) — khớp MDS "Body Regular/*" ── */
.body-regular  { font-size: var(--text-body); font-weight: var(--fw-regular);  line-height: var(--text-body-lh); }
.body-medium   { font-size: var(--text-body); font-weight: var(--fw-medium);   line-height: var(--text-body-lh); }
.body-semibold { font-size: var(--text-body); font-weight: var(--fw-semibold); line-height: var(--text-body-lh); }
.body-bold     { font-size: var(--text-body); font-weight: var(--fw-bold);     line-height: var(--text-body-lh); }

/* ── Body Medium (14px) — khớp MDS "Body Medium/*" ── */
.body-md-regular  { font-size: var(--text-body-md); font-weight: var(--fw-regular);  line-height: var(--text-body-md-lh); }
.body-md-medium   { font-size: var(--text-body-md); font-weight: var(--fw-medium);   line-height: var(--text-body-md-lh); }
.body-md-semibold { font-size: var(--text-body-md); font-weight: var(--fw-semibold); line-height: var(--text-body-md-lh); }
.body-md-bold     { font-size: var(--text-body-md); font-weight: var(--fw-bold);     line-height: var(--text-body-md-lh); }

/* ── Body Large (16px) — khớp MDS "Body Large/*" ── */
.body-lg-regular  { font-size: var(--text-body-lg); font-weight: var(--fw-regular);  line-height: var(--text-body-lg-lh); }
.body-lg-medium   { font-size: var(--text-body-lg); font-weight: var(--fw-medium);   line-height: var(--text-body-lg-lh); }
.body-lg-semibold { font-size: var(--text-body-lg); font-weight: var(--fw-semibold); line-height: var(--text-body-lg-lh); }
.body-lg-bold     { font-size: var(--text-body-lg); font-weight: var(--fw-bold);     line-height: var(--text-body-lg-lh); }

/* ── Body Small (12px) — khớp MDS "Body Small/*" ── */
.body-sm-regular  { font-size: var(--text-sm); font-weight: var(--fw-regular);  line-height: var(--text-sm-lh); }
.body-sm-medium   { font-size: var(--text-sm); font-weight: var(--fw-medium);   line-height: var(--text-sm-lh); }
.body-sm-semibold { font-size: var(--text-sm); font-weight: var(--fw-semibold); line-height: var(--text-sm-lh); }
.body-sm-bold     { font-size: var(--text-sm); font-weight: var(--fw-bold);     line-height: var(--text-sm-lh); }

/* ── Caption (12px) — khớp MDS "Caption/*" ── */
.caption          { font-size: var(--text-caption); font-weight: var(--fw-regular);  line-height: var(--text-caption-lh); }
.caption-medium   { font-size: var(--text-caption); font-weight: var(--fw-medium);   line-height: var(--text-caption-lh); }
.caption-semibold { font-size: var(--text-caption); font-weight: var(--fw-semibold); line-height: var(--text-caption-lh); }

/* ── Overline (12px uppercase) — khớp MDS "Overline/*" ── */
.overline          { font-size: var(--text-overline); font-weight: var(--fw-regular);  line-height: var(--text-overline-lh); text-transform: uppercase; letter-spacing: 0.06em; }
.overline-medium   { font-size: var(--text-overline); font-weight: var(--fw-medium);   line-height: var(--text-overline-lh); text-transform: uppercase; letter-spacing: 0.06em; }
.overline-semibold { font-size: var(--text-overline); font-weight: var(--fw-semibold); line-height: var(--text-overline-lh); text-transform: uppercase; letter-spacing: 0.06em; }
.overline-bold     { font-size: var(--text-overline); font-weight: var(--fw-bold);     line-height: var(--text-overline-lh); text-transform: uppercase; letter-spacing: 0.06em; }

/* ── Color helpers ── */
.text-secondary { color: var(--text-secondary); }
.text-hint      { color: var(--text-hint); }
.text-disabled  { color: var(--text-disabled); }
.text-brand     { color: var(--text-brand); }
.text-danger    { color: var(--text-danger); }
.text-success   { color: var(--text-success); }
.text-warning   { color: var(--text-warning); }
.text-info      { color: var(--text-info); }
.text-accent    { color: var(--text-accent); }
.text-white     { color: var(--text-white); }

/* Aliases (tương thích ngược) */
.text-body    { font-size: var(--text-body);    font-weight: var(--fw-regular); line-height: var(--text-body-lh); }
.text-body-md { font-size: var(--text-body-md); font-weight: var(--fw-regular); line-height: var(--text-body-md-lh); }
.text-sm      { font-size: var(--text-sm);      line-height: var(--text-sm-lh); }

/* Flex helpers */
.flex       { display: flex; }
.flex-col   { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-end  { justify-content: flex-end; }
.flex-1       { flex: 1; }
.gap-8        { gap: 8px; }
.gap-12       { gap: 12px; }
.gap-16       { gap: 16px; }

/* Divider */
.divider-h { width: 100%; height: 1px; background: var(--stroke-divider); }
.divider-v { width: 1px; align-self: stretch; background: var(--stroke-divider); }
```

---

## 3. LAYOUT CHUẨN — HTML SKELETON

### 3.1 App Shell (Responsive — chiếm toàn bộ viewport)

> ⛔ KHÔNG cứng kích thước `width: 1366px` hay `height: 768px`.  
> App shell chiếm `100vw × 100vh`, sidebar + header fixed, main content scroll nội bộ.

**QUY TẮC LAYOUT BẮT BUỘC:**
```
1. Global Header luôn ở trên cùng, chiều cao 48px (--layout-header-h).
2. .body-row nằm ngay sau header — chứa sidebar + main-content.
3. Sidebar luôn nằm sát lên đến header, KHÔNG có bất kỳ element nào chen giữa header và sidebar.
4. Sub-navigation tabs (nếu có) luôn nằm BÊN TRONG main-content (phía trên page-header),
   KHÔNG ĐƯỢC đặt giữa header và body-row, cũng KHÔNG ĐƯỢC đặt ngang hàng sidebar.
5. Cấu trúc đúng: app-shell → [header] → [body-row → [sidebar] + [main-content → [sub-nav?] + [page-header] + [content-wrapper]]]
6. TÍN HIỆU TẢI TRANG — BẮT BUỘC cho mọi app nhiều trang (không bao giờ để bấm xong màn hình đứng im “đơ”):
   • main.js: installRouteProgress(router)  (@mds/utils/routeProgress.js)
   • App.vue: <RouteProgress /> 1 lần, trên <RouterView />  → thanh tiến trình 3px màu brand trên cùng (chuyển < 80ms thì không hiện)
   • Sidebar sáng NGAY mục được bấm: activeId = (routeProgress.target || route.path)
   • main-content: <PageSkeleton v-if="routeProgress.slow" :cards="4|0" />  → phủ khung xương khi chờ > 350ms
   • index.html: đặt sẵn khung xương (header + sidebar + card + bảng, style nội tuyến) TRONG #app → F5 không bị trang trắng
     trong lúc tải dữ liệu; Vue mount sẽ tự thay thế.
```

```html
<div class="app-shell">
  <!-- Global Header — luôn ở trên cùng, full width -->
  <header class="global-header">
    <div class="header-left">
      <img class="app-logo" src="..." alt="Logo" />
      <span class="app-name h3">Tên App</span>
    </div>
    <div class="header-center">
      <div class="search-box">
        <i class="icon-search"></i>
        <input type="text" placeholder="Tìm kiếm..." />
      </div>
    </div>
    <div class="header-right">
      <button class="btn-icon"><i class="icon-bell"></i></button>
      <div class="avatar">VT</div>
    </div>
  </header>

  <!-- body-row nằm ngay sau header — sidebar PHẢI nằm sát header -->
  <div class="body-row">
    <!-- Sidebar host (flex item) → sidebar absolute bên trong — xem Section 3.2 -->
    <div class="sidebar-host sidebar-host--expanded">
      <aside class="sidebar expanded"><!-- ... --></aside>
    </div>

    <!-- Main Content — chứa tất cả tab/page-header/content -->
    <main class="main-content">
      <!-- Sub-nav tabs (nếu có, cao 48px) — nằm TRONG main-content, KHÔNG đặt ngoài body-row -->
      <div class="sub-nav"><!-- xem Section 3.3 --></div>

      <!-- Page Header -->
      <div class="page-header">
        <!-- xem Section 3.4 -->
      </div>

      <!-- Nội dung trang -->
      <div class="content-wrapper">
        <!-- table / form / dashboard -->
      </div>
    </main>
  </div>
</div>
```

```css
.app-shell {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-page);
}

/* Global Header */
.global-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--layout-header-h);   /* 48px */
  padding: 0 16px;
  background: var(--bg-white);
  border-bottom: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0;
  gap: 16px;
}
.header-left  { display: flex; align-items: center; gap: 8px; }
.header-right { display: flex; align-items: center; gap: 8px; }
.app-name { font-size: 16px; font-weight: 600; color: var(--text-primary); }

/* Search box in header */
.search-box {
  display: flex; align-items: center; gap: 8px;
  height: 32px; padding: 0 12px;
  border: 1px solid var(--stroke-neutral);
  border-radius: var(--radius-default);
  background: var(--bg-white);
  min-width: 240px;
}
.search-box input { border: none; outline: none; flex: 1; font-size: 13px; color: var(--text-primary); }
.search-box input::placeholder { color: var(--text-hint); }

/* Body Row */
.body-row {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;  /* fix flex child overflow */
}

/* Main Content — chiếm phần còn lại, overflow nội bộ */
.main-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;  /* fix text overflow trong flex */
  overflow: hidden;
  background: var(--bg-page);
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .sidebar-host { display: none; }  /* ẩn sidebar-host, dùng mobile nav */
  .form-grid--2col, .form-grid--3col { grid-template-columns: 1fr; }
  .table-toolbar { flex-wrap: wrap; gap: 8px; height: auto; padding: 12px 16px; }
}
```

---

### 3.2 Sidebar

> Chuẩn MDS Web Components v2.0 — import `AppSidebar` từ `@mds/components/AppSidebar.vue`.  
> Collapsed = 64px, padding trái/phải 16px.  Expanded (pinned) = 200px.  
> Hover-expand là CSS `:hover` — **KHÔNG dùng JS mouseenter/mouseleave** (gây jitter khi transition).

**Quy tắc bắt buộc:**
```
1. .sidebar-host là flex item (reserved 64px/200px trong layout).
2. .sidebar luôn position:absolute bên trong host — width animation không làm xô lệch main-content.
3. Hover mở rộng sidebar thành overlay (z-index:100, box-shadow) — dùng CSS :hover trên .sidebar.
4. Click btn-collapse → pin/unpin (.expanded class) — chỉ cần 1 ref isExpanded.
5. Label sidebar-item dùng class .sidebar-item__label — KHÔNG dùng <span> thuần (TIcon cũng render span).
6. Icon .sidebar-item: color = --icon-neutral (KHÔNG inherit từ text).
7. Label .sidebar-item: color = --text-primary (không dùng --text-secondary).
8. btn-add-quick collapsed: icon-only, căn giữa, width 100%, max-width 0 cho text (KHÔNG dùng opacity:0 — giữ nguyên space).
```

```html
<!-- sidebar-host: flex item giữ chỗ trong .body-row -->
<div class="sidebar-host">  <!-- thêm sidebar-host--expanded khi pinned -->
  <aside class="sidebar">   <!-- thêm .expanded khi pinned -->
    <div class="sidebar-inner">
      <button class="btn-add-quick">
        <i class="ti ti-plus"></i>
        <span class="btn-add-text">Thêm nhanh</span>
      </button>
      <nav class="sidebar-nav">
        <button class="sidebar-item active">
          <i class="ti ti-layout-dashboard"></i>
          <span class="sidebar-item__label">Tổng quan</span>
        </button>
        <button class="sidebar-item">
          <i class="ti ti-shopping-cart"></i>
          <span class="sidebar-item__label">Bán hàng</span>
        </button>
      </nav>
    </div>
    <button class="btn-collapse" title="Thu gọn / Mở rộng">
      <!-- show collapse SVG when expanded, expand SVG when collapsed -->
    </button>
  </aside>
</div>
```

```css
/* ── Sidebar host: flex item — giữ chỗ cố định, sidebar absolute bên trong ── */
.sidebar-host {
  flex-shrink: 0; width: var(--layout-sidebar-sm-w); /* 64px */
  height: 100%; position: relative;
  transition: width 0.22s ease;
}
.sidebar-host--expanded { width: var(--layout-sidebar-w); } /* 200px — chỉ khi pinned */

/* ── Sidebar: luôn absolute, transition không ảnh hưởng layout ── */
.sidebar {
  display: flex; flex-direction: column;
  position: absolute; top: 0; left: 0; bottom: 0;
  width: var(--layout-sidebar-sm-w);
  background: var(--bg-white);
  border-right: 1px solid var(--stroke-neutral-light);
  overflow: hidden; z-index: 1;
  transition: width 0.22s ease, box-shadow 0.22s ease;
}
/* Pinned expanded */
.sidebar.expanded { width: var(--layout-sidebar-w); }
/* Hover overlay (CSS :hover — KHÔNG dùng JS events) */
.sidebar:not(.expanded):hover {
  width: var(--layout-sidebar-w);
  z-index: 100; box-shadow: 4px 0 20px rgba(16,24,40,0.12);
}

/* ── Inner scrollable area ── */
.sidebar-inner {
  display: flex; flex-direction: column; flex: 1; min-height: 0;
  padding: 12px 16px 52px; gap: 8px;  /* 16px horizontal padding */
  overflow-y: auto; overflow-x: hidden;
}
.sidebar.expanded .sidebar-inner,
.sidebar:not(.expanded):hover .sidebar-inner { padding: 12px 12px 52px; }

/* ── btn-add-quick: collapsed = icon-only square; expanded = icon + label centered ── */
.btn-add-quick {
  display: flex; align-items: center; justify-content: center;
  gap: 0; width: 100%; height: var(--btn-height); padding: 0;
  border: 1px solid var(--stroke-neutral);
  border-radius: var(--radius-default);
  background: var(--bg-white); cursor: pointer;
  color: var(--text-primary); font-size: 13px; font-weight: var(--fw-medium);
  white-space: nowrap; overflow: hidden; flex-shrink: 0;
  transition: background 0.15s;
}
.btn-add-quick:hover { background: var(--bg-neutral-light); }
.btn-add-quick .ti { font-size: 16px; flex-shrink: 0; }
/* Text: max-width:0 hides without keeping layout space (opacity:0 would keep space) */
.btn-add-quick .btn-add-text {
  opacity: 0; max-width: 0; overflow: hidden; white-space: nowrap;
  transition: opacity 0.15s 0s, max-width 0.15s 0s; /* no delay on hide */
}
.sidebar.expanded .btn-add-quick,
.sidebar:not(.expanded):hover .btn-add-quick { gap: 8px; justify-content: center; }
.sidebar.expanded .btn-add-quick .btn-add-text,
.sidebar:not(.expanded):hover .btn-add-quick .btn-add-text {
  opacity: 1; max-width: 160px;
  transition: opacity 0.18s 0.1s, max-width 0.18s 0.1s; /* 0.1s delay on show — icon settles first */
}

/* ── Sidebar nav items ── */
.sidebar-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.sidebar-item {
  display: flex; align-items: center; gap: 8px; justify-content: center;
  height: 36px; padding: 0; width: 100%;
  border-radius: var(--radius-default); border: none; background: transparent;
  font-size: 13px; font-weight: var(--fw-medium);
  color: var(--text-primary);      /* --text-primary, KHÔNG dùng secondary */
  cursor: pointer; white-space: nowrap; transition: background 0.15s;
}
.sidebar.expanded .sidebar-item,
.sidebar:not(.expanded):hover .sidebar-item { justify-content: flex-start; padding: 0 12px; }
.sidebar-item:hover  { background: var(--bg-neutral-hover); }
.sidebar-item.active { background: var(--bg-brand-light); color: var(--text-brand); font-weight: var(--fw-semibold); }
.sidebar-item .ti         { font-size: 20px; flex-shrink: 0; color: var(--icon-neutral); }
.sidebar-item.active .ti  { color: var(--text-brand); } /* active: icon phải đổi sang brand */
.sidebar-item .sidebar-item__label { display: none; } /* dùng class riêng, không dùng span */
.sidebar.expanded .sidebar-item .sidebar-item__label,
.sidebar:not(.expanded):hover .sidebar-item .sidebar-item__label { display: block; }

/* ── Collapse/Expand button — absolute bottom ── */
.btn-collapse {
  position: absolute; bottom: 0; right: 0;
  width: 40px; height: 40px;
  background: var(--neutral-50);
  border: none; border-top: 1px solid var(--stroke-neutral-light);
  border-left: 1px solid var(--stroke-neutral-light); border-radius: 8px 0 0 0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-secondary); transition: background 0.15s;
}
/* Collapsed (and not hovering): full-width button */
.sidebar:not(.expanded):not(:hover) .btn-collapse {
  left: 0; right: 0; width: auto;
  border-left: none; border-right: 1px solid var(--stroke-neutral-light); border-radius: 0;
}
.btn-collapse:hover { background: var(--bg-neutral-hover); }
```

**Vue `AppSidebar.vue` (component chuẩn tại `@mds/components/AppSidebar.vue`):**
```vue
<template>
  <div class="sidebar-host" :class="{ 'sidebar-host--expanded': isExpanded }">
    <aside class="sidebar" :class="{ expanded: isExpanded }">
      <div class="sidebar-inner">
        <button class="btn-add-quick" @click="$emit('quick-add')">
          <TIcon name="plus" />
          <span class="btn-add-text">Thêm nhanh</span>
        </button>
        <nav class="sidebar-nav">
          <button v-for="item in items" :key="item.id"
            class="sidebar-item" :class="{ active: activeId === item.id }"
            :title="item.label" @click="$emit('nav', item.id)">
            <TIcon :name="item.icon" />
            <span class="sidebar-item__label">{{ item.label }}</span>
          </button>
        </nav>
      </div>
      <button class="btn-collapse" @click="onCollapseClick"
        :title="isExpanded ? 'Thu gọn' : 'Ghim mở rộng'">
        <!-- expanded: collapse icon; collapsed: expand icon -->
      </button>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TIcon from './TIcon.vue'

const props = defineProps({
  items:           { type: Array,   default: () => [] },
  activeId:        { type: String,  default: '' },
  defaultExpanded: { type: Boolean, default: false },
})
defineEmits(['nav', 'quick-add'])

const isExpanded = ref(props.defaultExpanded)
// Hover-expand handled by CSS :hover — no JS mouseenter/mouseleave needed
function onCollapseClick() { isExpanded.value = !isExpanded.value }
</script>
```

---

### 3.3 Sub-Nav Tabs

> Sub-nav luôn nằm **trong** `.main-content`, KHÔNG bao giờ đặt ngoài `.body-row`.  
> **Chiều cao cố định 48px.**

```html
<div class="sub-nav">
  <button class="sub-nav-tab active">Tình hình tài chính</button>
  <button class="sub-nav-tab">Bàn làm việc</button>
  <button class="sub-nav-tab">
    <i class="ti ti-cpu"></i> Trợ lý AI
  </button>
</div>
```

```css
.sub-nav {
  display: flex; align-items: center; gap: 0;
  height: 48px; padding: 0 16px; flex-shrink: 0;
  border-bottom: 1px solid var(--stroke-neutral-light);
  background: var(--bg-white);
}
.sub-nav-tab {   /* Figma Tab Horizontal Item (6019:101046), Underline=True */
  display: flex; align-items: center; gap: 8px;            /* Tabs/Medium/Gap-Content */
  height: var(--tab-h); padding: 0 var(--tab-px);          /* Tabs/Medium/Fix-Height 36 · 36 · 40 · Padding-Horizontal 12 · 12 · 20 */
  /* ⛔ Tab KHÔNG kéo cao bằng thanh chứa (sub-nav 48 / page-header 56 / drawer) — nằm sát đáy, hàng tab margin-bottom:-1px để gạch chân đè viền dưới thanh */
  border-radius: var(--radius-default) var(--radius-default) 0 0;   /* chỉ bo 2 góc trên */
  font-size: 13px; font-weight: var(--fw-regular);
  color: var(--text-primary);
  border: none; background: transparent; cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap; transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.sub-nav-tab:hover  { background: var(--bg-neutral-hover); }     /* Hover: Neutral Light Hover — ⛔ không dùng --bg-brand-light, chữ giữ nguyên */
.sub-nav-tab:active { background: var(--bg-neutral-pressed); }   /* Pressed */
.sub-nav-tab.active {                                            /* Actived (Brand · Text): nền trắng, chữ Bold brand, gạch 2px brand */
  color: var(--text-brand); font-weight: var(--fw-bold);
  border-bottom-color: var(--stroke-brand); background: var(--bg-white);
}
.sub-nav-tab .ti { font-size: 16px; }

---

### 3.4 Page Header

```html
<!-- List Page Header -->
<div class="page-header">
  <div class="page-header__left">
    <!-- Back = Button Icon Medium, style Icon (không viền) — xem vue-controls.md › Button Icon -->
    <button class="btn-icon" type="button" aria-label="Quay lại">
      <TIcon name="arrow-left" />
    </button>
    <h1 class="page-header__title h2">Danh sách Khách hàng</h1>
  </div>
  <div class="page-header__right">
    <button class="btn btn--outline btn--sm">
      <i class="icon-upload"></i> Nhập từ Excel
    </button>
    <button class="btn btn--primary btn--sm">
      <i class="icon-plus"></i> Thêm
    </button>
  </div>
</div>
```

```css
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  height: var(--layout-page-header-h);  /* 56px */
  padding: 0 0;
  background: var(--bg-white);
  border-bottom: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0;
}
.page-header__left  { display: flex; align-items: center; gap: 8px; }
.page-header__right { display: flex; align-items: center; gap: 8px; }
.page-header__title { font-size: 20px; font-weight: 600; color: var(--text-primary); }
```

---

## 4. BUTTON — HTML/CSS

```html
<!-- Button variants -->
<button class="btn btn--primary">Lưu</button>
<button class="btn btn--outline">Hủy</button>
<button class="btn btn--ghost">Bỏ qua</button>
<button class="btn btn--danger">Xóa</button>
<button class="btn btn--primary" disabled>Disabled</button>

<!-- Với icon -->
<button class="btn btn--primary">
  <i class="icon-plus"></i>
  Thêm mới
</button>

<!-- Button icon only -->
<button class="btn-icon"><i class="icon-refresh"></i></button>
<button class="btn-icon btn-icon--danger"><i class="icon-trash"></i></button>

<!-- Button Small -->
<button class="btn btn--primary btn--sm">Lưu</button>

<!-- Button Group — nhiều button cạnh nhau dùng gap: 8px -->
<div style="display:flex; align-items:center; gap:8px">
  <button class="btn btn--outline">Hủy</button>
  <button class="btn btn--primary">Lưu</button>
</div>
```

> **Rule: Button group gap = 8px** (`--btn-group-gap`). Áp dụng mọi nơi có nhiều button cạnh nhau: form footer, toolbar, action bar, inline actions.

```css
/* ── Base button ── */
.btn {
  display: inline-flex; align-items: center; gap: var(--btn-gap);
  height: var(--btn-height);         /* 32px */
  min-width: var(--btn-min-width);   /* 80px */
  padding: 0 var(--btn-px);          /* 0 12px */
  font-family: var(--font-family);
  font-size: 13px; font-weight: 500;
  border-radius: var(--radius-default);
  border: 1px solid transparent;
  cursor: pointer; white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.btn i { width: 16px; height: 16px; }

/* Primary (Brand Solid) */
.btn--primary {
  background: var(--bg-brand);
  border-color: var(--bg-brand);
  color: var(--text-white);
}
.btn--primary:hover   { background: var(--bg-brand-hover);   border-color: var(--bg-brand-hover); }    /* Brand/700 */
.btn--primary:active  { background: var(--bg-brand-pressed); border-color: var(--bg-brand-pressed); }  /* Brand/800 */
.btn--primary:disabled { background: var(--bg-brand-disable); border-color: var(--bg-brand-disable); cursor: not-allowed; }

/* Outline (Brand Outline) */
.btn--outline {
  background: var(--bg-white);
  border-color: var(--stroke-brand);
  color: var(--text-brand);
}
.btn--outline:hover  { background: var(--bg-brand-light); }
.btn--outline:disabled { border-color: var(--stroke-neutral-disable); color: var(--text-disabled); cursor: not-allowed; }

/* Ghost / Text */
.btn--ghost {
  background: transparent;
  border-color: transparent;
  color: var(--text-secondary);
}
.btn--ghost:hover { background: var(--bg-neutral-hover); }

/* Neutral Outline */
.btn--neutral {
  background: var(--bg-white);
  border-color: var(--stroke-neutral);
  color: var(--text-primary);
}
.btn--neutral:hover { background: var(--bg-neutral-light); }

/* Danger */
.btn--danger {
  background: var(--bg-danger);
  border-color: var(--bg-danger);
  color: var(--text-white);
}
.btn--danger:hover { background: var(--bg-danger-hover); }   /* Danger/700 */

/* Small variant */
.btn--sm { height: 28px; font-size: 12px; padding: 0 10px; min-width: 64px; }

/* Button Icon Only */
.btn-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  border-radius: var(--radius-default);
  border: 1px solid transparent;
  background: transparent; cursor: pointer;
  color: var(--icon-neutral);
  transition: background 0.15s;
}
.btn-icon:hover       { background: var(--bg-neutral-hover); }
.btn-icon--sm         { width: 28px; height: 28px; }
.btn-icon--danger     { color: var(--icon-danger); }
.btn-icon--danger:hover { background: var(--bg-danger-light); }
.btn-icon--outline    { border-color: var(--stroke-neutral); }
```

---

## 5. INPUT / FORM FIELD — HTML/CSS

### 5.0 Bố cục form — CHỈ 2 kiểu (Figma MDS Input Group, node 6019:51148)

```vue
<!-- Kiểu 1: nhãn TRÁI 200px (Regular) – ô PHẢI · nhãn→ô 8px · các hàng cách 12px -->
<div class="form-fields form-fields--h">
  <AppInput label="Họ và tên" :vertical="false"><AppTextbox v-model="f.name" /></AppInput>
  <AppInput label="Phòng ban" :vertical="false"><AppCombobox v-model="f.dept" :options="depts" /></AppInput>
</div>

<!-- Kiểu 2: nhãn TRÊN (Semibold) – ô DƯỚI · nhãn→ô 4px · các trường cách 16px -->
<div class="form-fields">
  <AppInput label="Họ và tên" required><AppTextbox v-model="f.name" /></AppInput>
  <AppInput label="Ngày sinh"><AppDatebox v-model="f.dob" /></AppInput>
</div>

<!-- 2 cột (cột cách 80px, < 760px về 1 cột): thêm .form-fields--2col -->
<div class="form-fields form-fields--h form-fields--2col">…</div>

<!-- Màn CHI TIẾT (xem, sửa nhanh từng trường) — node 20191:63630 -->
<section class="card detail-card">
  <h3 class="detail-card__title">Thông tin chung</h3>
  <div class="detail-grid">
    <DetailField v-model="emp.code" label="Mã nhân viên" @save="save" />
    <DetailField v-model="emp.email" label="Email" :editable="false" />
  </div>
</section>
```
⛔ Không tự dựng `display:grid` + gap riêng cho form; không đặt `margin-bottom` lên từng trường — khoảng cách do `.form-fields` / `.detail-grid` quyết định.

```html
<!-- Input field với label -->
<div class="field">
  <label class="field__label">Tên khách hàng <span class="field__required">*</span></label>
  <input class="input" type="text" placeholder="Nhập tên khách hàng" />
  <span class="field__hint">Nhập đầy đủ tên khách hàng</span>
</div>

<!-- Input error state -->
<div class="field field--error">
  <label class="field__label">Email</label>
  <input class="input input--error" type="email" value="invalid" />
  <span class="field__error-msg">Email không đúng định dạng</span>
</div>

<!-- Input với prefix icon -->
<div class="input-wrapper">
  <i class="input-prefix-icon icon-search"></i>
  <input class="input input--has-prefix" type="text" placeholder="Tìm kiếm..." />
</div>

<!-- Textarea -->
<div class="field">
  <label class="field__label">Ghi chú</label>
  <textarea class="input input--textarea" rows="3" placeholder="Nhập ghi chú..."></textarea>
</div>

<!-- Select / Dropdown -->
<div class="field">
  <label class="field__label">Trạng thái</label>
  <select class="input input--select">
    <option value="">Chọn trạng thái</option>
    <option>Đang hoạt động</option>
    <option>Tạm ngưng</option>
  </select>
</div>
```

```css
/* Field wrapper */
.field {
  display: flex; flex-direction: column;
  gap: var(--input-label-gap);  /* 4px — label → control */
}
.field__label {
  font-size: 13px; font-weight: var(--fw-semibold);  /* 600 — label input LUÔN semibold */
  color: var(--text-primary); line-height: 20px;
}
.field__required { color: var(--text-danger); margin-left: 2px; }
.field__hint     { font-size: 12px; color: var(--text-secondary); line-height: 16px; }
.field__error-msg { font-size: 12px; color: var(--text-danger); line-height: 16px; }

/* Input base */
/* line-height = height (không trừ border) — bắt buộc để dấu thanh tiếng Việt (Ổ, Ầ, Ắ...) không bị clip trên mọi DPI */
.input {
  display: flex; align-items: center;
  width: 100%;
  height: var(--input-height);
  padding: 0 var(--input-px);
  line-height: var(--input-height);
  font-family: var(--font-family);
  font-size: 13px; color: var(--text-primary);
  background: var(--bg-white);
  border: 1px solid var(--stroke-neutral);
  border-radius: var(--radius-default);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.input::placeholder { color: var(--text-hint); }
.input:focus        { border-color: var(--stroke-brand); box-shadow: 0 0 0 3px rgba(4,153,228,0.12); }
.input:disabled     { background: var(--bg-neutral-light); color: var(--text-disabled); cursor: not-allowed; }
.input--error       { border-color: var(--stroke-danger); }
.input--error:focus { box-shadow: 0 0 0 3px rgba(240,68,56,0.12); }
.input--textarea    { height: auto; min-height: 80px; resize: vertical; }
.input--select      { appearance: none; background-image: url("data:image/svg+xml,..."); background-repeat: no-repeat; background-position: right 10px center; padding-right: 32px; cursor: pointer; }

/* Input with prefix icon */
.input-wrapper { position: relative; }
.input-prefix-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--icon-neutral); width: 16px; height: 16px; pointer-events: none; }
.input--has-prefix  { padding-left: 34px; }
```

---

## 6. TABLE — HTML/CSS

```html
<div class="table-panel">
  <!-- Table Header Toolbar -->
  <div class="table-toolbar">
    <div class="table-toolbar__left">
      <div class="input-wrapper">
        <i class="input-prefix-icon icon-search"></i>
        <input class="input input--has-prefix" type="text" placeholder="Tìm kiếm..." style="width:240px" />
      </div>
      <select class="input input--select" style="width:160px">
        <option>Trạng thái: Tất cả</option>
        <option>Đang hoạt động</option>
      </select>
    </div>
    <div class="table-toolbar__right">
      <button class="btn-icon btn-icon--outline" title="Làm mới"><i class="icon-refresh"></i></button>
      <button class="btn-icon btn-icon--outline" title="Xuất Excel"><i class="icon-upload"></i></button>
      <button class="btn btn--outline btn--sm"><i class="icon-upload"></i> Nhập từ Excel</button>
      <button class="btn btn--primary btn--sm"><i class="icon-plus"></i> Thêm</button>
    </div>
  </div>

  <!-- Table -->
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th class="table__th table__th--checkbox">
            <input type="checkbox" class="checkbox" />
          </th>
          <th class="table__th">Tên khách hàng</th>
          <th class="table__th">Mã khách hàng</th>
          <th class="table__th table__th--right">Công nợ</th>
          <th class="table__th">Trạng thái</th>
          <th class="table__th table__th--action"></th>
        </tr>
      </thead>
      <tbody>
        <tr class="table__row">
          <td class="table__td table__td--checkbox">
            <input type="checkbox" class="checkbox" />
          </td>
          <td class="table__td">
            <a href="#" class="text-brand">Công ty TNHH ABC</a>
            <div class="text-sm text-secondary">abc@example.com</div>
          </td>
          <td class="table__td">KH-001</td>
          <td class="table__td table__td--right">10.500.000</td>
          <td class="table__td"><span class="badge badge--success">Hoạt động</span></td>
          <td class="table__td table__td--action">
            <button class="btn-icon btn-icon--sm"><i class="icon-edit"></i></button>
            <button class="btn-icon btn-icon--sm btn-icon--danger"><i class="icon-trash"></i></button>
          </td>
        </tr>
        <!-- more rows... -->
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  <div class="paging">
    <span class="text-sm text-secondary">Tổng số: <strong>48</strong></span>
    <div class="paging__right">
      <span class="text-sm text-secondary">Số dòng/trang</span>
      <select class="input input--select" style="width:72px;height:28px;font-size:12px">
        <option>10</option><option>20</option><option>50</option>
      </select>
      <span class="text-sm text-secondary">1 - 10</span>
      <div class="paging__nav">
        <button class="btn-icon btn-icon--sm" disabled><i class="icon-chevrons-left"></i></button>
        <button class="btn-icon btn-icon--sm" disabled><i class="icon-chevron-left"></i></button>
        <button class="btn-icon btn-icon--sm"><i class="icon-chevron-right"></i></button>
        <button class="btn-icon btn-icon--sm"><i class="icon-chevrons-right"></i></button>
      </div>
    </div>
  </div>
</div>
```

```css
/* Table Panel */
.table-panel {
  display: flex; flex-direction: column;
  flex: 1; overflow: hidden;
  background: var(--bg-white);
  border-radius: var(--radius-default);  /* 8px */
}

/* Toolbar */
.table-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  height: 56px; padding: 0 16px; flex-shrink: 0;
  border-bottom: 1px solid var(--stroke-neutral-light);
}
.table-toolbar__left  { display: flex; align-items: center; gap: 8px; }
.table-toolbar__right { display: flex; align-items: center; gap: 8px; }

/* Table scroll wrapper */
.table-wrap { flex: 1; overflow: auto; }

/* Table */
.table { width: 100%; border-collapse: collapse; }

.table__th {
  height: var(--table-header-height);  /* 56px */
  padding: 0 var(--table-cell-px);     /* 0 4px */
  text-align: left;
  font-size: 13px; font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-white);
  border-bottom: 1px solid var(--stroke-neutral-light);
  white-space: nowrap;
  position: sticky; top: 0; z-index: 1;
}
.table__th--checkbox { width: 48px; padding: 0 12px; }
.table__th--action   { width: 96px; }
.table__th--right    { text-align: right; }

.table__row { transition: background 0.1s; }
.table__row:hover { background: var(--bg-neutral-light); }
.table__row--selected { background: var(--bg-brand-light); }

.table__td {
  height: var(--table-row-height-2);   /* 56px */
  padding: 0 var(--table-cell-px);     /* 0 4px */
  font-size: 13px; color: var(--text-primary);
  border-bottom: 1px solid var(--stroke-neutral-light);
  vertical-align: middle;
}
.table__td--checkbox { width: 48px; padding: 0 12px; }
.table__td--action   { width: 96px; }
.table__td--right    { text-align: right; }

/* Checkbox */
.checkbox {
  width: 16px; height: 16px; cursor: pointer;
  accent-color: var(--bg-brand);
}

/* Pagination */
.paging {
  display: flex; align-items: center; justify-content: space-between;
  height: var(--paging-h);  /* 48 · Nhỏ 40 · Rộng 56 */
  padding: 0 var(--paging-px);  /* 16 · Nhỏ 12 · Rộng 16 */
  flex-shrink: 0;   /* Figma: KHÔNG viền trên — dòng cuối / dòng Tổng đã có viền dưới; dòng Tổng: ít dòng bám sau dòng cuối, phải cuộn thì ghim sát trên Paging */
}
.paging__right { display: flex; align-items: center; gap: 8px; }
.paging__nav   { display: flex; align-items: center; gap: 2px; }
```

---

## 7. FORM PAGE — HTML/CSS

```html
<div class="form-page">
  <!-- Form Content (scrollable) -->
  <div class="form-content">
    <!-- Section Card -->
    <div class="form-section">
      <h3 class="form-section__title h3">Thông tin chung</h3>
      <div class="form-grid form-grid--2col">
        <!-- Field -->
        <div class="field">
          <label class="field__label">Tên khách hàng <span class="field__required">*</span></label>
          <input class="input" type="text" placeholder="Nhập tên..." />
        </div>
        <div class="field">
          <label class="field__label">Mã khách hàng</label>
          <input class="input" type="text" placeholder="Tự động" />
        </div>
        <div class="field">
          <label class="field__label">Email</label>
          <input class="input" type="email" placeholder="email@example.com" />
        </div>
        <div class="field">
          <label class="field__label">Số điện thoại</label>
          <input class="input" type="tel" placeholder="0901234567" />
        </div>
        <div class="field form-grid__full">
          <label class="field__label">Địa chỉ</label>
          <input class="input" type="text" placeholder="Nhập địa chỉ..." />
        </div>
      </div>
    </div>

    <!-- Section 2 -->
    <div class="form-section">
      <h3 class="form-section__title h3">Thông tin bổ sung</h3>
      <div class="form-grid form-grid--2col">
        <!-- more fields -->
      </div>
    </div>
  </div>

  <!-- Action Bar -->
  <div class="form-action-bar">
    <button class="btn btn--ghost">Hủy</button>
    <button class="btn btn--outline">Lưu và thêm</button>
    <button class="btn btn--primary">Lưu</button>
  </div>
</div>
```

```css
.form-page {
  display: flex; flex-direction: column;
  flex: 1; overflow: hidden;
}

.form-content {
  flex: 1; overflow-y: auto;
  display: flex; flex-direction: column;
  gap: 16px;
  padding: var(--form-py) var(--form-px);  /* 16px 24px */
  background: var(--bg-page);
}

.form-section {
  background: var(--bg-white);
  border-radius: var(--radius-default);
  padding: 20px var(--form-px);  /* 20px 24px */
  display: flex; flex-direction: column; gap: 16px;
}
.form-section__title { font-size: 16px; font-weight: 600; color: var(--text-primary); }

.form-grid {
  display: grid;
  gap: var(--form-row-gap) var(--form-col-gap);  /* 16px 32px */
}
.form-grid--2col    { grid-template-columns: 1fr 1fr; }
.form-grid--3col    { grid-template-columns: 1fr 1fr 1fr; }
.form-grid__full    { grid-column: 1 / -1; }

.form-action-bar {
  display: flex; align-items: center; justify-content: flex-end;
  gap: var(--btn-group-gap);       /* 8px — button group gap */
  height: 56px;
  padding: 0 var(--footer-px);     /* 0 16px */
  background: var(--bg-white);
  border-top: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0;
}
```

---

## 8. MODAL / DIALOG — HTML/CSS

```html
<!-- Overlay -->
<div class="modal-overlay" @click.self="close">
  <div class="modal" style="width: 520px">
    <!-- Modal Header -->
    <div class="modal__header">
      <h3 class="h3">Thêm khách hàng</h3>
      <button class="btn-icon" @click="close"><i class="icon-x"></i></button>
    </div>

    <!-- Modal Body -->
    <div class="modal__body">
      <div class="field">
        <label class="field__label">Tên khách hàng <span class="field__required">*</span></label>
        <input class="input" type="text" />
      </div>
      <!-- more fields... -->
    </div>

    <!-- Modal Footer -->
    <div class="modal__footer">
      <button class="btn btn--ghost" @click="close">Hủy</button>
      <button class="btn btn--primary" @click="save">Lưu</button>
    </div>
  </div>
</div>
```

```css
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(16, 24, 40, 0.4);
  display: flex; align-items: center; justify-content: center;
}
.modal {
  background: var(--bg-white);
  border-radius: var(--radius-dialog);  /* 12px — popup / dialog */
  box-shadow: var(--shadow-dialog);
  display: flex; flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}
.modal__header {
  display: flex; align-items: center; justify-content: space-between;
  height: 52px; padding: 0 var(--dialog-px) 0 var(--dialog-px);
  border-bottom: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0;
}
.modal__body {
  flex: 1; overflow-y: auto;
  padding: var(--dialog-py) var(--dialog-px);
  display: flex; flex-direction: column;
  gap: var(--input-row-gap);  /* 16px */
}
.modal__footer {
  display: flex; align-items: center; justify-content: flex-end;
  gap: var(--footer-gap);
  height: 52px; padding: 0 var(--footer-px);
  border-top: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0;
}
```

---

## 9. BADGE / TAG / STATUS

```html
<!-- Badge -->
<span class="badge badge--success">Hoạt động</span>
<span class="badge badge--danger">Đã hủy</span>
<span class="badge badge--warning">Chờ duyệt</span>
<span class="badge badge--info">Mới</span>
<span class="badge badge--neutral">Nháp</span>

<!-- Tag / Chip (có thể xóa) -->
<div class="tag tag--brand">
  <span>Nhóm A</span>
  <button class="tag__remove"><i class="icon-x"></i></button>
</div>
```

```css
.badge {
  display: inline-flex; align-items: center;
  height: 20px; padding: 0 6px;
  font-size: 12px; font-weight: 500; line-height: 16px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}
.badge--success { background: var(--bg-success-light); color: var(--text-success); }
.badge--danger  { background: var(--bg-danger-light);  color: var(--text-danger); }
.badge--warning { background: var(--bg-warning-light); color: var(--text-warning); }
.badge--info    { background: var(--bg-info-light);    color: var(--text-info); }
.badge--neutral { background: var(--bg-neutral-light); color: var(--text-secondary); }
.badge--brand   { background: var(--bg-brand-light);   color: var(--text-brand); }

/* Badge dot variant */
.badge--dot::before {
  content: ""; display: inline-block;
  width: 6px; height: 6px; border-radius: 50%;
  margin-right: 5px; background: currentColor;
}

/* Tag / Chip */
.tag {
  display: inline-flex; align-items: center; gap: 4px;
  height: 24px; padding: 0 8px;
  font-size: 12px; font-weight: 500;
  border-radius: var(--radius-pill);
  border: 1px solid currentColor;
}
.tag--brand  { background: var(--bg-brand-light);   color: var(--text-brand); }
.tag--neutral { background: var(--bg-neutral-light); color: var(--text-secondary); border-color: var(--stroke-neutral-light); }
.tag__remove { display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; color: inherit; width: 14px; height: 14px; padding: 0; }
```

---

## 10. VUE COMPONENT PATTERNS

### 10.1 Cấu trúc Vue Component chuẩn

```vue
<template>
  <div class="component-name">
    <!-- Template content -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
const props = defineProps<{
  title: string
  items: Item[]
  loading?: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'add'): void
  (e: 'delete', id: number): void
  (e: 'update', item: Item): void
}>()

// State
const searchQuery = ref('')
const selectedIds = ref<number[]>([])

// Computed
const filteredItems = computed(() =>
  props.items.filter(i => i.name.includes(searchQuery.value))
)
</script>

<style scoped>
/* Component-specific styles — import tokens từ global */
.component-name { }
</style>
```

---

### 10.2 DataTable Vue Component

```vue
<template>
  <div class="table-panel">
    <!-- Toolbar -->
    <div class="table-toolbar">
      <div class="table-toolbar__left">
        <div class="input-wrapper">
          <i class="input-prefix-icon icon-search" />
          <input
            v-model="searchQuery"
            class="input input--has-prefix"
            placeholder="Tìm kiếm..."
            style="width: 240px"
          />
        </div>
        <select v-model="statusFilter" class="input input--select" style="width: 160px">
          <option value="">Trạng thái: Tất cả</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Tạm ngưng</option>
        </select>
      </div>
      <div class="table-toolbar__right">
        <button class="btn-icon btn-icon--outline" @click="refresh"><i class="icon-refresh" /></button>
        <button class="btn btn--outline btn--sm"><i class="icon-upload" /> Nhập từ Excel</button>
        <button class="btn btn--primary btn--sm" @click="emit('add')">
          <i class="icon-plus" /> Thêm
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th class="table__th table__th--checkbox">
              <input type="checkbox" class="checkbox" v-model="allChecked" @change="toggleAll" />
            </th>
            <th v-for="col in columns" :key="col.key" class="table__th"
                :class="{ 'table__th--right': col.align === 'right' }">
              {{ col.label }}
            </th>
            <th class="table__th table__th--action"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in filteredItems"
            :key="row.id"
            class="table__row"
            :class="{ 'table__row--selected': selectedIds.includes(row.id) }"
          >
            <td class="table__td table__td--checkbox">
              <input type="checkbox" class="checkbox" :value="row.id" v-model="selectedIds" />
            </td>
            <td v-for="col in columns" :key="col.key" class="table__td"
                :class="{ 'table__td--right': col.align === 'right' }">
              <!-- Status badge -->
              <template v-if="col.type === 'status'">
                <span class="badge" :class="`badge--${row[col.key]?.color}`">
                  {{ row[col.key]?.label }}
                </span>
              </template>
              <!-- Link -->
              <template v-else-if="col.type === 'link'">
                <a href="#" class="text-brand" @click.prevent="emit('view', row)">
                  {{ row[col.key] }}
                </a>
              </template>
              <!-- Default text -->
              <template v-else>{{ row[col.key] ?? '—' }}</template>
            </td>
            <td class="table__td table__td--action">
              <button class="btn-icon btn-icon--sm" @click="emit('edit', row)">
                <i class="icon-edit" />
              </button>
              <button class="btn-icon btn-icon--sm btn-icon--danger" @click="emit('delete', row.id)">
                <i class="icon-trash" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="paging">
      <span class="text-sm text-secondary">Tổng số: <strong>{{ total }}</strong></span>
      <div class="paging__right">
        <span class="text-sm text-secondary">Số dòng/trang</span>
        <select v-model="pageSize" class="input input--select" style="width:72px;height:28px;font-size:12px">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
        <span class="text-sm text-secondary">{{ pageStart }} - {{ pageEnd }}</span>
        <div class="paging__nav">
          <button class="btn-icon btn-icon--sm" :disabled="currentPage === 1" @click="currentPage = 1">
            <i class="icon-chevrons-left" />
          </button>
          <button class="btn-icon btn-icon--sm" :disabled="currentPage === 1" @click="currentPage--">
            <i class="icon-chevron-left" />
          </button>
          <button class="btn-icon btn-icon--sm" :disabled="currentPage === totalPages" @click="currentPage++">
            <i class="icon-chevron-right" />
          </button>
          <button class="btn-icon btn-icon--sm" :disabled="currentPage === totalPages" @click="currentPage = totalPages">
            <i class="icon-chevrons-right" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Column { key: string; label: string; type?: 'text' | 'status' | 'link'; align?: 'left' | 'right' }
interface Row { id: number; [key: string]: any }

const props = defineProps<{
  columns: Column[]
  items: Row[]
  total: number
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'edit', row: Row): void
  (e: 'delete', id: number): void
  (e: 'view', row: Row): void
}>()

const searchQuery   = ref('')
const statusFilter  = ref('')
const selectedIds   = ref<number[]>([])
const currentPage   = ref(1)
const pageSize      = ref(10)
const allChecked    = ref(false)

const filteredItems = computed(() =>
  props.items.filter(r =>
    Object.values(r).some(v => String(v).toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
)
const totalPages = computed(() => Math.ceil(props.total / pageSize.value))
const pageStart  = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const pageEnd    = computed(() => Math.min(currentPage.value * pageSize.value, props.total))

function toggleAll() { selectedIds.value = allChecked.value ? props.items.map(r => r.id) : [] }
function refresh()   { /* emit reload event */ }
</script>
```

---

### 10.3 Modal Vue Component

```vue
<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal" :style="{ width: width + 'px' }">
        <div class="modal__header">
          <h3 class="h3">{{ title }}</h3>
          <button class="btn-icon" @click="close"><i class="icon-x" /></button>
        </div>
        <div class="modal__body">
          <slot />
        </div>
        <div class="modal__footer">
          <button class="btn btn--ghost" @click="close">Hủy</button>
          <button class="btn btn--primary" :disabled="loading" @click="emit('confirm')">
            {{ loading ? 'Đang lưu...' : 'Lưu' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  title: string
  width?: number
  loading?: boolean
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm'): void
}>()
const close = () => emit('update:modelValue', false)
</script>
```

---

### 10.4 Form Page Vue

```vue
<template>
  <div class="form-page">
    <div class="form-content">
      <div v-for="section in sections" :key="section.id" class="form-section">
        <h3 class="form-section__title h3">{{ section.title }}</h3>
        <div class="form-grid form-grid--2col">
          <div
            v-for="field in section.fields"
            :key="field.key"
            class="field"
            :class="{ 'form-grid__full': field.fullWidth }"
          >
            <label class="field__label">
              {{ field.label }}
              <span v-if="field.required" class="field__required">*</span>
            </label>
            <input
              v-if="field.type !== 'select' && field.type !== 'textarea'"
              class="input"
              :class="{ 'input--error': errors[field.key] }"
              :type="field.type || 'text'"
              :placeholder="field.placeholder"
              v-model="formData[field.key]"
            />
            <select v-else-if="field.type === 'select'" class="input input--select" v-model="formData[field.key]">
              <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <textarea v-else class="input input--textarea" :placeholder="field.placeholder" v-model="formData[field.key]" rows="3" />
            <span v-if="errors[field.key]" class="field__error-msg">{{ errors[field.key] }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="form-action-bar">
      <button class="btn btn--ghost" @click="emit('cancel')">Hủy</button>
      <button class="btn btn--outline" @click="saveAndAdd">Lưu và thêm</button>
      <button class="btn btn--primary" @click="save">Lưu</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const props = defineProps<{ sections: FormSection[] }>()
const emit  = defineEmits<{ (e: 'cancel'): void; (e: 'save', data: any): void }>()

const formData = reactive<Record<string, any>>({})
const errors   = reactive<Record<string, string>>({})

function validate(): boolean {
  let ok = true
  // clear errors
  Object.keys(errors).forEach(k => delete errors[k])
  // check required
  for (const s of props.sections) {
    for (const f of s.fields) {
      if (f.required && !formData[f.key]) {
        errors[f.key] = `${f.label} không được để trống`
        ok = false
      }
    }
  }
  return ok
}

function save()      { if (validate()) emit('save', { ...formData }) }
function saveAndAdd() { if (validate()) { emit('save', { ...formData }); Object.keys(formData).forEach(k => delete formData[k]) } }
</script>
```

---

## 11. CONTENT WRAPPER — List Page đầy đủ

> ⛔ `app-shell` dùng `100vw × 100vh`, không hardcode `1366 × 768`.  
> `main-content` và `content-wrapper` dùng `flex: 1` để tự mở rộng.

```html
<!-- Full List Page layout — RESPONSIVE -->
<div class="app-shell">
  <!-- Global Header -->
  <header class="global-header">...</header>

  <div class="body-row">
    <!-- Sidebar -->
    <aside class="sidebar sidebar--expanded">...</aside>

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- Page Header -->
        <div class="page-header">
          <div class="page-header__left">
            <h1 class="page-header__title h2">Khách hàng</h1>
          </div>
          <div class="page-header__right">
            <button class="btn btn--outline btn--sm"><i class="icon-upload"></i> Nhập Excel</button>
            <button class="btn btn--primary btn--sm"><i class="icon-plus"></i> Thêm</button>
          </div>
        </div>

        <!-- Table Panel -->
        <div class="table-panel">
          <!-- Toolbar + Table + Paging -->
        </div>
      </div>
    </main>
  </div>
</div>
```

```css
/* Content Wrapper — bao page header + table panel */
.content-wrapper {
  display: flex; flex-direction: column;
  flex: 1; min-height: 0;  /* fix overflow trong flex */
  overflow: hidden;
  padding: var(--page-gutter);  /* 16px — cách sidebar / lề phải / lề dưới (mds-ui .content-wrapper) */
  gap: 0;
}

/* Table panel chiếm hết chiều cao còn lại, scroll nội bộ ở table-wrap */
.table-panel { flex: 1; min-height: 0; }
.table-wrap  { flex: 1; min-height: 0; overflow: auto; }
```

---

## 12. ICON USAGE

```
Icons: dùng Tabler Icons (https://tabler.io/icons) hoặc SVG inline.
Tất cả icon slot trong MDS design map sang Tabler Icons tương ứng:

  icon-search          → tabler: search
  icon-plus            → tabler: plus
  icon-edit            → tabler: pencil
  icon-trash           → tabler: trash
  icon-upload          → tabler: upload
  icon-download        → tabler: download
  icon-refresh         → tabler: refresh
  icon-chevron-left    → tabler: chevron-left
  icon-chevron-right   → tabler: chevron-right
  icon-chevrons-left   → tabler: chevrons-left
  icon-chevrons-right  → tabler: chevrons-right
  icon-arrow-left      → tabler: arrow-left
  icon-x               → tabler: x
  icon-filter          → tabler: filter
  icon-settings        → tabler: settings
  icon-bell            → tabler: bell
  icon-user            → tabler: user
  icon-home            → tabler: home
  icon-trending-up     → tabler: trending-up
  icon-trending-down   → tabler: trending-down
  icon-eye             → tabler: eye
  icon-copy            → tabler: copy
  icon-more            → tabler: dots (horizontal)

Import Tabler Icons vào dự án:
  npm install @tabler/icons-vue
  → <IconPlus :size="16" />

TIcon.vue (tại @mds/components/TIcon.vue) — quy tắc bắt buộc:
  • TIcon dùng MAP thủ công — PHẢI làm ĐỦ 2 bước khi thêm icon mới:
    1. import IconXxx from '@tabler/icons-vue/dist/esm/icons/IconXxx.mjs'
       ⛔ KHÔNG import { IconXxx } from '@tabler/icons-vue' — kéo cả bộ ~5.000 icon (dev tải 5 MB)
    2. Thêm vào MAP: 'ten-icon': IconXxx
  • Nếu chỉ làm 1 bước, icon sẽ render trống không có lỗi.
  • Kiểm tra icon tồn tại trong package trước khi thêm:
      ls node_modules/@tabler/icons-vue/dist/esm/icons/IconXxx.mjs
  • Alias trong vite.config.js của app trỏ vào THƯ MỤC gói (không trỏ file bundle):
      '@tabler/icons-vue': path.resolve(__dirname, 'node_modules/@tabler/icons-vue')
    và thêm  optimizeDeps: { exclude: ['@tabler/icons-vue'] }  — tránh Vite re-optimize giữa chừng khi gặp icon mới (gây trang trắng)

IconMisaAI.vue (tại @mds/components/IconMisaAI.vue) — component riêng biệt:
  • KHÔNG phải Tabler icon — là branding MISA riêng.
  • CSS gradient circle 24×24 + 21 vector PNG từ Figma asset, tất cả absolute inside.
  • 2 layer dùng mix-blend-mode: screen.
  • Dùng trực tiếp <IconMisaAI /> không qua TIcon.
```

---

## 13. ECHARTS — BIỂU ĐỒ

> Thư viện chart DUY NHẤT được dùng. CDN: `https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js`

### Setup chuẩn

```html
<!-- Container PHẢI là <div> với width/height rõ ràng -->
<div id="myChart" style="width:100%; height:220px;"></div>
```

```js
function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

/* Khởi tạo lazy khi container hiển thị */
const chart = echarts.init(document.getElementById('myChart'));

/* ── Font InterVariable toàn cục cho mọi text trong chart ──
   ⛔ NGHIÊM CẤM dùng 'Inter', 'Arial', 'system-ui' hay bất kỳ font nào khác.
   Phải set TRƯỚC setOption() đầu tiên.                                          */
const FONT = 'InterVariable, "Inter var", sans-serif';  // KHÔNG ĐƯỢC sửa chuỗi này
chart.setOption({
  textStyle: { fontFamily: FONT, fontSize: 11 }
});

/* Resize theo window */
window.addEventListener('resize', () => chart.resize());
```

> **Rule:** `textStyle` với `fontFamily: FONT` (`'InterVariable, "Inter var", sans-serif'`) PHẢI được set ngay sau `echarts.init()`, trước khi gọi bất kỳ `setOption()` nào khác.
> ⛔ **NGHIÊM CẤM** hardcode `'Inter, system-ui, sans-serif'` hoặc bất kỳ font nào khác — `'Inter'` không phải tên font đã cài, browser sẽ fallback sang Arial trên Windows.

### Chart color palette (đã định nghĩa trong `mds-ui/src/style.css`)

| Biến | Hex | Dùng cho |
|---|---|---|
| `--chart-c1` | `#245fdf` | Brand blue — series chính / cột đơn |
| `--chart-c2` | `#12b76a` | Success green — tuyển mới / tăng trưởng |
| `--chart-c3` | `#f79009` | Warning orange — cảnh báo / trung tính |
| `--chart-c4` | `#f04438` | Danger red — nghỉ việc / giảm |
| `--chart-c5` | `#0ba5ec` | Info cyan — thông tin bổ sung |
| `--chart-c6` | `#7a5af8` | Accent purple — phân loại thứ 6 |
| `--chart-primary` | = `--bg-brand` | **Màu chính theo theme** — thước đo chính (cột / đường điểm). Đổi theme → đổi màu; nhớ `watch(currentTheme, renderCharts)` (`@mds/theme.js`) để ECharts vẽ lại |
| `--chart-target` | `--chart-c3` (theme Cam: `--chart-c6`) | Đường mục tiêu / kỳ vọng nét đứt đi kèm `--chart-primary` |

> **Màu trạng thái (c2 thành công · c3 cảnh báo · c4 nguy hiểm) KHÔNG theo theme**, và biểu đồ trạng thái (VD phân bổ mức đánh giá) giữ c1 cố định cho mức trung tính — nếu dùng `--chart-primary` thì theme Xanh lá / Xanh ngọc trùng màu thành công, Hồng / Đỏ / Cam trùng màu nguy hiểm (validator ΔE < 15).

```js
// Dùng đúng: luôn qua cssVar()
itemStyle: { color: cssVar('--chart-c1') }

// SAI: không tự đặt tên biến không tồn tại
itemStyle: { color: cssVar('--chart-revenue') }  // ← undefined → màu lỗi
```

> **⚠️ NGHIÊM CẤM** dùng tên biến `--chart-revenue`, `--chart-profit` hay bất kỳ tên nào không có trong bảng trên. Chỉ dùng `--chart-c1` đến `--chart-c6`.

---

### ⚠️ RULES STYLING BẮT BUỘC

#### 1. Bar / Column chart — bo góc đỉnh thanh

Mọi series `type: 'bar'` đều PHẢI có bo góc 4px tại 2 góc đỉnh của thanh.

| Hướng thanh | `borderRadius` |
|---|---|
| **Column** (dọc — xAxis = category) | `[4, 4, 0, 0]` — bo góc trên-trái + trên-phải |
| **Bar** (ngang — yAxis = category) | `[0, 4, 4, 0]` — bo góc phải-trên + phải-dưới |

```js
// Column chart
itemStyle: { color: cssVar('--chart-c1'), borderRadius: [4, 4, 0, 0] }

// Horizontal bar chart
itemStyle: { color: cssVar('--chart-c1'), borderRadius: [0, 4, 4, 0] }
```

#### 2. Pie / Donut chart — bo góc slice + gap giữa các phần

Mọi series `type: 'pie'` đều PHẢI có:
- **Bo góc ngoài** 4px: `itemStyle.borderRadius: [4, 0]` → `[outerCorner, innerCorner]`
- **Gap 2px** giữa các slice: `itemStyle.borderColor: '#fff', borderWidth: 2`

```js
// Áp dụng ở cấp series (default cho toàn bộ slice)
itemStyle: {
  borderRadius: [4, 0],   // bo 4px góc ngoài; góc trong (donut hole) = 0
  borderColor: '#fff',    // màu nền trang = trắng → tạo gap trắng
  borderWidth: 2          // 2px gap giữa các slice
}
```

> **Lưu ý:** `borderColor` phải khớp với màu nền card/trang. Nếu card nền `var(--bg-neutral-light)` thì dùng `borderColor: getComputedStyle(...).getPropertyValue('--bg-neutral-light')` hoặc hardcode màu tương đương.

---

### Bar + Line combo

```js
chart.setOption({
  grid: { top: 12, right: 8, bottom: 28, left: 44 },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  xAxis: {
    type: 'category', data: ['T1','T2','T3','T4','T5','T6','T7'],
    axisTick: { show: false }, axisLine: { show: false },
    axisLabel: { color: cssVar('--text-hint'), fontSize: 11 }
  },
  yAxis: {
    type: 'value', splitLine: { lineStyle: { color: cssVar('--stroke-neutral-light'), type: 'dashed' } },
    axisLabel: { color: cssVar('--text-hint'), fontSize: 11 },
    axisLine: { show: false }, axisTick: { show: false }
  },
  series: [
    {
      name: 'Doanh thu', type: 'bar',
      data: [380, 350, 980, 440, 420, 400, 390],
      itemStyle: { color: cssVar('--chart-c1'), borderRadius: [4, 4, 0, 0] }, // ← bo góc đỉnh
      barMaxWidth: 40
    },
    {
      name: 'Lợi nhuận', type: 'line',
      data: [260, 250, 820, 380, 360, 340, 320],
      smooth: true,
      lineStyle: { color: cssVar('--chart-c2'), width: 2.5 },
      itemStyle: { color: cssVar('--chart-c2'), borderColor: '#fff', borderWidth: 2 },
      symbol: 'circle', symbolSize: 8
    }
  ]
});
```

### Donut (Pie với radius kép)

```js
chart.setOption({
  tooltip: { trigger: 'item', formatter: '{b}: <b>{c}%</b>' },
  series: [{
    type: 'pie',
    radius: ['55%', '78%'],
    center: ['50%', '50%'],
    label: { show: false }, labelLine: { show: false },
    itemStyle: {
      borderRadius: [4, 0],  // ← bo 4px góc ngoài (cạnh trên của arc)
      borderColor: '#fff',   // ← gap trắng
      borderWidth: 2         // ← 2px gap giữa các slice
    },
    data: [
      { value: 40, name: 'Lương',     itemStyle: { color: cssVar('--chart-c1') } },
      { value: 20, name: 'Media',     itemStyle: { color: cssVar('--chart-c2') } },
      { value: 15, name: 'Mặt bằng', itemStyle: { color: cssVar('--chart-c3') } },
      { value: 10, name: 'Vận hành', itemStyle: { color: cssVar('--chart-c4') } },
      { value: 10, name: 'Tiện ích', itemStyle: { color: cssVar('--chart-c5') } },
      { value: 5,  name: 'Khác',     itemStyle: { color: cssVar('--chart-c6') } }
    ]
  }]
});
```

### Pie thuần (không có hole)

```js
chart.setOption({
  series: [{
    type: 'pie',
    radius: '70%',
    itemStyle: {
      borderRadius: [4, 0],  // ← bo 4px góc ngoài
      borderColor: '#fff',
      borderWidth: 2
    },
    data: [ /* ... */ ]
  }]
});
```

---

## 14. GLOBAL HEADER — ControlHeader Component

> Component chuẩn tại `@mds/components/ControlHeader.vue`. Import và dùng trực tiếp trong app.

### Props
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `app-name` | String | `'Kế Toán'` | Tên app cạnh logo |
| `no-meta` | Boolean | `false` | Ẩn company selector + year badge |
| `hide-trial-banner` | Boolean | `false` | Ẩn banner dùng thử |
| `settings-only` | Boolean | `false` | Nút bánh răng mở thẳng dialog "Thiết lập màu sắc và hiển thị" (bỏ popover "Các tiện ích và thiết lập") — dùng cho app nội bộ không có nghiệp vụ kế toán |
| `user-email` · `user-role` · `user-picture` | String | `''` | Thông tin hiện trong menu avatar. Avatar có ảnh (Google picture) thì hiện ảnh, không thì chữ cái đầu theo `avatar-name` |
| `@logout` | event | | Có bắt sự kiện → menu avatar hiện **Đăng xuất**. `profile-menu` `[{ id, icon, label } | { separator: true }]` + `@profile-select` để thêm mục (VD Hồ sơ cá nhân); `{ separator: true }` = vạch ngăn nhóm theo Menu List (VD tách mục “Tài liệu Design System” khỏi nhóm tài khoản) |
| (khoảng cách) | | | Theo Figma Global Header 6019:195346 — có sẵn trong mds-ui: lề 16, logo → tên app 12, cụm logo → thông tin 16, ô tìm kiếm → cụm icon 16, icon ↔ icon ↔ avatar 8 (slot `#header-actions` + nút mặc định + avatar nằm chung `.header-tools`). ⛔ App không tự đặt gap cho `.header-right` / `.header-tools` |
| `hide-avatar` | Boolean | `false` | Ẩn avatar / menu tài khoản — trang công khai khi người xem chưa đăng nhập (VD tài liệu `/ds`); đặt link “Đăng nhập” vào slot `#header-end` |
| slot `#header-start` · `#header-end` | | | Nút trước logo (VD ☰ mở menu trái ở màn hẹp) · phần tử ngay trước avatar (VD “Đăng nhập”). Mọi app có header — kể cả trang tài liệu — dùng ControlHeader để bánh răng luôn mở **Thiết lập màu sắc và hiển thị**; ⛔ không tự dựng header riêng (người dùng không đổi được theme) |
| `home-href` | String | `'/'` | Trang chủ của app. **⛔ Quy chuẩn: bấm logo + tên app trên header luôn về trang chủ (màn Tổng quan / trang mặc định).** App dùng vue-router bắt `@home` → `router.push(homeHref)` để không tải lại trang; không bắt thì link đi tới `home-href` |
| `settings-menu` | Array | `[]` | Mục thêm vào menu bánh răng `[{ id, icon, label }]` → bánh răng xổ menu: mục đầu cố định “Thiết lập hiển thị” (mở dialog màu sắc / mật độ), sau đó các mục của app; chọn mục → emit `settings-select(item)`. **⛔ Quy chuẩn: cài đặt chung của app (Cài đặt hệ thống, tích hợp, cấu hình…) đặt ở menu bánh răng này — KHÔNG đặt mục cài đặt ở sidebar.** Mục chỉ dành cho Quản trị thì chỉ truyền khi người dùng là Quản trị |
| `hide-tools` | Array | `[]` | Ẩn công cụ app không dùng: `'search'` · `'ai'` · `'notify'` · `'help'` · `'more'` (KHÔNG để nút không hoạt động trên header) |
| `avatar-name` | String | `''` | Tên người dùng → avatar góc phải hiện chữ cái đầu, nền/chữ theo `AVATAR_PALETTE`, viền `--stroke-neutral-light` (`.header-avatar--initials`). Trống → avatar mặc định |

### Slots
- `#header-left` — logo + tên app
- `#header-meta` — company selector + year badge (nằm giữa left và center-search)
- `#header-center` — search box
- `#header-right` — không dùng (toolbar buttons đã built-in)

### header-company (combo chọn đơn vị)
```css
.header-company {
  font-size: 14px; font-weight: var(--fw-medium);
  color: white; background: transparent; border: none;
  padding: 4px 6px; border-radius: var(--radius-default);
}
.header-company:hover { background: rgba(255,255,255,0.12); }
```

### header-year-badge (pill năm tài chính)
```css
.header-year-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 0 12px 0 8px; height: 28px; border-radius: var(--radius-default);
  font-size: 12px; font-weight: 400;
  background: rgba(255,255,255,0.2); color: white;
}
```

### Toolbar button order (Figma standard — KHÔNG được đổi thứ tự)
Settings → MISA AI (`<IconMisaAI />`) → Bell → Help → More (dots-circle-horizontal) — KHÔNG đặt icon AMIS Chat trên Global Header (bỏ từ 2026-11-03)

### White header mode (Giao diện sáng)
- `currentMode` ref trong `theme.js` — giá trị `'color'` (brand bg) hoặc `'light'` (white bg)
- `applyMode(mode)` persist vào `localStorage('mds-header-mode')`
- **⛔ Tổ hợp Tiêu đề (header) × Sidebar chỉ có 3 kiểu:** header **màu** + sidebar **sáng** · header **trắng** + sidebar **sáng** · header **trắng** + sidebar **tối**. **Cấm header màu + sidebar tối.** `theme.js` đã tự khóa: `applySidebarMode('dark')` khi header màu → về `'light'`; `applyMode('color')` khi sidebar tối → sidebar về sáng; helper `sidebarDarkAllowed(headerMode)`. Hộp Thiết lập màu sắc: chọn Tiêu đề “Màu đang chọn” → Sidebar tự về “Nền trắng”, nút “Nền tối” mờ (`aria-disabled`, tooltip “Chỉ dùng được khi Tiêu đề màu trắng”). App đặt mặc định riêng (VD sidebar tối) thì phải đi kèm header trắng; dựng ảnh / ví dụ / Figma cũng theo đúng 3 kiểu này.
- Header toggle: `:class="{ 'global-header--white': currentMode === 'light' }"`
- CSS override `.global-header--white`:
  ```css
  .global-header--white { background: var(--bg-white); border-bottom: 1px solid var(--stroke-neutral-light); }
  .global-header--white .header-company       { color: var(--text-primary); }
  .global-header--white .header-company:hover { background: var(--bg-neutral-hover); }
  .global-header--white .header-year-badge    { background: transparent; border: 1px solid var(--stroke-neutral); color: var(--text-primary); }
  .global-header--white .btn-icon-white       { color: var(--icon-neutral); }
  .global-header--white .search-box-header    { background: var(--bg-neutral-light); }
  ```

### Settings dialog — mini preview header
```js
const miniHeaderStyle = computed(() => draftMode.value === 'light'
  ? { background: 'white', borderBottom: '1px solid #e9eaeb' }
  : { background: previewColor.value.main }
)
```

---

## 15. CHECKLIST SAU KHI VIẾT CODE

```
CONTROLS PRE-CHECK — Phải pass TRƯỚC khi viết code (không phải sau)
□ Đã đọc vue-controls.md trước khi bắt đầu?
□ Mọi Vue component (TableHeader, DataTable, AppSidebar, ControlHeader...) đều kéo từ mds-ui?
□ Mọi button đều dùng class từ danh sách đã duyệt (btn--primary, btn--outline btn--neutral...)?
□ Không có HTML bảng thủ công nào — tất cả bảng dùng DataTable component?
□ Element nào chưa có trong danh sách → đã để trống và báo user chưa?
□ Không tự thêm prop/slot/CSS override lên component gốc?

RESPONSIVE & LAYOUT
□ app-shell dùng 100vw × 100vh — KHÔNG hardcode 1366px / 768px?
□ Cấu trúc đúng: app-shell → header → body-row → [sidebar-host + main-content]?
□ Sidebar nằm sát header, KHÔNG có element nào chen giữa header và sidebar?
□ Sub-nav tabs (nếu có) đặt TRONG main-content, KHÔNG đặt ngoài body-row?
□ Sub-nav chiều cao đúng 48px?
□ sidebar-host là flex item (position:relative), sidebar là position:absolute bên trong?
□ Sidebar hover-expand dùng CSS :hover — KHÔNG dùng JS mouseenter/mouseleave?
□ btn-add-quick text dùng max-width:0/overflow:hidden (KHÔNG opacity:0 vì giữ layout space)?
□ Sidebar item label dùng class .sidebar-item__label (không dùng <span> thuần)?
□ Sidebar item icon: color = --icon-neutral (explicit)?  Sidebar item text: color = --text-primary?
□ Sidebar, header có fixed height/width MDS — main content dùng flex:1?
□ flex children có min-height: 0 / min-width: 0 để tránh overflow?
□ table-wrap có overflow: auto để scroll nội bộ?
□ form-grid có @media breakpoint thu về 1 cột khi màn nhỏ?

DESIGN TOKENS
□ Tất cả màu dùng CSS variable (--text-*, --bg-*, --stroke-*)?
□ Spacing lấy từ token variable (không hardcode px tùy ý)?
□ Button height 32px? Min-width 80px?
□ Input height 32px? Padding 8px 12px?
□ Table row height 56px? Dòng có 2 dòng chữ (cột subtext / avatar-subtext / tên + dòng phụ) LUÔN 56px — đo thật, không để chen trong dòng 32–36px?
□ Tooltip không lặp lại chữ đang hiện đủ (chỉ icon / chữ bị cắt / viết tắt / giải thích khác)? Bấm xong rời chuột không còn tooltip treo?
□ Pagination cao --paging-h (48 · 40 · 56), KHÔNG viền trên? Dòng Tổng cao --dt-footer-h (36 · 32 · 40), chữ Semi Bold? Bảng có dòng Tổng: khung cao → Tổng bám sau dòng cuối; khung thấp + cuộn → Tổng ghim sát trên Paging (đo footer/paging bằng Playwright)?
□ Page Header height 56px?
□ Global Header height 48px?
□ Sidebar width 200px (expanded) / 64px (collapsed)?
□ Modal / popover bo --radius-dialog (12px — chỉ popup / dialog, KHÔNG gõ 12px)? Shadow dùng --shadow-dialog (= Drop Shadow/Neutral/Bottom 12, 0 4px 12px 0 Alpha Black 100)? Nền --bg-white?
□ MỌI khối nền trắng trên nền BG Page: bo --radius-card (8px mọi mật độ) + shadow Neutral All 2 (--shadow-card), không viền — kiểm cả ở Nhỏ?
□ Card có nhiều nhóm trường: nhóm cách 32px (.detail-groups), tiêu đề nhóm cách lưới 12px?
□ Control (input, button, tag...): dùng --radius-default (compact tự = 6px)?
□ Card ↔ card cách đúng 16px (--card-col-gap)?
□ Đệm trong MỌI card / khối nền = 16px đều 4 phía (--box-padding) — không có `padding: 8px 12px` / `12px` kiểu lệch?
□ Control ↔ control cạnh nhau (Button–Button, Button–Textbox…) cách đúng 8px (--gap-control), dùng gap của container, KHÔNG margin?
□ Nội dung cách sidebar / lề phải / lề dưới đúng 16px (--page-gutter) — đo bằng Playwright, không chỉ nhìn?
□ Form nhãn trái: nhãn 200px Regular, nhãn→ô 8px, hàng cách 12px (.form-fields--h + AppInput :vertical="false")?
□ Form nhãn trên: nhãn Semibold, nhãn→ô 4px, trường cách 16px (.form-fields + AppInput)?
□ Form / chi tiết 2 cột: cột cách 80px, < 760px về 1 cột (.form-fields--2col / .detail-grid)?
□ Màn chi tiết dùng <DetailField> (nhãn 200px + giá trị gạch chân, sửa nhanh ✓/✕)?
□ Mọi icon rời bấm được là btn-icon (Medium 32) / btn-icon--sm (Small 28) — không có <TIcon @click>, không nút icon tự dựng?
□ Box / card thấp (inline alert, thông báo, chip, card nhỏ): icon + chữ + nút căn giữa dọc (align-items:center) — chụp màn đo khoảng cách chữ→mép trên ≈ chữ→mép dưới?
□ Danh sách có drawer: dòng đang mở luôn đánh dấu (_mark 'current', độc lập ô tick) — test mở / tick dòng khác / ↓ / Esc, với cả tài khoản có quyền tick? Không có pageerror trên mọi trang + tab?
□ Bấm qua lại mọi tab / trạng thái (cả kịch bản nút / link điều kiện ẩn ↔ hiện): thanh tab, toolbar, tiêu đề đứng yên — __layoutKey giống hệt giữa các lần?
□ Không viền đôi: đã chạy references/double-border-check.js → window.__doubleBorders(sel) = [] ở mọi trạng thái (thu gọn / mở rộng / hover / đang chọn / tối)?
□ Mọi popup / dropdown / dialog / form vừa làm: đã chạy overflow-check.js ở dữ liệu tối đa (99+, tên dài, đủ nút điều kiện) × 1366px + 375px → [] (không phần tử tràn khung)? Lưới dùng minmax(0, 1fr)?
□ MỌI số hiển thị (bảng, dòng Tổng, KPI, câu mô tả, biểu đồ) theo TT200: 1.234.567,89 qua fmtNum / fmtPct — không còn String(n) / toFixed / replace('.', ',')? Cột mã / năm có col.format:false?
□ Đã rê chuột qua TỪNG thứ bấm được trên màn — cái nào cũng đổi nền / viền / màu khi hover (không chỉ đổi cursor)?

CODE QUALITY
□ Vue component: dùng Composition API (<script setup>)?
□ Không có placeholder text tự bịa — label, cột, dữ liệu lấy đúng từ yêu cầu?
□ Icon dùng đúng Tabler Icons class?
□ Không hardcode hex nào ngoài CSS variables?
□ Code chạy được ngay, không có TODO hay ...?
□ Scorecard/KPI: title 13px semibold text-secondary, value 20px bold text-primary?
□ Icon minh hoạ KPI: dạng outline + nền màu nhạt cùng tông (.kpi-icon--{theme}), không filled / emoji / nền đậm?
□ Card lớn (chart/list/table): title dùng H3 — 16px semibold text-primary?

CHART (nếu có biểu đồ)
□ Dùng ECharts 5 (CDN), KHÔNG dùng Chart.js hay thư viện khác?
□ Container là <div> (không phải <canvas>)?
□ Màu sắc đọc qua cssVar(), không hardcode hex trong setOption()?
□ Có gọi chart.resize() khi window resize?
□ Font Inter đã set qua textStyle global? (xem Section 13 — Setup chuẩn)
□ Bar/Column chart: borderRadius: [4,4,0,0] (column) hoặc [0,4,4,0] (bar ngang)?
□ Pie/Donut chart: itemStyle có borderRadius:[4,0], borderColor:'#fff', borderWidth:2?
```

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
