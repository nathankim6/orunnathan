#!/usr/bin/env python3
"""R1 해설 끝의 총평 문장을 다시 맨 뒤로 돌린다.

문장 차례를 섞을 때 총평이 마지막 항목 글에 붙어 있어 함께 끌려갔다.
'…다.  거짓 문장은 …' 처럼 마침표+두 칸 뒤에 오는 총평만 떼어 맨 끝에 붙인다.
"""
import re, glob, sys
import rebalance as R

ITEM = re.compile(r'(\d+\s*[TF]\s*—\s*)(.*?)(?=\s{2,}\d+\s*[TF]\s*—|\Z)', re.S)
TAIL = re.compile(r'(?<=[.!?])\s{2,}((?:거짓|참|모두|비튼|T는|F는)[^"]*)$')

def main(apply=False):
    fixed = 0
    for f in sorted(glob.glob(f'{R.S}/rg*/units/unit*.js')):
        src = R.normalize(open(f, encoding='utf-8').read())
        i = src.index('renderExplain'); body, key = src[:i], src[i:]
        m = re.search(r'(Hs\("R1[^"]*"\);\s*\n\s*B\(")((?:[^"\\]|\\.)*)(")', key)
        if not m: continue
        text = m.group(2)
        parts = list(ITEM.finditer(text))
        if len(parts) < 2: continue
        tail = None; hit = None
        for k, p in enumerate(parts):
            t = TAIL.search(p.group(2))
            if t: tail, hit = t.group(1).strip(), k; break
        if tail is None or hit == len(parts) - 1: continue
        chunks = []
        for k, p in enumerate(parts):
            seg = p.group(2)
            if k == hit: seg = TAIL.sub('', seg).rstrip()
            chunks.append(p.group(1) + seg.strip())
        newtext = '   '.join(chunks) + '  ' + tail
        fixed += 1
        if apply:
            key = key[:m.start()] + m.group(1) + newtext + m.group(3) + key[m.end():]
            open(f, 'w', encoding='utf-8').write(body + key)
    print('총평을 맨 뒤로 되돌린 유닛:', fixed)

if __name__ == '__main__':
    main('--apply' in sys.argv)
