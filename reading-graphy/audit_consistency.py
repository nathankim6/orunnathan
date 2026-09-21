#!/usr/bin/env python3
"""한 유닛 안의 정답 표기가 모두 일치하는지 대조한다.

정답은 세 곳에 실린다 — 해설 첫 면의 「정답 한눈에」 패널, 각 문항의 Hs 머리글,
그리고 해설 본문. 셋이 어긋나면 학생과 교사가 서로 다른 답을 본다.
"""
import re, glob, os, sys, collections
import rebalance as R

CIR = R.CIR

def panel_answers(key):
    """요약 패널의 '01 ①' 꼴 표기를 읽는다 — 라벨 런과 값 런이 나뉘어 있다."""
    out = {}
    for m in re.finditer(r't\("(0[1-3]|1-1|2-3)\s*"[^)]*\),\s*t\("\s*([①-⑤])', key):
        out.setdefault(m.group(1), m.group(2))
    m = re.search(r't\("04\s*"[^)]*\),\s*t\("((?:[^"\\]|\\.)*)"', key)   # 04 는 문장형 답
    if m: out['04'] = m.group(1).strip()
    for lbl, pat in (('R1', r't\("R1 "[^)]*\),\s*t\("((?:[^"\\]|\\.)*)"'),
                     ('R2', r't\("R2 "[^)]*\),\s*t\("((?:[^"\\]|\\.)*)"')):
        m = re.search(pat, key)
        if m: out[lbl] = re.sub(r'\s+', '', m.group(1))
    return out

def detail_answers(key):
    """Hs 머리글의 정답을 읽는다."""
    out = {}
    for lbl, pat in (('01', r'독해\s*01[^·]*·\s*정답\s*([①-⑤])'),
                     ('02', r'독해\s*02[^·]*·\s*정답\s*([①-⑤])'),
                     ('03', r'독해\s*03[^·]*·\s*정답\s*([①-⑤])'),
                     ('1-1', r'Hs\("STEP 1[^"]*1-1\s*([①-⑤])'),
                     ('2-3', r'Hs\("STEP 2[^"]*2-3\s*([①-⑤])'),
                     ('04', r'Hs\("독해 04[^·]*·\s*((?:[^"\\]|\\.)*)"\)')):
        m = re.search(pat, key)
        if m: out[lbl] = m.group(1).strip()
    for lbl in ('R1', 'R2'):
        hs = [h for h in re.findall(r'Hs\("((?:[^"\\]|\\.)*)"\)', key) if h.startswith(lbl + ' ')]
        if hs and '·' in hs[0]:
            out[lbl] = re.sub(r'\s+', '', hs[0].split('·', 1)[1])
    return out

def main(files):
    bad = collections.Counter(); detail = []
    for f in sorted(files):
        src = R.normalize(open(f, encoding='utf-8').read())
        key = src[src.index('renderExplain'):]
        rel = '/'.join(f.split('/')[-3:]).replace('units/', '')
        pa, da = panel_answers(key), detail_answers(key)
        for k in sorted(set(pa) & set(da)):
            if pa[k] != da[k]:
                bad[k] += 1
                if len(detail) < 12: detail.append((rel, k, f'패널 {pa[k]}', f'해설 {da[k]}'))
    print('패널 ↔ 해설 불일치:', dict(bad) or '없음')
    for d in detail: print('   ', d)
    print('총', sum(bad.values()), '건')

if __name__ == '__main__':
    main(sys.argv[1:] or glob.glob(f'{R.S}/rg*/units/unit*.js'))
