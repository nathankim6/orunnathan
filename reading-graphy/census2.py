#!/usr/bin/env python3
"""144개 유닛 전수 — 자리(위치)로 찍을 수 있는 모든 문항의 정답 분포."""
import re, glob, collections, os

S = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.')
HS = re.compile(r'\bHs?\("((?:[^"\\]|\\.)*)"\)')
unesc = lambda s: re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), s).replace('\\"', '"')

def parts(p):
    src = open(p, encoding='utf-8').read()
    i = src.index('renderExplain')
    key = '  '.join(unesc(m.group(1)) for m in HS.finditer(src[i:]))
    return src[:i], key                      # (본문 소스, 정답 패널)

FIELDS = [
    ('독해 01 제목',    r'독해\s*01[^·]*·\s*정답\s*([①-⑤])'),
    ('독해 02 불일치',  r'독해\s*02[^·]*·\s*정답\s*([①-⑤])'),
    ('독해 03 지칭',    r'독해\s*03[^·]*·\s*정답\s*([①-⑤])'),
    ('STEP 1-1 소재',  r'1-1\s*([①-⑤])'),
    ('STEP 2-3 흐름',  r'2-3\s*([①-⑤])'),
]
books = ('rg1', 'rg2', 'rg3', 'rg4')
files = sorted(glob.glob(f'{S}/rg*/units/unit*.js'))
assert len(files) == 144, f'유닛 {len(files)}개 — 144개가 아님'

tally = collections.defaultdict(lambda: collections.defaultdict(collections.Counter))
r1 = collections.defaultdict(collections.Counter)
r2first = collections.defaultdict(collections.Counter)
s33first = collections.defaultdict(collections.Counter)
step5 = collections.defaultdict(collections.Counter)
r4pos = collections.defaultdict(collections.Counter)

for f in files:
    b = f.split('/')[-3]
    body, key = parts(f)
    for name, pat in FIELDS:
        m = re.search(pat, key)
        if m: tally[name][b][m.group(1)] += 1
    m = re.search(r'R1[^·]*·\s*((?:[1-8]\s*[TF][\s·]*){6,8})', key)
    if m: r1[b][re.sub(r'\s+', '', m.group(1))] += 1
    m = re.search(r'R2[^·]*·\s*\(?([a-e])\)?\s*→', key)
    if m: r2first[b][m.group(1)] += 1
    m = re.search(r'3-3\s*\(?([a-e])\)?\s*→', key)
    if m: s33first[b][m.group(1)] += 1
    for mm in re.finditer(r'문장\s*\d+\s*([①-⑤])', key):
        step5[b][mm.group(1)] += 1
    # R4 — 지면의 ( A / B ) 중 정답이 앞칸인가 뒤칸인가
    ans = re.search(r'R4[^·]*·\s*(.+?)(?:  R5|$)', key)
    if ans:
        picks = re.findall(r'\(\d\)\s*([^()]+?)(?=\s*\(\d\)|\s*$)', ans.group(1))
        opts = re.findall(r'\(\s*([^()/]+?)\s*/\s*([^()/]+?)\s*\)', body)
        for pk, (o1, o2) in zip([p.strip() for p in picks], opts):
            if pk == o1.strip(): r4pos[b]['앞칸'] += 1
            elif pk == o2.strip(): r4pos[b]['뒤칸'] += 1

def line(title, d, total_note=''):
    print(f"\n■ {title}{total_note}")
    allc = collections.Counter()
    for b in books:
        c = d[b]; allc.update(c)
        s = sum(c.values())
        top = ' · '.join(f'{k}{v}' for k, v in c.most_common(6))
        print(f"   {b}: {top}   (계 {s})")
    s = sum(allc.values())
    mv, mn = allc.most_common(1)[0]
    print(f"   ▶ 합계 {s}문항 · 최빈 {mv} {mn}건 = {mn/s*100:.0f}%")

for name, _ in FIELDS: line(name, tally[name])
line('R2 첫 기호', r2first)
line('STEP 3-3 첫 기호', s33first)
line('STEP 5 선지', step5, ' (유닛당 4문항)')
line('R4 정답 자리', r4pos, ' (유닛당 4문항)')
print("\n■ R1 True/False 배열")
allr1 = collections.Counter()
for b in books:
    allr1.update(r1[b]); s = sum(r1[b].values())
    mv, mn = r1[b].most_common(1)[0]
    print(f"   {b}: 서로 다른 배열 {len(r1[b])}가지 · 최빈 {mv} {mn}건 (계 {s})")
s = sum(allr1.values()); mv, mn = allr1.most_common(1)[0]
print(f"   ▶ 합계 {s} · 최빈 {mv} {mn}건 = {mn/s*100:.0f}%")
