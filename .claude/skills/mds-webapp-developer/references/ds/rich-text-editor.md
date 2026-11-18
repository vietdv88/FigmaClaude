<!-- SINH TỰ ĐỘNG từ mds-docs /ds/rich-text-editor (2026-11-18) — không sửa tay -->
# Rich text editor

> Trình soạn thảo văn bản có định dạng (đậm, nghiêng, danh sách, liên kết, ảnh, bảng…) dùng thư viện **TinyMCE** bọc trong `AppRichText`. Link components: **[tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=28355-87417&m=dev)**

## Ví dụ trực quan

Ví dụ chạy thật bằng `AppRichText` (TinyMCE 7) — đổi kiểu thanh công cụ và trạng thái ở thanh tùy chọn, mở **Xem HTML lưu xuống** để xem dữ liệu.

> Ví dụ chạy thật: `mds-docs/src/demos/RichTextDemo.vue`
## Các kiểu

| Kiểu | Prop | Dùng khi |
|---|---|---|
| **Đơn giản** | `toolbar="simple"` (mặc định) | Mô tả, ghi chú, bình luận dài — theo Figma ❖ RichText. |
| **Đầy đủ** | `toolbar="full"` | Nội dung cần trình bày: kiểu đoạn, phông, cỡ chữ, màu nền chữ, giãn dòng, bảng. |
| **Classic** | `toolbar="classic"` | Soạn tài liệu / mẫu email: có thanh menu, đếm chữ, xem trước, toàn màn hình, sửa mã HTML. |
| **Inline** | `mode="inline"` | Sửa ngay tại chỗ, không khung: bấm vào nội dung thì thanh công cụ nổi lên. |

Có thể truyền chuỗi nút riêng của TinyMCE vào `toolbar` khi cần bộ nút khác.

## Thanh công cụ (Figma ❖ Editor Toolbar)

| Thành phần | Quy chuẩn |
|---|---|
| Nền | trắng, vạch dưới Stroke/Neutral Light ngăn với vùng soạn |
| Nút | cao 28px, bo Radius/Inner 6px, icon Icon/Neutral; hover và đang bật nền BG/Neutral Light |
| Nhóm nút | ngăn bằng vạch dọc mảnh, thứ tự: Hoàn tác · Định dạng chữ · Căn lề · Danh sách · Thụt lề · Chèn |
| Khung hẹp | các nút không đủ chỗ gom vào nút **⋯** (mở thêm hàng) |

## Vùng soạn thảo

- Khung như ô nhập: viền Stroke/Neutral, bo Radius/Default 8px; Focus viền Brand + quầng sáng; Lỗi viền Danger kèm thông báo lỗi dưới ô.
- Chữ Body Regular 13/20, màu Text/Primary; gợi ý (placeholder) Text/Hint.
- Kéo **góc dưới phải** để đổi chiều cao (`resize`, mặc định bật).
- **Chỉ đọc:** nền Neutral Light, ẩn thao tác sửa.

## Dữ liệu

- `v-model` là **HTML**; lưu xuống máy chủ phải **lọc HTML** (bỏ script, thuộc tính sự kiện) trước khi hiển thị lại.
- Đếm độ dài theo chữ thuần (bỏ thẻ) khi kiểm tra giới hạn ký tự.

```vue
<AppInput label="Mô tả sản phẩm">
  <AppRichText v-model="html" toolbar="simple" :height="240" />
</AppInput>
<AppRichText v-model="html" toolbar="classic" :height="360" />
<AppRichText v-model="note" mode="inline" />
```

Thư viện: TinyMCE 7 (giấy phép GPL, nạp từ CDN, ghim phiên bản) — tham khảo [TinyMCE Classic demo](https://www.tiny.cloud/docs/tinymce/latest/classic-demo/).
