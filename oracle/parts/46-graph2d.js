  // ==================================================================
  //  GRAPH2D — 2D 폴백 그래프 (spec §5.8). WebGL 이 없거나 좁은 화면 · 2D 전환일 때 canvas#brainFlat 에 그린다.
  //  힘 배치(반발 · 스프링 · 감쇠 · 중심 끌림), 노드 ≤ 400(넘치면 연결이 적은 문항부터 뺀다), 120 스텝 뒤 고정, 보일 때만 rAF(가라앉으면 멈춘다).
  //  makeGraph2D(canvas, { onPick(id|null), onHover(id|null), onOpen(id), colorOf(teacherId) })
  //    → { setGraph, setFocus, setNodeFilter, resize, pause, resume, pick(x, y) → {id, kind}|null, nodeScreen(id) → {x, y, visible}|null, dispose, running }
  //  선생님 노드(kind "teacher")는 가운데에 고정된다 — BRAINUI 가 LINKS.graph 결과 앞에 하나 끼워 준다.
  //  아래 선언 줄(두 칸 들여쓴 함수 선언)은 unit.js 의 절단 마커다 — 모양을 바꾸지 않는다.
  //  (이 주석에 그 문자열을 그대로 적으면 마커가 먼저 걸리므로 적지 않는다.) 호출 시점에만 window/document 를 만진다.
  // ==================================================================
  function makeGraph2D(canvas, opts) {
    opts = opts || {};
    if (!canvas || !canvas.getContext) return null;
    const ctx = canvas.getContext("2d"); if (!ctx) return null;
    const GOLD = "#f5c518", HOLO = "#5fc8ff", INK = "#e6edf7", DIM = "#a9b8cc", FONT = "'Noto Sans KR', 'Noto Sans', system-ui, sans-serif";
    const MAX_NODES = 400, SETTLE = 120;
    const REST = { belongs: 120, match: 42, hit: 70, from: 64, owner: 190, anchor: 48, predicts: 90, made: 70, usesPassage: 80, basedOn: 110, uses: 90, targets: 110, wiki: 70, cite: 70, manual: 70 };
    const RAD = { teacher: 34, exam: 12, passage: 7, handout: 9.5, question: 2.6, note: 7, prediction: 9, mock: 8 };
    const st = { nodes: [], byId: new Map(), edges: [], adj: new Map(), filter: null, focus: null, focusSet: null, hover: null, steps: SETTLE, running: true, raf: 0, W: 0, H: 0, DPR: 1, cam: { x: 0, y: 0, k: 1 }, drag: null, dirty: true, teacherId: null, colors: new Map(), disposed: false, hoverT: 0 };
    const hash01 = (i, s) => { const x = Math.sin(i * 12.9898 + (s || 0) * 78.233) * 43758.5453; return x - Math.floor(x); };
    const colorOf = (tid) => { if (!st.colors.has(tid)) st.colors.set(tid, (opts.colorOf && opts.colorOf(tid)) || HOLO); return st.colors.get(tid); };
    const radius = (n) => n.kind === "teacher" ? RAD.teacher : (RAD[n.kind] || 6) * (n.kind === "question" ? (n.hit ? 1.4 : 1) : 0.85 + 0.06 * Math.min(6, +n.size || 1));
    const visible = (n) => (!st.filter || n.kind === "teacher" || st.filter.has(n.kind)) && (!st.focusSet || st.focusSet.has(n.id));
    const isShown = () => !st.disposed && !document.hidden && canvas.isConnected && canvas.offsetParent !== null && canvas.clientWidth > 0;
    const color = (n) => n.hit ? GOLD : colorOf(n.teacherId || st.teacherId);

    // ---- 그래프 넣기 · 첫 배치(궤도, 결정적) ----
    function setGraph(g) {
      g = g || {}; const raw = Array.isArray(g.nodes) ? g.nodes : [], rawE = Array.isArray(g.edges) ? g.edges : [];
      const prev = st.byId; st.nodes = []; st.byId = new Map(); st.edges = []; st.adj = new Map(); st.hover = null;
      let teacher = raw.find(n => n && n.kind === "teacher") || null;
      st.teacherId = teacher ? teacher.id : (raw.find(n => n && n.teacherId) || {}).teacherId || null;
      if (!teacher && st.teacherId) teacher = { id: st.teacherId, kind: "teacher", label: "", size: 6, teacherId: st.teacherId };
      const ids = new Set(); const push = (n) => { if (!n || !n.id || ids.has(n.id)) return; ids.add(n.id); const p = prev.get(n.id); st.nodes.push({ id: n.id, kind: n.kind, label: n.label || "", sub: n.sub || "", size: +n.size || 1, teacherId: n.teacherId || st.teacherId, hit: !!n.hit, pUse: +n.pUse || 0, x: p ? p.x : 0, y: p ? p.y : 0, vx: 0, vy: 0, placed: !!p, pinned: false, deg: 0 }); };
      if (teacher) push(teacher);
      raw.forEach(n => { if (n && n.kind !== "teacher") push(n); });
      // 노드 상한 — 문항 중 연결이 적은 것부터 뺀다 (포커스 이웃 · 프린트 적중은 남긴다)
      const degree = new Map(); rawE.forEach(e => { if (Array.isArray(e)) { degree.set(e[0], (degree.get(e[0]) || 0) + 1); degree.set(e[1], (degree.get(e[1]) || 0) + 1); } });
      if (st.nodes.length > MAX_NODES) {
        const keep = st.nodes.filter(n => n.kind !== "question"); let room = MAX_NODES - keep.length;
        const qs = st.nodes.filter(n => n.kind === "question").sort((a, b) => ((b.hit ? 100 : 0) + (degree.get(b.id) || 0)) - ((a.hit ? 100 : 0) + (degree.get(a.id) || 0)));
        st.nodes = keep.concat(qs.slice(0, Math.max(0, room)));
      }
      st.nodes.forEach(n => st.byId.set(n.id, n));
      rawE.forEach(e => { if (!Array.isArray(e) || e.length < 2 || e[0] === e[1] || !st.byId.has(e[0]) || !st.byId.has(e[1])) return; st.edges.push([e[0], e[1], e[2] || "link"]); });
      const add = (a, b, k) => { if (!st.adj.has(a)) st.adj.set(a, []); st.adj.get(a).push([b, k]); };
      st.edges.forEach(([a, b, k]) => { add(a, b, k); add(b, a, k); st.byId.get(a).deg++; st.byId.get(b).deg++; });
      initialLayout();
      if (st.focus && !st.byId.has(st.focus)) st.focus = null;
      st.focusSet = st.focus ? hops(st.focus, 2) : null;
      st.steps = 0; st.dirty = true; kick();
    }
    function initialLayout() {
      const of = (k) => st.nodes.filter(n => n.kind === k);
      const nb = (n, kinds) => { const out = []; (st.adj.get(n.id) || []).forEach(([b, k]) => { const m = st.byId.get(b); if (m && m.placed && (!kinds || kinds.includes(k))) out.push(m); }); return out; };
      const put = (n, x, y) => { if (n.placed) return; n.x = x; n.y = y; n.placed = true; };
      const t = st.nodes.find(n => n.kind === "teacher"); if (t) { t.x = 0; t.y = 0; t.placed = true; t.pinned = true; }
      const exams = of("exam"); exams.forEach((n, i) => { n.ang = -Math.PI / 2 + (i / Math.max(1, exams.length)) * Math.PI * 2; put(n, Math.cos(n.ang) * 150, Math.sin(n.ang) * 150); });
      const ring = of("handout"); of("passage").forEach(p => ring.push(p));
      ring.forEach((n, i) => { n.ang = -Math.PI / 2 + 0.3 + (i / Math.max(1, ring.length)) * Math.PI * 2; const r = n.kind === "passage" && n.hit ? 240 : 270; put(n, Math.cos(n.ang) * r, Math.sin(n.ang) * r); });
      let qi = 0;
      of("question").forEach(n => { const i = ++qi; const p = nb(n, ["match"])[0], e = nb(n, ["belongs"])[0]; const a = hash01(i, 1) * Math.PI * 2;
        if (p) put(n, p.x + Math.cos(a) * (14 + hash01(i, 2) * 24), p.y + Math.sin(a) * (14 + hash01(i, 2) * 24));
        else if (e) { const b = e.ang + (hash01(i, 3) - 0.5) * 0.6; put(n, Math.cos(b) * 200, Math.sin(b) * 200); }
        else put(n, Math.cos(a) * 200, Math.sin(a) * 200); });
      const rest = st.nodes.filter(n => !n.placed);
      for (let pass = 0; pass < 2; pass++) rest.forEach((n, i) => { if (n.placed) return; const c = nb(n)[0]; if (c) { const a = Math.atan2(c.y, c.x) + (hash01(i + 5, 2) - 0.5) * 1.2; put(n, c.x + Math.cos(a) * 34, c.y + Math.sin(a) * 34); } else if (pass === 1) put(n, Math.cos(i * 0.9) * 90, Math.sin(i * 0.9) * 90); });
      st.nodes.forEach((n, i) => { if (!n.placed) put(n, Math.cos(i) * 120, Math.sin(i) * 120); });
    }
    function hops(id, h) { const seen = new Set([id]); let fr = [id]; for (let i = 0; i < h; i++) { const nx = []; fr.forEach(a => (st.adj.get(a) || []).forEach(([b]) => { if (!seen.has(b)) { seen.add(b); nx.push(b); } })); fr = nx; } return seen; }

    // ---- 힘 배치 ----
    function step() {
      const ns = st.nodes.filter(visible), n = ns.length; if (!n) return;
      for (let i = 0; i < n; i++) { const a = ns[i]; for (let j = i + 1; j < n; j++) { const b = ns[j]; let dx = a.x - b.x, dy = a.y - b.y; let d2 = dx * dx + dy * dy; if (d2 < 1) { dx = hash01(i, j) - 0.5; dy = hash01(j, i) - 0.5; d2 = dx * dx + dy * dy + 0.01; }
        const min = radius(a) + radius(b) + 6; const f = Math.min(6, (1100 + (d2 < min * min ? 2600 : 0)) / (d2 + 30)); const d = Math.sqrt(d2); const fx = dx / d * f, fy = dy / d * f;
        if (!a.pinned) { a.vx += fx; a.vy += fy; } if (!b.pinned) { b.vx -= fx; b.vy -= fy; } } }
      st.edges.forEach(([ia, ib, k]) => { const a = st.byId.get(ia), b = st.byId.get(ib); if (!visible(a) || !visible(b)) return; const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1; const rest = REST[k] || 70; const f = (d - rest) * 0.018; const fx = dx / d * f, fy = dy / d * f;
        if (!a.pinned) { a.vx += fx; a.vy += fy; } if (!b.pinned) { b.vx -= fx; b.vy -= fy; } });
      ns.forEach(a => { if (a.pinned) { a.vx = a.vy = 0; return; } a.vx -= a.x * 0.0022; a.vy -= a.y * 0.0022; a.vx *= 0.82; a.vy *= 0.82; const sp = Math.hypot(a.vx, a.vy); if (sp > 14) { a.vx *= 14 / sp; a.vy *= 14 / sp; } a.x += a.vx; a.y += a.vy; });
    }

    // ---- 그리기 ----
    function resize() { const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1, dpr = Math.min(window.devicePixelRatio || 1, 2); if (w !== st.W || h !== st.H || dpr !== st.DPR) { st.W = w; st.H = h; st.DPR = dpr; canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); } st.dirty = true; kick(); }
    const toScreen = (n) => ({ x: st.W / 2 + st.cam.x + n.x * st.cam.k, y: st.H / 2 + st.cam.y + n.y * st.cam.k });
    function hex(k, r) { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); }
    function draw() {
      if (!st.W) resize();
      const { W, H, DPR, cam } = st; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.save(); ctx.translate(W / 2 + cam.x, H / 2 + cam.y); ctx.scale(cam.k, cam.k);
      const sparse = st.edges.length > 200, hot = new Set([st.hover, st.focus].filter(Boolean));
      ctx.lineWidth = 1 / cam.k;
      st.edges.forEach(([ia, ib, k]) => { const a = st.byId.get(ia), b = st.byId.get(ib); if (!visible(a) || !visible(b)) return; if (sparse && (a.kind === "question" || b.kind === "question") && !hot.has(ia) && !hot.has(ib)) return;
        const near = hot.size && (hot.has(ia) || hot.has(ib)); ctx.strokeStyle = k === "hit" ? GOLD : color(a.kind === "teacher" ? b : a); ctx.globalAlpha = near ? 0.75 : (hot.size ? 0.1 : (k === "owner" ? 0.14 : 0.28)); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
      ctx.globalAlpha = 1;
      const labelPassages = st.nodes.filter(n => n.kind === "passage" && visible(n)).length <= 60;
      st.nodes.forEach(n => { if (!visible(n)) return; const c = color(n), r = radius(n), dimmed = hot.size && !hot.has(n.id) && !(st.focus && st.focusSet && st.focusSet.has(n.id)) && st.hover && st.hover !== n.id && !(st.adj.get(st.hover) || []).some(([b]) => b === n.id);
        ctx.save(); ctx.translate(n.x, n.y); ctx.globalAlpha = dimmed ? 0.35 : 1; ctx.fillStyle = c; ctx.strokeStyle = c;
        switch (n.kind) {
          case "teacher": { ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.arc(0, 0, r + 14, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([6, 5]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, r + 7, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = INK; ctx.font = "600 13px " + FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(n.label || "").slice(0, 8), 0, 0); break; }
          case "exam": ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); break;
          case "passage": case "handout": { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); if (!n.hit && n.pUse > 0) { ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r + 2.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, n.pUse)); ctx.stroke(); } if (n.kind === "handout") { ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, r + 3, 0, Math.PI * 2); ctx.stroke(); } break; }
          case "question": ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); break;
          case "note": ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath(); ctx.fill(); break;
          case "prediction": case "mock": hex(n.kind, r); ctx.fill(); if (n.kind === "mock") { ctx.fillStyle = "#0b1020"; hex(n.kind, r * 0.45); ctx.fill(); } break;
          default: ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        }
        if (hot.has(n.id)) { ctx.globalAlpha = 1; ctx.strokeStyle = n.id === st.focus ? GOLD : INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, r + 6 + (n.id === st.hover ? 2 * Math.sin(st.hoverT * 4) : 0), 0, Math.PI * 2); ctx.stroke(); }
        const showLabel = n.kind !== "teacher" && (hot.has(n.id) || ["exam", "handout", "prediction", "mock"].includes(n.kind) || (n.kind === "passage" && labelPassages && cam.k >= 0.8));
        if (showLabel && n.label) { ctx.globalAlpha = dimmed ? 0.4 : 0.9; ctx.fillStyle = hot.has(n.id) ? INK : DIM; ctx.font = (hot.has(n.id) ? "500 12px " : "400 11px ") + FONT; ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(String(n.label).slice(0, 24), 0, r + 4); }
        ctx.restore(); });
      ctx.restore();
    }

    // ---- 루프 (보일 때만, 가라앉으면 멈춘다) ----
    function tick() {
      st.raf = 0; if (st.disposed || !st.running) return;
      if (!isShown()) { st.dirty = true; return; }
      let more = false;
      if (st.steps < SETTLE) { step(); st.steps++; more = true; }
      if (st.hover) { st.hoverT += 1 / 60; more = true; }
      if (more || st.dirty) { draw(); st.dirty = false; }
      if (more) st.raf = requestAnimationFrame(tick);
    }
    function kick() { if (!st.raf && st.running && !st.disposed) st.raf = requestAnimationFrame(tick); }

    // ---- 좌표 · pick ----
    function pick(x, y) {
      const r = canvas.getBoundingClientRect(); const cx = x - r.left, cy = y - r.top; let best = null, bd = Infinity;
      st.nodes.forEach(n => { if (!visible(n)) return; const s = toScreen(n); const d = Math.hypot(s.x - cx, s.y - cy) - (n.kind === "question" ? 8 : radius(n) * st.cam.k + 4); if (d < 0 && d < bd) { bd = d; best = n; } });
      return best ? { id: best.id, kind: best.kind, label: best.label, sub: best.sub, teacherId: best.teacherId, hit: best.hit } : null;
    }
    function nodeScreen(id) { const n = st.byId.get(id); if (!n) return null; const s = toScreen(n); return { x: s.x, y: s.y, visible: visible(n) && s.x >= 0 && s.y >= 0 && s.x <= st.W && s.y <= st.H }; }
    function setFocus(id) { st.focus = id && st.byId.has(id) ? id : null; st.focusSet = st.focus ? hops(st.focus, 2) : null; if (st.focus) { const n = st.byId.get(st.focus); st.cam.x = -n.x * st.cam.k; st.cam.y = -n.y * st.cam.k; } else { st.cam.x = st.cam.y = 0; } st.steps = Math.min(st.steps, SETTLE - 30); st.dirty = true; kick(); }
    function setNodeFilter(kinds) { st.filter = Array.isArray(kinds) && kinds.length ? new Set(kinds) : null; st.steps = Math.min(st.steps, SETTLE - 40); st.dirty = true; kick(); }
    function setHover(id) { if (id === st.hover) return; st.hover = id; st.hoverT = 0; st.dirty = true; canvas.style.cursor = id ? "pointer" : (st.drag ? "grabbing" : "grab"); if (opts.onHover) opts.onHover(id); kick(); }

    // ---- 입력: 드래그(노드 옮기기 · 빈 곳은 이동) · 휠 확대 · 클릭 · 더블클릭 ----
    const onDown = (e) => { if (e.button !== undefined && e.button !== 0) return; const n = pick(e.clientX, e.clientY); st.drag = { x: e.clientX, y: e.clientY, cx: st.cam.x, cy: st.cam.y, node: n && n.kind !== "teacher" ? st.byId.get(n.id) : null, moved: 0 }; if (st.drag.node) st.drag.node.pinned = true; try { canvas.setPointerCapture(e.pointerId); } catch (x) {} };
    const onMove = (e) => {
      if (st.drag) { const dx = e.clientX - st.drag.x, dy = e.clientY - st.drag.y; st.drag.moved += Math.abs(dx) + Math.abs(dy);
        if (st.drag.node) { const r = canvas.getBoundingClientRect(); st.drag.node.x = (e.clientX - r.left - st.W / 2 - st.cam.x) / st.cam.k; st.drag.node.y = (e.clientY - r.top - st.H / 2 - st.cam.y) / st.cam.k; st.steps = Math.min(st.steps, SETTLE - 20); }
        else { st.cam.x = st.drag.cx + dx; st.cam.y = st.drag.cy + dy; }
        st.dirty = true; kick(); return; }
      const n = pick(e.clientX, e.clientY); setHover(n ? n.id : null);
    };
    const onUp = (e) => { const d = st.drag; st.drag = null; if (!d) return; if (d.node) { d.node.pinned = false; d.node.vx = d.node.vy = 0; } canvas.style.cursor = st.hover ? "pointer" : "grab"; if (d.moved < 5 && opts.onPick) { const n = pick(e.clientX, e.clientY); opts.onPick(n ? n.id : null); } };
    const onDbl = (e) => { const n = pick(e.clientX, e.clientY); if (n && opts.onOpen) opts.onOpen(n.id); };
    const onWheel = (e) => { e.preventDefault(); const r = canvas.getBoundingClientRect(); const px = e.clientX - r.left - st.W / 2, py = e.clientY - r.top - st.H / 2; const k0 = st.cam.k, k1 = Math.max(0.4, Math.min(3, k0 * (e.deltaY > 0 ? 0.9 : 1.1))); st.cam.x = px - (px - st.cam.x) * (k1 / k0); st.cam.y = py - (py - st.cam.y) * (k1 / k0); st.cam.k = k1; st.dirty = true; kick(); };
    const onLeave = () => { if (!st.drag) setHover(null); };
    const onVis = () => { if (!document.hidden) { st.dirty = true; kick(); } };
    canvas.addEventListener("pointerdown", onDown); canvas.addEventListener("pointermove", onMove); canvas.addEventListener("pointerup", onUp); canvas.addEventListener("pointercancel", onUp); canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("dblclick", onDbl); canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", resize); document.addEventListener("visibilitychange", onVis);
    canvas.style.cursor = "grab";
    resize();
    return {
      setGraph, setFocus, setNodeFilter, resize, pick, nodeScreen, setHover,
      pause() { st.running = false; if (st.raf) { cancelAnimationFrame(st.raf); st.raf = 0; } },
      resume() { st.running = true; st.dirty = true; kick(); },
      get running() { return st.running; },
      graph() { return { nodes: st.nodes.map(n => ({ id: n.id, kind: n.kind, label: n.label, teacherId: n.teacherId, hit: n.hit })), edges: st.edges.map(e => e.slice()) }; },
      debug() { return { nodes: st.nodes.length, edges: st.edges.length, steps: st.steps, focus: st.focus, hover: st.hover, cam: Object.assign({}, st.cam) }; },
      dispose() { st.disposed = true; if (st.raf) cancelAnimationFrame(st.raf); st.raf = 0; canvas.removeEventListener("pointerdown", onDown); canvas.removeEventListener("pointermove", onMove); canvas.removeEventListener("pointerup", onUp); canvas.removeEventListener("pointercancel", onUp); canvas.removeEventListener("pointerleave", onLeave); canvas.removeEventListener("dblclick", onDbl); canvas.removeEventListener("wheel", onWheel); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVis); }
    };
  }
