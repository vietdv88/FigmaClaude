<template>
  <div class="demo-stack">
    <span class="demo-muted">Các loại cột có sẵn trong DataTable (Figma Data Table › Column): chữ, link, 2 dòng, avatar, nhóm avatar, trạng thái, tag, tiến độ, tăng / giảm, sao đánh giá, bật / tắt, icon, logo sản phẩm, thao tác. Cột “Khách hàng” ghim sẵn — kéo ngang để xem hết.</span>
    <div class="demo-stage">
    <div class="table-panel demo-table demo-table--panel demo-table--types">
      <!-- Bảng đặt trên nền xám → luôn có thanh công cụ (nền trắng) phía trên: không thì hàng tiêu đề xám lẫn vào nền chung -->
      <TableHeader v-model="q" search-placeholder="Tìm theo tên, mã" :search-width="220" :hide-ai="true" :hide-tools="['col-settings', 'filter']" :total-count="view.length"
        @refresh="q = ''" @export="toast.info('Ví dụ: xuất khẩu danh sách')" />
      <div class="table-scroll">
        <DataTable :columns="COLS" :rows="view" :hide-blank-rows="false" @cell-update="onCell"
          @view="r => toast.info(`Xem ${r.name.text}`)" @remind="r => toast.info(`Nhắc ${r.name.text}`)" @edit="r => toast.info(`Sửa ${r.name.text}`)" @copy="r => toast.info(`Nhân bản ${r.name.text}`)" />
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataTable from '@mds/components/DataTable.vue'
import TableHeader from '@mds/components/TableHeader.vue'
import { normVi } from '@mds/utils/search.js'
import { toast } from '@mds/utils/toast.js'

const PEOPLE = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Thu Dung', 'Vũ Minh Đức', 'Đỗ Thanh Hà', 'Bùi Quang Huy']
const ST = [{ label: 'Đang hoạt động', color: 'success' }, { label: 'Tạm dừng', color: 'warning' }, { label: 'Đã khóa', color: 'danger' }, { label: 'Nháp', color: 'neutral' }]
const COLS = [
  { key: 'name', label: 'Khách hàng', type: 'avatar-subtext', width: 240, pinned: true },
  { key: 'code', label: 'Mã (link)', width: 110, link: true },
  { key: 'owner', label: 'Phụ trách (avatar)', type: 'avatar-text', width: 190 },
  { key: 'team', label: 'Nhóm (nhóm avatar)', type: 'group-avatar', width: 170 },
  { key: 'status', label: 'Trạng thái', type: 'status', width: 150 },
  { key: 'tags', label: 'Nhãn (tag)', type: 'tag', width: 200 },
  { key: 'progress', label: 'Tiến độ', type: 'progress', width: 150 },
  { key: 'up', label: 'Doanh thu (tăng)', type: 'trend-up', width: 160, align: 'right' },
  { key: 'down', label: 'Chi phí (giảm)', type: 'trend-down', width: 150, align: 'right' },
  { key: 'rating', label: 'Đánh giá', type: 'rating', width: 140 },
  { key: 'active', label: 'Kích hoạt', type: 'toggle', width: 100, align: 'center' },
  { key: 'channel', label: 'Kênh (icon + chữ)', type: 'icon-text', width: 170 },
  { key: 'product', label: 'Sản phẩm (logo)', type: 'product-logo', width: 180 },
  { key: 'note', label: 'Ghi chú (2 dòng)', type: 'subtext', width: 220 },
  { key: 'links', label: 'Thao tác (link)', type: 'action-text', width: 140, actions: [{ label: 'Xem', emit: 'view' }, { label: 'Nhắc', emit: 'remind' }] },
  { key: 'icons', label: 'Thao tác (icon)', type: 'action-icon', width: 110, actions: [{ icon: 'pencil', title: 'Sửa', emit: 'edit' }, { icon: 'copy', title: 'Nhân bản', emit: 'copy' }] },
]
const CHANNELS = [{ icon: 'world', text: 'Website', iconColor: 'brand' }, { icon: 'building', text: 'Cửa hàng', iconColor: 'success' }, { icon: 'phone', text: 'Tổng đài', iconColor: 'warning' }]
const PRODUCTS = ['AMIS Kế toán', 'AMIS CRM', 'AMIS Nhân sự', 'MISA meInvoice']
const rows = ref(['Công ty TNHH An Phát', 'Công ty CP Bình Minh', 'Cửa hàng Cường Thịnh', 'Công ty TNHH Đại Dương', 'HTX Hòa Bình', 'Công ty CP Gia Phú'].map((n, i) => ({
  id: i + 1, name: { text: n, subtext: `MST 0${310245678 + i * 1379}`.slice(0, 14) }, code: `KH${String(101 + i * 7).padStart(4, '0')}`,
  owner: { text: PEOPLE[i % 7] }, team: PEOPLE.slice(0, 3 + (i % 5)).map(p => ({ name: p })), status: ST[i % 4],
  tags: [{ label: 'VIP', color: 'brand' }, { label: 'Miền Bắc', color: 'neutral' }, ...(i % 2 ? [{ label: 'Đại lý', color: 'success' }] : []), ...(i % 3 === 0 ? [{ label: 'Mới', color: 'warning' }, { label: 'Ưu tiên', color: 'danger' }] : [])],
  progress: [80, 45, 100, 20, 65, 90][i], up: { value: (1250 + i * 310).toLocaleString('vi-VN'), pct: 5 + i * 3 }, down: { value: (420 + i * 75).toLocaleString('vi-VN'), pct: 2 + i },
  rating: [5, 4, 3, 4, 2, 5][i], active: i % 3 !== 2, channel: CHANNELS[i % 3], product: { name: PRODUCTS[i % 4] },
  note: { text: 'Hợp đồng năm 2026', subtext: `Gia hạn trước ${String(10 + i).padStart(2, '0')}/12/2026` },
})))
const q = ref('')
const view = computed(() => rows.value.filter(r => !q.value.trim() || normVi(`${r.name.text} ${r.code}`).includes(normVi(q.value.trim()))))
function onCell({ row, col, value }) { row[col.key] = value; if (col.key === 'active') toast.success(value ? `Đã kích hoạt ${row.name.text}` : `Đã tắt ${row.name.text}`) }
</script>

<style scoped>
.demo-table--types { max-height: 560px; }   /* khung bảng = card (xem .demo-table--panel): bo 8 + bóng, không viền */
</style>
