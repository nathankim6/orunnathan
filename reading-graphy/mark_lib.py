"""완성된 학생용 PDF의 문항 위에 정답을 직접 표시한다(교사용).

판면을 다시 만들지 않고 좌표 기반으로 표시만 얹으므로 면수·조판이 그대로다.
표시는 선지에 붉은 타원, 빈칸·필기란에 붉은 글씨, T/F·괄호에 붉은 표시.
"""
import re, os
import pymupdf

S = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(S, 'rg2', 'assets', 'fonts', 'NotoSansKR-700.ttf')
RED = (0.80, 0.10, 0.10)
CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩'

class Page:
    """한 면의 글자 위치를 다루는 얇은 도우미."""
    def __init__(self, page):
        self.p = page
        self.lines = []          # (x0, y0, x1, y1, text)
        for b in page.get_text('dict')['blocks']:
            for l in b.get('lines', []):
                t = ''.join(s['text'] for s in l['spans'])
                if t.strip():
                    x0, y0, x1, y1 = l['bbox']
                    self.lines.append((x0, y0, x1, y1, t.strip()))
        self.lines.sort(key=lambda r: (round(r[1], 1), r[0]))
        self.words = page.get_text('words')      # (x0,y0,x1,y1,word,b,l,w)
        self._fontname = None

    # ── 찾기 ──
    def line_starting(self, prefix, xmax=None, ymin=None, ymax=None):
        for x0, y0, x1, y1, t in self.lines:
            if not t.startswith(prefix): continue
            if xmax is not None and x0 > xmax: continue
            if ymin is not None and y0 < ymin: continue
            if ymax is not None and y0 > ymax: continue
            return (x0, y0, x1, y1, t)
        return None

    def line_containing(self, sub, ymin=None, ymax=None, xmin=None):
        for x0, y0, x1, y1, t in self.lines:
            if sub not in t: continue
            if ymin is not None and y0 < ymin: continue
            if ymax is not None and y0 > ymax: continue
            if xmin is not None and x0 < xmin: continue
            return (x0, y0, x1, y1, t)
        return None

    def blanks(self, ymin=None, ymax=None):
        """밑줄 빈칸(______)의 상자를 위→아래, 왼→오른쪽 순으로 돌려준다."""
        out = []
        for x0, y0, x1, y1, w, *_ in self.words:
            if len(w) >= 4 and set(w) <= set('_＿'):
                if ymin is not None and y0 < ymin: continue
                if ymax is not None and y0 > ymax: continue
                out.append((x0, y0, x1, y1))
        out.sort(key=lambda r: (round(r[1], 1), r[0]))
        return out

    def boxes(self, ymin=None, ymax=None, xmin=None):
        """체크칸(□)의 상자."""
        out = []
        for x0, y0, x1, y1, w, *_ in self.words:
            if '□' not in w: continue
            if ymin is not None and y0 < ymin: continue
            if ymax is not None and y0 > ymax: continue
            if xmin is not None and x0 < xmin: continue
            out.append((x0, y0, x1, y1, w))
        out.sort(key=lambda r: (round(r[1], 1), r[0]))
        return out

    # ── 그리기 ──
    def font(self):
        if self._fontname is None:
            self._fontname = 'KRB'
            self.p.insert_font(fontname='KRB', fontfile=FONT)
        return self._fontname

    def ellipse(self, rect, pad=2.2):
        x0, y0, x1, y1 = rect
        r = pymupdf.Rect(x0 - pad, y0 - pad, x1 + pad, y1 + pad)
        self.p.draw_oval(r, color=RED, width=1.1)

    def underline(self, rect, dy=1.6):
        x0, y0, x1, y1 = rect
        self.p.draw_line(pymupdf.Point(x0, y1 + dy), pymupdf.Point(x1, y1 + dy),
                         color=RED, width=1.0)

    def text(self, x, y, s, size=7.2):
        if not s: return
        self.p.insert_text(pymupdf.Point(x, y), s, fontname=self.font(),
                           fontsize=size, color=RED)

    def text_fit(self, x, y, s, width, size=7.2, minsize=5.2):
        """폭에 맞춰 글자 크기를 줄여 넣는다."""
        f = pymupdf.Font(fontfile=FONT)
        while size > minsize and f.text_length(s, size) > width:
            size -= 0.3
        self.text(x, y, s, size)
        return size
