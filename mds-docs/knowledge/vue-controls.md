<!-- source: Control Vue trong mds-ui (vue-controls) -->
# Vue Controls & Layout Patterns — mds-ui

> **QUY TẮC CỐT LÕI:** Chỉ dùng controls và layouts trong danh sách này.  
> Thiếu control → **bỏ trống**, báo user. **NGHIÊM CẤM** tự thi công control mới khi chưa được phép.  
> Ảnh mockup / Figma chỉ dùng để lấy nội dung (label, data, cột) — không dùng để quyết định structure.

---

## Import alias

```js
import ComponentName from '@mds/components/ComponentName.vue'
```

---

## 1. Components đã được duyệt

### AvatarFilter — lọc theo người bằng dãy avatar

```vue
<AvatarFilter v-model="ids" label="Người thực hiện" :people="[{ id, name, picture, sub, code }]" />
```
- Đặt trong slot `#filters` của TableHeader thay cho combobox "Người: Tất cả". Bấm avatar = lọc (chọn nhiều, bấm lại để bỏ); người đang lọc viền màu chính, người khác mờ.
- Hover → tooltip tên đầy đủ. Không đủ chỗ → nút `+N` (đủ chỗ → nút kính lúp); bấm xổ danh sách có ô tìm kiếm theo quy tắc tìm chung (`matchText`: không dấu, chữ cái đầu). Người chọn trong danh sách được đưa lên đầu dãy để nhìn thấy.
- Cỡ avatar theo token mật độ (`--btn-height − 4px`). `v-model` là mảng id; rỗng = không lọc.
- `accent` (tùy chọn, màu CSS): chấm màu trước nhãn — khớp màu nhóm cột `col.accent` của DataTable (VD lọc PD / BA). `accent-tip`: tooltip khi di lên chấm.

### v-resizable-drawer — co kéo độ rộng drawer / panel bên phải

```vue
import { vResizableDrawer } from '@mds/utils/resizableDrawer.js'
<aside class="pd-drawer" v-resizable-drawer="{ key: 'closing-pd', min: 480 }">…</aside>
```
- Mọi drawer / panel neo bên phải (position fixed, `right: 0`) đều gắn directive này: rê chuột mép trái → vạch màu thương hiệu, kéo để đổi độ rộng, nhấp đúp → về độ rộng mặc định (CSS). Nhớ độ rộng theo `key`.
- `min` (px, mặc định 360) · `max` (px, mặc định 92% bề ngang màn hình). CSS tay kéo dùng chung: `.drawer-resize` / `.drawer-resizing` trong style.css — không tự viết lại ở app.

### TableHeader
> **AppTabs `:baseline="false"`:** bỏ vạch nền dưới các tab chưa chọn (chỉ tab đang chọn còn gạch Brand) — dùng khi dải tab nằm sát viền / vạch ngăn của khung chứa, tránh 2 đường kẻ chồng nhau (VD dải tab phân hệ con thay tiêu đề).
> **Thao tác hàng loạt — 2 trường hợp theo bố cục danh sách (04/11/2026):**
> 1. **Danh sách có tiêu đề trang** (tiêu đề trái, Nhập khẩu / Thêm / ⋯ bên phải): tick dòng → `<BulkActionBar :selected-count :total-count :page-all-selected @deselect-all @select-all-pages><OverflowActions :actions … /></BulkActionBar>` **thay chỗ tiêu đề + các nút bên phải**; `TableHeader` của bảng **giữ nguyên** (không bật `bulk-action`).
> 2. **Danh sách có tab phân hệ con thay tiêu đề** (không có tiêu đề; bộ lọc nhanh slot `filters` + Nhập khẩu / Thêm / ⋯ ở `main-buttons` với `main-function-button`): tick dòng → `TableHeader :bulk-action="true"` — thao tác hàng loạt thế chỗ bộ lọc nhanh và Nhập khẩu / Thêm, **giữ ô tìm kiếm** bên trái.
> Nút hàng loạt luôn qua `OverflowActions` (thiếu chỗ tự gom vào “⋯”, nút nguy hiểm xếp cuối).
> **Tìm kiếm thông minh TRÊN BẢNG** (`search-mode="ai"`): hành xử Y HỆT `AppAiSearchbox` ở /ds/search-box — kết quả hiện ở **popover “Kết quả tìm kiếm với AI”** (dòng điều kiện bóc tách + kết quả theo NHÓM: trái = tên nhóm · phải = bản ghi + Tag số kết quả), **bảng KHÔNG bị lọc**. Luồng: **icon phân tích** → `@ai-analyze(câu)` → app đặt `:ai-parsed="[{ label, value }]"` (popup “Điều kiện AI bóc tách”) · **Enter** → `@ai-search(câu)` → app tìm rồi đặt `:ai-results="[{ key, title, total, items: [{ id, name, subtitle, meta, avatar }] }]"` · bấm bản ghi → `@ai-select(item, group)` · “Xem thêm” → mở **popup kết quả của riêng nhóm đó** (`AppSearchResultsDialog`, cùng popup “Xem thêm” của Global search; popover đóng) — app lắng nghe `@ai-more(group, câu)` rồi đặt `:ai-more-items` (TOÀN BỘ bản ghi của nhóm) + `:ai-more-total` (+ `:ai-more-loading`); sửa từ khóa trong popup → bắn lại `@ai-more` · **✕** → `@ai-clear` (xóa chữ + đóng popover + bỏ kết quả). `ai-results-panel="false"` chỉ cho app muốn Enter lọc thẳng bảng (không khuyến nghị). ⛔ Không biến ô thông minh thành lọc bảng ngầm, ⛔ không để popover kết quả mở lại sau khi bấm ✕ (đã sửa trong AppAiSearchbox: `clear()` quên lần tìm trước khi focus). Sample: /ds/data-table › Tìm kiếm › Thông minh.
> **Tìm kiếm thông minh (04/11/2026):** `<TableHeader :search-mode="mode" @ai-search="q => …">` — `search-mode`: `'normal'` (ô tìm kiếm thường) | `'ai'` → **AppAiSearchbox** (Figma AI Searchbox 17455:70653: viền gradient AI, icon `mds-search-spark`, placeholder gradient “Tìm kiếm thông minh”, huy hiệu “AI”; đã gõ: ✕ + icon phân tích gửi). Chọn kiểu do APP quyết định (VD tùy chọn / thiết lập “Tìm kiếm: Thường · Thông minh”) — ⛔ không đặt nút chuyển trong ô. Enter / icon phân tích → `@ai-search(câu hỏi)`: app gửi câu hỏi cho AI / máy chủ rồi lọc. Dùng riêng: `<AppAiSearchbox v-model="q" @submit="…" />` (props `placeholder`, `disabled`, `width`).
> **Thanh luôn 1 dòng (⛔ không để xuống 2 dòng) — có sẵn trong TableHeader, 04/11/2026:** chật thì ô tìm kiếm co từ `search-width` xuống ~120px; vẫn không đủ chỗ → **ẩn các ô lọc bày sẵn (slot `filters`) và gom vào icon lọc bên phải** — bấm xổ popover “Bộ lọc” 320px kiểu bộ lọc cơ bản, ô lọc xếp dọc, đổi là áp dụng ngay (app có bộ lọc riêng thì cuối popover có “Bộ lọc khác” → `@open-filter`). Rộng ra đủ chỗ thì tự bày lại. Chọn hàng loạt: chật thì ẩn ô tìm kiếm; nút hàng loạt dùng `OverflowActions` để tự gom vào “⋯”. ⛔ App không tự đặt `flex-wrap` / chiều cao / ẩn ô lọc theo `window.innerWidth` cho thanh công cụ.
Padding chuẩn: `8px 12px` (trái = phải 12px) — đã đặt trong component, không override ở app.
```vue
<TableHeader
  v-model="searchQuery"
  search-placeholder="Tìm kiếm"
  :search-width="200"
  :main-function-button="true"
  :bulk-action="selected.length > 0"
  :selected-count="selected.length"
  @deselect-all="selected = []"
>
  <!-- Bulk action buttons: hiện khi có dòng được tick chọn -->
  <template #bulk-buttons>
    <button class="btn btn--outline btn--neutral">Hành động 1</button>
    <button class="btn btn--outline btn--neutral">Hành động 2</button>
    <DropdownMenu :items="bulkMoreItems" placement="bottom-end" :min-width="160">
      <template #trigger="{ toggle }">
        <button class="btn-icon btn-icon--outline" @click.stop="toggle"><TIcon name="dots" /></button>
      </template>
    </DropdownMenu>
  </template>
  <template #filters>
    <!-- filter controls (ẩn khi bulk-action=true) -->
  </template>
  <template #main-buttons>
    <!-- THỨ TỰ BẮT BUỘC (trái → phải): -->
    <!-- 1. btn btn--primary (nút chính — VD: Thêm) -->
    <!-- 2. btn-icon btn-icon--outline với icon "dots" → DropdownMenu (LUÔN ngoài cùng bên PHẢI) -->

    <!-- ⛔ NGHIÊM CẤM thêm icon button riêng lẻ cho refresh/export/settings/filter vào #main-buttons -->
    <!-- → TableHeader tự render sẵn 4 icon trong table-header__icon-group: refresh, file-export, settings, filter -->
    <!-- → dots dropdown chỉ chứa những action CHƯA có trong built-in (VD: import, in danh sách...) -->
    <!-- ⛔ NGHIÊM CẤM nút có label "Tiện ích" -->
  </template>
</TableHeader>
```

**TableHeader built-in icon group (tự render, KHÔNG cần thêm thủ công):**
`[refresh] [file-export] [settings] [filter]` — emit: `@refresh`, `@export`, `@col-settings`, `@open-filter`
Màn không có chức năng tương ứng → ẩn nút bằng `:hide-tools="['col-settings', 'filter']"` (giá trị: `refresh` · `export` · `col-settings` · `filter`) — KHÔNG để nút bấm không làm gì.

**Ví dụ đúng #main-buttons:**
```vue
<template #main-buttons>
  <button class="btn btn--primary"><TIcon name="plus" />Thêm</button>
  <DropdownMenu :items="moreItems" placement="bottom-end" :min-width="200">
    <template #trigger="{ toggle }">
      <button class="btn-icon btn-icon--outline" @click.stop="toggle"><TIcon name="dots" /></button>
    </template>
  </DropdownMenu>
</template>

<!-- moreItems: chỉ action CHƯA có trong built-in icon group -->
const moreItems = [
  { id: 'import', icon: 'file-import', label: 'Nhập khẩu từ Excel' },
  { separator: true },
  { id: 'print',  icon: 'printer',     label: 'In danh sách' },
]
```

Props mới:
- `hide-ai` (Boolean, mặc định `false`) — ẩn nút "Gợi ý AI" khi app chưa có tính năng AI (KHÔNG để nút không hoạt động)
- `filter-count` (Number, mặc định `0`) — số điều kiện lọc nâng cao đang áp dụng → nút Bộ lọc chuyển trạng thái active + badge số
- `bulk-action` (Boolean) — khi `true`, toàn bộ nội dung header bị thay bằng Bulk Action bar
- `selected-count` (Number) — số dòng đang được chọn, hiển thị trong "Đã chọn N"
- `@deselect-all` — emit khi click "Bỏ chọn"; handler: `selected = []` (selectAll là computed, tự reset)

**Bulk Action bar layout (từ Figma):**
`[Search 200px] | [Đã chọn N] [Bỏ chọn] | [bulk-buttons slot]`

**Rule:** `bulk-action = selected.length > 0` — tự động chuyển mode khi user tick/bỏ tick.

---

### Quy tắc Bulk Action theo loại màn hình

| Loại màn hình | Cách xử lý Bulk Action |
|---------------|------------------------|
| **Màn hình CÓ tab** (sub-nav trên cùng) | Dùng `TableHeader` với `:bulk-action` + `:selected-count` + `@deselect-all` + slot `#bulk-buttons`. Chỉ vùng TableHeader thay đổi, phần tab + KPI vẫn giữ nguyên. |
| **Màn hình KHÔNG có tab** (có PageHeader riêng) | Khi tick chọn dòng → đổi `type` của `PageHeader` thành `"Bulk Action"`. Toàn bộ PageHeader bị thay bằng bulk action bar (search + Đã chọn N + Bỏ chọn + buttons). |

**PageHeader props (Figma node 6019:196418):**
- `type="List Page"` — tiêu đề trang + action buttons (Add, Import, dots) ở phải
- `type="Form Page"` — back icon + tiêu đề + layout controls
- `type="View Detail Page"` — back icon + tiêu đề + Sửa/Save/dots
- `type="Bulk Action"` — toàn bộ header bị thay bằng `[search 200px] | [Đã chọn N] [Bỏ chọn] | [bulk buttons]`

> **Lưu ý:** `PageHeader` chưa được xây. Khi nhận màn hình dạng này → báo user để build trước khi vẽ màn hình.

### AppCombobox — độ rộng danh sách & nền mục đã chọn
- **Danh sách xổ xuống của Combobox (AppCombobox):** rộng **tối thiểu = bề rộng ô combobox**; dữ liệu dài → danh sách **giãn rộng hơn ô** theo chữ dài nhất (tới 480px, quá nữa thì xuống dòng) để đọc trọn, không cắt chữ; luôn nằm trong màn hình (không đủ chỗ bên phải → canh mép phải theo ô, giãn sang trái; cách mép 8px). Có sẵn trong mds-ui — ⛔ không ép `width` danh sách bằng đúng ô ở app.
- **Nền mục đã chọn (chọn nhiều — AppCombobox `multiple`, DropdownMenu `checked`):** các mục đã chọn **liền nhau nối nền thành 1 khối** — chỉ bo 2 góc trên của mục đầu và 2 góc dưới của mục cuối, mục ở giữa không bo (không thành từng viên rời có khe bo). Chọn 1: mục đã chọn bo đủ 4 góc. Có sẵn trong mds-ui.

### AppCombobox — nút bỏ chọn (×) & mục 2 dòng
- **Nút × CHỈ có ở ô tìm kiếm** (AppSearchbox, ô tìm của TableHeader — hiện sẵn khi có chữ). Ô nhập chữ, Combobox, Datebox… KHÔNG có × `.ibox__icon--clear` (AppTextbox `clearable` chỉ cho `type="search"`, Combobox `clearable` mặc định `false`); về rỗng bằng mục đầu danh sách: ô lọc “…: Tất cả” tự có mục “Tất cả”, trường cần bỏ gán dùng `empty-option="Chưa giao"`. Chọn nhiều: × trên từng thẻ.
- **Mục 2 dòng trong danh sách xổ ra** (tên + mã / email / mô tả — AppCombobox có `description`, danh sách chọn người / dự án): **cao theo nội dung** = đệm 6 + dòng 20 + khe 2 + dòng 20 + đệm 6 (54px), cả 2 dòng `line-height: var(--text-body-lh)`. ⛔ Không dùng `min-height` của mục 1 dòng theo mật độ (`--menu-item-h`) cho mục 2 dòng — chữ 2 dòng sẽ dính nhau (lỗi đã gặp ở “Thêm dự án”). Ô tìm kiếm đầu menu cách danh sách 8px.

### AppCombobox — danh sách dạng cây (cha › con)

```js
options = [{ value, label: 'Khối A › Nhóm 1', text: 'Nhóm 1', depth: 1, parent: false }, …]   // xếp cha trước con
```
- `depth` > 0 → thụt lề + ↳; `text` = tên ngắn hiện trong danh sách; `label` = đường dẫn đầy đủ (hiện khi đã chọn và khi gõ tìm, để không nhầm mục trùng tên); `parent: true` → in đậm.
- Option không có các trường này hiển thị như cũ.
- Prop `collapsible` → **cây co / giãn**: mục `parent` có mũi tên ▸/▾ (bấm mũi tên để co/giãn, bấm tên để chọn); mở danh sách co hết, chỉ mở nhánh chứa mục đang chọn; phím → / ← mở / co; đang gõ tìm thì hiện hết mục khớp (đường dẫn đầy đủ).

### AppImageUpload — chọn ảnh (logo, ảnh đại diện…)

```vue
<AppInput label="Logo dự án">
  <AppImageUpload v-model="form.logo" :placeholder-text="initials" />
</AppInput>
```
- Nhận **SVG / PNG / WebP / JPG** — bấm chọn file, **kéo thả**, hoặc **dán ảnh (Ctrl/Cmd + V) ở bất kỳ đâu trong hộp thoại** (trừ khi đang gõ trong ô chữ).
- `v-model` = data URL (`''` = chưa có ảnh). Ảnh bitmap tự thu nhỏ về `maxSize` (mặc định 256px) → WebP; SVG giữ nguyên, tối đa `maxSvgKb` (150 KB).
- Props: `size` (khung xem trước, 64) · `placeholderText` (chưa có ảnh → chữ cái đầu) · `hint`.
- Máy chủ PHẢI kiểm tra lại: chỉ nhận `data:image/(png|jpeg|webp|svg+xml);base64,…` và giới hạn dung lượng. Hiển thị ảnh bằng `<img>` (không chèn SVG thô vào DOM).

**Avatar nhiều màu trong danh sách:** cột avatar thêm `avatarColor: 'auto'` → màu cố định theo tên (mẫu: card “Nhân viên bán hàng xuất sắc” ở /ds/data-visualization).

**Logo trong bảng:** cột `type: 'avatar-subtext'` (hoặc `avatar-text`) + `avatarSquare: true` → ô vuông bo góc, ảnh hiện trọn (`object-fit: contain`); trống ảnh → chữ cái đầu như avatar.

### Avatar chữ cái đầu — 1 quy tắc chung (`@mds/utils/avatar.js`)

```js
import { avatarInitials, avatarColor } from '@mds/utils/avatar.js'
avatarInitials('Trần Hậu')   // 'TH' — chữ đầu tối đa 2 từ, viết hoa
avatarColor('Trần Hậu')      // { bg, fg } — 8 tone, hash theo tên
```
- Mọi avatar (DataTable, header, danh bạ chat, danh sách người dùng…) dùng CHUNG util này — không chép lại bảng màu.
- **Quy chuẩn Figma “_Avatar Type Item” (node `6019:6149`)** — tròn, 3 loại × 9 cỡ (12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 80):
  | Loại | Khi nào | Viền | Nội dung |
  |---|---|---|---|
  | Image | có ảnh | 1px `--stroke-neutral` | ảnh phủ kín (`object-fit: cover`); ảnh lỗi → Initials |
  | Initials | không ảnh, có tên | 1px trắng (tách khỏi nền / avatar cạnh) | chữ cái đầu `--text-primary` Medium · nền `avatarColor(name).bg` |
  | Empty | không ảnh, không tên | 1px trắng | hình người xám (`mds-ui/src/assets/avatar-empty.png`) |
  Cỡ chữ Initials: 12/16 → 8px · 20/24 → 10px · 32/40 → 12px · 48 → 16px · 56 → 20px Semibold · 80 → 40px.
  **Hover + Active** (avatar bấm được / đang chọn — `interactive` / `active`; Figma _Avatar Type Item 6019:6149, có đủ 3 loại Ảnh · Chữ cái · Trống): vòng **Stroke/Brand Light** dày 2px nằm NGOÀI khung (viền 1px đổi màu + `box-shadow: 0 0 0 1px`). ⛔ Không tăng `border-width` — viền dày thêm nằm trong khung làm ẢNH CO LẠI khi rê chuột (nhảy hình); không tự viết hover riêng cho avatar.
  CHỈ dùng 9 cỡ trên — không tự chọn 28, 36, 64…
- **Component dùng chung `AppAvatar`** (`@mds/components/AppAvatar.vue`) — avatar người ở mọi chỗ ngoài DataTable: `<AppAvatar :name :src :size="40" interactive />`. Tự chọn loại Image / Initials / Empty. ⛔ KHÔNG tự dựng `<span class="xxx-avatar">` + viền / shadow riêng — chỉ được chỉnh khoảng cách quanh avatar.
- Avatar nhóm chồng nhau dùng viền trắng 2px tách lớp; logo / ảnh vuông (không phải người) không viền.

### AppSidebar — menu con
**Menu con trên Sidebar chính (`item.children`)** — phân hệ có nhiều nghiệp vụ con (VD “Đề xuất” → Tiếp nhận chính thức, Ký mới hợp đồng…):
```js
{ id: 'de-xuat', label: 'Đề xuất', icon: 'bulb', children: [
  { id: 'de-xuat-tiep-nhan', label: 'Tiếp nhận chính thức' },
  { separator: true },
  { id: 'de-xuat-ky-moi-hd', label: 'Ký mới hợp đồng' }, …
] }
```
- Rê chuột vào mục → menu con xổ sang **phải, sát mép sidebar (0px)**, item đầu thẳng hàng mục sidebar (sát đáy màn hình thì tự đẩy lên); rời mục / menu → đóng sau 150ms. Bấm mục cũng mở (cảm ứng / bàn phím), Esc đóng. Chọn mục con → `@nav(child.id)`.
- Menu con theo **đúng chuẩn menu xổ ra** (`.dropdown-menu.sidebar-flyout`: bo Radius/Default, `--shadow-popover`, đệm 8px, item 32px xếp sát nhau, nhóm ngăn bằng Divider; rộng tối thiểu 240px); mục có menu con có mũi tên › cuối mục, không tooltip; sidebar thu gọn giữ mở rộng trong lúc menu con đang mở; mục cha sáng khi đang ở 1 mục con.
- Danh sách phân hệ sidebar khai báo **1 nơi** trong app (VD `src/data/sidebar.js`) — mọi màn import chung, không chép lại.
- **`children-mode="accordion"`** (thêm 02/11/2026) — menu dài nhiều nhóm (VD trang tài liệu `/ds`): mục cha có icon + mũi tên ⌄, bấm → **mở / đóng danh sách con ngay bên dưới** (không xổ sang phải). Mục con thẳng hàng chữ mục cha (đệm trái 40px), cao tối thiểu 32px, chữ dài **xuống dòng** (không cắt → không cần tooltip); đang xem: nền brand nhạt + chữ brand đậm (sidebar tối: nền trắng mờ + vạch brand trái). Nhóm chứa mục đang xem **tự mở**, mục cha của nó đổi chữ / icon màu brand (`.sidebar-item--parent-active`); nhóm đang mở nhớ theo `storage-key` + `-open`. Sidebar thu gọn: chỉ còn cột icon, rê vào giãn ra hiện nhóm + mục con như thường. Mục con có `href` → `<a>` (Ctrl/Cmd + bấm mở tab mới; bấm thường emit `nav`). ⛔ Không tự dựng menu trái riêng có nhóm — dùng chế độ này.
- **Sidebar tối chỉ đi với header trắng** — header màu thì sidebar luôn sáng (`theme.js` tự khóa, `sidebarDarkAllowed(headerMode)`).
- **Sidebar tối riêng 1 khung** (VD ví dụ trong tài liệu, ảnh xem trước): bọc `<div class="sidebar-scope" data-sidebar="dark">` — cùng bộ màu với khi chọn “Tối” cho cả app (`data-sidebar="dark"` trên `<html>`), không đổi thiết lập của trang.
- **Cấp 3 · nhóm · icon mục con** (thêm 04/11/2026):
  - **Cấp 3:** mục con có `children` → accordion: bấm mở / đóng ngay bên dưới (mũi tên ⌄, thụt thêm 16px; mục cấp 2 có icon thì cấp 3 thẳng hàng chữ của nó); flyout: rê / bấm → xổ tiếp menu cấp 3 sát phải menu cấp 2 (hết chỗ thì xổ sang trái). Đường tới mục đang xem tự mở; mục cha có cấp con đang xem đổi chữ brand. Số đếm cộng dồn qua mọi cấp. Tối đa 3 cấp.
  - **Nhóm:** `{ group: 'Tên nhóm' }` trong `items` → tiêu đề nhóm chữ Caption Medium (`--text-caption` + `--fw-medium`) VIẾT HOA (text-transform: uppercase — dữ liệu vẫn viết thường) màu phụ, đệm trên 12 (cách nhóm trên 16) · sát mục của nhóm 4 (sidebar thu gọn → vạch ngang ngăn nhóm); trong `children` → tiêu đề nhóm nhỏ trong danh sách con / menu xổ. `{ separator: true }` = vạch ngăn.
  - **Icon mục con:** `icon` ở mục cấp 2 / 3 là tùy chọn — có thì icon 20 Neutral trước chữ, không thì chỉ chữ (cùng 1 danh sách nên thống nhất: có thì có hết).
  ```js
  { id: 'stock', icon: 'package', label: 'Kho vật tư', children: [
    { group: 'Nhập xuất' },
    { id: 'stock-in', icon: 'arrow-down', label: 'Nhập kho', children: [{ id: 'in-buy', label: 'Nhập mua hàng', count: 120 }, …] },
    { id: 'stock-check', icon: 'clipboard-list', label: 'Kiểm kê kho' },
  ] }
  ```
- **Sidebar tối (`data-sidebar="dark"`):** menu con xổ sang phải cũng nền tối #1C1E26 (AppSidebar tự gắn `.sidebar-flyout--dark`), mục trong menu chữ trắng 70% · hover trắng 6% · đang chọn trắng 20% + vạch màu theme; mục cha đang mở menu nền trắng 6%, chữ + icon trắng (KHÔNG dùng Brand Light trên nền tối).
- **Kích thước mục (chốt 03/11/2026):** mục sidebar (cha & con) **LUÔN cao 36px cố định — KHÔNG theo mật độ hiển thị** (Nhỏ / Trung bình / Rộng đều 36), cách nhau **4px** (bước 40px) — nền hover / active đúng 36px. ⛔ Không dùng `--btn-height` / token mật độ cho mục sidebar. Đo ở cả 3 mật độ: `getBoundingClientRect().height === 36`, khoảng cách top 2 mục liền nhau = 40.
- **Lề trong `.sidebar-inner` (sửa 02/11/2026):** mở rộng (ghim hoặc rê) **trên / trái / phải 16px**; thu gọn **trên 16px, trái / phải 12px** (mục rộng 40px trong cột 64px). Có sẵn trong mds-ui — app không tự đặt padding sidebar.
- **Thanh cuộn sidebar:** mảnh, **ẩn khi không rê chuột, rê vào sidebar thì hiện** (rãnh chừa sẵn bằng `scrollbar-gutter: stable` → hiện / ẩn không xô mục; đệm phải còn 5px để lề phải vẫn ~16px). Có sẵn trong mds-ui — không tự style thanh cuộn sidebar ở app.
- **Số đếm bên phải mục (`count`, thêm 02/11/2026)** — số việc cần xem / chờ duyệt: `{ id, label, icon, count: 12 }` (mục chính, mục con, menu con xổ ra đều nhận). Ô số đỏ (`--bg-danger`, chữ trắng 13 semibold, cao 20, bo `--radius-default`) **sát lề phải mục**, trước mũi tên ⌄ / › 4px; mục không có mũi tên thì số nằm **đúng chỗ mũi tên** (sát lề phải) — số của mục có con lệch vào 20px so với mục khác là **chấp nhận** (người dùng chốt 03/11/2026, ⛔ không chừa cột mũi tên trống ở mục không có con); > 99 → “99+”; 0 / trống → ẩn; định dạng `fmtNum`. Mục cha KHÔNG đặt `count` → tự hiện **tổng số của các mục con**, nhóm đang mở thì ẩn tổng (đã thấy số từng mục con, không đếm 2 lần). Sidebar thu gọn (chưa rê): **Badge Dot** — chấm đỏ 8px ở góc trên phải icon (mép phải chấm = mép phải icon, nhô lên 2px), viền nền 2px, **không hiện số** cho gọn; rê vào / mở rộng mới thấy số (chấm vẫn có `aria-label` số mục). `badge: 'Mới'` (nhãn chữ xanh cạnh tên) khác `count` — đừng dùng badge để hiện số. Ví dụ chạy thật: `/ds/sidebar` › Ví dụ trực quan.
- **`force-expanded`**: luôn mở rộng + ẩn nút thu gọn — khi sidebar nằm trong ngăn trượt ở màn hẹp (≤ 1024px). App cần sidebar mở rộng rộng hơn 200px (tên mục dài) → đặt lại `--layout-sidebar-w` ở `:root` của app (VD tài liệu 260px).

### AppAvatarCropper — cắt ảnh đại diện (khung tròn)

```vue
<AppAvatarCropper ref="cropper" @change="picked = true" />
<!-- Lưu: const dataUrl = cropper.value.crop()  → null nếu không nén được dưới maxKb -->
```
- Chọn ảnh PNG / JPG / WebP: bấm, kéo thả hoặc dán (Ctrl/Cmd + V). Kéo để căn mặt vào vòng tròn, thanh trượt / lăn chuột để phóng to (1–4×); ảnh luôn phủ kín khung.
- Cắt + thu nhỏ NGAY TRÊN MÁY → ảnh vuông `output` px (mặc định 256) dạng WebP, tự giảm chất lượng cho ≤ `maxKb` (500). Ảnh chọn vào tối đa `maxInputMb` (10 MB, chỉ đọc trên máy).
- Máy chủ PHẢI kiểm tra lại định dạng + dung lượng (≤ 500 KB). Không ghi đè ảnh tự tải lên (data URL) bằng ảnh đăng nhập Google.

### RouteProgress + PageSkeleton — tín hiệu tải trang (BẮT BUỘC cho app nhiều trang)

```js
// main.js
import { installRouteProgress } from '@mds/utils/routeProgress.js'
installRouteProgress(router)            // { delay: 80, slowAfter: 350 }
```
```vue
<!-- App.vue -->
<RouteProgress />
<RouterView />

<!-- AppShell: sidebar sáng ngay mục được bấm + skeleton khi chờ lâu -->
<AppSidebar :active-id="(routeProgress.target || route.path).split('/')[1]" … />
<main class="main-content">
  <slot />
  <PageSkeleton v-if="routeProgress.slow" :cards="4" />   <!-- cards=0 nếu trang không có dãy card KPI -->
</main>
```
- `routeProgress` (reactive): `target` path đang chuyển tới · `active` (> 80ms → thanh tiến trình) · `slow` (> 350ms → skeleton). Chuyển nhanh thì không nháy.
- Chỉ đổi query (lọc, tab con) không tính là chuyển trang.
- Khối xương lẻ dùng class `.skel` (+ `.skel--title|sm|xs|num|search|btn|avatar|cell`) — có vệt sáng chạy, tắt khi `prefers-reduced-motion`.
- F5: đặt khung xương tĩnh trong `#app` của index.html (style nội tuyến vì CSS app chưa tải).
- ⛔ Khung xương CHỈ phủ vùng nội dung (`main.main-content` / vùng cha có `position: relative`) — header + sidebar giữ nguyên, sidebar sáng ngay mục được bấm. Không phủ / tải lại cả trang khi chuyển mục.
- **Tải xong không được giật:** màn có bố cục cố định (Tổng quan, chi tiết) → khung xương nằm **trong chính các thẻ thật** (prop `loading` của màn), phần tĩnh (tiêu đề trang, bộ lọc, tên biểu đồ) hiện luôn; mỗi dòng khung xương cao đúng line-height chữ thật (`.db-sk-line` 20 · 28 · 20), ô icon đúng 40, vùng biểu đồ không vượt vùng thật; cụm nút ẩn bằng `visibility: hidden` (giữ chỗ). Kiểm tra: đo vị trí mọi thẻ lúc đang tải và lúc xong → phải trùng. `PageSkeleton` (list / `variant="dashboard"`) chỉ dùng khi chưa dựng được khung trang.

### Combo đang tải dữ liệu — AppCombobox `loading`
```vue
<AppCombobox v-model="kh" :options="khList" :loading="loadingKh" @open="loadKh" />   <!-- tải khi mở -->
<AppCombobox v-model="nv" :options="nvList" multiple tag-avatar :loading="loadingNv" @open="loadNv" />
```
Trong lúc `loading`: danh sách xổ ra hiện **vòng xoay nhỏ ở giữa** (`.spinner--sm`, KHÔNG dùng khung xương cho combo), không hiện “Không có lựa chọn phù hợp”. Tải xong → tự canh lại vị trí + chọn sẵn mục đang chọn. `@open` phát mỗi lần mở danh sách.

**Spinner dùng chung** (`.spinner`, quy chuẩn /ds/loading): vòng tròn hở 1/4 xoay đều, màu Icon/Brand · cỡ thường 40 viền 3 (màn / popup chi tiết đang tải) · `.spinner--sm` 20 viền 2 (trong control). `AppButton loading`: vòng xoay thay chỗ chữ, giữ nguyên bề rộng nút.

