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
MARGIN_MM = 7                         # 상하좌우 여백
HEAD_MM = 6                           # 머리말·꼬리말 띠 높이(여백 안쪽)
PAGE = dict(paper_size='A4', margins_mm={'left': MARGIN_MM, 'right': MARGIN_MM, 'top': MARGIN_MM, 'bottom': MARGIN_MM,
                                         'header': HEAD_MM, 'footer': HEAD_MM})
COL_GAP_MM = 7
BODY_W_MM = 210 - 2 * MARGIN_MM
COL_W_MM = (BODY_W_MM - COL_GAP_MM) / 2
BOX_W = int(COL_W_MM * MM) - 60                            # 한 단 너비의 상자
FULL_W = int(BODY_W_MM * MM)
LOGO = Path(__file__).resolve().parent / 'assets' / 'orun-logo.png'
BRAND = '옳은영어 ORUN ENGLISH'
CIRC = '①②③④⑤⑥⑦⑧⑨⑩'
TOKEN = re.compile(r'(</?[ubi]>)')
NS = {'hp': 'http://www.hancom.co.kr/hwpml/2011/paragraph'}


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
    r = f" · {spec['range']}" if spec.get('range') else ''
    return f"{s} · 동형 모의고사 {spec.get('set', 1)}회{r}"


def points_str(it):
    return f" [{it['points']}점]" if it.get('points') else ''


def stem_no(it):
    no = it['no']
    return f"[{no}]" if isinstance(no, str) and not no.isdigit() else f"{no}."


