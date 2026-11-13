<template>
  <!-- Danh sách BIẾN CHUẨN (CSS custom properties) của mds-ui — đọc thẳng từ mds-ui/src/style.css (khối :root) nên luôn khớp code:
       chia nhóm Chữ · Nền · Viền · Icon · Bo góc · Bóng · Khoảng cách · Kích thước control · Kiểu chữ · Biểu đồ · Màu gốc.
       Giá trị hiện = giá trị ĐANG ÁP DỤNG (đổi màu chủ đề / mật độ thì đổi theo); bấm tên biến → chép var(--…) -->
  <div class="demo-stack">
    <div class="demo-row tk-bar" data-dsi-ignore>
      <AppSearchbox v-model="q" placeholder="Tìm biến: tên hoặc giá trị (VD brand, 16px)" class="tk-search" />
      <AppCombobox v-model="cat" :options="CAT_OPTIONS" required :clearable="false" class="tk-cat" />
      <AppCheckbox v-model="showBase" label="Hiện màu gốc (palette — không dùng trực tiếp)" />
    </div>
    <span class="demo-muted">{{ total }} biến · bấm tên biến để chép <code>var(--…)</code>. Màu luôn dùng biến theo đúng nhóm: chữ → Text, nền → Background, viền → Border (Stroke), icon → Icon.</span>

    <section v-for="g in shown" :key="g.id" class="tk-group">
      <h3 class="tk-group__title"><TIcon :name="g.icon" />{{ g.label }}<span class="tk-group__count">{{ g.items.length }}</span></h3>
      <p v-if="g.hint" class="demo-muted tk-group__hint">{{ g.hint }}</p>
      <div class="tk-table">
        <div v-for="t in g.items" :key="t.name" class="tk-row">
          <span class="tk-prev" :class="`tk-prev--${g.kind}`" :style="preview(g.kind, t.name)" aria-hidden="true">{{ g.kind === 'type' ? 'Aa' : '' }}</span>
          <button type="button" class="tk-name" v-tip="'Chép var(' + t.name + ')'" @click="copy(t.name)">{{ t.name }}</button>
          <span class="tk-val"><span class="tk-val__now">{{ live[t.name] }}</span><span v-if="t.decl !== live[t.name] && /var\(/.test(t.decl)" class="tk-val__ref">= {{ t.decl }}</span></span>
          <span class="tk-note">{{ t.note }}</span>
        </div>
      </div>
    </section>
    <EmptyArt v-if="!shown.length" variant="search" :width="96" class="tk-empty" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import RAW from '@mds/style.css?raw'
import TIcon from '@mds/components/TIcon.vue'
import AppSearchbox from '@mds/components/AppSearchbox.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'
import EmptyArt from '@mds/components/EmptyArt.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'
import { currentTheme } from '@mds/theme.js'
import { copyText } from '../copyText.js'

/* ── Đọc khối :root đầu tiên của style.css: --tên: giá trị; /* ghi chú *\/ (ghi chú cùng dòng, ngay sau khai báo) ── */
function parse() {
  const start = RAW.indexOf(':root {'), end = RAW.indexOf('\n}', start)
  const block = RAW.slice(start, end), seen = new Map()
  const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);([ \t]*\/\*([\s\S]*?)\*\/)?/g
  let m
  while ((m = re.exec(block))) if (!seen.has(m[1])) seen.set(m[1], { name: m[1], decl: m[2].trim(), note: (m[4] || '').replace(/\s+/g, ' ').trim() })
  return [...seen.values()]
}
const ALL = parse()

