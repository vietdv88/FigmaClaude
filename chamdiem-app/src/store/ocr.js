/* ═══ Đọc chữ từ ảnh (OCR) — Tesseract.js chạy NGAY TRONG TRÌNH DUYỆT ═══
   Worker, lõi WASM và dữ liệu tiếng Việt / tiếng Anh nằm sẵn trong app (public/ocr) → ảnh không gửi ra internet. */
export async function recognizeImage(image, onProgress) {
  const { createWorker } = await import('tesseract.js')   // ~ chỉ tải khi dùng
  const base = new URL(import.meta.env.BASE_URL + 'ocr/', location.href).href
  const worker = await createWorker(['vie', 'eng'], 1 /* LSTM */, {
    workerPath: base + 'worker.min.js',
    corePath: base,
    langPath: base + 'lang',
    gzip: false,
    logger: m => { if (m.status === 'recognizing text') onProgress?.(Math.round(m.progress * 100)) },
  })
  try {
    const { data } = await worker.recognize(image)
    return data.text || ''
  } finally {
    await worker.terminate()
  }
}
