<!-- SINH TỰ ĐỘNG từ mds-docs /ds/empty-state (2026-11-18) — không sửa tay -->
# Empty state

> Quy định các tiêu chuẩn cụ thể cho việc thiết kế “Empty State” (Trạng thái trống dữ liệu), bao gồm hình ảnh minh họa (illustration), văn bản và CTA. Chi tiết các thành phần: **[Tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=21045-1398&m=dev&t=0qzrTP2Z7AgaiPxZ-1)**

## Ví dụ trực quan

Đổi giữa 2 trạng thái: **chưa từng có dữ liệu** (có nút Thêm / Nhập khẩu) và **không có kết quả** (sau khi xóa hết hoặc lọc không ra). Bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/EmptyStateDemo.vue`
## Mô tả chung

Sử dụng illustration (hình minh họa, ví dụ plane, fog shape, icon…) kèm title, subtitle và button nếu phù hợp. Hiển thị khi khởi đầu section, chưa từng có bản ghi nào, nhằm mục đích gây thú vị cho người dùng.

### Hình hoạ và Quy định màu sắc

- **Độ dày:** Sử dụng phong cách line art với độ dày nét cố định là **2px** cho tất cả các thành phần chính.
- **Kết hợp:** Kết hợp hài hòa giữa đường nét và các mảng màu đặc để tạo điểm nhấn và chiều sâu.

#### Các yếu tố cấu thành hình hoạ

| Tên yếu tố | Mô tả & Sử Dụng | Màu sắc sử dụng | Hình mô tả |
|---|---|---|---|
| Fog Shape | Mảng sương, sử dụng làm lớp dưới cùng, để tất cả các hình hoạ bên trên. | Neutral/200 | ![](/ds/files/1f3ceaee18c60551a8e3f5847911ea20d92cb119.png) |
| Icon chính | Icon đại diện cho nội dung sẽ xuất hiện trên màn hình khi có dữ liệu (ví dụ: icon tờ giấy cho chứng từ, icon người cho thông tin khách hàng)<br><br>**Luôn là thành phần lớn nhất và nổi bật nhất, thu hút sự chú ý của người dùng đầu tiên** | Neutral/800 | ![](/ds/files/cd080b0c481359be6909a1b51aee68a86658bb7e.png) |
| Ground line | Đường cơ sở, đặt ở bên dưới tạo không gian cho illustration. | Neutral/800 | ![](/ds/files/shot-empty-state-1074-1021.png) |
| Icon phụ | Icon phụ thể hiện các hành động hoặc trạng thái của dữ liệu. | Icon/Brand | ![](/ds/files/shot-empty-state-1073-639.png) |
| Cloud Shape | Line art vẽ mây, dùng làm yếu tố phụ phía sau. | Neutral/400 | ![](/ds/files/shot-empty-state-1074-1111.png) |
| Pattern | Pattern ngôi sao, sử dụng trang trí xung quanh yếu tố chính. | Neutral/400 <br>Neutral/800 <br>Icon/Brand | ![](/ds/files/8a316978e8b7e553a76652b18163a45c8d346f25.png) |
| Plane | Hình hoạ máy bay, sử dụng trang trí xung quanh yếu tố chính. Bao gồm hình máy bay và đường bay đằng sau. | Icon/Brand<br>Neutral/800 | ![](/ds/files/shot-empty-state-1074-691.png) |
| Flight path | Hình hoạ đường bay, sử dụng trang trí xung quanh yếu tố máy bay. | Neutral/400 | ![](/ds/files/shot-empty-state-1074-1019.png) |

### Bố cục

Thành phần Empty State là một khối (component) hoàn chỉnh bao gồm Illustration, Title, Subtitle và Button, được sắp xếp theo một trật tự và quy tắc sau

1. **Phần hình hoạ:** hình hoạ miêu tả nội dung của dữ liệu sẽ có trong section này.
2. **Title & Subtitle:**  Cung cấp thông điệp về trạng thái hiện tại của màn hình và hướng dẫn người dùng.
3. **Button:** Đưa ra lời kêu gọi hành động (Call to Action), giúp người dùng biết cần làm gì tiếp theo để tạo ra dữ liệu.

### Kích thước và căn chỉnh

#### Layout chung

**- Sử dụng Auto Layout loại Top Alignment.
- Padding trên (Top Padding): Khoảng cách từ đỉnh của component đến đỉnh của frame illustration là 120px.**

#### Khoảng cách giữa các thành phần

- Khoảng cách giữa **Illustration và Title là 16px.**
- Khoảng cách giữa Title và Subtitle: 2px

| Yếu tố | Thông số |
|---|---|
| Illustration và Title | 16px |
| Title và Subtitle | 4px |
| Subtitle và Button | 24px |

## Trạng thái

### Initial State - Chưa từng phát sinh dữ liệu

- Đây là trạng thái khi một tính năng hoặc module chưa từng có bất kỳ dữ liệu nào được tạo, tức là người dùng chưa thực hiện thêm, ghi nhận, hay phát sinh bản ghi nào từ trước đến nay. Khi đã 1 lần được thêm dữ liệu thì sẽ không còn trạng thái này nữa mà chuyển xuống trạng thái bên dưới.
- Khi ở trạng thái này chỉ hiển thị màn hình trống có các chức năng: Thêm mới, nhập khẩu...Không chứa bất kỳ chức năng nào liên quan tới bản ghi như: Tìm kiếm, lọc, giao diện Data table...

![](/ds/files/8275f840ae6b1007a8bf7ad7b55331491fde807f.png)

![](/ds/files/f3b36fb47f4be8d5ca963bceae4deb27dd8baf9a.png)

### No Data State - Đã từng có dữ liệu nhưng bị xóa hoặc do lọc không có kết quả

- Đây là trạng thái khi hệ thống hoặc bảng dữ liệu đã từng có bản ghi, nhưng hiện tại không hiển thị dữ liệu vì đã xóa hết hoặc lọc không ra kết quả phù hợp.
- Khi ở trạng thái này luôn hiển thị 1 hình minh họa đơn giản báo không tìm thấy dữ liệu, áp dụng cho cả trường hợp đã xóa không còn bản ghi nào hoặc tìm kiếm hay lọc không có kết quả nào.

![](/ds/files/5a61af9672ffbaa1a8aaa68d84125d0aa586d009.png)
