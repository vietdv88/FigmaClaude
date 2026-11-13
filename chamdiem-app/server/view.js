import * as store from './store.js'
import { publicUser } from './auth.js'
import { managerIdsOf, pdProjectsOf, reasonMissing, computeFinalScore, deptAdminOf, leadRates, leadsOf, leadTotalOf, leadRoleOf, isPdRole } from '../src/store/scoring.js'

/* ═══════════════════════════════════════════════════════════════════════════
   Phạm vi xem dữ liệu của 1 người — tính 1 lần (tập hợp) rồi lọc nhanh, dùng chung cho
   /api/bootstrap và realtime (gửi đúng phần thay đổi cho đúng người).
   Quy tắc giống rules.canSeeTask / fullViewOf, chỉ là bản tính sẵn để lọc hàng chục nghìn bản ghi.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Người thực hiện (pdId có trong công việc) — tính lại khi dữ liệu đổi (theo seq) */
let perfKey = '', perfSet = new Set(), perfSig = '', perfVer = 0
function performerIds() {
  const k = store.kindVersion('tasks')
  if (k !== perfKey) {
    const next = new Set(store.all('tasks').map(t => t.pdId).filter(Boolean)), sig = [...next].sort().join()
    if (sig !== perfSig) { perfSet = next; perfSig = sig; perfVer++ }   // tập người thực hiện thật sự đổi mới tính lại phạm vi xem
    perfKey = k
  }
  return perfSet
}

/* Nhớ phạm vi xem theo người — chỉ tính lại khi dữ liệu người dùng / dự án / tập người thực hiện đổi.
   Realtime: mỗi lần có người lưu, máy chủ gửi phần thay đổi cho TỪNG kết nối → không tính lại cho từng người mỗi lần (1000 người dùng cùng lúc). */
const viewCache = new Map()   // userId → { key, v }
export function viewOf(u) {
  performerIds()
  const key = `${store.kindVersion('users')}|${store.kindVersion('projects')}|${perfVer}|${u.role}|${u.deptAdmin ?? ''}`
  const hit = viewCache.get(u.id)
  if (hit && hit.key === key) return hit.v
  const v = computeView(u)
  if (viewCache.size > 5000) viewCache.clear()
  viewCache.set(u.id, { key, v })
  return v
}
function computeView(u) {
  const admin = u.role === 'admin'   // Quản trị hệ thống · QA chỉ xem dự án được gán như thành viên (quyền sửa chặn ở rules.js)
  const hrbp = u.role === 'HRBP'   // HRBP: xem toàn bộ dự án, công việc, điểm PD / BA — chỉ xem (sửa / chốt chặn ở rules.js)
  const dept = deptAdminOf(u), all = admin || !!dept || hrbp   // Quản trị PD / BA: xem mọi dự án, công việc
  const pdAll = admin || dept === 'PD' || hrbp, baAll = admin || dept === 'BA' || hrbp
  const projects = store.all('projects'), users = store.all('users')
  const realPids = new Set(projects.filter(p => p.memberIds?.includes(u.id)).map(p => p.id))   // dự án mình thật sự tham gia
  const memberPids = all ? new Set(projects.map(p => p.id)) : realPids
  const managed = new Set(users.filter(x => managerIdsOf(x).includes(u.id)).map(x => x.id))   // người mình quản lý trực tiếp
  // PD xem được tổng điểm tháng: mình, người mình quản lý, PD làm cùng dự án (Quản trị: mọi PD)
  // “PD” = bộ phận PD + người bộ phận khác có công việc được giao ở cột PD (người thực hiện)
  const performers = performerIds()
  // Điểm PD: Quản trị hệ thống / Quản trị PD thấy mọi PD; người khác (kể cả Quản trị BA): PD làm cùng dự án mình THẬT SỰ tham gia
  const peerPds = new Set(users.filter(x => (isPdRole(x.role) || performers.has(x.id)) && (pdAll || x.id === u.id || managed.has(x.id)
    || projects.some(p => realPids.has(p.id) && p.memberIds?.includes(x.id)))).map(x => x.id))
  const fullView = pdId => pdAll || pdId === u.id || managed.has(pdId)
  const seeTask = t => all || memberPids.has(t.projectId) || t.pdId === u.id || t.baId === u.id || managed.has(t.pdId) || managed.has(t.baId)
  return { u, admin, all, pdAll, baAll, memberPids, realPids, managed, peerPds, fullView, seeTask }
}

