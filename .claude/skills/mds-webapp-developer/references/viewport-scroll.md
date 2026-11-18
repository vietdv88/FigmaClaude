# Viewport-Level Horizontal Scroll — Pattern Chuẩn

> Áp dụng khi cần toàn bộ trang (header + sidebar + content) scroll ngang  
> ở cấp viewport thay vì co nhỏ responsive. Min-width = 1024px.

---

## Vấn đề

`.app-shell` trong mds-ui dùng `width: 100vw` — luôn bằng viewport width,  
**bỏ qua** `min-width` trên `body`/`html`. Nếu chỉ set `body { min-width: 1024px }`  
mà không override `width: 100vw`, app-shell vẫn co theo viewport → content bị clip.

---

## CSS Pattern (3 rules bắt buộc)

```css
/* ① html scroll ngang khi body rộng hơn viewport */
html {
  overflow-x: auto;
}

/* ② body không co dưới ngưỡng tối thiểu
      Khi có panel bên phải: dùng CSS variable --ava-panel-width (set bằng JS)
      để min-width tự cộng thêm chiều rộng panel */
body {
  min-width: max(1024px, calc(var(--layout-sidebar-w, 200px) + var(--ava-panel-width, 0px) + 600px));
}

/* ③ Override width: 100vw của mds-ui → 100% theo body (có min-width) */
.app-shell {
  width: 100%;
}
```

Đặt 3 rules này trong **`src/style.css`** của project (import **sau** `@mds/style.css`).

---

## Khi có panel bên phải có thể resize (ví dụ AVA Chat)

Dùng CSS variable `--ava-panel-width` set bằng JS để body min-width tự điều chỉnh:

```js
// Trong component chứa panel (ví dụ KetoanDashboard.vue)
import { ref, watchEffect } from 'vue'

const showPanel = ref(false)
const panelWidth = ref(420)   // default width của panel

watchEffect(() => {
  const w = showPanel.value ? panelWidth.value : 0
  document.documentElement.style.setProperty('--ava-panel-width', w + 'px')
})
```

Panel component emit `resize` event khi user kéo:

```js
// Trong AVAChatPanel.vue (hoặc bất kỳ resizable panel nào)
const emit = defineEmits(['close', 'resize'])
watch(panelWidth, w => emit('resize', w))
```

KetoanDashboard lắng nghe:
```html
<AVAChatPanel @close="showPanel = false" @resize="panelWidth = $event" />
```

---

## CSS trong component chứa layout

```css
/* Scoped CSS — override min-width: 0 của mds-ui cho main-content */
.main-content { min-width: 600px; }

/* Override width: 100vw của mds-ui (root element = app-shell) */
.app-shell { width: 100%; }
```

---

## Cơ chế hoạt động (để giải thích cho người khác)

```
Viewport 800px
    │
    ▼
html { overflow-x: auto }
    │
    ▼
body { min-width: 1024px }   ← 1024px > 800px → body = 1024px
    │
    ▼
.app-shell { width: 100% }   ← 100% of body = 1024px
    │                          (KHÔNG phải 100vw = 800px)
    ▼
body-row [sidebar 200px] [main-content 824px]   ← fits in 1024px
    │
    ▼
html scrollbar = 1024 - 800 = 224px extra   ← WHOLE PAGE scrolls
```

Khi panel mở (420px), `--ava-panel-width = 420px`:
```
body min-width = max(1024, 200+420+600) = max(1024, 1220) = 1220px
html scrollbar = 1220 - 800 = 420px extra
body-row: sidebar(200) + main(600) + panel(420) = 1220px ✓
```

---

---

## CẢNH BÁO: transform animation + overflow:hidden

**Vấn đề:** Khi dùng `transform: translateX(...)` trong CSS Transition để animate một panel,  
browser promote element lên **GPU compositing layer riêng**.  
Lúc đó `overflow: hidden` của parent **không clip được** → panel render thoát ra ngoài bounds,  
có thể đè lên header hoặc các vùng khác ngoài body-row.

**Fix:** Dùng `clip-path` thay vì `transform` cho slide animation:
```css
/* ĐÚNG — clip-path clip chính element, không tạo GPU layer riêng */
.ava-slide-enter-active { transition: clip-path 0.28s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease; }
.ava-slide-leave-active { transition: clip-path 0.22s ease-in, opacity 0.18s ease; }
.ava-slide-enter-from  { clip-path: inset(0 0 0 100%); opacity: 0; }  /* ẩn từ phải sang */
.ava-slide-leave-to    { clip-path: inset(0 0 0 100%); opacity: 0; }

/* SAI — transform tạo GPU layer, thoát overflow:hidden */
/* .ava-slide-enter-from { transform: translateX(100%); } */
```

**Belt-and-suspenders:** Thêm `contain: paint` vào container (body-row):
```css
.body-row { contain: paint; }
```
`contain: paint` buộc browser clip tất cả children (kể cả GPU-composited) trong bounds của element.

---

## Checklist

- [ ] `import './style.css'` đặt **sau** `import '@mds/style.css'` trong `main.js`
- [ ] 3 rules HTML/body/app-shell trong `src/style.css`
- [ ] `main-content { min-width: 600px }` trong scoped CSS của page component
- [ ] Nếu có resizable panel: dùng CSS variable `--ava-panel-width`
- [ ] KHÔNG đặt `overflow-x: auto` trực tiếp trên `.app-shell` (CSS spec buộc thành `auto` khi overflow-y là hidden, tạo scroll trên shell thay vì viewport)
