/* Unit 10 삽화 — 정돈된 도해 (디자인 시스템 A · 사회·경제)
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64
   구도 템플릿: A 2패널 비교(x 20/350 w 270 h 228) · C 단일 도해(프레임 + 리더선 콜아웃 ≤2)
   장면 캡션은 SVG 안에 두지 않고 SCENECAP → figcaption 앞머리 한 줄로 찍는다 (그림 안 글자는 패널 라벨·풍선·보조 라벨뿐)
   색: accent(c) · deep(d) · tint(t) + 잉크/회색 2단 + 흰색. 노랑 없음. */
const K = require("../kit.js");
const { person, holding, anchors, bubble, thought, note, panel, arrow, callout, tag, text, prop, ground, floorBand, mix, INK, MID, LIGHT, SW, DASH } = K;
const FONT = `font-family="'Noto Sans CJK KR','Noto Sans KR',sans-serif"`;

/* ── 레슨 아이콘: 선화 stroke 3 round · 라이브 48×48(패딩 8) · 면 채움은 accent 30% 한 곳 ── */
const IC = c => `stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
 /* 로렌츠 곡선: 축 + 점선 평등선 + 곡선, 사이 면적 한 곳 채움 */
 gini:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M12 52L52 12C46 38 34 50 12 52z" fill="${c}" opacity=".3"/>
  <path d="M12 52V12M12 52h40" ${IC(c)}/>
  <path d="M12 52L52 12" ${IC(c)} stroke-dasharray="1 6"/>
  <path d="M12 52C34 50 46 38 52 12" ${IC(c)}/></svg>`,
 /* 안쪽의 갈등: 원 한 곳 채움 + 가운데서 반대로 당기는 두 화살 */
 conflict:(c)=>`<svg viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="21" fill="${c}" opacity=".3"/>
  <circle cx="32" cy="32" r="21" ${IC(c)}/>
  <path d="M29 32H15M20 27l-5 5 5 5M35 32h14M44 27l5 5-5 5" ${IC(c)}/></svg>`,
 /* 서류가방: 뚜껑 띠 한 곳 채움 + 가운데를 가르는 점선(묶음이 풀린다) */
 gig:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M10 26a4 4 0 0 1 4-4h36a4 4 0 0 1 4 4v8H10z" fill="${c}" opacity=".3"/>
  <rect x="10" y="22" width="44" height="30" rx="4" ${IC(c)}/>
  <path d="M10 34h44M25 22v-5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" ${IC(c)}/>
  <path d="M32 36v14" ${IC(c)} stroke-dasharray="1 5"/></svg>`,
 /* 장바구니: 몸통 한 곳 채움 + 손잡이 + 살 */
 store:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M11 26h42l-5 26H16z" fill="${c}" opacity=".3"/>
  <path d="M11 26h42l-5 26H16z" ${IC(c)}/>
  <path d="M22 26a10 10 0 0 1 20 0M24 33v12M32 33v12M40 33v12" ${IC(c)}/></svg>`,
 /* 가격표: 몸통 한 곳 채움 + 구멍 + 위로 향한 화살 */
 veblen:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M10 32l13-13h27a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H23z" fill="${c}" opacity=".3"/>
  <path d="M10 32l13-13h27a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H23z" ${IC(c)}/>
  <circle cx="25" cy="32" r="2.5" ${IC(c)}/>
  <path d="M41 39V25M36 30l5-5 5 5" ${IC(c)}/></svg>`,
};

/* ── 유닛 캐스팅: 배너 안 인물이 서로 다르게 ── */
const CAST = {
 analyst:  { hair:"short", hairc:"#2B2926", skin:"light", top:"shirt", glasses:1 },
 reader:   { hair:"bob",   hairc:"#6B3A20", skin:"tan",   top:"sweater" },
 hero:     { hair:"curly", hairc:"#3A2E2A", skin:"brown", top:"tee", sleeve:"short" },
 torn:     { hair:"long",  hairc:"#8A4B25", skin:"light", top:"hoodie" },
 clerk:    { hair:"buzz",  hairc:"#2B2926", skin:"tan",   top:"shirt" },
 rider:    { hair:"pony",  hairc:"#3A2E2A", skin:"light", top:"hoodie" },
 shopper:  { hair:"wavy",  hairc:"#6B3A20", skin:"tan",   top:"sweater" },
 passer:   { hair:"cap",   hairc:"#2B2926", skin:"light", top:"tee" },
 buyer:    { hair:"bun",   hairc:"#2B2926", skin:"tan",   top:"shirt" },
 gazer:    { hair:"twin",  hairc:"#B8742F", skin:"brown", top:"hoodie" },
};
/* 패널: y 18 · h 228 (라벨 기준선 264). 장면 캡션은 SVG 안이 아니라 SCENECAP → figcaption 앞머리 */
const PA = { x:20, y:18, w:270, h:228 }, PB = { x:350, y:18, w:270, h:228 };   // 패널 사이 60 (노트 40 + 여백 10·10)
const FLOOR = 236;                                   // 인물 발밑 바닥선 (패널 바닥 246 − 10)
const BAND = 204;                                    // 벽/바닥 경계 (책상 상판 192 보다 12 아래)
const DESK = 192;                                    // 책상 상판 윗선
/* 패널 바닥 세트(템플릿 A): 틴트 띠 + 바닥선 */
const floorSet = (P, d, t) => `${floorBand(Object.assign({ top:BAND, t, line:0 }, P))}
  ${ground({ x1:P.x+14, x2:P.x+P.w-14, y:FLOOR, c:d, w:SW.hair })}`;
/* 작은 책상: 두께 6 상판(틴트보다 한 단 진한 면 + deep 선, rx 2) + 다리 2(SW.line) + 바닥 그림자 */
const desk = (x, w, d, t) => `<ellipse cx="${x + w / 2}" cy="${FLOOR + 2}" rx="${w / 2 - 6}" ry="4" fill="${INK}" opacity=".08"/>
  <path d="M${x + 10} ${DESK + 6}V${FLOOR}M${x + w - 10} ${DESK + 6}V${FLOOR}" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
  <rect x="${x}" y="${DESK}" width="${w}" height="6" rx="2" fill="${mix(t, d, .18)}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>`;
