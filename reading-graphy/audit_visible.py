#!/usr/bin/env python3
"""펼쳤을 때 눈에 띄는 정답 패턴을 찾는다.

유형별 분포가 고르더라도, 한 유닛 안에서 답이 같거나 이웃한 유닛이 같은 답을
이어 가면 쓰는 사람 눈에는 '패턴'으로 보인다. 그 관점으로만 본다.
"""
import re, glob, collections, os
import rebalance as R

CIR = R.CIR
S = R.S

def unit_data(f):
    src = R.normalize(open(f, encoding='utf-8').read())
    i = src.index('renderExplain'); body, key = src[:i], src[i:]
    d = {}
    for name, pat in [('01', r'독해\s*01[^·]*·\s*정답\s*([①-⑤])'),
                      ('02', r'독해\s*02[^·]*·\s*정답\s*([①-⑤])'),
                      ('03', r'독해\s*03[^·]*·\s*정답\s*([①-⑤])'),
                      ('1-1', r'1-1\s*([①-⑤])'),
                      ('2-3', r'2-3\s*([①-⑤])')]:
        m = re.search(pat, key)
        if m: d[name] = m.group(1)
    m = re.search(r'R1[^·]*·\s*((?:[1-8]\s*[TF][\s·]*){6,8})', key)
    if m: d['R1'] = re.sub(r'[^TF]', '', m.group(1))
    m = re.search(r'R2[^·]*·\s*\(?([a-e])\)?\s*→', key)
    if m: d['R2'] = m.group(1)
    d['STEP5'] = [c for _, c in re.findall(r'(문장\s*\d+)\s*([①-③])', key)]
    # R4 — 정답이 지면 앞칸인지 뒤칸인지
    hs = [h for h in re.findall(r'Hs\("((?:[^"\\]|\\.)*)"\)', key) if h.startswith('R4')]
    slots = []
    if hs:
        mm = re.search(r'·\s*(.+)$', hs[0])
        picks = [v.strip() for _, v in re.findall(r'\((\d)\)\s*([^()]+?)(?=\s*\(\d\)|\s*$)', mm.group(1))] if mm else []
        j = body.find('어법 기초')
        opts = re.findall(r'\(\s*([^()/"]+?)\s+/\s+([^()/"]+?)\s*\)', body[j:]) if j >= 0 else []
        for pk, (o1, o2) in zip(picks, opts):
            slots.append('앞' if pk == o1.strip() else '뒤' if pk == o2.strip() else '?')
    d['R4'] = slots
    return d

def main():
    books = collections.defaultdict(list)
    for f in sorted(glob.glob(f'{S}/rg*/units/unit*.js')):
        b, u = f.split('/')[-3], os.path.basename(f)[4:6]
        books[b].append((u, unit_data(f)))
    issues = collections.defaultdict(list)
    for b, rows in books.items():
        for u, d in rows:
            tag = f'{b}/{u}'
            three = [d.get(k) for k in ('01','02','03')]
            if all(three) and len(set(three)) == 1:
                issues['한 유닛의 독해 3문항이 모두 같은 답'].append(f'{tag} {three[0]}')
            if d.get('01') and d['01'] == d.get('03'):
                issues['독해 01과 03의 답이 같음'].append(f'{tag} {d["01"]}')
            if d['R4'] and len(set(d['R4'])) == 1 and len(d['R4']) >= 3:
                issues['R4 네 문항이 모두 같은 칸'].append(f'{tag} {d["R4"][0]}')
            if d['STEP5'] and len(set(d['STEP5'])) == 1 and len(d['STEP5']) >= 3:
                issues['STEP 5 네 문항이 모두 같은 선지'].append(f'{tag} {d["STEP5"][0]}')
            if d.get('R1') in ('TFTFTFTF', 'FTFTFTFT', 'TTTTFFFF', 'FFFFTTTT'):
                issues['R1이 규칙적인 배열'].append(f'{tag} {d["R1"]}')
        # 이웃한 유닛이 같은 답을 3개 이상 이어 감
        for field in ('01','02','03','1-1','R2'):
            seq = [(u, d.get(field)) for u, d in rows if d.get(field)]
            run = 1
            for k in range(1, len(seq)):
                if seq[k][1] == seq[k-1][1]:
                    run += 1
                    if run >= 3 and (k+1 == len(seq) or seq[k+1][1] != seq[k][1]):
                        issues[f'{field}: 이웃 유닛 {run}개가 같은 답'].append(
                            f'{b}/{seq[k-run+1][0]}~{seq[k][0]} {seq[k][1]}')
                else: run = 1
    total = 0
    for k in sorted(issues):
        v = issues[k]; total += len(v)
        print(f'■ {k} — {len(v)}건')
        print('   ', ', '.join(v[:10]) + (' …' if len(v) > 10 else ''))
    print(f'\n눈에 띄는 패턴 총 {total}건')

if __name__ == '__main__':
    main()
