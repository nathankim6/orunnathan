#!/usr/bin/env python3
"""해설이 정해진 면수를 넘으면 여백을 단계적으로 줄여 맞춘다.

빌드 환경(글꼴·LibreOffice 판)에 따라 해설이 한 면씩 밀리는 일이 있어,
넘치는 유닛만 골라 B·Hs 의 여백을 조인다. 본문은 건드리지 않는다.
"""
import re, sys, subprocess, os, pymupdf

STEPS = [('after: last ? 200 : 38, line: 258', 'after: last ? 150 : 26, line: 244',
          'K.push(sp(82)); H(s); K.push(sp(46));', 'K.push(sp(56)); H(s); K.push(sp(30));'),
         ('after: last ? 150 : 26, line: 244', 'after: last ? 110 : 18, line: 236',
          'K.push(sp(56)); H(s); K.push(sp(30));', 'K.push(sp(40)); H(s); K.push(sp(22));'),
         ('after: last ? 110 : 18, line: 236', 'after: last ? 90 : 14, line: 230',
          'K.push(sp(40)); H(s); K.push(sp(22));', 'K.push(sp(30)); H(s); K.push(sp(16));')]

def build(book):
    env = dict(os.environ, ORUN_WORK=f'{book}/work', ORUN_OUT=f'{book}/work/book.docx')
    subprocess.run(['node', f'{book}/scripts/generate_book.js'], env=env, capture_output=True)
    subprocess.run(['python3', f'{book}/scripts/fix_fontkeys.py', f'{book}/work/book.docx'], capture_output=True)
    subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir',
                    f'{book}/work', f'{book}/work/book.docx'], capture_output=True)
    return pymupdf.open(f'{book}/work/book.pdf')

def over_units(doc):
    first = next(i for i, p in enumerate(doc, 1) if '정답 및 해설' in p.get_text())
    cur = start = None; spans = []
    for i in range(first, doc.page_count + 1):
        m = re.search(r'UNIT (\d{2})', doc[i-1].get_text())
        u = m.group(1) if m else cur
        if u != cur:
            if cur: spans.append((cur, i - start))
            cur, start = u, i
    spans.append((cur, doc.page_count - start + 1))
    return [u for u, n in spans if u and n > (3 if int(u) % 3 == 1 else 2)]

def main(book):
    doc = build(book)
    print(f'{book} 시작 {doc.page_count}면')
    for k, (a, b, c, d) in enumerate(STEPS, 1):
        bad = over_units(doc)
        if not bad: break
        for u in bad:
            f = f'{book}/units/unit{u}.js'
            s = open(f, encoding='utf-8').read()
            open(f, 'w', encoding='utf-8').write(s.replace(a, b).replace(c, d))
        doc = build(book)
        print(f'  {k}단계: {len(bad)}개 유닛 조정 → {doc.page_count}면')
    print(f'{book} 최종 {doc.page_count}면, 남은 초과 유닛 {over_units(doc)}')

if __name__ == '__main__':
    main(sys.argv[1])
