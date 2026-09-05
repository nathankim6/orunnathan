# -*- coding: utf-8 -*-
"""패러프레이즈 표의 각 칸이 한 줄에 들어가는지 검사한다.
칸마다 서로 다른 baseline 이 두 개 이상이면 줄바꿈이 일어난 것.
본문 폭 밖의 세로 LESSON 탭(왼쪽 면은 x<15mm, 오른쪽 면은 x>195mm)은 세지 않고,
합자(ﬁ ﬂ ﬀ …)가 낱 글리프 스팬으로 쪼개져 나온 것은 이어 붙여 읽는다."""
import sys, unicodedata, pymupdf
LEFT, RIGHT = 42.5, 552.0      # 본문 좌·우 한계(pt): 왼쪽 면 안쪽 15mm · 오른쪽 면 바깥 195mm (legend.py 와 같은 값)
doc = pymupdf.open(sys.argv[1] if len(sys.argv) > 1 else "book.pdf")
bad = 0

def join(spans):
    """x 순으로 늘어놓고, 앞 스팬 끝에 붙어 있는 스팬(간격 < 1.2pt = 합자 글리프)은 공백 없이 잇는다."""
    out, px = "", None
    for x0, x1, t in sorted(spans):
        t = unicodedata.normalize("NFKC", t)           # ﬁ→fi ﬂ→fl ﬀ→ff
        if px is not None and x0 - px >= 1.2 and not out.endswith(" ") and not t.startswith(" "): out += " "
        out += t; px = x1
    return " ".join(out.split())

for pi in range(doc.page_count):
    pg = doc[pi]
    hits = pg.search_for("같은 뜻으로 바꾸어 쓰기")
    if not hits: continue
    top, mid = hits[0].y1, hits[0].x0 - 6
    bot = min([b.y0 for b in pg.search_for("보기") if b.y0 > top] or [pg.rect.height])
    clip = pymupdf.Rect(LEFT - 6, top, RIGHT + 6, bot)          # 세로 탭(본문 폭 밖)은 잘라 낸다
    cols = {"원문": [], "바꾸어 쓰기": []}
    for blk in pg.get_text("dict", clip=clip)["blocks"]:
        for ln in blk.get("lines", []):
            for sp in ln["spans"]:
                if not sp["text"].strip(): continue
                x0, x1 = sp["bbox"][0], sp["bbox"][2]
                if x0 > RIGHT + 6 or x1 < LEFT - 6: continue
                cols["원문" if x0 < mid else "바꾸어 쓰기"].append(
                    (round(sp["bbox"][3], 1), x0, x1, sp["text"]))
    for name, spans in cols.items():
        ys = sorted({y for y, _, _, _ in spans})
        # baseline 이 6pt 이내면 같은 줄
        rows = []
        for y in ys:
            if rows and y - rows[-1] < 6: continue
            rows.append(y)
        if len(rows) > 5:
            bad += 1
            extra = len(rows) - 5
            print(f"p{pi+1:>2}  {name} 칸이 {extra}줄 넘침 (줄 {len(rows)} / 문항 5)")
            for y in rows:
                line = join([(x0, x1, t) for yy, x0, x1, t in spans if abs(yy - y) < 6])
                print(f"        {line[:84]}")
print("── 패러프레이즈 전 칸 한 줄" if not bad else f"── 넘치는 칸 {bad}개")
sys.exit(1 if bad else 0)
