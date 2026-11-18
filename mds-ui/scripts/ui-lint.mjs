#!/usr/bin/env node
/* ═══ ui-lint — chặn 3 loại lỗi hay lặp lại NGAY khi viết code (chạy tự động bằng hook Claude Code sau mỗi lần sửa .vue/.css) ═══
   1. VẼ LẠI control đã có: khung nổi tự viết (popover / menu / drawer), component trùng tên mds-ui, màn hình không dựng bằng <AppPage>
   2. NHẢY VỊ TRÍ KHI HOVER: trạng thái :hover / :focus / :active / [aria-expanded] đổi kích thước (đậm chữ, padding, viền, width, display…)
   3. Vi phạm token: chữ < 13px, kích thước px cứng trên nút / ô nhập
   Cách dùng:
     node mds-ui/scripts/ui-lint.mjs <file…>        in lỗi của file (kể cả lỗi cũ)
     node mds-ui/scripts/ui-lint.mjs --all          quét cả repo
     node mds-ui/scripts/ui-lint.mjs --baseline     ghi nhận lỗi CŨ hiện có (app cũ để sau) → ui-lint-baseline.json
     … --hook                                       (hook PostToolUse) đọc stdin JSON, chỉ chặn lỗi MỚI so với baseline (exit 2)
   Bỏ qua 1 khối có chủ đích: thêm comment  /* ui-lint-ok: <lý do> *\/  trong khối CSS đó (lý do bắt buộc). */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const BASELINE = path.join(ROOT, 'mds-ui/scripts/ui-lint-baseline.json')
const STATE = path.join(ROOT, '.ui-guard/state.json')
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.claude', '.live', '.ui-guard', 'playwright-figma-login', 'test-results', 'playwright-report'])

const rel = f => path.relative(ROOT, f).split(path.sep).join('/')
const isCore = r => r.startsWith('mds-ui/')

/* ── Tách CSS: .vue lấy các khối <style>, giữ đúng số dòng ── */
function cssOf(file, text) {
  if (file.endsWith('.css')) return [{ css: text, offset: 0 }]
  const out = [], re = /<style[^>]*>([\s\S]*?)<\/style>/g
  let m
  while ((m = re.exec(text))) out.push({ css: m[1], offset: m.index + m[0].indexOf('>') + 1 })
  return out
}

