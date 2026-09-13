  // ==================================================================
  //  GENERATE — 적중 모의고사. 청사진 → 문항 계획(지문 배정) → 모델 생성(5문항씩) → 검증 → 시험지 HTML · DOCX
  // ==================================================================
  const GENERATE = (function () {
    const CIRC = TEXT.CIRC;
    const ORDER_OPTS = ["① (A)-(C)-(B)", "② (B)-(A)-(C)", "③ (B)-(C)-(A)", "④ (C)-(A)-(B)", "⑤ (C)-(B)-(A)"];
    const mode = (m) => { let b = null, bv = -1; Object.keys(m || {}).forEach(k => { if (m[k] > bv) { bv = m[k]; b = k; } }); return b; };

    // ---- 청사진 → 문항 계획 ----
    // plan({ bp, profile, passages, questions, count, strength }) → items[]
    function plan(o) {
      const bp = o.bp, p = o.profile;
      const scale = o.count && bp.plan.total ? o.count / bp.plan.total : 1;
      const objN = Math.max(1, Math.round(bp.plan.objective * scale)), subjN = Math.round(bp.plan.subjective * scale);
      // 유형별 개수 (배율 반영)
      const shares = {}; bp.plan.typePlan.forEach(t => { shares[t.type] = t.n; });
      const counts = scale === 1 ? shares : PREDICT.largestRemainder(shares, objN);
      // 이 선생님 시험에서 유형이 놓이는 평균 위치
      const pos = {}; const byExam = {};
      (o.questions || []).forEach(q => { (byExam[q.examId] = byExam[q.examId] || []).push(q); });
      Object.values(byExam).forEach(g => { const n = g.length || 1; g.forEach(q => { (pos[q.type] = pos[q.type] || []).push(q.order / n); }); });
      const meanPos = (t) => pos[t] ? pos[t].reduce((a, b) => a + b, 0) / pos[t].length : 0.5;
      let items = [];
      bp.plan.typePlan.forEach(t => { for (let i = 0; i < (counts[t.type] || 0); i++) items.push({ type: t.type, subtype: t.subtype, format: "5지선다", points: t.pointsEach, difficulty: t.difficulty, sortKey: meanPos(t.type) + i * 0.011 }); });
      items.sort((a, b) => a.sortKey - b.sortKey);
      // 세트: 앞쪽 문항 몇 개를 세트로 묶어 습관 자리로 옮긴다
      const sets = (bp.plan.sets || []).slice(0, 2);
      sets.forEach((s, si) => {
        const size = Math.min(s.size, Math.max(2, Math.floor(items.length / 3)));
        const members = [];
        (s.types.length ? s.types : ["내용일치", "빈칸", "제목"]).forEach(t => { if (members.length >= size) return; const k = items.findIndex(x => !x.set && x.type === t); if (k >= 0) members.push(items.splice(k, 1)[0]); });
        while (members.length < size && items.some(x => !x.set)) { const k = items.findIndex(x => !x.set); members.push(items.splice(k, 1)[0]); }
        if (members.length < 2) { items.push(...members); return; }
        const rangeStart = /^(\d+)/.test(s.range || "") ? +RegExp.$1 - 1 : Math.floor(items.length * 0.45);
        const at = Math.max(0, Math.min(items.length, rangeStart));
        const label = (at + 1) + "-" + (at + members.length);
        members.forEach((m, i) => { m.set = label; m.setRole = i === 0 ? "first" : "member"; m.setId = "S" + si; });
        items.splice(at, 0, ...members);
      });
      // 서술형
      const subjStyle = (o.questions || []).some(q => /^서술형/.test(q.number)) ? "서술형" : "번호";
      const sf = bp.subjectiveFormats.length ? bp.subjectiveFormats : [{ subtype: "조건영작", n: subjN, pointsEach: 5, conditionsTemplate: [] }];
      const sfCounts = PREDICT.largestRemainder(sf.reduce((m, f) => { m[f.subtype] = f.n || 1; return m; }, {}), subjN);
      let sk = 0;
      sf.forEach(f => { for (let i = 0; i < (sfCounts[f.subtype] || 0); i++) { sk++; items.push({ type: "서술형", subtype: f.subtype, format: "서술형", points: f.pointsEach || (p.subjective.avgPoints ? Math.round(p.subjective.avgPoints * 2) / 2 : 5), difficulty: "중", conditions: f.conditionsTemplate || [], subjNo: sk }); } });
      items.forEach((it, i) => { it.number = it.type === "서술형" && subjStyle === "서술형" ? "서술형 " + it.subjNo : String(i + 1); it.order = i + 1; });
      // 지문 배정
      const pmap = {}; (o.passages || []).forEach(x => { pmap[x.id] = x; });
      let ranked = bp.passages.filter(s => pmap[s.passageId]).map(s => ({ s, x: pmap[s.passageId] }));
      const inBp = new Set(ranked.map(r => r.x.id));                       // 청사진 상위 밖의 지문도 뒤에 붙여 둔다 — 배정 못 받는 문항이 없게
      (o.passages || []).forEach(x => { if (!inBp.has(x.id)) ranked.push({ s: { passageId: x.id, expectedTypes: [], pUse: 0, reasons: [] }, x }); });
      if (o.strength === "wide") {         // 단원별로 골고루 — 단원 묶음을 번갈아 뽑는다
        const groups = {}; ranked.forEach(r => { (groups[r.x.lessonKey || r.x.src || "?"] = groups[r.x.lessonKey || r.x.src || "?"] || []).push(r); });
        const gs = Object.values(groups); const mixed = []; let any = true;
        while (any) { any = false; gs.forEach(g => { if (g.length) { mixed.push(g.shift()); any = true; } }); }
        ranked = mixed;
      }
      const used = {}; const maxUse = Math.max(1, p.passagePref.perPassageMax || 1);
      const pick = (it, wantLong) => {
        const cand = (pref) => ranked.find(r => (used[r.x.id] || 0) < pref.max && (!pref.type || r.s.expectedTypes.includes(pref.type)) && (!wantLong || r.x.words >= p.passagePref.wordsMean * 1.4) && (!pref.feat || (r.x.feats || []).includes(pref.feat)));
        const leastUsed = () => ranked.slice().sort((a, b) => (used[a.x.id] || 0) - (used[b.x.id] || 0))[0];
        const r = cand({ max: 1, type: it.type }) || (it.type === "서술형" ? cand({ max: 1, feat: "서술형 적합" }) : null) || cand({ max: 1 }) || cand({ max: maxUse, type: it.type }) || cand({ max: maxUse }) || leastUsed();
        if (r) used[r.x.id] = (used[r.x.id] || 0) + 1;
        return r ? r.x : null;
      };
      const setPassage = {};
      items.forEach(it => {
        if (it.set) { if (it.setRole === "first") { setPassage[it.setId] = pick(it, (p.passagePref.scale["2배"] || 0) > 0.3); it.passage = setPassage[it.setId]; } else it.passage = null; }
        else it.passage = pick(it, false);
        it.transformHint = hint(it, p, bp, it.passage || setPassage[it.setId]);
        it.distractorStyle = distractorLine(it, p);
      });
      return items;
    }
    function hint(it, p, bp, x) {
      const tp = p.transformationPrefs || {};
      const first = (m) => mode(m) || "";
      switch (it.type) {
        case "빈칸": return "빈칸은 " + (tp.빈칸 ? first(tp.빈칸.blankPosition) || "주제문" : "주제문") + (tp.빈칸 && first(tp.빈칸.blankUnit) ? " · " + first(tp.빈칸.blankUnit) + " 단위" : "") + (x && x.blankCandidates && x.blankCandidates.length ? " (후보 문장 번호 " + x.blankCandidates.join(", ") + ", 0부터)" : "");
        case "어법": { const pts = bp.grammarPoints.slice(0, 4).map(g => g.point); const inP = (x && x.grammarTargets || []).map(g => g.point + "(" + g.sent + "번째 문장)"); return "밑줄 " + ((tp.어법 && tp.어법.countAvg) || 5) + "개 · " + (tp.어법 ? first(tp.어법.technique) || "밑줄어법" : "밑줄어법") + " · 포인트 우선순위: " + pts.join(", ") + (inP.length ? " · 지문 안 후보: " + inP.join(", ") : ""); }
        case "어휘": return "밑줄 어휘 5개 · 오답은 " + ((tp.어휘 && first(tp.어휘.vocabSwap)) || "반의어") + " 방식";
        case "순서": return "순서 분할: " + ((tp.순서 && first(tp.순서.orderSplit)) || "균등3분할") + " · 선지 고정 배열";
        case "삽입": return "삽입 문장 위치: " + ((tp.삽입 && first(tp.삽입.insertPosition)) || "중간") + " · ( ① )~( ⑤ ) 고르게";
        case "요약문": return "요약문 빈칸 (A)(B) 2개 · 선지는 (A)-(B) 쌍";
        case "무관한문장": return "흐름과 무관한 문장 1개를 원문 사이에 삽입(주제 관련·문체 유사)";
        case "내용일치": case "내용불일치": return "원문 그대로 · 선지는 " + ((p.distractorHabits.langByType[it.type] === "ko") ? "우리말" : "영어");
        case "서술형": return (it.subtype || "조건영작") + " · 조건: " + (it.conditions && it.conditions.length ? it.conditions.join(" / ") : "이 선생님 습관대로") + " · 모범답안·채점기준 포함";
        default: return "원문 그대로 두고 " + it.type + " 발문";
      }
    }
    function distractorLine(it, p) {
      const st = Object.keys(p.distractorHabits.style || {}).slice(0, 3);
      return (st.length ? st.join("·") : "패러프레이즈·부분진실") + " · 선지 " + (p.distractorHabits.langByType[it.type] === "ko" ? "우리말" : "영어") + (p.distractorHabits.parallelRate > 0.6 ? " · 평행 구조" : "") + (p.stemSignature.bracketPointsRate > 0.5 ? " · 발문 끝에 [" + it.points + "점]" : "");
    }
    // 출제자 시그니처 — 실제 발문·선지·조건 표본
    function signature(p, questions) {
      const L = [];
      Object.keys(p.stemSignature.byType).forEach(t => p.stemSignature.byType[t].slice(0, 2).forEach(s => L.push("발문 | " + t + " | " + s.example)));
      const withOpts = (questions || []).filter(q => q.options.length === 5 && q.options.every(o => o.text)).slice(0, 3);
      withOpts.forEach(q => L.push("선지 표본 | " + q.type + " | " + q.options.map(o => o.label + " " + o.text).join("  ")));
      const conds = (questions || []).filter(q => q.subjective && q.subjective.conditions.length).flatMap(q => q.subjective.conditions).slice(0, 4);
      conds.forEach(c => L.push("서술형 조건 | " + c));
      L.push("오답 습관 | " + Object.keys(p.distractorHabits.style || {}).slice(0, 3).join(", ") + " · 평행 구조 비율 " + Math.round((p.distractorHabits.parallelRate || 0) * 100) + "%");
      L.push("문체 | " + (mode(p.stemSignature.honorific) || "하시오") + "체 · 어미 " + (mode(p.stemSignature.ending) || "것은?") + " · 배점 표기 " + (p.stemSignature.bracketPointsRate > 0.5 ? "[n점]" : "없음") + " · 평가원 유사도 " + p.stemSignature.kiceLikeMean);
      return L.join("\n");
    }
    // ---- 검증 ----
    // 모델이 준 지문 HTML 을 DOM 으로 다시 짓는다 — p·b·u·br 만 남기고 속성은 전부 버린다 (스크립트·이벤트 핸들러가 살아남지 못한다)
    function sanitize(html) {
      const raw = String(html || "");
      if (typeof document === "undefined") return raw.replace(/<(script|style|template|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "").replace(/<\/?([a-z0-9]+)[^>]*>/gi, (m, t) => { t = t.toLowerCase(); return t === "br" ? "<br>" : /^(p|b|u)$/.test(t) ? (m[1] === "/" ? "</" + t + ">" : "<" + t + ">") : ""; }).replace(/&(?!amp;|lt;|gt;|quot;|#\d+;)/g, "&amp;");
      const tpl = document.createElement("template"); tpl.innerHTML = raw;
      const OK = { P: 1, B: 1, U: 1, BR: 1 };
      const walk = (node) => { let out = ""; node.childNodes.forEach(c => { if (c.nodeType === 3) out += TEXT.esc(c.nodeValue); else if (c.nodeType === 1) { const tag = c.tagName; if (tag === "BR") out += "<br>"; else if (OK[tag]) { const t = tag.toLowerCase(); out += "<" + t + ">" + walk(c) + "</" + t + ">"; } else if (!/^(SCRIPT|STYLE|TEMPLATE|IFRAME|OBJECT|EMBED)$/.test(tag)) out += walk(c); } }); return out; };
      return walk(tpl.content);
    }
    const stripTags = (h) => String(h || "").replace(/<[^>]+>/g, " ");
    function validate(q, it, passage) {
      if (!q || typeof q !== "object") return "문항이 없음";
      const isSubj = it.format === "서술형";
      if (!q.stem || String(q.stem).trim().length < 6) return "발문 없음";
      if (!isSubj) {
        const opts = Array.isArray(q.options) ? q.options.map(String) : [];
        if (opts.length !== 5) return "선지 5개 아님";
        const bodies = opts.map(o => o.replace(/^[①②③④⑤]\s*/, "").trim());
        if (bodies.some(b => !b) || new Set(bodies).size < 5) return "선지 비었거나 중복";
        const a = String(q.answer || "").trim();
        if (!/^[①②③④⑤]$/.test(a)) return "정답 기호 아님";
        if (it.type === "순서") { const norm = opts.map(o => o.replace(/\s/g, "")); if (ORDER_OPTS.some((o, i) => norm[i] !== o.replace(/\s/g, ""))) return "순서 선지 배열이 고정형과 다름"; }
      } else {
        if (!q.subjective || !String(q.subjective.model_answer || "").trim()) return "모범답안 없음";
      }
      if (it.setRole !== "member") {
        if (!passage) return "지문 배정 없음";
        const ph = stripTags(q.passage_html);
        if (TEXT.words(ph).length < 20) return "지문 없음";
        if (passage && passage.text) {
          const c = TEXT.containment(TEXT.shingles(ph, 6), TEXT.shingles(passage.text, 6));
          if (c < (it.type === "순서" || it.type === "삽입" || it.type === "무관한문장" ? 0.35 : 0.5)) return "지문이 원문과 다름 (겹침 " + Math.round(c * 100) + "%)";
        }
      }
      return "";
    }
    function normalizeOut(q, it) {
      const out = { number: it.number, type: it.type, subtype: it.subtype || "", format: it.format, points: it.points, difficulty: it.difficulty, set: it.set || "", setRole: it.setRole || "",
        stem: String(q.stem || "").trim().slice(0, 300), given: String(q.given || "").slice(0, 1500), passageHtml: it.setRole === "member" ? "" : sanitize(q.passage_html),
        options: it.format === "서술형" ? [] : q.options.map((o, i) => { const s = String(o).trim(); return /^[①②③④⑤]/.test(s) ? s : CIRC[i] + " " + s; }),
        answer: String(q.answer || "").trim().slice(0, 300), explanation: String(q.explanation || "").slice(0, 1200), hitBasis: String(q.hit_basis || "").slice(0, 300),
        passageId: it.passage ? it.passage.id : (q.source && q.source.passage_id) || "", passageSrc: it.passage ? it.passage.src : "" };
      if (it.format === "서술형") out.subjective = { modelAnswer: String(q.subjective.model_answer || "").slice(0, 800), conditions: (Array.isArray(q.subjective.conditions) ? q.subjective.conditions : []).map(String).slice(0, 6), rubric: (Array.isArray(q.subjective.rubric) ? q.subjective.rubric : []).slice(0, 6).map(r => ({ item: String(r && r.item || ""), points: +(r && r.points) || 0 })) };
      return out;
    }
    // ---- 생성 ----
    // run(items, { target, teacherName, signature, onStep, signal, onText }) → { questions, failed[] }
    async function run(items, ctx) {
      const system = PROMPTS.generateSystem(ctx.signature);
      const batches = []; let cur = [];
      items.forEach(it => { if (cur.length >= 5 && !(it.set && cur.length && cur[cur.length - 1].setId === it.setId)) { batches.push(cur); cur = []; } cur.push(it); });
      if (cur.length) batches.push(cur);
      const out = [], failed = [];
      let done = 0;
      const gen = async (group, depth) => {
        if (ctx.signal && ctx.signal.aborted) throw API.err("cancelled", "중단됨");
        if (ctx.onStep) ctx.onStep({ phase: "generate", i: done, n: items.length, numbers: group.map(g => g.number) });
        let r;
        try {
          r = await API.json(PROMPTS.generateUser(group.map(g => g.number), ctx.target, ctx.teacherName, group), { system, cacheSystem: true, tier: "complex", effort: "high", signal: ctx.signal, onText: ctx.onText,
            validate: v => v && Array.isArray(v.questions) ? "" : "questions 없음" });
        } catch (e) {
          if (e.code !== "invalid_json" || group.length === 1 || depth > 2) throw e;
          const mid = Math.ceil(group.length / 2);            // 해석 실패 — 반으로 나눠 다시
          await gen(group.slice(0, mid), depth + 1); await gen(group.slice(mid), depth + 1); return;
        }
        const retry = [];
        for (const it of group) {
          const q = r.questions.find(x => x && String(x.number).trim() === it.number) || r.questions[group.indexOf(it)];
          const why = validate(q, it, it.passage || (it.set ? (group.find(g => g.setId === it.setId && g.passage) || {}).passage : null));
          if (!why) { out.push(normalizeOut(q, it)); done++; }
          else { it._tries = (it._tries || 0) + 1; if (it._tries <= 2) { it._why = why; retry.push(it); } else { failed.push({ number: it.number, type: it.type, why }); done++; } }
        }
        for (const it of retry) {
          if (it.set && it.setRole === "member") { const f = group.find(g => g.setId === it.setId && g.setRole === "first"); it.passage = it.passage || (f && f.passage); }
          await gen([Object.assign({}, it, { transformHint: it.transformHint + " (이전 시도 문제: " + it._why + " — 원문 어절을 바꾸지 말고 규칙을 지키세요)" })], depth + 1);
        }
      };
      for (const b of batches) await gen(b, 0);
      const key = (n) => /^서술형/.test(n) ? 1000 + (+n.replace(/\D/g, "") || 0) : +n.replace(/\D/g, "") || 0;
      out.sort((a, b) => key(a.number) - key(b.number));
      return { questions: out, failed };
    }

    // ---- 시험지 HTML ----
    function paperHtml(mock, teacher) {
      const e = TEXT.esc;
      const head = '<div class="phd"><table class="phead"><tr><td class="pt" rowspan="2"><b>' + e(mock.title || "적중 모의고사") + '</b><span>' + e(teacher.school + " " + teacher.grade + "학년 " + teacher.subject) + '</span></td><td class="pk">출제 예측</td><td>' + e(mock.target || "") + '</td></tr><tr><td class="pk">이름</td><td>&nbsp;</td></tr></table></div>';
      const qs = mock.questions.map(q => {
        let h = '<div class="pq' + (q.set && q.setRole === "first" ? " pset" : "") + '">';
        if (q.set && q.setRole === "first") h += '<p class="pset-h">[' + e(q.set.replace("-", "~")) + '] 다음 글을 읽고 물음에 답하시오.</p>';
        if (q.passageHtml && (q.set ? q.setRole === "first" : true) && q.set) h += '<div class="ppass">' + q.passageHtml + '</div>';
        h += '<p class="pstem"><b>' + e(q.number) + '.</b> ' + e(q.stem) + '</p>';
        if (q.given) h += '<div class="pgiven">' + e(q.given) + '</div>';
        if (q.passageHtml && !q.set) h += '<div class="ppass">' + q.passageHtml + '</div>';
        if (q.options.length) h += '<ol class="popts">' + q.options.map(o => '<li>' + e(o) + '</li>').join("") + '</ol>';
        if (q.subjective) { if (q.subjective.conditions.length) h += '<div class="pcond"><b>&lt;조건&gt;</b><br>' + q.subjective.conditions.map(c => e(c)).join("<br>") + '</div>'; h += '<div class="pans">답: ______________________________________________</div>'; }
        h += '</div>';
        return h;
      }).join("");
      const key = '<div class="pkey"><h3>정답 및 해설</h3>' + mock.questions.map(q => '<div class="pk1"><b>' + e(q.number) + '.</b> ' + e(q.subjective ? q.subjective.modelAnswer : q.answer) + (q.explanation ? '<div class="pexp">' + e(q.explanation) + '</div>' : "") + (q.hitBasis ? '<div class="phit">적중 근거 · ' + e(q.hitBasis) + '</div>' : "") + (q.subjective && q.subjective.rubric.length ? '<div class="prub">채점: ' + q.subjective.rubric.map(r => e(r.item) + "(" + r.points + "점)").join(" · ") + '</div>' : "") + '</div>').join("") + '</div>';
      return head + '<div class="pbody">' + qs + '</div>' + key;
    }
    // ---- DOCX ----
    function htmlRuns(D, html, FONT) {
      const runs = []; let bold = false, ul = false;
      String(html || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").split(/(<\/?[bu]>|<p>)/i).forEach(part => {
        if (/^<b>$/i.test(part)) bold = true; else if (/^<\/b>$/i.test(part)) bold = false;
        else if (/^<u>$/i.test(part)) ul = true; else if (/^<\/u>$/i.test(part)) ul = false;
        else if (/^<p>$/i.test(part)) {}
        else if (part) { const t = part.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"'); t.split("\n").forEach((line, i) => { if (i) runs.push(new D.TextRun({ break: 1 })); if (line) runs.push(new D.TextRun({ text: line, bold, underline: ul ? {} : undefined, size: 16, font: FONT })); }); }
      });
      return runs;
    }
    async function docx(mock, teacher) {
      if (typeof globalThis.docx === "undefined" || !globalThis.docx.Document) throw new Error("워드 저장 라이브러리를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.");
      const D = globalThis.docx, FONT = "함초롬바탕";
      const T = (t, o) => new D.TextRun(Object.assign({ text: t, size: 16, font: FONT }, o || {}));
      const P = (children, o) => new D.Paragraph(Object.assign({ children, spacing: { after: 40 } }, o || {}));
      const E = { style: D.BorderStyle.SINGLE, size: 6, color: "000000" }, bd = { top: E, bottom: E, left: E, right: E };
      const cell = (children, o) => new D.TableCell(Object.assign({ borders: bd, verticalAlign: D.VerticalAlign.CENTER, margins: { top: 60, bottom: 60, left: 90, right: 90 }, children }, o || {}));
      const headTable = new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, columnWidths: [6772, 1400, 2600], rows: [
        new D.TableRow({ children: [cell([P([T(mock.title || "적중 모의고사", { bold: true, size: 28 })], { alignment: D.AlignmentType.CENTER }), P([T(teacher.school + " " + teacher.grade + "학년 " + teacher.subject, { size: 18 })], { alignment: D.AlignmentType.CENTER })], { rowSpan: 2 }), cell([P([T("출제 예측", { bold: true })])]), cell([P([T(mock.target || "")])])] }),
        new D.TableRow({ children: [cell([P([T("이름", { bold: true })])]), cell([P([T("")])])] }),
      ] });
      const body = [];
      mock.questions.forEach(q => {
        if (q.set && q.setRole === "first") body.push(P([T("[" + q.set.replace("-", "~") + "] 다음 글을 읽고 물음에 답하시오.", { bold: true })], { keepNext: true, spacing: { before: 120, after: 60 } }));
        if (q.passageHtml && q.set && q.setRole === "first") body.push(P(htmlRuns(D, q.passageHtml, FONT), { alignment: D.AlignmentType.JUSTIFIED, border: { top: E, bottom: E, left: E, right: E }, spacing: { after: 80 } }));
        body.push(P([T(q.number + ". ", { bold: true }), T(q.stem)], { keepNext: true, spacing: { before: 100, after: 60 } }));
        if (q.given) body.push(P([T(q.given)], { border: { top: E, bottom: E, left: E, right: E }, spacing: { after: 60 } }));
        if (q.passageHtml && !q.set) body.push(P(htmlRuns(D, q.passageHtml, FONT), { alignment: D.AlignmentType.JUSTIFIED, border: { top: E, bottom: E, left: E, right: E }, spacing: { after: 80 } }));
        q.options.forEach(o => body.push(P([T(o)], { spacing: { after: 20 } })));
        if (q.subjective) { if (q.subjective.conditions.length) body.push(P([T("<조건> ", { bold: true })].concat(q.subjective.conditions.flatMap((c, i) => [new D.TextRun({ break: i ? 1 : 0 }), T(c)])), { border: { top: E, bottom: E, left: E, right: E } })); body.push(P([T("답: ____________________________________________")])); }
        body.push(P([], { spacing: { after: 200 } }));
      });
      const key = [new D.Paragraph({ pageBreakBefore: true, keepNext: true, spacing: { after: 120 }, children: [T("정답 및 해설", { bold: true, size: 24 })] })];
      mock.questions.forEach(q => { key.push(P([T(q.number + ". ", { bold: true }), T(q.subjective ? q.subjective.modelAnswer : q.answer)])); if (q.explanation) key.push(P([T(q.explanation, { size: 15 })], { spacing: { after: 80 } })); if (q.hitBasis) key.push(P([T("적중 근거 · " + q.hitBasis, { size: 14, color: "555555" })], { spacing: { after: 120 } })); });
      const PAGE = { size: { width: 11906, height: 16838 }, margin: { top: 567, right: 567, bottom: 567, left: 567, header: 0, footer: 0, gutter: 0 } };
      const doc = new D.Document({ creator: "ORUN ENGLISH", title: mock.title || "적중 모의고사", styles: { default: { document: { run: { font: FONT, size: 16 }, paragraph: { spacing: { line: 276 } } } } },
        sections: [{ properties: { page: PAGE, column: { count: 1 } }, children: [headTable, P([], { spacing: { after: 120 } })] },
                   { properties: { page: PAGE, column: { count: 2, space: 340, separate: true }, type: D.SectionType.CONTINUOUS }, children: body.concat(key) }] });
      const blob = await D.Packer.toBlob(doc);
      // docx-js 9.1 은 문단 테두리를 top·bottom·left·right 순으로 쓰는데 스키마 순서는 top·left·bottom·right 다
      try { const zip = await JSZip.loadAsync(blob); const f = zip.file("word/document.xml"); if (f) { const xml = await f.async("string"); const fixed = xml.replace(/(<w:pBdr>)(<w:top[^>]*\/>)?(<w:bottom[^>]*\/>)(<w:left[^>]*\/>)/g, "$1$2$4$3"); if (fixed !== xml) { zip.file("word/document.xml", fixed); return await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", compression: "DEFLATE" }); } } } catch (e) {}
      return blob;
    }
    return { plan, signature, run, validate, sanitize, paperHtml, docx, ORDER_OPTS };
  })();
