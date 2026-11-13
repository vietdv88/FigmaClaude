<template>
  <!-- Thanh “Tiện ích” — quảng cáo / liên kết bán chéo trên màn TỔNG QUAN (quy chuẩn /ds/advertising-cross-selling)
       Bố cục theo bản mô tả (Figma Mô tả quy chuẩn 1250:79938 / 1250:81419); màu + thông số theo token mds-ui (không chép số Figma):
       · Thu gọn: 1 hàng — icon nhóm + tiêu đề / dòng phụ · vạch ngăn · các mục (icon nền nhạt + tên) vừa 1 hàng, mục không đủ chỗ ẩn vào “Xem thêm ⌄”
       · Mở rộng: vùng lưới các mục TRƯỢT XUỐNG (đẩy nội dung bên dưới), “Thu gọn ⌃” — mở lại trang luôn về trạng thái thu gọn -->
  <section class="xsell surface" :class="{ 'xsell--open': open }" :aria-label="title">
    <div class="xsell__row">
      <div class="xsell__head">
        <span class="kpi-icon xsell__badge" :class="`kpi-icon--${tone}`"><TIcon :name="icon" /></span>
        <span class="xsell__titles">
          <span class="xsell__title">{{ title }}</span>
          <span v-if="subtitle" class="xsell__sub">{{ subtitle }}</span>
        </span>
      </div>
      <span class="xsell__divider" aria-hidden="true" />
      <!-- Hàng mục khi thu gọn: wrap + cao đúng 1 hàng + ẩn phần tràn → mục không đủ chỗ tự ẩn trọn vẹn (không bị cắt nửa) -->
      <ul ref="rowEl" class="xsell__inline" :aria-hidden="open ? 'true' : undefined">
        <li v-for="it in items" :key="it.id">
          <button type="button" class="xsell__chip" :tabindex="open ? -1 : undefined" @click="emit('select', it)">
            <span class="xsell__ic" :class="`xsell__ic--${it.tone || 'brand'}`"><TIcon :name="it.icon" /></span>
            <span class="xsell__name">{{ it.label }}</span>
          </button>
        </li>
      </ul>
      <button v-if="open || hidden > 0" type="button" class="btn btn--text xsell__toggle" :aria-expanded="open" :aria-controls="gridId" @click="toggle">
        {{ open ? 'Thu gọn' : 'Xem thêm' }}<TIcon :name="open ? 'chevron-up' : 'chevron-down'" />
      </button>
    </div>
    <!-- Mở rộng: lưới thẻ mục — trượt xuống bằng grid-template-rows 0fr → 1fr (cao theo nội dung, không giật) -->
    <div :id="gridId" class="xsell__more" :inert="!open || undefined">
      <div class="xsell__more-in">
        <ul class="xsell__grid">
          <li v-for="it in items" :key="it.id">
            <button type="button" class="xsell__card" @click="emit('select', it)">
              <span class="xsell__ic" :class="`xsell__ic--${it.tone || 'brand'}`"><TIcon :name="it.icon" /></span>
              <span class="xsell__name xsell__name--wrap">{{ it.label }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import TIcon from './TIcon.vue'

const props = defineProps({
  title:    { type: String, default: 'Tiện ích' },
  subtitle: { type: String, default: 'Ưu đãi MISA' },
  icon:     { type: String, default: 'speakerphone' },
  /** màu icon nhóm (.kpi-icon--*): warning | brand | success | info | danger | purple | pink */
  tone:     { type: String, default: 'warning' },
  /** [{ id, label, icon (TIcon), tone?: brand | success | info | warning | danger | purple | pink, href? }] */
  items:    { type: Array,  default: () => [] },
})
const emit = defineEmits(['select', 'toggle'])
const open = ref(false), rowEl = ref(null), hidden = ref(0)
const gridId = 'xsell-' + Math.random().toString(36).slice(2, 8)
function toggle() { open.value = !open.value; emit('toggle', open.value) }
/* Đếm mục bị ẩn ở hàng thu gọn (rơi xuống dòng 2 của danh sách wrap) → có mục ẩn mới hiện “Xem thêm” */
function measure() {
  const ul = rowEl.value; if (!ul) return
  const top = ul.firstElementChild?.offsetTop ?? 0
  hidden.value = [...ul.children].filter(li => li.offsetTop > top + 2).length
}
let ro
onMounted(async () => { await nextTick(); measure(); ro = new ResizeObserver(measure); rowEl.value && ro.observe(rowEl.value) })
onBeforeUnmount(() => ro?.disconnect())
watch(() => props.items, () => nextTick(measure))
</script>
