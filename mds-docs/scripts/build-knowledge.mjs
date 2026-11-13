/* ═══ Gom tri thức cho AVA của tài liệu Design System → mds-docs/knowledge/*.md ═══
   Chạy trước mỗi lần build / deploy (npm run build tự gọi): bộ skill chung + token thật trong mds-ui/style.css + props từng control mds-ui.
   Máy chủ (server/docs.js) đọc thư mục này + nội dung các trang tài liệu (CMS) để tìm đoạn liên quan khi người dùng hỏi. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.resolve(ROOT, '..')
const OUT = path.join(ROOT, 'knowledge')
fs.mkdirSync(OUT, { recursive: true })
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.md')) fs.rmSync(path.join(OUT, f))

/* 1) Bộ skill chung (quy chuẩn + control) */
const SKILLS = [
  ['skill-mds-ui-rules.md', 'Quy chuẩn mds-ui (skill mds-ui-rules)', 'Claude/mds-ui-rules/SKILL.md'],
  ['skill-webapp.md', 'Quy chuẩn dựng web app MDS (skill mds-webapp-developer)', 'Claude/.claude/skills/mds-webapp-developer/SKILL.md'],
  ['vue-controls.md', 'Control Vue trong mds-ui (vue-controls)', 'Claude/.claude/skills/mds-webapp-developer/references/vue-controls.md'],
  ['design-tokens.md', 'Design tokens (Figma Variables → CSS)', 'Claude/.claude/skills/mds-webapp-developer/references/design-tokens.md'],
  ['themes.md', 'Màu chủ đề (THEMES)', 'Claude/.claude/skills/mds-webapp-developer/THEMES.md'],
  ['viewport-scroll.md', 'Cuộn & khung nhìn', 'Claude/.claude/skills/mds-webapp-developer/references/viewport-scroll.md'],
  ['echarts.md', 'Biểu đồ ECharts', 'Claude/.claude/skills/mds-webapp-developer/references/echarts-dashboard.md'],
]
for (const [out, title, src] of SKILLS) {
  const p = path.join(REPO, src)
  if (!fs.existsSync(p)) { console.warn('⚠ thiếu', src); continue }
  const body = fs.readFileSync(p, 'utf8').replace(/^---[\s\S]*?---\n/, '')   // bỏ frontmatter
  fs.writeFileSync(path.join(OUT, out), `<!-- source: ${title} -->\n${body}`)
}

