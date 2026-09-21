#!/usr/bin/env python3
"""정답이 한 자리에 몰린 객관식 문항의 선지 순서를 섞어 정답 위치를 고르게 편다.

선지 배열을 다시 늘어놓고 ①②③… 을 다시 붙인 뒤, 정답 패널과 해설 속
선지 번호까지 같은 표로 바꾼다. 지문·조판·해설 문장은 건드리지 않는다.
"""
import re, glob, os, sys, random, collections, json

S = os.path.dirname(os.path.abspath(__file__))
CIR = '①②③④⑤⑥⑦⑧⑨⑩'

# (이름, 본문 앵커, 정답 패널 정규식, 해설 블록 정규식)
SPECS = [
    ('독해01', r'ask\("01"',      r'(독해\s*01[^·]*·\s*정답\s*)([①-⑤])',
                                   r'(Hs\("독해 01[^"]*"\);\s*\n\s*B\(")((?:[^"\\]|\\.)*)(")'),
    ('독해02', r'ask\("02"',      r'(독해\s*02[^·]*·\s*정답\s*)([①-⑤])',
                                   r'(Hs\("독해 02[^"]*"\);\s*\n\s*B\(")((?:[^"\\]|\\.)*)(")'),
    ('독해03', r'ask\("03"',      r'(독해\s*03[^·]*·\s*정답\s*)([①-⑤])',
                                   r'(Hs\("독해 03[^"]*"\);\s*\n\s*B\(")((?:[^"\\]|\\.)*)(")'),
    ('1-1',   r't\("1-1\s*"',     r'(1-1\s*)([①-⑤])',
                                   r'(B\(")(1-1(?:[^"\\]|\\.)*)(")'),
    ('2-3',   r't\("2-3\s*"',     r'(2-3\s*)([①-⑤])',
                                   r'(B\(")(2-3(?:[^"\\]|\\.)*)(")'),
]

ARR = re.compile(r'\[\s*("(?:[^"\\]|\\.)*"(?:\s*,\s*(?:\n\s*)?"(?:[^"\\]|\\.)*")*)\s*\]')

def find_options(body, anchor):
    """앵커 뒤에 처음 나오는 '①…' 로 시작하는 문자열 배열을 찾는다."""
    m = re.search(anchor, body)
    if not m: return None
    for am in ARR.finditer(body, m.end()):
        items = re.findall(r'"((?:[^"\\]|\\.)*)"', am.group(1))
        if len(items) >= 3 and all(it.lstrip().startswith(CIR[i]) for i, it in enumerate(items)):
            return am.start(), am.end(), items
        if am.start() - m.end() > 2500: break
    return None

def split_num(s):
    t = s.lstrip()
    return t[0], t[1:]

def normalize(src):
    """\\u2460 꼴로 저장된 원문자를 실제 글자로 — 렌더 결과는 같고 검사·치환이 쉬워진다."""
    return re.sub(r'\\u(246[0-9a-fA-F]|201[34]|24[Dd][0-9a-fA-F]|24[Ee][0-9a-fA-F]|2192)',
                  lambda m: chr(int(m.group(1), 16)), src)

def load(path):
    src = normalize(open(path, encoding='utf-8').read())
    i = src.index('renderExplain')
    return src, i

def plan_targets(rows, seed):
    """각 자리에 고르게 떨어지도록 목표 위치를 배분한다.

    책 단위로 나누어 배분한다 — 학생은 보통 한 권만 쓰므로, 전체가 고르더라도
    한 권 안에서 한 자리에 몰리면 그 권은 여전히 찍을 수 있다.
    """
    by_n = collections.defaultdict(list)
    for idx, r in enumerate(rows):
        book = r['f'].rsplit('/units/', 1)[0].rsplit('/', 1)[-1]
        by_n[(book, r['n'])].append(idx)
    targets = {}
    rnd = random.Random(seed)
    for (book, n), idxs in sorted(by_n.items()):
        pool = [(k % n) + 1 for k in range(len(idxs))]
        rnd.shuffle(pool)
        for idx, t in zip(idxs, pool): targets[idx] = t
    return targets

