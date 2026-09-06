/* Unit 7 삽화 — 스포츠·엔터테인먼트 · 정돈된 도해 (디자인 시스템 A, Unit 1 규격)
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64
   구도 템플릿: A 2패널 비교(x 20/350 w 270 h 228) · B 3패널 순서 · C 단일 도해(프레임 + 리더선 콜아웃) · D 인물 대화
   장면 캡션은 SVG 안에 두지 않고 SCENECAP → figcaption 앞머리 한 줄로 찍는다 (그림 안 글자는 패널 라벨·풍선·콜아웃뿐)
   색: accent(c) · deep(d) · tint(t) + 잉크/회색 2단 + 흰색. 이 유닛은 노랑을 쓰지 않는다.
   레슨별 구도
   31 coach     A 2패널 — 말이 바깥에서 온다(코치가 말한다·선수는 밋밋) / 물음이 안에서 생긴다(코치는 기다린다·선수가 생각한다)
   32 esports   A 2패널 — 한 방만큼의 원(구경꾼 둘이 바닥 점선 원 위에) / 방이 필요 없는 원(같은 원이 화면 다섯 개의 큰 호로)
   33 synth     C 단일 — 촬영 현장(카메라 든 사람) → 완성된 화면: 실선 배우 둘 + 점선 군중, 리더선 콜아웃 2
   34 longtail  C 단일 — 듣는 사람 → 좁은 문(문지기) → 긴 꼬리 그래프, 리더선 콜아웃 2(가파른 머리 / 길고 얇은 꼬리)
   35 boxoffice A 2패널 — 손익선 아래의 여러 편 / 선을 크게 넘는 몇 편, 화살은 오른쪽에서 왼쪽으로(메운다) */
const K = require("../kit.js");
const { person, holding, anchors, bubble, thought, note, panel, arrow, callout, tag, text, prop, ground, floorBand, bar, mix, INK, MID, LIGHT, SW, DASH } = K;

