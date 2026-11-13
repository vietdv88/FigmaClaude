<template>
  <!-- StickyNotes — ghi chú nhanh: nút nổi kéo được + panel màu vàng post-it (kéo, đổi cỡ). Dùng chung mds-docs (/ds) và app Chấm điểm.
       <StickyNotes :user="me" login-url="/dang-nhap" api="/api/notes" storage-prefix="cd-sticky" /> -->
  <div class="sn-root" ref="rootEl">
    <!-- Nút mở (fab) -->
    <button v-if="!open" type="button" class="sn-fab" :style="fabStyle" aria-label="Ghi chú nhanh (kéo để dời chỗ)" v-tip="'Ghi chú nhanh — kéo để dời chỗ'"
      @pointerdown="fabDown" @pointermove="fabMove" @pointerup="fabUp" @pointercancel="fabUp" @click="fabClick">
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
        <!-- Nơi lưu: chưa đăng nhập → trình duyệt này (bấm để đăng nhập) · đã đăng nhập → tài khoản, kèm trạng thái đồng bộ -->
        <a v-if="!user" class="sn-sync" :href="loginUrl" v-tip="SYNC_TIP.local" aria-label="Đăng nhập để đồng bộ ghi chú" @mousedown.stop @touchstart.stop.passive>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.58 5.548c.24 -.11 .492 -.207 .752 -.286c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 .957 -.383 1.824 -1.003 2.454m-2.997 1.033h-11.343c-2.572 -.004 -4.657 -2.011 -4.657 -4.487c0 -2.475 2.085 -4.482 4.657 -4.482c.13 -.582 .37 -1.128 .7 -1.62"/>
            <path d="M3 3l18 18"/>
          </svg>
        </a>
        <span v-else class="sn-sync" :class="`sn-sync--${status}`" v-tip="SYNC_TIP[status]" role="img" :aria-label="SYNC_TIP[status]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6.657 18c-2.572 0 -4.657 -2.007 -4.657 -4.483c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 1.927 -1.551 3.487 -3.465 3.487h-11.878"/>
            <path v-if="status === 'synced'" d="M9 12.5l2 2l4 -4"/>
            <template v-else-if="status === 'error'"><path d="M12 9.5v3.5"/><path d="M12 15.5v.01"/></template>
            <template v-else><path d="M12 15.5v-5"/><path d="M9.5 13l2.5 -2.5l2.5 2.5"/></template>
          </svg>
        </span>
        <button type="button" class="sn-close" aria-label="Đóng" @click="closePanel">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/></svg>
        </button>
      </div>

      <!-- Ô nhập nhanh — form để Enter submit đáng tin cậy nhất trên mọi trình duyệt -->
      <form class="sn-add" @submit.prevent="addNote" @mousedown.stop>
        <input ref="inputEl" v-model="draft" type="text" class="sn-input" placeholder="Nhập ghi chú rồi Enter…" maxlength="200" @blur="addNote" />
      </form>

      <!-- Danh sách -->
      <div class="sn-list" @mousedown.stop>
        <div v-if="!shown.length" class="sn-empty">Chưa có ghi chú nào</div>
        <div v-for="n in shown" :key="n.id" class="sn-item" :class="{ 'sn-item--done': n.done }">
          <button type="button" class="sn-check" :aria-label="n.done ? 'Bỏ hoàn thành' : 'Đánh dấu xong'" @click="toggle2(n)">
            <svg v-if="n.done" viewBox="0 0 14 14" fill="none"><rect width="14" height="14" rx="3" fill="#b8860b"/><path d="M3 7l2.5 2.5L11 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <svg v-else viewBox="0 0 14 14" fill="none"><rect x=".75" y=".75" width="12.5" height="12.5" rx="2.25" stroke="#b8860b" stroke-width="1.5"/></svg>
          </button>
          <span v-if="editId !== n.id" class="sn-text" v-tip="'Nhấp đúp để sửa'" @dblclick="startEdit(n)">{{ n.text }}</span>
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
import { vTip } from '../utils/tooltip.js'

