<template>
  <div class="demo-stack">
    <!-- 1. Nút đang xử lý: bấm Lưu → vòng xoay thay chỗ chữ (giữ bề rộng, giữ màu, chặn bấm lặp) ~2 giây → toast kết quả -->
    <span class="demo-muted">Bấm nút để xem trạng thái đang xử lý: vòng xoay thay chỗ chữ, giữ nguyên bề rộng và màu nút, không bấm lặp được.</span>
    <div class="demo-row">
      <AppButton label="Lưu" :loading="saving.primary" @click="save('primary')" />
      <AppButton label="Lưu và thêm" variant="outline" color="neutral" :loading="saving.outline" @click="save('outline')" />
    </div>

    <!-- 2. Combo xổ ra đang tải dữ liệu: mở danh sách (@open) → gọi API → :loading = true trong lúc chờ → vòng xoay nhỏ (spinner 20 · viền 2) giữa danh sách -->
    <span class="demo-muted">Combo tải dữ liệu khi mở: bấm mở để xem vòng xoay (spinner) trong lúc chờ (mô phỏng 1,5 giây, mỗi lần mở tải lại).</span>
    <div class="ld-combos">
      <AppInput label="Khách hàng">
        <AppCombobox v-model="customer" :options="customers" :loading="busy.customer" placeholder="Chọn khách hàng" @open="load('customer')" />
      </AppInput>
      <AppInput label="Người thực hiện">
        <AppCombobox v-model="people" :options="staff" multiple tag-avatar :loading="busy.staff" placeholder="Chọn người thực hiện" @open="load('staff')" />
      </AppInput>
    </div>

    <!-- 3. Chuyển trang: header + sidebar giữ nguyên · phần tĩnh (tiêu đề, bộ lọc, tên biểu đồ) hiện luôn · phần dữ liệu là khung xương NẰM TRONG chính các thẻ thật → tải xong không giật -->
    <span class="demo-muted">Chuyển trang: bấm một mục trên sidebar của màn hình mẫu — header, sidebar và phần tĩnh (tiêu đề, bộ lọc, tên biểu đồ) giữ nguyên; chỉ phần dữ liệu hiện khung xương ngay trong các thẻ thật, cùng kích thước, nên tải xong không bị giật.</span>
    <LayoutFrame :active="active" navigable @nav="go">
      <template #bar><button type="button" class="btn btn--sm btn--text-neutral" @click="go(active)"><TIcon name="refresh" />Tải lại trang</button></template>
      <div class="ld-content" :aria-busy="pageLoading"><DashboardScreen :loading="pageLoading" /></div>
    </LayoutFrame>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import AppButton from '@mds/components/AppButton.vue'
import AppInput from '@mds/components/AppInput.vue'
import AppCombobox from '@mds/components/AppCombobox.vue'
import TIcon from '@mds/components/TIcon.vue'
import { toast } from '@mds/utils/toast.js'
import LayoutFrame from './layout/LayoutFrame.vue'
import DashboardScreen from './layout/DashboardScreen.vue'

/* ── Nút: bấm → đang xử lý 2 giây → toast ── */
const saving = reactive({ primary: false, outline: false })
function save(k) { saving[k] = true; timers.push(setTimeout(() => { saving[k] = false; toast.success('Đã lưu') }, 2000)) }

/* ── Combo: dữ liệu về sau 1,5 giây ── */
const CUSTOMERS = ['Công ty Cổ phần WINEPLAZA', 'Nhà hàng Al Fresco’s', 'Tạp chí đồ uống Việt Nam', 'Công ty TNHH Thương mại Lotte Việt Nam', 'Công ty CP Sữa Việt Nam', 'Công ty TNHH Bia Hà Nội']
  .map(l => ({ value: l, label: l }))
const STAFF = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Minh Châu', 'Phạm Quốc Dũng', 'Hoàng Thu Hà', 'Vũ Đức Huy'].map(n => ({ value: n, label: n, avatar: '' }))
const customer = ref(''), people = ref([])
const customers = ref([]), staff = ref([])
const busy = reactive({ customer: false, staff: false })
const timers = []
function load(kind) {
  busy[kind] = true
  timers.push(setTimeout(() => { (kind === 'customer' ? customers : staff).value = kind === 'customer' ? CUSTOMERS : STAFF; busy[kind] = false }, 1500))
}

/* ── Màn hình mẫu: chuyển trang → khung xương 1,2 giây ── */
const active = ref(0), pageLoading = ref(true)
function go(i) { active.value = i; pageLoading.value = true; timers.push(setTimeout(() => { pageLoading.value = false }, 1200)) }
go(0)
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<style scoped>
.ld-combos { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 16px; max-width: 640px; }
/* Vùng nội dung của màn hình mẫu: mốc cho khung xương (position: relative) — khung xương chỉ phủ vùng này */
.ld-content { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
</style>
