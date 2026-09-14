// 순수 모듈 단위 검사 — 빌드된 HTML 에서 구획을 잘라 Node 에서 돌린다
// 구획: DB(30) · TEXT…GENERATE(33~38) · SYNC(39) · INDEX · LINKS · NOTES · ASK(42~45, IIFE 시점에 window/document/localStorage 를 만지지 않는다)
const fs = require("fs"), path = require("path");
const FILE = process.env.ORACLE_FILE || path.join(__dirname, "..", "..", "public", "orun-oracle.html");
const src = fs.readFileSync(FILE, "utf8");
const cut = (name, next) => { const a = src.indexOf("  const " + name + " = (function () {"); const b = src.indexOf("  const " + next + " = (function () {"); if (a < 0 || b < 0) throw new Error("module " + name); return src.slice(a, b); };
const between = (from, to) => { const a = src.indexOf(from), b = src.indexOf(to); if (a < 0 || b < 0) throw new Error("marker " + from + " / " + to); return src.slice(a, b); };
// 진짜 DB 모듈(30-db)은 IndexedDB 가 없어도 IIFE 는 돌므로 계약(VERSION · STORES · 함수 이름)만 따로 본다
const realDB = new Function(cut("DB", "EXTRACT") + ";return DB;")();
// 나머지는 메모리 DB 스텁을 DB 로 넣어 돌린다 — NOTES · LINKS · ASK · SYNC.bootstrap 의 저장 흐름까지 Node 에서 검사한다 (uid 는 30-db 의 것)
function fakeDB() {
  const stores = {}, hooks = [];
  const S = (s) => stores[s] || (stores[s] = new Map());
  const key = (s) => s === "settings" || s === "media" ? "key" : "id";
  const fire = (ev) => hooks.forEach(fn => fn(ev));
  const api = {
    STORES: realDB.STORES.slice(), VERSION: 2, onWrite: (fn) => { hooks.push(fn); return () => {}; },
    get: async (s, k) => S(s).get(k), getMany: async (s, ids) => (ids || []).map(id => S(s).get(id)).filter(Boolean),
    put: async (s, v, silent) => { S(s).set(v[key(s)], v); fire({ op: "put", store: s, docs: [v], keys: [v[key(s)]], silent: !!silent }); return v; },
    putAll: async (s, vs, silent) => { vs.forEach(v => S(s).set(v[key(s)], v)); if (vs.length) fire({ op: "put", store: s, docs: vs, keys: vs.map(v => v[key(s)]), silent: !!silent }); return vs.length; },
    del: async (s, k) => { S(s).delete(k); fire({ op: "del", store: s, keys: [k], silent: false }); return true; },
    delWhere: async (s, idx, v) => { const ks = [...S(s).values()].filter(d => d[idx] === v).map(d => d[key(s)]); ks.forEach(k => S(s).delete(k)); if (ks.length) fire({ op: "del", store: s, keys: ks, silent: false }); return ks.length; },
    all: async (s) => [...S(s).values()], where: async (s, idx, v) => [...S(s).values()].filter(d => d[idx] === v),
    range: async (s, idx, lo, hi) => [...S(s).values()].filter(d => d[idx] >= lo && d[idx] <= hi),
    count: async (s, idx, v) => idx ? [...S(s).values()].filter(d => d[idx] === v).length : S(s).size,
    clear: async (s) => { const ks = [...S(s).keys()]; S(s).clear(); fire({ op: "clear", store: s, keys: ks, silent: false }); return true; },
    setting: async (k, fb) => { const r = S("settings").get(k); return r ? r.value : fb; }, setSetting: (k, v) => api.put("settings", { key: k, value: v }),
    wipe: async () => { for (const s of Object.keys(stores)) await api.clear(s); }, _s: S,
  };
  return api;
}
const DB = fakeDB();
const body = src.slice(src.indexOf("  function uid(prefix) {"), src.indexOf("  const EXTRACT = (function () {")) + "\n" +
  ["TEXT:PROMPTS", "PROMPTS:ANALYZE", "ANALYZE:PROFILE", "PROFILE:PREDICT", "PREDICT:GENERATE", "GENERATE:SYNC"].map(x => cut(...x.split(":"))).join("\n") +
  between("  const SYNC = (function () {", "  function makePost(") + "\n" +
  cut("INDEX", "LINKS") + cut("LINKS", "NOTES") + cut("NOTES", "ASK") + between("  const ASK = (function () {", "  function makeGraph2D(");
const apiCalls = [];
const API = { err: (c, m) => { const e = new Error(m); e.code = c; return e; }, ready: () => false, totals: {}, modelLabel: () => "mock", provider: () => "anthropic",
  call: async (prompt, o) => { apiCalls.push({ prompt, o }); if (API.fail) throw API.fail; const text = API.reply || "답 [1]\nUSED: 1\nFOLLOWUP: a | b"; if (o && o.onText) o.onText({ text, delta: text }); return { text, model: "mock-model", usage: {} }; } };
