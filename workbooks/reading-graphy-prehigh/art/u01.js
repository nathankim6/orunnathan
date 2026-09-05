/* Unit 1 삽화 — 정돈된 도해 (방향 A)
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64
   구도 템플릿: A 2패널 비교(x 20/350 w 270 h 228, 화살표 y 124–132) · B 3단계 순서(칩 1–3) · C 단일 도해 · D 인물 대화
   장면 캡션은 SVG 안에 두지 않고 SCENECAP → figcaption 앞머리 한 줄로 찍는다 (그림 안 글자는 패널 라벨·풍선뿐)
   색: accent(c) · deep(d) · tint(t) + 잉크/회색 2단 + 흰색. 노랑은 전구 1개. */
const K = require("../kit.js");
const { person, holding, anchors, bubble, thought, note, panel, arrow, step, callout, tag, label, text, prop, ground, floorBand, mix, INK, MID, LIGHT, SW, DASH } = K;

/* ── 레슨 아이콘: 선화 stroke 3 round · 라이브 48×48(패딩 8) · 면 채움은 accent 30% 한 곳 ── */
const IC = c => `stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
 translation:(c)=>`<svg viewBox="0 0 64 64">
  <rect x="9" y="14" width="20" height="30" rx="3" fill="${c}" opacity=".3"/>
  <rect x="9" y="14" width="20" height="30" rx="3" ${IC(c)}/>
  <rect x="35" y="20" width="20" height="30" rx="3" ${IC(c)}/>
  <path d="M15 24h8M15 30h5M41 32h8M41 38h6" ${IC(c)}/>
  <path d="M27 54h12M35 50l4 4-4 4" ${IC(c)}/></svg>`,
 image:(c)=>`<svg viewBox="0 0 64 64">
  <rect x="9" y="13" width="46" height="34" rx="3" ${IC(c)}/>
  <path d="M15 42c6-11 11-13 16-6 3 4 6 3 8-2l10 12" fill="${c}" opacity=".3"/>
  <path d="M15 42c6-11 11-13 16-6 3 4 6 3 8-2l10 12" ${IC(c)}/>
  <circle cx="22" cy="23" r="3.5" ${IC(c)}/>
  <path d="M24 54h16" ${IC(c)}/></svg>`,
 practice:(c)=>`<svg viewBox="0 0 64 64">
  <rect x="9" y="24" width="46" height="18" rx="3" ${IC(c)}/>
  <path d="M18 24v18M32 24v18M46 24v18" ${IC(c)}/>
  <rect x="14" y="27" width="8" height="8" rx="2" fill="${c}" opacity=".3"/>
  <rect x="28" y="30" width="8" height="8" rx="2" fill="${c}" opacity=".3"/>
  <rect x="42" y="26" width="8" height="8" rx="2" fill="${c}" opacity=".3"/>
  <path d="M32 9v9M27 14l5-5 5 5M20 52h24" ${IC(c)}/></svg>`,
 shelter:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M10 44a22 22 0 0 1 44 0" ${IC(c)}/>
  <path d="M18 52V36h6v-6h6v6h4v-6h6v6h6v16" ${IC(c)}/>
  <path d="M27 52V44a5 5 0 0 1 10 0v8z" fill="${c}" opacity=".3"/>
  <path d="M27 52V44a5 5 0 0 1 10 0v8" ${IC(c)}/>
  <path d="M9 52h46" ${IC(c)}/></svg>`,
 talk:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M10 12h28a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H22l-8 7v-7h-4a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" fill="${c}" opacity=".3"/>
  <path d="M10 12h28a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H22l-8 7v-7h-4a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" ${IC(c)}/>
  <path d="M26 36h28a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-4v6l-7-6H26a4 4 0 0 1-4-4v-6" ${IC(c)}/>
  <path d="M16 20h16M16 26h10" ${IC(c)}/></svg>`,
};

/* ── 유닛 캐스팅: 배너 안 인물이 서로 다르게 ── */
const CAST = {
 reader1: { hair:"short", hairc:"#2B2926", skin:"light", top:"tee" },
 reader2: { hair:"bob",   hairc:"#6B3A20", skin:"tan",   top:"shirt" },
 player:  { hair:"pony",  hairc:"#3A2E2A", skin:"light", top:"hoodie" },
 girl:    { hair:"long",  hairc:"#8A4B25", skin:"tan",   top:"sweater" },
 talker1: { hair:"bun",   hairc:"#2B2926", skin:"light", top:"shirt" },
 talker2: { hair:"curly", hairc:"#3A2E2A", skin:"brown", top:"tee", sleeve:"short" },
 talker3: { hair:"buzz",  hairc:"#2B2926", skin:"tan",   top:"hoodie", glasses:1 },
};
/* 패널: y 18 · h 228 (라벨 기준선 264). 장면 캡션은 SVG 안이 아니라 SCENECAP → figcaption 앞머리 */
const P3 = [{ x:20, y:18, w:186, h:228 }, { x:227, y:18, w:186, h:228 }, { x:434, y:18, w:186, h:228 }];
const PA = { x:20, y:18, w:270, h:228 }, PB = { x:350, y:18, w:270, h:228 };   // 패널 사이 60 (노트 40 + 여백 10·10)
const FLOOR = 236;                                   // 인물 발밑 바닥선 (패널 바닥 246 − 10)
const BAND = 204;                                    // 벽/바닥 경계 (책상 상판 192 보다 12 아래)
const DESK = 192;                                    // 책상 상판 윗선
/* 작은 책상: 두께 6 상판(틴트보다 한 단 진한 면 + deep 선, rx 2) + 다리 2(SW.line) + 바닥 그림자 */
const desk = (x, w, d, t) => `<ellipse cx="${x + w / 2}" cy="${FLOOR + 2}" rx="${w / 2 - 6}" ry="4" fill="${INK}" opacity=".08"/>
  <path d="M${x + 10} ${DESK + 6}V${FLOOR}M${x + w - 10} ${DESK + 6}V${FLOOR}" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
  <rect x="${x}" y="${DESK}" width="${w}" height="6" rx="2" fill="${mix(t, d, .18)}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>`;
