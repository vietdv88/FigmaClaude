/* Dữ liệu mẫu dùng chung cho các demo bố cục màn hình */
import { fmtNum } from '@mds/utils/number.js'

const STATUS = {
  active:  { label: 'Đang giao dịch', color: 'success' },
  pending: { label: 'Chờ duyệt', color: 'warning' },
  stop:    { label: 'Ngừng giao dịch', color: 'neutral' },
}
const RAW = [
  ['KH0001', 'Công ty CP Thương mại An Phát', 'Hà Nội', 'Lê Minh', 'active', 125400000],
  ['KH0002', 'Công ty TNHH Kỹ thuật Bình Minh', 'TP.HCM', 'Trần Hậu', 'pending', 48200000],
  ['KH0003', 'Công ty CP Dược phẩm Cát Tường', 'Đà Nẵng', 'Phạm Quân', 'active', 312000000],
  ['KH0004', 'Công ty TNHH Nội thất Đông Á', 'Hải Phòng', 'Vũ Lan', 'stop', 0],
  ['KH0005', 'Công ty CP Xây dựng Hưng Thịnh', 'Hà Nội', 'Lê Minh', 'active', 87650000],
  ['KH0006', 'Công ty TNHH Thực phẩm Kim Ngân', 'Cần Thơ', 'Nguyễn An', 'active', 15900000],
  ['KH0007', 'Công ty CP Logistics Long Hải', 'TP.HCM', 'Trần Hậu', 'pending', 230000000],
  ['KH0008', 'Công ty TNHH In ấn Minh Khang', 'Hà Nội', 'Vũ Lan', 'active', 9400000],
  ['KH0009', 'Công ty CP Năng lượng Phú Gia', 'Bình Dương', 'Phạm Quân', 'active', 540300000],
  ['KH0010', 'Công ty TNHH Giáo dục Sao Việt', 'Huế', 'Nguyễn An', 'stop', 0],
]
export const CUSTOMERS = RAW.map(([code, name, city, owner, st, debt], i) => ({
  id: i + 1, code, name, city, owner, status: STATUS[st], statusKey: st, debt, debtText: fmtNum(debt),
  phone: `0243 ${String(5521000 + i * 137).slice(0, 3)} ${String(5521000 + i * 137).slice(3)}`,
  email: `lienhe@${name.split(' ').slice(-2).join('').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')}.vn`,
}))
export const CUSTOMER_COLUMNS = [
  { key: 'code', label: 'Mã KH', width: 96 },
  { key: 'name', label: 'Tên khách hàng', minWidth: 260 },
  { key: 'city', label: 'Tỉnh/Thành', width: 120 },
  { key: 'owner', label: 'Người phụ trách', width: 150 },
  { key: 'status', label: 'Trạng thái', type: 'status', width: 170 },
  { key: 'debtText', label: 'Công nợ', width: 140, align: 'right' },
]
export const ORDERS = [
  { id: 1, no: 'DH00125', date: '02/11/2026', item: 'Giấy in A4 Double A', amount: '12.480.000', status: { label: 'Đã giao', color: 'success' } },
  { id: 2, no: 'DH00119', date: '28/10/2026', item: 'Mực in HP 12A', amount: '5.750.000', status: { label: 'Đang giao', color: 'info' } },
  { id: 3, no: 'DH00102', date: '15/10/2026', item: 'Bút bi Thiên Long', amount: '1.800.000', status: { label: 'Đã giao', color: 'success' } },
]
export const ORDER_COLUMNS = [
  { key: 'no', label: 'Số đơn', width: 110 },
  { key: 'date', label: 'Ngày', width: 110 },
  { key: 'item', label: 'Hàng hoá', minWidth: 200 },
  { key: 'amount', label: 'Giá trị', width: 130, align: 'right' },
  { key: 'status', label: 'Trạng thái', type: 'status', width: 120 },
]
export const MORE = [
  { id: 'export', label: 'Xuất khẩu', icon: 'file-export' },
  { id: 'print', label: 'In danh sách', icon: 'printer' },
  { separator: true },
  { id: 'setting', label: 'Thiết lập', icon: 'settings' },
]
