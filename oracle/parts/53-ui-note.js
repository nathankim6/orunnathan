  // ==================================================================
  //  NOTEUI — 노트 페이지 (#vNote, spec §2.4~2.6 · §3.2~3.3 · §5.12)
  //  열 가지 종류(선생님 · 시험 · 문항 · 지문 · 자료(범위 · 프린트) · 프로파일 · 예측 · 모의고사 · 메모(자유 · daily · weekly) · 질문)를
  //  한 벌의 템플릿(머리 → 속성 → 본문 → 내 메모 → 링크 · 백링크 → 액션)으로 그린다. 옛 드로어 여섯 분기가 여기로 왔다.
  //  내 메모는 원 문서에 넣지 않고 notes(kind:"anchor", anchorKey:"<store>:<id>") 로 붙는다(NOTES.memo / NOTES.saveMemo).
  //  자유 메모 · daily · weekly 는 편집기가 곧 본문이다(NOTES.update). 렌더는 현재 열린 노트만 다시 그린다 — 편집 중인 textarea 는 건드리지 않는다.
  //  모든 HTML 삽입은 TEXT.esc 를 거친다.
  // ==================================================================
  const NOTEUI = (function () {
    const $ = (id) => document.getElementById(id), esc = TEXT.esc, S = APP.state;
    const pct = (v) => Math.round((+v || 0) * 100) + "%";
    const T = (id) => APP.teacher(id);
    const KL = { teacher: "선생님", exam: "시험", question: "문항", passage: "지문", source: "자료", handout: "프린트", profile: "프로파일", prediction: "예측", mock: "모의고사", note: "메모", ask: "질문", daily: "데일리", weekly: "주간", anchor: "메모" };
    const KICK = { teacher: "TEACHER", exam: "EXAM", question: "QUESTION", passage: "PASSAGE", source: "SOURCE", handout: "HANDOUT", profile: "PROFILE", prediction: "PREDICTION", mock: "MOCK", note: "NOTE", ask: "ASK", daily: "DAILY", weekly: "WEEKLY", anchor: "MEMO" };
    const LIB_OF = { teacher: "", exam: "exams", question: "questions", passage: "passages", source: "sources", profile: "profiles", prediction: "predictions", mock: "mocks", note: "notes" };
    const DAY = 864e5;
    const ago = (ms) => { if (!ms) return "—"; const d = Date.now() - ms; return d < 60e3 ? "방금" : d < 3600e3 ? Math.round(d / 60e3) + "분 전" : d < 86400e3 ? Math.round(d / 3600e3) + "시간 전" : TEXT.fmtDate(ms); };
    const kindTag = (k) => '<span class="mono-kind" data-kind="' + esc(k || "note") + '" title="' + esc(KL[k] || k || "") + '"></span>';
    const num = (v, unit) => v === null || v === undefined || v === "" ? "—" : esc(v) + (unit || "");
    const first = (s, n) => String(s || "").split(/\s+/).slice(0, n || 6).join(" ");
    const clip = (s, n) => { s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
    const noteHref = (id) => ROUTE.note(id);
    const nodeTitle = (id) => { const d = INDEX.get(id); if (d && d.title) return d.title; const t = LINKS.title(id); return t || id; };
    const nodeKind = (id) => { const d = INDEX.get(id); if (d) return d.handout ? "handout" : (d.kind === "note" && d.noteKind === "ask" ? "ask" : d.kind); return LINKS.kind(id) || NOTES.kindOf(id) || "note"; };
    const syncText = () => { const c = SYNC.st; return c.private ? "이 브라우저에만" : !c.enabled ? "동기화 꺼짐" : c.status === "error" ? "동기화 오류" : (c.status === "syncing" || c.pending) ? "동기화 중" : "동기화 ✓"; };
    // 행 하나 — 노트로 가는 링크 (data-* 는 e2e · 위임 클릭용)
    const row = (id, kind, title, why, attr) => '<a class="lrow' + (LINKS.node(id) || INDEX.get(id) ? "" : " broken") + '" href="' + esc(noteHref(id)) + '" data-id="' + esc(id) + '"' + (attr ? " " + attr + '="' + esc(id) + '"' : "") + '>' + kindTag(kind) + '<span class="t">' + esc(title) + '</span>' + (why ? '<span class="why">' + esc(why) + '</span>' : "") + '</a>';
    const propRow = (th, td, cls) => '<tr><th>' + th + '</th><td' + (cls ? ' class="' + cls + '"' : "") + '>' + td + '</td></tr>';
    const props = (rows) => '<table class="props">' + rows.join("") + '</table>';
    const chipList = (arr, cls) => (arr || []).map(x => '<span class="chip' + (cls ? " " + cls : "") + '">' + esc(x) + '</span>').join("");
    const seg = (id, opts, val, attr) => '<span class="seg" id="' + id + '"' + (attr || "") + '>' + opts.map(o => '<button type="button" data-v="' + esc(o[0]) + '" class="' + (String(o[0]) === String(val) ? "on" : "") + '">' + esc(o[1]) + '</button>').join("") + '</span>';
    const method = (m) => m === "user" ? "USER" : m === "local" ? "AUTO" : m === "llm" ? "MODEL" : "";
    const stageBusy = (j) => j && !["done", "error", "cancelled", "queued"].includes(j.stage);

    let cur = null, renderSeq = 0, bound = false;
    // 내 메모 편집기 상태 — 열린 노트가 바뀔 때만 다시 만든다 (render 가 다시 불려도 입력 중인 글은 지키지 않는다 → 지킨다)
    const memo = { key: "", mode: "anchor", noteId: null, teacherId: null, saved: "", links: [], docId: null, author: "", updatedAt: 0, dirty: false, saving: false, again: false, timer: 0, composing: false, ac: null, editing: false, pendingDel: false };

    // ================= 진입 =================
    function missing() { UI.toast("그 노트는 없어요"); ROUTE.go("#/today", { replace: true }); }
    async function render(id, query) {
      const seq = ++renderSeq;
      try {
        const store = NOTES.storeOf(id), kind0 = NOTES.kindOf(id);
        if (!store || !LIB_OF.hasOwnProperty(kind0)) { missing(); return; }
        let doc = null; try { doc = await DB.get(store, id); } catch (e) { console.error(e); }
        if (seq !== renderSeq) return;
        if (!doc) { missing(); return; }
        const kind = kind0;
        const data = await loadData(store, doc);
        if (seq !== renderSeq) return;
        cur = { id, store, kind, doc, data, query: query || {}, teacherId: store === "teachers" ? doc.id : (doc.teacherId || null), sub: subKind(store, doc) };
        $("vNote").dataset.kind = kind;
        bind();
        renderHead(); renderProps(); renderBody(); renderLinks(); renderActions();
        await renderMemo();
        if (seq !== renderSeq) return;
        const m = cur.query.at !== undefined ? $("noteBody").querySelector("mark") : null; if (m) { try { m.scrollIntoView({ block: "center" }); } catch (e) {} }
      } catch (e) { console.error(e); UI.toast("노트를 그리지 못했어요: " + (e && e.message || e), { bad: true }); }
    }
    // 종류의 세부 — source 는 범위 · 프린트, note 는 note/daily/weekly/ask/anchor
    function subKind(store, doc) {
      if (store === "sources") return doc.kind === "프린트" ? "handout" : "scope";
      if (store === "notes") return doc.kind || "note";
      return "";
    }
    async function loadData(store, doc) {
      const d = {}; const tid = store === "teachers" ? doc.id : doc.teacherId;
      const w = (s, idx, v) => DB.where(s, idx, v).catch(() => []);
      switch (store) {
        case "teachers": {
          const [exams, sources, mocks] = await Promise.all([w("exams", "teacherId", tid), w("sources", "teacherId", tid), w("mocks", "teacherId", tid)]);
          exams.sort((a, b) => TEXT.examTime(b.meta) - TEXT.examTime(a.meta)); sources.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); mocks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          Object.assign(d, { exams, sources, mocks, counts: S.counts.get(tid) || {}, profile: S.profiles.get(tid) || null, prediction: S.predictions.get(tid) || null });
          break;
        }
        case "exams": {
          const [qs, ps] = await Promise.all([w("questions", "examId", doc.id), w("passages", "teacherId", tid)]);
          qs.sort((a, b) => (a.order || 0) - (b.order || 0)); const pmap = {}; ps.forEach(p => { pmap[p.id] = p; });
          Object.assign(d, { questions: qs, pmap });
          break;
        }
        case "questions": {
          const [ps, exam, sources] = await Promise.all([w("passages", "teacherId", tid), DB.get("exams", doc.examId).catch(() => null), w("sources", "teacherId", tid)]);
          const p = doc.match && doc.match.passageId ? ps.find(x => x.id === doc.match.passageId) || null : null;
          const smap = {}; sources.forEach(s => { smap[s.id] = s; });
          Object.assign(d, { passages: ps, passage: p, exam, smap });
          break;
        }
        case "passages": {
          const [qs, exams, src] = await Promise.all([w("questions", "teacherId", tid), w("exams", "teacherId", tid), doc.sourceId ? DB.get("sources", doc.sourceId).catch(() => null) : null]);
          const emap = {}; exams.forEach(e => { emap[e.id] = e; });
          const used = qs.filter(q => q.match && q.match.passageId === doc.id).sort((a, b) => TEXT.examTime((emap[b.examId] || { meta: {} }).meta) - TEXT.examTime((emap[a.examId] || { meta: {} }).meta) || (a.order || 0) - (b.order || 0));
          const pr = S.predictions.get(tid) || null; const hot = pr && (pr.blueprint.passages || []).find(x => x.passageId === doc.id) || null;
          Object.assign(d, { used, emap, source: src, prediction: pr, hot });
          break;
        }
        case "sources": {
          const ps = await w("passages", "sourceId", doc.id); ps.sort((a, b) => (a.order || 0) - (b.order || 0));
          Object.assign(d, { passages: ps, profile: S.profiles.get(tid) || null });
          break;
        }
        case "profiles": {
          const [all, exams] = await Promise.all([w("profiles", "teacherId", tid), w("exams", "teacherId", tid)]);
          all.sort((a, b) => (b.version || 0) - (a.version || 0)); const emap = {}; exams.forEach(e => { emap[e.id] = e; });
          Object.assign(d, { versions: all, emap, memoCount: await countMemos(all.slice(0, 3).map(p => NOTES.anchorKey("profiles", p.id)).concat([NOTES.anchorKey("teachers", tid)])) });
          break;
        }
        case "predictions": {
          const ps = await w("passages", "teacherId", tid);
          const pmap = {}; ps.forEach(p => { pmap[p.id] = p; });
          const profile = (await w("profiles", "teacherId", tid)).find(p => p.version === doc.profileVersion) || null;
          Object.assign(d, { passages: ps.filter(p => p.kind === "지문"), pmap, profile });
          break;
        }
        case "mocks": {
          const pred = doc.predictionId ? await DB.get("predictions", doc.predictionId).catch(() => null) : null;
          Object.assign(d, { prediction: pred });
          break;
        }
        case "notes": {
          if (doc.kind === "ask" && doc.ask) {
            const ev = (doc.ask.evidence || []).map((eid, i) => ({ n: i + 1, id: eid, title: nodeTitle(eid), kind: nodeKind(eid), kindLabel: KL[nodeKind(eid)] || "노트", alive: !!(INDEX.get(eid) || LINKS.node(eid)) }));
            Object.assign(d, { evidence: ev, ctxTitle: doc.ask.ctx ? nodeTitle(doc.ask.ctx) : "" });
          }
          break;
        }
      }
      return d;
    }
    async function countMemos(keys) { let n = 0; for (const k of keys) { try { const m = await NOTES.memo(k); if (m && m.body && m.body.trim()) n++; } catch (e) {} } return n; }

    // ================= 머리 =================
    function titleOf() { return INDEX.titleOf(cur.store, cur.doc, APP.indexCtx) || cur.id; }
    function renderHead() {
      const { store, doc, kind, sub } = cur; const t = T(cur.teacherId);
      const crumbs = [];
      if (t) crumbs.push('<a href="' + esc(noteHref(t.id)) + '">' + esc(t.name) + '</a>');
      if (kind !== "teacher") crumbs.push('<a href="' + esc(sub === "handout" ? ROUTE.all("sources", { kind: "프린트" }) : ROUTE.all(LIB_OF[kind] || "exams")) + '">' + esc(sub === "handout" ? "프린트" : KL[kind]) + '</a>');
      if (kind === "question" && doc.examId) crumbs.push('<a href="' + esc(noteHref(doc.examId)) + '">' + esc(APP.indexCtx.examTitle(doc.examId) || (cur.data.exam && cur.data.exam.title) || "시험") + '</a>');
      if (kind === "passage" && doc.sourceId) crumbs.push('<a href="' + esc(noteHref(doc.sourceId)) + '">' + esc((cur.data.source && cur.data.source.name) || "자료") + '</a>');
      const title = titleOf();
      crumbs.push('<span>' + esc(clip(title, 40)) + '</span>');
      $("noteCrumb").innerHTML = crumbs.join(' <span class="faint">›</span> ');
      const kick = KICK[sub === "handout" ? "handout" : (store === "notes" ? (sub || "note") : kind)] || "NOTE";
      let sub2 = "";
      if (kind === "question") sub2 = (APP.indexCtx.examTitle(doc.examId) || "") + " · " + (doc.number || "?") + "번";
      else if (kind === "exam") sub2 = "문항 " + ((doc.analysis || {}).total || 0) + (doc.file ? " · " + doc.file.name : "");
      else if (kind === "passage") sub2 = (cur.data.source ? cur.data.source.name : "") + (doc.words ? " · " + doc.words + "단어" : "");
      else if (kind === "profile") sub2 = "V" + (doc.version || 1) + " · " + TEXT.fmtDate(doc.createdAt);
      else if (kind === "prediction") sub2 = "V" + (doc.profileVersion || "?") + " · " + TEXT.fmtDate(doc.createdAt);
      else if (kind === "mock") sub2 = (doc.target || "") + " · " + TEXT.fmtDate(doc.createdAt);
      else if (kind === "teacher") sub2 = APP.sub(doc);
      else if (store === "sources") sub2 = (doc.kind || "") + " · 지문 " + (doc.passages || 0);
      else if (store === "notes") sub2 = (doc.date || TEXT.fmtDate(doc.createdAt)) + (doc.author ? " · " + doc.author : "");
      $("noteKicker").textContent = kick + (sub2 ? " · " + sub2 : "");
      $("noteTitle").textContent = title;
      const ai = store === "exams" || store === "sources" ? String(doc.memo || "").trim() : "";
      $("noteAiMemo").innerHTML = ai ? '<span class="memo">✎ 넣을 때 AI 에게 전한 말: “' + esc(ai) + '”</span>' : "";
      renderTags();
    }
    // 태그 줄 — 사용자 태그(메모 본문의 #태그) · ⊕ · 파생 태그(.chip.derived)
    function renderTags(userTags) {
      const box = $("noteTags"), add = $("noteTagAdd");
      const { store, doc } = cur;
      const user = userTags !== undefined ? userTags : (store === "notes" ? (doc.tags || []) : (INDEX.get(cur.id) ? INDEX.get(cur.id).userTags : []) || []);
      const derived = NOTES.derivedTags(store, doc).filter(x => !user.includes(x));
      let html = user.map(t => '<a class="chip tag" href="' + esc(ROUTE.tag(t)) + '" data-tag="' + esc(t) + '">' + esc(t) + '</a>').join("");
      box.innerHTML = html;
      if (add) { add.hidden = store === "notes" && cur.sub === "ask" && false; box.appendChild(add); }
      if (derived.length) box.insertAdjacentHTML("beforeend", '<span class="sep"></span><span class="small">파생</span>' + derived.map(t => '<span class="chip derived" data-tag="' + esc(t) + '" title="자동으로 붙는 태그 — 저장하지 않아요">#' + esc(t) + '</span>').join(""));
    }

    // ================= 속성 =================
    function renderProps() {
      const k = cur.sub === "handout" ? "handout" : (cur.store === "notes" ? "note" : cur.kind);
      const fn = propsOf[k] || (() => "");
      $("noteProps").innerHTML = fn(cur.doc, cur.data) || "";
      const ed = propsEditors[k]; if (ed) { try { ed($("noteProps"), cur.doc, cur.data); } catch (e) { console.error(e); } }
    }
    const guessBadge = (meta, k) => meta && meta[k + "Guessed"] ? ' <span class="badge warn" title="시험지에서 읽어 추정한 값이에요. 틀리면 고쳐 주세요">추정</span>' : "";
    const link = (id, label) => '<a class="wiki" href="' + esc(noteHref(id)) + '" data-link="' + esc(id) + '">[[' + esc(label) + ']]</a>';
    const propsOf = {
      teacher(t, d) {
        const p = d.profile, c = d.counts;
        return props([
          propRow("학교", esc(t.school || "—")), propRow("학년", t.grade ? t.grade + "학년" : "—"), propRow("과목", esc(t.subject || "—")),
          propRow("색", '<i class="dot" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:' + esc(t.color || "#5fc8ff") + ';vertical-align:-1px"></i> <span class="num">' + esc(t.color || "") + '</span>'),
          propRow("레벨", p ? esc(p.profile.level.name) + ' Lv.' + p.profile.level.id + (p.profile.level.next ? ' <span class="small">· 다음 ' + esc(p.profile.level.next.name) + '까지 ' + esc(p.profile.level.next.need || "") + '</span>' : "") : "학습 전"),
          propRow("프로파일", p ? link(p.id, "프로파일 V" + p.version) + ' <span class="small">신뢰도 ' + pct(p.profile.reliability) + '</span>' : "—"),
          propRow("보유", '시험 <b class="num">' + (c.exams || 0) + '</b> · 문항 <b class="num">' + (c.questions || 0) + '</b> · 지문 <b class="num">' + (c.passages || 0) + '</b> · 자료 <b class="num">' + (c.sources || 0) + '</b>' + (c.handouts ? ' (프린트 ' + c.handouts + ')' : "") + ' · 모의고사 <b class="num">' + (c.mocks || 0) + '</b>'),
        ]);
      },
      exam(e, d) {
        const m = e.meta || {}, a = e.analysis || {}, c = S.counts.get(e.teacherId) || {};
        const low = c.passages && a.total && (e.matched || 0) / a.total < 0.5;
        const status = e.status === "error" ? '<span class="badge bad">ERROR</span>' : low ? '<span class="badge warn">LOW MATCH</span>' : e.learnedInVersion ? '<span class="badge ok">LEARNED · V' + e.learnedInVersion + '</span>' : '<span class="badge">ANALYZED</span>';
        return props([
          propRow("연도" + guessBadge(m, "year"), '<input type="number" data-m="year" value="' + esc(m.year || "") + '" style="width:90px">'),
          propRow("학기" + guessBadge(m, "semester"), seg("", [[1, "1학기"], [2, "2학기"]], m.semester, ' data-seg="semester"')),
          propRow("시험명" + guessBadge(m, "term"), seg("", [["중간", "중간"], ["기말", "기말"], ["1차지필", "1차지필"], ["2차지필", "2차지필"]], m.term, ' data-seg="term"')),
          propRow("학년" + guessBadge(m, "grade"), seg("", [[1, "1"], [2, "2"], [3, "3"]], +m.grade, ' data-seg="grade"')),
          propRow("과목" + guessBadge(m, "subject"), '<input type="text" data-m="subject" value="' + esc(m.subject || "") + '" style="width:160px">'),
          propRow("학교" + guessBadge(m, "school"), '<input type="text" data-m="school" value="' + esc(m.school || "") + '" style="width:160px">'),
          propRow("문항 수", '<span class="num">' + (a.total || 0) + '</span> <span class="small">객관식 ' + (a.objective || 0) + ' · 서술형 ' + (a.subjective || 0) + (e.gaps && e.gaps.length ? ' · <span class="bad">못 읽은 번호 ' + esc(e.gaps.join(",")) + '</span>' : "") + '</span>'),
          propRow("총점", a.points ? '<span class="num">' + a.points + '</span>점' : "—"),
          propRow("매칭", c.passages ? '<span class="num">' + (e.matched || 0) + '/' + (e.matchable || a.total || 0) + '</span>' : '<span class="small">범위 원문이 없어요</span>'),
          propRow("AI 활용 추정", e.ai ? '<span class="num">' + pct(e.ai.aiLikelihood) + '</span> <span class="small">' + esc(e.ai.label || "") + ' · 참고용</span>' : "—"),
          propRow("프린트 반영율", e.reflection ? '<span class="num gold">' + pct(e.reflection.rate) + '</span> <span class="small">' + e.reflection.hits.length + '/' + e.reflection.n + '</span>' : '<span class="small">' + (c.handouts ? "이 시험용 프린트가 없어요" : "프린트를 넣으면 계산해요") + '</span>'),
          propRow("상태", status),
          propRow("파일", e.file ? esc(e.file.name) + ' <span class="small">· ' + (e.file.chars || 0).toLocaleString() + '자' + (e.file.pages ? ' · ' + e.file.pages + '쪽' : "") + (e.ocr ? ' · OCR' : "") + ' · ' + TEXT.fmtDate(e.createdAt) + '</span>' : "—"),
        ]);
      },
      question(q, d) {
        const p = d.passage, m = q.match || {}, t = q.transformation || {}, ds = q.distractor || {};
        const hit = q.handoutHit ? '<span class="gold">★ ' + esc((q.handoutHit.kinds || []).join(" · ")) + '</span>' + (q.handoutHit.sourceIds || []).map(sid => ' ← ' + link(sid, (d.smap[sid] || {}).name || "프린트")).join("") : '<span class="small">—</span>';
        const opts = d.passages.filter(x => x.kind === "지문");
        const matchSel = '<select id="dMatchSel" style="margin-top:6px;max-width:100%"><option value="">매칭 바꾸기 — 지문 고르기</option>' + opts.map(x => '<option value="' + esc(x.id) + '"' + (p && p.id === x.id ? " selected" : "") + '>' + esc((x.src || "지문") + " · " + first(x.first, 6)) + '</option>').join("") + '<option value="__none">매칭 해제</option></select>';
        const variation = [t.technique, t.blankPosition, t.blankUnit, (t.grammarPoints || []).length ? "어법 " + t.grammarPoints.join(",") : "", t.orderSplit, t.insertPosition, t.underlineCount ? "밑줄 " + t.underlineCount : "", t.vocabSwap, t.summaryBlanks ? "요약 빈칸 " + t.summaryBlanks : ""].filter(Boolean);
        return props([
          propRow("시험", q.examId ? link(q.examId, APP.indexCtx.examTitle(q.examId) || (d.exam && d.exam.title) || "시험") : "—"),
          propRow("유형", esc(q.type || "") + (q.subtype ? ' <span class="small">' + esc(q.subtype) + '</span>' : "") + ' · ' + esc(q.format || "") + ' · ' + (q.points === null || q.points === undefined ? "배점 ?" : q.points + "점") + ' · 난이도 ' + esc(q.difficulty || "중") + (q.set ? ' · <span class="chip gold">세트 ' + esc(q.set) + '</span>' : "")),
          propRow("매칭 지문", (p ? link(p.id, p.src || "지문") + ' <span class="badge ok">' + esc(method(m.method) || "AUTO") + ' ' + pct(m.confidence) + '</span>' + (m.fidelity !== null && m.fidelity !== undefined ? ' <span class="small">원문 유지 ' + pct(m.fidelity) + '</span>' : "") + (m.altered ? ' <span class="small">· ' + esc(m.altered) + '</span>' : "")
            : '<span class="small">' + (q.external ? "범위 밖 지문으로 보여요" : q.passage && q.passage.has ? "맞는 범위 지문을 못 찾았어요" : "지문 없는 문항") + (m.reason ? " · " + esc(m.reason) : "") + '</span>') + '<br>' + matchSel),
          propRow("프린트", hit),
          propRow("변형", variation.length ? esc(variation.join(" · ")) : "—"),
          propRow("선지", (ds.style || []).length ? esc(ds.style.join(" · ")) + (ds.parallel ? " · 평행" : "") + " · " + (ds.lang === "ko" ? "우리말" : ds.lang === "mixed" ? "혼합" : "영어") : "—"),
        ]);
      },
      passage(p, d) {
        return props([
          propRow("출처", (d.source ? link(d.source.id, d.source.name) + ' <span class="small">' + esc(d.source.kind || "") + '</span>' : "—") + (p.lessonKey ? ' · <span class="small">' + esc(p.lessonKey) + '</span>' : "")),
          propRow("장르", esc(p.genre || p.kind || "—")), propRow("단어 수", num(p.words, "단어")),
          propRow("특징", (p.feats || []).length ? chipList(p.feats, "dim") : "—"),
          propRow("프린트 지문", p.fromHandout ? '<span class="gold">★ 프린트에 실린 지문</span>' : '<span class="small">—</span>'),
          propRow("다음 시험 확률", d.hot ? '<span class="num gold">' + pct(d.hot.pUse) + '</span> <span class="small">' + (d.hot.expectedTypes || []).map(esc).join(" / ") + '</span>' : '<span class="small">' + (d.prediction ? "유력 지문 밖" : "예측 전") + '</span>'),
          propRow("쓰인 문항", '<span class="num">' + d.used.length + '</span>'),
        ]);
      },
      source(s, d) {
        return props([
          propRow("종류", seg("dKind", [["교과서", "교과서"], ["부교재", "부교재"], ["모의고사", "모의고사"], ["기타", "기타"]], s.kind)),
          propRow("지문 수", '<span class="num">' + (s.passages || 0) + '</span>'),
          propRow("글자 수", '<span class="num">' + ((s.file && s.file.chars) || (s.text || "").length).toLocaleString() + '</span>'),
          propRow("범위 완비", '<label class="row"><input type="checkbox" id="dComplete"' + (s.complete ? " checked" : "") + ' style="width:auto"> 이 자료로 시험 범위를 다 넣었어요 <span class="small">(범위 밖 지문을 더 정확히 가려요)</span></label>'),
          propRow("파일", s.file ? esc(s.file.name) + ' <span class="small">· ' + (s.ocr ? "OCR · " : "") + TEXT.fmtDate(s.createdAt) + '</span>' : "—"),
        ]);
      },
      handout(s, d) {
        const tg = s.target || {}, r = s.reflection;
        return props([
          propRow("대상 시험", '<span class="row" style="gap:6px"><input type="number" id="dTy" value="' + esc(tg.year || "") + '" style="width:80px">' + seg("dTs", [[1, "1학기"], [2, "2학기"]], tg.semester) + seg("dTt", [["중간", "중간"], ["기말", "기말"], ["1차지필", "1차지필"], ["2차지필", "2차지필"]], tg.term) + (tg.guessed ? '<span class="badge warn" title="파일에서 추정한 값이에요">추정</span>' : "") + '</span>'),
          propRow("반영율", r ? '<span class="num gold">' + pct(r.rate) + '</span> <span class="small">' + r.hit + '/' + r.n + ' 문항</span>' : '<span class="small">기출과 짝이 없어요 — 같은 시험의 기출을 넣으면 계산해요</span>'),
          propRow("지문", '<span class="num">' + (s.passages || 0) + '</span>'), propRow("포인트", '<span class="num">' + (s.items || []).length + '</span>'),
          propRow("파일", s.file ? esc(s.file.name) + ' <span class="small">· ' + (s.ocr ? "OCR · " : "") + TEXT.fmtDate(s.createdAt) + '</span>' : "—"),
        ]);
      },
      profile(p, d) {
        const P = p.profile || {}, b = p.basedOn || {};
        const sel = '<select id="profVer">' + d.versions.map(x => '<option value="' + esc(x.id) + '"' + (x.id === p.id ? " selected" : "") + '>V' + x.version + ' · ' + TEXT.fmtDate(x.createdAt) + '</option>').join("") + '</select>';
        return props([
          propRow("버전", sel + (d.versions[0] && d.versions[0].id !== p.id ? ' <span class="badge warn">옛 판</span>' : ' <span class="badge ok">최신</span>')),
          propRow("레벨", P.level ? esc(P.level.name) + ' Lv.' + P.level.id + (P.level.next ? ' <span class="small">· 다음 ' + esc(P.level.next.name) + '까지 ' + esc(P.level.next.need || "") + '</span>' : "") : "—"),
          propRow("신뢰도", '<span class="num">' + (P.reliability !== undefined ? pct(P.reliability) : "—") + '</span>' + (P.consistency && P.consistency.overall !== null && P.consistency.overall !== undefined ? ' <span class="small">· 일관성 ' + P.consistency.overall + '</span>' : "")),
          propRow("근거", '시험 <span class="num">' + (b.nExams || 0) + '</span> · 문항 <span class="num">' + (b.nQuestions || 0) + '</span> · 지문 <span class="num">' + (b.nPassages || 0) + '</span> · 매칭 <span class="num">' + (b.matched || 0) + '</span>' + (b.span ? ' <span class="small">(' + esc(b.span.from) + ' ~ ' + esc(b.span.to) + ')</span>' : "")),
          propRow("모델", esc(p.model || "—") + (p.provider ? ' <span class="small">' + esc(p.provider) + '</span>' : "")),
          propRow("이유", esc(p.reason || "—")),
          propRow("만든 날", TEXT.fmtDate(p.createdAt) + ' <span class="small">' + ago(p.createdAt) + '</span>'),
          propRow("강사 메모", (p.usedNotes || 0) ? '이 판의 서술에 반영된 메모 <span class="num">' + p.usedNotes + '</span>개' : '<span class="small">반영된 메모 없음 — 선생님 노트나 프로파일 노트에 메모를 적으면 다음 학습 서술에 실려요</span>'),
        ]);
      },
      prediction(pr, d) {
        const bp = pr.blueprint || {}, tg = pr.target || {};
        let dday = ""; if (tg.date) { const n = Math.ceil((new Date(tg.date + "T00:00:00").getTime() - Date.now()) / DAY); dday = ' <span class="badge ' + (n >= 0 ? "warn" : "") + '">' + (n >= 0 ? "D-" + n : "D+" + (-n)) + '</span>'; }
        return props([
          propRow("대상 시험", esc(tg.label || "—") + (tg.date ? ' <span class="small">' + esc(tg.date) + '</span>' : "") + dday),
          propRow("프로파일", (d.profile ? link(d.profile.id, "프로파일 V" + pr.profileVersion) : "V" + (pr.profileVersion || "?")) + (S.profiles.get(pr.teacherId) && S.profiles.get(pr.teacherId).version !== pr.profileVersion ? ' <span class="badge warn">지금 V' + S.profiles.get(pr.teacherId).version + ' — 다시 예측하세요</span>' : "")),
          propRow("신뢰도", bp.confidence ? '<span class="num">' + pct(bp.confidence.overall) + '</span> <span class="small">구성 ' + pct(bp.confidence.plan) + ' · 지문 ' + pct(bp.confidence.passages) + ' · 어법 ' + pct(bp.confidence.grammar) + '</span>' : "—"),
          propRow("모델", esc(pr.model || "—") + (bp.refinement && bp.refinement.adjustments && bp.refinement.adjustments.length ? ' <span class="small">· 보정 ' + bp.refinement.adjustments.length + '건</span>' : "")),
          propRow("만든 날", TEXT.fmtDate(pr.createdAt) + ' <span class="small">' + ago(pr.createdAt) + '</span>'),
        ]);
      },
      mock(m, d) {
        const st = m.stats || {};
        return props([
          propRow("대상", esc(m.target || "—")),
          propRow("문항 수", '<span class="num">' + (st.total || (m.questions || []).length) + '</span> <span class="small">객관식 ' + (st.objective || 0) + ' · 서술형 ' + (st.subjective || 0) + '</span>'),
          propRow("배점", '<span class="num">' + (st.points || 0) + '</span>점'),
          propRow("모델", esc(m.model || "—")),
          propRow("예측", (d.prediction ? link(d.prediction.id, (d.prediction.target || {}).label + " 예측") : "—") + ' <span class="small">V' + (m.profileVersion || "?") + '</span>'),
          propRow("만든 날", TEXT.fmtDate(m.createdAt) + ' <span class="small">' + ago(m.createdAt) + '</span>'),
        ]);
      },
      note(n, d) {
        const t = n.teacherId ? T(n.teacherId) : null;
        const rows = [propRow("만든 날", TEXT.fmtDate(n.createdAt) + ' <span class="small">' + ago(n.createdAt) + '</span>'), propRow("선생님", t ? link(t.id, t.name) : '<span class="small">범위 없음</span>'), propRow("종류", esc(NOTES.kindLabel(n.kind)))];
        if (n.date) rows.push(propRow("날짜", '<span class="num">' + esc(n.date) + '</span>'));
        if (n.kind === "anchor") rows.push(propRow("붙은 곳", n.anchor && n.anchor.id ? link(n.anchor.id, nodeTitle(n.anchor.id)) : n.orphanOf ? '<span class="small">삭제된 ' + esc(n.orphanOf.title || "") + ' (' + esc(KL[NOTES.kindOf(n.orphanOf.id)] || n.orphanOf.store || "") + ')</span>' : "—"));
        if (n.kind === "ask" && n.ask) {
          rows.push(propRow("범위", n.ask.scope && n.ask.scope !== "*" && T(n.ask.scope) ? esc(T(n.ask.scope).name) : "모든 선생님"));
          rows.push(propRow("모델", esc(n.ask.model || "—") + (n.ask.aborted ? ' <span class="badge warn">중단됨</span>' : "")));
          rows.push(propRow("근거", '<span class="num">' + (n.ask.evidence || []).length + '</span>개 · 인용 <span class="num">' + (n.ask.used || []).length + '</span>' + (n.ask.chars ? ' <span class="small">· 약 ' + n.ask.chars.toLocaleString() + '자</span>' : "")));
          if (n.ask.ctx) rows.push(propRow("맥락", link(n.ask.ctx, d.ctxTitle || n.ask.ctx)));
        }
        rows.push(propRow("서명", esc(n.author || "이 기기") + ' <span class="small">· 수정 ' + ago(n.updatedAt) + '</span>' + (n.pinned ? ' <span class="badge ok">고정</span>' : "")));
        return props(rows);
      },
    };
    // 속성 편집 — 모든 편집은 DB.get → patch → put (학습 중 문서를 덮지 않는다)
    const propsEditors = {
      exam(root, e) {
        root.querySelectorAll("[data-m]").forEach(inp => inp.onchange = () => { const k = inp.dataset.m; const v = k === "year" ? +inp.value : inp.value.trim(); if (k === "year" && !(v > 1990 && v < 2100)) { UI.toast("연도가 이상해요", { bad: true }); return; } APP.updateExamMeta(e.id, { [k]: v }).then(x => { if (x) $("noteTitle").textContent = x.title; }); });
        root.querySelectorAll("[data-seg]").forEach(sg => sg.querySelectorAll("button").forEach(b => b.onclick = () => { sg.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); const k = sg.dataset.seg; const v = k === "term" ? b.dataset.v : +b.dataset.v; APP.updateExamMeta(e.id, { [k]: v }).then(x => { if (x) $("noteTitle").textContent = x.title; }); }));
      },
      question(root, q) {
        const sel = root.querySelector("#dMatchSel"); if (sel) sel.onchange = () => { const v = sel.value; if (!v) return; sel.disabled = true; APP.setQuestionMatch(q.id, v === "__none" ? null : v).then(() => UI.toast(v === "__none" ? "매칭을 해제했어요" : "매칭을 바꿨어요", { ok: true })).catch(err => { UI.toast(err.message, { bad: true }); sel.disabled = false; }); };
      },
      source(root, s) {
        const dk = root.querySelector("#dKind"); if (dk) dk.querySelectorAll("button").forEach(b => b.onclick = async () => { const d = await DB.get("sources", s.id); if (!d) return; d.kind = b.dataset.v; d.updatedAt = Date.now(); await DB.put("sources", d); dk.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); await APP.refreshCounts(d.teacherId); APP.emit("data", d.teacherId); });
        const dc = root.querySelector("#dComplete"); if (dc) dc.onchange = () => APP.setSourceComplete(s.id, dc.checked).then(() => UI.toast(dc.checked ? "범위 완비로 표시했어요" : "범위 완비를 풀었어요", { ok: true }));
      },
      handout(root, s) {
        const save = async () => {
          const d = await DB.get("sources", s.id); if (!d) return;
          const on = (id) => { const b = root.querySelector("#" + id + " .on"); return b ? b.dataset.v : null; };
          d.target = { year: +root.querySelector("#dTy").value || null, semester: +on("dTs") || null, term: on("dTt") || null, guessed: false }; d.updatedAt = Date.now();
          await DB.put("sources", d); await APP.recomputeReflection(d.teacherId); APP.emit("data", d.teacherId); APP.refreshLinks(d.teacherId); UI.toast("대상 시험을 저장했어요 — 반영율을 다시 셌어요", { ok: true });
        };
        const ty = root.querySelector("#dTy"); if (ty) ty.onchange = save;
        ["dTs", "dTt"].forEach(id => { const sg = root.querySelector("#" + id); if (sg) sg.querySelectorAll("button").forEach(b => b.onclick = () => { sg.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); save(); }); });
      },
      profile(root, p) {
        const sel = root.querySelector("#profVer"); if (sel) sel.onchange = () => { if (sel.value && sel.value !== p.id) ROUTE.go(noteHref(sel.value)); };
      },
    };

    // ================= 본문 블록 (종류별) =================
    const rawDetails = (text, label) => text ? '<details class="raw"><summary>' + esc(label || "원문 텍스트 보기") + '</summary><pre>' + esc(String(text).slice(0, 30000)) + '</pre></details>' : "";
    const emptyBox = (b, s, btn) => '<div class="empty"><b>' + esc(b) + '</b>' + (s ? esc(s) : "") + (btn ? '<br>' + btn : "") + '</div>';
    const blocks = {
      teacher(t, d) {
        const c = d.counts, p = d.profile, pr = d.prediction, busy = S.busy.get(t.id);
        const job = S.queue.find(j => j.teacherId === t.id && stageBusy(j));
        const cloud = SYNC.st, irow = UI.irow;
        const ST = (on, txt, cls) => ({ text: txt, cls: cls || (on ? "" : "off") });
        let html = '<div class="sec" id="teacherStatus"><h4>Status</h4><div class="row" style="margin-bottom:8px"><i class="dot" style="width:10px;height:10px;border-radius:50%;background:' + esc(t.color) + ';box-shadow:0 0 10px ' + esc(t.color) + '"></i><b style="font-size:15px">' + esc(t.name) + '</b><span class="chip dim">' + esc(t.subject || "") + '</span><span class="grow"></span><span class="badge">' + (p ? "V" + p.version : "V0") + '</span></div>';
        html += irow("doc", "문항 데이터화", (c.questions || 0) + "문항 · 기출 " + (c.exams || 0) + "건", job && ["analyze", "ocr", "extract", "classify"].includes(job.stage) ? ST(1, "WORKING", "busy") : ST(c.questions, c.questions ? "ONLINE" : "STANDBY"));
        html += irow("globe", "지문 매칭", "범위 지문 " + (c.passages || 0) + "개 · 매칭 " + (c.matchable ? Math.round((c.matched || 0) / c.matchable * 100) + "%" : "—"), job && ["match", "index"].includes(job.stage) ? ST(1, "WORKING", "busy") : ST(c.passages, c.passages ? "ONLINE" : "STANDBY"));
        html += irow("brain", "성향 학습", p ? "프로파일 V" + p.version + " · " + p.profile.level.name + " Lv." + p.profile.level.id + " · 신뢰도 " + pct(p.profile.reliability) : "아직 학습 전", busy === "학습 중" ? ST(1, "LEARNING", "busy") : ST(p, p ? "ONLINE" : "STANDBY"));
        html += irow("target", "다음 시험 예측", pr ? pr.target.label + " · 신뢰도 " + pct(pr.blueprint.confidence.overall) : "예측 전", busy === "예측 중" ? ST(1, "WORKING", "busy") : ST(pr, pr ? "READY" : "STANDBY"));
        html += irow("print", "프린트 반영율", p && p.profile.handout ? "프린트 → 시험 " + pct(p.profile.handout.rate) + " (시험 " + p.profile.handout.nExams + "개)" : (c.sources ? "프린트를 넣으면 계산해요" : "선생님 프린트 없음"), ST(p && p.profile.handout, p && p.profile.handout ? pct(p.profile.handout.rate) : "STANDBY", p && p.profile.handout ? "warn" : "off"));
        html += irow("wifi", "클라우드 (Supabase)", cloud.enabled ? "작업공간 " + cloud.workspace + (cloud.lastSync ? " · " + TEXT.fmtDate(cloud.lastSync) : "") : "동기화 꺼짐", cloud.enabled ? (cloud.status === "error" ? ST(1, "OFFLINE", "warn") : cloud.status === "syncing" || cloud.pending ? ST(1, "SYNCING", "busy") : ST(1, "ONLINE")) : ST(0, "OFF"));
        html += irow("shield", "엔진", API.ready() ? API.providerName() + " · " + API.modelLabel() : "API 키 없음", ST(API.ready(), API.ready() ? "ONLINE" : "NO KEY", API.ready() ? "" : "warn"));
        html += '</div>';
        if (p) {
          const P = p.profile, n = p.narrative;
          html += '<div class="sec"><h4>최신 프로파일 <span>' + esc(P.level.name) + ' · 신뢰도 ' + pct(P.reliability) + '</span></h4>' + (n ? '<div class="narr">' + esc(clip(n.text, 400)) + '</div><div class="chips" style="margin-top:6px">' + n.keywords.map(k => '<span class="chip">' + esc(k) + '</span>').join("") + '</div>' : '<div class="small">API 키가 있으면 서술을 만들어요</div>')
            + '<div class="dist" style="margin-top:8px">' + Object.keys(P.typeDist).slice(0, 5).map(k => '<span>' + esc(k) + '</span><div class="bar"><i style="width:' + Math.round(P.typeDist[k].wshare * 100) + '%"></i></div><i class="n">' + pct(P.typeDist[k].wshare) + '</i>').join("") + '</div>'
            + '<div class="row" style="margin-top:8px"><a class="chip" href="' + esc(noteHref(p.id)) + '">프로파일 V' + p.version + ' 열기</a>' + (pr ? '<a class="chip" href="' + esc(noteHref(pr.id)) + '">' + esc(pr.target.label) + ' 예측 열기</a>' : "") + '</div></div>';
        } else html += '<div class="sec"><h4>프로파일</h4>' + emptyBox(c.questions ? "문항이 " + c.questions + "개 — 학습할 수 있어요" : "문항이 1개 이상이면 학습할 수 있어요", c.questions ? "" : "기출 시험지를 넣으면 자동으로 학습해요") + '</div>';
        html += '<div class="sec"><h4>시험 <span>' + d.exams.length + '</span></h4>' + (d.exams.length ? '<div class="tl">' + d.exams.map(e => { const a = e.analysis || {}; const low = c.passages && a.total && (e.matched || 0) / a.total < 0.5; const badge = e.status === "error" ? '<span class="badge bad">ERROR</span>' : low ? '<span class="badge warn">LOW MATCH</span>' : e.learnedInVersion ? '<span class="badge ok">LEARNED</span>' : '<span class="badge">ANALYZED</span>';
          return '<a class="it" data-exam="' + esc(e.id) + '" href="' + esc(noteHref(e.id)) + '"><span class="t">' + esc(e.title) + '</span>' + badge + '<span class="s">' + (a.total || 0) + '문항 · ' + esc((e.file || {}).name || "") + (e.ai ? ' · AI ' + pct(e.ai.aiLikelihood) : "") + (e.reflection ? ' · 프린트 반영 ' + pct(e.reflection.rate) : "") + '</span></a>'; }).join("") + '</div>' : emptyBox("기출 시험지를 인박스에 놓으세요", "문항 · 지문 · 프린트 반영율이 여기서 자라요", '<a class="chip" href="#/inbox">인박스 열기</a>')) + '</div>';
        html += '<div class="sec"><h4>자료 <span>' + d.sources.length + '</span></h4>' + (d.sources.length ? '<div class="tl">' + d.sources.map(s => '<a class="it" data-src="' + esc(s.id) + '" href="' + esc(noteHref(s.id)) + '"><span class="t">' + (s.kind === "프린트" ? "프린트 · " : "범위 · ") + esc(s.name) + '</span><span class="badge' + (s.kind === "프린트" ? " warn" : "") + '">' + (s.kind === "프린트" ? (s.reflection ? "HIT " + pct(s.reflection.rate) : "PRINT") : esc(s.kind)) + '</span><span class="s">지문 ' + (s.passages || 0) + '개' + (s.items ? ' · 포인트 ' + s.items.length : "") + (s.complete ? ' · 범위 완비' : "") + ' · ' + esc((s.file || {}).name || "") + '</span></a>').join("") + '</div>' : emptyBox("범위 원문이 없어 유력 지문을 고를 수 없어요", "교과서 · 부교재 원문과 선생님 프린트를 넣어 주세요")) + '</div>';
        html += '<div class="sec"><h4>지난 모의고사 <span>' + d.mocks.length + '</span></h4>' + (d.mocks.length ? '<div class="tl">' + d.mocks.map(m => '<a class="it" data-mock="' + esc(m.id) + '" href="' + esc(noteHref(m.id)) + '"><span class="t">' + esc(m.title) + '</span><span class="badge">' + ((m.stats || {}).total || (m.questions || []).length) + ' Q</span><span class="s">' + esc(m.target) + ' · ' + TEXT.fmtDate(m.createdAt) + ' · ' + esc(m.model || "") + '</span></a>').join("") + '</div>' : '<div class="small">' + (pr ? "예측이 준비됐어요 — 적중 모의고사를 만들 수 있어요" : "예측 뒤에 만들 수 있어요") + '</div>') + '</div>';
        return html;
      },
      exam(e, d) {
        const a = e.analysis || {}, qs = d.questions, pmap = d.pmap;
        let html = '<div class="sec"><h4>분석</h4><div class="narr">' + esc(a.summary || "요약이 없어요") + '</div></div>';
        if (e.reflection) html += '<div class="sec"><h4>프린트 반영율 <span>' + pct(e.reflection.rate) + '</span></h4><div class="bar gold"><i style="width:' + Math.round(e.reflection.rate * 100) + '%"></i></div><div class="small">' + e.reflection.hits.length + '/' + e.reflection.n + ' 문항이 프린트에서 나왔어요 · ' + Object.keys(e.reflection.kinds || {}).map(k => esc(k) + " " + e.reflection.kinds[k]).join(" · ") + '</div></div>';
        if (e.ai) html += '<div class="sec"><h4>AI 활용 추정 <span>' + esc(e.ai.label || "") + '</span></h4><div class="bar gold"><i style="width:' + Math.round(e.ai.aiLikelihood * 100) + '%"></i></div><div class="small">' + pct(e.ai.aiLikelihood) + ' (구간 ' + pct(e.ai.band[0]) + '~' + pct(e.ai.band[1]) + ') · 신호 커버리지 ' + pct(e.ai.coverage) + '</div>' + (e.ai.llm ? '<div class="small" style="margin-top:4px">' + esc(e.ai.llm.summary || "") + '</div><ul class="small" style="padding-left:16px;margin:4px 0">' + (e.ai.llm.evidence || []).map(v => '<li>' + (v.direction === "ai" ? "AI" : v.direction === "human" ? "사람" : "·") + ' ' + esc(v.note) + (v.quote ? ' <span class="faint">“' + esc(v.quote) + '”</span>' : "") + '</li>').join("") + '</ul>' : "") + '<details class="raw"><summary>신호표</summary><table class="tbl">' + (e.ai.signals || []).map(x => '<tr><td>' + esc(x.name) + '</td><td class="mono">' + (x.available ? (+x.score).toFixed(2) : "—") + '</td><td class="small">' + esc(x.detail || "") + '</td></tr>').join("") + '</table></details><div class="note">' + esc(ANALYZE.AI_DISCLAIMER) + '</div></div>';
        html += '<div class="sec"><h4>문항 <span>' + qs.length + '</span></h4><div class="tblwrap"><table class="tbl"><thead><tr><th>NO</th><th>유형</th><th>배점</th><th>난이도</th><th>지문</th><th>프린트</th></tr></thead><tbody>' + qs.map(q => '<tr class="rowbtn" data-q="' + esc(q.id) + '"><td class="num">' + esc(q.number) + (q.set ? ' <span class="faint">[' + esc(q.set) + ']</span>' : "") + '</td><td>' + esc(q.type) + (q.subtype ? ' <span class="faint">' + esc(q.subtype) + '</span>' : "") + '</td><td class="num">' + (q.points === null || q.points === undefined ? "—" : q.points) + '</td><td>' + esc(q.difficulty) + '</td><td class="small">' + (q.match && q.match.passageId && pmap[q.match.passageId] ? esc(pmap[q.match.passageId].src || "지문") : q.external ? "범위 밖" : q.passage && q.passage.has ? '<span class="faint">미매칭</span>' : "") + '</td><td class="small">' + (q.handoutHit ? '<span class="gold">★ ' + esc((q.handoutHit.kinds || []).join("·")) + '</span>' : "") + '</td></tr>').join("") + '</tbody></table></div></div>';
        html += rawDetails(e.text);
        return html;
      },
      question(q, d) {
        let html = '<div class="sec"><h4>발문</h4><div class="narr">' + esc(q.stem || "—") + '</div>' + ((q.options || []).some(o => o.text) ? '<div class="narr" style="margin-top:6px">' + q.options.map(o => '<div>' + esc(o.label + " " + o.text) + '</div>').join("") + '</div>' : "") + (q.answer ? '<div class="small" style="margin-top:6px">정답: <b style="color:var(--ink)">' + esc(q.answer) + '</b>' + (q.answerSource === "none" ? ' <span class="faint">(정답표 없음)</span>' : "") + '</div>' : '<div class="small" style="margin-top:6px">정답 없음</div>') + '</div>';
        html += '<div class="sec"><h4>특징</h4><div class="small">' + esc(q.features || "—") + (q.difficultyReason ? '<br>난이도: ' + esc(q.difficultyReason) : "") + (q.passage && q.passage.has ? '<br>지문: ' + esc(q.passage.first10 || "") + (q.passage.words ? ' (' + q.passage.words + '단어' + (q.passage.scale && q.passage.scale !== "보통" ? ' · ' + esc(q.passage.scale) : "") + ')' : "") : "") + (q.externalReason ? '<br>범위 밖 판단: ' + esc(q.externalReason) : "") + '</div></div>';
        if (q.subjective) html += '<div class="sec"><h4>서술형</h4><div class="small">' + (q.subjective.conditions || []).map(c => '조건: ' + esc(c)).join("<br>") + (q.subjective.answerLen ? '<br>답 길이: ' + esc(q.subjective.answerLen) : "") + (q.subjective.rubricPrinted ? '<br>채점 기준 인쇄됨' : "") + '</div></div>';
        if (d.passage) html += '<div class="sec"><h4>매칭 지문</h4><div class="tl"><a class="it" data-pass="' + esc(d.passage.id) + '" href="' + esc(noteHref(d.passage.id)) + '"><span class="t">' + esc(d.passage.src || "지문") + (d.passage.fromHandout ? ' <span class="gold">★ 프린트</span>' : "") + '</span><span class="badge ok">' + esc(method(q.match.method) || "AUTO") + ' · ' + pct(q.match.confidence) + '</span><span class="s">“' + esc(first(d.passage.first, 14)) + '…”</span></a></div></div>';
        html += rawDetails(q.rawBlock, "추출 원문");
        return html;
      },
      passage(p, d) {
        const at = cur.query.at !== undefined && cur.query.at !== "" ? +cur.query.at : -1; const needle = String(cur.query.q || "").trim();
        let body;
        if (p.sentences && p.sentences.length) {
          let off = 0, markIdx = -1; const text = String(p.text || "");
          const spans = p.sentences.map((s, i) => { const k = text.indexOf(s, off); const st = k >= 0 ? k : off; const en = st + s.length; if (k >= 0) off = en; if (markIdx < 0 && at >= 0 && at >= st && at < en) markIdx = i; return s; });
          if (at >= 0 && markIdx < 0 && spans.length) markIdx = Math.min(spans.length - 1, Math.max(0, Math.floor(at / Math.max(1, text.length) * spans.length)));
          body = spans.map((s, i) => '<span title="' + (i + 1) + '번째 문장"' + (p.topicIdx === i ? ' style="color:var(--gold)"' : (p.blankCandidates || []).includes(i) ? ' style="text-decoration:underline dotted"' : "") + '>' + (i === markIdx ? '<mark>' + esc(s) + '</mark>' : esc(s)) + '</span>').join(" ");
        } else {
          const text = String(p.text || "");
          if (at >= 0 && at < text.length) { const len = needle ? needle.length : Math.min(120, text.length - at); body = esc(text.slice(0, at)) + '<mark>' + esc(text.slice(at, at + len)) + '</mark>' + esc(text.slice(at + len)); }
          else body = esc(text);
        }
        let html = '<div class="sec"><h4>요지</h4><div class="narr">' + esc(p.gist || "—") + '</div></div>';
        html += '<div class="sec"><h4>원문 <span>' + (p.words || 0) + '단어</span></h4><div class="narr note-body" style="font-family:var(--fk)">' + body + '</div><div class="small" style="margin-top:4px">노랑 = 주제문 · 점선 = 빈칸 후보' + ((p.grammarTargets || []).length ? ' · 어법 후보: ' + p.grammarTargets.map(g => esc(g.point) + "(" + (g.sent + 1) + "번째 문장)").join(", ") : "") + '</div></div>';
        html += '<div class="sec"><h4>이 지문을 쓴 문항 <span>' + d.used.length + '</span></h4>' + (d.used.length ? '<div class="tl">' + d.used.map(q => '<a class="it" data-q="' + esc(q.id) + '" href="' + esc(noteHref(q.id)) + '"><span class="t">' + esc((d.emap[q.examId] || {}).title || "시험") + ' · ' + esc(q.number) + '번</span><span class="badge">' + esc(q.type) + '</span><span class="s">' + esc(q.stem || "") + (q.match && q.match.method ? ' · ' + esc(method(q.match.method)) + ' ' + pct(q.match.confidence) : "") + '</span></a>').join("") + '</div>' : '<div class="small">아직 쓰인 적 없어요</div>') + '</div>';
        if (d.source) html += '<div class="sec"><h4>출처 자료</h4><div class="tl"><a class="it" data-src="' + esc(d.source.id) + '" href="' + esc(noteHref(d.source.id)) + '"><span class="t">' + esc(d.source.name) + '</span><span class="badge' + (d.source.kind === "프린트" ? " warn" : "") + '">' + esc(d.source.kind) + '</span><span class="s">지문 ' + (d.source.passages || 0) + '개' + (p.order ? ' · 이 지문은 ' + p.order + '번째' : "") + '</span></a></div></div>';
        if (d.hot) html += '<div class="sec"><h4>예측 근거 <span>' + pct(d.hot.pUse) + '</span></h4><div class="note">' + (d.hot.reasons || []).map(esc).join("<br>") + '</div>' + ((d.hot.history || []).length ? '<div class="small">지난 출제: ' + d.hot.history.map(h => esc((d.emap[h.examId] || {}).title || "") + " " + esc(h.type)).join(" · ") + '</div>' : "") + '</div>';
        return html;
      },
      source(s, d) {
        const ps = d.passages;
        let html = '<div class="sec"><h4>지문 <span>' + ps.length + '</span></h4>' + (ps.length ? '<div class="tl">' + ps.map(x => '<a class="it" data-pass="' + esc(x.id) + '" href="' + esc(noteHref(x.id)) + '"><span class="t">' + esc(x.src || "지문") + ' <span class="faint">' + esc(x.kind || "") + '</span></span><span class="badge">' + (x.words || 0) + 'w</span><span class="s">“' + esc(first(x.first, 8)) + '…”</span></a>').join("") + '</div>' : '<div class="small">지문을 찾지 못했어요</div>') + '</div>';
        html += rawDetails(s.text);
        return html;
      },
      handout(s, d) {
        const r = s.reflection, p = d.profile;
        let html = '<div class="sec"><h4>시험 실질 반영율 <span>' + (r ? pct(r.rate) : "기출과 짝이 없어요") + '</span></h4>' + (r ? '<div class="bar gold"><i style="width:' + Math.round(r.rate * 100) + '%"></i></div><div class="small">' + (r.exams || []).map(x => esc(x.label) + " " + x.hit + "/" + x.n + " (" + pct(x.rate) + ")").join(" · ") + '</div>' : '<div class="small">같은 시험(연도 · 학기 · 중간/기말)의 기출 시험지를 넣으면 이 프린트에서 몇 문항이 실제로 나왔는지 계산해요.</div>') + (p && p.profile.handout ? '<div class="small" style="margin-top:4px">이 선생님의 전체 프린트 반영율 ' + pct(p.profile.handout.rate) + ' (시험 ' + p.profile.handout.nExams + '개)</div>' : "") + '</div>';
        const hitIdx = new Set((r ? r.itemHits : []).map(x => x.i));
        html += '<div class="sec"><h4>포인트 <span>' + (s.items || []).length + ' · ★ = 시험에 나옴</span></h4>' + ((s.items || []).length ? '<div class="tl">' + s.items.map((it, i) => '<div class="it" style="cursor:default"><span class="t">' + (hitIdx.has(i) ? '<span class="gold">★</span> ' : "") + esc(it.text) + '</span><span class="badge' + (hitIdx.has(i) ? " warn" : "") + '">' + esc(it.kind) + (it.point ? " · " + esc(it.point) : "") + '</span>' + (it.stem ? '<span class="s">' + esc(it.stem) + '</span>' : "") + '</div>').join("") + '</div>' : '<div class="small">포인트가 없어요</div>') + '</div>';
        html += blocks.source(s, d);
        return html;
      },
      profile(p, d) {
        const P = p.profile || {}, n = p.narrative;
        let html = '<div class="sec"><h4>이번 판에서 달라진 점 <span>V' + p.version + '</span></h4>' + (p.delta && p.delta.length ? '<ul style="margin:0;padding-left:18px;line-height:1.7">' + p.delta.map(x => '<li>' + esc(x) + '</li>').join("") + '</ul>' : '<div class="small">' + (p.version === 1 ? "첫 학습이에요" : "지난 판과 눈에 띄는 차이가 없어요") + '</div>') + '</div>';
        html += '<div class="sec"><h4>서술</h4>' + (n ? '<div class="narr">' + esc(n.text) + '</div><div class="chips" style="margin-top:8px">' + (n.keywords || []).map(k => '<span class="chip">' + esc(k) + '</span>').join("") + '</div>' + ((n.watchouts || []).length ? '<div class="note"><b>주의점</b><br>' + n.watchouts.map(esc).join("<br>") + '</div>' : "") : '<div class="small">API 키가 있으면 서술을 만들어요 — [다시 학습]</div>') + '</div>';
        const td = P.typeDist || {}; const keys = Object.keys(td).sort((a, b) => (td[b].wshare || 0) - (td[a].wshare || 0));
        html += '<div class="sec"><h4>유형 분포 <span>가중 비중 · 시험당 문항</span></h4><div class="dist">' + keys.map(k => '<span>' + esc(k) + '</span><div class="bar"><i style="width:' + Math.round((td[k].wshare || 0) * 100) + '%"></i></div><i class="n">' + pct(td[k].wshare) + ' · ' + td[k].perExam + '</i>').join("") + '</div></div>';
        const tp = P.transformationPrefs || {}, pp = P.passagePref || {}, sh = P.setHabits || {}, ss = P.stemSignature || {}, dm = (P.difficultyCurve || {}).mix || {}, sub = P.subjective || {};
        const kv = [];
        kv.push(["시험당", P.totalQuestionsAvg + "문항 · " + P.totalPointsAvg + "점 · 서술형 " + P.subjectiveAvg + (sub.avgPoints ? " (평균 " + sub.avgPoints + "점)" : "")]);
        kv.push(["난이도", "상 " + pct(dm.상) + " · 중 " + pct(dm.중) + " · 하 " + pct(dm.하)]);
        if ((P.grammarPoints || []).length) kv.push(["어법", P.grammarPoints.slice(0, 5).map(g => g.point + " " + pct(g.wshare) + (g.trend && g.trend !== "=" ? g.trend : "")).join(" · ")]);
        if (tp.빈칸 && tp.빈칸.blankPosition) kv.push(["빈칸", Object.keys(tp.빈칸.blankPosition).slice(0, 3).map(k => k + " " + pct(tp.빈칸.blankPosition[k])).join(", ") + (tp.빈칸.blankUnit ? " · " + Object.keys(tp.빈칸.blankUnit).slice(0, 2).map(k => k + " " + pct(tp.빈칸.blankUnit[k])).join(", ") : "")]);
        kv.push(["지문", pp.wordsMean + "±" + pp.wordsSd + "단어 · 재출제 " + pct(pp.reuseRate) + " · 범위 밖 " + pct(P.externalRatio)]);
        if (sh.setsPerExam) kv.push(["세트", "시험당 " + sh.setsPerExam + "개" + (sh.typicalRange ? " · " + sh.typicalRange + "번" : "")]);
        if (ss.honorific) kv.push(["발문", (Object.keys(ss.honorific)[0] || "") + "체 · 평가원 유사도 " + ss.kiceLikeMean]);
        if (sub.formats && Object.keys(sub.formats).length) kv.push(["서술형", Object.keys(sub.formats).slice(0, 3).map(k => k + " " + pct(sub.formats[k])).join(" · ")]);
        html += '<div class="sec"><h4>습관</h4><div class="kv">' + kv.map(x => '<b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span>').join("") + '</div></div>';
        if (P.ai && P.ai.mean !== null && P.ai.mean !== undefined) html += '<div class="sec"><h4>AI 활용 추정 <span title="' + esc(ANALYZE.AI_DISCLAIMER) + '">참고용</span></h4><div class="bar gold"><i style="width:' + Math.round(P.ai.mean * 100) + '%"></i></div><div class="small">' + pct(P.ai.mean) + ' · ' + (P.ai.mean < 0.3 ? "낮음" : P.ai.mean < 0.6 ? "중간" : "높음") + ' — 문체 · 선지 균일도 등 정황만으로 추정한 값이에요</div></div>';
        if (P.handout) html += '<div class="sec"><h4>프린트 반영 <span>' + pct(P.handout.rate) + '</span></h4><div class="bar gold"><i style="width:' + Math.round(P.handout.rate * 100) + '%"></i></div><div class="small">' + (P.handout.byExam || []).map(x => esc(x.label) + " " + pct(x.rate)).join(" · ") + (P.handout.kinds ? ' · ' + Object.keys(P.handout.kinds).map(k => esc(k) + " " + P.handout.kinds[k]).join(" · ") : "") + '</div></div>';
        else html += '<div class="sec"><h4>프린트 반영</h4><div class="small">파일을 넣을 때 칩을 ‘프린트’ 로 두면 반영율을 계산해요</div></div>';
        const ex = (p.basedOn && p.basedOn.examIds || []).map(id => d.emap[id]).filter(Boolean);
        html += '<div class="sec"><h4>근거 시험 <span>' + ex.length + '</span></h4>' + (ex.length ? '<div class="tl">' + ex.map(e => '<a class="it" data-exam="' + esc(e.id) + '" href="' + esc(noteHref(e.id)) + '"><span class="t">' + esc(e.title) + '</span><span class="badge">' + ((e.analysis || {}).total || 0) + ' Q</span></a>').join("") + '</div>' : '<div class="small">근거 시험이 지워졌어요</div>') + '</div>';
        return html;
      },
      prediction(pr, d) {
        const bp = pr.blueprint || {}, plan = bp.plan || {}, pmap = d.pmap;
        let html = '<div class="sec"><canvas id="rangeMap" width="640" height="150" style="width:100%;max-width:640px;height:auto;display:block"></canvas><div class="small" style="margin:4px 0 0">시험범위 지도 — 점 하나가 지문 하나 · 밝을수록 다음 시험에 나올 확률 · 노랑 = 프린트에 실림</div></div>';
        html += '<div class="sec"><h4>구성</h4><div class="kv"><b>문항</b><span>' + (plan.total || 0) + '문항 (객관식 ' + (plan.objective || 0) + ' · 서술형 ' + (plan.subjective || 0) + ') · ' + (plan.points || 0) + '점</span><b>유형</b><span>' + (plan.typePlan || []).map(x => esc(x.type) + " " + x.n + (x.pointsEach ? " (" + x.pointsEach + "점 · " + esc(x.difficulty || "") + ")" : "")).join(" · ") + '</span>' + (plan.difficultyMix ? '<b>난이도</b><span>상 ' + pct(plan.difficultyMix.상) + ' · 중 ' + pct(plan.difficultyMix.중) + ' · 하 ' + pct(plan.difficultyMix.하) + '</span>' : "") + (plan.sets && plan.sets.length ? '<b>세트</b><span>' + plan.sets.map(s => esc(typeof s === "string" ? s : (s.range || s.set || JSON.stringify(s)))).join(" · ") + '</span>' : "") + '</div></div>';
        const hot = (bp.passages || []).slice(0, 12);
        html += '<div class="sec"><h4>유력 지문 <span>' + (bp.passages || []).length + '개 중 ' + hot.length + '</span></h4>' + (hot.length ? hot.map(s => { const x = pmap[s.passageId]; return '<a class="hot" data-pass="' + esc(s.passageId) + '" href="' + esc(noteHref(s.passageId)) + '"><span class="p">' + pct(s.pUse) + '</span><span class="t">' + (s.onHandout ? '<span class="gold">★</span> ' : "") + esc(s.src || (x && x.src) || "지문") + ' “' + esc(first(s.first || (x && x.first) || "", 5)) + '…” <span class="faint">' + (s.expectedTypes || []).map(esc).join("/") + '</span></span><div class="bar w' + (s.onHandout ? " gold" : "") + '"><i style="width:' + Math.round(s.pUse * 100) + '%"></i></div>' + ((s.reasons || []).length ? '<span class="why">' + esc(s.reasons[0]) + '</span>' : "") + '</a>'; }).join("") : '<div class="small">범위 원문이 없어 유력 지문을 고를 수 없어요</div>') + '</div>';
        if ((bp.grammarPoints || []).length) html += '<div class="sec"><h4>어법 포인트</h4><div class="kv">' + bp.grammarPoints.slice(0, 8).map(g => '<b>' + esc(g.point) + '</b><span>' + pct(g.p) + (g.onHandout ? ' <span class="gold">★</span>' : "") + ' <span class="small">' + esc(g.reason || "") + '</span></span>').join("") + '</div></div>';
        if ((bp.subjectiveFormats || []).length) html += '<div class="sec"><h4>서술형 형식</h4><div class="small">' + bp.subjectiveFormats.map(f => esc(f.subtype || f.type || "") + " " + (f.n || 0) + (f.pointsEach ? " (" + f.pointsEach + "점)" : "")).join(" · ") + '</div></div>';
        if (bp.handout && bp.handout.passagesOnHandout) html += '<div class="note">프린트에 실린 지문 ' + bp.handout.passagesOnHandout + '개를 우선 배정' + (bp.handout.rate !== null && bp.handout.rate !== undefined ? ' · 과거 프린트 반영율 ' + pct(bp.handout.rate) : "") + '</div>';
        if ((bp.newMoves || []).length) html += '<div class="sec"><h4>새로 나올 것</h4><div class="note">' + bp.newMoves.map(esc).join("<br>") + '</div></div>';
        if (bp.refinement && (bp.refinement.adjustments || []).length) html += '<div class="sec"><h4>모델 보정</h4><div class="small">' + bp.refinement.adjustments.map(a => esc(a.what) + (a.why ? ' — ' + esc(a.why) : "")).join("<br>") + '</div></div>';
        html += '<details class="raw"><summary>청사진 텍스트 (동형 모의고사 생성기용)</summary><pre>' + esc(pr.copyText || "") + '</pre></details>';
        return html;
      },
      mock(m, d) {
        const qs = m.questions || [];
        let html = '<div class="sec"><h4>문항 <span>' + qs.length + '</span></h4><div class="tblwrap"><table class="tbl"><thead><tr><th>NO</th><th>유형</th><th>배점</th><th>난이도</th><th>지문</th></tr></thead><tbody>' + qs.map(q => '<tr><td class="num">' + esc(q.number) + (q.set ? ' <span class="faint">[' + esc(q.set) + ']</span>' : "") + '</td><td>' + esc(q.type) + (q.subtype ? ' <span class="faint">' + esc(q.subtype) + '</span>' : "") + '</td><td class="num">' + (q.points || 0) + '</td><td>' + esc(q.difficulty || "") + '</td><td class="small">' + (q.passageId ? '<a data-pass="' + esc(q.passageId) + '" href="' + esc(noteHref(q.passageId)) + '">' + esc(q.passageSrc || "지문") + '</a>' : "") + '</td></tr>').join("") + '</tbody></table></div></div>';
        if ((m.failed || []).length) html += '<div class="sec"><h4>만들지 못한 문항 <span>' + m.failed.length + '</span></h4><div class="small">' + m.failed.map(f => esc(f.number) + " (" + esc(f.why) + ")").join(" · ") + '</div></div>';
        return html;
      },
      note(n, d) { return ""; },   // 자유 메모 · daily · weekly · anchor — 편집기가 곧 본문
      ask(n, d) {
        const a = n.ask || {}; const ev = d.evidence || []; const used = new Set(a.used || []);
        const html = ASK.renderCites(esc(n.body || "").replace(/\n/g, "<br>"), ev);
        let out = '<div class="msg me">' + esc(a.question || "") + '</div><div class="msg brain">' + (html || '<span class="small">답이 없어요</span>') + '</div>';
        out += '<div class="sec"><h4>근거 <span>' + ev.length + '</span></h4>' + (ev.length ? ev.map(e => '<a class="lrow' + (used.has(e.n) ? "" : " unused") + (e.alive ? "" : " broken") + '" data-cite="' + e.n + '" data-id="' + esc(e.id) + '" href="' + esc(noteHref(e.id)) + '"><span class="cite' + (used.has(e.n) ? "" : " unused") + '">' + e.n + '</span>' + kindTag(e.kind) + '<span class="t">' + esc(e.title) + '</span><span class="why">' + (used.has(e.n) ? "인용" : "안 씀") + '</span></a>').join("") : '<div class="small">근거 없이 답한 질문이에요</div>') + ((a.invalid || []).length ? '<div class="small">근거에 없는 번호: ' + a.invalid.map(x => '<span class="cite dashed">' + esc(x) + '</span>').join(" ") + '</div>' : "") + '</div>';
        if ((a.followups || []).length) out += '<div class="sec"><h4>더 물어보기</h4>' + a.followups.map(f => '<a class="chip followup" data-followask="' + esc(f) + '" data-followctx="' + esc(a.ctx || "") + '" href="' + esc(ROUTE.href({ view: "ask", query: { q: f, ctx: a.ctx || "" } })) + '">' + esc(f) + '</a>').join("") + '</div>';
        if ((a.structured || []).length) out += '<details class="raw"><summary>구조 근거 (프로파일 · 예측 숫자)</summary><pre>' + esc(a.structured.join("\n")) + '</pre></details>';
        return out;
      },
    };
    function renderBody() {
      const k = cur.sub === "handout" ? "handout" : (cur.store === "notes" ? (cur.sub === "ask" ? "ask" : "note") : cur.kind);
      const fn = blocks[k] || (() => "");
      let html = ""; try { html = fn(cur.doc, cur.data) || ""; } catch (e) { console.error(e); html = '<div class="err">본문을 그리지 못했어요: ' + esc(e.message) + '</div>'; }
      const box = $("noteBody"); box.innerHTML = html;
      const sec = box.closest("section"); if (sec) sec.hidden = !html;
      if (k === "prediction") drawRangeMap(cur.data.passages, cur.doc);
    }
    // 시험범위 지도 — 점 하나가 지문 하나 (옛 #pData 의 rangeMap 그대로)
    function drawRangeMap(passages, pr) {
      const cv = $("rangeMap"); if (!cv) return; const ctx = cv.getContext("2d"); if (!ctx) return;
      const W = cv.width, H = cv.height; ctx.clearRect(0, 0, W, H);
      passages = (passages || []).filter(p => p.kind === "지문");
      if (!passages.length) { ctx.fillStyle = "rgba(143,179,214,.6)"; ctx.font = "22px 'Noto Sans KR'"; ctx.textAlign = "center"; ctx.fillText("범위 원문을 넣으면 지도가 생겨요", W / 2, H / 2 + 8); return; }
      const hot = {}; ((pr && pr.blueprint && pr.blueprint.passages) || []).forEach(s => { hot[s.passageId] = s; });
      const cols = Math.min(24, Math.max(8, Math.ceil(Math.sqrt(passages.length * 2.5)))), cell = W / cols, rows = Math.ceil(passages.length / cols), cellH = Math.min(cell, (H - 12) / rows);
      passages.forEach((p, i) => { const x = (i % cols) * cell + cell / 2, y = 8 + Math.floor(i / cols) * cellH + cellH / 2; const h = hot[p.id]; const v = h ? h.pUse : 0.1; ctx.globalAlpha = 0.25 + 0.75 * v; ctx.fillStyle = h && h.onHandout ? "#f5c518" : "#7fd8ff"; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = v > 0.5 ? 10 : 0; ctx.beginPath(); ctx.arc(x, y, 3 + v * 6, 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }

    // ================= 링크 · 백링크 =================
    const whyOf = (e) => e.kind === "wiki" || e.kind === "manual" ? "링크" : (e.label || LINKS.KIND_LABEL[e.kind] || e.kind);
    // anchor 메모에는 제 페이지가 없다 — 줄은 메모가 붙어 있는 노트로 보낸다(제목은 "메모 · <그 노트>" 그대로).
    // 이 노트에 붙은 제 메모는 백링크가 아니다(바로 위 본문에 이미 있다).
    function backRows(id, back) {
      const out = [];
      const seen = new Set();
      back.forEach(b => {
        const to = b.anchorOf || b.from;
        if (to === id) return;
        const k = to + "|" + b.kind; if (seen.has(k)) return; seen.add(k);
        out.push({ id: to, kind: b.anchorOf ? nodeKind(to) : b.fromKind, title: b.title || nodeTitle(b.from), why: whyOf(b) });
      });
      return out;
    }
    function renderLinks() {
      const id = cur.id;
      let out = [], back = [];
      try { out = LINKS.outlinks(id); back = LINKS.backlinks(id); } catch (e) { console.error(e); }
      if (cur.store === "notes") (cur.doc.links || []).forEach(l => { if (!l.to) out.push({ to: "", kind: "wiki", label: l.text, title: l.text, toKind: "note", broken: true }); });
      const rows = backRows(id, back);
      $("noteLinks").innerHTML = '<h4 class="kicker">링크 <span class="num">' + out.length + '</span></h4>' + (out.length ? out.map(e => e.broken || !e.to ? '<span class="lrow broken" title="이 제목의 노트가 없어요">' + kindTag("note") + '<span class="t">' + esc(e.title || e.label || "") + '</span><span class="why">깨진 링크</span></span>' : row(e.to, e.toKind, e.title || nodeTitle(e.to), whyOf(e))).join("") : '<div class="small">이어진 노트가 없어요 — 메모에 [[ 로 이어 보세요</div>');
      $("noteBacklinks").innerHTML = '<h4 class="kicker">백링크 <span class="num">' + rows.length + '</span></h4>' + (rows.length ? rows.slice(0, 40).map(e => row(e.id, e.kind, e.title, e.why)).join("") : '<div class="small">이 노트를 가리키는 노트가 없어요</div>');
    }

    // ================= 액션 =================
    const btn = (id, label, o) => '<button type="button" id="' + id + '"' + (o && o.pri ? ' class="pri"' : o && o.danger ? ' class="danger"' : "") + (o && o.disabled ? ' disabled title="' + esc(o.title || "") + '"' : (o && o.title ? ' title="' + esc(o.title) + '"' : "")) + '>' + esc(label) + '</button>';
    function renderActions() {
      const { doc, data, store, kind, sub } = cur; const tid = cur.teacherId; const box = $("noteActions"); const on = (id, fn) => { const b = box.querySelector("#" + id); if (b) b.onclick = fn; };
      let html = "";
      if (kind === "teacher") {
        const c = data.counts, p = data.profile, pr = data.prediction, busy = S.busy.has(doc.id);
        html = btn("btnEditTeacher", "정보 수정") + btn("btnFiles", "파일 넣기", { pri: true }) + btn("btnLearn", busy ? "학습 중…" : "학습", { disabled: busy || !c.questions, title: busy ? "작업이 끝나면 할 수 있어요" : !c.questions ? "문항이 1개 이상이면 학습할 수 있어요" : "" }) + btn("btnPredict", "예측", { disabled: busy || !p, title: !p ? "학습 뒤 예측할 수 있어요" : "" }) + btn("btnMock", "적중 모의고사", { disabled: busy || !pr, title: !pr ? "예측 뒤에 만들 수 있어요" : "" }) + btn("btnExportOne", "이 선생님만 백업") + '<span class="grow"></span>' + btn("btnDelTeacher", "삭제", { danger: true });
        box.innerHTML = html;
        on("btnEditTeacher", () => UI.openTeacherSheet(doc)); on("btnFiles", () => { if (S.selectedId !== doc.id) APP.select(doc.id, true); UI.pickFiles(); });
        on("btnLearn", () => UI.run(() => APP.learn(doc.id, { force: true }))); on("btnPredict", () => UI.openPredictSheet(doc.id)); on("btnMock", () => UI.openMockSheet(doc.id));
        on("btnExportOne", () => APP.exportJson(doc.id).then(r => UI.toast(doc.name + " 선생님 데이터를 내려받았어요 (" + TEXT.fmtBytes(r.size) + ")", { ok: true })).catch(e => UI.toast(e.message, { bad: true })));
        on("btnDelTeacher", () => UI.openDeleteSheet(doc));
      } else if (kind === "exam") {
        html = '<a class="chip" href="' + esc(ROUTE.all("questions", { exam: doc.id })) + '">문항 목록으로</a><span class="grow"></span>' + btn("dDelExam", "이 시험지 삭제", { danger: true });
        box.innerHTML = html;
        on("dDelExam", () => { if (confirm("이 시험지와 문항 " + data.questions.length + "개를 지울까요? 붙어 있던 메모는 고아 메모로 남아요.")) APP.deleteExam(doc.id).then(() => { UI.toast("시험지를 지웠어요"); ROUTE.go(ROUTE.all("exams"), { replace: true }); }); });
      } else if (kind === "question") {
        const pid = doc.match && doc.match.passageId;
        html = btn("qUnmatch", "매칭 해제", { disabled: !pid, title: !pid ? "매칭된 지문이 없어요" : "" }) + btn("qSiblings", "같은 지문 문항 보기", { disabled: !pid, title: !pid ? "매칭된 지문이 없어요" : "" }) + btn("qBrain", "브레인에서 보기");
        box.innerHTML = html;
        on("qUnmatch", () => APP.setQuestionMatch(doc.id, null).then(() => UI.toast("매칭을 해제했어요", { ok: true })));
        on("qSiblings", () => ROUTE.go(ROUTE.all("questions", { passage: pid })));
        on("qBrain", () => ROUTE.go(ROUTE.href({ view: "brain", query: { focus: doc.id } })));
      } else if (kind === "passage") {
        html = btn("pMock", "이 지문으로 문항 만들기", { pri: true, disabled: !data.prediction, title: !data.prediction ? "예측 뒤에 만들 수 있어요" : "" }) + btn("pBrain", "브레인에서 보기");
        box.innerHTML = html;
        on("pMock", () => UI.openMockSheet(tid, { sourceIds: doc.sourceId ? [doc.sourceId] : null }));
        on("pBrain", () => ROUTE.go(ROUTE.href({ view: "brain", query: { focus: doc.id } })));
      } else if (store === "sources") {
        html = (sub === "handout" ? btn("dAddPrint", "프린트 더 넣기", { pri: true }) : "") + '<span class="grow"></span>' + btn("dDelSrc", "삭제", { danger: true });
        box.innerHTML = html;
        on("dAddPrint", () => { if (S.selectedId !== tid) APP.select(tid, true); UI.pickFiles("handout"); });
        on("dDelSrc", () => { if (confirm("이 " + (sub === "handout" ? "프린트" : "범위 원문") + "와 지문 " + data.passages.length + "개를 지울까요? 매칭된 문항은 매칭이 풀려요.")) APP.deleteSource(doc.id).then(() => { UI.toast("자료를 지웠어요"); ROUTE.go(ROUTE.all("sources"), { replace: true }); }); });
      } else if (kind === "profile") {
        const busy = S.busy.has(tid);
        html = btn("pfRelearn", busy ? "학습 중…" : "다시 학습", { pri: true, disabled: busy }) + btn("pfCopy", "이 판을 텍스트로 복사") + (S.predictions.get(tid) ? '<a class="chip" href="' + esc(noteHref(S.predictions.get(tid).id)) + '">예측 열기</a>' : btn("pfPredict", "예측"));
        box.innerHTML = html;
        on("pfRelearn", () => UI.run(() => APP.learn(tid, { force: true, reason: "다시 학습" })));
        on("pfCopy", () => copyText(profileText(doc), "프로파일 V" + doc.version + " 을 복사했어요"));
        on("pfPredict", () => UI.openPredictSheet(tid));
      } else if (kind === "prediction") {
        const busy = S.busy.has(tid);
        html = btn("rCopy", "청사진 복사") + btn("rPredict", "예측 갱신", { disabled: busy }) + btn("rMock", "적중 모의고사", { pri: true, disabled: busy });
        box.innerHTML = html;
        on("rCopy", () => copyText(doc.copyText || "", "청사진을 복사했어요 — 동형 모의고사 생성기의 '요청사항' 칸에 붙여넣으세요", { action: "생성기 열기", onAction: () => window.open("https://nathankim6.github.io/orunnathan/mock-exam.html", "_blank", "noopener") }));
        on("rPredict", () => UI.openPredictSheet(tid)); on("rMock", () => UI.openMockSheet(tid));
      } else if (kind === "mock") {
        html = btn("openPaper", "시험지 열기", { pri: true }) + btn("mockDocx", "워드로 저장") + '<span class="grow"></span>' + btn("mockDel", "삭제", { danger: true });
        box.innerHTML = html;
        on("openPaper", () => UI.openPaper(doc));
        on("mockDocx", async () => { const t = T(doc.teacherId) || { school: "", grade: "", subject: "" }; try { const blob = await GENERATE.docx(doc, t); APP.download(blob, (doc.title + " " + doc.target).replace(/[\\/:*?"<>|]/g, "") + ".docx"); UI.toast("워드 파일을 내려받았어요", { ok: true }); } catch (e) { UI.toast(e.message, { bad: true }); } });
        on("mockDel", () => deleteMock(doc));
      } else if (store === "notes") {
        const pending = NOTES.pending(doc.id);
        html = (sub === "ask" ? btn("nAskAgain", "다시 묻기", { pri: true }) : btn("nPin", doc.pinned ? "고정 해제" : "고정")) + '<span class="grow"></span>' + btn("nDel", pending ? "삭제 대기 중…" : "삭제", { danger: true, disabled: pending });
        box.innerHTML = html;
        on("nAskAgain", () => { const a = doc.ask || {}; if (a.question) VIEWS.submitAsk(a.question, a.ctx || ""); else ROUTE.go(ROUTE.href({ view: "ask" })); });
        on("nPin", () => NOTES.update(doc.id, { pinned: !doc.pinned }).then(() => { APP.emit("note", { id: doc.id, op: "update" }); UI.toast(doc.pinned ? "고정을 풀었어요" : "고정했어요", { ok: true }); }));
        on("nDel", () => deleteNote(doc));
      } else box.innerHTML = "";
    }
    async function copyText(text, msg, o) {
      try { await navigator.clipboard.writeText(text); } catch (e) { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (x) {} ta.remove(); }
      UI.toast(msg, Object.assign({ ok: true }, o || {}));
    }
    function profileText(p) {
      const P = p.profile || {}, n = p.narrative, t = T(p.teacherId);
      const L = ["프로파일 V" + p.version + (t ? " · " + t.name + " (" + APP.sub(t) + ")" : "") + " · " + TEXT.fmtDate(p.createdAt), "레벨 " + (P.level ? P.level.name + " Lv." + P.level.id : "—") + " · 신뢰도 " + pct(P.reliability) + " · 근거 시험 " + (p.basedOn || {}).nExams + " · 문항 " + (p.basedOn || {}).nQuestions];
      if (n) { L.push("", n.text); if ((n.keywords || []).length) L.push("키워드: " + n.keywords.join(", ")); if ((n.watchouts || []).length) L.push("주의점: " + n.watchouts.join(" / ")); }
      if (p.delta && p.delta.length) L.push("", "이번 판에서 달라진 점: " + p.delta.join(" / "));
      const td = P.typeDist || {}; L.push("", "유형 분포: " + Object.keys(td).map(k => k + " " + pct(td[k].wshare) + " (시험당 " + td[k].perExam + ")").join(", "));
      L.push("시험당 " + P.totalQuestionsAvg + "문항 · " + P.totalPointsAvg + "점 · 서술형 " + P.subjectiveAvg);
      if ((P.grammarPoints || []).length) L.push("어법: " + P.grammarPoints.slice(0, 6).map(g => g.point + " " + pct(g.wshare)).join(", "));
      if (P.handout) L.push("프린트 반영율 " + pct(P.handout.rate) + " (시험 " + P.handout.nExams + "개)");
      return L.join("\n");
    }
    async function deleteMock(m) {
      if (!confirm("이 모의고사를 지울까요? 붙어 있던 메모는 고아 메모로 남아요.")) return;
      try { await NOTES.orphan("mocks", [m.id]); } catch (e) { console.error(e); }
      await DB.del("mocks", m.id); await APP.refreshCounts(m.teacherId);
      APP.log(m.teacherId, "edit", "모의고사 삭제 · " + m.title, { mockId: m.id, id: m.id }); APP.emit("data", m.teacherId); APP.refreshLinks(m.teacherId);
      UI.toast("모의고사를 지웠어요"); ROUTE.go(ROUTE.all("mocks"), { replace: true });
    }
    // 자유 메모 · 질문 노트 삭제 — 5초 취소 토스트 뒤 하드 삭제
    function deleteNote(n) {
      const r = NOTES.remove(n.id); const title = NOTES.titleOf(n);
      memo.pendingDel = true; renderActions(); renderMemoMeta();
      UI.toast("“" + clip(title, 30) + "” 을 지웠어요 — 5초 안에 되돌릴 수 있어요", { action: "취소", ms: 5200, keep: true, onAction: () => { if (r.undo()) { memo.pendingDel = false; UI.toast("되돌렸어요", { ok: true }); if (cur && cur.id === n.id) render(n.id, cur.query); } } });
      r.done.then(ok => { if (!ok) { memo.pendingDel = false; return; } APP.emit("note", { id: n.id, op: "delete" }); APP.emit("growth", n.teacherId); if (cur && cur.id === n.id) { memo.key = ""; ROUTE.go(n.kind === "ask" ? "#/ask" : ROUTE.all("notes"), { replace: true }); } });
    }

    // ================= 내 메모 편집기 (§3.2) =================
    const ta = () => $("noteMemoText"), view = () => $("noteMemoView");
    function ownBody() { return cur.store === "notes" && cur.sub !== "ask"; }
    async function renderMemo() {
      const { store, doc } = cur;
      const own = ownBody();
      const key = own ? "own:" + doc.id : NOTES.anchorKey(store, doc.id);
      const box = $("noteMemo"); const head = box.querySelector("#noteMemoHead h4"); if (head) head.textContent = own ? (doc.kind === "daily" ? "오늘 로그" : doc.kind === "weekly" ? "주간 회고" : "본문") : "내 메모";
      $("noteMemoHint").textContent = (SYNC.st.private ? "이 메모는 이 브라우저에만 저장돼요 (설정 › 브레인 › 개인 모드)" : SYNC.st.enabled ? "작업공간 이름을 아는 사람은 이 메모를 볼 수 있어요" : "동기화가 꺼져 있어 이 브라우저에만 남아요") + " · [[ 로 잇고 # 로 태그 · ⌘⏎ 저장 · E 편집/미리보기";
      let body = "", links = [], docId = null, author = "", updatedAt = 0;
      if (own) { body = String(doc.body || ""); links = doc.links || []; docId = doc.id; author = doc.author || ""; updatedAt = doc.updatedAt || 0; }
      else { let m = null; try { m = await NOTES.memo(key); } catch (e) { console.error(e); } if (m) { body = String(m.body || ""); links = m.links || []; docId = m.id; author = m.author || ""; updatedAt = m.updatedAt || 0; } }
      const t = ta(); if (!t) return;
      if (memo.key !== key) {
        // 다른 노트로 넘어가기 전에 쓰다 만 메모를 먼저 저장한다. 해시만 바뀌는 이동(뒤로가기 · 스와이프 백 · ROUTE.go)은
        // 포커스를 옮기지 않아 blur 저장이 돌지 않으므로, 여기서 비우지 않으면 900ms 자동 저장 타이머와 함께 글이 사라진다.
        await flushMemo();
        clearTimeout(memo.timer);
        Object.assign(memo, { key, mode: own ? "own" : "anchor", noteId: own ? doc.id : null, teacherId: cur.teacherId, saved: body, links, docId, author, updatedAt, dirty: false, saving: false, again: false, composing: false, timer: 0, hints: [], pendingDel: store === "notes" && NOTES.pending(doc.id) });
        t.value = body;
        setMode(body.trim() ? "view" : "edit", true);          // 빈 메모는 곧장 쓸 수 있게 — 미리보기할 것이 없다
      } else {
        // 같은 노트 — 입력 중이면 건드리지 않는다. 밖에서 바뀐 것(클라우드 · 다른 탭)만 받는다.
        Object.assign(memo, { links, docId, author, updatedAt: updatedAt || memo.updatedAt, teacherId: cur.teacherId });
        if (!memo.dirty && !memo.saving && document.activeElement !== t && body !== memo.saved) { memo.saved = body; t.value = body; }
      }
      renderMemoView(); renderMemoMeta();
      if (store !== "notes") renderTags(NOTES.parse(memo.dirty ? t.value : memo.saved).tags);
    }
    function resolveLink(text) { const c = (memo.links || []).find(l => l.text === text); try { return LINKS.resolve(text, memo.teacherId, c && c.to); } catch (e) { return null; } }
    function renderMemoView() {
      const v = view(); if (!v) return;
      const body = memo.dirty ? ta().value : memo.saved;
      v.innerHTML = body.trim() ? NOTES.render(body, resolveLink) : "";
      v.classList.toggle("pending", !!memo.pendingDel);
    }
    function renderMemoMeta() {
      const el = $("noteMemoMeta"); if (!el) return;
      if (memo.pendingDel) { el.innerHTML = '<span class="bad">삭제 대기 중 — 토스트의 [취소] 로 되돌릴 수 있어요</span>'; return; }
      const parts = [];
      if (memo.saved.trim() || memo.docId) { parts.push(esc(memo.author || "이 기기")); if (memo.updatedAt) parts.push(ago(memo.updatedAt)); parts.push(esc(syncText())); }
      if (memo.saving) parts.push('<span class="busy">저장 중…</span>'); else if (memo.dirty) parts.push('<span class="faint">입력 중 — 멈추면 저장돼요</span>');
      el.innerHTML = parts.join(" · ");
      const t = ta(); if (t) t.disabled = !!memo.pendingDel;
    }
    function setMode(mode, silent) {
      const t = ta(), v = view(), tg = $("noteMemoToggle"); if (!t || !v) return;
      memo.editing = mode === "edit";
      t.hidden = !memo.editing; v.hidden = memo.editing;
      if (tg) tg.textContent = memo.editing ? "미리보기" : "편집";
      if (memo.editing && !silent) { t.focus(); const n = t.value.length; try { t.setSelectionRange(n, n); } catch (e) {} }
      if (!memo.editing) renderMemoView();
    }
    function toggleMode() { if (memo.editing && memo.dirty) saveMemo(); setMode(memo.editing ? "view" : "edit"); }
    function scheduleSave() { clearTimeout(memo.timer); memo.timer = setTimeout(() => { if (memo.dirty && !memo.composing) saveMemo(); }, 900); }
    // flushMemo() — 쓰다 만 메모를 지금 저장한다. 노트를 떠나기 전 · 페이지를 닫기 전에 부른다.
    // 한글은 마지막 음절이 조합 상태로 남는 것이 정상이라 composing 도 저장 대상으로 본다.
    async function flushMemo() {
      const t = ta(); if (!t || !memo.key || memo.pendingDel) return false;
      if (!memo.dirty && t.value === memo.saved) return false;
      clearTimeout(memo.timer); memo.composing = false; memo.dirty = true;
      try { await saveMemo(); } catch (e) { console.error(e); }
      return true;
    }
    async function saveMemo() {
      const t = ta(); if (!t || !memo.key || memo.pendingDel) return;
      if (memo.saving) { memo.again = true; return; }
      const body = t.value;
      if (body === memo.saved) { memo.dirty = false; renderMemoMeta(); return; }
      memo.saving = true; renderMemoMeta();
      const key = memo.key; let created = false;
      try {
        if (memo.mode === "own") { const d = await NOTES.update(memo.noteId, { body, linkHints: memo.hints }); memo.links = d.links || []; memo.updatedAt = d.updatedAt; memo.author = d.author || memo.author; }
        else { const had = !!memo.docId; const d = await NOTES.saveMemo({ anchorKey: key, teacherId: memo.teacherId, body, linkHints: memo.hints }); memo.docId = d ? d.id : null; memo.links = d ? d.links || [] : []; memo.updatedAt = d ? d.updatedAt : Date.now(); memo.author = d ? d.author || "" : memo.author; created = !had && !!d; }
        if (memo.key !== key) return;                       // 저장 중에 다른 노트로 갔다
        memo.saved = body; memo.dirty = t.value !== body;
        APP.emit("note", { id: memo.docId || memo.noteId, op: created ? "create" : "save", anchorKey: memo.mode === "own" ? "" : key });
        if (created) APP.emit("growth", memo.teacherId);
      } catch (e) { console.error(e); UI.toast("메모를 저장하지 못했어요: " + (e && e.message || e), { bad: true }); }
      memo.saving = false;
      if (memo.again) { memo.again = false; if (t.value !== memo.saved) { saveMemo(); return; } }
      renderMemoView(); renderMemoMeta();
      if (cur && cur.store !== "notes") renderTags(NOTES.parse(memo.saved).tags);
    }
    function brokenLinkToast(text) {
      const tid = memo.teacherId;
      UI.toast("‘" + clip(text, 30) + "’ 노트가 없어요", { action: "이 제목으로 새 메모 만들기", onAction: () => NOTES.create({ kind: "note", title: text, body: "", teacherId: tid }).then(d => { APP.emit("note", { id: d.id, op: "create" }); ROUTE.go(noteHref(d.id)); }).catch(e => UI.toast(e.message, { bad: true })) });
    }
    function addTag() {
      if (!cur) return;
      const t = ta(); if (!t || memo.pendingDel) return;
      setMode("edit");
      const v = t.value.replace(/[ \t]+$/, ""); t.value = v + (v && !/\n$/.test(v) ? " " : "") + "#";
      const n = t.value.length; try { t.setSelectionRange(n, n); } catch (e) {} t.focus();
      memo.dirty = true; t.dispatchEvent(new Event("input", { bubbles: true }));
    }
    // ---- 한 번만 묶는 것들 ----
    function bind() {
      if (bound) return; bound = true;
      const t = ta(), v = view();
      $("noteBackBtn").onclick = () => ROUTE.back();
      $("noteMenu").onclick = (e) => { e.stopPropagation(); openNoteMenu(e.currentTarget); };
      $("noteTagAdd").onclick = addTag;
      $("noteMemoToggle").onclick = toggleMode;
      $("noteMemoSave").onclick = () => { memo.dirty = true; saveMemo(); };
      t.addEventListener("compositionstart", () => { memo.composing = true; });
      t.addEventListener("compositionend", () => { memo.composing = false; memo.dirty = t.value !== memo.saved; renderMemoMeta(); scheduleSave(); });
      t.addEventListener("input", () => { memo.dirty = t.value !== memo.saved; renderMemoMeta(); if (!memo.composing) scheduleSave(); });
      t.addEventListener("keydown", (e) => { if (e.isComposing || e.keyCode === 229) return; if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); e.stopPropagation(); clearTimeout(memo.timer); memo.dirty = true; saveMemo().then(() => setMode("view")); } });
      t.addEventListener("blur", () => { if (memo.dirty) { clearTimeout(memo.timer); saveMemo(); } });
      // 고른 항목의 id 를 기억해 둔다 — 같은 제목이 둘일 때(범위 지문 · 프린트 지문) 사용자가 고른 그 문서에 링크가 걸리도록
      memo.ac = UI.autocomplete(t, { teacherId: () => memo.teacherId || S.selectedId, onPick: (it) => { if (it && it.kind === "link" && it.id && it.title) memo.hints = (memo.hints || []).filter(x => x.text !== it.title).concat([{ text: it.title, to: it.id }]); } });
      v.addEventListener("click", (e) => {
        const tag = e.target.closest(".tag[data-tag]"); if (tag) { e.preventDefault(); ROUTE.go(ROUTE.tag(tag.dataset.tag)); return; }
        const br = e.target.closest("a.broken[data-text]"); if (br) { e.preventDefault(); brokenLinkToast(br.dataset.text); return; }
        if (e.target.closest("a[href]")) return;
        if (!memo.pendingDel) setMode("edit");
      });
      // 본문 안 이동: 대부분 <a href> 라 스스로 가지만, 표의 행(tr.rowbtn[data-q]) 처럼 링크가 아닌 것은 여기서 보낸다
      $("noteBody").addEventListener("click", (e) => {
        const fa = e.target.closest("a[data-followask]");
        if (fa) { e.preventDefault(); VIEWS.submitAsk(fa.dataset.followask, fa.dataset.followctx || ""); return; }   // "더 물어보기" 는 실제로 묻는다
        if (e.target.closest("a[href], button, input, select, textarea, summary, label")) return;
        const r = e.target.closest("[data-q],[data-exam],[data-pass],[data-src],[data-mock]"); if (!r) return;
        const id = r.dataset.q || r.dataset.exam || r.dataset.pass || r.dataset.src || r.dataset.mock; if (!id) return;
        e.preventDefault(); ROUTE.go(noteHref(id));
      });
      // 파생 태그 칩 → 그 태그가 붙은 목록. 태그마다 갈 곳이 다르다 — 종류를 보지 않으면 늘 0건이 나온다.
      $("noteTags").addEventListener("click", (e) => {
        const d = e.target.closest(".chip.derived[data-tag]"); if (!d || !cur) return;
        e.preventDefault();
        const tag = d.dataset.tag, k = cur.kind;
        let kind = "questions", q = null;
        if (tag === "프린트적중") q = { hit: 1 };
        else if (tag === "외부지문") q = { ext: 1 };
        else if (tag === "프린트") { if (k === "passage") { kind = "passages"; q = { hit: 1 }; } else { kind = "sources"; q = { kind: "프린트" }; } }   // 지문은 프린트에서 나온 지문, 자료는 프린트 자료 목록
        else if (/^난이도/.test(tag)) q = { diff: tag.slice(3) };
        else q = k === "passage" ? { genre: tag } : { type: tag };
        ROUTE.go(ROUTE.all(kind, q));
      });
    }
    function openNoteMenu(anchor) {
      if (!cur) return; const { doc, kind, store, sub } = cur;
      const items = [
        { label: "브레인에서 보기", act: () => ROUTE.go(ROUTE.href({ view: "brain", query: { focus: cur.id } })) },
        { label: "이 노트에 대해 묻기", act: () => ROUTE.go(ROUTE.href({ view: "ask", query: { ctx: cur.id } })) },
        { label: "오른쪽 패널에 미리보기", act: () => UI.peek(cur.id) },
        { label: "태그 달기 ⊕", act: addTag },
        { label: "주소 복사", act: () => copyText(location.href.split("#")[0] + noteHref(cur.id), "노트 주소를 복사했어요") },
      ];
      if (kind === "exam") items.push({ label: "이 시험지 삭제", danger: true, act: () => { const b = $("dDelExam"); if (b) b.click(); } });
      if (store === "sources") items.push({ label: "이 자료 삭제", danger: true, act: () => { const b = $("dDelSrc"); if (b) b.click(); } });
      if (kind === "mock") items.push({ label: "이 모의고사 삭제", danger: true, act: () => deleteMock(doc) });
      if (store === "notes") items.push({ label: "이 메모 삭제", danger: true, disabled: NOTES.pending(doc.id), act: () => deleteNote(doc) });
      UI.openMenu(anchor, items);
    }
    // bindMemo(anchorKey, teacherId) — 공개 API: 열린 노트와 무관하게 편집기를 그 anchorKey 에 붙인다(다른 뷰가 쓸 수 있게)
    async function bindMemo(anchorKey, teacherId) {
      bind();
      const t = ta(); if (!t) return null;
      if (memo.key !== anchorKey) await flushMemo();                                // 쓰다 만 메모를 먼저 저장한다
      let m = null; try { m = await NOTES.memo(anchorKey); } catch (e) {}
      clearTimeout(memo.timer);
      Object.assign(memo, { key: anchorKey, mode: "anchor", noteId: null, teacherId: teacherId || null, saved: m ? String(m.body || "") : "", links: m ? m.links || [] : [], docId: m ? m.id : null, author: m ? m.author || "" : "", updatedAt: m ? m.updatedAt || 0 : 0, dirty: false, saving: false, again: false, composing: false, pendingDel: false });
      t.value = memo.saved; setMode(memo.saved.trim() ? "view" : "edit", true); renderMemoView(); renderMemoMeta();
      return m;
    }

    // ================= 오른쪽 패널 (§2.6) =================
    async function renderAside(id) {
      const store = NOTES.storeOf(id); if (!store) return;
      let doc = cur && cur.id === id ? cur.doc : null;
      if (!doc) { try { doc = await DB.get(store, id); } catch (e) {} }
      if (!doc) return;
      const d = INDEX.get(id); const k = store === "sources" ? (doc.kind === "프린트" ? "handout" : "source") : (store === "notes" ? (doc.kind === "ask" ? "ask" : "note") : NOTES.kindOf(id));
      let m = null; if (store !== "notes") { try { m = await NOTES.memo(NOTES.anchorKey(store, id)); } catch (e) {} }
      const author = store === "notes" ? doc.author : (m ? m.author : "");
      const kv = [["종류", esc(KL[k] || k)], ["만든 날", TEXT.fmtDate(doc.createdAt)], ["마지막 수정", ago(doc.updatedAt || doc.analyzedAt || doc.createdAt)], ["서명", esc(author || (m || store === "notes" ? "이 기기" : "—"))], ["동기화", esc(syncText())]];
      if (m && m.updatedAt) kv.push(["메모", ago(m.updatedAt)]);
      const box = $("asideProps"); box.innerHTML = '<h4>This note</h4><div class="kv">' + kv.map(x => '<b>' + x[0] + '</b><span>' + x[1] + '</span>').join("") + '</div>';
      let back = []; try { back = LINKS.backlinks(id); } catch (e) {}
      const brows = backRows(id, back);
      $("asideBacklinks").innerHTML = '<h4>백링크 <span class="num">' + brows.length + '</span></h4>' + (brows.length ? brows.slice(0, 12).map(e => row(e.id, e.kind, e.title, e.why)).join("") + (brows.length > 12 ? '<div class="small">… ' + (brows.length - 12) + '개 더 — 본문 아래 백링크에서</div>' : "") : '<div class="small">아직 없어요</div>');
      const rel = related(id);
      $("asideRelated").innerHTML = '<h4>관련 <span class="num">' + rel.length + '</span></h4>' + (rel.length ? rel.map(r => row(r.id, nodeKind(r.id), nodeTitle(r.id), r.why)).join("") : '<div class="small">이웃이 없어요</div>');
      drawMiniGraph(id);
    }
    // 관련 = 2홉 이웃(같은 지문 · 같은 시험 · 같은 프린트) ∪ 같은 태그, 최대 6
    function related(id) {
      let one, two; try { one = LINKS.neighbors(id, 1); two = LINKS.neighbors(id, 2); } catch (e) { return []; }
      const direct = new Set(one.nodes); direct.add(id);
      const via = new Map();   // 2홉 노드 → 거쳐 온 1홉 노드
      two.edges.forEach(([a, b]) => { if (direct.has(a) && !direct.has(b)) { if (!via.has(b)) via.set(b, a); } else if (direct.has(b) && !direct.has(a)) { if (!via.has(a)) via.set(a, b); } });
      const out = [], seen = new Set();
      const push = (x, why) => { if (!x || seen.has(x) || direct.has(x) || !(INDEX.get(x) || LINKS.node(x))) return; seen.add(x); out.push({ id: x, why }); };
      const d = INDEX.get(id);
      (d && d.userTags || []).forEach(t => { let ids = []; try { ids = NOTES.tags.docsWith(t, "*"); } catch (e) {} ids.forEach(x => push(x, "#" + t)); });
      const rank = (x) => { const k = nodeKind(via.get(x)); return k === "passage" ? 0 : k === "handout" ? 1 : k === "exam" ? 2 : 3; };
      [...via.keys()].sort((a, b) => rank(a) - rank(b)).forEach(x => { const k = nodeKind(via.get(x)); push(x, k === "passage" ? "같은 지문" : k === "exam" ? "같은 시험" : k === "handout" ? "같은 프린트" : k === "prediction" ? "같은 예측" : "이웃"); });
      return out.slice(0, 6);
    }
    // 미니 그래프 — 이 노트 중심 1홉을 canvas 에 직접 그린다 (노드 ≤ 30, 클릭 → 이동)
    let miniNodes = [], miniBound = false;
    function drawMiniGraph(id) {
      const cv = $("asideGraphCanvas"); if (!cv) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1); const W = cv.clientWidth || 288, H = cv.clientHeight || 160;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const ctx = cv.getContext("2d"); if (!ctx) return; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      let nb; try { nb = LINKS.neighbors(id, 1); } catch (e) { nb = { nodes: [id], edges: [] }; }
      const others = nb.nodes.filter(x => x !== id).slice(0, 29);
      const colorOf = (x) => { const n = LINKS.node(x) || INDEX.get(x); const t = n && T(n.teacherId); return t ? t.color : "#5fc8ff"; };
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 26;      // 아래 이름표(+14px)가 테두리에 닿지 않게 여유를 둔다
      miniNodes = [{ id, x: cx, y: cy, r: 7, self: true }];
      others.forEach((x, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / others.length; const rr = others.length > 12 && i % 2 ? R * 0.62 : R; miniNodes.push({ id: x, x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, r: 4, kind: nodeKind(x) }); });
      ctx.lineWidth = 1; ctx.strokeStyle = "rgba(148,178,220,.35)";
      miniNodes.slice(1).forEach(n => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(n.x, n.y); ctx.stroke(); });
      miniNodes.forEach(n => { ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fillStyle = n.self ? "#5fc8ff" : (n.kind === "handout" || (INDEX.get(n.id) || {}).hit ? "#f5c518" : colorOf(n.id)); ctx.globalAlpha = n.self ? 1 : 0.85; ctx.fill(); ctx.globalAlpha = 1; if (n.self) { ctx.strokeStyle = "rgba(95,200,255,.5)"; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2); ctx.stroke(); } });
      // 이름표 — 9자로 자르면 "Lesson 2 · Reading 1" 이 전부 "Lesson 2…" 가 되어 서로 구별되지 않는다.
      // 두 줄로 나누고, 캔버스 안에 들어가도록 maxWidth 로 그린다.
      if (others.length <= 12) {
        ctx.fillStyle = "rgba(169,184,204,.95)"; ctx.font = "9px 'Noto Sans KR', sans-serif"; ctx.textAlign = "center";
        const cell = Math.max(64, Math.min(120, W / Math.max(2, Math.min(4, others.length))));
        miniNodes.slice(1).forEach(n => {
          const full = String(nodeTitle(n.id) || "");
          const lines = []; let rest = full;
          for (let li = 0; li < 2 && rest; li++) {
            let cut = rest.length;
            while (cut > 1 && ctx.measureText(rest.slice(0, cut)).width > cell) cut--;
            if (li === 1 && cut < rest.length) { lines.push(rest.slice(0, Math.max(1, cut - 1)) + "…"); rest = ""; }
            else { lines.push(rest.slice(0, cut)); rest = rest.slice(cut); }
          }
          const x = Math.max(cell / 2 + 2, Math.min(W - cell / 2 - 2, n.x));
          lines.forEach((ln, li) => ctx.fillText(ln, x, n.y + 14 + li * 10, cell));
        });
      }
      if (!others.length) { ctx.fillStyle = "rgba(111,129,153,.9)"; ctx.font = "11px 'Noto Sans KR', sans-serif"; ctx.textAlign = "center"; ctx.fillText("이어진 노트가 없어요", cx, cy + 26); }
      if (!miniBound) { miniBound = true; cv.style.cursor = "pointer"; cv.addEventListener("click", (e) => { const r = cv.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top; let best = null, bd = 12; miniNodes.forEach(n => { const d = Math.hypot(n.x - x, n.y - y); if (d < bd) { bd = d; best = n; } }); if (best && !best.self) ROUTE.go(noteHref(best.id)); else if (best && best.self) ROUTE.go(ROUTE.href({ view: "brain", query: { focus: best.id } })); }); cv.addEventListener("mousemove", (e) => { const r = cv.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top; const hit = miniNodes.find(n => Math.hypot(n.x - x, n.y - y) < 12); cv.title = hit ? nodeTitle(hit.id) : ""; }); }
    }

    // ================= 미리보기 (⌘클릭 → #asidePeek) =================
    async function peek(id) {
      const box = $("asidePeekBody"); if (!box) return;
      const store = NOTES.storeOf(id); let doc = null; try { doc = store ? await DB.get(store, id) : null; } catch (e) {}
      if (!doc) { box.innerHTML = '<div class="small">그 노트는 없어요</div>'; return; }
      const d = INDEX.get(id); const k = store === "sources" ? (doc.kind === "프린트" ? "handout" : "source") : (store === "notes" ? (doc.kind === "ask" ? "ask" : "note") : NOTES.kindOf(id));
      let html = '<div class="row" style="margin-bottom:6px">' + kindTag(k) + '<span class="small">' + esc(d ? d.sub : INDEX.subOf(store, doc, APP.indexCtx)) + '</span></div>';
      switch (store) {
        case "questions": html += '<div class="narr" style="font-size:13px">' + esc(doc.stem || "") + '</div>' + ((doc.options || []).some(o => o.text) ? '<div class="small" style="margin-top:4px">' + doc.options.map(o => esc(o.label + " " + o.text)).join("<br>") + '</div>' : "") + (doc.answer ? '<div class="small">정답 ' + esc(doc.answer) + '</div>' : ""); break;
        case "passages": html += '<div class="small">' + esc(doc.gist || "") + '</div><div class="narr" style="font-size:12.5px;margin-top:4px">' + esc(clip(doc.text || doc.first || "", 260)) + '</div>'; break;
        case "exams": html += '<div class="small">' + esc((doc.analysis || {}).summary || "") + '</div>'; break;
        case "sources": html += '<div class="small">' + esc(doc.kind || "") + ' · 지문 ' + (doc.passages || 0) + (doc.items ? ' · 포인트 ' + doc.items.length : "") + (doc.reflection ? ' · 반영율 ' + pct(doc.reflection.rate) : "") + '</div>' + (doc.memo ? '<div class="memo">✎ ' + esc(doc.memo) + '</div>' : ""); break;
        case "profiles": html += '<div class="small">' + esc(clip(doc.narrative ? doc.narrative.text : (doc.delta || []).join(" / "), 300)) + '</div>'; break;
        case "predictions": html += '<div class="small">' + ((doc.blueprint || {}).passages || []).slice(0, 3).map(s => pct(s.pUse) + " " + esc(s.src || "")).join(" · ") + '</div>'; break;
        case "mocks": html += '<div class="small">' + esc(doc.target || "") + ' · ' + ((doc.stats || {}).total || 0) + '문항 · ' + ((doc.stats || {}).points || 0) + '점</div>'; break;
        case "teachers": html += '<div class="small">' + esc(APP.sub(doc)) + '</div>'; break;
        case "notes": html += '<div class="note-body" style="font-size:13px">' + (doc.kind === "ask" && doc.ask ? '<b>' + esc(doc.ask.question) + '</b><br>' : "") + NOTES.render(clip(doc.body || "", 600), (t) => { try { return LINKS.resolve(t, doc.teacherId); } catch (e) { return null; } }) + '</div>'; break;
      }
      if (store !== "notes") { let m = null; try { m = await NOTES.memo(NOTES.anchorKey(store, id)); } catch (e) {} if (m && m.body) html += '<div class="small" style="margin-top:6px"><b>내 메모</b> ' + esc(NOTES.excerpt(m.body, 160)) + '</div>'; }
      box.innerHTML = html;
    }

    return { render, renderAside, peek, bindMemo, blocks, propsOf, propsEditors, drawRangeMap, saveMemo, flushMemo, setMode, current: () => cur, memoState: () => memo, KL };
  })();
