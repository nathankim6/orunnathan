"""구문 훈련: 정답 패널의 해석이 템플릿(정본) 것 그대로인지 검사한다.

구문 훈련 문장은 유닛마다 새로 짓는 창작 문장이므로, 정본과 글자까지 같으면
치환이 누락된 것이다.
"""
import re, sys, os

def panel_train(path):
    src = open(path).read()
    ex = src[src.index('renderExplain'):]
    end = ex.index('K.push(sp(68));') if 'K.push(sp(68));' in ex else len(ex)
    m = re.search(r't\("구문 훈련 ", \{[^}]*\}\), t\("((?:[^"\\]|\\.)*)"', ex[:end])
    return m.group(1) if m else None

S = os.path.dirname(os.path.abspath(__file__))
TPL = panel_train(f'{S}/rg2/units/unit01.js')      # 정본 풀 유닛
TPL2 = panel_train(f'{S}/rg2/units/unit02.js')     # 정본 축약 유닛
bad = 0
for f in sorted(sys.argv[1:]):
    v = panel_train(f)
    tag = f"{os.path.basename(os.path.dirname(os.path.dirname(f)))}/{os.path.basename(f)[:-3]}"
    if v is None: continue
    if tag in ('rg2/unit01', 'rg2/unit02'): continue
    if v == TPL or v == TPL2:
        print(f'{tag}: 구문 훈련 해석이 정본 그대로 — {v[:60]}')
        bad += 1
print('템플릿 잔존:', bad)
