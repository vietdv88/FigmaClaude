# MDS Web Components v2.0 — Component Reference

**Library file:** `1DP5RJM3MsZJ8SnUWgTavS`
**Figma URL:** https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0

> Cập nhật: 2026-05-15. Luôn ưu tiên dùng keys trong file này. Nếu component chưa có → chạy `search_design_system` với `fileKey` của working file.

---

## ❖ Space Variables — từ "📏 Space" collection {#space-variables}

> Collection có 3 modes: **Standard** / Nhỏ / Rộng. Mặc định dùng **Standard**.
> ⚠️ `setBoundVariable("cornerRadius")` không hoạt động qua Plugin API — set giá trị số trực tiếp.

### Radius
| Token | ID | px |
|-------|----|----|
| `Radius/Defaullt` *(typo trong library)* | `VariableID:15199:868` | **8** — panel, card, table |
| `Radius/Small` | `VariableID:15217:158121` | **4** — tag nhỏ, badge |
| `Radius/Inner` | `VariableID:22782:13351` | **6** — inner element |
| `Radius/Focus` | `VariableID:15217:151128` | **12** — focus ring |
| `Radius/Dialog-Card-Popover` | `VariableID:15199:16563` | **12** — modal, dialog, popover |
| `Radius/Pill` | `VariableID:15214:42203` | **9999** — pill button, full-round |

### DataTable (Patterns/DataTable)
| Token | ID | px | Dùng cho |
|-------|----|----|---------|
| `Fix-Height-Cell-1-Line` | `VariableID:817:32286` | **36** | Row 1 dòng |
| `Fix-Height-Cell-2-Line` | `VariableID:1085:82087` | **56** | Row 2 dòng ← **chuẩn** |
| `Fix-Height-Cell-3-Line` | `VariableID:1085:82088` | **72** | Row 3 dòng |
| `Fix-Height-Header-1-Row` | `VariableID:968:2595` | **36** | Table header 1 hàng |
| `Fix-Height-Header-2-Row` | `VariableID:1425:75026` | **56** | Table header 2 hàng ← **chuẩn** |
| `Fix-Height-Footer` | `VariableID:970:24319` | **36** | Footer row (tổng cộng) |
| `Padding-Horizontal` | `VariableID:967:4372` | **4** | Cell padding ngang |
| `Padding-Paging-Horizontal` | `VariableID:22800:16393` | **16** | Paging padding ngang |
| `Min-Width-Column` | `VariableID:970:23866` | **40** | Min width cột |

### Card (Patterns/Card)
| Token | ID | px |
|-------|----|----|
| `Padding-Horizontal` | `VariableID:1792:24972` | **16** |
| `Padding-Vertical` | `VariableID:1792:24973` | **16** |
| `Gap-Body` | `VariableID:1792:24974` | **12** — gap title → content |
| `Gap-Container` | `VariableID:1792:24975` | **16** — gap giữa các card |

### Form (Patterns/Form)
| Token | ID | px |
|-------|----|----|
| `Padding-Horizontal` | `VariableID:1443:84579` | **24** |
| `Padding-Vertical` | `VariableID:1443:84580` | **16** |
| `Padding-Vertical-Footer` | `VariableID:8538:72685` | **12** |
| `Gap-Body-Vertical` | `VariableID:1443:84581` | **16** — gap giữa các row input |
| `Gap-Body-Horizontal` | `VariableID:1443:84582` | **32** — gap giữa 2 cột |
| `Gap-Body-Horizontal 2` | `VariableID:1445:85564` | **16** |

### Dialog / Modal (Patterns/Dialog)
| Token | ID | px |
|-------|----|----|
| `Padding-Horizontal` | `VariableID:1317:8743` | **24** |
| `Padding-Vertical` | `VariableID:1317:8744` | **16** |
| `Gap-Body` | `VariableID:1317:8746` | **12** |
| `Gap-Container` | `VariableID:1317:8747` | **16** |

### Button Bar / Footer (Patterns/Button Bar)
| Token | ID | px |
|-------|----|----|
| `Padding-Horizontal` | `VariableID:6616:69681` | **16** |
| `Padding-Vertical` | `VariableID:6616:69682` | **12** |
| `Gap-Container` | `VariableID:6616:69684` | **16** |

### Sidebar (Patterns/Side Bar)
| Token | ID | px |
|-------|----|----|
| `Padding-Horizontal` | `VariableID:3229:114` | **16** |
| `Padding-Vertical` | `VariableID:3229:115` | **16** |
| `Gap` | `VariableID:3229:116` | **8** — gap giữa nav items |

### Input Component (Components/Input)
| Token | ID | px |
|-------|----|----|
| `Fix-Height` | `VariableID:146:6509` | **32** — chiều cao input |
| `Padding-Text-Horizontal` | `VariableID:146:6510` | **12** |
| `Padding-Text-Vertical` | `VariableID:938:10026` | **8** |
| `Gap-Content` | `VariableID:771:3106` | **8** |
| `Gap-Input-Vertical` | `VariableID:1445:65159` | **16** — gap giữa các input trong group |
| `Gap-Input-Horizontal` | `VariableID:1445:65160` | **12** |
| `Gap-Label-Horizontal` | `VariableID:584:1595` | **8** |
| `Gap-Input-Group-Vertical` | `VariableID:1445:65294` | **24** — gap giữa các Input Group |

