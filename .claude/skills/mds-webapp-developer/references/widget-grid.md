# Widget Grid System — Draggable Dashboard

> Pattern lưới widget kéo thả, resize, edit mode dùng lại cho mọi màn hình dashboard.  
> Nguồn: `ketoan-dashboard/src/pages/HomePage.vue`  
> Stack: Vue 3 Composition API + CSS Grid native + HTML5 Drag & Drop API.

---

## 1. Hằng số & Widget Data Structure

```js
/* ── Hằng số lưới — đặt ở module level ── */
const GRID_COLS = 24   // 24 cột → điều chỉnh bước nhỏ
const GRID_GAP  = 20   // gap px giữa các ô

/* ── Một widget ── */
// colStart/rowStart: undefined → CSS auto-placement; set khi vào edit mode
// colSpan/rowSpan: số ô chiếm
// KPI card nhỏ: colSpan:6, rowSpan:3
// Chart/list lớn: colSpan:12, rowSpan:6
// Cột phụ cố định: { colStart:19, rowStart:5, colSpan:6, rowSpan:6 }
const widgets = ref([
  { id:'kpi-revenue', type:'kpi', colSpan:6, rowSpan:3, title:'Doanh thu', source:'Kế toán', icon:'trending-up', color:'#0e9a62', period:'T6/2026', data:{ value:'4.85', unit:'tỷ', trend:'+12.4%', up:true, spark:[3.2,3.8,4.1,3.9,4.4,4.85] } },
  { id:'chart-revenue', type:'chart-line', colSpan:12, rowSpan:6, title:'Doanh thu theo tháng', source:'Kế toán', icon:'chart-line', color:'#0e9a62', period:'6T/2026', data:{} },
  // cột cố định: đặt colStart tường minh
  { id:'quick-actions', type:'quick-actions', colSpan:6, rowSpan:6, colStart:19, rowStart:4, title:'Thao tác nhanh', source:'AMIS', icon:'sparkles', color:'#f79009', showSrc:false, data:{} },
])
```

---

## 2. Refs & State

```js
const wgridEl    = ref(null)    // ref trên element .wgrid
const isEditing  = ref(false)
const gridRowH   = ref(40)      // row height px — tự cập nhật = colWidth (ô vuông)
const dragging   = ref(null)    // id widget đang kéo
const dragOver   = ref(null)    // id widget đang hover
const dropPreview = ref(null)   // { colStart, rowStart, colSpan, rowSpan }
const resizing   = ref(null)    // id widget đang resize
const freshWidgets = ref(new Set())  // id vừa thêm mới → trigger animation

let dragOffsetPx = { x: 0, y: 0 }  // offset chuột trong card khi bắt đầu kéo
let _widgetsSnap = []               // snapshot để cancel edit
```

---

## 3. Ô Vuông — ResizeObserver

Tự động cập nhật `grid-auto-rows` bằng chiều rộng cột → ô luôn vuông.

```js
function updateGridRowSize() {
  const gridEl = wgridEl.value
  if (!gridEl) return
  const colW = Math.floor((gridEl.clientWidth - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS)
  if (colW > 20 && colW !== gridRowH.value) {
    gridEl.style.gridAutoRows = `${colW}px`
    gridRowH.value = colW
    resizeCharts()   // báo chart resize theo
  }
}

const gridRO = new ResizeObserver(updateGridRowSize)

onMounted(async () => {
  await nextTick()
  if (wgridEl.value) { gridRO.observe(wgridEl.value); updateGridRowSize() }
})
onUnmounted(() => { gridRO.disconnect() })
```

---

## 4. Edit Mode

**Thứ tự bắt buộc**: `assignExplicitPositions` → `isEditing = true`  
Nếu đảo ngược → layout nhảy khi vào edit mode.

