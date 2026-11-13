<!-- source: Design tokens (Figma Variables → CSS) -->
# Design Tokens — MDS Web Components v2.0 (đầy đủ)

Nguồn: Figma **MDS Web Components v2.0** (`1DP5RJM3MsZJ8SnUWgTavS`) › Variables, Effect Styles, Text Styles — đọc trực tiếp bằng Plugin API ngày 2026-10-29.
Thư viện `mds-ui/src/style.css` đã đồng bộ phần màu, shadow, bo góc, cỡ chữ theo bảng dưới.

**Cách dùng:** trong code CHỈ dùng token ngữ nghĩa (`--text-*`, `--icon-*`, `--bg-*`, `--stroke-*`, `--shadow-card`, `--shadow-popover`, `--radius-*`, `--gap-control`…). Thang màu gốc (`--brand-600`, `--neutral-400`, `--info-700`…) chỉ để tham chiếu / định nghĩa token, không dùng trực tiếp trong component trừ khi không có token ngữ nghĩa phù hợp.

Bộ biến Figma:

| Bộ | Số biến | Mode |
|---|---|---|
| 🖌️ Base Colors | 118 | 1 |
| 🎨 Themes | 136 | Blue (mặc định) · Green · Blue gray · Teal · Cyan · Indigo · Purple · Pink · Red · Orange |
| 📏 Space | 319 | Standard (= Trung bình) · Nhỏ · Comfortable (= Rộng) · Mobile Responsive |
| 🔢 Font Size | 21 | Small (= web mặc định) · Medium · Large · Mobile Responsive |
| 🅰️ Font Family | 8 | Inter |
| #️⃣ Number | 90 | thang số 0–320 (spacing, width-height, icon size, border width) |
| 🌈 Chart Colors | 70 | Palette · Single Hue · Divergent |

---

## 1. Toàn bộ token CSS (`mds-ui/src/style.css`)

