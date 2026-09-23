# BugFinder — Figma Plugin

Plugin Figma kiểm tra chính tả cho text layer trong bản thiết kế. Ngôn ngữ (Tiếng Anh / Tiếng Việt) được **tự động nhận diện** theo nội dung đang chọn — không cần chọn tay:

- **Tiếng Anh**: phát hiện từ/cụm từ không phải tiếng Anh lẫn vào, sai chính tả.
- **Tiếng Việt**: phát hiện từ ngữ vô nghĩa/sai chính tả.
- **Cả hai chế độ**: thừa/thiếu khoảng trắng, dấu câu lặp, và định dạng số theo chuẩn Design System (số phải dùng dấu chấm phân cách hàng nghìn, ví dụ `1.200.000` thay vì `1,200,000`).

Plugin **chỉ tập trung vào lỗi chính tả khách quan** (sai từ, thừa/thiếu dấu câu, khoảng trắng, từ ngữ vô nghĩa) — không phải công cụ gợi ý cải thiện văn phong/cách hành văn. Vì vậy 3 rule AI dễ lấn sang "gợi ý từ ngữ hay hơn" thay vì báo lỗi thật — **sai ngữ pháp tiếng Anh**, **danh từ riêng chưa viết hoa**, **sai ngữ pháp/dùng từ sai ngữ cảnh tiếng Việt** — mặc định **TẮT** (có thể bật lại trong panel rule nếu cần). Rule danh từ riêng đặc biệt hay báo nhầm với tên thương hiệu/sản phẩm nội bộ có cách viết hoa đặc thù (chữ hoa xen kẽ không theo quy tắc thông thường).

Kiểm tra khoảng trắng/dấu câu/định dạng số chạy cục bộ bằng regex (không cần API key). Riêng trường hợp khoảng trắng thừa chèn **giữa** 1 tên control quen thuộc — ví dụ "Textb      ox" thực chất là "Textbox" — có 2 lớp bắt lỗi:
- **Cục bộ, không cần API key**: có sẵn danh sách tên control phổ biến (Button, Textbox, Checkbox, Dropdown, Combobox, Tooltip, Datatable...); nếu xóa hết khoảng trắng thừa mà khớp đúng 1 tên trong danh sách, gợi ý luôn là nối liền lại đúng chính tả (không phải chỉ rút về 1 dấu cách).
- **AI (cần API key)**: nhận diện thêm các trường hợp ngoài danh sách cố định, dựa vào việc đọc hiểu chữ.

