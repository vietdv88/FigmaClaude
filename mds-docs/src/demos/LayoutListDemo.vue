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
      <div class="ly-page">
        <!-- Dạng tab phân hệ con: KHÔNG có tiêu đề — dải tab nằm trên cùng (nền trắng, tràn 2 mép) -->
        <div v-if="kind === 'tabs-top'" class="ly-toptabs"><AppTabs v-model="tab" :items="TABS" :baseline="false" aria-label="Phân hệ" /></div>
        <!-- Tiêu đề trái · nút phụ → nút chính → More (luôn ngoài cùng bên phải).
             Rule hàng loạt (danh sách chỉ có tiêu đề): tick dòng → thanh hàng loạt CHE tiêu đề, ẩn Thêm / Nhập khẩu; thanh công cụ của bảng giữ nguyên -->
        <div v-else class="ly-head">
          <BulkActionBar v-if="selectable && selected.length" :selected-count="selected.length" :total-count="128" :page-all-selected="pageAllSelected"
            @deselect-all="selected = []" @select-all-pages="toast.info('Ví dụ: chọn tất cả 128 bản ghi trên bảng')">
            <OverflowActions :actions="BULK" @select="onBulk" />
          </BulkActionBar>
          <template v-else>
            <h2 class="ly-title">Khách hàng</h2>
            <div class="ly-head__acts">
              <button type="button" class="btn btn--outline btn--neutral" @click="toast.info('Nhập khẩu')"><TIcon name="file-import" />Nhập khẩu</button>
              <button type="button" class="btn btn--primary" @click="toast.info('Thêm khách hàng')"><TIcon name="plus" />Thêm mới</button>
              <DropdownMenu :items="MORE" placement="bottom-end" :min-width="180" @select="i => toast.info(i.label)">
                <template #trigger="{ toggle }"><button type="button" class="btn-icon btn-icon--outline" aria-label="Thêm chức năng" @click.stop="toggle"><TIcon name="dots" /></button></template>
              </DropdownMenu>
            </div>
          </template>
        </div>

        <AppTabs v-if="kind === 'tabs'" v-model="tab" :items="TABS" class="ly-tabs" aria-label="Phân hệ" />

        <!-- Danh sách dạng card -->
        <div v-if="kind === 'cards'" class="ly-cards">
          <article v-for="c in CUSTOMERS.slice(0, 8)" :key="c.id" class="ly-card surface" tabindex="0" @click="toast.info(`Mở ${c.name}`)">
            <div class="ly-card__top"><AppAvatar :size="32" :name="c.name.replace(/^Công ty (CP|TNHH)\s*/, '')" /><span class="ly-card__name">{{ c.name }}</span></div>
            <span class="demo-muted">{{ c.code }} · {{ c.city }}</span>
            <div class="ly-card__tags"><span class="dt-status-badge" :class="`dt-status-badge--${c.status.color}`">{{ c.status.label }}</span></div>
            <div class="ly-card__foot"><span class="demo-muted">Công nợ</span><b>{{ c.debtText }}</b></div>
          </article>
        </div>

        <div v-else class="ly-body" :class="`ly-body--${kind}`">
          <!-- Master trái nhỏ: danh sách gọn tên / mã / trạng thái -->
          <div v-if="kind === 'md-narrow'" class="ly-mini surface" role="listbox" aria-label="Khách hàng">
            <div class="ly-mini__search"><AppSearchbox v-model="q" placeholder="Tìm khách hàng" /></div>
            <button v-for="c in filtered" :key="c.id" type="button" class="ly-mini__item" :class="{ 'ly-mini__item--on': c.id === cur }" role="option" :aria-selected="c.id === cur" @click="cur = c.id">
              <span class="ly-mini__name">{{ c.name }}</span>
              <span class="demo-muted">{{ c.code }} · {{ c.status.label }}</span>
            </button>
          </div>

          <!-- Bảng (master) -->
          <div v-else class="table-panel ly-table">
            <!-- Thanh công cụ bảng chuẩn mds-ui (TableHeader): tìm kiếm trái · Button Icon Outline theo thứ tự Làm mới → Xuất file → Thiết lập cột → Bộ lọc -->
            <!-- Dạng tab phân hệ con: bộ lọc nhanh + Nhập khẩu / Thêm / ⋯ nằm ở thanh công cụ bảng.
                 Rule hàng loạt: tick dòng → thao tác hàng loạt THẾ CHỖ bộ lọc nhanh và Thêm / Nhập khẩu, vẫn giữ ô tìm kiếm bên trái -->
            <TableHeader v-model="q" search-placeholder="Tìm theo mã, tên" :search-width="240" :hide-ai="true"
              :main-function-button="kind === 'tabs-top'" :bulk-action="kind === 'tabs-top' && selected.length > 0"
              :selected-count="selected.length" :total-count="128" :page-all-selected="pageAllSelected"
              @deselect-all="selected = []" @select-all-pages="toast.info('Ví dụ: chọn tất cả 128 bản ghi trên bảng')"
              @refresh="q = ''; toast.info('Ví dụ: làm mới danh sách')" @export="toast.info('Ví dụ: xuất khẩu danh sách')"
              @col-settings="toast.info('Ví dụ: thiết lập cột')" @open-filter="toast.info('Ví dụ: mở bộ lọc')">
              <template v-if="kind === 'tabs-top'" #filters>
                <AppCombobox v-model="fCity" :options="CITY_OPTS" placeholder="Tỉnh/Thành: Tất cả" class="ly-qf" />
                <AppCombobox v-model="fOwner" :options="OWNER_OPTS" placeholder="Phụ trách: Tất cả" class="ly-qf" />
                <AppCombobox v-model="fStatus" :options="STATUS_OPTS" placeholder="Trạng thái: Tất cả" class="ly-qf" />
              </template>
              <template #main-buttons>
                <button type="button" class="btn btn--outline btn--neutral" @click="toast.info('Nhập khẩu')"><TIcon name="file-import" />Nhập khẩu</button>
                <button type="button" class="btn btn--primary" @click="toast.info('Thêm khách hàng')"><TIcon name="plus" />Thêm</button>
                <DropdownMenu :items="MORE" placement="bottom-end" :min-width="180" @select="i => toast.info(i.label)">
                  <template #trigger="{ toggle }"><button type="button" class="btn-icon btn-icon--outline" aria-label="Thêm chức năng" @click.stop="toggle"><TIcon name="dots" /></button></template>
                </DropdownMenu>
              </template>
              <template #bulk-buttons><OverflowActions :actions="BULK" @select="onBulk" /></template>
            </TableHeader>
            <div class="table-scroll">
              <DataTable :columns="tableCols" :rows="tableRows" :selected="selected" @update:selected="v => (selected = v)" @row-click="onRow" />
            </div>
            <TablePaging v-if="selectable" :total="128" v-model:page="pageNo" v-model:page-size="pageSize" :page-size-options="[10, 20, 50]" />
          </div>

          <!-- Detail -->
          <aside v-if="kind === 'md-wide'" class="ly-side surface" aria-label="Tóm tắt">
            <div class="ly-side__head"><AppAvatar :size="40" :name="current.owner" /><div><b>{{ current.name }}</b><br /><span class="demo-muted">{{ current.code }}</span></div></div>
            <dl class="ly-dl">
              <dt>Trạng thái</dt><dd><span class="dt-status-badge" :class="`dt-status-badge--${current.status.color}`">{{ current.status.label }}</span></dd>
              <dt>Điện thoại</dt><dd>{{ current.phone }}</dd>
              <dt>Email</dt><dd>{{ current.email }}</dd>
              <dt>Phụ trách</dt><dd>{{ current.owner }}</dd>
              <dt>Công nợ</dt><dd><b>{{ current.debtText }}</b></dd>
            </dl>
          </aside>

          <section v-else-if="kind === 'md-narrow'" class="ly-detail surface" aria-label="Chi tiết khách hàng">
            <div class="ly-detail__head">
              <div><h3 class="ly-detail__title">{{ current.name }}</h3><span class="demo-muted">{{ current.code }} · {{ current.city }}</span></div>
              <div class="ly-head__acts">
                <button type="button" class="btn btn--primary"><TIcon name="pencil" />Sửa</button>
                <button type="button" class="btn-icon btn-icon--outline" aria-label="Thêm chức năng"><TIcon name="dots" /></button>
              </div>
            </div>
            <AppTabs v-model="dtab" :items="DTABS" aria-label="Nhóm thông tin" />
            <div v-if="dtab === 'info'" class="form-fields form-fields--2col ly-fields">
              <DetailField label="Mã khách hàng" :model-value="current.code" :editable="false" />
              <DetailField label="Người phụ trách" :model-value="current.owner" />
              <DetailField label="Điện thoại" :model-value="current.phone" />
              <DetailField label="Email" :model-value="current.email" />
              <DetailField label="Tỉnh/Thành" :model-value="current.city" />
              <DetailField label="Công nợ" :model-value="current.debtText" :editable="false" />
            </div>
            <div v-else class="table-scroll ly-sub"><DataTable :columns="ORDER_COLUMNS" :rows="ORDERS" /></div>
          </section>

          <section v-else-if="kind === 'md-bottom'" class="ly-bottom surface" aria-label="Chi tiết dòng đang chọn">
            <div class="ly-bottom__head"><b>{{ current.name }}</b><AppTabs v-model="dtab" :items="DTABS" :underline="false" variant="neutral" aria-label="Nhóm thông tin" /></div>
            <div class="table-scroll ly-sub"><DataTable :columns="ORDER_COLUMNS" :rows="ORDERS" /></div>
          </section>
        </div>

        <!-- Drawer phải: đè lên danh sách nhưng danh sách vẫn bấm được · kéo mép trái để đổi độ rộng -->
        <aside v-if="kind === 'drawer' && drawerOpen" class="ly-drawer" :style="{ width: drawerW + 'px' }" aria-label="Chi tiết khách hàng">
          <span class="ly-drawer__resize" title="Kéo để đổi độ rộng" @mousedown.prevent="startResize" />
          <div class="ly-drawer__head">
            <h3 class="ly-detail__title">{{ current.name }}</h3>
            <button type="button" class="btn btn--primary btn--sm"><TIcon name="pencil" />Sửa</button>
            <button type="button" class="btn-icon" aria-label="Đóng" @click="drawerOpen = false"><TIcon name="x" /></button>
          </div>
          <div class="form-fields form-fields--h ly-drawer__body">
            <DetailField label="Mã khách hàng" :model-value="current.code" :editable="false" />
            <DetailField label="Trạng thái" :model-value="current.status.label" :editable="false" />
            <DetailField label="Người phụ trách" :model-value="current.owner" />
            <DetailField label="Điện thoại" :model-value="current.phone" />
            <DetailField label="Email" :model-value="current.email" />
            <DetailField label="Công nợ" :model-value="current.debtText" :editable="false" />
          </div>
        </aside>
      </div>
      </div>
    </LayoutFrame>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppTabs from '@mds/components/AppTabs.vue'
