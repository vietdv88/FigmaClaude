<template>
  <div class="mds-rt" :class="rootClass">

    <!-- ── Basic mode: textarea → TinyMCE replaces with iframe editor ── -->
    <textarea v-if="mode === 'basic'" :id="editorId" />

    <!-- ── Inline mode: contenteditable div; floating toolbar on selection ── -->
    <div
      v-else
      :id="editorId"
      class="mds-rt__inline"
      :data-placeholder="placeholder"
      :contenteditable="!disabled && state !== 'disabled' && !readonly && state !== 'readonly' ? 'true' : 'false'"
    ></div>

  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue:  { type: String,  default: '' },
  mode:        { type: String,  default: 'basic' }, // 'basic' | 'inline'
  /** Bộ nút: 'simple' (Figma RichText — mặc định) | 'full' (Figma Editor Toolbar đầy đủ) | 'classic' (thêm thanh menu + đếm chữ như TinyMCE Classic) | chuỗi toolbar TinyMCE tự định nghĩa */
  toolbar:     { type: String,  default: 'simple' },
  /** Cho kéo góc dưới phải để đổi chiều cao (mode basic) */
  resize:      { type: Boolean, default: true },
  height:      { type: Number,  default: 300 },
  minHeight:   { type: Number,  default: 120 },
  placeholder: { type: String,  default: 'Nhập nội dung...' },
  disabled:    { type: Boolean, default: false },
  readonly:    { type: Boolean, default: false },
  state:       { type: String,  default: 'default' }, // default | error | warning | success | disabled | readonly
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const editorId = `mds-rt-${Math.random().toString(36).slice(2, 9)}`
let editorInst = null
let booting    = false

const rootClass = computed(() => ({
  'mds-rt--inline':   props.mode === 'inline',
  'mds-rt--error':    props.state === 'error',
  'mds-rt--warning':  props.state === 'warning',
  'mds-rt--success':  props.state === 'success',
  'mds-rt--disabled': props.disabled  || props.state === 'disabled',
  'mds-rt--readonly': props.readonly  || props.state === 'readonly',
}))

/* ── TinyMCE CDN (GPL license, không cần API key) — ghim đúng phiên bản ── */
const MCE_BASE = 'https://cdn.jsdelivr.net/npm/tinymce@7.6.0'
const MCE_SRC  = `${MCE_BASE}/tinymce.min.js`
const MCE_LANG = 'https://cdn.jsdelivr.net/npm/tinymce-i18n@26.9.28/langs7/vi.js'   // giao diện tiếng Việt

function loadMCE() {
  return new Promise((resolve, reject) => {
    if (window.tinymce) { resolve(); return }
    if (document.querySelector(`script[src="${MCE_SRC}"]`)) {
      const t = setInterval(() => { if (window.tinymce) { clearInterval(t); resolve() } }, 40)
      return
    }
    const s = Object.assign(document.createElement('script'), {
      src: MCE_SRC,
      referrerPolicy: 'origin',
      onload:  resolve,
      onerror: reject,
    })
    document.head.appendChild(s)
  })
}

/* Bộ nút theo Figma ❖ Editor Toolbar (28355:87417) */
const PRESETS = {
  // RichText (43454:50588): ↶ ↷ | B I U A | căn lề | danh sách | thụt lề | link ảnh
  simple:  { toolbar: 'undo redo | bold italic underline forecolor | align | numlist bullist | outdent indent | link image',
             plugins: 'lists link autolink image' },
  // Đầy đủ: thêm kiểu đoạn, font, cỡ chữ, màu nền chữ, gạch ngang, giãn dòng, bảng
  full:    { toolbar: 'undo redo | blocks fontfamily fontsize | forecolor backcolor | bold italic underline strikethrough | align lineheight | numlist bullist | outdent indent | link image table | removeformat',
             plugins: 'lists link autolink image table' },
  // Classic (như demo TinyMCE): thanh menu + thanh công cụ đầy đủ + đếm chữ
  classic: { toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | align lineheight | numlist bullist | outdent indent | link image media table | charmap emoticons | searchreplace code fullscreen preview | removeformat',
             plugins: 'lists link autolink image media table charmap emoticons searchreplace code fullscreen preview wordcount', menubar: 'file edit view insert format tools table help' },
}
const preset = () => PRESETS[props.toolbar] || { toolbar: props.toolbar, plugins: 'lists link autolink image table' }

