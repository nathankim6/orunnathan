"""문항 유형별 정답 표시 규칙. 각 함수는 (Page, 정답 문자열)을 받아 표시한 개수를 돌려준다."""
import re
from mark_lib import Page, CIRCLED

def _choice_rects(pg, ymin, ymax, xmax=90):
    """선지 머리글자(①~⑤)의 상자를 순서대로."""
    out = {}
    for x0, y0, x1, y1, t in pg.lines:
        if y0 < ymin or y0 > ymax or x0 > xmax: continue
        c = t.strip()[:1]
        if c in CIRCLED and c not in out:
            out[c] = (x0, y0, x0 + 8.5, y1)
    return out

def mark_reading_choice(pg, label, val):
    """독해 01·02·03 — 정답 선지에 붉은 타원."""
    ch = next((c for c in val if c in CIRCLED), None)
    if not ch: return 0
    head = pg.line_starting(label, xmax=75)
    if not head: return 0
    ys = sorted(y0 for x0, y0, _, _, t in pg.lines
                if t[:2] in ('01', '02', '03', '04') and x0 <= 75 and y0 > head[1] + 1)
    ymax = ys[0] if ys else head[1] + 200
    r = _choice_rects(pg, head[1], ymax).get(ch)
    if not r: return 0
    pg.ellipse(r)
    return 1

def mark_reading_write(pg, label, val):
    """독해 04 — 배열 영작 정답을 <보기> 상자 아래에 쓴다."""
    bogi = pg.line_starting('보기', ymin=600)
    if not bogi: return 0
    pg.text_fit(bogi[0], bogi[3] + 13, val, width=470)
    return 1

def mark_step1(pg, label, val):
    """STEP 1 — 1-1 선지 타원, 1-2 핵심어 카드 타원."""
    n = 0
    m = re.search(r'1-1\s*([①-⑩])', val)
    h1 = pg.line_starting('1-1', xmax=75)
    h2 = pg.line_starting('1-2', xmax=75)
    if m and h1:
        r = _choice_rects(pg, h1[1], (h2[1] if h2 else h1[1] + 120)).get(m.group(1))
        if r: pg.ellipse(r); n += 1
    m2 = re.search(r'1-2\s*([^\n]+?)(?:\s{2,}|$|1-3)', val)
    if m2 and h2:
        h3 = pg.line_starting('1-3', xmax=75)
        ylo, yhi = h2[1], (h3[1] if h3 else h2[1] + 140)
        for w in [x.strip() for x in m2.group(1).split('·')]:
            if not w: continue
            for x0, y0, x1, y1, t in pg.lines:
                if ylo < y0 < yhi and t.strip() == w:
                    pg.ellipse((x0, y0, x1, y1), pad=3.5); n += 1; break
    return n

def mark_step2(pg, label, val):
    """STEP 2 — 2-1 연결어 칩 타원, 2-2 흐름 빈칸 채우기, 2-3 선지 타원."""
    n = 0
    h21, h22 = pg.line_starting('2-1', xmax=75), pg.line_starting('2-2', xmax=75)
    m = re.search(r'2-1\s*(.+?)\s+2-2', val) or re.search(r'2-1\s*(.+)$', val)
    if m and h21:
        picks = [x.strip() for x in m.group(1).split('·') if x.strip()]
        rows = {}
        for x0, y0, x1, y1, t in pg.lines:
            if h21[1] < y0 < (h22[1] if h22 else 1e9) and x0 > 400:
                rows.setdefault(round(y0, 0), []).append((x0, y0, x1, y1, t.strip()))
        for pick, y in zip(picks, sorted(rows)):
            for x0, y0, x1, y1, t in rows[y]:
                if t == pick:
                    pg.ellipse((x0, y0, x1, y1), pad=3.5); n += 1; break
    m = re.search(r'2-2\s*(.+?)\s+2-3', val) or re.search(r'2-2\s*(.+)$', val)
    if m and h22:
        for seg in m.group(1).split('·'):
            mm = re.search(r'\[([A-E])\]\s*(\S+)', seg.strip())
            if not mm: continue
            lab = pg.line_containing(f'[{mm.group(1)}]', ymin=h22[1] + 120)
            if lab: pg.text(lab[0] - 2, lab[3] + 12, mm.group(2), 7.6); n += 1
    m = re.search(r'2-3\s*([①-⑩])', val)
    h23 = pg.line_starting('2-3', xmax=75)
    if m and h23:
        r = _choice_rects(pg, h23[1], h23[1] + 130).get(m.group(1))
        if r: pg.ellipse(r); n += 1
    return n

