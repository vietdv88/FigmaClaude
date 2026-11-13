#!/usr/bin/env node
/* ═══ Trạng thái checklist phát hành của 1 app — mục ĐẠT rồi thì lần sau KHÔNG chạy lại ═══
   File trạng thái: <appDir>/.ui-release-checklist.json  { app, items: { <id>: { status, note, at } } }
   status: pass (Đạt) · fail (Chưa đạt) · na (Không áp dụng) · (chưa có = chưa kiểm tra)

   node checklist.mjs pending <appDir> [--all]        → các mục cần chạy (chưa kiểm / chưa đạt); --all = tất cả
   node checklist.mjs set <appDir> <id> <pass|fail|na> "<bằng chứng / ghi chú>"
   node checklist.mjs reset <appDir> <id|--all>        → bỏ trạng thái (để chạy lại mục đó)
   node checklist.mjs report <appDir>                  → ghi <appDir>/ui-release-checklist.md + .csv (dán vào Google Sheet) */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const { items } = JSON.parse(fs.readFileSync(path.join(here, '../references/checklist.json'), 'utf8'))
const [cmd, appDir = '.', ...rest] = process.argv.slice(2)
const file = path.join(appDir, '.ui-release-checklist.json')
const load = () => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { app: path.basename(path.resolve(appDir)), items: {} })
const save = st => fs.writeFileSync(file, JSON.stringify(st, null, 2) + '\n')
const LABEL = { pass: 'Đạt', fail: 'Chưa đạt', na: 'Không áp dụng' }
const MODE = { auto: 'Tự động', semi: 'Bán tự động (cần người xác nhận ảnh chụp)', manual: 'Thủ công' }

if (cmd === 'pending') {
  const st = load(), all = rest.includes('--all')
  const list = items.filter(i => all || st.items[i.id]?.status !== 'pass' && st.items[i.id]?.status !== 'na')
  if (!fs.existsSync(file)) save(st)
  const done = items.length - items.filter(i => !st.items[i.id] || st.items[i.id].status === 'fail').length
  console.log(`App ${st.app}: ${done}/${items.length} mục đã xong (Đạt / Không áp dụng) — còn ${list.length} mục cần chạy${all ? ' (--all: chạy lại tất cả)' : ''}\n`)
  let g = ''
  for (const i of list) {
    if (i.group !== g) { g = i.group; console.log(`## ${g}`) }
    const s = st.items[i.id]
    console.log(`- [${i.id}] ${i.item} · ${MODE[i.mode]}${s ? ` · lần trước: ${LABEL[s.status]} (${s.at.slice(0, 10)}) ${s.note}` : ''}\n    Kiểm tra: ${i.check || '—'}\n    Cách làm: ${i.method}${i.standard ? `\n    Quy chuẩn: ${i.standard}` : ''}`)
  }
} else if (cmd === 'set') {
  const [id, status, ...note] = rest
  if (!items.some(i => i.id === id)) throw new Error(`Không có mục “${id}” — xem references/checklist.json`)
  if (!LABEL[status]) throw new Error('Trạng thái phải là pass | fail | na')
  const st = load(); st.items[id] = { status, note: note.join(' '), at: new Date().toISOString() }; save(st)
  console.log(`✓ ${id}: ${LABEL[status]}`)
} else if (cmd === 'reset') {
  const st = load()
  if (rest[0] === '--all') st.items = {}; else delete st.items[rest[0]]
  save(st); console.log('✓ Đã bỏ trạng thái', rest[0])
} else if (cmd === 'report') {
  const st = load(), q = s => `"${String(s ?? '').replace(/"/g, '""')}"`
  let md = `# Checklist kiểm tra giao diện — ${st.app}\n\nCập nhật ${new Date().toISOString().slice(0, 10)} · ${items.filter(i => st.items[i.id]?.status === 'pass').length}/${items.length} Đạt\n\n| Nhóm | Mục | Trạng thái | Ghi chú / bằng chứng |\n|---|---|---|---|\n`
  let csv = 'Mục cần kiểm tra,Cách thức kiểm tra,Quy chuẩn,Trạng thái,Ghi chú\n'
  for (const i of items) {
    const s = st.items[i.id], lb = s ? LABEL[s.status] : 'Chưa kiểm tra'
    md += `| ${i.group} | ${i.item} | ${lb} | ${(s?.note || '').replace(/\|/g, '/')} |\n`
    csv += [i.item, i.check, i.standard, lb, s?.note || ''].map(q).join(',') + '\n'
  }
  fs.writeFileSync(path.join(appDir, 'ui-release-checklist.md'), md)
  fs.writeFileSync(path.join(appDir, 'ui-release-checklist.csv'), '﻿' + csv)
  console.log(`✓ Đã ghi ${path.join(appDir, 'ui-release-checklist.md')} và .csv`)
} else {
  console.log('Dùng: pending | set | reset | report — xem đầu file')
}
