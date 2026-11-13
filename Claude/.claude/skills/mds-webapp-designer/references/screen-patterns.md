# Screen Patterns — MDS Web App

Patterns layout cho các loại màn hình web phổ biến. Luôn dùng component từ thư viện, chỉ tự build container/layout frame.

## ⛔ Quy tắc bắt buộc khi build mọi màn hình

1. **MÀUSẮC** → bind variable từ `🎨 Themes` collection (xem `components.md#color-variables`). KHÔNG hardcode hex.
2. **FONT** → dùng text style ID hoặc load font đúng tên `"Semi Bold"` (có khoảng cách). KHÔNG hardcode số.
3. **ICON** → lấy từ MDS Icon component qua `importComponentByKeyAsync` + `swapComponent()`.
4. **DỮ LIỆU** → table ≥ 5 hàng, form điền đầy đủ. KHÔNG để trống.
5. **CHƯA BIẾT** → hỏi user trước khi vẽ, KHÔNG tự đoán.

---

## ⛔ Quy tắc Webapp Code (Vue 3) — BẮT BUỘC TUYỆT ĐỐI

### Hai biến thể cấu trúc trang danh sách

| Biến thể | Page Header | Tab Area | Nút Thêm | `main-function-button` |
|----------|-------------|----------|----------|------------------------|
| **Không có tab** | ✅ Có — chứa title + Primary Button | ❌ Không | Trong `.page-header__right` | ❌ **KHÔNG set** (mặc định false) |
| **Có tab** | ❌ **Không có** — bỏ hẳn | ✅ Ngay đầu trang | Trong `TableHeader` slot `#main-buttons` | ✅ **Phải set `true`** |

**⛔ Quy tắc bắt buộc:**
- Trang **không có tab** → có Page Header → TableHeader **KHÔNG** hiện Main Function Button (`:main-function-button` không cần ghi hoặc `false`)
- Trang **có tab** → không có Page Header → TableHeader **PHẢI** có `:main-function-button="true"` + slot `#main-buttons`
- **NGHIÊM CẤM** để nút Thêm xuất hiện ở CẢ HAI nơi (page-header và main-buttons cùng lúc)

```html
<!-- ✅ ĐÚNG — Trang KHÔNG có tab: button ở page-header, TableHeader không có main-function-button -->
<AppShell>
  <div class="page-header">
    <div class="page-header__left"><h1 class="page-header__title h2">Nhân viên</h1></div>
    <div class="page-header__right">
      <AppButton label="Thêm nhân viên" icon-left="plus" @click="openAdd" />
    </div>
  </div>
  <div class="table-panel">
    <div class="th-wrapper">
      <TableHeader v-model="searchText" @refresh="..." @export="..." />
      <!-- KHÔNG có :main-function-button="true" và KHÔNG có slot #main-buttons -->
    </div>
    ...
  </div>
</AppShell>

<!-- ✅ ĐÚNG — Trang CÓ tab: KHÔNG có page-header, tab nằm đầu tiên -->
<AppShell>
  <div class="tab-area">              <!-- ← ngay sát dưới Global Header -->
    <button class="tab-item tab-item--active">Tất cả</button>
    <button class="tab-item">Đã xác nhận</button>
    ...
  </div>
  <div class="table-panel">
    <div class="th-wrapper">
      <TableHeader v-model="searchText" :main-function-button="true">
        <template #main-buttons>
          <AppButton label="Thêm lịch hẹn" icon-left="plus" @click="openAdd" />
        </template>
      </TableHeader>
    </div>
    ...
  </div>
</AppShell>
```

### AppButton — Size theo vị trí

`AppButton` có 3 size, chiều cao thay đổi theo density setting:

| Size | Prop | Chiều cao (standard) | Dùng ở đâu |
|------|------|----------------------|------------|
| `md` | *(không cần ghi)* | `--btn-height` = **32px** | `page-header__right`, **`#main-buttons` trong `TableHeader`**, modal footer, form action bar |
| `lg` | `size="lg"` | `btn-height + 8px` = **40px** | Chỉ khi user yêu cầu rõ |

> **⚠️ `size="sm"` = 28px — KHÔNG dùng trong TableHeader.** Search box, filter select và icon-button trong TableHeader đều cao 32px (`--btn-height`). Dùng `sm` sẽ thấp hơn 4px so với hàng ngang — lỗi alignment rõ ràng.

**⛔ Quy tắc bắt buộc:**

```html
<!-- ✅ page-header__right → md (không ghi size) -->
<AppButton label="Thêm nhân viên" icon-left="plus" @click="openAdd" />

<!-- ✅ TableHeader #main-buttons → md (KHÔNG ghi size="sm") -->
<template #main-buttons>
  <AppButton label="Thêm nhân viên" icon-left="plus" @click="openAdd" />
</template>

<!-- ✅ Modal footer → md (không ghi size) -->
<AppButton label="Hủy"    variant="outline" color="neutral" @click="closeModal" />
<AppButton label="Lưu"    icon-left="check" @click="handleSave" />

<!-- ❌ SAI — size="sm" trong TableHeader làm button thấp hơn icon-button 4px -->
<AppButton label="Thêm" size="sm" @click="openAdd" />
```

---

### DataTable — Action buttons (sửa/xóa) chỉ hiện khi hover

**KHÔNG dùng `type: 'action-icon'` trong columns** — loại này luôn hiện buttons, không có hover effect.

Dùng **`:row-actions` prop** trên `<DataTable>` — DataTable đã có CSS `opacity: 0 → 1` on hover sẵn:

```html
<!-- ✅ ĐÚNG — chỉ hiện khi hover row -->
<DataTable
  :columns="columns"
  :rows="pagedRows"
  :row-actions="rowActions"
  @edit-row="openEdit"
  @delete-row="confirmDelete"
/>
```

```js
// ✅ Định nghĩa rowActions (tách riêng, không nằm trong columns)
const rowActions = [
  { icon: 'pencil', emit: 'edit-row',   title: 'Chỉnh sửa' },
  { icon: 'trash',  emit: 'delete-row', title: 'Xóa', danger: true },
]

// ✅ columns chỉ có data cols — KHÔNG có _actions entry
const columns = [
  { key: 'name', label: 'Tên', fill: true },
  ...
]
```

```html
<!-- ❌ SAI — luôn hiện buttons trên mọi dòng, không hover -->
<DataTable :columns="columns" ... />
<!-- columns có: { key: '_actions', type: 'action-icon', actions: [...] } -->
```

---

### Padding của `.th-wrapper`

`TableHeader` component đã có `padding: 12px 16px` bên trong. DataTable header row đã có `border-top` tự tạo separator. `.th-wrapper` **chỉ cần `padding: 0`**, không thêm `border-bottom` — sẽ tạo double line.

```css
/* ✅ ĐÚNG */
.th-wrapper { padding: 0; }

/* ❌ SAI — double padding */
.th-wrapper { padding: 0 12px; }

/* ❌ SAI — double line (DataTable header row đã có border-top rồi) */
.th-wrapper { padding: 0; border-bottom: 1px solid var(--stroke-divider); }
```

---

### `ControlHeader` — Props đầy đủ

> File: `@mds/components/ControlHeader.vue`  
> **Bắt buộc dùng component này cho Global Header** — không tự vẽ `<header>`.

**Props:**

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `app-name` | String | `'Kế Toán'` | Tên ứng dụng hiển thị trên header |
| `app-tag` | String | `''` | Tag nhỏ bên cạnh app name (vd: "Beta") |
| `no-meta` | Boolean | `false` | Ẩn toàn bộ phần branch/company — dùng cho app không có chi nhánh |

**Slots:**

| Slot | Mô tả |
|------|-------|
| `#header-meta` | Override phần company/chi nhánh (chỉ dùng khi cần custom; ẩn hẳn thì dùng `:no-meta="true"`) |
| `#header-search` | Override search box (mặc định là `AppSearchbox`) |
| `#header-actions` | Thêm icon buttons tùy chỉnh vào toolbar bên phải |

**Theme init — bắt buộc trong `App.vue`:**

```js
import { applyTheme } from '@mds/theme.js'
// Đặt màu mặc định cho app; user có thể đổi qua Settings dialog trong ControlHeader
if (!localStorage.getItem('mds-theme')) applyTheme('pink') // đổi màu theo app
else applyTheme(localStorage.getItem('mds-theme'))
```

**Ví dụ nhanh:**

```html
<!-- App CÓ chi nhánh (kế toán, ERP...) — để mặc định -->
<ControlHeader app-name="Kế toán" />

<!-- App KHÔNG có chi nhánh (spa, POS, nội bộ...) -->
<ControlHeader app-name="Spa & Làm đẹp" :no-meta="true" />

<!-- App có tag Beta -->
<ControlHeader app-name="Báo cáo" app-tag="Beta" :no-meta="true" />
```

---

## Spacing chuẩn — Áp dụng cho MỌI màn hình (từ MDS library node 6435:22415 & 20187:55118)

> Đây là thông số đo trực tiếp từ Figma MDS library. KHÔNG được tự ý thay đổi.

### Layout tổng thể
| Vùng | Kích thước |
|------|-----------|
| Frame desktop | 1366 × 768 |
| Global Header | FILL × **48px** |
| Sidebar collapsed | **64px** × FILL |
| Sidebar expanded | **200px** × FILL |
| Main Content | FILL × FILL |
| Page Header | FILL × **56px** |

### List Page — Cấu trúc chuẩn đã xác nhận ✅ (từ Figma node 6435:22419)

> Đây là cấu trúc chính xác đo từ Figma MDS library. Mọi màn hình danh sách mới phải theo đúng pattern này.

```
Frame 1366×768 (VERTICAL, no padding, clipsContent=true, BG/Page)
├── Global Header                     FILL × 48px  (Type=Default, Search Type=Box)
└── Body Row                          FILL × FILL  (HORIZONTAL, no padding, gap 0)
    ├── Side Bar Expand=True          200px × FILL
    └── Main Content                  FILL × FILL  (VERTICAL, gap=0, no padding)
        ├── Page Header               FILL × 56px  (Type=List Page, MDS component)
        │                             ⚠️ FULL WIDTH — direct child của Main Content, KHÔNG nằm trong Content Wrapper
        │                             Chứa nút Thêm / Nhập khẩu (vì không có tab)
        └── Content Wrapper           FILL × FILL  (VERTICAL, padding L=16 R=16 B=16 T=0, fills=[])
            └── Table Panel           FILL × FILL  (VERTICAL, BG/White, radius=8, clipsContent=true, gap=0)
                ├── Table Header Wrapper  FILL × 56px  (HORIZONTAL, padding L=16 R=16, fills=[])
                │   └── Table Header component  FILL × 56px  ⚠️ mainFunctionButton=FALSE
                ├── Table             FILL × FILL  (HORIZONTAL, BG/White, counterAxisAlignItems=STRETCH)
                │   └── Columns: Checkbox(48,FIXED) + Text cols(FILL) + Action(FIXED)
                └── Paging            FILL × 48px  (MDS component)
```

