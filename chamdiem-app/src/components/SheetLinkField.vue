<template>
  <!-- Ô link Google Sheet dùng chung (vòng lặp / cả dự án): hướng dẫn chia sẻ công khai · tải file mẫu · tự đồng bộ -->
  <div class="slf">
    <TipField :label="scope === 'project' ? 'Link Google Sheet của dự án (tùy chọn)' : 'Link Google Sheet (tùy chọn)'" :message="error" :tip="tip">
      <AppTextbox :model-value="modelValue" placeholder="https://docs.google.com/spreadsheets/d/…" :state="error ? 'error' : 'default'"
        @update:model-value="v => $emit('update:modelValue', v)" />
    </TipField>
    <!-- Bắt buộc chia sẻ công khai — app đọc Sheet không cần đăng nhập Google -->
    <p class="slf__share">
      <TIcon name="world" />
      <span>File phải chia sẻ <strong>công khai</strong>: trong Google Sheet bấm <strong>Chia sẻ</strong> → <strong>Quyền truy cập chung</strong> → chọn
        <strong>“Bất kỳ ai có đường liên kết”</strong> (vai trò <strong>Người xem</strong>) → <strong>Sao chép đường liên kết</strong> rồi dán vào đây.</span>
    </p>
    <!-- Chưa có Sheet → tải file mẫu (đúng template nhập công việc) rồi đưa lên Google Sheet -->
    <p v-if="!modelValue" class="slf__line">
      <span>Chưa có Sheet?</span>
      <button type="button" class="btn btn--link btn--sm" @click="downloadImportTemplate"><TIcon name="download" />Tải file mẫu</button>
      <span>{{ scope === 'project' ? 'rồi mở bằng Google Sheet (Tệp → Nhập), mỗi trang tính là 1 vòng lặp (đặt tên trang tính = tên vòng lặp).' : 'rồi mở bằng Google Sheet (Tệp → Nhập), điền công việc và chia sẻ link.' }}</span>
    </p>
    <!-- Vòng lặp: file nhiều trang tính → đọc đúng trang có trong link (#gid=…); không có gid → trang tính đầu tiên -->
    <p v-if="scope === 'iteration' && tab" class="slf__line slf__line--note" :class="tab.gid ? 'slf__line--ok' : ''">
      <TIcon :name="tab.gid ? 'circle-check' : 'info-circle'" />
      <span v-if="tab.gid">Sẽ đọc đúng trang tính trong link (gid {{ tab.gid }}).</span>
      <span v-else>Link không chỉ rõ trang tính → đọc <strong>trang tính đầu tiên</strong> của file. File có nhiều trang: mở đúng trang tính cần lấy rồi copy link trên thanh địa chỉ trình duyệt (có đuôi <code>#gid=…</code>).</span>
    </p>
    <p v-if="scope === 'project' && tab" class="slf__line slf__line--note slf__line--ok">
      <TIcon name="circle-check" />
      <span>Mỗi trang tính được khớp với vòng lặp cùng tên; trang chưa có vòng lặp → đề xuất tạo mới khi đồng bộ. Trang không đúng template (Hướng dẫn, Danh mục…) tự bỏ qua.</span>
    </p>
    <AppCheckbox v-if="modelValue" :model-value="auto" :label="scope === 'project' ? 'Tự đồng bộ mỗi ngày các vòng lặp đã có (trang tính mới cần bấm Đồng bộ để tạo vòng lặp)' : 'Tự đồng bộ mỗi ngày (theo cách áp dụng chọn ở lần đồng bộ gần nhất)'"
      @update:model-value="v => $emit('update:auto', v)" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TipField    from './TipField.vue'
import AppTextbox  from '@mds/components/AppTextbox.vue'
import AppCheckbox from '@mds/components/AppCheckbox.vue'
import TIcon       from '@mds/components/TIcon.vue'
import { downloadImportTemplate } from '../store/taskImport.js'

const props = defineProps({
  modelValue: { type: String,  default: '' },
  auto:       { type: Boolean, default: true },
  error:      { type: String,  default: '' },
  scope:      { type: String,  default: 'iteration' },   // iteration | project
})
defineEmits(['update:modelValue', 'update:auto'])
const tip = computed(() => (props.scope === 'project'
  ? 'Cả dự án dùng 1 file Google Sheet, mỗi trang tính là 1 vòng lặp (tên trang tính = tên vòng lặp), theo đúng template nhập công việc. Bấm “Đồng bộ Sheet” ở trang dự án để lấy dữ liệu.'
  : 'Sheet theo đúng template nhập công việc. Có link → bấm “Đồng bộ Sheet” để lấy dữ liệu, hoặc để app tự đồng bộ mỗi ngày.'))
const tab = computed(() => (isSheetUrl(props.modelValue) ? { gid: String(props.modelValue).match(/[?&#]gid=(\d+)/)?.[1] ?? '' } : null))
</script>

<script>
/** Link Google Sheet hợp lệ (dùng chung để kiểm tra ở form) */
export const isSheetUrl = v => /docs\.google\.com\/spreadsheets\/d\/(e\/)?[\w-]{20,}/.test(String(v ?? ''))
</script>

<style scoped>
.slf { display: flex; flex-direction: column; gap: 8px; }
.slf__share { /* box thấp 1–2 dòng → icon căn giữa dọc (skill: Box / card thấp) */ display: flex; align-items: center; gap: 6px; padding: 8px 10px; border-radius: var(--radius-default); background: var(--bg-warning-light); font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
.slf__share strong { font-weight: var(--fw-semibold); }
.slf__share .ti { font-size: 14px; flex-shrink: 0; color: var(--icon-warning); }
.slf__line { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.slf__line--ok { color: var(--text-success); }
.slf__line--note { flex-wrap: nowrap; align-items: flex-start; }
.slf__line--note .ti { margin-top: 1px; }
.slf__line .ti { font-size: 14px; flex-shrink: 0; }
.slf__line .btn { padding: 0; height: auto; }
.slf__line code { padding: 0 3px; border-radius: var(--radius-sm); background: var(--bg-neutral-light); font-size: var(--text-body); }
</style>