/* 2) Token thật trong mds-ui/style.css — giá trị theo 3 mật độ */
const css = fs.readFileSync(path.join(REPO, 'mds-ui/src/style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const blocks = { medium: {}, compact: {}, comfortable: {} }
for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const sel = m[1].trim()
  const key = sel === ':root' ? 'medium' : sel === ':root[data-density="compact"]' ? 'compact' : sel === ':root[data-density="comfortable"]' ? 'comfortable' : null
  if (!key) continue
  for (const d of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) blocks[key][d[1]] = d[2].trim().replace(/\s+/g, ' ')
}
const dens = [...new Set([...Object.keys(blocks.compact), ...Object.keys(blocks.comfortable)])]
let tok = '<!-- source: Token CSS thật trong mds-ui/src/style.css -->\n# Token CSS của mds-ui (giá trị thật trong code)\n\n'
tok += 'Mật độ hiển thị: **Trung bình** (mặc định, :root) · **Nhỏ** ([data-density="compact"]) · **Rộng** ([data-density="comfortable"]). Ô trống = giống Trung bình.\n\n'
tok += '## Token đổi theo mật độ hiển thị\n\n| Token | Trung bình | Nhỏ | Rộng |\n|---|---|---|---|\n'
for (const k of dens) tok += `| \`${k}\` | ${blocks.medium[k] ?? ''} | ${blocks.compact[k] ?? ''} | ${blocks.comfortable[k] ?? ''} |\n`
// Token còn lại: gom theo tiền tố (--btn-, --input-, --text-, --bg-…)
const groups = {}
for (const [k, v] of Object.entries(blocks.medium)) { if (dens.includes(k)) continue; const g = k.replace(/^--/, '').split('-')[0]; (groups[g] ??= []).push([k, v]) }
for (const [g, list] of Object.entries(groups).sort()) {
  tok += `\n## Token nhóm "${g}"\n\n| Token | Giá trị |\n|---|---|\n`
  for (const [k, v] of list) tok += `| \`${k}\` | ${v} |\n`
}
fs.writeFileSync(path.join(OUT, 'tokens.md'), tok)

/* 2a) SỐ ĐO ĐANG CHẠY của control chính — đọc khai báo CSS thật của từng class, thay var(--token) bằng giá trị theo 3 mật độ.
   AVA luôn nhận bảng này kèm mọi câu hỏi (ưu tiên cao nhất) → trả lời đúng số, không lẫn cột Figma (Std / Compact / Comfortable / Mobile). */
const DENS = [['medium', 'Trung bình'], ['compact', 'Nhỏ'], ['comfortable', 'Rộng']]
const resolve = (v, d, depth = 0) => {
  if (depth > 6) return v
  const out = v.replace(/var\((--[\w-]+)(?:,\s*([^)]+))?\)/g, (_, k, fb) => blocks[d][k] ?? blocks.medium[k] ?? fb ?? `var(${k})`)
  return out === v ? v : resolve(out, d, depth + 1)
}
const calc = v => v.replace(/calc\(\s*(-?[\d.]+)px\s*([+-])\s*(-?[\d.]+)px\s*\)/g, (_, a, op, b) => `${op === '+' ? +a + +b : a - b}px`)
/* Shadow → tên Effect style trong Figma (Drop Shadow / Neutral / All|Bottom|Top|Right|Left N) để designer chọn đúng style khi dựng */
const figmaShadow = v => {
  const m = String(v).match(/^(-?\d+)(?:px)? (-?\d+)(?:px)? (\d+)(?:px)? (\d+)(?:px)? #/)
  if (!m || /,/.test(v)) return ''
  const [x, y, blur] = [+m[1], +m[2], +m[3]]; if (!blur) return ''
  const dir = !x && !y ? 'All' : !x && y > 0 ? 'Bottom' : !x && y < 0 ? 'Top' : x > 0 && !y ? 'Right' : x < 0 && !y ? 'Left' : ''
  return dir ? ` (Figma Effect style: Neutral / ${dir} ${blur})` : ''
}
const decls = sel => {   // gộp mọi khối có đúng selector này (không tính :hover…)
  const out = {}
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!m[1].split(',').map(x => x.trim()).includes(sel)) continue
    for (const d of m[2].matchAll(/([\w-]+)\s*:\s*([^;]+);/g)) out[d[1]] = d[2].trim()
  }
  return out
}
const PROPS = { height: 'Chiều cao', 'min-height': 'Cao tối thiểu', width: 'Rộng', 'min-width': 'Rộng tối thiểu', padding: 'Đệm (padding)', gap: 'Khoảng cách trong (gap)', 'border-radius': 'Bo góc', 'font-size': 'Cỡ chữ', 'font-weight': 'Độ đậm chữ', background: 'Nền', border: 'Viền', 'box-shadow': 'Bóng đổ' }
const CONTROLS = [
  ['.btn', 'Button (nút) — mọi loại: .btn--primary (nút chính), .btn--outline.btn--neutral (nút phụ)…'], ['.btn--sm', 'Button nhỏ (.btn--sm)'], ['.btn--lg', 'Button lớn (.btn--lg)'],
  ['.btn-icon', 'Button icon (nút chỉ có icon)'], ['.btn-icon--sm', 'Button icon nhỏ'], ['.ibox', 'Ô nhập liệu (Textbox / Combobox / Datebox / Numberbox / Searchbox — khung .ibox)'],
  ['.ibox--search', 'Search box thường (AppSearchbox) — Outline / Filled / Filled White; tìm thông minh = AppAiSearchbox'], ['.ibox--filled', 'Search box kiểu Filled (variant="filled")'],
  ['.dt-cell-inner', 'Ô dữ liệu trong bảng (DataTable) — dòng bảng cao --dt-row-height'], ['.sub-nav-tab', 'Tab (SubNavTabs)'], ['.dropdown-menu__item', 'Mục trong menu xổ ra (DropdownMenu / Combobox)'],
  ['.sidebar-item', 'Mục sidebar'], ['.card', 'Card — khối nền trắng đặt trên nền trang xám'], ['.surface', 'Khối nền trắng (surface) trên nền trang'], ['.app-tag', 'Tag (AppTag)'], ['.inline-alert', 'Thông báo inline (AppInlineAlert)'],
]
let facts = '<!-- source: Số đo đang chạy trong code mds-ui -->\n# SỐ ĐO ĐANG CHẠY TRONG CODE mds-ui (nguồn đúng nhất — ưu tiên số này)\n\n'
facts += 'Ba mật độ hiển thị: **Trung bình** (mặc định) · **Nhỏ** · **Rộng** (người dùng chọn ở bánh răng → Thiết lập hiển thị). Mỗi dòng: thuộc tính = khai báo CSS → giá trị Trung bình / Nhỏ / Rộng.\n'
facts += '\n**Tự đo thông số trên trang tài liệu:** khi trả lời câu hỏi về thông số (cao, rộng, Padding, Gap, Border, Border radius, màu, font, khoảng cách…) của control / màn mẫu, cuối câu trả lời luôn gợi ý thêm: mở trang tài liệu của control đó (VD [Button](/ds/button)) → khung **Ví dụ trực quan** → công cụ **Đo** trên thanh khung ví dụ (mặc định đã bật; xem toàn màn hình cũng có nút Đo) → rê chuột lên phần tử để xem đủ thông số kèm tên token (Alt + bấm để ghim, ↑ chọn phần tử cha, Esc tắt); đổi **Mật độ** / **Font size** trên thanh để xem từng mode. Giải thích thuật ngữ: [Thuật ngữ CSS](/ds/css-terms).\n'
for (const [sel, label] of CONTROLS) {
  const dc = decls(sel)
  const rows = Object.keys(PROPS).filter(k => dc[k]).map(k => {
    const vals = DENS.map(([d]) => calc(resolve(dc[k], d)))
    const same = vals.every(v => v === vals[0])
    return `- ${PROPS[k]}: \`${dc[k]}\` → ${same ? `**${vals[0]}** (mọi mật độ)` : DENS.map(([, n], i) => `${n} **${vals[i]}**`).join(' · ')}${k === 'box-shadow' ? figmaShadow(vals[0]) : ''}`
  })
  if (rows.length) facts += `\n## ${label} — class \`${sel}\`\n${rows.join('\n')}\n`
}
const tokRow = (k, label) => { const v = DENS.map(([d]) => calc(resolve(`var(${k})`, d))); return `- ${label} \`${k}\`: ${v.every(x => x === v[0]) ? `**${v[0]}** (mọi mật độ)` : DENS.map(([, n], i) => `${n} **${v[i]}**`).join(' · ')}` }
facts += '\n## Token chung\n' + [
  ['--text-body', 'Cỡ chữ mặc định (chữ nội dung, nhãn, ô, bảng)'], ['--radius-default', 'Bo góc mặc định (nút, ô nhập, menu, tag)'], ['--radius-dialog', 'Bo góc dialog / card / popover'],
  ['--input-height', 'Chiều cao ô nhập'], ['--btn-height', 'Chiều cao nút'], ['--btn-min-width', 'Rộng tối thiểu nút (code)'], ['--dt-row-height', 'Chiều cao dòng bảng'],
  ['--layout-header-h', 'Chiều cao header'], ['--layout-sidebar-w', 'Sidebar mở rộng'], ['--layout-sidebar-sm-w', 'Sidebar thu gọn'], ['--gap-control', 'Khoảng cách giữa các control cạnh nhau'], ['--card-col-gap', 'Khoảng cách giữa các card'],
].filter(([k]) => blocks.medium[k]).map(([k, l]) => tokRow(k, l)).join('\n') + '\n'
facts += '\nGhi chú: tên mode Figma Standard · Compact · Comfortable · Mobile = Trung bình | Nhỏ | Rộng | Mobile — luôn gọi bằng tên tiếng Việt (Mobile KHÔNG dùng cho web). Khi Figma và code lệch nhau (VD Figma Min-Width nút 80 / 72 / 96 nhưng code `--btn-min-width` 80px mọi mật độ) → nêu số trong code là số đang chạy, kèm ghi chú Figma.\n'
fs.writeFileSync(path.join(OUT, 'facts.md'), facts)

