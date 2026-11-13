import fs from 'node:fs'
import path from 'node:path'
import { createAvaRepeat, createAvaSimilar, createAvaPace, REPEAT_NOTE, STOP_TEXT, PENDING_TEXT, SIMILAR_NOTE, SPAM_TEXT } from './avaRepeat.js'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createAva, cleanImages, qSig, qSim, norm, splitFollowups } from './ava.js'
import { createAvaLogs } from './avaLogs.js'
import { createAvaImages } from './avaImages.js'
import { precompressed } from './precompressed.js'
import { createMailer, emailFromTemplate } from './mail.js'

/* ═══════════════════════════════════════════════════════════════════════════
   MISA Design System — tài liệu tra cứu (/ds) + CMS
   Gắn vào máy chủ có sẵn (PD Point) bằng mountDocs(app, …): code + dữ liệu RIÊNG, không đụng DB của app chủ.
   Lỗi ở đây chỉ làm hỏng /ds — app chủ bọc try/catch khi gắn.
   Dữ liệu (MDS_DOCS_DATA, mặc định mds-docs/data):
     pages/<slug>.json            trang hiện hành { slug, title, group, order, summary, body (Markdown), updatedAt, updatedBy }
     revisions/<slug>/<ms>.json   các bản trước (giữ KEEP_REVISIONS bản mới nhất)
     trash/<slug>-<ms>.json       trang đã xóa (khôi phục được)
     files/<sha1>.<đuôi>          ảnh (tên theo nội dung → trùng ảnh không lưu 2 lần, cache vĩnh viễn)
     settings.json                { groups: [thứ tự nhóm], editors: [userId], redirects: { slugCũ: slugMới } }
   Lần chạy đầu (chưa có pages/) → nạp nội dung chuyển từ Figma Site trong content/.
   Quyền: ai cũng ĐỌC được (không cần đăng nhập) · SỬA: Quản trị app chủ + người được thêm vào “Người biên tập”.
   ═══════════════════════════════════════════════════════════════════════════ */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const CONTENT = path.join(ROOT, 'content')
const KEEP_REVISIONS = 50
const SLUG = /^[a-z0-9][a-z0-9-]{0,79}$/
const DEFAULT_GROUPS = ['General', 'Styles', 'Communication', 'Components', 'Patterns', 'Others']
const IMAGE_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg' }

class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status } }
const fail = (status, msg) => { throw new HttpError(status, msg) }

/** Bỏ dấu tiếng Việt → slug */
export const slugify = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)

