# -*- coding: utf-8 -*-
"""HTML 원본과 PDF 추출 텍스트를 대조해 잘려 나간 내용을 찾는다."""
import re, sys, html, pymupdf

BASE = sys.argv[1] if len(sys.argv) > 1 else "book"
src = open(BASE + ".html", encoding="utf-8").read()
src = re.sub(r"<style[\s\S]*?</style>", "", src)
src = re.sub(r"<script[\s\S]*?</script>", "", src)
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
    # 본문이 아래 여백(18mm)으로 흘러 푸터와 겹치는지 — 본문 하한 790.9pt(=279mm), 푸터 글줄은 y0 ≥ 806.
    # 푸터 자신의 스팬(.rf 의 글귀이면서 'ORUN ENGLISH' 와 같은 글줄)만 빼고, 그 아래로 내려온 본문 스팬은 전부 잡는다
    # — 푸터 안으로 통째로 밀려 들어간 캡션(y0 ≥ 806)도 침범이다. 본문 폭 밖의 세로 탭은 제외.
    rf = re.search(r'<div class="rf">([\s\S]*?)</div>', p)
    ftxt = re.sub(r"\s+", "", plain(rf.group(1))) if rf else ""
    fb = doc[i].search_for("ORUN ENGLISH")
    fy = fb[0].y1 if fb and ftxt else None
    intr = []
    for b in doc[i].get_text("dict")["blocks"]:
        for ln in b.get("lines", []):
            for sp in ln["spans"]:
                x0, y0, x1, y1 = sp["bbox"]
                t = sp["text"].strip()
                if not t or y1 <= 793 or x0 > 558 or x1 < 30: continue
                if fy is not None and abs(y1 - fy) < 2.5 and re.sub(r"\s+", "", t) in ftxt: continue   # 푸터 글줄
                intr.append(t)
    if intr:
        bad += 1
        print(f"p{i+1:>2}  푸터 침범 {len(intr)}개 스팬: " + " ".join(intr[:6])[:80])
print("── 잘린 면 없음" if not bad else f"── 잘린 면 {bad}개")
sys.exit(1 if bad else 0)
