import fs from 'node:fs'
import path from 'node:path'

/* ═══ AVA của tài liệu Design System — hỏi đáp quy chuẩn MDS / control mds-ui ═══
   Tri thức: knowledge/*.md (bộ skill chung + token & class CSS thật + props control — scripts/build-knowledge.mjs) + các trang tài liệu (CMS, đọc trực tiếp).
   Mỗi câu hỏi: tìm các đoạn liên quan nhất (BM25 trên chữ bỏ dấu + từ đồng nghĩa Việt → Anh) → gửi Gemini kèm hướng dẫn trả lời. */

/* Tiết kiệm token: chỉ gửi các đoạn THẬT SỰ liên quan (điểm ≥ 20% đoạn tốt nhất), tối đa 12 đoạn / ~18.000 ký tự */
/* Đoạn tài liệu gửi kèm: câu hỏi thường 10.000 ký tự / 8 đoạn (≈ 3.300 token) — soát ảnh cần rộng hơn nên 18.000 / 12 */
const MAX_CONTEXT = 10000, MAX_CHUNKS = 8, REVIEW_CONTEXT = 18000, REVIEW_CHUNKS = 12, CHUNK_MAX = 2400, MIN_REL = 0.2
/* Ảnh người hỏi gửi kèm: [{ mime, data(base64) }] — lọc đúng định dạng, tối đa 3 ảnh × ~1,5MB */
export const AVA_MAX_IMAGES = 3
/** Dòng gợi ý hỏi tiếp “[GOI_Y] a | b | c” (AI viết cuối câu trả lời) → tách ra thành nút bấm; text không còn dòng đó */
export function splitFollowups(t) {
  const out = []
  const text = String(t || '').replace(/\n*\s*\[GOI_Y\]([^\n]*)/g, (_, l) => { out.push(...l.split('|').map(x => x.replace(/^[\s\-–•*]+|[\s*]+$/g, '')).filter(x => x.length > 2 && x.length <= 80)); return '' }).trim()
  return { text, followups: [...new Set(out)].slice(0, 3) }
}
export const cleanImages = list => (Array.isArray(list) ? list : [])
  .filter(i => i && ['image/jpeg', 'image/png', 'image/webp'].includes(i.mime) && typeof i.data === 'string' && i.data.length < 2_000_000 && /^[A-Za-z0-9+/=]+$/.test(i.data))
  .slice(0, AVA_MAX_IMAGES)
export const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()
// Từ tiếng Việt hay hỏi → từ khóa trong code / token (đều đã bỏ dấu)
const SYN = [
  [/chieu cao|cao bao nhieu|\bcao\b/, 'height h'], [/chieu rong|do rong|\brong\b/, 'width w'], [/toi thieu|nho nhat/, 'min'], [/toi da|lon nhat/, 'max'],
  [/\bnut\b/, 'btn button'], [/o nhap|truong nhap|nhap lieu/, 'input ibox textbox'], [/hop chon|chon 1|dropdown|xo xuong/, 'combobox dropdown select'],
  [/\bbang\b|danh sach/, 'table datatable dt'], [/bo goc|bo tron|goc bo/, 'radius'], [/khoang cach|cach nhau|khe/, 'gap spacing padding margin'],
  [/le trong|dem/, 'padding'], [/co chu|kich thuoc chu|font/, 'font text size'], [/dam|nhat/, 'weight fw'], [/bong|do bong/, 'shadow'],
  [/mau/, 'color bg text stroke'], [/vien/, 'border stroke'], [/mat do|compact|trung binh|\brong\b/, 'density compact comfortable medium'],
  [/bieu tuong|icon/, 'icon ti'], [/thong bao|toast/, 'toast alert notify'], [/hop thoai|popup|dialog/, 'dialog modal popup'],
  [/phan trang|paging/, 'paging pagination tablepaging'], [/thanh ben|sidebar|menu trai/, 'sidebar'], [/tieu de|header/, 'header title'],
  [/o tick|checkbox|o chon/, 'checkbox'], [/ngay|lich/, 'date datebox datetime'], [/chu thich|tooltip|goi y khi re/, 'tooltip tip'],
  [/the\b|card/, 'card'], [/tab/, 'tab tabs subnav'], [/menu/, 'menu dropdownmenu'], [/mau chu de|theme/, 'theme brand'],
]
const tokens = s => {
  const out = []
  for (const t of norm(s).match(/--?[a-z0-9][a-z0-9-]*|[a-z0-9]+/g) ?? []) {
    out.push(t)
    if (t.includes('-')) for (const p of t.split('-')) if (p.length > 1) out.push(p)   // --btn-min-width → btn, min, width
  }
  return out.filter(t => t.length > 1)
}

/* ═══ Câu hỏi gần giống (dùng lại câu trả lời cũ, không gọi AI) ═══
   Dấu hiệu câu hỏi = tập từ có nghĩa: bỏ dấu, gộp cách viết khác nhau của cùng 1 khái niệm (pop up = popup, bo góc = radius…), bỏ hư từ. */
const Q_STOP = new Set('a ah nhe nhi vay the thi cho toi minh em anh chi ban giup hoi ve cua co khong ko k duoc dc nhu nao gi la va voi o trong cac nhung mot thuong hay se can phai di xem tim vui long please hien tai dang oi'.split(' '))
const Q_FIX = [[/pop ?up/g, 'popup'], [/min[- ]?width|do rong toi thieu|chieu rong toi thieu/g, 'minwidth'], [/max[- ]?width|do rong toi da|chieu rong toi da/g, 'maxwidth'],
  [/bo goc|border[- ]radius|radius/g, 'radius'], [/bong do|box[- ]shadow|shadow/g, 'shadow'], [/chieu cao|height/g, 'height'], [/\bcao\b/g, 'height'], [/bao nhieu px|may px|bao nhieu|kich thuoc/g, 'size'],
  [/\bnut\b|button|\bbtn\b/g, 'button'], [/o nhap( lieu)?|\binput\b|textbox|text ?field/g, 'input'], [/hop thoai|dialog|popup/g, 'dialog'], [/khoang cach|spacing|\bgap\b/g, 'gap'],
  [/thu vien/g, 'lib'], [/mds[- ]?ui/g, 'mdsui'], [/dung khi nao|khi nao dung/g, 'when'], [/\bcomponents\b|\bcontrols?\b/g, 'component']]
export function qSig(q) {
  let s = norm(q)
  for (const [re, r] of Q_FIX) s = s.replace(re, ' ' + r + ' ')
  return [...new Set((s.match(/[a-z0-9]+/g) ?? []).filter(t => t.length > 1 && !Q_STOP.has(t)))].sort()
}
/** Độ giống 2 câu hỏi (0–1): Jaccard trên tập từ có nghĩa · shared = số từ chung */
export function qSim(a, b) {
  const B = new Set(b), shared = a.filter(t => B.has(t)).length
  return { j: shared / (new Set([...a, ...b]).size || 1), shared }
}

/** Markdown → đoạn theo tiêu đề (giữ đường dẫn tiêu đề), không cắt giữa khối code */
function chunkMarkdown(md, source, href = '') {
  const out = [], trail = []
  let buf = [], fence = false
  const flush = () => {
    const text = buf.join('\n').trim(); buf = []
    if (text.length < 40) return
    const title = [source, ...trail.filter(Boolean)].join(' › ')
    for (let i = 0; i < text.length; i += CHUNK_MAX) out.push({ title, href, text: text.slice(i, i + CHUNK_MAX) })
  }
  for (const line of String(md).split('\n')) {
    if (/^\s*```/.test(line)) fence = !fence
    const h = !fence && line.match(/^(#{1,4})\s+(.*)/)
    if (h) { flush(); trail.length = h[1].length - 1; trail[h[1].length - 1] = h[2].replace(/[*`]/g, '').trim() }
    buf.push(line)
    if (!fence && buf.join('\n').length > CHUNK_MAX && line.trim() === '') flush()
  }
  flush()
  return out
}