### TablePaging ✦ Dùng DUY NHẤT component này cho toàn bộ paging
```vue
<TablePaging
  :total="totalCount"
  v-model:page="currentPage"
  v-model:page-size="pageSize"
  :page-size-options="[20, 50, 100]"
/>
```
Props:
- `total` — tổng số bản ghi
- `page` (v-model) — trang hiện tại, bắt đầu từ 1
- `page-size` (v-model) — số dòng/trang
- `page-size-options` — mảng options, default `[20, 50, 100]`
- `type` — `'basic'` (mặc định, **dạng ngắn gọn**: khoảng `1 - 10` + nút đầu / trước / sau / cuối) | `'advance'` (**dạng số**, Figma Paging Type=Advance 45296:28045): bỏ khoảng bản ghi, thêm dãy số trang giữa nút trước / sau. Dùng `advance` cho app cần xử lý / xuất khẩu lần lượt từng trang (VD Kế toán). DataTable dựng sẵn: `pagination paging-type="advance"`; `AppPagination` cũng có prop `type`.
  - Dãy số (`utils/pageNumbers.js`): luôn có trang đầu + cuối, giữa là 3 trang bắt đầu từ trang đang xem (`1 2 3 … 20` · `1 … 5 6 7 … 20` · `1 … 18 19 20`); trống ≥ 2 trang → “…”, trống 1 trang → hiện số. Ô số `.paging-num` cao `--btn-height`, bo 8, chữ 13/20 số đều; trang đang xem `.paging-num--on` chữ Brand Bold gạch chân; hover Neutral Light / nhấn Neutral Pressed như Button Icon; nhóm nút liền nhau (gap 0). Thanh hẹp tự bớt số trang (còn đầu / đang xem / cuối, rồi chỉ trang đang xem).

Giao diện (Figma Paging trong Data Table 6435:22421): cao `--paging-h` (48 · Nhỏ 40 · Rộng 56), đệm ngang `--paging-px` (16 · Nhỏ 12 · Rộng 16), gap 8px, nền trắng, **KHÔNG có viền trên** (dòng cuối bảng / dòng Tổng đã có viền dưới); "Tổng số: 10" — nhãn và số cách 4px. Đặt NGAY SAU khung cuộn của bảng (ngoài `.datatable`) để luôn đứng yên ở đáy.

**Nhớ số dòng/trang theo người dùng (có sẵn, thêm 03/11/2026):** `TablePaging` / `AppPagination` (cả DataTable `:pagination`) tự **lưu giá trị chọn gần nhất** và **tự áp khi mở mọi danh sách** (giá trị không có trong `page-size-options` của bảng đó → giữ mặc định). App lưu theo TÀI KHOẢN bằng `app.provide('pageSizeStore', { get() → number | null, set(n) })` (`get` đọc dữ liệu reactive để đăng nhập xong tự áp) — VD PD Point: `store/pageSizePref.js` lưu `user.prefs.pageSize` trên máy chủ (`PUT /api/me/prefs { pageSize }`) + bản sao localStorage `pdpoint-pagesize:<id>`. Không provide → nhớ theo trình duyệt (localStorage `mds-page-size`). Composable bảng tự viết nên khởi tạo `pageSize` từ store (VD `useTableView`) để khỏi nháy 20 dòng rồi mới đổi. ⛔ Không tự lưu số dòng/trang riêng ở từng trang.

### CollapseExpandPanel
```vue
<CollapseExpandPanel
  :type="isOpen ? 'Collapse' : 'Expand'"
  position="Top"
  bg-color="Gray"
  @click="isOpen = !isOpen"
/>
```
Props:
- `type`: `'Collapse'` | `'Expand'`
- `position`: `'Top'` | `'Bottom'` | `'Left'` | `'Right'`
- `bg-color`: `'Gray'` (default) | `'White'` (khi nằm trên nền xám)

Icon logic:
| position | type=Collapse | type=Expand |
|----------|---------------|-------------|
| Bottom | chevron-up | chevron-down |
| Top | chevron-down | chevron-up |
| Left | chevron-right | chevron-left |
| Right | chevron-left | chevron-right |

### DropdownMenu
```vue
<DropdownMenu :items="items" placement="bottom-end" :min-width="180">
  <template #trigger="{ toggle }">
    <button class="btn-icon btn-icon--outline" @click.stop="toggle">
      <TIcon name="dots" />
    </button>
  </template>
</DropdownMenu>
```
Item format: `{ id, icon, label, danger?, ai?, checked?, disabled?, tag? }` hoặc `{ separator: true }`. `ai: true` → mục chức năng dùng AI: chữ + icon theo gradient AI (xanh → tím), hover nền gradient nhạt (VD “Nhập từ ảnh chụp (AI)”, icon `sparkles`). `checked: true` → chọn nhiều: nền brand nhạt + chữ brand đậm + ✓ cuối dòng. `:active-id` → mục đang chọn (chọn 1).

**Menu chuột phải** — dùng chính DropdownMenu, mở tại con trỏ:
```vue
<DropdownMenu ref="ctxMenu" :items="rowMenu" @select="onRowAction">
  <template #trigger><div class="dt-row" @contextmenu.prevent="ctxMenu.openAt($event)">…</div></template>
</DropdownMenu>
```
`openAt(event)` tự lật menu vào trong màn hình. KHÔNG tự dựng popup menu chuột phải riêng.

#### Chuẩn MỌI menu xổ ra — Figma MDS “Dropdown Menu” (node 6019:42469)
Áp cho menu nút 3 chấm, menu chuột phải, danh sách Combobox, menu tiêu đề cột bảng, popover chọn người, và MỌI menu tự dựng trong app:

| Phần | Giá trị | Token |
|---|---|---|
| Khung | nền trắng, bo **Radius/Default** (8px · Nhỏ 6px), bóng **Drop Shadow / Neutral / Bottom 12**, **KHÔNG viền**, rộng tối thiểu 200px (Min-Width 80 · Rộng 96) | `--menu-radius`, `--shadow-popover`, `--menu-min-w` |
| Đệm khung danh sách | **8px** đều 4 phía | `--menu-pad` |
| Giữa các item | **0** — item xếp sát nhau (7 item × 32 = 224) | `--menu-gap` |
| Item | cao **32px** (Nhỏ cũng 32 · Rộng 36; dòng có chữ phụ 48 · Rộng 52) — **KHÔNG theo `--btn-height`**, đệm ngang **12px** (Rộng 16), bo Radius/Default, icon ↔ chữ 8px, chữ 13/20 Regular | `--menu-item-h`, `--menu-item-h-2`, `--menu-item-px`, `--menu-item-gap`, `--menu-radius` |
| Icon trái | **20px**, màu `--icon-neutral` | `--menu-icon` |
| Hover / phím ↑↓ | nền **brand nhạt** (`--bg-brand-light`) — KHÔNG dùng nền xám | |
| Đang chọn | nền brand nhạt + chữ **brand Semibold**; chọn nhiều thêm **✓ 16px** cuối dòng | |
| Nguy hiểm (Xoá…) | chữ + icon `--text-danger` | `danger: true` |
| Ngăn nhóm | **Divider** 1px `--stroke-divider`, cách item trên / dưới **4px** (Padding-Vertical-Small · Rộng 8). Không dùng khoảng trống thay vạch ngăn | `--menu-sep-my` · `{ separator: true }` |
| Ô tìm kiếm trong menu | trên cùng, đệm **4 · 12 · 8 · 12** (trái/phải theo `--menu-item-px`) | |

Nguồn: Figma MDS “Dropdown Menu” `6019:42469` + biến `Components/Menu List/*` (đọc lại 2026-10-30). Popover dạng thẻ (hồ sơ, lịch chọn ngày, panel công cụ) KHÔNG phải menu → bo `--radius-dialog`.

**⛔ Mọi danh sách xổ ra đều theo Menu List — kể cả popover dạng thẻ có danh sách bấm được** (menu tài khoản trên header, bảng thông báo, "đang hoạt động", việc cần làm, chọn người…): khung đệm **`--menu-pad` (8px)** 4 phía, item đệm ngang `--menu-item-px` + **bo `--menu-radius`** → **hover / nền chọn / nền chưa đọc KHÔNG chạm 2 mép trái phải** (lỗi đã gặp: item `padding: 0 16px` sát mép khung `padding: 4px 0`). Hover = nền **brand nhạt** (`--bg-brand-light`; item đã có nền brand nhạt như thông báo chưa đọc → hover đậm hơn 1 bậc `color-mix(in srgb, var(--bg-brand) 12%, var(--bg-white))`), không dùng nền xám. Khung **không viền**, bóng `--shadow-popover`. Ngăn nhóm: Divider trong vùng đệm (`margin: var(--menu-sep-my) 0`), không kẻ vạch tràn mép giữa các item. Test: mở từng menu, đo `item.left − pop.left ≥ 8` và `pop.right − item.right ≥ 8`, `border-radius` ≠ 0, ở 1366 + 375.

**⛔ Lớp chồng (z-index):** menu / popover xổ từ **header** (tài khoản, thông báo, đang hoạt động, tiện ích, chọn vai trò…) LUÔN nằm trên drawer và panel chat / AVA → dùng `z-index: var(--z-header-pop)` (9600) **và Teleport ra `body`** (để trong header thì bị z-index 100 của header giới hạn → drawer đè lên, lỗi đã gặp). Thang chung trong mds-ui: nội dung < header 100 < drawer `--z-drawer` 900 < dialog `--z-dialog` 1000 < panel chat / AVA `--z-side-panel` 1050 < menu header `--z-header-pop` 9600 ≈ menu / combobox / lịch < tooltip < toast. Test: mở drawer (+ panel chat) rồi mở từng menu header, `document.elementFromPoint` ở giữa / các góc menu phải thuộc menu.

Menu tự dựng trong app → dùng các token trên (`--menu-pad`, `--menu-item-h`, `--menu-item-px`, `--menu-radius`, `--shadow-popover`), KHÔNG gõ `box-shadow`/`padding` tay. Lưu ý: `.menu-list` (Sub Menu đặt trong card, không phải menu xổ ra) theo chuẩn riêng — xem **Sub Menu** bên dưới.

### Sub Menu — menu điều hướng BÊN PHẢI Sidebar chính (Figma MDS “Sub Menu” node 8266:95709)
**BẮT BUỘC** cho MỌI menu dọc nằm cạnh phải Sidebar chính / bên trái vùng nội dung: mục lục màn chi tiết (VD Chi tiết hồ sơ), menu cài đặt, menu danh mục, menu nhóm báo cáo… Dùng dạng **1 cột, ẨN Title** (không tiêu đề nhóm). KHÔNG tự dựng menu dọc khác.
```vue
<aside class="card sub-menu">
  <AppSearchbox v-model="q" placeholder="Tìm kiếm" />   <!-- tuỳ chọn: danh sách dài -->
  <nav class="menu-list">
    <button v-for="s in items" :key="s.id" class="menu-list__item"
      :class="{ 'menu-list__item--active': s.id === activeId }"
      v-tip="s.title.length > 28 ? s.title : ''" @click="go(s.id)">
      <TIcon v-if="s.icon" :name="s.icon" />           <!-- icon trái 16px (tuỳ chọn) -->
      <span class="menu-list__label">{{ s.title }}</span>   <!-- LUÔN bọc span: 1 dòng, cắt … -->
    </button>
  </nav>
</aside>
```
| Phần | Giá trị |
|---|---|
| Khung | `.card` (nền trắng, bo 8px, shadow Neutral All 2, đệm **16px**) + `.sub-menu` (ô tìm → danh sách cách 8px) |
| Item (Tab Vertical Item · Filled Horizontal) | cao **36px** cố định (như mục Sidebar, không theo density), đệm ngang **12px**, bo **8px**, icon trái **16px** cách chữ 8px, chữ 13/20 |
| Giữa các item | **4px** |
| Hover / Nhấn | nền `--bg-neutral-light` / `--bg-neutral-pressed`, chữ giữ màu thường |
| Đang chọn | nền `--bg-brand-light` + chữ `--text-brand` **Bold (700)**, icon brand |
| Chữ dài | 1 dòng + “…”, tooltip hiện đủ tên — KHÔNG để xuống dòng làm vỡ chiều cao 36px |

### AppRadio (thêm 03/11/2026)
```vue
<div class="radio-group" role="radiogroup" aria-label="Loại khách hàng">   <!-- dọc: thêm radio-group--vertical -->
  <AppRadio v-for="o in KINDS" :key="o.value" v-model="kind" :value="o.value" :label="o.label" name="kind" />
</div>
```
- Chọn DUY NHẤT 1 trong nhóm. Props: `modelValue` / `value` / `label` / `name` (cùng name → phím mũi tên chuyển lựa chọn như radio gốc) / `disabled` / `error` (viền đỏ — câu báo lỗi đặt dưới nhóm).
- Kích thước Figma (có sẵn): vòng 16 · chấm 8 (Rộng 20 · 10) · cách chữ 8 · nhóm ngang cách 24 (Rộng 32) · nhóm dọc cách 8 (Rộng 12). Chữ 13px. ⛔ Không tự vẽ radio bằng CSS riêng / `<input type="radio">` trần (trừ ô chọn trong DataTable `.dt-radio`).

```vue
<!-- body row: @click.stop đặt trên div bọc ngoài, KHÔNG đặt trên <AppCheckbox> -->
<div class="dt-cell" style="width:44px" @click.stop>
  <AppCheckbox v-model="selected" :value="rowIndex" />
</div>

<!-- header: dùng selectAll computed (xem Section 5 — Table state) -->
<AppCheckbox v-model="selectAll" />
```

**Button Focus** (Figma Button State=Focus 6019:11920, mọi màu × Solid / Outline / Text; **nút icon `.btn-icon` mọi kiểu và `.btn-icon-white` của header cũng theo đúng quy tắc này**): `.btn:focus-visible, .btn-icon:focus-visible, .btn-icon-white:focus-visible` vẽ khe TRẮNG 2px (`--white`) + viền `--stroke-brand` 2px, bo ngoài Radius/Ring Focus 12 (box-shadow tự nới bo theo nút), chỉ hiện khi Tab. ⛔ Không viết `outline` riêng / để vòng mặc định của trình duyệt cho nút (khe trong suốt, sai Figma).

**Checkbox Disabled** (Figma Checkbox 6019:33623): chưa chọn = nền `--bg-neutral-light` + viền `--stroke-neutral`; **đã chọn / một phần = nền `--bg-brand-disable`** (tick / gạch trắng) — ⛔ không để nền xám cho ô đã chọn (tick trắng biến mất, nhìn như ô trống); chữ nhãn GIỮ màu Primary (không đổi màu disabled); bo ô `--radius-sm` 4px, chữ nhãn `--text-body` 13px; con trỏ cấm + nên có tooltip nói lý do không đổi được.

### TIcon
Icon soạn thảo (thêm 02/11/2026 cho CMS tài liệu): `device-floppy` (Lưu), `menu-2` (mở menu trái màn hẹp), `bold`, `italic`, `list-numbers`, `h-2`, `h-3`, `code`, `quote`, `layout-grid`, `columns-2`.
```vue
<TIcon name="icon-name" />
```

> ⛔ **RULE BẮT BUỘC — ICON PHẢI CÓ TRONG MAP của TIcon.vue**
>
> `TIcon` KHÔNG tự resolve bất kỳ tên icon nào — chỉ render được các tên đã có trong `MAP` tại `mds-ui/src/components/TIcon.vue`.
> - Trước khi dùng `<TIcon name="xyz" />`, **tra bảng bên dưới** xem `xyz` có trong MAP chưa.
> - Nếu chưa có → **thêm vào TIcon.vue trước**: `import IconXxx from '@tabler/icons-vue/dist/esm/icons/IconXxx.mjs'` (import TỪNG icon, KHÔNG import cả bộ) + thêm vào MAP.
> - NGHIÊM CẤM dùng icon name tuỳ tiện mà không verify — icon sẽ render trống, không có lỗi console.
>
> **SIDEBAR ĐẶC BIỆT — BẮT BUỘC TUYỆT ĐỐI:**
> - Mọi `sidebarItem` PHẢI có `icon` hợp lệ trong MAP.
> - Khi thêm module mới vào sidebar, PHẢI thêm icon tương ứng vào TIcon.vue cùng lúc.
> - Sidebar không có icon = lỗi nghiêm trọng, không được deploy.

**Bảng icon đã có trong MAP (cập nhật 2026-05-26):**

| Tên (name) | Dùng cho |
|------------|----------|
| `layout-dashboard` | Tổng quan / Dashboard |
| `home` | Trang chủ |
| `sitemap` | Quy hoạch / Sơ đồ tổ chức |
| `ladder` | Kế cận / Thăng tiến |
| `users` | Nhân sự / Nhóm |
| `users-group` | Nhóm người dùng |
| `user-circle` | Hồ sơ cá nhân |
| `user-plus` | Hội nhập / Tuyển dụng / Thêm NV |
| `user-minus` | Miễn nhiệm |
| `user-check` | Bổ nhiệm / Phê duyệt NV |
| `user-off` | Vô hiệu hóa tài khoản |
| `id-badge-2` | Hồ sơ nhân viên |
| `door-exit` | Nghỉ việc / Đăng xuất |
| `transfer` | Thuyên chuyển |
| `arrows-left-right` | Chuyển đổi / Điều chuyển |
| `medal` | Khen thưởng |
| `heart-handshake` | Phúc lợi |
| `diamond` | Kho tiềm năng |
| `shirt` | Đồng phục |
| `bulb` | Đề xuất / Ý tưởng |
| `scale` | Định biên / Cân bằng |
| `award` | Danh hiệu / Giải thưởng |
| `file-certificate` | Hợp đồng / Chứng chỉ |
| `file-check` | File đã duyệt |
| `file-invoice` | Hóa đơn |
| `file-export` | Xuất file |
| `file-import` | Nhập file |
| `file-plus` | Tạo file mới |
| `file-text` | Tài liệu |
| `file-analytics` | Báo cáo phân tích |
| `clipboard-list` | Danh sách việc làm |
| `clipboard-check` | Checklist hoàn thành |
| `report` | Báo cáo |
| `chart-bar` | Biểu đồ cột |
| `chart-line` | Biểu đồ đường |
| `chart-donut` | Biểu đồ tròn |
| `trending-up` | Xu hướng tăng |
| `trending-down` | Xu hướng giảm |
| `calculator` | Kế toán |
| `cash` | Tiền mặt |
| `coin` | Đồng tiền |
| `wallet` | Ví tiền |
| `building-bank` | Ngân hàng |
| `building` | Tòa nhà / Công ty |
| `building-warehouse` | Kho hàng |
| `building-community` | Cộng đồng |
| `building-factory` | Nhà máy |
| `building-skyscraper` | Cao ốc |
| `briefcase` | Công việc / Dự án |
| `shopping-cart` | Mua sắm |
| `package` | Hàng hóa |
| `plus` | Thêm |
| `minus` | Bớt |
| `x` | Đóng |
| `check` | Xác nhận |
| `search` | Tìm kiếm |
| `filter` | Bộ lọc |
| `settings` | Cài đặt |
| `refresh` | Làm mới |
| `edit` / `pencil` | Chỉnh sửa |
| `trash` | Xóa |
| `copy` | Sao chép |
| `download` | Tải xuống |
| `upload` | Tải lên |
| `eye` / `eye-off` | Xem / Ẩn |
| `lock` / `lock-open` | Khóa / Mở khóa |
| `sort-ascending` / `sort-descending` | Sắp xếp |
| `dots` | Menu more (3 chấm ngang) |
| `dots-vertical` | Menu more (3 chấm dọc) |
| `dots-circle-horizontal` | Menu more dạng tròn |
| `bell` | Thông báo |
| `calendar` | Lịch |
| `clock` | Giờ |
| `alert-triangle` | Cảnh báo / Kỷ luật |
| `info-circle` | Thông tin |
| `circle-check` | Đã xong |
| `circle-x` | Lỗi / Từ chối |
| `star` | Đánh dấu / Yêu thích |
| `map-pin` | Địa chỉ |
| `phone` | Điện thoại |
| `mail` | Email |
| `message-circle` | Tin nhắn |
| `send` | Gửi |
| `external-link` | Liên kết ngoài |
| `maximize` / `minimize` | Phóng to / Thu nhỏ |
| `grid-dots` | App switcher |
| `chevron-down/up/left/right` | Mũi tên nhỏ |
| `arrow-up/down/left/right` | Mũi tên lớn |
| `loader-2` | Loading |
| `player-play` | Phát / Bắt đầu |
| `cpu` | Xử lý / Kỹ thuật |
| `sparkles` | AI / Nổi bật |
| `device-desktop` | Màn hình máy tính |
| `help` | Trợ giúp |
| `tool` | Công cụ |
| `book` | Sách / Tài liệu |
| `link` | Liên kết |
| `paperclip` | Đính kèm |
| `history` | Lịch sử chỉnh sửa / History |
| `world` | Ngôn ngữ / Quốc tế / Website |
| `grip-vertical` | Tay nắm kéo thả (sắp xếp cột, dòng) |

> Nếu cần icon chưa có trong bảng → kiểm tra tên trong `@tabler/icons-vue` → thêm vào TIcon.vue → mới dùng.

### ⛔ Button Icon Medium / Small — BẮT BUỘC cho MỌI icon rời bấm được
Figma MDS: **Button Icon Medium** (node `6019:13890`, 32px) · **Button Icon Small** (node `6019:14107`, 28px). Icon 16px.
Mọi icon đứng rời mà bấm được — sửa, xóa, ⋯ thêm, làm mới, cài đặt, copy, thu gọn/mở rộng (chevron), trang trước/sau (‹ ›), đóng panel… — PHẢI là `btn-icon` để có đủ trạng thái:

| Trạng thái | `.btn-icon` (Style=Icon) | `.btn-icon--outline` (Style=Outline) |
|---|---|---|
| Default | nền trong suốt, icon `--icon-neutral` | nền trắng, viền `--stroke-neutral` |
| Hover | nền `--bg-neutral-light`, icon đậm hơn | nền `--bg-neutral-light` |
| Pressed (`:active`) | nền `--bg-neutral-pressed` | nền `--bg-neutral-pressed` |
| Focus (bàn phím) | viền `--stroke-brand` + quầng brand | như trái |
| Disabled | mờ 45%, không hover | như trái |

```vue
<!-- Medium (32px theo density) — hàng toolbar, page header, card header lớn -->
<button class="btn-icon" type="button" v-tip="'Làm mới'" @click="reload"><TIcon name="refresh" /></button>
<button class="btn-icon btn-icon--outline" type="button" v-tip="'Thêm'"><TIcon name="dots" /></button>
<!-- Small (28px) — trong card, cạnh tiêu đề phần, pager ‹ ›, chevron thu gọn -->
<button class="btn-icon btn-icon--sm" type="button" v-tip="'Thu gọn'"><TIcon name="chevron-up" /></button>
<button class="btn-icon btn-icon--sm btn-icon--danger" type="button" v-tip="'Xóa'"><TIcon name="trash" /></button>
```
⛔ CẤM: `<TIcon @click>` / `<span @click><TIcon/></span>` / `<i @click>` · tự dựng class nút icon riêng (`.card__btn-icon { width:24px… }`, `.xxx-icon-btn`) · `icon-swap--action` cho icon rời (nó chỉ đổi màu, không có nền hover/pressed).
✅ Kể cả **nút Back ←** cạnh tiêu đề, nút **✕ đóng** panel / drawer, ✓/✕ sửa nhanh của `DetailField`, icon thao tác trong dòng bảng → đều là `btn-icon` (style Icon).
✅ Chỉ icon nằm **bên trong** 1 control mới không phải Button Icon: ✕ xóa nhanh / 👁 trong ô nhập (do AppTextbox, AppCombobox… tự vẽ), ✕ trên chip lọc (`icon-swap icon-swap--16 icon-swap--action`), nút tăng giảm Numberbox, nút lọc ở tiêu đề cột. Ngoài ra: sidebar (ngoại lệ cố định px), nút đóng trên toast nền màu.
Nút icon ẩn chỉ hiện khi rê vào card: vẫn là `btn-icon btn-icon--sm`, chỉ thêm class app `opacity: 0` → `.card:hover … { opacity: 1 }` (và `:focus-visible` để dùng được bằng bàn phím).

### IconSwap (`.icon-swap`) — icon trần, không khung
Tương ứng component **Icon Swap** của Figma MDS (Size 16/20/24 · Color Neutral/Brand). Dùng khi chỉ cần icon, **không** có nền/viền như `btn-icon`.
```vue
<!-- Icon bấm được nằm TRONG control nhỏ (✕ trên chip lọc) — icon rời bấm được thì dùng btn-icon -->
<button class="icon-swap icon-swap--16 icon-swap--action" type="button" v-tip="'Bỏ điều kiện'"><TIcon name="x" /></button>
<!-- Icon trang trí -->
<span class="icon-swap icon-swap--16 icon-swap--brand"><TIcon name="info-circle" /></span>
```
| Class | Ý nghĩa |
|-------|---------|
| `icon-swap` | 20px, `--icon-neutral` (mặc định) |
| `icon-swap--16` / `icon-swap--24` | Size 16 / 24 |
| `icon-swap--brand` | Color Brand |
| `icon-swap--danger` | Color Danger — **chuẩn hành động xóa**: luôn đi với icon `trash` |
| `icon-swap--action` | CHỈ cho icon bấm được nằm bên trong 1 control nhỏ (✕ trên chip). Icon rời → `btn-icon` |

**⛔ Chuẩn nút xóa (gỡ dòng khỏi danh sách, xóa điều kiện…):** icon `trash` + màu danger → `btn-icon btn-icon--sm btn-icon--danger` (trong dòng / danh sách) hoặc `btn-icon btn-icon--danger`. KHÔNG dùng icon `x` cho hành động xóa — `x` chỉ để đóng (dialog, popover, chip lọc).

**⛔ Nút Back ở Page Header màn chi tiết** (cạnh tiêu đề) → `<button class="btn-icon" v-tip="'Quay lại'"><TIcon name="arrow-left" /></button>` (Button Icon Medium, style Icon — không viền). KHÔNG dùng `btn-icon--outline`, KHÔNG dùng `icon-swap--action`.

### IconMisaAI
```vue
<IconMisaAI /> <!-- dùng trong btn--ai -->
```

---

### Form Input Components — BẮT BUỘC dùng thay vì raw `ibox`

> **NGHIÊM CẤM** tự thi công raw `div.ibox + input.ibox__native + button.ibox__icon--action`.  
> Luôn dùng các component bên dưới — chúng đã xử lý đúng TIcon, states, và keyboard behavior.
>
> **Chiều cao input:** `.ibox__native` (dùng chung cho Textbox / Searchbox / Numberbox / Datebox / Combobox) cao bằng cả khung `.ibox` (`height` = `line-height` = `calc(var(--input-height) - 8px)`, căn giữa dọc, cách viền 4px; ibox--sm `- 12px` — Chrome cắt chữ theo line-height của vùng soạn thảo trong input, không theo chiều cao ô) để chữ HOA tiếng Việt có dấu chồng (CỔ PHẦN, Ỗ, Ỷ) không bị cắt. Không ghi đè `height`/`line-height` px cho input trong ibox.

#### AppTextbox — Text input
```vue
<AppTextbox v-model="form.value" placeholder="..." />
<AppTextbox v-model="form.value" icon-left="search" />
<AppTextbox v-model="form.value" icon-right="calendar" />
<AppTextbox v-model="form.value" clearable />
<AppTextbox v-model="form.value" :state="'error'" />
<AppTextbox v-model="form.value" :readonly="true" />
```
Props:
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `modelValue` (v-model) | String | `''` | Giá trị |
| `type` | String | `'text'` | `text` \| `password` \| `email` \| `tel` \| `url` |
| `placeholder` | String | `''` | Placeholder |
| `state` | String | `'default'` | `default` \| `error` \| `success` \| `warning` \| `disabled` \| `readonly` |
| `icon-left` | String | `''` | TIcon name hiển thị bên trái |
| `icon-right` | String | `''` | TIcon name hiển thị bên phải |
| `clearable` | Boolean | `false` | Hiện nút X xoá khi có giá trị |
| `align` | String | `'left'` | `left` \| `right` |
| `size` | String | `'md'` | `md` \| `sm` |
| `disabled` | Boolean | `false` | Vô hiệu hoá |
| `readonly` | Boolean | `false` | Chỉ đọc |
| `outline` | Boolean | `true` | Hiện border (false = no-border) |

#### AppCombobox — Select/Dropdown
> **Các dạng (trang /ds/combobox, cập nhật 05/11/2026):**
> - **Dạng bảng** — `:columns="[{ key, label, width }]"`: danh sách có hàng tiêu đề cột (nền Neutral Light chữ đậm), mỗi dòng hiện `option[key]`, kẻ ngang giữa các dòng, tìm theo mọi cột; màn hẹp cuộn ngang. Chân danh sách qua slot `#footer="{ close, query }"` (VD link “Thêm mới (F9)” · “Tìm nhanh (F3)”); phím **F9** → `@add(query)`, **F3** → `@quick-search(query)`.
> - **Dạng cây** — option có `depth`, `text` (tên ngắn), `label` (đường dẫn đầy đủ), `parent: true`; thêm `collapsible` để co / giãn nhánh (← →).
> - **Thêm giá trị mới khi nhập** — `creatable`: chọn 1 → gõ không có trong danh sách hiện link **“Nhấn Enter để thêm mới”**; chọn nhiều → dòng “Thêm “…””. Bắt `@create(text)` để thêm vào danh sách gốc (lưu cho lần sau).
> - **Split** — `split-icon="dots"` (+ `split-tip`): ô phải ngăn vạch, bấm → `@split` (VD mở dialog “Thiết lập giá trị”: tìm, ô tick hiện / ẩn, sửa tên, xóa, kéo đổi thứ tự, Thêm dòng, Hủy / Lưu); `split-icon="search"` cho tìm nâng cao (Combobox Single Split).
```vue
<AppCombobox v-model="form.type" :options="['Loại A', 'Loại B']" />
<AppCombobox v-model="form.type" :options="[{ value: 'a', label: 'Loại A' }, { value: 'b', label: 'Loại B' }]" />
<AppCombobox v-model="form.tags" :options="opts" :multiple="true" />
<AppCombobox v-model="form.type" :state="'disabled'" />
<AppCombobox v-model="month" :options="months" :clearable="false" />  <!-- ô luôn phải có giá trị -->
```
**⛔ AppCombobox KHÔNG dùng `<select>` mặc định của trình duyệt** — luôn là danh sách tự vẽ: bấm bất kỳ đâu trên ô (cả mũi tên) để mở; khung trắng bo `--radius-dialog` + `--shadow-popover` (= Bottom 12), đệm dọc 8px, dòng full-width cao `--btn-height`, padding ngang 12px; hover = `--bg-neutral-hover`; **đang chọn = nền `--bg-brand-light` + chữ brand semibold** (chọn 1: không có ✓ · chọn nhiều `multiple`: thêm ✓ bên phải, danh sách giữ mở để chọn tiếp); **⛔ gõ tìm NGAY TRÊN Ô** (ô là input, không có ô tìm riêng trong popup): bấm / gõ → mở danh sách và lọc theo chữ gõ (bỏ dấu), nhãn đang chọn hiện mờ làm gợi ý khi đang gõ; chọn nhiều: gõ sau các tag, Backspace khi ô trống: lần 1 làm sáng tag cuối, lần 2 mới bỏ; tag tràn gộp “+N” (xem mục Combobox chọn nhiều); ↑ ↓ Enter Esc; tự lật lên trên khi thiếu chỗ. TablePaging (số dòng/trang) cũng dùng AppCombobox.
**⛔ Quy chuẩn dropdown:** chọn rồi phải bỏ chọn được (về trạng thái chưa chọn); khi chưa chọn, chữ placeholder là hint text. AppCombobox đã làm sẵn — không tự viết select khác.
**Bỏ chọn tự động (mds-ui, 11/2026):** ô chọn 1 nằm trong trường form (AppInput / TipField), KHÔNG bắt buộc, có `placeholder`, không đặt `:clearable="false"` → tự có mục **“Chưa chọn”** đầu danh sách (đổi chữ bằng `empty-option`). Bỏ chọn được 3 cách: chọn mục “Chưa chọn” · mở ô rồi Backspace / Delete (chữ mờ đổi về placeholder) rồi Tab / bấm ra ngoài / Enter · xóa trắng chữ đang gõ rồi rời ô. Esc = hủy, giữ giá trị cũ. Trường bắt buộc (`required` ở AppInput / TipField) không có mục này. Ô lọc trên thanh công cụ (ngoài form) dùng “…: Tất cả”.
Props:
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `modelValue` (v-model) | String \| Array | `''` | Giá trị đã chọn |
| `options` | Array | `[]` | `string[]` hoặc `{ value, label, disabled?, description? }[]`. Có `description` → danh sách xổ tự vẽ: mỗi dòng tên (semibold) + dòng mô tả phụ, ✓ ở giá trị đang chọn, hỗ trợ ↑ ↓ Enter Esc. Dùng khi người chọn cần hiểu ý nghĩa từng lựa chọn (VD vai trò). Ô lọc trên toolbar không truyền description |
| `placeholder` | String | `''` | Placeholder khi chưa chọn — hiển thị **màu hint** (`--text-hint`) |
| `multiple` | Boolean | `false` | Chọn nhiều (hiện tags). Đã có tag → lề trái ô tự bằng khoảng tag cách mép trên (`.ibox--tags`, tính từ `--input-height`, cả `size="sm"`) để tag cách đều 4 phía — **app không tự chỉnh padding ô** |
| `clearable` | Boolean | (không đặt) | `true`: hiện nút × (chỉ ô tìm kiếm nên dùng) · `false`: TẮT HẲN bỏ chọn — ô luôn phải có giá trị (chọn tháng, nền tảng, toán tử lọc…) · không đặt: theo quy tắc tự động bên dưới |
| `empty-option` | String | `''` | Chữ của mục giá trị rỗng đầu danh sách (VD “Chưa giao”, “Giao sau khi duyệt”) — mặc định “Chưa chọn” khi quy tắc tự động bật |
| `state` | String | `'default'` | `default` \| `error` \| `success` \| `warning` \| `disabled` |
| `icon-left` | String | `''` | TIcon name bên trái |
| `size` | String | `'md'` | `md` \| `sm` |
| `disabled` | Boolean | `false` | |
| `ghost` | Boolean | `false` | Không border, nền nhạt |
| `creatable` | Boolean | `false` | (cùng `multiple`) Cho **tự nhập** giá trị ngoài danh sách: gõ chữ không trùng nhãn nào → dòng cuối “`createLabel` “chữ gõ”” (brand, icon +), bấm hoặc Enter để thêm. Giá trị = chữ đã gõ; tag tự nhập viền **nét đứt** + icon bút. Tách giá trị: cái nào có trong `options` là chọn, còn lại là tự nhập |
| `create-label` | String | `'Thêm'` | Chữ trước giá trị ở dòng tự nhập (VD “Tự nhập dự án”) |
| `tag-avatar` | Boolean | `false` | (cùng `multiple`) Tag đã chọn hiện ảnh / chữ cái đầu của `option.avatar` (14px) |
| `avatar-square` | Boolean | `false` | Avatar vuông bo góc, ảnh `contain`, **không nền, không viền** — dùng cho **logo** (dự án…), cả trong danh sách lẫn tag (chưa có ảnh → chữ cái đầu trên nền màu) |
| `outline` | Boolean | `true` | |