```css
:root {
  /* ════════════════════════════════════════════════════════════════════════
     MÀU — đồng bộ 100% Figma MDS Web Components v2.0 › Variables
     (🖌️ Base Colors + 🎨 Themes). Thang --brand-* đổi theo theme (xem Theme Overrides);
     token ngữ nghĩa (--text-*, --icon-*, --stroke-*, --bg-*) tham chiếu thang → tự đổi theo theme.
     ⛔ Không gõ mã màu tay trong component — chỉ dùng token ngữ nghĩa.
  ════════════════════════════════════════════════════════════════════════ */

  /* ── Base Colors ── */
  --brand-50:  #f0f6fe; --brand-100: #ddeafc; --brand-200: #c2dbfb; --brand-300: #99c5f7; --brand-400: #68a6f2;
  --brand-500: #4584ec; --brand-600: #245fdf; --brand-700: #2753ce; --brand-800: #2644a7; --brand-900: #243d84;

  --neutral-50:  #fbfbfc; --neutral-100: #f4f4f6; --neutral-150: #f2f2f4; --neutral-200: #ecedef; --neutral-250: #e6e7ea;
  --neutral-300: #e5e6e9; --neutral-350: #d7dade; --neutral-400: #ced1d6; --neutral-450: #b6bac1; --neutral-500: #9da2ac;
  --neutral-600: #8f949d; --neutral-700: #6b707a; --neutral-800: #484e59; --neutral-900: #303642; --neutral-950: #10141b;

  --info-50: #f5faff; --info-100: #eff8ff; --info-200: #d1e9ff; --info-300: #b2ddff; --info-400: #84caff; --info-500: #53b1fd;
  --info-600: #2e90fa; --info-700: #1570ef; --info-800: #175cd3; --info-900: #1849a9; --info-950: #194185;
  --warning-50: #fffcf5; --warning-100: #fffaeb; --warning-200: #fef0c7; --warning-300: #fedf89; --warning-400: #fec84b; --warning-500: #fdb022;
  --warning-600: #f79009; --warning-700: #dc6803; --warning-800: #b54708; --warning-900: #93370d; --warning-950: #7a2e0e;
  --danger-50: #fffbfa; --danger-100: #fef3f2; --danger-200: #fee4e2; --danger-300: #fecdca; --danger-400: #fda29b; --danger-500: #f97066;
  --danger-600: #f04438; --danger-700: #d92d20; --danger-800: #b42318; --danger-900: #912018; --danger-950: #7a271a;
  --success-50: #f6fef9; --success-100: #ecfdf3; --success-200: #d1fadf; --success-300: #a6f4c5; --success-400: #6ce9a6; --success-500: #32d583;
  --success-600: #12b76a; --success-700: #039855; --success-800: #027a48; --success-900: #05603a; --success-950: #054f31;
  --accent-50: #fcfaff; --accent-100: #f9f5ff; --accent-200: #f4ebff; --accent-300: #e9d7fe; --accent-400: #d6bbfb; --accent-500: #b692f6;
  --accent-600: #9e77ed; --accent-700: #7f56d9; --accent-800: #6941c6; --accent-900: #53389e; --accent-950: #42307d;
  --ai-begin-50: #edf9ff; --ai-begin-100: #d7efff; --ai-begin-200: #b9e5ff; --ai-begin-300: #88d6ff; --ai-begin-400: #50beff; --ai-begin-500: #289eff;
  --ai-begin-600: #1482ff; --ai-begin-700: #0a68eb; --ai-begin-800: #0f53be; --ai-begin-900: #134995; --ai-begin-950: #112d5a;
  --ai-end-50: #fef2ff; --ai-end-100: #fae3ff; --ai-end-200: #f6c6ff; --ai-end-300: #f499ff; --ai-end-400: #ee5dff; --ai-end-500: #e021ff;
  --ai-end-600: #cf11ff; --ai-end-700: #aa00cf; --ai-end-800: #8c00a9; --ai-end-900: #760689; --ai-end-950: #4f005e;

  --alpha-white-0: #ffffff00; --alpha-white-50: #ffffff0d; --alpha-white-100: #ffffff1a; --alpha-white-200: #ffffff33; --alpha-white-300: #ffffff4d;
  --alpha-white-400: #ffffff66; --alpha-white-500: #ffffff80; --alpha-white-600: #ffffff99; --alpha-white-700: #ffffffb2; --alpha-white-800: #ffffffcc;
  --alpha-white-900: #ffffffe5; --alpha-white-950: #fffffff2;
  --alpha-black-0: #00000000; --alpha-black-50: #0000000d; --alpha-black-100: #0000001a; --alpha-black-200: #00000033; --alpha-black-300: #0000004d;
  --alpha-black-400: #00000066; --alpha-black-500: #00000080; --alpha-black-600: #00000099; --alpha-black-700: #000000b2; --alpha-black-800: #000000cc;
  --alpha-black-900: #000000e5; --alpha-black-950: #000000f2;
  --black: #000000; --white: #ffffff;

  /* ── TEXT — chữ trung tính CHỈ 3 loại: primary (nội dung, tiêu đề, nhãn) · secondary (mô tả phụ, ngày, caption) · hint (placeholder)
     ⛔ Không dùng token brand/accent cho chữ trung tính · không hardcode hex từ ảnh/Figma ── */
  --text-primary:          var(--neutral-950);
  --text-secondary:        var(--neutral-700);
  --text-hint:             var(--neutral-500);
  --text-disabled:         var(--neutral-500);
  --text-brand:            var(--brand-600);
  --text-brand-disabled:   var(--brand-400);
  --text-link:             var(--brand-600);   /* link mang màu thương hiệu (theme Green: brand-700) */
  --text-link-default:     var(--info-700);    /* link xanh mặc định, không theo theme */
  --text-link-disabled:    var(--brand-400);
  --text-link-hover:       var(--brand-800);   /* Text/Link Action Hover */
  --text-link-default-hover: var(--info-800);  /* Text/Link Action Blue Hover */
  --text-white:            var(--white);
  --text-white-disabled:   var(--alpha-white-700);
  --text-info:             var(--info-700);     --text-info-disabled:    var(--info-400);
  --text-warning:          var(--warning-700);  --text-warning-disabled: var(--warning-400);
  --text-danger:           var(--danger-600);   --text-danger-disabled:  var(--danger-400);
  --text-success:          var(--success-700);  --text-success-disabled: var(--success-400);
  --text-accent:           var(--accent-600);   --text-accent-disabled:  var(--accent-400);

  /* ── AI ── */
  --text-ai:              var(--ai-grad-600);   /* GRADIENT (AI Begin 600 → AI End 600, như nút AI) — chữ dùng class .text-ai-primary */
  --icon-ai:              var(--ai-grad-600);   /* GRADIENT — icon dùng class .ti--ai + ensureAiGradient() */
  --stroke-ai:            var(--ai-grad-600);   /* GRADIENT — viền: border 1px solid transparent + background: var(--ai-border-on-white | --ai-border-on-ai-light) */
  --bg-ai-light:          rgba(20, 130, 255, 0.06);
  --bg-ai-gradient:       linear-gradient(110deg, var(--ai-begin-600) 9%, var(--ai-end-600) 100%);    /* chữ / chấm / thanh chỉ báo AI */
  --bg-ai-gradient-light: linear-gradient(111deg, var(--ai-begin-50) 8.87%, #fee2ff 100%);            /* nền khối nội dung AI (khung phân tích AVA…) — cùng hover của btn--ai-outline */

  /* ── ICON ── */
  --icon-neutral:          var(--neutral-700);
  --icon-neutral-hover:    var(--brand-600);
  --icon-neutral-disabled: var(--neutral-400);
  --icon-brand:            var(--brand-600);  --icon-brand-hover:   var(--brand-500);   --icon-brand-disabled:   var(--brand-400);
  --icon-link:             var(--brand-700);  --icon-link-default:  var(--info-700);    --icon-link-disabled:    var(--brand-400);
  --icon-white:            var(--white);      --icon-white-hover:   var(--alpha-white-500); --icon-white-disabled: var(--alpha-white-700);
  --icon-info:             var(--info-700);     --icon-info-hover:    var(--info-500);    --icon-info-disabled:    var(--info-400);
  --icon-warning:          var(--warning-700);  --icon-warning-hover: var(--warning-500); --icon-warning-disabled: var(--warning-400);
  --icon-danger:           var(--danger-600);   --icon-danger-hover:  var(--danger-500);  --icon-danger-disabled:  var(--danger-400);
  --icon-success:          var(--success-700);  --icon-success-hover: var(--success-500); --icon-success-disabled: var(--success-400);
  --icon-accent:           var(--accent-600);   --icon-accent-hover:  var(--accent-500);  --icon-accent-disabled:  var(--accent-400);

  /* ── BACKGROUND ── */
  --bg-page:              var(--neutral-150);   /* BG/Page */
  --bg-white:             var(--white);
  --bg-black:             var(--black);
  --dt-header-bg:         var(--neutral-150);   /* BG/Table Header (theme khác Blue: neutral-200) */
  --dt-footer-bg:         var(--neutral-150);   /* BG/Table Footer */
  --bg-brand:             var(--brand-600);
  --bg-brand-hover:       var(--brand-700);     /* nút chính khi hover */
  --bg-brand-pressed:     var(--brand-800);     /* nút chính khi nhấn */
  /* HOVER: nền thường → hover --bg-brand-light, nhấn --bg-brand-light-hover; nền ĐANG Brand Light → hover --bg-brand-light-hover, nhấn --bg-brand-light-pressed (không dùng neutral cho hover; trừ header / sidebar tối / Danger·Warning·Success·Info·AI) */
  --bg-brand-light:       var(--brand-50);      /* mục đang chọn · hover của mọi control nền thường */
  --bg-brand-light-hover: var(--brand-100);
  --bg-brand-light-pressed: var(--brand-200);
  --bg-brand-disable:     var(--brand-400);
  --bg-neutral:           var(--neutral-600);
  --bg-neutral-light:     var(--neutral-150);   /* hover nút icon / nút trung tính, mục Sub Menu */
  --bg-neutral-hover:     var(--neutral-200);   /* BG/Neutral/Neutral Light Hover */
  --bg-neutral-pressed:   var(--neutral-250);   /* BG/Neutral/Neutral Light Pressed */
  --bg-neutral-disable:   var(--neutral-400);
  --bg-info:    var(--info-700);    --bg-info-hover:    var(--info-800);    --bg-info-pressed:    var(--info-900);
  --bg-info-light:    var(--info-100);    --bg-info-light-hover:    var(--info-200);    --bg-info-light-pressed:    var(--info-300);    --bg-info-disable:    var(--info-400);
  --bg-warning: var(--warning-600); --bg-warning-hover: var(--warning-700); --bg-warning-pressed: var(--warning-800);
  --bg-warning-light: var(--warning-100); --bg-warning-light-hover: var(--warning-200); --bg-warning-light-pressed: var(--warning-300); --bg-warning-disable: var(--warning-400);
  --bg-danger:  var(--danger-600);  --bg-danger-hover:  var(--danger-700);  --bg-danger-pressed:  var(--danger-800);
  --bg-danger-light:  var(--danger-100);  --bg-danger-light-hover:  var(--danger-200);  --bg-danger-light-pressed:  var(--danger-300);  --bg-danger-disable:  var(--danger-400);
  --bg-success: var(--success-600); --bg-success-hover: var(--success-700); --bg-success-pressed: var(--success-800);
  --bg-success-light: var(--success-100); --bg-success-light-hover: var(--success-200); --bg-success-light-pressed: var(--success-300); --bg-success-disable: var(--success-400);
  --bg-accent:  var(--accent-600);  --bg-accent-hover:  var(--accent-600);  --bg-accent-pressed:  var(--accent-700);
  --bg-accent-light:  var(--accent-100);  --bg-accent-light-hover:  var(--accent-200);  --bg-accent-light-pressed:  var(--accent-300);  --bg-accent-disable:  var(--accent-400);

  /* ── STROKE ── */
  --stroke-neutral:         var(--neutral-400);   /* viền ô nhập, nút outline, avatar có ảnh */
  --stroke-neutral-light:   var(--neutral-300);
  --stroke-neutral-disable: var(--neutral-200);
  --stroke-divider:         var(--neutral-300);   /* Divider */
  --stroke-brand:           var(--brand-600);     /* viền focus, đang chọn */
  --stroke-brand-light:     var(--brand-300);
  --stroke-brand-disabled:  var(--brand-400);
  --stroke-white:           var(--white);
  --stroke-white-disabled:  var(--alpha-white-700);
  --stroke-info:    var(--info-700);    --stroke-info-light:    var(--info-300);    --stroke-info-disabled:    var(--info-400);
  --stroke-warning: var(--warning-700); --stroke-warning-light: var(--warning-300); --stroke-warning-disabled: var(--warning-400);
  --stroke-danger:  var(--danger-600);  --stroke-danger-light:  var(--danger-300);  --stroke-danger-disabled:  var(--danger-400);
  --stroke-success: var(--success-700); --stroke-success-light: var(--success-300); --stroke-success-disabled: var(--success-400);
  --stroke-accent:  var(--accent-600);  --stroke-accent-light:  var(--accent-300);  --stroke-accent-disabled:  var(--accent-400);

  /* Bo góc — Figma Space › Radius (Nhỏ: default 6 · inner 4 · focus 8) */
  --radius-sm:      4px;     /* Radius/Small */
  --radius-inner:   6px;     /* Radius/Inner — bo của phần tử nằm sát TRONG khối bo 8 cách 2px (bo trong = bo ngoài − đệm): tag trong Combobox, mục trong khung nhóm… */
  --radius-default: 8px;     /* Radius/Defaullt — control */
  --radius-focus:   12px;    /* Radius/Focus — vòng focus quanh control */
  --radius-dialog:  12px;    /* Radius/Dialog — popup / dialog / popover nổi: 12 mọi mật độ (chỉ popup, dialog mới bo 12) */
  --radius-pill:    9999px;  /* Radius/Pill */

  --btn-height:     32px;
  --btn-min-width:  80px;
  --btn-px:         12px;
  --btn-gap:        8px;

  --input-height:   32px;
  --input-px:       12px;
  --tab-px:         12px;   /* Components/Tabs/Medium/Padding-Horizontal: 12 · Nhỏ 12 · Rộng 20 */
  --tab-h:          36px;   /* Components/Tabs/Medium/Fix-Height: 36 · Nhỏ 36 · Rộng 40 */
  /* DataTable row heights — chỉ --dt-row-height bị ảnh hưởng bởi density setting */
  --dt-row-height:  32px;   /* 1-line: thay đổi theo compact/comfortable */
  --dt-row-height-2: 56px;  /* 2-line (subtext, avatar+subtext): CỐ ĐỊNH, không đổi theo density */
  --dt-row-height-3: 72px;  /* 3-line: CỐ ĐỊNH */
  --dt-footer-h:    36px;   /* Patterns/DataTable/Fix-Height-Footer: 36 · Nhỏ 32 · Rộng 40 */
  --paging-px:      16px;   /* Patterns/DataTable/Padding-Paging-Horizontal: 16 · Nhỏ 12 · Rộng 16 */
  --paging-h:       48px;   /* Components/Pagination/Overflow/Fix-Height: 48 · Nhỏ 40 · Rộng 56 */
  --input-py:       8px;
  --input-label-gap:4px;   /* label → control */

  --card-px:        16px;
  --card-py:        16px;
  --card-gap:       12px;
  --card-col-gap:   16px;   /* card ↔ card: LUÔN 16px */

  /* ── Quy chuẩn khoảng cách chung (KHÔNG đổi theo density) ── */
  --radius-card:    8px;     /* card / khối trắng trên BG Page + bo góc thường: Radius/Default 8 — cố định mọi mật độ (Nhỏ không về 6) */
  --gap-control:    8px;     /* control ↔ control đặt cạnh nhau: Button–Button, Button–Textbox, Searchbox–Combobox… */
  --page-gutter:    16px;    /* vùng nội dung ↔ sidebar / lề phải / lề dưới trình duyệt */
  --box-padding:    16px;    /* đệm TRONG mọi card / khối nền (card, khối AI, ô hồ sơ, mục lục…): ĐỀU 4 phía, không trên-dưới 1 số trái-phải 1 số */
  /* Form (Figma MDS Input Group) */
  --form-label-w:      200px; /* form ngang: nhãn trái rộng 200px */
  --form-label-gap-h:  8px;   /* form ngang: nhãn → ô nhập */
  --form-row-gap-h:    12px;  /* form ngang: giữa các hàng */
  --form-row-gap-v:    16px;  /* form dọc: giữa các trường (nhãn trên → ô dưới cách 4px = --input-label-gap) */
  --form-group-gap:    32px;  /* giữa 2 NHÓM trường trong cùng 1 card — xa hơn hẳn khoảng cách hàng để thấy rõ phân cấp */
  --form-group-title-gap: 12px; /* tiêu đề nhóm → lưới trường */
  /* Menu xổ ra (Figma MDS Dropdown Menu 6019:42469, cập nhật 2026-10-30) — menu 3 chấm, chuột phải, danh sách combobox, menu cột bảng…
     Biến Figma: Components/Menu List/* · Comfortable đổi ở khối [data-density="comfortable"] */
  --menu-pad:          8px;   /* đệm khung danh sách (Spacing-Padding/8px) */
  --menu-gap:          0px;   /* giữa các item — Figma xếp sát nhau (7 item × 32 = 224) */
  --menu-item-h:       32px;  /* Fix-Height-1-Line: 32 (Nhỏ cũng 32) · Rộng 36 — KHÔNG theo --btn-height */
  --menu-item-h-2:     48px;  /* Fix-Height-2-Line (item có dòng phụ) · Rộng 52 */
  --menu-item-px:      12px;  /* Padding-Text-Horizontal · Rộng 16 */
  --menu-item-gap:     8px;   /* Gap-Content: icon ↔ chữ */
  --menu-icon:         20px;  /* icon trái item */
  --menu-sep-my:       4px;   /* Padding-Vertical-Small: divider ngang cách item trên / dưới · Rộng 8 */
  --menu-radius:       var(--radius-default);   /* khung + item: Radius/Defaullt (8 · Nhỏ 6) */
  --menu-min-w:        80px;  /* Min-Width · Rộng 96 */

  --dialog-px:      24px;
  --dialog-py:      16px;

  --layout-header-h:      48px;
  --layout-sidebar-w:     200px;
  --layout-sidebar-sm-w:  64px;
  --layout-page-header-h: 56px;

  /* Inter Variable v4+: tên chính = InterVariable; 'Inter var' = alias cũ */
  --font-family: InterVariable, 'Inter var', sans-serif;
  --text-h1: 24px; --text-h1-lh: 36px;
  --text-h2: 20px; --text-h2-lh: 28px;
  --text-h3: 16px; --text-h3-lh: 22px;
  --text-body: 13px; --text-body-lh: 20px;
  --text-body-md: 14px; --text-body-md-lh: 20px;
  --text-sm: 12px; --text-sm-lh: 16px;
  /* Text styles Figma (Font Size mode Small = mặc định web): H1 24/32 · H2 20/28 · H3 16/22 (Semi Bold) ·
     Body Regular 13/20 · Body Small 12/18 · Body Medium 14/20 · Body Large 16/24 · Caption 10/15 · Overline 11/16 */
  --text-body-lg: 16px; --text-body-lg-lh: 24px;
  --text-body-sm-lh: 18px;
  --text-caption: 10px; --text-caption-lh: 15px;

  --fw-regular:  400;
  --fw-medium:   500;
  --fw-semibold: 600;
  --fw-bold:     700;


  /* ── Chart color palette ── */
  --chart-c1: #245fdf;  /* brand blue   */
  --chart-c2: #12b76a;  /* success green */
  --chart-c3: #f79009;  /* warning orange */
  --chart-c4: #f04438;  /* danger red    */
  --chart-c5: #0ba5ec;  /* info cyan     */
  --chart-c6: #7a5af8;  /* accent purple */
  /* Màu chính của biểu đồ theo theme (thước đo chính: cột / đường điểm…) — các màu trạng thái c2–c4 giữ cố định.
     --chart-target: đường mục tiêu / kỳ vọng nét đứt đi kèm; theme Cam đổi sang tím để không trùng màu chính (đã kiểm tra bằng validator ΔE). */
  --chart-primary: var(--bg-brand);
  --chart-target:  var(--chart-c3);

  /* ── Shadow — Figma Effect Styles "Drop Shadow / Neutral / …" (màu Alpha Black/100) ── */
  --shadow-all-2:     0 0 2px 0 var(--alpha-black-100);
  --shadow-all-4:     0 0 4px 0 var(--alpha-black-100);
  --shadow-all-8:     0 0 8px 0 var(--alpha-black-100);
  --shadow-all-12:    0 0 12px 0 var(--alpha-black-100);
  --shadow-bottom-2:  0 1px 2px 0 var(--alpha-black-100);
  --shadow-bottom-4:  0 1px 4px 0 var(--alpha-black-100);
  --shadow-bottom-8:  0 2px 8px 0 var(--alpha-black-100);
  --shadow-bottom-12: 0 4px 12px 0 var(--alpha-black-100);
  --shadow-bottom-16: 0 4px 16px 0 var(--alpha-black-100);
  --shadow-bottom-20: 0 6px 20px 0 var(--alpha-black-100);
  --shadow-top-4:     0 -1px 4px 0 var(--alpha-black-100);
  --shadow-top-8:     0 -2px 8px 0 var(--alpha-black-100);
  --shadow-top-12:    0 -4px 12px 0 var(--alpha-black-100);
  --shadow-right-4:   1px 0 4px 0 var(--alpha-black-100);
  --shadow-right-8:   2px 0 8px 0 var(--alpha-black-100);
  --shadow-right-12:  4px 0 12px 0 var(--alpha-black-100);
  --shadow-left-4:    -1px 0 4px 0 var(--alpha-black-100);
  --shadow-left-8:    -2px 0 8px 0 var(--alpha-black-100);
  --shadow-left-12:   -4px 0 12px 0 var(--alpha-black-100);
  /* Tên theo vai trò — DÙNG CÁC TOKEN NÀY trong component */
  --shadow-card:    var(--shadow-all-2);       /* khối trắng trên nền --bg-page */
  --shadow-popover: var(--shadow-bottom-12);   /* menu xổ ra, popover nổi */
  /* Token cũ (giữ để không vỡ code cũ — code mới dùng tên theo vai trò ở trên) */
  --shadow-sm:     var(--shadow-bottom-2);    /* tương thích code cũ → token Figma Bottom 2 */
  --shadow-md:     var(--shadow-bottom-8);    /* tương thích code cũ → Bottom 8 (nổi khi rê chuột) */
  --shadow-lg:     var(--shadow-bottom-12);   /* tương thích code cũ → Bottom 12 (lớp nổi) */
  --shadow-dialog: var(--shadow-bottom-12);   /* Popup / Dialog = Figma Drop Shadow/Neutral/Bottom 12: 0 4px 12px 0 Alpha Black 100 (rgba 0,0,0,.10) */
}

/* ── Theme Overrides — Figma 🎨 Themes (10 mode: Blue mặc định · Green · Blue gray · Teal · Cyan · Indigo · Purple · Pink · Red · Orange).
   Chỉ đổi thang --brand-* (+ vài ánh xạ khác Blue theo Figma); mọi token ngữ nghĩa brand tự đổi theo. ── */
:root[data-theme="green"] {
  --brand-50: #e6f5ef; --brand-100: #cdeadf; --brand-200: #a8d9c8; --brand-300: #7cc7ae; --brand-400: #59b89a;
  --brand-500: #2fa77a; --brand-600: #0e9a62; --brand-700: #0b7d52; --brand-800: #0b5a3d; --brand-900: #0a4a33;
  --text-link: var(--brand-700); --dt-header-bg: var(--neutral-200);
}
:root[data-theme="blue-gray"] {
  --brand-50: #f5f5fa; --brand-100: #eeeff7; --brand-200: #d5d9eb; --brand-300: #babfde; --brand-400: #9aa2d0;
  --brand-500: #717bbc; --brand-600: #4e5ba6; --brand-700: #3e4784; --brand-800: #363f72; --brand-900: #293056;
  --bg-brand-hover: var(--brand-800); --bg-brand-pressed: var(--brand-900); --dt-header-bg: var(--neutral-200);
}
:root[data-theme="teal"] {
  --brand-50: #f1fefc; --brand-100: #e8fdfa; --brand-200: #9af5e2; --brand-300: #5fe9d0; --brand-400: #2ed3ba;
  --brand-500: #15b7a1; --brand-600: #0e9384; --brand-700: #10756b; --brand-800: #125d57; --brand-900: #134e49;
  --bg-brand-hover: var(--brand-800); --bg-brand-pressed: var(--brand-900); --dt-header-bg: var(--neutral-200);
}
:root[data-theme="cyan"] {
  --brand-50: #f0fcff; --brand-100: #e5f9ff; --brand-200: #b9eefe; --brand-300: #7ce3fd; --brand-400: #36d6fa;
  --brand-500: #0cc1eb; --brand-600: #00a2cf; --brand-700: #017da3; --brand-800: #066986; --brand-900: #0b566f;
  --bg-brand-hover: var(--brand-800); --bg-brand-pressed: var(--brand-900); --dt-header-bg: var(--neutral-200);
}
:root[data-theme="indigo"] {
  --brand-50: #f0f2fe; --brand-100: #e7e9fe; --brand-200: #c2d9ff; --brand-300: #9dbeff; --brand-400: #759aff;
  --brand-500: #5576ff; --brand-600: #4155f5; --brand-700: #2a3ad8; --brand-800: #2534ae; --brand-900: #263389;
  --dt-header-bg: var(--neutral-200);
}
:root[data-theme="purple"] {
  --brand-50: #f6f3fb; --brand-100: #f0ecf9; --brand-200: #e1def6; --brand-300: #cac3ef; --brand-400: #ada0e5;
  --brand-500: #9179d9; --brand-600: #744ec7; --brand-700: #6e49b8; --brand-800: #5c3d9a; --brand-900: #4d347e;
  --bg-brand-hover: var(--brand-800); --bg-brand-pressed: var(--brand-900); --dt-header-bg: var(--neutral-200);
}
:root[data-theme="pink"] {
  --brand-50: #fbf3f8; --brand-100: #f9ecf3; --brand-200: #f5d5ec; --brand-300: #eeb3db; --brand-400: #e383c3;
  --brand-500: #d75daa; --brand-600: #c64691; --brand-700: #a82e72; --brand-800: #8c285e; --brand-900: #752651;
  --dt-header-bg: var(--neutral-200);
}
:root[data-theme="red"] {
  --brand-50: #fbf3f6; --brand-100: #f9ecef; --brand-200: #f5d5e2; --brand-300: #eeb3c9; --brand-400: #e284a5;
  --brand-500: #d55f85; --brand-600: #c34266; --brand-700: #a72f4d; --brand-800: #8b2941; --brand-900: #742739;
  --dt-header-bg: var(--neutral-200);
}
:root[data-theme="orange"] {
  --brand-50: #fef5f0; --brand-100: #feefe7; --brand-200: #fed7aa; --brand-300: #fdba74; --brand-400: #fb923c;
  --brand-500: #f97316; --brand-600: #ea580c; --brand-700: #c2410c; --brand-800: #9a3412; --brand-900: #7c2d12;
  --dt-header-bg: var(--neutral-200); --chart-target: var(--chart-c6);   /* cam chính trùng cam mục tiêu → mục tiêu dùng tím */
}

/* ── Density Overrides ── */
/* Background tint mode — dùng --bg-brand (màu chính, độ bão hòa nhất quán) ở tỷ lệ nhỏ
   Quy tắc: brand × 6% + base xám nhạt → tất cả theme cho độ sáng đồng đều, chỉ hue thay đổi */
:root[data-bg-tint="color"] {
  --bg-page:      color-mix(in srgb, var(--bg-brand) 3%, #F2F2F4);
  --dt-header-bg: color-mix(in srgb, var(--bg-brand) 4%, #E8EAEE);
  --dt-footer-bg: color-mix(in srgb, var(--bg-brand) 3%, #EBECF0);
}

/* Nhỏ: chiều cao control 28px */
:root[data-density="compact"] {
  --input-height:   28px;
  --btn-height:     28px;
  --dt-row-height:  32px;
  --dt-footer-h:    32px;
  --paging-px:      12px;
  --paging-h:       40px;
  --radius-default: 6px;
  --radius-inner:   4px;
  --radius-focus:   8px;
}
/* Comfortable: chiều cao control 36px */
:root[data-density="comfortable"] {
  --input-height:  36px;
  --btn-height:    36px;
  --btn-px:        14px;
  --dt-row-height: 36px;
  --dt-footer-h:   40px;
  --tab-px:        20px;
  --tab-h:         40px;
  --paging-h:      56px;
  --menu-item-h:   36px;   /* Menu List — Comfortable */
  --menu-item-h-2: 52px;
  --menu-item-px:  16px;
  --menu-sep-my:   8px;
  --menu-min-w:    96px;
}
```

