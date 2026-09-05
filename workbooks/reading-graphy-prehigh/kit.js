/* ═══ 삽화 공용 부품 — 정돈된 도해 (교과서 인포그래픽 톤) ═══
   규격
   · 선 굵기 3단: SW.hair 1.5(격자·점선 프레임·바닥 보조선) · SW.line 2.25(패널·풍선·소품·태그) · SW.bold 3(화살표·축)
   · 점선 1종 DASH '7 5' · 잉크 1종 INK · 회색 2단 MID/LIGHT · 노랑 YEL 은 전구 1개까지
   · 글자 3단: lvl 1 = 13/700(풍선 대사) · 2 = 11/700(패널 라벨·콜아웃·태그) · 3 = 10/500 MID(축·보조)
     비네트(240×150, 45mm 로 축소) 는 lvl "v" 15/700 · "vs" 15/500 만 쓴다 (= 8pt, 인쇄 판독 하한)
   · 번호 칩 1종: r 11, deep 채움, 흰 12/700. 패널 안 (x+18,y+18). step() 도 같은 칩
   · 640×280 그리드: 여백 20, 패널 y 18 · h 228(라벨 기준선 264, 바닥선 236) — 장면 캡션은 SVG 안이 아니라 figcaption 앞머리(SCENECAP)
     2패널 x 20/350 w 270(사이 60 에 노트 40) · 3패널 x 20/227/434 w 186 · 단일 도해 프레임 40–224
     (구 규격 h 190 + SVG 캡션 y 262 는 GRID.legacy 로 남겨 둔다)
   모든 함수는 SVG 조각(문자열)을 돌려준다. */

