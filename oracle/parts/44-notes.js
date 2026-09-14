  // ==================================================================
  //  NOTES — 내 메모 · 자유 메모 · 데일리 · 주간 · 질문 (notes 저장소) + 태그(tags 저장소).
  //  내 메모는 원 문서에 넣지 않고 kind:"anchor" · anchorKey:"<store>:<id>" 로 붙인다. 태그의 진실은 본문(#태그)이다.
  //  마크다운-라이트: [[제목]] · #태그 · **굵게** · "- " 목록 · "> " 인용 · 빈 줄 = 단락. 렌더는 TEXT.esc 를 먼저 적용한 뒤 정규식으로 바꾼다.
  //  DB 는 호출 시점에만 쓴다(단위 검사는 parse/render/anchorKey/kindOf 만 Node 에서 돌린다). IIFE 시점에 window/document/localStorage 를 만지지 않는다.
  // ==================================================================
  const NOTES = (function () {
    const KIND = { ANCHOR: "anchor", NOTE: "note", DAILY: "daily", WEEKLY: "weekly", ASK: "ask" };
    const KINDS = ["anchor", "note", "daily", "weekly", "ask"];
    const KIND_LABEL = { anchor: "메모", note: "자유 메모", daily: "데일리", weekly: "주간", ask: "질문" };
    // id 접두 → 저장소 · 종류 (§4.1). 긴 접두(pf_ pd_)를 먼저 본다.
    const PREFIX = [["pf_", "profiles", "profile"], ["pd_", "predictions", "prediction"], ["lk_", "links", "link"], ["tag:", "tags", "tag"], ["ev_", "events", "event"], ["t_", "teachers", "teacher"], ["e_", "exams", "exam"], ["q_", "questions", "question"], ["p_", "passages", "passage"], ["s_", "sources", "source"], ["m_", "mocks", "mock"], ["n_", "notes", "note"], ["j_", "", "job"]];
    const S = (v, n) => { const s = String(v == null ? "" : v); return n ? s.slice(0, n) : s; };
    const esc = (s) => TEXT.esc(s);
    const unesc = (s) => String(s == null ? "" : s).replace(/&quot;/g, '"').replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
    function kindOf(id) { const s = String(id == null ? "" : id); for (const [p, , k] of PREFIX) if (s.indexOf(p) === 0) return k; return ""; }
    function storeOf(id) { const s = String(id == null ? "" : id); for (const [p, st] of PREFIX) if (s.indexOf(p) === 0) return st; return ""; }
    function prefixOf(store) { for (const [p, st] of PREFIX) if (st === store) return p; return ""; }
    const anchorKey = (store, id) => String(store || "") + ":" + String(id || "");
    const parseAnchorKey = (key) => { const i = String(key || "").indexOf(":"); return i > 0 ? { store: key.slice(0, i), id: key.slice(i + 1) } : null; };
    const kindLabel = (k) => KIND_LABEL[k] || "메모";
    // 서명 — localStorage orun_oracle_author (설정 › 브레인 #sAuthor). 호출 시점에만 읽는다.
    function author() { try { return String(localStorage.getItem("orun_oracle_author") || "").trim().slice(0, 60); } catch (e) { return ""; } }
    function setAuthor(v) { try { localStorage.setItem("orun_oracle_author", String(v || "").trim().slice(0, 60)); } catch (e) {} }
    const authorOr = (a) => a === undefined || a === null ? author() : S(a, 60);
    // ---- 문법 ----
    const LINK_RE = /\[\[([^\[\]\n]{1,120}?)\]\]/g;
    const TAG_RE = /(^|[^\p{L}\p{N}_&;/\\])#([\p{L}\p{N}_-]{1,40})/gu;
    const normTag = (name) => String(name || "").replace(/-+$/, "").replace(/\s+/g, "").replace(/[A-Z]/g, c => c.toLowerCase());
    // parse(body) → { links: [{ text }], tags: [name] }  (중복 제거 · [[…]] 안의 # 은 태그가 아니다)
    function parse(body) {
      const links = [], tags = [], seenL = new Set(), seenT = new Set();
      const stripped = String(body == null ? "" : body).replace(LINK_RE, (m, t) => { const text = t.trim(); if (text && !seenL.has(text)) { seenL.add(text); links.push({ text }); } return " "; });
      stripped.replace(TAG_RE, (m, pre, name) => { const n = normTag(name); if (n && !seenT.has(n)) { seenT.add(n); tags.push(n); } return m; });
      return { links, tags };
    }
    // render(body, resolve) → html. resolve(text) → { id, title } | null. esc 먼저, 정규식은 그 뒤 (XSS).
    // 허용 태그: p a(data-link) span.tag b ul li blockquote br. 깨진 링크 = a.broken[data-text] (href 없음).
    function render(body, resolve) {
      const lines = esc(String(body == null ? "" : body).replace(/\r/g, "").replace(/\u0000/g, "")).split("\n");
      const out = []; let para = [], list = [], quote = [];
      const inline = (t) => {
        const ph = [];
        t = t.replace(LINK_RE, (m, title) => {
          const text = unesc(title.trim()); let r = null;
          try { r = typeof resolve === "function" ? resolve(text) : null; } catch (e) { r = null; }
          const html = r && r.id ? '<a class="wiki" data-link="' + esc(r.id) + '" href="#/n/' + esc(r.id) + '"' + (r.title && r.title !== text ? ' title="' + esc(r.title) + '"' : "") + '>' + esc(text) + '</a>'
                                 : '<a class="broken" data-link="" data-text="' + esc(text) + '" title="이 제목의 노트가 없어요">' + esc(text) + '</a>';
          ph.push(html); return "\u0000" + (ph.length - 1) + "\u0000";
        });
        t = t.replace(/\*\*([^*\n]+?)\*\*/g, "<b>$1</b>");
        t = t.replace(TAG_RE, (m, pre, name) => pre + '<span class="tag" data-tag="' + esc(normTag(name)) + '">#' + name + "</span>");
        return t.replace(/\u0000(\d+)\u0000/g, (m, i) => ph[+i]);
      };
      const flushP = () => { if (para.length) { out.push("<p>" + para.map(inline).join("<br>") + "</p>"); para = []; } };
      const flushL = () => { if (list.length) { out.push("<ul>" + list.map(l => "<li>" + inline(l) + "</li>").join("") + "</ul>"); list = []; } };
      const flushQ = () => { if (quote.length) { out.push("<blockquote>" + quote.map(inline).join("<br>") + "</blockquote>"); quote = []; } };
      lines.forEach(line => {
        if (!line.trim()) { flushP(); flushL(); flushQ(); return; }
        if (/^\s*- /.test(line)) { flushP(); flushQ(); list.push(line.replace(/^\s*- /, "")); return; }
        if (/^\s*&gt; ?/.test(line)) { flushP(); flushL(); quote.push(line.replace(/^\s*&gt; ?/, "")); return; }
        flushL(); flushQ(); para.push(line);
      });
      flushP(); flushL(); flushQ();
      return out.join("");
    }
    // excerpt(body, n=120) → 한 줄 발췌 (링크 · 굵게 · 목록 기호를 걷어 낸다)
    function excerpt(body, n) {
      n = n || 120;
      const t = String(body == null ? "" : body).replace(/\[\[([^\[\]\n]+?)\]\]/g, "$1").replace(/\*\*/g, "").replace(/^\s*(- |> )/gm, "").replace(/\s+/g, " ").trim();
      return t.length > n ? t.slice(0, n - 1) + "…" : t;
    }
    // titleOf(doc) — 노트 제목 규칙 (INDEX · LINKS 가 같은 규칙을 쓴다)
    function titleOf(doc) {
      if (!doc) return "";
      if (doc.kind === "ask") return "물어보기: " + (S((doc.ask && doc.ask.question) || doc.title || excerpt(doc.body, 40), 40) || "…");
      if (doc.title) return S(doc.title, 80);
      if (doc.orphanOf) return "(삭제된 " + S(doc.orphanOf.title || "노트", 40) + "에 붙어 있던 메모)";
      if (doc.kind === "daily") return "데일리 " + (doc.date || "");
      if (doc.kind === "weekly") return "주간 " + (doc.date || "");
      if (doc.kind === "anchor" && doc.anchor && doc.anchor.id) { const t = INDEX.get(doc.anchor.id); return "메모 · " + (t ? t.title : excerpt(doc.body, 40) || doc.anchor.id); }
      return excerpt(doc.body, 40) || "(빈 메모)";
    }
    // 파생 태그(저장하지 않음): 문항 type(#빈칸) · handoutHit(#프린트적중) · external(#외부지문) · difficulty(#난이도상/중/하) · 옛 tags[] · 프린트 #프린트
    function derivedTags(store, doc) {
      if (!doc) return [];
      const out = [];
      if (store === "questions") { if (doc.type) out.push(doc.type); if (doc.handoutHit) out.push("프린트적중"); if (doc.external) out.push("외부지문"); if (doc.difficulty) out.push("난이도" + doc.difficulty); (doc.tags || []).forEach(t => { const n = normTag(String(t).replace(/^#/, "")); if (n) out.push(n); }); }
      else if (store === "sources" && doc.kind === "프린트") out.push("프린트");
      else if (store === "passages" && doc.fromHandout) out.push("프린트");
      return [...new Set(out)];
    }
    // ---- 이벤트 · 링크 캐시 ----
    function logEvent(teacherId, kind, msg, ref) {
      try { if (typeof APP !== "undefined" && APP && typeof APP.log === "function") { APP.log(teacherId, kind, msg, ref); return; } } catch (e) {}
      DB.put("events", { id: uid("ev"), teacherId: teacherId || null, at: Date.now(), kind, msg: S(msg, 300), ref: ref || {} }).catch(() => {});
    }
    // hints: 자동완성에서 고른 {text, to} — 같은 제목이 둘일 때 사용자가 고른 그 문서를 가리키게 한다. 없으면 이전 캐시(prev).
    function resolveLinks(links, teacherId, prev, hints) {
      return links.map(l => {
        const hv = (hints || []).find(x => x && x.text === l.text && x.to);
        const c = (prev || []).find(x => x.text === l.text);
        const r = LINKS.resolve(l.text, teacherId, (hv && hv.to) || (c && c.to));
        if (!r) mayHaveBroken = true;
        return { text: l.text, to: r ? r.id : null };
      });
    }
    // relink() → n. 깨진 [[링크]] 중 이제 가리킬 노트가 생긴 것을 다시 잇는다 (본문은 그대로, links 캐시와 links 저장소만 고친다).
    // 명세 §3.2 가 안내하는 길 — 깨진 링크 → "이 제목으로 새 메모 만들기" — 이 끝나면 여기서 이어진다.
    let mayHaveBroken = true;      // 부팅 뒤 한 번은 훑는다. 깨진 링크가 하나도 없으면 다음부터 건너뛴다.
    async function relink() {
      if (!mayHaveBroken) return 0;
      let n = 0, broken = false;
      for (const d of await DB.all("notes")) {
        if (!d || d.deletedAt || !(d.links || []).some(l => !l.to)) continue;
        let hit = false;
        const next = d.links.map(l => { if (l.to) return l; const r = LINKS.resolve(l.text, d.teacherId); if (!r) { broken = true; return l; } hit = true; return { text: l.text, to: r.id }; });
        if (!hit) continue;
        d.links = next; d.updatedAt = Date.now();
        await DB.put("notes", d); await writeLinks(d); n++;
      }
      mayHaveBroken = broken;
      return n;
    }
    async function writeLinks(doc) {
      await LINKS.setUserLinks(doc.id, (doc.links || []).filter(l => l.to).map(l => ({ to: l.to, text: l.text, teacherId: doc.teacherId, author: doc.author })), "wiki");
    }
    // ---- 내 메모 (anchor) ----
    async function memo(key) {
      if (!key) return null;
      const list = (await DB.where("notes", "anchorKey", key)).filter(d => d.kind === "anchor" && !hidden(d));
      list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return list[0] || null;
    }
    // saveMemo({ anchorKey, teacherId, body, author }) → doc | null (빈 body 면 지운다)
    async function saveMemo(o) {
      const key = String(o && o.anchorKey || ""); const ak = parseAnchorKey(key); if (!ak) throw new Error("anchorKey 가 없어요");
      const cur = await memo(key);
      const body = String(o.body == null ? "" : o.body).replace(/\r/g, "");
      if (!body.trim()) { if (cur) await hardRemove(cur.id); return null; }
      const { links, tags } = parse(body);
      const target = INDEX.get(ak.id);
      const teacherId = o.teacherId !== undefined ? (o.teacherId === "*" ? null : o.teacherId) : (cur ? cur.teacherId : (target ? target.teacherId : null));
      const now = Date.now();
      const doc = Object.assign({}, cur || { id: uid("n"), createdAt: now, pinned: false, source: { kind: "editor" } },
        { teacherId: teacherId || null, kind: "anchor", anchorKey: key, anchor: { store: ak.store, id: ak.id }, orphanOf: null, title: "", body, tags, links: resolveLinks(links, teacherId, cur && cur.links, o.linkHints), date: null, ask: null,
          author: o.author !== undefined ? S(o.author, 60) : (cur ? cur.author : author()), updatedAt: now });
      await tagsApi.ensure(tags, doc.author);
      await DB.put("notes", doc);
      await writeLinks(doc);
      if (!cur) logEvent(doc.teacherId, "note", "메모 · " + (target ? target.title : key), { id: doc.id, anchorKey: key, noteId: doc.id });
      return doc;
    }
    // ---- 자유 메모 · 데일리 · 주간 · 질문 ----
    // create({ kind, title, body, teacherId, tags, date, source, ask, author }) → doc
    async function create(o) {
      o = o || {};
      const kind = KINDS.includes(o.kind) ? o.kind : "note";
      const body = String(o.body == null ? "" : o.body).replace(/\r/g, "");
      const parsed = parse(body);
      const tags = [...new Set(parsed.tags.concat((o.tags || []).map(t => normTag(String(t).replace(/^#/, ""))).filter(Boolean)))];
      const teacherId = o.teacherId && o.teacherId !== "*" ? o.teacherId : null;
      const now = Date.now();
      const doc = { id: o.id || uid("n"), teacherId, kind, anchorKey: "", anchor: null, orphanOf: null, title: S(o.title, 120).trim(), body, tags, links: resolveLinks(parsed.links, teacherId, null, o.linkHints), date: o.date || null, ask: o.ask || null,
        pinned: !!o.pinned, author: authorOr(o.author), source: o.source || { kind: kind === "ask" ? "ask" : "editor" }, createdAt: now, updatedAt: now };
      await tagsApi.ensure(tags, doc.author);
      await DB.put("notes", doc);
      await writeLinks(doc);
      if (kind !== "ask") logEvent(teacherId, "note", titleOf(doc), { id: doc.id, noteId: doc.id });
      return doc;
    }
    // update(id, patch) → doc. body 가 바뀌면 태그 · 링크 캐시를 다시 만든다.
    async function update(id, patch) {
      const cur = await DB.get("notes", id); if (!cur) throw new Error("그 노트는 없어요");
      patch = Object.assign({}, patch || {});
      const hints = patch.linkHints; delete patch.linkHints;       // 문서에는 남기지 않는다
      const doc = Object.assign({}, cur, patch, { id, updatedAt: Date.now() });
      if (patch.body !== undefined) {
        doc.body = String(patch.body == null ? "" : patch.body).replace(/\r/g, "");
        const parsed = parse(doc.body);
        doc.tags = [...new Set(parsed.tags.concat((patch.tags || []).map(t => normTag(String(t).replace(/^#/, ""))).filter(Boolean)))];
        doc.links = resolveLinks(parsed.links, doc.teacherId, cur.links, hints);
      } else if (patch.tags) doc.tags = [...new Set(patch.tags.map(t => normTag(String(t).replace(/^#/, ""))).filter(Boolean))];
      await tagsApi.ensure(doc.tags, doc.author);
      await DB.put("notes", doc);
      if (patch.body !== undefined) await writeLinks(doc);
      return doc;
    }
    // remove(id, { now }) → { undo(), id, done }. 5초 뒤 확정(하드 삭제 — 이 노트에서 나가는 사용자 링크도 함께). 그동안 pending(id) 가 true.
    // 유예는 메모리 타이머만으로는 탭과 함께 사라지므로, 지우는 순간 문서에 deletedAt 을 적어 둔다(소프트 삭제).
    // 그래서 5초 안에 새로 고쳐도 노트는 목록 · 검색 · 그래프에서 사라진 채이고, 다음 부팅의 sweepDeleted() 가 확정한다.
    const pending = new Map();
    const hidden = (d) => !d || pending.has(d.id) || !!d.deletedAt;
    // 한 노트의 표시 · 하드 삭제는 순서대로 — 되돌리기의 표시 지우기가 이미 지운 노트를 되살리지 않게
    const ops = new Map();
    function serial(id, fn) {
      const run = (ops.get(id) || Promise.resolve()).then(fn, fn);
      const tail = run.then(() => {}, () => {});
      ops.set(id, tail); tail.then(() => { if (ops.get(id) === tail) ops.delete(id); });
      return run;
    }
    async function mark(id, on) {
      const d = await DB.get("notes", id); if (!d) return null;
      if (on) d.deletedAt = Date.now(); else delete d.deletedAt;
      d.updatedAt = Date.now();
      await DB.put("notes", d);
      return d;
    }
    async function doHardRemove(id) {
      for (const l of LINKS.userLinks({ from: id })) { try { await LINKS.removeUser(l.id); } catch (e) {} }
      await DB.del("notes", id);
      return true;
    }
    function hardRemove(id) { const p = pending.get(id); if (p) clearTimeout(p.timer); pending.delete(id); return serial(id, () => doHardRemove(id)); }
    function remove(id, o) {
      if (o && o.now) return { id, undo: () => false, done: hardRemove(id) };
      if (pending.has(id)) clearTimeout(pending.get(id).timer);
      let fin;
      const done = new Promise(res => { fin = res; });
      serial(id, () => mark(id, true));
      const timer = setTimeout(() => { hardRemove(id).then(() => fin(true), () => fin(false)); }, 5000);
      pending.set(id, { timer, fin });
      return { id, done, undo: () => { const p = pending.get(id); if (!p) return false; clearTimeout(p.timer); pending.delete(id); serial(id, () => mark(id, false)); p.fin(false); return true; } };
    }
    // sweepDeleted() → n. 부팅 때 한 번: 지난 세션에서 확정되지 못한 삭제를 끝낸다.
    async function sweepDeleted() {
      let n = 0;
      for (const d of await DB.all("notes")) { if (d && d.deletedAt && !pending.has(d.id)) { try { await hardRemove(d.id); n++; } catch (e) {} } }
      return n;
    }
    const isPending = (id) => pending.has(id);
    const pendingIds = () => [...pending.keys()];
    // orphan(store, ids) → n. 원 문서가 지워지기 전에 부른다: anchor 메모를 지우지 않고 고아로 남긴다.
    async function orphan(store, ids) {
      let n = 0;
      for (const id of ids || []) {
        const list = await DB.where("notes", "anchorKey", anchorKey(store, id));
        if (!list.length) continue;
        let title = ""; const ix = INDEX.get(id); if (ix) title = ix.title; else { try { const d = await DB.get(store, id); if (d) title = INDEX.titleOf(store, d); } catch (e) {} }
        title = title || LINKS.title(id) || id;
        for (const d of list) {
          d.orphanOf = { store, id, title }; d.anchor = null; d.anchorKey = ""; d.title = "(삭제된 " + S(title, 40) + "에 붙어 있던 메모)"; d.updatedAt = Date.now();
          await DB.put("notes", d); n++;
        }
      }
      return n;
    }
    // migrateLegacy(questions, teachers) → n. 옛 note 필드(비어 있지 않은 것)를 n_legacy_<원id> anchor 노트로 한 번만 복사한다(멱등). 원 필드는 지우지 않는다.
    async function migrateLegacy(questions, teachers) {
      let n = 0;
      const items = (questions || []).map(q => ["questions", q]).concat((teachers || []).map(t => ["teachers", t]));
      for (const [store, d] of items) {
        const note = String(d && d.note || "").trim(); if (!note || !d.id) continue;
        const id = "n_legacy_" + d.id;
        if (await DB.get("notes", id)) continue;
        const key = anchorKey(store, d.id);
        if ((await DB.where("notes", "anchorKey", key)).length) continue;
        const { links, tags } = parse(note); const now = Date.now();
        const doc = { id, teacherId: store === "teachers" ? d.id : (d.teacherId || null), kind: "anchor", anchorKey: key, anchor: { store, id: d.id }, orphanOf: null, title: "", body: note, tags, links: links.map(l => ({ text: l.text, to: null })),
          date: null, ask: null, pinned: false, author: "legacy", source: { kind: "legacy" }, createdAt: d.createdAt || now, updatedAt: d.updatedAt || d.createdAt || now };
        await tagsApi.ensure(tags, "legacy");
        await DB.put("notes", doc); n++;
      }
      return n;
    }
    // detachTeacher(teacherId) → n. 선생님을 지울 때 그 선생님의 메모 · 링크 · 태그는 지우지 않고 teacherId:null 로 남긴다.
    async function detachTeacher(teacherId) {
      let n = 0;
      for (const store of ["notes", "links", "tags"]) {
        const list = await DB.where(store, "teacherId", teacherId);
        if (!list.length) continue;
        list.forEach(d => { d.teacherId = null; d.updatedAt = Date.now(); });
        await DB.putAll(store, list); n += list.length;
      }
      return n;
    }
    // ---- 데일리 · 빠른 메모 ----
    async function daily(date, teacherId) {
      const list = (await DB.where("notes", "date", date)).filter(d => d.kind === "daily" && !hidden(d) && (teacherId === undefined || teacherId === "*" ? true : (d.teacherId || null) === (teacherId || null)));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      return list[0] || null;
    }
    async function ensureDaily(date, teacherId) { return (await daily(date, teacherId)) || create({ kind: "daily", date, teacherId, title: "", body: "", source: { kind: "editor" } }); }
    async function weekly(date, teacherId) {
      const list = (await DB.where("notes", "date", date)).filter(d => d.kind === "weekly" && !hidden(d) && (teacherId === undefined || teacherId === "*" ? true : (d.teacherId || null) === (teacherId || null)));
      return list[0] || null;
    }
    // quick(text, teacherId, author) → doc (제목 = 첫 줄)
    function quick(text, teacherId, author, linkHints) {
      const body = String(text == null ? "" : text).replace(/\r/g, "").trim();
      const first = excerpt(body.split("\n")[0], 60);
      return create({ kind: "note", title: first, body, teacherId, author, linkHints, source: { kind: "quick" } });
    }
    // list({ teacherId, kind, limit }) → doc[] (수정 역순, 삭제 대기 제외)
    async function list(o) {
      o = o || {};
      let docs = o.kind ? await DB.where("notes", "kind", o.kind) : await DB.all("notes");
      if (o.teacherId && o.teacherId !== "*") docs = docs.filter(d => d.teacherId === o.teacherId);
      docs = docs.filter(d => !hidden(d));
      docs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return o.limit ? docs.slice(0, o.limit) : docs;
    }
    // ---- 태그 ----
    const tagCache = new Map();   // id → doc  (tags 저장소 캐시 — DB.onWrite 로 따라온다)
    const tagId = (name) => "tag:" + normTag(String(name || "").replace(/^#/, ""));
    const inScope = (d, tid) => !tid || tid === "*" || !d.teacherId || d.teacherId === tid;
    const tagsApi = {
      normalize: (name) => normTag(String(name || "").replace(/^#/, "")),
      load(docs) { tagCache.clear(); (docs || []).forEach(d => { if (d && d.id) tagCache.set(d.id, d); }); return tagCache.size; },
      get(name) { return tagCache.get(tagId(name)) || null; },
      // ensure(names, author) → 새로 만든 수
      async ensure(names, author) {
        let n = 0;
        for (const raw of names || []) {
          const name = normTag(String(raw || "").replace(/^#/, "")); if (!name) continue;
          const id = "tag:" + name; if (tagCache.has(id)) continue;
          // 캐시가 비어 있을 수 있다(부팅 직후 · 작업공간 전환). 저장소를 한 번 더 보고, 있으면 색 · 설명 · 고정을 덮지 않는다.
          let old = null; try { old = await DB.get("tags", id); } catch (e) {}
          if (old) { tagCache.set(id, old); continue; }
          const now = Date.now();
          const doc = { id, teacherId: null, name, color: "", desc: "", pinned: false, author: authorOr(author), createdAt: now, updatedAt: now };
          tagCache.set(id, doc); await DB.put("tags", doc); n++;
        }
        return n;
      },
      // list(teacherId) → [{ id, name, count, color, desc, pinned }] — 카운트는 색인에서 센다(사용자 태그만)
      list(teacherId) {
        const counts = new Map();
        INDEX.docs().forEach(d => { if (!inScope(d, teacherId)) return; (d.userTags || []).forEach(t => counts.set(t, (counts.get(t) || 0) + 1)); });
        const names = new Set([...counts.keys()]); tagCache.forEach(d => names.add(d.name));
        return [...names].map(name => { const d = tagCache.get("tag:" + name) || {}; return { id: "tag:" + name, name, count: counts.get(name) || 0, color: d.color || "", desc: d.desc || "", pinned: !!d.pinned }; })
          .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
      },
      // docsWith(name, teacherId) → 색인 문서 id 들 (그 태그가 붙은 노트)
      docsWith(name, teacherId) { const n = normTag(String(name || "").replace(/^#/, "")); const out = []; INDEX.docs().forEach(d => { if (inScope(d, teacherId) && (d.userTags || []).includes(n)) out.push(d.id); }); return out; },
      async update(name, patch) {
        const id = tagId(name);
        let cur = tagCache.get(id);
        if (!cur) { try { cur = await DB.get("tags", id); } catch (e) {} }           // 캐시가 비어 있어도 있던 색 · 설명을 지우지 않는다
        cur = cur || { id, teacherId: null, name: normTag(String(name || "").replace(/^#/, "")), color: "", desc: "", pinned: false, author: author(), createdAt: Date.now() };
        const doc = Object.assign({}, cur, patch || {}, { id, name: cur.name, updatedAt: Date.now() });
        tagCache.set(id, doc); await DB.put("tags", doc); return doc;
      },
      // rename(a, b) → 바뀐 노트 수. 본문의 #a 를 #b 로 바꾼다(태그의 진실은 본문).
      async rename(a, b) {
        const from = normTag(String(a || "").replace(/^#/, "")), to = normTag(String(b || "").replace(/^#/, "")); if (!from || !to || from === to) return 0;
        const re = new RegExp("(^|[^\\p{L}\\p{N}_&;/\\\\])#" + from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![\\p{L}\\p{N}_-])", "gu");
        let n = 0;
        for (const d of await DB.all("notes")) {
          if (!(d.tags || []).includes(from)) continue;
          const body = String(d.body || "").replace(re, "$1#" + to);
          const parsed = parse(body);
          d.body = body; d.tags = [...new Set(parsed.tags.concat((d.tags || []).filter(t => t !== from)))]; d.updatedAt = Date.now();
          await DB.put("notes", d); n++;
        }
        const old = tagCache.get("tag:" + from);
        await tagsApi.ensure([to], old ? old.author : undefined);
        if (old) { if (old.color || old.desc) await tagsApi.update(to, { color: old.color, desc: old.desc, pinned: old.pinned }); tagCache.delete(old.id); await DB.del("tags", old.id); }
        return n;
      },
      // remove(name) → 바뀐 노트 수. 본문에서 #name 을 걷어 내고 태그 문서를 지운다.
      async remove(name) {
        const t = normTag(String(name || "").replace(/^#/, "")); if (!t) return 0;
        const re = new RegExp("(^|[^\\p{L}\\p{N}_&;/\\\\])#" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![\\p{L}\\p{N}_-])", "gu");
        let n = 0;
        for (const d of await DB.all("notes")) {
          if (!(d.tags || []).includes(t)) continue;
          d.body = String(d.body || "").replace(re, "$1").replace(/[ \t]{2,}/g, " ").replace(/[ \t]+$/gm, ""); d.tags = (d.tags || []).filter(x => x !== t); d.updatedAt = Date.now();
          await DB.put("notes", d); n++;
        }
        tagCache.delete("tag:" + t); await DB.del("tags", "tag:" + t);
        return n;
      },
      cache: () => tagCache,
    };
    // ---- DB 쓰기 훅 (있을 때만) — 태그 캐시를 따라가게 한다 (silent 포함: bootstrap 으로 온 태그도 캐시에) ----
    function onDbWrite(ev) {
      if (!ev || ev.store !== "tags") return;
      if (ev.op === "put") (ev.docs || []).forEach(d => { if (d && d.id) tagCache.set(d.id, d); });
      else if (ev.op === "del") (ev.keys || []).forEach(k => tagCache.delete(k));
      else if (ev.op === "clear") tagCache.clear();
    }
    if (typeof DB !== "undefined" && DB && typeof DB.onWrite === "function") DB.onWrite(onDbWrite);
    return { KIND, KINDS, KIND_LABEL, kindOf, storeOf, prefixOf, anchorKey, parseAnchorKey, kindLabel, author, setAuthor, parse, render, excerpt, titleOf, derivedTags, normTag,
             memo, saveMemo, create, update, remove, relink, sweepDeleted, pending: isPending, pendingIds, hidden, orphan, migrateLegacy, detachTeacher, daily, ensureDaily, weekly, quick, list, tags: tagsApi };
  })();