// Nội dung trong khung soạn thảo dùng đúng chữ / màu của MDS (đọc token lúc khởi tạo vì nằm trong iframe)
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
const fontFamily = () => cssVar('--font-family') || 'Inter, sans-serif'
const contentStyle = () => {
  const v = cssVar
  return `
  body { font-family: ${fontFamily()}; font-size: ${v('--text-body') || '13px'}; line-height: ${v('--text-body-lh') || '20px'};
    color: ${v('--text-primary') || '#10141b'}; margin: 8px 12px; }
  p { margin: 0 0 8px; }
  p:last-child { margin-bottom: 0; }
  a { color: ${v('--text-link') || '#245fdf'}; }
  table { border-collapse: collapse; } td, th { border: 1px solid ${v('--stroke-neutral') || '#ced1d6'}; padding: 4px 8px; }
  .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before { color: ${v('--text-hint') || '#9da2ac'}; }
`
}

async function boot() {
  if (booting || editorInst) return
  booting = true

  await loadMCE()

  const isReadonly = props.readonly || props.state === 'readonly'

  const cfg = {
    selector:      `#${editorId}`,
    base_url:      MCE_BASE,
    suffix:        '.min',
    license_key:   'gpl',
    menubar:       preset().menubar || false,
    statusbar:     props.mode === 'basic' && (props.resize || !!preset().menubar),
    elementpath:   false,
    language:      'vi',
    language_url:  MCE_LANG,
    promotion:     false,
    branding:      false,
    toolbar:       preset().toolbar,
    toolbar_mode:  'sliding',   // thiếu chỗ → nút ⋯ mở thêm hàng (Figma Variant5)
    plugins:       preset().plugins,
    content_style: contentStyle(),
    font_family_formats: `Inter=${fontFamily()}; Arial=arial,helvetica,sans-serif; Times New Roman=times new roman,times,serif; Courier New=courier new,courier,monospace`,
    font_size_formats: '8pt 10pt 12pt 13pt 14pt 16pt 18pt 24pt 36pt',
    block_formats: 'Đoạn văn=p; Tiêu đề 1=h1; Tiêu đề 2=h2; Tiêu đề 3=h3; Trích dẫn=blockquote',
    placeholder:   props.placeholder,
    readonly:      isReadonly ? 1 : 0,
    setup(ed) {
      editorInst = ed
      ed.on('init', () => {
        if (props.modelValue) ed.setContent(props.modelValue)
        booting = false
      })
      ed.on('change input keyup paste', () => {
        emit('update:modelValue', ed.getContent())
      })
      ed.on('focus', () => emit('focus'))
      ed.on('blur',  () => emit('blur'))
    },
  }

  if (props.mode === 'basic') {
    window.tinymce.init({ ...cfg, height: props.height, min_height: props.minHeight, resize: props.resize })
  } else {
    // Inline: nội dung nằm ngay trong trang (không có iframe) → KHÔNG nạp content_css / content_style của TinyMCE
    // (chúng có luật body { margin… } sẽ đè lên cả ứng dụng). Kiểu chữ trong vùng soạn lấy từ CSS của .mds-rt__inline.
    window.tinymce.init({ ...cfg, inline: true, content_css: false, content_style: '' })
  }
}

function destroy() {
  if (editorInst) { editorInst.destroy(); editorInst = null }
}

onMounted(() => nextTick(boot))
onBeforeUnmount(destroy)

watch(() => props.modelValue, (val) => {
  if (editorInst && !editorInst.hasFocus() && editorInst.getContent() !== val) {
    editorInst.setContent(val || '')
  }
})
</script>

<style scoped>
/* ── Root wrapper ── */
.mds-rt { position: relative; width: 100%; }

