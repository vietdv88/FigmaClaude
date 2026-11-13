import { watchEffect, onBeforeUnmount } from 'vue'

/* ═══════════════════════════════════════════════════════════════════════════
   Tiêu đề tab trình duyệt (document.title) — quy chuẩn MISA:
     Màn danh sách: Tên phân hệ hiện tại | Tên phân hệ cha, ông… (nếu có) | Tên ứng dụng
                    VD: Rút dự toán | Kho bạc | MISA Mimosa Online
     Màn thêm:      Thêm [tên phân hệ hiện tại] | Tên phân hệ cha, ông… | Tên ứng dụng
                    VD: Thêm rút dự toán | Kho bạc | MISA Mimosa Online
   Cách dùng:
     setAppTitle('MISA PD Point')                         // 1 lần khi khởi động app
     router.afterEach(to => setPageTitle(to.meta.title))  // meta.title = ['Phân hệ', 'Cha', ...]
     useDocTitle(() => ['Thêm công việc', project.name, 'Dự án'])  // trong component: màn chi tiết / popup thêm
   useDocTitle chồng lên tiêu đề trang khi component đang mở, tự trả lại khi đóng.
   ═══════════════════════════════════════════════════════════════════════════ */

let app = ''
let page = []
const stack = []   // các tiêu đề đang chồng lên (màn chi tiết, popup thêm) — cái mở sau cùng được hiện

const clean = parts => (Array.isArray(parts) ? parts : [parts]).map(p => String(p ?? '').trim()).filter(Boolean)
/** Ghép tiêu đề: các phần (hiện tại → cha → ông) + tên ứng dụng, cách nhau " | " */
export const buildTitle = (parts, appName = app) => [...clean(parts), appName].filter(Boolean).join(' | ')

function apply() {
  if (typeof document === 'undefined') return
  const top = [...stack].reverse().find(e => e.parts.length)   // tiêu đề rỗng (VD popup ở chế độ sửa) → bỏ qua
  document.title = buildTitle(top ? top.parts : page)
}
export function setAppTitle(name) { app = name; apply() }
export function setPageTitle(parts) { page = clean(parts ?? []); apply() }

/** Đặt tiêu đề khi component đang hiện (getParts phản ứng theo dữ liệu, VD tên dự án) */
export function useDocTitle(getParts) {
  const entry = { parts: [] }
  stack.push(entry)
  const stop = watchEffect(() => { entry.parts = clean(getParts()); apply() })
  onBeforeUnmount(() => {
    stop()
    const i = stack.indexOf(entry)
    if (i >= 0) stack.splice(i, 1)
    apply()
  })
}
