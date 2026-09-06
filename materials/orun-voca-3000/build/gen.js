/* 옳은영어 정시반 VOCA 3000 — A4 단어장(.docx) 생성기
 * 원본 3,000단어를 난이도 3단계(초·중 → 중·고 → 전문)로 재배치해 한 면 100단어 × 30 DAY로 싣는다.
 * 시험은 이 파일에 넣지 않는다 — gen_test.js가 시험지를 따로 만든다.
 *
 *   node gen.js ["출력.docx"] */
const fs = require('fs');
const C = require('./common');
const {
  docx: { Document, Packer, Paragraph, TextRun, ImageRun, VerticalAlign, AlignmentType, TabStopType, HeightRule },
  LOGO, W, PAGE, PART_MARK,
  INK, BODY, GRAY, PAPER, BLUE, YEL, GOLD, DIM, RULE, SOFT,
  NONE, bd, HAIR, INKRULE,
  run, p, gap, cell, table, trow,
  dot, eyebrow, h1, body, infoRows, infoTable, callout, statBox,
  header, footer, wrapLines, fitPad, comma, pad2,
} = C;

const book = JSON.parse(fs.readFileSync(__dirname + '/book.json', 'utf8'));
const PER_DAY = book.days[0].entries.length;          // 100
const HALF = PER_DAY / 2;                             // 한 단 50행

/* ── 1. 표지 ─────────────────────────────────────────────── */
function cover() {
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
      table([W], [trow(book.parts.map((pt, i) => cell([
        p(run(comma(pt.count), { size: 34, color: YEL, bold: true, ls: 20 }), { after: 50 }),
        p(run(pt.ko, { size: 17, color: DIM, ls: 20 }), { after: 30 }),
        p(run(`DAY ${pad2(pt.day_from)}–${pad2(pt.day_to)}`, { size: 14, color: SOFT, ls: 20 }), {}),
      ], { w: Math.floor(W/3), fill: INK, left: i ? bd(BODY, 0.5) : NONE,
           margins: { top: 230, bottom: 230, left: i ? 240 : 560, right: 160 } })))]),

      gap(2100),
      p([run('■ ', { size: 14, color: YEL }), run('30 DAYS   ·   3 LEVELS   ·   3,000 WORDS', { size: 17, color: INK, bold: true, ls: 80 })], { after: 220 }),
      infoRows([
        ['수록 어휘', '3,000단어 · 초·중 800 / 중·고 1,800 / 전문 400'],
        ['학습 구성', '하루 100단어 × 30 DAY (한 면에 하루 분량)'],
        ['대상', '옳은영어 정시반 (고1–고3 수능·모의고사 대비)'],
        ['부가 구성', '학습 플래너 · 다의어 정리 · 알파벳 INDEX'],
        ['시험지', '별책 「단어시험지」 — DAY별 100문항 30회 + 다의어 시험'],
      ], 1450),
      gap(1400),
      p([], { border: { bottom: HAIR }, after: 130, line: 20 }),
      p([run('옳은영어  ', { size: 17, color: INK, bold: true }), run('ORUN ENGLISH', { size: 15, color: INK, bold: true, ls: 40 }),
         run('      [주소]  ·  [전화번호]  ·  카카오채널 [채널명]', { size: 14, color: GRAY })], {}),
    ],
  };
}

