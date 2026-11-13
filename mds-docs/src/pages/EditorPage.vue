<template>
  <div class="ds-editor">
    <div v-if="meLoaded && !state.me.canEdit" class="ds-gate card">
      <TIcon name="lock" class="ds-gate__icon" />
      <h1 class="h2">{{ state.me.user ? 'Bạn chưa có quyền biên tập' : 'Đăng nhập để biên tập tài liệu' }}</h1>
      <a v-if="!state.me.user" :href="loginUrl('/ds' + route.fullPath)" class="btn btn--primary">Đăng nhập</a>
      <RouterLink v-else to="/" class="btn btn--outline btn--neutral">Về trang tài liệu</RouterLink>
    </div>
    <template v-else-if="ready">
      <!-- Thanh trên: quay lại · tiêu đề · thao tác -->
      <div class="ds-editor__bar">
        <RouterLink to="/quan-tri" class="btn-icon btn-icon--outline" aria-label="Về danh sách trang"><TIcon name="arrow-left" /></RouterLink>
        <div class="ds-editor__name">
          <span class="ds-editor__heading">{{ isNew ? 'Thêm trang' : form.title || 'Sửa trang' }}</span>
          <span class="ds-muted ds-editor__status">{{ statusText }}</span>
        </div>
        <div class="ds-editor__actions">
          <RouterLink v-if="!isNew" :to="'/' + original.slug" class="btn btn--outline btn--neutral ds-editor__hide-sm" target="_blank"><TIcon name="eye" />Xem trang</RouterLink>
          <button v-if="!isNew" type="button" class="btn btn--outline btn--neutral ds-editor__hide-sm" @click="openHistory"><TIcon name="history" />Lịch sử</button>
          <DropdownMenu v-if="!isNew" :items="moreItems" placement="bottom-end" @select="onMore">
            <template #trigger="{ toggle }"><button type="button" class="btn-icon btn-icon--outline" aria-label="Thêm thao tác" @click.stop="toggle"><TIcon name="dots" /></button></template>
          </DropdownMenu>
        </div>
      </div>

      <!-- Thông tin trang -->
      <div class="ds-editor__meta card">
        <AppInput label="Tiêu đề" required :message="errors.title" class="ds-editor__f-title">
          <AppTextbox v-model="form.title" placeholder="VD: Data table" @update:model-value="onTitle" />
        </AppInput>
        <AppInput label="Nhóm" required :message="errors.group">
          <AppCombobox v-model="form.group" :options="groupOptions" placeholder="Chọn nhóm" :clearable="false" />
        </AppInput>
        <AppInput v-if="form.group === NEW_GROUP" label="Tên nhóm mới" required :message="errors.newGroup">
          <AppTextbox v-model="newGroup" placeholder="VD: Templates" />
        </AppInput>
        <AppInput label="Đường dẫn" caption="Chữ thường không dấu, số, gạch ngang" :message="errors.slug">
          <AppTextbox v-model="form.slug" placeholder="tu-dong-theo-tieu-de" @update:model-value="slugTouched = true" />
        </AppInput>
        <AppInput label="Thứ tự trong nhóm">
          <AppNumberbox v-model="form.order" :min="0" />
        </AppInput>
        <AppInput label="Mô tả ngắn" caption="Hiện dưới tiêu đề và trên thẻ ở trang tổng quan" class="ds-editor__f-wide">
          <AppTextarea v-model="form.summary" :min-height="40" autosize placeholder="Một câu giới thiệu trang này dùng để làm gì" />
        </AppInput>
      </div>

      <!-- Soạn nội dung + xem trước -->
      <div class="ds-editor__work card" :class="'ds-editor__work--' + pane">
        <div class="ds-editor__tools">
          <div class="ds-editor__tabs">
            <button type="button" class="sub-nav-tab" :class="{ active: pane !== 'preview' }" @click="pane = 'write'">Soạn</button>
            <button type="button" class="sub-nav-tab" :class="{ active: pane === 'preview' }" @click="pane = 'preview'">Xem trước</button>
          </div>
          <div class="ds-editor__fmt">
            <!-- Hoàn tác / Làm lại nội dung ô soạn (cả thao tác gõ lẫn chèn bằng nút / dán ảnh) -->
            <button type="button" class="btn-icon btn-icon--sm" aria-label="Hoàn tác (Ctrl+Z)" v-tip="'Hoàn tác (Ctrl+Z)'" :disabled="!undoStack.length" @click="undo"><TIcon name="arrow-back-up" /></button>
            <button type="button" class="btn-icon btn-icon--sm" aria-label="Làm lại (Ctrl+Shift+Z)" v-tip="'Làm lại (Ctrl+Shift+Z)'" :disabled="!redoStack.length" @click="redo"><TIcon name="arrow-forward-up" /></button>
            <span class="ds-editor__sep" />
            <button v-for="t in TOOLS" :key="t.id" type="button" class="btn-icon btn-icon--sm" :aria-label="t.label" v-tip="t.label" @click="t.run()"><TIcon :name="t.icon" /></button>
            <span class="ds-editor__sep" />
            <button type="button" class="btn-icon btn-icon--sm" aria-label="Chèn ảnh (hoặc dán / kéo thả ảnh vào ô soạn)" v-tip="'Chèn ảnh (hoặc dán / kéo thả ảnh vào ô soạn)'" @click="fileEl.click()"><TIcon name="photo" /></button>
            <DropdownMenu :items="calloutItems" @select="insertCallout">
              <template #trigger="{ toggle }"><button type="button" class="btn-icon btn-icon--sm" aria-label="Chèn hộp lưu ý" v-tip="'Chèn hộp lưu ý'" @click.stop="toggle"><TIcon name="info-circle" /></button></template>
            </DropdownMenu>
            <!-- Hộp khuyến nghị Nên / Không nên: cặp 2 cột hoặc từng hộp riêng -->
            <DropdownMenu :items="doDontItems" :min-width="220" @select="insertDoDont">
              <template #trigger="{ toggle }"><button type="button" class="btn btn--outline btn--neutral btn--sm ds-editor__demo-btn" @click.stop="toggle"><TIcon name="columns-2" />Nên / Không nên</button></template>
            </DropdownMenu>
            <button type="button" class="btn-icon btn-icon--sm" aria-label="Chèn danh sách việc tick được" v-tip="'Chèn danh sách việc tick được (lộ trình, checklist tự soát)'" @click="insertChecklist"><TIcon name="checklist" /></button>
            <DropdownMenu :items="demoItems" :min-width="280" @select="insertDemo">
              <template #trigger="{ toggle }"><button type="button" class="btn btn--outline btn--neutral btn--sm ds-editor__demo-btn" @click.stop="toggle"><TIcon name="player-play" />Chèn ví dụ</button></template>
            </DropdownMenu>
            <button type="button" class="btn-icon btn-icon--sm" aria-label="Hướng dẫn cú pháp" v-tip="'Hướng dẫn cú pháp'" @click="showHelp = true"><TIcon name="help-circle" /></button>
          </div>
          <input ref="fileEl" type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" multiple hidden @change="onFiles($event.target.files); $event.target.value = ''" />
        </div>
        <div class="ds-editor__split">
          <div class="ds-editor__write" :class="{ 'ds-editor__write--drop': dragging }" @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="onDrop">
            <AppTextarea ref="areaRef" v-model="form.body" class="ds-editor__area" :min-height="420" :resize="false"
              placeholder="Viết nội dung bằng Markdown. Dán hoặc kéo thả ảnh vào đây để tải lên." @paste="onPaste" @keydown="onAreaKey" />
          </div>
          <div ref="previewEl" class="ds-editor__preview" @click.capture="onPreviewClick">
            <h1 class="ds-article__title">{{ form.title || 'Tiêu đề trang' }}</h1>
            <DocContent :md="previewBody" />
          </div>
        </div>
      </div>

      <!-- Hủy / Lưu ghim đáy trang (quy chuẩn form nhập liệu: không đặt nút Lưu ở đầu trang) -->
      <div class="ds-form-foot">
        <RouterLink to="/quan-tri" class="btn btn--outline btn--neutral">Hủy</RouterLink>
        <button type="button" class="btn btn--primary" :disabled="saving" @click="save">{{ saving ? 'Đang lưu…' : 'Lưu' }}</button>
      </div>
    </template>
    <div v-else class="ds-loading"><i /><i /><i /><i class="ds-loading__img" /></div>

    <!-- Lịch sử sửa -->
    <AppDialog v-if="history" title="Lịch sử sửa trang" :width="960" fill @close="history = null">
      <div class="ds-history">
        <div class="ds-history__list">
          <div v-if="!history.items.length" class="ds-muted">Chưa có bản cũ nào.</div>
          <button v-for="h in history.items" :key="h.id" type="button" class="ds-history__item" :class="{ 'ds-history__item--on': history.sel?.id === h.id }" @click="pickRevision(h)">
            <span>{{ fmtDateTime(h.updatedAt) }}</span><span class="ds-muted">{{ h.updatedBy || '—' }}</span>
          </button>
        </div>
        <div class="ds-history__view">
          <template v-if="history.page"><h1 class="ds-article__title">{{ history.page.title }}</h1><DocContent :md="history.page.body" /></template>
          <div v-else class="ds-muted">Chọn một bản bên trái để xem lại.</div>
        </div>
      </div>
      <template #footer>
        <button type="button" class="btn btn--outline btn--neutral" @click="history = null">Đóng</button>
        <button type="button" class="btn btn--primary" :disabled="!history.page" @click="restoreRevision">Khôi phục bản này</button>
      </template>
    </AppDialog>

    <!-- Hướng dẫn cú pháp -->
    <AppDialog v-if="showHelp" title="Cú pháp soạn tài liệu" :width="640" @close="showHelp = false">
      <div class="ds-prose ds-help" v-html="helpHtml" />
      <template #footer><button type="button" class="btn btn--primary" @click="showHelp = false">Đã hiểu</button></template>
    </AppDialog>

    <AppDialogConfirm v-if="confirmDelete" title="Xóa trang tài liệu?" confirm-label="Xóa" danger @confirm="doDelete" @cancel="confirmDelete = false">
      Trang “<b>{{ original.title }}</b>” được chuyển vào Thùng rác, khôi phục lại được bất cứ lúc nào.
    </AppDialogConfirm>
    <AppDialogConfirm v-if="leaveTo" title="Rời trang khi chưa lưu?" confirm-label="Rời trang" danger @confirm="leave" @cancel="leaveTo = null">
      Các thay đổi chưa lưu sẽ bị mất.
    </AppDialogConfirm>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import TIcon from '@mds/components/TIcon.vue'
