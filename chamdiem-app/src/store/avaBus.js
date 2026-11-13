import { reactive } from 'vue'

/* Kênh nhỏ để nơi khác mở AVA và hỏi sẵn 1 câu (VD gợi ý ở Tổng quan → “Hỏi AVA”). AvaPanel theo dõi rồi tự mở + gửi câu hỏi. */
export const avaBus = reactive({ question: '', focus: '', n: 0 })
/** Mở AVA và hỏi luôn câu q (focus: 'PD' | 'BA' — chọn sẵn chủ đề tư vấn) */
export function askAvaNow(q, focus = '') { Object.assign(avaBus, { question: q, focus, n: avaBus.n + 1 }) }

/** Công việc đang mở trong bảng chi tiết (TaskDrawer cập nhật) — để AVA biết “công việc này” là việc nào */
export const avaCtx = reactive({ taskId: '' })
