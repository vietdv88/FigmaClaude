<!-- SINH TỰ ĐỘNG từ mds-docs /ds/checkbox (2026-11-18) — không sửa tay -->
# Checkbox

> Checkbox là một thành phần giao diện người dùng (UI component) cho phép người dùng chọn một hoặc nhiều tùy chọn trong danh sách. Checkbox thường được sử dụng trong các biểu mẫu, bộ lọc, hoặc danh sách thiết lập. Link components: **[tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-3888&m=dev)**

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — thao tác thử, đổi mật độ hiển thị, bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/CheckboxDemo.vue`
Checkbox là một thành phần giao diện người dùng (UI component) cho phép người dùng chọn một hoặc nhiều tùy chọn trong danh sách. Checkbox thường được sử dụng trong các biểu mẫu, bộ lọc, hoặc danh sách thiết lập.

## Sử dụng

#### Trạng thái bình thường của checkbox

![](/ds/files/d26682718bca13d66d6235c5205f15a8e0e97779.png)

#### Trạng thái đang check chọn

![](/ds/files/530d2786e153ec1d07d1003a3ccd5de8178d730b.png)

#### Trạng thái không xác định

![](/ds/files/21ae585c23d7a2012b494935c568bccb3d906fbd.png)

Trạng thái này thường xảy ra khi checkbox đứng đầu danh sách, bên dưới có 1 số item đang được check và một số item không check

![](/ds/files/14f99881fe4740fcfa36b94084a5ad155bdc7d99.png)

#### Trạng thái vô hiệu hóa (Disabled)

Checkbox không cho thay đổi (VD cột bắt buộc hiển thị trong Thiết lập bảng). Ô vẫn thể hiện đúng giá trị đang có:

- **Chưa chọn:** nền Neutral Light (`--bg-neutral-light`), viền Neutral (`--stroke-neutral`).
- **Đã chọn / Một phần:** nền **Brand Disable** (`--bg-brand-disable`), dấu tick / gạch trắng. Không dùng nền xám cho ô đã chọn vì dấu tick trắng sẽ biến mất, người dùng tưởng ô chưa chọn.
- **Chữ nhãn giữ màu Primary** (Figma không đổi màu chữ khi disabled); con trỏ chuột hiện biểu tượng cấm.
- Nên có tooltip giải thích **vì sao không đổi được** (VD “Cột mặc định bắt buộc hiển thị, không thể ẩn”) để người dùng không phải đoán.

#### Trạng thái lỗi

![](/ds/files/807f4605ed117b056aba454f972e6ce154bb9198.png)