> ⚠️ **Page Header là FULL WIDTH** — là sibling của Content Wrapper bên trong Main Content, không bị padding L/R=16 của Content Wrapper ảnh hưởng.  
> **Content Wrapper** (padding L/R/B=16) chỉ bọc Table Panel, KHÔNG bọc Page Header.  
> **`mainFunctionButton=false`** trên Table Header: các nút Thêm/Nhập khẩu đã nằm trong Page Header bên trên.

**Key spacing — Variant 1 (không có tab):**
| Vị trí | Giá trị |
|--------|---------|
| Frame | **1366 × 768px** |
| Main Content | gap=0, no padding |
| Page Header | FILL × **56px**, direct child Main Content |
| Page Header Type | `Type=List Page` |
| Content Wrapper padding | T=0, L=**16px**, R=**16px**, B=**16px** |
| Table Panel: BG | `BG/White` |
| Table Panel: cornerRadius | **8px** (= Radius/Defaullt) |
| Table Panel: clipsContent | **true** |
| Table Panel: itemSpacing | **0** — 3 vùng sát nhau, không gap |
| Table Header Wrapper padding L/R | **16px** |
| Table Header height | **56px** |
| Table Header `mainFunctionButton` | **false** |
| Table row height | **56px** |
| Paging height | **48px** |

**Code — Cấu trúc List Page đầy đủ (đã xác nhận chuẩn):**
```js
// ── Discover biến màu từ working file ─────────────────────────────────────────
// (library IDs không dùng được trong working file — phải discover động)
// Bước 1: Lấy collection từ node đã có bound variable (hoặc tạo từ đầu với approach bên dưới)
// Bước 2: build varMap = { "BG/Page": id, "BG/White": id, ... }

// ── Page Header (FULL WIDTH — direct child của main, KHÔNG trong Content Wrapper) ──
const pageHeaderSet = await figma.importComponentSetByKeyAsync("1dee593be92cdf6f31e8e43cf37463dc0092507e");
const pageHeaderInst = (pageHeaderSet.children.find(c => c.name === "Type=List Page") || pageHeaderSet.defaultVariant).createInstance();
main.appendChild(pageHeaderInst);  // ← append vào main, KHÔNG phải content
pageHeaderInst.layoutSizingHorizontal = "FILL";  // full width = không bị cắt padding
pageHeaderInst.layoutSizingVertical   = "FIXED";

// ── Content Wrapper (chỉ bọc Table Panel, padding L/R/B=16) ──────────────────
const content = figma.createFrame();
content.name = "Content Wrapper";
content.layoutMode = "VERTICAL";
content.paddingTop    = 0;
content.paddingBottom = 16;
content.paddingLeft   = 16;
content.paddingRight  = 16;
content.itemSpacing   = 0;
content.fills = [];          // transparent
content.clipsContent = false;
main.appendChild(content);
content.layoutSizingHorizontal = "FILL";
content.layoutSizingVertical   = "FILL";

// ── Table Panel (BG/White, radius=8, clipsContent, gap=0) ────────────────────
// ⚠️ setBoundVariable("cornerRadius") không hoạt động — set số trực tiếp
const bgWhiteVar = await figma.variables.getVariableByIdAsync(varMap["BG/White"]);
const panel = figma.createFrame();
panel.name = "Table Panel";
panel.layoutMode = "VERTICAL";
panel.paddingTop = panel.paddingBottom = panel.paddingLeft = panel.paddingRight = 0;
panel.itemSpacing = 0; // gap=0 giữa Header, Table, Paging
panel.clipsContent = true;
panel.cornerRadius = 8; // = Radius/Defaullt
panel.fills = [figma.variables.setBoundVariableForPaint({type:"SOLID",color:{r:1,g:1,b:1}}, "color", bgWhiteVar)];
content.appendChild(panel);
panel.layoutSizingHorizontal = "FILL";
panel.layoutSizingVertical   = "FILL";

// ── Table Header Wrapper (padding L/R = 16) ───────────────────────────────────
const tableHeaderWrapper = figma.createFrame();
tableHeaderWrapper.name = "Table Header Wrapper";
tableHeaderWrapper.layoutMode = "HORIZONTAL";
tableHeaderWrapper.paddingLeft = 16; tableHeaderWrapper.paddingRight = 16;
tableHeaderWrapper.paddingTop = 0;   tableHeaderWrapper.paddingBottom = 0;
tableHeaderWrapper.itemSpacing = 0;
tableHeaderWrapper.fills = [];
tableHeaderWrapper.clipsContent = false;
panel.appendChild(tableHeaderWrapper);
tableHeaderWrapper.layoutSizingHorizontal = "FILL";
tableHeaderWrapper.layoutSizingVertical   = "FIXED";
tableHeaderWrapper.resize(tableHeaderWrapper.width, 56);

// Table Header component (FILL bên trong wrapper → tự thu hẹp theo padding)
const tableHeaderSet = await figma.importComponentSetByKeyAsync("830bb2ee9b439d094eb371c5d2366548406b6563");
const tableHeaderInst = (tableHeaderSet.children.find(c => !c.name.includes("bulkAction=true")) || tableHeaderSet.defaultVariant).createInstance();
tableHeaderWrapper.appendChild(tableHeaderInst);
tableHeaderInst.layoutSizingHorizontal = "FILL";
tableHeaderInst.layoutSizingVertical   = "FIXED";
// ⚠️ KHÔNG có tab → ẩn mainFunctionButton (nút Thêm/Nhập đã nằm trong Page Header)
tableHeaderInst.setProperties({ "mainFunctionButton": false });

// ── Table (HORIZONTAL, FILL × FILL) ──────────────────────────────────────────
const table = figma.createAutoLayout("HORIZONTAL");
table.name = "Table";
table.fills = [figma.variables.setBoundVariableForPaint({type:"SOLID",color:{r:1,g:1,b:1}}, "color", bgWhiteVar)];
table.itemSpacing = 0; table.clipsContent = true;
table.counterAxisAlignItems = "STRETCH";
panel.appendChild(table);
table.layoutSizingHorizontal = "FILL";
table.layoutSizingVertical   = "FILL";

// ── Paging (MDS component, FILL × 48) ────────────────────────────────────────
const pagingSet = await figma.importComponentSetByKeyAsync("cfbbd171c7fce04129e7a47025fb815f6e4c1c54");
const pagingInst = pagingSet.defaultVariant.createInstance();
panel.appendChild(pagingInst);
pagingInst.layoutSizingHorizontal = "FILL";
pagingInst.layoutSizingVertical   = "FIXED";
```

### Form Page — Main Content spacing
```
Main Content (FILL × FILL, VERTICAL, padding 0, gap 0)
├── Page Header component      FILL × 56px
├── Form Content (scrollable)  FILL × FILL
│   └── Sections wrapper (padding left:16 right:16 top:0)
│       ├── Section card 1     FILL × auto
│       │   ├── [padding top:16 left:16 right:16 bottom:16]
│       │   ├── Section title  h=24
│       │   ├── [gap: 16px]
│       │   └── Input Group columns (2 columns, gap: 80px)
│       │       ├── Column Left  width=579
│       │       └── Column Right width=579
│       ├── [gap giữa sections: 16px]
│       └── Section card 2...
└── Form Footer (action bar)   FILL × 56px
```

**Key spacing — Form Page:**
| Vị trí | Giá trị |
|--------|---------|
| Sections wrapper padding trái/phải | **16px** |
| Section card padding (all sides) | **16px** |
| Section title height | **24px** |
| Gap title → input area | **16px** |
| Input row height | **32px** |
| Gap giữa input rows | **12px** (y step = 44px) |
| Two-column gap | **80px** |
| Label column width | **200px** |
| Gap label → input field | **8px** |
| Input field width (trong 1-col) | **371px** |
| Gap giữa các section cards | **16px** |
| Form Footer height | **56px** |

### Áp dụng vào code
```js
// Data Table wrapper với padding chuẩn
const dataTable = figma.createAutoLayout("VERTICAL");
dataTable.paddingLeft = 16;
dataTable.paddingRight = 16;
dataTable.paddingTop = 0;
dataTable.paddingBottom = 0;
dataTable.itemSpacing = 0;
parent.appendChild(dataTable);
dataTable.layoutSizingHorizontal = "FILL";
dataTable.layoutSizingVertical = "FILL";

// Section card (form page)
const section = figma.createAutoLayout("VERTICAL");
section.paddingTop = 16;
section.paddingBottom = 16;
section.paddingLeft = 16;
section.paddingRight = 16;
section.itemSpacing = 0; // managed by sub-groups
section.cornerRadius = 8;
// BG/White background via variable (figma.variables.setBoundVariableForPaint — không phải figma.setBoundVariableForPaint)
const bgVar = await figma.variables.getVariableByIdAsync("VariableID:15062:20453");
section.fills = [figma.variables.setBoundVariableForPaint({type:"SOLID",color:{r:1,g:1,b:1}}, "color", bgVar)];
```

---

## ⛔ QUY TẮC CẤU TRÚC TỔNG THỂ — BẮT BUỘC TUYỆT ĐỐI

```
⛔⛔⛔ HEADER LUÔN KÉO DÀI FULL CHIỀU NGANG MÀN HÌNH ⛔⛔⛔
⛔⛔⛔ SIDEBAR LUÔN NẰM PHÍA DƯỚI HEADER, KHÔNG BAO GIỜ NẰM NGANG HÀNG VỚI HEADER ⛔⛔⛔

ĐÚNG:
  Frame (VERTICAL)
  ├── Global Header (FILL width ← FULL MÀN HÌNH, 48px)
  └── Body Row (HORIZONTAL, FILL)
      ├── Sidebar (200px)
      └── Main Content (FILL)

SAI — NGHIÊM CẤM:
  Frame (HORIZONTAL) ← SAI, KHÔNG được để Frame là HORIZONTAL
  ├── Sidebar (200px)           ← SAI, sidebar ngang hàng header
  └── Right Side (VERTICAL)
      ├── Global Header (FILL)  ← SAI, header không full width
      └── Content Area
```

---

## 1. Layout Màn hình Tổng quan (Standard Layout)

Bố cục chuẩn cho màn hình có header + sidebar + nội dung chính. Dùng MDS component cho header và sidebar.

```
Frame: [Tên màn hình] (1366 × 768, VERTICAL, no padding, clip content)
├── Global Header (FILL × 48) — MDS component   ← FULL WIDTH
└── Body Row (FILL × FILL, HORIZONTAL, no padding, gap 0)
    ├── Side Bar (200 hoặc 64 × FILL) — MDS component
    └── Main Content (FILL × FILL) — tự build
```

### Variant có Tab Horizontal (màn hình dashboard/overview với 3 tab)

Dùng khi màn hình có tab điều hướng ngay dưới header, trong Main Content.

