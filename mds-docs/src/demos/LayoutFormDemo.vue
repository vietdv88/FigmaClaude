<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-muted">Dạng màn hình:</span>
      <AppCombobox v-model="kind" :options="KINDS" required :clearable="false" class="demo-layout-pick" />
    </div>
    <span class="demo-muted">{{ KINDS.find(k => k.value === kind).hint }} Nút <b>Lưu / Hủy luôn ghim cuối</b>.</span>

    <LayoutFrame>
      <template #controls><span class="demo-muted">Dạng màn hình:</span><AppCombobox v-model="kind" :options="KINDS" required :clearable="false" class="demo-layout-pick" /></template>
      <div :key="kind" class="lf-slot">
      <!-- Thêm dạng page: tiêu đề + quay lại · form full trang · Lưu / Hủy ghim đáy trang -->
      <div v-if="kind === 'page'" class="fm-page">
        <div class="fm-page__head">
          <button type="button" class="btn-icon" v-tip="'Quay lại'" aria-label="Quay lại"><TIcon name="arrow-left" /></button>
          <h2 class="fm-title">Thêm khách hàng</h2>
        </div>
        <div class="fm-page__body">
          <section class="fm-section surface">
            <h3 class="fm-section__title">Thông tin chung</h3>
            <CustomerFields :m="form" :cols="2" full />
          </section>
        </div>
        <footer class="fm-foot">
          <button type="button" class="btn btn--outline btn--neutral">Hủy</button>
          <button type="button" class="btn btn--primary" @click="toast.success('Đã lưu')">Lưu</button>
        </footer>
      </div>

      <!-- Popup: danh sách phía sau bị phủ mờ -->
      <template v-else>
        <div class="fm-behind">
          <div class="fm-behind__head"><h2 class="fm-title">Khách hàng</h2><button type="button" class="btn btn--primary"><TIcon name="plus" />Thêm mới</button></div>
          <div class="table-panel fm-behind__table"><DataTable :columns="CUSTOMER_COLUMNS" :rows="CUSTOMERS.slice(0, 8)" /></div>
        </div>
        <div class="fm-overlay">
          <div class="fm-dialog" :class="`fm-dialog--${kind}`" role="dialog" aria-label="Thêm khách hàng">
            <AppFormPanel title="Thêm khách hàng">
              <template v-if="kind === 'popup-full'" #toolbar>
                <div class="fm-dialog__tabs"><AppTabs v-model="tab" :items="TABS" aria-label="Nhóm thông tin" /></div>
              </template>
              <CustomerFields v-if="kind === 'popup' || tab === 'info'" :m="form" :cols="kind === 'popup-full' ? 2 : 1" :full="kind === 'popup-full'" />
              <div v-else class="table-scroll"><DataTable :columns="CONTACT_COLS" :rows="CONTACTS" /></div>
              <template #footer>
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
import { ref, reactive } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppTabs from '@mds/components/AppTabs.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import AppFormPanel from '@mds/components/AppFormPanel.vue'
import DataTable from '@mds/components/DataTable.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'
import LayoutFrame from './layout/LayoutFrame.vue'
import CustomerFields from './layout/CustomerFields.vue'
import { CUSTOMERS, CUSTOMER_COLUMNS } from './layout/data.js'

const KINDS = [
  { value: 'page',       label: 'Thêm dạng page',             hint: 'Form mở rộng full trang.' },
  { value: 'popup',      label: 'Thêm dạng popup nhỏ',         hint: 'Màn hình danh mục, ít thông tin, đơn giản.' },
  { value: 'popup-full', label: 'Thêm dạng popup full màn hình', hint: 'Phân hệ nhiều thông tin, tối ưu hết không gian hiển thị; bố trí tuỳ nghiệp vụ.' },
]
const kind = ref('page'), tab = ref('info')
const TABS = [{ value: 'info', label: 'Thông tin chung' }, { value: 'contact', label: 'Người liên hệ', badge: 2 }]
const form = reactive({ code: 'KH0011', name: '', group: null, owner: null, phone: '', email: '', date: '', limit: null, address: '', note: '' })
const CONTACT_COLS = [{ key: 'name', label: 'Họ tên', minWidth: 180 }, { key: 'title', label: 'Chức vụ', width: 160 }, { key: 'phone', label: 'Điện thoại', width: 140 }]
const CONTACTS = [{ id: 1, name: 'Nguyễn Văn Bình', title: 'Giám đốc', phone: '0912 345 678' }, { id: 2, name: 'Trần Thị Hoa', title: 'Kế toán trưởng', phone: '0987 654 321' }]
</script>

<style scoped>
.lf-slot { display: contents; }   /* đổi dạng → dựng lại nội dung, giữ nguyên khung (và chế độ toàn màn hình) */
.demo-layout-pick { width: 320px; max-width: 100%; }
.fm-title { margin: 0; font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); }
.fm-page { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.fm-page__head { display: flex; align-items: center; gap: 8px; padding: 16px 16px 12px; }
.fm-page__body { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; padding: 0 16px 16px; }   /* card trắng kéo dài tới cách footer 16px, không co theo số trường */
.fm-section { flex: 1 0 auto; padding: var(--card-py) var(--card-px); }   /* card: đệm 16 đều */
.fm-section__title { margin: 0 0 16px; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); }
.fm-foot { display: flex; justify-content: flex-end; gap: var(--gap-control); padding: 12px 16px; background: var(--bg-form-footer); border-top: 1px solid var(--stroke-form-footer); }
.fm-behind { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: var(--card-col-gap); padding: 16px; }
.fm-behind__head { display: flex; align-items: center; justify-content: space-between; }
.fm-behind__table { flex: 1; min-height: 0; overflow: hidden; background: var(--bg-white); }
.fm-overlay { position: absolute; inset: 0; z-index: 3; display: flex; align-items: center; justify-content: center; background: var(--bg-overlay); }
.fm-dialog { display: flex; flex-direction: column; overflow: hidden; border-radius: var(--radius-dialog); box-shadow: var(--shadow-dialog); background: var(--bg-white); }
.fm-dialog :deep(.form-panel) { flex: 1; min-height: 0; border-radius: 0; }
.fm-dialog--popup { width: 560px; }
.fm-dialog--popup-full { position: absolute; inset: 16px; }
.fm-dialog__tabs { padding: 0 24px 12px; }
</style>
