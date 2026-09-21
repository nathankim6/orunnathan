#!/usr/bin/env python3
"""끝에서 끝까지 대조 — 패널 번호가 지면에서 '원래 정답이던 그 문장'을 가리키는가.

패널 → 지면 선지 → 재배치 전 원본의 정답 글. 셋이 이어지지 않으면
학생이 보는 답과 교사가 표시하는 답이 어긋난다.
"""
import re, glob, os, subprocess, collections
import rebalance as R

BASE = '49ea97f'
PANEL = r't\("(0[1-3])\s*"[^)]*\),\s*t\("\s*([①-⑤])'
DETAIL = {'01': (r'ask\("01"', r'독해\s*01[^·]*·\s*정답\s*([①-⑤])'),
          '02': (r'ask\("02"', r'독해\s*02[^·]*·\s*정답\s*([①-⑤])'),
          '03': (r'ask\("03"', r'독해\s*03[^·]*·\s*정답\s*([①-⑤])')}

bad = collections.Counter(); detail = []; checked = 0
for f in sorted(glob.glob(f'{R.S}/rg*/units/unit*.js')):
    rel = os.path.relpath(f, R.S)
    old = R.normalize(subprocess.run(['git', 'show', f'{BASE}:reading-graphy/{rel}'],
                      capture_output=True, text=True, cwd=R.S).stdout)
    new = R.normalize(open(f, encoding='utf-8').read())
    if not old: continue
    oi, ni = old.index('renderExplain'), new.index('renderExplain')
    panel = dict((m.group(1), m.group(2)) for m in re.finditer(PANEL, new[ni:]))
    for lbl, (anchor, keypat) in DETAIL.items():
        mo = re.search(keypat, old[oi:]); mn = re.search(keypat, new[ni:])
        fo = R.find_options(old[:oi], anchor); fn = R.find_options(new[:ni], anchor)
        if not (mo and mn and fo and fn): continue
        checked += 1
        want = R.split_num(fo[2][R.CIR.index(mo.group(1))])[1].strip()     # 원본의 정답 글
        got  = R.split_num(fn[2][R.CIR.index(mn.group(1))])[1].strip()     # 지금 해설이 가리키는 글
        if want != got:
            bad['해설↛원본'] += 1; detail.append((rel, lbl, want[:40], got[:40]))
        if panel.get(lbl) != mn.group(1):
            bad['패널↛해설'] += 1; detail.append((rel, lbl, f'패널 {panel.get(lbl)}', f'해설 {mn.group(1)}'))
        # 패널 번호로 지면을 짚었을 때도 같은 글이어야 한다
        if panel.get(lbl):
            via = R.split_num(fn[2][R.CIR.index(panel[lbl])])[1].strip()
            if via != want:
                bad['패널→지면↛원본'] += 1; detail.append((rel, lbl, want[:40], via[:40]))
print(f'대조한 문항 {checked}개')
print('어긋남:', dict(bad) or '없음')
for d in detail[:10]: print('   ', d)
