/* Unit 12 삽화 — 시사·현안 · 정돈된 도해 (디자인 시스템 A, Unit 1 규격)
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64
   구도 템플릿: A 2패널 비교(x 20/350 w 270 h 228) · B 3패널 순서(칩 1–3, s .85) · C 단일 도해 · D 인물 대화
   장면 캡션은 SVG 안에 두지 않고 SCENECAP → figcaption 앞머리 한 줄로 찍는다 (그림 안 글자는 패널 라벨·풍선·태그뿐)
   색: accent(c) · deep(d) · tint(t) + 잉크/회색 2단 + 흰색. 이 유닛은 노랑을 쓰지 않는다.
   레슨별 구도
   56 blizzard A 2패널 — 달력의 눈 오는 날은 여덟에서 셋으로, 발밑 눈은 발목에서 허리로 (사이 노트 +1℃ +7%)
   57 healing  A 2패널 — 의학은 벌어진 자리를 양쪽에서 맞대 준다 / 몸은 가장자리 세포를 보내 이음매를 채운다
   58 nation   A 2패널 — 지나갈 수 있는 아치문(법 문서를 들고 들어간다) / 벽돌로 막히고 계보가 걸린 같은 문
   59 cobot    A 2패널 — 옛 이야기(로봇만 남고 사람은 문으로 나간다) / 지금(한 작업대를 점선이 가른다)
   60 needs    B 3패널 — 1900 사전 속의 낱말 → 1920년대 광고판 → 오늘 손에 든 병 */
const K = require("../kit.js");
const { person, holding, anchors, bubble, thought, note, panel, arrow, callout, tag, text, prop, ground, floorBand, mix, INK, MID, LIGHT, SW, DASH } = K;

/* ── 레슨 아이콘: 선화 stroke 3 round · 라이브 48×48(패딩 8) · 면 채움은 accent 30% 한 곳
      다섯 개 모두 '물건 하나 + 바닥선' 계열 ── */