```js
let _widgetsSnap = []

async function startEdit() {
  _widgetsSnap = widgets.value.map(w => ({ ...w }))
  await nextTick()
  assignExplicitPositions()   // đọc DOM positions TRƯỚC khi set isEditing
  isEditing.value = true
}

function saveEdit()   { isEditing.value = false }
function cancelEdit() { widgets.value = _widgetsSnap; isEditing.value = false }

// Đọc vị trí thực tế từ DOM → gán colStart/rowStart tường minh
function assignExplicitPositions() {
  const gridEl = wgridEl.value
  if (!gridEl) return
  const gridRect = gridEl.getBoundingClientRect()
  const cellW = (gridRect.width - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS
  const ROW_H = gridRowH.value
  const cardEls = [...gridEl.querySelectorAll('.wcard:not(.wcard--ghost)')]
  widgets.value.forEach((w, idx) => {
    if (w.colStart && w.rowStart) return   // đã có → bỏ qua
    const el = cardEls[idx]
    if (!el) return
    const rect = el.getBoundingClientRect()
    w.colStart = Math.max(1, Math.round((rect.left - gridRect.left) / (cellW + GRID_GAP)) + 1)
    w.rowStart = Math.max(1, Math.round((rect.top  - gridRect.top)  / (ROW_H + GRID_GAP)) + 1)
  })
}
```

---

## 5. Drag & Drop

### 5.1 Bắt đầu kéo — ghi offset chuột trong card
```js
function onDragStart(e, id) {
  dragging.value = id
  dropPreview.value = null
  e.dataTransfer.effectAllowed = 'move'
  const cardRect = e.currentTarget.getBoundingClientRect()
  dragOffsetPx = { x: e.clientX - cardRect.left, y: e.clientY - cardRect.top }
  nextTick(() => {
    if (!wgridEl.value) return
    const colW = (wgridEl.value.clientWidth - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS
    wgridEl.value.style.setProperty('--gcw', `${colW}px`)
  })
}
```

### 5.2 Drag over — tính snap position theo góc trên-trái card (không phải cursor)
```js
function onWgridDragOver(e) {
  if (!isEditing.value || !dragging.value || !wgridEl.value) return
  e.preventDefault()
  const draggedW = widgets.value.find(w => w.id === dragging.value)
  if (!draggedW) return
  const gridRect = wgridEl.value.getBoundingClientRect()
  const cellW = (gridRect.width - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS
  const relX = e.clientX - gridRect.left - dragOffsetPx.x   // trừ offset → góc trên-trái card
  const relY = e.clientY - gridRect.top  - dragOffsetPx.y
  const colStart = Math.max(1, Math.min(GRID_COLS - draggedW.colSpan + 1, Math.floor(relX / (cellW + GRID_GAP)) + 1))
  const rowStart = Math.max(1, Math.floor(relY / (gridRowH.value + GRID_GAP)) + 1)
  if (!dropPreview.value || dropPreview.value.colStart !== colStart || dropPreview.value.rowStart !== rowStart) {
    dropPreview.value = { colStart, rowStart, colSpan: draggedW.colSpan, rowSpan: draggedW.rowSpan }
  }
}
```

### 5.3 Drop — đặt vị trí và đẩy widget chồng lấn
```js
function onWgridDrop(e) {
  e.preventDefault()
  if (!dragging.value || !dropPreview.value) return
  const id = dragging.value
  const widget = widgets.value.find(w => w.id === id)
  if (widget) {
    widget.colStart = dropPreview.value.colStart
    widget.rowStart = dropPreview.value.rowStart
    pushOverlapping(id)
  }
  dragging.value = null
  dragOver.value = null
  dropPreview.value = null
  nextTick(() => resizeCharts())
}

function onDragEnd() { dragging.value = null; dragOver.value = null; dropPreview.value = null }
```