### Button Component (Components/Button/Medium)
| Token | ID | px |
|-------|----|----|
| `Fix-Height` | `VariableID:132:509` | **32** |
| `Min-Width` | `VariableID:401:2161` | **80** |
| `Padding-Text-Horizontal` | `VariableID:132:510` | **12** |
| `Padding-Icon-Horizontal` | `VariableID:146:6508` | **8** |
| `Gap-Content` | `VariableID:132:514` | **8** |
| `Gap-Button-Group` | `VariableID:680:7684` | **8** |

---

## ❖ Radius Variables — từ "📏 Space" collection

> ⚠️ `setBoundVariable("cornerRadius")` **không hoạt động** qua Plugin API — đọc giá trị rồi set trực tiếp.

```js
// ĐÚNG: đọc value từ variable, set trực tiếp
frame.cornerRadius = 8; // = Radius/Defaullt

// SAI: binding không apply được
// frame.setBoundVariable("cornerRadius", radiusVar); ← KHÔNG dùng
```

| Token | Variable ID | Giá trị |
|-------|-------------|---------|
| `Radius/Defaullt` | `VariableID:15199:868` | **8px** — panel, card, table |
| `Radius/Small` | `VariableID:15217:158121` | **4px** — tag, chip nhỏ |
| `Radius/Inner` | `VariableID:22782:13351` | **6px** — inner element |
| `Radius/Focus` | `VariableID:15217:151128` | **12px** — focus ring |
| `Radius/Dialog-Card-Popover` | `VariableID:15199:16563` | **12px** — modal, dialog |
| `Radius/Pill` | `VariableID:15214:42203` | **9999px** — pill button |

---

## ⛔ Color Variables — PHẢI dùng biến từ "🎨 Themes" collection {#color-variables}

> **NGHIÊM CẤM hardcode màu hex/rgb.** Luôn dùng `figma.variables.setBoundVariableForPaint` với variable ID.

### ⚠️ Variable IDs khác nhau giữa các file

**IDs trong bảng này là library IDs** (chỉ đúng trong file `1DP5RJM3MsZJ8SnUWgTavS`).  
Trong working files, IDs có dạng `VariableID:<hash>/<number>` — phải discover động:

```js
// Discover IDs từ working file (chạy 1 lần đầu)
// Cần 1 node đã có Themes variable bound (ví dụ frame với BG/White)
const boundNode = figma.currentPage.findOne(n => {
  return n.boundVariables?.fills?.[0]?.color;
});
const v = await figma.variables.getVariableByIdAsync(boundNode.boundVariables.fills[0].color.id);
const col = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
const allVars = await Promise.all(col.variableIds.map(id => figma.variables.getVariableByIdAsync(id)));
const varMap = {};
allVars.filter(Boolean).forEach(v => { varMap[v.name] = v.id; });
// varMap["Text/Primary Neutral"] → ID đúng cho file này
```

### Hex màu → Semantic token (dùng khi audit / rebind hàng loạt)

| Hex | Token | Ngữ cảnh |
|-----|-------|---------|
| `#101828` | `Text/Primary Neutral` | Text chính trong table, form |
| `#717680` | `Text/Secondary Neutral` | Subtitle, text phụ |
| `#a4a7ae` | `Text/Hint Neutral` | Placeholder, hint text |
| `#0499e4` | `Text/Link Brand` | Tên có thể click trong table |
| `#0e9a62` | `Text/Success` | Text trạng thái thành công / tag xanh |
| `#ffffff` | `Text/White` | Text trên nền màu (badge, chip) |
| `#f3f4f6` hoặc `#f0f2f4` | `BG/Page` | Nền trang |
| `#ffffff` | `BG/White` | Nền card, panel, bảng |

### Cách bind variable
```js
// ⚠️ Đúng: figma.variables.setBoundVariableForPaint (KHÔNG phải figma.setBoundVariableForPaint)
const v = await figma.variables.getVariableByIdAsync(varMap["Text/Primary Neutral"]);
node.fills = [figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", v
)];
```

### Text variables (library IDs — chỉ tham khảo)
| Token | Library Variable ID |
|-------|---------------------|
| Text/Primary Neutral | `VariableID:15058:4106` |
| Text/Secondary Neutral | `VariableID:15058:4107` |
| Text/Hint Neutral | `VariableID:15058:4110` |
| Text/Disabled Neutral | `VariableID:15097:268382` |
| Text/Brand | `VariableID:15058:4108` |
| Text/Link Brand | `VariableID:15058:4109` |
| Text/White | `VariableID:15061:3362` |
| Text/Danger | `VariableID:15064:20472` |
| Text/Warning | `VariableID:15064:20473` |
| Text/Success | `VariableID:15064:20475` |
| Text/Info | `VariableID:15064:20474` |
| Text/Accent | `VariableID:15070:40076` |

