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
}
