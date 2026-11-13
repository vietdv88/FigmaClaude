"""
Dựng dữ liệu khởi tạo cho app từ 2 file chấm điểm (Google Sheet tải về .xlsx):
  1.xlsx — chi tiết công việc từng vòng lặp (dự án MAKT), có công thức cột Điểm
  2.xlsx — tổng hợp điểm tháng (sheet "Tháng 8") + bản sao dữ liệu các dự án
Kết quả: src/store/seed-real.json

Chạy:  python3 -m venv .venv && .venv/bin/pip install openpyxl && .venv/bin/python scripts/build-seed.py
"""
import openpyxl, json, re, unicodedata, datetime, collections, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F1, F2 = os.path.join(ROOT, '1.xlsx'), os.path.join(ROOT, '2.xlsx')
OUT = os.path.join(ROOT, 'src', 'store', 'seed-real.json')

import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xlsx_tasks import *   # norm, colmap, to_task, blocks_of, iso, num, pick…

wb2 = openpyxl.load_workbook(F2, data_only=True)
cfg = wb2['Tháng 8']
year = 2026; month = int(cfg['A2'].value); ym = f'{year}-{month:02d}'

# ── Dự án (sheet "Tháng 8", cột L..T) ──
PROJ_SHEET = {'MAKT': 'MAKT', 'Mua hàng': 'MuaHang', 'Kho': 'Kho', 'Meinvoice': 'Meinvoice', 'QTSX': 'QTSX', 'Kiểm toán': 'KiemToan'}
PROJ_NAME  = {'MAKT': 'MISA AMIS Kế toán (MAKT)', 'Mua hàng': 'Mua hàng', 'Kho': 'Kho', 'Meinvoice': 'meInvoice', 'QTSX': 'Quản trị sản xuất (QTSX)', 'Kiểm toán': 'Kiểm toán'}
projects, iter_names = [], {}
for r in range(2, 20):
    code = cfg.cell(r, 12).value
    if code not in PROJ_SHEET: continue
    iter_names[code] = [cfg.cell(r, c).value for c in range(14, 21) if cfg.cell(r, c).value]
    projects.append({'id': 'p_' + norm(code).replace(' ', ''), 'code': code, 'name': PROJ_NAME[code],
                     'description': '', 'memberIds': []})
pid = {p['code']: p['id'] for p in projects}

# ── Công việc tháng 8: bản sao dữ liệu các dự án trong file 2 ──
raw = []
for code, sheet in PROJ_SHEET.items():
    hdr, blocks = blocks_of(wb2[sheet]); m = colmap(hdr)
    for bi, b in enumerate(blocks):
        it = iter_names[code][bi] if bi < len(iter_names[code]) else f'Khối {bi + 1}'
        raw += [t for t in (to_task(r, m, code, it) for r in b) if t]

# ── Vòng lặp hiện tại của MAKT (file 1, sheet mới nhất) ──
wb1 = openpyxl.load_workbook(F1, data_only=True)
for sheet in ['MAKT (R98)']:
    ws = wb1[sheet]; hdr = [c.value for c in ws[1]]; m = colmap(hdr)
    raw += [t for t in (to_task(r, m, 'MAKT', sheet) for r in ws.iter_rows(min_row=2, values_only=True)) if t]

# ── Người dùng ──
PRIMARY = {'kiem toan': 'Kiểm toán', 'meinvoice + inbot + mtax': 'Meinvoice', 'kho': 'Kho', 'san xuat': 'QTSX', 'mua hang': 'Mua hàng'}
users = [{'id': 'u_admin', 'code': 'admin', 'name': 'Quản trị hệ thống', 'email': 'admin@congty.vn', 'role': 'admin'}]
by_code = {}
def add_user(code, role, **kw):
    k = norm(code)
    if not k or k in ('-', '--'): return None
    if k in by_code: return by_code[k]
    u = {'id': 'u_' + re.sub(r'[^a-z0-9]', '', k), 'code': code, 'name': code, 'email': '', 'role': role, **kw}
    users.append(u); by_code[k] = u
    return u

