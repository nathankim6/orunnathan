/* Unit 3 삽화 — 정돈된 도해 (디자인 시스템 A, Unit 1 규격)
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64
   구도 템플릿: A 2패널 비교(x 20/350 w 270 h 228) · B 3단계 · C 단일 도해 · D 인물 대화
   장면 캡션은 SVG 안에 두지 않고 SCENECAP → figcaption 앞머리 한 줄 (그림 안 글자는 패널 라벨·풍선·콜아웃뿐)
   색: accent(c) · deep(d) · tint(t) + 잉크/회색 2단 + 흰색. 노랑 없음. */
const K = require("../kit.js");
const { person, holding, anchors, bubble, thought, note, panel, arrow, callout, tag, text, prop, ground, floorBand, mix, INK, MID, LIGHT, SW, DASH } = K;

/* ── 레슨 아이콘: 선화 stroke 3 round · 라이브 48×48(패딩 8) · 면 채움은 accent 30% 한 곳 ── */
const IC = c => `stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
 /* 접힌 지도 + 곧은 노선 */
 model:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M9 16l15-6 16 6 15-6v38l-15 6-16-6-15 6z" ${IC(c)}/>
  <path d="M24 10v38M40 16v38" ${IC(c)}/>
  <path d="M40 16l15-6v38l-15 6z" fill="${c}" opacity=".3"/>
  <path d="M15 40h9l8-8h10" ${IC(c)}/>
  <circle cx="32" cy="32" r="3" fill="#fff" ${IC(c)}/></svg>`,
 /* 말풍선 안에서 갈라지는 길 */
 joke:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M14 10h36a5 5 0 0 1 5 5v22a5 5 0 0 1-5 5H28l-10 9v-9h-4a5 5 0 0 1-5-5V15a5 5 0 0 1 5-5z" fill="${c}" opacity=".3"/>
  <path d="M14 10h36a5 5 0 0 1 5 5v22a5 5 0 0 1-5 5H28l-10 9v-9h-4a5 5 0 0 1-5-5V15a5 5 0 0 1 5-5z" ${IC(c)}/>
  <path d="M18 26h14l6-8h8M32 26l6 8h8" ${IC(c)}/>
  <circle cx="32" cy="26" r="2.5" fill="${c}"/></svg>`,
 /* 잘린 축의 꺾은선 */
 data:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M12 52V22M12 52h42" ${IC(c)}/>
  <path d="M9 32l6-4-6-4" ${IC(c)}/>
  <path d="M20 46l10-8 10 4 12-18v28H20z" fill="${c}" opacity=".3"/>
  <path d="M20 46l10-8 10 4 12-18" ${IC(c)}/>
  <circle cx="52" cy="24" r="3" fill="#fff" ${IC(c)}/></svg>`,
 /* 층을 지나는 노드 */
 neural:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M17 20l12 6M17 20l12 18M17 44l12-18M17 44l12 6M41 26l8 6M41 38l8-6" ${IC(c)}/>
  <circle cx="12" cy="20" r="5" ${IC(c)}/><circle cx="12" cy="44" r="5" ${IC(c)}/>
  <circle cx="34" cy="26" r="5" ${IC(c)}/><circle cx="34" cy="44" r="5" ${IC(c)}/>
  <circle cx="52" cy="32" r="5" fill="${c}" opacity=".3"/><circle cx="52" cy="32" r="5" ${IC(c)}/></svg>`,
 /* 카드가 쌓이는 피드 */
 feed:(c)=>`<svg viewBox="0 0 64 64">
  <rect x="18" y="8" width="28" height="48" rx="5" ${IC(c)}/>
  <rect x="23" y="16" width="18" height="9" rx="2" fill="${c}" opacity=".3"/>
  <rect x="23" y="16" width="18" height="9" rx="2" ${IC(c)}/>
  <rect x="23" y="29" width="18" height="9" rx="2" ${IC(c)}/>
  <rect x="23" y="42" width="18" height="9" rx="2" ${IC(c)}/>
  <path d="M29 12h6" ${IC(c)}/></svg>`,
};

/* ── 유닛 캐스팅: 한 배너 안 인물이 머리·상의·피부 모두 다르게 ── */
const CAST = {
 rider:   { hair:"short", hairc:"#2B2926", skin:"light", top:"shirt" },
 walker:  { hair:"bob",   hairc:"#8A4B25", skin:"tan",   top:"hoodie" },
 teller:  { hair:"curly", hairc:"#3A2E2A", skin:"brown", top:"tee", sleeve:"short" },
 hearer:  { hair:"pony",  hairc:"#B8742F", skin:"light", top:"sweater" },
 skeptic: { hair:"bun",   hairc:"#2B2926", skin:"tan",   top:"sweater", glasses:1 },
 fan:     { hair:"wavy",  hairc:"#6B3A20", skin:"light", top:"tee" },
 trainer: { hair:"buzz",  hairc:"#2B2926", skin:"brown", top:"shirt" },
 gazer:   { hair:"twin",  hairc:"#8A4B25", skin:"light", top:"hoodie" },
 scroller:{ hair:"short", hairc:"#3A2E2A", skin:"tan",   top:"tee", sleeve:"short" },
};
/* 패널: y 18 · h 228 (라벨 기준선 264) */
const PA = { x:20, y:18, w:270, h:228 }, PB = { x:350, y:18, w:270, h:228 };
const PD = { x:20, y:18, w:600, h:228 };
const FLOOR = 236;                                   // 인물 발밑 바닥선
const BAND = 204;                                    // 벽/바닥 경계
/* 벽에 붙은 안내판: 흰 판 + deep 머리띠(흰 점) */
const board = (x, y, w, h, d) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
  <path d="M${x + 6} ${y} h${w - 12} a6 6 0 0 1 6 6 v8 h-${w} v-8 a6 6 0 0 1 6-6z" fill="${d}"/>
  <circle cx="${x + 13}" cy="${y + 7}" r="2.4" fill="#fff"/>`;
