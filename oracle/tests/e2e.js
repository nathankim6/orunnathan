// 끝에서 끝까지: 씨앗 선생님(흑석고) → 선생님 만들기 → 범위·프린트·기출 넣기 → 자동 학습 → 프린트 반영율 → 예측 → 적중 모의고사 → DOCX → 백업 → 클라우드 복원 (모의 API · 모의 Supabase)
const { launch } = require("./browser");
const fs = require("fs"), path = require("path"), http = require("http");
const T = __dirname;                                   // oracle/tests
const mock = require(path.join(T, "mock-api.js"));
const FILE = process.env.ORACLE_FILE || path.join(T, "..", "..", "public", "orun-oracle.html");
const fail = (m) => { console.error("FAIL:", m); process.exitCode = 1; };
const ok = (c, m) => { if (c) console.log("ok  ", m); else fail(m); };
(async () => {
  const srv = http.createServer((req, res) => { const p = req.url.split("?")[0] === "/app.html" ? FILE : path.join(T, decodeURIComponent(req.url.split("?")[0])); fs.readFile(p, (e, b) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { "content-type": p.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream" }); res.end(b); }); });
  await new Promise(r => srv.listen(8766, r));
  const browser = await launch();
  const calls = [];
  // 모의 Supabase — oracle_docs 한 테이블을 메모리에 둔다 (문맥이 달라도 같은 클라우드)
  const cloud = new Map(); const cloudOps = { get: 0, put: 0, del: 0 };
  async function newCtx(o) {
    const ctx = await browser.newContext(Object.assign({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, locale: "ko-KR" }, o || {}));
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
    await ctx.route(/api\.anthropic\.com/, route => {
      const body = JSON.parse(route.request().postData() || "{}");
      if (body.max_tokens === 1) { route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "m", content: [{ type: "text", text: "hi" }] }) }); return; }
      const prompt = (body.messages[0].content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      calls.push({ model: body.model, sys: !!body.system, kind: (/\[작업\][^\n]{0,40}/.exec(prompt) || [""])[0], thinking: body.thinking && body.thinking.type });
      route.fulfill({ status: 200, contentType: "text/event-stream", body: mock.sse(JSON.stringify(mock.answer(prompt))) });
    });
    return ctx;
  }
  const errors = [];
  const ctx = await newCtx();
  await ctx.addInitScript(() => { localStorage.setItem("orun_api_key", "sk-ant-api03-test"); localStorage.setItem("orun_api_model", "opus"); });
  const page = await ctx.newPage();
  page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  await page.goto("http://127.0.0.1:8766/app.html");
  await page.waitForFunction(() => window.ORACLE && ORACLE.APP.state.booted, null, { timeout: 30000 });
  ok(await page.evaluate(() => !!ORACLE.APP.stage()), "3D 무대가 켜졌다");
  ok(await page.evaluate(() => document.getElementById("engine").classList.contains("ok")), "엔진 LED 켜짐 (저장된 키)");
  ok(!(await page.evaluate(() => document.getElementById("onboard").hidden)), "온보딩 스트립이 보인다");
  // 0. 씨앗 — 흑석고 윤은영(영어A) · 전정이(영어B)
  const seed = await page.evaluate(() => [...ORACLE.APP.state.teachers.values()].map(t => t.name + "/" + t.subject + "/" + t.school).sort());
  ok(seed.join(",") === "윤은영/영어A/흑석고,전정이/영어B/흑석고", "씨앗 선생님 2명: " + seed.join(", "));
  ok(await page.evaluate(() => document.getElementById("brand").textContent.includes("흑석고") || document.getElementById("wordsSchool").textContent.includes("흑석고")), "학교 이름이 화면에");
  const fonts = await page.evaluate(() => ({ body: getComputedStyle(document.body).fontFamily, kr: getComputedStyle(document.documentElement).getPropertyValue("--fk") }));
  ok(/Orbitron/.test(fonts.body) && /Noto Sans KR/.test(fonts.body) && /Noto Sans KR/.test(fonts.kr), "폰트 Orbitron(영문) + Noto Sans KR(한글): " + fonts.body.slice(0, 60));
  await page.waitForFunction(() => ORACLE.SYNC.st.status === "ok" && !ORACLE.SYNC.st.pending, null, { timeout: 20000 });
  ok(cloudOps.put >= 2 && [...cloud.values()].filter(x => x.store === "teachers").length === 2, "씨앗 선생님이 클라우드에 올라갔다 (put " + cloudOps.put + ")");
  ok(await page.evaluate(() => document.getElementById("cloud").classList.contains("ok")), "클라우드 LED 켜짐");
  // A. 선생님 만들기 (UI)
  await page.click("#btnNew"); await page.fill("#tfName", "김영어"); await page.fill("#tfSchool", "흑석고"); await page.click("#tfOk");
  await page.waitForFunction(() => ORACLE.APP.state.teachers.size === 3);
  const tid = await page.evaluate(() => [...ORACLE.APP.state.teachers.values()].find(t => t.name === "김영어").id);
  ok(await page.evaluate((id) => ORACLE.APP.stage().teachers().includes(id), tid), "홀로그램이 추가됐다 (3개)");
  ok(await page.evaluate(() => document.getElementById("panelL").textContent.includes("김영어")), "SYSTEM STATUS 패널에 선생님 정보");
  // B. 파일 넣기 — 범위 원문 → 프린트 → 기출 2건
  const fx = (n) => fs.readFileSync(path.join(T, "fixtures") + "/" + n, "utf8");
  const enq = async (name, text) => page.evaluate(([id, name, text]) => { const f = new File([text], name, { type: "text/plain" }); ORACLE.APP.enqueue([f], id, { x: 700, y: 300 }); }, [tid, name, text]);
  await enq("교과서_시험범위.txt", fx("scope.txt"));
  await page.waitForFunction(() => ORACLE.APP.state.queue.length === 1 && ["done", "error"].includes(ORACLE.APP.state.queue[0].stage), null, { timeout: 60000 });
  let j = await page.evaluate(() => ORACLE.APP.state.queue.map(j => ({ stage: j.stage, kind: j.kind, detail: j.detail, error: j.error, doneText: j.doneText })));
  ok(j[0].stage === "done" && j[0].kind === "scope", "범위 원문 색인 완료: " + JSON.stringify(j[0]));
  await enq("2025_1학기_중간_대비_프린트.txt", fx("handout.txt"));
  await page.waitForFunction(() => ORACLE.APP.state.queue.length === 2 && ["done", "error"].includes(ORACLE.APP.state.queue[1].stage), null, { timeout: 60000 });
  j = await page.evaluate(() => ORACLE.APP.state.queue.map(j => ({ stage: j.stage, kind: j.kind, detail: j.detail, error: j.error, doneText: j.doneText })));
  ok(j[1].stage === "done" && j[1].kind === "handout" && /지문 2 · 포인트 6/.test(j[1].doneText || ""), "프린트 색인 완료: " + JSON.stringify(j[1]));
  const hsrc = await page.evaluate(async (id) => { const s = (await ORACLE.DB.where("sources", "teacherId", id)).find(x => x.kind === "프린트"); return { kind: s.kind, target: s.target, items: s.items.map(i => i.kind), passages: s.passages, refl: s.reflection }; }, tid);
  ok(hsrc.target.year === 2025 && hsrc.target.semester === 1 && hsrc.target.term === "중간" && hsrc.items.join(",") === "어법,어법,어법,어휘,예상문제,예상문제" && hsrc.refl === null, "프린트 자료: 대상 시험 추정 · 포인트 " + hsrc.items.join("/"));
  await enq("2025_1학기_중간_기출.txt", fx("exam1.txt")); await enq("2025_2학기_기말_기출.txt", fx("exam2.txt"));
  await page.waitForFunction(() => ORACLE.APP.state.queue.length === 4 && ORACLE.APP.state.queue.every(j => ["done", "error", "cancelled"].includes(j.stage)), null, { timeout: 120000 });
  j = await page.evaluate(() => ORACLE.APP.state.queue.map(j => ({ stage: j.stage, kind: j.kind, detail: j.detail, error: j.error })));
  ok(j.slice(2).every(x => x.stage === "done" && x.kind === "exam"), "기출 2건 데이터화 완료: " + JSON.stringify(j.slice(2)));
  await page.waitForFunction(() => ORACLE.APP.state.profiles.size === 1, null, { timeout: 60000 });
  const c = await page.evaluate((id) => ORACLE.APP.state.counts.get(id), tid);
  ok(c.exams === 2 && c.passages === 8 && c.questions === 14 && c.sources === 2, "카운트 exams/passages/questions/sources = " + JSON.stringify(c));
  ok(c.matched >= 10, "문항↔지문 매칭 " + c.matched + "/" + c.matchable);
  const prof = await page.evaluate((id) => { const p = ORACLE.APP.state.profiles.get(id); return { v: p.version, level: p.profile.level, rel: p.profile.reliability, types: Object.keys(p.profile.typeDist), narr: !!p.narrative, delta: p.delta, gp: p.profile.grammarPoints.map(g => g.point), ai: p.profile.ai.mean, handout: p.profile.handout }; }, tid);
  ok(prof.v === 1 && prof.narr && prof.types.length >= 4, "프로파일 v1: " + JSON.stringify(Object.assign({}, prof, { handout: undefined })));
  // B2. 프린트 반영율 — 프린트(1학기 중간용)가 그 시험에서 실제로 얼마나 나왔나
  const refl = await page.evaluate(async (id) => { const exams = await ORACLE.DB.where("exams", "teacherId", id); const qs = await ORACLE.DB.where("questions", "teacherId", id); const src = (await ORACLE.DB.where("sources", "teacherId", id)).find(x => x.kind === "프린트"); return { exams: exams.map(e => ({ label: ORACLE.TEXT.examLabel(e.meta), r: e.reflection && { rate: e.reflection.rate, n: e.reflection.n, kinds: e.reflection.kinds } })), hits: qs.filter(q => q.handoutHit).map(q => q.number + ":" + q.handoutHit.kinds.join("+")), src: src.reflection && { rate: src.reflection.rate, hit: src.reflection.hit, n: src.reflection.n, exams: src.reflection.exams.length } }; }, tid);
  const mid = refl.exams.find(e => /1학기 중간/.test(e.label));
  ok(mid && mid.r && mid.r.rate >= 0.4 && mid.r.kinds["지문"] >= 1 && mid.r.kinds["어법"] >= 1 && mid.r.kinds["예상문제"] >= 1, "1학기 중간 반영율 " + JSON.stringify(mid && mid.r) + " · 적중 " + refl.hits.join(" "));
  ok(refl.src && refl.src.n === 14 && refl.src.exams === 2 && refl.src.rate > 0, "프린트 자료에 반영율 저장: " + JSON.stringify(refl.src));
  ok(prof.handout && prof.handout.rate > 0 && prof.handout.nExams === 2 && prof.handout.byExam.length === 2, "프로파일 프린트 반영율: " + JSON.stringify(prof.handout));
  ok(await page.evaluate(() => document.getElementById("statusBody").textContent.includes("프린트 → 시험")), "SYSTEM STATUS 에 프린트 반영율 행");
  ok(await page.evaluate(() => document.getElementById("intelBody").textContent.includes("빈칸")), "GLOBAL INTELLIGENCE 패널에 유형 분포");
  ok(await page.evaluate(() => document.getElementById("onboard").hidden), "온보딩이 사라졌다");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(T, "out") + "/e2e-1-learned.png" });
  // C. 예측
  const pred = await page.evaluate(async (id) => { const r = await ORACLE.APP.predict(id); return { total: r.blueprint.plan.total, obj: r.blueprint.plan.objective, subj: r.blueprint.plan.subjective, np: r.blueprint.passages.length, top: r.blueprint.passages[0], onH: r.blueprint.passages.filter(p => p.onHandout).length, handout: r.blueprint.handout, conf: r.blueprint.confidence.overall, moves: r.blueprint.newMoves, copy: r.copyText.length, copyHas: /프린트/.test(r.copyText), target: r.target.label }; }, tid);
  ok(pred.np >= 6 && pred.total >= 6 && pred.copy > 200, "예측: " + JSON.stringify(Object.assign({}, pred, { top: pred.top.passageId + " " + pred.top.pUse, handout: undefined })));
  ok(pred.handout && pred.handout.passagesOnHandout >= 1 && pred.onH >= 1 && pred.copyHas, "예측에 프린트 반영: " + JSON.stringify(pred.handout));
  ok(await page.evaluate(() => document.getElementById("dataBody").textContent.includes("유력 지문")), "REAL-TIME DATA 패널에 예측 표시");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(T, "out") + "/e2e-2-predicted.png" });
  // D. 적중 모의고사
  const mockRes = await page.evaluate(async (id) => { const m = await ORACLE.APP.generateMock(id, { count: 8 }); return { n: m.questions.length, failed: m.failed, first: m.questions[0], types: m.questions.map(q => q.type + "/" + q.number) }; }, tid);
  ok(mockRes.n >= 7 && mockRes.failed.length === 0, "모의고사 " + mockRes.n + "문항 (실패 " + mockRes.failed.length + "): " + mockRes.types.join(" "));
  ok(await page.evaluate(() => document.getElementById("paper").classList.contains("on") && document.querySelectorAll("#paperPage .pq").length >= 7), "시험지 미리보기 열림");
  await page.screenshot({ path: path.join(T, "out") + "/e2e-3-paper.png" });
  const docxSize = await page.evaluate(async (id) => { const ms = await ORACLE.DB.where("mocks", "teacherId", id); const b = await ORACLE.GENERATE.docx(ms[0], ORACLE.APP.teacher(id)); return b.size; }, tid);
  ok(docxSize > 4000, "DOCX 생성 " + docxSize + " bytes");
  await page.click("#paperClose");
  // E. 드로어
  await page.click("#panelL [data-exam]");
  await page.waitForFunction(() => document.getElementById("drawer").classList.contains("on") && document.querySelectorAll("#drawerBody [data-q]").length > 0);
  ok(await page.evaluate(() => document.getElementById("drawerBody").textContent.includes("★")), "시험 드로어 열림 · 문항 " + await page.evaluate(() => document.querySelectorAll("#drawerBody [data-q]").length) + " · 프린트 적중 표시");
  await page.click("#drawerBody [data-q]"); await page.waitForFunction(() => document.getElementById("drawerTitle").textContent.includes("번"));
  ok(await page.evaluate(() => document.getElementById("drawerBody").textContent.includes("매칭 지문")), "문항 드로어 열림: " + await page.evaluate(() => document.getElementById("drawerTitle").textContent));
  await page.screenshot({ path: path.join(T, "out") + "/e2e-4-drawer.png" });
  await page.keyboard.press("Escape");
  await page.evaluate(() => ORACLE.UI.openDrawer("handouts")); await page.waitForTimeout(300);
  ok(await page.evaluate(() => document.getElementById("drawer").classList.contains("on") && /반영/.test(document.getElementById("drawerBody").textContent)), "프린트 드로어에 반영율");
  await page.screenshot({ path: path.join(T, "out") + "/e2e-7-handouts.png" });
  await page.keyboard.press("Escape");
  // F. 백업
  const [dl] = await Promise.all([page.waitForEvent("download"), page.evaluate(() => ORACLE.APP.exportJson(null))]);
  const jsonPath = await dl.path(); const bk = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  ok(bk.app === "orun-oracle" && bk.teachers.length === 3 && bk.questions.length === 14 && bk.profiles.length === 1 && bk.sources.length === 2, "백업 JSON: teachers " + bk.teachers.length + " · questions " + bk.questions.length + " · " + dl.suggestedFilename());
  // G. 새로 고침 뒤 복원
  await page.reload(); await page.waitForFunction(() => window.ORACLE && ORACLE.APP.state.teachers.size === 3 && ORACLE.APP.state.profiles.size === 1, null, { timeout: 30000 });
  ok(await page.evaluate(() => document.getElementById("dataBody").textContent.includes("유력 지문")), "새로 고친 뒤 프로파일·예측 복원");
  await page.waitForFunction(() => ORACLE.SYNC.st.status === "ok" && !ORACLE.SYNC.st.pending, null, { timeout: 20000 });
  const cs = {}; [...cloud.values()].forEach(x => { cs[x.store] = (cs[x.store] || 0) + 1; });
  ok(cs.teachers === 3 && cs.questions === 14 && cs.passages === 8 && cs.sources === 2 && cs.exams === 2 && cs.profiles === 1 && cs.predictions === 1 && cs.mocks === 1 && !cs.media, "클라우드 거울: " + JSON.stringify(cs));
  // H0. PDF 추출 경로 (pdf.js + 미리 읽은 워커) — 시험지를 PDF 로 찍어 넣는다
  const pdfPage = await ctx.newPage();
  await pdfPage.setContent("<pre style='font-family:serif;font-size:11pt;white-space:pre-wrap'>" + fx("exam1.txt").replace(/1학기 중간/g, "2학기 중간").replace(/</g, "&lt;") + "</pre>");
  const pdfBuf = await pdfPage.pdf({ format: "A4" }); await pdfPage.close();
  await page.evaluate(async ([id, b64]) => { const bin = atob(b64); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); ORACLE.APP.enqueue([new File([u8], "2025_2학기_중간_기출.pdf", { type: "application/pdf" })], id); }, [tid, pdfBuf.toString("base64")]);
  await page.waitForFunction(() => { const j = ORACLE.APP.state.queue.find(x => x.name.endsWith(".pdf")); return j && ["done", "error"].includes(j.stage); }, null, { timeout: 90000 });
  const pj = await page.evaluate(() => { const j = ORACLE.APP.state.queue.find(x => x.name.endsWith(".pdf")); return { stage: j.stage, detail: j.detail, error: j.error, chars: j.text.length, pages: j.pages }; });
  ok(pj.stage === "done" && pj.chars > 1500, "PDF 추출·데이터화: " + JSON.stringify(pj));
  // H1. 배경 영상 슬롯 (힉스필드 영상 자리)
  const bg = await page.evaluate(async () => {
    const cv = document.createElement("canvas"); cv.width = 320; cv.height = 180; const c2 = cv.getContext("2d");
    const rec = new MediaRecorder(cv.captureStream(15), { mimeType: "video/webm;codecs=vp8" }); const chunks = []; rec.ondataavailable = e => chunks.push(e.data);
    rec.start(); for (let i = 0; i < 12; i++) { c2.fillStyle = "hsl(" + i * 30 + ",80%,40%)"; c2.fillRect(0, 0, 320, 180); c2.fillStyle = "#fff"; c2.fillRect(i * 20, 60, 40, 40); await new Promise(r => setTimeout(r, 70)); }
    await new Promise(r => { rec.onstop = r; rec.stop(); });
    const file = new File(chunks, "higgsfield.webm", { type: "video/webm" });
    await ORACLE.APP.setBgVideo(file); await new Promise(r => setTimeout(r, 800));
    return { size: file.size, has: ORACLE.APP.state.bg.hasVideo, src: !!document.getElementById("bgVideo").src, media: !!(await ORACLE.DB.get("media", "bg")) }; });
  ok(bg.has && bg.src && bg.media, "배경 영상 저장·적용: " + JSON.stringify(bg));
  await page.waitForTimeout(800); await page.screenshot({ path: path.join(T, "out") + "/e2e-6-video.png" });
  await page.evaluate(() => ORACLE.APP.setBgVideo(null));
  // H. 청사진 복사 버튼
  await page.evaluate(() => document.getElementById("rCopy").click()); await page.waitForTimeout(300);
  ok(await page.evaluate(() => document.getElementById("toasts").textContent.includes("청사진")), "청사진 복사 토스트");
  console.log("API calls:", calls.length, JSON.stringify(calls.reduce((m, c) => { m[c.kind || "?"] = (m[c.kind || "?"] || 0) + 1; return m; }, {})), "models:", [...new Set(calls.map(c => c.model))].join(","), "thinking:", [...new Set(calls.map(c => c.thinking))].join(","));
  await ctx.close();
  // I. 다른 브라우저(빈 IndexedDB) — 클라우드에서 복원 + 2D 폴백 (좁은 화면) + 키 없음
  const ctx2 = await newCtx({ viewport: { width: 600, height: 900 } });
  const p2 = await ctx2.newPage(); p2.on("pageerror", e => errors.push("pageerror(flat): " + e.message));
  await p2.goto("http://127.0.0.1:8766/app.html"); await p2.waitForFunction(() => window.ORACLE && ORACLE.APP.state.booted);
  ok(await p2.evaluate(() => ORACLE.APP.state.mode === "flat" && document.body.classList.contains("flat")), "좁은 화면 → 2D 모드");
  ok(await p2.evaluate(() => ORACLE.APP.state.teachers.size === 3 && ORACLE.APP.state.profiles.size === 1 && ORACLE.APP.state.predictions.size === 1), "빈 브라우저가 클라우드에서 선생님 3명·프로파일·예측을 받았다");
  await p2.click("#btnNew"); await p2.fill("#tfName", "박선생"); await p2.fill("#tfSchool", "흑석고"); await p2.click("#tfOk");
  await p2.waitForFunction(() => document.querySelectorAll("#flatGrid .tcard[data-id]").length === 4);
  ok(true, "2D 카드 생성 (4장)");
  await p2.waitForTimeout(1200);
  ok(await p2.evaluate(() => document.getElementById("toasts").textContent.includes("API 키") || document.getElementById("onboard").hidden === false || document.getElementById("engine").classList.contains("off") || !document.getElementById("engine").classList.contains("ok")), "키 없음 표시");
  await p2.screenshot({ path: path.join(T, "out") + "/e2e-5-flat.png" });
  await ctx2.close();
  await browser.close(); srv.close();
  const realErrors = errors.filter(e => !/favicon|ERR_FAILED|net::ERR/.test(e));
  ok(realErrors.length === 0, "콘솔 오류 없음" + (realErrors.length ? ":\n  " + realErrors.join("\n  ") : ""));
  console.log(process.exitCode ? "SOME CHECKS FAILED" : "ALL PASSED");
})().catch(e => { console.error("CRASH", e); process.exit(1); });
