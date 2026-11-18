<!-- SINH TỰ ĐỘNG từ mds-docs /ds/background-tasks (2026-11-18) — không sửa tay -->
# Xử lý tiến trình

> Thao tác mất hơn 10 giây (nhập / xuất khẩu nhiều bản ghi, cập nhật hàng loạt…) chạy ngầm trên máy chủ; khay tiến trình góc dưới phải cho biết tiến độ, báo khi xong và cho tải file / xem kết quả.

## Ví dụ trực quan

Màn hình mẫu chạy thật bằng component **AppTaskTray** của mds-ui: bấm **Xuất khẩu** / **Nhập khẩu** để tạo tiến trình, thử thu gọn, đóng, hủy, tải file.

> Ví dụ chạy thật: `mds-docs/src/demos/BackgroundTasksDemo.vue`
## Khi nào dùng

Dùng khi một thao tác do người dùng chủ động bấm cần **hơn 10 giây** hoặc **không đoán trước được thời gian**, và kết quả không cần xem ngay để làm bước tiếp theo:

- Nhập khẩu / xuất khẩu nhiều bản ghi (VD > 1.000 dòng).
- Cập nhật, xóa, gửi email… hàng loạt.
- Tổng hợp báo cáo lớn, tính lương, đồng bộ dữ liệu.

| Thời gian chờ dự kiến | Cách báo | Người dùng |
|---|---|---|
| < 1 giây | Không cần báo | — |
| 1 – 4 giây | Spinner trên nút / control ([Loading](/ds/loading)) | Chờ tại chỗ |
| 4 – 10 giây | Thanh tiến độ trong popup / dialog đang mở | Chờ tại chỗ, có nút Hủy |
| > 10 giây hoặc không rõ | **Chạy ngầm + Khay tiến trình** | Làm việc khác, hệ thống báo khi xong |

::: note
Chưa biết trước số bản ghi thì cứ chạy ngầm: nếu xong trong vòng 3 giây, bỏ qua khay và trả kết quả ngay như thao tác thường (không làm khay nháy lên rồi tắt).
:::

## Luồng xử lý

1. **Bắt đầu:** người dùng xác nhận (chọn file nhập, chọn cột xuất…) → popup đóng ngay, hiện toast *“Đã bắt đầu xuất khẩu. Bạn có thể tiếp tục làm việc — hệ thống sẽ báo khi xong.”* và **khay tiến trình** mở ở góc dưới phải.
2. **Đang chạy:** người dùng làm việc khác bình thường, chuyển trang, tải lại trang (F5) hay đăng nhập máy khác vẫn thấy tiến trình — trạng thái lưu trên máy chủ, **không** gắn với tab đang mở.
3. **Hoàn thành:** dòng đổi trạng thái + nút kết quả (**Tải xuống** / **Xem** / **Tải file lỗi** / **Thử lại**).
   - Khay đang mở → chỉ đổi dòng, không bật thêm toast.
   - Khay đang thu gọn / đã đóng → **toast có nút** (VD *“Xuất khẩu danh sách nhân viên: đã xong”* · **Tải xuống**) + một mục trong **Thông báo** (chuông) để xem lại.
4. **Dọn khay:** dòng đã xong giữ trong khay đến khi người dùng bấm ✕ hoặc đóng khay. Muốn xem lại / tải lại sau đó thì vào **Thông báo** (chuông) — mỗi tiến trình xong là 1 thông báo có nút kết quả. Không cần màn *Lịch sử tiến trình* riêng; chỉ thêm khi nghiệp vụ cần tra cứu / tải lại file xuất trong thời gian dài.

## Thành phần khay tiến trình

| Phần | Quy chuẩn |
|---|---|
| Vị trí | Neo **góc dưới phải**, cách phải 24, sát đáy · rộng 400 (màn nhỏ: rộng màn hình − 32) · nổi trên nội dung (bóng All 12, bo trên 12) · không che nút Lưu / Hủy ghim đáy form — khay thu gọn khi mở form toàn trang |
| Header (48) | Nền **Brand**, tiêu đề H3 trắng: **“N tiến trình đang xử lý”** · khi xong hết: **“Đã xong N tiến trình”** (có lỗi: “· 1 lỗi”) · nút **⌄ Thu gọn / ⌃ Mở rộng** · **✕ Đóng** |
| Thu gọn | Chỉ còn header + **thanh tiến độ chung** 3px dưới header; bấm vào header để mở rộng |
| Danh sách | Mỗi dòng: icon trạng thái 20 (outline) · **tên tiến trình Body Semi Bold** (1 dòng, cắt “…”, rê chuột xem đủ) · **dòng phụ** Body Small Text/Secondary · các dòng **không có vạch ngăn** (phân cấp bằng độ đậm, tách dòng bằng đệm 8) · **nút icon** kết quả (có tooltip) · ✕ — icon ✕ thẳng mép 16 như header · tối đa **5 dòng** rồi cuộn |
| Bấm vào dòng | Dòng **Thành công / Xong một phần** bấm được (cả dòng) = nút chính: Tải xuống · Xem · Tải file lỗi — hover nền Brand Light, thụt 8 không chạm mép khay, Enter / Space khi focus. Dòng **Đang chạy / Đang chờ / Đã hủy / Lỗi**: không hover, không bấm (Thử lại phải bấm đúng nút ↻ để tránh chạy lại do lỡ tay) |
| Thứ tự | Đang chạy → đang chờ → lỗi → xong một phần → thành công → đã hủy; cùng nhóm thì theo thời gian bắt đầu |
| Icon trên header app | Icon **Tiến trình** (`loader-2` — vòng cung, đứng yên) — xem quy tắc hiện / ẩn ngay bên dưới |