month_people = {}
for r in range(6, 60):
    code = cfg.cell(r, 1).value
    if not code: continue
    prim = PRIMARY.get(norm(cfg.cell(r, 10).value))
    u = add_user(code, 'PD', target=num(cfg.cell(r, 6).value), primaryProjectId=pid.get(prim, ''))
    month_people[u['id']] = {'actualDays': num(cfg.cell(r, 5).value), 'effort': num(cfg.cell(r, 7).value), 'target': num(cfg.cell(r, 6).value)}
    month_people[u['id']]['_sheet'] = {'score': cfg.cell(r, 2).value, 'screens': cfg.cell(r, 3).value, 'pbis': cfg.cell(r, 4).value, 'rate': cfg.cell(r, 9).value}

for t in raw:
    if t['pd']: add_user(t['pd'], 'PD', target=0, primaryProjectId='')
for t in raw:
    if t['ba'] and norm(t['ba']) not in by_code and norm(t['ba']) not in ('khac',): add_user(t['ba'], 'BA')
# PD chưa có dự án phụ trách → dự án có nhiều việc nhất
cnt = collections.Counter((norm(t['pd']), t['project']) for t in raw if t['pd'])
for u in users:
    if u['role'] == 'PD' and not u.get('primaryProjectId'):
        best = max(((p, n) for (c, p), n in cnt.items() if c == norm(u['code'])), key=lambda x: x[1], default=(None, 0))[0]
        u['primaryProjectId'] = pid.get(best, '')

# ── Vòng lặp: khoảng ngày suy ra từ ngày hoàn thành / thời hạn của công việc ──
iterations, iid = [], {}
groups = collections.OrderedDict()
for t in raw: groups.setdefault((t['project'], t['iteration']), []).append(t)
for (code, name), ts in groups.items():
    dates = sorted(d for t in ts for d in (t['completedDate'], t['expectedDate']) if d)
    start = dates[0] if dates else f'{ym}-01'
    end = dates[-1] if dates else f'{ym}-28'
    i = {'id': 'i_' + re.sub(r'[^a-z0-9]', '', norm(code + name))[:24], 'projectId': pid[code], 'name': name, 'startDate': start, 'endDate': end}
    iterations.append(i); iid[(code, name)] = i['id']

# ── Gắn id, thành viên dự án ──
tasks = []
members = collections.defaultdict(set)
for n, t in enumerate(raw):
    pd = by_code.get(norm(t['pd'])); ba = by_code.get(norm(t['ba']))
    p = pid[t['project']]
    if pd: members[p].add(pd['id'])
    if ba: members[p].add(ba['id'])
    task = {k: v for k, v in t.items() if k not in ('project', 'iteration', 'pd', 'ba', '_sheetScore', '_sheetFinal')}
    task.update({'id': f't{n + 1}', 'projectId': p, 'iterationId': iid[(t['project'], t['iteration'])],
                 'pdId': pd['id'] if pd else '', 'baId': ba['id'] if ba else '', 'createdBy': 'u_admin'})
    tasks.append(task)
for u in users:
    if u.get('primaryProjectId'): members[u['primaryProjectId']].add(u['id'])
for p in projects: p['memberIds'] = sorted(members[p['id']])

seed = {
    'users': users, 'projects': projects, 'iterations': iterations, 'tasks': tasks,
    'monthSettings': {ym: {'holidays': num(cfg['D2'].value), 'people': {k: {kk: vv for kk, vv in v.items() if kk != '_sheet'} for k, v in month_people.items()}}},
}
json.dump(seed, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(f'{len(users)} người dùng ({sum(u["role"]=="PD" for u in users)} PD, {sum(u["role"]=="BA" for u in users)} BA) · '
      f'{len(projects)} dự án · {len(iterations)} vòng lặp · {len(tasks)} công việc → {OUT}')
