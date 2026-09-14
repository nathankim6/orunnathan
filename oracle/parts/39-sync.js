  // ==================================================================
  //  SYNC — Supabase(oracle_docs) 거울. 브라우저 저장소(IndexedDB)가 작업본이고 클라우드는 같은 문서를 그대로 담는다.
  //  같은 저장소의 다른 앱(옳은문법)처럼 anon 키 + REST 로 직접 간다. 서버 없음. 영상(media)은 올리지 않는다.
  //  삭제는 행을 지우지 않고 묘비(tombstone — data.__deleted)를 남긴다. 그래야 다른 기기가 "지웠다" 와 "아직 안 올렸다" 를 구분한다.
  //  대기 중인 삭제는 localStorage 에도 적어 둔다(탭을 닫아도 남는다). 행 id 는 작업공간을 붙여 만든다(작업공간이 서로 행을 빼앗지 않게).
  //  notes · links · tags 는 (1) 설정 "이 브라우저에만"(PRIVATE, localStorage orun_oracle_private) 이면 올리지 않고
  //  (2) bootstrap 에서 덮어쓰지 않고 updatedAt 으로 병합한다(MERGE — 로컬이 더 새로우면 로컬을 남기고 올린다).
  // ==================================================================
  const SYNC = (function () {
    const URL_ = "https://wxjazdqabryflvfztujk.supabase.co/rest/v1/oracle_docs";
    const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4amF6ZHFhYnJ5Zmx2Znp0dWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NDkyOTAsImV4cCI6MjA1MTEyNTI5MH0._mBHMqttsrwB2f8U-8AsjmJXKaWoJsXPyrW76ugc80A";
    const STORES = ["teachers", "exams", "questions", "passages", "sources", "profiles", "predictions", "mocks", "events", "settings", "notes", "links", "tags"];
    const PRIVATE = ["notes", "links", "tags"];      // 설정 › 브레인 "메모 · 링크 · 태그는 이 브라우저에만"
    const MERGE = ["notes", "links", "tags"];        // bootstrap 에서 updatedAt 비교 병합 (나머지는 클라우드가 덮어쓴다)
    const st = { enabled: true, workspace: "heukseok", status: "idle", lastSync: 0, error: "", pending: 0, docs: 0, private: false };
    const TOMB_TTL = 180 * 864e5;                     // 묘비는 180일 뒤 진짜로 지운다 (그보다 오래 꺼져 있던 기기는 되살릴 수 있다)
    const PEND_KEY = "orun_oracle_pendel";            // 아직 못 보낸 삭제 (탭을 닫아도 남는다)
    let queue = [], timer = 0, listeners = [], seqN = 0, wsFresh = false;   // wsFresh: 작업공간을 막 바꿨다(다음 bootstrap 은 받기만 한다)
    const on = (fn) => listeners.push(fn);
    const emit = () => listeners.forEach(fn => { try { fn(st); } catch (e) {} });
    const ls = { get(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
    function load() { st.workspace = (ls.get("orun_oracle_ws") || "heukseok").trim() || "heukseok"; st.enabled = ls.get("orun_oracle_sync") !== "off"; st.lastSync = +ls.get("orun_oracle_synced") || 0; st.private = ls.get("orun_oracle_private") === "on"; }
    // 작업공간을 바꾸면 "그 작업공간을 본다" 는 뜻이다 — 이 브라우저의 문서를 저절로 올리지 않는다(다음 bootstrap 이 pull 만 한다).
    // 올리고 싶으면 설정 › 클라우드의 [모두 올리기] 를 누른다.
    function setWorkspace(w) {
      const next = String(w || "heukseok").trim().replace(/[^a-z0-9_-]/gi, "").toLowerCase() || "heukseok";
      const changed = next !== st.workspace;
      st.workspace = next; ls.set("orun_oracle_ws", st.workspace);
      if (changed) { wsFresh = true; ls.set("orun_oracle_ws_new", "1"); queue = []; st.pending = 0; savePend([]); }
      emit();
    }
    function setEnabled(v) { st.enabled = !!v; ls.set("orun_oracle_sync", v ? "on" : "off"); if (v) drainPend(); emit(); if (v) flush(); }
    // 메모 · 링크 · 태그를 거울하지 않는다 (켜면 큐에 남은 PRIVATE 문서도 버린다).
    // 이미 올라간 것은 그대로 남으므로 UI 가 wipePrivateCloud() 를 물어본다. 끄면 그동안 지운 것부터 올린다.
    function setPrivate(v) {
      st.private = !!v; ls.set("orun_oracle_private", v ? "on" : "off");
      if (st.private) { queue = queue.filter(q => !PRIVATE.includes(q.store)); st.pending = queue.length; }
      else { drainPend(); }
      emit();
      if (!st.private) flush();
    }
    // 이미 클라우드에 올라간 메모 · 링크 · 태그를 지운다 (개인 모드를 켤 때 UI 가 묻고 부른다)
    async function wipePrivateCloud() {
      await req("DELETE", "workspace=eq." + enc(st.workspace) + "&store=in.(" + PRIVATE.join(",") + ")", undefined, { Prefer: "return=minimal" });
      emit();
    }
    const skip = (store) => !STORES.includes(store) || (st.private && PRIVATE.includes(store));
    // ---- 못 보낸 삭제를 localStorage 에 적어 둔다 (오프라인 · 개인 모드 · 탭 종료에도 남는다) ----
    function loadPend() { try { const v = JSON.parse(ls.get(PEND_KEY) || "[]"); return Array.isArray(v) ? v.filter(x => x && x.store && x.id) : []; } catch (e) { return []; } }
    function savePend(list) { ls.set(PEND_KEY, JSON.stringify(list.slice(-500))); }
    function addPend(store, ids) {
      const cur = loadPend(); const have = new Set(cur.map(x => x.store + ":" + x.id));
      ids.forEach(id => { const k = store + ":" + String(id); if (!have.has(k)) { have.add(k); cur.push({ store, id: String(id) }); } });
      savePend(cur);
    }
    function dropPend(items) { if (!items.length) return; const gone = new Set(items.map(q => q.store + ":" + q.id)); savePend(loadPend().filter(x => !gone.has(x.store + ":" + x.id))); }
    // 적어 둔 삭제를 큐에 다시 올린다 (부팅 · 동기화 켜기 · 개인 모드 끄기)
    function drainPend() {
      const cur = loadPend(); if (!cur.length) return 0;
      const inQ = new Set(queue.filter(q => q.op === "del").map(q => q.store + ":" + q.id));
      let n = 0;
      for (const x of cur) { if (skip(x.store) || inQ.has(x.store + ":" + x.id)) continue; enq({ op: "del", store: x.store, id: x.id }); n++; }
      if (n) { st.pending = queue.length; emit(); }
      return n;
    }
    const enq = (item) => { item.seq = ++seqN; queue.push(item); return item; };
    const H = () => ({ apikey: KEY, Authorization: "Bearer " + KEY, "content-type": "application/json" });
    const keyOf = (store) => store === "settings" ? "key" : "id";
    const stamp = (d) => +(d && (d.updatedAt || d.createdAt)) || 0;
    // 병합 규칙 — 로컬이 더 새로우면 "local"(남기고 올린다), 아니면 "cloud"(받아 덮는다). 한쪽만 있으면 그쪽.
    function mergeRule(local, cloud) {
      if (!local && !cloud) return "cloud";
      if (!cloud) return "local";
      if (!local) return "cloud";
      return stamp(local) > stamp(cloud) ? "local" : "cloud";
    }
    async function req(method, qs, body, extra) {
      const res = await fetch(URL_ + (qs ? "?" + qs : ""), { method, headers: Object.assign(H(), extra || {}), body: body === undefined ? undefined : JSON.stringify(body) });
      if (!res.ok) { const t = await res.text(); throw new Error("Supabase " + res.status + ": " + t.slice(0, 200)); }
      const txt = await res.text(); return txt.trim() ? JSON.parse(txt) : null;   // return=minimal 이면 201 에 빈 본문이 온다
    }
    // ---- 쓰기 큐 (묶어서 보낸다) ----
    function push(store, docs) {
      if (!st.enabled || skip(store)) return;
      for (const d of docs) enq({ op: "put", store, id: String(d[keyOf(store)]), doc: d });
      schedule();
    }
    function remove(store, ids) {
      if (!STORES.includes(store) || !ids || !ids.length) return;
      addPend(store, ids);                                     // 먼저 적어 둔다 — 지금 못 보내도 다음에 보낸다
      if (!st.enabled || skip(store)) return;
      for (const id of ids) enq({ op: "del", store, id: String(id) });
      schedule();
    }
    function schedule() { st.pending = queue.length; emit(); clearTimeout(timer); timer = setTimeout(flush, 600); }
    let flushing = false;
    async function flush() {
      if (flushing || !queue.length || !st.enabled) return;
      flushing = true; st.status = "syncing"; emit();
      try {
        while (queue.length) {
          // 같은 id 는 마지막 것만. seen 은 그 항목의 seq 를 담는다 — 요청이 나가 있는 동안 들어온 더 새 쓰기를 지우지 않으려고.
          const batch = []; const seen = new Map();
          for (let i = queue.length - 1; i >= 0 && batch.length < 40; i--) { const q = queue[i]; const k = q.store + ":" + q.id; if (seen.has(k)) continue; seen.set(k, q.seq); batch.unshift(q); }
          const puts = batch.filter(q => q.op === "put"), dels = batch.filter(q => q.op === "del"), raws = batch.filter(q => q.op === "raw");
          // 삭제는 묘비 행으로 올린다 (지운 사실이 남아야 다른 기기가 되살리지 않는다)
          const rows = puts.map(q => rowOf(q.store, q.id, q.doc)).concat(dels.map(q => tombOf(q.store, q.id)));
          if (rows.length) await req("POST", "on_conflict=id", rows, { Prefer: "resolution=merge-duplicates,return=minimal" });
          // raw: 옛 규칙으로 올라간 행 · 수명이 다한 묘비 — 진짜로 지운다
          if (raws.length) await req("DELETE", "workspace=eq." + enc(st.workspace) + "&id=in.(" + raws.map(q => '"' + String(q.id).replace(/"/g, "") + '"').join(",") + ")", undefined, { Prefer: "return=minimal" });
          dropPend(dels);
          const done = new Set(batch);
          queue = queue.filter(q => { if (done.has(q)) return false; const s0 = seen.get(q.store + ":" + q.id); return !(s0 !== undefined && q.seq <= s0); });
          st.pending = queue.length; emit();
        }
        st.status = "ok"; st.error = ""; st.lastSync = Date.now(); ls.set("orun_oracle_synced", String(st.lastSync));
      } catch (e) { st.status = "error"; st.error = e.message; clearTimeout(timer); timer = setTimeout(flush, 15000); }
      flushing = false; emit();
    }
    const enc = (s) => encodeURIComponent(s);
    // 행 id — 작업공간 · 저장소를 앞에 붙인다. 붙이지 않으면 `tag:빈칸` · `settings:ui` 처럼 이름에서 나온 id 가
    // 작업공간끼리 같은 행을 빼앗는다(표의 기본키가 id 하나뿐이고 쓰기는 on_conflict=id 다).
    const rowId = (store, id) => st.workspace + ":" + store + ":" + id;
    const rowOf = (store, id, doc) => ({ id: rowId(store, id), workspace: st.workspace, store, teacher_id: doc.teacherId || (store === "teachers" ? id : null), data: doc, updated_at: new Date().toISOString() });
    const tombOf = (store, id) => ({ id: rowId(store, id), workspace: st.workspace, store, teacher_id: null, data: { __deleted: true, at: Date.now(), [keyOf(store)]: id }, updated_at: new Date().toISOString() });
    const isTomb = (r) => !!(r && r.data && r.data.__deleted);
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
    // 부팅 때: 클라우드 → 로컬 (덮어쓰기; notes · links · tags 는 updatedAt 병합), 클라우드에 없는 로컬 문서 → 클라우드.
    // 묘비(__deleted)가 있는 문서는 로컬에서도 지우고 다시 올리지 않는다. 작업공간을 막 바꿨으면 올리지 않고 받기만 한다.
    // 반환 { pulled, pushed, merged, deleted }. 끝나면 APP 이 INDEX.rebuild · LINKS.rebuild 를 한 번 돈다(putAll 은 silent 라 훅이 무시한다).
    async function bootstrap(DB) {
      if (!st.enabled) return { pulled: 0, pushed: 0, merged: 0, deleted: 0 };
      st.status = "syncing"; emit();
      try {
        drainPend();
        const rows = await pullAll();
        const fresh = wsFresh || ls.get("orun_oracle_ws_new") === "1";     // 작업공간을 막 바꿨다 — 받기만 한다
        const byStore = {}, tombs = {}; const now = Date.now();
        rows.forEach(r => {
          if (!STORES.includes(r.store)) return;
          if (isTomb(r)) { (tombs[r.store] = tombs[r.store] || new Map()).set(String(r.data[keyOf(r.store)] == null ? "" : r.data[keyOf(r.store)]), +r.data.at || 0); return; }
          (byStore[r.store] = byStore[r.store] || []).push(r.data);
        });
        // 옛 규칙(작업공간 없는 id)으로 올라간 행 · 수명이 다한 묘비 → 진짜로 지운다. 옛 행의 내용은 위에서 이미 읽었다.
        rows.forEach(r => {
          if (!STORES.includes(r.store) || !r.data) return;
          const k = String(r.data[keyOf(r.store)] == null ? "" : r.data[keyOf(r.store)]);
          if (r.id !== rowId(r.store, k)) { enq({ op: "raw", store: "__raw", id: r.id }); return; }
          if (isTomb(r) && now - (+r.data.at || 0) > TOMB_TTL) enq({ op: "raw", store: "__raw", id: r.id });
        });
        let pulled = 0, pushed = 0, merged = 0, deleted = 0;
        const cloudIds = new Set(rows.map(r => r.id));
        for (const store of STORES) {
          if (skip(store)) continue;
          const local = await DB.all(store);
          const kf = keyOf(store);
          const tomb = tombs[store] || new Map();
          // 다른 기기가 지운 문서 — 여기서도 지운다 (silent: 다시 올리지 않는다)
          for (const d of local) { const k = String(d[kf]); if (tomb.has(k)) { try { await DB.del(store, d[kf], true); deleted++; } catch (e) {} } }
          const live = tomb.size ? local.filter(d => !tomb.has(String(d[kf]))) : local;
          const mine = live.filter(d => !cloudIds.has(rowId(store, String(d[kf]))));
          if (mine.length && !fresh) { for (const d of mine) enq({ op: "put", store, id: String(d[kf]), doc: d }); pushed += mine.length; }
          const cloud = byStore[store] || [];
          if (!cloud.length) continue;
          if (MERGE.includes(store)) {
            const localById = new Map(live.map(d => [String(d[kf]), d]));
            const wins = [];
            for (const c of cloud) {
              const l = localById.get(String(c[kf]));
              if (!l) { wins.push(c); continue; }
              merged++;
              if (mergeRule(l, c) === "local") { if (!fresh) { enq({ op: "put", store, id: String(l[kf]), doc: l }); pushed++; } }
              else wins.push(c);
            }
            if (wins.length) { await DB.putAll(store, wins, true); pulled += wins.length; }
          } else { await DB.putAll(store, cloud, true); pulled += cloud.length; }
        }
        if (fresh) { wsFresh = false; ls.set("orun_oracle_ws_new", ""); }
        st.status = "ok"; st.error = ""; st.lastSync = Date.now(); ls.set("orun_oracle_synced", String(st.lastSync)); st.pending = queue.length; emit();
        if (queue.length) flush();
        return { pulled, pushed, merged, deleted };
      } catch (e) { st.status = "error"; st.error = e.message; emit(); return { pulled: 0, pushed: 0, merged: 0, deleted: 0, error: e.message }; }
    }
    // 로컬 전부를 클라우드로 (처음 쓰거나 작업공간을 바꿨을 때)
    async function pushAll(DB) {
      wsFresh = false; ls.set("orun_oracle_ws_new", "");
      for (const store of STORES) { if (skip(store)) continue; const local = await DB.all(store); for (const d of local) enq({ op: "put", store, id: String(d[keyOf(store)]), doc: d }); }
      st.pending = queue.length; emit(); await flush();
    }
    async function wipeCloud() { await req("DELETE", "workspace=eq." + enc(st.workspace), undefined, { Prefer: "return=minimal" }); queue = queue.filter(q => q.op !== "del"); savePend([]); st.docs = 0; st.pending = queue.length; emit(); }
    load();
    return { st, on, load, setWorkspace, setEnabled, setPrivate, wipePrivateCloud, push, remove, flush, bootstrap, pushAll, pullAll, count, wipeCloud, mergeRule, rowId, pendingDeletes: loadPend, STORES, PRIVATE, MERGE };
  })();
