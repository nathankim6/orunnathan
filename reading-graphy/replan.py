#!/usr/bin/env python3
"""눈에 띄는 패턴이 생기지 않도록 정답 자리를 다시 배분한다.

고르게 나누는 것만으로는 부족하다 — 한 유닛 안에서 답이 겹치거나 이웃한 유닛이
같은 답을 이어 가면 사람 눈에는 패턴으로 보인다. 아래 조건을 모두 지키면서
권별 개수 균형(36문항 5지선다 = 8·7·7·7·7)은 그대로 둔다.

  · 한 유닛의 독해 01 과 03 은 서로 다른 자리
  · 어떤 문항이든 이웃한 세 유닛이 같은 자리를 잇지 않음
  · 3지선다(1-1)도 같은 규칙
"""
import json, random, collections, sys

def balanced(n_items, n_opts):
    return [(k % n_opts) + 1 for k in range(n_items)]

def no_run3(seq):
    return all(not (seq[i] == seq[i+1] == seq[i+2]) for i in range(len(seq) - 2))

def plan_book(n_units, n_opts, rnd, forbid=None, tries=4000):
    """균형을 지키면서 3연속 금지 · forbid[i] 금지를 만족하는 배열을 찾는다."""
    pool = balanced(n_units, n_opts)
    for _ in range(tries):
        rnd.shuffle(pool)
        seq = list(pool)
        if forbid and any(seq[i] == forbid[i] for i in range(n_units)): 
            # 충돌 자리를 맞바꿔 고쳐 본다
            for i in range(n_units):
                if seq[i] != forbid[i]: continue
                for j in range(n_units):
                    if j == i: continue
                    if seq[j] != forbid[i] and (forbid[j] is None or seq[i] != forbid[j]):
                        seq[i], seq[j] = seq[j], seq[i]; break
        if forbid and any(seq[i] == forbid[i] for i in range(n_units)): continue
        if not no_run3(seq): continue
        return seq
    raise RuntimeError('조건을 만족하는 배분을 찾지 못함')

def main(out='plan.json', seed=20260921):
    rnd = random.Random(seed)
    plan = {}
    for book in ('rg1', 'rg2', 'rg3', 'rg4'):
        a = plan_book(36, 5, rnd)                 # 독해 01
        b = plan_book(36, 5, rnd)                 # 독해 02
        c = plan_book(36, 5, rnd, forbid=a)       # 독해 03 — 01 과 달라야 한다
        d = plan_book(36, 3, rnd)                 # STEP 1-1
        e = plan_book(12, 5, rnd)                 # STEP 2-3 (풀 유닛만)
        plan[book] = {'01': a, '02': b, '03': c, '1-1': d, '2-3': e}
        assert all(x != y for x, y in zip(a, c))
        for name, seq, k in (('01',a,5), ('02',b,5), ('03',c,5), ('1-1',d,3), ('2-3',e,5)):
            cnt = collections.Counter(seq)
            assert max(cnt.values()) - min(cnt.values()) <= 1, (book, name, cnt)
            assert no_run3(seq), (book, name)
    json.dump(plan, open(out, 'w'), ensure_ascii=False)
    print(f'{out} 작성 — 4권 × 5문항, 3연속 금지 · 01≠03 · 개수 균형 확인 완료')

if __name__ == '__main__':
    main()
