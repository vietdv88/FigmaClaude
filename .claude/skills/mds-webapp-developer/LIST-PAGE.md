# Pattern: Màn hình Danh sách (List Page)

> ⛔ **Thi công bằng component, không dựng tay theo sơ đồ dưới đây:** `<AppPage>` (hàng tiêu đề, tab phân hệ, lề 16, thanh hàng loạt) + `.table-panel` (TableHeader · DataTable · TablePaging) + `<AppMasterDetail>` / `<AppDrawer>` — props & mẫu ở `references/vue-controls.md` › AppPage, mẫu chạy thật 10 dạng: `mds-docs/src/demos/LayoutListDemo.vue`. File này chỉ để hiểu số đo / ý đồ.
> Load file này mỗi khi có yêu cầu vẽ màn hình danh sách.  
> Nguồn: Figma MDS Web Components v2.0 — node `6435:22415` (no tab) & `11133:41542` (with tab)

---

## Tổng quan 2 dạng layout

```
┌─────────────────────────────────────────────────────────┐
│              DẠNG 1 — Không có Tab                      │
├──────────────────────────────────────────────────────────┤
│  Global Header                           h = 48px       │
├──────┬───────────────────────────────────────────────────┤
│      │  Page Header: [Title]   [toggle][Import][+Add][…]│ h = 56px, bg=white
│  S   ├───────────────────────────────────────────────────┤
│  i   │  Toolbar: [search 240][filter][filter][filter]   │ h = 56px (bên trong Table)
│  d   │                              [⟳][⚙][▿] right    │
│  e   ├───────────────────────────────────────────────────┤
│  b   │  Column Headers                                   │ h = 36px
│  a   ├───────────────────────────────────────────────────┤
│  r   │  Data rows (56px/row)                             │
│  64  │  ...                                              │
│  px  ├───────────────────────────────────────────────────┤
│      │  Paging: Tổng số: N    [10/trang] [1-10] [<][>]  │ h = 48px
└──────┴───────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              DẠNG 2 — Có Tab ngang                      │
├──────────────────────────────────────────────────────────┤
│  Global Header (search nằm trong header)   h = 48px     │
├──────┬───────────────────────────────────────────────────┤
│      │  Tab bar: [Tab•][Tab][Tab][Tab]                   │ h = 52px (16px top + 36px tab)
│  S   ├───────────────────────────────────────────────────┤  ← 16px gap
│  i   │  Toolbar: [search][filter][filter][filter]        │ h = 56px (bên trong Table)
│  d   │           [⟳][📋][⚙][▿] [Import] [+Add] [...]   │  ← action buttons ở đây
│  e   ├───────────────────────────────────────────────────┤
│  b   │  Column Headers                                   │ h = 36px
│  a   ├───────────────────────────────────────────────────┤
│  r   │  Data rows (56px/row)                             │
│  20  │  ...                                              │
│  0px ├───────────────────────────────────────────────────┤
│      │  Footer row (optional)                            │ h = 36px
│      ├───────────────────────────────────────────────────┤
│      │  Paging: Tổng số: N    [10/trang] [1-10] [<][>]  │ h = 48px
└──────┴───────────────────────────────────────────────────┘
```

---

## Kích thước chính xác từ Figma

| Zone | Dạng 1 (No Tab) | Dạng 2 (With Tab) |
|------|-----------------|-------------------|
| Global Header | h=48px | h=48px |
| Sidebar | w=64px (collapsed) | w=200px (expanded) |
| Page Header | h=56px, có title + actions | **Không có** |
| Tab bar | **Không có** | h=52px (16px top + 36px tabs) |
| Gap dưới tab | — | 16px |
| Table inner side padding | 16px trái + phải | 16px trái + phải |
| Table inner top padding | 16px | 16px |
| Toolbar (Table Header) | h=56px | h=56px |
| Column Headers | h=36px | h=36px |
| Data row (2-line) | h=56px | h=56px |
| Paging | h=48px | h=48px |

---

## Quy tắc quan trọng

1. **Action buttons vị trí:**
   - Dạng 1: nằm trong **Page Header** (góc phải)
   - Dạng 2: nằm trong **Toolbar** (góc phải, cạnh search+filter)

2. **Sidebar:**
   - Dạng 1 mặc định collapsed (w=64px) — chỉ icon
   - Dạng 2 mặc định expanded (w=200px) — có "Thêm nhanh" button trên cùng

