"""
Nhập các vòng lặp + công việc của dự án AMIS Kế toán từ 1.xlsx (mỗi sheet "MAKT …" = 1 vòng lặp).
Kết quả: file JSON { project, iterations, tasks, users } để nạp vào database (xem scripts/apply-import.cjs).

Chạy:  python3 -m venv .venv && .venv/bin/pip install openpyxl && .venv/bin/python scripts/import-makt.py <out.json>
"""
import sys, os, json, re, collections, openpyxl
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xlsx_tasks import norm, colmap, to_task, blocks_of

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'makt-import.json')
wb = openpyxl.load_workbook(os.path.join(ROOT, '1.xlsx'), data_only=True)

# Sheet vòng lặp của MAKT: "MAKT (R98)", "MAKT SP18 (R88)"… (bỏ sheet HTX / AIO / quy tắc)
sheets = [n for n in wb.sheetnames if re.match(r'^MAKT\b.*\(R\d+\)$', n)]
rnum = lambda n: int(re.search(r'\(R(\d+)\)', n).group(1))
sheets.sort(key=rnum)

raw, per_sheet = [], {}
for name in sheets:
    hdr, blocks = blocks_of(wb[name]); m = colmap(hdr)
    ts = [t for b in blocks for t in (to_task(r, m, 'MAKT', name) for r in b) if t]
    per_sheet[name] = len(ts); raw += ts

# Người dùng theo tên trong cột PD / BA (chưa mời, chưa có Gmail — Quản trị điền Gmail rồi mời sau)
users, by_code = [], {}
def add_user(code, role):
    k = norm(code)
    if not k or k in ('-', '--', 'khac', 'pm') or k in by_code: return   # 'PM' là vai trò, không phải người
    u = {'id': 'u_' + re.sub(r'[^a-z0-9]', '', k), 'code': code, 'name': code, 'email': '', 'companyEmail': '', 'role': role, 'status': 'none', 'target': 0}
    users.append(u); by_code[k] = u
for t in raw: add_user(t['pd'], 'PD')
for t in raw: add_user(t['ba'], 'BA')

# Vòng lặp: khoảng ngày suy ra từ ngày hoàn thành / thời hạn của công việc trong sheet
iterations, iid = [], {}
for name in sheets:
    ts = [t for t in raw if t['iteration'] == name]
    # Ưu tiên ngày hoàn thành (thời hạn mong muốn hay ghi lệch); không có thì mới dùng thời hạn
    dates = sorted(t['completedDate'] for t in ts if t['completedDate']) or sorted(t['expectedDate'] for t in ts if t['expectedDate'])
    i = {'id': 'i_makt_r' + str(rnum(name)), 'projectId': 'p_makt', 'name': name,
         'startDate': dates[0] if dates else '', 'endDate': dates[-1] if dates else ''}
    iterations.append(i); iid[name] = i['id']
# Vòng lặp không có ngày nào → đặt vào khoảng trống giữa vòng trước và vòng sau (giữ đúng thứ tự)
import datetime as _dt
d = lambda s, n: (_dt.date.fromisoformat(s) + _dt.timedelta(days=n)).isoformat()
# Vòng lặp xếp theo số R: ngày bắt đầu không sớm hơn ngày kết thúc vòng trước (việc chuyển từ vòng cũ hay mang ngày cũ)
for k in range(1, len(iterations)):
    prev_end, cur = iterations[k - 1]['endDate'], iterations[k]
    if prev_end and cur['startDate'] and cur['startDate'] < prev_end and (not cur['endDate'] or cur['endDate'] > prev_end):
        cur['startDate'] = d(prev_end, 1) if cur['endDate'] > prev_end else prev_end
for k, i in enumerate(iterations):
    if i['startDate']: continue
    prev = next((x['endDate'] for x in reversed(iterations[:k]) if x['endDate']), '')
    nxt = next((x['startDate'] for x in iterations[k + 1:] if x['startDate']), '')
    if prev: i['startDate'] = d(prev, 1)
    if nxt: i['endDate'] = d(nxt, -1)

tasks = []
for n, t in enumerate(raw):
    pd, ba = by_code.get(norm(t['pd'])), by_code.get(norm(t['ba']))
    task = {k: v for k, v in t.items() if k not in ('project', 'iteration', 'pd', 'ba', '_sheetScore', '_sheetFinal')}
    task.update({'id': f't_makt_{n + 1}', 'projectId': 'p_makt', 'iterationId': iid[t['iteration']],
                 'pdId': pd['id'] if pd else '', 'baId': ba['id'] if ba else ''})
    tasks.append(task)

project = {'id': 'p_makt', 'code': 'MAKT', 'name': 'MISA AMIS Kế toán', 'description': '',
           'divisionName': 'Khối sản phẩm Doanh nghiệp', 'memberIds': [u['id'] for u in users]}
json.dump({'project': project, 'iterations': iterations, 'tasks': tasks, 'users': users}, open(OUT, 'w'), ensure_ascii=False, indent=1)

print(f'{len(sheets)} vòng lặp · {len(tasks)} công việc · {len(users)} người ({sum(u["role"] == "PD" for u in users)} PD, {sum(u["role"] == "BA" for u in users)} BA)')
for name in sheets: print(f'  {name:18} {per_sheet[name]:3} việc  {next(i for i in iterations if i["name"] == name)["startDate"]} → {next(i for i in iterations if i["name"] == name)["endDate"]}')
noPd = sum(1 for t in tasks if not t['pdId']); print(f'Việc chưa có PD: {noPd} · chưa có ngày hoàn thành: {sum(1 for t in tasks if not t["completedDate"])}')
print('PD:', ', '.join(u['code'] for u in users if u['role'] == 'PD'))
print('BA:', ', '.join(u['code'] for u in users if u['role'] == 'BA'))
