import { inject, watch } from 'vue'

/* Số dòng/trang chọn gần nhất — TablePaging / AppPagination tự áp khi mở danh sách và tự lưu khi người dùng đổi.
   App lưu THEO TÀI KHOẢN: provide('pageSizeStore', { get() → number | null, set(n) }) (get đọc từ dữ liệu reactive → đăng nhập xong tự áp).
   Không provide → nhớ theo trình duyệt (localStorage). Giá trị không có trong danh sách lựa chọn của bảng → bỏ qua, giữ mặc định của bảng. */
const LS = 'mds-page-size'
const localStore = {
  get() { try { return Number(localStorage.getItem(LS)) || null } catch { return null } },
  set(n) { try { localStorage.setItem(LS, String(n)) } catch { /* bỏ qua */ } },
}

/** Gọi trong setup của thanh phân trang → trả hàm lưu (gọi khi người dùng chọn số dòng/trang) */
export function usePageSizePref(props, applySize) {
  const store = inject('pageSizeStore', null) ?? localStore
  watch(() => Number(store.get()) || null, n => {
    if (n && n !== props.pageSize && props.pageSizeOptions.map(Number).includes(n)) applySize(n)
  }, { immediate: true })
  return n => store.set(Number(n))
}
