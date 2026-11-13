import { reactive } from 'vue'

/**
 * Tín hiệu chuyển trang (quy chuẩn): bấm sang phân hệ khác → có phản hồi NGAY, không để màn hình “đơ”.
 *   routeProgress.target  — path đang chuyển tới (để sidebar sáng mục mới ngay khi bấm)
 *   routeProgress.active  — sau `delay` ms vẫn chưa xong → hiện thanh tiến trình trên cùng (<RouteProgress />)
 *   routeProgress.slow    — sau `slowAfter` ms vẫn chưa xong → phủ skeleton lên vùng nội dung (<PageSkeleton />)
 * Chuyển nhanh (< delay) thì không nháy gì cả.
 *
 * Dùng: installRouteProgress(router) trong main.js + đặt <RouteProgress /> 1 lần ở App.vue.
 */
export const routeProgress = reactive({ target: '', active: false, slow: false })

export function installRouteProgress(router, { delay = 80, slowAfter = 350 } = {}) {
  let seq = 0, t1 = null, t2 = null
  const clear = () => { clearTimeout(t1); clearTimeout(t2) }
  router.beforeEach((to, from) => {
    if (to.path === from.path) return               // chỉ đổi query (lọc, tab con…) → không tính là chuyển trang
    const my = ++seq
    clear()
    routeProgress.target = to.path
    t1 = setTimeout(() => { if (my === seq) routeProgress.active = true }, delay)
    t2 = setTimeout(() => { if (my === seq) routeProgress.slow = true }, slowAfter)
  })
  const done = () => {
    seq++; clear()
    routeProgress.target = ''; routeProgress.active = false; routeProgress.slow = false
  }
  router.afterEach(done)
  router.onError(done)
}
