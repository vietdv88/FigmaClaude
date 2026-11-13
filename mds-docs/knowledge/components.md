<!-- source: Props control trong mds-ui/src/components -->
# Control trong mds-ui — props, sự kiện, slot (lấy thẳng từ code)

Import: `import X from '@mds/components/X.vue'`.

## AppAccordion

Accordion (Figma MDS Web Components v2.0 › Accordion 6019:928): Style Outline = True (mục tách rời, viền + bo 8, cách 12) · False (liền khối, kẻ ngang)

```js
defineProps({
  /** [{ key, title, content?, disabled? }] — nội dung dài / có control: slot #item-{key} (hoặc slot mặc định nhận { item }) */
  items:      { type: Array,   default: () => [] },
  /** Các mục đang mở (v-model) — mảng key */
  modelValue: { type: Array,   default: () => [] },
  /** Figma “Style Outline”: true = mục tách rời có viền + bo góc · false = liền khối, chỉ kẻ ngang */
  outline:    { type: Boolean, default: true },
  /** false = mở 1 mục thì đóng các mục khác */
  multiple:   { type: Boolean, default: true },
})
```
Sự kiện: `['update:modelValue', 'toggle']`

Slot: `title`, `default`

## AppAiSearchbox

Ô tìm kiếm AI — Figma MDS “AI Searchbox” (17455:70653), Style Outline:

```js
defineProps({
  modelValue:   { type: String,  default: '' },
  placeholder:  { type: String,  default: 'Tìm kiếm thông minh' },
  disabled:     { type: Boolean, default: false },
  width:        { type: [Number, String], default: null },
  /** Tooltip của icon phân tích (đã gõ) */
  analyzeLabel: { type: String,  default: 'Xem điều kiện AI bóc tách' },
  /** Có giá trị → huy hiệu “AI” thành nút (VD “Chuyển về tìm kiếm thường”) → emit('badge-click') */
  badgeTip:     { type: String,  default: '' },
  /** Điều kiện AI bóc tách từ câu tìm kiếm: [{ label: 'Họ và tên', value: 'Trần Văn Bình' }, …] */
  parsed:       { type: Array,   default: () => [] },
  /** Đang bóc tách (sau emit 'analyze') */
  analyzing:    { type: Boolean, default: false },
  /** Kết quả theo nhóm: [{ key, title: 'Hồ sơ', total, items: [{ id, name, subtitle, meta, avatar }] }] — null = chưa tìm */
  results:      { type: Array,   default: null },
  loading:      { type: Boolean, default: false },
  /** Bề rộng popup kết quả (tối thiểu bằng ô) */
  panelWidth:   { type: Number,  default: 640 },
  /** Enter có mở popup “Kết quả tìm kiếm với AI” (kết quả theo nhóm) không. false = kết quả hiện ở CHÍNH màn hình (VD lọc bảng — TableHeader dùng false): Enter chỉ emit('submit') */
  resultsPanel: { type: Boolean, default: true },
  /** Popup “Xem thêm” của 1 nhóm: toàn bộ kết quả của nhóm đó [{ id, name, subtitle, meta, avatar }] (null = đang nạp) — app nạp khi nhận @more(group, câu hỏi) */
  moreItems:    { type: Array,   default: null },
  moreTotal:    { type: Number,  default: null },
  moreLoading:  { type: Boolean, default: false },
})
```
Sự kiện: `['update:modelValue', 'submit', 'analyze', 'clear', 'select', 'more', 'badge-click']`


## AppAlertDialog

Alert Dialog — Figma MDS “Alert Dialog” (6019:180746): hỏi xác nhận / thông báo ngắn.

```js
defineProps({
  title:          { type: String,  default: '' },
  /** Nội dung ngắn — nêu KẾT QUẢ sau khi xác nhận, không hỏi lại “Bạn có chắc…?” (có thể dùng slot mặc định) */
  message:        { type: String,  default: '' },
  /** default (nút chính Brand) | danger (nút chính đỏ — xóa, hủy bỏ không khôi phục) */
  type:           { type: String,  default: 'default' },
  confirmLabel:   { type: String,  default: 'Đồng ý' },
  cancelLabel:    { type: String,  default: 'Hủy' },
  /** Nút phụ thứ 3 (đứng giữa Hủy và nút chính) — VD “Lưu thành bộ lọc mới” */
  secondaryLabel: { type: String,  default: '' },
  linkLabel:      { type: String,  default: '' },
  hideCancel:     { type: Boolean, default: false },
  hideClose:      { type: Boolean, default: false },
  loading:        { type: Boolean, default: false },
  /** Bấm ra ngoài không đóng */
  persistent:     { type: Boolean, default: false },
  /** Vẽ tại chỗ, không overlay (khung ví dụ trong tài liệu) */
  inline:         { type: Boolean, default: false },
})
```
Sự kiện: `['confirm', 'cancel', 'secondary', 'link']`

Slot: `default`, `actions`

## AppAvatar

Avatar — Figma MDS “Avatar” (6019:6258) + “_Avatar Type Item” (6019:6149)

```js
defineProps({
  name:        { type: String,  default: '' },
  src:         { type: String,  default: '' },
  size:        { type: Number,  default: 32 },     // 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 80 (Figma)
  color:       { type: String,  default: 'brand' }, // avatar chữ cái: brand (nền Brand Light Hover — theo theme) | neutral (nền Neutral Light) | auto (màu cố định theo tên — danh sách người)
  interactive: { type: Boolean, default: false },  // bấm được (mở hồ sơ, chọn người…) → hover vòng 2px Brand Light (ảnh không co)
  active:      { type: Boolean, default: false },  // đang chọn → giữ viền như hover
  dot:         { type: Boolean, default: false },  // chấm đỏ góc trên — có thông báo mới
  count:       { type: Number,  default: 0 },      // số đỏ góc trên (thay cho dot)
  online:      { type: Boolean, default: false },  // chấm xanh góc dưới
  badgeIcon:   { type: String,  default: '' },     // icon nhỏ góc dưới (VD 'camera' đổi ảnh, 'check' đã duyệt)
})
```

## AppAvatarCropper

Cắt ảnh đại diện: chọn ảnh (bấm / kéo thả / dán Ctrl+V) → kéo để căn mặt, kéo thanh trượt / lăn chuột để phóng to.

```js
defineProps({
  size:     { type: Number, default: 240 },    // khung cắt (px)
  output:   { type: Number, default: 256 },    // ảnh xuất ra (px, vuông)
  maxKb:    { type: Number, default: 500 },    // ảnh xuất ra tối đa (KB) — tự giảm chất lượng cho vừa
  maxInputMb: { type: Number, default: 10 },   // ảnh chọn vào tối đa (MB) — chỉ để đọc trên máy, không gửi đi
})
```
Sự kiện: `['change']`


## AppButton

```js
defineProps({
  label:    { type: String,  default: '' },
  variant:  { type: String,  default: 'filled' }, // filled | outline | ghost | text (Figma Style=Text — nút dạng link)
  color:    { type: String,  default: 'primary' }, // primary | neutral | success | warning | danger | black | white
  size:     { type: String,  default: 'md' },      // sm | md | lg
  iconLeft: { type: String,  default: '' },
  iconRight:{ type: String,  default: '' },
  disabled: { type: Boolean, default: false },
  loading:  { type: Boolean, default: false },
  block:    { type: Boolean, default: false },
})
```
Slot: `default`

## AppCheckbox

Checkmark

```js
defineProps({
  modelValue:    { default: false },      // Boolean | null | Array
  value:         { default: undefined },  // used when modelValue is Array
  label:         { type: String,  default: '' },
  disabled:      { type: Boolean, default: false },
  indeterminate: { type: Boolean, default: false },
  /** Trạng thái lỗi trực tiếp — dùng khi không wrap trong AppInput; ưu tiên field error context từ AppInput */
  error:         { type: Boolean, default: false },
})
```
Sự kiện: `['update:modelValue']`

Slot: `default`

## AppCombobox

Danh sách tự vẽ (KHÔNG dùng <select> mặc định). Ô là input: gõ ngay để lọc danh sách (không có ô tìm riêng trong popup)

