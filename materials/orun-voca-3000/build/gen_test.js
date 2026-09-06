/* 옳은영어 정시반 VOCA 3000 — 별책 단어시험지(.docx) 생성기
 * DAY마다 100문항 한 장씩 30회 + 다의어 시험 + 정답.
 * 시험은 모두 「영어 단어를 보고 우리말 뜻을 쓰는」 형식이다.
 *
 *   node gen_test.js ["출력.docx"] */
const fs = require('fs');
const C = require('./common');
const {
  docx: { Document, Packer, Paragraph, ImageRun, VerticalAlign, AlignmentType, TabStopType },
  LOGO, W, PAGE, PART_MARK,
  INK, BODY, GRAY, PAPER, BLUE, YEL, GOLD, DIM, RULE, SOFT,
  NONE, bd, HAIR, INKRULE, FILL,
  run, p, gap, cell, table, trow,
  dot, eyebrow, h1, body, infoRows, callout, statBox,
  header, footer, wrapLines, fitPad, comma, pad2,
} = C;

const book = JSON.parse(fs.readFileSync(__dirname + '/book.json', 'utf8'));
const PER_DAY = book.tests[0].questions.length;      // 100
const HD = (r) => header(r, '옳은영어 정시반 단어시험지');
const FT = () => footer('옳은영어 · 정시반 VOCA 3000 단어시험지');

/* 이름·점수 칸 */
const scoreLine = (total) => p([
  run('이름 ', { size: 15, color: GRAY }), run('___________', { size: 15, color: RULE }),
  run('   날짜 ', { size: 15, color: GRAY }), run('___ / ___', { size: 15, color: RULE }),
  run('   점수 ', { size: 15, color: GRAY }), run('______', { size: 15, color: RULE }),
  run(' / ' + total, { size: 15, color: GRAY }),
], { align: AlignmentType.RIGHT });

/* 시험지 표제부 : 아이브로우 + 큰 제목 + 잉크 괘선 */
function testHead(eyebrowKids, title, num, right, total, pbb) {
  return [
    p([...eyebrowKids, run('\t' + right, { size: 15, color: GRAY, ls: 20 })],
      { after: 60, pbb, keepNext: true, tabs: [{ type: TabStopType.RIGHT, position: W }] }),
    table([4400, W - 4400], [trow([
      cell([p([run(title + ' ', { size: 21, color: GRAY, bold: true, ls: 60 }), run(num, { size: 38, color: INK, bold: true })], { line: 430 })],
        { w: 4400, va: VerticalAlign.BOTTOM, margins: { top: 0, bottom: 40, left: 0, right: 0 } }),
      cell([scoreLine(total)], { w: W - 4400, va: VerticalAlign.BOTTOM, margins: { top: 0, bottom: 120, left: 0, right: 0 } }),
    ])]),
    p([], { border: { bottom: INKRULE }, after: 150, line: 20, keepNext: true }),
  ];
}

