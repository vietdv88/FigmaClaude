<!-- SINH TỰ ĐỘNG từ mds-docs /ds/dialog (2026-11-18) — không sửa tay -->
# Dialog

> Link component: **[tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-180746&m=dev&t=QN0CeNnsR98iRqHd-1)**

## Ví dụ trực quan

Bấm các nút để mở dialog thật: xác nhận xóa (nút chính màu đỏ), dialog 3 nút và dialog thông báo 1 nút. Bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/DialogDemo.vue`
## Thành phần

Là một thành phần giao diện người dùng, được sử dụng khi cần thông báo cho người dùng các thông tin quan trọng, yêu cầu người dùng đưa ra quyết định hoặc xác nhận trước khi thực hiện các hành động tiếp theo.

![](/ds/files/05edfb1b438da339c1e6813aaa3b7015225dcc3d.png)

### Tiêu đề

Tiêu đề nên là cụm từ hoặc một câu hỏi ngắn gọn, rõ ràng thể hiện hành động mà người dùng đang cần phải xác nhận.

![](/ds/files/993700d9a6d0d7f9d7a45ecbf126dc18df926e7b.png)

### Mô tả

Mô tả là nội dung để người dùng có thêm thông tin, hiểu ngữ cảnh trước khi thực hiện xác nhận hành động.

Nếu tiêu đề dialog là một cụm từ/câu hỏi người dùng về hành động thì mô tả nên diễn giải kết quả của hành động sau khi người dùng xác nhận.

Nghiên cứu về hành vi người dùng đọc theo kiểu "copy" "scan" có chỉ ra rằng:
- Độ dài của 1 câu hoặc đoạn văn dưới 8 từ, 100% người dùng sẽ đọc và hiểu hết nội dung mà người viết muốn truyền tải.
- Với độ dài là 14 từ, tỉ lệ này giảm xuống 90%.
- Khi độ dài là 43 từ, tỉ lệ chỉ còn 10%.

Vậy nên, hãy lựa chọn từ ngữ phù hợp để viết các mô tả ngắn gọn, súc tích, có ngữ cảnh và ý nghĩa. Hạn chế lặp lại từ với tiêu đề hoặc đặt lại các câu hỏi như “Bạn có chắc bạn muốn…” hay “Bạn có chắc không?”.

![](/ds/files/06bbc4d2b564a67773cf0b4396db4fb3f085169a.png)

### Button

Dialog phải có ít nhất 1 hoặc tối đa 3 button, các button nên được sắp xếp trên 1 hàng theo thứ tự ưu tiên từ phải sang trái.

**Button chính (primary action):** Là button đầu tiên theo thứ tự từ phải sang, nên đặt tên là cụm từ thể hiện hành động tiếp theo đối với các dialog cần xác nhận, hoặc "Đóng" với các dialog mang tính thông báo.

![](/ds/files/f5e0e1bf785f1ec913db0c644a47f8fe89bb1efa.png)

**Button phụ (secondary action): khi không dùng sẽ không hiển thị trên dialog. Tương tự button chính, đặt tên button phụ là 1 cụm từ thể hiện hành động sẽ làm khi người dùng nhấn với mức ưu tiên thấp hơn button chính.**

![](/ds/files/abdb11abeb42e1320394e65c0a766920ac7b50bd.png)

#### Button Hủy: cho phép người dùng đóng dialog và không thực hiện hành động.

![](/ds/files/9584ae319e59b1294328207fe60beb5054e6ef3e.png)

### Kích thước và khoảng cách (Alert Dialog)

Theo component Figma **Alert Dialog** (2 kiểu: Default — nút chính màu Brand · Danger — nút chính màu đỏ cho thao tác xóa / không khôi phục được):

| Thành phần | Quy chuẩn |
|---|---|
| Khung | rộng **432px**, đệm **24px** 4 phía, bo góc **12px**, bóng Drop Shadow / Neutral / Bottom 12, nền trắng, **không** vạch ngăn giữa các phần |
| Khoảng cách | tiêu đề ↔ mô tả ↔ hàng nút: **16px** |
| Tiêu đề | 16px Semi Bold, dòng 22px, tối đa 2 dòng · icon đóng (✕) 20px màu xám, cách tiêu đề 12px |
| Mô tả | 13px Regular, dòng 20px |
| Hàng nút | căn phải, các nút cách nhau **8px**, nút cao theo mật độ (32px), rộng tối thiểu 80px · có thể có 1 Text link bên trái |

Thi công: `<AppAlertDialog>` của mds-ui (`type="danger"` cho nút Xóa). Dialog có form nhập liệu thì dùng khung form (Form / Popup), không dùng Alert Dialog.

## Sử dụng

### Nội dung quá dài

Khi không có đủ không gian để hiển thị hết được dialog, thì tiêu đề và mô tả tự động xuống dòng, với tiêu đề chỉ hiển thị tối đa 2 dòng.

![](/ds/files/290cbaff26e5c09e61eceac11112055e0ca12658.png)

### Hãy viết nội dung tiêu đề, mô tả có ý nghĩa

Sử dụng dialog đúng thời điểm với nội dung ngắn gọn, rõ ràng, có tính chất thông tin. Không đưa ra các thông báo với nội dung quá dài, hoặc mang tính chất kỹ thuật.

#### Tiêu đề và nội dung nên đồng nhất

::: do
![](/ds/files/39e884b25e625cb16386469f743252bed6ef7782.png)

Tiêu đề và nội dung phải đồng nhất nhau
:::

::: dont
![](/ds/files/9cee53f431c7161bda97035c4b323969a8bc52ce.png)

Tiêu đề và mô tả không ăn nhập với nhau
:::

#### Nội dung nên thể hiện được kết quả sau khi thực hiện hành động

::: do
![](/ds/files/20f35331f96974914717416af189bbf052ec3daa.png)

Nội dung nên thể hiện được kết quả của việc thực hiện xóa thì sẽ ảnh hưởng gì.
:::

::: dont
![](/ds/files/7dc427d9ef852707c1d8ee9b25b552d3486bd297.png)

Nội dung không nên hỏi lại câu vô nghĩa mà tiêu đề đã thể hiện được rồi
:::

### Hạn chế việc lặp từ giữa tiêu đề và mô tả

Tiêu đề nên đặt thành các câu hỏi và mô tả thể hiện kết quả của hành động, thay vì việc tiếp tục lặp lại việc hỏi người dùng về hành động.

::: do
![](/ds/files/c621de2255fbd7303f1e70909ca7f1ff13b937a7.png)

Nội dung mô tả được rõ ràng ý nghĩa của hành động lưu lại bộ lọc.
:::

::: dont
![](/ds/files/586d90e4a5859d743571ccfb436dabeb0b2858ff.png)

Nội dung bị lặp lại ý nghĩa so với tiêu đề.
:::

### Không chồng các dialog lên nhau

Mỗi dialog nên thể hiện cho 1 hành động duy nhất, với 1 chuỗi các hành động, nên xem xét việc dùng [Popup](/ds/popup) với các bước riêng biệt.

![](/ds/files/683c9fc2e58de93a0f73f7ca9c4308a47af51e0e.png)
