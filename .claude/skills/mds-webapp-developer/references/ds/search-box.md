<!-- SINH TỰ ĐỘNG từ mds-docs /ds/search-box (2026-11-18) — không sửa tay -->
# Search box

> Ô tìm kiếm có 2 chế độ: **Thường** (lọc theo từ khóa ngay khi gõ) và **Thông minh** (hỏi bằng câu tự nhiên, AI hiểu điều kiện). Link components: **[tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-3895&m=dev)**

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — đổi chế độ Thường / Thông minh và kiểu ô ở thanh tùy chọn, bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/SearchboxDemo.vue`
## Khi nào dùng chế độ nào

| Chế độ | Component | Cách hoạt động |
|---|---|---|
| **Thường** | `AppSearchbox` (Figma ❖ Searchbox) | Lọc ngay khi gõ theo tên / mã, không phân biệt dấu. |
| **Thông minh** | `AppAiSearchbox` (Figma ❖ AI Searchbox) | Gõ câu tự nhiên (VD “khách hàng nợ trên 100 triệu”) → **Enter** hoặc bấm icon phân tích để AI hiểu điều kiện và lọc. |

Trên thanh công cụ của bảng, chọn chế độ bằng prop `search-mode="normal | ai"` của `TableHeader` — không đặt công tắc đổi chế độ bên trong ô.

## Search box thường

### Các kiểu

| Kiểu (Style) | Mặc định | Hover / Focus | Dùng ở |
|---|---|---|---|
| **Outline** | nền trắng, viền Stroke/Neutral | viền Stroke/Brand (Focus có quầng sáng) | Thanh công cụ bảng, form, popup |
| **Filled** | nền Neutral/200, không viền | nền trắng + viền Stroke/Brand | Vùng nền trắng cần ô nhẹ hơn (danh sách chọn, ô tìm trong menu) |
| **Filled White** | nền Alpha White/200, chữ gợi ý Alpha White/700 | nền trắng mờ đậm hơn | Chỉ trên nền màu (Global Header) |

### Thành phần và kích thước

| Thành phần | Quy chuẩn |
|---|---|
| Khung | cao = ô nhập của mật độ (`--input-height`: 32 · Nhỏ 28 · Rộng 36), đệm ngang **8px**, bo Radius/Default 8px |
| Icon kính lúp | 16px, Icon/Neutral, cách chữ **8px** |
| Chữ | Body Regular 13/20; gợi ý (placeholder) Text/Hint — mặc định “Tìm kiếm” |
| Nút xóa ✕ | 16px, chỉ hiện khi **đã gõ**; **Esc** cũng xóa |
| Disabled | nền Neutral Light, chữ Hint, không bấm được |

### Hành vi

- Lọc ngay khi gõ, **không phân biệt dấu** (“cuong thinh” vẫn ra “Cường Thịnh”).
- **Enter** phát sự kiện `search` (dùng khi cần gọi máy chủ thay vì lọc tại chỗ).
- Không có kết quả → hiện Empty state “Không tìm thấy…” kèm từ khóa đã gõ.

```vue
<AppSearchbox v-model="q" placeholder="Tìm theo tên, mã" />
<AppSearchbox v-model="q" variant="filled" />
<AppSearchbox v-model="q" variant="filled-white" />   <!-- trên nền màu -->
```

## Search box thông minh (AI)

| Trạng thái | Hiển thị |
|---|---|
| Chưa gõ | viền gradient AI, icon Search Spark, chữ gợi ý gradient AI + huy hiệu **AI** |
| Hover | nền gradient AI nhạt, viền AI đậm hơn |
| Đã gõ | chữ thường + ✕ xóa + icon **device-analytics màu AI_Primary** |
| Disabled | nền Neutral Light, viền AI nhạt, chữ Hint |

### Xem điều kiện AI bóc tách

Bấm icon **device-analytics** (đã gõ) → popup nhỏ ngay dưới ô cho biết AI hiểu câu tìm kiếm thành **trường nào, giá trị gì**, để người dùng kiểm tra trước khi tìm. Ví dụ: Họ và tên: “**Trần Văn Bình**”, Vị trí công việc: “**DEV Lead**” — tên trường chữ thường, giá trị Semi Bold trong ngoặc kép.

### Kết quả tìm kiếm với AI

Nhấn **Enter** → popup kết quả dưới ô (rộng tối thiểu 640, đệm 16 đều 4 phía, bo 8, bóng popover):

| Thành phần | Quy chuẩn |
|---|---|
| Tiêu đề | icon AI sparkles 20 + “Kết quả tìm kiếm với AI” kiểu chữ **H3** (Semi Bold), màu gradient AI Primary |
| Dòng điều kiện | icon device-analytics 16 + các trường AI bóc tách (Body 13), giá trị Semi Bold |
| Nhóm kết quả | ngăn bằng vạch trên; nhãn nhóm rộng 120px **VIẾT HOA** chữ phụ (Hồ sơ, Khen thưởng…) |
| Mục kết quả | avatar 32 · tên Semi Bold · chức danh và đường dẫn đơn vị chữ nhỏ màu phụ (dài thì xuống dòng) · hover nền Brand Light |
| Số kết quả | Tag Neutral “N kết quả” bên phải mỗi nhóm; nhiều hơn số đang hiện → link **Xem thêm** → mở popup kết quả của riêng nhóm đó (như “Xem thêm” ở Global search; `@more(group, câu)` + `more-items` / `more-total`) |
| Đóng | Esc, bấm ra ngoài, hoặc sửa nội dung ô |

```vue
<AppAiSearchbox v-model="ask" :parsed="conditions" :results="groups"
  @analyze="text => conditions = await parse(text)"
  @submit="text => searchByAi(text)"
  @select="(item, group) => openProfile(item)" @more="group => loadMore(group)" />
```