```js
defineProps({
  modelValue:  { type: [String, Array], default: () => '' },
  options:     { type: Array,   default: () => [] }, // string[] | { value, label, disabled?, description? }[]
  placeholder: { type: String,  default: '' },
  multiple:    { type: Boolean, default: false },
  state:       { type: String,  default: 'default' },
  outline:     { type: Boolean, default: true },
  iconLeft:    { type: String,  default: '' },
  iconRight:   { type: String,  default: '' },
  size:        { type: String,  default: 'md' },
  disabled:    { type: Boolean, default: false },
  ghost:       { type: Boolean, default: false },
  clearable:   { type: Boolean, default: undefined },  // true: nút × bỏ chọn (MẶC ĐỊNH KHÔNG — quy chuẩn: chỉ ô tìm kiếm có ×) · false: tắt hẳn bỏ chọn (kể cả mục “Chưa chọn”) — dùng cho ô luôn phải có giá trị
  /** Mục “để trống” đầu danh sách (chọn 1) — VD 'Chưa giao' / 'Để trống': cách bỏ chọn thay cho nút × (quy chuẩn không có ×).
      Ô lọc có placeholder “…: Tất cả” tự có mục “Tất cả”, không cần truyền */
  emptyOption: { type: String, default: '' },
  /** Trường bắt buộc → không có nút × (đổi bằng cách chọn giá trị khác). Nằm trong <AppInput required> thì tự nhận, không cần truyền */
  required:    { type: Boolean, default: false },
  collapsible: { type: Boolean, default: false },
  creatable:   { type: Boolean, default: false },  // chọn nhiều: cho tự nhập giá trị ngoài danh sách (gõ → “Thêm …” / Enter) — giá trị = chữ đã gõ
  createLabel: { type: String,  default: 'Thêm' },
  /** Dạng bảng: [{ key, label, width? (px) }] — danh sách có hàng tiêu đề cột, mỗi dòng hiện option[key]; tìm theo mọi cột */
  columns:     { type: Array,   default: () => [] },
  /** Dạng Split: icon ở ô phải ngăn bằng vạch (VD 'dots' = quản lý danh sách giá trị, 'search' = tìm nâng cao) → emit('split') */
  splitIcon:   { type: String,  default: '' },
  splitTip:    { type: String,  default: '' },
  tagAvatar:   { type: Boolean, default: false },  // chọn nhiều: tag hiện avatar / logo của option (option.avatar)
  avatarSquare:{ type: Boolean, default: false },
  recentKey:   { type: String,  default: '' },     // nhớ giá trị chọn gần đây (localStorage) → hiện nhóm “Gần đây” trên đầu danh sách (khi chưa gõ tìm)
  recentMax:   { type: Number,  default: 5 },
  /** Đang tải danh sách (VD gọi API khi mở — nghe @open): danh sách xổ ra hiện vòng xoay nhỏ ở giữa */
  loading:     { type: Boolean, default: false },  // avatar vuông bo góc (logo dự án…) — cả danh sách và tag  // dạng cây: co / giãn các mục có con (option.parent) — mở danh sách: chỉ mở nhánh chứa mục đang chọn (+ mục có open: true)
})
```
Sự kiện: `['update:modelValue', 'change', 'create', 'split', 'add', 'quick-search', 'open']`

Slot: `footer`

## AppCrossSell

Thanh “Tiện ích” — quảng cáo / liên kết bán chéo trên màn TỔNG QUAN (quy chuẩn /ds/advertising-cross-selling)

```js
defineProps({
  title:    { type: String, default: 'Tiện ích' },
  subtitle: { type: String, default: 'Ưu đãi MISA' },
  icon:     { type: String, default: 'speakerphone' },
  /** màu icon nhóm (.kpi-icon--*): warning | brand | success | info | danger | purple | pink */
  tone:     { type: String, default: 'warning' },
  /** [{ id, label, icon (TIcon), tone?: brand | success | info | warning | danger | purple | pink, href? }] */
  items:    { type: Array,  default: () => [] },
})
```
Sự kiện: `['select', 'toggle']`


## AppDatePicker

Ô chọn thời gian nâng cao — Figma ❖ Date Time Picker (Section 15258:153109).

```js
defineProps({
  /** date 'YYYY-MM-DD' · week 'YYYY-MM-DD' (thứ 2 đầu tuần) · month 'YYYY-MM' · quarter 'YYYY-Q1' · half 'YYYY-H1' · year 'YYYY' · time 'HH:mm:ss' · datetime 'YYYY-MM-DDTHH:mm:ss' · range → [đầu, cuối] */
  modelValue:  { type: [String, Array], default: '' },
  type:        { type: String,  default: 'date' },
  range:       { type: Boolean, default: false },
  /** Danh sách chọn nhanh bên trái (type="date" + range) */
  presets:     { type: Boolean, default: false },
  placeholder: { type: String,  default: '' },
  clearable:   { type: Boolean, default: true },
  disabled:    { type: Boolean, default: false },
  readonly:    { type: Boolean, default: false },
  /** time / datetime: có cột giây (HH:mm:ss) — false → HH:mm */
  seconds:     { type: Boolean, default: true },
})
```
Sự kiện: `['update:modelValue', 'change']`


## AppDatebox

type="time" | "datetime-local": gõ trực tiếp (HH:MM · DD/MM/YYYY HH:MM) hoặc bấm xổ Time Picker / Date Time Picker (Figma) — dùng AppDatePicker, không cột giây

```js
defineProps({
  modelValue:  { type: String,  default: '' },       // ISO: YYYY-MM-DD (date) | HH:MM | YYYY-MM-DDTHH:MM
  type:        { type: String,  default: 'date' },   // date | datetime-local | time
  placeholder: { type: String,  default: '' },
  state:       { type: String,  default: 'default' },
  outline:     { type: Boolean, default: true },
  size:        { type: String,  default: 'md' },
  disabled:    { type: Boolean, default: false },
  readonly:    { type: Boolean, default: false },
  clearable:   { type: Boolean, default: true },     // hiện "Xóa" trong popover khi đã có giá trị — trường bắt buộc thì ẩn
  required:    { type: Boolean, default: false },
})
```
Sự kiện: `['update:modelValue', 'change']`


## AppFormPanel

Header

```js
defineProps({
  title:     { type: String,  default: '' },
  divider:   { type: Boolean, default: false },   // quy chuẩn popup: header KHÔNG có gạch dưới
  closable:  { type: Boolean, default: true },
  /** Hiển thị nút phóng to / thu nhỏ trong header */
  maximizable: { type: Boolean, default: false },
  /** Form thêm mới → mở ra là con trỏ ở ô nhập đầu tiên (quy chuẩn) */
  autofocus: { type: Boolean, default: false },
  /** Tab chỉ đi qua ô nhập trong thân form (quy chuẩn) — tắt khi thân form không phải form nhập liệu */
  tabFieldsOnly: { type: Boolean, default: true },
})
```
Sự kiện: `['close']`

Slot: `title`, `header-end`, `toolbar`, `default`, `footer`

## AppGlobalAlert

AppGlobalAlert — thông báo Global Inline (Figma Thông báo › Global Inline): dải thông báo toàn app, nằm TRÊN CÙNG, phía trên thanh header

```js
defineProps({
  type: { type: String, default: 'info' },
  variant: { type: String, default: 'solid' },
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
  /** Nhãn nút thao tác (bỏ trống = không có nút) */
  actionLabel: { type: String, default: '' },
  closable: { type: Boolean, default: false },
})
```
Sự kiện: `['action', 'close']`

Slot: `default`

## AppGlobalSearch

Ô tìm kiếm của Global header (quy chuẩn /ds/hearder-bar › Ô tìm kiếm toàn cục):

