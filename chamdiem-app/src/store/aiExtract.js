/* ═══ Bóc tách danh sách công việc từ ảnh chụp bằng Google AI Studio (Gemini) ═══
   Dùng chung cho máy chủ (server/index.js gọi bằng key lưu trên máy chủ) và chế độ demo (gọi thẳng từ trình duyệt). */
export const AI_MODELS = [
  { value: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash (khuyên dùng — nhanh, miễn phí hạn mức)' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite (nhanh nhất)' },
  { value: 'gemini-2.5-pro',        label: 'Gemini 2.5 Pro (chính xác nhất, chậm hơn)' },
]
export const DEFAULT_AI_MODEL = 'gemini-2.5-flash'

const PROMPT = `Ảnh là ảnh chụp màn hình danh sách công việc (backlog / query / iteration) trong TFS / Azure DevOps.
Hãy trích xuất MỌI dòng công việc trong ảnh, theo thứ tự từ trên xuống.
- pbi: mã ID của work item (chỉ chữ số). Không có thì để rỗng.
- content: tiêu đề (Title) của công việc, giữ nguyên tiếng Việt có dấu, KHÔNG kèm loại work item (Product Backlog Item, Bug, Task…) hay trạng thái (New, Approved, Committed, Done…).
- assignedTo: người được giao (Assigned To) nếu có cột này, giữ nguyên chuỗi; không có thì rỗng.
- point: số điểm ước lượng nếu có cột Effort / Story Points / Point / Size / Original Estimate (chỉ số, dấu chấm thập phân); không có thì rỗng.
- deadline: ô ngày ở cột hạn — tên cột có thể là Due Date, Target Date, Deadline, Hạn, Deadline phân tích, Deadline thiết kế, Thời hạn.
- completedDate: ô ngày ở cột hoàn thành — tên cột có thể là Closed Date, Resolved Date, Finish Date, Completed, Ngày hoàn thành, Ngày hoàn thành thực tế.
  Với deadline và completedDate: CHÉP NGUYÊN VĂN cả ô như hiển thị, kể cả phần giờ và AM/PM nếu có (giữ nguyên thứ tự số và dấu phân cách). VD ô "10/07/26 12:00 AM" → "10/07/26 12:00 AM"; ô "2026-07-10" → "2026-07-10". Không tự đổi ngày/tháng. Ô trống hoặc ảnh không có cột đó thì rỗng.
- quality: kết quả chất lượng nếu có cột Kết quả chất lượng / Chất lượng / Quality, giữ nguyên chuỗi (VD "100% - Gần như đạt ngay lần đầu"); không có thì rỗng.
Không đoán số liệu không có trong ảnh.
Bỏ qua dòng tiêu đề cột, dòng nhóm / tổng. Không bịa thêm dòng không có trong ảnh.`

const SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: { pbi: { type: 'STRING' }, content: { type: 'STRING' }, assignedTo: { type: 'STRING' }, point: { type: 'STRING' }, deadline: { type: 'STRING' }, completedDate: { type: 'STRING' }, quality: { type: 'STRING' } },
    required: ['content'],
  },
}

/** Gọi Gemini → [{ pbi, content, assignedTo, point, deadline, completedDate, quality }] */
export async function extractTasksWithGemini({ apiKey, model = DEFAULT_AI_MODEL, imageBase64, mimeType = 'image/png' }) {
  if (!apiKey) throw new Error('Chưa cấu hình API key Google AI Studio')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ inline_data: { mime_type: mimeType, data: imageBase64 } }, { text: `${PROMPT}\nHôm nay là ${new Date().toISOString().slice(0, 10)} (để biết năm hiện tại).` }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: SCHEMA, temperature: 0 },
    }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.error?.message || `Google AI trả lỗi ${res.status}`)
  const text = body?.candidates?.[0]?.content?.parts?.map(p => p.text ?? '').join('') ?? ''
  let list
  try { list = JSON.parse(text) } catch { throw new Error('AI trả về dữ liệu không đọc được') }
  return (Array.isArray(list) ? list : []).map(x => ({
    pbi: String(x.pbi ?? '').replace(/\D/g, ''),
    content: String(x.content ?? '').trim(),
    assignedTo: String(x.assignedTo ?? '').trim(),
    point: String(x.point ?? '').replace(',', '.').replace(/[^\d.]/g, ''),
    deadline: String(x.deadline ?? '').trim(),
    completedDate: String(x.completedDate ?? '').trim(),
    quality: String(x.quality ?? '').trim(),
  })).filter(x => x.content)
}
