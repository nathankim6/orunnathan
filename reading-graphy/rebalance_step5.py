#!/usr/bin/env python3
"""STEP 5 같은 뜻 찾기 — 세 선지의 차례를 섞어 정답 자리를 고르게 편다.

선지 글은 그대로 두고 번호만 다시 매긴 뒤, 정답 줄(Hs·요약 패널)과
문항별 해설(① ○ … ② ✕ …)의 번호를 같은 표로 바꾼다.
"""
import re, glob, sys, random, collections
import rebalance as R

CIR = R.CIR
ITEM = re.compile(r'\{\s*sn:\s*(\d+)\s*,\s*main:\s*"((?:[^"\\]|\\.)*)"\s*,\s*\n?\s*opts:\s*\[([^\]]*)\]\s*\}', re.S)

def main(apply=False):
    files = sorted(glob.glob(f'{R.S}/rg*/units/unit*.js'))
    rnd = random.Random(5150)
    before, after = collections.Counter(), collections.Counter()
    moved = miss = 0
    for f in files:
        src = R.normalize(open(f, encoding='utf-8').read())
        i = src.index('renderExplain'); body, key = src[:i], src[i:]
        hm = re.search(r'Hs\("(STEP 5[^"]*)"\)', key)
        items = list(ITEM.finditer(body))
        if not hm and not items: continue
        if not hm or not items: miss += 1; continue
        ans = re.findall(r'문장\s*(\d+)\s*([①-⑩])', hm.group(1))
        if len(ans) != len(items): miss += 1; continue
        amap = {sn: CIR.index(c) for sn, c in ans}
        edits, remaps, picked = [], {}, []
        for m in items:
            sn = m.group(1)
            if sn not in amap: miss += 1; break
            opts = re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(3))
            cur = amap[sn]
            if cur >= len(opts): miss += 1; break
            texts = [o[1:].strip() for o in opts]
            before[CIR[cur]] += 1
            tgt = rnd.randrange(len(texts))
            if len(picked) >= 2 and picked[-1] == picked[-2] == tgt:   # 세 번 잇달아 같은 자리 금지
                tgt = (tgt + 1 + rnd.randrange(len(texts) - 1)) % len(texts)
            picked.append(tgt)
            after[CIR[tgt]] += 1
            rest = [t for k, t in enumerate(texts) if k != cur]
            new_texts = rest[:tgt] + [texts[cur]] + rest[tgt:]
            order = [texts.index(t) for t in new_texts]
            remaps[sn] = ({CIR[o]: CIR[n] for n, o in enumerate(order)}, CIR[tgt])
            if new_texts != texts:
                edits.append((m.start(3), m.end(3), ', '.join('"%s %s"' % (CIR[k], t)
                                                              for k, t in enumerate(new_texts))))
        if not edits: continue
        moved += len(edits)
        if not apply: continue
        for st, en, rep in sorted(edits, reverse=True):
            body = body[:st] + rep + body[en:]
        def fix_line(s):
            return re.sub(r'(문장\s*(\d+)\s*)([①-⑩])',
                          lambda m: m.group(1) + remaps.get(m.group(2), ({}, m.group(3)))[1], s)
        key = re.sub(r'(Hs\(")(STEP 5(?:[^"\\]|\\.)*)(")',
                     lambda m: m.group(1) + fix_line(m.group(2)) + m.group(3), key, count=1)
        key = re.sub(r'(t\("STEP 5 "[^)]*\),\s*t\(")((?:[^"\\]|\\.)*)(")',
                     lambda m: m.group(1) + fix_line(m.group(2)) + m.group(3), key, count=1)
        # 문항별 해설: "문장 N <본문표현>   ① ○ …   ② ✕ …"
        def fix_block(m):
            sn = m.group(2)
            rm = remaps.get(sn)
            if not rm: return m.group(0)
            return m.group(1) + re.sub(r'[①-⑩]', lambda c: rm[0].get(c.group(0), c.group(0)), m.group(3))
        key = re.sub(r'(B\("문장\s*(\d+)\s)((?:[^"\\]|\\.)*)', fix_block, key)
        open(f, 'w', encoding='utf-8').write(body + key)
    fb = ' '.join(f'{k}{v}' for k, v in sorted(before.items()))
    fa = ' '.join(f'{k}{v}' for k, v in sorted(after.items()))
    print(f'STEP5  전 [{fb}]  →  후 [{fa}]   (옮긴 문항 {moved}, 못 읽은 유닛 {miss})')

if __name__ == '__main__':
    main('--apply' in sys.argv)
