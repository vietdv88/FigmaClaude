<template>
  <!-- Lớp đo (giống Inspect của Figma): rê chuột lên phần tử trong khung ví dụ → khung + đệm + khoảng cách tới phần tử bên cạnh / mép cha,
       thẻ thông số (font, cỡ, độ đậm, màu → tên token; cao, bo góc, đệm, viền, nền…). Đo được cả popup / menu / dialog mở từ ví dụ và email trong iframe. Alt + bấm để ghim · Esc / bấm lại nút “Đo” để tắt. -->
  <Teleport to="body">
    <div v-if="box" class="dsi" aria-hidden="true">
      <div v-for="(r, i) in pads" :key="'p' + i" class="dsi__pad" :style="rs(r)" />
      <div class="dsi__box" :style="rs(box)" />
      <div class="dsi__size" :style="{ left: box.x + box.w / 2 + 'px', top: box.y + box.h + 4 + 'px' }">{{ fmt(box.w / zoom) }} × {{ fmt(box.h / zoom) }}</div>
      <template v-for="(g, i) in gaps" :key="'g' + i">
        <div class="dsi__gap" :class="g.v ? 'dsi__gap--v' : 'dsi__gap--h'" :style="rs(g)" />
        <span class="dsi__gap-label" :style="{ left: g.x + g.w / 2 + 'px', top: g.y + g.h / 2 + 'px' }">{{ fmt((g.v ? g.h : g.w) / zoom) }}</span>
      </template>
    </div>
    <div v-if="info" ref="cardEl" class="dsi-card" :class="{ 'dsi-card--pinned': pinned }" :style="cardStyle">
      <div class="dsi-card__head"><b>{{ info.name }}</b><span v-if="pinned" class="dsi-card__pin">Đã ghim · bấm chỗ khác để bỏ</span></div>
      <dl>
        <template v-for="(row, i) in info.rows" :key="row[0]">
          <dt>{{ row[0] }}<small v-if="explain && termOf(row[0]) && (i === 0 || baseOf(info.rows[i - 1][0]) !== baseOf(row[0]))" class="dsi-card__term">{{ termOf(row[0]) }}</small></dt>
          <dd><span v-if="row[2]" class="dsi-card__sw" :style="{ background: row[2] }" />{{ row[1] }}<code v-if="row[3]">{{ row[3] }}</code></dd>
        </template>
      </dl>
      <div v-if="info.note" class="dsi-card__note"><TIcon name="info-circle" />{{ info.note }}</div>
      <!-- CSS cho dev: viết bằng BIẾN CHUẨN (var(--token)) — mặc định ẩn, bấm “Xem CSS” để mở · chỉ bấm được khi đã ghim thẻ (Alt + bấm) -->
      <div class="dsi-card__css">
        <template v-if="pinned">
          <div class="dsi-card__css-bar">
            <button type="button" class="dsi-card__link" :aria-expanded="showCss" @click="showCss = !showCss"><TIcon :name="showCss ? 'chevron-up' : 'code'" />{{ showCss ? 'Ẩn CSS' : 'Xem CSS (biến chuẩn)' }}</button>
            <button v-if="showCss" type="button" class="dsi-card__link" @click="copyCss"><TIcon name="copy" />Sao chép</button>
            <a :href="TOKENS_URL" target="_blank" rel="noopener" class="dsi-card__link dsi-card__link--end"><TIcon name="book" />Biến chuẩn</a>
          </div>
          <pre v-if="showCss" class="dsi-card__code">{{ cssCode }}</pre>
        </template>
        <span v-else class="dsi-card__css-tip"><TIcon name="code" />Alt + bấm để ghim → <b>Xem CSS</b> dạng biến chuẩn cho dev · tra cứu ở trang Biến chuẩn</span>
      </div>
      <div class="dsi-card__hint">Alt + bấm: ghim · ↑ phần tử cha · ↓ quay lại · Esc: tắt đo<template v-if="!explain"><br>Chưa rõ Padding, Gap…? Tick <b>Giải thích</b> trên thanh khung ví dụ để xem giải thích từng thông số.</template></div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import { toast } from '@mds/utils/toast.js'
import { copyText } from '../copyText.js'

const props = defineProps({ root: { type: Object, required: true }, explain: { type: Boolean, default: false } })
const emit = defineEmits(['close'])
const box = ref(null), pads = ref([]), gaps = ref([]), info = ref(null), pinned = ref(false), cardEl = ref(null), mouse = ref({ x: 0, y: 0 })
const showCss = ref(false), cssCode = ref('')
const TOKENS_URL = import.meta.env.BASE_URL + 'design-tokens'   // trang Biến chuẩn — mở tab mới để tra cứu biến

