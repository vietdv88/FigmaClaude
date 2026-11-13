<template>
  <div class="demo-stack">
    <div class="demo-row">
      <AppSegmented v-model="form" :options="FORMS" aria-label="Dạng thông báo" />
      <AppSegmented v-if="form !== 'action'" v-model="type" :options="types" aria-label="Loại thông báo" />
    </div>
    <span class="demo-muted">{{ NOTES[form] }}</span>

    <!-- Thông báo kêu gọi hành động = Alert Dialog (Figma: Type=Default · Type=Danger) -->
    <template v-if="form === 'action'">
      <div class="demo-row">
        <button type="button" class="btn btn--outline btn--neutral" @click="dlg = 'default'">Mở dialog thường</button>
        <button type="button" class="btn btn--outline btn--neutral" @click="dlg = 'danger'"><TIcon name="trash" />Mở dialog xóa</button>
      </div>
      <div class="demo-canvas demo-canvas--col">
        <AppAlertDialog inline title="Lưu thay đổi bộ lọc?" message="Bộ lọc “Đơn hàng quá hạn” sẽ được cập nhật theo điều kiện bạn vừa chọn." confirm-label="Đồng ý" />
        <AppAlertDialog inline type="danger" title="Xóa khách hàng Công ty TNHH An Phát?" message="Khách hàng và 12 chứng từ liên quan sẽ bị xóa vĩnh viễn, không thể khôi phục." confirm-label="Xóa" />
      </div>
      <AppAlertDialog v-if="dlg" :type="dlg" :title="dlg === 'danger' ? 'Xóa khách hàng Công ty TNHH An Phát?' : 'Lưu thay đổi bộ lọc?'"
        :message="dlg === 'danger' ? 'Khách hàng và 12 chứng từ liên quan sẽ bị xóa vĩnh viễn, không thể khôi phục.' : 'Bộ lọc “Đơn hàng quá hạn” sẽ được cập nhật theo điều kiện bạn vừa chọn.'"
        :confirm-label="dlg === 'danger' ? 'Xóa' : 'Đồng ý'" @cancel="dlg = ''" @confirm="done" />
    </template>

    <!-- Toast: giữa phía trên, tự ẩn 5 giây, tối đa 3 cái -->
    <template v-else-if="form === 'toast'">
      <div class="demo-row">
        <button type="button" class="btn btn--outline btn--neutral" @click="fireToast">Hiện toast {{ cur.label.toLowerCase() }}</button>
        <button type="button" class="btn btn--outline btn--neutral" @click="toast.success('Đã xóa 1 bản ghi', { action: { label: 'Hoàn tác', icon: 'arrow-back-up', onClick: () => toast.info('Đã hoàn tác') } })">Có nút Hoàn tác</button>
        <button type="button" class="btn btn--outline btn--neutral" @click="fireMany">Bắn 4 toast liên tiếp</button>
      </div>
    </template>

    <!-- Notification: thẻ trắng nổi, không tự đóng, góc phải phía trên -->
    <template v-else-if="form === 'notification'">
      <div class="demo-canvas demo-canvas--col">
        <AppNotification v-for="n in cur.notifs" :key="n.title" :type="type" :title="n.title" :message="n.message" @close="toast.info('Đã đóng thông báo')" />
      </div>
      <div class="demo-row">
        <button type="button" class="btn btn--outline btn--neutral" @click="notify({ type, ...cur.notifs[0] })">Bắn notification {{ cur.label.toLowerCase() }}</button>
        <button type="button" class="btn btn--outline btn--neutral" @click="fireNotifs">Bắn 3 notification</button>
        <button type="button" class="btn btn--outline btn--neutral" @click="notifications.length = 0">Đóng hết</button>
      </div>
    </template>

    <!-- Inline: nằm trong nội dung (trang, popup, card) -->
    <template v-else-if="form === 'inline'">
      <div class="demo-canvas">
        <AppInlineAlert v-if="!closed.a" :type="alertType" :title="cur.title" stacked closable @close="closed.a = true">{{ cur.text }}</AppInlineAlert>
        <AppInlineAlert v-if="!closed.b" :type="alertType" :title="cur.title" closable @close="closed.b = true">{{ cur.short }}</AppInlineAlert>
        <AppInlineAlert :type="alertType">{{ cur.short }} (không có tiêu đề, không có nút ×)</AppInlineAlert>
      </div>
      <div v-if="closed.a || closed.b" class="demo-row"><button type="button" class="btn btn--outline btn--neutral" @click="closed = {}">Hiện lại</button></div>
    </template>

    <!-- Global Inline: dải trên cùng app, phía trên header -->
    <template v-else>
      <div class="demo-canvas demo-canvas--flush">
        <AppGlobalAlert v-if="!closed.s" :type="type" :title="cur.title" action-label="Chi tiết" closable @action="toast.info('Mở chi tiết')" @close="closed.s = true">{{ cur.short }}</AppGlobalAlert>
        <AppGlobalAlert v-if="!closed.l" :type="type" variant="light" :title="cur.title" action-label="Chi tiết" closable @action="toast.info('Mở chi tiết')" @close="closed.l = true">{{ cur.short }}</AppGlobalAlert>
        <AppGlobalAlert :type="type" :title="cur.title">{{ cur.short }} (không có nút thao tác, không có nút ×)</AppGlobalAlert>
        <AppGlobalAlert :type="type" variant="light" :title="cur.title">{{ cur.short }} (không có nút thao tác, không có nút ×)</AppGlobalAlert>
      </div>
      <div v-if="closed.s || closed.l" class="demo-row"><button type="button" class="btn btn--outline btn--neutral" @click="closed = {}">Hiện lại</button></div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppSegmented from '@mds/components/AppSegmented.vue'