> **Tự render chevron-down** — KHÔNG thêm icon ngoài.

#### AppDatebox — Date/Time picker
```vue
<AppDatebox v-model="form.date" />                       <!-- ISO 'YYYY-MM-DD' -->
<AppDatebox v-model="form.date" style="width:140px" />   <!-- class/style gắn vào ô nhập -->
<AppDatebox v-model="form.time" type="time" />
<AppDatebox v-model="form.dt" type="datetime-local" />
```
Props:
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `modelValue` (v-model) | String | `''` | ISO: `YYYY-MM-DD` (date) · `HH:MM` (time) · `YYYY-MM-DDTHH:MM` |
| `type` | String | `'date'` | `date` \| `time` \| `datetime-local` |
| `placeholder` | String | `'DD/MM/YYYY'` | |
| `state` | String | `'default'` | |
| `size` | String | `'md'` | |
| `disabled` / `readonly` | Boolean | `false` | Không mở lịch |
| `clearable` | Boolean | `true` | Hiện "Xóa" trong popover khi đã có giá trị |

**Hành vi `type="date"` (⛔ chuẩn bắt buộc — KHÔNG dùng date picker gốc của trình duyệt):**
- Ô hiển thị `dd/mm/yyyy`; bấm vào bất kỳ đâu trên ô (kể cả icon lịch) → xổ **popover lịch** (Teleport, tự lật lên trên khi sát đáy, z-index trên dialog/drawer).
- Lưới tuần bắt đầu **Thứ Hai** (T2…CN), ngày ngoài tháng mờ, **hôm nay** viền brand, **ngày đang chọn** nền brand.
- **Bấm 1 ngày → lấy giá trị và đóng luôn** (không có nút Áp dụng).
- Header: ‹ › chuyển tháng; bấm tiêu đề "Tháng 10, 2026" → chọn tháng/năm (‹ › chuyển năm).
- Khi đang xem tháng khác tháng hiện tại → footer hiện link **"Hôm nay"** để quay về tháng hiện tại. Có giá trị → link **"Xóa"**.
- Gõ tay `dd/mm/yyyy` rồi Enter / rời ô → lưu nếu hợp lệ, sai → trả lại giá trị cũ. Esc / bấm ngoài → đóng.
- `type="time"` / `"datetime-local"`: dùng **AppDatePicker** (`type` time / datetime, `:seconds="false"`) — bấm ô xổ Time Picker (2 cột Giờ/Phút) / Date Time Picker (lịch + cột giờ), nút Đồng ý; gõ tay được (`8h45`, `7:05`, `01/12/2026 7:05` + Enter/Tab → chuẩn hóa, gõ sai → giữ giá trị cũ). Giá trị vẫn `HH:mm` / `YYYY-MM-DDTHH:mm`. ⛔ Không dùng input time gốc của trình duyệt.
- **Gõ nhanh ngày / giờ (user chốt 2026-11-05)** — `utils/dateInput.js` (`parseDateText` · `parseTimeText` · `parseDateTimeText`), dùng chung cho AppDatebox + AppDatePicker; Enter / Tab / rời ô thì nhận. Ngày: `20102026` · `20/10/2026` · `20-10-26` · `201026` → 20/10/2026; `2010` → 20/10 năm nay; `20` → ngày 20 tháng này. Giờ: `1030` · `10:30` · `10h30` → 10:30; `930` → 09:30; `8h` / `8` → 08:00; `103045` → 10:30:45. Ngày giờ: `20102026 1030` · `201020261030` · `20/10/2026 10:30`. Sai (31/02, 25:00) → giữ giá trị cũ. **Mask khi gõ** (`onMaskedInput` / `maskDateTyping`): dấu `/` `:` và khoảng trắng tự chèn NGAY lúc gõ theo định dạng mặc định **ngày/tháng/năm** (DD/MM/YYYY · HH:mm) — gõ `2` `0` → `20/`, `9` ở ô giờ → `09:`, ngày gõ 4–9 → `04/`, tháng gõ 2–9 → `02/`; xóa lùi xóa luôn dấu ngăn; không đợi Enter mới hiện định dạng.
- **Độ rộng ô ngày giờ theo dữ liệu (user chốt 2026-11-05):** AppDatePicker / AppDatebox tự đặt `width` vừa giá trị dài nhất của type (date ≈ 145px, giờ ≈ 120px, ngày giờ ≈ 180px, tuần ≈ 260px, khoảng ngày ≈ 230px…) + `max-width:100%` — KHÔNG kéo giãn hết cột lưới. Muốn full cột thì truyền `style="width:100%"`. Demo / form đặt các ô trong flex-wrap thay vì lưới cột đều.

> **Tự render calendar/clock icon** — KHÔNG thêm icon ngoài.

#### AppNumberbox — Number input with stepper
```vue
<AppNumberbox v-model="form.qty" :min="0" :max="999" />
<AppNumberbox v-model="form.qty" :stepper="false" />
<AppNumberbox v-model="form.amount" :min="0" :stepper="false" />   <!-- số tiền trong form: vẫn căn trái -->
```
Props:
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `modelValue` (v-model) | Number \| String | `''` | Giá trị |
| `min` / `max` | Number | `null` | Giới hạn |
| `align` | String | `'left'` | `left` \| `right` — ⛔ ô nhập số trong form **luôn căn trái** (kể cả số tiền); chỉ ô số **trên bảng** (DataTable `numberbox`) căn phải để dễ cộng số giữa các dòng |
| `step` | Number | `1` | Bước nhảy |
| `stepper` | Boolean | `true` | Hiện nút +/- bên phải |
| `state` | String | `'default'` | |
| `size` | String | `'md'` | |
| `disabled` / `readonly` | Boolean | `false` | |

> **Căn lề (⛔ bắt buộc):** mặc định **căn trái** (`align="left"`). Chỉ dùng `align="right"` khi có lý do: số tiền / đơn giá / thành tiền, hoặc ô nhập nằm trong cột số của bảng cần thẳng hàng chữ số. Số lượng, số màn hình, số ngày, hệ số, điểm… trong form → để căn trái.
> KHÔNG thêm stepper ngoài.

#### AppTextarea — Multiline text
```vue
<AppTextarea v-model="form.note" placeholder="Ghi chú..." :min-height="80" />
<AppTextarea v-model="form.concept" :min-height="40" :max-height="320" autosize />   <!-- tự giãn theo nội dung -->
```
Props:
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `modelValue` (v-model) | String | `''` | |
| `placeholder` | String | `''` | |
| `min-height` | Number | `80` | px |
| `max-height` | Number | `0` | px (0 = không giới hạn) |
| `fixHeight` | Boolean | `false` | Figma Fix Height = True: chiều cao **cố định**, KHÔNG có góc kéo (cuộn trong ô). Mặc định False: có góc kéo dưới phải để người dùng kéo cao thêm. Cao tối thiểu 72px (`minHeight` 58 cho vùng gõ) — trang /ds/textarea |
| `resize` | Boolean | `true` | Cho phép resize dọc |
| `autosize` | Boolean | `false` | Tự giãn chiều cao theo nội dung (từ `min-height` tới `max-height`, vượt thì hiện cuộn). Dùng cho ô mô tả / ghi chú dài (VD Concept) |
| `maxlength` | Number | `0` | 0 = không giới hạn |
| `state` | String | `'default'` | |

#### AppDatePicker — bảng chọn thời gian nâng cao (Figma ❖ Date Time Picker, Section 15258:153109) · demo trong /ds/datetimepicker
```vue
<AppDatePicker v-model="d" type="date" />                       <!-- 'YYYY-MM-DD' · footer “Hôm nay” -->
<AppDatePicker v-model="w" type="week" />                       <!-- 'YYYY-MM-DD' (thứ 2) · hiện “Tuần 46 (09/11 – 15/11/2026)” -->
<AppDatePicker v-model="m" type="month" />                      <!-- 'YYYY-MM' · quarter 'YYYY-Q1' · half 'YYYY-H1' · year 'YYYY' -->
<AppDatePicker v-model="t" type="time" />                       <!-- 'HH:mm:ss' · CHỈ khối giờ: giờ đang chọn ở trên, 3 cột giờ/phút/giây (seconds=false → 2 cột), chân Bây giờ / Đồng ý — KHÔNG có vùng lịch bên trái -->
<AppDatePicker v-model="dt" type="datetime" />                  <!-- 'YYYY-MM-DDTHH:mm:ss' · lịch + cột giờ + Đồng ý -->
<AppDatePicker v-model="r" type="date" range presets />         <!-- ['YYYY-MM-DD','YYYY-MM-DD'] · 2 lịch + chọn nhanh (7 ngày qua, Tháng này…) + Đồng ý -->
<AppDatePicker v-model="rs" type="time" range />                <!-- ['08:00','14:00'] · lưới khung 30 phút -->
```
Quy chuẩn bảng: nền trắng bo 12, đệm 12 · header ‹‹ ‹ [Thg N] [YYYY] › ›› (bấm tiêu đề → lên cấp tháng / năm / thập kỷ) · ô 32×32 bo 8: hôm nay viền Brand chữ Brand · đang chọn nền Brand chữ trắng · trong khoảng nền Brand Light (đầu / cuối bo 1 phía) · ngày tháng khác chữ mờ · CN chữ đỏ · tuần: rê / chọn tô cả hàng. `range` cho mọi type (2 bảng cạnh nhau, rê chuột xem trước khoảng). Ô nhập bấm để mở (chỉ đọc); gõ trực tiếp dùng AppDatebox.

#### AppSearchbox — Search input (Figma ❖ Searchbox 6019:50140) · trang /ds/search-box
```vue
<AppSearchbox v-model="q" placeholder="Tìm theo tên, mã" @search="onSearch" />
<AppSearchbox v-model="q" variant="filled" />          <!-- nền Neutral/200, không viền -->
<AppSearchbox v-model="q" variant="filled-white" />    <!-- trên nền màu (Global Header); 'header' = tên cũ -->
```
Props: `modelValue`, `placeholder` (mặc định “Tìm kiếm”), `variant` (`'outline'` mặc định | `'filled'` | `'filled-white'`), `clearable` (true), `state`, `size`, `disabled`, `width`  
Emits: `update:modelValue`, `search` (Enter), `clear` · expose `focus()`  
Quy chuẩn: đệm ngang 8 · icon 16 cách chữ 8 · hover / focus (Outline, Filled) nền trắng + viền Brand · ✕ chỉ hiện khi đã gõ, **Esc** cũng xóa · lọc không phân biệt dấu.  
**Tìm kiếm thông minh (AI)** → `AppAiSearchbox` (Figma ❖ AI Searchbox; popup theo Figma Quy chuẩn chung › Search Global engine 29222:36495 / 29240:42547):
  - Đã gõ: ✕ xóa + icon **device-analytics màu AI_Primary** (`mds-device-analytics`) → bấm: `@analyze(text)` và popup nhỏ hiện **trường AI bóc tách + giá trị** từ prop `parsed: [{ label, value }]` (“Họ và tên: “**Trần Văn Bình**”, Vị trí công việc: “**DEV Lead**””) · `analyzing` = đang bóc tách.
  - **Enter** → `@submit(text)` + popup **“Kết quả tìm kiếm với AI”** (icon `mds-ai-sparkles` 20 + chữ kiểu H3 Semi Bold màu `.text-ai-primary` — KHÔNG Bold): dòng điều kiện đã bóc tách, rồi từng nhóm `results: [{ key, title, total, items: [{ id, name, subtitle, meta, avatar }] }]` — nhãn nhóm 120px VIẾT HOA chữ phụ, mục có avatar 32 + tên semibold + chức danh / đường dẫn đơn vị chữ phụ, `AppTag` Neutral “N kết quả” bên phải, “Xem thêm” khi total > số mục (`@more(group)`), chọn mục `@select(item, group)`. `loading` = đang tìm. Esc / bấm ra ngoài đóng popup. Trên bảng: `TableHeader search-mode="normal | ai"`.

#### AppRichText — Rich text editor (TinyMCE 7, Figma ❖ Editor Toolbar 28355:87417 / RichText 43454:50588) · trang /ds/rich-text-editor
```vue
<AppRichText v-model="html" />                                   <!-- toolbar="simple": bộ nút Figma RichText -->
<AppRichText v-model="html" toolbar="full" :height="300" />       <!-- + kiểu đoạn, font, cỡ chữ, màu nền, giãn dòng, bảng -->
<AppRichText v-model="html" toolbar="classic" :height="360" />    <!-- + thanh menu, đếm chữ, xem trước, toàn màn hình, mã HTML -->
<AppRichText v-model="note" mode="inline" />                      <!-- không khung, toolbar nổi khi focus -->
```
Props: `modelValue` (HTML), `mode` ('basic' | 'inline'), `toolbar` ('simple' | 'full' | 'classic' | chuỗi toolbar TinyMCE), `height`, `minHeight`, `resize` (true — kéo góc dưới phải), `placeholder`, `state` (default | error | readonly | disabled), `readonly`, `disabled`.  
TinyMCE nạp từ CDN, ghim `tinymce@7.6.0`, giao diện tiếng Việt (`tinymce-i18n`); toolbar nền trắng, nút = nút nhỏ theo mật độ (calc(--btn-height − 4): 28 · Nhỏ 24 · Rộng 32), icon 16, bo Inner, hover / bật nền Neutral Light (TinyMCE không có chế độ to / nhỏ sẵn — mds-ui tự thu theo mật độ); khung hẹp gom nút vào ⋯. ⛔ Lưu HTML phải lọc (bỏ script / on*) trước khi hiển thị lại.


#### ⛔ Quy chuẩn báo lỗi trường nhập (validation) — BẮT BUỘC mọi form
| Thành phần | Quy chuẩn |
|---|---|
| Ô lỗi | Viền đỏ (`ibox--error`) + **icon chấm than tròn đỏ** (`alert-circle`, `.ibox__icon--error`) bên phải trong ô |
| Thông báo lỗi | **Tooltip nền đỏ chữ trắng** (`ErrorTip`) nổi **phía dưới** ô (sát mép dưới màn hình thì lật lên trên) — KHÔNG in chữ dưới ô, KHÔNG đẩy form xuống |
| Khi nào hiện tooltip | Tự hiện khi ô lỗi đang focus; hover icon chấm than cũng hiện. Chỉ 1 tooltip tại một thời điểm (ô đang hover ưu tiên) |
| Bấm Lưu có lỗi | `focusFirstError(formEl)` → focus ô lỗi đầu tiên → tooltip tự hiện |
| Sửa lại ô | Lỗi của ô đó tự mất ngay (không chờ bấm Lưu lại) |
| Cảnh báo / thông tin (`message-type="warning" \| "info" \| "success"`) | Vẫn in dòng chữ dưới ô như cũ |

**Cách dùng** — chỉ cần truyền `message` cho `AppInput`; control App* bên trong (Textbox, Combobox, Datebox, Numberbox, Textarea) tự bật viền đỏ + icon + tooltip qua provide/inject (`@mds/utils/fieldError.js`):
```vue
<div ref="formEl">
  <AppInput label="Tên dự án" :required="true" :message="errors.name">
    <AppTextbox v-model="form.name" />
  </AppInput>
</div>

<script setup>
import { focusFirstError } from '@mds/utils/fieldError.js'
const formEl = ref(null)
// Sửa ô nào → xóa lỗi ô đó
watch(() => ({ ...form }), (n, o) => { for (const k in errors) if (String(n[k] ?? '') !== String(o[k] ?? '')) delete errors[k] })
function save() {
  if (!validate()) return focusFirstError(formEl.value)
  ...
}
</script>
```
Wrapper trường tự viết (VD có icon ⓘ cạnh label) phải dùng `provideFieldError()` + `<ErrorTip>` giống `AppInput` để giữ cùng quy chuẩn.
⛔ NGHIÊM CẤM: in câu lỗi dạng text dưới ô · dùng `alert()` · tự vẽ tooltip lỗi khác màu.

#### AppInput — Form field wrapper (label + input + validation message)
> **Chỉ 2 kiểu bố cục** (Figma MDS Input Group, node `6019:51148`) — đã áp sẵn trong `.input-field`, KHÔNG override:
> - **Nhãn TRÊN** (`vertical` mặc định): label **Semibold** 13px, cách control **4px** (`--input-label-gap`). Bọc các trường trong `.form-fields` → các trường cách **16px** (`--form-row-gap-v`).
> - **Nhãn TRÁI** (`:vertical="false"`): label **Regular** 13px, rộng **200px** (`--form-label-w`), cách control **8px** (`--form-label-gap-h`), canh giữa theo chiều cao ô. Bọc trong `.form-fields.form-fields--h` → các hàng cách **12px** (`--form-row-gap-h`).
> - 2 cột: thêm `.form-fields--2col` (cột cách 80px, < 760px về 1 cột). ⛔ Không tự dựng grid/gap/margin cho form.

```vue
<AppInput label="Tên nhân viên" :vertical="true">
  <AppTextbox v-model="form.name" />
</AppInput>

<!-- Lỗi → viền đỏ + icon chấm than + tooltip đỏ (không cần tự đặt state="error") -->
<AppInput label="Email" message="Email không hợp lệ">
  <AppTextbox v-model="form.email" />
</AppInput>
```
Props:
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `label` | String | `''` | Label text (trống → không render label) |
| `required` | Boolean | `false` | Hiện dấu `*` |
| `vertical` | Boolean | `true` | `true` = label trên input / `false` = label-bên-trái (inline) |
| `caption` | String | `''` | Text phụ nhỏ dưới input. ⛔ KHÔNG dùng cho câu giải thích / hướng dẫn (“Để trống = …”, “Điểm/tháng khi …”) — đưa vào icon ⓘ cạnh label, hover hiện tooltip |
| `message` | String | `''` | Validation message |
| `message-type` | String | `'error'` | `error` \| `success` \| `warning` \| `info` |

> `AppInput` là wrapper — đặt `AppTextbox`/`AppCombobox`/... vào `<slot>` bên trong.

#### DetailField — trường ở màn CHI TIẾT (xem + sửa nhanh 1 trường)
> Figma MDS "Màn hình chi tiết" (node `20191:63630`). Nhãn 200px (Regular, `--text-primary`) + giá trị cao bằng input, chỉ **gạch chân mảnh** `--stroke-neutral-light`; **hover → gạch chân brand + icon bút chì 🖉 hiện ở cuối ô** (báo sửa được — KHÔNG để trường sửa được mà hover không có dấu hiệu); bấm vào giá trị → ô nhập + **✓** (xanh, lưu) / **✕** (hủy), Enter lưu, Esc hủy. Giá trị trống hiện `-` màu secondary. Nhãn viết tắt tự có tooltip.

```vue
<section class="card detail-card">
  <h3 class="detail-card__title">Thông tin chung</h3>   <!-- 16px semibold, cách lưới 16px -->
  <div class="detail-grid">                              <!-- 2 cột cách 80px, hàng cách 12px -->
    <DetailField v-model="emp.code"  label="Mã nhân viên" @save="onSave" />
    <DetailField v-model="emp.email" label="Email cá nhân" :editable="false" />
    <DetailField :model-value="{ link: emp.mail, href: `mailto:${emp.mail}` }" label="Email" />  <!-- dạng link -->
  </div>
</section>
```
Props: `label`, `modelValue` (String | Number | `{ link, href }`), `editable` (mặc định `true`). Emits: `update:modelValue`, `save`. Slot mặc định = tùy biến phần giá trị.

**Độ rộng nhãn động — `v-auto-label-width`** (`@mds/utils/autoLabelWidth.js`): đặt 1 lần ở khung bao TẤT CẢ card của màn (không đặt từng card → cột giá trị so le). Độ rộng = nhãn dài nhất của cả màn + 8px, kẹp 120–200px; nhãn dài hơn 200px xuống dòng. Tự tính lại khi thêm / bớt / ẩn trường (form kéo thả, “dữ liệu trống”, mở phần thu gọn).
```vue
<div v-auto-label-width="{ labels: allLabels }">  <!-- labels = MỌI nhãn trong cấu hình form (kể cả phần thu gọn / trường ẩn) → độ rộng không nhảy -->
  <section class="card detail-card">…<DetailField …/>…</section>
</div>
```
Áp cho cả `DetailField` và `<AppInput :vertical="false">`. Tuỳ chọn: `{ labels, min: 120, max: 200, pad: 8 }`. Không đặt directive → giữ 200px (chuẩn Figma).
💡 Nhãn nên ngắn: phần định danh đã có ở tiêu đề nhóm thì không lặp lại trong nhãn (nhóm “Địa chỉ hiện nay” → nhãn “Số nhà, đường phố”, không phải “Số nhà, đường phố (Hiện nay)”).
⛔ Màn chi tiết KHÔNG tự dựng label/value bằng grid + border riêng — dùng `DetailField` + `.detail-grid`.

#### AppFormPanel — Form popup/dialog panel
```vue
<AppFormPanel title="Tên form" :closable="true" @close="emit('close')">
  <template #toolbar>
    <!-- tabs, sub-header nếu có -->
  </template>

  <!-- #default slot = form body -->
  <div class="form-grid">...</div>

  <template #footer>
    <button class="btn btn--outline btn--neutral" @click="emit('close')">Hủy</button>
    <button class="btn btn--primary">Lưu</button>
  </template>
</AppFormPanel>
```
Props:
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `title` | String | `''` | Tiêu đề header |
| `divider` | Boolean | `false` | Border-bottom dưới header. ⛔ Quy chuẩn popup: header KHÔNG có gạch divider — không bật prop này |
| `closable` | Boolean | `true` | Hiện nút X đóng |

Slots: `default` (body), `toolbar` (ngoài body, trước body), `title` (custom title), `header-end` (custom header-right), `footer`

**⛔ Quy chuẩn khoảng cách popup (MDS):**
| Phần | Padding | Ghi chú |
|---|---|---|
| Header (`.form-header`) | trên 24px · trái 24px · phải 24px · **dưới 16px** | KHÔNG có divider |
| Body (`.form-body`) | **trên 0** · trái 24px · phải 24px · **dưới 24px** (cân với 2 bên) | Khoảng cách tới tiêu đề = 16px dưới của header |

Nội dung đặt trong popup (wrapper form, danh sách…) **KHÔNG tự thêm `padding-top` / `margin-top`** — khoảng cách đã do header + body lo.

CSS tham chiếu (AppFormPanel dùng class `form-panel`, `form-header`, `form-body`, `form-footer` — định nghĩa trong mds-ui/src/style.css):
```css
/* Trong style.css của mds-ui */
.form-panel   { display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden; background:var(--bg-white); }
.form-header  { display:flex; align-items:center; justify-content:space-between; padding:24px 24px 16px; flex-shrink:0; background:var(--bg-white); }
.form-header--divider { border-bottom:1px solid var(--stroke-neutral-light); }  /* chỉ khi có lý do đặc biệt — mặc định popup KHÔNG có */
.form-header__title { font-size:var(--text-h2); line-height:var(--text-h2-lh); font-weight:var(--fw-semibold); color:var(--text-primary); }   /* 20 / 28 Semi Bold — Figma Form 6019:124359 */
.form-header > .btn-icon .ti { font-size:20px; }   /* nút đóng 32px, icon × 20px · khung tiêu đề cao 72 */
.form-body    { flex:1; min-height:0; overflow-y:auto; padding:0 24px 24px; display:flex; flex-direction:column; gap:16px; }
.form-footer  { display:flex; align-items:center; justify-content:flex-end; height:56px; padding:0 16px; flex-shrink:0; gap:8px; background:var(--bg-white); border-top:1px solid var(--stroke-neutral-light); }
```

#### Field wrapper pattern (label + control)
```vue
<!-- MẪU ĐÚNG: label + AppTextbox/AppCombobox -->
<div class="field">
  <label class="field__label">Tên trường</label>
  <AppTextbox v-model="form.value" />
</div>

<!-- Dùng AppInput khi cần validation message -->
<AppInput label="Email" message="Email không hợp lệ" message-type="error">
  <AppTextbox v-model="form.email" :state="'error'" />
</AppInput>
```

**⛔ Quy tắc label input (bắt buộc, mọi app):** nhãn TRÊN → **semibold** (`--fw-semibold`, 600), 13px, `--text-primary`, label → control **4px** (`--input-label-gap: 4px`); nhãn TRÁI → **regular**, rộng 200px, label → control **8px** (dùng `<AppInput :vertical="false">`). `AppInput` (`.input-field`) đã áp sẵn — label tự viết (`.field__label`, tiêu đề nhóm checkbox/radio…) cũng phải theo đúng.

CSS `field__label` — PHẢI định nghĩa trong `<style scoped>` của từng component (không global):
```css
.field__label {
  display: block;
  font-size: var(--text-body);
  font-weight: var(--fw-semibold);   /* label input luôn semibold */
  color: var(--text-primary);   /* ⛔ NGHIÊM CẤM dùng --text-secondary cho label */
  line-height: var(--text-body-lh);
  margin-bottom: var(--input-label-gap);   /* 4px */
}
```

---

## 2. Button classes

**Quy tắc chọn loại nút:**
- **Nút chính (primary):** `btn btn--primary` — brand fill
- **Nút phụ (secondary):** `btn btn--outline btn--neutral` — neutral outline
- **Brand outline** (`btn btn--outline` không có `btn--neutral`): CHỈ dùng khi user yêu cầu tường minh
- Không tự chọn brand outline cho nút phụ dù mockup/Figma vẽ vậy

| Class | Dùng khi | Ghi chú |
|-------|----------|---------|
| `btn btn--primary` | Nút chính | Brand fill |
| `btn btn--outline btn--neutral` | Nút phụ | Neutral outline — **mặc định cho secondary** |
| `btn-split` + `btn--primary` | Split nút chính | Bao `btn` + `btn-split__arrow` |
| `btn-split` + `btn--outline btn--neutral` | Split nút phụ | Neutral outline split |
| `btn btn--ai` | AI solid | Gradient fill `#1482ff→#cf11ff`, text trắng. Kèm `<IconMisaAI />` |
| `btn btn--ai-outline` | AI outline | **Border gradient** `#1482ff→#cf11ff` (1px), bg trắng, text gradient AI. Hover: bg gradient nhạt `#edf9ff→#fee2ff` |
| `btn btn--ai-text` | AI text only | Không border, không bg, text gradient AI. Hover: bg `rgba(20,130,255,0.06)` |

> **⛔ NGHIÊM CẤM với AI buttons:**
> - KHÔNG hardcode `color: #1482ff` solid cho text — text PHẢI là gradient qua `background-clip: text`
> - **Border beam tròn** (avatar / icon tròn như avatar AVA): bọc `<span class="border-beam-round" :class="{ 'border-beam-round--on': dangChay }">` — vòng gradient AI chạy quanh, không tô lại SVG bên trong. Chỉ bật khi có lý do (AI đang xử lý, giới thiệu lần đầu ~5 giây), KHÔNG để chạy liên tục. Thêm `border-beam-round--hover` → chạy khi rê chuột lên phần tử cha (VD nút header chứa avatar AVA).
> - **Icon màu AI Primary** (sparkles… đứng riêng, không nằm trong nút AI): `<TIcon name="sparkles" class="ti--ai" />` + gọi `ensureAiGradient()` (`@mds/utils/aiGradient.js`) 1 lần trong component → stroke gradient `#1482ff→#cf11ff`. KHÔNG tô `color: #1482ff` / `var(--text-ai)` đơn sắc cho icon AI.
> - **Đoạn nội dung AI tạo ra (nhận định, tóm tắt, đề xuất)**: IN ĐẬM (`--fw-semibold`) các cụm cần nhấn — con số, mốc thời gian, tên đơn vị / chức danh, kết luận, rủi ro, hành động đề xuất — để lướt nhanh. Mỗi câu 1–2 cụm, không đậm cả câu. Dữ liệu viết `**cụm**`, tách thành `<strong>` khi render (KHÔNG dùng `v-html`).
> - **MỌI CHỮ LIÊN QUAN AI → màu AI Primary** (class `.text-ai-primary` → chữ gradient `#1482ff→#cf11ff`): tên trợ lý AI (VD “Trợ lý AVA”, “AVA”), nhãn / nút / dòng tóm tắt của tính năng AI (“AI gợi ý: …”, “AI đang đánh giá…”, “Hỏi AVA”, “N gợi ý từ AVA”, “Nhờ AVA làm giúp”…), tiêu đề khối nội dung do AI tạo. Chỉ tô phần chữ AI (bọc `<span class="text-ai-primary">`), giá trị / tag đi kèm giữ màu thường. ⛔ KHÔNG dùng `var(--text-ai)` / `#1482ff` đơn sắc cho chữ AI. Icon AI cùng chỗ dùng `.ti--ai`.
> - KHÔNG dùng `border-color: #1482ff` solid cho `btn--ai-outline` — border PHẢI là gradient `#1482ff→#cf11ff`
> - KHÔNG tự nghĩ ra hover color — lấy đúng từ Figma spec:
>   - `btn--ai-outline` hover bg: `linear-gradient(111deg, #edf9ff 8.87%, #fee2ff 100%)`
>   - `btn--ai-outline` pressed bg: `linear-gradient(111deg, #d7efff 8.87%, #fae3ff 100%)`
>   - `btn--ai-text` hover bg: `rgba(20,130,255,0.06)`
>
> **CSS implementation `btn--ai-outline` (nguồn: Figma node 23342:23603, 23342:40129, 23342:52640):**
> ```css
> /* Kỹ thuật:
>    - Text + white fill: multi-layer background-clip (text, padding-box)
>    - Gradient border: ::before mask ring
>    - DPR fix: @media padding = 1/DPR để đúng 1 physical pixel trên mọi cạnh
>      padding: 1px tại DPR 1.5 = 1.5px physical → round không đều top-left vs bottom-right
>      → phải override padding theo từng DPR bằng media query */
> .btn--ai-outline {
>   position: relative; border: none; isolation: isolate;
>   background:
>     linear-gradient(106deg, #1482ff 8.87%, #cf11ff 100%), /* text gradient */
>     var(--bg-white);                                        /* white fill */
>   -webkit-background-clip: text, padding-box;
>   background-clip: text, padding-box;
>   -webkit-text-fill-color: transparent; color: transparent;
> }
> .btn--ai-outline:hover {
>   background:
>     linear-gradient(106deg, #1482ff 8.87%, #cf11ff 100%),
>     linear-gradient(111deg, #edf9ff 8.87%, #fee2ff 100%); /* AI begin/end 50 */
>   -webkit-background-clip: text, padding-box; background-clip: text, padding-box;
> }
> .btn--ai-outline:active {
>   background:
>     linear-gradient(106deg, #1482ff 8.87%, #cf11ff 100%),
>     linear-gradient(111deg, #d7efff 8.87%, #fae3ff 100%); /* AI begin/end 100 */
>   -webkit-background-clip: text, padding-box; background-clip: text, padding-box;
> }
> /* Gradient border ring — mask: chỉ show 1px ring, center transparent */
> .btn--ai-outline::before {
>   content: ''; position: absolute; inset: 0; padding: 1px; /* DPR 1 default */
>   background: linear-gradient(106deg, #1482ff 8.87%, #cf11ff 100%);
>   border-radius: inherit;
>   -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
>   mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
>   -webkit-mask-composite: destination-out; mask-composite: exclude;
>   z-index: 1; pointer-events: none;
> }
> /* ⚠️ BẮT BUỘC: DPR overrides — padding = 1/DPR để ring đúng 1 physical pixel */
> @media (-webkit-min-device-pixel-ratio: 1.2) and (-webkit-max-device-pixel-ratio: 1.4),
>        (min-resolution: 115dpi) and (max-resolution: 143dpi) {
>   .btn--ai-outline::before { padding: 0.8px; }   /* DPR 1.25 */
> }
> @media (-webkit-min-device-pixel-ratio: 1.4) and (-webkit-max-device-pixel-ratio: 1.75),
>        (min-resolution: 144dpi) and (max-resolution: 191dpi) {
>   .btn--ai-outline::before { padding: 0.6667px; } /* DPR 1.5 — 2K fix */
> }
> @media (-webkit-min-device-pixel-ratio: 1.75),
>        (min-resolution: 192dpi) {
>   .btn--ai-outline::before { padding: 0.5px; }    /* DPR 2 */
> }
> ```
> `IconMisaAI` dùng SVG explicit colors → không bị ảnh hưởng bởi `color: transparent`.
| `btn btn--outline` | Brand outline | Chỉ khi user yêu cầu rõ |
| `btn btn--text` (· `-neutral` `-info` `-warning` `-danger` `-success`; Vue `<AppButton variant="text" color="…">`) | **Link button = Figma Button Style=Text** (6019:11920): cùng cao `--btn-height` / đệm 12 / min-width 80 / bo Radius/Default như nút thường, KHÔNG nền KHÔNG viền; hover nền Light Hover (Brand/100), nhấn Light Pressed, focus vòng brand cách 2px, disabled chữ màu Disabled | Nút hành động đứng riêng dạng link: “Xem tất cả”, “+ Thêm dòng”, “Tải mẫu”, “Xóa” (danger). ⛔ Không dùng `.btn--link` cho nút đứng riêng |
| `btn btn--link` | Chữ link chèn trong câu (chữ màu link, không nền/viền/padding, hover gạch chân) | Liên kết trong đoạn chữ, tên bản ghi bấm được. Nút đứng riêng → `btn--text` |
| `btn-icon btn-icon--outline` | Icon button medium | |
| `btn-icon btn-icon--sm` | Icon button nhỏ | Nav, paging, row actions |
| `btn-icon btn-icon--danger` | Icon button nguy hiểm | Xóa |