const props = defineProps({
  /** Người đang đăng nhập ({ id }) — null: ghi chú chỉ lưu trên trình duyệt */
  user: { type: Object, default: null },
  loginUrl: { type: String, default: '/dang-nhap' },
  /** API đồng bộ ghi chú theo tài khoản: GET / POST / PUT :id / DELETE :id */
  api: { type: String, default: '/api/ds/notes' },
  /** Tiền tố khóa localStorage — mỗi app một tiền tố để ghi chú / vị trí nút của các app cùng tên miền không đè nhau */
  storagePrefix: { type: String, default: 'mds-sticky' },
})

const P = props.storagePrefix
const LS_KEY  = `${P}-notes`   // chưa đăng nhập · đã đăng nhập: `${LS_KEY}:${user.id}`
const LS_POS  = `${P}-pos`
const LS_SIZE = `${P}-size`
const LS_FAB  = `${P}-fab`     // vị trí nút nổi (kéo được)
const LS_DRAFT = `${P}-draft`  // chữ đang gõ chưa Enter — F5 / đóng tab không mất
const API = props.api
const SYNC_TIP = {
  local:   'Chưa đăng nhập — ghi chú chỉ lưu trên trình duyệt này. Bấm để đăng nhập và đồng bộ vào tài khoản.',
  synced:  'Đã đồng bộ vào tài khoản',
  syncing: 'Đang đồng bộ…',
  error:   'Chưa đồng bộ được — ghi chú vẫn lưu trên trình duyệt này và sẽ tự đồng bộ lại',
}

const open    = ref(false)
const notes   = ref([])
const draft   = ref('')
const status  = ref('synced')   // đã đăng nhập: synced | syncing | error
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

function loadPos()  { try { const p = JSON.parse(localStorage.getItem(LS_POS)  || 'null'); if (p) { pos.value = p; return true } } catch {} return false }
function savePos()  { try { localStorage.setItem(LS_POS,  JSON.stringify(pos.value))  } catch {} }
function loadSize() { try { const s = JSON.parse(localStorage.getItem(LS_SIZE) || 'null'); if (s) size.value = s } catch {} }
function saveSize() { try { localStorage.setItem(LS_SIZE, JSON.stringify(size.value)) } catch {} }

function defaultPos() {
  pos.value = { x: Math.max(8, window.innerWidth - size.value.w - 24), y: Math.max(8, window.innerHeight - size.value.h - 80) }
}

// ── Nút nổi: kéo đi chỗ khác (không che chức năng), nhớ vị trí ──
const FAB = 40
const fabPos = ref(null)   // { x, y } theo góc trái-trên; null = góc phải-dưới mặc định
const fabStyle = computed(() => (fabPos.value ? { left: fabPos.value.x + 'px', top: fabPos.value.y + 'px', right: 'auto', bottom: 'auto' } : null))
const fitFab = p => ({ x: Math.max(0, Math.min(p.x, window.innerWidth - FAB)), y: Math.max(0, Math.min(p.y, window.innerHeight - FAB)) })
function loadFab() { try { const p = JSON.parse(localStorage.getItem(LS_FAB) || 'null'); if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) fabPos.value = fitFab(p) } catch {} }
let fabDrag = null, fabMoved = false
function fabDown(e) {
  if (e.button !== undefined && e.button !== 0) return
  const r = e.currentTarget.getBoundingClientRect()
  fabDrag = { dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY }
  fabMoved = false
  e.currentTarget.setPointerCapture?.(e.pointerId)
}
function fabMove(e) {
  if (!fabDrag) return
  if (!fabMoved && Math.hypot(e.clientX - fabDrag.sx, e.clientY - fabDrag.sy) < 5) return   // chưa đủ xa → vẫn là cú bấm
  fabMoved = true
  fabPos.value = fitFab({ x: e.clientX - fabDrag.dx, y: e.clientY - fabDrag.dy })
}
function fabUp(e) {
  if (!fabDrag) return
  fabDrag = null
  e.currentTarget.releasePointerCapture?.(e.pointerId)
  if (fabMoved) { try { localStorage.setItem(LS_FAB, JSON.stringify(fabPos.value)) } catch {} }
}
function fabClick() { if (fabMoved) { fabMoved = false; return } openPanel() }   // vừa kéo xong → không mở panel

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

const shown     = computed(() => notes.value.filter(n => n.sync !== 'del'))
const undone    = computed(() => shown.value.filter(n => !n.done).length)
const doneCount = computed(() => shown.value.filter(n =>  n.done).length)