/* ── Nhóm theo tiền tố (thứ tự = thứ tự hiện) ── */
const TYPE_RE = /^--(text-(h\d|body|caption|overline|sm|display)|fw-|font-|lh-|letter)/
const GROUPS = [
  { id: 'text', label: 'Chữ (Text)', icon: 'typography', kind: 'color', test: n => n.startsWith('--text-') && !TYPE_RE.test(n), hint: 'Màu chữ — chỉ dùng cho chữ (color của text).' },
  { id: 'bg', label: 'Nền (Background)', icon: 'square', kind: 'color', test: n => n.startsWith('--bg-') || n === '--dt-header-bg' || n === '--dt-footer-bg', hint: 'Màu nền (background) — trang, card, nút, trạng thái nhạt…' },
  { id: 'stroke', label: 'Viền (Border / Stroke)', icon: 'border-outer', kind: 'border', test: n => n.startsWith('--stroke-'), hint: 'Màu viền, đường kẻ, vạch ngăn (border, outline).' },
  { id: 'icon', label: 'Icon', icon: 'icons', kind: 'color', test: n => n.startsWith('--icon-'), hint: 'Màu icon — icon KHÔNG lấy màu theo chữ (currentColor), luôn dùng nhóm này.' },
  { id: 'radius', label: 'Bo góc (Border radius)', icon: 'border-radius', kind: 'radius', test: n => n.startsWith('--radius-') },
  { id: 'shadow', label: 'Bóng đổ (Box shadow)', icon: 'shadow', kind: 'shadow', test: n => n.startsWith('--shadow-'), hint: 'Card trắng trên nền xám (BG Page) → --shadow-card (= All 2) · dialog / popup → --shadow-dialog, menu / popover → --shadow-popover (= Bottom 12) · panel trượt bên phải → --shadow-left-8. Có viền thì không dùng bóng.' },
  { id: 'space', label: 'Khoảng cách (Padding / Gap)', icon: 'spacing-horizontal', kind: 'space', test: n => /^--(gap|space|pad|box-padding|card-(px|py|gap|col-gap)|dialog-p|page-|content-p|form-|section-|paging-p)/.test(n) },
  { id: 'size', label: 'Kích thước control', icon: 'ruler-measure', kind: 'space', test: n => /^--(btn-|input-|menu-|dt-|paging-|header-h|sidebar-|tab-|seg-|z-)/.test(n) && !/-bg$/.test(n), hint: 'Chiều cao / độ rộng theo MẬT ĐỘ (Nhỏ · Trung bình · Rộng) — không gõ số px cố định cho control.' },
  { id: 'type', label: 'Kiểu chữ (Typography)', icon: 'text-size', kind: 'type', test: n => TYPE_RE.test(n) },
  { id: 'chart', label: 'Biểu đồ (Chart)', icon: 'chart-pie', kind: 'color', test: n => n.startsWith('--chart-'), hint: 'Màu biểu đồ theo chủ đề — xem quy tắc phối màu ở trang Biểu đồ.' },
  { id: 'ai', label: 'AI', icon: 'sparkles', kind: 'color', test: n => /^--ai-grad|^--(text|bg|icon)-ai/.test(n) },
  { id: 'base', label: 'Màu gốc (palette)', icon: 'palette', kind: 'color', base: true, test: n => /^--(brand|neutral|info|success|warning|danger|accent|ai-begin|ai-end|alpha-white|alpha-black)-\d/.test(n), hint: 'Thang màu gốc — KHÔNG dùng trực tiếp trong giao diện; luôn dùng biến theo nhóm (Text / Background / Border / Icon) để đổi chủ đề, chế độ tối tự đúng.' },
]
const grouped = GROUPS.map(g => ({ ...g, all: ALL.filter(t => g.test(t.name)) }))
const used = new Set(grouped.flatMap(g => g.all.map(t => t.name)))
grouped.push({ id: 'other', label: 'Khác', icon: 'dots', kind: 'space', all: ALL.filter(t => !used.has(t.name)) })
const CAT_OPTIONS = [{ value: 'all', label: 'Tất cả nhóm' }, ...grouped.filter(g => g.all.length).map(g => ({ value: g.id, label: `${g.label} (${g.all.length})` }))]

const q = ref(''), cat = ref('all'), showBase = ref(false), live = ref({})
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
const shown = computed(() => {
  const k = norm(q.value.trim())
  return grouped
    .filter(g => (cat.value === 'all' ? (!g.base || showBase.value) : g.id === cat.value))
    .map(g => ({ ...g, items: g.all.filter(t => !k || norm(t.name + ' ' + (live.value[t.name] || '') + ' ' + t.decl + ' ' + t.note).includes(k)) }))
    .filter(g => g.items.length)
})
const total = computed(() => shown.value.reduce((a, g) => a + g.items.length, 0))

