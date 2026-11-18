/* Kéo dữ liệu /ds thật về mds-docs/.live rồi sinh tri thức cho skill (sync-skill.mjs).
   Chạy: node scripts/pull-live.mjs [--max-age=<giờ>]   (có --max-age: bỏ qua nếu dữ liệu còn mới hơn số giờ đó)
   - Trang /ds: đọc công khai qua http://10.1.39.11/api/ds/pages (không cần mật khẩu).
   - Tri thức tự nhập (ava-notes.json): cần quyền biên tập → kéo bằng ssh khoá riêng ~/.ssh/mds_docs_pull (nếu có);
     không có khoá thì GIỮ bản ava-notes.json cũ và cảnh báo. */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LIVE = path.join(ROOT, '.live')
const HOST = process.env.MDS_DOCS_HOST || 'http://10.1.39.11'
const KEY = path.join(os.homedir(), '.ssh/mds_docs_pull')
const maxAge = Number((process.argv.find(a => a.startsWith('--max-age=')) || '').split('=')[1])
const stampFile = path.join(LIVE, '.pulled-at')

if (maxAge && fs.existsSync(stampFile) && (Date.now() - fs.statSync(stampFile).mtimeMs) < maxAge * 3600e3) {
  console.log(`· dữ liệu /ds còn mới (< ${maxAge}h) — bỏ qua`); process.exit(0)
}
fs.mkdirSync(path.join(LIVE, 'pages'), { recursive: true })
const get = async u => { const r = await fetch(HOST + u, { signal: AbortSignal.timeout(15000) }); if (!r.ok) throw new Error(`${u} → ${r.status}`); return r.json() }

try {
  const list = (await get('/api/ds/pages')).pages
  const keep = new Set()
  for (const p of list) {
    const { page } = await get('/api/ds/pages/' + encodeURIComponent(p.slug))
    fs.writeFileSync(path.join(LIVE, 'pages', p.slug + '.json'), JSON.stringify(page, null, 1)); keep.add(p.slug + '.json')
  }
  for (const f of fs.readdirSync(path.join(LIVE, 'pages'))) if (!keep.has(f)) fs.rmSync(path.join(LIVE, 'pages', f))
  console.log(`✓ ${list.length} trang /ds`)
} catch (e) { console.error('✗ Không kéo được trang /ds:', e.message, '— dùng bản cũ trong .live/'); }

if (fs.existsSync(KEY)) {
  try {
    const out = execFileSync('ssh', ['-i', KEY, '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=8', 'ansible@10.1.39.11', 'cat /opt/mds-docs/data/ava-notes.json'], { encoding: 'utf8' })
    JSON.parse(out); fs.writeFileSync(path.join(LIVE, 'ava-notes.json'), out); console.log('✓ ava-notes.json')
  } catch (e) { console.error('⚠ Không kéo được ava-notes.json (ssh):', String(e.message).split('\n')[0], '— giữ bản cũ') }
} else console.error('⚠ Chưa có khoá ssh ~/.ssh/mds_docs_pull — giữ ava-notes.json cũ (tri thức tự nhập có thể chưa mới nhất)')

fs.writeFileSync(stampFile, new Date().toISOString())
execFileSync(process.execPath, [path.join(ROOT, 'scripts/sync-skill.mjs'), LIVE], { stdio: 'inherit' })