const IC = c => `stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
 /* 구름 하나에서 큰 눈송이가 떨어진다 */
 blizzard:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M18 28a8 8 0 0 1 2-15a12 12 0 0 1 23 1a8 8 0 0 1 2 14z" fill="${c}" opacity=".3"/>
  <path d="M18 28a8 8 0 0 1 2-15a12 12 0 0 1 23 1a8 8 0 0 1 2 14z" ${IC(c)}/>
  <path d="M32 34v18M24 39l16 8M40 39l-16 8" ${IC(c)}/>
  <path d="M9 58h46" ${IC(c)}/></svg>`,
 /* 반창고 — 가운데 패드가 채워져 있다 */
 healing:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M13 28a9 9 0 0 1 0-13l5-5a9 9 0 0 1 13 0l20 20a9 9 0 0 1 0 13l-5 5a9 9 0 0 1-13 0z" ${IC(c)}/>
  <path d="M23 20l21 21-8 8-21-21z" fill="${c}" opacity=".3"/>
  <path d="M27 27l2.5 2.5M34 26l2.5 2.5M28 34l2.5 2.5M35 33l2.5 2.5" ${IC(c)}/>
  <path d="M9 58h46" ${IC(c)}/></svg>`,
 /* 테두리 안의 넷, 밖의 하나 */
 nation:(c)=>`<svg viewBox="0 0 64 64">
  <circle cx="26" cy="26" r="18" fill="${c}" opacity=".3"/>
  <circle cx="26" cy="26" r="18" ${IC(c)}/>
  <circle cx="19" cy="23" r="2.8" fill="${c}"/><circle cx="29" cy="18" r="2.8" fill="${c}"/>
  <circle cx="33" cy="30" r="2.8" fill="${c}"/><circle cx="22" cy="34" r="2.8" fill="${c}"/>
  <circle cx="54" cy="21" r="3.6" ${IC(c)}/>
  <path d="M9 58h46" ${IC(c)}/></svg>`,
 /* 로봇 팔이 부품 하나를 쥔다 */
 cobot:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M14 46V26l14-8" ${IC(c)}/>
  <circle cx="14" cy="46" r="3.5" ${IC(c)}/><circle cx="14" cy="26" r="3.5" ${IC(c)}/>
  <path d="M28 12l6 3M28 24l6-3" ${IC(c)}/>
  <rect x="34" y="10" width="18" height="16" rx="3" fill="${c}" opacity=".3"/>
  <rect x="34" y="10" width="18" height="16" rx="3" ${IC(c)}/>
  <path d="M9 58h46" ${IC(c)}/></svg>`,
 /* 이름표가 붙은 병 */
 needs:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M27 8h10v8c0 4 8 5 8 13v19a3 3 0 0 1-3 3H22a3 3 0 0 1-3-3V29c0-8 8-9 8-13z" ${IC(c)}/>
  <path d="M19 30h26v12H19z" fill="${c}" opacity=".3"/>
  <path d="M19 30h26M19 42h26" ${IC(c)}/>
  <path d="M9 58h46" ${IC(c)}/></svg>`,
};

/* ── 유닛 캐스팅: 한 배너 안에서 top·hair 가 겹치지 않는다 ── */
const CAST = {
 walker:  { hair:"short", hairc:"#2B2926", skin:"light", top:"tee" },
 shoveler:{ hair:"cap",   hairc:"#3A2E2A", skin:"tan",   top:"hoodie" },
 surgeon: { hair:"bun",   hairc:"#2B2926", skin:"light", top:"apron", glasses:1 },
 patient: { hair:"curly", hairc:"#3A2E2A", skin:"brown", top:"sweater" },
 comer:   { hair:"bob",   hairc:"#6B3A20", skin:"tan",   top:"shirt" },
 leftout: { hair:"buzz",  hairc:"#2B2926", skin:"tan",   top:"hoodie", glasses:1 },
 leaver:  { hair:"wavy",  hairc:"#6B3A20", skin:"light", top:"tee", sleeve:"short" },
 operator:{ hair:"pony",  hairc:"#2B2926", skin:"light", top:"shirt" },
 reader:  { hair:"long",  hairc:"#8A4B25", skin:"light", top:"sweater" },
 shopper: { hair:"bob",   hairc:"#2B2926", skin:"brown", top:"hoodie" },
 passerby:{ hair:"buzz",  hairc:"#B8742F", skin:"light", top:"shirt" },
};

/* 패널: y 18 · h 228 (라벨 기준선 264). 장면 캡션은 SVG 안이 아니라 SCENECAP → figcaption 앞머리 */
const P3 = [{ x:20, y:18, w:186, h:228 }, { x:227, y:18, w:186, h:228 }, { x:434, y:18, w:186, h:228 }];
const PA = { x:20, y:18, w:270, h:228 }, PB = { x:350, y:18, w:270, h:228 };   // 패널 사이 60 (노트 40 + 여백 10·10)
const FLOOR = 236;                                   // 인물 발밑 바닥선 (패널 바닥 246 − 10)
const BAND  = 204;                                   // 벽/바닥 경계
const DESK  = 192;                                   // 상판 윗선

/* 방(패널 + 바닥 띠 + 바닥선) 한 벌 */
const room = (P, c, t, d, n, label) => `${panel(Object.assign({ c:d, t, n, label }, P))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, P))}
  ${ground({ x1:P.x+14, x2:P.x+P.w-14, y:FLOOR, c:d, w:SW.hair })}`;
/* 소품 공통: 흰 바탕 + 잉크 외곽 1.8 (kit.prop 과 같은 선) */
const OP = (fill, w = 1.8) => `fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const LN = (col, w) => `stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const shadow = (x, w) => `<ellipse cx="${x}" cy="${FLOOR + 2}" rx="${w / 2}" ry="4" fill="${INK}" opacity=".08"/>`;
/* 작은 책상 / 작업대: 두께 6 상판 + 다리 2 + 바닥 그림자 */
const desk = (x, w, c, d, t, top = DESK) => `${shadow(x + w / 2, w - 12)}
  <path d="M${x + 10} ${top + 6}V${FLOOR}M${x + w - 10} ${top + 6}V${FLOOR}" ${LN(d, SW.line)}/>
  <rect x="${x}" y="${top}" width="${w}" height="6" rx="2" fill="${mix(t, d, .18)}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>`;

/* ── 소품 ── */
/* 눈송이: 여섯 갈래 */
const flake = (x, y, r, c, w = SW.line) => {
  const a = r * .866, b = r * .5;
  return `<path d="M${x} ${y - r}V${y + r}M${x - a} ${y - b}L${x + a} ${y + b}M${x - a} ${y + b}L${x + a} ${y - b}" ${LN(c, w)}/>`;
};
/* 쌓인 눈: 인물 뒤가 아니라 앞에 그려 발목·허리까지 묻는 깊이를 보인다 */
const drift = (x, w, h, d) => `<path d="M${x - w / 2} ${FLOOR} C${x - w / 4} ${FLOOR - h} ${x + w / 6} ${FLOOR - h} ${x + w / 2} ${FLOOR} z" fill="#fff" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>
  <path d="M${x - w / 5} ${FLOOR - h * .52} q${w * .14} ${-h * .16} ${w * .28} ${-h * .03}" ${LN(LIGHT, SW.hair)}/>`;
