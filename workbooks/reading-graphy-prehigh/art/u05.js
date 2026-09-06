/* Unit 5 삽화 — 철학·종교 · 정돈된 도해 (디자인 시스템 A, Unit 1 규격)
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64
   구도 템플릿: A 2패널 비교(x 20/350 w 270 h 228) · B 3패널 순서(칩 1–3, s .85) · C 단일 도해(프레임 + 리더선 콜아웃) · D 인물 대화
   장면 캡션은 SVG 안에 두지 않고 SCENECAP → figcaption 앞머리 한 줄로 찍는다 (그림 안 글자는 패널 라벨·풍선·콜아웃뿐)
   색: accent(c) · deep(d) · tint(t) + 잉크/회색 2단 + 흰색. 이 유닛은 노랑을 쓰지 않는다.
   레슨별 구도
   21 ritual  B 3패널 — 같은 시각에 같은 노래(두 사람·벽시계) → 이레째 칸(달력) → 옛이야기(책 읽어 주는 어른·아이)
   22 twoq    A 2패널 — 같은 나무 도판(다윈의 가지)을 두고 '어떻게 생겨났나' / '어떻게 살아야 하나' — 사이 화살은 점선(간극)
   23 sophist C 단일 — 말하는 사람 → 한 길이 갈라진다: 트로피(이기는 길) / 저울(맞는 길)
   24 stoic   A 2패널 — 훈련(주로·허들·시계) / 결과(시상대·트로피·비구름 = 점선) — 사이 선 하나
   25 wanting C 단일 — 계단·깃발(채워진 바람 점선 → 다음 바람) · 지평선 → 원 밖의 두 문(예술·연민) */
const K = require("../kit.js");
const { person, holding, anchors, bubble, thought, note, panel, arrow, callout, tag, text, prop, ground, floorBand, mix, INK, MID, LIGHT, SW, DASH } = K;

/* ── 레슨 아이콘: 선화 stroke 3 round · 라이브 48×48(패딩 8) · 면 채움은 accent 30% 한 곳 · 다섯 개 모두 '물건 하나 + 바닥선' 계열 ── */
const IC = c => `stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
 /* 종 — 같은 시각에 사람을 모으는 소리 */
 ritual:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M19 42c0-15 3-24 13-24s13 9 13 24z" fill="${c}" opacity=".3"/>
  <path d="M19 42c0-15 3-24 13-24s13 9 13 24" ${IC(c)}/>
  <path d="M32 12v6M12 42h40" ${IC(c)}/>
  <circle cx="32" cy="49" r="3.5" ${IC(c)}/>
  <path d="M11 22q-4 7 0 14M53 22q4 7 0 14" ${IC(c)}/></svg>`,
 /* 갈림길 표지판 — 같은 기둥에서 다른 쪽을 가리키는 두 판 */
 twoq:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M32 12v42M22 54h20" ${IC(c)}/>
  <path d="M12 21l6-6h24v12H18z" fill="${c}" opacity=".3"/>
  <path d="M12 21l6-6h24v12H18z" ${IC(c)}/>
  <path d="M52 39l-6-6H22v12h24z" ${IC(c)}/></svg>`,
 /* 기운 저울 — 이김이 맞음을 누른다 */
 sophist:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M32 14v40M22 54h20" ${IC(c)}/>
  <path d="M12 26l40-10" ${IC(c)}/>
  <path d="M12 26v12M52 16v12" ${IC(c)}/>
  <path d="M4 38h16a8 8 0 0 1-16 0z" fill="${c}" opacity=".3"/>
  <path d="M4 38h16a8 8 0 0 1-16 0z" ${IC(c)}/>
  <path d="M44 28h16a8 8 0 0 1-16 0z" ${IC(c)}/></svg>`,
 /* 선 하나로 나뉜 원 — 내 몫(채움·점) / 아닌 것(빈 점) */
 stoic:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M32 12a20 20 0 0 0 0 40z" fill="${c}" opacity=".3"/>
  <circle cx="32" cy="32" r="20" ${IC(c)}/>
  <path d="M32 12v40" ${IC(c)}/>
  <circle cx="22" cy="32" r="4" fill="${c}"/>
  <circle cx="42" cy="32" r="4" ${IC(c)}/></svg>`,
 /* 계단 위의 깃발 — 올라서면 한 계단 물러난다 */
 wanting:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M10 54V42h12V30h12V18h12v36z" fill="${c}" opacity=".3"/>
  <path d="M10 54V42h12V30h12V18h12" ${IC(c)}/>
  <path d="M8 54h48" ${IC(c)}/>
  <path d="M50 18V8" ${IC(c)}/>
  <path d="M50 8h12l-3 4 3 4H50z" ${IC(c)}/></svg>`,
};