/* ── 1. 표지 ─────────────────────────────────────────────── */
function cover() {
  const inkKids = [
    p([run('■ ', { size: 14, color: YEL }), run('ORUN ENGLISH · WORD TEST PAPERS', { size: 15, color: DIM, ls: 60, bold: true })], { after: 700 }),
    p(run('단어시험지', { size: 64, color: PAPER, bold: true, ls: 40 }), { after: 0, line: 700 }),
    p([run('30 DAYS', { size: 46, color: YEL, bold: true, ls: 60 })], { after: 220, line: 560 }),
    p([], { border: { bottom: bd(SOFT, 0.75) }, after: 200, line: 20 }),
    p(run('옳은 VOCA 3000 별책 · 영어를 보고 우리말 뜻 쓰기', { size: 24, color: PAPER, bold: true }), { after: 90 }),
    p(run('DAY마다 그날 외운 100단어를 하나도 빠짐없이, 순서를 섞어 냅니다. 뒤쪽에 다의어 시험과 정답이 있습니다.', { size: 17, color: DIM }), { after: 0, line: 250 }),
  ];
  return {
    properties: PAGE,
    children: [
      table([1000, W - 1000], [trow([
        cell(p(new ImageRun({ type: 'png', data: LOGO, transformation: { width: 52, height: 44 } })), { w: 1000, margins: { top: 0, bottom: 0, left: 0, right: 120 } }),
        cell([
          p(run('ORUN ENGLISH', { size: 18, color: INK, bold: true, ls: 40 }), { after: 30 }),
          p(run('옳은영어 · 정시반 어휘 시험지', { size: 16, color: GRAY }), {}),
        ], { w: W - 1000 }),
      ], 620)]),
      p([], { border: { bottom: HAIR }, before: 120, after: 520, line: 20 }),

      table([W], [trow([cell(inkKids, { w: W, fill: INK, va: VerticalAlign.TOP,
        margins: { top: 760, bottom: 820, left: 560, right: 560 } })])]),

      gap(0),
      table([W], [trow([
        { n: '30회', l: 'DAY 단어시험', s: '회당 100문항' },
        { n: String(book.poly_tests.length) + '회', l: '다의어 시험', s: `${book.poly.length}단어` },
        { n: comma(book.days.length * PER_DAY), l: '출제 어휘', s: '3,000단어 전부' },
      ].map((it, i) => cell([
        p(run(it.n, { size: 34, color: YEL, bold: true, ls: 20 }), { after: 50 }),
        p(run(it.l, { size: 17, color: DIM, ls: 20 }), { after: 30 }),
        p(run(it.s, { size: 14, color: SOFT, ls: 20 }), {}),
      ], { w: Math.floor(W / 3), fill: INK, left: i ? bd(BODY, 0.5) : NONE,
           margins: { top: 230, bottom: 230, left: i ? 240 : 560, right: 160 } })))]),

      gap(2100),
      p([run('■ ', { size: 14, color: YEL }), run('WORD TEST   ·   POLYSEMY TEST   ·   ANSWER KEY', { size: 17, color: INK, bold: true, ls: 60 })], { after: 220 }),
      infoRows([
        ['시험 형식', '영어 단어를 보고 우리말 뜻을 쓰는 주관식 (객관식 없음)'],
        ['DAY 시험', '30회 × 100문항 — 그 DAY 100단어 전부, 순서만 섞어서'],
        ['다의어 시험', `${book.poly_tests.length}회 — 한 단어의 뜻을 아는 대로 모두 쓰기`],
        ['정답', '책 뒤에 DAY 시험 30회분 + 다의어 시험 전부'],
        ['짝 교재', '「옳은 VOCA 3000」 단어장 — 같은 DAY 번호로 이어집니다'],
      ], 1450),
      gap(1400),
      p([], { border: { bottom: HAIR }, after: 130, line: 20 }),
      p([run('옳은영어  ', { size: 17, color: INK, bold: true }), run('ORUN ENGLISH', { size: 15, color: INK, bold: true, ls: 40 }),
         run('      [주소]  ·  [전화번호]  ·  카카오채널 [채널명]', { size: 14, color: GRAY })], {}),
    ],
  };
}

