import { Marked, Renderer } from 'marked'
import DOMPurify from 'dompurify'

/* ═══ Markdown của trang tài liệu → các khối hiển thị ═══
   Markdown chuẩn (GFM: bảng, danh sách…) + khối đặc biệt bao bằng ::: … :::
     ::: note | info | warning | danger | success   → hộp lưu ý (AppInlineAlert)
     ::: do / ::: dont                               → thẻ Nên / Không nên (đứng liền nhau → xếp 2 cột)
     ::: demo <mã ví dụ>                             → ví dụ sống dùng control thật của mds-ui (src/demos)
   Trả về { blocks, headings } — blocks: { kind: 'html' | 'callout' | 'dodont' | 'demo', … } */

export const CALLOUTS = { note: 'info', info: 'info', tip: 'success', success: 'success', warning: 'warning', danger: 'danger' }

export const slugText = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
  .toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'muc'

const purify = html => DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'loading'], FORBID_TAGS: ['style', 'form', 'input'] })

export function renderDoc(md) {
  const headings = [], used = new Map()
  const marked = new Marked({ gfm: true, breaks: false })
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens)
        const text = html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        let id = slugText(text); const n = used.get(id) || 0; used.set(id, n + 1); if (n) id += '-' + (n + 1)
        if (depth <= 3) headings.push({ id, text, level: depth })
        return `<h${depth} id="${id}">${html}</h${depth}>\n`
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens)
        const ext = /^https?:\/\//.test(href || '')
        return `<a href="${href}"${title ? ` title="${title}"` : ''}${ext ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`
      },
      image({ href, title, text }) {
        return `<img class="ds-img" src="${href}" alt="${text || ''}"${title ? ` title="${title}"` : ''} loading="lazy">`
      },
      table(token) {   // bọc bảng trong khung cuộn ngang (màn hẹp không tràn trang)
        return `<div class="ds-table-wrap">${Renderer.prototype.table.call(this, token)}</div>`
      },
    },
  })
  const html = s => purify(marked.parse(s))

  const blocks = []
  const lines = String(md || '').replace(/\r\n/g, '\n').split('\n')
  let buf = [], box = null
  const flush = () => { const s = buf.join('\n').trim(); buf = []; if (s) blocks.push({ kind: 'html', html: html(s) }) }
  let fence = false   // trong khối code ``` … ``` → không xét cú pháp :::
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence
    const open = !box && !fence && line.match(/^:::\s*([a-z][\w-]*)\s*(.*)$/i)
    if (open) { flush(); box = { type: open[1].toLowerCase(), arg: open[2].trim(), lines: [] }; continue }
    if (box && !fence && /^:::\s*$/.test(line)) {
      const inner = box.lines.join('\n').trim()
      if (box.type === 'demo') blocks.push({ kind: 'demo', name: box.arg || inner.split('\n')[0].trim() })
      // ::: checklist Tiêu đề — mỗi dòng “- …” là 1 việc tick được (markdown inline: link, **đậm**…)
      else if (box.type === 'checklist') blocks.push({ kind: 'checklist', title: box.arg, id: slugText(box.arg || 'ds'),
        items: box.lines.map(l => l.match(/^\s*[-*]\s+(?:\[[ xX]\]\s*)?(.+)$/)?.[1]).filter(Boolean)
          .map(t => ({ id: slugText(t.replace(/\]\([^)]*\)/g, ']')).slice(0, 80), html: purify(marked.parseInline(t)) })) })
      else if (box.type === 'do' || box.type === 'dont') {
        const item = { type: box.type, html: html(inner) }
        const last = blocks.at(-1)
        if (last?.kind === 'dodont' && last.items.length < 2) last.items.push(item)
        else blocks.push({ kind: 'dodont', items: [item] })
      } else blocks.push({ kind: 'callout', type: CALLOUTS[box.type] || 'info', title: box.arg, html: html(inner) })
      box = null; continue
    }
    if (box) box.lines.push(line); else buf.push(line)
  }
  if (box) buf.push(`::: ${box.type} ${box.arg}`, ...box.lines)   // khối chưa đóng → hiện nguyên văn
  flush()
  return { blocks, headings }
}
