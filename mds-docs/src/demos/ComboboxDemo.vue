<template>
  <div class="demo-stack">
    <p class="demo-label">Dạng đơn giản · chọn nhiều</p>
    <div class="demo-grid">
      <AppInput label="Chọn 1 — Người phụ trách (gõ để tìm)">
        <AppCombobox v-model="owner" :options="staff" placeholder="Chọn người phụ trách" />
      </AppInput>
      <AppInput label="Chọn nhiều — Người tham gia">
        <AppCombobox v-model="people" :options="staff" multiple placeholder="Chọn người tham gia" />
      </AppInput>
      <AppInput label="Chọn nhiều, cho thêm giá trị mới — Nhãn">
        <AppCombobox v-model="tags" :options="tagOptions" multiple creatable placeholder="Chọn hoặc nhập nhãn" />
      </AppInput>
      <AppInput label="Ô hẹp, dữ liệu dài — danh sách giãn rộng hơn ô">
        <AppCombobox v-model="unit" :options="units" placeholder="Chọn đơn vị" class="demo-narrow" />
      </AppInput>
    </div>

    <!-- Dạng bảng: nhiều thông tin để phân biệt (mã, địa chỉ, điện thoại…) · chân danh sách Thêm mới (F9) / Tìm nhanh (F3) -->
    <p class="demo-label">Dạng bảng</p>
    <div class="demo-grid">
      <AppInput label="Đối tượng">
        <AppCombobox v-model="partner" :options="partners" :columns="PARTNER_COLS" placeholder="Chọn đối tượng"
          @add="t => toast.info(`Ví dụ: mở form thêm đối tượng${t ? ` “${t}”` : ''}`)" @quick-search="() => toast.info('Ví dụ: mở tìm nhanh đối tượng')">
          <template #footer="{ close, query }">
            <button type="button" class="btn btn--link" @click="close(); toast.info(`Ví dụ: mở form thêm đối tượng${query ? ` “${query}”` : ''}`)"><TIcon name="plus" />Thêm mới (F9)</button>
            <span class="demo-cb-foot-sep" />
            <button type="button" class="btn btn--link" @click="close(); toast.info('Ví dụ: mở tìm nhanh đối tượng')"><TIcon name="search" />Tìm nhanh (F3)</button>
          </template>
        </AppCombobox>
      </AppInput>
    </div>

    <!-- Dạng cây: đơn vị nhiều cấp, co / giãn nhánh -->
    <p class="demo-label">Dạng cây</p>
    <div class="demo-grid">
      <AppInput label="Đơn vị">
        <AppCombobox v-model="org" :options="ORG" collapsible placeholder="Tất cả đơn vị" />
      </AppInput>
    </div>

    <!-- Thêm giá trị mới khi đang nhập liệu: gõ không có → “Nhấn Enter để thêm mới” · ⋯ = thiết lập danh sách giá trị -->
    <p class="demo-label">Thêm giá trị mới khi đang nhập liệu</p>
    <div class="demo-grid">
      <AppInput label="Nghề nghiệp">
        <AppCombobox v-model="job" :options="shownJobs" creatable clearable placeholder="Chọn hoặc nhập nghề nghiệp" split-icon="dots" split-tip="Thiết lập giá trị"
          @create="addJob" @split="openManage" />
      </AppInput>
    </div>
    <span class="demo-muted">Gõ một nghề chưa có (VD “Nông dân”) → Enter để thêm vào danh sách · bấm ⋯ để sửa, ẩn, xóa, kéo đổi thứ tự các giá trị.</span>

    <!-- Thiết lập giá trị (Figma): tìm · ô tick hiện / ẩn · sửa tên · xóa · kéo thả đổi thứ tự · Thêm dòng · Hủy / Lưu -->
    <Teleport to="body">
      <div v-if="manage" class="demo-modal-overlay" @mousedown.self="manage = null">
        <div class="demo-modal demo-cb-manage" role="dialog" aria-label="Thiết lập giá trị">
          <AppFormPanel title="Thiết lập giá trị" @close="manage = null">
            <div class="demo-cb-manage__body">
              <AppSearchbox v-model="manageQ" placeholder="Tìm kiếm" />
              <ul class="demo-cb-manage__list">
                <li v-for="(r, i) in shownRows" :key="r.id" class="demo-cb-manage__row" :class="{ 'demo-cb-manage__row--over': overIdx === i }"
                  @dragover.prevent="overIdx = i" @drop.prevent="dropRow(i)">
                  <AppCheckbox v-model="r.on" :aria-label="`Hiện “${r.name}” trong danh sách`" />
                  <AppTextbox v-model="r.name" class="demo-cb-manage__input" placeholder="Nhập giá trị" />
                  <button type="button" class="btn-icon btn-icon--sm demo-cb-manage__del" v-tip="'Xóa'" aria-label="Xóa" @click="removeRow(r)"><TIcon name="minus" /></button>
                  <span class="demo-cb-manage__grip" draggable="true" v-tip="'Kéo để đổi thứ tự'" aria-label="Kéo để đổi thứ tự" @dragstart="dragId = r.id" @dragend="dragId = overIdx = null"><TIcon name="grip-vertical" /></span>
                </li>
              </ul>
              <button type="button" class="btn btn--outline btn--sm demo-cb-manage__add" @click="addRow"><TIcon name="plus" />Thêm dòng</button>
            </div>
            <template #footer>
              <button type="button" class="btn btn--outline btn--neutral" @click="manage = null">Hủy</button>
              <button type="button" class="btn btn--primary" @click="saveManage">Lưu</button>
            </template>
          </AppFormPanel>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppInput from '@mds/components/AppInput.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import AppFormPanel from '@mds/components/AppFormPanel.vue'
