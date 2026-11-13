<template>
  <!-- Vùng Notification: góc phải phía trên, ngay dưới header (quy chuẩn) — đặt 1 lần trong khung app -->
  <Teleport to="body">
    <div class="notifier" aria-live="polite">
      <TransitionGroup name="notif">
        <AppNotification v-for="n in notifications" :key="n.id" :type="n.type" :title="n.title" :message="n.message" @close="dismissNotification(n.id)" />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import AppNotification from './AppNotification.vue'
import { notifications, dismissNotification } from '../utils/notify.js'
</script>

<style scoped>
.notifier {
  position: fixed; top: calc(var(--layout-header-h) + 16px); right: 16px; z-index: 9999;
  display: flex; flex-direction: column; gap: 16px; align-items: flex-end; pointer-events: none;
  max-height: calc(100vh - var(--layout-header-h) - 32px); overflow: hidden;
}
.notifier > * { pointer-events: auto; }
.notif-enter-active, .notif-leave-active { transition: opacity 0.2s, transform 0.2s; }
.notif-enter-from, .notif-leave-to { opacity: 0; transform: translateX(16px); }
.notif-move { transition: transform 0.2s; }
</style>
