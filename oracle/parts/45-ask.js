  // ==================================================================
  //  ASK — 물어보기(RAG). 구조 근거(프로파일 · 예측 숫자, 로컬) + 검색 근거(INDEX · LINKS) → PROMPTS.ask → 평문 스트리밍 → [n] 인용 → notes(kind:"ask") + links(kind:"cite").
  //  근거 0 이면 모델을 부르지 않는다. 시스템 프롬프트는 캐시(cacheSystem). 기본 Sonnet(light). IIFE 시점에 window/document/localStorage 를 만지지 않는다.
  // ==================================================================
  const ASK = (function () {
    const KEYWORDS = ANALYZE.TYPES.filter(t => t !== "기타").concat(["몇 문항", "몇문항", "문항 수", "문항수", "배점", "비중", "반영율", "반영률", "유력", "확률", "신뢰도", "난이도", "서술형", "어법", "프린트", "총점", "평균", "몇 개", "몇개", "얼마나"]);
    const CAPS = { question: 8, passage: 5, handout: 3, note: 5, exam: 3, ask: 2, mock: 1, source: 2, profile: 1, prediction: 1, teacher: 1 };
    const KIND_LABEL = PROMPTS.ASK_KIND_LABEL;
    const stats = { calls: 0, chars: 0, evidence: 0 };
    const S = (v, n) => { const s = String(v == null ? "" : v); return n ? s.slice(0, n) : s; };
    const pct = (x) => Math.round((+x || 0) * 100) + "%";
    const top = (m, n) => Object.keys(m || {}).slice(0, n || 1);
    const uniq = (a) => [...new Set(a)];
    const esc = (s) => TEXT.esc(s);
    const capKey = (d) => d.handout ? "handout" : d.kind === "note" ? (d.noteKind === "ask" ? "ask" : "note") : d.kind;

    // ---- 구조 근거 (LLM 없이) ----
    // structured(question, { profile, prediction, teacher }) → [string]. profile 은 저장 레코드({ version, createdAt, profile }) 나 PROFILE.build 결과 둘 다 받는다.
    function structured(question, o) {
      o = o || {}; const q = String(question == null ? "" : question);
      if (!q.trim() || !KEYWORDS.some(k => q.includes(k))) return [];
      const rec = o.profile || null; const p = rec && rec.profile && rec.profile.typeDist ? rec.profile : (rec && rec.typeDist ? rec : null);
      const lines = [];
      if (p) {
        const head = ["프로파일" + (rec.version ? " V" + rec.version : "") + (rec.createdAt ? " (" + TEXT.fmtDate(rec.createdAt) + ")" : ""), p.basedOn ? "시험 " + p.basedOn.nExams + " · 문항 " + p.basedOn.nQuestions : "", "신뢰도 " + (p.reliability === undefined ? "?" : p.reliability), p.level ? "레벨 " + p.level.name : "", p.totalQuestionsAvg ? "시험당 평균 " + p.totalQuestionsAvg + "문항" : "", p.totalPointsAvg ? "총점 " + p.totalPointsAvg + "점" : ""];
        lines.push(head.filter(Boolean).join(" · "));
        const asked = ANALYZE.TYPES.filter(t => t !== "기타" && q.includes(t));
        const types = asked.length ? asked : Object.keys(p.typeDist).slice(0, 6);
        const tp = p.transformationPrefs || {};
        types.forEach(t => {
          const d = p.typeDist[t];
          if (!d) { lines.push(t + " 0% (기출 " + (p.basedOn ? p.basedOn.nQuestions : 0) + "문항 중 없음)"); return; }
          let extra = "";
          if (t === "빈칸" && tp.빈칸) extra = " · 위치 " + top(tp.빈칸.blankPosition).join("") + " " + pct(tp.빈칸.blankPosition[top(tp.빈칸.blankPosition)[0]]) + (top(tp.빈칸.blankUnit)[0] ? " · 단위 " + top(tp.빈칸.blankUnit)[0] : "");
          if (t === "어법" && tp.어법) extra = " · " + (top(tp.어법.technique)[0] || "밑줄") + " " + tp.어법.countAvg + "개";
          if (t === "순서" && tp.순서) extra = " · " + top(tp.순서.orderSplit).join("");
          if (t === "삽입" && tp.삽입) extra = " · 위치 " + top(tp.삽입.insertPosition).join("");
          if (t === "어휘" && tp.어휘) extra = " · " + top(tp.어휘.vocabSwap).join("");
          lines.push(t + " " + pct(d.share) + " (시험당 " + d.perExam + "문항" + (d.avgPoints !== null && d.avgPoints !== undefined ? " · 평균 " + d.avgPoints + "점" : "") + (top(d.difficulty)[0] ? " · 난이도 " + top(d.difficulty)[0] : "") + (top(d.subtypes)[0] ? " · " + top(d.subtypes)[0] : "") + ")" + extra);
        });
        if (p.subjective && (/서술형/.test(q) || !asked.length)) lines.push("서술형 " + pct(p.formatMix && p.formatMix.서술형) + " (시험당 " + p.subjective.perExam + "문항" + (p.subjective.avgPoints ? " · 평균 " + p.subjective.avgPoints + "점" : "") + (top(p.subjective.formats)[0] ? " · 형식 " + top(p.subjective.formats, 2).map(f => f + " " + pct(p.subjective.formats[f])).join("/") : "") + ((p.subjective.conditionsSignature || []).length ? " · 조건 “" + p.subjective.conditionsSignature.slice(0, 2).map(c => c.template).join("” “") + "”" : "") + ")");
        if (/어법/.test(q) && (p.grammarPoints || []).length) lines.push("어법 포인트: " + p.grammarPoints.slice(0, 6).map(g => g.point + " " + pct(g.wshare) + (g.trend && g.trend !== "=" ? g.trend : "")).join(" · "));
        if (/난이도/.test(q) && p.difficultyCurve) { const mix = p.difficultyCurve.mix || {}; lines.push("난이도 " + ["상", "중", "하"].map(k => k + " " + pct(mix[k])).join(" · ")); }
        if (/배점|총점|평균/.test(q)) lines.push("평균 배점 " + (p.avgPoints === null || p.avgPoints === undefined ? "?" : p.avgPoints) + "점 · 총점 " + p.totalPointsAvg + "점 · 배점 분포 " + top(p.pointsHist, 3).map(k => k + "점 " + pct(p.pointsHist[k])).join(" · "));
        if (/프린트|반영/.test(q) || p.handout) lines.push(p.handout ? "프린트 반영율 " + pct(p.handout.rate) + " (시험 " + p.handout.nExams + "개" + ((p.handout.byExam || []).length ? " · " + p.handout.byExam.map(x => x.label + " " + pct(x.rate)).join(" · ") : "") + (p.handout.kinds ? " · 종류 " + Object.keys(p.handout.kinds).map(k => k + " " + p.handout.kinds[k]).join(" ") : "") + ")" : "프린트 반영율: 프린트 자료가 아직 없음");
        if (/외부|범위 밖|밖/.test(q)) lines.push("범위 밖 지문 비율 " + pct(p.externalRatio));
        if (/지문|재출제|길이/.test(q) && p.passagePref) lines.push("지문 선호: 길이 " + p.passagePref.wordsMean + "±" + p.passagePref.wordsSd + "단어 · 장르 " + top(p.passagePref.genre, 2).join("/") + " · 위치 " + top(p.passagePref.positionInScope, 2).join("/") + " · 재출제율 " + pct(p.passagePref.reuseRate));
      }
      const pr = o.prediction; const bp = pr && pr.blueprint;
      if (bp && bp.plan) {
        lines.push("예측 " + ((pr.target && pr.target.label) || "다음 시험") + " (V" + (pr.profileVersion || "?") + " · 신뢰도 " + pct(bp.confidence && bp.confidence.overall) + "): " + (bp.plan.typePlan || []).map(t => t.type + " " + t.n + "문항").join(" · ") + " · 서술형 " + bp.plan.subjective + "문항 · 총 " + bp.plan.total + "문항 " + bp.plan.points + "점");
        if ((bp.passages || []).length) lines.push("유력 지문: " + bp.passages.slice(0, 5).map((s, i) => (i + 1) + "위 " + (s.src || s.passageId) + " (" + pct(s.pUse) + (s.onHandout ? " ★" : "") + ")").join(" · "));
        if (/어법/.test(q) && (bp.grammarPoints || []).length) lines.push("예측 어법: " + bp.grammarPoints.slice(0, 5).map(g => g.point + " " + pct(g.p)).join(" · "));
      }
      return lines;
    }
    // ---- 근거 모으기 ----
    async function latestProfile(teacherId) { const ps = await DB.where("profiles", "teacherId", teacherId); ps.sort((a, b) => (b.version || 0) - (a.version || 0)); return ps[0] || null; }
    async function latestPrediction(teacherId) { const pr = await DB.where("predictions", "teacherId", teacherId); pr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); return pr[0] || null; }
    // retrieve(question, { teacherId, ctxId, k=12, budget=12000 }) → Promise<{ evidence: [{ n, id, store, kind, kindLabel, title, sub, flag, text, why, teacherId }], dropped, chars, tokens }>
    async function retrieve(question, o) {
      o = o || {}; const k = o.k || 12, budget = o.budget || 12000; const tid = o.teacherId && o.teacherId !== "*" ? o.teacherId : "";
      // 최소 일치 토큰 수: 질문 토큰 중 색인에 있는 것만 센다(한글 2-gram 은 "배점은" 처럼 없는 조각을 만든다) — 2개 이하면 1개, 아니면 2개
      const qt = uniq(INDEX.tokenize(question)); const present = qt.filter(t => INDEX.hasToken(t)); const need = present.length <= 2 ? 1 : 2;
      const cand = [], seen = new Set();
      const add = (id, why, score) => { if (!id || seen.has(id)) return; const d = INDEX.get(id); if (!d) return; if (tid && d.teacherId && d.teacherId !== tid) return; seen.add(id); cand.push({ id, d, why, score }); };
      if (o.ctxId) { add(o.ctxId, "열린 노트", 1e9); LINKS.neighbors(o.ctxId, 1).nodes.forEach(id => { if (id !== o.ctxId) add(id, "열린 노트의 이웃", 1e8); }); }
      const hits = INDEX.search(question, { teacherId: tid, limit: 40, strict: !!tid });
      const topScore = hits.length ? hits[0].score : 0; const floor = Math.max(2.0, 0.3 * topScore);
      let passed = hits.filter(h => h.score >= floor && h.matched.length >= need);
      if (!passed.length) passed = hits.filter(h => h.score >= floor);      // 둘 다 통과하는 문서가 없으면 점수 하한만
      passed.forEach(h => add(h.id, "검색 · " + h.matched.slice(0, 3).join(" "), h.score));
      const counts = {}, picked = [], dropped = [];
      cand.forEach(c => { const key = capKey(c.d); const n = counts[key] || 0; if (n >= (CAPS[key] || 3) && c.score < 1e8) { dropped.push({ id: c.id, title: c.d.title, why: "종류 상한" }); return; } counts[key] = n + 1; picked.push(c); });
      // 1홉 확장 — 문항 → 매칭 지문, 지문 → 그 지문을 쓴 문항 상위 3
      const extra = [];
      picked.slice().forEach(c => {
        if (c.d.kind === "question" && c.d.passageId) extra.push([c.d.passageId, "매칭 지문"]);
        if (c.d.kind === "passage") LINKS.backlinks(c.id).filter(b => b.kind === "match").slice(0, 3).forEach(b => extra.push([b.from, "이 지문을 쓴 문항"]));
      });
      extra.forEach(([id, why]) => { if (seen.has(id)) return; const d = INDEX.get(id); if (!d) return; if (tid && d.teacherId && d.teacherId !== tid) return; const key = capKey(d); if ((counts[key] || 0) >= (CAPS[key] || 3)) return; seen.add(id); counts[key] = (counts[key] || 0) + 1; picked.push({ id, d, why, score: 0 }); });
      const evidence = []; let used = 0;
      for (const c of picked) {
        if (evidence.length >= k) { dropped.push({ id: c.id, title: c.d.title, why: "개수 상한" }); continue; }
        let doc = null; try { doc = await DB.get(c.d.store, c.id); } catch (e) {}
        if (!doc) continue;
        const text = evidenceText(doc, { store: c.d.store, index: c.d });
        if (!text) continue;
        if (used + text.length > budget && evidence.length) { dropped.push({ id: c.id, title: c.d.title, why: "예산" }); continue; }
        used += text.length;
        const kind = capKey(c.d);
        evidence.push({ n: evidence.length + 1, id: c.id, store: c.d.store, kind, kindLabel: KIND_LABEL[kind] || kind, title: c.d.title, sub: c.d.sub, flag: c.d.hit || c.d.handout ? "★프린트" : "", text, why: c.why, teacherId: c.d.teacherId, score: c.score });
      }
      return { evidence, dropped, chars: used, tokens: qt };
    }
    // ---- 근거 블록 ----
    // evidenceText(doc, ctx) — ctx: { store, passageTitle(id), examTitle(id) } (선택)
    function evidenceText(doc, ctx) {
      if (!doc) return "";
      ctx = ctx || {};
      const store = ctx.store || NOTES.storeOf(doc.id);
      const look = (fn, id) => { if (!id) return ""; if (typeof ctx[fn] === "function") { try { const v = ctx[fn](id); if (v) return String(v); } catch (e) {} } const d = INDEX.get(id); return d ? d.title : LINKS.title(id) || ""; };
      const L = [];
      switch (store) {
        case "questions": {
          const t = doc.transformation || {};
          if (doc.stem) L.push("발문: " + doc.stem);
          if ((doc.options || []).some(o => o.text)) L.push("선지: " + doc.options.map(o => o.label + " " + o.text).join(" / "));
          if (doc.answer) L.push("정답: " + doc.answer);
          const tr = [t.technique, t.blankPosition, t.blankUnit, (t.grammarPoints || []).join("·"), t.orderSplit, t.insertPosition, t.vocabSwap].filter(Boolean).join(" · ");
          if (tr) L.push("변형: " + tr);
          if (doc.match && doc.match.passageId) L.push("매칭 지문: " + (look("passageTitle", doc.match.passageId) || doc.match.passageId) + (doc.match.method === "user" ? " (직접 지정)" : ""));
          else if (doc.external) L.push("범위 밖 지문");
          if (doc.handoutHit) L.push("★ 프린트에서 나옴: " + (doc.handoutHit.kinds || []).join("·"));
          if (doc.subjective && (doc.subjective.conditions || []).length) L.push("조건: " + doc.subjective.conditions.join(" / "));
          if (doc.features) L.push("특징: " + doc.features);
          return S(L.join("\n"), 600);
        }
        case "passages": {
          if (doc.gist) L.push("요지: " + doc.gist);
          const sents = (doc.sentences && doc.sentences.length ? doc.sentences.slice(0, 2).join(" ") : S(doc.text, 300)); if (sents) L.push("원문: " + sents);
          if ((doc.grammarTargets || []).length) L.push("어법 타깃: " + doc.grammarTargets.map(g => g.point + "(" + g.sent + ")").join(" · "));
          if ((doc.feats || []).length) L.push("특징: " + doc.feats.join(" · ") + (doc.topicIdx >= 0 ? " · 주제문 " + doc.topicIdx + "번째" : ""));
          if (doc.fromHandout) L.push("★ 프린트 지문");
          return S(L.join("\n"), 700);
        }
        case "sources": {
          if (doc.kind === "프린트") {
            if (doc.target) L.push("대상 시험: " + TEXT.examLabel(doc.target).trim() + (doc.target.guessed ? " (추정)" : ""));
            if (doc.reflection && doc.reflection.n) L.push("반영율: " + pct(doc.reflection.rate) + " (문항 " + doc.reflection.hit + "/" + doc.reflection.n + (doc.reflection.exams ? " · " + doc.reflection.exams.map(x => x.label + " " + pct(x.rate)).join(" · ") : "") + ")");
            else L.push("반영율: 아직 짝이 되는 기출이 없음");
            if (doc.passages) L.push("지문 " + doc.passages + "개");
            if ((doc.items || []).length) L.push("포인트: " + doc.items.map(it => "[" + it.kind + "] " + it.text + (it.point ? " (" + it.point + ")" : "")).join(" / "));
            if (doc.memo) L.push("메모: " + doc.memo);
            return S(L.join("\n"), 800);
          }
          L.push("종류: " + (doc.kind || "자료") + " · 지문 " + (doc.passages || 0) + "개" + (doc.complete ? " · 범위 완비" : ""));
          if (doc.memo) L.push("메모: " + doc.memo);
          if (doc.text) L.push(S(doc.text, 300));
          return S(L.join("\n"), 600);
        }
        case "notes": {
          if (doc.kind === "ask") return S("질문: " + ((doc.ask && doc.ask.question) || "") + "\n답: " + (doc.body || ""), 600);
          return S(doc.body || "", 1200);
        }
        case "exams": {
          if (doc.analysis && doc.analysis.summary) L.push("요약: " + doc.analysis.summary);
          if (doc.analysis) L.push("문항 " + (doc.analysis.total || 0) + " (객관식 " + (doc.analysis.objective || 0) + " · 서술형 " + (doc.analysis.subjective || 0) + ")" + (doc.analysis.points ? " · 총점 " + doc.analysis.points : ""));
          if (doc.matchable) L.push("지문 매칭 " + (doc.matched || 0) + "/" + doc.matchable);
          if (doc.reflection && doc.reflection.n) L.push("프린트 반영율 " + pct(doc.reflection.rate) + " (" + Object.keys(doc.reflection.kinds || {}).map(k => k + " " + doc.reflection.kinds[k]).join(" · ") + ")");
          if (doc.ai) L.push("AI 활용 추정: " + doc.ai.label + " (" + pct(doc.ai.aiLikelihood) + ")");
          if (doc.memo) L.push("메모: " + doc.memo);
          return S(L.join("\n"), 600);
        }
        case "mocks": {
          L.push("대상: " + (doc.target || "") + " · " + ((doc.stats && doc.stats.total) || (doc.questions || []).length) + "문항");
          (doc.questions || []).forEach(q => L.push(q.number + ". " + q.type + (q.subtype ? "(" + q.subtype + ")" : "") + " · " + S(q.stem, 80)));
          return S(L.join("\n"), 800);
        }
        case "profiles": {
          const n = doc.narrative || {};
          if (n.text) L.push(n.text);
          if ((n.keywords || []).length) L.push("키워드: " + n.keywords.join(" · "));
          if ((n.watchouts || []).length) L.push("주의: " + n.watchouts.join(" · "));
          if ((doc.delta || []).length) L.push("달라진 점: " + doc.delta.join(" / "));
          return S(L.join("\n"), 800);
        }
        case "predictions": return S(doc.copyText || "", 900);
        case "teachers": return S([doc.name, doc.school, doc.grade ? doc.grade + "학년" : "", doc.subject, doc.stats && doc.stats.profileVersion ? "프로파일 V" + doc.stats.profileVersion : ""].filter(Boolean).join(" · "), 200);
      }
      return S(doc.body || doc.text || "", 600);
    }
    // ---- 프롬프트 ----
    // prompt(question, { teacher, profile, prediction, structured, evidence, ctxLine, counts }) → { system, user }
    function prompt(question, o) {
      o = o || {}; const t = o.teacher; const rec = o.profile;
      const p = rec && rec.profile && rec.profile.typeDist ? rec.profile : (rec && rec.typeDist ? rec : null);
      const teacherLine = t ? [t.name, [t.school, t.grade ? t.grade + "학년" : "", t.subject].filter(Boolean).join(" "), o.counts ? "시험 " + (o.counts.exams || 0) + " · 문항 " + (o.counts.questions || 0) : (p && p.basedOn ? "시험 " + p.basedOn.nExams + " · 문항 " + p.basedOn.nQuestions : ""), rec && rec.version ? "프로파일 V" + rec.version : (p ? "" : "프로파일 없음")].filter(Boolean).join(" · ") : "";
      return PROMPTS.ask({ teacherLine, compact: p ? PROFILE.compact(p) : null, structured: o.structured || [], evidence: o.evidence || [], question, ctxLine: o.ctxLine || "" });
    }
    // ---- 답 해석 · 표시 ----
    // parseAnswer(text) → { body, used: [n], followups: [], cited: [n] }
    function parseAnswer(text) {
      const src = String(text == null ? "" : text).replace(/\r/g, "").replace(/^```[a-z]*\n?|```$/gm, "");
      let used = [], followups = []; const body = [];
      src.split("\n").forEach(l => {
        const t = l.trim(); let m;
        if ((m = /^[*_\s]*USED\s*[:：]\s*(.*)$/i.exec(t))) { used = used.concat((m[1].match(/\d+/g) || []).map(Number)); return; }
        if ((m = /^[*_\s]*FOLLOW\s*-?\s*UPS?\s*[:：]\s*(.*)$/i.exec(t))) { followups = followups.concat(m[1].split(/\s*[|｜]\s*/).map(s => s.trim().replace(/^[-•]\s*/, "")).filter(Boolean)); return; }
        body.push(l);
      });
      const b = body.join("\n").trim();
      const cited = uniq((b.match(/\[\d{1,2}(?:\s*,\s*\d{1,2})*\]/g) || []).flatMap(x => x.match(/\d+/g).map(Number))).sort((x, y) => x - y);
      used = uniq(used.filter(n => n > 0)).sort((x, y) => x - y);
      if (!used.length) used = cited.slice();
      return { body: b, used, followups: uniq(followups).slice(0, 4).map(f => S(f, 80)), cited };
    }
    // renderCites(bodyHtml, evidence) → html. [n] → <button class="cite" data-id data-n>; 없는 번호는 .dashed
    function renderCites(bodyHtml, evidence) {
      const byN = new Map((evidence || []).map(e => [+e.n, e]));
      return String(bodyHtml == null ? "" : bodyHtml).replace(/\[(\d{1,2}(?:\s*,\s*\d{1,2})*)\]/g, (m, ns) => ns.split(",").map(s => {
        const n = +s.trim(); const e = byN.get(n);
        return e ? '<button type="button" class="cite" data-id="' + esc(e.id) + '" data-n="' + n + '" title="' + esc((e.kindLabel || "") + " · " + (e.title || "")) + '">' + n + '</button>'
                 : '<button type="button" class="cite dashed" data-n="' + n + '" title="근거에 없는 번호예요">' + n + '</button>';
      }).join(""));
    }
    // ---- 실행 ----
    // run(question, { teacherId, ctxId, signal, onText, onStatus, light, k, budget, teacher, profile, prediction })
    //   → Promise<{ answer, used, invalid, followups, evidence, structured, model, noEvidence, aborted, chars, raw }>
    //   onStatus(phase, info): "gather" → "found" { n, chars } → "answer" → "done" { used }. onText({ text, delta }) 는 API.call 그대로.
    async function run(question, o) {
      o = o || {}; const q = String(question == null ? "" : question).trim();
      const status = (phase, info) => { try { if (o.onStatus) o.onStatus(phase, info || {}); } catch (e) {} };
      const tid = o.teacherId && o.teacherId !== "*" ? o.teacherId : "";
      status("gather", { msg: "근거 모으는 중" });
      let teacher = null, profile = null, prediction = null;
      if (tid) {
        teacher = o.teacher !== undefined ? o.teacher : await DB.get("teachers", tid);
        profile = o.profile !== undefined ? o.profile : await latestProfile(tid);
        prediction = o.prediction !== undefined ? o.prediction : await latestPrediction(tid);
      }
      const struct = structured(q, { profile, prediction, teacher });
      const r = await retrieve(q, { teacherId: tid, ctxId: o.ctxId, k: o.k, budget: o.budget });
      status("found", { n: r.evidence.length, chars: r.chars });
      const base = { answer: "", used: [], invalid: [], followups: [], evidence: r.evidence, structured: struct, model: "", noEvidence: false, aborted: false, chars: r.chars, raw: "", question: q, teacherId: tid || "*", ctxId: o.ctxId || null };
      if (!r.evidence.length) { status("done", { noEvidence: true }); return Object.assign(base, { noEvidence: true }); }
      const cx = o.ctxId ? INDEX.get(o.ctxId) : null;
      const ctxLine = cx ? cx.title + (cx.sub ? " · " + cx.sub : "") : (o.ctxId ? LINKS.title(o.ctxId) : "");
      const pr = prompt(q, { teacher, profile, prediction, structured: struct, evidence: r.evidence, ctxLine, counts: o.counts });
      status("answer", { msg: "답 쓰는 중" });
      let text = "", model = "", aborted = false;
      try {
        const res = await API.call(pr.user, { system: pr.system, cacheSystem: true, light: o.light !== false, tier: "default", effort: "medium", signal: o.signal, onText: (t) => { text = t.text; if (o.onText) { try { o.onText(t); } catch (e) {} } } });
        text = res.text; model = res.model || "";
      } catch (e) {
        if (e && (e.code === "cancelled" || (o.signal && o.signal.aborted))) aborted = true;
        else throw e;
      }
      stats.calls++; stats.chars += r.chars; stats.evidence += r.evidence.length;
      const parsed = parseAnswer(text);
      const valid = new Set(r.evidence.map(e => e.n));
      const used = aborted ? [] : parsed.used.filter(n => valid.has(n));
      const invalid = uniq(parsed.used.concat(parsed.cited)).filter(n => !valid.has(n));
      status("done", { used, aborted });
      return Object.assign(base, { answer: parsed.body, used, invalid, followups: aborted ? [] : parsed.followups, model, aborted, raw: text });
    }
    // ---- 저장 · 기록 ----
    // save({ question, result, teacherId, ctxId, author }) → notes(kind:"ask") 문서. 인용마다 links(kind:"cite") + events(ask)
    async function save(o) {
      o = o || {}; const r = o.result || {}; const ev = r.evidence || [];
      const q = String(o.question || r.question || "").trim();
      const teacherId = o.teacherId !== undefined ? o.teacherId : r.teacherId;
      const ctxId = o.ctxId !== undefined ? o.ctxId : r.ctxId;
      const doc = await NOTES.create({ kind: "ask", title: "", body: S(r.answer, 4000), teacherId: teacherId && teacherId !== "*" ? teacherId : null, author: o.author, source: { kind: "ask" },
        ask: { question: S(q, 500), scope: teacherId || "*", ctx: ctxId || null, model: r.model || "", evidence: ev.map(e => e.id), used: (r.used || []).slice(), followups: (r.followups || []).slice(), invalid: (r.invalid || []).slice(), aborted: !!r.aborted, noEvidence: !!r.noEvidence, structured: (r.structured || []).slice(0, 12), chars: r.chars || 0 } });
      for (const n of r.used || []) { const e = ev.find(x => x.n === n); if (e) { try { await LINKS.addUser({ from: doc.id, to: e.id, kind: "cite", text: "[" + n + "]", teacherId: doc.teacherId, author: doc.author }); } catch (err) { console.error(err); } } }
      try { if (typeof APP !== "undefined" && APP && typeof APP.log === "function") APP.log(doc.teacherId, "ask", "물어보기: " + S(q, 80), { id: doc.id, noteId: doc.id }); else DB.put("events", { id: uid("ev"), teacherId: doc.teacherId, at: Date.now(), kind: "ask", msg: "물어보기: " + S(q, 80), ref: { id: doc.id, noteId: doc.id } }).catch(() => {}); } catch (e) {}
      return doc;
    }
    // history(teacherId, limit=20) → 질문 노트 (최근순)
    async function history(teacherId, limit) {
      let list = await DB.where("notes", "kind", "ask");
      if (teacherId && teacherId !== "*") list = list.filter(d => d.teacherId === teacherId);
      list = list.filter(d => !NOTES.pending(d.id));
      list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return list.slice(0, limit || 20);
    }
    return { KEYWORDS, CAPS, stats, structured, retrieve, evidenceText, prompt, run, parseAnswer, renderCites, save, history, latestProfile, latestPrediction, capKey };
  })();
