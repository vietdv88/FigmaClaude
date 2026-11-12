<template>
  <!-- Sticky note: màu vàng post-it, kéo được, nhỏ gọn -->
  <div class="sn-root" ref="rootEl">
    <!-- Nút mở (fab) — ẩn khi panel đang mở -->
    <button v-if="!open" type="button" class="sn-fab" aria-label="Ghi chú nhanh" title="Ghi chú nhanh" @click="openPanel">
      <TIcon name="notes" />
      <span v-if="undone > 0" class="sn-badge">{{ undone > 9 ? '9+' : undone }}</span>
    </button>

    <!-- Panel sticky note — kéo được -->
    <div v-if="open" class="sn-panel" :style="panelStyle" role="dialog" aria-label="Ghi chú nhanh">
      <!-- Thanh kéo = header -->
      <div class="sn-header" @mousedown="startDrag" @touchstart.passive="startDragTouch">
        <span class="sn-title">📝 Ghi chú</span>
        <span v-if="user" class="sn-sync-dot" title="Đã đồng bộ tài khoản">☁</span>
        <span v-else class="sn-sync-dot sn-sync-dot--local" :title="'Chưa đăng nhập — lưu trình duyệt\nĐăng nhập để đồng bộ'">💾</span>
        <button type="button" class="sn-close" aria-label="Đóng" @click="open = false">
          <TIcon name="x" />
        </button>
      </div>

      <!-- Ô nhập nhanh -->
      <div class="sn-add">
        <input ref="inputEl" v-model="draft" type="text" class="sn-input" placeholder="Thêm ghi chú…" maxlength="200" @keydown.enter.prevent="addNote" @mousedown.stop />
      </div>

      <!-- Danh sách — cuộn trong -->
      <div class="sn-list" @mousedown.stop>
        <div v-if="!notes.length" class="sn-empty">Chưa có ghi chú nào</div>
        <div v-for="n in notes" :key="n.id" class="sn-item" :class="{ 'sn-item--done': n.done }">
          <button type="button" class="sn-check" :aria-label="n.done ? 'Bỏ hoàn thành' : 'Đánh dấu xong'" @click="toggle2(n)">
            <svg v-if="n.done" viewBox="0 0 14 14" fill="none"><rect width="14" height="14" rx="3" fill="#b8860b"/><path d="M3 7l2.5 2.5L11 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <svg v-else viewBox="0 0 14 14" fill="none"><rect x=".75" y=".75" width="12.5" height="12.5" rx="2.25" stroke="#b8860b" stroke-width="1.5"/></svg>
          </button>
          <span v-if="editId !== n.id" class="sn-text" @dblclick="startEdit(n)" :title="'Nhấp đúp để sửa'">{{ n.text }}</span>
          <input v-else ref="editEl" v-model="editText" type="text" class="sn-edit-input" maxlength="200"
            @keydown.enter.prevent="commitEdit(n)" @keydown.esc.stop="editId = null" @blur="commitEdit(n)" @mousedown.stop />
          <button type="button" class="sn-del" aria-label="Xóa" @click="del(n)">×</button>
        </div>
      </div>

      <!-- Xóa đã xong -->
      <div v-if="doneCount > 0" class="sn-footer" @mousedown.stop>
        <button type="button" class="sn-clear" @click="clearDone">🗑 Xóa {{ doneCount }} việc xong</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import TIcon from '@mds/components/TIcon.vue'

const props = defineProps({
  user: { type: Object, default: null },
  loginUrl: { type: String, default: '/ds/dang-nhap' },
})

const LS_KEY = 'mds-sticky-notes'
const LS_POS = 'mds-sticky-pos'
const API = '/api/ds/notes'

const open = ref(false)
const notes = ref([])
const draft = ref('')
const syncing = ref(false)
const editId = ref(null)
const editText = ref('')
const inputEl = ref(null)
const editEl = ref(null)
const rootEl = ref(null)

// Vị trí panel (kéo được) — lưu localStorage
const pos = ref({ x: 0, y: 0 })
const panelStyle = computed(() => ({ left: pos.value.x + 'px', top: pos.value.y + 'px' }))

function loadPos() {
  try { const p = JSON.parse(localStorage.getItem(LS_POS) || 'null'); if (p) pos.value = p } catch {}
}
function savePos() { try { localStorage.setItem(LS_POS, JSON.stringify(pos.value)) } catch {} }

// Vị trí mặc định: góc dưới phải, cách mép 80px
function defaultPos() {
  const W = 240, H = 320
  pos.value = { x: Math.max(8, window.innerWidth - W - 24), y: Math.max(8, window.innerHeight - H - 80) }
}

// ── Drag ──
let drag = null
function startDrag(e) {
  if (e.button !== 0) return
  drag = { x0: e.clientX - pos.value.x, y0: e.clientY - pos.value.y }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', stopDrag)
}
function startDragTouch(e) {
  const t = e.touches[0]
  drag = { x0: t.clientX - pos.value.x, y0: t.clientY - pos.value.y }
  window.addEventListener('touchmove', onMoveTouch, { passive: false })
  window.addEventListener('touchend', stopDrag)
}
function onMove(e) { if (!drag) return; clamp(e.clientX - drag.x0, e.clientY - drag.y0) }
function onMoveTouch(e) { if (!drag) return; e.preventDefault(); const t = e.touches[0]; clamp(t.clientX - drag.x0, t.clientY - drag.y0) }
function clamp(x, y) {
  const W = 240, H = 50
  pos.value = { x: Math.max(0, Math.min(x, window.innerWidth - W)), y: Math.max(0, Math.min(y, window.innerHeight - H)) }
}
function stopDrag() {
  drag = null; savePos()
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onMoveTouch)
  window.removeEventListener('touchend', stopDrag)
}