/* ── 2. 앞 구성 (활용법 · 플래너) ────────────────────────── */
function frontMatter() {
  const kids = [];
  kids.push(eyebrow('HOW TO USE THIS BOOK', { after: 260 }));
  kids.push(p(run('이 책의 구성과 활용법', { size: 42, color: INK, bold: true }), { after: 110 }));
  kids.push(p(run('원본 어휘 목록을 알파벳 순서가 아니라 난이도 순서로 다시 배열한 정시반 전용 단어장입니다.', { size: 19, color: GRAY }), { after: 300 }));
  kids.push(infoTable([
    ['총 수록 어휘', '3,000단어'],
    ['난이도 단계', '3단계 (초·중 → 중·고 → 전문)'],
    ['하루 분량', '100단어 · 총 30 DAY'],
    ['권장 학습 기간', '1회독 30일 / 3회독 약 2개월'],
  ], { kw: 1450 }));

  kids.push(h1('01', '난이도 3단계로 재배열했습니다'));
  kids.push(body('원본 목록은 a, abandon, able … 처럼 알파벳 순서였습니다. 이 책은 같은 3,000단어를 난이도 등급에 따라 세 파트로 나누고, 각 파트 안에서만 알파벳 순으로 정렬했습니다. 쉬운 단어부터 순서대로 쌓아 올리기 때문에 앞 DAY를 건너뛰지 않으면 모르는 단어가 갑자기 튀어나오지 않습니다.'));
  kids.push(table([560, 1360, 1780, 2000, 1500, 1200, 1238], [
    trow([
      cell(p(run('', {})), { w: 560, bottom: INKRULE }),
      ...[['PART', 1360], ['LEVEL', 1780], ['난이도 단계', 2000], ['수록 어휘', 1500], ['학습 범위', 1200], ['원본 등급', 1238]]
        .map(([t, w]) => cell(p(run(t, { size: 17, color: GRAY, bold: true, ls: 20 })), { w, bottom: INKRULE })),
    ], 320),
    ...book.parts.map((pt, i) => trow([
      cell(p(run('■', { size: 15, color: PART_MARK[i] })), { w: 560, bottom: HAIR }),
      cell(p(run('PART ' + pt.roman, { size: 19, color: INK, bold: true })), { w: 1360, bottom: HAIR }),
      cell(p(run(pt.en, { size: 16, color: GRAY, bold: true, ls: 30 })), { w: 1780, bottom: HAIR }),
      cell(p(run(pt.ko, { size: 19, color: BODY })), { w: 2000, bottom: HAIR }),
      cell(p(run(comma(pt.count) + '단어', { size: 19, color: BODY })), { w: 1500, bottom: HAIR }),
      cell(p(run(`DAY ${pad2(pt.day_from)}–${pad2(pt.day_to)}`, { size: 19, color: BODY })), { w: 1200, bottom: HAIR }),
      cell(p(run(pt.key, { size: 19, color: BODY })), { w: 1238, bottom: HAIR }),
    ], 340)),
  ]));

  kids.push(h1('02', 'DAY 한 면에 100단어'));
  kids.push(body('한 DAY는 정확히 100단어이며 A4 한 면에 두 단으로 배치했습니다. 하루치가 한 면에 다 들어가므로 그 면만 접거나 뜯어서 들고 다닐 수 있습니다. 각 단어 앞의 □는 “아직 모르는 단어” 표시용입니다. 오른쪽 뜻을 손이나 책갈피로 가리고 영어만 보며 뜻을 말해 보는 방식이 가장 빠릅니다.'));
  kids.push(callout('DAY 페이지 읽는 법', [
    '□  체크 칸 — 뜻이 바로 안 나온 단어에 표시하고, 다음 회독에서 표시된 것만 봅니다.',
    '01  번호 — 그 DAY 안에서의 순번입니다. 시험지의 정답 번호가 이 번호와 같습니다.',
    '오른쪽 위 #0001–0100 — 책 전체 통번호입니다.',
    '= 표기 — 철자가 다른 이형태(영국식 등)입니다. 함께 알아 두면 좋습니다.',
  ]));

  kids.push(h1('03', '시험지는 따로 있습니다'));
  kids.push(body('별책 「단어시험지」에 DAY마다 100문항짜리 시험지가 한 장씩, 모두 30회분 들어 있습니다. 영어 단어를 보고 우리말 뜻을 쓰는 형식이며, 외운 순서대로 답이 나오지 않도록 문항 순서를 섞어 두었습니다. 뒤쪽에 정답도 함께 있습니다.'));

  kids.push(h1('04', '다의어는 따로 정리했습니다'));
  kids.push(body(`이 책의 뜻풀이는 단어마다 대표 뜻 하나를 싣습니다. 그런데 run은 “달리다”만 알면 지문에서 막힙니다 — 운영하다, 흐르다, 작동하다가 모두 run입니다. 이렇게 뜻 하나로 포괄할 수 없는 단어 ${book.poly.length}개를 책 뒤 「다의어 정리」에 뜻을 모두 붙여 모아 두었고, 시험지에도 다의어 시험 ${book.poly_tests.length}회분이 따로 있습니다. 다의어는 1회독을 마친 뒤 따로 한 번 몰아서 훑는 것이 효율적입니다.`));
  kids.push(callout('권장 회독 계획', [
    '1회독 (30일) — 하루 1 DAY. 뜻을 눈으로 익히는 단계입니다. 모르는 단어에 □ 체크.',
    '2회독 (15일) — 하루 2 DAY. 체크한 단어 위주로 보고, 여전히 모르면 두 번째 □ 체크.',
    '3회독 (10일) — 하루 3 DAY. 체크가 두 개인 단어만 봅니다. 여기서 남는 것이 진짜 약점입니다.',
    'PART II(중·고 핵심 1,800단어)는 정시 독해의 뼈대입니다. 시간이 부족하면 PART II부터 완성하세요.',
  ], 'blue'));

  /* 학습 플래너 */
  kids.push(new Paragraph({ children: [dot(), run('STUDY PLANNER', { size: 16, color: GRAY, ls: 40, bold: true })],
    pageBreakBefore: true, keepNext: true, spacing: { before: 0, after: 260, line: 260 } }));
  kids.push(p(run('학습 플래너', { size: 42, color: INK, bold: true }), { after: 110 }));
  kids.push(p(run('DAY를 마칠 때마다 날짜를 적고, 회독 칸과 시험 점수를 기록하세요. ■ 색은 파트를 뜻합니다.', { size: 19, color: GRAY }), { after: 160 }));
  kids.push(p(book.parts.map((pt, i) => [
    run('■ ', { size: 14, color: PART_MARK[i] }),
    run(`PART ${pt.roman} ${pt.ko}      `, { size: 16, color: GRAY, ls: 20 }),
  ]).flat(), { after: 260 }));

  const cw = Math.floor(W / 3), planner = [];
  for (let r = 0; r < 10; r++) {
    const cells = [];
    for (let c = 0; c < 3; c++) {
      const day = r * 3 + c + 1, d = book.days[day - 1];
      cells.push(cell([
        p([run('■ ', { size: 13, color: PART_MARK[d.part] }), run('DAY ' + pad2(day), { size: 20, color: INK, bold: true }),
           run(`   #${String(d.seq_from).padStart(4,'0')}–${String(d.seq_to).padStart(4,'0')}`, { size: 13, color: GRAY })], { after: 70 }),
        p([run('학습일 ', { size: 15, color: GRAY }), run('___ / ___', { size: 15, color: RULE }),
           run('    회독 ', { size: 15, color: GRAY }), run('□ □ □', { size: 15, color: RULE })], { after: 55 }),
        p([run('시험 ', { size: 15, color: GRAY }), run('_____ / 100', { size: 15, color: RULE }),
           run('    재시험 ', { size: 15, color: GRAY }), run('_____', { size: 15, color: RULE })], {}),
      ], { w: cw, bottom: HAIR, top: r === 0 ? INKRULE : NONE, margins: { top: 150, bottom: 150, left: 0, right: 200 } }));
    }
    planner.push(trow(cells, 900));
  }
  kids.push(table([cw, cw, cw], planner));
  kids.push(p([run('회독 □ □ □ 는 1·2·3회독 완료 표시입니다. 시험 점수는 별책 「단어시험지」 DAY 시험 결과를 적습니다.', { size: 15, color: GRAY })], { before: 200 }));

  return { properties: PAGE, headers: { default: header('이 책의 사용법') }, footers: { default: footer() }, children: kids };
}

