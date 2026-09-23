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

### TableHeader
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
Item format: `{ id, icon, label }` hoặc `{ separator: true }`

### AppCheckbox
```vue
<!-- body row: @click.stop đặt trên div bọc ngoài, KHÔNG đặt trên <AppCheckbox> -->
<div class="dt-cell" style="width:44px" @click.stop>
  <AppCheckbox v-model="selected" :value="rowIndex" />
</div>

<!-- header: dùng selectAll computed (xem Section 5 — Table state) -->
<AppCheckbox v-model="selectAll" />
```

### TIcon
```vue
<TIcon name="icon-name" />
```

> ⛔ **RULE BẮT BUỘC — ICON PHẢI CÓ TRONG MAP của TIcon.vue**
>
> `TIcon` KHÔNG tự resolve bất kỳ tên icon nào — chỉ render được các tên đã có trong `MAP` tại `mds-ui/src/components/TIcon.vue`.
> - Trước khi dùng `<TIcon name="xyz" />`, **tra bảng bên dưới** xem `xyz` có trong MAP chưa.
> - Nếu chưa có → **thêm vào TIcon.vue trước** (import từ `@tabler/icons-vue` + thêm vào MAP).
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

> Nếu cần icon chưa có trong bảng → kiểm tra tên trong `@tabler/icons-vue` → thêm vào TIcon.vue → mới dùng.

### IconMisaAI
```vue
<IconMisaAI /> <!-- dùng trong btn--ai -->
```

---

### Form Input Components — BẮT BUỘC dùng thay vì raw `ibox`

> **NGHIÊM CẤM** tự thi công raw `div.ibox + input.ibox__native + button.ibox__icon--action`.  
> Luôn dùng các component bên dưới — chúng đã xử lý đúng TIcon, states, và keyboard behavior.

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
```vue
<AppCombobox v-model="form.type" :options="['Loại A', 'Loại B']" />
<AppCombobox v-model="form.type" :options="[{ value: 'a', label: 'Loại A' }, { value: 'b', label: 'Loại B' }]" />
<AppCombobox v-model="form.tags" :options="opts" :multiple="true" />
<AppCombobox v-model="form.type" :state="'disabled'" />
```
Props:
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `modelValue` (v-model) | String \| Array | `''` | Giá trị đã chọn |
| `options` | Array | `[]` | `string[]` hoặc `{ value, label, disabled? }[]` |
| `placeholder` | String | `''` | Placeholder khi chưa chọn |
| `multiple` | Boolean | `false` | Chọn nhiều (hiện tags) |
| `state` | String | `'default'` | `default` \| `error` \| `success` \| `warning` \| `disabled` |
| `icon-left` | String | `''` | TIcon name bên trái |
| `size` | String | `'md'` | `md` \| `sm` |
| `disabled` | Boolean | `false` | |
| `ghost` | Boolean | `false` | Không border, nền nhạt |
| `outline` | Boolean | `true` | |

> **Tự render chevron-down** — KHÔNG thêm icon ngoài.

#### AppDatebox — Date/Time picker
```vue
<AppDatebox v-model="form.date" />
<AppDatebox v-model="form.time" type="time" />
<AppDatebox v-model="form.dt" type="datetime-local" />
```
Props:
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `modelValue` (v-model) | String | `''` | Giá trị (ISO string) |
| `type` | String | `'date'` | `date` \| `time` \| `datetime-local` |
| `state` | String | `'default'` | |
| `size` | String | `'md'` | |
| `disabled` / `readonly` | Boolean | `false` | |

> **Tự render calendar/clock icon** — KHÔNG thêm icon ngoài.

#### AppNumberbox — Number input with stepper
```vue
<AppNumberbox v-model="form.qty" :min="0" :max="999" />
<AppNumberbox v-model="form.qty" :stepper="false" />
```
Props:
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `modelValue` (v-model) | Number \| String | `''` | Giá trị |
| `min` / `max` | Number | `null` | Giới hạn |
| `step` | Number | `1` | Bước nhảy |
| `stepper` | Boolean | `true` | Hiện nút +/- bên phải |
| `state` | String | `'default'` | |
| `size` | String | `'md'` | |
| `disabled` / `readonly` | Boolean | `false` | |

> Right-aligned, tabular nums — KHÔNG thêm stepper ngoài.

#### AppTextarea — Multiline text
```vue
<AppTextarea v-model="form.note" placeholder="Ghi chú..." :min-height="80" />
```
Props:
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `modelValue` (v-model) | String | `''` | |
| `placeholder` | String | `''` | |
| `min-height` | Number | `80` | px |
| `max-height` | Number | `0` | px (0 = không giới hạn) |
| `resize` | Boolean | `true` | Cho phép resize dọc |
| `maxlength` | Number | `0` | 0 = không giới hạn |
| `state` | String | `'default'` | |

#### AppSearchbox — Search input
```vue
<AppSearchbox v-model="q" placeholder="Tìm kiếm..." @search="onSearch" />
<AppSearchbox v-model="q" variant="header" />
```
Props: `modelValue`, `placeholder`, `clearable` (default true), `state`, `size`, `variant` (`''` | `'header'`)  
Emits: `update:modelValue`, `search`, `clear`

