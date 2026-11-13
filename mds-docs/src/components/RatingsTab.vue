<template>
  <!-- Đánh giá nội dung: người đọc chấm 1–5 sao cuối mỗi trang, dưới 5 sao kèm góp ý → ban biên tập xem, sửa trang rồi đánh dấu Đã xử lý -->
  <div class="ds-rates">
    <div class="ds-rates__stats">
      <div class="card ds-rates__stat"><span class="ds-muted">Lượt đánh giá</span><b>{{ list.length }}</b></div>
      <div class="card ds-rates__stat"><span class="ds-muted">Điểm trung bình</span><b>{{ avg(list) }}<small> / 5</small></b></div>
      <div class="card ds-rates__stat"><span class="ds-muted">Góp ý chưa xử lý</span><b>{{ list.filter(r => r.stars < 5 && !r.handled).length }}</b></div>
    </div>
    <AppSegmented v-model="filter" :options="FILTERS" aria-label="Lọc đánh giá" class="ds-rates__seg" />
    <div class="table-panel ds-rates__panel">
      <TableHeader v-model="q" search-placeholder="Tìm theo trang, góp ý, người gửi" :search-width="260" :hide-ai="true" :hide-tools="['export', 'col-settings', 'filter']" @refresh="load" />
      <div class="table-scroll">
        <DataTable :columns="cols" :rows="rows" :hide-blank-rows="false" editable :row-actions="[{ icon: 'external-link', title: 'Mở trang', emit: 'open' }, { icon: 'pencil', title: 'Sửa trang', emit: 'edit' }]"
          @open="r => window.open(BASE + r.slug, '_blank')" @edit="r => router.push('/quan-tri/' + r.slug)" @cell-update="toggle">
          <template #empty>
            <EmptyArt :variant="list.length ? 'search' : 'doc'" :width="160" class="dt-empty-state__art" />
            <p class="dt-empty-state__title">{{ !loaded ? 'Đang tải…' : list.length ? 'Không có đánh giá khớp bộ lọc' : 'Chưa có đánh giá nào' }}</p>
            <p v-if="loaded && !list.length" class="dt-empty-state__desc">Người đọc chấm sao ở cuối mỗi trang tài liệu — đánh giá sẽ hiện ở đây.</p>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TableHeader from '@mds/components/TableHeader.vue'
import DataTable from '@mds/components/DataTable.vue'
import EmptyArt from '@mds/components/EmptyArt.vue'
import AppSegmented from '@mds/components/AppSegmented.vue'
import { toast } from '@mds/utils/toast.js'
import { matchText } from '@mds/utils/search.js'
import { api, fmtDateTime } from '../store.js'

const router = useRouter(), window = globalThis
const BASE = import.meta.env.BASE_URL
const list = ref([]), loaded = ref(false), q = ref(''), filter = ref('all')   // đánh giá còn ít → mặc định xem Tất cả
const FILTERS = computed(() => [
  { value: 'all', label: `Tất cả (${list.value.length})` },
  { value: 'todo', label: `Góp ý chưa xử lý (${list.value.filter(r => r.stars < 5 && !r.handled).length})` },
  { value: 'low', label: `Dưới 5 sao (${list.value.filter(r => r.stars < 5).length})` },
])
const avg = l => (l.length ? (l.reduce((s, r) => s + r.stars, 0) / l.length).toFixed(1).replace('.', ',') : '–')
const starText = n => '★'.repeat(n) + '☆'.repeat(5 - n)

async function load() {
  try { list.value = (await api('/ratings')).ratings } catch (e) { toast.error(e.message) } finally { loaded.value = true }
}
onMounted(load)

const cols = [
  { key: 'title', label: 'Trang', minWidth: 180 },
  { key: 'starsText', label: 'Đánh giá', width: 150 },
  { key: 'comment', label: 'Lý do / góp ý', minWidth: 280 },
  { key: 'who', label: 'Người gửi', width: 160 },
  { key: 'atText', label: 'Thời gian', width: 140 },
  { key: 'handled', label: 'Đã xử lý', type: 'toggle', width: 100, align: 'center' },
]
const rows = computed(() => list.value
  .filter(r => (filter.value === 'all' ? true : filter.value === 'low' ? r.stars < 5 : r.stars < 5 && !r.handled))
  .filter(r => !q.value || matchText(`${r.title} ${r.comment} ${r.userName}`, q.value))
  .map(r => ({ ...r, starsText: `${starText(r.stars)} ${r.stars}/5`, comment: r.comment || (r.stars < 5 ? '(không ghi lý do)' : ''), who: r.userName || 'Khách', atText: fmtDateTime(r.at) })))

async function toggle({ row, col, value }) {
  if (col.key !== 'handled') return
  const r = list.value.find(x => x.id === row.id); if (!r) return
  const before = r.handled; r.handled = !!value
  try { await api(`/ratings/${r.id}`, { method: 'PUT', body: { handled: r.handled } }) } catch (e) { r.handled = before; toast.error(e.message) }
}
</script>

<style scoped>
.ds-rates { display: flex; flex-direction: column; gap: 16px; }
.ds-rates__stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
.ds-rates__stat { display: flex; flex-direction: column; gap: 4px; padding: 16px; }
.ds-rates__stat b { font-size: var(--text-h2); line-height: var(--text-h2-lh); font-weight: var(--fw-semibold); }
.ds-rates__stat small { font-size: var(--text-body); color: var(--text-secondary); font-weight: var(--fw-regular); }
.ds-rates__seg { align-self: flex-start; }
.ds-rates__panel { display: flex; flex-direction: column; min-height: 320px; }
.ds-rates__empty { padding: 24px; text-align: center; }
</style>
