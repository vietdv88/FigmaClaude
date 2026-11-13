# Prompt: Web Form Screen — MDS Web App

Màn hình form thêm/sửa dữ liệu, chuẩn MDS Web. Frame 1440×900.

---

## Layout tổng thể

```
Frame: [Tên Form] (1440×900, HORIZONTAL)
├── Sidebar (240×900)
└── Main Content (FILL×900, VERTICAL)
    ├── Top Bar (FILL×64)
    └── Content Area (FILL×FILL, padding 24, gap 20)
        ├── Page Header (HORIZONTAL, SPACE_BETWEEN)
        │   ├── Back button + Title
        │   └── Status chip
        └── Form Container (bg white, radius 8 + shadow Neutral All 2, VERTICAL, padding 32, gap 24)
            ├── Form Header (title + description)
            ├── Field Group 1 (VERTICAL, gap 16, border-bottom)
            │   ├── Group Title (Semi Bold 14, Brand color)
            │   └── Fields Grid (2-col, gap 16)
            ├── Field Group 2
            └── Form Actions (LUÔN ghim ĐÁY form, border-top, padding-top 24, HORIZONTAL, gap 8, flex-end)
                ├── Cancel (Button Medium Gray/Outline)
                └── Save (Button Medium Brand/Solid)
```

---

## Script mẫu — Form Container