# ──────────────────────────────── HWPX ────────────────────────────────
class Hwpx:
    """spec → HWPX. 판형: A4 · 여백 7 mm · 머리말(시험명 / 옳은영어) · 꼬리말 쪽번호 ·
    제목 띠(제목 + 로고·반/번호/이름) · 본문 2단(실선) · 함초롬바탕 10pt · 왼쪽 정렬 130 %."""

    def __init__(self):
        from hwpx.document import HwpxDocument
        self.doc = HwpxDocument.new()
        self.doc.page.setup(**PAGE)
        st = self.doc.styles
        R = lambda **k: st.ensure_run(font=FONT, **k)
        self.cp = {
            'base': R(size=BODY_PT), 'b': R(size=BODY_PT, bold=True), 'u': R(size=BODY_PT, underline=True),
            'i': R(size=BODY_PT, italic=True), 'ub': R(size=BODY_PT, bold=True, underline=True),
            'title': R(size=15, bold=True), 'sub': R(size=9), 'small': R(size=8), 'brand': R(size=8, bold=True),
            'head': R(size=8), 'key': R(size=12, bold=True), 'tiny': R(size=3),
        }
        self.border = st.ensure_border_fill(border_color='#000000', border_width='0.12 mm')
        self.noborder = st.ensure_border_fill(border_color='#000000', border_width='0.12 mm', active_borders=[])
        # 문단 모양은 시험용 문단에 만들어 두고 id 만 쓴다 (index 로 매번 찾으면 어긋난다)
        self.pp = {}
        for name, kw in {
            'body': dict(alignment='LEFT', line_spacing_percent=130),
            'cell': dict(alignment='LEFT', line_spacing_percent=125),
            'stem': dict(alignment='LEFT', line_spacing_percent=130, spacing_before_pt=4, keep_with_next=True,
                         indent_left_mm=4.5, first_line_indent_mm=-4.5),
            'choice': dict(alignment='LEFT', line_spacing_percent=130, indent_left_mm=4.5, first_line_indent_mm=-4.5),
            'choice2': dict(alignment='LEFT', line_spacing_percent=130, indent_left_mm=8, first_line_indent_mm=0),
            'group': dict(alignment='LEFT', line_spacing_percent=130, spacing_before_pt=5, keep_with_next=True),
            'center': dict(alignment='CENTER', line_spacing_percent=120),
            'right': dict(alignment='RIGHT', line_spacing_percent=120),
            'gap': dict(alignment='LEFT', line_spacing_percent=100),
            'ans': dict(alignment='LEFT', line_spacing_percent=150, spacing_before_pt=1),
            'head': dict(alignment='LEFT', line_spacing_percent=110,
                         tab_stops=[{'pos_mm': BODY_W_MM, 'type': 'RIGHT'}], bottom_border=True, border_color='#000000'),
        }.items():
            probe = self.doc.add_paragraph('x')
            st.apply_paragraph_format(paragraph_index=self.doc.paragraphs.index(probe), **kw)
            self.pp[name] = probe.para_pr_id_ref
            probe.remove()

    def cpid(self, f):
        if f.get('u') and f.get('b'):
            return self.cp['ub']
        return self.cp['u'] if f.get('u') else self.cp['b'] if f.get('b') else self.cp['i'] if f.get('i') else self.cp['base']

    def para(self, text='', *, cp=None, pp='body', target=None, **attrs):
        """target 이 없으면 본문, 있으면 표 칸(첫 문단이 비어 있으면 그것을 쓴다)."""
        if target is None:
            p = self.doc.add_paragraph('', char_pr_id_ref=cp or self.cp['base'], para_pr_id_ref=self.pp[pp],
                                       include_run=False, **attrs)
        else:
            first = target.paragraphs[0] if target.paragraphs else None
            if first is not None and not first.text and not first.element.xpath('.//*[local-name()="tbl" or local-name()="pic" or local-name()="ctrl"]'):
                p = first
                for r in list(first.element.findall('hp:run', NS)):
                    first.element.remove(r)
                p.element.set('paraPrIDRef', str(self.pp[pp]))
            else:
                p = target.add_paragraph('', char_pr_id_ref=cp or self.cp['base'], para_pr_id_ref=self.pp[pp])
        for t, f in (runs_of(text) if text else []):
            p.add_run(t, char_pr_id_ref=cp if cp else self.cpid(f))
        return p

    def table(self, rows, cols, width, *, border=True, inner=(300, 300, 120, 120), outer=(0, 0, 0, 220), pp='body'):
        t = self.doc.add_table(rows, cols, width=width, border_fill_id_ref=self.border if border else self.noborder,
                               para_pr_id_ref=self.pp[pp])
        el = t.element
        for tag, v in (('hp:inMargin', inner), ('hp:outMargin', outer)):
            m = el.find(tag, NS)
            for k, val in zip(('left', 'right', 'top', 'bottom'), v):
                m.set(k, str(val))
        el.find('hp:sz', NS).set('height', '1000')
        for r in range(rows):
            for c in range(cols):
                t.cell(r, c).element.find('hp:cellSz', NS).set('height', '1000')
        return t

    def box(self, box, width=BOX_W):
        title, lines = box_lines(box)
        if not lines and not title:
            return
        t = self.table(1, 1, width, pp='cell')
        c = t.cell(0, 0)
        c.element.find('hp:subList', NS).set('vertAlign', 'TOP')
        for ln in ([f'<b>{title}</b>'] if title else []) + lines:
            self.para(ln, target=c, pp='cell')

    def choices(self, it):
        if it.get('choices_table'):
            ct = it['choices_table']
            rows = ([ct['header']] if ct.get('header') else []) + ct['rows']
            t = self.table(len(rows), len(rows[0]), int(min(BOX_W, len(rows[0]) * 12 * MM)), inner=(200, 200, 60, 60),
                           pp='center')
            for r, row in enumerate(rows):
                for cidx, v in enumerate(row):
                    self.para(str(v), target=t.cell(r, cidx), pp='center')
            return
        ch = it.get('choices', [])
        if it.get('inline'):
            self.para('   '.join(f'{CIRC[i]} {c}' for i, c in enumerate(ch)), pp='choice')
        else:
            for i, c in enumerate(ch):
                lines = c.split('\n')
                self.para(f'{CIRC[i]} {lines[0]}', pp='choice')
                for extra in lines[1:]:
                    self.para(extra, pp='choice2')

    def masthead(self, spec):
        """제목 띠: 왼쪽 제목·부제, 오른쪽 로고 + 옳은영어 + 반/번호/이름."""
        t = self.table(1, 2, FULL_W, border=False, inner=(120, 120, 60, 60), outer=(0, 0, 0, 150))
        t.set_column_widths([64, 36])
        left, right = t.cell(0, 0), t.cell(0, 1)
        self.para(title_of(spec), cp=self.cp['title'], pp='body', target=left)
        self.para(subtitle_of(spec), cp=self.cp['sub'], pp='body', target=left)
        p = self.para('', pp='right', target=right)
        if LOGO.exists():
            bid = self.doc.add_image(LOGO.read_bytes(), 'png')
            p.add_picture(bid, width=int(7 * MM), height=int(7 * MM))
            p.add_run('  ', char_pr_id_ref=self.cp['brand'])
        p.add_run(BRAND, char_pr_id_ref=self.cp['brand'])
        self.para(f"{spec['grade']}학년 (    )반 (    )번  이름 (            )", cp=self.cp['sub'], pp='right', target=right)
        # 띠 아래 굵은 선
        rule = self.table(1, 1, FULL_W, border=False, inner=(0, 0, 0, 0), outer=(0, 0, 0, 120))
        self.doc.styles  # noqa
        rule.set_cell_border_fill(0, 0, self.doc.styles.ensure_border_fill(border_color='#000000', border_width='0.4 mm',
                                                                              active_borders=['bottom']))
        rule.element.find('hp:sz', NS).set('height', '200')
        rule.cell(0, 0).element.find('hp:cellSz', NS).set('height', '200')
        self.para('', cp=self.cp['tiny'], pp='gap', target=rule.cell(0, 0))

    def header_footer(self, spec):
        from lxml import etree
        d = self.doc
        h = d.page.set_header(text=f"{title_of(spec)}  ·  {subtitle_of(spec)}")
        hp = h.element.find('.//hp:p', NS)
        hp.set('paraPrIDRef', str(self.pp['head']))
        for r in hp.findall('hp:run', NS):
            r.set('charPrIDRef', str(self.cp['head']))
        t = hp.find('.//hp:t', NS)
        tab = etree.SubElement(t, '{%s}tab' % NS['hp'])
        tab.tail = BRAND
        d.page.set_page_number(target='footer', align='CENTER', prefix='- ', suffix=' -')
        f = d.sections[0].element.find('.//hp:footer', NS)
        for pn in f.findall('.//hp:pageNum', NS):          # 쪽번호 컨트롤이 겹쳐 두 번 찍히지 않게
            run = pn.getparent().getparent()
            run.getparent().remove(run)
        for r in f.findall('.//hp:run', NS):
            r.set('charPrIDRef', str(self.cp['head']))

    def build(self, spec, key=True):
        d = self.doc
        self.header_footer(spec)
        self.masthead(spec)
        p = self.para('', cp=self.cp['tiny'], pp='gap')
        d.page.set_columns(2, paragraph=p, same_gap=int(COL_GAP_MM * MM), separator_type='SOLID',
                           separator_width='0.12 mm', separator_color='#000000')
        for it in spec['items']:
            k = it.get('kind', 'mc')
            if k == 'group':
                self.para(f"{it['label']} {it['direction']}", cp=self.cp['b'], pp='group')
                self.box(it.get('box'))
                continue
            self.para(f"{stem_no(it)} {it['stem']}{points_str(it)}", pp='stem')
            if it.get('box'):
                self.box(it['box'])
            if k == 'mc':
                self.choices(it)
            else:
                if it.get('condition'):
                    self.box({'title': '<조건>', 'lines': it['condition']})
                for i in range(it.get('answer_lines', 1)):
                    self.para(('→ ' if i == 0 else '   ') + '_' * 40, pp='ans')
        if key:
            self.answer_key(spec)

    def answer_key(self, spec):
        p = self.doc.add_paragraph('', char_pr_id_ref=self.cp['key'], para_pr_id_ref=self.pp['body'],
                                   include_run=False, pageBreak='1')
        self.doc.page.set_columns(1, paragraph=p)
        p.add_run(f"{title_of(spec)} — {subtitle_of(spec)}   정답 및 해설", char_pr_id_ref=self.cp['key'])
        items = [it for it in spec['items'] if it.get('kind', 'mc') != 'group']
        t = self.table(len(items) + 1, 5, FULL_W, inner=(200, 200, 60, 60), outer=(0, 0, 150, 0), pp='cell')
        t.set_column_widths([7, 18, 6, 26, 43])
        for c, h in enumerate(['번호', '정답', '배점', '출처', '해설']):
            self.para(h, cp=self.cp['b'], target=t.cell(0, c), pp='center')
        for r, it in enumerate(items, 1):
            ans = it.get('answer', '')
            if isinstance(ans, int):
                ans = CIRC[ans - 1]
            for c, v in enumerate([str(it['no']), str(ans), str(it.get('points', '')), it.get('source', ''), it.get('explain', '')]):
                self.para(v, cp=self.cp['sub'], target=t.cell(r, c), pp='center' if c in (0, 2) else 'cell')

    def save(self, out):
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        rep = self.doc.validate()
        if rep.issues:
            print('validate:', rep.issues[:5], file=sys.stderr)
        self.doc.save_to_path(str(out))
        return rep