import AppInput from '@mds/components/AppInput.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import AppTextarea from '@mds/components/AppTextarea.vue'
import AppNumberbox from '@mds/components/AppNumberbox.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import DropdownMenu from '@mds/components/DropdownMenu.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'
import { setPageTitle } from '@mds/utils/docTitle.js'
import { focusFirstError } from '@mds/utils/fieldError.js'
import DocContent from '../components/DocContent.vue'
import AppDialog from '../components/AppDialog.vue'
import AppDialogConfirm from '../components/AppDialogConfirm.vue'
import { DEMO_OPTIONS } from '../demos/index.js'
import { renderDoc } from '../md.js'
import { state, api, loadPages, loadMe, loginUrl, fmtDateTime } from '../store.js'

const route = useRoute(), router = useRouter()
const NEW_GROUP = '__new__'
const isNew = computed(() => route.params.slug === 'moi')
const meLoaded = ref(false), ready = ref(false), saving = ref(false)
const original = ref({})
const form = reactive({ title: '', group: '', slug: '', order: 1, summary: '', body: '' })
const newGroup = ref(''), slugTouched = ref(false), errors = reactive({})
const pane = ref('write'), dragging = ref(false), showHelp = ref(false), confirmDelete = ref(false)
const areaRef = ref(null), fileEl = ref(null), previewEl = ref(null)
const textarea = () => areaRef.value?.$el?.querySelector('textarea')

