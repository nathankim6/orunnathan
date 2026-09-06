/* Unit 6 삽화 — 정돈된 도해 (방향 A · Unit 1 규격)
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64
   구도 템플릿: A 2패널 비교(x 20/350 w 270 h 228) · B 3패널 순서(칩 1–3, s .85) · C 단일 도해 · D 인물 대화
   장면 캡션은 SVG 안에 두지 않고 SCENECAP → figcaption 앞머리 한 줄로 찍는다 (그림 안 글자는 패널 라벨·풍선뿐)
   색: accent(c) · deep(d) · tint(t) + 잉크/회색 2단 + 흰색. 노랑 0. */
const K = require("../kit.js");
const { person, holding, anchors, bubble, thought, note, panel, arrow, tag, text, prop, ground, floorBand, mix, INK, MID, LIGHT, SW, DASH } = K;

/* ── 레슨 아이콘: 선화 stroke 3 round · 라이브 48×48(패딩 8) · 면 채움은 accent 30% 한 곳 ──
   다섯 개가 한 계열: 화면·기기 실루엣 + 작은 원 하나 */
const IC = c => `stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
 /* 26 — 알림 배지가 달린 노트북 화면 */
 always:(c)=>`<svg viewBox="0 0 64 64">
  <rect x="10" y="14" width="36" height="26" rx="3" ${IC(c)}/>
  <path d="M8 46h40M20 24h12M20 30h8" ${IC(c)}/>
  <circle cx="49" cy="15" r="7" fill="${c}" opacity=".3"/>
  <circle cx="49" cy="15" r="7" ${IC(c)}/>
  <path d="M49 11.5v4.5M49 19v.5" ${IC(c)}/></svg>`,
 /* 27 — VR 헤드셋 */
 virtual:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M8 26h48a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H43l-6-6h-10l-6 6H8a3 3 0 0 1-3-3V29a3 3 0 0 1 3-3z" ${IC(c)}/>
  <circle cx="20" cy="36" r="5" fill="${c}" opacity=".3"/>
  <circle cx="20" cy="36" r="5" ${IC(c)}/><circle cx="44" cy="36" r="5" ${IC(c)}/>
  <path d="M18 20c4-8 24-8 28 0" ${IC(c)}/></svg>`,
 /* 28 — 시계와 겹쳐 있는 휴대전화 */
 wellbeing:(c)=>`<svg viewBox="0 0 64 64">
  <rect x="9" y="8" width="24" height="46" rx="4" ${IC(c)}/>
  <path d="M17 14h8M19 48h4" ${IC(c)}/>
  <circle cx="42" cy="38" r="14" fill="${c}" opacity=".3"/>
  <circle cx="42" cy="38" r="14" ${IC(c)}/>
  <path d="M42 30v8l6 3" ${IC(c)}/></svg>`,
 /* 29 — 로봇 얼굴 */
 aiwinter:(c)=>`<svg viewBox="0 0 64 64">
  <rect x="12" y="20" width="40" height="32" rx="7" ${IC(c)}/>
  <path d="M32 20v-8M12 34H7M52 34h5" ${IC(c)}/>
  <circle cx="32" cy="9" r="3" fill="${c}" opacity=".3"/>
  <circle cx="32" cy="9" r="3" ${IC(c)}/>
  <circle cx="23" cy="33" r="3.5" fill="${c}" opacity=".3"/>
  <circle cx="23" cy="33" r="3.5" ${IC(c)}/><circle cx="41" cy="33" r="3.5" ${IC(c)}/>
  <path d="M25 44h14" ${IC(c)}/></svg>`,
 /* 30 — 말줄임표가 든 말풍선 */
 unsaid:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M12 12h40a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H30l-10 9v-9h-8a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" fill="${c}" opacity=".3"/>
  <path d="M12 12h40a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H30l-10 9v-9h-8a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" ${IC(c)}/>
  <circle cx="22" cy="27" r="1.5" ${IC(c)}/><circle cx="32" cy="27" r="1.5" ${IC(c)}/><circle cx="42" cy="27" r="1.5" ${IC(c)}/></svg>`,
};

/* ── 유닛 캐스팅: 배너 안 인물이 서로 다르게 ── */
const CAST = {
 worker1: { hair:"short", hairc:"#2B2926", skin:"light", top:"shirt", glasses:1 },
 worker2: { hair:"bob",   hairc:"#6B3A20", skin:"tan",   top:"hoodie" },
 surgeon: { hair:"cap",   hairc:"#3A2E2A", skin:"tan",   top:"apron" },
 patient: { hair:"pony",  hairc:"#8A4B25", skin:"light", top:"sweater" },
 architect:{ hair:"bun",  hairc:"#2B2926", skin:"brown", top:"shirt", glasses:1 },
 teen1:   { hair:"curly", hairc:"#3A2E2A", skin:"brown", top:"tee", sleeve:"short" },
 teen2:   { hair:"long",  hairc:"#B8742F", skin:"light", top:"sweater" },
 scholar: { hair:"buzz",  hairc:"#2B2926", skin:"light", top:"shirt", glasses:1 },
 child:   { hair:"twin",  hairc:"#6B3A20", skin:"tan",   top:"tee", sleeve:"short" },
 asker:   { hair:"wavy",  hairc:"#3A2E2A", skin:"light", top:"shirt" },
 friend:  { hair:"short", hairc:"#7C7C82", skin:"brown", top:"hoodie" },
};
/* 패널: y 18 · h 228 (라벨 기준선 264). 장면 캡션은 SVG 안이 아니라 SCENECAP → figcaption 앞머리 */
const P3 = [{ x:20, y:18, w:186, h:228 }, { x:227, y:18, w:186, h:228 }, { x:434, y:18, w:186, h:228 }];
const PA = { x:20, y:18, w:270, h:228 }, PB = { x:350, y:18, w:270, h:228 };   // 패널 사이 60 (노트 40 + 여백 10·10)
const PD = { x:20, y:18, w:600, h:228 };                                         // 단일 패널 (대화)
const FLOOR = 236;                                   // 인물 발밑 바닥선 (패널 바닥 246 − 10)
const BAND = 204;                                    // 벽/바닥 경계 (책상 상판 192 보다 12 아래)
const DESK = 192;                                    // 책상 상판 윗선
/* 바닥 띠 + 바닥선 (패널 하나) */
const floorOf = (P, t, d) => `${floorBand(Object.assign({ top:BAND, t, line:0 }, P))}
  ${ground({ x1:P.x+14, x2:P.x+P.w-14, y:FLOOR, c:d, w:SW.hair })}`;
/* 작은 책상: 두께 6 상판(틴트보다 한 단 진한 면 + deep 선, rx 2) + 다리 2(SW.line) + 바닥 그림자 */
const desk = (x, w, d, t) => `<ellipse cx="${x + w / 2}" cy="${FLOOR + 2}" rx="${w / 2 - 6}" ry="4" fill="${INK}" opacity=".08"/>
  <path d="M${x + 10} ${DESK + 6}V${FLOOR}M${x + w - 10} ${DESK + 6}V${FLOOR}" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
  <rect x="${x}" y="${DESK}" width="${w}" height="6" rx="2" fill="${mix(t, d, .18)}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>`;
