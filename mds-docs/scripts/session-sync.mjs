#!/usr/bin/env node
/* ═══ Đồng bộ tri thức /ds → skill MỖI PHIÊN Claude (hook SessionStart) + báo NHỮNG GÌ MỚI ĐỔI ═══
   Người dùng cập nhật chuẩn ở 3 nơi: ví dụ mẫu (mds-docs/src/demos — code, có sẵn trong repo) · trang /ds (CMS) · tri thức AVA tự nhập.
   Hook này: chạy pull-live.mjs (bỏ qua nếu bản kéo về < 1 giờ) → so với bản trước → in ra phần thay đổi để Claude đọc NGAY đầu phiên
   (trang /ds nào mới / sửa, dòng tri thức tự nhập nào thêm / bỏ, ví dụ mẫu nào đổi kể từ lần đồng bộ trước).
   Chạy tay: node mds-docs/scripts/session-sync.mjs [--max-age=<giờ>] [--text]   (--text: in chữ thường thay vì JSON của hook) */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.resolve(ROOT, '..')
const REF = path.join(REPO, '.claude/skills/mds-webapp-developer/references')
const DEMOS = path.join(ROOT, 'src/demos')
const SNAP = path.join(ROOT, '.live/.session-snapshot.json')
const maxAge = (process.argv.find(a => a.startsWith('--max-age=')) || '--max-age=1').split('=')[1]
const asText = process.argv.includes('--text')

const hash = f => crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex').slice(0, 12)
const list = (dir, re) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => re.test(f)) : [])
function snapshot() {
  const pages = Object.fromEntries(list(path.join(REF, 'ds'), /\.md$/).map(f => [f.replace(/\.md$/, ''), hash(path.join(REF, 'ds', f))]))
  const demos = Object.fromEntries(list(DEMOS, /Demo\.vue$/).map(f => [f, hash(path.join(DEMOS, f))]))
  const notes = fs.existsSync(path.join(REF, 'ds-notes.md')) ? fs.readFileSync(path.join(REF, 'ds-notes.md'), 'utf8').split('\n').filter(l => /^\s*[-*]|^\d+\./.test(l)).map(l => l.trim()) : []
  return { at: new Date().toISOString(), pages, demos, notes }
}
const titleOf = slug => { try { return (fs.readFileSync(path.join(REF, 'ds', slug + '.md'), 'utf8').match(/^# (.+)$/m) || [])[1] || slug } catch { return slug } }

const prev = (() => { try { return JSON.parse(fs.readFileSync(SNAP, 'utf8')) } catch { return null } })()
let pullMsg = ''
try {
  pullMsg = execFileSync(process.execPath, [path.join(ROOT, 'scripts/pull-live.mjs'), `--max-age=${maxAge}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 90000 }).trim()
} catch (e) { pullMsg = '⚠ Không kéo được tri thức /ds: ' + String(e.message).split('\n')[0] }
const now = snapshot()
fs.mkdirSync(path.dirname(SNAP), { recursive: true })
fs.writeFileSync(SNAP, JSON.stringify(now))

const lines = []
if (prev) {
  const diffKeys = (a, b) => ({ added: Object.keys(b).filter(k => !(k in a)), changed: Object.keys(b).filter(k => k in a && a[k] !== b[k]), removed: Object.keys(a).filter(k => !(k in b)) })
  const pg = diffKeys(prev.pages, now.pages), dm = diffKeys(prev.demos, now.demos)
  const oldNotes = new Set(prev.notes), newNotes = new Set(now.notes)
  const nAdd = now.notes.filter(n => !oldNotes.has(n)), nDel = prev.notes.filter(n => !newNotes.has(n))
  if (nAdd.length || nDel.length) {
    lines.push(`• Tri thức tự nhập (references/ds-notes.md — ưu tiên CAO NHẤT): +${nAdd.length} / −${nDel.length} dòng`)
    for (const n of nAdd.slice(0, 15)) lines.push(`   + ${n.slice(0, 220)}`)
    for (const n of nDel.slice(0, 5)) lines.push(`   − ${n.slice(0, 160)}`)
  }
  if (pg.added.length) lines.push(`• Trang /ds MỚI: ${pg.added.map(s => `${titleOf(s)} (references/ds/${s}.md)`).join(' · ')}`)
  if (pg.changed.length) lines.push(`• Trang /ds đã sửa: ${pg.changed.map(s => `${titleOf(s)} (references/ds/${s}.md)`).join(' · ')}`)
  if (pg.removed.length) lines.push(`• Trang /ds đã xoá: ${pg.removed.join(', ')}`)
  if (dm.added.length || dm.changed.length) lines.push(`• Ví dụ mẫu (mds-docs/src/demos) mới / sửa: ${[...dm.added, ...dm.changed].join(', ')}`)
}

let msg
if (!prev) msg = `Tri thức /ds đã đồng bộ (lần đầu ghi mốc so sánh). ${pullMsg.split('\n').pop()}`
else if (!lines.length) msg = ''
else msg = [
  `📚 Chuẩn MDS vừa được cập nhật kể từ lần đồng bộ trước (${prev.at.slice(0, 16).replace('T', ' ')}). ĐỌC phần liên quan trước khi làm giao diện — ưu tiên: ds-notes > trang /ds > skill:`,
  ...lines,
  'Nếu quy tắc mới kiểm được bằng máy (kích thước, hover, bố cục, control nào dùng cho việc gì…) → đề xuất với người dùng thêm vào mds-ui (component / token) và ui-lint / ui-guard để khoá lại, đừng chỉ ghi nhớ.',
].join('\n')
if (/⚠|✗/.test(pullMsg)) msg = (msg ? msg + '\n' : '') + pullMsg.split('\n').filter(l => /⚠|✗/.test(l)).join('\n')

if (asText) { console.log(msg || 'Không có thay đổi tri thức /ds kể từ lần đồng bộ trước.'); process.exit(0) }
if (msg) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: msg } }))
process.exit(0)