3. **Table side padding = 16px** — wrap toàn bộ table trong container có `padding: 0 16px`

4. **Table top padding = 16px** — khoảng cách từ top content xuống Table

5. **Paging luôn ở dưới cùng** — h=48px, chứa "Tổng số: N" và điều hướng trang

6. **Page Header & Tab bar bg = white**, có `border-bottom: 1px solid var(--stroke-neutral-light)`

7. **Data Table area** = `flex: 1; overflow: hidden` — chiếm toàn bộ phần còn lại

---

## HTML Skeleton — Dạng 1: Không có Tab

```html
<div class="app-shell">
  <!-- Global Header -->
  <header class="global-header">
    <div class="header-left">
      <img class="app-logo" src="logo.svg" alt="Logo" />
      <span class="app-name h3">App Name</span>
      <span class="header-company text-secondary text-sm">Công ty cổ phần ABC <i class="ti ti-chevron-down"></i></span>
    </div>
    <div class="header-right">
      <div class="search-box" style="width:240px">
        <i class="ti ti-search"></i>
        <input type="text" placeholder="Tìm kiếm..." />
      </div>
      <button class="btn-icon"><i class="ti ti-settings"></i></button>
      <div class="avatar">VT</div>
    </div>
  </header>

  <div class="body-row">
    <!-- Sidebar collapsed -->
    <aside class="sidebar sidebar--collapsed">
      <nav class="sidebar-nav">
        <a class="sidebar-item sidebar-item--active" href="#" title="Danh sách">
          <i class="ti ti-layout-list"></i>
        </a>
        <!-- thêm items -->
      </nav>
      <button class="btn-collapse" onclick="toggleSidebar()">
        <i class="ti ti-chevron-right"></i>
      </button>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header__left">
          <h1 class="page-header__title h2">Danh sách Khách hàng</h1>
        </div>
        <div class="page-header__right">
          <div class="segmented-view">
            <button class="seg-btn seg-btn--active"><i class="ti ti-layout-list"></i></button>
            <button class="seg-btn"><i class="ti ti-layout-grid"></i></button>
          </div>
          <button class="btn btn--outline btn--sm">
            <i class="ti ti-file-import"></i> Nhập từ Excel
          </button>
          <button class="btn btn--primary btn--sm">
            <i class="ti ti-plus"></i> Thêm
          </button>
          <button class="btn-icon btn-icon--outline"><i class="ti ti-dots"></i></button>
        </div>
      </div>

      <!-- Data Table Area -->
      <div class="list-content">
        <div class="table-wrap">
          <!-- Toolbar -->
          <div class="table-toolbar">
            <div class="table-toolbar__left">
              <div class="input-wrapper" style="width:240px">
                <i class="input-prefix-icon ti ti-search"></i>
                <input class="input input--has-prefix" type="text" placeholder="Tìm kiếm..." />
              </div>
              <select class="input input--select" style="width:160px"><option>Trường: Giá trị</option></select>
              <select class="input input--select" style="width:160px"><option>Trường: Giá trị</option></select>
              <select class="input input--select" style="width:160px"><option>Trường: Giá trị</option></select>
            </div>
            <div class="table-toolbar__right">
              <button class="btn-icon btn-icon--outline"><i class="ti ti-refresh"></i></button>
              <button class="btn-icon btn-icon--outline"><i class="ti ti-settings"></i></button>
              <button class="btn-icon btn-icon--outline"><i class="ti ti-filter"></i></button>
            </div>
          </div>

          <!-- Table -->
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="col-check"><input type="checkbox" /></th>
                  <th>Họ và tên</th>
                  <th>Điện thoại</th>
                  <!-- thêm cột -->
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="col-check"><input type="radio" /></td>
                  <td>Nguyễn Văn An</td>
                  <td>0987 123 456</td>
                </tr>
                <!-- thêm rows -->
              </tbody>
            </table>
          </div>

          <!-- Paging -->
          <div class="table-paging">
            <span class="text-secondary text-sm">Tổng số: <strong>10</strong></span>
            <div class="paging-right">
              <span class="text-secondary text-sm">Số dòng/trang</span>
              <select class="input input--select" style="width:72px"><option>10</option></select>
              <span class="text-secondary text-sm">1 - 10</span>
              <button class="btn-icon btn-icon--sm"><i class="ti ti-chevrons-left"></i></button>
              <button class="btn-icon btn-icon--sm"><i class="ti ti-chevron-left"></i></button>
              <button class="btn-icon btn-icon--sm"><i class="ti ti-chevron-right"></i></button>
              <button class="btn-icon btn-icon--sm"><i class="ti ti-chevrons-right"></i></button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
```