```js
defineProps({
  modelValue:  { type: String,  default: '' },
  placeholder: { type: String,  default: 'Tìm kiếm' },
  /** Kết quả theo nhóm phân hệ: [{ key, title: 'Hồ sơ', total, items: [{ id, name, subtitle, meta, avatar }] }] — null = chưa tìm. Phân hệ không có kết quả KHÔNG đưa vào */
  results:     { type: Array,   default: null },
  /** Đang tìm (cha đặt true khi nhận 'search', false khi có kết quả) */
  loading:     { type: Boolean, default: false },
  /** Số ký tự tối thiểu mới tìm */
  minChars:    { type: Number,  default: 2 },
  /** Chờ người dùng ngừng gõ (ms) rồi mới emit 'search' */
  debounce:    { type: Number,  default: 300 },
  /** Bề rộng popup kết quả (tối thiểu bằng ô) */
  panelWidth:  { type: Number,  default: 640 },
})
```
Sự kiện: `['update:modelValue', 'search', 'select', 'more', 'clear']`


## AppHelpPanel

Panel Trợ giúp — Figma MDS “Help Frame” (51535:79812) · rộng 500 (đặt ở khung chứa) · cao hết màn hình

```js
defineProps({
  /** 'default' (header trắng — app header màu) | 'brand' (header Brand — app header trắng) */
  variant:       { type: String, default: 'default' },
  title:         { type: String, default: 'Trợ giúp' },
  modelValue:    { type: String, default: '' },   // từ khóa ô tìm kiếm (v-model)
  placeholder:   { type: String, default: 'Tìm kiếm câu hỏi, từ khóa hoặc chủ đề' },
  showOpenNew:   { type: Boolean, default: true },
  channelsLabel: { type: String, default: 'Kênh hỗ trợ' },
  /** Icon kênh hỗ trợ ở chân panel: [{ id, icon (tên TIcon), label (tooltip / aria) }] — [] = ẩn chân */
  channels: { type: Array, default: () => [
    { id: 'facebook', icon: 'brand-facebook', label: 'Cộng đồng MISA' },
    { id: 'video',    icon: 'video',          label: 'Lịch đào tạo/chia sẻ Online' },
    { id: 'youtube',  icon: 'brand-youtube',  label: 'Hướng dẫn qua video' },
    { id: 'academy',  icon: 'school',         label: 'Kho tri thức nghiệp vụ' },
  ] },
})
```
Sự kiện: `['update:modelValue', 'search', 'close', 'open-new', 'channel']`

Slot: `default`

## AppImageUpload

Chọn ảnh (logo, ảnh đại diện…): bấm chọn file · dán ảnh (Ctrl/Cmd + V) · kéo thả. Nhận SVG / PNG / WebP / JPG.

```js
defineProps({
  modelValue:      { type: String,  default: '' },
  size:            { type: Number,  default: 64 },          // khung xem trước (px)
  maxSize:         { type: Number,  default: 256 },         // ảnh bitmap thu nhỏ về tối đa (px, cạnh dài)
  maxSvgKb:        { type: Number,  default: 150 },
  placeholderText: { type: String,  default: '' },          // chưa có ảnh → chữ cái đầu (VD mã dự án)
  hint:            { type: String,  default: 'SVG, PNG, WebP hoặc JPG — bấm chọn, kéo thả hoặc dán ảnh (Ctrl + V)' },
  pasteScope:      { type: String,  default: '.modal, [role="dialog"]' },   // dán ảnh ở bất kỳ đâu trong hộp thoại chứa control
})
```
Sự kiện: `['update:modelValue']`


## AppInlineAlert

AppInlineAlert — thông báo inline nằm trong luồng trang (đầu trang / đầu form), không nổi, không tự tắt.

```js
defineProps({
  /** info | warning | success | danger */
  type: { type: String, default: 'info' },
  /** Tiêu đề in đậm đứng trước nội dung (tùy chọn) */
  title: { type: String, default: '' },
  /** Tên icon Tabler — bỏ trống dùng icon theo type */
  icon: { type: String, default: '' },
  /** Hiện nút × để ẩn (phát sự kiện close — nơi dùng tự nhớ trạng thái ẩn) */
  closable: { type: Boolean, default: false },
  /** Tiêu đề 1 dòng riêng, nội dung xuống dòng dưới (Figma: Inline có tiêu đề + nội dung dài). Mặc định: tiêu đề và nội dung cùng 1 hàng */
  stacked: { type: Boolean, default: false },
})
```
Sự kiện: `['close']`

Slot: `default`, `actions`

## AppInput

Lỗi (error): KHÔNG in dưới ô — hiện bằng tooltip đỏ + icon trong control. Cảnh báo / thông tin: in dưới ô

```js
defineProps({
  label:       { type: String,  default: '' },
  required:    { type: Boolean, default: false },
  vertical:    { type: Boolean, default: true },
  caption:     { type: String,  default: '' },
  message:     { type: String,  default: '' },
  messageType: { type: String,  default: 'error' }, // error | success | warning | info
})
```
Slot: `default`

## AppNotification

AppNotification — thẻ thông báo dạng Notification (Figma Thông báo › Notification): sự kiện quan trọng cần xem lại, KHÔNG tự đóng, bấm × để tắt.

```js
defineProps({
  type: { type: String, default: 'info' },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
})
```
Sự kiện: `['close']`

Slot: `default`, `actions`

## AppNotifier

Vùng Notification: góc phải phía trên, ngay dưới header (quy chuẩn) — đặt 1 lần trong khung app


## AppNumberbox

decimal: ô chữ inputmode="decimal" — gõ được cả dấu phẩy (5,75) lẫn dấu chấm (5.75), giữ nguyên số lẻ (không bị ép theo step)

```js
defineProps({
  modelValue:  { type: [Number, String], default: '' },
  placeholder: { type: String,  default: '' },
  /** Ô nhập số trong form LUÔN căn trái (kể cả số tiền) · chỉ ô số trên bảng (DataTable numberbox) mới căn phải để dễ cộng số giữa các dòng */
  align:       { type: String,  default: 'left' },   // left | right
  min:         { type: Number,  default: null },
  max:         { type: Number,  default: null },
  step:        { type: Number,  default: 1 },
  state:       { type: String,  default: 'default' },
  outline:     { type: Boolean, default: true },
  /** Viền ẩn, chỉ hiện khi rê / focus — dùng cho ô sửa trực tiếp trên bảng (DataTable editable), giống AppCombobox ghost */
  ghost:       { type: Boolean, default: false },
  size:        { type: String,  default: 'md' },
  stepper:     { type: Boolean, default: true },
  disabled:    { type: Boolean, default: false },
  readonly:    { type: Boolean, default: false },
  /** Cho nhập số thập phân tự do (Point, điểm…): nhận “,” hoặc “.” làm dấu thập phân, không ép theo step */
  decimal:     { type: Boolean, default: false },
})
```
Sự kiện: `['update:modelValue', 'change']`


## AppOnboarding

Bắt đầu sử dụng (Onboarding) — Figma “Quy chuẩn chung” › Băt đầu sử dụng (34302:9413) · quy chuẩn /ds/onboarding-start

```js
defineProps({
  modelValue:   { type: Boolean, default: false },   // v-model: popup đang mở
  userName:     { type: String, default: '' },
  product:      { type: String, default: 'AMIS' },
  /** [{ id, title, tasks?: [{ id, label, done, video? }], groups?: [{ id, title, tasks }] }] — bước có groups: tiến độ = số nhóm xong / số nhóm */
  steps:        { type: Array, default: () => [] },
  level:        { type: String, default: 'basic' },   // v-model:level
  levels:       { type: Array, default: () => [{ value: 'basic', label: 'Cơ bản' }, { value: 'advanced', label: 'Nâng cao' }] },
  activeTask:   { type: [String, Number], default: null },   // việc vừa làm / đang làm → nền Brand Light
  guidesTitle:  { type: String, default: 'Hướng dẫn sử dụng' },
  /** [{ id, icon, tone: 'brand'|'danger'|'success', label, progress?: { done, total } }] */
  guides:       { type: Array, default: () => [] },
  supportsTitle:{ type: String, default: 'Kênh hỗ trợ phần mềm' },
  /** [{ id, icon | img, tone?, label, ai? (chữ gradient AI) }] — icon: 'misa-ai' = icon MISA AI của Global Header */
  supports:     { type: Array, default: () => [] },
  fab:          { type: Boolean, default: true },   // nút nổi khi popup đóng mà còn việc
  /** Bước mở sẵn khi mở popup (mặc định: không mở bước nào) */
  initialStep:  { type: [String, Number], default: null },
  /** Khóa nhớ vị trí nút nổi (localStorage) — '' = không nhớ */
  fabKey:       { type: String, default: 'mds-onboarding-fab' },
  /** Hiện icon đầu mỗi bước (step.icon — Icon Swap trong Figma) */
  showIcons:    { type: Boolean, default: true },
})
```
Sự kiện: `['update:modelValue', 'update:level', 'task', 'step-done', 'group-done', 'video', 'guide', 'support', 'close']`