/* 시 종이: kind "orig" = 굵은 두 줄(살아 있는 행) + 반짝 3(종이 오른쪽 위 모서리 (14,-18) 에서 대각선 위로 방사 — 책 rect(y ≥ DESK−16) 보다 위) · "trans" = 흐린 한 줄 + 사라진 줄 자리(점선). rot 로 책에 기대 놓는다 */
const sheet = (x, y, s, c, d, kind, rot = 0) => {
  const lines = kind === "orig"
    ? `<path d="M-9-9h18" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
       <path d="M-9-2h18M-9 5h13" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
       <path d="M-9 12h10" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`
    : `<path d="M-9-9h18" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
       <path d="M-9-2h18" stroke="${LIGHT}" stroke-width="3" stroke-linecap="round"/>
       <path d="M-9 5h13" stroke="${LIGHT}" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="2.5 2.5"/>
       <path d="M-9 12h10" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`;
  const spark = kind === "orig" ? [[17, -29, 3.2], [26, -24, 2.4], [31, -15, 2]].map(([sx, sy, r]) =>
    `<path d="M${sx} ${sy - r}v${r * 2}M${sx - r} ${sy}h${r * 2}" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`).join("") : "";
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <rect x="-14" y="-18" width="28" height="36" rx="2.5" fill="#fff" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    ${lines}${spark}</g>`;
};
/* 책상 세트: 책상 + 세워 둔 책(뒤) + 책에 기대 놓은 시 종이(앞) */
const deskSet = (x, c, d, t, kind) => `${desk(x, 96, d, t)}
  ${prop.bookc(x + 78, DESK - 16, 1, c)}
  ${sheet(x + 48, DESK - 24, 1.4, c, d, kind, 8)}`;

const scenes = {
 /* 01 — 템플릿 A: 원작을 읽는 사람 / 번역본을 읽는 사람 */
 translation:(c,t,d)=>{
  /* 왼쪽: 두 손으로 원작을 펼친 사람 + 책상 위 원문 시(굵은 두 줄이 반짝인다)
     오른쪽: 한 손에 번역본, 한 손은 턱(think) · 고개 5° · 책상 위 번역 시(한 줄은 흐리고 한 줄은 자리만 남았다)
     풍선은 입 높이(y 82–134)에, 꼬리는 왼쪽 변에서 얼굴 가장자리까지 */
  const p1 = Object.assign({ x:96, y:FLOOR, s:1, c, face:"glad", brow:"up" }, CAST.reader1);
  const p2 = Object.assign({ x:426, y:FLOOR, s:1, c:d, face:"meh", brow:"low", head:5, look:2 }, CAST.reader2);
  const m1 = anchors(p1).mouth, m2 = anchors(p2).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"원작을 읽는 사람" }, PA))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PA))}
  ${ground({ x1:PA.x+14, x2:PA.x+PA.w-14, y:FLOOR, c:d, w:SW.hair })}
  ${deskSet(176, c, d, t, "orig")}
  ${holding(p1, prop.book, 1.15)}
  ${bubble({ x:146, y:82, w:124, h:52, lines:["이 한 줄이","환하게 들려!"], c:d, to:{ x:m1.x+20, y:m1.y } })}
  ${panel(Object.assign({ c:d, t, n:2, label:"번역본을 읽는 사람" }, PB))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PB))}
  ${ground({ x1:PB.x+14, x2:PB.x+PB.w-14, y:FLOOR, c:d, w:SW.hair })}
  ${deskSet(506, c, d, t, "trans")}
  ${holding(p2, prop.book, 1.15, { one:"L", R:"think" })}
  ${bubble({ x:478, y:82, w:124, h:52, lines:["뜻은 알겠는데…","뭔가 밋밋해."], c:d, to:{ x:m2.x+20, y:m2.y } })}
  ${note({ x:300, y:84, w:40, h:28, lines:["번역"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 02 — 템플릿 C: 찍는 사람 → 화면에 남은 것(리더선 콜아웃 2) → 잘려 나간 바깥(점선 상자 + 잔상) */
 image:(c,t,d)=>{
  const p = Object.assign({ x:86, y:232, s:1, c, pose:"hold", face:"smile" }, CAST.player, { hair:"cap", capc:d });
  return `<svg viewBox="0 0 640 280" fill="none">
  ${holding(p, prop.screen_t, 1)}
  ${text(86, 258, "찍는 사람", 2, d)}
  ${arrow({ x1:148, y1:140, x2:192, y2:140, c:d, dash:1 })}
  ${panel({ x:204, y:40, w:216, h:184, c:d, label:"화면에 남은 것" })}
  <clipPath id="ph"><rect x="205" y="41" width="214" height="182" rx="9"/></clipPath>
  <g clip-path="url(#ph)"><path d="M204 224 v-12 c24-46 46-52 66-22 10 18 26 14 34-4 l44 40 v10z" fill="${c}" opacity=".35"/>
  <path d="M204 212 c24-46 46-52 66-22 10 18 26 14 34-4 l44 40" stroke="${d}" stroke-width="${SW.hair}"/></g>
  <circle cx="250" cy="96" r="12" fill="${c}"/>
  ${callout({ x:250, y:96, tx:262, ty:30, text:"고른 빛", c:d, anchor:"start" })}
  ${callout({ x:372, y:186, tx:452, ty:246, text:"고른 순간", c:d, anchor:"start" })}
  <rect x="452" y="40" width="164" height="148" rx="10" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  <path d="M452 186 c26-34 50-36 66-12 10 14 22 10 30-2 l24 12" stroke="${LIGHT}" stroke-width="${SW.hair}"/>
  <circle cx="586" cy="92" r="9" fill="none" stroke="${LIGHT}" stroke-width="${SW.hair}"/>
  ${text(534, 124, "잘려 나간 바깥", 3, MID)}
  ${arrow({ x1:428, y1:132, x2:444, y2:132, c:LIGHT, dash:1 })}</svg>`; },

 /* 03 — 템플릿 A: 연습실(엔지니어처럼) / 무대(조종사처럼) */
 practice:(c,t,d)=>{
  const p1 = Object.assign({ x:96, y:FLOOR, s:1, c, face:"flat", brow:"soft" }, CAST.player);
  const p2 = Object.assign({ x:426, y:FLOOR, s:1, c, pose:"cheer", arms:{ L:"cheer", R:"open" }, face:"laugh", brow:"up" }, CAST.talker2);
  const m2 = anchors(p2).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"연습실 — 엔지니어처럼", floor:1 }, PA))}
  ${holding(p1, prop.paper, 1.05)}
  <rect x="164" y="194" width="116" height="20" rx="4" fill="#fff" stroke="${d}" stroke-width="${SW.hair}"/>
  ${[176,192,208,224,240,256,272].map(x=>`<path d="M${x} 198v12" stroke="${LIGHT}" stroke-width="${SW.hair}"/>`).join("")}
  ${[176,192,208,224,240].map((x,i)=>`<rect x="${x-3}" y="${204-[3,6,4,8,5][i]}" width="6" height="${[3,6,4,8,5][i]*2}" rx="1.5" fill="${c}"/>`).join("")}
  ${thought({ x:140, y:62, w:132, h:52, lines:["여기 한 마디만","스무 번 더"], c:d, side:"l" })}
  ${panel(Object.assign({ c:d, t, n:2, label:"무대 — 조종사처럼", floor:1 }, PB))}
  ${person(p2)}
  <rect x="476" y="200" width="130" height="14" rx="3" fill="${c}" opacity=".3"/>
  ${bubble({ x:480, y:82, w:124, h:52, lines:["지금 눈앞의","이 소리로"], c:d, to:{ x:m2.x+20, y:m2.y } })}
  ${arrow({ x1:302, y1:132, x2:338, y2:132, c:d })}</svg>`; },

 /* 04 — 템플릿 A: 모든 위험을 치운 성(점선 원 = 제거됨) / 성 밖으로 나온 뒤(채워진 삼각형 = 실재) */
 shelter:(c,t,d)=>{
  const p1 = Object.assign({ x:84, y:FLOOR, s:1, c, pose:"down", face:"worry", brow:"down" }, CAST.girl);
  const p2 = Object.assign({ x:414, y:FLOOR, s:1, c, pose:"point", face:"glad", brow:"up" }, CAST.girl);
  const m2 = anchors(p2).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"모든 위험을 치운 성", floor:1 }, PA))}
  ${person(p1)}
  ${[168,220,272].map(x=>`<g transform="translate(${x} 178)">${prop.spindle(0,0,.8,LIGHT).replace(/#3A2E27/g,LIGHT)}
    <circle r="23" fill="none" stroke="${MID}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
    <path d="M-16-16 16 16M16-16-16 16" stroke="${LIGHT}" stroke-width="${SW.line}" stroke-linecap="round"/></g>`).join("")}
  ${text(220, 222, "치워진 물레들", 3, MID)}
  ${panel(Object.assign({ c:d, t, n:2, label:"성 밖으로 나온 뒤", floor:1 }, PB))}
  ${person(p2)}
  ${bubble({ x:476, y:70, w:112, h:40, lines:["내가 정한다"], c:d, to:{ x:m2.x+20, y:m2.y } })}
  ${[512,548,584].map(x=>`<path d="M${x} 204 l13-28 13 28z" fill="${c}" opacity=".55"/>`).join("")}
  ${text(548, 224, "실제 위험", 3, MID)}
  ${arrow({ x1:302, y1:132, x2:338, y2:132, c:d })}</svg>`; },

 /* 05 — 템플릿 B: 3패널 순서 — 혼자 읽는다 → 말로 꺼낸다 → 이해가 자란다 */
 talk:(c,t,d)=>{
  const s = .85, y = FLOOR;
  const p1 = Object.assign({ x:113, y, s, c, face:"flat" }, CAST.reader1);
  const p2 = Object.assign({ x:280, y, s, c, pose:"open", face:"oh", brow:"up", look:3 }, CAST.talker1);
  const p3 = Object.assign({ x:372, y, s, c:d, pose:"down", face:"smile", look:-4, flip:1 }, CAST.talker2);
  const p4 = Object.assign({ x:520, y, s, c, pose:"up", face:"glad", brow:"up" }, CAST.talker3);
  const m2 = anchors(p2).mouth, hR = anchors(p4).wristR;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"혼자 읽는다", floor:1 }, P3[0]))}
  ${holding(p1, prop.book, 1.15)}
  ${panel(Object.assign({ c:d, t, n:2, label:"말로 꺼낸다", floor:1 }, P3[1]))}
  ${person(p2)}${person(p3)}
  ${bubble({ x:246, y:52, w:140, h:32, lines:["나는 이렇게 읽었어"], c:d, lvl:2, to:{ x:m2.x+16, y:m2.y-2 } })}
  ${panel(Object.assign({ c:d, t, n:3, label:"이해가 자란다", floor:1 }, P3[2]))}
  ${person(p4)}
  ${prop.bulb(hR.x + 20, hR.y - 6, 1, c)}</svg>`; },
};

