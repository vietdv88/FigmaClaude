import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

/* ═══════════════════════════════════════════════════════════════════════════
   Kho dữ liệu SQLite — mỗi bản ghi là 1 JSON document (cùng cấu trúc object phía app).
   kind: users | projects | iterations | tasks | history | closings | months | config
   File DB nằm trong DATA_DIR (mount volume khi chạy Docker để không mất dữ liệu).
   ═══════════════════════════════════════════════════════════════════════════ */

const DATA_DIR = process.env.DATA_DIR || path.resolve('data')
fs.mkdirSync(DATA_DIR, { recursive: true })
export const DB_FILE = path.join(DATA_DIR, 'chamdiem.db')

const db = new DatabaseSync(DB_FILE)
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS docs (
    kind       TEXT NOT NULL,
    id         TEXT NOT NULL,
    project_id TEXT,
    data       TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (kind, id)
  );
  CREATE INDEX IF NOT EXISTS docs_kind_project ON docs (kind, project_id);
  -- Lịch sử tra theo công việc (không nạp cả bảng vào RAM)
  CREATE INDEX IF NOT EXISTS docs_kind_task ON docs (kind, json_extract(data, '$.taskId'));
  -- Lưu trữ nén dữ liệu cũ: mỗi dòng = 1 năm × 1 dự án (gzip JSON { tasks, history, iterations })
  CREATE TABLE IF NOT EXISTS archive (
    key TEXT PRIMARY KEY, year TEXT NOT NULL, project_id TEXT, tasks INTEGER, history INTEGER, iterations INTEGER,
    raw_bytes INTEGER, bytes INTEGER, data BLOB NOT NULL, archived_at TEXT NOT NULL
  );