/* ── 3. 파트 도비라 ──────────────────────────────────────── */
function partDivider(pt, i) {
  return [
    gap(3600),
    p([run('■ ', { size: 16, color: PART_MARK[i] }), run('PART ' + pt.roman, { size: 20, color: GOLD, bold: true, ls: 80 })], { after: 220 }),
    p(run(pt.en, { size: 56, color: INK, bold: true, ls: 40 }), { after: 90, line: 620 }),
    p(run(pt.ko, { size: 28, color: BODY, bold: true }), { after: 240 }),
    p([], { border: { bottom: INKRULE }, after: 260, line: 20 }),
    p(run(pt.desc, { size: 20, color: BODY }), { after: 420, line: 280 }),
    statBox([
      { n: comma(pt.count), label: '수록 어휘' },
      { n: `DAY ${pad2(pt.day_from)}–${pad2(pt.day_to)}`, label: `${pt.days}일 구성` },
      { n: `#${String(pt.seq_from).padStart(4,'0')}–${String(pt.seq_to).padStart(4,'0')}`, label: '전체 통번호' },
    ], { big: 30 }),
    gap(300),
    p(run(`원본 난이도 등급 「${pt.key}」에 해당하는 어휘입니다. 파트 안에서는 알파벳 순으로 정렬했습니다.`, { size: 16, color: GRAY }), {}),
  ];
}

