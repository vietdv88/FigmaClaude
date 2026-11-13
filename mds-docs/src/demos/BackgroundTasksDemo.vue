<template>
  <!-- Xử lý tiến trình chạy ngầm (quy chuẩn /ds/background-tasks) — component mds-ui AppTaskTray.
       Màn hình mẫu: bấm Xuất khẩu / Nhập khẩu → toast “Đã bắt đầu…” + khay góc dưới phải; người dùng làm việc tiếp; xong → dòng đổi trạng thái + nút Tải xuống / Xem;
       khay đang thu gọn / đã đóng thì báo bằng toast có nút. Icon Tiến trình trên header (số đang chạy) mở lại khay. -->
  <div class="demo-stack">
    <span class="demo-muted">Bấm <b>Xuất khẩu</b> / <b>Nhập khẩu</b> trên màn hình mẫu để tạo tiến trình mới. Thử thu gọn ⌄, đóng ✕ (tiến trình vẫn chạy, mở lại bằng icon <b>Tiến trình</b> trên header), ✕ trên dòng đang chạy để hủy.</span>
    <LayoutFrame :active="0">
      <template #bar>
        <button type="button" class="btn btn--sm btn--text-neutral" @click="addError"><TIcon name="alert-circle" />Tạo tiến trình lỗi</button>
        <button type="button" class="btn btn--sm btn--text-neutral" @click="reset"><TIcon name="refresh" />Đặt lại mẫu</button>
      </template>
      <template #header-actions>
        <!-- Icon Tiến trình (quy tắc /ds/background-tasks): CHỈ hiện khi khay còn dòng (đang chạy / chờ / xong mà chưa ẩn) · đầu cụm icon, trước MISA AI
             Badge: đang chạy → số (badge đỏ chuẩn như Thông báo) · hết chạy + có lỗi chưa xem → chấm đỏ · chỉ còn thành công → không badge · khay trống → icon biến mất -->
        <button v-if="tasks.length" type="button" class="btn-icon-white bt-hd" :class="{ 'btn-icon-white--active': trayOpen && !collapsed }" :aria-pressed="trayOpen && !collapsed"
          :aria-label="headTip" v-tip="headTip" @click="toggleTray">
          <TIcon name="loader-2" />
          <span v-if="running" class="header-badge">{{ running }}</span>
          <span v-else-if="unseenBad" class="header-badge header-badge--dot" />
        </button>
      </template>

      <div class="bt-page">
        <div class="bt-head">
          <h2 class="bt-title">Nhân viên</h2>
          <button type="button" class="btn btn--outline btn--neutral" @click="startImport"><TIcon name="file-import" />Nhập khẩu</button>
          <button type="button" class="btn btn--outline btn--neutral" @click="startExport"><TIcon name="file-export" />Xuất khẩu</button>
          <button type="button" class="btn btn--primary" @click="toast.info('Ví dụ: thêm nhân viên')"><TIcon name="plus" />Thêm mới</button>
        </div>
        <div class="bt-card surface"><DataTable :columns="COLS" :rows="ROWS" :hide-blank-rows="false" /></div>
      </div>

      <AppTaskTray v-if="trayOpen" v-model:collapsed="collapsed" :tasks="tasks" @close="closeTray" @action="onAction" @cancel="askCancel" @dismiss="dismiss" />
    </LayoutFrame>

    <!-- Các trạng thái của khay (tĩnh) -->
    <span class="demo-muted"><b>Các trạng thái của khay</b> — mở rộng (đủ các loại dòng) · thu gọn khi đang chạy · tất cả đã xong.</span>
    <div class="bt-states">
      <AppTaskTray inline :tasks="SAMPLE" />
      <div class="bt-states__col">
        <AppTaskTray inline collapsed :tasks="SAMPLE.slice(0, 2)" />
        <AppTaskTray inline :tasks="DONE" />
      </div>
    </div>

    <AppAlertDialog v-if="cancelTask" type="danger" title="Hủy tiến trình?" confirm-label="Hủy tiến trình" cancel-label="Tiếp tục chạy"
      :message="`Dừng “${cancelTask.title}”. ${cancelTask.kind === 'import' ? 'Các bản ghi đã nhập vẫn được giữ, phần còn lại không được nhập.' : 'File chưa được tạo.'}`"
      @confirm="doCancel" @cancel="cancelTask = null" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import DataTable from '@mds/components/DataTable.vue'
