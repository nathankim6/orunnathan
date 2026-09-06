"""정답 패널의 값 런이 정본 템플릿과 글자까지 같은지 검사한다.

T/F 배열처럼 우연히 같을 수 있는 짧은 값은 제외하고, 유닛마다 달라야 하는
긴 값(문장·해석·구문분석)만 본다.
"""
import re, sys, os

VAL = re.compile(r't\("((?:[^"\\]|\\.)*)"\s*,\s*\{[^}]*bold: true[^}]*\}\)')
# 정답 자체가 고정된 꼴인 값은 제외한다 — R1의 T/F 배열과 R3의 짝짓기 답은
# 유닛이 달라도 같은 순서를 쓰도록 문항을 쓴 것이므로 겹쳐도 잔존이 아니다.
SHAPE = re.compile(r'^(?:[1-8]\s*[TF][\s·]*)+$|^(?:\d\s*\(?[a-f]\)?[\s·]*)+$')
def panel_vals(path):
    src = open(path).read()
    ex = src[src.index('renderExplain'):]
    end = ex.index('K.push(sp(68));') if 'K.push(sp(68));' in ex else len(ex)
    return [v for v in VAL.findall(ex[:end]) if len(v.strip()) >= 25 and not SHAPE.fullmatch(v.strip())]

S = os.path.dirname(os.path.abspath(__file__))
TPL = set(panel_vals(f'{S}/rg2/units/unit01.js')) | set(panel_vals(f'{S}/rg2/units/unit02.js'))
bad = 0
for f in sorted(sys.argv[1:]):
    tag = f"{os.path.basename(os.path.dirname(os.path.dirname(f)))}/{os.path.basename(f)[:-3]}"
    if tag in ('rg2/unit01', 'rg2/unit02'): continue
    for v in panel_vals(f):
        if v in TPL:
            print(f'{tag}: 정본과 동일 — {v[:70]}')
            bad += 1
print('정본 잔존 값:', bad)