/* ── 유닛 캐스팅: 배너 안 인물이 서로 다르게 (한 배너 안에서는 top·hair 가 겹치지 않는다) ── */
const CAST = {
 singer1: { hair:"short", hairc:"#2B2926", skin:"light", top:"tee" },
 singer2: { hair:"curly", hairc:"#3A2E2A", skin:"brown", top:"sweater" },
 marker:  { hair:"bob",   hairc:"#6B3A20", skin:"tan",   top:"shirt" },
 elder:   { hair:"bun",   hairc:"#7C7C82", skin:"light", top:"apron", glasses:1 },
 child:   { hair:"twin",  hairc:"#8A4B25", skin:"tan",   top:"hoodie" },
 scientist:{ hair:"buzz", hairc:"#2B2926", skin:"tan",   top:"shirt", glasses:1 },
 thinker: { hair:"long",  hairc:"#8A4B25", skin:"light", top:"sweater" },
 speaker: { hair:"wavy",  hairc:"#3A2E2A", skin:"light", top:"shirt" },
 runner:  { hair:"pony",  hairc:"#2B2926", skin:"tan",   top:"tee", sleeve:"short" },
 climber: { hair:"cap",   hairc:"#3A2E2A", skin:"light", top:"hoodie" },
};
/* 패널: y 18 · h 228 (라벨 기준선 264). 장면 캡션은 SVG 안이 아니라 SCENECAP → figcaption 앞머리 */
const P3 = [{ x:20, y:18, w:186, h:228 }, { x:227, y:18, w:186, h:228 }, { x:434, y:18, w:186, h:228 }];
const PA = { x:20, y:18, w:270, h:228 }, PB = { x:350, y:18, w:270, h:228 };   // 패널 사이 60 (노트 40 + 여백 10·10)
const FLOOR = 236;                                   // 인물 발밑 바닥선 (패널 바닥 246 − 10)
const BAND = 204;                                    // 벽/바닥 경계
/* 방(패널 + 바닥 띠 + 바닥선) 한 벌 */
const room = (P, c, t, d, n, label) => `${panel(Object.assign({ c:d, t, n, label }, P))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, P))}
  ${ground({ x1:P.x+14, x2:P.x+P.w-14, y:FLOOR, c:d, w:SW.hair })}`;
/* 소품 공통: 흰 바탕 + 잉크 외곽 1.8 (kit.prop 과 같은 선) */
const OP = (fill, w = 1.8) => `fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const LN = (col, w) => `stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const shadow = (x, w) => `<ellipse cx="${x}" cy="${FLOOR + 2}" rx="${w / 2}" ry="4" fill="${INK}" opacity=".08"/>`;
const FT = `font-family="'Noto Sans CJK KR','Noto Sans KR',sans-serif"`;