/* ── Tổng hợp điểm tháng theo PD (đầy đủ mọi dự án) ──
   Tính toàn bộ 1 lần, sau đó mỗi thay đổi chỉ tính lại đúng (tháng, PD) bị ảnh hưởng. Đổi hệ số → tính lại hết. */
const ZERO = () => ({ final: 0, pbis: 0, unrated: 0, noReason: 0, lr: 0, ls: 0 })   // lr / ls: tổng điểm việc tính cho Lead theo review / chốt giải pháp
let idx = null, idxSeq = 0, idxCfg = null
/** Cộng điểm việc vào phần tính cho Lead theo vai trò (không tham gia → không cộng) */
const addLead = (s, t, f) => { const k = leadRoleOf(t); if (k) s[k === 'solution' ? 'ls' : 'lr'] += f }
const counts = (t, cfg) => !!t?.completedDate && !!t.pdId && (cfg?.countedStatuses ?? []).includes(t.designStatus)
const closingOf = (ym, pd) => store.all('closings').find(c => c.month === ym && (c.pdId === pd || !c.pdId))
/** Tính 1 cặp (tháng, PD): theo bản chốt nếu đã chốt, không thì từ công việc */
function computePair(ym, pd, cfg) {
  const s = ZERO(), c = closingOf(ym, pd)
  if (c) {
    for (const i of c.items ?? []) if (i.pdId === pd) { const f = Number(i.final) || 0; s.final += f; addLead(s, i, f); s.pbis++; if (!i.qualityRating) s.unrated++ }
  } else {
    for (const t of store.all('tasks')) {
      if (t.pdId !== pd || !counts(t, cfg) || t.completedDate.slice(0, 7) !== ym) continue
      const f = computeFinalScore(t, cfg); s.final += f; addLead(s, t, f); s.pbis++
      if (!t.qualityRating) s.unrated++
      if (reasonMissing(t)) s.noReason++
    }
  }
  s.final = Math.round(s.final * 1000) / 1000
  return s
}
function rebuild(cfg) {
  idx = {}
  const pairs = new Set()
  for (const t of store.all('tasks')) if (counts(t, cfg)) pairs.add(t.completedDate.slice(0, 7) + '|' + t.pdId)
  for (const c of store.all('closings')) for (const i of c.items ?? []) if (i.pdId) pairs.add(c.month + '|' + i.pdId)
  // Gom công việc theo cặp để tính 1 lượt (không quét lại danh sách cho từng cặp)
  const byPair = new Map()
  for (const t of store.all('tasks')) {
    if (!counts(t, cfg)) continue
    const k = t.completedDate.slice(0, 7) + '|' + t.pdId
    let a = byPair.get(k); if (!a) byPair.set(k, a = []); a.push(t)
  }
  for (const k of pairs) {
    const [ym, pd] = k.split('|'), c = closingOf(ym, pd)
    const s = c ? computePair(ym, pd, cfg) : ZERO()
    if (!c) {
      for (const t of byPair.get(k) ?? []) { const f = computeFinalScore(t, cfg); s.final += f; addLead(s, t, f); s.pbis++; if (!t.qualityRating) s.unrated++; if (reasonMissing(t)) s.noReason++ }
      s.final = Math.round(s.final * 1000) / 1000
    }
    if (s.pbis) (idx[ym] ??= {})[pd] = s
  }
}
export function summaryIndex() {
  const cfg = store.getConfig(), cfgKey = JSON.stringify(cfg)
  const changes = idx && cfgKey === idxCfg ? store.changesSince(idxSeq) : null
  if (!changes) rebuild(cfg)
  else {
    const dirty = new Set()
    for (const { kind, prev, next } of changes) {
      if (kind === 'tasks') for (const t of [prev, next]) { if (counts(t, cfg)) dirty.add(t.completedDate.slice(0, 7) + '|' + t.pdId) }
      else if (kind === 'closings') {
        const c = next ?? prev
        if (!c.pdId) { rebuild(cfg); dirty.clear(); break }   // bản chốt cả tháng kiểu cũ
        dirty.add(c.month + '|' + c.pdId)
      }
    }
    for (const k of dirty) {
      const [ym, pd] = k.split('|'), s = computePair(ym, pd, cfg)
      if (s.pbis) (idx[ym] ??= {})[pd] = s; else if (idx[ym]) delete idx[ym][pd]
    }
  }
  idxSeq = store.currentSeq(); idxCfg = cfgKey
  return idx
}