const groupOptions = computed(() => [...state.groups.map(g => ({ value: g, label: g })), { value: NEW_GROUP, label: '+ Thêm nhóm mới…' }])
const snapshot = () => JSON.stringify({ ...form, newGroup: newGroup.value })
const saved = ref('')
const dirty = computed(() => ready.value && snapshot() !== saved.value)
const statusText = computed(() => (dirty.value ? 'Có thay đổi chưa lưu' : isNew.value ? 'Trang mới' : `Đã lưu · ${fmtDateTime(original.value.updatedAt)}${original.value.updatedBy ? ' · ' + original.value.updatedBy : ''}`))

/* Xem trước: cập nhật sau khi ngừng gõ 250ms (trang dài nhiều ảnh không bị giật) */
const previewBody = ref('')
let pt = null
watch(() => form.body, v => { clearTimeout(pt); pt = setTimeout(() => { previewBody.value = v }, 250) })

/* ── Đồng bộ cuộn: con trỏ đang ở dòng nào bên trái → khung xem trước cuộn tới đúng đoạn đó ──
   Mốc = các tiêu đề (# … ######) theo thứ tự trong nguồn ↔ thẻ h1–h6 tương ứng trong xem trước (bỏ tiêu đề nằm trong ví dụ sống);
   giữa 2 mốc nội suy theo số dòng. Cuộn khung soạn (không di chuyển con trỏ) cũng kéo xem trước theo. */