/* 이젤 판: 흰 판(deep 선) + 다리 2 → 바닥선 */
const easel = (x, y, w, h, d) => `<ellipse cx="${x + w / 2}" cy="${FLOOR + 2}" rx="${w / 2 - 10}" ry="4" fill="${INK}" opacity=".08"/>
  <path d="M${x + 18} ${y + h} L${x + 12} ${FLOOR} M${x + w - 18} ${y + h} L${x + w - 12} ${FLOOR}" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>`;
/* 소득 막대 5개(하위→상위): hi 에 든 칸만 accent 채움, 나머지는 옅게. 축 + '하위 → 상위' */
const incomeBars = (x0, base, hs, hi, c, d) => `${hs.map((h, i) => `<rect x="${x0 + i * 22}" y="${base - h}" width="16" height="${h}" rx="2" fill="${hi.includes(i) ? c : mix(c, "#fff", .6)}"/>`).join("")}
  <path d="M${x0 - 6} ${base} h${hs.length * 22 + 6}" stroke="${d}" stroke-width="${SW.hair}" stroke-linecap="round"/>
  ${text(x0 + hs.length * 11 - 3, base + 14, "하위 → 상위", 3, MID)}`;
/* 괴물: 뿔 둘 + 이빨. dead 면 옅은 선 + X 눈(물리쳐진 것) */
const monster = (x, y, c, d, dead = 0) => {
  const st = dead ? LIGHT : d, fl = dead ? "#fff" : c;
  return `<g transform="translate(${x} ${y})">
  <path d="M-30 22 C-34 -6 -26 -24 -14 -32 L-12 -46 L-2 -34 L2 -34 L12 -46 L14 -32 C26 -24 34 -6 30 22 Z" fill="${fl}" stroke="${st}" stroke-width="${SW.line}" stroke-linejoin="round"/>
  <path d="M-16 8 l5-7 5 7 5-7 5 7 5-7 5 7" fill="none" stroke="${st}" stroke-width="${SW.hair}" stroke-linejoin="round"/>
  ${dead ? `<path d="M-15-12l7 7M-8-12l-7 7M8-12l7 7M15-12l-7 7" stroke="${st}" stroke-width="${SW.line}" stroke-linecap="round"/>`
         : `<circle cx="-11" cy="-8" r="4" fill="#fff"/><circle cx="11" cy="-8" r="4" fill="#fff"/><circle cx="-10" cy="-8" r="2" fill="${INK}"/><circle cx="12" cy="-8" r="2" fill="${INK}"/>`}
  <ellipse cx="-14" cy="24" rx="8" ry="3.5" fill="${fl}" stroke="${st}" stroke-width="${SW.hair}"/><ellipse cx="14" cy="24" rx="8" ry="3.5" fill="${fl}" stroke="${st}" stroke-width="${SW.hair}"/></g>`;
};
/* 위험 상자(드는 소품 · 놓는 소품): 흰 상자 + accent 띠 2 + '위험' — hw 22 · hh 16 */
const crate = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-22" y="-16" width="44" height="32" rx="3" fill="#fff" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M-22-10h44M-22 10h44" stroke="${c}" stroke-width="2.4" opacity=".55"/>
  <text y="4.3" font-size="12" font-weight="700" fill="${c}" text-anchor="middle" ${FONT}>위험</text></g>`;