## AppPagination

Sum area

```js
defineProps({
  total:           { type: Number, default: 0 },
  pageSize:        { type: Number, default: 10 },
  currentPage:     { type: Number, default: 1 },
  pageSizeOptions: { type: Array,  default: () => [10, 20, 50, 100] },
  sums:            { type: Array,  default: () => [] }, // [{label, value}]
  sumVertical:     { type: Boolean, default: false },
  /** 'basic' (mặc định) | 'advance' — phân trang dạng số (Figma Paging Type=Advance) */
  type:            { type: String,  default: 'basic' },
})
```
Sự kiện: `['update:currentPage', 'update:pageSize']`


## AppRadio

Radio thật (ẩn) → Tab / phím mũi tên trong nhóm cùng `name` như radio gốc của trình duyệt

```js
defineProps({
  modelValue: { default: undefined },
  value:      { default: undefined },
  label:      { type: String,  default: '' },
  name:       { type: String,  default: '' },
  disabled:   { type: Boolean, default: false },
  error:      { type: Boolean, default: false },   // trạng thái lỗi: viền đỏ (thông báo lỗi đặt ở AppInput / dưới nhóm)
})
```
Sự kiện: `['update:modelValue']`

Slot: `default`

## AppRichText

── Basic mode: textarea → TinyMCE replaces with iframe editor ──

```js
defineProps({
  modelValue:  { type: String,  default: '' },
  mode:        { type: String,  default: 'basic' }, // 'basic' | 'inline'
  /** Bộ nút: 'simple' (Figma RichText — mặc định) | 'full' (Figma Editor Toolbar đầy đủ) | 'classic' (thêm thanh menu + đếm chữ như TinyMCE Classic) | chuỗi toolbar TinyMCE tự định nghĩa */
  toolbar:     { type: String,  default: 'simple' },
  /** Cho kéo góc dưới phải để đổi chiều cao (mode basic) */
  resize:      { type: Boolean, default: true },
  height:      { type: Number,  default: 300 },
  minHeight:   { type: Number,  default: 120 },
  placeholder: { type: String,  default: 'Nhập nội dung...' },
  disabled:    { type: Boolean, default: false },
  readonly:    { type: Boolean, default: false },
  state:       { type: String,  default: 'default' }, // default | error | warning | success | disabled | readonly
})
```
Sự kiện: `['update:modelValue', 'focus', 'blur']`


## AppSearchResultsDialog

Popup kết quả tìm kiếm của MỘT phân hệ (mở từ “Xem thêm” trong ô tìm kiếm toàn cục của Global header):

```js
defineProps({
  /** Tên phân hệ đang xem (VD “Hợp đồng”) */
  groupTitle: { type: String, default: '' },
  /** Từ khóa ban đầu (điền sẵn vào ô) */
  keyword:    { type: String, default: '' },
  /** Toàn bộ kết quả của phân hệ này: [{ id, name, subtitle, meta, avatar }] */
  items:      { type: Array,  default: () => [] },
  total:      { type: Number, default: null },
  loading:    { type: Boolean, default: false },
  placeholder: { type: String, default: 'Tìm kiếm' },
  debounce:   { type: Number, default: 300 },
})
```
Sự kiện: `['close', 'search', 'select']`


## AppSearchbox

Ô tìm kiếm thường — Figma MDS “Searchbox” (6019:50140): icon kính lúp 16 · đệm ngang 8 · cách 8 · cao = ô nhập

```js
defineProps({
  modelValue:  { type: String,  default: '' },
  placeholder: { type: String,  default: 'Tìm kiếm' },
  /** 'outline' | 'filled' | 'filled-white' ('header' = tên cũ của filled-white) */
  variant:     { type: String,  default: 'outline' },
  state:       { type: String,  default: 'default' },
  /** Tên cũ: :outline="false" = variant 'filled' */
  outline:     { type: Boolean, default: true },
  clearable:   { type: Boolean, default: true },
  size:        { type: String,  default: 'md' },
  disabled:    { type: Boolean, default: false },
  width:       { type: [Number, String], default: null },
})
```
Sự kiện: `['update:modelValue', 'search', 'clear']`


## AppSegmented

Segmented — Figma MDS ❖ Segmented (6019:80533). CSS dùng chung: .seg / .seg__item trong style.css.

```js
defineProps({
  /** [{ value, label?, icon?, tip? (bắt buộc khi chỉ có icon), disabled? }] */
  options:    { type: Array, default: () => [] },
  modelValue: { default: null },
  variant:    { type: String, default: 'text' },   // text | solid | filled
  fit:        { type: Boolean, default: false },
  ariaLabel:  { type: String, default: null },
})
```
Sự kiện: `['update:modelValue', 'change']`


## AppSidebar

Host reserves space in flex layout; sidebar inside is always position:absolute

```js
defineProps({
  items:           { type: Array,   default: () => [] },
  activeId:        { type: String,  default: '' },
  defaultExpanded: { type: Boolean, default: false },
  hideQuickAdd:    { type: Boolean, default: false },
  quickAddLabel:   { type: String,  default: 'Thêm nhanh' },   // chữ trên nút thêm nhanh (VD “Thêm việc”)
  /** Khóa lưu trạng thái mở / thu gọn (mỗi app nên có khóa riêng) */
  storageKey:      { type: String,  default: 'mds-sidebar-expanded' },
  /** Cách hiện item.children: 'flyout' (menu con xổ sang phải) | 'accordion' (mở / đóng ngay bên dưới — menu dài nhiều nhóm, VD trang tài liệu) */
  childrenMode:    { type: String,  default: 'flyout' },
  /** Luôn mở rộng, ẩn nút thu gọn (VD sidebar nằm trong ngăn trượt ở màn hẹp) */
  forceExpanded:   { type: Boolean, default: false },
})
```
Sự kiện: `['nav', 'quick-add']`


## AppTabs

Tabs — Figma MDS Tab Horizontal Item (6019:101046). CSS dùng chung: .tabs / .tab trong style.css.

```js
defineProps({
  /** [{ value, label, icon?, badge?, disabled? }] */
  items:      { type: Array, default: () => [] },
  modelValue: { default: null },
  variant:    { type: String, default: 'brand' },   // brand | filled | solid | neutral
  underline:  { type: Boolean, default: true },
  /** false: bỏ vạch nền dưới các tab CHƯA chọn (chỉ tab đang chọn còn gạch Brand) — dùng khi dải tab nằm sát viền / vạch ngăn của khung chứa, tránh 2 đường kẻ chồng nhau */
  baseline:   { type: Boolean, default: true },
  ariaLabel:  { type: String, default: null },
})
```
Sự kiện: `['update:modelValue', 'change']`


## AppTag

Tag (Figma MDS Web Components v2.0 › Tag, node 15146:127716): Tag · Tag Icon · Tag Avatar · Tag Dot · Tag Icon (chỉ icon) × X Small 20 / Small 24 / Medium 28

