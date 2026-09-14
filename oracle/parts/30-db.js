  // ==================================================================
  //  DB — IndexedDB. 파일 원본은 두지 않고 추출한 텍스트와 데이터만 둔다.
  //  stores: teachers · exams · questions · passages · profiles · events · settings · media
  // ==================================================================
  const DB = (function () {
    const NAME = "orun_oracle", VERSION = 1;
    const STORES = {
      teachers:  { key: "id", idx: [] },
      exams:     { key: "id", idx: ["teacherId"] },
      questions: { key: "id", idx: ["teacherId", "examId"] },
      passages:  { key: "id", idx: ["teacherId", "sourceId"] },
      sources:   { key: "id", idx: ["teacherId"] },          // 시험범위 원문 파일 단위
      profiles:  { key: "id", idx: ["teacherId"] },          // 버전별 스냅샷
      events:    { key: "id", idx: ["teacherId"] },          // 학습 이력
      predictions: { key: "id", idx: ["teacherId"] },
      mocks:     { key: "id", idx: ["teacherId"] },          // 만든 적중 모의고사
      settings:  { key: "key", idx: [] },
      media:     { key: "key", idx: [] },                    // 배경 영상 blob
    };
    let dbp = null;
    function open() {
      if (dbp) return dbp;
      dbp = new Promise((res, rej) => {
        if (!("indexedDB" in window)) { rej(new Error("이 브라우저는 저장소(IndexedDB)를 지원하지 않아요.")); return; }
        const req = indexedDB.open(NAME, VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          Object.keys(STORES).forEach(name => {
            const s = STORES[name];
            const st = db.objectStoreNames.contains(name) ? req.transaction.objectStore(name) : db.createObjectStore(name, { keyPath: s.key });
            s.idx.forEach(ix => { if (!st.indexNames.contains(ix)) st.createIndex(ix, ix, { unique: false }); });
          });
        };
        req.onsuccess = () => { const db = req.result; db.onversionchange = () => { try { db.close(); } catch (e) {} dbp = null; }; res(db); };
        req.onerror = () => rej(req.error || new Error("저장소를 열지 못했어요."));
        req.onblocked = () => rej(new Error("다른 탭이 저장소를 붙잡고 있어요. 다른 탭을 닫고 새로 고쳐 주세요."));
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
    const api = {
      get: (store, key) => tx(store, "readonly", st => wrap(st.get(key))),
      put: async (store, value, silent) => { await tx(store, "readwrite", st => { st.put(value); return value; }); if (!silent) mirror(store, [value]); return value; },
      putAll: async (store, values, silent) => { await tx(store, "readwrite", st => { values.forEach(v => st.put(v)); return values.length; }); if (!silent && values.length) mirror(store, values); return values.length; },
      del: async (store, key) => { await tx(store, "readwrite", st => { st.delete(key); return true; }); unmirror(store, [key]); return true; },
      delWhere: async (store, idx, value) => {
        const keys = await tx(store, "readonly", st => wrap(st.index(idx).getAllKeys(IDBKeyRange.only(value))));
        if (keys.length) { await tx(store, "readwrite", st => { keys.forEach(k => st.delete(k)); return keys.length; }); unmirror(store, keys); }
        return keys.length;
      },
      all: (store) => tx(store, "readonly", st => wrap(st.getAll())),
      where: (store, idx, value) => tx(store, "readonly", st => wrap(st.index(idx).getAll(IDBKeyRange.only(value)))),
      count: (store, idx, value) => tx(store, "readonly", st => wrap(idx ? st.index(idx).count(IDBKeyRange.only(value)) : st.count())),
      clear: async (store) => { const keys = await tx(store, "readonly", st => wrap(st.getAllKeys())); await tx(store, "readwrite", st => { st.clear(); return true; }); if (keys.length) unmirror(store, keys); return true; },
      setting: async (key, fallback) => { const r = await api.get("settings", key); return r ? r.value : fallback; },
      setSetting: (key, value) => api.put("settings", { key, value }),
      wipe: async () => { for (const s of Object.keys(STORES)) await api.clear(s); },
      STORES: Object.keys(STORES),
    };
    return api;
  })();
  // 짧고 충돌 없는 id — 시각 + 난수
  function uid(prefix) {
    const t = Date.now().toString(36), r = Math.random().toString(36).slice(2, 8);
    return (prefix || "x") + "_" + t + r;
  }
