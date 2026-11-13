/**
 * Hiểu ngày / giờ người dùng gõ tay (ô AppDatebox · AppDatePicker).
 * Ngày: 20/10/2026 · 20-10-2026 · 20.10.26 · 20/10 (năm nay) · 20102026 · 201026 · 2010 (năm nay) · 20 (tháng này)
 * Giờ:  10:30 · 10h30 · 10h · 1030 · 930 (09:30) · 10 (10:00) · 103045 (10:30:45)
 * Sai ngày / giờ (31/02, 25:00…) → null.
 */
const pad = n => String(n).padStart(2, '0')

/** → 'YYYY-MM-DD' hoặc null */
export function parseDateText(s, today = new Date()) {
  const t = String(s ?? '').trim().replace(/[\s/.\-]+$/, '')   // bỏ dấu thừa ở cuối do mask (20/10/ → 20/10)
  let d, m, y
  const sep = /^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2}|\d{4}))?$/.exec(t)
  if (sep) [d, m, y] = [sep[1], sep[2], sep[3]]
  else if (/^\d+$/.test(t)) {
    if (t.length === 8) [d, m, y] = [t.slice(0, 2), t.slice(2, 4), t.slice(4)]
    else if (t.length === 6) [d, m, y] = [t.slice(0, 2), t.slice(2, 4), t.slice(4)]
    else if (t.length === 4) [d, m] = [t.slice(0, 2), t.slice(2)]
    else if (t.length <= 2) d = t
    else return null
  } else return null
  const yy = y == null ? today.getFullYear() : y.length === 2 ? 2000 + +y : +y
  const mm = m == null ? today.getMonth() + 1 : +m
  const x = new Date(yy, mm - 1, +d)
  if (!+d || x.getFullYear() !== yy || x.getMonth() !== mm - 1 || x.getDate() !== +d) return null
  return `${yy}-${pad(mm)}-${pad(+d)}`
}

/** → [giờ, phút, giây] hoặc null */
export function parseTimeText(s) {
  const t = String(s ?? '').trim().toLowerCase().replace(/[\s:.]+$/, '')   // 08: → 08
  let h, m = 0, sec = 0
  const sep = /^(\d{1,2})\s*[:h.]\s*(\d{1,2})?(?:\s*[:m.]\s*(\d{1,2}))?\s*(?:s|p|ph|phút)?$/.exec(t)
  if (sep) [h, m, sec] = [+sep[1], +(sep[2] || 0), +(sep[3] || 0)]
  else if (/^\d+$/.test(t)) {
    const n = t.length
    if (n <= 2) h = +t
    else if (n === 3) [h, m] = [+t[0], +t.slice(1)]
    else if (n === 4) [h, m] = [+t.slice(0, 2), +t.slice(2)]
    else if (n === 5) [h, m, sec] = [+t[0], +t.slice(1, 3), +t.slice(3)]
    else if (n === 6) [h, m, sec] = [+t.slice(0, 2), +t.slice(2, 4), +t.slice(4)]
    else return null
  } else return null
  return h < 24 && m < 60 && sec < 60 ? [h, m, sec] : null
}

/** Ngày giờ: "20/10/2026 10:30" · "20102026 1030" · "201020261030" · "20/10/2026" (00:00) → { date, time } hoặc null */
export function parseDateTimeText(s, today = new Date()) {
  const t = String(s ?? '').trim().replace(/[\s:]+$/, '')
  let a = t, b = ''
  const sp = /^(\S+)\s+(.+)$/.exec(t)
  if (sp) [a, b] = [sp[1], sp[2]]
  else if (/^\d{10,14}$/.test(t)) [a, b] = [t.slice(0, 8), t.slice(8)]
  const date = parseDateText(a, today); if (!date) return null
  const time = b ? parseTimeText(b) : [0, 0, 0]; if (!time) return null
  return { date, time }
}

/* ── Mask khi gõ: tự chèn / : và khoảng trắng ngay lúc gõ (không đợi Enter) ──
   kind: 'date' (DD/MM/YYYY) · 'time' (HH:mm[:ss]) · 'datetime' (DD/MM/YYYY HH:mm[:ss])
   Thông minh: ngày gõ 4–9 → 04/ · tháng gõ 2–9 → 02/ · giờ gõ 3–9 → 03: · phút/giây gõ 6–9 → 06:
   Gõ dấu / . - : h hoặc khoảng trắng → đệm 0 phần đang gõ và sang phần sau. Xóa (deleting) thì không tự thêm dấu ở cuối. */
const SEGS = {
  date: [{ n: 2, max1: 3, sep: '/' }, { n: 2, max1: 1, sep: '/' }, { n: 4, sep: ' ' }],
  time: [{ n: 2, max1: 2, sep: ':' }, { n: 2, max1: 5, sep: ':' }, { n: 2, max1: 5 }],
}
export function maskDateTyping(raw, kind, { seconds = false, deleting = false } = {}) {
  const tm = seconds ? SEGS.time : SEGS.time.slice(0, 2)
  const segs = kind === 'date' ? SEGS.date.slice(0, 3) : kind === 'time' ? tm : [...SEGS.date, ...tm]
  const parts = ['']; let i = 0
  const next = () => { if (i < segs.length - 1) { i++; parts.push('') } else return false; return true }
  for (const ch of String(raw)) {
    const s = segs[i]
    if (/\d/.test(ch)) {
      if (parts[i].length >= s.n && !next()) break
      const cur = segs[i]
      if (parts[i] === '' && cur.max1 != null && +ch > cur.max1) { parts[i] = '0' + ch } else parts[i] += ch
      if (parts[i].length >= cur.n && i < segs.length - 1) next()
    } else if (/[/.\-:h\s]/i.test(ch) && parts[i] !== '') {
      if (parts[i].length < s.n && s.n === 2) parts[i] = parts[i].padStart(2, '0')
      if (i < segs.length - 1) next()
    }
  }
  if (deleting) while (parts.length > 1 && parts[parts.length - 1] === '') parts.pop()
  let out = ''
  parts.forEach((p, k) => { if (k > 0) out += segs[k - 1].sep; out += p })
  return out
}

/** Gắn vào @input: mask giá trị ô, giữ con trỏ sau đúng số chữ số đã gõ. Trả về chuỗi mới. */
export function onMaskedInput(e, kind, seconds = false) {
  const el = e.target, raw = el.value
  const caret = el.selectionStart ?? raw.length
  const digitsBefore = raw.slice(0, caret).replace(/\D/g, '').length
  const atEnd = caret >= raw.length
  const v = maskDateTyping(raw, kind, { seconds, deleting: /^delete/.test(e.inputType || '') })
  if (v !== raw) {
    el.value = v
    let pos = v.length
    if (!atEnd) { pos = 0; for (let n = 0; pos < v.length && n < digitsBefore; pos++) if (/\d/.test(v[pos])) n++ }
    try { el.setSelectionRange(pos, pos) } catch {}
  }
  return v
}
