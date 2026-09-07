/* 삽화 글자 겹침 검사.  node labcheck.js [유닛번호 …]
   scenes / VIG 를 실제로 그려 <text> 의 사각형을 어림한 뒤, 서로 겹치는 짝을 찾아낸다.
   panel({label}) 이 그리는 캡션(y+h+17)과 그 아래에 따로 놓은 label() 이 겹치는 사고를 잡기 위한 것. */
const fs = require("fs");
const nos = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync(__dirname + "/units").map(f => f.match(/^u(\d+)\.js$/)?.[1]).filter(Boolean);

/* 글자 폭 어림 — 한글 1.0em · 라틴 0.55em · 공백 0.28em */
const width = (s, fs_) => [...s].reduce((a, ch) =>
  a + fs_ * (/[가-힣ㄱ-ㆎ]/.test(ch) ? 1.0
    : /\s/.test(ch) ? 0.28 : 0.55), 0);

const boxes = svg => [...svg.matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)].map(m => {
  const at = k => (m[1].match(new RegExp(`${k}="([^"]*)"`)) || [])[1];
  const x = +at("x"), y = +at("y"), f = +(at("font-size") || 12), anc = at("text-anchor") || "start";
  const w = width(m[2], f);
  const x0 = anc === "middle" ? x - w / 2 : anc === "end" ? x - w : x;
  return { t: m[2], x0, x1: x0 + w, y0: y - f * 0.82, y1: y + f * 0.24, f, bg: /data-bg="1"/.test(m[1]) };
}).filter(b => b.t.trim());

/* person() 이 남기는 <g data-fig="1" transform="translate(x y) scale(s s)"> 에서 머리 상자를 뽑는다.
   인물은 발끝 y 를 기준으로 위로 156s 만큼 서 있고, 머리는 그 위쪽 40s 구간·폭 62s 이다. */
const heads = svg => [...svg.matchAll(/<g(?: data-fig="1")? transform="translate\((-?[\d.]+) (-?[\d.]+)\) scale\((-?[\d.]+) (-?[\d.]+)\)">\s*<ellipse cx="0" cy="3"/g)].map(m => {
  const x = +m[1], y = +m[2], s = Math.abs(+m[4]);
  return { x0: x - 31 * s, x1: x + 31 * s, y0: y - 156 * s, y1: y - 112 * s };
});

let bad = 0;
for (const nn of nos) {
  const pad = String(nn).padStart(2, "0");
  const U = require(`./units/u${pad}.js`);
  const A = require(`./art/u${pad}.js`);
  const check = (name, svg) => {
    const bs = boxes(svg);
    for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
      const a = bs[i], b = bs[j];
      const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
      const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      if (ox > 1.5 && oy > 1.5) { bad++; console.log(`  U${U.no} ${name}  글자 겹침: "${a.t}" ↔ "${b.t}"  (가로 ${ox.toFixed(1)} · 세로 ${oy.toFixed(1)})`); }
    }
    for (const b of bs.filter(b => !b.bg)) for (const h of heads(svg)) {
      const ox = Math.min(b.x1, h.x1) - Math.max(b.x0, h.x0);
      const oy = Math.min(b.y1, h.y1) - Math.max(b.y0, h.y0);
      if (ox > 3 && oy > 3) { bad++; console.log(`  U${U.no} ${name}  글자가 인물 얼굴을 덮음: "${b.t}"  (가로 ${ox.toFixed(1)} · 세로 ${oy.toFixed(1)})`); }
    }
  };
  for (const t of U.lessons) {
    if (A.scenes[t.key]) check(`L${t.no} 배너`, A.scenes[t.key](t.accent, t.tint, t.deep));
    if (A.VIG[t.no]) check(`L${t.no} 비네트`, A.VIG[t.no](t.accent, t.tint, t.deep));
  }
}
console.log(bad ? `\n── 겹침 ${bad}건` : "\n── 삽화 글자 겹침 없음");
process.exit(bad ? 1 : 0);
