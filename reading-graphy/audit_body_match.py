"""본문 워크북이 그 유닛의 지문에서 나왔는지 검사한다.

R1(True/False)·R2(사건 순서)의 영어 문장과 R5(클로즈) 재수록은 모두 그 유닛
지문을 바탕으로 만든다. 다른 유닛 지문이 들어와 있으면 낱말이 거의 겹치지 않는다.
"""
import re, sys, os

STOP = set('a an the is are was were be been being of to in on at for with and or but '
           'that this these those it its they them their he she his her you your we our '
           'from by as not can could will would have has had do does did so if when '
           'there here what how why more most very just also than then into out up down'.split())

def unesc(s):
    return re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), s).replace('\\"', '"')

def words(t):
    return {w for w in re.findall(r"[a-z']+", t.lower()) if len(w) > 2 and w not in STOP}

def check(path):
    src = open(path).read()
    body = src[:src.index('renderExplain')]
    i, j = body.index('const SENT'), body.index('const num')
    passage = words(' '.join(unesc(x) for x in re.findall(r'"((?:[^"\\]|\\.)*)"', body[i:j])))
    out = []
    # R1: thead(["", "문장", "T / F"] …) 뒤의 영어 문장 배열
    m = re.search(r'thead\(\["", "문장", "T / F"\][^\]]*\],\s*\n\s*\.\.\.\[(.*?)\]\.map', body, re.S)
    if m:
        sents = [unesc(x) for x in re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(1))]
        w = words(' '.join(sents))
        if w and len(w & passage) / len(w) < 0.45:
            out.append(('R1', round(len(w & passage) / len(w), 2), ' / '.join(sents[:2])[:80]))
    # R5: 클로즈 재수록 (num(1) … 형태의 큰 box 안 영어)
    k = body.find('빈칸 클로즈')
    if k > 0:
        seg = body[k:k + 6000]
        w = words(' '.join(unesc(x) for x in re.findall(r'"((?:[^"\\]|\\.)*)"', seg)))
        if w and len(w & passage) / len(w) < 0.45:
            out.append(('R5', round(len(w & passage) / len(w), 2), ''))
    return out

n = 0
for f in sorted(sys.argv[1:]):
    tag = f"{os.path.basename(os.path.dirname(os.path.dirname(f)))}/{os.path.basename(f)[:-3]}"
    try: res = check(f)
    except Exception as e: print(f'{tag}: 검사 실패 {e}'); continue
    for kind, ratio, sample in res:
        print(f'{tag}: {kind} 지문 낱말 겹침 {ratio} — {sample}')
        n += 1
print('의심:', n)