---

## 2. Bảng ánh xạ Figma → CSS (màu)

| Figma | CSS | Blue (mặc định) |
|---|---|---|
| Text/Primary Neutral | `--text-primary` | Neutral/950 `#10141b` |
| Text/Secondary Neutral | `--text-secondary` | Neutral/700 `#6b707a` |
| Text/Hint Neutral, Disabled Neutral | `--text-hint`, `--text-disabled` | Neutral/500 `#9da2ac` |
| Text/Brand · Brand Disabled | `--text-brand` · `--text-brand-disabled` | Brand/600 · Brand/400 |
| Text/Link Brand | `--text-link` | Brand/600 (Green: Brand/700) |
| Text/Link Default | `--text-link-default` | Info/700 `#1570ef` |
| Text/Link Action Hover · Blue Hover | `--text-link-hover` · `--text-link-default-hover` | Brand/800 · Info/800 |
| Text/Info · Warning · Danger · Success · Accent | `--text-info` … `--text-accent` | Info/700 · Warning/700 · Danger/600 · Success/700 · Accent/600 |
| Text/… Disabled | `--text-*-disabled` | thang /400 |
| Icon/Neutral · Hover · Disabled | `--icon-neutral` · `--icon-neutral-hover` · `--icon-neutral-disabled` | Neutral/700 · Brand/600 · Neutral/400 |
| Icon/Brand · Hover · Disabled | `--icon-brand*` | Brand/600 · /500 · /400 |
| Icon/Info · Warning · Danger · Success · Accent (+ Hover /500, Disabled /400) | `--icon-*` | như Text |
| Stroke/Neutral · Neutral Light · Neutral Disable · Divider | `--stroke-neutral` · `--stroke-neutral-light` · `--stroke-neutral-disable` · `--stroke-divider` | Neutral/400 · /300 · /200 · /300 |
| Stroke/Brand · Brand Light · Brand Disabled | `--stroke-brand*` | Brand/600 · /300 · /400 |
| Stroke/Info · Warning · Danger · Success · Accent (+ Light /300, Disabled /400) | `--stroke-*` | như Text |
| BG/Brand/Brand · Hover · Pressed | `--bg-brand` · `--bg-brand-hover` · `--bg-brand-pressed` | Brand/600 · /700 · /800 (Blue gray, Teal, Cyan, Purple: /800 · /900) |
| BG/Brand/Brand Light · Light Hover · Light Pressed · Disable | `--bg-brand-light*` · `--bg-brand-disable` | Brand/50 · /100 · /200 · /400 |
| BG/Info · Warning · Danger · Success · Accent (Hover, Pressed, Light, Light Hover, Light Pressed, Disable) | `--bg-*` | xem khối CSS |
| BG/Neutral/Neutral · Light · Light Hover · Light Pressed · Disable | `--bg-neutral` · `--bg-neutral-light` · `--bg-neutral-hover` · `--bg-neutral-pressed` · `--bg-neutral-disable` | Neutral/600 · /150 · /200 · /250 · /400 |
| BG/Page · Table Header · Table Footer | `--bg-page` · `--dt-header-bg` · `--dt-footer-bg` | Neutral/150 (Table Header các theme khác Blue: Neutral/200) |
| BG/White · Black | `--bg-white` · `--bg-black` | |