/* ── 4. DAY 페이지 (한 면 100단어 = 2단 × 50행) ──────────── */
const CHK = 230, NUM = 330, WRD = 1500, MEA = 2759;   // 한 단 4819
const DAYCOLS = [CHK, NUM, WRD, MEA, CHK, NUM, WRD, MEA];

function dayPad(d) {
  const h = (e) => wrapLines(e.mean, 17) + (e.var ? 1 : 0);
  let extra = 0;
  for (let i = 0; i < HALF; i++) extra += Math.max(h(d.entries[i]), h(d.entries[i + HALF])) - 1;
  return fitPad(10, HALF, extra, 3390, 600, 30);
}

function entryCells(e, last, vpad) {
  const b = last ? NONE : HAIR;
  const m = (right) => ({ top: vpad, bottom: vpad, left: 0, right });
  const wordKids = [p(run(e.word, { size: 15, color: INK, bold: true }), { after: 0, line: 160 })];
  if (e.var) wordKids.push(p(run('= ' + e.var, { size: 10, color: GRAY }), { line: 140 }));
  return [
    cell(p(run('□', { size: 12, color: RULE }), { line: 160 }), { w: CHK, bottom: b, margins: m(30) }),
    cell(p(run(pad2(e.n), { size: 11, color: GRAY }), { line: 160 }), { w: NUM, bottom: b, margins: m(70) }),
    cell(wordKids, { w: WRD, bottom: b, margins: m(90) }),
    cell(p(run(e.mean, { size: 14, color: BODY }), { line: 160 }), { w: MEA, bottom: b, margins: m(110) }),
  ];
}

