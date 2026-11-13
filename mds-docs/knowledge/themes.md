<!-- source: Màu chủ đề (THEMES) -->
# MDS Web Components v2.0 — Theme Variants

Giá trị màu đọc trực tiếp từ Figma `🎨 Themes` collection, node `23274:37787`.  
**NGHIÊM CẤM tự tính toán / sinh ra bất kỳ giá trị nào không có trong bảng này.**

---

## Cách dùng

Thêm `[data-theme="tên-theme"]` vào thẻ `<html>` hoặc root container:

```html
<html data-theme="teal">
```

Rồi override CSS variables trong `:root[data-theme="..."]`.

---

## Bảng màu brand theo từng theme

| Theme      | `--bg-brand` | `--bg-brand-light` | `--text-brand` | `--text-link` | `--icon-brand` | `--stroke-brand` |
|------------|-------------|-------------------|---------------|--------------|---------------|-----------------|
| **blue** *(default)* | `:root` | `:root` | `:root` | `:root` | `:root` | `:root` |
| **green**  | `#0e9a62` | `#e6f5ef` | `#0e9a62` | `#0b7d52` | `#0e9a62` | `#0e9a62` |
| **blue-gray** | `#4e5ba6` | `#f5f5fa` | `#4e5ba6` | `#4e5ba6` | `#4e5ba6` | `#4e5ba6` |
| **teal**   | `#0e9384` | `#f1fefc` | `#0e9384` | `#0e9384` | `#0e9384` | `#0e9384` |
| **cyan**   | `#00a2cf` | `#f0fcff` | `#00a2cf` | `#00a2cf` | `#00a2cf` | `#00a2cf` |
| **indigo** | `#4155f5` | `#f0f2fe` | `#4155f5` | `#4155f5` | `#4155f5` | `#4155f5` |
| **purple** | `#744ec7` | `#f6f3fb` | `#744ec7` | `#744ec7` | `#744ec7` | `#744ec7` |
| **pink**   | `#c64691` | `#fbf3f8` | `#c64691` | `#c64691` | `#c64691` | `#c64691` |
| **red**    | `#c34266` | `#fbf3f6` | `#c34266` | `#c34266` | `#c34266` | `#c34266` |
| **orange** | `#ea580c` | `#fef5f0` | `#ea580c` | `#ea580c` | `#ea580c` | `#ea580c` |

> **Nguồn chuẩn:** thang `--brand-50…900` đầy đủ của 10 theme nằm ở `mds-ui/src/style.css` (khối Theme Overrides), đồng bộ Figma 🎨 Themes ngày 2026-10-30. Ánh xạ khác Blue: `--bg-brand-hover/pressed` = brand-800/900 ở Blue gray · Teal · Cyan · Purple; `--text-link` = brand-700 ở Green; `--dt-header-bg` = neutral-200 ở mọi theme trừ Blue. Đổi màu theme → sửa ở style.css + `theme.js` (COLORS main/light), không override token ngữ nghĩa ở app.

---

## CSS Override template

```css
/* Paste vào :root hoặc dùng [data-theme] selector */

:root[data-theme="green"] {
  --bg-brand:       #0e9a62;
  --bg-brand-light: #e6f5ef;
  --text-brand:     #0e9a62;
  --text-link:      #0e9a62;
  --icon-brand:     #0e9a62;
  --stroke-brand:   #0e9a62;
}

:root[data-theme="blue-gray"] {
  --bg-brand:       #4e5ba6;
  --bg-brand-light: #f5f5fa;
  --text-brand:     #4e5ba6;
  --text-link:      #1570ef;
  --icon-brand:     #4e5ba6;
  --stroke-brand:   #4e5ba6;
}

:root[data-theme="teal"] {
  --bg-brand:       #0e9384;
  --bg-brand-light: #f1fefc;
  --text-brand:     #0e9384;
  --text-link:      #0e9384;
  --icon-brand:     #0e9384;
  --stroke-brand:   #0e9384;
}

:root[data-theme="cyan"] {
  --bg-brand:       #00a2cf;
  --bg-brand-light: #f0fcff;
  --text-brand:     #00a2cf;
  --text-link:      #00a2cf;
  --icon-brand:     #00a2cf;
  --stroke-brand:   #00a2cf;
}

:root[data-theme="indigo"] {
  --bg-brand:       #4155f5;
  --bg-brand-light: #f0f2fe;
  --text-brand:     #4155f5;
  --text-link:      #4155f5;
  --icon-brand:     #4155f5;
  --stroke-brand:   #4155f5;
}

:root[data-theme="purple"] {
  --bg-brand:       #744ec7;
  --bg-brand-light: #f6f3fb;
  --text-brand:     #744ec7;
  --text-link:      #744ec7;
  --icon-brand:     #744ec7;
  --stroke-brand:   #744ec7;
}

:root[data-theme="pink"] {
  --bg-brand:       #c64691;
  --bg-brand-light: #fbf3f8;
  --text-brand:     #c64691;
  --text-link:      #c64691;
  --icon-brand:     #c64691;
  --stroke-brand:   #c64691;
}

:root[data-theme="red"] {
  --bg-brand:       #c34266;
  --bg-brand-light: #fbf3f6;
  --text-brand:     #c34266;
  --text-link:      #c34266;
  --icon-brand:     #c34266;
  --stroke-brand:   #c34266;
}

:root[data-theme="orange"] {
  --bg-brand:       #ea580c;
  --bg-brand-light: #fef5f0;
  --text-brand:     #ea580c;
  --text-link:      #ea580c;
  --icon-brand:     #ea580c;
  --stroke-brand:   #ea580c;
}
```


### Sidebar tối (`data-sidebar="dark"`) — không vạch phải

Sidebar tối KHÔNG có border-right (nền `#1c1e26` đã tự tách khỏi vùng nội dung). mds-ui đặt `border-right: none` (sidebar định vị absolute theo bề rộng nên không xô vùng nội dung; để viền trong suốt sẽ hở 1px nền tối ở mép phải — VD làm hụt ảnh trang trí góc), kể cả biến thể có hình nền (`data-wallpaper`). Sidebar sáng giữ vạch `--stroke-neutral-light` như cũ.