### Tên tiến trình

Viết theo mẫu **Động từ + đối tượng + phạm vi**: *“Xuất khẩu dữ liệu tính lương tháng 10/2026”*, *“Nhập khẩu danh sách nhân viên mới”*. Không viết “Tiến trình 1”, “Đang xử lý…”.


## Icon Tiến trình trên Global Header

Icon **Tiến trình** (`loader-2` — vòng cung, đứng yên) là đường vào khay khi khay đang ẩn / thu gọn. Nó **không cố định** trên header — chỉ xuất hiện khi có việc cần theo dõi.

| Tình huống | Icon | Badge | Tooltip |
|---|---|---|---|
| Chưa từng chạy tiến trình / khay trống | **Ẩn** | — | — |
| Có ≥ 1 tiến trình **đang chạy / đang chờ** | Hiện | **Số tiến trình đang chạy + chờ** — badge đỏ chuẩn của header (giống Thông báo), đồng nhất mọi icon trên header | “2 tiến trình đang xử lý” |
| Hết đang chạy, còn kết quả **Lỗi / Xong một phần chưa xem** | Hiện | **Chấm đỏ** 8px, không số | “Tiến trình · có kết quả lỗi chưa xem” |
| Hết đang chạy, chỉ còn kết quả **Thành công / Đã hủy** trong khay | Hiện | Không badge | “Tiến trình” |
| Người dùng ẩn hết dòng, hoặc đóng khay khi không còn tiến trình chạy | **Ẩn** (kết quả vẫn ở Thông báo) | — | — |

- **Vị trí:** đầu cụm icon bên phải header, **trước MISA AI** (slot `#header-actions` của ControlHeader) — không chen giữa Thông báo / Trợ giúp / Cài đặt.
- **Xuất hiện:** ngay khi tiến trình đầu tiên bắt đầu (cùng lúc toast “Đã bắt đầu…”), kể cả khi khay đang mở.
- **Bấm:** khay đang ẩn hoặc thu gọn → mở và mở rộng khay · khay đang mở rộng → ẩn khay (tiến trình vẫn chạy). Khi khay đang mở rộng, nút ở trạng thái **đang mở** (nền như hover).
- **“Đã xem”:** kết quả coi là đã xem khi khay đang mở rộng lúc tiến trình xong, hoặc người dùng mở rộng khay sau đó → tắt chấm đỏ. Dòng vẫn nằm trong khay đến khi bấm ✕.
- **Tải lại trang / đăng nhập lại:** icon hiện lại nếu còn tiến trình đang chạy hoặc kết quả chưa xem trong **24 giờ**; khay khôi phục ở trạng thái thu gọn (không tự bung che màn hình).
- Icon `loader-2` **đứng yên**, không xoay / nhấp nháy trên header — chỉ badge số; chuyển động đã có ở spinner trong khay.

## Trạng thái của một dòng

| Trạng thái | Icon | Dòng phụ | Nút | ✕ trên dòng |
|---|---|---|---|---|
| **Đang chờ** (xếp hàng) | Đồng hồ, Icon/Neutral | Thanh tiến độ rỗng · “Đang chờ đến lượt” | — | Hủy (không cần xác nhận) |
| **Đang chạy – chưa rõ %** | Spinner nhỏ Brand | Thanh chạy qua lại · “Đang chuẩn bị…” | — | Hủy (xác nhận) |
| **Đang chạy** | Spinner nhỏ Brand | Thanh tiến độ · “5.400/12.000 bản ghi · còn khoảng 2 phút” | — | Hủy (xác nhận) |
| **Thành công** | ✔ tròn (outline), Icon/Success | “1.250 bản ghi · Xong lúc 14:32” | Xuất khẩu: ⤓ **Tải xuống** · Nhập / cập nhật: 👁 **Xem** | Ẩn khỏi khay |
| **Xong một phần** | ⚠ tam giác (outline), Icon/Warning | Chữ Warning: “950/1.000 bản ghi thành công · 50 dòng lỗi” | 📄 **Tải file lỗi** | Ẩn khỏi khay |
| **Lỗi** | ! tròn (outline), Icon/Danger | Chữ Danger, **nêu nguyên nhân + hậu quả**: “File không đúng mẫu: thiếu cột Mã nhân viên” / “Mất kết nối máy chủ — chưa có bản ghi nào được thay đổi” | ↻ **Thử lại** (lỗi tạm thời) hoặc **Xem lỗi** | Ẩn khỏi khay |
| **Đã hủy** | ⓧ, Icon/Neutral, tên màu Secondary | “Đã hủy lúc 14:05 · đã nhập 320 bản ghi” | — | Ẩn khỏi khay |

