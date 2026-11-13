/* ═══ Dữ liệu còn gắn với 1 người dùng — còn thì KHÔNG cho xóa (xử lý hết rồi mới xóa) ═══
   Dùng chung máy chủ (chặn thật) + trình duyệt (báo trước khi bấm xóa). Thành viên dự án không tính (xóa người là tự gỡ khỏi dự án). */
export function userUsage(id, { tasks = [], users = [], closings = [], baClosings = [] } = {}) {
  const items = [
    { key: 'pd', label: 'công việc làm PD', count: tasks.filter(t => t.pdId === id).length },
    { key: 'ba', label: 'công việc làm BA', count: tasks.filter(t => t.baId === id).length },
    { key: 'closing', label: 'bản chốt điểm PD', count: closings.filter(c => c.pdId === id).length },
    { key: 'baClosing', label: 'bản chốt điểm BA', count: baClosings.filter(c => c.baId === id).length },
    { key: 'reports', label: 'người đang nhận làm quản lý trực tiếp', count: users.filter(u => u.status !== 'disabled' && (u.managerIds ?? (u.leadId ? [u.leadId] : [])).includes(id)).length },
  ]
  return items.filter(x => x.count > 0)
}
/** Câu báo vì sao chưa xóa được + cách xử lý */
export const usageMessage = (name, usage) =>
  `Chưa xóa được “${name}” vì vẫn còn dữ liệu: ${usage.map(x => `${x.count} ${x.label}`).join(', ')}. `
  + 'Chuyển các công việc / người được quản lý sang người khác (bản chốt điểm thì mở chốt hoặc giữ lại) rồi xóa; '
  + 'nếu người này nghỉ việc mà vẫn cần giữ dữ liệu báo cáo, hãy Khóa quyền truy cập thay vì xóa (Sửa người dùng → Khóa quyền truy cập).'