### Icon variables (library IDs — chỉ tham khảo)
| Token | Library Variable ID |
|-------|---------------------|
| Icon/Neutral | `VariableID:15058:4112` |
| Icon/Neutral Disabled | `VariableID:15097:268381` |
| Icon/Brand | `VariableID:15058:4113` |
| Icon/White | `VariableID:15061:3363` |
| Icon/Danger | `VariableID:15064:20487` |
| Icon/Warning | `VariableID:15064:20486` |
| Icon/Success | `VariableID:15064:20485` |
| Icon/Info | `VariableID:15064:20488` |

### Stroke variables
| Token | Variable ID |
|-------|-------------|
| Stroke/Neutral | `VariableID:15059:3322` |
| Stroke/Neutral Light | `VariableID:20447:620` |
| Stroke/Neutral Disable | `VariableID:15106:103015` |
| Stroke/Divider | `VariableID:15061:3361` |
| Stroke/Brand | `VariableID:15059:3323` |
| Stroke/Brand Light | `VariableID:20363:91498` |
| Stroke/Danger | `VariableID:15064:20507` |
| Stroke/Danger Light | `VariableID:20447:623` |
| Stroke/Warning | `VariableID:15064:20508` |
| Stroke/Success | `VariableID:15064:20506` |
| Stroke/Info | `VariableID:15064:20509` |

### Background variables
| Token | Variable ID |
|-------|-------------|
| BG/White | `VariableID:15062:20453` |
| BG/Page | `VariableID:15062:20452` |
| BG/Black | `VariableID:15064:20526` |
| BG/Brand/Brand | `VariableID:15062:20454` |
| BG/Brand/Brand Light | `VariableID:20363:91497` |
| BG/Brand/Brand Light Hover | `VariableID:20563:25196` |
| BG/Brand/Brand Disable | `VariableID:20548:72277` |
| BG/Neutral/Neutral Light | `VariableID:20437:71840` |
| BG/Neutral/Neutral Light Hover | `VariableID:20591:2065` |
| BG/Danger/Danger | `VariableID:15064:20520` |
| BG/Danger/Danger Light | `VariableID:20437:71826` |
| BG/Success/Success | `VariableID:15064:20519` |
| BG/Success/Success Light | `VariableID:20437:71827` |
| BG/Warning/Warning | `VariableID:15064:20521` |
| BG/Warning/Warning Light | `VariableID:20437:71825` |
| BG/Info/Info Light | `VariableID:20437:71824` |
| BG/Accent/Accent Light | `VariableID:20437:71828` |

---

## ❖ Text Styles — PHẢI dùng từ library {#text-styles}

> **NGHIÊM CẤM hardcode fontSize/fontStyle.** Dùng text style ID qua `applyStyleId()` hoặc load font tương ứng.

```js
// Cách áp dụng text style (nếu node là TEXT):
const style = await figma.getStyleByIdAsync("S:96a29a1d8fedd69625795383560256c017f1c777,");
textNode.textStyleId = style.id;

// Hoặc load font rồi set thủ công (khi cần):
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
textNode.fontName = { family: "Inter", style: "Semi Bold" };
textNode.fontSize = 24;
```

| Style | ID | Size | Weight | Line Height |
|-------|----|------|--------|-------------|
| H1 - Banner Title | `S:96a29a1d8fedd69625795383560256c017f1c777,` | 24 | Semi Bold | 36 |
| H2 - App/Page Title | `S:d71a7f771f2da5119bbb74d4ffdb63fac53e31aa,` | 20 | Semi Bold | 28 |
| H3 - Form/Section Title | `S:f7fa584f6e878ee04f4628800c4c36eb54f1f858,` | 16 | Semi Bold | 22 |
| Body Regular/Regular | `S:59d7da67c23f95f1d309965ab4fb6e6bc2c54886,` | 13 | Regular | 20 |
| Body Regular/Medium | `S:70d6f26d209ad58cd80a5e35b7c5e7d478511c3e,` | 13 | Medium | 20 |
| Body Regular/Semi Bold | `S:232efaf3b542b61336028223bdaf09e101d2dd36,` | 13 | Semi Bold | 20 |
| Body Regular/Bold | `S:2b9671675c9047cffd831df757eba6a46408cf4a,` | 13 | Bold | 20 |
| Body Small/Regular | `S:dff2b21409d06970876a9140042d2ae103defafd,` | 12 | Regular | 16 |
| Body Small/Medium | `S:c068a5715fda8b64bb95fcd7633dc1b9e2da852f,` | 12 | Medium | 16 |
| Body Small/Semi Bold | `S:ca5bbb11313ad512f4d82e394b7de96cccd040a2,` | 12 | Semi Bold | 16 |
| Body Small/Bold | `S:73d7dbcf47fc1d00561913363b70773cd2aa6e3c,` | 12 | Bold | 16 |
| Body Medium/Regular | `S:0a66f27162ddbb18eab54a449b1068252fbede70,` | 14 | Regular | 20 |
| Body Medium/Medium | `S:4313e4c85a88d962b8be3d99e7ec38cd4738c66a,` | 14 | Medium | 20 |
| Body Medium/Semi Bold | `S:3ed2b29d53f44ed2522ba77c9b03074821190ee3,` | 14 | Semi Bold | 20 |
| Body Medium/Bold | `S:3891b0a1d7afd69a8bee0f7c6a4bf948f7e9e5b6,` | 14 | Bold | 20 |
| Body Large/Regular | `S:a07d8c84650c93618ac5a25ad12ad9aeee8b24e1,` | 16 | Regular | 20 |
| Body Large/Medium | `S:054d49d385b92fdb5eda4a73f8007cc0a7ba2acd,` | 16 | Medium | 20 |
| Body Large/Semi Bold | `S:30ed05580b970a2db52dbbc1f27673938cf1a4eb,` | 16 | Semi Bold | 20 |
| Body Large/Bold | `S:a59226354ed9bcf552fbec81f40af67250ed2e2b,` | 16 | Bold | 20 |
| Caption/Regular | `S:acc69e67eb7732036cf3caf9fda2b3a4091686bd,` | 12 | Regular | 16 |
| Caption/Medium | `S:9d4ec0999dfa37b15d79be943b32f4b9e02d0317,` | 12 | Medium | 16 |
| Caption/Semi Bold | `S:10e84f32c0fd4ebecc4995f106ca1d1a3ce2166d,` | 12 | Semi Bold | 16 |
| Overline/Regular | `S:d4c9911f208c3963c6c793668500f0406a6b9c6c,` | 12 | Regular | 16 |
| Overline/Medium | `S:c1a627628466ec1aeb219c9b9a7bf2d651d0605d,` | 12 | Medium | 16 |
| Overline/Semi Bold | `S:5afe357f8834045e3ac0920a87c1b93068ffa7a7,` | 12 | Semi Bold | 16 |
| Overline/Bold | `S:0f0b5ca448472ea1f5ca585de7bd4263808d7f8c,` | 12 | Bold | 16 |

