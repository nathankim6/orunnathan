window.__errors = [];
window.addEventListener("error", e => window.__errors.push(String(e.message)));
const q = new URLSearchParams(location.search);
const stage = makeStage(document.getElementById("fx"), { onSelect: id => { window.__sel = id; }, onHover: () => {} });
window.__stage = stage;
if (stage) {
  stage.addTeacher({ id: "t1", name: "윤은영", sub: "영어A", school: "흑석고등학교", color: "#5fc8ff", level: 30 });
  stage.addTeacher({ id: "t2", name: "전정이", sub: "영어B", school: "흑석고등학교", color: "#7c9cff", level: 40 });
  stage.focus("t1");
  if (q.get("fx") !== "0") {
    setTimeout(() => { stage.fx.ingest("t1", 300, 200); stage.fx.thinking("t1", true); }, 400);
    setTimeout(() => { stage.fx.thinking("t1", false); stage.fx.learned("t1", { level: 60, profile: { nodes: [{label:"빈칸",share:.3},{label:"어법",share:.2},{label:"순서",share:.15},{label:"서술형",share:.35}], edges: [[0,1,1],[1,3,1]] } }); stage.fx.predict("t1", [{label:"빈칸",value:.8},{label:"어법",value:.5},{label:"순서",value:.3}]); }, 1200);
  }
  if (q.get("focus") === "1") setTimeout(() => { stage.focus("t2"); }, 1800);
  // 그래프 연기 — 노드 500 · 간선 600 을 얹고 pick/focus/filter/link/clear 를 차례로 부른다 (spec §5.7). 결과는 window.__graph
  if (q.get("graph") === "1") {
    const nodes = [], edges = [], N = { exam: 3, passage: 40, handout: 5, question: 430, note: 12, prediction: 5, mock: 5 };
    const PRE = { exam: "e", passage: "p", handout: "h", question: "q", note: "n", prediction: "pd", mock: "m" };
    Object.keys(N).forEach(kind => { for (let i = 0; i < N[kind]; i++) nodes.push({ id: PRE[kind] + "_" + i, kind, label: kind + " " + i, sub: "sub", size: 1 + (i % 4), teacherId: "t1", hit: kind === "passage" ? i % 4 === 0 : kind === "question" ? i % 9 === 0 : false, pUse: kind === "passage" ? (i % 5) / 5 : 0 }); });
    for (let i = 0; i < 430; i++) edges.push(["q_" + i, "e_" + (i % 3), "belongs"]);                 // 430
    for (let i = 0; i < 120; i++) edges.push(["q_" + i, "p_" + (i % 40), "match"]);                   // 550
    for (let i = 0; i < 20; i++) edges.push(["q_" + (i * 7), "h_" + (i % 5), "hit"]);                 // 570
    for (let i = 0; i < 10; i++) edges.push(["p_" + i, "h_" + (i % 5), "from"]);                     // 580
    for (let i = 0; i < 12; i++) edges.push(["n_" + i, i % 2 ? "p_" + i : "q_" + (i * 3), "anchor"]); // 592
    for (let i = 0; i < 5; i++) edges.push(["pd_" + i, "p_" + (i + 20), "predicts"]);                // 597
    for (let i = 0; i < 3; i++) edges.push(["m_" + i, "pd_" + i, "made"]);                           // 600
    const out = { steps: [] };
    const step = (name, fn) => { try { const r = fn(); out.steps.push([name, r === undefined ? "ok" : r]); } catch (e) { out.steps.push([name, "ERR " + e.message]); window.__errors.push("graph " + name + ": " + e.message); } };
    setTimeout(() => {
      step("setGraph", () => { stage.setGraph({ nodes, edges }); const g = stage.graph(); out.nodes = g.nodes.length; out.edges = g.edges.length; out.rendered = g.rendered; return out.nodes + "/" + out.edges; });
    }, 300);
    setTimeout(() => {
      step("nodeScreen", () => { const s = stage.nodeScreen("p_1"); out.screen = s; if (!s || !isFinite(s.x) || !isFinite(s.y)) throw new Error("nodeScreen 이 좌표를 주지 않는다"); return [Math.round(s.x), Math.round(s.y), s.visible]; });
      step("pickNode", () => { const s = stage.nodeScreen("p_1"); const r = document.getElementById("fx").getBoundingClientRect(); const n = stage.pickNode(r.left + s.x, r.top + s.y); out.picked = n; if (!n) throw new Error("pickNode 가 null"); return n.id + ":" + n.kind; });
      step("pickTeacher", () => { const a = stage.anchor("t1"); const n = stage.pickNode(a.x, a.y + 120); return n ? n.id + ":" + n.kind : null; });
      step("pickEmpty", () => stage.pickNode(2, 2));
      step("hoverNode", () => stage.hoverNode("q_3"));
      step("setNodeFilter", () => { stage.setNodeFilter(["exam", "passage", "handout"]); return stage.debug().graph.filter.join(","); });
      step("focusNode", () => { stage.focusNode("p_1"); return stage.debug().graph.focus; });
      step("link", () => { stage.fx.link("e_0", "p_1"); stage.fx.link("t1", "h_2"); });
    }, 1300);
    setTimeout(() => {
      step("unfilter", () => { stage.setNodeFilter(null); stage.focusNode(null); stage.hoverNode(null); return stage.debug().graph; });
      step("running", () => { if (stage.running !== true) throw new Error("running 이 true 가 아니다"); stage.pause(); const p = stage.running; stage.resume(); return [p, stage.running].join(","); });
      step("regraph", () => { stage.setGraph({ nodes: nodes.slice(0, 60), edges: edges.filter(e => +e[0].split("_")[1] < 60 && (+e[1].split("_")[1] < 60)) }); return stage.graph().nodes.length; });
      step("clearGraph", () => { stage.clearGraph(); return stage.graph().nodes.length; });
      step("setGraphAgain", () => { stage.setGraph({ nodes, edges }); return stage.graph().nodes.length; });
      out.ok = out.nodes === 500 && out.edges === 600 && out.rendered && out.picked && out.picked.id === "p_1" && !out.steps.some(s => /^ERR/.test(String(s[1])));
      window.__graph = out;
    }, 2600);
  }
}