/* ── Bộ đọc CSS tối giản: trả về [{ selector, decls: {prop: value}, start, ok }] (hiểu @media lồng nhau, bỏ @keyframes) ── */
function parseRules(css) {
  const rules = []
  const okMarks = []
  // gỡ comment nhưng giữ độ dài (để số dòng đúng); ghi nhận vị trí ui-lint-ok
  css = css.replace(/\/\*[\s\S]*?\*\//g, (c, i) => { if (/ui-lint-ok\s*:\s*\S/.test(c)) okMarks.push(i); return c.replace(/[^\n]/g, ' ') })
  let buf = '', bufStart = 0, stack = [], skipDepth = 0
  for (let i = 0; i < css.length; i++) {
    const ch = css[i]
    if (skipDepth) { if (ch === '{') skipDepth++; else if (ch === '}') skipDepth--; continue }
    if (ch === '{') {
      const sel = buf.trim()
      if (/^@(-webkit-)?keyframes|^@font-face/.test(sel)) { skipDepth = 1; buf = ''; continue }
      stack.push({ sel, at: sel.startsWith('@'), start: bufStart + buf.search(/\S/) })
      buf = ''; bufStart = i + 1
    } else if (ch === '}') {
      const top = stack.pop()
      if (top && !top.at) {
        const decls = {}
        for (const d of buf.split(';')) { const k = d.indexOf(':'); if (k > 0) decls[d.slice(0, k).trim().toLowerCase()] = d.slice(k + 1).trim() }
        rules.push({ selector: top.sel, decls, start: top.start, end: i, ok: okMarks.some(p => p > top.start && p < i) })
      }
      buf = ''; bufStart = i + 1
    } else buf += ch
  }
  return rules
}

const splitSel = s => { const out = []; let d = 0, cur = ''; for (const c of s) { if (c === '(' || c === '[') d++; if (c === ')' || c === ']') d--; if (c === ',' && !d) { out.push(cur.trim()); cur = '' } else cur += c } if (cur.trim()) out.push(cur.trim()); return out }
const STATE_RE = /:(hover|focus-visible|focus-within|focus|active)\b|\[aria-expanded(=["']?true["']?)?\]|\[aria-pressed(=["']?true["']?)?\]/g
const norm = s => s.replace(/:deep\(([^)]*)\)/g, '$1').replace(/\s+/g, ' ').trim()
const lastCompound = s => norm(s).split(/[\s>+~]+/).pop()
const pxWidth = v => { const m = /(^|\s)(\d*\.?\d+)px/.exec(v || ''); return m ? parseFloat(m[2]) : (/\b(thin|medium|thick)\b/.test(v || '') ? 1 : 0) }

const SHIFT_PROPS = /^(font-weight|font-size|letter-spacing|padding(-(top|right|bottom|left|inline|block))?|margin(-(top|right|bottom|left|inline|block))?|width|height|min-width|min-height|max-width|max-height|border(-(top|right|bottom|left))?(-width)?|gap|line-height)$/

function lintFile(file) {
  const r = rel(file), text = fs.readFileSync(file, 'utf8'), core = isCore(r)
  const lineAt = idx => text.slice(0, idx).split('\n').length
  const out = []
  const add = (rule, line, key, msg) => out.push({ file: r, rule, line, key: `${rule}|${key}`, msg })

  const all = []
  for (const blk of cssOf(file, text)) for (const ru of parseRules(blk.css)) all.push({ ...ru, line: lineAt(blk.offset + ru.start) })
  // chỉ mục khai báo theo selector (để so trạng thái thường ↔ hover)
  const bySel = new Map(), byLast = new Map()
  for (const ru of all) for (const s of splitSel(ru.selector)) {
    const n = norm(s); bySel.set(n, { ...(bySel.get(n) || {}), ...ru.decls })
    if (!STATE_RE.test(s)) { const l = lastCompound(s); byLast.set(l, { ...(byLast.get(l) || {}), ...ru.decls }) }
    STATE_RE.lastIndex = 0
  }

  for (const ru of all) {
    if (ru.ok) continue
    const d = ru.decls
    /* 1a. Khung nổi tự vẽ (chỉ app) */
    if (!core && /^(fixed|absolute)$/.test(d.position || '') && d['box-shadow'] && !/^none$/.test(d['box-shadow']))
      add('tu-ve-khung-noi', ru.line, norm(ru.selector), `${ru.selector} — khung nổi tự vẽ (position ${d.position} + box-shadow). Dùng <AppPopover> (nội dung tuỳ ý) · <DropdownMenu> (danh sách lệnh) · <AppDrawer> (chi tiết bên phải) · AppCombobox / AppDatePicker — không tự tính toạ độ / bóng / z-index.`)
    /* 3a. Chữ nhỏ hơn 13 (chỉ app) */
    if (!core && /^(9|10|11|12)px$/.test(d['font-size'] || '') && !/badge|count/.test(ru.selector))
      add('chu-nho', ru.line, `${norm(ru.selector)}|${d['font-size']}`, `${ru.selector} — font-size ${d['font-size']} < 13px. Chữ nội dung dùng var(--text-body) (13px).`)
    /* 3b. Kích thước px cứng trên nút / ô nhập (chỉ app; sidebar là ngoại lệ đã duyệt) */
    if (!core && !/sidebar|^\.cv-/.test(ru.selector)) for (const p of ['height', 'min-height']) {
      if (/^\d+px$/.test(d[p] || '') && /(^|[.\-_])(btn|button|input|icon-btn)([.\-_\s:]|$)/i.test(lastCompound(ru.selector)))
        add('kich-thuoc-cung', ru.line, `${norm(ru.selector)}|${p}`, `${ru.selector} — ${p}: ${d[p]} gõ cứng trên nút / ô nhập. Dùng class mds-ui (.btn, .btn-icon, .btn--sm…) hoặc var(--btn-height) / var(--input-height).`)
    }
    /* 2. Nhảy vị trí khi hover / focus / mở */
    for (const s0 of splitSel(ru.selector)) {
      // :not(:hover) là phủ định — không phải trạng thái hover; sidebar co/giãn khi rê = thiết kế đã duyệt (đè lên nội dung, không đẩy);
      // ::before / ::after thường là lớp phủ position absolute — không đẩy phần tử khác
      const s = s0.replace(/:not\([^()]*\)/g, '')
      if (/sidebar|::?(before|after)\b/.test(s)) continue
      STATE_RE.lastIndex = 0
      if (!STATE_RE.test(s)) continue
      STATE_RE.lastIndex = 0
      const base = bySel.get(norm(s.replace(STATE_RE, ''))) || {}
      const target = byLast.get(lastCompound(s.replace(STATE_RE, ''))) || {}
      for (const [p, v] of Object.entries(d)) {
        if (p === 'display') {
          if (/^none$/.test(v) || /^(absolute|fixed)$/.test(target.position || base.position || '')) continue
          if ((target.display || base.display) === 'none' || /^(flex|inline-flex|block|inline-block|grid)$/.test(v))
            add('nhay-khi-hover', ru.line, `${norm(s)}|display`, `${s} — hiện phần tử bằng display khi hover → đẩy phần tử bên cạnh. Giữ chỗ sẵn, chỉ đổi visibility / opacity (hoặc đặt position: absolute).`)
          continue
        }
        if (!SHIFT_PROPS.test(p)) continue
        if (base[p] === v || target[p] === v) continue
        if (p.startsWith('border')) {
          const w = pxWidth(v); if (!w) continue
          const bw = pxWidth(base[p] ?? base.border ?? base['border-width'] ?? target[p] ?? target.border ?? target['border-width'])
          if (bw === w) continue
          add('nhay-khi-hover', ru.line, `${norm(s)}|${p}`, `${s} — ${p}: ${v} khi hover mà trạng thái thường không có viền ${w}px → phần tử to ra 1 nhịp, nhảy vị trí. Trạng thái thường đặt sẵn "border: ${w}px solid transparent" rồi hover chỉ đổi border-color (hoặc dùng box-shadow inset / outline).`)
          continue
        }
        if (p === 'font-weight') { add('nhay-khi-hover', ru.line, `${norm(s)}|${p}`, `${s} — đổi font-weight khi hover → chữ rộng ra, đẩy phần tử bên cạnh. Hover chỉ đổi màu / nền; cần đậm thì giữ chỗ bằng ::after { content: attr(data-text); font-weight: …; visibility: hidden; height: 0 }.`); continue }
        add('nhay-khi-hover', ru.line, `${norm(s)}|${p}`, `${s} — đổi ${p} (${base[p] ?? target[p] ?? 'mặc định'} → ${v}) khi hover / focus → nhảy vị trí. Hover chỉ đổi nền, màu, border-color, box-shadow, outline, opacity, transform.`)
      }
    }
  }

  if (file.endsWith('.vue') && !core) {
    const base = path.basename(file)
    /* 1b. Component trùng loại mds-ui đã có */
    if (/(Popover|Dropdown|DropDown|Drawer|Picker|Combobox|ComboBox|Select|ContextMenu|Tooltip)\w*\.vue$/.test(base) && !/Demo\.vue$/.test(base))   // *Demo.vue = ví dụ trang tài liệu, không phải component
      add('trung-component', 1, base, `${base} — app tự tạo component cùng loại với mds-ui (AppPopover / DropdownMenu / AppDrawer / AppCombobox / AppDatePicker / v-tip). Dùng component mds-ui; thiếu biến thể thì thêm prop vào mds-ui.`)
    /* 1c. Màn hình không dựng bằng AppPage */
    const tpl = (text.match(/<template>([\s\S]*)<\/template>/) || [])[1] || ''
    if (/\/(pages|views)\//.test(r) && !r.startsWith('mds-docs/') && !/<AppPage[\s>]/.test(tpl) && /<h[12][\s>]|class="[^"]*page-header/.test(tpl))
      add('khung-trang', 1, base, `${base} — màn hình tự dựng hàng tiêu đề / lề trang. Dựng bằng <AppPage> (+ <AppMasterDetail> / <AppDrawer>) theo /ds/layout — mẫu: mds-docs/src/demos/LayoutListDemo.vue.`)
  }
  return out
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name) || e.name.startsWith('.') && e.isDirectory()) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, acc); else if (/\.(vue|css)$/.test(e.name)) acc.push(p)
  }
  return acc
}