### Thang Brand theo theme (Figma 🎨 Themes)

| Theme (`data-theme`) | 50 | 100 | 200 | 300 | 400 | 500 | **600 (chính)** | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|
| Blue (mặc định) | `#f0f6fe` | `#ddeafc` | `#c2dbfb` | `#99c5f7` | `#68a6f2` | `#4584ec` | `#245fdf` | `#2753ce` | `#2644a7` | `#243d84` |
| Green `green` | `#e6f5ef` | `#cdeadf` | `#a8d9c8` | `#7cc7ae` | `#59b89a` | `#2fa77a` | `#0e9a62` | `#0b7d52` | `#0b5a3d` | `#0a4a33` |
| Blue gray `blue-gray` | `#f5f5fa` | `#eeeff7` | `#d5d9eb` | `#babfde` | `#9aa2d0` | `#717bbc` | `#4e5ba6` | `#3e4784` | `#363f72` | `#293056` |
| Teal `teal` | `#f1fefc` | `#e8fdfa` | `#9af5e2` | `#5fe9d0` | `#2ed3ba` | `#15b7a1` | `#0e9384` | `#10756b` | `#125d57` | `#134e49` |
| Cyan `cyan` | `#f0fcff` | `#e5f9ff` | `#b9eefe` | `#7ce3fd` | `#36d6fa` | `#0cc1eb` | `#00a2cf` | `#017da3` | `#066986` | `#0b566f` |
| Indigo `indigo` | `#f0f2fe` | `#e7e9fe` | `#c2d9ff` | `#9dbeff` | `#759aff` | `#5576ff` | `#4155f5` | `#2a3ad8` | `#2534ae` | `#263389` |
| Purple `purple` | `#f6f3fb` | `#f0ecf9` | `#e1def6` | `#cac3ef` | `#ada0e5` | `#9179d9` | `#744ec7` | `#6e49b8` | `#5c3d9a` | `#4d347e` |
| Pink `pink` | `#fbf3f8` | `#f9ecf3` | `#f5d5ec` | `#eeb3db` | `#e383c3` | `#d75daa` | `#c64691` | `#a82e72` | `#8c285e` | `#752651` |
| Red `red` | `#fbf3f6` | `#f9ecef` | `#f5d5e2` | `#eeb3c9` | `#e284a5` | `#d55f85` | `#c34266` | `#a72f4d` | `#8b2941` | `#742739` |
| Orange `orange` | `#fef5f0` | `#feefe7` | `#fed7aa` | `#fdba74` | `#fb923c` | `#f97316` | `#ea580c` | `#c2410c` | `#9a3412` | `#7c2d12` |

---

## 3. Shadow — Figma Effect Styles (màu Alpha Black/100 = `#0000001a`)

