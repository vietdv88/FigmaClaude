/* Chép chữ vào clipboard. navigator.clipboard chỉ chạy trên https / localhost — vào bằng http://IP sẽ bị chặn
   → dự phòng bằng textarea ẩn + execCommand('copy'). Trả về true nếu chép được. */
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true }
  catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text })
    ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { ok = false }
    ta.remove()
    return ok
  }
}