/* 2b) Class CSS của control (.btn, .ibox, .dt-…, .sidebar-…) — gom theo tiền tố class, giữ chú thích (thường ghi luôn quy chuẩn Figma) */
const raw = fs.readFileSync(path.join(REPO, 'mds-ui/src/style.css'), 'utf8')
const rules = {}
let buf = ''
for (const m of raw.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '').matchAll(/(\s*\/\*[\s\S]*?\*\/)|([^{}]+)\{([^{}]*)\}/g)) {
  if (m[1]) { buf += m[1]; continue }
  const sel = m[2].trim(), cls = sel.match(/\.([a-z][a-z0-9]*)/i)?.[1]
  if (!cls || sel.startsWith(':root') && !sel.includes('.')) { buf = ''; continue }
  ;(rules[cls] ??= []).push((buf.trim() ? buf.trim() + '\n' : '') + `${sel.replace(/\s+/g, ' ')} { ${m[3].trim().replace(/\s+/g, ' ')} }`)
  buf = ''
}
let cssOut = '<!-- source: Class CSS trong mds-ui/src/style.css -->\n# Class CSS của control mds-ui (code thật)\n'
for (const [cls, list] of Object.entries(rules).sort()) cssOut += `\n## Class .${cls}…\n\n\`\`\`css\n${list.join('\n')}\n\`\`\`\n`
fs.writeFileSync(path.join(OUT, 'css-classes.md'), cssOut)