export function createAva({ knowledgeDir, pages, ai, notes = () => [] }) {
  let index = null, kStamp = '', pStamp = ''
  const kFiles = () => (fs.existsSync(knowledgeDir) ? fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.md') && f !== 'facts.md').sort() : [])
  // Số đo đang chạy trong code (facts.md) — luôn gửi kèm mọi câu hỏi, đặt đầu tri thức
  const facts = () => { try { return fs.readFileSync(path.join(knowledgeDir, 'facts.md'), 'utf8').replace(/^<!--.*?-->\n/, '') } catch { return '' } }
  /* Giá trị thật của token CSS (knowledge/tokens.md — sinh từ mds-ui/src/style.css): name → { v, compact?, comfy? }
     Dùng để GẮN SẴN giá trị cho mọi token AVA nhắc tới trong câu trả lời — dev biết ngay --shadow-dialog là gì, không phụ thuộc AI nhớ số */
  let tokMap = null, tokStamp = ''
  function tokenMap() {   // ⚠ không đặt tên "tokens" — trùng hàm tách từ tìm kiếm ở trên (đã từng làm AVA không tìm được tri thức)
    const f = path.join(knowledgeDir, 'tokens.md')
    let st = ''; try { st = String(fs.statSync(f).mtimeMs) } catch { return new Map() }
    if (tokMap && st === tokStamp) return tokMap
    tokMap = new Map(); tokStamp = st
    for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
      const m = line.match(/^\|\s*`(--[a-z0-9-]+)`\s*\|(.*)\|\s*$/); if (!m) continue
      const cols = m[2].split('|').map(c => c.trim())
      if (!tokMap.has(m[1])) tokMap.set(m[1], cols.length >= 3 ? { v: cols[0], compact: cols[1], comfy: cols[2] } : { v: cols[0] })
    }
    return tokMap
  }
  // var(--a) → giá trị cuối (tối đa 6 lớp) để dev thấy luôn số / mã màu
  const resolve = (val, map, depth = 0) => depth > 6 ? val : String(val).replace(/var\((--[a-z0-9-]+)\)/g, (all, n) => (map.has(n) ? resolve(map.get(n).v, map, depth + 1) : all))
  const FIGMA_VARS = 'https://www.figma.com/design/1DP5RJM3MsZJ8SnUWgTavS/MDS-Web-Components---v2.0'
  /** Mục “Giá trị token CSS” cho các token có trong câu trả lời (tối đa 12, theo thứ tự xuất hiện) */
  function tokenBlock(text) {
    const map = tokenMap(); if (!map.size) return ''
    const names = [...new Set([...String(text).matchAll(/--[a-z][a-z0-9-]*[a-z0-9]/g)].map(m => m[0]))].filter(n => map.has(n)).slice(0, 12)
    if (!names.length) return ''
    const cell = s => String(s).replace(/\|/g, '\\|')
    const rows = names.map(n => {
      const t = map.get(n), fin = resolve(t.v, map)
      let v = '`' + cell(t.v) + '`' + (fin !== t.v ? ` → \`${cell(fin)}\`` : '')
      if (t.compact || t.comfy) v += ` · Nhỏ \`${cell(t.compact || t.v)}\` · Rộng \`${cell(t.comfy || t.v)}\``
      return `| \`${n}\` | ${v} |`
    })
    return `#### Giá trị token CSS\n| Token | Giá trị trong code (mds-ui) |\n|---|---|\n${rows.join('\n')}\n\nXem biến gốc trong Figma: [MDS Web Components v2.0 › Local variables](${FIGMA_VARS})`
  }

  /** Bảng token màu (hex / rgba) trích từ đoạn tri thức đã tìm — gắn vào câu hỏi về màu dù AI không tự ghi tên token */
  function buildColorBlock(src) {
    const map = tokenMap(); if (!map.size) return ''
    const colorRe = /#[0-9a-fA-F]{3,8}|rgba?\(/
    const names = [...new Set([...String(src).matchAll(/--[a-z][a-z0-9-]*[a-z0-9]/g)].map(m => m[0]))]
      .filter(n => map.has(n) && colorRe.test(resolve(map.get(n).v, map))).slice(0, 12)
    if (!names.length) return ''
    const cell = s => String(s).replace(/\|/g, '\\|')
    const rows = names.map(n => {
      const tk = map.get(n), fin = resolve(tk.v, map)
      return `| \`${n}\` | \`${cell(fin !== tk.v ? fin : tk.v)}\` |`
    })
    return `#### Giá trị token CSS\n| Token | Mã màu |\n|---|---|\n${rows.join('\n')}\n\nXem biến gốc trong Figma: [MDS Web Components v2.0 › Local variables](${FIGMA_VARS})`
  }

  /** Dòng “--token: giá trị (→ giá trị cuối) [Nhỏ … · Rộng …]” cho tối đa 40 token có trong văn bản — đưa vào lời nhắc */
  function tokenValuesFor(text, max = 40) {
    const map = tokenMap(); if (!map.size) return ''
    return [...new Set([...String(text).matchAll(/--[a-z][a-z0-9-]*[a-z0-9]/g)].map(m => m[0]))].filter(n => map.has(n)).slice(0, max).map(n => {
      const t = map.get(n), fin = resolve(t.v, map)
      return `${n}: ${t.v}${fin !== t.v ? ` (= ${fin})` : ''}${t.compact || t.comfy ? ` · Nhỏ ${t.compact || t.v} · Rộng ${t.comfy || t.v}` : ''}`
    }).join('\n')
  }
  /* Gắn link trang tài liệu cho tên component trong câu trả lời → người dùng bấm xem luôn, khỏi tìm ở sidebar.
     Mỗi trang 1 link ở lần nhắc ĐẦU TIÊN · bỏ qua khối code, link sẵn có, tiêu đề (#), bảng token và dòng “Nguồn:”.
     Tên tiếng Anh viết hoa (Button, Tree…) so khớp phân biệt hoa thường để không bắt nhầm từ thường. */
  const LINK_TERMS = {
    button: ['Button'], checkbox: ['Checkbox', 'AppCheckbox'], combobox: ['ComboBox', 'Combobox', 'AppCombobox'],
    contextmenu: ['Context Menu', 'Context menu', 'DropdownMenu'], 'data-table': ['Data table', 'Data Table', 'DataTable'],
    datetimepicker: ['DateTimePicker', 'Date Time picker', 'AppDatebox', 'Datebox'], dialog: ['Dialog', 'AppAlertDialog'],
    dropdownlist: ['DropDownList', 'AppDropdown'], 'empty-state': ['Empty state', 'AppEmptyState'], 'hearder-bar': ['Header bar', 'Global Header', 'ControlHeader'],
    loading: ['Loading'], popup: ['Popup', 'AppFormPanel'], radiobutton: ['Radio button', 'AppRadio'], 'rich-text-editor': ['Rich text editor', 'AppRichText'],
    'search-box': ['Search box', 'Searchbox', 'AppSearchbox', 'AppAiSearchbox'], segmented: ['Segmented', 'AppSegmented'], sidebar: ['Side bar', 'Sidebar', 'AppSidebar'],
    tabs: ['Tabs', 'AppTabs'], 'text-field': ['Text field', 'Textbox', 'AppTextbox', 'AppTextarea', 'AppInput'], tree: ['Tree', 'AppTree'], avatar: ['Avatar', 'AppAvatar'],
    email: ['Mẫu email'], layout: ['Bố cục trang'], 'number-separation-rules': ['Quy tắc phân tách số'], 'shortcut-key': ['Quy định phím tắt'], typography: ['Kiểu chữ'],
    'leave-page-warning': ['Cảnh báo thoát trang'], 'interaction-states': ['Trạng thái tương tác'],
  }
  const escRe = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  function linkPages(t, current = '') {
    const have = new Set(pages().map(p => p.slug)), done = new Set([current])
    for (const m of t.replace(/\n\s*Nguồn\s*:[\s\S]*$/, '').matchAll(/\]\(\/ds\/([a-z0-9-]+)/g)) done.add(m[1])   // trang đã có link sẵn trong nội dung (không tính dòng Nguồn) → không gắn lại
    const terms = Object.entries(LINK_TERMS).filter(([sl]) => have.has(sl)).flatMap(([sl, ws]) => ws.map(w => ({ sl, w })))
      .sort((a, b) => b.w.length - a.w.length)   // cụm dài trước (VD “Data table” trước “Data”)
    const viWord = w => /[^\x00-\x7f]/.test(w)
    const linkPlain = seg => {
      for (const { sl, w } of terms) {
        if (done.has(sl)) continue
        const re = new RegExp(`(?<![\\p{L}\\p{N}_\\-/\`])${escRe(w)}(?![\\p{L}\\p{N}_])`, viWord(w) ? 'iu' : 'u')
        const m = seg.match(re); if (!m) continue
        seg = seg.slice(0, m.index) + `[${m[0]}](/ds/${sl})` + seg.slice(m.index + m[0].length); done.add(sl)
      }
      return seg
    }
    let fence = false
    return t.split('\n').map(line => {
      if (/^\s*(```|~~~)/.test(line)) { fence = !fence; return line }
      if (fence || /^\s*#|^\s*\|\s*`--|^\s*Nguồn\s*:|^\s*Xem biến gốc/.test(line)) return line
      // tách: link sẵn có [..](..) · code `..` · chữ thường — chỉ gắn link vào chữ thường; code đúng tên component → [`AppX`](/ds/…)
      return line.split(/(\[[^\]]*\]\([^)]*\)|`[^`]*`)/).map(part => {
        if (!part) return part
        if (part.startsWith('[')) return part
        if (part.startsWith('`')) {
          const name = part.slice(1, -1), hit = terms.find(x => x.w === name && !done.has(x.sl))
          if (hit) { done.add(hit.sl); return `[${part}](/ds/${hit.sl})` }
          return part
        }
        return linkPlain(part)
      }).join('')
    }).join('\n')
  }

  /** Chèn mục giá trị token trước dòng “Nguồn:” (không có dòng Nguồn → thêm cuối). Đã có mục rồi thì thôi */
  function withTokens(t, mode = 'dev') {
    if (mode === 'plain') return t   // Dễ hiểu: bảng giá trị token để dành cho “Chi tiết cách thi công”
    if (!t || t.includes('#### Giá trị token CSS')) return t
    const block = tokenBlock(t.replace(/\n+\s*Nguồn\s*:[\s\S]*$/, '')); if (!block) return t
    const m = t.match(/\n+\s*Nguồn\s*:[\s\S]*$/)
    return m ? t.slice(0, m.index) + '\n\n' + block + '\n\n' + m[0].trim() : t + '\n\n' + block
  }

  function build() {
    const files = kFiles()
    const ks = files.map(f => f + fs.statSync(path.join(knowledgeDir, f)).mtimeMs).join('|')
    const list = pages()
    const ps = list.map(p => p.slug + p.updatedAt).join('|')
    if (index && ks === kStamp && ps === pStamp) return index
    const chunks = [], seen = new Set()
    // Trùng nội dung giữa các skill (chỉ khác cấp tiêu đề / số mục “D12.” …) → giữ 1 bản
    const add = c => { const key = norm(c.text).replace(/^[#\s]*[a-z]?\d*[.\d]*\s*/, '').replace(/[^a-z0-9]+/g, '').slice(0, 300); if (seen.has(key)) return; seen.add(key); chunks.push(c) }
    for (const p of list) for (const c of chunkMarkdown(`# ${p.title}\n${p.summary || ''}\n\n${p.body}`, `Trang tài liệu “${p.title}”`, `/ds/${p.slug}`)) add({ ...c, slug: p.slug })
    for (const f of files) {
      const md = fs.readFileSync(path.join(knowledgeDir, f), 'utf8')
      const source = md.match(/^<!-- source: (.*?) -->/)?.[1] ?? f
      const code = /^(tokens|css-classes|components)\.md$/.test(f)   // giá trị lấy thẳng từ code mds-ui
      for (const c of chunkMarkdown(md.replace(/^<!--.*?-->\n/, ''), source)) add({ ...c, code, density: code && c.title.includes('đổi theo mật độ') })
    }
    // BM25
    const docs = chunks.map(c => { const tf = new Map(); const ts = tokens(c.title + ' ' + c.text); for (const t of ts) tf.set(t, (tf.get(t) || 0) + 1); return { tf, len: ts.length, titleT: new Set(tokens(c.title)) } })
    const df = new Map(); for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) || 0) + 1)
    const avg = docs.reduce((s, d) => s + d.len, 0) / Math.max(1, docs.length)
    index = { chunks, docs, df, avg, n: docs.length }
    kStamp = ks; pStamp = ps
    return index
  }

  /* Nguyên tắc chung + Yêu cầu tiện dụng chung: LUÔN gửi kèm mọi câu hỏi (nội dung trang CMS hiện tại — sửa trang là AVA dùng ngay),
     để mọi câu trả lời bám các nguyên tắc nền (thứ tự nhập liệu, focus, Tab order, phím tắt, tooltip, chọn Combo/Dropdown/Radio…) */
  const PINNED = ['general-design-rules', 'general-usability-requirements']
  function pinned() {
    const list = pages()
    return PINNED.map(sl => list.find(p => p.slug === sl)).filter(Boolean)
      .map(p => `Nguồn: Trang tài liệu “${p.title}” (/ds/${p.slug}) — NGUYÊN TẮC NỀN, áp dụng cho mọi màn hình\n${p.summary ? p.summary + '\n' : ''}${p.body.replace(/!\[[^\]]*\]\([^)]*\)\n?/g, '')}`)
      .join('\n\n---\n\n')
  }

  /* Tri thức do ban biên tập tự nhập ở Quản trị › Tri thức AVA — ưu tiên cao nhất. Tiết kiệm token, KHÔNG mất mục nào:
     · mục “Luôn gửi kèm” (always) → nằm trong phần CỐ ĐỊNH đầu lời nhắc (Gemini cache được, tính rẻ ~4 lần)
     · các mục còn lại → chỉ gửi mục LIÊN QUAN tới câu hỏi (chấm điểm theo tiêu đề + nội dung, như tìm tài liệu),
       tối đa NOTE_PICK mục / NOTE_CTX ký tự. Trước đây gửi hết rồi cắt ở 16.000 ký tự → mục cũ nhất bị bỏ âm thầm. */
  const NOTE_CTX = 7000, NOTE_PICK = 6, NOTE_REL = 0.3, ALWAYS_MAX = 6000
  const activeNotes = () => notes().filter(n => n.enabled !== false && String(n.body || '').trim())
  const noteText = n => `Nguồn: Tri thức AVA — “${n.title}”\n${String(n.body).trim()}`
  function alwaysNotes() {
    let size = 0
    return activeNotes().filter(n => n.always).sort((a, b) => String(a.title).localeCompare(String(b.title)))   // thứ tự cố định → phần đầu lời nhắc giống hệt nhau
      .map(noteText).filter(t => (size += t.length) <= ALWAYS_MAX).join('\n\n---\n\n')
  }
  function relevantNotes(question) {
    const list = activeNotes().filter(n => !n.always)
    if (!list.length) return []
    let q = norm(question)
    for (const [re, add] of SYN) if (re.test(q)) q += ' ' + add
    const qt = [...new Set(tokens(q))]
    const docs = list.map(n => { const tf = new Map(); for (const t of tokens(n.body)) tf.set(t, (tf.get(t) ?? 0) + 1); return { n, tf, title: new Set(tokens(n.title)), len: tf.size || 1 } })
    const df = new Map(); for (const d of docs) for (const t of new Set([...d.tf.keys(), ...d.title])) df.set(t, (df.get(t) ?? 0) + 1)
    const scored = docs.map(d => {
      let s = 0
      for (const t of qt) {
        if (!df.has(t)) continue
        const idf = Math.log(1 + (docs.length - df.get(t) + 0.5) / (df.get(t) + 0.5)), f = d.tf.get(t) ?? 0
        s += (f ? idf * (f * 2.2) / (f + 1.2) : 0) + (d.title.has(t) ? idf * 1.5 : 0)   // khớp tiêu đề nặng hơn — tiêu đề mục tri thức nói đúng chủ đề
      }
      return [s, d.n]
    }).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0])
    const top = scored[0]?.[0] ?? 0, out = []
    let size = 0
    for (const [s, n] of scored) {
      if (s < top * NOTE_REL || out.length >= NOTE_PICK) break
      const t = noteText(n)
      if (size + t.length > NOTE_CTX) continue
      out.push(n); size += t.length
    }
    return out
  }
  // Dấu thời gian toàn bộ tri thức ban biên tập (khóa câu trả lời nhớ sẵn — sửa mục nào cũng tự bỏ câu nhớ cũ)
  const notesStamp = () => hash(JSON.stringify(activeNotes().map(n => [n.id, n.updatedAt, !!n.always])))

  function search(question, page, review = false) {
    const maxCtx = review ? REVIEW_CONTEXT : MAX_CONTEXT, maxChunks = review ? REVIEW_CHUNKS : MAX_CHUNKS
    const ix = build()
    let q = norm(question)
    for (const [re, add] of SYN) if (re.test(q)) q += ' ' + add
    const qt = [...new Set(tokens(q))]
    const sizeQ = /\b(height|width|min|max|radius|gap|padding|spacing|size|font|density|px)\b/.test(q)
    const scored = ix.docs.map((d, i) => {
      let s = 0
      for (const t of qt) {
        const f = d.tf.get(t); if (!f) continue
        const idf = Math.log(1 + (ix.n - ix.df.get(t) + 0.5) / (ix.df.get(t) + 0.5))
        s += idf * (f * 2.2) / (f + 1.2 * (0.25 + 0.75 * d.len / ix.avg)) + (d.titleT.has(t) ? idf * 0.6 : 0)
      }
      if (page && ix.chunks[i].slug === page) s *= 1.35   // đang xem trang nào → ưu tiên đoạn của trang đó
      if (sizeQ && ix.chunks[i].code) s *= 1.4            // hỏi kích thước / số đo → ưu tiên giá trị thật trong code (token, class CSS, props)
      return [s, i]
    }).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0])
    // Hỏi kích thước → luôn kèm bảng token theo 3 mật độ (giá trị thật đang chạy)
    if (sizeQ) { const di = ix.chunks.findIndex(c => c.density); if (di >= 0 && !scored.slice(0, 6).some(([, i]) => i === di)) scored.unshift([1e9, di]) }
    const picked = [], top = scored.find(([s]) => s < 1e9)?.[0] ?? 0
    let size = 0
    for (const [sc, i] of scored) {
      if (sc < 1e9 && sc < top * MIN_REL) break   // điểm quá thấp so với đoạn tốt nhất → không liên quan, bỏ (đỡ token)
      const c = ix.chunks[i]
      if (size + c.text.length > maxCtx || picked.length >= maxChunks) continue
      picked.push(c); size += c.text.length
    }
    return picked
  }

  const SYSTEM = `Bạn là AVA — trợ lý của MISA Design System (MDS) cho web app: tư vấn quy chuẩn thiết kế và cách dùng bộ control mds-ui cho MỌI người — designer, BA, PO, người mới và lập trình viên.
NGUYÊN TẮC CHUNG:
- Tiếng Việt, ngắn gọn, KHÔNG chào hỏi ("Chào bạn"…), vào thẳng câu trả lời.
- CHỈ TRẢ LỜI ĐÚNG ĐIỀU ĐƯỢC HỎI. VD hỏi "padding của button" → chỉ nêu Padding (đủ mật độ nếu khác nhau), KHÔNG kể thêm chiều cao, bo góc, màu, cỡ chữ… Hỏi 2 thuộc tính → trả đúng 2. Hỏi chung ("button trông thế nào", "quy chuẩn card") mới trình bày tổng quan ngắn.
- Các ý liên quan mà KHÔNG được hỏi → không viết ra; đặt vào DÒNG CUỐI CÙNG (sau dòng Nguồn) đúng định dạng: [GOI_Y] câu hỏi 1 | câu hỏi 2 | câu hỏi 3 — 2–3 câu hỏi NGẮN (≤ 8 từ) về CÙNG thành phần đang hỏi (không gợi chủ đề khác), đủ chủ thể để hỏi độc lập (VD "[GOI_Y] Chiều cao của Button? | Bo góc của Button? | Khoảng cách giữa các Button?"). Câu hỏi lại cho rõ / từ chối thì không có dòng này.
- CHỈ dựa vào phần TRI THỨC bên dưới. Không có thông tin → nói rõ "tài liệu chưa có thông tin này" và gợi ý hỏi nhóm Design System; tuyệt đối không bịa số.
- SỐ ĐO (chiều cao, rộng, đệm, bo góc, cỡ chữ…): LẤY TỪ mục "SỐ ĐO ĐANG CHẠY TRONG CODE" trước tiên — đó là giá trị thật. Chép đúng số, đúng mật độ; không tự suy ra, không cộng trừ.
- Mật độ hiển thị gọi là Trung bình (mặc định) · Nhỏ · Rộng — tên mode gốc trong Figma là Standard · Compact · Comfortable; LUÔN gọi bằng tên tiếng Việt (không viết “Compact”). Cột Mobile trong bảng Figma KHÔNG dùng cho web, đừng lẫn cột.
- Ưu tiên khi các nguồn khác nhau: mục “Tri thức AVA” (ban biên tập Design System nhập trực tiếp — quy tắc mới nhất) > code mds-ui > skill quy chuẩn > trang tài liệu (chuyển từ Figma Site). Lệch nhau → nêu số đang chạy trong code, kèm 1 câu ghi chú tài liệu ghi khác.
- Nhắc tới token CSS thì ghi đúng tên trong \`code\` (VD \`--shadow-dialog\`). Hệ thống TỰ GẮN bảng giá trị thật (lấy từ code mds-ui) của mọi token có trong câu trả lời → ⛔ Giá trị của token (px, mã màu, rgba, bóng đổ, gradient) CHỈ được chép từ mục “GIÁ TRỊ TOKEN ĐANG CHẠY”; token không có trong mục đó thì chỉ ghi tên, không tự viết giá trị.
- Nguồn chỉ ghi những nguồn CÓ THẬT trong phần tri thức (đúng tiêu đề “Nguồn: …” của đoạn đã dùng); không tự đặt tên nguồn.
- CHỈ dùng tên component, class, token, prop xuất hiện NGUYÊN VĂN trong tri thức (VD AppButton, .btn--primary, --btn-height). Không tự đặt tên (không có "MButton"…).
- Markdown được dùng: **in đậm**, danh sách, bảng nhỏ, \`code\`, khối \`\`\`code\`\`\`. Không dùng tiêu đề lớn (#, ##) — tiêu đề nhỏ dùng ####. Bảng: dòng phân cách viết đúng |---|---|---| (3 gạch mỗi cột, không căn lề, không kéo dài).
- TRÌNH BÀY THOÁNG, DỄ ĐỌC: chia thành đoạn ngắn 1–3 câu, mỗi đoạn 1 ý, giữa các đoạn / nhóm ý để 1 DÒNG TRỐNG; danh sách mỗi ý 1 dòng ngắn; nhiều nhóm thông tin thì mỗi nhóm có tiêu đề nhỏ #### riêng. Không viết khối chữ dài liền mạch.
- Cuối câu trả lời thêm 1 dòng "Nguồn:" ghi 1–3 nguồn bằng chữ ngắn (VD "Code mds-ui (.btn)", "Quy chuẩn — Bo góc và shadow"); nguồn là trang tài liệu thì viết link [Tên trang](/ds/đường-dẫn). Không viết kiểu [#1].
- KHÔNG tự viết mục “Tự đo trên trang tài liệu”, lưu ý ảnh chụp hay bảng giá trị token — hệ thống tự gắn các đoạn cố định đó.
- Câu hỏi về chủ đề CÓ TRANG TÀI LIỆU RIÊNG (VD mẫu email gửi khách hàng / bên thứ 3, popup, bảng, biểu đồ…) → đặt link trang đó [Tên trang](/ds/đường-dẫn) NGAY TRONG phần trả lời (câu đầu hoặc cuối phần chính, kiểu “Xem đủ quy chuẩn + mẫu code tại [Mẫu email](/ds/email)”), không chỉ ở dòng Nguồn.
- KHÔNG CHẮC Ý NGƯỜI HỎI THÌ HỎI LẠI, không trả lời chung chung / đoán ý (vừa tốn token vừa sai ý). Câu hỏi MƠ HỒ hoặc PHẠM VI QUÁ RỘNG mà không chắc người hỏi muốn gì (VD "tóm tắt chi tiết nhất tất cả components", "tương tự như trên" khi không rõ đối tượng, "nói hết về form") → KHÔNG viết câu trả lời dài. Hỏi lại 1 câu ngắn (≤ 60 từ) kèm 2–4 lựa chọn cụ thể để họ chọn (VD component nào, mức độ: tóm tắt 1–2 dòng mỗi mục hay chi tiết 1 mục). Chắc chắn ý người hỏi thì trả lời bình thường.
- Câu hỏi NGẮN, thiếu chủ thể / đối tượng (VD "còn kích thước chữ?", "mật độ nhỏ thì sao?", "cái đó dùng thế nào?") → XEM LỊCH SỬ CUỘC TRÒ CHUYỆN để xác định chủ thể (component, thuộc tính) đang nói tới; trả lời đúng ngữ cảnh đó, KHÔNG hỏi lại.
- Câu hỏi giống / gần giống câu ngay trước trong cuộc trò chuyện → KHÔNG trả lời lại toàn bộ; nói ngắn "câu trả lời ở ngay trên" và hỏi họ cần làm rõ phần nào.
- Câu hỏi không liên quan thiết kế giao diện / MDS / mds-ui → MỞ ĐẦU câu trả lời bằng đúng chuỗi [NGOAI_PHAM_VI] rồi từ chối nhẹ nhàng, vui vẻ, mời hỏi về Design System.`

  /* Cách trả lời theo người đọc — chọn ở khung AVA (mặc định Dễ hiểu) */
  const MODES = {
    plain: `CÁCH TRÌNH BÀY — DỄ HIỂU (người hỏi có thể KHÔNG phải lập trình viên):
- Câu đầu tiên trả lời thẳng bằng LỜI THƯỜNG. Câu hỏi chung về 1 thành phần → mô tả điều người dùng NHÌN THẤY: trông như thế nào, đặt ở đâu, dùng khi nào. VD hỏi "card trên nền xám" → "Card là khối nền trắng đặt trên nền trang màu xám nhạt; card có bóng đổ nhẹ quanh viền để nổi lên, không kẻ viền, bo góc 8px, bên trong đệm đều 16px, các card cách nhau 16px."
- Chỉ khi hỏi “vì sao / khi nào dùng” hoặc câu hỏi chung mới thêm 1 câu VÌ SAO (VD "bóng đổ giúp khối trắng tách khỏi nền mà không cần kẻ viền, nhìn nhẹ hơn").
- Thuộc tính CSS cơ bản GIỮ TÊN CHUẨN (Padding, Margin, Gap, Border, Border radius, Box shadow, Font size, Line height, Font weight), lần đầu nhắc thì kèm giải thích ngắn trong ngoặc — VD “Padding (khoảng đệm bên trong viền)”, “Gap (khoảng cách giữa các phần tử cạnh nhau)”. Các từ khác dịch sang lời thường: token → giá trị dùng chung của hệ thống · density → mật độ hiển thị · hover → khi rê chuột · disabled → trạng thái không bấm được.
- Số đo nêu gọn trong câu: "cao 32px (Nhỏ 28px, Rộng 36px)". Có nhiều thông số → danh sách ngắn hoặc bảng nhỏ, mỗi dòng là 1 ý dễ hiểu.
- Có quy tắc Nên / Không nên → nêu rõ thành 2 ý ngắn.
- Phần lời thường KHÔNG chen tên biến / class / mã màu trong ngoặc (để dành cho mục lập trình viên). Gọn: hỏi 1 thông số → 1–2 câu; câu hỏi chung → tối đa ~120 từ; không lặp ý, không thêm phần “tóm tắt” nhắc lại.
- KHÔNG viết code, tên class, tên biến / token, mục "Cho lập trình viên" hay bảng token — dưới câu trả lời đã có nút **Chi tiết cách thi công** để lập trình viên bấm xem riêng phần đó. **Ngoại lệ duy nhất**: câu hỏi về **màu sắc** (mã màu, token màu) → ghi tên token trong \`code\` (VD \`--text-neutral\`, \`--bg-brand\`), không ghi giá trị — hệ thống tự gắn mã màu bên dưới.`,
    dev: `CÁCH TRÌNH BÀY — KỸ THUẬT (người hỏi là lập trình viên):
- CHỈ thuộc tính được hỏi: số đo + token CSS (VD \`--btn-height\`), nếu giá trị đổi theo mật độ thì nêu đủ 3 mức: Trung bình (mặc định) · Nhỏ · Rộng.
- Chỉ rõ class / component / prop mds-ui cần dùng và ví dụ code ngắn (Vue / HTML / CSS) — dùng token, không gõ số tay.
- Nêu quy tắc ⛔ liên quan (điều cấm, lỗi hay gặp) nếu tri thức có.`,
    build: `CHI TIẾT CÁCH THI CÔNG (người hỏi đã đọc câu trả lời lời thường cho câu hỏi này và bấm xem phần dành cho lập trình viên):
- KHÔNG giải thích lại bằng lời thường, không mở đầu xã giao — vào thẳng phần thi công.
- Viết theo các mục ####: **Component / class mds-ui** cần dùng (prop chính) · **Token CSS** (tên trong \`code\`, giá trị đổi theo mật độ thì nêu đủ Trung bình · Nhỏ · Rộng) · **Code mẫu** ngắn ≤ 15 dòng (Vue / HTML / CSS, dùng token, không gõ số tay) · quy tắc ⛔ hay sai (nếu tri thức có).
- Gọn: ngoài code khoảng 80–150 từ.`,
  }

  /* Người hỏi gửi kèm ảnh thiết kế → soát theo quy chuẩn */
  const PHOTO_NOTE = '> ⚠️ **Lưu ý:** Đây là đánh giá từ **ảnh chụp** (đã thu nhỏ, nén) nên màu sắc, khoảng cách, cỡ chữ, bo góc có thể **sai lệch**. Hãy kiểm tra lại các thông số theo đúng quy chuẩn trên **file thiết kế (Figma)** hoặc **bản thi công** (bật **Đo → Xem CSS** trên trang tài liệu) trước khi kết luận.'
  /* ĐOẠN CỐ ĐỊNH — máy chủ tự gắn, KHÔNG gửi cho AI / không để AI viết (đỡ token vào + ra). Lịch sử gửi lên AI cũng bỏ các đoạn này. */
  const SELF_CHECK = 'Tự đo: mở trang tài liệu → bật **Đo** trên khung ví dụ → Alt + bấm phần tử → **Xem CSS** để so giá trị và tên biến; tra mọi biến tại [Biến chuẩn](/ds/design-tokens).'
  const MEASURE_HD = '#### Tự đo trên trang tài liệu'
  const measureNote = (slug, title) => `${MEASURE_HD}\nMở ${slug ? `[${title}](/ds/${slug})` : 'trang tài liệu'} → bật **Đo** → rê chuột lên phần tử (đổi **Mật độ** để xem từng mode).`
  const SIZE_Q = /(cao|rộng|chiều|kích thước|padding|gap|đệm|khoảng cách|cách nhau|bo góc|radius|border|viền|cỡ chữ|font|màu|shadow|bóng|px|spacing|margin|line height)/i
  /** Chèn đoạn cố định TRƯỚC dòng “Nguồn:” */
  const beforeSrc = (t, block) => { const m = t.match(/\n+\s*Nguồn\s*:[\s\S]*$/); return m ? t.slice(0, m.index).trimEnd() + '\n\n' + block + '\n\n' + m[0].trim() : t.trimEnd() + '\n\n' + block }
  /** Bỏ đoạn cố định khỏi câu trả lời cũ trước khi gửi làm lịch sử (AI không cần đọc lại) */
  const STATIC_RE = [/^> [^\n]*\n*/gm, new RegExp('\\n*' + MEASURE_HD + '[^\\n]*\\n[\\s\\S]*?(?=\\n#### |\\n+\\s*Nguồn\\s*:|$)', 'g'),
    /\n*#### Giá trị token CSS[\s\S]*?(?=\n#### |\n+\s*Nguồn\s*:|$)/g, /\n*Tự đo: mở trang tài liệu[^\n]*/g, /\n+\s*Nguồn\s*:[\s\S]*$/]
  const stripStatic = t => STATIC_RE.reduce((x, re) => x.replace(re, ''), String(t)).trim()
  /* Soát ảnh — chốt chặn phía máy chủ (Flash hay quên lời nhắc): kết luận “Đạt quy chuẩn” → đổi sang “Chưa thấy lỗi rõ…”; bỏ mục liệt kê điểm “đã đạt / đã đúng” */
  const REVIEW_OK = '**Chưa thấy lỗi rõ trong ảnh — vẫn cần đo lại trên Figma / bản thi công**'
  const reviewFix = t => t
    .replace(/^(\s*)\*\*\s*(Đạt|Đúng)( quy)? chuẩn[^*\n]*\*\*/i, '$1' + REVIEW_OK)
    .replace(/\n*#### [^\n]*(đã đạt|đã đúng|điểm đạt|điểm tốt|đạt quy chuẩn)[^\n]*\n[\s\S]*?(?=\n#### |\n+\s*Nguồn\s*:|$)/gi, '')
  const REVIEW_TERMS = 'bố cục khoảng cách card bo góc shadow nền form nhãn nút Lưu Hủy footer header sidebar bảng phân trang tiêu đề cỡ chữ màu icon button popup dialog toolbar'
  const REVIEW = `SOÁT ẢNH THIẾT KẾ (người hỏi gửi kèm ảnh màn hình / thiết kế):
- Mở đầu bằng KẾT LUẬN 1 dòng in đậm: **Cần sửa N điểm** · **Chưa thấy lỗi rõ trong ảnh — vẫn cần đo lại trên Figma / bản thi công** · hoặc **Chưa đủ rõ để kết luận** (ảnh mờ / quá nhỏ / không phải giao diện). ⛔ TUYỆT ĐỐI KHÔNG kết luận “Đạt quy chuẩn” / “Đúng chuẩn” — ảnh chụp không đo được chính xác, người đọc sẽ tưởng không cần sửa gì.
- Rồi 1–2 câu mô tả ngắn ảnh là màn gì (danh sách, form, popup, dashboard…) để người hỏi biết AVA đọc đúng.
- Liệt kê từng điểm CẦN SỬA, nặng trước nhẹ sau, mỗi điểm 1 dòng: **chỗ nào trong ảnh** (VD "nút Lưu, Hủy ở đầu form") → **quy tắc kèm SỐ / TOKEN chuẩn** (trích từ TRI THỨC, VD "bo 8px — \`--radius-card\`") → **sửa thế nào**. Tối đa ~8 điểm quan trọng nhất.
- KHÔNG viết mục khen "Đã đúng" và không xác nhận số đo nào là đúng (ảnh đã thu nhỏ, dễ đọc nhầm). Điểm nghi ngờ nhưng không chắc (khoảng cách, cỡ chữ, bo góc, viền mảnh…) → gom vào mục "Nên kiểm tra lại trên Figma" (tối đa 4 ý ngắn).
- BẮT BUỘC kết thúc bằng mục "#### Quy chuẩn để tự kiểm lại" (kể cả khi không thấy lỗi): ảnh KHÔNG đo chính xác được màu, khoảng cách, cỡ chữ → đưa danh sách quy chuẩn để người hỏi tự đo trên Figma / bản dựng. Viết dạng DANH SÁCH (KHÔNG dùng bảng), 6–10 dòng, mỗi dòng: **Thành phần**: quy chuẩn (số + \`token\`) — [Tên trang](/ds/…); CHỈ các thành phần CÓ TRONG ẢNH (VD màn danh sách: lề trang, card, thanh công cụ, chiều cao nút / ô nhập, chữ nội dung, header bảng, phân trang, màu nền trang / card, bo góc, bóng đổ). Số và tên token chép đúng từ TRI THỨC / SỐ ĐO / GIÁ TRỊ TOKEN (không tự đặt); link trang tài liệu chỉ dùng trang có trong TRI THỨC.
- CHỈ bắt lỗi dựa trên quy tắc có trong TRI THỨC; không tự đặt quy tắc. Số đo đọc từ ảnh chỉ là ƯỚC LƯỢNG (ảnh đã thu nhỏ) — ghi "khoảng", không khẳng định từng pixel; chỗ nào không chắc thì nói "cần kiểm tra lại trên Figma".
- Chỉ kết luận "Cần sửa" với điều NHÌN RÕ trong ảnh (VD vị trí nút, màu header / sidebar, có viền hay không, nền trắng hay xám).
- BẮT BUỘC soát lần lượt checklist sau (thấy vi phạm là nêu, không thấy phần đó trong ảnh thì bỏ qua):
  1. Header × Sidebar: header MÀU (nền brand) chỉ đi với sidebar SÁNG; header trắng thì sidebar sáng hoặc tối → header màu + sidebar tối là SAI.
  2. Nút Lưu / Hủy của form, popup: ghim ĐÁY, nút chính bên phải; ở đầu form / cạnh tiêu đề là SAI.
  3. Card / khối trắng: đặt trên nền xám BG Page, bo 8px, bóng nhẹ Neutral All 2, KHÔNG viền; card có viền / đặt trên nền trắng / bo góc to là SAI. Popup / dialog bo 12px.
  4. Khoảng cách: card ↔ card 16px, đệm trong card 16px đều 4 phía, control ↔ control 8px, lề nội dung 16px.
  5. Chữ: tiêu đề form / popup 20px Semi Bold; chữ thường 13px; không dùng chữ 11–12px cho nội dung.
  6. Form: nhãn trái rộng 200px (hàng cách 12px) hoặc nhãn trên (cách ô 4px, trường cách 16px); ô nhập cao theo chuẩn control.
  7. Nút: 1 nút chính (Primary) mỗi màn / form; nút phụ dạng viền; link button dạng Text.
  8. Bảng / danh sách: thanh công cụ, phân trang ở dưới, số định dạng 1.234.567,89.`

  /* Model “Flash” mặc định có bước suy nghĩ (thinking) trước khi trả lời → chậm thêm vài giây; AVA trả lời theo tri thức có sẵn nên tắt / giảm.
     2.5 Pro không tắt được thinking → giữ mặc định. */
  /* Soát ẢNH thiết kế cần suy luận (đối chiếu từng quy tắc với ảnh) → bật suy nghĩ vừa phải; tắt thì hay kết luận ngược (đã gặp: khen header màu + sidebar tối) */
  function thinkingFor(model, review = false) {
    if (/2\.5-flash/.test(model)) return { thinkingBudget: review ? 2048 : 0 }
    if (/gemini-3/.test(model)) return { thinkingLevel: review ? 'high' : 'low' }
    return null
  }

  /* Câu trả lời DÙNG LẠI (lấy từ Lịch sử hỏi AVA, không gọi AI) chỉ còn đúng khi tri thức nó dựa vào CHƯA ĐỔI:
     mỗi lượt trả lời ghi “parts” = { s: dấu phần cố định (hướng dẫn + tri thức luôn gửi + số đo code + nguyên tắc nền + cách trình bày),
     p: dấu từng đoạn tài liệu / mục tri thức đã gửi kèm }. Sửa trang / mục tri thức nào → câu trả lời dùng đoạn đó tự hết hiệu lực. */
  const model0 = a => a.model || 'gemini-2.5-flash'
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) }
  const stableOf = () => `${SYSTEM}\n\n` + (alwaysNotes() ? `════ TRI THỨC AVA — LUÔN ÁP DỤNG (ban biên tập nhập — ưu tiên cao nhất) ════\n${alwaysNotes()}\n\n---\n\n` : '') + `${facts()}\n\n---\n\n${pinned()}`
  const stableSig = mode => hash(stableOf() + (MODES[mode] || MODES.plain))
  const chunkSig = c => hash(c.title + '\n' + c.text)
  /* v2 — chỉ hết hạn khi TRI THỨC thật sự đổi (không phải câu chữ hướng dẫn AVA):
     · k = dấu tri thức luôn gửi (mục “Luôn gửi kèm” + nguyên tắc nền) — KHÔNG gồm SYSTEM / cách trình bày (sửa lời nhắc không làm hết hạn)
     · f = dấu các MỤC số đo code (facts.md, theo tiêu đề ##) LIÊN QUAN câu hỏi (VD hỏi button → mục Button…) — sửa CSS chỗ khác không ảnh hưởng
     · p = dấu đoạn tài liệu / tri thức đã gửi, theo thứ tự liên quan → 3 đoạn đầu phải còn nguyên + ≥ 70% còn nguyên */
  const knowSig = () => hash((alwaysNotes() || '') + '\n' + pinned())
  const factSections = () => facts().split(/\n(?=## )/).filter(x => x.startsWith('## ')).map(x => ({ head: x.slice(3, x.indexOf('\n') > 0 ? x.indexOf('\n') : undefined), sig: hash(x) }))
  function factSigsFor(question) {
    const q = new Set(qSig(question)); if (!q.size) return []
    return factSections().filter(sec => qSig(sec.head).some(t => q.has(t))).map(sec => sec.sig)
  }
  /** Phần đầu facts.md (mật độ, cách tự đo) + tối đa 4 mục ## có tiêu đề trùng từ với câu hỏi; không mục nào khớp → mục “Token chung” */
  function factsFor(text) {
    const all = facts(), cut = all.search(/\n## /), head = cut > 0 ? all.slice(0, cut) : all
    const secs = all.split(/\n(?=## )/).filter(x => x.startsWith('## '))
    const q = new Set(qSig(text))
    let pick = secs.filter(x => qSig(x.slice(3, x.indexOf('\n'))).some(t => q.has(t))).slice(0, 4)
    if (!pick.length) pick = secs.filter(x => x.startsWith('## Token chung'))
    return [head.replace(/\n\*\*Tự đo thông số[^\n]*/, '').trim(), ...pick.map(x => x.trim())].join('\n\n')
  }
  let validMemo = { key: '', set: null }
  function validSet() {
    const ix = build(), key = kStamp.length + ':' + pStamp.length + ':' + hash(kStamp + pStamp) + ':' + notesStamp()
    if (validMemo.key !== key) validMemo = { key, set: new Set([...ix.chunks.map(chunkSig), ...activeNotes().map(n => hash(noteText(n)))]) }
    return validMemo.set
  }
  /** Câu trả lời cũ còn dùng được? (tri thức nó dựa vào chưa đổi) — lượt hỏi cũ chưa ghi parts → không chắc → false */
  function stillValid(parts, mode) {
    if (!parts || !Array.isArray(parts.p)) return false
    const set = validSet(), p = parts.p
    const chunksOk = p.slice(0, 3).every(x => set.has(x)) && p.filter(x => set.has(x)).length >= Math.ceil(p.length * 0.7)
    if (parts.v === 2) {
      if (parts.k !== knowSig()) return false
      const cur = new Set(factSections().map(x => x.sig))
      return (parts.f || []).every(x => cur.has(x)) && chunksOk
    }
    // lượt cũ (v1 — dấu gồm cả câu chữ hướng dẫn): bỏ qua dấu cố định, chỉ xét đoạn tri thức đã dùng
    return !!parts.s && chunksOk
  }

  /** onDelta(text): nhận từng đoạn chữ ngay khi model sinh ra (trả lời dạng dòng chảy) — không truyền thì chờ trả lời đủ */
  async function ask({ messages, page, asker, mode = 'plain', onDelta }) {
    const a = ai?.() ?? {}
    if (!a.apiKey) { const e = new Error('Quản trị chưa cấu hình khóa AI (Cài đặt hệ thống của Solution Point)'); e.status = 503; throw e }
    // Lịch sử: 10 lượt gần nhất; câu trả lời cũ của AVA giữ ~1.500 ký tự đầu (đủ ngữ cảnh hỏi nối tiếp, đỡ token)
    const list = (Array.isArray(messages) ? messages : []).filter(m => m && ['user', 'ava'].includes(m.role) && String(m.text ?? '').trim()).slice(-10)
    // Ảnh thiết kế chỉ đi kèm lượt hỏi CUỐI (lượt trước chỉ còn ghi chú) — tối đa 3 ảnh JPEG / PNG / WebP đã nén ở trình duyệt
    const images = cleanImages(list.at(-1)?.role === 'user' ? list.at(-1).images : null)
    const turns = list.map((m, i) => ({ role: m.role === 'ava' ? 'model' : 'user', parts: [{ text: (m.role === 'ava' ? stripStatic(m.text) : String(m.text)).slice(0, m.role === 'ava' ? 1500 : 2000) },
      ...(i === list.length - 1 ? images.map(im => ({ inlineData: { mimeType: im.mime, data: im.data } })) : [])] }))
    while (turns.length && turns[0].role !== 'user') turns.shift()
    if (!turns.length || turns.at(-1).role !== 'user') { const e = new Error('Chưa có câu hỏi'); e.status = 400; throw e }
    // Tìm theo câu hỏi GỐC (lấy trước khi chèn câu nhắc bên dưới — chữ “token / class” trong câu nhắc làm lệch kết quả tìm)
    const users = turns.filter(t => t.role === 'user').map(t => t.parts[0].text)
    /* Nhắc ngay trong lượt hỏi (Flash nghe lượt hỏi tốt hơn lời nhắc hệ thống dài):
       · build → chỉ phần thi công · plain → lời thường, không code / tên biến (trừ khi chính câu hỏi hỏi code / CSS / token) */
    const lastText = turns.at(-1).parts[0]
    const devAsked = /\b(css|code|token|class|prop|html|vue)\b|--[a-z]/i.test(lastText.text)
    if (mode === 'build') lastText.text = `CHI TIẾT CÁCH THI CÔNG cho câu hỏi: “${lastText.text}”.\nYêu cầu: không chào, không giải thích lại bằng lời thường, không mục “Tự đo”. Chỉ các mục #### Component / class mds-ui · Token CSS · Code mẫu (≤ 15 dòng, dùng var(--token)) · Lưu ý ⛔ (nếu có). Token CHỈ ghi TÊN trong \`code\` — KHÔNG ghi mã màu / px / giá trị của token (hệ thống tự gắn bảng giá trị thật).`
    if (images.length) lastText.text += '\n\n(Ảnh chụp chỉ TƯƠNG ĐỐI, không đo chính xác được: KHÔNG kết luận “Đạt quy chuẩn”, KHÔNG liệt kê điểm đã đạt / đã đúng — chỉ nêu điểm cần sửa và quy chuẩn để tự kiểm lại.)'
    else if (mode === 'plain' && !devAsked) lastText.text += '\n\n(Trả lời bằng lời thường cho người không phải lập trình viên: KHÔNG viết code, tên class, tên biến / token, var(--…) — phần đó nằm ở nút “Chi tiết cách thi công”.)'
    // Tìm theo 3 lượt hỏi gần nhất (hỏi nối tiếp kiểu “còn Nhỏ thì sao?” → câu ngắn không đủ từ, cần câu trước)
    // Soát ảnh thiết kế: tìm thêm các quy tắc bố cục hay bị vi phạm (khoảng cách, card, form, nút, header, sidebar, bảng…)
    const review = images.length > 0
    // Nguyên tắc nền (2 trang PINNED) chỉ ghim nguyên trang khi soát ảnh; câu hỏi thường thì để tìm như trang khác (liên quan mới gửi đoạn đó)
    const found = search(users.slice(-3).join('\n') + (review ? `\n${REVIEW_TERMS}` : ''), page, review).filter(c => !review || !PINNED.includes(c.slug))
    const enAlways = alwaysNotes(), relNotes = relevantNotes(users.slice(-3).join('\n') + (images.length ? `\n${REVIEW_TERMS}` : '')), enRel = relNotes.map(noteText).join('\n\n---\n\n')
    /* Thứ tự gửi = phần CỐ ĐỊNH trước (hướng dẫn + tri thức ban biên tập + số đo trong code + nguyên tắc nền — giống hệt mọi lượt hỏi)
       rồi mới tới phần THAY ĐỔI (cách trình bày, trang đang xem, đoạn tìm được) → Gemini tự cache phần đầu giống nhau (implicit caching),
       token phần đó tính rẻ hơn ~4 lần. Đừng chen nội dung thay đổi theo câu hỏi vào giữa phần cố định. */
    /* Tiết kiệm token: số đo code (facts.md ~2.900 token) chỉ gửi phần đầu + các mục ## LIÊN QUAN câu hỏi / đoạn tìm được (soát ảnh: gửi đủ).
       Implicit cache của Gemini thực tế không trúng (cached = 0) nên không cần giữ phần đầu cố định dài. */
    const factTxt = review ? facts() : factsFor(users.slice(-2).join(' ') + ' ' + found.map(c => c.title).join(' '))
    const stable = `${SYSTEM}\n\n` + (enAlways ? `════ TRI THỨC AVA — LUÔN ÁP DỤNG (ban biên tập nhập — ưu tiên cao nhất) ════\n${enAlways}\n\n---\n\n` : '') + factTxt + (review ? `\n\n---\n\n${pinned()}` : '')
    const knowledge = found.map(c => `Nguồn: ${c.title}${c.href ? ` (${c.href})` : ''}\n${c.text}`).join('\n\n---\n\n')
    // Giá trị THẬT của các token có trong câu hỏi + đoạn tìm được → AI chép đúng số, không tự bịa (đã gặp: bịa bóng đổ popup)
    const tokVals = tokenValuesFor(users.slice(-3).join('\n') + '\n' + knowledge, mode === 'plain' ? 15 : 40)
    // Không gửi tên người hỏi: câu trả lời quy chuẩn không cần, và câu trả lời nhớ sẵn dùng chung được cho mọi người
    const ctx = page ? `\nNgười hỏi đang xem trang tài liệu: /ds/${page}.` : ''
    // Dấu tri thức đã dùng → ghi vào lịch sử để câu hỏi giống sau này dùng lại câu trả lời (khi tri thức chưa đổi)
    const parts = { v: 2, s: hash(stable + (MODES[mode] || MODES.plain)), k: knowSig(), f: factSigsFor(users.at(-1) ?? ''), p: [...found.map(chunkSig), ...relNotes.map(n => hash(noteText(n)))] }
    const t0 = Date.now()
    const model = model0(a), thinking = thinkingFor(model, images.length > 0)
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': a.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${stable}\n\n════════════════\n${MODES[mode] || MODES.plain}${images.length ? `\n\n${REVIEW}` : ''}${ctx}${tokVals ? `\n\n════ GIÁ TRỊ TOKEN ĐANG CHẠY (code mds-ui — giá trị duy nhất được phép ghi) ════\n${tokVals}` : ''}${enRel ? `\n\n════ TRI THỨC AVA LIÊN QUAN (ban biên tập nhập — ưu tiên cao nhất, đè lên tài liệu khi khác nhau) ════\n${enRel}` : ''}\n\n════ TRI THỨC (các đoạn liên quan nhất) ════\n${knowledge || '(không tìm thấy đoạn nào liên quan)'}` }] },
        contents: turns,
        // Giới hạn độ dài trả lời: Dễ hiểu ~120–200 từ → 2048 token là dư; Kỹ thuật / soát ảnh cần code, nhiều điểm → 3072
        // soát ảnh: có thêm bảng “Quy chuẩn để tự kiểm lại” → cần nhiều chỗ hơn
        generationConfig: { temperature: 0.1, maxOutputTokens: images.length ? 4096 : mode === 'plain' ? 2048 : 3072, ...(thinking ? { thinkingConfig: thinking } : {}) },
      }),
      signal: AbortSignal.timeout(60000),
    })
    if (!res.ok) { const body = await res.json().catch(() => ({})); const e = new Error(body?.error?.message || `Google AI trả lỗi ${res.status}`); e.status = 502; throw e }
    // Đọc dòng chảy SSE: mỗi dòng “data: {…}” mang 1 đoạn chữ. Giữ lại ~20 ký tự đầu để bỏ dấu [NGOAI_PHAM_VI] trước khi gửi xuống trình duyệt.
    const MARK = '[NGOAI_PHAM_VI]'
    let text = '', emitted = 0, decided = false, buf = '', usage = null, runaway = false
    /* Dòng phân cách bảng markdown đôi khi bị model kéo dài hàng nghìn dấu “-” (đã gặp ở bảng “Quy chuẩn để tự kiểm lại”) → rút về “---”;
       chuỗi “-” quá dài (≥ 200) = model lặp vô hạn → ngừng đọc, giữ phần đã có (không đốt hết lượt token) */
    const tidy = t => t.replace(/-{4,}/g, '---')
    // Đoạn cố định gắn lúc chốt câu trả lời: “Tự đo” (câu hỏi thông số, không phải soát ảnh / thi công) · dòng tự đo cuối bài soát ảnh
    const askedSize = SIZE_Q.test(users.at(-1) || '')
    const finishStatic = t => {
      if (images.length) return t.includes('Tự đo: mở trang') ? t : beforeSrc(t, SELF_CHECK)
      if (mode === 'build' || !askedSize || t.includes(MEASURE_HD) || t.includes('[NGOAI_PHAM_VI]')) return t
      const known = new Map(pages().map(p => [p.slug, p.title]))
      // Trang control: tên control có trong CÂU HỎI (Button, Tabs…) → trang đang xem → link control trong câu trả lời; trang chung (thuật ngữ, biến chuẩn…) không tính
      const GENERIC = new Set(['css-terms', 'design-tokens', 'general-design-rules', 'general-usability-requirements'])
      const ql = (users.at(-1) || '').toLowerCase()
      const sl = Object.entries(LINK_TERMS).find(([x, ws]) => known.has(x) && ws.some(w => ql.includes(w.toLowerCase())))?.[0]
        || (page && known.has(page) && !GENERIC.has(page) ? page : '')
        || [...t.matchAll(/\(\/ds\/([a-z0-9-]+)/g)].map(m => m[1]).find(x => known.has(x) && !GENERIC.has(x)) || ''
      return sl ? beforeSrc(t, measureNote(sl, known.get(sl))) : t   // không rõ trang nào → bỏ mục, khỏi dài
    }
    const flush = (final = false) => {
      if (!onDelta) return
      if (!decided) {   // chưa đủ chữ để biết có mở đầu bằng dấu ngoài phạm vi không → chờ thêm
        const t = text.trimStart()
        if (!final && t.length < MARK.length && MARK.startsWith(t)) return
        decided = true
      }
      let clean = tidy(text.replace(MARK, '').trimStart())
      if (images.length) {   // soát ảnh: lưu ý ảnh chụp hiện NGAY ĐẦU · giữ lại dòng đang viết dở để kịp sửa kết luận / bỏ mục “đã đạt”
        if (!final) clean = clean.slice(0, clean.lastIndexOf('\n') + 1)
        clean = PHOTO_NOTE + '\n\n' + reviewFix(clean)
      }
      // Giữ dòng “Nguồn:” lại tới cuối → chèn mục “Giá trị token CSS” ngay TRƯỚC dòng Nguồn
      const src = clean.search(/\n+\s*Nguồn\s*:/)
      if (!final && src >= 0) clean = clean.slice(0, src)
      clean = splitFollowups(clean).text   // dòng gợi ý [GOI_Y] không hiện thành chữ — gửi riêng thành nút ở dòng {done}
      if (!final) clean = clean.replace(/\[[GOI_Y]{0,5}$/, '')   // đang viết dở “[GOI…”
      else clean = withTokens(finishStatic(clean), mode)
      if (clean.length > emitted) { onDelta(clean.slice(emitted)); emitted = clean.length }
    }
    const decoder = new TextDecoder()
    for await (const chunk of res.body) {
      buf += decoder.decode(chunk, { stream: true })
      let nl
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1)
        if (!line.startsWith('data:')) continue
        try {
          const d = JSON.parse(line.slice(5))
          if (d.error) { const e = new Error(d.error.message || 'Google AI trả lỗi'); e.status = 502; throw e }
          if (d.usageMetadata) usage = d.usageMetadata   // token: vào / ra / phần được cache (cachedContentTokenCount)
          const part = d.candidates?.[0]?.content?.parts?.map(p => p.text ?? '').join('') ?? ''
          if (part) { text += part; if (/-{200,}/.test(text)) runaway = true; flush() }
        } catch (e) { if (e.status) throw e }
        if (runaway) break
      }
      if (runaway) { try { await res.body.cancel?.() } catch {} ; break }
    }
    flush(true)
    const fu = splitFollowups(tidy(text).trim())
    text = withTokens(finishStatic(fu.text), mode)
    if (mode === 'plain') text = text.replace(/\n*#### (Cho lập trình viên|Giá trị token CSS)[^\n]*\n[\s\S]*?(?=\n#### |\n+\s*Nguồn\s*:|$)/g, '').trim()
    // Hỏi về màu: luôn kèm bảng token màu từ knowledge — AI plain mode không tự ghi tên token, inject từ đoạn tìm được
    const colorQ = /màu|color/i.test(users.at(-1) ?? '')
    if (colorQ && !text.includes('#### Giá trị token CSS') && !text.includes('[NGOAI_PHAM_VI]')) {
      const cb = buildColorBlock(knowledge)
      if (cb) text = beforeSrc(text, cb)
    }
    if (!text) { const e = new Error('AVA chưa trả lời được, thử hỏi lại nhé'); e.status = 502; throw e }
    // Nguồn: các trang tài liệu nằm trong nhóm đoạn dùng (để hiện nút mở nhanh)
    // Nguồn hiện nút mở nhanh: chỉ các trang tài liệu AVA thật sự dẫn trong câu trả lời
    const titles = new Map(pages().map(p => [p.slug, p.title]))
    const sources = [...new Set([...text.matchAll(/\(\/ds\/([a-z0-9-]+)/g)].map(m => m[1]))].filter(sl => titles.has(sl)).slice(0, 3).map(sl => ({ title: titles.get(sl), href: `/ds/${sl}` }))
    // Ngoài phạm vi: bỏ dấu hiệu khỏi câu trả lời, đánh dấu để Lịch sử hỏi AVA lọc được
    text = linkPages(text, page || '')   // gắn link component (sau khi đã lấy nguồn để nút mở nhanh không bị thêm)
    text = text.replace(/\[([^\]]+)\]\(\/ds\/([a-z0-9-]+)[^)]*\)/g, (all, label, sl) => (titles.has(sl) ? all : label))   // link tới trang KHÔNG có (AI tự đặt) → chỉ giữ chữ
    const refused = text.includes('[NGOAI_PHAM_VI]')
    /* Soát ảnh → luôn kèm LƯU Ý cố định (máy chủ tự chèn, không phụ thuộc AI): ảnh chụp đã thu nhỏ / nén nên số đo, màu có thể lệch */
    // Lưu ý đặt ĐẦU câu trả lời (trước đây chèn giữa → lọt giữa bài dài, người đọc không thấy, tưởng ảnh đã chuẩn)
    if (images.length && !refused) text = PHOTO_NOTE + '\n\n' + reviewFix(text.replace(PHOTO_NOTE, '').trim())
    const result = { text: text.replace(/\[NGOAI_PHAM_VI\]\s*/g, '').trim(), followups: refused ? [] : fu.followups, sources, refused, ms: Date.now() - t0, model, parts,
      tokens: usage ? { in: usage.promptTokenCount || 0, cached: usage.cachedContentTokenCount || 0, out: usage.candidatesTokenCount || 0 } : null }
    return result
  }
  return { ask, search, build, withTokens, linkPages, stillValid }
}
