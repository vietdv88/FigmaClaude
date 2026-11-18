---
name: mds
description: Điểm vào DUY NHẤT để làm giao diện MISA trong monorepo FigmaClaude — dùng khi người dùng gõ /mds hoặc nói "dựng / tạo / làm app mới", "làm trang", "làm màn hình", "thêm màn danh sách / dashboard / form / popup", "sửa giao diện", "UI MISA / MDS". Tự nạp đúng quy chuẩn, control mds-ui và kiểm tra cuối; người dùng KHÔNG cần nhắc tên skill hay control nào.
---

# /mds — làm giao diện MISA theo chuẩn

Người dùng chỉ cần nói việc cần làm (ví dụ: `/mds app quản lý hợp đồng: danh sách, chi tiết, báo cáo`). Bạn tự làm đủ các bước dưới đây, không hỏi lại về skill / control.

## 1. Chuẩn bị (bắt buộc, trước khi viết code)
0. Tri thức người dùng dạy đã được hook SessionStart (`mds-docs/scripts/session-sync.mjs`) kéo về đầu phiên (nếu cũ hơn 1 giờ) và báo phần MỚI ĐỔI trong ngữ cảnh — đọc phần đó trước. Cần làm mới giữa phiên: chạy `node mds-docs/scripts/pull-live.mjs --max-age=24` (kéo trang /ds + tri thức tự nhập từ server rồi sinh `references/ds-*`; bỏ qua nếu dữ liệu < 24 giờ; máy đã có lịch tự chạy hằng ngày 8:30). Lỗi mạng thì dùng bản đang có và báo người dùng.
1. Gọi skill **mds-webapp-developer** (nguồn chính quy chuẩn).
2. Đọc `references/ds-notes.md` (tri thức người dùng dạy — ưu tiên cao nhất) và `references/ds-pages.md` (mục lục trang /ds). Với mỗi loại control / màn sắp làm, mở trang `references/ds/<slug>.md` tương ứng + file demo mẫu `mds-docs/src/demos/*Demo.vue` được ghi trong mục lục — mẫu đó là chuẩn để bám theo.
3. Đọc `references/vue-controls.md` (control có sẵn) và `references/ui-specs.md` (đặc tả từng loại).
4. Theo loại màn: danh sách → `LIST-PAGE.md` · dashboard → `references/echarts-dashboard.md`, `widget-grid.md` · kéo thả → `drag-drop.md` · số liệu cụ thể → `references/design-tokens.md` + `mds-ui/src/style.css`.
5. Có trợ lý AI → gọi skill **ai-assistant-cost**. Đọc mục “Checklist lỗi hay lặp lại” cuối `references/ui-specs.md`.
6. Nếu thiếu thông tin nghiệp vụ (tên app, các màn, dữ liệu) thì hỏi MỘT lần, gọn; còn lại tự quyết theo mặc định của chuẩn.

## 2. Dựng
- App mới: tạo thư mục `FigmaClaude/<tên-app>/` theo cấu trúc của một app mẫu cùng loại (vd `chamdiem-app`, `qlns-app`), import `@mds` — KHÔNG chép CSS / quy chuẩn vào app.
- Chỉ dùng control và token của mds-ui; không tự viết kích thước px cho nút / ô nhập. Cần control chưa có → thêm vào mds-ui (không viết cục bộ trong app).
- **Mỗi màn = `<AppPage>`** (+ `AppMasterDetail` / `AppDrawer`), popover = `AppPopover` / `DropdownMenu` — theo mục "🔒 3 KHOÁ BẮT BUỘC" đầu skill mds-webapp-developer. Hook **ui-lint** tự chạy sau mỗi lần sửa .vue/.css: báo ⛔ là sửa ngay.

## 3. Kiểm tra trước khi báo xong
- **Bắt buộc:** chạy app rồi `node mds-ui/scripts/ui-guard.mjs <url từng màn vừa sửa> [--step "click:…"]` tới khi ĐẠT (nhảy khi hover, gãy dòng, đè nhau, tràn khung, viền đôi, lỗi JS · 1366 + 375). Hook Stop chặn kết thúc lượt nếu chưa chạy sau lần sửa cuối.
- Gọi **control-audit** (kích thước control) và **ui-release-checklist** (checklist phát hành) khi bàn giao / phát hành.
- Báo kết quả trung thực: mục nào chưa đạt thì nói rõ.

## 4. Quy tắc mới phát sinh
**mds-docs (/ds) là nguồn người dùng dạy.** Quy tắc người dùng dạy trên /ds hoặc tab Tri thức tự nhập thì KHÔNG chép tay vào skill — chạy `node mds-docs/scripts/pull-live.mjs` (kéo từ server + sinh `ds-notes.md`, `ds-pages.md`, `ds/`) — script cũng tự chạy hằng ngày và mỗi lần `/mds`. Quy tắc do Claude tự đúc kết khi làm việc thì ghi vào **mds-webapp-developer** (+ `style.css` nếu là token / control). Cuối cùng chạy `mds-docs/scripts/build-knowledge.mjs` (đồng bộ tri thức AVA). Không tạo bản sao quy chuẩn thứ hai.
