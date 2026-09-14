  // ==================================================================
  //  PREDICT — 다음 시험 예측. 로컬 점수(습관 × 지문 특징 × 최근성) → 모델이 한 번 다듬는다.
  // ==================================================================
  const PREDICT = (function () {
    const round = (x, d) => { const m = Math.pow(10, d === undefined ? 2 : d); return Math.round((+x || 0) * m) / m; };
    const has = (p, f) => (p.feats || []).includes(f);
    const FIT = {
      빈칸: p => (p.blankCandidates || []).length ? 1 : 0.4, 순서: p => p.orderFriendly ? 1 : 0.3, 삽입: p => p.insertFriendly ? 1 : 0.3,
      요지: p => has(p, "주장·요지 명확") ? 1 : 0.5, 주장: p => has(p, "주장·요지 명확") ? 1 : 0.5, 주제: p => p.topicIdx >= 0 ? 0.9 : 0.6, 제목: p => p.topicIdx >= 0 ? 0.9 : 0.6,
      목적: p => p.genre === "편지·안내문" ? 1 : 0.3, 안내문: p => p.genre === "편지·안내문" ? 1 : 0.2, 어법: p => Math.max(0.3, Math.min(1, (p.grammarTargets || []).length / 5)),
      내용일치: p => has(p, "예시 열거") || has(p, "일화·서사") ? 1 : 0.6, 내용불일치: p => has(p, "예시 열거") || has(p, "일화·서사") ? 1 : 0.6, 심경: p => p.genre === "이야기" ? 1 : 0.3, 분위기: p => p.genre === "이야기" ? 1 : 0.3,
      서술형: p => has(p, "서술형 적합") ? 1 : 0.6, 요약문: p => has(p, "주장·요지 명확") || has(p, "문제·해결") ? 1 : 0.5, 연결어: p => has(p, "연결어 뚜렷") ? 1 : 0.4,
    };
    function fit(t, p) { const f = FIT[t]; return f ? f(p) : 0.6; }
    function largestRemainder(shares, total) {
      const keys = Object.keys(shares); const sum = keys.reduce((a, k) => a + shares[k], 0) || 1;
      const raw = keys.map(k => ({ k, v: shares[k] / sum * total })); let out = {}; let used = 0;
      raw.forEach(r => { out[r.k] = Math.floor(r.v); used += out[r.k]; });
      raw.sort((a, b) => (b.v - Math.floor(b.v)) - (a.v - Math.floor(a.v)));
      for (let i = 0; used < total && raw.length; i++) { out[raw[i % raw.length].k]++; used++; }
      return out;
    }
    const mode = (m) => { let b = null, bv = -1; Object.keys(m || {}).forEach(k => { if (m[k] > bv) { bv = m[k]; b = k; } }); return b; };
    const half = (x) => Math.round(x * 2) / 2;

    // blueprint({ profile, passages, questions, exams, target, scopeComplete, handouts }) → bp
    //   handouts: 다가오는 시험용 프린트 [{ source, passages, items }] — 실린 지문·어법 포인트를 반영율만큼 올린다
    function blueprint(o) {
      const p = o.profile, target = o.target || {};
      const hRate = p.handout ? Math.max(0.35, p.handout.rate) : 0.6;
      const hPass = (o.handouts || []).flatMap(h => h.passages.map(x => ({ id: x.id, s6: TEXT.shingles(x.text, 6), src: h.source.name })));
      const hGrammar = new Set((o.handouts || []).flatMap(h => h.items.filter(it => it.kind === "어법" && it.point).map(it => it.point)));
      const inHandout = (x) => { if (x.fromHandout) return true; if (!hPass.length) return false; const s = TEXT.shingles(x.text, 6); return hPass.some(h => TEXT.containment(s, h.s6) >= 0.5 || TEXT.containment(h.s6, s) >= 0.5); };
      const total = Math.max(5, Math.round(p.totalQuestionsAvg || 24));
      const subjN = Math.max(0, Math.min(total - 1, Math.round(total * (p.formatMix.서술형 || 0))));
      const objN = total - subjN;
      // 객관식 유형 비중 + 드리프트 한 발
      const shares = {};
      Object.keys(p.typeDist).forEach(t => { if (t === "서술형") return; const s = Math.max(0, (p.typeDist[t].wshare || 0) + (p.drift.trend.typeSlopes[t] || 0)); if (s > 0) shares[t] = s; });
      const counts = largestRemainder(shares, objN);
      const typePlan = Object.keys(counts).filter(t => counts[t] > 0).map(t => {
        const td = p.typeDist[t];
        return { type: t, subtype: (mode(td.subtypes) || ""), n: counts[t], pointsEach: td.avgPoints ? half(td.avgPoints) : (p.avgPoints ? half(p.avgPoints) : 3), difficulty: mode(td.difficulty) || "중" };
      }).sort((a, b) => b.n - a.n);
      const subjFormats = subjN ? Object.entries(largestRemainder(Object.keys(p.subjective.formats).length ? p.subjective.formats : { 조건영작: 1 }, subjN)).filter(([, n]) => n > 0)
        .map(([subtype, n]) => ({ subtype, n, p: round(Math.min(1, 0.5 + (p.subjective.formats[subtype] || 0.5))), pointsEach: p.subjective.avgPoints ? half(p.subjective.avgPoints) : 5, conditionsTemplate: p.subjective.conditionsSignature.slice(0, 3).map(c => c.template) })) : [];
      const sets = []; const ns = Math.round(p.setHabits.setsPerExam || 0);
      for (let i = 0; i < ns; i++) sets.push({ id: "S" + (i + 1), size: Math.max(2, Math.round(p.setHabits.avgSize || 2)), types: Object.keys(p.setHabits.typesInSets).slice(0, 3), range: i === 0 ? p.setHabits.typicalRange : "" });
      // 지문별 확률
      const pass = (o.passages || []).filter(x => x.kind === "지문" && x.text);
      const recentExam = (o.exams || []).slice().sort((a, b) => TEXT.examTime(b.meta) - TEXT.examTime(a.meta))[0];
      const usedBy = {}; (o.questions || []).forEach(q => { if (q.match && q.match.passageId) (usedBy[q.match.passageId] = usedBy[q.match.passageId] || []).push(q); });
      const pp = p.passagePref, reuse = pp.reuseRate || 0;
      const bucket = (r) => r < 0.33 ? "앞" : r < 0.66 ? "중간" : "뒤";
      const scored = pass.map(x => {
        const fitType = typePlan.reduce((a, t) => a + (shares[t.type] || 0) * fit(t.type, x), 0) / (Object.values(shares).reduce((a, b) => a + b, 0) || 1);
        const fitLen = Math.exp(-Math.pow((x.words - pp.wordsMean) / (pp.wordsSd || 40), 2) / 2);
        const fitPos = Math.min(1, 3 * (pp.positionInScope[bucket(x.posRatio)] || 0.33));
        const fitGenre = Math.min(1, 3 * (pp.genre[x.genre] || 0.2));
        const uses = usedBy[x.id] || [];
        const usedRecent = recentExam && uses.some(q => q.examId === recentExam.id);
        const novelty = !uses.length ? 0.5 * (1 - reuse) : usedRecent ? -0.6 * (1 - reuse) : 0.2 * reuse;
        const clarity = (x.topicIdx >= 0 ? 0.5 : 0) + (has(x, "주장·요지 명확") ? 0.5 : 0);
        const onHandout = inHandout(x);
        const score = 1.0 * fitType + 0.6 * fitLen + 0.5 * fitPos + 0.4 * fitGenre + novelty + 0.3 * clarity + (onHandout ? 1.4 * hRate : 0);
        const reasons = [];
        if (onHandout) reasons.push("선생님 프린트에 실린 지문" + (p.handout ? " (과거 프린트 반영율 " + Math.round(p.handout.rate * 100) + "%)" : ""));
        if (!uses.length) reasons.push("이 범위에서 아직 출제되지 않은 지문 (재출제율 " + Math.round(reuse * 100) + "%)");
        uses.slice(0, 2).forEach(q => { const e = (o.exams || []).find(e => e.id === q.examId); if (e) reasons.push(TEXT.examLabel(e.meta) + "에 " + q.type + "(으)로 출제됨"); });
        if (fitLen > 0.6) reasons.push("길이 " + x.words + "단어 — 선호 길이 " + pp.wordsMean + "±" + pp.wordsSd + " 안");
        const bestType = typePlan.slice().sort((a, b) => fit(b.type, x) * (shares[b.type] || 0) - fit(a.type, x) * (shares[a.type] || 0))[0];
        if (bestType && fit(bestType.type, x) >= 0.9) reasons.push("‘" + (x.feats || [])[0] + "’ 특징 → 자주 내는 " + bestType.type + "(" + Math.round((p.typeDist[bestType.type] || {}).share * 100) + "%) 유형에 알맞음");
        if (x.topicIdx >= 0 && shares.빈칸) reasons.push("주제문이 뚜렷해 빈칸 후보");
        if ((pp.positionInScope[bucket(x.posRatio)] || 0) >= 0.4) reasons.push("범위 " + bucket(x.posRatio) + " 지문 — 선호 위치 비중 " + Math.round(pp.positionInScope[bucket(x.posRatio)] * 100) + "%");
        const gp = (x.grammarTargets || []).find(g => p.grammarPoints[0] && g.point === p.grammarPoints[0].point);
        if (gp) reasons.push("어법 포인트 ‘" + gp.point + "’ 포함 — 이 선생님 어법 1순위");
        const expectedTypes = typePlan.slice().sort((a, b) => fit(b.type, x) * (shares[b.type] || 0) - fit(a.type, x) * (shares[a.type] || 0)).slice(0, 2).map(t => t.type);
        return { passageId: x.id, src: x.src, first: x.first, score, expectedTypes, reasons: reasons.slice(0, 4), history: uses.map(q => ({ examId: q.examId, type: q.type })), onHandout };
      });
      const qPass = Math.max(1, total - Math.round(total * (p.externalRatio || 0)));
      const tau = 0.7; const mx = Math.max(...scored.map(s => s.score), 0);
      const ex = scored.map(s => Math.exp((s.score - mx) / tau)); const z = ex.reduce((a, b) => a + b, 0) || 1;
      scored.forEach((s, i) => { const lam = qPass * ex[i] / z; s.expectedCount = round(lam); s.pUse = round(1 - Math.exp(-lam)); s.score = round(s.score); });
      scored.sort((a, b) => b.pUse - a.pUse);
      // 어법 포인트
      const nGram = (typePlan.find(t => t.type === "어법") || {}).n || 0;
      const countAvg = (p.transformationPrefs.어법 && p.transformationPrefs.어법.countAvg) || 4;
      const grammarPoints = p.grammarPoints.slice(0, 8).map(g => {
        const where = pass.filter(x => (x.grammarTargets || []).some(t => t.point === g.point)).slice(0, 3).map(x => ({ passageId: x.id, src: x.src }));
        const avail = where.length ? 1 : 0.4;
        const onH = hGrammar.has(g.point);
        const E = nGram * countAvg * g.wshare * avail * (onH ? 1 + hRate : 1);
        return { point: g.point, p: round(1 - Math.exp(-E)), reason: "어법 " + Math.round(g.wshare * 100) + "%" + (where.length ? " · " + where[0].src + " 에 있음" : " · 범위 지문에 없음") + (onH ? " · 프린트에 실림" : ""), where, onHandout: onH };
      }).sort((a, b) => b.p - a.p);
      const rel = p.reliability || 0;
      const confidence = { plan: round(rel), passages: round(rel * Math.min(1, (p.basedOn.matchedRate || 0) / 0.7) * (o.scopeComplete ? 1 : 0.7)), grammar: round(rel * Math.min(1, (p.typeDist.어법 ? p.typeDist.어법.n : 0) / 5)) };
      confidence.overall = round((confidence.plan + confidence.passages + confidence.grammar) / 3);
      return { target, profileVersion: o.profileVersion || 0, generatedAt: Date.now(),
        plan: { total, objective: objN, subjective: subjN, points: p.totalPointsAvg || 100, difficultyMix: p.difficultyCurve.mix, typePlan, sets },
        passages: scored.slice(0, 30), grammarPoints, subjectiveFormats: subjFormats, confidence, newMoves: [], refinement: null,
        handout: p.handout ? { rate: p.handout.rate, passagesOnHandout: scored.filter(s => s.onHandout).length, grammarOnHandout: [...hGrammar] } : (hPass.length ? { rate: null, passagesOnHandout: scored.filter(s => s.onHandout).length, grammarOnHandout: [...hGrammar] } : null) };
    }
    // 모델이 한 번 다듬는다 — 규칙(20%·±0.15)을 로컬에서 다시 검사한다
    async function refine(bp, profile, passages, targetLabel, signal) {
      const pmap = {}; passages.forEach(x => { pmap[x.id] = x; });
      const lines = bp.passages.slice(0, 40).map(s => { const x = pmap[s.passageId] || {}; return s.passageId + " | " + (x.src || "") + " | " + (x.genre || "") + " | " + (x.words || "?") + "w | " + (x.feats || []).join(",") + " | " + (x.topicIdx >= 0 ? "있음" : "없음") + " | " + (x.grammarTargets || []).map(g => g.point).join(",") + " | " + (x.gist || ""); }).join("\n");
      const slim = { plan: bp.plan, passages: bp.passages.slice(0, 20).map(s => ({ passage_id: s.passageId, src: s.src, p_use: s.pUse, expected_types: s.expectedTypes, reasons: s.reasons })), grammar_points: bp.grammarPoints.map(g => ({ point: g.point, p: g.p })), subjective_formats: bp.subjectiveFormats };
      const r = await API.json(PROMPTS.refine(PROFILE.compact(profile), slim, lines, targetLabel), { tier: "default", effort: "high", signal, validate: v => v && Array.isArray(v.type_plan) ? "" : "type_plan 없음" });
      const out = JSON.parse(JSON.stringify(bp));
      const adjustments = [];
      // 유형 수: 총 이동 20% 이내
      const orig = {}; bp.plan.typePlan.forEach(t => { orig[t.type] = t.n; });
      let moved = 0; const newPlan = [];
      r.type_plan.forEach(t => { if (!t || !t.type) return; const n = Math.max(0, Math.round(+t.n || 0)); moved += Math.abs(n - (orig[t.type] || 0)); newPlan.push({ type: String(t.type).slice(0, 12), subtype: String(t.subtype || "").slice(0, 30), n, pointsEach: +t.points_each || (orig[t.type] !== undefined ? bp.plan.typePlan.find(x => x.type === t.type).pointsEach : 3), difficulty: ["상", "중", "하"].includes(t.difficulty) ? t.difficulty : "중" }); });
      const newTotal = newPlan.reduce((a, t) => a + t.n, 0);
      if (newPlan.length && newTotal === bp.plan.objective && moved <= Math.max(2, bp.plan.objective * 0.4)) { out.plan.typePlan = newPlan.filter(t => t.n > 0).sort((a, b) => b.n - a.n); adjustments.push({ what: "유형 구성 보정", why: String(r.notes || "").slice(0, 200) }); }
      (Array.isArray(r.passage_adjust) ? r.passage_adjust : []).forEach(a => { const s = out.passages.find(x => x.passageId === a.passage_id); if (!s) return; const v = Math.max(s.pUse - 0.15, Math.min(s.pUse + 0.15, +a.p_use || s.pUse)); if (Math.abs(v - s.pUse) > 0.005) { s.pUse = round(v); if (a.reason) s.reasons = [String(a.reason).slice(0, 120)].concat(s.reasons).slice(0, 4); if (Array.isArray(a.expected_types) && a.expected_types.length) s.expectedTypes = a.expected_types.slice(0, 2).map(String); } });
      out.passages.sort((a, b) => b.pUse - a.pUse);
      (Array.isArray(r.grammar_points) ? r.grammar_points : []).forEach(g => { const s = out.grammarPoints.find(x => x.point === g.point); if (s && typeof g.p === "number") { s.p = round(Math.max(0, Math.min(1, g.p))); if (g.reason) s.reason = String(g.reason).slice(0, 120); } });
      out.grammarPoints.sort((a, b) => b.p - a.p);
      (Array.isArray(r.subjective_formats) ? r.subjective_formats : []).forEach(f => { const s = out.subjectiveFormats.find(x => x.subtype === f.subtype); if (s && Array.isArray(f.conditions_template) && f.conditions_template.length) s.conditionsTemplate = f.conditions_template.slice(0, 3).map(String); });
      out.newMoves = (Array.isArray(r.new_moves) ? r.new_moves : []).map(x => String(x).slice(0, 160)).filter(Boolean).slice(0, 3);
      out.refinement = { applied: true, notes: String(r.notes || "").slice(0, 400), adjustments: adjustments.concat((Array.isArray(r.adjustments) ? r.adjustments : []).slice(0, 6).map(a => ({ what: String(a && a.what || "").slice(0, 80), why: String(a && a.why || "").slice(0, 160) }))) };
      return out;
    }
    // 동형 모의고사 생성기 '요청사항' 칸에 붙여넣을 글 (1,800자 안)
    function copyText(bp, teacher, profile, passages, narrative) {
      const pmap = {}; (passages || []).forEach(x => { pmap[x.id] = x; });
      const L = [];
      L.push("[ORUN ORACLE 출제 지침 · " + teacher.name + "(" + teacher.school + " " + teacher.grade + "학년 " + teacher.subject + ") · " + (bp.target.label || "다음 시험") + " · 신뢰도 " + Math.round(bp.confidence.overall * 100) + "%]");
      L.push("1. 문항 구성: 총 " + bp.plan.total + "문항(객관식 " + bp.plan.objective + " · 서술형 " + bp.plan.subjective + "), 총점 " + bp.plan.points + "점.");
      L.push("2. 유형별 개수: " + bp.plan.typePlan.map(t => t.type + " " + t.n + "(" + t.pointsEach + "점·" + t.difficulty + ")").join(", ") + (bp.subjectiveFormats.length ? ", 서술형 " + bp.subjectiveFormats.map(f => f.subtype + " " + f.n).join("·") : "") + ".");
      if (bp.plan.sets.length) L.push("3. 세트 문항: " + bp.plan.sets.map(s => (s.range ? s.range + "번 " : "") + "한 지문에 " + s.size + "문항(" + s.types.join("·") + ")").join("; ") + ". 반드시 유지.");
      L.push("4. 난이도: 상 " + Math.round((bp.plan.difficultyMix.상 || 0) * 100) + "% · 중 " + Math.round((bp.plan.difficultyMix.중 || 0) * 100) + "% · 하 " + Math.round((bp.plan.difficultyMix.하 || 0) * 100) + "%." + (profile.externalRatio ? " 범위 밖 지문 " + Math.round(profile.externalRatio * 100) + "% 이내." : ""));
      const hot = bp.passages.slice(0, 8).map(s => { const x = pmap[s.passageId]; return (x ? (x.src || "") + " \"" + String(x.first || "").split(/\s+/).slice(0, 5).join(" ") + "…\"" : s.passageId) + "(" + Math.round(s.pUse * 100) + "%·" + s.expectedTypes.join("/") + ")"; });
      if (hot.length) L.push("5. 유력 지문(이 순서로 우선 배정): " + hot.join(" / "));
      const habits = [];
      const tp = profile.transformationPrefs;
      if (tp.빈칸) { const k = Object.keys(tp.빈칸.blankPosition)[0], u = Object.keys(tp.빈칸.blankUnit)[0]; if (k) habits.push("빈칸은 " + k + (u ? "의 " + u + " 단위" : "")); }
      if (tp.어법) habits.push("어법은 " + (Object.keys(tp.어법.technique)[0] || "밑줄") + " " + tp.어법.countAvg + "개");
      if (bp.grammarPoints.length) habits.push("어법 포인트 우선순위: " + bp.grammarPoints.slice(0, 5).map(g => g.point + "(" + Math.round(g.p * 100) + "%)").join(", "));
      if (tp.순서) habits.push("순서는 " + (Object.keys(tp.순서.orderSplit)[0] || "균등 3분할"));
      if (habits.length) L.push("6. 변형 습관: " + habits.join(". ") + ".");
      const st = profile.stemSignature; const ex = Object.values(st.byType).flat()[0];
      L.push("7. 발문·선지: " + (Object.keys(st.honorific)[0] || "하시오") + "체" + (st.bracketPointsRate > 0.5 ? ", 배점 [n점] 표기" : "") + (ex ? ", 예) \"" + ex.example + "\"" : "") + ". 객관식 선지 언어: " + Object.keys(profile.distractorHabits.langByType).slice(0, 6).map(t => t + "=" + (profile.distractorHabits.langByType[t] === "ko" ? "우리말" : "영어")).join(", ") + ".");
      if (bp.subjectiveFormats.length) L.push("8. 서술형: " + bp.subjectiveFormats.map(f => f.subtype + " " + f.n + "문항" + (f.conditionsTemplate.length ? " (조건: " + f.conditionsTemplate.join(" / ") + ")" : "")).join("; ") + ".");
      if (bp.handout && bp.handout.passagesOnHandout) L.push("9. 프린트: 선생님 프린트에 실린 지문 " + bp.handout.passagesOnHandout + "개를 최우선 배정" + (bp.handout.rate !== null ? " (과거 프린트 반영율 " + Math.round(bp.handout.rate * 100) + "%)" : "") + (bp.handout.grammarOnHandout.length ? ", 어법은 " + bp.handout.grammarOnHandout.slice(0, 4).join("·") + " 우선" : "") + ".");
      if (bp.newMoves.length) L.push("10. 이번에 새로 나올 가능성: " + bp.newMoves.join(" / "));
      if (narrative && narrative.watchouts && narrative.watchouts.length) L.push("주의: " + narrative.watchouts.join(" · "));
      let txt = L.join("\n");
      while (txt.length > 1800 && hot.length > 3) { hot.pop(); L[L.findIndex(l => l.startsWith("5. "))] = "5. 유력 지문(이 순서로 우선 배정): " + hot.join(" / "); txt = L.join("\n"); }
      return txt.slice(0, 1800);
    }
    return { blueprint, refine, copyText, largestRemainder, fit };
  })();
