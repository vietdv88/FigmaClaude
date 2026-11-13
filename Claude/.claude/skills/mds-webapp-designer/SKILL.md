# MDS Web App Designer — Router

Skill thiết kế và build màn hình **Web App** sử dụng **MDS Web Components v2.0**.

**Figma library:** `1DP5RJM3MsZJ8SnUWgTavS` | **Logo library:** `DxJfoNpKGaw6JvJcJn8RHT`

**MANDATORY trước mọi `use_figma` call:** Load skill [figma-use](../../../plugins/cache/claude-plugins-official/figma/2.1.30/skills/figma-use/SKILL.md)

---

## BƯỚC 0 — XÁC ĐỊNH LOẠI TASK VÀ ĐỌC FILES TƯƠNG ỨNG

> Đọc đúng file cho đúng task. Không đọc file không liên quan = tiết kiệm token + tập trung quy tắc đúng.

### Task là CODE (Vue 3 app)

| Tình huống | Files BẮT BUỘC đọc |
|-----------|---------------------|
| Build/sửa bất kỳ page Vue 3 | `code/vue3-rules.md` |
| Page có bảng danh sách (DataTable, Pagination) | + `code/list-page.md` |

**⚠️ Sau khi đọc `code/vue3-rules.md`, PHẢI chạy CHECKLIST 11 điểm trước khi submit.**

### Task là FIGMA (vẽ thiết kế)

| Tình huống | Files BẮT BUỘC đọc |
|-----------|---------------------|
| Mọi task vẽ Figma | `figma/workflow.md` + `figma/library.md` |
| Tạo màn hình mới / cấu trúc layout | + `figma/layout.md` |
| Màu sắc, text style, chart, design token | + `figma/color-font.md` |
| setProperties, fills, icon slots, traversal | + `figma/component-api.md` |

---

## Cấu trúc thư mục

```
mds-webapp-designer/
├── SKILL.md                 ← file này — router nhỏ
├── code/
│   ├── vue3-rules.md        ← inventory, component props, 11-item checklist
│   └── list-page.md         ← list page patterns: tab/no-tab, bulk-action, DataTable, AppButton
├── figma/
│   ├── workflow.md          ← quy trình vẽ, nội dung, post-draw checklist
│   ├── library.md           ← library source rules, component first, icon slots
│   ├── color-font.md        ← color variables, text styles, chart colors
│   ├── component-api.md     ← setProperties, fills ban, icon API, traversal
│   └── layout.md            ← screen init, list/form layout, alignment rules
├── references/
│   ├── components.md        ← Figma component keys, variable IDs
│   └── screen-patterns.md   ← Vue 3 + Figma spacing patterns (tham khảo thêm)
├── prompts/                 ← prompt templates (login, dashboard, table-list, form)
└── assets/
    └── library-info.txt
```

---

## Quy tắc chung (luôn áp dụng)

- **Code Vue 3**: Components từ `D:\Figma\mds-ui\src\components\` — inventory trước, không đoán prop.
- **Figma**: Chỉ dùng MDS Web Components v2.0 (`1DP5RJM3MsZJ8SnUWgTavS`) — không import từ thư viện khác.
- **Cả hai**: Không tự bịa đặt nội dung. Không để placeholder. Hỏi user khi không chắc.
- **Khi xong**: Code → `npm run build`. Figma → screenshot + so sánh ảnh gốc.
- **Shadow hay Stroke (viền) — chọn một**: đã có border thì không thêm shadow (và ngược lại). Khối trắng đặt trên nền trắng khác → không shadow, tách bằng nền màu (BG/Page, BG/Neutral Light, BG/Brand Light…) hoặc viền Stroke/Neutral Light. Shadow chỉ cho khối nổi trên nền khác màu: card trên nền trang (Neutral/All 2), menu / popover (Bottom 12), popup / dialog / drawer.
