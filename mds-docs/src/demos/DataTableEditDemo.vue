<template>
  <div class="demo-stack">
    <span class="demo-muted">Bảng sửa trực tiếp trong ô (DataTable <code>editable</code>): rê chuột lên dòng để thấy viền ô, bấm vào ô để sửa — chữ, số (căn phải), chọn từ danh sách (Combobox của mds-ui), ghi chú nhiều dòng, bật / tắt. Thành tiền và dòng Tổng tự tính lại. Ô bắt buộc (Tên hàng, Đơn vị tính, Số lượng, Đơn giá) bị xóa trắng → viền đỏ + icon lỗi, rê icon / đang ở ô → tooltip lỗi (<code>col.required</code>, <code>col.validate</code>). Thao tác dòng nằm ở <b>cột icon ghim cuối bảng</b> (<code>action-mode="icons"</code>): tiêu đề cột để trống, icon Xóa căn giữa — không che control khi rê chuột.</span>
    <div class="demo-stage">
    <div class="table-panel demo-table demo-table--panel demo-table--edit">
      <!-- Bảng đặt trên nền xám → luôn có thanh công cụ (nền trắng) phía trên: không thì hàng tiêu đề xám lẫn vào nền chung -->
      <TableHeader v-model="q" search-placeholder="Tìm theo tên hàng" :search-width="220" :hide-ai="true" :hide-tools="['col-settings', 'filter']" :total-count="view.length"
        @refresh="q = ''" @export="toast.info('Ví dụ: xuất khẩu danh sách')" />
      <div class="table-scroll">
        <DataTable editable :columns="columns" :rows="view" :hide-blank-rows="false" show-footer
          :row-actions="[{ icon: 'trash', title: 'Xóa dòng', emit: 'delete', danger: true }]" action-mode="icons" @cell-update="onCell" @delete="removeRow" />
      </div>
      <div class="demo-table__foot">
        <button type="button" class="btn btn--text" @click="addRow"><TIcon name="plus" />Thêm dòng</button>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import DataTable from '@mds/components/DataTable.vue'
import TableHeader from '@mds/components/TableHeader.vue'
import { normVi } from '@mds/utils/search.js'
import { toast } from '@mds/utils/toast.js'
import { fmtNum, parseNum } from '@mds/utils/number.js'

const UNITS = [{ value: 'cai', label: 'Cái' }, { value: 'hop', label: 'Hộp' }, { value: 'thung', label: 'Thùng' }, { value: 'kg', label: 'Kg' }]
const STORES = [{ value: 'hn', label: 'Kho Hà Nội' }, { value: 'hcm', label: 'Kho TP.HCM' }, { value: 'dn', label: 'Kho Đà Nẵng' }]
let seq = 4
const rows = ref([
  { id: 1, item: 'Giấy in A4 Double A', unit: 'thung', store: 'hn', qty: 12, price: 520000, note: 'Giao trong tuần', vat: true },
  { id: 2, item: 'Mực in HP 12A', unit: 'hop', store: 'hcm', qty: 5, price: 1150000, note: '', vat: true },
  { id: 3, item: 'Bút bi Thiên Long', unit: 'hop', store: 'dn', qty: 40, price: 45000, note: 'Màu xanh', vat: false },
])
// Ô số bị xóa trắng → giữ trống (null) để báo lỗi bắt buộc, không tự điền 0
const numText = n => (n == null ? '' : fmtNum(n))
const q = ref('')
const view = computed(() => rows.value.filter(r => !q.value.trim() || normVi(r.item).includes(normVi(q.value.trim()))).map(r => ({ ...r, qtyText: numText(r.qty), priceText: numText(r.price), totalText: fmtNum((r.qty || 0) * (r.price || 0)) })))
const total = computed(() => rows.value.reduce((s, r) => s + (r.qty || 0) * (r.price || 0), 0))
const columns = computed(() => [
  { key: 'item', label: 'Tên hàng', type: 'textbox', minWidth: 220, required: true },
  { key: 'unit', label: 'Đơn vị tính', type: 'combobox', width: 140, options: UNITS, required: true },
  { key: 'store', label: 'Kho', type: 'combobox', width: 160, options: STORES },
  { key: 'qtyText', label: 'Số lượng', type: 'numberbox', width: 110, align: 'right', required: true, validate: v => (v !== '' && !(parseNum(v) > 0) ? 'Số lượng phải lớn hơn 0' : '') },
  { key: 'priceText', label: 'Đơn giá', type: 'numberbox', width: 140, align: 'right', required: true },
  { key: 'totalText', label: 'Thành tiền', width: 150, align: 'right', footerText: fmtNum(total.value) },
  { key: 'note', label: 'Ghi chú', type: 'textarea', width: 200 },
  { key: 'vat', label: 'Có VAT', type: 'toggle', width: 90, align: 'center' },
])
function onCell({ row, col, value }) {
  const r = rows.value.find(x => x.id === row.id); if (!r) return
  if (col.key === 'qtyText') r.qty = value.trim() === '' ? null : parseNum(value) || 0
  else if (col.key === 'priceText') r.price = value.trim() === '' ? null : parseNum(value) || 0
  else r[col.key] = value
}
function addRow() { q.value = ''; rows.value.push({ id: seq++, item: '', unit: 'cai', store: 'hn', qty: 1, price: 0, note: '', vat: true }) }
function removeRow(row) {
  const before = rows.value.map(r => ({ ...r }))
  rows.value = rows.value.filter(r => r.id !== row.id)
  toast.success(`Đã xóa dòng “${row.item || 'chưa đặt tên'}”`, { action: { label: 'Hoàn tác', icon: 'arrow-back-up', onClick: () => { rows.value = before } } })
}
</script>

<style scoped>
.demo-table__foot { display: flex; padding: 8px 12px; }   /* nút Thêm dòng nằm trong khung card bo góc → cách mép 12px */   /* dòng Tổng đã có viền dưới → không kẻ thêm */
</style>
