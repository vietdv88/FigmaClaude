<!-- SINH TỰ ĐỘNG từ mds-docs /ds/onboarding-uiux (2026-11-18) — không sửa tay -->
# Onboarding UI/UX

> Lộ trình tuần đầu cho UI/UX Designer mới: đọc gì theo thứ tự nào, chọn cấu hình sản phẩm, lỗi hay mắc, checklist tự soát trước khi gửi review — tick tiến độ ngay trên trang.

Chào mừng bạn đến với đội UI/UX! Trang này là **lộ trình tuần đầu tiên**: đọc gì trước, chọn cấu hình nào cho sản phẩm, những lỗi người mới hay mắc và checklist tự soát trước khi gửi thiết kế đi review. Tick từng việc khi xong — tiến độ được lưu trên trình duyệt của bạn.

::: tip Hỏi nhanh bất cứ lúc nào
Bấm biểu tượng **AVA** trên thanh tiêu đề để hỏi quy chuẩn (kích thước, màu, khoảng cách, nên dùng control nào…) hoặc **dán ảnh thiết kế** để AVA soát theo quy chuẩn. Mỗi trang tài liệu có **Ví dụ trực quan** chạy thật: bật nút **Đo** để xem thông số và tên token của từng phần tử.
:::

## Lộ trình tuần đầu tiên

### Ngày 1–2: Nguyên tắc nền

::: checklist Ngày 1–2 · Nguyên tắc nền
- Đọc [Nguyên tắc chung](/ds/general-design-rules) — thứ tự nhập liệu, focus, cách chọn Combo / Dropdown / Radio…
- Đọc [Yêu cầu tiện dụng chung](/ds/general-usability-requirements)
- Đọc [Trạng thái tương tác](/ds/interaction-states) — hover, nhấn, focus, không bấm được
- Đọc [Yêu cầu hiển thị](/ds/display-requirement) — thiết kế chuẩn trên màn 1366 × 768
- Đọc [Thuật ngữ CSS](/ds/css-terms) — Padding, Gap, Border radius… để trao đổi đúng tên với dev
:::

### Ngày 3: Màu, chữ, icon, bố cục

::: checklist Ngày 3 · Styles
- Đọc [Màu sắc](/ds/color) — 10 theme, token màu theo nhóm Chữ / Icon / Viền / Nền
- Đọc [Kiểu chữ](/ds/typography) — chữ nội dung 13px (Font size Small), tiêu đề H3 Semi Bold
- Đọc [Icons](/ds/icons) và [Icon dùng chung](/ds/general-icons)
- Đọc [Bố cục trang](/ds/layout) — Header, Sidebar, nội dung trên nền xám, card bo 8
:::

