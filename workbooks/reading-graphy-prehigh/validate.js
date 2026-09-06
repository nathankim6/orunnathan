/* 유닛 데이터 정합성 검사.  node validate.js 1 2 3 …  (인자 없으면 있는 유닛 전부) */
const fs = require("fs");
const CIR = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳".split("");
const nos = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync(__dirname + "/units").map(f => f.match(/^u(\d+)\.js$/)?.[1]).filter(Boolean);

let bad = 0;
const err = (u, l, m) => { bad++; console.log(`  U${u} L${l}  ${m}`); };

for (const nn of nos) {
  const pad = String(nn).padStart(2, "0");
  const U = require(`./units/u${pad}.js`);
  const A = require(`./art/u${pad}.js`);
  const { S } = require("./pics.js");
  console.log(`Unit ${U.no} · ${U.field}`);
  if (U.lessons.length !== 5) err(U.no, "-", `레슨 ${U.lessons.length}개 (5개여야 함)`);

  for (const t of U.lessons) {
    const L = t.no, n = t.sent.length;
    if (t.kor.length !== n) err(L, L, `지문 ${n}문장 ≠ 해석 ${t.kor.length}줄`);
    const words = t.sent.join(" ").split(/\s+/).length;
    if (words < 165 || words > 210) err(U.no, L, `지문 ${words} 단어 (165–210 권장)`);

    /* 삽화 연결 */
    if (!A.icons[t.key]) err(U.no, L, `아이콘 없음: ${t.key}`);
    if (!A.scenes[t.key]) err(U.no, L, `배너 없음: ${t.key}`);
    if (!A.VIG[t.no]) err(U.no, L, `비네트 없음`);
    const strip = A.STRIP[t.no] || [];
    if (strip.length !== 5) err(U.no, L, `픽토그램 ${strip.length}개 (5개여야 함)`);
    strip.forEach(p => { if (!S[p]) err(U.no, L, `픽토그램 없음: ${p}`); });

    /* 삽화 규격 검사는 새 규격(SCENECAP 를 내보내는 art 파일)에만 적용한다 — 구 규격은 면제 */
    const NEWART = !!A.SCENECAP;
    const c = t.accent, sv = NEWART && A.scenes[t.key] ? A.scenes[t.key](c, t.tint, t.deep) : "";
    for (const m of sv.matchAll(/<g data-fig="1" transform="translate\((-?[\d.]+) (-?[\d.]+)\) scale\((-?[\d.]+) (-?[\d.]+)\)/g)) {
      const y = +m[2], s = Math.abs(+m[4]);
      if (s < 0.6) err(U.no, L, `배너 인물 축척 ${s} (0.6 이상)`);
      if (y - 156 * s < 8) err(U.no, L, `배너 인물 머리가 viewBox 위로 잘림 (y ${y}, s ${s})`);
    }
    const panels = (sv.match(/<rect [^>]*rx="10"[^>]*stroke-width="1.5"/g) || []).length;
    const chips = (sv.match(/<circle [^>]*r="11"/g) || []).length - (sv.match(/<circle [^>]*r="11"[^>]*\/><text [^>]*y="[\d.]+"[^>]*font-size="12"/g) || []).length;
    const chipN = (sv.match(/<circle cx="[\d.]+" cy="[\d.]+" r="11"/g) || []).length;
    if (panels >= 2 && chipN !== 0 && chipN < panels) err(U.no, L, `배너 패널 칩이 일부에만 있음 (${chipN}/${panels})`);
    /* 라벨은 viewBox 안(기준선 y ≤ 276). SVG 안 캡션(x 320, y ≥ 262 — 구 규격)이 있으면 그 줄과 겹치는 y>240 라벨은 없어야 한다.
       새 규격(Unit 1)은 SVG 캡션 없이 SCENECAP → figcaption 이라 패널 라벨(y 264)이 자유롭다 */
    const ys = [...sv.matchAll(/<text x="([\d.]+)" y="([\d.]+)"/g)].map(m => ({ x: +m[1], y: +m[2] }));
    if (ys.some(p => p.y > 276)) err(U.no, L, `배너 라벨이 아래로 넘침 (y>276)`);
    /* 캡션 = x 320, y ≥ 262 에 혼자 놓인 글줄 (3패널 가운데 라벨도 x 320 이지만 양옆 라벨과 같은 y 를 공유한다) */
    const isCap = p => p.x === 320 && p.y >= 262 && !ys.some(q => q !== p && Math.abs(q.y - p.y) < 4);
    const cap = ys.some(isCap);
    const low = ys.filter(p => p.y > 240 && !isCap(p)).length;
    if (cap && low > 0) err(U.no, L, `배너 캡션 줄과 겹치는 라벨 ${low}개`);

    /* 어휘 */
    if (t.bank.length !== 6) err(U.no, L, `bank ${t.bank.length}개`);
    if (t.defs.length !== 6) err(U.no, L, `defs ${t.defs.length}개`);
    /* 영영풀이 정의문은 DEFINITION 열(≈95mm, t3) 한 줄 한도 60자 — 넘으면 행이 두 줄이 되어 두 열의 헤어라인이 어긋난다 */
    t.defs.forEach(d => { if (d[1].length > 60) err(U.no, L, `영영풀이 정의문 60자 초과 (${d[1].length}자): ${d[1].slice(0, 30)}…`); });
    const ord = [...t.defOrder].sort((a, b) => a - b).join();
    if (ord !== "0,1,2,3,4,5") err(U.no, L, `defOrder 가 0–5 순열이 아님: ${t.defOrder}`);
    t.bank.forEach(b => { if (CIR.indexOf(b[1]) >= n) err(U.no, L, `bank 문장번호 ${b[1]} 가 범위 밖`); });

    /* READ RIGHT */
    if (CIR.indexOf(t.fl.model.n) >= n) err(U.no, L, `먼저 보기 번호 ${t.fl.model.n} 범위 밖`);
    if (t.fl.drill.length !== 3) err(U.no, L, `drill ${t.fl.drill.length}개`);
    t.fl.drill.forEach(d => {
      const i = CIR.indexOf(d.n);
      if (i < 0 || i >= n) return err(U.no, L, `drill 번호 ${d.n} 범위 밖`);
      if (t.sent[i] !== d.en) err(U.no, L, `drill ${d.n} 문장이 지문과 다름`);
    });

    /* 구문 */
    if (t.syn.length !== 2) err(U.no, L, `syn ${t.syn.length}개`);
    t.syn.forEach(x => { if (CIR.indexOf(x.n) >= n) err(U.no, L, `syn 번호 ${x.n} 범위 밖`); });
    if (t.synd.length !== 3) err(U.no, L, `synd ${t.synd.length}개`);
    const uses = t.synd.map(d => d.u).join("|");
    if (uses !== "구문 1|구문 2|구문 1 + 2") err(U.no, L, `synd 구성이 규격과 다름: ${uses}`);

    /* 플로차트 */
    if (t.flow.length !== 5) err(U.no, L, `flow ${t.flow.length}행`);
    const fa = t.flow.filter(r => r[2]).map(r => r[2]);
    if (fa.length !== 4) err(U.no, L, `flow 빈칸 ${fa.length}개 (4개여야 함)`);
    const fb = t.flowBogi.split("·").map(s => s.trim());
    if (fb.length !== 6) err(U.no, L, `flowBogi ${fb.length}개 (6개여야 함)`);
    fa.forEach(a => { if (!fb.includes(a)) err(U.no, L, `flow 정답 "${a}" 가 보기에 없음`); });
    t.flow.forEach(r => { if (r[2] && !/\(\s*[①-⑳]\s*\)/.test(r[1])) err(U.no, L, `flow 행에 빈칸 표시 없음: ${r[0]}`); });

    /* 패러프레이즈 */
    if (t.para.length !== 5) err(U.no, L, `para ${t.para.length}개`);
    const pb = t.paraBogi.split("·").map(s => s.trim());
    if (pb.length !== 8) err(U.no, L, `paraBogi ${pb.length}개 (8개여야 함)`);
    t.para.forEach(p => {
      const m = p[0].match(/^([①-⑳])\s/);
      if (!m) return err(U.no, L, `para 앞에 문장 번호가 없음: ${p[0].slice(0, 26)}`);
      if (CIR.indexOf(m[1]) >= n) err(U.no, L, `para 번호 ${m[1]} 범위 밖`);
      if (p[0].replace(/^[①-⑳]\s/, "").length > 52) err(U.no, L, `para 원문이 52자 초과`);
      if (p[1].length > 56) err(U.no, L, `para 문장이 56자 초과`);
      const filled = p[1].replace("______", p[2]);
      if (filled.length > 52) err(U.no, L, `para 정답 채운 문장이 52자 초과 (${filled.length}자)`);
      if (!p[1].includes("______")) err(U.no, L, `para 문장에 빈칸이 없음`);
      if (!pb.includes(p[2])) err(U.no, L, `para 정답 "${p[2]}" 가 보기에 없음`);
    });

    /* Check Up */
    if (t.check.length !== 3) err(U.no, L, `check ${t.check.length}개`);
    [0, 1].forEach(i => {
      if (t.check[i].ch.length !== 5) err(U.no, L, `check${i + 1} 선지 ${t.check[i].ch.length}개`);
      if (!(t.check[i].ans >= 1 && t.check[i].ans <= 5)) err(U.no, L, `check${i + 1} 정답 번호 이상`);
    });
    ["wtype", "stype", "why", "src"].forEach(k => {
      if (t[k].length !== 5) err(U.no, L, `${k} ${t[k].length}개 (5개여야 함)`);
    });
    if (t.wtype[t.check[0].ans - 1] !== "정답") err(U.no, L, `wtype 의 정답 위치가 check1 정답과 어긋남`);
    if (t.stype[t.check[1].ans - 1] === "일치") err(U.no, L, `stype: 정답 선지가 '일치'로 표시됨`);
    t.stype.forEach((s, i) => {
      if (i !== t.check[1].ans - 1 && s !== "일치") err(U.no, L, `stype ${CIR[i]} 는 '일치'여야 함`);
    });
    if (t.why[t.check[0].ans - 1][0] !== "정답") err(U.no, L, `why 의 정답 위치가 어긋남`);

    /* 비네트 캡션은 50mm 상자 한 줄 — 넘으면 말줄임으로 조용히 잘린다 (한도 118pt) */
    if (A.VIGCAP && A.VIGCAP[t.no]) {
      const cap = A.VIGCAP[t.no];
      const w = [...cap].reduce((a, ch) =>
        a + (/[\u3131-\uD79D\u4E00-\u9FFF]/.test(ch) ? 7.5
          : /[0-9A-Za-z]/.test(ch) ? 4.2
          : /\s/.test(ch) ? 1.1 : 3.0), 0);
      if (w > 118) err(U.no, L, `비네트 캡션이 상자를 넘음 (${w.toFixed(0)}pt / 118pt): ${cap}`);
    }

    /* Knowledge Bank */
    if (t.kb.items.length !== 3) err(U.no, L, `kb 항목 ${t.kb.items.length}개`);
    if (!t.kb.ask) err(U.no, L, `kb 에 '생각해 볼 것'이 없음`);
  }
}
console.log(bad ? `\n── 문제 ${bad}건` : "\n── 전 유닛 데이터 규격 통과");
process.exit(bad ? 1 : 0);