def _empty_parens(pg, ymin, ymax, same_y=None):
    """비어 있는 괄호 칸만 왼쪽부터 돌려준다(미리 채워진 칸은 건너뛴다)."""
    out = []
    for x0, y0, x1, y1, t in pg.lines:
        if same_y is not None and abs(y0 - same_y) > 6: continue
        if not (ymin <= y0 <= ymax): continue
        tt = t.strip()
        if re.fullmatch(r'[→\s]*\(\s+\)[→\s]*', tt) and '(' in tt:
            lead = 9.6 if tt.startswith('→') else 0.0   # 앞의 화살표 폭만큼 밀어 준다
            out.append((x0 + lead, y0, x1, y1))
    out.sort(key=lambda r: r[0])
    return out

def mark_step3(pg, label, val):
    """STEP 3 — 3-3 빈 괄호에 기호를, 그 아래에 완성 문장을 쓴다."""
    m = re.search(r'3-3\s*(.+?)\s*·\s*(.+)$', val)
    if not m: return 0
    picks = re.findall(r'\(([a-e])\)', m.group(1))
    sent = m.group(2).strip()
    line = pg.line_starting('순서', ymin=600)
    if not line: return 0
    cells = _empty_parens(pg, 0, 1e9, same_y=line[1])
    n = 0
    for pk, c in zip(picks[len(picks) - len(cells):], cells):
        pg.text(c[0] + (c[2] - c[0]) / 2 - 5, c[3] - 2, f'({pk})', 8.2); n += 1
    pg.text_fit(line[0], line[3] + 14, sent, width=430, size=7.0); n += 1
    return n

def _clean(v):
    """(n) 뒤에 딸려온 설명 문장을 잘라 답만 남긴다."""
    v = v.strip()
    v = re.split(r'[.·]\s|\s{2,}|\s넣으면|\s—', v)[0]
    return ' '.join(v.split()[:4]).strip(' .,')

def _fill_blanks(pg, val, ymin, ymax, size=7.4):
    """(1) 값 (2) 값 … 을 순서대로 빈칸 위에 쓴다."""
    vals = [(n, _clean(v)) for n, v in re.findall(r'\((\d+)\)\s*([^(]+)', val)]
    blanks = pg.blanks(ymin=ymin, ymax=ymax)
    n = 0
    for (_, v), b in zip(vals, blanks):
        x0, y0, x1, y1 = b
        pg.text_fit(x0 + 1, y0 + (y1 - y0) * 0.78, v.strip(), width=(x1 - x0) - 2, size=size)
        n += 1
    return n

def mark_step4(pg, label, val):
    h = pg.line_starting('보기', xmax=260) or pg.line_containing('보기')
    return _fill_blanks(pg, val, ymin=(h[1] if h else 200), ymax=(h[1] + 150 if h else 420))

def mark_step5(pg, label, val):
    """STEP 5 — 문장별 정답 선지에 타원(무표시가 정답인 유형이라 정답만 표시)."""
    n = 0
    for sn, ch in re.findall(r'문장\s*(\d+)\s*([①-⑩])', val):
        head = None
        for x0, y0, x1, y1, t in pg.lines:
            if re.match(rf'문장\s*{sn}\b', t) and y0 > 380:
                head = (x0, y0, x1, y1); break
        if not head: continue
        col_lo, col_hi = head[0] - 12, head[0] + 250
        for x0, y0, x1, y1, t in pg.lines:
            if y0 <= head[1] or y0 > head[1] + 62: continue
            if not (col_lo <= x0 <= col_hi): continue
            if t.strip()[:1] == ch:
                pg.ellipse((x0, y0, x0 + 8.5, y1)); n += 1; break
    return n

