#!/usr/bin/env python3
"""STEP 3-3 주제문 배열 — <보기> 덩어리의 차례를 섞어 정답 순서를 고르게 편다.

보기가 배열이 아니라 한 줄짜리 run 이라 따로 다룬다. 덩어리의 '글'은 그대로 두고
기호만 다시 매긴 뒤, 정답 순서·해설·요약 패널의 기호를 같은 표로 바꾼다.
"""
import re, glob, sys, random, collections
import rebalance as R

CIRA = 'ⓐⓑⓒⓓⓔⓕ'
CHUNK = re.compile(r'([ⓐ-ⓕ])\s*([^ⓐ-ⓕ]+)')

def find_bogi(body):
    """3-3 아래 <보기> 덩어리가 실린 run 을 찾는다."""
    j = body.find('t("3-3')
    if j < 0: return None
    for m in re.finditer(r't\("((?:[^"\\]|\\.)*)"', body[j:j + 3000]):
        s = m.group(1)
        if len(CHUNK.findall(s)) >= 3 and s.lstrip().startswith('ⓐ'):
            return j + m.start(1), j + m.end(1), s
    return None

def main(apply=False):
    files = sorted(glob.glob(f'{R.S}/rg*/units/unit*.js'))
    rnd = random.Random(31337)
    before, after = collections.Counter(), collections.Counter()
    moved = miss = 0
    for f in files:
        src = R.normalize(open(f, encoding='utf-8').read())
        i = src.index('renderExplain'); body, key = src[:i], src[i:]
        hm = re.search(r'Hs\("STEP 3[^"]*"\)', key)
        fb = find_bogi(body)
        if not hm and not fb: continue                      # 축약 유닛
        if not hm or not fb: miss += 1; continue
        om = re.search(r'3-3\s*((?:\(?[a-f]\)?\s*→\s*)+\(?[a-f]\)?)', hm.group(0))
        if not om: miss += 1; continue
        order = re.findall(r'[a-f]', om.group(1))
        st, en, run = fb
        pairs = CHUNK.findall(run)
        texts = [t for _, t in pairs]
        if max(ord(c) - 97 for c in order) >= len(texts): miss += 1; continue
        chrono = [texts[ord(c) - 97] for c in order]
        before[order[0]] += 1
        tgt = rnd.randrange(len(texts))
        rest = [t for t in texts if t is not chrono[0]]
        new_texts = rest[:tgt] + [chrono[0]] + rest[tgt:]
        if new_texts == texts: after[order[0]] += 1; continue
        newlab = {id(t): CIRA[k] for k, t in enumerate(new_texts)}
        remap = {CIRA[k]: newlab[id(t)] for k, t in enumerate(texts)}
        new_first = newlab[id(chrono[0])]
        after[chr(97 + CIRA.index(new_first))] += 1
        moved += 1
        if not apply: continue
        sep = '     '
        new_run = sep.join(f'{CIRA[k]} {t.strip()}' for k, t in enumerate(new_texts))
        body = body[:st] + new_run + body[en:]
        def swap(txt):
            txt = re.sub(r'[ⓐ-ⓕ]', lambda m: remap.get(m.group(0), m.group(0)), txt)
            return re.sub(r'\(([a-f])\)', lambda m: '(%s)' % chr(
                97 + CIRA.index(remap.get(CIRA[ord(m.group(1)) - 97], CIRA[ord(m.group(1)) - 97]))), txt)
        secs = re.split(r'(?=Hs\(")', key)
        for k2, sec in enumerate(secs):
            if sec.startswith('Hs("STEP 3'): secs[k2] = swap(sec)
        key = ''.join(secs)
        key = re.sub(r'(t\("STEP 3 "[^)]*\),\s*t\(")((?:[^"\\]|\\.)*)(")',
                     lambda m: m.group(1) + swap(m.group(2)) + m.group(3), key, count=1)
        open(f, 'w', encoding='utf-8').write(body + key)
    fb_ = ' '.join(f'{k}{v}' for k, v in sorted(before.items()))
    fa_ = ' '.join(f'{k}{v}' for k, v in sorted(after.items()))
    print(f'3-3 첫 기호  전 [{fb_}]  →  후 [{fa_}]   (옮긴 유닛 {moved}, 못 읽은 유닛 {miss})')

if __name__ == '__main__':
    main('--apply' in sys.argv)
