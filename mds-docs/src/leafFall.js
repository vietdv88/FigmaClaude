/* Lá rơi chào mừng Ngày Nhà giáo Việt Nam 20/11 — bật cho mọi người.
   Chạy khi tải trang và mỗi lần chuyển trang (đổi đường dẫn). Bỏ qua khi người dùng bật “giảm chuyển động”.
   Lá bàng / lá úa (emoji) xen cánh hoa phượng (div CSS); pointer-events: none → không cản thao tác; chạy xong tự gỡ. */
const PHUONG = [['#ff9a7a', '#e8573f'], ['#ffb08f', '#ef5a3c'], ['#ff8a6b', '#d9482f'], ['#ffd27a', '#f0a92b']]
const LEAVES = ['🍃', '🍂', '🍃', '🍂', '🍁']
let current = null, timer = null, first = true

export function leafFall() {
  if (typeof document === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const count = first ? 42 : 26
  first = false
  current?.remove(); clearTimeout(timer)
  const layer = document.createElement('div')
  layer.className = 'leaf-layer'
  layer.setAttribute('aria-hidden', 'true')
  const W = window.innerWidth
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span')
    const leaf = i % 5 < 2
    const dur = 6 + Math.random() * 3, delay = Math.random() * 2.8
    const drift = (Math.random() - 0.5) * 160
    const spin = (Math.random() > 0.5 ? 1 : -1) * (leaf ? 90 + Math.random() * 180 : 180 + Math.random() * 360)
    let css = `left:${Math.random() * W}px; animation-duration:${dur}s, ${1.6 + Math.random() * 1.4}s; animation-delay:${delay}s, ${delay}s; --drift:${drift}px; --spin:${spin}deg;`
    if (leaf) {
      p.className = 'leaf leaf--emoji'
      p.textContent = LEAVES[Math.floor(Math.random() * LEAVES.length)]
      css += `font-size:${14 + Math.random() * 10}px;`
    } else {
      const [c1, c2] = PHUONG[Math.floor(Math.random() * PHUONG.length)], size = 10 + Math.random() * 10
      p.className = 'leaf'
      css += `width:${size}px; height:${size * 0.8}px; background: radial-gradient(circle at 30% 30%, ${c1}, ${c2});`
    }
    p.style.cssText = css
    layer.appendChild(p)
  }
  document.body.appendChild(layer)
  current = layer
  timer = setTimeout(() => { layer.remove(); if (current === layer) current = null }, 13000)
}
