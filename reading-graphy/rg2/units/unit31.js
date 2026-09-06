/* UNIT 31 — 우리 모두에게 특별한 그날 (Level 2)
   생일 축하의 짧은 역사. 풀 유닛(10면). unit01.js 정본 템플릿에서 [DATA] 블록만 교체. */
const L = require("../scripts/lib");
const { fs, path, WORK, ASSETS,
  Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  AlignmentType, VerticalAlign, BorderStyle, WidthType, ShadingType, TabStopType, LineRuleType,
  F, FD, FO, INK, SUB, FAINT, CHAR, NAVY, NAVY2, GOLD, YEL, AMB, TEAL, NAVYD, NAVYL,
  PAPER, COOL, GREY, FIELD, FLINE, HAIR, CLINE, WISP, W, GUT, BODY, NOB, noB,
  bd, t, p, cel, T, chipCellG, chipPairG, sp, brk, tab, thead, ask, ch, box, fieldRow, field, writeField, tagline, R, RM,
} = L;

module.exports = {
  no: "31",
  title: "우리 모두에게 특별한 그날",
  level: "2",
  foot: "UNIT 31  우리 모두에게 특별한 그날",
  banner: ["31", "우리 모두에게 특별한 그날", "2"],
  timeline: ["1893|인사 노래 탄생|힐 자매가 만든\\n'Good Morning to All'|sun",
             "20세기 초|생일 노래로 변신|멜로디에 생일 가사를\\n붙여 부르기 시작|sparkle_drop",
             "2016|모두의 노래|저작권이 풀려 누구나\\n자유롭게 부른다|leaf"],

  render(ctx) {
    const { K, spF, FT } = ctx;
/* ═══════════ [DATA] 지문 13문장 ═══════════ */
const SENT = [
  "We all know the “Happy Birthday” song and sing it at birthday parties.",
  "Birthday celebrations feel like a very old tradition.",
  "But people only started this tradition around 100 years ago!",
  "Then how did people celebrate birthdays in the past?",
  "Before the 19th century, in the U.S., birthday celebrations were only for rich people or national heroes.",
  "For example, most people would celebrate George Washington’s birthday, not their own.",
  "But around the mid-19th century, things changed.",
  "Families began to have fewer kids, so each kid was able to get more attention.",
  "This led to more birthday parties.",
  "On kids’ birthdays, families started to put a big candle in the middle of the cake.",
  "By the end of the 19th century, giving birthday cards also became common.",
  "Even though birthday parties have a short history, they’re now a big part of our lives.",
  "They can show how much we love our friends and family.",
];
const num = (i) => t(String(i), { size: 13, bold: true, color: GOLD, sup: true });
function passageRuns(mark) {
  const out = [];
  SENT.forEach((s, i) => {
    out.push(num(i + 1), t(" ", { size: 19 }));
    const m = mark && mark[i + 1];
    if (m) m.forEach(r => out.push(r)); else out.push(t(s + "  ", { size: 19 }));
  });
  return out;
}
/* 지문 축약 재수록 (훈련·해설용) */
function reprint(mark) {
  return T([W], [new TableRow({ children: [
    cel(p(passageRuns(mark).map(r => r), { line: 244, after: 0, align: AlignmentType.JUSTIFIED }),
      { w: W, shade: COOL, m: { top: 105, bottom: 105, left: 230, right: 230 },
        b: { top: NOB, bottom: NOB, right: NOB, left: bd(10, NAVY) } }),
  ] })]);
}
/* ═══════════ [DATA] 2-2 흐름 구간 : [A]1–4 [B]5–6 [C]7–9 [D]10–11 [E]12–13 ═══════════ */
const SEGCOL = { A: TEAL, B: NAVY, C: AMB, D: NAVY, E: CHAR };
const SEGOF = { 1: "A", 5: "B", 7: "C", 10: "D", 12: "E" };
function segPassage() {
  const out = [];
  SENT.forEach((x, i) => {
    const n = i + 1;
    if (SEGOF[n]) {
      if (n !== 1) out.push(t("  ", { size: 17 }));
      out.push(t("[" + SEGOF[n] + "]", { size: 15, bold: true, color: SEGCOL[SEGOF[n]] }), t(" ", { size: 17 }));
    }
    out.push(t(String(n), { size: 12, bold: true, color: GOLD, sup: true }), t(" ", { size: 17 }));
    out.push(t(x + "  ", { size: 17, color: SUB }));
  });
  return out;
}
/* ═══════════ [DATA] 1-3 지시어 표시용 마크 ═══════════ */
const R = (x) => t(x, { size: 17, color: SUB });
const RM = (x) => t(x, { size: 17, bold: true, color: NAVY, underline: {} });
const DEIXIS = {
  1: [R("We all know the “Happy Birthday” song and sing "), RM("it"), R(" at birthday parties.  ")],
  3: [R("But people only started "), RM("this tradition"), R(" around 100 years ago!  ")],
  9: [RM("This"), R(" led to more birthday parties.  ")],
  12: [R("Even though birthday parties have a short history, "), RM("they"), R("’re now a big part of our lives.  ")],
};

/* ═══════════ 1면 [DATA] 유닛 헤더 · 지문 · 독해 4문항 ═══════════ */
K.push(new Paragraph({
  children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "banner_u31.png")), transformation: { width: 668, height: 72 } })],
  alignment: AlignmentType.CENTER, spacing: { after: 0 },
}));
K.push(sp(150));
K.push(...tab("독해", "다음 글을 읽고, 물음에 답하시오.", NAVY, "≡"));
K.push(spF(1, 120, 0.10));
K.push(box([p(passageRuns({
  3: [t("But people only started ", { size: 19 }), t("(A) ", { size: 19, bold: true }), t("this tradition", { size: 19, bold: true, underline: {} }),
      t(" around 100 years ago!  ", { size: 19 })],
}), { line: 300, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(sp(190));

K.push(ask("01", "제목", "윗글의 제목으로 가장 적절한 것은?"));
K.push(sp(65));
["① The Short History of Birthday Parties", "② The Story of the “Happy Birthday” Song",
 "③ Why Families Began to Have Fewer Kids", "④ How to Make a Special Birthday Cake",
 "⑤ The Best Birthday Gifts for Your Family"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("02", "불일치", "윗글의 내용과 일치하지 않는 것은?"));
K.push(sp(65));
["① People started the birthday tradition around 100 years ago.",
 "② Long ago, birthday celebrations were only for rich people or national heroes.",
 "③ In the past, most people celebrated their own birthdays.",
 "④ Families started to put a big candle in the middle of the cake.",
 "⑤ By the end of the 19th century, giving birthday cards became common."].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("03", "지칭", "밑줄 친 (A) this tradition이 가리키는 것으로 가장 적절한 것은?"));
K.push(sp(65));
["① celebrating birthdays",
 "② writing birthday songs",
 "③ giving birthday cards",
 "④ putting a candle on the cake",
 "⑤ becoming a national hero"].forEach(c => K.push(ch(c)));
K.push(spF(1, 140, 0.13));
K.push(ask("04", "배열 영작", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(75));
K.push(p([t("생일 축하는 아주 오래된 전통처럼 느껴진다.", { size: 19, bold: true })], { indent: { left: 250 }, after: 50 }));
K.push(p([t("조건 ", { size: 16, bold: true, color: NAVY2 }), t("단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 8단어)", { size: 16, color: SUB })], { indent: { left: 250 }, after: 70 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("feel / birthday / like / old / celebrations / a / tradition / very", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 95, bottom: 95, left: 180, right: 180 } })] })]));


