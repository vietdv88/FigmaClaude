/* ═══ Dò VIỀN ĐÔI (double border) — 2 đường viền 1px nằm sát nhau thành vạch dày 2px ═══
   page.addInitScript(fs.readFileSync('<skill>/references/double-border-check.js', 'utf8'))
   rồi: await page.evaluate(() => window.__doubleBorders('.sidebar'))  → [] là đạt; có phần tử → in cặp bị trùng + cạnh
   Bắt 2 kiểu:
   · Con – cha: viền của phần tử con nằm sát viền CÙNG CẠNH của phần tử cha (VD nút trong sidebar có border-right, sidebar cũng có border-right)
   · Kề nhau: viền phải của A chạm viền trái của B (hoặc dưới A – trên B) — VD 2 ô / 2 card đặt sát nhau mỗi cái 1 viền
   Không tính: phần tử ẩn, viền trong suốt, box-shadow, và viền ĐÈ LÊN nhau có chủ đích (margin âm để phủ vạch — VD tab đang chọn). */
window.__doubleBorders = (sel = 'body') => {
  const SIDES = ['top', 'right', 'bottom', 'left']
  const has = (cs, s) => parseFloat(cs[`border-${s}-width`]) > 0 && cs[`border-${s}-style`] !== 'none' && !/rgba\([^)]*,\s*0\)|transparent/.test(cs[`border-${s}-color`])
  const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0' }
  const name = el => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`
  const edge = (r, s) => ({ top: r.top, right: r.right, bottom: r.bottom, left: r.left })[s]
  const out = []
  for (const root of document.querySelectorAll(sel)) {
    const els = [root, ...root.querySelectorAll('*')].filter(vis)
    for (const el of els) {
      const cs = getComputedStyle(el), r = el.getBoundingClientRect()
      // 1) Con – cha cùng cạnh: mép ngoài của con trùng mép TRONG viền của cha (cha có viền cạnh đó)
      for (let p = el.parentElement, depth = 0; p && depth < 4; p = p.parentElement, depth++) {
        const pcs = getComputedStyle(p), pr = p.getBoundingClientRect()
        for (const s of SIDES) {
          if (!has(cs, s) || !has(pcs, s)) continue
          const bw = parseFloat(pcs[`border-${s}-width`])
          const inner = s === 'top' || s === 'left' ? edge(pr, s) + bw : edge(pr, s) - bw
          // chỉ tính khi con trải dọc / ngang theo cạnh đó (không phải 1 điểm chạm)
          const along = s === 'top' || s === 'bottom' ? Math.min(r.right, pr.right) - Math.max(r.left, pr.left) : Math.min(r.bottom, pr.bottom) - Math.max(r.top, pr.top)
          // Nằm SÁT bên trong viền cha (mép con = mép trong viền cha) → 2 vạch liền nhau = viền đôi.
          // Đè LÊN viền cha (mép con = mép ngoài cha, VD gạch chân tab đang chọn phủ vạch đáy thanh tab) → cố ý, không tính.
          if (Math.abs(edge(r, s) - inner) <= 0.5 && along > 8) out.push(`${name(el)} viền ${s} trùng viền ${s} của ${name(p)}`)
        }
        if (p === root) break
      }
    }
    // 2) Kề nhau: A.right ≈ B.left (cùng có viền) hoặc A.bottom ≈ B.top, có đoạn chồng lên nhau > 8px
    for (let i = 0; i < els.length; i++) for (let j = 0; j < els.length; j++) {
      if (i === j) continue
      const a = els[i], b = els[j]
      if (a.contains(b) || b.contains(a)) continue
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(), ca = getComputedStyle(a), cb = getComputedStyle(b)
      if (has(ca, 'right') && has(cb, 'left') && Math.abs(ra.right - rb.left) <= 0.5 && Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top) > 8) out.push(`${name(a)} viền phải chạm viền trái ${name(b)}`)
      if (has(ca, 'bottom') && has(cb, 'top') && Math.abs(ra.bottom - rb.top) <= 0.5 && Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left) > 8) out.push(`${name(a)} viền dưới chạm viền trên ${name(b)}`)
    }
  }
  return [...new Set(out)]
}
