/* ═══ Tìm kiếm tiếng Việt (quy chuẩn): không phân biệt dấu / hoa thường + tìm theo CHỮ CÁI ĐẦU ═══
   VD "Khuất Quang Quân": gõ "quan", "khuat quang", "kqq" hoặc "kq" đều ra. */
export const normVi = v => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase()
/** Chữ cái đầu của mỗi từ (bỏ dấu): "Khuất Quang Quân" → "kqq" */
export const initialsOf = v => normVi(v).split(/[\s._\-@/]+/).filter(Boolean).map(w => w[0]).join('')
/**
 * text khớp query: chứa đoạn query (bỏ dấu) HOẶC chữ cái đầu bắt đầu bằng query (gõ liền, ≥ 2 ký tự).
 * text có thể là 1 chuỗi hoặc mảng (VD [tên, email, mã]) — khớp 1 phần tử là được; chữ cái đầu chỉ xét phần tử đầu (tên).
 */
export function matchText(text, query) {
  const q = normVi(query).trim()
  if (!q) return true
  const parts = (Array.isArray(text) ? text : [text]).filter(v => v != null && v !== '')
  if (parts.some(p => normVi(p).includes(q))) return true
  const compact = q.replace(/\s+/g, '')
  return compact.length >= 2 && !/\d/.test(compact) && parts.length > 0 && initialsOf(parts[0]).startsWith(compact)
}

/**
 * Tách text thành các đoạn [{ t, m }] — m = true là phần KHỚP từ khóa (để tô đậm / màu Brand), không phân biệt dấu / hoa thường:
 * gõ "binh" vẫn tô "Bình". Mỗi từ trong từ khóa tô riêng. Dùng cho danh sách kết quả tìm kiếm (AppGlobalSearch, AppSearchResultsDialog).
 */
export function highlightParts(text, query) {
  const s = String(text ?? ''), chars = Array.from(s)
  const folded = chars.map(c => normVi(c)[0] || c).join('')
  const words = normVi(query).split(/\s+/).filter(Boolean)
  if (!words.length) return [{ t: s, m: false }]
  const hit = new Array(chars.length).fill(false)
  for (const w of words) { let i = folded.indexOf(w); while (i >= 0) { for (let k = i; k < i + w.length && k < hit.length; k++) hit[k] = true; i = folded.indexOf(w, i + w.length) } }
  const out = []
  chars.forEach((c, i) => { const last = out[out.length - 1]; if (last && last.m === hit[i]) last.t += c; else out.push({ t: c, m: hit[i] }) })
  return out
}