/* 벽걸이 달력: 머리띠 + 고리 2 + 7열 × 3행. marks 칸은 accent 채움 + 흰 눈송이 */
const cal = (x, y, c, d, t, marks) => `<g>
  <rect x="${x - 40}" y="${y - 30}" width="80" height="60" rx="3" ${OP("#fff")}/>
  <rect x="${x - 40}" y="${y - 30}" width="80" height="11" rx="3" fill="${d}"/><rect x="${x - 40}" y="${y - 25}" width="80" height="6" fill="${d}"/>
  <path d="M${x - 22} ${y - 35}v9M${x + 22} ${y - 35}v9" ${LN(INK, 1.8)}/>
  ${[0, 1, 2].map(r => [0, 1, 2, 3, 4, 5, 6].map(i => {
    const n = r * 7 + i, cx = x - 33.5 + i * 10.6, cy = y - 14 + r * 15;
    return `<rect x="${cx - 4.5}" y="${cy - 6}" width="9" height="12" rx="1.5" fill="${marks.includes(n) ? c : t}"/>`
      + (marks.includes(n) ? flake(cx, cy, 3.2, "#fff", 1.3) : "");
  }).join("")).join("")}</g>`;
/* 이젤 도판: 흰 판 + 다리 2 */
const board = (x, y, w, h, d, inner) => `<g>${shadow(x, w - 8)}
  <path d="M${x - w / 2 + 18} ${y + h / 2}V${FLOOR}M${x + w / 2 - 18} ${y + h / 2}V${FLOOR}" ${LN(d, SW.line)}/>
  <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="4" ${OP("#fff")}/>
  ${inner}</g>`;