import AppTaskTray from '@mds/components/AppTaskTray.vue'
import AppAlertDialog from '@mds/components/AppAlertDialog.vue'
import { toast } from '@mds/utils/toast.js'
import { fmtNum } from '@mds/utils/number.js'
import { vTip } from '@mds/utils/tooltip.js'
import LayoutFrame from './layout/LayoutFrame.vue'

/* ── Bảng nền ── */
const COLS = [{ key: 'name', label: 'Họ và tên', width: 200 }, { key: 'email', label: 'Email', width: 240 }, { key: 'phone', label: 'Số điện thoại', width: 150 }, { key: 'addr', label: 'Địa chỉ', width: 260 }]
const ROWS = [['Nguyễn Văn An', 'an.nv@misa.com.vn', '0912 345 678', 'Cầu Giấy, Hà Nội'], ['Trần Thị Bình', 'binh.tt@misa.com.vn', '0987 654 321', 'Quận 3, TP. Hồ Chí Minh'],
  ['Lê Minh Châu', 'chau.lm@misa.com.vn', '0903 222 111', 'Hải Châu, Đà Nẵng'], ['Phạm Quốc Dũng', 'dung.pq@misa.com.vn', '0938 111 999', 'Ninh Kiều, Cần Thơ'],
  ['Hoàng Thu Hà', 'ha.ht@misa.com.vn', '0977 888 666', 'Lê Chân, Hải Phòng'], ['Vũ Đức Huy', 'huy.vd@misa.com.vn', '0965 432 100', 'Thanh Xuân, Hà Nội']]
  .map(([name, email, phone, addr], i) => ({ id: i + 1, name, email, phone, addr }))

/* ── Dữ liệu mẫu tĩnh: đủ 6 trạng thái ── */
const SAMPLE = [
  { id: 's1', kind: 'export', title: 'Xuất khẩu dữ liệu tính lương tháng 10/2026', status: 'running', done: 5400, total: 12000, eta: 'còn khoảng 2 phút' },
  { id: 's2', kind: 'other', title: 'Tổng hợp báo cáo bảng lương năm 2026', status: 'running' },
  { id: 's3', kind: 'other', title: 'Cập nhật hàng loạt phòng ban (320 nhân viên)', status: 'queued' },
  { id: 's4', kind: 'import', title: 'Nhập khẩu dữ liệu tính lương tháng 10/2026', status: 'success', total: 1250, finishedAt: '14:32' },
  { id: 's5', kind: 'import', title: 'Nhập khẩu danh sách nhân viên mới', status: 'partial', total: 1000, errors: 50 },
  { id: 's6', kind: 'import', title: 'Nhập khẩu dữ liệu chấm công', status: 'error', result: 'File không đúng mẫu: thiếu cột “Mã nhân viên”' },
  { id: 's7', kind: 'export', title: 'Xuất khẩu danh sách khách hàng', status: 'canceled', result: 'Đã hủy lúc 14:05' },
]
const DONE = [
  { id: 'd1', kind: 'export', title: 'Xuất khẩu dữ liệu tính lương tháng 10/2026', status: 'success', total: 12000, finishedAt: '14:40' },
  { id: 'd2', kind: 'import', title: 'Nhập khẩu dữ liệu chấm công', status: 'error', result: 'Mất kết nối máy chủ — chưa có bản ghi nào được thay đổi' },
]