Object.assign(crate, { hw: 22, hh: 16 });
/* 상자가 있던 자리: 점선 윤곽 */
const crateGhost = (x, y) => `<rect x="${x - 22}" y="${y - 16}" width="44" height="32" rx="3" fill="none" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>`;
/* 회사 건물: 틴트 몸체 + 창 격자 + 문. ghost 면 점선(비어 가는 옛 자리) */
const building = (x, y, w, h, c, d, t, ghost = 0) => {
  const st = ghost ? LIGHT : d, cols = Math.floor((w - 16) / 24), rows = Math.floor((h - 34) / 24);
  let win = "";
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++)
    win += `<rect x="${x + 12 + k * 24}" y="${y + 12 + r * 24}" width="14" height="14" rx="2" fill="${ghost ? "none" : "#fff"}" stroke="${st}" stroke-width="${SW.hair}"${ghost ? ` stroke-dasharray="3 3"` : ""}/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${ghost ? "none" : t}" stroke="${st}" stroke-width="${ghost ? SW.hair : SW.line}"${ghost ? ` stroke-dasharray="${DASH}"` : ""}/>
  ${win}
  <rect x="${x + w / 2 - 9}" y="${y + h - 22}" width="18" height="22" rx="2" fill="${ghost ? "none" : d}" stroke="${st}" stroke-width="${SW.hair}"${ghost ? ` stroke-dasharray="3 3"` : ""}/>`;
};
/* 쌀 포대(놓는 소품): 매듭 + 낟알 표시 */
const sack = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-20 24 V-8 q0-8 8-10 l-4-10 h32 l-4 10 q8 2 8 10 V24 z" fill="#fff" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M-16-18h32" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
  <ellipse cx="0" cy="6" rx="10" ry="6" fill="${c}" opacity=".85"/>
  <path d="M-4 5q4-3 8 0" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></g>`;
/* 손가방(드는 소품): 몸통 + 덮개 + 손잡이 + 걸린 가격표 — hw 22 · hh 14 */
const bag = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-12-14 q0-14 12-14 t12 14" fill="none" stroke="${INK}" stroke-width="1.8"/>
  <rect x="-22" y="-14" width="44" height="28" rx="5" fill="${c}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M-22-6 h44 v8 q-22 6-44 0z" fill="#fff" opacity=".3"/>
  <circle cx="0" cy="2" r="2.6" fill="#fff" stroke="${INK}" stroke-width="1.4"/></g>`;
Object.assign(bag, { hw: 22, hh: 14 });
/* 장바구니(놓는 소품): 사다리꼴 + 손잡이 + 살, 물건이 위로 삐져나온다 */
const basket = (x, y, s, c, d) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="34" rx="34" ry="4" fill="${INK}" opacity=".08"/>
  <circle cx="-14" cy="-20" r="9" fill="${c}"/><rect x="-2" y="-30" width="14" height="22" rx="2" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
  <path d="M14-22 q10-8 16 4" stroke="${d}" stroke-width="6" stroke-linecap="round"/>
  <path d="M-36-10 h72 l-8 42 h-56z" fill="#fff" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M-24-10 v42 M-12-10 v42 M0-10 v42 M12-10 v42 M24-10 v42" stroke="${c}" stroke-width="1.6" opacity=".6"/>
  <path d="M-36 2 h72" stroke="${INK}" stroke-width="1.8"/>
  <path d="M-18-10 a18 16 0 0 1 36 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></g>`;
