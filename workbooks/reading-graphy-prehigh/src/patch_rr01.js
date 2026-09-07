const fs = require("fs"), P = "/home/user/orunnathan/workbooks/reading-graphy-prehigh/";
const RR = require(P + "rr/u01.js");

/* L04 — 새 문장 ⑥ "But this does not protect her." 가 들어오고 옛 ⑫ 가 빠졌다 */
{
  const a = RR["04"];
  const head = a.slice(0, 5);                 // 문장 1–5
  const ins = [["But", "c"], ["this", "s"], ["does not protect", "v"], ["her.", null]];
  const mid = a.slice(5, 11);                 // 옛 6–11 → 새 7–12
  const tail = a.slice(12);                   // 옛 13–17 (옛 12 는 버린다)
  RR["04"] = head.concat([ins], mid, tail);
}

/* 낱말이 바로잡힌 문장들 */
const T = (arr, i, from, to) => {
  const r = arr[i];
  let hit = 0;
  r.forEach(t => { if (t[0].includes(from)) { t[0] = t[0].replace(from, to); hit++; } });
  if (!hit) throw new Error("not found: " + from);
};
T(RR["01"], 14, "universal color", "local color");
T(RR["02"], 8, "mediated", "unmediated");
T(RR["03"], 9, "being brought", "bringing");
RR["05"][7][3][0] = "in which";

const ser = o => "/* Unit 1 READ RIGHT 표기 */\nmodule.exports = {\n" +
  Object.keys(o).map(k => ' "' + k + '": [\n' +
    o[k].map(r => "  " + JSON.stringify(r)).join(",\n") + "\n ]").join(",\n") + "\n};\n";
fs.writeFileSync(P + "rr/u01.js", ser(RR));
console.log("rr/u01.js rewritten; L04 rows =", RR["04"].length);