---

## Quy trình import (áp dụng cho MỌI component)

```js
// Bước 1: Import component set
const set = await figma.importComponentSetByKeyAsync("KEY_Ở_DƯỚI");

// Bước 2: Tìm đúng variant
const variant = set.children.find(c =>
  c.name.includes("Color=Brand") &&
  c.name.includes("Style=Solid") &&
  c.name.includes("State=Default")
) || set.defaultVariant;

// Bước 3: Tạo instance và override text/props
const instance = variant.createInstance();
instance.setProperties({ "🅃 Text#xxx": "Label của bạn" });

// Bước 4: Append VÀO parent TRƯỚC khi set FILL
parent.appendChild(instance);
instance.layoutSizingHorizontal = "FILL"; // SAU appendChild
```

---

## ⛔ Workflow: Component Properties & Icon Slots (BẮT BUỘC)

> **KHÔNG bao giờ tự đổi fills/colors trong instance thư viện.** Luôn dùng `setProperties()`.

### Bước 1 — Inspect properties ngay sau createInstance()

```js
const inst = variant.createInstance();
// In ra toàn bộ props để biết key nào available
const props = inst.componentProperties;
return Object.entries(props).map(([k, v]) => ({ key: k, type: v.type, value: v.value }));
// → Xem output rồi mới setProperties
```

### Bước 2 — Set properties đúng cách

```js
// Boolean: bật/tắt icon, badge, label, divider
inst.setProperties({
  "Icon Left#1234:0": true,     // bật icon slot
  "Badge#5678:0": false,        // ẩn badge
  "Underline": true,            // bật underline
});

// Variant: chọn đúng tên giá trị (phải khớp chính xác)
inst.setProperties({
  "Color#111:0": "Brand",       // không phải "brand" hay "#0499e4"
  "State#222:0": "Active",
  "Size#333:0": "Medium",
});

// InstanceSwap: swap icon vào slot
inst.setProperties({
  "Icon Left#444:0": { type: "INSTANCE_SWAP", value: iconComponentKey },
});
// Hoặc dùng swapComponent() sau khi bật Boolean slot:
const iconSlot = inst.findOne(n => n.type === "INSTANCE" && n.name.includes("Icon Left"));
const iconComp = await figma.importComponentByKeyAsync(iconKey);
if (iconSlot) iconSlot.swapComponent(iconComp);
```

### Bước 3 — Rà soát icon slots đầy đủ

```js
// Sau khi tạo instance, luôn tìm tất cả icon slots
const iconSlots = inst.findAll(n =>
  n.type === "INSTANCE" &&
  (n.name.includes("Icon") || n.name.includes("icon") || n.name.includes("Prefix") || n.name.includes("Suffix"))
);
// → Với mỗi slot: search icon phù hợp và swap vào
for (const slot of iconSlots) {
  const iconComp = await figma.importComponentByKeyAsync(relevantIconKey);
  slot.swapComponent(iconComp);
}
```

### Bảng icon slots theo component

| Component | Boolean prop bật icon | Slot node name | Ví dụ icon |
|-----------|----------------------|----------------|------------|
| Button Medium/Small | `Icon Left#...: true` | `Icon Left` | `add`, `save`, `edit` |
| _Tab Vertical Item | `Icon Left#...: true` | `Icon Left` | module icon (cash, invoice...) |
| Chip Medium/Small | `Prefix Icon#...: true` | `Prefix Icon` | search, filter |
| TextField/Input | `Prefix Icon#...: true` | `Prefix Icon` | search, calendar |
| Inline Alert | variant `Type=Success/Warning/...` | auto (không swap) | — |
| Page Header List | dùng Button Group slot | Button trong slot | add, export |
| Sidebar Item | `Icon Left#...: true` | `Icon Left` | module icon |

