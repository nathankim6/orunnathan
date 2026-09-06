/* Unit 11 삽화 — 정돈된 도해 (디자인 시스템 A · Unit 1 기준)
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64
   구도: 51 B 3패널 순서 · 52 A 2패널 비교 · 53 C 단일 도해 · 54 A 2패널 비교 · 55 A 2패널 비교
   장면 캡션은 SVG 안에 두지 않고 SCENECAP → figcaption 앞머리 한 줄 (그림 안 글자는 패널 라벨·풍선·콜아웃뿐)
   색: accent(c) · deep(d) · tint(t) + 잉크/회색 2단 + 흰색. 노랑은 장면당 1곳(해) 이하. */
const K = require("../kit.js");
const { person, holding, anchors, bubble, note, panel, arrow, callout, tag, text, prop, ground, floorBand, mix, INK, MID, LIGHT, YEL, SW, DASH } = K;

/* ── 레슨 아이콘: 선화 stroke 3 round · 라이브 48×48(패딩 8) · 면 채움은 accent 30% 한 곳 ── */
const IC = c => `stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
 /* 울타리 + 물결: 울타리가 있는 밭, 울타리가 없는 바다 */
 commons:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M8 50c6-6 10-6 16 0s10 6 16 0 10-6 16 0v6H8z" fill="${c}" opacity=".3"/>
  <path d="M8 50c6-6 10-6 16 0s10 6 16 0 10-6 16 0" ${IC(c)}/>
  <path d="M16 14v26M32 14v26M48 14v26" ${IC(c)}/>
  <path d="M10 22h44M10 32h44" ${IC(c)}/></svg>`,
 /* 빗방울 → 웅덩이(유역의 마지막 쪽) */
 lake:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M10 38h44c-2 12-10 16-22 16S12 50 10 38z" fill="${c}" opacity=".3"/>
  <path d="M10 38h44c-2 12-10 16-22 16S12 50 10 38z" ${IC(c)}/>
  <path d="M32 9c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" ${IC(c)}/>
  <path d="M16 20l-4 7M52 20l-4 7M32 26v6" ${IC(c)}/></svg>`,
 /* 화성: 극관 + 얇은 대기 호 */
 mars:(c)=>`<svg viewBox="0 0 64 64">
  <circle cx="32" cy="34" r="17" ${IC(c)}/>
  <path d="M20 22a17 17 0 0 1 24 0q-12 6-24 0z" fill="${c}" opacity=".3"/>
  <path d="M20 22a17 17 0 0 1 24 0" ${IC(c)}/>
  <path d="M10 26a24 24 0 0 1 44 0" ${IC(c)} stroke-dasharray="4 5"/>
  <path d="M25 40h14" ${IC(c)}/></svg>`,
 /* 실험용 생쥐 */
 painres:(c)=>`<svg viewBox="0 0 64 64">
  <ellipse cx="30" cy="38" rx="17" ry="11" fill="${c}" opacity=".3"/>
  <ellipse cx="30" cy="38" rx="17" ry="11" ${IC(c)}/>
  <circle cx="16" cy="26" r="5" ${IC(c)}/>
  <path d="M47 38c8 0 10-6 8-12" ${IC(c)}/>
  <circle cx="14" cy="36" r="1.8" fill="${c}"/>
  <path d="M8 40l-4 1M8 37l-4-1" ${IC(c)}/></svg>`,
 /* 두 팔이 감싼 하트 */
 empathy:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M32 44c-9-7-14-11-14-17 0-4 3-7 7-7 3 0 5 2 7 4 2-2 4-4 7-4 4 0 7 3 7 7 0 6-5 10-14 17z" fill="${c}" opacity=".3"/>
  <path d="M32 44c-9-7-14-11-14-17 0-4 3-7 7-7 3 0 5 2 7 4 2-2 4-4 7-4 4 0 7 3 7 7 0 6-5 10-14 17z" ${IC(c)}/>
  <path d="M12 22c-4 8-3 20 6 28M52 22c4 8 3 20-6 28" ${IC(c)}/></svg>`,
};