**⛔ Cỡ icon trong mọi nút = 16px** (`.btn`, `.btn-icon`, `.btn-icon--outline`, `--sm`, `--lg`, nút lọc cột bảng, nút phân trang).
mds-ui đã đặt sẵn `.btn .ti` / `.btn-icon .ti { font-size: 16px }` — KHÔNG override cỡ icon trong nút ở app.
Ngoại lệ: icon header toàn cục (`.btn-icon-white`) và sidebar giữ cỡ riêng.

**Icon header đang mở popover / panel** (chat, chuông, AVA, Thiết lập…): thêm class `.btn-icon-white--active` — **giống hệt hover** (header nền màu: trắng mờ 15% · header nền sáng: `--bg-neutral-hover`). ⛔ Không tự đặt nền trắng / xám nhạt cho trạng thái mở — icon trắng sẽ chìm mất trên header nền màu.

**Quy tắc hiển thị icon reload / settings trong card header (toàn bộ ứng dụng):**
Các icon button reload, settings trong header của card/box chỉ hiện khi hover vào card. Dùng CSS:
```css
.card .head-right .btn-icon { opacity: 0; transition: opacity 0.15s; }
.card:hover .head-right .btn-icon { opacity: 1; }
```
`.head-right` là wrapper chứa period select + icon buttons. Period select luôn hiển thị, chỉ ẩn icon buttons.

**Divider color rules (border-left của `.btn-split__arrow`):**
| Variant | Divider color |
|---------|--------------|
| `btn--primary`, `btn--success`, `btn--warning`, `btn--danger` (solid màu) | `rgba(0,0,0,0.2)` |
| `btn--ai`, `btn--black` (nền tối/gradient) | `rgba(255,255,255,0.2)` |
| `btn--outline` | `var(--stroke-brand)` |
| `btn--neutral` | `var(--stroke-neutral)` |
| `btn--outline-success/warning/danger` | stroke tương ứng |
| Disabled (bất kỳ variant nào) | `rgba(0,0,0,0.1)` |

```html
<!-- Split button pattern -->
<div class="btn-split">
  <button class="btn btn--primary">Label</button>
  <button class="btn btn--primary btn-split__arrow">
    <TIcon name="chevron-down" />
  </button>
</div>

<!-- AI button -->
<button class="btn btn--ai">
  <IconMisaAI />Thêm bằng AI
</button>

<!-- Dots utility button → LUÔN ở ngoài cùng phải trong TableHeader -->
<DropdownMenu ...>
  <template #trigger="{ toggle }">
    <button class="btn-icon btn-icon--outline" @click.stop="toggle">
      <TIcon name="dots" />
    </button>
  </template>
</DropdownMenu>
```

### DataTable (component — BẮT BUỘC dùng cho mọi bảng dữ liệu)

> **Nền dòng bảng = trắng (⛔ bắt buộc):** `.datatable`, mọi dòng dữ liệu `.dt-row--body` và thanh phân trang (`TablePaging`) dùng `background: var(--bg-white)` — **không** dùng `var(--neutral-50)` (đã đổi trong mds-ui 13/10/2026). Header bảng giữ `--dt-header-bg`, footer tổng cộng giữ `--dt-footer-bg`; dòng hover / chọn / đang mở giữ `--bg-brand-light`. Bảng tự viết ngoài DataTable cũng theo quy tắc này.

**Bảng sửa trực tiếp (`editable` + cột `numberbox` / `textbox` / `combobox`):** ô nhập có đệm trái/phải 8px; hover vào dòng → mọi ô sửa được của dòng hiện viền; hover / focus ô → viền brand (+ quầng sáng khi focus) như ô nhập chuẩn. Đã có trong mds-ui — không tự style lại.

**Cột `tag` nhiều giá trị:** hiện tối đa `col.maxTags` (mặc định 3) tag trên 1 hàng, phần còn lại gộp tag `+n` (hover xem tên); tag dài cắt “…”. Cột đặt “Hiển thị nhiều dòng” → hiện đủ. Không để tag tràn bị che.

**Cột `icon-text`:** giá trị `{ icon, text, iconColor?, iconTitle? }` — `iconColor`: `brand | success | warning | danger | neutral`, `iconTitle`: tooltip. Nếu cột dùng icon để báo trạng thái thì **mọi dòng đều có icon** (chữ thẳng hàng), không để dòng có dòng không.

**Cột `status` có giải thích:** giá trị `{ label, color, tip }` — có `tip` thì nhãn hiện biểu tượng ⓘ và rê chuột xem chi tiết (VD lý do lỗi / cần lưu ý ở bảng xem trước nhập khẩu). ⛔ Không thêm cột “Ghi chú” giả cho thông báo kiểm tra — người dùng dễ hiểu nhầm là trường dữ liệu sẽ được nhập.

**Cột sửa nhiều dòng (`type: 'textarea'`):** dùng với `editable` cho nội dung dài (VD Nội dung công việc trong bảng xem trước nhập khẩu) — ô tự giãn theo nội dung (`field-sizing: content`), tối đa ~6 dòng rồi cuộn; không sửa thì hiện đủ nhiều dòng. Bảng cần `:line-count="2"` (hoặc cột `wrap: true`) để dòng giãn theo. Bảng nằm trong hộp thoại / khung cố định: bọc `.table-scroll` + đặt chiều cao cố định cho khung (và `flex: none` nếu khung là con của flex column) → bảng tự cuộn 2 chiều, thanh cuộn ngang luôn ở đáy khung.

**Nhóm cột theo màu (`col.accent`):** đặt `accent: 'var(--role-ba)'` (bất kỳ màu CSS) lên cột → tiêu đề có chấm màu trước tên (không thêm vạch / viền màu trên đầu cột — đã thử, nhìn rối). `accentTip`: tooltip giải thích khi di lên chấm (nên có). Dùng khi bảng có nhiều nhóm cột thuộc các đối tượng khác nhau (VD cột của BA / của PD). Cột chung để trống. Màu nhóm định nghĩa thành token ở app (VD `--role-ba`, `--role-pd`), không dùng màu chủ đề / màu trạng thái. Bộ lọc người tương ứng truyền cùng màu qua `AvatarFilter accent` để làm chú thích.

**Đánh dấu dòng:** `_mark: 'current'` = dòng đang mở drawer (nền brand nhạt + vạch brand — BẮT BUỘC, xem SKILL.md “Dòng đang xem”) · `'warning' | 'danger' | 'brand'` = dòng cần chú ý; thêm vào object của dòng → vạch màu 3px ở đầu dòng (VD việc thiếu thông tin bắt buộc = `warning`). Không tự tô nền / viền dòng ở app.

```vue
<DataTable
  :columns="cols"
  :rows="rows"
  :hide-blank-rows="false"
  :row-actions="[{icon:'eye', title:'Xem', emit:'view'}, {icon:'pencil', title:'Sửa', emit:'edit'}, {icon:'trash', title:'Xóa', emit:'delete', danger:true}]"
  :more-actions="[{id:'export', icon:'file-export', label:'Xuất Excel'}]"
  :selected="selected"
  @update:selected="selected = $event"
  @row-click="onRowClick"
/>
```

**Props chính:**
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `columns` | Array | `[]` | Định nghĩa cột — xem bảng column types bên dưới |
| `rows` | Array | `[]` | Dữ liệu hàng — format theo column type |
| `hide-blank-rows` | Boolean | `true` | Ẩn hàng mà toàn bộ data cell đều rỗng |
| `selected` | Array | `[]` | Array row IDs đang được chọn (v-model pattern) |
| `row-actions` | Array | `[]` | Action buttons ở cuối mỗi hàng (max 3 + dots) |
| `more-actions` | Array | `[]` | Items cho DropdownMenu ở cuối row-actions |
| `show-footer` | Boolean | `false` | Hiện dòng Tổng — xem mục **DataTable — Dòng Tổng** bên dưới |
| `footer-label` | String | `'Tổng'` | Nhãn dòng Tổng — DataTable **tự đặt ở cột đầu tiên đang hiện** (bỏ qua cột tick chọn), đổi thứ tự / ẩn cột vẫn đúng chỗ |
| `pagination` | Boolean | `false` | Hiện AppPagination |

**Column definition format:**
```js
{ key: 'fieldName', label: 'Tiêu đề', type: 'text', width: 120, minWidth: 100, align: 'right' }
```

**Column types — ĐẦY ĐỦ 21 variants (Figma ReadOnly Column Table — node 6019:135478):**

> **Đọc kỹ từ Figma:** Tất cả variants đã được đọc và xác nhận từ Figma node 6019:135478.

| `type` | Figma name | Row height | Căn | Hiển thị chi tiết |
|--------|-----------|-----------|-----|-------------------|
| `text` | Type=Text | 36px (density) | left | Văn bản thuần 13px/400, `--text-primary-neutral`, ellipsis |
| `subtext` | Type=Text+Subtext | **56px** | left | Text 13px/**500**/primary trên + subtext 12px/400/secondary dưới, gap 2px |
| `avatar-text` | Type=Avatar+Text | 36px (density) | left | Avatar **24px** tròn (initials 9px/600) + text 13px/400, **gap 8px** |
| `avatar-subtext` | Type=Avatar+Text+Subtext | **56px** | left | Avatar **40px** tròn (initials 14px/600) + text 13px/**500** + subtext 12px/400/secondary, **gap 8px** |
| `status` | Type=Status | 36px | left | `<AppTag dot>` — Tag Dot Small: h24, radius 8px, dot 6px — **KHÔNG phải pill** |
| `tag` | Type=Tag | 36px | left | `<AppTag>` component(s), flex-wrap nếu nhiều |
| `icon-text` | Type=Icon+Text | 36px | left | Icon **20px** + text 13px/400, gap 8px (icon = TIcon size-20) |
| `trend-up` | Type=Trend Up | 36px | left | Value text 13px + Tag Small badge (success màu, icon arrow-up + % text), gap 8px |
| `trend-down` | Type=Trend Down | 36px | left | Value text 13px + Tag Small badge (danger màu, icon arrow-down + % text), gap 8px |
| `group-avatar` | Type=Group Avatar | 36px | left | AvatarGroupHorizontal: nhiều avatar 24px, overlap `margin-right: -6px`, "+N" neutral circle 24px khi quá 5 |
| `product-logo` | Type=Product Logo | **56px** | left | Logo image **32px** + product name text 13px/500, gap 8px — 2-line row |
| `rating` | Type=Rating | 36px | left | 5 star icons **20px** mỗi icon, gap **4px**, filled=brand/warning, empty=neutral-light |
| `progress` | Type=Progress Bar | 36px | left+right | Bar flex-1 (h8px, radius 8px, bg `--bg-neutral-light`, fill `--bg-brand`) + % text 13px/**600**/right |
| `icon` | Type=Icon | 36px | left | 1-2 icons **16px** (IconSwapResizeGroup), gap 12px giữa các icon |
| `swap-component` | Type=Swap Component | 36px | left | Slot tự do — developer tự render content vào `col.render` |

> **⛔ Dòng có 2 dòng chữ LUÔN cao 56px.** Bảng có cột `subtext` / `avatar-subtext` / `product-logo` (hoặc ô tự render 2 dòng chữ: tên + dòng phụ) → MỌI dòng phải cao **56px** (`--dt-row-height-2`), 2 dòng chữ cách nhau 2px và cách mép trên/dưới đều. KHÔNG để 2 dòng chữ chen trong dòng 32–36px (chữ dính nhau, dính viền).
> - `DataTable` tự nhận cột 2 dòng và dùng `dt-row--2line` — cột 2 dòng được ưu tiên hơn `lineCount` mặc định (= 1). KHÔNG truyền `:line-count="1"` / CSS ép `height` dòng để “cho gọn” khi bảng có cột 2 dòng.
> - Bảng / danh sách tự dựng ngoài DataTable có 2 dòng chữ: `min-height: 56px` + `padding` dọc, không đặt `height` cố định 32/36px.
> - Kiểm tra trước khi xong: mở màn, đo chiều cao dòng có 2 dòng chữ = 56px (Playwright `getBoundingClientRect().height`).
| `checkbox` | Type=Checkbox | 36px | center | `<AppCheckbox>` 16px, centered |
| `action-icon` | Type=Action Icon | 36px | right | 2 nút `btn-icon--sm` (28px, border neutral, radius 8), icon 16px mỗi nút, right-aligned |
| `action-text` | Type=Action Text | 36px | right | 2 text link (13px/400, `--text-link-brand`), gap 16px, right-aligned |
| `radio` | Type=Radio Button | 36px | center | Radio button 16px, centered |
| `toggle` | Type=Toggle Switch | 36px | center | Toggle 28px×16px, centered |
| `textbox` | — (editable) | 36px | left | Input khi `editable=true` |
| `numberbox` | — (editable) | 36px | right | Number input, right-align |
| `combobox` | — (editable) | 36px | left | Select dropdown, `col.options` |

**Avatar size theo type (từ Figma):**
| Type | Avatar size | CSS class | Ghi chú |
|------|------------|-----------|---------|
| `avatar-text` | **24px** | `.dt-avatar` | 1-line row — khớp với Type=Avatar+Text |
| `avatar-subtext` | **40px** | `.dt-avatar.dt-avatar--lg` | 2-line 56px row — khớp với Type=Avatar+Text+Subtext |

**Avatar màu sắc (khi không có URL ảnh):**
- Avatar tự render initials (2 ký tự đầu của tên) với **màu nền đa dạng** theo hash của tên
- **KHÔNG dùng màu xám đơn màu** — mỗi tên sẽ hash ra 1 trong 8 tone màu của palette
- Áp dụng cho tất cả types: `avatar-text`, `avatar-subtext`, `group-avatar`
- **Viền avatar (⛔ bắt buộc):** avatar KHÔNG có ảnh thật (initials, "+N") → `border: 1px solid var(--stroke-neutral-light)` qua class `.dt-avatar--initials` (DataTable tự gắn khi `!avatar`). Avatar CÓ ảnh thật → không viền (`.dt-avatar` mặc định `border: none`; `.dt-avatar--group` có ảnh giữ vòng trắng 2px).
- **Ảnh đại diện người dùng (⛔ bắt buộc khi app có đăng nhập Google / SSO):** truyền ảnh tài khoản (VD Google `picture` lưu khi đăng nhập) vào `avatar` ở MỌI chỗ hiện người dùng — cột `avatar-text` / `avatar-subtext` / `group-avatar`, danh sách chọn người, lịch sử, header (`user-picture`). Chưa có ảnh / ảnh lỗi (link Google hết hạn) → tự về chữ cái đầu: DataTable và ControlHeader đã xử lý (`referrerpolicy="no-referrer"` + `@error` → initials); avatar tự dựng ngoài DataTable phải làm tương tự (1 component avatar dùng chung trong app, không tự viết `<img>` rời).
- **Cột tên mở chi tiết (⛔ bắt buộc):** cột tên bản ghi mà bấm dòng sẽ mở chi tiết (VD Tên dự án) đặt `link: true` → rê chuột vào chữ chính: màu brand `--text-brand` (theo theme) + gạch chân (`.dt-cell--link`), báo cho người dùng biết bấm được. Ô 1 dòng: chữ link **căn giữa dọc như các ô khác**; chỉ ô 2 dòng (`subtext` / `avatar-subtext`) chữ chính co theo độ dài chữ (`.dt-cell--link .dt-subtext-wrap .dt-text { align-self: flex-start }`) — lỗi cũ chữ link 1 dòng bị đẩy lên mép trên đã sửa trong mds-ui (02/11/2026), không tự vá ở app.
- Áp dụng cho MỌI avatar initials trong app (bảng, header, lịch sử, danh sách…): nền + chữ theo `AVATAR_PALETTE` hash tên + viền `--stroke-neutral-light`. Avatar tự vẽ ngoài DataTable cũng phải theo đúng quy tắc này (`box-sizing: border-box` để viền không làm to avatar).

```js
// Palette 8 màu (bg nhạt + fg đậm cùng tone) — trong DataTable.vue
const AVATAR_PALETTE = [
  { bg: '#EFF8FF', fg: '#1570EF' }, // blue
  { bg: '#ECFDF5', fg: '#059669' }, // green
  { bg: '#FDF4FF', fg: '#9333EA' }, // purple
  { bg: '#FFF7ED', fg: '#EA580C' }, // orange
  { bg: '#F0FDFA', fg: '#0D9488' }, // teal
  { bg: '#FFF1F2', fg: '#E11D48' }, // rose
  { bg: '#EEF2FF', fg: '#4F46E5' }, // indigo
  { bg: '#FFFBEB', fg: '#D97706' }, // amber
]
function avatarColor(name = '') {
  const hash = [...(name || '')].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}
// Template: :style="!val.avatar ? { background: avatarColor(val.text).bg, color: avatarColor(val.text).fg } : {}"
```

**TWO_LINE_TYPES (auto trigger 56px):**
```js
const TWO_LINE_TYPES = new Set(['subtext', 'avatar-subtext', 'product-logo'])
// avatar-text là 1-line → KHÔNG trigger 56px
```

**Icon sizes trong DataTable (theo Figma):**
| Loại | Size | Ghi chú |
|------|------|---------|
| `icon-text` icon | **20px** | TIcon size-20 |
| `icon` (standalone) | **16px** | IconSwapResizeGroup |
| `action-icon` button icon | **16px** | btn-icon--sm là 28px container |
| `rating` star | **20px** | Star icon size-20 |

> ⚠️ **QUAN TRỌNG — chiều cao row và density setting:**
>
> **Density (compact/standard/comfortable)** chỉ ảnh hưởng đến **1-line row** (`--dt-row-height`):
> | Density | 1-line row | 2-line row | 3-line row |
> |---------|-----------|-----------|-----------|
> | Nhỏ | 32px | **56px (CỐ ĐỊNH)** | **72px (CỐ ĐỊNH)** |
> | Standard | 36px | **56px (CỐ ĐỊNH)** | **72px (CỐ ĐỊNH)** |
> | Comfortable | 40px | **56px (CỐ ĐỊNH)** | **72px (CỐ ĐỊNH)** |
>
> Hàng 2-line và 3-line KHÔNG thay đổi theo density — chiều cao lấy từ Cell component spec.
>
> - Nếu bảng có **bất kỳ cột nào** `type: 'subtext'`, `'avatar-subtext'`, hoặc `'product-logo'` → **TẤT CẢ row** tự động được 56px (class `dt-row--2line` tự thêm bởi DataTable component).
> - `type: 'avatar-text'` là 1-line (36px, density-controlled) — KHÔNG trigger 56px.
> - KHÔNG cần set height thủ công — logic đã xử lý hoàn toàn trong DataTable component.
> - CSS tokens: `--dt-row-height-2: 56px`, `--dt-row-height-3: 72px` (trong `mds-ui/src/style.css`).

**Row data format ví dụ:**
```js
// type: 'subtext' — 2 dòng không avatar
{ name: { text: 'Nguyễn Văn A', subtext: 'Phòng IT' } }

// type: 'avatar-text' — 24px avatar + 1 dòng text
{ manager: { text: 'Trần Thị B', avatar: '/avatars/ttb.jpg' } }
// hoặc dùng initials (không có URL avatar):
{ manager: { text: 'Trần Thị B' } }

// type: 'avatar-subtext' — 40px avatar + 2 dòng (Avatar+Text+Subtext)
{ emp: { text: 'Nguyễn Văn A', subtext: 'kỹ sư@misa.com.vn', avatar: '/avatars/nva.jpg' } }
// hoặc không có URL avatar — tự tạo initials từ text:
{ emp: { text: 'Nguyễn Văn A', subtext: 'kỹ sư@misa.com.vn' } }

// type: 'status' — bắt buộc { label, color }
// color: brand | success | warning | danger | info | neutral
{ status: { label: 'Hoạt động', color: 'success' } }
{ expiry: { label: '30/05/2026', color: 'danger' } }

// type: 'tag' — single hoặc array
{ contract: { label: 'Thử việc', color: 'warning' } }
{ skills: [{ label: 'Vue', color: 'brand' }, { label: 'React', color: 'neutral' }] }

// type: 'trend-up' / 'trend-down'
// value: số hiển thị chính, pct: % thay đổi (không cần ký hiệu %)
{ revenue: { value: '120,000,000', pct: 12.5 } }   // trend-up → green badge "↑ 12.5%"
{ cost: { value: '80,000,000', pct: 3.2 } }         // trend-down → red badge "↓ 3.2%"

// type: 'progress' — 0-100 (số nguyên)
{ completion: 75 }   // → bar 75% filled + "75%" text

// type: 'rating' — 0-5 (số nguyên hoặc thập phân)
{ score: 4 }   // → 4 sao vàng + 1 sao mờ

// type: 'group-avatar' — array objects
{ approvers: [
  { name: 'Nguyễn Văn A', avatar: '/img/a.jpg' },
  { name: 'Trần Thị B' },   // initials nếu không có avatar
] }

// type: 'product-logo' — { logo, name }
{ product: { logo: '/img/misa-logo.png', name: 'MISA AMIS HRM' } }

// type: 'action-text' — array text links
{ actions: [
  { label: 'Duyệt', emit: 'approve' },
  { label: 'Từ chối', emit: 'reject' },
] }

// type: 'action-icon' — array icon buttons (max 2)
{ rowBtns: [
  { icon: 'pencil', title: 'Sửa', emit: 'edit' },
  { icon: 'trash', title: 'Xóa', emit: 'delete', danger: true },
] }
```

**Color cho status/tag:**
| color | Background | Border | Text | Dot |
|-------|-----------|--------|------|-----|
| `brand` | `--bg-brand-light` | `--stroke-brand-light` | `--text-brand` | brand |
| `success` | `--bg-success-light` | `--stroke-success-light` | `--text-success` | success |
| `warning` | `--bg-warning-light` | `--stroke-warning-light` | `--text-warning` | warning |
| `danger` | `--bg-danger-light` | `--stroke-danger-light` | `--text-danger` | danger |
| `neutral` | `--bg-neutral-light` | `--stroke-neutral` | `--text-secondary` | secondary |

---

### Panel bên phải cao full màn hình (`v-side-panel`) — chat, trợ lý AI…

Panel kiểu chat / trợ lý AI **cao full màn hình (từ mép trên, phủ cả vùng header)** và **đẩy cả trang (kể cả header) sang trái**, không đè lên nội dung:

```vue
<Teleport to="body">
  <Transition name="slide"><aside v-if="open" class="side-panel my-panel" v-side-panel v-resizable-drawer="{ key: 'my-panel', min: 340 }">…</aside></Transition>
</Teleport>
```
- `.side-panel` (style.css): `position: fixed; top: 0; right: 0; bottom: 0`. Phải **Teleport ra body** (ngoài `.app-shell`).
- `v-side-panel` (`@mds/utils/sidePanel.js`) đặt biến `--side-panel-w` = độ rộng panel (theo dõi cả khi kéo đổi độ rộng) → `.app-shell` co lại `width: calc(100vw - var(--side-panel-w))`, rồi báo `resize` để biểu đồ vẽ lại.
- `.app-shell` có `contain: layout` → drawer / popover `position: fixed` bên trong neo theo trang đã co.
- Mỗi lúc chỉ mở 1 panel (mở panel này thì đóng panel kia).
- **Responsive vùng trái (giống ketoan-dashboard):** vùng app (header + sidebar + nội dung) **không co nhỏ dưới 1024px** (`.app-shell > * { min-width: 1024px }`). Panel mở làm vùng trái hẹp hơn → `.app-shell` hiện **thanh cuộn ngang cục bộ**, panel bên phải đứng yên; không bóp méo / ẩn nội dung.

### DataTable — Dòng Tổng (`show-footer`) — quy tắc chung

Áp dụng cho MỌI danh sách có cột số cần xem tổng (điểm, point, số lượng, tiền) — đặc biệt bảng chi tiết trong drawer.

1. **Vị trí theo Figma Data Table (6435:22421):**
   - **Ít dòng** (không phải cuộn) → dòng Tổng bám ngay sau dòng dữ liệu cuối; khoảng trắng còn lại nằm giữa dòng Tổng và Paging.
   - **Nhiều dòng, phải cuộn dọc** → dòng Tổng ghim đáy vùng cuộn, **sát ngay trên Paging** (như header ghim đỉnh) — cuộn vẫn luôn thấy tổng + phân trang.
   - CSS có sẵn trong `style.css`: `.dt-row--footer { position: sticky; bottom: var(--dt-pager-h, 0) }`. Vạch trên vẽ bằng `box-shadow: 0 -1px 0` (không chiếm chỗ → bám sau dòng cuối không thành vạch đôi), có `border-bottom` như dòng cuối. ⛔ Không thêm `border-top`.
   - Phân trang dựng sẵn (`:pagination="true"`, AppPagination nằm TRONG vùng cuộn) → DataTable tự thêm `.datatable--paged`: thanh phân trang ghim đáy, dòng Tổng ghim ngay trên (`--dt-pager-h: 48px`).
   - Kiểm tra: đo ở khung cao (ít dòng: `footer.top == lastRow.bottom`) và khung thấp + cuộn (`paging.top - footer.bottom == 0`).
2. **Bảng phải tự cuộn dọc** thì mới ghim được: bọc trong `.table-scroll`, hoặc trong khung flex cột cho `.datatable { flex: 1 1 auto; min-height: 0 (hoặc ~240px trong drawer); overflow: auto }`. Phần thông tin phía trên + `TablePaging` đứng yên. ⛔ Đừng để cả drawer / trang cuộn còn bảng thì không — dòng Tổng sẽ trôi.
3. **Nhãn “Tổng”:** KHÔNG tự gắn `footerText: 'Tổng'` vào cột nào — DataTable tự đặt ở cột đầu tiên đang hiện (`footer-label` để đổi chữ).
4. **Cộng trên TOÀN BỘ dữ liệu đang xem (đã lọc), không chỉ trang hiện tại** — dùng `sumBy` / `footerTotals` trong `@mds/utils/tableTotals.js`.
5. **Chỉ cộng cột cộng được:** điểm, point, số lượng, tiền. ⛔ KHÔNG cộng %, hệ số, tỷ lệ, ngày, trạng thái (để trống ô footer).
6. **Định dạng** giống ô trong cột (cùng số chữ số thập phân), căn phải như cột số.
   **Giao diện ô = Column Footer (Figma 6624:102337)** — có sẵn trong mds-ui, ⛔ không tự ghi đè:
   - Ô cao `--dt-footer-h` (36 · Nhỏ 32 · Rộng 40), tách khỏi chiều cao dòng thân bảng. Viền dưới 1px `--stroke-neutral` nằm TRONG ô. Đệm ngang 4px, nền `--dt-footer-bg` (Neutral/150).
   - Nội dung (Footer Items) cao `--input-height`, đệm ngang 12px, gap 8px.
   - Chữ 13/20 **Semi Bold** `--text-primary` cho cả nhãn “Tổng” lẫn số (⛔ không Bold 700).
   - Không vạch ngăn giữa các ô footer.
7. **Các màn cùng loại phải có dòng Tổng như nhau** (VD bảng chi tiết điểm PD có thì bảng chi tiết điểm BA cũng phải có).

```js
import { sumBy, footerTotals } from '@mds/utils/tableTotals.js'
// cách 1: tự gắn từng cột
const cols = computed(() => [
  { key: 'pbi',    label: 'PBI', width: 80 },                       // nhãn “Tổng” tự hiện ở đây
  { key: 'point',  label: 'BA Point', align: 'right', footerText: fmt(sumBy(allItems.value, 'baPoint')) },
  { key: 'rate',   label: 'Hệ số tiến độ', align: 'right' },         // % → không cộng
])
// cách 2: gắn hàng loạt
const cols2 = computed(() => footerTotals(BASE_COLS, allItems.value, { point: 'baPoint', actual: 'actual' }, fmt))
```
```vue
<div class="table-scroll" style="flex: 1; min-height: 0">
  <DataTable :columns="cols" :rows="view.paged.value" :show-footer="true" />
</div>
<TablePaging … />
```

### DataTable — Gom nhóm dòng (groupBy)

```vue
<DataTable :rows="groupedRows" group-by="_groupKey" :group-label="key => labelOf(key)" group-storage-key="projects" … />
```
- `groupBy`: tên trường trong mỗi dòng chứa khóa nhóm (`''` = nhóm trống). Nhóm hiện theo thứ tự xuất hiện trong `rows` → **sắp xếp rows theo nhóm trước** khi truyền vào.
- Mỗi nhóm có dòng tiêu đề (mũi tên · icon folder · tên · số dòng), bấm để thu gọn / mở; nhóm đang đóng được nhớ theo `groupStorageKey`.
- Gom nhóm thì **không phân trang** (truyền đủ rows, ẩn TablePaging, hiện tổng số) để nhóm không bị cắt giữa các trang.
- Nút bật / tắt chế độ gom: `btn btn--outline btn--neutral` + class `btn--active` khi đang bật (`aria-pressed`).

### useArrowNav — ↑ / ↓ chuyển dòng khi đang mở drawer (BẮT BUỘC cho danh sách có drawer xem chi tiết)