/* Giải thích ngắn từng thông số (đầy đủ ở trang /ds/css-terms) — hiện khi rê vào tên thông số lúc đã ghim thẻ */
const TERMS = {
  Size: 'Kích thước: rộng × cao, tính tới hết viền (Border)',
  Font: 'Kiểu chữ (font family)',
  'Font size': 'Cỡ chữ', 'Font size / Line height': 'Cỡ chữ / chiều cao một dòng chữ (gồm khoảng trống trên dưới chữ)',
  'Font weight': 'Độ đậm của chữ: 400 Regular · 500 Medium · 600 Semi Bold · 700 Bold',
  Color: 'Màu chữ', 'Color (icon)': 'Màu icon', 'Letter spacing': 'Khoảng cách giữa các chữ cái',
  Background: 'Màu nền', 'Background image': 'Ảnh nền hoặc nền chuyển màu (gradient)',
  Border: 'Đường viền: độ dày + kiểu + màu', Outline: 'Viền vẽ ngoài Border, không chiếm chỗ — thường cho trạng thái focus',
  'Border radius': 'Độ bo tròn của góc', Padding: 'Khoảng đệm BÊN TRONG viền — giữa viền và nội dung',
  Gap: 'Khoảng cách GIỮA các phần tử con nằm cạnh nhau (do khung chứa đặt)',
  'Box shadow': 'Bóng đổ quanh phần tử', Opacity: 'Độ trong suốt: 1 = rõ hẳn, 0 = ẩn',
}
const baseOf = label => label.replace(/ (top|right|bottom|left|top-left|top-right|bottom-right|bottom-left)$/, '')   // Padding top → Padding: giải thích 1 lần cho cả nhóm
const termOf = label => TERMS[label] || TERMS[baseOf(label)] || ''
/* Khung xem bị thu nhỏ (VD bố cục trang: transform scale) → số đo theo pixel trên màn hình nhỏ hơn thật.
   Lấy tỉ lệ thu phóng của các khung cha rồi quy đổi Size / khoảng cách về kích thước thật (Padding, Border radius… đọc từ CSS vốn đã là số thật). */
