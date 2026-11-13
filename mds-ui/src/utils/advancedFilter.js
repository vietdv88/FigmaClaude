/* ═══ Bộ lọc nâng cao của bảng (dùng chung — TableFilterPanel / bộ lọc Advance) ═══
   Chuyển nguyên từ app Chấm điểm (store/advancedFilter.js) để mọi app dùng 1 nguồn.
   field: { key, label, type: 'text' | 'enum' | 'number' | 'date', options?: [{value,label}] | string[], multi?, get(row) }
   filter: { mode: 'all' | 'any', conditions: [{ id, key, op, value, value2 }] } */

export const OPERATORS = {
  text: [
    { value: 'contains', label: 'Chứa' }, { value: 'not-contains', label: 'Không chứa' },
    { value: 'equals', label: 'Bằng' }, { value: 'starts', label: 'Bắt đầu bằng' },
    { value: 'empty', label: 'Trống' }, { value: 'not-empty', label: 'Không trống' },
  ],
  enum: [
    { value: 'is', label: 'Là' }, { value: 'is-not', label: 'Không là' },
    { value: 'empty', label: 'Trống' }, { value: 'not-empty', label: 'Không trống' },
  ],
  number: [
    { value: 'eq', label: '=' }, { value: 'neq', label: '≠' }, { value: 'gt', label: '>' }, { value: 'gte', label: '≥' },
    { value: 'lt', label: '<' }, { value: 'lte', label: '≤' }, { value: 'between', label: 'Trong khoảng' },
  ],
  date: [
    { value: 'between', label: 'Trong khoảng' }, { value: 'on', label: 'Đúng ngày' },
    { value: 'before', label: 'Trước ngày' }, { value: 'after', label: 'Sau ngày' },
    { value: 'empty', label: 'Trống' }, { value: 'not-empty', label: 'Không trống' },
  ],
}
export const NO_VALUE_OPS = ['empty', 'not-empty']
export const RANGE_OPS = ['between']

const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase().trim()
export const optionsOf = f => (f.options ?? []).map(o => (typeof o === 'object' ? o : { value: o, label: o }))
const labelOf = (f, v) => optionsOf(f).find(o => o.value === v)?.label ?? v

/** Có giá trị (ô số bị xóa trắng trả NaN → coi như trống) */
export const hasValue = v => v !== '' && v != null && !(typeof v === 'number' && isNaN(v))

/** Điều kiện đã nhập đủ để áp dụng chưa */
export function isComplete(c) {
  if (!c.key || !c.op) return false
  if (NO_VALUE_OPS.includes(c.op)) return true
  if (RANGE_OPS.includes(c.op)) return hasValue(c.value) || hasValue(c.value2)
  return hasValue(c.value)
}

export function matchCondition(row, c, field) {
  const raw = field.get(row)
  const empty = raw === '' || raw == null || (Array.isArray(raw) && !raw.length)
  if (c.op === 'empty') return empty
  if (c.op === 'not-empty') return !empty
  switch (field.type) {
    case 'text': {
      const s = norm(raw), q = norm(c.value)
      if (c.op === 'contains') return s.includes(q)
      if (c.op === 'not-contains') return !s.includes(q)
      if (c.op === 'equals') return s === q
      if (c.op === 'starts') return s.startsWith(q)
      return true
    }
    case 'enum':
      // multi: giá trị là mảng (VD thành viên dự án) → "là" = có chứa
      if (field.multi) return c.op === 'is' ? raw.includes(c.value) : !raw.includes(c.value)
      return c.op === 'is' ? raw === c.value : raw !== c.value
    case 'number': {
      if (empty) return false
      const n = Number(raw), a = Number(c.value), b = Number(c.value2)
      switch (c.op) {
        case 'eq': return n === a
        case 'neq': return n !== a
        case 'gt': return n > a
        case 'gte': return n >= a
        case 'lt': return n < a
        case 'lte': return n <= a
        case 'between': return (!hasValue(c.value) || n >= a) && (!hasValue(c.value2) || n <= b)
      }
      return true
    }
    case 'date': {
      if (empty) return false
      const d = String(raw).slice(0, 10)
      switch (c.op) {
        case 'on': return d === c.value
        case 'before': return d < c.value
        case 'after': return d > c.value
        case 'between': return (!c.value || d >= c.value) && (!c.value2 || d <= c.value2)
      }
      return true
    }
  }
  return true
}

/** Mô tả 1 điều kiện thành chữ — dùng cho chip (fmtDate: định dạng ngày ISO → hiển thị, mặc định DD/MM/YYYY) */
const ddmmyyyy = iso => (iso ? String(iso).slice(0, 10).split('-').reverse().join('/') : '')
export function describe(c, field, fmtDate = ddmmyyyy) {
  if (!field) return ''
  const op = OPERATORS[field.type].find(o => o.value === c.op)?.label ?? c.op
  if (NO_VALUE_OPS.includes(c.op)) return `${field.label} ${op.toLowerCase()}`
  const v = x => (field.type === 'date' ? fmtDate(x) : field.type === 'enum' ? labelOf(field, x) : x)
  if (RANGE_OPS.includes(c.op)) {
    if (hasValue(c.value) && hasValue(c.value2)) return `${field.label} từ ${v(c.value)} đến ${v(c.value2)}`
    return hasValue(c.value) ? `${field.label} từ ${v(c.value)}` : `${field.label} đến ${v(c.value2)}`
  }
  return field.type === 'number' ? `${field.label} ${op} ${v(c.value)}` : `${field.label} ${op.toLowerCase()} ${v(c.value)}`
}

/** Tách điều kiện thành 3 phần cho tag lọc (Figma _Conditonal Filter / Box): { field, op, value } — trường · điều kiện · giá trị */
export function describeParts(c, field, fmtDate = ddmmyyyy) {
  if (!field) return { field: '', op: '', value: '' }
  const op = OPERATORS[field.type].find(o => o.value === c.op)?.label ?? c.op
  if (NO_VALUE_OPS.includes(c.op)) return { field: field.label, op: op.toLowerCase(), value: '' }
  const v = x => (field.type === 'date' ? fmtDate(x) : field.type === 'enum' ? labelOf(field, x) : field.type === 'number' && hasValue(x) ? Number(x).toLocaleString('vi-VN') : x)
  if (RANGE_OPS.includes(c.op)) {
    const value = hasValue(c.value) && hasValue(c.value2) ? `${v(c.value)} – ${v(c.value2)}` : hasValue(c.value) ? `từ ${v(c.value)}` : `đến ${v(c.value2)}`
    return { field: field.label, op: op.toLowerCase(), value }
  }
  return { field: field.label, op: field.type === 'number' ? op : op.toLowerCase(), value: String(v(c.value)) }
}

export const newCondition = field => ({
  id: Math.random().toString(36).slice(2, 9), key: field?.key ?? '',
  op: field ? OPERATORS[field.type][0].value : '', value: '', value2: '',
})

/** Lọc 1 dòng theo bộ lọc { mode, conditions } — chỉ tính điều kiện đã nhập đủ */
export function testRow(row, filter, fields) {
  const fieldOf = k => fields.find(f => f.key === k)
  const active = (filter?.conditions || []).filter(c => isComplete(c) && fieldOf(c.key))
  if (!active.length) return true
  const hits = active.map(c => matchCondition(row, c, fieldOf(c.key)))
  return filter.mode === 'any' ? hits.some(Boolean) : hits.every(Boolean)
}
