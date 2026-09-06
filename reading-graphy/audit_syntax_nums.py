"""구문분석: 정답 패널의 문장 번호와 지면의 훈련 문장 번호가 맞는지 검사한다."""
import re, sys, os

TRAIN = re.compile(r'\[\[(\d+),.*?\]\]\.forEach\(\(\[n, c\]\)', re.S)
PANEL = re.compile(r't\("문\s*(\d+)\s*"')

def nums(path):
    src = open(path).read()
    body = src[:src.index('renderExplain')]
    i = body.find('문장에 직접 표시')
    if i < 0: return None, None
    seg = body[:i]
    j = seg.rfind('[[')
    arr = seg[j:]
    train = [int(x) for x in re.findall(r'\[(\d+),', arr)]
    ex = src[src.index('renderExplain'):]
    panel = [int(x) for x in PANEL.findall(ex[:ex.index('K.push(sp(68));')])] if 'K.push(sp(68));' in ex else []
    return train, panel

bad = 0
for f in sorted(sys.argv[1:]):
    t, p = nums(f)
    tag = f"{os.path.basename(os.path.dirname(os.path.dirname(f)))}/{os.path.basename(f)[:-3]}"
    if t is None: continue
    if p and sorted(t) != sorted(p):
        print(f'{tag}: 지면 훈련 문장 {t} ≠ 정답 패널 {p}')
        bad += 1
print('불일치 유닛:', bad)