```
Frame 1366×768 (VERTICAL)
├── Global Header (FILL × 48)              ← FULL WIDTH qua cả sidebar
└── Body Row (HORIZONTAL, FILL)
    ├── Side Bar Expand=True (200px × FILL)
    └── Main Content (VERTICAL, FILL)
        ├── Tab Area (FILL × 48, BG/White)  ← wrapper, paddingTop=12
        │   └── Tabs Horizontal (FILL)
        └── Content Area (FILL, BG/Page, padding L=16 R=16 T=16 B=16)
            └── ... nội dung màn hình ...
```

```js
// ── Frame màn hình ─────────────────────────────────────────────────────────────
const frame = figma.createFrame();
frame.name = "Tên màn hình";
frame.layoutMode = "VERTICAL"; // VERTICAL — KHÔNG phải HORIZONTAL
frame.primaryAxisSizingMode = "FIXED";   // ⚠️ BẮT BUỘC: cố định chiều cao 768px, tránh HUG collapse
frame.counterAxisSizingMode = "FIXED";  // ⚠️ BẮT BUỘC: cố định chiều ngang 1366px
frame.resize(1366, 768);               // resize PHẢI gọi SAU khi set layoutMode + sizingMode
frame.itemSpacing = 0;
frame.paddingTop = frame.paddingBottom = frame.paddingLeft = frame.paddingRight = 0;
frame.clipsContent = true;
// Đặt frame vào page TRƯỚC — sau đó các child mới set layoutSizingH/V = FILL được
figma.currentPage.appendChild(frame);

// ── Global Header (FULL WIDTH) ─────────────────────────────────────────────────
const headerSet = await figma.importComponentSetByKeyAsync("a73126feab6a3724986a5912e8bbb599c301d77a");
const headerInst = (headerSet.children.find(c => c.name === "Type=Default, Search Type=Box") || headerSet.defaultVariant).createInstance();
frame.appendChild(headerInst);
headerInst.layoutSizingHorizontal = "FILL"; // full width 1366px
headerInst.layoutSizingVertical = "FIXED";

// ── Body Row (Sidebar + Main Content) ─────────────────────────────────────────
const bodyRow = figma.createAutoLayout("HORIZONTAL");
bodyRow.name = "Body Row";
bodyRow.fills = []; bodyRow.itemSpacing = 0;
bodyRow.paddingTop = bodyRow.paddingBottom = bodyRow.paddingLeft = bodyRow.paddingRight = 0;
frame.appendChild(bodyRow);
bodyRow.layoutSizingHorizontal = "FILL";
bodyRow.layoutSizingVertical = "FILL";

// ── Sidebar ────────────────────────────────────────────────────────────────────
const sideBarSet = await figma.importComponentSetByKeyAsync("0265e4dee056c3583aacfb9edaaed353f883a344");
const sbInst = (sideBarSet.children.find(c => c.name === "Expand=True")).createInstance();
bodyRow.appendChild(sbInst);
sbInst.layoutSizingHorizontal = "FIXED";
sbInst.layoutSizingVertical = "FILL";

// ── Main Content ───────────────────────────────────────────────────────────────
const main = figma.createAutoLayout("VERTICAL");
main.name = "Main Content"; main.fills = []; main.itemSpacing = 0;
bodyRow.appendChild(main);
main.layoutSizingHorizontal = "FILL";
main.layoutSizingVertical = "FILL";

// ── Tab Area (nếu có tab) ──────────────────────────────────────────────────────
const tabArea = figma.createAutoLayout("HORIZONTAL");
tabArea.name = "Tab Area";
tabArea.paddingTop = 12; tabArea.paddingBottom = 0;
tabArea.paddingLeft = 0; tabArea.paddingRight = 0;
tabArea.itemSpacing = 0;
// Bind BG/White fill (hoặc fills = [{ type: "SOLID", color: {r:1,g:1,b:1} }])
main.appendChild(tabArea);
tabArea.layoutSizingHorizontal = "FILL";
tabArea.layoutSizingVertical = "FIXED";
tabArea.resize(tabArea.width, 48);

const tabsSet = await figma.importComponentSetByKeyAsync("6197172af0ad2d54d977700de957bec352c3fa01");
const tabsInst = (tabsSet.children.find(c => c.name === "Underline=True, Fix Width=No") || tabsSet.defaultVariant).createInstance();
tabArea.appendChild(tabsInst);
tabsInst.layoutSizingHorizontal = "FILL";

// ── Content Area ───────────────────────────────────────────────────────────────
const contentArea = figma.createAutoLayout("VERTICAL");
contentArea.name = "Content Area";
contentArea.fills = [{ type: "SOLID", color: { r: 0.953, g: 0.957, b: 0.965 } }]; // BG/Page
contentArea.paddingTop = 16; contentArea.paddingBottom = 16;
contentArea.paddingLeft = 16; contentArea.paddingRight = 16;
contentArea.itemSpacing = 12;
main.appendChild(contentArea);
contentArea.layoutSizingHorizontal = "FILL";
contentArea.layoutSizingVertical = "FILL";
```

### Global Header — componentKey: `a73126feab6a3724986a5912e8bbb599c301d77a`

## ⛔ AUTO-DETECT HEADER TYPE TỪ SCREENSHOT — BẮT BUỘC

```
Khi đọc ảnh thiết kế tham chiếu, PHẢI nhận diện nền của Global Header rồi chọn variant đúng:

  BƯỚC 1 — Nhìn màu nền header:
    • Nền màu Brand (xanh/tím/đậm) → Type = Default
    • Nền TRẮNG                     → Type = White  hoặc  Type = With Branch White

  BƯỚC 2 — Kiểm tra bên cạnh App name có text phụ nhỏ không:
    • Có text công ty / chi nhánh nhỏ cạnh tên app → THÊM "With Branch" vào Type
      Ví dụ: "Công ty cổ phần Đại Việt" hiện cạnh "Kế toán" → With Branch
    • Không có text phụ → giữ nguyên (Default hoặc White)

  KẾT HỢP:
    Nền brand  + không có branch text  → "Type=Default"
    Nền brand  + có branch text         → "Type=With Branch"
    Nền trắng  + không có branch text  → "Type=White"
    Nền trắng  + có branch text         → "Type=With Branch White"   ← PHỔ BIẾN NHẤT

  BƯỚC 3 — Search type:
    • Search box hiển thị rõ ràng dạng input field → "Search Type=Box"
    • Search chỉ là icon                           → "Search Type=Icon"
    • Không có search                              → "Search Type=Icon" (mặc định)
```

**Variants đầy đủ:**

| Type | Search Type | Variant name | Dùng khi |
|------|-------------|--------------|---------|
| Default | Box | `Type=Default, Search Type=Box` | Header màu brand, có search input |
| Default | Icon | `Type=Default, Search Type=Icon` | Header màu brand, search icon |
| With Branch | Box | `Type=With Branch, Search Type=Box` | Brand + tên công ty/chi nhánh + search box |
| With Branch | Icon | `Type=With Branch, Search Type=Icon` | Brand + tên công ty/chi nhánh + search icon |
| White | Box | `Type=White, Search Type=Box` | Nền trắng, search input |
| White | Icon | `Type=White, Search Type=Icon` | Nền trắng, search icon |

> ⛔ Sidebar tối chỉ đi với header `White`. Header màu brand (`Default` / `With Branch`) → sidebar luôn nền sáng.
| **With Branch White** | **Box** | **`Type=With Branch White, Search Type=Box`** | **Nền trắng + tên công ty ← PHỔ BIẾN** |
| With Branch White | Icon | `Type=With Branch White, Search Type=Icon` | Nền trắng + tên công ty + search icon |

**Kích thước:** FILL × 48px

```js
// Import và tạo Global Header — PHẢI chọn đúng variant theo screenshot
const headerSet = await figma.importComponentSetByKeyAsync("a73126feab6a3724986a5912e8bbb599c301d77a");

// VÍ DỤ: Ảnh có nền trắng + tên công ty cạnh app name → With Branch White
const headerVariant = headerSet.children.find(c =>
  c.name === "Type=With Branch White, Search Type=Box"
) || headerSet.defaultVariant;

// VÍ DỤ: Ảnh có nền brand không có tên công ty → Default
// const headerVariant = headerSet.children.find(c => c.name === "Type=Default, Search Type=Box");

const headerInst = headerVariant.createInstance();
frame.appendChild(headerInst);
headerInst.layoutSizingHorizontal = "FILL";
headerInst.layoutSizingVertical = "FIXED";
```

---

### Side Bar — componentKey: `0265e4dee056c3583aacfb9edaaed353f883a344`

**Variants:**

| Variant | Width | Mô tả |
|---------|-------|--------|
| `Expand=True` | 200px | Sidebar mở rộng, hiển thị icon + label |
| `Expand=False` | 64px | Sidebar thu gọn, chỉ hiển thị icon |

**Props chính:**
- `Expand` — `True` / `False`: trạng thái mở/thu gọn
- `showButtonQuickAdd` (boolean): hiện/ẩn nút "Thêm nhanh" ở đầu sidebar

**Nền trắng** (`var(--bg/white, white)`), border-right 1px `var(--stroke/neutral-light, #e9eaeb)`.
**Chiều cao:** FILL (theo container).

```js
// Import và tạo Side Bar
const sideBarSet = await figma.importComponentSetByKeyAsync("0265e4dee056c3583aacfb9edaaed353f883a344");
const sideBarVariant = sideBarSet.children.find(c =>
  c.name === "Expand=True"
) || sideBarSet.defaultVariant;
const sideBarInst = sideBarVariant.createInstance();
bodyRow.appendChild(sideBarInst);
sideBarInst.layoutSizingHorizontal = "FIXED"; // width đã đúng từ variant
sideBarInst.layoutSizingVertical = "FILL";
```

---

### Lắp đầy đủ màn hình Tổng quan

```js
// 1. Frame màn hình
const frame = figma.createFrame();
frame.name = "Màn hình Tổng quan";
frame.resize(1366, 768);
frame.layoutMode = "VERTICAL";
frame.paddingTop = 0; frame.paddingBottom = 0;
frame.paddingLeft = 0; frame.paddingRight = 0;
frame.itemSpacing = 0;
frame.clipsContent = true;
frame.fills = [{ type: "SOLID", color: { r: 0.953, g: 0.957, b: 0.965 } }]; // BG/Page

// 2. Import components
const headerSet = await figma.importComponentSetByKeyAsync("a73126feab6a3724986a5912e8bbb599c301d77a");
const sideBarSet = await figma.importComponentSetByKeyAsync("0265e4dee056c3583aacfb9edaaed353f883a344");

// 3. Global Header
const headerInst = (headerSet.children.find(c => c.name === "Type=Default, Search Type=Box") || headerSet.defaultVariant).createInstance();
frame.appendChild(headerInst);
headerInst.layoutSizingHorizontal = "FILL";
headerInst.layoutSizingVertical = "FIXED";

// 4. Body Row (sidebar + main)
const bodyRow = figma.createAutoLayout("HORIZONTAL");
bodyRow.name = "Body";
bodyRow.fills = [];
bodyRow.itemSpacing = 0;
bodyRow.paddingTop = 0; bodyRow.paddingBottom = 0;
bodyRow.paddingLeft = 0; bodyRow.paddingRight = 0;
frame.appendChild(bodyRow);
bodyRow.layoutSizingHorizontal = "FILL";
bodyRow.layoutSizingVertical = "FILL";

// 5. Side Bar
const sideBarInst = (sideBarSet.children.find(c => c.name === "Expand=True") || sideBarSet.defaultVariant).createInstance();
bodyRow.appendChild(sideBarInst);
sideBarInst.layoutSizingHorizontal = "FIXED";
sideBarInst.layoutSizingVertical = "FILL";

// 6. Main Content
const main = figma.createAutoLayout("VERTICAL");
main.name = "Main Content";
main.fills = [];
main.primaryAxisAlignItems = "MIN";
main.counterAxisAlignItems = "MIN";
main.itemSpacing = 0;
bodyRow.appendChild(main);
main.layoutSizingHorizontal = "FILL";
main.layoutSizingVertical = "FILL";
```

