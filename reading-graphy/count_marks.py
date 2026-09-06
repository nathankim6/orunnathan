#!/usr/bin/env python3
"""교사용 PDF의 붉은 표시(타원·밑줄·글자) 수를 면별로 센다 — 판본 비교용."""
import sys, pymupdf
def counts(path):
    d = pymupdf.open(path); out = {}
    for i, p in enumerate(d, 1):
        k = sum(1 for dr in p.get_drawings()
                if (dr.get('color') or dr.get('fill'))
                and abs(((dr.get('color') or dr.get('fill'))[0]) - 0.80) < 0.02)
        if k: out[i] = k
    return out
if __name__ == '__main__':
    a, b = counts(sys.argv[1]), counts(sys.argv[2])
    diff = {p: (a.get(p, 0), b.get(p, 0)) for p in set(a) | set(b) if a.get(p, 0) != b.get(p, 0)}
    print(f"{sys.argv[1]}: {sum(a.values())}개 / {len(a)}면")
    print(f"{sys.argv[2]}: {sum(b.values())}개 / {len(b)}면")
    print("차이 면:", dict(sorted(diff.items())))
