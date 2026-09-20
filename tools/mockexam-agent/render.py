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

MM = 7200 / 25.4                      # HWPUNIT per mm
TEMPLATE = Path(__file__).resolve().parent / 'assets' / 'exam-template.hwpx'   # 실제 학교 시험지 서식
LOGO = Path(__file__).resolve().parent / 'assets' / 'orun-logo.png'
BRAND = '옳은영어 ORUN ENGLISH'
BODY_FONT = '맑은 고딕'               # 발문·선지 글꼴(서식과 같게)
BOX_FONT = '맑은 고딕'                # 지문·대화 상자 글꼴
USE_LOGO = False                      # 정보표에 로고를 넣을지
ROW_H = 1750                          # 정보표 한 행 높이(HWPUNIT)
FOOTER_H = 3000                       # 꼬리말 영역 높이
COPYRIGHT = '이 시험 문제의 저작권은 옳은영어(ORUN ENGLISH)에 있습니다. 무단 전송·복제·배포 시 저작권법에 의거하여 처벌될 수 있습니다.'
NOTICES = ['○ 답안지(선택형 OMR카드)의 해당란에 인적 사항을 기재하고, 정답을 정확히 표시하시오.',
           '○ 문항에 따라 배점이 다르니, 각 물음의 끝에 표시된 배점을 참고하시오.']
CIRC = '①②③④⑤⑥⑦⑧⑨⑩'
TOKEN = re.compile(r'(</?[ubi]>)')
NS = {'hp': 'http://www.hancom.co.kr/hwpml/2011/paragraph'}
HP = '{%s}' % NS['hp']
# 서식 파일 안의 모양 id — 서식(exam-template.hwpx)을 바꾸면 여기도 맞춘다
T = dict(
    p_body=0,       # 발문·지문: 양쪽 정렬 160 %
    p_choice=10,    # 선지: 내어쓰기 1276
    p_blank=3,      # 빈 줄
    p_right=2,      # 오른쪽 정렬 (➡ 다음 쪽에 계속)
    p_center=6,     # 표 안 가운데
    p_header=4,     # 머리말 (아래 0.4 mm 선)
    p_footer=9,     # 꼬리말 (과목 · 쪽/전체 · 옳은영어)
    bf_topline=4,   # 위쪽 0.4 mm 선
    c_body=0,       # 맑은 고딕 10
    c_bold=13,      # 맑은 고딕 10 굵게 (묶음 지시문)
    c_eng=8,        # 바탕 10 (영어 지문)
    c_small=10,     # 맑은 고딕 9.5 (안내문·정답표)
    c_cell=1,       # 맑은 고딕 10.5 굵게 (표 안)
    bf_box=2,       # 실선 0.12 mm 사방
    bf_none=1,      # 테두리 없음 (서식이 쓰는 것)
    col_w=25441, col_gap=1276, full_w=52158,
)


def etree_sub(parent, tag, **attrs):
    from lxml import etree
    e = etree.SubElement(parent, tag)
    for k, v in attrs.items():
        e.set(k, v)
    return e


def text_width(t, pt=10):
    """10pt 글 너비 어림(HWPUNIT): 한글·원문자 1em, 라틴 0.55em, 공백 0.3em."""
    em = pt * 100
    w = 0
    for ch in t:
        w += em if ord(ch) > 0x2000 else (0.3 * em if ch == ' ' else 0.55 * em)
    return int(w)


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


