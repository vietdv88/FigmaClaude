<template>
  <button
    class="cep"
    :class="[`cep--${pos}`, bgColor === 'White' && 'cep--white']"
    v-tip="type === 'Collapse' ? 'Thu gọn' : 'Mở rộng'" :aria-label="type === 'Collapse' ? 'Thu gọn' : 'Mở rộng'"
    @click="$emit('click')"
  >
    <TIcon :name="iconName" class="cep__icon" />
  </button>
</template>

<script setup>
import { vTip } from '../utils/tooltip.js'
import { computed } from 'vue'
import TIcon from './TIcon.vue'

const props = defineProps({
  type:    { type: String, default: 'Expand'  }, // 'Expand' | 'Collapse'
  position:{ type: String, default: 'Bottom'  }, // 'Top' | 'Bottom' | 'Left' | 'Right'
  bgColor: { type: String, default: 'Gray'    }, // 'Gray' | 'White'
})

defineEmits(['click'])

const pos = computed(() => props.position.toLowerCase())

const iconName = computed(() => {
  const { type, position } = props
  if (position === 'Bottom') return type === 'Collapse' ? 'chevron-up'   : 'chevron-down'
  if (position === 'Top')    return type === 'Collapse' ? 'chevron-down' : 'chevron-up'
  if (position === 'Left')   return type === 'Collapse' ? 'chevron-right': 'chevron-left'
  /* Right */                return type === 'Collapse' ? 'chevron-left' : 'chevron-right'
})
</script>

<style scoped>
.cep {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-neutral-light);
  border: 1px solid var(--stroke-neutral-light);
  cursor: pointer;
  flex-shrink: 0;
  color: var(--icon-neutral);
  transition: background 0.12s;
  position: relative;
  z-index: 1;
}
.cep:hover { background: var(--bg-brand-light); }

.cep--white       { background: var(--bg-white); }
.cep--white:hover { background: var(--bg-brand-light); }

/* Bottom: hangs from top divider line, rounded top corners */
.cep--bottom {
  width: 40px; height: 16px;
  border-top-left-radius: 4px; border-top-right-radius: 4px;
  border-bottom: none;
}
/* Top: hangs from bottom divider line, rounded bottom corners */
.cep--top {
  width: 40px; height: 16px;
  border-bottom-left-radius: 4px; border-bottom-right-radius: 4px;
  border-top: none;
}
/* Left: vertical, rounded right corners */
.cep--left {
  width: 16px; height: 40px;
  border-top-right-radius: 4px; border-bottom-right-radius: 4px;
  border-left: none;
}
/* Right: vertical, rounded left corners */
.cep--right {
  width: 16px; height: 40px;
  border-top-left-radius: 4px; border-bottom-left-radius: 4px;
  border-right: none;
}

.cep__icon { font-size: var(--text-body); }
</style>
