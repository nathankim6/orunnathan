/* Unit 2 삽화 — 정돈된 도해 (방향 A · Unit 1 기준 구현을 따른다)
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64
   구도 템플릿: A 2패널 비교(x 20/350 w 270 h 228, 노트 y 84 · 화살 y 124) · B 3단계 순서 · C 단일 도해(프레임 40–224 + 리더선 콜아웃 ≤2) · D 인물 대화
   장면 캡션은 SVG 안에 두지 않고 SCENECAP → figcaption 앞머리 한 줄로 찍는다 (그림 안 글자는 패널 라벨·풍선뿐)
   색: accent(c) · deep(d) · tint(t) + 잉크/회색 2단 + 흰색. 노랑 없음(전구 없음). */
const K = require("../kit.js");
const { person, holding, anchors, bubble, thought, note, panel, arrow, callout, tag, text, prop, ground, floorBand, mix, INK, MID, LIGHT, SW, DASH } = K;

/* ── 레슨 아이콘: 선화 stroke 3 round · 라이브 48×48(패딩 8) · 면 채움은 accent 30% 한 곳 ── */
const IC = c => `stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
 /* 06 — 같은 '왜' 두 개: 풍선 둘, 물음표 둘 */
 twowhys:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M12 10h22a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H22l-7 6v-6h-3a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" fill="${c}" opacity=".3"/>
  <path d="M12 10h22a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H22l-7 6v-6h-3a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" ${IC(c)}/>
  <path d="M19 18c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4-4.5 3-4.5 6" ${IC(c)}/><path d="M23.5 28.5v.5" ${IC(c)}/>
  <path d="M30 34h22a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-3v6l-7-6H30a4 4 0 0 1-4-4v-6" ${IC(c)}/>
  <path d="M37 41c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4-4.5 3-4.5 6" ${IC(c)}/><path d="M41.5 51.5v.5" ${IC(c)}/></svg>`,
 /* 07 — 뇌와 밝은 점 */
 hunger:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M31 10c-7 0-11 4-11 8-5 1-8 5-8 9 0 4 3 7 6 8-1 6 3 10 8 10h5z" fill="${c}" opacity=".3"/>
  <path d="M31 10c-7 0-11 4-11 8-5 1-8 5-8 9 0 4 3 7 6 8-1 6 3 10 8 10h5z" ${IC(c)}/>
  <path d="M33 10c7 0 11 4 11 8 5 1 8 5 8 9 0 4-3 7-6 8 1 6-3 10-8 10h-5z" ${IC(c)}/>
  <circle cx="32" cy="29" r="4" ${IC(c)}/>
  <path d="M32 45v9M26 54h12" ${IC(c)}/></svg>`,
 /* 08 — 달·별·지평선 */
 spheres:(c)=>`<svg viewBox="0 0 64 64">
  <circle cx="23" cy="23" r="11" fill="${c}" opacity=".3"/>
  <circle cx="23" cy="23" r="11" ${IC(c)}/>
  <circle cx="19" cy="20" r="2" ${IC(c)}/><circle cx="26" cy="27" r="2.5" ${IC(c)}/>
  <path d="M47 10v10M42 15h10" ${IC(c)}/>
  <path d="M9 47q23-13 46 0" ${IC(c)}/>
  <path d="M9 47v7M55 47v7" ${IC(c)}/></svg>`,
 /* 09 — 지퍼 */
 zipper:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M25 9v22M39 9v22" ${IC(c)}/>
  <path d="M25 13h-5M25 20h-5M25 27h-5M39 13h5M39 20h5M39 27h5" ${IC(c)}/>
  <rect x="24" y="31" width="16" height="11" rx="3.5" fill="${c}" opacity=".3"/>
  <rect x="24" y="31" width="16" height="11" rx="3.5" ${IC(c)}/>
  <path d="M32 42v8" ${IC(c)}/>
  <circle cx="32" cy="53" r="3.5" ${IC(c)}/></svg>`,
 /* 10 — 저울 */
 doubt:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M32 12v38M20 50h24M12 18h40" ${IC(c)}/>
  <path d="M12 18l-4 14M52 18l4 14" ${IC(c)}/>
  <path d="M0 32a8 8 0 0 0 16 0z" ${IC(c)}/>
  <path d="M48 32a8 8 0 0 0 16 0z" fill="${c}" opacity=".3"/>
  <path d="M48 32a8 8 0 0 0 16 0z" ${IC(c)}/></svg>`,
};

/* ── 유닛 캐스팅: 배너 안 인물이 서로 다르게 ── */
const CAST = {
 biologist:   { hair:"bun",   hairc:"#2B2926", skin:"light", top:"shirt", glasses:1 },
 psychologist:{ hair:"curly", hairc:"#3A2E2A", skin:"brown", top:"sweater" },
 hungry:      { hair:"buzz",  hairc:"#2B2926", skin:"tan",   top:"hoodie" },
 lonely:      { hair:"long",  hairc:"#8A4B25", skin:"light", top:"tee" },
 stargazer:   { hair:"wavy",  hairc:"#6B3A20", skin:"light", top:"shirt" },
 confident:   { hair:"pony",  hairc:"#3A2E2A", skin:"light", top:"hoodie" },
 stuck:       { hair:"short", hairc:"#B8742F", skin:"tan",   top:"shirt" },
 witness:     { hair:"bob",   hairc:"#6B3A20", skin:"tan",   top:"tee", sleeve:"short" },
 skeptic:     { hair:"buzz",  hairc:"#7C7C82", skin:"light", top:"sweater", glasses:1 },
};
/* 패널: y 18 · h 228 (라벨 기준선 264). 장면 캡션은 SVG 안이 아니라 SCENECAP → figcaption 앞머리 */
const PA = { x:20, y:18, w:270, h:228 }, PB = { x:350, y:18, w:270, h:228 };   // 패널 사이 60 (노트 40 + 여백 10·10)
const FLOOR = 236;                                   // 인물 발밑 바닥선 (패널 바닥 246 − 10)
const BAND = 204;                                    // 벽/바닥 경계 (책상 상판 192 보다 12 아래)
const DESK = 192;                                    // 책상 상판 윗선
/* 작은 책상: 두께 6 상판(틴트보다 한 단 진한 면 + deep 선, rx 2) + 다리 2(SW.line) + 바닥 그림자 */
const desk = (x, w, d, t) => `<ellipse cx="${x + w / 2}" cy="${FLOOR + 2}" rx="${w / 2 - 6}" ry="4" fill="${INK}" opacity=".08"/>
  <path d="M${x + 10} ${DESK + 6}V${FLOOR}M${x + w - 10} ${DESK + 6}V${FLOOR}" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
  <rect x="${x}" y="${DESK}" width="${w}" height="6" rx="2" fill="${mix(t, d, .18)}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>`;
