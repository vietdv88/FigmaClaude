/* App mẫu code theo đúng quy chuẩn MDS: app Chấm điểm (MISA Solution Point) ở chế độ dùng thử.
   Cùng máy chủ với tài liệu (/ds) → đường dẫn tương đối: /api/demo/enter đặt chế độ dùng thử rồi mở app với dữ liệu mẫu, không cần đăng nhập. */
export const DEMO_APP_URL = '/api/demo/enter'

/* Nút 9 chấm trên header: chuyển qua lại giữa 2 app chung cổng (giữ giống APPS trong chamdiem-app/src/store/app.js) */
export const APPS = [
  { id: 'pdpoint', label: 'MISA Solution Point', desc: 'Quản lý công việc', img: '/logo.svg', href: '/' },
  { id: 'ds', label: 'MISA Design System', desc: 'Tài liệu thiết kế', img: '/ds/logo-ds.svg', href: '/ds/' },
]
