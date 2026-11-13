import { isPdRole } from './scoring.js'

/* ═══ AVA — KIẾN THỨC MỚI ═══════════════════════════════════════════════════
   Mỗi lần cập nhật tri thức cho AVA (aiAva.js) → thêm 1 mục lên ĐẦU danh sách (id mới).
   Người dùng chưa xem mục mới nhất → callout xổ dưới icon AVA: “AVA vừa được cập nhật…” + câu hỏi gợi ý (bấm là hỏi luôn);
   trong khung AVA có nhóm “Mới cập nhật” trong NEWS_DAYS ngày.
   topics[] / questions[].for: 'PD' | 'BA' — chỉ gợi ý cho người phía đó (bỏ trống = mọi người). Câu hỏi phải trả lời được bằng tri thức AVA hiện có.
   ═══════════════════════════════════════════════════════════════════════════ */
export const AVA_NEWS = [
  {
    id: '2026-11-09a', date: '2026-11-09',
    topics: [{ t: 'lộ trình chấm điểm trên ứng dụng cho PD', for: 'PD' }, { t: 'lộ trình chấm điểm trên ứng dụng cho BA', for: 'BA' }, { t: 'các bước PO tổ chức chấm điểm' }],
    questions: [
      { q: 'Mình là PD, cần làm gì trên ứng dụng để được chấm điểm?', for: 'PD' },
      { q: 'Mình là BA, cần làm gì trên ứng dụng để được chấm điểm?', for: 'BA' },
      { q: 'Vòng lặp có ảnh hưởng tới điểm không?' },
      { q: 'Nên cập nhật công việc trước ngày nào để kịp chốt điểm?' },
    ],
  },
  {
    id: '2026-11-04a', date: '2026-11-04',
    topics: [{ t: 'chuyển 1 công việc sang vòng lặp khác' }],
    questions: [
      { q: 'Làm sao chuyển một công việc sang vòng lặp khác?' },
      { q: 'Ai được chuyển công việc sang vòng lặp khác?' },
    ],
  },
  {
    id: '2026-11-02c', date: '2026-11-02',
    topics: [{ t: 'vai trò HRBP (xem toàn bộ)' }],
    questions: [
      { q: 'Vai trò HRBP xem được những gì?' },
      { q: 'HRBP có sửa hay chốt điểm được không?' },
    ],
  },
  {
    id: '2026-11-02b', date: '2026-11-02',
    topics: [{ t: 'PD Lead đánh giá mức hài lòng', for: 'PD' }],
    questions: [
      { q: 'PD Lead có được đánh giá mức hài lòng không?', for: 'PD' },
      { q: 'Việc Lead tự vẽ thì ai đánh giá mức hài lòng?', for: 'PD' },
      { q: 'Đánh giá mức hài lòng cho nhiều việc cùng lúc thế nào?' },
    ],
  },
  {
    id: '2026-11-02', date: '2026-11-02',
    topics: [{ t: 'điểm dẫn dắt PD Lead', for: 'PD' }, { t: 'vai trò PD Lead', for: 'PD' }, { t: 'ai được chốt điểm BA', for: 'BA' }, { t: 'hoàn tác khi sửa công việc' }],
    questions: [
      { q: 'PD Lead được tính điểm như thế nào?', for: 'PD' },
      { q: 'Chọn vai trò của Lead cho công việc ở đâu?', for: 'PD' },
      { q: 'Vai trò PD Lead có những quyền gì?', for: 'PD' },
      { q: 'Ai được chốt điểm cho BA?', for: 'BA' },
      { q: 'Lỡ sửa nhầm trong chi tiết công việc thì hoàn tác thế nào?' },
    ],
  },
]
export const NEWS_DAYS = 30
export const latestNews = () => AVA_NEWS[0] ?? null
/** Mục còn “mới” (trong NEWS_DAYS ngày kể từ ngày cập nhật) */
export const isFresh = n => !!n && (Date.now() - new Date(n.date).getTime()) / 864e5 <= NEWS_DAYS
/** Phía của người dùng: PD (PD / PD Lead) · BA · '' (vai trò khác → cả hai) */
export const sideOf = user => (isPdRole(user?.role) ? 'PD' : user?.role === 'BA' ? 'BA' : '')
/** Chủ đề của mục tin hợp với người dùng → “a, b và c” */
export function newsTopics(n, user) {
  const side = sideOf(user), list = (n?.topics ?? []).filter(x => !x.for || !side || x.for === side).map(x => x.t)
  return list.length > 1 ? `${list.slice(0, -1).join(', ')} và ${list.at(-1)}` : list[0] ?? ''
}
/** Câu hỏi gợi ý của mục tin cho người dùng (focus: chủ đề đang chọn trong khung AVA, nếu có) */
export function newsQuestions(n, user, focus = '', max = 3) {
  const side = focus || sideOf(user)
  return (n?.questions ?? []).filter(x => !x.for || !side || x.for === side).slice(0, max).map(x => x.q)
}