import AppSearchbox from '@mds/components/AppSearchbox.vue'
import AppTextbox from '@mds/components/AppTextbox.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'
import { matchText } from '@mds/utils/search.js'
import { useEscClose } from '@mds/utils/escStack.js'

const staff = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Thu Dung', 'Vũ Minh Đức', 'Đỗ Thanh Hà']
const tagOptions = ['Khẩn', 'Quan trọng', 'Theo dõi']
const units = ['Văn phòng Tổng công ty', 'Chi nhánh Hà Nội — Khối Kinh doanh doanh nghiệp', 'Chi nhánh TP. Hồ Chí Minh — Trung tâm Chăm sóc khách hàng', 'Phòng Kế toán']
const owner = ref('Lê Hoàng Cường')
const people = ref(['Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Thu Dung'])
const tags = ref(['Khẩn'])
const unit = ref('')

// Dạng bảng
const PARTNER_COLS = [{ key: 'code', label: 'Mã đối tượng', width: 110 }, { key: 'name', label: 'Tên đối tượng', width: 170 }, { key: 'address', label: 'Địa chỉ', width: 170 }, { key: 'phone', label: 'Điện thoại', width: 120 }, { key: 'type', label: 'Loại đối tượng', width: 120 }]
const partners = [
  ['B-001', 'Lưu Trung Khôi', 'Số 48 Phố Định Tiên Hoàng', '0984123456', 'Nhân viên'], ['B-002', 'Trần Hữu Thắng', 'Số 7 Nguyễn Hồng', '0984234678', 'Nhân viên'],
  ['B-003', 'Nguyễn Lan Phương', 'Số 98 Cầu Giấy', '0984345789', 'Nhân viên'], ['B-004', 'Lê Khắc Khỏe', 'Số 36 Hoàng Mai', '0984456890', 'Nhân viên'],
  ['B-005', 'Trần Xuân Bách', 'Số 25 Đống Các', '0984561234', 'Nhân viên'], ['KH-010', 'Công ty TNHH An Phát', 'Số 12 Duy Tân', '0243556677', 'Khách hàng'],
  ['NCC-02', 'Công ty CP Bình Minh', 'KCN Bắc Thăng Long', '0243889900', 'Nhà cung cấp'],
].map(([code, name, address, phone, type]) => ({ value: code, label: `${name} (${code})`, code, name, address, phone, type }))
const partner = ref('')

