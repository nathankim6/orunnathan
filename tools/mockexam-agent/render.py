#!/usr/bin/env python3
"""문제 JSON(spec) 한 벌을 HWPX 시험지와 HTML 미리보기로 만든다.

  python3 render.py <spec.json> <out.hwpx> [--html out.html] [--no-key]

spec 형식 (자세한 것은 README.md):
  {"school":"동양중학교","grade":1,"term":2,"exam":"중간고사","subject":"영어","set":1,
   "range":"Lesson 5~6", "items":[ ... ]}
item.kind:
  group : {"label":"[12~13]","direction":"다음 대화를 읽고 물음에 답하시오.","box":BOX}
  mc    : {"no":1,"points":3,"stem":"…","box":BOX?,"choices":[5개] | "choices_table":{"header":[…],"rows":[[…]]},
           "inline":true?, "answer":3, "explain":"…", "source":"…"}
  essay : {"no":"서답형1","points":5,"stem":"…","box":BOX?,"condition":[…]?,"answer_lines":1,"answer":"…","explain":"…","source":"…"}
BOX = "한 줄\\n두 줄" 또는 {"lines":[…], "title":"…"?}
줄 안 표시: <u>밑줄</u> <b>굵게</b> <i>기울임</i>, 빈칸은 ______ 그대로.
"""
import html as H, json, re, sys
from pathlib import Path

FONT = '함초롬바탕'
BODY_PT = 10
MM = 7200 / 25.4                      # HWPUNIT per mm
PAGE = dict(paper_size='A4', margins_mm={'left': 20, 'right': 20, 'top': 18, 'bottom': 15, 'header': 6, 'footer': 8})
COL_GAP_MM = 8
COL_W = int((210 - 40 - COL_GAP_MM) / 2 * MM)          # 한 단 너비(HWPUNIT)
BOX_W = COL_W - int(1.5 * MM)
CIRC = '①②③④⑤⑥⑦⑧⑨⑩'
TOKEN = re.compile(r'(</?[ubi]>)')


def box_lines(box):
    if box is None:
        return None, []
    if isinstance(box, str):
        return None, box.split('\n')
    return box.get('title'), list(box.get('lines', []))


def runs_of(text):
    """'<u>a</u> b' → [(text, {'u':bool,'b':bool,'i':bool}), …]"""
    flags, out = {'u': False, 'b': False, 'i': False}, []
    for tok in TOKEN.split(text):
        if not tok:
            continue
        m = re.fullmatch(r'<(/?)([ubi])>', tok)
        if m:
            flags[m.group(2)] = (m.group(1) == '')
        else:
            out.append((tok, dict(flags)))
    return out


def title_of(spec):
    return spec.get('title') or f"{spec['school']} {spec['grade']}학년 {spec['term']}학기 {spec['exam']}"


def subtitle_of(spec):
    s = spec.get('subject', '영어')
    r = f" ({spec['range']})" if spec.get('range') else ''
    return f"{s} · 동형 모의고사 {spec.get('set', 1)}회{r}"


def points_str(it):
    return f" [{it['points']}점]" if it.get('points') else ''


def stem_no(it):
    no = it['no']
    return f"[{no}]" if isinstance(no, str) and not no.isdigit() else f"{no}."


