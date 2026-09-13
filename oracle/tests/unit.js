// 순수 모듈 단위 검사 — 빌드된 HTML 에서 구획을 잘라 Node 에서 돌린다
const fs = require("fs"), path = require("path");
const FILE = process.env.ORACLE_FILE || path.join(__dirname, "..", "..", "public", "orun-oracle.html");
const src = fs.readFileSync(FILE, "utf8");
const cut = (name, next) => { const a = src.indexOf("  const " + name + " = (function () {"); const b = src.indexOf("  const " + next + " = (function () {"); if (a < 0 || b < 0) throw new Error("module " + name); return src.slice(a, b); };
const body = ["TEXT:PROMPTS", "PROMPTS:ANALYZE", "ANALYZE:PROFILE", "PROFILE:PREDICT", "PREDICT:GENERATE"].map(x => cut(...x.split(":"))).join("\n") + src.slice(src.indexOf("  const GENERATE = (function () {"), src.indexOf("  function makePost("));
const API = { err: (c, m) => { const e = new Error(m); e.code = c; return e; }, ready: () => false, totals: {} };
const { TEXT, ANALYZE, PROFILE, PREDICT, GENERATE } = new Function("crypto", "TextEncoder", "API", "JSZip", body + ";return {TEXT,ANALYZE,PROFILE,PREDICT,GENERATE};")(globalThis.crypto, TextEncoder, API, {});
let n = 0, bad = 0; const ok = (c, m) => { n++; if (c) console.log("ok  ", m); else { bad++; console.log("FAIL", m); } };
// TEXT
const sample = fs.readFileSync(__dirname + "/fixtures/exam1.txt", "utf8");
const sp = TEXT.splitByQuestion(TEXT.normalizeExam(sample));
ok(sp.numbers.length === 7 && sp.numbers[6] === "서술형 1", "splitByQuestion 7 blocks (" + sp.numbers.join(",") + ")");
ok(Object.keys(TEXT.parseAnswerKey(sp.answerKeyText)).length >= 6, "parseAnswerKey");
ok(TEXT.guessKind("x.pdf", sample).kind === "exam" && TEXT.guessKind("교과서.txt", fs.readFileSync(__dirname + "/fixtures/scope.txt", "utf8")).kind === "scope", "guessKind exam/scope");
const meta = TEXT.guessExamMeta(sample, "2025_1학기_중간.pdf", { grade: 1, subject: "영어", school: "동작고" });
ok(meta.year === 2025 && meta.semester === 1 && meta.term === "중간" && meta.grade === 1, "guessExamMeta " + JSON.stringify(meta));
ok(TEXT.splitByQuestion("01. 다음 글의 주제는?\nA b c.\n02) 다음\nx\n[3~4] 다음 글을 읽고\n3. 윗글\n4. 윗글\n").numbers.join(",") === "1,2,3,4", "numbering variants 01. / 02) / [3~4]");
ok(TEXT.templateOf("다음 글의 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은? [3점]") === "다음 글의 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은? [#점]", "templateOf");
ok(TEXT.chunkByQuestions(sp.blocks, 800).every(c => c.text.length <= 2500), "chunkByQuestions");
ok(TEXT.englishOnly("3. 다음 글의 빈칸에 When people talk ______ ① joy").startsWith("3. When people talk"), "englishOnly");
// ANALYZE normalize
const q = ANALYZE.normalizeQuestion({ number: "12", type: "빈칸", format: "5지선다", options: [{ label: "①", text: "a" }], passage: { has: true, first10: "x y z" }, transformation: {}, distractor: {}, ko_stem: {} }, { block: "12. 발문 [3점]" });
ok(q.options.length === 5 && q.optionsIncomplete && q.points === 3 && q.pointsPrinted, "normalizeQuestion fills options/points");
ok(ANALYZE.normalizeQuestion({ number: "", type: "빈칸" }, {}) === null, "normalizeQuestion drops empty number");
const loc = ANALYZE.aiLocal({ ocr: false }, [], "", []);
ok(loc.coverage === 0 && loc.local === 0.5 && loc.signals.length === 11 && loc.signals.every(x => !x.available), "aiLocal with no questions is neutral");
ok(ANALYZE.combineAI(loc, null, 0).band[0] >= 0 && ANALYZE.combineAI(loc, null, 0).band[1] <= 1, "combineAI band clamped");
// PROFILE tiny data
const e1 = { id: "e1", meta: { year: 2025, semester: 1, term: "중간" }, analysis: {} };
const q1 = Object.assign(ANALYZE.normalizeQuestion({ number: "1", type: "주제", format: "5지선다", stem: "다음 글의 주제는?", options: [], passage: { has: true, first10: "a b c d e f" }, transformation: {}, distractor: {}, ko_stem: {} }, {}), { examId: "e1", order: 1 });
const p1 = PROFILE.build({ exams: [e1], questions: [q1], passages: [] });
ok(p1.basedOn.nQuestions === 1 && p1.consistency.overall === null && p1.reliability >= 0 && p1.level.id === 0, "PROFILE.build with 1 question: " + p1.reliability);
ok(PROFILE.build({ exams: [], questions: [], passages: [] }).basedOn.nQuestions === 0, "PROFILE.build with nothing");
ok(JSON.stringify(PROFILE.compact(p1)).length < 4000, "compact profile small");
// PREDICT tiny data
const bp = PREDICT.blueprint({ profile: p1, passages: [{ id: "P1", kind: "지문", text: "a", words: 100, feats: [], genre: "설명문", posRatio: 0.5, topicIdx: -1, blankCandidates: [], grammarTargets: [] }], questions: [q1], exams: [e1], target: { label: "t" } });
ok(bp.plan.total >= 1 && bp.passages.length === 1 && bp.passages[0].pUse > 0 && bp.passages[0].pUse <= 1, "blueprint with 1 passage: " + JSON.stringify(bp.plan));
ok(PREDICT.copyText(bp, { name: "n", school: "s", grade: 1, subject: "e" }, p1, [], null).length < 1800, "copyText length");
const items = GENERATE.plan({ bp, profile: p1, passages: [{ id: "P1", kind: "지문", src: "L1", text: "a", words: 100, feats: [], genre: "설명문", posRatio: 0.5, lessonKey: "L1" }], questions: [q1] });
ok(items.length === bp.plan.total && items.every(it => it.passage || it.setRole === "member"), "GENERATE.plan assigns passages to every item (" + items.length + ")");
ok(GENERATE.sanitize('<p onclick="x">a</p><script>b</script><u>c</u><a href="javascript:1">d</a>') === "<p>a</p><u>c</u>d", "sanitize strips tags/attrs/scripts");
ok(GENERATE.validate({ stem: "다음 글의 순서로 가장 적절한 것은?", options: ["① (A)-(C)-(B)", "② (B)-(A)-(C)", "③ (B)-(C)-(A)", "④ (C)-(A)-(B)", "⑤ (C)-(B)-(A)"], answer: "③", passage_html: "<p>" + "word ".repeat(40) + "</p>" }, { format: "5지선다", type: "순서", setRole: "" }, { text: "word ".repeat(40) }) === "", "validate order question");
ok(GENERATE.validate({ stem: "다음 글의 주제로 가장 적절한 것은?", options: ["① a", "② b", "③ c", "④ d", "⑤ e"], answer: "①", passage_html: "<p>" + "word ".repeat(40) + "</p>" }, { format: "5지선다", type: "주제", setRole: "" }, null) === "지문 배정 없음", "validate rejects missing passage");
ok(GENERATE.validate({ stem: "x", options: ["① a", "② a", "③ b", "④ c", "⑤ d"], answer: "①", passage_html: "" }, { format: "5지선다", type: "주제", setRole: "" }, null) !== "", "validate rejects short stem/duplicate options");
console.log(bad ? "UNIT FAILED " + bad + "/" + n : "UNIT ALL PASSED " + n);
process.exitCode = bad ? 1 : 0;