/* 상처 도해 — "open": 아직 벌어진 흰 자리 + 양쪽에서 미는 화살 2 / "closed": 가장자리 세포가 모여 이음매를 채웠다 */
const wound = (x, y, c, t, d, kind) => {
  const H = 25;
  const skin = `<rect x="${x - 46}" y="${y - H}" width="92" height="${H * 2}" rx="7" fill="${mix(t, d, .10)}" stroke="${INK}" stroke-width="1.8"/>`;
  if (kind === "open") return `${skin}
    <path d="M${x} ${y - H} C${x - 10} ${y - H * .35} ${x - 10} ${y + H * .35} ${x} ${y + H} C${x + 10} ${y + H * .35} ${x + 10} ${y - H * .35} ${x} ${y - H} z" ${OP("#fff")}/>
    ${arrow({ x1:x - 40, y1:y, x2:x - 17, y2:y, c:d })}
    ${arrow({ x1:x + 40, y1:y, x2:x + 17, y2:y, c:d })}`;
  return `${skin}
    <path d="M${x} ${y - H + 1} C${x - 3.6} ${y - H * .35} ${x - 3.6} ${y + H * .35} ${x} ${y + H - 1} C${x + 3.6} ${y + H * .35} ${x + 3.6} ${y - H * .35} ${x} ${y - H + 1} z" fill="${c}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
    ${[-16, 0, 16].map(dy => `<circle cx="${x - 12}" cy="${y + dy}" r="5.5" fill="${c}"/>`).join("")}
    ${[-8, 8].map(dy => `<circle cx="${x + 12}" cy="${y + dy}" r="5.5" fill="${c}"/>`).join("")}
    <circle cx="${x + 26}" cy="${y - 17}" r="5.5" fill="${c}" opacity=".38"/>
    <circle cx="${x - 27}" cy="${y + 17}" r="5.5" fill="${c}" opacity=".38"/>`;
};
/* 아치문: "open" = 지나갈 수 있는 흰 통로 · "closed" = 벽돌로 막히고 그 자리에 계보 판이 걸린다 */
const gate = (x, c, d, t, kind) => {
  const wall = `<path d="M${x - 44} ${FLOOR}V${FLOOR - 84}a44 44 0 0 1 88 0V${FLOOR}z" fill="${mix(t, d, .12)}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M${x - 44} ${FLOOR - 42}h88M${x - 44} ${FLOOR - 66}h18M${x + 26} ${FLOOR - 66}h18M${x - 44} ${FLOOR - 18}h20M${x + 24} ${FLOOR - 18}h20" ${LN(LIGHT, SW.hair)}/>`;
  const arch = `M${x - 22} ${FLOOR}V${FLOOR - 62}a22 22 0 0 1 44 0V${FLOOR}z`;
  if (kind === "open") return `${wall}
    <path d="${arch}" ${OP("#fff")}/>
    <path d="M${x - 18} ${FLOOR - 8}h36" ${LN(LIGHT, SW.hair)}/>
    <path d="M${x - 15} ${FLOOR - 1}h30" ${LN(c, SW.line)}/>`;
  /* 벽돌로 채운 통로 + 계보 판 (조부모 두 원 → 아래 한 원) */
  return `${wall}
    <path d="${arch}" fill="${mix(t, d, .3)}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M${x - 12} ${FLOOR - 80}h24M${x - 21} ${FLOOR - 16}h42M${x - 21} ${FLOOR - 6}h42" ${LN("#fff", SW.hair)}/>
    <path d="M${x} ${FLOOR - 16}v-8M${x - 10} ${FLOOR - 6}v-10M${x + 10} ${FLOOR - 6}v-10" ${LN("#fff", SW.hair)}/>
    <rect x="${x - 21}" y="${FLOOR - 72}" width="42" height="48" rx="4" ${OP("#fff")}/>
    <path d="M${x - 11} ${FLOOR - 60}V${FLOOR - 36}" ${LN(d, SW.line)}/>
    ${[0, 1, 2].map(i => `<circle cx="${x - 11}" cy="${FLOOR - 60 + i * 12}" r="4.5" fill="${i === 2 ? c : "#fff"}" stroke="${d}" stroke-width="${SW.line}"/>
      <path d="M${x - 4} ${FLOOR - 60 + i * 12}h${[13, 10, 13][i]}" ${LN(i === 2 ? c : LIGHT, SW.line)}/>`).join("")}`;
};
/* 로봇 팔: 받침 + 두 마디 + 집게 */
const robot = (x, y, s, c, d) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-17" y="-11" width="34" height="11" rx="3" fill="${d}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M0-11V-48L28-38" ${LN(INK, 12.6)}/><path d="M0-11V-48L28-38" ${LN(c, 10.8)}/>
  <circle cx="0" cy="-48" r="6" ${OP("#fff")}/><circle cx="0" cy="-11" r="5" ${OP("#fff")}/>
  <path d="M25-45l12 3M25-32l12-3" ${LN(INK, 3.6)}/></g>`;
/* 무거운 부품 */
const part = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-18" y="-14" width="36" height="28" rx="3" ${OP(c)}/>
  <path d="M-18-4h36" stroke="#fff" stroke-width="1.6" opacity=".55"/></g>`;
/* 문 (패널 벽에 난 출구) */
const door = (x, c, d, t) => `<g>
  <rect x="${x - 24}" y="${FLOOR - 92}" width="48" height="92" rx="4" fill="${mix(t, d, .12)}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <rect x="${x - 16}" y="${FLOOR - 83}" width="32" height="75" rx="2" ${OP("#fff")}/>
  <path d="M${x - 4} ${FLOOR - 83}h20v75h-20z" fill="${mix(t, d, .3)}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <circle cx="${x - 1}" cy="${FLOOR - 44}" r="2.6" fill="${d}"/></g>`;
/* 병 (드는 소품) — hw·hh 를 달아 holding() 이 손목을 잡는다 */
const bottleBody = c => `<path d="M-5-22h10v9q0 3 4 5.5t4 7.5v18q0 3-3 3h-20q-3 0-3-3v-18q0-5 4-7.5t4-5.5z" ${OP("#fff")}/>
  <rect x="-6" y="-28" width="12" height="7" rx="1.5" ${OP(mix(c, INK, .35))}/>
  <rect x="-12" y="-1" width="24" height="14" fill="${c}"/>`;
