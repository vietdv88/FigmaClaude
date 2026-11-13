---
name: ai-assistant-cost
description: Xây và tối ưu CHI PHÍ cho trợ lý AI hỏi đáp trong app (AVA của mds-docs, AVA của app Chấm điểm / PD Point, hoặc bất kỳ chatbot Gemini / LLM nào trong monorepo FigmaClaude) — đo token, sắp lời nhắc để được cache, chọn tri thức theo câu hỏi, DÙNG LẠI câu trả lời đã có trong Lịch sử hỏi (trùng → trả lời luôn, gần giống → “Có phải bạn định hỏi…”), trả lời theo vai trò người hỏi, lối vào gợi ý theo vai trò. Dùng khi người dùng nói “tối ưu chi phí AI / token”, “cache câu hỏi”, “câu hỏi trùng đừng gọi AI”, “nạp tri thức cho AVA”, “AVA trả lời theo vai trò”, khi thêm trợ lý AI mới vào app, hoặc khi sửa ava.js / aiAva.js / avaLogs / Lịch sử hỏi AVA.
---

# Trợ lý AI tiết kiệm chi phí (mẫu AVA)

Hai bản đã chạy thật — đọc code trước khi làm app mới, CHÉP cách làm, đừng nghĩ lại từ đầu:

