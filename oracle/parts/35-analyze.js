  // ==================================================================
  //  ANALYZE — 기출 시험지 → 문항 데이터 · 범위 원문 → 지문 색인 · 문항↔지문 매칭 · AI 활용 추정
  // ==================================================================
  const ANALYZE = (function () {
    const BUDGET = 58 * 1024;          // 프롬프트 바이트 상한
    const CHUNK_CHARS = 12000;         // 시험지 청크 (문항 경계)
    const TYPES = "주제|제목|요지|주장|목적|심경|분위기|빈칸|어법|어휘|순서|삽입|무관한문장|함축의미|요약문|내용일치|내용불일치|지칭추론|세부정보|연결어|영영풀이|도표|안내문|서술형|기타".split("|");
    const FORMATS = ["5지선다", "복수정답", "서술형", "단답형", "OX"];
    const DIFFS = ["상", "중", "하"];
    const clamp01 = (x) => Math.max(0, Math.min(1, +x || 0));
    const str = (v, n) => String(v == null ? "" : v).slice(0, n || 400);
    const arr = (v) => Array.isArray(v) ? v : [];
    const isSubj = (q) => q.type === "서술형" || q.format === "서술형" || q.format === "단답형" || /^서술형/.test(q.number || "");

    // ---- 문항 레코드 정리 ----
    function normalizeQuestion(raw, ctx) {
      const q = {};
      q.number = TEXT.canonNo(str(raw.number, 20));
      if (!q.number) return null;
      q.type = TYPES.includes(raw.type) ? raw.type : (/^서술형/.test(q.number) ? "서술형" : "기타");
      q.subtype = str(raw.subtype, 40);
      q.format = FORMATS.includes(raw.format) ? raw.format : (q.type === "서술형" ? "서술형" : "5지선다");
      if (q.type === "서술형" && q.format !== "단답형") q.format = "서술형";
      if (q.format === "서술형" && q.type !== "서술형" && !q.subtype) { q.subtype = q.type; q.type = "서술형"; }
      q.points = raw.points === null || raw.points === undefined || raw.points === "" || isNaN(+raw.points) ? null : +raw.points;
      q.pointsPrinted = !!raw.points_printed && q.points !== null;
      if (q.points === null && ctx.block) { const p = TEXT.parsePoints(ctx.block); if (p !== null) { q.points = p; q.pointsPrinted = true; } }
      q.difficulty = DIFFS.includes(raw.difficulty) ? raw.difficulty : "중";
      q.difficultyReason = str(raw.difficulty_reason, 200);
      q.stem = str(raw.stem, 240).trim();
      q.stemTemplate = TEXT.templateOf(q.stem);
      q.options = arr(raw.options).slice(0, 5).map((o, i) => ({ label: str(o && o.label, 4) || TEXT.CIRC[i], text: str(o && o.text, 120) }));
      if (q.format === "5지선다" && q.options.length && q.options.length < 5) { while (q.options.length < 5) q.options.push({ label: TEXT.CIRC[q.options.length], text: "" }); q.optionsIncomplete = true; }
      q.answer = str(raw.answer, 200).trim();
      q.answerSource = q.answer ? (raw.answer_source === "printed" ? "printed" : "printed") : "none";
      if (!q.answer && ctx.answerKey && ctx.answerKey[q.number]) { q.answer = ctx.answerKey[q.number]; q.answerSource = "printed"; }
      const p = raw.passage || {};
      q.passage = { has: p.has !== false && !!(p.first10 || p.has), lang: ["en", "ko", "mixed"].includes(p.lang) ? p.lang : "en",
        first10: str(p.first10, 200).replace(/[“”"]/g, "").split(/\s+/).slice(0, 14).join(" ").trim(), last6: str(p.last6, 120).replace(/[“”"]/g, "").trim(),
        words: +p.words || 0, scale: ["보통", "2배", "3배 이상"].includes(p.scale) ? p.scale : "보통" };
      q.set = str(raw.set, 12).trim(); q.setRole = ["first", "member"].includes(raw.set_role) ? raw.set_role : (q.set ? "member" : "");
      const t = raw.transformation || {};
      q.transformation = { technique: str(t.technique, 20), blankPosition: str(t.blank_position, 10), blankUnit: str(t.blank_unit, 6),
        grammarPoints: arr(t.grammar_points).map(x => str(x, 12)).filter(Boolean).slice(0, 8), grammarCount: +t.grammar_count || 0,
        orderSplit: str(t.order_split, 12), insertPosition: str(t.insert_position, 6), underlineCount: +t.underline_count || 0,
        vocabSwap: str(t.vocab_swap, 10), summaryBlanks: +t.summary_blanks || 0 };
      const d = raw.distractor || {};
      q.distractor = { style: arr(d.style).map(x => str(x, 12)).slice(0, 4), parallel: !!d.parallel, lang: ["en", "ko", "mixed"].includes(d.lang) ? d.lang : "en",
        lengths: arr(d.lengths).map(x => +x || 0).slice(0, 5) };
      q.external = raw.external === true ? true : raw.external === false ? false : null;
      q.externalReason = str(raw.external_reason, 120);
      const k = raw.ko_stem || {};
      q.koStem = { ending: str(k.ending, 10), honorific: str(k.honorific, 6), bracketPoints: !!k.bracket_points, kiceLike: clamp01(k.kice_like === undefined ? 0.5 : k.kice_like) };
      q.subjective = isSubj(q) ? { conditions: arr(raw.subjective && raw.subjective.conditions).map(x => str(x, 160)).slice(0, 6), answerLen: str(raw.subjective && raw.subjective.answer_len, 80), rubricPrinted: !!(raw.subjective && raw.subjective.rubric_printed) } : null;
      q.features = str(raw.features, 200);
      q.confidence = clamp01(raw.confidence === undefined ? 0.7 : raw.confidence);
      q.rawBlock = ctx.block ? ctx.block.slice(0, 6000) : "";
      q.local = localSignals(q);
      q.match = { passageId: null, sourceId: null, method: "none", score: 0, confidence: 0, fidelity: null, reason: "", altered: "" };
      return q;
    }
    const GPT_LEX = /\b(delve|tapestry|underscor\w*|crucial|foster\w*|navigat\w*|landscape|multifaceted|pivotal|showcas\w*|testament|realm|intricate|vibrant|harness\w*|leverag\w*|resonat\w*|nuanced|embark\w*|insights?|holistic|robust|seamless\w*)\b/gi;
    function cv(xs) { if (xs.length < 2) return null; const m = xs.reduce((a, b) => a + b, 0) / xs.length; if (!m) return null; const sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) * (b - m), 0) / xs.length); return sd / m; }
    function localSignals(q) {
      const texts = q.options.map(o => o.text).filter(t => t && t.length > 1);
      const lens = texts.map(t => t.length);
      const cls = (t) => /^to\s+\w/i.test(t) ? "toV" : /^\w+ing\b/i.test(t) ? "Ving" : /^(the|a|an)\s/i.test(t) ? "det" : /[가-힣]/.test(t) ? "ko" : "other";
      const classes = texts.map(cls);
      const punct = texts.map(t => (/[.!?]$/.test(t) ? "p" : "n") + (/^[A-Z]/.test(t) ? "U" : "l"));
      const en = texts.join(" ") + " " + (q.subjective ? q.subjective.conditions.join(" ") : "");
      return { optLenCv: lens.length >= 4 ? cv(lens) : null, sameClass: classes.length >= 4 && classes.every(c => c === classes[0]) && classes[0] !== "ko",
        punctConsistent: punct.length >= 4 && punct.every(p => p === punct[0]), gptLexHits: (en.match(GPT_LEX) || []).length,
        mdArtifacts: (en.match(/\*\*|###|^- /gm) || []).length, emdash: (en.match(/—/g) || []).length, words: TEXT.words(en).length };
    }

    // ---- 기출 시험지 → 문항 ----
    // dataizeExam(text, { name, teacher, onStep({phase,i,n}), signal }) → { info, questions, meta, chunks }
    async function dataizeExam(text, o) {
      o = o || {};
      const normText = TEXT.normalizeExam(text);
      const sp = TEXT.splitByQuestion(normText);
      const answerKey = TEXT.parseAnswerKey(sp.answerKeyText);
      const byNo = {}; sp.blocks.forEach(b => { byNo[b.number] = b; });
      let chunks;
      if (sp.blocks.length >= 3) {
        chunks = TEXT.chunkByQuestions(sp.blocks, CHUNK_CHARS);
        if (sp.head && sp.head.trim()) chunks[0].text = sp.head.trim().slice(0, 1500) + "\n\n" + chunks[0].text;
      } else {
        chunks = TEXT.chunkText(normText, 40000).map(t => ({ text: t, numbers: [] }));
      }
      // 바이트 안전망
      chunks = chunks.flatMap(c => TEXT.bytesOf(c.text) > BUDGET - 4096 ? TEXT.chunkText(c.text, BUDGET - 6000).map(t => ({ text: t, numbers: c.numbers })) : [c]);
      let info = null; const raws = []; const seen = new Set(); let prevNumbers = [];
      const validate = (v) => (v && Array.isArray(v.questions)) ? "" : "questions 배열이 없습니다";
      for (let i = 0; i < chunks.length; i++) {
        if (o.signal && o.signal.aborted) throw API.err("cancelled", "중단됨");
        if (o.onStep) o.onStep({ phase: "analyze", i: i + 1, n: chunks.length });
        const c = chunks[i];
        let carry = "";
        if (i > 0 && c.numbers.length && byNo[c.numbers[0]] && byNo[c.numbers[0]].setId && chunks[i - 1].numbers.length) {
          const prevLast = byNo[chunks[i - 1].numbers[chunks[i - 1].numbers.length - 1]];
          if (prevLast && prevLast.setId === byNo[c.numbers[0]].setId) carry = prevLast.text.slice(0, 600);
        }
        const prompt = PROMPTS.dataize(c.text, { i: i + 1, n: chunks.length, numbers: c.numbers, prevNumbers, carry });
        let r = await API.json(prompt, { light: true, tier: "complex", effort: "medium", signal: o.signal, validate, onText: o.onText });
        if ((!r.questions || !r.questions.length) && c.numbers.length) {   // 빈 결과 — 주 모델로 한 번 더
          r = await API.json(prompt, { tier: "complex", effort: "high", signal: o.signal, validate });
        }
        if (!info && r.exam_info) info = r.exam_info;
        for (const q of r.questions) { const n = TEXT.canonNo(q && q.number); if (!n || seen.has(n)) { if (n) { const prev = raws.find(x => TEXT.canonNo(x.number) === n); if (prev && str(q.stem).length > str(prev.stem).length) Object.assign(prev, q); } continue; } q.number = n; seen.add(n); raws.push(q); }
        prevNumbers = prevNumbers.concat(c.numbers);
      }
      // 누락 보정 — 정규식이 잡은 번호가 결과에 없으면 그 블록만 다시
      const missing = sp.numbers.filter(n => !seen.has(n) && byNo[n]).slice(0, 6);
      for (const n of missing) {
        if (o.signal && o.signal.aborted) throw API.err("cancelled", "중단됨");
        if (o.onStep) o.onStep({ phase: "analyze", i: chunks.length, n: chunks.length, detail: n + "번 보정" });
        try {
          const r = await API.json(PROMPTS.dataize(byNo[n].text, { i: 1, n: 1, numbers: [n], prevNumbers: [], carry: "" }), { light: true, tier: "default", effort: "low", signal: o.signal, validate, retries: 0 });
          for (const q of r.questions) { const m = TEXT.canonNo(q && q.number); if (m && !seen.has(m)) { q.number = m; seen.add(m); raws.push(q); } }
        } catch (e) { if (e.code === "cancelled") throw e; }
      }
      const questions = [];
      raws.forEach(raw => { const n = TEXT.canonNo(raw.number); const q = normalizeQuestion(raw, { block: byNo[n] ? byNo[n].text : "", answerKey }); if (q) questions.push(q); });
      // 순서: 번호(숫자) → 서술형
      const key = (q) => /^서술형/.test(q.number) ? 1000 + (+q.number.replace(/\D/g, "") || 0) : (+q.number.replace(/\D/g, "") || 999);
      questions.sort((a, b) => key(a) - key(b));
      questions.forEach((q, i) => { q.order = i + 1; });
      // 세트: first 가 없으면 세트의 첫 문항을 first 로
      const sets = {}; questions.forEach(q => { if (q.set) (sets[q.set] = sets[q.set] || []).push(q); });
      Object.values(sets).forEach(g => { if (!g.some(q => q.setRole === "first")) { g[0].setRole = "first"; if (!g[0].passage.has) g[0].passage.has = true; } g.forEach(q => { if (q.setRole !== "first") { q.setRole = "member"; } }); });
      const inf = info || {};
      const objective = questions.filter(q => !isSubj(q)).length, subjective = questions.length - objective;
      const pts = questions.reduce((a, q) => a + (q.points || 0), 0);
      return {
        info: { title: str(inf.title, 80), year: +inf.year || null, semester: [1, 2].includes(+inf.semester) ? +inf.semester : null, term: str(inf.term, 10), grade: str(inf.grade, 6), subject: str(inf.subject, 20),
                total: questions.length, objective, subjective, points: +inf.total_points || (pts > 0 ? Math.round(pts) : null), hasExplanations: !!inf.has_explanations, summary: str(inf.summary, 400) },
        questions, answerKeyText: sp.answerKeyText, gaps: sp.numbers.filter(n => !seen.has(n)),
      };
    }

    // ---- 범위 원문 → 지문 ----
    function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
    function locate(chunk, first, last) {
      const fw = String(first || "").split(/\s+/).filter(Boolean), lw = String(last || "").split(/\s+/).filter(Boolean);
      const tryFind = (ws, from) => {
        for (const n of [ws.length, 6, 4]) {
          const sub = ws.slice(0, n); if (sub.length < 3) break;
          const re = new RegExp(sub.map(w => escapeRe(w.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "")).replace(/\\\./g, "\\.?")).filter(Boolean).join("[^A-Za-z0-9]+"), "i");
          const m = re.exec(chunk.slice(from)); if (m) return { at: from + m.index, len: m[0].length };
        }
        return null;
      };
      const a = tryFind(fw, 0); if (!a) return null;
      const b = tryFind(lw.length ? lw : [], a.at + a.len);
      const end = b ? b.at + b.len : Math.min(chunk.length, a.at + 2400);
      // 마지막 문구를 못 찾으면 첫 문구부터 다음 빈 줄까지
      const text = b ? chunk.slice(a.at, end) : chunk.slice(a.at).split(/\n{2,}/)[0];
      return text.replace(/\s+/g, " ").trim();
    }
    // indexScope(text, { name, onStep, signal }) → passages[] (id 는 호출자가 붙인다)
    async function indexScope(text, o) {
      o = o || {};
      const chunks = TEXT.chunkText(text, BUDGET - 2500);
      const out = [];
      for (let i = 0; i < chunks.length; i++) {
        if (o.signal && o.signal.aborted) throw API.err("cancelled", "중단됨");
        if (o.onStep) o.onStep({ phase: "index", i: i + 1, n: chunks.length });
        const list = await API.json(PROMPTS.index(o.name || "자료", chunks[i], i + 1, chunks.length), { light: true, array: true, tier: "default", effort: "low", signal: o.signal,
          validate: v => Array.isArray(v) ? "" : "배열이 아닙니다" });
        for (const e of list) {
          if (!e || !e.first) continue;
          const kind = ["지문", "어휘", "문법", "기타"].includes(e.kind) ? e.kind : "기타";
          const full = kind === "지문" ? locate(chunks[i], e.first, e.last) : null;
          const txt = full || str(e.first, 200);
          const sentences = kind === "지문" ? TEXT.splitSentences(txt) : [];
          out.push({ kind, src: str(e.src, 60), lessonKey: str(e.lesson_key, 10) || lessonFrom(e.src), genre: str(e.genre, 10), first: str(e.first, 200), last: str(e.last, 120), gist: str(e.gist, 160),
            words: kind === "지문" ? TEXT.words(txt).length : (+e.words || 0), feats: arr(e.feats).map(x => str(x, 12)).slice(0, 6), text: txt, located: !!full, sentences,
            topicIdx: Number.isInteger(+e.topic_idx) ? +e.topic_idx : -1, blankCandidates: arr(e.blank_candidates).map(x => +x).filter(Number.isInteger).slice(0, 3),
            grammarTargets: arr(e.grammar_targets).map(g => ({ point: str(g && g.point, 12), sent: +(g && g.sent) || 0 })).filter(g => g.point).slice(0, 5),
            orderFriendly: !!e.order_friendly, insertFriendly: !!e.insert_friendly, difficultyEst: DIFFS.includes(e.difficulty_est) ? e.difficulty_est : "중" });
        }
      }
      out.forEach((p, i) => { p.order = i + 1; p.posRatio = out.length > 1 ? i / (out.length - 1) : 0.5; });
      return out;
    }
    // 프린트(학습지) → 지문 + 포인트
    async function indexHandout(text, o) {
      o = o || {};
      const chunks = TEXT.chunkText(text, BUDGET - 2500);
      const passages = [], items = [];
      for (let i = 0; i < chunks.length; i++) {
        if (o.signal && o.signal.aborted) throw API.err("cancelled", "중단됨");
        if (o.onStep) o.onStep({ phase: "index", i: i + 1, n: chunks.length });
        const r = await API.json(PROMPTS.indexHandout(o.name || "프린트", chunks[i], i + 1, chunks.length), { light: true, tier: "default", effort: "low", signal: o.signal, validate: v => v && (Array.isArray(v.passages) || Array.isArray(v.items)) ? "" : "passages/items 없음" });
        for (const e of arr(r.passages)) {
          if (!e || !e.first) continue;
          const full = locate(chunks[i], e.first, e.last); const txt = full || str(e.first, 200);
          passages.push({ kind: "지문", src: str(e.src, 60), lessonKey: lessonFrom(e.src), genre: str(e.genre, 10) || "기타", first: str(e.first, 200), last: str(e.last, 120), gist: str(e.gist, 160), words: TEXT.words(txt).length, feats: arr(e.feats).map(x => str(x, 12)).slice(0, 6), text: txt, located: !!full, sentences: TEXT.splitSentences(txt),
            topicIdx: Number.isInteger(+e.topic_idx) ? +e.topic_idx : -1, blankCandidates: arr(e.blank_candidates).map(x => +x).filter(Number.isInteger).slice(0, 3), grammarTargets: arr(e.grammar_targets).map(g => ({ point: str(g && g.point, 12), sent: +(g && g.sent) || 0 })).filter(g => g.point).slice(0, 5), orderFriendly: false, insertFriendly: false, difficultyEst: "중", fromHandout: true });
        }
        for (const it of arr(r.items)) {
          if (!it || !it.text) continue;
          const kind = ["어법", "어휘", "예상문제", "정리"].includes(it.kind) ? it.kind : "정리";
          items.push({ kind, text: str(it.text, 160), point: str(it.point, 12), stem: str(it.stem, 160), stemTemplate: it.stem ? TEXT.templateOf(it.stem) : "", words: arr(it.words).map(w => TEXT.norm(w)).filter(Boolean).slice(0, 12) });
        }
      }
      passages.forEach((p, i) => { p.order = i + 1; p.posRatio = passages.length > 1 ? i / (passages.length - 1) : 0.5; });
      return { passages, items: items.slice(0, 200) };
    }
    // 프린트 반영율 — 시험 문항 하나하나가 프린트의 어떤 것에서 왔나 (결정적)
    // reflection({ questions, handouts:[{source, passages, items}], passagesById }) → { rate, n, hits, byHandout }
    function reflection(o) {
      const qs = (o.questions || []).filter(q => q.setRole !== "member" || true);
      const hs = o.handouts || [];
      if (!qs.length || !hs.length) return null;
      // 프린트 지문 셔글 (교과서 지문을 다시 실은 것과 맞추기 위해 원문끼리도 본다)
      const hp = hs.flatMap(h => h.passages.map(p => ({ h, p, s6: TEXT.shingles(p.text, 6) })));
      const scopeCache = {};
      const passageHit = (q) => {
        const pid = q.match && q.match.passageId; const en = TEXT.englishOnly(q.rawBlock || "");
        const q6 = TEXT.words(en).length >= 12 ? TEXT.shingles(en, 6) : null;
        for (const e of hp) {
          if (pid && e.p.id === pid) return e.h;                                      // 프린트 지문에 직접 매칭
          if (pid && o.passagesById && o.passagesById[pid]) {                           // 범위 지문에 매칭됐지만 프린트에도 같은 지문이 실림
            const k = pid + ":" + e.p.id;
            if (scopeCache[k] === undefined) scopeCache[k] = TEXT.containment(TEXT.shingles(o.passagesById[pid].text, 6), e.s6);
            if (scopeCache[k] >= 0.5) return e.h;
          }
          if (q6 && TEXT.containment(q6, e.s6) >= 0.45) return e.h;                    // 매칭 없이도 문항 지문이 프린트 지문과 겹침
        }
        return null;
      };
      const hits = []; const byH = {}; hs.forEach(h => { byH[h.source.id] = { source: h.source, hit: 0, passages: 0, items: 0, itemHits: [] }; });
      qs.forEach(q => {
        const kinds = [], srcs = new Set();
        const ph = passageHit(q); if (ph) { kinds.push("지문"); srcs.add(ph.source.id); byH[ph.source.id].passages++; }
        if (q.type === "어법" && q.transformation.grammarPoints.length) hs.forEach(h => h.items.forEach((it, i) => { if (it.kind === "어법" && it.point && q.transformation.grammarPoints.includes(it.point) && !kinds.includes("어법")) { kinds.push("어법"); srcs.add(h.source.id); byH[h.source.id].itemHits.push({ i, q: q.number }); } }));
        hs.forEach(h => h.items.forEach((it, i) => { if (it.kind === "예상문제" && it.stemTemplate && it.stemTemplate === q.stemTemplate && q.stemTemplate.length > 8 && !kinds.includes("예상문제")) { kinds.push("예상문제"); srcs.add(h.source.id); byH[h.source.id].itemHits.push({ i, q: q.number }); } }));
        if (q.type === "어휘" || q.type === "빈칸") { const opt = TEXT.norm(q.options.map(x => x.text).join(" ")); hs.forEach(h => h.items.forEach((it, i) => { if (it.kind === "어휘" && it.words.some(w => w.length > 3 && opt.includes(w)) && !kinds.includes("어휘")) { kinds.push("어휘"); srcs.add(h.source.id); byH[h.source.id].itemHits.push({ i, q: q.number }); } })); }
        if (kinds.length) { hits.push({ questionId: q.id, number: q.number, kinds, sourceIds: [...srcs] }); srcs.forEach(id => { byH[id].hit++; }); }
      });
      const byHandout = {}; Object.keys(byH).forEach(id => { const b = byH[id]; byHandout[id] = { hit: b.hit, passages: b.passages, itemHits: b.itemHits, rate: +(b.hit / qs.length).toFixed(3) }; });
      return { rate: +(hits.length / qs.length).toFixed(3), n: qs.length, hits, byHandout, kinds: hits.reduce((m, h) => { h.kinds.forEach(k => { m[k] = (m[k] || 0) + 1; }); return m; }, {}) };
    }
    function lessonFrom(src) { const m = /L(?:esson)?\s*(\d+)|(\d+)\s*과|Unit\s*(\d+)/i.exec(src || ""); return m ? "L" + (m[1] || m[2] || m[3]) : ""; }

    // ---- 문항 ↔ 지문 매칭 (로컬 셔글 → 미확정만 LLM) ----
    function passageIndex(passages) {
      return passages.filter(p => p.kind === "지문" && p.text).map(p => ({ p, n: TEXT.norm(p.text), s8: TEXT.shingles(p.text, 8), s5: TEXT.shingles(p.text, 5) }));
    }
    function scoreLocal(q, idx) {
      const en = TEXT.englishOnly(q.rawBlock || "");
      if (TEXT.words(en).length < 12 && !(q.passage && q.passage.first10)) return [];
      const q8 = TEXT.shingles(en, 8), q5 = TEXT.shingles(en, 5);
      const f = TEXT.norm(q.passage && q.passage.first10 || "");
      return idx.map(e => {
        const first = f && f.split(" ").length >= 5 && e.n.includes(f) ? 1 : 0;
        const c8 = TEXT.containment(q8, e.s8), c5 = TEXT.containment(q5, e.s5);
        return { id: e.p.id, first, c8, c5, score: Math.max(first, 0.7 * c8 + 0.3 * c5) };
      }).sort((a, b) => b.score - a.score);
    }
    // 매칭 확정 뒤 문장 단위 변형·충실도
    function fidelity(q, p) {
      if (!p || !p.sentences || !p.sentences.length) return { fidelity: null, changed: [] };
      const en = TEXT.englishOnly(q.rawBlock || ""); if (TEXT.words(en).length < 10) return { fidelity: null, changed: [] };
      const q6 = TEXT.shingles(en, 6);
      const changed = [], intactIdx = []; let intact = 0, intactSum = 0;
      p.sentences.forEach((s, i) => {
        const ss = TEXT.shingles(s, 6); if (!ss.size) return;
        const present = TEXT.containment(ss, q6);
        if (present >= 0.8) { intact++; intactSum += present; intactIdx.push(i); }
        else changed.push({ idx: i, kind: present >= 0.3 ? "blank" : "removed", present: +present.toFixed(2) });
      });
      return { fidelity: intact ? +(intactSum / intact).toFixed(3) : null, changed, intact, intactIdx, total: p.sentences.length };
    }
    // matchQuestions(questions, passages, { complete, signal, onStep }) — questions 를 제자리에서 고친다
    async function matchQuestions(questions, passages, o) {
      o = o || {};
      const idx = passageIndex(passages);
      if (!idx.length) return { matched: 0, llm: 0 };
      const byId = {}; passages.forEach(p => { byId[p.id] = p; });
      const pending = [];
      for (const q of questions) {
        if (!q.passage || !q.passage.has || q.setRole === "member") continue;
        if (q.match && q.match.method === "user") continue;
        const ranked = scoreLocal(q, idx);
        const top = ranked[0], second = ranked[1];
        if (top && (top.first === 1 || (top.score >= 0.35 && (!second || top.score - second.score >= 0.15)))) {
          setMatch(q, byId[top.id], { method: "local", score: top.score, confidence: Math.min(1, 0.6 + top.score / 2), reason: top.first ? "첫 문구 일치" : "문장 겹침 " + Math.round(top.score * 100) + "%" });
        } else if (top && top.score < 0.08 && o.complete) {
          q.match = { passageId: null, sourceId: null, method: "none", score: top.score, confidence: 0.6, fidelity: null, reason: "범위 자료 어디에도 겹치는 문장 없음", altered: "" }; q.external = true;
        } else pending.push({ q, cands: ranked.slice(0, 5).filter(c => c.score > 0.02) });
      }
      let llm = 0;
      if (pending.length && API.ready()) {
        for (let i = 0; i < pending.length; i += 12) {
          if (o.signal && o.signal.aborted) throw API.err("cancelled", "중단됨");
          if (o.onStep) o.onStep({ phase: "match", i: i + 1, n: pending.length });
          const batch = pending.slice(i, i + 12);
          const candLines = batch.map(b => b.q.number + ": " + (b.cands.length ? b.cands.map(c => c.id + "(" + c.score.toFixed(2) + ")").join(" ") : "(후보 없음 — 목록 전체에서 찾기)")).join("\n");
          const candIds = new Set(batch.flatMap(b => b.cands.map(c => c.id)));
          let cat = passages.filter(p => p.kind === "지문");
          if (candIds.size && cat.length > 60) cat = cat.filter(p => candIds.has(p.id)).concat(cat.filter(p => !candIds.has(p.id)).slice(0, 40));
          let prompt = "";
          for (let level = 1; level < 3; level++) { prompt = PROMPTS.matchConfirm(batch.map(b => b.q), candLines, cat, !!o.complete, level); if (TEXT.bytesOf(prompt) <= BUDGET) break; }
          try {
            const r = await API.json(prompt, { tier: "default", effort: "medium", signal: o.signal, validate: v => v && Array.isArray(v.matches) ? "" : "matches 없음" });
            llm++;
            for (const m of r.matches) {
              const b = batch.find(x => x.q.number === str(m.number, 20).trim()); if (!b) continue;
              const p = m.passage_id && byId[str(m.passage_id, 40)];
              if (p && p.kind === "지문") setMatch(b.q, p, { method: "llm", score: (b.cands.find(c => c.id === p.id) || {}).score || 0, confidence: clamp01(m.confidence === undefined ? 0.7 : m.confidence), reason: "모델 확인", altered: str(m.altered, 120) });
              else { b.q.match = { passageId: null, sourceId: null, method: "none", score: 0, confidence: clamp01(m.confidence === undefined ? 0.5 : m.confidence), fidelity: null, reason: m.external === true ? "범위 밖" : "자료 부족", altered: "" }; if (m.external === true) b.q.external = true; }
            }
          } catch (e) { if (e.code === "cancelled") throw e; /* 확인 실패는 미매칭으로 둔다 */ }
        }
      }
      // 세트 후속 문항은 첫 문항을 따른다
      const firstOf = {}; questions.forEach(q => { if (q.set && q.setRole === "first") firstOf[q.set] = q; });
      questions.forEach(q => { if (q.set && q.setRole === "member" && firstOf[q.set]) { q.match = Object.assign({}, firstOf[q.set].match, { reason: "세트 첫 문항과 같은 지문" }); q.external = firstOf[q.set].external; } });
      return { matched: questions.filter(q => q.match && q.match.passageId).length, llm };
    }
    function setMatch(q, p, m) {
      const f = fidelity(q, p);
      q.match = { passageId: p.id, sourceId: p.sourceId || null, method: m.method, score: +(m.score || 0).toFixed(3), confidence: +(m.confidence || 0).toFixed(2), fidelity: f.fidelity, reason: m.reason || "", altered: m.altered || "",
                  changed: f.changed.slice(0, 12) };
      q.external = false;
      // 빈칸 위치 재계산 (확신이 높을 때만 모델 값을 덮어쓴다)
      const t = q.transformation;
      const lo = f.intactIdx && f.intactIdx.length ? f.intactIdx[0] : -1, hi = f.intactIdx && f.intactIdx.length ? f.intactIdx[f.intactIdx.length - 1] : -1;
      const inner = f.changed.filter(x => x.idx > lo && x.idx < hi);          // 발췌 경계 밖(앞뒤로 잘린 문장)은 변형이 아니다
      if (inner.length && q.match.confidence >= 0.8 && t) {
        const n = f.total, c = inner[0].idx;
        const bucket = c === p.topicIdx ? "주제문" : c === 0 ? "첫문장" : c === n - 1 ? "마지막문장" : c / n < 0.33 ? "앞부분" : c / n < 0.66 ? "중간" : "뒷부분";
        if (t.technique === "빈칸") t.blankPosition = bucket;
        if (t.technique === "문장삽입" && !t.insertPosition) t.insertPosition = c / n < 0.33 ? "앞" : c / n < 0.66 ? "중간" : "뒤";
      }
    }

    // ---- AI 활용 추정 ----
    // 지문(영어 본문)은 제외하고 발문·선지·조건·해설만 본다
    function aiLocal(exam, questions, answerKeyText, priorExams) {
      const mc = questions.filter(q => q.format === "5지선다" && q.options.some(o => o.text && o.text.length > 1));
      const S = [];
      const add = (id, name, score, weight, available, detail) => S.push({ id, name, score: +clamp01(score).toFixed(3), weight, available: !!available, detail: detail || "" });
      const cvs = mc.map(q => q.local && q.local.optLenCv).filter(v => v !== null && v !== undefined);
      const cvMean = cvs.length ? cvs.reduce((a, b) => a + b, 0) / cvs.length : 0;
      add("S1", "선지 길이 균일성", (0.30 - cvMean) / 0.30, 0.10, cvs.length >= 5, "선지 길이 변동계수 평균 " + cvMean.toFixed(2));
      const par = mc.filter(q => q.local && q.local.sameClass && q.local.punctConsistent).length;
      add("S2", "선지 평행 구조", mc.length ? par / mc.length : 0, 0.06, mc.length >= 5, mc.length ? par + "/" + mc.length + " 문항 완전 평행" : "");
      const byType = {}; questions.forEach(q => { (byType[q.type] = byType[q.type] || []).push(q.stemTemplate); });
      let u = 0, un = 0; Object.values(byType).forEach(ts => { if (ts.length >= 2) { const top = Object.values(ts.reduce((m, t) => { m[t] = (m[t] || 0) + 1; return m; }, {})).sort((a, b) => b - a)[0]; u += top / ts.length; un++; } });
      const kice = questions.length ? questions.reduce((a, q) => a + (q.koStem.kiceLike || 0), 0) / questions.length : 0.5;
      add("S3", "발문 정형성", 0.5 * (un ? u / un : 0.5) + 0.5 * kice, 0.08, Object.keys(byType).length >= 3, "같은 유형 발문 동일률 " + (un ? (u / un).toFixed(2) : "-") + " · 평가원 유사도 " + kice.toFixed(2));
      const ko = questions.map(q => q.stem + " " + q.options.map(o => o.text).join(" ") + " " + (q.subjective ? q.subjective.conditions.join(" ") : "")).join("\n") + "\n" + (answerKeyText || "");
      const koLen = (ko.match(/[가-힣]/g) || []).length;
      let noise = (ko.match(/\s[?!.,]/g) || []).length + (ko.match(/것은\s*$|것은\s+[^?]/gm) || []).length + (ko.match(/을\(를\)|이\(가\)|은\(는\)/g) || []).length * 0.5 + (ko.match(/할수|것 이|않 는|수 밖에|되요|됬|됀/g) || []).length;
      if (/[①②③④⑤]/.test(ko) && /\(\s*[1-5]\s*\)\s*\S/.test(ko)) noise += 2;
      if (/\[\s*\d+\s*점\s*\]/.test(ko) && /\(\s*\d+\s*점\s*\)/.test(ko)) noise += 1;
      const noiseRate = koLen ? noise / (koLen / 1000) : 0;
      add("S4", "사람 손 잡음", 1 - noiseRate / 1.5, exam.ocr ? 0.05 : 0.12, koLen >= 800, "한글 1,000자당 잡음 " + noiseRate.toFixed(2));
      const enNon = questions.map(q => q.options.map(o => o.text).join(" ")).join(" ") + " " + (answerKeyText || "");
      const enWords = TEXT.words(enNon.replace(/[가-힣]+/g, "")).length;
      const lex = (enNon.match(GPT_LEX) || []).length + ((answerKeyText || "").match(/핵심적인|중요한 역할|살펴보면|이는 .{0,6}시사|따라서 정답은|다양한 측면/g) || []).length;
      const lexRate = lex / Math.max(1, (enWords + koLen / 4) / 1000);
      add("S5", "GPT 어휘", lexRate / 4, 0.10, enWords >= 300 || !!answerKeyText, "1,000단어당 " + lexRate.toFixed(1) + "회");
      const fids = questions.map(q => q.match && q.match.fidelity).filter(v => typeof v === "number");
      const fMean = fids.length ? fids.reduce((a, b) => a + b, 0) / fids.length : 1;
      add("S6", "지문 충실도", (0.97 - fMean) / 0.20, 0.15, fids.length >= 3, "원문 유지율 " + fMean.toFixed(3) + " (사람은 0.98+ 가 보통)");
      const conds = questions.filter(q => q.subjective && q.subjective.conditions.length).flatMap(q => q.subjective.conditions.map(c => c.replace(/\d+/g, "#")));
      let condTop = 0; if (conds.length) { const cnt = {}; conds.forEach(c => { cnt[c] = (cnt[c] || 0) + 1; }); const top = Object.values(cnt).sort((a, b) => b - a); condTop = ((top[0] || 0) + (top[1] || 0)) / conds.length; }
      add("S7", "서술형 조건 정형성", condTop, 0.08, questions.filter(q => q.subjective).length >= 3, conds.length ? "상위 2개 조건 문구 비중 " + condTop.toFixed(2) : "");
      const expl = !!(answerKeyText && /①.*②.*③/s.test(answerKeyText) && answerKeyText.length > 800);
      add("S8", "해설 형태", expl ? (/(①[^②]{20,}){3,}/s.test(answerKeyText) ? 1 : 0.5) : 0, 0.07, !!(exam.analysis && exam.analysis.hasExplanations) || expl, expl ? "선지별 해설 존재" : "");
      const pc = mc.filter(q => q.local && q.local.punctConsistent).length;
      add("S10", "문장부호 일관성", mc.length ? pc / mc.length : 0, 0.04, mc.length >= 5, "");
      const md = questions.reduce((a, q) => a + (q.local ? q.local.mdArtifacts + q.local.emdash : 0), 0) + ((answerKeyText || "").match(/\*\*|###|—/g) || []).length;
      const mdRate = md / Math.max(1, (koLen + enWords * 4) / 1000);
      add("S12", "생성 잔재", mdRate / 2, 0.10, koLen + enWords * 4 >= 800, "마크다운·em-dash " + md + "개");
      // S9 — 이전 시험과의 급변
      const vec = (sig) => ["S1", "S2", "S3", "S5", "S12"].map(id => { const s = (sig || []).find(x => x.id === id); return s && s.available ? s.score : null; });
      const prior = (priorExams || []).filter(e => e.ai && e.ai.signals).map(e => vec(e.ai.signals));
      if (prior.length) {
        const cur = vec(S); let d = 0, n = 0;
        cur.forEach((v, i) => { if (v === null) return; const ps = prior.map(p => p[i]).filter(x => x !== null); if (!ps.length) return; d += Math.abs(v - ps.reduce((a, b) => a + b, 0) / ps.length); n++; });
        add("S9", "이전 시험 대비 급변", n ? ((d / n) - 0.15) / 0.35 : 0, 0.10, n > 0, "신호 평균 변화 " + (n ? (d / n).toFixed(2) : "-"));
      } else add("S9", "이전 시험 대비 급변", 0, 0.10, false, "이전 시험 없음");
      const avail = S.filter(s => s.available);
      const wsum = avail.reduce((a, s) => a + s.weight, 0), wall = S.reduce((a, s) => a + s.weight, 0);
      const local = wsum ? avail.reduce((a, s) => a + s.weight * s.score, 0) / wsum : 0.5;
      return { local: +local.toFixed(3), coverage: +(wsum / wall).toFixed(2), signals: S };
    }
    async function aiJudge(exam, questions, loc, answerKeyText, priorText, signal) {
      const lines = loc.signals.map(s => s.id + " | " + s.name + " | " + s.score.toFixed(2) + " | " + s.weight + " | " + (s.available ? "예" : "아니오(표본 부족)")).join("\n");
      const stems = questions.slice(0, 8).map(q => q.type + " | " + q.stem).join("\n");
      const opts = questions.filter(q => q.options.some(o => o.text)).slice(0, 6).map(q => q.number + " | " + q.options.map(o => o.text).join(" / ")).join("\n");
      const conds = questions.filter(q => q.subjective).flatMap(q => q.subjective.conditions).slice(0, 12).join("\n");
      const prompt = PROMPTS.aiJudge(lines, stems, opts, conds, (answerKeyText || "").slice(0, 1200), priorText);
      const r = await API.json(prompt, { tier: "default", effort: "high", signal, validate: v => v && typeof v.llm_score === "number" ? "" : "llm_score 없음" });
      return { llmScore: clamp01(r.llm_score), confidence: clamp01(r.confidence === undefined ? 0.5 : r.confidence),
               evidence: arr(r.evidence).slice(0, 6).map(e => ({ signal: str(e && e.signal, 8), direction: str(e && e.direction, 8), quote: str(e && e.quote, 60), note: str(e && e.note, 120) })), summary: str(r.summary_ko, 400) };
    }
    function combineAI(loc, llm, nq) {
      const ai = llm ? (loc.coverage >= 0.5 ? 0.6 * loc.local + 0.4 * llm.llmScore : 0.4 * loc.local + 0.6 * llm.llmScore) : loc.local;
      const half = 0.12 + 0.25 * (1 - loc.coverage) + 0.13 * (1 - Math.min(1, nq / 25)) + (llm ? 0.10 * Math.abs(loc.local - llm.llmScore) + 0.05 * (1 - llm.confidence) : 0.10);
      const label = ai < 0.30 ? "사람 손 위주로 보임" : ai < 0.60 ? "판단 유보 — 일부 보조 가능성" : "AI 보조 가능성 높음";
      return { local: loc.local, coverage: loc.coverage, signals: loc.signals, llm: llm || null, aiLikelihood: +clamp01(ai).toFixed(3), band: [+clamp01(ai - half).toFixed(2), +clamp01(ai + half).toFixed(2)], label, computedAt: Date.now() };
    }
    const AI_DISCLAIMER = "이 추정은 시험지 텍스트의 문체·형식 신호만으로 계산한 가능성이며, 실제 제작 과정을 확인한 것이 아닙니다. 선생님 개인의 문체, 편집 프로그램, 추출·OCR 오류가 같은 신호를 만들 수 있습니다. 특정 선생님을 평가·비난하는 근거로 쓰지 마세요. 참고용 지표입니다.";

    async function classifyLLM(name, head, signal) {
      const r = await API.json(PROMPTS.classify(name, head.slice(0, 1500)), { light: true, tier: "small", effort: "low", signal, validate: v => v && (v.kind === "exam" || v.kind === "scope") ? "" : "kind 없음" });
      return { kind: r.kind, confidence: clamp01(r.confidence === undefined ? 0.6 : r.confidence), meta: r.meta || {} };
    }
    return { dataizeExam, indexScope, indexHandout, reflection, matchQuestions, fidelity, aiLocal, aiJudge, combineAI, AI_DISCLAIMER, classifyLLM, normalizeQuestion, isSubj, TYPES, BUDGET };
  })();
