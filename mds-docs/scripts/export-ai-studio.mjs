/* ═══ Xuất bộ quy chuẩn MDS (skill + rule từ trước nay) thành 1 file .md để đưa cho Google AI Studio sinh app ═══
   Chạy: node scripts/export-ai-studio.mjs [đường-dẫn-file-ra]   (mặc định: FigmaClaude/MDS-Rules-for-AI-Studio.md)
   Nguồn: Claude/mds-ui-rules, Claude/.claude/skills/{mds-webapp-developer, design-workflow, ui-release-checklist}, CLAUDE.md,
          và các rule UI người dùng đã chốt qua từng lần phản hồi (memory feedback_*.md). Bỏ qua phần chỉ liên quan hạ tầng / AVA / Figma plugin. */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const OUT = process.argv[2] || path.join(REPO, 'MDS-Rules-for-AI-Studio.md')
const SK = path.join(REPO, 'Claude/.claude/skills')
const MEM = path.join(os.homedir(), '.claude/projects/-Users-dvviet-Github/memory')
const read = f => { try { return fs.readFileSync(f, 'utf8') } catch { console.warn('⚠ thiếu', f); return '' } }
const body = f => read(f).replace(/^---[\s\S]*?---\n/, '').trim()

/* Rule UI người dùng đã chốt (memory) — bỏ các mục về AVA, deploy, tài liệu /ds, ngôn ngữ trả lời */
const SKIP_MEM = /^(feedback_(ai_|ava_|demo_|fix_in_mdsui|sync_ds|reply_vietnamese|follow_figma)|project_|pdpoint_)/
const memRules = fs.existsSync(MEM)
  ? fs.readdirSync(MEM).filter(f => f.startsWith('feedback_') && !SKIP_MEM.test(f)).sort().map(f => {
      const t = read(path.join(MEM, f)), name = t.match(/^name:\s*(.+)$/m)?.[1] ?? f, desc = t.match(/^description:\s*(.+)$/m)?.[1]?.replace(/^"|"$/g, '') ?? ''
      return `### ${name}\n**${desc}**\n\n${t.replace(/^---[\s\S]*?---\n/, '').trim().replace(/\[\[([^\]]+)\]\]/g, '`$1`')}`
    }).join('\n\n---\n\n')
  : ''

const PARTS = [
  ['Quy tắc cốt lõi của monorepo (kích thước control theo mật độ)', body(path.join(REPO, 'CLAUDE.md'))],
  ['Quy chuẩn thi công giao diện MDS (mds-ui-rules) — NGUỒN CHÍNH', body(path.join(REPO, 'Claude/mds-ui-rules/SKILL.md'))],
  ['Skill dựng web app MDS (mds-webapp-developer) — cấu trúc app, layout, form, bảng, quy tắc theo từng loại màn hình', body(path.join(SK, 'mds-webapp-developer/SKILL.md'))],
  ['Màn danh sách (LIST-PAGE)', body(path.join(SK, 'mds-webapp-developer/LIST-PAGE.md'))],
  ['Màu chủ đề (THEMES)', body(path.join(SK, 'mds-webapp-developer/THEMES.md'))],
  ['Design tokens (Figma Variables → CSS)', body(path.join(SK, 'mds-webapp-developer/references/design-tokens.md'))],
  ['Control mds-ui — props, sự kiện, cách dùng', body(path.join(SK, 'mds-webapp-developer/references/vue-controls.md'))],
  ['Cuộn & khung nhìn (viewport-scroll)', body(path.join(SK, 'mds-webapp-developer/references/viewport-scroll.md'))],
  ['Kéo thả (drag-drop)', body(path.join(SK, 'mds-webapp-developer/references/drag-drop.md'))],
  ['Lưới widget / dashboard (widget-grid)', body(path.join(SK, 'mds-webapp-developer/references/widget-grid.md'))],
  ['Biểu đồ ECharts', body(path.join(SK, 'mds-webapp-developer/references/echarts-dashboard.md'))],
  ['Checklist trước khi giao UI', body(path.join(SK, 'ui-release-checklist/SKILL.md'))],
  ['Quy trình làm việc thiết kế UI', body(path.join(SK, 'design-workflow/SKILL.md'))],
  ['Quy tắc bổ sung — người dùng đã chốt qua từng lần phản hồi', memRules],
].filter(([, b]) => b)

const guide = `# BỘ QUY CHUẨN MISA DESIGN SYSTEM (MDS) — DÙNG ĐỂ SINH APP

> File này gom toàn bộ quy chuẩn thiết kế + thi công giao diện web MISA (MDS Web Components v2.0 / thư viện mds-ui). Hãy đọc hết, bám đúng khi sinh app.

## 0. CÁCH DÙNG CHO AI (đọc trước)

1. **Mục tiêu**: sinh ứng dụng web nội bộ MISA có giao diện ĐÚNG quy chuẩn MDS. Khi các phần có chỗ mâu thuẫn, thứ tự ưu tiên: **PHẦN “Quy tắc bổ sung” (người dùng chốt gần nhất) > Quy chuẩn thi công (mds-ui-rules) > Skill dựng web app > các tài liệu tham chiếu còn lại**.
2. **Thư viện \`mds-ui\` (Vue 3) và các class \`.btn\`, \`.ibox\`, \`.card\`… trong tài liệu là THƯ VIỆN NỘI BỘ — môi trường sinh app của bạn có thể KHÔNG import được.** Khi đó: tự định nghĩa lại các biến CSS (\`:root { --btn-height … }\`) và class tương ứng theo đúng giá trị trong phần Design tokens / Control, rồi dùng chúng. **Không gõ tay số px / mã màu** cho nút, ô nhập, card… — luôn đi qua biến (token) để đổi mật độ / theme được.
3. **Mật độ hiển thị** (\`data-density\`): Nhỏ (compact) · Trung bình (mặc định) · Rộng (comfortable). Mọi kích thước control lấy từ token theo mật độ.
4. **Ngôn ngữ giao diện: tiếng Việt.** Định dạng số: \`1.234.567,89\` (quy tắc TT200). Chữ nội dung mặc định **13px**.
5. Nội dung các phần dưới đây là nguyên văn từ các skill; tên file, đường dẫn \`@mds/…\`, lệnh kiểm tra (overflow-check, double-border-check…) là của repo nội bộ — dùng như **mô tả quy tắc**, không cần chạy.
6. Khi sinh màn hình: xác định loại (danh sách / form / chi tiết / dashboard / popup) → áp đúng quy tắc của loại đó (bố cục, khoảng cách, thanh công cụ, phân trang, nút Lưu/Hủy ghim đáy…) → tự soát lại theo “Checklist trước khi giao UI” ở gần cuối file.

## MỤC LỤC

${PARTS.map(([t], i) => `${i + 1}. ${t}`).join('\n')}

`

let out = guide
PARTS.forEach(([title, text], i) => {
  out += `\n\n\n${'═'.repeat(70)}\n# PHẦN ${i + 1} — ${title}\n${'═'.repeat(70)}\n\n${text}\n`
})
fs.writeFileSync(OUT, out)
const kb = Math.round(Buffer.byteLength(out) / 1024)
console.log(`✓ ${OUT}\n  ${PARTS.length} phần · ${kb} KB · ≈ ${Math.round(Buffer.byteLength(out) / 3.2 / 1000)}k token (ước tính)`)