function dayPage(d, isFirstOfPart) {
  const pt = book.parts[d.part], kids = [];
  kids.push(p([
    run('■ ', { size: 13, color: PART_MARK[d.part] }),
    run(`PART ${pt.roman}  ·  ${pt.ko}`, { size: 15, color: GRAY, bold: true, ls: 40 }),
    run('\t#' + String(d.seq_from).padStart(4,'0') + ' – #' + String(d.seq_to).padStart(4,'0'), { size: 15, color: GRAY, ls: 20 }),
  ], { after: 40, pbb: !isFirstOfPart, keepNext: true, tabs: [{ type: TabStopType.RIGHT, position: W }] }));

  kids.push(table([3400, W-3400], [trow([
    cell([p([run('DAY ', { size: 20, color: GRAY, bold: true, ls: 60 }), run(pad2(d.day), { size: 34, color: INK, bold: true })], { line: 380 })],
      { w: 3400, va: VerticalAlign.BOTTOM, margins: { top: 0, bottom: 30, left: 0, right: 0 } }),
    cell([p([
      run('학습일 ', { size: 15, color: GRAY }), run('_____ / _____', { size: 15, color: RULE }),
      run('        1회독 ', { size: 15, color: GRAY }), run('□', { size: 15, color: RULE }),
      run('   2회독 ', { size: 15, color: GRAY }), run('□', { size: 15, color: RULE }),
      run('   3회독 ', { size: 15, color: GRAY }), run('□', { size: 15, color: RULE }),
    ], { align: AlignmentType.RIGHT })], { w: W-3400, va: VerticalAlign.BOTTOM, margins: { top: 0, bottom: 70, left: 0, right: 0 } }),
  ])]));
  kids.push(p([], { border: { bottom: INKRULE }, after: 90, line: 20, keepNext: true }));

  const hd = (t, w) => cell(p(run(t, { size: 13, color: GRAY, bold: true, ls: 30 })), { w, bottom: INKRULE, margins: { top: 10, bottom: 40, left: 0, right: 80 } });
  const headRow = () => [hd('', CHK), hd('', NUM), hd('WORD 표제어', WRD), hd('MEANING 뜻', MEA)];
  const rows = [trow([...headRow(), ...headRow()], 240)];
  const vpad = dayPad(d);
  for (let i = 0; i < HALF; i++) {
    const last = i === HALF - 1;
    rows.push(trow([...entryCells(d.entries[i], last, vpad), ...entryCells(d.entries[i + HALF], last, vpad)], 150));
  }
  kids.push(table(DAYCOLS, rows));
  return kids;
}

function partSection(pt, i) {
  const kids = [...partDivider(pt, i)];
  book.days.filter((d) => d.part === i).forEach((d) => kids.push(...dayPage(d, false)));
  return { properties: PAGE, headers: { default: header(`PART ${pt.roman} · ${pt.ko}`) }, footers: { default: footer() }, children: kids };
}

