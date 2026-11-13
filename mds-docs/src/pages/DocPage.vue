<template>
  <div class="ds-page">
    <article class="ds-article">
      <template v-if="page">
        <div class="ds-crumb">{{ page.group }}</div>
        <div class="ds-article__head">
          <h1 class="ds-article__title">{{ page.title }}</h1>
          <div class="ds-article__actions">
            <button v-if="state.me.aiEnabled" type="button" class="btn btn--ai-outline" @click="askAva('')"><TIcon name="sparkles" />Hỏi AVA</button>
            <RouterLink v-if="state.me.canEdit" :to="'/quan-tri/' + page.slug" class="btn btn--outline btn--neutral"><TIcon name="pencil" />Sửa trang</RouterLink>
          </div>
        </div>
        <div v-if="page.summary" class="ds-article__lead ds-prose" v-html="summaryHtml" @click="onLeadClick" />
        <DocContent :md="page.body" @headings="headings = $event" />
        <PageRating :slug="page.slug" />
        <footer class="ds-article__foot">
          <span class="ds-muted">Cập nhật {{ fmtDate(page.updatedAt) }}<template v-if="page.updatedBy"> · {{ page.updatedBy }}</template></span>
          <nav class="ds-pager">
            <RouterLink v-if="prev" :to="'/' + prev.slug" class="ds-pager__link"><span class="ds-muted"><TIcon name="chevron-left" />Trang trước</span>{{ prev.title }}</RouterLink>
            <RouterLink v-if="next" :to="'/' + next.slug" class="ds-pager__link ds-pager__link--next"><span class="ds-muted">Trang sau<TIcon name="chevron-right" /></span>{{ next.title }}</RouterLink>
          </nav>
        </footer>
      </template>
      <div v-else-if="missing" class="ds-empty">
        <h1 class="ds-article__title">Không tìm thấy trang</h1>
        <p class="ds-muted">Trang “{{ route.params.slug }}” không tồn tại hoặc đã bị xóa.</p>
        <RouterLink to="/" class="btn btn--primary">Về trang tổng quan</RouterLink>
      </div>
      <div v-else class="ds-loading"><i /><i /><i /><i class="ds-loading__img" /><i /><i /></div>
    </article>
    <aside class="ds-aside"><DocToc :headings="headings" :scroller="scroller" /></aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import PageRating from '../components/PageRating.vue'
import { useRoute, useRouter } from 'vue-router'
import { Marked } from 'marked'
import DOMPurify from 'dompurify'
import TIcon from '@mds/components/TIcon.vue'
import { setPageTitle } from '@mds/utils/docTitle.js'
import DocContent from '../components/DocContent.vue'
import DocToc from '../components/DocToc.vue'
import { state, api, flatPages, fmtDate, askAva } from '../store.js'

const route = useRoute(), router = useRouter()
const page = ref(null), missing = ref(false), headings = ref([]), scroller = ref(null)
const inline = new Marked()
const summaryHtml = computed(() => DOMPurify.sanitize(inline.parseInline(page.value?.summary || ''), { ADD_ATTR: ['target'] }).replace(/<a href="http/g, '<a target="_blank" rel="noopener" href="http'))
const flat = computed(() => flatPages())
const idx = computed(() => flat.value.findIndex(p => p.slug === page.value?.slug))
const prev = computed(() => (idx.value > 0 ? flat.value[idx.value - 1] : null))
const next = computed(() => (idx.value >= 0 && idx.value < flat.value.length - 1 ? flat.value[idx.value + 1] : null))

function onLeadClick(e) {
  const a = e.target.closest('a[href^="/ds/"]')
  if (a && !e.ctrlKey && !e.metaKey) { e.preventDefault(); router.push(a.getAttribute('href').slice(3)) }
}

async function load() {
  const slug = String(route.params.slug)
  try {
    page.value = (await api('/pages/' + encodeURIComponent(slug))).page
    setPageTitle([page.value.title])
    if (route.hash) setTimeout(() => document.getElementById(decodeURIComponent(route.hash.slice(1)))?.scrollIntoView({ block: 'start' }), 60)
  } catch (e) {
    if (e.status !== 404) { missing.value = true; return }
    // Trang đã đổi đường dẫn → chuyển sang đường dẫn mới
    if (!state.loaded) await new Promise(r => { const stop = watch(() => state.loaded, v => { if (v) { stop(); r() } }) })
    const to = state.redirects[slug]
    if (to) router.replace('/' + to + (route.hash || ''))
    else { missing.value = true; setPageTitle(['Không tìm thấy trang']) }
  }
}
onMounted(() => { scroller.value = document.querySelector('.ds-main'); load() })
</script>
