<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-muted">Chiều cao:</span>
      <div class="seg" role="group" aria-label="Chiều cao ô">
        <button v-for="h in HEIGHTS" :key="h.id" type="button" class="seg__item" :class="{ 'seg__item--active': height === h.id }" :aria-pressed="height === h.id" @click="height = h.id">{{ h.label }}</button>
      </div>
    </div>
    <span class="demo-muted">{{ HEIGHTS.find(h => h.id === height).hint }}</span>

    <div class="demo-grid">
      <AppInput label="Mặc định (chưa nhập)">
        <AppTextarea v-model="empty" placeholder="Nhập mô tả" v-bind="mode" />
      </AppInput>
      <AppInput label="Đã nhập">
        <AppTextarea v-model="note" placeholder="Nhập mô tả" v-bind="mode" />
      </AppInput>
      <AppInput label="Chỉ đọc">
        <AppTextarea :model-value="note" readonly v-bind="mode" />
      </AppInput>
      <AppInput label="Khóa (không dùng được)">
        <AppTextarea model-value="" placeholder="Nhập mô tả" disabled v-bind="mode" />
      </AppInput>
      <AppInput label="Lỗi — bắt buộc nhập" required :message="reason.trim() ? '' : 'Nhập lý do'">
        <AppTextarea v-model="reason" placeholder="Nhập lý do" v-bind="mode" />
      </AppInput>
      <AppInput label="Giới hạn ký tự">
        <AppTextarea v-model="limit" placeholder="Tối đa 200 ký tự" :maxlength="200" v-bind="mode" />
        <span class="demo-ta-count">{{ limit.length }}/200</span>
      </AppInput>
    </div>

    <!-- Edit Mode = False: màn xem — chỉ hiện chữ, xuống dòng giữ nguyên như khi nhập -->
    <p class="demo-label">Chế độ xem (không sửa)</p>
    <div class="demo-ta-view"><span class="demo-muted">Mô tả</span><p class="demo-ta-view__value">{{ note }}</p></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppInput from '@mds/components/AppInput.vue'
import AppTextarea from '@mds/components/AppTextarea.vue'

const HEIGHTS = [
  { id: 'drag', label: 'Kéo giãn (mặc định)', hint: 'Fix Height = False: cao 72px, có góc kéo ở dưới bên phải — đưa chuột kéo xuống để ô cao thêm, xem được nhiều dòng hơn; nội dung dài hơn ô thì cuộn.' },
  { id: 'fix', label: 'Cố định chiều cao (Fix Height)', hint: 'Fix Height = True: cao cố định 72px, KHÔNG có góc kéo; nội dung dài thì cuộn trong ô.' },
  { id: 'auto', label: 'Tự giãn theo nội dung', hint: 'Gõ tới đâu ô cao tới đó, không giới hạn và không có thanh cuộn; không có góc kéo.' },
]
const height = ref('drag')
const mode = computed(() => ({ drag: {}, fix: { fixHeight: true }, auto: { autosize: true } }[height.value]))
const empty = ref('')
const note = ref('Khách hàng cần giao hàng trong giờ hành chính.\nLiên hệ anh Bình (0984 123 456) trước khi giao.')
const reason = ref('')
const limit = ref('')
</script>

<style scoped>
.demo-ta-count { align-self: flex-end; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.demo-ta-view { display: flex; flex-direction: column; gap: var(--input-label-gap, 4px); max-width: 480px; }
.demo-ta-view__value { margin: 0; white-space: pre-line; font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); }
</style>
