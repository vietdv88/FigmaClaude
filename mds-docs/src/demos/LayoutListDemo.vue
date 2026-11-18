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
      <!-- Khung màn hình = <AppPage> (mds-ui): tiêu đề trái · nút phụ → nút chính → More ngoài cùng phải · dải tab theo dạng · lề 16 -->
      <AppPage :title="TAB_KINDS.includes(kind) ? 'Quản lý khách hàng' : 'Khách hàng'"
        :tabs="TAB_KINDS.includes(kind) ? TABS : null" v-model:tab="tab" :tabs-style="TAB_STYLE[kind]">
        <!-- Rule hàng loạt (danh sách chỉ có tiêu đề): tick dòng → thanh hàng loạt CHE tiêu đề, ẩn Thêm / Nhập khẩu; thanh công cụ của bảng giữ nguyên -->
        <template v-if="LIST_KINDS.includes(kind)" #bulk>
          <BulkActionBar v-if="selected.length" :selected-count="selected.length" :total-count="128" :page-all-selected="pageAllSelected"
            @deselect-all="selected = []" @select-all-pages="toast.info('Ví dụ: chọn tất cả 128 bản ghi trên bảng')">
            <OverflowActions :actions="BULK" @select="onBulk" />
          </BulkActionBar>
        </template>
        <!-- Dạng seg-title: Segmented nằm cùng hàng tiêu đề (slot title-extra của AppPage) -->
        <template v-if="kind === 'seg-title'" #title-extra><AppSegmented v-model="segStatus" :options="SEG_OPTS" aria-label="Lọc theo trạng thái" class="ly-title-seg" /></template>
        <template #actions>
          <!-- Có tab (mỗi tab = một đối tượng / layout khác): tiêu đề chỉ giữ chức năng CHUNG cả phân hệ; Nhập khẩu / Thêm nằm ở thanh công cụ bảng của từng tab -->
          <button v-if="TAB_KINDS.includes(kind)" type="button" class="btn btn--outline btn--neutral" @click="toast.info('Ví dụ: báo cáo phân hệ')"><TIcon name="chart-bar" />Báo cáo</button>
          <template v-else>
            <button type="button" class="btn btn--outline btn--neutral" @click="toast.info('Nhập khẩu')"><TIcon name="file-import" />Nhập khẩu</button>
            <button type="button" class="btn btn--primary" @click="toast.info('Thêm khách hàng')"><TIcon name="plus" />Thêm mới</button>
          </template>
          <DropdownMenu :items="MORE" placement="bottom-end" :min-width="180" @select="i => toast.info(i.label)">
            <template #trigger="{ toggle }"><button type="button" class="btn-icon btn-icon--outline" aria-label="Thêm chức năng" @click.stop="toggle"><TIcon name="dots" /></button></template>
          </DropdownMenu>
        </template>

        <!-- Danh sách dạng card: vẫn có ô tìm kiếm (thanh công cụ nền trắng phía trên, như bảng) -->
        <template v-if="kind === 'cards'">
          <div class="ly-cardbar surface"><AppSearchbox v-model="q" placeholder="Tìm theo mã, tên" :width="240" /></div>
          <div class="app-card-grid">
            <article v-for="c in filtered.slice(0, 8)" :key="c.id" class="ly-card surface" tabindex="0" @click="toast.info(`Mở ${c.name}`)">
              <div class="ly-card__top"><AppAvatar :size="32" :name="c.name.replace(/^Công ty (CP|TNHH)\s*/, '')" /><span class="ly-card__name">{{ c.name }}</span></div>
              <span class="demo-muted">{{ c.code }} · {{ c.city }}</span>
              <div class="ly-card__tags"><span class="dt-status-badge" :class="`dt-status-badge--${c.status.color}`">{{ c.status.label }}</span></div>
              <div class="ly-card__foot"><span class="demo-muted">Công nợ</span><b>{{ c.debtText }}</b></div>
            </article>
            <span v-if="!filtered.length" class="demo-muted">Không có khách hàng phù hợp</span>
          </div>
        </template>

        <!-- Master-Detail = <AppMasterDetail> (mds-ui); danh sách thường → bảng nằm thẳng trong AppPage -->
        <component v-else :is="MD_LAYOUT[kind] ? AppMasterDetail : Passthrough" :layout="MD_LAYOUT[kind]">
          <template #master>
            <!-- Master trái nhỏ: danh sách gọn tên / mã / trạng thái -->
            <div v-if="kind === 'md-narrow'" class="ly-mini surface" role="listbox" aria-label="Khách hàng">
              <div class="ly-mini__search"><AppSearchbox v-model="q" placeholder="Tìm khách hàng" /></div>
              <button v-for="c in filtered" :key="c.id" type="button" class="ly-mini__item" :class="{ 'ly-mini__item--on': c.id === cur }" role="option" :aria-selected="c.id === cur" @click="cur = c.id">
                <AppAvatar :size="32" color="auto" :name="c.name.replace(/^Công ty (CP|TNHH)\s*/, '')" />
                <span class="ly-mini__txt">
                  <span class="ly-mini__name">{{ c.name }}</span>
                  <span class="demo-muted">{{ c.code }} · {{ c.status.label }}</span>
                </span>
              </button>
            </div>

            <!-- Bảng (master) -->
            <div v-else class="table-panel">
              <!-- Thanh công cụ bảng chuẩn mds-ui (TableHeader): tìm kiếm trái · Button Icon Outline theo thứ tự Làm mới → Xuất file → Thiết lập cột → Bộ lọc -->
              <!-- Dạng tab: bộ lọc nhanh + Nhập khẩu / Thêm / ⋯ nằm ở thanh công cụ bảng.
                   Rule hàng loạt: tick dòng → thao tác hàng loạt THẾ CHỖ bộ lọc nhanh và Thêm / Nhập khẩu, vẫn giữ ô tìm kiếm bên trái -->
              <TableHeader v-model="q" search-placeholder="Tìm theo mã, tên" :search-width="240" :hide-ai="true"
                :main-function-button="TAB_KINDS.includes(kind)" :bulk-action="TAB_KINDS.includes(kind) && selected.length > 0"
                :selected-count="selected.length" :total-count="128" :page-all-selected="pageAllSelected"
                @deselect-all="selected = []" @select-all-pages="toast.info('Ví dụ: chọn tất cả 128 bản ghi trên bảng')"
                @refresh="q = ''; toast.info('Ví dụ: làm mới danh sách')" @export="toast.info('Ví dụ: xuất khẩu danh sách')"
                @col-settings="toast.info('Ví dụ: thiết lập cột')" @open-filter="toast.info('Ví dụ: mở bộ lọc')">
                <!-- Bộ lọc trạng thái = Segmented (cùng một đối tượng, chỉ đổi cách lọc) — nằm NGAY TRÊN thanh công cụ bảng, cạnh ô tìm kiếm (slot filters), không chiếm thêm hàng -->
                <template v-if="kind === 'seg'" #filters><AppSegmented v-model="segStatus" :options="SEG_OPTS" aria-label="Lọc theo trạng thái" /></template>
                <template v-if="kind === 'tabs-top' || kind === 'seg-title'" #filters>
                  <AppCombobox v-model="fCity" :options="CITY_OPTS" placeholder="Tỉnh/Thành: Tất cả" class="ly-qf" />
                  <AppCombobox v-model="fOwner" :options="OWNER_OPTS" placeholder="Phụ trách: Tất cả" class="ly-qf" />
                  <AppCombobox v-if="kind !== 'seg-title'" v-model="fStatus" :options="STATUS_OPTS" placeholder="Trạng thái: Tất cả" class="ly-qf" />
                </template>
                <template #main-buttons>
                  <button type="button" class="btn btn--outline btn--neutral" @click="toast.info(`Nhập khẩu — ${tabLabel}`)"><TIcon name="file-import" />Nhập khẩu</button>
                  <button type="button" class="btn btn--primary" @click="toast.info(`Thêm — ${tabLabel}`)"><TIcon name="plus" />Thêm</button>
                  <DropdownMenu :items="MORE" placement="bottom-end" :min-width="180" @select="i => toast.info(i.label)">
                    <template #trigger="{ toggle }"><button type="button" class="btn-icon btn-icon--outline" aria-label="Thêm chức năng" @click.stop="toggle"><TIcon name="dots" /></button></template>
                  </DropdownMenu>
                </template>
                <template #bulk-buttons><OverflowActions :actions="BULK" @select="onBulk" /></template>
              </TableHeader>
              <div class="table-scroll">
                <DataTable :columns="tableCols" :rows="tableRows" :selected="selected" @update:selected="v => (selected = v)" @row-click="onRow" />
              </div>
              <TablePaging v-if="selectable || kind === 'md-bottom'" :total="128" v-model:page="pageNo" v-model:page-size="pageSize" :page-size-options="[10, 20, 50]" />
            </div>
          </template>

          <template #detail>
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
              <!-- Tab gạch chân: vùng bọc full-width có border-bottom, tab chưa chọn tắt gạch (:baseline="false") để không viền đôi -->
              <div class="ly-bottom__tabbar"><AppTabs v-model="dtab" :items="DTABS" :baseline="false" aria-label="Nhóm thông tin" /></div>
              <!-- Bảng Detail được bọc riêng: bo góc + viền đủ 4 cạnh -->
              <div class="ly-sub">
                <div class="table-scroll"><DataTable :columns="ORDER_COLUMNS" :rows="ORDERS" /></div>
                <TablePaging :total="ORDERS.length" v-model:page="dPageNo" v-model:page-size="dPageSize" :page-size-options="[10, 20, 50]" />
              </div>
            </section>
          </template>
        </component>

        <!-- Drawer phải = <AppDrawer> (mds-ui): đè lên danh sách nhưng danh sách vẫn bấm được · kéo mép trái để đổi độ rộng · Esc / ✕ đóng -->
        <AppDrawer v-if="kind === 'drawer'" v-model:open="drawerOpen" :title="current.name">
          <template #actions><button type="button" class="btn btn--primary btn--sm"><TIcon name="pencil" />Sửa</button></template>
          <div class="form-fields form-fields--h">
            <DetailField label="Mã khách hàng" :model-value="current.code" :editable="false" />
            <DetailField label="Trạng thái" :model-value="current.status.label" :editable="false" />
            <DetailField label="Người phụ trách" :model-value="current.owner" />
            <DetailField label="Điện thoại" :model-value="current.phone" />
            <DetailField label="Email" :model-value="current.email" />
            <DetailField label="Công nợ" :model-value="current.debtText" :editable="false" />
          </div>
        </AppDrawer>
      </AppPage>
      </div>
    </LayoutFrame>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppTabs from '@mds/components/AppTabs.vue'