---

## 2. Layout Màn hình Danh sách (List Page)

Có 5 biến thể bố cục, tất cả đều dùng cùng cấu trúc khung ngoài. Sidebar và Global Header dùng MDS component.

### Cấu trúc khung chung

```
Frame 1366×768 (VERTICAL, no padding, clip content)
├── Global Header (FILL × 48) — MDS component
└── Body Row (FILL × 720, HORIZONTAL, no padding)
    ├── Side Bar (64px hoặc 200px × FILL) — MDS component
    └── Main Content (FILL × FILL, VERTICAL)
        ├── [xem từng biến thể bên dưới]
```

### Phần tử tái sử dụng trong Main Content

> ⛔ **Page Header PHẢI dùng MDS component** — KHÔNG được tự vẽ frame thay thế.  
> Xem chi tiết key và props tại [components.md § Page Header](components.md#-page-header).

**Page Header Bar** — componentKey: `1dee593be92cdf6f31e8e43cf37463dc0092507e` | h56, FILL width

| Variant | Dùng cho | Slot Content mặc định |
|---------|----------|-----------------------|
| `Type=List Page` | Màn hình danh sách | View toggle + Nhập từ Excel + Thêm |
| `Type=Form Page` | Màn hình thêm/sửa | Combobox layout + nút icon |
| `Type=View Detail Page` | Màn hình chi tiết | Button group Sửa + ... |
| `Type=Bulk Action` | Trạng thái đã chọn nhiều | Đã chọn N + action buttons |

```js
// ── Page Header — LUÔN dùng component, KHÔNG tự vẽ ──
const pageHeaderSet = await figma.importComponentSetByKeyAsync("1dee593be92cdf6f31e8e43cf37463dc0092507e");
const pageHeaderInst = (pageHeaderSet.children.find(c => c.name === "Type=List Page") || pageHeaderSet.defaultVariant).createInstance();
main.appendChild(pageHeaderInst);
pageHeaderInst.layoutSizingHorizontal = "FILL";
pageHeaderInst.layoutSizingVertical = "FIXED";

pageHeaderInst.setProperties({
  "Icon Back#6497:0": false,   // ẩn back ở màn hình list
  "Mode View#1109:209": true,  // hiện view toggle list/grid
  "Search#1109:210": false,    // search đã có ở toolbar bên dưới
  "Breadcrumb#2455:0": false
});

// Cập nhật tiêu đề
const titleNode = pageHeaderInst.findOne(n => n.type === 'TEXT' && n.name === 'Title');
if (titleNode) {
  await figma.loadFontAsync(titleNode.fontName);
  titleNode.characters = "Tên màn hình";
}
```

**Table Header component** (toolbar trên bảng) — h56, nằm trong Table Panel

```
Dùng component Table Header (key: 830bb2ee9b439d094eb371c5d2366548406b6563)
├── Left: [Search 240px] + [Trường: Giá trị ▼] × 1-3
├── Right icon group: [↺ refresh] [↑ export] [⚙ settings] [▼ filter]
└── Main Function Button (chỉ hiện khi có tab): [Nhập khẩu] [+ Thêm] [...]

Không có tab (Variant 1): mainFunctionButton=false  → nút Thêm nằm trong Page Header
Có tab (Variant 2):        mainFunctionButton=true   → nút Thêm nằm trong Table Header
```

**Pagination Bar** — h44, bg white, border-top 1px `#e9eaeb`
```
HORIZONTAL, SPACE_BETWEEN, paddingH 24, paddingV 10
├── Left: "Tổng số: N" (text)
└── Right: "Số dòng/trang" [10 ▼] + "1 - 10" + [|< < > >|]
```

---

### Variant 1 — List Page chuẩn ✅ (Sidebar mở rộng, không có tab — Figma node 6435:22419)

> **Đây là pattern đã được xác nhận chuẩn.** Dùng cho mọi màn hình danh sách thông thường.

```
Frame 1366×768 (VERTICAL, clipsContent, BG/Page)
├── Global Header (Type=Default, Search Type=Box)   FILL × 48px
└── Body Row (HORIZONTAL)                            FILL × FILL
    ├── Side Bar (Expand=True, 200px)                200px × FILL
    └── Main Content (VERTICAL, gap=0, no padding)   FILL × FILL
        ├── Page Header (Type=List Page)             FILL × 56px  ← FULL WIDTH, direct child
        │                                                            Chứa nút Thêm/Nhập khẩu
        └── Content Wrapper (pad L=16 R=16 B=16 T=0) FILL × FILL  ← chỉ bọc Table Panel
            └── Table Panel (BG/White, r=8, clips, gap=0)  FILL × FILL
                ├── Table Header Wrapper (pad L/R=16) FILL × 56px
                │   └── Table Header  mainFunctionButton=FALSE
                ├── Table (ReadOnly columns)          FILL × FILL
                └── Paging                            FILL × 48px
```

```js
// ── 0. Discover biến màu working file ─────────────────────────────────────────
// Cần 1 node đã có bound variable → lấy collection → build varMap

// ── 1. Frame màn hình ─────────────────────────────────────────────────────────
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Medium" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

const frame = figma.createFrame();
frame.name = "Màn hình Danh sách";
frame.resize(1366, 768);
frame.layoutMode = "VERTICAL";
frame.itemSpacing = 0;
frame.paddingTop = frame.paddingBottom = frame.paddingLeft = frame.paddingRight = 0;
frame.clipsContent = true;

// ── 2. Import components ───────────────────────────────────────────────────────
const [headerSet, sideBarSet, pageHeaderSet, tableHeaderSet, pagingSet, tableColSet] = await Promise.all([
  figma.importComponentSetByKeyAsync("a73126feab6a3724986a5912e8bbb599c301d77a"),   // Global Header
  figma.importComponentSetByKeyAsync("0265e4dee056c3583aacfb9edaaed353f883a344"),   // Side Bar
  figma.importComponentSetByKeyAsync("1dee593be92cdf6f31e8e43cf37463dc0092507e"),   // Page Header
  figma.importComponentSetByKeyAsync("830bb2ee9b439d094eb371c5d2366548406b6563"),   // Table Header
  figma.importComponentSetByKeyAsync("cfbbd171c7fce04129e7a47025fb815f6e4c1c54"),   // Paging
  figma.importComponentSetByKeyAsync("abc2a8c33f322af3b6fdc19fb53d29744eef10a4"),   // Table Columns ReadOnly
]);

// ── 3. Global Header ──────────────────────────────────────────────────────────
const headerInst = (headerSet.children.find(c => c.name === "Type=Default, Search Type=Box") || headerSet.defaultVariant).createInstance();
frame.appendChild(headerInst);
headerInst.layoutSizingHorizontal = "FILL";
headerInst.layoutSizingVertical = "FIXED";

// ── 4. Body Row ───────────────────────────────────────────────────────────────
const body = figma.createAutoLayout("HORIZONTAL");
body.name = "Body"; body.fills = []; body.itemSpacing = 0;
body.paddingTop = body.paddingBottom = body.paddingLeft = body.paddingRight = 0;
frame.appendChild(body);
body.layoutSizingHorizontal = "FILL";
body.layoutSizingVertical = "FILL";

// ── 5. Side Bar (Expand=True, 200px) ─────────────────────────────────────────
const sbInst = (sideBarSet.children.find(c => c.name === "Expand=True") || sideBarSet.defaultVariant).createInstance();
body.appendChild(sbInst);
sbInst.layoutSizingHorizontal = "FIXED";
sbInst.layoutSizingVertical = "FILL";

// ── 6. Main Content (VERTICAL, gap=0, no padding) ────────────────────────────
const main = figma.createAutoLayout("VERTICAL");
main.name = "Main Content";
main.fills = [];
main.itemSpacing = 0;
main.paddingTop = main.paddingBottom = main.paddingLeft = main.paddingRight = 0;
body.appendChild(main);
main.layoutSizingHorizontal = "FILL";
main.layoutSizingVertical = "FILL";

// ── 7. Page Header — FULL WIDTH, direct child của main ───────────────────────
// ⚠️ append vào main (không phải content) để đảm bảo full width không bị padding cắt
const pageHeaderInst = (pageHeaderSet.children.find(c => c.name === "Type=List Page") || pageHeaderSet.defaultVariant).createInstance();
main.appendChild(pageHeaderInst);
pageHeaderInst.layoutSizingHorizontal = "FILL";
pageHeaderInst.layoutSizingVertical = "FIXED";
const titleNode = pageHeaderInst.findOne(n => n.type === "TEXT" && n.name === "Title");
if (titleNode) { await figma.loadFontAsync(titleNode.fontName); titleNode.characters = "Tên màn hình"; }

// ── 8. Content Wrapper (chỉ bọc Table Panel, padding L/R/B=16) ───────────────
const content = figma.createFrame();
content.name = "Content Wrapper";
content.layoutMode = "VERTICAL";
content.paddingTop = 0; content.paddingBottom = 16;
content.paddingLeft = 16; content.paddingRight = 16;
content.itemSpacing = 0; content.fills = []; content.clipsContent = false;
main.appendChild(content);
content.layoutSizingHorizontal = "FILL";
content.layoutSizingVertical = "FILL";

// ── 9. Table Panel (BG/White, radius=8, clipsContent, gap=0) ─────────────────
const panel = figma.createFrame();
panel.name = "Table Panel";
panel.layoutMode = "VERTICAL";
panel.paddingTop = panel.paddingBottom = panel.paddingLeft = panel.paddingRight = 0;
panel.itemSpacing = 0; // gap=0 giữa Header, Table, Paging
panel.clipsContent = true; panel.cornerRadius = 8;
panel.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
content.appendChild(panel);
panel.layoutSizingHorizontal = "FILL";
panel.layoutSizingVertical = "FILL";

// ── 10. Table Header Wrapper (padding L/R=16) ─────────────────────────────────
const thWrapper = figma.createFrame();
thWrapper.name = "Table Header Wrapper";
thWrapper.layoutMode = "HORIZONTAL";
thWrapper.paddingLeft = 16; thWrapper.paddingRight = 16;
thWrapper.paddingTop = 0; thWrapper.paddingBottom = 0;
thWrapper.itemSpacing = 0; thWrapper.fills = []; thWrapper.clipsContent = false;
panel.appendChild(thWrapper);
thWrapper.layoutSizingHorizontal = "FILL";
thWrapper.layoutSizingVertical = "FIXED";
thWrapper.resize(thWrapper.width, 56);

const tableHeaderInst = (tableHeaderSet.children.find(c => !c.name.includes("bulkAction=true")) || tableHeaderSet.defaultVariant).createInstance();
thWrapper.appendChild(tableHeaderInst);
tableHeaderInst.layoutSizingHorizontal = "FILL";
tableHeaderInst.layoutSizingVertical = "FIXED";
// ⚠️ Không có tab → ẩn nút Thêm/Nhập khẩu (đã nằm trong Page Header bên trên)
tableHeaderInst.setProperties({ "mainFunctionButton": false });

// ── 11. Table (xem Section 7a để lắp columns) ────────────────────────────────
const table = figma.createAutoLayout("HORIZONTAL");
table.name = "Table";
table.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
table.itemSpacing = 0; table.clipsContent = true;
table.counterAxisAlignItems = "STRETCH";
panel.appendChild(table);
table.layoutSizingHorizontal = "FILL";
table.layoutSizingVertical = "FILL";
// → Lắp columns theo Section 7a

// ── 12. Paging ────────────────────────────────────────────────────────────────
const pagingInst = pagingSet.defaultVariant.createInstance();
panel.appendChild(pagingInst);
pagingInst.layoutSizingHorizontal = "FILL";
pagingInst.layoutSizingVertical = "FIXED";
```

---

### Variant 2 — List Page Tab (Sidebar mở, có horizontal tab) ✅ Đã xác nhận từ Figma node 23316:42382

```
Global Header (Type=Default, Search Type=Icon)  ← search trong header, không có trong main
Body Row
├── Side Bar (Expand=True, 200px)
└── Main Content (FILL × FILL, VERTICAL, gap=0)
    ├── Horizontal Tab Bar (FILL × 52, BG/White, border-bottom)  ← tabs điều hướng
    │   └── Tabs component (FILL)
    └── Content Wrapper (FILL × FILL, VERTICAL, padding T=0 L=16 R=16 B=16, fills=[])
        └── Table Panel (FILL × FILL, BG/White, radius=8, clipsContent=true, gap=0)
            ├── Table Header Wrapper (FILL × 56, padding L=16 R=16)
            │   └── Table Header component  ⚠️ mainFunctionButton=TRUE (có tab ở trên)
            ├── Table (FILL × FILL, HORIZONTAL, counterAxisAlignItems=STRETCH)
            │   └── Columns: Checkbox + Text cols + Action
            └── Paging (FILL × 48, MDS component)
```

**Điểm khác biệt so với Variant 1:**
- KHÔNG có Page Header riêng — tab đóng vai trò điều hướng thay thế
- Tab Bar nằm trực tiếp trong Main Content (không nằm trong Content Wrapper)
- `mainFunctionButton=TRUE` trên Table Header — vì không có Page Header để đặt nút Thêm
- Content Wrapper + Table Panel giống hệt Variant 1 (chỉ thiếu Page Header phía trên)

**Key spacing — Variant 2:**
| Vị trí | Giá trị |
|--------|---------|
| Horizontal Tab Bar height | **52px** |
| Tab Bar padding left/right | **16px** |
| Tab Bar border-bottom | `1px solid var(--stroke/neutral-light)` |
| Tab align | `counterAxisAlignItems = "FLEX_END"` (tab nằm sát đáy bar) |
| Content Wrapper padding | **T=16**, L=16, R=16, B=16 — T=16 tránh Table Panel dính sát Tab Bar |
| Table Panel: radius | **8px**, clipsContent=true, gap=0 |
| Table Header `mainFunctionButton` | **true** |

> ⚠️ **Variant 2 padding top=16** (khác Variant 1): Variant 1 dùng T=0 vì Page Header đã tạo khoảng cách. Variant 2 không có Page Header nên Content Wrapper phải có T=16 để Table Panel không dính vào Tab Bar.

**Code — Variant 2 đầy đủ:**
```js
// ── 1-5. Frame + Header + Body + Sidebar + Main Content: giống Variant 1 ────────

// ── 6. Horizontal Tab Bar ─────────────────────────────────────────────────────
const tabBar = figma.createAutoLayout("HORIZONTAL");
tabBar.name = "Tab Bar";
tabBar.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
tabBar.paddingLeft = 16; tabBar.paddingRight = 16;
tabBar.paddingTop = 0; tabBar.paddingBottom = 0;
tabBar.counterAxisAlignItems = "FLEX_END"; // tabs sát đáy bar
tabBar.itemSpacing = 0;
tabBar.strokes = [{ type: "SOLID", color: { r: 0.914, g: 0.918, b: 0.925 } }];
tabBar.strokeAlign = "INSIDE"; tabBar.strokeBottomWeight = 1;
main.appendChild(tabBar);
tabBar.layoutSizingHorizontal = "FILL";
tabBar.resize(tabBar.width, 52);
tabBar.layoutSizingVertical = "FIXED";

const tabsSet = await figma.importComponentSetByKeyAsync("6197172af0ad2d54d977700de957bec352c3fa01");
const tabsInst = (tabsSet.children.find(c => c.name === "Underline=True, Fix Width=No") || tabsSet.defaultVariant).createInstance();
tabBar.appendChild(tabsInst);
tabsInst.layoutSizingHorizontal = "FILL";

// ── 7. Content Wrapper (padding T=16 L/R/B=16 — T=16 tránh Table Panel dính Tab Bar) ──
const content = figma.createFrame();
content.name = "Content Wrapper";
content.layoutMode = "VERTICAL";
content.paddingTop = 16; content.paddingBottom = 16; // ← T=16 (khác Variant 1 dùng T=0)
content.paddingLeft = 16; content.paddingRight = 16;
content.itemSpacing = 0; content.fills = []; content.clipsContent = false;
main.appendChild(content);
content.layoutSizingHorizontal = "FILL";
content.layoutSizingVertical = "FILL";

// ── 8. Table Panel (BG/White, radius=8, clipsContent, gap=0) ─────────────────
const panel = figma.createFrame();
panel.name = "Table Panel";
panel.layoutMode = "VERTICAL";
panel.paddingTop = panel.paddingBottom = panel.paddingLeft = panel.paddingRight = 0;
panel.itemSpacing = 0; // ⚠️ gap=0 — 3 vùng sát nhau
panel.clipsContent = true;
panel.cornerRadius = 8; // = Radius/Defaullt
panel.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
content.appendChild(panel);
panel.layoutSizingHorizontal = "FILL";
panel.layoutSizingVertical = "FILL";

// ── 9. Table Header Wrapper (padding L/R=16) ──────────────────────────────────
const thWrapper = figma.createFrame();
thWrapper.name = "Table Header Wrapper";
thWrapper.layoutMode = "HORIZONTAL";
thWrapper.paddingLeft = 16; thWrapper.paddingRight = 16;
thWrapper.paddingTop = 0; thWrapper.paddingBottom = 0;
thWrapper.itemSpacing = 0; thWrapper.fills = []; thWrapper.clipsContent = false;
panel.appendChild(thWrapper);
thWrapper.layoutSizingHorizontal = "FILL";
thWrapper.layoutSizingVertical = "FIXED";
thWrapper.resize(thWrapper.width, 56);

const tableHeaderSet = await figma.importComponentSetByKeyAsync("830bb2ee9b439d094eb371c5d2366548406b6563");
const tableHeaderInst = (tableHeaderSet.children.find(c => !c.name.includes("bulkAction=true")) || tableHeaderSet.defaultVariant).createInstance();
thWrapper.appendChild(tableHeaderInst);
tableHeaderInst.layoutSizingHorizontal = "FILL";
tableHeaderInst.layoutSizingVertical = "FIXED";
// ⚠️ CÓ tab → HIỆN mainFunctionButton (nhóm nút Nhập khẩu + Thêm + ...)
tableHeaderInst.setProperties({ "mainFunctionButton": true });

// ── 10. Table (giống Variant 1) ───────────────────────────────────────────────
const table = figma.createAutoLayout("HORIZONTAL");
table.name = "Table";
table.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
table.itemSpacing = 0; table.clipsContent = true;
table.counterAxisAlignItems = "STRETCH";
panel.appendChild(table);
table.layoutSizingHorizontal = "FILL";
table.layoutSizingVertical = "FILL";
// → Lắp columns theo Section 7a

// ── 11. Paging ────────────────────────────────────────────────────────────────
const pagingSet = await figma.importComponentSetByKeyAsync("cfbbd171c7fce04129e7a47025fb815f6e4c1c54");
const pagingInst = pagingSet.defaultVariant.createInstance();
panel.appendChild(pagingInst);
pagingInst.layoutSizingHorizontal = "FILL";
pagingInst.layoutSizingVertical = "FIXED";
```

---

### Variant 3 — Master Detail Right (Drawer từ phải)

Node mẫu: `22612:20426`

```
Global Header (Type=Default, Search Type=Icon)
Body Row
├── Side Bar (Expand=True, 200px)
└── Main (1166px × 720px, HORIZONTAL)       ← Main là HORIZONTAL thay vì VERTICAL
    ├── List Area (FILL × FILL, VERTICAL)   ← thu hẹp lại khi drawer mở
    │   ├── Page Header Bar  (FILL × 52)
    │   ├── Toolbar Bar      (FILL × 52)    ← ít filter hơn (chỉ 2 dropdown)
    │   ├── Table            (FILL × FILL)
    │   └── Pagination Bar   (FILL × 44)   ← chỉ "Tổng số: N", không có nav
    └── Drawer Panel (~570px × FILL)        ← tự build
        ├── Drawer Header (FILL × 48): Title + [×] close
        ├── Divider (FILL × 1)
        └── Drawer Content (FILL × FILL): padding 20
```

```js
// Main là HORIZONTAL thay vì VERTICAL
const main = figma.createAutoLayout("HORIZONTAL");
main.name = "Main";
main.fills = [{ type: "SOLID", color: { r: 0.953, g: 0.957, b: 0.965 } }];
main.itemSpacing = 0; main.paddingTop = 0; main.paddingBottom = 0;
main.paddingLeft = 0; main.paddingRight = 0;
body.appendChild(main);
main.layoutSizingHorizontal = "FILL";
main.layoutSizingVertical = "FILL";

// Drawer panel
const drawer = figma.createAutoLayout("VERTICAL");
drawer.name = "Drawer Panel";
drawer.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
drawer.strokes = [{ type: "SOLID", color: { r: 0.914, g: 0.918, b: 0.925 } }];
drawer.strokeAlign = "INSIDE"; drawer.strokeLeftWeight = 1;
drawer.itemSpacing = 0; drawer.paddingTop = 0; drawer.paddingBottom = 0;
drawer.paddingLeft = 0; drawer.paddingRight = 0;
drawer.resize(570, 720);
main.appendChild(drawer);
drawer.layoutSizingHorizontal = "FIXED";
drawer.layoutSizingVertical = "FILL";
```

---

### Variant 4 — Master Detail Left (List card + Detail)

Node mẫu: `6494:14560`

```
Global Header (Type=Default, Search Type=Box)
Body Row
├── Side Bar (Expand=True, 200px)
└── Main (1166px × 720px, HORIZONTAL)
    ├── List Panel (~320px × FILL, VERTICAL)   ← danh sách dạng card rows
    │   ├── Page Header Bar (FILL × 52)
    │   └── Card List       (FILL × FILL)      ← rows card dạng tự build
    └── Detail Panel (FILL × FILL, VERTICAL)   ← nội dung chi tiết
        ├── Detail Header (FILL × 52): Title + [×]
        ├── Divider (FILL × 1)
        └── Detail Content (FILL × FILL): padding 20
```

---

### Variant 5 — Master Detail Bottom (Table + Detail phía dưới)

Node mẫu: `6438:69304`

```
Global Header (Type=Default, Search Type=Icon)
Body Row
├── Side Bar (Expand=True, 200px)
└── Main (1166px × 720px, VERTICAL)
    ├── Top Section (FILL × ~380px, VERTICAL)   ← table phía trên
    │   ├── Page Header Bar (FILL × 52)
    │   ├── Toolbar Bar     (FILL × 52)
    │   └── Table           (FILL × FILL)
    ├── Collapse Handle     (FILL × 20)         ← nút thu/mở, dấu mũi tên ▼
    ├── Pagination Bar      (FILL × 44)
    ├── Tab Bar ngang       (FILL × 48)         ← tabs của detail section
    └── Detail Content      (FILL × FILL)
```

**Collapse Handle:**

> ⛔ NGHIÊM CẤM tự vẽ thanh collapse — PHẢI dùng component MDS Web v2.0 (xem Rule 6 trong SKILL.md)

```js
// Dùng "Collapse Expand Pannel" component từ MDS Web v2.0
const collapseSet = await figma.importComponentSetByKeyAsync("9470284e2509fcd122ca6bec03009b8a041c561d");
const collapseHandle = collapseSet.children.find(c =>
  c.name === "Type=Collapse, Position=Top, Bg Color=Gray"
).createInstance();
main.appendChild(collapseHandle);
collapseHandle.layoutSizingHorizontal = "FILL";
```

---

## 3. Layout Màn hình Thêm/Sửa (Form Page)

Ba biến thể dựa trên số lượng trường và ngữ cảnh sử dụng. Node mẫu nằm trong section `6647:64424`.

---

### Variant 1 — Thêm/Sửa giữ lại Sidebar (Form full page)

Node mẫu: `20187:55118`

Dùng khi form có nhiều trường, cần không gian rộng. Sidebar thu gọn để nhường chỗ.

```
Frame 1366×768 (VERTICAL)
├── Global Header (Type=Default, Search Type=Icon)
└── Body Row (HORIZONTAL)
    ├── Side Bar (Expand=False, 64px)
    └── Main (1302×720, VERTICAL)
        ├── Form Page Header (FILL × 52)     ← ← back | Title | "Bố cục: Mẫu tiêu chuẩn ▼" | ✎
        ├── Form Content     (FILL × FILL)   ← scroll, bg gray, padding 16 24, gap 16
        │   └── Form Section Card × N        ← white, radius 8, padding 20 24, gap 16
        │       ├── Section Title (Semi Bold 16px)
        │       └── Fields Grid (2-col, gap-col 24, gap-row 16)
        │           └── Field Item (VERTICAL, gap 6): Label + Input
        └── Action Bar       (FILL × 52)     ← bg white, border-top, paddingH 16
            └── Right: [Hủy] [Lưu và thêm] [Lưu - primary]
```

```js
// Form Page Header
const formHeader = figma.createAutoLayout("HORIZONTAL");
formHeader.name = "Form Page Header";
formHeader.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
formHeader.paddingLeft = 16; formHeader.paddingRight = 16;
formHeader.paddingTop = 12; formHeader.paddingBottom = 12;
formHeader.primaryAxisAlignItems = "MIN";
formHeader.counterAxisAlignItems = "CENTER";
formHeader.itemSpacing = 8;
formHeader.strokes = [{ type: "SOLID", color: { r: 0.914, g: 0.918, b: 0.925 } }];
formHeader.strokeAlign = "INSIDE"; formHeader.strokeBottomWeight = 1;
main.appendChild(formHeader);
formHeader.layoutSizingHorizontal = "FILL";
formHeader.resize(1302, 52);
formHeader.layoutSizingVertical = "FIXED";

// Form Content (scrollable area)
const formContent = figma.createAutoLayout("VERTICAL");
formContent.name = "Form Content";
formContent.fills = [{ type: "SOLID", color: { r: 0.953, g: 0.957, b: 0.965 } }];
formContent.paddingTop = 16; formContent.paddingBottom = 16;
formContent.paddingLeft = 24; formContent.paddingRight = 24;
formContent.itemSpacing = 16;
formContent.primaryAxisAlignItems = "MIN";
formContent.counterAxisAlignItems = "MIN";
main.appendChild(formContent);
formContent.layoutSizingHorizontal = "FILL";
formContent.layoutSizingVertical = "FILL";

// Form Section Card
function createFormSection(parent, title) {
  const section = figma.createAutoLayout("VERTICAL");
  section.name = `Section - ${title}`;
  section.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  section.cornerRadius = 8;
  section.paddingTop = 20; section.paddingBottom = 20;
  section.paddingLeft = 24; section.paddingRight = 24;
  section.itemSpacing = 16;
  parent.appendChild(section);
  section.layoutSizingHorizontal = "FILL";
  section.layoutSizingVertical = "HUG";
  return section;
}

// Action Bar
const actionBar = figma.createAutoLayout("HORIZONTAL");
actionBar.name = "Action Bar";
actionBar.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
actionBar.paddingLeft = 16; actionBar.paddingRight = 16;
actionBar.paddingTop = 10; actionBar.paddingBottom = 10;
actionBar.primaryAxisAlignItems = "MAX"; // right-aligned
actionBar.counterAxisAlignItems = "CENTER";
actionBar.itemSpacing = 8;
actionBar.strokes = [{ type: "SOLID", color: { r: 0.914, g: 0.918, b: 0.925 } }];
actionBar.strokeAlign = "INSIDE"; actionBar.strokeTopWeight = 1;
main.appendChild(actionBar);
actionBar.layoutSizingHorizontal = "FILL";
actionBar.resize(1302, 52);
actionBar.layoutSizingVertical = "FIXED";
```

---

### Variant 2 — Thêm/Sửa dạng Popup nhỏ

Node mẫu: `20191:60856`

Dùng cho danh mục đơn giản, ít trường (≤ 8 fields). Mở trên nền màn hình danh sách.

```
[List screen bên dưới - dimmed overlay]
Modal Popup (~520px × auto, centered)
├── Modal Header (FILL × 52): Title + [×] close
├── Modal Body   (FILL × auto): padding 20 24
│   └── Fields 1-col (Label trên, Input dưới, gap 16 giữa các field)
└── Modal Footer (FILL × 52): border-top
    └── Right: [Hủy] [Lưu - primary]
```

```js
// Overlay
const overlay = figma.createRectangle();
overlay.name = "Overlay";
overlay.resize(1366, 768);
overlay.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.4 }];
frame.appendChild(overlay);

// Modal container
const modal = figma.createAutoLayout("VERTICAL");
modal.name = "Modal";
modal.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
modal.cornerRadius = 12;
modal.resize(520, 400); // width cố định, height theo nội dung
modal.itemSpacing = 0;
modal.x = (1366 - 520) / 2;
modal.y = (768 - modal.height) / 2;
modal.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.15 }, offset: { x: 0, y: 8 }, radius: 24, spread: 0, visible: true, blendMode: "NORMAL" }];
frame.appendChild(modal);

// Modal Header
const modalHeader = figma.createAutoLayout("HORIZONTAL");
modalHeader.name = "Modal Header";
modalHeader.fills = [];
modalHeader.paddingLeft = 24; modalHeader.paddingRight = 16;
modalHeader.paddingTop = 14; modalHeader.paddingBottom = 14;
modalHeader.primaryAxisAlignItems = "SPACE_BETWEEN";
modalHeader.counterAxisAlignItems = "CENTER";
modalHeader.strokes = [{ type: "SOLID", color: { r: 0.914, g: 0.918, b: 0.925 } }];
modalHeader.strokeAlign = "INSIDE"; modalHeader.strokeBottomWeight = 1;
modal.appendChild(modalHeader);
modalHeader.layoutSizingHorizontal = "FILL";
modalHeader.resize(520, 52);
modalHeader.layoutSizingVertical = "FIXED";

// Modal Body
const modalBody = figma.createAutoLayout("VERTICAL");
modalBody.name = "Modal Body";
modalBody.fills = [];
modalBody.paddingTop = 20; modalBody.paddingBottom = 20;
modalBody.paddingLeft = 24; modalBody.paddingRight = 24;
modalBody.itemSpacing = 16;
modal.appendChild(modalBody);
modalBody.layoutSizingHorizontal = "FILL";
modalBody.layoutSizingVertical = "HUG";

// Modal Footer
const modalFooter = figma.createAutoLayout("HORIZONTAL");
modalFooter.name = "Modal Footer";
modalFooter.fills = [];
modalFooter.paddingLeft = 16; modalFooter.paddingRight = 16;
modalFooter.paddingTop = 10; modalFooter.paddingBottom = 10;
modalFooter.primaryAxisAlignItems = "MAX";
modalFooter.counterAxisAlignItems = "CENTER";
modalFooter.itemSpacing = 8;
modalFooter.strokes = [{ type: "SOLID", color: { r: 0.914, g: 0.918, b: 0.925 } }];
modalFooter.strokeAlign = "INSIDE"; modalFooter.strokeTopWeight = 1;
modal.appendChild(modalFooter);
modalFooter.layoutSizingHorizontal = "FILL";
modalFooter.resize(520, 52);
modalFooter.layoutSizingVertical = "FIXED";
```

---

### Popup chứa danh sách (Chọn nhân viên…) — bảng giãn hết chiều cao, phân trang ghim đáy
Áp dụng cho popup / vùng có chiều cao cố định chứa danh sách (Chọn nhân viên, Chọn hàng hóa, Danh sách đã chọn, tab chi tiết có bảng…):
- **Khung bảng lấp đầy chiều cao còn lại** của popup (sau tiêu đề, thanh tìm kiếm / lọc), kéo tới sát footer nút Hủy / Đồng ý.
- **Thanh phân trang (Tổng số · Số dòng/trang · chuyển trang) luôn ghim ở ĐÁY khung bảng**, ngay trên footer — vị trí cố định dù có 1 dòng hay 100 dòng.
- **Ít dòng** → phần trống nằm TRONG khung bảng (giữa dòng cuối và thanh phân trang, nền trắng). **Nhiều dòng** → vùng dòng tự cuộn bên trong, tiêu đề cột và phân trang đứng yên.
- **Không có dữ liệu** → màn trống (Empty state) ở giữa khung bảng, khung vẫn giữ nguyên chiều cao.
- Chiều cao popup **cố định theo cỡ popup**, không co giãn theo số dòng → lọc / chuyển trang / bỏ chọn popup không nhảy kích thước.
- ⛔ **Không vẽ** khung bảng co theo số dòng làm thanh phân trang “nổi” lơ lửng giữa popup, bên dưới là khoảng trắng lớn tới footer (popup trông cụt, trống, mắt phải dò tìm phân trang ở vị trí khác nhau mỗi lần).
- Thi công (mds-ui): thân popup `display: flex; flex-direction: column`, khung bảng `.table-panel.table-panel--fill` (giãn hết phần còn lại; `.table-scroll` cuộn trong, phân trang ở đáy).

### Variant 3 — Thêm/Sửa dạng Popup full màn hình

Node mẫu: `20191:62842`

Dùng cho form rất nhiều trường, cần toàn bộ không gian màn hình. Không có sidebar, không có Global Header.

```
Frame 1366×768 (overlay toàn màn hình, VERTICAL)
├── Full Modal Header (FILL × 52): Title + [⚙] [✎ Sửa] [—] [×]
├── Full Modal Content (FILL × FILL, VERTICAL, bg white)
│   └── padding 24, fields 2-col (flat layout, không có section card)
└── Full Modal Footer (FILL × 52): border-top
    └── Right: [Hủy] [Lưu - primary]
```

**Điểm khác với Variant 1:**
- Không có Global Header, không có Sidebar
- Fields layout phẳng (không bọc trong section card riêng)
- Header có thêm nút ⚙ settings, — minimize, × close (giống window native)

```js
const fullModal = figma.createAutoLayout("VERTICAL");
fullModal.name = "Full Screen Modal";
fullModal.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
fullModal.resize(1366, 768);
fullModal.itemSpacing = 0;
fullModal.clipsContent = true;
frame.appendChild(fullModal); // frame nền không có bg, chỉ là container

// Full Modal Header
const fullHeader = figma.createAutoLayout("HORIZONTAL");
fullHeader.name = "Modal Header";
fullHeader.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
fullHeader.paddingLeft = 24; fullHeader.paddingRight = 16;
fullHeader.paddingTop = 12; fullHeader.paddingBottom = 12;
fullHeader.primaryAxisAlignItems = "SPACE_BETWEEN";
fullHeader.counterAxisAlignItems = "CENTER";
fullHeader.strokes = [{ type: "SOLID", color: { r: 0.914, g: 0.918, b: 0.925 } }];
fullHeader.strokeAlign = "INSIDE"; fullHeader.strokeBottomWeight = 1;
fullModal.appendChild(fullHeader);
fullHeader.layoutSizingHorizontal = "FILL";
fullHeader.resize(1366, 52);
fullHeader.layoutSizingVertical = "FIXED";
```

---

## 4. Layout Màn hình Chi tiết (Detail Page)

Bốn biến thể xem chi tiết một bản ghi. Node mẫu trong section `6708:69367`.

**Điểm chung:** Fields hiển thị dạng read-only (chỉ text + underline divider, không có input border). Page Header luôn có nút "✎ Sửa" để chuyển sang edit mode.

---

### Variant 1 — Chi tiết Full trang (có Tab)

Node mẫu: `6708:74532`

```
Frame 1366×768
├── Global Header (Type=Default, Search Type=Icon)
└── Body Row
    ├── Side Bar (Expand=True, 200px)
    └── Main (1166×720, VERTICAL)
        ├── Detail Page Header (FILL × 52)
        │   ← [back] Title                    [✎ Sửa - primary] [...]
        ├── Horizontal Tab Bar (FILL × 48)    ← tabs phân khu nội dung
        └── Detail Content (FILL × FILL, VERTICAL, scrollable, bg gray)
            └── Detail Section Card × N (white, radius 8, padding 24)
                ├── Section Title (Semi Bold 16px)
                └── Fields Grid (2-col, gap-col 24, gap-row 16)
                    └── Field: Label (gray 12px) / Value (text 14px) + underline divider
```

```js
// Detail Page Header
const detailHeader = figma.createAutoLayout("HORIZONTAL");
detailHeader.name = "Detail Page Header";
detailHeader.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
detailHeader.paddingLeft = 16; detailHeader.paddingRight = 16;
detailHeader.paddingTop = 12; detailHeader.paddingBottom = 12;
detailHeader.primaryAxisAlignItems = "SPACE_BETWEEN";
detailHeader.counterAxisAlignItems = "CENTER";
detailHeader.strokes = [{ type: "SOLID", color: { r: 0.914, g: 0.918, b: 0.925 } }];
detailHeader.strokeAlign = "INSIDE"; detailHeader.strokeBottomWeight = 1;
main.appendChild(detailHeader);
detailHeader.layoutSizingHorizontal = "FILL";
detailHeader.resize(1166, 52);
detailHeader.layoutSizingVertical = "FIXED";
```

---

### Variant 2 — Chi tiết Full trang (không có Tab)

Node mẫu: `20191:63630`

```
Frame 1366×768
├── Global Header (Type=Default, Search Type=Icon)
└── Body Row
    ├── Side Bar (Expand=True, 200px)
    └── Main (1166×720, VERTICAL)
        ├── Detail Page Header (FILL × 52): ← Title + [✎ Sửa] [...]
        └── Detail Content (FILL × FILL, VERTICAL, scrollable, bg gray)
            └── Detail Section Card × N (white, radius 8, padding 24)
```

Giống Variant 1 nhưng **không có Tab Bar** — dùng khi nội dung chi tiết đơn giản, không cần phân tab.

---

### Variant 3 — Chi tiết dạng Popup nhỏ

Node mẫu: `20191:66487`

Xem nhanh thông tin chi tiết từ màn hình danh sách. Header popup có thêm "✎ Sửa" để mở rộng sang edit.

```
[List Tab screen bên dưới - dimmed overlay]
Detail Popup (~520px × auto, centered)
├── Popup Header (FILL × 52): Title + [⚙] [✎ Sửa] [...] [×]
├── Popup Body   (FILL × auto): padding 20 24
│   └── Fields 1-col (Label gray 12px / Value text 14px + underline)
└── (không có footer action bar — dùng [×] để đóng)
```

---

### Variant 4 — Chi tiết dạng Popup full màn hình

Node mẫu: `20192:36326`

```
Full screen modal overlay (1366×768)
├── Full Modal Header (FILL × 52): Title + [⚙] [✎ Sửa] [...] [×]
└── Full Modal Content (FILL × FILL, VERTICAL, bg white)
    └── padding 24, fields 2-col read-only (flat, không section card)
```

Giống Form Variant 3 về cấu trúc nhưng **không có Action Bar** ở dưới — người dùng đóng bằng [×] hoặc chuyển sang sửa bằng "✎ Sửa".

---

## 5. Content Area (tự build)

```js
const content = figma.createAutoLayout("VERTICAL");
content.name = "Content Area";
content.fills = []; // transparent, inherit from main
content.paddingTop = 24; content.paddingBottom = 24;
content.paddingLeft = 24; content.paddingRight = 24;
content.itemSpacing = 20;
content.primaryAxisAlignItems = "MIN";
content.counterAxisAlignItems = "MIN";

main.appendChild(content);
content.layoutSizingHorizontal = "FILL";
content.layoutSizingVertical = "FILL";
```

---

## 6. Card / Panel (tự build)

```js
const card = figma.createAutoLayout("VERTICAL");
card.name = "Card";
card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
card.cornerRadius = 12;
card.paddingTop = 20; card.paddingBottom = 20;
card.paddingLeft = 20; card.paddingRight = 20;
card.itemSpacing = 16;
```

---

## 7. Table — dùng Column Component từ MDS

Bảng = **frame HORIZONTAL** chứa các cột component ghép cạnh nhau. Mỗi cột đã bao gồm sẵn header + cells + footer row.

**Quy tắc lắp cột:**
- Cột chính (Text): `layoutSizingHorizontal = "FILL"` → tự mở rộng lấp đầy không gian còn lại
- Cột phụ (Checkbox, Action...): `layoutSizingHorizontal = "FIXED"` → giữ nguyên width mặc định
- Tất cả cột: `layoutSizingVertical = "FILL"` → đồng nhất chiều cao theo cột cao nhất
- Table container: `counterAxisAlignItems = "STRETCH"` → đảm bảo cột kéo dài đều nhau
- `layoutSizingHorizontal/Vertical` phải set **SAU** `appendChild`

### 7a. Bảng chỉ xem (ReadOnly) — componentKey: `abc2a8c33f322af3b6fdc19fb53d29744eef10a4`

**Các Type variant có sẵn:**

| Type | Width mặc định | Sizing | Dùng cho |
|------|---------------|--------|----------|
| Text | 160px | thường dùng FILL | Cột text chính |
| Checkbox | 48px | FIXED | Cột chọn nhiều |
| Radio Button | 48px | FIXED | Cột chọn một |
| Toggle Switch | 60px | FIXED | Cột bật/tắt |
| Action Icon | 96px | FIXED | Nút icon thao tác |
| Action Text | 100px | FIXED | Nút text thao tác |
| Progress Bar | 160px | FIXED hoặc FILL | Thanh tiến trình |
| Icon | 78px | FIXED | Cột icon trạng thái |
| Swap Component | 160px | FIXED hoặc FILL | Swap component |

**Props cần chú ý:**
- `cell1` → `cell10` — bật/tắt từng dòng (bool), kiểm soát số dòng hiển thị
- `footer` — hiện/ẩn footer row tổng (bool)
- `divider` — hiện đường ngăn phải của cột (bool, tắt ở cột cuối)

**Cách lắp bảng đầy đủ:**
```js
const readOnlySet = await figma.importComponentSetByKeyAsync("abc2a8c33f322af3b6fdc19fb53d29744eef10a4");
function findCol(type) {
  return readOnlySet.children.find(c => c.name === `Type=${type}`) || readOnlySet.defaultVariant;
}

// 1. Table container — HORIZONTAL, FILL × FILL, clip content
const table = figma.createAutoLayout("HORIZONTAL");
table.name = "Table";
table.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
table.itemSpacing = 0;
table.paddingTop = 0; table.paddingBottom = 0;
table.paddingLeft = 0; table.paddingRight = 0;
table.clipsContent = true;
table.counterAxisAlignItems = "STRETCH"; // các cột cùng chiều cao
main.appendChild(table);
table.layoutSizingHorizontal = "FILL"; // SAU appendChild
table.layoutSizingVertical = "FILL";

// 2. Cột Checkbox — FIXED 48px
const checkboxInst = findCol("Checkbox").createInstance();
table.appendChild(checkboxInst);
checkboxInst.layoutSizingHorizontal = "FIXED";
checkboxInst.layoutSizingVertical = "FILL";
checkboxInst.setProperties({ "divider": true });

// 3. Cột Text chính — FILL (lấp đầy chiều ngang còn lại)
const textCol1 = findCol("Text").createInstance();
table.appendChild(textCol1);
textCol1.layoutSizingHorizontal = "FILL"; // ← KEY
textCol1.layoutSizingVertical = "FILL";
textCol1.setProperties({ "divider": true });

// 4. Cột Text phụ — FIXED width tùy chỉnh
const textCol2 = findCol("Text").createInstance();
table.appendChild(textCol2);
textCol2.resize(160, textCol2.height); // đặt width TRƯỚC khi set FIXED
textCol2.layoutSizingHorizontal = "FIXED";
textCol2.layoutSizingVertical = "FILL";
textCol2.setProperties({ "divider": true });

// 5. Cột Action Icon — FIXED, cột cuối không cần divider
const actionInst = findCol("Action Icon").createInstance();
table.appendChild(actionInst);
actionInst.layoutSizingHorizontal = "FIXED";
actionInst.layoutSizingVertical = "FILL";
// setProperties({ "divider": false }) — mặc định đã false

// 6. Đồng bộ số dòng cho tất cả cột (ví dụ: chỉ hiện 5 dòng)
const allCols = [checkboxInst, textCol1, textCol2, actionInst];
for (const col of allCols) {
  col.setProperties({
    cell6: false, cell7: false, cell8: false, cell9: false, cell10: false
  });
}
```

---

### 7b. Bảng có thể sửa trực tiếp (Editable) — componentKey: `f70c5944056bb83807e22421fb018bf2a8ea03ac`

Dùng khi cell cho phép nhập/sửa trực tiếp tại chỗ. Lắp theo cùng pattern với ReadOnly.

```js
const editableSet = await figma.importComponentSetByKeyAsync("f70c5944056bb83807e22421fb018bf2a8ea03ac");
function findEditCol(type) {
  return editableSet.children.find(c => c.name === `Type=${type}`) || editableSet.defaultVariant;
}

const editTable = figma.createAutoLayout("HORIZONTAL");
editTable.name = "Editable Table";
editTable.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
editTable.itemSpacing = 0;
editTable.clipsContent = true;
editTable.counterAxisAlignItems = "STRETCH";
main.appendChild(editTable);
editTable.layoutSizingHorizontal = "FILL";
editTable.layoutSizingVertical = "FILL";

// Cột Checkbox cố định
const editCheckbox = findEditCol("Checkbox").createInstance();
editTable.appendChild(editCheckbox);
editCheckbox.layoutSizingHorizontal = "FIXED";
editCheckbox.layoutSizingVertical = "FILL";
editCheckbox.setProperties({ "divider": true });

// Cột Text chính — FILL
const editText = findEditCol("Text").createInstance();
editTable.appendChild(editText);
editText.layoutSizingHorizontal = "FILL";
editText.layoutSizingVertical = "FILL";
editText.setProperties({ "divider": true });

// Cột Action cuối
const editAction = findEditCol("Action Icon").createInstance();
editTable.appendChild(editAction);
editAction.layoutSizingHorizontal = "FIXED";
editAction.layoutSizingVertical = "FILL";
```

---

### 7c. Table Header — componentKey: `830bb2ee9b439d094eb371c5d2366548406b6563`

Thanh toolbar phía trên bảng. Dùng thay cho "Toolbar Bar" tự build trong các screen patterns.

**Hai trạng thái chính:**

| Trạng thái | Prop | Hiển thị |
|-----------|------|---------|
| Bình thường | `bulkAction=false` | Search + filter dropdowns + icon buttons bên phải |
| Có dòng được chọn | `bulkAction=true` | "Đã chọn N" + Bỏ chọn + action buttons |

**Props toggle (bool):**
- `search` — hiện/ẩn search box (240px)
- `fieldFilter1` / `fieldFilter2` / `fieldFilter3` — hiện/ẩn từng filter dropdown "Trường: Giá trị ▼"
- `actionBar` — hiện nhóm icon bên phải: [↺ reload] [↑ export] [⚙ settings] [▼ filter]
- `mainFunctionButton` — hiện nhóm nút chính: [Nhập khẩu] [+ Thêm] [...]
- `tagFilter` — hiện row tag filters đã áp dụng bên dưới toolbar
- `title` — hiện tiêu đề phần (Inter Semi Bold 16px) bên trên toolbar

> ⚠️ **QUY TẮC `mainFunctionButton`:**
> - **Màn hình CÓ Tabs Horizontal phía trên** (Variant 2) → `mainFunctionButton: true` — vì không có Page Header để đặt nút Thêm
> - **Màn hình KHÔNG có tab** (Variant 1) → `mainFunctionButton: false` — nút Thêm đã nằm trong Page Header bên trên Table Panel

**Khi `bulkAction=true` — bulk action type:**
- `"Selected"` — đã chọn 1 dòng, hiện action buttons
- `"Selected All Page"` — đã chọn cả trang (10 dòng), hiện thêm "Chọn tất cả 200 trên bảng"
- `"Selected All Table"` — đã chọn tất cả 200 bản ghi trên bảng

```js
const tableHeaderSet = await figma.importComponentSetByKeyAsync("830bb2ee9b439d094eb371c5d2366548406b6563");

// Toolbar bình thường
const normalVariant = tableHeaderSet.children.find(c =>
  !c.name.includes("bulkAction=true")
) || tableHeaderSet.defaultVariant;
const tableHeaderInst = normalVariant.createInstance();
main.appendChild(tableHeaderInst);
tableHeaderInst.layoutSizingHorizontal = "FILL";
tableHeaderInst.layoutSizingVertical = "HUG";

// Khi có dòng được chọn → dùng variant bulkAction=true
const bulkVariant = tableHeaderSet.children.find(c =>
  c.name.includes("bulkAction=true")
) || tableHeaderSet.defaultVariant;
```

---

### 7d. Paging — componentKey: `cfbbd171c7fce04129e7a47025fb815f6e4c1c54`

Thanh phân trang dưới bảng. **Height: 48px**, bg white.

```
Left:  "Tổng số: 10" [thêm sum2–sum7 nếu cần hiển thị nhiều loại tổng]
Right: "Số dòng/trang" [10 ▼]  "1 - 10"  [|< < > >|]
```

**Props:**
- `sum1`–`sum7` (bool) — bật thêm các trường tổng (tổng tiền, số dư...), mặc định chỉ `sum1=true`
- `sumVertical` (bool) — hiển thị sum xếp dọc thay vì ngang
- `iconLeft` (bool) — hiện icon bên trái trước sum

```js
const pagingSet = await figma.importComponentSetByKeyAsync("cfbbd171c7fce04129e7a47025fb815f6e4c1c54");
const pagingInst = (pagingSet.defaultVariant).createInstance();
main.appendChild(pagingInst);
pagingInst.layoutSizingHorizontal = "FILL";
pagingInst.layoutSizingVertical = "FIXED";
```

---

### 7e. Body Filter / Advance Expand — componentKey: `7cc201e6817c354985f8f7530ab8881d5bd4c392`

Bộ lọc nâng cao, hiển thị khi click icon **▼ filter** trên Table Header. Overlay bên phải bảng, không thuộc auto-layout.

**Variants:**

| State | Mô tả |
|-------|-------|
| `State=Default` | Chưa có điều kiện lọc nào |
| `State=Filtered` | Đang có điều kiện lọc active |
| `State=Saved` | Bộ lọc đã được lưu tên |

**Kích thước:** 240 × 650px cố định.

```js
const advFilterSet = await figma.importComponentSetByKeyAsync("7cc201e6817c354985f8f7530ab8881d5bd4c392");
const filterInst = (advFilterSet.children.find(c => c.name === "State=Default")
  || advFilterSet.defaultVariant).createInstance();

// Overlay absolute — append vào frame chính, KHÔNG vào main auto-layout
filterInst.resize(240, 650);
filterInst.x = 1366 - 240;  // cạnh phải màn hình
filterInst.y = 48;           // dưới Global Header
frame.appendChild(filterInst);
// KHÔNG set layoutSizingHorizontal/Vertical — đây là absolute overlay
```

**Khi Advanced Filter mở, layout bảng:**
```
Frame 1366×768
├── Global Header (FILL × 48)
└── Body Row (FILL × 720, HORIZONTAL)
    ├── Side Bar (64px hoặc 200px)
    └── Main (FILL × FILL, VERTICAL)        ← bảng vẫn giữ FILL width
         ├── Table Header 7c (FILL × HUG)
         ├── Table 7a/7b    (FILL × FILL)
         └── Paging 7d      (FILL × 48)
[Advanced Filter 240×650] ← absolute overlay, x = 1126, y = 48
```

---

## 8. Filter Bar (tự build + components)

```
Filter Bar (bg white, radius 12, padding 16, HORIZONTAL, gap 12)
├── Search Input (tự build, w240, h36)
├── Divider dọc (tự build, w1, h24, bg border)
├── Chip/Filter group (dùng Chip component)
└── Sort/Filter button (dùng Button Small Outline)
```

---

## 9. Form Section (tự build + TextField component)

```
Form Container (bg white, radius 12, padding 32, VERTICAL, gap 24)
├── Form Header (HORIZONTAL, SPACE_BETWEEN)
│   ├── Title (Inter Semi Bold 18)
│   └── Status Badge/Chip
├── Field Group × N (VERTICAL, gap 16)
│   ├── Group Title (Inter Semi Bold 14, color brand, border-bottom)
│   └── Fields Grid (2-col hoặc 3-col, gap 16)
│       └── Field Item (VERTICAL, gap 6)
│           ├── Label (Inter Medium 13, text primary)
│           └── [TextField / Dropdown component]
└── Form Actions (HORIZONTAL, gap 8, flex-end, padding-top 24, border-top)
    ├── Cancel (Button Medium, Color=Gray, Style=Outline)
    └── Save (Button Medium, Color=Brand, Style=Solid)
```

---

## 10. Stats Row (4 cards — tự build)

```js
const statsRow = figma.createAutoLayout("HORIZONTAL");
statsRow.itemSpacing = 16;
statsRow.fills = [];

// 4 stat cards
const labels = ["Doanh thu", "Đơn hàng", "Khách hàng", "Hoàn thành"];
for (const label of labels) {
  const card = figma.createAutoLayout("VERTICAL");
  card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  card.cornerRadius = 12;
  card.paddingTop = 20; card.paddingBottom = 20;
  card.paddingLeft = 20; card.paddingRight = 20;
  card.itemSpacing = 8;
  statsRow.appendChild(card);
  card.layoutSizingHorizontal = "FILL"; // Equal width
}
```

