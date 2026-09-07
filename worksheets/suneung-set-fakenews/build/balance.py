# -*- coding: utf-8 -*-
"""정답 번호가 한쪽에 몰리지 않도록 고르게 재배치한다.

출제 데이터(items.py)는 읽기 쉽게 정답을 앞쪽에 두고 썼으므로, 문서를 만들 때
여기서 한 번 섞는다. 보기 순서를 바꾸면 해설 속 번호(①~⑤)와 보기 해석 순서,
순서 문제의 (A)(B)(C) 라벨도 함께 고쳐야 한다. 시드가 고정되어 있어 몇 번을
돌려도 같은 결과가 나온다.
"""
import random
import re

CIRCLE = '①②③④⑤'
# 정답 번호 -> 원문 블록(C1, C2, C3)에 붙일 라벨
ORDER_MAPS = {1: ('B', 'C', 'A'), 2: ('C', 'A', 'B'), 3: ('A', 'B', 'C'),
              4: ('C', 'B', 'A'), 5: ('A', 'C', 'B')}
ORDER_LABELS = ['(B)-(C)-(A)', '(C)-(A)-(B)', '(A)-(B)-(C)',
                '(C)-(B)-(A)', '(A)-(C)-(B)']
SHUFFLED = ('implication', 'mainPoint', 'topic', 'title', 'mismatch', 'blank', 'summary')
_RUN = re.compile(r'[①-⑤](?:·[①-⑤])+')

# 번호를 소리 내어 읽으면 ①일 ②이 ③삼 ④사 ⑤오 이므로, 받침 유무에 따라 조사가 달라진다.
_NO_FINAL = {2, 4, 5}
_CONS = {'이': '이', '가': '이', '은': '은', '는': '은', '을': '을', '를': '을',
         '과': '과', '와': '과', '으로': '으로', '로': '으로'}
_VOWEL = {'이': '가', '가': '가', '은': '는', '는': '는', '을': '를', '를': '를',
          '과': '와', '와': '와', '으로': '로', '로': '로'}
_PARTICLE = re.compile(r'([①-⑤])(으로|이|가|은|는|을|를|과|와)(?=[\s,.·)]|$)')


def fix_particles(text):
    def sub(m):
        n = CIRCLE.index(m.group(1)) + 1
        table = _VOWEL if n in _NO_FINAL else _CONS
        return m.group(1) + table[m.group(2)]
    return _PARTICLE.sub(sub, text)


def remap_circled(text, mapping):
    """해설 속 ①~⑤를 새 번호로 바꾸고, '·'로 이어진 나열은 오름차순으로 정리한다."""
    out = ''.join(CIRCLE[mapping[CIRCLE.index(c) + 1] - 1] if c in CIRCLE else c
                  for c in text)
    out = _RUN.sub(lambda m: '·'.join(sorted(m.group(0).split('·'))), out)
    return fix_particles(out)


def _even_pool(n, seed):
    """1~5가 고르게 섞인 길이 n짜리 목록."""
    pool = [(i % 5) + 1 for i in range(n)]
    random.Random(seed).shuffle(pool)
    return pool


def _move_answer(d, target):
    """정답을 target번 자리로 옮기고 나머지 보기의 상대 순서는 유지한다."""
    old = d['ans']
    if old == target:
        return
    rest = [i for i in range(5) if i != old - 1]
    new_order, j = [], 0
    for pos in range(5):
        if pos == target - 1:
            new_order.append(old - 1)
        else:
            new_order.append(rest[j])
            j += 1
    mapping = {o + 1: pos + 1 for pos, o in enumerate(new_order)}
    d['ch'] = [d['ch'][i] for i in new_order]
    if d.get('tr'):
        d['tr'] = [d['tr'][i] for i in new_order]
    d['sol'] = remap_circled(d['sol'], mapping)
    d['ans'] = target


def _relabel_order(sol, old, new):
    m = {ORDER_MAPS[old][i]: ORDER_MAPS[new][i] for i in range(3)}
    return re.sub(r'\(([ABC])\)', lambda mo: '(%s)' % m[mo.group(1)], sol)


def balance(items, rows):
    ids = [r['id'] for r in rows if items.get(r['id'])]
    sents = {r['id']: r['sents'] for r in rows}

    # 0) 손으로 쓴 해설의 조사도 한 번 정리한다
    for pid in ids:
        for d in items[pid].values():
            d['sol'] = fix_particles(d['sol'])

    # 1) 보기가 있는 유형: 정답 자리를 고르게 재배치
    for kind in SHUFFLED:
        got = [i for i in ids if kind in items[i]]
        for pid, t in zip(got, _even_pool(len(got), 'orun-' + kind)):
            _move_answer(items[pid][kind], t)

    # 2) 순서: 정답 번호를 바꾸면 (A)(B)(C) 라벨도 따라 바뀐다
    got = [i for i in ids if 'order' in items[i]]
    for pid, t in zip(got, _even_pool(len(got), 'orun-order')):
        d = items[pid]['order']
        if d['ans'] != t:
            d['sol'] = _relabel_order(d['sol'], d['ans'], t)
            d['ans'] = t

    # 3) 문장삽입: 표시할 수 있는 자리(정답 번호)는 지문 길이에 따라 제한된다
    counts = {n: 0 for n in range(1, 6)}
    for pid in [i for i in ids if 'insert' in items[i]]:
        d = items[pid]['insert']
        take, m = d['take'], len(sents[pid]) - 1
        ok = [a for a in range(1, 6) if 0 <= take - a <= m - 5]
        best = min(ok, key=lambda a: (counts[a], a))
        counts[best] += 1
        if d['ans'] != best:
            d['sol'] = remap_circled(d['sol'], {d['ans']: best, best: d['ans'],
                                                **{n: n for n in range(1, 6)
                                                   if n not in (d['ans'], best)}})
            d['ans'] = best
    return items
