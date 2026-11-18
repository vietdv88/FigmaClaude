/* ═══ Kéo tri thức ĐÃ DẠY trên mds-docs (/ds) vào skill → các app mới kế thừa ═══
   Nguồn thật nằm trên máy chủ (CMS): data/pages/*.json (nội dung từng trang /ds) + data/ava-notes.json (tri thức tự nhập).
   Chạy: node scripts/sync-skill.mjs [thư-mục-dữ-liệu]
     - Mặc định đọc mds-docs/.live (tạo bằng scripts/pull-live.sh). Trên máy chủ có thể trỏ thẳng /opt/mds-docs/data.
   Sinh (KHÔNG sửa tay) trong .claude/skills/mds-webapp-developer/references/:
     ds-notes.md       — tri thức tự nhập (đang bật)
     ds-pages.md       — mục lục các trang /ds (nhóm · tên · tóm tắt · file demo mẫu)
     ds/<slug>.md      — nội dung đầy đủ từng trang (đọc khi làm đúng loại control / màn đó)
   Ưu tiên khi mâu thuẫn: ds-notes > trang /ds > phần còn lại của skill. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.resolve(ROOT, '..')
const LIVE = path.resolve(process.argv[2] || path.join(ROOT, '.live'))
const REF = path.join(REPO, '.claude/skills/mds-webapp-developer/references')
const DEMOS = path.join(ROOT, 'src/demos')
const pascal = s => s.split(/[-_]/).map(w => w[0]?.toUpperCase() + w.slice(1)).join('')
const stamp = new Date().toISOString().slice(0, 10)

const readJson = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return null } }
const pagesDir = fs.existsSync(path.join(LIVE, 'pages')) ? path.join(LIVE, 'pages') : null
if (!pagesDir) { console.error('✗ Không thấy', path.join(LIVE, 'pages'), '— chạy scripts/pull-live.sh trước'); process.exit(1) }

/* 1) Trang /ds */
const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.json')).map(f => readJson(path.join(pagesDir, f))).filter(p => p?.slug)
  .sort((a, b) => (a.group || '').localeCompare(b.group || '', 'vi') || (a.order ?? 0) - (b.order ?? 0))
fs.rmSync(path.join(REF, 'ds'), { recursive: true, force: true })
fs.mkdirSync(path.join(REF, 'ds'), { recursive: true })
const demoFile = name => { const f = `${pascal(name)}Demo.vue`; return fs.existsSync(path.join(DEMOS, f)) ? `mds-docs/src/demos/${f}` : null }
const rows = []
for (const p of pages) {
  const demos = []
  const body = (p.body || '').replace(/^::: demo ([\w-]+)[^\n]*\n:::\s*$/gm, (_, n) => { const f = demoFile(n); demos.push(f || n); return f ? `> Ví dụ chạy thật: \`${f}\`` : `> Ví dụ: demo \`${n}\`` })
  fs.writeFileSync(path.join(REF, 'ds', `${p.slug}.md`), `<!-- SINH TỰ ĐỘNG từ mds-docs /ds/${p.slug} (${stamp}) — không sửa tay -->\n# ${p.title}\n\n${p.summary ? `> ${p.summary}\n\n` : ''}${body.trim()}\n`)
  rows.push(`| ${p.group || ''} | [${p.title}](ds/${p.slug}.md) | ${(p.summary || '').replace(/\|/g, '/').replace(/\n/g, ' ')} | ${[...new Set(demos)].map(d => `\`${d}\``).join(' ')} |`)
}
fs.writeFileSync(path.join(REF, 'ds-pages.md'), `<!-- SINH TỰ ĐỘNG bằng mds-docs/scripts/sync-skill.mjs (${stamp}) — không sửa tay -->
# Mục lục trang tài liệu /ds (mds-docs)

Đây là quy chuẩn người dùng đã **dạy và làm mẫu** trên trang tài liệu /ds. **Khi dựng control / màn nào, mở đúng trang tương ứng trong \`ds/\`** (và file demo mẫu nếu có) rồi làm theo. Khi mâu thuẫn với phần còn lại của skill: \`ds-notes.md\` > trang /ds > skill.

| Nhóm | Trang | Tóm tắt | Demo mẫu (code chạy thật) |
|---|---|---|---|
${rows.join('\n')}
`)

/* 2) Tri thức tự nhập */
const nf = [path.join(LIVE, 'ava-notes.json')].find(f => fs.existsSync(f))
const notes = (nf ? readJson(nf)?.notes : null) || []
const on = notes.filter(n => n.enabled !== false)
fs.writeFileSync(path.join(REF, 'ds-notes.md'), `<!-- SINH TỰ ĐỘNG từ /ds/quan-tri?tab=notes (${stamp}) — không sửa tay -->
# Tri thức người dùng tự nhập (ưu tiên CAO NHẤT)

Quy tắc người dùng đã dạy trực tiếp. Mâu thuẫn với phần khác của skill thì **làm theo mục này**. Mục “luôn áp dụng” phải tuân thủ ở mọi màn.

${on.map(n => `## ${n.title}${n.always ? '  ⛔ luôn áp dụng' : ''}\n\n${(n.body || '').trim()}\n`).join('\n')}`)
console.log(`✓ ${pages.length} trang /ds → references/ds/ · ${on.length}/${notes.length} tri thức → references/ds-notes.md`)
