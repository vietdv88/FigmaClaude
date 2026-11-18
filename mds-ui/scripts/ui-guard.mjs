#!/usr/bin/env node
/* ═══ ui-guard — kiểm tra giao diện CHẠY THẬT trước khi báo xong (bắt buộc; hook Stop chặn kết thúc nếu chưa chạy sau lần sửa cuối) ═══
   Mở từng URL ở 1366 và 375 bằng Playwright rồi đo:
     · NHẢY KHI HOVER: rê chuột lên từng thứ bấm được → mọi phần tử khác phải đứng yên (lệch ≥ 1px = lỗi)
     · XUỐNG DÒNG: chữ trong nút / tab / tag / item menu / tiêu đề / tiêu đề cột bị gãy thành 2 dòng
     · TRÀN KHUNG (overflow-check.js) · VIỀN ĐÔI (double-border-check.js) · LỖI JS (pageerror)
   Cách dùng:
     node mds-ui/scripts/ui-guard.mjs <url> [<url>…] [--widths 1366,375] [--scope ".app-page"]
          [--step "scroll:.khung"] [--step "click:.btn--primary"] [--step "hover:.row"] [--step "wait:500"] [--step "fill:.search input=abc"]
          [--ignore ".chart"] [--max-hover 150] [--no-hover]
       --step chạy theo thứ tự trước khi đo (mở popup / drawer / menu để đo cả lớp nổi).
     node mds-ui/scripts/ui-guard.mjs --skip "lý do"   chỉ khi KHÔNG chạy được app (phải báo lý do cho người dùng)
     node mds-ui/scripts/ui-guard.mjs --stop-gate       (hook Stop) chặn kết thúc lượt nếu đã sửa .vue/.css mà chưa chạy ui-guard đạt */
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const STATE = path.join(ROOT, '.ui-guard/state.json')
const REFS = path.join(ROOT, '.claude/skills/mds-webapp-developer/references')
const readState = () => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')) } catch { return {} } }
const writeState = patch => { fs.mkdirSync(path.dirname(STATE), { recursive: true }); fs.writeFileSync(STATE, JSON.stringify({ ...readState(), ...patch }, null, 2)) }

const argv = process.argv.slice(2)
const opt = (name, def) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : def }
const opts = name => argv.flatMap((a, i) => (a === name ? [argv[i + 1]] : []))

/* ── Hook Stop ── */
if (argv.includes('--stop-gate')) {
  let input = ''
  for await (const c of process.stdin) input += c
  let j = {}; try { j = JSON.parse(input || '{}') } catch { /* bỏ qua */ }
  const st = readState()
  if (j.stop_hook_active || !st.lastEdit || (st.lastPass && st.lastPass >= st.lastEdit)) process.exit(0)
  const files = (st.edited || []).slice(-12).join(', ')
  process.stdout.write(JSON.stringify({
    decision: 'block',
    reason: `ui-guard: đã sửa giao diện (${files}) nhưng CHƯA kiểm tra trên trình duyệt sau lần sửa cuối. Chạy app rồi: node mds-ui/scripts/ui-guard.mjs <url các màn vừa sửa> [--step "click:…" để mở popup / drawer / menu vừa làm] — sửa hết lỗi (nhảy khi hover, xuống dòng, tràn khung, viền đôi, lỗi JS) tới khi đạt. Không chạy được app (thiếu server, chỉ sửa tài liệu…) → node mds-ui/scripts/ui-guard.mjs --skip "<lý do>" và nói rõ với người dùng là CHƯA kiểm tra trên trình duyệt.`,
  }))
  process.exit(0)
}

if (argv.includes('--skip')) {
  const why = opt('--skip', '').trim()
  if (!why) { console.error('Cần lý do: --skip "<lý do>"'); process.exit(1) }
  writeState({ lastPass: Date.now(), lastPassInfo: { skipped: why } })
  console.log(`Đã ghi nhận BỎ QUA kiểm tra trình duyệt: ${why} — phải báo người dùng.`)
  process.exit(0)
}