/* ═══════════ 2면 [DATA] 핵심구문 · 구문분석 ═══════════ */
K.push(brk());
K.push(...tab("핵심구문", "핵심 구문 2가지 + 훈련 3문장", AMB, "[ ]"));
K.push(sp(140));
/* 구문 2단 카드 */
function synCard(n, ti, ex, ds, wid) {
  return cel([
    new Paragraph({ children: [t(n + "  ", { size: 14, bold: true, color: "FFFFFF" }), t("  " + ti, { size: 17, bold: true })],
      spacing: { after: 55, line: 235 }, shading: undefined }),
    new Paragraph({ children: ex, spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t(ds, { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: wid, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 90, bottom: 90, left: 170, right: 130 } });
}
/* 배지 스타일: 라벨을 앰버 배경 런으로 */
function synBadge(n) { return t(" " + n + " ", { size: 13, bold: true, color: "FFFFFF", border: { style: BorderStyle.SINGLE, size: 1, color: AMB, space: 2 } }); }
K.push(T([4790, 220, 4790], [new TableRow({ children: [
  cel([
    new Paragraph({ children: [t("문장 8", { size: 14, bold: true, color: AMB }), t("   be able to+동사원형 ‘~할 수 있었다’", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("each kid ", { size: 18 }), t("was able to get", { size: 18, bold: true, color: NAVY, underline: {} }), t(" more attention", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("be able to 뒤에 동사원형이 와서 ‘~할 수 있다’를 나타냅니다. ‘더 많은 관심을 받을 수 있었다’", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
  cel(new Paragraph({ children: [t("", { size: 2 })], spacing: { after: 0 } }), { w: 220, b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
  cel([
    new Paragraph({ children: [t("문장 11", { size: 14, bold: true, color: AMB }), t("   동명사 주어 ‘~하는 것은’", { size: 17, bold: true })], spacing: { after: 45, line: 228 } }),
    new Paragraph({ children: [t("Giving birthday cards", { size: 18, bold: true, color: NAVY, underline: {} }), t(" also became common", { size: 18 })], spacing: { after: 38, line: 238 } }),
    new Paragraph({ children: [t("동사+ing가 주어 자리에 오면 ‘~하는 것은’이라는 뜻입니다. ‘생일 카드를 주는 것은’", { size: 15, color: SUB })], spacing: { after: 0, line: 225 } }),
  ], { w: 4790, shade: PAPER, b: { top: NOB, bottom: NOB, right: NOB, left: bd(14, AMB) }, m: { top: 74, bottom: 74, left: 170, right: 120 } }),
] })]));
K.push(spF(2, 105, 0.10));
/* 구문 훈련 3문장 */
K.push(p([t("구문 훈련", { size: 17, bold: true, color: AMB }),
  t("   새로운 문장으로 위에서 배운 구문을 해석해 보세요.", { size: 15, color: SUB })], { after: 70, line: 235 }));
[["문장 8 구문", [t("I ", { size: 19 }), t("was able to finish", { size: 19, bold: true, color: NAVY, underline: {} }), t(" my homework.", { size: 19 })]],
 ["문장 11 구문", [t("Reading comic books", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is fun.", { size: 19 })]],
 ["둘 다!", [t("Learning English", { size: 19, bold: true, color: NAVY, underline: {} }), t(" is fun, and I ", { size: 19 }), t("was able to make", { size: 19, bold: true, color: NAVY, underline: {} }), t(" new friends.", { size: 19 })]],
].forEach(([tag, runs], i) => {
  K.push(p([t("(" + (i + 1) + ") ", { size: 17, bold: true, color: AMB }), t("[" + tag + "]  ", { size: 14, bold: true, color: FAINT }), ...runs], { after: 45, line: 250 }));
  K.push(writeField(1, 320));
  K.push(spF(2, 52, 0.05));
});

K.push(sp(30));
K.push(...tab("구문분석", "", CHAR, "V"));
K.push(sp(120));

/* RUNE FLOW 바 */
K.push(T([W], [new TableRow({ children: [cel(
  p([t("ORUN FLOW   ", { f: FD, size: 13, color: YEL, ls: 14 }),
     t("1 주어 밑줄+S  \u2192  2 본동사 \u25b3+V  \u2192  3 접속사 [네모]  \u2192  4 종속절 S\u2032\u00b7V\u2032  \u2192  5 수식어(구) 밑줄+M", { size: 15, bold: true, color: "FFFFFF" })],
    { after: 0, align: AlignmentType.CENTER, line: 240 }),
  { w: W, shade: NAVY, b: { top: NOB, bottom: bd(6, YEL), left: NOB, right: NOB }, m: { top: 46, bottom: 46, left: 120, right: 120 } })] })]));
K.push(sp(60));
/* 분석 Tip — 한 덩어리 동사 원칙 */
K.push(T([W], [new TableRow({ children: [cel(
  p([t("분석 Tip   ", { size: 14, bold: true, color: GOLD }),
     t("조동사+동사", { size: 15, bold: true, color: NAVY }),
     t(" · ", { size: 15, color: FAINT }),
     t("have(has, had)+p.p", { size: 15, bold: true, color: NAVY }),
     t(" · ", { size: 15, color: FAINT }),
     t("be+p.p", { size: 15, bold: true, color: NAVY }), t("(수동태)", { size: 14, color: SUB }),
     t(" · ", { size: 15, color: FAINT }),
     t("be+~ing", { size: 15, bold: true, color: NAVY }), t("(진행형)", { size: 14, color: SUB }),
     t("  \u2192  한 덩어리의 동사로 표시! \u25b3", { size: 15, bold: true })],
    { after: 0, align: AlignmentType.CENTER, line: 235 }),
  { w: W, shade: COOL, b: { top: bd(3, CLINE), bottom: bd(3, CLINE), left: NOB, right: NOB }, m: { top: 38, bottom: 38, left: 120, right: 120 } })] })]));
K.push(spF(2, 75, 0.07));

K.push(sp(40));

/* 먼저 보기 — 다 표시된 문장 (문장 2: 모든 표시 등장) */
const SGRN = "2E7D32", MRED = "C0392B", MGRY = "8A8F94";
const exSeg = (wordRuns, label, labColor, wid, topMark) => cel([
  new Paragraph({ children: [t(topMark || "\u00A0", { size: 13, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 4, line: 150 } }),
  new Paragraph({ children: wordRuns, alignment: AlignmentType.CENTER, spacing: { after: 18, line: 270 } }),
  new Paragraph({ children: [t(label, { size: 12, bold: true, color: labColor })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 160 } }),
], { w: wid, va: VerticalAlign.CENTER, m: { top: 14, bottom: 14, left: 20, right: 20 } });
K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("먼저 보기", { size: 14, bold: true, color: GOLD, ls: 10 }),
    t("   ORUN FLOW를 쓰기 전에, 다 표시된 문장 8을 먼저 구경하세요. 라벨은 단어 ", { size: 15, color: SUB }),
    t("바로 밑", { size: 15, bold: true, color: INK }), t("에!", { size: 15, color: SUB }),
  ], spacing: { after: 42, line: 212 } }),
  T([1085, 791, 1886, 691, 943, 1731, 1803], [new TableRow({ children: [
    exSeg([t("Families", { size: 18, bold: true, color: SGRN, underline: {} })], "S 주어", SGRN, 1085),
    exSeg([t("began", { size: 18, bold: true, color: NAVY })], "V 본동사", NAVY, 791, "\u25b3"),
    exSeg([t("to have fewer kids,", { size: 18 })], "", FAINT, 1886),
    exSeg([t("so", { size: 18, bold: true, color: AMB, border: { style: BorderStyle.SINGLE, size: 10, color: AMB, space: 3 } })], "접속사", AMB, 691),
    exSeg([t("each kid", { size: 18, bold: true, color: SGRN, underline: {} })], "S\u2032 주어", SGRN, 943),
    exSeg([t("was able to get", { size: 18, bold: true, color: NAVY })], "V\u2032 한 덩어리", NAVY, 1731, "\u25b3"),
    exSeg([t("more attention", { size: 18 })], "", FAINT, 1803),
  ] })]),
], { w: W, shade: PAPER, b: { top: bd(4, GOLD), bottom: bd(4, GOLD), left: bd(4, GOLD), right: bd(4, GOLD) }, m: { top: 44, bottom: 44, left: 200, right: 200 } })] })]));
K.push(spF(2, 85, 0.06));

[[5, "Before the 19th century, in the U.S., birthday celebrations were only for rich people or national heroes."],
 [10, "On kids\u2019 birthdays, families started to put a big candle in the middle of the cake."],
 [12, "Even though birthday parties have a short history, they\u2019re now a big part of our lives."]].forEach(([n, c]) => {
  K.push(p([t("문장 " + n, { size: 15, bold: true, color: NAVY2 }), t("   " + c, { size: 20 }),
    t("      \u2192 문장에 직접 표시!", { size: 13, color: FAINT })], { after: 58, line: 520 }));
  K.push(writeField(1, 410));
  K.push(spF(2, 150, 0.08));
});

/* ═══════════ 3면 [DATA] STEP 1 소재·핵심어·지시어 ═══════════ */
K.push(brk());
K.push(T([1050, W - 1050], [new TableRow({ children: [
  cel(new Paragraph({ children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(ASSETS, "icons", "steps.png")), transformation: { width: 34, height: 34 } })],
    alignment: AlignmentType.CENTER, spacing: { before: 130, after: 0, line: 460 } }),
    { w: 1050, shade: NAVY, va: VerticalAlign.CENTER, m: { top: 175, bottom: 175, left: 0, right: 0 }, b: { top: NOB, right: NOB, left: bd(26, YEL), bottom: bd(6, YEL) } }),
  cel([
  new Paragraph({ children: [t("READ RIGHT", { f: FO, size: 22, color: "FFFFFF", ls: 10 })], tabStops: [{ type: TabStopType.RIGHT, position: 8300 }], spacing: { after: 55, line: 350 } }),
  new Paragraph({ children: [t("Warming Up! ", { size: 16, bold: true, color: "C3CDD6" }), t("키워드 찾기 · 플로차트 · 주제문 작성 · 요약문 완성 · 패러프레이징", { size: 16, color: "C3CDD6" })], spacing: { after: 0, line: 230 } }),
], { w: W - 1050, shade: NAVY, va: VerticalAlign.CENTER, m: { top: 175, bottom: 175, left: 60, right: 250 }, b: { top: NOB, right: NOB, left: NOB, bottom: bd(6, YEL) } }),
] })]));
K.push(spF(3, 140, 0.10));
K.push(p([t("한 줄 해석", { size: 19, bold: true, color: NAVY }),
  t("   한 문장씩 끊어, 우리말 한 줄로 해석해 보세요. 밑줄 친 지시어는 무엇을 가리키는지 생각하며!", { size: 15, color: SUB })], { after: 90, line: 245 }));
SENT.forEach((s, i) => {
  const n = i + 1;
  const runs = DEIXIS[n]
    ? DEIXIS[n].map(r => r).slice(0, -0)
    : null;
  K.push(p([t(String(n).padStart(2, "0") + "  ", { f: FD, size: 14, color: NAVY2 })].concat(
      DEIXIS[n] ? DEIXIS[n] : [t(s, { size: 17 })]
    ), { after: 34, line: 250, indent: { left: 0 } }));
  K.push(writeField(1, 300));
  K.push(spF(3, 52, 0.055));
});

/* ═══════════ 4면 [DATA] STEP 1 ═══════════ */
K.push(brk());

function stepHead(n, kr, ds) {
  return T([GUT, BODY], [new TableRow({ children: [
    cel([
      new Paragraph({ children: [t("READ RIGHT", { f: FO, size: 7, bold: true, color: YEL, ls: 8 })],
        alignment: AlignmentType.CENTER, spacing: { after: 8, line: 140 } }),
      new Paragraph({ children: [t(n, { f: FD, size: 24, color: "FFFFFF" })],
        alignment: AlignmentType.CENTER, spacing: { after: 0, line: 270 } }),
    ], { w: GUT, shade: NAVY, va: VerticalAlign.CENTER, m: { top: 40, bottom: 46, left: 0, right: 0 },
        b: { top: NOB, left: NOB, right: NOB, bottom: bd(14, YEL) } }),
    cel([
      new Paragraph({ children: [t(kr, { f: FD, size: 20, color: NAVY })], spacing: { after: 28, line: 260 } }),
      new Paragraph({ children: [t(ds, { size: 17, color: SUB })], spacing: { after: 0, line: 230 } }),
    ], { w: BODY, va: VerticalAlign.CENTER, m: { top: 30, bottom: 50, left: 190, right: 0 },
        b: { top: NOB, left: NOB, right: NOB, bottom: bd(8, YEL) } }),
  ] })]);
}

K.push(stepHead("1", "소재와 핵심어 찾기", "무엇에 관한 글인지 잡으면 절반은 읽은 것입니다."));
K.push(spF(4, 120, 0.08));
K.push(reprint(DEIXIS));
K.push(spF(4, 300, 0.10));

K.push(p([t("1-1  ", { size: 18, bold: true, color: GOLD }), t("소재 찾기", { size: 19, bold: true }),
  t("      이 글은 무엇에 관한 글인가요? 하나만 고르세요.", { size: 16, color: SUB })], { after: 90, line: 250 }));
["\u2460 미국 대통령들의 생일", "\u2461 생일 축하의 역사", "\u2462 생일 케이크 만드는 법"].forEach(c =>
  K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));
K.push(spF(4, 200, 0.26));

K.push(p([t("1-2  ", { size: 18, bold: true, color: GOLD }), t("핵심어 찾기", { size: 19, bold: true }),
  t("      주제문에 반드시 들어가야 할 말 3가지에 \u25cb표 하세요. 자주 나온다고 핵심어는 아닙니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
const KWCAND = [["birthday parties", "생일 파티"], ["candle", "초"], ["short history", "짧은 역사"], ["George Washington", "조지 워싱턴"], ["big part", "큰 부분"], ["cards", "카드"]];
K.push(T([1740,1740,1740,1740,1740,1740], [new TableRow({ children: KWCAND.map(([en, ko]) => cel([
  new Paragraph({ children: [t(en, { size: 18, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { after: 26, line: 230 } }),
  new Paragraph({ children: [t(ko, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 190 } }),
], { w: 1740, shade: FIELD, va: VerticalAlign.CENTER, m: { top: 240, bottom: 240, left: 40, right: 40 },
    b: { top: bd(4, FLINE), bottom: bd(4, FLINE), left: bd(4, FLINE), right: bd(4, FLINE) } })) })]));
K.push(p([t("힌트   ", { size: 14, bold: true, color: GOLD }), t("① 이 글의 주인공  ② 뜻밖의 사실  ③ 오늘날의 위치 \u2014 세 힌트에 하나씩 짝이 있어요.", { size: 15, color: SUB })], { after: 0, line: 230, indent: { left: 190 } }));
K.push(spF(4, 260, 0.30));

K.push(p([t("1-3  ", { size: 18, bold: true, color: GOLD }), t("지시어 이해하기", { size: 19, bold: true }),
  t("      it · this · they 같은 지시어는 앞에 나온 말을 대신합니다. 단어도, 앞 문장 전체도 대신할 수 있어요.", { size: 16, color: SUB })], { after: 60, line: 250 }));
K.push(p([t("앞 면의 문장 목록에 밑줄로 표시된 지시어가 무엇을 가리키는지, 괄호 안에서 골라 \u25cb표 하세요.", { size: 18, bold: true })], { after: 100, line: 250 }));
const aw = [700, 2350, 6950];
const ahd = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(aw, [
  thead(["문장", "지시어", "무엇을 가리키는가 \u2014 하나에 \u25cb표"], aw),
  ...(() => {
    const chipC = (s, w) => cel(new Paragraph({ children: [t(s, { size: 16 })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 225 } }),
      { w, shade: "FFFFFF", va: VerticalAlign.CENTER, m: { top: 68, bottom: 68, left: 60, right: 60 },
        b: { top: bd(5, CLINE), bottom: bd(5, CLINE), left: bd(5, CLINE), right: bd(5, CLINE) } });
    const labC = (s, w) => cel(new Paragraph({ children: [t(s, { size: 16, bold: true, color: NAVY2 })], spacing: { after: 0 } }),
      { w, va: VerticalAlign.CENTER, m: { top: 0, bottom: 0, left: 0, right: 40 } });
    const gapC = (w) => cel(p(t(""), { after: 0 }), { w, m: { top: 0, bottom: 0, left: 0, right: 0 } });
    const chips2 = (a, b, cw) => T([cw, 230, cw], [new TableRow({ children: [chipC(a, cw), gapC(230), chipC(b, cw)] })]);
    const chips8 = () => T([862, 1051, 184, 1053, 313, 967, 1053, 184, 1053], [new TableRow({ children: [
      labC("they =", 862), chipC("사람들", 1051), gapC(184), chipC("버스들", 1053), gapC(313),
      labC("them =", 967), chipC("사람들", 1053), gapC(184), chipC("버스들", 1053),
    ] })]);
    return [
    ["1", "it", [t("the \u201CHappy Birthday\u201D song (노래)", { size: 18, color: SUB }), t("   예시", { size: 14, bold: true, color: GOLD })], true],
    ["3", "this tradition", chips2("생일 축하하기", "노래 만들기", 1900), false],
    ["9", "This", chips2("관심이 커진 것", "카드를 준 것", 1900), false],
    ["12", "they", chips2("birthday parties", "our lives", 2100), false],
  ]; })().map(([sn, exp, runs, isEx]) => new TableRow({ children: [
    cel(new Paragraph({ children: [t(sn, { size: 18, bold: true, color: NAVY2 })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: aw[0], shade: isEx ? GREY : FIELD, b: ahd, va: VerticalAlign.CENTER, m: { top: 265, bottom: 265, left: 0, right: 0 } }),
    cel(new Paragraph({ children: [t(exp, { size: 18, bold: true, color: NAVY })], spacing: { after: 0 } }),
      { w: aw[1], shade: isEx ? GREY : FIELD, b: ahd, va: VerticalAlign.CENTER, m: { top: 265, bottom: 265, left: 150, right: 80 } }),
    cel(Array.isArray(runs) ? new Paragraph({ children: runs, spacing: { after: 0 } }) : [runs],
      { w: aw[2], shade: isEx ? GREY : FIELD, b: ahd, va: VerticalAlign.CENTER, m: { top: Array.isArray(runs) ? 265 : 175, bottom: Array.isArray(runs) ? 265 : 175, left: 150, right: 80 } }),
  ] })),
]));

/* ═══════════ 4면 [DATA] STEP 2 글의 흐름 잡기 ═══════════ */
K.push(brk());
K.push(stepHead("2", "글의 흐름 잡기", "연결어를 따라가면 글의 길이 보입니다."));
K.push(spF(5, 130, 0.18));

K.push(p([t("2-1  ", { size: 18, bold: true, color: GOLD }), t("연결어 찾기", { size: 19, bold: true }),
  t("      밑줄 친 연결어가 어떤 일을 하는지, 괄호 안에서 골라 \u25cb표 하세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
const gw = [900, 6100, 3000];
const ghd = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(gw, [
  thead(["문장", "본문 문장 (연결어 밑줄)", "하는 일"], gw),
  ...[
    ["3", [t("But", { size: 17, bold: true, color: NAVY, underline: {} }), t(" people only started this tradition around 100 years ago!", { size: 17 })], ["반전", "예시"]],
    ["6", [t("For example", { size: 17, bold: true, color: NAVY, underline: {} }), t(", most people would celebrate George Washington\u2019s birthday.", { size: 17 })], ["예시", "결과"]],
    ["8", [t("Families began to have fewer kids, ", { size: 17 }), t("so", { size: 17, bold: true, color: NAVY, underline: {} }), t(" each kid was able to get more attention.", { size: 17 })], ["결과", "반전"]],
    ["12", [t("Even though", { size: 17, bold: true, color: NAVY, underline: {} }), t(" birthday parties have a short history, they\u2019re now a big part of our lives.", { size: 17 })], ["~일지라도", "~때문에"]],
  ].map(([sn, runs, pick]) => new TableRow({ children: [
    cel(new Paragraph({ children: [t(sn, { size: 18, bold: true, color: GOLD })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: gw[0], shade: GREY, b: ghd, va: VerticalAlign.CENTER, m: { top: 190, bottom: 190, left: 0, right: 0 } }),
    cel(new Paragraph({ children: runs, spacing: { after: 0, line: 252 } }),
      { w: gw[1], shade: GREY, b: ghd, va: VerticalAlign.CENTER, m: { top: 190, bottom: 190, left: 150, right: 100 } }),
    cel([chipPairG(pick[0], pick[1], 1150, 180)],
      { w: gw[2], shade: FIELD, b: ghd, va: VerticalAlign.CENTER, m: { top: 130, bottom: 130, left: 170, right: 80 } }),
  ] })),
]));
K.push(spF(5, 340, 0.34));

K.push(p([t("2-2  ", { size: 18, bold: true, color: GOLD }), t("흐름 지도(Flow Chart) 완성하기", { size: 19, bold: true }),
  t("      본문은 [A]–[E] 다섯 구간으로 나뉩니다. 흐름 지도의 빈칸에 알맞은 역할을 <보기>에서 골라 쓰세요.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [
  cel(p(segPassage(), { line: 258, after: 0, align: AlignmentType.JUSTIFIED }),
    { w: W, shade: COOL, m: { top: 120, bottom: 120, left: 230, right: 230 },
      b: { top: NOB, bottom: NOB, right: NOB, left: bd(10, NAVY) } }),
] })]));
K.push(sp(120));
K.push(T([W], [new TableRow({ children: [cel(
  T([700, 1400, 220, 1400, 220, 1400], [new TableRow({ children: [
    cel(new Paragraph({ children: [t("보기", { size: 16, bold: true, color: NAVY2 })], spacing: { after: 0 } }),
      { w: 700, va: VerticalAlign.CENTER, m: { top: 0, bottom: 0, left: 0, right: 60 } }),
    chipCellG("과거", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("마무리", 1400),
    cel(p(t(""), { after: 0 }), { w: 220, m: { top: 0, bottom: 0, left: 0, right: 0 } }),
    chipCellG("광고", 1400),
  ] })]),
  { w: W, shade: GREY, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 90, bottom: 90, left: 2450, right: 120 } })] })]));
K.push(sp(115));
function flowCell(seg, top, body, blank) {
  return cel([
    new Paragraph({ children: [t("[" + seg + "]", { size: 14, bold: true, color: SEGCOL[seg] })], alignment: AlignmentType.CENTER, spacing: { after: 32, line: 180 } }),
    blank
      ? new Paragraph({ children: [new TextRun({ text: "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0", size: 16, font: F, underline: {} })], alignment: AlignmentType.CENTER, spacing: { after: 55, line: 260 } })
      : new Paragraph({ children: [t(top, { size: 15, bold: true, color: NAVY2 })], alignment: AlignmentType.CENTER, spacing: { after: 42, line: 200 } }),
    new Paragraph({ children: [t(body, { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 212 } }),
  ], { w: 1830, shade: blank ? FIELD : GREY, va: VerticalAlign.CENTER, m: { top: 215, bottom: 215, left: 70, right: 70 },
      b: { top: bd(4, blank ? FLINE : CLINE), bottom: bd(4, blank ? FLINE : CLINE), left: bd(4, blank ? FLINE : CLINE), right: bd(4, blank ? FLINE : CLINE) } });
}
const arrowCell = () => cel(new Paragraph({ children: [t("→", { size: 18, bold: true, color: GOLD })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
  { w: 212, va: VerticalAlign.CENTER, m: { top: 0, bottom: 0, left: 0, right: 0 } });
K.push(T([1830, 212, 1830, 212, 1830, 212, 1830, 212, 1830], [new TableRow({ children: [
  flowCell("A", "도입", "문장 1–4", false),
  arrowCell(),
  flowCell("B", null, "문장 5–6", true),
  arrowCell(),
  flowCell("C", "변화", "문장 7–9", false),
  arrowCell(),
  flowCell("D", "새 풍습", "문장 10–11", false),
  arrowCell(),
  flowCell("E", null, "문장 12–13", true),
] })]));
K.push(spF(5, 360, 0.38));

K.push(p([t("2-3  ", { size: 18, bold: true, color: GOLD }), t("글의 종류 고르기", { size: 19, bold: true }),
  t("      위 분석을 바탕으로, 이 글의 종류로 가장 알맞은 것을 고르세요.", { size: 16, color: SUB })], { after: 110, line: 250 }));
["\u2460 대상을 소개하고 사실을 알려 주는 설명문",
 "\u2461 하루 동안 겪은 일을 쓴 일기",
 "\u2462 물건을 팔기 위해 만든 광고",
 "\u2463 안부를 묻고 소식을 전하는 편지",
 "\u2464 상상 속 인물이 나오는 동화"].forEach(c => K.push(p([t(c, { size: 19 })], { after: 55, indent: { left: 440, hanging: 190 }, line: 268 })));

/* ═══════════ 5면 [DATA] STEP 3 주제문 만들기 ═══════════ */
K.push(brk());
K.push(stepHead("3", "주제문 만들기", "본문에서 재료를 찾아, 이 글의 주제문을 영어로 만듭니다."));
K.push(spF(6, 130, 0.09));

K.push(p([t("3-1  ", { size: 18, bold: true, color: GOLD }), t("재료 찾기", { size: 19, bold: true }), t("      주제문의 재료는 모두 본문 안에 있습니다. 문장 번호를 따라가, 괄호 안에서 골라 \u25cb표 하세요.", { size: 16, color: SUB })], { after: 90, line: 250 }));

const cw = [4550, 2650, 2800];
const RX5 = Math.round((FT(6) || 0) * 0.052);
const chd = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
function matRow(bn, sn, q, ans, role, isEx) {
  return new TableRow({ children: [
    cel([
      new Paragraph({ children: [t("(" + bn + ")", { size: 15, bold: true, color: NAVY }), t("   문장 " + sn, { size: 14, bold: true, color: GOLD })], spacing: { after: 40, line: 200 } }),
      new Paragraph({ children: [t(q, { size: 18 })], spacing: { after: 0, line: 250 } }),
    ], { w: cw[0], shade: isEx ? GREY : FIELD, b: chd, m: { top: 265 + RX5, bottom: 265 + RX5, left: 150, right: 80 } }),
    cel(isEx ? new Paragraph({ children: [t(ans, { size: 19, bold: true, color: GOLD }), t("  예시", { size: 14, bold: true, color: GOLD })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }) : [chipPairG(ans[0], ans[1], 1020, 150)],
      { w: cw[1], shade: isEx ? GREY : FIELD, b: chd, va: VerticalAlign.CENTER, m: { top: 265 + RX5, bottom: 265 + RX5, left: 150, right: 80 } }),
    cel(new Paragraph({ children: [t(role, { size: 17, color: SUB })], spacing: { after: 0, line: 245 } }),
      { w: cw[2], shade: isEx ? GREY : FIELD, b: chd, va: VerticalAlign.CENTER, m: { top: 265 + RX5, bottom: 265 + RX5, left: 150, right: 80 } }),
  ] });
}
K.push(T(cw, [
  thead(["질문", "본문에서 찾아 쓰기", "주제문 자리"], cw),
  matRow("1", "12", "이 글이 다루는 대상은 무엇인가요? (두 단어)", "birthday parties", "맨 앞 주어 자리", true),
  matRow("2", "12", "역사의 길이를 나타낸 말은?", ["short", "long"], "history 앞 자리 (길이)", false),
  matRow("3", "12", "오늘날의 위치를 나타낸 말은?", ["big", "small"], "part 앞 자리 (크기)", false),
]));
K.push(spF(6, 560, 0.16));

K.push(p([t("3-2  ", { size: 18, bold: true, color: GOLD }), t("뼈대 채우기", { size: 19, bold: true }), t("      3-1에서 찾은 (1)~(3)을 같은 번호의 빈칸에 넣으면 주제문이 완성됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(box([p([
  t("(1)", { size: 15, bold: true, color: GOLD }), t(" ________  ________", { size: 19, color: NAVY2 }),
  t("  have a  ", { size: 19 }),
  t("(2)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  history, but they are now a  ", { size: 19 }),
  t("(3)", { size: 15, bold: true, color: GOLD }), t(" ________", { size: 19, color: NAVY2 }),
  t("  part of our lives.", { size: 19 }),
], { line: 640 + Math.min(220, Math.round((FT(6) || 0) * 0.025)), after: 0 })]));
K.push(spF(6, 620, 0.15));

K.push(p([t("3-3  ", { size: 18, bold: true, color: GOLD }), t("주제문 완성하기", { size: 19, bold: true }), t("      이번에는 뼈대 없이 씁니다. <보기>의 네 덩어리를 순서대로 이으면 주제문이 됩니다.", { size: 16, color: SUB })], { after: 90, line: 250 }));

K.push(p([t("조건 ", { size: 16, bold: true, color: GOLD }),
  t("덩어리의 순서를 괄호에 쓰세요. 덩어리 안의 단어는 바꾸지 않습니다.", { size: 16, color: SUB })], { after: 100, line: 250 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }),
     t("\u24D0 but they are now     \u24D1 a short history,     \u24D2 birthday parties have     \u24D3 a big part of our lives.", { size: 18 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 150 + Math.round((FT(6) || 0) * 0.02), bottom: 150 + Math.round((FT(6) || 0) * 0.02), left: 180, right: 180 } })] })]));
K.push(spF(6, 200, 0.05));
K.push(p([t("순서   ", { size: 17, bold: true, color: NAVY2 }),
  t("(  \u24D2  )", { size: 19 }), t("  \u2192  (      )  \u2192  (      )  \u2192  (      )", { size: 19 }),
  t("      (c)가 맨 앞 \u2014 주어부터 시작!", { size: 14, color: GOLD, bold: true })], { after: 0, align: AlignmentType.CENTER }));

/* ═══════════ 6~7면 [DATA] STEP 4 요약 · STEP 5 같은 뜻 찾기 ═══════════ */
K.push(brk());
K.push(reprint());
K.push(spF(7, 170, 0.16));
K.push(stepHead("4", "요약문 완성", "핵심어로 빈칸을 채우면 글 전체가 세 문장으로 줄어듭니다."));
K.push(sp(120));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("heroes        attention        cards        part", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 68, bottom: 68, left: 180, right: 180 } })] })]));
K.push(sp(120));
K.push(box([p([t("Long ago, birthday celebrations were only for rich people or national (1) ____________. Later, families had fewer kids, so each kid got more (2) ____________, and birthday parties, candles, and (3) ____________ became common. Today they are a big (4) ____________ of our lives.", { size: 19 })], { line: 425, after: 0 })]));
K.push(spF(7, 180, 0.18));
K.push(stepHead("5", "같은 뜻 찾기", "같은 뜻, 다른 표현. 시험은 늘 바꿔서 묻습니다."));
K.push(sp(110));
K.push(p([t("본문 표현과 뜻이 다른 선지에 어떤 오답인지 유형을 표시하세요. 뜻이 같은 선지에는 아무 표시도 하지 않습니다.", { size: 18, bold: true })], { after: 60, line: 240 }));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("오답 유형   ", { size: 15, bold: true, color: NAVY2 }),
     t("뜻이 반대", { size: 16, bold: true, color: NAVY }), t("  본문과 반대 방향으로 말함          ", { size: 15, color: SUB }),
     t("본문과 무관", { size: 16, bold: true, color: NAVY }), t("  지문에 근거가 없음", { size: 15, color: SUB })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: GREY, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 62, bottom: 62, left: 150, right: 150 } })] })]));
