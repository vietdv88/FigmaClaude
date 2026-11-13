/* ═══ Từ viết tắt → tooltip giải thích (quy chuẩn: mọi từ viết tắt phải có tooltip) ═══
   App khai báo 1 lần: registerAbbreviations({ PD: 'Product Designer …', PBI: '…' })
   Tiêu đề cột DataTable / nhãn AppInput, TipField có từ viết tắt → tự hiện tooltip giải thích. */
const dict = {}
export function registerAbbreviations(map) { Object.assign(dict, map) }
/** Giải thích các từ viết tắt có trong nhãn (VD "Số PBI" → "PBI: Product Backlog Item …"); không có → '' */
export function abbrTip(label) {
  const words = String(label ?? '').match(/[A-ZĐ]{2,}[0-9]*/g) ?? []
  return [...new Set(words)].filter(w => dict[w]).map(w => `${w}: ${dict[w]}`).join(' · ')
}