const bottle = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">${bottleBody(c)}</g>`;
Object.assign(bottle, { hw: 12, hh: 21 });
/* 광고판: 머리기사 띠 + 굳은 얼굴 + 입에서 번지는 호 2 */
const poster = (x, y, c, d, t) => `<g>${shadow(x, 62)}
  <path d="M${x - 26} ${y + 46}V${FLOOR}M${x + 26} ${y + 46}V${FLOOR}" ${LN(d, SW.line)}/>
  <rect x="${x - 38}" y="${y - 46}" width="76" height="92" rx="4" ${OP("#fff")}/>
  <rect x="${x - 30}" y="${y - 38}" width="60" height="11" rx="2" fill="${d}"/>
  <circle cx="${x - 8}" cy="${y + 2}" r="19" fill="${t}" stroke="${INK}" stroke-width="1.8"/>
  <circle cx="${x - 15}" cy="${y - 3}" r="2" fill="${INK}"/><circle cx="${x - 2}" cy="${y - 3}" r="2" fill="${INK}"/>
  <path d="M${x - 14} ${y + 11}q6-5 12 0" ${LN(INK, 1.8)}/>
  <path d="M${x + 12} ${y + 6}q7 6 0 12M${x + 20} ${y + 1}q10 9 0 21" ${LN(c, SW.line)}/>
  <path d="M${x - 30} ${y + 30}h44M${x - 30} ${y + 38}h30" ${LN(LIGHT, SW.line)}/></g>`;
/* 가게 진열대 + 병 두 개 */
const counter = (x, w, c, d, t, top = 176) => `<g>${desk(x, w, c, d, t, top)}
  ${bottle(x + w * .3, top - 18, .82, c)}${bottle(x + w * .68, top - 18, .82, c)}</g>`;

