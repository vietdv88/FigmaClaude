<!-- SINH TỰ ĐỘNG từ mds-docs /ds/popup (2026-11-18) — không sửa tay -->
# Popup

> Popup là cửa sổ nổi bật giữa màn hình, có lớp phủ (overlay), chỉ cho phép người dùng nhập dữ liệu vào popup, phải lưu hoặc đóng thì mới tiếp tục được các thao tác khác trên nền. Link component **[tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-187363&m=dev&t=7zSC9MQHTAYcvrUY-1)**.

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — bấm **Thêm khách hàng** để mở popup thật, thử bấm **Lưu** khi chưa nhập để xem báo lỗi; bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/PopupDemo.vue`
## Sử dụng

### Dạng popup giới hạn kích thước

Popup này thường hiển thị giới hạn kích thước chiều rộng và cao theo các trường dữ liệu bên trong nó.

#### Tỉ lệ hiển thị

- Tỉ lệ tối ưu thông thường của Popup nên tuân theo tỉ lệ 4:3 hoặc 6:4 để mắt nhìn dễ chịu nhất.
- Nếu popup dài vượt quá 80% chiều cao màn hình: Nên giới hạn chiều cao, nội dung bên trong cuộn.

Popup dạng thông tin đơn giản 1 cột

![](/ds/files/7d79702ca0a18909bf93ec41eac5511de0795827.png)

Popup dạng thông tin có nhiều cột

![](/ds/files/96d243bdf6c7abbfa362a7dd11b57790300d15eb.png)

Popup label trên dưới

![](/ds/files/bce2ca8e7fcdc6acce3c6a9feaa180d1fb770755.png)

Popup label trên dưới dạng nhiều cột

### Dạng popup full màn hình

- Một số các form nhập liệu cần nhập cùng lúc nhiều thông tin, do vậy cần hiển thị full màn hình để tối ưu diện tích.
- Để đồng nhất quy tắc UX nhập liệu từ trên xuống dưới sau đó mới bấm Lưu thì thứ tự hiển thị các thông tin tương tự với pop loại nhỏ phía trên: Header → Các thông tin cần nhập → Footer chứa các nút Hủy, Lưu...nằm ghim ở cuối cùng.

![](/ds/files/1595fbfe4c9cbba6244bb5a765044e55352c4a08.png)

Chiều cao của popup responsive theo chiều cao của màn hình, nội dung dài thì có thanh cuộn bên phải. Luôn ghim Header và Footer của popup.

![](/ds/files/1006f044aee552bee38d295600acad5f66a1a7a3.png)

Popup xem chi tiết 1 bản ghi

![](/ds/files/c8f248b051fbbcf3f5fee1b3b2baede144fdd822.png)

### Popup chứa danh sách (bảng)

Popup chọn dữ liệu từ danh sách (Chọn nhân viên, Chọn hàng hóa, Danh sách đã chọn…):

Ví dụ chạy thật — đổi **Dữ liệu** (1 dòng / 25 dòng / Không có dữ liệu): thanh phân trang luôn đứng yên ở đáy khung bảng; chọn **Sai — bảng co theo dòng** để thấy lỗi hay gặp.

> Ví dụ chạy thật: `mds-docs/src/demos/PopupListDemo.vue`
- **Khung bảng lấp đầy chiều cao còn lại** của popup (sau tiêu đề, thanh tìm kiếm / lọc), kéo tới sát footer nút Hủy / Đồng ý.
- **Thanh phân trang (Tổng số · Số dòng/trang · chuyển trang) luôn ghim ở ĐÁY khung bảng**, ngay trên footer — vị trí cố định dù có 1 dòng hay 100 dòng.
- **Ít dòng** → phần trống nằm TRONG khung bảng (giữa dòng cuối và thanh phân trang, nền trắng). **Nhiều dòng** → vùng dòng tự cuộn bên trong, tiêu đề cột và phân trang đứng yên.
- **Không có dữ liệu** → màn trống (Empty state) ở giữa khung bảng, khung vẫn giữ nguyên chiều cao.
- Chiều cao popup **cố định theo cỡ popup**, không co giãn theo số dòng → lọc / chuyển trang / bỏ chọn popup không nhảy kích thước.
- ⛔ **Không vẽ** khung bảng co theo số dòng làm thanh phân trang “nổi” lơ lửng giữa popup, bên dưới là khoảng trắng lớn tới footer (popup trông cụt, trống, mắt phải dò tìm phân trang ở vị trí khác nhau mỗi lần).
- Thi công (mds-ui): thân popup `display: flex; flex-direction: column`, khung bảng `.table-panel.table-panel--fill` (giãn hết phần còn lại; `.table-scroll` cuộn trong, phân trang ở đáy).

| Nên | Không nên |
|---|---|
| Khung bảng kéo tới sát footer, phân trang ghim đáy khung bảng; ít dòng thì khoảng trống nằm trong bảng | Khung bảng co theo số dòng, phân trang nổi ngay dưới dòng dữ liệu, bên dưới là khoảng trắng tới footer |

### Các form không sử dụng nút ở trạng thái Disable

Tránh dùng nút Submit dạng disable vì gây mơ hồ; **hãy luôn để nút enable**, khi bấm nếu còn lỗi thì focus vào ô lỗi đầu tiên và hiển thị tooltip thông báo lỗi để người dùng biết cách nhập đúng.

![](/ds/files/35035318083426748d66d16c2178499929684e74.png)

**Trạng thái đang xử lý:** Khi hệ thống đang xử lý việc cập nhật dữ liệu thì disable nút và hiển thị kèm icon loading để tránh lỗi lưu trùng dữ liệu.

![](/ds/files/cea8a8b9246ffe0d16dce167e17a68859bfa9349.png)

#### Khi bấm sửa nhưng chưa nhập thay đổi gì thì nút Lưu hành xử thế nào?

Vẫn hành xử như khi có thay đổi và bấm Lưu, tuy nhiên DEV có thể kiểm tra thay đổi và xử lý không gọi cập nhật dữ liệu để tối ưu hệ thống.
