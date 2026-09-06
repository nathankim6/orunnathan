# -*- coding: utf-8 -*-
"""원본 엑셀(3,000단어)을 난이도순 30 DAY 구성으로 재배치해 book.json을 만든다.

원본은 알파벳순 한 덩어리(등급 열만 초등/중고/전문)이고,
결과는 초등 -> 중고 -> 전문 3개 파트로 나뉜 뒤 파트 안에서만 알파벳순으로 정렬된다.
한 DAY는 100단어(= 한 면), 총 30 DAY.

시험은 단어장과 다른 파일(시험지)로 나가고, 단어를 보고 뜻을 쓰는 형식만 쓴다.
원본이 뜻을 하나만 달아 둔 다의어(run = 달리다)는 polysemy.py에 따로 정리해
단어장 부록과 다의어 시험이 함께 쓴다.

    python3 prep.py            # ../source/단어장_원본_3000.xls -> book.json
"""
import json
import os
import random
import re

import xlrd

from polysemy import POLYSEMY

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'source', '단어장_원본_3000.xls')
OUT = os.path.join(HERE, 'book.json')

WORDS_PER_DAY = 100         # 한 면에 들어가는 단어 수 = 하루 분량
POLY_PER_PAGE = 20          # 다의어 시험 한 면 문항 수
SEED = 20260906             # 시험 문항 순서를 고정해 다시 돌려도 같은 시험지가 나오게 한다

PARTS = [
    dict(key='초등', roman='I', en='FOUNDATION', ko='초·중등 기초 어휘',
         desc='교과서와 기본 독해에서 반복되는 필수 기초 어휘입니다. '
              '뜻을 바로 떠올릴 수 있을 때까지 속도를 붙여 반복하세요.'),
    dict(key='중고', roman='II', en='CORE', ko='중·고 핵심 어휘',
         desc='수능·모의고사 지문의 뼈대를 이루는 핵심 어휘입니다. '
              '이 파트의 완성도가 곧 정시 독해 점수입니다.'),
    dict(key='전문', roman='III', en='ADVANCED', ko='전문 심화 어휘',
         desc='고난도 지문과 빈칸·순서 문항에서 변별력을 만드는 심화 어휘입니다. '
              '마무리 단계에서 집중 공략하세요.'),
]

# 원본에 남아 있던 띄어쓰기 오류(단어 중간이 끊긴 것)만 손으로 바로잡는다.
FIX = {
    'proud': '뽐내는, 자랑하는 · 자긍하는, 영광으로 여기는',
    'push': '밀다, 밀치다, 밀어서 움직이다, 밀어 내다',
    'from': '(분리·이탈·출발점·기점) ~로부터',
}


def read_source(path):
    sheet = xlrd.open_workbook(path).sheet_by_index(0)
    rows = []
    for r in range(1, sheet.nrows):          # 0행은 머리글
        v = sheet.row_values(r)
        rows.append(dict(word=str(v[1]).strip(), mean=str(v[2]).strip(),
                         grade=str(v[3]).strip(),
                         v1=str(v[4]).strip(), v2=str(v[5]).strip()))
    return rows


def norm_mean(word, s):
    """뜻 정리: 끝에 남은 쉼표를 떼고, 의미군을 나누던 공백 두 칸을 가운뎃점으로 바꾼다."""
    if word in FIX:
        return FIX[word]
    s = s.replace(' ', ' ').strip()
    s = re.sub(r'[,，]\s*$', '', s)
    s = re.sub(r',\s{2,}', ', ', s)
    s = re.sub(r'\s{2,}', ' · ', s)
    return s.strip(' ·')


def build(rows):
    book = dict(parts=[], days=[], tests=[], poly=[], poly_tests=[], index=[])
    day_no = 0
    seq = 0

    for pi, part in enumerate(PARTS):
        words = [r for r in rows if r['grade'] == part['key']]
        words.sort(key=lambda r: (r['word'].lower().lstrip("'"), r['word']))
        chunks = [words[i:i + WORDS_PER_DAY] for i in range(0, len(words), WORDS_PER_DAY)]
        first_day = day_no + 1

        for chunk in chunks:
            day_no += 1
            entries = []
            for j, r in enumerate(chunk):
                seq += 1
                entries.append(dict(
                    n=j + 1, seq=seq, word=r['word'],
                    mean=norm_mean(r['word'], r['mean']),
                    var=' / '.join(x for x in (r['v1'], r['v2']) if x),
                ))
                book['index'].append(dict(word=r['word'], day=day_no))
            book['days'].append(dict(day=day_no, part=pi, entries=entries,
                                     seq_from=entries[0]['seq'], seq_to=entries[-1]['seq']))

        book['parts'].append(dict(**part, count=len(words), day_from=first_day, day_to=day_no,
                                  days=len(chunks),
                                  seq_from=book['days'][first_day - 1]['seq_from'],
                                  seq_to=book['days'][day_no - 1]['seq_to']))

    # 단어 시험: DAY마다 그 DAY 100단어 전부를, 외운 순서대로 못 풀도록 섞어서 출제
    rnd = random.Random(SEED)
    for d in book['days']:
        qs = [dict(word=e['word'], mean=e['mean'], n=e['n']) for e in d['entries']]
        rnd.shuffle(qs)
        book['tests'].append(dict(day=d['day'], part=d['part'], questions=qs))

    # 다의어: 단어장 부록 + 다의어 시험이 함께 쓴다
    day_of = {e['word']: d['day'] for d in book['days'] for e in d['entries']}
    poly = [dict(word=w, means=ms, day=day_of[w]) for w, ms in POLYSEMY]
    poly.sort(key=lambda x: x['word'].lower())
    book['poly'] = poly

    shuffled = list(poly)
    rnd.shuffle(shuffled)
    for i in range(0, len(shuffled), POLY_PER_PAGE):
        book['poly_tests'].append(dict(
            no=len(book['poly_tests']) + 1,
            questions=[dict(word=p['word'], means=p['means']) for p in shuffled[i:i + POLY_PER_PAGE]],
        ))

    book['index'].sort(key=lambda x: (x['word'].lower().lstrip("'."), x['word']))
    return book