### 5.4 Push-aside — đẩy widget bị chồng lấn
```js
function pushOverlapping(movedId) {
  function overlaps(a, b) {
    if (a.id === b.id) return false
    return a.colStart <= b.colStart + b.colSpan - 1 &&
           a.colStart + a.colSpan - 1 >= b.colStart &&
           a.rowStart <= b.rowStart + b.rowSpan - 1 &&
           a.rowStart + a.rowSpan - 1 >= b.rowStart
  }
  for (let pass = 0; pass < 30; pass++) {
    let anyMoved = false
    for (const w of widgets.value) {
      if (w.id === movedId) continue
      const conflict = widgets.value.find(other => overlaps(w, other))
      if (!conflict) continue
      anyMoved = true
      const newColStart = conflict.colStart + conflict.colSpan
      if (newColStart + w.colSpan - 1 <= GRID_COLS) {
        w.colStart = newColStart
        w.rowStart = conflict.rowStart
      } else {
        w.colStart = 1
        w.rowStart = conflict.rowStart + conflict.rowSpan
      }
    }
    if (!anyMoved) break
  }
}
```

---

## 6. Resize Handle

Kéo góc dưới-phải để thay đổi colSpan/rowSpan. Dùng `mousemove` trực tiếp (không qua HTML5 drag).

```js
function startResize(e, widgetId) {
  e.preventDefault(); e.stopPropagation()
  const widget = widgets.value.find(w => w.id === widgetId)
  if (!widget || !wgridEl.value) return

  resizing.value = widgetId
  const gridRect = wgridEl.value.getBoundingClientRect()
  const cellW = (gridRect.width - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS
  const cellH = gridRowH.value + GRID_GAP
  const startX = e.clientX, startY = e.clientY
  const startColSpan = widget.colSpan, startRowSpan = widget.rowSpan

  function onMove(ev) {
    const maxCS = GRID_COLS - (widget.colStart || 1) + 1
    widget.colSpan = Math.max(3, Math.min(maxCS, startColSpan + Math.round((ev.clientX - startX) / cellW)))
    widget.rowSpan = Math.max(1, Math.min(12,    startRowSpan + Math.round((ev.clientY - startY) / cellH)))
  }
  function onUp() {
    resizing.value = null
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    nextTick(() => resizeCharts())
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}
```

---

## 7. Thêm / Xoá Widget

```js
// Catalog dùng để thêm widget mới
const catalog = [
  { id:'kpi-revenue', type:'kpi', colSpan:6, rowSpan:3, title:'...', source:'...', icon:'...', color:'#0e9a62', size:'Nhỏ', data:{} },
  { id:'chart-revenue', type:'chart-line', colSpan:12, rowSpan:6, title:'...', source:'...', icon:'chart-line', color:'#0e9a62', size:'Lớn', data:{} },
]

function toggleWidget(cat) {
  const idx = widgets.value.findIndex(w => w.id === cat.id)
  if (idx >= 0) {
    // Xoá — dispose chart nếu có
    const inst = chartInstances[cat.id]
    if (inst) { inst.dispose(); delete chartInstances[cat.id] }
    widgets.value.splice(idx, 1)
  } else {
    // Thêm — clone catalog item, tìm vị trí cuối
    const newW = { ...cat }
    const maxRow = widgets.value.reduce((m, w) => Math.max(m, (w.rowStart || 1) + w.rowSpan - 1), 0)
    newW.rowStart = maxRow + 1
    newW.colStart = 1
    widgets.value.push(newW)
    freshWidgets.value.add(newW.id)
    nextTick(() => { initCharts(); setTimeout(() => freshWidgets.value.delete(newW.id), 800) })
  }
}

function removeWidget(id) {
  const inst = chartInstances[id]
  if (inst) { inst.dispose(); delete chartInstances[id] }
  widgets.value = widgets.value.filter(w => w.id !== id)
}
```

---

## 8. editGridCells — Computed lưới nền edit mode

