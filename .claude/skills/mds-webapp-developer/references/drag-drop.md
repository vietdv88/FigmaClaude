# Drag & Drop — Kanban Card Pattern

> Chuẩn hiệu ứng kéo thả card giữa / trong các cột Kanban.  
> Dùng **HTML5 Drag & Drop API thuần** — NGHIÊM CẤM thư viện ngoài (vue-draggable, Sortable.js…).

---

## 1. State bắt buộc

```js
const dragTaskId       = ref(null)   // id card đang kéo
const dragStarted      = ref(false)  // true SAU khi browser đã capture drag ghost image
const dragOverColId    = ref(null)   // id cột đang hover
const dropBeforeTaskId = ref(null)   // ghost hiện TRƯỚC card này; null = cuối cột
```

---

## 2. Handlers

```js
function onCardDragStart(e, task) {
  dragTaskId.value = task.id
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', String(task.id))
  // ⚠️ BẮT BUỘC setTimeout: browser capture drag ghost TRƯỚC khi card bị mờ
  setTimeout(() => { dragStarted.value = true }, 0)
}

function onCardDragEnd() {
  dragTaskId.value = null
  dragStarted.value = false
  dragOverColId.value = null
  dropBeforeTaskId.value = null
}

function onColDragOver(e, colId) {
  // Vào cột mới → reset về cuối cột
  if (dragOverColId.value !== colId) {
    dragOverColId.value = colId
    dropBeforeTaskId.value = null
  }
  // Chỉ update khi cursor đang trên card thật
  // KHÔNG reset khi target là ghost / vùng trống → tránh jitter
  const cardEl = e.target.closest?.('.kcard:not(.kcard--dragging)')
  if (cardEl) {
    dropBeforeTaskId.value = Number(cardEl.dataset.taskId)
  }
}

function onColDragLeave(e, colId) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    if (dragOverColId.value === colId) {
      dragOverColId.value = null
      dropBeforeTaskId.value = null
    }
  }
}

function onColDrop(targetColId) {
  if (!dragTaskId.value) return
  const tasks = currentTasks.value           // reactive array gốc
  const fromIdx = tasks.findIndex(t => t.id === dragTaskId.value)
  if (fromIdx === -1) return
  const [task] = tasks.splice(fromIdx, 1)
  task.statusId = targetColId                // chuyển cột
  if (dropBeforeTaskId.value !== null) {
    const toIdx = tasks.findIndex(t => t.id === dropBeforeTaskId.value)
    tasks.splice(toIdx !== -1 ? toIdx : tasks.length, 0, task)
  } else {
    tasks.push(task)
  }
  dragTaskId.value = null
  dragStarted.value = false
  dragOverColId.value = null
  dropBeforeTaskId.value = null
}
```

---

## 3. Template

```html
<!-- Column body — nhận drop events -->
<div class="kanban-col__body"
  @dragover.prevent="onColDragOver($event, col.id)"
  @dragleave="onColDragLeave($event, col.id)"
  @drop.prevent="onColDrop(col.id)">

  <!-- ⚠️ Dùng <template v-for> để chèn ghost giữa các card -->
  <template v-for="task in col.tasks" :key="task.id">

    <!-- Ghost trước card này -->
    <div v-if="dragStarted
               && dragOverColId === col.id
               && dropBeforeTaskId === task.id
               && dragTaskId !== task.id"
      class="kcard-ghost"></div>

    <div class="kcard"
      :class="{
        'kcard--dragging': dragStarted && dragTaskId === task.id,
        'kcard--dimmed':   dragStarted && dragTaskId !== task.id,
      }"
      :data-task-id="task.id"
      draggable="true"
      @dragstart="onCardDragStart($event, task)"
      @dragend="onCardDragEnd"
      @click.stop="openTask(task)">
      <!-- nội dung card -->
    </div>

  </template>

  <!-- Ghost cuối cột (dropBeforeTaskId === null) -->
  <div v-if="dragStarted && dragOverColId === col.id && dropBeforeTaskId === null"
    class="kcard-ghost"></div>

  <!-- Nút Thêm luôn ở cuối -->
  <button class="kcol-add" @click.stop="openAddTask(col.id)">
    <TIcon name="plus" />Thêm công việc
  </button>
</div>
```

**Lưu ý template:**
- `data-task-id` bắt buộc trên mỗi card — `onColDragOver` đọc để xác định vị trí.
- Ghost cuối cột đặt sau `</template>`, trước nút Thêm.

---

## 4. CSS bắt buộc

```css
/* Cursor mặc định của card */
.kcard { cursor: grab; }

/* Card đang kéo: mờ → thấy "chỗ trống" nguồn */
.kcard--dragging {
  opacity: 0.22;
  cursor: grabbing;
  box-shadow: none;
  transform: none;
}

/* Các card còn lại: mờ nhẹ, tập trung vào ghost */
.kcard--dimmed {
  opacity: 0.5;
  transition: opacity .12s;
}

/* Ghost placeholder: đẩy card ra, nhấp nháy */
.kcard-ghost {
  flex-shrink: 0;
  min-height: 78px;            /* xấp xỉ chiều cao card */
  border-radius: 8px;
  border: 2px dashed var(--bg-brand);
  background: color-mix(in srgb, var(--bg-brand) 8%, transparent);
  animation: ghost-pulse .9s ease-in-out infinite;
  pointer-events: none;        /* ⚠️ BẮT BUỘC — tránh ghost chặn dragover → jitter */
}

@keyframes ghost-pulse {
  0%, 100% { opacity: .65; }
  50%       { opacity: 1; }
}
```

---

## 5. Nguyên nhân jitter & cách fix

| Nguyên nhân | Giải pháp |
|---|---|
| Ghost đẩy card xuống → cursor rời card → `dropBeforeTaskId = null` → ghost biến → card lên → loop | `pointer-events: none` trên ghost **+** không reset khi `closest('.kcard')` = null |
| Drag ghost (browser) bị mờ cùng card gốc | `setTimeout(() => dragStarted = true, 0)` — delay 1 frame |
| Vị trí nhảy khi kéo sang cột mới | Reset `dropBeforeTaskId = null` khi `dragOverColId` thay đổi |
| `dragleave` false-fire khi hover child element | Dùng `e.currentTarget.contains(e.relatedTarget)` để check |

---

## 6. Checklist trước khi ship

- [ ] `draggable="true"` và `data-task-id` trên mỗi card
- [ ] `@dragover.prevent` trên column body — thiếu `.prevent` → drop không hoạt động
- [ ] `pointer-events: none` trên `.kcard-ghost`
- [ ] `setTimeout` trong `onCardDragStart`
- [ ] `onColDragOver` **không** reset `dropBeforeTaskId` khi target không phải card
- [ ] `onColDragLeave` dùng `contains(relatedTarget)` tránh false-leave
- [ ] `onCardDragEnd` reset toàn bộ 4 state
