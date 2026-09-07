const fs = require("fs"), P = "/home/user/orunnathan/workbooks/reading-graphy-prehigh/";
const U = require(P + "units/u01.js");
const R = require(P + "src/orig/all.json");

/* 1) 문장 단위 문자열 교체 — drill·syn 인용까지 함께 고쳐진다 */
const SWAP = [
  [0, "What is more, literature almost always has a universal color.", "What is more, literature almost always has a local color."],
  [1, "they are mediated;", "they are unmediated;"],
  [2, "when faced with being brought to poetic", "when faced with bringing to poetic"],
  [4, "ever-evolving conversation which we", "ever-evolving conversation in which we"],
];
const obj = JSON.parse(JSON.stringify(U));
SWAP.forEach(([i, a, b]) => {
  let j = JSON.stringify(obj.lessons[i]);
  const n = j.split(a).length - 1;
  obj.lessons[i] = JSON.parse(j.split(a).join(b));
  console.log("L0" + (i + 1) + " swap x" + n + ": " + a.slice(0, 42));
});

/* 2) L04 원문자 재배치 — 문장 하나가 들어오고 하나가 빠졌다 */
{
  const L = obj.lessons[3];
  L.bank[4] = ["bemoan", "⑬", "한탄하다"];
  L.defs[4] = ["bemoan", "to complain loudly and sadly about something"];
  L.para[3] = ["⑥ this does not protect her", "Shutting out every danger fails to keep her ______.", "safe"];
  L.paraBogi = L.paraBogi.replace("extreme", "safe");
  let j = JSON.stringify(L);
  [["⑪", "⑫"], ["⑩", "⑪"], ["⑨", "⑩"], ["⑧", "⑨"]]
    .forEach(([a, b]) => { j = j.split(a).join("" + b); });
  obj.lessons[3] = JSON.parse(j.split("").join(""));
  obj.lessons[3].src[3] = ["⑫와 어긋남 — 열여섯 번째 생일을 맞기 ‘직전에’ 왕자를 만난다"];
  console.log("L04 circled remapped");
}

/* 3) sent·kor 를 원문으로 교체 */
obj.lessons.forEach((L, i) => { L.sent = R[i].sent.slice(); L.kor = R[i].kor.slice(); });

fs.writeFileSync(P + "units/u01.js", "module.exports = " + JSON.stringify(obj, null, 1) + ";\n");
console.log("written units/u01.js");
