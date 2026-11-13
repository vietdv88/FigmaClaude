<template>
  <div class="demo-stack">
    <div class="demo-row">
      <span class="demo-muted">Kiểu:</span>
      <div class="seg" role="group" aria-label="Kiểu trình soạn thảo">
        <button v-for="m in MODES" :key="m.id" type="button" class="seg__item" :class="{ 'seg__item--active': kind === m.id }" :aria-pressed="kind === m.id" @click="kind = m.id">{{ m.label }}</button>
      </div>
      <span class="demo-muted">Trạng thái:</span>
      <div class="seg" role="group" aria-label="Trạng thái">
        <button v-for="s in STATES" :key="s.id" type="button" class="seg__item" :class="{ 'seg__item--active': state === s.id }" :aria-pressed="state === s.id" @click="state = s.id">{{ s.label }}</button>
      </div>
    </div>
    <span class="demo-muted">{{ MODES.find(m => m.id === kind).hint }}</span>

    <AppInput label="Mô tả sản phẩm" :required="state === 'error'" :message="state === 'error' ? 'Nhập mô tả sản phẩm' : ''">
      <AppRichText :key="kind + state" v-model="html" :mode="kind === 'inline' ? 'inline' : 'basic'" :toolbar="kind === 'inline' ? 'simple' : kind"
        :height="kind === 'classic' ? 360 : 240" :state="state === 'readonly' ? 'readonly' : state === 'error' ? 'error' : 'default'" placeholder="Nhập nội dung…" />
    </AppInput>

    <details class="demo-rt-html">
      <summary>Xem HTML lưu xuống ({{ html.length }} ký tự)</summary>
      <pre>{{ html }}</pre>
    </details>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppInput from '@mds/components/AppInput.vue'
import AppRichText from '@mds/components/AppRichText.vue'

const MODES = [
  { id: 'simple', label: 'Đơn giản', hint: 'Figma RichText: hoàn tác, đậm / nghiêng / gạch chân, màu chữ, căn lề, danh sách, thụt lề, liên kết, ảnh. Kéo góc dưới phải để đổi chiều cao.' },
  { id: 'full', label: 'Đầy đủ', hint: 'Thêm kiểu đoạn, phông, cỡ chữ, màu nền chữ, gạch ngang, giãn dòng, bảng. Khung hẹp → nút ⋯ mở thêm hàng.' },
  { id: 'classic', label: 'Classic (có menu)', hint: 'Như demo Classic của TinyMCE: thanh menu Tệp / Sửa / Xem / Chèn / Định dạng / Công cụ / Bảng, đếm chữ, xem trước, toàn màn hình, mã HTML.' },
  { id: 'inline', label: 'Inline', hint: 'Không khung: bấm vào vùng nội dung thì thanh công cụ nổi lên phía trên — dùng khi sửa ngay tại chỗ (mô tả, ghi chú).' },
]
const STATES = [{ id: 'default', label: 'Bình thường' }, { id: 'readonly', label: 'Chỉ đọc' }, { id: 'error', label: 'Lỗi' }]
const kind = ref('simple'), state = ref('default')
const html = ref('<p><strong>Máy lọc nước RO 10 lõi</strong> — lọc sạch 99,9% vi khuẩn, giữ khoáng chất tự nhiên.</p><ul><li>Công suất 15 lít/giờ</li><li>Bảo hành 36 tháng</li></ul>')
</script>

<style scoped>
.demo-rt-html summary { cursor: pointer; color: var(--text-link); }
.demo-rt-html pre { margin: 8px 0 0; padding: 12px; max-height: 200px; overflow: auto; border-radius: var(--radius-default); background: var(--bg-neutral-light); white-space: pre-wrap; word-break: break-word; font-size: var(--text-body); }
</style>