/** Markdown → chữ thuần (cho ô tìm kiếm) */
const plain = md => String(md || '')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/^:::.*$/gm, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[#*_`>|-]+/g, ' ')
  .replace(/\s+/g, ' ').trim()

/* Gắn vào máy chủ chủ (PD Point) — hoặc chạy RIÊNG bằng server/standalone.js (tài khoản nội bộ, standalone: true):
   isEditor(u): người dùng có quyền biên tập sẵn theo tài khoản (bản chạy riêng) — ngoài danh sách “Người biên tập” trong settings */
export function mountDocs(app, { express, loadUser, compress, users = () => [], isAdmin = u => u?.role === 'admin', isEditor = () => false, standalone = false, dataDir, ai } = {}) {
  const DATA = dataDir || process.env.MDS_DOCS_DATA || path.join(ROOT, 'data')
  const dir = (...p) => path.join(DATA, ...p)
  for (const d of ['pages', 'revisions', 'trash', 'files']) fs.mkdirSync(dir(d), { recursive: true })

  /* ── Đọc / ghi file (ghi qua file tạm rồi đổi tên → không bao giờ để lại file dở) ── */
  const readJson = (f, fb = null) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return fb } }
  const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); const t = `${f}.${process.pid}.tmp`; fs.writeFileSync(t, JSON.stringify(v, null, 1)); fs.renameSync(t, f); dropCache(f) }
  const pageFile = slug => dir('pages', `${slug}.json`)
  const getPage = slug => (SLUG.test(slug) ? readJson(pageFile(slug)) : null)
  /* Bộ nhớ đệm trong RAM: danh sách trang / kết quả tìm kiếm / cài đặt — KHÔNG đọc lại ~50 file JSON trên đĩa ở mỗi lượt (nhiều người cùng vào).
     Xóa đệm khi ghi qua CMS (writeJson / rmPage) và khi file bị sửa thẳng trên đĩa (fs.watch). Đối tượng trả về: CHỈ ĐỌC. */
  let pagesCache = null, searchCache = null, settingsCache = null
  function dropCache(f) {
    if (!f || f.startsWith(dir('pages') + path.sep)) { pagesCache = null; searchCache = null }
    if (!f || f === dir('settings.json')) settingsCache = null
  }
  try { fs.watch(dir('pages'), () => dropCache(dir('pages', 'x'))); fs.watch(DATA, (_e, name) => { if (name === 'settings.json') dropCache(dir('settings.json')) }) } catch { /* không theo dõi được → chỉ xóa đệm khi ghi qua CMS */ }
  const allPages = () => (pagesCache ??= fs.readdirSync(dir('pages')).filter(f => f.endsWith('.json')).map(f => readJson(dir('pages', f))).filter(Boolean))
  const rmPage = slug => { fs.rmSync(pageFile(slug), { force: true }); dropCache(pageFile(slug)) }
  const settings = () => structuredClone(settingsCache ??= { groups: DEFAULT_GROUPS, editors: [], redirects: {}, ...readJson(dir('settings.json'), {}) })   // bản sao: nơi gọi sửa rồi saveSettings
  const saveSettings = s => writeJson(dir('settings.json'), s)

  /* ── Nạp nội dung ban đầu (chuyển từ Figma Site) ── */
  if (!fs.readdirSync(dir('pages')).some(f => f.endsWith('.json')) && fs.existsSync(path.join(CONTENT, 'pages'))) {
    for (const f of fs.readdirSync(path.join(CONTENT, 'img'))) fs.copyFileSync(path.join(CONTENT, 'img', f), dir('files', f))
    const at = new Date().toISOString()
    for (const f of fs.readdirSync(path.join(CONTENT, 'pages')).filter(f => f.endsWith('.json'))) {
      const p = readJson(path.join(CONTENT, 'pages', f))
      writeJson(pageFile(p.slug), { ...p, body: p.body.replace(/\]\(img\//g, '](/ds/files/'), updatedAt: at, updatedBy: 'Figma Site' })
    }
    if (!fs.existsSync(dir('settings.json'))) saveSettings(settings())
    console.log('✓ Tài liệu Design System: đã nạp nội dung từ Figma Site')
  }

  // Không cho 2 trang trùng tiêu đề (menu sẽ hiện 2 mục giống hệt, trông như trang bị nhân đôi)
  const dupTitle = (title, slug) => allPages().find(p => p.slug !== slug && String(p.title || '').trim().toLowerCase() === String(title || '').trim().toLowerCase())
  const canEdit = u => !!u && u.status === 'active' && (isAdmin(u) || isEditor(u) || settings().editors.includes(u.id))
  const who = u => ({ id: u.id, name: u.name || u.email })
  const meta = ({ body, ...m }) => m

  function saveRevision(p) {
    writeJson(dir('revisions', p.slug, `${Date.parse(p.updatedAt) || Date.now()}.json`), p)
    const list = fs.readdirSync(dir('revisions', p.slug)).sort()
    for (const f of list.slice(0, Math.max(0, list.length - KEEP_REVISIONS))) fs.rmSync(dir('revisions', p.slug, f), { force: true })
  }
  function clean(b, cur = {}) {
    const title = String(b.title ?? cur.title ?? '').trim().slice(0, 200)
    if (!title) fail(400, 'Nhập tiêu đề trang')
    const groups = settings().groups
    const group = String(b.group ?? cur.group ?? groups[0] ?? '').trim().slice(0, 60)
    if (!group) fail(400, 'Chọn nhóm cho trang')
    return {
      title, group,
      order: Number.isFinite(Number(b.order)) ? Number(b.order) : (cur.order ?? 9999),
      summary: String(b.summary ?? cur.summary ?? '').slice(0, 1000),
      body: String(b.body ?? cur.body ?? '').slice(0, 500000),
    }
  }
  function addGroup(group) {
    const s = settings()
    if (!s.groups.includes(group)) { s.groups = [...s.groups, group]; saveSettings(s) }
  }
  const nextOrder = group => Math.max(0, ...allPages().filter(p => p.group === group).map(p => p.order || 0)) + 1

  /* ── API /api/ds ── */
  const r = express.Router()
  if (compress) r.use(compress)
  r.use(express.json({ limit: '8mb' }))   // AVA nhận tối đa 3 ảnh thiết kế đã nén
  if (loadUser) r.use(loadUser)
  const editor = (req, _res, next) => (canEdit(req.user) ? next() : next(new HttpError(req.user ? 403 : 401, req.user ? 'Bạn chưa có quyền biên tập tài liệu' : 'Đăng nhập để biên tập tài liệu')))
  const admin = (req, _res, next) => (isAdmin(req.user) ? next() : next(new HttpError(403, 'Chỉ Quản trị được thực hiện')))
  const h = fn => (req, res, next) => { try { const v = fn(req, res); if (v !== undefined) res.json(v) } catch (e) { next(e) } }

  const mailer = createMailer()   // gửi thử mẫu email — null khi máy chủ chưa cấu hình SMTP
  r.get('/me', h(req => ({ user: req.user ? who(req.user) : null, canEdit: canEdit(req.user), isAdmin: isAdmin(req.user), aiEnabled: !!ai?.()?.apiKey, mailEnabled: !!mailer, standalone })))

  /* AVA — hỏi đáp quy chuẩn Design System (ai cũng hỏi được như đọc tài liệu) · giới hạn 40 lượt / giờ / người (chưa đăng nhập: theo IP) */
  /* ── Tri thức AVA: ban biên tập tự nhập quy tắc / lưu ý → AVA luôn đọc (không cần sửa code, build lại) ──
     ava-notes.json  { notes: [{ id, title, body, enabled, updatedAt, updatedBy }] } */
  const notesFile = dir('ava-notes.json')
  const allNotes = () => readJson(notesFile, { notes: [] }).notes || []
  const saveNotes = list => writeJson(notesFile, { notes: list })
  const ava = createAva({ knowledgeDir: path.join(ROOT, 'knowledge'), pages: allPages, ai, notes: allNotes })
  // Lịch sử hỏi AVA: CSDL SQLite riêng của tài liệu (data/ava.db) — nhập 1 lần các câu hỏi cũ ghi trong ava-log.jsonl
  const avaLogs = createAvaLogs(dir('ava.db'))
  const avaImages = createAvaImages(dir('ava-images'))
  /* Ghi lượt hỏi + lưu ảnh đính kèm (nếu có) vào nhật ký */
  const logAsk = (entry, images) => { const id = avaLogs.add(entry); if (images?.length) avaLogs.setImages(id, avaImages.save(id, images)); return id }
  const imported = avaLogs.importJsonl(dir('ava-log.jsonl')); if (imported) console.log(`✓ [ds] Nhập ${imported} lượt hỏi AVA cũ vào ava.db`)
  const avaHits = new Map(), avaRepeat = createAvaRepeat(), avaSimilar = createAvaSimilar(qSig, qSim), avaPace = createAvaPace()
  /* Câu hỏi QUÁ RỘNG về components (“tóm tắt chi tiết nhất các components”, “tương tự như trên với component”) mà không nêu component nào
     → hỏi lại cho rõ, liệt kê các trang Components để chọn — không gọi AI (câu trả lời kiểu này dài, tốn ~15k token mà thường không đúng ý) */
  /* Từ chung chung (không mang nội dung) — câu CHỈ gồm các từ này (“giải thích đi”, “hướng dẫn”, “cái này sao”) = câu mơ hồ → hỏi lại */
  const VAGUE_WORDS = new Set('giai thich huong dan chi tiet hon nua cai nay do kia sao tom tat noi ro them lam di nhe duoc khong kiem tra dung chuan chua cach tiep tuc vi du hoi gi day nao roi hieu biet muon can tro giup support help explain'.split(' '))
  const VAGUE_TEXT = 'Bạn muốn hỏi cụ thể về phần nào? Câu hỏi còn hơi chung nên AVA chưa trả lời ngay (để tránh trả lời lan man, không đúng ý). Nói rõ thêm 1 chút, VD:\n\n' +
    '- **Control / component:** “Nút Primary cao bao nhiêu?”, “ComboBox bỏ chọn thế nào?”\n' +
    '- **Quy chuẩn bố cục:** “Card cách nhau bao nhiêu?”, “Popup chứa danh sách vẽ thế nào?”\n' +
    '- **Soát thiết kế:** dán ảnh màn hình kèm câu “đúng chuẩn chưa?”'
  function clarifyBroad(q) {
    const n = norm(q)
    if (!/\bcomponents?\b|\bcontrols?\b/.test(n)) return ''
    if (!/(chi tiet nhat|tat ca|toan bo|day du|het cac|moi |tuong tu|nhu tren|tom tat)/.test(n)) return ''
    if (/\bngan\b|ngan gon|1 2 dong|mot hai dong/.test(n)) return ''   // đã chọn “tóm tắt ngắn tất cả” → trả lời bình thường
    const comps = allPages().filter(p => p.group === 'Components').sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    if (comps.some(p => { const w = norm(p.title).split(/[ (]/)[0]; return w.length >= 3 && new RegExp(`\\b${w}\\b`).test(n) })) return ''   // đã nêu tên 1 component cụ thể
    return `Bạn muốn AVA làm rõ phần nào? Có ${comps.length} component — tóm tắt “chi tiết nhất” cho tất cả sẽ rất dài và khó đọc.\n\n` +
      `- **Chọn 1–2 component** để xem chi tiết, VD: ${comps.slice(0, 6).map(p => `[${p.title}](/ds/${p.slug})`).join(' · ')}…\n` +
      `- Hoặc gõ **“tóm tắt ngắn tất cả component”** — mỗi component 1–2 dòng (khi nào dùng, điểm cần nhớ).\n\n` +
      `Danh sách đủ: ${comps.map(p => p.title).join(', ')}.`
  }
  /* ── Dùng lại câu trả lời trong Lịch sử hỏi AVA (không gọi AI, không tốn token) ──
     · Câu hỏi lượt đầu GIỐNG HỆT về nghĩa từ (cùng tập từ có nghĩa, VD câu gợi ý bấm sẵn) + tri thức nó dựa vào chưa đổi → trả lời luôn
     · Câu GẦN GIỐNG → trình duyệt hiện “Có phải bạn định hỏi…” khi đang gõ; người hỏi bấm chọn mới dùng lại (tránh trả lời nhầm ý)
     Không dùng: câu bị 👎, câu ban biên tập tắt, câu kèm ảnh, câu hỏi nối tiếp, câu cũ hơn REUSE_DAYS ngày. */
  // Gợi ý hỏi tiếp lưu CHUNG trong câu trả lời (dòng “[GOI_Y] a | b”) → dùng lại / gửi lại vẫn có nút gợi ý; lúc gửi xuống trình duyệt thì tách ra
  const withFu = d => (d.followups?.length ? `${d.text}\n\n[GOI_Y] ${d.followups.join(' | ')}` : d.text)
  /* Từ 2026-11-10 AVA trả lời ĐÚNG ý được hỏi + gợi ý hỏi tiếp — câu trả lời Dễ hiểu / Kỹ thuật cũ hơn (dài, kể hết thông số) không dùng lại nữa */
  const FOCUS_FROM = Date.parse('2026-11-13T01:30:00Z')   // 2026-11-13: trả lời thường kèm SỐ LIỆU (px, hex, shadow) + bỏ tab Kỹ thuật — câu cũ không có số liệu đầy đủ → không dùng lại
  const REUSE_DAYS = 60, LEGACY_DAYS = 14, sigMemo = new Map()
  const sigOf = c => { let v = sigMemo.get(c.id); if (!v) { v = qSig(c.question); sigMemo.set(c.id, v) } return v }
  const reusePool = mode => avaLogs.candidates(REUSE_DAYS).filter(c => c.mode === mode && c.answer && (mode === 'build' || Date.parse(c.at) >= FOCUS_FROM))
  // Lượt hỏi cũ (trước khi ghi dấu tri thức) không kiểm được tri thức đã đổi chưa → chỉ đưa ra GỢI Ý (người hỏi tự chọn), trong LEGACY_DAYS ngày
  const usable = (c, mode, exact) => (c.legacy ? !exact && Date.now() - Date.parse(c.at) < LEGACY_DAYS * 86400e3 : ava.stillValid(c.parts, mode))
  function exactReuse(q, mode) {
    const k = qSig(q).join(' ')
    return k ? reusePool(mode).find(c => sigOf(c).join(' ') === k && usable(c, mode, true)) || null : null
  }
  function similarAsked(q, mode, limit = 3) {
    const s = qSig(q)
    if (s.length < 2) return []
    const seen = new Set(), out = []
    for (const c of reusePool(mode)) {
      const cs = sigOf(c), k = cs.join(' ')
      if (seen.has(k)) continue
      const { j, shared } = qSim(s, cs)
      if (shared < 2 || j < 0.5 || !usable(c, mode, false)) continue
      seen.add(k); out.push({ c, score: j + (c.up ? 0.05 : 0) })   // câu đã được 👍 ưu tiên nhẹ
    }
    return out.sort((a, b) => b.score - a.score).slice(0, limit).map(({ c }) => ({ id: c.id, question: c.question, at: c.at, up: c.up }))
  }
  // Ghi lượt dùng lại vào lịch sử (token = 0, reuse_of = lượt gốc) rồi trả về như câu trả lời thường
  /* Câu trả lời Dễ hiểu cũ (trước khi tách nút “Chi tiết cách thi công”) còn mục “Cho lập trình viên” / bảng “Giá trị token CSS” → bỏ khi dùng lại */
  const DEV_SECS = /\n*#### (Cho lập trình viên|Giá trị token CSS)[^\n]*\n[\s\S]*?(?=\n#### |\n+\s*Nguồn\s*:|$)/g
  const plainView = t => String(t || '').replace(DEV_SECS, '').trim()
  function reuseAnswer(req, c, { page, mode, question }) {
    if (mode === 'plain') c = { ...c, answer: plainView(c.answer) }
    const logId = logAsk({ userId: req.user?.id || '', userName: req.user ? who(req.user).name : '', ip: req.ip || '', page, mode, question: question || c.question,
      answer: c.answer, status: 'answered', ms: 0, sources: c.sources, tokens: { in: 0, cached: 0, out: 0 }, model: '', reuseOf: c.id })
    return { ...splitFollowups(c.answer), sources: c.sources, logId, refused: false, reused: true }
  }
  r.post('/ava', (req, res, next) => {
    const key = req.user?.id || req.ip || '?', now = Date.now()
    const page = SLUG.test(String(req.body?.page || '')) ? req.body.page : ''
    // build = “Chi tiết cách thi công” (bấm dưới câu trả lời Dễ hiểu) — hỏi lại đúng câu đó, chỉ trả phần cho lập trình viên
    const mode = req.body?.mode === 'build' ? 'build' : 'plain', build = mode === 'build'
    const msgs = Array.isArray(req.body?.messages) ? req.body.messages : []
    const nImg = cleanImages(msgs.at(-1)?.images).length
    const lastQ = String([...msgs].reverse().find(m => m?.role === 'user')?.text ?? '').trim()
    // Hỏi lặp cùng 1 câu → trả lại câu trả lời trước / chặn, KHÔNG gọi AI (không tính vào giới hạn lượt hỏi)
    const rep = nImg || build ? { key: '', hit: null } : avaRepeat.check(key, lastQ, `${page}|${mode}`)
    if (rep.hit) {
      const text = rep.hit.kind === 'pending' ? PENDING_TEXT : rep.hit.kind === 'stop' ? STOP_TEXT : REPEAT_NOTE + rep.hit.answer.text
      const out = { ...splitFollowups(text), sources: rep.hit.kind === 'cached' ? rep.hit.answer.sources : [], logId: rep.hit.kind === 'cached' ? rep.hit.answer.logId : '', refused: false, repeated: true }
      if (req.body?.stream) { res.status(200).set({ 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' }); res.write(JSON.stringify({ d: out.text }) + '\n'); res.end(JSON.stringify({ done: true, ...out }) + '\n'); return }
      return res.json(out)
    }
    const sendQuick = (text, extra = {}) => {   // trả lời ngay, không gọi AI
      const out = { sources: [], logId: '', refused: false, quick: true, ...extra, ...splitFollowups(text) }
      if (req.body?.stream) { res.status(200).set({ 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' }); res.write(JSON.stringify({ d: out.text }) + '\n'); res.end(JSON.stringify({ done: true, ...out }) + '\n'); return }
      return res.json(out)
    }
    if (!nImg && !build && lastQ) {
      // 1) Hỏi dồn dập không đọc câu trả lời → tạm khóa
      if (avaPace.blocked(key)) return sendQuick(SPAM_TEXT, { spam: true })
      // 2) Gần giống câu vừa hỏi → gửi lại câu trả lời trước
      const sim = avaSimilar.find(key, `${page}|${mode}`, lastQ)
      if (sim) return sendQuick(SIMILAR_NOTE + sim.text, { sources: sim.sources, logId: sim.logId, repeated: true })
      // 3) Câu quá rộng về components, không nêu cụ thể → hỏi lại cho rõ
      // 3b) Lượt ĐẦU mà câu gần như không có nội dung (≤ 1 từ có nghĩa, VD “giải thích đi”, “cái này sao”) → hỏi lại, không đoán
      const firstQ = msgs.filter(m => m?.role === 'user').length === 1
      if (firstQ && !qSig(lastQ).some(t => !VAGUE_WORDS.has(t))) { avaPace.done(key, 0); return sendQuick(VAGUE_TEXT, { clarify: true }) }
      const clar = clarifyBroad(lastQ)
      if (clar) { avaPace.done(key, 0); return sendQuick(clar, { clarify: true }) }
    }
    // Lượt hỏi đầu, không ảnh, câu hỏi trùng nghĩa từ với câu đã trả lời (tri thức chưa đổi) → dùng lại, không gọi AI, không tính lượt hỏi
    const firstTurn = !nImg && msgs.filter(m => m?.role === 'user').length === 1
    const same = firstTurn && lastQ ? exactReuse(lastQ, mode) : null
    if (same) {
      const out = reuseAnswer(req, same, { page, mode, question: lastQ })
      avaRepeat.done(rep.key, { text: out.text, sources: out.sources, logId: out.logId })
      if (req.body?.stream) { res.status(200).set({ 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' }); res.write(JSON.stringify({ d: out.text }) + '\n'); res.end(JSON.stringify({ done: true, ...out }) + '\n'); return }
      return res.json(out)
    }
    const list = (avaHits.get(key) || []).filter(t => now - t < 3600e3)
    if (list.length >= 40) return next(new HttpError(429, 'Bạn hỏi hơi nhiều rồi — nghỉ một chút rồi hỏi tiếp nhé (tối đa 40 câu / giờ)'))
    list.push(now); avaHits.set(key, list)
    avaRepeat.start(rep.key)
    const question = (nImg ? `[Kèm ${nImg} ảnh] ` : '') + lastQ
    const base = { userId: req.user?.id || '', userName: req.user ? who(req.user).name : '', ip: req.ip || '', page, mode, question }
    const t0 = Date.now()
    /* stream: true → trả lời dạng dòng chảy (NDJSON): {"d": "đoạn chữ"} … rồi {"done": true, text, sources, logId} hoặc {"error": "…"}.
       Người hỏi thấy chữ ngay khi AVA bắt đầu trả lời thay vì chờ cả câu. no-transform: không để nén gzip giữ lại từng đoạn. */
    if (req.body?.stream) {
      res.status(200).set({ 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' })
      res.flushHeaders?.()
      const line = o => res.write(JSON.stringify(o) + '\n')
      ava.ask({ messages: msgs, page, mode, asker: base.userName, onDelta: d => line({ d }) })
        .then(d => {
          const logId = question ? logAsk({ ...base, answer: withFu(d), status: d.refused ? 'refused' : 'answered', ms: d.ms, sources: d.sources, tokens: d.tokens, model: d.model, reusable: firstTurn && !d.refused, parts: d.parts }, msgs.at(-1)?.images) : ''
          avaRepeat.done(rep.key, { text: withFu(d), sources: d.sources, logId })
          if (!nImg && !build && !d.refused) avaSimilar.add(key, `${page}|${mode}`, lastQ, { text: withFu(d), sources: d.sources, logId })
          if (!build) avaPace.done(key, d.text.length)
          line({ done: true, text: d.text, followups: d.followups || [], sources: d.sources, logId, refused: !!d.refused }); res.end()
        })
        .catch(e => {
          if (question && e.status !== 400) logAsk({ ...base, answer: e.message, status: 'error', ms: Date.now() - t0 }, msgs.at(-1)?.images)
          avaRepeat.fail(rep.key)
          line({ error: e.status ? e.message : 'AVA gặp lỗi, thử hỏi lại nhé' }); res.end()
        })
      return
    }
    ava.ask({ messages: msgs, page, mode, asker: base.userName })
      .then(d => {
        const logId = question ? logAsk({ ...base, answer: withFu(d), status: d.refused ? 'refused' : 'answered', ms: d.ms, sources: d.sources, tokens: d.tokens, model: d.model, reusable: firstTurn && !d.refused, parts: d.parts }, msgs.at(-1)?.images) : ''
        avaRepeat.done(rep.key, { text: withFu(d), sources: d.sources, logId })
        if (!nImg && !build && !d.refused) avaSimilar.add(key, `${page}|${mode}`, lastQ, { text: withFu(d), sources: d.sources, logId })
        if (!build) avaPace.done(key, d.text.length)
        res.json({ text: d.text, followups: d.followups || [], sources: d.sources, logId, refused: !!d.refused })
      })
      .catch(e => {
        if (question && e.status !== 400) logAsk({ ...base, answer: e.message, status: 'error', ms: Date.now() - t0 }, msgs.at(-1)?.images)
        avaRepeat.fail(rep.key)
        next(e.status ? new HttpError(e.status, e.message) : e)
      })
  })
  /* Đang gõ câu hỏi → các câu ĐÃ CÓ câu trả lời gần giống (“Có phải bạn định hỏi…”) — tính trên máy chủ, không gọi AI */
  r.get('/ava/similar', h((req, res) => {
    res.set('Cache-Control', 'no-store')
    return { items: similarAsked(String(req.query.q || '').slice(0, 500), 'plain') }
  }))
  /* Người hỏi bấm chọn 1 câu gợi ý → lấy câu trả lời đã có. Câu đã cũ (tri thức đổi / bị tắt) → 410, trình duyệt hỏi AVA như thường */
  r.post('/ava/reuse', h(req => {
    const mode = req.body?.mode === 'build' ? 'build' : 'plain', page = SLUG.test(String(req.body?.page || '')) ? req.body.page : ''
    const c = reusePool(mode).find(x => x.id === String(req.body?.id || ''))
    if (!c || !usable(c, mode, false)) fail(410, 'Câu trả lời này đã cũ — AVA sẽ trả lời lại')
    return reuseAnswer(req, c, { page, mode })
  }))
  /* Ban biên tập tắt / bật dùng lại 1 câu trả lời (Lịch sử hỏi AVA) */
  r.put('/ava-logs/:id/reuse', editor, h(req => {
    const l = avaLogs.get(req.params.id)
    if (!l) fail(404, 'Không tìm thấy lượt hỏi')
    avaLogs.setNoReuse(l.id, !req.body?.on); return { ok: true }
  }))
  /* Người hỏi đánh giá câu trả lời: { logId, vote: 'up' | 'down' | '' (bỏ), note? } — chỉ lượt của chính mình (đăng nhập: theo tài khoản · khách: theo IP) */
  r.post('/ava/feedback', h(req => {
    const log = avaLogs.get(String(req.body?.logId || ''))
    const mine = log && (log.userId ? log.userId === req.user?.id : !req.user && log.ip === (req.ip || ''))
    if (!mine) fail(404, 'Không tìm thấy câu trả lời')
    const vote = ['up', 'down'].includes(req.body?.vote) ? req.body.vote : ''
    const note = vote === 'down' ? String(req.body?.note ?? '').trim().slice(0, 500) : ''
    avaLogs.vote(log.id, vote, note)
    if (vote === 'down' && log.reuseOf) avaLogs.setNoReuse(log.reuseOf, true)   // câu dùng lại bị chê → thôi gợi ý câu gốc (ban biên tập bật lại được)
    return { vote, note }
  }))
  /* ── Đánh giá nội dung trang (1–5 sao, dưới 5 sao BẮT BUỘC kèm lý do) — data/page-ratings.json ──
     Mỗi người / trang giữ 1 đánh giá mới nhất (đăng nhập: theo tài khoản · khách: theo IP). Ban biên tập xem ở Quản trị › Đánh giá nội dung. */
  const RATINGS = dir('page-ratings.json')
  const ratings = () => readJson(RATINGS, [])
  const raterKey = req => (req.user ? 'u:' + req.user.id : 'ip:' + (req.ip || '?'))
  r.get('/ratings/mine/:slug', h((req, res) => {
    res.set('Cache-Control', 'no-store')
    const x = ratings().find(z => z.slug === req.params.slug && z.key === raterKey(req))
    return { rating: x ? { stars: x.stars, comment: x.comment } : null }
  }))
  const rateHits = new Map()
  r.post('/ratings', h(req => {
    const slug = String(req.body?.slug || ''); const page = getPage(slug); if (!page) fail(404, 'Không tìm thấy trang')
    const stars = Math.round(Number(req.body?.stars)); if (!(stars >= 1 && stars <= 5)) fail(400, 'Chọn từ 1 đến 5 sao')
    const comment = stars < 5 ? String(req.body?.comment ?? '').trim().slice(0, 2000) : ''
    if (stars < 5 && !comment) fail(400, 'Đánh giá dưới 5 sao cần nhập lý do / góp ý')
    const key = raterKey(req), now = Date.now()
    const hits = (rateHits.get(key) || []).filter(t => now - t < 3600e3); if (hits.length >= 60) fail(429, 'Bạn gửi hơi nhiều — thử lại sau ít phút'); hits.push(now); rateHits.set(key, hits)
    const list = ratings(), i = list.findIndex(z => z.slug === slug && z.key === key)
    const item = { id: i >= 0 ? list[i].id : `${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`, slug, title: page.title, stars, comment, key,
      userName: req.user ? who(req.user).name : '', at: new Date(now).toISOString(), handled: false }
    if (i >= 0) list[i] = item; else list.push(item)
    writeJson(RATINGS, list)
    return { rating: { stars, comment } }
  }))
  r.get('/ratings', editor, h((_req, res) => { res.set('Cache-Control', 'no-store'); return { ratings: ratings().map(({ key, ...x }) => ({ ...x, guest: key.startsWith('ip:') })).reverse() } }))
  r.put('/ratings/:id', editor, h(req => {
    const list = ratings(), x = list.find(z => z.id === req.params.id); if (!x) fail(404, 'Không tìm thấy đánh giá')
    x.handled = !!req.body?.handled; x.handledBy = x.handled ? who(req.user).name : ''; writeJson(RATINGS, list)
    return { ok: true }
  }))
  /* Lịch sử hỏi AVA — Quản trị + người biên tập tài liệu; lọc / thống kê ở trình duyệt */
  /* Ảnh người hỏi gửi kèm — chỉ người biên tập xem (Lịch sử hỏi AVA) */
  r.get('/ava-images/:day/:file', editor, (req, res, next) => {
    const p = avaImages.file(req.params.day, req.params.file)
    if (!p) return next(new HttpError(404, 'Ảnh đã hết hạn lưu hoặc không tồn tại'))
    res.set('Cache-Control', 'private, max-age=86400'); res.sendFile(p)
  })
  r.get('/ava-logs', editor, h((_req, res) => {
    res.set('Cache-Control', 'no-store')
    return { logs: avaLogs.all(), keepDays: avaLogs.keepDays, imageKeepDays: avaImages.keepDays }
  }))
  const noteIn = b => {
    const title = String(b?.title ?? '').trim().slice(0, 200), body = String(b?.body ?? '').trim()
    if (!title) fail(400, 'Nhập tiêu đề tri thức')
    if (!body) fail(400, 'Nhập nội dung tri thức')
    if (body.length > 8000) fail(400, 'Nội dung tối đa 8.000 ký tự — tách thành nhiều mục')
    return { title, body, enabled: b?.enabled !== false, always: !!b?.always }
  }
  r.get('/ava-notes', editor, h((_req, res) => { res.set('Cache-Control', 'no-store'); return { notes: allNotes() } }))
  r.post('/ava-notes', editor, h(req => {
    const n = { id: crypto.randomUUID(), ...noteIn(req.body), updatedAt: new Date().toISOString(), updatedBy: who(req.user).name }
    saveNotes([n, ...allNotes()]); return { note: n }
  }))
  r.put('/ava-notes/:id', editor, h(req => {
    const list = allNotes(), i = list.findIndex(n => n.id === req.params.id)
    if (i < 0) fail(404, 'Không tìm thấy mục tri thức')
    list[i] = { ...list[i], ...noteIn(req.body), updatedAt: new Date().toISOString(), updatedBy: who(req.user).name }
    saveNotes(list); return { note: list[i] }
  }))
  r.delete('/ava-notes/:id', editor, h(req => {
    const list = allNotes()
    if (!list.some(n => n.id === req.params.id)) fail(404, 'Không tìm thấy mục tri thức')
    saveNotes(list.filter(n => n.id !== req.params.id)); return { ok: true }
  }))
  /* ── Liên kết hữu ích (trang chủ /ds): data/links.json { links: [{ id, title, url, group, desc, updatedAt, updatedBy }] } · ai cũng xem, biên tập viên sửa ── */
  const linksFile = dir('links.json')
  const allLinks = () => readJson(linksFile, { links: [] }).links || []
  const saveLinks = list => writeJson(linksFile, { links: list })
  const linkIn = b => {
    const title = String(b?.title || '').trim().slice(0, 120), url = String(b?.url || '').trim().slice(0, 1000)
    const group = String(b?.group || '').trim().slice(0, 60) || 'Khác', desc = String(b?.desc || '').trim().slice(0, 300)
    if (!title) fail(400, 'Nhập tiêu đề liên kết')
    if (!/^https?:\/\/[^\s]+$/i.test(url)) fail(400, 'Đường dẫn phải bắt đầu bằng http:// hoặc https://')
    return { title, url, group, desc }
  }
  r.get('/links', h((_req, res) => { res.set('Cache-Control', 'no-cache'); return { links: allLinks() } }))
  r.post('/links', editor, h(req => {
    const l = { id: crypto.randomUUID(), ...linkIn(req.body), updatedAt: new Date().toISOString(), updatedBy: who(req.user).name }
    saveLinks([...allLinks(), l]); return { link: l }
  }))
  r.put('/links/:id', editor, h(req => {
    const list = allLinks(), i = list.findIndex(l => l.id === req.params.id)
    if (i < 0) fail(404, 'Không tìm thấy liên kết')
    list[i] = { ...list[i], ...linkIn(req.body), updatedAt: new Date().toISOString(), updatedBy: who(req.user).name }
    saveLinks(list); return { link: list[i] }
  }))
  r.delete('/links/:id', editor, h(req => {
    const list = allLinks()
    if (!list.some(l => l.id === req.params.id)) fail(404, 'Không tìm thấy liên kết')
    saveLinks(list.filter(l => l.id !== req.params.id)); return { ok: true }
  }))
  r.get('/pages', h((_req, res) => {
    res.set('Cache-Control', 'no-cache')
    const s = settings()
    return { pages: allPages().map(meta), groups: s.groups, redirects: s.redirects }
  }))
  r.get('/pages/:slug', h(req => {
    const p = getPage(req.params.slug)
    if (!p) fail(404, 'Không tìm thấy trang')
    return { page: p }
  }))
  r.get('/search', h(() => (searchCache ??= { items: allPages().map(p => ({ slug: p.slug, title: p.title, group: p.group, summary: p.summary || '', text: plain(p.body) })) })))

  r.post('/pages', editor, h(req => {
    const v = clean(req.body)
    { const d = dupTitle(v.title, ''); if (d) fail(409, `Đã có trang “${d.title}” (/ds/${d.slug}) — đặt tiêu đề khác`) }
    let slug = slugify(req.body.slug || v.title) || 'trang'
    if (!SLUG.test(slug)) fail(400, 'Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch ngang')
    if (getPage(slug)) { if (req.body.slug) fail(409, 'Đường dẫn này đã có trang khác dùng'); let i = 2; while (getPage(`${slug}-${i}`)) i++; slug = `${slug}-${i}` }
    const page = { slug, ...v, order: req.body.order == null ? nextOrder(v.group) : v.order, updatedAt: new Date().toISOString(), updatedBy: who(req.user).name, createdAt: new Date().toISOString() }
    addGroup(v.group)
    writeJson(pageFile(slug), page)
    return { page }
  }))
  r.put('/pages/:slug', editor, h(req => {
    const cur = getPage(req.params.slug)
    if (!cur) fail(404, 'Không tìm thấy trang')
    if (req.body.baseUpdatedAt && req.body.baseUpdatedAt !== cur.updatedAt) fail(409, `Trang vừa được ${cur.updatedBy || 'người khác'} sửa — tải lại để xem bản mới trước khi lưu`)
    const v = clean(req.body, cur)
    { const d = dupTitle(v.title, cur.slug); if (d) fail(409, `Đã có trang “${d.title}” (/ds/${d.slug}) — đặt tiêu đề khác`) }
    const slug = req.body.slug ? slugify(req.body.slug) : cur.slug
    if (!SLUG.test(slug)) fail(400, 'Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch ngang')
    if (slug !== cur.slug && getPage(slug)) fail(409, 'Đường dẫn này đã có trang khác dùng')
    saveRevision(cur)
    const page = { ...cur, ...v, slug, updatedAt: new Date().toISOString(), updatedBy: who(req.user).name }
    addGroup(v.group)
    if (slug !== cur.slug) {
      // Đổi đường dẫn: chuyển cả lịch sử + nhớ đường dẫn cũ để link cũ vẫn mở đúng trang
      if (fs.existsSync(dir('revisions', cur.slug))) fs.renameSync(dir('revisions', cur.slug), dir('revisions', slug))
      rmPage(cur.slug)
      const s = settings()
      s.redirects = Object.fromEntries(Object.entries({ ...s.redirects, [cur.slug]: slug }).map(([a, b]) => [a, b === cur.slug ? slug : b]).filter(([a, b]) => a !== b))
      saveSettings(s)
    }
    writeJson(pageFile(slug), page)
    return { page }
  }))
  r.delete('/pages/:slug', editor, h(req => {
    const cur = getPage(req.params.slug)
    if (!cur) fail(404, 'Không tìm thấy trang')
    writeJson(dir('trash', `${cur.slug}-${Date.now()}.json`), { ...cur, deletedAt: new Date().toISOString(), deletedBy: who(req.user).name })
    rmPage(cur.slug)
    return { ok: true }
  }))
  /* Thứ tự trang / nhóm (kéo thả trong CMS): { groups: [..], pages: [{ slug, group, order }] } */
  r.put('/order', editor, h(req => {
    const s = settings()
    if (Array.isArray(req.body.groups)) {
      const used = new Set(allPages().map(p => p.group))
      s.groups = [...new Set(req.body.groups.map(g => String(g).trim()).filter(Boolean))]
      for (const g of used) if (!s.groups.includes(g)) s.groups.push(g)
      saveSettings(s)
    }
    for (const it of Array.isArray(req.body.pages) ? req.body.pages : []) {
      const p = getPage(it.slug)
      if (!p) continue
      const group = String(it.group || p.group).trim()
      if (p.group !== group || p.order !== Number(it.order)) writeJson(pageFile(p.slug), { ...p, group, order: Number(it.order) || 0 })
    }
    return { ok: true, groups: settings().groups }
  }))

  /* Lịch sử sửa của 1 trang */
  r.get('/pages/:slug/revisions', editor, h(req => {
    const d = dir('revisions', req.params.slug)
    if (!SLUG.test(req.params.slug) || !fs.existsSync(d)) return { items: [] }
    return { items: fs.readdirSync(d).sort().reverse().map(f => { const p = readJson(path.join(d, f)) || {}; return { id: f.replace(/\.json$/, ''), title: p.title, updatedAt: p.updatedAt, updatedBy: p.updatedBy, size: (p.body || '').length } }) }
  }))
  const revFile = (slug, id) => (SLUG.test(slug) && /^\d+$/.test(id) ? dir('revisions', slug, `${id}.json`) : '')
  r.get('/pages/:slug/revisions/:id', editor, h(req => {
    const p = readJson(revFile(req.params.slug, req.params.id))
    if (!p) fail(404, 'Không tìm thấy bản này')
    return { page: p }
  }))
  r.post('/pages/:slug/revisions/:id/restore', editor, h(req => {
    const old = readJson(revFile(req.params.slug, req.params.id)), cur = getPage(req.params.slug)
    if (!old) fail(404, 'Không tìm thấy bản này')
    if (cur) saveRevision(cur)
    const page = { ...old, slug: req.params.slug, updatedAt: new Date().toISOString(), updatedBy: who(req.user).name }
    writeJson(pageFile(page.slug), page)
    return { page }
  }))

  /* Thùng rác */
  r.get('/trash', editor, h(() => ({
    items: fs.readdirSync(dir('trash')).filter(f => f.endsWith('.json')).sort().reverse()
      .map(f => { const p = readJson(dir('trash', f)) || {}; return { id: f.replace(/\.json$/, ''), slug: p.slug, title: p.title, group: p.group, deletedAt: p.deletedAt, deletedBy: p.deletedBy } }),
  })))
  r.post('/trash/:id/restore', editor, h(req => {
    if (!/^[a-z0-9-]+$/.test(req.params.id)) fail(400, 'Mã không hợp lệ')
    const f = dir('trash', `${req.params.id}.json`), p = readJson(f)
    if (!p) fail(404, 'Không tìm thấy trang trong thùng rác')
    let slug = p.slug, i = 2
    while (getPage(slug)) slug = `${p.slug}-${i++}`
    const { deletedAt, deletedBy, ...page } = p
    writeJson(pageFile(slug), { ...page, slug, updatedAt: new Date().toISOString(), updatedBy: who(req.user).name })
    addGroup(page.group)
    fs.rmSync(f, { force: true })
    return { page: getPage(slug) }
  }))

  /* Xóa vĩnh viễn 1 trang trong thùng rác (kèm lịch sử sửa nếu không còn trang nào dùng địa chỉ đó) · Dọn sạch thùng rác */
  const purge = f => {
    const p = readJson(f)
    fs.rmSync(f, { force: true })
    if (p?.slug && SLUG.test(p.slug) && !getPage(p.slug)) fs.rmSync(dir('revisions', p.slug), { recursive: true, force: true })
  }
  r.delete('/trash/:id', editor, h(req => {
    if (!/^[a-z0-9-]+$/.test(req.params.id)) fail(400, 'Mã không hợp lệ')
    const f = dir('trash', `${req.params.id}.json`)
    if (!fs.existsSync(f)) fail(404, 'Không tìm thấy trang trong thùng rác')
    purge(f)
    return { ok: true }
  }))
  r.delete('/trash', editor, h(() => {
    const files = fs.readdirSync(dir('trash')).filter(f => f.endsWith('.json'))
    for (const f of files) purge(dir('trash', f))
    return { ok: true, removed: files.length }
  }))

  /* Tải ảnh lên: thân request là file ảnh (Content-Type image/*) → { url } */
  r.post('/upload', editor, express.raw({ type: Object.keys(IMAGE_TYPES), limit: '15mb' }), h(req => {
    const ext = IMAGE_TYPES[String(req.headers['content-type'] || '').split(';')[0].trim()]
    if (!ext || !Buffer.isBuffer(req.body) || !req.body.length) fail(400, 'Chỉ nhận ảnh PNG, JPG, GIF, WEBP hoặc SVG')
    const name = `${crypto.createHash('sha1').update(req.body).digest('hex')}.${ext}`
    if (!fs.existsSync(dir('files', name))) fs.writeFileSync(dir('files', name), req.body)
    return { url: `/ds/files/${name}` }
  }))

  /* ── Ai đang xem tài liệu (như app Chấm điểm) — mỗi tab trình duyệt 1 phiên, giữ trong bộ nhớ (khởi động lại máy chủ là mất, tự có lại sau ≤ 30 giây)
     Trình duyệt báo 30 giây / lần: trang đang xem + số ms từ lần thao tác thật gần nhất (click, gõ, cuộn…).
     Đang hoạt động = có thao tác trong IDLE_MIN phút · tab đóng (quá 90 giây không báo) → bỏ khỏi danh sách.
     Chỉ người biên tập xem được danh sách (tên, máy, IP, trang đang xem); người đọc chưa đăng nhập = “Khách”. */
  const IDLE_MIN = 10, GONE_MS = 90e3, MAX_VISITORS = 2000
  const visitors = new Map()   // cid → { cid, userId, ip, ua, page, since, lastActive, lastPing }
  const CID = /^[A-Za-z0-9-]{8,64}$/
  const deviceOf = ua => {
    const b = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Trình duyệt khác'
    const o = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : ''
    return o ? `${b} · ${o}` : b
  }
  const pruneVisitors = now => { for (const [k, v] of visitors) if (now - v.lastPing > GONE_MS) visitors.delete(k) }
  r.post('/presence', h((req, res) => {
    const cid = String(req.body?.cid || ''), now = Date.now()
    if (!CID.test(cid)) fail(400, 'Thiếu mã phiên')
    pruneVisitors(now)
    if (req.body?.leave) { visitors.delete(cid); res.status(204).end(); return }
    let v = visitors.get(cid)
    if (!v) { if (visitors.size >= MAX_VISITORS) { res.status(204).end(); return } v = { cid, since: now, lastActive: now }; visitors.set(cid, v) }
    const idleMs = Math.min(Math.max(0, Number(req.body?.idleMs) || 0), 24 * 3600e3)
    Object.assign(v, { userId: req.user?.id || '', ip: req.ip || '', ua: String(req.get('user-agent') || '').slice(0, 300), page: String(req.body?.page || '').slice(0, 200), lastPing: now, lastActive: now - idleMs })
    res.status(204).end()
  }))
  r.get('/presence', editor, h((_req, res) => {
    const now = Date.now(); pruneVisitors(now)
    const byId = new Map(users().map(u => [u.id, u]))
    const title = new Map(allPages().map(p => [p.slug, p.title]))
    const pageName = pg => { const slug = pg.replace(/^\/ds\/?/, '').split(/[?#]/)[0]; return !slug ? 'Trang chủ' : slug.startsWith('quan-tri') ? 'Quản trị nội dung' : title.get(slug) || slug }
    let guest = 0
    const list = [...visitors.values()].sort((a, b) => a.since - b.since).map(v => {
      const u = v.userId ? byId.get(v.userId) : null
      return { id: v.cid, userId: u?.id || '', name: u ? (u.name || u.email) : `Khách ${++guest}`, email: u?.email || '', guest: !u,
        page: v.page, pageTitle: pageName(v.page), since: v.since, lastActive: v.lastActive, idle: now - v.lastActive > IDLE_MIN * 60e3,
        ip: ['::1', '127.0.0.1', '::ffff:127.0.0.1'].includes(v.ip) ? 'localhost' : v.ip, device: deviceOf(v.ua) }
    })
    res.set('Cache-Control', 'no-store')
    return { visitors: list, idleMinutes: IDLE_MIN, at: now }
  }))

  /* Người biên tập (chỉ Quản trị) */
  r.get('/editors', admin, h(() => {
    const ids = new Set(settings().editors)
    return { editors: [...ids], users: users().filter(u => u.status === 'active').map(u => ({ id: u.id, name: u.name || u.email, email: u.email, role: u.role, admin: isAdmin(u) })) }
  }))
  r.put('/editors', admin, h(req => {
    const s = settings()
    s.editors = [...new Set((Array.isArray(req.body.editors) ? req.body.editors : []).map(String))]
    saveSettings(s)
    return { editors: s.editors }
  }))

  /* ── Sticky notes — ghi chú nhanh theo tài khoản (cần đăng nhập) ──
     data/notes-{userId}.json { notes: [{ id, text, done, createdAt, updatedAt }] }
     Chưa đăng nhập → client lưu localStorage (không qua API này).
     Client lưu trên trình duyệt trước rồi mới gửi, lỗi thì gửi lại → POST nhận id do client đặt và GHI ĐÈ nếu đã có (gửi lại không sinh ghi chú trùng). */
  const NOTE_ID = /^[\w-]{8,64}$/
  const noteText = v => String(v ?? '').trim().slice(0, 200)
  const notesOf = uid => dir(`notes-${uid}.json`)
  const readNotes = uid => { try { return JSON.parse(fs.readFileSync(notesOf(uid), 'utf8')).notes || [] } catch { return [] } }
  const saveUserNotes = (uid, list) => writeJson(notesOf(uid), { notes: list })
  const authUser = (req, _res, next) => (req.user ? next() : next(new HttpError(401, 'Đăng nhập để đồng bộ ghi chú')))

  r.get('/notes', authUser, h(req => ({ notes: readNotes(req.user.id) })))
  r.post('/notes', authUser, h(req => {
    const b = req.body || {}, text = noteText(b.text), id = b.id == null ? crypto.randomUUID() : String(b.id)
    if (!text) fail(400, 'Nội dung ghi chú không được trống')
    if (!NOTE_ID.test(id)) fail(400, 'Mã ghi chú không hợp lệ')
    const list = readNotes(req.user.id), now = new Date().toISOString()
    let note = list.find(n => n.id === id)
    if (note) Object.assign(note, { text, done: !!b.done, updatedAt: now })
    else list.unshift(note = { id, text, done: !!b.done, createdAt: now, updatedAt: now })
    saveUserNotes(req.user.id, list)
    return { note }
  }))
  r.put('/notes/:id', authUser, h(req => {
    const list = readNotes(req.user.id)
    const idx = list.findIndex(n => n.id === req.params.id)
    if (idx < 0) fail(404, 'Không tìm thấy ghi chú')
    const { text, done } = req.body || {}
    if (text !== undefined) list[idx].text = noteText(text) || list[idx].text
    if (done !== undefined) list[idx].done = !!done
    list[idx].updatedAt = new Date().toISOString()
    saveUserNotes(req.user.id, list)
    return { note: list[idx] }
  }))
  r.delete('/notes/:id', authUser, h(req => {
    const list = readNotes(req.user.id)
    const next2 = list.filter(n => n.id !== req.params.id)
    if (next2.length === list.length) fail(404, 'Không tìm thấy ghi chú')
    saveUserNotes(req.user.id, next2)
    return { ok: true }
  }))

  /* ── Gửi thử mẫu email (/ds/email) — gửi đúng mẫu đang chọn vào hộp thư người đọc nhập, qua hộp thư gửi của app Chấm điểm (mail.js) ──
     Ai đọc tài liệu cũng gửi được → CHỈ gửi mẫu có sẵn trong dist/email (không nhận nội dung từ người gọi), tiêu đề luôn có “[Gửi thử]”,
     và giới hạn lượt — hộp thư gửi dùng chung với lời mời của app Chấm điểm, gửi thử không được chiếm hết hạn mức ngày của nó.
     Hộp thư nhận + toàn hệ thống có giới hạn riêng vì req.ip đi qua X-Forwarded-For, người gọi tự đặt được. */
  const MIN10 = 10 * 60e3, DAY = 24 * 3600e3
  const mailLog = new Map()   // khóa → các thời điểm đã gửi
  function takeMailQuota(limits) {
    const now = Date.now()
    for (const [k, times] of mailLog) if (!times.some(t => now - t < DAY)) mailLog.delete(k)
    const rows = limits.map(([key, max, ms, msg]) => ({ key, max, msg, times: (mailLog.get(key) || []).filter(t => now - t < ms) }))
    const over = rows.find(x => x.times.length >= x.max)
    if (over) fail(429, over.msg)
    for (const x of rows) mailLog.set(x.key, [...x.times, now])
  }
  r.post('/email-test', async (req, res, next) => {
    try {
      if (!mailer) fail(503, 'Máy chủ chưa cấu hình gửi email (SMTP)')
      const id = String(req.body?.template || ''), file = path.join(DIST, 'email', `${id}.html`)
      if (!SLUG.test(id) || !fs.existsSync(file)) fail(400, 'Không tìm thấy mẫu email')
      const to = String(req.body?.to || '').trim().toLowerCase()
      if (to.length > 254 || !/^[^\s@<>"',;:()\\]+@[^\s@<>"',;:()\\]+\.[^\s@<>"',;:()\\]+$/.test(to)) fail(400, 'Email nhận không hợp lệ')
      takeMailQuota([
        [`from:${req.user?.id || req.ip || '?'}`, 5, MIN10, 'Bạn vừa gửi thử nhiều lần — thử lại sau ít phút'],
        [`to:${to}`, 3, MIN10, 'Hộp thư này vừa nhận nhiều thư thử — thử lại sau ít phút'],
        ['all', 100, DAY, 'Hôm nay đã hết lượt gửi thử — thử lại vào ngày mai'],
      ])
      const { title, html, attachments } = emailFromTemplate(file)
      const subject = `[Gửi thử] ${title || id}`
      try {
        await mailer.send({
          from: { name: 'MISA Design System', address: mailer.address }, to, subject, html, attachments,
          text: `Thư gửi thử mẫu email “${title || id}” từ tài liệu MISA Design System. Mở bằng ứng dụng đọc thư hỗ trợ HTML để xem đúng mẫu.`,
        })
      } catch (e) {
        console.error('[ds] gửi thử mẫu email lỗi:', e.message)
        fail(502, 'Không gửi được thư — kiểm tra lại địa chỉ email hoặc thử lại sau')
      }
      console.log(`[ds] gửi thử mẫu email ${id} → ${to} (${req.user ? who(req.user).name : req.ip || '?'})`)
      res.json({ ok: true, to, subject })
    } catch (e) { next(e) }
  })

  r.use((err, _req, res, _next) => {
    if (!(err instanceof HttpError) && err.type !== 'entity.too.large') console.error('[ds]', err)
    res.status(err.status || 500).json({ ok: false, error: err.status ? err.message : 'Lỗi máy chủ tài liệu' })
  })
  app.use('/api/ds', r)

  /* ── Giao diện /ds ── */
  // Ảnh: tên theo nội dung → cache vĩnh viễn; chặn chạy script nếu mở thẳng file SVG
  app.use('/ds/files', express.static(dir('files'), {
    immutable: true, maxAge: '1y', index: false, fallthrough: false,
    setHeaders: res => { res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox") },
  }))
  app.use('/ds/assets', precompressed(path.join(DIST, 'assets')))   // bản .br / .gz nén sẵn lúc build → không nén lại mỗi lượt tải
  if (compress) app.use('/ds', compress)
  app.use('/ds/assets', express.static(path.join(DIST, 'assets'), { immutable: true, maxAge: '1y', index: false, fallthrough: false }))
  app.use('/ds', express.static(DIST, { index: false, maxAge: '1h' }))
  app.get(/^\/ds(\/.*)?$/, (req, res) => {
    if (req.path === '/ds') return res.redirect(301, '/ds/')
    const index = path.join(DIST, 'index.html')
    if (!fs.existsSync(index)) return res.status(503).type('text/plain; charset=utf-8').send('Tài liệu Design System đang được cập nhật, vui lòng thử lại sau ít phút.')
    res.set('Cache-Control', 'no-cache').sendFile(index)
  })
  return { dataDir: DATA }
}