/* ── 레슨 아이콘: 선화 stroke 3 round · 라이브 48×48(패딩 8) · 면 채움은 accent 30% 한 곳 · 다섯 개 모두 '물건 하나 + 바닥선 y 54' 계열 ── */
const IC = c => `stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const BASE = c => `<path d="M12 54h40" ${IC(c)}/>`;
const icons = {
 /* 스톱워치 — 무엇을 말할지가 아니라 언제 말할지 */
 coach:(c)=>`<svg viewBox="0 0 64 64">
  <circle cx="32" cy="34" r="16" fill="${c}" opacity=".3"/>
  <circle cx="32" cy="34" r="16" ${IC(c)}/>
  <path d="M32 34V23" ${IC(c)}/>
  <path d="M26 10h12M32 10v8M45 15l4 4" ${IC(c)}/>
  ${BASE(c)}</svg>`,
 /* 게임 패드 — 보는 사람이 만든 종목 */
 esports:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M20 18h24c7 0 11 7 12 15s-3 11-8 11c-4 0-6-3-9-6H25c-3 3-5 6-9 6-5 0-9-3-8-11s5-15 12-15z" fill="${c}" opacity=".3"/>
  <path d="M20 18h24c7 0 11 7 12 15s-3 11-8 11c-4 0-6-3-9-6H25c-3 3-5 6-9 6-5 0-9-3-8-11s5-15 12-15z" ${IC(c)}/>
  <path d="M17 30h9M21.5 25.5v9" ${IC(c)}/>
  <circle cx="42" cy="27" r="2.6" fill="${c}"/><circle cx="48" cy="33" r="2.6" fill="${c}"/>
  ${BASE(c)}</svg>`,
 /* 한 프레임 안의 두 사람 — 하나는 찍혔고 하나는 채워졌다 */
 synth:(c)=>`<svg viewBox="0 0 64 64">
  <rect x="8" y="10" width="48" height="34" rx="3" ${IC(c)}/>
  <path d="M15 44v-5a7 7 0 0 1 14 0v5z" fill="${c}" opacity=".3"/>
  <path d="M15 44v-5a7 7 0 0 1 14 0" ${IC(c)}/>
  <circle cx="22" cy="24" r="4.5" ${IC(c)}/>
  <path d="M35 44v-5a7 7 0 0 1 14 0" ${IC(c)} stroke-dasharray="4 4"/>
  <circle cx="42" cy="24" r="4.5" ${IC(c)} stroke-dasharray="4 4"/>
  ${BASE(c)}</svg>`,
 /* 긴 꼬리 — 머리 하나가 나머지를 가져간다 */
 longtail:(c)=>`<svg viewBox="0 0 64 64">
  <rect x="10" y="20" width="8" height="34" rx="2" fill="${c}" opacity=".3"/>
  <rect x="10" y="20" width="8" height="34" rx="2" ${IC(c)}/>
  <rect x="22" y="34" width="8" height="20" rx="2" ${IC(c)}/>
  <rect x="34" y="43" width="8" height="11" rx="2" ${IC(c)}/>
  <rect x="46" y="48" width="8" height="6" rx="2" ${IC(c)}/>
  <path d="M8 54h48" ${IC(c)}/></svg>`,
 /* 표 한 장 — 첫 주말이 정한다 */
 boxoffice:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M10 16h44v9a5 5 0 0 0 0 10v9H10v-9a5 5 0 0 0 0-10z" fill="${c}" opacity=".3"/>
  <path d="M10 16h44v9a5 5 0 0 0 0 10v9H10v-9a5 5 0 0 0 0-10z" ${IC(c)}/>
  <path d="M34 18v6M34 27v6M34 36v6" ${IC(c)}/>
  <path d="M17 26h9" ${IC(c)}/>
  ${BASE(c)}</svg>`,
};

/* ── 유닛 캐스팅: 한 장면 안 인물끼리 hair·top·skin 이 겹치지 않는다 ── */
const CAST = {
 coach:    { hair:"cap",   hairc:"#2B2926", skin:"tan",   top:"tee",     sleeve:"short" },
 athlete:  { hair:"pony",  hairc:"#3A2E2A", skin:"light", top:"hoodie" },
 gamer:    { hair:"short", hairc:"#2B2926", skin:"light", top:"hoodie" },
 fan1:     { hair:"curly", hairc:"#3A2E2A", skin:"brown", top:"tee", sleeve:"short" },
 fan2:     { hair:"bob",   hairc:"#6B3A20", skin:"tan",   top:"shirt" },
 crew:     { hair:"buzz",  hairc:"#2B2926", skin:"tan",   top:"shirt", glasses:1 },
 actor1:   { hair:"long",  hairc:"#8A4B25", skin:"light", top:"sweater" },
 actor2:   { hair:"bun",   hairc:"#2B2926", skin:"brown", top:"hoodie", sleeve:"short" },
 listener: { hair:"twin",  hairc:"#8A4B25", skin:"tan",   top:"tee", sleeve:"short" },
 producer: { hair:"wavy",  hairc:"#3A2E2A", skin:"light", top:"shirt" },
};

/* 패널: y 18 · h 228 (라벨 기준선 264). 장면 캡션은 SVG 안이 아니라 SCENECAP → figcaption 앞머리 */
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

/* 훈련용 콘 (바닥 소품) */
const cone = (x, c, d) => `<g>${shadow(x, 30)}
  <path d="M${x - 14} ${FLOOR}h28l-4-5h-20z" ${OP(d)}/>
  <path d="M${x - 9} ${FLOOR - 5}l9-27l9 27z" ${OP(c)}/>
  <path d="M${x - 5.5} ${FLOOR - 15}h11" ${LN("#fff", 2.4)}/></g>`;
/* 공 (바닥 소품) */
const ball = (x, r, c) => `<g>${shadow(x, r * 2.2)}
  <circle cx="${x}" cy="${FLOOR - r}" r="${r}" ${OP("#fff")}/>
  <path d="M${x} ${FLOOR - r - 6}l6 4.4-2.3 7h-7.4l-2.3-7z" fill="${c}"/>
  <path d="M${x} ${FLOOR - r * 2}v6M${x - r + 1} ${FLOOR - r - 3}l5.7 2M${x + r - 1} ${FLOOR - r - 3}l-5.7 2M${x - 6} ${FLOOR - 1}l2.6-5M${x + 6} ${FLOOR - 1}l-2.6-5" ${LN(INK, 1.4)}/></g>`;
/* 작은 모니터 (스탠드 포함) — 멀리서 같은 경기를 보는 화면 */
const mini = (x, y, c, d) => `<g>
  <rect x="${x - 17}" y="${y - 13}" width="34" height="26" rx="3" ${OP("#fff", 1.6)}/>
  <rect x="${x - 13}" y="${y - 9}" width="26" height="18" rx="2" fill="${c}" opacity=".85"/>
  <path d="M${x} ${y + 13}v4M${x - 6} ${y + 17}h12" ${LN(INK, 1.6)}/></g>`;
/* 캠코더 (드는 소품 — holding() 이 hw 로 손목을 잡는다) */
const camcorder = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-9" y="-19" width="18" height="7" rx="2" ${OP("#fff")}/>
  <rect x="-22" y="-13" width="44" height="26" rx="4" ${OP("#fff")}/>
  <rect x="-17" y="-7" width="14" height="10" rx="2" fill="${c}" opacity=".75"/>
  <circle cx="10" cy="0" r="7.5" ${OP("#fff")}/><circle cx="10" cy="0" r="3.4" fill="${c}"/>
  <path d="M-17 7h10" ${LN(INK, 1.6)}/></g>`;