K.push(sp(70));

/* STEP5 — 2문제/행 × 2행 그리드 */
const HW = [3260, 1590, 320, 3260, 1590];   /* 선지A · 체크A · 간격 · 선지B · 체크B */
const RXG = Math.min(120, Math.round((FT(7) || 0) * 0.03));
function pairGrid(A, B) {
  const head = (s) => cel(new Paragraph({ children: [
      t("문장 " + s.sn + "   ", { size: 13, bold: true, color: YEL }),
      t(s.main, { size: 15, bold: true, color: "FFFFFF" }),
    ], spacing: { after: 0, line: 225 } }),
    { w: HW[0] + HW[1], span: 2, shade: NAVY2, va: VerticalAlign.CENTER, m: { top: 40, bottom: 40, left: 150, right: 90 } });
  const gapCell = () => cel(p(t(""), { after: 0 }), { w: HW[2], b: { top: NOB, bottom: NOB, left: NOB, right: NOB }, m: { top: 0, bottom: 0, left: 0, right: 0 } });
  const optCell = (o) => cel(new Paragraph({ children: [t(o, { size: 16 })], spacing: { after: 0, line: 224 } }),
    { w: HW[0], va: VerticalAlign.CENTER, m: { top: 56 + RXG, bottom: 56 + RXG, left: 130, right: 60 },
      b: { top: NOB, bottom: bd(3, WISP), left: NOB, right: NOB } });
  const chkCell = () => cel(new Paragraph({ children: [t("\u25A1 반대   \u25A1 무관", { size: 14, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 200 } }),
    { w: HW[1], shade: FIELD, va: VerticalAlign.CENTER, m: { top: 56 + RXG, bottom: 56 + RXG, left: 40, right: 40 },
      b: { top: NOB, bottom: bd(4, "FFFFFF"), left: bd(8, YEL), right: NOB } });
  const rows = [new TableRow({ children: [head(A), gapCell(), head(B)] })];
  for (let j = 0; j < 3; j++) {
    rows.push(new TableRow({ children: [optCell(A.opts[j]), chkCell(), gapCell(), optCell(B.opts[j]), chkCell()] }));
  }
  K.push(T(HW, rows));
}
pairGrid(
  { sn: 3, main: "only started this tradition around 100 years ago",
    opts: ["\u2460 began it only about a century ago", "\u2461 have kept it for thousands of years", "\u2462 learned it from another country"] },
  { sn: 5, main: "only for rich people or national heroes",
    opts: ["\u2460 for everyone in the country", "\u2461 just for the wealthy or the famous", "\u2462 only for children under ten"] });
K.push(spF(7, 140, 0.16));
pairGrid(
  { sn: 8, main: "each kid was able to get more attention",
    opts: ["\u2460 every child received less care", "\u2461 each child could get more care", "\u2462 each child had to work harder"] },
  { sn: 11, main: "giving birthday cards also became common",
    opts: ["\u2460 sending cards grew popular too", "\u2461 card giving almost disappeared", "\u2462 cards became very expensive"] });
K.push(spF(7, 150, 0.16));

K.push(T([W], [new TableRow({ children: [cel([
  new Paragraph({ children: [
    t("Knowledge Bank", { f: FO, size: 16, bold: true, color: TEAL }),
    t("      배경지식 · 「Happy Birthday」 노래의 역사", { size: 16, bold: true, color: NAVY }),
  ], spacing: { after: 95, line: 230 } }),
  new Paragraph({ children: [t("생일 파티에서 부르는 그 노래도 사실은 생일용이 아니었다. 1893년 미국의 교사였던 힐(Hill) 자매는 유치원 아이들과 부를 인사 노래 ‘Good Morning to All’을 만들었다. 20세기 초, 사람들이 이 쉬운 멜로디에 생일 축하 가사를 붙여 부르기 시작하면서 오늘의 노래가 되었다. 오랫동안 저작권이 있어 영화나 식당에서 마음대로 부르지 못했지만, 2016년 법원이 저작권을 인정하지 않으면서 이제는 누구나 자유롭게 부를 수 있다. 생일 파티처럼, 이 노래의 역사도 생각보다 짧다.", { size: 17, color: SUB })], spacing: { after: 85 + Math.round((FT(7) || 0) * 0.03), line: 272 + Math.min(130, Math.round((FT(7) || 0) * 0.016)) }, alignment: AlignmentType.JUSTIFIED }),
  new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(WORK, "kb_u31.png")), transformation: (() => { const g = Math.min(140, Math.round((FT(7) || 0) * 0.02)); return { width: 385 + g, height: Math.round((385 + g) * 113 / 440) }; })() })],
    alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
], { w: W, shade: "FFFFFF", b: { top: bd(10, TEAL), bottom: bd(4, TEAL), left: bd(4, TEAL), right: bd(4, TEAL) },
    m: { top: 145 + Math.round((FT(7) || 0) * 0.045), bottom: 150 + Math.round((FT(7) || 0) * 0.045), left: 280, right: 280 } })] })]));

