---
name: ui-release-checklist
description: Chạy CHECKLIST KIỂM TRA GIAO DIỆN trước khi phát hành sản phẩm lần đầu (bản tester của nhóm Design System — Google Sheet 1AZPHz4g…) trên một web app MDS (chamdiem-app, congviec-app, mds-docs, app mới…) — favicon, tiêu đề trình duyệt, header / sidebar, màn danh sách (hover dòng, thao tác dòng, lọc, phân trang, F5), màn chi tiết (focus ô đầu, chọn hết chữ, thứ tự Tab, combo bằng phím, cảnh báo rời trang, Ctrl+S / Esc, nút đang lưu), hiển thị 1366, spacing / shadow / typography / icon, các trạng thái hover / focus / disabled / readonly / lỗi / trống / loading. Mục nào đã ĐẠT thì lưu lại, lần sau KHÔNG chạy lại. Dùng khi người dùng nói “chạy tester checklist”, “kiểm tra trước khi phát hành / release / go-live”, “checklist UI lần đầu phát hành”, hoặc trước khi bàn giao app cho tester.
---

# Checklist kiểm tra giao diện trước khi phát hành

Nguồn: Google Sheet **“CHECKLIST KIỂM TRA GIAO DIỆN ỨNG DỤNG”** (`1AZPHz4gpLLXJL1HS_f8MniOXgj5D0XNEgtTCD-emW_w`, tab gid 0) — đã chuyển thành `references/checklist.json` (39 mục · 5 nhóm: Chung · Màn hình danh sách · Màn hình chi tiết · Layout & Visual · Trạng thái). Link quy chuẩn cũ `mind-glyph-…figma.site/<trang>` = trang tài liệu `/ds/<trang>`.
Sheet đổi nội dung → tải lại CSV (`…/export?format=csv&gid=0`) và cập nhật `checklist.json` (giữ nguyên `id` các mục cũ để không mất trạng thái).

## Mục đã làm thì không chạy lại
Mỗi app có file trạng thái **`<thư mục app>/.ui-release-checklist.json`** (commit cùng app). Mục **Đạt** hoặc **Không áp dụng** → các lần sau bỏ qua; chỉ chạy mục **chưa kiểm** hoặc **Chưa đạt**.

```bash
SK=<đường dẫn skill>/ui-release-checklist
node $SK/scripts/checklist.mjs pending <appDir>            # in các mục cần chạy (kèm cách làm, quy chuẩn, kết quả lần trước)
node $SK/scripts/checklist.mjs set <appDir> <id> pass "bằng chứng"   # pass | fail | na
node $SK/scripts/checklist.mjs report <appDir>             # ghi ui-release-checklist.md + .csv (cột giống Google Sheet → dán vào cột Trạng thái / Ghi chú)
node $SK/scripts/checklist.mjs pending <appDir> --all      # chỉ khi người dùng bảo “chạy lại toàn bộ”
node $SK/scripts/checklist.mjs reset <appDir> <id>         # sửa lớn ở phần liên quan → bỏ trạng thái để chạy lại mục đó
```

## Quy trình mỗi lần chạy
1. `pending` → danh sách mục cần chạy. Không còn mục nào → báo “đã đạt đủ”, dừng.
2. Chạy app (dev hoặc bản build), mở bằng Playwright ở **1366×768** (thêm 375 nếu app có giao diện mobile). Nạp 3 script dò:
   ```js
   for (const f of ['ui-release-checklist/references/ui-probes.js', 'mds-webapp-developer/references/overflow-check.js', 'mds-webapp-developer/references/double-border-check.js'])
     await page.addInitScript(fs.readFileSync(path.join(SKILLS, f), 'utf8'))
   page.on('pageerror', e => errors.push(e.message))   // lỗi JS = Chưa đạt cho màn đó
   ```
3. Với từng mục, làm theo trường `method` trong `checklist.json`:
   - **Tự động** (`mode: auto`): đo bằng `window.__probe.*` / thao tác bàn phím / F5 / làm chậm mạng (`page.route(..., r => setTimeout(() => r.continue(), 1500))`) → tự kết luận `pass` / `fail`, ghi bằng chứng cụ thể (giá trị đo, màn nào, selector).
   - **Bán tự động** (`semi`): chụp ảnh đúng chỗ (lưu `<appDir>/.ui-release-checklist/<id>.png`), so với quy chuẩn trong skill mds-webapp-developer / trang /ds; lỗi rõ ràng → `fail`; trông đúng → nêu trong báo cáo “cần người xác nhận”, CHƯA ghi `pass` cho tới khi người dùng xác nhận.
   - **Thủ công** (`manual`: sidebar theo thiết kế riêng của dự án, đa ngôn ngữ): hỏi người dùng kết quả hoặc ghi `na` nếu app không có (VD không đa ngôn ngữ).
   - Mục không áp dụng cho app (VD app không có màn danh sách) → `na` + lý do.
4. Ghi kết quả từng mục ngay (`set`) — lỡ dừng giữa chừng thì lần sau chạy tiếp phần còn lại.
5. `report` → gửi người dùng bảng tóm tắt: số Đạt / Chưa đạt / cần xác nhận, từng mục Chưa đạt kèm **màn nào · sai gì · sửa thế nào** (chỉ quy chuẩn tương ứng). Lỗi nằm ở control dùng chung → sửa tận gốc trong mds-ui (skill mds-webapp-developer), không vá riêng app.

## Gợi ý kiểm tra nhanh theo nhóm
- **Danh sách**: rê dòng (`__probe.rowCursor()`), mở menu ⋯ ở **dòng cuối** (phải lật lên, không bị che), tick checkbox → thanh hàng loạt, lọc cột ↔ lọc nâng cao liên thông, đổi trang / số dòng, F5 giữ nguyên màn + tham số URL, mạng chậm → spinner / skeleton, không dữ liệu → màn trống đúng dạng.
- **Chi tiết / form**: mở form → `__probe.focused()`; bấm ô có chữ → `__probe.selectAllOnClick()`; Tab n lần ghi `__probe.focusLabel()` từng bước; combo: ↓ mở, ↑ ↓ chọn, Enter; sửa rồi F5 → cảnh báo (`page.on('dialog')`), rời màn trong app → hộp “Thoát và không lưu?”; Ctrl + S lưu, Esc đóng; API lưu chậm → nút Lưu đang xử lý, bấm 2 lần nhanh chỉ tạo 1 bản ghi; lưu thiếu trường bắt buộc → viền đỏ + tooltip lỗi, focus ô lỗi đầu tiên.
- **Layout & Visual**: `__overflow(...)` = [] và `__doubleBorders()` = [] ở mọi popup / bảng / card; `__probe.fontSizes()` (không chữ < 13px); `__probe.shadows()` + grep code không còn `box-shadow` gõ tay / `--shadow-md` / `--shadow-lg`; kích thước control theo token (skill **control-audit**).
- **Trạng thái**: hover link / button / dòng, focus ô nhập (viền rõ), disabled (mờ, không bấm), readonly (nền mờ, vẫn copy được), lỗi, trống, loading, mục đang chọn (menu / tab / dòng đang xem) phân biệt rõ.