| Style | CSS `box-shadow` | Token | Dùng cho |
|---|---|---|---|
| Neutral / All 2 | `0 0 2px 0` | `--shadow-all-2` = **`--shadow-card`** | MỌI khối trắng trên nền trang (card, panel bảng, KPI, mục lục) |
| Neutral / All 4 · 8 · 12 | `0 0 4px` · `0 0 8px` · `0 0 12px` | `--shadow-all-4/8/12` | |
| Neutral / Bottom 2 · 4 · 8 | `0 1px 2px` · `0 1px 4px` · `0 2px 8px` | `--shadow-bottom-2/4/8` | |
| Neutral / Bottom 12 | `0 4px 12px 0` | `--shadow-bottom-12` = **`--shadow-popover`** | MỌI menu xổ ra / popover nổi |
| Neutral / Bottom 16 · 20 | `0 4px 16px` · `0 6px 20px` | `--shadow-bottom-16/20` | |
| Neutral / Top 4 · 8 · 12 | `0 -1px 4px` · `0 -2px 8px` · `0 -4px 12px` | `--shadow-top-4/8/12` | thanh dính đáy (footer form) |
| Neutral / Right 4 · 8 · 12 | `1px 0 4px` · `2px 0 8px` · `4px 0 12px` | `--shadow-right-4/8/12` | cột ghim trái |
| Neutral / Left 4 · 8 · 12 | `-1px 0 4px` · `-2px 0 8px` · `-4px 0 12px` | `--shadow-left-4/8/12` | cột ghim phải, drawer phải |

`--shadow-sm/md/lg/dialog` là token cũ của mds-ui (không có trong Figma) — giữ để không vỡ code cũ, code mới dùng các token trên.

> **Shadow hay Stroke (viền) — chọn MỘT (user chốt 2026-11-05):**
> 1. **Đã có border thì KHÔNG thêm shadow** (và ngược lại: khối đã có shadow thì không thêm viền 1px). Không bao giờ vừa viền vừa bóng cho cùng một khối.
> 2. **Khối nền trắng đặt trên một nền TRẮNG khác** (card con trong card, ô tóm tắt trong popup / dialog / drawer, khối trong form trắng) → **KHÔNG dùng shadow**; tách lớp bằng **nền màu** (`--bg-page` / `--bg-neutral-light` / `--bg-brand-light`…) **hoặc viền** `1px solid var(--stroke-neutral-light)` (`--stroke-divider`).
> 3. Shadow chỉ dùng khi khối **nổi trên nền khác màu / lớp khác**: card trắng trên nền trang xám (`--shadow-card`), menu / popover xổ ra (`--shadow-popover`), popup / dialog / drawer (`--shadow-dialog`), thanh / cột dính (`--shadow-top-*`, `--shadow-right-*`).
> Tư vấn nhanh: “nền trắng trên nền xám → shadow All 2, không viền” · “trắng trên trắng → viền Stroke Neutral Light hoặc đổi nền màu, không shadow” · “nổi lên trên nội dung (menu, popup) → shadow, không viền”.

---

## 4. Typography — Figma Text Styles (Font: Inter / InterVariable)

| Style | Cỡ / dòng | Đậm | Token |
|---|---|---|---|
| H1 – Banner Title | 24 / 32 | Semi Bold | `--text-h1` |
| H2 – App, Page Title, Form title, Dialog Welcome | 20 / 28 | Semi Bold | `--text-h2` |
| H3 – Card, Section, Group Title | 16 / 22 | Semi Bold | `--text-h3` |
| **Body Regular** (mặc định mọi nội dung) | **13 / 20** | Regular · Medium · Semi Bold · Bold | `--text-body` |
| Body Small | 12 / 18 | Regular · Medium · Semi Bold · Bold | `--text-sm` |
| Body Medium | 14 / 20 (Medium, Semi Bold: 22) | | `--text-body-md` |
| Body Large | 16 / 24 | | `--text-body-lg` |
| Caption | 10 / 15 (Small · Medium · Large) · 12 / 15 (Mobile Responsive) | Regular · Medium · Semi Bold | `--text-caption` |
| Overline | 11 / 16 | Regular · Medium · Semi Bold · Bold | |

Font weight: Regular 400 · Medium 500 · Semi Bold 600 · Bold 700 (`--fw-*`).

Bộ 🔢 Font Size (mode): Body Regular 13 (Small) · 14 (Medium/Large) — web dùng mode **Small**. H2 20 → 24, H3 16 → 20 ở Large / Mobile.

---

## 5. Space — kích thước & khoảng cách theo component (Figma 📏 Space)

Giá trị: **Trung bình | Nhỏ | Rộng | Mobile** (tên mode gốc trong Figma: Standard · Compact · Comfortable · Mobile); một số = giống nhau mọi mode.
Trong mds-ui: chiều cao control theo `--btn-height` / `--input-height` (32 · 28 · 36); bảng 1 dòng `--dt-row-height`.


**Accordion**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Gap-Body | 12 | 12 | 16 | 16 |
| Gap-Container | 12 | 12 | 16 | 16 |
| Gap-Accordion | 12 | 12 | 16 | 16 |

**Alert**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Inline Alert/Padding-Horizontal | 12 | 12 | 16 | 16 |
| Inline Alert/Padding-Vertical | 12 | 12 | 16 | 16 |
| Inline Alert/Gap-Alert | 12 | 12 | 16 | 16 |
| Inline Alert/Gap-Container | 12 | 12 | 16 | 16 |
| Inline Alert/Gap-Content | 8 | 8 | 12 | 12 |

**Avatar**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Gap-Text | 8 | 8 | 8 | 8 |
| Size-12 | 12 | 12 | 16 | 16 |
| Size-16 | 16 | 16 | 20 | 20 |
| Size-20 | 20 | 20 | 24 | 24 |
| Size-24 | 24 | 24 | 28 | 28 |

**Breadcrumb**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Gap-Breadcrumb | 8 | 8 | 8 | 8 |
| Gap-Content | 8 | 8 | 8 | 8 |

**Button**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Small/Fix-Height | 28 | 24 | 32 | 32 |
| Small/Fix-Width | 28 | 24 | 32 | 32 |
| Small/Min-Width | 56 | 48 | 64 | 64 |
| Small/Padding-Text-Horizontal | 12 | 8 | 12 | 12 |
| Small/Padding-Icon-Horizontal | 6 | 4 | 8 | 8 |
| Small/Gap-Content | 8 | 4 | 8 | 8 |
| Small/Gap-Button-Group | 8 | 4 | 8 | 12 |
| Medium/Fix-Height | 32 | 28 | 36 | 44 |
| Medium/Fix-Width | 32 | 28 | 36 | 36 |
| Medium/Min-Width | 80 | 72 | 96 | 96 |
| Medium/Min-Width Split | 56 | 48 | 60 | 60 |
| Medium/Padding-Text-Horizontal | 12 | 12 | 16 | 16 |
| Medium/Padding-Icon-Horizontal | 8 | 6 | 8 | 8 |
| Medium/Gap-Content | 8 | 8 | 8 | 8 |
| Medium/Gap-Button-Group | 8 | 8 | 12 | 12 |

**Checkbox**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Size | 16 | 16 | 20 | 20 |
| Gap-Text | 8 | 8 | 8 | 8 |
| Gap-Horizontal-Group | 24 | 24 | 32 | 32 |
| Gap-Vertical-Group | 8 | 8 | 12 | 12 |

**Chip**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Medium/Fix-Height | 28 | 24 | 32 | 32 |
| Medium/Padding-Text-Horizontal | 8 | 8 | 8 | 8 |
| Medium/Padding-Avatar-Horizontal | 6 | 4 | 6 | 6 |
| Medium/Gap-Content | 8 | 8 | 8 | 8 |
| Medium/Gap-Chip-Group | 4 | 4 | 8 | 8 |

**Choice Box**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical | 12 | 12 | 16 | 16 |
| Gap-Content | 8 | 8 | 8 | 8 |

**Collapse Expand**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-L2 | 24 | 24 | 28 | 28 |
| Padding-L3 | 48 | 48 | 56 | 56 |
| Padding-L4 | 72 | 72 | 84 | 84 |

**Date Time Picker**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Width-Date | 32 | 28 | 36 | 36 |
| Fix-Height-Date | 32 | 28 | 36 | 44 |
| Fix-Width-Month | 56 | 52 | 60 | 60 |
| Fix-Height-Month | 56 | 52 | 60 | 60 |
| Fix-Width-Quater | 56 | 52 | 60 | 60 |
| Fix-Height-Quater | 32 | 28 | 36 | 44 |
| Fix-Width-6-Months | 112 | 100 | 120 | 120 |
| Fix-Height-6-Months | 32 | 28 | 36 | 44 |
| Fix-Width-Time | 56 | 52 | 60 | 60 |
| Fix-Height-Time | 32 | 28 | 36 | 44 |
| Fix-Height-Date-Name | 32 | 28 | 36 | 44 |
| Padding-Horizontal | 12 | 8 | 12 | 12 |
| Padding-Vertical | 12 | 8 | 12 | 12 |
| Padding-Divider-Vertical | 8 | 8 | 8 | 8 |

**File Upload**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Gap-Content | 8 | 8 | 12 | 12 |
| Gap-Container | 12 | 12 | 16 | 16 |
| Gap-File-Item | 8 | 8 | 12 | 12 |