/* 패널 바닥 세트: 틴트 띠 + 바닥선 */
const floorSet = (P, d, t) => `${floorBand(Object.assign({ top:BAND, t, line:0 }, P))}
  ${ground({ x1:P.x+14, x2:P.x+P.w-14, y:FLOOR, c:d, w:SW.hair })}`;

/* ── 소품(로컬): 흰 바탕 + 잉크 1.8, 포인트색은 accent 하나 ── */
const OP = fill => `fill="${fill}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"`;
/* 달리는 고양이 (오른쪽을 향한다, 원점 = 발밑 중앙) */
const cat = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="1" rx="30" ry="4" fill="${INK}" opacity=".08"/>
  <path d="M-26-20 q-14 2-16-10 q-1-9 6-14" stroke="${INK}" stroke-width="7.6" fill="none" stroke-linecap="round"/>
  <path d="M-26-20 q-14 2-16-10 q-1-9 6-14" stroke="${c}" stroke-width="5.8" fill="none" stroke-linecap="round"/>
  <path d="M-20-10 l-8 9 M-8-8 l-2 8 M10-9 l6 8 M16-10 l12 5" stroke="${INK}" stroke-width="7.6" fill="none" stroke-linecap="round"/>
  <path d="M-20-10 l-8 9 M-8-8 l-2 8 M10-9 l6 8 M16-10 l12 5" stroke="${mix(c, "#1F2438", .24)}" stroke-width="5.8" fill="none" stroke-linecap="round"/>
  <ellipse cx="-4" cy="-17" rx="25" ry="11.5" ${OP(c)}/>
  <path d="M-4-7 q14 0 21-8 q-2 8-21 8z" fill="${mix(c, "#1F2438", .24)}"/>
  <path d="M13-38 l-3-11 9 4z M31-38 l3-11 -9 4z" ${OP(c)}/>
  <circle cx="22" cy="-30" r="11" ${OP(c)}/>
  <circle cx="26" cy="-32" r="1.7" fill="${INK}"/>
  <path d="M31-27 l2 1 -2 1z" fill="${INK}"/>
  <path d="M33-26 l6-2 M33-24 l6 1" stroke="${INK}" stroke-width="1" stroke-linecap="round"/></g>`;
/* 캔(뚜껑이 열린) + 소리 호 2 */
const can = (x, y, s, c, d) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="1" rx="14" ry="3" fill="${INK}" opacity=".08"/>
  <rect x="-10" y="-24" width="20" height="24" rx="2" ${OP("#fff")}/>
  <rect x="-10" y="-16" width="20" height="8" fill="${c}"/>
  <ellipse cx="0" cy="-24" rx="10" ry="3" ${OP("#fff")}/>
  <path d="M-6-27 l14-14 q4-3 6 0 t-1 5 l-13 12z" ${OP("#fff")}/>
  <path d="M14-30 q6 4 6 11 M20-36 q10 6 10 17" stroke="${d}" stroke-width="${SW.hair}" fill="none" stroke-linecap="round"/></g>`;
