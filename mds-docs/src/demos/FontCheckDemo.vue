<template>
  <div class="demo-stack">
    <span class="demo-muted">Chữ thử điền sẵn chữ HOA có dấu chồng — gõ / sửa trực tiếp để xem dấu hỏi, ngã, huyền trên Ổ Ầ Ỗ Ỷ có bị cắt không. Đổi mật độ <b>Nhỏ / Trung bình / Rộng</b> ở bánh răng › Thiết lập hiển thị (Nhỏ là ô thấp nhất, dễ lỗi nhất).</span>

    <p class="demo-label">Ô nhập</p>
    <div class="demo-grid">
      <AppInput label="Tên đơn vị (cỡ thường)"><AppTextbox v-model="text" /></AppInput>
      <AppInput label="Tên đơn vị (cỡ nhỏ)"><AppTextbox v-model="text" size="sm" /></AppInput>
      <AppInput label="Chọn từ danh sách"><AppCombobox v-model="pick" :options="OPTIONS" /></AppInput>
      <AppInput label="Ô tìm kiếm"><AppSearchbox v-model="text" /></AppInput>
      <AppInput label="Nhiều dòng"><AppTextarea v-model="text" /></AppInput>
      <AppInput label="Chỉ đọc"><AppTextbox :model-value="SAMPLE" readonly /></AppInput>
    </div>

    <p class="demo-label">Nút · tag · chữ bị cắt “…”</p>
    <div class="demo-row">
      <button type="button" class="btn btn--primary">CỔ PHẦN Ỷ Ẩ</button>
      <button type="button" class="btn btn--neutral btn--sm">CỔ PHẦN Ỗ Ầ</button>
      <AppTag label="CỔ PHẦN Ở Ễ" color="brand" />
      <AppTag label="ĐÃ DUYỆT Ữ Ậ" color="success" dot />
      <span class="demo-fc-trunc">CÔNG TY CỔ PHẦN MISA — Ỷ Ẩ Ỗ Ầ Ở Ễ Ữ Ậ — công ty cổ phần</span>
    </div>

    <p class="demo-label">Trên bảng — bấm vào ô để sửa (cột hẹp để thấy chữ bị cắt “…”)</p>
    <div class="table-panel demo-fc-table">
      <div class="table-scroll">
        <DataTable editable :columns="columns" :rows="rows" :hide-blank-rows="false" @cell-update="onCell" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppInput from '@mds/components/AppInput.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import AppSearchbox from '@mds/components/AppSearchbox.vue'
import AppTextarea from '@mds/components/AppTextarea.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import AppTag from '@mds/components/AppTag.vue'
import DataTable from '@mds/components/DataTable.vue'

const SAMPLE = 'CÔNG TY CỔ PHẦN MISA — Ỷ Ẩ Ỗ Ầ Ở Ễ Ữ Ậ'
const text = ref(SAMPLE)
const OPTIONS = [
  { value: 'misa', label: 'CÔNG TY CỔ PHẦN MISA' },
  { value: 'tl', label: 'CÔNG TY CỔ PHẦN TẬP ĐOÀN THIÊN LONG' },
  { value: 'hk', label: 'HỘ KINH DOANH Ỷ LAN — ỔN ĐỊNH' },
]
const pick = ref('misa')
const rows = ref([
  { id: 1, name: 'CÔNG TY CỔ PHẦN MISA', addr: 'TẦNG 9, TÒA NHÀ TECHNOSOFT, PHỐ DUY TÂN, CẦU GIẤY, HÀ NỘI', rep: 'NGUYỄN VĂN ỔN', status: 'ĐÃ DUYỆT' },
  { id: 2, name: 'CÔNG TY CỔ PHẦN TẬP ĐOÀN THIÊN LONG', addr: 'ẤP TÂN HỘI, XÃ ĐỨC HÒA, LONG AN', rep: 'TRẦN THỊ Ỷ', status: 'CHỜ DUYỆT' },
  { id: 3, name: 'HỘ KINH DOANH TOKI RETREAT VÂN LONG', addr: 'XÃ GIA VÂN, HUYỆN GIA VIỄN, NINH BÌNH', rep: 'LÊ ẨN', status: 'TỪ CHỐI' },
])
const columns = [
  { key: 'name', label: 'TÊN ĐƠN VỊ', type: 'textbox', width: 200 },
  { key: 'addr', label: 'ĐỊA CHỈ', type: 'textbox', width: 220 },
  { key: 'rep', label: 'NGƯỜI ĐẠI DIỆN', type: 'textbox', width: 160 },
  { key: 'status', label: 'TRẠNG THÁI', type: 'combobox', width: 140, options: ['ĐÃ DUYỆT', 'CHỜ DUYỆT', 'TỪ CHỐI'] },
]
function onCell({ row, col, value }) { const r = rows.value.find(x => x.id === row.id); if (r) r[col.key] = value }
</script>

<style scoped>
.demo-fc-trunc { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: var(--text-body-lh); }
.demo-fc-table { height: auto; }
</style>