const zoom = ref(1)
function scaleOf(el) {
  let k = 1
  for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
    const c = css(e); if (c.transform && c.transform !== 'none') { const m = new DOMMatrixReadOnly(c.transform); k *= Math.hypot(m.a, m.b) }
    const z = parseFloat(c.zoom); if (z && z !== 1) k *= z
  }
  return k || 1
}
const fmt = n => (Math.round(n * 10) / 10).toString().replace('.', ',')
const rs = r => ({ left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' })
const cardStyle = computed(() => {
  const W = 360, m = mouse.value, vw = window.innerWidth, vh = window.innerHeight
  const h = cardEl.value?.offsetHeight || 260
  return { left: Math.min(m.x + 16, vw - W - 8) + 'px', top: (m.y + 16 + h > vh - 8 ? Math.max(8, m.y - h - 16) : m.y + 16) + 'px' }
})

/* ── Bảng tra token: giá trị thật (đã resolve) → tên token, theo nhóm 🎨 Themes / kích thước ── */
let TOK = null
function tokens() {
  if (TOK) return TOK
  const names = new Set()
  for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules } catch { continue }
    const walk = list => { for (const r of list) { if (r.cssRules) walk(r.cssRules); if (r.style) for (const p of r.style) if (p.startsWith('--')) names.add(p) } }
    walk(rules) }
  const probe = document.createElement('div'); probe.style.cssText = 'position:absolute;visibility:hidden'; document.body.appendChild(probe)
  const color = {}, len = {}, shadow = {}
  const add = (o, k, n) => { (o[k] = o[k] || []).push(n) }
  for (const n of names) {
    if (/^--text-(h\d|body|caption|overline|sm)/.test(n)) { probe.style.width = `var(${n})`; const w = getComputedStyle(probe).width; if (w && w !== 'auto') add(len, w, n); probe.style.width = '' }
    else if (/^--(text|bg|stroke|icon)-/.test(n)) { probe.style.color = `var(${n})`; const c = getComputedStyle(probe).color; if (c) add(color, c, n); probe.style.color = '' }
    else if (/^--(radius|btn-height|input-height|gap|space|pad|box-padding|card-(px|py|gap|col-gap)|dialog-px|menu-item-gap|text-(h\d|body|caption|overline)(-lh)?$|fw-)/.test(n)) {
      if (n.startsWith('--fw-')) { probe.style.fontWeight = `var(${n})`; add(len, 'w' + getComputedStyle(probe).fontWeight, n); probe.style.fontWeight = '' }
      else { probe.style.width = `var(${n})`; const w = getComputedStyle(probe).width; if (w && w !== 'auto' && w !== '0px') add(len, w, n); probe.style.width = '' } }
    else if (/^--shadow-/.test(n)) { probe.style.boxShadow = `var(${n})`; add(shadow, getComputedStyle(probe).boxShadow, n); probe.style.boxShadow = '' }
  }
  probe.remove()
  return (TOK = { color, len, shadow })
}
// Chọn token đúng nhóm theo thuộc tính (chữ → Text, icon → Icon, nền → BG, viền → Stroke)
function colorTok(c, group) {
  const list = tokens().color[c]; if (!list) return ''
  return list.find(n => n.startsWith(`--${group}-`)) || list[0]
}
const lenTok = (v, re) => { const l = (tokens().len[v] || []).filter(n => !re || re.test(n)); const main = l.filter(n => !/focus|ring/.test(n)); return (main.length ? main : l).join(' · ') }   // bỏ --radius-focus… khi đã có biến đúng nghĩa hơn
const WEIGHT = { 100: 'Thin', 200: 'Extra Light', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semi Bold', 700: 'Bold', 800: 'Extra Bold', 900: 'Black' }
const transparent = c => !c || c === 'transparent' || /rgba\(.*,\s*0\)$/.test(c)
const px = v => parseFloat(v) || 0
const sides = (c, k) => { const v = ['Top', 'Right', 'Bottom', 'Left'].map(s => c[k.replace('*', s)]); return v.every(x => x === v[0]) ? v[0] : v.join(' ') }

/* ── Nhiều tài liệu: phần tử trong iframe (VD email xem trước) → đổi toạ độ về cửa sổ chính ── */
const css = el => el.ownerDocument.defaultView.getComputedStyle(el)
function off(el) {
  let x = 0, y = 0, w = el.ownerDocument.defaultView
  while (w.frameElement) { const f = w.frameElement, fr = f.getBoundingClientRect(), fc = w.parent.getComputedStyle(f); x += fr.left + px(fc.borderLeftWidth) + px(fc.paddingLeft); y += fr.top + px(fc.borderTopWidth) + px(fc.paddingTop); w = w.parent }
  return { x, y }
}
function rect(el) { const r = el.getBoundingClientRect(), o = off(el); return { left: r.left + o.x, top: r.top + o.y, right: r.right + o.x, bottom: r.bottom + o.y, width: r.width, height: r.height } }
/* Lớp nổi (popup, menu, dialog…) gắn vào <body>: chỉ nhận lớp xuất hiện ngay sau thao tác TRONG khung ví dụ (bấm / gõ phím),
   để không đo nhầm menu xổ của Global header, sidebar… của chính trang tài liệu */
const fromDemo = new WeakSet()
let lastInDemo = false
const markOrigin = e => { const t = e.target; lastInDemo = !!(t && t.nodeType === 1 && (props.root.contains(t) || [...fromDemoList].some(o => o.contains(t)))) }
const fromDemoList = new Set()
const bodyObs = new MutationObserver(muts => {
  for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1 && lastInDemo && !n.closest('.dsi, .dsi-card') && n.id !== 'app') { fromDemo.add(n); fromDemoList.add(n) }
  for (const n of fromDemoList) if (!n.isConnected) fromDemoList.delete(n)
})
/* Đo được: phần tử trong khung ví dụ, trong iframe của khung, hoặc lớp nổi gắn vào <body> (popup, dialog, menu, bảng chọn ngày, tooltip…) */
/* KHÔNG đo phần THAM SỐ của khung ví dụ (ô chọn kiểu / bộ màu / tuỳ chọn bật tắt, nhãn mô tả) — chỉ đo VÙNG HIỂN THỊ MẪU.
   Khối tham số mới trong demo: thêm data-dsi-ignore (hoặc dùng .seg / .demo-dt-opts…) */