import AppSegmented from '@mds/components/AppSegmented.vue'
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
import AppPage from '@mds/components/AppPage.vue'
import AppMasterDetail from '@mds/components/AppMasterDetail.vue'
import AppDrawer from '@mds/components/AppDrawer.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'
import { matchText } from '@mds/utils/search.js'
import LayoutFrame from './layout/LayoutFrame.vue'
import { CUSTOMERS, CUSTOMER_COLUMNS, ORDERS, ORDER_COLUMNS, MORE } from './layout/data.js'

const KINDS = [
  { value: 'list',      label: 'Danh sách cơ bản',              hint: 'Nền xám, bảng cách lề xung quanh. Bấm dòng → mở trang / popup chi tiết. Tick dòng → thao tác hàng loạt che lên tiêu đề, ẩn Thêm / Nhập khẩu; thanh công cụ bảng giữ nguyên.' },
  { value: 'seg',       label: 'Danh sách có bộ lọc trạng thái (Segmented)', hint: 'Cùng MỘT đối tượng, chỉ lọc theo trạng thái (Tất cả · Đang xử lý · Chờ xử lý · Đã xử lý · Đã huỷ) → dùng Segmented, KHÔNG dùng tab (tab dành cho nội dung / layout khác hẳn). Segmented nằm ở thanh công cụ bảng, cạnh ô tìm kiếm (không tốn thêm hàng); vì mọi mục đều là cùng một loại bản ghi nên Nhập khẩu / Thêm vẫn để ở tiêu đề chung. Tối đa 5–7 mục khi đủ chỗ hiển thị; nhiều hơn hoặc chật → đổi thành Combobox. Bắt đầu gõ tìm kiếm thì Segmented tự về “Tất cả” để tìm trên toàn bộ dữ liệu. Tick dòng → thao tác hàng loạt che tiêu đề như danh sách cơ bản.' },
  { value: 'seg-title', label: 'Danh sách có bộ lọc trạng thái (Segmented cùng hàng tiêu đề)', hint: 'Biến thể của dạng Segmented: Segmented đặt ngay sau tiêu đề, cùng một hàng (tiêu đề · Segmented ····· Nhập khẩu · Thêm mới · ⋯) — dùng khi thanh công cụ bảng cần chỗ cho bộ lọc nhanh. Thanh công cụ bảng: ô tìm kiếm trái, ngay bên phải là các bộ lọc nhanh (Combobox: Tỉnh/Thành, Phụ trách…; không lặp lại Trạng thái vì Segmented đã lọc), thiếu chỗ thì bộ lọc nhanh tự gom vào icon Bộ lọc. Bắt đầu gõ tìm kiếm thì Segmented tự về “Tất cả”. Tick dòng → thao tác hàng loạt che cả hàng tiêu đề (gồm Segmented) như danh sách cơ bản.' },
  { value: 'tabs',      label: 'Danh sách có nhiều tab (có tiêu đề)', hint: 'Tiêu đề + tab bên dưới — mỗi tab là một đối tượng / layout khác nhau trong cùng phân hệ (chỉ để LỌC dữ liệu thì dùng Segmented, không dùng tab). Tiêu đề chỉ giữ chức năng chung cả phân hệ (Báo cáo, ⋯); Nhập khẩu / Thêm nằm ở thanh công cụ bảng của từng tab, vì thêm cho đúng đối tượng của tab đang mở. Tick dòng → tiêu đề giữ nguyên; thao tác hàng loạt thế chỗ các chức năng trên thanh công cụ bảng, vẫn giữ ô tìm kiếm.' },
  { value: 'tabs-white', label: 'Danh sách có nhiều tab (nền trắng cả vùng tiêu đề)', hint: 'Như dạng có tiêu đề nhưng vùng tiêu đề + tab phía trên nền trắng liền một khối, tràn hai mép; từ nội dung tab trở xuống mới là nền xám. Cùng quy tắc: tiêu đề chỉ có chức năng chung, Nhập khẩu / Thêm ở thanh công cụ bảng của từng tab. Tick dòng → tiêu đề giữ nguyên; thao tác hàng loạt thế chỗ các chức năng trên thanh công cụ bảng.' },
  { value: 'tabs-top',  label: 'Danh sách có tab phân hệ con (tab thay tiêu đề)', hint: 'Không có tiêu đề: tab phân hệ nằm trên cùng; bộ lọc nhanh và Nhập khẩu / Thêm nằm ở thanh công cụ bảng. Tick dòng → thao tác hàng loạt thế chỗ bộ lọc nhanh và Nhập khẩu / Thêm, vẫn giữ ô tìm kiếm.' },
  { value: 'md-wide',   label: 'Master trái rộng · Detail phải nhỏ', hint: 'Bảng nhiều cột bên trái, bên phải chỉ tóm tắt dòng đang chọn — bấm dòng để đổi.' },
  { value: 'md-narrow', label: 'Master trái nhỏ · Detail phải rộng', hint: 'Bên trái chỉ tên / mã / trạng thái để chọn nhanh, bên phải làm việc sâu với bản ghi (rê chuột lên trường để sửa nhanh).' },
  { value: 'md-bottom', label: 'Master trên · Detail dưới',      hint: 'Chọn dòng ở bảng trên, chi tiết (tab) hiện ngay bên dưới, không mất vị trí trong danh sách.' },
  { value: 'drawer',    label: 'Master + Detail dạng drawer',    hint: 'Drawer đè bên phải nhưng vẫn bấm được dòng bên dưới để đổi bản ghi; kéo mép trái drawer để đổi độ rộng.' },
  { value: 'cards',     label: 'Danh sách dạng card',            hint: 'Mỗi bản ghi là một card — hợp với thông tin phi cấu trúc, thao tác nhanh từng mục, tối ưu mobile.' },
]
const kind = ref('list')
const TAB_STYLE = { tabs: 'below', 'tabs-white': 'white', 'tabs-top': 'top' }
const MD_LAYOUT = { 'md-wide': 'wide', 'md-narrow': 'narrow', 'md-bottom': 'bottom' }
/* Danh sách thường: bảng nằm thẳng trong AppPage (không bọc master-detail) */
const Passthrough = (_, { slots }) => [slots.master?.(), slots.detail?.()]
const TABS = [{ value: 'kh', label: 'Khách hàng', badge: 128 }, { value: 'lh', label: 'Liên hệ' }, { value: 'ch', label: 'Cơ hội', badge: 12 }, { value: 'hd', label: 'Hợp đồng' }]
const DTABS = [{ value: 'info', label: 'Thông tin chung' }, { value: 'orders', label: 'Đơn hàng', badge: 3 }]
const fCity = ref(''), fOwner = ref(''), fStatus = ref('')   // bộ lọc nhanh ở thanh công cụ bảng
const tab = ref('kh'), dtab = ref('info'), q = ref(''), cur = ref(1)
const drawerOpen = ref(true)