---

## HTML Skeleton — Dạng 2: Có Tab ngang

```html
<div class="app-shell">
  <!-- Global Header — search nằm trong header -->
  <header class="global-header">
    <div class="header-left">
      <img class="app-logo" src="logo.svg" alt="Logo" />
      <span class="app-name h3">App Name</span>
    </div>
    <div class="header-center" style="flex:1; max-width:320px">
      <div class="search-box" style="width:100%">
        <i class="ti ti-search"></i>
        <input type="text" placeholder="Tìm kiếm..." />
      </div>
    </div>
    <div class="header-right">
      <button class="btn-icon"><i class="ti ti-settings"></i></button>
      <div class="avatar">VT</div>
    </div>
  </header>

  <div class="body-row">
    <!-- Sidebar expanded -->
    <aside class="sidebar sidebar--expanded">
      <div class="sidebar-logo">
        <button class="btn btn--primary btn--sm" style="width:168px">
          <i class="ti ti-plus"></i> Thêm nhanh
        </button>
      </div>
      <nav class="sidebar-nav">
        <a class="sidebar-item sidebar-item--active" href="#">
          <i class="ti ti-layout-list"></i>
          <span>Danh sách</span>
        </a>
        <!-- thêm items -->
      </nav>
      <button class="btn-collapse" onclick="toggleSidebar()">
        <i class="ti ti-chevron-left"></i>
      </button>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <!-- Tab bar -->
      <div class="list-tabs">
        <div class="tabs-horizontal">
          <button class="tab-item tab-item--active">Tab 1</button>
          <button class="tab-item">Tab 2</button>
          <button class="tab-item">Tab 3</button>
          <button class="tab-item">Tab 4</button>
        </div>
      </div>

      <!-- Data Table Area (bắt đầu sau 16px gap) -->
      <div class="list-content">
        <div class="table-wrap">
          <!-- Toolbar — action buttons nằm ở đây -->
          <div class="table-toolbar">
            <div class="table-toolbar__left">
              <div class="input-wrapper" style="width:240px">
                <i class="input-prefix-icon ti ti-search"></i>
                <input class="input input--has-prefix" type="text" placeholder="Tìm kiếm..." />
              </div>
              <select class="input input--select" style="width:160px"><option>Trường: Giá trị</option></select>
              <select class="input input--select" style="width:160px"><option>Trường: Giá trị</option></select>
              <select class="input input--select" style="width:160px"><option>Trường: Giá trị</option></select>
            </div>
            <div class="table-toolbar__right">
              <button class="btn-icon btn-icon--outline"><i class="ti ti-refresh"></i></button>
              <button class="btn-icon btn-icon--outline"><i class="ti ti-file-export"></i></button>
              <button class="btn-icon btn-icon--outline"><i class="ti ti-settings"></i></button>
              <button class="btn-icon btn-icon--outline"><i class="ti ti-filter"></i></button>
              <div class="divider-v"></div>
              <button class="btn btn--outline btn--sm">
                <i class="ti ti-file-import"></i> Nhập khẩu
              </button>
              <button class="btn btn--primary btn--sm">
                <i class="ti ti-plus"></i> Thêm
              </button>
              <button class="btn-icon btn-icon--outline"><i class="ti ti-dots"></i></button>
            </div>
          </div>

          <!-- Table -->
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="col-check"><input type="checkbox" /></th>
                  <th>Header</th>
                  <th>Header</th>
                  <!-- thêm cột -->
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="col-check"><input type="checkbox" /></td>
                  <td>Text</td>
                  <td>Text</td>
                </tr>
                <!-- thêm rows -->
              </tbody>
            </table>
          </div>

          <!-- Paging -->
          <div class="table-paging">
            <span class="text-secondary text-sm">Tổng số: <strong>10</strong></span>
            <div class="paging-right">
              <span class="text-secondary text-sm">Số dòng/trang</span>
              <select class="input input--select" style="width:72px"><option>10</option></select>
              <span class="text-secondary text-sm">1 - 10</span>
              <button class="btn-icon btn-icon--sm"><i class="ti ti-chevrons-left"></i></button>
              <button class="btn-icon btn-icon--sm"><i class="ti ti-chevron-left"></i></button>
              <button class="btn-icon btn-icon--sm"><i class="ti ti-chevron-right"></i></button>
              <button class="btn-icon btn-icon--sm"><i class="ti ti-chevrons-right"></i></button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
```

