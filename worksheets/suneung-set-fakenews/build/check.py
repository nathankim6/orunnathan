# -*- coding: utf-8 -*-
"""출제 데이터 전수 점검. 문서를 내보내기 전에 항상 통과해야 한다."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from split import load
from items import ITEMS, TYPE_ORDER, TYPES
from balance import balance, ORDER_MAPS, CIRCLE
from render import order_blocks, insert_text

def main():
    rows = load()
    balance(ITEMS, rows)
    bad, n = [], 0

    def err(pid, kind, msg):
        bad.append(f'[{pid} · {TYPES[kind]["label"]}] {msg}')

    for r in rows:
        pid, sents, en = r['id'], r['sents'], r['en']
        it = ITEMS.get(pid)
        if not it:
            bad.append(f'[{pid}] 출제 데이터 없음')
            continue
        for kind in TYPE_ORDER:
            if kind not in it:
                if kind != 'insert':
                    err(pid, kind, '유형 누락')
                continue
            d, n = it[kind], n + 1
            if not 1 <= d['ans'] <= 5:
                err(pid, kind, f'정답 번호 오류 {d["ans"]}')
            if not d.get('sol', '').strip():
                err(pid, kind, '해설 없음')

            if kind in ('order', 'insert'):
                pass
            elif len(d.get('ch', [])) != 5:
                err(pid, kind, f'보기 수 {len(d.get("ch", []))}개')
            elif len(set(map(str, d['ch']))) != 5:
                err(pid, kind, '중복된 보기')
            if d.get('tr') and len(d['tr']) != 5:
                err(pid, kind, '보기 해석 수 불일치')

            if kind == 'implication' and d['phrase'] not in en:
                err(pid, kind, '밑줄 구문이 원문에 없음')
            if kind == 'blank' and d['target'] not in en:
                err(pid, kind, '빈칸 구문이 원문에 없음')

            if kind == 'mismatch' and not d['sol'].lstrip().startswith(CIRCLE[d['ans'] - 1]):
                err(pid, kind, '해설 첫머리 번호가 정답과 다름')
            if kind in ('implication', 'mainPoint', 'topic', 'title', 'blank',
                        'summary', 'insert') and CIRCLE[d['ans'] - 1] not in d['sol']:
                err(pid, kind, '해설에 정답 번호가 없음')

            if kind == 'order':
                lead, blocks = order_blocks(sents, d['lead'], d['cuts'], d['ans'])
                seq = ORDER_MAPS[d['ans']]
                tag = dict(blocks)
                joined = lead + ' ' + ' '.join(tag[t] for t in seq)
                if joined != ' '.join(sents):
                    err(pid, kind, '블록을 정답 순서로 이으면 원문과 달라짐')
                for t, txt in blocks:
                    if not txt.strip():
                        err(pid, kind, f'({t}) 블록이 비어 있음')
                if CIRCLE[d['ans'] - 1] in d['sol']:
                    err(pid, kind, '해설에 번호를 쓰면 라벨 변경 시 어긋남')

            if kind == 'insert':
                given, body = insert_text(sents, d['take'], d['ans'])
                marks = [c for c in CIRCLE if f'( {c} )' in body]
                if marks != list(CIRCLE):
                    err(pid, kind, f'표시가 5개가 아님 {marks}')
                if given != sents[d['take']]:
                    err(pid, kind, '주어진 문장이 원문 문장과 다름')
                restored = body.replace(f'( {CIRCLE[d["ans"] - 1]} )', given)
                for c in CIRCLE:
                    restored = restored.replace(f'( {c} )', '')
                if ' '.join(restored.split()) != ' '.join(sents):
                    err(pid, kind, '정답 자리에 넣어도 원문이 복원되지 않음')

    print(f'점검 문항 {n}개')
    if bad:
        print(f'문제 {len(bad)}건')
        for b in bad:
            print('  -', b)
        return 1
    print('이상 없음')
    return 0

if __name__ == '__main__':
    sys.exit(main())
