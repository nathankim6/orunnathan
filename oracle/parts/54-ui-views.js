  // ==================================================================
  //  VIEWS — 오늘(#vToday) · 인박스(#vInbox) · 서재(#vLibrary) · 태그(#vTag) · 타임라인(#vTimeline) · 물어보기(#vAsk) · 검색(#vSearch)
  //  spec §2.9~2.14 · §5.13. 노트는 NOTEUI, 브레인은 BRAINUI, 셸(토스트 · 시트 · 팔레트 · 키보드 · 드롭 · nav)은 UI 가 맡는다.
  //  20-dom.html 의 껍데기 id 를 그대로 쓰고 그 안만 채운다. 정적 요소(입력 · 버튼)는 한 번만 바인딩하고(bound 플래그),
  //  innerHTML 로 새로 그린 부분만 매번 다시 바인딩한다. 모든 삽입은 TEXT.esc 를 거친다.
  //  APP.on(...) 구독은 52-app-shell 이 하고 여기의 함수를 부른다(§5.15) — 여기서는 구독하지 않는다.
  // ==================================================================
  const VIEWS = (function () {
    const $ = (id) => document.getElementById(id), esc = TEXT.esc, S = APP.state;
    const h = (html) => { const t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; };
    const DAY = 864e5;
    const T = (id) => APP.teacher(id);
    const sel = () => (S.selectedId && S.selectedId !== APP.ALL) ? T(S.selectedId) || null : null;   // 고른 선생님 ("*" 이면 null)
    const scopeId = () => S.selectedId || null;                                                      // 범위 ("*" 포함)
    const oneId = () => { const t = sel(); return t ? t.id : null; };
    const pct = (v) => (v === null || v === undefined || v === "") ? "—" : Math.round((+v || 0) * 100) + "%";
    const ACTIVE = (j) => !["done", "error", "cancelled"].includes(j.stage);
    const RUNNING = (j) => !["done", "error", "cancelled", "queued"].includes(j.stage);
    const KL = UI.KIND_LABEL, LIB_LABEL = UI.LIB_LABEL;
    const LIB_KINDS = ROUTE.LIB_KINDS;
    const clip = (s, n) => { s = String(s == null ? "" : s).replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
    const md = (t) => { const d = new Date(t); return String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
    const hm = (t) => { const d = new Date(t); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
    const WD = ["일", "월", "화", "수", "목", "금", "토"];
    const ago = (ms) => { if (!ms) return "—"; const d = Date.now() - ms; return d < 60e3 ? "방금" : d < 3600e3 ? Math.round(d / 60e3) + "분 전" : d < 864e5 ? Math.round(d / 3600e3) + "시간 전" : TEXT.fmtDate(ms); };
    const kindTag = (k) => '<span class="mono-kind" data-kind="' + esc(k || "note") + '" title="' + esc(KL[k] || k || "") + '"></span>';
    const isNew = (at) => !!at && (Date.now() - at) < DAY;
    // 노트 카드 한 줄 (.ncard[data-id]) — 모노그램 + 제목 + 시각 + 부제
    const ncard = (id, kind, title, sub, at, extra) => '<a class="ncard' + (isNew(at) ? " new" : "") + (extra ? " " + extra : "") + '" href="' + esc(ROUTE.note(id)) + '" data-id="' + esc(id) + '">' + kindTag(kind) + '<span class="t">' + esc(title) + '</span><span class="small">' + esc(at ? ago(at) : "") + '</span>' + (sub ? '<span class="s">' + esc(sub) + '</span>' : "") + '</a>';
    const noteKindOf = (n) => n.kind === "ask" ? "ask" : "note";
    // 선생님 범위의 저장소 전체 (["*"] 이면 모든 선생님)
    async function loadScoped(store) {
      const ids = (S.selectedId && S.selectedId !== APP.ALL) ? (S.teachers.has(S.selectedId) ? [S.selectedId] : []) : [...S.teachers.keys()];
      let out = [];
      for (const id of ids) { try { out = out.concat(await DB.where(store, "teacherId", id)); } catch (e) { console.error(e); } }
      return out;
    }
    // 이 문서에 붙은 내 메모 · 이 문서를 가리키는 메모 수 (파생 링크 · 사용자 링크에서 센다 — 저장하지 않는 값)
    function memoCount(id) { try { return LINKS.backlinks(id).filter(b => String(b.from).indexOf("n_") === 0 && b.kind !== "cite").length; } catch (e) { return 0; } }
    function tagsOf(id) { const d = INDEX.get(id); return d ? (d.userTags || []).concat(d.derivedTags || []) : []; }
    const tagChips = (names, n) => (names || []).slice(0, n || 4).map(x => '<a class="chip tag" href="' + esc(ROUTE.tag(x)) + '" data-tag="' + esc(x) + '">' + esc(x) + '</a>').join(" ");

    // ================= 오늘 (§2.9) =================
    let seqToday = 0, boundToday = false;
    async function todayView() {
      const seq = ++seqToday;
      const t = sel(), all = APP.isAll();
      $("homeHead").innerHTML = '<div class="kicker">TODAY</div><h2 class="view-title">' + esc(TEXT.fmtDate()) + ' · ' + esc(t ? t.name + " " + (t.subject || "") : all ? "모든 선생님" : S.teachers.size ? "선생님을 골라 주세요" : "선생님을 만들어 주세요") + '</h2>';
      renderHomeNext(t, all); renderHomeLevel(t, all); renderHomeQueue();
      bindToday();
      let g = null;
      try { g = await APP.growth(S.selectedId); } catch (e) { console.error(e); }
      if (seq !== seqToday) return;
      renderHomeStats(g);
      let todos = [];
      try { todos = await APP.nextUp(S.selectedId); } catch (e) { console.error(e); }
      if (seq !== seqToday) return;
      renderNextUp(todos);
      let rec = [];
      try { rec = await recentCaptures(); } catch (e) { console.error(e); }
      if (seq !== seqToday) return;
      $("homeRecent").innerHTML = rec.length ? '<div class="kicker" style="margin:16px 0 8px">최근 캡처</div><div class="cards">' + rec.map(r => ncard(r.id, r.kind, r.title, r.sub, r.at)).join("") + '</div>' : "";
    }
    function renderHomeNext(t, all) {
      const box = $("homeNext"); box.hidden = !t || all;
      if (box.hidden) return;
      const pr = S.predictions.get(t.id), p = S.profiles.get(t.id);
      if (!pr) { box.innerHTML = '<div class="kicker">다음 시험</div><div class="small" style="margin-top:8px">' + (p ? "예측이 아직 없어요 — 다음 시험을 예측할 수 있어요" : "학습 뒤 예측할 수 있어요") + '</div><div class="row" style="margin-top:10px"><button type="button" class="pri" data-home="predict"' + (p ? "" : ' disabled title="먼저 학습해 주세요"') + '>예측</button></div>'; bindHomeCards(); return; }
      const bp = pr.blueprint || {}, tg = pr.target || {};
      let dday = "";
      if (tg.date) { const n = Math.ceil((new Date(tg.date + "T00:00:00").getTime() - Date.now()) / DAY); dday = ' <span class="badge ' + (n >= 0 ? "warn" : "") + '">' + (n >= 0 ? "D-" + n : "D+" + (-n)) + '</span>'; }
      const stale = p && pr.profileVersion < p.version;
      box.innerHTML = '<div class="kicker">다음 시험</div><div style="font-size:15px;margin:8px 0 4px">' + esc(tg.label || "다음 시험") + dday + '</div>'
        + '<div class="small">예측 ' + (stale ? '<span class="warn">V' + pr.profileVersion + ' 기준 — 다시 예측하세요</span>' : "있음") + ' · 신뢰도 <b class="num">' + pct(bp.confidence && bp.confidence.overall) + '</b>' + ((bp.passages || []).length ? ' · 유력 지문 ' + bp.passages.length : "") + '</div>'
        + '<div class="row" style="margin-top:10px"><button type="button" data-home="blueprint">청사진</button><button type="button" class="pri" data-home="mock">모의고사</button></div>';
      bindHomeCards();
    }
    function renderHomeLevel(t, all) {
      const box = $("homeLevel"); box.hidden = !t || all;
      if (box.hidden) return;
      const p = S.profiles.get(t.id), c = S.counts.get(t.id) || {};
      if (!p) { box.innerHTML = '<div class="kicker">프로파일</div><div class="small" style="margin-top:8px">' + (c.questions ? "문항 " + c.questions + "개 — 학습할 수 있어요" : "문항이 1개 이상이면 학습할 수 있어요") + '</div><div class="row" style="margin-top:10px"><button type="button" class="pri" data-home="learn"' + (c.questions ? "" : ' disabled title="기출 시험지를 먼저 넣어 주세요"') + '>학습</button></div>'; bindHomeCards(); return; }
      const P = p.profile || {}, lv = P.level || {};
      box.innerHTML = '<div class="kicker">프로파일</div><div style="font-size:15px;margin:8px 0 4px"><span class="num">V' + p.version + '</span> · ' + esc(lv.name || "") + (lv.id ? ' <span class="small">Lv.' + lv.id + '</span>' : "") + ' · 신뢰도 <span class="num">' + (P.reliability === undefined ? "—" : pct(P.reliability)) + '</span></div>'
        + '<div class="small">' + (lv.next ? "다음 " + esc(lv.next.name) + "까지 " + esc(lv.next.need || "") : "최고 단계예요") + '</div>'
        + '<div class="row" style="margin-top:10px"><button type="button" data-home="profile">프로파일 보기</button></div>';
      bindHomeCards();
    }
    function bindHomeCards() {
      document.querySelectorAll("#homeNext [data-home], #homeLevel [data-home]").forEach(b => b.onclick = () => {
        const t = sel(); if (!t) { UI.toast("선생님을 골라 주세요"); return; }
        const k = b.dataset.home, p = S.profiles.get(t.id), pr = S.predictions.get(t.id);
        if (k === "predict") UI.openPredictSheet(t.id);
        else if (k === "mock") UI.openMockSheet(t.id);
        else if (k === "blueprint") { if (pr) ROUTE.go(ROUTE.note(pr.id)); }
        else if (k === "learn") UI.run(() => APP.learn(t.id, { force: true }));
        else if (k === "profile") { if (p) ROUTE.go(ROUTE.note(p.id)); }
      });
    }
    function renderHomeStats(g) {
      const set = (k, v) => { const el = document.querySelector('#homeStats [data-stat="' + k + '"] b'); if (el) el.textContent = v; };
      set("questions", g ? String(g.questions) : "0");
      set("passages", g ? String(g.passages) : "0");
      set("reflection", g && g.handoutRate !== null && g.handoutRate !== undefined ? pct(g.handoutRate) : "—");
      set("profile", "V" + (g ? g.profileVersion : 0));
      set("notes", g ? String(g.notes) : "0");
      const box = $("homeGrowth"), cv = $("homeGrowthCanvas");
      let msg = box.querySelector(".small");
      if (g && !g.empty) { if (msg) msg.remove(); cv.hidden = false; UI.spark(cv, g.spark); }
      else { cv.hidden = true; if (!msg) { msg = h('<div class="small">첫 파일을 넣으면 여기서 자라기 시작해요</div>'); box.appendChild(msg); } }
    }
    function renderNextUp(todos) {
      const box = $("nextUp");
      if (!todos || !todos.length) { box.innerHTML = ""; return; }
      box.innerHTML = '<div class="kicker" style="margin:16px 0 8px">다음에 할 일</div>' + todos.slice(0, 6).map(it => '<div class="todo" data-act="' + esc(it.act) + '" data-arg="' + esc(it.arg == null ? "" : it.arg) + '" data-tid="' + esc(it.teacherId || "") + '"><span>' + esc(it.text) + '</span><button type="button" class="pri">' + esc(it.label || "열기") + '</button></div>').join("");
      box.querySelectorAll(".todo").forEach(el => { const b = el.querySelector("button"); if (b) b.onclick = () => runTodo(el.dataset.act, el.dataset.arg, el.dataset.tid); });
    }
    function runTodo(act, arg, tid) {
      const t = tid && T(tid) ? T(tid) : sel();
      switch (act) {
        case "settings": UI.openSettings(arg || "engine"); break;
        case "new": UI.openTeacherSheet(null); break;
        case "inbox": ROUTE.go("#/inbox"); break;
        case "files": UI.pickFiles(); break;
        case "learn": if (t) UI.run(() => APP.learn(t.id, { force: true })); break;
        case "predict": if (t) UI.openPredictSheet(t.id); break;
        case "mock": if (t) UI.openMockSheet(t.id); break;
        case "library": ROUTE.go("#/all/" + (arg || "exams")); break;
        case "note": if (arg) ROUTE.go(ROUTE.note(arg)); break;
        default: ROUTE.go("#/inbox");
      }
    }
    function renderHomeQueue() {
      const box = $("homeQueue"), jobs = S.queue.filter(ACTIVE);
      if (!jobs.length) { box.innerHTML = ""; return; }
      box.innerHTML = '<div class="row" style="margin:0 0 8px"><span class="kicker">정리 중 ' + jobs.length + '</span><span class="grow"></span><button type="button" class="ghost" data-home-q="inbox">인박스 열기 →</button></div>'
        + jobs.slice(0, 3).map(j => '<div class="q"><span class="n">' + esc(j.name) + '</span><button type="button" class="x ghost" data-home-cancel="' + esc(j.id) + '" title="취소">✕</button><div class="d">' + esc(j.detail || "") + '</div>' + (RUNNING(j) ? '<div class="bar prog"><i style="width:' + Math.round((j.progress || 0) * 100) + '%"></i></div>' : "") + '</div>').join("");
      box.querySelectorAll("[data-home-q]").forEach(b => b.onclick = () => ROUTE.go("#/inbox"));
      box.querySelectorAll("[data-home-cancel]").forEach(b => b.onclick = () => { const j = S.queue.find(x => x.id === b.dataset.homeCancel); if (j) APP.cancelJob(j); });
    }
    async function recentCaptures() {
      const [exams, sources] = await Promise.all([loadScoped("exams"), loadScoped("sources")]);
      let notes = [];
      try { notes = await NOTES.list({ teacherId: scopeId(), limit: 12 }); } catch (e) { notes = []; }
      const rows = [];
      exams.forEach(e => rows.push({ id: e.id, kind: "exam", title: e.title || "시험", at: e.createdAt || 0, sub: ((e.analysis || {}).total || 0) + "문항" + (e.matched ? " · 매칭 " + e.matched : "") + (e.reflection ? " · 프린트 반영 " + pct(e.reflection.rate) : "") }));
      sources.forEach(s => rows.push({ id: s.id, kind: s.kind === "프린트" ? "handout" : "source", title: s.name || "자료", at: s.createdAt || 0, sub: (s.kind === "프린트" ? "프린트" : s.kind || "범위") + " · 지문 " + (s.passages || 0) + ((s.items || []).length ? " · 포인트 " + s.items.length : "") + (s.reflection ? " · 반영율 " + pct(s.reflection.rate) : "") }));
      notes.forEach(n => { if (n.kind === "anchor") return; rows.push({ id: n.id, kind: noteKindOf(n), title: NOTES.titleOf(n), at: n.createdAt || 0, sub: [NOTES.kindLabel(n.kind), (n.tags || []).map(x => "#" + x).join(" ")].filter(Boolean).join(" · ") }); });
      rows.sort((a, b) => (b.at || 0) - (a.at || 0));
      return rows.slice(0, 6);
    }
    function bindToday() {
      if (boundToday) return; boundToday = true;
      $("homePick").onclick = () => UI.pickFiles();
      $("homeDrop").onclick = (e) => { if (!e.target.closest("button")) UI.pickFiles(); };
      bindCapture($("homeCaptureText"), $("homeCaptureGo"));
      $("homeAskGo").onclick = () => homeAsk();
      $("homeAskInput").addEventListener("keydown", (e) => { if (e.isComposing || e.keyCode === 229) return; if (e.key === "Enter") { e.preventDefault(); homeAsk(); } });
    }
    function homeAsk() {
      const el = $("homeAskInput"), q = el.value.trim();
      if (!q) { ROUTE.go("#/ask"); return; }
      el.value = ""; askS.force = true;
      ROUTE.go(ROUTE.href({ view: "ask", query: { q } }));
    }
    // 빠른 메모 (오늘 · 인박스 공용) — [[ · # 자동완성 · ⏎ 저장 · ⇧⏎ 줄바꿈
    function bindCapture(ta, btn) {
      if (!ta || !btn) return;
      let ac = null, hints = [];
      // 고른 항목의 id 를 기억한다 — 같은 제목이 둘일 때 사용자가 고른 그 문서에 링크가 걸리도록
      try { ac = UI.autocomplete(ta, { teacherId: () => scopeId(), onPick: (it) => { if (it && it.kind === "link" && it.id && it.title) hints = hints.filter(x => x.text !== it.title).concat([{ text: it.title, to: it.id }]); } }); } catch (e) { console.error(e); }
      const save = async () => {
        const text = ta.value.trim(); if (!text) return;
        ta.value = ""; const hs = hints; hints = [];
        try { const doc = await APP.quickNote(text, hs); if (doc) UI.toast("메모를 저장했어요", { ok: true, action: "열기", onAction: () => ROUTE.go(ROUTE.note(doc.id)) }); }
        catch (e) { console.error(e); UI.toast("메모를 저장하지 못했어요: " + (e && e.message || e), { bad: true }); }
      };
      btn.onclick = save;
      ta.addEventListener("keydown", (e) => {
        if (e.isComposing || e.keyCode === 229) return;
        if (e.defaultPrevented) return;                                   // 자동완성이 먼저 ⏎ 를 가져갔다 (같은 요소의 다른 듣개)
        if (ac && ac.isOpen()) return;
        if (e.key === "Enter" && (!e.shiftKey || e.metaKey || e.ctrlKey)) { e.preventDefault(); save(); }
      });
    }

    // ================= 인박스 (§2.10) =================
    let boundInbox = false;
    function inboxView() {
      bindInbox();
      const t = sel();
      $("vInbox").querySelector("#inboxHint").textContent = API.ready() ? "PDF · 워드 · 한글 · 엑셀 · 텍스트 · 사진(OCR) · 20개까지" : "API 키를 저장하면 시작해요 — 설정에서 키를 넣어 주세요";
      const list = $("queueList"), html = queueHtml(t ? t.id : null);
      list.innerHTML = html || '<div class="empty">' + (t ? '<b>작업이 없어요</b>기출 · 범위 원문 · 프린트를 위에 놓으면 여기에서 정리돼요' : S.teachers.size ? '<b>선생님을 골라 주세요</b>파일을 놓으면 어느 선생님에게 넣을지 고를 수 있어요' : '<b>선생님을 먼저 만들어 주세요</b>') + '</div>';
      bindQueue(list);
      const act = S.queue.filter(ACTIVE).length, done = S.queue.filter(j => !ACTIVE(j)).length;
      $("queueClear").hidden = !done; $("queueCancelAll").hidden = !act;
    }
    function bindInbox() {
      if (boundInbox) return; boundInbox = true;
      $("inboxPick").onclick = () => UI.pickFiles();
      $("inboxCamera").onclick = () => UI.pickCamera();
      $("inboxDrop").onclick = (e) => { if (!e.target.closest("button")) UI.pickFiles(); };
      $("inboxKind").addEventListener("click", (e) => { const b = e.target.closest("button[data-v]"); if (!b) return; $("inboxKind").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); });
      $("queueClear").onclick = () => APP.clearDone();
      $("queueCancelAll").onclick = () => APP.cancelAll();
      bindCapture($("captureText"), $("captureGo"));
    }
    // 큐 행 (옛 UI 그대로 — 단계 · 종류 칩 순환 · 취소 · 재시도 · 그래도 넣기 · 지우기 · 메모 · OCR 진행) + 완료 행 [data-open]
    function queueHtml(teacherId) {
      const one = teacherId && teacherId !== APP.ALL;
      const jobs = S.queue.filter(j => !one || j.teacherId === teacherId);
      if (!jobs.length) return "";
      const KLJ = { exam: "기출", scope: "범위", handout: "프린트", auto: "자동" };
      return jobs.map(j => {
        const tn = one ? "" : '<span class="small">' + esc((T(j.teacherId) || {}).name || "") + ' · </span>';
        const chip = ["queued", "extract", "ocr", "classify"].includes(j.stage)
          ? '<button type="button" class="chip' + (j.kind === "scope" ? " gold" : j.kind === "handout" ? "" : j.kind === "auto" ? " dim" : "") + '" data-flip="' + esc(j.id) + '" title="종류가 다르면 눌러서 바꾸세요 (기출 → 범위 → 프린트)">' + KLJ[j.kind] + '</button>'
          : '<span class="chip' + (j.kind === "scope" ? " gold" : "") + '">' + KLJ[j.kind] + '</span>';
        const x = ["done", "error", "cancelled"].includes(j.stage) ? '<button type="button" class="x ghost" data-rm="' + esc(j.id) + '">✕</button>' : '<button type="button" class="x ghost" data-cancel="' + esc(j.id) + '" title="취소">✕</button>';
        const err = j.stage === "error" ? '<div class="d bad">⚠ ' + esc(j.error) + ' ' + (j.canForce ? '<button type="button" class="link" data-force="' + esc(j.id) + '">그래도 넣기</button>' : (j.tries || 0) < 3 ? '<button type="button" class="link" data-retry="' + esc(j.id) + '">다시</button>' : '<span class="faint">(3번 실패 — 건너뛸게요)</span>') + '</div>' : "";
        const openId = j.stage === "done" ? (j.sourceId || j.examId || "") : "";
        const open = openId ? ' <button type="button" class="link" data-open="' + esc(openId) + '">노트 열기</button>' : "";
        return '<div class="q' + (j.stage === "error" ? " err" : "") + '" data-job="' + esc(j.id) + '"><span class="n">' + tn + esc(j.name) + '</span><span class="row">' + chip + x + '</span>'
          + '<div class="d">' + (j.stage === "done" ? "✓ " : "") + esc(j.detail || "") + (j.note ? " · " + esc(j.note) : "") + open
          + (j.memo ? '<div class="memo" title="' + esc(j.memo) + '">✎ ' + esc(j.memo.length > 60 ? j.memo.slice(0, 60) + "…" : j.memo) + '</div>' : "") + '</div>'
          + (["done", "error", "cancelled", "queued"].includes(j.stage) ? "" : '<div class="bar prog"><i style="width:' + Math.round((j.progress || 0) * 100) + '%"></i></div>') + err + '</div>';
      }).join("");
    }
    function bindQueue(root) {
      if (!root) return;
      const find = (id) => S.queue.find(j => j.id === id);
      root.querySelectorAll("[data-flip]").forEach(b => b.onclick = () => { const j = find(b.dataset.flip); if (j) APP.cycleJobKind(j); });
      root.querySelectorAll("[data-cancel]").forEach(b => b.onclick = () => { const j = find(b.dataset.cancel); if (j) APP.cancelJob(j); });
      root.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { S.queue = S.queue.filter(j => j.id !== b.dataset.rm); APP.emit("queue"); });
      root.querySelectorAll("[data-retry]").forEach(b => b.onclick = () => { const j = find(b.dataset.retry); if (j) APP.retryJob(j); });
      root.querySelectorAll("[data-force]").forEach(b => b.onclick = () => { const j = find(b.dataset.force); if (j) APP.retryJob(j, true); });
      root.querySelectorAll("[data-open]").forEach(b => b.onclick = () => { const id = b.dataset.open; if (id) ROUTE.go(ROUTE.note(id)); });
    }

    // ================= 서재 (§2.11) =================
    // 종류별 열 정의. v = 정렬값 · c = 셀 html · e = 인라인 편집(시험 표만) · tie = 값이 같을 때의 본디 차례 · text = 검색용 글
    const num = (v) => '<span class="num">' + esc(v) + '</span>';
    const examMeta = (e) => e.meta || {};
    const examTimeOf = (id) => libCtx.examAt[id] || 0;
    const LIB = {
      exams: {
        cols: [
          { k: "title", t: "제목", v: (e) => TEXT.examTime(examMeta(e)), c: (e) => esc(e.title || "시험") },
          { k: "year", t: "연도", n: 1, v: (e) => +examMeta(e).year || 0, c: (e) => esc(String(examMeta(e).year || "—")), e: { m: "year" } },
          { k: "semester", t: "학기", v: (e) => +examMeta(e).semester || 0, c: (e) => examMeta(e).semester ? esc(examMeta(e).semester + "학기") : "—", e: { seg: "semester" } },
          { k: "term", t: "시험명", v: (e) => examMeta(e).term || "", c: (e) => esc(examMeta(e).term || "—"), e: { seg: "term" } },
          { k: "questions", t: "문항", n: 1, v: (e) => (e.analysis || {}).total || 0, c: (e) => num((e.analysis || {}).total || 0) },
          { k: "matched", t: "매칭", n: 1, v: (e) => e.matched || 0, c: (e) => num((e.matched || 0) + "/" + (e.matchable || (e.analysis || {}).total || 0)) },
          { k: "reflection", t: "프린트 반영", n: 1, v: (e) => e.reflection ? e.reflection.rate : -1, c: (e) => e.reflection ? '<span class="num gold">' + pct(e.reflection.rate) + '</span>' : '<span class="faint">—</span>' },
          { k: "ai", t: "AI", n: 1, v: (e) => e.ai ? e.ai.aiLikelihood : -1, c: (e) => e.ai ? num(pct(e.ai.aiLikelihood)) : "—" },
          { k: "status", t: "상태", v: (e) => e.status || "", c: (e) => e.status === "error" ? '<span class="badge bad">ERROR</span>' : e.learnedInVersion ? '<span class="badge ok">LEARNED · V' + e.learnedInVersion + '</span>' : '<span class="badge">ANALYZED</span>' },
          { k: "memos", t: "메모", n: 1, v: (e) => memoCount(e.id), c: (e) => { const n = memoCount(e.id); return n ? num(n) : '<span class="faint">0</span>'; } },
        ],
        def: ["title", "desc"],
        tie: (a, b) => TEXT.examTime(examMeta(b)) - TEXT.examTime(examMeta(a)),
        text: (e) => [e.title, examMeta(e).subject, (e.file || {}).name].filter(Boolean).join(" "),
      },
      questions: {
        cols: [
          { k: "number", t: "번호", n: 1, v: (q) => (q.order || 0), c: (q) => num(q.number || q.order || "") },
          { k: "exam", t: "시험", v: (q) => APP.indexCtx.examTitle(q.examId) || "", c: (q) => esc(APP.indexCtx.examTitle(q.examId) || "—") },
          { k: "type", t: "유형", v: (q) => q.type || "", c: (q) => esc(q.type || "—") + (q.subtype ? ' <span class="small">' + esc(q.subtype) + '</span>' : "") },
          { k: "format", t: "형식", v: (q) => q.format || "", c: (q) => esc(q.format || "—") },
          { k: "points", t: "배점", n: 1, v: (q) => q.points === null || q.points === undefined ? -1 : q.points, c: (q) => q.points === null || q.points === undefined ? "—" : num(q.points) },
          { k: "difficulty", t: "난이도", v: (q) => q.difficulty || "", c: (q) => esc(q.difficulty || "—") },
          { k: "passage", t: "지문", v: (q) => (q.match && q.match.passageId) ? (APP.indexCtx.passageSrc(q.match.passageId) || "") : "", c: (q) => (q.match && q.match.passageId) ? '<a href="' + esc(ROUTE.note(q.match.passageId)) + '" data-id="' + esc(q.match.passageId) + '">' + esc(APP.indexCtx.passageSrc(q.match.passageId) || "지문") + '</a>' : '<span class="faint">' + (q.external ? "범위 밖" : "미매칭") + '</span>' },
          { k: "hit", t: "프린트", v: (q) => q.handoutHit ? 1 : 0, c: (q) => q.handoutHit ? '<span class="gold">★ ' + esc((q.handoutHit.kinds || []).join(" ")) + '</span>' : '<span class="faint">—</span>' },
          { k: "variation", t: "변형", v: (q) => (q.transformation || {}).technique || "", c: (q) => { const t = q.transformation || {}; const v = [t.technique, t.blankPosition, t.blankUnit, t.orderSplit, t.insertPosition, t.vocabSwap].filter(Boolean); return v.length ? esc(v.join(" · ")) : "—"; } },
          { k: "tags", t: "태그", v: (q) => tagsOf(q.id).join(" "), c: (q) => tagChips(tagsOf(q.id), 3) || "—" },
        ],
        def: ["exam", "desc"],
        tie: (a, b) => (examTimeOf(b.examId) - examTimeOf(a.examId)) || (a.order || 0) - (b.order || 0),
        card: (q) => esc((q.number || q.order || "") + "번") + ' <span class="small">' + esc(q.type || "") + '</span>',
        text: (q) => [q.number, q.type, q.subtype, q.stem, q.format].filter(Boolean).join(" "),
      },
      passages: {
        cols: [
          { k: "src", t: "출처", v: (p) => p.src || "", c: (p) => esc(p.src || "지문") },
          { k: "source", t: "자료", v: (p) => (p.sourceId && libCtx.srcName[p.sourceId]) || "", c: (p) => p.sourceId ? '<a href="' + esc(ROUTE.note(p.sourceId)) + '" data-id="' + esc(p.sourceId) + '">' + esc(libCtx.srcName[p.sourceId] || "자료") + '</a>' : "—" },
          { k: "genre", t: "장르", v: (p) => p.genre || "", c: (p) => esc(p.genre || "—") },
          { k: "words", t: "단어", n: 1, v: (p) => p.words || 0, c: (p) => num(p.words || 0) },
          { k: "feats", t: "특징", v: (p) => (p.feats || []).join(" "), c: (p) => (p.feats || []).length ? (p.feats || []).slice(0, 3).map(x => '<span class="chip dim">' + esc(x) + '</span>').join(" ") : "—" },
          { k: "used", t: "쓰인 문항", n: 1, v: (p) => libCtx.usedBy[p.id] || 0, c: (p) => num(libCtx.usedBy[p.id] || 0) },
          { k: "pUse", t: "다음 시험", n: 1, v: (p) => libCtx.pUse[p.id] === undefined ? -1 : libCtx.pUse[p.id], c: (p) => libCtx.pUse[p.id] === undefined ? '<span class="faint">—</span>' : '<span class="num gold">' + pct(libCtx.pUse[p.id]) + '</span>' },
          { k: "hit", t: "프린트", v: (p) => p.fromHandout ? 1 : 0, c: (p) => p.fromHandout ? '<span class="gold">★</span>' : '<span class="faint">—</span>' },
          { k: "tags", t: "태그", v: (p) => tagsOf(p.id).join(" "), c: (p) => tagChips(tagsOf(p.id), 3) || "—" },
        ],
        def: ["source", "asc"],
        tie: (a, b) => (a.order || 0) - (b.order || 0),
        text: (p) => [p.src, p.genre, p.first, (p.feats || []).join(" ")].filter(Boolean).join(" "),
      },
      sources: {
        cols: [
          { k: "name", t: "이름", v: (s) => s.name || "", c: (s) => esc(s.name || "자료") },
          { k: "kind", t: "종류", v: (s) => s.kind || "", c: (s) => s.kind === "프린트" ? '<span class="chip gold">프린트</span> <span class="small">' + esc(targetLabel(s)) + '</span>' : esc(s.kind || "—") },
          { k: "passages", t: "지문", n: 1, v: (s) => s.passages || 0, c: (s) => num(s.passages || 0) },
          { k: "items", t: "포인트", n: 1, v: (s) => (s.items || []).length, c: (s) => (s.items || []).length ? num(s.items.length) : "—" },
          { k: "reflection", t: "반영율", n: 1, v: (s) => s.reflection ? s.reflection.rate : -1, c: (s) => s.reflection ? '<span class="num gold">' + pct(s.reflection.rate) + '</span> <span class="small">' + s.reflection.hit + "/" + s.reflection.n + '</span>' : '<span class="faint">—</span>' },
          { k: "complete", t: "완비", v: (s) => s.complete ? 1 : 0, c: (s) => s.kind === "프린트" ? "—" : (s.complete ? '<span class="ok">✓</span>' : '<span class="faint">—</span>') },
          { k: "createdAt", t: "넣은 날", v: (s) => s.createdAt || 0, c: (s) => '<span class="small">' + esc(TEXT.fmtDate(s.createdAt)) + '</span>' },
        ],
        def: ["createdAt", "desc"],
        tie: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
        text: (s) => [s.name, s.kind, (s.file || {}).name].filter(Boolean).join(" "),
      },
      profiles: {
        cols: [
          { k: "version", t: "V", n: 1, v: (p) => p.version || 0, c: (p) => num("V" + (p.version || 0)) },
          { k: "createdAt", t: "만든 날", v: (p) => p.createdAt || 0, c: (p) => esc(TEXT.fmtDate(p.createdAt)) },
          { k: "level", t: "레벨", v: (p) => ((p.profile || {}).level || {}).id || 0, c: (p) => esc(((p.profile || {}).level || {}).name || "—") },
          { k: "reliability", t: "신뢰도", n: 1, v: (p) => (p.profile || {}).reliability || 0, c: (p) => num((p.profile || {}).reliability === undefined ? "—" : pct((p.profile || {}).reliability)) },
          { k: "basedOn", t: "근거", v: (p) => (p.basedOn || {}).nQuestions || 0, c: (p) => '<span class="small">시험 ' + ((p.basedOn || {}).nExams || 0) + ' · 문항 ' + ((p.basedOn || {}).nQuestions || 0) + '</span>' },
          { k: "delta", t: "달라진 점", v: (p) => (p.delta || [])[0] || "", c: (p) => esc(clip((p.delta || [])[0] || "—", 40)) },
          { k: "model", t: "모델", v: (p) => p.model || "", c: (p) => '<span class="small">' + esc(p.model || "—") + '</span>' },
        ],
        def: ["version", "desc"],
        tie: (a, b) => (b.version || 0) - (a.version || 0),
        card: (p) => num("V" + (p.version || 0)) + ' <span class="small">' + esc(TEXT.fmtDate(p.createdAt)) + '</span>',
        text: (p) => [(p.narrative || {}).text, (p.delta || []).join(" ")].filter(Boolean).join(" "),
      },
      predictions: {
        cols: [
          { k: "target", t: "대상", v: (p) => (p.target || {}).label || "", c: (p) => esc((p.target || {}).label || "—") + ((p.target || {}).date ? ' <span class="small">' + esc(p.target.date) + '</span>' : "") },
          { k: "version", t: "V", n: 1, v: (p) => p.profileVersion || 0, c: (p) => num("V" + (p.profileVersion || "?")) },
          { k: "plan", t: "문항 계획", v: (p) => ((p.blueprint || {}).plan || {}).total || 0, c: (p) => { const pl = (p.blueprint || {}).plan || {}; return esc((pl.total || 0) + "문항 · " + (pl.points || 0) + "점"); } },
          { k: "hot", t: "유력 지문", n: 1, v: (p) => ((p.blueprint || {}).passages || []).length, c: (p) => num(((p.blueprint || {}).passages || []).length) },
          { k: "confidence", t: "신뢰도", n: 1, v: (p) => (((p.blueprint || {}).confidence) || {}).overall || 0, c: (p) => num(pct((((p.blueprint || {}).confidence) || {}).overall)) },
          { k: "model", t: "모델", v: (p) => p.model || "", c: (p) => '<span class="small">' + esc(p.model || "—") + '</span>' },
          { k: "createdAt", t: "만든 날", v: (p) => p.createdAt || 0, c: (p) => '<span class="small">' + esc(TEXT.fmtDate(p.createdAt)) + '</span>' },
        ],
        def: ["createdAt", "desc"],
        tie: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
        text: (p) => [(p.target || {}).label, p.copyText].filter(Boolean).join(" "),
      },
      mocks: {
        cols: [
          { k: "title", t: "제목", v: (m) => m.title || "", c: (m) => esc(m.title || "적중 모의고사") },
          { k: "target", t: "대상", v: (m) => m.target || "", c: (m) => esc(m.target || "—") },
          { k: "count", t: "문항", n: 1, v: (m) => (m.stats || {}).total || (m.questions || []).length, c: (m) => num((m.stats || {}).total || (m.questions || []).length) },
          { k: "points", t: "배점", n: 1, v: (m) => (m.stats || {}).points || 0, c: (m) => num((m.stats || {}).points || 0) },
          { k: "model", t: "모델", v: (m) => m.model || "", c: (m) => '<span class="small">' + esc(m.model || "—") + '</span>' },
          { k: "createdAt", t: "만든 날", v: (m) => m.createdAt || 0, c: (m) => '<span class="small">' + esc(TEXT.fmtDate(m.createdAt)) + '</span>' },
          { k: "open", t: "", v: () => 0, c: (m) => '<button type="button" class="link" data-paper="' + esc(m.id) + '">열기</button>' },
        ],
        def: ["createdAt", "desc"],
        tie: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
        text: (m) => [m.title, m.target].filter(Boolean).join(" "),
      },
      notes: {
        cols: [
          { k: "title", t: "제목", v: (n) => NOTES.titleOf(n), c: (n) => esc(NOTES.titleOf(n)) },
          { k: "kind", t: "종류", v: (n) => n.kind || "", c: (n) => esc(NOTES.kindLabel(n.kind)) },
          { k: "anchor", t: "붙은 곳", v: (n) => (n.anchor && n.anchor.id) || "", c: (n) => n.anchor && n.anchor.id ? '<a href="' + esc(ROUTE.note(n.anchor.id)) + '" data-id="' + esc(n.anchor.id) + '">' + esc(clip(noteTitleOf(n.anchor.id), 30)) + '</a>' : n.orphanOf ? '<span class="faint">삭제된 ' + esc(clip(n.orphanOf.title || "", 20)) + '</span>' : "—" },
          { k: "tags", t: "태그", v: (n) => (n.tags || []).join(" "), c: (n) => tagChips(n.tags, 3) || "—" },
          { k: "author", t: "서명", v: (n) => n.author || "", c: (n) => '<span class="small">' + esc(n.author || "이 기기") + '</span>' },
          { k: "updatedAt", t: "수정", v: (n) => n.updatedAt || 0, c: (n) => '<span class="small">' + esc(ago(n.updatedAt)) + '</span>' },
        ],
        def: ["updatedAt", "desc"],
        tie: (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
        text: (n) => [n.title, n.body, (n.tags || []).join(" ")].filter(Boolean).join(" "),
      },
    };
    const targetLabel = (s) => { const t = s.target || {}; return t.year ? t.year + " " + (t.semester || "") + "학기 " + (t.term || "") : "대상 미정"; };
    const noteTitleOf = (id) => { const d = INDEX.get(id); return d ? d.title : id; };
    const libCtx = { srcName: {}, usedBy: {}, pUse: {}, examYear: {}, examAt: {} };
    let seqLib = 0, boundLib = false, libQuery = {}, libKind = "exams", libRowsCache = [];
    const sameQuery = (a, b) => { const A = a || {}, B = b || {}; const ks = [...new Set(Object.keys(A).concat(Object.keys(B)))]; return ks.every(k => String(A[k] == null ? "" : A[k]) === String(B[k] == null ? "" : B[k])); };
    async function libraryView(kind, query) {
      const seq = ++seqLib;
      kind = LIB_KINDS.includes(kind) ? kind : "exams";
      // 셀을 고치는 중에는 같은 목록을 다시 그리지 않는다 — 배경 신호(작업 완료 등)로 입력칸이 떨어지면 고치던 값이 그대로 저장된다.
      // 이동(다른 kind · 다른 쿼리)은 그대로 그린다.
      const tb = $("libTable");
      if (kind === libKind && sameQuery(query, libQuery) && tb && tb.querySelector("td input, td select") && tb.contains(document.activeElement)) return;
      libKind = kind; libQuery = query || {};
      $("vLibrary").dataset.kind = kind;
      bindLib();
      const rows = await loadLib(kind);
      if (seq !== seqLib) return;
      const spec = LIB[kind];
      const filtered = rows.filter(d => libMatch(kind, d, libQuery));
      const [sk, dir] = libSort(kind, libQuery);
      const col = spec.cols.find(c => c.k === sk) || spec.cols[0];
      const sign = dir === "asc" ? 1 : -1;
      const tie = spec.tie || ((a, b) => String(a.id).localeCompare(String(b.id)));
      filtered.sort((a, b) => { const x = col.v(a), y = col.v(b); return (typeof x === "number" && typeof y === "number" ? (x - y) : String(x).localeCompare(String(y), "ko")) * sign || tie(a, b); });
      const scopeBits = [libQuery.exam ? noteTitleOf(libQuery.exam) : "", libQuery.passage ? noteTitleOf(libQuery.passage) : "", libQuery.diff ? "난이도 " + libQuery.diff : "", libQuery.genre || ""].filter(Boolean);
      $("libCount").textContent = (LIB_LABEL[kind] || kind) + " " + filtered.length + (filtered.length !== rows.length ? " / " + rows.length : "") + (scopeBits.length ? " · " + scopeBits.join(" · ") : "");
      renderLibFilter(kind, rows);
      renderLibSort(kind, sk, dir);
      const show = filtered.slice(0, 300);
      renderLibTable(kind, spec, show, sk, dir);
      renderLibCards(kind, spec, show);
      renderLibEmpty(kind, rows.length, filtered.length);
      const el = $("libSearch"); if (document.activeElement !== el) el.value = libQuery.q || "";
    }
    async function loadLib(kind) {
      libCtx.srcName = {}; libCtx.usedBy = {}; libCtx.pUse = {}; libCtx.examYear = {}; libCtx.examAt = {};
      if (kind === "notes") { try { return await NOTES.list({ teacherId: scopeId() }); } catch (e) { return []; } }
      if (kind === "questions") {
        const [qs, exams] = await Promise.all([loadScoped("questions"), loadScoped("exams")]);
        exams.forEach(e => { libCtx.examYear[e.id] = +(e.meta || {}).year || 0; libCtx.examAt[e.id] = TEXT.examTime(e.meta || {}); });
        return qs;
      }
      if (kind === "passages") {
        const [ps, srcs, qs, preds] = await Promise.all([loadScoped("passages"), loadScoped("sources"), loadScoped("questions"), loadScoped("predictions")]);
        srcs.forEach(s => { libCtx.srcName[s.id] = s.name; });
        qs.forEach(q => { const pid = q.match && q.match.passageId; if (pid) libCtx.usedBy[pid] = (libCtx.usedBy[pid] || 0) + 1; });
        preds.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        const seen = {};
        preds.forEach(pr => { if (seen[pr.teacherId]) return; seen[pr.teacherId] = 1; ((pr.blueprint || {}).passages || []).forEach(x => { libCtx.pUse[x.passageId] = x.pUse; }); });
        return ps.filter(p => p.kind === "지문");
      }
      if (kind === "exams") return loadScoped("exams");
      if (kind === "sources") return loadScoped("sources");
      if (kind === "profiles") return loadScoped("profiles");
      if (kind === "predictions") return loadScoped("predictions");
      if (kind === "mocks") return loadScoped("mocks");
      return [];
    }
    function libSort(kind, q) {
      const spec = LIB[kind];
      let sk = q.sort, dir = q.dir;
      if (!sk) { const u = UI.ui2().libSort || {}; const saved = u[kind]; if (Array.isArray(saved)) { sk = saved[0]; dir = dir || saved[1]; } }
      if (!sk || !spec.cols.some(c => c.k === sk)) { sk = spec.def[0]; dir = dir || spec.def[1]; }
      return [sk, dir === "asc" ? "asc" : dir === "desc" ? "desc" : spec.def[1]];
    }
    function libMatch(kind, d, q) {
      const spec = LIB[kind];
      if (q.q) { const s = (spec.text(d) || "").toLowerCase(); if (s.indexOf(String(q.q).toLowerCase()) < 0) return false; }
      if (q.tag) { const want = String(q.tag).replace(/^#/, ""); const has = kind === "notes" ? (d.tags || []) : tagsOf(d.id); if (!has.includes(want)) return false; }
      if (q.type) {
        const v = kind === "questions" ? d.type : kind === "passages" ? d.genre : kind === "sources" ? d.kind : kind === "notes" ? d.kind : "";
        if (String(v || "") !== String(q.type)) return false;
      }
      if (q.kind) { const v = kind === "sources" ? d.kind : kind === "notes" ? d.kind : ""; if (String(v || "") !== String(q.kind)) return false; }
      if (q.hit === "1") {
        const on = kind === "questions" ? !!d.handoutHit : kind === "passages" ? !!d.fromHandout : kind === "sources" ? d.kind === "프린트" : kind === "exams" ? !!d.reflection : false;
        if (!on) return false;
      }
      if (q.matched === "0" && kind === "questions" && d.match && d.match.passageId) return false;
      if (q.ext === "1" && kind === "questions" && !d.external) return false;
      // 노트에서 온 것들 — [문항 목록으로](시험) · [같은 지문 문항 보기](지문) · 파생 태그 #난이도상 · 장르
      if (q.exam && (kind !== "questions" || d.examId !== q.exam)) return false;
      if (q.passage && (kind !== "questions" || !(d.match && d.match.passageId === q.passage))) return false;
      if (q.diff && (kind !== "questions" || String(d.difficulty || "") !== String(q.diff))) return false;
      if (q.genre && (kind !== "passages" || String(d.genre || "") !== String(q.genre))) return false;
      if (q.year) {
        const y = kind === "exams" ? +(d.meta || {}).year || 0 : kind === "questions" ? (libCtx.examYear[d.examId] || 0) : 0;
        if (y !== +q.year) return false;
      }
      return true;
    }
    // 필터 칩 — 종류마다 쓰는 칩만 보인다. 조합은 주소 쿼리로만 산다.
    function renderLibFilter(kind, rows) {
      const q = libQuery;
      const use = { type: ["questions", "passages", "sources", "notes"].includes(kind), tag: ["questions", "passages", "notes"].includes(kind), hit: ["questions", "passages", "sources", "exams"].includes(kind), matched: kind === "questions", year: ["exams", "questions"].includes(kind) };
      const label = { type: kind === "passages" ? "장르" : kind === "sources" ? "종류" : kind === "notes" ? "종류" : "유형", tag: "태그", hit: "★ 프린트", matched: "미매칭", year: "연도" };
      $("libFilter").querySelectorAll(".chip[data-f]").forEach(b => {
        const f = b.dataset.f;
        b.hidden = !use[f];
        const on = f === "hit" ? q.hit === "1" : f === "matched" ? q.matched === "0" : !!q[f];
        b.classList.toggle("on", on);
        b.textContent = label[f] + (f === "type" && q.type ? " · " + q.type : f === "tag" && q.tag ? " · #" + q.tag : f === "year" && q.year ? " · " + q.year : "") + (f === "type" || f === "tag" || f === "year" ? " ▾" : "");
      });
      const any = ["q", "type", "tag", "hit", "matched", "year", "kind", "ext", "exam", "passage", "diff", "genre"].some(k => q[k]);
      $("libFilterClear").hidden = !any;
      libRowsCache = rows;
    }
    function libFilterOptions(kind, f) {
      const out = new Map();
      libRowsCache.forEach(d => {
        let vs = [];
        if (f === "type") vs = [kind === "questions" ? d.type : kind === "passages" ? d.genre : kind === "sources" ? d.kind : d.kind];
        else if (f === "tag") vs = kind === "notes" ? (d.tags || []) : tagsOf(d.id);
        else if (f === "year") vs = [kind === "exams" ? (d.meta || {}).year : libCtx.examYear[d.examId]];
        vs.forEach(v => { if (v === undefined || v === null || v === "") return; out.set(String(v), (out.get(String(v)) || 0) + 1); });
      });
      return [...out.entries()].sort((a, b) => (f === "year" ? b[0].localeCompare(a[0]) : b[1] - a[1]));
    }
    function openLibFilterPop(btn, f) {
      const pop = $("libFilterPop");
      if (!pop.hidden && pop.dataset.f === f) { pop.hidden = true; return; }
      const opts = libFilterOptions(libKind, f);
      pop.dataset.f = f;
      pop.innerHTML = opts.length ? opts.map(([v, n]) => '<button type="button" data-v="' + esc(v) + '">' + (f === "tag" ? "#" : "") + esc(v) + ' <span class="small">' + n + '</span></button>').join("") + '<button type="button" data-v="">— 모두</button>' : '<div class="small">고를 것이 없어요</div>';
      pop.hidden = false;
      pop.style.left = Math.max(0, btn.offsetLeft) + "px";
      pop.querySelectorAll("button[data-v]").forEach(b => b.onclick = () => { pop.hidden = true; goLib({ [f]: b.dataset.v || "" }); });
      setTimeout(() => document.addEventListener("click", function off(ev) { if (!pop.contains(ev.target) && ev.target !== btn) pop.hidden = true; document.removeEventListener("click", off); }), 0);
    }
    function goLib(patch, replace) {
      const q = Object.assign({}, libQuery, patch);
      Object.keys(q).forEach(k => { if (q[k] === "" || q[k] === null || q[k] === undefined) delete q[k]; });
      ROUTE.go(ROUTE.all(libKind, q), replace ? { replace: true } : undefined);
    }
    function renderLibSort(kind, sk, dir) {
      const selEl = $("libSort"), spec = LIB[kind];
      const html = spec.cols.filter(c => c.t).map(c => '<option value="' + esc(c.k) + '"' + (c.k === sk ? " selected" : "") + '>' + esc(c.t) + ' ' + (c.k === sk ? (dir === "asc" ? "↑" : "↓") : "") + '</option>').join("");
      if (selEl.dataset.kind !== kind || selEl.value !== sk || selEl.dataset.dir !== dir) { selEl.innerHTML = html; selEl.value = sk; selEl.dataset.kind = kind; selEl.dataset.dir = dir; }
    }
    function renderLibTable(kind, spec, rows, sk, dir) {
      const tb = $("libTable");
      tb.querySelector("thead").innerHTML = '<tr>' + spec.cols.map(c => '<th' + (c.t ? ' data-sort="' + esc(c.k) + '"' : "") + ' class="' + (c.n ? "num " : "") + (c.k === sk ? dir : "") + '">' + esc(c.t) + '</th>').join("") + '</tr>';
      tb.querySelector("tbody").innerHTML = rows.map(d => '<tr class="rowbtn" data-id="' + esc(d.id) + '">' + spec.cols.map(c => '<td class="' + (c.n ? "num " : "") + (c.e ? "edit" : "") + '"' + (c.e && c.e.m ? ' data-m="' + esc(c.e.m) + '"' : "") + (c.e && c.e.seg ? ' data-seg="' + esc(c.e.seg) + '"' : "") + (c.e ? ' tabindex="0" title="눌러서 고치기"' : "") + '>' + c.c(d) + '</td>').join("") + '</tr>').join("");
      tb.querySelectorAll("thead th[data-sort]").forEach(th => th.onclick = () => {
        const k = th.dataset.sort, nd = (k === sk && dir === "desc") ? "asc" : k === sk ? "desc" : (LIB[kind].cols.find(c => c.k === k) || {}).n ? "desc" : "asc";
        const u = UI.ui2().libSort || {}; u[kind] = [k, nd]; UI.ui2set({ libSort: u });
        goLib({ sort: k, dir: nd }, true);
      });
      tb.querySelectorAll("tbody tr[data-id]").forEach(tr => tr.onclick = (e) => { if (e.target.closest("td.edit, a, button")) return; ROUTE.go(ROUTE.note(tr.dataset.id)); });
      tb.querySelectorAll("tbody a[data-id]").forEach(a => a.onclick = (e) => e.stopPropagation());
      tb.querySelectorAll("[data-paper]").forEach(b => b.onclick = async (e) => { e.stopPropagation(); const m = await DB.get("mocks", b.dataset.paper); if (m) UI.openPaper(m); });
      if (kind === "exams") bindLibEdit(tb);
    }
    function renderLibCards(kind, spec, rows) {
      const box = $("libCards");
      box.innerHTML = rows.map(d => '<div class="card" data-id="' + esc(d.id) + '"><div style="font-size:13px;color:var(--ink);margin-bottom:4px">' + (spec.card ? spec.card(d) : spec.cols[0].c(d)) + '</div><div class="small">' + spec.cols.slice(1, 5).map(c => (c.t ? esc(c.t) + " " : "") + c.c(d)).join(" · ") + '</div></div>').join("");
      box.querySelectorAll(".card[data-id]").forEach(el => el.onclick = (e) => { if (e.target.closest("a, button")) return; ROUTE.go(ROUTE.note(el.dataset.id)); });
    }
    // 시험 표의 인라인 편집 ([data-m=year] · [data-seg=semester|term] → APP.updateExamMeta). Enter 로 열고 Esc 로 닫는다.
    function bindLibEdit(root) {
      root.querySelectorAll("td.edit").forEach(td => {
        td.onclick = (e) => { e.stopPropagation(); openCellEdit(td); };
        td.onkeydown = (e) => { if (e.isComposing || e.keyCode === 229) return; if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); openCellEdit(td); } };
      });
    }
    function openCellEdit(td) {
      if (td.querySelector("input, select")) return;
      const tr = td.closest("tr"); if (!tr) return;
      const id = tr.dataset.id, m = td.dataset.m, sg = td.dataset.seg, old = td.innerHTML, txt = td.textContent.trim();
      let el;
      if (m === "year") el = h('<input type="number" value="' + esc(txt.replace(/[^0-9]/g, "")) + '" style="width:84px">');
      else if (sg === "semester") el = h('<select><option value="1">1학기</option><option value="2">2학기</option></select>');
      else if (sg === "term") el = h('<select>' + ["중간", "기말", "1차지필", "2차지필"].map(v => '<option value="' + v + '">' + v + '</option>').join("") + '</select>');
      else return;
      td.innerHTML = ""; td.appendChild(el);
      if (sg === "semester") el.value = txt.indexOf("2") === 0 ? "2" : "1";
      if (sg === "term") el.value = ["중간", "기말", "1차지필", "2차지필"].includes(txt) ? txt : "중간";
      el.focus(); if (el.select) try { el.select(); } catch (e) {}
      const was = String(el.value);
      let done = false;
      const cancel = () => { if (done) return; done = true; td.innerHTML = old; };
      const commit = async () => {
        if (done) return;
        // 표가 통째로 다시 그려지면(배경 작업 완료 같은 신호) 입력칸이 DOM 에서 떨어지면서 blur 가 난다.
        // 그 blur 는 사용자가 끝낸 것이 아니므로 입력 도중 값을 쓰지 않는다 — 진짜 blur 는 el 이 아직 붙어 있다.
        if (!el.isConnected) { done = true; return; }
        done = true;
        if (String(el.value) === was) { td.innerHTML = old; return; }                 // 그대로면 쓰지 않는다 (학습 중 문서를 덮지 않게)
        const patch = m === "year" ? { year: +el.value || 0 } : sg === "semester" ? { semester: +el.value } : { term: el.value };
        if (m === "year" && !patch.year) { td.innerHTML = old; return; }
        td.innerHTML = '<span class="small">저장 중…</span>';
        try { await APP.updateExamMeta(id, patch); } catch (e) { console.error(e); UI.toast("고치지 못했어요", { bad: true }); td.innerHTML = old; }
      };
      el.addEventListener("keydown", (e) => { if (e.isComposing || e.keyCode === 229) return; if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); cancel(); } else if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); commit(); } });
      el.addEventListener("blur", () => setTimeout(commit, 120));
      if (el.tagName === "SELECT") el.addEventListener("change", commit);
    }
    function renderLibEmpty(kind, total, shown) {
      const box = $("libEmpty"), btn = $("libEmptyAct");
      box.hidden = shown > 0;
      if (shown > 0) return;
      const t = sel(), c = t ? (S.counts.get(t.id) || {}) : {}, p = t && S.profiles.get(t.id), pr = t && S.predictions.get(t.id);
      let text = "", label = "파일 넣기", act = () => UI.pickFiles(), disabled = "", why = "";
      if (total > 0) { text = "이 조건에 맞는 것이 없어요"; label = "필터 지우기"; act = () => goLib({ q: "", type: "", tag: "", hit: "", matched: "", year: "", kind: "", ext: "" }); }
      else if (kind === "exams" || kind === "questions") text = "기출 시험지를 인박스에 놓으세요";
      else if (kind === "passages") text = "범위 원문이 없어 유력 지문을 고를 수 없어요";
      else if (kind === "sources") text = libQuery.kind === "프린트" ? "선생님 프린트가 없어요 — 파일을 넣을 때 칩을 '프린트'로 두면 반영율을 계산해요" : "시험범위 원문 · 선생님 프린트를 넣어 주세요";
      else if (kind === "profiles") { text = "문항이 1개 이상이면 학습할 수 있어요"; label = "학습"; act = () => { if (t) UI.run(() => APP.learn(t.id, { force: true })); }; if (!t || !c.questions) { disabled = " disabled"; why = t ? "기출 시험지를 먼저 넣어 주세요" : "선생님을 골라 주세요"; } }
      else if (kind === "predictions") { text = "학습 뒤 예측할 수 있어요"; label = "예측"; act = () => { if (t) UI.openPredictSheet(t.id); }; if (!p) { disabled = " disabled"; why = "먼저 학습해 주세요"; } }
      else if (kind === "mocks") { text = "예측 뒤에 만들 수 있어요"; label = "적중 모의고사"; act = () => { if (t) UI.openMockSheet(t.id); }; if (!pr) { disabled = " disabled"; why = "먼저 예측해 주세요"; } }
      else if (kind === "notes") { text = "메모가 없어요 — 노트에서 [[ 로 잇고 # 로 태그를 달아 보세요"; label = "빠른 메모"; act = () => ROUTE.go("#/inbox"); }
      box.querySelector("b").textContent = text;
      const nb = h('<button type="button" class="pri" id="libEmptyAct"' + disabled + (why ? ' title="' + esc(why) + '"' : "") + '>' + esc(label) + '</button>');
      btn.replaceWith(nb); nb.onclick = act;
    }
    function bindLib() {
      if (boundLib) return; boundLib = true;
      let t = 0;
      $("libSearch").addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => goLib({ q: $("libSearch").value.trim() }, true), 250); });
      $("libSearch").addEventListener("keydown", (e) => { if (e.isComposing || e.keyCode === 229) return; if (e.key === "Escape") { e.preventDefault(); $("libSearch").value = ""; goLib({ q: "" }, true); } });
      $("libSort").addEventListener("change", () => { const k = $("libSort").value; const u = UI.ui2().libSort || {}; const dir = (LIB[libKind].cols.find(c => c.k === k) || {}).n ? "desc" : "asc"; u[libKind] = [k, dir]; UI.ui2set({ libSort: u }); goLib({ sort: k, dir }, true); });
      $("libFilter").addEventListener("click", (e) => {
        const b = e.target.closest(".chip[data-f]"); if (!b) return;
        const f = b.dataset.f;
        if (f === "hit") goLib({ hit: libQuery.hit === "1" ? "" : "1" });
        else if (f === "matched") goLib({ matched: libQuery.matched === "0" ? "" : "0" });
        else openLibFilterPop(b, f);
      });
      $("libFilterClear").onclick = () => goLib({ q: "", type: "", tag: "", hit: "", matched: "", year: "", kind: "", ext: "", exam: "", passage: "", diff: "", genre: "", sort: "", dir: "" });
    }

    // ================= 태그 (§2.5 끝) =================
    let seqTag = 0, boundTag = false, tagCur = "";
    async function tagView(name) {
      const seq = ++seqTag;
      name = String(name || "").replace(/^#/, "").trim();
      tagCur = name;
      bindTag();
      const doc = NOTES.tags.get(name);
      $("tagTitle").textContent = "#" + name;
      $("tagColor").value = (doc && doc.color) || "#5fc8ff";
      const desc = $("tagDescText"); if (document.activeElement !== desc) desc.value = (doc && doc.desc) || "";
      let ids = [];
      try { ids = NOTES.tags.docsWith(name, scopeId()); } catch (e) { ids = []; }
      if (seq !== seqTag) return;
      const rows = ids.map(id => INDEX.get(id)).filter(Boolean).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      $("tagList").innerHTML = rows.length
        ? '<div class="kicker" style="margin:8px 0">이 태그가 붙은 노트 ' + rows.length + '</div><div class="cards">' + rows.map(d => ncard(d.id, d.handout ? "handout" : (d.noteKind === "ask" ? "ask" : d.kind), d.title, d.sub || "", d.updatedAt)).join("") + '</div>'
        : '<div class="empty"><b>아직 이 태그가 붙은 노트가 없어요</b>메모 본문에 #' + esc(name) + ' 이라고 적으면 여기에 모여요</div>';
    }
    function bindTag() {
      if (boundTag) return; boundTag = true;
      let t = 0;
      $("tagColor").addEventListener("change", () => { NOTES.tags.update(tagCur, { color: $("tagColor").value }).catch(e => console.error(e)); });
      $("tagDescText").addEventListener("input", () => { clearTimeout(t); const v = $("tagDescText").value; t = setTimeout(() => NOTES.tags.update(tagCur, { desc: v }).then(() => APP.emit("tag", { name: tagCur })).catch(e => console.error(e)), 700); });
      $("tagRename").onclick = () => {
        const name = tagCur;
        const el = h('<div><div class="field"><label>새 이름</label><input type="text" maxlength="40" value="' + esc(name) + '"></div><div class="small">모든 메모 본문의 #' + esc(name) + ' 을 함께 바꿔요.</div><div class="actions"><button type="button" class="ghost">취소</button><button type="button" class="pri">바꾸기</button></div></div>');
        const inp = el.querySelector("input"), bs = el.querySelectorAll(".actions button");
        bs[0].onclick = () => UI.closeSheet();
        bs[1].onclick = async () => {
          const to = NOTES.tags.normalize(inp.value); if (!to || to === name) { UI.closeSheet(); return; }
          UI.closeSheet();
          try { const n = await NOTES.tags.rename(name, to); APP.emit("tag", { name: to }); UI.toast("태그를 바꿨어요 — 메모 " + n + "개", { ok: true }); ROUTE.go(ROUTE.tag(to), { replace: true }); }
          catch (e) { console.error(e); UI.toast("바꾸지 못했어요", { bad: true }); }
        };
        UI.openSheet("태그 이름 바꾸기", el, { kind: "tag" });
      };
      $("tagDelete").onclick = () => {
        const name = tagCur;
        const el = h('<div><p>#' + esc(name) + ' 태그를 지웁니다. 메모 본문에서도 이 태그만 걷어 내요 — 메모 자체는 남아요.</p><div class="actions"><button type="button" class="ghost">취소</button><button type="button" class="danger">지우기</button></div></div>');
        const bs = el.querySelectorAll(".actions button");
        bs[0].onclick = () => UI.closeSheet();
        bs[1].onclick = async () => {
          UI.closeSheet();
          try { const n = await NOTES.tags.remove(name); APP.emit("tag", { name }); UI.toast("태그를 지웠어요 — 메모 " + n + "개", { ok: true }); ROUTE.go(ROUTE.all("notes"), { replace: true }); }
          catch (e) { console.error(e); UI.toast("지우지 못했어요", { bad: true }); }
        };
        UI.openSheet("태그 지우기", el, { kind: "tag" });
      };
    }

    // ================= 타임라인 (§2.13) =================
    const EV_GROUP = { ingest: "ingest", index: "ingest", import: "ingest", learn: "learn", predict: "predict", generate: "generate", edit: "edit", match: "edit", note: "note", link: "note", ask: "ask", error: "error", export: "ingest", "teacher.create": "edit" };
    const EV_LABEL = { ingest: "INGEST", index: "INDEX", import: "IMPORT", export: "EXPORT", learn: "LEARN", predict: "PREDICT", generate: "MOCK", edit: "EDIT", match: "MATCH", note: "NOTE", link: "LINK", ask: "ASK", error: "ERROR", "teacher.create": "TEACHER" };
    const EV_KIND = { ingest: "exam", index: "source", import: "source", export: "source", learn: "profile", predict: "prediction", generate: "mock", edit: "exam", match: "question", note: "note", link: "note", ask: "ask", error: "exam", "teacher.create": "teacher" };
    let seqTl = 0, boundTl = false, tlFilter = "", tlWeek = 0;
    const fOf = (b) => { const v = b.dataset.f || ""; return v === "all" ? "" : v; };      // [전체] = 거르지 않음
    async function timelineView(week) {
      const seq = ++seqTl;
      bindTl();
      const lo = APP.weekStartOf(week ? new Date(String(week) + "T00:00:00").getTime() : Date.now()), hi = lo + 7 * DAY;
      tlWeek = lo;
      $("tlRange").textContent = TEXT.fmtDate(lo) + " ~ " + md(hi - DAY);
      $("tlNext").disabled = hi > Date.now() + DAY;
      $("tlFilter").querySelectorAll(".chip[data-f]").forEach(b => b.classList.toggle("on", fOf(b) === tlFilter));
      let sum = null;
      try { sum = await APP.weekSummary(scopeId(), lo); } catch (e) { console.error(e); }
      if (seq !== seqTl) return;
      $("tlWeek").innerHTML = '<div class="kicker">이번 주 배운 것</div><div class="narr" style="margin-top:8px">' + esc(sum ? sum.text : "—") + '</div>';
      let events = [];
      try { events = await DB.range("events", "at", lo, hi - 1); }
      catch (e) { try { events = (await DB.all("events")).filter(x => x.at >= lo && x.at < hi); } catch (e2) { events = []; } }
      if (seq !== seqTl) return;
      const one = oneId();
      if (one) events = events.filter(e => e.teacherId === one);
      let notes = [];
      try { notes = await NOTES.list({ teacherId: scopeId() }); } catch (e) { notes = []; }
      if (seq !== seqTl) return;
      const inWeek = (t) => t >= lo && t < hi;
      const noteById = new Map(notes.map(n => [n.id, n]));
      const rows = [];
      const skip = new Set();
      notes.forEach(n => { if ((n.kind === "daily" || n.kind === "weekly") && (inWeek(n.createdAt || 0) || inWeek(n.updatedAt || 0))) skip.add(n.id); });
      const seenNote = new Set(), seenKey = new Map();
      events.forEach(e => {
        const ref = e.ref || {}, rid = ref.noteId || (String(ref.id || "").indexOf("n_") === 0 ? ref.id : "");
        if (rid) { if (skip.has(rid)) return; seenNote.add(rid); }
        const kind = e.kind || "edit", at = e.at || 0;
        const key = kind + "|" + (ref.id || rid || "") + "|" + (e.msg || "");     // 같은 일이 두 번 기록돼도 한 줄로 (1분 안)
        const prev = seenKey.get(key); if (prev !== undefined && Math.abs(at - prev) < 60000) return;
        seenKey.set(key, at);
        rows.push({ at, ev: kind, group: EV_GROUP[kind] || "edit", label: EV_LABEL[kind] || String(kind).toUpperCase(), msg: e.msg || "", ref: ref.id || ref.examId || ref.noteId || "", teacherId: e.teacherId || null });
      });
      notes.forEach(n => {
        const at = inWeek(n.updatedAt || 0) ? n.updatedAt : (inWeek(n.createdAt || 0) ? n.createdAt : 0);
        if (!at) return;
        if (n.kind === "anchor") return;
        if (!skip.has(n.id) && seenNote.has(n.id)) return;
        const log = n.kind === "daily" || n.kind === "weekly";
        rows.push({ at, ev: n.kind === "ask" ? "ask" : "note", group: n.kind === "ask" ? "ask" : "note",
          label: n.kind === "daily" ? "✎ 오늘 로그" : n.kind === "weekly" ? "✎ 주간 회고" : n.kind === "ask" ? "ASK" : "NOTE",
          msg: log ? (NOTES.excerpt(n.body, 70) || n.date || "") : NOTES.titleOf(n), ref: n.id, teacherId: n.teacherId });
      });
      const show = rows.filter(r => !tlFilter || r.group === tlFilter).sort((a, b) => b.at - a.at);
      const days = new Map();
      show.forEach(r => { const d = TEXT.fmtDate(r.at); if (!days.has(d)) days.set(d, []); days.get(d).push(r); });
      const all = APP.isAll();
      $("tlDays").innerHTML = [...days.entries()].map(([d, list]) => {
        const dt = new Date(d + "T00:00:00");
        return '<div class="tlDay" data-day="' + esc(d) + '"><h5>' + esc(md(dt.getTime()) + " (" + WD[dt.getDay()] + ")") + '</h5>' + list.map(r => {
          const tn = all && r.teacherId && T(r.teacherId) ? T(r.teacherId).name + " · " : "";
          const title = r.ref ? (INDEX.get(r.ref) ? INDEX.get(r.ref).title : (noteById.get(r.ref) ? NOTES.titleOf(noteById.get(r.ref)) : "")) : "";
          return '<div class="ev" data-ev="' + esc(r.ev) + '" data-ref="' + esc(r.ref || "") + '"><span class="num">' + esc(hm(r.at)) + '</span>' + kindTag(EV_KIND[r.ev] || "note") + '<span class="t"><b class="en">' + esc(r.label) + '</b> ' + esc(tn + clip(r.msg, 90)) + '</span>' + (r.ref ? '<a class="small" href="' + esc(ROUTE.note(r.ref)) + '" data-id="' + esc(r.ref) + '">' + esc(clip(title || "열기", 24)) + '</a>' : '<span></span>') + '</div>';
        }).join("") + '</div>';
      }).join("");
      $("tlEmpty").hidden = show.length > 0;
      $("tlDays").querySelectorAll(".ev[data-ref]").forEach(el => { const id = el.dataset.ref; if (id) el.onclick = (e) => { if (e.target.closest("a")) return; ROUTE.go(ROUTE.note(id)); }; });
    }
    function goWeek(ms) { const w = TEXT.fmtDate(ms); ROUTE.go(ROUTE.href({ view: "timeline", query: APP.weekStartOf(ms) === APP.weekStartOf(Date.now()) ? {} : { week: w } })); }
    function bindTl() {
      if (boundTl) return; boundTl = true;
      $("tlPrev").onclick = () => goWeek(tlWeek - 7 * DAY);
      $("tlNext").onclick = () => goWeek(tlWeek + 7 * DAY);
      $("tlFilter").addEventListener("click", (e) => { const b = e.target.closest(".chip[data-f]"); if (!b) return; tlFilter = fOf(b); timelineView(tlWeek === APP.weekStartOf(Date.now()) ? "" : TEXT.fmtDate(tlWeek)); });
      $("tlToday").onclick = async () => {
        try { const doc = await NOTES.ensureDaily(TEXT.fmtDate(), oneId()); APP.emit("note", { id: doc.id, op: "create" }); ROUTE.go(ROUTE.note(doc.id)); }
        catch (e) { console.error(e); UI.toast("오늘 로그를 열지 못했어요", { bad: true }); }
      };
      $("tlRetro").onclick = async () => {
        const wk = TEXT.fmtDate(tlWeek);
        try {
          let doc = await NOTES.weekly(wk, oneId());
          if (!doc) {
            let sum = null; try { sum = await APP.weekSummary(scopeId(), tlWeek); } catch (e) {}
            const body = "**" + wk + " ~ " + md(tlWeek + 6 * DAY) + " 주간 회고**\n\n" + (sum ? sum.text : "") + "\n\n- 잘된 것:\n- 아쉬운 것:\n- 다음 주에 할 것:\n";
            doc = await NOTES.create({ kind: "weekly", date: wk, teacherId: oneId(), title: "주간 회고 " + wk, body, source: { kind: "retro" } });
            APP.emit("note", { id: doc.id, op: "create" });
          }
          ROUTE.go(ROUTE.note(doc.id));
        } catch (e) { console.error(e); UI.toast("회고를 만들지 못했어요", { bad: true }); }
      };
    }

    // ================= 물어보기 (§2.14 · §3.6) =================
    const askS = { bound: false, runKey: "", force: false, ctrl: null, running: false, q: "", ctxId: "", scope: null, lastSel: null, result: null, savedId: "", msgEl: null };
    function askScopeId() {
      if (askS.lastSel !== S.selectedId) { askS.lastSel = S.selectedId; askS.scope = null; }     // 선생님을 바꾸면 범위도 따라간다
      if (askS.scope) return askS.scope;
      const u = UI.ui2().askScope;
      return (S.selectedId || (u && (u === APP.ALL || S.teachers.has(u)) ? u : "") || APP.ALL);
    }
    function askView(query) {
      bindAsk();
      query = query || {};
      const q = String(query.q || "").trim(), ctx = String(query.ctx || "").trim();
      askS.ctxId = ctx;
      renderAskScope(); renderAskCtx(ctx); updateAskEnabled(); renderAskHistory();
      const key = q + "|" + ctx + "|" + askScopeId();
      // 주소에 질문이 있다고 저절로 묻지는 않는다 — 보낸다는 몸짓(#askGo · ⏎ · 오늘 화면 · 후속 질문)이 있을 때만 (§3.6)
      if (q && askS.force) { askS.force = false; askS.runKey = key; runAsk(q, ctx); }
      else if (q) { const el = $("askInput"); if (!el.value.trim() && document.activeElement !== el) el.value = q; }   // 묻지 않을 때는 적어도 글을 잃지 않게 채워 둔다
    }
    function renderAskScope() {
      const selEl = $("askScope"), cur = askScopeId();
      const html = [...S.teachers.values()].map(t => '<option value="' + esc(t.id) + '"' + (t.id === cur ? " selected" : "") + '>' + esc(t.name) + ' · ' + esc(t.subject || "") + '</option>').join("") + '<option value="*"' + (cur === APP.ALL ? " selected" : "") + '>모든 선생님</option>';
      if (selEl.dataset.sig !== html.length + "|" + cur) { selEl.innerHTML = html; selEl.value = cur; selEl.dataset.sig = html.length + "|" + cur; }
    }
    function renderAskCtx(ctx) {
      const chip = $("askCtx");
      if (!ctx) { chip.hidden = true; return; }
      const d = INDEX.get(ctx);
      chip.hidden = false;
      chip.querySelector(".t").textContent = (d && d.title) || (LINKS.title ? LINKS.title(ctx) : "") || ctx;
    }
    function updateAskEnabled() {
      const ready = API.ready(), idx = INDEX.state.ready;
      $("askGo").disabled = askS.running || !ready || !idx;
      $("askStop").hidden = !askS.running;
      if (askS.running) return;
      $("askStatus").innerHTML = !ready ? '두뇌를 부르려면 API 키가 필요해요 — <button type="button" class="link" data-askkey="1">설정 열기</button>' : !idx ? "색인이 끝나면 물을 수 있어요" : "";
      const kb = $("askStatus").querySelector("[data-askkey]"); if (kb) kb.onclick = () => UI.openSettings("engine");
    }
    function waitIndex(ms) {
      return new Promise((res) => {
        const t0 = Date.now();
        const tick = () => { if (INDEX.state.ready) return res(true); if (Date.now() - t0 > (ms || 20000)) return res(false); setTimeout(tick, 300); };
        tick();
      });
    }
    // 좁은 화면에서는 문서가, 넓은 화면에서는 #main 이 스크롤 컨테이너다 (§2.3)
    function scrollDown() { try { if (document.body.classList.contains("narrow")) window.scrollTo(0, document.body.scrollHeight); else $("main").scrollTop = $("main").scrollHeight; } catch (e) {} }
    function askMsg(cls, html) { const el = h('<div class="msg ' + cls + '">' + html + '</div>'); $("askLog").appendChild(el); scrollDown(); return el; }
    const liveCites = (body) => esc(body).replace(/\[(\d{1,2}(?:\s*,\s*\d{1,2})*)\]/g, (m, ns) => ns.split(",").map(s => '<span class="cite">' + esc(s.trim()) + '</span>').join(""));
    async function runAsk(q, ctxId) {
      if (askS.running) {
        // 앞 질문이 아직 스트리밍 중이다 — 조용히 버리지 않고, 친 글을 입력칸에 돌려주고 무엇을 할지 묻는다
        const el = $("askInput"); if (el && !el.value.trim()) el.value = q;
        UI.toast("앞 질문에 답하는 중이에요", { action: "중단하고 새로 묻기", onAction: () => { if (askS.ctrl) { try { askS.ctrl.abort(); } catch (e) {} } setTimeout(() => submitAsk(q, ctxId), 250); } });
        return;
      }
      if (!API.ready()) { updateAskEnabled(); UI.toast("먼저 API 키를 저장해 주세요", { action: "설정 열기", onAction: () => UI.openSettings("engine") }); return; }
      if (!INDEX.state.ready) { $("askStatus").textContent = "색인이 끝나면 물을 수 있어요"; const ok = await waitIndex(); if (!ok) { updateAskEnabled(); return; } }
      const scope = askScopeId();
      askS.running = true; askS.q = q; askS.result = null; askS.savedId = "";
      $("askEmpty").hidden = true; $("askCites").innerHTML = ""; $("askSave").hidden = true; $("askAgain").hidden = true;
      updateAskEnabled();
      askMsg("me", esc(q));
      const box = askMsg("brain", '<span class="small">…</span>');
      askS.msgEl = box;
      const ctrl = new AbortController(); askS.ctrl = ctrl;
      let r = null;
      try {
        r = await ASK.run(q, {
          teacherId: scope, ctxId: ctxId || null, signal: ctrl.signal, light: S.ui.askLight !== false, k: S.ui.askK || 12,
          onStatus: (phase, info) => {
            const s = $("askStatus");
            if (phase === "gather") s.textContent = "근거 모으는 중";
            else if (phase === "found") s.textContent = (info.n || 0) + "개 찾음";
            else if (phase === "answer") s.textContent = "답 쓰는 중";
            else s.textContent = "";
          },
          onText: (t) => { const body = ASK.parseAnswer(t.text || "").body; box.innerHTML = liveCites(body) || '<span class="small">…</span>'; },
        });
      } catch (e) {
        console.error(e);
        box.innerHTML = '<span class="bad">' + esc(API.friendly(e)) + '</span>';
        askS.running = false; askS.ctrl = null; $("askStatus").textContent = ""; updateAskEnabled();
        if (e && (e.code === "no_key" || e.code === "bad_key")) UI.openSettings("engine");
        return;
      }
      askS.running = false; askS.ctrl = null; askS.result = r;
      $("askStatus").textContent = "";
      if (r.noEvidence) {
        box.remove(); askS.msgEl = null;
        $("askEmpty").hidden = false;
        $("askCost").textContent = "근거 0 · 모델을 부르지 않았어요";
        updateAskEnabled();
        return;
      }
      box.innerHTML = ASK.renderCites(esc(r.answer || ""), r.evidence) + (r.aborted ? ' <span class="badge warn">중단됨</span>' : "")
        + ((r.followups || []).length ? '<div style="margin-top:8px">' + r.followups.map(f => '<button type="button" class="followup" data-follow="' + esc(f) + '">' + esc(f) + '</button>').join("") + '</div>' : "");
      renderAskCites(r);
      $("askCost").textContent = "근거 " + (r.evidence || []).length + " · 약 " + (r.chars || 0).toLocaleString() + "자 · 이번 세션 질문 " + ASK.stats.calls + "회";
      $("askSave").hidden = false; $("askAgain").hidden = false;
      updateAskEnabled();
      try {
        const doc = await ASK.save({ question: q, result: r, teacherId: scope, ctxId: ctxId || null, author: APP.author() });
        askS.savedId = doc.id;
        APP.emit("ask", { id: doc.id });
      } catch (e) { console.error(e); }
    }
    function renderAskCites(r) {
      const ev = r.evidence || [], used = new Set(r.used || []), inv = (r.invalid || []).filter(n => !ev.some(e => e.n === n));
      $("askCites").innerHTML = '<div class="kicker" style="margin:8px 0 6px">근거 ' + ev.length + '</div>'
        + ev.map(e => '<button type="button" class="chip' + (used.has(e.n) ? "" : " dim unused") + '" data-cite="' + esc(e.id) + '" data-n="' + e.n + '" data-prev="' + esc(clip(e.text || "", 200)) + '" title="' + esc(clip(e.text || "", 200)) + '">[' + e.n + '] ' + esc(e.kindLabel || KL[e.kind] || "") + ' · ' + esc(clip(e.title || "", 30)) + (e.flag ? ' ' + esc(e.flag) : "") + '</button>').join(" ")
        + (inv.length ? '<div class="small dashed" style="margin-top:6px">근거에 없는 번호: ' + inv.map(n => '<span class="cite dashed">' + n + '</span>').join(" ") + '</div>' : "");
      $("askCites").querySelectorAll("[data-cite]").forEach(b => b.onclick = () => ROUTE.go(ROUTE.note(b.dataset.cite)));
    }
    async function renderAskHistory() {
      const box = $("askHistory");
      let list = [];
      try { list = await ASK.history(askScopeId(), 8); } catch (e) { list = []; }
      box.innerHTML = list.length ? '<div class="kicker" style="margin:8px 0">지난 질문</div><div class="cards">' + list.map(n => ncard(n.id, "ask", (n.ask && n.ask.question) || NOTES.titleOf(n), clip(n.body, 60), n.updatedAt)).join("") + '</div>' : "";
    }
    function submitAsk(q, ctx) {
      q = String(q || "").trim(); if (!q) return;
      askS.force = true;
      const was = location.hash;
      ROUTE.go(ROUTE.href({ view: "ask", query: { q, ctx: ctx === undefined ? askS.ctxId : ctx } }));
      if (location.hash === was) askView(ROUTE.current().query || {});      // 같은 주소면 라우터가 깨지 않는다 — 여기서 바로 묻는다
    }
    function bindAsk() {
      if (askS.bound) return; askS.bound = true;
      $("askGo").onclick = () => { const el = $("askInput"); const q = el.value.trim(); if (!q) return; el.value = ""; submitAsk(q); };
      $("askStop").onclick = () => { if (askS.ctrl) { try { askS.ctrl.abort(); } catch (e) {} } };
      $("askInput").addEventListener("keydown", (e) => {
        if (e.isComposing || e.keyCode === 229) return;
        if (e.defaultPrevented || e.altKey) return;
        if (e.key === "Enter" && (!e.shiftKey || e.metaKey || e.ctrlKey)) { e.preventDefault(); const el = $("askInput"); const q = el.value.trim(); if (q) { el.value = ""; submitAsk(q); } }
      });
      const aef = $("askEmptyFiles"); if (aef) aef.onclick = () => UI.openPickSheet();      // 근거 0 → 바로 자료를 넣을 수 있게 (§3.6 8)
      $("askScope").addEventListener("change", () => { askS.scope = $("askScope").value; UI.ui2set({ askScope: askS.scope }); renderAskHistory(); });
      $("askCtxClear").onclick = () => { askS.runKey = String(askS.q || "") + "||" + askScopeId(); ROUTE.go(ROUTE.href({ view: "ask", query: askS.q ? { q: askS.q } : {} }), { replace: true }); };
      $("askSave").onclick = () => { if (askS.savedId) ROUTE.go(ROUTE.note(askS.savedId)); else UI.toast("저장 중이에요 — 잠시 뒤에 다시 눌러 주세요"); };
      $("askAgain").onclick = () => submitAsk(askS.q);
      $("askLog").addEventListener("click", (e) => {
        const f = e.target.closest("[data-follow]"); if (f) { submitAsk(f.dataset.follow); return; }
        const c = e.target.closest(".cite[data-id]"); if (c && c.dataset.id) ROUTE.go(ROUTE.note(c.dataset.id));
      });
      const pop = $("citePop");
      const showPop = (el) => {
        // 미리보기 글은 그릴 때 칩에 박아 둔다 — askS.result 는 늘 마지막 질문 것이라, 로그에 남은 지난 답의 칩에 엉뚱한 근거가 뜬다
        let txt = el.dataset.prev || "";
        if (!txt) { const r = askS.result; const e2 = r && (r.evidence || []).find(x => x.n === +el.dataset.n); txt = e2 ? clip(e2.text || "", 200) : ""; }
        if (!txt) return;
        pop.textContent = txt;
        pop.hidden = false;
        const b = el.getBoundingClientRect();
        pop.style.left = Math.max(8, Math.min(b.left, window.innerWidth - 372)) + "px";
        pop.style.top = (b.bottom + 6 + 120 > window.innerHeight ? Math.max(8, b.top - 126) : b.bottom + 6) + "px";
      };
      const hide = () => { pop.hidden = true; };
      ["askLog", "askCites"].forEach(id => {
        $(id).addEventListener("mouseover", (e) => { const el = e.target.closest("[data-n]"); if (el) showPop(el); });
        $(id).addEventListener("mouseout", (e) => { if (e.target.closest("[data-n]")) hide(); });
      });
    }

    // ================= 검색 (#vSearch) =================
    let boundSearch = false, seqSearch = 0;
    function searchView(q) {
      bindSearch();
      q = String(q || "");
      const el = $("searchQ"); if (document.activeElement !== el) el.value = q;
      const seq = ++seqSearch;
      if (!q.trim()) { $("searchList").innerHTML = '<div class="empty"><b>무엇을 찾을까요</b>제목 · 본문 · 메모 · 태그를 한 번에 찾아요 (⌘K 로도 열려요)</div>'; $("searchGrep").innerHTML = ""; return; }
      if (!INDEX.state.ready) { $("searchList").innerHTML = '<div class="empty">색인 중이에요 — 잠시 뒤에 다시 찾아 주세요</div>'; $("searchGrep").innerHTML = ""; setTimeout(() => { if (seq === seqSearch) searchView(q); }, 600); return; }
      let hits = [];
      try { hits = INDEX.search(q, { teacherId: scopeId(), limit: 40 }); } catch (e) { hits = []; }
      $("searchList").innerHTML = hits.length
        ? '<div class="kicker" style="margin-bottom:8px">노트 ' + hits.length + '</div><div class="cards">' + hits.map(r => ncard(r.id, r.handout ? "handout" : (r.noteKind === "ask" ? "ask" : r.kind), r.title, clip(r.snippet || r.sub || "", 90), r.updatedAt)).join("") + '</div>'
        : '<div class="empty"><b>찾은 것이 없어요</b>검색어를 바꾸거나 자료를 넣어 주세요</div>';
      let greps = [];
      const quoted = /^["“”'‘’].*["“”'‘’]$/.test(q.trim());
      if (q.trim().length >= 12 || quoted) { try { greps = INDEX.grep(q, { teacherId: scopeId(), limit: 20 }); } catch (e) { greps = []; } }
      $("searchGrep").innerHTML = greps.length
        ? '<div class="kicker" style="margin:16px 0 8px">원문에서 ' + greps.length + '</div><div class="cards">' + greps.map(r => '<a class="ncard" href="' + esc(ROUTE.note(r.id) + "?at=" + r.pos) + '" data-id="' + esc(r.id) + '" data-pos="' + r.pos + '">' + kindTag(r.kind) + '<span class="t">' + esc(r.title || "") + '</span><span class="small">' + r.pos + '</span><span class="s">' + esc(clip(r.snippet || "", 120)) + '</span></a>').join("") + '</div>'
        : "";
    }
    function bindSearch() {
      if (boundSearch) return; boundSearch = true;
      let t = 0;
      $("searchQ").addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { const v = $("searchQ").value; ROUTE.go(ROUTE.href({ view: "search", query: v ? { q: v } : {} }), { replace: true }); }, 220); });
      $("searchQ").addEventListener("keydown", (e) => { if (e.isComposing || e.keyCode === 229) return; if (e.key === "Enter") { e.preventDefault(); const v = $("searchQ").value; ROUTE.go(ROUTE.href({ view: "search", query: v ? { q: v } : {} }), { replace: true }); } });
    }

    // ================= 라우트에 맞는 뷰 하나만 =================
    function renderAll(route) {
      const r = route || ROUTE.current(); if (!r) return;
      try {
        switch (r.view) {
          case "today": return todayView();
          case "inbox": return inboxView();
          case "tag": return tagView(r.name);
          case "library": return libraryView(r.kind, r.query || {});
          case "timeline": return timelineView((r.query || {}).week || "");
          case "ask": return askView(r.query || {});
          case "search": return searchView((r.query || {}).q || "");
        }
      } catch (e) { console.error(e); }
    }

    return { today: todayView, inbox: inboxView, queueHtml, bindQueue, library: libraryView, tag: tagView, timeline: timelineView, ask: askView, search: searchView, renderAll,
             submitAsk, askState: () => askS, libState: () => ({ kind: libKind, query: libQuery }) };
  })();
