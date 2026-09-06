/* 옳은영어 v2 에디토리얼 공통 부품 — 단어장(gen.js)과 시험지(gen_test.js)가 함께 쓴다.
 * 옐로우는 작은 사각 점과 잉크 블록 위 숫자에만, 표는 세로선 없이 가로 헤어라인만. */
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, VerticalAlign, HeightRule,
  Header, Footer, PageNumber, TabStopType,
} = require('docx');

const LOGO = fs.readFileSync(__dirname + '/assets/logo.png');

/* ── 팔레트 · 타이포 ─────────────────────────────────────── */
const INK='1C1C1C', BODY='3A3A3A', GRAY='8A8A8A', LINE='E4E2DD', PAPER='F7F6F2',
      BLUE='1A7FBF', LBLUE='EAF4FA', YEL='FFD400', GOLD='D9B300', DIM='B5B5B5',
      RULE='D8D5CE', SOFT='6E6E6E';
const F = 'Noto Sans KR';
const W = 9638;                              // 본문 폭(DXA)
const PART_MARK = [GOLD, BLUE, INK];         // 파트별 ■ 색

/* ── 기본 헬퍼 ───────────────────────────────────────────── */
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NOB  = { top:NONE, bottom:NONE, left:NONE, right:NONE, insideHorizontal:NONE, insideVertical:NONE };
const bd   = (color, pt) => ({ style: BorderStyle.SINGLE, size: Math.round(pt*8), color });
const HAIR = bd(LINE, 0.5), INKRULE = bd(INK, 1.5), FILL = bd(RULE, 0.5);

const run = (text, o={}) => new TextRun({
  text, font: F, size: o.size ?? 20, bold: o.bold, italics: o.italics,
  color: o.color ?? BODY, characterSpacing: o.ls, allCaps: o.caps, break: o.break,
});
const p = (kids, o={}) => new Paragraph({
  children: Array.isArray(kids) ? kids : [kids],
  alignment: o.align, keepNext: o.keepNext, pageBreakBefore: o.pbb,
  spacing: { before: o.before ?? 0, after: o.after ?? 0, line: o.line ?? 260 },
  indent: o.indent, border: o.border, tabStops: o.tabs,
  shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
});
const gap = (h=200) => new Paragraph({ children: [], spacing: { after: h, line: 200 } });

const cell = (kids, o={}) => new TableCell({
  children: Array.isArray(kids) ? kids : [kids],
  width: { size: o.w, type: WidthType.DXA },
  margins: o.margins ?? { top: 50, bottom: 50, left: 0, right: 90 },
  borders: { top: o.top ?? NONE, bottom: o.bottom ?? NONE, left: o.left ?? NONE, right: o.right ?? NONE },
  shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
  verticalAlign: o.va ?? VerticalAlign.CENTER,
  columnSpan: o.span, rowSpan: o.rowSpan,
});
const table = (cols, rows) => new Table({
  columnWidths: cols, rows, borders: NOB,
  width: { size: cols.reduce((a,b)=>a+b,0), type: WidthType.DXA },
  layout: 'fixed',
});
const trow = (cells, h) => new TableRow({
  children: cells,
  height: h ? { value: h, rule: HeightRule.ATLEAST } : undefined,
});

/* ── 브랜드 컴포넌트 ─────────────────────────────────────── */
const dot = (color=YEL) => run('■ ', { size: 14, color });
const eyebrow = (text, o={}) => p([dot(o.dotColor), run(text, { size: 16, color: o.color ?? GRAY, ls: 40, bold: true })],
  { after: o.after ?? 90, keepNext: true, align: o.align });

const h1 = (num, text) => p([
  dot(), run(num + '   ', { size: 20, color: GOLD, bold: true, ls: 60 }), run(text, { size: 28, color: INK, bold: true }),
], { before: 360, after: 160, keepNext: true });

const h2 = (text) => p(run(text, { size: 23, color: BLUE, bold: true }), { before: 220, after: 90, keepNext: true });

const body = (text, o={}) => p(run(text, { size: 20, color: BODY }), { after: o.after ?? 100, line: 266, ...o });

/* 정보 표 1열 전폭 (키 회색 bold, 배경 없음) */
function infoRows(pairs, kw=1600) {
  return table([kw, W-kw], pairs.map(([k, v], i) => trow([
    cell(p(run(k, { size: 17, color: GRAY, bold: true, ls: 20 })), { w: kw, bottom: HAIR, top: i===0?HAIR:NONE }),
    cell(p(run(v, { size: 19, color: INK })), { w: W-kw, bottom: HAIR, top: i===0?HAIR:NONE }),
  ], 340)));
}

