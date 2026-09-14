// ORUN ORACLE — 끝에서 끝까지 (세컨드 브레인 재설계). oracle/design/spec.md §8.1~8.11 의 시나리오 61개.
// 모의 API(tests/mock-api.js) · 모의 Supabase(메모리 oracle_docs) · 모의 CDN(tests/cdn) · 픽스처(tests/fixtures) 로만 돈다. 서버 없음.
//
//   §8 번호 ↔ ok 문구 대응표 (ok 는 아래 순서대로 나온다)
//   ─────────────────────────────────────────────────────────────────────────────
//   §8.1 부팅·셸        1 첫 화면 오늘 · 무대 없음        2 엔진 LED · 키 라벨
//                       3 온보딩 카드                    4 씨앗 선생님 2명
//                       5 학교 이름                      6 글꼴(본문 한글 · 시험지 명조)
//                       7 씨앗이 클라우드에               8 색인 완료
//   §8.2 선생님·캡처    9 선생님 만들기                  10 범위 원문 → 자료 노트
//                      11 프린트 시트 · 색인 · 메모      12 큐 줄에 메모
//                      13 기출 2건 · 메모의 시험 정보    14 자동 학습 프로파일 V1
//                      15 프린트 반영율(시험·자료·프로파일)
//                      16 완료 토스트 · 성장 지표        17 온보딩 사라짐
//   §8.3 노트 페이지   18 선생님 노트                    19 서재 시험 → 시험 노트
//                      20 문항 노트                      21 매칭 바꾸기 · 백링크 이동
//                      22 프로파일 노트                  23 프린트 드로어 어댑터
//                      24 시험 학기 인라인 편집 → 반영율 갱신
//   §8.4 메모·링크·태그 25 메모 저장([[링크]] · #태그)    26 백링크 · 태그 페이지
//                      27 깨진 링크                      28 빠른 메모 · 최근 캡처
//                      29 삭제 취소 · 확정               30 옛 v1 메모 이전
//   §8.5 검색·팔레트   31 ⌘K 검색 → 노트 열기            32 >명령
//                      33 #태그 · ?질문                  34 원문에서(grep) → mark
//                      35 Esc · 입력창 안 ⌘K
//   §8.6 물어보기      36 답 · 인용 · 근거                37 인용 칩 · ask 노트 · cite 링크
//                      38 근거 0                         39 키 없음
//                      40 맥락(ctx)
//   §8.7 예측·모의고사 41 예측 노트                       42 모의고사 · 시험지 · DOCX
//                      43 인쇄 판형
//   §8.8 브레인        44 브레인 진입 · 그래프            45 노드 필터
//                      46 노드 클릭 → HUD → 노트         47 뷰를 떠나면 정지
//                      48 배경 영상                      49 전체화면 워드마크
//   §8.9 타임라인·성장 50 주 · 이벤트 · 필터              51 오늘 로그 · 주간 회고
//                      52 다음에 할 일
//   §8.10 백업·동기화  53 백업 JSON                       54 새로 고침 · 클라우드 거울
//                      55 옛 백업 불러오기                56 updatedAt 병합(두 브라우저)
//                      57 #sPrivate                       58 PDF 추출
//   §8.11 좁은 화면    59 600×900 · 2D · 더보기           60 키 없음 표시
//                      61 콘솔 오류 없음
//   (§8.12 는 tests/unit.js 가 맡는다 — 이 파일은 건드리지 않는다)
const { launch } = require("./browser");
const fs = require("fs"), path = require("path"), http = require("http");
const T = __dirname;                                   // oracle/tests
const OUT = path.join(T, "out");
const mock = require(path.join(T, "mock-api.js"));
const FILE = process.env.ORACLE_FILE || path.join(T, "..", "..", "public", "orun-oracle.html");
const fail = (m) => { console.error("FAIL:", m); process.exitCode = 1; };
const ok = (c, m) => { if (c) console.log("ok  ", m); else fail(m); };
const fx = (n) => fs.readFileSync(path.join(T, "fixtures", n), "utf8");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = http.createServer((req, res) => {
    const u = req.url.split("?")[0];
    if (u === "/blank.html") { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end("<title>blank</title>"); return; }
    const p = u === "/app.html" ? FILE : path.join(T, decodeURIComponent(u));
    fs.readFile(p, (e, b) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { "content-type": p.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream" }); res.end(b); });
  });
  await new Promise(r => srv.listen(8766, r));
  const browser = await launch();
  const errors = [];
  const calls = [];
  // ---- 모의 Supabase — oracle_docs 한 테이블을 메모리에 (문맥이 달라도 같은 클라우드) ----
  const cloud = new Map(); const cloudOps = { get: 0, put: 0, del: 0 };
  let mainWs = "";                       // 이 페이지의 작업공간 — 다른 작업공간(legacy-ws) 행은 거울 카운트에 들지 않는다
  const cloudRows = (store) => [...cloud.values()].filter(x => x.store === store && (!mainWs || x.workspace === mainWs));
  const cloudCounts = () => { const c = {}; cloud.forEach(x => { if (mainWs && x.workspace !== mainWs) return; c[x.store] = (c[x.store] || 0) + 1; }); return c; };

  async function newCtx(o) {
    const ctx = await browser.newContext(Object.assign({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, locale: "ko-KR" }, o || {}));
    // 눈에 보이나? — offsetParent 는 position:fixed 인 요소(#cmdk 팔레트 · #tabbar 바닥 바)에서 늘 null 이라 쓸 수 없다
    await ctx.addInitScript(() => {
      window.__vis = (sel) => {
        const e = typeof sel === "string" ? document.querySelector(sel) : sel;
        if (!e || e.hidden) return false;
        const c = getComputedStyle(e);
        if (c.display === "none" || c.visibility === "hidden" || +c.opacity === 0) return false;
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
    });
    await ctx.route(/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/, route => { const f = path.join(T, "cdn", route.request().url().split("?")[0].replace("https://", "").replace(/\//g, "__")); fs.existsSync(f) ? route.fulfill({ path: f, contentType: "text/javascript" }) : route.abort(); });
    await ctx.route(/fonts\.googleapis\.com|fonts\.gstatic\.com/, route => route.fulfill({ status: 200, contentType: "text/css", body: "" }));
    await ctx.route(/wxjazdqabryflvfztujk\.supabase\.co/, route => {
      const r = route.request(); const u = new URL(r.url()); const m = r.method(); const ws = (u.searchParams.get("workspace") || "").replace(/^eq\./, "");
      const hdr = r.headers(); const J = { "content-type": "application/json" };
      if (!hdr.apikey || !/^Bearer /.test(hdr.authorization || "")) { route.fulfill({ status: 401, contentType: "application/json", body: '{"message":"no key"}' }); return; }
      if (m === "GET") { cloudOps.get++; const rows = [...cloud.values()].filter(x => x.workspace === ws); if (/count=exact/.test(hdr.prefer || "")) { route.fulfill({ status: 206, headers: Object.assign({ "content-range": "0-0/" + rows.length }, J), body: "[]" }); return; } const off = +(u.searchParams.get("offset") || 0), lim = +(u.searchParams.get("limit") || 1000); route.fulfill({ status: 200, headers: J, body: JSON.stringify(rows.slice(off, off + lim).map(x => ({ id: x.id, store: x.store, data: x.data, updated_at: x.updated_at }))) }); return; }
      if (m === "POST") { const arr = JSON.parse(r.postData() || "[]"); if (!/merge-duplicates/.test(hdr.prefer || "")) { route.fulfill({ status: 409, headers: J, body: '{"message":"dup"}' }); return; } arr.forEach(x => cloud.set(x.id, x)); cloudOps.put += arr.length; route.fulfill({ status: 201, headers: J, body: "" }); return; }
      if (m === "DELETE") { const idq = u.searchParams.get("id"); const victims = [...cloud.values()].filter(x => x.workspace === ws && (!idq || idq.replace(/^in\.\(/, "").replace(/\)$/, "").split(",").map(s => s.replace(/"/g, "")).includes(x.id))); victims.forEach(x => cloud.delete(x.id)); cloudOps.del += victims.length; route.fulfill({ status: 204, body: "" }); return; }
      route.fulfill({ status: 405, headers: J, body: "[]" });
    });
    // ---- 모의 LLM — ask 는 평문, 나머지는 JSON. 프롬프트의 표식을 기록해 둔다(§5.5 검사용) ----
    await ctx.route(/api\.anthropic\.com/, route => {
      const body = JSON.parse(route.request().postData() || "{}");
      if (body.max_tokens === 1) { route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "m", content: [{ type: "text", text: "hi" }] }) }); return; }
      const prompt = (body.messages[0].content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      const evBlock = (/\n\[근거\]\n([\s\S]*)$/.exec(prompt) || [])[1] || "";
      calls.push({ model: body.model, sys: !!body.system, kind: (/\[작업\][^\n]{0,40}/.exec(prompt) || [""])[0], thinking: body.thinking && body.thinking.type, memo: (/\[사용자 메모[^\]]*\]\n([^\n]*)/.exec(prompt) || [])[1] || "",
        ask: /아래 \[근거\] 만을 근거로 강사의 질문에/.test(prompt),
        marks: { struct: /\n\[구조 근거\]\n/.test(prompt), ev: /\n\[근거\]\n/.test(prompt), q: /\n\[질문\]\n/.test(prompt), ctx: /\n\[맥락\]/.test(prompt), evN: (evBlock.match(/^\[\d+ \| /gm) || []).length } });
      const a = mock.answer(prompt);
      route.fulfill({ status: 200, contentType: "text/event-stream", body: mock.sse(typeof a === "string" ? a : JSON.stringify(a)) });
    });
    return ctx;
  }
  const watch = (p, tag) => { p.on("console", m => { if (m.type() === "error") errors.push(tag + ": " + m.text().slice(0, 300)); }); p.on("pageerror", e => errors.push("pageerror(" + tag + "): " + e.message)); };
  const booted = (p) => p.waitForFunction(() => window.ORACLE && ORACLE.APP.state.booted, null, { timeout: 30000 });
  const synced = (p) => p.waitForFunction(() => ORACLE.SYNC.st.status === "ok" && !ORACLE.SYNC.st.pending, null, { timeout: 20000 });
  const indexed = (p) => p.waitForFunction(() => ORACLE.INDEX.state.ready === true, null, { timeout: 30000 });
  const view = (p, v) => p.waitForFunction(v2 => document.getElementById("main") && document.getElementById("main").dataset.view === v2, v, { timeout: 15000 });
  const go = async (p, hash, v) => { await p.evaluate(h => ORACLE.ROUTE.go(h), hash); if (v) await view(p, v); await p.waitForTimeout(160); };
  const text = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent : ""; }, sel);
  const shown = (p, sel) => p.evaluate(s => window.__vis(s), sel);
  const count = (p, sel) => p.evaluate(s => document.querySelectorAll(s).length, sel);
  const shot = (p, n) => p.screenshot({ path: path.join(OUT, n + ".png") });

  // ══════════════════════════════════════════════════════════════════════════
  // §8.1 부팅 · 셸
  // ══════════════════════════════════════════════════════════════════════════
  const ctx = await newCtx();
  await ctx.addInitScript(() => { localStorage.setItem("orun_api_key", "sk-ant-api03-test"); localStorage.setItem("orun_api_model", "opus"); });
  const page = await ctx.newPage(); watch(page, "main");
  await page.goto("http://127.0.0.1:8766/app.html");
  await booted(page);
  mainWs = await page.evaluate(() => ORACLE.SYNC.st.workspace);

  const boot1 = await page.evaluate(() => ({ hash: location.hash, vis: !document.getElementById("vToday").hidden, dv: document.getElementById("main").dataset.view, stage: ORACLE.APP.stage() }));
  ok(boot1.hash === "#/today" && boot1.vis && boot1.dv === "today" && boot1.stage === null, "1. 첫 화면은 오늘이고 3D 무대는 아직 없다: " + JSON.stringify({ hash: boot1.hash, dv: boot1.dv, stage: boot1.stage }));
  const eng = await page.evaluate(() => ({ ok: document.getElementById("engine").classList.contains("ok"), label: document.getElementById("engineLabel").textContent }));
  ok(eng.ok && /OPUS/i.test(eng.label), "2. 엔진 LED 켜짐 · 저장된 키 라벨 " + eng.label);
  ok(await page.evaluate(() => { const o = document.getElementById("onboard"); return o.hidden === false && document.getElementById("vToday").contains(o); }), "3. 온보딩 카드가 오늘 화면 안에 보인다");
  const seed = await page.evaluate(() => [...ORACLE.APP.state.teachers.values()].map(t => t.name + "/" + t.subject + "/" + t.school).sort());
  ok(seed.join(",") === "윤은영/영어A/흑석고,전정이/영어B/흑석고", "4. 씨앗 선생님 2명: " + seed.join(", "));
  ok(await page.evaluate(() => /흑석고/.test(document.getElementById("brandSub").textContent) || /흑석고/.test(document.getElementById("navTeacher").textContent)), "5. 학교 이름이 부제 또는 선생님 스위처에");
  const fonts = await page.evaluate(() => ({ body: getComputedStyle(document.body).fontFamily, kr: getComputedStyle(document.documentElement).getPropertyValue("--fk"), main: getComputedStyle(document.getElementById("main")).fontFamily, paper: getComputedStyle(document.getElementById("paperPage")).fontFamily }));
  ok(/Orbitron/.test(fonts.body) && /Noto Sans KR/.test(fonts.body) && /Noto Sans KR/.test(fonts.kr) && /^["']?Noto Sans KR/.test(fonts.main.trim()) && /(함초롬바탕|Noto Serif KR)/.test(fonts.paper),
    "6. 글꼴: body 는 Orbitron+Noto Sans KR · #main 은 한글 우선 · 시험지는 명조 (" + fonts.main.slice(0, 40) + " | " + fonts.paper.slice(0, 40) + ")");
  await synced(page);
  ok(cloudOps.put >= 2 && cloudRows("teachers").length === 2, "7. 씨앗 선생님이 클라우드에 올라갔다 (put " + cloudOps.put + ") · LED " + (await page.evaluate(() => document.getElementById("cloud").classList.contains("ok"))));
  ok(await page.evaluate(() => document.getElementById("cloud").classList.contains("ok")), "7b. 클라우드 LED 켜짐");
  await indexed(page);
  ok(/색인/.test(await text(page, "#indexMini")) && await page.evaluate(() => ORACLE.INDEX.state.ready === true), "8. 색인이 끝나고 상태줄에 표시: " + (await text(page, "#indexMini")));

  // 토스트 수집기 (완료 토스트 · 취소 토스트 검사용)
  await page.evaluate(() => { window.__toasts = []; ORACLE.APP.on("toast", (o) => window.__toasts.push(String(o && o.msg || ""))); });
  const toasts = () => page.evaluate(() => window.__toasts.slice());

  // ══════════════════════════════════════════════════════════════════════════
  // §8.2 선생님 · 캡처
  // ══════════════════════════════════════════════════════════════════════════
  await page.click("#navTeacher"); await page.waitForSelector("#navTeacherMenu #btnNew", { state: "visible" });
  await page.click("#btnNew"); await page.waitForSelector("#tfName");
  await page.fill("#tfName", "김영어"); await page.fill("#tfSchool", "흑석고"); await page.click("#tfOk");
  await page.waitForFunction(() => ORACLE.APP.state.teachers.size === 3, null, { timeout: 15000 });
  const tid = await page.evaluate(() => [...ORACLE.APP.state.teachers.values()].find(t => t.name === "김영어").id);
  await page.waitForTimeout(200);
  const nav9 = await page.evaluate(() => ({ t: document.getElementById("navTeacher").textContent, cnt: (document.querySelector("#navLib [data-nav-kind=exams] .cnt") || {}).textContent }));
  ok(/김영어/.test(nav9.t) && String(nav9.cnt).trim() === "0", "9. 선생님 3명 · 스위처에 김영어 · 서재 시험 수 " + nav9.cnt);

  await page.keyboard.press("i"); await view(page, "inbox");
  const enq = async (name, body, opt) => page.evaluate(([id, name, body, opt]) => { ORACLE.APP.enqueue([new File([body], name, { type: "text/plain" })], id, null, opt || undefined); }, [tid, name, body, opt || null]);
  await enq("교과서_시험범위.txt", fx("scope.txt"));
  await page.waitForFunction(() => ORACLE.APP.state.queue.length === 1 && ["done", "error"].includes(ORACLE.APP.state.queue[0].stage), null, { timeout: 60000 });
  let j = await page.evaluate(() => ORACLE.APP.state.queue.map(x => ({ stage: x.stage, kind: x.kind, detail: x.detail, error: x.error, doneText: x.doneText })));
  const q10 = await page.evaluate(() => ({ rows: document.querySelectorAll("#queueList .q").length, open: document.querySelectorAll("#queueList [data-open]").length }));
  ok(j[0].stage === "done" && j[0].kind === "scope" && q10.rows === 1 && q10.open >= 1, "10. 범위 원문 색인 완료 · 큐 행 1 · 열기 단추: " + JSON.stringify(j[0]));
  await page.click("#queueList [data-open]"); await view(page, "note");
  const src10 = await page.evaluate(() => ({ kind: document.getElementById("vNote").dataset.kind, pass: document.querySelectorAll("#noteBody [data-pass]").length }));
  const scopeN = await page.evaluate(async (id) => { const ss = await ORACLE.DB.where("sources", "teacherId", id); const s = ss.find(x => x.kind !== "프린트"); return (await ORACLE.DB.where("passages", "sourceId", s.id)).filter(p => p.kind === "지문").length; }, tid);
  ok(src10.kind === "source" && scopeN === 6 && src10.pass === scopeN, "10b. 자료 노트가 열리고 지문 " + src10.pass + "개 (저장된 지문 수와 같다)");

  await page.evaluate(([id, name, body]) => { ORACLE.UI.openFilesSheet([new File([body], name, { type: "text/plain" })], id); }, [tid, "2025_1학기_중간_대비_프린트.txt", fx("handout.txt")]);
  await page.waitForSelector("#fsMemo");
  ok(await page.evaluate(() => document.getElementById("sheetWrap").classList.contains("on") && document.querySelector("#sheetBody [data-k]").textContent === "프린트"), "11. 파일 시트가 열리고 이름으로 프린트를 알아봤다");
  await page.fill("#fsMemo", "이 프린트는 어법 정리 위주예요. 1학기 중간 대비용.");
  await page.click("#fsGo");
  await page.waitForFunction(() => ORACLE.APP.state.queue.length === 2 && ["done", "error"].includes(ORACLE.APP.state.queue[1].stage), null, { timeout: 60000 });
  j = await page.evaluate(() => ORACLE.APP.state.queue.map(x => ({ stage: x.stage, kind: x.kind, error: x.error, doneText: x.doneText })));
  ok(j[1].stage === "done" && j[1].kind === "handout" && /지문 2 · 포인트 6/.test(j[1].doneText || ""), "11b. 프린트 색인 완료: " + JSON.stringify(j[1]));
  const hsrc = await page.evaluate(async (id) => { const s = (await ORACLE.DB.where("sources", "teacherId", id)).find(x => x.kind === "프린트"); return { target: s.target, items: s.items.map(i => i.kind), refl: s.reflection, memo: s.memo }; }, tid);
  ok(hsrc.target.year === 2025 && hsrc.target.semester === 1 && hsrc.target.term === "중간" && hsrc.items.join(",") === "어법,어법,어법,어휘,예상문제,예상문제" && hsrc.refl === null, "11c. 프린트 자료: 대상 시험 추정 · 포인트 " + hsrc.items.join("/") + " · 반영율 아직 없음");
  ok(hsrc.memo === "이 프린트는 어법 정리 위주예요. 1학기 중간 대비용." && calls.some(c => /프린트\(학습지\)/.test(c.kind) && c.memo === hsrc.memo) && !calls.some(c => /시험범위 자료/.test(c.kind) && c.memo), "11d. 메모가 프린트 자료에 저장되고 프린트 색인 프롬프트에만 실렸다");
  ok(/✎ 이 프린트는/.test(await text(page, "#queueList")), "12. 큐 줄에 넣을 때 전한 말이 보인다");
  await shot(page, "e2e-inbox");

  await enq("2025_1학기_중간_기출.txt", fx("exam1.txt"));
  await enq("기출_아무이름.txt", fx("exam2.txt"), { memo: "2학기 기말 시험지예요. 서술형은 마지막 장에 있어요", kinds: ["exam"] });
  await page.waitForFunction(() => ORACLE.APP.state.queue.length === 4 && ORACLE.APP.state.queue.every(x => ["done", "error", "cancelled"].includes(x.stage)), null, { timeout: 120000 });
  j = await page.evaluate(() => ORACLE.APP.state.queue.map(x => ({ stage: x.stage, kind: x.kind, error: x.error })));
  const memoExam = await page.evaluate(async (id) => { const e = (await ORACLE.DB.where("exams", "teacherId", id)).find(x => x.memo); return e && { memo: e.memo, label: ORACLE.TEXT.examLabel(e.meta), file: e.file.name }; }, tid);
  ok(j.slice(2).every(x => x.stage === "done" && x.kind === "exam") && memoExam && memoExam.file === "기출_아무이름.txt" && /2학기 기말/.test(memoExam.label) && calls.filter(c => /기출 시험지에서 추출한/.test(c.kind) && c.memo === memoExam.memo).length >= 1,
    "13. 기출 2건 데이터화 · 메모의 '2학기 기말' 이 시험 정보에 잡힘 " + JSON.stringify(memoExam && memoExam.label));

  await page.waitForFunction(() => ORACLE.APP.state.profiles.size === 1, null, { timeout: 60000 });
  const c14 = await page.evaluate((id) => ORACLE.APP.state.counts.get(id), tid);
  const prof = await page.evaluate((id) => { const p = ORACLE.APP.state.profiles.get(id); return { id: p.id, v: p.version, types: Object.keys(p.profile.typeDist), narr: !!p.narrative, handout: p.profile.handout }; }, tid);
  ok(c14.exams === 2 && c14.passages === 8 && c14.questions === 14 && c14.sources === 2 && c14.matched >= 10 && prof.v === 1 && prof.narr && prof.types.length >= 4,
    "14. 자동 학습 프로파일 V1 · 카운트 " + JSON.stringify({ exams: c14.exams, passages: c14.passages, questions: c14.questions, sources: c14.sources, matched: c14.matched }) + " · 유형 " + prof.types.length);

  const refl = await page.evaluate(async (id) => { const exams = await ORACLE.DB.where("exams", "teacherId", id); const src = (await ORACLE.DB.where("sources", "teacherId", id)).find(x => x.kind === "프린트"); return { exams: exams.map(e => ({ label: ORACLE.TEXT.examLabel(e.meta), r: e.reflection && { rate: e.reflection.rate, n: e.reflection.n, kinds: e.reflection.kinds } })), src: src.reflection && { rate: src.reflection.rate, hit: src.reflection.hit, n: src.reflection.n, exams: src.reflection.exams.length } }; }, tid);
  const mid = refl.exams.find(e => /1학기 중간/.test(e.label));
  ok(mid && mid.r && mid.r.rate >= 0.4 && mid.r.kinds["지문"] >= 1 && mid.r.kinds["어법"] >= 1 && mid.r.kinds["예상문제"] >= 1 && refl.src && refl.src.n === 14 && refl.src.exams === 2 && refl.src.rate > 0 && prof.handout && prof.handout.rate > 0 && prof.handout.nExams === 2 && prof.handout.byExam.length === 2,
    "15. 프린트 반영율 — 시험별 " + JSON.stringify(mid && mid.r) + " · 자료별 " + JSON.stringify(refl.src) + " · 프로파일 " + (prof.handout && prof.handout.rate));

  const tl16 = await toasts();
  ok(tl16.some(m => /문항/.test(m) && /\+/.test(m)) && /14/.test(await text(page, "#navGrowth")), "16. 완료 토스트에 실제 숫자 · 성장 지표에 문항 14 (" + (tl16.find(m => /문항/.test(m) && /\+/.test(m)) || "") + ")");
  ok(await page.evaluate(() => document.getElementById("onboard").hidden === true), "17. 자료가 들어오자 온보딩이 사라졌다");
  await go(page, "#/today", "today"); await page.waitForTimeout(400); await shot(page, "e2e-today");

  // ══════════════════════════════════════════════════════════════════════════
  // §8.3 노트 페이지
  // ══════════════════════════════════════════════════════════════════════════
  await go(page, "#/n/" + tid, "note");
  const st18 = await text(page, "#teacherStatus");
  ok(await page.evaluate(() => document.getElementById("vNote").dataset.kind) === "teacher" && /프린트 → 시험/.test(st18) && /김영어/.test(await text(page, "#vNote")) && (await count(page, "#vNote [data-exam]")) === 2,
    "18. 선생님 노트: 상태 줄에 프린트 → 시험 · 시험 2건");

  await go(page, "#/all/exams", "library");
  ok((await count(page, "#libTable tr[data-id]")) === 2, "19. 서재 시험 목록 2행");
  await shot(page, "e2e-library");
  await page.click("#libTable tr[data-id]"); await view(page, "note");
  const ex19 = await page.evaluate(() => ({ kind: document.getElementById("vNote").dataset.kind, q: document.querySelectorAll("#noteBody [data-q]").length, star: /★/.test(document.getElementById("noteBody").textContent) }));
  ok(ex19.kind === "exam" && ex19.q >= 7 && ex19.star, "19b. 시험 노트: 문항 " + ex19.q + " · 프린트 적중 ★");

  const qid = await page.evaluate(async () => { const id = ORACLE.NOTEUI.current().id; const qs = await ORACLE.DB.where("questions", "examId", id); const m = qs.find(q => q.match && q.match.passageId); return m ? m.id : qs[0].id; });
  const oldPass = await page.evaluate(async (q) => { const d = await ORACLE.DB.get("questions", q); return d.match ? d.match.passageId : null; }, qid);
  await page.click('#noteBody [data-q="' + qid + '"]'); await page.waitForFunction(() => ORACLE.NOTEUI.current() && ORACLE.NOTEUI.current().id.indexOf("q_") === 0, null, { timeout: 10000 });
  await page.waitForTimeout(200);
  const q20 = await page.evaluate(() => ({ kind: document.getElementById("vNote").dataset.kind, title: document.getElementById("noteTitle").textContent, props: document.getElementById("noteProps").textContent, sel: !!document.getElementById("dMatchSel"), derived: document.querySelectorAll("#noteTags .chip.derived").length }));
  ok(q20.kind === "question" && /번/.test(q20.title) && /매칭 지문/.test(q20.props) && q20.sel && q20.derived >= 1, "20. 문항 노트: 제목 '" + q20.title.slice(0, 24) + "' · 매칭 지문 칸 · 파생 태그 " + q20.derived);
  await shot(page, "e2e-note-question");

  const newPass = await page.evaluate((old) => { const s = document.getElementById("dMatchSel"); const o = [...s.options].find(x => x.value && x.value !== "__none" && x.value !== old); return o ? o.value : null; }, oldPass);
  await page.selectOption("#dMatchSel", newPass);
  await page.waitForFunction(async (q) => { const d = await ORACLE.DB.get("questions", q); return d.match && d.match.method === "user"; }, qid, { timeout: 10000 });
  const ev21 = await page.evaluate(async () => (await ORACLE.DB.all("events")).filter(e => e.kind === "match").length);
  await go(page, "#/n/" + newPass, "note");
  const back21new = await page.evaluate(q => document.querySelector('#noteBacklinks [data-id="' + q + '"]') !== null || document.getElementById("noteBacklinks").textContent.indexOf(q) >= 0, qid);
  let back21old = false;
  if (oldPass && oldPass !== newPass) { await go(page, "#/n/" + oldPass, "note"); back21old = await page.evaluate(q => document.querySelector('#noteBacklinks [data-id="' + q + '"]') !== null, qid); }
  ok(ev21 >= 1 && back21new && !back21old, "21. 매칭을 바꾸니 method=user · match 이벤트 " + ev21 + " · 새 지문 백링크 O · 옛 지문 백링크 X");

  await go(page, "#/n/" + prof.id, "note");
  const p22 = await page.evaluate(() => { const b = document.getElementById("noteBody"); const first = b.firstElementChild; return { kind: document.getElementById("vNote").dataset.kind, body: b.textContent, first: first ? first.textContent.slice(0, 40) : "", opts: document.querySelectorAll("#profVer option").length }; });
  ok(p22.kind === "profile" && /빈칸/.test(p22.body) && /달라진 점/.test(p22.first) && p22.opts === 1, "22. 프로파일 노트: 달라진 점이 맨 위 · 버전 스위처 " + p22.opts + "개");

  await page.evaluate(() => ORACLE.UI.openDrawer("handouts")); await view(page, "library"); await page.waitForTimeout(200);
  const d23 = await page.evaluate(() => ({ hash: decodeURIComponent(location.hash), tbl: document.getElementById("libTable").textContent }));
  ok(/^#\/all\/sources\?/.test(d23.hash) && /kind=프린트/.test(d23.hash) && /반영/.test(d23.tbl), "23. openDrawer('handouts') 어댑터가 서재 프린트 목록으로: " + d23.hash);

  const midExam = await page.evaluate(async (id) => { const es = await ORACLE.DB.where("exams", "teacherId", id); const e = es.find(x => /1학기 중간/.test(ORACLE.TEXT.examLabel(x.meta))); return e.id; }, tid);
  await go(page, "#/n/" + midExam, "note");
  await page.click('#noteProps [data-seg="semester"] button[data-v="2"]');
  await page.waitForFunction(async (id) => { const e = await ORACLE.DB.get("exams", id); return e.meta.semester === 2; }, midExam, { timeout: 10000 });
  await page.waitForTimeout(500);
  const t24 = await page.evaluate(() => document.getElementById("noteTitle").textContent);
  await go(page, "#/n/" + tid, "note");
  const st24 = await text(page, "#teacherStatus");
  ok(/2학기/.test(t24) && st24 !== st18 && /프린트 → 시험/.test(st24), "24. 학기를 2학기로 고치니 제목과 프린트 반영율 문구가 갱신됐다");
  // 뒤 시나리오(예측 · 모의고사)가 옛 반영율 위에서 돌도록 되돌린다
  await go(page, "#/n/" + midExam, "note");
  await page.click('#noteProps [data-seg="semester"] button[data-v="1"]');
  await page.waitForFunction(async (id) => { const e = await ORACLE.DB.get("exams", id); return e.meta.semester === 1; }, midExam, { timeout: 10000 });
  await page.waitForTimeout(500);

  // ══════════════════════════════════════════════════════════════════════════
  // §8.4 메모 · 링크 · 태그 · 백링크
  // ══════════════════════════════════════════════════════════════════════════
  await go(page, "#/n/" + qid, "note");
  await page.waitForSelector("#noteMemoText");
  await page.click("#noteMemoText");
  await page.fill("#noteMemoText", "[[Lesson 1 · Reading 1]] 재출제 유력 #재출제");
  await page.keyboard.press("Control+Enter");
  await page.waitForFunction(async (q) => (await ORACLE.DB.where("notes", "anchorKey", "questions:" + q)).length === 1, qid, { timeout: 10000 });
  await page.waitForTimeout(500);
  const m25 = await page.evaluate(async (q) => {
    const n = (await ORACLE.DB.where("notes", "anchorKey", "questions:" + q))[0];
    const links = (await ORACLE.DB.all("links")).filter(l => l.from === n.id);
    const tags = await ORACLE.DB.all("tags");
    const to = links[0] ? await ORACLE.DB.get("passages", links[0].to) : null;
    return { id: n.id, kind: n.kind, anchorKey: n.anchorKey, tags: n.tags, nLinks: links.length, lk: links[0] && { kind: links[0].kind, to: links[0].to }, toSrc: to && to.src, tagIds: tags.map(t => t.id),
      view: document.getElementById("noteMemoView").innerHTML, a: document.querySelectorAll("#noteMemoView a[data-link]").length, chip: document.querySelectorAll("#noteMemoView .tag").length };
  }, qid);
  const memoNoteId = m25.id;
  await synced(page);
  ok(m25.kind === "anchor" && m25.anchorKey === "questions:" + qid && String(m25.tags) === "재출제" && m25.nLinks === 1 && m25.lk.kind === "wiki" && /^p_/.test(m25.lk.to) && m25.toSrc === "Lesson 1 · Reading 1" && m25.tagIds.includes("tag:재출제") && m25.a >= 1 && m25.chip >= 1 && cloudRows("notes").some(r => r.id.indexOf(memoNoteId) >= 0),
    "25. 메모 저장: anchor 노트 1 · wiki 링크 → " + m25.toSrc + " · 태그 재출제 · 미리보기 링크/태그 · 클라우드 거울");

  await go(page, "#/n/" + m25.lk.to, "note");
  const b26 = await page.evaluate(q => ({ note: document.getElementById("noteBacklinks").textContent, aside: document.getElementById("asideBacklinks").textContent, hit: !!document.querySelector('#noteBacklinks [data-id="' + q + '"]') }), qid);
  await go(page, "#/tag/재출제", "tag");
  const t26 = await page.evaluate(() => ({ n: document.querySelectorAll("#tagList [data-id]").length, nav: !!document.querySelector('#navTags [data-tag="재출제"]') }));
  ok(b26.hit && /번/.test(b26.note) && /번/.test(b26.aside) && t26.n === 1 && t26.nav, "26. 지문 노트 · aside 에 백링크 · 태그 페이지 1개 · nav 태그 목록");

  await go(page, "#/n/" + qid, "note");
  await page.evaluate(() => { const tg = document.getElementById("noteMemoToggle"); if (document.getElementById("noteMemoText").hidden && tg) tg.click(); });
  await page.fill("#noteMemoText", "[[없는 제목]] 확인");
  await page.keyboard.press("Control+Enter");
  await page.waitForTimeout(900);
  const b27 = await page.evaluate(async (n) => ({ broken: document.querySelectorAll("#noteMemoView .broken").length, links: (await ORACLE.DB.all("links")).filter(l => l.from === n).length }), memoNoteId);
  ok(b27.broken >= 1 && b27.links === 0, "27. 깨진 링크는 .broken 으로 보이고 links 에 저장되지 않는다");

  await go(page, "#/inbox", "inbox");
  await page.fill("#captureText", "오늘 수업 #어법");
  await page.click("#captureGo");
  await page.waitForFunction(async () => (await ORACLE.DB.where("notes", "kind", "note")).length === 1, null, { timeout: 10000 });
  await go(page, "#/today", "today"); await page.waitForTimeout(300);
  const r28 = await page.evaluate(() => { const el = document.querySelector("#homeRecent [data-id]"); return el ? { t: el.textContent, isNew: el.classList.contains("new") } : null; });
  ok(r28 && r28.isNew && /오늘 수업/.test(r28.t), "28. 빠른 메모가 자유 메모로 저장되고 최근 캡처 첫 줄에 새것 표시");

  const delId = await page.evaluate(async () => (await ORACLE.APP.quickNote("지울 메모")).id);
  await go(page, "#/n/" + delId, "note");
  await page.click("#nDel");
  await page.waitForSelector("#toasts button");
  await page.click("#toasts button");
  await page.waitForTimeout(600);
  const alive = await page.evaluate(async (id) => !!(await ORACLE.DB.get("notes", id)), delId);
  await go(page, "#/n/" + delId, "note");
  await page.click("#nDel");
  await page.waitForTimeout(5500);
  const gone = await page.evaluate(async (id) => !(await ORACLE.DB.get("notes", id)), delId);
  ok(alive && gone, "29. 메모 삭제는 5초 안에 취소할 수 있고, 취소하지 않으면 확정된다");

  // 30. 옛 v1 IndexedDB → v2 이전 (별도 컨텍스트 · 별도 작업공간)
  {
    const ctxL = await newCtx();
    await ctxL.addInitScript(() => { localStorage.setItem("orun_api_key", "sk-ant-api03-test"); localStorage.setItem("orun_api_model", "opus"); localStorage.setItem("orun_oracle_ws", "legacy-ws"); });
    const pL = await ctxL.newPage(); watch(pL, "legacy");
    await pL.goto("http://127.0.0.1:8766/blank.html");
    await pL.evaluate(() => new Promise((res, rej) => {
      const req = indexedDB.open("orun_oracle", 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        const mk = (n, key, idx) => { const st = db.createObjectStore(n, { keyPath: key }); (idx || []).forEach(i => st.createIndex(i, i, { unique: false })); };
        mk("teachers", "id"); mk("exams", "id", ["teacherId"]); mk("questions", "id", ["teacherId", "examId"]); mk("passages", "id", ["teacherId", "sourceId"]);
        mk("sources", "id", ["teacherId"]); mk("profiles", "id", ["teacherId"]); mk("events", "id", ["teacherId"]); mk("predictions", "id", ["teacherId"]);
        mk("mocks", "id", ["teacherId"]); mk("settings", "key"); mk("media", "key");
      };
      req.onsuccess = () => {
        const db = req.result, now = Date.now();
        const tx = db.transaction(["teachers", "exams", "questions"], "readwrite");
        tx.objectStore("teachers").put({ id: "t_legacy", name: "옛선생", school: "흑석고", grade: 1, subject: "영어A", color: "#7fd1ff", note: "", createdAt: now, updatedAt: now });
        tx.objectStore("exams").put({ id: "e_legacy", teacherId: "t_legacy", meta: { year: 2024, semester: 1, term: "중간", grade: 1, subject: "영어A", school: "흑석고" }, questions: 1, text: "옛 시험지", file: { name: "old.txt", size: 10 }, createdAt: now, updatedAt: now });
        tx.objectStore("questions").put({ id: "q_legacy", teacherId: "t_legacy", examId: "e_legacy", number: "1", type: "빈칸", format: "5지선다", points: 2, difficulty: "중", stem: "다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?", options: [], tags: [], note: "옛 메모", match: null, createdAt: now, updatedAt: now });
        tx.oncomplete = () => { db.close(); res(true); };
        tx.onerror = () => rej(tx.error);
      };
      req.onerror = () => rej(req.error);
      req.onblocked = () => rej(new Error("blocked"));
    }));
    await pL.goto("http://127.0.0.1:8766/app.html");
    await booted(pL);
    await pL.waitForFunction(async () => !!(await ORACLE.DB.get("notes", "n_legacy_q_legacy")), null, { timeout: 20000 });
    const v30 = await pL.evaluate(async () => {
      const dbs = (await indexedDB.databases()).filter(d => d.name === "orun_oracle");
      const notes = await ORACLE.DB.all("notes");
      return { ver: dbs[0] && dbs[0].version, n: notes.length, id: notes[0] && notes[0].id, body: notes[0] && notes[0].body, author: notes[0] && notes[0].author };
    });
    await go(pL, "#/n/q_legacy", "note");
    await pL.waitForTimeout(400);
    const view30 = await text(pL, "#noteMemoView");
    ok(v30.ver === 2 && v30.n === 1 && v30.id === "n_legacy_q_legacy" && /옛 메모/.test(view30), "30. 옛 v1 저장소가 v2 로 올라가고 questions.note 가 n_legacy_ anchor 노트로 이전됐다");
    await ctxL.close();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // §8.5 검색 · 팔레트
  // ══════════════════════════════════════════════════════════════════════════
  await go(page, "#/today", "today");
  await page.keyboard.press("Control+k");
  await page.waitForSelector("#cmdk", { state: "visible" });
  const focused = await page.evaluate(() => document.activeElement === document.getElementById("cmdkInput"));
  await page.fill("#cmdkInput", "어법"); await page.waitForTimeout(400);
  const h31 = await page.evaluate(() => [...document.querySelectorAll("#cmdkList .hit[data-hit]")].map(x => x.dataset.hit));
  await page.keyboard.press("Enter"); await view(page, "note"); await page.waitForTimeout(200);
  const after31 = await page.evaluate(() => ({ hash: location.hash, open: window.__vis("#cmdk") }));
  ok(focused && h31.some(x => /^q_/.test(x)) && h31.some(x => /^s_/.test(x)) && /^#\/n\//.test(after31.hash) && !after31.open,
    "31. ⌘K 검색: 문항 · 프린트가 섞여 나오고 ⏎ 로 노트가 열린다 (" + h31.slice(0, 4).join(",") + ")");

  const ver32 = await page.evaluate(t => { const p = ORACLE.APP.state.profiles.get(t); return p ? p.version : 0; }, tid);
  await page.keyboard.press("Control+k"); await page.waitForSelector("#cmdk", { state: "visible" });
  await page.fill("#cmdkInput", ">학습"); await page.waitForTimeout(400);
  const hasLearn = await page.evaluate(() => { const hits = [...document.querySelectorAll("#cmdkList .hit[data-hit]")]; return hits.length >= 1 && hits[0].dataset.hit === "cmd:learn"; });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2500);
  const learned32 = await page.evaluate(([t, v]) => { const p = ORACLE.APP.state.profiles.get(t); return { v: p ? p.version : 0, was: v, toasts: window.__toasts.slice(-6) }; }, [tid, ver32]);
  ok(hasLearn && (learned32.v > learned32.was || learned32.toasts.some(m => /바뀐 자료가 없어요/.test(m))), "32. >학습 명령이 실제로 학습을 부른다 (V" + learned32.was + " → V" + learned32.v + ")");

  await page.keyboard.press("Control+k"); await page.waitForSelector("#cmdk", { state: "visible" });
  await page.fill("#cmdkInput", "#재"); await page.waitForTimeout(400);
  const h33 = await page.evaluate(() => [...document.querySelectorAll("#cmdkList .hit[data-hit]")].map(x => x.dataset.hit));
  await page.fill("#cmdkInput", "?빈칸"); await page.waitForTimeout(400);
  await page.keyboard.press("Enter"); await view(page, "ask"); await page.waitForTimeout(200);
  const hash33 = await page.evaluate(() => decodeURIComponent(location.hash));
  ok(h33.length >= 1 && h33.every(x => /^tag:/.test(x)) && h33.includes("tag:재출제") && /^#\/ask\?/.test(hash33) && /q=빈칸/.test(hash33), "33. # 접두는 태그만(" + h33.join(",") + ") · ? 접두는 물어보기로 (" + hash33 + ")");

  await page.keyboard.press("Control+k"); await page.waitForSelector("#cmdk", { state: "visible" });
  await page.fill("#cmdkInput", "Ancient philosophers argued"); await page.waitForTimeout(500);
  const h34 = await page.evaluate(() => [...document.querySelectorAll('#cmdkList .hit[data-hit^="grep:"]')].map(x => x.dataset.hit));
  const grepLabel = await page.evaluate(() => document.getElementById("cmdkList").textContent);
  await page.click('#cmdkList .hit[data-hit^="grep:"]');
  await view(page, "note"); await page.waitForTimeout(300);
  const mark34 = await count(page, "#noteBody mark");
  ok(h34.length >= 1 && /원문에서/.test(grepLabel) && mark34 >= 1, "34. 긴 질의는 원문에서 그룹을 내고, 열면 그 문장이 mark 로 강조된다");

  await page.keyboard.press("Control+k"); await page.waitForSelector("#cmdk", { state: "visible" });
  await page.keyboard.press("Escape"); await page.waitForTimeout(200);
  const closed35 = await page.evaluate(() => !window.__vis("#cmdk"));
  await go(page, "#/inbox", "inbox");
  await page.click("#captureText");
  await page.keyboard.press("Control+k"); await page.waitForTimeout(300);
  const open35 = await page.evaluate(() => window.__vis("#cmdk"));
  await page.keyboard.press("Escape"); await page.waitForTimeout(200);
  ok(closed35 && open35, "35. Esc 로 닫히고, 입력창 안에서도 ⌘K 가 열린다");

  // ══════════════════════════════════════════════════════════════════════════
  // §8.6 물어보기
  // ══════════════════════════════════════════════════════════════════════════
  await go(page, "#/today", "today");
  await page.keyboard.press("a"); await view(page, "ask");
  await page.fill("#askInput", "빈칸을 몇 문항 내나요?");
  const n36 = calls.length;
  await page.click("#askGo");
  await page.waitForFunction(() => document.querySelectorAll("#askLog .msg.brain .cite[data-id]").length >= 1, null, { timeout: 30000 });
  await page.waitForTimeout(600);
  const ask36 = calls.slice(n36).find(c => c.ask);
  const ui36 = await page.evaluate(() => ({ cites: document.querySelectorAll("#askCites [data-cite]").length, unused: document.querySelectorAll("#askCites [data-cite].unused").length, chips: document.querySelectorAll("#askLog .msg.brain .cite[data-id]").length, cost: document.getElementById("askCost").textContent }));
  ok(!!ask36 && ask36.sys === true && ask36.marks.struct && ask36.marks.ev && ask36.marks.q && ui36.chips >= 1 && ui36.cites === ask36.marks.evN && ui36.unused === Math.max(0, ask36.marks.evN - 2) && /근거/.test(ui36.cost),
    "36. 물어보기: system 프롬프트 · [구조 근거]/[근거]/[질문] · 인용 칩 " + ui36.chips + " · 근거 " + ui36.cites + "(안 쓴 것 " + ui36.unused + ") · " + ui36.cost.slice(0, 30));
  await shot(page, "e2e-ask");

  const citeId = await page.evaluate(() => { const el = document.querySelector("#askLog .msg.brain .cite[data-id]"); return el ? el.dataset.id : null; });
  await page.click("#askLog .msg.brain .cite[data-id]"); await view(page, "note"); await page.waitForTimeout(300);
  const a37 = await page.evaluate(async () => ({ hash: location.hash, back: document.getElementById("noteBacklinks").textContent, notes: (await ORACLE.DB.where("notes", "kind", "ask")).length, cites: (await ORACLE.DB.all("links")).filter(l => l.kind === "cite").length }));
  ok(a37.hash === "#/n/" + citeId && /물어보기/.test(a37.back) && a37.notes === 1 && a37.cites >= 1, "37. 인용 칩이 그 노트로 가고, 백링크에 물어보기 · ask 노트 1 · cite 링크 " + a37.cites);

  await go(page, "#/ask", "ask");
  await page.fill("#askInput", "피아노 협주곡 악보");
  const n38 = calls.length;
  await page.click("#askGo");
  await page.waitForTimeout(2000);
  ok(calls.length === n38 && await shown(page, "#askEmpty"), "38. 근거가 없으면 모델을 부르지 않고 안내만 보여 준다 (호출 " + n38 + " → " + calls.length + ")");

  // 39. 키 없는 컨텍스트
  {
    const ctxN = await newCtx();
    const pN = await ctxN.newPage(); watch(pN, "nokey");
    await pN.goto("http://127.0.0.1:8766/app.html"); await booted(pN); await indexed(pN);
    await go(pN, "#/ask", "ask");
    const n39 = await pN.evaluate(() => ({ dis: document.getElementById("askGo").disabled, msg: document.getElementById("askStatus").textContent + " " + document.getElementById("vAsk").textContent }));
    ok(n39.dis === true && /API 키|키를 저장/.test(n39.msg), "39. 키가 없으면 물어보기 단추가 잠기고 안내가 보인다");
    await ctxN.close();
  }

  await go(page, "#/n/" + qid, "note");
  await page.fill("#asideAskInput", "이 문항 작년에도?");
  await page.click("#asideAskGo"); await view(page, "ask"); await page.waitForTimeout(300);
  const h40 = await page.evaluate(() => decodeURIComponent(location.hash));
  const ctxText = await text(page, "#askCtx");
  const n40 = calls.length;
  await page.click("#askGo");
  await page.waitForTimeout(3000);
  const ask40 = calls.slice(n40).find(c => c.ask);
  ok(/ctx=/.test(h40) && h40.indexOf(qid) >= 0 && /번/.test(ctxText) && !!ask40 && ask40.marks.ctx, "40. 노트 맥락으로 물으면 ctx 가 주소와 칩과 프롬프트 [맥락] 에 실린다");

  // ══════════════════════════════════════════════════════════════════════════
  // §8.7 예측 · 모의고사 · 시험지
  // ══════════════════════════════════════════════════════════════════════════
  const pred = await page.evaluate(async (id) => { const r = await ORACLE.APP.predict(id); return { id: r.id, total: r.blueprint.plan.total, np: r.blueprint.passages.length, onH: r.blueprint.passages.filter(p => p.onHandout).length, handout: r.blueprint.handout, copy: r.copyText.length, copyHas: /프린트/.test(r.copyText) }; }, tid);
  await go(page, "#/n/" + pred.id, "note");
  await page.waitForTimeout(400);
  const ui41 = await page.evaluate(() => ({ body: document.getElementById("noteBody").textContent, canvas: !!(document.getElementById("rangeMap") && document.getElementById("rangeMap").tagName === "CANVAS"), hot: document.querySelectorAll("#noteBody .hot[data-pass]").length }));
  await page.click("#rCopy"); await page.waitForTimeout(400);
  const t41 = await toasts();
  ok(pred.np >= 6 && pred.total >= 6 && pred.copy > 200 && pred.copyHas && pred.handout && pred.handout.passagesOnHandout >= 1 && pred.onH >= 1 && /유력 지문/.test(ui41.body) && ui41.canvas && ui41.hot >= 6 && t41.some(m => /청사진/.test(m)),
    "41. 예측 노트: 유력 지문 " + ui41.hot + " · 범위 지도 canvas · 프린트 반영 " + JSON.stringify(pred.handout) + " · 청사진 복사 토스트");

  const mockRes = await page.evaluate(async (id) => { const m = await ORACLE.APP.generateMock(id, { count: 8 }); return { id: m.id, n: m.questions.length, failed: m.failed.length }; }, tid);
  await page.waitForSelector("#paper.on", { timeout: 20000 });
  const pq = await count(page, "#paperPage .pq");
  await shot(page, "e2e-paper");
  const docxSize = await page.evaluate(async (id) => { const ms = await ORACLE.DB.where("mocks", "teacherId", id); const b = await ORACLE.GENERATE.docx(ms[0], ORACLE.APP.teacher(id)); return b.size; }, tid);
  await page.click("#paperClose"); await page.waitForTimeout(300);
  await go(page, "#/all/mocks", "library");
  const rows42 = await count(page, "#libTable tr[data-id]");
  await go(page, "#/n/" + mockRes.id, "note");
  await page.click("#openPaper"); await page.waitForSelector("#paper.on", { timeout: 10000 });
  ok(mockRes.n >= 7 && mockRes.failed === 0 && pq >= 7 && docxSize > 4000 && rows42 === 1, "42. 적중 모의고사 " + mockRes.n + "문항 · 시험지 " + pq + "면 · DOCX " + docxSize + "B · 서재 모의고사 " + rows42 + "행 · 노트에서 다시 열기");

  await page.emulateMedia({ media: "print" }); await page.waitForTimeout(300);
  const pr43 = await page.evaluate(() => ({ nav: getComputedStyle(document.getElementById("nav")).display, paper: getComputedStyle(document.getElementById("paper")).display, font: getComputedStyle(document.getElementById("paperPage")).fontFamily, top: getComputedStyle(document.getElementById("topbar")).display }));
  await page.emulateMedia({ media: "screen" }); await page.waitForTimeout(200);
  await page.click("#paperClose"); await page.waitForTimeout(200);
  ok(pr43.nav === "none" && pr43.top === "none" && pr43.paper === "block" && /(함초롬바탕|Noto Serif KR)/.test(pr43.font), "43. 인쇄에서는 셸이 사라지고 시험지만 명조로 남는다");

  // ══════════════════════════════════════════════════════════════════════════
  // §8.8 브레인
  // ══════════════════════════════════════════════════════════════════════════
  await page.keyboard.press("g"); await view(page, "brain");
  await page.waitForFunction(() => { const s = ORACLE.APP.stage(); return s && s.graph() && s.graph().nodes.length > 0; }, null, { timeout: 20000 });
  await page.waitForTimeout(800);
  const g44 = await page.evaluate(() => { const s = ORACLE.APP.stage(); const g = s.graph(); const by = {}; g.nodes.forEach(n => { by[n.kind] = (by[n.kind] || 0) + 1; }); return { teachers: s.teachers().length, n: g.nodes.length, by, running: s.running }; });
  ok(g44.teachers === 3 && g44.n >= 24 && (g44.by.passage || 0) >= 8 && (g44.by.exam || 0) >= 2 && (g44.by.question || 0) >= 14 && g44.running === true,
    "44. 브레인에 들어가면 무대가 생기고 그래프가 선다: 노드 " + g44.n + " " + JSON.stringify(g44.by));
  await shot(page, "e2e-brain");

  await page.click('#brainBar [data-node="question"]'); await page.waitForTimeout(600);
  const g45off = await page.evaluate(() => { const g = ORACLE.APP.stage().graph(); return { n: g.nodes.length, q: g.nodes.filter(x => x.kind === "question").length }; });
  await page.click('#brainBar [data-node="question"]'); await page.waitForTimeout(600);
  const g45on = await page.evaluate(() => ORACLE.APP.stage().graph().nodes.length);
  ok(g45off.n < g44.n && g45off.q === 0 && g45on === g44.n, "45. 문항 필터를 끄면 노드가 줄고(" + g44.n + " → " + g45off.n + ") 다시 켜면 돌아온다");

  const node46 = await page.evaluate(() => {
    const s = ORACLE.APP.stage(), g = s.graph();
    for (const n of g.nodes.filter(x => x.kind === "passage")) { const p = s.nodeScreen(n.id); if (p && p.visible) return { id: n.id, label: n.label, x: p.x, y: p.y }; }
    return null;
  });
  if (node46) {
    const box = await page.evaluate(() => { const r = document.getElementById("fx").getBoundingClientRect(); return { x: r.x, y: r.y }; });
    await page.mouse.click(box.x + node46.x, box.y + node46.y); await page.waitForTimeout(600);
    const hud = await page.evaluate(() => ({ on: window.__vis("#brainHud"), title: document.getElementById("brainHudTitle").textContent }));
    await page.click("#brainHudOpen"); await view(page, "note"); await page.waitForTimeout(200);
    const h46 = await page.evaluate(() => location.hash);
    ok(hud.on && hud.title.indexOf(node46.label) >= 0 && h46 === "#/n/" + node46.id, "46. 노드를 클릭하면 HUD 가 뜨고 [열기] 가 그 노트로 간다 (" + hud.title.slice(0, 24) + ")");
    await page.keyboard.press("g"); await view(page, "brain"); await page.waitForTimeout(400);
  } else ok(false, "46. 노드를 클릭하면 HUD 가 뜨고 [열기] 가 그 노트로 간다 — 화면에 보이는 지문 노드를 찾지 못했다");

  await page.keyboard.press("h"); await view(page, "today"); await page.waitForTimeout(400);
  const stopped = await page.evaluate(() => ORACLE.APP.stage().running === false);
  await page.keyboard.press("g"); await view(page, "brain"); await page.waitForTimeout(400);
  const resumed = await page.evaluate(() => ORACLE.APP.stage().running === true);
  ok(stopped && resumed, "47. 브레인을 떠나면 무대가 쉬고 돌아오면 다시 돈다");

  const bg = await page.evaluate(async () => {
    const cv = document.createElement("canvas"); cv.width = 320; cv.height = 180; const c2 = cv.getContext("2d");
    const rec = new MediaRecorder(cv.captureStream(15), { mimeType: "video/webm;codecs=vp8" }); const chunks = []; rec.ondataavailable = e => chunks.push(e.data);
    rec.start(); for (let i = 0; i < 12; i++) { c2.fillStyle = "hsl(" + i * 30 + ",80%,40%)"; c2.fillRect(0, 0, 320, 180); c2.fillStyle = "#fff"; c2.fillRect(i * 20, 60, 40, 40); await new Promise(r => setTimeout(r, 70)); }
    await new Promise(r => { rec.onstop = r; rec.stop(); });
    const file = new File(chunks, "higgsfield.webm", { type: "video/webm" });
    await ORACLE.APP.setBgVideo(file); await new Promise(r => setTimeout(r, 800));
    return { size: file.size, has: ORACLE.APP.state.bg.hasVideo, src: !!document.getElementById("bgVideo").src, media: !!(await ORACLE.DB.get("media", "bg")) };
  });
  await page.waitForTimeout(800); await shot(page, "e2e-brain-video");
  await page.evaluate(() => ORACLE.APP.setBgVideo(null)); await page.waitForTimeout(300);
  ok(bg.has && bg.src && bg.media, "48. 배경 영상이 저장되고 브레인 뷰에 깔린다: " + JSON.stringify(bg));

  await page.click("#brainFull"); await page.waitForTimeout(400);
  const full = await page.evaluate(() => ({ cls: document.body.classList.contains("brainFull"), school: document.getElementById("wordsSchool").textContent }));
  await page.keyboard.press("Escape"); await page.waitForTimeout(300);
  const unfull = await page.evaluate(() => document.body.classList.contains("brainFull"));
  ok(full.cls && /흑석고/.test(full.school) && !unfull, "49. 전체화면에서 코너 워드마크가 나오고 Esc 로 풀린다");

  // ══════════════════════════════════════════════════════════════════════════
  // §8.9 타임라인 · 성장
  // ══════════════════════════════════════════════════════════════════════════
  await page.keyboard.press("t"); await view(page, "timeline"); await page.waitForTimeout(500);
  const today = await page.evaluate(() => { const d = new Date(); const p = (n) => String(n).padStart(2, "0"); return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); });
  const tl50 = await page.evaluate(day => {
    const box = document.querySelector('.tlDay[data-day="' + day + '"]');
    const kinds = box ? [...box.querySelectorAll(".ev[data-ev]")].map(x => x.dataset.ev) : [];
    return { has: !!box, kinds, week: document.getElementById("tlWeek").textContent };
  }, today);
  await page.click('#tlFilter [data-f="note"]'); await page.waitForTimeout(400);
  const only50 = await page.evaluate(() => { const evs = [...document.querySelectorAll(".ev[data-ev]")].map(x => x.dataset.ev); return { n: evs.length, all: evs.every(k => k === "note") }; });
  await page.click('#tlFilter [data-f="all"]'); await page.waitForTimeout(300);
  const want = ["ingest", "learn", "note", "ask", "match"];
  ok(tl50.has && want.every(k => tl50.kinds.includes(k)) && /문항 \+/.test(tl50.week) && only50.n >= 1 && only50.all,
    "50. 타임라인 오늘 줄에 " + want.join("·") + " 가 모두 있고 주간 집계와 필터가 돈다 (" + tl50.week.slice(0, 40) + ")");
  await shot(page, "e2e-timeline");

  await page.click("#tlToday"); await page.waitForTimeout(900);
  const d51a = await page.evaluate(async (day) => (await ORACLE.DB.where("notes", "kind", "daily")).filter(n => n.date === day).map(n => n.id), today);
  await go(page, "#/timeline", "timeline");
  await page.click("#tlToday"); await page.waitForTimeout(900);
  const d51b = await page.evaluate(async (day) => (await ORACLE.DB.where("notes", "kind", "daily")).filter(n => n.date === day).map(n => n.id), today);
  await go(page, "#/timeline", "timeline");
  await page.click("#tlRetro"); await view(page, "note"); await page.waitForTimeout(600);
  const w51 = await page.evaluate(async () => { const id = ORACLE.NOTEUI.current().id; const d = await ORACLE.DB.get("notes", id); return { kind: d && d.kind, body: d && d.body }; });
  ok(d51a.length === 1 && d51b.length === 1 && d51a[0] === d51b[0] && w51.kind === "weekly" && /문항 \+|넣은 것|이 주에는/.test(w51.body || ""), "51. 오늘 로그는 하루 한 벌 · 회고는 주간 집계를 본문에 담은 weekly 노트");

  await page.evaluate(t => { ORACLE.APP.learn(t, { force: true }); }, tid);
  await page.waitForFunction(t => { const p = ORACLE.APP.state.profiles.get(t); const pr = ORACLE.APP.state.predictions.get(t); return p && pr && pr.profileVersion < p.version; }, tid, { timeout: 60000 });
  await go(page, "#/today", "today"); await page.waitForTimeout(600);
  const up52 = await page.evaluate(() => ({ n: document.querySelectorAll("#nextUp .todo[data-act]").length, t: document.getElementById("nextUp").textContent }));
  ok(up52.n >= 1 && /다시 예측/.test(up52.t), "52. 다음에 할 일: 프로파일이 앞서면 '다시 예측' 이 뜬다 (" + up52.n + "개)");

  // ══════════════════════════════════════════════════════════════════════════
  // §8.10 백업 · 복원 · 동기화
  // ══════════════════════════════════════════════════════════════════════════
  const [dl] = await Promise.all([page.waitForEvent("download"), page.evaluate(() => ORACLE.APP.exportJson(null))]);
  const bk = JSON.parse(fs.readFileSync(await dl.path(), "utf8"));
  ok(bk.app === "orun-oracle" && bk.schema === 1 && bk.teachers.length === 3 && bk.questions.length === 14 && bk.profiles.length >= 1 && bk.sources.length === 2 && bk.notes.length >= 3 && bk.links.length >= 1 && bk.tags.length >= 1,
    "53. 백업 JSON: schema 1 · 선생님 " + bk.teachers.length + " · 문항 " + bk.questions.length + " · 메모 " + bk.notes.length + " · 링크 " + bk.links.length + " · 태그 " + bk.tags.length);

  const predId = await page.evaluate(t => { const p = ORACLE.APP.state.predictions.get(t); return p ? p.id : ""; }, tid);
  await page.reload();
  await page.waitForFunction(() => window.ORACLE && ORACLE.APP.state.teachers.size === 3 && ORACLE.APP.state.profiles.size === 1, null, { timeout: 30000 });
  await synced(page); await indexed(page);
  await go(page, "#/n/" + predId, "note"); await page.waitForTimeout(400);
  const body54 = await text(page, "#noteBody");
  const cs = cloudCounts();
  ok(/유력 지문/.test(body54) && cs.teachers === 3 && cs.questions === 14 && cs.passages === 8 && cs.sources === 2 && cs.exams === 2 && (cs.notes || 0) >= 3 && (cs.links || 0) >= 1 && (cs.tags || 0) >= 1 && !cs.media,
    "54. 새로 고쳐도 프로파일 · 예측이 살아 있고 클라우드 거울에 notes/links/tags 가 있다 (media 없음): " + JSON.stringify(cs));

  const old55 = Object.assign({}, bk); delete old55.notes; delete old55.links; delete old55.tags;
  const r55 = await page.evaluate(async (txt) => { try { const f = new File([txt], "old-backup.json", { type: "application/json" }); const r = await ORACLE.APP.importJson(f); return { ok: true, r }; } catch (e) { return { ok: false, e: String(e && e.message || e) }; } }, JSON.stringify(old55));
  ok(r55.ok && r55.r && r55.r.teachers === 3, "55. notes/links/tags 키가 없는 옛 백업도 오류 없이 읽힌다");

  // 56. updatedAt 병합 — ctx2(빈 IndexedDB) ↔ ctx1
  const anchorKey56 = "questions:" + qid;
  await page.evaluate(async ([k, b]) => { const t = ORACLE.APP.state.selectedId; await ORACLE.NOTES.saveMemo({ anchorKey: k, teacherId: t, body: b, author: "A" }); }, [anchorKey56, "A 본문"]);
  await synced(page);
  const ctx2 = await newCtx();
  await ctx2.addInitScript(() => { localStorage.setItem("orun_api_key", "sk-ant-api03-test"); localStorage.setItem("orun_api_model", "opus"); });
  const p2 = await ctx2.newPage(); watch(p2, "ctx2");
  await p2.goto("http://127.0.0.1:8766/app.html"); await booted(p2); await synced(p2);
  const got56 = await p2.evaluate(async k => { const m = await ORACLE.NOTES.memo(k); return m ? m.body : null; }, anchorKey56);
  await p2.evaluate(async ([k, b]) => { const m = await ORACLE.NOTES.memo(k); await ORACLE.NOTES.saveMemo({ anchorKey: k, teacherId: m ? m.teacherId : null, body: b, author: "B" }); }, [anchorKey56, "B"]);
  await synced(p2);
  await page.reload(); await booted(page); await synced(page);
  const merged56 = await page.evaluate(async k => { const m = await ORACLE.NOTES.memo(k); return m ? m.body : null; }, anchorKey56);
  await page.evaluate(async ([k, b]) => { const m = await ORACLE.NOTES.memo(k); await ORACLE.NOTES.saveMemo({ anchorKey: k, teacherId: m ? m.teacherId : null, body: b, author: "C" }); }, [anchorKey56, "C"]);
  await synced(page);
  const row56 = [...cloud.values()].find(x => x.store === "notes" && x.data && x.data.anchorKey === anchorKey56);
  if (row56) { row56.data = Object.assign({}, row56.data, { body: "옛 본문", updatedAt: Date.now() - 3600000 }); row56.updated_at = new Date(Date.now() - 3600000).toISOString(); }
  await page.reload(); await booted(page); await synced(page);
  const kept56 = await page.evaluate(async k => { const m = await ORACLE.NOTES.memo(k); return m ? m.body : null; }, anchorKey56);
  const pushed56 = (([...cloud.values()].find(x => x.store === "notes" && x.data && x.data.anchorKey === anchorKey56) || {}).data || {}).body;
  ok(got56 === "A 본문" && merged56 === "B" && kept56 === "C" && pushed56 === "C", "56. updatedAt 병합: 클라우드가 새로우면 받아 오고(B), 로컬이 새로우면 지키고 올린다(C) — 받은 값 " + got56 + " / " + merged56 + " / " + kept56 + " / 클라우드 " + pushed56);
  await ctx2.close();

  await page.evaluate(() => ORACLE.SYNC.setPrivate(true));
  const before57 = cloudRows("notes").length;
  await page.evaluate(() => { ORACLE.APP.quickNote("비밀 메모 — 올라가면 안 돼요"); });
  await page.waitForTimeout(2500);
  const after57 = cloudRows("notes").length;
  await page.evaluate(() => ORACLE.SYNC.setPrivate(false));
  ok(after57 === before57, "57. #sPrivate 를 켜면 새 메모가 클라우드에 올라가지 않는다 (" + before57 + " → " + after57 + ")");

  const pdfPage = await ctx.newPage();
  await pdfPage.setContent("<pre style='font-family:serif;font-size:11pt;white-space:pre-wrap'>" + fx("exam1.txt").replace(/1학기 중간/g, "2학기 중간").replace(/</g, "&lt;") + "</pre>");
  const pdfBuf = await pdfPage.pdf({ format: "A4" }); await pdfPage.close();
  await page.evaluate(async ([id, b64]) => { const bin = atob(b64); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); ORACLE.APP.enqueue([new File([u8], "2025_2학기_중간_기출.pdf", { type: "application/pdf" })], id); }, [tid, pdfBuf.toString("base64")]);
  await page.waitForFunction(() => { const x = ORACLE.APP.state.queue.find(q => q.name.endsWith(".pdf")); return x && ["done", "error"].includes(x.stage); }, null, { timeout: 90000 });
  const pj = await page.evaluate(() => { const x = ORACLE.APP.state.queue.find(q => q.name.endsWith(".pdf")); return { stage: x.stage, error: x.error, chars: x.text.length, pages: x.pages }; });
  ok(pj.stage === "done" && pj.chars > 1500, "58. PDF 를 넣으면 pdf.js 로 글자를 뽑아 데이터화한다: " + JSON.stringify(pj));

  console.log("API calls:", calls.length, JSON.stringify(calls.reduce((m, c) => { m[c.ask ? "[ask]" : (c.kind || "?")] = (m[c.ask ? "[ask]" : (c.kind || "?")] || 0) + 1; return m; }, {})), "models:", [...new Set(calls.map(c => c.model))].join(","));
  await ctx.close();

  // ══════════════════════════════════════════════════════════════════════════
  // §8.11 좁은 화면 · 키 없음
  // ══════════════════════════════════════════════════════════════════════════
  const ctx3 = await newCtx({ viewport: { width: 600, height: 900 } });
  const p3 = await ctx3.newPage(); watch(p3, "narrow");
  await p3.goto("http://127.0.0.1:8766/app.html"); await booted(p3); await synced(p3);
  const shell59 = await p3.evaluate(() => ({ narrow: document.body.classList.contains("narrow"), tabbar: window.__vis("#tabbar"), navOpen: document.getElementById("nav").classList.contains("open"), status: window.__vis("#statusbar") }));
  await go(p3, "#/brain", "brain"); await p3.waitForTimeout(800);
  const flat59 = await p3.evaluate(() => ({ mode: ORACLE.APP.state.mode, canvas: window.__vis("#brainFlat") }));
  await p3.click('#tabbar [data-tab="more"]'); await p3.waitForSelector('#sheetBody [data-more="new"]');
  await p3.click('#sheetBody [data-more="new"]'); await p3.waitForSelector("#tfName");
  await p3.fill("#tfName", "박선생"); await p3.fill("#tfSchool", "흑석고"); await p3.click("#tfOk");
  await p3.waitForFunction(() => document.querySelectorAll("#flatGrid .tcard[data-id]").length === 4, null, { timeout: 20000 });
  await shot(p3, "e2e-narrow");
  ok(shell59.narrow && shell59.tabbar && !shell59.navOpen && !shell59.status && flat59.mode === "flat" && flat59.canvas, "59. 600×900: 탭바 · 접힌 목차 · 2D 브레인 · 더보기로 선생님 4명째 만들기");

  await go(p3, "#/ask", "ask");
  const key60 = await p3.evaluate(() => ({ label: document.getElementById("engineLabel").textContent, dis: document.getElementById("askGo").disabled, ob: document.getElementById("ob1").textContent, next: document.getElementById("nextUp").textContent }));
  ok(/NO KEY/i.test(key60.label) && key60.dis === true && (/API 키/.test(key60.ob) || /API 키/.test(key60.next)), "60. 키가 없으면 엔진 라벨 · 온보딩 · 물어보기 단추가 모두 그렇게 말한다");
  await ctx3.close();

  await browser.close(); srv.close();
  const realErrors = errors.filter(e => !/favicon|ERR_FAILED|net::ERR/.test(e));
  ok(realErrors.length === 0, "61. 콘솔 오류 없음" + (realErrors.length ? ":\n  " + realErrors.join("\n  ") : ""));
  console.log(process.exitCode ? "SOME CHECKS FAILED" : "ALL PASSED");
})().catch(e => { console.error("CRASH", e); process.exit(1); });
