/** Inject 1 lần <linearGradient id="ai-icon-gradient"> (+ -hover, -disabled) vào document — tô icon theo gradient AI (xanh → tím).
 *  Dùng: BorderBeamButton, mục menu AI (DropdownMenu item.ai). CSS: svg * { stroke: url(#ai-icon-gradient) } */
export function ensureAiGradient() {
  if (typeof document === 'undefined' || document.getElementById('ai-icon-gradient')) return
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0')
  svg.setAttribute('style', 'position:absolute'); svg.setAttribute('aria-hidden', 'true')
  /* 600 = mặc định · 700 = hover · 300 = disabled (Figma Icon Swap, Color=AI) */
  const g = (id, a, b) => `<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="35%"><stop offset="8.87%" stop-color="${a}" /><stop offset="100%" stop-color="${b}" /></linearGradient>`
  const v = (n, f) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f   // lấy từ biến AI Begin / AI End của mds-ui
  svg.innerHTML = `<defs>${g('ai-icon-gradient', v('--ai-begin-600', '#1482ff'), v('--ai-end-600', '#cf11ff'))}${g('ai-icon-gradient-hover', v('--ai-begin-700', '#0a68eb'), v('--ai-end-700', '#aa00cf'))}${g('ai-icon-gradient-disabled', v('--ai-begin-300', '#88d6ff'), v('--ai-end-300', '#f499ff'))}</defs>`
  document.body.appendChild(svg)
}
