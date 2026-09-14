  // ==================================================================
  //  SYNC — Supabase(oracle_docs) 거울. 브라우저 저장소(IndexedDB)가 작업본이고 클라우드는 같은 문서를 그대로 담는다.
  //  같은 저장소의 다른 앱(옳은문법)처럼 anon 키 + REST 로 직접 간다. 서버 없음. 영상(media)은 올리지 않는다.
  // ==================================================================
  const SYNC = (function () {
    const URL_ = "https://wxjazdqabryflvfztujk.supabase.co/rest/v1/oracle_docs";
    const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4amF6ZHFhYnJ5Zmx2Znp0dWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NDkyOTAsImV4cCI6MjA1MTEyNTI5MH0._mBHMqttsrwB2f8U-8AsjmJXKaWoJsXPyrW76ugc80A";
    const STORES = ["teachers", "exams", "questions", "passages", "sources", "profiles", "predictions", "mocks", "events", "settings"];
    const st = { enabled: true, workspace: "heukseok", status: "idle", lastSync: 0, error: "", pending: 0, docs: 0 };
    let queue = [], timer = 0, listeners = [];
    const on = (fn) => listeners.push(fn);
    const emit = () => listeners.forEach(fn => { try { fn(st); } catch (e) {} });
    const ls = { get(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
    function load() { st.workspace = (ls.get("orun_oracle_ws") || "heukseok").trim() || "heukseok"; st.enabled = ls.get("orun_oracle_sync") !== "off"; st.lastSync = +ls.get("orun_oracle_synced") || 0; }
    function setWorkspace(w) { st.workspace = String(w || "heukseok").trim().replace(/[^a-z0-9_-]/gi, "").toLowerCase() || "heukseok"; ls.set("orun_oracle_ws", st.workspace); emit(); }
    function setEnabled(v) { st.enabled = !!v; ls.set("orun_oracle_sync", v ? "on" : "off"); emit(); if (v) flush(); }
    const H = () => ({ apikey: KEY, Authorization: "Bearer " + KEY, "content-type": "application/json" });
    const keyOf = (store) => store === "settings" ? "key" : "id";
    async function req(method, qs, body, extra) {
      const res = await fetch(URL_ + (qs ? "?" + qs : ""), { method, headers: Object.assign(H(), extra || {}), body: body === undefined ? undefined : JSON.stringify(body) });
      if (!res.ok) { const t = await res.text(); throw new Error("Supabase " + res.status + ": " + t.slice(0, 200)); }
      const txt = await res.text(); return txt.trim() ? JSON.parse(txt) : null;   // return=minimal 이면 201 에 빈 본문이 온다
    }
    // ---- 쓰기 큐 (묶어서 보낸다) ----
    function push(store, docs) {
      if (!st.enabled || !STORES.includes(store)) return;
      for (const d of docs) queue.push({ op: "put", store, id: String(d[keyOf(store)]), doc: d });
      schedule();
    }
    function remove(store, ids) {
      if (!st.enabled || !STORES.includes(store) || !ids.length) return;
      for (const id of ids) queue.push({ op: "del", store, id: String(id) });
      schedule();
    }
    function schedule() { st.pending = queue.length; emit(); clearTimeout(timer); timer = setTimeout(flush, 600); }
    let flushing = false;
    async function flush() {
      if (flushing || !queue.length || !st.enabled) return;
      flushing = true; st.status = "syncing"; emit();
      try {
        while (queue.length) {
          // 같은 id 는 마지막 것만
          const batch = []; const seen = new Set();
          for (let i = queue.length - 1; i >= 0 && batch.length < 40; i--) { const q = queue[i]; if (seen.has(q.store + ":" + q.id)) continue; seen.add(q.store + ":" + q.id); batch.unshift(q); }
          const puts = batch.filter(q => q.op === "put"), dels = batch.filter(q => q.op === "del");
          if (puts.length) await req("POST", "on_conflict=id", puts.map(q => ({ id: rowId(q.store, q.id), workspace: st.workspace, store: q.store, teacher_id: q.doc.teacherId || (q.store === "teachers" ? q.id : null), data: q.doc, updated_at: new Date().toISOString() })), { Prefer: "resolution=merge-duplicates,return=minimal" });
          if (dels.length) await req("DELETE", "workspace=eq." + enc(st.workspace) + "&id=in.(" + dels.map(q => '"' + rowId(q.store, q.id).replace(/"/g, "") + '"').join(",") + ")", undefined, { Prefer: "return=minimal" });
          const done = new Set(batch); queue = queue.filter(q => !done.has(q) && !seen.has(q.store + ":" + q.id));
          st.pending = queue.length; emit();
        }
        st.status = "ok"; st.error = ""; st.lastSync = Date.now(); ls.set("orun_oracle_synced", String(st.lastSync));
      } catch (e) { st.status = "error"; st.error = e.message; clearTimeout(timer); timer = setTimeout(flush, 15000); }
      flushing = false; emit();
    }
    const enc = (s) => encodeURIComponent(s);
    const rowId = (store, id) => store === "settings" ? "settings:" + id : id;   // settings 는 key 가 'ui' 같은 짧은 이름이라 접두를 붙인다
    // ---- 읽기: 작업공간의 문서 전부 (1000개씩) ----
    async function pullAll() {
      const out = []; let from = 0;
      while (true) {
        const rows = await req("GET", "workspace=eq." + enc(st.workspace) + "&select=id,store,data,updated_at&order=updated_at.asc&limit=1000&offset=" + from);
        out.push(...rows); if (rows.length < 1000) break; from += 1000;
      }
      st.docs = out.length; return out;
    }
    async function count() { const res = await fetch(URL_ + "?workspace=eq." + enc(st.workspace) + "&select=id", { headers: Object.assign(H(), { Prefer: "count=exact", Range: "0-0" }) }); const cr = res.headers.get("content-range") || ""; const n = +(cr.split("/")[1] || 0); st.docs = n; return n; }
    // 부팅 때: 클라우드 → 로컬 (덮어쓰기), 클라우드에 없는 로컬 문서 → 클라우드
    async function bootstrap(DB) {
      if (!st.enabled) return { pulled: 0, pushed: 0 };
      st.status = "syncing"; emit();
      try {
        const rows = await pullAll();
        const byStore = {}; rows.forEach(r => { if (!STORES.includes(r.store)) return; (byStore[r.store] = byStore[r.store] || []).push(r.data); });
        let pulled = 0, pushed = 0;
        const cloudIds = new Set(rows.map(r => r.id));
        for (const store of STORES) {
          const local = await DB.all(store);
          const mine = local.filter(d => !cloudIds.has(rowId(store, String(d[keyOf(store)]))));
          if (mine.length) { for (const d of mine) queue.push({ op: "put", store, id: String(d[keyOf(store)]), doc: d }); pushed += mine.length; }
          if (byStore[store] && byStore[store].length) { await DB.putAll(store, byStore[store], true); pulled += byStore[store].length; }
        }
        st.status = "ok"; st.error = ""; st.lastSync = Date.now(); ls.set("orun_oracle_synced", String(st.lastSync)); emit();
        if (queue.length) flush();
        return { pulled, pushed };
      } catch (e) { st.status = "error"; st.error = e.message; emit(); return { pulled: 0, pushed: 0, error: e.message }; }
    }
    // 로컬 전부를 클라우드로 (처음 쓰거나 작업공간을 바꿨을 때)
    async function pushAll(DB) {
      for (const store of STORES) { const local = await DB.all(store); for (const d of local) queue.push({ op: "put", store, id: String(d[keyOf(store)]), doc: d }); }
      st.pending = queue.length; emit(); await flush();
    }
    async function wipeCloud() { await req("DELETE", "workspace=eq." + enc(st.workspace), undefined, { Prefer: "return=minimal" }); st.docs = 0; emit(); }
    load();
    return { st, on, load, setWorkspace, setEnabled, push, remove, flush, bootstrap, pushAll, pullAll, count, wipeCloud, STORES };
  })();
