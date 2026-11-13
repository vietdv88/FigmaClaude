<template>
  <nav v-if="items.length > 1" class="ds-toc" aria-label="Trên trang này">
    <div class="ds-toc__title">Trên trang này</div>
    <a v-for="h in items" :key="h.id" :href="'#' + h.id" class="ds-toc__item" :class="['ds-toc__item--l' + h.level, { 'ds-toc__item--on': h.id === active }]"
      @click.prevent="go(h.id)">{{ h.text }}</a>
  </nav>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({ headings: { type: Array, default: () => [] }, scroller: { type: Object, default: null } })
const active = ref('')
// Mục lục: cấp 2 + cấp 3 (trang chỉ có cấp 3/4 → lấy 2 cấp đầu có mặt)
const items = computed(() => {
  const levels = [...new Set(props.headings.map(h => h.level))].sort().slice(0, 2)
  return props.headings.filter(h => levels.includes(h.level)).map(h => ({ ...h, level: levels.indexOf(h.level) + 2 }))
})
/* Bấm mục → cuộn tới tiêu đề, tiêu đề dừng cách mép trên vùng đọc OFFSET px.
   Ảnh / ví dụ phía trên có thể đổi chiều cao trong lúc cuộn (tải xong ảnh, dựng xong demo) → tự bám lại đúng tiêu đề
   cho tới khi ổn định; người dùng tự cuộn (lăn chuột, chạm, phím) thì thôi bám. */
const OFFSET = 16
const settleOnEnd = () => settle()
let lockUntil = 0, picked = '', ro = null, snapTimer = null, quietFn = null
const targetTop = (sc, h) => Math.round(sc.scrollTop + h.getBoundingClientRect().top - sc.getBoundingClientRect().top - OFFSET)
function stopSnap() {
  ro?.disconnect(); ro = null; clearTimeout(snapTimer)
  for (const e of ['wheel', 'touchstart', 'keydown', 'pointerdown']) el?.removeEventListener(e, stopSnap)
  el?.removeEventListener('scrollend', settleOnEnd); if (quietFn) { el?.removeEventListener('scrollend', quietFn); el?.removeEventListener('scroll', quietFn) }
}
/* Chỉnh nốt (không mượt) khi lệch đích. Gọi lúc đoạn cuộn mượt còn chạy thì trình duyệt có thể cộng dồn quãng còn lại
   (VD đích 21324 → dừng 21545) → kiểm tra lại vài khung hình kế tiếp cho tới khi đúng đích. */
function settle(tries = 4) {
  const h = document.getElementById(picked); if (!h || !el || tries <= 0) return
  if (Math.abs(targetTop(el, h) - el.scrollTop) > 1) { el.scrollTo({ top: targetTop(el, h), behavior: 'instant' }); requestAnimationFrame(() => settle(tries - 1)) }
}
/* Ảnh trong bài tải chậm (loading="lazy", chưa biết kích thước) → cuộn tới đâu ảnh mới tải và làm trang dài ra:
   ảnh phía trên xô tiêu đề đích xuống, ảnh phía dưới chưa tải thì trang chưa đủ dài để tiêu đề lên tới đầu (bị chặn ở đáy).
   Trước khi cuộn: tải luôn mọi ảnh chưa tải của trang (chờ tối đa 1,5 giây), phần còn lại do ResizeObserver bám tiếp. */
function preloadImages(sc) {
  const imgs = [...sc.querySelectorAll('img')].filter(i => !i.complete)
  if (!imgs.length) return Promise.resolve()
  imgs.forEach(i => { i.loading = 'eager' })
  const done = Promise.all(imgs.map(i => new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }) })))
  return Promise.race([done, new Promise(r => setTimeout(r, 1500))])
}
async function go(id) {
  const h = document.getElementById(id), sc = props.scroller || el
  // Ghi #mục lên đường dẫn KHÔNG qua router (router.replace sẽ chạy scrollBehavior cuộn chồng lên cuộn của mục lục → lệch đích)
  history.replaceState(history.state, '', '#' + id); active.value = picked = id
  if (!h || !sc) return
  stopSnap()
  const giveUp = Date.now() + 6000
  lockUntil = giveUp
  await preloadImages(sc)
  if (picked !== id) return   // trong lúc chờ ảnh đã bấm mục khác
  // Dừng bám khi nội dung đã đứng yên 0,7 giây (trang dài: ví dụ / ảnh phía trên tải dần trong lúc cuộn) — tối đa 6 giây
  const finish = () => { settle(); stopSnap(); lockUntil = Date.now() + 200 }
  const quiet = () => { clearTimeout(snapTimer); snapTimer = setTimeout(finish, 700) }
  sc.scrollTo({ top: targetTop(sc, h), behavior: 'smooth' })
  ro = new ResizeObserver(() => {
    if (Date.now() > giveUp) return finish()
    sc.scrollTo({ top: targetTop(sc, h), behavior: 'smooth' }); quiet()   // nội dung đổi chiều cao → đổi đích cuộn theo
  })
  ro.observe(sc.querySelector('.ds-prose') || sc.firstElementChild || sc)   // khối nội dung bài (ảnh / ví dụ đổi chiều cao ở đây)
  sc.addEventListener('scrollend', settleOnEnd)
  quietFn = quiet; sc.addEventListener('scrollend', quiet); sc.addEventListener('scroll', quiet, { passive: true })   // còn đang cuộn → chưa kết thúc
  for (const e of ['wheel', 'touchstart', 'keydown', 'pointerdown']) sc.addEventListener(e, stopSnap, { passive: true })
  quiet()
}

// Mục đang đọc = tiêu đề cuối cùng đã cuộn qua mép trên · cuộn chạm đáy trang (mục cuối không lên được đầu) → giữ mục vừa bấm
let el = null
function spy() {
  if (Date.now() < lockUntil) return
  if (el && picked && el.scrollTop + el.clientHeight >= el.scrollHeight - 2) { active.value = picked; return }
  picked = ''
  const top = (el?.getBoundingClientRect().top ?? 0) + OFFSET + 40
  let cur = items.value[0]?.id || ''
  for (const h of items.value) { const n = document.getElementById(h.id); if (n && n.getBoundingClientRect().top <= top) cur = h.id }
  active.value = cur
}
watch(() => [props.scroller, items.value], async () => {
  el?.removeEventListener('scroll', spy); el = props.scroller
  el?.addEventListener('scroll', spy, { passive: true })
  await nextTick(); spy()
}, { immediate: true })
onBeforeUnmount(() => { stopSnap(); el?.removeEventListener('scroll', spy) })
</script>
