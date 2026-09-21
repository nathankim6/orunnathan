#!/usr/bin/env python3
"""본문 면이 넘친 유닛의 유연 여백(spF)만 단계적으로 줄여 면수를 맞춘다.

넘친 면(pg)에 달린 spF 의 기준값만 비율로 줄인다. 글·표·선지는 건드리지 않는다.
"""
import re, sys, subprocess, os, pymupdf

def build(book):
    env = dict(os.environ, ORUN_WORK=f'{book}/work', ORUN_OUT=f'{book}/work/book.docx')
    subprocess.run(['node', f'{book}/scripts/generate_book.js'], env=env, capture_output=True)
    subprocess.run(['python3', f'{book}/scripts/fix_fontkeys.py', f'{book}/work/book.docx'], capture_output=True)
    subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir',
                    f'{book}/work', f'{book}/work/book.docx'], capture_output=True)
    return pymupdf.open(f'{book}/work/book.pdf')

def body_over(doc):
    first = next(i for i, p in enumerate(doc, 1) if '정답 및 해설' in p.get_text())
    cur = start = None; spans = []
    for i in range(1, first):
        m = re.search(r'UNIT (\d{2})', doc[i-1].get_text())
        u = m.group(1) if m else cur
        if u != cur:
            if cur: spans.append((cur, i - start))
            cur, start = u, i
    spans.append((cur, first - start))
    return [u for u, n in spans if u and n > (10 if int(u) % 3 == 1 else 5)]

def shrink(path, ratio):
    s = open(path, encoding='utf-8').read()
    def rep(m):
        return 'spF(%s, %d, %s)' % (m.group(1), max(20, int(int(m.group(2)) * ratio)), m.group(3))
    new = re.sub(r'spF\((\d+), (\d+), ([\d.]+)\)', rep, s)
    if new != s: open(path, 'w', encoding='utf-8').write(new)
    return new != s

def main(book):
    doc = build(book)
    print(f'{book} 시작 {doc.page_count}면')
    for k, ratio in enumerate([0.75, 0.55, 0.40], 1):
        bad = body_over(doc)
        if not bad: break
        for u in bad: shrink(f'{book}/units/unit{u}.js', ratio)
        doc = build(book)
        print(f'  {k}단계(여백 {int(ratio*100)}%): {len(bad)}개 유닛 → {doc.page_count}면')
    print(f'{book} 최종 {doc.page_count}면, 남은 본문 초과 {body_over(doc)}')

if __name__ == '__main__':
    main(sys.argv[1])