/* 뇌 영상 모니터(책상 위): 깊은 색 화면 + 틴트 뇌 + 흰 점 하나 — 두 패널이 같은 자리 */
const scan = (x, y, c, d, t) => `<g transform="translate(${x} ${y})">
  <path d="M-10 26h20M0 20v6" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
  <rect x="-31" y="-24" width="62" height="44" rx="4" ${OP("#fff")}/>
  <rect x="-27" y="-20" width="54" height="36" rx="2" fill="${d}"/>
  <path d="M-1-15c-7 0-10 4-10 7-4 1-6 4-6 7 0 3 2 5 4 6-1 5 2 8 6 8h6z" fill="${t}"/>
  <path d="M1-15c7 0 10 4 10 7 4 1 6 4 6 7 0 3-2 5-4 6 1 5-2 8-6 8h-6z" fill="${mix(t, d, .22)}"/>
  <circle cx="0" cy="-1" r="6.5" fill="${mix(c, "#fff", .55)}"/>
  <circle cx="0" cy="-1" r="3.5" fill="#fff"/></g>`;
/* 빈 그릇(드는 소품) — 반폭 18 · 아래 반높이 8 */
const bowl = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-18-6 h36 q-2 14-18 14 t-18-14z" ${OP("#fff")}/>
  <ellipse cx="0" cy="-6" rx="18" ry="4.5" ${OP("#fff")}/>
  <ellipse cx="0" cy="-6" rx="12" ry="2.6" fill="${c}" opacity=".25"/></g>`;
Object.assign(bowl, { hw:18, hh:8 });
/* 자전거: real = 살아 있는 프레임(accent) + 뒷바퀴로 가는 체인 · sketch = 흐린 선 + 앞바퀴로 잘못 간 점선 체인 */
const bike = (x, y, s, c, d, sketch = 0) => {
  const col = sketch ? MID : INK, w = sketch ? 1.5 : 1.8;
  const wheel = cx => `<circle cx="${cx}" cy="0" r="17" fill="${sketch ? "none" : "#fff"}" stroke="${col}" stroke-width="${w}"/>
    <circle cx="${cx}" cy="0" r="3" fill="${sketch ? "none" : c}" stroke="${col}" stroke-width="${w}"/>`;
  const frame = `<path d="M-30 0 L-8-28 L22-30 L30 0 M-30 0 L0 4 L22-30 M-8-28 L0 4 M-14-30 h12 M18-34 h12 M-8-28 v-4 M22-30 v-5" stroke="${sketch ? MID : c}" stroke-width="${sketch ? 1.8 : 3.2}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const chain = sketch
    ? `<circle cx="0" cy="4" r="6" fill="none" stroke="${MID}" stroke-width="1.5"/>
       <path d="M0-2 L30-4 M0 10 L30 4" stroke="${c}" stroke-width="2" fill="none" stroke-dasharray="3 3" stroke-linecap="round"/>`
    : `<circle cx="0" cy="4" r="6" fill="#fff" stroke="${col}" stroke-width="${w}"/>
       <path d="M-30-3 L0-2 M-30 3 L0 10" stroke="${d}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
       <path d="M0 4 l6 8" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${sketch ? "" : `<ellipse cx="0" cy="18" rx="46" ry="4" fill="${INK}" opacity=".08"/>`}
    ${wheel(-30)}${wheel(30)}${frame}${chain}</g>`;
};
/* 저울: 받침 + 기둥 + 수평 들보 + 접시 둘. 항목은 접시 위에 얹는다 (원점 = 받침 바닥 중앙) */
const balance = (x, y, w, d, t, left, right) => `<g transform="translate(${x} ${y})">
  <ellipse cx="0" cy="2" rx="${w / 2}" ry="4" fill="${INK}" opacity=".08"/>
  <rect x="-18" y="-7" width="36" height="7" rx="2" fill="${mix(t, d, .18)}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>
  <path d="M0-7 V-72" stroke="${d}" stroke-width="${SW.bold}" stroke-linecap="round"/>
  <path d="M${-w / 2} -72 H${w / 2}" stroke="${d}" stroke-width="${SW.bold}" stroke-linecap="round"/>
  <circle cx="0" cy="-72" r="4" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
  ${[-w / 2, w / 2].map(px => `<path d="M${px}-72 L${px - 14}-46 M${px}-72 L${px + 14}-46" stroke="${d}" stroke-width="${SW.hair}" stroke-linecap="round"/>
    <path d="M${px - 18}-46 q18 12 36 0z" fill="#fff" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>`).join("")}
  <g transform="translate(${-w / 2} -46)">${left}</g><g transform="translate(${w / 2} -46)">${right}</g></g>`;
