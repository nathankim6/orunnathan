  // ==================================================================
  //  DB — IndexedDB. 파일 원본은 두지 않고 추출한 텍스트와 데이터만 둔다.
  //  stores: teachers · exams · questions · passages · sources · profiles · events · predictions · mocks · settings · media
  //          + notes(내 메모 · 데일리 · 주간 · 질문) · links(사용자 링크) · tags(태그)   — VERSION 2 (추가만)
  //  쓰기마다 (1) SYNC 거울 (2) onWrite 훅(INDEX · LINKS · NOTES.tags 가 증분 갱신에 쓴다) 순으로 알린다.
  // ==================================================================
  const DB = (function () {
    const NAME = "orun_oracle", VERSION = 2;
    const STORES = {
      teachers:  { key: "id", idx: [] },
      exams:     { key: "id", idx: ["teacherId"] },
      questions: { key: "id", idx: ["teacherId", "examId"] },
      passages:  { key: "id", idx: ["teacherId", "sourceId"] },
      sources:   { key: "id", idx: ["teacherId"] },          // 시험범위 원문 · 프린트 파일 단위
      profiles:  { key: "id", idx: ["teacherId"] },          // 버전별 스냅샷
      events:    { key: "id", idx: ["teacherId", "at"] },    // 학습 이력 (at 인덱스는 v2 에서 추가 — 타임라인이 주 단위로 읽는다)
      predictions: { key: "id", idx: ["teacherId"] },
      mocks:     { key: "id", idx: ["teacherId"] },          // 만든 적중 모의고사
      settings:  { key: "key", idx: [] },
      media:     { key: "key", idx: [] },                    // 배경 영상 blob
      notes:     { key: "id", idx: ["teacherId", "anchorKey", "kind", "date", "updatedAt"] },   // 내 메모 (anchor) · 자유 메모 · daily · weekly · ask
      links:     { key: "id", idx: ["teacherId", "from", "to"] },                              // 사용자 링크 (wiki · cite · manual)
      tags:      { key: "id", idx: ["teacherId"] },                                            // 태그 (id = "tag:" + 이름)
    };
    let dbp = null;
    function open() {
      if (dbp) return dbp;
      dbp = new Promise((res, rej) => {
        if (typeof indexedDB === "undefined") { rej(new Error("이 브라우저는 저장소(IndexedDB)를 지원하지 않아요.")); return; }
        let req;
        try { req = indexedDB.open(NAME, VERSION); } catch (e) { rej(e); return; }
        req.onupgradeneeded = () => {
          // 없는 저장소 · 없는 인덱스만 만든다 (v1 → v2: notes · links · tags 와 events.at). 데이터는 그대로.
          const db = req.result;
          Object.keys(STORES).forEach(name => {
            const s = STORES[name];
            const st = db.objectStoreNames.contains(name) ? req.transaction.objectStore(name) : db.createObjectStore(name, { keyPath: s.key });
            s.idx.forEach(ix => { if (!st.indexNames.contains(ix)) st.createIndex(ix, ix, { unique: false }); });
          });
        };
        req.onsuccess = () => { const db = req.result; db.onversionchange = () => { try { db.close(); } catch (e) {} dbp = null; }; res(db); };
        req.onerror = () => rej(req.error || new Error("저장소를 열지 못했어요."));
        // 다른 탭이 옛 버전을 붙잡고 있으면 업그레이드가 막힌다 — APP.boot 가 code 를 보고 #bootError 를 그린다
        req.onblocked = () => rej(Object.assign(new Error("다른 탭이 저장소를 붙잡고 있어요 — 다른 탭을 닫고 [다시 시도]를 눌러 주세요."), { code: "blocked" }));
      });
      dbp.catch(() => { dbp = null; });
      return dbp;
    }
    function tx(store, mode, fn) {
      return open().then(db => new Promise((res, rej) => {
        const t = db.transaction(store, mode);
        const st = t.objectStore(store);
        let out;
        try { out = fn(st, t); } catch (e) { rej(e); return; }
        t.oncomplete = () => res(out && out.__req ? out.__req.result : out);
        t.onerror = () => rej(t.error || new Error("저장소 작업이 실패했어요."));
        t.onabort = () => rej(t.error || new Error("저장소 작업이 중단됐어요."));
      }));
    }
    const wrap = (req) => ({ __req: req });
    // 쓰기는 로컬에 먼저, 그 뒤 클라우드 거울(SYNC)로. silent=true 면 클라우드에서 받아 온 것이라 다시 올리지 않는다.
    const mirror = (store, docs) => { try { if (typeof SYNC !== "undefined") SYNC.push(store, docs); } catch (e) {} };
    const unmirror = (store, ids) => { try { if (typeof SYNC !== "undefined") SYNC.remove(store, ids); } catch (e) {} };
    // ---- 쓰기 훅 ----  fn({ op: "put"|"del"|"clear", store, docs?, keys?, silent })  — put/putAll/del/delWhere/clear/wipe 뒤에 부른다
    let hooks = [];
    // first=true 면 다른 훅보다 먼저 부른다 (APP 의 ctx 캐시가 INDEX 색인보다 먼저 갱신돼야 제목 · 메모가 한 박자 늦지 않다)
    function onWrite(fn, first) { if (typeof fn === "function") { if (first) hooks.unshift(fn); else hooks.push(fn); } return () => { hooks = hooks.filter(f => f !== fn); }; }
    function fire(ev) { for (const fn of hooks) { try { fn(ev); } catch (e) { console.error(e); } } }
    const keyOf = (store, v) => v == null ? v : v[STORES[store] ? STORES[store].key : "id"];
    const api = {
      get: (store, key) => tx(store, "readonly", st => wrap(st.get(key))),
      // getMany(store, ids) → 있는 문서만 (ids 순서대로)
      getMany: (store, ids) => tx(store, "readonly", st => { const o = { list: [] }; (ids || []).forEach(id => { const r = st.get(id); r.onsuccess = () => { if (r.result !== undefined) o.list.push(r.result); }; }); return o; }).then(o => o && o.list || []),
      put: async (store, value, silent) => { await tx(store, "readwrite", st => { st.put(value); return value; }); if (!silent) mirror(store, [value]); fire({ op: "put", store, docs: [value], keys: [keyOf(store, value)], silent: !!silent }); return value; },
      putAll: async (store, values, silent) => { await tx(store, "readwrite", st => { values.forEach(v => st.put(v)); return values.length; }); if (!silent && values.length) mirror(store, values); if (values.length) fire({ op: "put", store, docs: values, keys: values.map(v => keyOf(store, v)), silent: !!silent }); return values.length; },
      // silent=true 면 클라우드에서 온 삭제라 다시 올리지 않는다 (훅은 그대로 부른다 — 색인 · 링크는 지워야 하므로)
      del: async (store, key, silent) => { await tx(store, "readwrite", st => { st.delete(key); return true; }); if (!silent) unmirror(store, [key]); fire({ op: "del", store, keys: [key], silent: !!silent }); return true; },
      delWhere: async (store, idx, value) => {
        const keys = await tx(store, "readonly", st => wrap(st.index(idx).getAllKeys(IDBKeyRange.only(value))));
        if (keys.length) { await tx(store, "readwrite", st => { keys.forEach(k => st.delete(k)); return keys.length; }); unmirror(store, keys); fire({ op: "del", store, keys, silent: false }); }
        return keys.length;
      },
      all: (store) => tx(store, "readonly", st => wrap(st.getAll())),
      where: (store, idx, value) => tx(store, "readonly", st => wrap(st.index(idx).getAll(IDBKeyRange.only(value)))),
      // range(store, idx, lo, hi) → lo ≤ idx ≤ hi (예: events.at 을 주 단위로)
      range: (store, idx, lo, hi) => tx(store, "readonly", st => wrap(st.index(idx).getAll(IDBKeyRange.bound(lo, hi)))),
      count: (store, idx, value) => tx(store, "readonly", st => wrap(idx ? st.index(idx).count(IDBKeyRange.only(value)) : st.count())),
      clear: async (store) => { const keys = await tx(store, "readonly", st => wrap(st.getAllKeys())); await tx(store, "readwrite", st => { st.clear(); return true; }); if (keys.length) unmirror(store, keys); fire({ op: "clear", store, keys, silent: false }); return true; },
      setting: async (key, fallback) => { const r = await api.get("settings", key); return r ? r.value : fallback; },
      setSetting: (key, value) => api.put("settings", { key, value }),
      wipe: async () => { for (const s of Object.keys(STORES)) await api.clear(s); },
      open, onWrite,
      STORES: Object.keys(STORES),
      VERSION,
    };
    return api;
  })();
  // 짧고 충돌 없는 id — 시각 + 난수
  function uid(prefix) {
    const t = Date.now().toString(36), r = Math.random().toString(36).slice(2, 8);
    return (prefix || "x") + "_" + t + r;
  }