**File Upload Item**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 12 | 12 | 16 | 16 |
| Padding-Vertical | 12 | 12 | 16 | 16 |
| Padding-Icon-Vertical | 8 | 8 | 12 | 12 |
| Gap-Content | 8 | 8 | 8 | 8 |
| Gap-Subtext-Vertical | 4 | 4 | 4 | 4 |
| Gap-File-Vertical | 12 | 12 | 16 | 16 |
| Gap-File-Horizontal | 12 | 12 | 16 | 16 |
| Gap-Icon-Horizontal | 8 | 8 | 8 | 8 |

**Icon**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Size-12 | 12 | 12 | 16 | 16 |
| Size-16 | 16 | 16 | 20 | 20 |
| Size-20 | 20 | 20 | 24 | 24 |
| Size-24 | 24 | 24 | 28 | 28 |
| Stroke-12 | 1.5 | 1.5 | 1.5 | 1.5 |
| Stroke-16 | 1.5 | 1.5 | 1.5 | 1.5 |
| Stroke-20 | 1.5 | 1.5 | 1.5 | 1.5 |
| Stroke-24 | 1.5 | 1.5 | 2 | 2 |
| Gap-Icon-Group | 12 | 12 | 12 | 12 |

**Input**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Height | 32 | 28 | 36 | 44 |
| Fix-Width | 32 | 28 | 36 | 36 |
| Min-Height-Label | 32 | 28 | 36 | 44 |
| Min-Height-Multiple | 72 | 64 | 72 | 88 |
| Max-Height-Multiple | 164 | 148 | 192 | 192 |
| Min-Width-TextBox | 80 | 80 | 96 | 96 |
| Min-Width-DateBox | 112 | 112 | 128 | 128 |
| Min-Width-TimeBox | 80 | 96 | 96 | 96 |
| Min-Width-Stepper | 40 | 36 | 48 | 48 |
| Padding-Icon-Horizontal | 8 | 8 | 8 | 8 |
| Padding-Text-Horizontal | 12 | 12 | 12 | 12 |
| Padding-Text-Vertical | 8 | 6 | 10 | 10 |
| Padding-Tag-Vertical | 4 | 4 | 4 | 4 |
| Gap-Content | 8 | 8 | 8 | 8 |
| Gap-Label-Horizontal | 8 | 8 | 8 | 8 |
| Gap-Label-Vertical | 4 | 4 | 8 | 8 |
| Gap-Subtext-Vertical | 2 | 2 | 2 | 2 |
| Gap-Box-Horizontal | 8 | 8 | 8 | 8 |
| Gap-Message | 4 | 4 | 4 | 4 |
| Gap-Input-Vertical | 16 | 8 | 20 | 20 |
| Gap-Input-Horizontal | 12 | 8 | 16 | 16 |
| Gap-Input-Group-Vertical | 24 | 16 | 24 | 24 |

**Keyboard**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Height | 24 | 20 | 28 | 28 |
| Padding-Horizontal | 8 | 4 | 8 | 8 |
| Gap-Content | 4 | 4 | 4 | 4 |
| Gap-Keyboard | 4 | 4 | 4 | 4 |

**Menu List**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Height-1-Line | 32 | 32 | 36 | 44 |
| Fix-Height-2-Line | 48 | 48 | 52 | 52 |
| Min-Width | 80 | 80 | 96 | 96 |
| Padding-Icon-Horizontal | 8 | 8 | 8 | 8 |
| Padding-Text-Horizontal | 12 | 12 | 16 | 16 |
| Padding-Vertical | 8 | 8 | 12 | 12 |
| Padding-Vertical-Small | 4 | 4 | 8 | 8 |
| Padding-Divider-Vertical | 12 | 12 | 12 | 12 |
| Gap-Content | 8 | 8 | 8 | 8 |
| Gap-Item | 4 | 4 | 4 | 4 |
| Gap-Label | 8 | 8 | 8 | 8 |
| Gap-Subtext-Vertical | 4 | 4 | 4 | 4 |
| Gap-Dual-List-Box | 16 | 16 | 16 | 16 |

**Message**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Toast Message/Fix-Height | 32 | 28 | 36 | 36 |
| Toast Message/Padding-Text-Horizontal | 12 | 12 | 16 | 16 |
| Toast Message/Gap-Content | 8 | 8 | 8 | 8 |
| Inline Message/Gap-Content-Medium | 8 | 8 | 8 | 8 |
| Inline Message/Gap-Content-Small | 8 | 8 | 8 | 8 |

**Notification**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Gap-Content | 4 | 4 | 8 | 8 |
| Gap-Body | 12 | 12 | 16 | 16 |
| Gap-Container | 16 | 16 | 20 | 20 |

**Pagination**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Numbered/Fix-Height | 32 | 28 | 36 | 36 |
| Numbered/Fix-Width | 32 | 28 | 36 | 36 |
| Numbered/Gap | 8 | 8 | 8 | 8 |
| Overflow/Fix-Height | 48 | 40 | 56 | 56 |
| Overflow/Gap | 8 | 8 | 8 | 8 |

**Radio Button**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Size | 16 | 16 | 20 | 20 |
| Size-Selector | 8 | 8 | 10 | 10 |
| Gap-Text | 8 | 8 | 8 | 8 |
| Gap-Horizontal-Group | 24 | 24 | 32 | 32 |
| Gap-Vertical-Group | 8 | 8 | 12 | 12 |

**Scroll Bar**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Width-Small | 12 | 12 | 16 | 16 |
| Fix-Height-Small | 12 | 12 | 16 | 16 |
| Fix-Width-Medium | 16 | 16 | 20 | 20 |
| Fix-Height Medium | 16 | 16 | 20 | 20 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical 2 | 8 | 8 | 8 | 8 |
| Padding-Horizontal 2 | 8 | 8 | 8 | 8 |
| Size-Small | 4 | 4 | 4 | 4 |
| Size-Medium | 6 | 6 | 6 | 6 |
| Size-Large | 8 | 8 | 8 | 8 |

**Segmented**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Height | 32 | 28 | 36 | 44 |
| Fix-Height-Item | 28 | 24 | 28 | 28 |
| Min-Width-Item | 40 | 40 | 52 | 52 |
| Padding-Text-Horizontal | 12 | 12 | 16 | 16 |
| Padding-Icon-Horizontal | 6 | 4 | 4 | 4 |
| Padding-Segmented | 2 | 2 | 4 | 4 |
| Gap-Content | 8 | 8 | 8 | 8 |

**Steps**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Height | 32 | 28 | 36 | 44 |
| Fix-Height-Small | 24 | 20 | 28 | 36 |
| Padding-Text-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Text-Vertical | 4 | 2 | 4 | 4 |
| Gap-Container | 8 | 8 | 8 | 8 |
| Gap-Step | 12 | 8 | 8 | 8 |

**Tabs**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Medium/Fix-Height | 36 | 36 | 40 | 44 |
| Medium/Fix-Height-Underline | 40 | 36 | 44 | 44 |
| Medium/Fix-Height-Vertical | 52 | 48 | 56 | 56 |
| Medium/Padding-Horizontal | 12 | 12 | 20 | 20 |
| Medium/Padding-Horizontal-Filled | 12 | 12 | 20 | 20 |
| Medium/Padding-Vertical | 8 | 8 | 12 | 12 |
| Medium/Gap-Content | 8 | 8 | 8 | 8 |
| Medium/Gap-Content-Vertical | 6 | 6 | 6 | 6 |
| Medium/Gap-Tabs | 8 | 8 | 8 | 8 |
| Large/Fix-Height | 56 | 52 | 60 | 60 |
| Large/Padding-Horizontal | 20 | 20 | 24 | 24 |
| Large/Padding-Horizontal-Filled | 12 | 12 | 16 | 16 |
| Large/Padding-Vertical | 8 | 8 | 12 | 12 |
| Large/Gap-Content | 8 | 8 | 8 | 8 |

**Tag**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| X Small/Fix-Height | 20 | 16 | 24 | 24 |
| X Small/Padding-Text-Horizontal | 4 | 4 | 4 | 4 |
| X Small/Padding-Icon-Horizontal | 4 | 4 | 4 | 4 |
| X Small/Padding-Avatar-Horizontal | 4 | 4 | 6 | 6 |
| X Small/Padding-Badge-Horizontal | 6 | 4 | 8 | 8 |
| X Small/Gap-Content | 4 | 4 | 4 | 4 |
| X Small/Gap-Tag-Group | 4 | 4 | 4 | 4 |
| Small/Fix-Height | 24 | 20 | 28 | 28 |
| Small/Padding-Text-Horizontal | 8 | 8 | 8 | 8 |
| Small/Padding-Icon-Horizontal | 4 | 4 | 6 | 6 |
| Small/Padding-Avatar-Horizontal | 6 | 6 | 8 | 8 |
| Small/Padding-Badge-Horizontal | 8 | 8 | 12 | 12 |
| Small/Gap-Content | 6 | 6 | 6 | 6 |
| Small/Gap-Tag-Group | 4 | 4 | 4 | 4 |
| Medium/Fix-Height | 28 | 24 | 32 | 44 |
| Medium/Padding-Text-Horizontal | 8 | 8 | 12 | 12 |
| Medium/Padding-Icon-Horizontal | 6 | 6 | 8 | 8 |
| Medium/Padding-Avatar-Horizontal | 6 | 6 | 8 | 8 |
| Medium/Padding-Badge-Horizontal | 8 | 8 | 12 | 12 |
| Medium/Gap-Content | 4 | 4 | 8 | 8 |
| Medium/Gap-Tag-Group | 4 | 4 | 8 | 8 |

