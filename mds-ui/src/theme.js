import { ref } from 'vue'

export const COLORS = [
  { id: 'blue',      label: 'Xanh dương', main: '#245fdf', light: '#f0f6fe' },
  { id: 'green',     label: 'Xanh lá',    main: '#0e9a62', light: '#e6f5ef' },
  { id: 'blue-gray', label: 'Xanh xám',   main: '#4e5ba6', light: '#f5f5fa' },
  { id: 'teal',      label: 'Xanh ngọc',  main: '#0e9384', light: '#f1fefc' },
  { id: 'cyan',      label: 'Xanh lơ',    main: '#00a2cf', light: '#f0fcff' },
  { id: 'indigo',    label: 'Chàm',        main: '#4155f5', light: '#f0f2fe' },
  { id: 'purple',    label: 'Tím',         main: '#744ec7', light: '#f6f3fb' },
  { id: 'pink',      label: 'Hồng',        main: '#c64691', light: '#fbf3f8' },
  { id: 'red',       label: 'Đỏ',          main: '#c34266', light: '#fbf3f6' },
  { id: 'orange',    label: 'Cam',         main: '#ea580c', light: '#fef5f0' },
]

let THEME_KEY = 'mds-theme'
const _saved = localStorage.getItem(THEME_KEY) || 'green'
export const currentTheme = ref(_saved)
/* App chạy chung tên miền nhưng cần màu chủ đề riêng (VD tài liệu /ds mặc định Xanh dương, PD Point Xanh lá):
   gọi 1 lần trước khi mount — đọc / lưu màu ở khóa riêng, không đè lựa chọn của app kia */
export function useThemeStorage(key, fallback) {
  THEME_KEY = key
  let v = null
  try { v = localStorage.getItem(key) } catch { /* bỏ qua: chặn storage */ }
  currentTheme.value = COLORS.some(c => c.id === v) ? v : fallback
}

export function applyTheme(theme) {
  currentTheme.value = theme
  if (theme === 'blue') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
  localStorage.setItem(THEME_KEY, theme)
}

export function useTheme() {
  return { currentTheme, applyTheme, COLORS }
}

/* ── Density ── */
export const DENSITIES = [
  { id: 'medium',      label: 'Trung bình', height: 32, description: 'Mặc định — phù hợp đa số màn hình' },
  { id: 'compact',     label: 'Nhỏ',    height: 28, description: 'Thu gọn — hiển thị nhiều dữ liệu hơn' },
  { id: 'comfortable', label: 'Rộng',       height: 36, description: 'Rộng rãi — dễ thao tác trên màn to' },
]

const _savedDensity = localStorage.getItem('mds-density') || 'compact'
export const currentDensity = ref(_savedDensity)

export function applyDensity(density) {
  currentDensity.value = density
  if (density === 'medium') {
    document.documentElement.removeAttribute('data-density')
  } else {
    document.documentElement.setAttribute('data-density', density)
  }
  localStorage.setItem('mds-density', density)
}

export function useDensity() {
  return { currentDensity, applyDensity, DENSITIES }
}

/* ── Cỡ chữ — Figma collection 🔢 Font Size (Small mặc định · Medium · Large; Mobile Responsive tự áp trên màn ≤ 640px) ── */
export const FONT_SIZES = [
  { id: 'small',  label: 'Nhỏ', sample: 13, description: 'Mặc định — chữ 13px, hiển thị nhiều nội dung' },
  { id: 'medium', label: 'Vừa', sample: 14, description: 'Chữ 14px — dễ đọc hơn' },
  { id: 'large',  label: 'Lớn', sample: 14, description: 'Chữ 14px, tiêu đề lớn hơn — màn hình to' },
]
let _savedFontSize = 'small'
try { _savedFontSize = localStorage.getItem('mds-font-size') || 'small' } catch { /* bỏ qua: chặn storage */ }
export const currentFontSize = ref(FONT_SIZES.some(f => f.id === _savedFontSize) ? _savedFontSize : 'small')

export function applyFontSize(size) {
  currentFontSize.value = size
  if (size === 'small') document.documentElement.removeAttribute('data-font-size')
  else document.documentElement.setAttribute('data-font-size', size)
  try { localStorage.setItem('mds-font-size', size) } catch { /* bỏ qua */ }
}

export function useFontSize() {
  return { currentFontSize, applyFontSize, FONT_SIZES }
}

/* ── Header mode (color = brand bg, light = white bg) ── */
const _savedMode = localStorage.getItem('mds-header-mode') || 'color'
export const currentMode = ref(_savedMode)

export function applyMode(mode) {
  currentMode.value = mode
  if (mode === 'light') {
    document.documentElement.setAttribute('data-mode', 'light')
  } else {
    document.documentElement.removeAttribute('data-mode')
  }
  localStorage.setItem('mds-header-mode', mode)
  if (mode !== 'light' && currentSidebarMode.value === 'dark') applySidebarMode('light')   // header màu → sidebar phải sáng
}

