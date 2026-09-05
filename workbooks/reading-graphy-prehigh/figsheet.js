/* 인물 시트: 6 포즈 × 6 머리 + 상의·액세서리 줄 + 표정 줄 → pv/figures.html (chrome 스크린샷용) */
const fs = require("fs");
const { figure } = require("./figure.js");
const K = require("./kit.js");
const c = "#615EA8", d = "#3D3A73";
const poses = ["down", "hold", "point", "think", "up", "open"];
const hairs = ["short", "bob", "long", "bun", "pony", "curly"];
const hairs2 = ["wavy", "twin", "buzz", "cap", "short", "bob"];
const faces = ["smile", "glad", "laugh", "flat", "worry", "oh"];
const brows = ["soft", "up", "one", "soft", "down", "up"];
const skins = ["light", "tan", "brown"];
const HC = ["#2B2926", "#3A2E2A", "#6B3A20", "#8A4B25", "#B8742F", "#7C7C82"];
const rows = [];
const cell = (i, j, o) => figure(Object.assign({ x: 60 + i * 120, y: 190 + j * 200, s: 1, c }, o));
for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) {
  const o = { pose: poses[i], hair: hairs[j], face: faces[(i + j) % 6], brow: brows[(i + j) % 6], hairc: HC[j], skin: skins[(i + j) % 3] };
  if (poses[i] === "hold") o.held = K.prop.book(0, -78, 1.15, c);
  rows.push(cell(i, j, o));
}
for (let i = 0; i < 6; i++) rows.push(cell(i, 6, { pose: "down", hair: hairs2[i], face: faces[i], brow: brows[i], hairc: HC[(i + 2) % 6],
  top: ["tee", "shirt", "hoodie", "sweater", "apron", "tee"][i], sleeve: i > 3 ? "short" : "long", glasses: i % 2, skin: skins[i % 3], legs: ["stand", "step", "walk"][i % 3], c: i % 2 ? d : c }));
for (let i = 0; i < 6; i++) rows.push(figure({ x: 60 + i * 120, y: 190 + 7 * 200, s: 1, c, pose: ["wave", "cheer", "shrug", "write", "hold", "down"][i],
  hair: hairs[(i + 3) % 6], face: faces[i], brow: brows[i], hairc: HC[i], skin: skins[i % 3], held: i === 4 ? K.prop.paper(0, -78, 1.1, c) : "" }));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 1640" width="1480" height="3280">
<rect width="740" height="1640" fill="#fff"/>
${[0, 1, 2, 3, 4, 5, 6, 7].map(j => `<line x1="0" x2="740" y1="${193 + j * 200}" y2="${193 + j * 200}" stroke="#ddd"/>`).join("")}
${poses.map((p, i) => `<text x="${60 + i * 120}" y="22" font-size="11" text-anchor="middle" font-family="sans-serif" fill="#666">${p}</text>`).join("")}
${rows.join("\n")}</svg>`;
fs.mkdirSync("pv", { recursive: true });
fs.writeFileSync("pv/figures.html", `<!doctype html><html><body style="margin:0">${svg}</body></html>`);
console.log("pv/figures.html");
