#!/usr/bin/env python3
"""「정답 한눈에」 패널의 독해 01~03 값을 해설 머리글과 맞춘다.

패널은 라벨과 값이 별도의 t() 런으로 나뉘어 있어, '· 정답 ①' 꼴만 보던
치환 규칙에 걸리지 않고 옛 값이 남았다. 교사용 채점기가 이 패널을 읽으므로,
어긋나면 지면에 엉뚱한 선지가 표시된다.
"""
import re, glob, sys
import rebalance as R

DETAIL = {'01': r'독해\s*01[^·]*·\s*정답\s*([①-⑤])',
          '02': r'독해\s*02[^·]*·\s*정답\s*([①-⑤])',
          '03': r'독해\s*03[^·]*·\s*정답\s*([①-⑤])'}
# 04 는 배열 영작이라 답이 문장이다 — 번호가 아니므로 따로 맞춘다
DETAIL04 = r'Hs\("독해 04[^·]*·\s*((?:[^"\\]|\\.)*)"\)'

def main(apply=False):
    fixed = units = 0
    for f in sorted(glob.glob(f'{R.S}/rg*/units/unit*.js')):
        src = R.normalize(open(f, encoding='utf-8').read())
        i = src.index('renderExplain'); body, key = src[:i], src[i:]
        want = {}
        for lbl, pat in DETAIL.items():
            m = re.search(pat, key)
            if m: want[lbl] = m.group(1)
        if not want: continue
        n = 0
        def rep(m):
            nonlocal n
            lbl, val = m.group(2), m.group(3)
            tgt = want.get(lbl)
            if tgt is None or tgt == val: return m.group(0)
            n += 1
            return m.group(1) + tgt
        # t("01 ", {...}), t("①      ", {...}) — 값 런의 첫 글자만 바꾼다
        key = re.sub(r'(t\("(0[1-3])\s*"[^)]*\),\s*t\(")([①-⑤])', rep, key)
        m04 = re.search(DETAIL04, key)
        if m04:
            def rep04(m):
                nonlocal n
                if m.group(2).strip() == m04.group(1).strip(): return m.group(0)
                n += 1
                return m.group(1) + m04.group(1)
            key = re.sub(r'(t\("04\s*"[^)]*\),\s*t\(")((?:[^"\\]|\\.)*)', rep04, key, count=1)
        if n:
            units += 1; fixed += n
            if apply: open(f, 'w', encoding='utf-8').write(body + key)
    print(f'패널 값을 해설과 맞춘 유닛 {units}개 · 고친 값 {fixed}개')

if __name__ == '__main__':
    main('--apply' in sys.argv)
