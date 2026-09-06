"""학생용 PDF의 각 문항 위에 정답을 직접 표시해 교사용 PDF를 만든다."""
import os, re, sys
import pymupdf
from extract_answers import parse, extras
from mark_lib import Page
from mark_rules import RULES

S = os.path.dirname(os.path.abspath(__file__))

def unit_answers(book):
    """절대 면번호 → [(라벨, 정답), …]"""
    units = sorted(f for f in os.listdir(f'{S}/{book}/units') if re.fullmatch(r'unit\d+\.js', f))
    out, abs_pg = {}, 0
    for f in units:
        info = parse(f'{S}/{book}/units/{f}')
        merged = dict(info['pages'])
        for pg, lines in extras(f'{S}/{book}/units/{f}').items():
            merged.setdefault(pg, []).extend(lines)
        for pg, lines in merged.items():
            items = []
            for ln in lines:
                m = re.match(r'(문\s*\d+|구문 훈련|STEP [1-5]|R[1-7]|1-3|3-1|3-2|0[1-4])\s*(.*)$', ln)
                if m: items.append((m.group(1), m.group(2)))
            out.setdefault(abs_pg + pg, []).extend(items)
        abs_pg += 5 if info['short'] else 10
    return out

def build(book, out_path, only=None):
    doc = pymupdf.open(f'{S}/{book}/work/book.pdf')
    ans = unit_answers(book)
    marked = missed = 0
    detail = []
    for pgno, items in sorted(ans.items()):
        if only and pgno not in only: continue
        pg = Page(doc[pgno - 1])
        for label, val in items:
            fn = RULES.get(label) or (RULES.get('구문분석') if label.startswith('문') else None)
            if fn is None and re.match(r'문\s*\d+', label):
                from mark_rules import mark_syntax; fn = mark_syntax
            if fn is None:
                missed += 1; detail.append((pgno, label, 'no-rule')); continue
            try:
                k = fn(pg, label, val)
            except Exception as e:
                k = 0; detail.append((pgno, label, f'err:{e}'))
            if k: marked += 1
            else:
                missed += 1; detail.append((pgno, label, 'no-anchor'))
    doc.save(out_path, garbage=3, deflate=True)
    return marked, missed, detail

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'probe':
        m, x, d = build('rg4', f'{S}/out/_probe.pdf', only=set(range(1, 11)))
        print('표시', m, '실패', x)
        for r in d[:20]: print('  ', r)
    else:
        for n, b in [(1,'rg1'), (2,'rg2'), (3,'rg3'), (4,'rg4')]:
            out = f'{S}/out/옳은독해_READING_GRAPHY_{n}권_교사용.pdf'
            m, x, d = build(b, out)
            print(f'{n}권: 표시 {m}건, 미표시 {x}건')
            for r in d[:5]: print('    ', r)