Object.assign(camcorder, { hw: 22, hh: 13 });
/* 채워 넣은 사람(점선 실루엣) — 실제로 찍힌 인물과 구분되는 유일한 대비 장치.
   흰 채움 + LIGHT 점선이라 서로 겹쳐도 뭉치지 않는다 (반폭 17 · 키 105) */
const ghost = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="2" rx="20" ry="4" fill="${INK}" opacity=".06"/>
  <g fill="#fff" stroke="${LIGHT}" stroke-width="${SW.line}" stroke-dasharray="6 5" stroke-linejoin="round">
   <path d="M-17 0v-44q0-19 17-19t17 19V0"/><circle cx="0" cy="-79" r="13"/></g></g>`;
/* 좁은 문 = 병목: 쐐기 벽 두 짝이 가운데로 좁아져 12px 틈만 남는다 (화살은 그 틈으로만 지나간다) */
const slit = (x, c, d, t) => `<g fill="${t}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round">
  <path d="M${x - 30} 72h60v34l-22 40h-16l-22-40z"/>
  <path d="M${x - 30} 232h60v-34l-22-40h-16l-22 40z"/></g>`;

const scenes = {
 /* 31 — 템플릿 A: 말이 바깥에서 온다(코치가 말한다) / 물음이 안에서 생긴다(코치가 기다린다).
    대비 장치 하나 = 말풍선의 주인 — 왼쪽은 코치의 입에서, 오른쪽은 선수의 머리에서 나온다 */
 coach:(c,t,d)=>{
  const c1 = Object.assign({ x:76, y:FLOOR, s:1, c, pose:"point", arms:{ L:"down", R:"point" }, face:"oh", brow:"down", look:3, capc:d }, CAST.coach);
  const a1 = Object.assign({ x:252, y:FLOOR, s:1, c:d, pose:"down", face:"meh", brow:"low", flip:1, head:7, look:2 }, CAST.athlete);
  const c2 = Object.assign({}, c1, { x:406, pose:"down", arms:{ L:"down", R:"down" }, face:"smile", brow:"soft", look:2, head:-3 });
  const a2 = Object.assign({}, a1, { x:582, pose:"think", face:"oh", brow:"up", head:-5, look:3 });
  const m1 = anchors(c1).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(PA, c, t, d, 1, "말이 바깥에서 온다")}
  ${cone(160, c, d)}${ball(198, 12, c)}
  ${person(c1)}${person(a1)}
  ${bubble({ x:110, y:56, w:104, h:48, lines:["팔꿈치","더 올려!"], c:d, to:{ x:m1.x+20, y:m1.y } })}
  ${room(PB, c, t, d, 2, "물음이 안에서 생긴다")}
  ${ball(462, 12, c)}${cone(504, c, d)}
  ${person(c2)}${person(a2)}
  ${thought({ x:430, y:28, w:126, h:46, lines:["방금 뭐가","달랐지?"], c:d, side:"r" })}
  ${note({ x:300, y:84, w:40, h:28, lines:["침묵"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 32 — 템플릿 A: 구경꾼의 원이 방을 넘어선다.
    대비 장치 하나 = 같은 점선 원 — 왼쪽은 바닥에 닫힌 작은 원, 오른쪽은 화면 다섯 개가 놓인 큰 호 */
 esports:(c,t,d)=>{
  const g1 = Object.assign({ x:158, y:FLOOR, s:1, c, face:"grin", brow:"down", look:2 }, CAST.gamer);
  const f1 = Object.assign({ x:68, y:FLOOR, s:1, c:d, pose:"down", face:"oh", brow:"up", look:3, head:5 }, CAST.fan1);
  const f2 = Object.assign({ x:248, y:FLOOR, s:1, c:d, pose:"down", face:"glad", brow:"soft", look:3, head:-4, flip:1 }, CAST.fan2);
  const g2 = Object.assign({}, g1, { x:485, face:"smile", brow:"soft", look:-2 });
  const arc = [[372,108],[412,66],[485,44],[558,66],[598,108]];
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(PA, c, t, d, 1, "한 방만큼의 원")}
  <ellipse cx="158" cy="228" rx="104" ry="12" fill="none" stroke="${d}" stroke-width="${SW.line}" stroke-dasharray="${DASH}"/>
  ${person(f1)}${person(f2)}
  ${holding(g1, prop.screen_t, 1)}
  ${room(PB, c, t, d, 2, "방이 필요 없는 원")}
  <path d="M356 150A131.5 131.5 0 0 1 614 150" fill="none" stroke="${d}" stroke-width="${SW.line}" stroke-dasharray="${DASH}"/>
  ${arc.map(([x,y])=>mini(x, y, c, d)).join("")}
  ${holding(g2, prop.screen_t, 1)}
  ${note({ x:300, y:84, w:40, h:28, lines:["중계"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 33 — 템플릿 C: 촬영 현장(카메라 든 사람) → 완성된 화면 프레임.
    대비 장치 하나 = 실선 인물(찍힌 것) vs 점선 실루엣(채워 넣은 것) + 리더선 콜아웃 2 */
 synth:(c,t,d)=>{
  const p = Object.assign({ x:86, y:232, s:1, c, face:"smile", brow:"soft", look:3 }, CAST.crew);
  const a1 = Object.assign({ x:262, y:212, s:1, c, pose:"wave", arms:{ L:"down", R:"wave" }, face:"glad", brow:"up", look:2 }, CAST.actor1);
  const a2 = Object.assign({ x:336, y:212, s:1, c:d, pose:"down", face:"smile", brow:"soft", flip:1, head:5, look:3 }, CAST.actor2);
  return `<svg viewBox="0 0 640 280" fill="none">
  ${holding(p, camcorder, 1.05)}
  ${text(86, 258, "촬영 현장", 2, d)}
  ${arrow({ x1:140, y1:150, x2:192, y2:150, c:d })}
  ${panel({ x:204, y:40, w:396, h:184, c:d, floor:1, label:"완성된 화면" })}
  ${[422,474,526].map(x=>`<circle cx="${x}" cy="118" r="11.5" fill="#fff" stroke="${LIGHT}" stroke-width="${SW.line}" stroke-dasharray="6 5"/>`).join("")}
  ${[396,448,500,552].map((x,i)=>ghost(x, 194, 1.1 - (i%2)*.04)).join("")}
  ${person(a1)}${person(a2)}
  ${callout({ x:238, y:140, tx:214, ty:26, text:"실제로 찍은 사람", c:d })}
  ${callout({ x:500, y:198, tx:516, ty:248, text:"채워 넣은 사람", c:d })}</svg>`; },

 /* 34 — 템플릿 C: 듣는 사람 → 좁은 문(재생목록·추천) → 긴 꼬리 그래프.
    대비 장치 하나 = 한 그래프 안의 가파른 머리 / 길고 얇은 꼬리 + 리더선 콜아웃 2 */
 longtail:(c,t,d)=>{
  const p = Object.assign({ x:76, y:232, s:1, c, face:"smile", brow:"soft", look:3, head:4 }, CAST.listener);
  const H = [150,104,74,54,42,34,29,25,22,20,18,16,15,14,13,12,11,11,10,9,9,8];
  return `<svg viewBox="0 0 640 280" fill="none">
  ${holding(p, prop.phone, 1.15, { one:"L", R:"think" })}
  ${text(76, 258, "듣는 사람", 2, d)}
  ${slit(164, c, d, t)}
  ${tag({ x:164, y:54, text:"좁은 문", c:d, fill:"#fff" })}
  ${arrow({ x1:116, y1:152, x2:198, y2:152, c:d })}
  ${panel({ x:204, y:40, w:396, h:184, c:d, label:"스트리밍 재생 수" })}
  ${ground({ x1:216, x2:588, y:200, c:d, w:SW.hair })}
  ${H.map((h,i)=>bar({ x:226+i*17, base:200, h, w:11, c, op:(1-i*.03).toFixed(2) })).join("")}
  ${callout({ x:226, y:50, tx:262, ty:26, text:"가파른 머리", c:d, anchor:"start" })}
  ${callout({ x:514, y:190, tx:518, ty:248, text:"길고 얇은 꼬리", c:d, anchor:"start" })}</svg>`; },

 /* 35 — 템플릿 A: 손익선 아래의 대부분 / 선을 크게 넘는 몇 편.
    대비 장치 하나 = 두 패널을 가로지르는 같은 높이의 손익분기 점선. 화살은 오른쪽에서 왼쪽(그 몇 편이 나머지를 메운다) */
 boxoffice:(c,t,d)=>{
  const p1 = Object.assign({ x:74, y:FLOOR, s:1, c, pose:"shrug", face:"worry", brow:"down", head:-5, look:3 }, CAST.producer);
  const p2 = Object.assign({}, p1, { x:404, pose:"up", arms:{ L:"down", R:"up" }, face:"glad", brow:"up", head:4, look:2 });
  const beam = x => `<path d="M${x} 150h150" stroke="${MID}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>`;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(PA, c, t, d, 1, "대부분은 손해를 본다")}
  ${[[142,44],[172,32],[202,52],[232,38],[262,46]].map(([x,h])=>bar({ x, base:FLOOR, h, w:22, c, op:.42 })).join("")}
  ${beam(128)}${text(128, 142, "손익분기", 3, MID, "start")}
  ${person(p1)}
  ${room(PB, c, t, d, 2, "몇 편이 그 모두를 감당한다")}
  ${[[506,150],[562,116]].map(([x,h])=>bar({ x, base:FLOOR, h, w:34, c, op:1 })).join("")}
  ${beam(452)}
  ${person(p2)}
  ${note({ x:300, y:84, w:40, h:28, lines:["메운다"], c:d, tint:t })}
  ${arrow({ x1:338, y1:124, x2:302, y2:124, c:d })}</svg>`; },
};

/* 장면 캡션 1줄: build.js 가 figcaption 앞머리에 '<b>Figure N</b> 캡션 — (units 의 fig 설명)' 으로 찍는다 */
const SCENECAP = {
 coach: "무엇을 말할지보다 언제 말할지",
 esports: "구경꾼의 원이 방을 넘어섰다",
 synth: "몇 사람을 찍고, 나머지는 채워 넣는다",
 longtail: "꼬리는 길어졌고, 문은 좁아졌다",
 boxoffice: "몇 편이 나머지 모두를 감당한다",
};

/* 비네트 캡션: KB 제목을 되풀이하지 않고 도해가 가리키는 사실 하나를 적는다 */
const VIGCAP = {
 "31": "윈스타인·슈미트의 지연 검사 · 1990",
 "32": "스탠퍼드의 Spacewar! 대회 · 1972",
 "33": "『반지의 제왕』의 군중 소프트웨어",
 "34": "크리스 앤더슨의 「롱테일」 · 2004",
 "35": "점유율이 다음 주 상영관을 정한다",
};

const STRIP = {
 "31":["chat","ruler","nope","swap","hourglass"],
 "32":["pair","globe","coin","letters","tag"],
 "33":["camera","wand","coin","swap","ask"],
 "34":["books","map","heartbeat","eye","swap"],
 "35":["loop","coin","shield","hourglass","balance"]
};

/* ── 비네트(240×150 → 45mm): 인물 없이 소품 도해 1개 — 글자는 lvl "v"(칩) · "vs"(라벨) 만, SVG 안 제목 없음 ── */
const VIG = {
 /* 매번 피드백 vs 가끔 피드백: 연습 중에는 앞서고 일주일 뒤에는 뒤집힌다 (두 선이 교차한다) */
 "31":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M28 116h184" stroke="${LIGHT}" stroke-width="${SW.hair}"/>
  <path d="M40 58C92 62 132 80 196 102" stroke="${c}" stroke-width="${SW.bold}" fill="none" stroke-linecap="round"/>
  <path d="M40 98C92 94 132 74 196 52" stroke="${d}" stroke-width="${SW.bold}" fill="none" stroke-linecap="round" stroke-dasharray="9 6"/>
  <circle cx="40" cy="58" r="4.6" fill="${c}"/><circle cx="196" cy="102" r="4.6" fill="${c}"/>
  <circle cx="40" cy="98" r="4.6" fill="${d}"/><circle cx="196" cy="52" r="4.6" fill="${d}"/>
  ${tag({ x:64, y:22, text:"매번 피드백", c, fill:"#fff", lvl:"v" })}
  ${tag({ x:178, y:22, text:"가끔 피드백", c:d, lvl:"v" })}
  ${text(52, 140, "연습 중", "vs", MID)}
  ${text(188, 140, "일주일 뒤", "vs", MID)}</svg>`,
 /* 첫 대회의 우승 상품(잡지 한 권) → 지금의 상금(동전 더미) */
 "32":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <g transform="translate(58 62)">
   <rect x="-24" y="-32" width="48" height="62" rx="3" ${OP("#fff")}/>
   <path d="M-24-29a3 3 0 0 1 3-3h42a3 3 0 0 1 3 3v13h-48z" fill="${c}"/>
   <path d="M-14-6h28M-14 4h28M-14 14h19" stroke="${c}" stroke-width="2.6" stroke-linecap="round" opacity=".55"/></g>
  ${arrow({ x1:98, y1:62, x2:132, y2:62, c:d })}
  ${prop.coin(176, 42, 1.05, c)}${prop.coin(160, 66, 1.05, c)}${prop.coin(193, 66, 1.05, c)}
  ${tag({ x:58, y:124, text:"1972", c, fill:"#fff", lvl:"v" })}
  ${tag({ x:176, y:124, text:"수백만 달러", c:d, lvl:"v" })}</svg>`,
 /* 규칙 몇 줄이 수만 명을 만든다 (매시브) */
 "33":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${[0,1,2].map(i=>`<g transform="translate(${42+i*4} ${32+i*30})">
   <rect x="-26" y="-13" width="52" height="26" rx="4" ${OP("#fff", 1.6)}/>
   <path d="M-16-4h32M-16 4h21" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/></g>`).join("")}
  ${arrow({ x1:82, y1:60, x2:114, y2:60, c:d })}
  ${[0,1,2,3,4].map(r=>[0,1,2,3,4,5,6].map(q=>`<circle cx="${130+q*15}" cy="${28+r*17}" r="4.6" fill="${c}" opacity="${(.9-r*.13).toFixed(2)}"/>`).join("")).join("")}
  ${tag({ x:56, y:132, text:"규칙 몇 줄", c, fill:"#fff", lvl:"v" })}
  ${tag({ x:176, y:132, text:"수만 명", c:d, lvl:"v" })}</svg>`,
 /* 2004년의 예상(완만한 꼬리)과 실제(가파른 머리 + 긴 꼬리) */
 "34":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M26 116h172" stroke="${LIGHT}" stroke-width="${SW.hair}"/>
  <path d="M34 56C74 62 130 68 186 72" stroke="${MID}" stroke-width="${SW.line}" fill="none" stroke-dasharray="${DASH}" stroke-linecap="round"/>
  <path d="M34 20C46 56 50 78 62 86C96 96 140 102 186 106" stroke="${c}" stroke-width="${SW.bold}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  ${text(232, 66, "예상", "vs", MID, "end")}
  ${text(232, 102, "실제", "vs", MID, "end")}
  ${tag({ x:120, y:136, text:"긴 꼬리, 가파른 머리", c:d, lvl:"v" })}</svg>`,
 /* 첫 주 세 관, 다음 주 한 관 — 좌석 점유율에 따라 상영관이 다시 나뉜다 */
 "35":(c,t,d)=>{
  const scr = (x, y, on) => `<g><rect x="${x-15}" y="${y-12}" width="30" height="24" rx="3" fill="${on ? c : "#fff"}" stroke="${d}" stroke-width="${SW.hair}"/>
   ${on ? "" : `<path d="M${x-8} ${y}h16" stroke="${LIGHT}" stroke-width="${SW.line}" stroke-linecap="round"/>`}</g>`;
  return `<svg viewBox="0 0 240 150" fill="none">
  ${[0,1,2,3,4].map(i=>scr(84+i*34, 44, i<3)).join("")}
  ${[0,1,2,3,4].map(i=>scr(84+i*34, 92, i<1)).join("")}
  ${text(58, 50, "첫 주", "vs", MID, "end")}
  ${text(58, 98, "다음 주", "vs", MID, "end")}
  ${tag({ x:120, y:132, text:"상영관 재배정", c:d, lvl:"v" })}</svg>`; },
};

module.exports = { icons, scenes, STRIP, VIG, VIGCAP, SCENECAP };
