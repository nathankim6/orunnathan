#!/usr/bin/env python3
"""정답 자리가 비어 있는 항목을 찾는다.

'독해 04   배열 영작' 처럼 라벨만 있고 답이 없거나, '1-2 ·' 처럼 값이 빠진 곳.
패널에는 답이 있는데 해설에 없으면 학생이 해설에서 답을 못 찾는다.
"""
import re, glob, sys, collections
import rebalance as R

def main(files):
    bad = collections.Counter(); detail = []
    for f in sorted(files):
        src = R.normalize(open(f, encoding='utf-8').read())
        key = src[src.index('renderExplain'):]
        rel = '/'.join(f.split('/')[-3:]).replace('units/', '')
        for h in re.findall(r'Hs\("((?:[^"\\]|\\.)*)"\)', key):
            lbl = re.split(r'\s{2,}', h.strip())[0]
            if '·' not in h:
                bad['답 없음'] += 1
                if len(detail) < 20: detail.append((rel, lbl, h.strip()[:46]))
                continue
            val = h.split('·', 1)[1]
            # 하위 항목(1-2 · 2-2 …)이 값 없이 비어 있는지
            for m in re.finditer(r'(\d-\d)\s*((?:(?!\d-\d).)*)', val):
                if not m.group(2).strip(' ·'):
                    bad['하위 항목 빔'] += 1
                    if len(detail) < 20: detail.append((rel, m.group(1), h.strip()[:46]))
    print('빈 정답 항목:', dict(bad) or '없음')
    for d in detail: print('   ', d)
    print('총', sum(bad.values()), '건')

if __name__ == '__main__':
    main(sys.argv[1:] or glob.glob(f'{R.S}/rg*/units/unit*.js'))