/* 우유 곽 + 빵 (평면도 맨 안쪽 선반 위) */
const milkBread = (x, y, c, d) => `<g transform="translate(${x} ${y})">
  <path d="M-16-6 h10 v14 h-10z M-16-6 l2-5 h6 l2 5" fill="#fff" stroke="${d}" stroke-width="${SW.hair}" stroke-linejoin="round"/>
  <path d="M-14 0h6" stroke="${c}" stroke-width="2"/>
  <path d="M0 8 h18 q3 0 3-3 v-4 q0-5-5-5 h-14 q-5 0-5 5 v4 q0 3 3 3z" fill="${mix(c, "#fff", .55)}" stroke="${d}" stroke-width="${SW.hair}"/>
  <path d="M4 0q4-3 8 0M12 0q4-3 6 0" stroke="${d}" stroke-width="1" stroke-linecap="round"/></g>`;
/* 눈(비네트 관객) */
const eye = (x, y, s, c, d) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-16 0s6-10 16-10 16 10 16 10-6 10-16 10-16-10-16-10z" fill="#fff" stroke="${d}" stroke-width="${SW.line / s}" stroke-linejoin="round"/>
  <circle r="4.5" fill="${c}"/></g>`;

const scenes = {
 /* 46 — 템플릿 A: 같은 0.4 — 위쪽이 다 가져가는 나라 / 아래쪽이 거의 못 버는 나라. 이젤 위 소득 막대 5개가 대비 장치 */
 gini:(c,t,d)=>{
  const p1 = Object.assign({ x:78, y:FLOOR, s:1, c, pose:"point", face:"glad", brow:"up", look:3 }, CAST.analyst);
  const p2 = Object.assign({ x:406, y:FLOOR, s:1, c:d, face:"meh", brow:"low", head:5, look:3 }, CAST.reader);
  const h1 = anchors(p1).headTop;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"위쪽이 크게 버는 나라" }, PA))}
  ${floorSet(PA, d, t)}
  ${easel(150, 72, 124, 104, d)}
  ${incomeBars(160, 158, [10, 13, 16, 22, 76], [4], c, d)}
  ${person(p1)}
  ${bubble({ x:96, y:26, w:126, h:40, lines:["맨 위가 다 가진다"], c:d, lvl:2, to:{ x:h1.x + 4, y:h1.y + 2 } })}
  ${panel(Object.assign({ c:d, t, n:2, label:"아래쪽이 거의 못 버는 나라" }, PB))}
  ${floorSet(PB, d, t)}
  ${easel(480, 72, 124, 104, d)}
  ${incomeBars(490, 158, [5, 6, 46, 52, 58], [0, 1], c, d)}
  ${holding(p2, prop.paper, 1, { one:"L", R:"think" })}
  ${thought({ x:430, y:26, w:126, h:40, lines:["아래가 텅 비었네…"], c:d, side:"l", lvl:2 })}
  ${note({ x:300, y:78, w:40, h:40, lines:["같은","0.4"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 47 — 템플릿 A: 바깥의 적을 물리친 이야기(옅은 선 + X 눈 = 끝나고 잊힌다) / 안쪽의 갈등(두 생각 풍선이 반대로 당긴다) */
 conflict:(c,t,d)=>{
  const p1 = Object.assign({ x:96, y:FLOOR, s:1, c, pose:"cheer", arms:{ L:"cheer", R:"open" }, face:"laugh", brow:"up" }, CAST.hero);
  const p2 = Object.assign({ x:485, y:FLOOR, s:1, c:d, pose:"think", face:"worry", brow:"down", head:5, look:-3 }, CAST.torn);
  const m1 = anchors(p1).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"바깥의 적 — 이기면 끝난다" }, PA))}
  ${floorSet(PA, d, t)}
  <circle cx="222" cy="186" r="46" fill="none" stroke="${MID}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  ${monster(222, 190, c, d, 1)}
  ${text(222, 228, "물리친 괴물", 3, MID)}
  ${person(p1)}
  ${bubble({ x:150, y:60, w:96, h:40, lines:["이겼다!"], c:d, to:{ x:m1.x + 20, y:m1.y - 8 } })}
  ${panel(Object.assign({ c:d, t, n:2, label:"안쪽의 갈등 — 둘 다 가질 수 없다" }, PB))}
  ${floorSet(PB, d, t)}
  ${thought({ x:360, y:26, w:104, h:40, lines:["쉬고 싶다"], c:d, side:"r", lvl:2 })}
  ${thought({ x:506, y:26, w:104, h:40, lines:["성적도 원해"], c:d, side:"l", lvl:2 })}
  ${person(p2)}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 48 — 템플릿 A: 예전(회사 지붕 위의 '위험' 상자) / 지금(상자는 개인의 손에, 지붕 위엔 점선 자리만) */
 gig:(c,t,d)=>{
  const p1 = Object.assign({ x:84, y:FLOOR, s:1, c, face:"smile", look:2 }, CAST.clerk);
  const p2 = Object.assign({ x:420, y:FLOOR, s:1, c, face:"worry", brow:"down", head:-4 }, CAST.rider);
  const h1 = anchors(p1).headTop, h2 = anchors(p2).headTop;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"예전 — 회사가 위험을 진다" }, PA))}
  ${floorSet(PA, d, t)}
  ${building(160, 104, 116, 132, c, d, t)}
  ${crate(218, 84, 1, c)}
  ${person(p1)}
  ${bubble({ x:30, y:26, w:118, h:40, lines:["빈 오후는 회사 몫"], c:d, lvl:2, to:{ x:h1.x, y:h1.y + 2 } })}
  ${panel(Object.assign({ c:d, t, n:2, label:"지금 — 개인이 위험을 진다" }, PB))}
  ${floorSet(PB, d, t)}
  ${building(520, 140, 84, 96, c, d, t, 1)}
  ${crateGhost(562, 120)}
  ${holding(p2, crate, 1)}
  ${bubble({ x:364, y:26, w:118, h:40, lines:["이제 내 몫이다"], c:d, lvl:2, to:{ x:h2.x, y:h2.y + 2 } })}
  ${note({ x:300, y:84, w:40, h:28, lines:["위험"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 49 — 템플릿 C: 목록을 든 손님 → 위에서 본 매장(입구에서 맨 안쪽 우유까지 점선 동선) → 더 가득 찬 바구니 */
 store:(c,t,d)=>{
  const p = Object.assign({ x:80, y:232, s:1, c, legs:"walk", face:"smile", look:3 }, CAST.shopper);
  const shelf = (x, y) => `<rect x="${x}" y="${y}" width="16" height="84" rx="3" fill="${t}" stroke="${d}" stroke-width="${SW.hair}"/>`;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${holding(p, prop.paper, 1.05)}
  ${text(80, 258, "목록을 든 손님", 2, d)}
  ${arrow({ x1:142, y1:140, x2:180, y2:140, c:d, dash:1 })}
  ${panel({ x:192, y:40, w:236, h:184, c:d, label:"위에서 본 매장" })}
  <rect x="210" y="52" width="200" height="18" rx="3" fill="${mix(c, "#fff", .6)}" stroke="${d}" stroke-width="${SW.hair}"/>
  ${milkBread(250, 62, c, d)}
  ${[258, 298, 338, 378].map(x => shelf(x, 88)).join("")}
  <path d="M404 216 H232 V104" stroke="${c}" stroke-width="${SW.bold}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${DASH}"/>
  ${arrow({ x1:232, y1:106, x2:232, y2:80, c })}
  ${callout({ x:250, y:56, tx:262, ty:26, text:"우유 · 빵은 맨 안쪽", c:d, anchor:"start" })}
  ${callout({ x:404, y:216, tx:436, ty:246, text:"입구", c:d, anchor:"start" })}
  ${arrow({ x1:440, y1:132, x2:478, y2:132, c:d })}
  ${basket(548, 140, 1.2, c, d)}
  ${text(548, 206, "더 오래, 더 가득", 3, MID)}</svg>`; },

 /* 50 — 템플릿 A: 값이 두 배 된 쌀 앞에서 어깨를 으쓱하는 손님 / 값이 두 배 된 손가방을 들어 보이는 사람과 그것을 보는 사람 */
 veblen:(c,t,d)=>{
  const p1 = Object.assign({ x:88, y:FLOOR, s:1, c, pose:"shrug", face:"meh", brow:"low", head:4, look:3 }, CAST.passer, { capc:d });
  const p2 = Object.assign({ x:430, y:FLOOR, s:1, c:d, face:"glad", brow:"up", look:3 }, CAST.buyer);
  const p3 = Object.assign({ x:576, y:FLOOR, s:1, c, face:"oh", brow:"up", look:-4, flip:1 }, CAST.gazer);
  const m3 = anchors(p3).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"쌀 — 값이 오르면 덜 산다" }, PA))}
  ${floorSet(PA, d, t)}
  ${desk(170, 96, d, t)}
  ${sack(218, DESK - 26, 1, c)}
  ${tag({ x:218, y:126, text:"값 ×2", c:d })}
  ${person(p1)}
  ${thought({ x:108, y:26, w:126, h:40, lines:["비싸면 덜 사지"], c:d, side:"l", lvl:2 })}
  ${panel(Object.assign({ c:d, t, n:2, label:"손가방 — 값이 오르면 더 산다" }, PB))}
  ${floorSet(PB, d, t)}
  ${holding(p2, bag, 1, { one:"L", R:"wave", propc:c })}
  ${tag({ x:492, y:176, text:"값 ×2", c:d })}
  ${person(p3)}
  ${bubble({ x:476, y:60, w:72, h:36, lines:["저 값을!"], c:d, lvl:2, to:{ x:m3.x - 20, y:m3.y } })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },
};