/* ── Mô phỏng chạy ngầm ── */
const now = () => new Date().toTimeString().slice(0, 5)
const initial = () => [
  { id: 1, kind: 'export', title: 'Xuất khẩu dữ liệu tính lương tháng 10/2026', status: 'running', done: 3600, total: 12000, speed: 260 },
  { id: 2, kind: 'import', title: 'Nhập khẩu dữ liệu tính lương tháng 10/2026', status: 'success', total: 1250, finishedAt: '14:32' },
  { id: 3, kind: 'import', title: 'Nhập khẩu dữ liệu chấm công', status: 'error', result: 'File không đúng mẫu: thiếu cột “Mã nhân viên”' },
]
const tasks = ref(initial()), trayOpen = ref(true), collapsed = ref(false), cancelTask = ref(null)
const running = computed(() => tasks.value.filter(t => t.status === 'running' || t.status === 'queued').length)
/* “Đã xem” = khay đang mở rộng khi tiến trình xong (hoặc mở rộng khay sau đó) → tắt chấm đỏ; dòng vẫn ở khay đến khi ẩn */
const unseenBad = computed(() => tasks.value.some(t => (t.status === 'error' || t.status === 'partial') && !t.seen))
const headTip = computed(() => running.value ? `${running.value} tiến trình đang xử lý` : unseenBad.value ? 'Tiến trình · có kết quả lỗi chưa xem' : 'Tiến trình')
watch([trayOpen, collapsed, () => tasks.value.map(t => t.status).join()], () => { if (trayOpen.value && !collapsed.value) tasks.value.forEach(t => { if (t.status !== 'running' && t.status !== 'queued') t.seen = true }) }, { immediate: true })
let seq = 100

function eta(t) { const left = (t.total - t.done) / t.speed * 0.4; return left > 60 ? `còn khoảng ${Math.ceil(left / 60)} phút` : `còn khoảng ${Math.max(5, Math.round(left / 5) * 5)} giây` }
const timer = setInterval(() => {
  for (const t of tasks.value) {
    if (t.status !== 'running') continue
    if (t.prep) { t.prep--; continue }   // chưa rõ % (đang chuẩn bị)
    t.done = Math.min(t.total, (t.done || 0) + t.speed)
    t.eta = t.done < t.total ? eta(t) : ''
    if (t.done >= t.total) finish(t)
  }
  // tối đa 3 tiến trình chạy cùng lúc / người dùng — còn lại xếp hàng
  const slots = 3 - tasks.value.filter(t => t.status === 'running').length
  tasks.value.filter(t => t.status === 'queued').slice(0, Math.max(0, slots)).forEach(t => { t.status = 'running'; t.done = 0; t.prep = 3 })
}, 400)
onBeforeUnmount(() => clearInterval(timer))