/* ── Điểm dẫn dắt (PD Lead) ghép vào tổng điểm tháng ──
   own = điểm tự vẽ · lead = điểm dẫn dắt · final = own + lead. Lead đã chốt → lấy đúng bản chốt (leadItems). */
function leadPoint(idx, ym, leadId, users, cfg) {
  const c = closingOf(ym, leadId)
  if (c?.pdId) return leadTotalOf(c.leadItems)
  const r = leadRates(cfg)
  let sum = 0
  for (const pd of users) {
    const ls = leadsOf(pd, users)
    if (!ls.some(l => l.id === leadId)) continue
    const x = idx[ym]?.[pd.id]
    if (x) sum += (x.lr * (Number(r.review) || 0) + x.ls * (Number(r.solution) || 0)) / ls.length
  }
  return Math.round(sum * 1000) / 1000
}
function withLead(idx, ym, pd, users, cfg) {
  const s = idx[ym]?.[pd] ?? ZERO(), lead = leadPoint(idx, ym, pd, users, cfg)
  const { lr, ls, ...rest } = s
  return { ...rest, own: s.final, lead, final: Math.round((s.final + lead) * 1000) / 1000 }
}
/** Lead bị ảnh hưởng khi điểm của PD trong tháng đổi */
const leadIdsOf = (pdId, users) => leadsOf(users.find(u => u.id === pdId), users).map(u => u.id)

/** Tổng hợp điểm của các PD người này được xem: { ym: { pdId: summary } } */
export function summariesFor(v, pairs) {
  const idx = summaryIndex(), out = {}, users = store.all('users'), cfg = store.getConfig()
  const put = (ym, pd) => { if (v.peerPds.has(pd)) (out[ym] ??= {})[pd] = withLead(idx, ym, pd, users, cfg) }
  if (pairs) {   // chỉ các cặp (tháng, PD) vừa đổi — PD không còn việc trong tháng → summary 0; kèm Lead của PD đó
    for (const [ym, pd] of pairs) { put(ym, pd); for (const l of leadIdsOf(pd, users)) put(ym, l) }
    return out
  }
  for (const [ym, m] of Object.entries(idx)) {
    const ids = new Set(Object.keys(m))
    for (const pd of Object.keys(m)) for (const l of leadIdsOf(pd, users)) ids.add(l)
    for (const c of store.all('closings')) if (c.month === ym && c.pdId && c.leadItems?.length) ids.add(c.pdId)
    for (const pd of ids) { const s = withLead(idx, ym, pd, users, cfg); if (s.pbis || s.lead) put(ym, pd) }
  }
  return out
}
export const pdProjectsFor = v => Object.fromEntries([...v.peerPds].map(id => [id, pdProjectsOf(store.all('projects'), id)]))

/** Bản chốt người này được xem (chi tiết công việc lọc theo quyền xem) */
export const closingFor = (v, c, uids) => ((v.pdAll || !c.pdId || v.peerPds.has(c.pdId) || (!v.all && uids?.has(c.pdId)))
  ? (({ id, ...rest }) => {
    const ok = i => v.realPids.has(i.projectId) || v.seeTask(i) && !v.all
    return { ...rest, items: v.pdAll ? c.items : (c.items ?? []).filter(ok), ...(c.leadItems ? { leadItems: v.pdAll ? c.leadItems : c.leadItems.filter(ok) } : {}) }
  })(c) : null)

/** Thông số tháng: nghỉ lễ công khai; ngày làm / effort / kỳ vọng chỉ của PD mình xem trọn */
export const monthFor = (v, { id, holidays, people = {} }) =>
  ({ id, holidays, people: v.pdAll ? people : Object.fromEntries(Object.entries(people).filter(([pdId]) => v.fullView(pdId))) })

/** Hồ sơ người dùng gửi cho người không phải Quản trị: ẩn email người chưa kích hoạt */
export const userFor = (v, x) => {
  const p = publicUser(x); if (x.id !== v.u.id) delete p.prefs
  delete p.baLevel   // Level BA đã bỏ — dữ liệu cũ (nếu có) không gửi xuống
  return v.admin ? p : { ...p, email: x.status === 'active' ? x.email : '' }
}   // prefs: chỉ của chính mình