```js
const editGridCells = computed(() => {
  if (!isEditing.value) return []
  const maxRow = widgets.value.reduce((m, w) => Math.max(m, (w.rowStart || 1) + (w.rowSpan || 1) - 1), 8)
  const rows = maxRow + 3   // thêm 3 hàng trống ở đáy để thả widget
  const cells = []
  for (let r = 1; r <= rows; r++)
    for (let c = 1; c <= GRID_COLS; c++)
      cells.push({ col: c, row: r })
  return cells
})
```

---

## 9. Template HTML

```html
<div ref="wgridEl" class="wgrid"
  :class="{ 'wgrid--editing': isEditing, 'wgrid--dragging': dragging }"
  @dragover="onWgridDragOver"
  @drop="onWgridDrop"
>
  <!-- Lưới nền — chỉ hiện khi edit -->
  <div v-for="cell in editGridCells" :key="`gc-${cell.col}-${cell.row}`"
    class="wgrid__cell"
    :style="{ gridColumn: cell.col, gridRow: cell.row }">
  </div>

  <!-- Drop ghost — snap preview -->
  <div v-if="isEditing && dropPreview" class="wgrid__drop-ghost"
    :style="{ gridColumn: `${dropPreview.colStart} / span ${dropPreview.colSpan}`,
              gridRow:    `${dropPreview.rowStart} / span ${dropPreview.rowSpan}` }">
  </div>

  <!-- Widgets -->
  <div
    v-for="(w, idx) in widgets" :key="w.id"
    class="wcard"
    :class="{
      'wcard--dragging':  dragging === w.id,
      'wcard--over':      dragOver === w.id,
      'wcard--new':       freshWidgets.has(w.id),
      'wcard--resizing':  resizing === w.id,
      'wcard--kpi':       w.type === 'kpi',
    }"
    :style="{
      gridColumn: w.colStart ? `${w.colStart} / span ${w.colSpan}` : `span ${w.colSpan}`,
      gridRow:    w.rowStart ? `${w.rowStart} / span ${w.rowSpan}` : `span ${w.rowSpan}`,
      '--delay': idx * 0.055 + 's',
      '--accent': w.color,
    }"
    :draggable="isEditing"
    @dragstart="onDragStart($event, w.id)"
    @dragover.prevent="dragOver = w.id"
    @dragleave="dragOver = null"
    @dragend="onDragEnd"
  >
    <!-- Header -->
    <div v-if="!w.customHd || isEditing" class="wcard__hd">
      <div v-if="!w.customHd" class="wcard__hd-l">
        <span v-if="w.type !== 'kpi'" class="wcard__icon" :style="{ color: w.color }">
          <TIcon :name="w.icon" />
        </span>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div class="wcard__title">{{ w.title }}</div>
          <div v-if="w.showSrc !== false && w.type !== 'kpi'" class="wcard__src">{{ w.source }}</div>
        </div>
      </div>
      <div class="wcard__hd-r">
        <span v-if="w.period && !isEditing" class="wcard__period">{{ w.period }}</span>
        <button v-if="!isEditing" class="wc-btn"><TIcon name="dots-vertical" /></button>
        <button v-if="isEditing" class="wc-btn wc-btn--del" @click.stop="removeWidget(w.id)"><TIcon name="x" /></button>
        <span v-if="isEditing" class="drag-handle"><TIcon name="dots" /></span>
      </div>
    </div>

    <!-- Resize handle — chỉ hiện khi edit -->
    <div v-if="isEditing" class="wcard__resize"
      :class="{ 'wcard__resize--active': resizing === w.id }"
      @mousedown="startResize($event, w.id)">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M4 10L10 4M7 10L10 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </div>

    <!-- Body content theo type -->
    <div class="wcard__bd">
      <!-- ... -->
    </div>
  </div>

  <!-- Ghost tile — thêm widget -->
  <div v-if="isEditing" class="wcard wcard--ghost" style="grid-column: span 6"
    @click="showCatalog = true">
    <TIcon name="plus" />
    <span>Thêm widget</span>
  </div>
</div>
```

