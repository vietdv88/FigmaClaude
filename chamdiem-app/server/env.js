import fs from 'node:fs'
import path from 'node:path'
import { parseEnv } from 'node:util'
import { fileURLToPath } from 'node:url'

/* Nạp chamdiem-app/.env (nếu có) khi chạy trực tiếp bằng Node — biến đã đặt sẵn (Docker env_file, dòng lệnh) được ưu tiên.
   Import ĐẦU TIÊN trong index.js để các module khác đọc được biến môi trường. */
const here = path.dirname(fileURLToPath(import.meta.url))
for (const f of [path.join(here, '..', '.env'), path.join(here, '.env')]) {
  if (!fs.existsSync(f)) continue
  for (const [k, v] of Object.entries(parseEnv(fs.readFileSync(f, 'utf8')))) if (process.env[k] === undefined) process.env[k] = v
  break
}
