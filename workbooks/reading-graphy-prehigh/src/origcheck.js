/* units/uNN.js 의 sent·kor 이 원문(src/orig/all.json)과 글자까지 같은지 전수 대조 */
const R = require("./orig/all.json");
let done = 0, todo = 0;
for (let u = 1; u <= 12; u++) {
  const U = require(`../units/u${String(u).padStart(2, "0")}.js`);
  const rows = U.lessons.map((L, i) => {
    const t = R[(u - 1) * 5 + i];
    const same = L.sent.length === t.sent.length && L.sent.every((s, k) => s === t.sent[k]);
    const kSame = L.kor.length === t.kor.length && L.kor.every((s, k) => s === t.kor[k]);
    const titleSame = L.en === t.en;
    return { no: L.no, theme: t.no, same, kSame, titleSame, n: L.sent.length, tn: t.sent.length, en: t.en };
  });
  const ok = rows.every(r => r.same && r.kSame && r.titleSame);
  ok ? done++ : todo++;
  console.log(`Unit ${String(u).padStart(2, "0")} ${ok ? "✔ 원문 일치" : "✘ 원문 아님"}  ${U.field}`);
  rows.forEach(r => {
    if (!(r.same && r.kSame && r.titleSame))
      console.log(`   L${r.no} (Theme ${r.theme})  영문 ${r.same ? "일치" : "다름"} · 해석 ${r.kSame ? "일치" : "다름"} · 제목 ${r.titleSame ? "일치" : "다름"}  [문장 ${r.n} vs 원문 ${r.tn}]  ${r.en}`);
  });
}
console.log(`\n── 원문 반영 ${done}유닛 / 남은 유닛 ${todo}`);