/* ── 2. 사용 안내 + 성적 기록표 ──────────────────────────── */
function guide() {
  const kids = [];
  kids.push(eyebrow('HOW TO USE THESE TEST PAPERS', { after: 260 }));
  kids.push(p(run('시험지 사용 안내', { size: 42, color: INK, bold: true }), { after: 110 }));
  kids.push(p(run('단어장 「옳은 VOCA 3000」의 DAY 번호와 그대로 이어집니다. DAY를 외운 그날 바로 보세요.', { size: 19, color: GRAY }), { after: 300 }));
  kids.push(infoRows([
    ['DAY 시험', '30회 · 회당 100문항 (그 DAY 100단어 전부)'],
    ['다의어 시험', `${book.poly_tests.length}회 · ${book.poly.length}단어 (뜻을 아는 대로 모두 쓰기)`],
    ['형식', '영어 단어를 보고 우리말 뜻 쓰기'],
    ['정답', '이 책 뒤 「정답」'],
  ], 1450));

  kids.push(h1('01', 'DAY 시험 — 100문항'));
  kids.push(body('한 DAY의 100단어를 하나도 빼지 않고 모두 냅니다. 다만 단어장에 실린 순서 그대로가 아니라 섞어서 냈습니다. 순서로 외운 학생과 뜻으로 외운 학생이 여기서 갈립니다. 문항 번호 옆의 작은 회색 숫자는 그 단어가 단어장 DAY 면의 몇 번인지를 가리키니, 틀린 단어를 곧바로 찾아볼 수 있습니다.'));
  kids.push(callout('채점 기준', [
    '뜻이 여러 개인 단어는 그중 하나만 맞아도 정답으로 봅니다.',
    '80점 미만이면 그 DAY를 다시 보고 재시험을 권합니다. 점수는 단어장의 학습 플래너에 적으세요.',
    '틀린 단어는 단어장 해당 DAY 면의 □에 표시해 두고, 다음 회독에서 그것만 봅니다.',
  ]));

  kids.push(h1('02', '다의어 시험 — 뜻을 모두 쓰기'));
  kids.push(body(`단어장은 단어마다 대표 뜻 하나만 싣습니다. 그런데 run을 “달리다”로만 외우면 The company is run by … 에서 막힙니다. 뜻 하나로 포괄되지 않는 ${book.poly.length}단어를 따로 모아 ${book.poly_tests.length}회분 시험으로 냈습니다. 단어 옆의 (4)는 “답이 4개”라는 뜻이니, 그 수만큼 채워 쓰세요. 뜻의 순서는 상관없습니다.`));
  kids.push(callout('다의어 시험 보는 법', [
    '단어장 뒤 「부록 · 다의어 정리」를 먼저 한 번 훑은 뒤에 보는 것이 좋습니다.',
    '괄호 안의 개수만큼 쓰되, 절반 이상 맞히면 그 단어는 넘어가도 됩니다.',
    '한 번에 다 못 외웁니다. 3회독쯤에서 다시 보면 대부분 붙습니다.',
  ], 'blue'));

  /* 성적 기록표 */
  kids.push(new Paragraph({ children: [dot(), run('SCORE RECORD', { size: 16, color: GRAY, ls: 40, bold: true })],
    pageBreakBefore: true, keepNext: true, spacing: { before: 0, after: 260, line: 260 } }));
  kids.push(p(run('성적 기록표', { size: 42, color: INK, bold: true }), { after: 110 }));
  kids.push(p(run('시험을 볼 때마다 점수를 적으세요. 80점 미만은 재시험 칸까지 채웁니다. ■ 색은 파트를 뜻합니다.', { size: 19, color: GRAY }), { after: 160 }));
  kids.push(p(book.parts.map((pt, i) => [
    run('■ ', { size: 14, color: PART_MARK[i] }),
    run(`PART ${pt.roman} ${pt.ko}      `, { size: 16, color: GRAY, ls: 20 }),
  ]).flat(), { after: 260 }));

  const cw = Math.floor(W / 3), rows = [];
  for (let r = 0; r < 10; r++) {
    const cells = [];
    for (let c = 0; c < 3; c++) {
      const day = r * 3 + c + 1, d = book.days[day - 1];
      cells.push(cell([
        p([run('■ ', { size: 13, color: PART_MARK[d.part] }), run('DAY ' + pad2(day), { size: 20, color: INK, bold: true }),
           run(`   #${String(d.seq_from).padStart(4, '0')}–${String(d.seq_to).padStart(4, '0')}`, { size: 13, color: GRAY })], { after: 70 }),
        p([run('시험일 ', { size: 15, color: GRAY }), run('___ / ___', { size: 15, color: RULE }),
           run('    점수 ', { size: 15, color: GRAY }), run('_____ / 100', { size: 15, color: RULE })], { after: 55 }),
        p([run('재시험일 ', { size: 15, color: GRAY }), run('___ / ___', { size: 15, color: RULE }),
           run('   점수 ', { size: 15, color: GRAY }), run('_____ / 100', { size: 15, color: RULE })], {}),
      ], { w: cw, bottom: HAIR, top: r === 0 ? INKRULE : NONE, margins: { top: 150, bottom: 150, left: 0, right: 200 } }));
    }
    rows.push(trow(cells, 900));
  }
  kids.push(table([cw, cw, cw], rows));
  kids.push(p([run('다의어 시험 점수는 해당 시험지 상단의 점수 칸에 바로 적으세요.', { size: 15, color: GRAY })], { before: 200 }));

  return { properties: PAGE, headers: { default: HD('시험지 사용 안내') }, footers: { default: FT() }, children: kids };
}