function finish(t) {
  t.finishedAt = now()
  if (t.failAt) { t.status = 'partial' } else t.status = 'success'
  if (t.failAt) t.errors = t.failAt
  // Khay đang thu gọn / đã đóng → báo bằng toast có nút; khay đang mở → chỉ đổi dòng (không làm phiền)
  if (!trayOpen.value || collapsed.value) {
    const msg = t.status === 'partial' ? `${t.title}: xong, ${fmtNum(t.errors)} dòng lỗi` : `${t.title}: đã xong`
    const label = t.status === 'partial' ? 'Tải file lỗi' : t.kind === 'export' ? 'Tải xuống' : 'Xem'
    toast[t.status === 'partial' ? 'warning' : 'success'](msg, { action: { label, onClick: () => onAction(t, t.status === 'partial' ? 'errors' : t.kind === 'export' ? 'download' : 'view') } })
  }
}
function add(task, startMsg) {
  const busy = tasks.value.find(x => x.title === task.title && (x.status === 'running' || x.status === 'queued'))
  if (busy) { toast.warning('Tiến trình này đang chạy — đợi xong rồi thực hiện lại'); trayOpen.value = true; collapsed.value = false; return }
  const slots = 3 - tasks.value.filter(t => t.status === 'running').length
  tasks.value.push({ id: ++seq, status: slots > 0 ? 'running' : 'queued', done: 0, prep: 3, ...task })
  trayOpen.value = true
  toast.info(startMsg)
}
function startExport() { add({ kind: 'export', title: 'Xuất khẩu danh sách nhân viên (2.340 bản ghi)', total: 2340, speed: 120 }, 'Đã bắt đầu xuất khẩu. Bạn có thể tiếp tục làm việc — hệ thống sẽ báo khi xong.') }
function startImport() { add({ kind: 'import', title: 'Nhập khẩu danh sách nhân viên mới', total: 1000, speed: 60, failAt: 50 }, 'Đã bắt đầu nhập khẩu 1.000 dòng. Bạn có thể tiếp tục làm việc — hệ thống sẽ báo khi xong.') }
function addError() {   // khay đang ẩn / thu gọn → không bật ra: toast + chấm đỏ trên icon Tiến trình (khi không còn tiến trình chạy)
  tasks.value.push({ id: ++seq, kind: 'import', title: 'Nhập khẩu bảng chấm công tháng 11/2026', status: 'error', result: 'Mất kết nối máy chủ — chưa có bản ghi nào được thay đổi' })
  if (!trayOpen.value || collapsed.value) toast.error('Nhập khẩu bảng chấm công tháng 11/2026: lỗi', { action: { label: 'Xem', onClick: () => { trayOpen.value = true; collapsed.value = false } } })
}
function reset() { tasks.value = initial(); trayOpen.value = true; collapsed.value = false }

function toggleTray() { if (trayOpen.value && !collapsed.value) trayOpen.value = false; else { trayOpen.value = true; collapsed.value = false } }
function closeTray() {
  trayOpen.value = false
  if (running.value) toast.info('Tiến trình vẫn chạy ngầm — mở lại ở icon Tiến trình trên header')
  else tasks.value = tasks.value.filter(t => t.status === 'running' || t.status === 'queued')   // đóng khi đã xong hết = dọn khay (kết quả vẫn ở Thông báo)
}
function dismiss(t) { tasks.value = tasks.value.filter(x => x !== t); if (!tasks.value.length) trayOpen.value = false }
function askCancel(t) { cancelTask.value = t }
function doCancel() { const t = cancelTask.value; t.status = 'canceled'; t.result = `Đã hủy lúc ${now()}${t.kind === 'import' && t.done ? ` · đã nhập ${fmtNum(t.done)} bản ghi` : ''}`; cancelTask.value = null }
function onAction(t, id) {
  if (id === 'download') toast.success(`Đang tải file “${t.title.replace(/^Xuất khẩu /, '')}.xlsx” (link tải giữ 7 ngày)`)
  else if (id === 'view') toast.info('Ví dụ: mở danh sách, lọc sẵn các bản ghi vừa nhập')
  else if (id === 'errors') toast.info(`Ví dụ: tải file lỗi — ${fmtNum(t.errors || 50)} dòng kèm cột “Lý do lỗi”, sửa rồi nhập lại`)
  else if (id === 'retry') { Object.assign(t, { status: 'running', done: 0, total: 800, speed: 80, prep: 3, result: '' }); toast.info('Đã chạy lại tiến trình') }
}
</script>

<style scoped>
.bt-page { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 16px; padding: 16px; }
.bt-head { display: flex; align-items: center; gap: var(--gap-control); }
.bt-title { flex: 1; min-width: 0; margin: 0; font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); }
.bt-card { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.bt-hd { position: relative; }
.bt-states { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 400px)); gap: 16px; align-items: start; }
.bt-states__col { display: flex; flex-direction: column; gap: 16px; }
</style>