# ──────────────────────────────── HTML 미리보기 ────────────────────────────────
CSS = """
@page { size: A4; margin: 7mm; }
body { font-family: 'Noto Serif KR','Noto Serif CJK KR','Nanum Myeongjo',serif; font-size: 10pt; line-height: 1.3; margin:0; color:#000 }
.hdr { display:flex; justify-content:space-between; font-size:8pt; border-bottom:1px solid #000; padding-bottom:1px; margin-bottom:3px }
.mast { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2.5px solid #000; padding-bottom:3px; margin-bottom:4px }
.mast h1 { font-size:15pt; margin:0 }
.mast .sub { font-size:9pt }
.mast .r { text-align:right; font-size:9pt }
.mast .r img { height:7mm; vertical-align:middle; margin-right:4px }
.mast .r .brand { font-weight:bold; font-size:8pt }
.cols { column-count:2; column-gap:7mm; column-rule:1px solid #000; column-fill:auto }
.q { break-inside:avoid; margin-top:4pt }
.q .stem { padding-left:4.5mm; text-indent:-4.5mm }
.grp { font-weight:bold; margin-top:5pt; break-after:avoid }
.box { border:1px solid #000; padding:1.5px 3px; margin:2px 0 3px 0; break-inside:avoid; line-height:1.25 }
.box .t { font-weight:bold }
.ch div { padding-left:4.5mm; text-indent:-4.5mm }
.ch div.x { padding-left:8mm; text-indent:0 }
.ch.inline div { display:inline; margin-right:10px; padding:0; text-indent:0 }
table.ct { border-collapse:collapse; margin:2px 0 3px; }
table.ct td, table.ct th { border:1px solid #000; padding:0 7px; font-weight:normal; text-align:center }
.ans { margin:1px 0 }
.key { break-before:page; column-count:1 }
.key h2 { font-size:12pt; margin:0 0 4px }
.key table { border-collapse:collapse; width:100%; font-size:9pt; table-layout:fixed }
.key th:nth-child(1){width:7%} .key th:nth-child(2){width:18%} .key th:nth-child(3){width:6%} .key th:nth-child(4){width:26%}
.key td, .key th { border:1px solid #000; padding:1px 4px; vertical-align:top }
.ftr { position:fixed; bottom:0; left:0; right:0; text-align:center; font-size:8pt }
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
    import base64
    logo = ('data:image/png;base64,' + base64.b64encode(LOGO.read_bytes()).decode()) if LOGO.exists() else ''
    out.append(f'<div class="hdr"><span>{H.escape(title_of(spec))} &nbsp;·&nbsp; {H.escape(subtitle_of(spec))}</span><span>{BRAND}</span></div>')
    out.append(f'<div class="mast"><div><h1>{H.escape(title_of(spec))}</h1><div class="sub">{H.escape(subtitle_of(spec))}</div></div>'
               f'<div class="r"><div>{("<img src=" + chr(34) + logo + chr(34) + ">") if logo else ""}<span class="brand">{BRAND}</span></div>'
               f'<div>{spec["grade"]}학년 (&nbsp;&nbsp;&nbsp;&nbsp;)반 (&nbsp;&nbsp;&nbsp;&nbsp;)번 &nbsp;이름 (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</div></div></div><div class="cols">')
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
                cells = []
                for i, c in enumerate(it.get('choices', [])):
                    ls = c.split('\n')
                    cells.append(f'<div>{CIRC[i]} {inline(ls[0])}</div>' + ''.join(f'<div class="x">{inline(x)}</div>' for x in ls[1:]))
                out.append(f'<div class="{cls}">' + ''.join(cells) + '</div>')
        else:
            if it.get('condition'):
                out.append(html_box({'title': '<조건>', 'lines': it['condition']}))
            for i in range(it.get('answer_lines', 1)):
                out.append('<div class="ans">' + ('→ ' if i == 0 else '&nbsp;&nbsp;&nbsp;') + '_' * 40 + '</div>')
        out.append('</div>')
    out.append('</div><div class="ftr">- 1 -</div>')
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