def mark_r1(pg, label, val):
    """R1 — 각 행의 T·F 중 정답에 타원."""
    picks = re.findall(r'(\d+)\s*([TF])', val)
    rows = {}
    for x0, y0, x1, y1, w in pg.boxes(xmin=380):
        rows.setdefault(round(y0, 0), []).append((x0, y0, x1, y1))
    ys = sorted(rows)
    n = 0
    for (_, tf), y in zip(picks, ys):
        cells = sorted(rows[y])
        if len(cells) < 2: continue
        x0, y0, x1, y1 = cells[0 if tf == 'T' else 1]
        pg.ellipse((x0, y0, x1, y1), pad=1.4); n += 1
    return n

def mark_r2(pg, label, val):
    """R2 — 순서 답란의 빈 괄호마다 기호를 쓴다."""
    picks = re.findall(r'\(([a-d])\)', val)
    if not picks: return 0
    cells = _empty_parens(pg, 400, 1e9)
    n = 0
    for pk, c in zip(picks[len(picks) - len(cells):], cells):
        pg.text(c[0] + (c[2] - c[0]) / 2 - 5, c[3] - 2, f'({pk})', 8.4); n += 1
    return n

def mark_r3(pg, label, val):
    """R3 — 어휘별 답 괄호에 기호를 쓴다."""
    picks = [p for _, p in re.findall(r'(\d+)\s*\(([a-f])\)', val)]
    if not picks:
        picks = re.findall(r'\(([a-f])\)', val)
    cands = []
    for x0, y0, x1, y1, t in pg.lines:
        if re.fullmatch(r'\(\s*\)', t.replace(' ', ' ').strip()) or re.fullmatch(r'\(\s+\)', t.strip()):
            cands.append((x0, y0, x1, y1))
    if not cands:
        for x0, y0, x1, y1, w, *_ in pg.words:
            if w.strip() == '(' and 200 < x0 < 330:
                cands.append((x0, y0, x1 + 22, y1))
    cands.sort(key=lambda r: r[1])
    n = 0
    for p, c in zip(picks, cands):
        pg.text(c[0] + (c[2] - c[0]) / 2 - 3, c[3] - 1.5, f'({p})', 7.6); n += 1
    return n

def mark_r4(pg, label, val):
    """R4 — 괄호 속 정답에 밑줄. 여러 낱말 정답은 이어진 낱말만 묶는다."""
    vals = [_clean(v) for _, v in re.findall(r'\((\d+)\)\s*([^(]+)', val)]
    n = 0
    for i, v in enumerate(vals, start=1):
        head = pg.line_starting(f'({i})', xmax=95)
        if not head or not v: continue
        toks = v.split()
        row = sorted((w for w in pg.words if abs(w[1] - head[1]) <= 12), key=lambda w: w[0])
        norm = [w[4].strip().strip('()/') for w in row]
        hit = None
        for j in range(len(row) - len(toks) + 1):
            if norm[j:j + len(toks)] == toks:      # 이어진 낱말이 정답과 정확히 일치
                hit = (row[j][0], row[j][1], row[j + len(toks) - 1][2], row[j][3]); break
        if hit:
            pg.underline(hit); n += 1
    return n

def mark_r5(pg, label, val):
    h = pg.line_containing('보기', ymin=60)
    return _fill_blanks(pg, val, ymin=(h[1] if h else 90), ymax=(h[1] + 330 if h else 420), size=6.6)

def mark_r7(pg, label, val):
    """R7 — 각 문항의 <보기> 아래 필기란에 정답 문장을 쓴다."""
    parts = re.findall(r'\((\d+)\)\s*(.+?)(?=\s*\(\d\)\s|$)', val)
    bogis = [l for l in pg.lines if l[4].startswith('보기') and l[1] > 400]
    n = 0
    for (_, sent), b in zip(parts, bogis):
        pg.text_fit(b[0], b[3] + 16, sent.strip(), width=440, size=7.0); n += 1
    return n

