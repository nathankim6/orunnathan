// 모의 LLM — 프롬프트의 [작업] 문구를 보고 그럴듯한 JSON 을 SSE 로 돌려준다
const fs = require("fs"), path = require("path");
const PASS = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/passages.json"), "utf8"));
const TYPES = ["주제", "빈칸", "어법", "제목", "삽입", "내용불일치"];
function sse(text) {
  const ev = (type, obj) => "event: " + type + "\ndata: " + JSON.stringify(Object.assign({ type }, obj)) + "\n\n";
  let out = ev("message_start", { message: { usage: { input_tokens: 1000, cache_read_input_tokens: 0 } } });
  for (let i = 0; i < text.length; i += 400) out += ev("content_block_delta", { index: 0, delta: { type: "text_delta", text: text.slice(i, i + 400) } });
  out += ev("message_delta", { delta: { stop_reason: "end_turn" }, usage: { output_tokens: Math.ceil(text.length / 4) } }) + ev("message_stop", {});
  return out;
}
function section(prompt, head) { const i = prompt.indexOf(head); return i < 0 ? "" : prompt.slice(i + head.length); }
function answer(prompt) {
  if (/이 파일이 \(A\) 학교 기출 시험지인지/.test(prompt)) return { kind: /①/.test(prompt) ? "exam" : "scope", confidence: 0.9, reason: "mock", meta: {} };
  if (/각 문항을 아래 필드로 데이터화합니다/.test(prompt)) {
    const text = section(prompt, "[시험지 텍스트]");
    const qs = [];
    const re = /^(\d{1,2})\. (.+)$/gm; let m;
    while ((m = re.exec(text))) {
      const n = +m[1], stem = m[2], i = n - 1;
      const type = /주제/.test(stem) ? "주제" : /빈칸/.test(stem) ? "빈칸" : /어법/.test(stem) ? "어법" : /제목/.test(stem) ? "제목" : /들어가기에/.test(stem) ? "삽입" : "내용불일치";
      const p = PASS[i % PASS.length][1];
      qs.push({ number: String(n), type, subtype: type === "빈칸" ? "빈칸-구" : "", format: "5지선다", points: /\[3점\]/.test(stem) ? 3 : 2, points_printed: /점/.test(stem), difficulty: ["상", "중", "하"][n % 3], difficulty_reason: "mock", stem, options: ["to repeat small actions daily", "to make grand resolutions", "to study ancient philosophy", "to avoid stable contexts", "to confirm modern psychology"].map((t, k) => ({ label: "①②③④⑤"[k], text: t })), answer: "", answer_source: "none",
        passage: { has: true, lang: "en", first10: p.split(" ").slice(0, 10).join(" "), last6: p.split(" ").slice(-6).join(" "), words: p.split(" ").length, scale: "보통" }, set: "", set_role: "",
        transformation: { technique: type === "빈칸" ? "빈칸" : type === "어법" ? "밑줄어법" : "원문그대로", blank_position: type === "빈칸" ? "마지막문장" : "", blank_unit: type === "빈칸" ? "절" : "", grammar_points: type === "어법" ? ["수일치", "시제"] : [], grammar_count: type === "어법" ? 5 : 0, order_split: "", insert_position: type === "삽입" ? "중간" : "", underline_count: type === "어법" ? 5 : 0, vocab_swap: "", summary_blanks: 0 },
        distractor: { style: ["패러프레이즈", "부분진실"], parallel: true, lang: "en", lengths: [28, 26, 28, 24, 29] }, external: false, external_reason: "", ko_stem: { ending: "것은?", honorific: "하시오", bracket_points: /\[3점\]/.test(stem), kice_like: 0.9 }, subjective: null, features: "mock feature", confidence: 0.9 });
    }
    if (/서술형 1\./.test(text)) qs.push({ number: "서술형 1", type: "서술형", subtype: "조건영작", format: "서술형", points: 5, points_printed: true, difficulty: "중", stem: "다음 조건에 맞게 영작하시오. [5점]", options: [], answer: "", answer_source: "none", passage: { has: false, lang: "en", first10: "", last6: "", words: 0, scale: "보통" }, set: "", set_role: "", transformation: { technique: "기타", blank_position: "", blank_unit: "", grammar_points: [], grammar_count: 0, order_split: "", insert_position: "", underline_count: 0, vocab_swap: "", summary_blanks: 0 }, distractor: { style: [], parallel: false, lang: "en", lengths: [] }, external: false, external_reason: "", ko_stem: { ending: "쓰시오", honorific: "하시오", bracket_points: true, kice_like: 0.7 }, subjective: { conditions: ["주어진 단어를 모두 사용할 것", "10단어 이내로 쓸 것"], answer_len: "10단어 이내", rubric_printed: false }, features: "조건영작", confidence: 0.9 });
    return { exam_info: { title: "동작고 1학년 영어", year: /2025/.test(text) ? 2025 : null, semester: /1학기/.test(text) ? 1 : 2, term: /기말/.test(text) ? "기말" : "중간", grade: "고1", subject: "영어", total_questions: qs.length, objective: qs.length - 1, subjective: 1, total_points: 20, has_explanations: false, summary: "교과서 지문 그대로, 빈칸·어법 위주의 시험 (mock)" }, questions: qs };
  }
  if (/'지문 단위'를 모두 찾아 목록으로/.test(prompt)) {
    const text = section(prompt, "[자료 텍스트]");
    return PASS.filter(([src]) => text.includes(src)).map(([src, p], i) => ({ id: "P" + (i + 1), kind: "지문", src, lesson_key: "L" + src[7], genre: ["설명문", "논설문"][i % 2], first: p.split(" ").slice(0, 10).join(" "), last: p.split(" ").slice(-6).join(" "), gist: "요지 " + src, words: p.split(" ").length, feats: ["주장·요지 명확", "예시 열거"], topic_idx: 0, blank_candidates: [0, 5], grammar_targets: [{ point: "수일치", sent: 1 }, { point: "관계사", sent: 3 }], order_friendly: i % 2 === 0, insert_friendly: true, difficulty_est: "중" }));
  }
  if (/나눠 준 프린트\(학습지\)/.test(prompt) && prompt.includes("[프린트 텍스트]")) {
    const text = section(prompt, "[프린트 텍스트]");
    const passages = PASS.filter(([src, p]) => text.includes(p)).map(([src, p], i) => ({ id: "H" + (i + 1), src, first: p.split(" ").slice(0, 10).join(" "), last: p.split(" ").slice(-6).join(" "), gist: "프린트 요지 " + src, words: p.split(" ").length, feats: ["교과서 재수록"], topic_idx: 0, blank_candidates: [5], grammar_targets: [{ point: "수일치", sent: 1 }] }));
    const items = [];
    const sec = (head) => { const i = text.indexOf(head); if (i < 0) return ""; const rest = text.slice(i + head.length); const j = rest.search(/\n\[/); return j < 0 ? rest : rest.slice(0, j); };
    sec("[어법 핵심 정리]").split("\n").forEach(l => { const m = /^- ([^:]+): (.+)$/.exec(l.trim()); if (m) items.push({ kind: "어법", text: m[2].slice(0, 80), point: m[1].trim(), stem: "", words: [] }); });
    const vocab = sec("[단어 정리]").trim(); if (vocab) items.push({ kind: "어휘", text: vocab.slice(0, 80), point: "", stem: "", words: vocab.split(/,\s*/).map(w => w.trim()).filter(Boolean) });
    sec("[예상 문제]").split("\n").forEach(l => { const m = /^\d+\. (.+)$/.exec(l.trim()); if (m) items.push({ kind: "예상문제", text: m[1].slice(0, 80), point: "", stem: m[1], words: [] }); });
    return { passages, items };
  }
  if (/어느 지문에서 왔는지 확정/.test(prompt)) { const nums = [...section(prompt, "[문항 — 번호").matchAll(/^(\S+) \| /gm)].map(m => m[1]); return { matches: nums.map(n => ({ number: n, passage_id: "", external: null, confidence: 0.4, altered: "" })) }; }
  if (/생성형 AI\(GPT 등\)의 도움을 받아/.test(prompt)) return { llm_score: 0.35, confidence: 0.6, evidence: [{ signal: "S4", direction: "human", quote: "것은?", note: "사람 손 흔적 (mock)" }], summary_ko: "판단 유보 (mock)" };
  if (/출제 성향을 학원 강사가 학생에게 설명하듯/.test(prompt)) return { narrative: "교과서 지문을 그대로 쓰되 빈칸과 어법을 즐겨 냅니다. (mock 서술)", keywords: ["교과서 그대로", "빈칸 선호", "어법 5개", "3점 배점", "서술형 1"], watchouts: ["마지막 문장 빈칸 대비", "수일치·시제 어법", "조건영작 10단어"] };
  if (/통계가 놓치는 것을 보정해 청사진을 다듬으세요/.test(prompt)) {
    const bp = JSON.parse(section(prompt, "[원안 청사진]\n").split("\n\n[범위 지문 목록")[0]);
    return { type_plan: bp.plan.typePlan.map(t => ({ type: t.type, subtype: t.subtype, n: t.n, points_each: t.pointsEach, difficulty: t.difficulty })), passage_adjust: [{ passage_id: bp.passages[0].passage_id, p_use: Math.min(1, bp.passages[0].p_use + 0.1), expected_types: ["빈칸"], reason: "mock 보정" }], grammar_points: [{ point: "수일치", p: 0.8, reason: "mock" }], subjective_formats: [], new_moves: ["세트 문항에 요약문 결합 가능성 (mock)"], notes: "mock 보정 요지", adjustments: [{ what: "P1 확률 +0.1", why: "mock" }] };
  }
  if (/아래 청사진의 문항 .* 출제합니다/.test(prompt)) {
    const items = [...prompt.matchAll(/■ (\S+(?: \d+)?)번 · ([^·\n]+?)(?:\(([^)]*)\))? · (\S+) · ([\d.]+)점 · 난이도 (\S)([^\n]*)\n([\s\S]*?)(?=\n\n■|$)/g)];
    const qs = items.map(m => {
      const number = m[1], type = m[2].trim(), format = m[4], points = +m[5], diff = m[6], rest = m[7], body = m[8];
      const set = /세트 (\S+) \((\w+)\)/.exec(rest); const pm = /\[지문 원문 (\S+) ·[^\]]*\]\n([\s\S]*)/.exec(body);
      const ptext = pm ? pm[2].trim() : "";
      const isSubj = format === "서술형";
      const q = { number, type, subtype: m[3] || "", format, points, difficulty: diff, set: set ? set[1] : "", set_role: set ? set[2] : "", stem: (type === "빈칸" ? "다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?" : type === "어법" ? "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?" : type === "순서" ? "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?" : isSubj ? "다음 조건에 맞게 영작하시오." : "다음 글의 " + type + "(으)로 가장 적절한 것은?") + " [" + points + "점]", given: "",
        passage_html: set && set[2] === "member" ? "" : "<p>" + (type === "빈칸" ? ptext.replace(/\.\s*$/, "").replace(/[^.]*\.$/, "________________.") : ptext) + "</p>",
        options: type === "순서" ? ["① (A)-(C)-(B)", "② (B)-(A)-(C)", "③ (B)-(C)-(A)", "④ (C)-(A)-(B)", "⑤ (C)-(B)-(A)"] : ["① mock option one", "② mock option two", "③ mock option three", "④ mock option four", "⑤ mock option five"], answer: "③", explanation: "정답 근거 (mock). 오답은 부분 진실.", hit_basis: "빈칸 비중 " + type + " (mock)", source: { passage_id: pm ? pm[1] : "" }, subjective: isSubj ? { model_answer: "Repeated habits become automatic.", conditions: ["주어진 단어를 모두 사용할 것"], rubric: [{ item: "단어 사용", points: 3 }, { item: "문법", points: 2 }] } : null };
      if (isSubj) q.options = [];
      return q;
    });
    return { questions: qs };
  }
  return { ok: true };
}
module.exports = { sse, answer };