Khi cả 2 lớp cùng bắt được 1 vị trí, chỉ giữ lại gợi ý đúng (ẩn gợi ý sai "rút về 1 dấu cách" của rule khoảng trắng thông thường). Kiểm tra chính tả/ngữ nghĩa sâu hơn dùng [Gemini API](https://aistudio.google.com/app/apikey) (có free tier).

Việc kiểm tra chính tả/ngôn ngữ áp dụng cho **mọi text layer** trong lựa chọn, bất kể nó nằm trực tiếp trên trang hay lồng sâu bên trong 1 component/instance — không có ngoại lệ nào bị bỏ qua (khác với rule Design System, một số rule trong đó CÓ chủ đích bỏ qua nội dung bên trong component, xem mục dưới).

**Ngoại lệ duy nhất**: layer tuy để `visible = true` nhưng bị **1 layer khác đè kín hoàn toàn lên trên** (cùng cấp, đứng sau trong thứ tự layer, hình dạng đặc/không trong suốt, phủ kín trọn vẹn vùng của layer đó) — coi như không ai nhìn thấy được nội dung này nên bỏ qua **toàn bộ** kiểm tra (cả chính tả lẫn Design System), đồng thời không gửi lên AI (đỡ tốn cả thời gian lẫn chi phí gọi API). Cố tình kiểm tra rất chặt để tránh bỏ sót nhầm nội dung thật: chỉ tính khi layer đè lên là **hình khối đặc** (không phải mask, độ mờ ~100%, có fill solid gần như không trong suốt) và **bounding box phủ trọn** layer bị che — đè 1 phần, đè bằng hình mờ, hay chỉ là layer trang trí không tính.

Rule này so từng layer với **mọi layer con đứng sau nó trong cùng 1 parent** — với 1 parent có rất nhiều con (bảng dữ liệu hàng trăm dòng, sheet icon...) phép so này tăng theo cấp số nhân (bình phương số con), từng khiến plugin **crash cả sandbox chạy plugin của Figma** (lỗi `Aborted()` trong runtime của Figma, không phải lỗi JS thường) khi Review 1 file thật có parent quá nhiều con. Để tránh lặp lại, parent nào có **trên 200 layer con** thì bỏ qua hẳn rule này cho các layer con của nó (coi như không có layer nào che layer nào) — đây là đánh đổi có chủ đích: rule vốn chỉ xử lý 1 trường hợp hiếm (nội dung nháp còn sót lại bị đè), không đáng để rủi ro crash cả phiên làm việc.

Riêng 1 rule cục bộ **so sánh giữa các layer với nhau** thay vì đọc từng layer độc lập: **cùng 1 cụm từ (≥ 2 từ) viết hoa/thường không nhất quán** — ví dụ layer này ghi "iGOV Kế toán", layer khác lại "IGOV Kế toán" hoặc "iGOV kế toán" trong cùng 1 lựa chọn. Không phải cứ khác nhau 1 chữ hoa là bị tính lỗi ngay: nếu toàn bộ các cách viết khác nhau tìm được chỉ khác nhau ở chữ cái **đầu tiên** viết hoa hay thường (ví dụ "Kế toán" so với "kế toán") thì bỏ qua, vì đó là kiểu viết hoa tiêu đề/đầu câu bình thường, không chứng minh được gì. Chỉ khi có ít nhất 1 cách viết cho thấy kiểu viết hoa bất thường hơn thế — chữ không phải đầu tiên cũng viết hoa (ví dụ "Kế Toán"), hoặc 1 mẫu đặc biệt như "iGOV" — mới coi đây là 1 tên riêng/thương hiệu cố định cần đồng nhất, và báo lỗi cho mọi layer dùng cách viết khác. Không tự động chọn 1 cách viết "chuẩn" nào cả — Fix lỗi hiện tất cả các cách viết khác đang có trong lựa chọn dưới dạng nút bấm để **người dùng tự quyết định** nên đồng bộ về cách viết nào. Chỉ so khớp toàn bộ nội dung layer (không tách từng từ trong câu).

## 2 tab: Review Website vs Review Web App

Ngay dưới ô API key có 2 tab **Review Website** / **Review Web App** — chọn tab nào thì panel rule bên dưới chỉ hiện đúng nhóm rule của tab đó (đỡ rối, không thấy lẫn nhóm rule không liên quan), và nút Review ở cuối cùng đổi tên/màu theo tab đang chọn:

- **Review Website**: chỉ hiện & chạy các rule chính tả/ngôn ngữ/định dạng số ở trên — phù hợp khi chỉ cần rà nội dung/chính tả, không quan tâm chi tiết style.
- **Review Web App**: hiện thêm và chạy thêm nhóm rule lint theo chuẩn Design System dựa trên thuộc tính thật của layer trên canvas (không cần AI, không cần API key), ngoài các rule chính tả/ngôn ngữ ở trên:
  - **Font**: text layer phải dùng font Inter. *(có Fix lỗi)*
  - **Cỡ chữ**: phải thuộc thang 20 (h2) / 16 (h3) / 13 (Body Regular) / 12 (Body Small). *(chỉ báo lỗi, không Fix — nhiều cỡ hợp lệ nên không biết chắc nên đổi về cỡ nào)*
  - **Fill (màu chữ)**: fill của text layer phải **link** tới 1 Paint Style hoặc Variable nào đó trong thư viện; màu thô (raw, chưa link gì) bị báo lỗi — **trừ khi** ô cấu hình rule (xem mục dưới) có nhập sẵn danh sách mã hex hợp lệ và màu thô đó khớp đúng 1 mã trong danh sách, thì vẫn được coi là đạt dù chưa link. *(chỉ báo lỗi, không Fix — các sắc xám trong 1 thang màu (Primary/Secondary/Hint/Disabled Neutral...) quá gần nhau để tự đoán hay tự gợi ý đáng tin cậy, để người dùng tự link thủ công đúng token)*
  - **Stroke (màu viền)**: cùng cơ chế với Fill ở trên (link hoặc khớp danh sách hex cấu hình là đạt), áp dụng chung cho cả border thường lẫn stroke của icon, không phân biệt theo tên layer.
  - **Chiều cao control**: layer có tên trùng 1 control **nhập liệu** (button, textbox, combobox, searchbox...) phải cao đúng 32px. Bỏ qua icon thường (tên chứa "icon") vì icon không phải control — trừ **Button Icon / Icon Button** (có component icon-button riêng, vẫn cần đúng chiều cao). Bỏ qua **Checkbox, Radio, Switch (Toggle), Tag** — các control nhỏ này có kích thước riêng theo thiết kế, không theo chuẩn chiều cao 32px. Bỏ qua **Dropdown Menu** — đây là menu/danh sách nổi (chiều cao tùy số lượng item), khác loại với control Combobox nhập liệu vốn mới cần đúng 32px. *(có Fix lỗi)*
  - **Bo góc control**: control thường phải bo 8px; layer tên chứa card/modal/popup/dialog phải bo 12px. Bỏ qua layer không có Fill lẫn Stroke (bo góc không có gì để nhìn thấy). *(có Fix lỗi)*
  - **Gap** (tên Figma dùng trong Auto Layout cho item spacing), xử lý theo thứ tự ưu tiên sau (khớp trường hợp nào thì dùng đúng trường hợp đó, không cộng dồn):
    - `0px` luôn được bỏ qua (không tính là lỗi).
    - Auto layout **chỉ có 1 child** — bỏ qua hoàn toàn, Gap không có ý nghĩa khi không có gì để cách ra.
    - Layer tên chứa **"Hyperlink"** với Gap đúng **4px** — bỏ qua, đây là khoảng cách chuẩn giữa icon và label của Hyperlink, không phải lỗi.
    - Auto layout **Horizontal mà mọi child đều là button** (tên chứa "button") — hàng button ngang, phải có Gap đúng bằng giá trị chuẩn riêng (mặc định 8px, đổi được trong ô cấu hình rule), không áp dụng thang bội số chung. *(có Fix lỗi — giá trị chuẩn cố định, biết chắc nên sửa về bao nhiêu)*
    - Frame/layer nằm **bên trong 1 component hoặc instance** (không phải bản thân nó) — bỏ qua hoàn toàn, tin tưởng theo thiết kế gốc của thư viện, không so với thang spacing chung.
    - **Bản thân 1 component instance** (kéo từ thư viện Design System bất kỳ) — chỉ báo lỗi khi spacing của instance đó **khác với component gốc** trong thư viện (so trực tiếp qua `getMainComponentAsync()`), không so theo bội số. *(có Fix lỗi — vì giá trị đúng đã biết chính xác từ component gốc)*
    - Layer/frame thường (không thuộc instance nào) — phải là **bội số của đơn vị chuẩn** (mặc định 4px, đổi được trong ô cấu hình rule) — ví dụ 48px vẫn hợp lệ vì là bội số của 4, không cần nằm trong 1 danh sách cố định. *(có Fix lỗi dạng chọn nhanh — hiện 2 nút là bội số gần nhất phía dưới và phía trên giá trị hiện tại, ví dụ Gap 10px với đơn vị 4 sẽ gợi ý "Fix → 8px" và "Fix → 12px")*
  - **Drop Shadow cho card**: box/frame Fill trắng (`#FFFFFF`) + bo góc 8px (thường là card nằm trên nền xám BG Page) phải gắn effect style đúng tên chuẩn (mặc định `Drop Shadow/Neutral/All 2`, đổi được trong ô cấu hình rule) — thiếu shadow hoặc gắn sai effect style đều bị báo lỗi. Chỉ kiểm tra qua **tên effect style** (`getStyleByIdAsync`), không so khớp giá trị offset/blur/màu thô. Chỉ áp dụng cho layer nằm **trực tiếp trên trang** — bất kỳ box nào nằm **bên trong 1 component/instance** (button, textbox, hay component tùy chỉnh khác...) đều bị bỏ qua, vì phần bên trong component do thư viện tự quản lý. *(có Fix lỗi)*
  - **Component bị đổi thuộc tính khác bản gốc**: instance kéo từ thư viện nhưng có 1 layer bên trong (chính nó hoặc lồng sâu bên trong) bị **override 1 trong 4 nhóm thuộc tính**: **Padding**, **Bo góc**, **Stroke** (màu/độ dày), hoặc **Fill** (màu) — khác với component gốc. Dùng trực tiếp `InstanceNode.overrides` do Figma tự theo dõi để biết CÓ override hay không, sau đó tự đi tìm lại đúng layer tương ứng bên trong component gốc (theo vị trí trong cây, cùng cách khớp với tab So sánh Text) để đọc ra **giá trị gốc** — lỗi hiện rõ dạng "trước → sau" (ví dụ `Bo góc 8px → 4px`, `Fill #0D6EFD → #FF0000`), không chỉ nêu tên thuộc tính bị đổi. **Cố tình bỏ qua** mọi thuộc tính khác — nội dung chữ, vị trí, kích thước, font, hiệu ứng, opacity... — vì đó là tùy biến hợp lệ, thường gặp (đổi label button, kéo giãn 1 card...) hoặc ngoài phạm vi rule này. *(chỉ báo lỗi, không Fix — Figma chỉ cho reset **toàn bộ** override của instance cùng lúc, sẽ xóa mất luôn cả phần tùy biến hợp lệ như nội dung chữ)*
  - Layer/frame có tên khớp **rule bỏ qua** (xem mục dưới) — bỏ qua toàn bộ rule Design System (font, màu, kích thước, gap, shadow, override), không riêng gì Gap.

  Việc nhận diện "đây có phải 1 control không" (cho rule chiều cao/bo góc) dựa theo **tên layer/component** khớp với từ khóa trong Control Registry — layer đặt tên không theo quy ước này (ví dụ tên tự do tiếng Việt) sẽ bị bỏ qua 2 rule chiều cao/bo góc (vẫn check được font/màu/spacing bình thường).

  ### Fix lỗi tự động cho rule Design System

  6 rule đánh dấu *(có Fix lỗi)* ở trên hiện nút **Fix lỗi** như rule chính tả — bấm là áp dụng thẳng lên canvas (không phải thay text):
  - Font → đổi family cho từng đoạn text (giữ nguyên style/weight từng đoạn nếu text có nhiều kiểu chữ khác nhau).
  - Chiều cao/bo góc control → `resize`/`cornerRadius` layer về đúng giá trị chuẩn.
  - Gap của instance lệch component gốc → set lại `itemSpacing` về đúng giá trị component gốc.
  - Drop Shadow → gắn effect style đúng tên vào layer. Ưu tiên tìm trong style cục bộ của file; nếu không thấy (style đến từ thư viện ngoài), tự quét toàn trang tìm layer khác đang dùng đúng effect style đó để lấy lại ID — nếu vẫn không thấy ở đâu trong file thì báo lỗi, không áp dụng được.
  - Stroke → tìm trong thư viện màu đang chọn (xem mục "Chọn thư viện màu" dưới đây), nếu không chọn thư viện nào hoặc không có trong đó thì tìm trong `getLocalPaintStylesAsync`/`getLocalVariablesAsync` 1 Paint Style hoặc color Variable đang có giá trị đúng bằng màu hiện tại rồi **link** layer vào đó; không tìm thấy gì trùng ở cả 2 nguồn thì báo lỗi, không tự gán màu thô.

  Gap theo thang chung hiện dạng *(có Fix lỗi dạng chọn nhanh)* — 2 nút bội số gần nhất.

  2 rule còn lại **cố tình không có Fix lỗi**:
  - Cỡ chữ — có nhiều cỡ hợp lệ, plugin không biết chắc bạn định đổi về cỡ nào.
  - Component bị đổi thuộc tính khác bản gốc — Figma chỉ cho reset toàn bộ override cùng lúc (không tách riêng theo thuộc tính), sẽ xóa mất luôn phần tùy biến hợp lệ (nội dung chữ...).

## Chọn thư viện màu (Fix lỗi Stroke chính xác hơn)

Ở đầu nhóm rule **Design System (Web App)** có 1 ô chọn **Thư viện màu** — liệt kê mọi team library đang **bật** trong file hiện tại (qua `figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync`, gom theo tên thư viện — chỉ cần chọn đúng thư viện, không cần biết nó có bao nhiêu collection bên trong). Chọn 1 thư viện thì plugin quét **tất cả** collection thuộc thư viện đó và **import** từng color Variable trong đó (`getVariablesInLibraryCollectionAsync` + `importVariableByKeyAsync`) để đọc ra giá trị hex thật, dựng thành 1 bảng tra hex → Variable dùng riêng cho việc Fix lỗi Stroke ở trên — chính xác hơn cách cũ (chỉ so trong Variable/Style **cục bộ của file**, vốn thường trống nếu file chỉ tiêu thụ 1 thư viện ngoài chứ không tự định nghĩa token). Không chọn gì thì quay lại hành vi mặc định (chỉ so cục bộ). Lựa chọn được lưu qua `figma.clientStorage`, giữ nguyên giữa các lần mở plugin.

**Giới hạn**:
- Figma Plugin API chỉ cho liệt kê **Variable** trong thư viện (`TeamLibraryAPI`), không có API để liệt kê **Paint Style** trong thư viện ngoài — nên tính năng này chỉ cải thiện độ chính xác khi màu được định nghĩa bằng Variables; nếu thư viện chỉ dùng Paint Style, rule Fill/Stroke vẫn hoạt động như cũ (chỉ kiểm tra đã link *hay chưa*, không so khớp giá trị theo thư viện cụ thể).
- Cần khai báo `"permissions": ["teamlibrary"]` trong `manifest.json` (đã có sẵn) — thiếu dòng này thì mọi lệnh gọi `figma.teamLibrary.*` sẽ bị Figma từ chối ngay từ đầu (báo lỗi `"teamlibrary" permission not specified`), và **cần restart hẳn Figma desktop** (không chỉ chạy lại plugin) sau khi thêm/sửa quyền này để Figma nạp lại manifest.

Nếu không muốn phụ thuộc vào Team Library API (ví dụ chưa add đủ thư viện, hoặc thư viện chỉ dùng Paint Style), có thể dùng cách đơn giản hơn — xem ô chỉnh sửa của 2 rule Fill/Stroke ở mục dưới, nhập trực tiếp danh sách mã hex chuẩn.

## Bật/tắt & chỉnh sửa từng rule

Panel rule nằm ngay dưới 2 tab Review Website/Web App, luôn hiển thị (không cần bấm mở), cao gần hết chiều cao popup (chia sẻ phần còn lại với khu vực kết quả bên dưới) — mỗi rule có 1 checkbox bật/tắt riêng, mỗi **nhóm** rule (Kiểm tra chung / AI Tiếng Anh / AI Tiếng Việt / Design System) bấm vào tên nhóm hoặc mũi tên ▾/▸ để **thu gọn/mở rộng** riêng nhóm đó cho gọn (trạng thái thu gọn chỉ tồn tại trong phiên làm việc, không lưu lại). Panel chỉ hiện nhóm rule liên quan tới tab đang chọn (xem mục "2 tab" ở trên). Những rule có giá trị số/chuỗi cấu hình được (font chuẩn, thang cỡ chữ, chiều cao/bo góc control, thang spacing, ký tự phân cách số, **danh sách mã hex hợp lệ cho Fill/Stroke**) hiện thêm 1 ô nhập giá trị ngay dưới — sửa xong áp dụng ngay cho lần Check tiếp theo, không cần lưu riêng. Rule màu chữ/màu border để **trống** ô này theo mặc định (chỉ kiểm tra đã link Style/Variable hay chưa, như trước) — nhập mã hex (cách nhau bởi dấu phẩy, ví dụ `0D6EFD, 212529`) nếu muốn coi 1 màu thô cụ thể là hợp lệ dù chưa link (xem mục "Chọn thư viện màu" ở trên cho cách khác — dùng Team Library thật). Tất cả được lưu qua `figma.clientStorage` (giữ nguyên giữa các lần mở plugin). Muốn thêm rule mới vào danh sách cố định, sửa file `src/rulesConfig.ts` (định nghĩa, thêm `editable` nếu cần giá trị chỉnh sửa) rồi wire vào `src/localChecks.ts`/`src/designChecks.ts` (rule cục bộ) hoặc `src/gemini.ts` (rule AI, tự động được thêm vào prompt khi bật).

## Ngôn ngữ hiển thị plugin

Góc trên bên phải (cạnh 2 tab Review/So sánh Text) có 2 nút cờ 🇻🇳/🇬🇧 để chọn **ngôn ngữ hiển thị của chính plugin** (label rule, thông báo lỗi, mọi chữ trong UI) — tách biệt hoàn toàn với việc plugin **tự nhận diện** ngôn ngữ Anh/Việt của nội dung đang kiểm tra (mục đầu file). Chọn 🇻🇳 thì toàn bộ giao diện + rule + thông báo hiển thị tiếng Việt, chọn 🇬🇧 thì đổi hết sang tiếng Anh, kể cả câu giải thích lỗi (`message`) mà Gemini trả về. Lựa chọn lưu qua `figma.clientStorage`, giữ nguyên giữa các lần mở plugin. Toàn bộ chữ hiển thị được định nghĩa trong `src/i18n.ts` (2 dictionary `VI`/`EN`, tra bằng key qua hàm `t()`) — muốn sửa chữ hiển thị thì sửa ở đây, không sửa trực tiếp trong `ui.html`/`ui.ts`.

## Rule tùy chỉnh

Trong panel rule có ô "Rule tùy chỉnh" (hiện ở cả 2 tab, dùng chung cho cả Review Website lẫn Review Web App) — nhập tự do, mỗi dòng 1 rule (ví dụ: `Không dùng từ "oke", phải viết "OK"` hoặc `Tên sản phẩm "Acme Cloud" phải viết đúng hoa thường`), bấm **Lưu rule tùy chỉnh**. Các rule này được gửi kèm vào prompt AI (áp dụng cho cả 2 ngôn ngữ) và cần có API key mới chạy được — không có tác dụng với kiểm tra cục bộ (regex).

## Rule bỏ qua (theo tên layer)

Dưới ô Rule tùy chỉnh có thêm ô "Rule bỏ qua" (cũng hiện ở cả 2 tab, nhưng chỉ có tác dụng khi Review Web App vì rule Design System mới đọc thuộc tính layer) — trống theo mặc định, nhập tự do, mỗi dòng 1 từ khóa (xem ví dụ trong placeholder của ô, ví dụ `Icon Swap`). Khớp **tức thì, không cần API key**: layer/component có **tên chứa** nguyên văn 1 dòng từ khóa (không phân biệt hoa thường) sẽ khớp ngay và áp dụng luôn cho mọi layer con bên trong.

> Trước đây rule này còn có thêm 1 lớp AI hiểu theo ngữ nghĩa (Gemini đọc tên layer và tự suy luận xem có khớp mô tả không) — đã bỏ vì làm chậm quá trình quét đáng kể mà AI chỉ thật sự cần thiết cho việc kiểm tra chính tả/ngôn ngữ của nội dung text, không cần cho việc xác định layer nào cần bỏ qua.

Layer khớp sẽ **bỏ qua toàn bộ rule Design System** (font, Fill/Stroke, kích thước, Gap) khi chạy Review Web App — không ảnh hưởng tới rule chính tả/ngôn ngữ. Bấm **Lưu rule bỏ qua** để lưu qua `figma.clientStorage`.

## Danh sách kết quả: lọc & thu gọn

Trong màn hình kết quả có thanh tab lọc theo loại lỗi (Tất cả / Chính tả & ngôn ngữ / Khoảng trắng & dấu câu / Màu sắc / Font chữ / Kích thước / Khoảng cách / Hiệu ứng / Component bị đổi thuộc tính) — mỗi tab hiện kèm số lượng, mặc định chọn "Tất cả". Bấm vào phần header của mỗi layer (ngoài tên layer) để thu gọn/mở rộng riêng layer đó; nút **"▾ Thu gọn tất cả" / "▸ Mở rộng tất cả"** ở đầu danh sách để thu gọn/mở rộng toàn bộ cùng lúc.

## Tab "So sánh Text": đối chiếu nội dung giữa 2 frame

Ngay đầu popup có 3 tab cấp cao nhất: **Review** (toàn bộ nội dung ở trên — kiểm tra chính tả/Design System cho 1 lựa chọn), **So sánh Text** (tính năng riêng, không liên quan chính tả/AI/rule) — dùng khi có 2 frame cấu trúc tương tự nhau (ví dụ 2 phiên bản/2 trạng thái của cùng 1 màn hình) và muốn biết chỗ nào nội dung text đang lệch nhau giữa 2 bên, và **Xem Comment** (xem mục riêng bên dưới).

Cách dùng: chọn **đúng 2 frame** trên canvas (giữ Shift để chọn cả 2 cùng lúc), chuyển sang tab So sánh Text, bấm **So sánh** (màn hình chuyển sang kết quả, có nút **"← Quay lại"** để chọn cặp frame khác). Plugin ghép từng text layer giữa 2 frame theo **vị trí trong cây** (thứ tự layer con ở từng cấp, ví dụ layer con thứ 3 trong layer con thứ 1 của frame) — **không dùng tên layer** để khớp, vì Figma tự đổi tên layer text theo đúng nội dung mỗi khi nội dung đổi (kể cả do chính plugin sửa), nếu khớp theo tên sẽ bị lệch ngay sau lần đồng bộ đầu tiên.

Kết quả chỉ liệt kê những chỗ **khác nhau** — bỏ qua mọi cặp có nội dung giống hệt nhau. Không hiện tên/đường dẫn layer, chỉ hiện đúng nội dung text của từng bên. 2 dạng khác biệt:
- **Nội dung khác nhau**: layer khớp được ở cả 2 bên nhưng text không giống nhau — hiện cả 2 giá trị cạnh nhau, phần chữ thực sự khác nhau giữa 2 bên được **tô nền vàng** (so theo phần đầu/cuối giống nhau, chỉ đoạn ở giữa khác nhau mới tô — cùng cách tính với phần "chỉ thay chữ thực sự khác nhau" khi đồng bộ bên dưới) để không phải dò từng chữ bằng mắt. Bấm vào 1 bên để chọn + zoom tới đúng layer đó trên canvas; bấm nút **"Dùng nội dung này →"** dưới 1 bên để tự động đồng bộ bên còn lại theo đúng text đó — chỉ thay phần chữ thực sự khác nhau (giữ nguyên phần đầu/cuối giống nhau), nên **không đụng đến style/màu chữ** của layer, kể cả layer có nhiều màu trộn trong cùng 1 text.
- **Chỉ có ở 1 bên**: layer tồn tại ở frame này nhưng không khớp được layer tương ứng ở frame kia (ví dụ 1 bên có thêm/bớt 1 text layer) — hiện rõ bên nào thiếu, không có nút đồng bộ (không có gì ở bên kia để chọn).

Giới hạn: khớp theo vị trí cấu trúc nên nếu 2 frame có số lượng/thứ tự layer con khác nhau ở 1 cấp nào đó (không chỉ khác nội dung mà khác cả số lượng layer), các layer đứng sau chỗ lệch đó trong cùng cấp có thể bị khớp nhầm — phù hợp nhất khi 2 frame là bản sao gần giống hệt nhau, chỉ khác nội dung chữ.

Giới hạn cần biết: việc khớp cặp layer dựa vào tên + vị trí cấu trúc — nếu 2 frame có tên layer khác nhau hoàn toàn hoặc cấu trúc cây bị xáo trộn (thêm/xóa/đổi thứ tự layer cha), việc khớp cặp có thể sai lệch hoặc bỏ sót. Phù hợp nhất khi 2 frame là bản sao/biến thể gần giống nhau của cùng 1 thiết kế.

## Tab "Xem Comment": lọc comment của file theo người viết/trạng thái

Figma Plugin API **không có cách nào đọc comment của file** — tính năng này gọi thẳng **Figma REST API** (`GET /v1/files/:file_key/comments`) ngay từ UI của plugin thay vì qua Plugin API, nên cần thêm 1 bước xác thực riêng, tách biệt hoàn toàn với Gemini API key:

1. Dán **Figma Personal Access Token** (tạo tại Figma → Settings → Security → Personal access tokens, xem hướng dẫn qua nút "?" cạnh ô nhập) rồi bấm **Lưu** — token chỉ lưu trên máy qua `figma.clientStorage`, không gửi đi đâu ngoài Figma.
2. Dán **link file Figma đang mở** (URL trên thanh địa chỉ, dạng `.../file/...`, `.../design/...` hay `.../proto/...` đều được) vào ô "Link hoặc file key của file Figma" — hoặc dán thẳng file key nếu đã biết. Plugin tự tách file key ra khỏi URL bằng regex, không cần bạn tự cắt link.
3. Bấm **"Tải comment của file này"**.
4. Sau khi tải xong, 2 ô lọc hiện ra: **người viết** (danh sách tự gom từ chính các comment vừa tải, không cần biết trước) và **trạng thái** (Tất cả / Đã resolve / Chưa resolve). Danh sách bên dưới lọc lại ngay lập tức theo lựa chọn, không cần tải lại từ Figma.

Khi đã lọc theo đúng 1 người, tên người viết không hiện lại trên từng dòng nữa (dư thừa vì đã lọc rồi theo đúng người đó) — chỉ còn nhãn trạng thái + nội dung comment, cho gọn.

Về trạng thái: chỉ **comment gốc** (không phải reply trong 1 thread) mới thực sự mang `resolved_at` từ Figma — reply luôn có `resolved_at = null` dù cả thread đã resolve. Plugin tự suy ra đúng trạng thái cho reply bằng cách kế thừa từ comment gốc của thread chứa nó, để lọc theo trạng thái không bị sai đối với reply.

Bấm thẳng vào **cả card** của 1 comment (không cần icon riêng) để mở vị trí đó trong Figma (tab mới) — dựng link theo `client_meta.node_id` mà API trả về (node/frame comment đó được ghim vào) + query `?node-id=` chuẩn của Figma. **Lưu ý**: Figma không công bố URL riêng để mở thẳng đúng popup của 1 comment cụ thể (không có tài liệu chính thức nào cho việc này) — link này chỉ đưa bạn tới đúng node/frame chứa comment, không tự bung popup comment đó ra. Comment nào ghim thả nổi trên canvas (không gắn vào node/frame nào) thì không có `node_id` nên card đó không bấm được (hiện như văn bản thường, không đổi màu khi hover).

**Vì sao phải tự dán link/file key thay vì plugin tự lấy?** Plugin API có `figma.fileKey`, nhưng property này **chỉ hoạt động với private/organization plugin có bật `enablePrivatePluginApi`** (yêu cầu gói Enterprise + cấu hình riêng từ admin) — với 1 plugin thường như BugFinder, `figma.fileKey` luôn trả về `undefined`. Dán link/file key thủ công là cách duy nhất hoạt động được cho mọi người dùng, không riêng gì tổ chức có Enterprise.

**Giới hạn**: file chưa từng lưu vào Figma (draft cục bộ, chưa có file key thật) thì không tải được comment — Figma REST API không có khái niệm về file dạng này.

## Cài đặt & build

```bash
cd bugfinder
npm install
npm run build
```

Lệnh trên tạo ra `dist/code.js` và `dist/ui.html` (đã inline sẵn JS, không cần server).

Muốn tự động build lại khi sửa code: `npm run watch`.

## Import vào Figma

1. Mở Figma desktop app.
2. Menu **Plugins → Development → Import plugin from manifest...**
3. Chọn file `manifest.json` trong thư mục `bugfinder`.
4. Chạy plugin từ **Plugins → Development → BugFinder**.

## Sử dụng

1. Lấy Gemini API key miễn phí tại https://aistudio.google.com/app/apikey (đăng nhập Google, tạo API key).
2. Dán key vào ô "Gemini API key" trong plugin, bấm **Lưu** (key được lưu qua `figma.clientStorage`, không gửi đi đâu khác ngoài Gemini API). Sau khi lưu, ô này gọn lại chỉ còn 1 dòng "✓ Đã lưu Gemini API key" — bấm **Sửa** để nhập lại/đổi key khác.
3. Chọn tab **Review Website** hoặc **Review Web App** ở trên cùng, tùy loại review muốn chạy — panel rule bên dưới sẽ chỉ hiện đúng nhóm rule của tab đó.
4. Chọn 1 Frame (hoặc 1/nhiều layer) trên canvas — plugin theo dõi selection theo thời gian thực: chưa chọn gì thì nút Review bị mờ/disable và chỉ hiện khung viền nét đứt "Chọn 1 Frame để review"; chọn xong thì hiện tên layer đang chọn và nút sáng lên.
5. Bấm nút Review (tên và màu đổi theo tab đang chọn) — plugin tự nhận diện ngôn ngữ chủ đạo rồi áp rule tương ứng (không hiển thị lên UI).
6. Sau khi quét xong, giao diện tự chuyển sang **màn hình kết quả** (ẩn hết phần cấu hình rule để đỡ rối) — thanh trên cùng ghi rõ đây là kết quả của Review Website hay Web App; mỗi card hiện tên layer + số lỗi, danh sách chi tiết bên dưới. Bấm **← Quay lại** để về màn hình cấu hình rule/API key và chạy lại kiểu review khác.
7. Bấm vào bất kỳ đâu trên 1 dòng lỗi (không cần trúng tên layer) để nhảy tới đúng layer đó trên canvas. Bấm **Fix lỗi** để tự động thay thế đoạn text lỗi bằng gợi ý (chỉ có ở rule chính tả/ngôn ngữ, rule Design System không có nút này) — fix xong, lỗi đó tự biến mất khỏi danh sách ngay (không cần Review lại); layer nào hết sạch lỗi thì cả card cũng tự ẩn theo.

Các thông báo kiểu "đã lưu", "đã áp dụng gợi ý" hiện dưới dạng **toast của Figma** (`figma.notify`, tự ẩn sau vài giây, hiện đè lên canvas) thay vì chiếm một dòng cố định trong popup — dòng trạng thái trong popup chỉ dùng cho tiến trình quét/kiểm tra đang chạy và tóm tắt số lỗi tìm được.

## Giới hạn cần biết

- "Fix lỗi" tìm đúng đoạn text gốc (`original`) trong layer để thay thế — nếu nội dung layer đã thay đổi kể từ lúc quét, thao tác sẽ báo lỗi thay vì áp dụng nhầm chỗ.
- Văn bản mỗi layer bị cắt ở 4000 ký tự khi gửi đi kiểm tra (đủ dùng cho hầu hết text UI).
- Gemini free tier có giới hạn số request/phút — nếu quét quá nhiều layer cùng lúc có thể gặp lỗi rate limit (429), thử lại sau ít phút hoặc quét theo từng phần nhỏ hơn.
- AI có thể bỏ sót hoặc báo sai lỗi (đặc biệt với thuật ngữ kỹ thuật, tên thương hiệu) — luôn xem lại gợi ý trước khi áp dụng.
- **Review Web App** quét toàn bộ layer (không chỉ text) trong lựa chọn, tối đa 3000 layer/lần — lựa chọn quá lớn sẽ chỉ quét phần đầu và báo qua thông báo Figma. Việc quét cây layer chạy đồng bộ (nhanh); các lượt gọi Figma API cần bất đồng bộ (so sánh Gap với component gốc, tra tên effect style) được gom lại và chạy **song song** sau khi quét xong thay vì tuần tự, nên quét lượng lớn layer không bị chậm tuyến tính theo số lượng.
- Nếu 1 text layer dùng nhiều font/cỡ chữ khác nhau trong cùng layer (mixed styles), rule font/cỡ chữ đọc **từng đoạn text riêng** (qua `getStyledTextSegments`) và báo lỗi cho từng font/cỡ chữ sai tìm thấy, không bỏ qua cả layer chỉ vì có nhiều style trộn lẫn.
- Rule chiều cao/bo góc control chỉ chạy khi tên layer/component khớp từ khóa trong Control Registry (button, textbox, checkbox...) — dựa theo tên, không đọc component gốc trong thư viện.
- Manifest **không** bật `"documentAccess": "dynamic-page"` — có thử bật nhưng gây crash toàn bộ JS runtime sandbox của Figma (`Aborted()` trong `get_absoluteBoundingBox`, xem `isOccludedBySibling`) khi Review Website trên file thật, nên đã bỏ lại. Dù vậy, code vẫn ưu tiên dùng các API bất đồng bộ khi có sẵn (`getNodeByIdAsync`, `getMainComponentAsync`, `getStyleByIdAsync`, `getLocalPaintStylesAsync`...) thay vì bản đồng bộ đã deprecated — các hàm này hoạt động bình thường ở cả 2 chế độ, chỉ là không **bắt buộc** phải dùng khi không bật dynamic-page.