/* 장면 캡션 1줄: build.js 가 figcaption 앞머리에 '<b>Figure N</b> 캡션 — (units 의 fig 설명)' 으로 찍는다 */
const SCENECAP = {
 translation: "옮겨진 것 옆에, 남겨진 것이 있다",
 image: "이미지는 누군가가 고른 한 조각이다",
 practice: "연습실의 엔지니어, 무대의 조종사",
 shelter: "치워진 위험, 실제 위험",
 talk: "읽고, 말하고, 자란다",
};

/* 비네트 캡션: KB 제목을 되풀이하지 않고 도해가 가리키는 사실 하나를 적는다 */
const VIGCAP = {
 "01": "스키아파렐리의 화성 지도 · 1877",
 "02": "마그리트 〈이미지의 배반〉 1929",
 "03": "보잉 299 사고가 낳은 점검표",
 "04": "물레 → 100년의 잠 · 페로 1697",
 "05": "think-aloud · 소리 내어 생각하기",
};

const STRIP = {
 "01":["globe","swap","hourglass","palette","handshake"],
 "02":["eye","letters","frame","camera","pipe"],
 "03":["heartbeat","ruler","quote","wrench","takeoff"],
 "04":["wand","fire","dome","wilt","sunrise"],
 "05":["books","map","openbook","chat","loop"]
};

