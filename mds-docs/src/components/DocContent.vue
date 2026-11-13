<template>
  <div ref="rootEl" class="ds-prose" @click="onClick">
    <template v-for="(b, i) in doc.blocks" :key="i">
      <div v-if="b.kind === 'html'" v-html="b.html" />
      <AppInlineAlert v-else-if="b.kind === 'callout'" :type="b.type" :title="b.title" class="ds-callout"><div v-html="b.html" /></AppInlineAlert>
      <div v-else-if="b.kind === 'dodont'" class="ds-dodont" :class="{ 'ds-dodont--pair': b.items.length > 1 }">
        <figure v-for="(it, j) in b.items" :key="j" class="ds-dodont__card" :class="'ds-dodont__card--' + it.type">
          <figcaption class="ds-dodont__badge"><TIcon :name="it.type === 'do' ? 'check' : 'x'" />{{ it.type === 'do' ? 'Nên' : 'Không nên' }}</figcaption>
          <div class="ds-dodont__body" v-html="it.html" />
        </figure>
      </div>
      <DemoBlock v-else-if="b.kind === 'demo'" :name="b.name" />
      <DocChecklist v-else-if="b.kind === 'checklist'" :id="b.id" :title="b.title" :items="b.items" />
    </template>
    <Teleport to="body">
      <div v-if="zoom" class="ds-lightbox" role="dialog" aria-label="Xem ảnh" @click="zoom = ''">
        <img :src="zoom" alt="" />
        <button type="button" class="btn-icon ds-lightbox__close" aria-label="Đóng" @click.stop="zoom = ''"><TIcon name="x" /></button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppInlineAlert from '@mds/components/AppInlineAlert.vue'
import TIcon from '@mds/components/TIcon.vue'
import { useEscClose } from '@mds/utils/escStack.js'
import DemoBlock from './DemoBlock.vue'
import DocChecklist from './DocChecklist.vue'
import { renderDoc } from '../md.js'

const props = defineProps({ md: { type: String, default: '' } })
const emit = defineEmits(['headings'])
const router = useRouter()
const rootEl = ref(null), zoom = ref('')
const doc = computed(() => renderDoc(props.md))
watch(doc, d => emit('headings', d.headings), { immediate: true })
useEscClose(() => { zoom.value = '' }, () => !!zoom.value)

// Link nội bộ (/ds/…) → chuyển trang trong app, không tải lại · bấm ảnh → phóng to
function onClick(e) {
  const img = e.target.closest('img.ds-img')
  if (img && !e.target.closest('a')) { zoom.value = img.currentSrc || img.src; return }
  const a = e.target.closest('a[href]')
  if (!a || e.ctrlKey || e.metaKey || e.shiftKey || a.target === '_blank') return
  const href = a.getAttribute('href')
  if (href.startsWith('#')) { e.preventDefault(); router.push({ hash: href }); return }
  const m = href.match(/^\/ds(\/[^#?]*)?(#.*)?$/)
  if (m) { e.preventDefault(); router.push((m[1] || '/') + (m[2] || '')) }
}
</script>