/* 장면 캡션 1줄: build.js 가 figcaption 앞머리에 '<b>Figure N</b> 캡션 — (units 의 fig 설명)' 으로 찍는다 */
const SCENECAP = {
 gini: "숫자 하나가 두 모양을 감춘다",
 conflict: "이긴 적은 잊히고, 갈라진 마음은 남는다",
 gig: "위험은 사라지지 않고 자리를 옮긴다",
 store: "가장 흔한 심부름이 가장 먼 길을 걷는다",
 veblen: "같은 값 인상, 다른 발걸음",
};

/* 비네트 캡션: KB 제목을 되풀이하지 않고 도해가 가리키는 사실 하나 */
const VIGCAP = {
 "46": "로렌츠 곡선과 평등선 사이의 면적 · 1905",
 "47": "1960년대 이후 광고가 옮겨 간 자리",
 "48": "연금 · 병가 · 교육이 계약 밖으로 나올 때",
 "49": "왼쪽 자리 효과 — 2.99는 2로 읽힌다",
 "50": "베블런 『유한계급론』 · 1899",
};

const STRIP = {
 "46":["ruler","pair","balance","gear","letters"],
 "47":["shield","balance","frame","quote","eye"],
 "48":["handshake","cable","hourglass","alone","ask"],
 "49":["eye","map","ruler","balance","scope"],
 "50":["coin","tag","chat","nope","pair"]
};