/* 벽에 걸린 시간 띠: 틴트 바탕(헤어라인 테두리) 위에 accent 구간(segs = [시작, 길이] 비율) */
const timeStrip = (x, y, w, c, t, d, segs) => `<rect x="${x}" y="${y}" width="${w}" height="18" rx="5" fill="${t}" stroke="${d}" stroke-width="${SW.hair}"/>
  ${segs.map(([a, l]) => `<rect x="${x + 3 + a * (w - 6)}" y="${y + 3}" width="${l * (w - 6)}" height="12" rx="3.5" fill="${c}"/>`).join("")}`;
/* 알림 '핑': 점 + 위로 퍼지는 호 2 */
const ping = (x, y, d) => `<circle cx="${x}" cy="${y}" r="3" fill="${d}"/>
  <path d="M${x - 7} ${y - 6} a9 9 0 0 1 14 0 M${x - 11} ${y - 10} a14 14 0 0 1 22 0" stroke="${d}" stroke-width="${SW.hair}" fill="none" stroke-linecap="round"/>`;
/* 심전도 모양의 스캔 선 (화면 위에 얹는다) */
const scanLine = (x, y, s, col) => `<path transform="translate(${x} ${y}) scale(${s})" d="M-14 0h5l3-7 4 14 3-7h13" stroke="${col}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
/* VR 헤드셋: 눈 앵커 위에 얹는다 */
const headset = (p, d) => { const e = anchors(p).eye, s = p.s || 1;
  return `<rect x="${e.x - 20 * s}" y="${e.y - 8 * s}" width="${40 * s}" height="${15 * s}" rx="${4 * s}" fill="${d}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M${e.x - 13 * s} ${e.y - 4 * s} h${8 * s} M${e.x + 5 * s} ${e.y - 4 * s} h${8 * s}" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>`; };
/* 작은 로봇 (발밑 중앙 원점, 키 ≈ 96) */
const robot = (x, y, s, c, t) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="2" rx="22" ry="4" fill="${INK}" opacity=".10"/>
  <path d="M-10 -20 v14 M10 -20 v14" stroke="${INK}" stroke-width="9.8" stroke-linecap="round"/><path d="M-10 -20 v14 M10 -20 v14" stroke="${mix(t, INK, .35)}" stroke-width="8" stroke-linecap="round"/>
  <path d="M-19 -46 l-10 14 M19 -46 l10 14" stroke="${INK}" stroke-width="8.8" stroke-linecap="round"/><path d="M-19 -46 l-10 14 M19 -46 l10 14" stroke="${t}" stroke-width="7" stroke-linecap="round"/>
  <circle cx="-29" cy="-32" r="4.5" fill="${t}" stroke="${INK}" stroke-width="1.8"/><circle cx="29" cy="-32" r="4.5" fill="${t}" stroke="${INK}" stroke-width="1.8"/>
  <rect x="-17" y="-56" width="34" height="38" rx="6" fill="${t}" stroke="${INK}" stroke-width="1.8"/>
  <rect x="-9" y="-48" width="18" height="10" rx="2" fill="${c}"/>
  <path d="M0 -62 v-8" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/><circle cx="0" cy="-73" r="3.2" fill="${c}" stroke="${INK}" stroke-width="1.8"/>
  <rect x="-14" y="-88" width="28" height="26" rx="7" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
  <circle cx="-5.5" cy="-77" r="2.6" fill="${INK}"/><circle cx="5.5" cy="-77" r="2.6" fill="${INK}"/>
  <path d="M-5 -69 h10" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/></g>`;