::: checklist Ngày 3 · Phân cấp thông tin
- Đọc bài học [Phân cấp thông tin & khoảng trắng](#bai-hoc-phan-cap-thong-tin-khoang-trang) ngay bên dưới — 3 tầng thông tin, thang khoảng cách, các định luật UX
- Làm bài tập cuối bài học (đánh dấu 3 tầng, đếm điểm nhấn, đo khoảng cách trong / giữa nhóm)
:::

### Ngày 4: Các control hay dùng

::: checklist Ngày 4 · Control
- [Button](/ds/button) — mỗi màn 1 nút Primary, nút phụ dạng Outline Neutral
- [Text field](/ds/text-field) và [Textarea](/ds/textarea)
- [ComboBox](/ds/combobox), [DropDownList](/ds/dropdownlist) — ô không bắt buộc luôn bỏ chọn được về “Chưa chọn”
- [Checkbox](/ds/checkbox), [Radio button](/ds/radiobutton)
- [DateTimePicker](/ds/datetimepicker)
- [Tabs](/ds/tabs) và [Segmented](/ds/segmented) — Segment để lọc (giữ bố cục), Tab khi đổi cả nội dung
- [Search box](/ds/search-box), [Context Menu](/ds/contextmenu)
:::

### Ngày 5: Mẫu màn hình & giao tiếp với người dùng

::: checklist Ngày 5 · Patterns & Communication
- [Data table](/ds/data-table) — thanh công cụ, lọc nhanh + lọc nâng cao, phân trang
- [Popup](/ds/popup) và [Dialog](/ds/dialog) — bo 12, bóng Bottom 12, nút Lưu / Hủy ghim đáy
- [Side bar](/ds/sidebar) và [Header bar](/ds/hearder-bar)
- [Thông báo](/ds/announcement) — khi nào toast, khi nào inline alert
- [Empty state](/ds/empty-state), [Loading](/ds/loading), [Error pages](/ds/error-page)
- [Nội dung](/ds/contents) (xưng hô, câu chữ), [Quy tắc chính tả](/ds/spelling-rules), [Quy tắc phân tách số](/ds/number-separation-rules)
- Bài tập: vẽ lại 1 màn danh sách + 1 form popup đúng chuẩn, gửi ảnh cho AVA soát rồi nhờ người hướng dẫn review
:::

## Bài học: Phân cấp thông tin & khoảng trắng

**Phân cấp thông tin** (Information / Visual Hierarchy) là sắp xếp màn hình để người dùng thấy **điều quan trọng nhất trước**, rồi đến phần phụ, cuối cùng mới là chi tiết — không cần đọc từng chữ. Gần như mọi quy chuẩn trong MDS (thang chữ, 1 nút Primary, card trên nền xám, thang khoảng cách) đều là công cụ tạo phân cấp. Học bài này để hiểu **vì sao** quy chuẩn như vậy, thay vì chỉ nhớ con số.

### 1. Ba tầng thông tin

Trước khi vẽ, hãy trả lời: *“Trên màn này, người dùng cần thấy gì đầu tiên? Làm gì tiếp theo?”*. Mỗi màn chia thành 3 tầng:

| Tầng | Là gì | Ví dụ màn danh sách | Cách thể hiện trong MDS |
|---|---|---|---|
| **1 · Chính** (chỉ 1 điều) | Tiêu đề trang + hành động chính | Tên màn, nút **Thêm mới** | Tiêu đề H1 24 / H2 20 / H3 16 Semi Bold · 1 nút **Primary** màu Brand |
| **2 · Phụ** | Công cụ để làm việc với dữ liệu | Ô tìm kiếm, bộ lọc, Tab, Segmented | Chữ Body 13 · nút phụ **Outline Neutral** |
| **3 · Chi tiết** | Dữ liệu, mô tả, ghi chú | Các dòng trong bảng, chú thích | Body 13 Regular · chữ phụ `--text-secondary`, gợi ý `--text-hint` |

### 2. Công cụ tạo phân cấp (từ mạnh đến nhẹ)

1. **Kích thước và độ đậm chữ** — thang chuẩn H1 24/32 · H2 20/28 · H3 16/22 · Body 13/20; tiêu đề Semi Bold, nội dung Regular. Một màn chỉ nên dùng 3–4 cấp chữ. Xem [Kiểu chữ](/ds/typography).
2. **Màu chữ** — `--text-primary` cho nội dung chính, `--text-secondary` cho nhãn / mô tả, `--text-hint` cho gợi ý. Màu Brand và màu trạng thái dành để **nhấn**, không dùng để trang trí. Xem [Màu sắc](/ds/color).
3. **Độ tương phản và điểm nhấn** — nút Primary đặc màu Brand nổi hơn mọi nút Outline; màu Danger chỉ cho hành động nguy hiểm; Tag màu cho trạng thái.
4. **Vị trí và thứ tự** — người dùng quét từ trên xuống, từ trái sang phải (thường gọi là hình chữ F trên màn nhiều chữ / dữ liệu) → thông tin chính ở góc trên-trái; nút Lưu / Hủy ghim đáy form, nút chính bên phải.
5. **Nhóm và vùng** — card trắng bo 8 trên nền xám gom thông tin cùng chủ đề. Xem [Bố cục trang](/ds/layout).
6. **Khoảng trắng** — công cụ nhẹ nhất nhưng dùng nhiều nhất (mục 3).

::: tip Dùng vừa đủ, đừng chồng công cụ
Một thông tin chỉ cần **1–2 công cụ** để nổi lên (VD tiêu đề: cỡ lớn + Semi Bold). Vừa to, vừa đậm, vừa màu, vừa có khung thì mất cân đối và làm mất nổi bật của những thứ khác.
:::

### 3. Khoảng trắng (whitespace)

Khoảng trắng **không phải chỗ lãng phí** — nó là công cụ để **nhóm** và **tách** thông tin, đồng thời giảm cảm giác rối. Nguyên tắc cốt lõi:

> **Gần nhau = liên quan · xa nhau = khác nhóm.** Khoảng cách *trong* một nhóm luôn **nhỏ hơn** khoảng cách *giữa* các nhóm.

Thang khoảng cách của MDS (chỉ dùng các mức này, không “nhìn thấy đẹp” rồi đặt 10, 14, 18, 20):

| Khoảng cách | Dùng cho | Token |
|---|---|---|
| **4** | Nhãn → ô nhập (nhãn trên) | `--input-label-gap` |
| **8** | Control ↔ control đặt cạnh nhau (nút – nút, tìm kiếm – combobox) | `--gap-control` |
| **12** | Giữa các hàng của form nhãn trái | `--form-row-gap-h` |
| **16** | Giữa các trường form dọc · card ↔ card · đệm trong card (đều 4 phía) · lề nội dung | `--form-row-gap-v` · `--card-col-gap` · `--box-padding` · `--page-gutter` |
| **24** | Đệm trái / phải / trên của popup, dialog | — |

Cách nhìn: trong form nhãn trên, **nhãn cách ô của nó 4**, còn **trường này cách trường kia 16** — nên mắt thấy ngay “nhãn nào thuộc ô nào”. Nếu mọi khoảng đều bằng nhau, nhóm biến mất.

::: dont
- Cách đều mọi thứ một số (mọi khoảng 16): không còn nhóm, không còn tầng.
- Nhãn gần ô **phía trên** hơn ô của chính nó — người dùng nhìn nhầm nhãn.
- Nhét sát để “tiết kiệm chỗ” rồi dùng vạch kẻ / viền để tách thay cho khoảng cách.
- Đệm card mỗi phía một số (trên-dưới khác trái-phải).
- Thêm khoảng trắng kiểu trang giới thiệu sản phẩm: màn nghiệp vụ nhiều dữ liệu thiết kế cho **1366 × 768**, thoáng vừa đủ chứ không lãng phí chiều cao.
:::

::: do
- Nhóm theo quan hệ: khoảng nhỏ trong nhóm, khoảng lớn hơn giữa nhóm.
- Lấy khoảng cách từ thang chuẩn (4 / 8 / 12 / 16 / 24) và token, không gõ số tay.
- Dùng khoảng trắng **trước**, rồi mới tới nền card / viền khi khoảng trắng chưa đủ tách.
- Đo bằng nút **Đo** trên Ví dụ trực quan để so với quy chuẩn.
:::

### 4. Các định luật UX liên quan đến phân cấp

Các định luật dưới đây (nhiều định luật nằm trong bộ [Laws of UX](https://lawsofux.com/)) giải thích vì sao người dùng “thấy” phân cấp theo cách đó. Mỗi định luật kèm cách MDS áp dụng:

| Định luật | Ý chính | Áp dụng trong MDS |
|---|---|---|
| **Gần nhau** (Law of Proximity) | Phần tử gần nhau được coi là một nhóm | Nhãn cách ô 4, trường cách trường 16; nút Lưu / Hủy cạnh nhau 8 |
| **Vùng chung** (Law of Common Region) | Phần tử cùng khung / nền được coi là một nhóm | Mỗi card một chủ đề; popup gom form vào một khối. Không lồng card trong card nếu không cần |
| **Tương đồng** (Law of Similarity) | Trông giống nhau thì được hiểu là cùng vai trò | Mọi nút phụ cùng Outline Neutral; mọi trạng thái cùng kiểu Tag; số trong bảng cùng căn phải |
| **Căn thẳng / liên tục** (Law of Continuity) | Mắt đi theo đường thẳng | Nhãn trái rộng 200px thẳng cột, cột bảng thẳng hàng, lề trái các khối trùng nhau |
| **Điểm nhấn** (Von Restorff) | Cái khác biệt thì nổi bật và được nhớ — nhưng chỉ khi hiếm | **1 nút Primary** mỗi màn; Danger chỉ khi cần; không tô đậm mọi thứ |
| **Hick** | Càng nhiều lựa chọn, quyết định càng chậm | Chia menu thành nhóm, “Xem thêm”, lọc nhanh + lọc nâng cao thay vì bày hết, Tab / Segmented để chia nội dung |
| **Miller** (chia cụm) | Trí nhớ ngắn hạn giữ được khoảng 7 ± 2 mục | Form dài chia thành mục / [Accordion](/ds/accordion); danh sách dài chia nhóm có tiêu đề |
| **Vị trí tuần tự** (Serial Position) | Nhớ tốt mục đầu và cuối, kém mục giữa | Hành động quan trọng ở đầu / cuối: Lưu / Hủy ở cuối form; giá trị hay chọn của Combo lên đầu danh sách |
| **Fitts** | Mục tiêu càng to, càng gần càng dễ bấm | Nút chính đủ lớn (cao theo `--btn-height`), icon bấm riêng lẻ có vùng chạm tối thiểu 40px |
| **Thẩm mỹ – Khả dụng** | Giao diện gọn, đẹp được cảm nhận là dễ dùng hơn | Căn thẳng, khoảng cách đều theo thang chuẩn: người dùng tin sản phẩm đáng tin hơn |

Đọc thêm cách chia nhóm trong [Nguyên tắc chung](/ds/general-design-rules) và [Yêu cầu tiện dụng chung](/ds/general-usability-requirements). AVA cũng giải thích được từng định luật — thử hỏi: *“Định luật Gestalt áp dụng trong form thế nào?”*.

### 5. Tự kiểm tra phân cấp trước khi gửi review

- **Nheo mắt (squint test):** nheo mắt hoặc làm mờ ảnh màn hình — còn nhận ra đâu là tiêu đề, nút chính và các nhóm không? Nếu mọi thứ nhòe thành một khối thì phân cấp yếu.
- **Thang xám:** chuyển ảnh sang đen trắng — phân cấp vẫn rõ không? Nếu mất thì đang chỉ dựa vào màu.
- **5 giây:** cho người khác xem 5 giây rồi hỏi “màn này để làm gì, bấm gì tiếp?”. Trả lời được ngay là đạt.
- **Đếm:** số cấp chữ ≤ 4 · số điểm nhấn (nút Primary, màu cảnh báo) ≈ 1 mỗi vùng · mọi khoảng cách nằm trong thang 4 / 8 / 12 / 16 / 24.

::: checklist Bài tập · Phân cấp thông tin & khoảng trắng
- Lấy màn danh sách + form popup đã vẽ ở Ngày 5, đánh dấu 3 tầng thông tin (Chính · Phụ · Chi tiết)
- Đếm số cấp chữ và số điểm nhấn trên mỗi màn; bỏ bớt nếu thừa
- Liệt kê khoảng cách trong nhóm và giữa các nhóm — trong nhóm có nhỏ hơn giữa nhóm không?
- Làm thử nheo mắt và thang xám trên ảnh màn hình
- Hỏi AVA một định luật UX bạn chưa nắm rõ (VD Gestalt, Hick, Von Restorff) và tìm ví dụ ở màn bạn vừa vẽ
:::

## Chọn cấu hình cho sản phẩm

Trước khi vẽ màn đầu tiên của một sản phẩm, chốt 5 lựa chọn dưới đây — cả sản phẩm dùng thống nhất.

| Lựa chọn | Có những gì | Gợi ý chọn |
|---|---|---|
| **Mật độ hiển thị** | Nhỏ · Trung bình · Rộng | Nhỏ: app cần nhiều thông tin (Kế toán…) · Trung bình: mặc định app quản trị · Rộng: không khuyến khích |
| **Font size** | Small (13px) · Medium (14px) | Small: mặc định, app nhiều dữ liệu · Medium: app ít thông tin, cần dễ đọc (Mail, Lịch, Quy trình, Chat…) · Mật độ Nhỏ → luôn Small |
| **Màu chủ đề (theme)** | 10 màu: Xanh dương, Xanh lá, Xanh xám, Xanh ngọc, Xanh lơ, Chàm, Tím, Hồng, Đỏ hồng, Cam | Theo nhận diện sản phẩm; màu biểu đồ đi theo bộ Chart Colors cùng tên ([Biểu đồ](/ds/data-visualization)) |
| **Header × Sidebar** | Header có màu / trắng · Sidebar sáng / tối | Header màu **chỉ** đi với sidebar sáng; header trắng đi được với sidebar sáng hoặc tối |
| **Sidebar có cấp con** | Xổ xuống dưới · Xổ sang phải | Ít mục con → xổ xuống; rất nhiều mục con cần chia cột → xổ sang phải ([Side bar](/ds/sidebar)) |

## Những lỗi người mới hay mắc

::: dont
- Đặt nút **Lưu / Hủy ở đầu form** hoặc cả trên lẫn dưới.
- Nhiều nút **Primary** trên một màn (người dùng không biết chọn gì).
- Card có **viền** hoặc **bóng to**; popup bo 8 hoặc bóng kiểu `0 8px 24px`.
- Chép số / mã màu thẳng từ Figma thay vì dùng token; chữ nội dung 11–12px.
- Ô nhập số trong form căn phải; số viết `1,234.5`.
- **Mọi thứ cùng đậm / cùng cỡ / cùng màu**; cách đều mọi thứ một khoảng — không còn tầng, không còn nhóm.
:::

::: do
- Thanh nút Lưu / Hủy **ghim đáy form**, nút chính bên phải.
- **1 nút Primary** mỗi màn / form, còn lại Outline Neutral.
- Card trên nền xám: bo **8**, bóng **All 2**, không viền · Popup / Dialog: bo **12**, bóng **Bottom 12**.
- Dùng token (Text/, Icon/, Stroke/, BG/), chữ nội dung **13px**, khoảng cách 16 / 12 / 8 / 4.
- Ô số trong form **căn trái**, trong bảng **căn phải**; số viết **1.234.567,89**.
- Phân tầng **Chính – Phụ – Chi tiết**; khoảng cách **trong nhóm nhỏ hơn giữa các nhóm**.
:::

## Checklist tự soát trước khi gửi review

::: checklist Tự soát trước khi gửi review
- Header × Sidebar đúng cặp (header màu chỉ đi sidebar sáng)
- Nút Lưu / Hủy ghim đáy, nút chính bên phải; mỗi màn 1 nút Primary
- Card trên nền xám bo 8, bóng All 2, không viền; popup / dialog bo 12, bóng Bottom 12
- Khoảng cách: card ↔ card 16, đệm trong card 16, control ↔ control 8, lề nội dung 16
- Phân cấp: nheo mắt vẫn thấy tiêu đề, nút chính và các nhóm; mỗi vùng chỉ 1 điểm nhấn; số cấp chữ ≤ 4
- Khoảng trắng: trong nhóm nhỏ hơn giữa nhóm, mọi khoảng nằm trong thang 4 / 8 / 12 / 16 / 24
- Chữ: tiêu đề form / popup đúng cỡ, chữ nội dung 13px, không dùng 11–12px
- Form: nhãn trái 200px (hàng cách 12) hoặc nhãn trên (cách ô 4, trường cách 16)
- Bảng: thanh công cụ (tìm kiếm trái · Làm mới, Thiết lập, Lọc phải), phân trang dưới, số 1.234.567,89
- Có đủ trạng thái: hover, focus, không bấm được, lỗi, đang tải, màn hình trống
- Icon không chữ / chữ viết tắt có tooltip; tooltip không lặp lại chữ đã hiện
- Xem lại ở 1366 × 768 — không tràn, không chồng chữ
- Gửi ảnh cho AVA soát, sửa hết điểm “Cần sửa” rồi mới gửi review
:::

## Công cụ & tài nguyên

- **Thư viện Figma MDS Web Components v2.0** — xem giá trị token chi tiết: mở file → bảng bên trái **Variables** → Collection **🎨 Themes**.
- **Trợ lý AVA** (biểu tượng trên thanh tiêu đề) — hỏi quy chuẩn, soát ảnh thiết kế.
- **Liên kết hữu ích** ở trang [Tổng quan](/ds/) — các link hướng dẫn hay dùng.
- Tạo favicon, chuyển ảnh sang WebP, vẽ nhanh biểu đồ: hỏi AVA “dùng công cụ nào” để lấy link.

## Ghi nhận công việc & chấm điểm (PD)

Công việc thiết kế được ghi nhận và chấm điểm trên **MISA Solution Point** (cùng địa chỉ máy chủ, đường dẫn [/](/)):

::: checklist Bắt đầu trên MISA Solution Point
- Đọc **Quy tắc PD** trong app — điểm được tính từ đâu
- Vào các dự án mình được phân quyền (chưa thấy thì nhờ PO / Quản trị dự án thêm vào)
- Khai hoặc mở công việc được giao; cập nhật đủ trường bắt buộc: Trạng thái, Ngày hoàn thành, Số màn hình, Độ phức tạp thiết kế, Người đưa giải pháp, Dự án phụ trách, Nền tảng
- Nhớ: ngày tính điểm = Ngày hoàn thành; cập nhật xong trong khoảng ngày 28 → mùng 5 tháng sau trước khi quản lý chốt điểm
:::