# ──────────────────────────────── HWPX ────────────────────────────────
class Hwpx:
    def __init__(self):
        from hwpx.document import HwpxDocument
        self.doc = HwpxDocument.new()
        self.doc.page.setup(**PAGE)
        st = self.doc.styles
        self.cp = {
            'base': st.ensure_run(font=FONT, size=BODY_PT),
            'b': st.ensure_run(font=FONT, size=BODY_PT, bold=True),
            'u': st.ensure_run(font=FONT, size=BODY_PT, underline=True),
            'i': st.ensure_run(font=FONT, size=BODY_PT, italic=True),
            'ub': st.ensure_run(font=FONT, size=BODY_PT, bold=True, underline=True),
            'title': st.ensure_run(font=FONT, size=16, bold=True),
            'sub': st.ensure_run(font=FONT, size=10),
            'small': st.ensure_run(font=FONT, size=9),
            'key': st.ensure_run(font=FONT, size=13, bold=True),
        }
        self.border = st.ensure_border_fill(border_color='#000000', border_width='0.12 mm')
        self.first_body = None

    def cpid(self, f):
        if f.get('u') and f.get('b'):
            return self.cp['ub']
        return self.cp['u'] if f.get('u') else self.cp['b'] if f.get('b') else self.cp['i'] if f.get('i') else self.cp['base']

    def para(self, text='', *, cp=None, target=None, **attrs):
        """target 이 없으면 본문, 있으면 표 칸. 줄 안 표시를 run 으로 나눈다."""
        if target is None:
            p = self.doc.add_paragraph('', char_pr_id_ref=cp or self.cp['base'], include_run=False, **attrs)
        else:
            p = target.add_paragraph('', char_pr_id_ref=cp or self.cp['base'])
        for t, f in (runs_of(text) if text else []):
            p.add_run(t, char_pr_id_ref=cp if cp else self.cpid(f))
        if self.first_body is None and target is None and attrs.get('_body'):
            self.first_body = p
        return p

    def fmt(self, p, **kw):
        idx = self.doc.paragraphs.index(p) if p in self.doc.paragraphs else None
        if idx is not None:
            self.doc.styles.apply_paragraph_format(paragraph_index=idx, **kw)

    def box(self, box, width=BOX_W):
        title, lines = box_lines(box)
        if not lines and not title:
            return
        t = self.doc.add_table(1, 1, width=width, border_fill_id_ref=self.border)
        c = t.cell(0, 0)
        c.set_size(width=width)
        # 표를 만들며 생긴 첫 문단을 첫 줄로 쓴다(빈 줄이 남지 않게)
        seq = ([('<b>' + title + '</b>')] if title else []) + lines
        for i, ln in enumerate(seq):
            if i == 0 and c.paragraphs:
                p = c.paragraphs[0]
                for t, f in runs_of(ln):
                    p.add_run(t, char_pr_id_ref=self.cpid(f))
            else:
                self.para(ln, target=c)
        self.doc.add_paragraph('', char_pr_id_ref=self.cp['small'], include_run=False)   # 상자 아래 숨

    def choices(self, it):
        if it.get('choices_table'):
            ct = it['choices_table']
            rows = [ct['header']] + ct['rows'] if ct.get('header') else ct['rows']
            t = self.doc.add_table(len(rows), len(rows[0]), width=BOX_W, border_fill_id_ref=self.border)
            for r, row in enumerate(rows):
                for cidx, v in enumerate(row):
                    t.cell(r, cidx).set_text(str(v))
            self.doc.add_paragraph('', char_pr_id_ref=self.cp['small'], include_run=False)
            return
        ch = it.get('choices', [])
        if it.get('inline'):
            self.para('    '.join(f'{CIRC[i]} {c}' for i, c in enumerate(ch)))
        else:
            for i, c in enumerate(ch):
                lines = c.split('\n')
                self.para(f'{CIRC[i]} {lines[0]}')
                for extra in lines[1:]:
                    self.para('    ' + extra)

    def build(self, spec, key=True):
        d = self.doc
        p = self.para(title_of(spec), cp=self.cp['title'])
        self.fmt(p, alignment='CENTER')
        p = self.para(subtitle_of(spec), cp=self.cp['sub'])
        self.fmt(p, alignment='CENTER', spacing_after_pt=4)
        p = self.para(f"{spec['grade']}학년  (    )반  (    )번  이름 (              )", cp=self.cp['sub'])
        self.fmt(p, alignment='RIGHT', spacing_after_pt=6, bottom_border=True, border_color='#000000')
        # 여기서부터 2단
        gap = int(COL_GAP_MM * MM)
        p = self.para('', cp=self.cp['small'])
        d.page.set_columns(2, paragraph=p, same_gap=gap)
        for it in spec['items']:
            k = it.get('kind', 'mc')
            if k == 'group':
                p = self.para(f"{it['label']} {it['direction']}", cp=self.cp['b'])
                self.fmt(p, spacing_before_pt=6, keep_with_next=True)
                self.box(it.get('box'))
                continue
            p = self.para(f"{stem_no(it)} {it['stem']}{points_str(it)}")
            self.fmt(p, spacing_before_pt=7, keep_with_next=True)
            if it.get('box'):
                self.box(it['box'])
            if k == 'mc':
                self.choices(it)
            else:
                if it.get('condition'):
                    self.box({'title': '<조건>', 'lines': it['condition']})
                for i in range(it.get('answer_lines', 1)):
                    self.para('→ ' + '_' * 44 if i == 0 else '   ' + '_' * 44)
        if key:
            self.answer_key(spec)

    def answer_key(self, spec):
        p = self.doc.add_paragraph('', char_pr_id_ref=self.cp['key'], include_run=False, pageBreak='1')
        self.doc.page.set_columns(1, paragraph=p)
        p.add_run(f"{title_of(spec)} — {subtitle_of(spec)}  정답 및 해설", char_pr_id_ref=self.cp['key'])
        self.fmt(p, spacing_after_pt=6)
        items = [it for it in spec['items'] if it.get('kind', 'mc') != 'group']
        t = self.doc.add_table(len(items) + 1, 5, width=int(170 * MM), border_fill_id_ref=self.border)
        t.set_column_widths([9, 16, 7, 26, 62])
        for c, h in enumerate(['번호', '정답', '배점', '출처', '해설']):
            t.cell(0, c).set_text(h)
        for r, it in enumerate(items, 1):
            ans = it.get('answer', '')
            if isinstance(ans, int):
                ans = CIRC[ans - 1]
            for c, v in enumerate([str(it['no']), str(ans), str(it.get('points', '')), it.get('source', ''), it.get('explain', '')]):
                t.cell(r, c).set_text(v)

    def save(self, out):
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        rep = self.doc.validate()
        if rep.issues:
            print('validate:', rep.issues[:5], file=sys.stderr)
        self.doc.save_to_path(str(out))
        return rep


