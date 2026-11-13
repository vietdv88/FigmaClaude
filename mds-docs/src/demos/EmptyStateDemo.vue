<template>
  <!-- Empty state — 4 dạng (quy chuẩn /ds/empty-state):
       1. Màn Tổng quan trống (nhiều card) · 2. Danh sách lần đầu (chưa từng có dữ liệu) · 3. Danh sách đã xóa hết · 4. Tìm kiếm / lọc không ra
       Dạng 2–4 là 1 luồng thật trên màn danh sách: Thêm → có dữ liệu · tick + Xóa hết → đã xóa hết (toast Hoàn tác) · gõ tìm không khớp → không có kết quả -->
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-muted">Dạng:</span>
      <div class="seg" role="group" aria-label="Dạng trạng thái trống">
        <button v-for="s in STATES" :key="s.id" type="button" class="seg__item" :class="{ 'seg__item--active': state === s.id }" :aria-pressed="state === s.id" @click="go(s.id)">{{ s.label }}</button>
      </div>
    </div>
    <span class="demo-muted">{{ STATES.find(s => s.id === state).hint }}</span>

    <!-- 1. Màn Tổng quan -->
    <template v-if="state === 'dashboard'">
      <div class="demo-row">
        <span class="demo-muted">Trường hợp:</span>
        <div class="seg" role="group" aria-label="Trường hợp trống của màn Tổng quan">
          <button v-for="c in DB_CASES" :key="c.id" type="button" class="seg__item" :class="{ 'seg__item--active': dbCase === c.id }" :aria-pressed="dbCase === c.id" @click="dbCase = c.id">{{ c.label }}</button>
        </div>
      </div>
      <span class="demo-muted">{{ DB_CASES.find(c => c.id === dbCase).hint }}</span>
      <LayoutFrame :active="0">
        <DashboardScreen :key="dbCase" :empty="dbCase" @empty-action="onEmptyAction" />
        <!-- “Bắt đầu sử dụng” ở khối tài khoản mới → mở đúng popup Bắt đầu sử dụng (/ds/onboarding-start) -->
        <AppOnboarding v-model="obOpen" v-model:level="obLevel" user-name="Trần Thanh Phương" product="AMIS CRM" :steps="obSteps[obLevel]" :fab="false"
          guides-title="Hướng dẫn sử dụng AMIS CRM" :guides="guidesOf(0)" :supports="SUPPORTS"
          @task="t => { t.done = true; toast.success(`Hoàn thành: ${t.label}`) }" @group-done="(g, d) => g.tasks.forEach(t => (t.done = d))" @step-done="(st, d) => tasksOf(st).forEach(t => (t.done = d))"
          @video="t => toast.info(`Ví dụ: phát video “${t.label}”`)" @guide="g => toast.info(`Ví dụ: mở “${g.label}”`)" @support="x => toast.info(`Ví dụ: mở “${x.label}”`)" />
      </LayoutFrame>
    </template>

    <!-- 2–4. Màn danh sách Hóa đơn bán hàng -->
    <LayoutFrame v-else :active="2">
      <div class="es-page">
        <div class="es-head">
          <h2 class="es-title">Hóa đơn bán hàng</h2>
          <!-- Lần đầu: nút đặt ở giữa vùng trống → không lặp trên tiêu đề -->
          <template v-if="hadData">
            <button type="button" class="btn btn--outline btn--neutral" @click="toast.info('Ví dụ: mở Nhập khẩu')"><TIcon name="file-import" />Nhập khẩu</button>
            <button type="button" class="btn btn--primary" @click="addSample"><TIcon name="plus" />Thêm hóa đơn</button>
          </template>
        </div>

        <!-- 2. Lần đầu (chưa từng có dữ liệu): KHÔNG có thanh công cụ / bảng — hình minh họa + giới thiệu + Thêm / Nhập khẩu -->
        <div v-if="!hadData" class="es-card surface">
          <div class="demo-empty">
            <EmptyArt variant="doc" :width="160" class="demo-empty__img" />
            <div class="demo-empty__title">Chưa có hóa đơn bán hàng</div>
            <div class="demo-empty__sub-text">Lập hóa đơn đầu tiên hoặc nhập khẩu từ tệp Excel để bắt đầu theo dõi doanh thu.</div>
            <div class="demo-row demo-empty__cta">
              <button type="button" class="btn btn--outline btn--neutral" @click="toast.info('Ví dụ: mở Nhập khẩu')"><TIcon name="file-import" />Nhập khẩu</button>
              <button type="button" class="btn btn--primary" @click="addSample"><TIcon name="plus" />Thêm hóa đơn</button>
            </div>
            <button type="button" class="btn btn--sm btn--text es-guide" @click="toast.info('Ví dụ: mở video hướng dẫn')"><TIcon name="player-play" />Xem hướng dẫn lập hóa đơn</button>
          </div>
        </div>

        <!-- 3, 4. Đã từng có dữ liệu: GIỮ thanh công cụ + hàng tiêu đề cột, thân bảng hiện trạng thái trống -->
        <div v-else class="table-panel es-table">
          <TableHeader v-model="q" search-placeholder="Tìm theo số hóa đơn, khách hàng" :search-width="260" hide-ai :hide-tools="rows.length ? [] : ['export', 'filter']"
            :bulk-action="selected.length > 0" :selected-count="selected.length" :total-count="filtered.length" @deselect-all="selected = []" @refresh="q = ''">
            <template #bulk-buttons><button type="button" class="btn btn--outline-danger" @click="removeSelected"><TIcon name="trash" />Xóa</button></template>
          </TableHeader>
          <div class="table-scroll es-scroll">
            <DataTable :columns="COLS" :rows="filtered" :selected="selected" @update:selected="v => (selected = v)">
              <template #empty>
                <!-- 4. Tìm kiếm không ra: icon kính lúp · nêu đúng từ khóa · gợi ý · Xóa tìm kiếm -->
                <template v-if="rows.length">
                  <EmptyArt variant="search" :width="160" class="dt-empty-state__art" />
                  <p class="dt-empty-state__title">Không tìm thấy hóa đơn khớp “{{ q }}”</p>
                  <p class="dt-empty-state__desc">Kiểm tra lại chính tả, thử từ khóa ngắn hơn (VD số hóa đơn hoặc một phần tên khách hàng).</p>
                  <div class="dt-empty-state__acts"><button type="button" class="btn btn--outline btn--neutral" @click="q = ''"><TIcon name="x" />Xóa tìm kiếm</button></div>
                </template>
                <!-- 3. Đã xóa hết: không minh họa lớn, không giới thiệu lại — 1 dòng + nút Thêm -->
                <template v-else>
                  <EmptyArt variant="cleared" :width="160" class="dt-empty-state__art" />
                  <p class="dt-empty-state__title">Chưa có hóa đơn nào</p>
                  <p class="dt-empty-state__desc">Các hóa đơn đã bị xóa. Thêm hóa đơn mới hoặc nhập khẩu từ Excel.</p>
                  <div class="dt-empty-state__acts"><button type="button" class="btn btn--outline btn--neutral" @click="addSample"><TIcon name="plus" />Thêm hóa đơn</button></div>
                </template>
              </template>
            </DataTable>
          </div>
        </div>
      </div>
    </LayoutFrame>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import TableHeader from '@mds/components/TableHeader.vue'
