  // ==================================================================
  //  ROUTE — 해시 라우터 (spec §2.1 주소 규칙 · §5.10 계약)
  //  #/today  #/inbox  #/n/<id>  #/tag/<이름>  #/all/<kind>[?q=&type=&tag=&hit=1&year=&kind=&matched=0&sort=&dir=]
  //  #/brain[?focus=<id>]  #/timeline[?week=YYYY-MM-DD]  #/ask[?q=&ctx=<id>]  #/search?q=
  //  - 모든 .view 는 DOM 에 늘 있고 hidden 으로만 토글한다(그리는 것은 UI · VIEWS · NOTEUI · BRAINUI 의 몫 — ROUTE.on 으로 듣는다).
  //  - 선생님 범위는 주소에 없다(APP.state.selectedId, "*" = 모든 선생님).
  //  - 오버레이(시트 · 시험지 · 팔레트 · 메뉴 · 자동완성 · 미리보기)는 히스토리에 넣지 않는다. 라우트가 바뀌면 closeHook 이 먼저 돈다.
  //  - 알 수 없는 주소 → #/today 로 replace 하고 토스트 "그 노트는 없어요". (없는 id 는 문서를 여는 쪽이 같은 규칙으로 처리한다.)
  //  - IIFE 시점에는 window/document/localStorage 를 만지지 않는다 — init() 부터.
  // ==================================================================
  const ROUTE = (function () {
    const VIEWS = ["today", "inbox", "note", "tag", "library", "brain", "timeline", "ask", "search"];
    const LIB_KINDS = ["exams", "questions", "passages", "sources", "profiles", "predictions", "mocks", "notes"];
    // id 접두 → 노트 종류 (§4.1 과 같은 표 — parse 를 순수 함수로 두려고 여기서 푼다)
    const PREFIX = [["pf_", "profile"], ["pd_", "prediction"], ["t_", "teacher"], ["e_", "exam"], ["q_", "question"], ["p_", "passage"], ["s_", "source"], ["m_", "mock"], ["n_", "note"]];
    const UI2 = "orun_oracle_ui2";
    let listeners = [], closeHook = null, cur = null, prev = null, bound = false, handling = false;

    const dec = (s) => { try { return decodeURIComponent(String(s == null ? "" : s)); } catch (e) { return String(s == null ? "" : s); } };
    const encSeg = (s) => String(s == null ? "" : s).replace(/[%#?/&]/g, (c) => encodeURIComponent(c));
    const encVal = (s) => String(s == null ? "" : s).replace(/[%#?&=+ ]/g, (c) => c === " " ? "%20" : encodeURIComponent(c));
    function ui2get() { try { return JSON.parse(localStorage.getItem(UI2) || "{}") || {}; } catch (e) { return {}; } }
    function ui2set(patch) { try { localStorage.setItem(UI2, JSON.stringify(Object.assign(ui2get(), patch || {}))); } catch (e) {} }
    function kindOf(id) { const s = String(id || ""); for (const [p, k] of PREFIX) if (s.indexOf(p) === 0) return k; return ""; }

    // "#/a/b?x=1" · "/a/b" · "a/b" 어느 모양이든 "#/a/b?x=1" 로
    function norm(path) {
      let h = String(path == null ? "" : path).trim();
      if (h.charAt(0) === "#") h = h.slice(1);
      if (h.charAt(0) === "/") h = h.slice(1);
      return "#/" + (h || "today");
    }
    function qs(query) {
      const ks = Object.keys(query || {}).filter(k => query[k] !== undefined && query[k] !== null && query[k] !== "");
      return ks.length ? "?" + ks.map(k => encVal(k) + "=" + encVal(query[k])).join("&") : "";
    }

    // 해시 → { view, id, kind, name, query, path }
    function parse(hash) {
      let h = String(hash == null ? "" : hash);
      if (h.charAt(0) === "#") h = h.slice(1);
      if (h.charAt(0) === "/") h = h.slice(1);
      const qi = h.indexOf("?");
      const path = qi >= 0 ? h.slice(0, qi) : h, q = qi >= 0 ? h.slice(qi + 1) : "";
      const query = {};
      if (q) q.split("&").forEach(kv => { if (!kv) return; const i = kv.indexOf("="); const k = dec(i >= 0 ? kv.slice(0, i) : kv); if (k) query[k] = i >= 0 ? dec(kv.slice(i + 1)) : ""; });
      const segs = path.split("/").map(dec).filter(Boolean);
      const head = segs[0] || "today";
      const r = { view: "today", id: "", kind: "", name: "", query, path: "/" + segs.join("/") };
      switch (head) {
        case "today": case "inbox": case "brain": case "timeline": case "ask": case "search": r.view = head; break;
        case "n": r.view = "note"; r.id = segs[1] || ""; r.kind = kindOf(r.id); if (!r.id || !r.kind) r.view = "unknown"; break;
        case "tag": r.view = "tag"; r.name = segs.slice(1).join("/").replace(/^#/, "").trim(); if (!r.name) r.view = "unknown"; break;
        case "all": r.view = "library"; r.kind = segs[1] || "exams"; if (!LIB_KINDS.includes(r.kind)) r.view = "unknown"; break;
        default: r.view = "unknown";
      }
      return r;
    }
    // { view, id, kind, name, query } → "#/…"   (문자열이면 모양만 맞춘다)
    function href(r) {
      if (typeof r === "string") return norm(r);
      if (!r || !r.view) return "#/today";
      let p;
      switch (r.view) {
        case "note": p = "/n/" + encSeg(r.id); break;
        case "tag": p = "/tag/" + encSeg(String(r.name || "").replace(/^#/, "")); break;
        case "library": p = "/all/" + encSeg(r.kind || "exams"); break;
        case "unknown": p = "/today"; break;
        default: p = "/" + (VIEWS.includes(r.view) ? r.view : "today");
      }
      return "#" + p + qs(r.query);
    }
    const note = (id) => "#/n/" + encSeg(id);
    const all = (kind, query) => "#/all/" + encSeg(LIB_KINDS.includes(kind) ? kind : "exams") + qs(query);
    const tag = (name) => "#/tag/" + encSeg(String(name || "").replace(/^#/, "").trim());
    const keyOf = (r) => r ? href(r) : "";

    function toast(msg) { try { APP.emit("toast", { msg }); } catch (e) {} }
    // 현재 해시를 읽어 리스너에 알린다. force 면 같은 주소여도 다시 알린다(같은 항목을 다시 눌렀을 때 다시 그리기).
    function handle(force) {
      if (handling) return;      // 리스너 안에서 go() 를 부르면 해시가 바뀌어 hashchange 로 다시 온다
      const r = parse(location.hash);
      if (r.view === "unknown") { toast("그 노트는 없어요"); go("#/today", { replace: true }); return; }
      if (!force && cur && keyOf(cur) === keyOf(r)) return;
      handling = true;
      try {
        if (closeHook) { try { closeHook(r, cur); } catch (e) { console.error(e); } }
        prev = cur; cur = r;
        ui2set({ lastRoute: href(r) });
        const p = prev;
        listeners.forEach(fn => { try { fn(r, p); } catch (e) { console.error(e); } });
      } finally { handling = false; }
    }
    // 이동. path 는 "#/…" 문자열이나 라우트 객체. { replace: true } 면 히스토리를 남기지 않는다.
    function go(path, o) {
      const h = typeof path === "string" ? norm(path) : href(path);
      const same = norm(location.hash || "") === h;
      if (o && o.replace) {
        try { history.replaceState(history.state, "", h); } catch (e) { location.replace(h); }
        handle(true);
      } else if (same) handle(true);
      else location.hash = h.slice(1);    // hashchange 가 handle() 을 부른다
    }
    function back() { if (prev && history.length > 1) history.back(); else go("#/today"); }
    function current() { return cur; }
    function on(fn) { listeners.push(fn); return () => { listeners = listeners.filter(f => f !== fn); }; }
    function setCloseHook(fn) { closeHook = typeof fn === "function" ? fn : null; }
    // hashchange 바인딩 → 첫 라우트(빈 해시면 ui2.home: "today" | "brain") → 리스너 호출
    function init() {
      if (!bound) { bound = true; window.addEventListener("hashchange", () => handle()); }
      const raw = location.hash || "";
      if (!raw || raw === "#" || raw === "#/") go(ui2get().home === "brain" ? "#/brain" : "#/today", { replace: true });
      else handle(true);
      return cur;
    }
    function refresh() { handle(true); }
    function is(view) { return !!cur && cur.view === view; }
    return { init, parse, go, back, current, on, href, note, all, tag, refresh, is, setCloseHook, kindOf, VIEWS, LIB_KINDS };
  })();