const IGNORE = ['.dsi', '.dsi-card', '[data-dsi-ignore]', '.seg', '.demo-row:has(> .seg)', '.demo-dt-opts', '.demo-layout-pick', '.demo-label', '.demo-stack > .demo-muted'].join(', ')
function allowed(el) {
  if (!el || el.nodeType !== 1 || el.closest(IGNORE)) return false   // data-dsi-ignore: công cụ của trang tài liệu nằm trong khung (VD nút Đo / Thu nhỏ khi xem toàn màn hình)
  const fe = el.ownerDocument.defaultView.frameElement
  if (fe) return props.root.contains(fe) && el !== el.ownerDocument.documentElement && el !== el.ownerDocument.body
  if (props.root.contains(el)) return el !== props.root
  const top = el.closest('body > *'); return !!top && fromDemo.has(top)   // chỉ lớp nổi mở ra từ khung ví dụ (không đo menu của header / sidebar trang tài liệu)
}
/* ── Phần tử đang rê: bỏ qua phần bên trong icon SVG (lấy cả icon) ── */
function pick(el) {
  const svg = el.closest?.('svg'); if (svg) el = svg.parentElement?.classList.contains('ti') ? svg.parentElement : svg
  return allowed(el) ? el : null
}
const directText = el => [...el.childNodes].some(n => n.nodeType === 3 && /\S/.test(n.nodeValue)) || (el.matches?.('input,textarea') && (el.value || el.placeholder))
const visibleKids = el => [...(el?.children || [])].filter(k => { const r = rect(k); const c = css(k); return r.width > 0 && r.height > 0 && c.position !== 'absolute' && c.position !== 'fixed' })