/* ── 비네트(240×150 → 45mm): 인물 없이 소품 도해 1개 — 글자는 lvl "v"(칩) · "vs"(라벨) 만, SVG 안 제목 없음 ── */
const VIG = {
 /* 46 — 로렌츠 곡선: 점선 평등선과 곡선 사이 면적이 곧 지니계수 */
 "46":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M46 122 L146 22 C126 92 96 118 46 122z" fill="${c}" opacity=".3"/>
  <path d="M46 122 V22 M46 122 H146" stroke="${d}" stroke-width="${SW.bold}" stroke-linecap="round"/>
  <path d="M46 122 L146 22" stroke="${d}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  <path d="M46 122 C96 118 126 92 146 22" stroke="${c}" stroke-width="${SW.bold}" stroke-linecap="round"/>
  <path d="M112 90 L166 96" stroke="${d}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/><circle cx="112" cy="90" r="3.5" fill="${d}"/>
  ${tag({ x:194, y:46, text:"평등선", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:194, y:96, text:"지니계수", c:d, lvl:"v" })}
  ${text(96, 142, "인구 누적", "vs", MID)}
  ${text(28, 74, "소득", "vs", MID)}</svg>`,
 /* 47 — 기능 목록(주장) → 두 욕구가 갈라지는 장면 */
 "47":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${prop.paper(62, 70, 1.7, c)}
  ${arrow({ x1:104, y1:70, x2:134, y2:70, c:d })}
  <rect x="146" y="36" width="80" height="68" rx="6" fill="${t}" stroke="${d}" stroke-width="${SW.line}"/>
  <circle cx="186" cy="70" r="7" fill="${c}"/>
  ${arrow({ x1:178, y1:70, x2:154, y2:70, c:d })}
  ${arrow({ x1:194, y1:70, x2:218, y2:70, c:d })}
  ${tag({ x:62, y:128, text:"주장", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:186, y:128, text:"장면", c:d, lvl:"v" })}</svg>`,
 /* 48 — 옛 계약(한 상자에 묶인 셋) → 낱개 구매(값표가 붙은 셋) */
 "48":(c,t,d)=>{
  const item = (x, y, f) => `<rect x="${x - 9}" y="${y - 9}" width="18" height="18" rx="3" fill="${f}" stroke="${d}" stroke-width="${SW.hair}"/>`;
  return `<svg viewBox="0 0 240 150" fill="none">
  <rect x="24" y="40" width="80" height="62" rx="6" fill="${t}" stroke="${d}" stroke-width="${SW.line}"/>
  <path d="M24 60h80" stroke="${d}" stroke-width="${SW.hair}"/>
  ${item(44, 80, c)}${item(64, 80, c)}${item(84, 80, c)}
  ${arrow({ x1:110, y1:70, x2:136, y2:70, c:d })}
  ${item(154, 52, "#fff")}${item(196, 60, "#fff")}${item(172, 92, "#fff")}
  ${[[164, 44], [206, 52], [182, 84]].map(([x, y]) => `<text x="${x + 6}" y="${y + 4}" font-size="15" font-weight="700" fill="${c}" ${FONT}>$</text>`).join("")}
  ${tag({ x:64, y:126, text:"옛 계약", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:180, y:126, text:"낱개 구매", c:d, lvl:"v" })}</svg>`; },
 /* 49 — 3.00 → 2.99: 눈은 첫 자리를 읽고 넘어간다 */
 "49":(c,t,d)=>{
  const tagShape = (x, y) => `<path d="M${x} ${y} l16-20 h64 q6 0 6 6 v28 q0 6-6 6 h-64z" fill="#fff" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/><circle cx="${x + 18}" cy="${y}" r="3.5" fill="${d}"/>`;
  return `<svg viewBox="0 0 240 150" fill="none">
  ${tagShape(14, 66)}
  <text x="70" y="76" font-size="26" font-weight="700" fill="${MID}" text-anchor="middle" ${FONT}>3.00</text>
  ${arrow({ x1:112, y1:66, x2:132, y2:66, c:d })}
  ${tagShape(140, 66)}
  <text x="176" y="78" font-size="30" font-weight="700" fill="${d}" text-anchor="middle" ${FONT}>2</text>
  <text x="208" y="78" font-size="22" font-weight="700" fill="${LIGHT}" text-anchor="middle" ${FONT}>.99</text>
  ${text(64, 120, "3", "vs", MID)}
  ${text(188, 120, "2로 읽힌다", "vs", MID)}
  ${tag({ x:120, y:136, text:"왼쪽 자리 효과", c:d, lvl:"v" })}</svg>`; },
 /* 50 — 같은 가방: 안의 물건(혼자) / 밖의 시선(눈 셋) */
 "50":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${bag(62, 76, 1.2, c)}
  ${arrow({ x1:104, y1:74, x2:132, y2:74, c:d })}
  ${bag(180, 82, 1.2, c)}
  ${eye(150, 36, .8, c, d)}${eye(184, 26, .8, c, d)}${eye(218, 40, .8, c, d)}
  ${text(62, 132, "안의 물건", "vs", MID)}
  ${tag({ x:180, y:132, text:"밖의 시선", c:d, lvl:"v" })}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG, VIGCAP, SCENECAP };