/* 역 표시: 흰 원 + deep 테두리 (환승역은 크게) */
const station = (x, y, d, big = 0) => `<circle cx="${x}" cy="${y}" r="${big ? 7 : 5}" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>`;
/* 이젤: 판 아래 두 다리 + 가로대 + 바닥 그림자 */
const easel = (x, w, top, d) => `<ellipse cx="${x + w / 2}" cy="${FLOOR + 2}" rx="${w / 2 - 8}" ry="4" fill="${INK}" opacity=".08"/>
  <path d="M${x + 12} ${top} L${x + 6} ${FLOOR} M${x + w - 12} ${top} L${x + w - 6} ${FLOOR} M${x + 9} ${FLOOR - 14} H${x + w - 9}" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>`;
/* 꺾은선 차트: 축 + 눈금 라벨 2 + 선 + 점. vals 0–100, lo = 축 시작값 */
const chart = (x, y, w, h, vals, lo, c, d) => {
  const ax = x + 22, ay = y + h - 16, top = y + 14, right = x + w - 10;
  const pts = vals.map((v, i) => [ax + 14 + i * ((right - ax - 20) / (vals.length - 1)), ay - (ay - top) * ((v - lo) / (100 - lo))]);
  return `<path d="M${ax} ${top} V${ay} H${right}" stroke="${d}" stroke-width="${SW.bold}" stroke-linecap="round" stroke-linejoin="round"/>
  ${text(ax - 5, top + 4, "100", 3, MID, "end")}${text(ax - 5, ay + 4, String(lo), 3, MID, "end")}
  <path d="M${pts.map(p => p.join(" ")).join(" L")}" stroke="${c}" stroke-width="${SW.bold}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  ${pts.map(([px, py]) => `<circle cx="${px}" cy="${py}" r="4" fill="${c}"/>`).join("")}`;
};
/* 드는 소품: 라벨 붙은 고양이 사진 (hw 22 · hh 15) */
const photo = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-22" y="-19" width="44" height="34" rx="3" fill="#fff" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <rect x="-18" y="-15" width="36" height="20" rx="1.5" fill="${mix(c, "#fff", .82)}"/>
  <path d="M-9-1 q0-8 8-8 t8 8 v3 q-8 3-16 0z" fill="${c}"/>
  <path d="M-8-7 l-2-6 5 3z M6-7 l2-6-5 3z" fill="${c}"/>
  <rect x="-18" y="7" width="36" height="6" rx="1.5" fill="${c}"/></g>`;
Object.assign(photo, { hw: 22, hh: 15 });
/* 피드 카드: 흰 카드 + 동그라미 아이콘 + 흐린 글줄 */
const card = (x, y, c) => `<rect x="${x}" y="${y}" width="92" height="26" rx="6" fill="#fff" stroke="${c}" stroke-width="${SW.hair}"/>
  <circle cx="${x + 15}" cy="${y + 13}" r="7" fill="${c}"/>
  <path d="M${x + 30} ${y + 9} h44 M${x + 30} ${y + 17} h30" stroke="${LIGHT}" stroke-width="${SW.line}" stroke-linecap="round"/>`;
/* 신경망 노드: 흰 원 + 안쪽 무늬 (pix 화소 · edge 가장자리 · ear 귀 · eye 눈) */
const node = (x, y, kind, c, d) => {
  const inner = {
    pix:  `<rect x="-6" y="-6" width="6" height="6" fill="${c}"/><rect x="0" y="0" width="6" height="6" fill="${c}"/><rect x="0" y="-6" width="6" height="6" fill="${mix(c, "#fff", .7)}"/><rect x="-6" y="0" width="6" height="6" fill="${mix(c, "#fff", .7)}"/>`,
    edge: `<path d="M-6 5 L6-5" stroke="${c}" stroke-width="${SW.line}" stroke-linecap="round"/>`,
    ear:  `<path d="M-6 5 L0-6 L6 5z" fill="${c}"/>`,
    eye:  `<ellipse rx="6.5" ry="4" fill="none" stroke="${c}" stroke-width="1.8"/><circle r="2.2" fill="${c}"/>`,
  }[kind];
  return `<g transform="translate(${x} ${y})"><circle r="11" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>${inner}</g>`;
};

