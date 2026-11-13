/* Avatar chữ cái đầu — QUY TẮC CHUNG (DataTable, ControlHeader, Combobox, avatar người dùng của app) — Figma “_Avatar Color Item” (6019:6514):
   - Chữ cái đầu: chữ đầu của tối đa 2 từ đầu, viết hoa (“Trần Hậu” → “TH”)
   - Nền THEO THEME: Color=Brand → BG/Brand/Brand Light Hover (đổi màu cùng chủ đề) · Color=Neutral → BG/Neutral/Neutral Light
   - Chữ: Text/Primary Neutral · viền trắng 1px · có ảnh → ảnh phủ kín (object-fit: cover), viền Stroke/Neutral; ảnh lỗi → quay về chữ cái đầu */
export const AVATAR_COLORS = {
  brand:   { bg: 'var(--bg-brand-light-hover)', fg: 'var(--text-primary)' },
  neutral: { bg: 'var(--bg-neutral-light)',     fg: 'var(--text-primary)' },
}
export const avatarInitials = (name = '') => String(name || '').split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
/* color = 'auto': mỗi người 1 màu cố định theo tên (băm tên → 1 trong 6 nền BG/(màu)/Light Hover; chữ vẫn Text/Primary) — dùng cho DANH SÁCH NGƯỜI
   (card dashboard, bảng nhân sự) để dễ phân biệt / sinh động. Cùng tên luôn cùng màu (không random mỗi lần vẽ). */
export const AVATAR_AUTO = ['brand', 'success', 'warning', 'danger', 'info', 'accent'].map(c => ({ bg: `var(--bg-${c}-light-hover)`, fg: 'var(--text-primary)' }))   // chỉ đổi NỀN — chữ luôn Text/Primary (quy chuẩn avatar)
const hash = s => { let h = 0; for (const ch of String(s || '')) h = (h * 31 + ch.codePointAt(0)) >>> 0; return h }
/** Màu avatar chữ cái — mặc định Brand (theo theme) · 'neutral' · 'auto' (màu theo tên). */
export const avatarColor = (name = '', color = 'brand') => (color === 'auto' ? AVATAR_AUTO[hash(name) % AVATAR_AUTO.length] : AVATAR_COLORS[color] || AVATAR_COLORS.brand)
