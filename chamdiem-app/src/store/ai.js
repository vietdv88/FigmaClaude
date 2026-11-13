import { reactive, computed } from 'vue'
import { backend, api } from './api.js'
import { extractTasksWithGemini, DEFAULT_AI_MODEL } from './aiExtract.js'

/* ═══ AI bóc tách ảnh chụp (Google AI Studio / Gemini) ═══
   Có máy chủ: API key chỉ lưu trên máy chủ; trình duyệt gửi ảnh lên /api/ai/extract-tasks.
   Chế độ demo: key lưu trong trình duyệt (localStorage), gọi thẳng Google AI. */
const LS = 'pdpoint-ai'
const local = reactive((() => { try { return JSON.parse(localStorage.getItem(LS)) || {} } catch { return {} } })())
const saveLocal = () => { try { localStorage.setItem(LS, JSON.stringify(local)) } catch { /* bỏ qua */ } }

export const aiEnabled = computed(() => (backend.enabled ? !!backend.publicConfig?.aiEnabled : !!local.apiKey))

const mask = k => (k ? k.slice(0, 4) + '•'.repeat(8) + k.slice(-4) : '')
export async function getAiSettings() {
  if (backend.enabled) return await api.get('/api/ai/settings')
  return { hasKey: !!local.apiKey, keyMasked: mask(local.apiKey), model: local.model || DEFAULT_AI_MODEL }
}
/** patch: { apiKey?, model? } — apiKey = '' để xóa key */
export async function saveAiSettings(patch) {
  if (backend.enabled) {
    const r = await api.put('/api/ai/settings', patch)
    backend.publicConfig = { ...backend.publicConfig, aiEnabled: !!r.hasKey }
    return r
  }
  if ('apiKey' in patch) local.apiKey = String(patch.apiKey ?? '').trim()
  if (patch.model) local.model = patch.model
  saveLocal()
  return getAiSettings()
}

const toBase64 = file => new Promise((resolve, reject) => {
  const r = new FileReader()
  r.onload = () => resolve(String(r.result).split(',')[1] ?? '')
  r.onerror = () => reject(new Error('Không đọc được ảnh'))
  r.readAsDataURL(file)
})
/* Ảnh chụp nhỏ / dẹt (VD lưới TFS rộng 1600 × 500): chữ quá nhỏ với AI → AI bỏ trống cột số (Point, ngày).
   Cạnh dài < 2400px → phóng to tới ~3072px (tối đa ×3), giữ PNG cho chữ nét. Lỗi / trình duyệt cũ → gửi ảnh gốc */
const AI_MIN_EDGE = 2400, AI_TARGET_EDGE = 3072
async function upscaleForAi(file) {
  try {
    const bmp = await createImageBitmap(file)
    const long = Math.max(bmp.width, bmp.height)
    if (!long || long >= AI_MIN_EDGE) { bmp.close?.(); return null }
    const k = Math.min(3, AI_TARGET_EDGE / long)
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height)
    g.imageSmoothingQuality = 'high'; g.drawImage(bmp, 0, 0, c.width, c.height); bmp.close?.()
    return { imageBase64: c.toDataURL('image/png').split(',')[1], mimeType: 'image/png' }
  } catch { return null }
}
const TEST_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='

/** Ảnh → [{ pbi, content, assignedTo }] */
export async function extractTasksFromImage(file) {
  const { imageBase64, mimeType } = (await upscaleForAi(file)) ?? { imageBase64: await toBase64(file), mimeType: file.type || 'image/png' }
  if (backend.enabled) return (await api.post('/api/ai/extract-tasks', { imageBase64, mimeType })).rows ?? []
  return extractTasksWithGemini({ apiKey: local.apiKey, model: local.model || DEFAULT_AI_MODEL, imageBase64, mimeType })
}
/** Kiểm tra key / kết nối (trang Cài đặt) */
export async function testAi() {
  if (backend.enabled) { await api.post('/api/ai/extract-tasks', { test: true }); return true }
  await extractTasksWithGemini({ apiKey: local.apiKey, model: local.model || DEFAULT_AI_MODEL, imageBase64: TEST_PNG })
  return true
}

/** AI gợi ý độ phức tạp nghiệp vụ từ nội dung + mô tả giải pháp sơ bộ → { level, reason, answers } (quy tắc: scoring.js) */
export async function suggestComplexity({ content = '', brief = '', concept = '' }) {
  if (backend.enabled) return api.post('/api/ai/suggest-complexity', { content, brief, concept })
  const { suggestComplexityWithGemini } = await import('./aiComplexity.js')
  return suggestComplexityWithGemini({ apiKey: local.apiKey, model: local.model || DEFAULT_AI_MODEL, content, brief, concept })
}

/** Trợ lý AVA — messages: [{ role: 'user' | 'ava', text }], focus: 'PD' | 'BA' (bộ phận cần tư vấn) → { text } */
/** Đánh giá 1 câu trả lời của AVA (chỉ khi có máy chủ — lưu vào Lịch sử hỏi AVA) */
export const rateAva = (logId, vote, note = '') => api.post('/api/ai/ava/feedback', { logId, vote, note })
export async function askAva(messages, focus = '', context = null) {
  if (backend.enabled) return api.post('/api/ai/ava', { messages, focus, context })
  const [{ askAvaWithGemini }, { db }] = await Promise.all([import('./aiAva.js'), import('./db.js')])
  return askAvaWithGemini({ apiKey: local.apiKey, model: local.model || DEFAULT_AI_MODEL, cfg: db.config, messages, focus, context })
}
