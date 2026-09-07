# -*- coding: utf-8 -*-
"""지문을 문장 단위로 자른다. 순서/문장삽입 문항이 이 인덱스를 참조한다."""
import json, re, os

HERE = os.path.dirname(os.path.abspath(__file__))

# 약어 뒤 마침표에서는 자르지 않는다.
_NOSPLIT = r'(?<!Mr)(?<!Mrs)(?<!Dr)(?<!e\.g)(?<!i\.e)(?<!etc)(?<!U\.S)(?<!vs)'
_BOUND = re.compile(_NOSPLIT + r'(?<=[.!?])(["”\)]?)\s+(?=[A"“(<‘A-Z])')

_INITIAL = re.compile(r'(?<![A-Za-z])([A-Z])\.(?=\s+[A-Z])')
_MARK = '\uE000'

def split_sentences(text):
    text = ' '.join(text.split())
    # "F. Scott"처럼 이름 이니셜의 마침표는 문장 끝이 아니므로 잠시 감춘다.
    text = _INITIAL.sub(lambda m: m.group(1) + _MARK, text)
    out, last = [], 0
    for m in _BOUND.finditer(text):
        out.append(text[last:m.end(1)].strip())
        last = m.end()
    tail = text[last:].strip()
    if tail:
        out.append(tail)
    return [s.replace(_MARK, '.') for s in out if s]

def load():
    with open(os.path.join(HERE, 'passages.json'), encoding='utf-8') as f:
        rows = json.load(f)
    for r in rows:
        r['sents'] = split_sentences(r['en'])
        # 되붙였을 때 원문과 같아야 한다.
        assert ' '.join(r['sents']) == ' '.join(r['en'].split()), r['id']
    return rows

if __name__ == '__main__':
    rows = load()
    for r in rows:
        print('=' * 70)
        print(r['id'], f"({len(r['sents'])}문장)")
        for i, s in enumerate(r['sents']):
            print(f'  [{i}] {s}')
