/* ═══ AVA THỰC HIỆN THAO TÁC — AI chỉ ĐỀ XUẤT, người dùng bấm xác nhận mới ghi dữ liệu ═══
   AI trả kèm 1 khối ```ava-action {json}``` → máy chủ đọc + chuẩn hoá (chỉ giá trị hợp lệ, giới hạn số lượng) → trình duyệt hiện thẻ xác nhận
   (sửa / bỏ từng dòng) → bấm nút → gọi ĐÚNG hàm như nhập tay (kiểm quyền, lịch sử, thông báo như thường). Không có thao tác xóa.
   Loại: update_task (sửa việc đang mở) · create_tasks (tạo việc) · create_project (tạo dự án, kèm thành viên + vòng lặp đầu) · create_iteration · add_members (thêm thành viên dự án đang mở). */
import { COMPLEXITIES, BUSINESS_VALUES, SOLUTION_ROLES, PLATFORMS, STAGES } from './scoring.js'

export const MAX_ACTION_TASKS = 50
const STAGE_VALUES = STAGES.map(s => s.value)
/** Trường của việc AVA được đề xuất sửa (không gồm điểm nhập tay, mức hài lòng, người thực hiện…) */
export const AVA_TASK_FIELDS = ['complexity', 'businessLevel', 'solutionBy', 'mainScreens', 'subScreens', 'platform', 'isOwnProject']

/** Hướng dẫn cho AI (nối vào kiến thức AVA) */
export const AVA_ACTION_GUIDE = `
═══ THỰC HIỆN THAO TÁC THAY NGƯỜI DÙNG (chỉ khi được yêu cầu rõ ràng) ═══
Khi người dùng YÊU CẦU làm (tạo công việc / danh sách công việc, tạo dự án, tạo vòng lặp, chọn / điền / áp dụng tham số vào công việc đang mở, "gợi ý rồi chọn luôn"…):
- Viết 1–2 câu tóm tắt sẽ làm gì, rồi CUỐI câu trả lời thêm ĐÚNG 1 khối:
\`\`\`ava-action
{ ...JSON theo 1 trong các mẫu dưới... }
\`\`\`
- Người dùng sẽ thấy thẻ xác nhận và tự bấm nút — KHÔNG nói "đã tạo / đã cập nhật"; nói "Bạn kiểm tra rồi bấm … để thực hiện".
- Chỉ đề xuất trong ngữ cảnh người dùng có quyền (xem mục NGƯỜI HỎI / NGỮ CẢNH ĐANG MỞ). Không có quyền → giải thích, KHÔNG thêm khối.
- Thiếu thông tin bắt buộc (VD không biết dự án / vòng lặp nào, tên người trùng nhau) → hỏi lại 1 câu ngắn, KHÔNG thêm khối.
- Câu hỏi thông thường (hỏi quy tắc, hỏi cách làm) → trả lời như bình thường, KHÔNG thêm khối.
- Không bao giờ đề xuất xóa, đổi điểm nhập tay, mức hài lòng, phân quyền.
Mẫu JSON (chỉ dùng giá trị liệt kê; trường không chắc thì bỏ qua):
1) Sửa công việc ĐANG MỞ — gợi ý tham số chấm điểm theo quy tắc rồi điền giúp:
{"type":"update_task","fields":{"complexity":"${COMPLEXITIES.join('|')}","businessLevel":"${BUSINESS_VALUES.join('|')}","solutionBy":"${SOLUTION_ROLES.join('|')}","mainScreens":số,"subScreens":số,"platform":"${PLATFORMS.join('|')}","isOwnProject":"Có|Không"},"reason":"lý do ngắn theo quy tắc"}
2) Tạo công việc (tối đa ${MAX_ACTION_TASKS}) — mặc định vào dự án / vòng lặp đang mở:
{"type":"create_tasks","tasks":[{"content":"nội dung","pbi":"mã PBI nếu có","pd":"tên hoặc mã NV PD","ba":"tên hoặc mã NV BA","stage":"${STAGE_VALUES.join('|')}","mainScreens":số,"subScreens":số,"complexity":"...","businessLevel":"...","solutionBy":"...","platform":"...","expectedDate":"YYYY-MM-DD"}]}
   (stage: design = Chỉ thiết kế, analysis = Chỉ phân tích, both = Phân tích → Thiết kế. Có số màn / mô tả thì tự gợi ý độ phức tạp thiết kế + hệ số nghiệp vụ theo quy tắc. solutionBy / platform: CHỈ điền khi người dùng nói rõ — không thì bỏ trống (mặc định PD và BA / Web). pd / ba: ưu tiên mã NV trong danh sách thành viên.)
3) Tạo dự án: {"type":"create_project","name":"tên dự án","code":"MÃ","members":[{"who":"tên hoặc mã NV","role":"manager|member|viewer"}],"iteration":{"name":"tên vòng lặp đầu","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD"}}
4) Tạo vòng lặp cho dự án đang mở: {"type":"create_iteration","name":"tên","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD"}
5) Thêm thành viên vào dự án đang mở (chỉ khi bạn ĐƯỢC quản trị dự án): {"type":"add_members","members":[{"who":"mã NV (ưu tiên) hoặc tên đầy đủ","role":"manager|member|viewer"}]}
   (role: manager = Quản trị dự án, member = Thành viên, viewer = Hạn chế / chỉ xem; QA luôn là viewer. Tra người trong DANH BẠ NGƯỜI DÙNG; trùng tên → hỏi lại.)
`