/* ── Lưu trữ ──
   Ghi chú LUÔN ghi vào localStorage trước (các tab dùng chung 1 bản) rồi mới gửi lên tài khoản → máy chủ / mạng lỗi cũng không mất chữ đã nhập.
   · Chưa đăng nhập: chỉ lưu trên trình duyệt này (LS_KEY).
   · Đã đăng nhập: kho riêng theo tài khoản; ghi chú chưa gửi được mang cờ `sync` và tự gửi lại —
     'add' chưa có trên tài khoản · 'put' vừa sửa / tick · 'del' đã xóa (ẩn, chờ máy chủ xóa). */
const mem = new Map()   // trình duyệt chặn / đầy localStorage → giữ tạm trong tab
function lsGet(k) { try { return JSON.parse(mem.get(k) ?? localStorage.getItem(k)) } catch { return null } }
function lsSet(k, v) { const s = JSON.stringify(v); try { localStorage.setItem(k, s); mem.delete(k) } catch { mem.set(k, s) } }
const storeKey = () => (props.user ? `${LS_KEY}:${props.user.id}` : LS_KEY)
const read  = () => { const v = lsGet(storeKey()); return Array.isArray(v) ? v : [] }
const write = list => { lsSet(storeKey(), list); notes.value = list }

const ID_OK = /^[\w-]{8,64}$/   // khớp kiểm tra của máy chủ
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10).padEnd(8, '0')
const stamp = () => new Date().toISOString()

/** Đọc bản mới nhất (tab khác có thể vừa ghi) → sửa → ghi → gửi lên tài khoản nếu đã đăng nhập */
function change(fn) { write(fn(read())); sync() }
const touch = n => ({ ...n, updatedAt: stamp(), ...(props.user && n.sync !== 'add' ? { sync: 'put' } : null) })
// Xóa: chưa đăng nhập → bỏ hẳn · đã đăng nhập → đánh dấu 'del' (ẩn) tới khi máy chủ xóa xong
const drop = (list, hit) => (props.user ? list.map(n => (hit(n) ? { ...n, sync: 'del', updatedAt: stamp() } : n)) : list.filter(n => !hit(n)))

/* Chữ đang gõ chưa Enter: lưu nháp ngay khi gõ; rời ô / đóng panel / F5 / đóng tab → tự thành ghi chú (không mất chữ) */
watch(draft, v => { try { v ? localStorage.setItem(LS_DRAFT, v) : localStorage.removeItem(LS_DRAFT) } catch {} })
function addNote() {
  const text = draft.value.trim(); if (!text) return
  draft.value = ''
  const at = stamp()
  change(list => [{ id: newId(), text, done: false, createdAt: at, updatedAt: at, ...(props.user ? { sync: 'add' } : null) }, ...list])
}
const toggle2   = n => change(list => list.map(x => (x.id === n.id ? touch({ ...x, done: !x.done }) : x)))
const del       = n => change(list => drop(list, x => x.id === n.id))
const clearDone = () => change(list => drop(list, x => x.done && x.sync !== 'del'))

function startEdit(n) { editId.value = n.id; editText.value = n.text; nextTick(() => editEl.value?.[0]?.focus()) }
function commitEdit(n) {
  if (!editId.value) return; editId.value = null
  const text = editText.value.trim(); if (!text || text === n.text) return
  change(list => list.map(x => (x.id === n.id ? touch({ ...x, text }) : x)))
}

/* ── Đồng bộ tài khoản ── gửi ghi chú còn cờ `sync` rồi lấy danh sách trên tài khoản về. Mỗi lúc 1 lượt; có thay đổi giữa chừng thì chạy thêm vòng.
   Lỗi → giữ nguyên cờ, tự thử lại (sau 30 giây / khi có mạng lại / khi mở lại ghi chú). */
const RETRY_MS = 30000
let running = false, rerun = false, retryTimer = 0

async function call(method, id, body) {
  const r = await fetch(id ? `${API}/${encodeURIComponent(id)}` : API, { method, headers: body && { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) })
  const data = await r.json().catch(() => null)
  // Chính API ghi chú báo không còn ghi chú này (đã xóa ở máy khác) — khác 404 của đường dẫn không tồn tại, không được coi là xong
  if (r.status === 404 && data?.ok === false) return null
  if (!r.ok || !data) throw new Error(`HTTP ${r.status}`)
  return data
}

