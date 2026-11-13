/* ═══ THU NHỎ ẢNH TRƯỚC KHI GỬI AI (chạy trên trình duyệt) ═══
   • Ảnh thường: cạnh dài tối đa 1536px · ảnh rất dài (thiết kế cả trang): giữ ngang ≤ 1200px cho chữ đủ đọc rồi cắt dọc thành nhiều đoạn ≤ 1536px
   • Nén JPEG 85% (nền trắng cho ảnh trong suốt) → ảnh chụp 5–10MB còn ~150–400KB, ~1.500 token / ảnh
   • Kèm ảnh nhỏ (thumb) để hiện trong khung chat — ảnh đầy đủ không lưu lại sau khi gửi */
export const AVA_MAX_IMAGES = 3
const MAX_EDGE = 1536, TALL_WIDTH = 1200, TALL_RATIO = 2.5, THUMB = 160, QUALITY = 0.85

async function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') { try { return await createImageBitmap(file) } catch { /* trình duyệt cũ → dùng Image */ } }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image(); img.src = url; await img.decode(); return img
  } finally { URL.revokeObjectURL(url) }
}

function draw(src, sx, sy, sw, sh, w, h) {
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h))
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height)
  g.imageSmoothingQuality = 'high'; g.drawImage(src, sx, sy, sw, sh, 0, 0, c.width, c.height)
  return c
}

/** File ảnh → danh sách đoạn [{ mime, data (base64), thumb (dataURL nhỏ), w, h }] — tối đa `slots` đoạn */
export async function prepareImage(file, slots = AVA_MAX_IMAGES) {
  if (!/^image\/(png|jpe?g|webp|gif|bmp)$/i.test(file?.type || '')) throw new Error('Chỉ nhận ảnh PNG, JPG, WebP')
  const bmp = await loadBitmap(file)
  const W = bmp.width, H = bmp.height
  if (!W || !H) throw new Error('Không đọc được ảnh')
  const crops = []   // [sy, sh] theo pixel ảnh gốc
  let scale
  if (H / W > TALL_RATIO && slots > 1) {
    scale = Math.min(1, TALL_WIDTH / W)
    let n = Math.ceil((H * scale) / MAX_EDGE)
    if (n > slots) { n = slots; scale = (MAX_EDGE * n) / H }   // dài quá số đoạn còn lại → thu nhỏ thêm
    const step = H / n
    for (let i = 0; i < n; i++) crops.push([Math.round(i * step), Math.round(step)])
  } else {
    scale = Math.min(1, MAX_EDGE / Math.max(W, H))
    crops.push([0, H])
  }
  const out = crops.map(([sy, sh]) => {
    const c = draw(bmp, 0, sy, W, sh, W * scale, sh * scale)
    const t = Math.min(1, THUMB / Math.max(c.width, c.height))
    return {
      mime: 'image/jpeg', data: c.toDataURL('image/jpeg', QUALITY).split(',')[1],
      thumb: draw(c, 0, 0, c.width, c.height, c.width * t, c.height * t).toDataURL('image/jpeg', 0.7), w: c.width, h: c.height,
    }
  })
  bmp.close?.()
  return out
}