/* ── 비네트(240×150 → 45mm): 인물 없이 소품 도해 1개 — 글자는 lvl "v"(칩) · "vs"(라벨) 만, SVG 안 제목 없음 ── */
const VIG = {
 /* 화성의 canali(자연 수로) → canals(사람이 판 운하): 같은 구체 두 개 — 왼쪽은 굽은 물길, 오른쪽은 곧은 직선 */
 "01":(c,t,d)=>{
  const globe = (cx, cy, id, lines) => `<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="34"/></clipPath>
   <circle cx="${cx}" cy="${cy}" r="34" fill="${c}"/>
   <g clip-path="url(#${id})"><path d="M${cx} ${cy-34}a34 34 0 0 1 0 68a22 34 0 0 0 0-68z" fill="${d}" opacity=".18"/>${lines}</g>`;
  /* 자연 수로 = 가는 흰 곡선(hair) · 운하 = 굵은 흰 직선(line) — 선 굵기 차이가 곧 '자연 vs 인공' */
  const curved = (cx, cy) => `<path d="M${cx-32} ${cy-14}q14-12 30 0t30 6M${cx-34} ${cy+4}q16-10 32 2t32-8M${cx-28} ${cy+20}q14-8 28 2t26-4" stroke="#fff" stroke-width="${SW.hair}" stroke-linecap="round" opacity=".85"/>`;
  const straight = (cx, cy) => `<path d="M${cx-32} ${cy-18}L${cx+32} ${cy-6}M${cx-34} ${cy+4}L${cx+34} ${cy+2}M${cx-28} ${cy+22}L${cx+30} ${cy+12}" stroke="#fff" stroke-width="${SW.line}" stroke-linecap="round" opacity=".95"/>`;
  return `<svg viewBox="0 0 240 150" fill="none">
  ${globe(62, 86, "vg01a", curved(62, 86))}
  ${globe(178, 86, "vg01b", straight(178, 86))}
  ${arrow({ x1:104, y1:86, x2:136, y2:86, c:d })}
  ${tag({ x:62, y:26, text:"canali", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:178, y:26, text:"canals", c:d, lvl:"v" })}
  ${text(62, 144, "자연 수로", "vs", MID)}
  ${text(178, 144, "사람이 판 운하", "vs", MID)}</svg>`; },
 /* 마그리트: 이것은 파이프가 아니다 */
 "02":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="14" y="8" width="212" height="96" rx="6" fill="#fff" stroke="${d}" stroke-width="${SW.hair}"/>
  <path d="M84 46h44c0 14-10 22-22 22S84 60 84 46z" fill="${c}"/>
  <path d="M128 46h24c6 0 9 3 9 9v8M84 46c0-7-5-10-11-7" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
  ${text(120, 94, "Ceci n'est pas une pipe.", "vs", MID)}
  ${tag({ x:120, y:128, text:"이건 파이프가 아니다", c:d, lvl:"v" })}</svg>`,
 /* 조종사의 체크리스트 (1935) */
 "03":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="62" y="12" width="116" height="98" rx="6" fill="#fff" stroke="${d}" stroke-width="${SW.hair}"/>
  <rect x="104" y="6" width="32" height="12" rx="3" fill="${d}"/>
  ${[0,1,2,3].map(i=>`<rect x="76" y="${30+i*19}" width="13" height="13" rx="2" stroke="${d}" stroke-width="${SW.hair}" fill="#fff"/>
    ${i<3?`<path d="M79 ${37+i*19}l3 3 6-7" stroke="${c}" stroke-width="${SW.line}" stroke-linecap="round" stroke-linejoin="round"/>`:""}
    <path d="M98 ${36.5+i*19}h${[62,48,66,44][i]}" stroke="${LIGHT}" stroke-width="${SW.bold}" stroke-linecap="round"/>`).join("")}
  ${tag({ x:120, y:130, text:"이륙 전 점검표 · 1935", c:d, lvl:"v" })}</svg>`,
 /* 원래는 100년을 잤다 */
 "04":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${prop.spindle(56, 66, 1.6, c)}
  ${arrow({ x1:96, y1:64, x2:128, y2:64, c:d, dash:1 })}
  ${prop.clock(166, 62, 1.5, c)}
  ${text(56, 116, "spindle", "vs", MID)}
  ${tag({ x:166, y:124, text:"100년의 잠", c:d, lvl:"v" })}</svg>`,
 /* 소리 내어 생각하며 읽기 */
 "05":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${prop.book(62, 98, 1.7, c)}
  ${bubble({ x:96, y:12, w:132, h:58, lines:["왜 이 말을","골랐지?"], c:d, lvl:"v", to:{ x:80, y:84 } })}
  ${text(166, 128, "소리 내어 생각하기", "vs", MID)}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG, VIGCAP, SCENECAP };