```js
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Medium" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

// Giả sử đã có wrapper, sidebar, main, topBar, content
// (xem screen-patterns.md và dashboard.md)

// Form container
const formContainer = figma.createAutoLayout("VERTICAL");
formContainer.name = "Form Container";
formContainer.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
formContainer.cornerRadius = 12;
formContainer.paddingTop = 32; formContainer.paddingBottom = 32;
formContainer.paddingLeft = 32; formContainer.paddingRight = 32;
formContainer.itemSpacing = 24;
formContainer.strokes = [{ type: "SOLID", color: { r: 0.898, g: 0.906, b: 0.922 } }];
formContainer.strokeWeight = 1;
formContainer.strokeAlign = "OUTSIDE";
content.appendChild(formContainer);
formContainer.layoutSizingHorizontal = "FILL";

// Form header
const formHeader = figma.createAutoLayout("VERTICAL");
formHeader.fills = [];
formHeader.itemSpacing = 6;
formContainer.appendChild(formHeader);
formHeader.layoutSizingHorizontal = "FILL";

const formTitle = figma.createText();
formTitle.characters = "Thêm mới khách hàng";
formTitle.fontSize = 18;
formTitle.fontName = { family: "Inter", style: "Semi Bold" };
formTitle.fills = [{ type: "SOLID", color: { r: 0.067, g: 0.094, b: 0.153 } }];
formHeader.appendChild(formTitle);

const formDesc = figma.createText();
formDesc.characters = "Điền đầy đủ thông tin để tạo khách hàng mới trong hệ thống.";
formDesc.fontSize = 13;
formDesc.fontName = { family: "Inter", style: "Regular" };
formDesc.fills = [{ type: "SOLID", color: { r: 0.420, g: 0.447, b: 0.502 } }];
formHeader.appendChild(formDesc);

// Divider
const divSet = await figma.importComponentSetByKeyAsync("116bc5d9d9475271ebfe0aef292c0c54c98831c9");
const div = divSet.children.find(c =>
  c.name.includes("Size=1") && c.name.includes("Horizontal=True")
) || divSet.defaultVariant;
const divInst = div.createInstance();
formContainer.appendChild(divInst);
divInst.layoutSizingHorizontal = "FILL";

// Helper: tạo field group
async function createFieldGroup(groupTitle, fields) {
  const group = figma.createAutoLayout("VERTICAL");
  group.fills = [];
  group.itemSpacing = 16;
  formContainer.appendChild(group);
  group.layoutSizingHorizontal = "FILL";

  const gtitle = figma.createText();
  gtitle.characters = groupTitle;
  gtitle.fontSize = 14;
  gtitle.fontName = { family: "Inter", style: "Semi Bold" };
  gtitle.fills = [{ type: "SOLID", color: { r: 0.016, g: 0.600, b: 0.894 } }];
  group.appendChild(gtitle);

  // Fields grid (2 columns)
  const grid = figma.createAutoLayout("HORIZONTAL");
  grid.fills = [];
  grid.itemSpacing = 16;
  grid.counterAxisAlignItems = "MIN";
  group.appendChild(grid);
  grid.layoutSizingHorizontal = "FILL";

  for (const field of fields) {
    const fieldItem = figma.createAutoLayout("VERTICAL");
    fieldItem.fills = [];
    fieldItem.itemSpacing = 6;
    grid.appendChild(fieldItem);
    fieldItem.layoutSizingHorizontal = "FILL";

    const lbl = figma.createText();
    lbl.characters = field.label + (field.required ? " *" : "");
    lbl.fontSize = 13;
    lbl.fontName = { family: "Inter", style: "Medium" };
    lbl.fills = [{ type: "SOLID", color: { r: 0.157, g: 0.204, b: 0.294 } }];
    fieldItem.appendChild(lbl);
    lbl.layoutSizingHorizontal = "FILL";

    // Thử TextField component
    try {
      const tfSet = await figma.importComponentSetByKeyAsync("cec0aa5278edf04622d2f6de6eb1ae7f4ede92ea");
      const tf = tfSet.children.find(c =>
        c.name.includes("Type=Default") && c.name.includes("State=Placeholder")
      ) || tfSet.defaultVariant;
      const tfInst = tf.createInstance();
      fieldItem.appendChild(tfInst);
      tfInst.layoutSizingHorizontal = "FILL";
    } catch(e) {
      // Custom input fallback
      const input = figma.createAutoLayout("HORIZONTAL");
      input.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      input.strokes = [{ type: "SOLID", color: { r: 0.898, g: 0.906, b: 0.922 } }];
      input.strokeWeight = 1;
      input.cornerRadius = 8;
      input.paddingLeft = 12; input.paddingRight = 12;
      input.paddingTop = 10; input.paddingBottom = 10;
      input.counterAxisAlignItems = "CENTER";
      fieldItem.appendChild(input);
      input.layoutSizingHorizontal = "FILL";
      const t = figma.createText();
      t.characters = field.placeholder || "Nhập " + field.label.toLowerCase();
      t.fontSize = 14;
      t.fontName = { family: "Inter", style: "Regular" };
      t.fills = [{ type: "SOLID", color: { r: 0.612, g: 0.639, b: 0.686 } }];
      t.layoutGrow = 1;
      input.appendChild(t);
    }
  }
  return group;
}

// Group 1: Thông tin cơ bản
await createFieldGroup("Thông tin cơ bản", [
  { label: "Tên khách hàng", required: true },
  { label: "Mã khách hàng", required: true },
  { label: "Email", required: true, placeholder: "email@example.com" },
  { label: "Số điện thoại", required: false },
]);

// Group 2: Địa chỉ
await createFieldGroup("Địa chỉ", [
  { label: "Tỉnh/Thành phố", required: false },
  { label: "Quận/Huyện", required: false },
  { label: "Địa chỉ chi tiết", required: false },
  { label: "Ghi chú", required: false },
]);

// Form actions
const divInst2 = div.createInstance();
formContainer.appendChild(divInst2);
divInst2.layoutSizingHorizontal = "FILL";

const actions = figma.createAutoLayout("HORIZONTAL");
actions.fills = [];
actions.itemSpacing = 8;
actions.primaryAxisAlignItems = "MAX";
formContainer.appendChild(actions);
actions.layoutSizingHorizontal = "FILL";

const btnSet = await figma.importComponentSetByKeyAsync("1127e80302210bea3d222691252f2a630ce7cbef");

// Cancel button
const cancelV = btnSet.children.find(c =>
  c.name.includes("Color=Gray") && c.name.includes("Style=Outline") && c.name.includes("State=Default")
) || btnSet.defaultVariant;
const cancelBtn = cancelV.createInstance();
actions.appendChild(cancelBtn);

// Save button
const saveV = btnSet.children.find(c =>
  c.name.includes("Color=Brand") && c.name.includes("Style=Solid") && c.name.includes("State=Default")
) || btnSet.defaultVariant;
const saveBtn = saveV.createInstance();
actions.appendChild(saveBtn);
```

---

## Checklist

- [ ] Page header: back button + title + status chip
- [ ] Form container với shadow/border nhẹ
- [ ] Form header: title + description
- [ ] Divider sau header
- [ ] Field groups với group title màu Brand
- [ ] Fields theo 2-column grid
- [ ] Labels có đánh dấu required (*) nếu cần
- [ ] TextField components (hoặc custom fallback)
- [ ] Dropdown cho các select field (search_design_system("Dropdown") nếu có)
- [ ] Form actions: Cancel (Gray/Outline) + Save (Brand/Solid) — ghim ở ĐÁY form; ⛔ KHÔNG đặt Lưu / Hủy ở đầu form (cạnh tiêu đề)