const pageNo = ref(1), pageSize = ref(10), dPageNo = ref(1), dPageSize = ref(10)
const filtered = computed(() => CUSTOMERS.filter(c => matchText([c.code, c.name], q.value) && (!fCity.value || c.city === fCity.value) && (!fOwner.value || c.owner === fOwner.value)))
const current = computed(() => CUSTOMERS.find(c => c.id === cur.value) || CUSTOMERS[0])
/* Chọn dòng (thao tác hàng loạt): danh sách thường / có tab — 2 rule hiển thị thanh hàng loạt theo có tiêu đề hay không */
const tabLabel = computed(() => TABS.find(t => t.value === tab.value)?.label)   // Thêm / Nhập khẩu trong thanh công cụ luôn thuộc đối tượng của tab đang mở
const LIST_KINDS = ['list', 'seg', 'seg-title']   // danh sách chỉ có tiêu đề: thao tác hàng loạt che tiêu đề
const SEG_KINDS = ['seg', 'seg-title']
const segStatus = ref('all')
const segCount = st => CUSTOMERS.filter(c => c.status.label === st).length
const SEG_OPTS = [{ value: 'all', label: 'Tất cả', badge: CUSTOMERS.length }, ...['Đang giao dịch', 'Chờ duyệt', 'Ngừng giao dịch'].map(v => ({ value: v, label: v, badge: segCount(v) }))]   // badge = số bản ghi của từng trạng thái
// Bắt đầu gõ tìm kiếm (ô đang trống → có chữ) → tự về mục “Tất cả” để tìm trên toàn bộ dữ liệu; sau đó người dùng chọn lại mục nào thì giữ mục đó
watch(q, (n, o) => { if (SEG_KINDS.includes(kind.value) && n.trim() && !(o || '').trim() && segStatus.value !== 'all') segStatus.value = 'all' })
const TAB_KINDS = ['tabs', 'tabs-white', 'tabs-top']   // dạng có tab: thao tác hàng loạt nằm ở thanh công cụ bảng, KHÔNG che tiêu đề
const selectable = computed(() => ['list', 'seg', 'seg-title', 'tabs', 'tabs-white', 'tabs-top'].includes(kind.value))
const selected = ref([])
watch(kind, () => { selected.value = [] })   // đổi dạng màn → bỏ chọn
const pageAllSelected = computed(() => selected.value.length > 0 && selected.value.length >= tableRows.value.length)
const BULK = [{ id: 'owner', label: 'Gán phụ trách', icon: 'user' }, { id: 'export', label: 'Xuất khẩu', icon: 'file-export' }, { id: 'delete', label: 'Xóa', icon: 'trash', danger: true }]
function onBulk(id) { toast.info(`Ví dụ: ${BULK.find(b => b.id === id).label} ${selected.value.length} khách hàng`); if (id === 'delete') selected.value = [] }
const CITY_OPTS = [...new Set(CUSTOMERS.map(c => c.city))].map(v => ({ value: v, label: v }))
const OWNER_OPTS = [...new Set(CUSTOMERS.map(c => c.owner))].map(v => ({ value: v, label: v }))
const STATUS_OPTS = [...new Map(CUSTOMERS.map(c => [c.status.label, c.status])).values()].map(v => ({ value: v.label, label: v.label }))
const tableCols = computed(() => [...(selectable.value ? [{ key: 'checkbox', type: 'checkbox', width: 40 }] : []), ...(kind.value === 'md-wide' ? CUSTOMER_COLUMNS.filter(c => c.key !== 'owner') : CUSTOMER_COLUMNS)])
const tableRows = computed(() => {
  const withDetail = ['md-wide', 'md-bottom', 'drawer'].includes(kind.value)
  const list = kind.value === 'md-bottom' ? filtered.value.slice(0, 4) : SEG_KINDS.includes(kind.value) && segStatus.value !== 'all' ? filtered.value.filter(c => c.status.label === segStatus.value) : filtered.value   // Master trên: vừa đủ dòng, phần dưới dành cho Detail
  return list.map(r => ({ ...r, _mark: withDetail && r.id === cur.value && (kind.value !== 'drawer' || drawerOpen.value) ? 'current' : '' }))
})
function onRow(row) {
  if (['list', 'seg', 'seg-title', 'tabs', 'tabs-white'].includes(kind.value)) return toast.info(`Mở chi tiết: ${row.name}`)
  cur.value = row.id; if (kind.value === 'drawer') drawerOpen.value = true
}
</script>

