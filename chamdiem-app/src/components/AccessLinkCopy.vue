<template>
  <!-- Đường dẫn dự phòng (vào thẳng bằng IP) cạnh số người đang hoạt động: bấm để chép, gửi cho người không vào được bằng tên miền pdpoint… -->
  <button type="button" class="acl" :class="{ 'acl--done': copied }" :aria-label="`Sao chép đường dẫn ${URL}`"
    v-tip="copied ? 'Đã chép — dán gửi cho người cần vào' : `Đường dẫn dự phòng ${URL} — gửi cho người không vào được bằng pdpoint.sdcthin.local. Bấm để sao chép`"
    @click="copy">
    <TIcon name="link" class="acl__icon" />
    <span class="acl__text">{{ IP }}</span>
    <TIcon :name="copied ? 'check' : 'copy'" class="acl__copy" />
  </button>
</template>

<script setup>
import { ref } from 'vue'
import TIcon from '@mds/components/TIcon.vue'
import { vTip } from '@mds/utils/tooltip.js'
import { toast } from '@mds/utils/toast.js'

const IP = '10.1.39.11'
const URL = `http://${IP}`
const copied = ref(false)
let timer = null
/* Clipboard API chỉ có trên kết nối an toàn — trang http (tên miền .local / IP) → dự phòng execCommand */
async function copy() {
  let ok = true
  try { await navigator.clipboard.writeText(URL) }
  catch {
    const ta = Object.assign(document.createElement('textarea'), { value: URL })
    ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select()
    try { ok = document.execCommand('copy') } catch { ok = false }
    ta.remove()
  }
  if (!ok) { toast.warning(`Không tự chép được — đường dẫn: ${URL}`); return }
  copied.value = true; clearTimeout(timer); timer = setTimeout(() => { copied.value = false }, 1800)
  toast.success(`Đã chép ${URL} — dán gửi cho người cần vào`)
}
</script>

<style scoped>
.acl { display: inline-flex; align-items: center; gap: 6px; height: calc(var(--btn-height) - 4px); padding: 0 8px 0 10px; border: 1px solid var(--stroke-neutral-light); border-radius: var(--radius-default);
  background: var(--bg-white); font-family: inherit; font-size: var(--text-body); color: var(--text-secondary); cursor: pointer; white-space: nowrap; transition: border-color 0.15s, color 0.15s, background-color 0.15s; }
.acl:hover { border-color: var(--stroke-brand); color: var(--text-brand); }
.acl__icon { font-size: 14px; }
.acl__text { font-family: ui-monospace, Menlo, monospace; font-size: var(--text-body); color: var(--text-primary); }
.acl__copy { font-size: 14px; color: var(--icon-neutral); }
.acl:hover .acl__copy { color: var(--text-brand); }
.acl--done { border-color: var(--stroke-success, var(--stroke-brand)); }
.acl--done .acl__copy { color: var(--text-success); }
@media (max-width: 1100px) { .acl__text, .acl__copy { display: none; } .acl { padding: 0 8px; } }

/* Header có màu nền (không phải chế độ sáng): chip kính mờ — nền trắng trong suốt, chữ / icon trắng → hài hòa với nền header */
:root:not([data-mode="light"]) .acl { background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.22); color: rgba(255, 255, 255, 0.85); }
:root:not([data-mode="light"]) .acl:hover { background: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.4); color: #fff; }
:root:not([data-mode="light"]) .acl__text { color: #fff; }
:root:not([data-mode="light"]) .acl__copy, :root:not([data-mode="light"]) .acl:hover .acl__copy { color: rgba(255, 255, 255, 0.8); }
:root:not([data-mode="light"]) .acl--done .acl__copy { color: #a6f4c5; }
</style>
