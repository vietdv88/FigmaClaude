<template>
  <!-- Đánh giá nội dung trang: 1–5 sao · dưới 5 sao → popover nhập lý do / góp ý → gửi về Quản trị › Đánh giá nội dung -->
  <section class="ds-rate" aria-label="Đánh giá nội dung trang">
    <div class="ds-rate__row">
      <span class="ds-rate__q">Nội dung trang này có dễ hiểu không?</span>
      <div ref="starsEl" class="ds-rate__stars" role="radiogroup" aria-label="Chấm điểm từ 1 đến 5 sao" @mouseleave="hover = 0">
        <button v-for="n in 5" :key="n" type="button" class="ds-rate__star" :class="{ 'ds-rate__star--on': n <= (hover || stars) }"
          role="radio" :aria-checked="stars === n" :aria-label="`${n} sao — ${LABELS[n - 1]}`" v-tip="LABELS[n - 1]"
          @mouseenter="hover = n" @click="pick(n)"><TIcon :name="n <= (hover || stars) ? 'star-filled' : 'star'" /></button>
      </div>
      <span v-if="hover || stars" class="ds-muted">{{ LABELS[(hover || stars) - 1] }}</span>
    </div>
    <p v-if="done" class="ds-rate__thanks"><TIcon name="circle-check" />{{ stars === 5 ? 'Cảm ơn bạn đã đánh giá!' : 'Cảm ơn góp ý của bạn — ban biên tập sẽ xem và chỉnh sửa cho dễ hiểu hơn.' }}</p>

    <!-- Popover góp ý (popover dạng thẻ: bo 12, bóng popover, đệm 16) -->
    <div v-if="askOpen" ref="popEl" class="ds-rate__pop" role="dialog" aria-label="Góp ý cho trang">
      <div class="ds-rate__pop-title">Điều gì khiến nội dung chưa dễ hiểu?</div>
      <span class="ds-muted">Nhập lý do / góp ý để gửi đánh giá {{ stars }} sao — ban biên tập sẽ dựa vào đây để chỉnh trang.</span>
      <AppTextarea ref="taEl" v-model="comment" :min-height="96" :maxlength="2000" autosize placeholder="VD: phần Padding / Gap khó hình dung, nên có thêm ví dụ…" />
      <div class="ds-rate__pop-foot">
        <button type="button" class="btn btn--outline btn--neutral" @click="skip">Hủy</button>
        <button type="button" class="btn btn--primary" :disabled="saving || !comment.trim()" @click="send">Gửi đánh giá</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import AppTextarea from '@mds/components/AppTextarea.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'
import { api } from '../store.js'

const props = defineProps({ slug: { type: String, required: true } })
const LABELS = ['Rất khó hiểu', 'Khó hiểu', 'Tạm được', 'Dễ hiểu', 'Rất dễ hiểu']
const stars = ref(0), hover = ref(0), comment = ref(''), askOpen = ref(false), done = ref(false), saving = ref(false)
let saved = 0   // số sao đã lưu trên máy chủ — chọn < 5 sao rồi bỏ qua thì quay về giá trị này
const popEl = ref(null), starsEl = ref(null), taEl = ref(null)

// Đổi trang → lấy lại đánh giá của chính mình cho trang đó (đã chấm thì hiện lại số sao)
watch(() => props.slug, async slug => {
  stars.value = 0; saved = 0; comment.value = ''; askOpen.value = false; done.value = false
  try { const { rating } = await api(`/ratings/mine/${slug}`); if (rating && slug === props.slug) { stars.value = saved = rating.stars; comment.value = rating.comment || '' } } catch { /* chưa có */ }
}, { immediate: true })

async function save() {
  saving.value = true
  try { await api('/ratings', { method: 'POST', body: { slug: props.slug, stars: stars.value, comment: stars.value < 5 ? comment.value.trim() : '' } }); saved = stars.value; done.value = true }
  catch (e) { toast.error(e.message || 'Chưa gửi được đánh giá') }
  finally { saving.value = false }
}
async function pick(n) {
  stars.value = n; done.value = false
  if (n === 5) { askOpen.value = false; return save() }
  // Dưới 5 sao: BẮT BUỘC nhập lý do mới tính là đánh giá — chưa lưu cho tới khi bấm Gửi
  askOpen.value = true; await nextTick(); taEl.value?.$el?.querySelector?.('textarea')?.focus()
}
async function send() { if (!comment.value.trim()) return; await save(); if (done.value) askOpen.value = false }
function skip() { askOpen.value = false; stars.value = saved; done.value = false }   // không nhập lý do → không tính đánh giá, trả về số sao đã lưu (nếu có)
function onOutside(e) { if (askOpen.value && !popEl.value?.contains(e.target) && !starsEl.value?.contains(e.target)) skip() }
function onKey(e) { if (askOpen.value && e.key === 'Escape') { e.stopPropagation(); skip() } }
watch(askOpen, o => {
  if (o) { document.addEventListener('mousedown', onOutside, true); document.addEventListener('keydown', onKey, true) }
  else { document.removeEventListener('mousedown', onOutside, true); document.removeEventListener('keydown', onKey, true) }
})
onBeforeUnmount(() => { document.removeEventListener('mousedown', onOutside, true); document.removeEventListener('keydown', onKey, true) })
</script>

<style scoped>
.ds-rate { position: relative; display: flex; flex-direction: column; gap: 8px; padding: 16px; border-radius: var(--radius-card); background: var(--bg-neutral-light); }   /* nền màu (không bóng) — khối nằm trên nền trắng của trang */
.ds-rate__row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.ds-rate__q { font-weight: var(--fw-semibold); color: var(--text-primary); }
.ds-rate__stars { display: inline-flex; gap: 4px; }
.ds-rate__star { display: inline-flex; align-items: center; justify-content: center; width: var(--btn-height); height: var(--btn-height); padding: 0; border: none; border-radius: var(--radius-default); background: transparent; color: var(--icon-neutral); font-size: 24px; cursor: pointer; }
.ds-rate__star:hover { background: var(--bg-neutral-hover); }
.ds-rate__star--on { color: var(--icon-warning); }
.ds-rate__thanks { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--text-success); }
.ds-rate__thanks .ti { color: var(--icon-success); font-size: 16px; }
.ds-rate__pop { position: absolute; z-index: 20; left: 16px; top: calc(100% - 8px); width: min(420px, calc(100% - 32px)); display: flex; flex-direction: column; gap: 12px; padding: 16px; border-radius: var(--radius-dialog); background: var(--bg-white); box-shadow: var(--shadow-popover); }
.ds-rate__pop-title { font-size: var(--text-h3); line-height: var(--text-h3-lh); font-weight: var(--fw-semibold); }
.ds-rate__pop-foot { display: flex; justify-content: flex-end; gap: var(--gap-control); }
</style>