function headingLines(md) {
  const out = []; let fence = false
  md.split('\n').forEach((l, i) => { if (/^\s*(```|~~~)/.test(l)) fence = !fence; else if (!fence && /^#{1,6}\s/.test(l)) out.push(i) })
  return out
}
function previewAnchors(box, md, total, hs) {
  hs ??= [...box.querySelectorAll('.ds-prose h1, .ds-prose h2, .ds-prose h3, .ds-prose h4, .ds-prose h5, .ds-prose h6')].filter(h => !h.closest('.ds-demo'))
  const src = headingLines(md), base = box.getBoundingClientRect().top - box.scrollTop
  const anchors = [[0, 0]]
  src.forEach((ln, i) => { if (hs[i]) anchors.push([ln, hs[i].getBoundingClientRect().top - base - 8]) })
  anchors.push([total, box.scrollHeight])
  return anchors
}
function previewTopForLine(line) {
  const box = previewEl.value, md = previewBody.value; if (!box) return null
  const total = md.split('\n').length
  const hs = [...box.querySelectorAll('.ds-prose h1, .ds-prose h2, .ds-prose h3, .ds-prose h4, .ds-prose h5, .ds-prose h6')].filter(h => !h.closest('.ds-demo'))
  const anchors = previewAnchors(box, md, total, hs)
  let a = anchors[0], b = anchors[anchors.length - 1]
  for (let i = 0; i < anchors.length - 1; i++) if (line >= anchors[i][0] && line < anchors[i + 1][0]) { a = anchors[i]; b = anchors[i + 1]; break }
  const t = b[0] > a[0] ? (line - a[0]) / (b[0] - a[0]) : 0
  return a[1] + (b[1] - a[1]) * t
}
/* ── Chiều ngược lại: bấm vào đoạn nào bên xem trước → khung soạn cuộn tới dòng nguồn đó + đặt con trỏ đầu dòng ──
   Ước dòng theo vị trí (nội suy giữa các tiêu đề), rồi chỉnh chính xác bằng cách tìm chữ của đoạn được bấm
   (ảnh: tìm theo tên file) trong nguồn — lấy chỗ khớp gần dòng ước nhất. Bấm trong ví dụ sống thì để ví dụ chạy bình thường. */
const plainMd = l => l.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`#>|~]/g, '').replace(/^\s*([-+]|\d+\.)\s+/, '').replace(/\s+/g, ' ').trim().toLowerCase()
function lineForPreviewY(y) {
  const box = previewEl.value, md = previewBody.value, total = md.split('\n').length
  const an = previewAnchors(box, md, total)
  for (let i = 0; i < an.length - 1; i++) {
    const [l1, y1] = an[i], [l2, y2] = an[i + 1]
    if (y >= y1 && y < y2) return Math.round(l1 + (l2 - l1) * (y2 > y1 ? (y - y1) / (y2 - y1) : 0))
  }
  return total - 1
}
function onPreviewClick(e) {
  const box = previewEl.value; if (!box || e.target.closest('.ds-demo')) return
  if (e.target.closest('a, img')) { e.preventDefault(); e.stopPropagation() }   // trong trình soạn: bấm link / ảnh = nhảy tới chỗ sửa, không mở trang / phóng ảnh
  const lines = form.body.split('\n')
  const est = lineForPreviewY(e.clientY - box.getBoundingClientRect().top + box.scrollTop)
  let hit = -1
  const img = e.target.closest('img'), blk = e.target.closest('.ds-prose p, .ds-prose li, .ds-prose td, .ds-prose th, .ds-prose h1, .ds-prose h2, .ds-prose h3, .ds-prose h4, .ds-prose h5, .ds-prose h6, .ds-prose blockquote, .ds-prose pre, .ds-prose figure, .ds-callout')
  const near = test => { let best = -1; lines.forEach((l, i) => { if (test(l) && (best < 0 || Math.abs(i - est) < Math.abs(best - est))) best = i }); return best }
  if (img) { const f = (img.getAttribute('src') || '').split('/').pop(); if (f) hit = near(l => l.includes(f)) }
  else if (blk) {
    const t = (e.target.closest('li, td, th') || blk).innerText.replace(/\s+/g, ' ').trim().toLowerCase()
    for (const len of [40, 20, 10]) { const k = t.slice(0, len); if (k.length >= 4 && (hit = near(l => plainMd(l).includes(k))) >= 0) break }
  }
  jumpToLine(hit >= 0 ? hit : Math.min(est, lines.length - 1))
}
// Đo vị trí dòng trong textarea (dòng dài tự xuống dòng) bằng 1 khối ẩn cùng kiểu chữ / bề rộng
function lineOffsetY(el, line) {
  const cs = getComputedStyle(el), m = document.createElement('div')
  for (const k of ['font', 'letterSpacing', 'lineHeight', 'padding', 'border', 'boxSizing', 'whiteSpace', 'wordWrap', 'overflowWrap', 'tabSize']) m.style[k] = cs[k]
  Object.assign(m.style, { position: 'absolute', visibility: 'hidden', top: '0', left: '-9999px', width: el.clientWidth + 'px', whiteSpace: 'pre-wrap', overflowWrap: 'break-word' })
  m.textContent = el.value.split('\n').slice(0, line).join('\n') + (line ? '\n' : '') + '\u200b'
  document.body.appendChild(m); const y = m.scrollHeight - parseFloat(cs.lineHeight || 22) - parseFloat(cs.paddingBottom || 0); m.remove()
  return Math.max(0, y)
}
function jumpToLine(line) {
  const el = textarea(); if (!el) return
  const pos = el.value.split('\n').slice(0, line).reduce((n, l) => n + l.length + 1, 0)
  syncFromScroll = false; suppressCaret = true
  el.focus({ preventScroll: true }); el.setSelectionRange(pos, pos)
  el.scrollTo({ top: Math.max(0, lineOffsetY(el, line) - el.clientHeight * 0.33), behavior: 'smooth' })
  setTimeout(() => { syncFromScroll = true; suppressCaret = false }, 700)
}
let suppressCaret = false
let syncRaf = 0
function syncPreview(byScroll = false) {
  cancelAnimationFrame(syncRaf)
  syncRaf = requestAnimationFrame(() => {
    const el = textarea(), box = previewEl.value; if (!el || !box || pane.value === 'preview') return
    let line, frac
    if (byScroll) {   // cuộn khung soạn: dòng ở mép trên khung (ước theo tỉ lệ cuộn) ↔ mép trên xem trước
      const lines = el.value.split('\n').length
      line = el.scrollHeight > el.clientHeight ? Math.round(el.scrollTop / (el.scrollHeight - el.clientHeight) * lines) : 0; frac = 0
    } else {          // đặt con trỏ / gõ: dòng đang sửa hiện ở khoảng 1/3 trên của xem trước
      lastCaretSync = Date.now()
      line = el.value.slice(0, el.selectionStart).split('\n').length - 1; frac = 0.33
    }
    const y = previewTopForLine(line); if (y == null) return
    box.scrollTo({ top: Math.max(0, y - box.clientHeight * frac), behavior: byScroll ? 'auto' : 'smooth' })
  })
}
let syncFromScroll = true
function bindSync() {
  const el = textarea(); if (!el || el.dataset.sync) return
  el.dataset.sync = '1'
  const caret = () => { if (suppressCaret) return; syncFromScroll = false; syncPreview(); setTimeout(() => (syncFromScroll = true), 400) }
  for (const ev of ['click', 'keyup', 'focus']) el.addEventListener(ev, caret)
  el.addEventListener('scroll', () => { if (syncFromScroll) syncPreview(true) }, { passive: true })
}
// Xem trước vẽ lại (sau khi gõ) → giữ đúng vị trí đoạn đang sửa
watch(previewBody, () => nextTick(() => { if (document.activeElement === textarea()) syncPreview() }))
watch(ready, v => v && nextTick(bindSync))
// Ảnh trong xem trước tải xong (lazy) làm đoạn phía dưới bị đẩy xuống → tính lại vị trí theo con trỏ hiện tại
let lastCaretSync = 0
watch(previewEl, el => el?.addEventListener('load', e => {
  if (e.target.tagName === 'IMG' && Date.now() - lastCaretSync < 4000) syncPreview()
}, true))

const slugify = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
function onTitle(v) { if (isNew.value && !slugTouched.value) form.slug = slugify(v) }

async function load() {
  await loadMe(); meLoaded.value = true
  if (!state.me.canEdit) return
  if (!state.loaded) await loadPages()
  if (isNew.value) {
    const g = String(route.query.group || state.groups[0] || '')
    Object.assign(form, { title: '', group: g, slug: '', order: Math.max(0, ...state.pages.filter(p => p.group === g).map(p => p.order || 0)) + 1, summary: '', body: '## Sử dụng\n\n' })
    setPageTitle(['Thêm trang', 'Quản trị nội dung'])
  } else {
    try {
      const { page } = await api('/pages/' + encodeURIComponent(route.params.slug))
      original.value = page
      Object.assign(form, { title: page.title, group: page.group, slug: page.slug, order: page.order ?? 0, summary: page.summary || '', body: page.body || '' })
      setPageTitle([page.title, 'Sửa trang'])
    } catch (e) { toast.error(e.message); router.replace('/quan-tri'); return }
  }
  previewBody.value = form.body
  saved.value = snapshot(); ready.value = true
  nextTick(resetHistory)   // nội dung vừa nạp không phải 1 bước hoàn tác
}

function validate() {
  for (const k of Object.keys(errors)) delete errors[k]
  if (!form.title.trim()) errors.title = 'Nhập tiêu đề trang'
  // Trùng tiêu đề trang khác → menu hiện 2 mục giống hệt, người đọc tưởng trang bị nhân đôi
  else { const dup = state.pages.find(p => p.slug !== original.value?.slug && p.title.trim().toLowerCase() === form.title.trim().toLowerCase()); if (dup) errors.title = `Đã có trang “${dup.title}” (/ds/${dup.slug}) — đặt tiêu đề khác` }
  if (!form.group) errors.group = 'Chọn nhóm'
  if (form.group === NEW_GROUP && !newGroup.value.trim()) errors.newGroup = 'Nhập tên nhóm mới'
  if (form.slug && !/^[a-z0-9][a-z0-9-]*$/.test(form.slug)) errors.slug = 'Chỉ gồm chữ thường không dấu, số và dấu gạch ngang'
  return !Object.keys(errors).length
}
async function save() {
  if (saving.value) return
  if (!validate()) { await nextTick(); focusFirstError(document.querySelector('.ds-editor__meta')); return }
  saving.value = true
  const body = { ...form, group: form.group === NEW_GROUP ? newGroup.value.trim() : form.group, slug: form.slug || undefined }
  try {
    const { page } = isNew.value
      ? await api('/pages', { method: 'POST', body })
      : await api('/pages/' + original.value.slug, { method: 'PUT', body: { ...body, baseUpdatedAt: original.value.updatedAt } })
    original.value = page
    Object.assign(form, { group: page.group, slug: page.slug, order: page.order })
    newGroup.value = ''
    saved.value = snapshot()
    await loadPages()
    toast.success(isNew.value ? 'Đã thêm trang' : 'Đã lưu')
    if (route.params.slug !== page.slug) router.replace('/quan-tri/' + page.slug)
  } catch (e) {
    if (e.message.includes('Đường dẫn')) errors.slug = e.message
    else if (e.message.includes('đặt tiêu đề khác')) errors.title = e.message
    toast.error(e.message)
  } finally { saving.value = false }
}

/* ── Hoàn tác / Làm lại ô soạn ──
   Các nút chèn cú pháp / dán ảnh đổi cả nội dung bằng code nên Ctrl+Z sẵn có của trình duyệt bị mất bước → tự giữ lịch sử:
   gõ liên tục gộp thành 1 bước (ngừng gõ 600ms hoặc bấm nút chèn thì tách bước mới) · tối đa 200 bước · mở trang / khôi phục bản cũ thì xóa lịch sử. */
const undoStack = ref([]), redoStack = ref([])
let applying = false, typing = null
function resetHistory() { undoStack.value = []; redoStack.value = []; clearTimeout(typing); typing = null }
const breakGroup = () => { clearTimeout(typing); typing = null }
watch(() => form.body, (v, old) => {
  if (applying || old == null || v === old) return
  if (!typing) { undoStack.value.push(old); if (undoStack.value.length > 200) undoStack.value.shift(); redoStack.value = [] }
  clearTimeout(typing); typing = setTimeout(() => { typing = null }, 600)
})
function applyBody(next) {
  const cur = form.body
  // Đặt con trỏ ở cuối đoạn vừa đổi (so phần đầu / phần cuối giống nhau của 2 bản)
  let p = 0; while (p < cur.length && p < next.length && cur[p] === next[p]) p++
  let q = 0; while (q < cur.length - p && q < next.length - p && cur[cur.length - 1 - q] === next[next.length - 1 - q]) q++
  const el0 = textarea(), top = el0?.scrollTop ?? 0
  applying = true; form.body = next
  nextTick(() => { applying = false; const el = textarea(); if (el) { el.focus({ preventScroll: true }); el.setSelectionRange(next.length - q, next.length - q); el.scrollTop = top } })
}
function undo() { breakGroup(); if (!undoStack.value.length) return; redoStack.value.push(form.body); applyBody(undoStack.value.pop()) }
function redo() { breakGroup(); if (!redoStack.value.length) return; undoStack.value.push(form.body); applyBody(redoStack.value.pop()) }

/* ── Chèn cú pháp vào ô soạn ── */
function edit(fn) {
  const el = textarea(); if (!el) return
  breakGroup()   // mỗi lần chèn bằng nút = 1 bước hoàn tác riêng
  const s = el.selectionStart, e = el.selectionEnd, v = form.body
  const r = fn(v.slice(s, e), v.slice(0, s), v.slice(e))
  const sel = r.sel || [r.text.length, r.text.length]   // vị trí chọn tính từ đầu đoạn chèn (mặc định: con trỏ sau đoạn chèn)
  const top = el.scrollTop   // gán lại nội dung làm trình duyệt đưa thanh cuộn ô soạn về cuối → giữ nguyên chỗ đang soạn
  form.body = v.slice(0, s) + r.text + v.slice(e)
  nextTick(() => { el.focus({ preventScroll: true }); el.setSelectionRange(s + sel[0], s + sel[1]); el.scrollTop = top })
}
const wrap = (l, r = l, ph = 'chữ') => edit(t => { const x = t || ph; return { text: l + x + r, sel: [l.length, l.length + x.length] } })
// Khối đứng riêng 1 đoạn: tự thêm dòng trống trước / sau
const block = (text, selStart = 0, selLen = 0) => edit((t, before, after) => {
  const pre = !before || before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n'
  const post = after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n'
  return { text: pre + text + post, sel: [pre.length + selStart, pre.length + selStart + selLen] }
})
const linePrefix = p => edit(t => { const x = (t || 'Nội dung').split('\n').map((l, i) => (typeof p === 'function' ? p(i) : p) + l).join('\n'); return { text: x } })
const TOOLS = [
  { id: 'h2', icon: 'h-2', label: 'Tiêu đề mục (##)', run: () => block('## Tiêu đề mục', 3, 11) },
  { id: 'h3', icon: 'h-3', label: 'Tiêu đề nhỏ (###)', run: () => block('### Tiêu đề nhỏ', 4, 11) },
  { id: 'b', icon: 'bold', label: 'In đậm (Ctrl+B)', run: () => wrap('**') },
  { id: 'i', icon: 'italic', label: 'In nghiêng (Ctrl+I)', run: () => wrap('*') },
  { id: 'ul', icon: 'list', label: 'Danh sách', run: () => linePrefix('- ') },
  { id: 'ol', icon: 'list-numbers', label: 'Danh sách đánh số', run: () => linePrefix(i => `${i + 1}. `) },
  { id: 'link', icon: 'link', label: 'Chèn link (Ctrl+K)', run: () => edit(t => ({ text: `[${t || 'chữ hiển thị'}](https://)`, sel: [(t || 'chữ hiển thị').length + 3, (t || 'chữ hiển thị').length + 11] })) },
  { id: 'table', icon: 'table', label: 'Chèn bảng', run: () => block('| Cột 1 | Cột 2 |\n|---|---|\n| Nội dung | Nội dung |') },
]
const calloutItems = [
  { id: 'note', icon: 'info-circle', label: 'Lưu ý' },
  { id: 'warning', icon: 'alert-triangle', label: 'Cảnh báo' },
  { id: 'danger', icon: 'alert-circle', label: 'Nguy hiểm / Lỗi' },
  { id: 'success', icon: 'circle-check', label: 'Khuyến nghị' },
]
const insertCallout = it => block(`::: ${it.id}\nNội dung lưu ý\n:::`, it.id.length + 5, 14)
/* Nên / Không nên: chữ mô tả được chọn sẵn để gõ đè · thêm ảnh minh họa thì dán / kéo thả ảnh vào trong hộp (trên dòng mô tả) */
const DO_TPL = '::: do\nMô tả trường hợp nên dùng\n:::', DONT_TPL = '::: dont\nMô tả trường hợp không nên dùng\n:::'
const doDontItems = [
  { id: 'pair', icon: 'columns-2', label: 'Cặp Nên + Không nên (2 cột)' },
  { id: 'do', icon: 'circle-check', label: 'Chỉ hộp Nên' },
  { id: 'dont', icon: 'circle-x', label: 'Chỉ hộp Không nên' },
]
const DO_PH = 'Mô tả trường hợp nên dùng', DONT_PH = 'Mô tả trường hợp không nên dùng'
const insertDoDont = it => it.id === 'dont' ? block(DONT_TPL, 9, DONT_PH.length) : block(it.id === 'do' ? DO_TPL : DO_TPL + '\n\n' + DONT_TPL, 7, DO_PH.length)
const demoItems = DEMO_OPTIONS.map(d => ({ id: d.value, icon: 'player-play', label: d.label }))
const insertDemo = it => block(`::: demo ${it.id}\n:::`)
/* Danh sách việc tick được: mỗi dòng “- …” là 1 việc, người đọc tick ngay trên trang (lưu theo trình duyệt) */
const insertChecklist = () => block('::: checklist Tên danh sách\n- Việc thứ nhất — có thể chèn [link](/ds/…)\n- Việc thứ hai\n:::', 14, 13)
function onAreaKey(e) {
  if (!(e.ctrlKey || e.metaKey)) return
  const k = e.key.toLowerCase()
  if (k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return }
  if (k === 'y') { e.preventDefault(); redo(); return }
  if (k === 'b') { e.preventDefault(); wrap('**') } else if (k === 'i') { e.preventDefault(); wrap('*') } else if (k === 'k') { e.preventDefault(); TOOLS.find(t => t.id === 'link').run() }
}

/* ── Ảnh: chọn file / dán / kéo thả → tải lên, chèn ![](url) tại con trỏ ── */
async function onFiles(files) {
  const imgs = [...(files || [])].filter(f => f.type.startsWith('image/'))
  for (const f of imgs) {
    if (f.size > 15 * 1024 * 1024) { toast.error(`Ảnh “${f.name}” lớn hơn 15MB`); continue }
    const mark = `![Đang tải ảnh ${f.name}…]()`
    block(mark)
    try {
      const { url } = await api('/upload', { method: 'POST', raw: f, type: f.type })
      form.body = form.body.replace(mark, `![](${url})`)
    } catch (e) { form.body = form.body.replace(mark, ''); toast.error(e.message) }
  }
}
function onPaste(e) { const files = [...(e.clipboardData?.files || [])]; if (files.some(f => f.type.startsWith('image/'))) { e.preventDefault(); onFiles(files) } }
function onDrop(e) { dragging.value = false; onFiles(e.dataTransfer?.files) }

/* ── Lịch sử ── */
const history = ref(null)
async function openHistory() {
  try { history.value = { items: (await api(`/pages/${original.value.slug}/revisions`)).items, sel: null, page: null } }
  catch (e) { toast.error(e.message) }
}
async function pickRevision(h) {
  history.value.sel = h; history.value.page = null
  try { history.value.page = (await api(`/pages/${original.value.slug}/revisions/${h.id}`)).page } catch (e) { toast.error(e.message) }
}
async function restoreRevision() {
  const h = history.value.sel
  try {
    const { page } = await api(`/pages/${original.value.slug}/revisions/${h.id}/restore`, { method: 'POST' })
    original.value = page
    Object.assign(form, { title: page.title, group: page.group, slug: page.slug, order: page.order ?? 0, summary: page.summary || '', body: page.body || '' })
    saved.value = snapshot(); previewBody.value = form.body; history.value = null
    nextTick(resetHistory)
    await loadPages()
    toast.success(`Đã khôi phục bản ${fmtDateTime(h.updatedAt)}`)
  } catch (e) { toast.error(e.message) }
}

/* ── Xóa ── */
const moreItems = [{ id: 'history', icon: 'history', label: 'Lịch sử sửa' }, { id: 'view', icon: 'eye', label: 'Xem trang' }, { separator: true }, { id: 'delete', icon: 'trash', label: 'Xóa trang', danger: true }]
function onMore(id) { if (id === 'delete') confirmDelete.value = true; else if (id === 'history') openHistory(); else if (id === 'view') window.open('/ds/' + original.value.slug, '_blank') }
async function doDelete() {
  confirmDelete.value = false
  try { await api('/pages/' + original.value.slug, { method: 'DELETE' }); saved.value = snapshot(); await loadPages(); toast.success('Đã chuyển trang vào Thùng rác'); router.replace('/quan-tri') }
  catch (e) { toast.error(e.message) }
}

/* ── Chưa lưu mà rời trang ── */
const leaveTo = ref(null)
onBeforeRouteLeave(to => { if (dirty.value && !leaveTo.value?.ok) { leaveTo.value = { to }; return false } })
function leave() { const to = leaveTo.value.to; leaveTo.value = { ok: true }; router.push(to) }
const onUnload = e => { if (dirty.value) { e.preventDefault(); e.returnValue = '' } }
const onKey = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (ready.value) save() } }

const helpHtml = renderDoc(`
### Định dạng chữ
- \`## Tiêu đề mục\` · \`### Tiêu đề nhỏ\` — tiêu đề cấp 2, 3 hiện ở mục lục bên phải
- \`**in đậm**\` · \`*in nghiêng*\` · \`[chữ](https://link)\` · link trang khác: \`[Data table](/ds/data-table)\`
- Danh sách: dòng bắt đầu bằng \`- \` hoặc \`1. \`

### Ảnh
Bấm nút ảnh, **dán (Ctrl+V)** hoặc **kéo thả** ảnh vào ô soạn → ảnh tự tải lên và chèn \`![](/ds/files/…)\`.

### Khối đặc biệt
\`\`\`
::: note        (hoặc warning, danger, success)
Nội dung lưu ý
:::

::: do
![](ảnh) Mô tả cách làm đúng
:::
::: dont
![](ảnh) Mô tả cách làm sai
:::

::: demo data-table
:::

::: checklist Tên danh sách
- Việc thứ nhất — có thể chèn [link](/ds/button)
- Việc thứ hai
:::
\`\`\`
Hai khối **Nên / Không nên** đứng liền nhau tự xếp thành 2 cột. Khối **demo** hiện ví dụ chạy thật bằng control mds-ui — chọn ở nút “Chèn ví dụ”. Khối **checklist** là danh sách việc người đọc tick được ngay trên trang (có thanh tiến độ, nhớ theo trình duyệt) — dùng cho lộ trình, checklist tự soát.

### Lưu & lịch sử
**Ctrl+S** để lưu. Mỗi lần lưu giữ lại bản cũ trong **Lịch sử** — mở ra xem và khôi phục được.
`).blocks.map(b => b.html || '').join('')

onMounted(() => { load(); window.addEventListener('beforeunload', onUnload); window.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { window.removeEventListener('beforeunload', onUnload); window.removeEventListener('keydown', onKey); clearTimeout(pt) })
</script>