def mark_syntax(pg, label, val):
    """구문분석 문N — 해당 훈련 문장 아래에 뼈대를 쓴다."""
    m = re.match(r'문\s*(\d+)', label)
    if not m: return 0
    sn = m.group(1)
    for x0, y0, x1, y1, t in pg.lines:
        if re.match(rf'문장\s*{sn}\b', t) and y0 > 300:
            pg.text_fit(x0, y1 + 12, val.strip(), width=440, size=6.8)
            return 1
    return 0

def mark_syntax_train(pg, label, val):
    """구문 훈련 — (1)(2)(3) 해석을 각 문장 아래 필기란에 쓴다."""
    parts = [v.strip() for _, v in re.findall(r'\((\d)\)\s*([^(]+)', val)]
    heads = [l for l in pg.lines if re.match(r'\(\d\)\s*\[', l[4])]
    n = 0
    for v, h in zip(parts, heads):
        pg.text_fit(h[0] + 4, h[3] + 13, v, width=430, size=7.0); n += 1
    return n

RULES = {
    '01': mark_reading_choice, '02': mark_reading_choice, '03': mark_reading_choice,
    '04': mark_reading_write,
    'STEP 1': mark_step1, 'STEP 2': mark_step2, 'STEP 3': mark_step3,
    'STEP 4': mark_step4, 'STEP 5': mark_step5,
    'R1': mark_r1, 'R2': mark_r2, 'R3': mark_r3, 'R4': mark_r4,
    'R5': mark_r5, 'R7': mark_r7,
    '구문 훈련': mark_syntax_train,
}


def mark_step3_frame(pg, label, val):
    """3-2 뼈대 채우기 — 주제문 뼈대의 빈칸을 채운다."""
    h = pg.line_starting('3-2', xmax=75)
    h3 = pg.line_starting('3-3', xmax=75)
    return _fill_blanks(pg, val, ymin=(h[1] if h else 400),
                        ymax=(h3[1] if h3 else 620), size=7.6)

def mark_r6(pg, label, val):
    """R6 — 해석 쓰기 모범 답안을 필기란에 쓴다."""
    parts = re.findall(r'\((\d)\)\s*(.+?)(?=\s*\(\d\)\s|$)', val)
    heads = [l for l in pg.lines if re.match(r'\(\d\)\s+문장', l[4])]
    n = 0
    for (_, sent), h in zip(parts, heads):
        pg.text_fit(h[0] + 4, h[3] + 15, sent.strip(), width=450, size=7.0); n += 1
    return n

def _mark_chip_pairs(pg, text, ylo, yhi, xmin=0):
    """칩 쌍마다 해설에서 '<칩 문구>에 ○'로 지목된 것 하나에만 타원을 친다.

    해설 산문에서 정답을 뽑아내는 대신, 지면의 칩 문구를 해설에 대조한다.
    한 쌍에서 정답이 하나로 확정될 때만 표시하므로 오표시가 나지 않는다.
    """
    rows = {}
    for x0, y0, x1, y1, t in pg.lines:
        if not (ylo < y0 < yhi) or x0 < xmin: continue
        rows.setdefault(round(y0, 0), []).append((x0, y0, x1, y1, t.strip()))
    n = 0
    for y in sorted(rows):
        cells = sorted(rows[y])
        if len(cells) < 2: continue
        hit = [c for c in cells
               if c[4] and re.search(re.escape(c[4]) + r'\s*에\s*○', text)]
        if len(hit) == 1:
            pg.ellipse(hit[0][:4], pad=3.2); n += 1
    return n

def mark_deixis(pg, label, val):
    """1-3 지시어 — 해설이 지목한 칩에 타원."""
    h = pg.line_starting('1-3', xmax=75)
    if not h: return 0
    return _mark_chip_pairs(pg, val, h[1], h[1] + 320, xmin=150)

def mark_step3_material(pg, label, val):
    """3-1 재료 찾기 — 해설이 지목한 칩에 타원."""
    h = pg.line_starting('3-1', xmax=75)
    h2 = pg.line_starting('3-2', xmax=75)
    if not h: return 0
    return _mark_chip_pairs(pg, val, h[1], (h2[1] if h2 else h[1] + 320), xmin=150)

RULES['3-2'] = mark_step3_frame
RULES['R6'] = mark_r6
RULES['1-3'] = mark_deixis
RULES['3-1'] = mark_step3_material
