/* Unit 9 삽화 — 교육·심리·언어 · 정돈된 도해 (디자인 시스템 A, Unit 1 규격)
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64
   구도 템플릿: A 2패널 비교(x 20/350 w 270 h 228) · B 3패널 순서(칩 1–3, s .85) · C 단일 도해(프레임 + 리더선 콜아웃) · D 인물 대화
   장면 캡션은 SVG 안에 두지 않고 SCENECAP → figcaption 앞머리 한 줄로 찍는다 (그림 안 글자는 패널 라벨·풍선·콜아웃뿐)
   색: accent(c) · deep(d) · tint(t) + 잉크/회색 2단 + 흰색. 이 유닛은 노랑을 쓰지 않는다.
   레슨별 구도
   41 wait      B 3패널 — 노려보며 참는다(옛 해석) → 약속대로 두 번째가 놓인다(신뢰) → 덮고 노래한다(방법)
   42 blood     A 2패널 — 같은 행동, 다른 이유: 두 손으로 건네는 팩(선물) / 한 손엔 팩 한 손엔 동전(거래)
   43 thou      D 인물 대화 — 가까운 사이엔 thou, 낯선 윗사람에겐 you. 두 사람 사이의 거리가 곧 낱말
   44 screen    A 2패널 — 옮겨진 절반(화면·되감기) / 옮겨지지 않은 절반(막힌 학생을 알아채는 일)
   45 nostalgia C 단일 — 나이별 막대와 14–24 창(콜아웃 2) 옆에서 '요즘 음악은 예전만 못해'라고 말하는 사람 */
const K = require("../kit.js");
const { person, holding, anchors, bubble, thought, note, panel, arrow, callout, tag, text, prop, ground, floorBand, mix, INK, MID, LIGHT, SW, DASH } = K;

