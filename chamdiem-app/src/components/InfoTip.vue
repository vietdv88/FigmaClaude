<template>
  <span ref="el" class="info-tip" tabindex="0" @mouseenter="show" @mouseleave="hide" @focus="show" @blur="hide">
    <TIcon name="info-circle" />
  </span>
  <Teleport to="body">
    <div v-if="open" class="info-tip__pop" :style="pos" role="tooltip">
      <p v-if="text" class="info-tip__text">{{ text }}</p>
      <ul v-if="items.length" class="info-tip__list"><li v-for="(it, i) in items" :key="i">{{ it }}</li></ul>
      <p v-if="note" class="info-tip__note">{{ note }}</p>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import TIcon from '@mds/components/TIcon.vue'

defineProps({
  text:  { type: String, default: '' },
  items: { type: Array,  default: () => [] },
  note:  { type: String, default: '' },
})

const el = ref(null)
const open = ref(false)
const pos = ref({})
const WIDTH = 320
function show() {
  const r = el.value.getBoundingClientRect()
  const left = Math.min(Math.max(8, r.left + r.width / 2 - WIDTH / 2), window.innerWidth - WIDTH - 8)
  // Mặc định hiện bên dưới; sát đáy màn hình thì lật lên trên
  const below = r.bottom + 6
  pos.value = window.innerHeight - below < 160
    ? { left: left + 'px', bottom: (window.innerHeight - r.top + 6) + 'px', width: WIDTH + 'px' }
    : { left: left + 'px', top: below + 'px', width: WIDTH + 'px' }
  open.value = true
}
function hide() { open.value = false }
</script>

<style scoped>
.info-tip {
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--icon-neutral); cursor: help; outline: none;
  font-size: 14px; line-height: 0;
}
.info-tip:hover, .info-tip:focus-visible { color: var(--icon-brand); }
.info-tip__pop {
  position: fixed; z-index: 9800;
  padding: 8px 12px; border-radius: var(--radius-dialog);
  background: var(--neutral-800); color: var(--text-white);
  box-shadow: var(--shadow-popover);
  font-size: var(--text-body); line-height: var(--text-body-lh);
  display: flex; flex-direction: column; gap: 4px;
  pointer-events: none;
}
.info-tip__list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 2px; }
.info-tip__note { color: var(--neutral-300); }
</style>
