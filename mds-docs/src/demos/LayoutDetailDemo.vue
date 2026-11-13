<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-muted">Dạng màn hình:</span>
      <AppCombobox v-model="kind" :options="KINDS" required :clearable="false" class="demo-layout-pick" />
    </div>
    <span class="demo-muted">{{ KINDS.find(k => k.value === kind).hint }}</span>

    <LayoutFrame>
      <template #controls><span class="demo-muted">Dạng màn hình:</span><AppCombobox v-model="kind" :options="KINDS" required :clearable="false" class="demo-layout-pick" /></template>
      <div :key="kind" class="lf-slot">
      <!-- Xem dạng page: tổng quan + tab nhóm thông tin · phím chức năng ghim góc trên phải (Primary → More ngoài cùng) · rê chuột lên trường để sửa nhanh -->
      <div v-if="kind === 'page'" class="dt-page">
        <div class="dt-page__head">
          <button type="button" class="btn-icon" v-tip="'Quay lại'" aria-label="Quay lại"><TIcon name="arrow-left" /></button>
          <h2 class="dt-title">{{ c.name }}</h2>
          <span class="dt-status-badge" :class="`dt-status-badge--${c.status.color}`">{{ c.status.label }}</span>
          <span class="dt-sp" />
          <Actions />
        </div>
        <div class="dt-page__body">
          <section class="dt-overview surface">
            <AppAvatar :size="56" :name="c.name.replace(/^Công ty (CP|TNHH)\s*/, '')" />
            <div v-for="o in OVERVIEW" :key="o.label" class="dt-overview__item"><span class="demo-muted">{{ o.label }}</span><b>{{ o.value }}</b></div>
          </section>
          <section class="dt-main surface">
            <AppTabs v-model="tab" :items="TABS" aria-label="Nhóm thông tin" />
            <div v-if="tab === 'info'" class="form-fields form-fields--2col dt-fields">
              <DetailField v-for="f in FIELDS" :key="f.label" v-model="f.value" :label="f.label" :editable="f.editable !== false" @save="toast.success(`Đã cập nhật ${f.label}`)" />
            </div>
            <div v-else class="table-scroll"><DataTable :columns="ORDER_COLUMNS" :rows="ORDERS" /></div>
          </section>
        </div>
      </div>

      <template v-else>
        <div class="dt-behind">
          <h2 class="dt-title">Khách hàng</h2>
          <div class="table-panel dt-behind__table"><DataTable :columns="CUSTOMER_COLUMNS" :rows="CUSTOMERS.slice(0, 8)" /></div>
        </div>
        <div class="dt-overlay">
          <div class="dt-dialog" :class="`dt-dialog--${kind}`" role="dialog" :aria-label="c.name">
            <AppFormPanel :title="c.name" :tab-fields-only="kind === 'view-edit'">
              <template #header-end>
                <div class="dt-head-acts">
                  <!-- Dạng “xem là sửa”: form đơn giản, chỉ Lưu / Hủy ghim cuối — không đặt thêm nút chức năng / ⋯ ở tiêu đề cho đỡ rối -->
                  <Actions v-if="kind !== 'view-edit'" primary="Sửa" primary-icon="pencil" />
                  <button type="button" class="btn-icon" aria-label="Đóng (Esc)"><TIcon name="x" /></button>
                </div>
              </template>
              <template v-if="kind === 'popup-full'" #toolbar>
                <div class="dt-dialog__tabs"><AppTabs v-model="tab" :items="TABS" aria-label="Nhóm thông tin" /></div>
              </template>

              <!-- Xem popup: trường chỉ đọc, rê chuột để sửa nhanh -->
              <div v-if="kind === 'popup' || (kind === 'popup-full' && tab === 'info')" class="form-fields" :class="kind === 'popup-full' ? 'form-fields--2col' : ''">
                <DetailField v-for="f in (kind === 'popup' ? FIELDS.slice(0, 5) : FIELDS)" :key="f.label" v-model="f.value" :label="f.label" :editable="f.editable !== false" />
              </div>
              <div v-else-if="kind === 'popup-full'" class="table-scroll"><DataTable :columns="ORDER_COLUMNS" :rows="ORDERS" /></div>
              <!-- Dùng chung màn hình sửa nhưng khoá control -->
              <CustomerFields v-else-if="kind === 'disabled'" :m="form" full disabled />
              <!-- Không tách mode xem: mở ra là sửa luôn -->
              <CustomerFields v-else :m="form" full />

              <template v-if="kind === 'view-edit'" #footer>
                <button type="button" class="btn btn--outline btn--neutral">Hủy</button>
                <button type="button" class="btn btn--primary" @click="toast.success('Đã lưu')">Lưu</button>
              </template>
            </AppFormPanel>
          </div>
        </div>
      </template>
      </div>
    </LayoutFrame>
  </div>
</template>

<script setup>
import { ref, reactive, h } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppTabs from '@mds/components/AppTabs.vue'
import AppAvatar from '@mds/components/AppAvatar.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import AppFormPanel from '@mds/components/AppFormPanel.vue'
import DataTable from '@mds/components/DataTable.vue'
import DetailField from '@mds/components/DetailField.vue'
import DropdownMenu from '@mds/components/DropdownMenu.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'
import LayoutFrame from './layout/LayoutFrame.vue'
import CustomerFields from './layout/CustomerFields.vue'
import { CUSTOMERS, CUSTOMER_COLUMNS, ORDERS, ORDER_COLUMNS } from './layout/data.js'