/* 판정 칩: 체크 / 물음표 */
const mark = (x, y, kind, c) => `<circle cx="${x}" cy="${y}" r="12" fill="${c}"/>
  ${kind === "ok" ? `<path d="M${x - 6} ${y} l4 4 8-8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
                  : `<text x="${x}" y="${y + 5.5}" font-size="16" font-weight="700" fill="#fff" text-anchor="middle" font-family="'Noto Sans CJK KR','Noto Sans KR',sans-serif">?</text>`}`;
/* 체스판이 뜬 모니터 (책상 위) */
const chessScreen = (x, y, c, d) => `${prop.screen(x, y, 1, d)}
  ${[0,1,2,3,4,5].map(i => [0,1,2].map(j => (i + j) % 2 ? `<rect x="${x - 17 + i * 5.67}" y="${y - 11 + j * 6.67}" width="5.67" height="6.67" fill="#fff" opacity=".85"/>` : "").join("")).join("")}`;

const scenes = {
 /* 26 — 템플릿 A: 정오까지 조용한 책상 / 언제든 울릴 수 있는 책상 — 벽의 시간 띠가 한 덩어리 vs 조각조각 */
 always:(c,t,d)=>{
  const p1 = Object.assign({ x:96, y:FLOOR, s:1, c, face:"smile", brow:"soft" }, CAST.worker1);
  const p2 = Object.assign({ x:426, y:FLOOR, s:1, c:d, face:"worry", brow:"down", head:5, look:2 }, CAST.worker2);
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"정오까지 아무것도 오지 않는다" }, PA))}
  ${floorOf(PA, t, d)}
  ${timeStrip(166, 64, 110, c, t, d, [[0, 1]])}
  ${desk(176, 96, d, t)}${prop.bookc(254, DESK - 16, 1, c)}${prop.cup(204, DESK - 12, .8, c)}
  ${holding(p1, prop.screen_t, 1)}
  ${panel(Object.assign({ c:d, t, n:2, label:"언제든 울릴 수 있다" }, PB))}
  ${floorOf(PB, t, d)}
  ${timeStrip(496, 64, 110, c, t, d, [[0, .14], [.24, .1], [.42, .16], [.66, .08], [.82, .12]])}
  ${[.19, .37, .61, .77].map(a => ping(499 + a * 104, 50, d)).join("")}
  ${desk(506, 96, d, t)}${prop.bookc(584, DESK - 16, 1, c)}${prop.cup(534, DESK - 12, .8, c)}
  ${holding(p2, prop.phone, 1.15)}
  ${note({ x:300, y:84, w:40, h:28, lines:["알림"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 27 — 템플릿 B: 3패널 순서 — 외과의(스캔 복사본) → 환자(가상 발코니) → 건축가(안 지은 건물) · 점선 = 아직 실재하지 않는 것 */
 virtual:(c,t,d)=>{
  const s = .85, y = FLOOR;
  const p1 = Object.assign({ x:78, y, s, c, face:"flat", brow:"soft", capc:d }, CAST.surgeon);
  const p2 = Object.assign({ x:296, y, s, c:d, pose:"open", face:"oh", brow:"up", head:-4 }, CAST.patient);
  const p3 = Object.assign({ x:494, y, s, c, pose:"point", face:"glad", brow:"up", look:3 }, CAST.architect);
  const h1 = anchors(p1).hands;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"수술을 미리 해 본다" }, P3[0]))}
  ${floorOf(P3[0], t, d)}
  ${desk(122, 78, d, t)}${prop.screen(162, DESK - 20, 1, c)}${scanLine(162, DESK - 21, 1, "#fff")}
  ${holding(p1, prop.screen_t, 1)}${scanLine(h1.x, h1.y - 1, s, "#fff")}
  ${panel(Object.assign({ c:d, t, n:2, label:"두려움을 안전하게 마주한다" }, P3[1]))}
  ${floorOf(P3[1], t, d)}
  <path d="M334 156h70M344 156v80M369 156v80M394 156v80" stroke="${MID}" stroke-width="${SW.line}" stroke-linecap="round" stroke-dasharray="${DASH}"/>
  ${person(p2)}${headset(p2, d)}
  ${panel(Object.assign({ c:d, t, n:3, label:"안 지은 건물을 걷는다" }, P3[2]))}
  ${floorOf(P3[2], t, d)}
  <path d="M556 236V150h56v86M552 152l32-32 32 32M574 236v-30h16v30M566 168h12v12h-12zM590 168h12v12h-12z" stroke="${MID}" stroke-width="${SW.line}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${DASH}"/>
  ${person(p3)}</svg>`; },

 /* 28 — 템플릿 A: 친구와 주고받은 두 시간 / 낯선 글을 넘긴 두 시간 — 오가는 풍선 vs 한 방향으로 흘러가는 회색 카드 */
 wellbeing:(c,t,d)=>{
  const p1 = Object.assign({ x:96, y:FLOOR, s:1, c, face:"laugh", brow:"up" }, CAST.teen1);
  const p2 = Object.assign({ x:426, y:FLOOR, s:1, c:d, face:"meh", brow:"low", head:5, look:2 }, CAST.teen2);
  const m1 = anchors(p1).mouth, h1 = anchors(p1).hands;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"친구와 주고받은 두 시간" }, PA))}
  ${floorOf(PA, t, d)}
  ${holding(p1, prop.phone, 1.15)}
  ${bubble({ x:146, y:82, w:124, h:52, lines:["그래서","어떻게 됐어?"], c:d, to:{ x:m1.x+20, y:m1.y } })}
  ${bubble({ x:150, y:150, w:96, h:34, lines:["나도 봤어!"], c:d, lvl:2, to:{ x:h1.x+16, y:h1.y } })}
  ${panel(Object.assign({ c:d, t, n:2, label:"낯선 글을 넘긴 두 시간" }, PB))}
  ${floorOf(PB, t, d)}
  ${holding(p2, prop.phone, 1.15)}
  ${[70, 98, 126, 154].map(y => `<rect x="500" y="${y}" width="96" height="18" rx="6" fill="#fff" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
    <path d="M510 ${y + 9} h${[52, 40, 60, 36][(y - 70) / 28]}" stroke="${LIGHT}" stroke-width="${SW.line}" stroke-linecap="round"/>`).join("")}
  ${arrow({ x1:548, y1:180, x2:548, y2:196, c:LIGHT })}
  ${note({ x:300, y:84, w:40, h:28, lines:["2시간"], c:d, tint:t })}
  ${prop.clock(320, 140, 1, c)}</svg>`; },

 /* 29 — 템플릿 A: 어려워 보였지만 쉬웠다(체스 화면 + ✓) / 쉬워 보였지만 어려웠다(컵 들고 걷는 아이 + ?) — 로봇이 두 장면을 지켜본다 */
 aiwinter:(c,t,d)=>{
  const p1 = Object.assign({ x:84, y:FLOOR, s:1, c, pose:"point", face:"glad", brow:"up" }, CAST.scholar);
  const p2 = Object.assign({ x:440, y:FLOOR, s:1, c, legs:"walk", face:"laugh", brow:"up", head:-4 }, CAST.child);
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"어려워 보였지만 쉬웠다" }, PA))}
  ${floorOf(PA, t, d)}
  ${desk(160, 84, d, t)}${chessScreen(202, DESK - 20, c, d)}
  ${robot(258, FLOOR, .9, c, t)}${mark(202, 130, "ok", c)}
  ${person(p1)}
  ${panel(Object.assign({ c:d, t, n:2, label:"쉬워 보였지만 어려웠다" }, PB))}
  ${floorOf(PB, t, d)}
  ${robot(570, FLOOR, .9, c, t)}${mark(524, 130, "q", c)}
  ${holding(p2, prop.cup, 1, { one:"L", R:"down" })}
  ${note({ x:300, y:84, w:40, h:28, lines:["역설"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 30 — 템플릿 D: 두 인물 + 풍선 — "영화 어땠어?" / "좌석이 편하더라." / (생각) "별로였구나" */
 unsaid:(c,t,d)=>{
  const p1 = Object.assign({ x:150, y:FLOOR, s:1, c, pose:"open", face:"meh", brow:"low", look:3 }, CAST.asker);
  const p2 = Object.assign({ x:500, y:FLOOR, s:1, c:d, pose:"shrug", face:"smile", brow:"soft", head:5, flip:1 }, CAST.friend);
  const m1 = anchors(p1).mouth, m2 = anchors(p2).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, label:"말한 것과 알아들은 것" }, PD))}
  ${floorOf(PD, t, d)}
  ${person(p1)}${person(p2)}
  ${bubble({ x:196, y:60, w:128, h:44, lines:["영화 어땠어?"], c:d, to:{ x:m1.x+20, y:m1.y } })}
  ${bubble({ x:322, y:96, w:146, h:44, lines:["좌석이 편하더라."], c:d, to:{ x:m2.x-20, y:m2.y } })}
  ${thought({ x:24, y:22, w:100, h:44, lines:["아…","별로였구나"], c:d, side:"r", lvl:2 })}</svg>`; },
};