async function sync() {
  const uid = props.user?.id
  if (!uid) return
  if (running) { rerun = true; return }
  running = true; clearTimeout(retryTimer)
  const mine = () => props.user?.id === uid   // đăng xuất giữa chừng → dừng, không ghi nhầm kho
  // Chỉ báo “đang đồng bộ” khi chậm — icon không nháy mỗi lần Enter
  const slow = setTimeout(() => { if (status.value !== 'error') status.value = 'syncing' }, 500)
  try {
    do {
      rerun = false
      // Gửi cũ trước mới: máy chủ đặt ghi chú mới lên đầu → thứ tự trên tài khoản khớp thứ tự đang hiện
      for (const n of read().filter(x => x.sync).reverse()) {
        const res = n.sync === 'del' ? await call('DELETE', n.id)
          : n.sync === 'add' ? await call('POST', '', { id: n.id, text: n.text, done: n.done })
          : await call('PUT', n.id, { text: n.text, done: n.done })
        if (!mine()) return
        // Máy chủ đã nhận → bỏ cờ; đã xóa / không còn trên tài khoản → bỏ hẳn. Vừa sửa tiếp trong lúc gửi (updatedAt khác) → giữ cờ để gửi lại
        write(read().flatMap(x => (x.id !== n.id || x.sync !== n.sync || x.updatedAt !== n.updatedAt ? [x] : n.sync === 'del' || !res ? [] : [{ ...x, sync: undefined }])))
      }
      const data = await call('GET')
      if (!mine()) return
      if (!Array.isArray(data?.notes)) throw new Error('Phản hồi không hợp lệ')
      // Danh sách trên tài khoản là chuẩn; ghi chú còn cờ (vừa đổi trong lúc đồng bộ) giữ bản trên trình duyệt
      const pend = read().filter(x => x.sync), local = new Map(pend.map(x => [x.id, x])), onServer = new Set(data.notes.map(x => x.id))
      write([...pend.filter(x => x.sync === 'add' && !onServer.has(x.id)), ...data.notes.map(x => local.get(x.id) || x)])
    } while (rerun || read().some(x => x.sync))
    status.value = 'synced'
  } catch {
    if (mine()) { status.value = 'error'; retryTimer = setTimeout(sync, RETRY_MS) }
  } finally { clearTimeout(slow); running = false }
}

/** Nạp ghi chú của kho đang dùng (tài khoản / trình duyệt) rồi đồng bộ */
function load() {
  if (props.user) {
    // Ghi chú nhập lúc chưa đăng nhập → chuyển vào tài khoản (đúng lời hẹn “đăng nhập để đồng bộ”)
    const local = lsGet(LS_KEY)
    if (Array.isArray(local) && local.length) {
      const moved = local.map(n => ({ ...n, id: ID_OK.test(n.id) ? n.id : newId(), sync: 'add' }))
      const ids = new Set(moved.map(n => n.id))
      lsSet(storeKey(), [...moved, ...read().filter(n => !ids.has(n.id))])
      lsSet(LS_KEY, [])
    }
  }
  notes.value = read()
  sync()
}

/** Kéo panel về nằm trọn trong khung nhìn — vị trí lưu ở màn hình lớn hơn / vừa thu nhỏ cửa sổ thì panel nằm ngoài màn hình, không bấm được */
function fitView() {
  pos.value = { x: Math.max(0, Math.min(pos.value.x, window.innerWidth  - size.value.w)),
                y: Math.max(0, Math.min(pos.value.y, window.innerHeight - size.value.h)) }
}
function openPanel() { fitView(); open.value = true }
function closePanel() { addNote(); open.value = false }
function onPageHide() { addNote() }   // F5 / đóng tab khi còn chữ chưa Enter
function onResizeWindow() { if (open.value) fitView(); if (fabPos.value) fabPos.value = fitFab(fabPos.value) }
function onKey(e) { if (e.key === 'Escape' && open.value) closePanel() }
function onStorage(e) { if (e.key === storeKey()) notes.value = read() }   // tab khác vừa đổi ghi chú → hiện theo

