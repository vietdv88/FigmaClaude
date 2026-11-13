import { ref, computed, provide, inject, nextTick } from 'vue'

/* ═══════════════════════════════════════════════════════════════════════════
   Quy chuẩn báo lỗi trường nhập (MDS):
   - Ô lỗi: viền đỏ + icon chấm than tròn đỏ bên phải trong ô; hover icon → tooltip lỗi.
   - Tooltip lỗi nền đỏ chữ trắng nổi phía dưới ô (KHÔNG đẩy form xuống); tự hiện khi ô lỗi đang focus.
   - Form submit có lỗi → focusFirstError(): focus ô lỗi đầu tiên → tooltip tự hiện.
   AppInput (hoặc wrapper tương tự) gọi provideFieldError(); các control App* đọc qua useFieldError().
   ═══════════════════════════════════════════════════════════════════════════ */

export const FIELD_ERROR_KEY = Symbol('mds-field-error')
/** Trường bắt buộc: AppInput required → control con biết để ẩn nút bỏ chọn (×) — để trống trường bắt buộc là sai */
export const FIELD_REQUIRED_KEY = Symbol('mds-field-required')
export const provideFieldRequired = getRequired => provide(FIELD_REQUIRED_KEY, getRequired)
export const useFieldRequired = () => inject(FIELD_REQUIRED_KEY, () => false)

/** Chỉ 1 tooltip lỗi tại một thời điểm: ô đang được hover icon ưu tiên hơn ô đang focus */
const hoverOwner = ref(null)
let seq = 0

/** Dùng trong wrapper trường (AppInput…): cung cấp lỗi cho control con + trạng thái tooltip */
export function provideFieldError(getMessage, getType = () => 'error') {
  const id      = ++seq
  const focused = ref(false)
  const message  = computed(() => (getType() === 'error' && getMessage()) || '')
  const hasError = computed(() => !!message.value)
  const open     = computed(() => hasError.value && (hoverOwner.value === id || (focused.value && hoverOwner.value === null)))

  const ctx = {
    message, hasError,
    show: () => { hoverOwner.value = id },
    hide: () => { if (hoverOwner.value === id) hoverOwner.value = null },
  }
  provide(FIELD_ERROR_KEY, ctx)

  return {
    ...ctx, open,
    onFocusIn:  () => { focused.value = true },
    onFocusOut: e => { if (!e.currentTarget.contains(e.relatedTarget)) focused.value = false },
  }
}

/** Dùng trong control (AppTextbox, AppCombobox…): null nếu không nằm trong wrapper có lỗi */
export const useFieldError = () => inject(FIELD_ERROR_KEY, null)

/**
 * Sau khi validate thất bại: focus ô lỗi đầu tiên trong `root` (element hoặc component) → tooltip lỗi tự hiện.
 * Gọi: if (!valid) return focusFirstError(formEl)
 */
export async function focusFirstError(root) {
  await nextTick()
  const host = root?.$el ?? root ?? document
  const field = host.querySelector?.('.input-field--error')
  if (!field) return false
  field.scrollIntoView({ block: 'nearest' })
  const input = field.querySelector('input:not([type=hidden]):not([readonly]):not([disabled]), select:not([disabled]), .cb-trigger:not([disabled]), textarea:not([readonly])')
  input?.focus({ preventScroll: true })
  return true
}