/* ── BASIC MODE — override TinyMCE container ── */
.mds-rt :deep(.tox-tinymce) {
  border: 1px solid var(--stroke-neutral) !important;
  border-radius: var(--radius-default) !important;
  box-shadow: none !important;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.mds-rt:focus-within :deep(.tox-tinymce) {
  border-color: var(--stroke-brand) !important;
  box-shadow: 0 0 0 3px rgba(4, 153, 228, 0.12) !important;
}
.mds-rt--error :deep(.tox-tinymce)   { border-color: var(--stroke-danger)  !important; }
.mds-rt--warning :deep(.tox-tinymce) { border-color: var(--stroke-warning) !important; }
.mds-rt--success :deep(.tox-tinymce) { border-color: var(--stroke-success) !important; }
.mds-rt--error:focus-within :deep(.tox-tinymce) {
  box-shadow: 0 0 0 3px rgba(240, 68, 56, 0.12) !important;
}
.mds-rt--disabled :deep(.tox-tinymce) {
  opacity: 0.65;
  pointer-events: none;
  background: var(--bg-neutral-light) !important;
}
.mds-rt--readonly :deep(.tox-tinymce) {
  background: var(--bg-neutral-light) !important;
}

/* Thanh công cụ theo Figma ❖ Editor Toolbar: nền trắng · vạch dưới Neutral nhạt · nút 28 bo Inner · hover / đang bật nền Neutral Light · vạch ngăn nhóm mảnh */
.mds-rt :deep(.tox .tox-editor-header) { box-shadow: none !important; padding: 0 !important; border-bottom: 1px solid var(--stroke-neutral-light) !important; }
.mds-rt :deep(.tox .tox-toolbar__primary),
.mds-rt :deep(.tox .tox-toolbar-overlord),
.mds-rt :deep(.tox .tox-menubar) { background: var(--bg-white) !important; }
.mds-rt :deep(.tox .tox-toolbar__group) { padding: 0 4px !important; border-right: 1px solid var(--stroke-neutral-light) !important; margin: 4px 0 !important; }
.mds-rt :deep(.tox .tox-toolbar__group:last-child) { border-right: none !important; }
.mds-rt :deep(.tox .tox-tbtn) { margin: 0 2px; border-radius: var(--radius-inner); color: var(--icon-neutral); }
.mds-rt :deep(.tox .tox-tbtn svg) { fill: var(--icon-neutral) !important; }
.mds-rt :deep(.tox .tox-tbtn:hover), .mds-rt :deep(.tox .tox-tbtn--enabled), .mds-rt :deep(.tox .tox-tbtn--enabled:hover) { background: var(--bg-neutral-light) !important; }
.mds-rt :deep(.tox .tox-tbtn--disabled svg) { fill: var(--icon-disabled, #ced1d6) !important; }
.mds-rt :deep(.tox .tox-tbtn__select-label) { font-size: var(--text-body); color: var(--text-primary); }
.mds-rt :deep(.tox .tox-statusbar) { border-top: none !important; }

/* ── INLINE MODE — editable div ── */
.mds-rt__inline {
  min-height: 80px;
  padding: 8px 12px;
  border: 1px solid var(--stroke-neutral);
  border-radius: var(--radius-default);
  font-size: var(--text-body);
  line-height: var(--text-body-lh);
  color: var(--text-primary);
  background: var(--bg-white);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  cursor: text;
}
.mds-rt__inline:focus,
.mds-rt--inline:focus-within .mds-rt__inline {
  border-color: var(--stroke-brand);
  box-shadow: 0 0 0 3px rgba(36, 95, 223, 0.12);
}
/* Placeholder via ::before */
.mds-rt__inline :deep(p) { margin: 0 0 8px; }
.mds-rt__inline :deep(p:last-child) { margin-bottom: 0; }
.mds-rt__inline :deep(ul), .mds-rt__inline :deep(ol) { margin: 0 0 8px; padding-left: 24px; }
.mds-rt__inline :deep(a) { color: var(--text-link); }
.mds-rt__inline:empty::before {
  content: attr(data-placeholder);
  color: var(--text-hint);
  pointer-events: none;
}
/* State variants for inline */
.mds-rt--error    .mds-rt__inline { border-color: var(--stroke-danger); }
.mds-rt--error:focus-within .mds-rt__inline { box-shadow: 0 0 0 3px rgba(240, 68, 56, 0.12); }
.mds-rt--warning  .mds-rt__inline { border-color: var(--stroke-warning); }
.mds-rt--success  .mds-rt__inline { border-color: var(--stroke-success); }
.mds-rt--disabled .mds-rt__inline { opacity: 0.65; pointer-events: none; background: var(--bg-neutral-light); }
.mds-rt--readonly .mds-rt__inline { pointer-events: none; background: var(--bg-neutral-light); }
</style>

<style>
/* Mode inline: thanh công cụ nổi nằm ngoài .mds-rt (TinyMCE gắn vào <body>) → style toàn cục, cùng kiểu Figma ❖ Editor Toolbar */
.tox.tox-tinymce-inline .tox-editor-header { border: 1px solid var(--stroke-neutral-light) !important; border-radius: var(--radius-default) !important; box-shadow: var(--shadow-popover) !important; overflow: hidden; }
.tox.tox-tinymce-inline .tox-toolbar__primary { background: var(--bg-white) !important; }
.tox.tox-tinymce-inline .tox-toolbar__group { padding: 0 4px !important; border-right: 1px solid var(--stroke-neutral-light) !important; margin: 4px 0 !important; }
.tox.tox-tinymce-inline .tox-toolbar__group:last-child { border-right: none !important; }
.tox.tox-tinymce-inline .tox-tbtn { margin: 0 2px; border-radius: var(--radius-inner); }
.tox.tox-tinymce-inline .tox-tbtn svg { fill: var(--icon-neutral) !important; }
.tox.tox-tinymce-inline .tox-tbtn:hover, .tox.tox-tinymce-inline .tox-tbtn--enabled, .tox.tox-tinymce-inline .tox-tbtn--enabled:hover { background: var(--bg-neutral-light) !important; }
/* Cỡ nút theo Figma ❖ Editor Toolbar: nút = nút nhỏ của mật độ (calc(--btn-height − 4): 28 · Nhỏ 24 · Rộng 32), icon 16, toolbar cao nút + 8.
   TinyMCE không có chế độ to / nhỏ sẵn (mặc định nút 34, icon 24) → thu theo mật độ hiển thị của MDS (áp cả khung thường lẫn toolbar inline) */
.tox .tox-tbtn { height: calc(var(--btn-height) - 4px) !important; min-width: calc(var(--btn-height) - 4px); width: auto !important; padding: 0 4px !important; }
.tox .tox-tbtn svg, .tox .tox-mbtn svg { transform: scale(0.6667); margin: -4px; }   /* icon TinyMCE vẽ cố định 24×24 (không có viewBox) → thu bằng scale về 16, margin âm cho khung chiếm đúng 16 */
.tox .tox-tbtn--select { padding: 0 4px 0 8px !important; }
.tox .tox-tbtn__select-label { font-size: var(--text-body) !important; margin: 0 4px 0 0 !important; }
.tox .tox-tbtn__select-chevron svg, .tox .tox-split-button__chevron svg { transform: scale(0.6667); margin: -4px; }
.tox .tox-split-button { height: calc(var(--btn-height) - 4px) !important; margin: 0 2px !important; border-radius: var(--radius-inner) !important; }
.tox .tox-split-button .tox-tbtn { margin: 0 !important; }
.tox .tox-split-button__chevron { width: 16px !important; padding: 0 !important; }
.tox .tox-toolbar, .tox .tox-toolbar__primary, .tox .tox-toolbar__overflow { background-size: auto calc(var(--btn-height) + 4px) !important; }
.tox .tox-mbtn { height: calc(var(--btn-height) - 4px) !important; padding: 0 8px !important; border-radius: var(--radius-inner) !important; }
.tox .tox-mbtn__select-label { font-size: var(--text-body) !important; }
.tox .tox-menubar { padding: 4px 4px 0 !important; }
.tox .tox-statusbar { height: auto !important; min-height: 20px; font-size: var(--text-caption) !important; }
</style>