/* ── 레슨 아이콘: 선화 stroke 3 round · 라이브 48×48(패딩 8) · 면 채움은 accent 30% 한 곳 ── */
const IC = c => `stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
 /* 41 — 지금 하나, 기다리면 둘 */
 wait:(c)=>`<svg viewBox="0 0 64 64">
  <circle cx="17" cy="33" r="9" fill="${c}" opacity=".3"/>
  <circle cx="17" cy="33" r="9" ${IC(c)}/>
  <path d="M28 33h7M32 30l3 3-3 3" ${IC(c)}/>
  <circle cx="47" cy="25" r="8" ${IC(c)}/>
  <circle cx="47" cy="41" r="8" ${IC(c)}/>
  <path d="M12 54h40" ${IC(c)}/></svg>`,
 /* 42 — 혈액 팩 안의 한 방울 */
 blood:(c)=>`<svg viewBox="0 0 64 64">
  <rect x="18" y="14" width="28" height="34" rx="6" fill="${c}" opacity=".3"/>
  <rect x="18" y="14" width="28" height="34" rx="6" ${IC(c)}/>
  <path d="M26 10v4M38 10v4" ${IC(c)}/>
  <path d="M32 24c5 6 8 9 8 12a8 8 0 0 1-16 0c0-3 3-6 8-12z" ${IC(c)}/>
  <path d="M14 56h36" ${IC(c)}/></svg>`,
 /* 43 — 두 개의 '너': 하나는 점선으로 사라지고 하나만 남는다 */
 thou:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M12 9h18a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H20l-6 5v-5h-2a4 4 0 0 1-4-4V13a4 4 0 0 1 4-4z" ${IC(c)} stroke-dasharray="5 4"/>
  <path d="M34 33h18a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-2v5l-6-5H34a4 4 0 0 1-4-4V37a4 4 0 0 1 4-4z" fill="${c}" opacity=".3"/>
  <path d="M34 33h18a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-2v5l-6-5H34a4 4 0 0 1-4-4V37a4 4 0 0 1 4-4z" ${IC(c)}/></svg>`,
 /* 44 — 받침 위의 화면, 재생 삼각 */
 screen:(c)=>`<svg viewBox="0 0 64 64">
  <rect x="8" y="12" width="48" height="30" rx="4" fill="${c}" opacity=".3"/>
  <rect x="8" y="12" width="48" height="30" rx="4" ${IC(c)}/>
  <path d="M27 20l12 7-12 7z" ${IC(c)}/>
  <path d="M32 42v8M20 54h24" ${IC(c)}/></svg>`,
 /* 45 — 나이 축 위의 봉우리와 그 아래 창 */
 nostalgia:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M20 50V26h13v24z" fill="${c}" opacity=".3"/>
  <path d="M11 46c8 0 5-26 15-26s11 26 19 26 6-5 11-5" ${IC(c)}/>
  <path d="M9 50h47M9 50V12" ${IC(c)}/></svg>`,
};

/* ── 유닛 캐스팅: 배너 안 인물이 서로 다르게 (한 배너 안에서는 top·hair 가 겹치지 않는다) ── */
const CAST = {
 kid:     { hair:"twin",  hairc:"#3A2E2A", skin:"light", top:"tee" },
 grown:   { hair:"bun",   hairc:"#7C7C82", skin:"light", top:"apron", glasses:1 },
 donor1:  { hair:"curly", hairc:"#3A2E2A", skin:"brown", top:"hoodie" },
 nurse:   { hair:"bob",   hairc:"#6B3A20", skin:"tan",   top:"apron" },
 donor2:  { hair:"short", hairc:"#2B2926", skin:"light", top:"sweater" },
 clerk:   { hair:"buzz",  hairc:"#2B2926", skin:"brown", top:"apron" },
 speaker: { hair:"wavy",  hairc:"#6B3A20", skin:"light", top:"tee", sleeve:"short" },
 friend:  { hair:"curly", hairc:"#2B2926", skin:"brown", top:"hoodie" },
 noble:   { hair:"cap",   hairc:"#2B2926", skin:"light", top:"shirt", glasses:1 },
 teacher: { hair:"long",  hairc:"#8A4B25", skin:"light", top:"shirt", glasses:1 },
 lost:    { hair:"short", hairc:"#B8742F", skin:"tan",   top:"hoodie" },
 quick:   { hair:"curly", hairc:"#2B2926", skin:"brown", top:"tee", sleeve:"short" },
 viewer:  { hair:"bob",   hairc:"#3A2E2A", skin:"light", top:"sweater" },
 listener:{ hair:"wavy",  hairc:"#7C7C82", skin:"light", top:"shirt", glasses:1 },
};
/* 패널: y 18 · h 228 (라벨 기준선 264). 장면 캡션은 SVG 안이 아니라 SCENECAP → figcaption 앞머리 */
const P3 = [{ x:20, y:18, w:186, h:228 }, { x:227, y:18, w:186, h:228 }, { x:434, y:18, w:186, h:228 }];
const PA = { x:20, y:18, w:270, h:228 }, PB = { x:350, y:18, w:270, h:228 };   // 패널 사이 60 (노트 40 + 여백 10·10)
const FLOOR = 236;                                   // 인물 발밑 바닥선 (패널 바닥 246 − 10)
const BAND = 204;                                    // 벽/바닥 경계
const DESK = 192;                                    // 탁자 상판 윗선 (벽/바닥 경계보다 12 위)
/* 방(패널 + 바닥 띠 + 바닥선) 한 벌 */
const room = (P, c, t, d, n, label) => `${panel(Object.assign({ c:d, t, n, label }, P))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, P))}
  ${ground({ x1:P.x+14, x2:P.x+P.w-14, y:FLOOR, c:d, w:SW.hair })}`;
/* 소품 공통: 흰 바탕 + 잉크 외곽 1.8 (kit.prop 과 같은 선) */
const OP = (fill, w = 1.8) => `fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const LN = (col, w) => `stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const shadow = (x, w) => `<ellipse cx="${x}" cy="${FLOOR + 2}" rx="${w / 2}" ry="4" fill="${INK}" opacity=".08"/>`;

/* 작은 탁자(중심 x, 폭 w): 두께 6 상판 + 다리 2 + 바닥 그림자 */
const table = (x, w, d, t) => `${shadow(x, w - 8)}
  <path d="M${x - w / 2 + 9} ${DESK + 6}V${FLOOR}M${x + w / 2 - 9} ${DESK + 6}V${FLOOR}" ${LN(d, SW.line)}/>
  <rect x="${x - w / 2}" y="${DESK}" width="${w}" height="6" rx="2" fill="${mix(t, d, .18)}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>`;
