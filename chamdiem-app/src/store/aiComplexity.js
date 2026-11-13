/* ═══ AI GỢI Ý ĐỘ PHỨC TẠP NGHIỆP VỤ (Gemini) — đánh giá theo GIẢI PHÁP THIẾT KẾ PD phải làm, không tính công lập trình — “rule skill” lấy NGUYÊN quy tắc từ scoring.js ═══
   Quy tắc (4 câu hỏi + 5 mức: tóm tắt · dấu hiệu · ví dụ) là 1 nguồn duy nhất, cũng là nội dung trang Quy tắc chấm điểm
   → sửa quy tắc ở scoring.js thì AI tự đánh giá theo quy tắc mới. Dùng ở máy chủ (API key không ra trình duyệt). */
import { COMPLEXITY_RULES, COMPLEXITY_STEPS, COMPLEXITY_TIE, COMPLEXITY_NOTE, COMPLEXITIES, BUSINESS_LEVELS, BUSINESS_VALUES, DEFAULT_BUSINESS } from './scoring.js'
import { DEFAULT_AI_MODEL } from './aiExtract.js'

export function complexityPrompt({ content, brief, concept }) {
  const steps = COMPLEXITY_STEPS.map((s, i) => `${i + 1}. ${s.q} → Không: "${s.no}"${s.yes ? ` · Có: "${s.yes}"` : ''}`).join('\n')
  const levels = COMPLEXITY_RULES.map(r => `■ ${r.value}: ${r.summary}\n  Dấu hiệu: ${r.criteria.join('; ')}\n  Ví dụ: ${r.examples.join('; ')}`).join('\n')
  return `Bạn là chuyên gia đánh giá công việc THIẾT KẾ UI/UX (PD) của phần mềm doanh nghiệp. Hãy xác định "Độ phức tạp thiết kế" và "Hệ số nghiệp vụ" của công việc dưới đây theo ĐÚNG quy tắc sau (áp dụng chung mọi sản phẩm, không thiên về một lĩnh vực).

TRỌNG TÂM: đánh giá độ phức tạp của GIẢI PHÁP THIẾT KẾ mà PD phải làm — số khung / màn / popup / trạng thái giao diện cần vẽ, luồng thao tác cần thiết kế, các quy tắc / điều kiện phải thể hiện trên giao diện (hiển thị, ẩn hiện, cảnh báo, kiểm tra nhập liệu), các vai trò / trạng thái làm giao diện khác nhau, các tình huống ngoại lệ cần thiết kế.
KHÔNG tính công lập trình, xử lý phía máy chủ, dữ liệu, hiệu năng. Tích hợp / tự động / xử lý hàng loạt chỉ tính khi nó sinh ra phần giao diện phải thiết kế (cấu hình, theo dõi tiến trình, kết quả, xử lý lỗi…). Việc nghe "to" về nghiệp vụ nhưng giao diện chỉ thêm 1 trường / đổi nhãn vẫn là mức thấp.

CÁCH CHỌN — trả lời lần lượt, dừng ở câu đầu tiên trả lời "Không":
${steps}
${COMPLEXITY_TIE}
Lưu ý: ${COMPLEXITY_NOTE}

ĐỊNH NGHĨA CÁC MỨC:
${levels}

HỆ SỐ NGHIỆP VỤ (tách riêng, đo độ khó để HIỂU nghiệp vụ — không phải công vẽ; nghiệp vụ phức tạp mà giao diện đơn giản → level thấp + business cao):
${BUSINESS_LEVELS.map(b => `■ ${b.value}: ${b.summary}`).join('\n')}

CÔNG VIỆC CẦN ĐÁNH GIÁ:
- Nội dung: ${content || '(không có)'}
- Mô tả giải pháp sơ bộ: ${brief || '(không có)'}
${concept ? `- Concept: ${concept}\n` : ''}
Yêu cầu: trả lời từng câu hỏi (true = Có, false = Không; các câu sau câu "Không" đầu tiên vẫn trả lời theo đánh giá của bạn), chọn "level" đúng theo cách chọn ở trên, "business" theo Hệ số nghiệp vụ, "reason" là 1–2 câu tiếng Việt ngắn gọn nêu dấu hiệu quyết định về mặt thiết kế (khung / luồng / trạng thái / quy tắc trên giao diện). Chỉ trả JSON.`
}

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    answers: { type: 'ARRAY', items: { type: 'BOOLEAN' } },
    level: { type: 'STRING', enum: COMPLEXITIES },
    business: { type: 'STRING', enum: BUSINESS_VALUES },
    reason: { type: 'STRING' },
  },
  required: ['answers', 'level', 'business', 'reason'],
}

/** Mức theo cây quyết định từ các câu trả lời (đảm bảo level không mâu thuẫn với answers) */
export function levelFromAnswers(answers) {
  for (let i = 0; i < COMPLEXITY_STEPS.length; i++) {
    const s = COMPLEXITY_STEPS[i]
    if (!answers?.[i]) return s.no
    if (i === COMPLEXITY_STEPS.length - 1) return s.yes ?? s.no
  }
  return COMPLEXITY_STEPS[0].no
}

/** Gọi Gemini → { level, reason, answers } */
export async function suggestComplexityWithGemini({ apiKey, model = DEFAULT_AI_MODEL, content, brief, concept }) {
  if (!apiKey) throw new Error('Chưa cấu hình API key Google AI Studio')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: complexityPrompt({ content, brief, concept }) }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: SCHEMA, temperature: 0 },
    }),
    signal: AbortSignal.timeout(30000),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.error?.message || `Google AI trả lỗi ${res.status}`)
  const text = body?.candidates?.[0]?.content?.parts?.map(p => p.text ?? '').join('') ?? ''
  let r
  try { r = JSON.parse(text) } catch { throw new Error('AI trả về dữ liệu không đọc được') }
  const answers = (Array.isArray(r.answers) ? r.answers : []).slice(0, COMPLEXITY_STEPS.length).map(Boolean)
  const level = answers.length === COMPLEXITY_STEPS.length ? levelFromAnswers(answers) : (COMPLEXITIES.includes(r.level) ? r.level : 'Trung bình')
  return { level, business: BUSINESS_VALUES.includes(r.business) ? r.business : DEFAULT_BUSINESS, reason: String(r.reason ?? '').trim(), answers }
}
