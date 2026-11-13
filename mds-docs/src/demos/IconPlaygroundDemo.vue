<template>
  <!-- Dán thử mã icon (trang /ds/icons › Cách thi công): dán mã vừa chép / code mẫu → hiện UI thật bằng CSS mds-ui + TIcon.
       Chỉ dựng HTML tĩnh (lọc bằng DOMPurify, bỏ script / sự kiện) — thẻ <TIcon> được thay bằng component thật; v-tip đổi sang tooltip. -->
  <div class="demo-stack">
    <div class="demo-row" data-dsi-ignore>
      <span class="demo-muted">Mẫu:</span>
      <AppSegmented v-model="preset" :options="PRESETS" aria-label="Chọn mẫu mã" />
      <span class="demo-muted">Nền:</span>
      <AppSegmented v-model="bg" :options="BGS" aria-label="Màu nền khung xem" />
    </div>
    <div class="ipg">
      <div class="ipg__code">
        <span class="ipg__label">Dán mã vào đây</span>
        <AppTextarea v-model="code" :min-height="168" class="ipg__input" placeholder='VD: <TIcon name="search" />' aria-label="Mã icon cần xem thử" />
      </div>
      <div class="ipg__view-wrap">
        <span class="ipg__label">Hiển thị</span>
        <div ref="view" class="ipg__view" :class="`ipg__view--${bg}`" aria-live="polite" />
      </div>
    </div>
    <!-- Soát nhanh theo quy chuẩn Icons -->
    <ul v-if="issues.length" class="ipg__issues">
      <li v-for="(t, i) in issues" :key="i" class="ipg__issue"><TIcon name="alert-triangle" />{{ t }}</li>
    </ul>
    <span v-else-if="code.trim()" class="ipg__ok"><TIcon name="circle-check" />Mã đúng cách dùng icon của mds-ui.</span>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, h, render } from 'vue'
import DOMPurify from 'dompurify'
import TIcon from '@mds/components/TIcon.vue'
import AppTextarea from '@mds/components/AppTextarea.vue'
import AppSegmented from '@mds/components/AppSegmented.vue'
import { CUSTOM_ICONS } from '@mds/icons/customIcons.js'
import { ensureAiGradient } from '@mds/utils/aiGradient.js'
import tIconSource from '@mds/components/TIcon.vue?raw'

// Tên icon có thật: bảng MAP trong TIcon.vue + icon custom MDS
const NAMES = new Set([...[...tIconSource.matchAll(/^\s+'([a-z0-9-]+)':\s+Icon/gm)].map(m => m[1]), ...Object.keys(CUSTOM_ICONS)])

const SAMPLES = {
  icon: '<TIcon name="search" />\n<span class="icon-swap icon-swap--24 icon-swap--brand"><TIcon name="calendar" /></span>\n<span class="icon-swap icon-swap--danger"><TIcon name="trash" /></span>',
  button: '<button type="button" class="btn btn--primary"><TIcon name="plus" />Thêm mới</button>\n<button type="button" class="btn btn--outline btn--neutral"><TIcon name="download" />Xuất khẩu</button>',
  'btn-icon': '<button type="button" class="btn-icon" aria-label="Sửa" v-tip="\'Sửa\'"><TIcon name="pencil" /></button>\n<button type="button" class="btn-icon" aria-label="Xóa" v-tip="\'Xóa\'"><TIcon name="trash" /></button>\n<button type="button" class="icon-swap icon-swap--action" aria-label="Sao chép" v-tip="\'Sao chép\'"><TIcon name="copy" /></button>',
  ai: '<span class="icon-swap icon-swap--ai icon-swap--24"><TIcon name="sparkles" /></span>\n<button type="button" class="btn btn--outline btn--neutral"><TIcon name="sparkles" class="ti--ai" />Hỏi AI</button>',
}
const PRESETS = [
  { value: 'icon', label: 'Icon đứng riêng' }, { value: 'button', label: 'Nút có chữ' },
  { value: 'btn-icon', label: 'Nút chỉ icon' }, { value: 'ai', label: 'Icon AI' },
]
const BGS = [{ value: 'white', label: 'Trắng' }, { value: 'page', label: 'Xám' }, { value: 'dark', label: 'Tối' }]
const preset = ref('icon'), bg = ref('white'), code = ref(SAMPLES.icon), view = ref(null), issues = ref([])
watch(preset, p => { code.value = SAMPLES[p] })

