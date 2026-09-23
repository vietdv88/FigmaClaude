<template>
  <div class="app-shell">
    <ControlHeader app-name="Công việc" :no-meta="true" :hide-trial-banner="true">
      <template #logo-icon>
        <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
          <path d="M0 14C0 2.8 2.8 0 14 0C25.2 0 28 2.8 28 14C28 25.2 25.2 28 14 28C2.8 28 0 25.2 0 14Z" fill="url(#cv_grad)"/>
          <path d="M14 5.94995C16.2321 5.94995 18.2519 6.8586 19.7101 8.32604C19.9052 8.52247 19.8939 8.83809 19.6981 9.03391L14.3794 14.353C14.1744 14.558 13.8419 14.558 13.6369 14.353L11.081 11.7971C10.5343 11.2503 9.64771 11.2503 9.10098 11.7971C8.55443 12.3438 8.55438 13.2301 9.10098 13.7768L13.0163 17.692C13.3077 17.9833 13.6957 18.1194 14.0772 18.1001C14.413 18.0843 14.7443 17.9481 15.0007 17.6917L20.9583 11.7338C21.2279 11.4642 21.6838 11.5644 21.7816 11.933C21.9565 12.5926 22.05 13.2853 22.05 14C22.05 18.4458 18.4458 22.05 14 22.05C9.55406 22.05 5.94995 18.4458 5.94995 14C5.94995 9.55406 9.55406 5.94995 14 5.94995Z" fill="white"/>
          <defs>
            <linearGradient id="cv_grad" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse">
              <stop stop-color="#9ADE05"/>
              <stop offset="1" stop-color="#5FBE00"/>
            </linearGradient>
          </defs>
        </svg>
      </template>
    </ControlHeader>

    <div class="body-row">
      <CvSidebar
        :active-id="activeId"
        @nav="onNav"
      />
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CvSidebar     from './CvSidebar.vue'
import ControlHeader from '@mds/components/ControlHeader.vue'

const router = useRouter()
const route  = useRoute()

const activeId = computed(() => route.path.replace('/', ''))

function onNav(id) {
  const routeMap = {
    'tong-quan':    '/tong-quan',
    'viec-cua-toi': '/viec-cua-toi',
    'bao-cao':      '/bao-cao',
  }
  if (routeMap[id]) router.push(routeMap[id])
}
</script>