/* ── Sidebar mode (light = white bg, dark = dark bg) ──
   Tổ hợp hợp lệ: header màu + sidebar sáng · header trắng + sidebar sáng / tối.
   Header màu + sidebar tối KHÔNG cho phép → tự đưa sidebar về sáng. */
const _savedSidebarMode = localStorage.getItem('mds-sidebar-mode') || 'light'
export const currentSidebarMode = ref(_savedSidebarMode)
export const sidebarDarkAllowed = headerMode => headerMode === 'light'

export function applySidebarMode(mode) {
  if (mode === 'dark' && !sidebarDarkAllowed(currentMode.value)) mode = 'light'
  currentSidebarMode.value = mode
  if (mode === 'dark') {
    document.documentElement.setAttribute('data-sidebar', 'dark')
  } else {
    document.documentElement.removeAttribute('data-sidebar')
  }
  localStorage.setItem('mds-sidebar-mode', mode)
}

/* ── Background tint (color = brand-light tint, gray = neutral default) ── */
const _savedBgTint = localStorage.getItem('mds-bg-tint') || 'gray'
export const currentBgTint = ref(_savedBgTint)

export function applyBgTint(tint) {
  currentBgTint.value = tint
  if (tint === 'color') {
    document.documentElement.setAttribute('data-bg-tint', 'color')
  } else {
    document.documentElement.removeAttribute('data-bg-tint')
  }
  localStorage.setItem('mds-bg-tint', tint)
}

/* ── Wallpaper ── */
// type: 'image' → url là path file; type: 'gradient' → url là CSS gradient string trực tiếp
const _UP = 'https://images.unsplash.com/photo-'
const _Q  = '?auto=format&w=1920&q=80'
const _QT = '?auto=format&w=320&q=70'
export const WALLPAPERS = [
  { id: 'none',    label: 'Không có',    type: 'image', url: '', thumb: '' },
  // ── Ảnh local ──
  { id: 'aurora',  label: 'Aurora',      type: 'image', url: '/bg-aurora.jpg',   thumb: '/bg-aurora.jpg' },
  { id: 'ocean',   label: 'Đại dương',   type: 'image', url: '/bg-ocean.jpg',    thumb: '/bg-ocean.jpg' },
  { id: 'mist',    label: 'Sương mờ',    type: 'image', url: '/bg-mist.jpg',     thumb: '/bg-mist.jpg' },
  { id: 'mountain',label: 'Núi sương',   type: 'image', url: '/bg-mountain.jpg', thumb: '/bg-mountain.jpg' },
  { id: 'desert',  label: 'Sa mạc',      type: 'image', url: '/bg-desert.jpg',   thumb: '/bg-desert.jpg' },
  { id: 'lake',    label: 'Hồ núi',      type: 'image', url: '/bg-lake.jpg',     thumb: '/bg-lake.jpg' },
  // ── Ảnh Unsplash — tone tối, ít chi tiết ──
  { id: 'starry',  label: 'Đêm sao',     type: 'image', url: _UP+'1419242902214-272b3f66ee7a'+_Q, thumb: _UP+'1419242902214-272b3f66ee7a'+_QT },
  { id: 'forest',  label: 'Rừng tối',    type: 'image', url: _UP+'1448375240586-882707db888b'+_Q, thumb: _UP+'1448375240586-882707db888b'+_QT },
  { id: 'valley',  label: 'Thung lũng',  type: 'image', url: _UP+'1506905925346-21bda4d32df4'+_Q, thumb: _UP+'1506905925346-21bda4d32df4'+_QT },
  { id: 'fogmtn',  label: 'Núi mây',     type: 'image', url: _UP+'1511497584788-876760111969'+_Q, thumb: _UP+'1511497584788-876760111969'+_QT },
  { id: 'snowmtn', label: 'Tuyết sơn',   type: 'image', url: _UP+'1464822759023-fed622ff2c3b'+_Q, thumb: _UP+'1464822759023-fed622ff2c3b'+_QT },
  { id: 'darkwave',label: 'Sóng tối',    type: 'image', url: _UP+'1505118380757-91f5f5632de0'+_Q, thumb: _UP+'1505118380757-91f5f5632de0'+_QT },
]

/* Tính năng hình nền đã BỎ cho mọi app: không còn cho chọn, luôn = 'none'.
   Xoá luôn lựa chọn cũ đã lưu để người từng chọn nền không bị kẹt hình nền. */
localStorage.removeItem('mds-wallpaper')
document.documentElement.removeAttribute('data-wallpaper')
document.documentElement.style.removeProperty('--wallpaper-url')
export const currentWallpaper = ref('none')

export function applyWallpaper(id) {
  currentWallpaper.value = id
  localStorage.setItem('mds-wallpaper', id)
  const wp = WALLPAPERS.find(w => w.id === id)
  if (wp && wp.url) {
    document.documentElement.setAttribute('data-wallpaper', id)
    const cssVal = wp.type === 'gradient' ? wp.url : `url(${wp.url})`
    document.documentElement.style.setProperty('--wallpaper-url', cssVal)
  } else {
    document.documentElement.removeAttribute('data-wallpaper')
    document.documentElement.style.removeProperty('--wallpaper-url')
  }
}