function describe(el) {
  const c = css(el), r = rect(el), rows = []
  const cls = [...el.classList].filter(x => !/^v-|^router/.test(x)).slice(0, 3).map(x => '.' + x).join('')
  const isIcon = el.matches('.ti, svg')
  const k = scaleOf(el), W = r.width / k, H = r.height / k
  rows.push(['Size', `${fmt(W)} × ${fmt(H)}`, '', lenTok(`${Math.round(H)}px`, /height/)])
  if (directText(el)) {
    const fam = c.fontFamily.split(',')[0].replace(/["']/g, '')
    rows.push(['Font', fam])
    rows.push(['Font size / Line height', `${c.fontSize} / ${c.lineHeight}`, '', [lenTok(c.fontSize, /^--text-(?!.*-lh$)/), lenTok(c.lineHeight, /-lh$/)].filter(Boolean).join(' / ')])
    rows.push(['Font weight', `${c.fontWeight} ${WEIGHT[c.fontWeight] || ''}`, '', (tokens().len['w' + c.fontWeight] || []).join(' · ')])
    rows.push(['Color', c.color, c.color, colorTok(c.color, 'text')])
    if (c.letterSpacing !== 'normal') rows.push(['Letter spacing', c.letterSpacing])
  } else if (isIcon) {
    rows.push(['Color (icon)', c.color, c.color, colorTok(c.color, 'icon')])
  }
  if (!transparent(c.backgroundColor)) rows.push(['Background', c.backgroundColor, c.backgroundColor, colorTok(c.backgroundColor, 'bg')])
  if (c.backgroundImage !== 'none') rows.push(['Background image', c.backgroundImage.slice(0, 60) + (c.backgroundImage.length > 60 ? '…' : '')])
  const bw = sides(c, 'border*Width')
  if (bw !== '0px' && !['Top', 'Right', 'Bottom', 'Left'].every(s => c[`border${s}Style`] === 'none')) {
    const S = ['Top', 'Right', 'Bottom', 'Left'], one = S.every(x => c[`border${x}Width`] === c.borderTopWidth && c[`border${x}Color`] === c.borderTopColor && c[`border${x}Style`] === c.borderTopStyle)
    const row = (label, x) => { const col = c[`border${x}Color`]; rows.push([label, `${c[`border${x}Width`]} ${c[`border${x}Style`]}`, transparent(col) ? '' : col, transparent(col) ? 'transparent' : colorTok(col, 'stroke')]) }
    if (one) row('Border', 'Top')
    else S.forEach(x => { if (px(c[`border${x}Width`]) && c[`border${x}Style`] !== 'none') row(`Border ${x.toLowerCase()}`, x) })   // khác nhau → tách từng phía (VD chỉ có Border bottom)
  }
  if (c.outlineStyle !== 'none' && px(c.outlineWidth)) rows.push(['Outline', `${c.outlineWidth} cách ${c.outlineOffset}`, c.outlineColor, colorTok(c.outlineColor, 'stroke')])
  const radius = [c.borderTopLeftRadius, c.borderTopRightRadius, c.borderBottomRightRadius, c.borderBottomLeftRadius]
  // Giá trị 4 phía / 4 góc: bằng nhau → 1 dòng; khác nhau → tách từng phía cho dễ đọc (Padding top: 8px, Padding right: 12px…)
  const split = (label, vals, names, tokRe) => {
    if (vals.every(v => !px(v))) return
    if (vals.every(v => v === vals[0])) return rows.push([label, vals[0], '', tokRe ? lenTok(vals[0], tokRe) : ''])
    vals.forEach((v, i) => rows.push([`${label} ${names[i]}`, v, '', tokRe ? lenTok(v, tokRe) : '']))
  }
  split('Border radius', radius, ['top-left', 'top-right', 'bottom-right', 'bottom-left'], /^--radius/)
  split('Padding', [c.paddingTop, c.paddingRight, c.paddingBottom, c.paddingLeft], ['top', 'right', 'bottom', 'left'], /pad|space|px|py/)
  if (/flex|grid/.test(c.display) && c.gap !== 'normal' && px(c.gap)) rows.push(['Gap', c.gap, '', lenTok(c.columnGap || c.gap, /gap|space/)])
  if (c.boxShadow !== 'none') rows.push(['Box shadow', c.boxShadow.length > 48 ? c.boxShadow.slice(0, 48) + '…' : c.boxShadow, '', (tokens().shadow[c.boxShadow] || []).join(' · ')])
  if (c.opacity !== '1') rows.push(['Opacity', c.opacity])
  // Khung xem thu nhỏ → lưu ý cuối thẻ (không phải 1 thông số)
  const note = Math.abs(k - 1) > 0.01 ? `Khung xem đang thu nhỏ còn ${Math.round(k * 100)}% — Size và khoảng cách ở trên đã quy đổi về kích thước thật.` : ''
  return { name: `${el.tagName.toLowerCase()}${cls}`, rows, note }
}

/* ── CSS cho dev: mỗi thuộc tính → var(--token) nếu giá trị khớp 1 biến chuẩn (đúng nhóm: chữ Text/, nền BG/, viền Stroke/, icon Icon/…),
   không khớp → giữ giá trị thật + ghi chú “chưa có biến” (dev hỏi lại DS thay vì tự đặt số) ── */
/* Nhiều biến cùng giá trị → chọn theo thứ tự ưu tiên của thuộc tính (VD 8px: card → --radius-card, còn lại --radius-default; không lấy --radius-focus) */
const PREF = {
  radius: ['--radius-card', '--radius-default', '--radius-dialog', '--radius-inner', '--radius-sm', '--radius-pill'],
  pad: ['--box-padding', '--card-px', '--card-py', '--dialog-px'],
  gap: ['--card-gap', '--card-col-gap', '--gap-control', '--menu-item-gap'],
  shadow: ['--shadow-card', '--shadow-popover', '--shadow-dialog'],
}
const first = (v, re, pref) => {
  const list = (tokens().len[v] || []).filter(n => !re || re.test(n))
  return (pref || []).find(n => list.includes(n)) || list.find(n => !/focus|ring/.test(n)) || ''
}
const isCard = el => el.matches('.surface, .card, .kpi-card, .table-panel, .db-widget, [class*="card"]')
const NO_TOK = ' /* chưa có biến chuẩn */'
function cssOf(el) {
  const c = css(el), L = []
  const isIcon = el.matches('.ti, svg'), text = directText(el)
  const add = (prop, val, tok, raw = false) => L.push(`  ${prop}: ${tok ? `var(${tok})` : val};${tok || raw ? '' : NO_TOK}`)
  const H = `${Math.round(px(c.height))}px`, hTok = first(H, /height/)
  if (hTok) add('height', H, hTok)
  if (text) {
    add('font-size', c.fontSize, first(c.fontSize, /^--text-(?!.*-lh$)/))
    add('line-height', c.lineHeight, first(c.lineHeight, /-lh$/), c.lineHeight === 'normal')
    add('font-weight', c.fontWeight, (tokens().len['w' + c.fontWeight] || [])[0])
    add('color', c.color, colorTok(c.color, 'text'))
  } else if (isIcon) add('color', c.color, colorTok(c.color, 'icon'))
  if (!transparent(c.backgroundColor)) add('background', c.backgroundColor, colorTok(c.backgroundColor, 'bg'))
  const S = ['Top', 'Right', 'Bottom', 'Left'], bOn = x => px(c[`border${x}Width`]) && c[`border${x}Style`] !== 'none'
  const bLine = x => { const col = c[`border${x}Color`], t = colorTok(col, 'stroke'); return [`${c[`border${x}Width`]} ${c[`border${x}Style`]} ${t ? `var(${t})` : col}`, t] }
  if (S.every(x => bOn(x) && c[`border${x}Width`] === c.borderTopWidth && c[`border${x}Color`] === c.borderTopColor)) { const [v, t] = bLine('Top'); L.push(`  border: ${v};${t ? '' : NO_TOK}`) }
  else S.forEach(x => { if (bOn(x)) { const [v, t] = bLine(x); L.push(`  border-${x.toLowerCase()}: ${v};${t ? '' : NO_TOK}`) } })
  const rad = [c.borderTopLeftRadius, c.borderTopRightRadius, c.borderBottomRightRadius, c.borderBottomLeftRadius]
  const rPref = isCard(el) ? PREF.radius : PREF.radius.slice(1)
  const rv = v => { const t = first(v, /^--radius/, rPref); return t ? `var(${t})` : v }
  if (rad.some(v => px(v))) { const vals = rad.every(v => v === rad[0]) ? [rad[0]] : rad; const out = vals.map(rv).join(' '); L.push(`  border-radius: ${out};${vals.every(v => !px(v) || first(v, /^--radius/)) ? '' : NO_TOK}`) }
  let padMiss = false
  const pv = v => { if (!px(v)) return '0'; const t = first(v, /pad|space|px|py/, PREF.pad); if (!t) padMiss = true; return t ? `var(${t})` : v }
  const pad = [c.paddingTop, c.paddingRight, c.paddingBottom, c.paddingLeft]
  if (pad.some(v => px(v))) { const vals = pad[0] === pad[2] && pad[1] === pad[3] ? (pad[0] === pad[1] ? [pad[0]] : [pad[0], pad[1]]) : pad; const out = vals.map(pv).join(' '); L.push(`  padding: ${out};${padMiss ? NO_TOK : ''}`) }
  if (/flex|grid/.test(c.display)) {
    L.push(`  display: ${c.display};`)
    if (c.flexDirection === 'column') L.push('  flex-direction: column;')
    if (c.alignItems && c.alignItems !== 'normal' && c.alignItems !== 'stretch') L.push(`  align-items: ${c.alignItems};`)
    if (c.gap !== 'normal' && px(c.gap)) add('gap', c.columnGap || c.gap, first(c.columnGap || c.gap, /gap|space/, PREF.gap))
  }
  if (c.boxShadow !== 'none') { const sl = tokens().shadow[c.boxShadow] || []; add('box-shadow', c.boxShadow, PREF.shadow.find(n => sl.includes(n)) || sl[0]) }
  if (c.opacity !== '1') L.push(`  opacity: ${c.opacity};`)
  const sel = [...el.classList].filter(x => !/^v-|^router/.test(x))[0]
  return `${sel ? '.' + sel : el.tagName.toLowerCase()} {\n${L.join('\n')}\n}`
}
async function copyCss() { if (await copyText(cssCode.value)) toast.success('Đã sao chép CSS') }

/* ── Khoảng cách tới phần tử kề (cùng cha) hoặc mép trong của cha — 4 hướng ── */
function measure(el) {
  const r = rect(el), out = []
  const parent = el.parentElement, pr = rect(parent), pc = css(parent)
  const inner = { l: pr.left + px(pc.borderLeftWidth) + px(pc.paddingLeft), r: pr.right - px(pc.borderRightWidth) - px(pc.paddingRight), t: pr.top + px(pc.borderTopWidth) + px(pc.paddingTop), b: pr.bottom - px(pc.borderBottomWidth) - px(pc.paddingBottom) }
  const sibs = visibleKids(parent).filter(k => k !== el).map(k => rect(k))
  const overlapY = s => s.bottom > r.top && s.top < r.bottom, overlapX = s => s.right > r.left && s.left < r.right
  const cy = r.top + r.height / 2, cx = r.left + r.width / 2
  // trái / phải
  const left = Math.max(...sibs.filter(s => overlapY(s) && s.right <= r.left + 0.5).map(s => s.right), -Infinity)
  const right = Math.min(...sibs.filter(s => overlapY(s) && s.left >= r.right - 0.5).map(s => s.left), Infinity)
  const L = left > -Infinity ? left : (inner.l < r.left - 0.5 ? pr.left : null), R = right < Infinity ? right : (inner.r > r.right + 0.5 ? pr.right : null)
  if (L != null && r.left - L > 0.5) out.push({ x: L, y: cy, w: r.left - L, h: 1 })
  if (R != null && R - r.right > 0.5) out.push({ x: r.right, y: cy, w: R - r.right, h: 1 })
  // trên / dưới
  const up = Math.max(...sibs.filter(s => overlapX(s) && s.bottom <= r.top + 0.5).map(s => s.bottom), -Infinity)
  const down = Math.min(...sibs.filter(s => overlapX(s) && s.top >= r.bottom - 0.5).map(s => s.top), Infinity)
  const U = up > -Infinity ? up : (inner.t < r.top - 0.5 ? pr.top : null), D = down < Infinity ? down : (inner.b > r.bottom + 0.5 ? pr.bottom : null)
  if (U != null && r.top - U > 0.5) out.push({ x: cx, y: U, w: 1, h: r.top - U, v: true })
  if (D != null && D - r.bottom > 0.5) out.push({ x: cx, y: r.bottom, w: 1, h: D - r.bottom, v: true })
  return out
}
function padRects(el) {
  const r = rect(el), c = css(el)
  const bl = px(c.borderLeftWidth), bt = px(c.borderTopWidth), br = px(c.borderRightWidth), bb = px(c.borderBottomWidth)
  const [pt, pr, pb, pl] = [c.paddingTop, c.paddingRight, c.paddingBottom, c.paddingLeft].map(px)
  const x = r.left + bl, y = r.top + bt, w = r.width - bl - br, h = r.height - bt - bb
  return [{ x, y, w, h: pt }, { x, y: y + h - pb, w, h: pb }, { x, y: y + pt, w: pl, h: h - pt - pb }, { x: x + w - pr, y: y + pt, w: pr, h: h - pt - pb }].filter(q => q.w > 0 && q.h > 0)
}

let cur = null
function show(el) {
  zoom.value = scaleOf(el)
  cur = el; const r = rect(el)
  box.value = { x: r.left, y: r.top, w: r.width, h: r.height }
  pads.value = padRects(el); gaps.value = measure(el); info.value = describe(el); cssCode.value = cssOf(el)
}
const pos = e => { const o = off(e.target.nodeType === 1 ? e.target : e.target.parentElement); return { x: e.clientX + o.x, y: e.clientY + o.y } }
function onMove(e) {
  if (pinned.value) return
  mouse.value = pos(e)
  const el = pick(e.target); if (!el) { box.value = null; info.value = null; cur = null; return }
  if (el !== cur) { stack.length = 0; show(el) }
}
/* Bấm thường: control vẫn dùng được (mở popup, menu… rồi đo tiếp) · Alt + bấm: ghim thông số */
function onClick(e) {
  if (cardEl.value?.contains(e.target)) return
  if (!e.altKey) { if (pinned.value) pinned.value = false; return }
  const el = pick(e.target); if (!el) return
  e.preventDefault(); e.stopPropagation()
  mouse.value = pos(e); show(el); pinned.value = true; showCss.value = false
}
const stack = []   // ↑ đi lên phần tử cha (VD từ <input> lên khung .ibox), ↓ quay lại
function onKey(e) {
  if (e.key === 'Escape') {
    // Đang mở popup / dialog / danh sách xổ ra trong ví dụ → nhường Esc cho nó đóng trước (không tắt Đo, không chặn)
    if (document.querySelector('[aria-modal="true"], [role="dialog"], [role="listbox"], .dt-filter-popover, .dd-menu, .dropdown-menu')) return
    e.stopPropagation(); emit('close'); return
  }
  if (!cur) return
  if (e.key === 'ArrowUp' && allowed(cur.parentElement)) { e.preventDefault(); stack.push(cur); show(cur.parentElement); pinned.value = true }
  else if (e.key === 'ArrowDown' && stack.length) { e.preventDefault(); show(stack.pop()); pinned.value = true }
}
function onScroll() { if (cur?.isConnected) show(cur) }
/* Gắn nghe sự kiện vào iframe cùng nguồn trong khung (email xem trước) — iframe tải lại / đổi mẫu thì gắn lại */
const hooked = new WeakSet()
function hookFrames() {
  props.root.querySelectorAll('iframe').forEach(f => {
    let d; try { d = f.contentDocument } catch { return }
    if (!d || hooked.has(d)) return
    hooked.add(d); d.addEventListener('mousemove', onMove, true); d.addEventListener('click', onClick, true); d.addEventListener('keydown', onKey, true)
    d.addEventListener('scroll', onScroll, true)
    const st = d.createElement('style'); st.className = 'dsi-cursor'; st.textContent = '*{cursor:crosshair!important}'; d.head?.appendChild(st)
  })
}
let timer
onMounted(() => {
  document.addEventListener('mousemove', onMove, true); document.addEventListener('click', onClick, true)
  document.addEventListener('keydown', onKey, true); window.addEventListener('scroll', onScroll, true)
  document.addEventListener('pointerdown', markOrigin, true); document.addEventListener('keydown', markOrigin, true); document.addEventListener('focusin', markOrigin, true)
  bodyObs.observe(document.body, { childList: true })
  props.root.classList.add('ds-demo__stage--inspect'); nextTick(tokens); hookFrames(); timer = setInterval(hookFrames, 800)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onMove, true); document.removeEventListener('click', onClick, true)
  document.removeEventListener('keydown', onKey, true); window.removeEventListener('scroll', onScroll, true)
  clearInterval(timer); bodyObs.disconnect()
  document.removeEventListener('pointerdown', markOrigin, true); document.removeEventListener('keydown', markOrigin, true); document.removeEventListener('focusin', markOrigin, true)
  props.root.querySelectorAll('iframe').forEach(f => { let d; try { d = f.contentDocument } catch { return } if (!d || !hooked.has(d)) return
    d.removeEventListener('mousemove', onMove, true); d.removeEventListener('click', onClick, true); d.removeEventListener('keydown', onKey, true); d.removeEventListener('scroll', onScroll, true); d.querySelector('.dsi-cursor')?.remove() })
  props.root.classList.remove('ds-demo__stage--inspect')
})
</script>

<style>
/* Lớp đo — màu theo Inspect của Figma (khung xanh, đệm xanh lá, khoảng cách đỏ cam) */
.dsi { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; }
.dsi > * { position: fixed; }
.dsi__box { outline: 1px solid #0d99ff; background: rgba(13, 153, 255, 0.08); }
.dsi__pad { background: rgba(20, 174, 92, 0.22); }
.dsi__size { transform: translateX(-50%); padding: 0 6px; border-radius: 4px; background: #0d99ff; color: #fff; font: 600 11px/18px var(--font-family); white-space: nowrap; }
.dsi__gap--h { border-top: 1px dashed #f24822; height: 0 !important; }
.dsi__gap--v { border-left: 1px dashed #f24822; width: 0 !important; }
.dsi__gap-label { transform: translate(-50%, -50%); padding: 0 4px; border-radius: 4px; background: #f24822; color: #fff; font: 600 11px/16px var(--font-family); white-space: nowrap; }
.dsi-card { position: fixed; z-index: 2147483001; width: 360px; padding: 12px; border-radius: var(--radius-dialog, 12px); background: #1e1e1e; color: #fff; box-shadow: var(--shadow-popover); font: 400 12px/18px var(--font-family); pointer-events: none; }
.dsi-card--pinned { pointer-events: auto; outline: 1px solid #0d99ff; }
.dsi-card__head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 13px; overflow-wrap: anywhere; }
.dsi-card__head b { flex: 1; min-width: 0; color: #7cc4ff; font-weight: 600; }
.dsi-card__pin { color: #b3b3b3; font-size: 11px; white-space: nowrap; }
.dsi-card dl { display: grid; grid-template-columns: 128px 1fr; gap: 4px 8px; margin: 0; }
.dsi-card dt { color: #b3b3b3; }
.dsi-card dd { margin: 0; display: flex; align-items: center; flex-wrap: wrap; gap: 4px 6px; overflow-wrap: anywhere; }
.dsi-card code { padding: 0 4px; border-radius: 4px; background: #383838; color: #ffd27a; font-size: 11px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.dsi-card__hint a { color: #7cc4ff; }
.dsi-card__term { display: block; color: #8c8c8c; font-size: 11px; line-height: 15px; }   /* giải thích ngắn dưới tên thông số (bật / tắt ở thanh khung ví dụ) */
.dsi-card__note { display: flex; gap: 6px; margin-top: 8px; padding: 6px 8px; border-radius: var(--radius-sm, 4px); background: #2c2c2c; color: #c8c8c8; font-size: 11px; line-height: 16px; }
.dsi-card__note .ti { flex-shrink: 0; font-size: 14px; line-height: 16px; color: #7cc4ff; }
.dsi-card__hint { margin-top: 8px; padding-top: 8px; border-top: 1px solid #383838; color: #8c8c8c; font-size: 11px; }
.dsi-card__css { margin-top: 8px; padding-top: 8px; border-top: 1px solid #383838; }
.dsi-card__css-bar { display: flex; align-items: center; gap: 12px; }
.dsi-card__link { display: inline-flex; align-items: center; gap: 4px; padding: 0; border: 0; background: none; color: #7cc4ff; font: 600 12px/18px var(--font-family); cursor: pointer; }
.dsi-card__link:hover { text-decoration: underline; }
.dsi-card__link--end { margin-left: auto; text-decoration: none; }
.dsi-card__link .ti { font-size: 14px; }
.dsi-card__css-tip { display: inline-flex; align-items: center; gap: 6px; color: #b3b3b3; font-size: 11px; }
.dsi-card__css-tip .ti { font-size: 14px; color: #7cc4ff; }
.dsi-card__code { margin: 6px 0 0; padding: 8px; max-height: 220px; overflow: auto; border-radius: var(--radius-sm, 4px); background: #2c2c2c; color: #ffd27a; font: 11px/16px ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre; user-select: text; }
.dsi-card__sw { width: 12px; height: 12px; border-radius: 3px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3); flex-shrink: 0; }
.ds-demo__stage--inspect, .ds-demo__stage--inspect * { cursor: crosshair !important; }
</style>