const scenes = {
 /* 11 — 템플릿 A: 노선도(곧은 선·고른 간격) / 실제 땅(굽은 길·다른 거리). 같은 여섯 역을 두 판에 그린다 */
 model:(c,t,d)=>{
  const p1 = Object.assign({ x:84, y:FLOOR, s:1, c, pose:"point", face:"glad", brow:"up" }, CAST.rider);
  const p2 = Object.assign({ x:414, y:FLOOR, s:1, c:d, legs:"walk", face:"worry", brow:"up", head:5, look:3 }, CAST.walker);
  const m1 = anchors(p1).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"노선도 — 곧은 선, 고른 간격" }, PA))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PA))}
  ${ground({ x1:PA.x+14, x2:PA.x+PA.w-14, y:FLOOR, c:d, w:SW.hair })}
  ${board(158, 66, 118, 106, d)}
  <path d="M176 150 H262" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
  <path d="M206 88 V150" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
  ${[[178,150],[234,150],[262,150],[206,92],[206,121]].map(([x,y])=>station(x,y,d)).join("")}
  ${station(206,150,d,1)}
  ${person(p1)}
  ${bubble({ x:60, y:26, w:112, h:40, lines:["갈아타는 곳만!"], c:d, to:{ x:m1.x, y:m1.y } })}
  ${panel(Object.assign({ c:d, t, n:2, label:"실제 땅 — 굽은 길, 다른 거리" }, PB))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PB))}
  ${ground({ x1:PB.x+14, x2:PB.x+PB.w-14, y:FLOOR, c:d, w:SW.hair })}
  ${board(488, 66, 118, 106, d)}
  <path d="M496 96 q22 10 30 30 t36 14 M500 160 q30-8 44 2 t44-6" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-linecap="round"/>
  <path d="M506 158 C516 140 520 128 528 134 S560 162 570 152 S592 128 596 142" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
  <path d="M540 84 C534 100 542 120 528 134" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
  ${[[506,158],[570,152],[596,142],[540,86],[537,110]].map(([x,y])=>station(x,y,d)).join("")}
  ${station(528,134,d,1)}
  ${holding(p2, prop.paper, 1, { one:"L", R:"think" })}
  ${thought({ x:440, y:26, w:116, h:40, lines:["거리가 다 다르네…"], c:d, side:"l", lvl:2 })}
  ${note({ x:300, y:78, w:40, h:40, lines:["같은","역"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 12 — 템플릿 D: 말하는 사람 → 한 줄로 쌓이던 뜻이 마지막 한 마디에서 갈라진다(점선 = 기대한 뜻 · 채움 = 도착한 뜻) → 웃는 사람 */
 joke:(c,t,d)=>{
  const p1 = Object.assign({ x:108, y:FLOOR, s:1, c, pose:"open", face:"grin", brow:"soft" }, CAST.teller);
  const p2 = Object.assign({ x:572, y:FLOOR, s:1, c:d, pose:"cheer", face:"laugh", brow:"up", flip:1, head:-5 }, CAST.hearer);
  const m1 = anchors(p1).mouth, m2 = anchors(p2).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, label:"한 줄로 가던 뜻이 마지막 한 마디에서 갈라진다" }, PD))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PD))}
  ${ground({ x1:PD.x+14, x2:PD.x+PD.w-14, y:FLOOR, c:d, w:SW.hair })}
  ${person(p1)}
  ${bubble({ x:160, y:76, w:118, h:40, lines:["그래서 말인데…"], c:d, to:{ x:m1.x, y:m1.y } })}
  <path d="M280 96 H338" stroke="${c}" stroke-width="${SW.bold}" stroke-linecap="round"/>
  <path d="M348 96 H400" stroke="${LIGHT}" stroke-width="${SW.bold}" stroke-linecap="round" stroke-dasharray="${DASH}"/>
  <rect x="404" y="78" width="92" height="36" rx="10" fill="none" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  ${text(450, 100, "기대한 뜻", 3, MID)}
  ${arrow({ x1:344, y1:100, x2:404, y2:150, c, curve:-26 })}
  ${note({ x:404, y:132, w:92, h:36, lines:["도착한 뜻"], c:d, tint:t })}
  <circle cx="342" cy="96" r="6" fill="${c}"/>
  ${callout({ x:342, y:96, tx:342, ty:44, text:"마지막 한 마디", c:d })}
  ${person(p2)}
  ${bubble({ x:486, y:30, w:64, h:32, lines:["하하!"], c:d, to:{ x:m2.x, y:m2.y } })}</svg>`; },

 /* 13 — 템플릿 A: 같은 다섯 점 — 0에서 시작한 축(완만) / 90에서 시작한 축(가파름) */
 data:(c,t,d)=>{
  const V = [91, 92, 94, 97, 99];
  const p1 = Object.assign({ x:80, y:FLOOR, s:1, c, pose:"shrug", face:"meh", brow:"low", head:4 }, CAST.skeptic);
  const p2 = Object.assign({ x:410, y:FLOOR, s:1, c, pose:"point", face:"oh", brow:"up" }, CAST.fan);
  const m2 = anchors(p2).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"0에서 시작한 축" }, PA))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PA))}
  ${ground({ x1:PA.x+14, x2:PA.x+PA.w-14, y:FLOOR, c:d, w:SW.hair })}
  ${easel(154, 124, 176, d)}
  <rect x="154" y="72" width="124" height="106" rx="6" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
  ${chart(154, 72, 124, 106, V, 0, c, d)}
  ${person(p1)}
  ${thought({ x:96, y:26, w:126, h:40, lines:["거의 그대로네"], c:d, side:"l", lvl:2 })}
  ${panel(Object.assign({ c:d, t, n:2, label:"90에서 시작한 축" }, PB))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PB))}
  ${ground({ x1:PB.x+14, x2:PB.x+PB.w-14, y:FLOOR, c:d, w:SW.hair })}
  ${easel(484, 124, 176, d)}
  <rect x="484" y="72" width="124" height="106" rx="6" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
  ${chart(484, 72, 124, 106, V, 90, c, d)}
  ${person(p2)}
  ${bubble({ x:396, y:26, w:112, h:40, lines:["급등이야!"], c:d, to:{ x:m2.x, y:m2.y } })}
  ${note({ x:300, y:78, w:40, h:40, lines:["같은","자료"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 14 — 템플릿 C: 라벨 붙은 사진 → 층을 지나는 신호(화소 → 가장자리 → 귀·눈) → 화면의 답 · 이유는 없다(점선 상자) */
 neural:(c,t,d)=>{
  const p = Object.assign({ x:80, y:232, s:1, c, face:"smile" }, CAST.trainer);
  const C1 = [76, 112, 148, 184].map(y => [224, y]), C2 = [94, 132, 170].map(y => [314, y]), C3 = [112, 152].map(y => [404, y]);
  const link = (A, B) => A.map(([x1,y1]) => B.map(([x2,y2]) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${LIGHT}" stroke-width="${SW.hair}"/>`).join("")).join("");
  return `<svg viewBox="0 0 640 280" fill="none">
  ${holding(p, photo, 1.1)}
  ${text(80, 258, "라벨 붙은 사진 수천 장", 2, d)}
  ${arrow({ x1:140, y1:140, x2:178, y2:140, c:d, dash:1 })}
  ${panel({ x:188, y:40, w:252, h:184, c:d, label:"층을 지나는 신호" })}
  ${link(C1, C2)}${link(C2, C3)}
  ${C1.map(([x,y]) => node(x, y, "pix", c, d)).join("")}
  ${C2.map(([x,y]) => node(x, y, "edge", c, d)).join("")}
  ${node(404, 112, "ear", c, d)}${node(404, 152, "eye", c, d)}
  ${callout({ x:314, y:94, tx:296, ty:26, text:"가장자리", c:d })}
  ${callout({ x:404, y:112, tx:426, ty:26, text:"귀 · 눈", c:d })}
  ${arrow({ x1:452, y1:132, x2:474, y2:132, c:d })}
  ${prop.screen(546, 122, 1.7, c)}
  ${text(546, 127, "고양이!", 1, "#fff")}
  <rect x="480" y="176" width="132" height="42" rx="10" fill="none" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  ${text(546, 201, "이유는 말하지 못한다", 3, MID)}</svg>`; },

 /* 15 — 템플릿 A: 창(여러 모양이 그대로 보인다) / 피드(같은 모양만 더 온다 · 나머지는 점선으로 걸러진다) */
 feed:(c,t,d)=>{
  const p1 = Object.assign({ x:84, y:FLOOR, s:1, c, pose:"point", face:"glad", brow:"up", look:3 }, CAST.gazer);
  const p2 = Object.assign({ x:416, y:FLOOR, s:1, c:d, face:"smile", head:6 }, CAST.scroller);
  const h2 = anchors(p2).hands;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"창 — 보이는 대로" }, PA))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PA))}
  ${ground({ x1:PA.x+14, x2:PA.x+PA.w-14, y:FLOOR, c:d, w:SW.hair })}
  <rect x="158" y="54" width="118" height="118" rx="5" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
  <path d="M217 54 V172 M158 113 H276" stroke="${d}" stroke-width="${SW.hair}"/>
  <circle cx="188" cy="84" r="12" fill="${c}"/>
  <path d="M232 104 l14-26 14 26z" fill="${d}"/>
  <rect x="177" y="130" width="22" height="22" rx="3" fill="${MID}"/>
  <circle cx="247" cy="142" r="8" fill="none" stroke="${c}" stroke-width="${SW.line}"/>
  ${person(p1)}
  ${panel(Object.assign({ c:d, t, n:2, label:"피드 — 고른 대로" }, PB))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PB))}
  ${ground({ x1:PB.x+14, x2:PB.x+PB.w-14, y:FLOOR, c:d, w:SW.hair })}
  ${[[476,50],[490,86],[496,122],[490,158]].map(([x,y]) => `<path d="M${h2.x + 10} ${h2.y - 18} L${x} ${y + 13}" stroke="${LIGHT}" stroke-width="${SW.hair}"/>`).join("")}
  ${[[476,50],[490,86],[496,122],[490,158]].map(([x,y]) => card(x, y, c)).join("")}
  <path d="M598 92 l10-20 10 20z" fill="none" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="4 3"/>
  <rect x="600" y="132" width="18" height="18" rx="3" fill="none" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="4 3"/>
  ${holding(p2, prop.phone, 1.4)}
  ${note({ x:300, y:78, w:40, h:40, lines:["같은","것만"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },
};

/* 장면 캡션 1줄: build.js 가 figcaption 앞머리에 '<b>Figure N</b> 캡션 — (units 의 fig 설명)' 으로 찍는다 */
const SCENECAP = {
 model: "곧게 그린 만큼, 무언가는 버려졌다",
 joke: "한 줄로 쌓다가 마지막에 갈라진다",
 data: "같은 점, 다른 축, 다른 이야기",
 neural: "맞히는 기계, 설명하지 못하는 기계",
 feed: "창이 아니라 골라 놓은 목록이다",
};

/* 비네트 캡션: KB 제목을 되풀이하지 않고 도해가 가리키는 사실 하나 */
const VIGCAP = {
 "11": "해리 벡의 런던 지하철 노선도 · 1933",
 "12": "프로바인의 대화 기록 1,200건",
 "13": "애스컴의 네 자료 묶음 · 1973",
 "14": "허스키를 늑대로 부른 분류기 · 2016",
 "15": "파리저의 '필터 버블' · 2011",
};

/* 플로차트 5단계 픽토그램 (pics.js 의 이름만 · 레슨 안 반복 없음) */
const STRIP = {
 "11":["map","coin","wrench","warn","ask"],
 "12":["swap","brain","nope","pair","handshake"],
 "13":["nope","books","ruler","quote","balance"],
 "14":["letters","tag","loop","frame","ask"],
 "15":["scope","eye","fire","wilt","balance"]
};

/* ── 비네트(240×150 → 45mm): 인물 없이 소품 도해 1개 — 글자는 lvl "v"(칩) · "vs"(라벨) 만 ── */
const VIG = {
 /* 벡의 노선도: 수직·수평·45° 선만, 역은 고른 간격, 환승역 하나 */
 "11":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M26 108 H88 L128 68 H206" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M64 30 V64 L108 108 H196" stroke="${d}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  ${[[48,108],[160,68],[192,68],[64,42],[150,108],[184,108]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>`).join("")}
  <circle cx="98" cy="98" r="7.5" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
  ${tag({ x:190, y:24, text:"환승만 남긴다", c:d, lvl:"v" })}
  ${text(120, 142, "수직 · 수평 · 45°뿐", "vs", MID)}</svg>`,
 /* 프로바인: 웃음은 혼자보다 함께일 때 훨씬 잦다 */
 "12":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M40 112 H200" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
  <rect x="62" y="90" width="44" height="22" rx="3" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
  <rect x="134" y="26" width="44" height="86" rx="3" fill="${d}"/>
  <path d="M148 46 q8 8 16 0" stroke="#fff" stroke-width="${SW.line}" stroke-linecap="round"/>
  <circle cx="150" cy="38" r="1.8" fill="#fff"/><circle cx="162" cy="38" r="1.8" fill="#fff"/>
  ${tag({ x:60, y:26, text:"웃음의 횟수", c:d, fill:"#fff", lvl:"v" })}
  ${text(84, 138, "혼자일 때", "vs", MID)}
  ${text(156, 138, "함께일 때", "vs", MID)}</svg>`,
 /* 애스컴의 네 자료: 점의 모양은 넷 다 다른데 요약값·회귀선은 같다 */
 "13":(c,t,d)=>{
  const cell = (x, y, pts) => `<path d="M${x} ${y} V${y + 52} H${x + 84}" stroke="${LIGHT}" stroke-width="${SW.hair}"/>
   <path d="M${x + 8} ${y + 44} L${x + 78} ${y + 10}" stroke="${c}" stroke-width="${SW.line}" stroke-linecap="round"/>
   ${pts.map(([px,py])=>`<circle cx="${x + px}" cy="${y + py}" r="3" fill="${d}"/>`).join("")}`;
  const A = [[12,40],[22,38],[30,30],[40,32],[48,22],[58,26],[66,14],[74,16]];
  const B = [[10,44],[20,30],[30,20],[40,15],[50,16],[60,21],[70,30],[78,42]];
  const C = [[12,44],[22,39],[32,34],[42,29],[52,24],[62,19],[72,14],[36,10]];
  const D = [[26,40],[26,34],[26,28],[26,22],[26,45],[26,16],[26,37],[76,10]];
  return `<svg viewBox="0 0 240 150" fill="none">
  ${cell(18, 30, A)}${cell(136, 30, B)}${cell(18, 94, C)}${cell(136, 94, D)}
  ${tag({ x:120, y:14, text:"평균 · 상관 모두 같다", c:d, lvl:"v" })}</svg>`; },
 /* 늑대인가 눈밭인가: 분류기가 본 곳은 동물이 아니라 배경의 눈 */
 "14":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="22" y="14" width="126" height="90" rx="6" fill="${t}" stroke="${d}" stroke-width="${SW.hair}"/>
  <path d="M22 66 q30-8 63 0 t63 0 V98 a6 6 0 0 1-6 6 H28 a6 6 0 0 1-6-6z" fill="#fff"/>
  <g transform="translate(84 68)">
   <path d="M-30-4 q-8-6-6-16 q6 6 10 12 h4 q0-14 12-14 h16 q6 0 10-6 l4-6 4 0 -1 6 4 0 -1 4 q6 0 8 6 l-2 5 -6 0 q-2 6-8 6 v9 h-5 v-8 h-5 v8 h-5 v-8 h-8 v8 h-5 v-8 h-4 v8 h-5 v-10 q-6-1-7-6z" fill="${d}"/>
  </g>
  <rect x="26" y="70" width="118" height="30" rx="4" fill="none" stroke="${c}" stroke-width="${SW.line}" stroke-dasharray="${DASH}"/>
  ${tag({ x:196, y:36, text:"늑대?", c:d, fill:"#fff", lvl:"v" })}
  ${arrow({ x1:196, y1:54, x2:196, y2:74, c:d })}
  ${tag({ x:196, y:92, text:"눈밭", c:d, lvl:"v" })}
  ${text(85, 132, "분류기가 본 곳", "vs", MID)}</svg>`,
 /* 필터 버블: 여러 모양이 들어가 같은 모양만 나온다 */
 "15":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <circle cx="52" cy="20" r="8" fill="${c}"/>
  <path d="M70 28 l10-18 10 18z" fill="${d}"/>
  <rect x="98" y="12" width="16" height="16" rx="2" fill="${MID}"/>
  <circle cx="132" cy="20" r="8" fill="${c}"/>
  <path d="M36 40 H148 L108 88 V110 H76 V88 z" fill="${t}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>
  <circle cx="92" cy="126" r="7" fill="${c}"/>
  <circle cx="92" cy="142" r="7" fill="${c}"/>
  ${tag({ x:186, y:56, text:"필터 버블", c:d, lvl:"v" })}
  ${text(184, 96, "같은 것만 남는다", "vs", MID)}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG, VIGCAP, SCENECAP };
