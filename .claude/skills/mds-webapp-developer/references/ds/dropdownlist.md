<!-- SINH TỰ ĐỘNG từ mds-docs /ds/dropdownlist (2026-11-18) — không sửa tay -->
# DropDownList

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — thao tác thử, đổi mật độ hiển thị, bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/DropdownDemo.vue`
Copyright © 1994 - 2025 MISA JSC

All Rights Reserved

Sử dụng menu thả xuống khi người dùng cần chọn từ một số giá trị, ví dụ: khi người dùng cần chọn khách hàng hoặc loại thanh toán. Link components: **[tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-50262&m=dev&t=1S0zBdtFYvQw6tLk-1)**

## Sử dụng

- Sử dụng dropdown list khi trình bày cho người dùng một danh sách dài các tùy chọn (**nhiều hơn 5 và nhỏ hơn 10 tùy chọn**).
- Ít hơn 5 tùy chọn lựa chọn [Radio button](/ds/radiobutton) nhiều hơn 10 tùy chọn thì sử dụng [Combobox](/ds/combobox)
- Việc hiển thị các label tương tự như bên [Text field](/ds/text-field)

## Trạng thái

Các trạng thái cũng tương đồng với [Text field](/ds/text-field)

#### Hiển thị các tùy chọn

![](/ds/files/f054ff16e7379f599335d4ae1d3881a6b8ffe960.png)

Khi kích thước của text trong danh sách xổ ra nhỏ hơn DropDownList thì Min-width của danh sách bên dưới sẽ bằng kích thước của DropDownList

![](/ds/files/9089468489f407736370467eaa6cf989ecb1ffe3.png)

Khi kích thước của text trong danh sách xổ ra lớn hơn kích thước của DropDownList thì hiển thị width của danh sách theo độ rộng của text để đảm bảo đọc được đầy đủ thông tin, nếu quá dài có thể cân nhắc hiển thị 2 dòng.

## Phím tắt

#### ARROW UP

Di chuyển lên trên 1 item

#### ARROW DOWN

Di xuống dưới 1 item

#### ENTER

Submit 1 item đang chọn và đóng popover

## Khuyến nghị

#### Sắp xếp các sự lựa chọn

Đảm bảo các mục trong danh sách theo thứ tự hợp lý (theo thứ tự bảng chữ cái, thứ tự thời gian, thứ tự quan trọng, v.v.).

::: do
![](/ds/files/eed7c37ac0678016603013fa8461506f1b160a7d.png)

Sắp xếp các lựa chọn trong danh sách theo một thứ tự hợp lý
:::

::: dont
![](/ds/files/4284635227600e02685273adf2ba92701c0e25b1.png)

Tránh việc để các giá trị lộn xộn không theo một thứ tự nào
:::

#### Khi không có giá trị nào được chọn trước

Nếu không có mục nào được chọn trước, hãy sử dụng câu nào đó như “Chọn nhà cung cấp” hoặc “Chọn tài khoản” ở định dạng văn bản gợi ý. Nếu không thể làm mờ văn bản thì sử dụng chỉ báo.

::: do
![](/ds/files/80d433248f1509cbc2538893641d95fba2c2a12f.png)

Khi không có giá trị nào được chọn trước, hãy hãy viết một câu gợi ý người dùng lựa chọn giá trị phù hợp trong placeholder
:::

::: dont
![](/ds/files/256a5531d7b18a61368f549de47fb20957fdcc4a.png)

Tránh việc để trống, không gợi ý hoặc chỉ báo cho người dùng biết tại đây chọn được giá trị
:::