### Search icon từ thư viện

```js
// Search icon theo tên ngữ nghĩa
const results = await figma.searchAsync("add_circle", { type: "COMPONENT" });
// Hoặc dùng search_design_system tool:
// search_design_system("add", fileKey=WORKING_FILE_KEY)
// → Lấy key rồi importComponentByKeyAsync(key)
```

---

## ❖ Global Header (BẮT BUỘC cho mọi màn hình)

> ⛔ NGHIÊM CẤM tự vẽ header bằng frame — PHẢI dùng component này.  
> ⚠️ `defaultVariant` của component set này là **`Type=Default`** (nền xanh đậm brand) — PHẢI gọi `setProperties({ "Type": "White" })` ngay nếu app cần header trắng.
> ⛔ **Tổ hợp Header × Sidebar chỉ có 3 kiểu:** header màu (`Default` / `With Branch`) + sidebar **sáng** · header `White` + sidebar **sáng** · header `White` + sidebar **tối**. **Cấm header màu + sidebar tối** (code `theme.js` cũng tự khóa).

**Component Set key:** `a73126feab6a3724986a5912e8bbb599c301d77a`  
**Height:** 56px (FIXED) | **Width:** FILL

---

### Bảng 8 variants đầy đủ

| Variant name | Node ID | Nền | Branch | Border-bottom | Text app |
|---|---|---|---|---|---|
| `Type=Default, Search Type=Box` | `6019:195347` | Brand xanh đậm | ❌ | ❌ | trắng |
| `Type=Default, Search Type=Icon` | `32286:46912` | Brand xanh đậm | ❌ | ❌ | trắng |
| `Type=With Branch, Search Type=Box` | `20600:21817` | Brand xanh đậm | ✅ | ❌ | trắng |
| `Type=With Branch, Search Type=Icon` | `32286:46918` | Brand xanh đậm | ✅ | ❌ | trắng |
| `Type=White, Search Type=Box` | `21495:31577` | Trắng (`BG/White`) | ❌ | ✅ | `Text/Primary Neutral` |
| `Type=White, Search Type=Icon` | `32286:46952` | Trắng (`BG/White`) | ❌ | ✅ | `Text/Primary Neutral` |
| `Type=With Branch White, Search Type=Box` | `21495:31989` | Trắng (`BG/White`) | ✅ | ✅ | `Text/Primary Neutral` |
| `Type=With Branch White, Search Type=Icon` | `32286:46935` | Trắng (`BG/White`) | ✅ | ✅ | `Text/Primary Neutral` |

---

### Khi nào dùng variant nào

| Tình huống | Variant cần dùng |
|-----------|-----------------|
| App MISA thông thường (AMIS, SME...) — layout có Sidebar | `Type=White` |
| App có thông tin công ty / chi nhánh + Sidebar | `Type=With Branch White` |
| App landing page / dashboard không có Sidebar | `Type=Default` |
| App có thông tin công ty / chi nhánh, không có Sidebar | `Type=With Branch` |
| Search bar là ô input to (mặc định) | `Search Type=Box` |
| Search thu gọn thành icon (tiết kiệm ngang) | `Search Type=Icon` |

---

### Khác biệt visual giữa Dark và White variant

| Thuộc tính | Dark (`Type=Default/With Branch`) | White (`Type=White/With Branch White`) |
|---|---|---|
| Background | `var(--bg/brand/brand)` — xanh đậm | `var(--bg/white)` — trắng |
| Search box nền | `rgba(255,255,255,0.2)` — translucent | `var(--neutral/200)` — xám nhạt |
| Border-bottom | Không có | Có (`Stroke/Neutral`) |
| Icon toolbar | Màu trắng | Màu Neutral |
| App name text | Trắng | `Text/Primary Neutral` |
| Branch pill (nếu có) | Nền `rgba(255,255,255,0.2)` + text trắng | Nền trắng + border `Stroke/Neutral` + text tối |

---

### Cấu trúc khu vực Branch (With Branch variants)

Khu vực Branch hiển thị **ngay dưới logo/app name**, gồm:
- **Tên công ty** — text + icon `chevron-down` (dropdown chọn công ty)
- **Pill năm dữ liệu** — icon màu chấm tròn + label "Dữ liệu năm 2023" + icon `chevron-down`

---

### Toolbar phải (tất cả variants)

Từ trái sang phải: icon `settings` → icon `bell` → icon `help` → icon `dots-circle-horizontal` → **Avatar 32px**

---

### Code mẫu — cách dùng chuẩn

```js
// ① App thông thường — White header (phổ biến nhất)
const headerSet = await figma.importComponentSetByKeyAsync("a73126feab6a3724986a5912e8bbb599c301d77a");
const headerInst = headerSet.defaultVariant.createInstance();
// ⚠️ defaultVariant là Type=Default (xanh đậm) — PHẢI đổi sang White ngay
headerInst.setProperties({ "Type": "White" });
screen.appendChild(headerInst);
headerInst.layoutSizingHorizontal = "FILL";

// ② App có chi nhánh — With Branch White
const headerInst2 = headerSet.defaultVariant.createInstance();
headerInst2.setProperties({ "Type": "With Branch White" });
screen.appendChild(headerInst2);
headerInst2.layoutSizingHorizontal = "FILL";

// ③ Tìm đúng variant bằng tên (an toàn nhất)
const whiteVariant = headerSet.children.find(c =>
  c.name === "Type=White, Search Type=Box"
);
const headerInst3 = whiteVariant.createInstance();
screen.appendChild(headerInst3);
headerInst3.layoutSizingHorizontal = "FILL";
```

