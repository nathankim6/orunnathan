#!/usr/bin/env python3
"""STEP 5 해설의 선지 풀이를 ①②③ 차례로 다시 늘어놓는다.

선지 자리를 섞을 때 번호만 바꾸고 순서는 그대로 두어 ②①③ 처럼 나왔다.
글은 그대로 두고 차례만 번호순으로 되돌린다.
"""
import re, glob, sys
import rebalance as R

SEG = re.compile(r'([①-⑩])(\s*[○✕][^①-⑩]*)', re.S)

def main(apply=False):
    n = 0
    for f in sorted(glob.glob(f'{R.S}/rg*/units/unit*.js')):
        src = R.normalize(open(f, encoding='utf-8').read())
        i = src.index('renderExplain'); body, key = src[:i], src[i:]
        out, last, changed = [], 0, False
        for m in re.finditer(r'(B\("문장\s*\d+\s)((?:[^"\\]|\\.)*)(")', key):
            segs = SEG.findall(m.group(2))
            if len(segs) < 2: continue
            nums = [s[0] for s in segs]
            if nums == sorted(nums): continue
            head = m.group(2)[:SEG.search(m.group(2)).start()]
            body_new = head + '   '.join(a + b.strip() for a, b in sorted(segs, key=lambda s: s[0]))
            out.append((m.start(2), m.end(2), body_new)); changed = True
        if not changed: continue
        n += 1
        if apply:
            for st, en, rep in sorted(out, reverse=True):
                key = key[:st] + rep + key[en:]
            open(f, 'w', encoding='utf-8').write(body + key)
    print('STEP 5 해설 차례를 되돌린 유닛:', n)

if __name__ == '__main__':
    main('--apply' in sys.argv)
