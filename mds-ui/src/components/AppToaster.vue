<template>
  <!-- Vùng toast: giữa phía trên màn hình (quy chuẩn) — đặt 1 lần trong khung app -->
  <Teleport to="body">
    <div class="toaster" role="status" aria-live="polite">
      <TransitionGroup name="toast">
        <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast--${t.type}`" @mouseenter="pauseToast(t.id)" @mouseleave="resumeToast(t.id)">
          <TIcon :name="ICON[t.type]" class="toast__icon" />
          <span class="toast__msg">{{ t.message }}</span>
          <button v-if="t.action" type="button" class="toast__action" @click="runToastAction(t.id)"><TIcon v-if="t.action.icon" :name="t.action.icon" />{{ t.action.label }}</button>
          <button type="button" class="toast__close" v-tip="'Đóng'" aria-label="Đóng" @click="dismissToast(t.id)"><TIcon name="x" /></button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { vTip } from '../utils/tooltip.js'
import TIcon from './TIcon.vue'
import { toasts, dismissToast, pauseToast, resumeToast, runToastAction } from '../utils/toast.js'
const ICON = { success: 'circle-check', error: 'alert-circle', warning: 'alert-triangle', info: 'info-circle' }
</script>

<style scoped>
.toaster {
  position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 10000;
  display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: none;
}
.toast {
  pointer-events: auto;
  display: flex; align-items: center; gap: 12px;
  min-width: 320px; max-width: min(560px, calc(100vw - 32px));
  padding: 12px 12px 12px 16px;
  border-radius: var(--radius-dialog); box-shadow: var(--shadow-popover);
  background: var(--toast-bg); color: var(--text-white);
  font-size: var(--text-body); line-height: var(--text-body-lh); font-weight: var(--fw-medium);
}
/* Quy chuẩn toast: nền màu đặc theo loại, chữ + icon trắng */
.toast--info    { --toast-bg: #3a63e6; }
.toast--warning { --toast-bg: #e38c2c; }
.toast--error   { --toast-bg: #d94b3a; }
.toast--success { --toast-bg: #4aab66; }
.toast__icon { font-size: 22px; flex-shrink: 0; color: var(--icon-white); }
.toast__msg { flex: 1; min-width: 0; }
.toast__close {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  padding: 4px; border: none; border-radius: var(--radius-default);
  background: transparent; color: var(--icon-white); cursor: pointer;
}
.toast__close:hover { background: var(--alpha-white-200); }
.toast__close .ti { font-size: 20px; }
/* Nút thao tác (VD Hoàn tác): chữ trắng đậm trên nền mờ, cùng hàng với nội dung */
.toast__action {
  display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;
  height: calc(var(--btn-height) - 4px); padding: 0 10px; border: 1px solid rgba(255, 255, 255, 0.6); border-radius: var(--radius-default);
  background: transparent; color: var(--text-white); cursor: pointer; white-space: nowrap;
  font-family: inherit; font-size: var(--text-body); font-weight: var(--fw-semibold);
}
.toast__action:hover { background: rgba(255, 255, 255, 0.18); }
.toast__action:focus-visible { outline: 2px solid #fff; outline-offset: 1px; }
.toast__action .ti { font-size: 16px; }
.toast-enter-active, .toast-leave-active { transition: opacity 0.2s, transform 0.2s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