/* ═══════════ 8~11면 [DATA] 독해력 UP 워크북 R1–R7 + 자기 점검표 ═══════════ */
function wbAsk(n, ty, stem, pts) {
  return T([GUT, BODY], [new TableRow({ children: [
    cel([
      new Paragraph({ children: [t("RE:RIGHT", { f: FO, size: 7, bold: true, color: YEL, ls: 8 })],
        alignment: AlignmentType.CENTER, spacing: { after: 8, line: 140 } }),
      new Paragraph({ children: [t(n.replace("R", ""), { f: FD, size: 24, color: "FFFFFF" })],
        alignment: AlignmentType.CENTER, spacing: { after: 0, line: 270 } }),
    ], { w: GUT, shade: TEAL, va: VerticalAlign.CENTER, m: { top: 40, bottom: 46, left: 0, right: 0 },
        b: { top: NOB, left: NOB, right: NOB, bottom: bd(14, YEL) } }),
    cel([
      new Paragraph({ children: [t(ty, { f: FD, size: 20, color: TEAL })], spacing: { after: 28, line: 260 } }),
      new Paragraph({ children: [t(stem, { size: 17, color: SUB }), ...(pts ? [t("  [" + pts + "]", { size: 15, color: FAINT })] : [])], spacing: { after: 0, line: 235 } }),
    ], { w: BODY, va: VerticalAlign.CENTER, m: { top: 30, bottom: 50, left: 190, right: 0 },
        b: { top: NOB, left: NOB, right: NOB, bottom: bd(8, YEL) } }),
  ] })]);
}