`)

const qAll     = db.prepare('SELECT data FROM docs WHERE kind = ?')
const qGet     = db.prepare('SELECT data FROM docs WHERE kind = ? AND id = ?')
const qPut     = db.prepare(`INSERT INTO docs (kind, id, project_id, data, updated_at) VALUES (?, ?, ?, ?, datetime('now'))
                             ON CONFLICT (kind, id) DO UPDATE SET project_id = excluded.project_id, data = excluded.data, updated_at = excluded.updated_at`)
const qDel     = db.prepare('DELETE FROM docs WHERE kind = ? AND id = ?')
const qCount   = db.prepare('SELECT COUNT(*) AS n FROM docs')
const qByTask  = db.prepare(`SELECT data FROM docs WHERE kind = ? AND json_extract(data, '$.taskId') = ?`)

/* Kind “lạnh”: KHÔNG giữ trong RAM (lớn, ít đọc) — đọc thẳng SQLite khi cần (lịch sử theo từng công việc) */
const COLD = new Set(['history'])
/** Bản ghi của 1 công việc (kind có trường taskId — VD lịch sử) */
export const byTask = (kind, taskId) => qByTask.all(kind, taskId).map(r => JSON.parse(r.data))

/* ── Bộ nhớ đệm: mỗi kind đọc từ SQLite 1 lần, sau đó đọc trong RAM (máy chủ chạy 1 tiến trình) ──
   all() trả về object trong bộ đệm — CHỈ ĐỌC (muốn sửa: copy rồi put). get() trả về bản copy. */
const cache = new Map()   // kind → Map(id → object)
const bucket = kind => {
  let m = cache.get(kind)
  if (!m) { m = new Map(qAll.all(kind).map(r => { const o = JSON.parse(r.data); return [o.id, o] })); cache.set(kind, m) }
  return m
}
let listCache = new Map()   // kind → mảng (tạo lại khi kind đó đổi)

/* ── Nhật ký thay đổi: realtime gửi đúng phần thay đổi cho từng người ── */
let seq = 0
const log = []            // { seq, kind, id, prev, next } — next = null khi xóa
const LOG_MAX = 5000
const record = (kind, id, prev, next) => {
  log.push({ seq: ++seq, kind, id, prev, next })
  if (log.length > LOG_MAX) log.splice(0, log.length - LOG_MAX)
}
export const currentSeq = () => seq
/** Các thay đổi sau mốc `from` (null = mốc quá cũ, đã bị cắt khỏi nhật ký) */
// seq trong nhật ký liên tục → cắt theo chỉ số (không lọc cả 5000 dòng cho TỪNG kết nối realtime)
export const changesSince = from => (log.length && log[0].seq > from + 1 ? null : log.length ? log.slice(Math.max(0, from - log[0].seq + 1)) : [])
/* Phiên bản dữ liệu theo kind — tăng mỗi lần ghi / xóa; dùng làm khóa bộ nhớ đệm (VD phạm vi xem của từng người) */
const ver = new Map()
let epoch = 0
const bump = kind => ver.set(kind, (ver.get(kind) || 0) + 1)
export const kindVersion = kind => `${epoch}.${ver.get(kind) || 0}`

export const all = kind => {
  if (COLD.has(kind)) return qAll.all(kind).map(r => JSON.parse(r.data))   // hiếm dùng (dọn dữ liệu cũ)
  let l = listCache.get(kind)
  if (!l) { l = [...bucket(kind).values()]; listCache.set(kind, l) }
  return l
}
export const get = (kind, id) => {
  if (COLD.has(kind)) { const r = qGet.get(kind, id); return r ? JSON.parse(r.data) : null }
  const o = bucket(kind).get(id); return o ? structuredClone(o) : null }
export const put = (kind, obj) => {
  const copy = structuredClone(obj)
  qPut.run(kind, obj.id, obj.projectId ?? null, JSON.stringify(copy))
  if (COLD.has(kind)) { record(kind, obj.id, null, copy); return obj }
  const m = bucket(kind), prev = m.get(obj.id) ?? null
  m.set(obj.id, copy); listCache.delete(kind); bump(kind)
  record(kind, obj.id, prev, copy)
  return obj
}
export const del = (kind, id) => {
  qDel.run(kind, id)
  if (COLD.has(kind)) { record(kind, id, null, null); return }
  const m = bucket(kind), prev = m.get(id) ?? null
  if (m.delete(id)) { listCache.delete(kind); bump(kind); record(kind, id, prev, null) }
}
export const isEmpty = () => qCount.get().n === 0

export function tx(fn) {
  const startSeq = seq
  db.exec('BEGIN')
  try { const r = fn(); db.exec('COMMIT'); return r }
  catch (e) {
    db.exec('ROLLBACK')
    // Hủy giao dịch: bỏ bộ đệm (đọc lại từ DB) + bỏ các thay đổi chưa thành công khỏi nhật ký
    cache.clear(); listCache = new Map(); epoch++
    while (log.length && log[log.length - 1].seq > startSeq) log.pop()
    throw e
  }
}

/* ── Lưu trữ nén ── */
const qArcList = db.prepare('SELECT key, year, project_id AS projectId, tasks, history, iterations, raw_bytes AS rawBytes, bytes, archived_at AS archivedAt FROM archive ORDER BY year DESC, project_id')
const qArcGet  = db.prepare('SELECT data FROM archive WHERE key = ?')
const qArcPut  = db.prepare(`INSERT INTO archive (key, year, project_id, tasks, history, iterations, raw_bytes, bytes, data, archived_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                             ON CONFLICT (key) DO UPDATE SET tasks = excluded.tasks, history = excluded.history, iterations = excluded.iterations,
                             raw_bytes = excluded.raw_bytes, bytes = excluded.bytes, data = excluded.data, archived_at = excluded.archived_at`)
const qArcDel  = db.prepare('DELETE FROM archive WHERE key = ?')
export const archiveList = () => qArcList.all().map(r => ({ ...r }))
export const archiveGet = key => { const r = qArcGet.get(key); return r ? JSON.parse(zlib.gunzipSync(r.data)) : null }
export function archivePut(key, a) {
  const raw = Buffer.from(JSON.stringify(a)), gz = zlib.gzipSync(raw, { level: 9 })
  qArcPut.run(key, a.year, a.projectId || null, a.tasks.length, a.history.length, a.iterations.length, raw.length, gz.length, gz)
}
export const archiveDel = key => qArcDel.run(key)
/** Thu gọn file DB sau khi nén nhiều (trả lại dung lượng trống) */
export const vacuum = () => db.exec('VACUUM')

/* Cấu hình hệ số + thông số tháng lưu dạng document có id cố định */
export const getConfig = () => get('config', 'main')?.value ?? null
export const setConfig = value => put('config', { id: 'main', value })