const undone = computed(() => notes.value.filter(n => !n.done).length)
const doneCount = computed(() => notes.value.filter(n => n.done).length)

// ── Storage ──
function lsLoad() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] } }
function lsSave(list) { try { localStorage.setItem(LS_KEY, JSON.stringify(list)) } catch {} }

async function apiGet() { const r = await fetch(API); if (!r.ok) throw new Error(); return (await r.json()).notes || [] }
async function apiPost(text) { const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }); if (!r.ok) throw new Error(); return (await r.json()).note }
async function apiPut(id, body) { await fetch(`${API}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) }
async function apiDel(id) { await fetch(`${API}/${id}`, { method: 'DELETE' }) }

async function load() {
  if (props.user) { syncing.value = true; try { notes.value = await apiGet() } catch {} finally { syncing.value = false } }
  else notes.value = lsLoad()
}

async function addNote() {
  const text = draft.value.trim(); if (!text) return; draft.value = ''
  if (props.user) {
    syncing.value = true; try { const n = await apiPost(text); notes.value.unshift(n) } catch {} finally { syncing.value = false }
  } else {
    const n = { id: Date.now().toString(36) + Math.random().toString(36).slice(2), text, done: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    notes.value.unshift(n); lsSave(notes.value)
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
  if (props.user) { for (const n of done) { try { await apiDel(n.id) } catch {} } } else lsSave(notes.value)
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
onMounted(() => { loadPos(); if (!localStorage.getItem(LS_POS)) defaultPos(); window.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { window.removeEventListener('keydown', onKey); stopDrag() })
</script>

<style>
.sn-root { position: fixed; z-index: calc(var(--z-header-pop, 9600) - 10); pointer-events: none; inset: 0; }
/* Fab */
.sn-fab {
  position: absolute; bottom: 24px; right: 24px;
  pointer-events: auto;
  width: 40px; height: 40px; border-radius: 50%;
  background: #f5c518; color: #5a4000; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 10px rgba(0,0,0,.22);
  transition: background .15s, transform .15s;
}
.sn-fab:hover { background: #e8b800; }
.sn-fab:active { transform: scale(.9); }
.sn-fab .ti { font-size: 20px; }
.sn-badge {
  position: absolute; top: -3px; right: -3px;
  min-width: 16px; height: 16px; padding: 0 3px;
  border-radius: 8px; border: 2px solid #fff;
  background: #e63946; color: #fff;
  font: 700 10px/12px sans-serif;
  display: flex; align-items: center; justify-content: center;
}

/* Panel */
.sn-panel {
  position: absolute; pointer-events: auto;
  width: 240px;
  display: flex; flex-direction: column; max-height: 360px;
  background: #fff9c4;
  border-radius: 2px 2px 4px 4px;
  box-shadow: 3px 3px 12px rgba(0,0,0,.22), inset 0 -1px 0 rgba(0,0,0,.06);
  font-family: var(--font-family, sans-serif);
  overflow: hidden;
  user-select: none;
}

/* Header — thanh kéo */
.sn-header {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 8px 5px;
  background: #f5c518;
  cursor: grab; flex-shrink: 0;
}
.sn-header:active { cursor: grabbing; }
.sn-title { font-size: 12px; font-weight: 700; color: #5a4000; flex: 1; }
.sn-sync-dot { font-size: 13px; opacity: .7; cursor: default; }
.sn-close {
  width: 20px; height: 20px; border-radius: 50%;
  border: none; background: rgba(0,0,0,.12); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #5a4000; transition: background .12s;
}
.sn-close:hover { background: rgba(0,0,0,.22); }
.sn-close .ti { font-size: 13px; }

/* Add */
.sn-add { padding: 6px 8px; border-bottom: 1px solid rgba(0,0,0,.08); flex-shrink: 0; cursor: default; user-select: text; }
.sn-input {
  width: 100%; border: none; outline: none; background: transparent;
  font-size: 12px; line-height: 18px; color: #3a2a00;
  font-family: inherit;
}
.sn-input::placeholder { color: #a08030; }

/* List */
.sn-list { flex: 1; min-height: 0; overflow-y: auto; cursor: default; user-select: text; }
.sn-empty { padding: 10px 10px; font-size: 11px; color: #a08030; text-align: center; }
.sn-item {
  display: flex; align-items: flex-start; gap: 6px;
  padding: 5px 6px 5px 8px;
  border-bottom: 1px solid rgba(0,0,0,.06);
  transition: background .1s;
}
.sn-item:hover { background: rgba(0,0,0,.04); }
.sn-item:hover .sn-del { opacity: 1; }
.sn-check { flex-shrink: 0; border: none; background: none; cursor: pointer; padding: 2px 0; display: flex; }
.sn-check svg { width: 14px; height: 14px; display: block; }
.sn-text { flex: 1; font-size: 12px; line-height: 18px; color: #3a2a00; word-break: break-word; padding-top: 1px; cursor: default; }
.sn-item--done .sn-text { text-decoration: line-through; opacity: .5; }
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

/* Footer */
.sn-footer { padding: 4px 8px; border-top: 1px solid rgba(0,0,0,.08); flex-shrink: 0; cursor: default; }
.sn-clear {
  border: none; background: none; cursor: pointer;
  font-size: 11px; color: #a08030; padding: 2px 0;
  font-family: inherit;
}
.sn-clear:hover { color: #5a4000; }

/* Scrollbar vàng nhạt */
.sn-list::-webkit-scrollbar { width: 4px; }
.sn-list::-webkit-scrollbar-thumb { background: #c8a000; border-radius: 2px; }
.sn-list::-webkit-scrollbar-track { background: transparent; }
</style>
