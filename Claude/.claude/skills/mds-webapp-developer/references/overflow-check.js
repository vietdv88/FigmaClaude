/* ═══ Dò phần tử TRÀN KHỎI KHUNG (popup, dropdown, dialog, card, header…) — dùng khi test bằng Playwright ═══
   page.addInitScript(fs.readFileSync('<skill>/references/overflow-check.js', 'utf8'))
   rồi: await page.evaluate(() => window.__overflow('.bell-pop'))  → [] là đạt; có phần tử → in tên + số px vượt
   Bỏ qua phần tử ẩn và phần tử nằm trong vùng cuộn của chính nó (overflow auto/scroll/hidden). */
// Dò phần tử tràn khỏi khung chứa: trả về danh sách phần tử con có cạnh vượt ra ngoài container (bỏ qua phần tử ẩn / nằm trong vùng cuộn)
window.__overflow = sel => [...document.querySelectorAll(sel)].flatMap(box => {
  const B = box.getBoundingClientRect()
  return [...box.querySelectorAll('*')].filter(el => {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false
    let p = el.parentElement; while (p && p !== box) { const o = getComputedStyle(p); if (/(auto|scroll|hidden)/.test(o.overflowX + o.overflowY)) { const pr = p.getBoundingClientRect(); if (r.right > pr.right + 1 || r.left < pr.left - 1) return false } p = p.parentElement }
    return r.right > B.right + 1 || r.left < B.left - 1
  }).map(el => `${sel} › ${el.className || el.tagName} "${(el.innerText || '').trim().slice(0, 30)}" vượt ${Math.round(Math.max(el.getBoundingClientRect().right - B.right, B.left - el.getBoundingClientRect().left))}px`)
})

// Khóa vị trí bố cục: so sánh giữa các lần bấm tab / đổi trạng thái — phải giống hệt (không nhảy)
// VD: const k = []; for (const t of tabs) { await click(t); k.push(await page.evaluate(() => window.__layoutKey('.bell-pop__tabs', '.bell-pop__list'))) }; new Set(k).size === 1
window.__layoutKey = (...sels) => sels.map(s => { const r = document.querySelector(s)?.getBoundingClientRect(); return r ? [r.top, r.left, r.width, r.height].map(Math.round).join(',') : 'x' }).join(' | ')