**Text**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Title/Gap-Title | 8 | 8 | 8 | 8 |
| Title/Gap-Subtitle | 8 | 8 | 8 | 8 |
| Title/Gap-Subtitle-Small | 4 | 4 | 4 | 4 |
| Title/Gap-Divider | 16 | 16 | 20 | 20 |
| Text/Gap-Text | 8 | 8 | 8 | 8 |
| Text/Gap-Subtext | 4 | 4 | 4 | 4 |
| Text/Gap-Text-Group | 16 | 16 | 16 | 16 |
| Text/Gap-Text-Group-Dot | 8 | 8 | 8 | 8 |
| Caption/Gap-Caption | 8 | 8 | 8 | 8 |
| Caption/Gap-Text-Group | 16 | 16 | 16 | 16 |
| Caption/Gap-Text-Group-Dot | 8 | 8 | 8 | 8 |

**Toggle Switch**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Height | 16 | 16 | 20 | 20 |
| Width | 28 | 28 | 36 | 36 |
| Selector | 12 | 12 | 16 | 16 |
| Gap-Text | 8 | 8 | 8 | 8 |
| Gap-Horizontal-Group | 24 | 24 | 32 | 32 |
| Gap-Vertical-Group | 8 | 8 | 12 | 12 |

**Tooltip**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Gap-Content-Horizontal | 8 | 8 | 8 | 8 |
| Gap-Content-Vertical | 4 | 4 | 8 | 8 |
| Gap-Container | 16 | 16 | 16 | 16 |
| Padding-Horizontal | 12 | 8 | 16 | 16 |
| Padding-Vertical | 8 | 6 | 8 | 8 |
| Padding-Horizontal-Rich | 16 | 16 | 20 | 20 |
| Padding-Vertical-Rich | 16 | 16 | 20 | 20 |

**Tree**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Height-1-Line | 32 | 28 | 36 | 36 |
| Fix-Height-2-Line | 48 | 44 | 52 | 52 |
| Min-Width | 80 | 80 | 96 | 96 |
| Padding-Text-Horizontal | 16 | 16 | 20 | 20 |
| Gap-Content | 8 | 8 | 8 | 8 |
| Gap-Subtext-Vertical | 4 | 4 | 4 | 4 |

**Pattern · Button Bar**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical | 12 | 8 | 16 | 16 |
| Gap-Container | 16 | 12 | 20 | 20 |

**Pattern · Card**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Gap-Body | 12 | 8 | 16 | 16 |
| Gap-Container | 16 | 12 | 20 | 20 |
| Gap-Icon-Shape | 12 | 8 | 16 | 16 |

**Pattern · Chart**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 16 | 20 | 20 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Gap-Body | 12 | 12 | 16 | 16 |
| Gap-Container | 16 | 16 | 20 | 20 |
| Gap-Icon-Shape | 12 | 12 | 16 | 16 |

**Pattern · Chat**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Message/Fix-Height | 32 | 28 | 36 | 36 |
| Message/Max-Width | 384 | 384 | 384 | 384 |
| Message/Padding-Horizontal | 12 | 12 | 16 | 16 |
| Message/Padding-Vertical | 8 | 6 | 10 | 10 |
| Message/Gap-Content | 8 | 8 | 8 | 8 |
| Message/Gap-Message-Group | 4 | 4 | 4 | 4 |
| Link/Padding-Horizontal | 12 | 12 | 16 | 16 |
| Link/Padding-Vertical | 12 | 12 | 16 | 16 |
| Link/Gap-Body | 8 | 8 | 14 | 14 |
| Content/Padding-Horizontal | 16 | 16 | 20 | 20 |
| Content/Padding-Vertical | 16 | 16 | 20 | 20 |
| Content/Gap-Body | 12 | 12 | 16 | 16 |

**Pattern · Comment**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Gap-Content | 8 | 8 | 8 | 8 |
| Gap-Action | 16 | 16 | 16 | 16 |

**Pattern · DataTable**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Fix-Height-Cell-1-Line | 36 | 32 | 40 | 40 |
| Fix-Height-Cell-2-Line | 56 | 52 | 60 | 60 |
| Fix-Height-Cell-3-Line | 72 | 64 | 80 | 80 |
| Fix-Height-Header-1-Row | 36 | 32 | 40 | 40 |
| Fix-Height-Header-2-Row | 56 | 52 | 60 | 60 |
| Fix-Height-Header-3-Row | 72 | 64 | 80 | 80 |
| Fix-Height-Footer | 36 | 32 | 40 | 40 |
| Advance/Padding-Vertical | 2 | 2 | 2 | 2 |
| Advance/Fix-Height-Cell-1-Line | 36 | 32 | 40 | 40 |
| Advance/Fix-Height-Cell-2-Line | 56 | 52 | 60 | 60 |
| Advance/Fix-Height-Cell-3-Line | 72 | 64 | 80 | 80 |
| Advance/Fix-Height-Header-1-Row | 36 | 32 | 40 | 40 |
| Advance/Fix-Height-Header-2-Row | 56 | 52 | 60 | 60 |
| Advance/Fix-Height-Header-3-Row | 72 | 64 | 80 | 80 |
| Advance/Fix-Height-Footer | 36 | 32 | 40 | 40 |
| Padding-Horizontal | 4 | 4 | 4 | 4 |
| Padding-Paging-Horizontal | 16 | 12 | 16 | 16 |
| Min-Width-Column | 40 | 40 | 44 | 44 |

**Pattern · Dialog**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 24 | 16 | 20 | 20 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Gap-Body | 12 | 12 | 16 | 16 |
| Gap-Icon-Shape | 12 | 12 | 16 | 16 |
| Gap-Container | 16 | 16 | 20 | 20 |

**Pattern · Form**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 24 | 24 | 24 | 24 |
| Padding-Vertical | 16 | 16 | 20 | 20 |
| Padding-Vertical-Footer | 12 | 12 | 16 | 16 |
| Gap-Body-Vertical | 16 | 16 | 20 | 20 |
| Gap-Body-Horizontal | 32 | 28 | 36 | 36 |

**Pattern · Media**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 12 | 20 | 20 |
| Padding-Vertical | 12 | 8 | 16 | 16 |
| Gap-Container | 12 | 8 | 16 | 16 |

**Pattern · Side Bar**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Padding-Horizontal | 16 | 12 | 16 | 16 |
| Padding-Vertical | 16 | 12 | 16 | 16 |
| Gap | 8 | 8 | 12 | 12 |

**Radius**

| Biến | Trung bình | Nhỏ | Rộng | Mobile |
|---|---|---|---|---|
| Defaullt | 8 | 6 | 8 | 8 |
| Small | 4 | 4 | 4 | 4 |
| Inner | 6 | 4 | 6 | 6 |
| Focus | 12 | 8 | 12 | 12 |
| Pill | 9999 | 9999 | 9999 | 9999 |
| Dialog-Card-Popover | 12 | 12 | 12 | 12 |

### Thang số (#️⃣ Number)
- Spacing-Padding: 0 · 2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 36 · 40 · 44 · 48 · 52 · 56 · 60 · 64 · 68 · 72 · 76 · 80 · 84
- Width-Height: 0 · 2 · 4 · … · 80 · 88 · 96 · 108 · 112 · 120 · 128 · 132 · 140 · 144 · 148 · 160 · 164 · 176 · 192 · 208 · 224 · 240 · 256 · 288 · 320
- Icon Size: 8 · 12 · 16 · 20 · 24 · 28 · 32 · 36 · 40 · 44 · 48 · Border Width: 0 · 1 · 2 · 3 · 4
- ⛔ Không dùng giá trị ngoài thang (VD 5px, 7px, 9px, 11px, 13px, 15px, 22px, 30px).

---

## 6. Màu biểu đồ (🌈 Chart Colors) — 7 màu / theme

Màu 1 = màu chính theme. Mỗi ô: **Palette · Single Hue · Divergent**. Palette = nhiều nhóm khác nhau; Single Hue = 1 chuỗi đậm → nhạt; Divergent = thang 2 đầu.

