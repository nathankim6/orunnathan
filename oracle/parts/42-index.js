  // ==================================================================
  //  INDEX — 로컬 역색인. 필드 가중 BM25(k1 1.2 · b 0.6) · 한글 2-gram · 영문 어간 · #태그 토큰 · 원문 substring(grep).
  //  문서 단위 = 노트 하나(선생님 · 시험 · 문항 · 지문 · 자료 · 프로파일 · 예측 · 모의고사 · 자유 메모 · 질문).
  //  anchor 메모는 따로 문서가 되지 않고 붙은 문서의 memo/tags 필드로 들어간다(고아가 되면 문서가 된다).
  //  저장하지 않는다 — 부팅 · import · wipe · 설정(색인 다시 짓기)에서 rebuild(all) 하고, 그 사이는 DB.onWrite 로 스스로 증분 갱신한다
  //  (silent=true 인 bootstrap putAll 은 무시 — 끝에 rebuild 가 한 번 돈다). IIFE 시점에 window/document/localStorage 를 만지지 않는다.
  // ==================================================================
  const INDEX = (function () {
    const K1 = 1.2, B = 0.6;
    const W = { title: 3, tags: 3, memo: 2, props: 1.5, body: 1 };
    const FIELDS = ["title", "tags", "memo", "props", "body"];
    const STORE_KIND = { teachers: "teacher", exams: "exam", questions: "question", passages: "passage", sources: "source", profiles: "profile", predictions: "prediction", mocks: "mock", notes: "note" };
    const KIND_STORE = {}; Object.keys(STORE_KIND).forEach(s => { KIND_STORE[STORE_KIND[s]] = s; });
    const ORDER = ["teachers", "exams", "sources", "passages", "questions", "profiles", "predictions", "mocks", "notes"];
    const state = { ready: false, building: false, progress: 0, n: 0 };
    const post = new Map();     // token → Map<docId, { tf: { field: n } }>
    const len = new Map();      // docId → 가중 길이
    const dtoks = new Map();    // docId → Set<token>  (지울 때 다시 토큰화하지 않으려고)
    const docs = new Map();     // docId → Doc
    const raw = new Map();      // docId → { text, lower, store, kind, title, teacherId }  (지문 · 시험 · 자료 원문 — grep)
    const memos = new Map();    // anchorKey → { id, body, tags }  (anchor 메모 캐시 → 붙은 문서의 memo 필드)
    let titles = [], titlesDirty = true, totalLen = 0, listeners = [], gen = 0, ctxDefault = null;
    const on = (fn) => { if (typeof fn === "function") listeners.push(fn); return () => { listeners = listeners.filter(f => f !== fn); }; };
    const emit = () => listeners.forEach(fn => { try { fn(state); } catch (e) { console.error(e); } });
    const round = (x) => Math.round(x * 1000) / 1000;
    const S = (v, n) => { const s = String(v == null ? "" : v); return n ? s.slice(0, n) : s; };
    const pct = (x) => Math.round((+x || 0) * 100) + "%";

    // ---- 토크나이저 ----
    // NFKC · 소문자 → 영문 [a-z0-9]+(2자 이상 · 어미 s/es/ed/ing 제거 · 숫자는 한 자리라도 그대로 — "Lesson 3" 의 3) → 한글은 공백 · 기호로 나뉜 음절 덩어리의 2-gram(1글자 덩어리는 그 글자)
    // → #태그 는 # 포함 한 토큰(이름의 2-gram 도 함께 넣어 "재출제" 로도 찾힌다) → 원문자 · 기호는 버린다. TEXT.norm 은 쓰지 않는다.
    function stem(w) {
      if (!/^[a-z]+$/.test(w)) return w;
      if (w.length >= 6 && /ing$/.test(w)) return w.slice(0, -3);
      if (w.length >= 5 && /ed$/.test(w)) return w.slice(0, -2);
      if (w.length >= 5 && /(ss|sh|ch|x|z)es$/.test(w)) return w.slice(0, -2);
      if (w.length >= 4 && /[^s]s$/.test(w)) return w.slice(0, -1);
      return w;
    }
    const TAG_RE = /(^|[^\p{L}\p{N}_&;/])#([\p{L}\p{N}_-]{1,40})/gu;
    function tokenize(text) {
      let s = String(text == null ? "" : text);
      if (!s) return [];
      s = s.replace(/[\u2460-\u24ff\u3200-\u32ff]/g, " ");   // 원문자(①…㉠…)는 NFKC 가 숫자 · 글자로 바꾸기 전에 버린다
      try { s = s.normalize("NFKC"); } catch (e) {}
      s = s.toLowerCase();
      const out = [];
      s = s.replace(TAG_RE, (m, pre, name) => { const n = name.replace(/-+$/, ""); if (n) out.push("#" + n); return pre + " " + name + " "; });
      const re = /[a-z0-9]+|[가-힣]+/g; let m;
      while ((m = re.exec(s))) {
        const w = m[0];
        if (w.charCodeAt(0) < 128) { if (/^\d+$/.test(w)) out.push(w); else if (w.length >= 2) out.push(stem(w)); }
        else if (w.length === 1) out.push(w);
        else for (let i = 0; i + 2 <= w.length; i++) out.push(w.slice(i, i + 2));
      }
      return out;
    }
    const uniq = (a) => [...new Set(a)];
    const normTitle = (s) => String(s == null ? "" : s).toLowerCase().replace(/\s+/g, "");

    // ---- 문서 만들기 ----
    // ctx: { examTitle(id), passageSrc(id), teacherName(id), sourceName(id), memoOf(anchorKey) } — 전부 선택. 없으면 색인 안의 문서와 메모 캐시로 푼다.
    function look(ctx, fn, id) {
      if (!id) return "";
      if (ctx && typeof ctx[fn] === "function") { try { const v = ctx[fn](id); if (v) return String(v); } catch (e) {} }
      const d = docs.get(id); return d ? d.title : "";
    }
    function memoFor(ctx, anchorKey) {
      if (ctx && typeof ctx.memoOf === "function") { try { const m = ctx.memoOf(anchorKey); if (m) return typeof m === "string" ? { body: m, tags: [] } : { body: m.body || "", tags: m.tags || [] }; } catch (e) {} }
      return memos.get(anchorKey) || null;
    }
    function titleOf(store, doc, ctx) {
      ctx = ctx || ctxDefault;
      if (!doc) return "";
      switch (store) {
        case "teachers": return S(doc.name) || "선생님";
        case "exams": return doc.meta ? TEXT.examLabel(doc.meta).trim() : (S(doc.title) || "시험");
        case "questions": return (look(ctx, "examTitle", doc.examId) || "시험") + " · " + (doc.number || "?") + "번";
        case "passages": return S(doc.src) || "지문";
        case "sources": return S(doc.name) || (doc.kind === "프린트" ? "프린트" : "자료");
        case "profiles": return "프로파일 V" + (doc.version || 1);
        case "predictions": return ((doc.target && doc.target.label) || "다음 시험") + " 예측";
        case "mocks": return S(doc.title) || "적중 모의고사";
        case "notes": return NOTES.titleOf(doc);
      }
      return S(doc.title) || S(doc.name) || S(doc.id);
    }
    function subOf(store, doc, ctx) {
      ctx = ctx || ctxDefault;
      const j = (a) => a.filter(Boolean).join(" · ");
      switch (store) {
        case "teachers": return j([doc.school, doc.grade ? doc.grade + "학년" : "", doc.subject]);
        case "exams": return j([doc.analysis && doc.analysis.total ? "문항 " + doc.analysis.total : "", doc.matchable ? "매칭 " + (doc.matched || 0) + "/" + doc.matchable : "", doc.reflection && doc.reflection.n ? "프린트 반영 " + pct(doc.reflection.rate) : ""]);
        case "questions": return j([doc.type, doc.subtype, doc.format, doc.points !== null && doc.points !== undefined ? doc.points + "점" : "", doc.difficulty ? "난이도 " + doc.difficulty : "", doc.handoutHit ? "★프린트" : ""]);
        case "passages": return j([look(ctx, "sourceName", doc.sourceId), doc.genre, doc.words ? doc.words + "단어" : "", doc.fromHandout ? "★프린트 지문" : ""]);
        case "sources": return j([doc.kind, doc.passages ? "지문 " + doc.passages : "", doc.items && doc.items.length ? "포인트 " + doc.items.length : "", doc.reflection && doc.reflection.n ? "반영율 " + pct(doc.reflection.rate) : ""]);
        case "profiles": { const p = doc.profile || {}; return j([p.level ? "레벨 " + p.level.name : "", p.reliability !== undefined ? "신뢰도 " + p.reliability : "", p.basedOn ? "시험 " + p.basedOn.nExams + " · 문항 " + p.basedOn.nQuestions : ""]); }
        case "predictions": { const bp = doc.blueprint || {}; return j(["V" + (doc.profileVersion || "?"), bp.confidence ? "신뢰도 " + pct(bp.confidence.overall) : "", bp.plan ? bp.plan.total + "문항" : ""]); }
        case "mocks": return j([doc.target, doc.stats ? doc.stats.total + "문항 · " + doc.stats.points + "점" : "", doc.model]);
        case "notes": return j([NOTES.kindLabel(doc.kind), doc.date, doc.orphanOf ? "고아" : "", doc.author]);
      }
      return "";
    }
    function bodyOf(store, doc) {
      const j = (a) => a.filter(Boolean).join(" ");
      switch (store) {
        case "teachers": return j([doc.name, doc.school, doc.subject, doc.note]);
        case "exams": return j([doc.analysis && doc.analysis.summary, doc.memo, S(doc.text, 1500)]);
        case "questions": return j([doc.stem, (doc.options || []).map(o => o.text).join(" "), doc.answer, doc.features, doc.difficultyReason, S(doc.rawBlock, 600)]);
        case "passages": return j([doc.gist, S(doc.text, 400)]);
        case "sources": return j([doc.memo, (doc.items || []).map(it => it.text + (it.point ? " " + it.point : "") + (it.stem ? " " + it.stem : "")).join(" "), S(doc.text, 1500)]);
        case "profiles": return j([doc.narrative && doc.narrative.text, doc.narrative && (doc.narrative.keywords || []).join(" "), doc.narrative && (doc.narrative.watchouts || []).join(" "), (doc.delta || []).join(" "), doc.reason]);
        case "predictions": return j([doc.copyText, doc.blueprint && (doc.blueprint.newMoves || []).join(" ")]);
        case "mocks": return (doc.questions || []).map(q => q.stem).join("\n");
        case "notes": return j([doc.ask && doc.ask.question, doc.body]);
      }
      return "";
    }
    function questionProps(doc) { const t = doc.transformation || {}; return [doc.type, doc.subtype, doc.format, doc.difficulty && "난이도 " + doc.difficulty, t.technique, t.blankPosition, t.blankUnit, (t.grammarPoints || []).join(" "), doc.handoutHit ? "프린트적중 " + (doc.handoutHit.kinds || []).join(" ") : "", doc.external ? "외부지문" : "", doc.set ? "세트 " + doc.set : ""].filter(Boolean).join(" · "); }
    function propsOf(store, doc, ctx) {
      ctx = ctx || ctxDefault;
      const j = (a) => a.filter(Boolean).join(" · ");
      switch (store) {
        case "teachers": return j(["선생님", doc.school, doc.subject]);
        case "exams": return j(["시험", doc.meta && TEXT.examLabel(doc.meta), doc.meta && doc.meta.school, doc.ai && doc.ai.label]);
        case "questions": return j(["문항", look(ctx, "examTitle", doc.examId), questionProps(doc)]);
        case "passages": return j(["지문", doc.genre, doc.lessonKey, (doc.feats || []).join(" "), (doc.grammarTargets || []).map(g => g.point).join(" "), doc.fromHandout ? "프린트" : ""]);
        case "sources": return j([doc.kind === "프린트" ? "프린트" : "자료", doc.kind, doc.target && !doc.target.guessed ? TEXT.examLabel(doc.target) : "", (doc.items || []).map(it => it.kind).filter((k, i, a) => a.indexOf(k) === i).join(" ")]);
        case "profiles": { const p = doc.profile || {}; return j(["프로파일", p.level && p.level.name, Object.keys(p.typeDist || {}).slice(0, 8).join(" "), (p.grammarPoints || []).slice(0, 6).map(g => g.point).join(" ")]); }
        case "predictions": { const bp = doc.blueprint || {}; return j(["예측", doc.target && doc.target.label, bp.plan && (bp.plan.typePlan || []).map(t => t.type).join(" "), (bp.grammarPoints || []).slice(0, 5).map(g => g.point).join(" ")]); }
        case "mocks": return j(["모의고사", doc.target, (doc.questions || []).map(q => q.type).filter((k, i, a) => a.indexOf(k) === i).join(" ")]);
        case "notes": return j([NOTES.kindLabel(doc.kind), doc.kind === "ask" ? "물어보기" : "", doc.orphanOf ? "삭제된 " + doc.orphanOf.title : "", doc.source && doc.source.kind]);
      }
      return "";
    }
    // docOf(store, doc, ctx) → Doc | null (anchor 메모는 null — 붙은 문서의 memo 로 간다)
    function docOf(store, doc, ctx) {
      const kind = STORE_KIND[store]; if (!kind || !doc || !doc.id) return null;
      ctx = ctx || ctxDefault;
      if (store === "notes" && doc.kind === "anchor" && doc.anchor && doc.anchorKey) return null;
      const derived = NOTES.derivedTags(store, doc);
      let memo = "", userTags = [];
      if (store === "notes") userTags = (doc.tags || []).slice();
      else { const m = memoFor(ctx, store + ":" + doc.id); if (m) { memo = m.body || ""; userTags = (m.tags || []).slice(); } }
      const title = titleOf(store, doc, ctx);
      const d = { id: doc.id, store, kind, noteKind: store === "notes" ? (doc.kind || "note") : "", teacherId: doc.teacherId || null, title, sub: subOf(store, doc, ctx),
        fields: { title, tags: userTags.concat(derived).join(" "), memo, props: propsOf(store, doc, ctx), body: bodyOf(store, doc) },
        userTags, derivedTags: derived, createdAt: doc.createdAt || 0, updatedAt: doc.updatedAt || doc.analyzedAt || doc.createdAt || 0,
        handout: store === "sources" && doc.kind === "프린트", hit: !!(doc.handoutHit || doc.fromHandout), anchorKey: store === "notes" ? (doc.anchorKey || "") : "",
        examId: doc.examId || null, sourceId: doc.sourceId || null, passageId: (doc.match && doc.match.passageId) || null, number: doc.number || "" };
      if (store === "questions") d.propsRest = questionProps(doc);
      return d;
    }
    // ---- 색인 구조 ----
    function addDoc(d) {
      removeDoc(d.id);
      let L = 0; const tfs = {}; const set = new Set();
      FIELDS.forEach(f => { const toks = tokenize(d.fields[f]); toks.forEach(t => { const m = tfs[t] || (tfs[t] = {}); m[f] = (m[f] || 0) + 1; set.add(t); }); L += toks.length * W[f]; });
      Object.keys(tfs).forEach(t => { let m = post.get(t); if (!m) { m = new Map(); post.set(t, m); } m.set(d.id, { tf: tfs[t] }); });
      len.set(d.id, L); totalLen += L; dtoks.set(d.id, set); docs.set(d.id, d); titlesDirty = true; state.n = docs.size;
    }
    function removeDoc(id) {
      if (!docs.has(id)) { raw.delete(id); return false; }
      const set = dtoks.get(id) || new Set();
      set.forEach(t => { const m = post.get(t); if (m) { m.delete(id); if (!m.size) post.delete(t); } });
      totalLen -= len.get(id) || 0; len.delete(id); dtoks.delete(id); docs.delete(id); raw.delete(id); titlesDirty = true; state.n = docs.size; return true;
    }
    function addFromStore(store, doc, ctx) {
      const d = docOf(store, doc, ctx); if (!d) return null;
      addDoc(d);
      if ((store === "passages" || store === "exams" || store === "sources") && doc.text) { const text = String(doc.text); raw.set(doc.id, { text, lower: text.toLowerCase(), store, kind: d.kind, title: d.title, teacherId: d.teacherId }); }
      return d;
    }
    function refreshMemo(anchorKey) {
      const id = String(anchorKey || "").split(":")[1]; const d = id && docs.get(id); if (!d) return;
      const m = memos.get(anchorKey);
      d.fields.memo = m ? m.body || "" : ""; d.userTags = m ? (m.tags || []).slice() : []; d.fields.tags = d.userTags.concat(d.derivedTags).join(" ");
      addDoc(d);
    }
    function clearData() { post.clear(); len.clear(); dtoks.clear(); docs.clear(); raw.clear(); memos.clear(); titles = []; titlesDirty = true; totalLen = 0; state.n = 0; }
    // ---- 공개: 전량 · 증분 ----
    // rebuild(all, ctx) — all: { teachers, exams, questions, passages, sources, profiles, predictions, mocks, notes } (각 docs[]). 200개씩 setTimeout(0) 조각 · state.progress 0..1
    function rebuild(all, ctx) {
      const g = ++gen; all = all || {};
      if (ctx) ctxDefault = ctx;
      backlog = []; if (backlogTimer) { clearTimeout(backlogTimer); backlogTimer = 0; }
      clearData(); state.building = true; state.ready = false; state.progress = 0; emit();
      (all.notes || []).forEach(n => { if (n && n.kind === "anchor" && n.anchor && n.anchorKey) memos.set(n.anchorKey, { id: n.id, body: n.body || "", tags: n.tags || [] }); });
      const items = []; ORDER.forEach(store => (all[store] || []).forEach(doc => items.push([store, doc])));
      return new Promise(res => {
        let i = 0;
        const step = () => {
          if (g !== gen) { res(); return; }
          const end = Math.min(items.length, i + 200);
          for (; i < end; i++) { try { addFromStore(items[i][0], items[i][1], ctx); } catch (e) { console.error(e); } }
          state.progress = items.length ? Math.min(1, i / items.length) : 1;
          if (i < items.length) { emit(); setTimeout(step, 0); }
          else { state.building = false; state.ready = true; state.progress = 1; emit(); res(); }
        };
        setTimeout(step, 0);
      });
    }
    function upsertOne(store, doc, ctx) {
      if (!STORE_KIND[store] || !doc || !doc.id) return null;
      ctx = ctx || ctxDefault;
      if (store === "notes") {
        // 옛 anchorKey 가 바뀌었거나(고아가 됨) 문서였다가 anchor 가 된 경우를 모두 정리한다
        memos.forEach((m, k) => { if (m.id === doc.id && k !== doc.anchorKey) { memos.delete(k); refreshMemo(k); } });
        if (doc.kind === "anchor" && doc.anchor && doc.anchorKey) { memos.set(doc.anchorKey, { id: doc.id, body: doc.body || "", tags: doc.tags || [] }); removeDoc(doc.id); refreshMemo(doc.anchorKey); return null; }
      }
      const d = addFromStore(store, doc, ctx);
      if (store === "exams" && d) docs.forEach(x => { if (x.store === "questions" && x.examId === doc.id) { const nt = d.title + " · " + (x.number || "?") + "번"; if (x.title !== nt) { x.title = nt; x.fields.title = nt; x.fields.props = ["문항", d.title, x.propsRest || ""].filter(Boolean).join(" · "); addDoc(x); } } });
      return d;
    }
    function upsert(store, doc, ctx) { const d = upsertOne(store, doc, ctx); emit(); return d; }
    function removeOne(id) {
      let hit = false;
      memos.forEach((m, k) => { if (m.id === id) { memos.delete(k); refreshMemo(k); hit = true; } });
      if (removeDoc(id)) hit = true;
      return hit;
    }
    function remove(id) { const hit = removeOne(id); if (hit) emit(); return hit; }
    // 큰 putAll(반영율 재계산 · import) 은 200개씩 조각내어 화면을 막지 않는다
    let backlog = [], backlogTimer = 0;
    function drain() {
      backlogTimer = 0;
      const chunk = backlog.splice(0, 200);
      chunk.forEach(([store, doc]) => { try { upsertOne(store, doc); } catch (e) { console.error(e); } });
      if (backlog.length) backlogTimer = setTimeout(drain, 0);
      emit();
    }
    function queueUpserts(store, list) { list.forEach(doc => backlog.push([store, doc])); if (!backlogTimer) backlogTimer = setTimeout(drain, 0); }
    function flush() { while (backlog.length) { const [store, doc] = backlog.shift(); try { upsertOne(store, doc); } catch (e) { console.error(e); } } if (backlogTimer) { clearTimeout(backlogTimer); backlogTimer = 0; } emit(); }
    function clear() { clearData(); state.building = false; state.ready = true; state.progress = 1; emit(); }
    // ---- 검색 ----
    function snippetOf(d, matched) {
      const srcs = [d.fields.memo, d.fields.body, d.sub]; let best = null;
      for (const src of srcs) {
        if (!src) continue; const low = src.toLowerCase(); let pos = -1;
        matched.forEach(t => { const p = low.indexOf(t.charAt(0) === "#" ? t : t); if (p >= 0 && (pos < 0 || p < pos)) pos = p; });
        if (pos >= 0) { best = { src, pos }; break; }
      }
      if (!best) return S(d.fields.body || d.sub, 120).replace(/\s+/g, " ");
      const a = Math.max(0, best.pos - 50), b = Math.min(best.src.length, best.pos + 90);
      return (a > 0 ? "…" : "") + best.src.slice(a, b).replace(/\s+/g, " ") + (b < best.src.length ? "…" : "");
    }
    // search(q, { teacherId, kinds, limit=30, minScore=0, strict }) → [{ id, store, kind, noteKind, teacherId, title, sub, score, snippet, matched }]
    //   teacherId: 같은 선생님 ×1.3 (strict:true 면 그 선생님 + teacherId 없는 문서만) · kinds: ["question", …] 또는 노트 종류("ask")
    function search(q, o) {
      o = o || {}; const limit = o.limit || 30, minScore = o.minScore || 0;
      const qt = uniq(tokenize(q)); if (!qt.length) return [];
      const N = docs.size || 1, avg = docs.size ? totalLen / docs.size : 1;
      const acc = new Map();
      qt.forEach(t => {
        const m = post.get(t); if (!m) return;
        const df = m.size, idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        m.forEach((p, id) => {
          let tf = 0; for (const f in p.tf) tf += (W[f] || 1) * p.tf[f];
          const dl = len.get(id) || 0;
          const s = idf * (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * dl / (avg || 1)));
          let a = acc.get(id); if (!a) { a = { score: 0, matched: new Set() }; acc.set(id, a); }
          a.score += s; a.matched.add(t);
        });
      });
      const now = Date.now(), qn = normTitle(q), tid = o.teacherId && o.teacherId !== "*" ? o.teacherId : "";
      const out = [];
      acc.forEach((a, id) => {
        const d = docs.get(id); if (!d) return;
        if (o.kinds && o.kinds.length && !o.kinds.includes(d.kind) && !(d.noteKind && o.kinds.includes(d.noteKind))) return;
        if (o.strict && tid && d.teacherId && d.teacherId !== tid) return;
        let s = a.score;
        if (tid && d.teacherId === tid) s *= 1.3;
        if (d.updatedAt && now - d.updatedAt < 90 * 864e5) s *= 1.1;
        if (qn && normTitle(d.title) === qn) s *= 2;
        if (s < minScore) return;
        out.push({ id, store: d.store, kind: d.kind, noteKind: d.noteKind, teacherId: d.teacherId, title: d.title, sub: d.sub, score: round(s), snippet: snippetOf(d, a.matched), matched: [...a.matched], handout: d.handout, hit: d.hit, updatedAt: d.updatedAt });
      });
      out.sort((a, b) => b.score - a.score || (b.updatedAt || 0) - (a.updatedAt || 0));
      return out.slice(0, limit);
    }
    function ensureTitles() {
      if (!titlesDirty) return;
      titles = []; docs.forEach(d => titles.push({ id: d.id, title: d.title, lower: d.title.toLowerCase(), norm: normTitle(d.title), kind: d.kind, noteKind: d.noteKind, teacherId: d.teacherId, sub: d.sub, updatedAt: d.updatedAt }));
      titlesDirty = false;
    }
    const inScope = (t, tid) => !tid || tid === "*" || !t.teacherId || t.teacherId === tid;
    const strip = (t) => ({ id: t.id, title: t.title, kind: t.kind, noteKind: t.noteKind, teacherId: t.teacherId, sub: t.sub });
    // titles({ teacherId }) → [{ id, title, kind, teacherId }]
    function titlesOf(o) { ensureTitles(); const tid = o && o.teacherId; return titles.filter(t => inScope(t, tid)).map(strip); }
    // prefix(q, { teacherId, limit=8 }) → 접두 일치 → 포함 순, 같은 선생님 먼저 · 짧은 제목 먼저. q 가 비면 최근 문서.
    function prefix(q, o) {
      o = o || {}; const limit = o.limit || 8, tid = o.teacherId, qn = normTitle(q);
      if (!qn) return recent({ teacherId: tid, limit }).map(d => strip(d));
      ensureTitles();
      const starts = [], contains = [];
      titles.forEach(t => { if (!inScope(t, tid)) return; const i = t.norm.indexOf(qn); if (i === 0) starts.push(t); else if (i > 0) contains.push(t); });
      const same = (t) => tid && tid !== "*" && t.teacherId === tid ? 1 : 0;
      const rank = (arr) => arr.sort((a, b) => same(b) - same(a) || a.norm.length - b.norm.length || (b.updatedAt || 0) - (a.updatedAt || 0));
      return rank(starts).concat(rank(contains)).slice(0, limit).map(strip);
    }
    // grep(q, { teacherId, limit=20 }) → [{ id, store, kind, title, teacherId, pos, len, match, snippet }] — 지문 · 시험 · 자료 원문에 indexOf(대소문자 무시)
    function grep(q, o) {
      o = o || {}; const limit = o.limit || 20, tid = o.teacherId && o.teacherId !== "*" ? o.teacherId : "";
      const needle = String(q == null ? "" : q).trim().replace(/^["“”'‘’]+|["“”'‘’]+$/g, "").replace(/\s+/g, " ").toLowerCase();
      if (needle.length < 2) return [];
      const out = [];
      const PRI = { passage: 0, source: 1, exam: 2 };
      raw.forEach((r, id) => {
        if (tid && r.teacherId && r.teacherId !== tid) return;
        const pos = r.lower.indexOf(needle); if (pos < 0) return;
        const a = Math.max(0, pos - 60), b = Math.min(r.text.length, pos + needle.length + 60);
        out.push({ id, store: r.store, kind: r.kind, title: r.title, teacherId: r.teacherId, pos, len: needle.length, match: r.text.substr(pos, needle.length), snippet: (a > 0 ? "…" : "") + r.text.slice(a, b).replace(/\s+/g, " ") + (b < r.text.length ? "…" : "") });
      });
      out.sort((a, b) => (PRI[a.kind] || 0) - (PRI[b.kind] || 0) || a.pos - b.pos);
      return out.slice(0, limit);
    }
    function recent(o) { o = o || {}; const tid = o.teacherId, limit = o.limit || 8; const out = []; docs.forEach(d => { if (inScope(d, tid)) out.push(d); }); out.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)); return out.slice(0, limit); }
    function setContext(ctx) { ctxDefault = ctx || null; }
    // ---- DB 쓰기 훅 (있을 때만) ----
    function onDbWrite(ev) {
      if (!ev || !STORE_KIND[ev.store]) return;
      if (ev.op === "put") { if (ev.silent) return; const list = ev.docs || []; if (list.length > 50) queueUpserts(ev.store, list); else { list.forEach(d => upsertOne(ev.store, d)); emit(); } }
      else if (ev.op === "del") { flush(); (ev.keys || []).forEach(removeOne); emit(); }
      else if (ev.op === "clear") { backlog = backlog.filter(x => x[0] !== ev.store); [...docs.keys()].forEach(id => { if (docs.get(id).store === ev.store) removeDoc(id); }); if (ev.store === "notes") memos.clear(); emit(); }
    }
    if (typeof DB !== "undefined" && DB && typeof DB.onWrite === "function") DB.onWrite(onDbWrite);
    return { tokenize, stem, docOf, titleOf, subOf, rebuild, upsert, remove, clear, flush, search, hasToken: (t) => post.has(t), titles: titlesOf, prefix, grep, docs: () => docs, get: (id) => docs.get(id), recent, memoOf: (k) => memos.get(k) || null, state, on, setContext, STORE_KIND, KIND_STORE, W };
  })();