/** Ngữ cảnh màn đang mở (trình duyệt gửi kèm) → ghi chú cho AI */
export function contextNote(ctx) {
  if (!ctx || typeof ctx !== 'object') return ''
  const lines = []
  if (ctx.project) lines.push(`- Dự án đang mở: ${ctx.project.name}${ctx.project.code ? ` (${ctx.project.code})` : ''} — bạn ${ctx.project.canAdd ? 'ĐƯỢC' : 'KHÔNG được'} thêm việc, ${ctx.project.canManage ? 'ĐƯỢC' : 'KHÔNG được'} tạo vòng lặp.`)
  if (ctx.project?.members?.length) lines.push(`- Thành viên dự án: ${ctx.project.members.slice(0, 80).map(m => `${m.name}${m.code ? ` [${m.code}]` : ''} (${m.role})`).join('; ')}`)
  if (ctx.iteration) lines.push(`- Vòng lặp đang chọn: ${ctx.iteration.name}${ctx.iteration.startDate ? ` (${ctx.iteration.startDate} → ${ctx.iteration.endDate})` : ''}`)
  if (ctx.task) {
    const t = ctx.task
    lines.push(`- Công việc ĐANG MỞ: "${t.content}"${t.pbi ? ` (PBI ${t.pbi})` : ''} · loại ${t.stage || 'design'} · màn chính ${t.mainScreens ?? 0}, màn phụ ${t.subScreens ?? 0} · độ phức tạp thiết kế ${t.complexity || 'chưa chọn'} · hệ số nghiệp vụ ${t.businessLevel || 'Bình thường'} · người đưa giải pháp ${t.solutionBy || 'chưa chọn'} · nền tảng ${t.platform || 'chưa chọn'}${t.solutionBrief ? ` · mô tả giải pháp: ${String(t.solutionBrief).slice(0, 600)}` : ''}. Trường bạn được sửa: ${(t.editable ?? []).join(', ') || 'không có'}.`)
  }
  if (ctx.directory?.length) lines.push(`- DANH BẠ NGƯỜI DÙNG (để thêm thành viên / tạo dự án — tên [mã NV] (vai trò)): ${ctx.directory.slice(0, 300).map(u => `${u.name}${u.code ? ` [${u.code}]` : ''} (${u.role})`).join('; ')}`)
  if (ctx.canCreateProject != null) lines.push(`- Bạn ${ctx.canCreateProject ? 'ĐƯỢC' : 'KHÔNG được'} tạo dự án mới.`)
  return lines.length ? `\n\nNGỮ CẢNH ĐANG MỞ (dùng cho thao tác):\n${lines.join('\n')}` : ''
}