| Theme | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| Blue | `#245fdf` | #ad63e1 · #5481f2 · #ad8ae7 | #f157c0 · #7693f5 · #e6b2e4 | #ff5f96 · #93a6f8 · #ffe4f1 | #ff7e6d · #adb9fb · #ffcdd0 | #ffa54d · #c5ccfd · #ffc28e | #ffcc42 · #dce0ff · #ffcc42 |
| Green | `#0e9a62` | #4d9a3e · #3ca669 · #77b967 | #759a28 · #5cb47c · #bed984 | #989815 · #78c291 · #fff9ac | #bb9311 · #92d0a5 · #fbd57c | #db8c24 · #acdebb · #faae55 | #f9823e · #c5ecd0 · #f9823e |
| Blue Gray | `#4e5ba6` | #7b4f8a · #595e98 · #8b71a3 | #aa5b87 · #7476ac · #caa2c3 | #cc6e7f · #8e8fc0 · #ffdaea | #e28977 · #a9a9d5 · #ffcdcc | #eba975 · #c4c4ea · #ffc8a4 | #e9cc81 · #e0dfff · #e9cc81 |
| Teal | `#0e9384` | #4bb882 · #43c0a9 · #73d09f | #72b765 · #5fc9b4 · #b1e8a4 | #97b34b · #77d2bf · #edffb2 | #bbac39 · #8ddbca · #f0df82 | #dea137 · #a3e4d5 · #f8bb5c | #ff9248 · #b7ede0 · #ff9248 |
| Cyan | `#00a2cf` | #00bac7 · #41b8db · #42cbd7 | #08c4ae · #5fc2e2 · #7be6d6 | #5eca8e · #77cce9 · #b5ffd6 | #96cd6f · #8dd6f0 · #c2f1a5 | #cbca5a · #a1e1f8 · #dedd77 | #ffc259 · #b5ebff · #ffc259 |
| Indigo | `#4155f5` | #c465df · #7d83f5 · #be89e7 | #fd5dbc · #9494f8 · #ebade1 | #ff6994 · #a9a6fa · #ffdaea | #ff876f · #bdb8fc · #ffc9c9 | #ffab54 · #d0cbfd · #ffbe57 | #ffce4e · #e2deff · #ffce4e |
| Purple | `#744ec7` | #dd46d5 · #926ffa · #de70d5 | #ff48aa · #a685fb · #ffa3c6 | #ff6a83 · #b99afc · #ffdbdc | #ff9567 · #cbb0fd · #ffd4c3 | #ffbf5e · #dbc6fe · #ffd698 | #ffe471 · #eaddff · #ffe471 |
| Pink | `#c64691` | #ff71a7 · #f883ce · #ff91a3 | #ff8181 · #fa94d5 · #ffbd9f | #ff9d5d · #fca5dc · #ffe8a1 | #ffbd3d · #fdb6e2 · #ffe8a1 | #f9de30 · #fec6e9 · #f3f186 | #c9fb4d · #ffd6ef · #c9fb4d |
| Rosé (Red) | `#c34266` | #ff7f73 · #ff829b · #ff9a81 | #ff955a · #ff93a8 · #ffc58c | #f9af48 · #ffa4b5 · #ffedae | #e1c846 · #ffb5c2 · #e9ee95 | #c0e059 · #ffc5cf · #c7f184 | #93f57f · #ffd5dc · #93f57f |
| Orange | `#cd6731` | #dc9829 · #ff9451 · #f7b350 | #baa52f · #ffa268 · #f1db7b | #98ae45 · #ffb07e · #f0feb1 | #77b463 · #ffbe95 · #b8e7a5 | #59b681 · #ffccac · #80cf9f | #43b69c · #ffdac4 · #43b69c |

---

## 7. Lệch giữa Figma và mds-ui (còn giữ, có chủ đích hoặc chờ quyết định)

| Hạng mục | Figma | mds-ui hiện tại |
|---|---|---|
| Dòng bảng 1 dòng | 36 · 32 · 40 | `--dt-row-height` 32 · 32 · 36 |
| Dòng bảng 2 / 3 dòng | 56 · 52 · 60 / 72 · 64 · 80 | cố định 56 / 72 |
| Item menu xổ ra (Menu List 1 dòng) | 32 · 32 · 36 | `--menu-item-h` 32 · 32 · 36 (riêng, không theo nút) |
| Divider trong menu | Padding-Divider-Vertical 12 | cách item 4px (theo yêu cầu thiết kế dự án) |
| Item Sub Menu (Tabs Medium) | 36 · 36 · 40 | cố định 36 |
| H1 line-height | 32 | `--text-h1-lh` 36 |
| Body Small line-height | 18 | `--text-sm-lh` 16 (thêm `--text-body-sm-lh` 18) |

### Nút AI — gradient theo trạng thái (Figma Button / Button Icon, Color=AI — cập nhật 2026-11-03)
| Token | Giá trị | Dùng |
|---|---|---|
| `--ai-grad-600` | AI Begin 600 → AI End 600 (#1482FF → #CF11FF) | Solid mặc định · viền / chữ / icon của Outline, Text, Icon |
| `--ai-grad-700` | #0A68EB → #AA00CF | Solid **hover** |
| `--ai-grad-800` | #0F53BE → #8C00A9 | Solid **nhấn** |
| `--ai-grad-50`  | #EDF9FF → #FEF2FF | Outline / Text / Icon **hover** (nền) |
| `--ai-grad-100` | #D7EFFF → #FAE3FF | Outline / Text / Icon **nhấn** (nền) |
Class: `.btn.btn--ai` · `.btn.btn--ai-outline` · `.btn.btn--ai-text` (+ `.btn--sm` cho Small, + `.btn--icon-only` cho Button Icon). CẤM dùng `filter: brightness` hay rgba tự pha cho hover nút AI.

### Token đúng nhóm — Text / Icon / Stroke / BG (Figma 🎨 Themes, user chốt 2026-11-05)
Mỗi thuộc tính lấy token **đúng nhóm** trong collection 🎨 Themes, kể cả khi hai token cùng giá trị:
| Thuộc tính | Nhóm token | Ví dụ |
|---|---|---|
| `color` của chữ | **Text/** `--text-*` | `--text-white`, `--text-brand` |
| `color` / `fill` / `stroke` của icon (`.ti`, `__icon`, `__check`, `__chev`, nút chỉ có icon) | **Icon/** `--icon-*` | `--icon-white`, `--icon-brand`, `--icon-danger`, `--icon-neutral-disabled` |
| `border` / `outline` / vạch ngăn 1px | **Stroke/** `--stroke-*` | `--stroke-neutral`, `--stroke-divider` |
| `background` | **BG/** `--bg-*` | `--bg-brand`, `--bg-danger-light` |
- ⛔ Icon KHÔNG ăn màu chữ qua `currentColor`: nút Solid (`.btn--primary` chữ `--text-white`) → icon `--icon-white`; Outline màu → `--icon-<màu>`; Text button đã có `--bt-ic` / `--bt-icd` (Icon Disabled); Tab active → `--tab-ic-on`; Link → `--icon-link`.
- Disabled: chữ `--text-*-disabled`, icon `--icon-*-disabled` (Neutral: `--icon-neutral-disabled`, không dùng `--text-disabled` cho icon).
- ⛔ Không mã màu cứng (#fff, #f04438…) — map về token nhóm tương ứng.

### Icon Neutral — một mã duy nhất (user chốt 2026-11-03)
`--icon-neutral` = Neutral 700 **#6B707A** cho MỌI icon trung tính ở MỌI trạng thái. `currentColor` của TIcon lấy theo `color` cha → nút có chữ Text/Primary (#10141B) phải đặt `.ti { color: var(--icon-neutral) }`. Không dùng `--text-primary` hay `--icon-neutral-hover` cho icon trung tính khi hover / nhấn.

### Cỡ chữ — Figma collection 🔢 Font Size (cập nhật 2026-11-03)
Token: `--text-h1/-h2/-h3` · `--text-body` · `--text-body-sm` · `--text-body-md` · `--text-body-lg` · `--text-caption` · `--text-overline` (mỗi cái kèm `-lh`) · `--lh-btn-md` · `--lh-btn-sm` · `--lh-label`.
| Mode | Kích hoạt | Body Regular | H2 · H3 |
|---|---|---|---|
| Small (mặc định) | `:root` | 13 / 20 | 20/28 · 16/22 |
| Medium | `data-font-size="medium"` | 14 / 22 | 20/21 · 16/22 |
| Large | `data-font-size="large"` | 14 / 22 | 24/32 · 20/28 |
| Mobile Responsive | tự áp màn ≤ 640px (khi chưa chọn) / `data-font-size="mobile"` | 14 / 18 | 24/32 · 20/28 |

**Xem thử mode Font size ở trang tài liệu /ds:** thanh trên cùng mỗi khung ví dụ có ô **“Font size: Small / Medium / Large / Mobile Responsive”** (cạnh Màu nền, Mật độ) — đổi là cả trang tăng giảm cỡ chữ theo đúng mode Figma (đặt `data-font-size` trên `<html>`, như người dùng chọn ở Thiết lập hiển thị › Cỡ chữ). Mobile Responsive chỉ để xem thử (app tự dùng ở màn ≤ 640px), không lưu. Code luôn dùng token `--text-*` / `--text-*-lh` để chữ đổi theo mode — viết cứng `font-size: 13px` sẽ không đổi.
- Người dùng chọn ở **Thiết lập hiển thị › Cỡ chữ** (ControlHeader) → `applyFontSize(id)` (theme.js, lưu `mds-font-size`); App.vue gọi `applyFontSize(currentFontSize.value)` lúc khởi động.
- Xem thử trong 1 khung: `<div class="font-size-scope" data-font-size="large">`.
- CẤM ghi cứng `font-size: 13px` — dùng `var(--text-body)` (và `var(--text-body-lh)`) để chữ đổi theo mode.


## Bóng đổ — dùng biến nào
- Card trắng trên nền xám (BG Page): `--shadow-card` = `--shadow-all-2` (Figma Drop Shadow/Neutral/All 2), bo `--radius-card` 8, không viền.
- Dialog / popup: `--shadow-dialog` = `--shadow-bottom-12`, bo `--radius-dialog` 12 · menu / popover / toast: `--shadow-popover` = Bottom 12.
- Panel trượt bên phải: `--shadow-left-8`. Có viền thì không dùng bóng.