/* ── Nạp Playwright (repo không cài ở gốc — dùng bản có sẵn trong monorepo) ── */
function loadPlaywright() {
  for (const base of ['playwright-figma-login', 'mds-docs', '.']) {
    try { return createRequire(path.join(ROOT, base, 'package.json'))('playwright') } catch { /* thử chỗ khác */ }
  }
  console.error('Không tìm thấy gói playwright. Cài: cd FigmaClaude/playwright-figma-login && npm i'); process.exit(3)
}

const urls = argv.filter((a, i) => /^https?:\/\//.test(a) && !['--step', '--scope', '--ignore'].includes(argv[i - 1]))
if (!urls.length) { console.error('Thiếu URL. VD: node mds-ui/scripts/ui-guard.mjs http://localhost:5173/khach-hang'); process.exit(1) }
const widths = opt('--widths', '1366,375').split(',').map(Number)
const scope = opt('--scope', 'body')
const steps = opts('--step')
const ignore = ['.sidebar', '[data-ui-guard-ignore]', 'canvas', ...opts('--ignore')].join(', ')
const maxHover = Number(opt('--max-hover', 150))
const doHover = !argv.includes('--no-hover')

/* ── Đo trong trang ── */
const IN_PAGE = `
window.__uig = {
  vis(el) { const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false; const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0 },
  name(el) { const c = typeof el.className === 'string' ? el.className.trim().split(/\\s+/).filter(x => !x.startsWith('data-v')).slice(0, 2).join('.') : ''; const t = (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 24); return el.tagName.toLowerCase() + (c ? '.' + c : '') + (t ? ' "' + t + '"' : '') },
  box(el) { let x = 0, y = 0; for (let e = el; e; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop } return [x, y, el.offsetWidth, el.offsetHeight] },
  snap(scope, ignore) {
    const out = new Map()
    for (const root of document.querySelectorAll(scope)) for (const el of root.querySelectorAll('*')) {
      if (!(el instanceof HTMLElement) || el.closest(ignore) || !el.offsetParent && getComputedStyle(el).position !== 'fixed') continue
      if (!el.offsetWidth || !el.offsetHeight) continue
      out.set(el, this.box(el))
    }
    return out
  },
  targets(scope, ignore, max) {
    const sel = 'button, a[href], [role=button], [role=tab], [role=option], [role=menuitem], [tabindex="0"], .dt-row, tbody tr, .dropdown-menu__item, .menu-list__item, label, input, textarea, .surface[tabindex], .card[tabindex]'
    const seen = new Set(), out = []
    // thứ bấm được = phần tử tương tác chuẩn + MỌI phần tử có cursor: pointer (chip, card, item tự dựng…) — bỏ con lồng trong cha cũng pointer
    const cands = []
    for (const root of document.querySelectorAll(scope)) {
      cands.push(...root.querySelectorAll(sel))
      for (const el of root.querySelectorAll('*')) if (el instanceof HTMLElement && getComputedStyle(el).cursor === 'pointer' && !(el.parentElement && getComputedStyle(el.parentElement).cursor === 'pointer')) cands.push(el)
    }
    for (const el of cands) {
      if (seen.has(el) || el.closest(ignore) || !this.vis(el)) continue
      const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + Math.min(r.height / 2, 10)
      if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) continue
      const hit = document.elementFromPoint(cx, cy); if (!hit || !(el === hit || el.contains(hit))) continue
      seen.add(el); el.dataset.uig = out.length; out.push({ i: out.length, x: cx, y: cy, name: this.name(el) })
      if (out.length >= max) break
    }
    return out
  },
  rest: null,
  takeRest(scope, ignore) { this.rest = this.snap(scope, ignore) },
  diff(scope, ignore, hoverIdx) {
    const now = this.snap(scope, ignore), hovered = document.querySelector('[data-uig="' + hoverIdx + '"]'), moved = []
    for (const [el, a] of this.rest) {
      const b = now.get(el); if (!b) continue
      const d = a.map((v, k) => b[k] - v)
      if (d.some(v => Math.abs(v) >= 1)) moved.push({ el: this.name(el), self: el === hovered, d })
    }
    return moved.sort((p, q) => Math.max(...q.d.map(Math.abs)) - Math.max(...p.d.map(Math.abs))).slice(0, 3)
  },
  wraps(scope, ignore) {
    const sel = '.btn, .btn-icon, .tab, [role=tab], .seg__item, .app-tag, .tag, .dt-status-badge, .badge, .badge-count, .dropdown-menu__item, .menu-list__item, .cb-list__item, .app-page__title, .page-header__title, .form-header__title, .mds-popover__title, .app-drawer__title, .dt-cell--header, th, .bulk-bar, .table-header, .tabs, .input-field__label, [role=menuitem]'
    const out = []
    for (const root of document.querySelectorAll(scope)) for (const el of root.querySelectorAll(sel)) {
      if (el.closest(ignore) || !this.vis(el)) continue
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        if (!n.textContent.trim()) continue
        const rg = document.createRange(); rg.selectNodeContents(n)
        const tops = new Set([...rg.getClientRects()].filter(r => r.width > 1).map(r => Math.round(r.top / 3)))
        if (tops.size > 1) { out.push(this.name(el) + ' — chữ "' + n.textContent.trim().slice(0, 30) + '" gãy ' + tops.size + ' dòng'); break }
      }
    }
    return [...new Set(out)]
  },
  /* Lớp chứa phần tử: lớp nổi gần nhất (position fixed / sticky-ngoài-luồng) — phần tử khác lớp không so đè / viền với nhau */
  layer(el) {
    for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.position === 'fixed' || cs.position === 'absolute' && cs.zIndex !== 'auto' && +cs.zIndex > 0 && e.offsetWidth > 120) return e }   // fixed, hoặc panel phủ absolute có z-index (drawer trong trang)
    return document.documentElement
  },
  /* Control đè lên nhau (nút quá dài trong khung hẹp, cụm nút bị bóp…) — so từng cặp control cùng hàng trong cùng cha gần nhất */
  overlaps(scope, ignore) {
    const sel = '.btn, .btn-icon, .app-tag, .tag, .badge, .dt-status-badge, .seg, .tab, input, .cb, .searchbox, [role=button], button'
    const els = []
    for (const root of document.querySelectorAll(scope)) for (const el of root.querySelectorAll(sel)) if (!el.closest(ignore) && this.vis(el) && !els.some(p => p.contains(el) || el.contains(p))) els.push(el)
    const out = []
    for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
      const a = els[i].getBoundingClientRect(), b = els[j].getBoundingClientRect()
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
      if (this.layer(els[i]) !== this.layer(els[j])) continue   // lớp nổi (popover, menu, drawer, dialog) đè lên trang là đúng
      if (ox > 1 && oy > 1 && getComputedStyle(els[i]).position !== 'absolute' && getComputedStyle(els[j]).position !== 'absolute')
        out.push(this.name(els[i]) + ' đè lên ' + this.name(els[j]) + ' (' + Math.round(ox) + 'px)')
      if (out.length > 20) return out
    }
    return out
  },
}`

const NO_ANIM = `addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '*,*::before,*::after{transition:none!important;animation-duration:0s!important;animation-delay:0s!important;caret-color:transparent!important}'; document.head.appendChild(s) })`
const LAYERS = '.mds-popover, .dropdown-menu, .cb-list, .date-pop, .form-panel, .app-drawer, .app-page__head, .table-header, .surface, .card, .table-panel, [role=dialog]'

const { chromium } = loadPlaywright()
const browser = await chromium.launch()
const report = []
let total = 0
for (const url of urls) for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: width < 600 ? 812 : 768 } })
  const errs = []
  page.on('pageerror', e => errs.push(e.message))
  for (const f of ['overflow-check.js', 'double-border-check.js']) await page.addInitScript(fs.readFileSync(path.join(REFS, f), 'utf8'))
  await page.addInitScript(NO_ANIM)
  await page.addInitScript(IN_PAGE)
  const issues = []
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => page.goto(url, { waitUntil: 'load' }))
    await page.waitForTimeout(600)
    for (const s of steps) {
      const [kind, ...rest] = s.split(':'), arg = rest.join(':')
      if (kind === 'click') await page.locator(arg).first().click()
      else if (kind === 'hover') await page.locator(arg).first().hover()
      else if (kind === 'wait') await page.waitForTimeout(Number(arg))
      else if (kind === 'fill') { const [sel, val] = arg.split('='); await page.locator(sel).first().fill(val) }
      else if (kind === 'press') await page.keyboard.press(arg)
      else if (kind === 'scroll') await page.locator(arg).first().scrollIntoViewIfNeeded()
      await page.waitForTimeout(250)
    }
    await page.mouse.move(1, 1)
    await page.waitForTimeout(150)

    if (await page.evaluate(s => [...document.querySelectorAll(s)].reduce((n, r) => n + r.querySelectorAll('*').length, 0), scope) < 10) issues.push(['trang trống', `vùng "${scope}" gần như không có nội dung — sai URL / app lỗi / chưa đăng nhập?`])
    for (const w of await page.evaluate(([s, ig]) => __uig.wraps(s, ig), [scope, ignore])) issues.push(['xuống dòng', w])
    for (const w of await page.evaluate(([s, ig]) => __uig.overlaps(s, ig), [scope, ignore])) issues.push(['đè lên nhau', w])
    // đánh dấu các khung cần đo tràn (lớp nổi, card, hàng tiêu đề, drawer…) trong vùng scope rồi đo bằng overflow-check.js
    await page.evaluate(([s, l]) => { for (const r of document.querySelectorAll(s)) for (const e of [r, ...r.querySelectorAll(l)]) if (e.matches(l) && __uig.vis(e)) e.dataset.uigBox = '1' }, [scope, LAYERS])
    for (const o of await page.evaluate(() => __overflow('[data-uig-box]'))) issues.push(['tràn khung', o])
    for (const b of await page.evaluate(s => __doubleBorders(s), scope)) issues.push(['viền đôi', typeof b === 'string' ? b : JSON.stringify(b)])

    if (doHover) {
      const targets = await page.evaluate(([s, ig, m]) => __uig.targets(s, ig, m), [scope, ignore, maxHover])
      await page.evaluate(([s, ig]) => __uig.takeRest(s, ig), [scope, ignore])
      for (const t of targets) {
        await page.mouse.move(t.x, t.y)
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
        const moved = await page.evaluate(([s, ig, i]) => __uig.diff(s, ig, i), [scope, ignore, t.i])
        if (moved.length) issues.push(['nhảy khi hover', `rê ${t.name} → ${moved.map(m => `${m.self ? '(chính nó) ' : ''}${m.el} lệch [x ${m.d[0]}, y ${m.d[1]}, rộng ${m.d[2]}, cao ${m.d[3]}]`).join(' · ')}`])
        await page.mouse.move(1, 1)
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
      }
    }
  } catch (e) { issues.push(['không chạy được', e.message.split('\n')[0]]) }
  for (const e of errs) issues.push(['lỗi JS', e])
  total += issues.length
  report.push(`\n■ ${url} @ ${width}px — ${issues.length ? issues.length + ' lỗi' : 'ĐẠT'}`)
  for (const [k, v] of issues) report.push(`  [${k}] ${v}`)
  await page.close()
}
await browser.close()
console.log(report.join('\n'))
if (total) { console.log(`\n⛔ ui-guard: ${total} lỗi — sửa (lỗi ở control dùng chung → sửa trong mds-ui) rồi chạy lại.`); process.exit(1) }
writeState({ lastPass: Date.now(), lastPassInfo: { urls, widths, steps } })
console.log('\n✓ ui-guard ĐẠT — đã ghi nhận.')
