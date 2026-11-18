<!-- SINH TỰ ĐỘNG từ mds-docs /ds/data-table (2026-11-18) — không sửa tay -->
# Data table

> Các bảng dữ liệu cho phép người dùng quét, phân tích, so sánh, lọc, sắp xếp và thao tác để thu được thông tin chi tiết và thực hiện các hành động. Chi tiết components: **[Tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-100857&m=dev&t=qNdwv6j6JAHTjvlu-1)**

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — thao tác thử, đổi mật độ hiển thị, bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/DataTableDemo.vue`
Bấm **⚙ Thiết lập** để mở drawer *Thiết lập bảng* (kéo thả đổi thứ tự, ẩn / hiện, đổi tên cột, độ rộng, ghim cột) · bấm **Bộ lọc** để mở panel lọc nhiều tiêu chí bên phải bảng. Cột ghim đứng yên khi kéo ngang, luôn nằm sau cột tick chọn.

### Các loại cột

> Ví dụ chạy thật: `mds-docs/src/demos/DataTableTypesDemo.vue`
### Bảng sửa trực tiếp trong ô

> Ví dụ chạy thật: `mds-docs/src/demos/DataTableEditDemo.vue`
## Sử dụng

Một bảng dữ liệu thông thường sẽ có cấu trúc như hình bên dưới, bao gồm các thông tin sau:
- Ô tìm kiếm dữ liệu trong bảng (Bắt buộc)
- Bộ lọc nhanh (Tùy chọn có hoặc không)
- Các action của toàn bảng: Icon reload để tải lại dữ liệu mới nhất, Icon xuất khẩu dữ liệu của bảng, Icon thiết lập bảng, Icon lọc). Tùy vào danh sách nhiều hay ít dữ liệu cân nhắc giữ lại các action tương ứng.
- Vùng giữa là nội dung của dữ liệu gồm có: Header, Các dòng dữ liệu, Footer
- Cuối cùng là Paging dùng phân trang dữ liệu

![](/ds/files/15ff199fc35ebd15afde3819de6a41f4534d7815.png)

### Các dạng bảng dữ liệu

Có 2 dạng bảng dữ liệu

#### Bảng đơn giản

Đây là bảng phổ biến nhất dùng cho nhiều loại danh sách thông thường. Ví dụ: Danh mục, danh sách nhân viên, danh sách khách hàng...

![](/ds/files/317f54e81d2eb8289a08bb45c20ebd9dc14e4973.png)

#### Bảng phức tạp có gộp các nhóm trên cột

Dùng có các dạng bảng phức tạp cần gộp nhiều thông tin cha, con. Ví dụ: Bảng lương...

![](/ds/files/9f3443792432a5d51cb2a73db2deba966e019cc4.png)

Xem thử ở **Ví dụ trực quan** đầu trang: chọn **Loại bảng › Bảng lương (header gộp ô)**. Quy chuẩn:

- **Header gộp ô:** các cột con cùng một nhóm (VD *Lương cơ bản*, *Lương đóng BH* thuộc nhóm **Lương chuẩn**) có chung một ô nhãn nhóm phía trên, rộng đúng bằng tổng các cột con. Cột không thuộc nhóm nào (Mã NV, Họ tên, Thực lĩnh…) có ô tiêu đề **cao 2 hàng** (gộp dọc).
- **Vạch ngăn cột nét liền:** bảng có header gộp ô dùng vạch ngăn cột **nét liền** ở cả tiêu đề lẫn thân bảng (bảng thường thân bảng là nét chấm) để thấy rõ từng cột thuộc nhóm nào.
- **Tiêu đề căn giữa** (cả ô nhóm lẫn ô cột); dữ liệu vẫn căn theo quy tắc: chữ căn trái, số tiền / số liệu so sánh căn phải.
- Cột ghim (Mã, Họ tên) vẫn đứng yên khi cuộn ngang; hàng nhóm cuộn cùng nội dung; hàng tiêu đề dính đầu khung khi cuộn dọc.
- **Thi công:** khai báo `group: 'Tên nhóm'` trên các cột con (các cột cùng nhóm phải **liền nhau** và nên có `width` cố định) và thêm `column-line-style="solid"`:

```vue
<DataTable :columns="cols" :rows="rows" show-footer column-line-style="solid" />
// cols: [{ key: 'code', label: 'Mã NV', width: 90 },
//        { key: 'base', label: 'Lương cơ bản', width: 130, align: 'right', group: 'Lương chuẩn' },
//        { key: 'insured', label: 'Lương đóng BH', width: 150, align: 'right', group: 'Lương chuẩn' }, …]
```

`column-line-style` nhận `dotted` (mặc định, nét chấm) hoặc `solid` (nét liền); dùng được cho cả bảng thường khi cần vạch rõ ràng. Muốn bỏ hẳn vạch ngăn thì dùng `:column-lines="false"`.

#### Bảng nằm trong card trắng

Bảng có thể đặt **trong một card trắng** (card có tiêu đề, hoặc card chứa bảng cùng các khối thông tin khác). Xem thử ở **Ví dụ trực quan › Loại bảng › Bảng trong card**.

- **Bảng đặt thẳng trên nền xám của trang:** khung bảng chính là card (bo 8px, bóng *Neutral All 2*, không viền), bảng sát mép khung. **Bảng đặt trên nền xám nên luôn có thanh công cụ (nền trắng) phía trên** — hàng tiêu đề cột có nền xám gần giống nền trang, nếu không có thanh công cụ thì tiêu đề bị lẫn vào nền chung.
- **Bảng đặt trong card trắng:** card theo style chung — **đệm 16px đều 4 phía** cho mọi thông tin bên trong — nên bảng không còn sát mép card. Lúc này khung bảng **có viền 1px `--stroke-neutral` và bo góc 8px cả 4 góc, không có bóng** (trắng trên trắng dùng viền, không dùng shadow).
- **Cấu trúc:** tiêu đề card (H3 Semi Bold) → cách **12px** (`--card-gap`) → khung bảng. Thanh công cụ, tiêu đề cột, các dòng, dòng tổng và phân trang **đều nằm trong khung viền**. Hàng tiêu đề cột không kẻ viền trên riêng (trùng với viền khung → viền đôi).
- **Vạch trên hàng tiêu đề cột:** khi **có thanh công cụ** phía trên thì hàng tiêu đề cột **giữ vạch trên** (Stroke/Neutral) để ngăn với thanh công cụ như bảng thường; chỉ khi **không có thanh công cụ** thì bỏ vạch này vì đã trùng với viền khung (tránh viền đôi).
- **Dữ liệu ít / nhiều trong card** (đổi ở *Số dòng dữ liệu* trong ví dụ) — khung bảng có chiều cao theo vùng nội dung của card, **phân trang luôn ghim đáy khung**: **ít dòng** → dòng tổng **bám ngay dưới dòng dữ liệu cuối**, khoảng trắng rộng nằm giữa dòng tổng và phân trang (nằm TRONG khung viền) · **nhiều dòng** → dòng tổng **ghim ngay trên phân trang**, vùng dữ liệu cuộn bên trong. ⛔ Không để khung co theo số dòng làm phân trang nổi giữa card.
- **Thanh công cụ ẩn được:** bảng ít dòng / chỉ để xem thì có thể **bỏ thanh công cụ và ô tìm kiếm phía trên bảng** (chọn *Thanh công cụ › Ẩn* ở ví dụ). Khi đó hàng tiêu đề cột là dòng đầu tiên trong khung viền, bo 2 góc trên theo khung; phân trang (nếu có) vẫn nằm đáy khung. Ẩn ô tìm kiếm thì cũng bỏ từ khóa đang lọc, không lọc ngầm.
- **Thi công:** `<section class="card"><h3 class="card__title">…</h3><div class="table-panel table-panel--bordered">toolbar + DataTable + TablePaging</div></section>` — không tự viết `border` / `border-radius`. Bảng trong popup (xem [Popup](/ds/popup)) dùng cùng class `table-panel--bordered`.

### Căn lề cột dữ liệu

Theo mặc định, hầu hết dữ liệu cột được căn trái. Điều này giúp dữ liệu có thể đọc được và so sánh dễ dàng. Một ngoại lệ là dữ liệu số có thay đổi kích thước. Những con số này phải được căn phải để giúp người dùng so sánh giá trị.

**Quy tắc:**
1. Dạng văn bản căn bên trái (vd: Tên)
2. Số không thay đổi số lượng ký tự căn bên trái (vd: Ngày, Số điện thoại, STT...)
3. Số tiền, các số liệu cần so sánh căn bên phải (vd: Số tiền, Đơn giá, Chiết khấu...)

![](/ds/files/73ab2de4bc82796e554f0ee3415160c1b914681a.png)

Với **bảng dữ liệu dạng gộp cột** thì **tiêu đề của bảng luôn căn giữa căn giữa, các cột có đưỡng ngăn cách rõ ràng với nhau**, dữ liệu trong bảng vẫn căn theo quy tắc bên trên.

![](/ds/files/9f3443792432a5d51cb2a73db2deba966e019cc4.png)

### Chi tiết action trên bảng

Khi hover chuột lên dòng thì hiển thị action của dòng. Hiển thị tối đa 3 icon, nếu có nhiều hơn 3 sẽ hiển thị icon more ở cuối để xổ ra các chức năng khác.

![](/ds/files/ab448d7d4bc69d5a14f546817ebcdda2a69fbf69.png)

### Tooltip

Tất cả các tiêu đề viết tắt, các icon khi hover chuột lên đều phải hiện tooltip để người dùng biết được dữ liệu viết tắt là gì, icon đó thực hiện chức năng gì.

![](/ds/files/a5a6cf9ed076881bc4d00a139c6e81e5536d36f3.png)

### Thao tác với hàng loạt bản ghi

- Khi có 1 bảng ghi trên dòng của bảng được check chọn thì show đè phần action hàng loạt vào vùng lọc nhanh và các icon action của bảng ở phía trên. Vẫn giữ lại ô tìm kiếm phía bên trái để có thể tìm kiếm các giá trị từ trang khác để chọn.
- Khi có nhiều hơn 5 chức năng hàng loạt, các chức năng thứ 6 gom vào trong nút 3 chấm ở cuối cùng, không hiển thị thành 2 dòng nút.

![](/ds/files/db0bb6b4fcf61ca918178857ab17aca0842e0ef5.png)

#### Chọn tất cả các bản ghi ở tất cả các trang trên danh sách

Một số chức năng người dùng có nhu cầu chọn toàn bộ các bản ghi ở tất cả các trang để thực hiện một số chức năng nào đó. Ví dụ cập nhật hàng loạt một trường thông tin nào đó...

![](/ds/files/7fbbb7b2982bc595d1b6ed3ca5caf0eca3ca2cbe.png)

Khi đã chọn xong toàn bộ các bản ghi thì hiển thị giao diện bên dưới, người dùng nhìn thấy được đã chọn số bản ghi là bao nhiêu và text thể hiện đang chọn tất cả các bản ghi trên danh sách chứ không phải chỉ các bản ghi ở trang hiện tại.

![](/ds/files/2683bcb8b22035569c5f1ef16f5d956cedf65a5e.png)

#### Thao tác hàng loạt với dạng layout không có tab

Với dạng layout không có các tab bên dưới thì khi chọn thao tác hàng loạt thì các nút action sẽ che lên tiêu đề và các chức năng Thêm, Nhập khẩu...

![](/ds/files/51dc204e820b6129231c9e72a58f285f1c897df4.png)

#### Thao tác hàng loạt với dạng layout có tab chi tiết bên dưới

Với dạng layout có các tab bên dưới thì khi chọn thao tác hàng loạt thì các nút action sẽ che lên thanh toolbar của bảng nơi chứa các nút Thêm, Nhập khẩu...

![](/ds/files/22b860ee469095eeef916eee3b5c066075b4d838.png)

### Bộ lọc

Lọc dữ liệu giúp người dùng tìm thấy những gì họ đang tìm kiếm, có được những thông tin chi tiết khác nhau và so sánh.

**Bộ lọc cơ bản:** Cho phép người dùng áp dụng các tham số thiết lập trước cho tập dữ liệu. Tính năng này rất linh hoạt và phù hợp với hầu hết các bảng dữ liệu.

![](/ds/files/3b1ffc9888c3102d0443c6b86acb407a68f0f9d8.png)

**Tìm kiếm thông minh:** Các danh sách nhiều cột dữ liệu, hoặc dữ liệu phức tạp nên có hỗ trợ tìm kiếm thông minh. Khi tìm kiếm gõ ngôn ngữ tự nhiên hệ thống sẽ dùng AI phân tích từ khóa, tìm kiếm và trả lại kết quả ngay trên danh sách giống thao tác người dùng nhập từ khóa tìm kiếm thông thường.

Cách ô **Tìm kiếm thông minh** hoạt động trên bảng — **hành xử y hệt** control ở [Search box](/ds/search-box) (kết quả hiện ở **popover**, bảng không bị lọc):

- **Gõ câu tự nhiên** (VD “phiếu chưa ghi sổ trên 5 triệu”). Bấm **icon phân tích** trong ô để xem popup **Điều kiện AI bóc tách** (*Trạng thái: “Chưa ghi sổ”, Số tiền: “> 5.000.000”*) — kiểm tra AI hiểu đúng chưa, chưa tìm.
- **Enter:** mở popover **“Kết quả tìm kiếm với AI”** — dòng điều kiện đã bóc tách ở đầu, rồi kết quả **theo nhóm** (cột trái: tên nhóm, ví dụ *Chứng từ*, *Khách hàng* · giữa: các bản ghi tìm thấy · phải: số kết quả); mỗi nhóm hiện tối đa 5 bản ghi, còn nữa có **Xem thêm** — bấm sẽ mở popup kết quả của riêng nhóm đó (cùng popup “Xem thêm” của ô tìm kiếm Global header, popover đóng lại; sửa từ khóa trong popup thì tìm lại trong nhóm). Bấm một bản ghi → mở bản ghi đó và đóng popover.
- **Bảng phía dưới giữ nguyên, không lọc.** Muốn lọc chính bảng thì dùng ô tìm kiếm *Thường* hoặc bộ lọc.
- **✕ trong ô:** xóa chữ, đóng popover và bỏ kết quả.
- Thi công: `<TableHeader search-mode="ai" :ai-parsed="parsed" :ai-results="results" @ai-analyze="analyze" @ai-search="run" @ai-select="open" @ai-more="more" :ai-more-items="moreItems" :ai-more-total="moreTotal" @ai-clear="clear" />` — `analyze(câu)` đặt `parsed = [{ label: 'Trạng thái', value: 'Chưa ghi sổ' }, …]`; `run(câu)` tìm rồi đặt `results = [{ key, title, total, items: [{ id, name, subtitle, meta }] }]` (cùng dữ liệu với `AppAiSearchbox`). Muốn Enter lọc thẳng bảng thay vì popover thì đặt `:ai-results-panel="false"` — không khuyến nghị cho ô thông minh.


![](/ds/files/afba4108d5b9d95aff01ab0e0ba5413305708d0b.png)

#### Lọc dữ liệu trên cột

- Hỗ trợ Filter trên từng cột dữ liệu, khi hover vào cột nào thì mới hiển thị Icon của cột đó. Sau khi áp dụng lọc thì Icon luôn luôn hiển thị màu Brand. Đồng thời áp dụng vào bộ lọc nâng cao bên phải.
- Khi bấm icon lọc xổ ra popover đồng thời tự động focus vào ô nhập giá trị và điều kiện lọc mặc định là “Chứa”. Người dùng chỉ cần gõ giá trị và bấm Enter là áp dụng, tương đương với số thao tác lọc cột ở các loại bảng cũ trước đây nhưng tiết kiệm được 1 dòng.

![](/ds/files/18653e21023438ece3f0f475b23a8510a0fc651f.png)

Khi lọc trên cột đồng thời cũng sẽ áp dụng vào đúng trường đó được tick lọc bên bộ lọc nâng cao bên phải

#### Bộ lọc nâng cao

Một số dự án bảng có rất ít trường thông tin thì vẫn có thể áp dụng bộ lọc dạng đơn giản hơn không cần chứa các biểu thức phức tạp. Tuy nhiên vị trí hiển thị của icon lọc ngoài danh sách vẫn đặt đồng nhất với nhau.

![](/ds/files/31d0675393ba74767223432f1592f8167341a013.png)

Các dự án bảng có rất nhiều trường thông tin và nhu cầu lọc cũng phức tạp thì áp dụng các bộ lọc có chứa các biểu thức như bên dưới.

Bộ lọc nâng cao khi chưa nhập điều kiện lọc thì nút sẽ là Áp dụng.

![](/ds/files/feb61dc39816140c7b1f19926f902c9092d7a600.png)

Bộ lọc nâng cao khi đã có điều kiện và đã áp dụng, áp dụng xong thì nút Áp dụng đổi thành nút Lưu để cho phép lưu lại bộ lọc.

![](/ds/files/5424e0597dad382e959323d89fd12c13c4904cf8.png)

Các bộ lọc hay sử dụng có thể lưu lại và hiển thị ở đây. Khi chọn bộ lọc đã lưu thì điền sẵn giá trị lọc vào các trường tương ứng.

Khi bấm nút Lưu thì sẽ bật lên popup cho phép điền tên bộ lọc và lưu lại.

![](/ds/files/63f20e7d7b74dc448aebb16af9fe814805d871b5.png)

Sau khi lưu sẽ hiển thị danh sách bộ lọc đã lưu ở ngay dưới tiêu đề Bộ lọc.

![](/ds/files/6bbcbca7f2a89e71aaa94bf049df0b2311a1a886.png)

Khi chọn 1 bộ lọc đã lưu từ trước đó, sau đó sửa các điều kiện lọc của bộ lọc đó thì nút Lưu sẽ có 2 lựa chọn. Bấm vào lưu thì sẽ cập nhật vào chính bộ lọc hiện tại. Xổ ra bấm Lưu thành bộ lọc mới thì sẽ bật lên Popup đặt tên bộ lọc mới và lưu lại.

![](/ds/files/4a2ff3c540fbc307d7b6631e44f26cedd2233aec.png)

### Các chức năng trên tiêu đề cột: Sắp xếp, ghim cột, Resize, filter...

- Bấm vào tiêu đề cột sẽ show Dropdown Menu các chức năng: Không/Tăng dần/Giảm dần, Ghim cột/Bỏ ghim cột, Đặt làm cột đầu tiên, Thêm cột bên trái/Thêm cột bên phải, Ẩn cột, Hiển thị nhiều dòng/Hiển thị 1 dòng.
- Cột nào được ghim thì hiển thị Icon Pin ở đầu tiêu đề.
- Hỗ trợ Filter trên từng cột dữ liệu, khi hover vào cột nào thì mới hiển thị Icon của cột đó. Sau khi áp dụng lọc thì Icon luôn luôn hiển thị màu Brand. Đồng thời áp dụng vào Filter Advance bên phải/trái.
- Cho phép tùy chỉnh độ rộng từng cột khi di chuột vào phân cách giữa 2 cột

![](/ds/files/c29a0d5100efcfa5ad284f2f22196b8a89e89f99.png)

Một số tính năng nâng cao như: Thêm cột bên trái, thêm cột bên phải...thì tùy nhu cầu của từng dự án, nếu có thì làm theo quy chuẩn, nếu không có thì bỏ qua.

### Paging

Có 2 cách phân trang:

#### 1. Cuộn đến đâu tải đến đó (Infinite Scroll)

Dùng cho giao diện không phải bảng dữ liệu, người dùng không cần xem chính xác một trang mà cuộn để khám phá dần. Ví dụ: mạng xã hội, danh sách bài viết, lịch sử chat.

#### 2. Bấm chuyển qua lại giữa các trang

Dùng cho bảng dữ liệu. Có 2 dạng:

**a. Dạng ngắn gọn** (mặc định): Tổng số · Số dòng/trang · khoảng bản ghi đang xem (VD 1 - 10) · nút Trang đầu / Trang trước / Trang sau / Trang cuối. Dùng cho các ứng dụng có nhu cầu thông thường.

![](/ds/files/599016e36514530350fd60f2b0c431d498cc5280.png)

**b. Dạng số** (nâng cao): thay khoảng bản ghi bằng dãy số trang, bấm số để tới thẳng trang đó. Dùng cho ứng dụng phức tạp như Kế toán — người dùng cần xuất khẩu hoặc xử lý lần lượt từng trang dữ liệu, hết trang này tới trang khác.

![](/ds/files/72b980277b89e4e37675f163fe6dcca2c05d8b5b.png)

Quy tắc dãy số trang:
- Luôn hiện trang đầu và trang cuối; ở giữa là 3 trang bắt đầu từ trang đang xem. VD 20 trang: đang ở trang 1 → `1 2 3 … 20` · trang 5 → `1 … 5 6 7 … 20` · trang 20 → `1 … 18 19 20`.
- Khoảng trống từ 2 trang trở lên hiện “…”; trống đúng 1 trang thì hiện luôn số trang đó.
- Trang đang xem: chữ màu Brand, đậm, gạch chân. Ô số cao bằng control chuẩn, rê chuột nền Neutral Light như Button Icon.

Thi công bằng mds-ui: `<TablePaging type="advance" />` hoặc DataTable `pagination paging-type="advance"` (mặc định `basic` là dạng ngắn gọn). Xem chạy thật ở bảng mẫu đầu trang, chọn **Phân trang: Dạng số**.

#### Dòng tổng và phân trang

**Khi dòng dữ liệu ít:**<br>Hiển thị dòng tổng bám theo dòng dữ liệu để tiện xem cộng số liệu Tổng số so với các bản ghi cho dễ xem, phân trang luôn nằm dưới cuối cùng giãn theo chiều cao màn hình, dữ liệu ít thì khoảng trắng từ dòng tới phân trang sẽ rộng.

![](/ds/files/cb4b4297ff9a4d0545fd6ad38513a6e0b0dc5370.png)

**Khi dòng dữ liệu nhiều:**<br>Hiển thị dòng tổng dock lại ghim phía trên của phân trang, để người dùng dễ dàng theo dõi được tổng cộng, chỉ cuộn trong vùng dữ liệu để xem các bản ghi khác đang bị che.

![](/ds/files/8d898f06f6fb8a932e3b0f4a9a2d0a5a680f1e01.png)

### Chỉnh sửa trong bảng

#### Sửa tất cả dữ liệu trên bảng

- Người dùng có thể chỉnh sửa tất cả dữ liệu trên bảng (ngoài trừ những trường không được phép sửa).
- Không mở sẵn toàn bộ các cell ở chế độ edit luôn để không bị rối mắt. Khi hover chuột lên từng dòng nếu sửa được thì các cell sẽ sáng viền các control lên để người dùng bấm vào nhập thông tin.
- Nút lưu sẽ là lưu của cả form

![](/ds/files/2d6bf86dac0816598b375042bd0298d4d8ed7076.png)

#### Sửa dữ liệu của từng dòng và lưu luôn

- Trường hợp việc chỉnh sửa dữ liệu không phải tác vụ chính, bạn chỉ cần cho phép chỉnh sửa tất cả dữ liệu trên từng dòng (ngoài trừ những trường không được phép sửa).
- Nút lưu là lưu của từng dòng

![](/ds/files/8b6be9f3e6b2eec913bdd4141d77180a82422560.png)

#### Sửa dữ liệu của từng cell

- Việc chỉnh sửa dữ liệu trên từng cell sẽ mất nhiều thao tác nhưng tránh gây nhầm lẫn cho người dùng. Phù hợp trong trường hợp chỉ chỉnh sửa 1 vài cell trên 1 dòng.
- Hover vào từng cell sẽ có icon sửa ở cuối mỗi cell để bấm vào chỉnh sửa

![](/ds/files/1e0440c9884d1fcfb52abb759d590066dd3fae83.png)

Khi bấm sửa của cell sẽ cho phép nhập sửa giá trị của cell, sau đó lưu dữ liệu ngay tại cell đó.

![](/ds/files/1f2902fcfb85ada139c8918259177624db7acdd5.png)

#### Thông báo lỗi và ngoại lệ khác

- Thông báo lỗi trên ô nhập liệu tương tự style của ô input ở các form nhập liệu
- Trường hợp ô nhập liệu chữ quá dài thì khi focus vào ô nhập liệu hiển thị ô nhập liệu tràn ra khỏi cell để tiện nhìn được các thông tin nhập liệu.

![](/ds/files/ad5ada4ac03361c7567ad095befd8d3dc8076372.png)

Trạng thái hover vào dòng cho phép chỉnh sửa

![](/ds/files/a2c19fbc44bfaf63267ae2fa40f5d3e8aec91347.png)

Trạng thái khi lỗi và khi focus vào ô nhập liệu có thông tin quá dài.

![](/ds/files/572e863db8a6fe32d80ee3f9636bb3f04451d0e0.png)

Khi ở trạng thái xem bình thường chữ dài sẽ hiển thị...

### Thiết lập bảng

Cho phép người dùng cột dữ liệu nào được hiển thị trên bảng của họ. Người dùng có thể kéo thả để sắp xếp thứ tự của các cột hiển thị hoặc có thể chọn Lấy lại mặc định của chương trình mang đi sẵn.

Có 2 loại thiết lập bảng Tiêu chuẩn và Nâng cao

#### Thiết lập bảng tiêu chuẩn

Hầu hết các bảng dữ liệu bình thường thì dùng dạng tiêu chuẩn. Hiển thị thanh dạng Drawer full chiều cao màn hình để tận dụng tối đa diện tích, có thể nhìn được nhiều dòng nhất có thể, dễ dàng thiết lập.

![](/ds/files/ecb88cef7d80a9e11eb40af72256238cf198b72c.png)

**Cột bắt buộc hiển thị:** bảng nên có ít nhất 1 cột mặc định luôn phải thấy (thường là cột định danh / cột mở chi tiết, VD Số chứng từ, Mã nhân viên, Họ tên). Với cột này, ô tick ở Thiết lập bảng **tick sẵn nhưng bị khóa** (mờ, rê chuột có tooltip “Cột mặc định bắt buộc hiển thị, không thể ẩn”) — người dùng không bỏ tick được; “tick tất cả” cũng bỏ qua cột này, và menu ⋮ ở tiêu đề cột **không có mục “Ẩn cột”**. Cột bắt buộc vẫn kéo đổi thứ tự, đổi tên hiển thị, đổi độ rộng, ghim được. Thi công: khai báo `locked: true` trên cột. Xem thử ở ví dụ đầu trang: cột **Số chứng từ**.

#### Thiết lập bảng nâng cao

Dành cho các bảng dữ liệu phức tạp như: Bảng lương...

![](/ds/files/0f5770558653d97d290746e42579b959013da4a9.png)

**Thiết lập dòng:** Cho phép cấu hình hiển thị của dòng, có gom thành nhóm hay không, gom thành 1 hay 2 cấp hiển thị dạng cây trên danh sách.

**Thiết lập cột:** Cho phép cấu hình hiển thị của cột giống như thiết lập ở chế độ tiêu chuẩn, một số bảng có gom nhóm các cột với nhau thì có thể có thêm chức năng Gộp cột để cấu hình nâng cao hơn.

### Scroll trong bảng

Khi cuộn chuột cho cuộn cả page cho đến khi header của bảng chạm vào header bar thì ghim lại header của bảng chỉ scroll trong vùng nội dung của bảng để tối ưu không gian hiển thị. Hiển thị được nhiều nhất các dòng thông tin.

![](/ds/files/f22a151e97c29170322f09488a7ecfaefec58adf.png)

![](/ds/files/3df6e16dc9c7426a2623366d7694e310f3107459.png)

Khi bắt đầu cuộn là cuộn cả page

![](/ds/files/1c2b4000a3996e64516a4188db78e615a6d13ae9.png)

Khi cuộn header của bảng chạm vào header trên cùng thì ghim header của bảng lại chỉ cuộn phần nội dung còn lại trong bảng để hiển thị được nhiều dòng nhất có thể
