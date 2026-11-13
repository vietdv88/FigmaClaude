<template>
  <DialogShell title="Ảnh đại diện" :width="440" @close="$emit('close')">
    <div class="avd">
      <div v-if="current && !picking" class="avd__current">
        <UserAvatar class="avd__big" :name="me?.name ?? ''" :picture="current" />
        <span class="avd__hint">Ảnh hiện tại</span>
      </div>
      <!-- Chọn ảnh → kéo để căn mặt vào vòng tròn, kéo thanh trượt để phóng to. Ảnh được thu nhỏ trên máy trước khi lưu (≤ 500 KB) -->
      <AppAvatarCropper ref="cropper" @change="picking = true" />
      <p class="avd__note">PNG, JPG hoặc WebP · ảnh được cắt vuông 256×256 px, tối đa 500 KB.</p>
      <p v-if="error" class="avd__error"><TIcon name="circle-x" />{{ error }}</p>
    </div>
    <template #footer>
      <button v-if="current" class="btn btn--link avd__remove" :disabled="busy" @click="save('')">Xóa ảnh</button>
      <button class="btn btn--outline btn--neutral" @click="$emit('close')">Hủy</button>
      <button class="btn btn--primary" :disabled="busy || !picking" @click="save()">Lưu ảnh</button>
    </template>
  </DialogShell>
</template>

<script setup>
import { ref, computed } from 'vue'
import DialogShell from './DialogShell.vue'
import UserAvatar  from './UserAvatar.vue'
import TIcon       from '@mds/components/TIcon.vue'
import AppAvatarCropper from '@mds/components/AppAvatarCropper.vue'
import { toast } from '@mds/utils/toast.js'
import { useDocTitle } from '@mds/utils/docTitle.js'
import { api, backend } from '../store/api.js'
import { currentUser, userById } from '../store/db.js'

/* Người dùng tự cập nhật ảnh đại diện (menu avatar góc phải) */
const emit = defineEmits(['close'])
useDocTitle(() => ['Ảnh đại diện'])
const me = computed(() => currentUser.value)
const current = computed(() => me.value?.picture ?? '')
const cropper = ref(null), picking = ref(false), busy = ref(false), error = ref('')

async function save(value) {
  error.value = ''
  const picture = value ?? cropper.value?.crop()
  if (picture === null || picture === undefined) { error.value = 'Không thu nhỏ được ảnh xuống dưới 500 KB — thử ảnh khác'; return }
  busy.value = true
  try {
    if (backend.enabled) await api.put('/api/me/avatar', { picture })
    const u = userById(me.value.id); if (u) u.picture = picture                    // cập nhật ngay (không chờ realtime)
    if (backend.user?.id === me.value.id) backend.user = { ...backend.user, picture }
    toast.success(picture ? 'Đã cập nhật ảnh đại diện' : 'Đã xóa ảnh đại diện')
    emit('close')
  } catch (e) { error.value = e.message }
  finally { busy.value = false }
}
</script>

<style scoped>
.avd { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.avd__current { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.avd__big { width: 72px; height: 72px; border-radius: var(--radius-pill); font-size: 24px; }
.avd__hint, .avd__note { font-size: var(--text-body); color: var(--text-secondary); text-align: center; }
.avd__error { display: flex; align-items: center; gap: 6px; font-size: var(--text-body); color: var(--text-danger); }
.avd__remove { margin-right: auto; color: var(--text-danger); }
</style>
