#!/usr/bin/env python3
"""배열 문항(R2 사건 순서 · STEP 3-3 주제문)의 보기 차례를 섞어 정답 순서를 고르게 편다.

보기에 붙은 기호만 다시 매기므로, 정답이 가리키는 '글'은 그대로다.
정답 순서·해설·요약 패널의 기호를 같은 표로 함께 바꾼다.
"""
import re, glob, os, sys, random, collections
import rebalance as R

CIRA = 'ⓐⓑⓒⓓⓔⓕ'
ARR = re.compile(r'\[\s*("(?:[^"\\]|\\.)*"(?:\s*,\s*(?:\n\s*)?"(?:[^"\\]|\\.)*")*)\s*\]')

SPECS = {
    # 이름: (본문 앵커, 정답 순서가 실린 Hs 머리, 패널에서 순서를 담은 run 앞의 라벨)
    'R2':  (r'wbAsk\("R2"', r'Hs\("R2[^"]*"\)', r'R2 '),
    '3-3': (r't\("3-3\s*"', r'Hs\("STEP 3[^"]*"\)', r'STEP 3 '),
}
ORDER = re.compile(r'\(([a-f])\)(\s*→\s*\(([a-f])\))+')

def options_after(body, anchor, circled=CIRA):
    m = re.search(anchor, body)
    if not m: return None
    for am in ARR.finditer(body, m.end()):
        items = re.findall(r'"((?:[^"\\]|\\.)*)"', am.group(1))
        if len(items) >= 3 and all(it.lstrip().startswith(circled[i]) for i, it in enumerate(items)):
            return am.start(), am.end(), items
        if am.start() - m.end() > 3000: break
    return None

def parse_order(s):
    m = ORDER.search(s)
    return [c for c in re.findall(r'\(([a-f])\)', m.group(0))] if m else None

def main(apply=False):
    files = sorted(glob.glob(f'{R.S}/rg*/units/unit*.js'))
    rnd = random.Random(777)
    before, after = collections.defaultdict(collections.Counter), collections.defaultdict(collections.Counter)
    moved = collections.Counter()
    for f in files:
        src = R.normalize(open(f, encoding='utf-8').read())
        for name, (anchor, hspat, panel_lbl) in SPECS.items():
            i = src.index('renderExplain')
            body, key = src[:i], src[i:]
            fo = options_after(body, anchor)
            hm = re.search(hspat, key)
            if not fo or not hm: continue
            order = parse_order(hm.group(0))
            if not order: continue
            st, en, items = fo
            n = len(items)
            texts = [it[1:] for it in items]                       # 표시 차례의 글
            idx = [ord(c) - 97 for c in order]
            if max(idx) >= n: continue
            chrono = [texts[k] for k in idx]                       # 실제(정답) 차례의 글
            before[name][order[0]] += 1
            tgt = rnd.randrange(n)                                 # 첫 정답 기호를 이 자리로
            rest = [t for t in texts if t != chrono[0]]
            new_texts = rest[:tgt] + [chrono[0]] + rest[tgt:]
            if new_texts == texts:
                after[name][order[0]] += 1; continue
            newlab = {t: CIRA[k] for k, t in enumerate(new_texts)}
            remap = {CIRA[k]: newlab[t] for k, t in enumerate(texts)}   # 옛 기호 → 새 기호
            new_order = [newlab[t] for t in chrono]
            after[name][chr(97 + CIRA.index(new_order[0]))] += 1
            moved[name] += 1
            if not apply: continue
            body = body[:st] + '[' + ',\n      '.join('"%s%s"' % (CIRA[k], t)
                     for k, t in enumerate(new_texts)) + ']' + body[en:]
            def swap(txt):
                txt = re.sub(r'[ⓐ-ⓕ]', lambda m: remap.get(m.group(0), m.group(0)), txt)
                return re.sub(r'\(([a-f])\)',
                              lambda m: '(%s)' % chr(97 + CIRA.index(remap.get(CIRA[ord(m.group(1))-97],
                                                                               CIRA[ord(m.group(1))-97]))), txt)
            # 해설: 이 문항이 속한 Hs 구역만
            secs = re.split(r'(?=Hs\(")', key)
            for k2, sec in enumerate(secs):
                if re.match(hspat, sec): secs[k2] = swap(sec)
            key = ''.join(secs)
            # 요약 패널: 라벨 run 바로 뒤의 순서 문자열
            key = re.sub(r'(t\("' + panel_lbl + r'"[^)]*\),\s*t\(")((?:[^"\\]|\\.)*)(")',
                         lambda m: m.group(1) + swap(m.group(2)) + m.group(3), key, count=1)
            src = body + key
            open(f, 'w', encoding='utf-8').write(src)
            src = R.normalize(open(f, encoding='utf-8').read())
    for name in SPECS:
        fb = ' '.join(f'{k}{v}' for k, v in sorted(before[name].items()))
        fa = ' '.join(f'{k}{v}' for k, v in sorted(after[name].items()))
        print(f'{name:4} 첫 기호  전 [{fb}]  →  후 [{fa}]   (옮긴 유닛 {moved[name]})')

if __name__ == '__main__':
    main('--apply' in sys.argv)