/* ── 5. 부록 · 다의어 정리 ───────────────────────────────── */
const PW = 1500, PM = W - PW;
function polySection() {
  const kids = [];
  kids.push(gap(3600));
  kids.push(p([run('■ ', { size: 16, color: YEL }), run('APPENDIX', { size: 20, color: GOLD, bold: true, ls: 80 })], { after: 220 }));
  kids.push(p(run('POLYSEMY', { size: 56, color: INK, bold: true, ls: 40 }), { after: 90, line: 620 }));
  kids.push(p(run('다의어 정리', { size: 28, color: BODY, bold: true }), { after: 240 }));
  kids.push(p([], { border: { bottom: INKRULE }, after: 260, line: 20 }));
  kids.push(p(run('뜻 하나로는 포괄할 수 없는 단어들입니다. run을 “달리다”로만 외우면 The company is run by … 에서 막힙니다. 본문 DAY 면에는 대표 뜻만 실려 있으니, 아래 단어들은 여기서 뜻을 모두 챙겨 두세요.', { size: 20, color: BODY }), { after: 420, line: 280 }));
  kids.push(statBox([
    { n: String(book.poly.length), label: '다의어 단어 수' },
    { n: String(book.poly.reduce((a, x) => a + x.means.length, 0)), label: '실린 뜻의 개수' },
    { n: String(book.poly_tests.length) + '회', label: '다의어 시험 (별책)' },
  ], { big: 30 }));
  kids.push(gap(300));
  kids.push(p(run('DAY 번호는 그 단어가 본문 몇 번째 DAY에 실려 있는지를 가리킵니다.', { size: 16, color: GRAY }), {}));

  const PER = Math.ceil(book.poly.length / Math.ceil(book.poly.length / 40));
  for (let s = 0; s < book.poly.length; s += PER) {
    const chunk = book.poly.slice(s, s + PER);
    kids.push(p([
      run('■ ', { size: 13, color: YEL }),
      run(`다의어 정리  ${chunk[0].word} – ${chunk[chunk.length-1].word}`, { size: 15, color: GRAY, bold: true, ls: 40 }),
      run('\t' + (s + 1) + ' – ' + (s + chunk.length) + ' / ' + book.poly.length, { size: 15, color: GRAY, ls: 20 }),
    ], { after: 70, pbb: true, keepNext: true, tabs: [{ type: TabStopType.RIGHT, position: W }] }));
    kids.push(p([run('한 단어의 여러 뜻', { size: 30, color: INK, bold: true })], { after: 90, keepNext: true }));
    kids.push(p([], { border: { bottom: INKRULE }, after: 110, line: 20, keepNext: true }));

    const rows = chunk.map((it, i) => trow([
      cell(p([
        run(it.word, { size: 18, color: INK, bold: true }),
        run('   DAY ' + pad2(it.day), { size: 11, color: GRAY }),
      ], { line: 190 }), { w: PW, bottom: i === chunk.length - 1 ? NONE : HAIR, va: VerticalAlign.CENTER,
           margins: { top: 80, bottom: 80, left: 0, right: 110 } }),
      cell(p(it.means.flatMap((m, j) => [
        run('①②③④⑤⑥'[j] + ' ', { size: 15, color: j === 0 ? GOLD : BLUE, bold: true }),
        run(m + (j === it.means.length - 1 ? '' : '   '), { size: 16, color: BODY }),
      ]), { line: 190 }), { w: PM, bottom: i === chunk.length - 1 ? NONE : HAIR, va: VerticalAlign.CENTER,
           margins: { top: 80, bottom: 80, left: 0, right: 60 } }),
    ], 240));
    kids.push(table([PW, PM], rows));
  }
  return { properties: PAGE, headers: { default: header('부록 · 다의어 정리') }, footers: { default: footer() }, children: kids };
}

/* ── 6. INDEX ────────────────────────────────────────────── */
function indexSection() {
  const kids = [];
  kids.push(eyebrow('INDEX · 3,000 WORDS', { after: 260 }));
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
      run('\t' + comma(start + 1) + ' – ' + comma(start + page.length) + ' / 3,000', { size: 15, color: GRAY, ls: 20 }),
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
        cells.push(cell(p(run(it ? pad2(it.day) : '', { size: 13, color: GRAY }), { align: AlignmentType.RIGHT, line: 190 }), { w: ID, bottom: HAIR, margins: { top: 30, bottom: 30, left: 0, right: 150 } }));
      }
      rows.push(trow(cells, 215));
    }
    kids.push(table(Array.from({ length: COLS }, () => [IW, ID]).flat(), rows));
  }
  return { properties: PAGE, headers: { default: header('알파벳 색인') }, footers: { default: footer() }, children: kids };
}

/* ── 문서 조립 ───────────────────────────────────────────── */
const doc = new Document({
  creator: '옳은영어 ORUN ENGLISH',
  title: '옳은 VOCA 3000 · 정시반 필수 영단어',
  description: '원본 3,000단어를 초·중 / 중·고 / 전문 3단계 난이도순으로 재배열한 정시반 어휘 기본서 (하루 100단어 × 30 DAY)',
  styles: { default: { document: { run: { font: C.F, size: 20, color: BODY } } } },
  sections: [cover(), frontMatter(), ...book.parts.map(partSection), polySection(), indexSection()],
});

Packer.toBuffer(doc).then((buf) => {
  const out = process.argv[2] || __dirname + '/../옳은영어_정시반_VOCA_3000.docx';
  fs.writeFileSync(out, buf);
  console.log('단어장 ->', out, (buf.length / 1024 / 1024).toFixed(2) + ' MB');
});
