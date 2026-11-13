import { ref, watch } from 'vue'

/* Màu nền của khung ví dụ (mọi ví dụ dùng chung, nhớ trên trình duyệt): 'white' (Trắng — mặc định) | 'page' (Xám — BG Page) */
const KEY = 'ds-demo-bg'
const read = () => { try { return localStorage.getItem(KEY) === 'page' ? 'page' : 'white' } catch { return 'white' } }
export const demoBg = ref(read())
watch(demoBg, v => { try { localStorage.setItem(KEY, v) } catch { /* bỏ qua */ } })
export const BG_OPTIONS = [{ value: 'white', label: 'Màu nền: Trắng' }, { value: 'page', label: 'Màu nền: Xám (BG Page)' }]

// Xem thử mode Font size “Mobile Responsive” ở khung ví dụ (dùng chung mọi khung, không lưu làm lựa chọn của người dùng)
export const mobileFontPreview = ref(false)

/* Công cụ Đo: MẶC ĐỊNH BẬT ở mọi khung ví dụ (người xem tự tắt → nhớ trên trình duyệt, dùng chung mọi khung / mọi trang)
   · explain: ô “Giải thích” trong thẻ thông số — mặc định tắt cho gọn, cũng nhớ lựa chọn */
const IK = 'ds-demo-inspect', EK = 'ds-demo-explain'
const get = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v === '1' } catch { return d } }
export const demoInspect = ref(get(IK, true))
export const demoExplain = ref(get(EK, false))
watch(demoInspect, v => { try { localStorage.setItem(IK, v ? '1' : '0') } catch { /* bỏ qua */ } })
watch(demoExplain, v => { try { localStorage.setItem(EK, v ? '1' : '0') } catch { /* bỏ qua */ } })