```js
defineProps({
  /** Chữ trong tag (bỏ trống khi chỉ có icon) */
  label:     { type: String,  default: '' },
  /** Màu: neutral | brand | accent | info | warning | danger | success */
  color:     { type: String,  default: 'neutral' },
  /** Kiểu: 'outline' (mặc định — nền nhạt + viền nhạt + chữ màu) · 'solid' (nền đậm, chữ trắng) · 'text' (chỉ chấm + chữ, không nền — dùng với dot) */
  variant:   { type: String,  default: 'outline' },
  /** Cỡ: 'xs' (X Small 20) · 'sm' (Small 24 — mặc định) · 'md' (Medium 28) */
  size:      { type: String,  default: 'sm' },
  /** Chấm màu 6px bên trái (Tag Dot) — tag trạng thái */
  dot:       { type: Boolean, default: false },
  /** Icon bên trái (tên TIcon) · iconRight: icon bên phải */
  icon:      { type: String,  default: '' },
  iconRight: { type: String,  default: '' },
  /** Avatar bên trái (Tag Avatar): tên người → chữ cái đầu màu tự động, hoặc ảnh avatarSrc */
  avatar:    { type: String,  default: '' },
  avatarSrc: { type: String,  default: '' },
  /** Tag bấm được (lọc nhanh, chọn) → render <button>, có Hover / Pressed / Focus */
  clickable: { type: Boolean, default: false },
  disabled:  { type: Boolean, default: false },
  ariaLabel: { type: String,  default: '' },
})
```

## AppTaskTray

Khay tiến trình chạy ngầm (quy chuẩn /ds/background-tasks) — nhập khẩu / xuất khẩu / cập nhật hàng loạt… mất > 10 giây.

```js
defineProps({
  /** [{ id, kind: 'export'|'import'|'other', title, status, done?, total?, progress? (0–100, bỏ trống = chưa rõ %), eta? ('còn khoảng 2 phút'),
        result? (dòng phụ khi xong), errors? (số dòng lỗi), startedAt?, finishedAt? ('14:32'), actions? [{ id, label, icon }] (ghi đè nút mặc định) }] */
  tasks:        { type: Array,   default: () => [] },
  collapsed:    { type: Boolean, default: false },   // v-model:collapsed
  inline:       { type: Boolean, default: false },   // nằm trong bố cục thay vì neo góc màn hình
  historyLabel: { type: String,  default: '' },   // link chân khay (VD 'Xem lịch sử tiến trình') — mặc định không có: kết quả xem lại ở Thông báo
})
```
Sự kiện: `['update:collapsed', 'close', 'action', 'cancel', 'dismiss', 'history']`


## AppTextarea

Lỗi: icon chấm than đỏ, hover → tooltip lỗi (nằm trong AppInput có lỗi)

```js
defineProps({
  modelValue:  { type: String,  default: '' },
  placeholder: { type: String,  default: '' },
  state:       { type: String,  default: 'default' }, // default | error | success | warning | disabled | readonly
  outline:     { type: Boolean, default: true },
  /** Chiều cao tối thiểu của vùng gõ — mặc định 58 → cả ô cao 72px (Figma Textarea, Fix Height = False) */
  minHeight:   { type: Number,  default: 58 },
  /** Figma Fix Height = True: chiều cao cố định (minHeight), KHÔNG có góc kéo giãn — nội dung dài thì cuộn trong ô.
      Mặc định (False): có góc kéo ở dưới phải để người dùng kéo cao thêm. autosize: tự giãn theo nội dung (maxHeight 0 = giãn mãi, không cuộn) */
  fixHeight:   { type: Boolean, default: false },
  maxHeight:   { type: Number,  default: 0 },
  resize:      { type: Boolean, default: true },
  /** Tự giãn chiều cao theo nội dung (từ minHeight tới maxHeight; 0 = không giới hạn) */
  autosize:    { type: Boolean, default: false },
  maxlength:   { type: Number,  default: 0 },
  disabled:    { type: Boolean, default: false },
  readonly:    { type: Boolean, default: false },
})
```
Sự kiện: `['update:modelValue']`


## AppTextbox

Lỗi: icon chấm than đỏ, hover → tooltip lỗi (nằm trong AppInput có lỗi)

```js
defineProps({
  modelValue:  { type: String,  default: '' },
  type:        { type: String,  default: 'text' }, // text | password | email | tel | url
  placeholder: { type: String,  default: '' },
  state:       { type: String,  default: 'default' }, // default | error | success | warning | disabled | readonly
  outline:     { type: Boolean, default: true },
  /** Viền ẩn, chỉ hiện khi rê / focus — dùng cho ô sửa trực tiếp trên bảng (DataTable editable), giống AppCombobox ghost */
  ghost:       { type: Boolean, default: false },
  iconLeft:    { type: String,  default: '' },
  iconRight:   { type: String,  default: '' },
  clearable:   { type: Boolean, default: false },   // chỉ có tác dụng khi type="search" (ô tìm kiếm) — ô tìm kiếm nên dùng AppSearchbox
  align:       { type: String,  default: 'left' }, // left | right
  size:        { type: String,  default: 'md' },   // md | sm
  disabled:    { type: Boolean, default: false },
  readonly:    { type: Boolean, default: false },
})
```
Sự kiện: `['update:modelValue', 'clear']`


## AppToaster

Vùng toast: giữa phía trên màn hình (quy chuẩn) — đặt 1 lần trong khung app


## AppTree

Tree — Figma MDS “Pattern Organization Tree” (46155:6035): ô tìm kiếm + cây nhiều cấp, có / không có ô tick.

```js
defineProps({
  /** [{ id, label, children?: [...], disabled? }] */
  items:      { type: Array, default: () => [] },
  /** checkable: mảng id đã tick · không checkable: id đang chọn (1 mục) */
  modelValue: { default: null },
  checkable:  { type: Boolean, default: false },
  /** Tick cha → chọn cả nhánh, cha hiện “chọn một phần” khi con chọn dở (mặc định: chọn từng mục độc lập như Figma) */
  cascade:    { type: Boolean, default: false },
  searchable: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: 'Tìm kiếm' },
  /** Mở sẵn: true = mở hết · số = mở tới cấp đó (1 = chỉ gốc) · mảng id */
  defaultExpanded: { type: [Boolean, Number, Array], default: 1 },
  /** Khung panel trắng có bóng (dùng khi cây đứng riêng / xổ ra) */
  panel:      { type: Boolean, default: false },
  maxHeight:  { type: Number, default: 0 },
  emptyText:  { type: String, default: 'Chưa có dữ liệu' },
  idKey:      { type: String, default: 'id' },
  labelKey:   { type: String, default: 'label' },
})
```
Sự kiện: `['update:modelValue', 'select']`


## AppUpdateNotice

AppUpdateNotice — vừa deploy bản mới: thông báo góc trên bên phải, yêu cầu tải lại trang để tiếp tục dùng.

```js
defineProps({ build: { type: String, default: '' }, url: { type: String, default: '/version.json' } })
```

## AvatarFilter

AvatarFilter — lọc theo người bằng dãy avatar (VD “Người thực hiện” trên danh sách công việc).

```js
defineProps({
  people:     { type: Array, default: () => [] },   // [{ id, name, picture?, sub?, code? }]
  modelValue: { type: Array, default: () => [] },   // id đang lọc
  label:      { type: String, default: '' },
  max:        { type: Number, default: 0 },          // số avatar tối đa; 0 = tự theo bề rộng màn hình
  accent:     { type: String, default: '' },         // màu CSS: chấm màu trước nhãn (khớp màu nhóm cột của DataTable — col.accent)
  accentTip:  { type: String, default: '' },         // tooltip khi di lên chấm màu
})
```
Sự kiện: `['update:modelValue']`


## BorderBeamButton