import AppAvatar from '@mds/components/AppAvatar.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import AppSearchbox from '@mds/components/AppSearchbox.vue'
import TableHeader from '@mds/components/TableHeader.vue'
import BulkActionBar from '@mds/components/BulkActionBar.vue'
import OverflowActions from '@mds/components/OverflowActions.vue'
import TablePaging from '@mds/components/TablePaging.vue'
import DataTable from '@mds/components/DataTable.vue'
import DetailField from '@mds/components/DetailField.vue'
import DropdownMenu from '@mds/components/DropdownMenu.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'
import { matchText } from '@mds/utils/search.js'
import LayoutFrame from './layout/LayoutFrame.vue'
import { CUSTOMERS, CUSTOMER_COLUMNS, ORDERS, ORDER_COLUMNS, MORE } from './layout/data.js'

const KINDS = [
  { value: 'list',      label: 'Danh sách cơ bản',              hint: 'Nền xám, bảng cách lề xung quanh. Bấm dòng → mở trang / popup chi tiết. Tick dòng → thao tác hàng loạt che lên tiêu đề, ẩn Thêm / Nhập khẩu; thanh công cụ bảng giữ nguyên.' },
  { value: 'tabs',      label: 'Danh sách có nhiều tab (có tiêu đề)', hint: 'Tiêu đề + tab bên dưới — mỗi tab là một danh sách khác nhau trong cùng phân hệ. Tick dòng → thao tác hàng loạt che lên tiêu đề, ẩn Thêm / Nhập khẩu; thanh công cụ bảng giữ nguyên.' },
  { value: 'tabs-top',  label: 'Danh sách có tab phân hệ con (tab thay tiêu đề)', hint: 'Không có tiêu đề: tab phân hệ nằm trên cùng; bộ lọc nhanh và Nhập khẩu / Thêm nằm ở thanh công cụ bảng. Tick dòng → thao tác hàng loạt thế chỗ bộ lọc nhanh và Nhập khẩu / Thêm, vẫn giữ ô tìm kiếm.' },
  { value: 'md-wide',   label: 'Master trái rộng · Detail phải nhỏ', hint: 'Bảng nhiều cột bên trái, bên phải chỉ tóm tắt dòng đang chọn — bấm dòng để đổi.' },
  { value: 'md-narrow', label: 'Master trái nhỏ · Detail phải rộng', hint: 'Bên trái chỉ tên / mã / trạng thái để chọn nhanh, bên phải làm việc sâu với bản ghi (rê chuột lên trường để sửa nhanh).' },
  { value: 'md-bottom', label: 'Master trên · Detail dưới',      hint: 'Chọn dòng ở bảng trên, chi tiết (tab) hiện ngay bên dưới, không mất vị trí trong danh sách.' },
  { value: 'drawer',    label: 'Master + Detail dạng drawer',    hint: 'Drawer đè bên phải nhưng vẫn bấm được dòng bên dưới để đổi bản ghi; kéo mép trái drawer để đổi độ rộng.' },
  { value: 'cards',     label: 'Danh sách dạng card',            hint: 'Mỗi bản ghi là một card — hợp với thông tin phi cấu trúc, thao tác nhanh từng mục, tối ưu mobile.' },
]
const kind = ref('list')
const TABS = [{ value: 'kh', label: 'Khách hàng', badge: 128 }, { value: 'lh', label: 'Liên hệ' }, { value: 'ch', label: 'Cơ hội', badge: 12 }, { value: 'hd', label: 'Hợp đồng' }]
const DTABS = [{ value: 'info', label: 'Thông tin chung' }, { value: 'orders', label: 'Đơn hàng', badge: 3 }]
const tab = ref('kh'), dtab = ref('info'), q = ref(''), cur = ref(1)
const drawerOpen = ref(true), drawerW = ref(420)