K.push(brk());
K.push(T([1050, W - 1050], [new TableRow({ children: [
  cel(new Paragraph({ children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(ASSETS, "icons", "reright.png")), transformation: { width: 34, height: 34 } })],
    alignment: AlignmentType.CENTER, spacing: { before: 130, after: 0, line: 460 } }),
    { w: 1050, shade: TEAL, va: VerticalAlign.CENTER, m: { top: 160, bottom: 150, left: 0, right: 0 }, b: { top: NOB, right: NOB, left: bd(26, YEL), bottom: bd(6, YEL) } }),
  cel([
  new Paragraph({ children: [t("RE:RIGHT", { f: FO, size: 22, color: "FFFFFF", ls: 10 })], tabStops: [{ type: TabStopType.RIGHT, position: 8300 }], spacing: { after: 55, line: 350 } }),
  new Paragraph({ children: [t("Step Up! ", { size: 16, bold: true, color: "C3E0DA" }), t("같은 지문으로 고교 내신에 직결되는 7가지 역량을 체계적으로 훈련합니다.", { size: 16, color: "C3E0DA" })], spacing: { after: 0, line: 230 } }),
], { w: W - 1050, shade: TEAL, va: VerticalAlign.CENTER, m: { top: 160, bottom: 150, left: 60, right: 250 }, b: { top: NOB, right: NOB, left: NOB, bottom: bd(6, YEL) } }),
] })]));
K.push(spF(8, 140, 0.14));
K.push(reprint());
K.push(spF(8, 240, 0.24));

