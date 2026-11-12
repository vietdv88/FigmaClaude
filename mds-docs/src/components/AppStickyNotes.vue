<template>
  <!-- Sticky note: màu vàng post-it, kéo được, resize được -->
  <div class="sn-root" ref="rootEl">
    <!-- Nút mở (fab) -->
    <button v-if="!open" type="button" class="sn-fab" aria-label="Ghi chú nhanh" title="Ghi chú nhanh" @click="openPanel">
      <svg class="sn-fab-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 2.5h9.5L17 6v11a1.5 1.5 0 01-1.5 1.5H4A1.5 1.5 0 012.5 17V4A1.5 1.5 0 014 2.5z"/>
        <path d="M13.5 2.5V6H17"/>
        <line x1="6" y1="9" x2="14" y2="9"/>
        <line x1="6" y1="12" x2="14" y2="12"/>
        <line x1="6" y1="15" x2="10" y2="15"/>
      </svg>
      <span v-if="undone > 0" class="sn-badge">{{ undone > 9 ? '9+' : undone }}</span>
    </button>

    <!-- Panel sticky note -->
    <div v-if="open" class="sn-panel" :style="panelStyle" role="dialog" aria-label="Ghi chú nhanh">
      <!-- Thanh kéo = header -->
      <div class="sn-header" @mousedown="startDrag" @touchstart.passive="startDragTouch">
        <svg class="sn-title-icon" viewBox="0 0 14 14" fill="none" stroke="#5a4000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2.5 1h7L12 3.5v9a1 1 0 01-1 1h-8a1 1 0 01-1-1V2a1 1 0 011-1z"/>
          <path d="M9.5 1v2.5H12"/>
          <line x1="4" y1="6" x2="9" y2="6"/>
          <line x1="4" y1="8.5" x2="8" y2="8.5"/>
        </svg>
        <span class="sn-title">Ghi chú</span>
        <span v-if="user" class="sn-sync-dot" title="Đã đồng bộ tài khoản">☁</span>
        <span v-else class="sn-sync-dot sn-sync-dot--local" :title="'Chưa đăng nhập — lưu trình duyệt\nĐăng nhập để đồng bộ'">💾</span>
        <button type="button" class="sn-close" aria-label="Đóng" @click="open = false">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/></svg>
        </button>
      </div>

      <!-- Ô nhập nhanh — form để Enter submit đáng tin cậy nhất trên mọi trình duyệt -->
      <form class="sn-add" @submit.prevent="addNote" @mousedown.stop>
        <input ref="inputEl" v-model="draft" type="text" class="sn-input" placeholder="Nhập ghi chú rồi Enter…" maxlength="200" />
      </form>

      <!-- Danh sách -->
      <div class="sn-list" @mousedown.stop>
        <div v-if="!notes.length" class="sn-empty">Chưa có ghi chú nào</div>
        <div v-for="n in notes" :key="n.id" class="sn-item" :class="{ 'sn-item--done': n.done }">
          <button type="button" class="sn-check" :aria-label="n.done ? 'Bỏ hoàn thành' : 'Đánh dấu xong'" @click="toggle2(n)">
            <svg v-if="n.done" viewBox="0 0 14 14" fill="none"><rect width="14" height="14" rx="3" fill="#b8860b"/><path d="M3 7l2.5 2.5L11 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <svg v-else viewBox="0 0 14 14" fill="none"><rect x=".75" y=".75" width="12.5" height="12.5" rx="2.25" stroke="#b8860b" stroke-width="1.5"/></svg>
          </button>
          <span v-if="editId !== n.id" class="sn-text" @dblclick="startEdit(n)" title="Nhấp đúp để sửa">{{ n.text }}</span>
          <input v-else ref="editEl" v-model="editText" type="text" class="sn-edit-input" maxlength="200"
            @keydown.enter.prevent="commitEdit(n)" @keydown.esc.stop="editId = null" @blur="commitEdit(n)" @mousedown.stop />
          <button type="button" class="sn-del" aria-label="Xóa" @click="del(n)">×</button>
        </div>
      </div>

      <!-- Xóa đã xong -->
      <div v-if="doneCount > 0" class="sn-footer" @mousedown.stop>
        <button type="button" class="sn-clear" @click="clearDone">🗑 Xóa {{ doneCount }} việc xong</button>
      </div>

      <!-- Resize handles -->
      <div class="sn-resize sn-resize--e" @mousedown.stop="startResize($event, 'e')" />
      <div class="sn-resize sn-resize--s" @mousedown.stop="startResize($event, 's')" />
      <div class="sn-resize sn-resize--se" @mousedown.stop="startResize($event, 'se')" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  user: { type: Object, default: null },
  loginUrl: { type: String, default: '/ds/dang-nhap' },
})

