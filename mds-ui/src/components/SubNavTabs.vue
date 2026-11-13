<template>
  <!-- Tab hàng sub-nav: hiện số tab vừa chỗ, phần tràn gom vào "Xem thêm (n)" — tab đang chọn luôn hiện -->
  <div ref="wrapEl" class="sub-nav__scroll sntabs">
    <button v-for="t in shown" :key="t.id" type="button" class="sub-nav-tab" :class="{ active: t.id === modelValue }" @click="select(t.id)">
      <slot name="tab" :item="t">{{ t.label }}</slot>
    </button>
    <DropdownMenu v-if="hidden.length" :items="hidden.map(t => ({ id: t.id, label: t.label, tag: t.tag }))" :active-id="modelValue"
      placement="bottom-start" :min-width="200" @select="it => select(it.id)">
      <template #trigger="{ toggle }">
        <button type="button" class="sub-nav-tab sntabs__more" @click.stop="toggle">
          Xem thêm ({{ hidden.length }})<TIcon name="chevron-down" />
        </button>
      </template>
    </DropdownMenu>

    <!-- Hàng đo độ rộng (ẩn): đo từng tab + nút "Xem thêm" để tính số tab vừa chỗ -->
    <div ref="measureEl" class="sntabs__measure" aria-hidden="true">
      <span v-for="t in items" :key="t.id" class="sub-nav-tab active"><slot name="tab" :item="t">{{ t.label }}</slot></span>
      <span class="sub-nav-tab sntabs__more">Xem thêm ({{ items.length }})<TIcon name="chevron-down" /></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import TIcon from './TIcon.vue'
import DropdownMenu from './DropdownMenu.vue'

/* items: [{ id, label, tag? }] — thứ tự hiển thị (VD vòng lặp mới nhất trước). v-model = id tab đang chọn. */
const props = defineProps({
  items:      { type: Array, default: () => [] },
  modelValue: { type: [String, Number], default: null },
})
const emit = defineEmits(['update:modelValue', 'select'])
function select(id) { emit('update:modelValue', id); emit('select', id) }

const wrapEl = ref(null), measureEl = ref(null)
const fit = ref(Infinity)   // số tab hiện được trên thanh
function layout() {
  const wrap = wrapEl.value, meas = measureEl.value
  if (!wrap || !meas) return
  const ws = [...meas.children].map(el => el.getBoundingClientRect().width)
  const more = ws.pop(), avail = wrap.clientWidth
  const total = ws.reduce((a, b) => a + b, 0)
  if (total <= avail) { fit.value = Infinity; return }
  let used = more, n = 0
  while (n < ws.length && used + ws[n] <= avail) used += ws[n++]
  fit.value = Math.max(1, n)
}
/* Tab hiện: n tab đầu; tab đang chọn nằm trong phần tràn → thay vào vị trí cuối */
const shown = computed(() => {
  if (fit.value >= props.items.length) return props.items
  const head = props.items.slice(0, fit.value)
  const active = props.items.find(t => t.id === props.modelValue)
  return active && !head.includes(active) ? [...head.slice(0, -1), active] : head
})
const hidden = computed(() => props.items.filter(t => !shown.value.includes(t)))

let ro = null
onMounted(() => { ro = new ResizeObserver(() => layout()); ro.observe(wrapEl.value); nextTick(layout) })
onBeforeUnmount(() => ro?.disconnect())
watch(() => props.items.map(t => t.id + t.label).join('|'), () => nextTick(layout))
</script>

<style scoped>
.sntabs { position: relative; overflow: hidden; }
.sntabs__more { color: var(--text-secondary); gap: 4px; }
.sntabs__more .ti { font-size: 14px; }
.sntabs__measure { position: absolute; left: 0; top: 0; visibility: hidden; pointer-events: none; display: flex; white-space: nowrap; }
</style>