---

### Props có thể override

```js
// Chỉ dùng setProperties() — KHÔNG set fills / resize
headerInst.setProperties({
  "Type": "White",           // "Default" | "White" | "With Branch" | "With Branch White"
  "Search Type": "Box",      // "Box" | "Icon"
});

// Text tên app (nếu cần đổi) — tìm TEXT node tên "App Name"
// ⚠️ CHỈ set .characters — KHÔNG set .fills hay .textStyleId
const appNameNode = headerInst.findOne(n => n.type === "TEXT" && n.name === "App Name");
if (appNameNode) {
  await figma.loadFontAsync(appNameNode.fontName);
  appNameNode.characters = "MISA AMIS";
}
```

---

## ❖ Page Header

> ⛔ NGHIÊM CẤM tự vẽ Page Header bằng frame — PHẢI dùng component này.

**Component Set key:** `1dee593be92cdf6f31e8e43cf37463dc0092507e`  
**Height:** 56px (FIXED) | **Width:** FILL

| Variant | Key | Slot Content mặc định |
|---------|-----|----------------------|
| `Type=List Page` | `9a449d674ca3014d8dacb92f1914274315390013` | Searchbox + List View toggle + Segmented Icon + Button Group (Nhập từ Excel + Thêm) |
| `Type=Form Page` | `d9e3bc23ffbe60b46eedf4f8c13a5b000582b15e` | Combobox Single + Button Icon Medium |
| `Type=View Detail Page` | `7e882fc67053bb1fe4b879f05531ba628f2d156a` | Button Action group (Sửa + ...) |
| `Type=Bulk Action` | `8fa082fad1946386f857a69a66d07e7af1bb7f1a` | "Đã chọn N · Bỏ chọn" + action buttons |

**Props toggle (Boolean):**
| Prop | Default | Mô tả |
|------|---------|-------|
| `Icon Back#6497:0` | `true` | Hiện/ẩn nút ← back |
| `Breadcrumb#2455:0` | `false` | Hiện/ẩn breadcrumb |
| `Search#1109:210` | `false` | Hiện search box trong header |
| `Mode View#1109:209` | `true` | Hiện view toggle (list/grid) |
| `Slot Content#26663:0` | SLOT | Inject content vào right slot |

**Cách dùng chuẩn — Type=List Page:**
```js
const pageHeaderSet = await figma.importComponentSetByKeyAsync("1dee593be92cdf6f31e8e43cf37463dc0092507e");
const listVariant = pageHeaderSet.children.find(c => c.name === "Type=List Page") || pageHeaderSet.defaultVariant;
const pageHeaderInst = listVariant.createInstance();
main.appendChild(pageHeaderInst);
pageHeaderInst.layoutSizingHorizontal = "FILL";
pageHeaderInst.layoutSizingVertical = "FIXED";

// Cấu hình props
pageHeaderInst.setProperties({
  "Icon Back#6497:0": false,   // ẩn back ở màn list (không cần navigate back)
  "Mode View#1109:209": true,  // hiện list/grid toggle
  "Search#1109:210": false,    // search đã có ở toolbar bên dưới
  "Breadcrumb#2455:0": false
});

// Cập nhật tiêu đề trang (TEXT node tên "Title")
const titleNode = pageHeaderInst.findOne(n => n.type === 'TEXT' && n.name === 'Title');
if (titleNode) {
  await figma.loadFontAsync(titleNode.fontName);
  titleNode.characters = "Tất cả tiềm năng";
}
```

**Cách dùng — Type=Form Page:**
```js
const formVariant = pageHeaderSet.children.find(c => c.name === "Type=Form Page");
const formHeaderInst = formVariant.createInstance();
main.appendChild(formHeaderInst);
formHeaderInst.layoutSizingHorizontal = "FILL";
formHeaderInst.layoutSizingVertical = "FIXED";
formHeaderInst.setProperties({ "Icon Back#6497:0": true });
const titleNode = formHeaderInst.findOne(n => n.type === 'TEXT' && n.name === 'Title');
if (titleNode) { await figma.loadFontAsync(titleNode.fontName); titleNode.characters = "Thêm tiềm năng"; }
```

---

## ❖ Button Page

> Pages web: `❖ Button` — components button chính thức cho Web v2.0

