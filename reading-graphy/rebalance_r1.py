#!/usr/bin/env python3
"""R1 True/False — 문장 차례를 섞어 T·F 배열이 유닛마다 달라지게 한다.

문장과 그 해설(근거 문장 번호 포함)을 한 덩어리로 묶어 함께 옮기므로,
어떤 문장이 참이고 거짓인지는 바뀌지 않는다. 번호만 다시 매긴다.
"""
import re, glob, sys, random, collections
import rebalance as R

ARR = re.compile(r'\.\.\.\[\s*((?:"(?:[^"\\]|\\.)*"\s*,?\s*)+)\]\s*\.map', re.S)
ITEM = re.compile(r'(\d+)\s*([TF])\s*—\s*(.*?)(?=\s{2,}\d+\s*[TF]\s*—|\Z)', re.S)

def find_tf_array(body):
    j = body.find('thead(["", "문장", "T / F"')
    if j < 0: return None
    m = ARR.search(body, j)
    if not m: return None
    items = re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(1))
    return (m.start(1), m.end(1), items) if len(items) >= 6 else None

def main(apply=False):
    files = sorted(glob.glob(f'{R.S}/rg*/units/unit*.js'))
    rnd = random.Random(4242)
    before, after = collections.Counter(), collections.Counter()
    moved = miss = 0
    for f in files:
        src = R.normalize(open(f, encoding='utf-8').read())
        i = src.index('renderExplain'); body, key = src[:i], src[i:]
        fa = find_tf_array(body)
        hm = re.search(r'Hs\("(R1[^"]*)"\);\s*\n\s*B\("((?:[^"\\]|\\.)*)"', key)
        if not fa and not hm: continue
        if not fa or not hm: miss += 1; continue
        # 'R1   True / False   ·   1 T · 2 F …' — 가운뎃점 뒤만 읽는다
        after_dot = hm.group(1).split('·', 1)[1] if '·' in hm.group(1) else ''
        pat = re.findall(r'(\d)\s*([TF])\b', after_dot)
        st, en, sents = fa
        if len(pat) != len(sents): miss += 1; continue
        expl = ITEM.findall(hm.group(2))
        if len(expl) != len(sents): miss += 1; continue
        tail = hm.group(2)[hm.group(2).rindex(expl[-1][2]) + len(expl[-1][2]):]
        before[''.join(v for _, v in pat)] += 1
        order = list(range(len(sents)))
        for _ in range(20):
            rnd.shuffle(order)
            newpat = ''.join(pat[k][1] for k in order)
            if newpat != ''.join(v for _, v in pat) and newpat not in ('TFTFTFTF', 'FTFTFTFT'): break
        after[newpat] += 1
        if order == sorted(order): continue
        moved += 1
        if not apply: continue
        new_sents = [sents[k] for k in order]
        body = body[:st] + ',\n    '.join('"%s"' % s for s in new_sents) + body[en:]
        newkey = ' · '.join(f'{n+1} {pat[k][1]}' for n, k in enumerate(order))
        newexp = '   '.join(f'{n+1} {expl[k][1]} — {expl[k][2].strip()}' for n, k in enumerate(order)) + tail
        head = re.sub(r'(·\s*).*$', lambda m: m.group(1) + newkey, hm.group(1))
        key = key[:hm.start()] + f'Hs("{head}");\n   B("{newexp}"' + key[hm.end():]
        # 요약 패널의 R1 배열도 같은 값으로
        key = re.sub(r'(t\("R1 "[^)]*\),\s*t\(")((?:[^"\\]|\\.)*)(")',
                     lambda m: m.group(1) + newkey + m.group(3), key, count=1)
        open(f, 'w', encoding='utf-8').write(body + key)
    print(f'R1 서로 다른 배열  전 {len(before)}가지 (최빈 {before.most_common(1)[0][1]}건)'
          f'  →  후 {len(after)}가지 (최빈 {after.most_common(1)[0][1]}건)   옮긴 유닛 {moved}, 못 읽은 유닛 {miss}')

if __name__ == '__main__':
    main('--apply' in sys.argv)
