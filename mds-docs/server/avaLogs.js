import fs from 'node:fs'
import crypto from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'

/* ═══ Lịch sử hỏi AVA của tài liệu Design System — CSDL SQLite RIÊNG (<dataDir>/ava.db), không dùng chung DB của app chủ ═══
   Mỗi lượt hỏi: câu hỏi, câu trả lời, người hỏi (hoặc khách theo IP), trang đang xem, chế độ trả lời, thời gian xử lý, kết quả,
   đánh giá của người hỏi (👍 / 👎 + góp ý). Giữ KEEP_DAYS ngày (MDS_AVA_KEEP_DAYS), tự dọn mỗi ngày. */

const KEEP_DAYS = Number(process.env.MDS_AVA_KEEP_DAYS ?? 180)

export function createAvaLogs(file) {
  const db = new DatabaseSync(file)
  db.exec(`PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY, at TEXT NOT NULL, user_id TEXT, user_name TEXT, ip TEXT, page TEXT, mode TEXT,
      question TEXT NOT NULL, answer TEXT, status TEXT NOT NULL, ms INTEGER, sources TEXT,
      vote TEXT, vote_note TEXT, voted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS logs_at ON logs(at);`)
  // Bản sau thêm ảnh đính kèm (đường dẫn file, JSON) — CSDL cũ thì thêm cột
  const colsNow = db.prepare('PRAGMA table_info(logs)').all().map(c => c.name)
  if (!colsNow.includes('images')) db.exec('ALTER TABLE logs ADD COLUMN images TEXT')
  // Token Google AI của từng lượt (đo chi phí thật): vào · phần vào được cache (rẻ ~4 lần) · ra · model — câu trả lời nhớ sẵn = 0
  for (const c of ['tok_in', 'tok_cached', 'tok_out']) if (!colsNow.includes(c)) db.exec(`ALTER TABLE logs ADD COLUMN ${c} INTEGER`)
  if (!colsNow.includes('model')) db.exec('ALTER TABLE logs ADD COLUMN model TEXT')
  /* Dùng lại câu trả lời cho câu hỏi giống (không gọi AI): reusable = lượt hỏi ĐẦU, không ảnh · parts = dấu tri thức đã dùng (JSON)
     reuse_of = lượt này lấy lại câu trả lời của lượt nào · no_reuse = ban biên tập tắt, không đưa ra gợi ý */
  for (const c of ['reusable', 'no_reuse']) if (!colsNow.includes(c)) db.exec(`ALTER TABLE logs ADD COLUMN ${c} INTEGER`)
  for (const c of ['parts', 'reuse_of']) if (!colsNow.includes(c)) db.exec(`ALTER TABLE logs ADD COLUMN ${c} TEXT`)
  db.exec('CREATE INDEX IF NOT EXISTS logs_reuse_of ON logs(reuse_of)')
  const ins = db.prepare(`INSERT INTO logs (id, at, user_id, user_name, ip, page, mode, question, answer, status, ms, sources, tok_in, tok_cached, tok_out, model, reusable, parts, reuse_of)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  // Ứng viên dùng lại: đã trả lời, không bị 👎, ban biên tập không tắt, không phải lượt dùng lại, không kèm ảnh, trong REUSE_DAYS ngày
  const candStmt = db.prepare(`SELECT id, at, mode, question, answer, sources, vote, parts, reusable FROM logs
    WHERE status = 'answered' AND (vote IS NULL OR vote <> 'down') AND (no_reuse IS NULL OR no_reuse = 0) AND reuse_of IS NULL
      AND images IS NULL AND question NOT LIKE '[Kèm%' AND (reusable IS NULL OR reusable = 1) AND at >= ? ORDER BY at DESC LIMIT 3000`)
  const reuseCounts = db.prepare('SELECT reuse_of id, COUNT(*) n FROM logs WHERE reuse_of IS NOT NULL GROUP BY reuse_of')
  const setNoReuse = db.prepare('UPDATE logs SET no_reuse = ? WHERE id = ?')
  const get = db.prepare('SELECT * FROM logs WHERE id = ?')
  const setImages = db.prepare('UPDATE logs SET images = ? WHERE id = ?')
  const setVote = db.prepare('UPDATE logs SET vote = ?, vote_note = ?, voted_at = ? WHERE id = ?')
  const list = db.prepare('SELECT * FROM logs ORDER BY at DESC LIMIT 5000')
  const purge = db.prepare('DELETE FROM logs WHERE at < ?')

  const row = r => r && ({
    id: r.id, at: r.at, userId: r.user_id || '', userName: r.user_name || '', ip: r.ip || '', page: r.page || '', mode: r.mode || '',
    question: r.question, answer: r.answer || '', status: r.status, ms: r.ms || 0, sources: JSON.parse(r.sources || '[]'),
    vote: r.vote || '', voteNote: r.vote_note || '', votedAt: r.voted_at || '', images: JSON.parse(r.images || '[]'),
    tokens: r.tok_in == null ? null : { in: r.tok_in, cached: r.tok_cached || 0, out: r.tok_out || 0 }, model: r.model || '',
    reuseOf: r.reuse_of || '', noReuse: !!r.no_reuse, reusable: r.reusable !== 0 && !r.images && !String(r.question).startsWith('[Kèm'),
  })

  function cleanup() {
    const cutoff = new Date(Date.now() - KEEP_DAYS * 86400e3).toISOString()
    const n = purge.run(cutoff).changes
    if (n) console.log(`🧹 [ds] Dọn ${n} lượt hỏi AVA cũ hơn ${KEEP_DAYS} ngày`)
  }
  cleanup()
  setInterval(cleanup, 86400e3).unref()

  return {
    keepDays: KEEP_DAYS,
    add({ userId = '', userName = '', ip = '', page = '', mode = '', question, answer = '', status = 'answered', ms = 0, sources = [], tokens = null, model = '', reusable = false, parts = null, reuseOf = '' }) {
      const id = 'ava_' + crypto.randomUUID()
      ins.run(id, new Date().toISOString(), userId, userName, ip, page, mode, String(question).slice(0, 4000), String(answer).slice(0, 20000), status, ms, JSON.stringify(sources),
        tokens ? tokens.in : null, tokens ? tokens.cached : null, tokens ? tokens.out : null, model || null,
        reusable ? 1 : 0, parts ? JSON.stringify(parts) : null, reuseOf || null)
      return id
    },
    get: id => row(get.get(id)),
    setImages(id, files) { if (files?.length) setImages.run(JSON.stringify(files), id) },
    vote(id, vote, note) { setVote.run(vote, note, vote ? new Date().toISOString() : '', id) },
    all() { const n = new Map(reuseCounts.all().map(r => [r.id, r.n])); return list.all().map(r => ({ ...row(r), reuseCount: n.get(r.id) || 0 })) },
    /** Các câu trả lời có thể dùng lại (mới nhất trước) */
    candidates: days => candStmt.all(new Date(Date.now() - days * 86400e3).toISOString()).map(r => ({
      id: r.id, at: r.at, mode: r.mode === 'build' ? 'build' : 'plain', question: r.question, answer: r.answer || '',
      sources: JSON.parse(r.sources || '[]'), up: r.vote === 'up', parts: r.parts ? JSON.parse(r.parts) : null, legacy: r.reusable == null })),
    setNoReuse(id, on) { setNoReuse.run(on ? 1 : 0, id) },
    /** Nhập lượt hỏi cũ từ file ava-log.jsonl (bản đầu chỉ ghi câu hỏi) — chạy 1 lần rồi đổi tên file */
    importJsonl(jsonl) {
      if (!fs.existsSync(jsonl)) return 0
      let n = 0
      for (const line of fs.readFileSync(jsonl, 'utf8').split('\n')) {
        try {
          const o = JSON.parse(line); if (!o.q) continue
          ins.run('ava_' + crypto.randomUUID(), o.at || new Date().toISOString(), '', o.asker || '', '', o.page || '', '', o.q, '', 'answered', o.ms || 0, '[]', null, null, null, null, null, null, null); n++
        } catch { /* dòng hỏng → bỏ qua */ }
      }
      fs.renameSync(jsonl, jsonl + '.imported')
      return n
    },
  }
}
