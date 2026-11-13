# MISA Design System — tài liệu tra cứu (/ds)

Trang tài liệu + ví dụ sống cho bộ control `mds-ui`. Chạy dưới `/ds/` cùng tên miền với PD Point, code và dữ liệu tách riêng.

```
mds-docs/
├── src/            giao diện (Vue + mds-ui)
│   └── demos/      ví dụ sống — *Demo.vue + khai báo trong demos/index.js
├── server/docs.js  API /api/ds + phục vụ /ds (PD Point gắn bằng mountDocs)
├── content/        nội dung chuyển từ Figma Site — chỉ nạp lần đầu khi data/ trống
└── data/           (máy chủ) trang, lịch sử, thùng rác, ảnh — KHÔNG commit / không ghi đè khi deploy
```

## Chạy thử
```bash
cd chamdiem-app/server && node index.js        # máy chủ PD Point (gắn sẵn /ds, /api/ds)
cd mds-docs && npm install && npm run build    # build giao diện → dist/ (máy chủ phục vụ ở /ds/)
npm run dev                                    # hoặc dev server cổng 3020 (API=http://localhost:8080)
```

## Viết nội dung
Sửa trên CMS `/ds/quan-tri` (Quản trị PD Point + người được thêm vào “Người biên tập”). Nội dung là Markdown, thêm:
- `::: note | warning | danger | success` … `:::` — hộp lưu ý
- `::: do` / `::: dont` … `:::` — thẻ Nên / Không nên (2 khối liền nhau xếp 2 cột)
- `::: demo <mã>` + `:::` — ví dụ sống (mã khai báo trong `src/demos/index.js`)

Ảnh: dán / kéo thả vào ô soạn → tải lên `/ds/files/<sha1>.<đuôi>`.

## AVA — hỏi đáp quy chuẩn
`server/ava.js`: tìm đoạn liên quan trong `knowledge/*.md` + các trang CMS → Gemini (khóa AI của PD Point). `knowledge/` do `npm run build` sinh (`scripts/build-knowledge.mjs`):
skill chung, **facts.md** (số đo đang chạy của control — đọc CSS thật, thay token theo 3 mật độ; luôn gửi kèm mọi câu hỏi), class CSS, props control.
Đổi skill / mds-ui → build lại + deploy `knowledge/` + khởi động lại PD Point.

## Deploy
`dist/`, `server/`, `content/`, `knowledge/`, `package.json` → `/opt/mds-docs/` (giữ nguyên `/opt/mds-docs/data`). Sửa `server/docs.js` thì khởi động lại PD Point.
