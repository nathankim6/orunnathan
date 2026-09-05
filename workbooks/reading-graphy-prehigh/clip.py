# -*- coding: utf-8 -*-
"""HTML 원본과 PDF 추출 텍스트를 대조해 잘려 나간 내용을 찾는다."""
import re, sys, html, pymupdf

BASE = sys.argv[1] if len(sys.argv) > 1 else "book"
src = open(BASE + ".html", encoding="utf-8").read()
src = re.sub(r"<style[\s\S]*?</style>", "", src)
src = re.sub(r"<svg[\s\S]*?</svg>", " ", src)

# .page 단위로 분리
parts = [x[x.index(">")+1:] for x in src.split('<div class="page')[1:]]
def plain(h):
    h = re.sub(r"<[^>]+>", " ", h)
    h = html.unescape(h)
    return re.sub(r"\s+", " ", h).strip()

doc = pymupdf.open(BASE + ".pdf")
assert len(parts) == doc.page_count, f"page mismatch {len(parts)} vs {doc.page_count}"

bad = 0
for i, p in enumerate(parts):
    want = plain(p)
    got  = re.sub(r"\s+", "", doc[i].get_text()).lower()
    toks = [t for t in re.split(r"\s+", want) if len(re.sub(r"[^\w가-힣]", "", t)) >= 2]
    miss = [t for t in toks if re.sub(r"\s+", "", t).lower() not in got]
    if miss:
        bad += 1
        print(f"p{i+1:>2}  잘림 {len(miss)}/{len(toks)} 토큰 누락")
        print("      " + " ".join(miss[:14]) + (" …" if len(miss) > 14 else ""))
    # 본문이 아래 여백(18mm)으로 흘러 푸터와 겹치는지 — 본문 하한 790.9pt, 푸터 글줄은 y0 ≥ 806
    intr = []
    for b in doc[i].get_text("dict")["blocks"]:
        for ln in b.get("lines", []):
            for sp in ln["spans"]:
                y0, y1 = sp["bbox"][1], sp["bbox"][3]
                if sp["text"].strip() and y1 > 793 and y0 < 806: intr.append(sp["text"].strip())
    if intr:
        bad += 1
        print(f"p{i+1:>2}  푸터 침범 {len(intr)}개 스팬: " + " ".join(intr[:6])[:80])
print("── 잘린 면 없음" if not bad else f"── 잘린 면 {bad}개")
sys.exit(1 if bad else 0)