Border Beam — control dùng chung cho mọi chức năng "AI có điểm nhấn" (kỹ thuật gốc

Slot: `default`

## BulkActionBar

Thanh thao tác hàng loạt đặt THAY tiêu đề trang (danh sách chỉ có tiêu đề bên trái): tick dòng → che tiêu đề, ẩn Thêm / Nhập khẩu bên phải;

```js
defineProps({
  selectedCount:    { type: Number,  default: 0 },
  /** Tổng số bản ghi của danh sách (mọi trang) — để hiện “Chọn tất cả N trên bảng” */
  totalCount:       { type: Number,  default: 0 },
  /** Đã tick hết các dòng của trang đang xem */
  pageAllSelected:  { type: Boolean, default: false },
  /** Đang chọn tất cả bản ghi trên mọi trang */
  allPagesSelected: { type: Boolean, default: false },
})
```
Sự kiện: `['deselect-all', 'select-all-pages']`

Slot: `default`

## CollapseExpandPanel

```js
defineProps({
  type:    { type: String, default: 'Expand'  }, // 'Expand' | 'Collapse'
  position:{ type: String, default: 'Bottom'  }, // 'Top' | 'Bottom' | 'Left' | 'Right'
  bgColor: { type: String, default: 'Gray'    }, // 'Gray' | 'White'
})
```
Sự kiện: `['click']`


## ControlHeader

── Trial expiry banner ──

```js
defineProps({
  appName: { type: String, default: 'Kế Toán' },
  appTag:  { type: String, default: '' },
  /** Ép nền header: 'color' (nền màu chủ đề) | 'light' (nền trắng) — bỏ trống = theo Thiết lập hiển thị của người dùng (VD khung ví dụ trong tài liệu) */
  mode:    { type: String, default: '' },
  noMeta:  { type: Boolean, default: false },
  hideTrialBanner: { type: Boolean, default: false },
  /** true: nút bánh răng mở thẳng "Thiết lập màu sắc và hiển thị" (bỏ bảng tiện ích & thiết lập) */
  settingsOnly:    { type: Boolean, default: false },
  /** Tên người dùng → avatar chữ cái đầu; để trống giữ avatar mặc định */
  avatarName:      { type: String,  default: '' },
  /** Ẩn các công cụ không dùng: 'apps' (nút 9 chấm) | 'search' | 'ai' | 'notify' | 'help' | 'more' */
  hideTools:       { type: Array,   default: () => [] },
  /** Mục thêm vào menu bánh răng: [{ id, icon, label }] — có giá trị thì bánh răng xổ menu
      (mục đầu luôn là “Thiết lập hiển thị”); chọn mục của app → emit('settings-select', item) */
  settingsMenu:    { type: Array,   default: () => [] },
  /** Thông tin tài khoản hiện trong menu avatar: email, vai trò, ảnh (Google picture) */
  userEmail:       { type: String,  default: '' },
  userRole:        { type: String,  default: '' },
  userPicture:     { type: String,  default: '' },
  /** Mục thêm vào menu avatar (trên Đăng xuất): [{ id, icon, label } | { separator: true }] → emit('profile-select', item) */
  profileMenu:     { type: Array,   default: () => [] },
  /** Ẩn avatar / menu tài khoản — trang công khai khi người xem chưa đăng nhập (đặt nút “Đăng nhập” vào slot header-end) */
  hideAvatar:      { type: Boolean, default: false },
  /** Ô tìm kiếm toàn cục (bắt @search mới xổ kết quả): nhóm theo phân hệ [{ key, title, total, items: [{ id, name, subtitle, meta, avatar }] }] — null = chưa tìm */
  searchPlaceholder: { type: String, default: 'Tìm kiếm' },
  searchResults:   { type: Array,   default: null },
  /** Popup “Xem thêm” của 1 phân hệ: toàn bộ kết quả của phân hệ đó (null = đang nạp) — app nạp khi nhận @search-more(group, q) */
  searchMoreItems: { type: Array,   default: null },
  searchMoreTotal: { type: Number,  default: null },
  searchMoreLoading: { type: Boolean, default: false },
  searchLoading:   { type: Boolean, default: false },
  searchPanelWidth: { type: Number, default: 640 },
  /** Địa chỉ trang chủ khi bấm logo / tên app (app dùng router: bắt @home để điều hướng) */
  homeHref:        { type: String,  default: '/' },
  /** Danh sách ứng dụng cho nút 9 chấm: [{ id, label, img (logo), href }] — có giá trị thì bấm 9 chấm xổ menu chuyển app */
  apps:            { type: Array,   default: () => [] },
  /** id của ứng dụng đang dùng trong apps (được đánh dấu ✓, chọn lại không làm gì) */
  currentApp:      { type: String,  default: '' },
  /** Popover Thông báo (Figma Header_Notification): [{ id, group ('Hôm nay' | 'Trước đó'…), text ('**đậm** thường'), time, unread?, avatar? | icon? + tone? | name?, badgeIcon? | badgeImg? }]
      null = chuông không xổ (giữ như cũ) */
  notifications:   { type: Array,   default: null },
  /** Số trên chuông (mặc định = số thông báo chưa đọc) */
  notifyCount:     { type: Number,  default: null },
  /** Popover Trợ giúp (Header_Help): [{ title, items: [{ id, icon | img, label, color? }] }] → emit('help-select', item) */
  helpMenu:        { type: Array,   default: () => [] },
  /** Popover Thêm ⋯ (Header_More): [{ id, icon, label } | { separator: true }] + slot more-footer (VD khối cài app mobile) → emit('more-select', item) */
  moreMenu:        { type: Array,   default: () => [] },
  /** Menu tài khoản: khung công ty / dữ liệu đang làm việc (có ›) — [{ id, icon, label }] → emit('profile-select', item) */
  profileContext:  { type: Array,   default: () => [] },
  /** Dòng ngôn ngữ cuối menu tài khoản: { label: 'Tiếng Việt', flag?: url } → emit('profile-select', { id: '__language' }) */
  language:        { type: Object,  default: null },
})
```
Sự kiện: `['settings-select', 'home', 'logout', 'profile-select', 'app-select', 'notify-select', 'notify-action', 'help-select', 'more-select', 'search', 'search-select', 'search-more']`

Slot: `header-start`, `logo-icon`, `header-meta`, `default`, `header-actions`, `ai-icon`, `header-end`, `more-footer`

## DataTable

Header NHÓM (gộp ô): cột khai báo `group` → các cột LIỀN NHAU cùng nhóm gộp thành 1 ô nhãn nhóm phía trên (VD Bảng lương: Lương chuẩn · Phụ cấp · Làm thêm).

```js
defineProps({
  columns:         { type: Array,   default: () => [] },
  /** Liên thông với bộ lọc Advance: { mode, conditions } (v-model:filter) — lọc theo cột trên tiêu đề ghi vào CHÍNH bộ lọc này → TableFilterPanel tự tick trường, TableFilterTags hiện tag; ngược lại lọc ở panel → cột tự hiện đang lọc.
      Cột ↔ trường: col.filterKey ?? col.key khớp field.key trong filterFields; cột không có trường → không có nút lọc. Bỏ trống = lọc cột kiểu cũ (emit column-filter) */
  filter:          { type: Object,  default: null },
  /** Trường lọc (giống TableFilterPanel): [{ key, label, type: 'text' | 'enum' | 'number' | 'date', options?, get(row) }] */
  filterFields:    { type: Array,   default: () => [] },
  rows:            { type: Array,   default: () => [] },
  editable:        { type: Boolean, default: false },
  selected:        { type: Array,   default: () => [] },
  showFooter:      { type: Boolean, default: false },
  footerLabel:     { type: String,  default: 'Tổng' },   // nhãn dòng Tổng — tự đặt ở cột đầu tiên đang hiện
  rowIdKey:        { type: String,  default: 'id' },
  hideBlankRows:   { type: Boolean, default: true },
  /** Gom nhóm: tên trường trong mỗi dòng chứa khóa nhóm ('' = nhóm trống) · groupLabel(key) → tên hiển thị · nhớ nhóm đang đóng theo groupStorageKey */
  groupBy:         { type: String,  default: '' },
  /** Khóa nhớ độ rộng cột (app cung cấp kho lưu qua provide('dtWidthStore')) · trống = tự sinh theo bộ cột */
  persistKey:      { type: String,  default: '' },
  groupLabel:      { type: Function, default: null },
  groupStorageKey: { type: String,  default: '' },
  pagination:      { type: Boolean, default: false },
  pagingType:      { type: String,  default: 'basic' },   // phân trang dựng sẵn: 'basic' | 'advance' (dạng số)
  total:           { type: Number,  default: 0 },
  pageSize:        { type: Number,  default: 10 },
  currentPage:     { type: Number,  default: 1 },
  pageSizeOptions: { type: Array,   default: () => [10, 20, 50, 100] },
  sums:            { type: Array,   default: () => [] },
  sumVertical:     { type: Boolean, default: false },
  rowActions:      { type: Array,   default: () => [] }, // [{icon, title, emit, show?(row) → false = ẩn ở dòng đó}] — hiện tối đa maxRowActions
  maxRowActions:   { type: Number,  default: 2 },   // rê chuột: tối đa 2 thao tác chính, phần còn lại + thao tác danger (Xóa) vào “…”
  moreActions:     { type: Array,   default: () => [] }, // [{id, icon, label, danger?, separator?}]
  /** Cách hiện thao tác dòng: 'hover' (rê chuột hiện nút cuối dòng) · 'icons' (cột ghim cuối: icon chức năng chính + … chức năng phụ)
      · 'link' (cột ghim cuối: tên chức năng chính dạng link + ⌄ xổ chức năng phụ). Chức năng chính = rowActions[0] (cần label cho 'link') */
  actionMode:      { type: String,  default: 'hover' },
  /** Bảng TÓM TẮT chỉ xem (bảng trong card màn Tổng quan, 5–7 dòng + “Xem tất cả”): giữ nguyên style bảng chuẩn; tự tắt vách ngăn cột,
      lọc cột, header ghim; menu cột chỉ còn Sắp xếp (app không nghe @column-sort thì bảng TỰ sắp xếp dòng); vẫn kéo đổi độ rộng cột;
      dòng chỉ có con trỏ tay khi app nghe @row-click */
  summary:         { type: Boolean, default: false },
  /** Kiểu vạch ngăn cột ở THÂN bảng: 'dotted' (nét chấm — mặc định) | 'solid' (nét liền — dùng cho bảng có header gộp ô / bảng nhóm cột như Bảng lương) */
  columnLineStyle: { type: String,  default: 'dotted' },
  columnLines:     { type: Boolean, default: true },   // false = không kẻ vạch ngăn dài giữa các cột ở thân bảng; header còn vạch ngăn ngắn 16px; kéo đổi độ rộng cột vẫn dùng được
  actionsLabel:    { type: String,  default: '' },     // tiêu đề cột thao tác ghim
  actionsWidth:    { type: Number,  default: 0 },      // 0 = tự: icons 76 · link 120
  lineCount:       { type: Number,  default: 1 },
})
```
Sự kiện: `[ 'row-click', 'update:selected', 'cell-update', 'update:currentPage', 'update:pageSize', 'update:filter', 'column-sort', 'column-filter', 'column-hide', 'column-move', 'column-insert', 'column-wrap', 'column-resize', // (col, width | null`

Slot: `empty`

## DetailField

Trường ở màn Chi tiết (quy chuẩn MDS): nhãn 200px · giá trị gạch chân mảnh · bấm vào giá trị → sửa nhanh 1 trường (✓ lưu / ✕ hủy)

```js
defineProps({
  label:      { type: String, default: '' },
  modelValue: { type: [String, Number, Object], default: '' },  // Object = { link, href } → hiển thị dạng link
  editable:   { type: Boolean, default: true },
})
```
Sự kiện: `['update:modelValue', 'save']`

Slot: `default`

## DropdownMenu

Show Checkbox (Figma Menu List Item): ô tick bên trái, trạng thái theo item.checked

```js
defineProps({
  items:     { type: Array,             default: () => [] },
  placement: { type: String,            default: 'bottom-start' }, // 'bottom-start' | 'bottom-end'
  activeId:  { type: [String, Number],  default: null },
  minWidth:  { type: Number,            default: 0 },
  /** Menu List có checkbox (chọn nhiều): mỗi mục 1 ô tick bên trái theo item.checked — thay cho dấu ✓ cuối dòng */
  checkbox:  { type: Boolean,           default: false },
})
```
Sự kiện: `['select', 'update:open']`

Slot: `trigger`

## DtCellError

Ô sửa trực tiếp trong DataTable có lỗi (VD bắt buộc mà bị xóa trắng) — cùng quy chuẩn báo lỗi của input (utils/fieldError.js):

```js
defineProps({
  message: { type: String,  default: '' },    // rỗng = không lỗi
  icon:    { type: Boolean, default: true },  // false khi control con tự vẽ icon lỗi (AppCombobox)
})
```
Slot: `default`

## EmptyArt

Hình minh họa trạng thái trống (quy chuẩn /ds/empty-state) — SVG vẽ sẵn, đúng tỉ lệ, màu theo token (đổi theme tự đổi):

```js
defineProps({
  /** 'doc' | 'cleared' | 'search' | 'chart' */
  variant: { type: String, default: 'doc' },
  /** Bề rộng px (cao = 0,8 × rộng) — mặc định 120, màn lần đầu dùng 160 */
  width:   { type: Number, default: 120 },
})
```

## ErrorTip

Tooltip lỗi: nền đỏ chữ trắng, nổi phía dưới control (không chiếm chỗ trong form)

```js
defineProps({
  open:    { type: Boolean, default: false },
  message: { type: String,  default: '' },
  anchor:  { type: Object,  default: null },   // element control để canh vị trí
})
```

## FilterConditionEditor

Ô nhập 1 điều kiện lọc: toán tử (theo kiểu trường) + giá trị — DÙNG CHUNG cho bộ lọc Advance (TableFilterPanel) và lọc theo cột trên tiêu đề (DataTable)

```js
defineProps({
  /** Trường lọc: { key, label, type: 'text' | 'enum' | 'number' | 'date', options? } */
  field:      { type: Object, required: true },
  /** Điều kiện: { id, key, op, value, value2 } (v-model) */
  modelValue: { type: Object, required: true },
})
```
Sự kiện: `['update:modelValue', 'enter']`


## IconMisaAI

MISA AI (AVA) — exact SVG từ Figma node 20062:2582


## OverflowActions

Dãy nút thao tác tự co theo bề rộng: nút nào không đủ chỗ → gom vào nút ⋯ (bấm xổ menu). Nút “nguy hiểm” (danger) luôn xếp cuối

```js
defineProps({
  actions:   { type: Array,  default: () => [] },
  moreLabel: { type: String, default: 'Thao tác khác' },
  gap:       { type: Number, default: 8 },
})
```
Sự kiện: `['select']`


## PageSkeleton

Khung xương khi chờ tải trang / dữ liệu — CHỈ phủ vùng nội dung (cha position: relative), header + sidebar giữ nguyên.

```js
defineProps({
  /** 'list' (trang danh sách) | 'dashboard' (màn Tổng quan) */
  variant: { type: String, default: 'list' },
  cards: { type: Number, default: 4 },   // 0 = không có dãy card
  rows:  { type: Number, default: 8 },
})
```

## RouteProgress

Thanh tiến trình mảnh trên cùng khi chuyển trang (quy chuẩn) — đặt 1 lần ở App.vue


## StickyNotes

StickyNotes — ghi chú nhanh: nút nổi kéo được + panel màu vàng post-it (kéo, đổi cỡ). Dùng chung mds-docs (/ds) và app Chấm điểm.

```js
defineProps({
  /** Người đang đăng nhập ({ id }) — null: ghi chú chỉ lưu trên trình duyệt */
  user: { type: Object, default: null },
  loginUrl: { type: String, default: '/dang-nhap' },
  /** API đồng bộ ghi chú theo tài khoản: GET / POST / PUT :id / DELETE :id */
  api: { type: String, default: '/api/ds/notes' },
  /** Tiền tố khóa localStorage — mỗi app một tiền tố để ghi chú / vị trí nút của các app cùng tên miền không đè nhau */
  storagePrefix: { type: String, default: 'mds-sticky' },
})
```

## SubNavTabs

Tab hàng sub-nav: hiện số tab vừa chỗ, phần tràn gom vào "Xem thêm (n)" — tab đang chọn luôn hiện

```js
defineProps({
  items:      { type: Array, default: () => [] },
  modelValue: { type: [String, Number], default: null },
})
```
Sự kiện: `['update:modelValue', 'select']`

Slot: `tab`

## TIcon

Icon custom của MDS (tên mds-…): SVG gốc xuất từ Figma (icons/customIcons.js)

```js
defineProps({
  name:        { type: String, required: true },
  strokeWidth: { type: [Number, String], default: 1.5 },
})
```

## TableFilterPanel

Bộ lọc Advance (Figma “Body Filter / Advance Expand” 6019:136462) — chuyển nguyên từ app Chấm điểm (AdvancedFilterPanel):

```js
defineProps({
  /** [{ key, label, type: 'text' | 'enum' | 'number' | 'date', options?, multi?, get(row) }] */
  fields: { type: Array,  required: true },
  /** Bộ lọc đang áp: { mode: 'all' | 'any', conditions } — lọc dòng bằng testRow() trong utils/advancedFilter.js */
  filter: { type: Object, required: true },
  /** Bộ lọc đã lưu (tuỳ chọn): [{ id, label, filter: { mode, conditions } }] */
  saved:  { type: Array,  default: () => [] },
  /** Thao tác nút … của bộ lọc đã lưu đang dùng → emit('saved-action', { action, item }) */
  savedActions: { type: Array, default: () => [{ id: 'rename', label: 'Đổi tên', icon: 'pencil' }, { id: 'delete', label: 'Xóa', icon: 'trash', danger: true }] },
})
```
Sự kiện: `['apply', 'close', 'saved-action']`


## TableFilterPopover

Bộ lọc Cơ bản — Figma MDS “Body Filter / Basic” (6019:136455): popover 320px xổ ngay dưới nút lọc (không đẩy bảng).

```js
defineProps({
  /** Trường lọc: [{ key, label, type?: 'select' (mặc định) | 'date' | 'daterange', options?: [{ value, label }], labels?: [từ, đến] }] */
  fields:     { type: Array, default: () => [] },
  /** Giá trị đang áp: { [key]: value | [from, to] } — '' = Tất cả */
  modelValue: { type: Object, default: () => ({}) },
  /** Nút lọc để neo popover (TableHeader emit('open-filter', el)) */
  anchor:     { default: null },
  /** 'vertical' (nhãn trên ô) | 'horizontal' (nhãn trái) */
  layout:     { type: String, default: 'vertical' },
})
```
Sự kiện: `['update:modelValue', 'apply', 'close']`


## TableFilterTags

Dòng điều kiện đang lọc — Figma “_Conditonal Filter / Box” (6019:136495): mỗi điều kiện 1 tag

```js
defineProps({
  /** Điều kiện đang áp (đã nhập đủ): [{ id, key, op, value, value2 }] */
  active:   { type: Array,    required: true },
  mode:     { type: String,   default: 'all' },
  /** key → field { label, type, options } */
  fieldOf:  { type: Function, required: true },
  /** Định dạng ngày ISO → hiển thị (mặc định DD/MM/YYYY) */
  fmtDate:  { type: Function, default: undefined },
  /** Hiện link “Sửa bộ lọc” (mở lại panel bộ lọc) */
  editable: { type: Boolean,  default: true },
})
```
Sự kiện: `['remove', 'clear', 'edit']`


## TableHeader

── BULK ACTION MODE: đè lên toàn bộ nội dung header ──

```js
defineProps({
  modelValue:         { type: String,  default: '' },
  searchPlaceholder:  { type: String,  default: 'Tìm kiếm...' },
  searchWidth:        { type: Number,  default: 240 },
  search:             { type: Boolean, default: true },
  mainFunctionButton: { type: Boolean, default: false },
  bulkAction:         { type: Boolean, default: false },
  selectedCount:      { type: Number,  default: 0 },
  /** Tổng số bản ghi của danh sách (mọi trang, sau khi lọc) — cần để hiện “Chọn tất cả trên DS” */
  totalCount:         { type: Number,  default: 0 },
  /** Đã tick hết các dòng của trang đang xem */
  pageAllSelected:    { type: Boolean, default: false },
  /** Đang chọn tất cả bản ghi trên mọi trang */
  allPagesSelected:   { type: Boolean, default: false },
  /** Ẩn nút "Gợi ý AI" (app chưa có tính năng AI) */
  hideAi:             { type: Boolean, default: false },
  /** Số điều kiện lọc nâng cao đang áp dụng → badge trên nút Bộ lọc */
  filterCount:        { type: Number,  default: 0 },
  /** Bộ lọc (popover / panel) đang mở → nút lọc hiện Brand Outline */
  filterOpen:         { type: Boolean, default: false },
  /** Có hàng thống kê phía trên bảng → nút ẩn / hiện (true = đang hiện, false = đang ẩn, null = không có nút) */
  chartsVisible:      { type: Boolean, default: null },
  /** Kiểu ô tìm kiếm: 'normal' (Tìm kiếm thường) | 'ai' (Tìm kiếm thông minh — AI Searchbox; Enter → @ai-search(câu hỏi)) */
  searchMode:         { type: String,  default: 'normal' },
  aiPlaceholder:      { type: String,  default: 'Tìm kiếm thông minh' },
  /** Điều kiện AI bóc tách (popup khi bấm icon phân tích): [{ label: 'Trạng thái', value: 'Chưa ghi sổ' }, …] — app đặt sau khi nhận @ai-analyze(câu) */
  aiParsed:           { type: Array,   default: () => [] },
  aiAnalyzing:        { type: Boolean, default: false },
  /** Kết quả tìm kiếm thông minh theo nhóm — popover “Kết quả tìm kiếm với AI” như ô ở /ds/search-box: [{ key, title, total, items: [{ id, name, subtitle, meta, avatar }] }] (null = chưa tìm) */
  aiResults:          { type: Array,   default: null },
  aiLoading:          { type: Boolean, default: false },
  /** Popup “Xem thêm” của 1 nhóm kết quả: toàn bộ kết quả của nhóm đó (null = đang nạp) — app nạp khi nhận @ai-more(group, câu) */
  aiMoreItems:        { type: Array,   default: null },
  aiMoreTotal:        { type: Number,  default: null },
  aiMoreLoading:      { type: Boolean, default: false },
  /** true (mặc định): Enter → popover kết quả theo nhóm · false: Enter chỉ emit @ai-search, app tự lọc chính bảng (không popover) */
  aiResultsPanel:     { type: Boolean, default: true },
  /** Ẩn nút công cụ không dùng: 'refresh' | 'export' | 'col-settings' | 'filter' */
  hideTools:          { type: Array,   default: () => [] },
})
```
Sự kiện: `['update:modelValue', 'show-ai', 'refresh', 'toggle-charts', 'export', 'col-settings', 'open-filter', 'deselect-all', 'select-all-pages', 'ai-search', 'ai-analyze', 'ai-clear', 'ai-select', 'ai-more']`

Slot: `bulk-buttons`, `default`, `export-icon`, `main-buttons`, `filters`

## TablePaging

Basic: khoảng “1 - 10” + 4 nút · Advance (Figma Paging Type=Advance): bỏ khoảng, thêm dãy số trang giữa nút trước / sau

```js
defineProps({
  total:           { type: Number, default: 0 },
  page:            { type: Number, default: 1 },
  pageSize:        { type: Number, default: 20 },
  pageSizeOptions: { type: Array,  default: () => [20, 50, 100] },
  /** 'basic' (mặc định — ngắn gọn: khoảng 1 - 10 + nút trước / sau) | 'advance' (dạng số: 1 … 5 6 7 … 20 — app cần xử lý / xuất khẩu lần lượt từng trang, VD Kế toán) */
  type:            { type: String, default: 'basic' },
})
```
Sự kiện: `['update:page', 'update:pageSize']`


## TableSettingsDrawer

Thiết lập bảng — Figma MDS (19929:26845): drawer phải · tìm cột · bảng cột: kéo thả đổi thứ tự, tick ẩn / hiện, đổi tên hiển thị,

```js
defineProps({
  title:    { type: String, default: 'Thiết lập bảng' },
  /** Cột hiện tại: [{ key, label, field? (tên trường gốc — mặc định = label), width?, hidden?, pinned?, locked? (không cho ẩn) }] — bỏ qua cột tick chọn */
  columns:  { type: Array, default: () => [] },
  /** Cấu hình mặc định để “Lấy lại mặc định” (cùng dạng columns) */
  defaults: { type: Array, default: null },
  /** Thiết lập dòng (gom nhóm): [{ value, label }] — bỏ trống thì ẩn phần này */
  groupOptions: { type: Array, default: () => [] },
  groupBy:  { default: '' },
})
```
Sự kiện: `['save', 'close']`