const loadBaseline = () => { try { return JSON.parse(fs.readFileSync(BASELINE, 'utf8')).files || {} } catch { return {} } }
const fmt = v => `  ${v.file}:${v.line}  [${v.rule}]  ${v.msg}`

function newOnly(viol, baseline) {
  const left = {}
  for (const k of baseline[viol[0]?.file] || []) left[k] = (left[k] || 0) + 1
  return viol.filter(v => (left[v.key] > 0 ? (left[v.key]--, false) : true))
}

function touchState(file) {
  try {
    fs.mkdirSync(path.dirname(STATE), { recursive: true })
    const st = (() => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')) } catch { return {} } })()
    st.lastEdit = Date.now(); st.edited = [...new Set([...(st.edited || []), rel(file)])].slice(-50)
    fs.writeFileSync(STATE, JSON.stringify(st, null, 2))
  } catch { /* không chặn việc sửa file vì lỗi ghi trạng thái */ }
}

const args = process.argv.slice(2)
if (args.includes('--hook')) {
  let input = ''
  for await (const c of process.stdin) input += c
  let file
  try { const j = JSON.parse(input); file = j.tool_input?.file_path || j.tool_response?.filePath } catch { process.exit(0) }
  if (!file || !/\.(vue|css)$/.test(file) || !path.resolve(file).startsWith(ROOT + path.sep) || !fs.existsSync(file)) process.exit(0)
  if ([...SKIP_DIRS].some(d => rel(file).split('/').includes(d))) process.exit(0)
  touchState(file)
  const fresh = newOnly(lintFile(file), loadBaseline())
  if (!fresh.length) process.exit(0)
  process.stderr.write(`⛔ ui-lint: ${fresh.length} lỗi giao diện MỚI trong ${rel(file)} — sửa ngay trước khi làm tiếp (quy chuẩn mds-ui, skill mds-webapp-developer › "3 khoá bắt buộc"):\n${fresh.map(fmt).join('\n')}\nCố ý giữ? thêm /* ui-lint-ok: <lý do> */ vào khối CSS đó và nói rõ lý do với người dùng.\n`)
  process.exit(2)
} else if (args.includes('--baseline')) {
  const files = {}
  let n = 0
  for (const f of walk(ROOT)) { const v = lintFile(f); if (v.length) { files[rel(f)] = v.map(x => x.key); n += v.length } }
  fs.writeFileSync(BASELINE, JSON.stringify({ note: 'Lỗi CŨ ghi nhận khi bật ui-lint (app cũ sửa dần). Hook chỉ chặn lỗi MỚI. Sửa xong lỗi cũ thì chạy lại --baseline để thu nhỏ danh sách.', created: new Date().toISOString().slice(0, 10), files }, null, 1))
  console.log(`Đã ghi baseline: ${n} lỗi cũ trong ${Object.keys(files).length} file → ${rel(BASELINE)}`)
} else {
  const targets = args.includes('--all') ? walk(ROOT) : args.filter(a => !a.startsWith('--')).map(a => path.resolve(a))
  const viol = targets.flatMap(f => lintFile(f))
  const byRule = viol.reduce((m, v) => (m[v.rule] = (m[v.rule] || 0) + 1, m), {})
  if (!args.includes('--summary')) console.log(viol.map(fmt).join('\n'))
  console.log(`\n${viol.length} lỗi`, JSON.stringify(byRule))
  process.exit(viol.length ? 1 : 0)
}
