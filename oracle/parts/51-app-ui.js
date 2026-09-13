  // ==================================================================
  //  UI — 패널·드로어·시트·독·토스트·칩·드래그앤드롭·키보드·2D 폴백·시험지 미리보기
  // ==================================================================
  const UI = (function () {
    const $ = (id) => document.getElementById(id), esc = TEXT.esc, S = APP.state;
    const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };
    const pct = (v) => Math.round((+v || 0) * 100) + "%";
    const T = (id) => APP.teacher(id);
    const sel = () => S.selectedId ? T(S.selectedId) : null;
    let drawerStack = [], pendingFiles = null, dropTarget = null, menu = null, paperMock = null;

    // ---- 토스트 ----
    function toast(msg, o) {
      o = o || {};
      const el = h('<div class="toast' + (o.bad ? " bad" : o.ok ? " ok" : "") + '"><span>' + esc(msg) + '</span></div>');
      if (o.action) { const b = h('<button type="button">' + esc(o.action) + '</button>'); b.onclick = () => { el.remove(); o.onAction && o.onAction(); }; el.appendChild(b); }
      $("toasts").appendChild(el);
      setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 300); }, o.ms || (o.action ? 9000 : 4200));
      return el;
    }
    // ---- 시트 ----
    function openSheet(title, bodyEl, o) {
      $("sheetTitle").textContent = title; const b = $("sheetBody"); b.innerHTML = ""; b.appendChild(bodyEl);
      $("sheetWrap").classList.add("on"); $("sheetWrap").dataset.kind = (o && o.kind) || "";
      const f = b.querySelector("input, select, textarea"); if (f) setTimeout(() => f.focus(), 50);
    }
    function closeSheet() { $("sheetWrap").classList.remove("on"); $("sheetWrap").dataset.kind = ""; pendingFiles = null; }
    // ---- 드로어 ----
    function openDrawer(kind, id, push) {
      if (!push) drawerStack = [];
      drawerStack.push({ kind, id });
      renderDrawer();
      $("drawer").classList.add("on");
    }
    function closeDrawer() { $("drawer").classList.remove("on"); drawerStack = []; }
    function drawerBack() { drawerStack.pop(); if (!drawerStack.length) closeDrawer(); else renderDrawer(); }

    // ================= 아이콘 =================
    const ICONS = {
      mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
      brain: '<svg viewBox="0 0 24 24"><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 3 3 3 0 0 0 2 3v1a3 3 0 0 0 3 3h1V4H9zM15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 3 3 3 0 0 1-2 3v1a3 3 0 0 1-3 3h-1V4h1z"/></svg>',
      gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
      wifi: '<svg viewBox="0 0 24 24"><path d="M2 8.5a16 16 0 0 1 20 0M5.5 12a11 11 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0M12 19h.01"/></svg>',
      shield: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
      globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
      doc: '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
      chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
      target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
      print: '<svg viewBox="0 0 24 24"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7"/></svg>',
      plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
      up: '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
      out: '<svg viewBox="0 0 24 24"><path d="M4 17v3h16v-3M12 4v12M7 9l5-5 5 5"/></svg>',
      bolt: '<svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>',
      eye: '<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    };
    const irow = (ic, label, sub, st, cls, attrs) => '<div class="irow' + (cls ? " " + cls : "") + '"' + (attrs || "") + '><span class="ic">' + (ICONS[ic] || "") + '</span><span class="lb">' + esc(label) + (sub ? '<small>' + esc(sub) + '</small>' : "") + '</span>' + (st !== undefined ? '<span class="st ' + (st.cls || "") + '">' + esc(st.text) + '</span>' : "") + '</div>';

    // ================= 왼쪽: SYSTEM STATUS =================
    async function renderStatus() {
      const body = $("statusBody"), t = sel();
      $("btnEditTeacher").hidden = !t;
      if (!t) { body.innerHTML = '<div class="empty"><b>선생님을 골라 주세요</b>가운데 홀로그램을 누르거나 아래 목록에서 고르세요</div>' + teacherListHtml(); bindTeacherList(body); return; }
      const c = S.counts.get(t.id) || {}, p = S.profiles.get(t.id), pr = S.predictions.get(t.id), busy = S.busy.get(t.id);
      const job = S.queue.find(j => j.teacherId === t.id && !["done", "error", "cancelled", "queued"].includes(j.stage));
      const cloud = SYNC.st;
      const ST = (on, txt, cls) => ({ text: txt, cls: cls || (on ? "" : "off") });
      let html = '<div class="row" style="margin-bottom:8px"><i class="dot" style="width:10px;height:10px;border-radius:50%;background:' + t.color + ';box-shadow:0 0 10px ' + t.color + '"></i><b style="font-family:var(--fk);font-size:15px">' + esc(t.name)
        + '</b><span class="chip dim">' + esc(t.subject) + '</span><span class="grow"></span><span class="badge">' + (p ? "V" + p.version : "V0") + '</span></div>';
      html += irow("doc", "문항 데이터화", (c.questions || 0) + "문항 · 기출 " + (c.exams || 0) + "건", job && ["analyze", "ocr", "extract"].includes(job.stage) ? ST(1, "WORKING", "busy") : ST(c.questions, c.questions ? "ONLINE" : "STANDBY"));
      html += irow("globe", "지문 매칭", "범위 지문 " + (c.passages || 0) + "개 · 매칭 " + (c.matchable ? Math.round(c.matched / c.matchable * 100) + "%" : "—"), job && ["match", "index"].includes(job.stage) ? ST(1, "WORKING", "busy") : ST(c.passages, c.passages ? "ONLINE" : "STANDBY"));
      html += irow("brain", "성향 학습", p ? "프로파일 V" + p.version + " · " + p.profile.level.name + " Lv." + p.profile.level.id + " · 신뢰도 " + p.profile.reliability : "아직 학습 전", busy === "학습 중" ? ST(1, "LEARNING", "busy") : ST(p, p ? "ONLINE" : "STANDBY"));
      html += irow("target", "다음 시험 예측", pr ? pr.target.label + " · 신뢰도 " + pct(pr.blueprint.confidence.overall) : "예측 전", busy === "예측 중" ? ST(1, "WORKING", "busy") : ST(pr, pr ? "READY" : "STANDBY"));
      html += irow("print", "프린트 반영율", p && p.profile.handout ? "프린트 → 시험 " + pct(p.profile.handout.rate) + " (시험 " + p.profile.handout.nExams + "개)" : (c.sources ? "프린트를 넣으면 계산해요" : "선생님 프린트 없음"), ST(p && p.profile.handout, p && p.profile.handout ? pct(p.profile.handout.rate) : "STANDBY", p && p.profile.handout ? "warn" : "off"));
      html += irow("wifi", "클라우드 (Supabase)", cloud.enabled ? "작업공간 " + cloud.workspace + (cloud.lastSync ? " · " + TEXT.fmtDate(cloud.lastSync) : "") : "동기화 꺼짐", cloud.enabled ? (cloud.status === "error" ? ST(1, "OFFLINE", "warn") : cloud.status === "syncing" || cloud.pending ? ST(1, "SYNCING", "busy") : ST(1, "ONLINE")) : ST(0, "OFF"));
      html += irow("shield", "엔진", API.ready() ? API.providerName() + " · " + API.modelLabel() : "API 키 없음", ST(API.ready(), API.ready() ? "ONLINE" : "NO KEY", API.ready() ? "" : "warn"));
      if (S.teachers.size > 1) html += '<div class="sec" style="margin-top:10px"><h4>Teachers</h4>' + teacherListHtml() + '</div>';
      body.innerHTML = html;
      bindTeacherList(body);
    }
    function teacherListHtml() { return '<div class="tlist">' + [...S.teachers.values()].map(x => '<div class="it' + (x.id === S.selectedId ? " on" : "") + '" data-sel="' + x.id + '"><i class="dot" style="background:' + x.color + ';color:' + x.color + '"></i><span class="grow">' + esc(x.name) + ' <span class="small">' + esc(x.subject) + '</span></span><span class="small">' + ((S.counts.get(x.id) || {}).questions || 0) + ' Q</span></div>').join("") + '</div>'; }
    function bindTeacherList(root) { root.querySelectorAll("[data-sel]").forEach(el => el.onclick = () => APP.select(el.dataset.sel)); }

    // ================= 왼쪽: GLOBAL INTELLIGENCE (프로파일 요약 · 타임라인 · 큐) =================
    async function renderIntel() {
      const body = $("intelBody"), t = sel(); const p = t && S.profiles.get(t.id);
      $("profVer").textContent = p ? "PROFILE V" + p.version : "";
      if (!t) { body.innerHTML = '<div class="empty">선생님을 고르면 출제 성향과 기출 목록이 여기에 나와요</div>' + queueHtml(); bindQueue(body); return; }
      const c = S.counts.get(t.id) || {};
      const [exams, sources] = await Promise.all([DB.where("exams", "teacherId", t.id), DB.where("sources", "teacherId", t.id)]);
      exams.sort((a, b) => TEXT.examTime(b.meta) - TEXT.examTime(a.meta));
      let html = '<div id="globeWrap"><canvas id="globe" width="192" height="192"></canvas><div>';
      if (p) { const P = p.profile; const top = Object.keys(P.typeDist).slice(0, 5); html += top.map(k => '<div class="irow" style="grid-template-columns:1fr auto;padding:2px 0"><span class="lb" style="font-size:12px">' + esc(k) + '</span><span class="st" style="color:var(--holo2)">' + pct(P.typeDist[k].wshare) + '</span></div>').join(""); }
      else html += '<div class="small">기출 시험지를 넣고 학습하면<br>유형 분포가 여기에 떠요</div>';
      html += '</div></div>';
      if (p) {
        const P = p.profile, n = p.narrative;
        html += '<div class="sec" style="margin-top:10px"><h4>요약 <span>' + esc(P.level.name) + ' · 신뢰도 ' + P.reliability + '</span></h4>' + (n ? '<div class="narr" style="font-size:12px">' + esc(n.text) + '</div><div class="chips" style="margin-top:6px">' + n.keywords.map(k => '<span class="chip">' + esc(k) + '</span>').join("") + '</div>' : '<div class="small">API 키가 있으면 서술을 만들어요</div>') + '</div>';
        html += '<div class="sec"><h4>습관</h4><div class="kv"><b>시험당</b><span>' + P.totalQuestionsAvg + '문항 · ' + P.totalPointsAvg + '점 · 서술형 ' + P.subjectiveAvg + '</span><b>난이도</b><span>상 ' + pct(P.difficultyCurve.mix.상) + ' · 중 ' + pct(P.difficultyCurve.mix.중) + ' · 하 ' + pct(P.difficultyCurve.mix.하) + '</span>' + (P.grammarPoints.length ? '<b>어법</b><span>' + P.grammarPoints.slice(0, 4).map(g => esc(g.point) + " " + pct(g.wshare)).join(" · ") + '</span>' : "") + (P.transformationPrefs.빈칸 ? '<b>빈칸</b><span>' + Object.keys(P.transformationPrefs.빈칸.blankPosition).slice(0, 2).map(k => k + " " + pct(P.transformationPrefs.빈칸.blankPosition[k])).join(", ") + '</span>' : "") + '<b>지문</b><span>' + P.passagePref.wordsMean + '±' + P.passagePref.wordsSd + '단어 · 재출제 ' + pct(P.passagePref.reuseRate) + ' · 범위 밖 ' + pct(P.externalRatio) + '</span>' + (P.setHabits.setsPerExam ? '<b>세트</b><span>시험당 ' + P.setHabits.setsPerExam + '개' + (P.setHabits.typicalRange ? ' · ' + esc(P.setHabits.typicalRange) + '번' : "") + '</span>' : "") + '<b>발문</b><span>' + (Object.keys(P.stemSignature.honorific)[0] || "") + '체 · 평가원 유사도 ' + P.stemSignature.kiceLikeMean + '</span></div></div>';
        if (P.ai && P.ai.mean !== null) html += '<div class="sec"><h4>AI 활용 추정 <span title="' + esc(ANALYZE.AI_DISCLAIMER) + '">참고용 ⓘ</span></h4><div class="bar gold"><i style="width:' + Math.round(P.ai.mean * 100) + '%"></i></div><div class="small">' + pct(P.ai.mean) + ' · ' + (P.ai.mean < 0.3 ? "낮음" : P.ai.mean < 0.6 ? "중간" : "높음") + ' — 문체·선지 균일도 등 정황만으로 추정한 값이에요</div></div>';
        if (p.delta && p.delta.length) html += '<details class="raw"><summary>이번 판에서 달라진 점 ' + p.delta.length + '</summary><div class="note">' + p.delta.map(esc).join("<br>") + '</div></details>';
      } else if (!exams.length && !sources.length) html += '<div class="empty"><b>아직 파일이 없어요</b>기출 시험지 · 시험범위 원문 · 선생님 프린트를<br>홀로그램에 끌어다 놓으세요</div>';
      html += '<div class="sec" style="margin-top:10px"><h4>Timeline <span>' + exams.length + ' 시험 · ' + sources.length + ' 자료</span></h4><div class="tl">';
      html += exams.map(e => { const low = c.passages && e.analysis.total && e.matched / e.analysis.total < 0.5; const badge = e.status === "error" ? '<span class="badge bad">ERROR</span>' : low ? '<span class="badge warn">LOW MATCH</span>' : e.learnedInVersion ? '<span class="badge ok">LEARNED</span>' : '<span class="badge">ANALYZED</span>';
        return '<div class="it" data-exam="' + e.id + '"><span class="t">' + esc(e.title) + '</span>' + badge + '<span class="s">' + (e.analysis.total || 0) + '문항 · ' + esc(e.file.name) + (e.ai ? ' · AI ' + pct(e.ai.aiLikelihood) : "") + (e.reflection ? ' · 프린트 반영 ' + pct(e.reflection.rate) : "") + '</span></div>'; }).join("");
      html += sources.map(s => '<div class="it" data-src="' + s.id + '"><span class="t">' + (s.kind === "프린트" ? "프린트 · " : "범위 · ") + esc(s.name) + '</span><span class="badge' + (s.kind === "프린트" ? " warn" : "") + '">' + (s.kind === "프린트" ? (s.reflection ? "HIT " + pct(s.reflection.rate) : "PRINT") : esc(s.kind)) + '</span><span class="s">지문 ' + s.passages + '개' + (s.items ? ' · 포인트 ' + s.items.length : "") + ' · ' + esc(s.file.name) + '</span></div>').join("");
      html += '</div></div>' + queueHtml(t.id);
      body.innerHTML = html;
      body.querySelectorAll("[data-exam]").forEach(el => el.onclick = () => openDrawer("exam", el.dataset.exam));
      body.querySelectorAll("[data-src]").forEach(el => el.onclick = () => openDrawer("source", el.dataset.src));
      bindQueue(body);
      drawGlobe(p ? p.profile : null, t.color);
    }
    // 점으로 그린 지구본 — 유형 분포가 위도 띠로 보인다
    let globeT = 0, globeData = null, globeColor = "#5fc8ff";
    function drawGlobe(P, color) { globeData = P; globeColor = color || "#5fc8ff"; }
    function globeLoop() {
      const cv = $("globe"); if (cv && cv.offsetParent !== null) {
        const ctx = cv.getContext("2d"), W = cv.width, R = W * 0.44, cx = W / 2, cy = W / 2; ctx.clearRect(0, 0, W, W); globeT += APP.calm() ? 0.002 : 0.012;
        ctx.strokeStyle = "rgba(95,200,255,.35)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
        const shares = globeData ? Object.values(globeData.typeDist).map(x => x.wshare) : [];
        for (let lat = -75; lat <= 75; lat += 15) { const band = Math.floor((lat + 90) / 15); const w = shares.length ? (shares[band % shares.length] || 0) * 4 : 0.5; const r = Math.cos(lat * Math.PI / 180) * R, y = cy - Math.sin(lat * Math.PI / 180) * R;
          for (let lon = 0; lon < 360; lon += 12) { const a = (lon + globeT * 60) * Math.PI / 180; const x = cx + Math.cos(a) * r, z = Math.sin(a); if (z < 0) continue; ctx.globalAlpha = 0.25 + 0.75 * z * Math.min(1, 0.35 + w); ctx.fillStyle = w > 0.6 ? "#fff" : globeColor; ctx.beginPath(); ctx.arc(x, y, 1.1 + z * (0.8 + w), 0, Math.PI * 2); ctx.fill(); } }
        ctx.globalAlpha = 1;
      }
      setTimeout(globeLoop, 66);
    }

    // ================= 오른쪽: LISTENING · HELP · REAL-TIME DATA =================
    function renderHelp() {
      const body = $("helpBody"), t = sel(), c = t ? S.counts.get(t.id) || {} : {}, p = t && S.profiles.get(t.id), pr = t && S.predictions.get(t.id);
      body.innerHTML = irow("up", "파일 넣기", "기출 · 범위 원문 · 프린트", undefined, "btn", ' data-act="files"') + irow("brain", "성향 학습", p ? "V" + p.version + " → 다시 학습" : "문항 " + (c.questions || 0) + "개로 학습", undefined, "btn", ' data-act="learn"') + irow("target", "다음 시험 예측", pr ? pr.target.label : "학습 뒤에 가능", undefined, "btn", ' data-act="predict"') + irow("bolt", "적중 모의고사 만들기", pr ? "예측 반영 · 인쇄 · 워드" : "예측 뒤에 가능", undefined, "btn", ' data-act="mock"') + irow("print", "프린트 반영율 보기", "선생님 프린트 vs 실제 시험", undefined, "btn", ' data-act="print"') + irow("out", "청사진 · 백업", "동형 모의고사 생성기로 넘기기", undefined, "btn", ' data-act="export"');
      body.querySelectorAll("[data-act]").forEach(el => el.onclick = () => { const a = el.dataset.act; if (a === "files") { if (sel()) $("fileInput").click(); else toast("먼저 선생님을 골라 주세요"); } else if (a === "learn") { if (t) run(() => APP.learn(t.id, { force: true })); } else if (a === "predict") openPredictSheet(); else if (a === "mock") openMockSheet(); else if (a === "print") openDrawer("handouts"); else if (a === "export") $("btnExport").click(); });
    }
    async function renderData() {
      const body = $("dataBody"), t = sel(), p = t && S.profiles.get(t.id), pr = t && S.predictions.get(t.id);
      $("dataSub").textContent = pr ? pr.target.label : "";
      if (!t) { body.innerHTML = '<div class="empty">선생님을 고르면 다음 시험 예측이 여기에 나와요</div>'; return; }
      const c = S.counts.get(t.id) || {};
      let html = '<canvas id="rangeMap" width="640" height="150"></canvas><div class="small" style="margin:4px 0 10px">시험범위 지도 — 점 하나가 지문 하나 · 밝을수록 다음 시험에 나올 확률 · 노랑 = 프린트에 실림</div>';
      if (!p) html += '<ul class="check"><li class="' + (c.exams ? "on" : "") + '">기출 시험지 1장 이상</li><li class="' + (c.sources ? "on" : "") + '">범위 원문 1개</li><li>학습 1회</li></ul>' + (c.questions ? '<div class="actions"><button type="button" class="pri" id="rLearn">지금 학습</button></div>' : "");
      else if (!pr) html += '<div class="small">예측이 아직 없어요</div><div class="actions"><button type="button" class="pri" id="rPredict">다음 시험 예측</button></div>';
      else {
        const bp = pr.blueprint;
        html += '<div class="kv"><b>구성</b><span>' + bp.plan.total + '문항 (객관식 ' + bp.plan.objective + ' · 서술형 ' + bp.plan.subjective + ') · ' + bp.plan.points + '점</span><b>유형</b><span>' + bp.plan.typePlan.slice(0, 6).map(x => esc(x.type) + " " + x.n).join(" · ") + '</span>' + (bp.grammarPoints.length ? '<b>어법</b><span>' + bp.grammarPoints.slice(0, 4).map(g => esc(g.point) + " " + pct(g.p) + (g.onHandout ? "★" : "")).join(" · ") + '</span>' : "") + '<b>신뢰도</b><span>' + pct(bp.confidence.overall) + '</span></div>';
        html += '<div class="small" style="margin:8px 0 4px">유력 지문</div>' + bp.passages.slice(0, 6).map(s => '<div class="hot" data-pass="' + s.passageId + '"><span class="p">' + pct(s.pUse) + '</span><span class="t">' + (s.onHandout ? '<span class="gold">★</span> ' : "") + esc(s.src || "") + ' “' + esc(String(s.first || "").split(/\s+/).slice(0, 5).join(" ")) + '…” <span class="faint">' + s.expectedTypes.map(esc).join("/") + '</span></span><div class="bar w' + (s.onHandout ? " gold" : "") + '"><i style="width:' + Math.round(s.pUse * 100) + '%"></i></div></div>').join("");
        if (bp.handout && bp.handout.passagesOnHandout) html += '<div class="note">프린트에 실린 지문 ' + bp.handout.passagesOnHandout + '개를 우선 배정' + (bp.handout.rate !== null ? ' · 과거 프린트 반영율 ' + pct(bp.handout.rate) : "") + '</div>';
        if (bp.newMoves.length) html += '<div class="note"><b>새로 나올 것</b><br>' + bp.newMoves.map(esc).join("<br>") + '</div>';
        if (p.profile.handout) html += '<div class="sec" style="margin-top:10px"><h4>프린트 반영율 <span>' + pct(p.profile.handout.rate) + '</span></h4><div class="bar gold"><i style="width:' + Math.round(p.profile.handout.rate * 100) + '%"></i></div><div class="small">' + p.profile.handout.byExam.map(x => esc(x.label) + " " + pct(x.rate)).join(" · ") + '</div></div>';
        html += '<div class="actions"><button type="button" id="rCopy">청사진 복사</button><button type="button" id="rPredict">예측 갱신</button><button type="button" class="pri" id="rMock">적중 모의고사</button></div>';
      }
      body.innerHTML = html;
      const rl = $("rLearn"); if (rl) rl.onclick = () => run(() => APP.learn(t.id, { force: true }));
      const rp = $("rPredict"); if (rp) rp.onclick = () => openPredictSheet();
      const rc = $("rCopy"); if (rc) rc.onclick = () => copyBlueprint();
      const rm = $("rMock"); if (rm) rm.onclick = () => openMockSheet();
      body.querySelectorAll("[data-pass]").forEach(el => el.onclick = () => openDrawer("passage", el.dataset.pass));
      drawRangeMap(t, pr);
    }
    async function drawRangeMap(t, pr) {
      const cv = $("rangeMap"); if (!cv) return; const ctx = cv.getContext("2d"), W = cv.width, H = cv.height; ctx.clearRect(0, 0, W, H);
      const passages = (await DB.where("passages", "teacherId", t.id)).filter(p => p.kind === "지문");
      if (!passages.length) { ctx.fillStyle = "rgba(143,179,214,.6)"; ctx.font = "22px 'Noto Sans KR'"; ctx.textAlign = "center"; ctx.fillText("범위 원문을 넣으면 지도가 생겨요", W / 2, H / 2 + 8); return; }
      const hot = {}; if (pr) pr.blueprint.passages.forEach(s => { hot[s.passageId] = s; });
      const cols = Math.min(24, Math.max(8, Math.ceil(Math.sqrt(passages.length * 2.5)))), cell = W / cols, rows = Math.ceil(passages.length / cols), cellH = Math.min(cell, (H - 12) / rows);
      passages.forEach((p, i) => { const x = (i % cols) * cell + cell / 2, y = 8 + Math.floor(i / cols) * cellH + cellH / 2; const h = hot[p.id]; const v = h ? h.pUse : 0.1; ctx.globalAlpha = 0.25 + 0.75 * v; ctx.fillStyle = h && h.onHandout ? "#f5c518" : "#7fd8ff"; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = v > 0.5 ? 10 : 0; ctx.beginPath(); ctx.arc(x, y, 3 + v * 6, 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
    function queueHtml(teacherId) {
      const jobs = S.queue.filter(j => !teacherId || j.teacherId === teacherId);
      if (!jobs.length) return "";
      const act = jobs.filter(j => !["done", "error", "cancelled"].includes(j.stage)).length;
      const KL = { exam: "기출", scope: "범위", handout: "프린트", auto: "자동" };
      return '<div class="sec"><h4>Queue <span>처리 중 ' + Math.min(act, 1) + ' · 대기 ' + Math.max(0, act - 1) + '</span></h4>' + jobs.map(j => {
        const tn = teacherId ? "" : '<span class="small">' + esc((T(j.teacherId) || {}).name || "") + ' · </span>';
        const chip = ["queued", "extract", "ocr", "classify"].includes(j.stage) ? '<button type="button" class="chip' + (j.kind === "scope" ? " gold" : j.kind === "handout" ? "" : j.kind === "auto" ? " dim" : "") + '" data-flip="' + j.id + '" title="종류가 다르면 눌러서 바꾸세요 (기출 → 범위 → 프린트)">' + KL[j.kind] + '</button>' : '<span class="chip' + (j.kind === "scope" ? " gold" : "") + '">' + KL[j.kind] + '</span>';
        const x = ["done", "error", "cancelled"].includes(j.stage) ? '<button type="button" class="x ghost" data-rm="' + j.id + '">✕</button>' : '<button type="button" class="x ghost" data-cancel="' + j.id + '" title="취소">✕</button>';
        const err = j.stage === "error" ? '<div class="d bad">⚠ ' + esc(j.error) + ' ' + (j.canForce ? '<button type="button" class="link" data-force="' + j.id + '">그래도 넣기</button>' : (j.tries || 0) < 3 ? '<button type="button" class="link" data-retry="' + j.id + '">다시</button>' : '<span class="faint">(3번 실패 — 건너뛸게요)</span>') + '</div>' : "";
        return '<div class="q' + (j.stage === "error" ? " err" : "") + '"><span class="n">' + tn + esc(j.name) + '</span><span class="row">' + chip + x + '</span><div class="d">' + esc(j.detail || "") + (j.note ? ' · ' + esc(j.note) : "") + '</div>' + (["done", "error", "cancelled", "queued"].includes(j.stage) ? "" : '<div class="bar prog"><i style="width:' + Math.round(j.progress * 100) + '%"></i></div>') + err + '</div>'; }).join("") + '</div>';
    }
    function bindQueue(root) {
      const find = (id) => S.queue.find(j => j.id === id);
      root.querySelectorAll("[data-flip]").forEach(b => b.onclick = () => APP.cycleJobKind(find(b.dataset.flip)));
      root.querySelectorAll("[data-cancel]").forEach(b => b.onclick = () => APP.cancelJob(find(b.dataset.cancel)));
      root.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { S.queue = S.queue.filter(j => j.id !== b.dataset.rm); APP.emit("queue"); });
      root.querySelectorAll("[data-retry]").forEach(b => b.onclick = () => APP.retryJob(find(b.dataset.retry)));
      root.querySelectorAll("[data-force]").forEach(b => b.onclick = () => APP.retryJob(find(b.dataset.force), true));
    }
    function renderAll() { renderStatus(); renderIntel(); renderHelp(); renderData(); }
    async function copyBlueprint() {
      const t = sel(), pr = t && S.predictions.get(t.id); if (!pr) { toast("학습된 프로파일과 예측이 있어야 청사진을 만들 수 있어요"); return; }
      try { await navigator.clipboard.writeText(pr.copyText); } catch (e) { const ta = document.createElement("textarea"); ta.value = pr.copyText; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
      toast("청사진을 복사했어요 — 동형 모의고사 생성기의 '요청사항' 칸에 붙여넣으세요", { ok: true, action: "생성기 열기", onAction: () => window.open("https://nathankim6.github.io/orunnathan/mock-exam.html", "_blank", "noopener") });
    }

    // ================= 드로어 =================
    const KIND_KO = { 지문: "지문", 어법: "어법", 예상문제: "예상문제", 어휘: "어휘" };
    async function renderDrawer() {
      const cur = drawerStack[drawerStack.length - 1]; if (!cur) return;
      $("drawerBack").hidden = drawerStack.length < 2;
      const body = $("drawerBody"); body.innerHTML = '<div class="small">불러오는 중…</div>';
      if (cur.kind === "exam") {
        const e = await DB.get("exams", cur.id); if (!e) { closeDrawer(); return; }
        const qs = (await DB.where("questions", "examId", e.id)).sort((a, b) => a.order - b.order);
        const pmap = {}; (await DB.where("passages", "teacherId", e.teacherId)).forEach(p => { pmap[p.id] = p; });
        $("drawerTitle").textContent = e.title;
        const g = (k) => e.meta[k + "Guessed"] ? ' <span class="badge warn" title="시험지에서 읽어 추정한 값이에요. 틀리면 고쳐 주세요">추정</span>' : "";
        let html = '<div class="sec"><h4>시험 정보</h4><div class="kv"><b>연도' + g("year") + '</b><input type="number" data-m="year" value="' + esc(e.meta.year) + '" style="width:90px"><b>학기' + g("semester") + '</b><span class="seg" data-seg="semester">' + [1, 2].map(v => '<button type="button" data-v="' + v + '" class="' + (e.meta.semester === v ? "on" : "") + '">' + v + '학기</button>').join("") + '</span><b>시험명' + g("term") + '</b><span class="seg" data-seg="term">' + ["중간", "기말", "1차지필", "2차지필"].map(v => '<button type="button" data-v="' + v + '" class="' + (e.meta.term === v ? "on" : "") + '">' + v + '</button>').join("") + '</span><b>학년' + g("grade") + '</b><span class="seg" data-seg="grade">' + [1, 2, 3].map(v => '<button type="button" data-v="' + v + '" class="' + (+e.meta.grade === v ? "on" : "") + '">' + v + '</button>').join("") + '</span><b>과목' + g("subject") + '</b><input type="text" data-m="subject" value="' + esc(e.meta.subject) + '"><b>학교' + g("school") + '</b><input type="text" data-m="school" value="' + esc(e.meta.school) + '"></div></div>';
        html += '<div class="sec"><h4>분석</h4><div class="small">문항 ' + e.analysis.total + ' · 객관식 ' + e.analysis.objective + ' · 서술형 ' + e.analysis.subjective + (e.analysis.points ? ' · 총점 ' + e.analysis.points : "") + (e.gaps && e.gaps.length ? ' · <span class="bad">못 읽은 번호 ' + e.gaps.map(esc).join(",") + '</span>' : "") + '</div><div class="narr" style="font-size:12px">' + esc(e.analysis.summary || "") + '</div></div>';
        if (e.reflection) html += '<div class="sec"><h4>프린트 반영율 <span>' + pct(e.reflection.rate) + '</span></h4><div class="bar gold"><i style="width:' + Math.round(e.reflection.rate * 100) + '%"></i></div><div class="small">' + e.reflection.hits.length + '/' + e.reflection.n + ' 문항이 프린트에서 나왔어요 · ' + Object.keys(e.reflection.kinds).map(k => esc(k) + " " + e.reflection.kinds[k]).join(" · ") + '</div></div>';
        if (e.ai) html += '<div class="sec"><h4>AI 활용 추정 <span>' + esc(e.ai.label) + '</span></h4><div class="bar gold"><i style="width:' + Math.round(e.ai.aiLikelihood * 100) + '%"></i></div><div class="small">' + pct(e.ai.aiLikelihood) + ' (구간 ' + pct(e.ai.band[0]) + '~' + pct(e.ai.band[1]) + ') · 신호 커버리지 ' + pct(e.ai.coverage) + '</div>' + (e.ai.llm ? '<div class="small" style="margin-top:4px">' + esc(e.ai.llm.summary) + '</div><ul class="small" style="padding-left:16px;margin:4px 0">' + e.ai.llm.evidence.map(v => '<li>' + (v.direction === "ai" ? "🤖" : v.direction === "human" ? "✍" : "·") + ' ' + esc(v.note) + (v.quote ? ' <span class="faint">“' + esc(v.quote) + '”</span>' : "") + '</li>').join("") + '</ul>' : "") + '<details class="raw"><summary>신호표</summary><table class="tbl">' + e.ai.signals.map(x => '<tr><td>' + esc(x.name) + '</td><td class="mono">' + (x.available ? x.score.toFixed(2) : "—") + '</td><td class="small">' + esc(x.detail) + '</td></tr>').join("") + '</table></details><div class="note">' + esc(ANALYZE.AI_DISCLAIMER) + '</div></div>';
        html += '<div class="sec"><h4>문항 ' + qs.length + '</h4><table class="tbl"><tr><th>NO</th><th>유형</th><th>배점</th><th>난이도</th><th>지문</th><th>프린트</th></tr>' + qs.map(q => '<tr class="rowbtn" data-q="' + q.id + '"><td>' + esc(q.number) + (q.set ? ' <span class="faint">[' + esc(q.set) + ']</span>' : "") + '</td><td>' + esc(q.type) + (q.subtype ? ' <span class="faint">' + esc(q.subtype) + '</span>' : "") + '</td><td>' + (q.points === null ? "—" : q.points) + '</td><td>' + esc(q.difficulty) + '</td><td class="small">' + (q.match && q.match.passageId && pmap[q.match.passageId] ? esc(pmap[q.match.passageId].src || "지문") : q.external ? "범위 밖" : q.passage && q.passage.has ? '<span class="faint">미매칭</span>' : "") + '</td><td class="small">' + (q.handoutHit ? '<span class="gold">★ ' + q.handoutHit.kinds.map(esc).join("·") + '</span>' : "") + '</td></tr>').join("") + '</table></div>';
        html += '<details class="raw"><summary>원문 텍스트 보기</summary><pre>' + esc(e.text.slice(0, 30000)) + '</pre></details><div class="actions"><button type="button" class="danger" id="dDelExam">이 시험지 삭제</button></div>';
        body.innerHTML = html;
        body.querySelectorAll("[data-m]").forEach(inp => inp.onchange = () => { const v = inp.dataset.m === "year" ? +inp.value : inp.value.trim(); APP.updateExamMeta(e.id, { [inp.dataset.m]: v }).then(() => { $("drawerTitle").textContent = TEXT.examLabel(Object.assign({}, e.meta, { [inp.dataset.m]: v })); }); });
        body.querySelectorAll("[data-seg]").forEach(seg => seg.querySelectorAll("button").forEach(b => b.onclick = () => { seg.querySelectorAll("button").forEach(x => x.classList.remove("on")); b.classList.add("on"); const k = seg.dataset.seg; const v = k === "term" ? b.dataset.v : +b.dataset.v; APP.updateExamMeta(e.id, { [k]: v }); }));
        body.querySelectorAll("[data-q]").forEach(r => r.onclick = () => openDrawer("question", r.dataset.q, true));
        $("dDelExam").onclick = () => { if (confirm("이 시험지와 문항 " + qs.length + "개를 지울까요?")) APP.deleteExam(e.id).then(closeDrawer); };
      } else if (cur.kind === "question") {
        const q = await DB.get("questions", cur.id); if (!q) { drawerBack(); return; }
        const ps = await DB.where("passages", "teacherId", q.teacherId); const p = q.match && q.match.passageId ? ps.find(x => x.id === q.match.passageId) : null;
        $("drawerTitle").textContent = q.number + "번 · " + q.type;
        let html = '<div class="sec"><div class="chips"><span class="chip">' + esc(q.format) + '</span><span class="chip">' + (q.points === null ? "배점 ?" : q.points + "점") + '</span><span class="chip">난이도 ' + esc(q.difficulty) + '</span>' + (q.set ? '<span class="chip gold">세트 ' + esc(q.set) + '</span>' : "") + (q.subtype ? '<span class="chip dim">' + esc(q.subtype) + '</span>' : "") + (q.handoutHit ? '<span class="chip gold">★ 프린트 ' + q.handoutHit.kinds.map(esc).join("·") + '</span>' : "") + '</div></div>';
        html += '<div class="sec"><h4>발문</h4><div class="narr">' + esc(q.stem) + '</div>' + (q.options.length ? '<div class="small" style="margin-top:6px">' + q.options.map(o => esc(o.label + " " + o.text)).join("<br>") + '</div>' : "") + (q.answer ? '<div class="small">정답: ' + esc(q.answer) + '</div>' : "") + '</div>';
        html += '<div class="sec"><h4>특징</h4><div class="small">' + esc(q.features) + (q.difficultyReason ? '<br>난이도: ' + esc(q.difficultyReason) : "") + '<br>변형: ' + esc(q.transformation.technique || "—") + (q.transformation.blankPosition ? ' · 빈칸 ' + esc(q.transformation.blankPosition) : "") + (q.transformation.grammarPoints.length ? ' · 어법 ' + q.transformation.grammarPoints.map(esc).join(",") : "") + '<br>선지: ' + q.distractor.style.map(esc).join("·") + (q.distractor.parallel ? " · 평행" : "") + ' · ' + (q.distractor.lang === "ko" ? "우리말" : "영어") + '</div></div>';
        html += '<div class="sec"><h4>매칭 지문</h4>' + (p ? '<div class="tl"><div class="it" data-pass="' + p.id + '"><span class="t">' + esc(p.src || "지문") + (p.fromHandout ? ' <span class="gold">★ 프린트</span>' : "") + '</span><span class="badge ok">' + esc(q.match.method === "user" ? "USER" : q.match.method === "local" ? "AUTO" : "MODEL") + ' · ' + pct(q.match.confidence) + '</span><span class="s">“' + esc(p.first) + '”' + (q.match.fidelity !== null ? ' · 원문 유지 ' + pct(q.match.fidelity) : "") + (q.match.altered ? ' · ' + esc(q.match.altered) : "") + '</span></div></div>' : '<div class="small">' + (q.external ? "범위 밖 지문으로 보여요" : "맞는 범위 지문을 못 찾았어요") + (q.match && q.match.reason ? " · " + esc(q.match.reason) : "") + '</div>') + '<div class="row" style="margin-top:8px"><select id="dMatchSel" style="flex:1"><option value="">매칭 바꾸기 — 지문 고르기</option>' + ps.filter(x => x.kind === "지문").map(x => '<option value="' + x.id + '">' + esc((x.src || "") + " · " + String(x.first).split(/\s+/).slice(0, 6).join(" ")) + '</option>').join("") + '<option value="__none">매칭 해제</option></select></div></div>';
        html += '<details class="raw"><summary>추출 원문</summary><pre>' + esc(q.rawBlock) + '</pre></details>';
        body.innerHTML = html;
        body.querySelectorAll("[data-pass]").forEach(el => el.onclick = () => openDrawer("passage", el.dataset.pass, true));
        $("dMatchSel").onchange = (ev) => { const v = ev.target.value; if (!v) return; APP.setQuestionMatch(q.id, v === "__none" ? null : v).then(renderDrawer); };
      } else if (cur.kind === "passage") {
        const p = await DB.get("passages", cur.id); if (!p) { drawerBack(); return; }
        const qs = (await DB.where("questions", "teacherId", p.teacherId)).filter(q => q.match && q.match.passageId === p.id);
        const exams = {}; (await DB.where("exams", "teacherId", p.teacherId)).forEach(e => { exams[e.id] = e; });
        const pr = S.predictions.get(p.teacherId); const hot = pr && pr.blueprint.passages.find(x => x.passageId === p.id);
        $("drawerTitle").textContent = p.src || "지문";
        body.innerHTML = '<div class="sec"><div class="chips"><span class="chip">' + esc(p.genre || p.kind) + '</span><span class="chip dim">' + p.words + '단어</span>' + (p.fromHandout ? '<span class="chip gold">★ 프린트 지문</span>' : "") + (p.feats || []).map(f => '<span class="chip dim">' + esc(f) + '</span>').join("") + (hot ? '<span class="chip gold">다음 시험 ' + pct(hot.pUse) + '</span>' : "") + '</div>' + (hot ? '<div class="note">' + hot.reasons.map(esc).join("<br>") + '</div>' : "") + '</div><div class="sec"><h4>요지</h4><div class="small">' + esc(p.gist) + '</div></div><div class="sec"><h4>원문</h4><div class="narr" style="font-size:12px;line-height:1.7">' + (p.sentences && p.sentences.length ? p.sentences.map((x, i) => '<span title="' + i + '번째 문장"' + (p.topicIdx === i ? ' style="color:var(--gold)"' : (p.blankCandidates || []).includes(i) ? ' style="text-decoration:underline dotted"' : "") + '>' + esc(x) + '</span>').join(" ") : esc(p.text)) + '</div><div class="small" style="margin-top:4px">노랑 = 주제문 · 점선 = 빈칸 후보' + ((p.grammarTargets || []).length ? ' · 어법 후보: ' + p.grammarTargets.map(g => esc(g.point) + "(" + g.sent + ")").join(", ") : "") + '</div></div><div class="sec"><h4>이 지문이 쓰인 문항</h4>' + (qs.length ? '<div class="tl">' + qs.map(q => '<div class="it" data-q="' + q.id + '"><span class="t">' + esc((exams[q.examId] || {}).title || "") + ' · ' + esc(q.number) + '번</span><span class="badge">' + esc(q.type) + '</span></div>').join("") + '</div>' : '<div class="small">아직 쓰인 적 없어요</div>') + '</div>';
        body.querySelectorAll("[data-q]").forEach(el => el.onclick = () => openDrawer("question", el.dataset.q, true));
      } else if (cur.kind === "source") {
        const sc = await DB.get("sources", cur.id); if (!sc) { closeDrawer(); return; }
        const ps = (await DB.where("passages", "sourceId", sc.id)).sort((a, b) => a.order - b.order);
        const isH = sc.kind === "프린트";
        $("drawerTitle").textContent = (isH ? "프린트 · " : "범위 원문 · ") + sc.name;
        let html = '<div class="sec"><div class="small">지문 ' + sc.passages + '개' + (isH ? ' · 포인트 ' + (sc.items || []).length : "") + ' · ' + sc.file.chars.toLocaleString() + '자 · ' + TEXT.fmtDate(sc.createdAt) + '</div>';
        if (!isH) html += '<div class="row" style="margin-top:6px"><span class="small">종류</span><span class="seg" id="dKind">' + ["교과서", "부교재", "모의고사", "기타"].map(k => '<button type="button" data-v="' + k + '" class="' + (sc.kind === k ? "on" : "") + '">' + k + '</button>').join("") + '</span></div><label class="row" style="margin-top:8px"><input type="checkbox" id="dComplete"' + (sc.complete ? " checked" : "") + ' style="width:auto"> 이 자료로 시험 범위를 다 넣었어요 (범위 밖 지문을 더 정확히 가려요)</label>';
        else { const tg = sc.target || {}; html += '<div class="row" style="margin-top:6px"><span class="small">어느 시험용 프린트인가요</span><input type="number" id="dTy" value="' + esc(tg.year || "") + '" style="width:80px"><span class="seg" id="dTs">' + [1, 2].map(v => '<button type="button" data-v="' + v + '" class="' + (tg.semester === v ? "on" : "") + '">' + v + '학기</button>').join("") + '</span><span class="seg" id="dTt">' + ["중간", "기말"].map(v => '<button type="button" data-v="' + v + '" class="' + (tg.term === v ? "on" : "") + '">' + v + '</button>').join("") + '</span>' + (tg.guessed ? '<span class="badge warn">추정</span>' : "") + '</div>'; }
        html += '</div>';
        if (isH) {
          const r = sc.reflection;
          html += '<div class="sec"><h4>시험 실질 반영율 <span>' + (r ? pct(r.rate) : "기출과 짝이 없어요") + '</span></h4>' + (r ? '<div class="bar gold"><i style="width:' + Math.round(r.rate * 100) + '%"></i></div><div class="small">' + r.exams.map(x => esc(x.label) + " " + x.hit + "/" + x.n + " (" + pct(x.rate) + ")").join(" · ") + '</div>' : '<div class="small">같은 시험(연도·학기·중간/기말)의 기출 시험지를 넣으면 이 프린트에서 몇 문항이 실제로 나왔는지 계산해요.</div>') + '</div>';
          const hitIdx = new Set((r ? r.itemHits : []).map(x => x.i));
          html += '<div class="sec"><h4>포인트 ' + (sc.items || []).length + ' <span>★ = 시험에 나옴</span></h4><div class="tl">' + (sc.items || []).map((it, i) => '<div class="it" style="cursor:default"><span class="t">' + (hitIdx.has(i) ? '<span class="gold">★</span> ' : "") + esc(it.text) + '</span><span class="badge' + (hitIdx.has(i) ? " warn" : "") + '">' + esc(it.kind) + (it.point ? " · " + esc(it.point) : "") + '</span></div>').join("") + '</div></div>';
        }
        html += '<div class="sec"><h4>지문 ' + ps.length + '</h4><div class="tl">' + ps.map(x => '<div class="it" data-pass="' + x.id + '"><span class="t">' + esc(x.src || "") + ' <span class="faint">' + esc(x.kind) + '</span></span><span class="badge">' + (x.words || 0) + 'w</span><span class="s">“' + esc(String(x.first).split(/\s+/).slice(0, 8).join(" ")) + '…”</span></div>').join("") + '</div></div><details class="raw"><summary>원문 텍스트 보기</summary><pre>' + esc(sc.text.slice(0, 30000)) + '</pre></details><div class="actions"><button type="button" class="danger" id="dDelSrc">삭제</button></div>';
        body.innerHTML = html;
        body.querySelectorAll("[data-pass]").forEach(el => el.onclick = () => openDrawer("passage", el.dataset.pass, true));
        const dk = $("dKind"); if (dk) dk.querySelectorAll("button").forEach(b => b.onclick = async () => { sc.kind = b.dataset.v; await DB.put("sources", sc); dk.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); });
        const dc = $("dComplete"); if (dc) dc.onchange = (e) => APP.setSourceComplete(sc.id, e.target.checked);
        if (isH) { const save = async () => { sc.target = { year: +$("dTy").value || null, semester: +(($("dTs").querySelector(".on") || {}).dataset || {}).v || null, term: (($("dTt").querySelector(".on") || {}).dataset || {}).v || null, guessed: false }; await DB.put("sources", sc); await APP.recomputeReflection(sc.teacherId); APP.emit("data", sc.teacherId); renderDrawer(); };
          $("dTy").onchange = save; ["dTs", "dTt"].forEach(id => $(id).querySelectorAll("button").forEach(b => b.onclick = () => { $(id).querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); save(); })); }
        $("dDelSrc").onclick = () => { if (confirm("이 " + (isH ? "프린트" : "범위 원문") + "와 지문 " + ps.length + "개를 지울까요? 매칭된 문항은 매칭이 풀려요.")) APP.deleteSource(sc.id).then(closeDrawer); };
      } else if (cur.kind === "handouts") {
        const t = sel(); const srcs = t ? (await DB.where("sources", "teacherId", t.id)).filter(x => x.kind === "프린트").sort((a, b) => b.createdAt - a.createdAt) : [];
        const p = t && S.profiles.get(t.id);
        $("drawerTitle").textContent = "프린트 반영율";
        body.innerHTML = '<div class="note">선생님이 나눠 준 프린트(학습지)를 넣으면, 그 프린트의 지문·어법 포인트·예상문제가 실제 시험에 몇 문항이나 나왔는지 셉니다. 다음 시험 예측에서는 프린트에 실린 지문을 그 반영율만큼 우선해요.</div>' + (p && p.profile.handout ? '<div class="sec"><h4>전체 반영율 <span>' + pct(p.profile.handout.rate) + '</span></h4><div class="bar gold"><i style="width:' + Math.round(p.profile.handout.rate * 100) + '%"></i></div><div class="small">' + p.profile.handout.byExam.map(x => esc(x.label) + " " + pct(x.rate)).join(" · ") + '</div></div>' : "") + (srcs.length ? '<div class="tl">' + srcs.map(x => '<div class="it" data-src="' + x.id + '"><span class="t">' + esc(x.name) + '</span><span class="badge' + (x.reflection ? " warn" : "") + '">' + (x.reflection ? "HIT " + pct(x.reflection.rate) : "대기") + '</span><span class="s">' + (x.target && x.target.year ? x.target.year + " " + x.target.semester + "학기 " + x.target.term + " 용" : "시험 미지정") + ' · 지문 ' + x.passages + ' · 포인트 ' + (x.items || []).length + '</span></div>').join("") + '</div>' : '<div class="empty"><b>아직 프린트가 없어요</b>파일을 넣을 때 칩을 ‘프린트’로 두거나, 파일 이름에 프린트·학습지가 들어 있으면 자동으로 알아봐요</div>') + '<div class="actions"><button type="button" class="pri" id="dAddPrint">프린트 넣기</button></div>';
        body.querySelectorAll("[data-src]").forEach(el => el.onclick = () => openDrawer("source", el.dataset.src, true));
        $("dAddPrint").onclick = () => { if (sel()) { pendingKind = "handout"; $("fileInput").click(); } else toast("먼저 선생님을 골라 주세요"); };
      } else if (cur.kind === "mocks") {
        const t = sel(); const ms = t ? (await DB.where("mocks", "teacherId", t.id)).sort((a, b) => b.createdAt - a.createdAt) : [];
        $("drawerTitle").textContent = "지난 모의고사";
        body.innerHTML = ms.length ? '<div class="tl">' + ms.map(m => '<div class="it" data-mock="' + m.id + '"><span class="t">' + esc(m.title) + '</span><span class="badge">' + m.stats.total + ' Q</span><span class="s">' + esc(m.target) + ' · ' + TEXT.fmtDate(m.createdAt) + ' · ' + esc(m.model) + '</span></div>').join("") + '</div>' : '<div class="empty">아직 만든 모의고사가 없어요</div>';
        body.querySelectorAll("[data-mock]").forEach(el => el.onclick = async () => { const m = await DB.get("mocks", el.dataset.mock); if (m) openPaper(m); });
      }
    }
    let pendingKind = null;

    // ================= 시트들 =================
    function teacherForm(t) {
      const SCHOOLS = ["흑석고", "경문고", "동작고", "상도고", "성남고", "수도여고", "숭의여고", "중앙대사대부고"];
      const SUBJ = ["영어A", "영어B", "공통영어", "영어I", "영어II", "영어독해와작문", "실용영어", "영어"];
      const el = h('<div><div class="field"><label>이름</label><input type="text" id="tfName" placeholder="예) 윤은영" maxlength="20" value="' + esc(t ? t.name : "") + '"></div><div class="field"><label>학교</label><input type="text" id="tfSchool" list="schoolList" placeholder="학교 이름" value="' + esc(t ? t.school : "흑석고") + '"><datalist id="schoolList">' + SCHOOLS.map(x => '<option value="' + x + '">').join("") + '</datalist></div><div class="row"><div class="field grow"><label>학년</label><div class="seg" id="tfGrade">' + [1, 2, 3].map(g => '<button type="button" data-v="' + g + '" class="' + ((t ? t.grade : 1) === g ? "on" : "") + '">' + g + '학년</button>').join("") + '</div></div></div><div class="field"><label>과목</label><div class="seg" id="tfSubj">' + SUBJ.map(x => '<button type="button" data-v="' + x + '" class="' + ((t ? t.subject : "영어A") === x ? "on" : "") + '">' + x + '</button>').join("") + '</div><input type="text" id="tfSubjOther" placeholder="다른 과목 이름" style="margin-top:6px" value="' + esc(t && !SUBJ.includes(t.subject) ? t.subject : "") + '"></div><div class="field"><label>색</label><div class="swatches" id="tfColor">' + APP.PALETTE.map(c => '<span class="sw' + ((t ? t.color : "") === c ? " on" : "") + '" data-v="' + c + '" style="background:' + c + ';color:' + c + '"></span>').join("") + '</div></div><div class="err" id="tfErr"></div><div class="actions">' + (t ? '<button type="button" class="danger" id="tfDel">이 선생님 지우기</button><span class="grow"></span>' : "") + '<button type="button" id="tfCancel">취소</button><button type="button" class="pri" id="tfOk">' + (t ? "저장" : "만들기") + '</button></div></div>');
      const seg = (id) => { const x = el.querySelector(id); x.querySelectorAll("button").forEach(b => b.onclick = () => { x.querySelectorAll("button").forEach(y => y.classList.remove("on")); b.classList.add("on"); }); };
      seg("#tfGrade"); seg("#tfSubj");
      el.querySelectorAll(".sw").forEach(x => x.onclick = () => { el.querySelectorAll(".sw").forEach(y => y.classList.remove("on")); x.classList.add("on"); });
      const read = () => { const on = (id) => { const b = el.querySelector(id + " .on"); return b ? b.dataset.v : ""; }; const other = el.querySelector("#tfSubjOther").value.trim(); return { name: el.querySelector("#tfName").value.trim(), school: el.querySelector("#tfSchool").value.trim(), grade: +on("#tfGrade") || 1, subject: other || on("#tfSubj") || "영어", color: on("#tfColor") || (t ? t.color : "") }; };
      return { el, read };
    }
    function openTeacherSheet(t, files) {
      const f = teacherForm(t); pendingFiles = files || null;
      const submit = async () => { const d = f.read(); const err = f.el.querySelector("#tfErr"); if (!d.name) { err.textContent = "이름을 넣어 주세요"; return; } if (!d.school) { err.textContent = "학교를 넣어 주세요"; return; }
        if (!t && [...S.teachers.values()].some(x => x.name === d.name && x.school === d.school) && !confirm("같은 학교에 같은 이름의 선생님이 있어요. 그래도 만들까요?")) return;
        const pf = pendingFiles; closeSheet();
        if (t) { await APP.updateTeacher(t.id, d); toast("저장했어요", { ok: true }); }
        else { const nt = await APP.createTeacher(d); toast(nt.name + " 선생님을 만들었어요", { ok: true }); if (pf && pf.length) APP.enqueue(pf, nt.id); } };
      f.el.querySelector("#tfOk").onclick = submit; f.el.querySelector("#tfCancel").onclick = closeSheet;
      const del = f.el.querySelector("#tfDel"); if (del) del.onclick = () => { closeSheet(); openDeleteSheet(t); };
      f.el.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.tagName === "INPUT") { e.preventDefault(); submit(); } });
      openSheet(t ? "선생님 정보" : "새 선생님", f.el, { kind: "teacher" });
    }
    function openDeleteSheet(t) {
      const c = S.counts.get(t.id) || {}, p = S.profiles.get(t.id), busy = S.busy.has(t.id);
      const el = h('<div><p>' + esc(t.name) + ' 선생님과 기출 ' + (c.exams || 0) + '건 · 문항 ' + (c.questions || 0) + '개 · 지문 ' + (c.passages || 0) + '개 · 프로파일 ' + (p ? p.version : 0) + '판을 모두 지웁니다. 클라우드(Supabase)에서도 지워져요. 되돌릴 수 없어요.</p>' + (busy ? '<div class="err">학습·예측·출제가 끝난 뒤 지울 수 있어요</div>' : "") + (c.questions ? '<div class="field"><label>확인을 위해 이름을 입력하세요</label><input type="text" id="delName"></div>' : "") + '<div class="actions"><button type="button" id="delExport">먼저 JSON 으로 내보내기</button><button type="button" id="delCancel">취소</button><button type="button" class="danger" id="delGo"' + (busy ? " disabled" : "") + '>지우기</button></div></div>');
      el.querySelector("#delExport").onclick = () => APP.exportJson(t.id).then(r => toast(t.name + " 선생님 데이터를 내려받았어요 (" + TEXT.fmtBytes(r.size) + ")", { ok: true }));
      el.querySelector("#delCancel").onclick = closeSheet;
      el.querySelector("#delGo").onclick = async () => { const inp = el.querySelector("#delName"); if (inp && inp.value.trim() !== t.name) { toast("이름이 달라요", { bad: true }); return; } closeSheet(); await APP.deleteTeacher(t.id); if (!S.teachers.has(t.id)) toast(t.name + " 선생님을 지웠어요"); };
      openSheet(t.name + " 선생님을 지울까요?", el, { kind: "delete" });
    }
    function openPredictSheet() {
      const t = sel(); if (!t) return;
      if (!S.profiles.get(t.id)) { toast("먼저 학습을 해 주세요"); return; }
      DB.where("exams", "teacherId", t.id).then(exams => {
        const d = APP.defaultTarget(exams);
        const el = h('<div><div class="field"><label>어느 시험을 예측할까요</label><div class="row"><input type="number" id="pdYear" value="' + d.year + '" style="width:90px"><div class="seg" id="pdSem">' + [1, 2].map(v => '<button type="button" data-v="' + v + '" class="' + (d.semester === v ? "on" : "") + '">' + v + '학기</button>').join("") + '</div><div class="seg" id="pdTerm">' + ["중간", "기말", "1차지필", "2차지필"].map(v => '<button type="button" data-v="' + v + '" class="' + (d.term === v ? "on" : "") + '">' + v + '</button>').join("") + '</div></div></div><div class="small">이 시험용 범위 원문과 선생님 프린트를 넣어 두면 유력 지문이 정확해져요. 프린트에 실린 지문은 과거 반영율만큼 우선해요.</div><div class="actions"><button type="button" id="pdCancel">취소</button><button type="button" class="pri" id="pdGo">예측</button></div></div>');
        el.querySelectorAll(".seg").forEach(x => x.querySelectorAll("button").forEach(b => b.onclick = () => { x.querySelectorAll("button").forEach(y => y.classList.remove("on")); b.classList.add("on"); }));
        el.querySelector("#pdCancel").onclick = closeSheet;
        el.querySelector("#pdGo").onclick = () => { const year = +el.querySelector("#pdYear").value || d.year, semester = +el.querySelector("#pdSem .on").dataset.v, term = el.querySelector("#pdTerm .on").dataset.v; closeSheet(); run(() => APP.predict(t.id, { label: year + " " + semester + "학기 " + term, year, semester, term })); };
        openSheet("다음 시험 예측", el, { kind: "predict" });
      });
    }
    async function openMockSheet() {
      const t = sel(); if (!t) return;
      const pr = S.predictions.get(t.id); if (!pr) { toast("먼저 예측을 해 주세요"); return; }
      const sources = (await DB.where("sources", "teacherId", t.id)).filter(x => x.passages > 0);
      const el = h('<div><div class="field"><label>문항 수</label><div class="row"><div class="seg" id="mkCount"><button type="button" data-v="" class="on">예측대로 (' + pr.blueprint.plan.total + '문항)</button><button type="button" data-v="10">10</button><button type="button" data-v="15">15</button><button type="button" data-v="20">20</button></div></div></div><div class="field"><label>쓸 자료</label>' + sources.map(x => '<label class="row" style="margin:2px 0"><input type="checkbox" data-src="' + x.id + '" checked style="width:auto"> ' + esc(x.name) + ' <span class="small">' + esc(x.kind) + ' · 지문 ' + x.passages + '</span></label>').join("") + '</div><div class="field"><label>예측 반영</label><div class="seg" id="mkStrength"><button type="button" data-v="tight" class="on">유력 지문 위주</button><button type="button" data-v="wide">범위 고르게</button></div></div><div class="field"><label>추가 요청 (선택)</label><textarea id="mkExtra" placeholder="예) 서술형은 조건영작만, 어법은 밑줄 5개 고정"></textarea></div><div class="small">문항 5개씩 나눠 만들어요. 20문항이면 보통 2~4분 걸리고, 만든 뒤 화면·인쇄·워드로 볼 수 있어요.</div><div class="actions"><button type="button" id="mkCancel">취소</button><button type="button" class="pri" id="mkGo">만들기</button></div></div>');
      el.querySelectorAll(".seg").forEach(x => x.querySelectorAll("button").forEach(b => b.onclick = () => { x.querySelectorAll("button").forEach(y => y.classList.remove("on")); b.classList.add("on"); }));
      el.querySelector("#mkCancel").onclick = closeSheet;
      el.querySelector("#mkGo").onclick = () => { const count = +el.querySelector("#mkCount .on").dataset.v || undefined; const strength = el.querySelector("#mkStrength .on").dataset.v; const ids = [...el.querySelectorAll("[data-src]")].filter(c => c.checked).map(c => c.dataset.src); const extra = el.querySelector("#mkExtra").value.trim(); closeSheet();
        run(() => APP.generateMock(t.id, { count, strength, sourceIds: ids.length === sources.length ? null : ids, extra })); };
      openSheet("적중 모의고사 만들기", el, { kind: "mock" });
    }
    const HIGGS_PROMPTS = [
      ["배경 루프 (무대 뒤)", "Cinematic dark navy sci-fi command room, JARVIS-style holographic interface floating in the air, glowing cyan concentric rings and tick marks, soft volumetric blue light beams, subtle particle field on a reflective floor, bokeh city lights through a window, camera slowly dolly-in, seamless loop, 16:9, no text, no people, 4K"],
      ["홀로그램 코어 (선생님 아바타 자리)", "A single luminous holographic core: layered rotating rings of light with fine tick marks and segmented arcs, ice-blue and white glow, a bright energy sphere at the center, black background, centered composition, slow rotation, seamless loop, no text"],
      ["HUD 패널 질감", "Futuristic glass HUD panel texture, translucent dark blue glass with thin cyan borders and corner brackets, faint circuit lines, soft inner glow, flat front view, black background, 16:9, no text"],
      ["학습 완료 파동", "A circular shockwave of cyan light expanding across a dark grid floor seen from a low angle, particles lifting into the air, JARVIS interface aesthetic, 2 second loop, no text"],
    ];
    function openSettings(tab) {
      const el = h('<div><div class="tabs">' + ["engine:엔진", "cloud:클라우드", "bg:배경 · Higgsfield", "view:화면", "data:데이터"].map(x => { const [k, v] = x.split(":"); return '<button type="button" data-tab="' + k + '">' + v + '</button>'; }).join("") + '</div><div id="setBody"></div></div>');
      const show = async (k) => {
        el.querySelectorAll("[data-tab]").forEach(b => b.classList.toggle("on", b.dataset.tab === k));
        const b = el.querySelector("#setBody");
        if (k === "engine") {
          const oa = API.provider() === "openai", key = API.currentKey();
          b.innerHTML = '<div class="field"><label>어느 회사 API 로 돌릴까요</label><div class="seg" id="sProv"><button type="button" data-v="anthropic" class="' + (oa ? "" : "on") + '">Anthropic (Claude)</button><button type="button" data-v="openai" class="' + (oa ? "on" : "") + '">OpenAI</button></div></div><div class="field"><label>API 키 <span class="faint">— 이 브라우저에만 저장돼요 · 동형 모의고사 생성기와 같은 키를 써요</span></label><div class="row"><input type="password" id="sKey" placeholder="' + (oa ? "sk-…" : "sk-ant-api03-…") + '" autocomplete="off" style="flex:1"><button type="button" id="sKeySave">저장</button><button type="button" id="sKeyClear">지우기</button></div><div class="small" id="sKeyStat">' + (key ? "저장됨 (…" + esc(key.slice(-4)) + ") — 바꾸려면 새 키를 붙여넣으세요" : "키가 없어요") + '</div></div>' + (oa ? '<div class="field"><label>모델</label><input type="text" id="sOaModel" list="oaList" value="' + esc(API.oaModel()) + '"><datalist id="oaList">' + API.OA_PRESETS.map(m => '<option value="' + m + '">').join("") + '</datalist></div>' : '<div class="field"><label>모델</label><div class="seg" id="sModel">' + Object.keys(API.AN_MODELS).map(x => '<button type="button" data-v="' + x + '" class="' + (API.anModelKey() === x ? "on" : "") + '">' + API.AN_LABELS[x] + '</button>').join("") + '</div><label class="row" style="margin-top:8px"><input type="checkbox" id="sLight" ' + (S.ui.light !== false ? "checked" : "") + ' style="width:auto"> 문항 데이터화·지문 색인은 Sonnet 5 로 (빠르고 저렴) · 분석·예측·출제는 위 모델</label></div>') + '<div class="field"><label>키 보관</label><div class="seg" id="sKeep"><button type="button" data-v="browser" class="' + (API.keepMode() === "browser" ? "on" : "") + '">이 브라우저에 저장</button><button type="button" data-v="session" class="' + (API.keepMode() === "session" ? "on" : "") + '">창 닫으면 지움</button></div></div><div class="row"><button type="button" class="pri" id="sProbe">연결 확인</button><span class="small" id="sProbeMsg"></span></div>';
          b.querySelector("#sProv").querySelectorAll("button").forEach(x => x.onclick = () => { API.setProvider(x.dataset.v); show("engine"); updateEngine(); });
          b.querySelector("#sKeySave").onclick = () => { const v = b.querySelector("#sKey").value.trim(); if (!v) return; if (!API.keyLooksRight(v)) { b.querySelector("#sKeyStat").textContent = "이 키는 " + (API.provider() === "openai" ? "OpenAI" : "Anthropic") + " 키 모양이 아니에요 (" + (API.provider() === "openai" ? "sk-" : "sk-ant-") + " 로 시작)"; return; } API.setCurrentKey(v); b.querySelector("#sKey").value = ""; b.querySelector("#sKeyStat").textContent = "저장됨 (…" + v.slice(-4) + ")"; updateEngine(); probe(); APP.runQueue(); };
          b.querySelector("#sKeyClear").onclick = () => { API.setCurrentKey(""); b.querySelector("#sKeyStat").textContent = "키를 지웠어요"; updateEngine(); };
          const sm = b.querySelector("#sModel"); if (sm) sm.querySelectorAll("button").forEach(x => x.onclick = () => { API.setAnModel(x.dataset.v); sm.querySelectorAll("button").forEach(y => y.classList.toggle("on", y === x)); updateEngine(); });
          const om = b.querySelector("#sOaModel"); if (om) om.onchange = () => { API.setOaModel(om.value); updateEngine(); };
          const sl = b.querySelector("#sLight"); if (sl) sl.onchange = () => { APP.saveUi({ light: sl.checked }); API.setLight(sl.checked); };
          b.querySelector("#sKeep").querySelectorAll("button").forEach(x => x.onclick = () => { API.setKeepMode(x.dataset.v); b.querySelector("#sKeep").querySelectorAll("button").forEach(y => y.classList.toggle("on", y === x)); });
          const probe = async () => { const m = b.querySelector("#sProbeMsg"); m.textContent = "확인하는 중…"; const r = await API.probe(); m.textContent = r.msg; m.className = "small " + (r.ok ? "ok" : "bad"); updateEngine(r.ok); };
          b.querySelector("#sProbe").onclick = probe;
        } else if (k === "cloud") {
          const c = SYNC.st; let n = null; try { n = await SYNC.count(); } catch (e) {}
          b.innerHTML = '<div class="note">데이터는 Supabase(프로젝트 orunnathan · 표 oracle_docs)에 저장돼요. 이 브라우저의 저장소가 작업본이고, 바뀔 때마다 클라우드에 그대로 올라가요. 다른 기기에서 같은 작업공간 이름으로 열면 같은 데이터를 봐요. 배경 영상은 올리지 않아요.</div><label class="row"><input type="checkbox" id="cOn" ' + (c.enabled ? "checked" : "") + ' style="width:auto"> Supabase 동기화 켜기</label><div class="field" style="margin-top:10px"><label>작업공간 이름 <span class="faint">(영문·숫자 · 기기마다 같게)</span></label><div class="row"><input type="text" id="cWs" value="' + esc(c.workspace) + '" style="flex:1"><button type="button" id="cWsSave">바꾸기</button></div></div><div class="kv"><b>상태</b><span id="cStat">' + esc(c.status === "error" ? "오류 — " + c.error : c.status === "syncing" ? "동기화 중" : c.enabled ? "연결됨" : "꺼짐") + '</span><b>클라우드 문서</b><span>' + (n === null ? "—" : n.toLocaleString() + "개") + '</span><b>마지막 동기화</b><span>' + (c.lastSync ? new Date(c.lastSync).toLocaleString("ko-KR") : "—") + '</span><b>대기 중</b><span>' + c.pending + '건</span></div><div class="actions" style="justify-content:flex-start"><button type="button" id="cPush">이 브라우저 → 클라우드 전부 올리기</button><button type="button" id="cPull">클라우드 → 이 브라우저 (새로 고침)</button><button type="button" class="danger" id="cWipe">클라우드 작업공간 비우기</button></div>';
          b.querySelector("#cOn").onchange = (e) => { SYNC.setEnabled(e.target.checked); updateCloud(); };
          b.querySelector("#cWsSave").onclick = () => { SYNC.setWorkspace(b.querySelector("#cWs").value); toast("작업공간을 바꿨어요 — 새로 고치면 그 작업공간의 데이터를 불러와요", { action: "지금 새로 고침", onAction: () => location.reload() }); show("cloud"); };
          b.querySelector("#cPush").onclick = async () => { toast("올리는 중…"); await SYNC.pushAll(DB); toast(SYNC.st.status === "error" ? "실패: " + SYNC.st.error : "모두 올렸어요", { ok: SYNC.st.status !== "error", bad: SYNC.st.status === "error" }); show("cloud"); };
          b.querySelector("#cPull").onclick = () => location.reload();
          b.querySelector("#cWipe").onclick = async () => { if (prompt("클라우드 작업공간 '" + c.workspace + "' 의 문서를 모두 지웁니다 (이 브라우저의 데이터는 남아요). '비우기' 라고 입력하세요") !== "비우기") return; try { await SYNC.wipeCloud(); toast("클라우드를 비웠어요"); show("cloud"); } catch (e) { toast(e.message, { bad: true }); } };
        } else if (k === "bg") {
          b.innerHTML = '<div class="field"><label>배경 (Higgsfield 등에서 만든 영상·그림)</label><div class="drop" id="sVidDrop">' + (S.bg.hasVideo ? "배경이 있어요 — 바꾸려면 여기에 놓거나 " : "mp4 · webm · jpg · png 를 여기에 놓거나 ") + '<button type="button" class="link" id="sVidPick">파일 선택</button></div>' + (S.bg.hasVideo ? '<div class="actions"><button type="button" id="sVidRm">배경 지우기</button></div>' : "") + '</div><div class="field"><label>배경 밝기 ' + Math.round(S.bg.opacity * 100) + '%</label><input type="range" id="sOpa" min="0" max="100" value="' + Math.round(S.bg.opacity * 100) + '"></div><div class="note">Higgsfield 는 이 화면에서 직접 부를 수 없어요(API 키·계정이 필요). 아래 프롬프트를 Higgsfield 에 붙여넣어 만든 영상·그림을 여기에 넣으면 무대 뒤에 깔려요. 3D 홀로그램·힉스 필드 입자는 그 위에 겹쳐요.</div>' + HIGGS_PROMPTS.map((x, i) => '<div class="field"><label>' + esc(x[0]) + ' <button type="button" class="link" data-copy="' + i + '">복사</button></label><pre class="prompt">' + esc(x[1]) + '</pre></div>').join("");
          const dz = b.querySelector("#sVidDrop");
          ["dragover", "dragenter"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); dz.classList.add("over"); }));
          ["dragleave", "drop"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); dz.classList.remove("over"); }));
          dz.addEventListener("drop", e => { const f = e.dataTransfer.files[0]; if (f) setVideo(f); });
          b.querySelector("#sVidPick").onclick = () => $("videoInput").click();
          const rm = b.querySelector("#sVidRm"); if (rm) rm.onclick = () => APP.setBgVideo(null).then(() => { toast("배경을 지웠어요"); show("bg"); });
          b.querySelector("#sOpa").oninput = (e) => { APP.setBgOpacity(+e.target.value / 100); e.target.previousElementSibling.textContent = "배경 밝기 " + e.target.value + "%"; };
          b.querySelectorAll("[data-copy]").forEach(x => x.onclick = async () => { try { await navigator.clipboard.writeText(HIGGS_PROMPTS[+x.dataset.copy][1]); toast("프롬프트를 복사했어요", { ok: true }); } catch (e) { toast("복사하지 못했어요", { bad: true }); } });
        } else if (k === "view") {
          b.innerHTML = '<div class="field"><label>화질</label><div class="seg" id="sQ">' + ["auto:자동", "high:높음", "low:낮음"].map(x => { const [v, l] = x.split(":"); return '<button type="button" data-v="' + v + '" class="' + (S.ui.quality === v ? "on" : "") + '">' + l + '</button>'; }).join("") + '</div></div><label class="row"><input type="checkbox" id="sRed" ' + (S.ui.reduced ? "checked" : "") + ' style="width:auto"> 움직임 줄이기</label><label class="row" style="margin-top:6px"><input type="checkbox" id="sFlat" ' + (S.ui.forceFlat ? "checked" : "") + ' style="width:auto"> 2D 목록으로 보기</label><label class="row" style="margin-top:6px"><input type="checkbox" id="sAuto" ' + (S.ui.autoLearn ? "checked" : "") + ' style="width:auto"> 파일을 넣으면 자동으로 학습</label><label class="row" style="margin-top:6px"><input type="checkbox" id="sFps" ' + (S.ui.showFps ? "checked" : "") + ' style="width:auto"> FPS 표시</label><div class="small" style="margin-top:10px">화질·2D 설정은 새로 고친 뒤 적용돼요. 글꼴: 영어·숫자 Orbitron, 한글 Noto Sans.</div>';
          b.querySelector("#sQ").querySelectorAll("button").forEach(x => x.onclick = () => { APP.saveUi({ quality: x.dataset.v }); b.querySelector("#sQ").querySelectorAll("button").forEach(y => y.classList.toggle("on", y === x)); });
          b.querySelector("#sRed").onchange = (e) => APP.saveUi({ reduced: e.target.checked });
          b.querySelector("#sFlat").onchange = (e) => APP.saveUi({ forceFlat: e.target.checked });
          b.querySelector("#sAuto").onchange = (e) => APP.saveUi({ autoLearn: e.target.checked });
          b.querySelector("#sFps").onchange = (e) => { APP.saveUi({ showFps: e.target.checked }); $("fpsTag").hidden = !e.target.checked; };
        } else if (k === "data") {
          let est = ""; try { const e = await navigator.storage.estimate(); est = TEXT.fmtBytes(e.usage || 0) + " 사용"; } catch (e) {}
          let persisted = false; try { persisted = await navigator.storage.persisted(); } catch (e) {}
          b.innerHTML = '<div class="kv"><b>이 브라우저</b><span>' + est + ' · ' + (persisted ? "영구 저장 허용됨" : '<button type="button" class="link" id="sPersist">영구 저장 요청</button>') + '</span><b>API 사용</b><span>이번 세션 ' + API.totals.calls + '회 · 입력 ' + API.totals.input.toLocaleString() + ' · 출력 ' + API.totals.output.toLocaleString() + ' 토큰</span></div><div class="small" style="margin:6px 0 14px">파일 원본은 저장하지 않고 추출한 글자와 분석 결과만 둬요 (브라우저 + Supabase). 배경 영상·그림은 예외로 이 브라우저에만 남고 백업에는 들어가지 않아요.</div><div class="actions" style="justify-content:flex-start"><button type="button" id="sExport">전체 백업 (JSON)</button><button type="button" id="sImport">불러오기</button><button type="button" class="danger" id="sWipe">이 브라우저 데이터 모두 지우기</button></div>';
          const sp = b.querySelector("#sPersist"); if (sp) sp.onclick = async () => { try { const ok = await navigator.storage.persist(); toast(ok ? "영구 저장이 허용됐어요" : "브라우저가 허용하지 않았어요"); show("data"); } catch (e) {} };
          b.querySelector("#sExport").onclick = () => APP.exportJson(null).then(r => toast("전체 백업을 내려받았어요 (" + TEXT.fmtBytes(r.size) + ")", { ok: true }));
          b.querySelector("#sImport").onclick = () => $("importInput").click();
          b.querySelector("#sWipe").onclick = () => { const v = prompt("선생님 " + S.teachers.size + "명과 모든 데이터를 이 브라우저와 클라우드 작업공간에서 지웁니다. 백업을 먼저 받아 두세요.\n'모두 지우기' 라고 입력하세요"); if (v === "모두 지우기") APP.wipeAll().then(() => { closeSheet(); toast("모두 지웠어요"); }); };
        }
      };
      el.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => show(b.dataset.tab));
      openSheet("설정", el, { kind: "settings" }); show(tab || "engine");
    }
    function openHelp() {
      const rows = [["N", "새 선생님"], ["O", "파일 넣기"], ["L / P / M", "학습 / 예측 / 적중 모의고사"], ["← →", "이전 / 다음 선생님"], ["[ / ]", "왼쪽 / 오른쪽 패널 접기"], ["Delete", "선택한 선생님 지우기"], ["Esc", "드로어·시트 닫기"], ["드래그", "무대 회전 · 휠로 확대"], ["파일 드롭", "홀로그램 위에 놓으면 그 선생님이 학습 · 칩으로 기출/범위/프린트 구분"]];
      openSheet("단축키", h('<div class="help">' + rows.map(r => '<div class="row" style="margin:6px 0"><kbd>' + esc(r[0]) + '</kbd>' + esc(r[1]) + '</div>').join("") + '</div>'), { kind: "help" });
    }
    async function setVideo(f) { try { await APP.setBgVideo(f); toast("배경을 저장했어요", { ok: true }); if ($("sheetWrap").dataset.kind === "settings") openSettings("bg"); } catch (e) { toast(e.message, { bad: true }); } }

    // ================= 시험지 미리보기 =================
    function openPaper(mock) {
      paperMock = mock; const t = T(mock.teacherId) || { school: "", grade: "", subject: "" };
      $("paperTitle").textContent = mock.title + " · " + mock.target;
      $("paperPage").innerHTML = GENERATE.paperHtml(mock, t) + (mock.failed && mock.failed.length ? '<div class="pk1" style="color:#a00">만들지 못한 문항: ' + mock.failed.map(f => esc(f.number) + "(" + esc(f.why) + ")").join(", ") + '</div>' : "");
      $("paper").classList.add("on");
    }
    async function paperDocx() {
      if (!paperMock) return; const t = T(paperMock.teacherId) || { school: "", grade: "", subject: "" };
      try { const blob = await GENERATE.docx(paperMock, t); APP.download(blob, (paperMock.title + " " + paperMock.target).replace(/[\\/:*?"<>|]/g, "") + ".docx"); toast("워드 파일을 내려받았어요", { ok: true }); } catch (e) { toast(e.message, { bad: true }); }
    }

    // ================= 독·엔진·클라우드·온보딩·칩 =================
    function renderDock() {
      const t = sel(), c = t ? S.counts.get(t.id) || {} : {}, p = t && S.profiles.get(t.id), pr = t && S.predictions.get(t.id), busy = t && S.busy.has(t.id);
      $("btnFiles").disabled = !t; $("btnLearn").disabled = !t || !c.questions || busy; $("btnPredict").disabled = !p || busy; $("btnMock").disabled = !pr || busy;
      const act = S.queue.filter(j => !["done", "error", "cancelled"].includes(j.stage)).length;
      $("queueMini").hidden = !act && !S.genCtrl; if (act || S.genCtrl) $("queueMini").innerHTML = (act ? '⟳ 처리 중 ' + Math.min(1, act) + ' · 대기 ' + Math.max(0, act - 1) + ' <button type="button" class="link" id="qCancelAll">모두 취소</button>' : "") + (S.genCtrl ? ' <button type="button" class="link" id="qAbortGen">출제 중단</button>' : ""); const qc = $("qCancelAll"); if (qc) qc.onclick = APP.cancelAll; const qa = $("qAbortGen"); if (qa) qa.onclick = () => APP.abortGenerate();
      $("engine").classList.toggle("busy", S.busy.size > 0 || act > 0);
      const lt = $("listenTitle"), ls = $("listenSub"); const job = S.queue.find(j => !["done", "error", "cancelled", "queued"].includes(j.stage)); const bt = [...S.busy.values()][0];
      if (lt) lt.textContent = job || bt ? "Thinking…" : "Listening…";
      if (ls) ls.textContent = job ? job.name + " · " + job.detail : bt ? bt : (t ? t.name + " 선생님 홀로그램에 파일을 끌어다 놓으면 읽어요" : "파일을 끌어다 놓으면 읽어요");
      const tk = $("listenTok"); if (tk) tk.textContent = API.totals.output ? (API.totals.input + API.totals.output).toLocaleString() + " tok" : "";
    }
    function updateEngine(ok) {
      const e = $("engine"); const has = API.ready();
      e.classList.remove("ok", "fail"); if (ok === true) e.classList.add("ok"); else if (ok === false) e.classList.add("fail"); else if (has) e.classList.add("ok");
      $("engineLabel").textContent = has ? API.modelLabel().toUpperCase() + (ok === false ? " · OFFLINE" : "") : "NO KEY";
      renderOnboard();
    }
    function updateCloud() {
      const c = SYNC.st, e = $("cloud"); e.classList.remove("ok", "fail", "busy");
      if (!c.enabled) { $("cloudLabel").textContent = "CLOUD OFF"; return; }
      if (c.status === "error") { e.classList.add("fail"); $("cloudLabel").textContent = "CLOUD OFFLINE"; }
      else if (c.status === "syncing" || c.pending) { e.classList.add("busy"); $("cloudLabel").textContent = "SYNCING " + (c.pending || ""); }
      else { e.classList.add("ok"); $("cloudLabel").textContent = "CLOUD · " + c.workspace.toUpperCase(); }
    }
    function renderOnboard() {
      const ob = $("onboard"); const done = S.ui.onboardingDone || (S.teachers.size && [...S.counts.values()].some(c => c.questions || c.passages));
      ob.hidden = !!done;
      if (done) { if (!S.ui.onboardingDone) APP.saveUi({ onboardingDone: true }); return; }
      const k = API.ready(), t = S.teachers.size > 0;
      $("ob1").className = "st " + (k ? "done" : "on"); $("ob2").className = "st " + (t ? "done" : k ? "on" : ""); $("ob3").className = "st " + (t ? "on" : "");
      $("ob1Btn").hidden = k; $("ob3Note").textContent = t ? "홀로그램(또는 카드)에 파일을 끌어다 놓거나 [파일 넣기]" : "선생님을 만들면 열려요";
    }
    function chipsLoop() {
      const st = APP.stage(); const box = $("chips");
      if (st) {
        const want = new Map();
        S.teachers.forEach((t, id) => { const busy = S.busy.get(id); const job = S.queue.find(j => j.teacherId === id && !["done", "error", "cancelled", "queued"].includes(j.stage)); const err = S.queue.find(j => j.teacherId === id && j.stage === "error");
          if (dropTarget === id) want.set(id, { cls: "drop", text: "여기에 놓으면 " + t.name + " 선생님이 학습해요" });
          else if (job) want.set(id, { cls: "busy", text: job.detail, prog: job.progress });
          else if (busy) want.set(id, { cls: "busy", text: busy });
          else if (err && Date.now() - (err.errAt || (err.errAt = Date.now())) < 15000) want.set(id, { cls: "err", text: "⚠ " + err.error.slice(0, 40) });
          else if (S.hoverId === id) { const c = S.counts.get(id) || {}; const p = S.profiles.get(id); want.set(id, { cls: "", text: t.name + " · 기출 " + (c.exams || 0) + " · 문항 " + (c.questions || 0) + " · 지문 " + (c.passages || 0) + (p ? " · V" + p.version : "") }); } });
        [...box.children].forEach(el => { if (!want.has(el.dataset.id)) el.remove(); });
        want.forEach((w, id) => { const a = st.anchor(id); if (!a) return; let el = box.querySelector('[data-id="' + id + '"]'); if (!el) { el = h('<div class="hchip" data-id="' + id + '"></div>'); box.appendChild(el); }
          el.className = "hchip " + w.cls; el.style.opacity = a.visible ? "1" : "0"; el.style.transform = "translate(" + Math.round(a.x) + "px," + Math.round(a.y) + "px) translate(-50%,-100%)";
          const txt = esc(w.text) + (w.prog !== undefined ? '<div class="bar"><i style="width:' + Math.round(w.prog * 100) + '%"></i></div>' : ""); if (el.innerHTML !== txt) el.innerHTML = txt; });
        if (S.ui.showFps) $("fpsTag").textContent = st.fps() + " FPS";
      }
      requestAnimationFrame(chipsLoop);
    }
    let waveE = 0.12, waveT = 0;
    function waveLoop() {
      const cv = $("wave"); if (cv && cv.offsetParent !== null) {
        const ctx = cv.getContext("2d"); const busy = S.busy.size > 0 || S.queue.some(j => !["done", "error", "cancelled", "queued"].includes(j.stage));
        const target = busy ? 0.8 : 0.14; waveE += (target - waveE) * 0.05; waveT += APP.calm() ? 0.01 : 0.05;
        const W = cv.width, H = cv.height; ctx.clearRect(0, 0, W, H);
        ctx.lineWidth = 3; ctx.strokeStyle = busy ? "#9fe3ff" : "rgba(159,227,255,.55)"; ctx.shadowColor = "#5fc8ff"; ctx.shadowBlur = busy ? 12 : 4; ctx.beginPath();
        for (let x = 0; x <= W; x += 4) { const win = 0.5 - 0.5 * Math.cos(2 * Math.PI * x / W); const y = H / 2 + 34 * waveE * win * (Math.sin(x * 0.05 + waveT * 6) + 0.5 * Math.sin(x * 0.12 - waveT * 9) + 0.25 * Math.sin(x * 0.27 + waveT * 13)); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke(); ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(95,200,255,.18)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
      }
      setTimeout(waveLoop, 50);
    }

    // ================= 2D 폴백 =================
    function renderFlat() {
      if (S.mode !== "flat") return;
      const g = $("flatGrid");
      g.innerHTML = [...S.teachers.values()].map(t => { const c = S.counts.get(t.id) || {}, p = S.profiles.get(t.id), busy = S.busy.has(t.id) || S.queue.some(j => j.teacherId === t.id && !["done", "error", "cancelled", "queued"].includes(j.stage));
        return '<div class="tcard' + (S.selectedId === t.id ? " on" : "") + (busy ? " busy" : "") + '" data-id="' + t.id + '" style="--c:' + t.color + '"><div class="ring"></div><h3>' + esc(t.name) + '</h3><p>' + esc(APP.sub(t)) + '</p><div class="nums"><span><b>' + (c.exams || 0) + '</b>기출</span><span><b>' + (c.questions || 0) + '</b>문항</span><span><b>' + (c.passages || 0) + '</b>지문</span><span><b>' + (p ? "V" + p.version : "—") + '</b>학습</span></div><div class="bar" style="margin-top:8px"><i style="width:' + Math.min(100, (c.questions || 0) / 1.5) + '%"></i></div>' + (busy ? '<div class="small" style="text-align:center">' + esc(S.busy.get(t.id) || (S.queue.find(j => j.teacherId === t.id) || {}).detail || "") + '</div>' : "") + '</div>'; }).join("") + '<div class="tcard new" id="flatNew">＋ 새 선생님</div>';
      g.querySelectorAll(".tcard[data-id]").forEach(el => {
        el.onclick = () => APP.select(el.dataset.id);
        ["dragover", "dragenter"].forEach(ev => el.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); el.classList.add("over"); }));
        ["dragleave", "drop"].forEach(ev => el.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); el.classList.remove("over"); }));
        el.addEventListener("drop", e => { const files = [...e.dataTransfer.files]; if (files.length) APP.enqueue(files, el.dataset.id); });
      });
      $("flatNew").onclick = () => openTeacherSheet(null);
    }

    // ================= 드래그앤드롭(무대) =================
    function bindDrop() {
      let raf = 0, lastXY = null;
      document.addEventListener("dragenter", e => { if (!hasFiles(e)) return; e.preventDefault(); document.body.classList.add("dragging"); });
      document.addEventListener("dragover", e => { if (!hasFiles(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = "copy"; lastXY = [e.clientX, e.clientY]; if (!raf) raf = requestAnimationFrame(() => { raf = 0; const st = APP.stage(); const id = st && lastXY ? st.pick(lastXY[0], lastXY[1]) : null; if (id !== dropTarget) { if (st && dropTarget) st.fx.highlight(dropTarget, false); dropTarget = id; if (st && id) st.fx.highlight(id, true); } }); });
      document.addEventListener("dragleave", e => { if (e.relatedTarget === null || e.clientX <= 0 || e.clientY <= 0) { document.body.classList.remove("dragging"); clearDrop(); } });
      document.addEventListener("drop", e => {
        if (!hasFiles(e)) return; e.preventDefault(); document.body.classList.remove("dragging");
        if (e.target.closest && (e.target.closest("#sheetWrap") || e.target.closest(".tcard"))) { clearDrop(); return; }
        const files = [...e.dataTransfer.files]; const st = APP.stage(); const id = st ? st.pick(e.clientX, e.clientY) : null; const at = { x: e.clientX, y: e.clientY };
        clearDrop();
        if (!files.length) return;
        const media = files.filter(f => /\.(mp4|webm|jpg|jpeg|png|webp)$/i.test(f.name)), docs = files.filter(f => !/\.(mp4|webm|jpg|jpeg|png|webp)$/i.test(f.name));
        if (media.length && !docs.length && !/\.(jpg|jpeg|png|webp)$/i.test(media[0].name)) toast("배경 영상으로 쓸까요? " + media[0].name, { action: "배경으로 쓰기", onAction: () => setVideo(media[0]) });
        else if (media.length && /\.(jpg|jpeg|png|webp)$/i.test(media[0].name) && !docs.length) toast("그림을 배경으로 쓸까요? (시험지 사진이면 '시험지로 읽기')", { action: "배경으로", onAction: () => setVideo(media[0]) }).appendChild(h('<button type="button">시험지로 읽기</button>')).onclick = () => { const t = sel(); if (t) APP.enqueue(media, t.id, at); else toast("먼저 선생님을 골라 주세요"); };
        if (!docs.length) return;
        if (id) { APP.enqueue(docs, id, at); return; }
        if (!S.teachers.size) { openTeacherSheet(null, docs); return; }
        const t = sel();
        if (t) toast("선택한 " + t.name + " 선생님에게 넣을까요?", { action: "넣기", onAction: () => APP.enqueue(docs, t.id, at) });
        else openPickSheet(docs);
      });
      function clearDrop() { const st = APP.stage(); if (st && dropTarget) st.fx.highlight(dropTarget, false); dropTarget = null; }
      function hasFiles(e) { return e.dataTransfer && [...(e.dataTransfer.types || [])].includes("Files"); }
    }
    function openPickSheet(files) {
      const el = h('<div><div class="tlist">' + [...S.teachers.values()].map(t => '<div class="it" data-pick="' + t.id + '"><i class="dot" style="background:' + t.color + ';color:' + t.color + '"></i><span class="grow">' + esc(t.name) + '</span><span class="small">' + esc(APP.sub(t)) + '</span></div>').join("") + '</div><div class="actions"><button type="button" id="pickNew">새 선생님 만들기</button></div></div>');
      el.querySelectorAll("[data-pick]").forEach(x => x.onclick = () => { closeSheet(); APP.enqueue(files, x.dataset.pick); });
      el.querySelector("#pickNew").onclick = () => openTeacherSheet(null, files);
      openSheet("어느 선생님에게 넣을까요?", el, { kind: "pick" });
    }
    async function run(fn) {
      try { return await fn(); }
      catch (e) { console.error(e); toast(API.friendly(e), { bad: true }); if (e.code === "no_key" || e.code === "bad_key") openSettings("engine"); return null; }
    }

    // ================= 초기화 =================
    function init() {
      $("btnNew").onclick = () => openTeacherSheet(null);
      $("btnFiles").onclick = () => { if (sel()) $("fileInput").click(); };
      $("fileInput").accept = EXTRACT.ACCEPT + ",.mp4,.webm";
      $("fileInput").onchange = () => { const t = sel(); const files = [...$("fileInput").files]; $("fileInput").value = ""; if (t && files.length) { const jobs = APP.enqueue(files, t.id); if (pendingKind) { jobs.forEach(j => APP.setJobKind(j, pendingKind)); pendingKind = null; } } };
      $("importInput").onchange = async () => { const f = $("importInput").files[0]; $("importInput").value = ""; if (!f) return; try { const r = await APP.importJson(f); toast("불러왔어요 — 선생님 " + r.teachers + "명" + (r.dupSkipped ? ", 겹친 파일 " + r.dupSkipped + "개는 건너뛰었어요" : ""), { ok: true }); closeSheet(); } catch (e) { toast(e.message, { bad: true }); } };
      $("videoInput").onchange = () => { const f = $("videoInput").files[0]; $("videoInput").value = ""; if (f) setVideo(f); };
      $("btnLearn").onclick = () => { const t = sel(); if (t) run(() => APP.learn(t.id, { force: true })); };
      $("btnPredict").onclick = openPredictSheet;
      $("btnMock").onclick = openMockSheet;
      $("btnExport").onclick = (e) => {
        if (menu) { menu.remove(); menu = null; return; }
        const t = sel();
        menu = h('<div class="menu glass"><button type="button" data-a="all">전체 백업 (JSON)</button><button type="button" data-a="one"' + (t ? "" : " disabled") + '>이 선생님만 (JSON)</button><button type="button" data-a="bp"' + (t && S.predictions.get(t.id) ? "" : " disabled") + '>청사진 복사 → 동형 모의고사 생성기</button><button type="button" data-a="mocks"' + (t ? "" : " disabled") + '>지난 모의고사</button><button type="button" data-a="prints"' + (t ? "" : " disabled") + '>프린트 반영율</button><button type="button" data-a="import">JSON 불러오기…</button></div>');
        const r = e.currentTarget.getBoundingClientRect(); menu.style.left = r.left + "px"; menu.style.bottom = (window.innerHeight - r.top + 8) + "px"; document.body.appendChild(menu);
        menu.querySelectorAll("button").forEach(b => b.onclick = () => { const a = b.dataset.a; menu.remove(); menu = null; if (a === "all") APP.exportJson(null).then(x => toast("전체 백업을 내려받았어요 (" + TEXT.fmtBytes(x.size) + ")", { ok: true })); else if (a === "one") APP.exportJson(t.id).then(() => toast(t.name + " 선생님 데이터를 내려받았어요", { ok: true })); else if (a === "bp") copyBlueprint(); else if (a === "mocks") openDrawer("mocks"); else if (a === "prints") openDrawer("handouts"); else if (a === "import") $("importInput").click(); });
        setTimeout(() => document.addEventListener("click", function off(ev) { if (menu && !menu.contains(ev.target)) { menu.remove(); menu = null; } document.removeEventListener("click", off); }), 0);
      };
      $("btnSettings").onclick = () => openSettings("engine"); $("engine").onclick = () => openSettings("engine"); $("cloud").onclick = () => openSettings("cloud"); $("btnHelp").onclick = openHelp;
      $("ob1Btn").onclick = () => openSettings("engine"); $("ob2Btn").onclick = () => openTeacherSheet(null);
      $("btnEditTeacher").onclick = () => { const t = sel(); if (t) openTeacherSheet(t); };
      $("sheetClose").onclick = closeSheet; $("sheetWrap").addEventListener("click", e => { if (e.target === $("sheetWrap")) closeSheet(); });
      $("drawerClose").onclick = closeDrawer; $("drawerBack").onclick = drawerBack;
      $("togL").onclick = () => { document.body.classList.toggle("hideL"); $("togL").textContent = document.body.classList.contains("hideL") ? "›" : "‹"; };
      $("togR").onclick = () => { document.body.classList.toggle("hideR"); $("togR").textContent = document.body.classList.contains("hideR") ? "‹" : "›"; };
      $("paperClose").onclick = () => $("paper").classList.remove("on"); $("paperPrint").onclick = () => window.print(); $("paperDocx").onclick = paperDocx;
      $("paperCopy").onclick = async () => { const txt = $("paperPage").innerText; try { await navigator.clipboard.writeText(txt); toast("본문을 복사했어요", { ok: true }); } catch (e) { toast("복사하지 못했어요", { bad: true }); } };
      document.addEventListener("keydown", (e) => {
        const tag = (e.target.tagName || "").toLowerCase(); if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) { if (e.key === "Escape") closeSheet(); return; }
        if (e.key === "Escape") { if ($("paper").classList.contains("on")) $("paper").classList.remove("on"); else if ($("sheetWrap").classList.contains("on")) closeSheet(); else if ($("drawer").classList.contains("on")) closeDrawer(); else if (menu) { menu.remove(); menu = null; } return; }
        if ($("sheetWrap").classList.contains("on") || $("paper").classList.contains("on")) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const k = e.key.toLowerCase(); const t = sel();
        if (k === "n") openTeacherSheet(null); else if (k === "o" && t) $("fileInput").click(); else if (k === "l" && t) run(() => APP.learn(t.id, { force: true })); else if (k === "p" && t) openPredictSheet(); else if (k === "m" && t) openMockSheet();
        else if (k === "[") $("togL").click(); else if (k === "]") $("togR").click(); else if (k === "?") openHelp(); else if (e.key === "Delete" && t) openDeleteSheet(t);
        else if (e.key === "ArrowLeft" || e.key === "ArrowRight") { const ids = [...S.teachers.keys()]; if (!ids.length) return; let i = ids.indexOf(S.selectedId); i = (i + (e.key === "ArrowRight" ? 1 : -1) + ids.length) % ids.length; APP.select(ids[i]); }
      });
      bindDrop();
      SYNC.on(() => { updateCloud(); });
      APP.on((why, data) => {
        if (why === "boot") { updateEngine(); updateCloud(); renderAll(); renderDock(); renderFlat(); renderOnboard(); $("fpsTag").hidden = !S.ui.showFps; const school = [...S.teachers.values()][0]; if (school) { $("wordsSchool").textContent = (school.school === "흑석고" ? "흑석고등학교" : school.school) + " · " + [...new Set([...S.teachers.values()].map(x => x.subject))].join(" · "); $("brandSub").textContent = (school.school === "흑석고" ? "흑석고" : school.school) + " 영어 출제 오라클"; }
          if (S.cloud && S.cloud.error) toast("Supabase 에 연결하지 못해 이 브라우저 저장소로만 갑니다 (" + S.cloud.error.slice(0, 60) + ")", { bad: true, ms: 8000 });
          if (!API.ready()) setTimeout(() => toast("먼저 설정에서 API 키를 저장해 주세요 — 동형 모의고사 생성기에 저장한 키가 있으면 그대로 써요", { action: "설정 열기", onAction: () => openSettings("engine") }), 800); }
        else if (why === "teachers" || why === "select" || why === "data") { renderAll(); renderDock(); renderFlat(); renderOnboard(); if (why === "select") closeDrawer(); }
        else if (why === "queue") { renderStatus(); renderIntel(); renderDock(); renderFlat(); renderOnboard(); }
        else if (why === "busy") { renderDock(); renderFlat(); renderStatus(); }
        else if (why === "profile") { renderAll(); renderDock(); renderFlat(); toast("학습 완료 — 프로파일 V" + data.rec.version + (data.delta.length ? " · " + data.delta[0] : ""), { ok: true }); }
        else if (why === "prediction") { renderAll(); renderDock(); toast("예측 완료 — 유력 지문 " + data.rec.blueprint.passages.length + "개", { ok: true }); }
        else if (why === "mock") { renderDock(); renderStatus(); openPaper(data); toast("모의고사가 완성됐어요 — " + data.questions.length + "문항" + (data.failed.length ? " (" + data.failed.length + "문항은 만들지 못했어요)" : ""), { ok: true }); }
        else if (why === "toast") toast(data.msg, data);
        else if (why === "needKey") openSettings("engine");
        else if (why === "askVideo") toast("배경 영상으로 쓸까요? " + data.name, { action: "배경으로 쓰기", onAction: () => setVideo(data) });
      });
      requestAnimationFrame(chipsLoop); waveLoop(); globeLoop();
    }
    return { init, toast, openSettings, openTeacherSheet, openPaper, openDrawer };
  })();