const pageNo = ref(1), pageSize = ref(10)
const filtered = computed(() => CUSTOMERS.filter(c => matchText([c.code, c.name], q.value)))
const current = computed(() => CUSTOMERS.find(c => c.id === cur.value) || CUSTOMERS[0])
/* Chọn dòng (thao tác hàng loạt): danh sách thường / có tab — 2 rule hiển thị thanh hàng loạt theo có tiêu đề hay không */
const selectable = computed(() => ['list', 'tabs', 'tabs-top'].includes(kind.value))
const selected = ref([])
watch(kind, () => { selected.value = [] })   // đổi dạng màn → bỏ chọn
const pageAllSelected = computed(() => selected.value.length > 0 && selected.value.length >= tableRows.value.length)
const BULK = [{ id: 'owner', label: 'Gán phụ trách', icon: 'user' }, { id: 'export', label: 'Xuất khẩu', icon: 'file-export' }, { id: 'delete', label: 'Xóa', icon: 'trash', danger: true }]
function onBulk(id) { toast.info(`Ví dụ: ${BULK.find(b => b.id === id).label} ${selected.value.length} khách hàng`); if (id === 'delete') selected.value = [] }
const fCity = ref(''), fOwner = ref(''), fStatus = ref('')
const CITY_OPTS = [...new Set(CUSTOMERS.map(c => c.city))].map(v => ({ value: v, label: v }))
const OWNER_OPTS = [...new Set(CUSTOMERS.map(c => c.owner))].map(v => ({ value: v, label: v }))
const STATUS_OPTS = [...new Map(CUSTOMERS.map(c => [c.status.label, c.status])).values()].map(v => ({ value: v.label, label: v.label }))
const tableCols = computed(() => [...(selectable.value ? [{ key: 'checkbox', type: 'checkbox', width: 40 }] : []), ...(kind.value === 'md-wide' ? CUSTOMER_COLUMNS.filter(c => c.key !== 'owner') : CUSTOMER_COLUMNS)])
const tableRows = computed(() => {
  const withDetail = ['md-wide', 'md-bottom', 'drawer'].includes(kind.value)
  const list = kind.value === 'md-bottom' ? filtered.value.slice(0, 6) : filtered.value   // Master trên: vừa đủ dòng, phần dưới dành cho Detail
  return list.map(r => ({ ...r, _mark: withDetail && r.id === cur.value && (kind.value !== 'drawer' || drawerOpen.value) ? 'current' : '' }))
})
function onRow(row) {
  if (['list', 'tabs'].includes(kind.value)) return toast.info(`Mở chi tiết: ${row.name}`)
  cur.value = row.id; if (kind.value === 'drawer') drawerOpen.value = true
}
/* Kéo mép trái drawer — chia cho tỉ lệ thu nhỏ của khung để con trỏ đi đúng tay */
function startResize(e) {
  const frame = e.target.closest('.lf'), s = frame ? frame.getBoundingClientRect().width / 1280 : 1
  const x0 = e.clientX, w0 = drawerW.value
  const move = ev => { drawerW.value = Math.min(760, Math.max(320, w0 + (x0 - ev.clientX) / s)) }
  const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
}
</script>