<style scoped>
.lf-slot { display: contents; }   /* đổi dạng → dựng lại nội dung, giữ nguyên khung (và chế độ toàn màn hình) */
.demo-layout-pick { width: 320px; max-width: 100%; }
.ly-head__acts { display: flex; align-items: center; gap: var(--gap-control); }
.ly-qf { width: 170px; }
.ly-title-seg { margin-left: var(--gap-control); }   /* tiêu đề → Segmented: gap hàng tiêu đề + 8 = 16, tách khỏi chữ tiêu đề */
.ly-side { padding: var(--card-py) var(--card-px); display: flex; flex-direction: column; gap: 16px; overflow: auto; }
.ly-side__head { display: flex; align-items: center; gap: var(--gap-control); line-height: var(--text-body-lh); }
.ly-dl { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 10px 8px; margin: 0; }
.ly-dl dt { color: var(--text-secondary); }
.ly-dl dd { margin: 0; overflow-wrap: anywhere; }
.ly-mini { display: flex; flex-direction: column; overflow: auto; padding: 8px; }
.ly-mini__search { padding: 4px 4px 8px; }
.ly-mini__item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: none; border-radius: var(--radius-default); background: transparent; text-align: left; font: inherit; color: var(--text-primary); cursor: pointer; }
.ly-mini__txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
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
.ly-bottom { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 16px; padding: 16px; overflow: hidden; }   /* đệm đều 4 phía = 16 (card padding), khoảng tab → bảng cũng 16 */
.ly-bottom__tabbar { margin: 0 -16px; padding: 0 16px; border-bottom: 1px solid var(--stroke-neutral); }
.ly-bottom .ly-sub { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--stroke-neutral); border-radius: var(--radius-default); }
.ly-bottom .ly-sub .table-scroll { flex: 1; min-height: 0; overflow: auto; }
.ly-bottom .ly-sub :deep(.dt-row--header) { border-top: none; }   /* viền trên do khung bọc vẽ — hàng tiêu đề không vẽ thêm (tránh viền đôi) */
.ly-bottom__head { display: flex; align-items: center; justify-content: space-between; gap: var(--gap-control); }
.ly-cardbar { padding: 12px 16px; }
.ly-card { display: flex; flex-direction: column; gap: 8px; padding: var(--card-py) var(--card-px); cursor: pointer; transition: box-shadow 0.15s; }
.ly-card:hover { box-shadow: var(--shadow-bottom-8); }
.ly-card:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: 2px; }
.ly-card__top { display: flex; align-items: center; gap: 8px; min-width: 0; }
.ly-card__name { font-weight: var(--fw-semibold); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ly-card__foot { display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--stroke-neutral-light); }
</style>