watch(open, v => { if (v) { load(); nextTick(() => inputEl.value?.focus()) } })
watch(() => props.user?.id, () => { clearTimeout(retryTimer); status.value = 'synced'; load() }, { immediate: true })
onMounted(() => {
  loadSize(); loadFab()
  // Nháp còn lại từ lần trước (tab bị đóng đột ngột) → hiện lại trong ô nhập khi mở panel
  try { draft.value = localStorage.getItem(LS_DRAFT) || '' } catch {}
  window.addEventListener('pagehide', onPageHide)
  if (!loadPos()) defaultPos()
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResizeWindow)
  window.addEventListener('storage', onStorage)
  window.addEventListener('online', sync)
})
onBeforeUnmount(() => {
  window.removeEventListener('pagehide', onPageHide)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResizeWindow)
  window.removeEventListener('storage', onStorage)
  window.removeEventListener('online', sync)
  clearTimeout(retryTimer); stopDrag(); stopResize()
})
</script>

<style>
.sn-root { position: fixed; z-index: calc(var(--z-header-pop, 9600) - 10); pointer-events: none; inset: 0; }

/* ── Fab ── */
.sn-fab {
  position: absolute; bottom: 24px; right: 24px;
  pointer-events: auto;
  width: 40px; height: 40px; border-radius: 50%; touch-action: none; user-select: none; cursor: grab;
  background: #f5c518; color: #5a4000; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 10px rgba(0,0,0,.22);
  transition: background .15s, transform .15s;
}
.sn-fab:hover  { background: #e8b800; }
.sn-fab:active { transform: scale(.9); cursor: grabbing; }
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
.sn-title      { font-size: var(--text-body); font-weight: 700; color: #5a4000; flex: 1; }
.sn-close, .sn-sync {
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: #5a4000;
}
.sn-close { border: none; background: transparent; cursor: pointer; transition: background .12s; }
.sn-close:hover { background: rgba(0,0,0,.18); }
.sn-close svg   { width: 12px; height: 12px; display: block; }
.sn-sync        { cursor: default; }
.sn-sync svg    { width: 16px; height: 16px; display: block; }
a.sn-sync       { cursor: pointer; transition: background .12s; }
a.sn-sync:hover { background: rgba(0,0,0,.18); }
.sn-sync--error { color: #b42318; }

/* ── Add ── */
.sn-add { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-bottom: 1px solid rgba(0,0,0,.08); flex-shrink: 0; cursor: default; user-select: text; margin: 0; }
.sn-input {
  border: none; outline: none; background: transparent;
  font-size: var(--text-body); line-height: var(--text-body-lh); color: #3a2a00; font-family: inherit;
}
.sn-input::placeholder { color: #a08030; }
.sn-input { flex: 1; min-width: 0; }

/* ── List ── */
.sn-list  { flex: 1; min-height: 0; overflow-y: auto; cursor: default; user-select: text; }
.sn-empty { padding: 10px; font-size: var(--text-body); color: #a08030; text-align: center; }
.sn-item {
  display: flex; align-items: flex-start; gap: 6px;
  padding: 5px 6px 5px 8px;
  border-bottom: 1px solid rgba(0,0,0,.06);
  transition: background .1s;
}
.sn-item:hover               { background: rgba(0,0,0,.04); }
.sn-item:hover .sn-del       { opacity: 1; }
.sn-check                    { flex-shrink: 0; border: none; background: none; cursor: pointer; padding: 3px 0; display: flex; }
.sn-check svg                { width: 14px; height: 14px; display: block; }
.sn-text                     { flex: 1; font-size: var(--text-body); line-height: var(--text-body-lh); color: #3a2a00; word-break: break-word; cursor: default; }
.sn-item--done .sn-text      { text-decoration: line-through; opacity: .5; }
.sn-edit-input {
  flex: 1; min-width: 0; padding: 0 3px; margin: -1px -3px;
  border: 1px solid #b8860b; border-radius: 3px; outline: none;
  font-size: var(--text-body); line-height: var(--text-body-lh); font-family: inherit; background: #fffde7; color: #3a2a00;
}
.sn-del {
  flex-shrink: 0; border: none; background: none; cursor: pointer;
  color: #b8860b; font-size: 15px; line-height: 1; padding: 0 2px; opacity: 0;
  transition: opacity .1s; align-self: flex-start; margin-top: 2px;
}

/* ── Footer ── */
.sn-footer { padding: 4px 8px; border-top: 1px solid rgba(0,0,0,.08); flex-shrink: 0; cursor: default; }
.sn-clear  {
  border: none; background: none; cursor: pointer;
  font-size: var(--text-body); color: #a08030; padding: 2px 0; font-family: inherit;
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