| Component | Key | Variants chính |
|-----------|-----|----------------|
| Button Medium | `1127e80302210bea3d222691252f2a630ce7cbef` | Color=Brand/AI/Gray/Neutral/Error/Warning/Success/Accent1/Accent2, Style=Solid/Filled/Outline/Text/Icon, State=Default/Disabled |
| Button Small | `4d3f1adf2e8ae2e51f574ef247a6a8847278e503` | Color=Brand/Gray/..., Style=Solid/Filled/Outline/Text, Disabled=False/True |
| Button Icon Medium | `af8feed90f75f635147231acb453fae7f0a50f7e` | Color=Brand/..., Style=Solid/Filled/Outline/Icon |
| Button Icon Small | `fc62ebea3263d473068edf272ee9e5cfd78ff2b9` | Tương tự Icon Medium |
| Button Split | `ea55dc8c3134e5cf9d70ade417e0426e068a433e` | Color=Brand/..., Style=Solid |
| Button Icon Split | `1f0b5ee0042c7e8d387089d3cc689aa430ea58ad` | — |
| FAB Medium | `ebd324d4a21d79cff535d84d1e8fc0376e349f28` | Color=Brand/..., Style=Solid/Filled |
| FAB Small | `e0571b569577e65e9e2a9e6d2bf9c86a493836b5` | — |
| Button Medium Group | `62136e43f6e4da75bf39e00533a397029192c27f` | Type=Text/Icon, Box Margin=False/True, Vertical=False/True |
| Button Small Group | `fb6edaa3bf1354b6f45f5bf06a6da47f18c426e7` | — |
| Button Bar | `6e12dc7d1c896e6b1014fc11e7338dbfa9a9118f` | Vertical=False/True |

**Button Medium — cách dùng phổ biến:**
```js
const btnSet = await figma.importComponentSetByKeyAsync("1127e80302210bea3d222691252f2a630ce7cbef");

// Primary button
const primary = btnSet.children.find(c =>
  c.name.includes("Color=Brand") && c.name.includes("Style=Solid") && c.name.includes("State=Default")
) || btnSet.defaultVariant;

const btn = primary.createInstance();
// Tìm text property key bằng: Object.keys(btn.componentProperties)
// Thường là: "🅃 Text#xxx" hoặc tương tự
parent.appendChild(btn);
btn.layoutSizingHorizontal = "FILL";
```

---

## ❖ Input / Form Fields

> Tìm qua `search_design_system` với query "TextField", "Input", "Dropdown", "Select" trong working file

| Component | Nguồn tìm | Ghi chú |
|-----------|-----------|---------|
| TextField | search "TextField" hoặc "Input" | Web input field |
| Dropdown/Select | search "Dropdown" hoặc "Select" | Combobox |
| Search field | search "Search" | Search input |
| Date picker | search "Date" hoặc "DatePicker" | — |
| Textarea | search "Textarea" | Multiline input |

---

## ❖ Table Column Components (BẮT BUỘC — NGHIÊM CẤM tự vẽ bảng thủ công)

> ⛔ **KHÔNG BAO GIỜ** build table bằng frame + text node. Luôn dùng 2 component dưới đây.

| Component | Key | Mô tả |
|-----------|-----|-------|
| **ReadOnly Column Table** | `abc2a8c33f322af3b6fdc19fb53d29744eef10a4` | Màn hình xem — không có edit cell |
| **Editable Column Table** | `f70c5944056bb83807e22421fb018bf2a8ea03ac` | Màn hình sửa — có mode edit cell |

### Variants (Type)

| ReadOnly types | Editable types (thêm) |
|---------------|----------------------|
| Text, Icon, Checkbox | Textbox, Textarea, Numberbox |
| Action Icon, Action Text | Combobox Single/Split, Combobox Multiple/Split |
| Swap Component, Toggle Switch | Date, Time, Date Time |
| Radio Button, Progress Bar | (tất cả ReadOnly types) |

### Component properties

| Prop key | Type | Default | Mô tả |
|----------|------|---------|-------|
| `Type` | VARIANT | Text / Textbox | Loại cột |
| `Cell 1#971:96` | BOOLEAN | true | Hiện/ẩn cell row 1 |
| `Cell 2#971:99` | BOOLEAN | true | Hiện/ẩn cell row 2 |
| `Cell 3#971:102` | BOOLEAN | true | Hiện/ẩn cell row 3 |
| `Cell 4#971:105` | BOOLEAN | true | Hiện/ẩn cell row 4 |
| `Cell 5#971:108` | BOOLEAN | true | Hiện/ẩn cell row 5 |
| `Cell 6#971:111` | BOOLEAN | true | Hiện/ẩn cell row 6 |
| `Cell 7#971:114` | BOOLEAN | true | Hiện/ẩn cell row 7 |
| `Cell 8#971:117` | BOOLEAN | true | Hiện/ẩn cell row 8 |
| `Cell 9#971:120` | BOOLEAN | true | Hiện/ẩn cell row 9 |
| `Cell 10#971:123` | BOOLEAN | true | Hiện/ẩn cell row 10 |
| `◐ Footer#971:0` | BOOLEAN | **true** | ⚠️ **Tắt ngay** nếu không cần footer! |
| `◐  Divider#1078:0` | BOOLEAN | false | Hiện divider dọc phải cột |

### Internal node structure

```
ReadOnly Column Table (instance, default 160×432px)
├── ReadOnly Column Header (INSTANCE, h=36)
│     ├── Text "Header"   ← đặt tên cột ở đây: headerNode.characters = "Tên cột"
│     └── Props: Checkbox=False/True, Height=1 Row/2 Row, State=Default/...
├── Column Body (FRAME)
│     └── Columns (FRAME)
│           ├── Cell Table 1 (INSTANCE, h=36)
│           │     ├── Text "Text"    ← dữ liệu chính
│           │     └── Text "Subtext" ← dữ liệu phụ (dòng 2)
│           ├── Cell Table 2 ... Cell Table 10
└── Column Footer (INSTANCE, h=36)  ← tắt bằng ◐ Footer#971:0: false
```