/* ── 3. DAY 단어시험 (한 면 100문항 = 4단 × 25행) ────────── */
const QNO = 280, QWRD = 1080, QANS = 1049;              // 한 단 2409
const QCOLS = [QNO, QWRD, QANS];

function qCells(q, i) {
  const m = (right) => ({ top: 140, bottom: 140, left: 0, right });
  return [
    cell(p(run(pad2(i + 1), { size: 12, color: GRAY }), { line: 190 }), { w: QNO, margins: m(30), va: VerticalAlign.BOTTOM }),
    cell(p(run(q.word, { size: 14, color: INK, bold: true }), { line: 195 }), { w: QWRD, margins: m(50), va: VerticalAlign.BOTTOM }),
    cell(p(run('', {}), { line: 190 }), { w: QANS, bottom: FILL, margins: m(120), va: VerticalAlign.BOTTOM }),
  ];
}

function testPage(t, first) {
  const pt = book.parts[t.part], d = book.days[t.day - 1];
  const kids = testHead([
    run('■ ', { size: 13, color: PART_MARK[t.part] }),
    run(`PART ${pt.roman}  ·  ${pt.ko}`, { size: 15, color: GRAY, bold: true, ls: 40 }),
  ], 'DAY', pad2(t.day) + ' 단어시험', `#${String(d.seq_from).padStart(4, '0')} – #${String(d.seq_to).padStart(4, '0')}  ·  100문항`, '100', !first);

  const rows = [trow([0, 1, 2, 3].flatMap(() => [
    cell(p(run('', {})), { w: QNO, bottom: INKRULE, margins: { top: 0, bottom: 45, left: 0, right: 30 } }),
    cell(p(run('WORD', { size: 12, color: GRAY, bold: true, ls: 30 })), { w: QWRD, bottom: INKRULE, margins: { top: 0, bottom: 45, left: 0, right: 50 } }),
    cell(p(run('뜻', { size: 12, color: GRAY, bold: true, ls: 30 })), { w: QANS, bottom: INKRULE, margins: { top: 0, bottom: 45, left: 0, right: 120 } }),
  ]), 220)];
  const per = 25;
  for (let r = 0; r < per; r++) {
    const cells = [];
    for (let c = 0; c < 4; c++) cells.push(...qCells(t.questions[c * per + r], c * per + r));
    rows.push(trow(cells, 420));
  }
  kids.push(table([...QCOLS, ...QCOLS, ...QCOLS, ...QCOLS], rows));
  kids.push(p([run(`채점 뒤 틀린 단어는 단어장 DAY ${pad2(t.day)} 면의 □에 표시해 두고, 다음 회독에서 그것만 보세요.`, { size: 14, color: GRAY })], { before: 200 }));
  return kids;
}

function testSection() {
  const kids = [];
  book.tests.forEach((t, i) => kids.push(...testPage(t, i === 0)));
  return { properties: PAGE, headers: { default: HD('DAY 단어시험') }, footers: { default: FT() }, children: kids };
}