/* 음표 ♪ — 노래하는 입 옆에 */
const noteMark = (x, y, c, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="-4" cy="6" rx="5" ry="3.6" transform="rotate(-20 -4 6)" fill="${c}"/>
  <path d="M1 5v-16q0-3 3-3l6 2" ${LN(c, 2.2)}/></g>`;
/* 벽시계 (벽에 거는 소품) — 바늘은 accent */
const wallClock = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <circle r="19" ${OP("#fff")}/><circle r="15" fill="none" stroke="${LIGHT}" stroke-width="1.2"/>
  <path d="M0-15v2M15 0h-2M0 15v-2M-15 0h2" ${LN(INK, 1.6)}/>
  <path d="M0-11v11l8 5" ${LN(c, 2.6)}/><circle r="1.8" fill="${INK}"/></g>`;
/* 벽걸이 달력: 머리띠 + 고리 2 + 7열 × 3행, 이레째 열은 accent (돌아오는 날) */
const calendar = (x, y, c, d, t) => `<g transform="translate(${x} ${y})">
  <rect x="-34" y="-32" width="68" height="64" rx="3" ${OP("#fff")}/>
  <path d="M-34-22h68" ${LN(INK, 1.4)}/>
  <rect x="-34" y="-32" width="68" height="10" rx="3" fill="${d}"/><rect x="-34" y="-27" width="68" height="5" fill="${d}"/>
  <path d="M-20-36v8M20-36v8" ${LN(INK, 1.8)}/>
  ${[0,1,2].map(r=>[0,1,2,3,4,5,6].map(i=>`<rect x="${-31 + i * 9}" y="${-17 + r * 15}" width="7.5" height="12" rx="1.5" fill="${i === 6 ? c : t}"/>`).join("")).join("")}</g>`;
/* 이젤 도판: 가지 치는 나무(다윈의 설명 — 작동 방식). 두 패널에 같은 도판을 둔다 */
const treeBoard = (x, y, c, d, t) => `<g transform="translate(${x} ${y})">
  <ellipse cx="0" cy="${FLOOR + 2 - y}" rx="42" ry="4" fill="${INK}" opacity=".08"/>
  <path d="M-30 ${FLOOR - y - 2}L-8 36M30 ${FLOOR - y - 2}L8 36M0 36V42" ${LN(d, SW.line)}/>
  <rect x="-48" y="-40" width="96" height="76" rx="3" ${OP("#fff")}/>
  <path d="M-38 28h76" ${LN(LIGHT, SW.hair)}/>
  <path d="M0 28V6M0 6L-20-10M0 6L20-10M-20-10L-34-26M-20-10L-12-30M20-10L34-26M20-10L12-30M-34-26L-40-34M34-26L40-34" ${LN(c, SW.line)}/>
  ${[[-40,-34],[-12,-30],[12,-30],[40,-34],[-34,-26],[34,-26]].map(([px,py])=>`<circle cx="${px}" cy="${py}" r="3.4" fill="${d}"/>`).join("")}</g>`;
/* 트로피 · 저울 (놓는 소품). col 을 MID 로 주고 dash 를 켜면 '내 손 밖의 것' */
const trophy = (x, y, s, c, d, col = "", dash = 0) => {
  const st = col || INK, dd = dash ? ` stroke-dasharray="4 3"` : "";
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke="${st}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"${dd}>
  <path d="M-13-18h26v10a13 13 0 0 1-26 0z" fill="${col ? "#fff" : c}"/>
  <path d="M-13-14q-9 0-7 8t9 6M13-14q9 0 7 8t-9 6" fill="none"/>
  <path d="M-4 5h8v6h-8z" fill="${col ? "#fff" : d}"/><rect x="-11" y="11" width="22" height="6" rx="1.5" fill="${col ? "#fff" : d}"/></g>`; };
const scale = (x, y, s, c, d) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M0-20v34M-12 14h24" ${LN(INK, 2)}/>
  <path d="M-22-14h44" ${LN(INK, 2)}/>
  <path d="M-22-14v12M22-14v12" ${LN(INK, 1.4)}/>
  <path d="M-32-2h20a10 6 0 0 1-20 0z" ${OP(c)}/><path d="M12-2h20a10 6 0 0 1-20 0z" ${OP(c)}/></g>`;
/* 비구름 (내 손 밖의 것 — 점선) */
const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" ${LN(MID, 1.8)} stroke-dasharray="4 3">
  <path d="M-22 8a10 10 0 0 1 8-15a13 13 0 0 1 25 1a9 9 0 0 1 3 14z"/>
  <path d="M-12 16l-3 8M0 16l-3 8M12 16l-3 8"/></g>`;
/* 시상대 (3단) */
const podium = (x, c, d, t) => `<g>
  ${shadow(x, 110)}
  <rect x="${x - 54}" y="${FLOOR - 30}" width="36" height="30" rx="2" ${OP(t)}/>
  <rect x="${x - 18}" y="${FLOOR - 50}" width="36" height="50" rx="2" ${OP(mix(t, d, .18))}/>
  <rect x="${x + 18}" y="${FLOOR - 20}" width="36" height="20" rx="2" ${OP(t)}/>
  <text x="${x}" y="${FLOOR - 28}" font-size="13" font-weight="700" fill="${d}" text-anchor="middle" ${FT}>1</text></g>`;
/* 허들 (주로 위) */
const hurdle = (x, c, d) => `<g>
  ${shadow(x, 40)}
  <path d="M${x - 16} ${FLOOR}V${FLOOR - 40}M${x + 16} ${FLOOR}V${FLOOR - 40}M${x - 22} ${FLOOR}h12M${x + 10} ${FLOOR}h12" ${LN(INK, SW.line)}/>
  <rect x="${x - 22}" y="${FLOOR - 46}" width="44" height="8" rx="2" ${OP(c)}/></g>`;
/* 깃발: col 이 있으면 '이미 채워진 자리' (점선) */
const flag = (x, y, c, col = "", h = 44) => {
  const st = col || INK, dd = col ? ` stroke-dasharray="4 3"` : "";
  return `<g${dd} stroke="${st}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
  <path d="M${x} ${y}V${y - h}"/>
  <path d="M${x} ${y - h}h26l-7 9 7 9h-26z" fill="${col ? "#fff" : c}"/></g>`; };
/* 아치문 + 안의 표지 */
const door = (x, y, inner) => `<path d="M${x - 24} ${y}V${y - 52}a24 24 0 0 1 48 0v52z" ${OP("#fff")}/>${inner}`;

const scenes = {
 /* 21 — 템플릿 B: 의례가 하는 세 가지 일 — 같은 시각에 같은 노래 → 이레째 칸 → 옛이야기를 다음 사람에게 */
 ritual:(c,t,d)=>{
  const s = .85, y = FLOOR;
  const p1 = Object.assign({ x:66, y, s, c, face:"oh", brow:"up", look:2, head:-4 }, CAST.singer1);
  const p2 = Object.assign({ x:150, y, s, c:d, face:"oh", brow:"soft", look:-2, head:4, flip:1 }, CAST.singer2);
  const p3 = Object.assign({ x:274, y, s, c, pose:"point", face:"smile", brow:"soft", look:3 }, CAST.marker);
  const p4 = Object.assign({ x:492, y, s, c:d, face:"glad", brow:"soft", head:3, look:3 }, CAST.elder);
  const p5 = Object.assign({ x:584, y, s, c, pose:"down", face:"oh", brow:"up", flip:1, look:-3, head:-5 }, CAST.child);
  const m4 = anchors(p4).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(P3[0], c, t, d, 1, "같은 시각에 함께 움직인다")}
  ${wallClock(176, 62, .95, c)}
  ${holding(p1, prop.paper, 1.0)}
  ${holding(p2, prop.paper, 1.0, { one:"L", R:"down" })}
  ${noteMark(106, 100, d, .9)}${noteMark(122, 82, d, .75)}
  ${room(P3[1], c, t, d, 2, "시간을 조각으로 자른다")}
  ${calendar(372, 118, c, d, t)}
  ${person(p3)}
  ${room(P3[2], c, t, d, 3, "기억을 다음으로 나른다")}
  ${holding(p4, prop.book, 1.0, { one:"L", R:"open" })}
  ${person(p5)}
  ${bubble({ x:446, y:44, w:104, h:32, lines:["옛날 옛적에…"], c:d, lvl:2, to:{ x:m4.x+10, y:m4.y-6 } })}</svg>`; },

 /* 22 — 템플릿 A: 같은 나무 도판 앞에서 — '어떻게 생겨났는가'(is) / '어떻게 살아야 하는가'(ought). 사이 화살은 점선(간극) */
 twoq:(c,t,d)=>{
  const p1 = Object.assign({ x:96, y:FLOOR, s:1, c, pose:"point", face:"smile", brow:"soft", look:3 }, CAST.scientist);
  const p2 = Object.assign({ x:426, y:FLOOR, s:1, c:d, pose:"think", face:"worry", brow:"up", head:5, look:3 }, CAST.thinker);
  const m1 = anchors(p1).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(PA, c, t, d, 1, "어떻게 생겨났는가 · is")}
  ${treeBoard(226, 150, c, d, t)}
  ${person(p1)}
  ${bubble({ x:126, y:44, w:126, h:52, lines:["이것은 어떻게","생겨났을까?"], c:d, to:{ x:m1.x+20, y:m1.y } })}
  ${room(PB, c, t, d, 2, "어떻게 살아야 하는가 · ought")}
  ${treeBoard(556, 150, c, d, t)}
  ${person(p2)}
  ${thought({ x:452, y:34, w:140, h:52, lines:["그럼 어떻게","살아야 하지?"], c:d, side:"l" })}
  ${note({ x:300, y:84, w:40, h:28, lines:["간극"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:LIGHT, dash:1 })}</svg>`; },

 /* 23 — 템플릿 C: 말하는 사람 → 한 길이 갈라진다: 트로피(이기는 길) / 저울(맞는 길) + 리더선 콜아웃 2 */
 sophist:(c,t,d)=>{
  const p = Object.assign({ x:86, y:232, s:1, c, face:"grin", brow:"up", look:3 }, CAST.speaker);
  const road = `M224 132H330`, up = `M330 132C400 132 440 74 556 74`, down = `M330 132C400 132 440 190 556 190`;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${holding(p, prop.paper, 1.05, { one:"L", R:"open" })}
  ${text(86, 258, "말하는 사람", 2, d)}
  ${arrow({ x1:162, y1:140, x2:194, y2:140, c:d, dash:1 })}
  ${panel({ x:204, y:40, w:396, h:184, c:d })}
  <path d="${road}${up}${down}" stroke="${d}" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${road}${up}${down}" stroke="${t}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${road}${up}" stroke="#fff" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  <path d="${down}" stroke="#fff" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  ${trophy(582, 74, 1.05, c, d)}
  ${scale(582, 190, 1.05, c, d)}
  <circle cx="330" cy="132" r="6" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
  ${tag({ x:330, y:172, text:"갈라지는 지점", c:d, fill:"#fff" })}
  ${callout({ x:582, y:52, tx:582, ty:26, text:"이기는 길", c:d })}
  ${callout({ x:582, y:212, tx:582, ty:246, text:"맞는 길", c:d })}</svg>`; },

 /* 24 — 템플릿 A: 내가 어쩔 수 있는 것(훈련: 주로·허들·시계) / 내가 어쩔 수 없는 것(결과: 시상대·트로피·비구름 = 점선) — 사이에 선 하나 */
 stoic:(c,t,d)=>{
  const runArms = { L:{ pts:[[-21,-104],[-36,-90],[-32,-72]], hand:"fist" }, R:{ pts:[[21,-104],[36,-92],[28,-108]], hand:"fist" } };
  const p1 = Object.assign({ x:100, y:FLOOR, s:1, c, legs:"walk", arms:runArms, face:"smile", brow:"down", look:3, head:3 }, CAST.runner);
  const p2 = Object.assign({ x:410, y:FLOOR, s:1, c, pose:"shrug", face:"meh", brow:"low", look:3, head:-4 }, CAST.runner);
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(PA, c, t, d, 1, "내가 어쩔 수 있는 것 — 훈련")}
  <path d="M40 216h230M40 228h230" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  ${wallClock(256, 74, .95, c)}
  ${hurdle(230, c, d)}
  ${person(p1)}
  ${thought({ x:140, y:44, w:96, h:36, lines:["한 바퀴 더"], c:d, side:"l", lvl:2 })}
  ${room(PB, c, t, d, 2, "내가 어쩔 수 없는 것 — 결과")}
  ${podium(540, c, d, t)}
  ${trophy(540, 166, 1.05, c, d, MID, 1)}
  ${cloud(560, 66, 1)}
  ${person(p2)}
  ${note({ x:300, y:84, w:40, h:28, lines:["경계"], c:d, tint:t })}
  <path d="M320 30V74M320 122V234" stroke="${d}" stroke-width="${SW.line}" stroke-dasharray="${DASH}" stroke-linecap="round"/></svg>`; },

 /* 25 — 템플릿 C: 계단을 오르면 깃발이 한 계단 물러난다(프레임 + 지평선) → 원 밖으로 나가는 두 문(점선 상자) */
 wanting:(c,t,d)=>{
  const p = Object.assign({ x:100, y:200, s:.85, c, pose:"up", face:"glad", brow:"up", look:3, capc:d }, CAST.climber);
  const steps = [[60,200],[160,168],[260,136],[360,104]];
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel({ x:40, y:40, w:380, h:184, c:d })}
  <clipPath id="u05st"><rect x="41" y="41" width="378" height="182" rx="9"/></clipPath>
  <g clip-path="url(#u05st)">
   <path d="M40 88H420" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
   ${steps.map(([sx,sy])=>`<rect x="${sx}" y="${sy}" width="100" height="${224 - sy}" fill="${t}" stroke="${d}" stroke-width="${SW.hair}"/>`).join("")}
   <path d="M40 224h380" stroke="${d}" stroke-width="${SW.hair}"/>
  </g>
  ${flag(146, 200, c, MID)}
  ${person(p)}
  ${flag(318, 136, c)}
  ${arrow({ x1:166, y1:150, x2:304, y2:86, c:d, dash:1, curve:34 })}
  ${callout({ x:146, y:158, tx:146, ty:246, text:"채워진 바람", c:d })}
  ${callout({ x:318, y:94, tx:318, ty:26, text:"다음 바람", c:d })}
  ${arrow({ x1:428, y1:132, x2:444, y2:132, c:LIGHT, dash:1 })}
  <rect x="452" y="40" width="164" height="148" rx="10" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  ${door(504, 152, noteMark(504, 128, c, 1.5))}
  ${door(564, 152, `<path d="M564 138c-9-6-15-12-15-19a7 7 0 0 1 15-2a7 7 0 0 1 15 2c0 7-6 13-15 19z" fill="${c}" opacity=".3" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>`)}
  ${text(504, 176, "예술", 3, MID)}${text(564, 176, "연민", 3, MID)}
  ${text(534, 210, "원 밖으로 나가는 두 문", 3, MID)}</svg>`; },
};

/* 장면 캡션 1줄: build.js 가 figcaption 앞머리에 '<b>Figure N</b> 캡션 — (units 의 fig 설명)' 으로 찍는다 */
const SCENECAP = {
 ritual: "함께 움직이고, 시간을 자르고, 기억을 나른다",
 twoq: "같은 나무 앞에서, 다른 질문",
 sophist: "같은 기술이 두 길로 간다",
 stoic: "훈련은 내 몫, 결과는 내 몫이 아니다",
 wanting: "한 계단 오르면 깃발은 한 계단 물러난다",
};

/* 비네트 캡션: KB 제목을 되풀이하지 않고 도해가 가리키는 사실 하나를 적는다 */
const VIGCAP = {
 "21": "이레 주기는 관습에서 왔다",
 "22": "'이다'에서 '해야 한다'로 — 흄 1739",
 "23": "상대의 말을 바꿔 세우고 치는 오류",
 "24": "제자 아리아노스가 받아 적은 첫 문장",
 "25": "행복은 제자리로 돌아온다 · 1971",
};

const STRIP = {
 "21":["ask","pair","hourglass","openbook","nope"],
 "22":["gear","eye","nope","swap","shield"],
 "23":["dome","quote","wrench","wand","warn"],
 "24":["balance","brain","globe","warn","scope"],
 "25":["wilt","loop","fire","palette","handshake"]
};

/* ── 비네트(240×150 → 45mm): 인물 없이 소품 도해 1개 — 글자는 lvl "v"(칩) · "vs"(라벨) 만, SVG 안 제목 없음 ── */
const VIG = {
 /* 이레 주기: 일곱 칸 띠, 일곱째 칸에서 첫 칸으로 되돌아오는 화살 — 10일·5일 달력은 오래가지 못했다 */
 "21":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${[0,1,2,3,4,5,6].map(i=>`<rect x="${24 + i * 28}" y="22" width="24" height="30" rx="3" fill="${i === 6 ? c : "#fff"}" stroke="${d}" stroke-width="${SW.hair}"/>`).join("")}
  ${arrow({ x1:204, y1:62, x2:36, y2:62, c:d, curve:-26 })}
  ${tag({ x:120, y:106, text:"7일 주기", c:d, lvl:"v" })}
  ${text(120, 142, "10일 · 5일 달력은 되돌아갔다", "vs", MID)}</svg>`,
 /* 흄의 단두대: '이다' 기슭 → 널빤지 하나가 빠진 다리 → '해야 한다' 기슭 */
 "22":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="12" y="72" width="66" height="40" rx="4" fill="${t}" stroke="${d}" stroke-width="${SW.hair}"/>
  <rect x="162" y="72" width="66" height="40" rx="4" fill="${t}" stroke="${d}" stroke-width="${SW.hair}"/>
  <path d="M78 76H162M78 86H162" stroke="${d}" stroke-width="${SW.hair}"/>
  ${[80,97,131,148].map(x=>`<rect x="${x}" y="70" width="13" height="8" rx="1.5" fill="#fff" stroke="${d}" stroke-width="${SW.hair}"/>`).join("")}
  <rect x="114" y="70" width="13" height="8" rx="1.5" fill="none" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="3 3"/>
  ${text(120, 56, "?", "v", d)}
  ${tag({ x:45, y:38, text:"is", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:195, y:38, text:"ought", c:d, lvl:"v" })}
  ${text(45, 138, "사실", "vs", MID)}
  ${text(195, 138, "당위", "vs", MID)}</svg>`,
 /* 허수아비 논증: 막대 위 허수아비 — 모자·자루 몸통·지푸라기 손발 */
 "23":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M120 116V44" ${LN(INK, 2.4)}/>
  <path d="M80 72h80" ${LN(INK, 2.4)}/>
  <path d="M78 66l-9-5M78 72h-11M78 78l-9 5M162 66l9-5M162 72h11M162 78l9 5" ${LN(c, 2)}/>
  <path d="M110 108l-6 12M120 110v12M130 108l6 12" ${LN(c, 2)}/>
  <rect x="100" y="64" width="40" height="36" rx="7" ${OP(t)}/>
  <path d="M104 82h32" ${LN(INK, 1.2)}/>
  <circle cx="120" cy="46" r="14" ${OP("#fff")}/>
  <path d="M102 36h36M109 36l3-12h16l3 12" ${OP(d)}/>
  <circle cx="115" cy="45" r="1.8" fill="${INK}"/><circle cx="125" cy="45" r="1.8" fill="${INK}"/>
  <path d="M116 52h8" ${LN(INK, 1.6)}/>
  ${tag({ x:120, y:134, text:"허수아비 논증", c:d, lvl:"v" })}
  ${text(196, 44, "straw man", "vs", MID)}</svg>`,
 /* 『엥케이리디온』: 펼친 책 — 왼쪽 면은 채워진 점(달려 있다), 오른쪽 면은 점선 점(그렇지 않다) */
 "24":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${prop.book(120, 84, 2.2, "#fff")}
  ${[62,78,94].map(y=>`<circle cx="94" cy="${y}" r="4.5" fill="${c}"/><path d="M104 ${y}h14" stroke="${c}" stroke-width="${SW.line}" stroke-linecap="round"/>`).join("")}
  ${[62,78,94].map(y=>`<circle cx="146" cy="${y}" r="4.5" fill="none" stroke="${d}" stroke-width="${SW.hair}" stroke-dasharray="2.5 2.5"/><path d="M156 ${y}h14" stroke="${LIGHT}" stroke-width="${SW.line}" stroke-linecap="round"/>`).join("")}
  ${tag({ x:120, y:24, text:"Enchiridion", c:d, lvl:"v" })}
  ${text(86, 136, "내 몫", "vs", MID)}
  ${text(156, 136, "내 몫 아님", "vs", MID)}</svg>`,
 /* 쾌락의 쳇바퀴: 행운의 봉우리도 불운의 골도 원래 수준으로 돌아온다 */
 "25":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M24 76H216" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  <path d="M24 76h24l12-46q6-14 12 0l6 20q8 26 30 26h14l12 26q6 10 12 0l6-10q8-16 30-16h34" stroke="${c}" stroke-width="${SW.bold}" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="66" cy="26" r="4.5" fill="${d}"/>
  <circle cx="140" cy="106" r="4.5" fill="${d}"/>
  ${text(66, 14, "행운", "vs", MID)}
  ${text(104, 112, "불운", "vs", MID)}
  ${text(196, 60, "원래 수준", "vs", MID)}
  ${tag({ x:120, y:135, text:"hedonic treadmill", c:d, lvl:"v" })}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG, VIGCAP, SCENECAP };