<style scoped>
.lf-slot { display: contents; }   /* đổi dạng → dựng lại nội dung, giữ nguyên khung (và chế độ toàn màn hình) */
.demo-layout-pick { width: 320px; max-width: 100%; }
.ly-page { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; gap: var(--card-col-gap); padding: 16px; }
.ly-head { display: flex; align-items: center; gap: var(--gap-control); }
.ly-title { flex: 1; margin: 0; font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); }
.ly-head__acts { display: flex; align-items: center; gap: var(--gap-control); }
.ly-tabs { margin-top: -4px; }
/* Tab phân hệ con thay tiêu đề: dải trắng trên cùng, tràn 2 mép vùng nội dung (bù đệm 16 của trang) */
.ly-toptabs { margin: -16px -16px 0; padding: 0 16px; background: var(--bg-white); border-bottom: 1px solid var(--stroke-neutral-light); }
.ly-qf { width: 170px; }
.ly-body { flex: 1; min-height: 0; display: flex; gap: var(--card-col-gap); }   /* card ↔ card 16 */
.ly-body--md-bottom { flex-direction: column; }
.ly-table { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-white); }
.ly-table .table-scroll { flex: 1; min-height: 0; overflow: auto; }
.ly-body--md-bottom .ly-table { flex: 1.2; }
.ly-side { width: 300px; flex-shrink: 0; padding: var(--card-py) var(--card-px); display: flex; flex-direction: column; gap: 16px; overflow: auto; }
.ly-side__head { display: flex; align-items: center; gap: var(--gap-control); line-height: var(--text-body-lh); }
.ly-dl { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 10px 8px; margin: 0; }
.ly-dl dt { color: var(--text-secondary); }
.ly-dl dd { margin: 0; overflow-wrap: anywhere; }
.ly-mini { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; overflow: auto; padding: 8px; }
.ly-mini__search { padding: 4px 4px 8px; }
.ly-mini__item { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border: none; border-radius: var(--radius-default); background: transparent; text-align: left; font: inherit; color: var(--text-primary); cursor: pointer; }
.ly-mini__item:hover { background: var(--bg-brand-light); }
.ly-mini__item--on { background: var(--bg-brand-light); }
.ly-mini__item--on:hover { background: var(--bg-brand-light-hover); }
.ly-mini__item--on .ly-mini__name { color: var(--text-brand); font-weight: var(--fw-semibold); }
.ly-mini__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ly-detail { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; padding: var(--card-py) var(--card-px); overflow: auto; }
.ly-detail__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--gap-control); }
.ly-detail__title { margin: 0; font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); }
.ly-fields { padding-top: 4px; }
.ly-sub { overflow: auto; }
.ly-bottom { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 8px; padding: var(--card-py) var(--card-px); overflow: hidden; }
.ly-bottom__head { display: flex; align-items: center; justify-content: space-between; gap: var(--gap-control); }
.ly-drawer { position: absolute; top: 0; right: 0; bottom: 0; z-index: 3; display: flex; flex-direction: column; background: var(--bg-white); box-shadow: var(--shadow-dialog); }
.ly-drawer__resize { position: absolute; left: -3px; top: 0; bottom: 0; width: 6px; cursor: col-resize; }
.ly-drawer__resize:hover { background: var(--stroke-brand); }
.ly-drawer__head { display: flex; align-items: center; gap: 8px; padding: 16px 16px 12px 20px; }
.ly-drawer__head .ly-detail__title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ly-drawer__body { padding: 0 20px 20px; overflow: auto; }
.ly-cards { flex: 1; min-height: 0; overflow: auto; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--card-col-gap); align-content: start; }
.ly-card { display: flex; flex-direction: column; gap: 8px; padding: var(--card-py) var(--card-px); cursor: pointer; transition: box-shadow 0.15s; }
.ly-card:hover { box-shadow: var(--shadow-bottom-8); }
.ly-card:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: 2px; }
.ly-card__top { display: flex; align-items: center; gap: 8px; min-width: 0; }
.ly-card__name { font-weight: var(--fw-semibold); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ly-card__foot { display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--stroke-neutral-light); }
</style>