#### AppInput — Form field wrapper (label + input + validation message)
```vue
<AppInput label="Tên nhân viên" :vertical="true">
  <AppTextbox v-model="form.name" />
</AppInput>

<AppInput label="Email" message="Email không hợp lệ" message-type="error">
  <AppTextbox v-model="form.email" :state="'error'" />
</AppInput>
```
Props:
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `label` | String | `''` | Label text (trống → không render label) |
| `required` | Boolean | `false` | Hiện dấu `*` |
| `vertical` | Boolean | `true` | `true` = label trên input / `false` = label-bên-trái (inline) |
| `caption` | String | `''` | Text phụ nhỏ dưới input |
| `message` | String | `''` | Validation message |
| `message-type` | String | `'error'` | `error` \| `success` \| `warning` \| `info` |

> `AppInput` là wrapper — đặt `AppTextbox`/`AppCombobox`/... vào `<slot>` bên trong.

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
| `divider` | Boolean | `true` | Border-bottom dưới header |
| `closable` | Boolean | `true` | Hiện nút X đóng |

Slots: `default` (body), `toolbar` (ngoài body, trước body), `title` (custom title), `header-end` (custom header-right), `footer`

CSS tham chiếu (AppFormPanel dùng class `form-panel`, `form-header`, `form-body`, `form-footer` — định nghĩa trong mds-ui/src/style.css):
```css
/* Trong style.css của mds-ui */
.form-panel   { display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden; background:var(--bg-white); }
.form-header  { display:flex; align-items:center; justify-content:space-between; height:48px; padding:0 16px; flex-shrink:0; background:var(--bg-white); }
.form-header--divider { border-bottom:1px solid var(--stroke-neutral-light); }
.form-header__title { font-size:var(--text-h3); font-weight:var(--fw-semibold); color:var(--text-primary); }
.form-body    { flex:1; min-height:0; overflow-y:auto; padding:16px 24px 24px; display:flex; flex-direction:column; gap:16px; }
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

CSS `field__label` — PHẢI định nghĩa trong `<style scoped>` của từng component (không global):
```css
.field__label {
  display: block;
  font-size: var(--text-body);
  font-weight: var(--fw-medium);
  color: var(--text-primary);   /* ⛔ NGHIÊM CẤM dùng --text-secondary cho label */
  line-height: var(--text-body-lh);
  margin-bottom: 4px;
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
| `btn-icon btn-icon--outline` | Icon button medium | |
| `btn-icon btn-icon--sm` | Icon button nhỏ | Nav, paging, row actions |
| `btn-icon btn-icon--danger` | Icon button nguy hiểm | Xóa |

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
| `show-footer` | Boolean | `false` | Hiện footer row |
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
| `status` | Type=Status | 36px | left | `<AppTag :dot="true">` — Tag Dot Small: h24, radius 8px, dot 6px — **KHÔNG phải pill** |
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
- Không border — `border: none` trên `.dt-avatar`

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
> | Compact | 32px | **56px (CỐ ĐỊNH)** | **72px (CỐ ĐỊNH)** |
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

### AppTag (component — dùng standalone ngoài DataTable)

Tag/chip component theo Figma — height 24px, border-radius 8px, border.

```vue
<!-- Không có dot (tag thông thường) -->
<AppTag label="Thử việc" color="warning" />
<AppTag label="HĐLĐ có thời hạn" color="brand" />

<!-- Có dot (status tag — Tag Dot Small theo Figma) -->
<AppTag label="Hoạt động" color="success" :dot="true" />
<AppTag label="Đã nghỉ" color="danger" :dot="true" />
```

Props:
| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `label` | String | required | Text hiển thị |
| `color` | String | `'neutral'` | `brand` \| `success` \| `warning` \| `danger` \| `neutral` |
| `dot` | Boolean | `false` | Hiện dấu chấm 6px bên trái (cho dạng status) |

CSS specs (từ Figma Tag Dot Small):
- Height: `24px` · Border-radius: `8px` (`--radius-default`) · Padding: `0 8px`
- Font: `12px` weight `500` (medium)
- Border: `1px solid` màu theo variant

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
.kpi-card__value { font-size: 24px; font-weight: 700; line-height: 28px; font-feature-settings: 'lnum' 1, 'tnum' 1; }

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
.detail-panel__tabs .sub-nav-tab { height: 36px; }
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
.detail-panel__tabs .sub-nav-tab { height: 36px; }
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
│  2+ control trong cùng row/group     │  8px    │  --btn-group-gap (8px) │
│  Input + button kèm (search box…)    │  8px    │  --btn-group-gap │
│  Các row trong cùng form section     │  16px   │  --input-row-gap │
│  Giữa 2 section / 2 column           │  24px+  │  --form-col-gap  │
└─────────────────────────────────────────────────────────┘
```

```css
/* ✅ ĐÚNG — 2 button cạnh nhau trong cùng row */
.toolbar { display: flex; align-items: center; gap: 8px; }

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

/* Compact */
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