/* 장면 캡션 1줄: build.js 가 figcaption 앞머리에 '<b>Figure N</b> 캡션 — (units 의 fig 설명)' 으로 찍는다 */
const SCENECAP = {
 always: "조용한 책상, 언제든 울리는 책상",
 virtual: "실패해도 아무도 다치지 않는 세 개의 방",
 wellbeing: "주고받은 시간과 넘겨 본 시간",
 aiwinter: "쉬워 보인 것이 어려웠다",
 unsaid: "말하지 않은 자리가 말한다",
};

/* 비네트 캡션: KB 제목을 되풀이하지 않고 도해가 가리키는 사실 하나를 적는다 */
const VIGCAP = {
 "26": "글로리아 마크 · 사무실 관찰 연구",
 "27": "에드윈 링크의 비행 훈련기 · 1929",
 "28": "오벤·프리비블스키 · 2019 재분석",
 "29": "모라벡 · 1988 — 계산이 무거운 쪽",
 "30": "그라이스의 추천서 · 빠진 한 줄",
};

const STRIP = {
 "26":["hourglass","tag","wilt","warn","shield"],
 "27":["frame","heartbeat","shield","dome","warn"],
 "28":["quote","ruler","pair","ask","swap"],
 "29":["handshake","brain","gear","sprout","balance"],
 "30":["chat","handshake","ruler","wand","globe"]
};

