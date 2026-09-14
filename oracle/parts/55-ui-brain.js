  // ==================================================================
  //  BRAINUI — 브레인 뷰 (spec §2.12 · §3.4 · §5.14). 3D 무대(41-stage) 또는 2D 폴백(46-graph2d) 위에 그래프를 얹고
  //  필터 칩(#brainBar, localStorage orun_oracle_ui2.graphFilters) · 2D 전환(#brain2d, 이번 세션만) · 전체화면(#brainFull) · 포커스 칩(#brainFocus)
  //  · HUD(#brainHud) · 호버 칩(#chips) · 선생님 카드 열(#flatGrid, 2D) · 노드 드롭(→ UI.dropTo) · 빈 상태(#brainEmpty) · 재생 큐를 맡는다.
  //  무대는 뷰에 처음 들어갈 때 APP.ensureStage() 가 만들고, 떠나면 pause · 돌아오면 resume + resize (APP.enterStage/leaveStage).
  //  enter(query) · leave() · refresh() · hud(id) · renderFlat() · bindDrop() · chipsLoop() · fullscreen(on)
  // ==================================================================
  const BRAINUI = (function () {
    const $ = (id) => document.getElementById(id), esc = TEXT.esc;
    const S = APP.state;
    const KINDS = ["exam", "passage", "question", "handout", "note", "prediction", "mock"];
    const KIND_KO = { teacher: "선생님", exam: "시험", question: "문항", passage: "지문", handout: "프린트", note: "메모", prediction: "예측", mock: "모의고사", ask: "질문" };
    const RUNNING = (j) => !["done", "error", "cancelled", "queued"].includes(j.stage);
    let bound = false, active = false, g2d = null, loopRaf = 0, dropTarget = null, hoverNode = null, hudId = null, lastSig = "", refreshT = 0, stageBound = null, lastMode = null, warnedFocus = "";
    const sel = () => (S.selectedId && S.selectedId !== APP.ALL) ? APP.teacher(S.selectedId) || null : null;
    const h = (html) => { const t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstChild; };
    const isFlat = () => S.mode === "flat";

    // ---- 필터 (localStorage, 개인 상태) ----
    function filters() { const u = UI.ui2(); return (u.graphFilters && typeof u.graphFilters === "object") ? u.graphFilters : {}; }
    function enabledKinds() { const f = filters(); return KINDS.filter(k => f[k] !== false); }
    function setFilter(kind, on) { const f = Object.assign({}, filters()); f[kind] = !!on; UI.ui2set({ graphFilters: f }); }
    function focusId() { const c = UI.current(); return c && c.view === "brain" && c.query && c.query.focus ? String(c.query.focus) : ""; }
    function route(o) { return ROUTE.href(o); }

    // ---- 그래프 재구성 ----
    function graphFor(t, quiet) {
      if (!t) return null;
      const focus = focusId(); const g = LINKS.graph(t.id, { kinds: enabledKinds(), focus: focus || undefined, hops: 2 });
      if (focus && !g.nodes.some(n => n.id === focus) && focus !== t.id) { if (!quiet && warnedFocus !== focus) { warnedFocus = focus; UI.toast("그 노드는 지금 그래프에 없어요"); } return LINKS.graph(t.id, { kinds: enabledKinds() }); }
      return g;
    }
    const sig = (t, g) => (t ? t.id : "-") + "|" + enabledKinds().join(",") + "|" + focusId() + "|" + (g ? g.nodes.length + "/" + g.edges.length + "/" + g.nodes.reduce((a, n) => a + n.id.length + (n.hit ? 1 : 0), 0) : "0");
    function refresh() {
      if (!active) { enter({}); return; }   // 셸은 브레인 뷰가 현재 뷰일 때만 refresh 를 부른다 — 부팅 뒤 첫 그리기(entering=false)도 여기로 온다
      const t = sel(); const g = graphFor(t);
      renderBar(); renderEmpty(t, g);
      if (!isFlat()) {
        const st = APP.ensureStage();
        if (st) {
          bindStage(st);
          const s = sig(t, g);
          if (s !== lastSig) { lastSig = s; if (g) st.setGraph(g); else st.clearGraph(); st.focusNode(focusId() || null); }
        }
      }
      if (isFlat()) {
        const gg = ensure2d();
        if (gg) {
          const s = "2d|" + sig(t, g);
          if (s !== lastSig) { lastSig = s; if (g && t) gg.setGraph({ nodes: [{ id: t.id, kind: "teacher", label: t.name, sub: APP.sub(t), size: 6, teacherId: t.id }].concat(g.nodes), edges: g.edges }); else gg.setGraph(null); gg.setFocus(focusId() || null); }
          gg.resume();
        }
        renderFlat();
      }
      if (lastMode !== S.mode) { lastMode = S.mode; hideHud(); }
    }
    function scheduleRefresh() { clearTimeout(refreshT); refreshT = setTimeout(() => { try { refresh(); } catch (e) { console.error(e); } }, 40); }
    function ensure2d() {
      if (g2d) return g2d;
      const cv = $("brainFlat"); if (!cv) return null;
      g2d = makeGraph2D(cv, { colorOf: (tid) => { const t = APP.teacher(tid); return t ? t.color : "#5fc8ff"; }, onPick: (id) => { if (id) hud(id); else hideHud(); }, onHover: (id) => { hoverNode = id; }, onOpen: (id) => open(id) });
      return g2d;
    }
    function bindStage(st) {
      if (stageBound === st) return; stageBound = st;
      st.onNode({ onSelect: (n) => { if (n) hud(n.id); }, onHover: (n) => { hoverNode = n ? n.id : null; }, onOpen: (n) => { if (n) open(n.id); } });
    }

    // ---- 진입 · 이탈 ----
    function enter(query) {
      bind(); active = true; lastSig = ""; hideHud();
      if (!isFlat()) { const st = APP.enterStage(); if (st) { bindStage(st); const want = S.selectedId === APP.ALL ? null : (S.selectedId || null); if ((st.debug().selected || null) !== want) st.focus(want); APP.replayFx(); } }
      if (isFlat()) { S.fxQueue.splice(0); const gg = ensure2d(); if (gg) { gg.resume(); gg.resize(); } }
      refresh();
      setTimeout(() => { const st = APP.stage(); if (st) { try { st.resize(); } catch (e) {} } if (g2d) g2d.resize(); }, 60);
      if (!loopRaf) loopRaf = requestAnimationFrame(chipsLoop);
    }
    function leave() {
      active = false; APP.leaveStage(); if (g2d) g2d.pause();
      if (loopRaf) { cancelAnimationFrame(loopRaf); loopRaf = 0; }
      hideHud(); hoverNode = null; clearDropTarget(); const box = $("chips"); if (box) box.innerHTML = "";
    }

    // ---- 상단 바 · 빈 상태 · 포커스 칩 ----
    function renderBar() {
      const f = filters();
      document.querySelectorAll("#brainBar [data-node]").forEach(b => { const on = f[b.dataset.node] !== false; b.classList.toggle("off", !on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
      const b2 = $("brain2d"); if (b2) { b2.textContent = isFlat() ? "3D" : "2D"; b2.title = isFlat() ? "3D 로 보기 (이번 세션만)" : "2D 로 보기 (이번 세션만)"; b2.hidden = !S.canGL || typeof THREE === "undefined"; }
      const fb = $("brainFull"); if (fb) { const on = document.body.classList.contains("brainFull"); fb.setAttribute("aria-pressed", on ? "true" : "false"); fb.title = on ? "전체화면 해제 (Esc)" : "전체화면 (Esc 로 해제)"; }
      const fc = $("brainFocus"); if (fc) { const id = focusId(); if (id) { const n = LINKS.node(id); const t = APP.teacher(id); fc.innerHTML = '<span class="mono-kind" data-kind="' + esc(n ? n.kind : (t ? "teacher" : "")) + '"></span>' + esc((n ? n.label : t ? t.name : id).slice(0, 28)) + ' <b class="x" title="포커스 해제">×</b>'; fc.classList.add("on"); } else { fc.innerHTML = ""; fc.classList.remove("on"); } }
    }
    function renderEmpty(t, g) {
      const el = $("brainEmpty"); if (!el) return;
      let msg = "";
      if (!S.teachers.size) msg = "선생님을 만들면 여기서 가지가 뻗어요";
      else if (S.selectedId === APP.ALL) msg = "선생님을 고르면 그 두뇌의 가지가 보여요";
      else if (!t) msg = "선생님을 골라 주세요";
      else if (!g || g.nodes.length <= 1) msg = "파일을 넣으면 여기서 가지가 뻗어요";
      // 2D 는 아래 카드 줄에 "＋ 새 선생님" 안내가 이미 있다 — 같은 말을 카드 위에 겹쳐 얹지 않는다
      if (isFlat() && !S.teachers.size) msg = "";
      el.textContent = msg; el.hidden = !msg;
    }

    // ---- HUD ----
    function nodeInfo(id) {
      const t = APP.teacher(id);
      if (t) { const c = S.counts.get(id) || {}, p = S.profiles.get(id); return { id, kind: "teacher", title: t.name, sub: APP.sub(t) + " · 시험 " + (c.exams || 0) + " · 문항 " + (c.questions || 0) + " · 지문 " + (c.passages || 0) + (p ? " · V" + p.version : ""), teacherId: id }; }
      const n = LINKS.node(id), d = INDEX.get ? INDEX.get(id) : null;
      if (!n && !d) return null;
      const kind = n ? n.kind : d.kind, bits = [KIND_KO[kind] || kind];
      if (n && n.sub) bits.push(n.sub); else if (d && d.sub) bits.push(d.sub);
      if (n && n.hit) bits.push("프린트 ★");
      const back = LINKS.backlinks(id).length; if (back) bits.push("백링크 " + back);
      const g = graphFor(sel(), true); const gn = g && g.nodes.find(x => x.id === id); if (gn && gn.pUse > 0) bits.push("다음 시험 " + Math.round(gn.pUse * 100) + "%");
      return { id, kind, title: n ? n.label : d.title, sub: bits.join(" · "), teacherId: n ? n.teacherId : d.teacherId };
    }
    function hud(id) {
      const info = nodeInfo(id); const el = $("brainHud"); if (!el) return;
      if (!info) { hideHud(); return; }
      hudId = id; $("brainHudTitle").textContent = info.title || ""; $("brainHudSub").textContent = info.sub || ""; el.dataset.id = id; el.dataset.kind = info.kind; el.hidden = false;
    }
    function hideHud() { hudId = null; const el = $("brainHud"); if (el) { el.hidden = true; el.dataset.id = ""; } }
    function open(id) { if (!id) return; ROUTE.go(ROUTE.note(id)); }
    function ask(id) { if (!id) return; ROUTE.go(route({ view: "ask", query: { ctx: id } })); }

    // ---- 2D: 선생님 카드 열 (옛 renderFlat 그대로 · #flatNew) ----
    function renderFlat() {
      const g = $("flatGrid"); if (!g) return;
      if (!isFlat()) return;
      g.innerHTML = [...S.teachers.values()].map(t => { const c = S.counts.get(t.id) || {}, p = S.profiles.get(t.id), busy = S.busy.has(t.id) || S.queue.some(j => j.teacherId === t.id && RUNNING(j));
        return '<div class="tcard' + (S.selectedId === t.id ? " on" : "") + (busy ? " busy" : "") + '" data-id="' + esc(t.id) + '" style="--c:' + esc(t.color) + '" role="button" tabindex="0"><div class="ring"></div><h3>' + esc(t.name) + '</h3><p>' + esc(APP.sub(t)) + '</p><div class="nums"><span><b>' + (c.exams || 0) + '</b>기출</span><span><b>' + (c.questions || 0) + '</b>문항</span><span><b>' + (c.passages || 0) + '</b>지문</span><span><b>' + (p ? "V" + p.version : "—") + '</b>학습</span></div><div class="bar" style="margin-top:8px"><i style="width:' + Math.min(100, (c.questions || 0) / 1.5) + '%"></i></div>' + (busy ? '<div class="small" style="text-align:center">' + esc(S.busy.get(t.id) || (S.queue.find(j => j.teacherId === t.id && RUNNING(j)) || {}).detail || "") + '</div>' : "") + '</div>'; }).join("") + '<div class="tcard new" id="flatNew" role="button" tabindex="0">＋ 새 선생님</div>';
      g.querySelectorAll(".tcard[data-id]").forEach(el => {
        el.onclick = () => { APP.select(el.dataset.id); hud(el.dataset.id); };
        el.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); } };
        ["dragover", "dragenter"].forEach(ev => el.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); el.classList.add("over"); }));
        ["dragleave", "drop"].forEach(ev => el.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); el.classList.remove("over"); }));
        el.addEventListener("drop", e => { const files = [...e.dataTransfer.files]; if (files.length) UI.dropTo(files, el.dataset.id, { x: e.clientX, y: e.clientY }); });
      });
      const nb = $("flatNew"); if (nb) { nb.onclick = () => UI.openTeacherSheet(null); nb.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); nb.click(); } }; }
    }

    // ---- 노드 드롭 (#vBrain 안에서 가로챈다 → UI.dropTo) ----
    function dropTeacherAt(x, y) {
      const st = APP.stage();
      if (st && !isFlat()) { const id = st.pick(x, y); if (id) return id; const n = st.pickNode(x, y); return n && n.teacherId && S.teachers.has(n.teacherId) ? n.teacherId : null; }
      if (g2d && isFlat()) { const n = g2d.pick(x, y); return n && n.teacherId && S.teachers.has(n.teacherId) ? n.teacherId : null; }
      return null;
    }
    function setDropTarget(id) { if (id === dropTarget) return; const st = APP.stage(); if (st && dropTarget) st.fx.highlight(dropTarget, false); dropTarget = id; if (st && id) st.fx.highlight(id, true); }
    function clearDropTarget() { setDropTarget(null); }
    function bindDrop() {
      const v = $("vBrain"); if (!v) return;
      const hasFiles = (e) => e.dataTransfer && [...(e.dataTransfer.types || [])].includes("Files");
      let raf = 0, xy = null;
      v.addEventListener("dragover", e => { if (!hasFiles(e)) return; xy = [e.clientX, e.clientY]; if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (xy) setDropTarget(dropTeacherAt(xy[0], xy[1])); }); });
      v.addEventListener("dragleave", e => { if (!e.relatedTarget || !v.contains(e.relatedTarget)) clearDropTarget(); });
      v.addEventListener("drop", e => {
        if (!hasFiles(e)) return; if (e.target.closest && (e.target.closest(".tcard") || e.target.closest(".hud"))) { clearDropTarget(); return; }
        e.preventDefault(); e.stopPropagation();
        const files = [...e.dataTransfer.files]; const at = { x: e.clientX, y: e.clientY }; const id = dropTeacherAt(at.x, at.y);
        clearDropTarget(); if (!files.length) return;
        UI.dropTo(files, id || null, at);
      });
    }

    // ---- 호버 칩 (옛 chipsLoop — 좌표는 #vBrain 안 캔버스 기준) + 노드 칩 ----
    function chipsLoop() {
      loopRaf = active ? requestAnimationFrame(chipsLoop) : 0;
      if (!active) return;
      const box = $("chips"); if (!box) return;
      const st = APP.stage(), want = new Map();
      const anchorOf = (id) => { if (st && !isFlat()) return st.anchor(id); if (g2d && isFlat()) { const s = g2d.nodeScreen(id); return s ? { x: s.x, y: s.y - 30, visible: s.visible } : null; } return null; };
      const nodeAt = (id) => { if (st && !isFlat()) { const s = st.nodeScreen(id); return s ? { x: s.x, y: s.y - 12, visible: s.visible } : null; } if (g2d && isFlat()) { const s = g2d.nodeScreen(id); return s ? { x: s.x, y: s.y - 10, visible: s.visible } : null; } return null; };
      S.teachers.forEach((t, id) => { const busy = S.busy.get(id); const job = S.queue.find(j => j.teacherId === id && RUNNING(j)); const err = S.queue.find(j => j.teacherId === id && j.stage === "error");
        if (dropTarget === id) want.set(id, { cls: "drop", text: "여기에 놓으면 " + t.name + " 선생님이 학습해요", at: anchorOf(id) });
        else if (job) want.set(id, { cls: "busy", text: job.detail, prog: job.progress, at: anchorOf(id) });
        else if (busy) want.set(id, { cls: "busy", text: busy, at: anchorOf(id) });
        else if (err && Date.now() - (err.errAt || (err.errAt = Date.now())) < 15000) want.set(id, { cls: "err", text: "⚠ " + String(err.error || "").slice(0, 40), at: anchorOf(id) });
        else if (S.hoverId === id || (hoverNode === id && isFlat())) { const c = S.counts.get(id) || {}; const p = S.profiles.get(id); want.set(id, { cls: "", text: t.name + " · 기출 " + (c.exams || 0) + " · 문항 " + (c.questions || 0) + " · 지문 " + (c.passages || 0) + (p ? " · V" + p.version : ""), at: anchorOf(id) }); } });
      if (hoverNode && !S.teachers.has(hoverNode)) { const n = LINKS.node(hoverNode); if (n) want.set(hoverNode, { cls: "node", text: (KIND_KO[n.kind] || n.kind) + " · " + String(n.label || "").slice(0, 40) + (n.hit ? " ★" : ""), at: nodeAt(hoverNode) }); }
      [...box.children].forEach(el => { if (!want.has(el.dataset.id)) el.remove(); });
      want.forEach((w, id) => { const a = w.at; if (!a) return; let el = box.querySelector('[data-id="' + CSS.escape(id) + '"]'); if (!el) { el = h('<div class="hchip" data-id="' + esc(id) + '"></div>'); box.appendChild(el); }
        el.className = "hchip " + w.cls; el.style.opacity = a.visible ? "1" : "0"; el.style.transform = "translate(" + Math.round(a.x) + "px," + Math.round(a.y) + "px) translate(-50%,-100%)";
        const txt = esc(w.text) + (w.prog !== undefined ? '<div class="bar"><i style="width:' + Math.round((w.prog || 0) * 100) + '%"></i></div>' : ""); if (el.innerHTML !== txt) el.innerHTML = txt; });
      const fps = $("fpsTag"); if (fps && S.ui.showFps) fps.textContent = st && !isFlat() ? st.fps() + " FPS" : "2D";
    }

    // ---- 전체화면 ----
    function fullscreen(on) {
      on = on === undefined ? !document.body.classList.contains("brainFull") : !!on;
      document.body.classList.toggle("brainFull", on);
      const ws = $("wordsSchool"); if (ws) { const first = [...S.teachers.values()][0]; if (first) ws.textContent = (first.school === "흑석고" ? "흑석고등학교" : (first.school || "")) + " · " + [...new Set([...S.teachers.values()].map(x => x.subject).filter(Boolean))].join(" · "); }
      renderBar();
      setTimeout(() => { const st = APP.stage(); if (st) { try { st.resize(); } catch (e) {} } if (g2d) g2d.resize(); }, 220);
    }

    // ---- 바인딩 (한 번) ----
    function bind() {
      if (bound) return; bound = true;
      const bar = $("brainBar");
      if (bar) bar.addEventListener("click", (e) => {
        const b = e.target.closest("[data-node]"); if (b) { setFilter(b.dataset.node, b.classList.contains("off")); lastSig = ""; refresh(); return; }
        if (e.target.closest("#brainFocus")) { ROUTE.go("#/brain", { replace: true }); return; }
      });
      const b2 = $("brain2d"); if (b2) b2.onclick = () => { APP.setMode(isFlat() ? "stage" : "flat"); };
      const bf = $("brainFull"); if (bf) bf.onclick = () => fullscreen();
      const ho = $("brainHudOpen"); if (ho) ho.onclick = () => open(hudId);
      const ha = $("brainHudAsk"); if (ha) ha.onclick = () => ask(hudId);
      const hc = $("brainHudClose"); if (hc) hc.onclick = hideHud;
      bindDrop();
      APP.on((why, data) => {
        if (!active) { if (why === "stage" && data) bindStage(data); return; }
        switch (why) {
          case "graph": scheduleRefresh(); break;
          case "mode": { lastSig = ""; if (isFlat()) { const gg = ensure2d(); if (gg) { gg.resume(); gg.resize(); } S.fxQueue.splice(0); } else { if (g2d) g2d.pause(); const st = APP.enterStage(); if (st) { bindStage(st); APP.replayFx(); } } refresh(); break; }
          case "stage": if (data) bindStage(data); break;
          case "queue": case "busy": if (isFlat()) renderFlat(); break;
          case "stageTap": hideHud(); break;
          case "hover": break;
        }
      });
      window.addEventListener("resize", () => { if (active && g2d) g2d.resize(); });
    }
    return { enter, leave, refresh, hud, hideHud, renderFlat, bindDrop, chipsLoop, fullscreen, filters, enabledKinds, setFilter, graph2d: () => g2d, isActive: () => active };
  })();