# ──────────────────────────────── HTML 미리보기 ────────────────────────────────
CSS = """
@page { size: A4; margin: 18mm 20mm 15mm 20mm; }
body { font-family: 'Noto Serif KR','Noto Serif CJK KR','Nanum Myeongjo',serif; font-size: 10pt; line-height: 1.45; margin:0; color:#000 }
h1 { text-align:center; font-size:16pt; margin:0 }
.sub { text-align:center; font-size:10pt; margin:2px 0 4px }
.name { text-align:right; border-bottom:1px solid #000; padding-bottom:3px; margin-bottom:6px }
.cols { column-count:2; column-gap:8mm; column-fill:auto }
.q { break-inside:avoid; margin-top:7pt }
.q .stem { font-weight:normal }
.grp { font-weight:bold; margin-top:6pt; break-after:avoid }
.box { border:1px solid #000; padding:4px 6px; margin:3px 2px 5px 0; break-inside:avoid }
.box .t { font-weight:bold }
.ch div { padding-left:1.4em; text-indent:-1.4em }
.ch.inline div { display:inline-block; margin-right:12px; padding:0; text-indent:0 }
table.ct { border-collapse:collapse; margin:3px 0 5px; }
table.ct td, table.ct th { border:1px solid #000; padding:1px 8px; font-weight:normal; text-align:center }
.ans { margin:2px 0 }
.key { break-before:page; column-count:1 }
.key table { border-collapse:collapse; width:100%; font-size:9pt; table-layout:fixed }
.key th:nth-child(1){width:8%} .key th:nth-child(2){width:17%} .key th:nth-child(3){width:7%} .key th:nth-child(4){width:24%}
.key td, .key th { border:1px solid #000; padding:2px 4px; vertical-align:top }
u { text-underline-offset: 2px }
"""


def inline(text):
    s = H.escape(text, quote=False)
    s = re.sub(r'&lt;(/?)([ubi])&gt;', r'<\1\2>', s)
    return s.replace('\n', '<br>')


def html_box(box):
    title, lines = box_lines(box)
    if not lines and not title:
        return ''
    body = (f'<div class="t">{inline(title)}</div>' if title else '') + ''.join(f'<div>{inline(l)}</div>' for l in lines)
    return f'<div class="box">{body}</div>'