```js
import { useArrowNav } from '@mds/utils/arrowNav.js'
useArrowNav({
  ids: () => view.processed.value.map(r => r.id),   // đúng thứ tự đang lọc + sắp xếp (gồm các trang khác)
  current: drawerId,                                 // ref id đang mở drawer
  select: (id, i) => { drawerId.value = id; view.page.value = Math.floor(i / view.pageSize.value) + 1 },   // sang trang nếu cần
  // active: () => !innerDrawerId.value,             // 2 tầng drawer: chỉ tầng trên nhận phím
  // scroll: '.table-panel .dt-row--mark-current',   // dòng cần cuộn tới (mặc định .dt-row--selected)
})
```
- Không chiếm phím khi đang gõ trong ô nhập / danh sách thả xuống / hộp thoại.
- ⛔ Dòng đang mở BẮT BUỘC được tô suốt lúc drawer mở: bảng có cột tick (dù chỉ hiện với một số quyền) → LUÔN `row._mark = 'current'` (`.dt-row--mark-current`), không dùng `:selected` cho việc này; bảng không có cột tick mới dùng `:selected="[drawerId]"`. Khai báo `drawerId` TRƯỚC computed của dòng.

### DataTable — Column Header Context Menu & Filter Popover

> **Nguồn Figma:** node `34940:24728` — bấm vào tiêu đề cột → context menu; hover → icon filter → popover lọc.

#### Emits liên quan (DataTable component tự xử lý UI; parent nhận để thực hiện dữ liệu)

| Emit | Payload | Mô tả |
|------|---------|-------|
| `column-sort` | `(col, dir)` — dir: `'asc'` \| `'desc'` \| `null` | User chọn sắp xếp hoặc bỏ sắp xếp |
| `column-filter` | `(col, { condition, value })` | User áp dụng filter — condition là string, value là string |
| `column-hide` | `(col)` | User chọn "Ẩn cột" |
| `column-move` | `(col, pos)` — pos: `'first'` \| `'last'` | User chọn "Đặt làm cột đầu/cuối" |
| `column-insert` | `(col, side)` — side: `'left'` \| `'right'` | User chọn "Thêm cột bên trái/phải" |
| `column-wrap` | `(col, wrap)` — wrap: `true` \| `false` | User chọn chế độ hiển thị 1 dòng / nhiều dòng |

#### State nội bộ tự quản lý (không cần props từ ngoài)

| State | Kiểu | Mô tả |
|-------|------|-------|
| `sortState` | `ref({})` | `{ [colKey]: 'asc' \| 'desc' }` — key không có = không sắp xếp |
| `colFilters` | `ref({})` | `{ [colKey]: { condition, value } }` — filter đang active |
| `pinnedCols` | `ref(new Set())` | Tập hợp key của các cột đang bị ghim |
| `internalHiddenCols` | `ref(new Set())` | Tập hợp key của các cột đang bị ẩn (ẩn nội bộ) |
| `headerMenu` | `ref(null)` | `{ col, x, y }` khi menu đang mở; `null` khi đóng |
| `filterPopover` | `ref(null)` | `{ col, x, y }` khi popover đang mở; `null` khi đóng |
| `filterDraft` | `ref({ condition: 'contains', value: '' })` | Draft filter chưa áp dụng |
| `hoveredHeaderKey` | `ref(null)` | key cột đang hover (để hiện filter button) |

#### `visibleCols` computed (bao gồm pin + hide logic)

```js
// ⚠️ pinnedCols và internalHiddenCols PHẢI khai báo TRƯỚC visibleCols computed
// (const không được hoisted trong <script setup>)
const pinnedCols         = ref(new Set())
const internalHiddenCols = ref(new Set())

const visibleCols = computed(() => {
  const cols = props.columns.filter(c => !c.hidden && !internalHiddenCols.value.has(c.key))
  const pinned   = cols.filter(c => pinnedCols.value.has(c.key))
  const unpinned = cols.filter(c => !pinnedCols.value.has(c.key))
  return [...pinned, ...unpinned]   // Pinned columns always appear first
})
```

#### Context menu — UX

- **Trigger:** click vào `.dt-cell-inner--header` (toàn bộ vùng tiêu đề, trừ filter button)
- **Đóng:** click outside (overlay trong suốt) hoặc sau khi chọn một action
- **3 groups** (Figma spec):
  1. **Sort**: Không sắp xếp / Tăng dần / Giảm dần / Ghim cột (với checkmark khi active)
  2. **Position**: Bỏ ghim (hiện khi đang ghim) / Đặt cột đầu tiên / Đặt cột cuối cùng / Thêm cột bên trái
  3. **Manage**: Thêm cột bên phải / Ẩn cột (danger style) / Hiển thị 1 dòng / Hiển thị nhiều dòng
- **Visual states:**
  - `.dt-cell--sorted` / `.dt-cell--filtered` → cell header highlight nhạt brand (light brand bg)
  - Sort icon (`.dt-sort-icon`): `arrow-up` / `arrow-down` 14px brand color, ngay sau label text
  - Filter dot (`.dt-filter-dot`): 6px circle brand color, ngay sau sort icon
  - Checkmark (`.dt-menu-check`): icon `check`, margin-left auto, brand color — hiện khi item active

#### Filter popover — UX

- **Trigger:** hover vào header cell → hiện `.dt-filter-btn` (funnel icon, 20px, absolute right 8px) → click
- **Filter button visibility:**
  - `.dt-filter-btn`: mặc định ẩn (opacity 0)
  - `.dt-filter-btn--visible`: hover (hoveredHeaderKey match) → hiện
  - `.dt-filter-btn--active`: có filter đang active → luôn hiện, icon màu brand
- **Popover:** width 280px, radius 12px, shadow, padding 16px, Teleport to body
- **Form fields:**
  1. **Điều kiện lọc** — native `<select>` styled, 8 options:
     - `contains` (Chứa — mặc định) · `not-contains` · `equals` · `not-equals`
     - `starts-with` · `ends-with` · `empty` (Rỗng) · `not-empty` (Không rỗng)
  2. **Nhập hoặc chọn giá trị** — text input, ẩn khi condition là `empty` / `not-empty`
- **Auto-focus:** khi mở popover, tự động focus vào input giá trị (`nextTick` + `filterInputRef.value?.focus()`)
- **Mặc định:** `filterDraft = { condition: 'contains', value: '' }` khi mở popover (load filter cũ nếu có)
- **Actions:**
  - **Enter** trong input → tự động áp dụng (keydown.enter)
  - **Áp dụng** → lưu vào `colFilters[col.key]`, emit `column-filter`, đóng popover
  - **Hủy** → đóng popover, không thay đổi
  - **Esc** → đóng popover (keydown.esc trên container)

#### Column def property `noFilter`

```js
// Tắt filter button cho cột cụ thể:
{ key: 'actions', label: '', type: 'action-icon', width: 80, noFilter: true }
```

#### Ví dụ handle emits ở parent

```js
// Sắp xếp phía client (đơn giản):
function onColumnSort(col, dir) {
  if (!dir) { rows.value = [...originalRows]; return }
  rows.value = [...rows.value].sort((a, b) => {
    const va = a[col.key], vb = b[col.key]
    return dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
  })
}

// Lọc phía client:
function onColumnFilter(col, { condition, value }) {
  if (condition === 'empty') {
    rows.value = originalRows.filter(r => !r[col.key])
  } else if (condition === 'contains') {
    rows.value = originalRows.filter(r => String(r[col.key] ?? '').includes(value))
  }
  // ...
}

// Ẩn cột:
function onColumnHide(col) {
  const idx = cols.value.findIndex(c => c.key === col.key)
  if (idx !== -1) cols.value[idx] = { ...cols.value[idx], hidden: true }
}
```

---

### fmtNum / fmtPct / parseNum — định dạng số (TT200, bắt buộc)

```js
import { fmtNum, fmtPct, parseNum, setNumberLocale } from '@mds/utils/number.js'
fmtNum(1163.389)              // '1.163,389'  (mặc định tối đa 3 số lẻ)
fmtNum(12350.5, { decimals: 2, min: 2 })  // '12.350,50'
fmtNum(1500000, { decimals: 0 })          // '1.500.000'
fmtPct(91.5)                  // '91,5%'
parseNum('1.234,5')           // 1234.5  (đọc chuỗi người dùng gõ / dán)
setNumberLocale('en-US')      // app nhiều thị trường: 1,234,567.89
```

- DataTable tự định dạng ô **căn phải** có giá trị `number`; `col.decimals` đổi số lẻ, `col.format: false` giữ nguyên (mã, năm). Ô truyền sẵn chuỗi thì phải tự `fmtNum` trước.
- KPI: `<div class="kpi-num">{{ typeof k.value === 'number' ? fmtNum(k.value) : k.value }}</div>` · dòng Tổng: `footerText: fmtNum(sumBy(rows, 'score'))`.
- ECharts: `tooltip.valueFormatter: v => fmtNum(v)`, `yAxis.axisLabel.formatter: v => fmtNum(v)`.

### Năm dạng thông báo (Figma Thông báo — trang /ds/announcement)
| Dạng | Control | Cách dùng |
|---|---|---|
| Kêu gọi hành động | `AppAlertDialog` | Người dùng PHẢI chọn trước khi tiếp tục (xem Dialog) |
| Toast | `toast.success/error/warning/info(msg)` + `<AppToaster />` | Phản hồi nhanh thao tác: giữa phía trên, **tự ẩn 5 giây**, **tối đa 3 cái** (mới nhất trên cùng), rộng theo chữ, tối đa 400px |
| Notification | `notify.success/error/warning/info({ title, message })` + `<AppNotifier />` (hoặc thẻ tĩnh `AppNotification`) | Sự kiện quan trọng cần xem lại (hệ thống bắn, thường kèm chuông): góc PHẢI phía trên dưới header, **không tự đóng**, bấm × tắt; mới nhất trên cùng |
| Inline | `AppInlineAlert` (`stacked` = tiêu đề 1 dòng riêng, nội dung xuống dưới; mặc định tiêu đề cùng hàng) | Nằm trong nội dung trang / popup / card, gần khu vực liên quan; × tùy trường hợp |
| Global Inline | `AppGlobalAlert` (`type` info · warning · danger · success · neutral, `variant` solid · light, `action-label`, `closable`) | Dải toàn app TRÊN CÙNG, phía trên header (hết hạn dùng, sắp bảo trì, hệ thống chậm) |

### AppInlineAlert — thông báo inline trong luồng trang

Thanh thông báo nằm **trong nội dung** (đầu trang / đầu form), không nổi, không tự tắt — dùng cho nhắc việc theo thời điểm, lưu ý quan trọng của màn hình. Thông báo tức thời sau thao tác → dùng `toast()`; lỗi ô nhập → `ErrorTip`.

```vue
import AppInlineAlert from '@mds/components/AppInlineAlert.vue'

<AppInlineAlert type="warning" title="Sắp chốt điểm tháng 10/2026" closable @close="hide">
  Từ ngày 1–5 hàng tháng các quản lý sẽ chốt điểm…
  <template #actions><button class="btn btn--outline btn--sm">Xem việc</button></template>
</AppInlineAlert>
```

| Prop | Ý nghĩa |
|---|---|
| `type` | `info` (mặc định) · `warning` · `success` · `danger` — nền `--bg-*-light`, viền `--stroke-*-light`, icon theo màu type |
| `title` | Tiêu đề in đậm đứng trước nội dung (tùy chọn) |
| `icon` | Tên icon Tabler; bỏ trống → `info-circle` / `alert-triangle` / `circle-check` / `alert-circle` |
| `closable` | Hiện nút × (`.btn-icon--sm`), phát `close` — nơi dùng tự nhớ trạng thái ẩn (VD localStorage theo kỳ) |

Quy tắc: icon, chữ, nút × **căn giữa theo chiều dọc** (box thấp — xem quy tắc “Box / card thấp” trong SKILL.md); đặt làm phần tử **đầu tiên trong `.content-wrapper`** (cuộn cùng trang, cách card bên dưới bằng gap sẵn có); chữ 13px; tối đa 1 thanh mỗi trang; ⛔ không tự vẽ hộp thông báo màu khác. CSS: `.inline-alert*` trong `mds-ui/src/style.css`.

### Danh sách trong popup — bảng giãn hết chiều cao, phân trang ghim đáy (trang /ds/popup)
Áp dụng cho popup / vùng có chiều cao cố định chứa danh sách (Chọn nhân viên, Chọn hàng hóa, Danh sách đã chọn, tab chi tiết có bảng…):
- **Khung bảng lấp đầy chiều cao còn lại** của popup (sau tiêu đề, thanh tìm kiếm / lọc), kéo tới sát footer nút Hủy / Đồng ý.
- **Thanh phân trang (Tổng số · Số dòng/trang · chuyển trang) luôn ghim ở ĐÁY khung bảng**, ngay trên footer — vị trí cố định dù có 1 dòng hay 100 dòng.
- **Ít dòng** → phần trống nằm TRONG khung bảng (giữa dòng cuối và thanh phân trang, nền trắng). **Nhiều dòng** → vùng dòng tự cuộn bên trong, tiêu đề cột và phân trang đứng yên.
- **Không có dữ liệu** → màn trống (Empty state) ở giữa khung bảng, khung vẫn giữ nguyên chiều cao.
- Chiều cao popup **cố định theo cỡ popup**, không co giãn theo số dòng → lọc / chuyển trang / bỏ chọn popup không nhảy kích thước.
- ⛔ **Không vẽ** khung bảng co theo số dòng làm thanh phân trang “nổi” lơ lửng giữa popup, bên dưới là khoảng trắng lớn tới footer (popup trông cụt, trống, mắt phải dò tìm phân trang ở vị trí khác nhau mỗi lần).
- Thi công (mds-ui): thân popup `display: flex; flex-direction: column`, khung bảng `.table-panel.table-panel--fill.table-panel--bordered` (viền thay bóng vì trắng trên trắng) (giãn hết phần còn lại; `.table-scroll` cuộn trong, phân trang ở đáy).

### AppCrossSell — thanh “Tiện ích” quảng cáo / liên kết bán chéo (trang /ds/advertising-cross-selling)

```vue
<AppCrossSell title="Tiện ích" subtitle="Ưu đãi MISA" :items="[{ id, label, icon, tone: 'brand|success|info|warning|danger|purple|pink' }]" @select="it => open(it)" />
```
- Đặt TRÊN CÙNG vùng nội dung màn Tổng quan (trên KPI / biểu đồ). Card .surface đệm 16; nhóm = .kpi-icon 36 + tiêu đề 13 Semi Bold + dòng phụ 13 Text/Secondary + vạch ngăn.
- Thu gọn: các mục (ô icon 32 nền nhạt cùng tông + tên 13) vừa 1 hàng, mục tràn ẩn trọn vẹn → “Xem thêm ⌄” (btn--text) chỉ hiện khi có mục ẩn. Mở rộng: lưới thẻ viền Stroke/Neutral Light bo 8 đệm 12 cách 12, **trượt xuống** (grid-template-rows 0fr → 1fr) đẩy nội dung, “Thu gọn ⌃”. Rê mục: nền Brand Light. Vào trang luôn thu gọn.

### AppAccordion (Figma Accordion 6019:928, trang /ds/accordion)

```vue
<AppAccordion v-model="open" :items="[{ key: 'a', title: 'Tiêu đề', content: 'Nội dung' }, { key: 'b', title: 'Tiêu đề 2' }]">
  <template #item-b>…nội dung có control…</template>
</AppAccordion>
```
- `outline` (mặc định true = Style Outline True: mục tách rời, nền trắng, viền 1px Stroke/Neutral, bo 8, cách 12) · `false` = liền khối, viền trên khối + viền dưới mỗi mục.
- Mục đệm 16; tiêu đề H3 16/22 Semi Bold + chevron 20 Icon/Neutral (đóng ⌄ · mở ⌃); tiêu đề → nội dung 12; nội dung 13/20.
- `v-model` = mảng key đang mở · `multiple` (mặc định true; false = mở 1 đóng các mục khác) · `disabled` theo mục. Cả hàng tiêu đề là `<button aria-expanded>`.
- ⛔ Không tự dựng khối thu gọn / mở rộng riêng — dùng AppAccordion.

### AppTag (component — Figma Tag 15146:127716, trang /ds/tag)

```vue
<AppTag label="Đã duyệt" color="success" />                      <!-- Outline · Small 24 (mặc định) -->
<AppTag label="Mới" color="brand" variant="solid" size="md" />
<AppTag label="Hoạt động" color="success" dot />                <!-- Tag Dot (trạng thái) -->
<AppTag label="Chưa chốt" color="warning" variant="text" dot /> <!-- Tag Dot kiểu Text: không nền -->
<AppTag label="Thiết kế" icon="tag" />  ·  <AppTag avatar="Nguyễn Thu Hà" label="Thu Hà" />
<AppTag icon="star" color="warning" aria-label="Quan trọng" v-tip="'Quan trọng'" />   <!-- chỉ icon, vuông -->
<AppTag label="Thiết kế" clickable @click="…" />                <!-- <button>: Hover / Pressed / Focus -->
<div class="app-tag-group">…<AppTag label="+3" class="app-tag--more" v-tip="…" /></div>   <!-- nhóm (chỉ dữ liệu hiển thị), cách 4 -->
```

| Prop | Mặc định | Giá trị |
|---|---|---|
| `color` | `neutral` | `neutral` · `brand` · `accent` · `info` · `warning` · `danger` · `success` |
| `variant` | `outline` | `outline` (nền Light + viền Light + chữ màu) · `solid` (nền đậm, chữ trắng) · `text` (chỉ với `dot`: không nền, chữ 13 Regular) |
| `size` | `sm` | `xs` 20 (đệm 4, bo 4, chữ 12/18) · `sm` 24 (đệm 8, cách 6, bo 8, chữ 12/18) · `md` 28 (đệm 8, cách 4, bo 8, chữ 13/20) — chữ Medium; icon 12 / 12 / 16 |
| `dot` · `icon` · `icon-right` · `avatar` / `avatar-src` | — | chấm 6px (đệm trái 6/8/8) · icon trái / phải · avatar = ẢNH tròn 12/12/16 (`avatar-src`; viền 1px Stroke/Neutral nằm trong cỡ ảnh, không ảnh → chữ cái đầu) (đệm trái 4/6/6) · có `icon` không `label` = tag chỉ icon vuông |
| `clickable` · `disabled` | false | bấm được → Hover {Màu} Hover / Light Hover, Pressed, Focus vòng 2px Stroke/Brand cách 2px bo 12 · disabled: Solid nền {Màu} Disable chữ trắng 70%, Outline nền trắng 70% chữ {Màu} Disabled |

- Neutral: Solid = Neutral/950 (hover 800, nhấn 900); Outline chữ Text/Primary (có chấm → Text/Secondary), viền Stroke/Neutral.
- Nhóm tag `.app-tag-group` + “+N” (Neutral, chữ Text/Secondary, ở **cuối**, tooltip các mục còn lại) CHỈ cho dữ liệu chỉ hiển thị (ô bảng, màn chi tiết). Chọn nhiều trong ô nhập → AppCombobox multiple (có cách hiện tag riêng), ⛔ không ghép AppTag vào ô nhập.
- ⛔ Không tự vẽ chip / badge bằng span riêng — dùng AppTag (hoặc class `.app-tag .app-tag--{màu} .app-tag--{kiểu}` khi không dùng được component).

---

## 3. Score Card (Chart Stat Card + Chart Card — Figma 6810:42116)

> **Nguồn:** [MDS Web Components v2.0 — node 6810:42116](https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0?node-id=6810-42116)  
> **Quy tắc mặc định:** Mọi score card / stat card / chart card trong app đều PHẢI tuân theo spec này.

### Chart Stat Card (node 6828:52005) — card số liệu KPI

```
┌──────────────────────────────────────────┐
│ Title               ↺        [🔷 icon]   │  ← Header: title + reload (hover) | icon badge (phải)
│ 300                                      │  ← Value: 24px/700/bold, tabular nums
│ ↑ +3%  so với tháng trước                │  ← Trend badge
└──────────────────────────────────────────┘
```

**Spec chi tiết:**
| Thuộc tính | Giá trị |
|---|---|
| Container | `bg-white`, `border-radius: 8px`, `box-shadow: var(--shadow-card)`, **`padding: 20px`** |
| Layout | `flex-direction: column`, `gap: 8px` |
| Title font | `16px / font-weight: 600` (semibold), `color: --text-primary` |
| Value font | `24px / font-weight: 700` (bold), `line-height: 28px`, tabular (`font-feature-settings: 'lnum' 1, 'tnum' 1`) |
| Trend icon | `20px`, màu theo up/down |
| Trend pct | `13px / 600`, màu `--text-success` (up) hoặc `--text-danger` (down) |
| Trend label | text tuỳ chọn, `13px / 400`, `--text-secondary` |
| Reload icon | 24×24px, `opacity: 0` mặc định, `opacity: 1` khi hover — INLINE sau title text |
| **Icon badge** | 40×40px, `border-radius: 10px`, nền nhạt + icon stroke màu đậm cùng tone — góc phải header |
| card__head | `padding: 0` — **card container tự có padding 20px, KHÔNG thêm padding vào head** |

**Icon badge themes:**

| `theme` | Background | Icon color | Dùng khi |
|---|---|---|---|
| `brand` | `--bg-brand-light` | `--text-brand` | Tổng quan, nhân sự |
| `success` | `--bg-success-light` | `--text-success` | Tăng trưởng, tuyển mới |
| `danger` | `--bg-danger-light` | `--text-danger` | Nghỉ việc, rủi ro |
| `warning` | `--bg-warning-light` | `--text-warning` | Chờ duyệt, cảnh báo |
| `info` | `--chart-c5` pha 12% | `--chart-c5` | Thông tin |
| `blue` | `#2e90fa` pha 12% | `#2e90fa` | Số lượng, thời gian |
| `purple` | `--chart-c6` pha 12% | `--chart-c6` | Điểm, tổng điểm |
| `pink` | `#ee46bc` pha 12% | `#ee46bc` | Chất lượng, đánh giá |

> **Icon minh hoạ trên KPI card (BẮT BUỘC):** icon **dạng outline** (TIcon Tabler nét, stroke 1.75 — ⛔ không dùng icon tô đặc / filled, không dùng emoji, ảnh) đặt trong **ô vuông bo góc nền màu nhạt cùng tông** (`.kpi-icon` + `.kpi-icon--{theme}`: nền = màu pha nhạt, icon = màu đậm). ⛔ Không đặt icon trần không nền, không dùng nền đậm + icon trắng. mds-ui đã ép `fill: none` cho svg trong `.kpi-icon`.
>
> **Dãy KPI cùng hàng: mỗi card 1 màu icon khác nhau** cho sinh động (VD purple · blue · success · warning) — không lặp `brand` cho nhiều card. Class `.kpi-icon--{theme}` có sẵn trong mds-ui (style.css), app không tự định nghĩa lại.

**Vue template:**
```vue
<div class="kpi-card">
  <!-- Header: title + reload | icon badge -->
  <div class="card__head card__head--kpi">
    <div class="card__title-wrap">
      <span class="kpi-card__title">{{ card.label }}</span>
      <button class="card__btn-icon"><TIcon name="refresh" /></button>
    </div>
    <div class="kpi-icon-badge" :class="`kpi-icon-badge--${card.theme}`">
      <TIcon :name="card.icon" />
    </div>
  </div>
  <!-- Stat: value + trend -->
  <div class="kpi-card__stat">
    <div class="kpi-card__value">{{ card.value }}</div>
    <div class="kpi-card__trend" :class="card.pctUp ? 'trend--up' : 'trend--down'">
      <TIcon :name="card.pctUp ? 'trending-up' : 'trending-down'" />
      <span class="trend-pct">{{ card.pct }}</span>
      <span class="trend-label">{{ card.pctLabel }}</span>
    </div>
  </div>
</div>
```

**Data format:**
```js
{
  label: 'Tổng nhân viên', value: '248',
  pct: '+3', pctUp: true, pctLabel: 'so với tháng trước',
  icon: 'users',      // TIcon name
  theme: 'brand',     // brand | success | danger | warning
}
```

---

### Chart Card (node 6828:47458) — card có vùng biểu đồ / bảng

```
┌──────────────────────────────────────────┐  padding: 20px
│ Title              ↺     [period]  ⚙     │  ← card__head (padding: 0)
│ ┌──────────────────────────────────────┐ │
│ │         [Chart / Table Area]         │ │  ← margin-top: 12px (gap head → body)
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

**Spec chi tiết:**
| Thuộc tính | Giá trị |
|---|---|
| Container | **`padding: 20px`** — card tự có padding, KHÔNG dùng padding trong head/body |
| card__head | `padding: 0` — **KHÔNG tự thêm padding** |
| Gap head → body | `margin-top: 12px` trên `.chart-area` hoặc element body đầu tiên |
| Header title | `16px / 600`, `color: --text-primary` |
| Reload | Inline sau title (Button Group Left), hover only |
| Period select | Trong `.head-right`, **luôn hiển thị** (không hover-only) |
| Settings | Trong `.head-right`, hover only |
| Table card | `.card--table { padding-bottom: 0 }` — DataTable sát cạnh dưới card |

**Vue template:**
```vue
<div class="card card--chart">
  <div class="card__head">
    <div class="card__title-wrap">
      <span class="card__title">Tiêu đề biểu đồ</span>
      <button class="card__btn-icon"><TIcon name="refresh" /></button>
    </div>
    <div class="head-right">
      <!-- Period select (luôn hiển thị) -->
      <select class="period-sel" v-model="period">
        <option>6 tháng gần nhất</option>
        <option>12 tháng gần nhất</option>
      </select>
      <button class="card__btn-icon"><TIcon name="settings" /></button>
    </div>
  </div>
  <!-- Chart body: margin-top: 12px để tách khỏi head -->
  <div class="chart-area"></div>
</div>
```

**CSS classes (trong `<style scoped>`):**
```css
/* Card container: padding 20px trên tất cả cạnh */
.card {
  background: var(--bg-white);
  border-radius: var(--radius-default);
  box-shadow: var(--shadow-card);
  padding: 20px;
}
/* Table card: DataTable đi sát cạnh dưới */
.card--table { padding-bottom: 0; }

/* KPI card */
.kpi-card {
  background: var(--bg-white);
  border-radius: var(--radius-default);
  box-shadow: var(--shadow-card);
  padding: 20px;
  display: flex; flex-direction: column; gap: 8px;
}

/* card__head: KHÔNG có padding riêng */
.card__head { display: flex; align-items: center; justify-content: space-between; padding: 0; gap: 8px; }
.card__head--kpi { padding: 0; }

/* Title wrap: title text + reload inline */
.card__title-wrap { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }

/* Shared button icon: ẩn mặc định, hiện khi hover card */
.card__btn-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border: none; background: transparent;
  border-radius: 6px; cursor: pointer; color: var(--text-secondary);
  flex-shrink: 0; padding: 0;
  opacity: 0; transition: opacity 0.15s, background 0.1s;
}
.kpi-card:hover .card__btn-icon,
.card:hover .card__btn-icon { opacity: 1; }
.card__btn-icon:hover { background: var(--bg-neutral-hover); }
.card__btn-icon .ti { font-size: 16px; }

/* Icon badge: nền nhạt + icon stroke màu đậm */
.kpi-icon-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
}
.kpi-icon-badge .ti { font-size: 22px; stroke-width: 1.5; }
.kpi-icon-badge--brand   { background: var(--bg-brand-light);   color: var(--text-brand);   }
.kpi-icon-badge--success { background: var(--bg-success-light); color: var(--text-success); }
.kpi-icon-badge--danger  { background: var(--bg-danger-light);  color: var(--text-danger);  }
.kpi-icon-badge--warning { background: var(--bg-warning-light); color: var(--text-warning); }

/* KPI title */
.kpi-card__title { font-size: 16px; font-weight: var(--fw-semibold); color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }

/* KPI value */
.kpi-card__value, .kpi-value__num { font-size: var(--text-h1); font-weight: 700; line-height: var(--text-h1-lh); font-feature-settings: 'lnum' 1, 'tnum' 1; }   /* số chính KPI = H1 24/32 */

/* Trend badge */
.kpi-card__trend { display: flex; align-items: center; gap: 4px; font-size: 13px; line-height: 20px; }
.kpi-card__trend .ti { font-size: 20px; }
.trend--up   .ti, .trend--up   .trend-pct { color: var(--text-success); }
.trend--down .ti, .trend--down .trend-pct { color: var(--text-danger); }
.trend-pct   { font-weight: var(--fw-semibold); }
.trend-label { color: var(--text-secondary); }

/* Chart area: dùng margin-top thay vì padding */
.chart-area { height: 200px; margin-top: 12px; }
```

---

## 3. DataTable structure

```html
<!-- Datatable (scrollable body) -->
<div class="datatable" ref="tableRef">
  <!-- Header -->
  <div class="dt-row dt-row--header">
    <div class="dt-cell dt-cell--header" style="width:44px;flex-shrink:0">
      <div class="dt-cell-inner"><AppCheckbox v-model="selectAll" /></div>
    </div>
    <div v-for="col in cols" class="dt-cell dt-cell--header" :style="cellStyle(col)">
      <div class="dt-cell-inner">
        <span class="dt-header-text">{{ col.label }}</span>
      </div>
      <div class="dt-col-divider" @mousedown.prevent="startResize($event, col)"></div>
      <!-- dt-col-divider của cột cuối cùng tự ẩn qua CSS :last-child — không cần xử lý thêm -->
    </div>
  </div>

  <!-- Body rows -->
  <div v-for="(row, i) in rows" class="dt-row dt-row--body"
    :class="{ 'dt-row--selected': selected.includes(i), 'dt-row--active': activeRow === i }"
    @click="selectRow(i)">
    <div class="dt-cell" style="width:44px;flex-shrink:0">
      <div class="dt-cell-inner"><AppCheckbox v-model="selected" :value="i" @click.stop /></div>
    </div>
    <!-- data cells -->
    <div class="dt-cell dt-cell--actions">
      <div class="row-actions">
        <button class="btn-icon btn-icon--sm btn-icon--outline"><TIcon name="eye" /></button>
        <button class="btn-icon btn-icon--sm btn-icon--outline"><TIcon name="pencil" /></button>
        <button class="btn-icon btn-icon--sm btn-icon--outline btn-icon--danger"><TIcon name="trash" /></button>
        <DropdownMenu :items="rowMoreItems" placement="bottom-end">
          <template #trigger="{ toggle }">
            <button class="btn-icon btn-icon--sm btn-icon--outline" @click.stop="toggle">
              <TIcon name="dots" />
            </button>
          </template>
        </DropdownMenu>
      </div>
    </div>
  </div>
</div>

<!-- Footer row — NGOÀI .datatable, không nằm trong vùng scroll -->
<div class="dt-row dt-row--footer">
  <div class="dt-cell dt-cell--footer" style="width:44px;flex-shrink:0"></div>
  <div class="dt-cell dt-cell--footer" :style="cellStyle(cols[0])">
    <div class="dt-cell-inner"><span class="dt-footer-text">Tổng</span></div>
  </div>
  <!-- chỉ cột có số tiền mới điền data, các cột khác để trống -->
  <div class="dt-cell dt-cell--footer dt-cell-inner--right" :style="cellStyle(moneyCol)">
    <div class="dt-cell-inner dt-cell-inner--right">
      <span class="dt-footer-text">{{ total }}</span>
    </div>
  </div>
</div>

<!-- Paging — NGOÀI .datatable -->
<TablePaging :total="rows.length" v-model:page="page" v-model:page-size="pageSize" />
```

**Quy tắc footer:**
- Cột đầu sau checkbox → chữ "Tổng"
- Các cột còn lại → chỉ điền data nếu là cột số tiền, còn lại để trống
- Footer nằm **ngoài** `<div class="datatable">` để không bị scroll

---

## 4. Master-Detail layout

```html
<div class="table-panel">
  <!-- Master (flex: 1, lấy hết chiều cao còn lại) -->
  <div class="data-panel data-panel--master">
    <!-- KPI bar (nếu có) -->
    <!-- TableHeader -->
    <!-- .datatable (scroll) -->
    <!-- dt-row--footer (ngoài datatable) -->
    <!-- TablePaging -->

    <!-- Expand trigger: hiện khi activeRow !== null && !detailOpen -->
    <div v-if="activeRow !== null && !detailOpen" class="master-bottom-cep">
      <CollapseExpandPanel type="Collapse" position="Bottom" bg-color="White"
        @click="detailOpen = true" />
    </div>
  </div>

  <!-- Resizer: hiện khi detail đang mở -->
  <div v-if="activeRow !== null && detailOpen" class="panel-resizer"
    @mousedown="startPanelResize" />

  <!-- Detail panel (fixed height, resizable) -->
  <div v-if="activeRow !== null && detailOpen"
    class="data-panel data-panel--detail"
    :style="{ height: detailHeight + 'px' }">
    <div class="detail-cep">
      <CollapseExpandPanel type="Collapse" position="Top"
        @click="detailOpen = false" />
    </div>
    <div class="detail-panel__tabs">
      <button class="sub-nav-tab active">Chi tiết</button>
    </div>
    <!-- datatable chi tiết -->
    <!-- dt-row--footer -->
    <!-- TablePaging -->
  </div>
