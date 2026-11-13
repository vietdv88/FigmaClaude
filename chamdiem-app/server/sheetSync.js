/* ═══ ĐỒNG BỘ VÒNG LẶP TỪ GOOGLE SHEET (link chia sẻ công khai) ═══════════════
   - Sheet theo đúng template nhập công việc (cột khớp theo tiêu đề, như nhập Excel).
   - Đọc bằng link xuất CSV của Google — Sheet phải chia sẻ “Bất kỳ ai có đường liên kết đều xem được”.
   - Khớp công việc theo mã PBI trong vòng lặp (dòng không có PBI → khớp theo Nội dung).
   - mode 'add'   : chỉ thêm việc mới, không đụng việc đã có.
     mode 'merge' : thêm mới + cập nhật việc đã có theo Sheet — ô có giá trị mới ghi đè, ô trống KHÔNG xóa dữ liệu trong app;
                    phần đánh giá (mức hài lòng, lý do, điểm tay) đã nhập trong app thì giữ nguyên.
   - Không bao giờ xóa việc trong app; việc thuộc tháng PD đã chốt điểm → bỏ qua.
   - Mọi thay đổi đi qua checkTaskWrite với quyền của người chạy (bấm nút / người gắn link khi tự đồng bộ).
   ═══════════════════════════════════════════════════════════════════════════ */
import crypto from 'node:crypto'
import * as store from './store.js'
import { checkTaskWrite, isLocked, isPdClosed } from './rules.js'
import { validateRows, parseCsv, norm, columnValues } from '../src/store/importCore.js'
import { primaryProjectIdsOf, monthLabelOf, sameValue } from '../src/store/scoring.js'

const RATING_FIELDS = ['qualityRating', 'ratingReason', 'manualScore']
export const SYNC_MODES = ['add', 'merge']
const uid = p => p + crypto.randomUUID()