const M = new Function("crypto", "TextEncoder", "API", "JSZip", "DB", body + ";return {SYNC,TEXT,PROMPTS,ANALYZE,PROFILE,PREDICT,GENERATE,INDEX,LINKS,NOTES,ASK};")(globalThis.crypto, TextEncoder, API, {}, DB);
const { SYNC, TEXT, PROMPTS, ANALYZE, PROFILE, PREDICT, GENERATE, INDEX, LINKS, NOTES, ASK } = M;
let n = 0, bad = 0; const ok = (c, m) => { n++; if (c) console.log("ok  ", m); else { bad++; console.log("FAIL", m); } };
(async () => {
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
// PROMPTS memo
ok(PROMPTS.dataize("1. x", { i: 1, n: 1, numbers: ["1"], prevNumbers: [], carry: "", memo: "2학기 기말이에요" }).includes("[사용자 메모") && PROMPTS.dataize("1. x", { i: 1, n: 1, numbers: ["1"], prevNumbers: [], carry: "" }).indexOf("[사용자 메모") < 0, "dataize prompt carries the user memo only when given");
ok(PROMPTS.index("a", "b", 1, 1, "x".repeat(700)).indexOf("x".repeat(601)) < 0 && PROMPTS.indexHandout("a", "b", 1, 1, "메모").includes("메모\n\n[프린트 텍스트]") && PROMPTS.classify("a", "b", "메모").includes("[사용자 메모"), "memo is clipped to 600 chars and precedes the text block in index/handout/classify prompts");
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

// ===== 세컨드 브레인 (spec §8.12) =====
// DB · SYNC 계약
ok(realDB.VERSION === 2 && ["notes", "links", "tags"].every(s => realDB.STORES.includes(s)) && realDB.STORES.length === 14 && typeof realDB.onWrite === "function" && typeof realDB.range === "function" && typeof realDB.getMany === "function" && typeof realDB.open === "function", "DB v2: 14 stores incl. notes/links/tags · onWrite · range · getMany · open");
ok(await realDB.open().then(() => false, e => /IndexedDB/.test(e.message)), "DB.open rejects cleanly without IndexedDB");
ok(["notes", "links", "tags"].every(s => SYNC.STORES.includes(s)) && SYNC.PRIVATE.join() === "notes,links,tags" && SYNC.MERGE.join() === "notes,links,tags" && typeof SYNC.setPrivate === "function", "SYNC stores + PRIVATE + MERGE + setPrivate");
ok(SYNC.mergeRule({ updatedAt: 200 }, { updatedAt: 100 }) === "local" && SYNC.mergeRule({ updatedAt: 100 }, { updatedAt: 200 }) === "cloud" && SYNC.mergeRule({ updatedAt: 100 }, { updatedAt: 100 }) === "cloud" && SYNC.mergeRule(null, { updatedAt: 1 }) === "cloud" && SYNC.mergeRule({ createdAt: 5 }, null) === "local" && SYNC.mergeRule({ createdAt: 300 }, { updatedAt: 200 }) === "local", "SYNC.mergeRule: newer updatedAt wins, ties go to cloud, createdAt fallback");
// INDEX 토크나이저
const toks = INDEX.tokenize("빈칸에 들어갈 Habits");
ok(["빈칸", "칸에", "들어", "어갈", "habit"].every(t => toks.includes(t)), "tokenize 한글 2-gram + 영문 어간: " + toks.join(","));
ok(INDEX.tokenize("① 2025 Reading L3 #재출제 글 Lesson 3").sort().join(",") === ["2025", "read", "l3", "#재출제", "재출", "출제", "글", "lesson", "3"].sort().join(","), "tokenize: 원문자 버림 · 숫자 그대로(한 자리도) · ing 어간 · #태그 한 토큰(+이름 2-gram) · 1글자 덩어리: " + INDEX.tokenize("① 2025 Reading L3 #재출제 글 Lesson 3").join(","));
ok(INDEX.tokenize("The boxes wanted THIS").join(",") === "the,box,want,thi", "tokenize: es/ed 어간 · 소문자 (" + INDEX.tokenize("The boxes wanted THIS").join(",") + ")");
// INDEX BM25 — 제목 일치 > 본문 일치
const T0 = Date.now();
const ex = { id: "e_1", teacherId: "t_1", meta: { year: 2025, semester: 1, term: "중간", subject: "영어" }, analysis: { total: 2, summary: "요약" }, text: "When people talk about habits they mean repeated actions.", createdAt: T0 };
const pa = { id: "p_1", teacherId: "t_1", sourceId: "s_1", kind: "지문", src: "Lesson 3 · Reading 1", genre: "설명문", words: 120, gist: "습관의 힘", text: "Habits are repeated actions. When the law of habit applies, people repeat small actions daily.", sentences: ["Habits are repeated actions.", "When the law of habit applies, people repeat small actions daily."], feats: ["주장·요지 명확"], grammarTargets: [{ point: "수일치", sent: 1 }], topicIdx: 0, createdAt: T0 };
const pb = { id: "p_2", teacherId: "t_1", sourceId: "s_1", kind: "지문", src: "Lesson 4 · Reading 2", genre: "이야기", words: 90, gist: "여행 이야기", text: "A long journey begins with one step.", sentences: ["A long journey begins with one step."], feats: [], createdAt: T0 };
const qa = Object.assign(ANALYZE.normalizeQuestion({ number: "7", type: "빈칸", format: "5지선다", stem: "다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?", options: [{ label: "①", text: "to repeat small actions daily" }], passage: { has: true, first10: "Habits are repeated actions" }, transformation: { technique: "빈칸", blank_position: "마지막문장", blank_unit: "구" }, distractor: {}, ko_stem: {} }, {}), { id: "q_1", examId: "e_1", teacherId: "t_1", order: 1, createdAt: T0, match: { passageId: "p_1", sourceId: "s_1", method: "local", confidence: 0.96, score: 0.9 }, handoutHit: { kinds: ["지문"], sourceIds: ["s_2"] } });
const qb = Object.assign(ANALYZE.normalizeQuestion({ number: "8", type: "어법", format: "5지선다", stem: "다음 글의 밑줄 친 부분 중 어법상 틀린 것은?", options: [], passage: { has: true, first10: "A long journey" }, transformation: { technique: "밑줄어법", grammar_points: ["수일치"] }, distractor: {}, ko_stem: {} }, {}), { id: "q_2", examId: "e_1", teacherId: "t_1", order: 2, createdAt: T0 });
const sc = { id: "s_1", teacherId: "t_1", name: "교과서_시험범위", kind: "교과서", text: "Lesson 3 Reading 1 Habits are repeated actions.", passages: 2, createdAt: T0 };
const hd = { id: "s_2", teacherId: "t_1", name: "2025_1학기_중간_대비_프린트", kind: "프린트", target: { year: 2025, semester: 1, term: "중간", guessed: false }, items: [{ kind: "어법", text: "수일치 정리", point: "수일치" }], text: "어법 정리 프린트", passages: 1, reflection: { rate: 0.5, hit: 1, n: 2, exams: [] }, createdAt: T0 };
const tc = { id: "t_1", name: "윤은영", school: "흑석고", grade: 1, subject: "영어A", createdAt: T0 };
const nt = { id: "n_1", teacherId: "t_1", kind: "note", title: "겹침 정리", body: "작년과 같은 문장에서 빈칸. [[Lesson 3 · Reading 1]] 재출제 유력 #재출제", tags: ["재출제"], links: [{ text: "Lesson 3 · Reading 1", to: "p_1" }], anchorKey: "", anchor: null, createdAt: T0, updatedAt: T0 };
const an = { id: "n_2", teacherId: "t_1", kind: "anchor", anchorKey: "questions:q_1", anchor: { store: "questions", id: "q_1" }, title: "", body: "작년 재출제 #재출제 #어법", tags: ["재출제", "어법"], links: [], createdAt: T0, updatedAt: T0 };
const ALL = { teachers: [tc], exams: [ex], questions: [qa, qb], passages: [pa, pb], sources: [sc, hd], profiles: [], predictions: [], mocks: [], notes: [nt, an], links: [{ id: "lk_n_1~p_1~wiki", teacherId: "t_1", from: "n_1", to: "p_1", kind: "wiki", text: "Lesson 3 · Reading 1", createdAt: T0, updatedAt: T0 }] };
await INDEX.rebuild(ALL);
ok(INDEX.state.ready && !INDEX.state.building && INDEX.state.progress === 1 && INDEX.state.n === 9, "INDEX.rebuild: ready · 9 docs (anchor 메모는 문서가 아니다): n=" + INDEX.state.n);
const qd = INDEX.get("q_1");
ok(qd && qd.title === "2025 1학기 중간 · 영어 · 7번" && qd.fields.memo === "작년 재출제 #재출제 #어법" && qd.userTags.join() === "재출제,어법" && qd.derivedTags.includes("빈칸") && qd.derivedTags.includes("프린트적중"), "docOf question: 제목 = 시험 · 번호 · anchor 메모가 memo 필드로 · 파생 태그: " + (qd && qd.title));
const r1 = INDEX.search("Lesson 3 Reading");
ok(r1.length >= 2 && r1[0].id === "p_1" && r1.findIndex(x => x.id === "s_1") > r1.findIndex(x => x.id === "p_1"), "BM25: title match (p_1) ranks above body match (s_1 has the same words in its text): " + r1.map(x => x.id + ":" + x.score).join(" "));
const r2 = INDEX.search("재출제", { teacherId: "t_1" });
ok(r2.length >= 2 && r2.every(x => ["n_1", "q_1"].includes(x.id)) && r2.every(x => x.matched.includes("재출")) && INDEX.search("#재출제").every(x => x.matched.includes("#재출제")) && INDEX.search("#재출제").length >= 2, "search: 메모 태그 · 자유 메모 둘 다 · #태그 질의는 #토큰으로 (" + r2.map(x => x.id).join(",") + ")");
ok(INDEX.search("어법", { kinds: ["question"] }).every(x => x.kind === "question") && INDEX.search("어법", { kinds: ["question"] }).length >= 1, "search kinds filter");
ok(INDEX.search("빈칸", { teacherId: "t_9", strict: true }).length === 0 && INDEX.search("빈칸", { teacherId: "t_1", strict: true }).length >= 1, "search strict teacher scope");
ok(INDEX.prefix("les", { teacherId: "t_1" })[0].id === "p_1" && INDEX.prefix("reading 2")[0].id === "p_2", "prefix: 접두 → 포함 순 (" + INDEX.prefix("les").map(x => x.title).join(" | ") + ")");
const g1 = INDEX.grep("the law of habit");
ok(g1.length === 1 && g1[0].id === "p_1" && g1[0].pos === 34 && /law of habit/i.test(g1[0].snippet), "grep: 원문 substring · pos · snippet: " + JSON.stringify(g1[0] && { pos: g1[0].pos, match: g1[0].match }));
ok(INDEX.grep("\"habits are repeated\"").map(x => x.id).join() === "p_1,s_1" && INDEX.grep("about habits")[0].id === "e_1" && INDEX.grep("habits are repeated", { teacherId: "t_2" }).length === 0, "grep: 따옴표 벗기기 · 대소문자 무시 · 지문 → 자료 → 시험 순 · 선생님 범위");
ok(INDEX.titles({ teacherId: "t_1" }).length === 9 && INDEX.recent({ limit: 3 }).length === 3, "titles · recent");
// INDEX 증분 — upsert / remove / anchor 메모 갱신
INDEX.upsert("notes", Object.assign({}, an, { body: "고친 메모 #수정", tags: ["수정"], updatedAt: T0 + 1 }));
ok(INDEX.get("q_1").fields.memo === "고친 메모 #수정" && INDEX.get("q_1").userTags.join() === "수정" && INDEX.search("수정")[0].id === "q_1", "upsert(anchor memo) refreshes the anchored doc's memo/tags");
INDEX.upsert("exams", Object.assign({}, ex, { meta: { year: 2025, semester: 2, term: "기말", subject: "영어" } }));
ok(INDEX.get("q_1").title === "2025 2학기 기말 · 영어 · 7번", "upsert(exam) renames its questions: " + INDEX.get("q_1").title);
INDEX.remove("n_2");
ok(INDEX.get("q_1").fields.memo === "" && INDEX.state.n === 9, "remove(anchor note id) clears the memo field");
INDEX.upsert("notes", an);
// LINKS 파생 · 백링크 · 그래프 · resolve
LINKS.rebuild(ALL);
const dq = LINKS.derived("q_1");
ok(dq.filter(e => e.from === "q_1").map(e => e.kind).sort().join() === "belongs,hit,match" && LINKS.derived("q_2").filter(e => e.from === "q_2").map(e => e.kind).join() === "belongs", "LINKS.derived: q_1 → belongs · match · hit, q_2 → belongs (" + dq.map(e => e.kind).join(",") + ")");
const tiny = (() => { const e = { id: "e_t", teacherId: "t_t", meta: { year: 2024, semester: 1, term: "중간" } }; const p = { id: "p_t", teacherId: "t_t", src: "L1", kind: "지문", sourceId: "s_t" }; const qq = { id: "q_t", teacherId: "t_t", examId: "e_t", number: "1", type: "주제", match: { passageId: "p_t", method: "local", confidence: 0.9 } }; return { exams: [e], passages: [p], questions: [qq] }; })();
LINKS.rebuildTeacher("t_t", tiny);
ok(LINKS.derived("q_t").length === 2 && LINKS.derived("q_t").map(e => e.kind).sort().join() === "belongs,match", "LINKS.derived tiny data (문항 1 · 시험 1 · 지문 1): belongs · match 2건");
ok(LINKS.backlinks("p_t").some(b => b.from === "q_t" && b.kind === "match" && /AUTO 90%/.test(b.label)), "backlinks(p1) has q1 with reason: " + JSON.stringify(LINKS.backlinks("p_t")));
ok(LINKS.backlinks("p_1").some(b => b.from === "n_1" && b.kind === "wiki" && b.user) && LINKS.backlinks("p_1").some(b => b.from === "q_1" && b.kind === "match"), "backlinks = 파생 역방향 ∪ 사용자 링크(to === id)");
ok(LINKS.backlinks("t_1").length === 0 && LINKS.outlinks("q_1").every(o => o.kind !== "owner") && LINKS.outlinks("q_1").some(o => o.to === "e_1" && o.title === "2025 1학기 중간 · 영어"), "owner 간선은 백링크 · 아웃링크에 없다");
ok(LINKS.backlinks("e_1").some(b => b.from === "s_2" && b.kind === "targets") && LINKS.backlinks("q_1").some(b => b.from === "n_2" && b.kind === "anchor"), "프린트 → 시험(targets) · anchor 노트 → 문항");
const nb = LINKS.neighbors("p_1", 1);
ok(nb.nodes.includes("q_1") && nb.nodes.includes("s_1") && nb.nodes.includes("n_1") && !nb.nodes.includes("t_1") && nb.edges.every(e => e[2] !== "owner"), "neighbors 1홉: " + nb.nodes.join(","));
ok(LINKS.neighbors("p_1", 2).nodes.includes("e_1") && !LINKS.neighbors("p_1", 1).nodes.includes("e_1"), "neighbors 2홉 reaches the exam through the question");
const gr = LINKS.graph("t_1");
ok(gr.nodes.length === 8 && gr.nodes.every(x => ["exam", "passage", "handout", "question", "note"].includes(x.kind)) && !gr.nodes.some(x => x.id === "s_1") && gr.edges.some(e => e[2] === "match") && gr.edges.every(e => e[2] !== "owner" || e[1] === "t_1"), "graph(t_1): 8 nodes (범위 자료 · 선생님 제외) · owner 는 고립 노드만: " + gr.nodes.map(x => x.kind).join(","));
ok(gr.nodes.find(x => x.id === "q_1").hit === true && gr.nodes.find(x => x.id === "p_1").size === 2 && gr.nodes.find(x => x.id === "e_1").size === 3, "graph sizes · hit");
ok(LINKS.graph("t_1", { kinds: ["passage"] }).nodes.length === 2 && LINKS.graph("t_1", { focus: "p_1", hops: 1 }).nodes.map(x => x.id).sort().join() === "n_1,p_1,q_1" && LINKS.graph("t_1", { focus: "p_2", hops: 1 }).nodes.map(x => x.id).join() === "p_2", "graph kinds filter · focus 1홉 (" + LINKS.graph("t_1", { focus: "p_1", hops: 1 }).nodes.map(x => x.id).join(",") + ")");
const rs = [LINKS.resolve("lesson 3 · reading 1", "t_1"), LINKS.resolve("아무거나", "t_1", "p_2"), LINKS.resolve("Lesson 3 · Reading 2", "t_1"), LINKS.resolve("Lesson 4 - Reading 2", "t_1"), LINKS.resolve("없는 제목", "t_1")];
ok(rs[0] && rs[0].id === "p_1" && rs[1] && rs[1].id === "p_2" && rs[2] === null && rs[3] && rs[3].id === "p_2" && rs[4] === null, "resolve: 정확 일치(공백 · 대소문자 무시) → 캐시 id → Dice ≥ .8 후보 둘이면 null → 하나면 그것 → 없으면 null: " + JSON.stringify(rs.map(r => r && r.id)));
ok(LINKS.counts("t_1").nodes === 10 && LINKS.counts("t_1").edges >= 8 && LINKS.userLinks({ to: "p_1" }).length === 1, "counts · userLinks");
LINKS.remove("q_1");
ok(!LINKS.backlinks("p_1").some(b => b.from === "q_1") && LINKS.backlinks("p_1").some(b => b.from === "n_1"), "remove(q_1) drops derived edges, keeps user links");
LINKS.upsert("questions", qa);
ok(LINKS.backlinks("p_1").some(b => b.from === "q_1"), "upsert restores them");
// NOTES parse · render (XSS) · id 규약
const pr = NOTES.parse("[[A]] x #태그1 #tag-2");
ok(pr.links.length === 1 && pr.links[0].text === "A" && pr.tags.join() === "태그1,tag-2", "NOTES.parse: links 1 · tags 태그1,tag-2 (" + JSON.stringify(pr) + ")");
ok(NOTES.parse("[[#안의 해시]] a#b http://x/#frag #Real #real #a.").tags.join() === "real,a", "parse: [[…]] 안 · 단어 중간 · URL 조각은 태그가 아니고, 대소문자 · 끝 구두점은 정리");
const html = NOTES.render('<img onerror=1> [[A]] **b**', () => null);
ok(html.indexOf("<img") < 0 && html.includes("&lt;img onerror=1&gt;") && html.includes("<b>b</b>") && /class="broken"/.test(html), "render: esc 먼저 → <img 없음 · <b>b</b> · .broken: " + html);
const html2 = NOTES.render("[[Lesson 3 · Reading 1]] 재출제 #재출제\n- 하나\n- 둘\n\n> 인용 **굵게**\n\"quoted\" & x", (t) => t === "Lesson 3 · Reading 1" ? { id: "p_1", title: "Lesson 3 · Reading 1" } : null);
ok(html2.includes('<a class="wiki" data-link="p_1" href="#/n/p_1">Lesson 3 · Reading 1</a>') && html2.includes('<span class="tag" data-tag="재출제">#재출제</span>') && html2.includes("<ul><li>하나</li><li>둘</li></ul>") && html2.includes("<blockquote>인용 <b>굵게</b></blockquote>") && html2.includes("&quot;quoted&quot; &amp; x") && !/<(?!\/?(p|a|span|b|ul|li|blockquote|br)\b)/.test(html2), "render: 링크 · 태그 · 목록 · 인용 · 굵게 · 허용 태그만: " + html2);
ok(NOTES.render("a 3 b\n\n[[X]] 3", () => ({ id: "n_9", title: "X" })).includes("<p>a 3 b</p>") && NOTES.render("[[X]] 3", () => null).includes("</a> 3"), "render: 본문의 숫자는 자리표시자와 섞이지 않는다");
ok(NOTES.kindOf("pf_1") === "profile" && NOTES.kindOf("pd_1") === "prediction" && NOTES.kindOf("p_1") === "passage" && NOTES.kindOf("m_1") === "mock" && NOTES.kindOf("n_1") === "note" && NOTES.kindOf("tag:x") === "tag" && NOTES.kindOf("zz") === "", "kindOf prefixes");
ok(NOTES.storeOf("q_1") === "questions" && NOTES.storeOf("s_1") === "sources" && NOTES.prefixOf("predictions") === "pd_" && NOTES.anchorKey("questions", "q_1") === "questions:q_1" && NOTES.parseAnchorKey("questions:q_1").id === "q_1", "storeOf · prefixOf · anchorKey");
ok(NOTES.titleOf({ kind: "ask", ask: { question: "빈칸 몇 문항?" } }) === "물어보기: 빈칸 몇 문항?" && NOTES.titleOf({ kind: "daily", date: "2026-09-14" }) === "데일리 2026-09-14" && NOTES.titleOf({ kind: "note", body: "첫 줄\n둘째" }) === "첫 줄 둘째" && NOTES.titleOf({ kind: "anchor", orphanOf: { title: "7번" } }).startsWith("(삭제된 7번에"), "titleOf rules");
ok(NOTES.derivedTags("questions", qa).join() === "빈칸,프린트적중,난이도중" && NOTES.derivedTags("sources", hd).join() === "프린트" && NOTES.derivedTags("passages", pa).length === 0, "derivedTags: " + NOTES.derivedTags("questions", qa).join());
ok(NOTES.excerpt("[[A]] **b** - c\n> d", 5) === "A b …" && NOTES.excerpt("짧다") === "짧다", "excerpt");
ok(NOTES.tags.list("t_1").find(t => t.name === "재출제").count === 2 && NOTES.tags.docsWith("재출제", "t_1").sort().join() === "n_1,q_1", "tags.list counts from the index (user tags only) · docsWith");
// ASK parseAnswer · renderCites · structured · PROMPTS.ask
const pa1 = ASK.parseAnswer("빈칸은 마지막 문장 [1] 이고 [3] 구 단위.\nUSED: 1,3\nFOLLOWUP: a | b");
ok(pa1.used.join() === "1,3" && pa1.followups.length === 2 && pa1.followups[1] === "b" && pa1.body === "빈칸은 마지막 문장 [1] 이고 [3] 구 단위." && pa1.cited.join() === "1,3", "parseAnswer: used [1,3] · followups 2 · body without trailer");
ok(ASK.parseAnswer("답 [2] 끝.").used.join() === "2" && ASK.parseAnswer("```\n답 [1]\nUSED: 1\n```").used.join() === "1", "parseAnswer: USED 없으면 인용 번호로 · 코드펜스 벗김");
const cites = ASK.renderCites("x [1] y [2] z [1, 3]", [{ n: 1, id: "q_1", title: "7번", kindLabel: "문항" }, { n: 2, id: "p_1", title: "L3" }]);
ok((cites.match(/class="cite" data-id="q_1" data-n="1"/g) || []).length === 2 && cites.includes('data-id="p_1"') && cites.includes('class="cite dashed" data-n="3"'), "renderCites: [n] → button.cite[data-id] · 없는 번호 .dashed");
const pAsk = PROMPTS.ask({ teacherLine: "윤은영 · 흑석고 1학년 영어A", compact: { a: 1 }, structured: ["프로파일 V3 · 빈칸 21%"], evidence: [{ n: 1, kind: "question", title: "2025 1학기 중간 · 5번", sub: "매칭 Lesson 2", flag: "★프린트", text: "발문: …" }], question: "빈칸을 주로 어디에 뚫어?", ctxLine: "7번 · 빈칸" });
ok(pAsk.user.includes("아래 [근거] 만을 근거로 강사의 질문에") && pAsk.user.includes("[구조 근거]") && pAsk.user.includes("[질문]") && pAsk.user.includes("[근거]\n[1 | 문항 | 2025 1학기 중간 · 5번 | 매칭 Lesson 2 | ★프린트]\n발문: …") && pAsk.user.includes("[맥락] 지금 열려 있는 노트: 7번 · 빈칸") && pAsk.system.includes("[선생님] 윤은영") && pAsk.system.includes('[프로파일 요약] {"a":1}') && pAsk.system.startsWith(PROMPTS.ROLE), "PROMPTS.ask: 고정 문구 · [구조 근거] · [근거] 헤더 · [질문] · [맥락] · system");
const st1 = ASK.structured("빈칸 몇 문항?", { profile: p1 });
ok(st1.length >= 2 && st1.some(l => l.includes("빈칸")) && st1.some(l => l.includes("문항")), "ASK.structured(빈칸 몇 문항?) mentions 빈칸 and 문항: " + st1.join(" / "));
ok(ASK.structured("안녕", { profile: p1 }).length === 0 && ASK.structured("빈칸?", {}).length === 0, "ASK.structured: no keyword → [] · no profile → []");
const st2 = ASK.structured("유력 지문과 어법 포인트는?", { profile: { version: 3, createdAt: T0, profile: p1 }, prediction: { profileVersion: 3, target: { label: "2026 1학기 중간" }, blueprint: bp } });
ok(st2[0].startsWith("프로파일 V3 (") && st2.some(l => l.startsWith("예측 2026 1학기 중간 (V3")) && st2.some(l => l.startsWith("유력 지문: 1위")), "ASK.structured: 저장 레코드 · 예측 줄: " + st2.join(" / "));
ok(ASK.evidenceText(qa, { store: "questions" }).includes("발문: 다음 글의 빈칸에") && ASK.evidenceText(qa, { store: "questions" }).includes("변형: 빈칸 · 마지막문장 · 구") && ASK.evidenceText(qa, { store: "questions" }).includes("★ 프린트에서 나옴: 지문") && ASK.evidenceText(qa, { store: "questions" }).length <= 600, "evidenceText(question)");
ok(ASK.evidenceText(pa, { store: "passages" }).startsWith("요지: 습관의 힘\n원문: Habits are repeated actions. When the law") && ASK.evidenceText(hd, { store: "sources" }).includes("대상 시험: 2025 1학기 중간") && ASK.evidenceText(hd, { store: "sources" }).includes("[어법] 수일치 정리 (수일치)") && ASK.evidenceText({ id: "n_x", kind: "ask", ask: { question: "q" }, body: "a" }).startsWith("질문: q\n답: a"), "evidenceText(passage · 프린트 · 질문)");
const rt = await ASK.retrieve("빈칸 재출제", { teacherId: "t_1" }).catch(e => ({ error: e.message }));
ok(rt.error && /indexedDB|IndexedDB|저장소/.test(rt.error) || (rt.evidence && rt.evidence.length === 0), "ASK.retrieve reaches DB only after ranking (Node has no IndexedDB): " + (rt.error || "no evidence"));
// PROFILE narrate notes → PROMPTS.narrative
const cmp = PROFILE.compact(p1), stems = PROFILE.stemSamples(p1, 3);
ok(PROMPTS.narrative(cmp, stems, ["메모"]).includes("[강사 메모") && PROMPTS.narrative(cmp, stems, ["메모"]).includes("\n- 메모\n\n[실제 발문 예시") && !PROMPTS.narrative(cmp, stems).includes("[강사 메모") && !PROMPTS.narrative(cmp, stems, []).includes("[강사 메모"), "PROMPTS.narrative carries [강사 메모] only when notes are given");
ok(PROMPTS.narrative(cmp, stems, ["a".repeat(400), "b", "c", "d"]).indexOf("a".repeat(301)) < 0 && !PROMPTS.narrative(cmp, stems, ["a", "b", "c", "d"]).includes("- d"), "notes are clipped to 3 × 300 chars");
ok(PROMPTS.notesBlock(["x"]).startsWith("[강사 메모") && PROMPTS.notesBlock([]) === "", "PROMPTS.notesBlock");
ok(typeof PROFILE.narrate === "function" && PROFILE.narrate.length === 3, "PROFILE.narrate(p, signal, opts)");
// ===== 저장 흐름 (메모리 DB 스텁) — NOTES · LINKS · ASK · SYNC.bootstrap =====
await DB.putAll("teachers", [tc]); await DB.putAll("exams", [ex]); await DB.putAll("sources", [sc, hd]); await DB.putAll("passages", [pa, pb]); await DB.putAll("questions", [qa, qb]);
await INDEX.rebuild({ teachers: [tc], exams: [ex], questions: [qa, qb], passages: [pa, pb], sources: [sc, hd], profiles: [], predictions: [], mocks: [], notes: [] });
LINKS.rebuild({ teachers: [tc], exams: [ex], questions: [qa, qb], passages: [pa, pb], sources: [sc, hd], profiles: [], predictions: [], mocks: [], notes: [], links: [] });
const m1 = await NOTES.saveMemo({ anchorKey: "questions:q_1", teacherId: "t_1", body: "[[Lesson 3 · Reading 1]] 재출제 유력 #재출제", author: "김강사" });
ok(m1 && m1.kind === "anchor" && m1.anchorKey === "questions:q_1" && m1.anchor.id === "q_1" && m1.tags.join() === "재출제" && m1.links[0].to === "p_1" && m1.author === "김강사" && DB._s("notes").size === 1, "saveMemo: anchor 노트 · 태그 · 링크 캐시(to = p_1) · 서명");
ok(DB._s("links").has("lk_" + m1.id + "~p_1~wiki") && DB._s("tags").has("tag:재출제") && NOTES.tags.get("재출제").author === "김강사", "saveMemo writes links(kind:wiki) + tags docs");
ok(INDEX.get("q_1").fields.memo === m1.body && INDEX.get("q_1").userTags.join() === "재출제" && LINKS.backlinks("p_1").some(b => b.from === m1.id && b.kind === "wiki") && LINKS.backlinks("q_1").some(b => b.from === m1.id && b.kind === "anchor"), "DB.onWrite hooks: INDEX memo field · LINKS wiki + anchor edges follow the write");
ok([...DB._s("events").values()].some(e => e.kind === "note" && e.ref.noteId === m1.id), "first memo save logs events(note)");
const m1b = await NOTES.saveMemo({ anchorKey: "questions:q_1", teacherId: "t_1", body: "고침 #재출제 #어법" });
ok(m1b.id === m1.id && m1b.tags.join() === "재출제,어법" && m1b.links.length === 0 && !DB._s("links").has("lk_" + m1.id + "~p_1~wiki") && [...DB._s("events").values()].filter(e => e.kind === "note").length === 1, "saveMemo again: same id · links replaced · no second event");
ok((await NOTES.memo("questions:q_1")).id === m1.id && (await NOTES.saveMemo({ anchorKey: "questions:q_1", body: "  " })) === null && DB._s("notes").size === 0 && INDEX.get("q_1").fields.memo === "", "memo() · empty body deletes the anchor note and clears the index memo");
const qn = await NOTES.quick("오늘 수업에서 들은 것 [[Lesson 4 · Reading 2]] #어법\n둘째 줄", "t_1", "");
ok(qn.kind === "note" && qn.title === "오늘 수업에서 들은 것 Lesson 4 · Reading 2 #어법" && qn.source.kind === "quick" && qn.links[0].to === "p_2" && qn.tags.join() === "어법" && INDEX.get(qn.id) && INDEX.get(qn.id).kind === "note" && LINKS.backlinks("p_2").some(b => b.from === qn.id), "quick: 자유 메모 · 제목 = 첫 줄 · 링크 · 색인 · 백링크");
const rm = NOTES.remove(qn.id);
ok(NOTES.pending(qn.id) && (await NOTES.list({ teacherId: "t_1" })).every(d => d.id !== qn.id) && rm.undo() === true && !NOTES.pending(qn.id) && DB._s("notes").has(qn.id), "remove → pending(hidden from list) → undo keeps the doc");
await NOTES.remove(qn.id, { now: true }).done;
ok(!DB._s("notes").has(qn.id) && DB._s("links").size === 0 && !INDEX.get(qn.id) && !LINKS.backlinks("p_2").some(b => b.from === qn.id), "remove({now}) hard-deletes note + its user links, index and graph follow");
const up = await NOTES.create({ kind: "note", title: "겹침 정리", body: "[[Lesson 3 · Reading 1]] #재출제", teacherId: "t_1", author: "" });
const up2 = await NOTES.update(up.id, { body: "본문만 고침 #새태그" });
ok(up2.tags.join() === "새태그" && up2.links.length === 0 && DB._s("links").size === 0 && DB._s("tags").has("tag:새태그"), "update(body) re-parses tags/links");
const m2 = await NOTES.saveMemo({ anchorKey: "questions:q_1", teacherId: "t_1", body: "고아가 될 메모" });
ok((await NOTES.orphan("questions", ["q_1"])) === 1 && (await DB.get("notes", m2.id)).orphanOf.title === "2025 1학기 중간 · 영어 · 7번" && (await DB.get("notes", m2.id)).anchor === null && (await DB.get("notes", m2.id)).anchorKey === "" && /^\(삭제된 2025 1학기 중간 · 영어 · 7번에/.test((await DB.get("notes", m2.id)).title) && INDEX.get(m2.id) && INDEX.get(m2.id).kind === "note" && INDEX.get("q_1").fields.memo === "", "orphan: anchor 메모가 고아 노트(문서)가 되고 원 문서의 memo 는 비워진다");
const mig = await NOTES.migrateLegacy([{ id: "q_9", teacherId: "t_1", note: "옛 메모 #옛", createdAt: 5 }, { id: "q_8", teacherId: "t_1", note: "" }], [{ id: "t_1", note: "선생님 메모" }]);
ok(mig === 2 && DB._s("notes").has("n_legacy_q_9") && DB._s("notes").has("n_legacy_t_1") && (await DB.get("notes", "n_legacy_q_9")).author === "legacy" && (await DB.get("notes", "n_legacy_q_9")).tags.join() === "옛" && (await DB.get("notes", "n_legacy_t_1")).teacherId === "t_1" && (await NOTES.migrateLegacy([{ id: "q_9", teacherId: "t_1", note: "옛 메모" }], [{ id: "t_1", note: "x" }])) === 0, "migrateLegacy: n_legacy_<id> · author legacy · idempotent");
const d1 = await NOTES.ensureDaily("2026-09-14", "t_1"), d2 = await NOTES.ensureDaily("2026-09-14", "t_1");
ok(d1.id === d2.id && d1.kind === "daily" && d1.date === "2026-09-14" && (await NOTES.daily("2026-09-14", "t_1")).id === d1.id && (await NOTES.daily("2026-09-15", "t_1")) === null && NOTES.titleOf(d1) === "데일리 2026-09-14", "ensureDaily is idempotent per date · daily()");
ok((await NOTES.tags.rename("새태그", "헌태그")) === 1 && (await DB.get("notes", up.id)).body === "본문만 고침 #헌태그" && (await DB.get("notes", up.id)).tags.join() === "헌태그" && !DB._s("tags").has("tag:새태그") && DB._s("tags").has("tag:헌태그"), "tags.rename rewrites #a → #b in bodies and swaps the tag doc");
ok((await NOTES.tags.remove("헌태그")) === 1 && (await DB.get("notes", up.id)).body === "본문만 고침" && !DB._s("tags").has("tag:헌태그") && NOTES.tags.list("t_1").every(t => t.name !== "헌태그"), "tags.remove strips #name and deletes the tag doc");
ok((await NOTES.detachTeacher("t_1")) >= 3 && (await DB.get("notes", up.id)).teacherId === null && (await DB.get("notes", "n_legacy_t_1")).teacherId === null, "detachTeacher: notes/links/tags keep living with teacherId null");
// ASK — retrieve · run · save (모의 API)
INDEX.upsert("questions", qa); LINKS.upsert("questions", qa);
const rv = await ASK.retrieve("빈칸 재출제 문항", { teacherId: "t_1" });
ok(rv.evidence.length >= 1 && rv.evidence[0].n === 1 && rv.evidence.some(e => e.id === "q_1" && e.kind === "question" && e.kindLabel === "문항" && e.flag === "★프린트" && /발문:/.test(e.text)) && rv.chars > 0 && rv.evidence.every((e, i) => e.n === i + 1), "ASK.retrieve: 근거 번호 · 종류 · ★ · 본문 (" + rv.evidence.map(e => e.n + ":" + e.id).join(" ") + ")");
ok(rv.evidence.some(e => e.id === "p_1" && /매칭 지문|이 지문을 쓴 문항|검색/.test(e.why)), "1홉 확장: 문항 → 매칭 지문 (" + rv.evidence.map(e => e.id + "=" + e.why).join(" | ") + ")");
const rc = await ASK.retrieve("이 문항 작년에도?", { teacherId: "t_1", ctxId: "q_1" });
ok(rc.evidence[0].id === "q_1" && rc.evidence[0].why === "열린 노트" && rc.evidence.some(e => e.why === "열린 노트의 이웃"), "ctx 노트와 1홉 이웃이 근거 맨 앞에");
ok((await ASK.retrieve("피아노 협주곡 악보", { teacherId: "t_1" })).evidence.length === 0, "근거 0: 아무 토큰도 맞지 않으면 비어 있다");
const statuses = [];
const run0 = await ASK.run("피아노 협주곡 악보", { teacherId: "t_1", onStatus: (p) => statuses.push(p) });
ok(run0.noEvidence === true && apiCalls.length === 0 && statuses.join() === "gather,found,done", "ASK.run with no evidence never calls the API: " + statuses.join(","));
const texts = [];
const run1 = await ASK.run("빈칸을 몇 문항 내나요?", { teacherId: "t_1", light: false, onText: (t) => texts.push(t.delta), onStatus: (p) => statuses.push(p) });
ok(apiCalls.length === 1 && apiCalls[0].o.system && apiCalls[0].o.cacheSystem === true && apiCalls[0].o.light === false && apiCalls[0].o.tier === "default" && /아래 \[근거\] 만을 근거로 강사의 질문에/.test(apiCalls[0].prompt) && /\[구조 근거\]/.test(apiCalls[0].prompt) && /\[근거\]\n\[1 \| /.test(apiCalls[0].prompt) && /\[질문\]\n빈칸을 몇 문항 내나요\?$/.test(apiCalls[0].prompt), "ASK.run → API.call(user, { system, cacheSystem, light, tier }) with the fixed phrases");
ok(run1.answer === "답 [1]" && run1.used.join() === "1" && run1.invalid.length === 0 && run1.followups.join("|") === "a|b" && run1.model === "mock-model" && run1.evidence.length >= 1 && texts.length === 1 && !run1.aborted && ASK.stats.calls === 1, "ASK.run result: answer · used · followups · model · streaming");
API.reply = "없는 번호 [7] 와 [1].\nUSED: 1,7";
const run2 = await ASK.run("빈칸 배점은?", { teacherId: "t_1" });
ok(run2.used.join() === "1" && run2.invalid.join() === "7" && run2.followups.length === 0, "used keeps only valid numbers; invalid lists the rest");
API.reply = ""; API.fail = API.err("cancelled", "중단됨");
const run3 = await ASK.run("빈칸 배점은?", { teacherId: "t_1" });
ok(run3.aborted === true && run3.used.length === 0 && run3.answer === "" , "abort → aborted:true · used []");
API.fail = null; API.reply = "";
const saved = await ASK.save({ question: "빈칸을 몇 문항 내나요?", result: run1, teacherId: "t_1", author: "김강사" });
ok(saved.kind === "ask" && saved.ask.question === "빈칸을 몇 문항 내나요?" && saved.ask.used.join() === "1" && saved.ask.evidence.length === run1.evidence.length && saved.body === "답 [1]" && NOTES.titleOf(saved) === "물어보기: 빈칸을 몇 문항 내나요?", "ASK.save: notes(kind:ask) with ask{question, evidence, used}");
const citeTo = run1.evidence[0].id;
ok(DB._s("links").has("lk_" + saved.id + "~" + citeTo + "~cite") && LINKS.backlinks(citeTo).some(b => b.from === saved.id && b.kind === "cite" && /인용 \[1\]/.test(b.label)) && [...DB._s("events").values()].some(e => e.kind === "ask" && e.ref.noteId === saved.id), "ASK.save: links(kind:cite) → 인용된 노트의 백링크 · events(ask)");
ok((await ASK.history("t_1", 5))[0].id === saved.id && (await ASK.history("t_9", 5)).length === 0 && INDEX.get(saved.id).noteKind === "ask" && INDEX.search("빈칸을 몇 문항", { kinds: ["ask"] })[0].id === saved.id, "ASK.history · ask 노트는 색인에 질문 + 답으로");
// SYNC.bootstrap 병합 (모의 fetch): notes 는 updatedAt 비교, 나머지는 클라우드가 덮는다
const cloudRows = []; const posted = [];
globalThis.fetch = async (url, o) => { const m = o && o.method || "GET"; if (m === "GET") return { ok: true, text: async () => JSON.stringify(cloudRows.map(r => ({ id: r.id, store: r.store, data: r.data, updated_at: "" }))), headers: { get: () => "" } }; if (m === "POST") { posted.push(...JSON.parse(o.body)); return { ok: true, text: async () => "" }; } return { ok: true, text: async () => "" }; };
const DB2 = fakeDB();
await DB2.put("notes", { id: "n_a", teacherId: "t_1", kind: "note", body: "A-local", updatedAt: 100, createdAt: 50 });
await DB2.put("notes", { id: "n_c", teacherId: "t_1", kind: "note", body: "C-local newer", updatedAt: 900, createdAt: 50 });
await DB2.put("notes", { id: "n_only", teacherId: "t_1", kind: "note", body: "local only", updatedAt: 1, createdAt: 1 });
await DB2.put("exams", Object.assign({}, ex, { title: "local" }));
cloudRows.push({ id: "n_a", store: "notes", data: { id: "n_a", teacherId: "t_1", kind: "note", body: "A-cloud newer", updatedAt: 200, createdAt: 50 } });
cloudRows.push({ id: "n_c", store: "notes", data: { id: "n_c", teacherId: "t_1", kind: "note", body: "C-cloud older", updatedAt: 300, createdAt: 50 } });
cloudRows.push({ id: "n_new", store: "notes", data: { id: "n_new", teacherId: "t_1", kind: "note", body: "cloud only", updatedAt: 5, createdAt: 5 } });
cloudRows.push({ id: "e_1", store: "exams", data: Object.assign({}, ex, { title: "cloud" }) });
cloudRows.push({ id: "tag:재출제", store: "tags", data: { id: "tag:재출제", teacherId: null, name: "재출제", updatedAt: 1, createdAt: 1 } });
SYNC.st.enabled = true; SYNC.st.private = false;
const bs = await SYNC.bootstrap(DB2);
ok(bs.pulled === 4 && bs.pushed === 2 && bs.merged === 2 && !bs.error, "bootstrap counts: pulled 4 (n_a · n_new · e_1 · tag) · pushed 2 (n_c newer · n_only) · merged 2: " + JSON.stringify(bs));
ok((await DB2.get("notes", "n_a")).body === "A-cloud newer" && (await DB2.get("notes", "n_c")).body === "C-local newer" && (await DB2.get("notes", "n_new")).body === "cloud only" && (await DB2.get("notes", "n_only")).body === "local only" && (await DB2.get("exams", "e_1")).title === "cloud" && DB2._s("tags").has("tag:재출제"), "MERGE: newer side wins per note · other stores overwritten by cloud");
await new Promise(r => setTimeout(r, 30));
ok(posted.some(r => r.id === "n_c" && r.data.body === "C-local newer" && r.store === "notes" && r.teacher_id === "t_1") && posted.some(r => r.id === "n_only") && !posted.some(r => r.id === "n_a"), "local-newer docs are pushed to the cloud (" + posted.map(r => r.id).join(",") + ")");
SYNC.setPrivate(true); posted.length = 0; cloudRows.length = 0;
const DB3 = fakeDB(); await DB3.put("notes", { id: "n_p", teacherId: "t_1", kind: "note", body: "private", updatedAt: 1, createdAt: 1 }); await DB3.put("exams", ex);
const bs2 = await SYNC.bootstrap(DB3); await new Promise(r => setTimeout(r, 30));
ok(bs2.pushed === 1 && posted.every(r => r.store !== "notes") && posted.some(r => r.store === "exams"), "PRIVATE on: notes are neither pushed nor pulled, other stores still sync");
SYNC.push("notes", [{ id: "n_x", updatedAt: 1 }]); SYNC.push("exams", [ex]);
ok(SYNC.st.pending === 1, "SYNC.push skips PRIVATE stores while private");
SYNC.setPrivate(false); SYNC.st.enabled = false;
console.log(bad ? "UNIT FAILED " + bad + "/" + n : "UNIT ALL PASSED " + n);
process.exitCode = bad ? 1 : 0;
})().catch(e => { console.error("UNIT CRASHED", e); process.exitCode = 1; });