const LS_KEY  = 'mds-sticky-notes'
const LS_POS  = 'mds-sticky-pos'
const LS_SIZE = 'mds-sticky-size'
const API = '/api/ds/notes'

const open    = ref(false)
const notes   = ref([])
const draft   = ref('')
const syncing = ref(false)
const editId  = ref(null)
const editText = ref('')
const inputEl = ref(null)
const editEl  = ref(null)
const rootEl  = ref(null)

// Vị trí + kích thước (kéo / resize)
const pos  = ref({ x: 0, y: 0 })
const size = ref({ w: 240, h: 320 })

const panelStyle = computed(() => ({
  left:   pos.value.x + 'px',
  top:    pos.value.y + 'px',
  width:  size.value.w + 'px',
  height: size.value.h + 'px',
}))

function loadPos()  { try { const p = JSON.parse(localStorage.getItem(LS_POS)  || 'null'); if (p) pos.value  = p } catch {} }
function savePos()  { try { localStorage.setItem(LS_POS,  JSON.stringify(pos.value))  } catch {} }
function loadSize() { try { const s = JSON.parse(localStorage.getItem(LS_SIZE) || 'null'); if (s) size.value = s } catch {} }
function saveSize() { try { localStorage.setItem(LS_SIZE, JSON.stringify(size.value)) } catch {} }

function defaultPos() {
  pos.value = { x: Math.max(8, window.innerWidth - size.value.w - 24), y: Math.max(8, window.innerHeight - size.value.h - 80) }
}

// ── Drag ──
let drag = null
function startDrag(e) {
  if (e.button !== 0) return
  drag = { x0: e.clientX - pos.value.x, y0: e.clientY - pos.value.y }
  document.documentElement.style.cursor = 'grabbing'
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', stopDrag)
}
function startDragTouch(e) {
  const t = e.touches[0]
  drag = { x0: t.clientX - pos.value.x, y0: t.clientY - pos.value.y }
  window.addEventListener('touchmove', onMoveTouch, { passive: false })
  window.addEventListener('touchend', stopDrag)
}
function onMove(e) { if (!drag) return; clampPos(e.clientX - drag.x0, e.clientY - drag.y0) }
function onMoveTouch(e) { if (!drag) return; e.preventDefault(); const t = e.touches[0]; clampPos(t.clientX - drag.x0, t.clientY - drag.y0) }
function clampPos(x, y) {
  pos.value = { x: Math.max(0, Math.min(x, window.innerWidth  - size.value.w)),
                y: Math.max(0, Math.min(y, window.innerHeight - 50)) }
}
function stopDrag() {
  drag = null; savePos()
  document.documentElement.style.cursor = ''
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup',   stopDrag)
  window.removeEventListener('touchmove', onMoveTouch)
  window.removeEventListener('touchend',  stopDrag)
}

// ── Resize ──
const MIN_W = 180, MIN_H = 180, MAX_W = 500, MAX_H = 640
let resizeDir = null, resizeStart = null
function startResize(e, dir) {
  if (e.button !== 0) return
  e.preventDefault()
  resizeDir   = dir
  resizeStart = { x: e.clientX, y: e.clientY, w: size.value.w, h: size.value.h }
  const cursors = { e: 'ew-resize', s: 'ns-resize', se: 'se-resize' }
  document.documentElement.style.cursor = cursors[dir]
  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup',   stopResize)
}
function onResize(e) {
  if (!resizeStart) return
  const dx = e.clientX - resizeStart.x
  const dy = e.clientY - resizeStart.y
  const next = { ...size.value }
  if (resizeDir.includes('e')) next.w = Math.max(MIN_W, Math.min(MAX_W, resizeStart.w + dx))
  if (resizeDir.includes('s')) next.h = Math.max(MIN_H, Math.min(MAX_H, resizeStart.h + dy))
  size.value = next
}
function stopResize() {
  resizeDir = null; resizeStart = null; saveSize()
  document.documentElement.style.cursor = ''
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup',   stopResize)
}