/* 정보 표 2열 × n행 (키 회색 bold, 배경 없음) */
function infoTable(pairs, o={}) {
  const kw = o.kw ?? 1500, half = Math.floor(W/2);
  const rows = [];
  for (let i = 0; i < pairs.length; i += 2) {
    const mk = (pr) => pr ? [
      cell(p(run(pr[0], { size: 17, color: GRAY, bold: true, ls: 20 })), { w: kw, bottom: HAIR, top: i===0?HAIR:NONE }),
      cell(p(run(pr[1], { size: 19, color: INK })), { w: half - kw, bottom: HAIR, top: i===0?HAIR:NONE }),
    ] : [
      cell(p(run('', {})), { w: kw }), cell(p(run('', {})), { w: half - kw }),
    ];
    rows.push(trow([...mk(pairs[i]), ...mk(pairs[i+1])], 300));
  }
  return table([kw, half-kw, kw, half-kw], rows);
}

/* 콜아웃 (종이색 / 연한 블루) */
function callout(label, lines, kind='paper') {
  const fill = kind === 'blue' ? LBLUE : PAPER;
  const lc   = kind === 'blue' ? BLUE : GOLD;
  const kids = [p([run(label, { size: 16, color: lc, bold: true, ls: 20 })], { after: 70 })];
  lines.forEach((t, i) => kids.push(p(run(t, { size: 19, color: BODY }), { after: i === lines.length-1 ? 0 : 70, line: 264 })));
  return table([W], [trow([cell(kids, { w: W, fill, margins: { top: 190, bottom: 190, left: 220, right: 220 }, va: VerticalAlign.TOP })])]);
}

/* 잉크 통계 박스 : [{n, label}] */
function statBox(items, o={}) {
  const cw = Math.floor(W / items.length);
  const cells = items.map((it, i) => cell([
    p(run(it.n, { size: o.big ?? 40, color: YEL, bold: true, ls: 20 }), { after: 40 }),
    p(run(it.label, { size: 17, color: DIM, ls: 20 }), {}),
  ], { w: cw, fill: INK, left: i ? bd(BODY, 0.5) : NONE,
       margins: { top: 240, bottom: 240, left: i ? 220 : 260, right: 160 }, va: VerticalAlign.CENTER }));
  return table(items.map(() => cw), [trow(cells)]);
}

/* ── 머리글 / 바닥글 ─────────────────────────────────────── */
function header(right, sub = '옳은영어 정시반 어휘 기본서') {
  return new Header({ children: [
    table([1200, W-1200], [trow([
      cell(p(new ImageRun({ type: 'png', data: LOGO, transformation: { width: 26, height: 22 } })), { w: 1200, margins: { top: 0, bottom: 0, left: 0, right: 90 } }),
      cell(p([
        run('ORUN ENGLISH', { size: 15, color: INK, bold: true, ls: 40 }),
        run('     ' + sub, { size: 14, color: GRAY }),
        run('\t' + right, { size: 14, color: GRAY, ls: 20 }),
      ], { tabs: [{ type: TabStopType.RIGHT, position: W-1200 }] }), { w: W-1200 }),
    ], 340)]),
    p([], { border: { bottom: HAIR }, after: 0, line: 40 }),
  ] });
}
function footer(sub = '옳은영어 · 정시반 VOCA 3000') {
  return new Footer({ children: [
    p([], { border: { bottom: HAIR }, after: 90, line: 20 }),
    p([
      run('ORUN ENGLISH', { size: 14, color: GRAY, bold: true, ls: 40 }),
      run('     ' + sub, { size: 14, color: GRAY }),
      new TextRun({ text: '\t', font: F, size: 14 }),
      new TextRun({ children: [PageNumber.CURRENT], font: F, size: 15, color: INK, bold: true }),
      new TextRun({ text: ' / ', font: F, size: 14, color: GRAY }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], font: F, size: 14, color: GRAY }),
    ], { tabs: [{ type: TabStopType.RIGHT, position: W }] }),
  ] });
}
const PAGE = {
  page: { size: { width: 11906, height: 16838 },
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134, header: 680, footer: 600 } },
};


/* 문자열이 몇 줄로 접히는지 예측(한글 1칸, 영문·기호 0.5칸) */
function wrapLines(s, perLine) {
  let w = 0; for (const ch of s) w += ch.codePointAt(0) > 0x1100 ? 1 : 0.5;
  return Math.max(1, Math.ceil(w / perLine));
}
/* 면이 남지도 넘치지도 않도록 행 위아래 여백을 정한다 (slack: 남는 높이 twips) */
function fitPad(base, rows, extraLines, slack, buffer, cap) {
  const room = slack - extraLines * 170 - buffer;
  return base + Math.max(0, Math.min(cap, Math.round(room / rows / 2)));
}

const comma = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const pad2  = (n) => String(n).padStart(2, '0');

module.exports = {
  docx: require('docx'), LOGO, F, W, PAGE, PART_MARK,
  INK, BODY, GRAY, LINE, PAPER, BLUE, LBLUE, YEL, GOLD, DIM, RULE, SOFT,
  NONE, NOB, bd, HAIR, INKRULE, FILL,
  run, p, gap, cell, table, trow,
  dot, eyebrow, h1, h2, body, infoRows, infoTable, callout, statBox,
  header, footer, wrapLines, fitPad, comma, pad2,
};
