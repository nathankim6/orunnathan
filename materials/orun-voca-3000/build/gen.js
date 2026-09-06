/* 옳은영어 정시반 VOCA 3000 — A4 단어장(.docx) 생성기
 * 원본 3,000단어를 난이도 3단계(초·중 → 중·고 → 전문)로 재배치한다.
 * 디자인: 옳은영어 v2 에디토리얼 규칙(헤어라인 표·옐로우 점 액센트·잉크 블록). */
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, VerticalAlign, HeightRule,
  Header, Footer, PageNumber, TabStopType,
} = require('docx');

const book = JSON.parse(fs.readFileSync(__dirname + '/book.json', 'utf8'));
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
function header(right) {
  return new Header({ children: [
    table([1200, W-1200], [trow([
      cell(p(new ImageRun({ type: 'png', data: LOGO, transformation: { width: 26, height: 22 } })), { w: 1200, margins: { top: 0, bottom: 0, left: 0, right: 90 } }),
      cell(p([
        run('ORUN ENGLISH', { size: 15, color: INK, bold: true, ls: 40 }),
        run('     옳은영어 정시반 어휘 기본서', { size: 14, color: GRAY }),
        run('\t' + right, { size: 14, color: GRAY, ls: 20 }),
      ], { tabs: [{ type: TabStopType.RIGHT, position: W-1200 }] }), { w: W-1200 }),
    ], 340)]),
    p([], { border: { bottom: HAIR }, after: 0, line: 40 }),
  ] });
}
function footer() {
  return new Footer({ children: [
    p([], { border: { bottom: HAIR }, after: 90, line: 20 }),
    p([
      run('ORUN ENGLISH', { size: 14, color: GRAY, bold: true, ls: 40 }),
      run('     옳은영어 · 정시반 VOCA 3000', { size: 14, color: GRAY }),
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

/* ── 1. 표지 ─────────────────────────────────────────────── */
function cover() {
  const P = book.parts;
  const inkKids = [
    p([run('■ ', { size: 14, color: YEL }), run('ORUN ENGLISH · REGULAR ADMISSION COURSE', { size: 15, color: DIM, ls: 60, bold: true })], { after: 700 }),
    p(run('옳은 VOCA', { size: 68, color: PAPER, bold: true, ls: 20 }), { after: 0, line: 720 }),
    p([run('3000', { size: 68, color: YEL, bold: true, ls: 40 })], { after: 220, line: 720 }),
    p([], { border: { bottom: bd(SOFT, 0.75) }, after: 200, line: 20 }),
    p(run('정시반 필수 영단어 · 난이도 3단계 재배열', { size: 24, color: PAPER, bold: true }), { after: 90 }),
    p(run('수능·모의고사 빈출 어휘 3,000개를 초·중등 기초 → 중·고 핵심 → 전문 심화 순서로 다시 배열했습니다.', { size: 17, color: DIM }), { after: 0, line: 250 }),
  ];
  return {
    properties: PAGE,
    children: [
      table([1000, W-1000], [trow([
        cell(p(new ImageRun({ type: 'png', data: LOGO, transformation: { width: 52, height: 44 } })), { w: 1000, margins: { top: 0, bottom: 0, left: 0, right: 120 } }),
        cell([
          p(run('ORUN ENGLISH', { size: 18, color: INK, bold: true, ls: 40 }), { after: 30 }),
          p(run('옳은영어 · 정시 대비 어휘 기본서', { size: 16, color: GRAY }), {}),
        ], { w: W-1000 }),
      ], 620)]),
      p([], { border: { bottom: HAIR }, before: 120, after: 520, line: 20 }),

      table([W], [trow([cell(inkKids, { w: W, fill: INK, va: VerticalAlign.TOP,
        margins: { top: 760, bottom: 820, left: 560, right: 560 } })])]),

      gap(0),
      table([W], [trow(P.map((pt, i) => cell([
        p(run(String(pt.count).replace(/\B(?=(\d{3})+(?!\d))/g, ','), { size: 34, color: YEL, bold: true, ls: 20 }), { after: 50 }),
        p(run(pt.ko, { size: 17, color: DIM, ls: 20 }), { after: 30 }),
        p(run(`DAY ${String(pt.day_from).padStart(2,'0')}–${String(pt.day_to).padStart(2,'0')}`, { size: 14, color: SOFT, ls: 20 }), {}),
      ], { w: Math.floor(W/3), fill: INK, left: i ? bd(BODY, 0.5) : NONE,
           margins: { top: 230, bottom: 230, left: i ? 240 : 560, right: 160 } })))]),

      gap(2100),
      p([run('■ ', { size: 14, color: YEL }), run('75 DAYS   ·   3 LEVELS   ·   3,000 WORDS', { size: 17, color: INK, bold: true, ls: 80 })], { after: 220 }),
      infoRows([
        ['수록 어휘', '3,000단어 · 초·중 800 / 중·고 1,800 / 전문 400'],
        ['학습 구성', 'DAY 40단어 × 75일 + REVIEW TEST 15회 (32문항)'],
        ['대상', '옳은영어 정시반 (고1–고3 수능·모의고사 대비)'],
        ['부가 구성', '학습 플래너 · REVIEW TEST 정답 · 알파벳 INDEX'],
      ], 1450),
      gap(1800),
      p([], { border: { bottom: HAIR }, after: 130, line: 20 }),
      p([run('옳은영어  ', { size: 17, color: INK, bold: true }), run('ORUN ENGLISH', { size: 15, color: INK, bold: true, ls: 40 }),
         run('      [주소]  ·  [전화번호]  ·  카카오채널 [채널명]', { size: 14, color: GRAY })], {}),
    ],
  };
}

/* ── 2. 앞 구성 (활용법 · 플래너) ────────────────────────── */
function frontMatter() {
  const kids = [];
  kids.push(eyebrow('HOW TO USE THIS BOOK'));
  kids.push(p(run('이 책의 구성과 활용법', { size: 42, color: INK, bold: true }), { after: 110 }));
  kids.push(p(run('원본 어휘 목록을 알파벳 순서가 아니라 난이도 순서로 다시 배열한 정시반 전용 단어장입니다.', { size: 19, color: GRAY }), { after: 300 }));
  kids.push(infoTable([
    ['총 수록 어휘', '3,000단어'],
    ['난이도 단계', '3단계 (초·중 → 중·고 → 전문)'],
    ['하루 분량', '40단어 · 총 75 DAY'],
    ['권장 학습 기간', '1회독 75일 / 3회독 약 5개월'],
  ], { kw: 1450 }));

  kids.push(h1('01', '난이도 3단계로 재배열했습니다'));
  kids.push(body('원본 목록은 a, abandon, able … 처럼 알파벳 순서였습니다. 이 책은 같은 3,000단어를 난이도 등급에 따라 세 파트로 나누고, 각 파트 안에서만 알파벳 순으로 정렬했습니다. 쉬운 단어부터 순서대로 쌓아 올리기 때문에 앞 DAY를 건너뛰지 않으면 모르는 단어가 갑자기 튀어나오지 않습니다.'));
  const P = book.parts;
  kids.push(table([560, 1360, 1780, 2000, 1500, 1200, 1238], [
    trow([
      cell(p(run('', {})), { w: 560, bottom: INKRULE }),
      cell(p(run('PART', { size: 17, color: GRAY, bold: true, ls: 20 })), { w: 1360, bottom: INKRULE }),
      cell(p(run('LEVEL', { size: 17, color: GRAY, bold: true, ls: 20 })), { w: 1780, bottom: INKRULE }),
      cell(p(run('난이도 단계', { size: 17, color: GRAY, bold: true, ls: 20 })), { w: 2000, bottom: INKRULE }),
      cell(p(run('수록 어휘', { size: 17, color: GRAY, bold: true, ls: 20 })), { w: 1500, bottom: INKRULE }),
      cell(p(run('학습 범위', { size: 17, color: GRAY, bold: true, ls: 20 })), { w: 1200, bottom: INKRULE }),
      cell(p(run('원본 등급', { size: 17, color: GRAY, bold: true, ls: 20 })), { w: 1238, bottom: INKRULE }),
    ], 320),
    ...P.map((pt, i) => trow([
      cell(p(run('■', { size: 15, color: PART_MARK[i] })), { w: 560, bottom: HAIR }),
      cell(p(run('PART ' + pt.roman, { size: 19, color: INK, bold: true })), { w: 1360, bottom: HAIR }),
      cell(p(run(pt.en, { size: 16, color: GRAY, bold: true, ls: 30 })), { w: 1780, bottom: HAIR }),
      cell(p(run(pt.ko, { size: 19, color: BODY })), { w: 2000, bottom: HAIR }),
      cell(p(run(pt.count.toLocaleString() + '단어', { size: 19, color: BODY })), { w: 1500, bottom: HAIR }),
      cell(p(run(`DAY ${String(pt.day_from).padStart(2,'0')}–${String(pt.day_to).padStart(2,'0')}`, { size: 19, color: BODY })), { w: 1200, bottom: HAIR }),
      cell(p(run(pt.key, { size: 19, color: BODY })), { w: 1238, bottom: HAIR }),
    ], 340)),
  ]));

  kids.push(h1('02', 'DAY 한 면에 40단어'));
  kids.push(body('한 DAY는 정확히 40단어이며 A4 한 면에 두 단씩 배치했습니다. 각 단어 앞의 □는 “아직 모르는 단어” 표시용입니다. 오른쪽 끝의 뜻을 손이나 책갈피로 가리고 영어만 보며 뜻을 말해 보는 방식이 가장 빠릅니다.'));
  kids.push(callout('DAY 페이지 읽는 법', [
    '□  체크 칸 — 뜻이 바로 안 나온 단어에 표시하고, 다음 회독에서 표시된 것만 봅니다.',
    '01  번호 — 그 DAY 안에서의 순번입니다. 페이지 오른쪽 위 #0001–0040은 책 전체 통번호입니다.',
    '= 표기 — 철자가 다른 이형태(영국식 등)입니다. 함께 알아 두면 좋습니다.',
    '맨 아래 “헷갈리는 단어” 칸 — 그날 가장 안 외워진 5개를 직접 옮겨 적습니다.',
  ]));

  kids.push(h1('03', 'DAY 5개마다 REVIEW TEST'));
  kids.push(body('DAY 5개(200단어)를 마칠 때마다 32문항 확인 테스트가 나옵니다. A는 영어를 보고 우리말 뜻을 쓰고, B는 우리말 뜻을 보고 영어 철자를 씁니다. 정답은 책 뒤 「REVIEW TEST 정답」에 모아 두었습니다. 16문항 이하로 맞았다면 그 다섯 DAY를 다시 보고 넘어가세요.'));

  kids.push(h1('04', '3회독 학습법'));
  kids.push(callout('권장 회독 계획', [
    '1회독 (75일) — 하루 1 DAY. 뜻을 눈으로 익히는 단계입니다. 모르는 단어에 □ 체크.',
    '2회독 (38일) — 하루 2 DAY. 체크한 단어 위주로 보고, 여전히 모르면 두 번째 □ 체크.',
    '3회독 (25일) — 하루 3 DAY. 체크가 두 개인 단어만 봅니다. 여기서 남는 것이 진짜 약점입니다.',
    'PART II(중·고 핵심 1,800단어)는 정시 독해의 뼈대입니다. 시간이 부족하면 PART II부터 완성하세요.',
  ], 'blue'));
  kids.push(body('학습한 날짜와 회독 여부는 다음 면의 학습 플래너에 직접 기록하세요.', { after: 0 }));

  /* 학습 플래너 */
  kids.push(new Paragraph({ children: [dot(), run('STUDY PLANNER', { size: 16, color: GRAY, ls: 40, bold: true })],
    pageBreakBefore: true, keepNext: true, spacing: { before: 0, after: 90, line: 260 } }));
  kids.push(p(run('학습 플래너', { size: 42, color: INK, bold: true }), { after: 110 }));
  kids.push(p(run('DAY를 마칠 때마다 날짜를 적고 회독 칸에 표시하세요. ■ 색은 파트를 뜻합니다.', { size: 19, color: GRAY }), { after: 160 }));
  kids.push(p(book.parts.map((pt, i) => [
    run('■ ', { size: 14, color: PART_MARK[i] }),
    run(`PART ${pt.roman} ${pt.ko}      `, { size: 16, color: GRAY, ls: 20 }),
  ]).flat(), { after: 260 }));

  const cw = Math.floor(W / 5), planner = [];
  for (let r = 0; r < 15; r++) {
    const cells = [];
    for (let c = 0; c < 5; c++) {
      const day = r * 5 + c + 1;
      const d = book.days[day - 1];
      cells.push(cell([
        p([run('■ ', { size: 12, color: PART_MARK[d.part] }), run('DAY ' + String(day).padStart(2, '0'), { size: 18, color: INK, bold: true })], { after: 55 }),
        p(run('___ / ___     □ □ □', { size: 15, color: GRAY }), {}),
      ], { w: cw, bottom: HAIR, top: r === 0 ? INKRULE : NONE, margins: { top: 110, bottom: 110, left: 0, right: 120 } }));
    }
    planner.push(trow(cells, 560));
  }
  kids.push(table([cw, cw, cw, cw, cw], planner));
  kids.push(p([run('1회독 □   2회독 □   3회독 □   ·   빈칸에는 학습한 날짜(월 / 일)를 적습니다.', { size: 15, color: GRAY })], { before: 200 }));

  return { properties: PAGE, headers: { default: header('이 책의 사용법') }, footers: { default: footer() }, children: kids };
}

/* ── 3. 파트 도비라 ──────────────────────────────────────── */
function partDivider(pt, i) {
  const pad = (n) => String(n).padStart(2, '0');
  return [
    gap(3600),
    p([run('■ ', { size: 16, color: PART_MARK[i] }), run('PART ' + pt.roman, { size: 20, color: GOLD, bold: true, ls: 80 })], { after: 220 }),
    p(run(pt.en, { size: 56, color: INK, bold: true, ls: 40 }), { after: 90, line: 620 }),
    p(run(pt.ko, { size: 28, color: BODY, bold: true }), { after: 240 }),
    p([], { border: { bottom: INKRULE }, after: 260, line: 20 }),
    p(run(pt.desc, { size: 20, color: BODY }), { after: 420, line: 280 }),
    statBox([
      { n: pt.count.toLocaleString(), label: '수록 어휘' },
      { n: `DAY ${pad(pt.day_from)}–${pad(pt.day_to)}`, label: `${pt.days}일 구성` },
      { n: `#${String(pt.seq_from).padStart(4,'0')}–${String(pt.seq_to).padStart(4,'0')}`, label: '전체 통번호' },
    ], { big: 30 }),
    gap(300),
    p(run(`원본 난이도 등급 「${pt.key}」에 해당하는 어휘입니다. 파트 안에서는 알파벳 순으로 정렬했습니다.`, { size: 16, color: GRAY }), {}),
  ];
}

/* ── 4. DAY 페이지 ───────────────────────────────────────── */
const CHK = 250, NUM = 360, WRD = 1760, MEA = 2249, GUT = 400;
const DAYCOLS = [CHK, NUM, WRD, MEA, GUT, CHK, NUM, WRD, MEA];

/* 뜻이 몇 줄로 접히는지 예측(한글 1, 영문·기호 0.5칸) */
function wrapLines(s, perLine) {
  let w = 0; for (const ch of s) w += ch.codePointAt(0) > 0x1100 ? 1 : 0.5;
  return Math.max(1, Math.ceil(w / perLine));
}
/* 면이 남지도 넘치지도 않도록 행 위아래 여백을 정한다 (slack: 남는 높이 twips) */
function fitPad(base, rows, extraLines, slack, buffer, cap) {
  const room = slack - extraLines * 170 - buffer;
  return base + Math.max(0, Math.min(cap, Math.round(room / rows / 2)));
}
function dayPad(d) {
  const half = Math.ceil(d.entries.length / 2);
  const h = (e) => e ? wrapLines(e.mean, 12.5) + (e.var ? 1 : 0) : 1;
  let extra = 0;
  for (let i = 0; i < half; i++) extra += Math.max(h(d.entries[i]), h(d.entries[i + half])) - 1;
  return fitPad(105, half, extra, 2440, 700, 60);
}
function reviewPad(rv) {
  const per = Math.ceil(rv.a.length / 2);
  let extra = 0;
  for (let i = 0; i < per; i++) {
    extra += Math.max(wrapLines(rv.b[i].mean, 12), wrapLines(rv.b[i + per].mean, 12)) - 1;
  }
  return fitPad(180, per * 2, extra, 1700, 450, 70);
}

function entryCells(e, last, vpad) {
  if (!e) return [cell(p(run('', {})), { w: CHK }), cell(p(run('', {})), { w: NUM }), cell(p(run('', {})), { w: WRD }), cell(p(run('', {})), { w: MEA })];
  const b = last ? NONE : HAIR;
  const wordKids = [p(run(e.word, { size: 19, color: INK, bold: true }), { after: e.var ? 20 : 0, line: 230 })];
  if (e.var) wordKids.push(p(run('= ' + e.var, { size: 13, color: GRAY }), { line: 190 }));
  return [
    cell(p(run('□', { size: 15, color: RULE }), { align: AlignmentType.LEFT }), { w: CHK, bottom: b, margins: { top: vpad, bottom: vpad, left: 0, right: 40 } }),
    cell(p(run(String(e.n).padStart(2, '0'), { size: 14, color: GRAY })), { w: NUM, bottom: b, margins: { top: vpad, bottom: vpad, left: 0, right: 90 } }),
    cell(wordKids, { w: WRD, bottom: b, margins: { top: vpad, bottom: vpad, left: 0, right: 120 } }),
    cell(p(run(e.mean, { size: 17, color: BODY }), { line: 218 }), { w: MEA, bottom: b, margins: { top: vpad, bottom: vpad, left: 0, right: 100 } }),
  ];
}

function dayPage(d, isFirstOfPart) {
  const pt = book.parts[d.part], pad = (n) => String(n).padStart(2, '0');
  const kids = [];
  kids.push(p([
    run('■ ', { size: 13, color: PART_MARK[d.part] }),
    run(`PART ${pt.roman}  ·  ${pt.ko}`, { size: 15, color: GRAY, bold: true, ls: 40 }),
    run('\t#' + String(d.seq_from).padStart(4,'0') + ' – #' + String(d.seq_to).padStart(4,'0'), { size: 15, color: GRAY, ls: 20 }),
  ], { after: 80, pbb: !isFirstOfPart, keepNext: true, tabs: [{ type: TabStopType.RIGHT, position: W }] }));

  kids.push(table([3400, W-3400], [trow([
    cell([p([run('DAY ', { size: 22, color: GRAY, bold: true, ls: 60 }), run(pad(d.day), { size: 46, color: INK, bold: true })], { line: 500 })], { w: 3400, va: VerticalAlign.BOTTOM, margins: { top: 0, bottom: 60, left: 0, right: 0 } }),
    cell([p([
      run('학습일 ', { size: 16, color: GRAY }), run('_____ / _____', { size: 16, color: RULE }),
      run('        1회독 ', { size: 16, color: GRAY }), run('□', { size: 16, color: RULE }),
      run('   2회독 ', { size: 16, color: GRAY }), run('□', { size: 16, color: RULE }),
      run('   3회독 ', { size: 16, color: GRAY }), run('□', { size: 16, color: RULE }),
    ], { align: AlignmentType.RIGHT })], { w: W-3400, va: VerticalAlign.BOTTOM, margins: { top: 0, bottom: 110, left: 0, right: 0 } }),
  ])]));
  kids.push(p([], { border: { bottom: INKRULE }, after: 150, line: 20, keepNext: true }));

  const hd = (t, w) => cell(p(run(t, { size: 15, color: GRAY, bold: true, ls: 30 })), { w, bottom: INKRULE, margins: { top: 30, bottom: 70, left: 0, right: 90 } });
  const rows = [trow([
    hd('', CHK), hd('', NUM), hd('WORD 표제어', WRD), hd('MEANING 뜻', MEA),
    cell(p(run('', {})), { w: GUT }),
    hd('', CHK), hd('', NUM), hd('WORD 표제어', WRD), hd('MEANING 뜻', MEA),
  ], 280)];
  const half = Math.ceil(d.entries.length / 2), vpad = dayPad(d);
  for (let i = 0; i < half; i++) {
    const L = d.entries[i], R = d.entries[i + half], last = i === half - 1;
    rows.push(trow([...entryCells(L, last, vpad), cell(p(run('', {})), { w: GUT }), ...entryCells(R, last, vpad)], 330));
  }
  kids.push(table(DAYCOLS, rows));

  kids.push(table([W], [trow([cell([
    p([run('■ ', { size: 13, color: YEL }), run('오늘 헷갈린 단어', { size: 16, color: GOLD, bold: true, ls: 20 }),
       run('     __________       __________       __________       __________       __________', { size: 17, color: RULE })], {}),
  ], { w: W, fill: PAPER, margins: { top: 170, bottom: 170, left: 220, right: 200 } })])]));
  return kids;
}

/* ── 5. REVIEW TEST ──────────────────────────────────────── */
const RNO = 380, RPR = 2200, RAN = 2039;
function reviewPage(rv) {
  const pt = book.parts[rv.part], pad = (n) => String(n).padStart(2, '0');
  const kids = [];
  kids.push(p([
    run('■ ', { size: 13, color: PART_MARK[rv.part] }),
    run(`PART ${pt.roman}  ·  ${pt.ko}`, { size: 15, color: GRAY, bold: true, ls: 40 }),
    run('\t배점 없음 · 32문항', { size: 15, color: GRAY, ls: 20 }),
  ], { after: 80, pbb: true, keepNext: true, tabs: [{ type: TabStopType.RIGHT, position: W }] }));
  kids.push(table([5600, W-5600], [trow([
    cell([p([run('REVIEW TEST ', { size: 22, color: GRAY, bold: true, ls: 60 }), run(pad(rv.no), { size: 46, color: INK, bold: true })], { line: 500 })], { w: 5600, va: VerticalAlign.BOTTOM, margins: { top: 0, bottom: 60, left: 0, right: 0 } }),
    cell([p([
      run(`DAY ${pad(rv.day_from)} – ${pad(rv.day_to)}`, { size: 20, color: INK, bold: true }),
      run('        이름 ', { size: 16, color: GRAY }), run('____________', { size: 16, color: RULE }),
      run('   점수 ', { size: 16, color: GRAY }), run('_______', { size: 16, color: RULE }), run(' / 32', { size: 16, color: GRAY }),
    ], { align: AlignmentType.RIGHT })], { w: W-5600, va: VerticalAlign.BOTTOM, margins: { top: 0, bottom: 240, left: 0, right: 0 } }),
  ])]));
  kids.push(p([], { border: { bottom: INKRULE }, after: 200, line: 20, keepNext: true }));

  const rpad = reviewPad(rv);
  const qBlock = (items, key) => {
    const rows = [];
    const half = Math.ceil(items.length / 2);
    for (let i = 0; i < half; i++) {
      const mk = (it, idx) => it ? [
        cell(p(run(pad(idx + 1), { size: 15, color: GRAY })), { w: RNO, margins: { top: rpad, bottom: rpad, left: 0, right: 80 } }),
        cell(p(run(key === 'a' ? it.word : it.mean, { size: key === 'a' ? 19 : 17, color: INK, bold: key === 'a', line: 220 })), { w: RPR, margins: { top: rpad, bottom: rpad, left: 0, right: 120 }, va: VerticalAlign.BOTTOM }),
        cell(p(run('', {})), { w: RAN, bottom: FILL, margins: { top: rpad, bottom: rpad, left: 0, right: 200 } }),
      ] : [cell(p(run('', {})), { w: RNO }), cell(p(run('', {})), { w: RPR }), cell(p(run('', {})), { w: RAN })];
      rows.push(trow([...mk(items[i], i), cell(p(run('', {})), { w: GUT }), ...mk(items[i + half], i + half)], 400));
    }
    return table([RNO, RPR, RAN, GUT, RNO, RPR, RAN], rows);
  };

  kids.push(p([run('A', { size: 22, color: GOLD, bold: true, ls: 40 }), run('   영어를 보고 우리말 뜻을 쓰세요.', { size: 20, color: INK, bold: true })], { after: 40, keepNext: true }));
  kids.push(p([], { border: { bottom: HAIR }, after: 130, line: 20, keepNext: true }));
  kids.push(qBlock(rv.a, 'a'));
  kids.push(p([run('B', { size: 22, color: BLUE, bold: true, ls: 40 }), run('   우리말 뜻을 보고 영어 철자를 쓰세요.', { size: 20, color: INK, bold: true })], { before: 380, after: 40, keepNext: true }));
  kids.push(p([], { border: { bottom: HAIR }, after: 130, line: 20, keepNext: true }));
  kids.push(qBlock(rv.b, 'b'));
  return kids;
}

/* ── 6. 정답 ─────────────────────────────────────────────── */
function answerSection() {
  const kids = [];
  kids.push(eyebrow('ANSWER KEY'));
  kids.push(p(run('REVIEW TEST 정답', { size: 42, color: INK, bold: true }), { after: 110 }));
  kids.push(p(run('A는 우리말 뜻, B는 영어 철자입니다. 뜻이 여러 개인 단어는 그중 하나만 맞아도 정답으로 봅니다.', { size: 19, color: GRAY }), { after: 300 }));

  const cw = Math.floor(W / 4);
  book.reviews.forEach((rv, ri) => {
    const pad = (n) => String(n).padStart(2, '0');
    kids.push(p([
      run('■ ', { size: 13, color: PART_MARK[rv.part] }),
      run(`REVIEW TEST ${pad(rv.no)}`, { size: 20, color: INK, bold: true }),
      run(`     DAY ${pad(rv.day_from)} – ${pad(rv.day_to)}`, { size: 16, color: GRAY, ls: 20 }),
    ], { before: (ri === 0 || ri >= 3 && (ri - 3) % 4 === 0) ? 0 : 400, after: 40, keepNext: true, pbb: ri >= 3 && (ri - 3) % 4 === 0 }));
    kids.push(p([], { border: { bottom: INKRULE }, after: 110, line: 20, keepNext: true }));
    const cwq = Math.floor(W / 4), per = 8;
    const lab = (t, c) => cell(p([run(t, { size: 15, color: c, bold: true, ls: 40 })]),
      { w: cwq, span: 2, bottom: HAIR, margins: { top: 40, bottom: 60, left: 0, right: 110 } });
    const rows = [new TableRow({ children: [lab('A  우리말 뜻', GOLD), lab('B  영어 철자', BLUE)],
      height: { value: 260, rule: HeightRule.ATLEAST } })];
    for (let r = 0; r < per; r++) {
      const cells = [];
      [[rv.a, 'mean'], [rv.b, 'word']].forEach(([items, key]) => {
        for (let c = 0; c < 2; c++) {
          const idx = c * per + r, it = items[idx];
          cells.push(cell(p(it ? [
            run(String(idx + 1).padStart(2, '0') + ' ', { size: 13, color: GRAY }),
            run(it[key], { size: 15, color: BODY }),
          ] : [run('', {})], { line: 200 }), { w: cwq, margins: { top: 45, bottom: 45, left: 0, right: 110 }, va: VerticalAlign.TOP }));
        }
      });
      rows.push(trow(cells, 230));
    }
    kids.push(table([cwq, cwq, cwq, cwq], rows));
  });
  return { properties: PAGE, headers: { default: header('REVIEW TEST 정답') }, footers: { default: footer() }, children: kids };
}

/* ── 7. INDEX ────────────────────────────────────────────── */
function indexSection() {
  const kids = [];
  kids.push(eyebrow('INDEX · 3,000 WORDS'));
  kids.push(p(run('알파벳 색인', { size: 42, color: INK, bold: true }), { after: 110 }));
  kids.push(p(run('이 책은 난이도순으로 배열되어 있으므로, 특정 단어를 찾을 때는 아래 색인에서 DAY 번호를 확인하세요.', { size: 19, color: GRAY }), { after: 260 }));

  const IW = 1427, ID = 500;                     // (1427+500) × 5 = 9635
  const COLS = 5, ROWS = 40, FIRST = 33;
  const idx = book.index;
  const chunks = [];
  for (let s = 0; s < idx.length; ) {
    const n = COLS * (chunks.length === 0 ? FIRST : ROWS);
    chunks.push([s, idx.slice(s, s + n)]); s += n;
  }
  for (const [start, page] of chunks) {
    const first = page[0].word[0].toUpperCase(), last = page[page.length - 1].word[0].toUpperCase();
    kids.push(p([
      run('■ ', { size: 13, color: YEL }),
      run(`INDEX  ${first} – ${last}`, { size: 16, color: GRAY, bold: true, ls: 40 }),
      run('\t' + (start + 1).toLocaleString() + ' – ' + (start + page.length).toLocaleString() + ' / 3,000', { size: 15, color: GRAY, ls: 20 }),
    ], { after: 60, keepNext: true, pbb: start > 0, tabs: [{ type: TabStopType.RIGHT, position: W }] }));
    const hrow = [];
    for (let c = 0; c < COLS; c++) {
      hrow.push(cell(p(run('WORD', { size: 13, color: GRAY, bold: true, ls: 30 })), { w: IW, bottom: INKRULE, margins: { top: 20, bottom: 60, left: 0, right: 60 } }));
      hrow.push(cell(p(run('DAY', { size: 13, color: GRAY, bold: true, ls: 30 }), { align: AlignmentType.RIGHT }), { w: ID, bottom: INKRULE, margins: { top: 20, bottom: 60, left: 0, right: 150 } }));
    }
    const rows = [trow(hrow, 250)];
    const per = Math.ceil(page.length / COLS);
    for (let r = 0; r < per; r++) {
      const cells = [];
      for (let c = 0; c < COLS; c++) {
        const it = page[c * per + r];
        cells.push(cell(p(run(it ? it.word : '', { size: 14, color: BODY, line: 190 })), { w: IW, bottom: HAIR, margins: { top: 30, bottom: 30, left: 0, right: 60 } }));
        cells.push(cell(p(run(it ? String(it.day).padStart(2, '0') : '', { size: 13, color: GRAY }), { align: AlignmentType.RIGHT, line: 190 }), { w: ID, bottom: HAIR, margins: { top: 30, bottom: 30, left: 0, right: 150 } }));
      }
      rows.push(trow(cells, 215));
    }
    kids.push(table(Array.from({ length: COLS }, () => [IW, ID]).flat(), rows));
  }
  return { properties: PAGE, headers: { default: header('알파벳 색인') }, footers: { default: footer() }, children: kids };
}

/* ── 파트 본문 섹션 ──────────────────────────────────────── */
function partSection(pt, i) {
  const kids = [...partDivider(pt, i)];
  const days = book.days.filter((d) => d.part === i);
  days.forEach((d) => {
    kids.push(...dayPage(d, false));
    const rv = book.reviews.find((r) => r.day_to === d.day);
    if (rv) kids.push(...reviewPage(rv));
  });
  return {
    properties: PAGE,
    headers: { default: header(`PART ${pt.roman} · ${pt.ko}`) },
    footers: { default: footer() },
    children: kids,
  };
}

/* ── 문서 조립 ───────────────────────────────────────────── */
const doc = new Document({
  creator: '옳은영어 ORUN ENGLISH',
  title: '옳은 VOCA 3000 · 정시반 필수 영단어',
  description: '원본 3,000단어를 초·중 / 중·고 / 전문 3단계 난이도순으로 재배열한 정시반 어휘 기본서',
  styles: { default: { document: { run: { font: F, size: 20, color: BODY } } } },
  sections: [cover(), frontMatter(), ...book.parts.map(partSection), answerSection(), indexSection()],
});

Packer.toBuffer(doc).then((buf) => {
  const out = process.argv[2] || __dirname + '/옳은영어_정시반_VOCA_3000.docx';
  fs.writeFileSync(out, buf);
  console.log('written', out, (buf.length / 1024 / 1024).toFixed(2) + ' MB');
});