def rebuild(items, cur, tgt):
    """정답을 tgt 자리로 옮기고 나머지는 원래 차례를 지킨 채 채운다."""
    nums = [split_num(x)[0] for x in items]
    texts = [split_num(x)[1] for x in items]
    ans = texts[cur - 1]
    rest = [t for k, t in enumerate(texts) if k != cur - 1]
    out = rest[:tgt - 1] + [ans] + rest[tgt - 1:]
    order = [texts.index(t) for t in out]            # 새 자리 → 옛 자리
    remap = {old + 1: new + 1 for new, old in enumerate(order)}
    return [CIR[k] + t for k, t in enumerate(out)], remap

def apply_map(text, remap):
    return re.sub(r'[①-⑩]', lambda m: CIR[remap.get(CIR.index(m.group(0)) + 1, CIR.index(m.group(0)) + 1) - 1], text)

def main(apply=False):
    files = sorted(glob.glob(f'{S}/rg*/units/unit*.js'))
    assert len(files) == 144, f'유닛 {len(files)}개'

    # 1단계 — 어떤 유닛의 어떤 문항을 어디로 옮길지 먼저 정한다
    plan = collections.defaultdict(dict)        # 파일 → {문항: 목표자리}
    before = collections.defaultdict(collections.Counter)
    after = collections.defaultdict(collections.Counter)
    for name, anchor, keypat, expat in SPECS:
        rows = []
        for f in files:
            src, i = load(f)
            km = re.search(keypat, src[i:])
            fo = find_options(src[:i], anchor)
            if not km or not fo: continue
            cur = CIR.index(km.group(2)) + 1
            if cur > len(fo[2]): continue
            rows.append(dict(f=f, cur=cur, n=len(fo[2])))
        assert rows, f'{name}: 한 건도 못 읽음'
        targets = plan_targets(rows, seed=abs(hash(name)) % 9973)
        # plan.json 이 있으면 그 배분표를 따른다 — 눈에 띄는 패턴을 피하도록 미리 짠 표다
        if os.path.exists(f'{S}/plan.json'):
            book_plan = json.load(open(f'{S}/plan.json', encoding='utf-8'))
            seen = collections.Counter()
            for idx, r in enumerate(rows):
                bk = r['f'].rsplit('/units/', 1)[0].rsplit('/', 1)[-1]
                pk = {'독해01': '01', '독해02': '02', '독해03': '03'}.get(name, name)
                seq = book_plan.get(bk, {}).get(pk)
                if seq is None: continue
                targets[idx] = seq[seen[bk]]
                seen[bk] += 1
        for idx, r in enumerate(rows):
            before[name][r['cur']] += 1
            after[name][targets[idx]] += 1
            plan[r['f']][name] = targets[idx]

    # 2단계 — 파일마다 한 문항씩 고치고, 그때마다 파일을 다시 읽어 위치를 새로 잡는다
    changed = collections.Counter()
    for f in files:
        for name, anchor, keypat, expat in SPECS:
            tgt = plan[f].get(name)
            if tgt is None: continue
            src, i = load(f)
            body, key = src[:i], src[i:]
            km = re.search(keypat, key)
            fo = find_options(body, anchor)
            if not km or not fo: continue
            st, en, items = fo
            cur = CIR.index(km.group(2)) + 1
            if tgt == cur:
                if apply and src != open(f, encoding='utf-8').read():
                    open(f, 'w', encoding='utf-8').write(src)      # 정규화만 반영
                continue
            new_items, remap = rebuild(items, cur, tgt)
            body = body[:st] + '[' + ',\n '.join('"%s"' % x for x in new_items) + ']' + body[en:]
            key = re.sub(keypat, lambda m: m.group(1) + CIR[tgt - 1], key)
            key = re.sub(expat, lambda m: m.group(1) + apply_map(m.group(2), remap) + m.group(3), key, count=1)
            changed[name] += 1
            if apply: open(f, 'w', encoding='utf-8').write(body + key)
    for name, _, _, _ in SPECS:
        fb = ' '.join(f'{CIR[k-1]}{v}' for k, v in sorted(before[name].items()))
        fa = ' '.join(f'{CIR[k-1]}{v}' for k, v in sorted(after[name].items()))
        print(f'{name:7} 전 [{fb}]  →  후 [{fa}]   (옮긴 유닛 {changed[name]})')

if __name__ == '__main__':
    main(apply='--apply' in sys.argv)