/* 3) Props / sự kiện / slot của từng control mds-ui */
const CDIR = path.join(REPO, 'mds-ui/src/components')
let comp = '<!-- source: Props control trong mds-ui/src/components -->\n# Control trong mds-ui — props, sự kiện, slot (lấy thẳng từ code)\n\nImport: `import X from \'@mds/components/X.vue\'`.\n'
for (const f of fs.readdirSync(CDIR).filter(f => f.endsWith('.vue')).sort()) {
  const src = fs.readFileSync(path.join(CDIR, f), 'utf8')
  const name = f.replace('.vue', '')
  const start = src.indexOf('defineProps(')
  let props = ''
  if (start >= 0) {   // lấy trọn khối defineProps({ … }) theo cặp ngoặc
    let i = src.indexOf('(', start), depth = 0, j = i
    for (; j < src.length; j++) { if (src[j] === '(') depth++; else if (src[j] === ')' && --depth === 0) break }
    props = src.slice(start, j + 1)
  }
  const emits = src.match(/defineEmits\(([^)]*)\)/)?.[1]?.trim() ?? ''
  const slots = [...new Set([...src.matchAll(/<slot(?:\s+name="([\w-]+)")?/g)].map(m => m[1] || 'default'))]
  const head = src.match(/<!--([\s\S]*?)-->/)?.[1]?.trim().split('\n')[0] ?? ''
  comp += `\n## ${name}\n\n`
  if (head) comp += `${head}\n\n`
  if (props) comp += '```js\n' + props + '\n```\n'
  if (emits) comp += `Sự kiện: \`${emits.replace(/\s+/g, ' ')}\`\n\n`
  if (slots.length) comp += `Slot: ${slots.map(s => '`' + s + '`').join(', ')}\n`
}
fs.writeFileSync(path.join(OUT, 'components.md'), comp)

/* 4) SỐ ĐO + TRẠNG THÁI TỪNG CONTROL — tự đọc CSS thật (style.css + <style> của từng .vue), thay var(--token) bằng số / mã màu theo 3 mật độ.
   Ghi vào facts-controls.md: AVA chỉ gửi các mục có tên control trùng câu hỏi (ava.js › factsFor). Muốn AVA biết thêm control → chỉ cần control đó có trong mds-ui. */
