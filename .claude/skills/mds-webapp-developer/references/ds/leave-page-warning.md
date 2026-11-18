<!-- SINH TỰ ĐỘNG từ mds-docs /ds/leave-page-warning (2026-11-18) — không sửa tay -->
# Cảnh báo thoát trang

> Cảnh báo cho người dùng khi đang nhập liệu mà thoát hoặc bấm nhầm tắt trình duyệt, tắt tab, F5 trình duyệt hay chuyển sang phân hệ khác thì có cảnh báo để tránh mất dữ liệu phải nhập liệu lại.

## Ví dụ trực quan

Mở form, nhập vài chữ rồi bấm ✕ / Hủy / Esc để thấy cảnh báo; không nhập gì thì form đóng luôn. Khi đang nhập, thử F5 để thấy cảnh báo mặc định của trình duyệt. Bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/LeaveWarningDemo.vue`
::: warning
Lưu ý: Chỉ show những cảnh báo này khi có thao tác nhập liệu của người dùng trên form. Nếu chỉ bấm thêm hoặc sửa mà không nhập liệu gì sau đó tắt đi thì không cần cảnh báo.
:::

![](/ds/files/c9d718b2051610532244e2587a19bf7ab95e1d99.png)

### Trường hợp F5 trình duyệt, đóng tab hoặc đóng trình duyệt

Các dự án bắt buộc phải áp dụng phòng trường hợp người dùng đang nhập liệu lỡ tay bấm nhầm đóng tab, tắt trình duyệt, hay F5 thì họ có cửa để dừng lại tránh trường hợp mất dữ liệu phải nhập lại từ đầu.

#### Sử dụng form cảnh báo của trình duyệt

![](/ds/files/0420e894ec9b71353d1af324df6d97f7b048ffee.png)

Sử dụng cảnh báo mặc định của trình duyệt để tránh trường hợp tắt tab hay tắt trình duyệt vẫn có thể cảnh báo được.

#### Không sử dụng form cảnh báo dự án tự vẽ

Khi người dùng **bấm F5 nhiều lần thì sẽ load mất luôn cả màn hình cảnh báo, hoặc khách hàng tắt tab hay tắt trình duyệt thì cảnh báo này cũng không có ý nghĩa gì.**

### Trường hợp người dùng bấm thao tác trong ứng dụng thoát form nhập liệu

Khi người dùng bấm X để đóng popup nhập liệu hoặc bấm sang 1 phân hệ khác, hoặc bấm nút Hủy bỏ khi đang nhập liệu thì hiện cảnh báo:

#### Sử dụng confirm dự án tự vẽ

![](/ds/files/c9d718b2051610532244e2587a19bf7ab95e1d99.png)

#### Tại sao không hỏi có muốn lưu dữ liệu không mà chỉ cảnh báo thoát và không lưu dữ liệu?

::: do
![](/ds/files/c9d718b2051610532244e2587a19bf7ab95e1d99.png)

Phần mềm SaaS trên form luôn có nút Lưu và có màu primary nổi bật, trường hợp người dùng cố tình bấm Hủy hoặc X để thoát nghĩa là họ đã mong muốn thoát và không lưu chứ không phải bấm thoát để chọn lưu dữ liệu.
:::

::: dont
![](/ds/files/9658ab9f61946dbf766edfdee172b0eba0d2c872.png)

Một số phần mềm Desktop như Word, Excel nút lưu rất ẩn, thói quen là soạn thảo xong tắt đi rồi tiện lưu luôn nên họ đang focus vào thao tác lưu là chính.
:::

### Tham khảo một số ứng dụng SaaS khác

#### Shopify

![](/ds/files/c0b2d20ca82959e1032ac63476a00aefb420441e.png)

#### Quickbooks

![](/ds/files/3fbae178090bdf3106f5b70a1f493fac165a2aba.png)

#### Zoho Books

![](/ds/files/4048d05cb7004e506fc1e2111d2e62f252f51753.png)
