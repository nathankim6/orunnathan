"""해설이 그 유닛의 지문과 맞는지 검사한다.

04 배열 영작의 정답과 R7 복원 문장은 반드시 그 유닛 지문(SENT)의 문장이어야 한다.
다른 유닛 것이 들어와 있으면 해설이 통째로 잘못 붙은 것이다.
"""
import re, sys, os

def unesc(s):
    return re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), s).replace('\\"', '"')

def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

def check(path):
    src = open(path).read()
    body = src[:src.index('renderExplain')]
    ex = src[src.index('renderExplain'):]
    i = body.index('const SENT'); j = body.index('const num')
    sents = [norm(unesc(x)) for x in re.findall(r'"((?:[^"\\]|\\.)*)"', body[i:j])]
    blob = ' '.join(sents)
    bad = []
    m = re.search(r'Hs\("독해 04[^"]*·\s*((?:[^"\\]|\\.)*)"\)', ex)
    if m:
        a = norm(unesc(m.group(1)))
        if a and a not in blob: bad.append(('04', unesc(m.group(1))[:60]))
    m = re.search(r't\("R7 ", \{[^}]*\}\), t\("((?:[^"\\]|\\.)*)"', ex)
    if m:
        for _, s in re.findall(r'\((\d)\)\s*([^(]+)', unesc(m.group(1))):
            a = norm(s)
            if len(a) > 12 and a not in blob: bad.append(('R7', s.strip()[:60]))
    return bad

n = 0
for f in sorted(sys.argv[1:]):
    tag = f"{os.path.basename(os.path.dirname(os.path.dirname(f)))}/{os.path.basename(f)[:-3]}"
    try: bad = check(f)
    except Exception as e: print(f'{tag}: 검사 실패 {e}'); continue
    for k, v in bad:
        print(f'{tag}: {k} 정답이 이 유닛 지문에 없음 — {v}')
        n += 1
print('불일치:', n)
