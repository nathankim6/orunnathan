  // ==================================================================
  //  LINKS — 파생 그래프(저장하지 않음) + 사용자 링크(links 저장소). 백링크 = 파생 링크의 역방향 ∪ 사용자 링크(to === id).
  //  파생 관계(실제 필드): 문항→시험 examId(belongs) · 문항→지문 match.passageId(match) · 문항→프린트 handoutHit.sourceIds(hit)
  //   · 지문→자료 sourceId(from) · 프로파일→시험 basedOn.examIds(basedOn) · 예측→지문 blueprint.passages[].passageId(predicts, 상위 30)
  //   · 예측→프로파일 같은 선생님의 profileVersion 판(uses) · 모의고사→예측 predictionId(made) · 모의고사→지문 questions[].passageId(usesPassage)
  //   · 프린트→시험 target = exam.meta 의 연도 · 학기 · 시험명(targets) · anchor 노트→원 문서(anchor) · 모든 문서→선생님 teacherId(owner — 그래프에만)
  //  부팅 · import 때 rebuild(all) 로 전부 다시 만들고(선생님당 O(문항+지문)), 그 사이는 DB.onWrite 로 스스로 증분 갱신한다(silent 는 무시).
  //  IIFE 시점에 window/document/localStorage 를 만지지 않는다. 제목은 INDEX.titleOf 와 같은 규칙.
  // ==================================================================
  const LINKS = (function () {
    const GRAPH_KINDS = ["exam", "passage", "handout", "question", "note", "prediction", "mock"];
    const KIND_LABEL = { belongs: "소속", match: "매칭", hit: "프린트 적중", from: "출처", basedOn: "근거 시험", predicts: "유력 지문", uses: "프로파일", made: "예측", usesPassage: "지문", targets: "대상 시험", anchor: "메모", owner: "소유", wiki: "링크", cite: "인용", manual: "링크" };
    const nodes = new Map();        // id → { id, kind, store, teacherId, label, sub, norm, grams, hit, pv, handout }
    const edges = new Map();        // key → { key, from, to, kind, label, teacherId, user, id }
    const outE = new Map();         // id → Set<key>
    const inE = new Map();          // id → Set<key>
    const examMeta = new Map();     // examId → { year, semester, term, teacherId }
    const handoutTarget = new Map();// sourceId → { year, semester, term, guessed, teacherId }
    const profileVer = new Map();   // teacherId + ":" + version → profileId
    const latestPred = new Map();   // teacherId → { id, createdAt, pUse: Map<passageId, pUse> }
    const userLinks = new Map();    // link id → doc
    const S = (v, n) => { const s = String(v == null ? "" : v); return n ? s.slice(0, n) : s; };
    const pct = (x) => Math.round((+x || 0) * 100) + "%";
    const normT = (s) => String(s == null ? "" : s).toLowerCase().replace(/\s+/g, "");
    const grams = (s) => { const g = new Set(); if (s.length < 2) { if (s) g.add(s); return g; } for (let i = 0; i + 2 <= s.length; i++) g.add(s.slice(i, i + 2)); return g; };
    const dice = (a, b) => { if (!a.size || !b.size) return 0; let n = 0; a.forEach(x => { if (b.has(x)) n++; }); return 2 * n / (a.size + b.size); };
    const ekey = (from, to, kind) => from + "~" + to + "~" + kind;
    const same = (t) => !t.guessed;
    const kindOfStore = (store, doc) => store === "sources" ? (doc && doc.kind === "프린트" ? "handout" : "source") : INDEX.STORE_KIND[store] || "";

    // ---- 노드 · 간선 ----
    // 제목은 INDEX 와 같은 규칙이되, 시험 제목은 INDEX 의 색인이 아직 없어도(비동기 조각 실행 중) 여기 examMeta 로 푼다
    const ctx = { examTitle: (id) => { const m = examMeta.get(id); return m && m.meta ? TEXT.examLabel(m.meta).trim() : ""; }, sourceName: (id) => { const n = nodes.get(id); return n ? n.label : ""; } };
    function setNode(store, doc) {
      const kind = kindOfStore(store, doc); if (!kind) return null;
      if (store === "exams") examMeta.set(doc.id, { meta: doc.meta || {}, year: doc.meta && doc.meta.year, semester: doc.meta && doc.meta.semester, term: doc.meta && doc.meta.term, teacherId: doc.teacherId || null });
      const label = INDEX.titleOf(store, doc, ctx), norm = normT(label);
      const n = { id: doc.id, kind, store, teacherId: doc.teacherId || (store === "teachers" ? doc.id : null), label, sub: INDEX.subOf(store, doc, ctx), norm, grams: grams(norm),
        hit: !!(doc.handoutHit || doc.fromHandout), pv: store === "predictions" ? (doc.profileVersion || 0) : 0, handout: kind === "handout", noteKind: store === "notes" ? doc.kind : "", updatedAt: doc.updatedAt || doc.createdAt || 0,
        examId: store === "questions" ? (doc.examId || null) : null, number: store === "questions" ? (doc.number || "") : "" };
      nodes.set(doc.id, n); return n;
    }
    function addEdge(from, to, kind, label, teacherId, user, id) {
      if (!from || !to) return;
      const key = ekey(from, to, kind);
      edges.set(key, { key, from, to, kind, label: label || "", teacherId: teacherId || null, user: !!user, id: id || "" });
      if (!outE.has(from)) outE.set(from, new Set()); outE.get(from).add(key);
      if (!inE.has(to)) inE.set(to, new Set()); inE.get(to).add(key);
    }
    function dropEdge(key) {
      const e = edges.get(key); if (!e) return;
      edges.delete(key); const o = outE.get(e.from); if (o) { o.delete(key); if (!o.size) outE.delete(e.from); } const i = inE.get(e.to); if (i) { i.delete(key); if (!i.size) inE.delete(e.to); }
    }
    function dropDerivedFrom(id) { const o = outE.get(id); if (!o) return; [...o].forEach(k => { const e = edges.get(k); if (e && !e.user) dropEdge(k); }); }
    function dropAllTouching(id) { [...(outE.get(id) || [])].forEach(dropEdge); [...(inE.get(id) || [])].forEach(k => { const e = edges.get(k); if (e && !e.user) dropEdge(k); }); }
    const method = (m) => m === "user" ? "USER" : m === "local" ? "AUTO" : m === "llm" ? "MODEL" : "";
    // 문서 하나의 파생 간선을 다시 만든다 (bulk 면 targets · uses 는 나중에 한 번에)
    function derive(store, doc, bulk) {
      const id = doc.id, tid = doc.teacherId || null;
      dropDerivedFrom(id);
      const owner = () => { if (tid && store !== "teachers") addEdge(id, tid, "owner", "", tid); };
      switch (store) {
        case "questions":
          if (doc.examId) addEdge(id, doc.examId, "belongs", (doc.number || "") + "번", tid);
          if (doc.match && doc.match.passageId) addEdge(id, doc.match.passageId, "match", ("매칭 " + method(doc.match.method) + " " + pct(doc.match.confidence)).trim(), tid);
          if (doc.handoutHit && Array.isArray(doc.handoutHit.sourceIds)) doc.handoutHit.sourceIds.forEach(sid => addEdge(id, sid, "hit", "★ " + (doc.handoutHit.kinds || []).join("·"), tid));
          owner(); break;
        case "passages": if (doc.sourceId) addEdge(id, doc.sourceId, "from", doc.order ? doc.order + "번째" : "", tid); owner(); break;
        case "profiles":
          profileVer.set(tid + ":" + (doc.version || 0), id);
          (doc.basedOn && doc.basedOn.examIds || []).forEach(eid => addEdge(id, eid, "basedOn", "근거", tid));
          if (!bulk) nodes.forEach(n => { if (n.kind === "prediction" && n.teacherId === tid && n.pv === (doc.version || 0)) addEdge(n.id, id, "uses", "V" + doc.version, tid); });
          owner(); break;
        case "predictions": {
          const bp = doc.blueprint || {}; const pm = new Map();
          (bp.passages || []).slice(0, 30).forEach((s, i) => { if (!s.passageId) return; pm.set(s.passageId, s.pUse); addEdge(id, s.passageId, "predicts", "유력 " + (i + 1) + "위 (" + pct(s.pUse) + ")" + (s.onHandout ? " ★" : ""), tid); });
          const lp = latestPred.get(tid); if (!lp || (doc.createdAt || 0) >= lp.createdAt) latestPred.set(tid, { id, createdAt: doc.createdAt || 0, pUse: pm });
          const pf = profileVer.get(tid + ":" + (doc.profileVersion || 0)); if (pf) addEdge(id, pf, "uses", "V" + doc.profileVersion, tid);
          owner(); break;
        }
        case "mocks":
          if (doc.predictionId) addEdge(id, doc.predictionId, "made", "청사진", tid);
          [...new Set((doc.questions || []).map(q => q.passageId).filter(Boolean))].forEach(pid => addEdge(id, pid, "usesPassage", "출제 지문", tid));
          owner(); break;
        case "sources":
          if (doc.kind === "프린트") { handoutTarget.set(id, Object.assign({ teacherId: tid }, doc.target || { guessed: true })); if (!bulk) recomputeTargets(tid); } else handoutTarget.delete(id);
          owner(); break;
        case "exams":
          if (!bulk) { recomputeTargets(tid); nodes.forEach(n => { if (n.kind === "question" && n.teacherId === tid && n.examId === id) { n.label = ctx.examTitle(id) + " · " + (n.number || "?") + "번"; n.norm = normT(n.label); n.grams = grams(n.norm); } }); }
          owner(); break;
        case "notes":
          if (doc.kind === "anchor" && doc.anchor && doc.anchor.id) addEdge(id, doc.anchor.id, "anchor", "메모", tid);
          owner(); break;
        case "teachers": break;
      }
    }
    // 프린트 → 시험 (target 이 시험 메타와 같을 때). 선생님 단위로 다시 센다.
    function recomputeTargets(teacherId) {
      [...edges.values()].forEach(e => { if (e.kind === "targets" && (!teacherId || e.teacherId === teacherId)) dropEdge(e.key); });
      handoutTarget.forEach((t, sid) => {
        if (teacherId && t.teacherId !== teacherId) return; if (!same(t)) return;
        examMeta.forEach((m, eid) => { if (m.teacherId === t.teacherId && m.year === t.year && m.semester === t.semester && m.term === t.term) addEdge(sid, eid, "targets", "대비 프린트", t.teacherId); });
      });
    }
    function applyUser(doc) {
      if (!doc || !doc.id) return;
      const prev = userLinks.get(doc.id); if (prev) dropEdge(ekey(prev.from, prev.to, prev.kind));
      userLinks.set(doc.id, doc);
      addEdge(doc.from, doc.to, doc.kind || "manual", doc.kind === "cite" ? "인용 " + (doc.text || "") : (doc.text ? "[[" + doc.text + "]]" : KIND_LABEL[doc.kind] || "링크"), doc.teacherId || null, true, doc.id);
    }
    function dropUser(id) { const d = userLinks.get(id); if (!d) return; userLinks.delete(id); dropEdge(ekey(d.from, d.to, d.kind)); }

    // ---- 전량 · 선생님별 · 증분 ----
    const ORDER = ["teachers", "exams", "sources", "passages", "questions", "profiles", "predictions", "mocks", "notes"];
    function clear() { nodes.clear(); edges.clear(); outE.clear(); inE.clear(); examMeta.clear(); handoutTarget.clear(); profileVer.clear(); latestPred.clear(); userLinks.clear(); }
    function addAll(all) {
      all = all || {};
      ORDER.forEach(store => (all[store] || []).forEach(doc => { if (!doc || !doc.id) return; try { setNode(store, doc); derive(store, doc, true); } catch (e) { console.error(e); } }));
      (all.links || []).forEach(applyUser);
      // bulk 뒤처리: 프린트→시험, 예측→프로파일
      recomputeTargets(null);
      nodes.forEach(n => { if (n.kind === "prediction") { const pf = profileVer.get(n.teacherId + ":" + n.pv); if (pf) addEdge(n.id, pf, "uses", "V" + n.pv, n.teacherId); } });
    }
    // rebuild(all) — all: { teachers, exams, questions, passages, sources, profiles, predictions, mocks, notes, links }
    function rebuild(all) { clear(); addAll(all); return counts(null); }
    // rebuildTeacher(teacherId, all) — 그 선생님의 노드 · 간선을 지우고 all 로 다시 만든다 (all 은 그 선생님 문서들)
    function rebuildTeacher(teacherId, all) {
      [...nodes.values()].forEach(n => { if (n.teacherId === teacherId && n.kind !== "teacher") { dropAllTouching(n.id); nodes.delete(n.id); } });
      [...edges.values()].forEach(e => { if (e.teacherId === teacherId && !e.user) dropEdge(e.key); });
      [...examMeta.keys()].forEach(k => { if (examMeta.get(k).teacherId === teacherId) examMeta.delete(k); });
      [...handoutTarget.keys()].forEach(k => { if (handoutTarget.get(k).teacherId === teacherId) handoutTarget.delete(k); });
      [...profileVer.keys()].forEach(k => { if (k.indexOf(teacherId + ":") === 0) profileVer.delete(k); });
      latestPred.delete(teacherId);
      addAll(all);
      return counts(teacherId);
    }
    function upsert(store, doc) {
      if (!doc || !doc.id) return;
      if (store === "links") { applyUser(doc); return; }
      if (!INDEX.STORE_KIND[store]) return;
      setNode(store, doc); derive(store, doc, false);
    }
    function remove(id) {
      if (userLinks.has(id)) { dropUser(id); return true; }
      const n = nodes.get(id); if (!n) return false;
      dropAllTouching(id); nodes.delete(id); examMeta.delete(id); if (handoutTarget.delete(id)) recomputeTargets(n.teacherId);
      if (n.kind === "profile") [...profileVer.keys()].forEach(k => { if (profileVer.get(k) === id) profileVer.delete(k); });
      return true;
    }

    // ---- 읽기 ----
    const title = (id) => { const n = nodes.get(id); return n ? n.label : ""; };
    const kind = (id) => { const n = nodes.get(id); return n ? n.kind : ""; };
    // derived(id) → 이 노드에 닿는 파생 간선 (owner 제외)
    function derived(id) { const out = []; [...(outE.get(id) || []), ...(inE.get(id) || [])].forEach(k => { const e = edges.get(k); if (e && !e.user && e.kind !== "owner") out.push({ from: e.from, to: e.to, kind: e.kind, label: e.label }); }); return out; }
    // backlinks(id) → [{ from, kind, label, teacherId, title, fromKind, user, id }]  (파생 역방향 ∪ 사용자 링크 to === id)
    function backlinks(id) {
      const out = [];
      (inE.get(id) || []).forEach(k => { const e = edges.get(k); if (!e || e.kind === "owner") return; out.push({ from: e.from, kind: e.kind, label: e.label, teacherId: e.teacherId, title: title(e.from), fromKind: kind(e.from), user: e.user, id: e.id }); });
      return out.sort((a, b) => (b.user - a.user) || a.kind.localeCompare(b.kind));
    }
    // outlinks(id) → [{ to, kind, label, title, toKind, user, broken, id }]
    function outlinks(id) {
      const out = [];
      (outE.get(id) || []).forEach(k => { const e = edges.get(k); if (!e || e.kind === "owner") return; out.push({ to: e.to, kind: e.kind, label: e.label, title: title(e.to), toKind: kind(e.to), user: e.user, broken: !nodes.has(e.to), id: e.id }); });
      return out;
    }
    // neighbors(id, hops=1) → { nodes: [id], edges: [[a, b, kind]] } — owner 간선은 타지 않는다
    function neighbors(id, hops) {
      hops = hops === undefined ? 1 : hops;
      const seen = new Set([id]); let frontier = [id]; const es = new Map();
      for (let h = 0; h < hops; h++) {
        const next = [];
        frontier.forEach(a => { [...(outE.get(a) || []), ...(inE.get(a) || [])].forEach(k => { const e = edges.get(k); if (!e || e.kind === "owner") return; const b = e.from === a ? e.to : e.from; if (!nodes.has(b)) return; es.set(k, [e.from, e.to, e.kind]); if (!seen.has(b)) { seen.add(b); next.push(b); } }); });
        frontier = next;
      }
      return { nodes: [...seen], edges: [...es.values()] };
    }
    // graph(teacherId, { kinds, focus, hops }) → { nodes: [{ id, kind, label, size, teacherId, hit, pUse }], edges: [[from, to, kind]] }
    //   노드 종류: exam · passage · handout · question · note · prediction · mock (범위 자료 · 프로파일 · 선생님은 그리지 않는다 — 선생님은 무대의 리그)
    //   owner 간선은 다른 간선이 하나도 없는 노드에만 붙여 선생님에 매단다.
    function graph(teacherId, o) {
      o = o || {}; const kinds = o.kinds && o.kinds.length ? new Set(o.kinds) : null;
      const allowed = o.focus ? new Set(neighbors(o.focus, o.hops === undefined ? 2 : o.hops).nodes) : null;
      const lp = teacherId && teacherId !== "*" ? latestPred.get(teacherId) : null;
      const deg = (id, k) => { let n = 0; (inE.get(id) || []).forEach(key => { const e = edges.get(key); if (e && e.kind === k) n++; }); return n; };
      const ns = [], ids = new Set();
      nodes.forEach(n => {
        if (teacherId && teacherId !== "*" && n.teacherId !== teacherId) return;
        if (!GRAPH_KINDS.includes(n.kind)) return;
        if (kinds && !kinds.has(n.kind)) return;
        if (allowed && !allowed.has(n.id)) return;
        const size = n.kind === "exam" ? 1 + deg(n.id, "belongs") : n.kind === "passage" ? 1 + deg(n.id, "match") : n.kind === "handout" ? 1 + deg(n.id, "from") : n.kind === "prediction" ? 3 : n.kind === "mock" ? 2 : 1;
        const pUse = n.kind === "passage" && lp && lp.pUse.has(n.id) ? lp.pUse.get(n.id) : 0;
        ids.add(n.id); ns.push({ id: n.id, kind: n.kind, label: n.label, sub: n.sub, size, teacherId: n.teacherId, hit: n.hit || pUse >= 0.5, pUse, noteKind: n.noteKind });
      });
      const es = [], linked = new Set();
      edges.forEach(e => { if (e.kind === "owner") return; if (!ids.has(e.from) || !ids.has(e.to)) return; es.push([e.from, e.to, e.kind]); linked.add(e.from); linked.add(e.to); });
      if (teacherId && teacherId !== "*") ns.forEach(n => { if (!linked.has(n.id)) es.push([n.id, teacherId, "owner"]); });
      return { nodes: ns, edges: es };
    }
    // resolve(text, teacherId, cacheId) → { id, title, kind } | null
    //   ① 캐시 id → ② 제목 정확 일치(공백 · 대소문자 무시, 같은 선생님 우선) → ③ 2-gram Dice ≥ 0.8 후보가 하나(같은 선생님으로 좁혀 하나여도) → ④ null
    const pick = (n) => ({ id: n.id, title: n.label, kind: n.kind, teacherId: n.teacherId });
    function resolve(text, teacherId, cacheId) {
      if (cacheId && nodes.has(cacheId)) return pick(nodes.get(cacheId));
      const qn = normT(text); if (!qn) return null;
      const exact = []; nodes.forEach(n => { if (n.norm === qn) exact.push(n); });
      if (exact.length) return pick(exact.find(n => n.teacherId === teacherId) || exact[0]);
      const qg = grams(qn); const cands = [];
      nodes.forEach(n => { if (Math.abs(n.norm.length - qn.length) > qn.length && n.norm.length > 4) return; if (dice(qg, n.grams) >= 0.8) cands.push(n); });
      if (cands.length === 1) return pick(cands[0]);
      if (cands.length > 1 && teacherId) { const mine = cands.filter(n => n.teacherId === teacherId); if (mine.length === 1) return pick(mine[0]); }
      return null;
    }
    // ---- 사용자 링크 (links 저장소) ----
    const linkId = (from, to, kind) => "lk_" + from + "~" + to + "~" + kind;
    async function addUser(o) {
      const kind = o.kind || "manual", id = linkId(o.from, o.to, kind), now = Date.now(), prev = userLinks.get(id);
      const n = nodes.get(o.from);
      const doc = { id, teacherId: o.teacherId !== undefined ? (o.teacherId || null) : (prev ? prev.teacherId : (n ? n.teacherId : null)), from: o.from, to: o.to, kind, text: S(o.text, 200), author: o.author !== undefined ? S(o.author, 60) : (prev ? prev.author : ""), createdAt: prev ? prev.createdAt : now, updatedAt: now };
      applyUser(doc);
      await DB.put("links", doc);
      return doc;
    }
    async function removeUser(id) { dropUser(id); await DB.del("links", id); return true; }
    // setUserLinks(from, [{ to, text, teacherId, author }], kind="wiki") — 그 노트의 그 종류 링크 전체 교체
    async function setUserLinks(from, list, kind) {
      kind = kind || "wiki";
      const want = new Map(); (list || []).forEach(l => { if (l && l.to) want.set(linkId(from, l.to, kind), l); });
      const cur = [...userLinks.values()].filter(d => d.from === from && d.kind === kind);
      for (const d of cur) if (!want.has(d.id)) await removeUser(d.id);
      for (const [id, l] of want) { const d = userLinks.get(id); if (!d || d.text !== S(l.text, 200)) await addUser({ from, to: l.to, kind, text: l.text, teacherId: l.teacherId, author: l.author }); }
      return want.size;
    }
    // userLinks({ from } | { to } | { teacherId }) → doc[]
    function userLinksOf(o) { o = o || {}; const out = []; userLinks.forEach(d => { if (o.from && d.from !== o.from) return; if (o.to && d.to !== o.to) return; if (o.teacherId && d.teacherId !== o.teacherId) return; if (o.kind && d.kind !== o.kind) return; out.push(d); }); return out; }
    function loadUserLinks(docs) { (docs || []).forEach(applyUser); }
    function counts(teacherId) {
      let n = 0, e = 0;
      nodes.forEach(x => { if (!teacherId || teacherId === "*" || x.teacherId === teacherId) n++; });
      edges.forEach(x => { if (x.kind === "owner") return; if (!teacherId || teacherId === "*" || x.teacherId === teacherId) e++; });
      return { nodes: n, edges: e };
    }
    // ---- DB 쓰기 훅 (있을 때만) ----
    function onDbWrite(ev) {
      if (!ev) return;
      const store = ev.store;
      if (store !== "links" && !INDEX.STORE_KIND[store]) return;
      if (ev.op === "put") { if (ev.silent) return; (ev.docs || []).forEach(d => upsert(store, d)); }
      else if (ev.op === "del") (ev.keys || []).forEach(remove);
      else if (ev.op === "clear") { if (store === "links") { [...userLinks.keys()].forEach(dropUser); } else [...nodes.values()].forEach(n => { if (n.store === store) remove(n.id); }); }
    }
    if (typeof DB !== "undefined" && DB && typeof DB.onWrite === "function") DB.onWrite(onDbWrite);
    return { rebuild, rebuildTeacher, clear, upsert, remove, derived, backlinks, outlinks, neighbors, graph, resolve, addUser, removeUser, setUserLinks, userLinks: userLinksOf, loadUserLinks, counts, title, kind, node: (id) => nodes.get(id) || null, nodes: () => nodes, KIND_LABEL, GRAPH_KINDS };
  })();