def header_of(spec):
    return f"{spec.get('year', 2026)}학년도 {spec['term']}학기 {spec['exam']}"


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
    """실제 학교 시험지 HWPX(assets/exam-template.hwpx)를 열어 머리말·꼬리말·정보표·안내문을 채우고
    본문 자리에 문항을 넣는다. 글꼴·여백·단·테두리는 서식 파일의 것을 그대로 쓴다."""

    def __init__(self):
        from hwpx.document import HwpxDocument
        self.doc = HwpxDocument.open(str(TEMPLATE))
        self.sec = self.doc.sections[0]
        st = self.doc.styles
        st.ensure_font(BODY_FONT); st.ensure_font(BOX_FONT)      # 글꼴을 먼저 등록해야 ensure_run 이 글꼴을 구분한다
        B = lambda **k: st.ensure_run(font=BODY_FONT, size=10, **k)
        E = lambda **k: st.ensure_run(font=BOX_FONT, size=10, **k)
        self._pp_cache = {}
        self.pp_keep = self._keep_with_next_copy(T['p_blank'])   # 묶음 지시문·발문용: 다음 문단과 붙어 다님
        self.pp_keep_body = self._keep_with_next_copy(T['p_body'])
        self.cp = {
            'base': B(), 'b': B(bold=True), 'u': B(underline=True), 'i': B(italic=True), 'ub': B(bold=True, underline=True),
            'e': E(), 'eb': E(bold=True), 'eu': E(underline=True), 'ei': E(italic=True), 'eub': E(bold=True, underline=True),
            'small': st.ensure_run(font=BODY_FONT, size=9.5), 'smallb': st.ensure_run(font=BODY_FONT, size=9.5, bold=True),
            'grp': B(bold=True),
        }

    def _keep_with_next_copy(self, base_id):
        """header.xml 의 paraPr 를 복사해 keepWithNext=1 로 만든 새 id."""
        import copy
        HH = {'hh': 'http://www.hancom.co.kr/hwpml/2011/head'}
        hx = self.doc.headers[0].element
        prs = hx.find('.//hh:paraProperties', HH)
        src = prs.find('hh:paraPr[@id="%s"]' % base_id, HH)
        new = copy.deepcopy(src)
        nid = max(int(e.get('id')) for e in prs.findall('hh:paraPr', HH)) + 1
        new.set('id', str(nid))
        new.find('hh:breakSetting', HH).set('keepWithNext', '1')
        prs.append(new)
        prs.set('itemCnt', str(len(prs.findall('hh:paraPr', HH))))
        self.doc.headers[0].mark_dirty()
        return nid

    def _grid_para_pr(self, positions):
        """ⓐⓑⓒ 조합표용 문단 모양: 단 너비를 ncols 로 나눈 가운데 탭. (표는 한글이 폭·테두리를 제멋대로 그려서 쓰지 않는다)"""
        import copy
        HH = {'hh': 'http://www.hancom.co.kr/hwpml/2011/head'}
        H = '{%s}' % HH['hh']
        key = ('grid', positions)
        if key in self._pp_cache:
            return self._pp_cache[key]
        hx = self.doc.headers[0].element
        tabs = hx.find('.//hh:tabProperties', HH)
        tid = max(int(e.get('id')) for e in tabs.findall('hh:tabPr', HH)) + 1
        tp = etree_sub(tabs, H + 'tabPr', id=str(tid), autoTabLeft='0', autoTabRight='0')
        for x in positions:                                # 첫 칸은 왼쪽 끝, 나머지는 왼쪽 맞춤 탭
            etree_sub(tp, H + 'tabItem', pos=str(int(x)), type='LEFT', leader='NONE')
        tabs.set('itemCnt', str(len(tabs.findall('hh:tabPr', HH))))
        prs = hx.find('.//hh:paraProperties', HH)
        new = copy.deepcopy(prs.find('hh:paraPr[@id="%s"]' % T['p_blank'], HH))
        nid = max(int(e.get('id')) for e in prs.findall('hh:paraPr', HH)) + 1
        new.set('id', str(nid)); new.set('tabPrIDRef', str(tid))
        new.find('hh:align', HH).set('horizontal', 'LEFT')
        prs.append(new); prs.set('itemCnt', str(len(prs.findall('hh:paraPr', HH))))
        self.doc.headers[0].mark_dirty()
        self._pp_cache[key] = nid
        return nid

    def _tab_para(self, text, pp):
        """'\\t' 를 한글 탭으로 넣은 문단."""
        from lxml import etree
        p = self.doc.add_paragraph('', para_pr_id_ref=pp, char_pr_id_ref=self.cp['base'], include_run=False)
        r = etree.SubElement(p.element, HP + 'run'); r.set('charPrIDRef', str(self.cp['base']))
        t = etree.SubElement(r, HP + 't')
        parts = text.split('\t')
        t.text = parts[0]
        for seg in parts[1:]:
            tab = etree.SubElement(t, HP + 'tab'); tab.set('width', '0'); tab.set('leader', '0'); tab.set('type', '0')
            tab.tail = seg
        return p

    # ── 글자 모양 고르기 ──
    def cpid(self, f, eng=False):
        k = ('ub' if f.get('u') and f.get('b') else 'u' if f.get('u') else 'b' if f.get('b') else 'i' if f.get('i') else 'base')
        if eng:
            k = {'base': 'e', 'b': 'eb', 'u': 'eu', 'i': 'ei', 'ub': 'eub'}[k]
        return self.cp[k]

    # ── 문단 ──
    def para(self, text='', *, pp=None, cp=None, eng=False, target=None, **attrs):
        pp = T['p_body'] if pp is None else pp
        if target is None:
            p = self.doc.add_paragraph('', para_pr_id_ref=pp, char_pr_id_ref=cp or self.cp['base'], include_run=False, **attrs)
        else:
            first = target.paragraphs[0] if target.paragraphs else None
            if first is not None and not first.text and not first.element.xpath('.//*[local-name()="tbl" or local-name()="pic" or local-name()="ctrl"]'):
                p = first
                for r in list(first.element.findall('hp:run', NS)):
                    first.element.remove(r)
                p.element.set('paraPrIDRef', str(pp))
            else:
                p = target.add_paragraph('', para_pr_id_ref=pp, char_pr_id_ref=cp or self.cp['base'])
        for t, f in (runs_of(text) if text else []):
            p.add_run(t, char_pr_id_ref=cp if cp else self.cpid(f, eng))
        return p

    def table(self, rows, cols, width, *, inner=(141, 141, 85, 85), outer=(0, 0, 0, 0), pp=None, border=True):
        bf = T['bf_box'] if border else T['bf_none']
        t = self.doc.add_table(rows, cols, width=width, border_fill_id_ref=bf,
                               para_pr_id_ref=T['p_body'] if pp is None else pp)
        el = t.element
        for tag, v in (('hp:inMargin', inner), ('hp:outMargin', outer)):
            m = el.find(tag, NS)
            for k, val in zip(('left', 'right', 'top', 'bottom'), v):
                m.set(k, str(val))
        el.find('hp:sz', NS).set('height', '1000')
        for r in range(rows):
            for c in range(cols):
                t.cell(r, c).element.find('hp:cellSz', NS).set('height', '1000')
                t.cell(r, c).element.find('hp:subList', NS).set('vertAlign', 'TOP')
                t.cell(r, c).element.set('borderFillIDRef', str(bf))
        return t

    def box(self, box, width=None):
        title, lines = box_lines(box)
        if not lines and not title:
            return
        t = self.table(1, 1, width or T['col_w'], inner=(420, 420, 230, 230), outer=(0, 0, 80, 140))
        t.element.set('pageBreak', 'TABLE')          # 긴 지문은 쪽·단 경계에서 나뉘어 이어진다
        c = t.cell(0, 0)
        if title:
            self.para(f'<b>{title}</b>', target=c, eng=True)
        for ln in lines:
            self.para(ln, target=c, eng=True)

    def choices(self, it):
        if it.get('choices_table'):
            ct = it['choices_table']
            rows = ([ct['header']] if ct.get('header') else []) + ct['rows']
            # 칸마다 가장 긴 글의 너비를 어림해 탭 자리를 정한다 (글자가 탭 자리를 넘으면 다음 탭으로 밀려 줄이 어긋난다)
            widths = [max(text_width(str(r[c])) for r in rows) for c in range(len(rows[0]))]
            pos, x = [], 0
            for w in widths[:-1]:
                x += max(w + int(3 * MM), int(9 * MM))
                pos.append(x)
            pp = self._grid_para_pr(tuple(pos))
            for row in rows:
                self._tab_para('\t'.join(str(v) for v in row), pp)
            return
        ch = it.get('choices', [])
        if it.get('inline'):
            self.para('　'.join(f'{CIRC[i]} {c}' for i, c in enumerate(ch)))
        else:
            for i, c in enumerate(ch):
                lines = c.split('\n')
                self.para(f'{CIRC[i]} {lines[0]}')
                for extra in lines[1:]:
                    self.para('　 ' + extra)

    # ── 서식의 머리말·꼬리말·정보표 채우기 ──
    @staticmethod
    def _set_text(p_el, text):
        """문단의 첫 run 글자만 바꾸고 나머지 run 은 지운다(글자 모양 유지)."""
        runs = p_el.findall('hp:run', NS)
        t = runs[0].find('hp:t', NS)
        t.text = text
        for extra in list(t):
            t.remove(extra)
        for r in runs[1:]:
            p_el.remove(r)

    def _fill_template(self, spec, n_mc, n_essay):
        from lxml import etree
        sec = self.sec.element
        hdr = sec.find('.//hp:header', NS)
        self._set_text(hdr.find('.//hp:p', NS), header_of(spec))
        ftr = sec.find('.//hp:footer', NS)
        fps = ftr.findall('.//hp:p', NS)
        fps[0].getparent().remove(fps[0])          # 저작권 문구 줄은 쓰지 않는다
        fps = ftr.findall('.//hp:p', NS)
        fps.insert(0, None)                        # 아래 코드가 fps[1] 을 쓰므로 자리를 맞춘다
        # 꼬리말 둘째 줄: "1학년 영어 과목 <tab> n / 전체 <tab> 옳은영어" — run 을 직접 짠다
        cp = fps[1].find('hp:run', NS).get('charPrIDRef')
        for r in list(fps[1].findall('hp:run', NS)):
            fps[1].remove(r)

        def run(text=None, ctrl=None):
            r = etree.SubElement(fps[1], HP + 'run'); r.set('charPrIDRef', cp)
            if ctrl is not None:
                r.append(ctrl)
            else:
                t = etree.SubElement(r, HP + 't')
                if text == '\t':
                    tab = etree.SubElement(t, HP + 'tab'); tab.set('width', '0'); tab.set('leader', '0'); tab.set('type', '0')
                else:
                    t.text = text
            return r

        def autonum(kind):
            c = etree.Element(HP + 'ctrl')
            a = etree.SubElement(c, HP + 'autoNum'); a.set('num', '0'); a.set('numType', kind)
            f = etree.SubElement(a, HP + 'autoNumFormat')
            for k, v in (('type', 'DIGIT'), ('userChar', ''), ('prefixChar', ''), ('suffixChar', ''), ('supscript', '0')):
                f.set(k, v)
            return c
        run(f"{spec['grade']}학년  {spec.get('subject', '영어')} 과목"); run('\t'); run(ctrl=autonum('PAGE')); run(' / ')
        run(ctrl=autonum('TOTAL_PAGE')); run('\t'); run(BRAND)
        # 정보표 (3×6) — 칸 주소로 채운다
        tbl = list(self.doc.tables.all)[0]
        cells = {(int(tc.find('hp:cellAddr', NS).get('colAddr')), int(tc.find('hp:cellAddr', NS).get('rowAddr'))): tc
                 for tc in tbl.element.findall('.//hp:tc', NS)}

        def cell_text(addr, text):
            self._set_text(cells[addr].find('.//hp:p', NS), text)
        cell_text((2, 0), f"{spec.get('subject', '영어')}  {spec['term']}학기  {spec['exam']}")
        cell_text((3, 0), f"총 문항수 : {n_mc + n_essay}문항")
        cell_text((0, 1), str(spec['grade']))
        cell_text((1, 1), f"{spec.get('set', 1):02d}")
        cell_text((4, 1), f"{n_mc}문항")
        cell_text((4, 2), f"{n_essay}문항")
        pub = f"{spec['publisher']}  " if spec.get('publisher') else ''
        cell_text((2, 2), f"{pub}{spec['school']}  동형 모의고사 {spec.get('set', 1)}회" + (f"  ({spec['range']})" if spec.get('range') else ''))
        # 쪽수 칸: 전체 쪽수 자동
        pg = cells[(5, 1)].find('.//hp:p', NS)
        self._set_text(pg, '')
        r0 = pg.find('hp:run', NS)
        r0.remove(r0.find('hp:t', NS)); r0.append(autonum('TOTAL_PAGE'))
        # 로고: 정보표 왼쪽 위 '학년' 칸 대신 코드 칸 위 라벨 자리… → 시행 정보 칸 앞에 작은 로고
        if USE_LOGO and LOGO.exists():
            bid = self.doc.add_image(LOGO.read_bytes(), 'png')
            p2 = cells[(2, 2)].find('.//hp:p', NS)
            first = p2.find('hp:run', NS)
            r = etree.Element(HP + 'run'); r.set('charPrIDRef', first.get('charPrIDRef'))
            p2.insert(list(p2).index(first), r)
            try:
                pic = list(self.doc.tables.all)[0].cell(2, 2).paragraphs[0].add_picture(bid, width=int(5.5 * MM), height=int(5.5 * MM))
                # add_picture 는 새 run 을 끝에 붙인다 → 맨 앞으로 옮긴다
                prun = pic.element.getparent()
                p2.remove(prun); p2.insert(list(p2).index(r), prun)
                p2.remove(r)
                sp = etree.SubElement(prun, HP + 't'); sp.text = '  '
            except Exception as e:      # 로고를 못 넣어도 시험지는 나간다
                p2.remove(r)
                print('logo skipped:', e, file=sys.stderr)
        for p in list(sec.findall('hp:p', NS))[3:]:
            sec.remove(p)
        # 정보표 행 높이를 줄인다 (2268 → ROW_H)
        tbl.element.find('hp:sz', NS).set('height', str(3 * ROW_H))
        for tc in tbl.element.findall('.//hp:tc', NS):
            span = int(tc.find('hp:cellSpan', NS).get('rowSpan'))
            tc.find('hp:cellSz', NS).set('height', str(span * ROW_H))
        HH = {'hh': 'http://www.hancom.co.kr/hwpml/2011/head', 'hc': 'http://www.hancom.co.kr/hwpml/2011/core'}
        hx = self.doc.headers[0].element
        for pid, prev, next_, top, bottom, bf in ((str(T['p_header']), 0, 0, 0, 200, None), (str(T['p_footer']), 350, 0, 160, 0, T['bf_topline'])):
            pr = hx.find('.//hh:paraPr[@id="%s"]' % pid, HH)
            pr.find('hh:margin/hc:prev', HH).set('value', str(prev))
            pr.find('hh:margin/hc:next', HH).set('value', str(next_))
            b = pr.find('hh:border', HH)
            b.set('offsetTop', str(top)); b.set('offsetBottom', str(bottom))
            if bf is not None:
                b.set('borderFillIDRef', str(bf))
        # 꼬리말 두 줄이 겹치지 않게 꼬리말 영역을 넓힌다
        sec.find('.//hp:pagePr/hp:margin', NS).set('footer', str(FOOTER_H))

    def build(self, spec, key=True):
        items = spec['items']
        n_mc = sum(1 for it in items if it.get('kind', 'mc') == 'mc')
        n_es = sum(1 for it in items if it.get('kind') == 'essay')
        self._fill_template(spec, n_mc, n_es)
        self.para('', pp=T['p_blank'])
        first = True
        for it in items:
            k = it.get('kind', 'mc')
            if k == 'group':
                self.para('', pp=T['p_blank'])
                self.para(f"{it['label']} {it['direction']}", cp=self.cp['grp'], pp=self.pp_keep)
                self.box(it.get('box'))
                self.para('', pp=T['p_blank'])
                first = True
                continue
            if not first:
                self.para('', pp=T['p_blank'])
            first = False
            self.para(f"{stem_no(it)} {it['stem']}{points_str(it)}", pp=self.pp_keep_body)
            if it.get('box'):
                self.box(it['box'])
                self.para('', pp=T['p_blank'])
            if k == 'mc':
                self.choices(it)
            else:
                if it.get('condition'):
                    self.box({'title': '<조건>', 'lines': it['condition']})
                for i in range(it.get('answer_lines', 1)):
                    self.para(('→ ' if i == 0 else '　 ') + '_' * 38, pp=T['p_choice'])
        self.para('', pp=T['p_blank'])
        self.para('※ 수고하셨습니다.', pp=T['p_right'], cp=self.cp['grp'])
        if key:
            self.answer_key(spec)

    def answer_key(self, spec):
        p = self.doc.add_paragraph('', para_pr_id_ref=T['p_blank'], char_pr_id_ref=self.cp['grp'], include_run=False, pageBreak='1')
        self.doc.page.set_columns(1, paragraph=p)
        p.add_run(f"{title_of(spec)} — {subtitle_of(spec)}   정답 및 해설", char_pr_id_ref=self.cp['grp'])
        items = [it for it in spec['items'] if it.get('kind', 'mc') != 'group']
        n = len(items) + 1
        row_h = max(1400, min(2600, int((84189 - 2 * 1984 - 2268 - FOOTER_H - 6000) / n)))   # 쪽 높이에서 머리·꼬리·제목을 뺀 것을 행으로 나눔
        t = self.table(n, 5, T['full_w'], inner=(200, 200, 100, 100), outer=(0, 0, 200, 0))
        t.set_column_widths([7, 18, 6, 26, 43])
        for r in range(n):
            for c in range(5):
                tc = t.cell(r, c).element
                tc.find('hp:cellSz', NS).set('height', str(row_h))
                tc.find('hp:subList', NS).set('vertAlign', 'CENTER')
        t.element.find('hp:sz', NS).set('height', str(row_h * n))
        for c, h in enumerate(['번호', '정답', '배점', '출처', '해설']):
            self.para(h, cp=self.cp['smallb'], target=t.cell(0, c), pp=T['p_center'])
        for r, it in enumerate(items, 1):
            ans = it.get('answer', '')
            if isinstance(ans, int):
                ans = CIRC[ans - 1]
            for c, v in enumerate([str(it['no']), str(ans), str(it.get('points', '')), it.get('source', ''), it.get('explain', '')]):
                self.para(v, cp=self.cp['small'], target=t.cell(r, c), pp=T['p_center'] if c in (0, 2) else T['p_blank'])

    def save(self, out):
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        self.sec.remove_layout_caches()
        rep = self.doc.validate()
        if rep.issues:
            print('validate:', rep.issues[:5], file=sys.stderr)
        self.doc.save_to_path(str(out))
        return rep


