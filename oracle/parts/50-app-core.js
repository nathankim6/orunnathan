  // ==================================================================
  //  APP — 상태 · 저장 · 큐(파일 → 데이터화) · 학습 · 예측 · 적중 모의고사 · 내보내기
  // ==================================================================
  const APP = (function () {
    const $ = (id) => document.getElementById(id);
    const state = {
      teachers: new Map(), selectedId: null, hoverId: null, queue: [], running: 0, busy: new Map(),   // busy: teacherId → 문구
      profiles: new Map(), predictions: new Map(), counts: new Map(), mode: "stage",
      ui: { autoLearn: true, quality: "auto", reduced: false, forceFlat: false, onboardingDone: false, lastTeacherId: null, light: true, showFps: false },
      bg: { opacity: 0.35, field: 60, hasVideo: false },
    };
    let stage = null, listeners = [];
    const on = (fn) => listeners.push(fn);
    const emit = (why, data) => listeners.forEach(fn => { try { fn(why, data); } catch (e) { console.error(e); } });
    const PALETTE = ["#4fd8ff", "#7c9cff", "#3ef2c8", "#ff7ad9", "#ffc857", "#b07cff", "#ff8a5f", "#4adf9e"];
    const calm = () => state.ui.reduced || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const teacher = (id) => state.teachers.get(id);
    const sub = (t) => [t.school, t.grade ? t.grade + "학년" : "", t.subject].filter(Boolean).join(" · ");
    const SEED = [{ name: "윤은영", school: "흑석고", grade: 1, subject: "영어A", color: "#5fc8ff" }, { name: "전정이", school: "흑석고", grade: 1, subject: "영어B", color: "#7c9cff" }];
    function log(teacherId, kind, msg, ref) { DB.put("events", { id: uid("ev"), teacherId: teacherId || null, at: Date.now(), kind, msg: String(msg || "").slice(0, 300), ref: ref || {} }).catch(() => {}); }

    // ---- 부팅 ----
    async function boot() {
      const ui = await DB.setting("ui", null); if (ui) Object.assign(state.ui, ui);
      const bg = await DB.setting("bg", null); if (bg) Object.assign(state.bg, bg);
      API.setLight(state.ui.light !== false);
      // 클라우드(Supabase) → 로컬. 실패해도 로컬로 계속 간다.
      state.cloud = await SYNC.bootstrap(DB);
      (await DB.all("teachers")).sort((a, b) => (a.slot || 0) - (b.slot || 0)).forEach(t => state.teachers.set(t.id, t));
      if (!state.teachers.size && !(await DB.setting("seeded", false))) {      // 첫 실행: 흑석고 선생님 두 분
        for (const d of SEED) { const t = { id: uid("t"), name: d.name, school: d.school, grade: d.grade, subject: d.subject, color: d.color, slot: state.teachers.size, note: "", createdAt: Date.now(), updatedAt: Date.now(), stats: {} }; await DB.put("teachers", t); state.teachers.set(t.id, t); }
        await DB.setSetting("seeded", true);
      }
      for (const t of state.teachers.values()) { await refreshCounts(t.id); await loadLatest(t.id); }
      const canGL = (() => { try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; } })();
      const phone = window.innerWidth < 720;
      state.mode = (!canGL || state.ui.forceFlat || phone || typeof THREE === "undefined") ? "flat" : "stage";
      if (state.mode === "stage") {
        const lowEnd = state.ui.quality === "low" || (state.ui.quality === "auto" && ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 2));
        stage = makeStage($("fx"), { reducedMotion: calm(), lowEnd, onSelect: (id) => { if (id) select(id); else emit("stageTap"); }, onHover: (id) => { state.hoverId = id; emit("hover", id); }, onDegrade: () => emit("toast", { msg: "화면이 버거워 화질을 낮췄어요" }) });
        if (!stage) state.mode = "flat";
      }
      document.body.classList.toggle("flat", state.mode === "flat");
      if (window.innerWidth < 900) { document.body.classList.add("hideL", "hideR"); const l = $("togL"), r = $("togR"); if (l) l.textContent = "›"; if (r) r.textContent = "‹"; }
      if (stage) {
        for (const t of state.teachers.values()) { stage.addTeacher(stageTeacher(t)); const p = state.profiles.get(t.id); if (p) stage.setProfile(t.id, p.constellation || null); const pr = state.predictions.get(t.id); if (pr) stage.fx.predict(t.id, predictBars(pr.blueprint)); }
        if (state.bg.hasVideo) { try { const m = await DB.get("media", "bg"); if (m && m.blob) applyVideo(m.blob); } catch (e) {} }
      }
      const last = state.ui.lastTeacherId;
      if (last && state.teachers.has(last)) select(last, true); else if (state.teachers.size) select([...state.teachers.keys()][0], true);
      state.booted = true;
      emit("boot");
      window.addEventListener("beforeunload", (e) => { if (state.queue.some(j => !["done", "error", "cancelled"].includes(j.stage))) { e.preventDefault(); e.returnValue = ""; } });
    }
    function stageTeacher(t) { const c = state.counts.get(t.id) || {}; const p = state.profiles.get(t.id); return { id: t.id, name: t.name, sub: t.subject || "", school: t.school || "", tag: p ? "LV." + p.profile.level.id + " · " + (c.questions || 0) + " Q · V" + p.version : "ALWAYS LEARNING", color: t.color, level: c.questions || 0 }; }
    async function refreshCounts(id) {
      const [exams, sources, questions, passages] = await Promise.all([DB.count("exams", "teacherId", id), DB.count("sources", "teacherId", id), DB.where("questions", "teacherId", id), DB.where("passages", "teacherId", id)]);
      const matched = questions.filter(q => q.match && q.match.passageId && q.setRole !== "member").length, withP = questions.filter(q => q.passage && q.passage.has && q.setRole !== "member").length;
      const c = { exams, sources, questions: questions.length, passages: passages.filter(p => p.kind === "지문").length, matched, matchable: withP };
      state.counts.set(id, c); return c;
    }
    async function loadLatest(id) {
      const ps = await DB.where("profiles", "teacherId", id); ps.sort((a, b) => b.version - a.version);
      if (ps[0]) state.profiles.set(id, ps[0]); else state.profiles.delete(id);
      const pr = await DB.where("predictions", "teacherId", id); pr.sort((a, b) => b.createdAt - a.createdAt);
      if (pr[0]) state.predictions.set(id, pr[0]); else state.predictions.delete(id);
    }
    async function saveUi(patch) { Object.assign(state.ui, patch || {}); await DB.setSetting("ui", state.ui); }
    async function saveBg(patch) { Object.assign(state.bg, patch || {}); await DB.setSetting("bg", state.bg); }

    // ---- 선생님 ----
    async function createTeacher(d) {
      const used = new Set([...state.teachers.values()].map(t => t.color));
      const color = d.color || PALETTE.find(c => !used.has(c)) || PALETTE[state.teachers.size % PALETTE.length];
      const t = { id: uid("t"), name: String(d.name || "").trim().slice(0, 20), school: String(d.school || "").trim().slice(0, 30), grade: +d.grade || 1, subject: String(d.subject || "영어").trim().slice(0, 20), color, slot: state.teachers.size, note: "", createdAt: Date.now(), updatedAt: Date.now(), stats: {} };
      await DB.put("teachers", t); state.teachers.set(t.id, t); state.counts.set(t.id, { exams: 0, sources: 0, questions: 0, passages: 0, matched: 0, matchable: 0 });
      if (stage) stage.addTeacher(stageTeacher(t));
      log(t.id, "teacher.create", t.name);
      emit("teachers"); select(t.id);
      return t;
    }
    async function updateTeacher(id, patch) {
      const t = teacher(id); if (!t) return;
      Object.assign(t, patch, { updatedAt: Date.now() }); await DB.put("teachers", t);
      if (stage) stage.updateTeacher(stageTeacher(t));
      emit("teachers"); emit("select");
    }
    async function deleteTeacher(id) {
      const t = teacher(id); if (!t) return;
      if (state.busy.has(id)) { emit("toast", { msg: "학습·예측·출제가 끝난 뒤 지울 수 있어요", bad: true }); return; }
      clearTimeout(learnTimers[id]);
      state.queue = state.queue.filter(j => j.teacherId !== id || (j.ctrl && j.ctrl.abort(), false));
      state.teachers.delete(id); state.counts.delete(id); state.profiles.delete(id); state.predictions.delete(id);
      for (const s of ["exams", "questions", "passages", "sources", "profiles", "predictions", "mocks", "events"]) await DB.delWhere(s, "teacherId", id);
      await DB.del("teachers", id);
      if (stage) stage.removeTeacher(id);
      if (state.selectedId === id) { state.selectedId = null; if (stage) stage.focus(null); }
      emit("teachers"); emit("select");
    }
    function select(id, silent) {
      state.selectedId = id;
      if (stage && !silent) stage.focus(id);
      saveUi({ lastTeacherId: id }).catch(() => {});
      emit("select", id);
    }

    // ---- 큐 ----
    const VIDEO_RE = /\.(mp4|webm)$/i;
    // enqueue(files, teacherId, at, { memo, kinds }) — memo 는 파일과 함께 모델에 전하는 말, kinds 는 파일별 종류(exam|scope|handout, 빈 값이면 자동)
    function enqueue(files, teacherId, at, opts) {
      const t = teacher(teacherId); if (!t) return [];
      const jobs = [];
      const memo = String(opts && opts.memo || "").trim().slice(0, 600);
      const kinds = (opts && Array.isArray(opts.kinds)) ? opts.kinds : [];
      let n = 0, fi = -1;
      for (const f of files) {
        fi++;
        if (VIDEO_RE.test(f.name)) { emit("askVideo", f); continue; }
        if (n >= 20) { emit("toast", { msg: "한 번에 20개까지 넣을 수 있어요 — 나머지는 다음에 넣어 주세요" }); break; }
        n++;
        const ext = EXTRACT.extOf(f.name);
        const job = { id: uid("j"), teacherId, file: f, name: f.name, ext, size: f.size, kind: "auto", kindGuess: null, stage: "queued", progress: 0, detail: "대기", text: "", error: null, ctrl: null, force: false, memo, createdAt: Date.now() };
        if (KINDS.includes(kinds[fi])) { job.kind = kinds[fi]; job.kindForced = true; }
        if (!EXTRACT.ACCEPT.split(",").includes("." + ext)) { job.stage = "error"; job.error = "지원하지 않는 형식이에요: ." + ext + " (PDF·워드·한글·엑셀·텍스트·사진)"; }
        jobs.push(job); state.queue.push(job);
      }
      if (stage && jobs.length) stage.fx.ingest(teacherId, at && at.x, at && at.y);
      emit("queue"); runQueue();
      return jobs;
    }
    function setJobKind(job, kind) { job.kind = kind; job.kindForced = true; emit("queue"); }
    const KINDS = ["exam", "scope", "handout"];
    function cycleJobKind(job) { const i = KINDS.indexOf(job.kind); setJobKind(job, KINDS[(i + 1) % KINDS.length]); }
    function cancelJob(job) { if (job.ctrl) job.ctrl.abort(); if (job.stage === "queued") { job.stage = "cancelled"; job.detail = "취소됨"; } emit("queue"); }
    function retryJob(job, force) { job.stage = "queued"; job.error = null; job.detail = "대기"; job.force = !!force; job.tries = (job.tries || 0) + 1; emit("queue"); runQueue(); }
    function cancelAll() { state.queue.forEach(j => { if (j.stage === "queued") { j.stage = "cancelled"; j.detail = "취소됨"; } else if (j.ctrl) j.ctrl.abort(); }); emit("queue"); }
    function clearDone() { state.queue = state.queue.filter(j => !["done", "cancelled"].includes(j.stage)); emit("queue"); }
    async function runQueue() {
      if (state.running >= 1) return;
      const job = state.queue.find(j => j.stage === "queued"); if (!job) return;
      if (!API.ready()) { if (!state.askedKey) { state.askedKey = true; emit("needKey"); } job.detail = "API 키를 저장하면 시작해요"; emit("queue", job); return; }
      state.running++;
      try { await runJob(job); } catch (e) { console.error(e); }
      state.running--;
      runQueue();
    }
    const step = (job, stg, detail, progress) => { job.stage = stg; job.detail = detail; if (progress !== undefined) job.progress = progress; emit("queue", job); };
    async function withRetry(job, fn) {
      for (let i = 0; ; i++) {
        try { return await fn(); }
        catch (e) {
          if ((e.code === "rate_limited" || e.code === "overloaded") && i < 3) {
            const wait = 20 * (i + 1);
            for (let s = wait; s > 0; s--) { if (job.ctrl.signal.aborted) throw API.err("cancelled", "중단됨"); job.detail = (e.code === "rate_limited" ? "요청이 잦아 잠시 쉬는 중" : "API 가 붐벼 잠시 쉬는 중") + " · " + s + "초"; emit("queue", job); await new Promise(r => setTimeout(r, 1000)); }
            continue;
          }
          throw e;
        }
      }
    }
    async function runJob(job) {
      const t = teacher(job.teacherId); if (!t) { job.stage = "cancelled"; return; }
      job.ctrl = new AbortController(); const signal = job.ctrl.signal;
      const think = (on) => { if (stage) stage.fx.thinking(job.teacherId, on); if (on) state.busy.set(job.teacherId, job.detail); else state.busy.delete(job.teacherId); };
      try {
        step(job, "extract", "글자 읽는 중", 0.05);
        const r = await withRetry(job, () => EXTRACT.fromFile(job.file, { signal, onStep: (i) => { if (i.phase === "render" || i.phase === "read") step(job, "ocr", "스캔본 읽는 중 · " + i.page + "/" + i.total + "쪽", 0.05 + 0.3 * (i.page / i.total)); } }));
        job.text = r.text; job.ocr = !!r.ocr; job.pages = r.pages || 0; job.note = r.note || "";
        if (job.text.replace(/\s/g, "").length < 80) throw new Error("읽어낸 글자가 너무 적어요 — 문항이 다 들어 있는지 확인해 주세요");
        // 종류 판정
        step(job, "classify", "어떤 파일인지 보는 중", 0.36);
        let llmMeta = null;
        if (!job.kindForced) {
          const g = TEXT.guessKind(job.name, job.text);
          job.kindGuess = g;
          if (!g.sure && API.ready()) { try { const c = await withRetry(job, () => ANALYZE.classifyLLM(job.name, job.text, signal, job.memo)); job.kindGuess = { kind: c.kind, confidence: c.confidence, sure: true, by: "llm" }; llmMeta = c.meta; } catch (e) { if (e.code === "cancelled") throw e; } }
          if (!job.kindForced) job.kind = job.kindGuess.kind;
        }
        const hash = await TEXT.sha256(TEXT.norm(job.text).slice(0, 20000));
        if (!KINDS.includes(job.kind)) job.kind = "exam";
        const dupStore = job.kind === "exam" ? "exams" : "sources";
        const dup = (await DB.where(dupStore, "teacherId", job.teacherId)).find(x => x.hash === hash);
        if (dup && !job.force) { job.stage = "error"; job.error = "이미 넣은 파일이에요 (" + (dup.title || dup.name) + ")"; job.canForce = true; emit("queue", job); return; }
        if (!API.ready()) throw API.err("no_key", "API 키가 없어요 — 설정에서 키를 넣어 주세요");
        think(true);
        if (job.kind === "exam") await runExam(job, t, hash, llmMeta, signal);
        else if (job.kind === "handout") await runHandout(job, t, hash, signal);
        else await runScope(job, t, hash, signal);
        think(false);
        step(job, "done", job.doneText, 1);
        await refreshCounts(job.teacherId);
        if (stage) stage.setLevel(job.teacherId, state.counts.get(job.teacherId).questions);
        emit("data", job.teacherId);
        scheduleLearn(job.teacherId);
      } catch (e) {
        think(false);
        if (e.code === "cancelled" || signal.aborted) { step(job, "cancelled", "취소됨"); return; }
        job.stage = "error"; job.error = API.friendly(e); job.progress = 0; emit("queue", job);
        if (e.code === "bad_key" || e.code === "no_credit") { emit("needKey"); }
        log(job.teacherId, "error", job.name + ": " + job.error);
      }
    }
    async function runExam(job, t, hash, llmMeta, signal) {
      const meta = TEXT.guessExamMeta((job.memo ? job.memo + "\n" : "") + job.text, job.name, t);   // 메모에 "2학기 기말" 이라 적었으면 그것이 먼저 잡힌다
      if (llmMeta) { if (llmMeta.year && +llmMeta.year) { meta.year = +llmMeta.year; meta.yearGuessed = false; } if (/[12]/.test(llmMeta.semester || "")) { meta.semester = +/[12]/.exec(llmMeta.semester)[0]; meta.semesterGuessed = false; } if (llmMeta.term) { meta.term = /기말/.test(llmMeta.term) ? "기말" : /중간/.test(llmMeta.term) ? "중간" : meta.term; meta.termGuessed = false; } if (llmMeta.school) { meta.school = llmMeta.school; meta.schoolGuessed = false; } if (llmMeta.subject) { meta.subject = llmMeta.subject; meta.subjectGuessed = false; } }
      const r = await withRetry(job, () => ANALYZE.dataizeExam(job.text, { signal, memo: job.memo, onStep: (i) => step(job, "analyze", "문항 분석 " + i.i + "/" + i.n + (i.detail ? " · " + i.detail : ""), 0.4 + 0.3 * (i.i / i.n)) }));
      if (!r.questions.length) throw new Error("문항을 찾지 못했어요 — 범위 원문이라면 칩을 '범위'로 바꿔 주세요");
      if (r.info.year && meta.yearGuessed) { meta.year = r.info.year; meta.yearGuessed = false; }
      if (r.info.semester && meta.semesterGuessed) { meta.semester = r.info.semester; meta.semesterGuessed = false; }
      if (r.info.term && meta.termGuessed && /중간|기말|지필/.test(r.info.term)) { meta.term = r.info.term; meta.termGuessed = false; }
      if (r.info.subject && meta.subjectGuessed) { meta.subject = r.info.subject; meta.subjectGuessed = false; }
      const examId = uid("e");
      const passages = await DB.where("passages", "teacherId", t.id);
      step(job, "match", "지문과 맞춰 보는 중", 0.72);
      let mres = { matched: 0 };
      const complete = (await DB.where("sources", "teacherId", t.id)).some(s => s.kind !== "프린트" && s.complete);
      if (passages.length) mres = await withRetry(job, () => ANALYZE.matchQuestions(r.questions, passages, { signal, complete, onStep: (i) => step(job, "match", "지문과 맞춰 보는 중 " + i.i + "/" + i.n, 0.72) }));
      step(job, "ai", "AI 활용 정황 살피는 중", 0.82);
      const prior = (await DB.where("exams", "teacherId", t.id)).filter(e => e.ai);
      const draft = { ocr: job.ocr, analysis: { hasExplanations: r.info.hasExplanations } };
      const loc = ANALYZE.aiLocal(draft, r.questions, r.answerKeyText, prior);
      let llm = null;
      try { llm = await ANALYZE.aiJudge(draft, r.questions, loc, r.answerKeyText, prior.length ? "이전 시험 " + prior.length + "개의 AI 가능성 평균 " + (prior.reduce((a, e) => a + e.ai.aiLikelihood, 0) / prior.length).toFixed(2) : "", signal); } catch (e) { if (e.code === "cancelled") throw e; }
      const ai = ANALYZE.combineAI(loc, llm, r.questions.length);
      if (signal.aborted || !teacher(t.id)) throw API.err("cancelled", "중단됨");
      step(job, "save", "저장 중", 0.95);
      const exam = { id: examId, teacherId: t.id, title: TEXT.examLabel(meta), meta, file: { name: job.name, ext: job.ext, size: job.size, pages: job.pages, chars: job.text.length }, ocr: job.ocr, text: job.text, hash, memo: job.memo || "",
        status: "analyzed", analysis: { total: r.info.total, objective: r.info.objective, subjective: r.info.subjective, points: r.info.points, summary: r.info.summary, hasExplanations: r.info.hasExplanations, title: r.info.title }, ai, gaps: r.gaps, answerKeyText: r.answerKeyText.slice(0, 20000),
        matched: mres.matched, createdAt: Date.now(), analyzedAt: Date.now(), learnedInVersion: null };
      const qs = r.questions.map(q => Object.assign(q, { id: uid("q"), examId, teacherId: t.id, tags: [], note: "", createdAt: Date.now() }));
      await DB.put("exams", exam); await DB.putAll("questions", qs);
      job.examId = examId; job.doneText = "완료 · 문항 " + qs.length + "개" + (passages.length ? " · 매칭 " + mres.matched : "");
      log(t.id, "ingest", exam.title + " · 문항 " + qs.length, { examId });
    }
    async function runScope(job, t, hash, signal) {
      const list = await withRetry(job, () => ANALYZE.indexScope(job.text, { name: job.name, signal, memo: job.memo, onStep: (i) => step(job, "index", "지문 색인 " + i.i + "/" + i.n, 0.4 + 0.4 * (i.i / i.n)) }));
      const good = list.filter(p => p.kind === "지문");
      if (!good.length) throw new Error("지문을 찾지 못했어요 — 기출 시험지라면 칩을 '기출'로 바꿔 주세요");
      const sourceId = uid("s");
      const kind = /교과서|textbook|lesson/i.test(job.name + job.text.slice(0, 500)) ? "교과서" : /모의고사|모평|학평/.test(job.name) ? "모의고사" : /부교재|워크북|workbook/i.test(job.name) ? "부교재" : "기타";
      const ps = list.map((p, i) => Object.assign(p, { id: uid("p"), teacherId: t.id, sourceId, order: i + 1, createdAt: Date.now() }));
      const src = { id: sourceId, teacherId: t.id, name: job.name.replace(/\.[a-z0-9]+$/i, ""), kind, file: { name: job.name, ext: job.ext, size: job.size, pages: job.pages, chars: job.text.length }, ocr: job.ocr, text: job.text, hash, memo: job.memo || "", passages: good.length, createdAt: Date.now(), complete: false };
      if (signal.aborted || !teacher(t.id)) throw API.err("cancelled", "중단됨");
      step(job, "save", "저장 중", 0.85);
      await DB.put("sources", src); await DB.putAll("passages", ps);
      // 아직 지문을 못 찾은 문항을 다시 맞춰 본다
      const qs = (await DB.where("questions", "teacherId", t.id)).filter(q => q.passage && q.passage.has && !(q.match && q.match.passageId) && q.match.method !== "user");
      if (qs.length) {
        step(job, "match", "기존 문항과 맞춰 보는 중", 0.9);
        const all = await DB.where("passages", "teacherId", t.id);
        try { await withRetry(job, () => ANALYZE.matchQuestions(qs, all, { signal, complete: false })); await DB.putAll("questions", qs); } catch (e) { if (e.code === "cancelled") throw e; }
        // 세트 후속 문항도 함께
        const firsts = {}; qs.forEach(q => { if (q.set && q.setRole === "first") firsts[q.examId + ":" + q.set] = q; });
        const members = (await DB.where("questions", "teacherId", t.id)).filter(q => q.set && q.setRole === "member" && firsts[q.examId + ":" + q.set]);
        members.forEach(q => { q.match = Object.assign({}, firsts[q.examId + ":" + q.set].match, { reason: "세트 첫 문항과 같은 지문" }); }); if (members.length) await DB.putAll("questions", members);
      }
      await refreshExamMatched(t.id);
      job.sourceId = sourceId; job.doneText = "완료 · 지문 " + good.length + "개";
      log(t.id, "index", src.name + " · 지문 " + good.length, { sourceId });
    }
    async function runHandout(job, t, hash, signal) {
      const r = await withRetry(job, () => ANALYZE.indexHandout(job.text, { name: job.name, signal, memo: job.memo, onStep: (i) => step(job, "index", "프린트 읽는 중 " + i.i + "/" + i.n, 0.4 + 0.4 * (i.i / i.n)) }));
      if (!r.passages.length && !r.items.length) throw new Error("프린트에서 지문이나 포인트를 찾지 못했어요 — 기출 시험지라면 칩을 '기출'로 바꿔 주세요");
      const sourceId = uid("s");
      const target = TEXT.guessExamMeta((job.memo ? job.memo + "\n" : "") + job.text, job.name, t);
      const ps = r.passages.map((p, i) => Object.assign(p, { id: uid("p"), teacherId: t.id, sourceId, order: i + 1, createdAt: Date.now() }));
      const src = { id: sourceId, teacherId: t.id, name: job.name.replace(/\.[a-z0-9]+$/i, ""), kind: "프린트", target: { year: target.year, semester: target.semester, term: target.term, guessed: target.yearGuessed || target.termGuessed }, items: r.items,
        file: { name: job.name, ext: job.ext, size: job.size, pages: job.pages, chars: job.text.length }, ocr: job.ocr, text: job.text, hash, memo: job.memo || "", passages: ps.length, createdAt: Date.now(), complete: false, reflection: null };
      if (signal.aborted || !teacher(t.id)) throw API.err("cancelled", "중단됨");
      step(job, "save", "저장 중", 0.85);
      await DB.put("sources", src); if (ps.length) await DB.putAll("passages", ps);
      step(job, "match", "기출과 맞춰 보는 중", 0.92);
      await recomputeReflection(t.id);
      const s2 = await DB.get("sources", sourceId);
      job.sourceId = sourceId; job.doneText = "완료 · 지문 " + ps.length + " · 포인트 " + r.items.length + (s2 && s2.reflection ? " · 반영율 " + Math.round(s2.reflection.rate * 100) + "%" : "");
      log(t.id, "index", "프린트 " + src.name + " · 지문 " + ps.length + " · 포인트 " + r.items.length, { sourceId });
    }
    // 프린트 반영율 — 이 선생님의 모든 기출에 대해 다시 센다 (프린트가 겨냥한 시험이 있으면 그 시험, 없으면 모두)
    async function recomputeReflection(teacherId) {
      const [exams, questions, sources, passages] = await Promise.all([DB.where("exams", "teacherId", teacherId), DB.where("questions", "teacherId", teacherId), DB.where("sources", "teacherId", teacherId), DB.where("passages", "teacherId", teacherId)]);
      const hs = sources.filter(s => s.kind === "프린트").map(s => ({ source: s, passages: passages.filter(p => p.sourceId === s.id), items: s.items || [] }));
      const pById = {}; passages.forEach(p => { pById[p.id] = p; });
      const perSource = {}; hs.forEach(h => { perSource[h.source.id] = { hit: 0, n: 0, itemHits: [], exams: [] }; });
      for (const e of exams) {
        const qs = questions.filter(q => q.examId === e.id);
        const mine = hs.filter(h => !h.source.target || h.source.target.guessed || (h.source.target.year === e.meta.year && h.source.target.semester === e.meta.semester && h.source.target.term === e.meta.term));
        const r = ANALYZE.reflection({ questions: qs, handouts: mine.length ? mine : hs, passagesById: pById });
        e.reflection = r; questions.filter(q => q.examId === e.id).forEach(q => { const h = r && r.hits.find(x => x.questionId === q.id); q.handoutHit = h ? { kinds: h.kinds, sourceIds: h.sourceIds } : null; });
        if (r) Object.keys(r.byHandout).forEach(id => { const b = perSource[id]; if (!b) return; b.hit += r.byHandout[id].hit; b.n += r.n; b.itemHits.push(...r.byHandout[id].itemHits.map(x => Object.assign({ examId: e.id }, x))); b.exams.push({ examId: e.id, label: TEXT.examLabel(e.meta), rate: r.byHandout[id].rate, hit: r.byHandout[id].hit, n: r.n }); });
      }
      for (const h of hs) { const b = perSource[h.source.id]; h.source.reflection = b.n ? { rate: +(b.hit / b.n).toFixed(3), hit: b.hit, n: b.n, itemHits: b.itemHits, exams: b.exams } : null; }
      if (exams.length) await DB.putAll("exams", exams); if (questions.length) await DB.putAll("questions", questions); if (hs.length) await DB.putAll("sources", hs.map(h => h.source));
      return hs;
    }
    async function refreshExamMatched(teacherId) {
      const [exams, qs] = await Promise.all([DB.where("exams", "teacherId", teacherId), DB.where("questions", "teacherId", teacherId)]);
      let changed = false;
      exams.forEach(e => { const m = qs.filter(q => q.examId === e.id && q.setRole !== "member" && q.match && q.match.passageId).length; const n = qs.filter(q => q.examId === e.id && q.setRole !== "member" && q.passage && q.passage.has).length; if (e.matched !== m || e.matchable !== n) { e.matched = m; e.matchable = n; changed = true; } });
      if (changed) await DB.putAll("exams", exams);
    }
    const learnTimers = {};
    function scheduleLearn(teacherId) {
      if (!state.ui.autoLearn) { emit("toast", { msg: "자동 학습이 꺼져 있어요 — [학습]을 눌러 주세요" }); return; }
      clearTimeout(learnTimers[teacherId]);
      learnTimers[teacherId] = setTimeout(() => { if (!state.queue.some(j => j.teacherId === teacherId && ["queued", "extract", "ocr", "classify", "analyze", "match", "ai", "index", "save"].includes(j.stage))) learn(teacherId).catch(e => emit("toast", { msg: API.friendly(e), bad: true })); }, 1500);
    }

    // ---- 학습 ----
    async function learn(teacherId, o) {
      o = o || {};
      const t = teacher(teacherId); if (!t) return null;
      if (state.busy.has(teacherId)) return null;
      await recomputeReflection(teacherId);
      const [exams, questions, passages] = await Promise.all([DB.where("exams", "teacherId", teacherId), DB.where("questions", "teacherId", teacherId), DB.where("passages", "teacherId", teacherId)]);
      if (!questions.length) { emit("toast", { msg: "문항이 1개 이상 있어야 학습할 수 있어요" }); return null; }
      const prev = state.profiles.get(teacherId) || null;
      if (prev && !o.force && prev.basedOn && prev.basedOn.nQuestions === questions.length && prev.basedOn.nExams === exams.length && prev.basedOn.nPassages === passages.filter(p => p.kind === "지문").length) { emit("toast", { msg: "지난 학습 뒤 바뀐 자료가 없어요", action: "그래도 다시 학습", onAction: () => learn(teacherId, { force: true }) }); return prev; }
      state.busy.set(teacherId, "학습 중"); if (stage) stage.fx.thinking(teacherId, true); emit("busy", teacherId);
      try {
        const profile = PROFILE.build({ teacher: t, exams, questions, passages });
        let narrative = prev ? prev.narrative : null;
        const need = o.force || !narrative || !prev || prev.basedOn.nExams !== exams.length || Math.abs((prev.profile.reliability || 0) - profile.reliability) >= 0.1;
        if (need && API.ready()) { try { narrative = await PROFILE.narrate(profile, null); } catch (e) { if (e.code === "no_key") throw e; emit("toast", { msg: "성향 서술을 받지 못했어요 — 통계만 저장했어요 (" + API.friendly(e) + ")" }); } }
        if (!teacher(teacherId)) { state.busy.delete(teacherId); return null; }          // 학습 중에 지워졌다
        const delta = PROFILE.diff(prev && prev.profile, profile);
        const rec = { id: uid("pf"), teacherId, version: (prev ? prev.version : 0) + 1, createdAt: Date.now(), model: API.modelLabel(), provider: API.provider(),
          basedOn: { examIds: exams.map(e => e.id), nQuestions: questions.length, nExams: exams.length, nPassages: passages.filter(p => p.kind === "지문").length, matched: questions.filter(q => q.match && q.match.passageId && q.setRole !== "member").length },
          profile, narrative, delta: delta.headline, constellation: PROFILE.constellation(profile, questions), reason: o.reason || (prev ? "자료 추가" : "첫 학습") };
        await DB.put("profiles", rec); state.profiles.set(teacherId, rec);
        const olds = (await DB.where("profiles", "teacherId", teacherId)).sort((a, b) => b.version - a.version).slice(30);   // 최근 30판만 둔다
        for (const o of olds) await DB.del("profiles", o.id);
        t.stats = Object.assign({}, t.stats, { profileVersion: rec.version, lastLearnedAt: rec.createdAt, level: profile.level.id }); await DB.put("teachers", t);
        for (const e of exams) { if (e.learnedInVersion !== null && e.learnedInVersion !== undefined) continue; const cur = await DB.get("exams", e.id); if (!cur) continue; cur.learnedInVersion = rec.version; cur.status = "learned"; await DB.put("exams", cur); }   // 학습 중 고친 시험 정보를 덮지 않는다
        log(teacherId, "learn", "프로파일 v" + rec.version + " · " + delta.headline.join(" / "), { profileId: rec.id });
        state.busy.delete(teacherId);
        if (stage) { stage.fx.thinking(teacherId, false); stage.fx.learned(teacherId, { level: questions.length, profile: rec.constellation }); stage.updateTeacher(stageTeacher(t)); }
        emit("profile", { teacherId, rec, delta: delta.headline });
        return rec;
      } catch (e) { state.busy.delete(teacherId); if (stage) stage.fx.thinking(teacherId, false); emit("busy", teacherId); throw e; }
    }

    // ---- 예측 ----
    async function predict(teacherId, target) {
      const t = teacher(teacherId); if (!t) return null;
      const prof = state.profiles.get(teacherId);
      if (!prof) { emit("toast", { msg: "먼저 학습을 해 주세요" }); return null; }
      const [exams, questions, passages] = await Promise.all([DB.where("exams", "teacherId", teacherId), DB.where("questions", "teacherId", teacherId), DB.where("passages", "teacherId", teacherId)]);
      if (!passages.some(p => p.kind === "지문")) { emit("toast", { msg: "범위 원문이 없어 유력 지문을 고를 수 없어요 — 범위 파일을 넣어 주세요", bad: true }); return null; }
      state.busy.set(teacherId, "예측 중"); if (stage) stage.fx.thinking(teacherId, true); emit("busy", teacherId);
      try {
        target = target || defaultTarget(exams);
        const sources = await DB.where("sources", "teacherId", teacherId);
        const hsAll = sources.filter(s => s.kind === "프린트").map(s => ({ source: s, passages: passages.filter(p => p.sourceId === s.id), items: s.items || [] }));
        const hsTarget = hsAll.filter(h => h.source.target && !h.source.target.guessed && h.source.target.year === target.year && h.source.target.semester === target.semester && h.source.target.term === target.term);
        const handouts = hsTarget.length ? hsTarget : hsAll.filter(h => !h.source.reflection || !h.source.reflection.exams.length);   // 이번 시험용 프린트, 없으면 아직 기출과 짝이 없는 프린트
        let bp = PREDICT.blueprint({ profile: prof.profile, passages, questions, exams, target, scopeComplete: sources.some(s => s.kind !== "프린트" && s.complete), profileVersion: prof.version, handouts });
        if (API.ready()) { try { bp = await PREDICT.refine(bp, prof.profile, passages, target.label, null); } catch (e) { if (e.code === "no_key" || e.code === "bad_key") throw e; emit("toast", { msg: "모델 보정 없이 통계 예측만 남겼어요 (" + API.friendly(e) + ")" }); } }
        if (!teacher(teacherId)) { state.busy.delete(teacherId); return null; }
        const copyText = PREDICT.copyText(bp, t, prof.profile, passages, prof.narrative);
        const rec = { id: uid("pd"), teacherId, profileVersion: prof.version, createdAt: Date.now(), target, blueprint: bp, copyText, model: API.modelLabel() };
        await DB.put("predictions", rec); state.predictions.set(teacherId, rec);
        log(teacherId, "predict", target.label + " · 유력 지문 " + bp.passages.length, { predictionId: rec.id });
        state.busy.delete(teacherId); emit("busy", teacherId);
        if (stage) { stage.fx.thinking(teacherId, false); stage.fx.predict(teacherId, predictBars(bp)); }
        emit("prediction", { teacherId, rec });
        return rec;
      } catch (e) { state.busy.delete(teacherId); if (stage) stage.fx.thinking(teacherId, false); emit("busy", teacherId); throw e; }
    }
    function predictBars(bp) { return bp.plan.typePlan.slice(0, 6).map(x => ({ label: x.type, value: x.n / Math.max(1, bp.plan.total) })); }
    function defaultTarget(exams) {
      const last = exams.slice().sort((a, b) => TEXT.examTime(b.meta) - TEXT.examTime(a.meta))[0];
      let year = new Date().getFullYear(), semester = new Date().getMonth() < 7 ? 1 : 2, term = new Date().getMonth() % 6 < 3 ? "중간" : "기말";
      if (last) { const m = last.meta; const mid = m.term === "중간" || m.term === "1차지필"; if (mid) { year = m.year; semester = m.semester; term = m.term === "1차지필" ? "2차지필" : "기말"; } else { term = m.term === "2차지필" ? "1차지필" : "중간"; if (m.semester === 1) { year = m.year; semester = 2; } else { year = m.year + 1; semester = 1; } } }
      return { label: year + " " + semester + "학기 " + term, year, semester, term };
    }

    // ---- 적중 모의고사 ----
    async function generateMock(teacherId, o) {
      o = o || {};
      const t = teacher(teacherId), prof = state.profiles.get(teacherId); let pred = state.predictions.get(teacherId);
      if (!t || !pred || !prof) { emit("toast", { msg: "먼저 학습과 예측을 해 주세요" }); return null; }
      if (pred.profileVersion !== prof.version) { emit("toast", { msg: "학습이 갱신돼 예측을 먼저 새로 해요" }); pred = await predict(teacherId, pred.target); if (!pred) return null; }
      const [questions, passages] = await Promise.all([DB.where("questions", "teacherId", teacherId), DB.where("passages", "teacherId", teacherId)]);
      const usable = passages.filter(p => p.kind === "지문" && p.text && (!o.sourceIds || o.sourceIds.includes(p.sourceId)));
      if (usable.length < 3) { emit("toast", { msg: "쓸 수 있는 범위 지문이 3개 이상 있어야 해요", bad: true }); return null; }
      const bp = pred.blueprint;
      const bpForPlan = o.sourceIds ? Object.assign({}, bp, { passages: bp.passages.filter(s => usable.some(p => p.id === s.passageId)) }) : bp;
      if (!bpForPlan.passages.length) emit("toast", { msg: "고른 범위에는 유력 지문이 없어 나머지 지문을 고르게 씁니다" });
      const items = GENERATE.plan({ bp: bpForPlan, profile: prof.profile, passages: usable, questions, count: o.count, strength: o.strength || "tight" });
      const ctrl = new AbortController(); state.genCtrl = ctrl;
      state.busy.set(teacherId, "출제 중"); if (stage) stage.fx.thinking(teacherId, true); emit("busy", teacherId);
      try {
        const sig = GENERATE.signature(prof.profile, questions) + (o.extra ? "\n추가 요청 | " + o.extra : "");
        const res = await GENERATE.run(items, { target: pred.target.label, teacherName: t.name, signature: sig, signal: ctrl.signal, onStep: (i) => { state.busy.set(teacherId, "출제 중 " + i.i + "/" + i.n); emit("busy", teacherId); } });
        if (!teacher(teacherId)) { state.busy.delete(teacherId); return null; }
        if (!res.questions.length) throw new Error("문항이 하나도 만들어지지 않았어요. 다시 시도해 주세요.");
        const mock = { id: uid("m"), teacherId, predictionId: pred.id, profileVersion: prof.version, createdAt: Date.now(), title: t.school + " " + t.grade + "학년 " + t.subject + " 적중 모의고사", target: pred.target.label, questions: res.questions, failed: res.failed, model: API.modelLabel(),
          stats: { total: res.questions.length, objective: res.questions.filter(q => q.format !== "서술형").length, subjective: res.questions.filter(q => q.format === "서술형").length, points: res.questions.reduce((a, q) => a + (q.points || 0), 0) } };
        await DB.put("mocks", mock);
        log(teacherId, "generate", mock.title + " · " + mock.stats.total + "문항", { mockId: mock.id });
        state.busy.delete(teacherId); emit("busy", teacherId); if (stage) stage.fx.thinking(teacherId, false); emit("mock", mock);
        return mock;
      } catch (e) { state.busy.delete(teacherId); if (stage) stage.fx.thinking(teacherId, false); emit("busy", teacherId); throw e; }
      finally { state.genCtrl = null; }
    }

    function abortGenerate() { if (state.genCtrl) { state.genCtrl.abort(); return true; } return false; }
    // ---- 시험지·범위 삭제·수정 ----
    async function deleteExam(examId) {
      const e = await DB.get("exams", examId); if (!e) return;
      await DB.delWhere("questions", "examId", examId); await DB.del("exams", examId);
      await refreshCounts(e.teacherId); if (stage) stage.setLevel(e.teacherId, state.counts.get(e.teacherId).questions);
      log(e.teacherId, "edit", "시험지 삭제 · " + e.title); emit("data", e.teacherId); scheduleLearn(e.teacherId);
    }
    async function deleteSource(sourceId) {
      const s = await DB.get("sources", sourceId); if (!s) return;
      const ps = await DB.where("passages", "sourceId", sourceId); const ids = new Set(ps.map(p => p.id));
      await DB.delWhere("passages", "sourceId", sourceId); await DB.del("sources", sourceId);
      const qs = (await DB.where("questions", "teacherId", s.teacherId)).filter(q => q.match && ids.has(q.match.passageId));
      qs.forEach(q => { q.match = { passageId: null, sourceId: null, method: "none", score: 0, confidence: 0, fidelity: null, reason: "범위 자료 삭제됨", altered: "" }; }); if (qs.length) await DB.putAll("questions", qs);
      await refreshExamMatched(s.teacherId);
      await refreshCounts(s.teacherId); if (s.kind === "프린트") await recomputeReflection(s.teacherId); log(s.teacherId, "edit", "범위 원문 삭제 · " + s.name); emit("data", s.teacherId); scheduleLearn(s.teacherId);
    }
    async function updateExamMeta(examId, meta) {
      const e = await DB.get("exams", examId); if (!e) return;
      Object.assign(e.meta, meta); Object.keys(meta).forEach(k => { e.meta[k + "Guessed"] = false; }); e.title = TEXT.examLabel(e.meta);
      await DB.put("exams", e); emit("data", e.teacherId);
    }
    async function setQuestionMatch(questionId, passageId) {
      const q = await DB.get("questions", questionId); if (!q) return;
      const p = passageId ? await DB.get("passages", passageId) : null;
      if (p) { const f = ANALYZE.fidelity(q, p); q.match = { passageId: p.id, sourceId: p.sourceId, method: "user", score: 1, confidence: 1, fidelity: f.fidelity, reason: "직접 지정", altered: "", changed: f.changed }; q.external = false; }
      else q.match = { passageId: null, sourceId: null, method: "user", score: 0, confidence: 1, fidelity: null, reason: "직접 해제", altered: "" };
      await DB.put("questions", q); await refreshExamMatched(q.teacherId); await refreshCounts(q.teacherId); emit("data", q.teacherId);
    }
    async function setSourceComplete(sourceId, v) { const s = await DB.get("sources", sourceId); if (!s) return; s.complete = !!v; await DB.put("sources", s); }

    // ---- 내보내기 · 불러오기 ----
    async function exportJson(teacherId) {
      const pick = async (store) => teacherId ? DB.where(store, "teacherId", teacherId) : DB.all(store);
      const out = { app: "orun-oracle", schema: 1, exportedAt: Date.now(), scope: teacherId ? "teacher" : "all",
        teachers: teacherId ? [teacher(teacherId)] : [...state.teachers.values()], exams: await pick("exams"), sources: await pick("sources"), questions: await pick("questions"), passages: await pick("passages"),
        profiles: await pick("profiles"), predictions: await pick("predictions"), mocks: await pick("mocks"), events: await pick("events") };
      if (!teacherId) out.settings = { ui: state.ui, bg: { opacity: state.bg.opacity, field: state.bg.field } };
      const t = teacherId ? teacher(teacherId) : null;
      const name = "orun-oracle_" + (t ? t.name + "_" + t.school : "전체") + "_" + TEXT.fmtDate() + ".json";
      const blob = new Blob([JSON.stringify(out)], { type: "application/json" });
      download(blob, name);
      log(teacherId, "export", name);
      return { name, size: blob.size };
    }
    function download(blob, name) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
    async function importJson(file) {
      let j; try { j = JSON.parse(await file.text()); } catch (e) { throw new Error("이 파일은 ORUN ORACLE 백업이 아니에요"); }
      if (!j || j.app !== "orun-oracle" || !Array.isArray(j.teachers)) throw new Error("이 파일은 ORUN ORACLE 백업이 아니에요");
      if ((+j.schema || 1) > 1) throw new Error("더 새 버전에서 만든 백업이에요 — 앱을 새로 고친 뒤 다시 시도해 주세요");
      const existingHashes = new Set((await DB.all("exams")).map(e => e.hash).concat((await DB.all("sources")).map(s => s.hash)));
      let dupSkipped = 0;
      const skipExam = new Set(), skipSrc = new Set();
      for (const e of j.exams || []) { if (existingHashes.has(e.hash) && !(await DB.get("exams", e.id))) { skipExam.add(e.id); dupSkipped++; } }
      for (const s of j.sources || []) { if (existingHashes.has(s.hash) && !(await DB.get("sources", s.id))) { skipSrc.add(s.id); dupSkipped++; } }
      await DB.putAll("teachers", j.teachers);
      await DB.putAll("exams", (j.exams || []).filter(e => !skipExam.has(e.id)));
      await DB.putAll("questions", (j.questions || []).filter(q => !skipExam.has(q.examId)));
      await DB.putAll("sources", (j.sources || []).filter(s => !skipSrc.has(s.id)));
      await DB.putAll("passages", (j.passages || []).filter(p => !skipSrc.has(p.sourceId)));
      for (const s of ["profiles", "predictions", "mocks", "events"]) if (Array.isArray(j[s])) await DB.putAll(s, j[s]);
      for (const t of j.teachers) { state.teachers.set(t.id, t); await refreshCounts(t.id); await loadLatest(t.id); if (stage) { stage.addTeacher(stageTeacher(t)); stage.setLevel(t.id, state.counts.get(t.id).questions, true); const p = state.profiles.get(t.id); if (p) stage.setProfile(t.id, p.constellation || null); const pr = state.predictions.get(t.id); if (pr) stage.fx.predict(t.id, predictBars(pr.blueprint)); } }
      log(null, "import", file.name + " · 선생님 " + j.teachers.length);
      emit("teachers"); emit("select");
      return { teachers: j.teachers.length, dupSkipped };
    }
    async function wipeAll() {
      cancelAll(); for (const id of [...state.teachers.keys()]) if (stage) stage.removeTeacher(id);
      await DB.wipe(); state.teachers.clear(); state.counts.clear(); state.profiles.clear(); state.predictions.clear(); state.selectedId = null; state.queue = [];
      emit("teachers"); emit("select");
    }

    // ---- 배경 영상 ----
    let bgImg = null;
    function applyVideo(blob) {
      if (/^image\//.test(blob.type)) { const img = new Image(); img.onload = () => { bgImg = img; if (stage) stage.setBackdrop(img, state.bg.opacity); }; img.src = URL.createObjectURL(blob); return; }
      const v = $("bgVideo");
      if (v.src) { try { URL.revokeObjectURL(v.src); } catch (e) {} }
      v.src = URL.createObjectURL(blob); v.loop = true; v.muted = true; v.play().catch(() => {});
      if (stage) stage.setBackdrop(v, state.bg.opacity);
    }
    async function setBgVideo(file) {
      if (!file) { await DB.del("media", "bg"); await saveBg({ hasVideo: false }); if (stage) stage.setBackdrop(null); const v = $("bgVideo"); v.removeAttribute("src"); v.load(); emit("bg"); return; }
      if (file.size > 200 * 1024 * 1024) throw new Error("200 MB 를 넘는 영상은 넣을 수 없어요");
      if (!VIDEO_RE.test(file.name) && !/^video\/(mp4|webm)/.test(file.type) && !/^image\/(jpeg|png|webp)/.test(file.type)) throw new Error("mp4 · webm 영상이나 jpg · png 그림만 배경으로 쓸 수 있어요");
      try { await DB.put("media", { key: "bg", name: file.name, type: file.type, size: file.size, blob: file, createdAt: Date.now() }, true); }
      catch (e) { throw new Error(e && e.name === "QuotaExceededError" ? "브라우저 저장 공간이 부족해요 — 더 작은 파일을 쓰거나 데이터 설정에서 영구 저장을 허용해 주세요" : "배경 파일을 저장하지 못했어요"); }
      await saveBg({ hasVideo: true }); applyVideo(file); emit("bg");
    }
    async function setBgOpacity(v) { await saveBg({ opacity: v }); if (stage) stage.setBackdropDim(v); }

    return { state, on, emit, boot, createTeacher, updateTeacher, deleteTeacher, select, enqueue, setJobKind, cycleJobKind, cancelJob, retryJob, cancelAll, clearDone, runQueue, learn, predict, generateMock, abortGenerate, defaultTarget, recomputeReflection, setSourceComplete, predictBars,
             deleteExam, deleteSource, updateExamMeta, setQuestionMatch, exportJson, importJson, wipeAll, setBgVideo, setBgOpacity, saveUi, saveBg, refreshCounts, loadLatest, download,
             stage: () => stage, teacher, sub, PALETTE, log, calm };
  })();