const scenes = {
 /* 56 — 템플릿 A: 달력의 눈 오는 날은 여덟에서 셋으로, 발밑의 눈은 발목에서 허리로 */
 blizzard:(c,t,d)=>{
  const p1 = Object.assign({ x:92, y:FLOOR, s:1, c, pose:"point", face:"smile", brow:"soft", look:3, head:3 }, CAST.walker);
  const p2 = Object.assign({ x:418, y:FLOOR, s:1, c:d, pose:"open", face:"oh", brow:"up", look:3, head:-4 }, CAST.shoveler);
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(PA, c, t, d, 1, "찬 공기 — 자주, 조금씩")}
  ${cal(222, 88, c, d, t, [1,2,4,7,9,12,15,17])}
  ${[[44,146],[50,96],[132,60],[142,120],[272,150],[280,102]].map(([x,y])=>flake(x, y, 5, c, 1.6)).join("")}
  ${person(p1)}
  ${drift(140, 176, 30, d)}
  ${room(PB, c, t, d, 2, "따뜻한 공기 — 드물게, 한꺼번에")}
  ${cal(552, 84, c, d, t, [3,10,16])}
  ${[[374,72],[476,50],[494,124]].map(([x,y])=>flake(x, y, 11, c, SW.line)).join("")}
  ${person(p2)}
  ${drift(470, 190, 58, d)}
  ${note({ x:300, y:78, w:40, h:40, lines:["+1℃","+7%"], c:d, tint:t })}
  ${arrow({ x1:302, y1:136, x2:338, y2:136, c:d })}</svg>`; },

 /* 57 — 템플릿 A: 의학은 벌어진 자리를 양쪽에서 맞대 준다 / 몸은 가장자리 세포를 안으로 보내 이음매를 채운다 */
 healing:(c,t,d)=>{
  const p1 = Object.assign({ x:88, y:FLOOR, s:1, c, pose:"point", face:"smile", brow:"soft", look:3, head:-3 }, CAST.surgeon);
  const p2 = Object.assign({ x:418, y:FLOOR, s:1, c:d, pose:"down", face:"glad", brow:"up", look:3, head:5 }, CAST.patient);
  const m1 = anchors(p1).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(PA, c, t, d, 1, "의학 — 가장자리를 맞대 준다")}
  ${board(216, 162, 126, 82, d, wound(216, 162, c, t, d, "open"))}
  ${person(p1)}
  ${bubble({ x:130, y:58, w:130, h:48, lines:["맞대 주는 데까지가","내 일이다"], c:d, lvl:2, to:{ x:m1.x+18, y:m1.y } })}
  ${room(PB, c, t, d, 2, "몸 — 세포가 만나 붙인다")}
  ${board(546, 162, 126, 82, d, wound(546, 162, c, t, d, "closed"))}
  ${person(p2)}
  ${thought({ x:444, y:26, w:136, h:46, lines:["나는 아무것도","시키지 않았다"], c:d, side:"l", lvl:2 })}
  ${note({ x:300, y:84, w:40, h:28, lines:["분업"], c:d, tint:t })}
  ${arrow({ x1:302, y1:132, x2:338, y2:132, c:d })}</svg>`; },

 /* 58 — 템플릿 A: 법 문서를 들고 지나가는 문 / 벽돌로 막히고 계보가 걸린 같은 문 */
 nation:(c,t,d)=>{
  const p1 = Object.assign({ x:110, y:FLOOR, s:1, c, legs:"walk", face:"glad", brow:"up", look:3, head:-3 }, CAST.comer);
  const p2 = Object.assign({ x:560, y:FLOOR, s:1, c:d, pose:"shrug", face:"worry", brow:"down", look:-4, head:4, flip:1 }, CAST.leftout);
  const m1 = anchors(p1).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(PA, c, t, d, 1, "시민적 — 지나갈 수 있는 문")}
  ${gate(228, c, d, t, "open")}
  ${holding(p1, prop.paper, 1.05, { one:"L", R:"down" })}
  ${arrow({ x1:152, y1:224, x2:202, y2:224, c:d })}
  ${bubble({ x:152, y:84, w:128, h:42, lines:["법을 받아들인다"], c:d, lvl:2, to:{ x:m1.x+20, y:m1.y } })}
  ${room(PB, c, t, d, 2, "종족적 — 물려받아야 하는 문")}
  ${gate(438, c, d, t, "closed")}
  ${person(p2)}
  ${thought({ x:412, y:24, w:132, h:46, lines:["내 조부모를","다시 쓸 수는 없다"], c:d, side:"r", lvl:2 })}
  ${note({ x:300, y:78, w:40, h:40, lines:["두","판본"], c:d, tint:t })}
  ${arrow({ x1:302, y1:136, x2:338, y2:136, c:d, dash:1 })}</svg>`; },

 /* 59 — 템플릿 A: 옛 이야기(로봇만 남고 사람은 문으로 나간다) / 지금(한 작업대를 점선이 가른다) */
 cobot:(c,t,d)=>{
  const p1 = Object.assign({ x:200, y:FLOOR, s:1, c, legs:"walk", face:"worry", brow:"down", look:4, head:-4 }, CAST.leaver);
  const p2 = Object.assign({ x:578, y:FLOOR, s:1, c:d, pose:"point", face:"smile", brow:"soft", look:3, head:4, flip:1 }, CAST.operator);
  const m2 = anchors(p2).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(PA, c, t, d, 1, "옛 이야기 — 사람이 떠난다")}
  ${desk(38, 106, c, d, t)}
  ${robot(84, DESK, 1, c, d)}
  ${door(264, c, d, t)}
  ${person(p1)}
  ${thought({ x:44, y:38, w:130, h:46, lines:["여기 내 자리는","이제 없다"], c:d, side:"r", lvl:2 })}
  ${room(PB, c, t, d, 2, "지금 — 작업대를 나눠 쓴다")}
  ${desk(376, 150, c, d, t)}
  ${part(470, DESK - 44, 1, c)}
  ${robot(420, DESK, 1, c, d)}
  <path d="M512 120V${FLOOR}" stroke="${d}" stroke-width="${SW.line}" stroke-dasharray="${DASH}" stroke-linecap="round"/>
  ${person(p2)}
  ${bubble({ x:400, y:64, w:128, h:44, lines:["어디로 갈지는 내가"], c:d, lvl:2, to:{ x:m2.x-20, y:m2.y } })}
  ${note({ x:300, y:78, w:40, h:40, lines:["나누는","선"], c:d, tint:t })}
  ${arrow({ x1:302, y1:136, x2:338, y2:136, c:d })}</svg>`; },

 /* 60 — 템플릿 B: 사전 속에 조용히 있던 낱말 → 광고판이 그것을 불안으로 옮긴다 → 손에 든 병이 된다 */
 needs:(c,t,d)=>{
  const s = .85, y = FLOOR;
  const p1 = Object.assign({ x:66, y, s, c, legs:"walk", face:"smile", brow:"soft", look:-2, head:3 }, CAST.passerby);
  const p2 = Object.assign({ x:268, y, s, c:d, pose:"think", face:"worry", brow:"up", look:3, head:5 }, CAST.reader);
  const p3 = Object.assign({ x:488, y, s, c, face:"glad", brow:"up", look:3, head:-3 }, CAST.shopper);
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(P3[0], c, t, d, 1, "1900 — 사전 속의 낱말")}
  ${desk(118, 76, c, d, t)}
  ${prop.book(156, DESK - 20, 1.3, c)}
  ${tag({ x:156, y:138, text:"halitosis", c:d, fill:"#fff" })}
  ${person(p1)}
  ${room(P3[1], c, t, d, 2, "1920년대 — 광고가 옮긴다")}
  ${poster(364, 128, c, d, t)}
  ${person(p2)}
  ${room(P3[2], c, t, d, 3, "오늘 — 없으면 안 되는 것")}
  ${counter(538, 74, c, d, t)}
  ${holding(p3, bottle, 1.15)}</svg>`; },
};

/* 장면 캡션 1줄: build.js 가 figcaption 앞머리에 '<b>Figure N</b> 캡션 — (units 의 fig 설명)' 으로 찍는다 */
const SCENECAP = {
 blizzard: "눈 오는 날은 줄고, 한 번에 오는 눈은 늘었다",
 healing: "맞대 주는 쪽과 붙이는 쪽",
 nation: "지나갈 수 있는 문, 물려받아야 하는 문",
 cobot: "무거운 쪽은 팔에게, 정하는 쪽은 사람에게",
 needs: "사전 속의 낱말이 손 안의 필요가 되기까지",
};

/* 비네트 캡션: KB 제목을 되풀이하지 않고 도해가 가리키는 사실 하나를 적는다 */
const VIGCAP = {
 "56": "기온 1도에 수증기 용량 약 7퍼센트",
 "57": "지혈 · 염증 · 증식 · 재형성의 네 단계",
 "58": "민족 자결 뒤에도 남은 소수 집단",
 "59": "속도와 힘을 제한해 사람 곁에 둔다",
 "60": "매출은 7년 만에 80배가 되었다",
};

const STRIP = {
 "56":["nope","fire","ruler","swap","ask"],
 "57":["sprout","handshake","hourglass","letters","pair"],
 "58":["chat","balance","seed","fire","map"],
 "59":["alone","gear","ruler","shield","wilt"],
 "60":["brain","tag","quote","coin","ask"]
};

/* ── 비네트(240×150 → 45mm): 인물 없이 소품 도해 1개 — 글자는 lvl "v"(칩) · "vs"(라벨) 만, SVG 안 제목 없음 ── */
const dropMark = (x, y, c, s = 1) => `<path d="M${x} ${y - 6 * s}c${3 * s} ${3.4 * s} ${4.2 * s} ${5.4 * s} ${4.2 * s} ${7 * s}a${4.2 * s} ${4.2 * s} 0 0 1 ${-8.4 * s} 0c0-${1.6 * s} ${1.2 * s}-${3.6 * s} ${4.2 * s}-${7 * s}z" fill="${c}"/>`;
const VIG = {
 /* 같은 크기의 공기 상자 둘 — 찬 공기는 물방울 셋, 따뜻한 공기는 여덟 */
 "56":(c,t,d)=>{
  const jar = (cx, cy, drops) => `<rect x="${cx - 37}" y="${cy - 31}" width="74" height="62" rx="7" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
    <path d="M${cx - 37} ${cy + 20}h74" stroke="${LIGHT}" stroke-width="${SW.hair}"/>
    ${drops.map(([dx, dy]) => dropMark(cx + dx, cy + dy, c)).join("")}`;
  return `<svg viewBox="0 0 240 150" fill="none">
  ${jar(62, 76, [[-16, -6], [2, 10], [18, -12]])}
  ${jar(178, 76, [[-22, -12], [-6, 2], [10, -10], [24, 6], [-16, 16], [4, -18], [20, -22], [-2, 20]])}
  ${arrow({ x1:104, y1:76, x2:136, y2:76, c:d })}
  ${tag({ x:62, y:24, text:"찬 공기", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:178, y:24, text:"따뜻한 공기", c:d, lvl:"v" })}
  ${text(62, 142, "적게 머금는다", "vs", MID)}
  ${text(178, 142, "더 머금는다", "vs", MID)}</svg>`; },
 /* 벌어진 자리가 네 걸음에 걸쳐 닫힌다 — 마지막 칸에서 세포가 만나 멈춘다 */
 "57":(c,t,d)=>{
  const step = (cx, gap, cells) => `<rect x="${cx - 23}" y="24" width="46" height="46" rx="6" fill="${t}" stroke="${INK}" stroke-width="1.8"/>
    ${gap ? `<path d="M${cx} 24 C${cx - gap} 38 ${cx - gap} 56 ${cx} 70 C${cx + gap} 56 ${cx + gap} 38 ${cx} 24 z" fill="#fff" stroke="${INK}" stroke-width="1.6"/>`
          : `<path d="M${cx} 28V66" stroke="${c}" stroke-width="${SW.line}" stroke-linecap="round"/>`}
    ${cells.map(([dx, cy]) => `<circle cx="${cx + dx}" cy="${cy}" r="4" fill="${c}"/>`).join("")}`;
  return `<svg viewBox="0 0 240 150" fill="none">
  ${step(35, 11, [])}
  ${step(91, 6, [[-12, 38], [12, 56]])}
  ${step(147, 3, [[-9, 35], [9, 47], [-9, 59]])}
  ${step(203, 0, [[-8, 33], [8, 44], [-8, 55], [8, 65]])}
  ${arrow({ x1:18, y1:88, x2:218, y2:88, c:d })}
  ${text(35, 108, "벌어짐", "vs", MID)}
  ${text(203, 108, "닫힘", "vs", MID)}
  ${tag({ x:120, y:132, text:"닫히는 순서", c:d, lvl:"v" })}</svg>`; },
 /* 다시 그은 국경 — 선 양쪽에 두 집단이 섞여 남는다 */
 "58":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="16" y="14" width="208" height="84" rx="6" fill="${t}" stroke="${d}" stroke-width="${SW.hair}"/>
  <path d="M120 14V98" stroke="${d}" stroke-width="${SW.line}" stroke-dasharray="${DASH}"/>
  ${[[44, 38], [70, 62], [48, 84], [96, 48], [200, 84], [142, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${c}"/>`).join("")}
  ${[[150, 40], [180, 64], [198, 38], [162, 88], [90, 82], [66, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>`).join("")}
  ${tag({ x:120, y:118, text:"다시 그은 국경", c:d, lvl:"v" })}
  ${text(120, 144, "어느 쪽에도 남는 사람이 있다", "vs", MID)}</svg>`,
 /* 같은 로봇 팔 둘 — 울타리 안 / 울타리 없이 */
 "59":(c,t,d)=>{
  const bench = (cx, w) => `<rect x="${cx - w / 2}" y="80" width="${w}" height="6" rx="2" fill="${mix(t, d, .18)}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>
    <path d="M${cx - w / 2 + 10} 86v16M${cx + w / 2 - 10} 86v16" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>`;
  const arm = cx => `<g transform="translate(${cx} 80) scale(.72)">
    <rect x="-17" y="-11" width="34" height="11" rx="3" fill="${d}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M0-11V-48L28-38" ${LN(INK, 12.6)}/><path d="M0-11V-48L28-38" ${LN(c, 10.8)}/>
    <circle cx="0" cy="-48" r="6" ${OP("#fff")}/><circle cx="0" cy="-11" r="5" ${OP("#fff")}/>
    <path d="M25-45l12 3M25-32l12-3" ${LN(INK, 3.6)}/></g>`;
  return `<svg viewBox="0 0 240 150" fill="none">
  ${bench(58, 92)}${arm(44)}
  ${[16, 38, 60, 82, 100].map(x => `<path d="M${x} 14V80" stroke="${MID}" stroke-width="${SW.hair}"/>`).join("")}
  <path d="M16 14h84" stroke="${MID}" stroke-width="${SW.line}" stroke-linecap="round"/>
  ${bench(178, 92)}${arm(164)}
  ${tag({ x:58, y:124, text:"울타리 안", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:178, y:124, text:"울타리 없이", c:d, lvl:"v" })}</svg>`; },
 /* 같은 병, 이름만 바뀐다 — 바닥 세정제 → 구강 청결제 */
 "60":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <g transform="translate(64 78) scale(1.55)">${bottleBody(LIGHT)}</g>
  <g transform="translate(176 78) scale(1.55)">${bottleBody(c)}</g>
  ${arrow({ x1:100, y1:70, x2:136, y2:70, c:d })}
  ${tag({ x:64, y:20, text:"바닥 세정제", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:176, y:20, text:"구강 청결제", c:d, lvl:"v" })}
  ${text(120, 144, "같은 병, 이름만 바뀌었다", "vs", MID)}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG, VIGCAP, SCENECAP };
