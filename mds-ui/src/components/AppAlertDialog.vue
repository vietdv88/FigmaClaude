<template>
  <!-- Alert Dialog — Figma MDS “Alert Dialog” (6019:180746): hỏi xác nhận / thông báo ngắn.
       Rộng 432 · đệm 24 · các phần cách 16 · tiêu đề H3 16/22 Semi Bold + icon đóng 20 · nội dung 13/20 ·
       hàng nút căn phải cách 8 (Hủy viền + nút chính Brand / Danger) · bo 12 · bóng Bottom 12 · KHÔNG vạch ngăn -->
  <Teleport to="body" :disabled="inline">
    <div :class="inline ? 'alert-dialog-inline' : 'alert-dialog-overlay'" @mousedown.self="!inline && !persistent && $emit('cancel')">
      <div ref="el" class="alert-dialog" role="alertdialog" aria-modal="true" :aria-labelledby="tid" :aria-describedby="did">
        <div class="alert-dialog__head">
          <h2 :id="tid" class="alert-dialog__title" v-tip="title">{{ title }}</h2>
          <button v-if="!hideClose" type="button" class="alert-dialog__close" aria-label="Đóng (Esc)" @click="$emit('cancel')"><TIcon name="x" /></button>
        </div>
        <div :id="did" class="alert-dialog__body"><slot>{{ message }}</slot></div>
        <div class="alert-dialog__actions">
          <!-- Text Link bên trái (tùy chọn) — VD “Không hỏi lại”, “Xem chi tiết” -->
          <button v-if="linkLabel" type="button" class="btn btn--link alert-dialog__link" @click="$emit('link')">{{ linkLabel }}</button>
          <div class="alert-dialog__btns">
            <slot name="actions">
              <button v-if="!hideCancel" type="button" class="btn btn--outline btn--neutral" @click="$emit('cancel')">{{ cancelLabel }}</button>
              <button v-if="secondaryLabel" type="button" class="btn btn--outline btn--neutral" @click="$emit('secondary')">{{ secondaryLabel }}</button>
              <button ref="okEl" type="button" class="btn" :class="type === 'danger' ? 'btn--danger' : 'btn--primary'" :disabled="loading" @click="$emit('confirm')">
                <TIcon v-if="loading" name="loader-2" class="alert-dialog__spin" />{{ confirmLabel }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TIcon from './TIcon.vue'
import { useEscClose } from '../utils/escStack.js'
import { vTip } from '../utils/tooltip.js'

const props = defineProps({
  title:          { type: String,  default: '' },
  /** Nội dung ngắn — nêu KẾT QUẢ sau khi xác nhận, không hỏi lại “Bạn có chắc…?” (có thể dùng slot mặc định) */
  message:        { type: String,  default: '' },
  /** default (nút chính Brand) | danger (nút chính đỏ — xóa, hủy bỏ không khôi phục) */
  type:           { type: String,  default: 'default' },
  confirmLabel:   { type: String,  default: 'Đồng ý' },
  cancelLabel:    { type: String,  default: 'Hủy' },
  /** Nút phụ thứ 3 (đứng giữa Hủy và nút chính) — VD “Lưu thành bộ lọc mới” */
  secondaryLabel: { type: String,  default: '' },
  linkLabel:      { type: String,  default: '' },
  hideCancel:     { type: Boolean, default: false },
  hideClose:      { type: Boolean, default: false },
  loading:        { type: Boolean, default: false },
  /** Bấm ra ngoài không đóng */
  persistent:     { type: Boolean, default: false },
  /** Vẽ tại chỗ, không overlay (khung ví dụ trong tài liệu) */
  inline:         { type: Boolean, default: false },
})
const emit = defineEmits(['confirm', 'cancel', 'secondary', 'link'])
const uid = Math.random().toString(36).slice(2, 8), tid = `ad-t-${uid}`, did = `ad-d-${uid}`
const okEl = ref(null)
if (!props.inline) useEscClose(() => emit('cancel'))
onMounted(() => { if (!props.inline) okEl.value?.focus() })   // Enter = nút chính, Esc = Hủy
</script>

<style scoped>
.alert-dialog-overlay { position: fixed; inset: 0; z-index: var(--z-dialog); display: flex; align-items: center; justify-content: center; padding: var(--page-gutter); background: var(--bg-overlay); }
.alert-dialog-inline { display: flex; min-width: 0; max-width: 100%; }
.alert-dialog { width: 432px; max-width: 100%; max-height: calc(100vh - 32px); display: flex; flex-direction: column; gap: 16px; padding: 24px; box-sizing: border-box;
  background: var(--bg-white); border-radius: var(--radius-dialog); box-shadow: var(--shadow-bottom-12); overflow: auto; }
.alert-dialog__head { display: flex; align-items: flex-start; gap: 12px; }
.alert-dialog__title { flex: 1; min-width: 0; margin: 0; font-size: 16px; line-height: 22px; font-weight: var(--fw-semibold); color: var(--text-primary); overflow-wrap: anywhere;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  padding-top: 2px; margin-top: -2px; }   /* nới vùng cắt phía trên: dấu chồng chữ HOA dòng đầu không bị cụt (không nới phía dưới — sẽ lộ dòng thứ 3) */   /* tiêu đề tối đa 2 dòng (tài liệu Dialog) */
.alert-dialog__close { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; width: 20px; height: 20px; padding: 0; margin-top: 1px; border: none; border-radius: var(--radius-sm);
  background: transparent; color: var(--icon-neutral); cursor: pointer; }
.alert-dialog__close .ti { font-size: 20px; }
.alert-dialog__close:hover { color: var(--icon-neutral); }
.alert-dialog__close:focus-visible { outline: 2px solid var(--stroke-brand); outline-offset: 2px; }
.alert-dialog__body { font-size: var(--text-body); line-height: var(--text-body-lh); color: var(--text-primary); overflow-wrap: anywhere; }
.alert-dialog__body :deep(p) { margin: 0; }
.alert-dialog__body :deep(p + p) { margin-top: 8px; }
.alert-dialog__actions { display: flex; align-items: center; gap: var(--gap-control); }
.alert-dialog__link { margin-right: auto; }
.alert-dialog__btns { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: var(--gap-control); margin-left: auto; }
.alert-dialog__spin { animation: ad-spin 0.8s linear infinite; }
@keyframes ad-spin { to { transform: rotate(360deg); } }
</style>