const KINDS = [
  { value: 'page',       label: 'Xem dạng page (tách khỏi màn sửa)', hint: 'Bố trí khác màn sửa: thông tin tổng quan + tab nhóm thông tin. Phím chức năng ghim góc trên phải; rê chuột lên trường để sửa nhanh 1 trường.' },
  { value: 'popup',      label: 'Xem dạng popup ít thông tin',      hint: 'Popup nhỏ, các trường chỉ đọc — rê chuột lên trường để sửa nhanh.' },
  { value: 'popup-full', label: 'Xem dạng popup full page',         hint: 'Popup full màn hình cho bản ghi nhiều thông tin, chia tab.' },
  { value: 'disabled',   label: 'Dùng chung màn sửa, khoá control', hint: 'Giao diện xem y hệt màn sửa, các control bị khoá; bấm Sửa để mở khoá.' },
  { value: 'view-edit',  label: 'Không tách mode xem (xem là sửa)', hint: 'Form đơn giản, cập nhật là chính: mở ra sửa luôn, chỉ có Lưu / Hủy ghim cuối — tiêu đề form không đặt thêm nút chức năng.' },
]
const kind = ref('page'), tab = ref('info')
const c = CUSTOMERS[0]
const TABS = [{ value: 'info', label: 'Thông tin chung' }, { value: 'orders', label: 'Đơn hàng', badge: 3 }]
const OVERVIEW = [{ label: 'Mã khách hàng', value: c.code }, { label: 'Người phụ trách', value: c.owner }, { label: 'Công nợ', value: c.debtText }, { label: 'Đơn hàng năm nay', value: '24' }]
const FIELDS = reactive([
  { label: 'Mã khách hàng', value: c.code, editable: false },
  { label: 'Người phụ trách', value: c.owner },
  { label: 'Điện thoại', value: c.phone },
  { label: 'Email', value: c.email },
  { label: 'Tỉnh/Thành', value: c.city },
  { label: 'Địa chỉ', value: '12 Trần Duy Hưng, Cầu Giấy' },
  { label: 'Ngày hợp tác', value: '15/03/2021' },
  { label: 'Hạn mức nợ', value: '200.000.000', editable: false },
])
const form = reactive({ code: c.code, name: c.name, group: 'vip', owner: c.owner, phone: c.phone, email: c.email, date: '2021-03-15', limit: 200000000, address: '12 Trần Duy Hưng, Cầu Giấy', note: '' })
const MORE = [{ id: 'copy', label: 'Nhân bản', icon: 'copy' }, { id: 'print', label: 'In', icon: 'printer' }, { separator: true }, { id: 'del', label: 'Xóa', icon: 'trash', danger: true }]

/* Phím chức năng: nút Primary → nút More (3 chấm) luôn ngay bên phải, cả cụm ngoài cùng bên phải */
const Actions = (props) => h('div', { class: 'dt-acts' }, [
  h('button', { type: 'button', class: 'btn btn--primary', onClick: () => toast.info(props.primary || 'Sửa') }, [h(TIcon, { name: props['primary-icon'] || props.primaryIcon || 'pencil' }), props.primary || 'Sửa']),
  h(DropdownMenu, { items: MORE, placement: 'bottom-end', minWidth: 160, onSelect: i => toast.info(i.label) }, {
    trigger: ({ toggle }) => h('button', { type: 'button', class: 'btn-icon btn-icon--outline', 'aria-label': 'Thêm chức năng', onClick: e => { e.stopPropagation(); toggle() } }, [h(TIcon, { name: 'dots' })]),
  }),
])
Actions.props = ['primary', 'primaryIcon']
</script>

<style scoped>
.lf-slot { display: contents; }   /* đổi dạng → dựng lại nội dung, giữ nguyên khung (và chế độ toàn màn hình) */
.demo-layout-pick { width: 320px; max-width: 100%; }
.dt-title { margin: 0; font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); }
.dt-sp { flex: 1; }
.dt-page { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.dt-page__head { display: flex; align-items: center; gap: var(--gap-control); padding: 16px 16px 12px; }
.dt-page__body { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: var(--card-col-gap); padding: 0 16px 16px; }
.dt-overview { display: flex; align-items: center; gap: 40px; padding: var(--card-py) var(--card-px); }   /* card: đệm 16 đều */
.dt-overview__item { display: flex; flex-direction: column; gap: 2px; }
.dt-overview__item b { font-size: 16px; line-height: 24px; }
.dt-main { display: flex; flex-direction: column; gap: 16px; padding: 8px var(--card-px) var(--card-py); }   /* trên 8: dải tab đã có chiều cao riêng */
.dt-fields { padding-top: 4px; }
:deep(.dt-acts) { display: flex; align-items: center; gap: var(--gap-control); }
.dt-head-acts { display: flex; align-items: center; gap: var(--gap-control); }
.dt-behind { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: var(--card-col-gap); padding: 16px; }
.dt-behind__table { flex: 1; min-height: 0; overflow: hidden; background: var(--bg-white); }
.dt-overlay { position: absolute; inset: 0; z-index: 3; display: flex; align-items: center; justify-content: center; background: var(--bg-overlay); }
.dt-dialog { display: flex; flex-direction: column; overflow: hidden; border-radius: var(--radius-dialog); box-shadow: var(--shadow-dialog); background: var(--bg-white); max-height: calc(100% - 32px); }
.dt-dialog :deep(.form-panel) { flex: 1; min-height: 0; border-radius: 0; }
.dt-dialog--popup { width: 600px; }
.dt-dialog--disabled, .dt-dialog--view-edit { width: 640px; }
.dt-dialog--popup-full { position: absolute; inset: 16px; max-height: none; }
.dt-dialog__tabs { padding: 0 24px 12px; }
</style>