# ──────────────────────────────── HTML 미리보기 ────────────────────────────────
CSS = """
@page { size: A4; margin: 15mm 13mm 17mm 13mm; }
body { font-family: 'Malgun Gothic','Noto Sans KR','Noto Sans CJK KR',sans-serif; font-size: 10pt; line-height: 1.6; margin:0; color:#000 }
.eng { font-family: 'Batang','Noto Serif KR','Noto Serif CJK KR',serif }
.hdr { font-size:13pt; font-weight:bold; border-bottom:2px solid #000; padding-bottom:2px; margin-bottom:6px }
table.info { border-collapse:collapse; width:100%; table-layout:fixed; margin-bottom:4px; font-weight:bold; font-size:10.5pt }
table.info td { border:1px solid #000; text-align:center; padding:1px 3px; height:7.5mm }
table.info td.big { font-size:16pt } table.info td.t { font-size:14pt } table.info td.pg { font-size:18pt }
table.info td.d { font-size:11pt } table.info td.d img { height:5.5mm; vertical-align:middle; margin-right:6px }
.notice { font-size:9.5pt; line-height:1.5; padding-left:4mm; text-indent:-4mm }
.notice.last { border-bottom:1.5px solid #000; padding-bottom:2px; margin-bottom:6px }
.cols { column-count:2; column-gap:4.5mm; column-fill:auto }
.q { break-inside:avoid; margin-top:10pt; text-align:justify }
.grp { font-weight:bold; margin-top:10pt; break-after:avoid }
.box { border:1px solid #000; padding:2px 5px; margin:2px 0 3px 0; break-inside:avoid; text-align:justify }
.box .t { font-weight:bold }
.ch div { padding-left:4.5mm; text-indent:-4.5mm }
.ch div.x { padding-left:8mm; text-indent:0 }
.ch.inline div { display:inline; margin-right:12px; padding:0; text-indent:0 }
table.ct { border-collapse:collapse; margin:2px 0 3px; }
table.ct td, table.ct th { border:1px solid #000; padding:0 7px; font-weight:normal; text-align:center; line-height:1.4 }
.ans { margin:1px 0 }
.end { text-align:right; font-weight:bold; margin-top:10pt }
.key { break-before:page; column-count:1 }
.key h2 { font-size:10pt; margin:0 0 4px }
.key table { border-collapse:collapse; width:100%; font-size:9.5pt; table-layout:fixed; line-height:1.4 }
.key th:nth-child(1){width:7%} .key th:nth-child(2){width:18%} .key th:nth-child(3){width:6%} .key th:nth-child(4){width:26%}
.key td, .key th { border:1px solid #000; padding:1px 4px; vertical-align:top }
.ftr { position:fixed; bottom:-9mm; left:0; right:0; font-size:8.5pt; font-weight:bold; border-top:2px solid #000; padding-top:2px }
.ftr .l { display:flex; justify-content:space-between; font-size:10.5pt } .ftr .c { text-align:center }
.frame { position:fixed; top:-11mm; bottom:-13mm; left:-5mm; right:-5mm; border:1px solid #000; pointer-events:none }
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
    return f'<div class="box eng">{body}</div>'


def build_html(spec, key=True):
    import base64
    items = spec['items']
    n_mc = sum(1 for it in items if it.get('kind', 'mc') == 'mc')
    n_es = sum(1 for it in items if it.get('kind') == 'essay')
    logo = ('data:image/png;base64,' + base64.b64encode(LOGO.read_bytes()).decode()) if LOGO.exists() else ''
    subj = spec.get('subject', '영어')
    out = [f'<!doctype html><meta charset="utf-8"><title>{H.escape(title_of(spec))}</title><style>{CSS}</style>']
    out.append(f'<div class="hdr">{H.escape(header_of(spec))}</div>')
    out.append(f'<table class="info"><colgroup><col style="width:10%"><col style="width:10%"><col style="width:41%"><col style="width:14%"><col style="width:12%"><col style="width:13%"></colgroup>'
               f'<tr><td>학년</td><td>과목<br>코드</td><td rowspan="2" class="t">{H.escape(subj)}&nbsp; {spec["term"]}학기&nbsp; {H.escape(spec["exam"])}</td><td colspan="2">총 문항수 : {n_mc + n_es}문항</td><td>쪽수</td></tr>'
               f'<tr><td rowspan="2" class="big">{spec["grade"]}</td><td rowspan="2" class="big">{spec.get("set", 1):02d}</td><td>선&nbsp; 택&nbsp; 형</td><td>{n_mc}문항</td><td rowspan="2" class="pg">4</td></tr>'
               f'<tr><td class="d">{("<img src=" + chr(34) + logo + chr(34) + ">") if logo else ""}{H.escape(spec["school"])}&nbsp; 동형 모의고사 {spec.get("set", 1)}회' + (f'&nbsp; ({H.escape(spec["range"])})' if spec.get('range') else '') + f'</td><td>서&nbsp; 답&nbsp; 형</td><td>{n_es}문항</td></tr></table>')
    out.append(f'<div class="notice">{NOTICES[0]}</div><div class="notice last">{NOTICES[1]}</div><div class="cols">')
    for it in items:
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
                out.append('<div class="ans">' + ('→ ' if i == 0 else '&nbsp;&nbsp;&nbsp;') + '_' * 38 + '</div>')
        out.append('</div>')
    out.append('<div class="end">※ 수고하셨습니다.</div></div>')
    out.append(f'<div class="ftr"><div class="l"><span>{spec["grade"]}학년&nbsp; {H.escape(subj)} 과목</span><span>1 / 4</span><span>{BRAND}</span></div></div><div class="frame"></div>')
    if key:
        ks = [it for it in items if it.get('kind', 'mc') != 'group']
        out.append(f'<div class="key"><h2>{H.escape(title_of(spec))} — {H.escape(subtitle_of(spec))} &nbsp; 정답 및 해설</h2><table><tr><th>번호</th><th>정답</th><th>배점</th><th>출처</th><th>해설</th></tr>')
        for it in ks:
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