---

## 10. CSS

```css
/* ── Wgrid ── */
.wgrid {
  flex: 1; overflow: visible; padding: 4px 0 16px;
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  grid-auto-rows: 40px;   /* override bởi updateGridRowSize() */
  gap: 20px;
  align-content: start;
}

/* ── Wcard base ── */
.wcard {
  background: var(--h-card); border-radius: 20px;
  backdrop-filter: var(--h-blur); -webkit-backdrop-filter: var(--h-blur);
  border: 1px solid var(--h-border);
  box-shadow: var(--h-shadow);
  display: flex; flex-direction: column;
  animation: fadeInUp .4s ease backwards; animation-delay: var(--delay, 0s);
  transition: box-shadow .22s ease, opacity .18s ease, transform .22s cubic-bezier(.34,1.56,.64,1);
  position: relative;
}

/* Dark mode glassmorphism */
.amis-dark .wcard {
  border: none;
  box-shadow: 0 0 0 0.5px rgba(255,255,255,0.20), inset 0 0.5px 0 rgba(255,255,255,0.18);
  background-color: transparent;
  background-image:
    radial-gradient(circle at 50% -20%, rgb(255 255 255 / 3%), transparent 46%),
    linear-gradient(rgba(255,255,255,0.06), rgba(255,255,255,0.06)),
    linear-gradient(rgba(10,8,20,0.46), rgba(10,8,20,0.46));
}

/* Rainbow border on hover */
.wcard::after {
  content: ''; position: absolute; inset: 0; border-radius: 20px;
  background: linear-gradient(60deg, #f79533,#f37055,#ef4e7b,#a166ab,#5073b8,#1098ad,#07b39b,#6fba82,#f79533,#f37055);
  background-size: 300%; opacity: 0; transition: opacity .3s; pointer-events: none; z-index: 20;
  padding: 1px;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: destination-out;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  animation: rainbow-move 3s ease alternate infinite; animation-play-state: paused;
}
.wcard:hover::after { opacity: 1; animation-play-state: running; }

/* Hover */
.wcard:hover { background: rgba(255,255,255,0.82); box-shadow: var(--h-shadow-hv); }

/* States */
.wcard--new {
  animation: springPop .58s cubic-bezier(.34,1.56,.64,1) forwards !important;
  animation-delay: 0s !important;
}
.wcard--dragging {
  opacity: .22; transform: scale(.93) rotate(-0.8deg);
  filter: blur(1.5px) saturate(0.8);
  box-shadow: 0 24px 64px rgba(0,0,0,.5) !important;
  z-index: 100;
}
.wcard--over {
  box-shadow: 0 0 0 2.5px #4a7ff7, 0 0 0 7px rgba(36,95,223,.26), 0 12px 48px rgba(36,95,223,.22) !important;
  transform: scale(1.025) translateY(-2px); z-index: 5;
  animation: drop-pulse .85s ease-in-out infinite alternate;
}
.wcard--over::before {
  content: ''; position: absolute; inset: 0; border-radius: 16px;
  background: rgba(36,95,223,.07); z-index: 1; pointer-events: none;
}
.wcard--resizing {
  outline: 2px solid rgba(74,127,247,.55); outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(36,95,223,.12), 0 12px 40px rgba(36,95,223,.18) !important;
  transition: none !important;
}

/* Ghost tile */
.wcard--ghost {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  border: 2px dashed var(--h-border); border-radius: 20px;
  background: rgba(255,255,255,.08); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  box-shadow: none; cursor: pointer; color: var(--h-text-2); font-size: 13px;
}
.wcard--ghost:hover { border-color: #245fdf; color: #245fdf; background: rgba(36,95,223,.04); }

/* Edit mode cursor */
.wgrid--editing .wcard:not(.wcard--ghost) { cursor: grab; }
.wgrid--editing .wcard:not(.wcard--ghost):active { cursor: grabbing; }

/* Jiggle khi vào edit */
@keyframes editJiggle {
  0%,100% { transform: rotate(0deg); }
  20%     { transform: rotate(-0.6deg); }
  50%     { transform: rotate(0.6deg); }
  80%     { transform: rotate(-0.3deg); }
}
.wgrid--editing .wcard:not(.wcard--ghost):not(.wcard--dragging) {
  animation: editJiggle .5s ease-in-out 1;
}

/* Dim other cards khi drag */
.wgrid--dragging .wcard:not(.wcard--dragging) {
  opacity: 0.55; transition: opacity .15s ease !important;
}

/* ── Grid cell overlay ── */
.wgrid__cell {
  border-radius: 10px; border: 1.5px dashed rgba(36,95,223,.18);
  background: rgba(36,95,223,.04); pointer-events: none; z-index: 0;
  transition: border-color .2s, background .2s;
}
.amis-dark .wgrid__cell { border-color: rgba(150,180,255,.15); background: rgba(150,180,255,.03); }

/* ── Drop ghost / snap preview ── */
.wgrid__drop-ghost {
  border-radius: 16px; border: 2px dashed #4a7ff7;
  background: rgba(36,95,223,.10); pointer-events: none; z-index: 3;
  animation: ghostPop .12s cubic-bezier(.34,1.56,.64,1);
}
.amis-dark .wgrid__drop-ghost { border-color: rgba(122,173,255,.70); background: rgba(122,173,255,.10); }
@keyframes ghostPop {
  from { opacity: 0; transform: scale(.96); }
  to   { opacity: 1; transform: scale(1); }
}

/* ── Resize handle ── */
.wcard__resize {
  position: absolute; bottom: 6px; right: 6px;
  width: 22px; height: 22px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  cursor: se-resize; color: var(--h-text-3);
  transition: color .15s, background .15s, transform .15s cubic-bezier(.34,1.56,.64,1), opacity .15s;
  z-index: 10; opacity: 0.5;
}
.wcard__resize:hover { color: var(--h-text-1); background: var(--h-hover); transform: scale(1.2); opacity: 1; }
.wcard__resize--active {
  color: #4a7ff7; background: rgba(36,95,223,.15);
  transform: scale(1.15); opacity: 1;
}

/* ── Keyframes ── */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px) scale(.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes springPop {
  0%   { opacity: 0; transform: scale(.7) translateY(20px); }
  60%  { opacity: 1; transform: scale(1.04) translateY(-4px); }
  80%  { transform: scale(.98); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes drop-pulse {
  from { box-shadow: 0 0 0 2.5px #4a7ff7, 0 0 0 7px rgba(36,95,223,.26), 0 8px 32px rgba(36,95,223,.18); }
  to   { box-shadow: 0 0 0 2.5px #4a7ff7, 0 0 0 10px rgba(36,95,223,.12), 0 16px 48px rgba(36,95,223,.26); }
}
@keyframes rainbow-move {
  0%   { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
```

---

## 11. Checklist trước khi dùng

- [ ] `GRID_COLS` và `GRID_GAP` là hằng số module-level — không hardcode trong function
- [ ] `gridRO` (ResizeObserver) observe `wgridEl` trong `onMounted`, disconnect trong `onUnmounted`
- [ ] `startEdit()` gọi `assignExplicitPositions()` TRƯỚC khi set `isEditing = true`
- [ ] `dragOffsetPx` là `let` (không phải `ref`) — đủ dùng, không cần reactive
- [ ] `pushOverlapping` dùng `GRID_COLS` constant — không hardcode số cột
- [ ] Resize: `colSpan` tối thiểu 3, `rowSpan` tối thiểu 1, tối đa 12
- [ ] `freshWidgets` là `Set` — nhớ `delete` id sau khi animation chạy xong (~800ms)
- [ ] Sau `onWgridDrop` và `startResize.onUp` đều cần `nextTick(() => resizeCharts())`