const ATTR = /([:@a-zA-Z][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)')/g
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
let mounted = []   // các ô đã gắn TIcon thật → gỡ khi vẽ lại

/** Mã Vue → HTML tĩnh: <TIcon …/> → ô giữ chỗ · v-tip="'…'" → title (tooltip của trang tự hiện) · bỏ :prop, @sự-kiện, v-… */
function toHtml(src) {
  return String(src)
    .replace(/<TIcon\b([^>]*?)\/?>(\s*<\/TIcon>)?/gi, (_, attrs) => {
      const a = {}; for (const m of attrs.matchAll(ATTR)) a[m[1]] = m[3] ?? m[4]
      return `<span data-ipg-icon="${esc(a.name || '')}" data-ipg-cls="${esc(a.class || '')}"></span>`
    })
    .replace(/\sv-tip(?:\.\w+)?\s*=\s*"'([^']*)'"/g, (_, t) => ` title="${esc(t)}"`)
    .replace(/\s(?:[:@][\w.:-]+|v-[\w.:-]+)(\s*=\s*("[^"]*"|'[^']*'))?/g, '')
}

/** Soát nhanh theo trang Icons — chỉ những lỗi chắc chắn đọc được từ mã */
function lint(src) {
  const out = []
  for (const m of src.matchAll(/<TIcon\b([^>]*?)\/?>/gi)) {
    const n = /name\s*=\s*["']([^"']*)["']/.exec(m[1])?.[1]
    if (!n) out.push('Thẻ <TIcon> thiếu name — VD <TIcon name="search" />.')
    else if (!NAMES.has(n)) out.push(`Icon “${n}” chưa có trong bộ — tìm tên khác ở khung tra cứu phía trên, hoặc khai báo thêm vào TIcon.vue (mục 5).`)
    if (/stroke-?width/i.test(m[1])) out.push('Không đổi độ dày nét (stroke-width) — icon luôn nét 1.5px.')
  }
  if (/<svg\b/i.test(src)) out.push('Không dán SVG trực tiếp vào màn hình — dùng <TIcon name="…" /> (icon riêng thì khai báo vào customIcons.js).')
  if (/@tabler\/icons/i.test(src)) out.push('Không import icon thẳng từ @tabler/icons-vue — đi qua TIcon để dùng chung 1 bộ.')
  if (/style\s*=\s*["'][^"']*(color|fill|stroke|width|height|font-size)/i.test(src)) out.push('Không gán màu / cỡ tay bằng style — dùng class icon-swap--<màu> / icon-swap--<cỡ> (token --icon-*).')
  if (/class\s*=\s*["'][^"']*\bbtn(-icon)?\b[^"']*["'][^>]*>\s*<span[^>]*icon-swap/i.test(src)) out.push('Icon trong nút không bọc icon-swap — màu và cỡ icon tự theo nút.')
  for (const m of src.matchAll(/<button\b[^>]*class\s*=\s*["'][^"']*\b(btn-icon|icon-swap--action)\b[^"']*["'][^>]*>/gi))
    if (!/aria-label\s*=/.test(m[0])) { out.push('Nút chỉ có icon cần aria-label (và v-tip) để biết nút làm gì.'); break }
  return [...new Set(out)]
}

function draw() {
  const el = view.value; if (!el) return
  for (const n of mounted) render(null, n); mounted = []
  el.innerHTML = DOMPurify.sanitize(toHtml(code.value), { ADD_ATTR: ['data-ipg-icon', 'data-ipg-cls', 'aria-label'], FORBID_TAGS: ['style', 'form', 'input', 'iframe'] })
  el.querySelectorAll('[data-ipg-icon]').forEach(n => {
    render(h(TIcon, { name: n.dataset.ipgIcon, class: n.dataset.ipgCls || undefined }), n)
    n.style.display = 'contents'; mounted.push(n)
  })
  issues.value = lint(code.value)
}
let t = 0
watch(code, () => { clearTimeout(t); t = setTimeout(draw, 150) })
onMounted(() => { ensureAiGradient(); nextTick(draw) })
onBeforeUnmount(() => { clearTimeout(t); for (const n of mounted) render(null, n) })
</script>

<style scoped>
.ipg { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; }
@media (max-width: 720px) { .ipg { grid-template-columns: minmax(0, 1fr); } }
.ipg__code, .ipg__view-wrap { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.ipg__label { font-size: var(--text-body); color: var(--text-secondary); }
.ipg__input :deep(textarea) { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.ipg__view { flex: 1; min-height: 182px; padding: 16px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default);
  display: flex; flex-wrap: wrap; align-content: flex-start; align-items: center; gap: 12px; overflow: auto; }
.ipg__view--white { background: var(--bg-white); }
.ipg__view--page { background: var(--bg-page); }
.ipg__view--dark { background: var(--neutral-950); color: var(--text-white); border-color: transparent; }
.ipg__issues { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
.ipg__issue, .ipg__ok { display: flex; align-items: center; gap: 6px; font-size: var(--text-body); }
.ipg__issue { color: var(--text-warning); }
.ipg__issue :deep(.ti) { color: var(--icon-warning); font-size: 16px; }
.ipg__ok { color: var(--text-success); }
.ipg__ok :deep(.ti) { color: var(--icon-success); font-size: 16px; }
</style>