</div>
```

Script:
```js
const activeRow   = ref(null)
const detailOpen  = ref(false)
const detailHeight = ref(280) // ~3 rows visible by default

function selectRow(i) {
  activeRow.value = i
  detailOpen.value = true
}

function startPanelResize(e) {
  e.preventDefault()
  const startY = e.clientY
  const startH = detailHeight.value
  const onMove = ev => { detailHeight.value = Math.max(80, startH - (ev.clientY - startY)) }
  const onUp   = ()  => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}
```

CSS (scoped):
```css
.table-panel        { flex: 1; min-height: 0; display: flex; flex-direction: column; position: relative; }
.data-panel--master { flex: 1; min-height: 0; display: flex; flex-direction: column; background: var(--bg-white); border-radius: 8px; overflow: hidden; }
.data-panel--detail { flex-shrink: 0; display: flex; flex-direction: column; background: var(--bg-white); border-radius: 8px; overflow: hidden; }
.master-bottom-cep  { position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: center; }
.panel-resizer      { height: 8px; flex-shrink: 0; cursor: ns-resize; display: flex; align-items: center; justify-content: center; }
.panel-resizer::after { content: ''; width: 32px; height: 3px; background: var(--stroke-neutral); border-radius: 2px; opacity: 0; transition: opacity 0.15s; }
.panel-resizer:hover::after { opacity: 1; }
.detail-cep         { display: flex; justify-content: center; flex-shrink: 0; }
.detail-panel__tabs { display: flex; align-items: flex-end; flex-shrink: 0; padding: 0 4px; }
.detail-panel__tabs .sub-nav-tab { margin-bottom: -1px; }   /* cao --tab-h có sẵn; gạch chân đè viền dưới thanh */
```

---

## 5. Full-page list layout — Tab + KPI tổng quan + Master/Detail

**Dùng khi:** Màn hình danh sách kế toán có tab điều hướng trên đầu, vùng thẻ tổng quan (KPI), bảng master có thể chọn dòng để mở detail bên dưới.

### 5.1 Cấu trúc template tổng thể

```html
<div class="app-shell">
  <ControlHeader app-name="..." app-tag="...">
    <template #header-meta>...</template>
    <template #header-search>...</template>
  </ControlHeader>

  <div class="body-row">
    <!-- navItems: [{ id, icon, label, badge? }] — badge: nhãn nhỏ cạnh tên mục (VD 'Beta' cho phân hệ đang thử), ẩn khi sidebar thu gọn -->
    <AppSidebar :items="navItems" :active-id="activeNavId" @nav="onNav" />

    <div class="main-content">
      <!-- Sub-nav tabs -->
      <div class="sub-nav">
        <div class="sub-nav__scroll">
          <button
            v-for="tab in tabs" :key="tab.id"
            class="sub-nav-tab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >{{ tab.label }}</button>
        </div>
      </div>

      <!-- content-wrapper: position:relative là bắt buộc để kpi-cep--pinned và master-bottom-cep định vị đúng -->
      <div class="content-wrapper">
        <div class="table-panel">

          <!-- ① KPI row: 3 box riêng nhau, ẩn/hiện qua kpiOpen -->
          <div v-if="kpiOpen" class="kpi-row">
            <div class="kpi-card">
              <button class="kpi-card__reload btn-icon btn-icon--sm"><TIcon name="refresh" /></button>
              <div class="kpi-card__icon kpi-card__icon--success"><TIcon name="trending-up" /></div>
              <div class="kpi-card__content">
                <span class="kpi-card__label">Tên chỉ số</span>
                <div class="kpi-card__bottom">
                  <span class="kpi-card__value kpi-card__value--success">{{ value }}</span>
                  <span class="kpi-card__time" :title="`Số liệu tính đến: ${time}`">
                    <TIcon name="clock" /><span>{{ time }}</span>
                  </span>
                </div>
              </div>
            </div>
            <!-- Lặp lại cấu trúc kpi-card cho card 2 (--warning) và card 3 (--brand) -->
          </div>

          <!-- ② KPI toggle CEP — khi ẩn KPI dùng kpi-cep--pinned để ghim vào đỉnh content-wrapper -->
          <div :class="['kpi-cep', !kpiOpen && 'kpi-cep--pinned']">
            <CollapseExpandPanel
              :type="kpiOpen ? 'Expand' : 'Collapse'"
              position="Top"
              bg-color="White"
              @click="kpiOpen = !kpiOpen"
            />
          </div>

          <!-- ③ Master panel -->
          <div class="data-panel data-panel--master">
            <TableHeader v-model="searchQuery" search-placeholder="Tìm kiếm" :search-width="200" :main-function-button="true">
              <template #main-buttons>
                <!-- split buttons → btn--ai → dots DropdownMenu -->
              </template>
            </TableHeader>

            <div class="datatable" ref="tableRef">
              <!-- header row + body rows (xem section 3) -->
            </div>

            <!-- Footer NGOÀI .datatable -->
            <div class="dt-row dt-row--footer">...</div>

            <TablePaging :total="totalCount" v-model:page="currentPage" v-model:page-size="pageSize" />
          </div><!-- /data-panel--master -->

          <!-- ④ Expand trigger: chỉ hiện khi đã chọn dòng VÀ detail đang ẩn -->
          <div v-if="activeRow !== null && !detailOpen" class="master-bottom-cep">
            <CollapseExpandPanel type="Collapse" position="Bottom" bg-color="White" @click="detailOpen = true" />
          </div>

          <!-- ⑤ Resizer: chỉ hiện khi detail đang mở -->
          <div v-if="activeRow !== null && detailOpen" class="panel-resizer" @mousedown="startPanelResize" />

          <!-- ⑥ Detail panel -->
          <div v-if="activeRow !== null && detailOpen"
            class="data-panel data-panel--detail"
            :style="{ height: detailHeight + 'px' }">
            <div class="detail-cep">
              <CollapseExpandPanel type="Collapse" position="Top" @click="detailOpen = false" />
            </div>
            <div class="detail-panel__tabs">
              <button class="sub-nav-tab active">Chi tiết</button>
            </div>
            <div class="datatable datatable--detail" ref="detailRef">
              <!-- header + body rows -->
            </div>
            <!-- Footer NGOÀI .datatable -->
            <div class="dt-row dt-row--footer">...</div>
            <TablePaging :total="detailRows.length" v-model:page="detailPage" :page-size-options="[20]" />
          </div>

        </div><!-- /table-panel -->
      </div><!-- /content-wrapper -->
    </div><!-- /main-content -->
  </div><!-- /body-row -->
</div><!-- /app-shell -->
```

### 5.2 Script state

```js
const activeTab    = ref('tab-id-mac-dinh')
const kpiOpen      = ref(true)
const searchQuery  = ref('')
const currentPage  = ref(1)
const pageSize     = ref(20)
const detailPage   = ref(1)
const selected     = ref([])
// selectAll là computed, KHÔNG dùng ref(false)
const selectAll    = computed({
  get: () => filteredRows.value.length > 0 && selected.value.length === filteredRows.value.length,
  set: (val) => { selected.value = val ? filteredRows.value.map((_, i) => i) : [] }
})
const activeRow    = ref(null)
const detailOpen   = ref(false)
// 280px ≈ header(36) + 3×row(36) + footer(36) + tabs(36) + cep(16) + paging(48)
const detailHeight = ref(280)

function selectRow(i) {
  activeRow.value = i
  detailOpen.value = true
}

