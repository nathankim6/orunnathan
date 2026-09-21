#!/usr/bin/env python3
"""R4 어법 기초 — 정답이 늘 앞칸에 있던 것을 앞뒤 고르게 섞는다.

지면의 ( A / B ) 두 칸 순서만 바꾼다. 정답 낱말·해설·힌트는 그대로다.
"""
import re, glob, os, sys, random, collections
import rebalance as R

OPT = re.compile(r'\(\s*([^()/"]+?)\s+/\s+([^()/"]+?)\s*\)')

def r4_items(src):
    """(정답 낱말 목록, 지면 선택지 위치 목록)"""
    i = src.index('renderExplain')
    body, key = src[:i], src[i:]
    # 정답 줄은 Hs("R4 … · (1) … (2) …") 한 줄에 들어 있다
    hs = [h for h in re.findall(r'Hs\("((?:[^"\\]|\\.)*)"\)', key) if h.startswith('R4')]
    if not hs: return None
    m = re.search(r'·\s*(.+)$', hs[0])
    if not m: return None
    picks = [v.strip() for _, v in re.findall(r'\((\d)\)\s*([^()]+?)(?=\s*\(\d\)|\s*$)', m.group(1))]
    j = body.find('어법 기초')
    if j < 0 or not picks: return None
    opts = [(mm.start() + j, mm.end() + j, mm.group(1).strip(), mm.group(2).strip())
            for mm in OPT.finditer(body[j:])]
    return picks, opts[:len(picks)]

def main(apply=False):
    files = sorted(glob.glob(f'{R.S}/rg*/units/unit*.js'))
    rnd = random.Random(20260921)
    before, after = collections.Counter(), collections.Counter()
    moved = 0
    for f in files:
        src = R.normalize(open(f, encoding='utf-8').read())
        got = r4_items(src)
        if not got: continue
        picks, opts = got
        edits = []; wants = []
        for pk, (st, en, o1, o2) in zip(picks, opts):
            if pk == o1: pos = '앞칸'
            elif pk == o2: pos = '뒤칸'
            else: before['대조실패'] += 1; continue
            before[pos] += 1
            want = rnd.choice(['앞칸', '뒤칸'])
            wants.append(want)
            after[want] += 1
            if want != pos:
                edits.append((st, en, f'( {o2}  /  {o1} )'))
        # 네 문항이 모두 같은 칸이면 한 문항을 뒤집는다 — 펼치면 바로 보이는 꼴이다
        if wants and len(set(wants)) == 1 and len(wants) >= 3:
            k = rnd.randrange(len(wants))
            flip = '뒤칸' if wants[k] == '앞칸' else '앞칸'
            after[wants[k]] -= 1; after[flip] += 1
            st, en, o1, o2 = opts[k]
            same = [e for e in edits if e[0] == st]
            if same: edits = [e for e in edits if e[0] != st]
            else: edits.append((st, en, f'( {o2}  /  {o1} )'))
        if edits and apply:
            for st, en, rep in sorted(edits, reverse=True):
                src = src[:st] + rep + src[en:]
            open(f, 'w', encoding='utf-8').write(src)
        moved += len(edits)
    print('R4 전:', dict(before), ' 후:', dict(after), f' 바꾼 문항 {moved}')

if __name__ == '__main__':
    main('--apply' in sys.argv)