const F = require("./figure.js");
const { figure, anchors, mix } = F;
const INK = F.INK, MID = "#6E6A66", LIGHT = "#C9C5BF", PAPER = "#fff", YEL = "#FDD100";
const SW = { hair: 1.5, line: 2.25, bold: 3 };
const DASH = "7 5";
const ink = INK;                                   // 구 API 호환
const esc = s => String(s).replace(/&(?![a-z#])/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const FONT = `font-family="'Noto Sans CJK KR','Noto Sans KR',sans-serif"`;
const T = { 1: [13, 700], 2: [11, 700], 3: [10, 500], v: [15, 700], vs: [15, 500] };   /* v·vs = 비네트(240×150 → 45mm) 전용 = 8pt */
const R = { panel: 10, bubble: 10, note: 10, prop: 4 };
const GRID = { pad: 20, panelY: 18, panelH: 228, labelY: 264, floorY: 236, capY: 262,
  two: [{ x: 20, w: 270 }, { x: 350, w: 270 }], three: [{ x: 20, w: 186 }, { x: 227, w: 186 }, { x: 434, w: 186 }],
  legacy: { panelH: 190, labelY: 226, two: [{ x: 20, w: 276 }, { x: 344, w: 276 }] } };

const person = figure;
/* 손목 좌표 (side: "L"|"R"|"both"→소품 중심) */
function hands(o = {}, side = "both") { const a = anchors(o); return side === "L" ? a.wristL : side === "R" ? a.wristR : a.hands; }
function headTop(o = {}) { return anchors(o).headTop; }
/* 손에 든 인물: 소품은 두 손목 사이(0,-78)에, 팔 위·손바닥 위·손등 아래 레이어로 끼운다.
   손목은 소품 반폭(prop.xxx.hw × s)에 맞춰 잡는다 → 손등·손가락이 소품 앞면 가장자리에 걸친다.
   opt.one = "L" 이면 왼손만 잡고 오른팔은 opt.R(기본 "think") 포즈. */
function holding(o = {}, propFn, s = 1.15, opt = {}) {
  const c = o.c || "#5B57A6";
  const hw = (propFn.hw || 23) * s + 1.5;
  /* 한 손으로 들 때는 소품을 그 손 쪽으로 6 당겨 반대쪽 팔 소매가 소품 아래 모서리를 스친다(받쳐 든 모양) */
  const ox = opt.one === "L" ? -6 : opt.one === "R" ? 6 : 0;
  /* 한 손(L)일 때는 손목을 소품 아랫변 바로 밑 [ox-3, -78 + hh·s + 1] 에 두고(hh = 소품 아래 반높이) 손바닥은 소품 뒤,
     손가락 끝 3 + 엄지만 아랫변 위로 2–3px 걸치는 cup 손(ang -90) → '아래에서 받쳐 든' 모양. 팔꿈치는 옆구리 높이(-80)로 내려 전완이 소품 밑으로 들어간다 */
  const oneL = opt.one === "L";
  const px = oneL ? ox - 3 : ox;
  const wl = oneL ? [px, -78 + (propFn.hh || 18) * s + 1] : [-hw + ox, -76];
  /* 두 손: 팔꿈치를 바깥·위 (±(hw+14), -94) 로 열어 상완 ≥18px · 팔꿈치 각 ≈78° — 상완·전완이 어깨에서 겹쳐 부풀지 않는다 */
  const armL = oneL
    ? { pts: [[-21, -104], [-(hw + 6) + ox, -80], wl], hand: "cup", front: 1, wrap: 1, ang: -90 }
    : { pts: [[-21, -104], [-(hw + 14) + ox, -94], wl], hand: "grip", front: 1, wrap: 1, ang: -12 };
  const armR = { pts: [[21, -104], [hw + 14 + ox, -94], [hw + ox, -76]], hand: "grip", front: 1, wrap: 1, ang: 192 };
  const arms = oneL ? { L: armL, R: opt.R || "think" } : opt.one === "R" ? { L: opt.L || "down", R: armR } : { L: armL, R: armR };
  return figure(Object.assign({ pose: "hold" }, o, { arms, held: propFn(px, -78, s, o.propc || c) }));
}

/* ── 글자 ── */
function text(x, y, t, lvl = 2, c = INK, anchor = "middle", extra = "") {
  const [sz, w] = T[lvl] || T[2];
  return `<text x="${x}" y="${y}" font-size="${sz}" font-weight="${w}" fill="${lvl === 3 && c === INK ? MID : c}" text-anchor="${anchor}" ${FONT} ${extra}>${esc(t)}</text>`;
}
function label(o = {}) {
  const { x, y, text: t, c = INK, anchor = "middle" } = o;
  const lvl = o.lvl || (o.size ? (o.size >= 12.5 ? 1 : o.size >= 11 ? 2 : 3) : 2);
  return text(x, y, t, lvl, c, anchor);
}
/* 장면 캡션 1줄 (y 262, deep) — 구 규격. 새 규격은 SVG 안에 캡션을 두지 않고 art/uNN.js 의 SCENECAP 을 figcaption 앞머리에 찍는다 */
function caption(t, d) { return text(320, GRID.capY, t, 2, d); }

/* ── 말풍선: to:{x,y} 가 있으면 꼬리가 화자의 입을 향한다 ──
   to 가 풍선의 왼쪽/오른쪽 바깥이면 그 변의 중앙(입 높이로 클램프)에서 옆으로, 아니면 아래변에서 나간다.
   꼬리 길이는 to 지점 4px 앞까지(10–30) — 꼬리 끝이 얼굴 가장자리에 닿는다. 밑변 12. 풍선과 한 path 라 이음매가 없다. */
function bubblePath(x, y, w, h, r, tail) {
  /* tail: {side:"b"|"l"|"r", b(밑변 중심: 아래변이면 x, 옆변이면 y), tipx, tipy} */
  const t = tail || {}, side = t.side || "b";
  const a = side === "b" ? Math.max(x + r + 6, Math.min(x + w - r - 6, t.b)) : Math.max(y + r + 6, Math.min(y + h - r - 6, t.b));
  return `M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r}`
    + (tail && side === "r" ? ` V${a - 6} L${t.tipx} ${t.tipy} L${x + w} ${a + 6}` : "")
    + ` V${y + h - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h}`
    + (tail && side === "b" ? ` H${a + 6} L${t.tipx} ${t.tipy} L${a - 6} ${y + h}` : "")
    + ` H${x + r} A${r} ${r} 0 0 1 ${x} ${y + h - r}`
    + (tail && side === "l" ? ` V${a + 6} L${t.tipx} ${t.tipy} L${x} ${a - 6}` : "")
    + ` V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} z`;
}
function bubble(o = {}) {
  const { x = 0, y = 0, w = 160, h = 46, lines = [], c = INK, fill = PAPER, tail = "bl", to = null, lvl = 1, tx = 0 } = o;
  const [sz] = T[lvl] || T[1];
  let body = "", pre = "";
  const bottom = { bl: x + 30, br: x + w - 30, bm: x + w / 2 };
  if (to || bottom[tail] !== undefined) {
    let tl;
    if (to) {
      const side = to.x < x ? "l" : to.x > x + w ? "r" : "b";
      const bx = side === "b" ? Math.max(x + 16, Math.min(x + w - 16, to.x)) : side === "l" ? x : x + w;
      const by = side === "b" ? y + h : Math.max(y + 16, Math.min(y + h - 16, to.y));
      const dx = to.x - bx, dy = to.y - by, len = Math.hypot(dx, dy) || 1, L = Math.max(10, Math.min(30, len - 4));
      tl = { side, b: side === "b" ? bx : by, tipx: bx + dx / len * L, tipy: by + dy / len * L };
    } else { const bx = bottom[tail]; tl = { side: "b", b: bx, tipx: tail === "bl" ? bx - 8 : tail === "br" ? bx + 8 : bx, tipy: y + h + 16 }; }
    body = `<path d="${bubblePath(x, y, w, h, R.bubble, tl)}" fill="${fill}" stroke="${c}" stroke-width="${SW.line}" stroke-linejoin="round"/>`;
  } else {
    const tails = {
      tl: `M${x + 24} ${y + 1} l0 -16 l16 16 z`, tr: `M${x + w - 40} ${y + 1} l16 -16 l0 16 z`,
      lm: `M${x + 1} ${y + h / 2 - 8} l-16 8 l16 8 z`, rm: `M${x + w - 1} ${y + h / 2 - 8} l16 8 l-16 8 z`, none: ``,
    };
    const td = tails[tail] || "";
    pre = td ? `<path d="${td}" fill="${fill}" stroke="${c}" stroke-width="${SW.line}" stroke-linejoin="round"/>` : "";
    body = `<path d="${bubblePath(x, y, w, h, R.bubble)}" fill="${fill}" stroke="${c}" stroke-width="${SW.line}"/>`
      + (td ? `<path d="${td}" fill="${fill}"/>` : "");
  }
  const n = lines.length || 1, lh = sz * 1.32;
  const y0 = y + h / 2 - ((n - 1) * lh) / 2 + sz * 0.36;
  return `<g>${pre}${body}${lines.map((t, i) => text(x + w / 2 + tx, y0 + i * lh, t, lvl, c)).join("")}</g>`;
}
function thought(o = {}) {
  const { x = 0, y = 0, w = 160, h = 50, lines = [], c = INK, side = "l", lvl = 1 } = o;
  const [sz] = T[lvl] || T[1];
  const cx = side === "l" ? x + 26 : x + w - 26, dir = side === "l" ? -1 : 1;
  const n = lines.length || 1, lh = sz * 1.3;
  const y0 = y + h / 2 - ((n - 1) * lh) / 2 + sz * 0.36;
  return `<g><ellipse cx="${cx + dir * 6}" cy="${y + h + 13}" rx="7" ry="5.5" fill="${PAPER}" stroke="${c}" stroke-width="${SW.line}"/>
    <circle cx="${cx + dir * 17}" cy="${y + h + 25}" r="3.6" fill="${PAPER}" stroke="${c}" stroke-width="${SW.line}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${PAPER}" stroke="${c}" stroke-width="${SW.line}" stroke-dasharray="${DASH}"/>
    ${lines.map((t, i) => text(x + w / 2, y0 + i * lh, t, lvl, c)).join("")}</g>`;
}
/* 꼬리 없는 풍선 대신: 틴트 배경 노트 — 풍선과 같은 c 선(2.25)·rx 10 (회색 헤어라인 테두리는 비활성 버튼처럼 보인다) */
function note(o = {}) {
  const { x, y, w = 120, h = 30, lines = [], c = INK, tint = "#EEE", lvl = 2, stroke = c } = o;
  const [sz] = T[lvl] || T[2];
  const n = lines.length || 1, lh = sz * 1.3;
  const y0 = y + h / 2 - ((n - 1) * lh) / 2 + sz * 0.36;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${R.note}" fill="${tint}" stroke="${stroke}" stroke-width="${SW.line}"/>
    ${lines.map((t, i) => text(x + w / 2, y0 + i * lh, t, lvl, c)).join("")}</g>`;
}

/* ── 번호 칩: 지면의 .num 규격(틴트 원 + deep 숫자)과 같은 항목 칩. r 11, 12/700 ──
   t(틴트) 를 주지 않으면 c 를 88% 희석한 틴트를 쓴다. 채움 사각 칩(과제 번호)은 지면 전용 — 삽화 안에서는 쓰지 않는다. */
function chip(x, y, n, c, t = "") {
  const fill = t || mix(c, "#FFFFFF", .88);
  return `<circle cx="${x}" cy="${y}" r="11" fill="${fill}"/><text x="${x}" y="${y + 4.3}" font-size="12" font-weight="700" fill="${c}" text-anchor="middle" ${FONT}>${n}</text>`;
}
/* ── 패널: 흰 채움, deep 1.5 선, rx 10, 칩 (x+18,y+18), 라벨은 아래 1줄(기준선 h+18) ── */
function panel(o = {}) {
  const { x = 0, y = 0, w = 180, h = 120, c = INK, t = "", fill = PAPER, label: lb = "", n = 0, floor = 0 } = o;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${R.panel}" fill="${fill}" stroke="${c}" stroke-width="${SW.hair}"/>
    ${floor ? `<path d="M${x + 14} ${y + h - 12} h${w - 28}" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-linecap="round"/>` : ""}
    ${n ? chip(x + 18, y + 18, n, c, t) : ""}
    ${lb ? text(x + w / 2, y + h + 18, lb, 2, c) : ""}</g>`;
}

/* ── 인포그래픽 부품 ── */
function arrow(o = {}) {
  const { x1, y1, x2, y2, c = INK, dash = 0, curve = 0 } = o;
  const w = SW.bold;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
  const hx = x2 - ux * 10, hy = y2 - uy * 10;                       // 화살촉 10×12
  const d = curve ? `M${x1} ${y1} Q${mx + nx * curve} ${my + ny * curve} ${hx - ux * 2} ${hy - uy * 2}` : `M${x1} ${y1} L${hx - ux * 2} ${hy - uy * 2}`;
  return `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"${dash ? ` stroke-dasharray="${DASH}"` : ""}/>
    <path d="M${x2} ${y2} L${hx + nx * 6} ${hy + ny * 6} L${hx - nx * 6} ${hy - ny * 6} z" fill="${c}"/>`;
}
function step(o = {}) {
  const { x, y, n, c = INK, label: lb = "", below = 1 } = o;
  return `<g>${chip(x, y, n, c)}${lb ? text(x, below ? y + 27 : y - 17, lb, 2, c) : ""}</g>`;
}
function callout(o = {}) {
  const { x, y, tx, ty, text: t, c = INK, anchor = "middle" } = o;
  return `<g><path d="M${x} ${y} L${tx} ${ty}" stroke="${c}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
    <circle cx="${x}" cy="${y}" r="3.5" fill="${c}"/>
    ${text(tx, ty + (ty < y ? -6 : 14), t, 2, c, anchor)}</g>`;
}
function stat(o = {}) {
  const { x, y, big, small, c = INK, size = 24 } = o;
  return `<g><text x="${x}" y="${y}" font-size="${size}" font-weight="700" fill="${c}" text-anchor="middle" ${FONT}>${esc(big)}</text>
    ${text(x, y + 16, small, 3, MID)}</g>`;
}
function tag(o = {}) {
  const { x, y, text: t, c = INK, fill = "", lvl = 2 } = o;
  const [sz] = T[lvl] || T[2], pad = 10;
  const w = [...String(t)].reduce((a, ch) => a + (/[ᄀ-ᇿ⺀-鿿가-힯！-｠]/.test(ch) ? sz : sz * 0.58), 0) + pad * 2;
  const h = sz * 1.9;
  return `<g><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill || c}" ${fill ? `stroke="${c}" stroke-width="${SW.hair}"` : ""}/>
    ${text(x, y + sz * 0.36, t, lvl, fill ? c : "#fff")}</g>`;
}
function ground(o = {}) {
  const { x1, x2, y, c = INK, w = SW.bold } = o;
  return `<path d="M${x1} ${y}h${x2 - x1}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
}
/* 패널 바닥 띠: 패널 아래쪽을 틴트로 채워 바닥/벽을 나눈다 (모서리는 패널 rx 를 따른다). 인물은 ground() 위에 선다 */
function floorBand(o = {}) {
  const { x, y, w, h, top, t = "#EEE", c = INK, line = 1 } = o;
  const r = R.panel, b = y + h;
  return `<path d="M${x} ${top} H${x + w} V${b - r} A${r} ${r} 0 0 1 ${x + w - r} ${b} H${x + r} A${r} ${r} 0 0 1 ${x} ${b - r} z" fill="${t}"/>`
    + (line ? ground({ x1: x + 14, x2: x + w - 14, y: top, c, w: SW.hair }) : "");
}
function bar(o = {}) {
  const { x, base, h, w = 26, c = INK, op = 1, cap = "", capc = "" } = o;
  return `<g><rect x="${x - w / 2}" y="${base - h}" width="${w}" height="${h}" rx="3" fill="${c}" opacity="${op}"/>
    ${cap ? text(x, base + 16, cap, 3, capc || MID) : ""}</g>`;
}
/* 격자 보조선 (HAIR, LIGHT) */
function grid(o = {}) {
  const { x, y, w, h, step: st = 24 } = o;
  let d = "";
  for (let gx = x; gx <= x + w; gx += st) d += `M${gx} ${y}v${h}`;
  for (let gy = y; gy <= y + h; gy += st) d += `M${x} ${gy}h${w}`;
  return `<path d="${d}" stroke="${LIGHT}" stroke-width="${SW.hair}" opacity=".6"/>`;
}

/* ── 소품: 흰 바탕 + 잉크 외곽 1.8(로컬) · 포인트색은 accent 하나 ──
   드는 소품: book paper phone screen_t cup  /  놓는 소품: bookc screen clock coin bulb leaf spindle */
const OL = INK, PW = 1.8;
const OP = (fill) => `fill="${fill}" stroke="${OL}" stroke-width="${PW}" stroke-linejoin="round" stroke-linecap="round"`;
const prop = {
  book: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-23-14 q11-4 22 0 v24 q-11-4-22 0z" ${OP(PAPER)}/>
    <path d="M23-14 q-11-4-22 0 v24 q11-4 22 0z" ${OP(PAPER)}/>
    <path d="M-1-14 v24" stroke="${OL}" stroke-width="${PW}"/>
    <path d="M-17-7h11M-17-2h9M-17 3h10M6-7h11M6-2h9M6 3h10" stroke="${c}" stroke-width="1.6" stroke-linecap="round" opacity=".6"/></g>`,
  bookc: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-11" y="-16" width="22" height="32" rx="2.5" ${OP(c)}/>
    <path d="M-6-16v32" stroke="#fff" stroke-width="1.6" opacity=".5"/></g>`,
  screen: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-22" y="-16" width="44" height="30" rx="${R.prop}" ${OP(PAPER)}/>
    <rect x="-17" y="-11" width="34" height="20" rx="2" fill="${c}" opacity=".85"/>
    <path d="M-8 20h16M0 14v6" stroke="${OL}" stroke-width="${PW}" stroke-linecap="round"/></g>`,
  screen_t: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-22" y="-16" width="44" height="32" rx="${R.prop}" ${OP(PAPER)}/>
    <rect x="-18" y="-12" width="36" height="24" rx="2" fill="${c}" opacity=".85"/></g>`,
  phone: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-10" y="-17" width="20" height="34" rx="${R.prop}" ${OP(PAPER)}/>
    <rect x="-6" y="-12" width="12" height="22" rx="1.5" fill="${c}" opacity=".8"/></g>`,
  clock: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <circle r="16" ${OP(PAPER)}/>
    <path d="M0-10v11l8 4" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle r="1.8" fill="${OL}"/></g>`,
  coin: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <circle r="14" ${OP(c)}/><circle r="10" fill="none" stroke="#fff" stroke-width="1.4" opacity=".6"/>
    <text y="5.5" font-size="15" font-weight="700" fill="#fff" text-anchor="middle" ${FONT}>$</text></g>`,
  bulb: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0-18c8 0 14 6 14 13 0 5-4 8-5 11h-18c-1-3-5-6-5-11 0-7 6-13 14-13z" ${OP(YEL)}/>
    <path d="M-6 9h12M-4 14h8" stroke="${OL}" stroke-width="${PW}" stroke-linecap="round"/>
    <path d="M0-27v5M-16-20l3 4M16-20l-3 4" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></g>`,
  leaf: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 15C-13 7-13-9 0-17 13-9 13 7 0 15z" ${OP(c)}/>
    <path d="M0 15V-13" stroke="#fff" stroke-width="1.6" opacity=".8"/></g>`,
  paper: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-14" y="-18" width="28" height="36" rx="2.5" ${OP(PAPER)}/>
    <path d="M-8-10h16M-8-4h16M-8 2h11" stroke="${c}" stroke-width="1.8" stroke-linecap="round" opacity=".7"/></g>`,
  cup: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-11-12h22l-2 24q-1 5-9 5t-9-5z" ${OP(PAPER)}/>
    <path d="M11-6q7 1 7 7t-7 7" fill="none" stroke="${OL}" stroke-width="${PW}"/>
    <path d="M-8-8h16l-1 6h-14z" fill="${c}"/></g>`,
  /* 물레 (놓는 소품) */
  spindle: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="-4" r="15" ${OP(PAPER)}/><circle cx="0" cy="-4" r="9" fill="none" stroke="${c}" stroke-width="1.8"/>
    <path d="M0-19v30M-12 11h24M-9 16h18" stroke="${OL}" stroke-width="${PW}" stroke-linecap="round"/>
    <path d="M13-4l16-12" stroke="${OL}" stroke-width="${PW}" stroke-linecap="round"/></g>`,
};

/* 드는 소품의 반폭 hw(손목 위치 계산용) · 아래 반높이 hh(한 손 받쳐 들기의 손목 높이) */
Object.assign(prop.book, { hw: 23, hh: 10 }); Object.assign(prop.paper, { hw: 14, hh: 18 }); Object.assign(prop.phone, { hw: 10, hh: 17 });
Object.assign(prop.screen_t, { hw: 22, hh: 16 }); Object.assign(prop.cup, { hw: 11, hh: 17 });

module.exports = { ink, INK, MID, LIGHT, PAPER, YEL, SW, DASH, GRID, mix, hands, headTop, anchors, person, holding,
  bubble, thought, note, panel, chip, arrow, step, callout, stat, tag, label, text, caption, ground, floorBand, bar, grid, prop };
