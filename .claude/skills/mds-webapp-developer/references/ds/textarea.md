<!-- SINH TỰ ĐỘNG từ mds-docs /ds/textarea (2026-11-18) — không sửa tay -->
# Textarea

> Ô nhập nhiều dòng cho mô tả, ghi chú, lý do… Link components: **[tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-50055&m=dev)**

## Ví dụ trực quan

Ví dụ chạy thật bằng `AppTextarea` của **mds-ui** — đổi kiểu chiều cao (Kéo giãn / Cố định / Tự giãn) ở thanh tùy chọn, bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/TextareaDemo.vue`
## Các biến thể (Figma ❖ Textare)

| Thuộc tính | Giá trị | Ý nghĩa |
|---|---|---|
| **Fix Height** | False (mặc định) | Có **góc kéo** ở dưới bên phải — người dùng kéo xuống để ô cao thêm, xem nhiều dòng hơn; nội dung dài hơn ô thì cuộn |
| | True | Chiều cao **cố định**, KHÔNG có góc kéo; nội dung dài thì cuộn trong ô |
| *(tùy chọn)* Tự giãn | `autosize` | Gõ tới đâu ô cao tới đó, không giới hạn, **không có thanh cuộn**, không có góc kéo |
| **Typed** | False / True | Chưa nhập (hiện gợi ý) / đã nhập |
| **State** | Default · Hover · Focus · ReadOnly | Trạng thái tương tác |
| **Edit Mode** | False | Màn xem: chỉ hiện chữ, không khung nhập |

## Thành phần và kích thước

| Thành phần | Quy chuẩn |
|---|---|
| Khung | viền Stroke/Neutral 1px, bo Radius/Default 8px, nền trắng |
| Đệm | trên – dưới **8px**, trái **12px**, phải **8px** |
| Chữ | Body Regular 13/20, màu Text/Primary · gợi ý (placeholder) Text/Hint |
| Chiều cao | tối thiểu **72px** |
| Góc kéo giãn | 12×12 ở góc dưới phải — chỉ có khi Fix Height = False (ẩn khi Cố định, Tự giãn, Chỉ đọc, Khóa) |
| Thanh cuộn | hiện khi nội dung dài hơn ô (không có ở dạng Tự giãn) |

## Trạng thái

| Trạng thái | Hiển thị |
|---|---|
| Default | viền Stroke/Neutral |
| Hover | viền Stroke/Brand |
| Focus | viền Stroke/Brand + con trỏ nhập |
| ReadOnly | nền BG/Neutral Light, không kéo giãn được |
| Disabled | nền BG/Neutral Light, chữ mờ, không thao tác |
| Lỗi | viền Danger + icon chấm than, thông báo lỗi dạng tooltip đỏ dưới ô (như mọi ô nhập) |

## Sử dụng

- Dùng cho nội dung **nhiều dòng**: mô tả, ghi chú, lý do, địa chỉ chi tiết. Nội dung 1 dòng ngắn dùng **Text field**.
- Giữ nguyên xuống dòng người dùng đã nhập khi hiển thị lại ở màn xem.
- Có giới hạn ký tự thì hiện bộ đếm `đã nhập/tối đa` dưới ô, căn phải.
- Form nhiều trường cần giữ bố cục ổn định → **Fix Height = True** (cố định, cuộn trong ô). Ô ghi chú cần đọc trọn nội dung → **Tự giãn**.

```vue
<AppInput label="Mô tả">
  <AppTextarea v-model="desc" placeholder="Nhập mô tả" />   <!-- mặc định: có góc kéo giãn -->
</AppInput>
<AppTextarea v-model="note" fix-height />          <!-- cố định, không góc kéo -->
<AppTextarea v-model="memo" autosize />            <!-- tự giãn, không cuộn -->
<AppTextarea v-model="reason" :maxlength="200" />  <!-- giới hạn ký tự -->
```