const undone    = computed(() => notes.value.filter(n => !n.done).length)
const doneCount = computed(() => notes.value.filter(n =>  n.done).length)

// ── Storage ──
function lsLoad()      { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] } }
function lsSave(list)  { try { localStorage.setItem(LS_KEY, JSON.stringify(list)) } catch {} }

async function apiGet()         { const r = await fetch(API); if (!r.ok) throw new Error(); return (await r.json()).notes || [] }
async function apiPost(text)    { const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }); if (!r.ok) throw new Error(); return (await r.json()).note }
async function apiPut(id, body) { await fetch(`${API}/${id}`, { method: 'PUT',    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) }
async function apiDel(id)       { await fetch(`${API}/${id}`, { method: 'DELETE' }) }

async function load() {
  if (props.user) { syncing.value = true; try { notes.value = await apiGet() } catch {} finally { syncing.value = false } }
  else notes.value = lsLoad()
}

async function addNote() {
  const text = draft.value.trim(); if (!text) return; draft.value = ''
  // Thêm ngay vào danh sách (optimistic update — hiện ngay dù chưa sync server)
  const localId = Date.now().toString(36) + Math.random().toString(36).slice(2)
  const n = { id: localId, text, done: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  notes.value = [n, ...notes.value]
  if (props.user) {
    syncing.value = true
    try {
      const saved = await apiPost(text)
      // Cập nhật ID server cho note vừa thêm
      notes.value = notes.value.map(x => x.id === localId ? saved : x)
    } catch { /* giữ bản local nếu API lỗi */ } finally { syncing.value = false }
  } else {
    lsSave(notes.value)
  }
}

async function toggle2(n) {
  n.done = !n.done; n.updatedAt = new Date().toISOString()
  if (props.user) { syncing.value = true; try { await apiPut(n.id, { done: n.done }) } catch {} finally { syncing.value = false } }
  else lsSave(notes.value)
}

async function del(n) {
  notes.value = notes.value.filter(x => x.id !== n.id)
  if (props.user) { try { await apiDel(n.id) } catch {} } else lsSave(notes.value)
}

async function clearDone() {
  const done = notes.value.filter(n => n.done); notes.value = notes.value.filter(n => !n.done)
  if (props.user) { for (const d of done) { try { await apiDel(d.id) } catch {} } } else lsSave(notes.value)
}

function startEdit(n) { editId.value = n.id; editText.value = n.text; nextTick(() => editEl.value?.[0]?.focus()) }
async function commitEdit(n) {
  if (!editId.value) return; editId.value = null
  const text = editText.value.trim(); if (!text || text === n.text) return
  n.text = text; n.updatedAt = new Date().toISOString()
  if (props.user) { try { await apiPut(n.id, { text }) } catch {} } else lsSave(notes.value)
}

function openPanel() { open.value = true }
function onKey(e) { if (e.key === 'Escape' && open.value) open.value = false }

watch(open, v => { if (v) { load(); nextTick(() => inputEl.value?.focus()) } })
watch(() => props.user, () => { if (open.value) load() })
onMounted(() => {
  loadPos(); loadSize()
  if (!localStorage.getItem(LS_POS)) defaultPos()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => { window.removeEventListener('keydown', onKey); stopDrag(); stopResize() })
</script>

<style>
.sn-root { position: fixed; z-index: calc(var(--z-header-pop, 9600) - 10); pointer-events: none; inset: 0; }

/* ── Fab ── */
.sn-fab {
  position: absolute; bottom: 24px; right: 24px;
  pointer-events: auto;
  width: 40px; height: 40px; border-radius: 50%;
  background: #f5c518; color: #5a4000; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 10px rgba(0,0,0,.22);
  transition: background .15s, transform .15s;
}
.sn-fab:hover  { background: #e8b800; }
.sn-fab:active { transform: scale(.9); }
.sn-fab-icon   { width: 20px; height: 20px; display: block; }
.sn-badge {
  position: absolute; top: -3px; right: -3px;
  min-width: 16px; height: 16px; padding: 0 3px;
  border-radius: 8px; border: 2px solid #fff;
  background: #e63946; color: #fff;
  font: 700 10px/12px sans-serif;
  display: flex; align-items: center; justify-content: center;
}

/* ── Panel ── */
.sn-panel {
  position: absolute; pointer-events: auto;
  display: flex; flex-direction: column;
  background: #fff9c4;
  border-radius: 8px;
  box-shadow: 3px 6px 20px rgba(0,0,0,.24), inset 0 -1px 0 rgba(0,0,0,.06);
  font-family: var(--font-family, sans-serif);
  overflow: hidden;
  user-select: none;
}

/* ── Header ── */
.sn-header {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 8px 5px;
  background: #f5c518;
  cursor: grab; flex-shrink: 0;
}
.sn-header:active { cursor: grabbing; }
.sn-title-icon { width: 14px; height: 14px; display: block; flex-shrink: 0; }
.sn-title      { font-size: 12px; font-weight: 700; color: #5a4000; flex: 1; }
.sn-sync-dot   { font-size: 13px; opacity: .7; cursor: default; }
.sn-close {
  width: 20px; height: 20px; border-radius: 50%;
  border: none; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #5a4000; transition: background .12s; flex-shrink: 0;
}
.sn-close:hover { background: rgba(0,0,0,.18); }
.sn-close svg   { width: 12px; height: 12px; display: block; }

/* ── Add ── */
.sn-add { padding: 6px 8px; border-bottom: 1px solid rgba(0,0,0,.08); flex-shrink: 0; cursor: default; user-select: text; margin: 0; }
.sn-input {
  width: 100%; border: none; outline: none; background: transparent;
  font-size: 12px; line-height: 18px; color: #3a2a00; font-family: inherit;
}
.sn-input::placeholder { color: #a08030; }

/* ── List ── */
.sn-list  { flex: 1; min-height: 0; overflow-y: auto; cursor: default; user-select: text; }
.sn-empty { padding: 10px; font-size: 11px; color: #a08030; text-align: center; }
.sn-item {
  display: flex; align-items: flex-start; gap: 6px;
  padding: 5px 6px 5px 8px;
  border-bottom: 1px solid rgba(0,0,0,.06);
  transition: background .1s;
}
.sn-item:hover               { background: rgba(0,0,0,.04); }
.sn-item:hover .sn-del       { opacity: 1; }
.sn-check                    { flex-shrink: 0; border: none; background: none; cursor: pointer; padding: 2px 0; display: flex; }
.sn-check svg                { width: 14px; height: 14px; display: block; }
.sn-text                     { flex: 1; font-size: 12px; line-height: 18px; color: #3a2a00; word-break: break-word; padding-top: 1px; cursor: default; }
.sn-item--done .sn-text      { text-decoration: line-through; opacity: .5; }
.sn-edit-input {
  flex: 1; min-width: 0; padding: 0 3px; margin: 0 -3px;
  border: 1px solid #b8860b; border-radius: 3px; outline: none;
  font-size: 12px; line-height: 18px; font-family: inherit; background: #fffde7; color: #3a2a00;
}
.sn-del {
  flex-shrink: 0; border: none; background: none; cursor: pointer;
  color: #b8860b; font-size: 15px; line-height: 1; padding: 0 2px; opacity: 0;
  transition: opacity .1s; align-self: flex-start; margin-top: 1px;
}

/* ── Footer ── */
.sn-footer { padding: 4px 8px; border-top: 1px solid rgba(0,0,0,.08); flex-shrink: 0; cursor: default; }
.sn-clear  {
  border: none; background: none; cursor: pointer;
  font-size: 11px; color: #a08030; padding: 2px 0; font-family: inherit;
}
.sn-clear:hover { color: #5a4000; }

/* ── Resize handles ── */
.sn-resize { position: absolute; z-index: 10; }
.sn-resize--e  { right: 0; top: 24px; bottom: 10px; width: 5px;  cursor: ew-resize; }
.sn-resize--s  { bottom: 0; left: 10px; right: 10px; height: 5px; cursor: ns-resize; }
.sn-resize--se {
  right: 0; bottom: 0; width: 14px; height: 14px;
  cursor: se-resize;
}
.sn-resize--se::after {
  content: ''; position: absolute; right: 3px; bottom: 3px;
  width: 7px; height: 7px;
  border-right: 2px solid rgba(0,0,0,.2);
  border-bottom: 2px solid rgba(0,0,0,.2);
}

/* ── Scrollbar ── */
.sn-list::-webkit-scrollbar       { width: 4px; }
.sn-list::-webkit-scrollbar-thumb { background: #c8a000; border-radius: 2px; }
.sn-list::-webkit-scrollbar-track { background: transparent; }
</style>