/* ── 유닛 캐스팅: 배너 안 인물이 서로 다르게 ── */
const CAST = {
 farmer:   { hair:"cap",   hairc:"#3A2E2A", skin:"tan",   top:"apron" },
 captain:  { hair:"buzz",  hairc:"#2B2926", skin:"brown", top:"hoodie" },
 elder:    { hair:"bun",   hairc:"#7C7C82", skin:"light", top:"shirt", glasses:1 },
 neighbor: { hair:"curly", hairc:"#6B3A20", skin:"tan",   top:"tee", sleeve:"short" },
 worker:   { hair:"short", hairc:"#2B2926", skin:"tan",   top:"hoodie" },
 gardener: { hair:"pony",  hairc:"#8A4B25", skin:"light", top:"tee", sleeve:"short" },
 planner:  { hair:"bob",   hairc:"#3A2E2A", skin:"light", top:"shirt", glasses:1 },
 scientist:{ hair:"bun",   hairc:"#2B2926", skin:"light", top:"apron", glasses:1 },
 reviewer: { hair:"curly", hairc:"#3A2E2A", skin:"brown", top:"shirt" },
 runner1:  { hair:"buzz",  hairc:"#2B2926", skin:"tan",   top:"tee", sleeve:"short" },
 runner2:  { hair:"pony",  hairc:"#B8742F", skin:"light", top:"hoodie" },
 helper:   { hair:"wavy",  hairc:"#6B3A20", skin:"light", top:"sweater" },
 helped:   { hair:"short", hairc:"#2B2926", skin:"brown", top:"shirt" },
};
/* 패널: y 18 · h 228 (라벨 기준선 264). 장면 캡션은 SVG 안이 아니라 SCENECAP → figcaption 앞머리 */
const P3 = [{ x:20, y:18, w:186, h:228 }, { x:227, y:18, w:186, h:228 }, { x:434, y:18, w:186, h:228 }];
const PA = { x:20, y:18, w:270, h:228 }, PB = { x:350, y:18, w:270, h:228 };   // 패널 사이 60 (노트 40 + 여백 10·10)
const FLOOR = 236;                                   // 인물 발밑 바닥선 (패널 바닥 246 − 10)
const BAND = 204;                                    // 벽/바닥 경계 (책상 상판 192 보다 12 아래)
const DESK = 192;                                    // 책상 상판 윗선
const PW = 1.8;                                      // 소품 잉크선 (kit prop 와 같은 값)
const OP = (fill) => `fill="${fill}" stroke="${INK}" stroke-width="${PW}" stroke-linejoin="round" stroke-linecap="round"`;
const LN = (col, w = PW) => `stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
/* 작은 책상: 두께 6 상판(틴트보다 한 단 진한 면 + deep 선, rx 2) + 다리 2(SW.line) + 바닥 그림자 */
const desk = (x, w, d, t) => `<ellipse cx="${x + w / 2}" cy="${FLOOR + 2}" rx="${w / 2 - 6}" ry="4" fill="${INK}" opacity=".08"/>
  <path d="M${x + 10} ${DESK + 6}V${FLOOR}M${x + w - 10} ${DESK + 6}V${FLOOR}" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
  <rect x="${x}" y="${DESK}" width="${w}" height="6" rx="2" fill="${mix(t, d, .18)}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>`;

/* ── 이 유닛의 소품 (흰 바탕 + 잉크 1.8, 포인트색은 accent 하나) ── */
/* 울타리: 기둥 n개 + 가로대 2 (x = 왼쪽 기둥, y = 바닥) */
const fence = (x, y, n, gap, c) => `<g>
  ${Array.from({ length: n }, (_, i) => `<rect x="${x + i * gap - 3.5}" y="${y - 44}" width="7" height="44" rx="1.5" ${OP("#fff")}/>`).join("")}
  <rect x="${x - 8}" y="${y - 34}" width="${(n - 1) * gap + 16}" height="5.5" rx="1.5" ${OP(c)}/>
  <rect x="${x - 8}" y="${y - 18}" width="${(n - 1) * gap + 16}" height="5.5" rx="1.5" ${OP(c)}/></g>`;