/* ── R1 True / False ── */
K.push(wbAsk("R1", "True / False · 정독 훈련", "본문의 내용과 맞으면 T, 다르면 F에 표시하세요. (근거 문장 번호를 함께 적어 보세요.)"));
K.push(sp(120));
const tfw = [700, 7000, 2300];
const tfb = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(tfw, [
  thead(["", "문장", "T / F"], tfw, TEAL),
  ...[
    "We all sing the \u201CHappy Birthday\u201D song at birthday parties.",
    "People started the birthday tradition around 1,000 years ago.",
    "Before the 19th century, birthday celebrations in the U.S. were only for rich people or national heroes.",
    "In the past, most people would celebrate their own birthday, not George Washington\u2019s.",
    "Around the mid-19th century, families began to have fewer kids.",
    "Because families had fewer kids, each kid got less attention.",
    "Families started to put a big candle in the middle of the cake.",
    "Giving birthday cards became common at the start of the 19th century.",
  ].map((s, i) => new TableRow({ children: [
    cel(new Paragraph({ children: [t(String(i + 1), { size: 17, bold: true, color: NAVY2 })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: tfw[0], shade: GREY, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 0, right: 0 } }),
    cel(new Paragraph({ children: [t(s, { size: 18 })], spacing: { after: 0, line: 246 } }),
      { w: tfw[1], shade: GREY, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 150, right: 100 } }),
    cel(new Paragraph({ children: [t("\u25A1 T      \u25A1 F", { size: 17, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: tfw[2], shade: FIELD, b: tfb, va: VerticalAlign.CENTER, m: { top: 92, bottom: 92, left: 100, right: 100 } }),
  ] })),
]));
K.push(spF(8, 240, 0.34));

/* ── R2 사건 순서 잡기 ── */
K.push(wbAsk("R2", "사건 순서 잡기 · 흐름 이해", "생일 축하의 역사에서 일어난 일 ⓐ~ⓓ를 실제로 일어난 순서대로 배열하세요."));
K.push(sp(120));
K.push(box([
  ...["\u24D0 Families began to have fewer kids.",
      "\u24D1 Birthday celebrations were only for rich people or national heroes.",
      "\u24D2 Giving birthday cards became common.",
      "\u24D3 Families started to put a big candle in the middle of the cake."]
    .map((s, i, a) => p([t(s, { size: 18 })], { after: i === a.length - 1 ? 0 : 150, line: 280 })),
], { shade: PAPER }));
K.push(sp(140));
K.push(field([p([
  t("(          )", { size: 19, bold: true, color: NAVY2 }), t("   →   ", { size: 19, bold: true, color: GOLD }),
  t("(          )", { size: 19, bold: true, color: NAVY2 }), t("   →   ", { size: 19, bold: true, color: GOLD }),
  t("(          )", { size: 19, bold: true, color: NAVY2 }), t("   →   ", { size: 19, bold: true, color: GOLD }),
  t("(          )", { size: 19, bold: true, color: NAVY2 }),
], { after: 0, line: 400, align: AlignmentType.CENTER })]));

/* ── 9면 : R3 영영풀이 매칭 · R4 어법 기초 ── */
K.push(brk());
K.push(wbAsk("R3", "영영풀이 매칭 · 어휘 훈련", "왼쪽 어휘의 뜻을 영어로 설명한 것을 ⓐ~ⓕ에서 골라 괄호에 쓰세요."));
K.push(sp(130));
const mw3 = [2650, 1250, 6100];
const RX9 = Math.round((FT(9) || 0) * 0.046);
const m3b = { top: NOB, bottom: bd(3, HAIR), left: NOB, right: NOB };
K.push(T(mw3, [
  thead(["어휘", "답", "영영풀이"], mw3, TEAL),
  ...[
    ["1  celebrate", "\u24D0 a way of doing things that people keep for a long time"],
    ["2  tradition", "\u24D1 to make something happen"],
    ["3  hero", "\u24D2 happening often, or seen almost everywhere"],
    ["4  attention", "\u24D3 a person that many people admire"],
    ["5  common", "\u24D4 to do something special for an important day"],
    ["6  lead to", "\u24D5 the act of watching or caring about someone"],
  ].map(([wd, df]) => new TableRow({ children: [
    cel(new Paragraph({ children: [t(wd, { size: 18, bold: true, color: NAVY })], spacing: { after: 0 } }),
      { w: mw3[0], shade: GREY, b: m3b, va: VerticalAlign.CENTER, m: { top: 158 + RX9, bottom: 158 + RX9, left: 150, right: 80 } }),
    cel(new Paragraph({ children: [t("(        )", { size: 18, color: SUB })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }),
      { w: mw3[1], shade: FIELD, b: m3b, va: VerticalAlign.CENTER, m: { top: 158 + RX9, bottom: 158 + RX9, left: 0, right: 0 } }),
    cel(new Paragraph({ children: [t(df, { size: 18 })], spacing: { after: 0, line: 246 } }),
      { w: mw3[2], shade: GREY, b: m3b, va: VerticalAlign.CENTER, m: { top: 158 + RX9, bottom: 158 + RX9, left: 150, right: 80 } }),
  ] })),
]));
K.push(spF(9, 380, 0.12));

K.push(wbAsk("R4", "어법 기초 · 문장 감각", "본문의 문장입니다. 괄호 안에서 알맞은 것을 고르세요."));
K.push(sp(130));
[["문장 2", [t("Birthday celebrations ", { size: 19 }), t("( feel  /  feels )", { size: 19, bold: true, color: NAVY }), t(" like a very old tradition.", { size: 19 })], "주어 celebrations(복수)에 맞는 동사 형태는?"],
 ["문장 8", [t("Each kid ", { size: 19 }), t("( was  /  were )", { size: 19, bold: true, color: NAVY }), t(" able to get more attention.", { size: 19 })], "each+단수 명사는 하나로 세는 말이에요."],
 ["문장 10", [t("Families started ", { size: 19 }), t("( to put  /  put )", { size: 19, bold: true, color: NAVY }), t(" a big candle in the middle of the cake.", { size: 19 })], "start 뒤에는 to+동사원형이 올 수 있어요."],
 ["문장 11", [t("", { size: 19 }), t("( Giving  /  Give )", { size: 19, bold: true, color: NAVY }), t(" birthday cards also became common.", { size: 19 })], "주어 자리에는 동사원형이 아니라 동사+ing!"],
].forEach(([n, runs, hint], i) => {
  K.push(T([GUT, BODY], [new TableRow({ children: [
    cel(new Paragraph({ children: [t("(" + (i + 1) + ")", { size: 16, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER, spacing: { after: 0, line: 210 } }),
      { w: GUT, shade: TEAL, m: { top: 55, bottom: 55, left: 0, right: 0 } }),
    cel([
      new Paragraph({ children: [t(n + "   ", { size: 14, bold: true, color: GOLD })].concat(runs), spacing: { after: 42, line: 258 } }),
      new Paragraph({ children: [t("힌트  ", { size: 14, bold: true, color: NAVY2 }), t(hint, { size: 16, color: SUB })], spacing: { after: 0, line: 235 } }),
    ], { w: BODY, shade: PAPER, m: { top: 110, bottom: 110, left: 190, right: 190 } }),
  ] })]));
  K.push(spF(9, 150, 0.075));
});

/* ── 10면 : R5 빈칸 클로즈 · R6 해석 쓰기 ── */
K.push(brk());
K.push(wbAsk("R5", "빈칸 클로즈 · 재구성 훈련", "지문을 다시 만났습니다. <보기>의 단어를 알맞은 빈칸에 넣어 글을 완성하세요."));
K.push(sp(90));
K.push(T([W], [new TableRow({ children: [cel(
  p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t("cards  /  attention  /  history  /  celebrate  /  part  /  tradition  /  candle  /  heroes", { size: 19 })], { after: 0, align: AlignmentType.CENTER }),
  { w: W, shade: COOL, b: { top: bd(4, CLINE), bottom: bd(4, CLINE), left: NOB, right: NOB }, m: { top: 75, bottom: 75, left: 180, right: 180 } })] })]));
K.push(sp(95));
const BL = (n) => [t(" (" + n + ") ", { size: 16, bold: true, color: GOLD }), t("__________", { size: 19, color: NAVY2 }), t(" ", { size: 19 })];
K.push(box([p([
  num(1), t(" We all know the \u201CHappy Birthday\u201D song and sing it at birthday parties.  ", { size: 19 }),
  num(2), t(" Birthday celebrations feel like a very old", { size: 19 }), ...BL(1), t(".  ", { size: 19 }),
  num(3), t(" But people only started this tradition around 100 years ago!  ", { size: 19 }),
  num(4), t(" Then how did people", { size: 19 }), ...BL(2), t("birthdays in the past?  ", { size: 19 }),
  num(5), t(" Before the 19th century, in the U.S., birthday celebrations were only for rich people or national", { size: 19 }), ...BL(3), t(".  ", { size: 19 }),
  num(6), t(" For example, most people would celebrate George Washington\u2019s birthday, not their own.  ", { size: 19 }),
  num(7), t(" But around the mid-19th century, things changed.  ", { size: 19 }),
  num(8), t(" Families began to have fewer kids, so each kid was able to get more", { size: 19 }), ...BL(4), t(".  ", { size: 19 }),
  num(9), t(" This led to more birthday parties.  ", { size: 19 }),
  num(10), t(" On kids\u2019 birthdays, families started to put a big", { size: 19 }), ...BL(5), t("in the middle of the cake.  ", { size: 19 }),
  num(11), t(" By the end of the 19th century, giving birthday", { size: 19 }), ...BL(6), t("also became common.  ", { size: 19 }),
  num(12), t(" Even though birthday parties have a short", { size: 19 }), ...BL(7), t(", they\u2019re now a big", { size: 19 }), ...BL(8), t("of our lives.  ", { size: 19 }),
  num(13), t(" They can show how much we love our friends and family.", { size: 19 }),
], { line: 465, after: 0, align: AlignmentType.JUSTIFIED })]));
K.push(spF(10, 210, 0.24));

K.push(wbAsk("R6", "우리말 해석 쓰기 · 서술형 기초", "다음 문장을 우리말로 해석해 보세요."));
K.push(sp(90));
[[8, "Families began to have fewer kids, so each kid was able to get more attention."],
 [12, "Even though birthday parties have a short history, they\u2019re now a big part of our lives."]].forEach(([n, s], i) => {
  K.push(p([t("(" + (i + 1) + ")  ", { size: 18, bold: true, color: TEAL }), t("문장 " + n, { size: 15, bold: true, color: NAVY2 }), t("   " + s, { size: 19 })], { after: 45 }));
  K.push(writeField(1, 400));
  K.push(spF(10, 150, 0.11));
});

/* ── R7 조건 영작 2문항 ── */
K.push(spF(10, 60, 0.10));
K.push(wbAsk("R7", "조건 영작 · 쓰기 훈련", "다음 우리말과 일치하도록 <보기>의 단어를 바르게 배열하시오."));
K.push(sp(120));
function w7block(no, ko, cond, bogi) {
  K.push(p([t("(" + no + ")  ", { size: 18, bold: true, color: TEAL }), t(ko, { size: 19, bold: true })], { indent: { left: 250 }, after: 55 }));
  K.push(T([W], [new TableRow({ children: [cel([
    p([t("조건   ", { size: 16, bold: true, color: NAVY2 }), t(cond, { size: 17, color: SUB })], { after: 42 }),
    p([t("보기   ", { size: 16, bold: true, color: NAVY2 }), t(bogi, { size: 19 })], { after: 0 }),
  ], { w: W, shade: PAPER, b: { top: bd(4, HAIR), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 110, bottom: 110, left: 230, right: 230 } })] })]));
  K.push(spF(10, 130, 0.05));
  K.push(writeField(1, 400));
  K.push(spF(10, 230, 0.05));
}
w7block("1", "이것은 더 많은 생일 파티로 이어졌다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 문장부호에 주의할 것  (총 6단어)",
  "more / led / This / birthday / to / parties.");
w7block("2", "하지만 19세기 중반 무렵, 상황이 바뀌었다.",
  "단어를 추가하거나 빼지 말 것 · 대소문자와 콤마에 주의할 것  (총 7단어)",
  "changed. / century, / But / things / mid-19th / around / the");

/* ═══════════ 12~14면 [DATA] 해설 ═══════════ */
  },

  renderExplain(ctx) {
    const { K, spF, FT } = ctx;
const H = (s) => K.push(T([W], [new TableRow({ children: [
  cel(new Paragraph({ children: [t(s, { size: 18, bold: true, color: NAVY })], spacing: { after: 0, line: 250 } }),
    { w: W, m: { top: 25, bottom: 25, left: 150, right: 0 }, b: { top: NOB, bottom: NOB, right: NOB, left: bd(12, YEL) } }),
] })]));
const B = (s, last) => K.push(p([t(s, { size: 17, color: SUB })], { after: last ? 150 : 26, line: 244, indent: { left: 0 } }));
const Hs = (s) => { K.push(sp(56)); H(s); K.push(sp(30)); };

K.push(...tab("정답 및 해설", "UNIT 31  우리 모두에게 특별한 그날", CHAR, "✓"));
K.push(sp(150));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("독해", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("01 ", { size: 19, bold: true, color: NAVY2 }), t("\u2460      ", { size: 19, bold: true }),
     t("02 ", { size: 19, bold: true, color: NAVY2 }), t("\u2462      ", { size: 19, bold: true }),
     t("03 ", { size: 19, bold: true, color: NAVY2 }), t("\u2460", { size: 19, bold: true })], { after: 25 }),
  p([t("04 ", { size: 19, bold: true, color: NAVY2 }), t("Birthday celebrations feel like a very old tradition.", { size: 19, bold: true })], { after: 75 }),
  p([t("구문분석", { size: 16, bold: true, color: NAVY })], { after: 60 }),
  p([t("문5 ", { size: 17, bold: true, color: NAVY2 }), t("Before the 19th century(M)·birthday celebrations(S)·were(△V)·only for rich people or national heroes(M)   ", { size: 17, bold: true }),
     t("문10 ", { size: 17, bold: true, color: NAVY2 }), t("On kids’ birthdays(M)·families(S)·started(△V)·to put a big candle in the middle of the cake", { size: 17, bold: true })], { after: 22 }),
  p([t("문12 ", { size: 17, bold: true, color: NAVY2 }), t("Even though[네모]·birthday parties(S′)·have(△V′)·they(S)·are(△V)·a big part of our lives", { size: 17, bold: true })], { after: 45 }),
  p([t("구문 훈련 ", { size: 16, bold: true, color: NAVY }), t("(1) 나는 숙제를 끝낼 수 있었다  (2) 만화책을 읽는 것은 재미있다  (3) 영어를 배우는 것은 재미있고, 나는 새 친구들을 사귈 수 있었다", { size: 17, bold: true })], { after: 72 }),
  p([t("독해력 5단계 훈련", { size: 16, bold: true, color: NAVY })], { after: 42 }),
  p([t("STEP 1 ", { size: 19, bold: true, color: NAVY2 }), t("1-1 \u2461   1-2 birthday parties \u00b7 short history \u00b7 big part        ", { size: 19, bold: true }),
     t("STEP 2 ", { size: 19, bold: true, color: NAVY2 }), t("2-1 반전 \u00b7 예시 \u00b7 결과 \u00b7 ~일지라도   2-2 [B] 과거 \u00b7 [E] 마무리   2-3 \u2460", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 3 ", { size: 19, bold: true, color: NAVY2 }), t("3-3 (c) \u2192 (b) \u2192 (a) \u2192 (d)  \u00b7  Birthday parties have a short history, but they are now a big part of our lives.", { size: 19, bold: true })], { after: 25 }),
  p([t("STEP 4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) heroes  (2) attention  (3) cards  (4) part        ", { size: 19, bold: true }),
     t("STEP 5 ", { size: 19, bold: true, color: NAVY2 }), t("문장 3 \u2460  문장 5 \u2461  문장 8 \u2461  문장 11 \u2460", { size: 19, bold: true })], { after: 150 }),
  p([t("RE:RIGHT", { f: FO, size: 13, bold: true, color: NAVY, ls: 10 })], { after: 42 }),
  p([t("R1 ", { size: 19, bold: true, color: NAVY2 }), t("1T \u00b7 2F \u00b7 3T \u00b7 4F \u00b7 5T \u00b7 6F \u00b7 7T \u00b7 8F        ", { size: 19, bold: true }),
     t("R2 ", { size: 19, bold: true, color: NAVY2 }), t("(b) \u2192 (a) \u2192 (d) \u2192 (c)", { size: 19, bold: true })], { after: 25 }),
  p([t("R3 ", { size: 19, bold: true, color: NAVY2 }), t("1(e) \u00b7 2(a) \u00b7 3(d) \u00b7 4(f) \u00b7 5(c) \u00b7 6(b)        ", { size: 19, bold: true }),
     t("R4 ", { size: 19, bold: true, color: NAVY2 }), t("(1) feel  (2) was  (3) to put  (4) Giving", { size: 19, bold: true })], { after: 25 }),
  p([t("R5 ", { size: 19, bold: true, color: NAVY2 }), t("(1) tradition (2) celebrate (3) heroes (4) attention (5) candle (6) cards (7) history (8) part", { size: 19, bold: true })], { after: 25 }),
  p([t("R7 ", { size: 19, bold: true, color: NAVY2 }), t("(1) This led to more birthday parties.  (2) But around the mid-19th century, things changed.", { size: 19, bold: true })], { after: 0 }),
], { w: W, shade: COOL, b: { top: bd(12, NAVY), bottom: bd(4, GOLD), left: NOB, right: NOB }, m: { top: 74, bottom: 74, left: 250, right: 250 } })] })]));
K.push(sp(68));
Hs("독해 01   제목   ·   정답 \u2460");
B("이 글은 생일 축하가 100년 남짓의 짧은 역사를 지녔다는 사실(문장 3)과 그 변화 과정을 설명한다. 소재와 특징을 함께 담은 \u2460이 제목으로 적절하다. \u2461\u00b7\u2462는 본문 일부만 건드린 지엽적 오답, \u2463\u00b7\u2464는 본문과 무관하다.", true);
Hs("독해 02   내용 불일치   ·   정답 \u2462");
B("문장 6에서 대부분의 사람들은 자기 생일이 아니라 조지 워싱턴의 생일을 기념했다고 했으므로 \u2462는 본문과 반대된다. \u2460은 문장 3, \u2461은 문장 5, \u2463은 문장 10, \u2464는 문장 11에서 확인된다.", true);
Hs("독해 03   지칭 추론   ·   정답 \u2460");
B("(A) this tradition은 앞의 문장 1\u20132가 말한 \u2018생일을 축하하는 일\u2019을 가리킨다. 문장 3은 그 축하 문화가 겨우 100년 전에 시작됐다는 뜻이므로 답은 celebrating birthdays다.", true);
Hs("독해 04   배열 영작   ·   Birthday celebrations feel like a very old tradition.");
B("문장 2를 그대로 복원하는 문제다. \u2460 주어 Birthday celebrations는 복수 \u2014 동사는 feel.   \u2461 feel like+명사는 \u2018~처럼 느껴지다\u2019.   \u2462 a very old tradition \u2014 관사\u00b7부사\u00b7형용사 순서에 주의.", true);
Hs("STEP 1   소재와 핵심어   ·   1-1 \u2461     1-2 birthday parties \u00b7 short history \u00b7 big part     1-3 아래 참조");
B("1-1   정답 \u2461. 이 글은 생일 축하가 언제 어떻게 지금의 모습이 되었는지를 시간 순서로 설명한다. \u2460 조지 워싱턴은 예시일 뿐이고, \u2462 케이크 만드는 법은 나오지 않는다.");
B("1-2   \u25cb표 할 세 가지: birthday parties(힌트\u2460 주인공) \u00b7 short history(힌트\u2461 뜻밖의 사실) \u00b7 big part(힌트\u2462 오늘날의 위치). 나머지 셋(candle \u00b7 George Washington \u00b7 cards)은 본문에 나오지만 변화의 사례일 뿐 주제문에는 들어가지 않는다.");
B("1-3   문장 3 \u2014 this tradition은 \u2018생일 축하하기\u2019에 \u25cb.   문장 9 \u2014 This는 \u2018관심이 커진 것\u2019에 \u25cb (문장 8 전체를 대신한다).   문장 12 \u2014 they는 birthday parties에 \u25cb.");
B("[학습 포인트]   문장 9의 This가 이 지문의 백미다. 지시어는 단어 하나만이 아니라 앞 문장 전체를 통째로 대신하기도 한다. 만날 때마다 화살표로 연결해 두는 습관이 고등 지칭 추론 문항으로 이어진다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "5단계 훈련 STEP 2 \u2013 5", CHAR, "\u2713"));
K.push(sp(190));
Hs("STEP 2   글의 흐름   ·   2-1 반전 / 예시 / 결과 / ~일지라도     2-2 [B] 과거 \u00b7 [E] 마무리     2-3 \u2460");
B("2-1   문장 3 But \u2014 오래된 전통 같다는 앞말을 뒤집는 \u2018반전\u2019.   문장 6 For example \u2014 앞 문장의 \u2018예시\u2019.   문장 8 so \u2014 아이 수가 줄어든 일의 \u2018결과\u2019.   문장 12 Even though \u2014 \u2018~일지라도\u2019.");
B("2-2   [B] 과거(문장 5\u20136: 19세기 이전의 생일), [E] 마무리(문장 12\u201313: 오늘날의 의미). 보기의 \u2018광고\u2019는 이 글에 없는 역할이다. [A] 도입 \u2192 [B] 과거 \u2192 [C] 변화 \u2192 [D] 새 풍습 \u2192 [E] 마무리 \u2014 시간 순서로 설명하는 글의 전형이다.");
B("2-3   정답 \u2460. 생일 축하라는 대상을 소개하고 그 유래와 변화를 사실 위주로 알려 주는 설명문이다. \u2461 하루의 일과도, \u2462 사라는 말도, \u2463 안부 인사도, \u2464 상상 속 인물도 없다.");
B("[학습 포인트]   But이 문장 3과 7에 두 번 나오는 것에 주목하자. 설명문에서 But은 \u2018지금부터가 진짜 하고 싶은 말\u2019이라는 신호다. 연결어만 표시해도 글의 지도가 그려진다.", true);
Hs("STEP 3   주제문 만들기   ·   3-1 short \u00b7 big     3-3 (c) \u2192 (b) \u2192 (a) \u2192 (d)");
B("3-1  재료 찾기 \u2014 (2) 문장 12에서 short에 \u25cb: 100년 남짓이니 long이 아니다. (3) 문장 12에서 big에 \u25cb: 오늘날 우리 삶의 \u2018큰\u2019 부분이다. 주제문의 재료는 언제나 본문 안에 있다.");
B("3-2  뼈대 채우기 \u2014 (1) birthday parties  (2) short  (3) big.  넣으면 Birthday parties have a short history, but they are now a big part of our lives.가 완성된다.");
B("3-3  정답 순서 \u2014 \u24D2 birthday parties have \u2192 \u24D1 a short history, \u2192 \u24D0 but they are now \u2192 \u24D3 a big part of our lives.");
B("[채점 포인트]  주어 덩어리(\u24D2)가 맨 앞, 마침표가 붙은 덩어리(\u24D3)가 맨 뒤 \u2014 이 두 자리만 잡으면 콤마로 끝나는 \u24D1과 but으로 시작하는 \u24D0의 순서는 저절로 정해진다.", true);
Hs("STEP 4   요약문   ·   (1) heroes  (2) attention  (3) cards  (4) part");
B("(1)은 문장 5의 heroes, (2)는 문장 8의 attention, (3)은 문장 11의 cards, (4)는 문장 12의 part에서 가져온다. 요약문이 곧 이 글의 흐름이다: 과거(1) \u2192 변화(2) \u2192 새 풍습(3) \u2192 오늘(4).", true);
Hs("STEP 5   같은 뜻 찾기   ·   문장 3 \u2460   문장 5 \u2461   문장 8 \u2461   문장 11 \u2460  (정답 선지는 무표시)");
B("문장 3 only started this tradition around 100 years ago   \u2460 \u25cb 겨우 한 세기쯤 전에 시작했다.   \u2461 \u2715 [반대] 수천 년간 이어 왔다 \u2014 정반대.   \u2462 \u2715 [무관] 다른 나라에서 배웠다는 말은 없다.");
B("문장 5 only for rich people or national heroes   \u2460 \u2715 [반대] 나라의 모든 사람을 위한 것 \u2014 정반대.   \u2461 \u25cb 부유하거나 유명한 사람들만.   \u2462 \u2715 [무관] 열 살 미만 아이라는 말은 지문에 없다.");
B("문장 8 each kid was able to get more attention   \u2460 \u2715 [반대] 아이마다 보살핌이 줄었다 \u2014 정반대.   \u2461 \u25cb 아이마다 더 많은 보살핌을 받을 수 있었다.   \u2462 \u2715 [무관] 더 열심히 일했다는 말은 없다.");
B("문장 11 giving birthday cards also became common   \u2460 \u25cb 카드를 보내는 일도 널리 퍼졌다.   \u2461 \u2715 [반대] 거의 사라졌다 \u2014 정반대.   \u2462 \u2715 [무관] 카드값이 비싸졌다는 말은 지문에 없다.");
B("[학습 포인트]  시험은 본문 표현을 그대로 쓰지 않고 반드시 바꿔서 묻는다. become common \u2192 grow popular, was able to \u2192 could처럼 \u2018같은 뜻 다른 말\u2019을 스스로 만들어 보는 연습이 곧 대비다.", true);

K.push(brk());
K.push(...tab("정답 및 해설", "RE:RIGHT R1 \u2013 R7 \u00b7 전문 해석", CHAR, "\u2713"));
K.push(sp(190));
Hs("R1   True / False   ·   1 T \u00b7 2 F \u00b7 3 T \u00b7 4 F \u00b7 5 T \u00b7 6 F \u00b7 7 T \u00b7 8 F");
B("1 T \u2014 문장 1.   2 F \u2014 문장 3: 1,000년이 아니라 약 100년 전이다.   3 T \u2014 문장 5.   4 F \u2014 문장 6: 자기 생일이 아니라 조지 워싱턴의 생일을 기념했다.   5 T \u2014 문장 7\u00b78.   6 F \u2014 문장 8: 관심이 줄어든 것이 아니라 더 많아졌다.   7 T \u2014 문장 10.   8 F \u2014 문장 11: 19세기 초가 아니라 19세기 말이다.  거짓 문장은 모두 딱 한 요소(1,000년 \u00b7 their own \u00b7 less \u00b7 start)만 비튼 것이다.", true);
Hs("R2   사건 순서   ·   (b) \u2192 (a) \u2192 (d) \u2192 (c)");
B("\u24D1 부자와 국가적 영웅만 생일을 기념했다(문장 5, 19세기 이전) \u2192 \u24D0 가족의 아이 수가 줄었다(문장 8, 19세기 중반) \u2192 \u24D3 케이크 한가운데 큰 초를 꽂기 시작했다(문장 10) \u2192 \u24D2 생일 카드가 흔해졌다(문장 11, 19세기 말). 이 글은 시간 순서 그대로 서술되어 있다.", true);
Hs("R3   영영풀이   ·   1 (e) \u00b7 2 (a) \u00b7 3 (d) \u00b7 4 (f) \u00b7 5 (c) \u00b7 6 (b)");
B("celebrate = 중요한 날을 특별하게 보내다 \u00b7 tradition = 오래 이어 온 방식 \u00b7 hero = 많은 사람이 우러르는 사람 \u00b7 attention = 지켜보고 마음 쓰는 일 \u00b7 common = 흔한 \u00b7 lead to = ~을 일으키다.", true);
Hs("R4   어법 기초   ·   (1) feel  (2) was  (3) to put  (4) Giving");
B("(1) 주어 Birthday celebrations는 복수 \u2014 feel.   (2) each+단수 명사는 하나로 세므로 was.   (3) start 뒤에는 to+동사원형 \u2014 to put.   (4) 주어 자리에는 동사원형이 아니라 동명사 \u2014 Giving. 2면 구문 카드의 그 문장이다.", true);
Hs("R5   빈칸 클로즈   ·   (1) tradition (2) celebrate (3) heroes (4) attention (5) candle (6) cards (7) history (8) part");
B("빈칸 8개는 모두 이 유닛의 핵심어와 어휘다. 빈칸 앞뒤가 단서다: a very old ___ \u2190 전통, national ___ \u2190 영웅, a big ___ \u2190 초, a short ___ \u2190 역사. 채우고 나면 지문 한 편을 처음부터 끝까지 다시 읽은 셈이 된다.", true);
Hs("R6   해석 쓰기   ·   모범 답안");
B("(1) 가족들이 아이를 더 적게 낳기 시작했고, 그래서 아이 한 명 한 명이 더 많은 관심을 받을 수 있었다.  \u2014 be able to를 \u2018~할 수 있었다\u2019로 옮기는 것이 핵심이다.");
B("(2) 생일 파티는 짧은 역사를 지녔지만, 이제는 우리 삶의 큰 부분이다.  \u2014 Even though를 \u2018~이지만/~일지라도\u2019로 자연스럽게 옮긴다.", true);
Hs("R7   조건 영작   ·   (1) This led to more birthday parties.  (2) But around the mid-19th century, things changed.");
B("(1) 문장 9의 복원. \u3131 첫 글자 대문자 This  \u3134 lead의 과거형은 led  \u3137 more birthday parties의 어순에 주의.");
B("(2) 문장 7의 복원. \u3131 첫 글자 대문자 But  \u3134 century 뒤의 콤마를 빠뜨리지 않는다  \u3137 things changed로 문장이 끝난다.", true);
K.push(sp(70));
K.push(T([W], [new TableRow({ children: [cel([
  p([t("전문 해석", { size: 16, bold: true, color: NAVY })], { after: 72 }),
  p([t("1 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("우리는 모두 \u201CHappy Birthday\u201D 노래를 알고, 생일 파티에서 그 노래를 부른다.  ", { size: 17, color: SUB }),
     t("2 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("생일 축하는 아주 오래된 전통처럼 느껴진다.  ", { size: 17, color: SUB }),
     t("3 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("하지만 사람들은 이 전통을 겨우 100년쯤 전에 시작했다!  ", { size: 17, color: SUB }),
     t("4 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그렇다면 과거에 사람들은 생일을 어떻게 기념했을까?  ", { size: 17, color: SUB }),
     t("5 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("19세기 이전 미국에서, 생일 축하는 부유한 사람들이나 국가적 영웅만을 위한 것이었다.  ", { size: 17, color: SUB }),
     t("6 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("예를 들어, 대부분의 사람들은 자기 생일이 아니라 조지 워싱턴의 생일을 기념하곤 했다.  ", { size: 17, color: SUB }),
     t("7 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그런데 19세기 중반 무렵, 상황이 바뀌었다.  ", { size: 17, color: SUB }),
     t("8 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("가족들이 아이를 더 적게 낳기 시작했고, 그래서 아이 한 명 한 명이 더 많은 관심을 받을 수 있었다.  ", { size: 17, color: SUB }),
     t("9 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("이것은 더 많은 생일 파티로 이어졌다.  ", { size: 17, color: SUB }),
     t("10 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("아이들의 생일에, 가족들은 케이크 한가운데에 큰 초를 하나 꽂기 시작했다.  ", { size: 17, color: SUB }),
     t("11 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("19세기 말에 이르러서는, 생일 카드를 주는 것도 흔한 일이 되었다.  ", { size: 17, color: SUB }),
     t("12 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("생일 파티는 짧은 역사를 지녔지만, 이제는 우리 삶의 큰 부분이다.  ", { size: 17, color: SUB }),
     t("13 ", { size: 13, bold: true, color: NAVY2, sup: true }), t("그것은 우리가 친구와 가족을 얼마나 사랑하는지 보여 줄 수 있다.", { size: 17, color: SUB })], { line: 290, after: 0, align: AlignmentType.JUSTIFIED }),
], { w: W, shade: PAPER, b: { top: bd(10, NAVY), bottom: bd(4, HAIR), left: NOB, right: NOB }, m: { top: 150, bottom: 150, left: 250, right: 250 } })] })]));

/* ═══════════ 판면 ═══════════ */
  },
};
