<!-- SINH TỰ ĐỘNG từ mds-docs /ds/tree (2026-11-18) — không sửa tay -->
# Tree

> Cây dữ liệu nhiều cấp (cơ cấu tổ chức, danh mục): có / không có ô tick, tìm kiếm, mở đóng nhánh

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — chọn kiểu cây ở trên, gõ tìm kiếm, mở / đóng nhánh, thử bằng bàn phím. Bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/TreeDemo.vue`
Tree (cây) hiển thị dữ liệu **nhiều cấp cha – con**, phổ biến nhất là **cây cơ cấu tổ chức** (công ty → khối → phòng → tổ), danh mục nhiều cấp, cây thư mục. Người dùng mở / đóng từng nhánh để tìm và chọn một hoặc nhiều mục.

## Khi nào dùng

- Dữ liệu có quan hệ cha – con từ **2 cấp trở lên** và người dùng cần thấy được vị trí của mục trong cây (VD chọn phòng ban để phân quyền, lọc báo cáo theo đơn vị).
- Dữ liệu phẳng, không có cấp → dùng **ComboBox / Checkbox**. Chỉ cần chọn 1 mục trong ô nhập → dùng **ComboBox dạng cây**.

## Các kiểu

| Kiểu | Dùng khi |
|---|---|
| **Có ô tick** (Show Checkbox) | Chọn **nhiều** đơn vị. Mặc định mỗi mục chọn độc lập — tick phòng con không tự tick phòng cha |
| **Tick cả nhánh** | Chọn đơn vị cha là chọn toàn bộ đơn vị con bên dưới; cha chọn dở hiện dấu "chọn một phần" (–) |
| **Không ô tick** (Hide Checkbox) | Chọn **1** đơn vị (VD điều hướng: bấm phòng ban → xem danh sách nhân viên của phòng đó) |

## Thành phần và kích thước

| Thành phần | Quy chuẩn |
|---|---|
| Khung (khi đứng riêng / xổ ra) | nền trắng, đệm **12px**, bo góc **8px**, bóng Drop Shadow / Neutral / Bottom 20 |
| Ô tìm kiếm | Searchbox cao 32px ở trên cùng, cách cây **8px** |
| Dòng | cao **32px**, đệm ngang **16px**, các dòng cách nhau **4px** |
| Thụt cấp | mỗi cấp thụt vào **24px** (cấp 2: 24px, cấp 3: 48px…) |
| Trong dòng | mũi tên mở / đóng 16px → ô tick 16px → tên, cách nhau **8px**; tên 13px, dài thì cắt "…" (rê chuột xem đủ) |
| Mục đã chọn | chữ màu Brand |
| Rê chuột / đang trỏ bằng phím | nền Brand nhạt (BG/Brand Light) |

## Hành vi

- Bấm **mũi tên** để mở / đóng nhánh; bấm vào dòng để chọn (kiểu có ô tick: bấm dòng = tick / bỏ tick).
- **Tìm kiếm**: gõ là lọc ngay (không phân biệt dấu), giữ lại cả nhánh cha của mục khớp và tự mở các nhánh đó; không có kết quả → "Không tìm thấy kết quả phù hợp".
- **Bàn phím**: ↑ ↓ di chuyển · → mở nhánh / xuống con · ← đóng nhánh / lên cha · Space hoặc Enter chọn. Từ ô tìm kiếm bấm ↓ để vào cây.
- Cây dài → khung có chiều cao tối đa và cuộn bên trong, ô tìm kiếm luôn ở trên.
- Mặc định mở sẵn cấp đầu tiên (hoặc nhánh chứa mục đang chọn) để người dùng thấy ngay cấu trúc.

## Thi công

Dùng `<AppTree>` của mds-ui:

```vue
<AppTree v-model="donVi" :items="coCau" checkable panel :max-height="420" />
```

- `items`: `[{ id, label, children?, disabled? }]` · `v-model`: mảng id (có `checkable`) hoặc 1 id (không ô tick, kèm sự kiện `@select`).
- `cascade`: tick cả nhánh · `searchable` (mặc định bật) · `default-expanded`: `true` mở hết, số = mở tới cấp, hoặc mảng id · `panel`: khung trắng có bóng · `max-height`: cuộn trong.
