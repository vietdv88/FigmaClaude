<!-- SINH TỰ ĐỘNG từ /ds/quan-tri?tab=notes (2026-11-18) — không sửa tay -->
# Tri thức người dùng tự nhập (ưu tiên CAO NHẤT)

Quy tắc người dùng đã dạy trực tiếp. Mâu thuẫn với phần khác của skill thì **làm theo mục này**. Mục “luôn áp dụng” phải tuân thủ ở mọi màn.

## Cách dùng icon và màu icon (token Icon/…, không dùng màu chữ)

- Icon trong MDS-UI là **TIcon (SVG, bộ Tabler)** bọc trong `.icon-swap` — KHÔNG phải font icon, không dùng thẻ `<i>`. Mã: `<span class="icon-swap"><TIcon name="search" /></span>`. Lấy mã ở http://10.1.39.11/ds/icons (bấm icon để chép).
- **Cỡ:** mặc định 20px; class `.icon-swap--12 / 16 / 24 / 28 / 32 / 36 / 40 / 44 / 48`.
- **Màu: luôn dùng token nhóm Icon/, không gán mã hex hay `color` tay, không lấy màu chữ.** Neutral (mặc định) = `--icon-neutral` #6B707A (Neutral/700) ở mọi trạng thái; Brand = `--icon-brand` (Brand/600, class `.icon-swap--brand`); White = `--icon-white`; Info / Warning / Danger / Success / Accent = `--icon-info` #1570EF · `--icon-warning` #DC6803 · `--icon-danger` #F04438 · `--icon-success` #039855 · `--icon-accent` #9E77ED (class `.icon-swap--info|warning|danger|success|accent`).
- **Link:** `--icon-link` (Brand/700) và `--icon-link-default` (Info/700), class `.icon-swap--link`. **AI:** `--icon-ai` là gradient, dùng class `.ti--ai`, không tô đơn sắc.
- **Disabled:** `--icon-<màu>-disabled` (Neutral/400 #CED1D6 với Neutral) — class `.icon-swap--disabled`. **Hover** chỉ có ở icon bấm được (`.icon-swap--action`, thẻ button): `--icon-<màu>-hover`. Icon trung tính không đổi màu theo màu chữ #10141B / #4E5561.
- Icon đặt trong nút (`.btn`, `.btn-icon`) chỉ lấy `<TIcon name="…" />`, màu và cỡ tự theo nút.

## Quy tắc phân cấp thông tin

- Các thông tin cùng nhóm với nhau thì sắp xếp gần nhau để dễ dàng hiểu nó liên quan đến nhau
- Giữa các nhóm thông tin có thể dùng divider hoặc khoảng trắng để phân tách thông tin, nên ưu tiên sử dụng khoảng trắng cho bớt rối
- Hạn chế dùng nhiều border bọc lồng nhau nhìn giao diện bị rối, không sạch sẽ, tốn đất.

## Quy chuẩn style của tab gạch chân

Với các tab dạng gạch chân thì thường sẽ được bọc trong 1 vùng bọc bên ngoài, vùng này đa phần sẽ có nền trắng, đôi khi là không có nền và chiều rộng kéo dài full frame cha, khi đó vùng bọc bên ngoài tab này cần có 1 border-bottom kéo dài cả vùng. Các tab nằm trong nó riêng tab active là có border-bottm gạch chân, còn các tab đang không active thì sẽ tắt gạch chân đi để tránh bị lỗi double border

## MISA Control

MISA Control là bộ thư viện chính thức của DEV dùng thi công app thật, mds-ui này là bộ Design System mẫu do bên bộ phập UI UX Designer thực hiện, bạn cần chi tiết về MISA Control vui lòng liên hệ SA phụ trách xây dựng MISA Control để được hỗ trợ nhé. Còn nếu bạn thắc mắc về Design System cứ nói với tôi chúng tôi sẽ ghi nhận và xử lý.

## Nhãn dữ liệu trên biểu đồ

Các nhãn dữ liệu trên biểu đồ dùng mặc định theo của thư viện https://echarts.apache.org/examples. Tuy nhiên font family thì vẫn phải ăn theo quy chuẩn chung font Inter

## Khi nào sử dụng đường ngăn cột trong Bảng dữ liệu (Grid, Datatable)

- Bảng dữ liệu bắt buộc sử dụng đường ngăn cột dạng nét liền khi bảng có các cột merge với nhau để nhìn rõ ràng được cell nào group với cell nào.
- Các dạng bảng thông thường không có merge cột thì có thể tuỳ chọn sử dụng ngăn cột hoặc không nhưng nên thống nhất trong toàn bộ app, các app kế toán với bảng nhiều số liệu nên dùng đường ngăn cột dạng nét đứt

## Card trên nền trắng

Với các card trên nền xám đã có quy chuẩn chung bo góc 8px, và có shadow. Còn với những card đặt trên nền trắng thì vẫn bo góc 8px như quy chuẩn nhưng không dùng shadow mà dùng border với màu Stroke Neutral. Dùng shadow box trắng trên nền trắng khá khó phân biệt và nhoè cạnh cảm giác không sắc nét.

## Trạng thái hover lên link (Liên kết)

Link chia thành 2 loại: Link button và Link dạng liên kết bình thường bấm thì chuyển sang 1 đường dẫn khác thì xử lý như sau: 
- Với loại link dạng bấm vào thực hiện chức năng thì coi là Link button và khi hover lên có nền như 1 button đã có quy chuẩn tại phần Component Button.
- Với loại link dạng bấm chuyển sang 1 đường dẫn khác thì dùng Underline (gạch chân) khi hover lên.

## Quy tắc hiển thị icon trên Header chung

Các icon hiển thị theo đúng vị trí hiện tại ở đây: http://10.1.39.11/ds/hearder-bar. Tuy nhiên với một số ứng dụng có nhu cầu hiển thị thêm chức năng của dự án thì sẽ để ở phía bên tay trái của icon Loa (Tính năng mới), tuyệt đối không được chèn lẫn lộn vào giữa các icon quy chuẩn. Một số ứng dụng không có các chức năng như Khác thì có thể ẩn đi nhưng không được thay thế icon khác vào đó.

## Mẫu email MISA gửi khách hàng / bên thứ 3 — luôn gửi link quy chuẩn

Khi người dùng hỏi về mẫu email / thư MISA gửi cho khách hàng, đối tác, bên thứ 3 (email thông báo, email tự động, email marketing, email kích hoạt, thanh toán…):
- LUÔN đưa link trang quy chuẩn để họ đọc và lấy mã HTML: [Mẫu email](/ds/email) — có 3 mẫu code sẵn (MISA chung · Nền tảng · Ứng dụng trong nền tảng), xem được trên máy tính / điện thoại, sao chép hoặc tải file HTML.
- Tóm tắt ngắn các điểm chính: thẻ trắng rộng tối đa 600px căn giữa trên nền xám; lề nội dung 40px (điện thoại 16px); bo góc 8px; chữ nội dung 14/20; logo xuất PNG 2x kèm tên ứng dụng (không dùng SVG); dòng “Đây là email tự động…” cuối nội dung; footer cố định © MISA JSC, địa chỉ, www.misa.vn, support@misa.com.vn.
- Chỉ sửa vùng “NỘI DUNG EMAIL” trong mã mẫu, không tự dựng khung email mới.

## Danh sách trong popup: bảng giãn hết chiều cao, phân trang ghim đáy

Áp dụng cho popup / vùng có chiều cao cố định chứa danh sách (Chọn nhân viên, Chọn hàng hóa, Danh sách đã chọn, tab chi tiết có bảng…):
- **Khung bảng lấp đầy chiều cao còn lại** của popup (sau tiêu đề, thanh tìm kiếm / lọc), kéo tới sát footer nút Hủy / Đồng ý.
- **Thanh phân trang (Tổng số · Số dòng/trang · chuyển trang) luôn ghim ở ĐÁY khung bảng**, ngay trên footer — vị trí cố định dù có 1 dòng hay 100 dòng.
- **Ít dòng** → phần trống nằm TRONG khung bảng (giữa dòng cuối và thanh phân trang, nền trắng). **Nhiều dòng** → vùng dòng tự cuộn bên trong, tiêu đề cột và phân trang đứng yên.
- **Không có dữ liệu** → màn trống (Empty state) ở giữa khung bảng, khung vẫn giữ nguyên chiều cao.
- Chiều cao popup **cố định theo cỡ popup**, không co giãn theo số dòng → lọc / chuyển trang / bỏ chọn popup không nhảy kích thước.
- ⛔ **Không vẽ** khung bảng co theo số dòng làm thanh phân trang “nổi” lơ lửng giữa popup, bên dưới là khoảng trắng lớn tới footer (popup trông cụt, trống, mắt phải dò tìm phân trang ở vị trí khác nhau mỗi lần).
- Thi công (mds-ui): thân popup `display: flex; flex-direction: column`, khung bảng `.table-panel.table-panel--fill` (giãn hết phần còn lại; `.table-scroll` cuộn trong, phân trang ở đáy).

Khi soát ảnh thiết kế: thấy bảng trong popup có phân trang nằm ngay dưới vài dòng dữ liệu và khoảng trống lớn bên dưới → chỉ ra là SAI quy chuẩn này, đề nghị kéo khung bảng giãn hết chiều cao popup, phân trang ghim đáy.

## Popup / Dialog: bo góc, nền, bóng đổ (shadow)

Khung popup / dialog (form popup, hộp thoại xác nhận, popup Bắt đầu sử dụng…) theo Figma:
- **Bo góc**: Radius/Popup-Dialog **12px** — token `--radius-dialog` (chỉ popup, dialog mới bo 12; card trên nền trang bo 8).
- **Nền**: BG/White — `--bg-white`.
- **Bóng đổ**: Drop Shadow/Neutral/**Bottom 12** = `0 4px 12px 0` màu Alpha Black 100 (rgba(0, 0, 0, 0.10)) — token `--shadow-dialog` (= `--shadow-bottom-12`).
- ⛔ Không dùng bóng to / đậm kiểu `0 8px 24px` hay gõ tay rgba; không thêm viền khi đã có bóng.
- Menu / popover xổ ra dùng cùng mức Bottom 12 (`--shadow-popover`).
- **Phân biệt với CARD**: card trắng trên nền xám (BG Page) — KPI, biểu đồ, bảng, khối nội dung — dùng bóng **Drop Shadow/Neutral/All 2** = `0 0 2px 0` Alpha Black 100 → token `--shadow-card` (= `--shadow-all-2`), bo `--radius-card` 8px, không viền. **Bottom 12** (`--shadow-dialog` / `--shadow-popover`) chỉ cho lớp NỔI: dialog, popup, popover, menu xổ ra. Panel trượt bên phải: `--shadow-left-8`.

## Quy định về phân trang trên danh sách

Trên danh sách có 2 dạng phân trang cơ bản dạng chỉ Next và Back, dạng thứ 2 là dạng số 1,2,3,4...Với các ứng dụng thông thường không có nhu cầu đặc biệt thì dùng dạng cơ bản, còn các ứng dụng có nhu cầu xử lý từng trang như Kế toán có thể dùng bộ phân trang dạng số. Số bản ghi mặc định trên trang thông thường là 10 bản ghi/ trang, tuỳ nhu cầu dự án có thể chọn 1 số khác. Khi khách hàng chọn đổi sang số khác thì làm tiện ích lưu lại số trang này tránh mỗi lần load lại lại phải chọn lại số bản ghi hiển thị trên trang.

## Dữ liệu của các trường trống hiển thị thế nào?

- Trong các bảng dữ liệu (Tables/Grids): Khi một ô (cell) không có giá trị, dùng “–” giúp dòng đó không bị cảm giác bị “thủng” hoặc lỗi. Nó giữ cho mắt người dùng quét qua hàng/cột một cách liên tục.
- Dữ liệu dạng số/tài chính: Nếu một cột là “Số lượng” hoặc “Doanh thu” mà không có số, dùng “–” hoặc “0” (nếu bản chất là bằng không) giúp phân biệt rõ với việc ô đó chưa được tải dữ liệu.
- Các trường thông tin khi xem ở chế độ xem trên form nếu trống cũng để "-" để thể hiện đang không có dữ liệu.

## Độ rộng cột mặc định trên danh sách (Bảng)

Độ rộng cột luôn được tối ưu theo dữ liệu, dữ liệu dài cần đọc nhiều thì cho rộng hơn, dữ liệu ngắn thì cột hẹp hơn, ví dụ với dữ liệu ngày Ngày tháng thì độ rộng luôn có 1 ngưỡng cố định nên độ rộng của cột cũng cần bám theo tránh dài quá tốn đất.

## Sắp xếp bản ghi trên danh sách (Bảng)

Các bản ghi mới nhất vừa thêm luôn được hiển thị lên đầu tiên của danh sách

## Trạng thái hover của Icon

Icon thì cũng nên coi như một button, sử dụng Button Icon, tuy nhiên với nhiều icon quá nhỏ như icon chữ i cạnh label hover lên hiện tooltip giải thích ý nghĩa thì có thể dùng riêng icon để đỡ bị tốn khoảng cách 2 bên, từng icon cũng có trạng thái hover riêng cho icon khi di chuột qua nó sẽ đổi màu icon. Khuyến nghị vẫn nên dùng Button Icon. Với những Button Icon đặt trên nền xám, khi hover lên màu nền đổi sẽ trùng với màu xám của BG Page thì có thể cân nhắc Hover lên thì đổi nền sang màu Brand Light để nhìn rõ hơn.

## Định luật UX: Jakob, Occam, Hick — mẫu quen thuộc, đơn giản, ít lựa chọn

- **Jakob (Jakob's Law):** người dùng quen cách các sản phẩm khác hoạt động và mong sản phẩm của bạn giống vậy. Ưu tiên mẫu quen thuộc (giỏ hàng góc trên phải, link xanh gạch chân, menu hamburger trên di động) hơn cách “sáng tạo” nhưng xa lạ — bắt người dùng học mẫu mới thường tốn hơn lợi ích nó mang lại.
- **Dao cạo Occam (Occam's Razor):** các thiết kế giải quyết vấn đề như nhau thì chọn cái đơn giản nhất. Trước khi thêm tùy chọn, nút bật/tắt hay màn hình mới, xem luồng hiện tại có tự làm điều hợp lý theo mặc định được không — mỗi tùy chọn thêm là 1 thứ người dùng phải hiểu.
- **Hick (Hick's Law):** càng nhiều lựa chọn, người dùng quyết định càng lâu. Cắt menu / danh sách dài xuống những gì thật sự quan trọng hoặc chia nhiều bước — dropdown 5 mục + “Xem thêm” tốt hơn dropdown 20 mục.

## Định luật UX: Gestalt, Von Restorff, Thẩm mỹ – Khả dụng — nhóm thông tin, 1 nút chính nổi bật

- **Gestalt (Gestalt Principles):** não nhóm các phần tử liên quan thành 1 tổng thể. Gần nhau → được coi là liên quan; trông giống nhau → cùng nhóm; mắt tự lấp khoảng trống để thấy hình hoàn chỉnh; chung viền / nền → là 1 nhóm. Chỉ bằng khoảng cách và cách nhóm đã truyền đạt được cấu trúc trước khi người dùng đọc chữ.
- **Von Restorff (Isolation Effect):** phần tử khác biệt nổi bật được nhớ và bấm nhiều hơn. 1 nút chính rõ ràng giữa các nút phụ hiệu quả hơn 5 nút giống hệt nhau. Nổi bật chỉ có tác dụng khi hiếm — mọi thứ đều nhấn mạnh thì không gì được nhấn mạnh. Vì vậy mỗi màn / form chỉ nên có 1 nút Primary; nhiều nút Primary làm người dùng băn khoăn không biết chọn gì (kết hợp định luật Hick).
- **Thẩm mỹ – Khả dụng (Aesthetic-Usability Effect):** thiết kế đẹp được cảm nhận là dễ dùng hơn, người dùng dễ bỏ qua lỗi nhỏ hơn. Trau chuốt hình ảnh không chỉ là trang trí — nó mua thiện cảm cho cả trải nghiệm.

## Định luật UX: Miller, Vị trí tuần tự, Zeigarnik, Đỉnh – Kết — trí nhớ, thứ tự danh sách, tiến trình

- **Miller (Miller's Law):** trí nhớ ngắn hạn giữ thoải mái khoảng 7 (±2) mục. Nhóm các mục liên quan thành cụm (số điện thoại, nhóm menu, các trường của form dài) thay vì liệt kê phẳng.
- **Vị trí tuần tự (Serial Position Effect):** người dùng nhớ mục đầu và cuối danh sách tốt hơn mục ở giữa → đặt mục điều hướng / tùy chọn quan trọng nhất ở đầu và cuối, đừng chôn ở giữa.
- **Zeigarnik (Zeigarnik Effect):** việc chưa xong kéo sự chú ý quay lại. Thanh tiến trình, “hoàn thành 3/5 bước”, hồ sơ điền dở… giúp người dùng quay lại làm nốt.
- **Đỉnh – Kết (Peak-End Rule):** người dùng đánh giá cả trải nghiệm theo khoảnh khắc cao trào nhất và lúc kết thúc. Màn xác nhận đẹp, bước thanh toán mượt bù được bước vụng trước đó — chỉ trau chuốt được 1 chỗ thì chọn khoảnh khắc kết thúc.

## Định luật UX: Fitts, Doherty — kích thước và vị trí nút bấm, tốc độ phản hồi

- **Fitts (Fitts's Law):** thời gian chạm tới mục tiêu phụ thuộc khoảng cách và kích thước — càng to, càng gần càng nhanh. Làm hành động thường dùng / quan trọng (Lưu, nút chính) to và gần vị trí con trỏ; hành động phá hủy như Xóa nhỏ hơn hoặc xa hơn để tránh bấm nhầm.
- **Ngưỡng Doherty (Doherty Threshold):** hệ thống phản hồi trong khoảng 400ms thì tương tác cảm giác tức thì. Hiển thị phản hồi ngay (cập nhật lạc quan — optimistic UI, hiện kết quả trước khi máy chủ xác nhận; spinner / skeleton khi phải chờ) để giữ dưới ngưỡng này.

## Định luật UX: Tesler, Postel, Goal-Gradient, Parkinson, Pareto — độ phức tạp, nhập liệu, form nhiều bước

- **Tesler (Conservation of Complexity):** mọi quy trình có phần phức tạp không bỏ được — chỉ chọn được ai xử lý nó. Hệ thống tự xử lý (VD tự nhận quốc gia từ số điện thoại) tốt hơn đẩy sang người dùng (dropdown “chọn quốc gia” ở mọi form).
- **Postel (Robustness Principle):** khoan dung với dữ liệu nhận vào, chặt chẽ với dữ liệu tạo ra. Ô số điện thoại chấp nhận “0900 123 456”, “0900123456”, “+84900123456” rồi chuẩn hóa khi lưu — đừng báo lỗi chỉ vì định dạng.
- **Goal-Gradient:** càng gần đích, động lực hoàn thành càng tăng. Thanh tiến trình cho sẵn 1 phần khởi đầu, thẻ tích điểm đóng sẵn 2 ô.
- **Parkinson (Parkinson's Law):** việc giãn ra lấp đầy thời gian / không gian được cấp. Form 15 trường hiện cùng lúc có cảm giác nặng hơn nhiều so với 3 bước × 5 trường.
- **Pareto (80/20):** ~80% lượt dùng rơi vào ~20% tính năng. Trau chuốt luồng chính trước, rồi mới tới các tính năng hiếm dùng.

## Cỡ chữ (Font size): chọn Small hay Medium theo loại app

Mode Font size có 4 chế độ: **Small, Medium, Large** (web app trên desktop) và **Mobile Responsive** (chỉ cho app có giao diện responsive trên mobile). Chữ tiêu chuẩn Body Regular tương ứng: 13 · 14 · 14 · 14px.
- Mặc định chọn **Small (13px)** — hợp với app nhiều dữ liệu cần tối ưu không gian như Kế toán, Bán hàng.
- App ít thông tin, cần dễ đọc (AMIS Quy trình, Mail, Lịch, Chat, OneAI…) có thể để **Medium (14px)**.
- Đi cùng mật độ hiển thị: mật độ Nhỏ → Small; mật độ Trung bình → Small hoặc Medium.
- Chữ trong control (Button, Textbox…) luôn theo Body Regular của mode đang chọn (13 hoặc 14px).
- Đổi mode chỉ một số cỡ chữ đổi: VD giữa Medium và Large, Body Regular giữ nguyên nhưng H3 (tiêu đề Form, Card, Section, Group) đổi.
Quyết định cuối cùng thuộc về UI/UX Designer của dự án.

## Phối màu cho biểu đồ (Chart colors)

Có sẵn bộ palette **Chart colors** đã phối theo theme: gõ Blue, Green… sẽ ra bộ màu tương ứng theme Xanh dương, Xanh lá…
- Mỗi bộ có 3 chế độ phối: **Palette, Single, Hue Divergent** — màu trong danh sách tự đổi theo chế độ, đổi qua lại để chọn bộ hợp với theme và app.
- Trạng thái quen thuộc (Đang xử lý, Thành công, Thất bại…) thì Designer tự chọn màu phù hợp theme của app.
- Muốn xem chi tiết các mã màu của biểu đồ thì vào link http://10.1.39.11/ds/data-visualization

## mds-ui là bộ control demo — dev thi công dùng MISA Control

mds-ui là bộ control do Designer xây dựng để làm demo quy chuẩn. Control thật để dev thi công là bộ **MISA Control** trên máy VDI — liên hệ bộ phận SA để được dùng. Về cơ bản MISA Control có hành xử giống bộ demo ở đây.

## Cách dùng Button: 1 nút Primary, nút phụ Outline Neutral

Trên 1 màn hình, button có chữ (hoặc chữ + icon) chỉ dùng 2 kiểu:
- **Primary** (nút chính): nền màu Brand, chữ trắng.
- **Outline Neutral** (mọi nút phụ): nền trắng, viền xám Neutral, chữ đen.
Hạn chế dùng Outline Brand (viền màu Brand), trừ trường hợp rất đặc biệt.
Nhóm 3 nút Hủy · Lưu và đóng · Lưu: chỉ **Lưu** là Primary, 2 nút còn lại cùng kiểu Outline Neutral.

## Trạng thái hover

Toàn bộ các action bấm được đều phải có trạng thái hover để người dùng biết được đây là thao tác bấm được:
- Các dòng trên bảng hover lên phải đổi nền và chuột đổi sang icon ngón tay chỉ bấm được
- Các control như Button, textbox, combobox...hover lên đều có trạng thái. Có thể xem chi tiết ở link component của từng control để xem các ví dụ mẫu
- Các icon mà không có chữ khi hover lên phải đổi màu nền (Nếu dùng Button Icon) hoặc đổi màu Icon (Nếu dùng icon riêng lẻ) và phải có tooltip mô tả chức năng là gì.
- Các text viết tắt khi hover lên phải có tooltip mô tả chữ đầy đủ là gì.

Xem các trạng thái mô tả khi hover ở đây: /ds/interaction-states

## Thao tác hàng loạt (bulk action) khi chọn dòng trên danh sách

Khi chọn ít nhất 1 dòng, thanh thao tác hàng loạt hiện theo 2 trường hợp:
1. Danh sách chỉ có tiêu đề bên trái: thanh bulk action che lên tiêu đề và ẩn các nút Thêm, Nhập khẩu bên phải tiêu đề; thanh công cụ của bảng (table toolbar) giữ nguyên.
2. Danh sách có các tab phân hệ con: thanh bulk action che lên vùng bộ lọc nhanh và các nút Thêm, Nhập khẩu bên phải table toolbar; vẫn giữ ô tìm kiếm bên trái để người dùng tìm.

## Vị trí nút thêm mới trên danh sách

Có 2 trường hợp hiển thị nút thêm mới này:
1. Khi danh sách chỉ có tiêu đề bên trái không dùng tab thì nút Thêm sẽ nằm ở cùng hàng với tiêu đề
2. Khi danh sách có nhiều tab phân hệ con thì nút thêm, nhập khẩu lại nằm ở dưới danh sách phía ngoài cùng bên phải của các icon Setting, Filter và được ngăn cách với icon filter bằng 1 divider nhỏ

## Thanh công cụ của bảng (Table toolbar): thứ tự tìm kiếm, bộ lọc, icon

- Ô tìm kiếm **luôn đặt bên trái** (tìm thường hoặc tìm kiếm thông minh tùy dự án).
- Ngay bên phải ô tìm kiếm là các bộ lọc nhanh (xổ ra chọn luôn) — bố trí đủ chỗ trên màn tiêu chuẩn 1366px.
- Ngoài cùng bên phải là 3 icon theo **đúng thứ tự: Làm mới, Thiết lập (Setting), Lọc (Filter)**. Có thể ẩn bớt tùy nhu cầu, nhưng icon nào hiện thì giữ đúng thứ tự.
- Icon dự án tự thêm nằm **bên trái** 3 icon trên.

## Màu nền của Avatar

Avatar không có ảnh đại diện: nền lấy từ màu nhạt **Brand Light Hover** của bộ theme 10 màu; khi thi công hiển thị ngẫu nhiên 1 trong 10 màu đó.

## Soát ảnh thiết kế: 6 điểm cần kiểm tra khi upload ảnh cho AVA

Khi upload ảnh lên để AVA đánh giá thiết kế cần khoanh vùng được các thông tin sau:
1. Khoảng cách đã đúng quy chuẩn và đồng nhất chưa?
2. Bo góc đã đúng chuẩn và đồng nhất chưa?
3. Màu sắc liệu đã đúng token và đồng nhất chưa?
4. Kích thước, min-width đã chuẩn chưa?
5. Phân cấp thông tin vậy đã ổn chưa, đúng các rule UX chưa?
6. Danh sách / bảng trong popup (hoặc vùng cao cố định) đã giãn hết chiều cao chưa, thanh phân trang có ghim ở ĐÁY khung bảng không? Thấy phân trang nằm ngay dưới vài dòng dữ liệu, bên dưới là khoảng trống tới footer → báo SAI (xem “Danh sách trong popup: bảng giãn hết chiều cao, phân trang ghim đáy”).

Kết quả soát ảnh LUÔN kèm mục **Quy chuẩn để tự kiểm lại**: bảng các thành phần có trong ảnh → số + tên biến chuẩn → link trang tài liệu. Lý do: ảnh đã thu nhỏ / nén nên không đo chính xác được màu, khoảng cách, cỡ chữ — AVA chỉ ước lượng; người thiết kế / dev tự đo lại trên Figma hoặc bằng công cụ **Đo → Xem CSS** trên trang tài liệu, tra biến ở [Biến chuẩn](/ds/design-tokens).

## Tạo favicon

Để tạo favicon nhanh và chuẩn sử dụng công cụ: https://copyicon.com/generator/favicon-generator

## Convert ảnh sang webp trong Figma

Để convert ảnh từ figma sang webp bạn có thể sử dụng công cụ: https://copyicon.com/generator/webp-converter hoặc cài các plugin trên Figma

## Thiết kế biểu đồ dùng công cụ nào nhanh?

Thiết kế biểu đồ bạn có thể dụng công cụ này: https://copyicon.com/generator/svg-chart giúp sinh nhanh biểu đồ và copy vào Figma chỉnh sửa lại.

## Xem giá trị chi tiết của token (biến màu) trên Figma

Muốn xem giá trị chi tiết của token (VD --stroke-neutral có mã màu gì): mở file Figma MDS Web Components https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=1-9&m=dev → bảng bên trái chọn **Variables** → Collection **🎨 Themes** → chọn từng group bên dưới để xem mã màu.

## Ô nhập số căn thế nào?

Ô nhập số ở form bình thường vẫn căn text trái như các ô input khác. Tuy nhiên trong bảng dữ liệu có nhu cầu cộng dữ liệu giữa các dòng trong cột số với nhau nên cần căn phải để dễ cộng.

## Khi nào sử dụng mật độ hiển thị nào?

- **Nhỏ:** app cần hiển thị nhiều thông tin nhất có thể, VD Kế toán.
- **Trung bình:** mặc định cho các app quản trị thông thường.
- **Rộng:** không khuyến khích, chỉ cân nhắc cho app cá nhân đặc biệt.
Dù chọn mật độ nào vẫn phải thiết kế chuẩn trên màn 1366×768 theo [Yêu cầu hiển thị](/ds/display-requirement).

## Nút More (thêm chức năng): icon 3 chấm ngang

Nút thêm các chức năng khác dùng icon **3 chấm nằm ngang** cho đồng nhất, không dùng icon 3 chấm dọc.

## Sidebar có cấp con: xổ xuống dưới hay sang phải

Khi Sidebar có cấp con, việc lựa chọn xổ xuống dưới hay sang phải cân nhắc dựa trên 2 yếu tố sau:
- Xổ sang phải khi: Có rất nhiều con cần sắp xếp thành nhiều cột để dễ tìm kiếm thông tin hơn
- Xổ xuống dưới khi: Có giới hạn ít con nên không bị scroll sidebar quá nhiều để xem được các mục bên dưới

## Khi nào dùng Segment, khi nào dùng Tab

Dùng segment khi có nhu cầu bấm lọc dữ liệu, layout vẫn giữ nguyên. Dùng tab khi bấm qua lại giữa các tab đổi hẳn cả layout của nội dung bên trong tab

## Nút Lưu, Hủy trên form nhập liệu

Thanh nút **Lưu, Hủy** của mọi form nhập liệu (popup, drawer, trang thêm / sửa) **luôn ghim ở đáy form**, nút chính (Lưu) nằm bên phải. Nội dung form cuộn bên trên, thanh nút luôn nhìn thấy.

- **Không cho phép** đặt nút Lưu, Hủy ở đầu form (cạnh tiêu đề, trên cùng), kể cả form dài.
- Không đặt nút Lưu, Hủy ở cả 2 nơi (trên và dưới).
- Thi công: dùng slot `#footer` của `AppFormPanel` (đã ghim đáy); trang thêm / sửa toàn màn hình dùng thanh dính đáy (`position: sticky; bottom: 0`).

## Khoảng cách giữa 2 control cạnh nhau, nhãn (label) với ô nhập (trái / phải, trên / dưới), giữa các trường và nhóm trường trong form

- **2 control đặt cạnh nhau theo chiều ngang** (nút – nút, nút – ô nhập, tìm kiếm – combobox, icon – icon): **8px** — `--gap-control`. Tách bằng `gap` của khung chứa, không dùng margin; không dùng 4 / 6 / 10 / 12px.
- **Form nhãn TRÁI – ô PHẢI:** nhãn chữ Regular 13px, **rộng cố định 200px**, canh giữa theo chiều cao ô; nhãn → ô nhập **8px**; các hàng cách nhau **12px** (`--form-label-w`, `--form-label-gap-h`, `--form-row-gap-h`).
- **Form nhãn TRÊN – ô DƯỚI:** nhãn chữ Semi Bold 13px; nhãn → ô nhập **4px** (`--input-label-gap`); các trường cách nhau **16px** (`--form-row-gap-v`) — xa hơn dạng nhãn trái để nhãn luôn gần ô của nó hơn trường khác.
- **Nhiều nhóm trường trong 1 card:** các nhóm cách nhau **32px** (`--form-group-gap`), tiêu đề nhóm (13px Semi Bold) → lưới trường **12px**.
- **Form 2 cột:** 2 cột cách nhau **80px** (dưới 760px về 1 cột).
- Chỉ có 2 kiểu nhãn (trái / trên), không trộn 2 kiểu trong cùng 1 nhóm trường.
- **Trong popup:** nội dung cách viền popup **24px** — xem ví dụ ở [Popup](/ds/popup).
Các con số này không đổi theo mật độ hiển thị. Tra tên biến ở [Biến chuẩn](/ds/design-tokens).

## Khoảng cách giữa các card với nhau (màn Tổng quan), từ nội dung chính tới lề trái / phải / trên / dưới, đệm trong card

- Nội dung nằm trên nền xám BG Page, bọc trong card trắng bo góc 8px, bóng Neutral All 2, không viền.
- **Nội dung chính ↔ lề:** cách Sidebar (trái), lề phải trình duyệt (hoặc khối bên phải), lề dưới và phía trên (dưới thanh tiêu đề) đều **16px** — `--page-gutter` (padding của vùng nội dung, đều 4 phía). Chỉ khác khi UI/UX Designer chỉ định riêng.
- **Card ↔ card** (cả ngang lẫn dọc), **kể cả màn Tổng quan**: luôn **16px** — `--card-col-gap`.
- **Đệm trong card:** **16px đều 4 phía** (`--box-padding`), không để trên-dưới khác trái-phải — kể cả card KPI, biểu đồ, danh sách ở màn Tổng quan.
- Tiêu đề card (H3 Semi Bold) → nội dung bên dưới: **12px** (`--card-gap`).
- Card đặt trên nền trắng thì dùng viền Stroke Neutral thay cho bóng.
Tự đo: mở trang [Bố cục trang](/ds/layout) → bật **Đo** → rê chuột lên phần tử (Alt + bấm → **Xem CSS**); tra biến ở [Biến chuẩn](/ds/design-tokens).
