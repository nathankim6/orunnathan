#!/usr/bin/env python3
"""재배치 검증 — 정답 번호가 가리키는 선지가 '원래 정답이던 그 문장'인지 확인한다.

git 의 원본과 지금 파일을 나란히 읽어, 문항마다
  원본의 정답 선지 글 == 지금의 정답 선지 글
인지 본다. 하나라도 어긋나면 정답이 엉뚱한 선지를 가리키는 것이다.
"""
import re, subprocess, glob, os, sys, collections
import rebalance as R

BASE = '49ea97f'   # 재배치 이전 판본
files = sorted(glob.glob(f'{R.S}/rg*/units/unit*.js'))
bad, checked = [], 0
for f in files:
    rel = os.path.relpath(f, os.path.dirname(R.S))
    old = R.normalize(subprocess.run(['git', 'show', f'{BASE}:reading-graphy/{os.path.relpath(f, R.S)}'],
                                     capture_output=True, text=True, cwd=R.S).stdout)
    if not old: bad.append((rel, '원본 없음', '', '')); continue
    new = R.normalize(open(f, encoding='utf-8').read())
    for name, anchor, keypat, expat in R.SPECS:
        res = []
        for src in (old, new):
            i = src.index('renderExplain')
            km = re.search(keypat, src[i:]); fo = R.find_options(src[:i], anchor)
            res.append((km, fo))
        (kmo, foo), (kmn, fon) = res
        if not (kmo and foo and kmn and fon): continue
        checked += 1
        a_old = R.split_num(foo[2][R.CIR.index(kmo.group(2))])[1].strip()
        a_new = R.split_num(fon[2][R.CIR.index(kmn.group(2))])[1].strip()
        if a_old != a_new:
            bad.append((rel, name, a_old[:48], a_new[:48]))
        if sorted(R.split_num(x)[1].strip() for x in foo[2]) != sorted(R.split_num(x)[1].strip() for x in fon[2]):
            bad.append((rel, name + '/선지집합변화', '', ''))
print(f'대조한 문항 {checked}개')
for r in bad[:15]: print('  불일치:', r)
print('불일치 총', len(bad), '건')