/* 접시 + 마시멜로 */
const plate = (x, y, w, d) => `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="${w / 9}" ${OP("#fff")}/>
  <ellipse cx="${x}" cy="${y - 1}" rx="${w / 2 - 5}" ry="${w / 13}" fill="none" stroke="${d}" stroke-width="1.3" opacity=".55"/>`;
const sweet = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-9-15v10q0 5 9 5t9-5v-10z" ${OP(mix(c, "#fff", .88))}/>
  <ellipse cx="0" cy="-15" rx="9" ry="3.6" ${OP("#fff")}/>
  <path d="M-5-16q5-2 10 0" ${LN(mix(c, "#fff", .5), 1.4)}/></g>`;
/* 덮개 — 사탕을 덮어 상황을 바꾼다 */
const cover = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-17 0a17 15 0 0 1 34 0z" ${OP(mix(c, "#fff", .55))}/>
  <path d="M-20 0h40" ${LN(INK, 1.8)}/>
  <path d="M0-15v-4" ${LN(INK, 1.8)}/><circle cx="0" cy="-22" r="3.2" ${OP("#fff")}/></g>`;
/* 음표 ♪ — 노래하는 입 옆에 */
const noteMark = (x, y, c, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="-4" cy="6" rx="5" ry="3.6" transform="rotate(-20 -4 6)" fill="${c}"/>
  <path d="M1 5v-16q0-3 3-3l6 2" ${LN(c, 2.2)}/></g>`;
/* 혈액 팩 (드는 소품) — holding() 이 hw·hh 로 손목을 잡는다 */
const bag = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-15" y="-19" width="30" height="37" rx="6" ${OP("#fff")}/>
  <path d="M-11-4q11-6 22 0v14q0 4-4 4h-14q-4 0-4-4z" fill="${c}"/>
  <path d="M0-16v9M-4.5-11.5h9" ${LN(c, 2.6)}/>
  <path d="M-6-19v-5M6-19v-5" ${LN(INK, 1.8)}/></g>`;
Object.assign(bag, { hw: 15, hh: 19 });
/* 벽걸이 화면: 재생 삼각 + 진행 바 + 손잡이 (멈추고 되감을 수 있다) */
const monitor = (x, y, w, h, c, d, t) => `<g>
  <rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="6" ${OP("#fff")}/>
  <rect x="${x - w / 2 + 7}" y="${y - h + 7}" width="${w - 14}" height="${h - 28}" rx="3" fill="${t}"/>
  <path d="M${x - 9} ${y - h / 2 - 15}l20 11-20 11z" ${OP(c)}/>
  <path d="M${x - w / 2 + 14} ${y - 13}h${w - 28}" ${LN(LIGHT, 3)}/>
  <path d="M${x - w / 2 + 14} ${y - 13}h${(w - 28) * .38}" ${LN(c, 3)}/>
  <circle cx="${x - w / 2 + 14 + (w - 28) * .38}" cy="${y - 13}" r="4.5" ${OP("#fff")}/></g>`;
/* 두 사람 사이의 거리 표시 — 점선 + 양끝 화살촉 (짧으면 가깝고 길면 멀다) */
const span = (x1, x2, y, d) => `<path d="M${x1 + 8} ${y}H${x2 - 8}" stroke="${d}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  <path d="M${x1} ${y}l8-4v8z" fill="${d}"/><path d="M${x2} ${y}l-8-4v8z" fill="${d}"/>`;

const scenes = {
 /* 41 — 템플릿 B: 참고 견딘다(옛 해석) → 약속대로 두 번째가 놓인다(신뢰) → 덮고 노래한다(방법) */
 wait:(c,t,d)=>{
  const s = .85, y = FLOOR;
  const p1 = Object.assign({ x:84, y, s, c, face:"worry", brow:"down", look:3, head:4 }, CAST.kid);
  const p2 = Object.assign({ x:258, y, s, c:d, pose:"open", face:"smile", brow:"soft", look:3 }, CAST.grown);
  const p3 = Object.assign({ x:388, y, s, c, flip:1, face:"glad", brow:"up", look:-3, head:-4 }, CAST.kid);
  const p4 = Object.assign({ x:496, y, s, c, flip:1, pose:"up", face:"oh", brow:"up", look:-3 }, CAST.kid);
  const m2 = anchors(p2).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(P3[0], c, t, d, 1, "옛 해석 — 참고 견딘다")}
  ${table(152, 62, d, t)}
  ${plate(152, 190, 44, d)}
  ${sweet(152, 188, 1.05, c)}
  ${person(p1)}
  ${thought({ x:92, y:44, w:100, h:34, lines:["참아야 해…"], c:d, side:"l", lvl:2 })}
  ${room(P3[1], c, t, d, 2, "조건 1 — 지켜지는 약속")}
  ${table(332, 62, d, t)}
  ${plate(332, 190, 46, d)}
  ${sweet(318, 188, 1.05, c)}${sweet(346, 184, .92, c)}
  ${person(p2)}${person(p3)}
  ${bubble({ x:244, y:40, w:124, h:34, lines:["약속대로 하나 더"], c:d, lvl:2, to:{ x:m2.x+20, y:m2.y } })}
  ${room(P3[2], c, t, d, 3, "조건 2 — 상황을 바꾼다")}
  ${table(566, 62, d, t)}
  ${plate(566, 190, 46, d)}
  ${cover(566, 190, 1, c)}
  ${person(p4)}
  ${noteMark(534, 112, d, .9)}${noteMark(550, 92, d, .75)}</svg>`; },

 /* 42 — 템플릿 A: 같은 행동(피를 건넨다), 다른 이유 — 두 손으로 건네는 선물 / 한 손엔 팩 한 손엔 동전인 거래 */
 blood:(c,t,d)=>{
  const p1 = Object.assign({ x:96, y:FLOOR, s:1, c, face:"glad", brow:"up", look:3 }, CAST.donor1);
  const p2 = Object.assign({ x:236, y:FLOOR, s:1, c:d, flip:1, pose:"open", face:"smile", head:4, look:-3 }, CAST.nurse);
  const p3 = Object.assign({ x:420, y:FLOOR, s:1, c, face:"meh", brow:"low", head:5, look:3 }, CAST.donor2);
  const p4 = Object.assign({ x:580, y:FLOOR, s:1, c:d, flip:1, pose:"open", face:"smile", head:-3, look:-3 }, CAST.clerk);
  const m1 = anchors(p1).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(PA, c, t, d, 1, "대가 없이 줄 때 — 선물")}
  ${person(p2)}
  ${holding(p1, bag, 1.05)}
  ${bubble({ x:116, y:30, w:112, h:46, lines:["누군가에게","필요하니까요"], c:d, to:{ x:m1.x+20, y:m1.y } })}
  ${room(PB, c, t, d, 2, "값을 매겼을 때 — 거래")}
  ${person(p4)}
  ${holding(p3, bag, 1.05, { one:"L", R:"open" })}
  ${prop.coin(500, 152, 1.15, c)}
  ${thought({ x:436, y:20, w:130, h:44, lines:["한 시간에 바늘…","그 값인가?"], c:d, side:"l" })}
  ${note({ x:300, y:84, w:40, h:28, lines:["값"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 43 — 템플릿 D: 같은 사람이 상대에 따라 낱말을 고른다. 두 사람 사이의 거리(점선 자)가 곧 그 낱말 */
 thou:(c,t,d)=>{
  const p1 = Object.assign({ x:96, y:FLOOR, s:1, c, pose:"open", face:"glad", brow:"up", look:3 }, CAST.speaker);
  const p2 = Object.assign({ x:210, y:FLOOR, s:1, c:d, flip:1, face:"smile", head:-5, look:-3 }, CAST.friend);
  const p3 = Object.assign({ x:400, y:FLOOR, s:1, c, face:"worry", brow:"up", head:3, look:3 }, CAST.speaker);
  const p4 = Object.assign({ x:570, y:FLOOR, s:1, c:d, flip:1, face:"meh", brow:"low", head:-3, capc:d }, CAST.noble);
  const m1 = anchors(p1).mouth, m3 = anchors(p3).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(PA, c, t, d, 1, "가까운 한 사람에게")}
  ${person(p1)}${person(p2)}
  ${span(126, 180, 230, d)}
  ${bubble({ x:100, y:34, w:84, h:38, lines:["thou"], c:d, to:{ x:m1.x+16, y:m1.y } })}
  ${room(PB, c, t, d, 2, "낯설고 지위 높은 사람에게")}
  ${person(p3)}${person(p4)}
  ${span(430, 540, 230, d)}
  ${bubble({ x:404, y:34, w:84, h:38, lines:["you"], c:d, to:{ x:m3.x+16, y:m3.y } })}
  ${note({ x:300, y:84, w:40, h:28, lines:["거리"], c:d, tint:t })}</svg>`; },

 /* 44 — 템플릿 A: 옮겨진 절반(멈추고 되감는 화면) / 옮겨지지 않은 절반(말하기 전에 알아채는 일) */
 screen:(c,t,d)=>{
  const p1 = Object.assign({ x:78, y:FLOOR, s:1, c, face:"smile", brow:"soft", look:3, head:3 }, CAST.viewer);
  const p2 = Object.assign({ x:404, y:FLOOR, s:1, c, pose:"point", face:"smile", brow:"soft", look:3 }, CAST.teacher);
  const p3 = Object.assign({ x:514, y:FLOOR, s:1, c:d, face:"worry", brow:"down", head:-4, look:-2 }, CAST.lost);
  const p4 = Object.assign({ x:584, y:FLOOR, s:1, c, flip:1, face:"smile", head:3, look:-3 }, CAST.quick);
  const m2 = anchors(p2).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(PA, c, t, d, 1, "옮겨진 절반 — 전달")}
  ${table(200, 124, d, t)}
  ${monitor(200, DESK, 116, 84, c, d, t)}
  ${arrow({ x1:252, y1:98, x2:152, y2:98, c:d, dash:1, curve:22 })}
  ${person(p1)}
  ${room(PB, c, t, d, 2, "옮겨지지 않은 절반 — 교실")}
  ${person(p2)}${person(p3)}${person(p4)}
  ${bubble({ x:386, y:30, w:116, h:46, lines:["저기, 지금","막혔구나"], c:d, to:{ x:m2.x+24, y:m2.y } })}
  ${note({ x:300, y:84, w:40, h:28, lines:["절반"], c:d, tint:t })}
  <path d="M320 30V74M320 122V234" stroke="${d}" stroke-width="${SW.line}" stroke-dasharray="${DASH}" stroke-linecap="round"/></svg>`; },

 /* 45 — 템플릿 C: 나이별 막대 + 14–24 창(리더선 콜아웃 2). 프레임 밖에서 '요즘 음악은 예전만 못해'라고 말한다 */
 nostalgia:(c,t,d)=>{
  const H = [8,20,50,78,108,124,116,96,62,44,32,26,22,18,14,11];
  const cx = i => 44 + 19.5 * i + 9.75;
  const p = Object.assign({ x:560, y:232, s:1, c, face:"meh", brow:"low", head:5, look:3 }, CAST.listener);
  const m = anchors(p).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel({ x:20, y:40, w:350, h:184, c:d })}
  <rect x="86" y="62" width="111" height="138" fill="${t}"/>
  ${H.map((h, i) => { const inB = i >= 2 && i <= 7;
    return `<rect x="${cx(i) - 6.5}" y="${200 - h}" width="13" height="${h}" rx="2" fill="${inB ? c : "#fff"}" stroke="${inB ? c : d}" stroke-width="${SW.hair}"/>`; }).join("")}
  ${ground({ x1:40, x2:362, y:200, c:d, w:SW.line })}
  <path d="M40 60V200" ${LN(d, SW.line)}/>
  ${text(46, 56, "좋아하는 노래", 3, MID, "start")}
  ${text(cx(2), 216, "14", 3, MID)}${text(cx(7), 216, "24", 3, MID)}
  ${text(356, 216, "나이", 3, MID, "end")}
  ${callout({ x:cx(5), y:200 - H[5], tx:cx(5), ty:28, text:"처음이 몰리는 나이", c:d })}
  ${callout({ x:cx(13), y:200 - H[13], tx:300, ty:246, text:"새 음악을 덜 듣는다", c:d })}
  ${holding(p, prop.phone, 1.05, { one:"L", R:"think" })}
  ${text(560, 258, "지금 듣는 사람", 2, d)}
  ${bubble({ x:396, y:82, w:128, h:46, lines:["요즘 음악은","예전만 못해"], c:d, to:{ x:m.x-20, y:m.y } })}</svg>`; },
};

/* 장면 캡션 1줄: build.js 가 figcaption 앞머리에 '<b>Figure N</b> 캡션 — (units 의 fig 설명)' 으로 찍는다 */
const SCENECAP = {
 wait: "참을성이 아니라 앞에 놓인 조건이 갈랐다",
 blood: "같은 손짓이 선물도 되고 거래도 된다",
 thou: "상대와의 거리가 낱말을 골랐다",
 screen: "쉬운 절반만 옮겨 갔다",
 nostalgia: "좋아하는 노래는 한 시기에 몰려 있다",
};

/* 비네트 캡션: KB 제목을 되풀이하지 않고 도해가 가리키는 사실 하나를 적는다 */
const VIGCAP = {
 "41": "약속을 지킨 방에서만 그랬다 · 2013",
 "42": "이스라엘 어린이집 실험 · 2000",
 "43": "tu/vous · du/Sie 에는 남아 있다",
 "44": "MOOC — 등록은 쉽고 완주는 어렵다",
 "45": "뜻 모르는 글자에도 나타났다 · 1968",
};

const STRIP = {
 "41":["hourglass","brain","handshake","swap","ask"],
 "42":["coin","wilt","tag","balance","gift"],
 "43":["pair","ruler","swap","dome","shield"],
 "44":["loop","swap","eye","ask","pair"],
 "45":["heartbeat","tag","sprout","loop","wilt"]
};

/* ── 비네트(240×150 → 45mm): 인물 없이 소품 도해 1개 — 글자는 lvl "v"(칩) · "vs"(라벨) 만, SVG 안 제목 없음 ── */
const VIG = {
 /* 41 — 대기 시간 막대 둘: 끝에 놓인 사탕까지 얼마나 견뎠나 (약속이 지켜진 방이 네 배) */
 "41":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${text(62, 36, "약속이 깨진 방", "vs", MID, "start")}
  <rect x="62" y="42" width="34" height="20" rx="4" fill="#fff" stroke="${d}" stroke-width="${SW.hair}"/>
  ${sweet(112, 62, 1.15, c)}
  ${text(62, 84, "약속이 지켜진 방", "vs", MID, "start")}
  <rect x="62" y="90" width="136" height="20" rx="4" fill="${c}"/>
  ${sweet(214, 110, 1.15, c)}
  ${tag({ x:120, y:134, text:"네 배 넘게 기다렸다", c:d, lvl:"v" })}</svg>`,
 /* 42 — 어린이집 지각: 벌금이 끼어들자 막대가 더 높아졌다 */
 "42":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${tag({ x:120, y:22, text:"지각이 늘었다", c:d, lvl:"v" })}
  <rect x="44" y="94" width="36" height="30" rx="3" fill="#fff" stroke="${d}" stroke-width="${SW.hair}"/>
  <rect x="160" y="66" width="36" height="58" rx="3" fill="${c}"/>
  ${prop.coin(120, 92, 1.15, c)}
  ${arrow({ x1:88, y1:116, x2:152, y2:116, c:d })}
  ${ground({ x1:24, x2:216, y:124, c:d, w:SW.hair })}
  ${text(62, 142, "벌금 전", "vs", MID)}
  ${text(178, 142, "벌금 뒤", "vs", MID)}</svg>`,
 /* 43 — 두 낱말이 하나로: 아래 점 두 개의 사이가 곧 그 낱말이 재던 거리 */
 "43":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${tag({ x:64, y:40, text:"thou", c:d, fill:"#fff", lvl:"v" })}
  ${arrow({ x1:104, y1:40, x2:140, y2:40, c:d })}
  ${tag({ x:180, y:40, text:"you", c:d, lvl:"v" })}
  <circle cx="50" cy="84" r="6" fill="${c}"/><circle cx="78" cy="84" r="6" fill="${c}"/>
  <path d="M58 84h12" ${LN(d, SW.line)}/>
  <circle cx="146" cy="84" r="6" fill="${c}"/><circle cx="214" cy="84" r="6" fill="${c}"/>
  <path d="M154 84h52" stroke="${d}" stroke-width="${SW.line}" stroke-dasharray="${DASH}"/>
  ${text(64, 122, "가까운 사이", "vs", MID)}
  ${text(180, 122, "격식 · 여럿", "vs", MID)}</svg>`,
 /* 44 — 등록 100명 중 채워진 점 여섯: 열려 있어도 완주는 다른 문제 */
 "44":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${text(120, 13, "등록 100명", "vs", MID)}
  ${[...Array(100)].map((_, i) => { const r = Math.floor(i / 10), q = i % 10, on = i < 6;
    return `<circle cx="${77 + q * 9.5}" cy="${25 + r * 9.5}" r="3.3" fill="${on ? c : "#fff"}" stroke="${on ? c : LIGHT}" stroke-width="${SW.hair}"/>`; }).join("")}
  ${tag({ x:120, y:131, text:"수료는 한 자릿수", c:d, lvl:"v" })}</svg>`,
 /* 45 — 같은 노래를 거듭 들을수록 호감이 오른다 (단순 노출) */
 "45":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${tag({ x:120, y:20, text:"익숙해질수록 좋아진다", c:d, lvl:"v" })}
  <path d="M46 84L100 72L154 58L208 44" stroke="${c}" stroke-width="${SW.bold}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  ${[[46,84],[100,72],[154,58],[208,44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${d}"/>`).join("")}
  ${[46,100,154,208].map(x => `<rect x="${x - 13}" y="95" width="26" height="26" rx="5" fill="#fff" stroke="${d}" stroke-width="${SW.hair}"/>
    ${noteMark(x + 1, 104, c, .6)}`).join("")}
  ${text(46, 142, "처음", "vs", MID)}
  ${text(208, 142, "여러 번", "vs", MID)}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG, VIGCAP, SCENECAP };
