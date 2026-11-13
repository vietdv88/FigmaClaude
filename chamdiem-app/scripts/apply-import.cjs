/* Nạp file JSON do scripts/import-makt.py tạo vào database PD Point.
   Chạy trên máy chủ khi DỊCH VỤ ĐÃ DỪNG (đọc/ghi thẳng SQLite, máy chủ đang chạy sẽ không thấy thay đổi):
     sudo systemctl stop pdpoint && node apply-import.cjs <file.json> [chamdiem.db] && sudo systemctl start pdpoint
   Tự sao lưu DB trước khi ghi. Dự án đã có (cùng mã) → nạp vào dự án đó (giữ tên, khối; thêm thành viên);
   dự án đó đã có vòng lặp trùng tên → dừng. Người dùng trùng tài khoản (mã) → dùng lại. */
const fs = require('node:fs')
const { DatabaseSync } = require('node:sqlite')
const [file, dbFile = 'chamdiem.db'] = process.argv.slice(2)
const data = JSON.parse(fs.readFileSync(file, 'utf8'))
const db = new DatabaseSync(dbFile)
const all = kind => db.prepare('select data from docs where kind = ?').all(kind).map(r => JSON.parse(r.data))
const put = (kind, o) => db.prepare(`insert into docs (kind, id, project_id, data, updated_at) values (?, ?, ?, ?, datetime('now'))
  on conflict (kind, id) do update set project_id = excluded.project_id, data = excluded.data, updated_at = excluded.updated_at`).run(kind, o.id, o.projectId ?? null, JSON.stringify(o))

const target = all('projects').find(p => p.id === data.project.id || (p.code || '').toLowerCase() === data.project.code.toLowerCase())
const PID = target?.id ?? data.project.id
const dupIters = all('iterations').filter(i => i.projectId === PID && data.iterations.some(x => x.name === i.name))
if (dupIters.length) { console.error(`Dự án đã có vòng lặp ${dupIters.map(i => i.name).join(', ')} — dừng, không ghi đè`); process.exit(1) }
const backup = `backup-${new Date().toISOString().slice(0, 10)}-truoc-nhap-${data.project.code}.db`
db.exec(`VACUUM INTO '${backup}'`)

const now = new Date().toISOString()
const admin = all('users').find(u => u.role === 'admin' && u.status === 'active')
// Khối: tìm theo tên trong danh mục (đã sửa ở Cài đặt) — không có thì để trống
const divisions = (all('catalog').find(c => c.id === 'divisions')?.items) ?? null
const DEFAULT_ID = { 'Khối sản phẩm Doanh nghiệp': 'dv3' }
const divisionId = divisions ? (divisions.find(d => d.name === data.project.divisionName)?.id ?? '') : (DEFAULT_ID[data.project.divisionName] ?? '')

// Người dùng: trùng tài khoản (mã) với người đã có → dùng người cũ
const existing = all('users'), idMap = {}, created = []
for (const u of data.users) {
  const old = existing.find(x => (x.code || '').toLowerCase() === u.code.toLowerCase())
  if (old) { idMap[u.id] = old.id; continue }
  idMap[u.id] = u.id; created.push({ ...u, createdAt: now })
}
const remap = id => (id ? idMap[id] ?? id : '')

db.exec('BEGIN')
created.forEach(u => put('users', u))
const { divisionName, ...p } = data.project
const members = p.memberIds.map(remap)
const proj = target
  ? { ...target, memberIds: [...new Set([...(target.memberIds ?? []), ...members])], divisionId: target.divisionId || divisionId }
  : { ...p, divisionId, memberIds: [...new Set(members)], memberRoles: {}, createdBy: admin?.id ?? '' }
put('projects', proj)
data.iterations.forEach(i => put('iterations', { ...i, projectId: PID }))
data.tasks.forEach(t => put('tasks', { ...t, projectId: PID, pdId: remap(t.pdId), baId: remap(t.baId), createdBy: admin?.id ?? '', createdAt: now }))
db.exec('COMMIT')
console.log(`Sao lưu: ${backup}`)
console.log(`Đã nạp vào ${target ? 'dự án có sẵn' : 'dự án mới'} ${proj.code} – ${proj.name} (khối: ${proj.divisionId || 'trống'}) · ${data.iterations.length} vòng lặp · ${data.tasks.length} công việc · ${created.length} người mới (${data.users.length - created.length} dùng lại)`)
