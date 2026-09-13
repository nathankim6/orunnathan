  // ==================================================================
  //  TEXT — 정규화 · 셔글 · 문장 나누기 · 문항 경계 · 파일 종류 추정 · 시험 메타 추정
  // ==================================================================
  const TEXT = (function () {
    const CIRC = "①②③④⑤";
    function norm(s) {
      return String(s || "").toLowerCase().replace(/[“”"‘’'`]/g, "").replace(/[^a-z0-9가-힣\s]/g, " ").replace(/\s+/g, " ").trim();
    }
    function words(s) { return norm(s).split(" ").filter(Boolean); }
    function englishOnly(s) {
      // 한글과 문항 기호를 걷어 낸 영어 본문 — 문항 지문과 범위 원문을 맞춰 볼 때 쓴다.
      // 한글이 섞인 줄이라도 영어 단어는 남긴다 (한 줄에 발문과 지문이 붙어 나오는 추출본이 있다).
      return String(s || "").replace(/[가-힣]+[^\sA-Za-z]*/g, " ")
        .replace(/_{2,}|\(\s*[A-E①-⑤]\s*\)|[①②③④⑤]|\[\s*\d+\s*점\s*\]/g, " ")
        .split(/\s+/).filter(w => /[A-Za-z]/.test(w) || /^\d+$/.test(w) === false && /[.,;:!?'"()-]/.test(w)).join(" ").replace(/\s+/g, " ").trim();
    }
    function shingles(s, k) {
      const w = words(s), out = new Set();
      for (let i = 0; i + k <= w.length; i++) out.add(w.slice(i, i + k).join(" "));
      return out;
    }
    function containment(a, b) {           // |a∩b| / |a|
      if (!a.size) return 0;
      let n = 0; for (const x of a) if (b.has(x)) n++;
      return n / a.size;
    }
    const ABBR = /\b(Mr|Mrs|Ms|Dr|Prof|St|Jr|Sr|vs|etc|e\.g|i\.e|U\.S|No|Fig)\.$/i;
    function splitSentences(t) {
      const out = []; let cur = "";
      for (const piece of String(t || "").replace(/\s+/g, " ").split(/(?<=[.!?]["”’)]?)\s+(?=["“(]?[A-Z0-9])/)) {
        cur += (cur ? " " : "") + piece;
        if (!ABBR.test(cur)) { out.push(cur); cur = ""; }
      }
      if (cur) out.push(cur);
      return out.filter(s => s.trim());
    }
    function bytesOf(s) { let n = 0; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); n += c < 0x80 ? 1 : c < 0x800 ? 2 : c >= 0xd800 && c <= 0xdbff ? 4 : 3; if (c >= 0xd800 && c <= 0xdbff) i++; } return n; }
    // 큰 텍스트를 단락 경계에서 나눈다 (바이트 상한)
    function chunkText(text, maxBytes) {
      const paras = String(text || "").split(/\n{2,}/), out = [];
      let cur = "";
      for (const p of paras) {
        const cand = cur ? cur + "\n\n" + p : p;
        if (bytesOf(cand) > maxBytes && cur) { out.push(cur); cur = p; }
        else cur = cand;
        while (bytesOf(cur) > maxBytes) {       // 한 단락이 상한보다 크면 줄 단위로 자른다
          let cut = Math.floor(cur.length * maxBytes / bytesOf(cur) * 0.9);
          const nl = cur.lastIndexOf("\n", cut); if (nl > cut * 0.5) cut = nl;
          out.push(cur.slice(0, cut)); cur = cur.slice(cut);
        }
      }
      if (cur.trim()) out.push(cur);
      return out;
    }
    // ---- 시험지 정규화·문항 경계 ----
    function normalizeExam(text) {
      let t = String(text || "").replace(/\r/g, "").replace(/-\n(?=[a-z])/g, "");
      // 3번 이상 반복되는 같은 줄(머리글·꼬리글) 제거
      const cnt = {}; t.split("\n").forEach(l => { const k = l.trim(); if (k.length >= 6 && k.length < 60) cnt[k] = (cnt[k] || 0) + 1; });
      const MARK = /^[<\[（(【〈]?\s*(조건|보기|예시|단어|어휘|답안|A|B)\s*[>\]）)】〉]?$/;
      t = t.split("\n").filter(l => { const k = l.trim(); return !(cnt[k] >= 3 && !/^[①②③④⑤]/.test(k) && !MARK.test(k)); }).join("\n");
      return t.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    }
    const Q_START = /^\s*(?:\[?(\d{1,2})\]?\s*[.)．]\s*(?=\S)|(\d{1,2})\s+(?=다음|글|윗글|아래|밑줄|주어진|\(A\)|빈칸))/;
    const SET_HEAD = /^\s*\[\s*(\d{1,2})\s*[~∼～–-]\s*(\d{1,2})\s*\]/;
    const SUBJ_START = /^\s*\[?\s*(서술형|논술형|서답형)\s*(\d{1,2})\s*\]?/;
    const KEY_HEAD = /^\s*[\[【<]?\s*(정답\s*(및|과)?\s*해설|정답표|정답\s*및\s*채점\s*기준|채점\s*기준표?|정답)\s*[\]】>]?\s*$/;
    function splitByQuestion(text) {
      const lines = String(text || "").split("\n");
      const starts = [];                 // {line, number, setId}
      let keyAt = -1, pendingSet = null, lastNo = 0;
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        if (keyAt < 0 && KEY_HEAD.test(l) && starts.length >= 5 && Object.keys(parseAnswerKey(lines.slice(i, i + 40).join("\n"))).length >= 5) { keyAt = i; break; }
        const sh = SET_HEAD.exec(l);
        if (sh) { pendingSet = { a: +sh[1], b: +sh[2], id: sh[1] + "-" + sh[2], line: i }; if (!/\d\s*[.)]/.test(l.slice(sh[0].length))) continue; }
        const sj = SUBJ_START.exec(l);
        if (sj) { starts.push({ line: i, number: "서술형 " + sj[2], setId: "" }); continue; }
        const m = Q_START.exec(l);
        if (m) {
          const no = +(m[1] || m[2]);
          if (no >= 1 && no <= 60 && (no > lastNo || no <= 3) && no <= lastNo + 6) {
            const setId = pendingSet && no >= pendingSet.a && no <= pendingSet.b ? pendingSet.id : "";
            starts.push({ line: setId && no === pendingSet.a && pendingSet.line !== undefined ? pendingSet.line : i, number: String(no), setId });
            lastNo = no;
            if (pendingSet && no >= pendingSet.b) pendingSet = null;
          }
        }
      }
      const end = keyAt >= 0 ? keyAt : lines.length;
      const blocks = starts.map((s, i) => {
        const to = i + 1 < starts.length ? starts[i + 1].line : end;
        return { number: s.number, setId: s.setId, text: lines.slice(s.line, to).join("\n") };
      });
      const head = starts.length ? lines.slice(0, starts[0].line).join("\n") : "";
      const answerKeyText = keyAt >= 0 ? lines.slice(keyAt).join("\n") : "";
      return { blocks, head, answerKeyText, numbers: starts.map(s => s.number) };
    }
    function parseAnswerKey(t) {
      const out = {};
      if (!t) return out;
      const re = /(\d{1,2})\s*[.:)\-]?\s*([①②③④⑤]|[1-5](?![0-9점]))/g;
      let m, n = 0;
      while ((m = re.exec(t))) { const v = m[2]; out[m[1]] = /^[1-5]$/.test(v) ? CIRC[+v - 1] : v; n++; }
      if (n < 5) return {};
      const sj = /서술형\s*(\d)\s*[.:)]\s*(.{3,120}?)(?=서술형|\n\n|$)/gs;
      while ((m = sj.exec(t))) out["서술형 " + m[1]] = m[2].trim();
      return out;
    }
    // 번호 정규화 — '01' → '1', '서술형1' / '[서술형 1]' → '서술형 1'
    function canonNo(s) { return String(s == null ? "" : s).trim().replace(/[.)．]\s*$/, "").replace(/^\[?\s*(서술형|논술형|서답형)\s*(\d+)\s*\]?$/, "서술형 $2").replace(/^\[?0*(\d+)\]?$/, "$1"); }
    function parsePoints(block) { const m = /[\[(]\s*(\d+(?:\.\d)?)\s*점\s*[\])]/.exec(block || ""); return m ? +m[1] : null; }
    // 문항 블록을 상한 글자수로 묶는다 — 세트는 쪼개지 않는다
    function chunkByQuestions(blocks, maxChars) {
      const out = []; let cur = [], len = 0;
      const flush = () => { if (cur.length) { out.push({ text: cur.map(b => b.text).join("\n\n"), numbers: cur.map(b => b.number) }); cur = []; len = 0; } };
      let i = 0;
      while (i < blocks.length) {
        let group = [blocks[i]];
        if (blocks[i].setId) { while (i + group.length < blocks.length && blocks[i + group.length].setId === blocks[i].setId) group.push(blocks[i + group.length]); }
        const gl = group.reduce((a, b) => a + b.text.length, 0);
        if (len + gl > maxChars && cur.length) flush();
        cur.push(...group); len += gl; i += group.length;
      }
      flush();
      return out;
    }
    // 발문 → 템플릿 (숫자·기호를 지워 같은 발문끼리 묶는다)
    function templateOf(stem) {
      return String(stem || "").replace(/\[\s*\d+(\.\d)?\s*점\s*\]/g, "[#점]").replace(/[①②③④⑤]/g, "◯").replace(/\d+/g, "#").replace(/[“”"][^“”"]*[“”"]/g, "“…”").replace(/\s+/g, " ").trim();
    }
    // ---- 파일 종류 추정: 기출 시험지인가 범위 원문인가 ----
    function guessKind(name, text) {
      const head = String(text || "").slice(0, 6000);
      let exam = 0, scope = 0;
      if (/기출|중간|기말|지필|고사|시험지|exam/i.test(name)) exam += 2;
      if (/교과서|부교재|모의고사|본문|지문|단어|lesson|unit|reading|textbook/i.test(name)) scope += 2;
      const circ = (head.match(/[①②③④⑤]/g) || []).length;
      if (circ >= 10) exam += 3; else if (circ < 3) scope += 1;
      if ((head.match(/^\s*\d{1,2}\s*[.)]/gm) || []).length >= 8) exam += 2;
      if (/서술형|배점|\[\s*\d(\.\d)?\s*점\s*\]|다음 글의|윗글/.test(head)) exam += 2;
      if (/\[\s*\d{1,2}\s*[~∼-]\s*\d{1,2}\s*\]/.test(head)) exam += 1;
      const paras = head.split(/\n{2,}/).filter(p => p.trim());
      const enParas = paras.filter(p => (p.match(/[.!?]\s/g) || []).length >= 3 && words(p).length >= 40 && !/[가-힣]/.test(p.slice(0, 80)));
      if (paras.length && enParas.length / paras.length >= 0.5 && circ < 3) scope += 3;
      if (/Lesson\s*\d|Unit\s*\d|Reading\s*\d|Words?\s*&\s*Phrases|Vocabulary/i.test(head)) scope += 2;
      if (/프린트|학습지|handout|worksheet|보충|핵심\s*정리|요점|정리본|예상\s*문제/i.test(name)) return { kind: "handout", confidence: 0.9, sure: true };
      const score = exam - scope;
      return { kind: score >= 0 ? "exam" : "scope", confidence: Math.min(1, Math.abs(score) / 6), sure: Math.abs(score) >= 3 };
    }
    function guessExamMeta(text, name, teacher) {
      const src = (name || "") + "\n" + String(text || "").slice(0, 3000);
      const pick = (re, i) => { const m = re.exec(src); return m ? (m[i] || m[1] || "") : ""; };
      const year = pick(/(20\d\d)/, 1);
      const grade = pick(/([1-3])\s*학년|고\s*([1-3])/, 0);
      const semester = pick(/([12])\s*학기/, 1);
      const term = /기말/.test(src) ? "기말" : /중간/.test(src) ? "중간" : /2\s*차\s*지필/.test(src) ? "2차지필" : /1\s*차\s*지필/.test(src) ? "1차지필" : "";
      const subject = pick(/(영어\s*(?:독해와\s*작문|I{1,2}|Ⅰ|Ⅱ|1|2)|공통\s*영어|실용\s*영어|영어)/, 1).replace(/\s+/g, "");
      const school = pick(/([가-힣]{2,8}(?:고등학교|여고|고))(?![가-힣])/, 1);
      const gm = /([1-3])\s*학년|고\s*([1-3])/.exec(src);
      return {
        year: year ? +year : new Date().getFullYear(), yearGuessed: !year,
        grade: gm ? +(gm[1] || gm[2]) : (teacher && teacher.grade) || 1, gradeGuessed: !gm,
        semester: semester ? +semester : (new Date().getMonth() < 7 ? 1 : 2), semesterGuessed: !semester,
        term: term || "중간", termGuessed: !term,
        subject: subject || (teacher && teacher.subject) || "영어", subjectGuessed: !subject,
        school: school || (teacher && teacher.school) || "", schoolGuessed: !school,
      };
    }
    function examLabel(m) { return (m.year || "") + " " + (m.semester ? m.semester + "학기 " : "") + (m.term || "") + (m.subject ? " · " + m.subject : ""); }
    function examTime(m) { return (+m.year || 2000) + (m.semester === 1 ? (m.term === "중간" || m.term === "1차지필" ? 0.25 : 0.45) : (m.term === "중간" || m.term === "1차지필" ? 0.75 : 0.95)); }
    async function sha256(s) {
      try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); }
      catch (e) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return "h" + (h >>> 0).toString(16); }
    }
    function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
    function fmtDate(ms) { const d = new Date(ms || Date.now()); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
    function fmtBytes(n) { return n < 1024 ? n + " B" : n < 1048576 ? (n / 1024).toFixed(0) + " KB" : (n / 1048576).toFixed(1) + " MB"; }
    return { norm, words, englishOnly, shingles, containment, splitSentences, bytesOf, chunkText, normalizeExam, splitByQuestion, parseAnswerKey, parsePoints, canonNo,
             chunkByQuestions, templateOf, guessKind, guessExamMeta, examLabel, examTime, sha256, esc, fmtDate, fmtBytes, CIRC };
  })();
