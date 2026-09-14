  // ==================================================================
  //  UI — 셸 (spec §5.11): 토스트 · 시트 전부 · 설정 6탭 · 도움말 · 시험지 · ⌘K 팔레트 · 자동완성 · 키보드 · 전역 드롭
  //        · nav/topbar/statusbar/tabbar · 온보딩 · 라우팅 규칙(§5.15) · 옛 호출 어댑터(openDrawer)
  //  뷰 안의 내용은 VIEWS(오늘 · 인박스 · 서재 · 태그 · 타임라인 · 물어보기 · 검색) · NOTEUI(노트) · BRAINUI(브레인)가 그린다.
  //  개인 UI 상태(nav/aside 접힘 · 최근 노트 · 첫 화면 · changedSeen …)는 localStorage `orun_oracle_ui2` (§4.6).
  // ==================================================================
  const UI = (function () {
    const $ = (id) => document.getElementById(id), esc = TEXT.esc, S = APP.state;
    const h = (html) => { const t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; };
    const pct = (v) => Math.round((+v || 0) * 100) + "%";
    const T = (id) => APP.teacher(id);
    const sel = () => (S.selectedId && S.selectedId !== APP.ALL) ? T(S.selectedId) || null : null;   // 선택된 선생님 ("*" 이면 null)
    const scopeId = () => S.selectedId || null;                                                       // 검색 · 물어보기 범위 ("*" 포함)
    const ACTIVE = (j) => !["done", "error", "cancelled"].includes(j.stage);
    const RUNNING = (j) => !["done", "error", "cancelled", "queued"].includes(j.stage);
    const UI2 = "orun_oracle_ui2";
    const VIEW_LABEL = { today: "오늘", inbox: "인박스", note: "노트", tag: "태그", library: "서재", brain: "브레인", timeline: "타임라인", ask: "물어보기", search: "검색" };
    const KIND_LABEL = { teacher: "선생님", exam: "시험", question: "문항", passage: "지문", source: "자료", handout: "프린트", profile: "프로파일", prediction: "예측", mock: "모의고사", note: "메모", ask: "질문", tag: "태그" };
    const LIB_LABEL = { exams: "시험", questions: "문항", passages: "지문", sources: "자료", profiles: "프로파일", predictions: "예측", mocks: "모의고사", notes: "메모" };
    let paperMock = null, menu = null, pendingKind = null, pendingFiles = null, cur = null, navCounts = {}, growthCache = null, bootDone = false;

    // ---- 개인 UI 상태 (localStorage, 거울하지 않음) ----
    function ui2() { try { return JSON.parse(localStorage.getItem(UI2) || "{}") || {}; } catch (e) { return {}; } }
    function ui2set(patch) { try { localStorage.setItem(UI2, JSON.stringify(Object.assign(ui2(), patch || {}))); } catch (e) {} }
    const isNarrow = () => document.body.classList.contains("narrow");
    const isMobile = () => /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth < 900);

    // ================= 아이콘 (§6.8 — 1.5px 선 · 16px · 이모지 없음) =================
    const ICONS = {
      home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
      inbox: '<svg viewBox="0 0 24 24"><path d="M4 4h16v11h-5l-2 3h-2l-2-3H4z"/><path d="M4 15v5h16v-5"/></svg>',
      library: '<svg viewBox="0 0 24 24"><path d="M4 4h4v16H4zM10 4h4v16h-4zM16 5l4 1-3 14-4-1z"/></svg>',
      brain: '<svg viewBox="0 0 24 24"><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 3 3 3 0 0 0 2 3v1a3 3 0 0 0 3 3h1V4H9zM15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 3 3 3 0 0 1-2 3v1a3 3 0 0 1-3 3h-1V4h1z"/></svg>',
      timeline: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h13"/></svg>',
      ask: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5M12 17h.01"/></svg>',
      tag: '<svg viewBox="0 0 24 24"><path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/></svg>',
      link: '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/></svg>',
      backlink: '<svg viewBox="0 0 24 24"><path d="M14 10a4 4 0 0 1 5.7 0l0 0a4 4 0 0 1 0 5.7l-3 3a4 4 0 0 1-5.7-5.7"/><path d="M10 14a4 4 0 0 1-5.7 0 4 4 0 0 1 0-5.7l3-3a4 4 0 0 1 5.7 5.7"/><path d="M4 4l4 4"/></svg>',
      search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
      pin: '<svg viewBox="0 0 24 24"><path d="M12 17v5M8 17h8l-1-5 2-2V7l1-2H6l1 2v3l2 2z"/></svg>',
      note: '<svg viewBox="0 0 24 24"><path d="M5 4h11l3 3v13H5z"/><path d="M8 10h8M8 14h8M8 18h5"/></svg>',
      camera: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
      check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>',
      more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>',
      full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>',
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
      mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
      teacher: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
      file: '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
      copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></svg>',
      trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
      x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    };
    const irow = (ic, label, sub, st, cls, attrs) => '<div class="irow' + (cls ? " " + cls : "") + '"' + (attrs || "") + '><span class="ic">' + (ICONS[ic] || "") + '</span><span class="lb">' + esc(label) + (sub ? '<small>' + esc(sub) + '</small>' : "") + '</span>' + (st !== undefined ? '<span class="st ' + (st.cls || "") + '">' + esc(st.text) + '</span>' : "") + '</div>';

    // ================= 토스트 =================
    // toast(msg, { ok, bad, ms, action, onAction }) → el. 액션 버튼(예: 5초 취소)은 action/onAction.
    function toast(msg, o) {
      o = o || {};
      const el = h('<div class="toast' + (o.bad ? " bad" : o.ok ? " ok" : "") + '" role="status"><span>' + esc(msg) + '</span></div>');
      if (o.action) { const b = h('<button type="button">' + esc(o.action) + '</button>'); b.onclick = () => { el.remove(); o.onAction && o.onAction(); }; el.appendChild(b); }
      $("toasts").appendChild(el);
      setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 300); }, o.ms || (o.action ? 9000 : 4200));
      return el;
    }

    // ================= 시트 =================
    function openSheet(title, bodyEl, o) {
      closeMenu(); closeCmdk();
      $("sheetTitle").textContent = title; const b = $("sheetBody"); b.innerHTML = ""; b.appendChild(bodyEl);
      $("sheetWrap").classList.add("on"); $("sheetWrap").dataset.kind = (o && o.kind) || "";
      const f = b.querySelector("input:not([type=checkbox]):not([type=hidden]), select, textarea"); if (f) setTimeout(() => f.focus(), 50);
    }
    function closeSheet() { const w = $("sheetWrap"); if (document.activeElement && w.contains(document.activeElement)) { try { document.activeElement.blur(); } catch (e) {} } w.classList.remove("on"); w.dataset.kind = ""; pendingFiles = null; }
    const sheetOpen = () => $("sheetWrap").classList.contains("on");
    const paperOpen = () => $("paper").classList.contains("on");

    // ---- 선생님 시트 (#tf*) ----
    function teacherForm(t) {
      const SCHOOLS = ["흑석고", "경문고", "동작고", "상도고", "성남고", "수도여고", "숭의여고", "중앙대사대부고"];
      const SUBJ = ["영어A", "영어B", "공통영어", "영어I", "영어II", "영어독해와작문", "실용영어", "영어"];
      const el = h('<div><div class="field"><label>이름</label><input type="text" id="tfName" placeholder="예) 윤은영" maxlength="20" value="' + esc(t ? t.name : "") + '"></div><div class="field"><label>학교</label><input type="text" id="tfSchool" list="schoolList" placeholder="학교 이름" value="' + esc(t ? t.school : "흑석고") + '"><datalist id="schoolList">' + SCHOOLS.map(x => '<option value="' + x + '">').join("") + '</datalist></div><div class="row"><div class="field grow"><label>학년</label><div class="seg" id="tfGrade">' + [1, 2, 3].map(g => '<button type="button" data-v="' + g + '" class="' + ((t ? t.grade : 1) === g ? "on" : "") + '">' + g + '학년</button>').join("") + '</div></div></div><div class="field"><label>과목</label><div class="seg" id="tfSubj">' + SUBJ.map(x => '<button type="button" data-v="' + x + '" class="' + ((t ? t.subject : "영어A") === x ? "on" : "") + '">' + x + '</button>').join("") + '</div><input type="text" id="tfSubjOther" placeholder="다른 과목 이름" style="margin-top:6px" value="' + esc(t && !SUBJ.includes(t.subject) ? t.subject : "") + '"></div><div class="field"><label>색</label><div class="swatches" id="tfColor">' + APP.PALETTE.map(c => '<span class="sw' + ((t ? t.color : "") === c ? " on" : "") + '" data-v="' + c + '" style="background:' + c + '" title="' + c + '"></span>').join("") + '</div></div><div class="err" id="tfErr"></div><div class="actions">' + (t ? '<button type="button" class="danger" id="tfDel">이 선생님 지우기</button><span class="grow"></span>' : "") + '<button type="button" id="tfCancel">취소</button><button type="button" class="pri" id="tfOk">' + (t ? "저장" : "만들기") + '</button></div></div>');
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
        else { const nt = await APP.createTeacher(d); toast(nt.name + " 선생님을 만들었어요", { ok: true }); if (pf && pf.length) openFilesSheet(pf, nt.id); } };
      f.el.querySelector("#tfOk").onclick = submit; f.el.querySelector("#tfCancel").onclick = closeSheet;
      const del = f.el.querySelector("#tfDel"); if (del) del.onclick = () => { closeSheet(); openDeleteSheet(t); };
      f.el.addEventListener("keydown", (e) => { if (e.isComposing || e.keyCode === 229) return; if (e.key === "Enter" && e.target.tagName === "INPUT") { e.preventDefault(); submit(); } });
      openSheet(t ? "선생님 정보" : "새 선생님", f.el, { kind: "teacher" });
    }
    // ---- 삭제 시트 (#del*) ----
    function openDeleteSheet(t) {
      t = t || sel(); if (!t) { toast("선생님을 골라 주세요"); return; }
      const c = S.counts.get(t.id) || {}, p = S.profiles.get(t.id), busy = S.busy.has(t.id);
      const el = h('<div><p>' + esc(t.name) + ' 선생님과 기출 ' + (c.exams || 0) + '건 · 문항 ' + (c.questions || 0) + '개 · 지문 ' + (c.passages || 0) + '개 · 프로파일 ' + (p ? p.version : 0) + '판을 모두 지웁니다. 클라우드(Supabase)에서도 지워져요. 되돌릴 수 없어요.</p><p class="small">이 선생님에 붙은 내 메모 · 질문은 지우지 않고 "삭제된 …에 붙어 있던 메모" 로 남아요.</p>' + (busy ? '<div class="err">학습·예측·출제가 끝난 뒤 지울 수 있어요</div>' : "") + (c.questions ? '<div class="field"><label>확인을 위해 이름을 입력하세요</label><input type="text" id="delName"></div>' : "") + '<div class="actions"><button type="button" id="delExport">먼저 JSON 으로 내보내기</button><button type="button" id="delCancel">취소</button><button type="button" class="danger" id="delGo"' + (busy ? " disabled" : "") + '>지우기</button></div></div>');
      el.querySelector("#delExport").onclick = () => APP.exportJson(t.id).then(r => toast(t.name + " 선생님 데이터를 내려받았어요 (" + TEXT.fmtBytes(r.size) + ")", { ok: true }));
      el.querySelector("#delCancel").onclick = closeSheet;
      el.querySelector("#delGo").onclick = async () => { const inp = el.querySelector("#delName"); if (inp && inp.value.trim() !== t.name) { toast("이름이 달라요", { bad: true }); return; } closeSheet(); await APP.deleteTeacher(t.id); if (!S.teachers.has(t.id)) { toast(t.name + " 선생님을 지웠어요"); if (cur && cur.view === "note" && cur.id === t.id) ROUTE.go("#/today", { replace: true }); } };
      openSheet(t.name + " 선생님을 지울까요?", el, { kind: "delete" });
    }
    // ---- 파일 시트 "두뇌에 넣기" ([data-k] #fsMemo #fsCancel #fsGo) ----
    // presetKind 가 없으면 인박스의 #inboxKind(auto 가 아닐 때)가 기본 칩이 된다(옛 pendingKind).
    function inboxKind() { const b = document.querySelector("#inboxKind .on"); const v = b ? b.dataset.v : "auto"; return v && v !== "auto" ? v : null; }
    function openFilesSheet(files, teacherId, at, presetKind) {
      files = [...files]; const t = T(teacherId); if (!t || !files.length) return;
      presetKind = presetKind || pendingKind || inboxKind(); pendingKind = null;
      const KL = { auto: "자동", exam: "기출", scope: "범위", handout: "프린트" }, ORDER = ["auto", "exam", "scope", "handout"];
      const kinds = files.map(f => presetKind || (TEXT.guessKind(f.name, "").sure ? TEXT.guessKind(f.name, "").kind : "auto"));
      const chipCls = (k) => "chip" + (k === "auto" ? " dim" : k === "scope" ? " gold" : k === "handout" ? " gold" : "");
      const el = h('<div><div class="small" style="margin-bottom:8px"><b style="color:var(--ink)">' + esc(t.name) + '</b> 선생님의 두뇌에 ' + files.length + '개를 넣어요. 종류 칩을 눌러 바꿀 수 있어요 (자동 → 기출 → 범위 → 프린트).</div>'
        + '<div class="tlist flist">' + files.map((f, i) => '<div class="it" style="cursor:default"><span class="grow" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(f.name) + '">' + esc(f.name) + '</span><span class="small">' + TEXT.fmtBytes(f.size) + '</span><button type="button" class="' + chipCls(kinds[i]) + '" data-k="' + i + '">' + KL[kinds[i]] + '</button></div>').join("") + '</div>'
        + '<div class="field" style="margin-top:12px"><label>AI 에게 함께 전할 말 (선택)</label><textarea id="fsMemo" maxlength="600" placeholder="예) 2학기 기말 시험지예요. 서술형은 마지막 장에 있어요 · 이 프린트는 어법 정리 위주예요 · 교과서는 3과까지만 범위예요"></textarea><div class="small">파일 종류 판정, 시험 정보, 문항·지문 해석에 반영돼요. 넣은 뒤에도 노트 위쪽 "넣을 때 AI 에게 전한 말" 에서 볼 수 있어요. 내 메모와는 다른 칸이에요.</div></div>'
        + '<div class="actions"><button type="button" id="fsCancel">취소</button><button type="button" class="pri" id="fsGo">넣기</button></div></div>');
      el.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { const i = +b.dataset.k; kinds[i] = ORDER[(ORDER.indexOf(kinds[i]) + 1) % ORDER.length]; b.textContent = KL[kinds[i]]; b.className = chipCls(kinds[i]); });
      const go = () => { const memo = el.querySelector("#fsMemo").value.trim(); closeSheet(); APP.enqueue(files, teacherId, at, { memo, kinds: kinds.map(k => k === "auto" ? "" : k) }); if (!cur || (cur.view !== "inbox" && cur.view !== "today" && cur.view !== "brain")) toast("인박스에 넣었어요", { action: "인박스 열기", onAction: () => ROUTE.go("#/inbox") }); };
      el.querySelector("#fsGo").onclick = go; el.querySelector("#fsCancel").onclick = closeSheet;
      el.querySelector("#fsMemo").addEventListener("keydown", e => { if (e.isComposing || e.keyCode === 229) return; if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); go(); } });
      openSheet("두뇌에 넣기", el, { kind: "files" });
    }
    // ---- 선생님 고르기 시트 ([data-pick] #pickNew) ----
    function openPickSheet(files) {
      const el = h('<div><div class="tlist">' + [...S.teachers.values()].map(t => '<div class="it" data-pick="' + t.id + '"><i class="dot" style="background:' + esc(t.color) + '"></i><span class="grow">' + esc(t.name) + '</span><span class="small">' + esc(APP.sub(t)) + '</span></div>').join("") + '</div><div class="actions"><button type="button" id="pickNew">새 선생님 만들기</button></div></div>');
      el.querySelectorAll("[data-pick]").forEach(x => x.onclick = () => { closeSheet(); openFilesSheet(files, x.dataset.pick); });
      el.querySelector("#pickNew").onclick = () => openTeacherSheet(null, files);
      openSheet("어느 선생님에게 넣을까요?", el, { kind: "pick" });
    }
    // ---- 예측 시트 (#pdYear #pdSem #pdTerm #pdDate #pdCancel #pdGo) ----
    function openPredictSheet(teacherId) {
      const t = teacherId ? T(teacherId) : sel(); if (!t) { toast("선생님을 골라 주세요"); return; }
      if (!S.profiles.get(t.id)) { toast("먼저 학습을 해 주세요"); return; }
      DB.where("exams", "teacherId", t.id).then(exams => {
        const d = APP.defaultTarget(exams);
        const prev = S.predictions.get(t.id); const prevDate = prev && prev.target && prev.target.date ? prev.target.date : "";
        const el = h('<div><div class="field"><label>어느 시험을 예측할까요</label><div class="row"><input type="number" id="pdYear" value="' + d.year + '" style="width:90px"><div class="seg" id="pdSem">' + [1, 2].map(v => '<button type="button" data-v="' + v + '" class="' + (d.semester === v ? "on" : "") + '">' + v + '학기</button>').join("") + '</div><div class="seg" id="pdTerm">' + ["중간", "기말", "1차지필", "2차지필"].map(v => '<button type="button" data-v="' + v + '" class="' + (d.term === v ? "on" : "") + '">' + v + '</button>').join("") + '</div></div></div><div class="field"><label>시험 날짜 (선택 — 오늘 화면에 D-day 가 떠요)</label><input type="date" id="pdDate" value="' + esc(prevDate) + '" style="width:auto"></div><div class="small">이 시험용 범위 원문과 선생님 프린트를 넣어 두면 유력 지문이 정확해져요. 프린트에 실린 지문은 과거 반영율만큼 우선해요.</div><div class="actions"><button type="button" id="pdCancel">취소</button><button type="button" class="pri" id="pdGo">예측</button></div></div>');
        el.querySelectorAll(".seg").forEach(x => x.querySelectorAll("button").forEach(b => b.onclick = () => { x.querySelectorAll("button").forEach(y => y.classList.remove("on")); b.classList.add("on"); }));
        el.querySelector("#pdCancel").onclick = closeSheet;
        const go = () => { const year = +el.querySelector("#pdYear").value || d.year, semester = +el.querySelector("#pdSem .on").dataset.v, term = el.querySelector("#pdTerm .on").dataset.v, date = el.querySelector("#pdDate").value || null; closeSheet(); run(() => APP.predict(t.id, { label: year + " " + semester + "학기 " + term, year, semester, term, date })); };
        el.querySelector("#pdGo").onclick = go;
        el.addEventListener("keydown", e => { if (e.isComposing || e.keyCode === 229) return; if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); go(); } });
        openSheet("다음 시험 예측", el, { kind: "predict" });
      });
    }
    // ---- 모의고사 시트 (#mkCount [data-src] #mkStrength #mkExtra #mkCancel #mkGo) — o.sourceIds 면 그 자료만 체크(지문 노트의 #pMock) ----
    async function openMockSheet(teacherId, o) {
      if (teacherId && typeof teacherId === "object") { o = teacherId; teacherId = null; }
      o = o || {};
      const t = teacherId ? T(teacherId) : sel(); if (!t) { toast("선생님을 골라 주세요"); return; }
      const pr = S.predictions.get(t.id); if (!pr) { toast("먼저 예측을 해 주세요"); return; }
      const sources = (await DB.where("sources", "teacherId", t.id)).filter(x => x.passages > 0);
      const only = Array.isArray(o.sourceIds) && o.sourceIds.length ? new Set(o.sourceIds) : null;
      const el = h('<div><div class="field"><label>문항 수</label><div class="row"><div class="seg" id="mkCount"><button type="button" data-v="" class="on">예측대로 (' + pr.blueprint.plan.total + '문항)</button><button type="button" data-v="10">10</button><button type="button" data-v="15">15</button><button type="button" data-v="20">20</button></div></div></div><div class="field"><label>쓸 자료</label>' + (sources.length ? sources.map(x => '<label class="row" style="margin:2px 0"><input type="checkbox" data-src="' + x.id + '"' + (!only || only.has(x.id) ? " checked" : "") + '> ' + esc(x.name) + ' <span class="small">' + esc(x.kind) + ' · 지문 ' + x.passages + '</span></label>').join("") : '<div class="small">지문이 있는 자료가 없어요 — 범위 원문을 먼저 넣어 주세요</div>') + '</div><div class="field"><label>예측 반영</label><div class="seg" id="mkStrength"><button type="button" data-v="tight" class="on">유력 지문 위주</button><button type="button" data-v="wide">범위 고르게</button></div></div><div class="field"><label>추가 요청 (선택)</label><textarea id="mkExtra" placeholder="예) 서술형은 조건영작만, 어법은 밑줄 5개 고정">' + esc(o.extra || "") + '</textarea></div><div class="small">문항 5개씩 나눠 만들어요. 20문항이면 보통 2~4분 걸리고, 만든 뒤 화면·인쇄·워드로 볼 수 있어요. 상태줄의 [출제 중단] 으로 멈출 수 있어요.</div><div class="actions"><button type="button" id="mkCancel">취소</button><button type="button" class="pri" id="mkGo">만들기</button></div></div>');
      el.querySelectorAll(".seg").forEach(x => x.querySelectorAll("button").forEach(b => b.onclick = () => { x.querySelectorAll("button").forEach(y => y.classList.remove("on")); b.classList.add("on"); }));
      el.querySelector("#mkCancel").onclick = closeSheet;
      const go = () => { const count = +el.querySelector("#mkCount .on").dataset.v || undefined; const strength = el.querySelector("#mkStrength .on").dataset.v; const ids = [...el.querySelectorAll("[data-src]")].filter(c => c.checked).map(c => c.dataset.src); const extra = el.querySelector("#mkExtra").value.trim(); closeSheet();
        run(() => APP.generateMock(t.id, { count, strength, sourceIds: ids.length === sources.length ? null : ids, extra })); };
      el.querySelector("#mkGo").onclick = go;
      el.addEventListener("keydown", e => { if (e.isComposing || e.keyCode === 229) return; if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); go(); } });
      openSheet("적중 모의고사 만들기", el, { kind: "mock" });
    }
    // ---- 더보기 시트 (좁은 화면 #tabMore → [data-more]) ----
    function openMoreSheet() {
      const rows = [...S.teachers.values()].map(t => '<div class="it" data-more="teacher:' + t.id + '"' + (S.selectedId === t.id ? ' style="border-color:var(--holo)"' : "") + '><i class="dot" style="background:' + esc(t.color) + '"></i><span class="grow">' + esc(t.name) + '</span><span class="small">' + esc(APP.sub(t)) + '</span></div>').join("")
        + '<div class="it" data-more="teacher:*"' + (S.selectedId === APP.ALL ? ' style="border-color:var(--holo)"' : "") + '><i class="dot" style="background:var(--dim)"></i><span class="grow">모든 선생님</span></div>'
        + '<div class="it" data-more="new"><span class="grow" style="color:var(--holo2)">＋ 새 선생님</span></div>';
      const el = h('<div><div class="sec"><h4>선생님</h4><div class="tlist">' + rows + '</div></div><div class="sec"><h4>화면</h4><div class="tlist"><div class="it" data-more="timeline"><span class="grow">타임라인</span><kbd>T</kbd></div><div class="it" data-more="ask"><span class="grow">물어보기</span><kbd>A</kbd></div><div class="it" data-more="settings"><span class="grow">설정</span></div><div class="it" data-more="help"><span class="grow">단축키 · 도움말</span><kbd>?</kbd></div></div></div></div>');
      el.querySelectorAll("[data-more]").forEach(x => x.onclick = () => { const v = x.dataset.more; closeSheet();
        if (v.indexOf("teacher:") === 0) APP.select(v.slice(8)); else if (v === "new") openTeacherSheet(null); else if (v === "timeline") ROUTE.go("#/timeline"); else if (v === "ask") ROUTE.go("#/ask"); else if (v === "settings") openSettings("engine"); else if (v === "help") openHelp(); });
      openSheet("더보기", el, { kind: "more" });
    }

    // ================= 설정 (6탭 — engine · cloud · bg · view · data · brain, §2.16 id) =================
    const HIGGS_PROMPTS = [
      ["배경 루프 (브레인 뷰 뒤)", "Cinematic dark navy sci-fi command room, JARVIS-style holographic interface floating in the air, glowing cyan concentric rings and tick marks, soft volumetric blue light beams, subtle particle field on a reflective floor, bokeh city lights through a window, camera slowly dolly-in, seamless loop, 16:9, no text, no people, 4K"],
      ["홀로그램 코어 (선생님 아바타 자리)", "A single luminous holographic core: layered rotating rings of light with fine tick marks and segmented arcs, ice-blue and white glow, a bright energy sphere at the center, black background, centered composition, slow rotation, seamless loop, no text"],
      ["HUD 패널 질감", "Futuristic glass HUD panel texture, translucent dark blue glass with thin cyan borders and corner brackets, faint circuit lines, soft inner glow, flat front view, black background, 16:9, no text"],
      ["학습 완료 파동", "A circular shockwave of cyan light expanding across a dark grid floor seen from a low angle, particles lifting into the air, JARVIS interface aesthetic, 2 second loop, no text"],
    ];
    function openSettings(tab) {
      const el = h('<div><div class="tabs">' + ["engine:엔진", "cloud:클라우드", "bg:배경", "view:화면", "data:데이터", "brain:브레인"].map(x => { const [k, v] = x.split(":"); return '<button type="button" data-tab="' + k + '">' + v + '</button>'; }).join("") + '</div><div id="setBody"></div></div>');
      const show = async (k) => {
        el.querySelectorAll("[data-tab]").forEach(b => b.classList.toggle("on", b.dataset.tab === k));
        const b = el.querySelector("#setBody");
        if (k === "engine") {
          const oa = API.provider() === "openai", key = API.currentKey();
          b.innerHTML = '<div class="field"><label>어느 회사 API 로 돌릴까요</label><div class="seg" id="sProv"><button type="button" data-v="anthropic" class="' + (oa ? "" : "on") + '">Anthropic (Claude)</button><button type="button" data-v="openai" class="' + (oa ? "on" : "") + '">OpenAI</button></div></div><div class="field"><label>API 키 <span class="faint">— 이 브라우저에만 저장돼요 · 동형 모의고사 생성기와 같은 키를 써요</span></label><div class="row"><input type="password" id="sKey" placeholder="' + (oa ? "sk-…" : "sk-ant-api03-…") + '" autocomplete="off" style="flex:1;width:auto"><button type="button" id="sKeySave">저장</button><button type="button" id="sKeyClear">지우기</button></div><div class="small" id="sKeyStat">' + (key ? "저장됨 (…" + esc(key.slice(-4)) + ") — 바꾸려면 새 키를 붙여넣으세요" : "키가 없어요") + '</div></div>' + (oa ? '<div class="field"><label>모델</label><input type="text" id="sOaModel" list="oaList" value="' + esc(API.oaModel()) + '"><datalist id="oaList">' + API.OA_PRESETS.map(m => '<option value="' + m + '">').join("") + '</datalist></div>' : '<div class="field"><label>모델</label><div class="seg" id="sModel">' + Object.keys(API.AN_MODELS).map(x => '<button type="button" data-v="' + x + '" class="' + (API.anModelKey() === x ? "on" : "") + '">' + API.AN_LABELS[x] + '</button>').join("") + '</div><label class="row" style="margin-top:8px"><input type="checkbox" id="sLight" ' + (S.ui.light !== false ? "checked" : "") + '> 문항 데이터화·지문 색인은 Sonnet 5 로 (빠르고 저렴) · 분석·예측·출제는 위 모델</label></div>') + '<div class="field"><label>키 보관</label><div class="seg" id="sKeep"><button type="button" data-v="browser" class="' + (API.keepMode() === "browser" ? "on" : "") + '">이 브라우저에 저장</button><button type="button" data-v="session" class="' + (API.keepMode() === "session" ? "on" : "") + '">창 닫으면 지움</button></div></div><div class="row"><button type="button" class="pri" id="sProbe">연결 확인</button><span class="small" id="sProbeMsg"></span></div>';
          b.querySelector("#sProv").querySelectorAll("button").forEach(x => x.onclick = () => { API.setProvider(x.dataset.v); show("engine"); updateEngine(); });
          b.querySelector("#sKeySave").onclick = () => { const v = b.querySelector("#sKey").value.trim(); if (!v) return; if (!API.keyLooksRight(v)) { b.querySelector("#sKeyStat").textContent = "이 키는 " + (API.provider() === "openai" ? "OpenAI" : "Anthropic") + " 키 모양이 아니에요 (" + (API.provider() === "openai" ? "sk-" : "sk-ant-") + " 로 시작)"; return; } API.setCurrentKey(v); b.querySelector("#sKey").value = ""; b.querySelector("#sKeyStat").textContent = "저장됨 (…" + v.slice(-4) + ")"; updateEngine(); probe(); APP.runQueue(); rerender(); };
          b.querySelector("#sKeyClear").onclick = () => { API.setCurrentKey(""); b.querySelector("#sKeyStat").textContent = "키를 지웠어요"; updateEngine(); rerender(); };
          const sm = b.querySelector("#sModel"); if (sm) sm.querySelectorAll("button").forEach(x => x.onclick = () => { API.setAnModel(x.dataset.v); sm.querySelectorAll("button").forEach(y => y.classList.toggle("on", y === x)); updateEngine(); });
          const om = b.querySelector("#sOaModel"); if (om) om.onchange = () => { API.setOaModel(om.value); updateEngine(); };
          const sl = b.querySelector("#sLight"); if (sl) sl.onchange = () => { APP.saveUi({ light: sl.checked }); API.setLight(sl.checked); };
          b.querySelector("#sKeep").querySelectorAll("button").forEach(x => x.onclick = () => { API.setKeepMode(x.dataset.v); b.querySelector("#sKeep").querySelectorAll("button").forEach(y => y.classList.toggle("on", y === x)); });
          const probe = async () => { const m = b.querySelector("#sProbeMsg"); m.textContent = "확인하는 중…"; const r = await API.probe(); m.textContent = r.msg; m.className = "small " + (r.ok ? "ok" : "bad"); updateEngine(r.ok); };
          b.querySelector("#sProbe").onclick = probe;
        } else if (k === "cloud") {
          const c = SYNC.st; let n = null; try { n = await SYNC.count(); } catch (e) {}
          b.innerHTML = '<div class="note">데이터는 Supabase(프로젝트 orunnathan · 표 oracle_docs)에 저장돼요. 이 브라우저의 저장소가 작업본이고, 바뀔 때마다 클라우드에 그대로 올라가요. 다른 기기에서 같은 작업공간 이름으로 열면 같은 데이터를 봐요. 내 메모 · 링크 · 태그는 최신 수정이 이기는 규칙으로 합쳐지고, 배경 영상은 올리지 않아요.</div><label class="row"><input type="checkbox" id="cOn" ' + (c.enabled ? "checked" : "") + '> Supabase 동기화 켜기</label><div class="field" style="margin-top:10px"><label>작업공간 이름 <span class="faint">(영문·숫자 · 기기마다 같게 · 이름을 아는 사람은 누구나 읽고 써요)</span></label><div class="row"><input type="text" id="cWs" value="' + esc(c.workspace) + '" style="flex:1;width:auto"><button type="button" id="cWsSave">바꾸기</button></div></div><div class="kv"><b>상태</b><span id="cStat">' + esc(c.status === "error" ? "오류 — " + c.error : c.status === "syncing" ? "동기화 중" : c.enabled ? "연결됨" : "꺼짐") + '</span><b>클라우드 문서</b><span>' + (n === null ? "—" : n.toLocaleString() + "개") + '</span><b>마지막 동기화</b><span>' + (c.lastSync ? new Date(c.lastSync).toLocaleString("ko-KR") : "—") + '</span><b>대기 중</b><span>' + c.pending + '건</span>' + (c.private ? '<b>비공개</b><span>메모 · 링크 · 태그는 이 브라우저에만 (설정 › 브레인)</span>' : "") + '</div><div class="actions" style="justify-content:flex-start"><button type="button" id="cPush">이 브라우저 → 클라우드 전부 올리기</button><button type="button" id="cPull">클라우드 → 이 브라우저 (새로 고침)</button><button type="button" class="danger" id="cWipe">클라우드 작업공간 비우기</button></div>';
          b.querySelector("#cOn").onchange = (e) => { SYNC.setEnabled(e.target.checked); updateCloud(); };
          b.querySelector("#cWsSave").onclick = () => { SYNC.setWorkspace(b.querySelector("#cWs").value); toast("작업공간을 바꿨어요 — 새로 고치면 그 작업공간의 데이터를 불러와요", { action: "지금 새로 고침", onAction: () => location.reload() }); show("cloud"); };
          b.querySelector("#cPush").onclick = async () => { toast("올리는 중…"); await SYNC.pushAll(DB); toast(SYNC.st.status === "error" ? "실패: " + SYNC.st.error : "모두 올렸어요", { ok: SYNC.st.status !== "error", bad: SYNC.st.status === "error" }); show("cloud"); };
          b.querySelector("#cPull").onclick = () => location.reload();
          b.querySelector("#cWipe").onclick = async () => { if (prompt("클라우드 작업공간 '" + c.workspace + "' 의 문서를 모두 지웁니다 (이 브라우저의 데이터는 남아요). '비우기' 라고 입력하세요") !== "비우기") return; try { await SYNC.wipeCloud(); toast("클라우드를 비웠어요"); show("cloud"); } catch (e) { toast(e.message, { bad: true }); } };
        } else if (k === "bg") {
          b.innerHTML = '<div class="field"><label>브레인 뷰 배경 (Higgsfield 등에서 만든 영상·그림)</label><div class="drop" id="sVidDrop">' + (S.bg.hasVideo ? "배경이 있어요 — 바꾸려면 여기에 놓거나 " : "mp4 · webm · jpg · png 를 여기에 놓거나 ") + '<button type="button" class="link" id="sVidPick">파일 선택</button></div>' + (S.bg.hasVideo ? '<div class="actions"><button type="button" id="sVidRm">배경 지우기</button></div>' : "") + '</div><div class="field"><label>배경 밝기 ' + Math.round(S.bg.opacity * 100) + '%</label><input type="range" id="sOpa" min="0" max="100" value="' + Math.round(S.bg.opacity * 100) + '"></div><div class="note">배경은 브레인 뷰(G)에만 깔려요. Higgsfield 는 이 화면에서 직접 부를 수 없어요(API 키·계정이 필요). 아래 프롬프트를 Higgsfield 에 붙여넣어 만든 영상·그림을 여기에 넣으면 무대 뒤에 깔리고, 3D 홀로그램·힉스 필드 입자는 그 위에 겹쳐요. 배경은 이 브라우저에만 남고 클라우드 · 백업에는 들어가지 않아요.</div>' + HIGGS_PROMPTS.map((x, i) => '<div class="field"><label>' + esc(x[0]) + ' <button type="button" class="link" data-copy="' + i + '">복사</button></label><pre class="prompt">' + esc(x[1]) + '</pre></div>').join("");
          const dz = b.querySelector("#sVidDrop");
          ["dragover", "dragenter"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); dz.classList.add("over"); }));
          ["dragleave", "drop"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); dz.classList.remove("over"); }));
          dz.addEventListener("drop", e => { const f = e.dataTransfer.files[0]; if (f) setVideo(f); });
          b.querySelector("#sVidPick").onclick = () => $("videoInput").click();
          const rm = b.querySelector("#sVidRm"); if (rm) rm.onclick = () => APP.setBgVideo(null).then(() => { toast("배경을 지웠어요"); show("bg"); });
          b.querySelector("#sOpa").oninput = (e) => { APP.setBgOpacity(+e.target.value / 100); e.target.previousElementSibling.textContent = "배경 밝기 " + e.target.value + "%"; };
          b.querySelectorAll("[data-copy]").forEach(x => x.onclick = async () => { try { await navigator.clipboard.writeText(HIGGS_PROMPTS[+x.dataset.copy][1]); toast("프롬프트를 복사했어요", { ok: true }); } catch (e) { toast("복사하지 못했어요", { bad: true }); } });
        } else if (k === "view") {
          const home = ui2().home === "brain" ? "brain" : "today";
          b.innerHTML = '<div class="field"><label>첫 화면</label><div class="seg" id="sHome"><button type="button" data-v="today" class="' + (home === "today" ? "on" : "") + '">오늘</button><button type="button" data-v="brain" class="' + (home === "brain" ? "on" : "") + '">브레인 (홀로그램)</button></div><div class="small" style="margin-top:4px">주소 없이 열었을 때 어디서 시작할지 — 이 브라우저에만 저장돼요.</div></div><div class="field"><label>브레인 뷰 화질</label><div class="seg" id="sQ">' + ["auto:자동", "high:높음", "low:낮음"].map(x => { const [v, l] = x.split(":"); return '<button type="button" data-v="' + v + '" class="' + (S.ui.quality === v ? "on" : "") + '">' + l + '</button>'; }).join("") + '</div></div><label class="row"><input type="checkbox" id="sRed" ' + (S.ui.reduced ? "checked" : "") + '> 움직임 줄이기</label><label class="row" style="margin-top:6px"><input type="checkbox" id="sFlat" ' + (S.ui.forceFlat ? "checked" : "") + '> 브레인 뷰를 2D 로 보기</label><label class="row" style="margin-top:6px"><input type="checkbox" id="sAuto" ' + (S.ui.autoLearn ? "checked" : "") + '> 파일을 넣으면 자동으로 학습</label><label class="row" style="margin-top:6px"><input type="checkbox" id="sFps" ' + (S.ui.showFps ? "checked" : "") + '> FPS 표시</label><div class="small" style="margin-top:10px">화질·2D 설정은 브레인 뷰를 다시 열거나 새로 고친 뒤 적용돼요. 글꼴: 라벨 · 숫자 · 키캡은 Orbitron, 본문은 Noto Sans KR, 시험지는 명조.</div>';
          b.querySelector("#sHome").querySelectorAll("button").forEach(x => x.onclick = () => { ui2set({ home: x.dataset.v }); b.querySelector("#sHome").querySelectorAll("button").forEach(y => y.classList.toggle("on", y === x)); });
          b.querySelector("#sQ").querySelectorAll("button").forEach(x => x.onclick = () => { APP.saveUi({ quality: x.dataset.v }); b.querySelector("#sQ").querySelectorAll("button").forEach(y => y.classList.toggle("on", y === x)); });
          b.querySelector("#sRed").onchange = (e) => { APP.saveUi({ reduced: e.target.checked }); document.body.classList.toggle("reduced", e.target.checked); };
          b.querySelector("#sFlat").onchange = (e) => { APP.saveUi({ forceFlat: e.target.checked }); if (e.target.checked) APP.setMode("flat"); };
          b.querySelector("#sAuto").onchange = (e) => APP.saveUi({ autoLearn: e.target.checked });
          b.querySelector("#sFps").onchange = (e) => { APP.saveUi({ showFps: e.target.checked }); $("fpsTag").hidden = !e.target.checked; };
        } else if (k === "data") {
          let est = ""; try { const e = await navigator.storage.estimate(); est = TEXT.fmtBytes(e.usage || 0) + " 사용"; } catch (e) {}
          let persisted = false; try { persisted = await navigator.storage.persisted(); } catch (e) {}
          b.innerHTML = '<div class="kv"><b>이 브라우저</b><span>' + est + ' · ' + (persisted ? "영구 저장 허용됨" : '<button type="button" class="link" id="sPersist">영구 저장 요청</button>') + '</span><b>API 사용</b><span>이번 세션 ' + API.totals.calls + '회 · 입력 ' + API.totals.input.toLocaleString() + ' · 출력 ' + API.totals.output.toLocaleString() + ' 토큰' + (API.totals.cached ? ' · 캐시 ' + API.totals.cached.toLocaleString() : "") + '</span></div><div class="small" style="margin:6px 0 14px">파일 원본은 저장하지 않고 추출한 글자와 분석 결과만 둬요 (브라우저 + Supabase). 백업(JSON)에는 내 메모 · 링크 · 태그도 들어가요. 배경 영상·그림은 예외로 이 브라우저에만 남고 백업에는 들어가지 않아요.</div><div class="actions" style="justify-content:flex-start"><button type="button" id="sExport">전체 백업 (JSON)</button><button type="button" id="sImport">불러오기</button><button type="button" class="danger" id="sWipe">이 브라우저 데이터 모두 지우기</button></div>';
          const sp = b.querySelector("#sPersist"); if (sp) sp.onclick = async () => { try { const ok = await navigator.storage.persist(); toast(ok ? "영구 저장이 허용됐어요" : "브라우저가 허용하지 않았어요"); show("data"); } catch (e) {} };
          b.querySelector("#sExport").onclick = () => APP.exportJson(null).then(r => toast("전체 백업을 내려받았어요 (" + TEXT.fmtBytes(r.size) + ")", { ok: true }));
          b.querySelector("#sImport").onclick = () => $("importInput").click();
          b.querySelector("#sWipe").onclick = () => { const v = prompt("선생님 " + S.teachers.size + "명과 모든 데이터를 이 브라우저와 클라우드 작업공간에서 지웁니다. 백업을 먼저 받아 두세요.\n'모두 지우기' 라고 입력하세요"); if (v === "모두 지우기") APP.wipeAll().then(() => { closeSheet(); toast("모두 지웠어요"); ROUTE.go("#/today", { replace: true }); rerender(); }); };
        } else if (k === "brain") {
          const author = APP.author(); const priv = !!(SYNC.st && SYNC.st.private); const askK = S.ui.askK || 12;
          b.innerHTML = '<div class="field"><label>메모 서명 <span class="faint">— 작업공간은 여러 사람이 써요. 내 메모 · 링크 · 태그에 이 이름이 붙어요</span></label><input type="text" id="sAuthor" maxlength="20" placeholder="예) 김강사 (비워 두면 “이 기기”)" value="' + esc(author) + '"></div><label class="row"><input type="checkbox" id="sPrivate" ' + (priv ? "checked" : "") + '> 내 메모 · 링크 · 태그는 이 브라우저에만 (클라우드에 올리지 않음)</label><div class="small" style="margin:4px 0 12px 22px">작업공간 이름을 아는 사람은 누구나 클라우드의 메모를 볼 수 있어요. 켜면 이 기기의 메모는 백업(JSON)으로만 옮길 수 있어요.</div><div class="field"><label>물어보기 근거 개수</label><div class="seg" id="sAskK">' + [8, 12, 16].map(n => '<button type="button" data-v="' + n + '" class="' + (askK === n ? "on" : "") + '">' + n + '개</button>').join("") + '</div></div><label class="row"><input type="checkbox" id="sAskLight" ' + (S.ui.askLight !== false ? "checked" : "") + '> 물어보기는 Sonnet 으로 (빠르고 저렴)</label><div class="field" style="margin-top:14px"><label>검색 색인</label><div class="row"><button type="button" id="sReindex">색인 다시 짓기</button><span class="small" id="sIndexStat">' + esc(indexText()) + '</span></div><div class="small" style="margin-top:4px">색인은 저장하지 않고 열 때마다 다시 지어요. 검색 결과가 이상하면 여기서 다시 지으세요.</div></div>';
          b.querySelector("#sAuthor").onchange = (e) => { try { localStorage.setItem("orun_oracle_author", e.target.value.trim()); } catch (x) {} toast("서명을 저장했어요", { ok: true }); };
          b.querySelector("#sPrivate").onchange = (e) => { SYNC.setPrivate(e.target.checked); updateCloud(); toast(e.target.checked ? "메모 · 링크 · 태그를 이 브라우저에만 둬요" : "메모 · 링크 · 태그도 클라우드에 올려요"); };
          b.querySelector("#sAskK").querySelectorAll("button").forEach(x => x.onclick = () => { APP.saveUi({ askK: +x.dataset.v }); b.querySelector("#sAskK").querySelectorAll("button").forEach(y => y.classList.toggle("on", y === x)); });
          b.querySelector("#sAskLight").onchange = (e) => APP.saveUi({ askLight: e.target.checked });
          b.querySelector("#sReindex").onclick = async () => { const st = b.querySelector("#sIndexStat"); st.textContent = "색인 짓는 중…"; try { await APP.rebuildIndex(); st.textContent = indexText(); toast("색인을 다시 지었어요", { ok: true }); } catch (e) { st.textContent = "실패: " + (e && e.message || e); } };
        }
      };
      el.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => show(b.dataset.tab));
      openSheet("설정", el, { kind: "settings" }); show(tab || "engine");
    }
    function indexText() { const s = INDEX.state || {}; return s.ready ? "색인 " + (s.n || 0).toLocaleString() + " 노트" : s.building ? "색인 중 " + Math.round((s.progress || 0) * 100) + "%" : "색인 전"; }
    // ---- 도움말 (§3.10 표 전체) ----
    function openHelp() {
      const rows = [["⌘K / Ctrl+K", "검색 · 명령 · 질문 팔레트 (입력창 안에서도)"], ["/", "물어보기 입력으로 (오른쪽 패널 → 없으면 물어보기 화면)"], ["⌘⏎", "메모 저장 · 파일 시트 넣기 · 질문 전송"], ["Esc", "시험지 › 시트 › 팔레트 › 자동완성 › 메뉴 › 미리보기 › 전체화면 해제 › 메모 미리보기"], ["N", "새 선생님"], ["O", "파일 넣기"], ["L / P / M", "학습 / 예측 / 적중 모의고사"], ["← →", "이전 / 다음 선생님"], ["[ / ]", "목차 / 오른쪽 패널 접기"], ["?", "이 도움말"], ["Delete", "선택한 선생님 삭제 시트"], ["G / H / I / T / A", "브레인 / 오늘 / 인박스 / 타임라인 / 물어보기"], ["E", "내 메모 편집 ↔ 미리보기 (노트 화면)"], ["C", "빠른 메모 입력으로 (오늘 · 인박스)"], ["1 ~ 8", "서재 n번째 목록 (시험 · 문항 · 지문 · 자료 · 프로파일 · 예측 · 모의고사 · 메모)"], ["⌘클릭", "노트 링크를 오른쪽 패널에 미리보기"], ["드래그", "브레인 뷰에서 무대 회전 · 휠로 확대"], ["파일 드롭", "인박스 · 오늘 · 어디에나 놓으면 파일 시트가 떠요 · 브레인에서는 홀로그램 위에"]];
      openSheet("단축키 · 도움말", h('<div class="help"><table>' + rows.map(r => '<tr><td><kbd>' + esc(r[0]) + '</kbd></td><td>' + esc(r[1]) + '</td></tr>').join("") + '</table><div class="small" style="margin-top:10px">단일 글자 단축키는 입력창 밖에서만 · 한글 입력 조합 중에는 아무것도 하지 않아요.</div></div>'), { kind: "help" });
    }
    async function setVideo(f) { try { await APP.setBgVideo(f); toast("배경을 저장했어요 — 브레인 뷰(G)에 깔려요", { ok: true }); if ($("sheetWrap").dataset.kind === "settings") openSettings("bg"); } catch (e) { toast(e.message, { bad: true }); } }

    // ================= 시험지 미리보기 (#paper — body 직계) =================
    function openPaper(mock) {
      if (!mock) return; paperMock = mock; const t = T(mock.teacherId) || { school: "", grade: "", subject: "" };
      $("paperTitle").textContent = mock.title + " · " + mock.target;
      $("paperPage").innerHTML = GENERATE.paperHtml(mock, t) + (mock.failed && mock.failed.length ? '<div class="pk1" style="color:#a00">만들지 못한 문항: ' + mock.failed.map(f => esc(f.number) + "(" + esc(f.why) + ")").join(", ") + '</div>' : "");
      $("paper").classList.add("on");
    }
    function closePaper() { $("paper").classList.remove("on"); }
    async function paperDocx() {
      if (!paperMock) return; const t = T(paperMock.teacherId) || { school: "", grade: "", subject: "" };
      try { const blob = await GENERATE.docx(paperMock, t); APP.download(blob, (paperMock.title + " " + paperMock.target).replace(/[\\/:*?"<>|]/g, "") + ".docx"); toast("워드 파일을 내려받았어요", { ok: true }); } catch (e) { toast(e.message, { bad: true }); }
    }
    async function copyBlueprint(teacherId) {
      const t = teacherId ? T(teacherId) : sel(), pr = t && S.predictions.get(t.id); if (!pr) { toast("학습된 프로파일과 예측이 있어야 청사진을 만들 수 있어요"); return; }
      try { await navigator.clipboard.writeText(pr.copyText); } catch (e) { const ta = document.createElement("textarea"); ta.value = pr.copyText; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (x) {} ta.remove(); }
      toast("청사진을 복사했어요 — 동형 모의고사 생성기의 '요청사항' 칸에 붙여넣으세요", { ok: true, action: "생성기 열기", onAction: () => window.open("https://nathankim6.github.io/orunnathan/mock-exam.html", "_blank", "noopener") });
    }
    // ---- 옛 호출 어댑터 (§2.1): 드로어는 없다 — 라우팅한다 ----
    function openDrawer(kind, id) {
      if (kind === "handouts") ROUTE.go(ROUTE.all("sources", { kind: "프린트" }));
      else if (kind === "mocks") ROUTE.go(ROUTE.all("mocks"));
      else if (id) ROUTE.go(ROUTE.note(id));
      else if (kind === "exam") ROUTE.go(ROUTE.all("exams")); else if (kind === "question") ROUTE.go(ROUTE.all("questions")); else if (kind === "passage") ROUTE.go(ROUTE.all("passages")); else if (kind === "source") ROUTE.go(ROUTE.all("sources"));
    }
    async function run(fn) {
      try { return await fn(); }
      catch (e) { console.error(e); toast(API.friendly(e), { bad: true }); if (e && (e.code === "no_key" || e.code === "bad_key")) openSettings("engine"); return null; }
    }
    // 파일 고르기 (#fileInput) · 사진 찍기 (#cameraInput) — VIEWS 가 #inboxPick/#homePick/#inboxCamera 에서 부른다
    function pickFiles(kind) { if (!sel()) { if (S.teachers.size) { toast("선생님을 골라 주세요 — 파일을 놓으면 고를 수 있어요"); ROUTE.go("#/inbox"); } else openTeacherSheet(null); return; } pendingKind = kind || null; $("fileInput").click(); }
    function pickCamera() { if (!sel()) { toast("먼저 선생님을 골라 주세요"); return; } $("cameraInput").click(); }

    // ================= ⌘K 팔레트 (§2.15 · §3.9 · §6.7) =================
    // 접두: 없음 = 검색(노트 + 원문 + 명령 몇 개) · `>` 명령만 · `#` 태그만 · `?` 곧장 물어보기 · q: p: e: s: n: t: 종류 제한
    const KIND_PREFIX = { q: ["question"], p: ["passage"], e: ["exam"], s: ["source", "handout"], n: ["note", "ask"], t: ["teacher"] };
    let ckHits = [], ckIdx = 0, ckTimer = 0, ckSeq = 0;
    const cmdkOpen = () => !$("cmdk").hidden;
    // 명령 목록 (§3.9). when() 이 거짓이면 목록에서 뺀다. q 는 입력 텍스트(접두 제거 뒤).
    function commands(q) {
      const t = sel(), c = t ? S.counts.get(t.id) || {} : {}, p = t && S.profiles.get(t.id), pr = t && S.predictions.get(t.id), busy = t && S.busy.has(t.id);
      const inNote = cur && cur.view === "note", inBrain = cur && cur.view === "brain";
      const list = [
        { hit: "cmd:new", name: "새 선생님", sub: "N" },
        { hit: "cmd:files", name: "파일 넣기", sub: "O", when: !!t },
        { hit: "cmd:camera", name: "사진 찍기", sub: "OCR", when: !!t && isMobile() },
        { hit: "cmd:quick", name: '빠른 메모 "' + q.slice(0, 40) + '"', sub: "C", when: !!q },
        { hit: "cmd:learn", name: "학습", sub: "L", when: !!t && !!c.questions && !busy },
        { hit: "cmd:predict", name: "예측", sub: "P", when: !!p && !busy },
        { hit: "cmd:mock", name: "적중 모의고사", sub: "M", when: !!pr && !busy },
        { hit: "cmd:ask", name: '두뇌에게 묻기 "' + q.slice(0, 40) + '"', sub: "A", when: !!q && API.ready() && !!(INDEX.state && INDEX.state.ready) },
        { hit: "cmd:today", name: "오늘", sub: "H" }, { hit: "cmd:inbox", name: "인박스", sub: "I" }, { hit: "cmd:library", name: "서재", sub: "1~8" }, { hit: "cmd:brain", name: "브레인", sub: "G" }, { hit: "cmd:timeline", name: "타임라인", sub: "T" }, { hit: "cmd:askview", name: "물어보기", sub: "A" },
        { hit: "cmd:brainfocus", name: "브레인에서 보기 (현재 노트)", sub: "", when: inNote },
        ...[...S.teachers.values()].map(x => ({ hit: "cmd:teacher:" + x.id, name: "선생님 전환 · " + x.name, sub: x.subject })),
        { hit: "cmd:teacher:*", name: "선생님 전환 · 모든 선생님", sub: "", when: S.teachers.size > 1 },
        { hit: "cmd:prints", name: "프린트 반영율", sub: "서재 › 프린트" },
        { hit: "cmd:mocks", name: "지난 모의고사", sub: "서재 › 모의고사" },
        { hit: "cmd:blueprint", name: "청사진 복사", sub: "동형 모의고사 생성기용", when: !!pr },
        { hit: "cmd:export", name: "전체 백업 (JSON)", sub: "" }, { hit: "cmd:exportone", name: "이 선생님만 백업", sub: t ? t.name : "", when: !!t }, { hit: "cmd:import", name: "백업 불러오기", sub: "JSON" },
        ...["engine:엔진", "cloud:클라우드", "bg:배경", "view:화면", "data:데이터", "brain:브레인"].map(x => { const [k, v] = x.split(":"); return { hit: "cmd:settings:" + k, name: "설정 · " + v, sub: "" }; }),
        { hit: "cmd:help", name: "단축키 · 도움말", sub: "?" },
        { hit: "cmd:flat", name: S.mode === "flat" ? "3D 로 보기" : "2D 로 보기", sub: "브레인 뷰", when: inBrain },
        { hit: "cmd:video", name: "배경 영상", sub: "브레인 뷰" },
        { hit: "cmd:daily", name: "오늘 로그 열기", sub: TEXT.fmtDate(Date.now()) },
        { hit: "cmd:reindex", name: "색인 다시 짓기", sub: "" },
      ];
      return list.filter(x => x.when !== false);
    }
    function runCommand(hit, q) {
      const t = sel();
      const a = hit.slice(4);
      if (a === "new") openTeacherSheet(null);
      else if (a === "files") pickFiles();
      else if (a === "camera") pickCamera();
      else if (a === "quick") { if (q) APP.quickNote(q).then(d => { if (d) toast("메모를 저장했어요", { ok: true, action: "열기", onAction: () => ROUTE.go(ROUTE.note(d.id)) }); }); }
      else if (a === "learn") { if (t) run(() => APP.learn(t.id, { force: true })); }
      else if (a === "predict") openPredictSheet();
      else if (a === "mock") openMockSheet();
      else if (a === "ask") ROUTE.go(ROUTE.href({ view: "ask", query: { q, ctx: cur && cur.view === "note" ? cur.id : "" } }));
      else if (a === "today") ROUTE.go("#/today"); else if (a === "inbox") ROUTE.go("#/inbox"); else if (a === "library") ROUTE.go(ROUTE.all("exams")); else if (a === "brain") ROUTE.go("#/brain"); else if (a === "timeline") ROUTE.go("#/timeline"); else if (a === "askview") ROUTE.go("#/ask");
      else if (a === "brainfocus") { if (cur && cur.view === "note") ROUTE.go(ROUTE.href({ view: "brain", query: { focus: cur.id } })); }
      else if (a.indexOf("teacher:") === 0) APP.select(a.slice(8));
      else if (a === "prints") ROUTE.go(ROUTE.all("sources", { kind: "프린트" }));
      else if (a === "mocks") ROUTE.go(ROUTE.all("mocks"));
      else if (a === "blueprint") copyBlueprint();
      else if (a === "export") APP.exportJson(null).then(r => toast("전체 백업을 내려받았어요 (" + TEXT.fmtBytes(r.size) + ")", { ok: true }));
      else if (a === "exportone") { if (t) APP.exportJson(t.id).then(() => toast(t.name + " 선생님 데이터를 내려받았어요", { ok: true })); }
      else if (a === "import") $("importInput").click();
      else if (a.indexOf("settings:") === 0) openSettings(a.slice(9));
      else if (a === "help") openHelp();
      else if (a === "flat") APP.setMode(S.mode === "flat" ? "stage" : "flat");
      else if (a === "video") $("videoInput").click();
      else if (a === "daily") NOTES.ensureDaily(TEXT.fmtDate(Date.now()), t ? t.id : null).then(d => { if (d) ROUTE.go(ROUTE.note(d.id)); });
      else if (a === "reindex") { toast("색인을 다시 지어요…"); APP.rebuildIndex().then(() => toast("색인을 다시 지었어요", { ok: true })).catch(e => toast(String(e && e.message || e), { bad: true })); }
    }
    function parseQuery(raw) {
      let q = String(raw || "").trim(), mode = "all", kinds = null;
      if (q.charAt(0) === ">") { mode = "cmd"; q = q.slice(1).trim(); }
      else if (q.charAt(0) === "#") { mode = "tag"; q = q.slice(1).trim(); }
      else if (q.charAt(0) === "?") { mode = "ask"; q = q.slice(1).trim(); }
      else { const m = q.match(/^([qpesnt]):\s*/i); if (m) { kinds = KIND_PREFIX[m[1].toLowerCase()]; q = q.slice(m[0].length); } }
      let grepQ = ""; const qm = q.match(/^["“](.+)["”]$/); if (qm) grepQ = qm[1].trim(); else if (q.length >= 12) grepQ = q;
      return { q, mode, kinds, grepQ };
    }
    const hi = (s, q) => { s = esc(s); if (!q) return s; try { return s.replace(new RegExp("(" + esc(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<b>$1</b>"); } catch (e) { return s; } };
    const kindTag = (k) => '<span class="mono-kind" data-kind="' + esc(k) + '" title="' + esc(KIND_LABEL[k] || k) + '"></span>';
    const tName = (id) => { const t = T(id); return t ? t.name : ""; };
    function cmdkSearch() {
      const seq = ++ckSeq;
      const { q, mode, kinds, grepQ } = parseQuery($("cmdkInput").value);
      const tid = scopeId(), multi = S.teachers.size > 1 || S.selectedId === APP.ALL;
      const groups = [];
      const idx = INDEX.state || {};
      if (mode === "ask") { groups.push({ label: "물어보기", hits: [{ hit: "cmd:ask", html: '<span class="k">ASK</span><span class="t">두뇌에게 묻기 <b>' + esc(q || "…") + '</b></span><span class="s">⏎</span>', q }] }); return render(groups, q); }
      if (mode === "cmd" || mode === "all") {
        const cs = commands(q).filter(c => mode === "cmd" ? (c.hit !== "cmd:quick" && c.hit !== "cmd:ask" && (!q || c.name.toLowerCase().includes(q.toLowerCase()))) : (q ? (c.hit === "cmd:ask" || c.hit === "cmd:quick" || c.name.toLowerCase().includes(q.toLowerCase())) : ["cmd:files", "cmd:learn", "cmd:predict", "cmd:mock", "cmd:brain", "cmd:daily"].includes(c.hit)));
        if (mode === "cmd") groups.push({ label: "명령", hits: cs.map(c => ({ hit: c.hit, q, html: '<span class="k">›</span><span class="t">' + hi(c.name, q) + '</span><span class="s">' + esc(c.sub || "") + '</span>' })) });
        else if (cs.length) groups.__cmds = cs.slice(0, q ? 4 : 6);
      }
      if (mode === "tag" || mode === "all") {
        let tags = []; try { tags = NOTES.tags.list(tid && tid !== APP.ALL ? tid : null) || []; } catch (e) { tags = []; }
        const ql = q.toLowerCase();
        const hits = tags.filter(x => !ql || String(x.name).toLowerCase().includes(ql)).sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, mode === "tag" ? 30 : 4).map(x => ({ hit: "tag:" + x.name, html: '<span class="k">#</span><span class="t">' + hi("#" + x.name, q) + '</span><span class="s">' + (x.count || 0) + '</span>' }));
        if (mode === "tag") { groups.push({ label: "태그", hits }); return render(groups, q); }
        groups.__tags = hits;
      }
      if (mode === "all") {
        if (!idx.ready) {
          if (groups.__cmds && groups.__cmds.length && q) groups.push({ label: "명령", hits: groups.__cmds.map(c => ({ hit: c.hit, q, html: '<span class="k">›</span><span class="t">' + hi(c.name, q) + '</span><span class="s">' + esc(c.sub || "") + '</span>' })) });
          return render(groups, q, idx.building ? "색인 중 " + Math.round((idx.progress || 0) * 100) + "%" : "색인 전이에요 — 잠시 뒤 다시");
        }
        let notes = [];
        try { notes = q ? INDEX.search(q, { teacherId: tid, kinds, limit: 30 }) : INDEX.recent({ teacherId: tid, limit: 8 }); } catch (e) { console.error(e); notes = []; }
        if (seq !== ckSeq) return;
        const nh = (notes || []).slice(0, 30).map(d => ({ hit: d.id, html: kindTag(d.kind) + '<span class="t">' + hi(d.title || d.id, q) + (d.snippet ? ' <span class="s">' + esc(String(d.snippet).slice(0, 80)) + '</span>' : "") + '</span><span class="s">' + esc([d.sub, multi ? tName(d.teacherId) : ""].filter(Boolean).join(" · ")) + '</span>' }));
        if (nh.length) groups.push({ label: q ? "노트" : "최근", hits: nh });
        if (grepQ && !kinds) {
          let gs = []; try { gs = INDEX.grep(grepQ, { teacherId: tid, limit: 8 }) || []; } catch (e) { gs = []; }
          if (gs.length) groups.push({ label: "원문에서", hits: gs.map(g => ({ hit: "grep:" + g.id + ":" + g.pos, html: kindTag(g.kind || "passage") + '<span class="t">' + esc(g.title || "") + ' <span class="s">…' + hi(String(g.snippet || "").slice(0, 100), grepQ) + '…</span></span>' })) });
        }
        if (groups.__cmds && groups.__cmds.length) groups.push({ label: "명령", hits: groups.__cmds.map(c => ({ hit: c.hit, q, html: '<span class="k">›</span><span class="t">' + hi(c.name, q) + '</span><span class="s">' + esc(c.sub || "") + '</span>' })) });
        if (groups.__tags && groups.__tags.length) groups.push({ label: "태그", hits: groups.__tags });
      }
      render(groups, q);
      function render(gs, q, statusText) {
        const list = $("cmdkList"); ckHits = []; let html = "";
        gs.forEach(g => { if (!g.hits.length) return; html += '<div class="grp">' + esc(g.label) + '</div>'; g.hits.forEach(hh => { const i = ckHits.length; ckHits.push(hh); html += '<div class="hit" role="option" id="hit-' + i + '" data-hit="' + esc(hh.hit) + '" aria-selected="false">' + hh.html + '</div>'; }); });
        if (!ckHits.length) html = '<div class="empty">' + (statusText ? esc(statusText) : q ? "찾은 것이 없어요 — " + esc(q) : "검색어 · > 명령 · # 태그 · ? 질문") + '</div>';
        list.innerHTML = html; ckIdx = 0; markCk();
        $("cmdkStatus").textContent = statusText || (idx.ready ? "" : idx.building ? "색인 중 " + Math.round((idx.progress || 0) * 100) + "%" : "");
        $("cmdkInput").setAttribute("aria-expanded", ckHits.length ? "true" : "false");
      }
    }
    function markCk() {
      const list = $("cmdkList"); list.querySelectorAll(".hit").forEach((el, i) => { el.classList.toggle("on", i === ckIdx); el.setAttribute("aria-selected", i === ckIdx ? "true" : "false"); });
      const on = list.querySelector(".hit.on"); if (on) { on.scrollIntoView({ block: "nearest" }); $("cmdkInput").setAttribute("aria-activedescendant", on.id); } else $("cmdkInput").removeAttribute("aria-activedescendant");
    }
    function openCmdk(prefill) {
      closeMenu(); closeAc();
      $("cmdkBack").hidden = false; $("cmdk").hidden = false;
      const inp = $("cmdkInput"); if (typeof prefill === "string") inp.value = prefill;
      inp.focus(); inp.select();
      cmdkSearch();
    }
    function closeCmdk() { if (!cmdkOpen()) return; $("cmdk").hidden = true; $("cmdkBack").hidden = true; $("cmdkInput").value = ""; ckHits = []; }
    function cmdkPick(i, peekOnly) {
      const hh = ckHits[i]; if (!hh) return;
      const hit = hh.hit;
      if (hit.indexOf("cmd:") === 0) { closeCmdk(); runCommand(hit, hh.q || parseQuery($("cmdkInput").value).q); return; }
      if (hit.indexOf("tag:") === 0) { closeCmdk(); ROUTE.go(ROUTE.tag(hit.slice(4))); return; }
      if (hit.indexOf("grep:") === 0) { const parts = hit.split(":"); closeCmdk(); ROUTE.go(ROUTE.href({ view: "note", id: parts[1], query: { at: parts[2] } })); return; }
      if (peekOnly) { peek(hit); return; }
      closeCmdk(); ROUTE.go(ROUTE.note(hit));
    }
    function bindCmdk() {
      const inp = $("cmdkInput");
      inp.addEventListener("input", () => { clearTimeout(ckTimer); ckTimer = setTimeout(cmdkSearch, 150); });
      inp.addEventListener("keydown", (e) => {
        if (e.isComposing || e.keyCode === 229) return;
        if (e.key === "ArrowDown") { e.preventDefault(); if (ckHits.length) { ckIdx = (ckIdx + 1) % ckHits.length; markCk(); } }
        else if (e.key === "ArrowUp") { e.preventDefault(); if (ckHits.length) { ckIdx = (ckIdx - 1 + ckHits.length) % ckHits.length; markCk(); } }
        else if (e.key === "Enter") { e.preventDefault(); const { mode, q } = parseQuery(inp.value); if (mode === "ask" && q) { closeCmdk(); ROUTE.go(ROUTE.href({ view: "ask", query: { q } })); return; } if (ckHits.length) cmdkPick(ckIdx, e.metaKey || e.ctrlKey); else if (q && (e.metaKey || e.ctrlKey)) { closeCmdk(); ROUTE.go(ROUTE.href({ view: "search", query: { q } })); } }
        else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeCmdk(); }
        else if (e.key === "Tab") { e.preventDefault(); }
      });
      $("cmdkList").addEventListener("click", (e) => { const el = e.target.closest(".hit"); if (!el) return; const i = [...$("cmdkList").querySelectorAll(".hit")].indexOf(el); if (i >= 0) cmdkPick(i, e.metaKey || e.ctrlKey); });
      $("cmdkList").addEventListener("mousemove", (e) => { const el = e.target.closest(".hit"); if (!el) return; const i = [...$("cmdkList").querySelectorAll(".hit")].indexOf(el); if (i >= 0 && i !== ckIdx) { ckIdx = i; markCk(); } });
      $("cmdkBack").addEventListener("click", closeCmdk);
    }
    // ⌘클릭 · ⌘⏎ 미리보기 — 오른쪽 패널 #asidePeek 에 NOTEUI.peek(id)
    function peek(id) {
      if (!id) return;
      document.body.classList.remove("asideClosed");
      $("asidePeek").hidden = false; $("asidePeek").dataset.id = id;
      $("asidePeekTitle").querySelector("span").textContent = (INDEX.get && INDEX.get(id) || {}).title || id;
      $("asidePeekBody").innerHTML = '<div class="small">불러오는 중…</div>';
      try { const r = NOTEUI.peek(id); if (r && typeof r.then === "function") r.catch(e => console.error(e)); } catch (e) { console.error(e); }
    }
    function closePeek() { $("asidePeek").hidden = true; }

    // ================= [[ · # 자동완성 (#acPop) — NOTEUI 의 메모 편집기와 빠른 메모 textarea 가 쓴다 =================
    // autocomplete(textarea, { teacherId, onPick({ kind:"link"|"tag", id, title }) }) → { close, destroy, isOpen }
    let acCur = null;
    function autocomplete(ta, opts) {
      opts = opts || {};
      const pop = $("acPop"); let items = [], ci = 0, mode = null, start = -1, open = false, blurT = 0;
      const teacherId = () => (typeof opts.teacherId === "function" ? opts.teacherId() : opts.teacherId) || scopeId();
      function close() { if (acCur === st) { pop.hidden = true; pop.innerHTML = ""; } open = false; items = []; }
      function place() {
        const r = ta.getBoundingClientRect(); const cs = getComputedStyle(ta); const lh = parseFloat(cs.lineHeight) || 22;
        const before = ta.value.slice(0, ta.selectionStart); const lines = before.split("\n").length;
        let top = r.top + Math.min(r.height, lines * lh + 10) - ta.scrollTop, left = r.left + 8;
        pop.style.visibility = "hidden"; pop.hidden = false;
        const pw = pop.offsetWidth || 260, ph = pop.offsetHeight || 200;
        if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 4);
        if (left + pw > window.innerWidth - 8) left = Math.max(8, window.innerWidth - pw - 8);
        pop.style.top = Math.round(top) + "px"; pop.style.left = Math.round(left) + "px"; pop.style.visibility = "";
      }
      function render() {
        if (!items.length) return close();
        acCur = st;
        pop.innerHTML = items.map((it, i) => '<div class="hit' + (i === ci ? " on" : "") + '" role="option" id="ac-' + i + '" aria-selected="' + (i === ci) + '" data-id="' + esc(it.id || "") + '">' + (it.kind ? kindTag(it.kind) : '<span class="k">#</span>') + '<span class="t">' + esc(it.label) + '</span>' + (it.sub ? '<span class="s">' + esc(it.sub) + '</span>' : "") + '</div>').join("");
        pop.querySelectorAll(".hit").forEach((el, i) => { el.addEventListener("mousedown", (e) => { e.preventDefault(); ci = i; pick(); }); });
        open = true; place();
      }
      function query(q) {
        const tid = teacherId(); const multi = S.teachers.size > 1 || tid === APP.ALL;
        if (mode === "link") {
          let rs = []; try { rs = INDEX.prefix(q, { teacherId: tid, limit: 8 }) || []; } catch (e) { rs = []; }
          items = rs.map(r => ({ id: r.id, kind: r.kind, title: r.title, label: r.title, sub: [KIND_LABEL[r.kind] || r.kind, multi ? tName(r.teacherId) : ""].filter(Boolean).join(" · ") }));
        } else {
          let tags = []; try { tags = NOTES.tags.list(tid && tid !== APP.ALL ? tid : null) || []; } catch (e) { tags = []; }
          const ql = q.toLowerCase();
          items = tags.filter(x => !ql || String(x.name).toLowerCase().indexOf(ql) === 0).slice(0, 8).map(x => ({ id: "", name: x.name, label: "#" + x.name, sub: (x.count || 0) + "" }));
          if (q && !tags.some(x => String(x.name).toLowerCase() === ql)) items.push({ id: "", name: q, label: "새 태그 만들기 #" + q, sub: "new", isNew: true });
        }
        ci = 0; render();
      }
      function detect() {
        const v = ta.value, c = ta.selectionStart; const before = v.slice(0, c);
        const w = before.lastIndexOf("[["), hs = before.lastIndexOf("#");
        if (w >= 0 && before.indexOf("]]", w) < 0 && hs < w) { const q = before.slice(w + 2); if (q.length > 60 || /\n/.test(q)) return close(); mode = "link"; start = w; return query(q); }
        if (hs >= 0 && (hs === 0 || /[\s(（\[]/.test(before.charAt(hs - 1)))) { const q = before.slice(hs + 1); if (/\s/.test(q) || q.length > 30 || /^\d+$/.test(q) && q.length > 2) return close(); mode = "tag"; start = hs; return query(q); }
        close();
      }
      function pick() {
        const it = items[ci]; if (!it) return close();
        const v = ta.value, c = ta.selectionStart; const after = v.slice(c);
        let ins;
        if (mode === "link") { ins = "[[" + it.title + "]]"; const trail = after.indexOf("]]") === 0 ? 2 : 0; ta.value = v.slice(0, start) + ins + after.slice(trail); }
        else { ins = "#" + it.name + " "; ta.value = v.slice(0, start) + ins + after; }
        const pos = start + ins.length; ta.setSelectionRange(pos, pos);
        close();
        try { opts.onPick && opts.onPick({ kind: mode, id: it.id || null, title: it.title || it.name, isNew: !!it.isNew }); } catch (e) { console.error(e); }
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        ta.focus();
      }
      const onInput = () => detect();
      const onKey = (e) => {
        if (e.isComposing || e.keyCode === 229) return;
        if (!open) return;
        if (e.key === "ArrowDown") { e.preventDefault(); ci = (ci + 1) % items.length; render(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); ci = (ci - 1 + items.length) % items.length; render(); }
        else if (e.key === "Enter" || e.key === "Tab") { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); e.stopPropagation(); pick(); }
        else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
      };
      const onBlur = () => { blurT = setTimeout(close, 150); };
      const onFocus = () => clearTimeout(blurT);
      ta.addEventListener("input", onInput); ta.addEventListener("compositionend", onInput); ta.addEventListener("keydown", onKey); ta.addEventListener("blur", onBlur); ta.addEventListener("focus", onFocus);
      ta.addEventListener("click", () => { if (open) detect(); });
      const st = { close, isOpen: () => open, destroy() { close(); ta.removeEventListener("input", onInput); ta.removeEventListener("compositionend", onInput); ta.removeEventListener("keydown", onKey); ta.removeEventListener("blur", onBlur); ta.removeEventListener("focus", onFocus); if (acCur === st) acCur = null; } };
      return st;
    }
    const acOpen = () => !$("acPop").hidden;
    function closeAc() { if (acCur) acCur.close(); $("acPop").hidden = true; }

    // ================= 메뉴 (떠 있는 작은 메뉴 — 선생님 스위처 · 노트 ⋯) =================
    // openMenu(anchorEl, [{ label, act(), disabled, danger }]) — 바깥 클릭 · Esc 로 닫힌다
    function openMenu(anchor, items) {
      closeMenu();
      menu = h('<div class="menu" role="menu">' + items.map((it, i) => '<button type="button" role="menuitem" data-i="' + i + '"' + (it.disabled ? " disabled" : "") + (it.danger ? ' class="danger"' : "") + '>' + esc(it.label) + '</button>').join("") + '</div>');
      const r = anchor.getBoundingClientRect(); document.body.appendChild(menu);
      const mw = menu.offsetWidth || 220, mh = menu.offsetHeight || 200;
      menu.style.left = Math.max(8, Math.min(r.left, window.innerWidth - mw - 8)) + "px";
      menu.style.top = (r.bottom + 6 + mh > window.innerHeight ? Math.max(8, r.top - mh - 6) : r.bottom + 6) + "px";
      menu.querySelectorAll("button").forEach(b => b.onclick = () => { const it = items[+b.dataset.i]; closeMenu(); it && it.act && it.act(); });
      setTimeout(() => document.addEventListener("click", function off(ev) { if (menu && !menu.contains(ev.target) && ev.target !== anchor) closeMenu(); document.removeEventListener("click", off); }), 0);
      return menu;
    }
    function closeMenu() { if (menu) { menu.remove(); menu = null; } const tm = $("navTeacherMenu"); if (tm && !tm.hidden) { tm.hidden = true; $("navTeacher").setAttribute("aria-expanded", "false"); } const fp = $("libFilterPop"); if (fp && !fp.hidden) fp.hidden = true; }
    const menuOpen = () => !!menu || !$("navTeacherMenu").hidden;

    // ================= 키보드 단축키 (§3.10) =================
    function bindKeyboard() {
      document.addEventListener("keydown", (e) => {
        if (e.isComposing || e.keyCode === 229) return;                       // 한글 IME 조합 중엔 아무것도 하지 않는다
        const mod = e.metaKey || e.ctrlKey;
        if (mod && !e.altKey && (e.key === "k" || e.key === "K")) { e.preventDefault(); if (cmdkOpen()) closeCmdk(); else openCmdk(); return; }   // 입력창 안에서도
        const tag = (e.target.tagName || "").toLowerCase(); const inInput = tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;
        if (inInput) {
          if (e.key === "Escape") { if (acOpen()) { closeAc(); return; } if (cmdkOpen()) { closeCmdk(); return; } if (sheetOpen()) { closeSheet(); return; } if ($("noteMemoText") === e.target && cur && cur.view === "note") { e.target.blur(); const tg = $("noteMemoToggle"); if (tg && !$("noteMemoText").hidden) tg.click(); } }
          return;                                                                // ⌘Enter 는 각 입력이 스스로 처리한다 (메모 저장 · 파일 시트 · 질문 전송)
        }
        if (e.key === "Escape") {
          if (paperOpen()) closePaper();
          else if (sheetOpen()) closeSheet();
          else if (cmdkOpen()) closeCmdk();
          else if (acOpen()) closeAc();
          else if (menuOpen()) closeMenu();
          else if (!$("asidePeek").hidden) closePeek();
          else if (document.body.classList.contains("brainFull")) { try { BRAINUI.fullscreen(false); } catch (x) { document.body.classList.remove("brainFull"); } }
          else if ($("nav").classList.contains("open")) closeNavDrawer();
          else if (cur && cur.view === "note" && !$("noteMemoText").hidden) { const tg = $("noteMemoToggle"); if (tg) tg.click(); }
          return;
        }
        if (sheetOpen() || paperOpen() || cmdkOpen()) return;                    // 오버레이가 있으면 단일 글자 단축키는 쉰다
        if (e.metaKey || e.ctrlKey || e.altKey) return;                          // 나머지 조합키는 브라우저에 준다
        const k = e.key, kl = k.toLowerCase(), t = sel();
        if (k === "/") { e.preventDefault(); const ai = $("asideAskInput"); if (ai && ai.offsetParent !== null) ai.focus(); else { ROUTE.go("#/ask"); setTimeout(() => { const x = $("askInput"); if (x) x.focus(); }, 120); } return; }
        if (k === "?") { openHelp(); return; }
        if (k === "[") { toggleNav(); return; } if (k === "]") { toggleAside(); return; }
        if (k === "Delete") { if (t) openDeleteSheet(t); return; }
        if (k === "ArrowLeft" || k === "ArrowRight") { const ids = [...S.teachers.keys()]; if (!ids.length) return; let i = ids.indexOf(S.selectedId); i = (i + (k === "ArrowRight" ? 1 : -1) + ids.length) % ids.length; APP.select(ids[i]); return; }
        if (/^[1-8]$/.test(k)) { ROUTE.go(ROUTE.all(ROUTE.LIB_KINDS[+k - 1])); return; }
        switch (kl) {
          case "n": openTeacherSheet(null); break;
          case "o": if (t) pickFiles(); else toast("선생님을 골라 주세요"); break;
          case "l": if (t) run(() => APP.learn(t.id, { force: true })); else toast("선생님을 골라 주세요"); break;
          case "p": if (t) openPredictSheet(); else toast("선생님을 골라 주세요"); break;
          case "m": if (t) openMockSheet(); else toast("선생님을 골라 주세요"); break;
          case "g": ROUTE.go("#/brain"); break;
          case "h": ROUTE.go("#/today"); break;
          case "i": ROUTE.go("#/inbox"); break;
          case "t": ROUTE.go("#/timeline"); break;
          case "a": ROUTE.go("#/ask"); break;
          case "e": if (cur && cur.view === "note") { const tg = $("noteMemoToggle"); if (tg) { e.preventDefault(); tg.click(); } } break;
          case "c": { const id = cur && cur.view === "inbox" ? "captureText" : cur && cur.view === "today" ? "homeCaptureText" : null; const el = id && $(id); if (el) { e.preventDefault(); el.focus(); } } break;
        }
      });
    }

    // ================= 전역 드롭 (#dropAll · body.dragging) =================
    // 브레인 뷰의 노드 드롭은 BRAINUI 가 #vBrain 에서 stopPropagation 으로 가로챈다(stage.pick → UI.dropTo(files, teacherId, at)).
    const isVideo = (f) => /\.(mp4|webm)$/i.test(f.name);
    function bindDrop() {
      const hasFiles = (e) => e.dataTransfer && [...(e.dataTransfer.types || [])].includes("Files");
      document.addEventListener("dragenter", e => { if (!hasFiles(e)) return; e.preventDefault(); document.body.classList.add("dragging"); });
      document.addEventListener("dragover", e => { if (!hasFiles(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = "copy"; });
      document.addEventListener("dragleave", e => { if (e.relatedTarget === null || e.clientX <= 0 || e.clientY <= 0) document.body.classList.remove("dragging"); });
      document.addEventListener("drop", e => { if (hasFiles(e)) document.body.classList.remove("dragging"); }, true);   // 캡처: 누가 처리하든 표시는 끈다
      document.addEventListener("drop", e => {
        if (!hasFiles(e)) return; e.preventDefault();
        const tg = e.target.closest ? e.target : null;
        if (tg && (tg.closest("#sheetWrap") || tg.closest(".tcard") || tg.closest("#sVidDrop"))) return;
        const files = [...e.dataTransfer.files]; if (!files.length) return;
        dropTo(files, null, { x: e.clientX, y: e.clientY });
      });
    }
    // dropTo(files, teacherId, at) — 파일 시트로. teacherId 가 없으면 선택된 선생님 → 없으면 고르기 시트 → 선생님이 없으면 선생님 시트.
    function dropTo(files, teacherId, at) {
      files = [...files]; const vids = files.filter(isVideo), docs = files.filter(f => !isVideo(f));
      if (vids.length) toast("배경 영상으로 쓸까요? " + vids[0].name, { action: "브레인 뷰 배경으로", onAction: () => setVideo(vids[0]) });
      if (!docs.length) return;
      if (teacherId && T(teacherId)) { openFilesSheet(docs, teacherId, at); return; }
      if (!S.teachers.size) { openTeacherSheet(null, docs); return; }
      const t = sel();
      if (t) openFilesSheet(docs, t.id, at); else openPickSheet(docs);
    }

    // ================= 왼쪽 #nav (§2.7) =================
    let navSeq = 0, growthAt = 0;
    function spark(cv, arr, color) {
      if (!cv) return; const ctx = cv.getContext("2d"); if (!ctx) return;
      const W = cv.width, H = cv.height; ctx.clearRect(0, 0, W, H);
      arr = (arr || []).map(v => +v || 0); if (!arr.length) return;
      const max = Math.max(1, ...arr), n = arr.length, pad = 3;
      const X = (i) => pad + (W - 2 * pad) * (n === 1 ? 0.5 : i / (n - 1)), Y = (v) => H - pad - (H - 2 * pad) * (v / max);
      ctx.beginPath(); arr.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)));
      ctx.lineWidth = 2; ctx.strokeStyle = color || "#5fc8ff"; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
      ctx.lineTo(X(n - 1), H - pad); ctx.lineTo(X(0), H - pad); ctx.closePath(); ctx.fillStyle = "rgba(95,200,255,.12)"; ctx.fill();
      ctx.fillStyle = color || "#5fc8ff"; ctx.beginPath(); ctx.arc(X(n - 1), Y(arr[n - 1]), 2.5, 0, Math.PI * 2); ctx.fill();
    }
    function renderNav() {
      const t = sel(), all = S.selectedId === APP.ALL, ids = all ? [...S.teachers.keys()] : (t ? [t.id] : []);
      // 선생님 스위처
      const p = t && S.profiles.get(t.id);
      $("navTeacher").innerHTML = '<i class="dot" style="background:' + esc(t ? t.color : "var(--dim)") + '"></i><span class="nm">' + (t ? esc(t.name) + '<small>' + esc(t.subject || "") + '</small>' : all ? "모든 선생님" : S.teachers.size ? "선생님 고르기" : "선생님 없음") + '</span>' + (t ? '<span class="badge">V' + (p ? p.version : 0) + '</span>' : "");
      $("navTeacher").title = t ? APP.sub(t) : "선생님 바꾸기 (← →)";
      $("navTeacherMenu").innerHTML = [...S.teachers.values()].map(x => { const c = S.counts.get(x.id) || {}, px = S.profiles.get(x.id); return '<button type="button" role="menuitem" data-teacher="' + x.id + '"' + (x.id === S.selectedId ? ' class="on"' : "") + '><i class="dot" style="background:' + esc(x.color) + '"></i><span class="nm">' + esc(x.name) + ' <small>' + esc(x.subject || "") + '</small></span><small class="num">' + (c.questions || 0) + ' Q · V' + (px ? px.version : 0) + '</small></button>'; }).join("")
        + '<button type="button" role="menuitem" data-teacher="*"' + (all ? ' class="on"' : "") + '><i class="dot" style="background:var(--dim)"></i><span class="nm">모든 선생님</span></button><button type="button" role="menuitem" id="btnNew">＋ 선생님</button>';
      // 주 메뉴 활성 · 인박스 배지
      const view = cur ? cur.view : "today"; const navKey = view === "library" || view === "tag" ? "library" : view === "note" || view === "search" ? "" : view;
      $("navMain").querySelectorAll("[data-nav]").forEach(a => a.classList.toggle("on", a.dataset.nav === navKey));
      const act = S.queue.filter(ACTIVE).length; $("navInboxCount").textContent = act ? String(act) : "";
      // 서재 카운트 (선생님 범위 합계)
      const sum = (k) => ids.reduce((n, id) => n + ((S.counts.get(id) || {})[k] || 0), 0);
      const counts = { exams: sum("exams"), questions: sum("questions"), passages: sum("passages"), sources: sum("sources"), mocks: sum("mocks"), profiles: t ? (p ? "V" + p.version : "0") : ids.filter(id => S.profiles.has(id)).length, predictions: ids.filter(id => S.predictions.has(id)).length, notes: navCounts.notes === undefined ? "" : navCounts.notes };
      $("navLib").querySelectorAll("[data-nav-kind]").forEach(a => { const k = a.dataset.navKind; a.querySelector(".cnt").textContent = String(counts[k] === undefined ? "" : counts[k]); a.classList.toggle("on", view === "library" && cur && cur.kind === k); });
      // 태그 (상위 8)
      let tags = []; try { tags = (NOTES.tags.list(t ? t.id : null) || []).slice().sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 8); } catch (e) { tags = []; }
      const tagsEl = $("navTags"); [...tagsEl.querySelectorAll(".nav-item")].forEach(x => x.remove());
      tags.forEach(x => tagsEl.appendChild(h('<a class="nav-item' + (view === "tag" && cur && cur.name === x.name ? " on" : "") + '" data-tag="' + esc(x.name) + '" href="' + esc(ROUTE.tag(x.name)) + '"><span class="lb">#' + esc(x.name) + '</span><span class="cnt">' + (x.count || 0) + '</span></a>')));
      tagsEl.hidden = !tags.length;
      // 최근 (localStorage ui2.recent, 8)
      const rec = (ui2().recent || []).filter(id => id && (!INDEX.get || INDEX.get(id) || !INDEX.state.ready)).slice(0, 8);
      const recEl = $("navRecent"); [...recEl.querySelectorAll(".nav-item")].forEach(x => x.remove());
      rec.forEach(id => { const d = INDEX.get ? INDEX.get(id) : null; const kind = d ? d.kind : ROUTE.kindOf(id); recEl.appendChild(h('<a class="nav-item' + (view === "note" && cur && cur.id === id ? " on" : "") + '" data-id="' + esc(id) + '" href="' + esc(ROUTE.note(id)) + '"><span class="mono-kind" data-kind="' + esc(kind) + '"></span><span class="lb">' + esc(d ? d.title : id) + '</span></a>')); });
      recEl.hidden = !rec.length;
      // 성장 (비동기 — 300ms 안에 다시 부르면 캐시)
      const seq = ++navSeq;
      const paint = (g) => { const el = $("navGrowth"); el.querySelector(".g").innerHTML = g ? '<span>문항 <b>' + g.questions + '</b></span><span>지문 <b>' + g.passages + '</b></span><span>V<b>' + g.profileVersion + '</b></span><span>메모 <b>' + g.notes + '</b></span>' + (g.handoutRate !== null && g.handoutRate !== undefined ? '<span>반영 <b>' + pct(g.handoutRate) + '</b></span>' : "") : ""; spark($("navGrowthCanvas"), g ? g.spark : []); };
      if (growthCache && growthCache.key === (S.selectedId || "") && Date.now() - growthAt < 300) paint(growthCache.g);
      else APP.growth(S.selectedId).then(g => { if (seq !== navSeq) return; growthCache = { key: S.selectedId || "", g }; growthAt = Date.now(); paint(g); navCounts.notes = g.notes; $("navLib").querySelector('[data-nav-kind="notes"] .cnt').textContent = String(g.notes); }).catch(() => {});
    }
    function pulseGrowth() { const el = $("navGrowth"); el.classList.remove("pulse"); void el.offsetWidth; el.classList.add("pulse"); setTimeout(() => el.classList.remove("pulse"), 450); document.querySelectorAll("#homeStats .stat").forEach(s => { s.classList.remove("pulse"); void s.offsetWidth; s.classList.add("pulse"); setTimeout(() => s.classList.remove("pulse"), 450); }); }
    function pushRecent(id) { if (!id) return; const u = ui2(); const rec = [id].concat((u.recent || []).filter(x => x !== id)).slice(0, 8); ui2set({ recent: rec }); }
    function toggleTeacherMenu(force) { const m = $("navTeacherMenu"); const open = force === undefined ? m.hidden : !!force; if (open) closeMenu(); m.hidden = !open; $("navTeacher").setAttribute("aria-expanded", open ? "true" : "false"); }

    // ---- nav · aside 접기 ([ ]) — 상태는 ui2, 좁은 화면에서는 nav 가 서랍 ----
    function toggleNav(force) {
      if (isNarrow()) { const open = force === undefined ? !$("nav").classList.contains("open") : !!force; $("nav").classList.toggle("open", open); $("navBack").hidden = !open; return; }
      const closed = force === undefined ? !document.body.classList.contains("navClosed") : !force;
      document.body.classList.toggle("navClosed", closed); ui2set({ nav: closed ? "closed" : "open" }); afterLayout();
    }
    function closeNavDrawer() { $("nav").classList.remove("open"); $("navBack").hidden = true; }
    function toggleAside(force) {
      const closed = force === undefined ? !document.body.classList.contains("asideClosed") : !force;
      document.body.classList.toggle("asideClosed", closed); ui2set({ aside: closed ? "closed" : "open" }); afterLayout();
    }
    function afterLayout() { const st = APP.stage(); if (st) setTimeout(() => { try { st.resize(); } catch (e) {} }, 220); }
    function applyLayoutPrefs() {
      const u = ui2(), w = window.innerWidth, mid = w <= 1099 && w > 900;
      document.body.classList.toggle("navClosed", u.nav ? u.nav === "closed" : mid);
      document.body.classList.toggle("asideClosed", u.aside ? u.aside === "closed" : mid);
    }
    function watchNarrow() {
      const mq = window.matchMedia ? window.matchMedia("(max-width: 900px)") : null;
      const apply = () => { const on = mq ? mq.matches : window.innerWidth <= 900; document.body.classList.toggle("narrow", on); if (!on) closeNavDrawer(); renderTabbar(); afterLayout(); };
      if (mq) { if (mq.addEventListener) mq.addEventListener("change", apply); else if (mq.addListener) mq.addListener(apply); }
      window.addEventListener("resize", () => { if (!mq) apply(); });
      apply();
    }

    // ================= #topbar · #statusbar · #tabbar (§2.8) =================
    function renderTopbar() {
      const t = sel(), all = S.selectedId === APP.ALL, r = cur || { view: "today", query: {} };
      const pieces = [];
      if (t) pieces.push({ label: t.name, route: ROUTE.note(t.id) }); else if (all) pieces.push({ label: "모든 선생님", route: "#/today" });
      const v = r.view;
      if (v === "library") { pieces.push({ label: "서재", route: ROUTE.all("exams") }); pieces.push({ label: LIB_LABEL[r.kind] || r.kind, route: ROUTE.all(r.kind) }); if (r.query && r.query.kind) pieces.push({ label: r.query.kind, route: ROUTE.href(r) }); }
      else if (v === "tag") { pieces.push({ label: "태그", route: ROUTE.all("notes", { tags: 1 }) }); pieces.push({ label: "#" + r.name, route: ROUTE.href(r) }); }
      else if (v === "note") { const d = INDEX.get ? INDEX.get(r.id) : null; const kind = d ? d.kind : r.kind; const store = { teacher: null, exam: "exams", question: "questions", passage: "passages", source: "sources", handout: "sources", profile: "profiles", prediction: "predictions", mock: "mocks", note: "notes", ask: "notes" }[kind]; if (kind !== "teacher") pieces.push({ label: KIND_LABEL[kind] || "노트", route: store ? ROUTE.all(store) : "#/today" }); if (!(kind === "teacher" && t && t.id === r.id)) pieces.push({ label: d ? d.title : (kind === "teacher" ? (T(r.id) || {}).name || "선생님" : "노트"), route: ROUTE.note(r.id) }); }
      else pieces.push({ label: VIEW_LABEL[v] || v, route: ROUTE.href({ view: v }) });
      $("crumbs").innerHTML = pieces.map((x, i) => (i ? '<i>›</i>' : "") + '<a data-route="' + esc(x.route) + '" title="' + esc(x.label) + '">' + esc(x.label) + '</a>').join("");
      updateEngine(); updateCloud();
    }
    function updateEngine(ok) {
      const e = $("engine"); const has = API.ready();
      e.classList.remove("ok", "fail"); if (ok === true) e.classList.add("ok"); else if (ok === false) e.classList.add("fail"); else if (has) e.classList.add("ok");
      $("engineLabel").textContent = has ? String(API.modelLabel()).toUpperCase() + (ok === false ? " · OFFLINE" : "") : "NO KEY";
      renderOnboard();
    }
    function updateCloud() {
      const c = SYNC.st, e = $("cloud"); e.classList.remove("ok", "fail", "busy");
      if (!c.enabled) { $("cloudLabel").textContent = "CLOUD OFF"; return; }
      if (c.status === "error") { e.classList.add("fail"); $("cloudLabel").textContent = "CLOUD OFFLINE"; }
      else if (c.status === "syncing" || c.pending) { e.classList.add("busy"); $("cloudLabel").textContent = "SYNCING " + (c.pending || ""); }
      else { e.classList.add("ok"); $("cloudLabel").textContent = "CLOUD · " + String(c.workspace || "").toUpperCase() + (c.private ? " · 비공개" : ""); }
    }
    const ago = (ms) => { const d = Date.now() - ms; return d < 60e3 ? Math.max(1, Math.round(d / 1000)) + "초 전" : d < 3600e3 ? Math.round(d / 60e3) + "분 전" : d < 86400e3 ? Math.round(d / 3600e3) + "시간 전" : TEXT.fmtDate(ms); };
    function renderStatusbar() {
      const act = S.queue.filter(ACTIVE).length, running = S.queue.filter(RUNNING).length;
      const q = $("queueMini"); q.querySelector(".txt").innerHTML = act ? '<span class="busy">⟳</span> 처리 중 ' + Math.min(1, running || act) + ' · 대기 ' + Math.max(0, act - 1) : (S.genCtrl ? '<span class="busy">⟳</span> 출제 중' : "인박스 비어 있음");
      $("qCancelAll").hidden = !act; $("qAbortGen").hidden = !S.genCtrl;
      $("indexMini").textContent = indexText();
      const c = SYNC.st; $("syncMini").textContent = !c.enabled ? "동기화 꺼짐" : c.status === "error" ? "동기화 오류" : (c.status === "syncing" || c.pending) ? "동기화 중 " + (c.pending || "") : c.lastSync ? "동기화 " + ago(c.lastSync) : "동기화 대기";
      $("buildMini").textContent = BUILD;
      $("engine").classList.toggle("busy", S.busy.size > 0 || running > 0);
      const b = $("tabInbox").querySelector(".badge"); if (b) b.textContent = act ? String(act) : "";
    }
    function renderTabbar() {
      const v = cur ? cur.view : "today"; const key = v === "library" || v === "tag" || v === "search" ? "library" : v === "timeline" || v === "ask" ? "more" : v === "note" ? "" : v;
      $("tabbar").querySelectorAll("[data-tab]").forEach(b => { b.classList.toggle("on", b.dataset.tab === key); b.setAttribute("aria-selected", b.dataset.tab === key ? "true" : "false"); });
      const act = S.queue.filter(ACTIVE).length; const b = $("tabInbox").querySelector(".badge"); if (b) b.textContent = act ? String(act) : "";
    }
    // ---- 온보딩 (오늘 카드) · #homeChanged ----
    function renderOnboard() {
      const ob = $("onboard"); if (!ob) return;
      const done = S.ui.onboardingDone || (S.teachers.size && [...S.counts.values()].some(c => c.questions || c.passages));
      ob.hidden = !!done;
      if (done) { if (bootDone && !S.ui.onboardingDone) APP.saveUi({ onboardingDone: true }).catch(() => {}); return; }
      const k = API.ready(), t = S.teachers.size > 0;
      $("ob1").className = "st " + (k ? "done" : "on"); $("ob2").className = "st " + (t ? "done" : k ? "on" : ""); $("ob3").className = "st " + (t ? "on" : "");
      $("ob1Btn").hidden = k; $("ob3Btn").hidden = !t; $("ob3Note").textContent = t ? "인박스 · 오늘 화면 · 어디에나 놓아도 돼요" : "선생님을 만들면 열려요";
    }
    function renderChanged() { const el = $("homeChanged"); if (el) el.hidden = !!ui2().changedSeen; }
    function setBrand() {
      const first = [...S.teachers.values()][0]; if (!first) return;
      const school = first.school === "흑석고" ? "흑석고" : first.school || "";
      $("brandSub").textContent = (school ? school + " 영어 · " : "") + "출제자 세컨드 브레인";
      $("wordsSchool").textContent = (first.school === "흑석고" ? "흑석고등학교" : first.school || "") + " · " + [...new Set([...S.teachers.values()].map(x => x.subject).filter(Boolean))].join(" · ");
    }
    function showBootError(data) {
      const el = $("bootError"); el.hidden = false;
      const tries = data && data.tries || 0;
      $("bootErrorMsg").textContent = (data && (data.message || (data.error && data.error.message))) || "저장소를 열지 못했어요";
      const btn = $("bootRetry");
      if (tries >= 5) { btn.textContent = "새로 고침"; btn.onclick = () => location.reload(); $("bootErrorMsg").textContent += " — 다른 탭을 모두 닫고 새로 고쳐 주세요"; }
      else { btn.textContent = "다시 시도"; btn.onclick = () => { el.hidden = true; APP.boot().catch(e => { console.error(e); showBootError({ message: e && e.message, tries: tries + 1 }); }); }; }
    }

    // ================= 오른쪽 #aside (§2.6) =================
    function renderAside(r) {
      r = r || cur; const note = !!(r && r.view === "note");
      ["asideProps", "asideBacklinks", "asideRelated", "asideGraph"].forEach(id => { $(id).hidden = !note; });
      const t = sel();
      $("asideAsk").querySelector("h4").textContent = note ? "이 노트에 대해 묻기" : t ? t.name + " 선생님에게 묻기" : "두뇌에게 묻기";
      $("asideAskInput").placeholder = note ? "이 노트에 대해…" : "질문…";
      renderAsideQueue();
      if (note && bootDone) { try { const p = NOTEUI.renderAside(r.id); if (p && typeof p.then === "function") p.catch(e => console.error(e)); } catch (e) { console.error(e); } }
    }
    function renderAsideQueue() {
      const jobs = S.queue.filter(RUNNING), box = $("asideQueue"); const show = jobs.length || !!S.genCtrl;
      box.hidden = !show; if (!show) return;
      const act = S.queue.filter(ACTIVE).length;
      box.querySelector("h4").textContent = "작업 " + Math.min(act, jobs.length || 1) + "/" + Math.max(act, 1);
      box.querySelector(".list").innerHTML = jobs.map(j => '<div class="q"><span class="n">' + esc(j.name) + '</span><button type="button" class="x ghost" data-cancel="' + esc(j.id) + '" title="취소">✕</button><div class="d">' + esc(j.detail || "") + '</div><div class="bar prog"><i style="width:' + Math.round((j.progress || 0) * 100) + '%"></i></div></div>').join("") + (S.genCtrl ? '<div class="q"><span class="n">적중 모의고사 출제 중</span><button type="button" class="x ghost" data-abort="1" title="출제 중단">✕</button></div>' : "");
      box.querySelectorAll("[data-cancel]").forEach(b => b.onclick = () => { const j = S.queue.find(x => x.id === b.dataset.cancel); if (j) APP.cancelJob(j); });
      box.querySelectorAll("[data-abort]").forEach(b => b.onclick = () => APP.abortGenerate());
    }
    function asideAskGo() {
      const q = $("asideAskInput").value.trim(); if (!q) { ROUTE.go("#/ask"); return; }
      $("asideAskInput").value = "";
      ROUTE.go(ROUTE.href({ view: "ask", query: { q, ctx: cur && cur.view === "note" ? cur.id : "" } }));
    }

    // ================= 라우팅 규칙 (§5.15) =================
    let following = false, rerenderT = 0, todayT = 0;
    function followTeacher(r) {
      if (!r || r.view !== "note" || !r.id) return;
      let tid = null;
      if (r.kind === "teacher") tid = r.id; else { const d = INDEX.get ? INDEX.get(r.id) : null; if (d && d.teacherId) tid = d.teacherId; }
      if (tid && tid !== S.selectedId && S.teachers.has(tid)) { following = true; try { APP.select(tid, true); } finally { following = false; } }
    }
    function renderView(r, entering) {
      if (!bootDone || !r) return;
      try {
        switch (r.view) {
          case "today": VIEWS.today(); renderOnboard(); renderChanged(); break;
          case "inbox": VIEWS.inbox(); break;
          case "note": NOTEUI.render(r.id, r.query || {}); break;
          case "tag": VIEWS.tag(r.name); break;
          case "library": VIEWS.library(r.kind, r.query || {}); break;
          case "brain": if (entering) BRAINUI.enter(r.query || {}); else BRAINUI.refresh(); break;
          case "timeline": VIEWS.timeline((r.query || {}).week || ""); break;
          case "ask": VIEWS.ask(r.query || {}); break;
          case "search": VIEWS.search((r.query || {}).q || ""); break;
        }
      } catch (e) { console.error(e); }
    }
    function onRoute(r, prev) {
      cur = r; const view = r.view;
      if (prev && prev.view === "brain" && view !== "brain") { try { if (document.body.classList.contains("brainFull")) BRAINUI.fullscreen(false); BRAINUI.leave(); } catch (e) { console.error(e); document.body.classList.remove("brainFull"); } }
      document.querySelectorAll("#main > .view").forEach(v => { v.hidden = v.dataset.view !== view; });
      $("main").dataset.view = view;
      document.body.classList.toggle("brainView", view === "brain");
      if (!prev || prev.view !== view || (view === "note" && prev.id !== r.id) || (view === "library" && prev.kind !== r.kind)) { $("main").scrollTop = 0; if (isNarrow()) window.scrollTo(0, 0); }
      if (isNarrow()) closeNavDrawer();
      followTeacher(r);
      renderView(r, !prev || prev.view !== view);
      renderAside(r); renderNav(); renderTopbar(); renderTabbar();
      if (view === "note" && r.id) pushRecent(r.id);
      if (view === "brain") afterLayout();
    }
    function rerender() { if (!cur) return; renderView(cur, false); renderAside(cur); renderNav(); renderTopbar(); renderTabbar(); renderStatusbar(); renderOnboard(); }
    function scheduleRerender() { clearTimeout(rerenderT); rerenderT = setTimeout(rerender, 30); }
    function closeOverlays() { closeSheet(); closePaper(); closeCmdk(); closeAc(); closeMenu(); closePeek(); }

    // ================= 초기화 =================
    function bindShell() {
      $("btnSearch").onclick = () => openCmdk();
      $("btnSettings").onclick = () => openSettings("engine"); $("engine").onclick = () => openSettings("engine"); $("cloud").onclick = () => openSettings("cloud"); $("btnHelp").onclick = openHelp;
      $("asideToggle").onclick = () => toggleAside(); $("navToggle").onclick = () => toggleNav(); $("navBack").onclick = closeNavDrawer;
      $("navTeacher").onclick = (e) => { e.stopPropagation(); toggleTeacherMenu(); };
      $("navTeacherMenu").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; e.stopPropagation(); toggleTeacherMenu(false); if (b.id === "btnNew") openTeacherSheet(null); else if (b.dataset.teacher) { APP.select(b.dataset.teacher); if (isNarrow()) closeNavDrawer(); } });
      document.addEventListener("click", (e) => { if (!$("navTeacherMenu").hidden && !e.target.closest("#navTeacherWrap")) toggleTeacherMenu(false); });
      $("nav").addEventListener("click", (e) => { const a = e.target.closest("a.nav-item"); if (a && isNarrow()) closeNavDrawer(); });
      $("navGrowth").onclick = () => ROUTE.go("#/timeline");
      $("statusbar").addEventListener("click", (e) => { if (e.target.closest("button")) return; ROUTE.go("#/inbox"); });
      $("qCancelAll").onclick = (e) => { e.stopPropagation(); APP.cancelAll(); }; $("qAbortGen").onclick = (e) => { e.stopPropagation(); APP.abortGenerate(); };
      $("tabbar").addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (!b) return; const k = b.dataset.tab; if (k === "more") openMoreSheet(); else if (k === "library") ROUTE.go(ROUTE.all("exams")); else ROUTE.go("#/" + k); });
      $("crumbs").addEventListener("click", (e) => { const a = e.target.closest("[data-route]"); if (a) ROUTE.go(a.dataset.route); });
      $("sheetClose").onclick = closeSheet; $("sheetWrap").addEventListener("click", e => { if (e.target === $("sheetWrap")) closeSheet(); });
      $("paperClose").onclick = closePaper; $("paperPrint").onclick = () => window.print(); $("paperDocx").onclick = paperDocx;
      $("paperCopy").onclick = async () => { const txt = $("paperPage").innerText; try { await navigator.clipboard.writeText(txt); toast("본문을 복사했어요", { ok: true }); } catch (e) { toast("복사하지 못했어요", { bad: true }); } };
      $("fileInput").accept = EXTRACT.ACCEPT + ",.mp4,.webm";
      $("fileInput").onchange = () => { const t = sel(); const files = [...$("fileInput").files]; $("fileInput").value = ""; const pk = pendingKind; pendingKind = null; if (!files.length) return; if (t) openFilesSheet(files, t.id, null, pk); else dropTo(files, null, null); };
      $("cameraInput").onchange = () => { const t = sel(); const files = [...$("cameraInput").files]; $("cameraInput").value = ""; if (files.length) { if (t) openFilesSheet(files, t.id, null, "exam"); else dropTo(files, null, null); } };
      $("importInput").onchange = async () => { const f = $("importInput").files[0]; $("importInput").value = ""; if (!f) return; try { const r = await APP.importJson(f); toast("불러왔어요 — 선생님 " + r.teachers + "명" + (r.dupSkipped ? ", 겹친 파일 " + r.dupSkipped + "개는 건너뛰었어요" : ""), { ok: true }); closeSheet(); } catch (e) { toast(e.message, { bad: true }); } };
      $("videoInput").onchange = () => { const f = $("videoInput").files[0]; $("videoInput").value = ""; if (f) setVideo(f); };
      $("asideAskGo").onclick = asideAskGo; $("asideAskInput").addEventListener("keydown", e => { if (e.isComposing || e.keyCode === 229) return; if (e.key === "Enter") { e.preventDefault(); asideAskGo(); } });
      $("asideGraphOpen").onclick = () => { if (cur && cur.view === "note") ROUTE.go(ROUTE.href({ view: "brain", query: { focus: cur.id } })); else ROUTE.go("#/brain"); };
      $("asidePeekClose").onclick = closePeek; $("asidePeekOpen").onclick = () => { const id = $("asidePeek").dataset.id; closePeek(); if (id) ROUTE.go(ROUTE.note(id)); };
      // 위임: 온보딩 · 무엇이 바뀌었나 (VIEWS 가 #vToday 안을 다시 그려도 살아 있게) · ⌘클릭 미리보기
      document.addEventListener("click", (e) => {
        const el = e.target.closest ? e.target.closest("#ob1Btn, #ob2Btn, #ob3Btn, #homeChangedClose, a[href^=\"#/n/\"]") : null; if (!el) return;
        if (el.id === "ob1Btn") openSettings("engine"); else if (el.id === "ob2Btn") openTeacherSheet(null); else if (el.id === "ob3Btn") ROUTE.go("#/inbox");
        else if (el.id === "homeChangedClose") { ui2set({ changedSeen: true }); renderChanged(); }
        else if (el.matches('a[href^="#/n/"]') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); const id = ROUTE.parse(el.getAttribute("href")).id; if (id) peek(id); }
      });
      bindCmdk();
    }
    function onApp(why, data) {
      switch (why) {
        case "boot":
          bootDone = true; setBrand(); updateEngine(); updateCloud(); $("fpsTag").hidden = !S.ui.showFps; document.body.classList.toggle("reduced", !!S.ui.reduced);
          rerender(); renderChanged();
          if (S.cloud && S.cloud.error) toast("Supabase 에 연결하지 못해 이 브라우저 저장소로만 갑니다 (" + String(S.cloud.error).slice(0, 60) + ")", { bad: true, ms: 8000 });
          if (!API.ready()) setTimeout(() => toast("먼저 설정에서 API 키를 저장해 주세요 — 동형 모의고사 생성기에 저장한 키가 있으면 그대로 써요", { action: "설정 열기", onAction: () => openSettings("engine") }), 800);
          break;
        case "bootError": showBootError(data); break;
        case "teachers": case "data": case "note": case "link": case "tag": case "ask": scheduleRerender(); break;
        case "select": if (!following) scheduleRerender(); else { renderNav(); renderTopbar(); } break;
        case "profile": scheduleRerender(); if (data && data.rec) toast("학습 완료 — 프로파일 V" + data.rec.version + (data.delta && data.delta.length ? " · " + data.delta[0] : ""), { ok: true, action: "프로파일 열기", onAction: () => ROUTE.go(ROUTE.note(data.rec.id)) }); break;
        case "prediction": scheduleRerender(); if (data && data.rec) toast("예측 완료 — 유력 지문 " + ((data.rec.blueprint || {}).passages || []).length + "개", { ok: true, action: "청사진 열기", onAction: () => ROUTE.go(ROUTE.note(data.rec.id)) }); break;
        case "mock": renderStatusbar(); scheduleRerender(); if (data) { openPaper(data); toast("모의고사가 완성됐어요 — " + (data.questions || []).length + "문항" + (data.failed && data.failed.length ? " (" + data.failed.length + "문항은 만들지 못했어요)" : ""), { ok: true }); } break;
        case "queue": case "busy":
          renderStatusbar(); renderAsideQueue(); renderTabbar(); renderOnboard();
          { const act = S.queue.filter(ACTIVE).length; $("navInboxCount").textContent = act ? String(act) : ""; }
          if (cur && cur.view === "inbox") { try { VIEWS.inbox(); } catch (e) { console.error(e); } }
          else if (cur && cur.view === "today") { clearTimeout(todayT); todayT = setTimeout(() => { try { VIEWS.today(); renderOnboard(); renderChanged(); } catch (e) { console.error(e); } }, 250); }
          break;
        case "index": renderStatusbar(); if (data && data.ready) { renderNav(); renderTopbar(); } { const st = $("sIndexStat"); if (st) st.textContent = indexText(); } break;
        case "growth": pulseGrowth(); growthCache = null; renderNav(); break;
        case "toast": if (data) toast(data.msg, data); break;
        case "needKey": openSettings("engine"); break;
        case "askVideo": if (data) toast("배경 영상으로 쓸까요? " + data.name, { action: "브레인 뷰 배경으로", onAction: () => setVideo(data) }); break;
        case "mode": renderNav(); break;
      }
    }
    function init() {
      bindShell(); bindKeyboard(); bindDrop();
      applyLayoutPrefs(); watchNarrow();
      $("buildMini").textContent = BUILD;
      APP.on(onApp);
      SYNC.on(() => { updateCloud(); renderStatusbar(); });
      ROUTE.setCloseHook(closeOverlays);
      ROUTE.on(onRoute);
      ROUTE.init();
      renderStatusbar();
      setInterval(() => { if (!document.hidden) renderStatusbar(); }, 10000);
    }
    return { init, toast, openSheet, closeSheet, openSettings, openTeacherSheet, openDeleteSheet, openFilesSheet, openPickSheet, openPredictSheet, openMockSheet, openHelp, openMoreSheet, openPaper, closePaper, paperDocx, openDrawer, openCmdk, closeCmdk, openMenu, closeMenu, run,
             renderNav, renderTopbar, renderStatusbar, renderTabbar, renderOnboard, renderAside, renderAsideQueue, rerender, updateEngine, updateCloud, setVideo, ICONS, irow, esc, h, spark, autocomplete, closeOverlays, peek, closePeek,
             dropTo, pickFiles, pickCamera, copyBlueprint, toggleNav, toggleAside, ui2, ui2set, current: () => cur, KIND_LABEL, LIB_LABEL };
  })();