function startPanelResize(e) {
  e.preventDefault()
  const startY = e.clientY
  const startH = detailHeight.value
  function onMove(ev) { detailHeight.value = Math.max(80, startH - (ev.clientY - startY)) }
  function onUp()     { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}
```

### 5.3 Scoped CSS đầy đủ

```css
/* Sub-nav */
.sub-nav { border-bottom: 1px solid var(--stroke-neutral-light); background: var(--bg-white); flex-shrink: 0; }
.sub-nav__scroll { display: flex; align-items: flex-end; height: 100%; overflow-x: auto; scrollbar-width: none; }
.sub-nav__scroll::-webkit-scrollbar { display: none; }

/* Wrappers */
.content-wrapper { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 16px; position: relative; }
.table-panel     { flex: 1; min-height: 0; display: flex; flex-direction: column; }

/* Panels */
.data-panel--master { flex: 1; min-height: 0; display: flex; flex-direction: column; background: var(--bg-white); border-radius: 8px; overflow: hidden; }
.data-panel--detail { flex-shrink: 0; display: flex; flex-direction: column; background: var(--bg-white); border-radius: 8px; overflow: hidden; }

/* KPI */
.kpi-row  { display: flex; gap: 12px; flex-shrink: 0; }
.kpi-cep  { display: flex; justify-content: center; flex-shrink: 0; margin-bottom: 4px; }
.kpi-cep--pinned { position: absolute; top: 0; left: 0; right: 0; margin-bottom: 0; z-index: 10; }

.kpi-card { position: relative; flex: 1; display: flex; flex-direction: row; align-items: center; padding: 8px 16px; gap: 12px; background: var(--bg-white); border-radius: 8px; }
.kpi-card__reload { position: absolute; top: 6px; right: 8px; opacity: 0; transition: opacity 0.15s; }
.kpi-card:hover .kpi-card__reload { opacity: 1; }
.kpi-card__icon   { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.kpi-card__icon--success { background: var(--bg-success-light); color: var(--text-success); }
.kpi-card__icon--warning  { background: var(--bg-warning-light); color: var(--text-warning); }
.kpi-card__icon--brand    { background: var(--bg-brand-light);   color: var(--text-brand); }
.kpi-card__content { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.kpi-card__label   { font-size: 12px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kpi-card__bottom  { display: flex; align-items: center; gap: 8px; }
.kpi-card__value   { font-size: 18px; font-weight: var(--fw-semibold); line-height: 26px; }
.kpi-card__value--success { color: var(--text-success); }
.kpi-card__value--warning  { color: var(--text-warning); }
.kpi-card__value--brand    { color: var(--text-brand); }
.kpi-card__time { display: flex; align-items: center; gap: 3px; font-size: 11px; color: var(--text-secondary); white-space: nowrap; cursor: default; }
.kpi-card__time .t-icon { color: var(--icon-neutral); }

/* Datatable scroll area */
.datatable        { flex: 1; min-height: 0; overflow-y: auto; }
.datatable--detail { flex: 1; min-height: 0; overflow-y: auto; height: 230px; }

/* Expand trigger khi detail ẩn — nằm absolute ra ngoài master box, dính nền xám bên dưới */
.master-bottom-cep { position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: center; }

/* Resizer */
.panel-resizer { height: 8px; flex-shrink: 0; cursor: ns-resize; display: flex; align-items: center; justify-content: center; }
.panel-resizer::after { content: ''; width: 32px; height: 3px; background: var(--stroke-neutral); border-radius: 2px; opacity: 0; transition: opacity 0.15s; }
.panel-resizer:hover::after { opacity: 1; }

/* Detail header -->
.detail-cep         { display: flex; justify-content: center; flex-shrink: 0; }
.detail-panel__tabs { display: flex; align-items: flex-end; flex-shrink: 0; padding: 0 4px; }
.detail-panel__tabs .sub-nav-tab { margin-bottom: -1px; }   /* cao --tab-h có sẵn; gạch chân đè viền dưới thanh */
```

### 5.4 Quy tắc layout này

| Điều kiện | Xử lý |
|-----------|-------|
| `kpiOpen = true` | `.kpi-row` hiện; `kpi-cep` có `type="Expand"` (chevron-up) |
| `kpiOpen = false` | `.kpi-row` ẩn; `kpi-cep--pinned` ghim absolute vào top của `content-wrapper`; `type="Collapse"` (chevron-down) |
| `activeRow !== null && !detailOpen` | `master-bottom-cep` hiện, `type="Collapse" position="Bottom"` (chevron-up) → click mở detail |
| `activeRow !== null && detailOpen` | `panel-resizer` + `data-panel--detail` hiện; `detail-cep type="Collapse" position="Top"` → click ẩn detail |
| detail ẩn | `data-panel--master` chiếm toàn bộ chiều cao còn lại |

---

## 6. Scrollbar cho datatable

Scrollbar ẩn mặc định, hiện khi hover — đã có trong `mds-ui/src/style.css`, không cần thêm.

**⛔ Thanh cuộn ngang phải luôn thấy ở đáy khung bảng.** Bọc `<DataTable>` trong `.table-scroll` (khung có chiều cao: `flex: 1; min-height: 0` trong panel flex-column).
mds-ui đặt sẵn `.table-scroll > .datatable { flex: 1; min-height: 0; overflow: auto }` → bảng tự cuộn 2 chiều trong khung.
mds-ui cũng đặt sẵn `.table-panel { display: flex; flex-direction: column }` + `.table-panel > .table-scroll { flex: 1 1 auto; min-height: 0 }` → chỉ cần cho `.table-panel` 1 chiều cao (VD `calc(100vh - …)`) là bảng cuộn bên trong. ⛔ Khung có chiều cao mà vùng bảng không co (thiếu `min-height: 0`) → dòng dưới bị `overflow: hidden` cắt mất, không cuộn / không thấy được (lỗi đã gặp ở Quản trị › Tri thức AVA).
KHÔNG để bảng cao bằng toàn bộ nội dung rồi cuộn dọc ở khung ngoài — khi đó thanh cuộn ngang bị đẩy xuống cuối danh sách, người dùng không thấy.

---

## 8. Native input / select utility classes

Dùng cho `<input>` và `<select>` thuần HTML (ngoài ibox / AppTextbox component).

```html
<!-- Text input -->
<input class="input" type="text" placeholder="..." />
<input class="input input--sm" type="text" />

<!-- Select (native) — PHẢI dùng class input--select để ẩn arrow mặc định và thêm chevron custom -->
<select class="input input--select">
  <option value="">Tất cả</option>
  <option value="a">Option A</option>
</select>
<select class="input input--select input--sm">...</select>
```

### ⚠️ Bug đã fix — descender clipping trên `input--select`

**Triệu chứng:** Đuôi dưới chữ g, p, y, j bị che/cắt mất trong `<select>`.

**Nguyên nhân:** `padding-top + padding-bottom` từ `.input` chiếm hết không gian dọc, không còn chỗ cho descender.

**Fix (đã áp dụng vào `style.css`):**
```css
.input--select {
  padding-top: 0; padding-bottom: 0;
  line-height: calc(var(--input-height) - 2px); /* browser tự căn giữa, descender không bị clip */
}
```

**Rule:** Không được override lại `padding-top`/`padding-bottom` hoặc `line-height` trên `.input--select` ở scoped CSS.

---

## 7. Rules khi dùng

1. **Nhận màn hình mới** → đối chiếu danh sách trên trước khi code
2. **Thiếu control** → bỏ trống, báo user, không tự thi công
3. **TablePaging** → dùng duy nhất 1 component này, không inline HTML paging
4. **Footer row** → luôn nằm ngoài `.datatable`
5. **Dots button** → luôn ở ngoài cùng phải trong `#main-buttons` của TableHeader
6. **Layout Tab+KPI+Master/Detail** → copy đúng section 5, không tự điều chỉnh cấu trúc flex/position
7. **`input--select`** → KHÔNG override `padding-top/bottom` hay `line-height` — xem section 8
8. **Density modes** → ⛔ NGHIÊM CẤM hardcode `height: Npx` cho input/button/row — dùng `var(--input-height)` / `var(--btn-height)` — xem section 12
9. **Khoảng cách giữa controls** (⛔ Tuyệt đối — không tái phạm) → 2 control đặt cạnh nhau trong cùng 1 group: LUÔN LUÔN `gap: 8px`, không có ngoại lệ (kể cả khi controls kích thước khác nhau, ví dụ icon-button cạnh button chữ). Khác group (section/column riêng): `gap: 16px` trở lên. KHÔNG dùng giá trị nào khác — nếu 2 control đứng cạnh nhau trong cùng 1 flex group đang có gap khác 8px (10px, 12px...), phải tách nhóm control đó ra 1 wrapper con riêng với `gap: 8px`, không sửa gap của group cha (group cha có thể đang gap 12px/16px hợp lệ cho khoảng cách icon/text/section khác).

### ⛔ Tên class tự đặt phải đủ dài, khó trùng
Không dùng tiền tố 2–3 ký tự (`cp-`, `af-`, `imp-`…) cho class tự viết trong app: extension trình duyệt hay dùng tên ngắn kiểu `.cp-body` và CSS của chúng sẽ đè lên (đã gặp: popup Chốt điểm bị đổi font + đẩy lệch vì `.cp-body` trùng extension).
Đặt theo `<tên-app>-<thành phần>__phần`, VD `pdp-close-body`, `pdp-close-table`. Class của mds-ui giữ nguyên.

### ⛔ Tooltip: KHÔNG dùng tooltip mặc định của trình duyệt (`title`)
Dùng directive `v-tip` của mds-ui: nền tối `--neutral-900`, chữ trắng 12px, có mũi tên, hiện ngay khi hover / focus, tự lật xuống khi thiếu chỗ.
```js
import { vTip } from '@mds/utils/tooltip.js'   // <script setup>: dùng thẳng v-tip
```
```vue
<span v-tip="'Đã chốt điểm — không sửa được'"><TIcon name="lock" /></span>
```
DataTable đã dùng sẵn cho icon `icon-text` (`iconTitle`) và tag bị cắt / `+n`. Giải thích dài cho label form vẫn dùng ⓘ (InfoTip).

### Font trong popup / drawer / menu gắn vào `<body>`
mds-ui đặt sẵn `body > * { font-family: var(--font-family) }` — mọi lớp nổi Teleport ra `<body>` luôn dùng Inter. Lớp nổi tự viết ở app cũng phải Teleport vào `body` (không gắn vào chỗ khác) để hưởng quy tắc này; không tự đặt font khác.

### ⛔ Header ứng dụng (ControlHeader) — quy chuẩn chung
```vue
<ControlHeader app-name="Tên app" :settings-only="true"
  :settings-menu="isAdmin ? [{ id: 'system', icon: 'adjustments', label: 'Cài đặt hệ thống' }] : []"
  @settings-select="item => item.id === 'system' && router.push('/cai-dat')"
  home-href="/tong-quan" @home="router.push('/tong-quan')"
  :avatar-name="me.name" :user-email="me.email" :user-role="roleLabel" @logout="doLogout" />
```
1. **Cài đặt chung** (Cài đặt hệ thống, tích hợp, cấu hình…) → menu **bánh răng trên header** xổ xuống. Mục đầu luôn là “Thiết lập hiển thị” (màu sắc / mật độ). **Không** đặt mục cài đặt ở sidebar; mục chỉ Quản trị thì chỉ truyền khi là Quản trị.
2. **Logo + tên app** trên header là link **về trang chủ** (màn mặc định, VD Tổng quan).
3. **Tài khoản = avatar góc phải**: bấm avatar → menu thông tin cá nhân (avatar, họ tên, email, vai trò) và **Đăng xuất** phía dưới. Truyền `:avatar-name`, `:user-email`, `:user-role`, `:user-picture`, bắt `@logout`. Không đặt tên / vai trò / nút đăng xuất rời trên header.
   **Popover của header (Figma ❖ Global Header: Header_Notification · Header_Help · Header_More · Header_UserProfile — cập nhật 05/11/2026):** khung trắng bo 8, đệm **8 đều 4 phía** (cả menu Thiết lập), mũi nhọn chỉ vào icon vừa bấm; mục theo Menu List (cao 32, đệm ngang 12, bo góc, liền nhau, hover không chạm 2 mép).
   - Thông báo (434px): hàng tiêu đề cao 32 — **H3** + 3 nút icon nhỏ 28 (icon bên trong **20**: đánh dấu đã đọc · lọc · thiết lập); nhóm “Hôm nay / Trước đó” chữ Body Semi Bold; dòng thông báo bo góc, đệm 8/12, chưa đọc nền Brand Light; chữ Body 13.
   - Trợ giúp (296px): tiêu đề nhóm H3 là 1 dòng cao 32 ngay trên danh sách (Trợ giúp · Kênh hỗ trợ · Đào tạo), các nhóm cách nhau 16. Thêm ⋯ (288px): các nhóm ngăn bằng vạch, cuối là khối cài app mobile (slot `more-footer`).
   - Tài khoản (352px): đệm trên phần đầu 8, avatar 64 cách tên 8 · họ tên H3 · email chữ phụ; khối viền “công ty / dữ liệu” (`profile-context`); danh sách mục + Ngôn ngữ; vạch ngăn rồi **Đăng xuất = nút Button Medium chữ trung tính căn giữa** (không phải mục đỏ).
4. **Ô tìm kiếm trên header** (`.search-box-header`, Figma MDS “Searchbox” node 6019:50140) — có đủ trạng thái, ⛔ không để hover “chết”. Header nền màu = Style **Filled White**: nền `--alpha-white-200` (trắng 20%), không viền · **hover nền `--alpha-white-300` (30%) + viền trắng 1px** · focus nền 20% + viền trắng 1px · icon / placeholder trắng 70%, hover / focus / đã gõ icon trắng 100%, chữ gõ trắng. Header sáng (`.global-header--white`) = Style **Filled**: nền Neutral/200 · hover + focus nền trắng + viền `--stroke-brand` 1px. Viền vẽ bằng `box-shadow: inset 0 0 0 1px` (không xô bố cục); khung là `<label>` để bấm vào icon cũng focus ô nhập; placeholder “Tìm kiếm”. Slot `#header-search` tự dựng phải theo đúng các trạng thái này.
   - **Ô tìm kiếm TOÀN CỤC (tìm xuyên các phân hệ — `AppGlobalSearch`, đã gắn sẵn trong ControlHeader):** app chỉ bắt `@search` + truyền `:search-results` / `:search-loading`; ⛔ không tự vẽ popup riêng, ⛔ không dùng AppAiSearchbox làm ô của header (đó là ô tìm kiếm thông minh trong 1 màn hình). ⛔ Bấm vào ô khi chưa gõ thì KHÔNG xổ gì (không liệt kê phân hệ trống); cho biết TÌM ĐƯỢC THEO GÌ bằng placeholder nêu trường (VD “Tìm tên, mã nhân viên…”, `search-placeholder`). Gõ ≥ 2 ký tự → TỰ tìm sau ~0,3s (không cần Enter) · popup xổ NGAY + spinner “Đang tìm…” · kết quả theo NHÓM PHÂN HỆ: trái = tên phân hệ (HOA, Semi Bold, chữ phụ, 120px), giữa = bản ghi (Avatar 32 · tên Semi Bold, phần khớp tô `--text-brand` · dòng phụ · dòng chi tiết riêng của phân hệ), mỗi bản ghi là dòng bấm được **đệm ĐỀU 8px 4 phía** (⛔ không 4 trên-dưới / 8 trái-phải — vùng hover nhìn lệch), tên phân hệ + thẻ đếm căn thẳng dòng đầu, phải = Tag Neutral “N kết quả”; mỗi phân hệ tối đa 3 bản ghi + link `.btn--link` “Xem thêm” → mở POPUP riêng chỉ chứa kết quả của đúng phân hệ đó (`AppSearchResultsDialog`: popup 960×640, tiêu đề “Tìm kiếm trong <phân hệ>”, ô tìm điền sẵn từ khóa và sửa được, “N kết quả”, danh sách giãn hết chiều cao cuộn trong khung, dòng ngăn bằng kẻ; app nạp `:search-more-items` / `-total` / `-loading` theo `@search-more(group, q)`); ⛔ KHÔNG có nút “Xem tất cả kết quả” ở cuối popup; phân hệ không có kết quả KHÔNG hiện hàng; không phân hệ nào → “Không tìm thấy kết quả cho “…””; chỉ phân hệ người dùng có quyền xem. Popup: nền trắng, bo 8, `--shadow-popover`, đệm 16, rộng 640 (≥ ô). **Độ cao popup bám theo màn hình thực tế trừ lề 24px** (viewport nhìn thấy thật, trừ bàn phím ảo trên điện thoại), nhiều kết quả thì cuộn TRONG popup; ô nằm thấp mà chỗ dưới < 240px thì xổ lên trên — ⛔ không ép chiều cao tối thiểu làm popup tràn khỏi màn hình. Phím: ↑ ↓ chọn · Enter mở · Esc đóng (Esc lần 2 xóa chữ); không phân biệt hoa thường / dấu; kết quả về trễ hơn lần gõ mới thì bỏ (so số lần tìm). Dữ liệu: `results = [{ key, title, total, items: [{ id, name, subtitle, meta, avatar }] }]`, events `@search(q)` `@search-select(item, group)` `@search-more(group, q)`. Mẫu Nhân sự: /ds/hearder-bar.
7. **Khoảng cách trên header:** mọi mục bên phải — control có sẵn của ControlHeader (AI, Thông báo, Trợ giúp, ⋯, bánh răng, avatar) và mục app tự thêm qua slot `#header-actions` / `#header-end` (link, nút có chữ, chip “N đang hoạt động”…) — **cách đều 8px** (gap của `.header-tools`). ⛔ Không thêm `margin` cho mục tự thêm. Ô tìm kiếm ↔ cụm bên phải cũng 8px (đồng nhất).
6. **Popover của Global Header (Figma ❖ Global Header):** bấm icon xổ popover có mũi nhọn chỉ vào icon (nền trắng, bo 8, bóng Bottom 16): **Thông báo** `:notifications="[{ id, group, text: '**đậm** thường', time, unread, avatar | icon + tone | name, badgeIcon | badgeImg }]"` (`@notify-select`, `@notify-action` = read-all · filter · settings) · **Trợ giúp** `:help-menu="[{ title, items: [{ id, icon, label, color? }] }]"` (`@help-select`) · **Thêm ⋯** `:more-menu="[{ id, icon, label } | { separator: true }]"` + slot `#more-footer` (VD khối cài app mobile) (`@more-select`) · **Tài khoản**: avatar 64 giữa, tên, email, `:profile-context="[{ id, icon, label }]"` (khung công ty / dữ liệu có ›), `:profile-menu`, `:language="{ label, flag }"`, Đăng xuất. Không truyền dữ liệu → icon không xổ (như cũ).
5. **Nút 9 chấm chuyển ứng dụng** (bên trái logo): truyền `:apps="[{ id, label, desc? (mô tả ngắn 1 dòng), img (logo màu), href }]"` + `current-app="<id app này>"` → bấm xổ bảng chuyển ứng dụng dạng lưới ô (tối đa 3 cột; logo 48 + tên + mô tả, rê chuột ô nổi lên), app đang dùng viền Brand + dấu ✓ tròn; chọn app khác → chuyển sang (cùng tab). Không truyền `apps` thì ẩn bằng `hide-tools="['apps']"`. Các app chung cổng (MISA Solution Point `/`, MISA Design System `/ds/`) dùng chung 1 danh sách `APPS` (chamdiem-app `store/app.js` ↔ mds-docs `demoApp.js`).

### ⛔ Đồng nhất khung màn hình trong 1 ứng dụng (bắt buộc)

Mọi màn cùng loại PHẢI dùng **cùng khung + cùng class**, nhìn giống hệt nhau. Không tự “sáng tạo” bố cục riêng cho 1 màn.

**1. Khung màn danh sách (chuẩn duy nhất):**
```
page-header (56px: tiêu đề trái · bộ chọn phạm vi / nút trang bên phải)
└ sub-nav (48px) — CHỈ khi có tab cấp trang (vòng lặp, tháng…). Tab LUÔN ở hàng riêng này, KHÔNG nhét vào page-header
   ✅ NGOẠI LỆ — màn CHI TIẾT 1 bản ghi có ít tab (2–3 tab cố định, VD “Hồ sơ nhân viên | Hồ sơ năng lực”): đặt tab NGAY TRÊN thanh tiêu đề cho gọn
      `<nav class="page-header__tabs">` sau tiêu đề (dùng lại .sub-nav-tab; tab cao bằng page-header, gạch chân đè viền dưới).
      Công cụ của tab (chế độ xem, bật/tắt…) chuyển sang page-header__right, đứng trước nút chính.
      Màn < 1280px: nút dài thu về chỉ icon + v-tip (KHÔNG để thanh tiêu đề tràn / xuống dòng). Tab động / nhiều tab → vẫn dùng sub-nav hàng riêng.
content-wrapper content-wrapper--fill (padding 16, gap 16, không cuộn trang)
├ kpi-row (tuỳ chọn) — 4 thẻ .kpi-card (title + số to + icon góc phải + kpi-sub). KHÔNG dùng thanh chữ mỏng thay KPI
└ list-split
   ├ table-panel: TableHeader (toolbar) → [FilterChips] → table-scroll > DataTable → TablePaging (sát đáy)
   └ AdvancedFilterPanel (panel lọc, đẩy bảng sang trái)
```
- Bảng luôn **full chiều cao**: phân trang sát đáy, thân bảng co giãn theo màn hình.
- Xem chi tiết 1 dòng = **drawer nổi bên phải** (không làm hẹp bảng). Panel đẩy bảng chỉ dùng cho bộ lọc.
- Màn báo cáo / dashboard (nhiều card, biểu đồ) mới được cuộn trang (`content-wrapper` không `--fill`).

**2. CSS khung đặt 1 chỗ duy nhất** (file CSS dùng chung của app, VD `src/app.css`): `.content-wrapper--fill`, `.kpi-row/.kpi-card/.kpi-*`, `.list-split`, `.table-panel`, `.table-scroll`, `.filter-box`, `.empty-state`.
⛔ KHÔNG chép lại các class này vào `<style scoped>` của từng màn — chép qua chép lại là nguồn gốc lệch giao diện. `<style scoped>` chỉ chứa phần riêng của màn đó.

**3. Thanh công cụ & thao tác hàng loạt** dùng TableHeader: `main-buttons` cho nút chính, `bulk-action` + `bulk-buttons` khi tick chọn dòng.
⛔ Nút không bấm được trong ngữ cảnh hiện tại thì **ẩn (`v-if`)**, KHÔNG hiện rồi `disabled` (VD chọn toàn người đã chốt → ẩn nút “Chốt”, chỉ hiện “Mở chốt”).

**4. Chiều cao dòng bảng theo nội dung, không theo màn:** dòng 1 dòng chữ = `--dt-row-height`; dòng có avatar + dòng phụ (`avatar-subtext`) cao hơn — giống nhau ở mọi màn có cùng kiểu cột.

**5. Trước khi giao màn mới:** đặt cạnh 1 màn cùng loại đã có, so header / tab / KPI / toolbar / bảng / phân trang — khác chỗ nào phải sửa về chuẩn.

### Quy tắc trạng thái hover (⛔ mọi control bấm / nhập được PHẢI đổi màu khi hover)

**⛔ BẤT KỲ thứ gì bấm được (có `@click`, `cursor: pointer`, `role="button"`, `<a>`, `<button>`) PHẢI có trạng thái hover nhìn thấy được** — đổi nền, đổi màu viền hoặc đổi màu chữ/icon; chỉ đổi `cursor` là CHƯA đủ. Nút thì có thêm pressed (`:active`) và focus (`:focus-visible`).
- Vùng lớn bấm được (dòng tiêu đề phần bấm để thu gọn, card bấm để mở, dòng danh sách, avatar mở menu…) → hover đổi nền nhạt (`--bg-neutral-light` / `--bg-brand-light`) HOẶC làm nút icon bên trong hiện hover (VD `.sec__hd:hover .btn-icon { background: var(--bg-neutral-light) }`).
- Chữ bấm được CHÈN TRONG CÂU / tên bản ghi dạng link → `btn btn--link` (hover gạch chân); nút đứng riêng dạng link (“Xem tất cả”, “+ Thêm dòng”) → `btn btn--text` (Figma Button Style=Text) — KHÔNG để chữ thường + `@click`.
- Trước khi giao: rê chuột qua TỪNG thứ bấm được trên màn (Playwright `hover()` + so `getComputedStyle` trước/sau) — cái nào không đổi là lỗi.

| Control | Hover |
|---|---|
| Input (`.ibox`: Textbox, Combobox, Datebox, Numberbox, Searchbox, Textarea; cả `--no-border`, `--ghost`) | Viền `--stroke-brand` giống focus (focus có thêm quầng sáng 3px) |
| Ô lọc trong bảng (`.dt-filter-input/select`), ô sửa trực tiếp (`.dt-input/select`) | Viền / outline `--stroke-brand` |
| Tab (`.sub-nav-tab`, `.dialog-tab`) — Figma Tab Horizontal Item | Nền `--bg-neutral-hover` (Neutral Light Hover, ⛔ KHÔNG xanh brand), chữ giữ nguyên; tab cao `--tab-h` (36 · 36 · 40) — ⛔ không kéo cao bằng thanh chứa (nền hover sẽ lộ cả khối cao); nhấn `--bg-neutral-pressed`; tab đang chọn rê chuột vẫn nền trắng |
| Segment (`role-switch`, `view-switch`) | Theo control segment sẵn có |
| Button | Theo biến thể sẵn có (`btn--primary` → pressed, `btn--outline/neutral` → nền light, `btn-icon` / `btn-icon--outline` → nền `--bg-neutral-light`, nhấn `--bg-neutral-pressed`) |
| Dòng bảng | `--bg-brand-light` · tiêu đề cột bấm được → `--bg-neutral-hover` |
| Checkbox | Viền ô brand + nền tròn brand light |
| Menu item / dropdown | `--bg-neutral-hover` (danger → `--bg-danger-light`) |
| Icon rời bấm được | `btn-icon` / `btn-icon--sm` (Button Icon Medium / Small) — nền hover + pressed. `icon-swap--action` (đổi màu brand) CHỈ cho icon nằm trong control nhỏ (✕ trên chip) — Back ←, đóng panel cũng là `btn-icon` |
| Link chữ | Gạch chân |

Hover đã có trong mds-ui — dùng đúng class, KHÔNG tự viết hover khác. Control tự thi công trong app (không có class mds-ui) phải tự thêm hover theo bảng trên. Disabled / readonly KHÔNG đổi màu khi hover.

### Quy tắc border cho controls (⛔ Tuyệt đối — không tái phạm)

```
LUÔN dùng --stroke-neutral cho border của mọi input control (textbox, select, combobox, datebox, numberbox, search box, ibox...).
NGHIÊM CẤM dùng --stroke-neutral-light cho border của control.

--stroke-neutral-light CHỈ dùng cho:
  - Divider / separator ngang/dọc giữa các vùng layout
  - Border trong/nội bộ của table (ht-row, ht-cell, dt-row, dt-cell)
  - Border của container/card/panel/wrapper (bọc nhiều thứ bên trong)
  - Popup/dropdown/popover container
  - Disabled state của control (border nhạt hơn khi control bị vô hiệu)
  - Avatar, decoration border
```

```css
/* ✅ ĐÚNG */
.my-input     { border: 1px solid var(--stroke-neutral); }
.search-box   { border: 1px solid var(--stroke-neutral); }
.ibox         { border: 1px solid var(--stroke-neutral); }

/* ❌ SAI — control không được dùng stroke-neutral-light */
.my-input     { border: 1px solid var(--stroke-neutral-light); }
.search-box   { border: 1px solid var(--stroke-neutral-light); }
.ibox         { border: 1px solid var(--stroke-neutral-light); }

/* ✅ ĐÚNG — container, divider dùng stroke-neutral-light */
.table-wrap   { border: 1px solid var(--stroke-neutral-light); }
.info-card    { border: 1px solid var(--stroke-neutral-light); }
.popup-menu   { border: 1px solid var(--stroke-neutral-light); }
.ibox--disabled { border-color: var(--stroke-neutral-light); }  /* disabled OK */
```

---

### Quy tắc gap giữa controls (Rule #9 — chi tiết)

```
┌─────────────────────────────────────────────────────────┐
│  Tình huống                          │  gap    │  Token  │
│──────────────────────────────────────┼─────────┼─────────│
│  2+ control trong cùng row/group     │  8px    │  --gap-control   │
│  Input + button kèm (search box…)    │  8px    │  --gap-control   │
│  Form nhãn TRÊN: giữa các trường     │  16px   │  --form-row-gap-v│
│  Form nhãn TRÁI: giữa các hàng       │  12px   │  --form-row-gap-h│
│  Form / chi tiết: giữa 2 cột         │  80px   │  .form-fields--2col / .detail-grid │
│  Card ↔ card                         │  16px   │  --card-col-gap  │
│  Nội dung ↔ sidebar/lề phải/lề dưới  │  16px   │  --page-gutter   │
└─────────────────────────────────────────────────────────┘
```

```css
/* ✅ ĐÚNG — 2 button cạnh nhau trong cùng row */
.toolbar { display: flex; align-items: center; gap: var(--gap-control); }   /* hoặc dùng class .control-row */

/* ✅ ĐÚNG — search + button inline */
.search-row { display: flex; gap: 8px; }

/* ❌ SAI */
.toolbar { gap: 10px; }   /* không phải token */
.toolbar { gap: 12px; }   /* 12px chỉ dùng cho card gap, không phải control gap */
.toolbar { gap: 6px; }    /* quá hẹp */
```

**Row hỗn hợp (icon/avatar + text + control):** nếu 1 row có cả phần trang trí (icon, avatar, tiêu đề) LẪN control (button, icon-button) — ví dụ header của 1 card: `[icon] [tên + trạng thái] [button Hướng dẫn] [button Kết nối]` — thì gap của row cha (giữa icon/text/control-group) được phép khác 8px (12px, 16px...), nhưng 2 control (2 button) đứng cạnh nhau ở cuối row PHẢI được bọc riêng trong 1 wrapper `gap: 8px`, không dùng chung gap của row cha.

```css
/* ❌ SAI — 1 gap dùng chung cho cả icon/text lẫn 2 button, button cách nhau 12px thay vì 8px */
.card__head { display: flex; align-items: center; gap: 12px; }
/* <icon /> <title /> <button>Hướng dẫn</button> <button>Kết nối</button> */

/* ✅ ĐÚNG — tách 2 button vào wrapper riêng, gap 8px; row cha vẫn giữ 12px cho icon/text */
.card__head    { display: flex; align-items: center; gap: 12px; }
.card__actions { display: flex; align-items: center; gap: 8px; }
/* <icon /> <title /> <div class="card__actions"><button>Hướng dẫn</button><button>Kết nối</button></div> */
```

> **Nguồn:** CSS token `--btn-group-gap: 8px` (định nghĩa trong SKILL.md Section 1). Áp dụng cho mọi nơi: toolbar, page-header right, form inline group, filter bar, footer action bar.

---

## 9. Quy tắc căn lề (alignment) trong DataTable

**NGHIÊM CẤM căn giữa (center) cột văn bản thông thường.**

| Loại dữ liệu | align | Ghi chú |
|---|---|---|
| Text / string | *(không set — mặc định left)* | Tên, địa chỉ, mô tả, trạng thái… |
| **Số tiền / số lượng / %** | `align: 'right'` | Bắt buộc right để các chữ số thẳng hàng |
| **Ngày / giờ** | *(không set — mặc định left)* | ⛔ KHÔNG căn phải — header và data đều căn trái |
| STT (serial number) | `align: 'center'` | Chỉ cột số thứ tự |
| Icon-only / checkbox / radio | `align: 'center'` | Chỉ cột không có text |

> ⚠️ **BUG THƯỜNG GẶP — `<button>` mặc định `text-align: center`**
>
> Khi dùng `<button>` làm link/text trong cell (ví dụ: tên nhân viên dạng clickable), browser UA stylesheet set `text-align: center` cho button. Nếu button bị stretch full-width (do nằm trong flex column container), text sẽ hiện **căn giữa** dù không set gì.
>
> **Fix bắt buộc:** Luôn set `text-align: left` trên button text trong cell. Class `.dt-action-link` đã có sẵn rule này trong `style.css`. Nếu tự thi công button không dùng class này → **bắt buộc thêm `text-align: left` vào CSS của button đó**.
>
> ```css
> /* ✅ Đúng — đã có trong .dt-action-link */
> .dt-action-link { text-align: left; }
>
> /* ❌ Sai — button sẽ căn giữa nếu nằm trong flex column */
> .my-cell-btn { background: none; border: none; cursor: pointer; }
> /* → bị thiếu text-align: left */
> ```

**Ví dụ đúng:**
```js
const columns = [
  { key: 'stt',      label: 'STT',          width: 48,  align: 'center' },  // ✓ STT
  { key: 'name',     label: 'Họ và tên',    minWidth: 200 },                // ✓ text — không set align
  { key: 'dept',     label: 'Phòng ban',    width: 160 },                   // ✓ text — không set align
  { key: 'salary',   label: 'Lương (VNĐ)',  width: 130, align: 'right' },   // ✓ số tiền → right
  { key: 'joinDate', label: 'Ngày vào làm', width: 112 },                   // ✓ ngày → left (không set align)
]
```

---

## 10. Quy tắc kích thước button theo vị trí

`btn--sm` (28px) và `btn-icon--sm` (28px) CHỈ được dùng trong: **row actions, sidebar nav, toolbar icon nhỏ, paging control**.

**KHÔNG dùng `btn--sm` trong page-header** — page-header luôn dùng button standard (32px) để bằng height với input controls cạnh đó.

| Vị trí | Size | Class |
|--------|------|-------|
| Page header (ngang với ibox/input) | Standard (var(--btn-height)) | `btn btn--primary`, `btn btn--outline btn--neutral`, `btn-icon btn-icon--outline` |
| TableHeader toolbar (filter area) | Standard | Như trên |
| Compound input (textbox + icon) | Standard `btn-icon btn-icon--outline` | **KHÔNG dùng `btn-icon--sm`** |
| Row actions (cuối mỗi hàng bảng) | Standard `btn-icon btn-icon--outline` | Chỉ dùng `btn-icon--sm` khi user yêu cầu tường minh |
| Paging, sidebar | Standard | Chỉ dùng `btn-icon--sm` khi user yêu cầu tường minh |

**Ví dụ page-header đúng:**
```html
<div class="page-header__right">
  <button class="btn btn--outline btn--neutral">Nhập từ Excel</button>
  <button class="btn btn--outline btn--neutral">Xuất</button>
  <div class="btn-split">
    <button class="btn btn--primary">Thêm nhân viên</button>
    <button class="btn btn--primary btn-split__arrow"><TIcon name="chevron-down" /></button>
  </div>
  <DropdownMenu ...>
    <button class="btn-icon btn-icon--outline"><!-- KHÔNG dùng btn-icon--sm -->
      <TIcon name="dots" />
    </button>
  </DropdownMenu>
</div>
```

---

## 11. Inter font — setup cho dự án mới (Inter Variable v4.1)

Font Inter Variable đã được **tích hợp sẵn trong `mds-ui/src/style.css`** (self-hosted, không phụ thuộc CDN).

**Cách dùng (chỉ cần 1 bước):**
```js
// main.js — import style.css của mds-ui là xong, không cần thêm gì vào index.html
import '@mds/style.css'
```

**KHÔNG làm:**
```html
<!-- ❌ KHÔNG cần và KHÔNG nên thêm vào index.html — đã self-host trong style.css -->
<link rel="stylesheet" href="https://rsms.me/inter/inter.css">
```

**Kỹ thuật đúng theo rsms.me/inter v4.1:**

```css
/* Tên font chính thức v4+: InterVariable (không dấu cách, không quote) */
@font-face {
  font-family: InterVariable;   /* ← tên MỚI — dùng tên này */
  font-style: normal;
  font-weight: 100 900;         /* variable range, 1 file cho mọi weight */
  font-display: swap;           /* tránh FOIT */
  src: url('./fonts/InterVariable.woff2') format('woff2');
}
/* Alias cũ giữ cho backward compat */
@font-face {
  font-family: 'Inter var';     /* ← tên CŨ — legacy alias */
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('./fonts/InterVariable.woff2') format('woff2');
}

/* CSS variable */
:root {
  --font-family: InterVariable, 'Inter var', sans-serif;
}

/* body */
body {
  font-family: var(--font-family);
  font-optical-sizing: auto;   /* Inter tự tối ưu letterform theo font-size */
  /* liga + calt: bắt buộc theo rsms.me (calt quan trọng cho Chrome compat) */
  /* cv02–cv11: character variants cho chữ đẹp hơn */
  font-feature-settings: 'liga' 1, 'calt' 1, 'cv02', 'cv03', 'cv04', 'cv11';
}
```

**Tóm tắt những gì quan trọng:**

| Điểm | Đúng (v4.1) | Sai / cũ |
|------|------------|----------|
| Tên font | `InterVariable` | `'Inter var'`, `'Inter'` |
| Feature settings | `'liga' 1, 'calt' 1` + cv-variants | Chỉ có cv-variants |
| Optical sizing | `font-optical-sizing: auto` | Bỏ qua |
| font-display | `swap` | Bỏ qua |
| Load | Self-host trong mds-ui/src/fonts/ | CDN rsms.me |

**File fonts trong mds-ui:**
- `mds-ui/src/fonts/InterVariable.woff2` — normal, weight 100–900
- `mds-ui/src/fonts/InterVariable-Italic.woff2` — italic, weight 100–900
- Khi Vite build → copy sang `dist/assets/` với content-hash tự động

> ⚠️ **QUAN TRỌNG — Vite dev server bị chặn font:**
> Font nằm trong `mds-ui/src/fonts/` (ngoài project root của app). Vite chặn fs access ngoài root theo mặc định → font không load → Arial xuất hiện.
>
> **Bắt buộc thêm vào `vite.config.js` của MỌI dự án dùng mds-ui:**
> ```js
> import path from 'path'
> // ...
> server: {
>   fs: {
>     allow: [path.resolve(__dirname, '..')] // cho phép serve từ thư mục cha
>   }
> }
> ```
> Không có dòng này → dev server dùng Arial, build production thì đúng Inter. Rất dễ bỏ sót!

---

## 12. ⛔ 3 Density Modes — QUY TẮC BẮT BUỘC TUYỆT ĐỐI

> **Đây là lỗi tái lặp nhiều nhất.** Đọc kỹ và tuân thủ triệt để.

### 12.1 Ba chế độ density (từ `mds-ui/src/style.css`)

```css
/* Standard / Tiêu chuẩn (mặc định) */
:root {
  --input-height:    36px;
  --btn-height:      36px;   /* = --input-height — btn-icon luôn bằng chiều cao input */
  --dt-row-height:   36px;
}

/* Nhỏ */
:root[data-density="compact"] {
  --input-height:    28px;
  --btn-height:      28px;
  --dt-row-height:   32px;
}

/* Comfortable / Rộng */
:root[data-density="comfortable"] {
  --input-height:    40px;
  --btn-height:      40px;   /* = --input-height */
  --dt-row-height:   40px;
}
```

> **Nguyên tắc bất di bất dịch:** `--btn-height` LUÔN LUÔN bằng `--input-height` trong mọi density mode.
> Lý do: btn-icon đặt cạnh input phải cùng chiều cao — nếu chênh là lỗi layout nghiêm trọng.

Người dùng chọn density trong Settings → `document.documentElement.dataset.density = 'compact'` (hoặc xóa attribute để về mặc định).

### 12.2 ⛔ NGHIÊM CẤM hardcode chiều cao px

```css
/* ❌ SAI — hardcode cứng, không đổi theo density */
.my-input    { height: 32px; }
.my-input    { height: 28px; }
.my-button   { height: 36px; }
.ht-input    { height: 28px; }   /* ← lỗi hay gặp trong inline-editable table */
.ht-row      { height: 28px; }

/* ✅ ĐÚNG — tự động đổi theo density */
.my-input    { height: var(--input-height); }
.my-button   { height: var(--btn-height); }
.ht-input    { height: var(--input-height); }
.ht-row      { height: var(--input-height); min-height: var(--input-height); }
```

**Quy tắc đơn giản:**
- Input / textbox / select → `height: var(--input-height)`
- Button → `height: var(--btn-height)` (tự động qua `.btn` class)
- DataTable 1-line row → `height: var(--dt-row-height)` (tự động trong DataTable component)
- DataTable 2-line row → **luôn 56px cố định**, không đổi theo density

### 12.3 Pattern chuẩn cho Inline-Editable Table (ht-input)

Bảng nhập liệu trực tiếp (hàng hóa trong chứng từ) — mỗi ô là input không border (chỉ show border khi focus).

```html
<!-- ✅ Pattern đúng — height dùng token, không hardcode -->
<div class="ht-wrapper">
  <!-- Header row -->
  <div class="ht-header">
    <div class="ht-cell ht-cell--header" style="width:40px">STT</div>
    <div class="ht-cell ht-cell--header" style="flex:1;min-width:200px">Tên hàng hóa, dịch vụ</div>
    <div class="ht-cell ht-cell--header" style="width:80px;text-align:right">Số lượng</div>
    <div class="ht-cell ht-cell--header" style="width:120px;text-align:right">Đơn giá</div>
    <div class="ht-cell ht-cell--header" style="width:120px;text-align:right">Thành tiền</div>
  </div>

  <!-- Data rows -->
  <div v-for="(row, i) in rows" class="ht-row" :class="{ 'ht-row--active': activeHtRow === i }">
    <div class="ht-cell" style="width:40px;text-align:center">{{ i + 1 }}</div>
    <div class="ht-cell" style="flex:1;min-width:200px">
      <input class="ht-input" v-model="row.name" placeholder="Chọn hàng hóa..." />
    </div>
    <div class="ht-cell ht-cell--num" style="width:80px">
      <input class="ht-input ht-input--right" v-model="row.qty" type="number" />
    </div>
    <div class="ht-cell ht-cell--num" style="width:120px">
      <input class="ht-input ht-input--right" v-model="row.price" type="number" />
    </div>
    <div class="ht-cell ht-cell--num" style="width:120px">
      <span class="ht-cell__readonly">{{ formatMoney(row.qty * row.price) }}</span>
    </div>
  </div>

  <!-- Add row button -->
  <div class="ht-add-row" @click="addRow">
    <TIcon name="plus" /><span>Thêm dòng</span>
  </div>
</div>
```

```css
/* ✅ CSS chuẩn — KHÔNG hardcode px, dùng var(--input-height) */
.ht-wrapper {
  display: flex; flex-direction: column;
  border: 1px solid var(--stroke-neutral-light);
  border-radius: var(--radius-default);
  overflow: hidden;
}
.ht-header {
  display: flex; align-items: center;
  height: var(--table-header-height, 36px); /* header luôn 36px */
  background: var(--dt-header-bg, #E4E6EA);
  border-bottom: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0;
}
.ht-cell--header {
  font-size: var(--text-sm); font-weight: var(--fw-medium);
  color: var(--text-secondary);
  padding: 0 8px;
  display: flex; align-items: center;
}
.ht-row {
  display: flex; align-items: stretch;
  /* ✅ ĐÚNG: dùng token, KHÔNG hardcode */
  min-height: var(--input-height);
  border-bottom: 1px solid var(--stroke-neutral-light);
  transition: background 0.1s;
}
.ht-row:last-of-type { border-bottom: none; }
.ht-row:hover { background: var(--bg-neutral-hover); }
.ht-row--active { background: var(--bg-brand-light); }
.ht-cell {
  display: flex; align-items: center;
  border-right: 1px solid var(--stroke-neutral-light);
  padding: 0;
  overflow: hidden;
}
.ht-cell:last-child { border-right: none; }
.ht-cell--num { justify-content: flex-end; }
.ht-input {
  /* ✅ ĐÚNG: height đổi theo density */
  width: 100%; height: var(--input-height);
  padding: 0 8px;
  border: none; outline: none;
  background: transparent;
  font-size: var(--text-body); font-family: var(--font-family);
  color: var(--text-primary);
}
.ht-input--right { text-align: right; }
.ht-input:focus {
  background: var(--bg-white);
  box-shadow: inset 0 0 0 1px var(--stroke-brand);
  border-radius: 2px;
}
.ht-cell__readonly {
  padding: 0 8px;
  font-size: var(--text-body);
  color: var(--text-primary);
  font-feature-settings: 'tnum' 1;
}
.ht-add-row {
  display: flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 12px;
  color: var(--text-brand); font-size: var(--text-body);
  cursor: pointer;
  border-top: 1px solid var(--stroke-neutral-light);
}
.ht-add-row:hover { background: var(--bg-brand-light); }
```

### 12.4 Kiểm tra density trước khi submit code

**Checklist density (bắt buộc kiểm tra trước khi hoàn thành bất kỳ form/bảng nào):**

- [ ] Tất cả `<input>`, `<select>` custom đều dùng `height: var(--input-height)` — không có `height: 28px`, `height: 32px`, `height: 36px` cứng
- [ ] Tất cả button custom đều dùng `height: var(--btn-height)` hoặc dùng class `.btn` / `.btn-icon`
- [ ] Các ô `.ht-row` / `.ht-input` trong bảng nhập liệu dùng `min-height: var(--input-height)`
- [ ] DataTable 2-line row (subtext, avatar-subtext, product-logo) được giữ cố định 56px — không cần token
- [ ] Không có `height: px` nào ngoài: card header (48px fixed), dialog (theo spec), border-radius, avatar size

> **Ghi nhớ:** Mở DevTools → `document.documentElement.dataset.density = 'compact'` → tất cả control phải co lại. Nếu có gì không co → đó là chỗ đang hardcode px.


### ESC đóng lớp trên cùng — `@mds/utils/escStack.js` (quy chuẩn chung)

```js
import { useEscClose } from '@mds/utils/escStack.js'
useEscClose(() => emit('close'))                                       // popup: đóng khi mở
useEscClose(() => { selected.value = null }, () => !!selected.value)   // drawer / panel bật theo điều kiện
```
- **Mọi popup / drawer / panel nổi phải đóng bằng ESC** — bấm ở đâu cũng được (không cần focus trong lớp). Nhiều lớp chồng nhau → ESC đóng lớp mở **sau cùng** (popup trên drawer: ESC lần 1 đóng popup, lần 2 đóng drawer).
- Không dùng `@keydown.esc` trên `<aside>` / khung (chỉ chạy khi focus ở trong) — dùng `useEscClose`.
- Control con tự xử lý ESC (danh sách xổ AppCombobox, DropdownMenu, lịch AppDatebox, sửa tiêu đề inline…) phải `e.stopPropagation()` khi đang mở → ESC chỉ đóng control đó, không đóng popup. AppCombobox / DropdownMenu / AppDatebox đã làm sẵn.
- Đang gõ bộ gõ (IME, `isComposing`) → bỏ qua.


### DataTable gom nhóm — thu gọn / mở rộng tất cả

`groupBy` + `groupLabel` + `groupStorageKey` → dòng tiêu đề nhóm bấm để đóng / mở (nhớ theo storage key). Nút "thu gọn / mở rộng tất cả" đặt ở thanh công cụ, gọi qua ref:
```vue
<DataTable ref="tableRef" :group-by="'_groupKey'" ... />
<button class="btn-icon btn-icon--outline" @click="tableRef.allCollapsed ? tableRef.expandAll() : tableRef.collapseAll()">
  <TIcon :name="tableRef?.allCollapsed ? 'unfold' : 'fold'" />
</button>
```
- `defineExpose`: `collapseAll()`, `expandAll()`, `allCollapsed` (true khi mọi nhóm đang đóng → đổi icon / tooltip). Icon: `fold` (thu gọn) · `unfold` (mở rộng).


### AppNumberbox `decimal` — nhập số thập phân (Point, điểm…)

```vue
<AppNumberbox v-model="form.baPoint" :min="0" decimal :stepper="false" />
```
- Ô chữ `inputmode="decimal"` (bàn phím số trên điện thoại): nhận **cả “,” lẫn “.”** làm dấu thập phân (người Việt quen gõ 5,75), lọc ký tự lạ, không ép theo `step` (5,75 giữ nguyên).
- Đang gõ dở (“5,”) không phát giá trị; rời ô / Enter → chuẩn hóa, kẹp `min` / `max`, hiện lại dạng dấu phẩy. `v-model` luôn là Number (hoặc `''` khi trống).
- Số nguyên thuần (số màn hình, số ngày…) vẫn dùng AppNumberbox thường.


### AppCombobox `recent-key` — nhóm “Gần đây” khi chọn người / dự án

```vue
<AppCombobox v-model="form.pdId" :options="pdOptions" recent-key="pick-pd" />
```
- Nhớ tối đa `recent-max` (mặc định 5) giá trị vừa chọn theo khóa (localStorage `cb-recent:<key>`) — dùng CHUNG khóa cho mọi ô cùng loại (VD mọi ô chọn PD: `pick-pd`, BA: `pick-ba`) để chọn ở đâu cũng nhớ.
- Mở danh sách (chưa gõ tìm): nhóm **Gần đây** trên cùng → đường kẻ → **Tất cả** (không lặp lại người đã ở Gần đây). Gõ tìm → danh sách lọc bình thường. Giá trị không còn trong options / bị khóa thì không hiện.


### DataTable — nút thao tác theo từng dòng

`rowActions: [{ icon, title, emit, danger?, show?(row) }]` — `show(row)` trả `false` → ẩn nút đó ở dòng đó (VD “Nhận việc” chỉ ở việc chưa có người). `max-row-actions` (mặc định 3) = số nút tối đa mỗi dòng, tính SAU khi lọc `show`.


### Tooltip: luôn dùng `v-tip` (mds-ui), không dùng `title` mặc định của trình duyệt

Nút icon (thao tác trên dòng bảng, nút công cụ…), avatar, chữ viết tắt → `v-tip="'Nội dung'"` + `aria-label` cho trình đọc màn hình. **Không dùng thuộc tính `title`** (tooltip trình duyệt: hiện chậm, chữ nhỏ, khó nhìn, không theo theme). DataTable đã đổi hết (nút thao tác dòng, “Thêm thao tác”, “Lọc cột”, nút trong ô, tên thành viên ở nhóm avatar).

**⛔ Tooltip KHÔNG lặp lại chữ đang hiện đủ** (lỗi tái diễn nhiều lần, VD mục sidebar mở rộng hover lại hiện đúng tên mục): tooltip CHỈ khi nó cho thêm thông tin — phần tử **chỉ có icon** / chữ đang ẩn (sidebar thu gọn), chữ **bị cắt "…"**, **viết tắt**, hoặc câu **giải thích khác** chữ đang hiện. Chữ đầy đủ mà tooltip = đúng chữ đó → không hiện. Đã khóa sẵn trong mds-ui: `v-tip` và `enableAutoTooltips()` tự bỏ qua tooltip trùng chữ đang hiện (cần ép hiện: `v-tip.always`, hiếm). Bấm chuột thì tooltip ẩn; focus chỉ hiện tooltip khi đi bằng bàn phím (`:focus-visible`) — không để tooltip treo lại sau khi bấm.
Kiểm tra trước khi giao: Playwright hover từng thứ có tooltip → chữ hiện đủ mà vẫn ra `.mds-tip` trùng chữ là lỗi; bấm nút rồi rời chuột → không còn `.mds-tip`.


### Thanh cuộn — `detectClassicScrollbars()` (`@mds/utils/scrollbars.js`)

Gọi 1 lần ở `main.js`. Mặc định giữ thanh cuộn hệ điều hành (macOS overlay tự ẩn — không đè CSS). Máy hiện thanh cuộn **cổ điển** (luôn hiện, chiếm chỗ: Windows, macOS “luôn hiện”) → tự gắn `html.classic-scrollbars` → style.css vẽ thanh cuộn **mảnh**: rãnh trong suốt, con trượt bo tròn xám nhạt (`--text-secondary` 32%), đậm hơn khi rê. Không tự viết `::-webkit-scrollbar` riêng ở từng màn.


### OverflowActions — dãy nút tự co, thiếu chỗ thì gom vào ⋯

```vue
<OverflowActions :actions="[{ id: 'pd', label: 'Gán PD', icon: 'user' }, …, { id: 'delete', label: 'Xóa', icon: 'trash', danger: true }]" @select="onAction" />
```
- Đo bề rộng thật từng nút + theo dõi kích thước (ResizeObserver): đủ chỗ → hiện hết; thiếu → hiện các nút đầu theo thứ tự `actions`, phần còn lại vào nút icon ⋯ (DropdownMenu, `danger` = chữ đỏ). Xếp nút quan trọng trước, nguy hiểm (Xóa) cuối.
- Dùng cho thanh thao tác hàng loạt (TableHeader `#bulk-buttons` — vùng này đã `flex: 1; min-width: 0`) và mọi dãy nút có thể tràn.


### DataTable — lưu độ rộng cột người dùng kéo

`@column-resize="(col, width) => …"` phát khi THẢ chuột sau khi kéo vạch chia (width px) hoặc khi **nhấp đúp vạch chia** (width = `null` → về mặc định). App lưu theo người dùng rồi truyền lại qua `col.width` (đổi `col.width` → bảng nhận độ rộng mới); kèm `col.defaultWidth` để nhấp đúp quay về. Với `useColumnSettings` (chamdiem-app): `@column-resize="(c, w) => cols.setWidth(c.key, w)"` — lưu cùng thứ tự / ẩn hiện / xuống dòng theo tài khoản.

- **Mọi bảng tự nhớ độ rộng:** app `provide('dtWidthStore', { get(key), set(key, colKey, px | null) })` (chamdiem-app: `store/tableWidths.js`, lưu theo tài khoản). DataTable tự dùng kho này, khóa = `persist-key` (nếu đặt) hoặc tự sinh theo bộ cột. Bảng nào đã tự xử lý `@column-resize` thì DataTable không ghi vào kho chung (tránh lưu trùng).

- **Tooltip tự động cho mọi nút:** gọi `enableAutoTooltips()` (`@mds/utils/tooltip.js`) 1 lần ở `main.js` → rê vào nút / link có `title` / `aria-label` hiện tooltip mds-ui ngay (title chuyển sang `aria-label`) — **chỉ khi** nút chỉ có icon (không có chữ đang hiện, VD sidebar thu gọn) hoặc chữ bị cắt / viết tắt; **chữ hiện đầy đủ thì không hiện tooltip** (VD sidebar mở rộng). ⛔ Nút icon nào cũng phải có `title` / `aria-label` / `v-tip` — không để nút icon trơn không nhãn.

- **Combobox chọn nhiều (`multiple`) — hành xử như Vaadin Multi-Select Combo Box (chốt 03/11/2026):** thẻ đã chọn nằm **1 hàng trong ô, ô KHÔNG cao lên**; thẻ không đủ chỗ gộp thành thẻ **“+N” ở đầu** (rê chuột → tooltip tên các mục ẩn), luôn hiện các mục chọn SAU CÙNG, thẻ còn 1 mà vẫn dài thì cắt “…” · chọn xong **danh sách vẫn mở**, mục đã chọn có ✓ · đang gõ lọc mà chọn → **ô gõ tự xóa** · ↓ mở, ↑↓ di chuyển, Enter chọn / bỏ, Esc đóng · **Backspace khi ô trống: lần 1 làm sáng thẻ cuối, lần 2 mới bỏ** · × trên thẻ bỏ 1 mục (không mở danh sách) · × cuối ô xóa hết (từ 2 thẻ). Style theo Figma **Combobox Multiple** (6019:50293): thẻ Tag Small cao = ô − 8 (24 ở ô 32), đệm 8, chữ ↔ × 6, bo 8, nền Neutral Light + viền 1px Stroke/Neutral, × 12px, thẻ cách 4, ô lề trái 4 · thẻ đếm = ô vuông chứa số (không dấu +) + 2 mép thẻ xếp chồng bên trái (asset `mds-ui/src/assets/tag-stack.svg`) · chữ thẻ 13px Medium (Figma 12 → giữ 13 theo quy chuẩn chữ). Đã có sẵn trong `AppCombobox` — không tự dựng.

## AppAlertDialog — dialog xác nhận / thông báo (Figma Alert Dialog 6019:180746)

```vue
<AppAlertDialog v-if="del" type="danger" title="Xóa khách hàng An Phát?" message="Khách hàng và 12 chứng từ liên quan sẽ bị xóa vĩnh viễn."
  confirm-label="Xóa" @confirm="doDelete" @cancel="del = null" />
```
- Rộng 432 · đệm 24 · các phần cách 16 · KHÔNG vạch ngăn · bo `--radius-dialog` (12) · bóng `--shadow-bottom-12`.
- Tiêu đề H3 16/22 Semi Bold, tối đa 2 dòng (cắt → tooltip) · icon đóng 20px `--icon-neutral` cách tiêu đề 12 · nội dung 13/20 (slot mặc định hoặc `message`).
- Hàng nút căn phải cách 8: Hủy (`cancel-label`, ẩn bằng `hide-cancel`) · nút phụ `secondary-label` (@secondary) · nút chính `confirm-label` (`type="danger"` → đỏ). `link-label` → Text link bên trái (@link).
- Esc / ✕ / bấm ra ngoài = @cancel (`persistent` chặn bấm ngoài) · mở ra focus sẵn nút chính · `loading` khóa nút chính · `inline` vẽ tại chỗ (ví dụ trong tài liệu).
- Dialog có FORM nhập liệu vẫn dùng `AppFormPanel` (tiêu đề 20px, footer ghim đáy) — AppAlertDialog chỉ cho xác nhận / thông báo ngắn.

## AppTree — cây nhiều cấp (Figma Pattern Organization Tree 46155:6035)

```vue
<AppTree v-model="donVi" :items="coCau" checkable panel :max-height="420" />   <!-- [{ id, label, children?, disabled? }] -->
```
- Dòng cao `--menu-item-h` (32), đệm ngang 16, dòng cách 4, mỗi cấp thụt 24 · mũi tên 16 → ô tick 16 → tên 13/20 (cách 8, cắt “…” + tooltip) · đã chọn chữ brand · rê chuột / phím trỏ nền `--bg-brand-light`.
- `panel`: nền trắng, đệm 12, bo 8, `--shadow-bottom-20` · ô tìm kiếm (Searchbox) trên cùng cách cây 8 (`searchable`, mặc định bật) — lọc bỏ dấu, giữ nhánh cha, tự mở nhánh có kết quả.
- `checkable` → v-model mảng id, mặc định chọn **độc lập** (như Figma); `cascade` → tick cha chọn cả nhánh, cha chọn dở = indeterminate. Không `checkable` → v-model 1 id + `@select`.
- Bàn phím ↑↓ · → mở / xuống con · ← đóng / lên cha · Space / Enter chọn · từ ô tìm ↓ vào cây. `default-expanded`: true / số cấp / mảng id. ⛔ Không tự dựng cây bằng div lồng nhau.

## Ghim cột · Thiết lập bảng · Bộ lọc (DataTable — chốt 03/11/2026)

- **Ghim cột**: cột có `pinned: true` (hoặc ghim từ menu ⋮ tiêu đề cột / drawer Thiết lập) → **dính trái khi kéo ngang** (sticky), luôn nằm **sau cột tick chọn**, cột ghim cuối có bóng ngăn. App đổi `pinned` trên cột → bảng nhận lại.
- **`<TableSettingsDrawer>`** (Figma 19929:26845) — mở từ nút ⚙ của TableHeader (`@col-settings`): drawer phải 625px, tìm cột, bảng cột (⋮⋮ kéo thả đổi thứ tự · tick ẩn / hiện · sửa tên hiển thị · độ rộng · ghim), tuỳ chọn `group-options` (Thiết lập dòng: gom nhóm), chân ghim đáy “Lấy lại mặc định | Hủy · Lưu”. `@save="{ columns, groupBy }"` → app áp lên `columns`. **Cột bắt buộc hiển thị** (cột định danh / mặc định phải thấy, VD Số chứng từ, Mã, Họ tên): khai báo `locked: true` trên cột → ô tick ở drawer tick sẵn nhưng KHÓA (mờ, tooltip “Cột mặc định bắt buộc hiển thị, không thể ẩn”), “tick tất cả” bỏ qua cột này, menu ⋮ của tiêu đề cột không có “Ẩn cột”; vẫn kéo đổi thứ tự / đổi tên / độ rộng / ghim được. Mỗi bảng nên có ≥ 1 cột `locked` (thường là cột đầu / cột link mở chi tiết).
- **`<TableFilterPanel>`** (Figma 6019:136462) — mở từ nút Bộ lọc (`@open-filter`), đặt **bên phải bảng** trong cùng khung: `fields: [{ key, label, type?: 'number', options? }]`, `v-model` = `{ key: { condition, value } }`, `saved` = bộ lọc đã lưu. Bấm tiêu chí → khối nền brand nhạt (điều kiện Combobox + giá trị), chân “Bỏ lọc · Áp dụng”. Lọc dòng bằng `matchFilters(row, filters, fields)` (`@mds/utils/tableFilter.js`); truyền `:filter-count` cho TableHeader để hiện số tiêu chí.
- **Bảng sửa trực tiếp** (`editable`): cột `textbox` / `numberbox` / `textarea` / `combobox` (= AppCombobox ghost, **không `<select>`**) / `toggle`, nhận `@cell-update="{ row, col, value }"`.

## Bộ màu biểu đồ theo Figma (🌈 Chart Colors)

`import { chartColors, CHART_COLORS, CHART_MODES } from '@mds/utils/chartColors.js'` — 10 họ màu (id trùng màu chủ đề `theme.js`) × 7 màu × 3 kiểu `palette` (nhóm) / `single` (độ lớn) / `divergent` (tăng–giảm quanh mốc). `chartColors(currentTheme.value, 'palette')[i]`, gán theo thứ tự cố định 1 → 7. ⚠️ Kiểu Palette của Figma là dải chuyển màu: 2 màu liền kề có thể khó phân biệt (validator ΔE < 15) → luôn kèm chú thích + giá trị, hoặc lấy màu cách quãng (1, 3, 5, 7) khi chỉ có 3–4 nhóm.

## AppHelpPanel — panel Trợ giúp (Figma Help Frame 51535:79812)
```vue
<AppHelpPanel v-model="q" :variant="currentMode === 'light' ? 'brand' : 'default'" @close="open = false" @open-new="…" @channel="c => …">
  <h1 class="help-article__title">1. Tiền mặt</h1>
  <img class="help-article__media" :src="video" alt="…" />
  <section class="help-article__section"><p class="help-article__text">I. THU TIỀN MẶT</p>
    <ul class="help-article__links"><li><a href="…">Rút tiền gửi ngân hàng…</a></li></ul></section>
</AppHelpPanel>
```
Props: `variant` default|brand · `title` ('Trợ giúp') · `placeholder` · `showOpenNew` · `channelsLabel` · `channels` [{ id, icon, label }] (mặc định brand-facebook · video · brand-youtube · school; [] = ẩn chân). Emits: update:modelValue, search, close, open-new, channel. Expose `toTop()`, `setExpanded(bool)`. Chân “Kênh hỗ trợ” (Figma _Help Footer 54669:60753): mặc định 1 hàng icon + **^** sát phải; bấm ^ → **mở rộng**: tiêu đề H3 + danh sách Menu List Item (icon 20 + `label` đầy đủ, cao 32, rê Brand Light), **✕ / Esc** thu gọn — mặc định nhãn: Cộng đồng MISA · Lịch đào tạo/chia sẻ Online · Hướng dẫn qua video · Kho tri thức nghiệp vụ. Panel lấp đầy khung chứa (khung đặt rộng 500, kéo đổi rộng bằng `v-resizable-drawer` maxRatio 0.5). Header → default = app header màu, brand = app header trắng.

## AppOnboarding — popup Bắt đầu sử dụng (quy chuẩn /ds/onboarding-start)
```vue
<AppOnboarding v-model="open" v-model:level="level" user-name="…" product="AMIS CRM" :steps="steps[level]" :active-task="taskId" :initial-step="nextStepId"
  guides-title="Hướng dẫn sử dụng AMIS CRM" :guides="guides" :supports="supports" @task="(t, s) => router.push(t.route)" @video="t => play(t)" @guide="…" @support="…" />
```
`steps`: `[{ id, title, tasks: [{ id, label, done, video? }] }]` hoặc `groups: [{ id, title, tasks }]` (tiến độ bước = nhóm xong / nhóm). `guides`: `[{ id, icon, tone: brand|danger|success, label, progress? }]` · `supports`: `[{ id, icon | img, tone?, label, ai? }]`. `@task` (bấm việc = xong việc) · `@group-done(group, done, step)` (ô tick tròn bên phải nhóm) · `@step-done(step, done)` (nút “Đánh dấu hoàn thành cả bước” cuối thân bước, tự mở bước sau) · `step.icon` + `:show-icons` (icon đầu bước, mặc định hiện). Popup đóng mà còn việc → tự hiện nút nổi **kéo thả được** (nhớ vị trí theo `fab-key`; `:fab="false"` tắt). Esc / ✕ / bấm nền để đóng.

## AppTaskTray — khay tiến trình chạy ngầm (quy chuẩn /ds/background-tasks)
```vue
<AppTaskTray v-if="trayOpen" v-model:collapsed="collapsed" :tasks="tasks"
  @close="trayOpen = false" @action="(t, id) => …" @cancel="t => confirmCancel(t)" @dismiss="t => remove(t)" @history="…" />
```
Thao tác > 10 giây / không rõ thời gian (nhập · xuất khẩu lớn, cập nhật hàng loạt) → chạy ngầm trên máy chủ + khay góc dưới phải (rộng 400, header Brand “N tiến trình đang xử lý” / “Đã xong N tiến trình”, ⌄ thu gọn, ✕ đóng — tiến trình vẫn chạy). Task: `{ id, kind: export|import|other, title, status: queued|running|success|partial|error|canceled, done, total, progress?, eta?, result?, errors?, finishedAt?, actions? }`. Nút mặc định: success → Tải xuống (export) / Xem · partial → Tải file lỗi · error → Thử lại. ✕ trên dòng: đang chạy → `@cancel` (app hỏi AppAlertDialog danger, nêu hậu quả) · đã xong → `@dismiss`. Khay mở → chỉ đổi dòng; khay thu gọn / đóng → toast có nút + Thông báo. Icon Tiến trình `loader-2` (đứng yên) trên header (slot `#header-actions`, trước MISA AI) chỉ hiện khi khay còn dòng: badge số đang chạy `.header-badge` (đỏ chuẩn như Thông báo) · hết chạy mà có Lỗi / Xong một phần chưa xem → `.header-badge.header-badge--dot` · khay trống → ẩn icon; bấm mở rộng / ẩn khay. Tối đa 3 chạy cùng lúc, còn lại Đang chờ; chạy trùng → toast cảnh báo, không tạo mới.

## AppTabs — thanh tab (Figma Tab Horizontal Item 6019:101046)

```vue
<AppTabs v-model="tab" :items="[{ value: 'info', label: 'Thông tin chung', icon: 'user' }, { value: 'contract', label: 'Hợp đồng', badge: 3 }]"
  variant="brand" :underline="true" aria-label="Hồ sơ nhân viên" />
```
- `variant`: `brand` (mặc định — trắng, chữ Brand, gạch 2px) · `filled` (Brand Light + gạch) · `solid` (nền Brand, chữ trắng) · `neutral` (nền Neutral Light, chữ đậm). Chỉ 4 kiểu này — không có Gray. `underline` = kẻ 1px dưới cả hàng.
- Cao **36px cố định** (không theo mật độ), đệm 12, chữ 13 (đang chọn Bold). Hover Brand Light, nhấn Brand Light Hover. Phím ← → Home End.
- CSS dùng chung `.tabs` / `.tab` (style.css). Tab đầu trang sub-nav có gom "Xem thêm" → vẫn dùng `SubNavTabs`.

## AppSegmented — chọn 1 trong 2–5 cách xem (Figma ❖ Segmented 6019:80533)

```vue
<AppSegmented v-model="period" :options="[{ value: 'd', label: 'Ngày' }, { value: 'w', label: 'Tuần' }]" variant="text" />
<AppSegmented v-model="view" :options="[{ value: 'list', icon: 'list', tip: 'Danh sách' }, { value: 'kanban', icon: 'layout-kanban', tip: 'Kanban' }]" />
```
- `variant`: `text` (Brand Text — khung Neutral 200, mục chọn trắng + bóng) · `solid` (mục chọn nền Brand) · `filled` (mục chọn Brand Light). `fit` = chia đều cả khung.
- Khung cao `--btn-height`, đệm 2, bo 8; mục cao khung − 4, đệm 12, bo `--radius-inner`. Mục chỉ có icon BẮT BUỘC có `tip`.
- CẤM tự dựng segment riêng (`.view-switch`, `.role-switch`, `.demo-seg`…) cho màn mới — dùng AppSegmented.
- Mục chưa chọn: chữ **Text/Primary** (#10141B), không dùng chữ phụ.

## AppAvatar — avatar (Figma Avatar 6019:6258)

```vue
<AppAvatar :size="32" name="Trần Hậu" :src="url" />                 <!-- ảnh lỗi / không ảnh → chữ cái đầu -->
<AppAvatar :size="48" name="Trần Hậu" dot online />                   <!-- Badge Dot: chấm đỏ trên + xanh dưới -->
<AppAvatar :size="48" name="Lê Minh" :count="6" badge-icon="camera" interactive />
```
- Avatar chữ cái: nền **theo theme** — `color="brand"` (mặc định, BG/Brand/Brand Light Hover) · `color="neutral"` (Neutral Light); chữ Text/Primary. Mặc định KHÔNG tô màu theo tên. Ngoại lệ: **danh sách người** (card dashboard, bảng nhân sự) được dùng `color="auto"` (AppAvatar) / cột `avatarColor: 'auto'` (DataTable `avatar-text` · `avatar-subtext` · `group-avatar`) → mỗi người 1 màu cố định theo tên (băm tên → 1 trong 6 nền BG/*/Light Hover: brand · success · warning · danger · info · accent; **chữ vẫn Text/Primary** — chỉ nền đổi), cùng tên luôn cùng màu. Chỗ tự vẽ avatar (bảng, combobox, header) lấy màu từ `avatarColor()` trong `utils/avatar.js`. Chữ cái theo Figma Avatar: cỡ chữ theo cỡ avatar (24 → 10 Medium · 32/40 → 12 Medium · 48 → 16 Medium · 56 → 20 Semi Bold), luôn Text/Primary; avatar chữ cái viền trắng 1px, avatar ảnh viền Stroke/Neutral.
- Cỡ: 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 80. Viền: ảnh Stroke/Neutral, chữ cái trắng; bấm được → hover / đang chọn viền 2px Stroke/Brand Light.
- Badge to nhỏ theo cỡ (AppAvatar tự tính, đo từ Figma): chấm 4/6/8/8/8/12/12/16/20px · badge số / icon (từ cỡ 24) 16/16/20/20/24/28px. Cỡ 12–20 chỉ có Dot.

## Button Icon — `.btn-icon` + kiểu + màu (Figma Button Icon Medium 6019:13890 · Small 6019:14107)

```html
<button class="btn-icon btn-icon--solid btn-icon--brand" aria-label="Thêm" v-tip="'Thêm'"><TIcon name="plus" /></button>
<button class="btn-icon btn-icon--outline btn-icon--danger btn-icon--sm" aria-label="Xóa" v-tip="'Xóa'"><TIcon name="trash" /></button>
<button class="btn-icon btn-icon--framed btn-icon--info" aria-label="Thông tin" v-tip="'Thông tin'"><TIcon name="info-circle" /></button>
```
- Kiểu: (mặc định = Icon, không nền) · `--outline` (viền màu) · `--framed` (Neutral Icon Color: viền xám, icon màu) · `--solid` (nền màu, icon trắng).
- Màu: `--brand` · `--info` · `--warning` · `--danger` · `--success` · Neutral (không thêm class) · `--white` (trên nền tối). AI → `.btn.btn--ai|--ai-outline|--ai-text.btn--icon-only`.
- Hover / nhấn theo Figma: Icon & Outline → <Màu> Light / Light Pressed · Framed → Neutral Light / Light Pressed · Solid → <Màu> Hover / Pressed · White → Alpha White 200 / 300. Small = `.btn-icon--sm`. Luôn có `aria-label` + tooltip.

## Icon Swap — icon trần có trạng thái (Figma Icon Swap 6019:66690)

```html
<span class="icon-swap icon-swap--16 icon-swap--success"><TIcon name="circle-check" /></span>        <!-- icon trang trí, không bấm -->
<button class="icon-swap icon-swap--16 icon-swap--action" aria-label="Bỏ điều kiện" v-tip="'Bỏ điều kiện'"><TIcon name="x" /></button>
```
- Màu: Neutral (mặc định) · `--white` · `--ai` · `--brand` · `--accent` · `--link` · `--info` · `--warning` · `--danger` · `--success`. Cỡ: `--12 … --48` (mặc định 20).
- Trạng thái theo Figma: Default Icon/<Màu> · **Hover** (chỉ `.icon-swap--action`) Icon/<Màu> Hover — **Neutral hover → Icon/Brand**, Link hover → Brand Hover, AI → gradient 700 · Disabled (`:disabled` / `.icon-swap--disabled`) Icon/<Màu> Disabled, AI → gradient 300.
- KHÁC icon trong nút: icon trong `.btn` / `.btn-icon` Neutral luôn #6B707A, chỉ nền đổi khi hover. AI cần `ensureAiGradient()`.

## Bộ lọc của bảng — 2 dạng (Figma Body Filter)

| Dạng | Component | Hành vi |
|---|---|---|
| **Cơ bản** (Figma 6019:136455) | `TableFilterPopover` | popover 320px xổ **ngay dưới nút lọc** (không đẩy bảng) · trường cố định: Combobox “Tất cả”, Datebox, khoảng ngày · `layout="vertical"` (nhãn trên) \| `"horizontal"` (nhãn trái) · bấm ra ngoài / Esc đóng |
| **Advance** (Figma 6019:136462) | `TableFilterPanel` (chuyển nguyên từ app Chấm điểm `AdvancedFilterPanel`) | panel 300px **bên phải bảng, đẩy bảng hẹp lại** (khối card riêng cạnh table-panel, như `list-split` của app) · ô tìm + danh sách trường có checkbox, tick → mở **tại chỗ** toán tử + giá trị (text / number / date / enum, có “Trong khoảng”) · (tuỳ chọn) Đã lưu: mục đang dùng Brand Light + nút … · màn ≤ 640px: panel nổi đè bên phải |

```vue
<TableHeader … @open-filter="el => { anchor = el; open = !open }" />
<TableFilterPopover v-if="open" v-model="basic" :fields="[{ key: 'dept', label: 'Phòng ban', options }, { key: 'period', type: 'daterange' }]" :anchor="anchor" @apply="…" @close="open = false" />
<!-- hoặc -->
<div class="list-split"><div class="table-panel">…</div>
  <TableFilterPanel v-if="open" :fields="FIELDS" :filter="adv" :saved="SAVED" @apply="v => (adv = v)" @close="open = false" /></div>
<!-- FIELDS: [{ key, label, type: 'text'|'number'|'date'|'enum', options?, get: row => … }] · adv: { mode: 'all', conditions: [] }
     lọc dòng: rows.filter(r => testRow(r, adv, FIELDS)) — import { testRow, describe, isComplete } from '@mds/utils/advancedFilter.js' -->
```
- Chân cả 2 dạng: nền Neutral 100, viền trên, Bỏ lọc trái · Áp dụng phải. `TableHeader` emit `open-filter` kèm phần tử nút lọc để neo popover.

### Thân bảng trống — `DataTable #empty`
```vue
<DataTable :columns="cols" :rows="filtered"><template #empty>
  <TIcon name="search" class="dt-empty-state__icon" /><p class="dt-empty-state__title">Không tìm thấy hóa đơn khớp “{{ q }}”</p>
  <p class="dt-empty-state__desc">Kiểm tra lại chính tả…</p><div class="dt-empty-state__acts"><button class="btn btn--outline btn--neutral" @click="q = ''">Xóa tìm kiếm</button></div>
</template></DataTable>
```
Dùng cho danh sách **đã xóa hết** và **tìm kiếm / lọc không ra** (giữ hàng tiêu đề cột). Danh sách **lần đầu** (chưa từng có dữ liệu) không render bảng — dùng khối minh họa riêng (/ds/empty-state).

### ⛔ Lọc theo cột ↔ bộ lọc Advance LIÊN THÔNG (1 bộ điều kiện chung)
```vue
<DataTable :columns="cols" :rows="rows" v-model:filter="adv" :filter-fields="FIELDS" … />
<TableFilterPanel :fields="FIELDS" :filter="adv" @apply="v => (adv = v)" … />
<TableFilterTags :active="adv.conditions.filter(isComplete)" … />
```
- Lọc 1 cột trên tiêu đề (icon phễu) = ghi điều kiện vào **chính `adv`** → panel Advance bên phải **tự tick** trường đó với đúng toán tử + giá trị, thanh tag hiện điều kiện, số đếm trên nút lọc tăng. Ngược lại tick / bỏ ở panel, xóa tag → tiêu đề cột tự hiện / bỏ trạng thái đang lọc (chấm + nền). Mỗi trường chỉ 1 điều kiện.
- Popover lọc cột dùng **cùng toán tử + ô nhập** với panel (`FilterConditionEditor`: text · number có Trong khoảng · date Từ / Đến · enum combobox) · có tên cột · chân: **Bỏ lọc** (khi cột đang lọc, bên trái) · Hủy · Áp dụng.
- Cột ↔ trường: `col.filterKey ?? col.key` khớp `field.key` (VD cột hiển thị `amountText` → `filterKey: 'amount'`). Cột không có trường lọc → không hiện nút phễu. Muốn cột nào lọc được thì thêm trường cho cột đó vào FIELDS.
- Lọc dòng chỉ 1 chỗ: `rows.filter(r => testRow(r, adv, FIELDS))` — không giữ bộ lọc cột riêng. Không truyền `filter` = lọc cột kiểu cũ (`@column-filter`), chỉ dùng cho bảng không có bộ lọc Advance.

## Menu List có checkbox (Figma Menu List Item · Show Checkbox)
- `<DropdownMenu checkbox :items="[{ id, label, checked }]" @select="toggle" />` — ô tick 16px bên trái, mục đã tick nền Brand Light (chữ thường), menu **giữ mở** khi chọn.
- Trạng thái mục Menu List: hover Brand Light · nhấn **Brand Light Pressed** · đang chọn Brand Light → hover Light Hover → nhấn Light Pressed · focus viền Brand.

## Nút icon mở popover → Brand Outline khi đang mở
- Nút icon (`.btn-icon`) bấm xổ popover / menu: khi đang mở hiển thị **Brand Outline** (viền Brand, nền trắng, icon Brand) — CSS `.btn-icon[aria-expanded="true"]`. `DropdownMenu` tự gắn `aria-expanded` cho nút trigger; nút lọc của `TableHeader` dùng prop `filter-open`. Nút tự dựng mở popover → tự đặt `:aria-expanded`.

## Chọn tất cả trên bảng (Data table — Figma Bulk Action Table 6019:136351)
- Tick ô ở tiêu đề cột chỉ chọn **các dòng của trang đang xem**. Thanh thao tác hàng loạt (TableHeader) hiện: “Đã chọn **10** · Bỏ chọn · **Chọn tất cả N trên bảng**”; bấm → chọn mọi bản ghi (sau lọc) của mọi trang, hiện “Đã chọn tất cả **N** trên bảng · Bỏ chọn”.
- Nút trong thanh thao tác hàng loạt (slot `bulk-buttons`): luôn **có icon** trước chữ (VD `check` Duyệt) · nút Outline Neutral; hành động nguy hiểm (Xóa) = **`btn--outline-danger`** + icon `trash`.
- Props `TableHeader`: `:total-count` (tổng bản ghi sau lọc) · `:page-all-selected` · `:all-pages-selected` · emit `select-all-pages`. Bỏ tick 1 dòng khi đang “chọn tất cả” → thoát chế độ tất cả.

## Form nhãn trái — độ rộng cột nhãn tự động
- Mọi `<AppInput :vertical="false">` tự đăng ký với khung gần nhất (`[data-label-group]` → `.form-body` → `.form-fields`): cột nhãn = nhãn dài nhất (+ khoảng 8px tới ô), các ô thẳng hàng dọc; tự đo lại khi đổi nhãn / thêm bớt trường / đổi cỡ chữ, mật độ. Tối đa 200px.
- Muốn nhiều nhóm / card dùng CHUNG 1 độ rộng → bọc ngoài bằng `<div data-label-group>`. Form cấu hình động có trường đang ẩn → `v-auto-label-width="{ labels }"` trên khung.
- Chân form: `--bg-form-footer` (Neutral/100) + viền trên `--stroke-form-footer`.

## Thao tác dòng của DataTable — 3 dạng (prop `action-mode`)
> ⛔ Dòng cuối bảng: menu “…” tự **lật lên trên** khi sát đáy màn hình (DropdownMenu đo chỗ trống) và nhóm nút giữ hiện khi menu đang mở — không tự làm menu `position: absolute` trong ô.

| `action-mode` | Hiển thị (Figma ReadOnly Column Table) | Dùng khi |
|---|---|---|
| `hover` (mặc định) | rê chuột lên dòng mới hiện **tối đa 2 nút thao tác chính** + icon “…”; thao tác còn lại và **thao tác nguy hiểm (Xóa) luôn nằm trong “…”** (chữ đỏ, sau vạch ngăn) | bảng xem nhiều cột, thao tác ít dùng |
| `icons` | **cột ghim cuối bảng** (Type=Icons): icon chức năng chính + icon “…” xổ chức năng phụ | luôn cần thấy thao tác |
| `link` | **cột ghim cuối bảng** (Type=Link Action Icon): tên chức năng chính dạng link Brand Semi Bold + ⌄ xổ chức năng phụ | chức năng chính cần tên rõ (Duyệt, Xem chi tiết…) |
- Chức năng chính = `row-actions[0]` (cần `label` cho `link`, `title` làm tooltip cho `icons`); các mục còn lại của `row-actions` + `more-actions` vào menu phụ. Mục menu không có `emit` → sự kiện `more-action` ({ action, row }).
- `actions-label` = tiêu đề cột ghim; cột dính mép phải khi kéo ngang, có ô ở dòng tiêu đề và dòng Tổng.
- **Bảng sửa trực tiếp (`editable`) luôn dùng `action-mode="icons"`** (cột icon ghim cuối, VD Xóa dòng) — dạng `hover` nổi đè lên control ở cột cuối (toggle, ô nhập) khi rê dòng, không bấm được. Cột này **không có tiêu đề** (để trống), icon (VD Xóa) **căn giữa**, cột rộng vừa đủ icon — DataTable tự làm khi `editable` + `action-mode="icons"`, không cần `actions-label`.

## Lỗi ô sửa trực tiếp của DataTable — `col.required` / `col.validate`
- Cùng quy chuẩn báo lỗi input (`utils/fieldError.js`): ô lỗi **viền đỏ + icon chấm than đỏ bên phải trong ô**; rê icon hoặc đang ở ô → **tooltip lỗi đỏ phía dưới** (không đẩy dòng). Dùng component `DtCellError` (DataTable tự bọc ô textbox / numberbox / textarea / combobox).
- `required: true` → báo “<Tên cột> không được để trống” khi người dùng **xóa trắng / rời ô trống**; dòng mới chưa đụng tới không báo. Đổi câu: `requiredMessage`.
- `validate: (value, row) => 'chuỗi lỗi' | ''` → lỗi nghiệp vụ (VD “Số lượng phải lớn hơn 0”).
- Combobox bắt buộc: ẩn nút xóa (×) nên không thể để trống; lỗi `validate` hiện qua viền + icon của chính AppCombobox.
- Ô số bị xóa trắng phải giữ trống (null), **không tự điền 0** — nếu không sẽ không báo được lỗi bắt buộc.

## Vạch ngăn cột của DataTable — prop `column-lines`
- Mặc định `true`: header kẻ vạch liền Stroke/Neutral, thân bảng vạch chấm giữa các cột.
- `:column-lines="false"`: bỏ vạch ngăn cột dài ở thân bảng, chỉ còn đường kẻ ngang giữa các dòng; header vẫn giữ **vạch ngăn ngắn** (1px, cao 16px, giữa ô, màu Stroke Neutral) để phân tách tiêu đề các cột — không có ở cột cuối / trước cột thao tác; kéo mép cột để đổi độ rộng vẫn dùng được (vạch Brand hiện khi rê). Dòng Tổng vốn không có vạch ngăn cột.

## Bảng nằm TRONG card trắng — `.table-panel--bordered`
- Bảng đặt thẳng trên nền xám trang: khung bảng = card (bo 8 + bóng All 2, không viền), sát mép. **Bảng trên nền xám PHẢI có thanh công cụ (`TableHeader`, nền trắng) phía trên** — hàng tiêu đề cột nền xám (`--dt-header-bg`) gần giống `--bg-page` nên không có thanh công cụ thì tiêu đề lẫn vào nền chung. Bảng đặt TRONG card trắng (card đệm `--box-padding` 16 đều 4 phía): bảng không còn sát mép → khung bảng **viền 1px `--stroke-neutral` + bo `--radius-card` 8 cả 4 góc, KHÔNG bóng** (trắng trên trắng).
- Cấu trúc: `<section class="card"><h3 class="card__title">Tiêu đề</h3><div class="table-panel table-panel--bordered"><TableHeader/> <div class="table-scroll"><DataTable/></div> <TablePaging/></div></section>` — tiêu đề card → khung bảng cách `--card-gap` 12; toolbar / tiêu đề cột / dòng tổng / phân trang nằm TRONG khung viền; hàng tiêu đề cột bỏ viền trên (đã có ở `.table-panel--bordered`, tránh viền đôi). Vạch TRÊN hàng tiêu đề cột: có toolbar / chip lọc phía trên thì GIỮ (ngăn toolbar ↔ tiêu đề), chỉ bỏ khi tiêu đề là dòng đầu khung (CSS `.table-panel--bordered:not(:has(.table-header, .tft))` đã xử lý — ⛔ không bỏ vạch này khi có toolbar). Khung bảng trong card có CHIỀU CAO theo vùng nội dung (cha flex cột, khung `flex: 1; min-height: 0`): phân trang ghim đáy; ít dòng → dòng tổng bám dòng cuối, khoảng trắng giữa dòng tổng ↔ phân trang; nhiều dòng → dòng tổng ghim trên phân trang, cuộn trong vùng dữ liệu; ⛔ không để khung co theo số dòng. Toolbar + ô tìm kiếm (`TableHeader`) ẨN ĐƯỢC (bảng ít dòng / chỉ xem): bỏ `<TableHeader>` → hàng tiêu đề cột là dòng đầu của khung viền (bo 2 góc trên theo khung, không viền đôi); ẩn ô tìm kiếm thì xóa luôn từ khóa đang lọc. ⛔ Không tự viết border / radius; bảng trong popup dùng cùng class. Sample: /ds/data-table › Loại bảng › Bảng trong card.

## Vạch ngăn cột nét liền + Header gộp ô (Bảng lương) — props `column-line-style`, cột `group`
- `column-line-style="solid"` (mặc định `dotted`): vạch ngăn cột ở THÂN bảng nét liền (cùng màu Stroke/Neutral với vạch ở tiêu đề). Dùng cho bảng có header gộp ô; bảng thường vẫn nét chấm.
- **Header gộp ô**: khai báo `group: 'Lương chuẩn'` trên các cột con → các cột LIỀN NHAU cùng `group` gộp thành 1 ô nhãn nhóm ở hàng trên (rộng = tổng bề rộng cột con — cột trong nhóm nên có `width` cố định); cột không có `group` có ô tiêu đề cao 2 hàng (gộp dọc). Bảng gộp cột: **tiêu đề căn giữa** (ô nhóm + ô cột), dữ liệu vẫn chữ trái / số phải; cột ghim đứng yên, hàng nhóm cuộn cùng nội dung, 2 hàng tiêu đề dính đầu khung. Sample: /ds/data-table › Loại bảng › Bảng lương. ⛔ Không tự dựng bảng HTML `<th colspan>` cho case này.

## Bảng tóm tắt chỉ xem — prop `summary`
- Dùng cho bảng ít dòng (5–7) trong card màn Tổng quan / dashboard, chỉ để xem nhanh, kèm nút “Xem tất cả” sang màn đầy đủ: `<DataTable summary :columns :rows :hide-blank-rows="false" />`.
- Style GIỮ NGUYÊN bảng chuẩn (header nền Table Header chữ Bold, viền dòng Stroke/Neutral, hover dòng Brand Light).
- Tự tắt: vách ngăn cột (= `:column-lines="false"`, header còn vạch ngắn 16px), lọc cột, header ghim khi cuộn; menu cột chỉ còn nhóm **Sắp xếp** (Không sắp xếp / Tăng dần / Giảm dần — không ghim / di chuyển / thêm / ẩn cột / xuống dòng).
- VẪN CÓ: sắp xếp (app không nghe `@column-sort` thì bảng tự sắp xếp dòng, mỗi lần 1 cột; giá trị = `col.sortValue(row)` ?? `row[col.key]`, object lấy title / label / name / text) và kéo đổi độ rộng cột. Dòng chỉ có con trỏ tay khi app nghe `@row-click`.
- KHÔNG ghi đè CSS riêng cho bảng trong card (header trắng, vạch thụt, hover bo góc…); không dùng phân trang / tick chọn / thao tác dòng trong bảng tóm tắt.

## Dòng điều kiện đang lọc — `TableFilterTags` (Figma _Conditonal Filter / Box 6019:136495)
```vue
<TableFilterTags :active="activeConditions" :mode="filter.mode" :field-of="k => FIELDS.find(f => f.key === k)"
  @remove="id => …" @clear="…" @edit="showFilter = true" />
```
- Đặt ngay dưới TableHeader khi đang lọc (bộ lọc Advance). Mỗi điều kiện 1 tag: **Trường** (chữ chính) · **Điều kiện** (chữ Brand) · **Giá trị** (chữ chính), cách nhau 4 + ✕ bỏ điều kiện · tag nền trắng, viền Stroke/Neutral, bo 8, cao 36, đệm 12 × 8. Cuối dòng: Sửa bộ lọc · Xóa tất cả.
- Tách 3 phần bằng `describeParts(c, field, fmtDate)` trong `utils/advancedFilter.js` (app Chấm điểm truyền `:fmt-date="formatDate"`).
