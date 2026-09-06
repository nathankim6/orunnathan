#!/usr/bin/env python3
"""빌드된 책 PDF를 최종 점검한다 — 면수, 두부 글자, 잔존 템플릿 문구."""
import sys, re, pymupdf
BAD = ['스티브에게 일어난 일 ⓐ~ⓓ', '이야기 속 사건과 축제의 모습 ⓐ~ⓓ']  # 2권 1·2단원은 정본 지문이므로 예외
for pdf in sys.argv[1:]:
    d = pymupdf.open(pdf)
    txt = [p.get_text() for p in d]
    tofu = [i + 1 for i, t in enumerate(txt) if '�' in t]
    left = [(i + 1, b) for i, t in enumerate(txt) for b in BAD if b in t]
    print(f"{pdf}: {d.page_count}면, 두부 {len(tofu)}면 {tofu[:6]}, 템플릿 잔존 {left}")
