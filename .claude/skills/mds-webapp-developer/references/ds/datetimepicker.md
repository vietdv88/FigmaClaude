<!-- SINH TỰ ĐỘNG từ mds-docs /ds/datetimepicker (2026-11-18) — không sửa tay -->
# DateTimePicker

> DateTime Picker giúp người dùng nhập hoặc chọn ngày, giờ một cách trực quan, chính xác, giảm nhầm lẫn định dạng và tăng hiệu quả nhập liệu. Chi tiết components: **[Ô input nhập liệu](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-50393&m=dev&t=noQ6MHd2atL2vLTe-1),** **[Popover xổ ra](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=15258-153109&m=dev&t=noQ6MHd2atL2vLTe-1)**

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — thao tác thử, đổi mật độ hiển thị, bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/DatetimeDemo.vue`
## Sử dụng

- Bấm vào các link: Hôm nay, Bây giờ trên popover sẽ chuyển về ngày và giờ hiện tại tương ứng
- Các popover có nút Đồng ý thì sau khi chọn xong phải bấm đồng ý mới submit thông tin và đóng popover, các loại không có nút đồng ý khi chọn giá trị tự đông submit và đóng popover luôn.

### Control chọn Date

Sử dụng chọn hoặc nhập ngày tháng theo định dạng thông thường Ngày/Tháng/Năm. Ví dụ ngày tháng năm sinh: 20/01/2000

![](/ds/files/634e0f4045cdfa059fd3b6e9eebbf3c1f0d5f48f.png)

Trạng thái khi focus vào ô nhập liệu

![](/ds/files/69fd8df752649e8144a7fa46f82baea532d015a2.png)

### Control chọn Date và Time

Sử dụng chọn cả ngày và giờ. Ví dụ đặt lịch họp cần chính xác cả ngày lẫn giờ.

![](/ds/files/d9537949930afbf1d4730e18eb0bb1939614df2e.png)

### Control chọn Date Range

Sử dụng cho các nhu cầu chọn thời gian kéo dài từ ngày này sang ngày khác. Ví dụ: Chọn thời hạn công việc mà không cần chi tiết đến giờ, chọn khoảng thời gian xem báo cáo...

#### Dạng đơn giản, ít có nhu cầu chọn khoảng cố định

![](/ds/files/b28f5b2ac4eb33ba1a56765b51555b20c824ee1a.png)

#### Dạng nâng cao tiện ích sử dụng cho các báo cáo hay chọn các khoảng cố định

![](/ds/files/fddebee52665900698d3992d32ecd73461b8e9f2.png)

#### Chọn Date Range có cả ngày và giờ

Đối với trường hợp này khi chọn xong ngày và giờ bắt đầu xong bấm Đồng ý, sẽ nhảy sang ngày giờ kết thúc, bấm Đồng ý lần nữa mới submit thông tin xuống.

#### Chọn ngày bắt đầu

![](/ds/files/e3dcbc839ab79248504a4e9918b10aa1af0a8397.png)

#### Chọn ngày kết thúc

![](/ds/files/369cc0b6e0076d5b975dcadd61a730a6dbd88e10.png)

### Control chỉ chọn giờ

Control chỉ chọn giờ phù hợp khi bạn chỉ cần nhập/thay đổi giờ trong một ngày—không cần quan tâm tới ngày cụ thể, hoặc ngày đã được xác định từ trước.

Chọn đầy đủ giờ, phút, giây

![](/ds/files/7eba2aa8928c96ac94515770edf5d47aa105d8ea.png)

Chọn chỉ giờ và phút

![](/ds/files/d59d26612a77342652f126c29757388019fbb31c.png)

### Control chỉ chọn tháng và năm

Control chọn tháng-năm dùng khi chỉ cần xác định thời điểm theo kỳ tháng (không quan tâm đến ngày cụ thể).

![](/ds/files/c92af510b4abda5d987ab17a35d099e39f58509f.png)