import DataTable from '@mds/components/DataTable.vue'
import { toast } from '@mds/utils/toast.js'
import { fmtNum } from '@mds/utils/number.js'
import { matchText } from '@mds/utils/search.js'
import LayoutFrame from './layout/LayoutFrame.vue'
import DashboardScreen from './layout/DashboardScreen.vue'
import AppOnboarding from '@mds/components/AppOnboarding.vue'
import EmptyArt from '@mds/components/EmptyArt.vue'
import { buildSteps, SUPPORTS, guidesOf, tasksOf } from './layout/onboardingData.js'

const STATES = [
  { id: 'dashboard', label: '1. Màn Tổng quan', hint: 'Nhiều card: không đặt hình minh họa từng card — card giữ khung & chiều cao, biểu đồ thu nhỏ + thông báo đúng cái thiếu.' },
  { id: 'initial', label: '2. Danh sách lần đầu', hint: 'Chưa từng có dữ liệu: không thanh công cụ / bảng (chưa có gì để tìm, lọc) — hình minh họa + giới thiệu ngắn + Thêm / Nhập khẩu + link hướng dẫn. Bấm Thêm hóa đơn để có dữ liệu.' },
  { id: 'cleared', label: '3. Đã xóa hết', hint: 'Từng có dữ liệu rồi xóa hết: giữ thanh công cụ + tiêu đề cột (người dùng đã quen màn), thân bảng 1 dòng + Thêm; xóa có toast Hoàn tác. Thử: tick hết dòng → Xóa.' },
  { id: 'noresult', label: '4. Tìm kiếm không ra', hint: 'Có dữ liệu nhưng tìm / lọc không khớp: giữ nguyên bảng có đủ cột, thân bảng nêu đúng từ khóa + gợi ý + Xóa tìm kiếm. Thử gõ từ khóa bất kỳ.' },
]
const state = ref('dashboard')
const DB_CASES = [
  { id: 'period', label: 'Kỳ không có dữ liệu', hint: 'Có dữ liệu nhưng kỳ đang chọn trống: card giữ nguyên khung & chiều cao, vùng biểu đồ là biểu đồ mờ đứng yên + 1 dòng nói đúng cái thiếu trong kỳ nào (chỉ thông báo, không link). Thẻ KPI hiện 0, ẩn so sánh kỳ trước.' },
  { id: 'new', label: 'Tài khoản mới', hint: 'Chưa có dữ liệu gì: hình minh họa chỉ 1 lần ở khối đầu trang + Nhập khẩu / Bắt đầu sử dụng; các card bên dưới giữ khung, biểu đồ thu nhỏ + lời nhắn (chỉ thông báo).' },
]
const dbCase = ref('period')
const obOpen = ref(false), obLevel = ref('basic'), obSteps = reactive(buildSteps())
function onEmptyAction(id) {
  if (id === 'start') { obOpen.value = true; return }
  const L = { year: 'đổi kỳ sang Năm nay', import: 'mở Nhập khẩu dữ liệu', start: 'mở Bắt đầu sử dụng', invoice: 'mở form Lập hóa đơn', expense: 'mở form Lập phiếu chi', branch: 'mở Khai báo chi nhánh', receipt: 'mở form Lập phiếu thu', customer: 'mở form Thêm khách hàng' }
  toast.info(`Ví dụ: ${L[id] || id}`)
}