/* 주장 블록(accent) — 크기가 곧 주장의 크기 */
const claim = (w, h, c) => `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="3" ${OP(c)}/>
  <path d="M0 ${-h + 5} v${h - 12}" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="0" cy="${-4}" r="1.3" fill="#fff"/>`;
/* 증거 종이 더미 n 장 */
const stack = (n, c) => Array.from({ length: n }, (_, i) => `<rect x="${-15 + (i % 2 ? 1.5 : -1.5)}" y="${-6 - i * 5}" width="30" height="5" rx="1.2" ${OP("#fff")}/>`).join("")
  + prop.paper(0, -6 - n * 5 - 11, .62, c);

const scenes = {
 /* 06 — 템플릿 A: 같은 장면(고양이 + 캔) 앞에 선 두 과학자 — 왼쪽은 원인의 사슬(기제), 오른쪽은 기대의 구름(의미) */
 twowhys:(c,t,d)=>{
  const p1 = Object.assign({ x:96, y:FLOOR, s:1, c, pose:"point", face:"smile", brow:"soft", look:3 }, CAST.biologist);
  const p2 = Object.assign({ x:426, y:FLOOR, s:1, c:d, pose:"think", face:"smile", brow:"up", head:5, look:3 }, CAST.psychologist);
  const m1 = anchors(p1).mouth, m2 = anchors(p2).mouth;
  const chain = (x, y) => `<g transform="translate(${x} ${y})">
    <path d="M0 0 H68" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
    ${[0, 34, 68].map(px => `<circle cx="${px}" cy="0" r="7.5" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/><circle cx="${px}" cy="0" r="3" fill="${c}"/>`).join("")}
    <path d="M16 0 l-6-4v8z M50 0 l-6-4v8z" fill="${d}"/></g>`;
  const cloud = (x, y) => `<g transform="translate(${x} ${y})">
    <ellipse cx="0" cy="0" rx="26" ry="16" fill="#fff" stroke="${d}" stroke-width="${SW.line}" stroke-dasharray="${DASH}"/>
    <circle cx="-6" cy="24" r="4" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/><circle cx="-12" cy="34" r="2.6" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
    <path d="M-11-3 h22 q-2 9-11 9 t-11-9z" ${OP("#fff")}/><ellipse cx="0" cy="-3" rx="11" ry="3" ${OP("#fff")}/>
    <ellipse cx="0" cy="-3" rx="7" ry="1.8" fill="${c}"/></g>`;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"생물학자 — 기제를 묻는다" }, PA))}
  ${floorSet(PA, d, t)}
  ${can(266, FLOOR, 1, c, d)}
  ${cat(200, FLOOR, 1.2, c)}
  ${chain(176, 160)}
  ${person(p1)}
  ${bubble({ x:146, y:60, w:130, h:52, lines:["어떤 신경이","소리를 나르지?"], c:d, to:{ x:m1.x+20, y:m1.y } })}
  ${panel(Object.assign({ c:d, t, n:2, label:"심리학자 — 의미를 묻는다" }, PB))}
  ${floorSet(PB, d, t)}
  ${can(596, FLOOR, 1, c, d)}
  ${cat(530, FLOOR, 1.2, c)}
  ${cloud(552, 146)}
  ${person(p2)}
  ${bubble({ x:478, y:60, w:130, h:52, lines:["저 녀석은 무엇을","기대하는 걸까?"], c:d, to:{ x:m2.x+20, y:m2.y } })}
  ${note({ x:300, y:84, w:40, h:40, lines:["같은","장면"], c:d, tint:t })}</svg>`; },

 /* 07 — 템플릿 A: 열 시간 굶은 사람 / 열 시간 혼자 지낸 사람 — 책상 위 뇌 영상은 같은 자리가 밝다 */
 hunger:(c,t,d)=>{
  const p1 = Object.assign({ x:96, y:FLOOR, s:1, c, face:"meh", brow:"low", look:-2 }, CAST.hungry);
  const p2 = Object.assign({ x:426, y:FLOOR, s:1, c:d, pose:"down", face:"worry", brow:"down", head:5, look:-4, flip:1 }, CAST.lonely);
  const m1 = anchors(p1).mouth, m2 = anchors(p2).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"열 시간을 굶은 뒤" }, PA))}
  ${floorSet(PA, d, t)}
  ${desk(172, 104, d, t)}
  ${scan(238, 164, c, d, t)}
  ${prop.clock(190, 150, .9, c)}
  ${holding(p1, bowl, 1.15)}
  ${bubble({ x:150, y:62, w:118, h:46, lines:["배가 고파…"], c:d, to:{ x:m1.x+20, y:m1.y } })}
  ${panel(Object.assign({ c:d, t, n:2, label:"열 시간을 혼자 지낸 뒤" }, PB))}
  ${floorSet(PB, d, t)}
  ${desk(502, 104, d, t)}
  ${scan(568, 164, c, d, t)}
  <g transform="translate(520 184) rotate(90)">${prop.phone(0, 0, .9, LIGHT)}</g>
  ${person(p2)}
  ${bubble({ x:478, y:62, w:124, h:46, lines:["누구든 좀…"], c:d, to:{ x:m2.x-20, y:m2.y } })}
  ${note({ x:300, y:84, w:40, h:40, lines:["같은","자리"], c:d, tint:t })}</svg>`; },

 /* 08 — 템플릿 C: 단일 도해 — 달의 궤도(점선 호)가 두 세계를 가른다. 위는 틴트 하늘·완전한 원 위의 별, 아래는 오르는 불·지는 돌.
    콜아웃 2: 1572년의 새 별(달 너머) · 망원경이 본 거친 달. 인물은 망원경 옆에서 하늘을 가리킨다 */
 spheres:(c,t,d)=>{
  const F = { x:20, y:40, w:600, h:184 };
  const p = Object.assign({ x:548, y:212, s:1, c, pose:"up", face:"oh", brow:"up", flip:1, look:-3 }, CAST.stargazer);
  const arc = r => `M${320 - r} 520 A${r} ${r} 0 0 1 ${320 + r} 520`;
  const star = (x, y, r) => `<path d="M${x} ${y - r} q${r * .35} ${r * .65} ${r} ${r} q-${r * .65} ${r * .35} -${r} ${r} q-${r * .35} -${r * .65} -${r} -${r} q${r * .65} -${r * .35} ${r} -${r}z" fill="${c}"/>`;
  return `<svg viewBox="0 0 640 280" fill="none">
  <clipPath id="sky08"><rect x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}" rx="10"/></clipPath>
  <g clip-path="url(#sky08)">
   <path d="M20 40 H620 V255.4 A400 400 0 0 0 20 255.4 z" fill="${t}"/>
   <path d="${arc(440)}" stroke="${LIGHT}" stroke-width="${SW.hair}"/>
   <path d="${arc(472)}" stroke="${LIGHT}" stroke-width="${SW.hair}"/>
   <path d="${arc(400)}" stroke="${d}" stroke-width="${SW.line}" stroke-dasharray="${DASH}"/>
  </g>
  ${panel(Object.assign({ c:d, fill:"none", floor:1 }, F))}
  ${star(120, 128, 7)}${star(230, 89, 6)}${star(552, 146, 6)}${star(380, 52, 5)}${star(470, 74, 5)}
  <circle cx="430" cy="94" r="15" fill="#fff"/>
  ${star(430, 94, 9)}
  <path d="M430 74v-6M430 114v6M410 94h-6M450 94h6M416 80l-4-4M444 108l4 4M444 80l4-4M416 108l-4 4" stroke="${c}" stroke-width="${SW.hair}" stroke-linecap="round"/>
  ${callout({ x:430, y:94, tx:474, ty:30, text:"1572년, 없던 별이 달 너머에", c:d, anchor:"start" })}
  <circle cx="320" cy="120" r="21" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
  <circle cx="312" cy="112" r="5" fill="${d}" opacity=".22"/><circle cx="327" cy="126" r="6.5" fill="${d}" opacity=".18"/><circle cx="311" cy="128" r="3" fill="${d}" opacity=".22"/>
  <path d="M306 108 l5-6 4 6 M318 133 l4-5 4 5" stroke="${d}" stroke-width="${SW.hair}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  ${callout({ x:328, y:104, tx:276, ty:30, text:"망원경이 본 거친 표면", c:d, anchor:"end" })}
  ${text(40, 64, "달 위 — 변하지 않는다", 2, d, "start")}
  ${text(196, 207, "달 아래 — 변한다", 2, d, "start")}
  <path d="M206 190 c-9-7-8-16-2-22 1 6 4 8 6 9 -1-6 2-10 5-13 4 6 8 10 8 17 0 6-4 9-8 9z" ${OP(c)}/>
  ${arrow({ x1:232, y1:188, x2:232, y2:156, c:d })}
  <path d="M272 172 q-8-6-2-12 q6-4 12 0 q6 6-2 12 q-4 3-8 0z" ${OP(LIGHT)}/>
  ${arrow({ x1:296, y1:154, x2:296, y2:186, c:d })}
  <g transform="translate(478 168) rotate(-158)">
   <rect x="-4" y="-7" width="64" height="14" rx="6" ${OP("#fff")}/>
   <rect x="56" y="-9" width="14" height="18" rx="4" ${OP(c)}/>
   <rect x="-10" y="-5" width="8" height="10" rx="2" ${OP("#fff")}/></g>
  <path d="M478 168 l-16 44 M478 168 l16 44 M478 168 v44" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
  ${person(p)}</svg>`; },

 /* 09 — 템플릿 A: 물어보면(자신만만, 진짜 자전거) / 설명해 보면(막힘, 종이 위 자전거는 체인이 앞바퀴로) */
 zipper:(c,t,d)=>{
  const p1 = Object.assign({ x:96, y:FLOOR, s:1, c, pose:"open", face:"glad", brow:"up" }, CAST.confident);
  const p2 = Object.assign({ x:426, y:FLOOR, s:1, c:d, pose:"think", face:"oh", brow:"up", head:5, look:3 }, CAST.stuck);
  const m1 = anchors(p1).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"물어보면 — 당연히 알지" }, PA))}
  ${floorSet(PA, d, t)}
  ${bike(224, 218, 1, c, d)}
  ${person(p1)}
  ${bubble({ x:150, y:64, w:122, h:46, lines:["당연히 알지!"], c:d, to:{ x:m1.x+20, y:m1.y } })}
  ${panel(Object.assign({ c:d, t, n:2, label:"설명해 보면 — 어…" }, PB))}
  ${floorSet(PB, d, t)}
  <g transform="translate(556 186) rotate(-5)">
   <rect x="-52" y="-42" width="104" height="80" rx="3" ${OP("#fff")}/>
   ${bike(0, 6, .82, c, d, 1)}
   <path d="M-40-30 h30" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-linecap="round"/></g>
  <path d="M506 226 h100" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" opacity=".15"/>
  ${person(p2)}
  ${thought({ x:474, y:62, w:132, h:52, lines:["체인이…","어디에 걸리더라?"], c:d, side:"l" })}
  ${note({ x:300, y:84, w:40, h:28, lines:["설명"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 10 — 템플릿 A: 평범한 주장(작은 블록 ↔ 종이 한 장) / 비범한 주장(큰 블록 ↔ 종이 더미) — 저울은 둘 다 수평이다 */
 doubt:(c,t,d)=>{
  const p1 = Object.assign({ x:96, y:FLOOR, s:1, c, face:"smile", brow:"soft" }, CAST.witness);
  const p2 = Object.assign({ x:426, y:FLOOR, s:1, c:d, pose:"point", face:"meh", brow:"one", head:-4, look:3 }, CAST.skeptic);
  const m1 = anchors(p1).mouth, m2 = anchors(p2).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"평범한 주장 — 시간표 한 장" }, PA))}
  ${floorSet(PA, d, t)}
  ${balance(222, FLOOR, 92, d, t, claim(18, 16, c), prop.paper(0, -14, .62, c))}
  ${holding(p1, prop.paper, 1.05)}
  ${bubble({ x:150, y:60, w:118, h:52, lines:["기차가","늦었어요"], c:d, to:{ x:m1.x+20, y:m1.y } })}
  ${panel(Object.assign({ c:d, t, n:2, label:"비범한 주장 — 훨씬 무거운 증거" }, PB))}
  ${floorSet(PB, d, t)}
  ${balance(552, FLOOR, 92, d, t, claim(34, 30, c), stack(6, c))}
  ${person(p2)}
  ${bubble({ x:478, y:60, w:132, h:52, lines:["빛보다 빨랐다고?","다시 재 보자"], c:d, to:{ x:m2.x+20, y:m2.y } })}
  ${note({ x:300, y:84, w:40, h:40, lines:["더 큰","주장"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },
};

/* 장면 캡션 1줄: build.js 가 figcaption 앞머리에 '<b>Figure N</b> 캡션 — (units 의 fig 설명)' 으로 찍는다 */
const SCENECAP = {
 twowhys: "원인의 사슬을 묻거나, 기대의 이야기를 묻거나",
 hunger: "굶은 뇌와 혼자 지낸 뇌, 같은 자리의 밝은 점",
 spheres: "완전하다던 하늘에 새 별이 뜨고, 매끈하다던 달에 산이 보였다",
 zipper: "자신 있게 답하고, 설명하다 멈춘다",
 doubt: "주장이 커진 만큼 증거의 더미도 높아진다",
};

/* 비네트 캡션: KB 제목을 되풀이하지 않고 도해가 가리키는 사실 하나를 적는다 */
const VIGCAP = {
 "06": "파블로프의 개 · 1900년대 초",
 "07": "베넷의 죽은 연어 실험 · 2009",
 "08": "갈릴레오의 목성 노트 · 1610",
 "09": "로젠블릿·케일의 실험 · 2002",
 "10": "OPERA 의 60나노초 · 2011",
};

const STRIP = {
 "06":["eye","gear","ask","warn","handshake"],
 "07":["alone","brain","heartbeat","warn","sprout"],
 "08":["moonface","eye","nova","scope","ruler"],
 "09":["zipper","tag","loop","shield","warn"],
 "10":["nope","ask","balance","loop","cable"]
};

/* ── 비네트(240×150 → 45mm): 인물 없이 소품 도해 1개 — 글자는 lvl "v"(칩) · "vs"(라벨) 만, SVG 안 제목 없음 ── */
const VIG = {
 /* 종소리(신호) → 개(침): 먹이 없이도 반응이 나온다 */
 "06":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <g transform="translate(60 86) scale(1.25)">
   <path d="M-20 10 q0-30 20-30 t20 30 q5 2 5 6 h-50 q0-4 5-6z" ${OP("#fff")}/>
   <path d="M-3-24 h6 v-6 h-6z" ${OP(c)}/>
   <circle cx="0" cy="18" r="4.5" ${OP(c)}/>
   <path d="M30-8 q6 8 0 16 M38-14 q10 14 0 28" stroke="${d}" stroke-width="${SW.hair}" fill="none" stroke-linecap="round"/></g>
  ${arrow({ x1:112, y1:86, x2:140, y2:86, c:d })}
  <g transform="translate(182 84) scale(1.15)">
   <circle cx="0" cy="0" r="22" ${OP(c)}/>
   <path d="M-20-8 q-10 4-8 22 q6-2 8-16z M20-8 q10 4 8 22 q-6-2-8-16z" ${OP(mix(c, "#1F2438", .24))}/>
   <circle cx="-8" cy="-4" r="2.2" fill="${INK}"/><circle cx="8" cy="-4" r="2.2" fill="${INK}"/>
   <ellipse cx="0" cy="6" rx="4" ry="3" fill="${INK}"/>
   <path d="M0 9 q0 5 5 6 M0 9 q0 5-5 6" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
   ${[[-6, 30], [4, 36], [12, 30]].map(([x, y]) => `<path d="M${x} ${y - 8} q4 5 0 9 q-4-4 0-9z" ${OP("#fff")}/>`).join("")}</g>
  ${tag({ x:60, y:24, text:"종소리", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:182, y:24, text:"침", c:d, lvl:"v" })}
  ${text(60, 144, "먹이 없이", "vs", MID)}</svg>`,
 /* 스캐너 속의 죽은 연어: 보정 없이 보면 '반응'이 보인다 */
 "07":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <g transform="translate(88 78)">
   <circle r="52" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
   <circle r="30" fill="${t}" stroke="${d}" stroke-width="${SW.hair}"/>
   <rect x="-58" y="56" width="116" height="6" rx="2" fill="${mix(t, d, .18)}" stroke="${d}" stroke-width="${SW.hair}"/>
   <path d="M-22 0 q10-13 26-11 q8 1 12 6 l8-7 v24 l-8-7 q-4 5-12 6 q-16 2-26-11z" ${OP(c)}/>
   <circle cx="-14" cy="-2" r="4" fill="#fff" stroke="${d}" stroke-width="1.5"/>
   <circle cx="-14" cy="-2" r="1.8" fill="${d}"/></g>
  ${tag({ x:184, y:52, text:"죽은 연어", c:d, fill:"#fff", lvl:"v" })}
  ${arrow({ x1:184, y1:66, x2:184, y2:88, c:d, dash:1 })}
  ${tag({ x:184, y:104, text:"반응 있음?", c:d, lvl:"v" })}
  ${text(184, 142, "보정 전", "vs", MID)}</svg>`,
 /* 갈릴레오의 노트: 목성 옆 네 점이 밤마다 자리를 바꾼다 */
 "08":(c,t,d)=>{
  const row = (y, moons) => `<path d="M74 ${y} H228" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
   <clipPath id="j${y}"><circle cx="150" cy="${y}" r="13"/></clipPath>
   <circle cx="150" cy="${y}" r="13" fill="${c}"/>
   <g clip-path="url(#j${y})"><path d="M150 ${y - 13}a13 13 0 0 1 0 26a8 13 0 0 0 0-26z" fill="${d}" opacity=".18"/>
   <path d="M136 ${y - 4}h28M136 ${y + 5}h28" stroke="#fff" stroke-width="${SW.hair}" opacity=".8"/></g>
   ${moons.map(x => `<circle cx="${x}" cy="${y}" r="3.6" fill="${d}"/>`).join("")}`;
  return `<svg viewBox="0 0 240 150" fill="none">
  ${text(6, 52, "1월 7일", "vs", MID, "start")}
  ${row(47, [104, 126, 180, 206])}
  ${text(6, 100, "1월 13일", "vs", MID, "start")}
  ${row(95, [114, 170, 192, 216])}
  ${tag({ x:150, y:134, text:"목성 곁의 네 점", c:d, lvl:"v" })}</svg>`; },
 /* 설명 전 → 설명 후: 스스로 매긴 이해도 점수가 떨어진다 */
 "09":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M40 120 H200" stroke="${LIGHT}" stroke-width="${SW.hair}"/>
  <rect x="66" y="40" width="34" height="80" rx="3" fill="${c}"/>
  <rect x="146" y="82" width="34" height="38" rx="3" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
  ${arrow({ x1:108, y1:44, x2:150, y2:72, c:d, curve:-16 })}
  ${text(83, 140, "설명 전", "vs", MID)}
  ${text(163, 140, "설명 후", "vs", MID)}
  ${tag({ x:120, y:20, text:"내가 매긴 이해도", c:d, fill:"#fff", lvl:"v" })}</svg>`,
 /* CERN → 그란사소 730 km · 헐거워진 케이블 하나 */
 "10":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${tag({ x:46, y:50, text:"CERN", c:d, fill:"#fff", lvl:"v" })}
  ${arrow({ x1:84, y1:50, x2:120, y2:50, c:d, dash:1 })}
  ${tag({ x:178, y:50, text:"Gran Sasso", c:d, lvl:"v" })}
  ${text(102, 32, "730 km", "vs", MID)}
  <g transform="translate(0 100)">
   <path d="M30 0 c14 0 14-12 28-12 s14 12 28 12 h14" stroke="${d}" stroke-width="${SW.line}" fill="none" stroke-linecap="round"/>
   <rect x="100" y="-8" width="16" height="16" rx="3" fill="${c}" stroke="${INK}" stroke-width="1.8"/>
   <path d="M116-4 h8 M116 4 h8" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
   <rect x="136" y="-9" width="14" height="18" rx="3" ${OP("#fff")}/>
   <path d="M139-4 h4 M139 4 h4" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>
   <path d="M150 0 h60" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
   <path d="M128-16 l-2 6 M133-16 l0 6" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/></g>
  ${text(128, 138, "헐거워진 케이블", "vs", MID)}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG, VIGCAP, SCENECAP };