def verify(rows, book):
    entries = [e for d in book['days'] for e in d['entries']]
    assert len(entries) == len(rows), '단어 수가 원본과 다릅니다'
    assert {e['word'] for e in entries} == {r['word'] for r in rows}, '빠지거나 늘어난 단어가 있습니다'
    assert [e['seq'] for e in entries] == list(range(1, len(rows) + 1)), '통번호가 연속이 아닙니다'
    assert all(len(d['entries']) == WORDS_PER_DAY for d in book['days']), 'DAY 분량이 고르지 않습니다'

    grade_of = {r['word']: r['grade'] for r in rows}
    for i, part in enumerate(book['parts']):
        ws = [e['word'] for d in book['days'] if d['part'] == i for e in d['entries']]
        assert len(ws) == part['count']
        assert all(grade_of[w] == part['key'] for w in ws), f"PART {part['roman']} 등급이 섞였습니다"
        keys = [w.lower().lstrip("'") for w in ws]
        assert keys == sorted(keys), f"PART {part['roman']} 알파벳순이 아닙니다"

    day_of = {e['word']: d['day'] for d in book['days'] for e in d['entries']}
    assert len(book['index']) == len(rows)
    assert all(it['day'] == day_of[it['word']] for it in book['index']), '색인 DAY 번호가 틀렸습니다'

    # 시험지는 그 DAY 단어를 하나도 빠뜨리지 않고 딱 한 번씩 낸다
    assert len(book['tests']) == len(book['days'])
    for t, d in zip(book['tests'], book['days']):
        assert t['day'] == d['day']
        assert len(t['questions']) == WORDS_PER_DAY
        assert sorted(q['word'] for q in t['questions']) == sorted(e['word'] for e in d['entries']), \
            f"DAY {d['day']} 시험 문항이 그 DAY 단어와 다릅니다"

    # 다의어는 모두 3,000단어 안에 있고, 뜻이 둘 이상이어야 한다
    words = {r['word'] for r in rows}
    missing = [p['word'] for p in book['poly'] if p['word'] not in words]
    assert not missing, f'3,000단어에 없는 다의어: {missing}'
    dup = [w for w in {p['word'] for p in book['poly']}
           if sum(1 for p in book['poly'] if p['word'] == w) > 1]
    assert not dup, f'다의어 목록에 겹치는 단어: {dup}'
    assert all(len(p['means']) >= 2 for p in book['poly']), '뜻이 하나뿐인 다의어가 있습니다'
    pool = {p['word'] for p in book['poly']}
    asked = [q['word'] for t in book['poly_tests'] for q in t['questions']]
    assert sorted(asked) == sorted(pool), '다의어 시험이 목록과 맞지 않습니다'


if __name__ == '__main__':
    rows = read_source(SRC)
    book = build(rows)
    verify(rows, book)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(book, f, ensure_ascii=False)

    n_poly = len(book['poly'])
    n_mean = sum(len(p['means']) for p in book['poly'])
    print(f'{len(rows):,}단어 -> DAY {len(book["days"])}개 × {WORDS_PER_DAY}단어')
    for p in book['parts']:
        print(f'  PART {p["roman"]:<3} {p["ko"]:<12} {p["count"]:>5,}단어  '
              f'DAY {p["day_from"]:02d}-{p["day_to"]:02d}  #{p["seq_from"]:04d}-{p["seq_to"]:04d}')
    print(f'단어 시험 {len(book["tests"])}회 × {WORDS_PER_DAY}문항')
    print(f'다의어 {n_poly}단어 · 뜻 {n_mean}개 (평균 {n_mean / n_poly:.1f}개)  '
          f'-> 다의어 시험 {len(book["poly_tests"])}회')
    print('검증 통과 ->', OUT)