const friendly = v => v.replace(/#([0-9a-fA-F]{6})([0-9a-fA-F]{2})\b/g, (_, rgb, a) => { const n = Math.round(parseInt(a, 16) / 2.55); return n >= 100 ? `#${rgb}` : `#${rgb} độ mờ ${n}%` })
const LBL = { height: 'Cao', 'min-height': 'Cao tối thiểu', 'max-height': 'Cao tối đa', width: 'Rộng', 'min-width': 'Rộng tối thiểu', 'max-width': 'Rộng tối đa', padding: 'Padding', 'padding-left': 'Padding trái', 'padding-right': 'Padding phải',
  'padding-top': 'Padding trên', 'padding-bottom': 'Padding dưới', gap: 'Gap', 'border-radius': 'Border radius', 'font-size': 'Font size', 'font-weight': 'Font weight', 'line-height': 'Line height', border: 'Border', 'border-color': 'Màu viền',
  'box-shadow': 'Box shadow', background: 'Nền', 'background-color': 'Nền', color: 'Màu chữ', outline: 'Outline', opacity: 'Độ mờ' }
const BASE_KEYS = ['height', 'min-height', 'max-height', 'width', 'min-width', 'max-width', 'padding', 'padding-left', 'padding-right', 'padding-top', 'padding-bottom', 'gap', 'border-radius', 'font-size', 'font-weight', 'line-height', 'border', 'box-shadow', 'background', 'background-color', 'color']
const STATE_KEYS = ['background', 'background-color', 'color', 'border', 'border-color', 'box-shadow', 'outline', 'opacity', 'font-weight']
const STATE_RE = /:hover|:focus|:active|:disabled|:checked|:focus-within|:focus-visible|\[disabled\]|--(disabled|checked|error|active|selected|open|on|invalid|focus|hover|readonly|indeterminate)\b/
const dens3 = (v, shadow = false) => { const raw = DENS.map(([d]) => calc(resolve(v, d))), vals = raw.map(friendly); return vals.every(x => x === vals[0]) ? `**${vals[0]}**${shadow ? figmaShadow(raw[0]) : ''}` : DENS.map(([, n], i) => `${n} **${vals[i]}**`).join(' · ') }
const declLine = (dc, keys) => keys.filter(k => dc[k] && !/^(inherit|initial|unset|none)$/.test(dc[k]) || (k === 'box-shadow' && dc[k])).map(k => `${LBL[k]} ${dens3(dc[k], k === 'box-shadow')}`).join(' · ')
const NAMES = {
  AppButton: 'Button (nút) — AppButton', AppCheckbox: 'Checkbox (ô tick) — AppCheckbox', AppRadio: 'Radio button — AppRadio', AppCombobox: 'ComboBox / DropDownList (ô chọn xổ xuống) — AppCombobox', AppDatebox: 'Datebox / DateTimePicker (chọn ngày) — AppDatebox',
  AppDatePicker: 'DatePicker (lịch chọn ngày) — AppDatePicker', AppTextbox: 'Textbox / Text field (ô nhập) — AppTextbox', AppTextarea: 'Textarea (ô nhập nhiều dòng) — AppTextarea', AppNumberbox: 'Numberbox (ô nhập số) — AppNumberbox',
  AppInput: 'Input (ô nhập) — AppInput', AppSearchbox: 'Search box (ô tìm kiếm) — AppSearchbox', AppAiSearchbox: 'AI Search box (tìm thông minh) — AppAiSearchbox', AppTag: 'Tag (nhãn) — AppTag', AppAlertDialog: 'Dialog (hộp thoại xác nhận) — AppAlertDialog',
  AppFormPanel: 'Popup / Form panel (form nhập liệu dạng popup) — AppFormPanel', AppToaster: 'Toast (thông báo nổi) — AppToaster', AppPagination: 'Pagination (phân trang) — AppPagination', AppSegmented: 'Segmented (nhóm nút chọn 1) — AppSegmented',
  AppTabs: 'Tabs — AppTabs', SubNavTabs: 'Tabs (thanh tab phụ) — SubNavTabs', DropdownMenu: 'Dropdown menu / Context menu (menu xổ ra) — DropdownMenu', AppSidebar: 'Sidebar (thanh bên) — AppSidebar', DataTable: 'Data table (bảng dữ liệu) — DataTable',
  AppTree: 'Tree (cây) — AppTree', AppAvatar: 'Avatar (ảnh đại diện) — AppAvatar', AppInlineAlert: 'Inline alert (thông báo trong trang) — AppInlineAlert', AppAccordion: 'Accordion — AppAccordion', TableHeader: 'Table header (thanh công cụ bảng) — TableHeader',
  TablePaging: 'Table paging (phân trang bảng) — TablePaging', DetailField: 'Detail field (trường xem chi tiết) — DetailField', EmptyArt: 'Empty state (trạng thái trống) — EmptyArt', ControlHeader: 'Header / Control header — ControlHeader',
}
const TITLE_OF = n => NAMES[n] || `${n}`
const stripKf = t => t.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
function ruleList(text) {   // [{ sel, body, note }] — note = chú thích ngay trước luật (thường ghi vai trò phần tử / quy chuẩn Figma)
  const out = []
  // Chú thích bọc bằng \u0001…\u0002 (bỏ dấu ngoặc nhọn bên trong) để regex luật không nuốt chú thích vào selector
  const t = stripKf(text).replace(/\/\*([\s\S]*?)\*\//g, (_, c) => '\u0001' + c.replace(/[{}]/g, ' ') + '\u0002')
  for (const m of t.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const notes = [...m[1].matchAll(/\u0001([\s\S]*?)\u0002/g)].map(x => x[1].trim().replace(/\s+/g, ' '))
    const note = (notes.at(-1) || '').slice(0, 110)
    const selText = m[1].replace(/\u0001[\s\S]*?\u0002/g, '')
    const body = {}
    for (const d of m[2].replace(/\u0001[\s\S]*?\u0002/g, '').matchAll(/([\w-]+)\s*:\s*([^;]+);?/g)) body[d[1]] = d[2].trim().replace(/\s+/g, ' ')
    for (const sel of selText.replace(/:deep\(([^)]*)\)/g, '$1').split(',').map(x => x.trim().replace(/\s+/g, ' ')).filter(Boolean)) out.push({ sel, body, note })
  }
  return out
}
const globalRules = ruleList(css)
const covered = new Set(CONTROLS.map(([s]) => s))
let ctl = '<!-- source: Số đo và trạng thái từng control — đọc từ CSS thật trong mds-ui -->\n# SỐ ĐO + TRẠNG THÁI TỪNG CONTROL (đọc tự động từ code mds-ui)\n\nMỗi dòng = 1 phần tử của control: selector → các số đo (đã đổi token sang số). Mục “trạng thái” = màu / viền / bóng khi hover, focus, disabled, lỗi, được chọn.\n'
let nCtl = 0
for (const f of fs.readdirSync(CDIR).filter(f => f.endsWith('.vue')).sort()) {
  const name = f.replace('.vue', '')
  if (/^(Icon|TIcon|Page|Route|Border)/.test(name)) continue
  const src = fs.readFileSync(path.join(CDIR, f), 'utf8')
  const tpl = src.match(/<template[^>]*>([\s\S]*)<\/template>/)?.[1] ?? ''
  const used = new Set()
  for (const a of tpl.matchAll(/\s:?class="([^"]*)"/g)) for (const c of a[1].matchAll(/[a-z][a-z0-9_-]*/gi)) used.add(c[0])
  const own = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].flatMap(m => ruleList(m[1]))
  const expandOk = c => name === 'AppButton' ? /^btn(-icon)?$/.test(c) : !/^(btn|ti|spinner)/.test(c)
  const isUsed = rc => used.has(rc) || [...used].some(c => expandOk(c) && (rc.startsWith(c + '--') || rc.startsWith(c + '__')))
  const fromGlobal = globalRules.filter(r => { const m = r.sel.match(/^\.([\w-]+)((?::[\w-]+(?:\([^)]*\))?|\[[^\]]+\])*)$/); return m && isUsed(m[1]) && (name === 'AppButton' || !/^(btn|ti|spinner)/.test(m[1])) })
  const all = [...own, ...fromGlobal].filter(r => /^[.:\[]/.test(r.sel) && r.sel.length <= 90 && (name === 'AppButton' || !/^\.(btn|spinner)/.test(r.sel)))
  const base = new Map(), state = new Map()
  for (const r of all) {
    const isState = STATE_RE.test(r.sel)
    const line = declLine(r.body, isState ? STATE_KEYS : BASE_KEYS); if (!line) continue
    if (!isState && covered.has(r.sel)) continue
    const m = isState ? state : base, key = r.sel
    m.set(key, { line: (m.get(key)?.line ? m.get(key).line + ' · ' : '') + line, note: m.get(key)?.note || r.note })
  }
  const emit = (m, cap) => [...m].slice(0, cap).map(([sel, { line, note }]) => `- \`${sel}\`${note ? ` (${note})` : ''}: ${line}`).join('\n')
  if (base.size) { ctl += `\n## ${TITLE_OF(name)}\n${emit(base, 36)}\n`; nCtl++ }
  if (state.size) ctl += `\n## ${TITLE_OF(name).split(' — ')[0]} — trạng thái (hover, focus, disabled, lỗi, được chọn)\n${emit(state, 30)}\n`
}
/* Bảng tra theo nhóm token: bóng đổ, bo góc, chữ, khoảng cách, màu — để trả lời “shadow card là gì”, “bo góc dialog”, “màu chữ phụ” bằng số / mã màu */
const tokGroup = (title, test, note = '') => {
  const rows = Object.keys(blocks.medium).filter(test).map(k => `- \`${k}\`: ${dens3(`var(${k})`, /^--shadow-/.test(k))}`)
  if (rows.length) ctl += `\n## ${title}\n${note ? note + '\n' : ''}${rows.join('\n')}\n`
}
tokGroup('Bóng đổ (box shadow) — mọi mức', k => /^--shadow-/.test(k), 'Cú pháp: offset-x offset-y blur spread màu. Mỗi dòng ghi tên Effect style trong Figma (Drop Shadow / Neutral / …) để designer chọn đúng. Card = Neutral / All 2; popover / dropdown / dialog / toast = Neutral / Bottom 12.')
tokGroup('Bo góc (border radius) — mọi mức', k => /^--radius-/.test(k), 'Card 8px · Dialog / popup 12px · control (nút, ô nhập, menu, tag) = radius-default theo mật độ.')
tokGroup('Kiểu chữ (typography) — cỡ chữ, dòng, độ đậm', k => /^--(text-(h\d|body|sm|xs|lg|caption|title|label)|text-h\d-lh|fw-|lh-|font-)/.test(k) && !/color/.test(k))
tokGroup('Khoảng cách chuẩn (padding, gap, margin)', k => /^--(box-padding|card-|gap-|form-|page-|layout-|space)/.test(k))
tokGroup('Màu chữ (text)', k => /^--text-(primary|secondary|hint|disabled|brand|link|white|info|warning|danger|success|accent)/.test(k))
tokGroup('Màu nền (background)', k => /^--bg-/.test(k))
tokGroup('Màu viền (stroke / border)', k => /^--stroke-/.test(k))
tokGroup('Màu icon', k => /^--icon-/.test(k))
fs.writeFileSync(path.join(OUT, 'facts-controls.md'), ctl)
console.log(`✓ facts-controls.md: ${nCtl} control · ${Math.round(ctl.length / 1024)} KB`)

const total = fs.readdirSync(OUT).reduce((s, f) => s + fs.statSync(path.join(OUT, f)).size, 0)
console.log(`✓ Tri thức AVA: ${fs.readdirSync(OUT).length} file · ${Math.round(total / 1024)} KB → knowledge/`)