/* ── Màn danh sách ── */
const COLS = [{ key: 'checkbox', type: 'checkbox', width: 40 }, { key: 'no', label: 'Số hóa đơn', width: 130, link: true }, { key: 'date', label: 'Ngày', width: 110 },
  { key: 'customer', label: 'Khách hàng', width: 260 }, { key: 'amount', label: 'Tổng tiền', width: 150, align: 'right' }, { key: 'note', label: 'Diễn giải', width: 280 }]
const CUSTOMERS = ['Công ty CP WINEPLAZA', 'Nhà hàng Al Fresco’s', 'Tạp chí đồ uống Việt Nam', 'Công ty TNHH Lotte Việt Nam', 'Siêu thị Minh Anh']
let seq = 0
const mk = () => { const i = seq++; return { id: i + 1, no: `HD${String(1201 + i).padStart(6, '0')}`, date: `${String(5 + (i % 20)).padStart(2, '0')}/11/2026`, customer: CUSTOMERS[i % 5], amount: fmtNum(1250000 * ((i * 7) % 9 + 1)), note: 'Bán hàng theo đơn đặt hàng' } }
const rows = ref([]), hadData = ref(false), q = ref(''), selected = ref([])
const filtered = computed(() => rows.value.filter(r => !q.value || matchText(`${r.no} ${r.customer}`, q.value)))
function addSample() { const add = Array.from({ length: rows.value.length ? 1 : 5 }, mk); rows.value = [...add, ...rows.value]; hadData.value = true; toast.success(add.length > 1 ? `Đã thêm ${add.length} hóa đơn mẫu` : 'Đã thêm hóa đơn') }
function removeSelected() {
  const del = rows.value.filter(r => selected.value.includes(r.id)), keep = rows.value.filter(r => !selected.value.includes(r.id))
  rows.value = keep; selected.value = []
  toast.success(`Đã xóa ${del.length} hóa đơn`, { action: { label: 'Hoàn tác', onClick: () => { rows.value = [...del, ...rows.value] } } })
}
function go(id) {
  state.value = id; q.value = ''; selected.value = []
  if (id === 'initial') { rows.value = []; hadData.value = false }
  else if (id === 'cleared') { rows.value = []; hadData.value = true }
  else if (id === 'noresult') { seq = 0; rows.value = Array.from({ length: 6 }, mk); hadData.value = true; q.value = 'Hòa Phát' }
}
</script>

<style scoped>
/* Khoảng cách theo tài liệu: hình → tiêu đề 16 · tiêu đề → mô tả 4 · mô tả → nút 24 */
.demo-empty-frame { display: flex; justify-content: center; padding: 48px 16px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default); background: var(--bg-white); }
.demo-empty { display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 400px; }
.demo-empty__img { margin-bottom: 16px; }   /* hình → tiêu đề 16 */
.demo-empty__title { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); color: var(--text-primary); }
.demo-empty__sub-text { margin-top: 4px; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.demo-empty__cta { margin-top: 24px; justify-content: center; }

/* Màn danh sách mẫu trong khung */
.es-page { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 16px; padding: 16px; }
.es-head { display: flex; align-items: center; gap: var(--gap-control); }
.es-title { flex: 1; min-width: 0; margin: 0; font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); }
.es-card { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; padding: 48px 16px; }
.es-guide { margin-top: 8px; }
.es-table { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.es-scroll { flex: 1; min-height: 0; }
</style>