def build_html(spec, key=True):
    out = [f'<!doctype html><meta charset="utf-8"><title>{H.escape(title_of(spec))}</title><style>{CSS}</style>']
    out.append(f'<h1>{H.escape(title_of(spec))}</h1><div class="sub">{H.escape(subtitle_of(spec))}</div>')
    out.append(f'<div class="name">{spec["grade"]}학년 (&nbsp;&nbsp;&nbsp;&nbsp;)반 (&nbsp;&nbsp;&nbsp;&nbsp;)번 이름 (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</div><div class="cols">')
    for it in spec['items']:
        k = it.get('kind', 'mc')
        if k == 'group':
            out.append(f'<div class="grp">{inline(it["label"] + " " + it["direction"])}</div>' + html_box(it.get('box')))
            continue
        out.append(f'<div class="q"><div class="stem">{inline(stem_no(it) + " " + it["stem"] + points_str(it))}</div>')
        if it.get('box'):
            out.append(html_box(it['box']))
        if k == 'mc':
            if it.get('choices_table'):
                ct = it['choices_table']
                out.append('<table class="ct">' + (('<tr>' + ''.join(f'<th>{inline(str(h))}</th>' for h in ct['header']) + '</tr>') if ct.get('header') else '')
                           + ''.join('<tr>' + ''.join(f'<td>{inline(str(v))}</td>' for v in row) + '</tr>' for row in ct['rows']) + '</table>')
            else:
                cls = 'ch inline' if it.get('inline') else 'ch'
                out.append(f'<div class="{cls}">' + ''.join(f'<div>{CIRC[i]} {inline(c)}</div>' for i, c in enumerate(it.get('choices', []))) + '</div>')
        else:
            if it.get('condition'):
                out.append(html_box({'title': '<조건>', 'lines': it['condition']}))
            for i in range(it.get('answer_lines', 1)):
                out.append('<div class="ans">' + ('→ ' if i == 0 else '&nbsp;&nbsp;&nbsp;') + '_' * 40 + '</div>')
        out.append('</div>')
    out.append('</div>')
    if key:
        items = [it for it in spec['items'] if it.get('kind', 'mc') != 'group']
        out.append(f'<div class="key"><h2>정답 및 해설 — {H.escape(subtitle_of(spec))}</h2><table><tr><th>번호</th><th>정답</th><th>배점</th><th>출처</th><th>해설</th></tr>')
        for it in items:
            ans = it.get('answer', '')
            ans = CIRC[ans - 1] if isinstance(ans, int) else ans
            out.append(f'<tr><td>{it["no"]}</td><td>{inline(str(ans))}</td><td>{it.get("points","")}</td><td>{inline(it.get("source",""))}</td><td>{inline(it.get("explain",""))}</td></tr>')
        out.append('</table></div>')
    return '\n'.join(out)


def check_spec(spec):
    """번호·배점·정답이 빠진 곳을 찾는다. 문제가 있으면 목록을 돌려준다."""
    probs, nos = [], []
    for it in spec['items']:
        k = it.get('kind', 'mc')
        if k == 'group':
            continue
        nos.append(it.get('no'))
        if not it.get('points'):
            probs.append(f"{it.get('no')}: 배점 없음")
        if k == 'mc':
            n = len(it.get('choices', [])) or len(it.get('choices_table', {}).get('rows', []))
            if n != 5:
                probs.append(f"{it.get('no')}: 선지 {n}개")
            if not isinstance(it.get('answer'), int) or not 1 <= it['answer'] <= 5:
                probs.append(f"{it.get('no')}: 정답 번호 없음")
        elif not it.get('answer'):
            probs.append(f"{it.get('no')}: 정답 없음")
    total = sum(it.get('points', 0) for it in spec['items'] if it.get('kind', 'mc') != 'group')
    mc = [it for it in spec['items'] if it.get('kind', 'mc') == 'mc']
    return probs, total, len(mc), len(nos) - len(mc)


def main(argv):
    if len(argv) < 2:
        sys.exit(__doc__)
    spec = json.loads(Path(argv[0]).read_text(encoding='utf8'))
    key = '--no-key' not in argv
    probs, total, nmc, ness = check_spec(spec)
    print(f"{subtitle_of(spec)}: 객관식 {nmc} · 서술형 {ness} · 총점 {total}")
    for p in probs:
        print('  !!', p)
    hw = Hwpx()
    hw.build(spec, key=key)
    hw.save(argv[1])
    print('→', argv[1])
    if '--html' in argv:
        hp = argv[argv.index('--html') + 1]
        Path(hp).parent.mkdir(parents=True, exist_ok=True)
        Path(hp).write_text(build_html(spec, key=key), encoding='utf8')
        print('→', hp)


if __name__ == '__main__':
    main(sys.argv[1:])
