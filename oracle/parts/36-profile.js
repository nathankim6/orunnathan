  // ==================================================================
  //  PROFILE — 출제자 프로파일. LLM 없이 저장된 문항 전체에서 결정적으로 계산한다.
  //  같은 문항이면 같은 결과가 나온다. 서술(narrative)만 모델이 쓴다.
  // ==================================================================
  const PROFILE = (function () {
    const HALF_LIFE = 2;   // 년 — 옛 시험일수록 가중치가 반으로 준다
    const round = (x, d) => { const m = Math.pow(10, d === undefined ? 3 : d); return Math.round((+x || 0) * m) / m; };
    function dist(items, key, w) {          // 가중 분포 { k: share }
      const m = {}; let tot = 0;
      items.forEach(it => { const k = key(it); if (k === undefined || k === null || k === "") return; const ww = w ? w(it) : 1; m[k] = (m[k] || 0) + ww; tot += ww; });
      const out = {}; Object.keys(m).sort((a, b) => m[b] - m[a]).forEach(k => { out[k] = round(m[k] / (tot || 1)); });
      return out;
    }
    function jsd(p, q) {                   // Jensen–Shannon divergence, log2 → 0..1
      const keys = new Set([...Object.keys(p), ...Object.keys(q)]); let d = 0;
      keys.forEach(k => { const a = p[k] || 0, b = q[k] || 0, m = (a + b) / 2; if (a) d += 0.5 * a * Math.log2(a / m); if (b) d += 0.5 * b * Math.log2(b / m); });
      return Math.max(0, Math.min(1, d));
    }
    function slope(ys, ws) {               // 가중 최소제곱 기울기 (x = 0..k)
      if (ys.length < 2) return 0;
      let sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
      ys.forEach((y, x) => { const w = ws ? ws[x] : 1; sw += w; sx += w * x; sy += w * y; sxx += w * x * x; sxy += w * x * y; });
      const den = sw * sxx - sx * sx; return den ? (sw * sxy - sx * sy) / den : 0;
    }
    function mode(m) { let best = null, bv = -1; Object.keys(m).forEach(k => { if (m[k] > bv) { bv = m[k]; best = k; } }); return best; }
    const LEVELS = [{ id: 0, name: "대기", q: 0, e: 0, r: 0 }, { id: 1, name: "감지", q: 10, e: 1, r: 0 }, { id: 2, name: "학습", q: 30, e: 2, r: 0 }, { id: 3, name: "숙련", q: 80, e: 3, r: 0.55 }, { id: 4, name: "통달", q: 150, e: 5, r: 0.75 }];
    function levelOf(nq, ne, rel) {
      let lv = LEVELS[0];
      for (const L of LEVELS) if (nq >= L.q && ne >= L.e && (rel || 0) >= L.r) lv = L;
      const next = LEVELS[lv.id + 1];
      let need = "";
      if (next) { const parts = []; if (nq < next.q) parts.push("문항 " + (next.q - nq) + "개"); if (ne < next.e) parts.push("시험 " + (next.e - ne) + "개"); if ((rel || 0) < next.r) parts.push("신뢰도 " + round(next.r - (rel || 0), 2) + " 더"); need = parts.join(" · "); }
      return { id: lv.id, name: lv.name, next: next ? { id: next.id, name: next.name, need } : null };
    }

    // buildProfile({ teacher, exams, questions, passages, now }) → profile
    function build(o) {
      const now = o.now || Date.now();
      const nowYears = new Date(now).getFullYear() + (new Date(now).getMonth() + 1) / 12;
      const exams = (o.exams || []).slice().sort((a, b) => TEXT.examTime(a.meta) - TEXT.examTime(b.meta));
      const examById = {}; exams.forEach(e => { examById[e.id] = e; e._w = Math.pow(0.5, Math.max(0, nowYears - TEXT.examTime(e.meta)) / HALF_LIFE); e._t = TEXT.examTime(e.meta); });
      const qs = (o.questions || []).filter(q => examById[q.examId]);
      const pById = {}; (o.passages || []).forEach(p => { pById[p.id] = p; });
      const W = (q) => examById[q.examId]._w;
      const nq = qs.length, ne = exams.length;
      const subj = (q) => ANALYZE.isSubj(q);
      const objQ = qs.filter(q => !subj(q)), subQ = qs.filter(subj);
      const matchedQ = qs.filter(q => q.match && q.match.passageId);
      const withPassage = qs.filter(q => q.passage && q.passage.has && q.setRole !== "member");

      // 유형 분포
      const typeShare = dist(qs, q => q.type), typeW = dist(qs, q => q.type, W);
      const typeDist = {};
      Object.keys(typeW).forEach(t => {
        const tq = qs.filter(q => q.type === t), pts = tq.map(q => q.points).filter(p => p !== null);
        typeDist[t] = { n: tq.length, share: typeShare[t] || 0, wshare: typeW[t], perExam: round(tq.length / ne, 1),
          avgPoints: pts.length ? round(pts.reduce((a, b) => a + b, 0) / pts.length, 2) : null, difficulty: dist(tq, q => q.difficulty), subtypes: dist(tq, q => q.subtype || "") };
      });
      const formatMix = { 객관식: round(objQ.length / (nq || 1)), 서술형: round(subQ.length / (nq || 1)) };
      const allPts = qs.map(q => q.points).filter(p => p !== null);
      const subjPts = subQ.map(q => q.points).filter(p => p !== null);
      const pointsHist = dist(qs.filter(q => q.points !== null), q => String(q.points));
      const perExam = exams.map(e => qs.filter(q => q.examId === e.id));
      const totalQAvg = ne ? round(perExam.reduce((a, g) => a + g.length, 0) / ne, 1) : 0;
      const objAvg = ne ? round(perExam.reduce((a, g) => a + g.filter(q => !subj(q)).length, 0) / ne, 1) : 0;
      const ptsSamples = exams.map(e => e.analysis && e.analysis.points).filter(Boolean);
      const totalPtsAvg = ptsSamples.length ? Math.round(ptsSamples.reduce((a, b) => a + b, 0) / ptsSamples.length) : 100;
      const diffMix = dist(qs, q => q.difficulty, W);
      const dnum = { 하: 1, 중: 2, 상: 3 };
      const byDecile = Array.from({ length: 10 }, (_, d) => { const g = qs.filter(q => Math.min(9, Math.floor(((q.order - 1) / Math.max(1, perExam.find(x => x[0] && x[0].examId === q.examId) ? perExam.find(x => x[0] && x[0].examId === q.examId).length : nq)) * 10)) === d); return g.length ? round(g.reduce((a, q) => a + dnum[q.difficulty], 0) / g.length, 2) : null; });
      // 서술형
      const condTemplates = dist(subQ.flatMap(q => q.subjective ? q.subjective.conditions.map(c => c.replace(/\d+/g, "#")) : []), c => c);
      const subjective = { ratio: formatMix.서술형, perExam: round(subQ.length / (ne || 1), 1), avgPoints: subjPts.length ? round(subjPts.reduce((a, b) => a + b, 0) / subjPts.length, 1) : null,
        formats: dist(subQ, q => q.subtype || "기타"), conditionsSignature: Object.keys(condTemplates).slice(0, 5).map(t => ({ template: t, share: condTemplates[t] })),
        answerLen: mode(subQ.reduce((m, q) => { const a = q.subjective && q.subjective.answerLen; if (a) m[a] = (m[a] || 0) + 1; return m; }, {})) || "" };
      // 변형 습관
      const tp = {};
      const tq = (t) => qs.filter(q => q.type === t);
      if (tq("빈칸").length >= 3) tp.빈칸 = { blankPosition: dist(tq("빈칸"), q => q.transformation.blankPosition), blankUnit: dist(tq("빈칸"), q => q.transformation.blankUnit) };
      if (tq("어법").length >= 2) { const g = tq("어법"); tp.어법 = { technique: dist(g, q => q.transformation.technique), countAvg: round(g.reduce((a, q) => a + (q.transformation.grammarCount || q.transformation.underlineCount || 0), 0) / g.length, 1) }; }
      if (tq("순서").length >= 2) tp.순서 = { orderSplit: dist(tq("순서"), q => q.transformation.orderSplit) };
      if (tq("삽입").length >= 2) tp.삽입 = { insertPosition: dist(tq("삽입"), q => q.transformation.insertPosition) };
      if (tq("어휘").length >= 2) tp.어휘 = { vocabSwap: dist(tq("어휘"), q => q.transformation.vocabSwap) };
      // 어법 포인트
      const gpAll = qs.flatMap(q => q.transformation.grammarPoints.map(p => ({ p, q })));
      const gpW = dist(gpAll, x => x.p, x => W(x.q));
      const grammarPoints = tq("어법").length >= 2 ? Object.keys(gpW).map(p => {
        const xs = gpAll.filter(x => x.p === p); const ex = new Set(xs.map(x => x.q.examId));
        const half = Math.floor(exams.length / 2); const recent = new Set(exams.slice(half).map(e => e.id));
        const rn = xs.filter(x => recent.has(x.q.examId)).length, on = xs.length - rn;
        return { point: p, n: xs.length, wshare: gpW[p], exams: ex.size, trend: exams.length >= 2 ? (rn > on ? "+" : rn < on ? "-" : "=") : "=" };
      }).slice(0, 12) : [];
      // 지문 선호
      const mp = matchedQ.map(q => pById[q.match.passageId]).filter(Boolean);
      const wlen = withPassage.map(q => q.passage.words).filter(w => w > 30);
      const wm = wlen.length ? wlen.reduce((a, b) => a + b, 0) / wlen.length : 140;
      const wsd = wlen.length > 1 ? Math.sqrt(wlen.reduce((a, b) => a + (b - wm) * (b - wm), 0) / wlen.length) : 40;
      const bucket = (r) => r < 0.33 ? "앞" : r < 0.66 ? "중간" : "뒤";
      const usedCount = {}; matchedQ.forEach(q => { usedCount[q.match.passageId] = (usedCount[q.match.passageId] || 0) + 1; });
      const usedExams = {}; matchedQ.forEach(q => { (usedExams[q.match.passageId] = usedExams[q.match.passageId] || new Set()).add(q.examId); });
      const usedIds = Object.keys(usedCount);
      const passagePref = { wordsMean: Math.round(wm), wordsSd: Math.round(Math.max(20, wsd)), sampled: wlen.length, genre: dist(mp, p => p.genre), positionInScope: dist(mp, p => bucket(p.posRatio)), lessonDist: dist(mp, p => p.lessonKey),
        reuseRate: usedIds.length ? round(usedIds.filter(id => usedExams[id].size >= 2).length / usedIds.length, 2) : 0, perPassageMax: usedIds.length ? Math.max(...usedIds.map(id => usedCount[id])) : 1,
        scale: dist(withPassage, q => q.passage.scale) };
      const extKnown = qs.filter(q => q.external !== null && q.setRole !== "member");
      const externalRatio = extKnown.length ? round(extKnown.filter(q => q.external).length / extKnown.length) : 0;
      // 세트
      const setKeys = {}; qs.forEach(q => { if (q.set) (setKeys[q.examId + ":" + q.set] = setKeys[q.examId + ":" + q.set] || []).push(q); });
      const sets = Object.values(setKeys);
      const setHabits = { setsPerExam: round(sets.length / (ne || 1), 1), avgSize: sets.length ? round(sets.reduce((a, s) => a + s.length, 0) / sets.length, 1) : 0, typesInSets: dist(sets.flat(), q => q.type), shareOfQuestions: round(sets.flat().length / (nq || 1)),
        typicalRange: mode(sets.reduce((m, s) => { const k = s[0].set; m[k] = (m[k] || 0) + 1; return m; }, {})) || "" };
      // 선지 습관
      const mc = objQ.filter(q => q.options.some(o => o.text));
      const distractorHabits = { style: dist(objQ.flatMap(q => q.distractor.style.map(s => ({ s, q }))), x => x.s), parallelRate: mc.length ? round(mc.filter(q => q.distractor.parallel).length / mc.length, 2) : 0,
        lenCvMean: (() => { const v = mc.map(q => q.local && q.local.optLenCv).filter(x => typeof x === "number"); return v.length ? round(v.reduce((a, b) => a + b, 0) / v.length, 2) : null; })(),
        langByType: Object.keys(typeDist).reduce((m, t) => { const d = dist(qs.filter(q => q.type === t && q.options.length), q => q.distractor.lang); m[t] = mode(d) || "en"; return m; }, {}) };
      // 발문 시그니처
      const byType = {};
      Object.keys(typeDist).forEach(t => {
        const g = qs.filter(q => q.type === t && q.stem); const d = {}; g.forEach(q => { d[q.stemTemplate] = (d[q.stemTemplate] || 0) + 1; });
        byType[t] = Object.keys(d).sort((a, b) => d[b] - d[a]).slice(0, 3).map(tpl => { const ex = g.filter(q => q.stemTemplate === tpl).sort((a, b) => examById[b.examId]._t - examById[a.examId]._t)[0]; return { template: tpl, n: d[tpl], example: ex.stem }; });
      });
      const stemSignature = { byType, honorific: dist(qs, q => q.koStem.honorific), ending: dist(qs, q => q.koStem.ending), bracketPointsRate: round(qs.filter(q => q.koStem.bracketPoints).length / (nq || 1), 2),
        kiceLikeMean: round(qs.reduce((a, q) => a + q.koStem.kiceLike, 0) / (nq || 1), 2) };
      // 드리프트
      const byPeriod = exams.map(e => { const g = qs.filter(q => q.examId === e.id); const pts = g.map(q => q.points).filter(p => p !== null);
        return { period: TEXT.examLabel(e.meta), examId: e.id, n: g.length, typeDist: dist(g, q => q.type), subjRatio: round(g.filter(subj).length / (g.length || 1), 2),
          avgPoints: pts.length ? round(pts.reduce((a, b) => a + b, 0) / pts.length, 2) : null, externalRatio: round(g.filter(q => q.external).length / (g.length || 1), 2),
          grammarTop: Object.keys(dist(g.flatMap(q => q.transformation.grammarPoints), x => x)).slice(0, 3), ai: e.ai ? e.ai.aiLikelihood : null }; });
      const ws = exams.map(e => e._w);
      const trend = { subjRatioSlope: round(slope(byPeriod.map(p => p.subjRatio), ws)), avgPointsSlope: round(slope(byPeriod.map(p => p.avgPoints || 0), ws)), externalSlope: round(slope(byPeriod.map(p => p.externalRatio), ws)), typeSlopes: {} };
      Object.keys(typeDist).forEach(t => { trend.typeSlopes[t] = round(slope(byPeriod.map(p => p.typeDist[t] || 0), ws)); });
      const recent = byPeriod.slice(-2), old = byPeriod.slice(0, -2);
      const merge = (ps) => { const m = {}; ps.forEach(p => Object.keys(p.typeDist).forEach(k => { m[k] = (m[k] || 0) + p.typeDist[k] / ps.length; })); return m; };
      const recentVsOld = old.length ? round(jsd(merge(recent), merge(old))) : null;
      // 일관성·신뢰도
      let consistency = { overall: null, type: null, format: null, points: null };
      if (ne >= 2) {
        const sw = ws.reduce((a, b) => a + b, 0);
        const cT = 1 - byPeriod.reduce((a, p, i) => a + ws[i] * jsd(p.typeDist, typeW), 0) / sw;
        const cF = 1 - byPeriod.reduce((a, p, i) => a + ws[i] * jsd({ 객: 1 - p.subjRatio, 서: p.subjRatio }, { 객: formatMix.객관식, 서: formatMix.서술형 }), 0) / sw;
        const cP = 1 - byPeriod.reduce((a, p, i) => a + ws[i] * jsd(dist(qs.filter(q => q.examId === p.examId && q.points !== null), q => String(q.points)), pointsHist), 0) / sw;
        consistency = { overall: round(0.5 * cT + 0.25 * cF + 0.25 * cP, 2), type: round(cT, 2), format: round(cF, 2), points: round(cP, 2) };
      }
      const reliability = round((1 - Math.exp(-nq / 40)) * Math.pow(Math.min(1, ne / 4), 0.5) * (0.55 + 0.45 * (consistency.overall === null ? 0.5 : consistency.overall)), 2);
      const level = levelOf(nq, ne, reliability);
      const refl = exams.filter(e => e.reflection && e.reflection.n).map(e => ({ v: e.reflection.rate, w: e._w, label: TEXT.examLabel(e.meta), kinds: e.reflection.kinds }));
      const handout = refl.length ? { rate: round(refl.reduce((a, x) => a + x.v * x.w, 0) / refl.reduce((a, x) => a + x.w, 0), 2), byExam: refl.map(x => ({ label: x.label, rate: x.v })), kinds: refl.reduce((m, x) => { Object.keys(x.kinds || {}).forEach(k => { m[k] = (m[k] || 0) + x.kinds[k]; }); return m; }, {}), nExams: refl.length } : null;
      const aiVals = exams.filter(e => e.ai).map(e => ({ v: e.ai.aiLikelihood, w: e._w }));
      const aiMean = aiVals.length ? round(aiVals.reduce((a, x) => a + x.v * x.w, 0) / aiVals.reduce((a, x) => a + x.w, 0), 2) : null;
      return {
        computedAt: now, halfLifeYears: HALF_LIFE,
        basedOn: { examIds: exams.map(e => e.id), nExams: ne, nQuestions: nq, span: ne ? { from: TEXT.examLabel(exams[0].meta), to: TEXT.examLabel(exams[ne - 1].meta) } : null, matchedRate: withPassage.length ? round(Math.min(1, matchedQ.filter(q => q.setRole !== "member").length / withPassage.length), 2) : 0, nPassages: (o.passages || []).filter(p => p.kind === "지문").length },
        typeDist, formatMix, pointsHist, totalPointsAvg: totalPtsAvg, totalPointsSampled: ptsSamples.length, totalQuestionsAvg: totalQAvg, objectiveAvg: objAvg, subjectiveAvg: round(totalQAvg - objAvg, 1),
        avgPoints: allPts.length ? round(allPts.reduce((a, b) => a + b, 0) / allPts.length, 2) : null,
        difficultyCurve: { mix: diffMix, byDecile }, subjective, transformationPrefs: tp, grammarPoints, passagePref, externalRatio, setHabits, distractorHabits, stemSignature,
        handout, drift: { byPeriod, trend, recentVsOld }, consistency, reliability, level, ai: { mean: aiMean, exams: exams.filter(e => e.ai).map(e => ({ examId: e.id, label: TEXT.examLabel(e.meta), v: e.ai.aiLikelihood, band: e.ai.band, label2: e.ai.label })) },
      };
    }
    // 프롬프트용 압축본
    function compact(p) {
      const top = (m, n) => Object.keys(m || {}).slice(0, n).reduce((o, k) => { o[k] = m[k]; return o; }, {});
      return { basedOn: p.basedOn, typeDist: Object.keys(p.typeDist).reduce((o, t) => { o[t] = { share: p.typeDist[t].share, perExam: p.typeDist[t].perExam, avgPoints: p.typeDist[t].avgPoints }; return o; }, {}),
        formatMix: p.formatMix, totalQuestionsAvg: p.totalQuestionsAvg, totalPointsAvg: p.totalPointsAvg, difficulty: p.difficultyCurve.mix,
        subjective: { perExam: p.subjective.perExam, avgPoints: p.subjective.avgPoints, formats: p.subjective.formats, conditions: p.subjective.conditionsSignature.slice(0, 3) },
        transformationPrefs: p.transformationPrefs, grammarPoints: p.grammarPoints.slice(0, 6), passagePref: { wordsMean: p.passagePref.wordsMean, genre: top(p.passagePref.genre, 3), positionInScope: p.passagePref.positionInScope, reuseRate: p.passagePref.reuseRate },
        externalRatio: p.externalRatio, setHabits: p.setHabits, distractor: { style: top(p.distractorHabits.style, 3), parallelRate: p.distractorHabits.parallelRate, langByType: p.distractorHabits.langByType },
        stem: { honorific: top(p.stemSignature.honorific, 2), ending: top(p.stemSignature.ending, 2), bracketPointsRate: p.stemSignature.bracketPointsRate, kiceLikeMean: p.stemSignature.kiceLikeMean },
        trend: p.drift.trend, recentVsOld: p.drift.recentVsOld, consistency: p.consistency.overall, reliability: p.reliability, aiMean: p.ai.mean, handout: p.handout };
    }
    function stemSamples(p, n) {
      const out = []; Object.keys(p.stemSignature.byType).forEach(t => { p.stemSignature.byType[t].slice(0, 2).forEach(s => out.push(t + " | " + s.example)); });
      return out.slice(0, n || 12).join("\n");
    }
    // 두 판의 차이 → 사람이 읽을 줄 (이펙트 트리거)
    function diff(prev, next) {
      const lines = [], d = { headline: lines };
      if (!prev) { lines.push("첫 프로파일 — 시험 " + next.basedOn.nExams + "개 · 문항 " + next.basedOn.nQuestions + "개로 학습"); return d; }
      if (prev.level.id !== next.level.id) lines.push("단계 " + prev.level.name + " → " + next.level.name + (next.level.id > prev.level.id ? " 진입" : ""));
      if (Math.abs(next.reliability - prev.reliability) >= 0.05) lines.push("신뢰도 " + prev.reliability + " → " + next.reliability);
      const types = new Set([...Object.keys(prev.typeDist), ...Object.keys(next.typeDist)]);
      types.forEach(t => { const a = prev.typeDist[t] ? prev.typeDist[t].share : 0, b = next.typeDist[t] ? next.typeDist[t].share : 0; if (Math.abs(a - b) >= 0.05) lines.push(t + " 비중 " + Math.round(a * 100) + "% → " + Math.round(b * 100) + "%"); });
      const pg = new Set(prev.grammarPoints.map(g => g.point)); next.grammarPoints.slice(0, 5).forEach(g => { if (!pg.has(g.point)) lines.push("‘" + g.point + "’ 어법 포인트 첫 등장"); });
      if (Math.abs(next.formatMix.서술형 - prev.formatMix.서술형) >= 0.04) lines.push("서술형 비중 " + Math.round(prev.formatMix.서술형 * 100) + "% → " + Math.round(next.formatMix.서술형 * 100) + "%");
      if (next.basedOn.nQuestions !== prev.basedOn.nQuestions) lines.push("학습 문항 " + prev.basedOn.nQuestions + " → " + next.basedOn.nQuestions + "개");
      if (next.handout && (!prev.handout || Math.abs(next.handout.rate - prev.handout.rate) >= 0.05)) lines.push("프린트 반영율 " + (prev.handout ? Math.round(prev.handout.rate * 100) + "% → " : "") + Math.round(next.handout.rate * 100) + "%");
      if (!lines.length) lines.push("지난 판과 달라진 점이 없어요");
      return d;
    }
    // 무대의 성좌 그래프 재료: 노드 = 유형(비중), 엣지 = 이어 나오는 유형 쌍
    function constellation(p, questions) {
      const types = Object.keys(p.typeDist).slice(0, 10);
      const nodes = types.map(t => ({ label: t, share: p.typeDist[t].share }));
      const idx = {}; types.forEach((t, i) => { idx[t] = i; });
      const pair = {};
      const byExam = {}; (questions || []).forEach(q => { (byExam[q.examId] = byExam[q.examId] || []).push(q); });
      Object.values(byExam).forEach(g => { g.sort((a, b) => a.order - b.order); for (let i = 1; i < g.length; i++) { const a = idx[g[i - 1].type], b = idx[g[i].type]; if (a === undefined || b === undefined || a === b) continue; const k = Math.min(a, b) + "-" + Math.max(a, b); pair[k] = (pair[k] || 0) + 1; } });
      const edges = Object.keys(pair).sort((a, b) => pair[b] - pair[a]).slice(0, 14).map(k => { const [a, b] = k.split("-").map(Number); return [a, b, pair[k]]; });
      return { nodes, edges };
    }
    async function narrate(p, signal) {
      const r = await API.json(PROMPTS.narrative(compact(p), stemSamples(p, 10)), { tier: "small", effort: "medium", signal, validate: v => v && v.narrative ? "" : "narrative 없음" });
      return { text: String(r.narrative || "").slice(0, 1200), keywords: (Array.isArray(r.keywords) ? r.keywords : []).map(k => String(k).slice(0, 14)).filter(Boolean).slice(0, 5),
               watchouts: (Array.isArray(r.watchouts) ? r.watchouts : []).map(k => String(k).slice(0, 60)).filter(Boolean).slice(0, 3), at: Date.now() };
    }
    return { build, compact, stemSamples, diff, constellation, narrate, levelOf, jsd };
  })();
