# -*- coding: utf-8 -*-
"""원본 엑셀(3,000단어)을 난이도순 DAY 구성으로 재배치해 book.json을 만든다.

원본은 알파벳순 한 덩어리(등급 열만 초등/중고/전문)이고,
결과는 초등 -> 중고 -> 전문 3개 파트로 나뉜 뒤 파트 안에서만 알파벳순으로 정렬된다.
한 DAY는 40단어, DAY 5개마다 REVIEW TEST 32문항이 붙는다.

    python3 prep.py            # ../source/단어장_원본_3000.xls -> book.json
"""
import json
import os
import random
import re

import xlrd

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'source', '단어장_원본_3000.xls')
OUT = os.path.join(HERE, 'book.json')

WORDS_PER_DAY = 40
DAYS_PER_REVIEW = 5
QUESTIONS_PER_REVIEW = 32
SEED = 20260906          # REVIEW 문항 표본을 고정해 다시 돌려도 같은 책이 나오게 한다

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
    s = s.replace(' ', ' ').strip()
    s = re.sub(r'[,，]\s*$', '', s)
    s = re.sub(r',\s{2,}', ', ', s)
    s = re.sub(r'\s{2,}', ' · ', s)
    return s.strip(' ·')


def build(rows):
    book = dict(parts=[], days=[], reviews=[], index=[])
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

    # REVIEW TEST: DAY 5개(200단어)마다 32문항, A(영->한) 16 + B(한->영) 16
    rnd = random.Random(SEED)
    for i in range(0, len(book['days']), DAYS_PER_REVIEW):
        group = book['days'][i:i + DAYS_PER_REVIEW]
        pool = [e for d in group for e in d['entries']]
        sample = [pool[k] for k in sorted(rnd.sample(range(len(pool)), QUESTIONS_PER_REVIEW))]
        book['reviews'].append(dict(
            no=len(book['reviews']) + 1,
            day_from=group[0]['day'], day_to=group[-1]['day'], part=group[0]['part'],
            a=[dict(word=e['word'], mean=e['mean']) for e in sample[0::2]],
            b=[dict(word=e['word'], mean=e['mean']) for e in sample[1::2]],
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

    for rv in book['reviews']:
        pool = {e['word'] for d in book['days']
                if rv['day_from'] <= d['day'] <= rv['day_to'] for e in d['entries']}
        qs = [q['word'] for q in rv['a']] + [q['word'] for q in rv['b']]
        assert len(qs) == QUESTIONS_PER_REVIEW and len(set(qs)) == QUESTIONS_PER_REVIEW
        assert set(qs) <= pool, f"REVIEW {rv['no']}에 범위 밖 단어가 있습니다"


if __name__ == '__main__':
    rows = read_source(SRC)
    book = build(rows)
    verify(rows, book)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(book, f, ensure_ascii=False)

    print(f'{len(rows):,}단어 -> DAY {len(book["days"])}개 · REVIEW {len(book["reviews"])}회')
    for p in book['parts']:
        print(f'  PART {p["roman"]:<3} {p["ko"]:<12} {p["count"]:>5,}단어  '
              f'DAY {p["day_from"]:02d}-{p["day_to"]:02d}  #{p["seq_from"]:04d}-{p["seq_to"]:04d}')
    print('검증 통과 ->', OUT)
