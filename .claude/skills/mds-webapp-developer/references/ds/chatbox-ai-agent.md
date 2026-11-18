<!-- SINH TỰ ĐỘNG từ mds-docs /ds/chatbox-ai-agent (2026-11-18) — không sửa tay -->
# Cửa sổ chat AI Agent

> Khi bấm vào avatar agent trên header của các sản phẩm sẽ hiển thị ra cửa sổ chat tương tác với các agent, cửa sổ chat này sẽ nằm dưới UI của ứng dụng, không che mất nội dung khi tương tác với agent.

## Ví dụ trực quan

Mô phỏng màn hình 1440 × 800: bấm avatar agent / AMIS Chat trên header để mở panel, rê chuột vào cạnh trái panel rồi kéo để đổi độ rộng, kéo rộng tới khi app bên trái < 1024px để thấy thanh cuộn ngang.

> Ví dụ chạy thật: `mds-docs/src/demos/ChatboxAgentDemo.vue`
## Quy chuẩn

![](/ds/files/07cf3dc921a355e61cf76ca70a20bf8ab51534ac.png)

- Khi hover vào cạnh của box chat sẽ hiển thị stroke màu theo màu của AMIS Chat cung cấp và có mũi tên cho phép kéo rộng box chat này. Kích thước rộng tối đa là 50% màn hình.
- Các dự án cần xử lý responsive để khi co kéo độ rộng cửa sổ này giao diện vẫn đảm bảo thao tác được mà không bị che mất thông tin, nhỏ quá có thể hiện scroll ngang: **Các dự án xử lý để thông tin co lại hiển thị được tối thiểu ở kích thước 1024px**, nếu kéo khung chat rộng hơn → **kích thước bên trái của app nhỏ hơn 1024px thì hiển thị thanh scroll ngang bên dưới** cho phép kéo để xem được nội dung của app. Nhìn kỹ thanh scroll ảnh phía trên để hình dung.
- Tên agent, avatar, hình ảnh mascot phải custom được theo từng sản phẩm.
- Kích thước mặc định **min-width** của box chat là **350px**

![](/ds/files/36d9df1c885265560bdbceea4b316b014541e80f.png)

Cửa sổ chat với agent cũng chính là cửa sổ của AMIS Chat nên khi bấm vào logo AMIS Chat trên header cũng hiển thị box chat ở chính vị trí này.

![](/ds/files/5dafcda3e538b8311fe4b74a35b1f09843a0903d.png)

### Dùng chung vị trí với panel Trợ giúp (Help)

- Cửa sổ chat agent, AMIS Chat và [panel Trợ giúp](/ds/help) mở ở **cùng một vị trí panel bên phải** — tại một thời điểm chỉ hiện **1 panel**.
- Đang mở Chat AVA mà người dùng chọn **? › Hướng dẫn sử dụng (F1)** trên header → panel Trợ giúp hiện ra và **ẩn luôn** panel Chat AVA (không chồng 2 panel).
- Mọi panel đều **đẩy giao diện app sang trái**, không đè lên nội dung.

### Chi tiết cách xử lý thanh scroll bên trái

![](/ds/files/d91d4c7cbe2c661cd10d9a59b2904aeef0bc194e.png)

Ảnh code minh họa khi chưa kéo scroll (Thiết kế thật xem các ảnh bên trên)

Khi khung bên trái của cửa sổ chat có độ rộng nhỏ hơn 1024 thì sẽ hiển thị thanh scroll dưới cùng của trình duyệt, khi kéo là kéo toàn bộ nội dung của app sang trái hoặc sang phải.

![](/ds/files/e4e15a2d103c0e89d3154298352b9d85c676ab17.png)

Ảnh code minh họa khi kéo scroll sang phải (Thiết kế thật xem các ảnh bên trên)

![](/ds/files/1c079d5f53ddd57a9e1a66ea7469a4cb9156d380.png)

Ảnh code minh họa kéo nhỏ khung chat để bên trái có kích thước >= 1024px thì không hiện scroll bên dưới nữa (Thiết kế thật xem các ảnh bên trên)

Tất cả các scroll bên trong của bảng hay các chỗ khác giữ nguyên chấp nhận có nhiều scroll, miễn đảm bảo người dùng nhìn được đầy đủ giao diện không bị đè lên nhau hoặc bị che lấp.
