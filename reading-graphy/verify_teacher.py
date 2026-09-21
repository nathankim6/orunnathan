#!/usr/bin/env python3
"""교사용이 '맞는 선지'에 표시했는지 지면에서 확인한다.

표시한 개수만 세면 틀린 자리에 친 동그라미를 놓친다. 붉은 타원의 좌표를
선지 머리글자와 맞춰 어느 번호에 쳤는지 읽고, 정답과 대조한다.
"""
import re, sys, collections, pymupdf
import rebalance as R

RED = lambda c: c and abs(c[0]-0.80) < 0.03 and abs(c[1]-0.10) < 0.05
CIRC = '①②③④⑤'

def marked_choice(page):
    """붉은 타원이 덮은 선지 번호를 돌려준다."""
    ovals = []
    for dr in page.get_drawings():
        c = dr.get('color') or dr.get('fill')
        if RED(c):
            r = dr['rect']
            if r.width < 24 and r.height < 24: ovals.append(r)
    out = []
    for x0, y0, x1, y1, w, *_ in page.get_text('words'):
        ch = w.strip()[:1]
        if ch in CIRC:
            for r in ovals:
                if r.x0 - 6 < x0 and x1 < r.x1 + 6 and r.y0 - 6 < y0 and y1 < r.y1 + 6:
                    out.append((round(y0), ch)); break
    return out

def main(book, n):
    doc = pymupdf.open(f'{R.S}/out/옳은독해_READING_GRAPHY_{n}권_교사용.pdf')
    want = {}
    import glob, os
    for f in sorted(glob.glob(f'{R.S}/{book}/units/unit*.js')):
        src = R.normalize(open(f, encoding='utf-8').read()); key = src[src.index('renderExplain'):]
        u = os.path.basename(f)[4:6]
        for lbl, pat in (('01', r'독해\s*01[^·]*·\s*정답\s*([①-⑤])'),
                         ('02', r'독해\s*02[^·]*·\s*정답\s*([①-⑤])'),
                         ('03', r'독해\s*03[^·]*·\s*정답\s*([①-⑤])')):
            m = re.search(pat, key)
            if m: want[(u, lbl)] = m.group(1)
    bad = []; ok = 0
    for p in doc:
        t = p.get_text()
        if '제목으로 가장 적절한' not in t: continue
        mu = re.search(r'UNIT (\d{2})', t)
        if not mu: continue
        u = mu.group(1)
        marks = [c for _, c in sorted(marked_choice(p))]
        exp = [want.get((u, k)) for k in ('01', '02', '03')]
        exp = [e for e in exp if e]
        if marks[:len(exp)] == exp: ok += 1
        else: bad.append((f'{n}권 UNIT {u}', '표시 ' + ''.join(marks[:3]), '정답 ' + ''.join(exp)))
    print(f'{n}권: 맞게 표시된 유닛 {ok} · 어긋남 {len(bad)}')
    for b in bad[:6]: print('   ', b)
    return len(bad)

if __name__ == '__main__':
    tot = sum(main(b, n) for n, b in enumerate(('rg1','rg2','rg3','rg4'), 1))
    print('전체 어긋남:', tot)