/* 돛단배 (y = 흘수선) */
const boat = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M0 -3v-25" ${LN(INK)}/>
  <path d="M2 -27l15 13h-15z" ${OP("#fff")}/>
  <path d="M-2 -27l-11 13h11z" ${OP("#fff")}/>
  <path d="M-19 -2h38l-6 10h-26z" ${OP(c)}/></g>`;
/* 삽 (드는 소품 · 세로 자루 — 손목 아래로 날이 내려가 바닥에 닿는다) */
const shovel = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-9" y="-50" width="18" height="6" rx="3" ${OP(mix(INK, "#fff", .45))}/>
  <rect x="-2.5" y="-46" width="5" height="108" rx="1.5" ${OP(mix(INK, "#fff", .45))}/>
  <path d="M-11 60h22v12q0 8-11 10q-11-2-11-10z" ${OP(c)}/></g>`;
Object.assign(shovel, { hw: 6, hh: 10 });
/* 화분에 심은 모종 (드는 소품) */
const pot = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M0 -6v-22M0 -14q-9 0-13-10q10 0 13 10zM0 -20q9 0 12-11q-10 1-12 11z" ${LN(INK)}/>
  <path d="M0 -14q-9 0-13-10q10 0 13 10z" fill="${c}"/><path d="M0 -20q9 0 12-11q-10 1-12 11z" fill="${mix(c, "#fff", .35)}"/>
  <path d="M-13 -2h26l-3 18h-20z" ${OP(c)}/>
  <rect x="-15" y="-7" width="30" height="6" rx="2" ${OP(mix(c, "#fff", .35))}/></g>`;
Object.assign(pot, { hw: 15, hh: 16 });
/* 왜가리 (y = 발밑) */
const heron = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-3 0v-14M5 0v-14" ${LN(INK)}/>
  <path d="M-14 -20q-8-8 0-14q12-6 26 0l4 4q-10 8-24 6q-4-0-6 4z" ${OP("#fff")}/>
  <path d="M8 -30q8-8 4-20q-2-8 6-14" ${LN(INK)}/>
  <ellipse cx="18" cy="-64" rx="6" ry="4" ${OP("#fff")}/>
  <path d="M23 -64l14 1-14 3z" fill="${c}"/>
  <circle cx="19" cy="-65" r="1.2" fill="${INK}"/></g>`;