/* ── 비네트(240×150 → 45mm): 인물 없이 소품 도해 1개 — 글자는 lvl "v"(칩) · "vs"(라벨) 만, SVG 안 제목 없음 ── */
const VIG = {
 /* 26 — 방해받은 뒤 돌아오는 데 20분+: 몰입 구간(채움) → 알림 → 점선 구간(돌아오는 중) → 다시 채움 */
 "26":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M14 96h212" stroke="${INK}" stroke-width="${SW.line}" stroke-linecap="round"/>
  <rect x="18" y="70" width="72" height="26" rx="5" fill="${c}"/>
  ${prop.phone(104, 78, .85, d)}
  <rect x="120" y="70" width="86" height="26" rx="5" fill="#fff" stroke="${LIGHT}" stroke-width="${SW.line}" stroke-dasharray="${DASH}"/>
  <rect x="208" y="70" width="18" height="26" rx="5" fill="${c}"/>
  <path d="M120 52v8M206 52v8M120 56h86" stroke="${d}" stroke-width="${SW.hair}" stroke-linecap="round"/>
  ${tag({ x:163, y:32, text:"20분+", c:d, lvl:"v" })}
  ${text(54, 124, "몰입", "vs", MID)}
  ${text(163, 124, "돌아오는 중", "vs", MID)}</svg>`,
 /* 27 — 링크 트레이너: 받침대 위 짧은 동체, 화면 없이 움직임만 */
 "27":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="86" y="104" width="68" height="20" rx="4" fill="${t}" stroke="${d}" stroke-width="${SW.line}"/>
  <path d="M104 104l6-16h20l6 16" fill="#fff" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M58 76q0-10 12-10h96q12 0 12 10t-12 10h-96q-12 0-12-10z" fill="${c}" stroke="${INK}" stroke-width="1.8"/>
  <rect x="36" y="72" width="168" height="9" rx="4.5" fill="${d}" stroke="${INK}" stroke-width="1.8"/>
  <path d="M106 66q6-16 26-16q10 0 10 16z" fill="#fff" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M166 66l14-18h10l-6 18z" fill="${d}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M54 62v28" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
  ${tag({ x:60, y:26, text:"Link Trainer", c:d, fill:"#fff", lvl:"v" })}
  ${text(120, 144, "화면 없이, 움직임만", "vs", MID)}</svg>`,
 /* 28 — 화면 시간 vs 감자 섭취: 웰빙과의 연관 크기가 같은 높이의 막대 */
 "28":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${prop.phone(70, 50, 1.1, c)}
  <path d="M158 50c0-11 9-19 22-19s20 9 20 19-8 19-20 19-22-8-22-19z" fill="${c}" stroke="${INK}" stroke-width="1.8"/>
  <circle cx="171" cy="45" r="1.8" fill="${d}"/><circle cx="185" cy="55" r="1.8" fill="${d}"/><circle cx="188" cy="42" r="1.8" fill="${d}"/>
  <path d="M30 116h180" stroke="${INK}" stroke-width="${SW.line}" stroke-linecap="round"/>
  <rect x="50" y="98" width="40" height="18" rx="3" fill="${d}"/>
  <rect x="160" y="98" width="40" height="18" rx="3" fill="${d}"/>
  ${text(125, 112, "=", "v", d)}
  ${tag({ x:125, y:20, text:"연관의 크기", c:d, lvl:"v" })}
  ${text(70, 140, "화면 시간", "vs", MID)}
  ${text(180, 140, "감자 섭취", "vs", MID)}</svg>`,
 /* 29 — 저울: 추론은 가볍고, 지각·운동은 무겁다 */
 "29":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M120 44v78M92 122h56" stroke="${INK}" stroke-width="${SW.line}" stroke-linecap="round"/>
  <g transform="rotate(10 120 44)">
   <path d="M52 44h136" stroke="${INK}" stroke-width="${SW.line}" stroke-linecap="round"/>
   <path d="M52 44v24M188 44v34" stroke="${INK}" stroke-width="${SW.hair}"/>
  </g>
  <circle cx="120" cy="44" r="4" fill="${d}"/>
  <path d="M40 70a16 8 0 0 0 32 0z" fill="${t}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>
  <circle cx="56" cy="62" r="7" fill="${c}"/>
  <path d="M164 102a24 10 0 0 0 48 0z" fill="${t}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>
  <circle cx="188" cy="84" r="18" fill="${c}"/>
  ${tag({ x:120, y:16, text:"계산량", c:d, lvl:"v" })}
  ${text(56, 100, "추론", "vs", MID)}
  ${text(188, 140, "지각 · 운동", "vs", MID)}</svg>`,
 /* 30 — 추천서: 있는 줄 둘(체크)과 빠진 줄 하나(점선) */
 "30":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="50" y="10" width="140" height="130" rx="6" fill="#fff" stroke="${d}" stroke-width="${SW.hair}"/>
  <path d="M66 28h48" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
  ${[0, 1].map(i => `<rect x="66" y="${44 + i * 24}" width="13" height="13" rx="2" stroke="${d}" stroke-width="${SW.hair}" fill="#fff"/>
    <path d="M69 ${51 + i * 24}l3 3 6-7" stroke="${c}" stroke-width="${SW.line}" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}
  ${text(88, 56, "출석 좋음", "vs", MID, "start")}
  ${text(88, 80, "글씨 단정", "vs", MID, "start")}
  <path d="M66 105h108" stroke="${LIGHT}" stroke-width="${SW.line}" stroke-linecap="round" stroke-dasharray="${DASH}"/>
  ${tag({ x:120, y:126, text:"학업은?", c:d, lvl:"v" })}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG, VIGCAP, SCENECAP };
