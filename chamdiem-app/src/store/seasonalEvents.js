/* ═══ Trang trí theo sự kiện (lặp lại hằng năm) — ảnh nền sidebar ═══
   Trong khoảng ngày của sự kiện → gắn <html data-event="<id>"> (CSS trong app.css vẽ ảnh); hết ngày tự gỡ.
   Thêm sự kiện mới: thêm 1 dòng vào EVENTS + ảnh ở public/events/ + khối CSS tương ứng. */
const EVENTS = [
  { id: '2010', from: '10-19', to: '10-21' },   // 20/10 — Ngày Phụ nữ Việt Nam (từ hôm trước tới hôm sau)
]
const mmdd = d => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const activeEvent = (now = new Date()) => EVENTS.find(e => e.from <= mmdd(now) && mmdd(now) <= e.to)?.id ?? ''

export function applySeasonalEvent() {
  const set = () => {
    const id = activeEvent()
    if (id) document.documentElement.dataset.event = id
    else delete document.documentElement.dataset.event
  }
  set()
  setInterval(set, 3600e3)   // tab mở qua ngày → tự bật / tắt
}

/* ═══ Hiệu ứng chào mừng: hoa rơi nhẹ từ header (20/10) ═══
   Chạy khi TẢI TRANG (F5 / mở app) và mỗi lần chuyển sang màn khác (đổi đường dẫn — đổi tham số như chọn việc không tính). Bỏ qua khi người dùng bật “giảm chuyển động”.
   Đợt mới bắt đầu khi đợt trước còn rơi → gỡ đợt cũ (không chồng nhiều lớp).
   Trộn cánh hoa đào (div CSS, giọt bo tròn chuyển màu) với hoa nguyên bông (emoji 🌸🌷🌹🌺🌼💮).
   pointer-events: none → không cản thao tác; chạy xong tự gỡ khỏi trang. */
const PETAL_COLORS = [['#ffd1dc', '#ff9eb5'], ['#ffe4ec', '#ffb3c6'], ['#fff0f5', '#ffc2d4'], ['#ffd6e0', '#f78fb3'], ['#ffc4d6', '#e8577e'], ['#ffd9e4', '#d94f70']]
const FLOWERS = ['🌸', '🌸', '🌷', '🌹', '🌺', '🌼', '💮']
let current = null, removeTimer = null, firstDone = false
/** Lần đầu (mở app) 42 bông · các lần chuyển màn sau nhẹ hơn (28) */
export function welcomePetals({ count = firstDone ? 28 : 42 } = {}) {
  if (activeEvent() !== '2010' || typeof document === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  firstDone = true
  current?.remove(); clearTimeout(removeTimer)

  const layer = document.createElement('div')
  layer.className = 'petal-layer'
  layer.setAttribute('aria-hidden', 'true')
  const W = window.innerWidth
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span')
    const flower = i % 5 < 2                                   // ~40% hoa nguyên bông, còn lại cánh hoa
    const size = flower ? 14 + Math.random() * 10 : 10 + Math.random() * 10
    const dur = 6 + Math.random() * 3                          // 6–9 giây rơi
    const delay = Math.random() * 2.8                          // tung lần lượt trong ~3 giây đầu
    const drift = (Math.random() - 0.5) * 160                  // trôi ngang ±80px
    const spin = (Math.random() > 0.5 ? 1 : -1) * (flower ? 90 + Math.random() * 180 : 180 + Math.random() * 360)
    let css = `left:${Math.random() * W}px; animation-duration:${dur}s, ${1.6 + Math.random() * 1.4}s; animation-delay:${delay}s, ${delay}s; --drift:${drift}px; --spin:${spin}deg;`
    if (flower) {
      p.className = 'petal petal--flower'
      p.textContent = FLOWERS[Math.floor(Math.random() * FLOWERS.length)]
      css += `font-size:${size}px;`
    } else {
      const [c1, c2] = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
      p.className = 'petal'
      css += `width:${size}px; height:${size * 0.8}px; background: radial-gradient(circle at 30% 30%, ${c1}, ${c2});`
    }
    p.style.cssText = css
    layer.appendChild(p)
  }
  document.body.appendChild(layer)
  current = layer
  removeTimer = setTimeout(() => { layer.remove(); if (current === layer) current = null }, 13000)
}