// Dạng cây (depth = cấp · text = tên ngắn · label = đường dẫn đầy đủ khi đã chọn / khi tìm · parent = có mục con)
const ORG = [
  { value: 'misa', depth: 0, parent: true, open: true, text: 'Công ty cổ phần MISA', label: 'Công ty cổ phần MISA' },
  { value: 'hdqt', depth: 1, text: 'Hội đồng quản trị', label: 'MISA › Hội đồng quản trị' },
  { value: 'bdh', depth: 1, text: 'Ban điều hành', label: 'MISA › Ban điều hành' },
  { value: 'sx', depth: 1, parent: true, text: 'Khối sản xuất', label: 'MISA › Khối sản xuất' },
  { value: 'sx-1', depth: 2, text: 'Trung tâm phát triển sản phẩm', label: 'MISA › Khối sản xuất › Trung tâm phát triển sản phẩm' },
  { value: 'sx-2', depth: 2, text: 'Trung tâm kiểm thử', label: 'MISA › Khối sản xuất › Trung tâm kiểm thử' },
  { value: 'hcsn', depth: 1, parent: true, text: 'Khối KD Thị trường HCSN', label: 'MISA › Khối KD Thị trường HCSN' },
  { value: 'hcsn-1', depth: 2, text: 'Phòng KD HCSN miền Bắc', label: 'MISA › Khối KD Thị trường HCSN › Phòng KD HCSN miền Bắc' },
  { value: 'dn', depth: 1, parent: true, text: 'Khối KD Thị trường Doanh nghiệp', label: 'MISA › Khối KD Thị trường Doanh nghiệp' },
  { value: 'dn-1', depth: 2, text: 'Phòng KD GP DN lớn', label: 'MISA › Khối KD Thị trường Doanh nghiệp › Phòng KD GP DN lớn' },
  { value: 'gl', depth: 1, parent: true, text: 'Khối KD Thị trường toàn cầu', label: 'MISA › Khối KD Thị trường toàn cầu' },
  { value: 'gl-1', depth: 2, text: 'Phòng KD Đông Nam Á', label: 'MISA › Khối KD Thị trường toàn cầu › Phòng KD Đông Nam Á' },
  { value: 'cn', depth: 1, parent: true, text: 'Khối KD Thị trường Khách hàng cá nhân', label: 'MISA › Khối KD Thị trường Khách hàng cá nhân' },
  { value: 'cn-1', depth: 2, text: 'Phòng KD Online', label: 'MISA › Khối KD Thị trường Khách hàng cá nhân › Phòng KD Online' },
]
const org = ref('')

// Thêm giá trị mới + Thiết lập giá trị
let uid = 0
const jobs = ref(['Bộ đội', 'Chủ doanh nghiệp', 'Công chức', 'Công nhân', 'Nhà báo', 'Kỹ sư'].map(name => ({ id: ++uid, name, on: name !== 'Kỹ sư' })))
const shownJobs = computed(() => jobs.value.filter(j => j.on && j.name.trim()).map(j => j.name))
const job = ref('')
function addJob(name) { jobs.value.push({ id: ++uid, name, on: true }); toast.success(`Đã thêm “${name}” vào danh sách`) }
const manage = ref(null), manageQ = ref(''), dragId = ref(null), overIdx = ref(null)
const shownRows = computed(() => (manageQ.value.trim() ? manage.value.filter(r => matchText(r.name, manageQ.value)) : manage.value))
function openManage() { manage.value = jobs.value.map(j => ({ ...j })); manageQ.value = '' }
function addRow() { manage.value.push({ id: ++uid, name: '', on: true }) }
function removeRow(r) { manage.value.splice(manage.value.indexOf(r), 1) }
function dropRow(i) {
  const from = manage.value.findIndex(r => r.id === dragId.value), to = manage.value.indexOf(shownRows.value[i])
  if (from < 0 || to < 0 || from === to) return
  const [m] = manage.value.splice(from, 1); manage.value.splice(to, 0, m); dragId.value = overIdx.value = null
}
function saveManage() { jobs.value = manage.value.filter(r => r.name.trim()); manage.value = null; toast.success('Đã lưu danh sách giá trị') }
useEscClose(() => { manage.value = null }, () => !!manage.value)
</script>

<style scoped>
.demo-cb-foot-sep { width: 1px; height: 16px; background: var(--stroke-neutral); }
.demo-cb-manage { width: 480px; }
.demo-cb-manage__body { display: flex; flex-direction: column; gap: 12px; }
.demo-cb-manage__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; max-height: 360px; overflow-y: auto; }
.demo-cb-manage__row { display: flex; align-items: center; gap: var(--gap-control); border-radius: var(--radius-default); }
.demo-cb-manage__row--over { box-shadow: 0 -2px 0 var(--stroke-brand); }
.demo-cb-manage__input { flex: 1; min-width: 0; }
.demo-cb-manage__del:hover .ti { color: var(--icon-danger); }
.demo-cb-manage__grip { display: inline-flex; color: var(--icon-neutral); cursor: grab; }
.demo-cb-manage__add { align-self: flex-start; }
</style>