### Code mẫu — build table 3 cột

```js
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

const colSet = await figma.importComponentSetByKeyAsync("abc2a8c33f322af3b6fdc19fb53d29744eef10a4");
const textType = colSet.children.find(c => c.name === "Type=Text");

// Table wrapper frame (HORIZONTAL)
const tableFrame = figma.createAutoLayout("HORIZONTAL", { name: "Table Frame", itemSpacing: 0 });
tableFrame.fills = [];
tablePanel.appendChild(tableFrame);
tableFrame.layoutSizingHorizontal = "FILL";
tableFrame.layoutSizingVertical = "FILL";

// Helper: tạo 1 cột
async function createCol(label, width, rowData, isFill = false) {
  const col = textType.createInstance();
  tableFrame.appendChild(col);
  col.resize(width, col.height);               // chỉ đổi width
  if (isFill) col.layoutSizingHorizontal = "FILL";

  // Tắt footer
  const fKey = Object.keys(col.componentProperties).find(k => k.includes("Footer"));
  if (fKey) col.setProperties({ [fKey]: false });

  // Set header
  const headerText = col.findOne(n => n.name === "ReadOnly Column Header")
                        ?.findOne(n => n.name === "Header");
  if (headerText) headerText.characters = label;

  // Set cell data
  const cells = col.findOne(n => n.name === "Column Body")
                   ?.findOne(n => n.name === "Columns")?.children || [];
  for (let i = 0; i < rowData.length && i < cells.length; i++) {
    const t = cells[i].findOne(n => n.type === "TEXT" && n.name === "Text");
    // Cell trống → "-" để biểu thị data trống
    if (t) t.characters = (rowData[i] != null && rowData[i] !== "") ? String(rowData[i]) : "-";
  }
  // Ẩn cells thừa
  const cellProps = Object.keys(col.componentProperties).filter(k => k.match(/^Cell \d+#/));
  cellProps.slice(rowData.length).forEach(k => col.setProperties({ [k]: false }));
  return col;
}

await createCol("Ngày", 90, ["01/01/2026", "02/01/2026", "03/01/2026"]);
await createCol("Diễn giải", 0, ["Nộp tiền quỹ", "Thu khách hàng", "Bán hàng"], true); // FILL
await createCol("Số tiền", 120, ["1.000.000", "2.500.000", "800.000"]);
```

---

## ❖ Badge Page

| Component | Key cần tìm qua search | Variants |
|-----------|------------------------|---------|
| Badge | search "Badge" từ Web library | Property=Number/Text, Style=Solid/Outline/Dot, Color=Brand/Gray/Red |

---

## ❖ Notification Page

| Component | Nguồn | Ghi chú |
|-----------|-------|---------|
| Notification item | search "Notification" | — |
| Toast/Snackbar | search "Snack" hoặc "Toast" | — |

---

## ❖ Tag Page

| Component | Nguồn | Variants |
|-----------|-------|---------|
| Tag | search "Tag" từ Web library | Color, Style, Size |

---

## Logo Components (DxJfoNpKGaw6JvJcJn8RHT)

| Logo | Key | Variants |
|------|-----|---------|
| MISA AMIS | `36553cc07ac41fc19f5cb0133650400c07c13337` | — (single component) |
| MISA AMIS Icon | `69100955126914f2284579d21d20a1f384fc211c` | — |
| HeThong (MISA system) | `ba3128f2c8b286a06f926d112e3e081e3b68204a` | Type=Bg White/Bg color |
| Logo MISA (text) | `cdd1fee5cb1b2754371037d7e49bd21235026485` | — |
| meInvoice | `ba9081677fb0815a4abb296291687e7c46e878d2` | — |
| SME Desktop Full | `3836284e92aa7ef5d41d10c59fd2e3767de9fad4` | — |
| CUKCUK | `8f7f5d7472ab202be852501dd3d584bc29fe54ca` | — |
| AMISMobile | `29fd6a25b44b5259100bd9a05754e2d4d46643f1` | Type=Bg color/Bg White |
| EMIS Kindergarten | `148f6fb88ec79b95fbb896f2e8a629adfe69dd8a` | — |
| AI Agent | `d047a0d839967f79700e9fd59519937f7d46864e` | — |

**Cách import logo:**
```js
// Logo là single component → dùng importComponentByKeyAsync
const logo = await figma.importComponentByKeyAsync("36553cc07ac41fc19f5cb0133650400c07c13337");
const logoInstance = logo.createInstance();
parent.appendChild(logoInstance);
logoInstance.resize(120, 32); // Scale theo nhu cầu
```

---

## Ghi chú font của components

- Các component MDS Web v2.0 **có thể dùng Inter** → không bị lỗi font
- Nếu component báo lỗi font khi appendChild → chạy `figma.listAvailableFontsAsync()` để kiểm tra
- Luôn load font trước khi làm bất kỳ thao tác nào với text