---

## CSS — List Page specific

```css
/* ── List Tabs (Dạng 2) ── */
.list-tabs {
  height: 52px;          /* 16px top spacing + 36px tab */
  display: flex;
  align-items: flex-end;
  background: var(--bg-white);
  border-bottom: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0;
  padding: 0 16px;
}
.tabs-horizontal {
  display: flex;
  gap: 0;
}
.tab-item {
  height: 36px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
}
.tab-item:hover     { color: var(--text-primary); }
.tab-item--active   { color: var(--text-brand); border-bottom-color: var(--bg-brand); font-weight: 600; }

/* ── List Content area ── */
.list-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 16px 16px 0;   /* 16px top, 16px sides, no bottom */
  gap: 0;
}

/* ── Table Wrap ── */
.table-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-white);
  border-radius: var(--radius-default);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  min-height: 0;
}

/* ── Toolbar ── */
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 12px;
  gap: 8px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--stroke-neutral-light);
}
.table-toolbar__left  { display: flex; align-items: center; gap: 8px; }
.table-toolbar__right { display: flex; align-items: center; gap: 8px; }

/* ── Table Container ── */
.table-container {
  flex: 1;
  overflow: auto;
  min-height: 0;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table thead tr {
  height: 36px;
  background: var(--bg-white);
  border-bottom: 1px solid var(--stroke-neutral-light);
  position: sticky;
  top: 0;
  z-index: 1;
}
.data-table th {
  text-align: left;
  padding: 0 var(--table-cell-px);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
}
.data-table tbody tr {
  height: 56px;
  border-bottom: 1px solid var(--stroke-neutral-light);
  cursor: pointer;
}
.data-table tbody tr:hover   { background: var(--bg-neutral-hover); }
.data-table tbody tr.selected { background: var(--bg-brand-light); }
.data-table td {
  padding: 0 var(--table-cell-px);
  font-size: 13px;
  color: var(--text-primary);
}
.col-check { width: 40px; padding: 0 8px; }

/* ── Paging ── */
.table-paging {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 var(--table-paging-px);
  border-top: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0;
}
.paging-right { display: flex; align-items: center; gap: 8px; }

/* ── Page Header (Dạng 1 only) ── */
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  background: var(--bg-white);
  border-bottom: 1px solid var(--stroke-neutral-light);
  flex-shrink: 0;
}
.page-header__left  { display: flex; align-items: center; gap: 8px; }
.page-header__right { display: flex; align-items: center; gap: 8px; }
.page-header__title { font-size: 20px; font-weight: 600; color: var(--text-primary); }

/* Segmented view toggle */
.segmented-view {
  display: flex;
  background: var(--bg-neutral-light);
  border-radius: var(--radius-inner);
  padding: 2px;
  gap: 2px;
}
.seg-btn {
  width: 28px; height: 28px;
  border: none; border-radius: 6px;
  background: transparent; cursor: pointer;
  color: var(--icon-neutral);
  display: flex; align-items: center; justify-content: center;
}
.seg-btn--active { background: var(--bg-white); box-shadow: var(--shadow-sm); color: var(--text-brand); }
```

---

## Checklist khi vẽ màn danh sách

```
□ Đúng dạng layout? (có Tab → Dạng 2, không có Tab → Dạng 1)
□ Dạng 1: Action buttons trong Page Header (h=56px)?
□ Dạng 2: Action buttons trong Toolbar (cạnh filter)?
□ Dạng 1: Sidebar collapsed w=64px?
□ Dạng 2: Sidebar expanded w=200px + "Thêm nhanh" button?
□ Tab bar h=52px (16px top + 36px tab), border-bottom?
□ Toolbar h=56px, padding 0 12px?
□ Column header h=36px?
□ Data row h=56px?
□ Paging h=48px?
□ list-content có padding: 16px 16px 0?
□ table-wrap dùng box-shadow: var(--shadow-card), không dùng border?
□ Tổng số hiển thị ở paging (góc trái)?
```
