<template>
  <!-- Trang chủ “/”: đã đăng nhập → Tổng quan · chưa đăng nhập → trang giới thiệu (cùng địa chỉ, không chuyển sang /gioi-thieu) -->
  <ReportPage v-if="signedIn" />
  <LandingPage v-else />
</template>

<script setup>
import { computed, defineAsyncComponent, watchEffect } from 'vue'
import { setPageTitle } from '@mds/utils/docTitle.js'
import { backend } from '../store/api.js'

const ReportPage  = defineAsyncComponent(() => import('./ReportPage.vue'))
const LandingPage = defineAsyncComponent(() => import('./LandingPage.vue'))
// Không có máy chủ (bản demo) → luôn vào Tổng quan như trước
const signedIn = computed(() => !backend.enabled || backend.user?.status === 'active')
watchEffect(() => setPageTitle(signedIn.value ? ['Tổng quan'] : ['Giới thiệu']))
</script>