/* 빗방울 */
const drop = (x, y, c) => `<path d="M${x} ${y - 8}q6 8 0 12q-6-4 0-12z" fill="${c}" opacity=".85"/>`;
/* 실험용 생쥐 (왼쪽을 본다 · y = 발밑) */
const mouse = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M20 -8q18 2 14-16" ${LN(INK)}/>
  <ellipse cx="-8" cy="-1" rx="5" ry="2.6" ${OP("#fff")}/><ellipse cx="10" cy="-1" rx="5" ry="2.6" ${OP("#fff")}/>
  <ellipse cx="0" cy="-10" rx="21" ry="10" ${OP("#fff")}/>
  <circle cx="-15" cy="-21" r="5.5" ${OP(mix(c, "#fff", .55))}/>
  <ellipse cx="-22" cy="-9" rx="10" ry="7.5" ${OP("#fff")}/>
  <circle cx="-25" cy="-11" r="1.6" fill="${INK}"/>
  <circle cx="-32" cy="-8" r="1.7" fill="${INK}"/>
  <path d="M-30 -5l-7 3M-30 -7l-8-1" ${LN(INK, 1.2)}/></g>`;
/* 파형 모니터 (놓는 소품) */
const monitor = (x, y, c) => `<g transform="translate(${x} ${y})">
  <path d="M-9 20h18M0 14v6" ${LN(INK)}/>
  <rect x="-23" y="-17" width="46" height="31" rx="4" ${OP("#fff")}/>
  <path d="M-17 0h7l3-8 5 15 4-10 3 3h12" ${LN(c, 2.2)}/></g>`;

const scenes = {
 /* 51 — 템플릿 B: 울타리와 주인 → 주인 없는 바다 → 쓰는 사람의 규칙 */
 commons:(c,t,d)=>{
  const s = .85, y = FLOOR;
  const p1 = Object.assign({ x:72, y, s, c, face:"smile", head:-3, capc:d }, CAST.farmer);
  const p2 = Object.assign({ x:268, y, s, c, pose:"point", face:"worry", brow:"down", look:3 }, CAST.captain);
  const p3 = Object.assign({ x:478, y, s, c:d, face:"glad", brow:"up", head:4 }, CAST.elder);
  const p4 = Object.assign({ x:580, y, s, c, pose:"point", face:"smile", flip:1, look:-3, legc:"#8C7A5B" }, CAST.neighbor);
  const m2 = anchors(p2).mouth;
  const sea = (P) => `${floorBand(Object.assign({ top:BAND, t, line:0 }, P))}
    ${[214, 228].map(yy => `<path d="M${P.x + 12} ${yy}q10-5 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" stroke="${c}" stroke-width="${SW.hair}" fill="none" stroke-linecap="round" opacity=".55"/>`).join("")}`;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"울타리와 주인" }, P3[0]))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, P3[0]))}
  ${ground({ x1:P3[0].x+14, x2:P3[0].x+P3[0].w-14, y:FLOOR, c:d, w:SW.hair })}
  ${[122,140,158,176].map(x=>`<path d="M${x} 232v-9M${x-4} 227l4-4 4 4" ${LN(d, 1.5)}/>`).join("")}
  ${fence(120, FLOOR, 4, 26, c)}
  ${holding(p1, prop.paper, 1)}
  ${panel(Object.assign({ c:d, t, n:2, label:"주인 없는 바다" }, P3[1]))}
  ${sea(P3[1])}
  ${boat(352, 222, .8, c)}${boat(392, 222, .8, c)}${boat(330, 210, .5, c)}
  <rect x="236" y="${FLOOR}" width="68" height="6" rx="2" fill="${mix(t, d, .18)}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>
  ${person(p2)}
  ${bubble({ x:302, y:104, w:100, h:42, lines:["한 마리만 더"], c:d, lvl:2, to:{ x:m2.x+20, y:m2.y } })}
  ${panel(Object.assign({ c:d, t, n:3, label:"쓰는 사람의 규칙" }, P3[2]))}
  ${sea(P3[2])}
  ${boat(530, 224, .6, c)}
  ${holding(p3, prop.paper, 1)}
  ${person(p4)}</svg>`; },

 /* 52 — 템플릿 A: 물을 고쳤다(준설 — 유출수는 계속 도착) / 물이 오는 길을 고쳤다(빗물 정원이 유출수를 붙잡는다) */
 lake:(c,t,d)=>{
  const p1 = Object.assign({ x:118, y:FLOOR, s:1, c, face:"flat", brow:"down", head:6, look:-3 }, CAST.worker);
  const p2 = Object.assign({ x:420, y:FLOOR, s:1, c, face:"glad", brow:"up", look:3, legc:"#8C7A5B" }, CAST.gardener);
  const armR = { pts:[[21,-104],[30,-92],[-4,-110]], hand:"grip", front:1 };
  const green = mix(c, "#7A9A3A", .55);
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"물을 고쳤다 — 준설" }, PA))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PA))}
  ${ground({ x1:PA.x+14, x2:PA.x+PA.w-14, y:FLOOR, c:d, w:SW.hair })}
  <ellipse cx="150" cy="226" rx="70" ry="13" fill="${green}" opacity=".6" stroke="${d}" stroke-width="${SW.hair}"/>
  <path d="M100 224q10-5 20 0t20 0t20 0t20 0" stroke="${d}" stroke-width="${SW.hair}" fill="none" stroke-linecap="round" opacity=".5"/>
  ${drop(232, 92, c)}${drop(250, 108, c)}${drop(220, 116, c)}
  ${arrow({ x1:240, y1:130, x2:212, y2:208, c, dash:1 })}
  ${holding(p1, shovel, 1, { one:"L", R:armR })}
  ${panel(Object.assign({ c:d, t, n:2, label:"물이 오는 길을 고쳤다 — 빗물 정원" }, PB))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PB))}
  ${ground({ x1:PB.x+14, x2:PB.x+PB.w-14, y:FLOOR, c:d, w:SW.hair })}
  <ellipse cx="578" cy="226" rx="34" ry="10" fill="${mix(c, "#fff", .7)}" stroke="${d}" stroke-width="${SW.hair}"/>
  ${heron(574, 232, .7, c)}
  <rect x="464" y="206" width="66" height="12" rx="3" fill="${mix(t, d, .3)}" stroke="${d}" stroke-width="${SW.hair}"/>
  ${[476,497,518].map(x=>`<path d="M${x} 206v-16M${x} -0" ${LN(INK, 1.6)}/><path d="M${x} -0" /><path d="M${x} 196q-8 0-11-9q9 0 11 9zM${x} 190q8 0 10-9q-8 1-10 9z" ${OP(c)}/>`).join("")}
  ${drop(484, 92, c)}${drop(502, 108, c)}${drop(472, 116, c)}
  ${arrow({ x1:490, y1:130, x2:497, y2:198, c, dash:1 })}
  ${holding(p2, pot, 1)}
  ${note({ x:300, y:84, w:40, h:28, lines:["다시"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 53 — 템플릿 C: 계획을 세우는 사람 → 화성 도해(해 · 극관 · 얇은 대기) → 기압 눈금(지금 1% · 전부 방출 7% · 숨쉬기 100%) */
 mars:(c,t,d)=>{
  const p = Object.assign({ x:80, y:232, s:1, c, pose:"think", head:5, face:"flat", look:3 }, CAST.planner);
  const gx = 268, gy = 134, r = 56;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${person(p)}
  ${text(80, 258, "계획을 세우는 사람", 2, d)}
  ${arrow({ x1:132, y1:140, x2:146, y2:140, c:d, dash:1 })}
  ${panel({ x:150, y:40, w:236, h:184, c:d, label:"데워서 언 기체를 되돌린다" })}
  <circle cx="${gx}" cy="${gy}" r="${r + 18}" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  <clipPath id="mg11"><circle cx="${gx}" cy="${gy}" r="${r}"/></clipPath>
  <circle cx="${gx}" cy="${gy}" r="${r}" fill="${c}"/>
  <g clip-path="url(#mg11)"><path d="M${gx} ${gy - r}a${r} ${r} 0 0 1 0 ${r * 2}a36 ${r} 0 0 0 0-${r * 2}z" fill="${d}" opacity=".18"/>
  <ellipse cx="${gx}" cy="${gy - r + 2}" rx="30" ry="10" fill="#fff"/><ellipse cx="${gx}" cy="${gy + r - 2}" rx="26" ry="9" fill="#fff"/>
  ${[[-30,-14],[12,-24],[26,10],[-18,20],[4,30]].map(([x,y])=>`<circle cx="${gx + x}" cy="${gy + y}" r="4" fill="${d}" opacity=".25"/>`).join("")}</g>
  <circle cx="186" cy="70" r="11" fill="${YEL}" stroke="${d}" stroke-width="${SW.hair}"/>
  <path d="M186 52v6M186 82v6M168 70h6M198 70h6M173 57l4 4M199 57l-4 4M173 83l4-4M199 83l-4-4" ${LN(d, 1.5)}/>
  ${arrow({ x1:gx, y1:gy - r + 4, x2:gx, y2:gy - r - 16, c:d })}
  ${arrow({ x1:gx, y1:gy + r - 4, x2:gx, y2:gy + r + 16, c:d })}
  ${callout({ x:gx + 18, y:gy - r + 2, tx:330, ty:22, text:"언 CO₂ · 극관", c:d, anchor:"start" })}
  ${arrow({ x1:394, y1:132, x2:428, y2:132, c:d })}
  ${ground({ x1:440, x2:612, y:200, c:d, w:SW.line })}
  <rect x="446" y="196" width="34" height="4" rx="1.5" fill="${c}"/>
  <rect x="506" y="189" width="34" height="11" rx="1.5" fill="${c}"/>
  <rect x="566" y="50" width="34" height="150" rx="3" fill="none" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  ${text(463, 216, "지금 1%", 3, MID)}${text(523, 216, "전부 방출 7%", 3, MID)}${text(583, 216, "숨쉬기 100%", 3, MID)}
  ${callout({ x:523, y:189, tx:496, ty:106, text:"다 녹여도 여기까지", c:d })}</svg>`; },

 /* 54 — 템플릿 A: 같은 생쥐 — 닮은 신경이 답을 준다(쓸모) / 같은 신경이 아픔을 느낀다(책임). 사이 노트 = 같은 사실 */
 painres:(c,t,d)=>{
  const p1 = Object.assign({ x:86, y:FLOOR, s:1, c, face:"smile", look:3, head:-3 }, CAST.scientist);
  const p2 = Object.assign({ x:418, y:FLOOR, s:1, c:d, face:"worry", brow:"up", head:5, look:3 }, CAST.reviewer);
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"쓸모 — 닮은 신경이 답을 준다" }, PA))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PA))}
  ${ground({ x1:PA.x+14, x2:PA.x+PA.w-14, y:FLOOR, c:d, w:SW.hair })}
  ${desk(152, 120, d, t)}
  ${mouse(196, DESK, 1, c)}
  ${monitor(246, DESK - 20, c)}
  ${holding(p1, prop.screen_t, 1)}
  ${panel(Object.assign({ c:d, t, n:2, label:"책임 — 같은 신경이 아픔을 느낀다" }, PB))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PB))}
  ${ground({ x1:PB.x+14, x2:PB.x+PB.w-14, y:FLOOR, c:d, w:SW.hair })}
  ${desk(482, 120, d, t)}
  ${mouse(548, DESK, 1, c)}
  <path d="M516 158l-6-8M523 152l-2-10M509 165l-9-3" ${LN(c, 2.6)}/>
  ${holding(p2, prop.paper, 1.05, { one:"L", R:"think" })}
  ${note({ x:300, y:78, w:40, h:40, lines:["닮은","신경"], c:d, tint:t })}
  ${arrow({ x1:302, y1:130, x2:338, y2:130, c:d })}</svg>`; },

 /* 55 — 템플릿 A: 기억되는 절반(경쟁 — 결승선) / 잊힌 절반(서로 돕는다 — 컵을 건넨다). 사이에 한 권의 책 */
 empathy:(c,t,d)=>{
  const pump = { L:{ pts:[[-21,-104],[-31,-86],[-15,-72]], hand:"fist" }, R:{ pts:[[21,-104],[35,-90],[45,-108]], hand:"fist" } };
  const p1 = Object.assign({ x:96, y:FLOOR, s:1, c, arms:pump, legs:"walk", face:"worry", brow:"down", head:4 }, CAST.runner2);
  const p2 = Object.assign({ x:200, y:FLOOR, s:1, c:d, pose:"cheer", legs:"walk", face:"laugh", brow:"up", head:-4 }, CAST.runner1);
  const p3 = Object.assign({ x:436, y:FLOOR, s:1, c, pose:"open", face:"smile", head:3, look:3 }, CAST.helper);
  const reach = { L:"down", R:{ pts:[[21,-104],[38,-96],[56,-90]], hand:"open", ang:-8 } };
  const p4 = Object.assign({ x:574, y:FLOOR, s:1, c:d, arms:reach, legs:"step", flip:1, face:"oh", brow:"up", head:-4, look:-3, legc:"#8C7A5B" }, CAST.helped);
  const w3 = anchors(p3).wristR;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"기억되는 절반 — 경쟁" }, PA))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PA))}
  ${ground({ x1:PA.x+14, x2:PA.x+PA.w-14, y:FLOOR, c:d, w:SW.hair })}
  <path d="M266 ${FLOOR}V104" ${LN(INK, 2.2)}/>
  <path d="M266 106l-30 12 30 12z" ${OP(c)}/>
  ${person(p1)}${person(p2)}
  ${panel(Object.assign({ c:d, t, n:2, label:"잊힌 절반 — 서로 돕는다" }, PB))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PB))}
  ${ground({ x1:PB.x+14, x2:PB.x+PB.w-14, y:FLOOR, c:d, w:SW.hair })}
  ${person(p4)}${person(p3)}
  ${prop.cup(w3.x + 10, w3.y - 12, .9, c)}
  ${note({ x:300, y:84, w:40, h:28, lines:["다윈"], c:d, tint:t })}
  <g transform="translate(320 148) scale(.8)">
    <path d="M-23-14 q11-4 22 0 v24 q-11-4-22 0z" ${OP("#fff")}/><path d="M23-14 q-11-4-22 0 v24 q11-4 22 0z" ${OP("#fff")}/>
    <path d="M-1-14 v24" ${LN(INK)}/>
    <path d="M-17-7h11M-17-2h9M-17 3h10" ${LN(c, 2.2)}/><path d="M6-7h11M6-2h9M6 3h10" ${LN(LIGHT, 2.2)}/></g></svg>`; },
};

/* 장면 캡션 1줄: build.js 가 figcaption 앞머리에 '<b>Figure N</b> 캡션 — (units 의 fig 설명)' 으로 찍는다 */
const SCENECAP = {
 commons: "울타리가 없으면 규칙이 그 자리를 채운다",
 lake: "물이 아니라 물이 오는 길을 고쳤다",
 mars: "두꺼워져도 숨 쉴 공기는 아니다",
 painres: "쓸모와 고통은 같은 닮음에서 나온다",
 empathy: "한 권의 책, 읽힌 절반과 읽히지 않은 절반",
};

/* 비네트 캡션: KB 제목을 되풀이하지 않고 도해가 가리키는 사실 하나를 적는다 */
const VIGCAP = {
 "51": "쓰는 사람이 쓰고 이웃이 본다 · 오스트롬 1990",
 "52": "퇴적물이 다시 내놓는 인(P) — 내부 부하",
 "53": "녹을수록 더 데워진다 — 양의 되먹임",
 "54": "러셀과 버치의 세 원칙 · 1959",
 "55": "'적자생존'은 빌려 온 말이다 · 1869",
};

const STRIP = {
 "51":["globe","warn","tag","map","handshake"],
 "52":["wilt","ask","eye","wrench","sprout"],
 "53":["globe","fire","loop","scope","warn"],
 "54":["ask","brain","heartbeat","shield","balance"],
 "55":["openbook","pair","gift","seed","loop"]
};

/* ── 비네트(240×150 → 45mm): 인물 없이 소품 도해 1개 — 글자는 lvl "v"(칩) · "vs"(라벨) 만, SVG 안 제목 없음 ── */
const VIG = {
 /* 울타리(주인이 본다) → 이웃의 규칙(모두가 본다): 같은 자리를 지키는 두 장치 */
 "51":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="18" y="106" width="88" height="8" rx="3" fill="${t}"/>
  ${fence(36, 108, 3, 26, c)}
  ${arrow({ x1:108, y1:82, x2:134, y2:82, c:d })}
  <rect x="146" y="50" width="64" height="62" rx="5" ${OP("#fff")}/>
  ${[0,1,2].map(i=>`<rect x="154" y="${60 + i * 17}" width="11" height="11" rx="2" stroke="${d}" stroke-width="${SW.hair}" fill="#fff"/>
    <path d="M156.5 ${66 + i * 17}l3 3 5-6" ${LN(c, 2)}/>
    <path d="M172 ${65.5 + i * 17}h${[30,22,26][i]}" stroke="${LIGHT}" stroke-width="${SW.line}" stroke-linecap="round"/>`).join("")}
  ${tag({ x:62, y:26, text:"울타리", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:178, y:26, text:"이웃의 규칙", c:d, lvl:"v" })}
  ${text(62, 140, "주인이 지킨다", "vs", MID)}
  ${text(178, 140, "모두가 본다", "vs", MID)}</svg>`,
 /* 호수 단면: 유입이 줄어도 바닥 퇴적물이 인을 다시 내놓는다 */
 "52":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M28 52H212V84A92 44 0 0 1 28 84Z" fill="${mix(c, "#fff", .6)}" stroke="${d}" stroke-width="${SW.hair}"/>
  <path d="M42 94A78 30 0 0 0 198 94" stroke="${d}" stroke-width="9" stroke-linecap="round"/>
  ${arrow({ x1:6, y1:36, x2:34, y2:54, c:LIGHT, dash:1 })}
  ${[86,120,154].map(x=>arrow({ x1:x, y1:104, x2:x, y2:72, c:d })).join("")}
  ${tag({ x:66, y:22, text:"유입 ↓", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:172, y:22, text:"내부 부하", c:d, lvl:"v" })}
  ${text(120, 142, "퇴적물", "vs", MID)}</svg>`,
 /* 양의 되먹임: 기온 ↑ → 얼음 ↓ → 열 흡수 ↑ → 기온 ↑ */
 "53":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${arrow({ x1:138, y1:44, x2:172, y2:96, c:d, curve:-22 })}
  ${arrow({ x1:158, y1:114, x2:82, y2:114, c:d, curve:-22 })}
  ${arrow({ x1:68, y1:96, x2:102, y2:44, c:d, curve:-22 })}
  <circle cx="120" cy="34" r="12" fill="${YEL}" stroke="${d}" stroke-width="${SW.hair}"/>
  <path d="M120 14v6M120 48v6M100 34h6M134 34h6M106 20l4 4M134 20l-4 4" ${LN(d, 1.5)}/>
  <rect x="42" y="102" width="26" height="22" rx="5" ${OP("#fff")}/><path d="M50 108l5 5M58 106l3 3" ${LN(c, 1.6)}/>
  <path d="M78 122q4 6 0 10q-4-4 0-10z" fill="${c}"/>
  <rect x="166" y="106" width="34" height="18" rx="3" fill="${d}"/>
  <path d="M174 100q3-4 0-8M183 100q3-4 0-8M192 100q3-4 0-8" ${LN(c, 1.6)}/>
  ${tag({ x:120, y:86, text:"양의 되먹임", c:d, lvl:"v" })}
  ${text(56, 144, "얼음 ↓", "vs", MID)}
  ${text(184, 144, "열 흡수 ↑", "vs", MID)}</svg>`,
 /* 윤리 심의 신청서의 3R */
 "54":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="62" y="16" width="116" height="106" rx="6" ${OP("#fff")}/>
  ${[0,1,2].map(i=>`<circle cx="86" cy="${44 + i * 28}" r="11" fill="${d}"/>
    <text x="86" y="${49.5 + i * 28}" font-size="15" font-weight="700" fill="#fff" text-anchor="middle" font-family="'Noto Sans CJK KR','Noto Sans KR',sans-serif">R</text>
    <path d="M104 ${44 + i * 28}h${[54,40,48][i]}" stroke="${LIGHT}" stroke-width="${SW.bold}" stroke-linecap="round"/>`).join("")}
  ${tag({ x:170, y:18, text:"3R", c:d, lvl:"v" })}
  ${text(120, 142, "대체 · 감소 · 개선", "vs", MID)}</svg>`,
 /* 스펜서의 말 → 『종의 기원』 5판 */
 "55":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="20" y="48" width="84" height="56" rx="6" ${OP("#fff")}/>
  <path d="M34 66q-4 0-4 4t4 4q3 0 3-3q0-6-3-7M46 66q-4 0-4 4t4 4q3 0 3-3q0-6-3-7" fill="${c}" stroke="${c}" stroke-width="1.2"/>
  <path d="M58 70h32M34 86h56" stroke="${LIGHT}" stroke-width="${SW.bold}" stroke-linecap="round"/>
  ${arrow({ x1:112, y1:76, x2:140, y2:76, c:d })}
  <rect x="152" y="40" width="52" height="72" rx="3" ${OP(c)}/>
  <path d="M160 40v72" stroke="#fff" stroke-width="1.8" opacity=".55"/>
  <rect x="166" y="60" width="32" height="14" rx="2" fill="#fff"/>
  ${tag({ x:62, y:24, text:"스펜서의 말", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:178, y:24, text:"5판 · 1869", c:d, lvl:"v" })}
  ${text(62, 140, "적자생존", "vs", MID)}
  ${text(178, 140, "종의 기원", "vs", MID)}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG, VIGCAP, SCENECAP };
