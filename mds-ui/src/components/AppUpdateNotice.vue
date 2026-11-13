<!--
  AppUpdateNotice — vừa deploy bản mới: thông báo góc trên bên phải, yêu cầu tải lại trang để tiếp tục dùng.
  Đặt 1 lần trong khung app:  <AppUpdateNotice :build="__APP_BUILD__" />   (build = mã phiên bản lúc build, vite define)
-->
<template>
  <Teleport to="body">
    <Transition name="upd">
      <div v-if="updateAvailable" class="upd" role="alert">
        <span class="upd__icon"><TIcon name="refresh" /></span>
        <div class="upd__body">
          <span class="upd__title">Đã có phiên bản mới</span>
          <span class="upd__text">Tải lại trang để dùng bản mới nhất và tránh lỗi khi lưu dữ liệu.</span>
        </div>
        <button type="button" class="btn btn--primary btn--sm upd__btn" @click="reload">Tải lại ngay</button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted } from 'vue'
import TIcon from './TIcon.vue'
import { updateAvailable, startVersionCheck } from '../utils/versionCheck.js'

const props = defineProps({ build: { type: String, default: '' }, url: { type: String, default: '/version.json' } })
onMounted(() => startVersionCheck(props.build, { url: props.url }))
const reload = () => window.location.reload()
</script>

<style scoped>
.upd {
  position: fixed; z-index: 10001; top: calc(var(--layout-header-h, 48px) + 12px); right: 16px;
  display: flex; align-items: center; gap: 12px; width: min(420px, calc(100vw - 32px));
  padding: 12px 12px 12px 14px; border-radius: var(--radius-dialog); background: var(--bg-white);
  box-shadow: var(--shadow-popover);   /* thẻ nổi: Bottom 12, có bóng thì không viền */
}
.upd__icon { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%; background: #3a63e6; color: var(--icon-white); }
.upd__icon .ti { font-size: 18px; }
.upd__body { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.upd__title { font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--text-primary); }
.upd__text { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-secondary); }
.upd__btn { flex-shrink: 0; }
.upd-enter-active, .upd-leave-active { transition: opacity 0.2s, transform 0.2s; }
.upd-enter-from, .upd-leave-to { opacity: 0; transform: translateX(16px); }
</style>
