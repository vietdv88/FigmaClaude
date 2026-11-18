<!-- SINH TỰ ĐỘNG từ mds-docs /ds/accordion (2026-11-18) — không sửa tay -->
# Accordion

> Danh sách mục thu gọn / mở rộng theo Figma Accordion: Style Outline True (khối riêng, bo 8) / False (liền khối, kẻ ngang). Link components: **[tại đây](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6019-928)**

## Ví dụ trực quan

Ví dụ chạy thật bằng bộ control **mds-ui** — đổi **Style Outline**, bấm tiêu đề để mở / đóng. Bấm **Xem code** để lấy mã.

> Ví dụ chạy thật: `mds-docs/src/demos/AccordionDemo.vue`
Theo component Figma **Accordion** (MDS Web Components v2.0) — thuộc tính **Style Outline** True / False.

## Các kiểu

| Style Outline | Hiển thị |
|---|---|
| **True** | mỗi mục là 1 khối riêng: nền BG/White, viền 1px Stroke/Neutral, bo Radius/Default 8px; các mục cách nhau **12px** (Gap Accordion) |
| **False** | các mục liền khối: viền trên cả khối + viền dưới mỗi mục 1px Stroke/Neutral, không bo góc |

## Thành phần và kích thước

| Thành phần | Quy chuẩn (token Figma) |
|---|---|
| Mục (Accordion Item) | đệm **16px** dọc và ngang (Padding Vertical / Horizontal) |
| Tiêu đề → nội dung | cách **12px** (Gap Container) |
| Tiêu đề | H3 16/22 — Semi Bold, Text/Primary Neutral |
| Icon | **20px**, Icon/Neutral — đóng: **chevron-down**, mở: **chevron-up** |
| Nội dung | Body Regular 13/20 — Regular, Text/Primary Neutral |

## Hành vi (bản thi công mds-ui)

- Bấm cả hàng tiêu đề để mở / đóng; tiêu đề là nút bấm nên Tab tới rồi **Enter / Space** cũng được (có `aria-expanded`).
- Mặc định mở được nhiều mục cùng lúc; `:multiple="false"` → mở 1 mục thì các mục khác tự đóng.

## Code

```vue
<AppAccordion v-model="open" :items="[{ key: 'a', title: 'Tiêu đề', content: 'Nội dung' }, { key: 'b', title: 'Tiêu đề 2' }]">
  <template #item-b>…nội dung có control, danh sách…</template>
</AppAccordion>
<AppAccordion v-model="open" :items="items" :outline="false" :multiple="false" />
```

Thuộc tính: `items` [{ key, title, content?, disabled? }] · `v-model` (mảng key đang mở) · `outline` (mặc định true) · `multiple` (mặc định true) · slot `#item-{key}` / `#title`.
