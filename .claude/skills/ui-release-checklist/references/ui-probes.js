/* ═══ Hàm dò giao diện cho checklist phát hành — nạp vào trang khi test bằng Playwright ═══
   await page.addInitScript(fs.readFileSync('<skill>/references/ui-probes.js', 'utf8'))
   rồi: await page.evaluate(() => window.__probe.title())   (mỗi hàm trả về object, ok: true/false + chi tiết) */
window.__probe = {
  /** Favicon: có <link rel=icon> và tải được */
  async favicon() {
    const href = document.querySelector('link[rel~="icon"]')?.href || location.origin + '/favicon.ico'
    const r = await fetch(href, { method: 'GET' }).catch(() => null)
    return { ok: !!r?.ok && /image|icon|octet/.test(r.headers.get('content-type') || ''), href, status: r?.status }
  },
  /** Tiêu đề trình duyệt: “Phân hệ | Cha… | Tên app” (/ds/browser-title) */
  title() { const t = document.title; return { ok: / \| /.test(t) && t.trim().length > 0, title: t } },
  /** Ô đang focus (mở form xong → phải là ô nhập đầu tiên) */
  focused() {
    const a = document.activeElement, first = [...document.querySelectorAll('.ds-modal input:not([type=hidden]):not([disabled]), [role=dialog] input:not([type=hidden]):not([disabled]), [role=dialog] textarea, form input:not([type=hidden]):not([disabled]), form textarea')].find(e => e.offsetParent)
    return { ok: !!a && a === first, active: a ? (a.placeholder || a.name || a.tagName) : null, first: first ? (first.placeholder || first.name || first.tagName) : null }
  },
  /** Bấm vào ô có chữ → chọn hết chữ (gọi sau khi page.click(selector)) */
  selectAllOnClick() {
    const a = document.activeElement
    if (!a || !('selectionStart' in a) || !a.value) return { ok: null, reason: 'Ô đang focus không có chữ' }
    return { ok: a.selectionStart === 0 && a.selectionEnd === a.value.length, value: a.value, sel: [a.selectionStart, a.selectionEnd] }
  },
  /** Mô tả phần tử đang focus (gọi sau mỗi lần page.keyboard.press('Tab') để ghi thứ tự Tab) */
  focusLabel() {
    const a = document.activeElement; if (!a) return ''
    const lab = a.closest('.input-field, label')?.querySelector('.input-field__label, label')?.innerText || a.getAttribute('aria-label') || a.placeholder || a.innerText || a.tagName
    return String(lab).trim().slice(0, 40)
  },
  /** Dòng bảng bấm được: con trỏ bàn tay */
  rowCursor(sel = '.dt-row, tbody tr') {
    const rows = [...document.querySelectorAll(sel)].filter(r => r.offsetParent).slice(0, 5)
    const bad = rows.filter(r => getComputedStyle(r).cursor !== 'pointer')
    return { ok: rows.length > 0 && !bad.length, rows: rows.length, notPointer: bad.length }
  },
  /** Cỡ chữ đang dùng trên màn (chữ nội dung phải ≥ 13px; liệt kê cỡ < 13) */
  fontSizes() {
    const small = new Map()
    for (const el of document.querySelectorAll('body *')) {
      if (!el.offsetParent || !el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue
      const fs = parseFloat(getComputedStyle(el).fontSize)
      if (fs < 13) small.set(el.className || el.tagName, fs)
    }
    return { ok: small.size === 0, under13: [...small].slice(0, 15) }
  },
  /** Có phần tử theo selector đang hiển thị */
  exists(sel) { const e = document.querySelector(sel); return { ok: !!e && !!e.offsetParent, sel } },
  /** Bóng đổ đang dùng trên màn — liệt kê bóng không thuộc bộ token Figma (Alpha Black 100) */
  shadows() {
    const odd = new Map()
    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el).boxShadow
      if (s && s !== 'none' && !/rgba\(0, 0, 0, 0\.1\)/.test(s)) odd.set(String(el.className).slice(0, 40) || el.tagName, s)
    }
    return { ok: odd.size === 0, notToken: [...odd].slice(0, 15) }
  },
}