/* ── 4. 다의어 시험 ──────────────────────────────────────── */
const PNO = 400, PWD = 1500, PCNT = 700, PANS = W - PNO - PWD - PCNT;
function polyTestPage(pt, first) {
  const kids = testHead([
    run('■ ', { size: 13, color: YEL }),
    run('POLYSEMY TEST  ·  다의어 시험', { size: 15, color: GRAY, bold: true, ls: 40 }),
  ], '다의어 시험', pad2(pt.no), `${pt.questions.length}문항  ·  괄호 안의 개수만큼 쓰기`,
     String(pt.questions.reduce((a, q) => a + q.means.length, 0)), !first);

  const rows = [trow([
    cell(p(run('', {})), { w: PNO, bottom: INKRULE, margins: { top: 0, bottom: 50, left: 0, right: 60 } }),
    cell(p(run('WORD', { size: 12, color: GRAY, bold: true, ls: 30 })), { w: PWD, bottom: INKRULE, margins: { top: 0, bottom: 50, left: 0, right: 60 } }),
    cell(p(run('답 개수', { size: 12, color: GRAY, bold: true, ls: 30 })), { w: PCNT, bottom: INKRULE, margins: { top: 0, bottom: 50, left: 0, right: 60 } }),
    cell(p(run('뜻을 아는 대로 모두 쓰세요', { size: 12, color: GRAY, bold: true, ls: 30 })), { w: PANS, bottom: INKRULE, margins: { top: 0, bottom: 50, left: 0, right: 0 } }),
  ], 240)];
  pt.questions.forEach((q, i) => rows.push(trow([
    cell(p(run(pad2(i + 1), { size: 14, color: GRAY }), { line: 200 }), { w: PNO, margins: { top: 180, bottom: 180, left: 0, right: 60 }, va: VerticalAlign.BOTTOM }),
    cell(p(run(q.word, { size: 19, color: INK, bold: true }), { line: 210 }), { w: PWD, margins: { top: 180, bottom: 180, left: 0, right: 60 }, va: VerticalAlign.BOTTOM }),
    cell(p(run(`( ${q.means.length}개 )`, { size: 14, color: GOLD, bold: true }), { line: 200 }), { w: PCNT, margins: { top: 180, bottom: 180, left: 0, right: 60 }, va: VerticalAlign.BOTTOM }),
    cell(p(run('', {}), { line: 200 }), { w: PANS, bottom: FILL, margins: { top: 180, bottom: 180, left: 0, right: 0 }, va: VerticalAlign.BOTTOM }),
  ], 500)));
  kids.push(table([PNO, PWD, PCNT, PANS], rows));
  kids.push(p([run('뜻의 순서는 상관없습니다. 절반 이상 맞히면 그 단어는 넘어가도 좋습니다.', { size: 14, color: GRAY })], { before: 200 }));
  return kids;
}

function polyTestSection() {
  const kids = [
    gap(3600),
    p([run('■ ', { size: 16, color: YEL }), run('PART 2', { size: 20, color: GOLD, bold: true, ls: 80 })], { after: 220 }),
    p(run('POLYSEMY TEST', { size: 48, color: INK, bold: true, ls: 40 }), { after: 90, line: 560 }),
    p(run('다의어 시험', { size: 28, color: BODY, bold: true }), { after: 240 }),
    p([], { border: { bottom: INKRULE }, after: 260, line: 20 }),
    p(run('뜻 하나로는 포괄할 수 없는 단어들입니다. 단어 옆 괄호의 개수만큼 뜻을 써 넣으세요. 단어장 뒤 「부록 · 다의어 정리」를 먼저 훑고 보면 좋습니다.', { size: 20, color: BODY }), { after: 420, line: 280 }),
    statBox([
      { n: String(book.poly.length), label: '출제 단어' },
      { n: String(book.poly.reduce((a, x) => a + x.means.length, 0)), label: '전체 배점 (뜻 개수)' },
      { n: String(book.poly_tests.length) + '회', label: '시험 회차' },
    ], { big: 30 }),
  ];
  book.poly_tests.forEach((pt) => kids.push(...polyTestPage(pt, false)));
  return { properties: PAGE, headers: { default: HD('다의어 시험') }, footers: { default: FT() }, children: kids };
}

