<template>
  <div class="history">
    <p v-if="!entries.length" class="history__empty">Chưa có thay đổi lớn nào. Lịch sử ghi: ai tạo việc, ai sửa thông tin chính (tên, PD / BA, loại việc, ngày hoàn thành) và ai thay đổi điểm.</p>
    <div v-for="h in entries" :key="h.id" class="history__item">
      <UserAvatar class="history__avatar" :name="userName(h.userId)" :picture="avatarOf(userById(h.userId))" />
      <div class="history__body">
        <div class="history__head">
          <span class="history__who">{{ userName(h.userId) || 'Không rõ' }}</span>
          <span class="history__what">{{ whatOf(h) }}</span>
          <span class="history__time">{{ formatDateTime(h.at) }}</span>
        </div>
        <ul v-if="h.changes.length" class="history__changes">
          <li v-for="(c, i) in h.changes" :key="i" :class="{ 'history__score': SCORE_LABELS[c.field] }">
            <!-- Trường chữ dài chỉ ghi “đã sửa” (không lưu nội dung) -->
            <template v-if="isMark(c)"><span class="history__field">{{ MARK_LABELS[c.field] ?? `Đã sửa ${FIELD_LABELS[c.field] ?? c.field}` }}</span></template>
            <template v-else>
              <span class="history__field">{{ SCORE_LABELS[c.field] ?? FIELD_LABELS[c.field] ?? c.field }}:</span>
              <span class="history__from">{{ fmt(c.field, c.from) }}</span>
              <TIcon name="arrow-right" class="history__arrow" />
              <span class="history__to">{{ fmt(c.field, c.to) }}</span>
            </template>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { avatarOf } from '../store/avatar.js'
import { computed } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import { historyOf, userName, userById } from '../store/db.js'
import UserAvatar from './UserAvatar.vue'
import { FIELD_LABELS, formatDate, formatDateTime } from '../store/scoring.js'

const props = defineProps({ taskId: { type: String, required: true } })
const entries = computed(() => historyOf(props.taskId))

const ACTION_LABEL = { create: 'đã tạo công việc', import: 'đã nhập công việc từ file' }
const MARK_LABELS = { content: 'Đã đổi tên công việc', ratingReason: 'Đã sửa lý do đánh giá', solutionBrief: 'Đã sửa tóm tắt giải pháp', concept: 'Đã sửa concept' }
const isMark = c => !('from' in c || 'to' in c)
/** Dòng tiêu đề: đổi điểm → “đã thay đổi điểm” · chỉ sửa thông tin chính → “đã cập nhật công việc” */
const whatOf = h => ACTION_LABEL[h.action] ?? (h.changes.some(c => SCORE_LABELS[c.field]) ? 'đã thay đổi điểm' : 'đã cập nhật công việc')
const SCORE_LABELS = { finalScore: 'Điểm PD sau đánh giá', score: 'Điểm PD', baScore: 'Điểm thực nhận (BA)' }

function fmt(field, v) {
  if (v === '' || v == null) return SCORE_LABELS[field] ? '0' : '(trống)'
  if (field === 'pdId' || field === 'baId') return userName(v) || v
  if (field === 'expectedDate' || field === 'completedDate') return formatDate(v)
  if (field === 'ratingReason' || field === 'content') return String(v).length > 80 ? String(v).slice(0, 80) + '…' : v
  return String(v)
}

</script>

<style scoped>
.history { display: flex; flex-direction: column; gap: 16px; }
.history__empty { font-size: var(--text-body); color: var(--text-secondary); }
.history__item { display: flex; gap: 12px; }
.history__avatar {
  width: 32px; height: 32px; border-radius: var(--radius-pill); flex-shrink: 0;
  box-sizing: border-box; border: 1px solid var(--stroke-neutral-light);
  display: flex; align-items: center; justify-content: center;
  font-size: var(--text-sm); font-weight: var(--fw-semibold);
}
.history__body { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.history__head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; font-size: var(--text-body); line-height: var(--text-body-lh); }
.history__who  { font-weight: var(--fw-semibold); color: var(--text-primary); }
.history__what { color: var(--text-primary); }
.history__time { margin-left: auto; font-size: var(--text-body); color: var(--text-secondary); white-space: nowrap; }
.history__changes {
  list-style: none; margin: 0; padding: 8px 12px;
  display: flex; flex-direction: column; gap: 4px;
  border-radius: var(--radius-default); background: var(--bg-neutral-light);
}
.history__changes li { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; font-size: var(--text-body); line-height: var(--text-body-lh); }
.history__field { color: var(--text-secondary); }
.history__from  { color: var(--text-secondary); text-decoration: line-through; }
.history__to    { color: var(--text-primary); font-weight: var(--fw-medium); }
.history__arrow { color: var(--icon-neutral); }
.history__score .history__field { color: var(--text-primary); font-weight: var(--fw-semibold); }
.history__score .history__to { color: var(--text-brand); font-weight: var(--fw-semibold); }
</style>
