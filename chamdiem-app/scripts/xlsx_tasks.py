"""Hàm dùng chung: đọc sheet chấm điểm (.xlsx) → công việc theo cấu trúc app (build-seed.py, import-makt.py)."""
import re, unicodedata, datetime

def norm(s):
    s = unicodedata.normalize('NFD', str(s or ''))
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').replace('đ', 'd').replace('Đ', 'd')
    return re.sub(r'\s+', ' ', s.replace('*', '')).strip().lower()

ALIAS = {
    'pbi': ['pbi', 'pbi (mang web)'], 'content': ['noi dung', 'tieu de', 'noi dung yeu cau'],
    'note': ['ghi chu', 'note', 'mo ta'], 'designLink': ['link thiet ke', 'link thiet ke local', 'link handoff'],
    'designStatus': ['trang thai thiet ke'], 'solutionBy': ['nguoi dua giai phap'], 'devmodeLink': ['link devmode'],
    'concept': ['concept'], 'pd': ['pd'], 'ba': ['ba', 'ba review'],
    'expectedDate': ['thoi han mong muon', 'ngay mong muon co thiet ke'], 'completedDate': ['ngay hoan thanh'],
    'complexity': ['do phuc tap nghiep vu', 'do kho'], 'main': ['so luong man hinh chinh', 'so luong man hinh'], 'sub': ['so luong man hinh phu'],
    'own': ['la du an phu trach'], 'platform': ['nen tang'], 'score': ['diem'],
    'rating': ['danh gia chat luong thiet ke va phoi hop cua pd'], 'final': ['diem sau danh gia'],
    'reason': ['ly do danh gia'],
}
CX = {'rat de': 'Rất đơn giản', 'de': 'Đơn giản', 'trung binh': 'Trung bình', 'kho': 'Phức tạp', 'rat kho': 'Rất phức tạp',
      'rat don gian': 'Rất đơn giản', 'don gian': 'Đơn giản', 'phuc tap': 'Phức tạp', 'rat phuc tap': 'Rất phức tạp'}
CXK = {'Rất đơn giản': 0.2, 'Đơn giản': 1, 'Trung bình': 1.2, 'Phức tạp': 1.5, 'Rất phức tạp': 1.8}
SOL = {0.5: 'BA', 1.0: 'PD và BA', 1.5: 'PD'}
STATUSES = ['Đang thực hiện', 'Chờ sửa thiết kế', 'Đã thiết kế', 'OK --> Chuyển Local', 'PD đã chuyển Local']
RATINGS = ['Rất hài lòng', 'Hài lòng', 'Không hài lòng']

def colmap(hdr):
    m = {}
    for i, h in enumerate(hdr):
        n = norm(h)
        for f, al in ALIAS.items():
            if f not in m and (n in al or (f == 'reason' and n.startswith('ly do danh gia'))):
                m[f] = i
    return m

def iso(v):
    if isinstance(v, datetime.datetime): return v.date().isoformat()
    if isinstance(v, str):
        mt = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4})$', v.strip())
        if mt: return f'{mt[3]}-{int(mt[2]):02d}-{int(mt[1]):02d}'
    return ''

def num(v):
    try: return float(v) if v not in (None, '') else 0
    except (TypeError, ValueError): return 0

def pick(options, v):
    return next((o for o in options if norm(o) == norm(v)), '')

def blocks_of(ws):
    rows = [[c for c in r] for r in ws.iter_rows(values_only=True)]
    # Dòng tiêu đề: dòng đầu tiên có cột "Nội dung" / "PBI" (có sheet để trống vài dòng trên cùng)
    hi = next((i for i, r in enumerate(rows) if any(norm(c) in ('noi dung', 'pbi', 'tieu de', 'noi dung yeu cau') for c in r)), 0)
    hdr = rows[hi]; hn = [norm(x) for x in hdr[:6]]
    out = [[]]
    for r in rows[hi + 1:]:
        if [norm(x) for x in r[:6]] == hn and any(hn): out.append([]); continue
        out[-1].append(r)
    return hdr, out

def to_task(r, m, project, iteration):
    g = lambda f: r[m[f]] if f in m and m[f] < len(r) else None
    content = str(g('content') or '').strip()
    pbi_raw = g('pbi')
    # Sheet vẫn đếm dòng không có tiêu đề nếu có PD + ngày hoàn thành → giữ lại, đặt tiêu đề tạm
    if not content:
        if not (str(g('pd') or '').strip() and iso(g('completedDate'))): return None
        content = f'(Chưa có tiêu đề) PBI {pbi_raw}' if pbi_raw else '(Chưa có tiêu đề)'
    cx = CX.get(norm(g('complexity')), '')
    own = pick(['Có', 'Không'], g('own'))
    plat = pick(['Web', 'Mobile'], g('platform'))
    main, sub = num(g('main')), num(g('sub'))
    sol = pick(['BA', 'PD và BA', 'PD'], g('solutionBy'))
    score = g('score')
    if not sol and isinstance(score, (int, float)) and score:       # suy ngược hệ số người đưa giải pháp từ cột Điểm
        base = CXK.get(cx, 0) * (main + 0.2 * sub) * {'Có': 1, 'Không': 1.2}.get(own, 0) * {'Web': 1, 'Mobile': 0.5}.get(plat, 0)
        sol = SOL.get(round(score / base, 3), '') if base else ''
    done = iso(g('completedDate'))
    status = pick(STATUSES, g('designStatus')) or ('Đã thiết kế' if done else 'Đang thực hiện')
    pbi = g('pbi')
    pbi = str(int(pbi)) if isinstance(pbi, float) and pbi.is_integer() else str(pbi or '')
    concept = '\n'.join(x for x in [str(g('concept') or '').strip(), str(g('note') or '').strip()] if x)
    final = g('final')
    # Cột Điểm trống nhưng Điểm sau đánh giá có số → điểm nhập tay
    manual = final if (not isinstance(score, (int, float)) and isinstance(final, (int, float)) and final) else ''
    return {
        'project': project, 'iteration': iteration, 'pbi': pbi, 'content': content,
        'designLink': str(g('designLink') or '').strip() if str(g('designLink') or '').startswith('http') else '',
        'designStatus': status, 'solutionBy': sol,
        'devmodeLink': str(g('devmodeLink') or '').strip() if str(g('devmodeLink') or '').startswith('http') else '',
        'concept': concept, 'pd': str(g('pd') or '').strip(), 'ba': str(g('ba') or '').strip(),
        'expectedDate': iso(g('expectedDate')), 'completedDate': done, 'complexity': cx,
        'mainScreens': main, 'subScreens': sub, 'isOwnProject': own, 'platform': plat,
        'qualityRating': pick(RATINGS, g('rating')), 'ratingReason': str(g('reason') or '').strip(), 'manualScore': manual,
        '_sheetScore': score if isinstance(score, (int, float)) else None,
        '_sheetFinal': g('final') if isinstance(g('final'), (int, float)) else None,
    }