/* ── 5. 정답 ─────────────────────────────────────────────── */
function answerSection() {
  const kids = [];
  kids.push(eyebrow('ANSWER KEY', { after: 260 }));
  kids.push(p(run('정답', { size: 42, color: INK, bold: true }), { after: 110 }));
  kids.push(p(run('DAY 시험은 시험지의 문항 번호 순서입니다. 뜻이 여러 개인 단어는 그중 하나만 맞아도 정답으로 봅니다.', { size: 19, color: GRAY }), { after: 300 }));

  /* 정답 블록은 뜻 길이에 따라 높이가 달라진다. 높이를 재서 면에 채워 넣는다. */
  const CAP = 13400, FIRST_USED = 1850;      // 본문 높이(twips)와 표제부가 먹는 높이
  let used = FIRST_USED;
  const place = (h) => {                     // 이 블록을 새 면에서 시작해야 하는가
    if (used + h <= CAP) { used += h; return false; }
    used = h; return true;
  };

  /* DAY 시험 정답 — 한 DAY당 5단 × 20행 */
  const AW = Math.floor(W / 5), AROWS = 20, ACOLS = 5;
  book.tests.forEach((t, ti) => {
    const rowH = [];
    for (let r = 0; r < AROWS; r++) {
      let mx = 1;
      for (let c = 0; c < ACOLS; c++) mx = Math.max(mx, wrapLines(t.questions[c * AROWS + r].mean, 9.5));
      rowH.push(164 + (mx - 1) * 115);
    }
    const h = 400 + 200 + rowH.reduce((a, b) => a + b, 0);   // 제목 + 괘선 + 행
    const pbb = place(h + (ti ? 200 : 0));
    const pt = book.parts[t.part];
    kids.push(p([
      run('■ ', { size: 13, color: PART_MARK[t.part] }),
      run(`DAY ${pad2(t.day)} 단어시험`, { size: 20, color: INK, bold: true }),
      run(`     PART ${pt.roman} · ${pt.ko}`, { size: 15, color: GRAY, ls: 20 }),
    ], { before: (ti === 0 || pbb) ? 0 : 200, after: 40, keepNext: true, pbb }));
    kids.push(p([], { border: { bottom: INKRULE }, after: 110, line: 20, keepNext: true }));
    const rows = [];
    for (let r = 0; r < AROWS; r++) {
      const cells = [];
      for (let c = 0; c < ACOLS; c++) {
        const i = c * AROWS + r, q = t.questions[i];
        cells.push(cell(p([
          run(pad2(i + 1) + ' ', { size: 11, color: GRAY }),
          run(q.mean, { size: 13, color: BODY }),
        ], { line: 180 }), { w: AW, margins: { top: 10, bottom: 10, left: 0, right: 100 }, va: VerticalAlign.TOP }));
      }
      rows.push(trow(cells, 150));
    }
    kids.push(table([AW, AW, AW, AW, AW], rows));
  });

  /* 다의어 시험 정답 */
  book.poly_tests.forEach((pt, i) => {
    const h = 400 + 200 + pt.questions.length * 230;
    const pbb = place(h + 240);
    kids.push(p([
      run('■ ', { size: 13, color: YEL }),
      run(`다의어 시험 ${pad2(pt.no)}`, { size: 20, color: INK, bold: true }),
      run(`     ${pt.questions.length}문항`, { size: 15, color: GRAY, ls: 20 }),
    ], { before: pbb ? 0 : 240, after: 40, keepNext: true, pbb }));
    kids.push(p([], { border: { bottom: INKRULE }, after: 110, line: 20, keepNext: true }));
    kids.push(table([500, 1400, W - 1900], pt.questions.map((q, j) => trow([
      cell(p(run(pad2(j + 1), { size: 13, color: GRAY }), { line: 190 }), { w: 500, bottom: j === pt.questions.length - 1 ? NONE : HAIR, margins: { top: 45, bottom: 45, left: 0, right: 60 } }),
      cell(p(run(q.word, { size: 17, color: INK, bold: true }), { line: 190 }), { w: 1400, bottom: j === pt.questions.length - 1 ? NONE : HAIR, margins: { top: 45, bottom: 45, left: 0, right: 60 } }),
      cell(p(q.means.flatMap((m, k) => [
        run('①②③④⑤⑥'[k] + ' ', { size: 14, color: k === 0 ? GOLD : BLUE, bold: true }),
        run(m + (k === q.means.length - 1 ? '' : '   '), { size: 15, color: BODY }),
      ]), { line: 190 }), { w: W - 1900, bottom: j === pt.questions.length - 1 ? NONE : HAIR, margins: { top: 45, bottom: 45, left: 0, right: 0 } }),
    ], 190))));
  });

  return { properties: PAGE, headers: { default: HD('정답') }, footers: { default: FT() }, children: kids };
}

/* ── 문서 조립 ───────────────────────────────────────────── */
const doc = new Document({
  creator: '옳은영어 ORUN ENGLISH',
  title: '옳은 VOCA 3000 단어시험지 · 정시반',
  description: 'DAY별 100문항 30회 + 다의어 시험 + 정답. 영어를 보고 우리말 뜻을 쓰는 형식.',
  styles: { default: { document: { run: { font: C.F, size: 20, color: BODY } } } },
  sections: [cover(), guide(), testSection(), polyTestSection(), answerSection()],
});

Packer.toBuffer(doc).then((buf) => {
  const out = process.argv[2] || __dirname + '/../옳은영어_정시반_VOCA_3000_단어시험지.docx';
  fs.writeFileSync(out, buf);
  console.log('시험지 ->', out, (buf.length / 1024 / 1024).toFixed(2) + ' MB');
});
