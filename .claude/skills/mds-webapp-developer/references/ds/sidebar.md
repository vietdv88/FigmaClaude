<!-- SINH TỰ ĐỘNG từ mds-docs /ds/sidebar (2026-11-18) — không sửa tay -->
# Side bar

> Sidebar là thanh điều hướng nằm bên trái (hoặc phải) giao diện website/app, thường chứa menu, danh mục, liên kết nhanh hoặc các tính năng phụ trợ giúp người dùng truy cập các phần chính của hệ thống dễ dàng hơn. Link components: **[Tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-197570&m=dev&t=JKrX0swVMx7dM5Sv-1)**

## Ví dụ trực quan

Ví dụ chạy thật bằng **AppSidebar** của mds-ui — bấm nút thu gọn ở đáy để co / giãn, rê chuột vào cột icon để xem tạm, bấm nhóm để mở / đóng mục con; đổi **Mở xuống / Xổ sang phải** để thử 2 kiểu menu con. Ô số đỏ bên phải là số việc cần xem (`count`), nhóm đang đóng hiện tổng số của các mục con; bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/SidebarDemo.vue`
## Sử dụng

Dùng style sidebar trắng để giao diện trông sạch và hiện đại hơn. Dưới đây là sidebar chuẩn có 2 chế độ mở rộng và thu gọn.

![](/ds/files/d9a8d295ee2b03a22fb3b1e8fc5faa712241ac72.png)

Khi hover chuột lên menu đang ở chế độ thu gọn thì sẽ hiển thị popover che lên giao diện app để người dùng có thể nhìn thấy toàn bộ các phân hệ một cách trực quan.

Di chuột ra ngoài vùng của menu sẽ tự động ẩn menu đi về chế độ thu gọn.

Người dùng chủ động bấm vào nút Mở rộng thì mới hiển thị giao diện ở chế độ mở rộng nằm dưới trang và đẩy giao diện ứng dụng sang phải.

![](/ds/files/e084e39ccf22643b0006e706899ca5d11e08f708.png)

### Một số dạng Sidebar khác

**Dạng sidebar có 1 cấp con:** Dạng này thường sử dụng cho các phân hệ cha bên trong có một vài phân hệ con

![](/ds/files/5399c6b5096f3be3718f9364a39bed4b6b0aab74.png)

**Dạng sidebar xổ cấp con sang ngang:** Áp dụng cho các loại danh mục có rất nhiều danh mục con, nếu sử dụng dạng xổ xuống thì phải cuộn chuột rất nhiều gây khó chịu.

Ở dạng xổ ra, các item có thể có icon hoặc không.

![](/ds/files/81de03d2e498fd64f5e48014b989a0f5c22e2b8d.png)

**Dạng sidebar nhiều cấp con:** Áp dụng cho các menu động, người dùng có thể tạo được nhiều cấp menu tùy theo nhu cầu sử dụng. Ví dụ: Các cấp Phòng ban cha → Phong ban con → Phong ban...n → Dự án.

Xem demo bên trên đầu.

### Kết hợp màu Header và Sidebar

Khi chọn theme trên Global Header (bánh răng › Thiết lập màu sắc), chỉ cho phép 3 kiểu kết hợp:

| Header (Tiêu đề) | Sidebar |
|---|---|
| Màu đang chọn (header màu) | **Chỉ nền sáng (trắng)** |
| Màu trắng | Nền sáng **hoặc** nền tối |

- **Không dùng header màu đi với sidebar tối.** Khi chọn Tiêu đề "Màu đang chọn", Sidebar tự chuyển về "Nền trắng" và nút "Nền tối" bị mờ (rê chuột: "Chỉ dùng được khi Tiêu đề màu trắng").
- Thiết kế màn hình, ảnh minh hoạ, ví dụ trên Figma cũng chỉ dùng 3 kiểu trên.
- Thi công: `theme.js` của mds-ui đã tự khóa (`sidebarDarkAllowed(headerMode)`), app không cần tự kiểm tra; app đặt mặc định sidebar tối thì phải đặt header trắng.

### Trạng thái của các item trên sidebar

- Khi hover sẽ hiển thị nền xám nhạt

![](/ds/files/4769214d261f0c1de49582b4bd96d34e929b29b2.png)

- Khi active sẽ hiển thị màu brand nhạt, đồng thời đổi màu text và màu icon sang màu brand

![](/ds/files/fd1a0faabd9a17fdc7a4a816583d237900ef0295.png)

- Khi item con active thì item cha không cần thể hiện trạng thái, nhưng sidebar ở trạng thái Thu gọn đồng thời ẩn các item con thì item cha cần có trạng thái active để nhận biết đang active vào phân hệ nào.

![](/ds/files/35ea8066fa65b2bd26983d5c10362cb54f5957eb.png)
