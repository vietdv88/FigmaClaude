/* Định dạng câu trả lời của AVA thành HTML an toàn (khung AVA + trang Lịch sử hỏi AVA).
   Escape HTML trước, rồi: **đậm**, `mã`, tiêu đề nhỏ (### / ##), gạch đầu dòng / đánh số LỒNG NHAU theo thụt đầu dòng, đoạn văn. */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
// Link nội bộ của app: [chữ](/du-an/…?mo=…) → <a data-ava-link> (khung AVA bắt sự kiện để chuyển trang trong app); link ngoài không nhận
const inline = s => s
  .replace(/\[([^\]\n]{1,120})\]\((\/[\w\-/?=.%]*(?:&amp;[\w\-=.%]*)*)\)/g, '<a class="ava-link" data-ava-link href="$2">$1</a>')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>')

export function avaHtml(s) {
  const lines = esc(s).split('\n')
  let html = ''
  const stack = []   // danh sách đang mở: { indent, tag } — <li> cuối của mỗi cấp vẫn mở để chứa danh sách con
  const closeTo = indent => { while (stack.length && stack.at(-1).indent > indent) { html += `</li></${stack.pop().tag}>` } }
  const closeAll = () => closeTo(-1)
  for (const raw of lines) {
    const line = raw.replace(/\t/g, '  ').trimEnd()
    const m = line.match(/^(\s*)([-*•]|\d+[.)])\s+(.*)$/)
    if (m) {
      const indent = m[1].length, tag = /\d/.test(m[2]) ? 'ol' : 'ul', text = inline(m[3])
      closeTo(indent)
      const top = stack.at(-1)
      if (!top || indent > top.indent) { html += `<${tag}>`; stack.push({ indent, tag }) }          // mở danh sách (con)
      else if (top.tag !== tag) { html += `</li></${top.tag}><${tag}>`; stack.pop(); stack.push({ indent, tag }) }
      else html += '</li>'                                                                           // mục ngang cấp
      html += `<li>${text}`
      continue
    }
    closeAll()
    const h = line.match(/^#{2,4}\s+(.*)$/)
    if (h) html += `<h4>${inline(h[1])}</h4>`
    else if (line.trim()) html += `<p>${inline(line.trim())}</p>`
  }
  closeAll()
  return html
}
