/* Chặn hỏi lặp AVA (spam cùng 1 câu) — đỡ tốn token.
   · Cùng người hỏi + cùng câu (bỏ qua hoa thường / dấu câu / khoảng trắng) + cùng ngữ cảnh trong WINDOW → trả lại câu trả lời trước, KHÔNG gọi AI.
   · Câu đó đang được trả lời → chặn (đợi AVA trả lời xong).
   · Hỏi lặp ≥ MAX_REPEAT lần trong WINDOW → chỉ nhắc ngắn.
   Chỉ áp cho câu hỏi không kèm ảnh. Dùng chung cho AVA tài liệu (/ds) và AVA PD Point (chép cùng nội dung). */
const WINDOW = 10 * 60e3, MAX_REPEAT = 5

export function createAvaRepeat() {
  const map = new Map()   // key → { at, pending, answer, count }
  const norm = q => String(q || '').normalize('NFC').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, ' ').trim()
  const sweep = now => { if (map.size > 500) for (const [k, v] of map) if (now - v.at > WINDOW) map.delete(k) }
  return {
    /** → { key, hit: null | { kind: 'pending' | 'cached' | 'stop', answer?, count } } */
    check(who, question, ctx = '') {
      const q = norm(question); if (!q) return { key: '', hit: null }
      const now = Date.now(); sweep(now)
      const key = `${who}|${ctx}|${q}`, x = map.get(key)
      if (!x || now - x.at > WINDOW) return { key, hit: null }
      if (x.pending) return { key, hit: { kind: 'pending', count: x.count } }
      x.count++
      return { key, hit: { kind: x.count >= MAX_REPEAT ? 'stop' : 'cached', answer: x.answer, count: x.count } }
    },
    start(key) { if (key) map.set(key, { at: Date.now(), pending: true, answer: null, count: 1 }) },
    done(key, answer) { const x = key && map.get(key); if (x) { x.pending = false; x.answer = answer; x.at = Date.now() } },
    fail(key) { if (key) map.delete(key) },   // lỗi → cho hỏi lại bình thường
  }
}

/* Câu GẦN GIỐNG câu vừa hỏi (cùng người, cùng trang / chế độ, trong WINDOW) → gửi lại câu trả lời trước, không gọi AI.
   Giống = Jaccard tập từ có nghĩa ≥ 0,6, hoặc tập từ câu này nằm gọn trong câu kia (≥ 3 từ chung). sig / sim: hàm tách từ & so (qSig / qSim của AVA) */
export function createAvaSimilar(sig, sim) {
  const map = new Map()   // who|ctx → [{ s, answer, at }]
  return {
    find(who, ctx, q) {
      const s = sig(q), now = Date.now(); if (s.length < 2) return null
      const list = (map.get(`${who}|${ctx}`) || []).filter(x => now - x.at < WINDOW)
      for (const x of list.slice().reverse()) {
        const { j, shared } = sim(s, x.s), sub = shared >= 3 && (shared === s.length || shared === x.s.length)
        if (j >= 0.6 || sub) return x.answer
      }
      return null
    },
    add(who, ctx, q, answer) {
      const k = `${who}|${ctx}`, now = Date.now()
      const list = (map.get(k) || []).filter(x => now - x.at < WINDOW).slice(-4)
      list.push({ s: sig(q), answer, at: now }); map.set(k, list)
      if (map.size > 500) for (const [kk, v] of map) if (!v.some(x => now - x.at < WINDOW)) map.delete(kk)
    },
  }
}

/* Hỏi DỒN DẬP không đọc: câu mới tới khi câu trả lời trước (dài) chưa kịp đọc — nhanh hơn ¼ thời gian đọc (≈ 15 ký tự/giây, tối thiểu 6 giây).
   3 lần liên tiếp → khóa SPAM_MIN phút, trả SPAM_TEXT (không gọi AI). Đọc bình thường thì bộ đếm về 0. */
const SPAM_MIN = 3
export function createAvaPace() {
  const map = new Map()   // who → { doneAt, len, fast, until }
  return {
    blocked(who) {
      const x = map.get(who), now = Date.now(); if (!x) return false
      if (x.until && now < x.until) return true
      if (x.until && now >= x.until) { x.until = 0; x.fast = 0 }
      if (x.doneAt && x.len > 400) {
        const need = Math.max(6000, (x.len / 15) * 1000 / 4)
        x.fast = now - x.doneAt < need ? x.fast + 1 : 0
        if (x.fast >= 3) { x.until = now + SPAM_MIN * 60e3; return true }
      }
      return false
    },
    done(who, len) { const x = map.get(who) || { fast: 0, until: 0 }; x.doneAt = Date.now(); x.len = len || 0; map.set(who, x); if (map.size > 1000) map.clear() },
  }
}

export const REPEAT_NOTE = '> Bạn vừa hỏi đúng câu này — AVA gửi lại câu trả lời trước đó (không tính thêm lượt hỏi).\n\n'
export const STOP_TEXT = 'Bạn đã hỏi câu này nhiều lần liên tiếp — câu trả lời vẫn như ở trên. Thử hỏi theo cách khác hoặc nói rõ phần chưa hiểu để AVA trả lời sát hơn nhé.'
export const SIMILAR_NOTE = '> Câu này gần giống câu bạn vừa hỏi — AVA gửi lại câu trả lời trước đó (không tính thêm lượt hỏi). Cần thêm ý nào thì nói rõ phần đó nhé.\n\n'
export const SPAM_TEXT = 'Khoan khoan ✋ Bạn đang gửi câu hỏi dồn dập mà chưa kịp đọc câu trả lời nào cả — AVA tạm nghỉ trả lời 3 phút. Đọc lại các câu trả lời ở trên đã, rồi hỏi đúng chỗ còn vướng, AVA trả lời ngay.'
export const PENDING_TEXT = 'AVA đang trả lời câu này — đợi chút nhé, không cần gửi lại.'