const str = (v, n) => String(v ?? '').trim().slice(0, n)
const int = v => Math.max(0, Math.min(999, Math.round(Number(v) || 0)))
const oneOf = (v, list) => (list.includes(v) ? v : undefined)
const date = v => (/^\d{4}-\d{2}-\d{2}$/.test(String(v ?? '')) ? String(v) : '')
const clean = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ''))

/** Chuẩn hoá hành động AI trả về — chỉ giữ giá trị hợp lệ; sai mẫu → null */
export function normalizeAction(a) {
  if (!a || typeof a !== 'object') return null
  if (a.type === 'update_task') {
    const f = a.fields ?? {}
    const fields = clean({
      complexity: oneOf(f.complexity, COMPLEXITIES), businessLevel: oneOf(f.businessLevel, BUSINESS_VALUES), solutionBy: oneOf(f.solutionBy, SOLUTION_ROLES),
      platform: oneOf(f.platform, PLATFORMS), isOwnProject: oneOf(f.isOwnProject, ['Có', 'Không']),
      mainScreens: f.mainScreens != null ? int(f.mainScreens) : undefined, subScreens: f.subScreens != null ? int(f.subScreens) : undefined,
    })
    return Object.keys(fields).length ? { type: 'update_task', fields, reason: str(a.reason, 400) } : null
  }
  if (a.type === 'create_tasks') {
    const tasks = (Array.isArray(a.tasks) ? a.tasks : []).slice(0, MAX_ACTION_TASKS).map(t => clean({
      content: str(t?.content, 500), pbi: str(t?.pbi, 30), pd: str(t?.pd, 80), ba: str(t?.ba, 80), stage: oneOf(t?.stage, STAGE_VALUES) ?? 'design',
      mainScreens: int(t?.mainScreens), subScreens: int(t?.subScreens), complexity: oneOf(t?.complexity, COMPLEXITIES), businessLevel: oneOf(t?.businessLevel, BUSINESS_VALUES),
      solutionBy: oneOf(t?.solutionBy, SOLUTION_ROLES), platform: oneOf(t?.platform, PLATFORMS), expectedDate: date(t?.expectedDate),
    })).filter(t => t.content)
    return tasks.length ? { type: 'create_tasks', tasks } : null
  }
  if (a.type === 'create_project') {
    const name = str(a.name, 120); if (!name) return null
    const members = (Array.isArray(a.members) ? a.members : []).slice(0, 60).map(m => ({ who: str(m?.who, 80), role: oneOf(m?.role, ['manager', 'member', 'viewer']) ?? 'member' })).filter(m => m.who)
    const it = a.iteration && str(a.iteration.name, 80) ? { name: str(a.iteration.name, 80), startDate: date(a.iteration.startDate), endDate: date(a.iteration.endDate) } : null
    return { type: 'create_project', name, code: str(a.code, 20).toUpperCase(), members, iteration: it }
  }
  if (a.type === 'add_members') {
    const members = (Array.isArray(a.members) ? a.members : []).slice(0, 60).map(m => ({ who: str(m?.who, 80), role: oneOf(m?.role, ['manager', 'member', 'viewer']) ?? 'member' })).filter(m => m.who)
    return members.length ? { type: 'add_members', members } : null
  }
  if (a.type === 'create_iteration') {
    const name = str(a.name, 80); if (!name) return null
    return { type: 'create_iteration', name, startDate: date(a.startDate), endDate: date(a.endDate) }
  }
  return null
}

/** Tách khối ```ava-action``` khỏi câu trả lời → { text, action } */
export function extractAction(text) {
  const m = String(text ?? '').match(/```ava-action\s*([\s\S]*?)```/)
  if (!m) return { text, action: null }
  let action = null
  try { action = normalizeAction(JSON.parse(m[1])) } catch { /* JSON hỏng → bỏ qua thao tác */ }
  return { text: text.replace(m[0], '').trim(), action }
}