| | AVA tài liệu Design System (mds-docs) | AVA app Chấm điểm (chamdiem-app / PD Point) |
|---|---|---|
| Gọi AI + tri thức | `mds-docs/server/ava.js` (BM25 trên knowledge/*.md + trang CMS + tri thức ban biên tập) | `chamdiem-app/src/store/aiAva.js` (tri thức sinh từ scoring.js + cấu hình hệ số) |
| Lịch sử hỏi | `mds-docs/server/avaLogs.js` (SQLite `ava.db`, bảng `logs`) | `store.all('avaLogs')` trong `chamdiem-app/server/index.js` |
| Dùng lại câu trả lời | `mds-docs/server/docs.js` (`exactReuse`, `similarAsked`, `/ava/similar`, `/ava/reuse`) | `chamdiem-app/server/avaReuse.js` + `index.js` (`reusePool`, `/api/ai/ava/similar`, `/api/ai/ava/reuse`) |
| Khung chat | `mds-docs/src/components/DocAva.vue` | `chamdiem-app/src/components/AvaPanel.vue` |
| Quản trị | `AvaLogsTab.vue`, `AvaNotesTab.vue` | `src/pages/AvaLogsPage.vue` |

## 1. Đo trước khi tối ưu
- Ghi token MỖI lượt từ `usageMetadata`: `promptTokenCount` (vào), `cachedContentTokenCount` (phần được cache), `candidatesTokenCount` (ra) + model. Lượt dùng lại = 0.
- Trang Lịch sử hỏi có cột **“Token vào / ra”** và thẻ **“Chi phí AI ước tính”**. Bảng giá Gemini 2.5 Flash (USD / 1 triệu token): vào 0,30 · phần cache 0,03 · ra 2,50 — kiểm tra lại giá khi đổi model.
- Mốc tham chiếu (11/2026): ~14–15k token vào + ~300–450 ra / câu ≈ US$0,005 / câu; ~38 câu / ngày ≈ US$6 / tháng.

## 2. Lời nhắc (prompt) rẻ
- ⚠️ Thực tế mds-docs đo được implicit cache **không trúng (cached = 0)** → đừng giữ phần cố định dài chỉ để “ăn cache”; cắt theo câu hỏi lợi hơn (xem mục 3). Vẫn đặt phần ít đổi trước.
- **Phần CỐ ĐỊNH đặt ĐẦU** (hướng dẫn + tri thức luôn gửi + số liệu chung), phần THAY ĐỔI theo câu hỏi đặt SAU → Gemini tự cache phần đầu giống nhau (implicit caching, tính ~10% giá). ⛔ Không chen nội dung theo câu hỏi / theo người vào giữa phần cố định; thứ tự các mục cố định phải ổn định (sắp theo tiêu đề, không theo giờ sửa).
- Tắt suy nghĩ với Flash (`thinkingBudget: 0`), chỉ bật khi soát ảnh. Giới hạn `maxOutputTokens` (2048 thường / 3072 kỹ thuật, ảnh). `temperature` thấp.
- Lịch sử hội thoại: 6 lượt gần nhất, câu trả lời cũ cắt ~1.000 ký tự, câu hỏi ~2.000.
- Giới hạn lượt hỏi (VD 40 câu / giờ / người) + chặn 1 người hỏi lặp cùng câu (`avaRepeat.js`).
- Dặn AI **không chào / gọi tên người hỏi** — câu trả lời không có tên riêng thì dùng lại được cho người khác.
- Context caching chủ động (`cachedContents`) chỉ đáng khi lượng hỏi lớn: phí lưu ~US$1 / 1 triệu token / giờ → hòa vốn khi > ~4 câu / giờ đều đặn. Dưới mức đó dùng implicit caching là đủ.

### 2a. Trả lời ĐÚNG điều được hỏi + gợi ý hỏi tiếp (bắt buộc)
- Hỏi 1 thuộc tính (VD “padding của button”) → chỉ trả thuộc tính đó (đủ mật độ), 1–2 câu. KHÔNG kể thêm chiều cao, bo góc, màu… Hỏi chung (“quy chuẩn card”) mới tổng quan ngắn (≤ ~120 từ). Không chào hỏi.
- Ý liên quan không được hỏi → AI viết 1 dòng cuối `[GOI_Y] câu 1 | câu 2 | câu 3` (≤ 8 từ / câu, CÙNG thành phần đang hỏi, đủ chủ thể). Máy chủ tách bằng `splitFollowups()` → trả `followups[]`; giao diện hiện thành nút chip (chỉ ở câu trả lời mới nhất), bấm = hỏi câu đó. Dòng gợi ý không bao giờ hiện thành chữ (cả lúc đang chảy chữ).
- Lưu câu trả lời vào lịch sử KÈM dòng `[GOI_Y]` (`withFu`) → dùng lại / gửi lại vẫn có nút gợi ý.
- Đổi cách trả lời → câu trả lời cũ (dài) không còn hợp: đặt mốc `FOCUS_FROM` trong `reusePool` để bỏ câu cũ hơn mốc khỏi kho dùng lại. ⚠️ Thử nghiệm xong mà câu thử bị lỗi → dời mốc / tắt dùng lại các câu đó, kẻo lần sau lấy từ bộ nhớ đệm ra bản lỗi.
- Đo được (2026-11-10): “Padding của button?” → 1 câu + Tự đo 1 dòng, ~90 token ra.

### 2b. Nội dung TĨNH: máy chủ tự gắn, KHÔNG để AI viết (quy tắc bắt buộc)
Mọi đoạn câu chữ cố định (lưu ý, hướng dẫn thao tác, bảng tra, câu thông báo) → để thành **hằng số trên máy chủ**, gặp đúng trường hợp thì ghép vào câu trả lời. ⛔ Không viết vào lời nhắc kiểu “cuối câu trả lời thêm mục …” / “dòng cuối ghi …” — AI sẽ chép lại mỗi lần = tốn token RA (đắt nhất), còn lời nhắc dài thêm = tốn token VÀO.
- mds-docs `server/ava.js`: `PHOTO_NOTE` (lưu ý ảnh chụp — đầu bài soát ảnh) · `SELF_CHECK` (dòng “Tự đo: … Biến chuẩn” cuối bài soát ảnh) · `measureNote(slug)` (mục “Tự đo trên trang tài liệu” 1 dòng — câu hỏi khớp `SIZE_Q`; trang lấy theo tên control trong CÂU HỎI (`LINK_TERMS`) → trang đang xem → link control trong câu trả lời, bỏ trang chung như Thuật ngữ CSS / Biến chuẩn; không rõ trang → không gắn) · bảng “Giá trị token CSS” (`withTokens`) · `REPEAT_NOTE` / `SIMILAR_NOTE` / `SPAM_TEXT` / `VAGUE_TEXT` (avaRepeat.js, không gọi AI). Ghép tại `finishStatic()` — chèn TRƯỚC dòng “Nguồn:”.
- Lời nhắc chỉ ghi 1 câu: “KHÔNG tự viết mục … — hệ thống tự gắn”. Hướng dẫn cũ nằm trong tri thức gửi kèm (VD đoạn “Tự đo thông số” đầu facts.md) → cắt bỏ lúc gửi.
- **Lịch sử hội thoại gửi lên AI bỏ các đoạn tĩnh** (`stripStatic`: dòng `> …`, mục Tự đo, bảng token, dòng Nguồn) — AI không cần đọc lại.
- Đo được (2026-11-10): câu hỏi thông số Dễ hiểu ~300 → **~90 token ra**.

## 3. Tri thức: chỉ gửi phần liên quan
- Tài liệu: tách đoạn theo tiêu đề, chấm BM25 (bỏ dấu + từ đồng nghĩa Việt → Anh), chỉ lấy đoạn ≥ 20% điểm đoạn tốt nhất, tối đa **8 đoạn / 10.000 ký tự** (soát ảnh: 12 / 18.000).
- Số đo code (facts.md ~2.900 token) **không gửi cả file**: phần đầu (mật độ, cách tự đo) + ≤ 4 mục `##` có tiêu đề trùng từ câu hỏi / tiêu đề đoạn tìm được; không mục nào khớp → mục “Token chung”. Trang nguyên tắc nền (PINNED) chỉ ghim nguyên trang khi soát ảnh, câu thường để BM25 chọn đoạn.
- Giá trị token gửi kèm: Dễ hiểu ≤ 15 token, Kỹ thuật ≤ 40.
- Kết quả đo mds-docs (2026-11-10): input trung bình **~13.900 → ~8.600 token / câu (−38%)**, output Dễ hiểu ~630 → ~300.
- Tri thức ban biên tập tự nhập: KHÔNG gửi hết. Mặc định chọn theo câu hỏi (≤ 6 mục / 7.000 ký tự, khớp tiêu đề nặng hơn nội dung); cờ **“Luôn gửi kèm”** cho quy tắc chung (đặt trong phần cố định, tổng ≤ ~6.000 ký tự). ⛔ Đừng gửi hết rồi cắt theo độ dài — mục cũ bị bỏ âm thầm.
- Hướng dẫn người nhập tri thức: mỗi mục 1 chủ đề, < ~1.000 ký tự, tiêu đề chứa đúng từ người dùng hay hỏi, không chép lại nội dung đã có trong tài liệu (gửi trùng 2 lần), tắt mục cũ thay vì để đó. Rà định kỳ: tách mục dài, gộp mục trùng ý, sao lưu file trước khi sửa.
- Tri thức dạng “lộ trình” / mẫu trả lời cố định → ghi “chép gần như NGUYÊN VĂN, không giải thích thêm” và viết sẵn câu chữ ngắn; nói rõ cái gì KHÔNG thuộc nhóm (VD “Hệ số nghiệp vụ không bắt buộc”) — AI hay ghép các trường thường đi cùng nhau.

## 4. Dùng lại câu trả lời trong Lịch sử hỏi (không gọi AI)
Nguồn = chính bảng Lịch sử hỏi AVA (không tạo bộ nhớ riêng, không giữ trong RAM — khởi động lại không mất).

**Dấu hiệu câu hỏi** (`qSig`): bỏ dấu → gộp cách viết cùng khái niệm (pop up = popup, bo góc = radius, màn hình phụ = màn phụ…) → bỏ hư từ (là, thì, của, bao nhiêu…) → tập từ sắp xếp. Độ giống `qSim` = Jaccard + số từ chung.

**Trùng (cùng tập từ) → trả lời luôn**, khi đủ điều kiện:
- lượt hỏi ĐẦU của cuộc trò chuyện, không ảnh, câu hỏi không chỉ vào thứ đang mở (“này”, “đang mở”, “ở đây”);
- cùng chế độ / chủ đề (Dễ hiểu / Kỹ thuật · PD / BA) và — nếu câu trả lời cá nhân hóa theo người — cùng **nhóm vai trò**;
- tri thức nó dựa vào CHƯA ĐỔI: mds-docs ghi `parts` v2 = `k` dấu tri thức luôn gửi (KHÔNG gồm câu chữ lời nhắc — sửa hướng dẫn / cách trình bày không làm hết hạn) + `f` dấu các mục số đo code LIÊN QUAN câu hỏi (theo tiêu đề ## của facts.md) + `p` dấu đoạn tài liệu đã gửi theo thứ tự liên quan (3 đoạn đầu phải còn nguyên, ≥ 70% còn nguyên). ⛔ Đừng băm cả lời nhắc / cả bảng số đo vào dấu: sửa 1 dòng là MỌI câu trả lời cũ mất hiệu lực (đã gặp: câu gợi ý “Các button chiều cao bao nhiêu?” bị gọi AI lại); chamdiem ghi `kstamp` = dấu toàn bộ tri thức + hệ số (đổi hệ số → hết hiệu lực);
- câu gốc: đã trả lời, không bị 👎, Quản trị không tắt, không kèm ảnh, không có thao tác (action), không có thông tin riêng (link dự án / việc, tên người hỏi), trong 60 ngày.

**Gần giống (Jaccard ≥ 0,5, ≥ 2 từ chung) → KHÔNG tự trả lời**, hiện khung **“Có phải bạn định hỏi?”** khi đang gõ (≥ 6 ký tự, chờ 250ms sau phím cuối, bỏ kết quả cũ theo số thứ tự request); tối đa 3 câu, câu được 👍 ưu tiên nhẹ; bấm chọn → `/reuse` → câu trả lời có sẵn; câu đã cũ → 410, khung chat tự hỏi AI như thường. Lý do không tự trả lời: giống chữ ≠ cùng ý (“card trông thế nào” ≠ “card bo góc bao nhiêu”).

**Lượt hỏi cũ chưa có dấu tri thức** → chỉ đưa vào gợi ý (người hỏi tự chọn), ≤ 14 ngày, không tự trả lời.

**Ghi lại**: lượt dùng lại tạo log mới (`reuse_of` = lượt gốc, token 0) để vẫn đánh giá 👍 / 👎 được; 👎 ở lượt dùng lại → tắt dùng lại lượt gốc. Lịch sử hỏi có cột **“Dùng lại”** (N lần / Lấy từ câu đã có / Đã tắt) và nút **“Không dùng lại / Cho dùng lại”** trong hộp chi tiết.

**Câu gợi ý bấm sẵn** (chip) gửi đúng 1 câu cố định → tự trùng → lần 2 trở đi không tốn AI.

**Giao diện khung gợi ý** (đặt ngay trên ô nhập): viền `--stroke-neutral-light`, bo `--radius-default`, đệm 8 (Menu List), dòng tiêu đề icon `history` (`--icon-neutral`) + “Có phải bạn định hỏi?” Semi Bold + phụ đề Secondary + nút × ẩn; mỗi câu là nút full-width, bo góc, hover `--bg-brand-light`. Câu trả lời dùng lại có dòng nhỏ “Câu trả lời có sẵn · không tốn lượt hỏi” (icon `history`). Test `overflow-check.js` ở 1366 / 375.

### 4b. Chặn trước khi gọi AI (đã có ở CẢ 2: mds-docs server/avaRepeat.js + docs.js · Chấm điểm server/avaRepeat.js + index.js)
- **Hỏi lại y hệt** (cùng người, cùng trang, 10 phút) → gửi lại câu trả lời trước (`createAvaRepeat`).
- **Hỏi lại GẦN GIỐNG** (Jaccard tập từ ≥ 0,6 hoặc tập từ nằm gọn trong câu trước, ≥ 3 từ chung) → gửi lại câu trả lời trước kèm “Cần thêm ý nào thì nói rõ” (`createAvaSimilar(qSig, qSim)`). Gộp số ít / số nhiều (components = component) trong `Q_FIX`.
- (Chấm điểm: câu quá rộng / mơ hồ chỉ xử lý bằng QUY TẮC trong lời nhắc — hỏi lại kèm lựa chọn PD / BA, phần nào; chưa có câu hỏi lại soạn sẵn ở máy chủ.)
- **Câu quá rộng / mơ hồ** (VD “tóm tắt chi tiết nhất các components”, “tương tự như trên” không nêu đối tượng) → hỏi lại cho rõ bằng câu soạn sẵn + danh sách lựa chọn (link trang), KHÔNG gọi AI; câu đã nêu tên cụ thể hoặc xin “tóm tắt ngắn” thì cho qua. Lời nhắc cũng có quy tắc: không chắc ý → hỏi lại ≤ 60 từ kèm 2–4 lựa chọn.
- **NGUYÊN TẮC: không chắc ý → HỎI LẠI, không trả lời chung chung** (câu trả lời đoán ý vừa tốn token vừa kém chất lượng). 2 lớp:
  · máy chủ (không gọi AI): lượt ĐẦU, không ảnh / ngữ cảnh màn, câu KHÔNG còn từ nội dung nào sau khi bỏ từ chung chung (`VAGUE_WORDS`: giải thích, hướng dẫn, chi tiết, cái này, sao, thế nào, tóm tắt… — “giải thích đi”, “cái này sao”); câu ngắn mà rõ (“bo góc?”) vẫn trả lời → câu hỏi lại soạn sẵn + 3 ví dụ câu hỏi rõ theo đúng app;
  · lời nhắc: câu mơ hồ / quá rộng → hỏi lại ≤ 60 từ kèm 2–4 lựa chọn cụ thể; chắc ý mới trả lời. Câu nối tiếp (“chi tiết hơn”) có lịch sử thì trả lời bình thường.
- **Hỏi dồn dập không đọc** (câu mới tới trước ¼ thời gian đọc câu trả lời trước ~15 ký tự/giây, 3 lần liên tiếp) → tạm khóa 3 phút, nhắc thẳng (giọng nghiêm, có thể cà khịa nhẹ, KHÔNG xúc phạm) (`createAvaPace`).
- Chủ đề có trang tài liệu riêng → câu trả lời chèn link trang ngay trong phần chính (VD mẫu email gửi khách hàng → [Mẫu email](/ds/email)).

### 4c. Soát ảnh thiết kế (người hỏi gửi ảnh, hỏi “đúng chuẩn chưa”)
- Ảnh đã thu nhỏ / nén → AVA KHÔNG đo chính xác được màu, khoảng cách, cỡ chữ: chỉ kết luận điều nhìn rõ, số đọc từ ảnh ghi “khoảng”.
- Máy chủ TỰ CHÈN câu lưu ý cố định (không phụ thuộc AI) ngay trước mục “Quy chuẩn để tự kiểm lại”: “⚠️ Lưu ý: đây là đánh giá từ ảnh chụp (đã thu nhỏ, nén) nên màu sắc, khoảng cách, cỡ chữ, bo góc có thể sai lệch — kiểm tra lại theo quy chuẩn trên file thiết kế (Figma) hoặc bản thi công (Đo → Xem CSS)” (`PHOTO_NOTE` trong mds-docs/server/ava.js).
- Mỗi điểm cần sửa ghi kèm **quy chuẩn có số + token** (VD bo 8px — `--radius-card`).
- BẮT BUỘC kết thúc bằng mục **“Quy chuẩn để tự kiểm lại”** (kể cả khi Đạt): DANH SÁCH (không dùng bảng — model hay kéo dài dòng phân cách bảng hàng nghìn dấu “-”, đốt hết token) mỗi dòng **Thành phần**: số + token — link trang, 6–10 dòng, chỉ thành phần có trong ảnh, số chép từ tri thức — để người hỏi tự đo trên Figma / bản dựng (Đo → Xem CSS, [Biến chuẩn](/ds/design-tokens)). Lượt có ảnh cho `maxOutputTokens` 4096. Máy chủ rút chuỗi “-” dài về “---” và ngừng đọc khi gặp chuỗi ≥ 200 dấu (model lặp vô hạn).

- **Lưu ý ảnh chụp đặt ĐẦU câu trả lời** (máy chủ tự chèn, cả lúc đang chảy chữ), hiển thị thành ô cảnh báo nền `--bg-warning-light`. ⛔ Đừng chèn giữa / cuối — bài soát dài, người đọc không thấy, tưởng ảnh đã chuẩn (đã gặp 2026-11-10).
- ⛔ Không bao giờ kết luận **“Đạt quy chuẩn”** từ ảnh: lời nhắc + câu nhắc trong lượt hỏi + chốt chặn máy chủ `reviewFix` (đổi thành “Chưa thấy lỗi rõ trong ảnh — vẫn cần đo lại trên Figma / bản thi công”, bỏ mục “đã đạt / đã đúng”). Đang chảy chữ thì giữ dòng viết dở lại để kịp sửa.

## 5. Trả lời theo vai trò người hỏi
- **Phần cho lập trình viên KHÔNG sinh sẵn** (mds-docs): chế độ Dễ hiểu chỉ lời thường — không code / class / token / bảng giá trị token. Dưới câu trả lời có nút `.btn--text` **“Chi tiết cách thi công”** → gọi lại `/ava` với `mode: 'build'` + đúng câu hỏi gốc (1 lượt, bỏ qua chặn spam / gần giống / mơ hồ), trả các mục Component / class · Token (chỉ TÊN, bảng giá trị do máy chủ tự gắn) · Code mẫu ≤ 15 dòng · Lưu ý ⛔. Đa số người không bấm → không tốn token phần đó. Câu `build` cũng được lưu & dùng lại như câu thường.
  - Yêu cầu “lời thường” / “chỉ phần thi công” phải **chèn vào chính lượt hỏi** (Flash bỏ qua khi chỉ nằm trong lời nhắc hệ thống) — nhưng tìm tri thức bằng câu hỏi GỐC (lấy trước khi chèn, chữ “token / class” làm lệch BM25).
  - Giao diện tách mục “Cho lập trình viên” / “Giá trị token CSS” khỏi MỌI câu trả lời (Kỹ thuật, soát ảnh, câu dùng lại / gần giống) → giấu sau link; có sẵn thì bấm hiện luôn, không gọi AI.
  - Câu trả lời Dễ hiểu cũ trong lịch sử còn mục “Cho lập trình viên” / “Giá trị token CSS” → lọc bỏ khi dùng lại (`plainView` ở docs.js).
- Máy chủ gửi kèm NGƯỜI ĐANG HỎI: vai trò hệ thống, quyền quản trị bộ phận, vai trò ở từng dự án (+ id, vòng lặp hiện tại), số người quản lý trực tiếp → AI chỉ hướng dẫn việc họ làm được, link làm ngay chỉ tới chỗ họ có quyền.
- Luật trong lời nhắc: xác định vai trò trước khi trả lời; PD / BA hỏi “tôi cần làm gì” → không đưa bước quản trị (tạo dự án, thêm thành viên, chốt điểm, sửa hệ số) như việc của họ, chỉ nhắc 1 câu “PO / quản lý sẽ …”.
- Lối vào theo vai trò: khi mở khung chat (chưa hỏi gì) hiện 1 thẻ nổi bật (icon `route`, viền gradient AI `background: var(--ai-border-on-ai-light)` (Stroke/AI là gradient), nền `--bg-ai-light`) — VD PD: “Cách chấm điểm cho PD trên ứng dụng”, BA tương tự, PO / Quản trị: “Cách tổ chức chấm điểm…”, vai trò chỉ xem: không hiện. Bấm = gửi 1 câu cố định → AI trả theo LỘ TRÌNH viết sẵn của vai trò đó.

## 6. Khi thêm / sửa tri thức
- chamdiem-app: thêm mục lên đầu `AVA_NEWS` (`src/store/avaNews.js`) để callout gợi ý câu hỏi mới.
- mds-docs: `npm run build` (dựng lại knowledge/) rồi đưa `knowledge/` + `dist/` lên server; tri thức ban biên tập nằm ở `data/ava-notes.json` (đọc mỗi lần hỏi, không cần khởi động lại).
- Sửa tri thức → câu trả lời dùng lại liên quan tự hết hiệu lực (không cần xóa tay).

## 7. Kiểm tra trước khi báo xong
- [ ] Lời nhắc: phần cố định đứng đầu, không lẫn nội dung theo câu hỏi / người; không chào tên.
- [ ] Log có token vào / cache / ra + model; thẻ chi phí hiển thị.
- [ ] Hỏi 2 lần cùng câu (2 cách viết, cùng nghĩa từ) → lần 2 `reused: true`, token 0.
- [ ] Gõ câu gần giống → hiện “Có phải bạn định hỏi?”; bấm → có câu trả lời ngay; sửa tri thức liên quan → câu đó không còn được gợi ý / trả lời lại.
- [ ] Câu trả lời có link dự án / tên người / thao tác → KHÔNG được dùng lại cho người khác.
- [ ] Hỏi thử bằng tài khoản giả lập từng vai trò (gọi thẳng hàm hỏi AI trên máy chủ với `asker` khác nhau) → PD không được hướng dẫn việc quản trị.
- [ ] Khung chat ở 1366 / 375: `overflow-check.js` = [] và không lỗi trang (pageerror).


## 11. Cập nhật 2026-11-13 — một cách trả lời + số liệu từ CSS thật (mds-docs)
- Bỏ tab Dễ hiểu / Kỹ thuật ở khung AVA: chỉ còn 1 cách trả lời (`plain`: lời thường **kèm SỐ LIỆU** — Cao, Rộng, Padding, Gap, Font size / weight, Border radius, Border, Box shadow (offset blur màu độ mờ), mã hex theo trạng thái) + nút “Chi tiết cách thi công” (`build`) cho token / class / code. Máy chủ coi `dev` cũ = `plain`; `FOCUS_FROM` dời mốc để câu cũ thiếu số liệu không bị dùng lại.
- Tri thức số đo KHÔNG gõ tay: `scripts/build-knowledge.mjs` bước 4 đọc CSS thật (`mds-ui/style.css` + `<style>` từng `.vue`) → `knowledge/facts-controls.md` (số đo từng phần tử + mục “trạng thái”, token đã quy ra px / hex theo 3 mật độ; bảng tra shadow, bo góc, chữ, khoảng cách, màu). Thêm control mới vào mds-ui → build lại là AVA biết.
- `factsFor` (ava.js) chọn tối đa 5 mục theo từ trong TÊN control; mục “trạng thái” chỉ gửi khi câu hỏi nhắc hover / focus / disabled / màu… Mỗi mục cắt ≤ 6.500 ký tự. Ảnh soát thiết kế vẫn gửi đủ `facts.md`.