## Các trường hợp xử lý

::: do
**Hủy tiến trình đang chạy:** bấm ✕ trên dòng → Alert Dialog loại Danger *“Hủy tiến trình?”* nêu rõ hậu quả (*“Các bản ghi đã nhập vẫn được giữ, phần còn lại không được nhập.”* / *“File chưa được tạo.”*) · nút **Hủy tiến trình** (đỏ) + **Tiếp tục chạy**.
:::

::: dont
Hủy ngay không hỏi, hoặc hỏi chung chung “Bạn có chắc chắn?” mà không nói dữ liệu đã xử lý sẽ ra sao.
:::

- **Đóng khay khi còn tiến trình đang chạy:** không hỏi lại — khay ẩn, tiến trình vẫn chạy; toast *“Tiến trình vẫn chạy ngầm — mở lại ở icon Tiến trình trên header”*. Khi xong vẫn báo bằng toast + Thông báo.
- **Đóng khay khi đã xong hết:** dọn sạch khay; kết quả vẫn ở Lịch sử tiến trình.
- **Chạy trùng:** bấm lại cùng một thao tác trên cùng dữ liệu khi lần trước chưa xong → không tạo tiến trình mới, toast cảnh báo *“Tiến trình này đang chạy — đợi xong rồi thực hiện lại”* và mở khay.
- **Giới hạn đồng thời:** mỗi người dùng chạy tối đa **3** tiến trình cùng lúc; tiến trình thứ 4 trở đi ở trạng thái **Đang chờ** và tự chạy khi có chỗ.
- **Nhập khẩu có dòng lỗi:** không dừng cả tiến trình — nhập các dòng hợp lệ, cuối cùng ở trạng thái **Xong một phần**; **Tải file lỗi** trả lại đúng file người dùng đã nhập, chỉ gồm các dòng lỗi + cột *“Lý do lỗi”*, sửa xong nhập lại được ngay.
- **Lỗi toàn bộ:** nêu nguyên nhân bằng ngôn ngữ người dùng, nói rõ dữ liệu đã thay đổi hay chưa; lỗi tạm thời (mất mạng, máy chủ bận) có **Thử lại**, lỗi do dữ liệu (sai mẫu) thì có **Xem lỗi** / hướng dẫn tải mẫu.
- **Nút kết quả là nút icon** (Tải xuống ⤓ · Xem 👁 · Tải file lỗi · Thử lại ↻) có tooltip + `aria-label` — khay hẹp, không dùng link chữ.
- **File xuất khẩu:** link **Tải xuống** còn hiệu lực **7 ngày**; quá hạn thì nút đổi thành **Xuất lại**.
- **Tải lại trang / đăng nhập lại:** khay khôi phục các tiến trình đang chạy và các tiến trình xong trong phiên mà người dùng chưa xem.
- **Rời khỏi app khi đang chạy:** không cần cảnh báo thoát trang — tiến trình chạy trên máy chủ.

## Khả năng truy cập

- Danh sách khay là vùng `aria-live="polite"`: trình đọc màn hình đọc khi một tiến trình đổi trạng thái.
- Thanh tiến độ có `role="progressbar"` + `aria-valuenow`; icon trạng thái có nhãn (*Đang xử lý*, *Hoàn thành*, *Lỗi*…), không chỉ dựa vào màu.
- Mọi nút icon (✕, ⌄, Tải xuống, Xem, Thử lại…) có tooltip + `aria-label` (*Hủy tiến trình*, *Ẩn khỏi danh sách*, *Thu gọn*…).

## Dành cho lập trình

```vue
<AppTaskTray v-if="trayOpen" v-model:collapsed="collapsed" :tasks="tasks"
  @close="trayOpen = false" @action="(task, id) => …" @cancel="task => confirmCancel(task)"
  @dismiss="task => remove(task)" />
```

Mỗi `task`: `{ id, kind: 'export' | 'import' | 'other', title, status: 'queued' | 'running' | 'success' | 'partial' | 'error' | 'canceled', done, total, progress?, eta?, result?, errors?, finishedAt?, actions? }`. Nút icon mặc định theo trạng thái: thành công → *Tải xuống* `download` (export) / *Xem* `eye`; xong một phần → *Tải file lỗi* `file-alert`; lỗi → *Thử lại* `refresh`. `history-label` (tuỳ chọn) thêm link chân khay khi app có màn lịch sử riêng. Trạng thái lấy từ máy chủ (polling 2–5 giây hoặc WebSocket), không tính ở trình duyệt.