import AppInlineAlert from '@mds/components/AppInlineAlert.vue'
import AppAlertDialog from '@mds/components/AppAlertDialog.vue'
import AppNotification from '@mds/components/AppNotification.vue'
import AppGlobalAlert from '@mds/components/AppGlobalAlert.vue'
import { toast } from '@mds/utils/toast.js'
import { notify, notifications } from '@mds/utils/notify.js'

const FORMS = [
  { value: 'action', label: 'Kêu gọi hành động' }, { value: 'toast', label: 'Toast' }, { value: 'notification', label: 'Notification' },
  { value: 'inline', label: 'Inline' }, { value: 'global', label: 'Global Inline' },
]
const NOTES = {
  action: 'Dialog hiện trực tiếp trên màn hình, người dùng phải chọn trước khi tiếp tục. Nút xếp 1 hàng: nút chính ngoài cùng bên phải. Chi tiết xem trang Dialog.',
  toast: 'Thông báo nhanh kết quả thao tác: hiện giữa phía trên, dưới header, tự ẩn sau 5 giây, tối đa 3 cái cùng lúc (cái mới ở trên cùng), rộng theo chữ và tối đa 400px.',
  notification: 'Sự kiện quan trọng cần xem lại (hệ thống bắn, thường kèm chuông): góc phải phía trên, KHÔNG tự đóng — bấm × để tắt; cái mới ở trên cùng, tắt cái trên thì cái dưới đẩy lên.',
  inline: 'Nằm ngay trong nội dung (trang, popup, card), gần khu vực liên quan, không nổi lên giao diện. Tiêu đề ngắn có thể để cùng 1 hàng với nội dung; nút × tùy trường hợp.',
  global: 'Dải thông báo toàn app, trên cùng, phía trên thanh header (hết hạn dùng, sắp bảo trì, hệ thống chậm…). Hai kiểu: nền màu đặc và nền nhạt; nút × và nút thao tác tùy trường hợp.',
}
const form = ref('toast'), type = ref('success'), dlg = ref(''), closed = ref({})
const BASE = [{ value: 'success', label: 'Thành công' }, { value: 'error', label: 'Lỗi' }, { value: 'warning', label: 'Cảnh báo' }, { value: 'info', label: 'Thông tin' }]
const types = computed(() => (form.value === 'global' ? [...BASE, { value: 'neutral', label: 'Trung tính' }] : BASE))
watch(form, () => { closed.value = {}; if (form.value !== 'global' && type.value === 'neutral') type.value = 'info' })
// Tên loại trong AppInlineAlert / AppGlobalAlert là danger; Toast / Notification là error
const alertType = computed(() => (type.value === 'error' ? 'danger' : type.value))
const TEXT = {
  success: { label: 'Thành công', title: 'Nhập khẩu Hồ sơ thành công', text: '50 hồ sơ đã được nhập khẩu thành công vào hệ thống. Xem chi tiết.', short: '50 hồ sơ đã được nhập khẩu thành công vào hệ thống.', toast: 'Lưu thành công',
    notifs: [{ title: 'Nhập khẩu Hồ sơ thành công', message: '50 hồ sơ đã được nhập khẩu thành công vào hệ thống. Xem chi tiết.' }, { title: 'Hoàn tất phê duyệt yêu cầu', message: 'Yêu cầu phê duyệt của bạn đã được chấp nhận. Bạn có thể tiến hành các bước tiếp theo trong quy trình.' }] },
  error: { label: 'Lỗi', title: 'Không kết nối được máy chủ', text: 'Không thể đồng bộ dữ liệu do mất kết nối. Vui lòng kiểm tra mạng và thử lại.', short: 'Không thể đồng bộ dữ liệu, vui lòng thử lại.', toast: 'Không lưu được, vui lòng thử lại',
    notifs: [{ title: 'Nhập khẩu Hồ sơ thất bại', message: '12 hồ sơ bị lỗi định dạng ngày sinh nên chưa được nhập. Tải file lỗi để chỉnh sửa và nhập lại.' }] },
  warning: { label: 'Cảnh báo', title: 'Dung lượng sắp đầy', text: 'Bạn đã sử dụng 90% dung lượng gói hiện tại. Hãy nâng cấp để tránh gián đoạn.', short: 'Bạn đã sử dụng 90% dung lượng gói hiện tại.', toast: 'Dữ liệu đã thay đổi bởi người khác, hãy tải lại trang',
    notifs: [{ title: 'Dung lượng sắp đầy', message: 'Bạn đã sử dụng 90% dung lượng gói hiện tại. Hãy nâng cấp để tránh gián đoạn.' }] },
  info: { label: 'Thông tin', title: 'Tính năng mới', text: 'Bạn có thể lọc dữ liệu theo nhiều điều kiện cùng lúc. Xem hướng dẫn để biết thêm.', short: 'Bạn có thể lọc dữ liệu theo nhiều điều kiện cùng lúc.', toast: 'Dữ liệu được đồng bộ lúc 08:00 hằng ngày',
    notifs: [{ title: 'Có 3 yêu cầu chờ duyệt', message: 'Bạn có 3 yêu cầu phê duyệt mới đang chờ xử lý. Mở danh sách để xem chi tiết.' }] },
  neutral: { label: 'Trung tính', title: 'Thông báo hệ thống', text: '', short: 'Hệ thống sẽ bảo trì từ 22:00 đến 23:00 hôm nay.', toast: '', notifs: [] },
}
const cur = computed(() => TEXT[type.value])
const fireToast = () => toast[type.value](cur.value.toast)
const fireMany = () => ['success', 'info', 'warning', 'error'].forEach((t, i) => setTimeout(() => toast[t](TEXT[t].toast), i * 250))
const fireNotifs = () => ['info', 'warning', 'success'].forEach((t, i) => setTimeout(() => notify({ type: t, ...TEXT[t].notifs[0] }), i * 300))
function done() { dlg.value = ''; toast.success('Đã thực hiện') }
</script>

<style scoped>
.demo-canvas { display: flex; flex-direction: column; gap: 12px; padding: 16px; border-radius: var(--radius-card); background: var(--bg-page); }
.demo-canvas--col { align-items: flex-start; }
.demo-canvas--col > * { max-width: 100%; }
.demo-canvas--flush { padding: 0; gap: 8px; overflow: hidden; }
</style>