/* Giá trị ĐANG ÁP DỤNG (sau khi đổi màu chủ đề / mật độ) */
function refresh() {
  const cs = getComputedStyle(document.documentElement), o = {}
  for (const t of ALL) o[t.name] = cs.getPropertyValue(t.name).trim() || t.decl
  live.value = o
}
onMounted(refresh)
watch(currentTheme, () => nextTick(refresh))
const obs = typeof MutationObserver !== 'undefined' ? new MutationObserver(refresh) : null
onMounted(() => obs?.observe(document.documentElement, { attributes: true, attributeFilter: ['data-density', 'data-theme', 'data-mode', 'class', 'style'] }))

function preview(kind, n) {
  const v = `var(${n})`
  if (kind === 'color') return { background: v }
  if (kind === 'border') return /gradient/.test(live.value[n] || '')
    ? { border: '2px solid transparent', boxShadow: 'none', background: `linear-gradient(var(--bg-white), var(--bg-white)) padding-box, ${v} border-box` }   // viền gradient (VD --stroke-ai): vẽ như viền nút AI Outline
    : { boxShadow: `inset 0 0 0 2px ${v}` }
  if (kind === 'radius') return { borderRadius: v }
  if (kind === 'shadow') return { boxShadow: v }
  if (kind === 'space') return { '--w': v }
  if (kind === 'type') return /fw-/.test(n) ? { fontWeight: v } : /-lh$|lh-/.test(n) ? {} : { fontSize: `min(${v}, 28px)` }
  return {}
}
async function copy(n) { if (await copyText(`var(${n})`)) toast.success(`Đã chép var(${n})`) }
</script>

<style scoped>
.tk-bar { flex-wrap: wrap; }
.tk-search { flex: 1 1 260px; min-width: 0; max-width: 420px; }
.tk-cat { width: 260px; }
.tk-group { display: flex; flex-direction: column; gap: 8px; }
.tk-group__title { display: flex; align-items: center; gap: 8px; margin: 8px 0 0; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.tk-group__title .ti { font-size: 20px; color: var(--icon-brand); }
.tk-group__count { padding: 0 6px; border-radius: var(--radius-pill); background: var(--bg-neutral-light); color: var(--text-secondary); font-size: var(--text-body); line-height: 20px; font-weight: var(--fw-regular); }
.tk-group__hint { margin: 0; }
.tk-table { display: flex; flex-direction: column; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); overflow: hidden; }
.tk-row { display: grid; grid-template-columns: 40px minmax(180px, 1.1fr) minmax(140px, 1fr) minmax(0, 1.6fr); align-items: center; gap: 12px; min-height: 44px; padding: 6px 12px; }
.tk-row + .tk-row { border-top: 1px solid var(--stroke-neutral-light); }
.tk-row:hover { background: var(--bg-brand-light); }
.tk-prev { box-sizing: border-box; width: 32px; height: 28px; border-radius: var(--radius-sm); box-shadow: inset 0 0 0 1px var(--alpha-black-100); display: inline-flex; align-items: center; justify-content: center; }
.tk-prev--radius { background: var(--bg-brand-light); box-shadow: inset 0 0 0 1px var(--stroke-brand-light); border-radius: 0; }
.tk-prev--shadow { background: var(--bg-white); box-shadow: none; }
.tk-prev--space { box-shadow: none; position: relative; }
.tk-prev--space::after { content: ''; position: absolute; left: 0; top: 50%; height: 8px; transform: translateY(-50%); width: min(var(--w), 32px); border-radius: 2px; background: var(--bg-brand); }
.tk-prev--type { box-shadow: none; color: var(--text-primary); font-size: 16px; }
.tk-name { justify-self: start; padding: 0; border: 0; background: none; font: 600 12px/18px ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--text-link); cursor: pointer; text-align: left; overflow-wrap: anywhere; }
.tk-name:hover { text-decoration: underline; }
.tk-val { display: flex; flex-direction: column; min-width: 0; font: 12px/18px ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--text-primary); overflow-wrap: anywhere; }
.tk-val__ref { color: var(--text-secondary); }
.tk-note { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); min-width: 0; }
.tk-empty { align-self: center; }
@media (max-width: 760px) {
  .tk-row { grid-template-columns: 40px minmax(0, 1fr); }
  .tk-val, .tk-note { grid-column: 2; }
}
</style>