/** Link Google Sheet → link tải CSV của đúng trang tính (gid). Trả null nếu không phải link Google Sheet */
export function sheetCsvUrl(url) {
  const s = String(url ?? '').trim()
  const pub = s.match(/docs\.google\.com\/spreadsheets\/d\/e\/([\w-]+)/)          // “Xuất bản lên web”
  if (pub) {
    const gid = s.match(/[?&#]gid=(\d+)/)?.[1]
    return `https://docs.google.com/spreadsheets/d/e/${pub[1]}/pub?output=csv${gid ? '&gid=' + gid : ''}`
  }
  const m = s.match(/docs\.google\.com\/spreadsheets\/d\/([\w-]{20,})/)
  if (!m) return null
  // Có gid (copy link khi đang mở trang tính đó) → đọc đúng trang tính; không có → Google trả trang tính ĐẦU TIÊN của file
  const gid = s.match(/[?&#]gid=(\d+)/)?.[1]
  return `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv${gid ? '&gid=' + gid : ''}`
}

/** Tải các dòng của Sheet — lỗi rõ ràng khi chưa chia sẻ công khai / link sai */
export async function fetchSheetRows(url) {
  const csvUrl = sheetCsvUrl(url)
  if (!csvUrl) throw Object.assign(new Error('Link không phải Google Sheet (cần dạng https://docs.google.com/spreadsheets/d/…)'), { status: 400 })
  return fetchCsv(csvUrl)
}
async function fetchCsv(csvUrl) {
  let r
  try { r = await fetch(csvUrl, { redirect: 'follow', signal: AbortSignal.timeout(20000) }) }
  catch { throw Object.assign(new Error('Không kết nối được Google Sheet — thử lại sau'), { status: 502 }) }
  const type = r.headers.get('content-type') || ''
  if (r.status === 404) throw Object.assign(new Error('Không tìm thấy Sheet / trang tính — kiểm tra lại link'), { status: 400 })
  if (!r.ok || !/csv|text\/plain/.test(type)) {
    throw Object.assign(new Error('Không đọc được Sheet — hãy chia sẻ Sheet ở chế độ “Bất kỳ ai có đường liên kết đều xem được”'), { status: 400 })
  }
  return parseCsv(await r.text())
}

/* ═══ CẢ DỰ ÁN 1 FILE — mỗi trang tính = 1 vòng lặp ═══
   Danh sách trang tính (tên + gid) lấy từ trang xem HTML công khai của Google (không cần khóa API). */
export const sheetIdOf = url => String(url ?? '').match(/docs\.google\.com\/spreadsheets\/d\/([\w-]{20,})/)?.[1] ?? null
const unescapeJs = v => v.replace(/\\x([0-9a-f]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\\u([0-9a-f]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\(.)/g, '$1')
export async function fetchSheetTabs(url) {
  const id = sheetIdOf(url)
  if (!id) throw Object.assign(new Error('Link không phải Google Sheet (cần dạng https://docs.google.com/spreadsheets/d/…)'), { status: 400 })
  let r
  try { r = await fetch(`https://docs.google.com/spreadsheets/d/${id}/htmlview`, { redirect: 'follow', signal: AbortSignal.timeout(20000) }) }
  catch { throw Object.assign(new Error('Không kết nối được Google Sheet — thử lại sau'), { status: 502 }) }
  if (r.status === 404) throw Object.assign(new Error('Không tìm thấy file Google Sheet — kiểm tra lại link'), { status: 400 })
  // Sheet riêng tư → Google chuyển sang trang đăng nhập (accounts.google.com) → coi như chưa chia sẻ công khai
  const host = (() => { try { return new URL(r.url).hostname } catch { return 'docs.google.com' } })()
  const html = r.ok && host === 'docs.google.com' ? await r.text() : ''
  const tabs = [...html.matchAll(/items\.push\(\{name: "((?:[^"\\]|\\.)*)", pageUrl: "[^"]*", gid: "(\d+)"/g)].map(m => ({ name: unescapeJs(m[1]).trim(), gid: m[2] }))
  if (!tabs.length) throw Object.assign(new Error('Không đọc được file — hãy chia sẻ Sheet ở chế độ “Bất kỳ ai có đường liên kết đều xem được”'), { status: 400 })
  return { id, tabs }
}
const MAX_TABS = 60
const DAY = 86400e3
const isoDay = ms => new Date(ms).toISOString().slice(0, 10)

/** Kế hoạch đồng bộ cả dự án: từng trang tính → vòng lặp có sẵn (khớp tên) / vòng lặp mới (ngày gợi ý) / bỏ qua */
export async function planProject(project) {
  const { id, tabs } = await fetchSheetTabs(project.sheetUrl)
  const iters = store.all('iterations').filter(i => i.projectId === project.id)
  const byName = new Map(iters.map(i => [norm(i.name), i]))
  // Ngày gợi ý cho vòng lặp mới: nối tiếp vòng lặp mới nhất, cùng độ dài (mặc định 14 ngày)
  const last = [...iters].sort((a, b) => String(b.endDate).localeCompare(String(a.endDate)))[0]
  const len = last?.startDate && last?.endDate ? Math.max(1, Math.round((Date.parse(last.endDate) - Date.parse(last.startDate)) / DAY) + 1) : 14
  let nextStart = last?.endDate ? Date.parse(last.endDate) + DAY : Date.parse(isoDay(Date.now()))
  const out = []
  for (const [index, tab] of tabs.slice(0, MAX_TABS).entries()) {
    const it = byName.get(norm(tab.name))
    const row = { gid: tab.gid, name: tab.name, index }   // index = thứ tự trang tính trong file → thứ tự vòng lặp trong app
    if (it?.sheetUrl) { out.push({ ...row, status: 'own', iterationId: it.id, iterationName: it.name }); continue }
    let raw
    try { raw = await fetchCsv(`https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${tab.gid}`) }
    catch (e) { out.push({ ...row, status: 'error', reason: e.message }); continue }
    try {
      const target = it ?? { id: '__new__' + tab.gid, projectId: project.id, name: tab.name }
      // Mã nhân viên trùng người dùng chưa thuộc dự án → coi như thành viên (sẽ được thêm khi áp dụng)
      const newMembers = newMembersFrom(project, raw)
      // Cả dự án 1 file: mỗi trang tính độc lập — cùng PBI ở 2 trang (việc kéo sang vòng sau) vẫn nhập vào đúng từng vòng lặp
      const plan = planSync(target, raw, newMembers.map(m => m.id), { perTab: true })
      if (it) out.push({ ...row, status: 'existing', iterationId: it.id, iterationName: it.name, plan, newMembers })
      else out.push({ ...row, status: 'new', plan, newMembers })
    } catch (e) {
      // Thiếu cột bắt buộc → không phải trang công việc (VD “Hướng dẫn”, “Danh mục”) → bỏ qua
      out.push({ ...row, status: 'skip', reason: e.message })
    }
  }
  // Ngày gợi ý cho vòng lặp mới: gán từ trang DƯỚI lên (file xếp vòng mới nhất ở trên, giống danh sách vòng lặp trong app)
  for (const t of [...out].reverse().filter(x => x.status === 'new')) {
    t.startDate = isoDay(nextStart); t.endDate = isoDay(nextStart + (len - 1) * DAY)
    nextStart += len * DAY
  }
  return { tabs: out, more: Math.max(0, tabs.length - MAX_TABS) }
}

/** Áp dụng kế hoạch cả dự án. picks: [{ gid, startDate, endDate }] — trang tính được chọn (trang mới kèm ngày đã sửa) */
export function applyProject(user, project, planned, picks, mode, createIteration) {
  const pick = new Map((picks ?? []).map(p => [String(p.gid), p]))
  const res = { added: 0, updated: 0, created: 0, failed: [], tabs: 0, members: [] }
  // Thêm thành viên trước (mã nhân viên trong các trang tính được chọn) — để công việc giao cho họ ghi được
  const join = new Map()
  for (const t of planned.tabs) if (pick.has(String(t.gid)) && ['existing', 'new'].includes(t.status)) (t.newMembers ?? []).forEach(m => join.set(m.id, m))
  if (join.size) res.members = addMembers(project.id, [...join.values()])
  for (const t of planned.tabs) {
    const p = pick.get(String(t.gid))
    if (!p || !t.plan || !['existing', 'new'].includes(t.status)) continue
    let it = t.iterationId ? store.get('iterations', t.iterationId) : null
    if (t.status === 'new') {
      const startDate = /^\d{4}-\d{2}-\d{2}$/.test(p.startDate ?? '') ? p.startDate : t.startDate
      const endDate = /^\d{4}-\d{2}-\d{2}$/.test(p.endDate ?? '') && p.endDate >= startDate ? p.endDate : t.endDate
      it = createIteration({ name: t.name, startDate, endDate })
      res.created++
    }
    if (it.sheetIndex !== t.index) it = store.put('iterations', { ...it, sheetIndex: t.index }) ?? { ...it, sheetIndex: t.index }
    const r = applySync(user, it, { ...t.plan, add: t.plan.add }, mode)
    res.added += r.added; res.updated += r.updated; res.tabs++
    res.failed.push(...r.failed.map(f => ({ ...f, label: `${t.name} · ${f.label}` })))
  }
  // Thứ tự vòng lặp theo thứ tự trang tính (kể cả trang không chọn lần này)
  for (const t of planned.tabs) {
    const it = t.iterationId && store.get('iterations', t.iterationId)
    if (it && it.sheetIndex !== t.index) store.put('iterations', { ...it, sheetIndex: t.index })
  }
  return res
}
export const projectPlanView = p => ({ more: p.more, tabs: p.tabs.map(({ plan, ...t }) => ({ ...t, ...(plan ? { plan: planView(plan) } : {}) })) })

/* Ngữ cảnh kiểm tra cho lõi nhập (giống trình duyệt nhưng lấy từ kho máy chủ) */
/** Người dùng có MÃ NHÂN VIÊN trùng giá trị ở cột PD / BA của Sheet nhưng CHƯA là thành viên dự án (chưa bị khóa, bộ phận nào cũng được)
    → đồng bộ sẽ tự thêm họ làm Thành viên. Trả [{ id, name, code, role }] */
export function newMembersFrom(project, rawRows) {
  const users = store.all('users').filter(u => u.status !== 'disabled' && !project.memberIds?.includes(u.id) && String(u.code ?? '').trim())
  const out = new Map()
  const ROLE_NAMES = { admin: 'Quản trị hệ thống', HRBP: 'HRBP', QA: 'QA', PO: 'PO', PDL: 'PD Lead', BA: 'BA', PD: 'PD' }
  for (const field of ['pdId', 'baId']) {
    for (const v of columnValues(rawRows, field)) {
      const u = users.find(x => norm(x.code) === norm(v))
      if (u) out.set(u.id, { id: u.id, name: u.name, code: u.code, role: ROLE_NAMES[u.role] ?? (u.role || 'chưa chọn bộ phận') })
    }
  }
  return [...out.values()]
}

function ctxFor(projectId, extraMemberIds = []) {
  const project = store.get('projects', projectId)
  const users = store.all('users')
  return {
    // Người dùng chưa bị khóa (gồm cả người chưa đăng nhập lần nào) — giống trình duyệt (isActiveUser)
    membersOf: (pid, role) => users.filter(u => (project?.memberIds?.includes(u.id) || extraMemberIds.includes(u.id)) && u.status !== 'disabled' && (!role || u.role === role)),
    allUsers: users,
    closedDateError: (date, pdId) => (date && pdId && isPdClosed(date.slice(0, 7), pdId)
      ? `Điểm tháng ${monthLabelOf(date.slice(0, 7))} của PD đã chốt — không thể chọn ngày hoàn thành trong tháng này` : ''),
    ownProjectFor: (pdId, pid) => (primaryProjectIdsOf(users.find(u => u.id === pdId)).includes(pid) ? 'Có' : 'Không'),
    tasks: store.all('tasks'),
    iterationName: id => store.get('iterations', id)?.name ?? '',
  }
}

const FIELD_NAMES = {
  pbi: 'PBI', stage: 'Loại việc', baPoint: 'BA Point', baDeadline: 'Deadline phân tích', baCompletedDate: 'Ngày hoàn thành (BA)', content: 'Nội dung', pdId: 'PD', baId: 'BA', expectedDate: 'Deadline thiết kế', solutionBy: 'Người đưa giải pháp',
  complexity: 'Độ phức tạp thiết kế', businessLevel: 'Hệ số nghiệp vụ', platform: 'Nền tảng', concept: 'Concept', isOwnProject: 'Dự án phụ trách', designStatus: 'Trạng thái',
  designLink: 'Link thiết kế', devmodeLink: 'Link devmode', completedDate: 'Ngày hoàn thành', mainScreens: 'Màn hình chính',
  subScreens: 'Màn hình phụ', qualityRating: 'Mức hài lòng', ratingReason: 'Lý do đánh giá', manualScore: 'Điểm nhập tay',
}

/** Lập kế hoạch đồng bộ (chưa ghi gì): { add[], update[], errors[], skipped[], missing, total } */
export function planSync(iteration, rawRows, extraMemberIds = [], { perTab = false } = {}) {
  const ctx = ctxFor(iteration.projectId, extraMemberIds)
  const { missingColumns, rows } = validateRows(rawRows, iteration.projectId, { anyRole: true }, ctx)
  if (missingColumns.length) throw Object.assign(new Error(`Sheet thiếu cột bắt buộc: ${missingColumns.join(', ')} — dùng đúng template nhập công việc`), { status: 400 })

  const mine = store.all('tasks').filter(t => t.iterationId === iteration.id)
  const byPbi = new Map(), byContent = new Map()
  for (const t of mine) {
    if (String(t.pbi ?? '').trim()) byPbi.set(String(t.pbi).trim(), t)
    else byContent.set(norm(t.content), t)
  }
  const otherIter = new Map()
  if (!perTab) for (const t of ctx.tasks) if (t.projectId === iteration.projectId && t.iterationId !== iteration.id && String(t.pbi ?? '').trim()) otherIter.set(String(t.pbi).trim(), t)

  const plan = { add: [], update: [], errors: [], skipped: [], total: rows.length }
  const matched = new Set(), seen = new Set()
  for (const r of rows) {
    const pbi = String(r.data.pbi ?? '').trim()
    const label = `Dòng ${r.rowNo}${pbi ? ` (PBI ${pbi})` : ''}`
    if (r.errors.length) { plan.errors.push({ row: r.rowNo, label, reason: r.errors.join('; ') }); continue }
    if (pbi && seen.has(pbi)) { plan.skipped.push({ row: r.rowNo, label, reason: 'PBI lặp lại trong Sheet — chỉ lấy dòng đầu' }); continue }
    if (pbi) seen.add(pbi)
    const t = pbi ? byPbi.get(pbi) : byContent.get(norm(r.data.content))
    if (!t) {
      const other = pbi && otherIter.get(pbi)
      if (other) { plan.skipped.push({ row: r.rowNo, label, reason: `Đã có ở vòng lặp “${ctx.iterationName(other.iterationId)}”` }); continue }
      plan.add.push({ row: r.rowNo, label, content: r.data.content, data: r.data })
      continue
    }
    matched.add(t.id)
    if (isLocked(t)) { plan.skipped.push({ row: r.rowNo, label, reason: 'Thuộc tháng PD đã chốt điểm' }); continue }
    const changes = {}
    for (const [f, v] of Object.entries(r.data)) {
      if (!r.filled[f] || f === 'isOwnProject' || sameValue(v, t[f])) continue        // ô trống trên Sheet → giữ dữ liệu app
      if (RATING_FIELDS.includes(f) && String(t[f] ?? '').trim() !== '') continue      // đánh giá đã nhập trong app → giữ
      changes[f] = v
    }
    if (Object.keys(changes).length) plan.update.push({
      row: r.rowNo, label, taskId: t.id, content: t.content, changes,
      fields: Object.keys(changes).map(f => FIELD_NAMES[f] ?? f),
    })
  }
  plan.missing = mine.filter(t => !matched.has(t.id)).length   // việc trong app không có trên Sheet (giữ nguyên)
  return plan
}

/** Thêm người dùng làm Thành viên dự án (mã nhân viên trong Sheet) — trả danh sách người vừa thêm */
export function addMembers(projectId, members) {
  const p = store.get('projects', projectId)
  const ids = (members ?? []).map(m => m.id).filter(id => !p.memberIds.includes(id))
  if (!ids.length) return []
  store.put('projects', { ...p, memberIds: [...p.memberIds, ...ids], memberRoles: { ...(p.memberRoles ?? {}), ...Object.fromEntries(ids.map(id => [id, 'member'])) } })
  return members.filter(m => ids.includes(m.id))
}

/** Áp dụng kế hoạch với quyền của `user` — trả số việc thêm / cập nhật + lỗi từng việc */
export function applySync(user, iteration, plan, mode) {
  const out = { added: 0, updated: 0, failed: [] }
  const at = new Date().toISOString()
  const writes = []
  for (const a of plan.add) {
    try { const t = checkTaskWrite(user, { ...a.data, id: uid('t'), iterationId: iteration.id }); t.createdAt = at; t.source = 'sheet'; writes.push(t); out.added++ }
    catch (e) { out.failed.push({ label: a.label, reason: e.message }) }
  }
  if (mode === 'merge') for (const u of plan.update) {
    try { writes.push(checkTaskWrite(user, { id: u.taskId, ...u.changes })); out.updated++ }
    catch (e) { out.failed.push({ label: u.label, reason: e.message }) }
  }
  if (writes.length) store.tx(() => writes.forEach(t => store.put('tasks', t)))
  return out
}

/** Tóm tắt kế hoạch gửi về trình duyệt (bỏ dữ liệu thô) */
/** Đồng bộ 1 vòng lặp: đọc Sheet → người mới (mã nhân viên trùng, chưa thuộc dự án) → kế hoạch */
export async function planIteration(it) {
  const raw = await fetchSheetRows(it.sheetUrl)
  const newMembers = newMembersFrom(store.get('projects', it.projectId), raw)
  return { ...planSync(it, raw, newMembers.map(m => m.id)), newMembers }
}

export const planView = p => ({
  total: p.total, missing: p.missing, newMembers: p.newMembers ?? [],
  add: p.add.map(({ row, label, content }) => ({ row, label, content })),
  update: p.update.map(({ row, label, content, fields }) => ({ row, label, content, fields })),
  errors: p.errors, skipped: p.skipped,
})
