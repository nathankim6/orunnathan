/* Unit 4 삽화 — 정돈된 도해 (디자인 시스템 A · 의학·건강)
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64
   구도 템플릿: A 2패널 비교(x 20/350 w 270 h 228) · B 3패널 순서(칩 1–3, s .85) · C 단일 도해(프레임 + 리더선 콜아웃 ≤2 + 점선 상자)
   장면 캡션은 SVG 안에 두지 않고 SCENECAP → figcaption 앞머리 한 줄로 찍는다 (그림 안 글자는 패널 라벨·풍선·보조 라벨뿐)
   색: accent(c) · deep(d) · tint(t) + 잉크/회색 2단 + 흰색. 노랑 없음. */
const K = require("../kit.js");
const { person, holding, anchors, bubble, note, panel, arrow, callout, tag, text, prop, ground, floorBand, mix, INK, MID, LIGHT, SW, DASH } = K;

/* ── 레슨 아이콘: 선화 stroke 3 round · 라이브 48×48(패딩 8) · 면 채움은 accent 30% 한 곳 ── */
const IC = c => `stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
 /* 시계: 12시→3시 부채꼴 한 곳 채움 = '옮겨진 시간' */
 clock:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M32 34V15a19 19 0 0 1 19 19z" fill="${c}" opacity=".3"/>
  <circle cx="32" cy="34" r="19" ${IC(c)}/>
  <path d="M32 34V19M32 34h11" ${IC(c)}/>
  <path d="M28 9h8M32 9v6" ${IC(c)}/>
  <path d="M32 50v3M16 34h3M45 34h3" ${IC(c)}/></svg>`,
 /* 메스: 날 한 곳 채움 + 봉합 자국 */
 surgery:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M30 34l14-14q7-5 12 0l-3 3-14 14z" fill="${c}" opacity=".3"/>
  <path d="M30 34l14-14q7-5 12 0l-3 3-14 14z" ${IC(c)}/>
  <path d="M30 34L12 52M27 31L9 49" ${IC(c)}/>
  <path d="M12 52q-3 2-3-3" ${IC(c)}/>
  <path d="M42 46l6 6M48 46l-6 6M50 38l6 6M56 38l-6 6" ${IC(c)}/></svg>`,
 /* 바이러스: 껍질 원 채움 + 돌기 8 */
 virus:(c)=>`<svg viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="12" fill="${c}" opacity=".3"/>
  <circle cx="32" cy="32" r="12" ${IC(c)}/>
  <path d="M32 20v-6M32 44v6M20 32h-6M44 32h6M23.5 23.5l-4.2-4.2M40.5 40.5l4.2 4.2M40.5 23.5l4.2-4.2M23.5 40.5l-4.2 4.2" ${IC(c)}/>
  <circle cx="32" cy="11" r="2.5" ${IC(c)}/><circle cx="32" cy="53" r="2.5" ${IC(c)}/>
  <circle cx="11" cy="32" r="2.5" ${IC(c)}/><circle cx="53" cy="32" r="2.5" ${IC(c)}/></svg>`,
 /* 펌프: 물방울 한 곳 채움 */
 wall:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M19 40c-4 6-4 10 0 10s4-4 0-10z" fill="${c}" opacity=".3"/>
  <path d="M19 40c-4 6-4 10 0 10s4-4 0-10z" ${IC(c)}/>
  <path d="M28 22h12v30H28z" ${IC(c)}/>
  <path d="M24 22h20M28 30h-9v6" ${IC(c)}/>
  <path d="M40 24l14-9" ${IC(c)}/>
  <path d="M12 54h40" ${IC(c)}/></svg>`,
 /* 배터리: 남은 한 칸 채움 */
 burnout:(c)=>`<svg viewBox="0 0 64 64">
  <rect x="9" y="22" width="42" height="20" rx="4" ${IC(c)}/>
  <path d="M51 28h4v8h-4" ${IC(c)}/>
  <rect x="13" y="26" width="8" height="12" rx="1.5" fill="${c}" opacity=".3"/>
  <path d="M30 26v12M40 26v12" ${IC(c)} stroke-dasharray="1 4"/></svg>`,
};

/* ── 유닛 캐스팅: 배너 안 인물이 서로 다르게 ── */
const CAST = {
 traveler: { hair:"cap",   hairc:"#2B2926", skin:"tan",   top:"hoodie" },
 sleepy:   { hair:"bob",   hairc:"#6B3A20", skin:"light", top:"sweater" },
 fastdoc:  { hair:"cap",   hairc:"#3A2E2A", skin:"light", top:"apron" },
 halsted:  { hair:"short", hairc:"#7C7C82", skin:"light", top:"shirt", glasses:1 },
 senior:   { hair:"bun",   hairc:"#2B2926", skin:"tan",   top:"sweater" },
 junior:   { hair:"curly", hairc:"#3A2E2A", skin:"brown", top:"tee", sleeve:"short" },
 snow:     { hair:"wavy",  hairc:"#6B3A20", skin:"light", top:"shirt", glasses:1 },
 council:  { hair:"long",  hairc:"#8A4B25", skin:"tan",   top:"hoodie" },
 resident: { hair:"short", hairc:"#2B2926", skin:"light", top:"tee" },
 tired:    { hair:"pony",  hairc:"#3A2E2A", skin:"tan",   top:"shirt" },
 giver:    { hair:"twin",  hairc:"#8A4B25", skin:"light", top:"sweater" },
 taker:    { hair:"buzz",  hairc:"#2B2926", skin:"brown", top:"tee", sleeve:"short" },
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
/* 패널 바닥 세트(템플릿 A): 틴트 띠 + 바닥선 */
const floorSet = (P, d, t) => `${floorBand(Object.assign({ top:BAND, t, line:0 }, P))}
  ${ground({ x1:P.x+14, x2:P.x+P.w-14, y:FLOOR, c:d, w:SW.hair })}`;

/* 벽시계: r 반지름 · wedge(도) 만큼 12시부터 시계 방향 부채꼴(틴트보다 한 단 진한 면) · dash 면 점선 테두리(몸속 시계) */
const wclock = (x, y, r, c, d, o = {}) => {
  const w = o.wedge || 0, a = w * Math.PI / 180, ri = r - 5;
  const hx = Math.sin(a) * ri * .72, hy = -Math.cos(a) * ri * .72;
  return `<g transform="translate(${x} ${y})">
  <circle r="${r}" fill="#fff" stroke="${d}" stroke-width="${SW.line}"${o.dash ? ` stroke-dasharray="${DASH}"` : ""}/>
  ${w ? `<path d="M0 0V${-ri}A${ri} ${ri} 0 ${w > 180 ? 1 : 0} 1 ${(Math.sin(a) * ri).toFixed(1)} ${(-Math.cos(a) * ri).toFixed(1)}z" fill="${mix(c, "#fff", .62)}"/>` : ""}
  <path d="M0 ${-r + 3}v4M0 ${r - 3}v-4M${-r + 3} 0h4M${r - 3} 0h-4" stroke="${d}" stroke-width="${SW.hair}" stroke-linecap="round"/>
  <path d="M0 0V${-ri * .72}M0 0L${hx.toFixed(1)} ${hy.toFixed(1)}" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
  <circle r="2.4" fill="${d}"/></g>`;
};
/* 바퀴 달린 여행 가방 (바닥에 놓는 소품) */
const suitcase = (x, y, c, d) => `<g transform="translate(${x} ${y})">
  <ellipse cx="0" cy="2" rx="16" ry="3.5" fill="${INK}" opacity=".08"/>
  <path d="M-6 -46v-10q0-3 3-3h6q3 0 3 3v10" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
  <rect x="-13" y="-46" width="26" height="44" rx="4" fill="${c}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M-13 -30h26M-13 -18h26" stroke="${d}" stroke-width="1.4" opacity=".7"/>
  <circle cx="-8" cy="-1" r="3" fill="${INK}"/><circle cx="8" cy="-1" r="3" fill="${INK}"/></g>`;
/* 얇은 고무장갑 (드는 소품 · 손가락 위) — hw 12 · hh 20 */
const glove = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  ${[[-7, 12], [-2, 15], [3, 14], [8, 11]].map(([fx, l]) => `<path d="M${fx} -2v${-l}" stroke="${INK}" stroke-width="7.3" stroke-linecap="round"/><path d="M${fx} -2v${-l}" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/>`).join("")}
  <path d="M-10 0l-8-8" stroke="${INK}" stroke-width="7.3" stroke-linecap="round"/><path d="M-10 0l-8-8" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/>
  <rect x="-11" y="-4" width="22" height="18" rx="5" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
  <rect x="-13" y="12" width="26" height="8" rx="2" fill="${mix(c, "#fff", .72)}" stroke="${INK}" stroke-width="1.8"/></g>`;
Object.assign(glove, { hw: 12, hh: 20 });
/* 바이러스: 단백질 껍질(원) + 돌기 + 안의 설명서(접힌 종이) */
const virus = (x, y, r, c, d, plan = 1) => `<g transform="translate(${x} ${y})">
  ${Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5 + .3, ex = Math.cos(a) * (r + 8), ey = Math.sin(a) * (r + 8);
    return `<path d="M${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/><circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="${r * .17}" fill="${c}"/>`; }).join("")}
  <circle r="${r}" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
  ${plan ? `<rect x="${-r * .42}" y="${-r * .5}" width="${r * .84}" height="${r}" rx="2" fill="#fff" stroke="${INK}" stroke-width="1.6"/>
  <path d="M${-r * .25} ${-r * .25}h${r * .5}M${-r * .25} 0h${r * .5}M${-r * .25} ${r * .25}h${r * .3}" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>` : ""}</g>`;
/* 톱니바퀴 (세포 안의 '빌린 기계') */
const gear = (x, y, r, d, t, n = 8) => `<g transform="translate(${x} ${y})">
  ${Array.from({ length: n }, (_, i) => `<rect x="-4" y="${-r - 6}" width="8" height="10" rx="2" fill="${t}" stroke="${d}" stroke-width="${SW.line}" transform="rotate(${i * 360 / n})"/>`).join("")}
  <circle r="${r}" fill="${t}" stroke="${d}" stroke-width="${SW.line}"/><circle r="${r * .4}" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/></g>`;
/* 벽에 건 거리 지도: 거리(LIGHT) + 펌프 + 점(사망) — dots 배열, ring 이면 점선 원 */
const streetMap = (x, y, w, h, c, d, dots, ring) => {
  const px = x + w * .5, py = y + h * .5;
  return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#fff" stroke="${d}" stroke-width="${SW.hair}"/>
  <path d="M${x} ${y + h * .32}h${w}M${x} ${y + h * .68}h${w}M${x + w * .3} ${y}v${h}M${x + w * .66} ${y}v${h}M${x} ${y + h * .1}L${x + w} ${y + h * .58}" stroke="${LIGHT}" stroke-width="${SW.hair}"/>
  <circle cx="${x + 8}" cy="${y + 8}" r="2.4" fill="${d}"/><circle cx="${x + w - 8}" cy="${y + 8}" r="2.4" fill="${d}"/>
  ${dots.map(([dx, dy, r]) => `<circle cx="${px + dx}" cy="${py + dy}" r="${r || 3.4}" fill="${c}"/>`).join("")}
  ${ring ? `<circle cx="${px}" cy="${py}" r="${ring}" fill="none" stroke="${MID}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>` : ""}
  <rect x="${px - 4}" y="${py - 7}" width="8" height="14" rx="1.5" fill="${d}"/>
  ${ring ? `<path d="M${px + 2} ${py - 7}l9-7" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>` : ""}</g>`;
};
/* 실수 곡선 미니 차트: 축 + 곡선 + 점선(17h) */
const errChart = (x, y, w, h, c, d, lab) => `<g>
  <path d="M${x} ${y}V${y + h}H${x + w}" stroke="${d}" stroke-width="${SW.hair}" stroke-linecap="round"/>
  <path d="M${x + 8} ${y + h - 10}c${w * .3} -2 ${w * .45} -4 ${w * .55} -14s${w * .2} -30 ${w * .34} -${h - 22}" stroke="${c}" stroke-width="${SW.bold}" fill="none" stroke-linecap="round"/>
  <path d="M${x + w * .58} ${y + 4}V${y + h}" stroke="${MID}" stroke-width="${SW.hair}" stroke-dasharray="4 3"/>
  ${text(x + w * .58, y - 6, lab, 3, MID)}</g>`;
/* 가슴에 단 훈장 */
const medal = (x, y, c, d) => `<g transform="translate(${x} ${y})">
  <path d="M-5 -14h10l-2 9h-6z" fill="${d}"/>
  <circle r="6.5" fill="${c}" stroke="${INK}" stroke-width="1.6"/><circle r="2.6" fill="#fff"/></g>`;

const scenes = {
 /* 16 — 템플릿 A: 손목시계(한 번에 맞춘다) / 몸속 시계(하루 한 시간씩)
    왼쪽: 착륙한 여행자가 벽시계를 가리킨다 — 실선 시계 + 한 번에 도는 화살
    오른쪽: 밤에 못 자는 사람(think, 고개 5°) — 점선 시계 + 한 칸씩 가는 점 호 */
 clock:(c,t,d)=>{
  const p1 = Object.assign({ x:96, y:FLOOR, s:1, c, pose:"point", face:"glad", brow:"up" }, CAST.traveler, { capc:d });
  const p2 = Object.assign({ x:426, y:FLOOR, s:1, c:d, pose:"think", face:"meh", brow:"low", head:5, look:-2 }, CAST.sleepy);
  const m1 = anchors(p1).mouth, m2 = anchors(p2).mouth;
  const steps = Array.from({ length: 7 }, (_, i) => { const a = (-150 + i * 20) * Math.PI / 180; return `<circle cx="${(554 + Math.cos(a) * 32).toFixed(1)}" cy="${(170 + Math.sin(a) * 32).toFixed(1)}" r="2.6" fill="${d}"/>`; }).join("");
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"손목시계 — 1초면 맞춘다" }, PA))}
  ${floorSet(PA, d, t)}
  ${desk(176, 96, d, t)}
  ${wclock(224, 170, 22, c, d, { wedge: 90 })}
  ${arrow({ x1:200, y1:144, x2:246, y2:140, c:d, curve:-14 })}
  ${suitcase(150, FLOOR, c, d)}
  ${person(p1)}
  ${bubble({ x:146, y:76, w:124, h:46, lines:["착륙! 시계는","벌써 맞췄다"], c:d, to:{ x:m1.x+20, y:m1.y } })}
  ${panel(Object.assign({ c:d, t, n:2, label:"몸속 시계 — 하루에 한 시간" }, PB))}
  ${floorSet(PB, d, t)}
  ${desk(506, 96, d, t)}
  ${wclock(554, 170, 22, c, d, { dash:1 })}
  ${steps}
  ${arrow({ x1:583, y1:158, x2:588, y2:168, c:d })}
  ${person(p2)}
  ${bubble({ x:478, y:82, w:124, h:52, lines:["몸은 아직","어젯밤인데…"], c:d, to:{ x:m2.x+20, y:m2.y } })}
  ${note({ x:300, y:84, w:40, h:28, lines:["시차"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 17 — 템플릿 B: 빠른 손(마취 이전) → 핼스테드(천천히, 장갑) → 긴 수련(지켜보며 배운다)
    시계 부채꼴이 '걸린 시간': 1분(작은 쐐기) vs 필요한 만큼(큰 쐐기) */
 surgery:(c,t,d)=>{
  const s = .85, y = FLOOR;
  const p1 = Object.assign({ x:86, y, s, c, pose:"open", legs:"walk", face:"oh", brow:"down", look:3 }, CAST.fastdoc, { capc:d });
  const p2 = Object.assign({ x:292, y, s, c, face:"smile", brow:"soft" }, CAST.halsted);
  const p3 = Object.assign({ x:478, y, s, c, face:"smile", look:3 }, CAST.junior);
  const p4 = Object.assign({ x:574, y, s, c:d, pose:"point", flip:1, face:"glad", brow:"up", head:-4 }, CAST.senior);
  const m4 = anchors(p4).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"마취 이전 — 빠른 손", floor:1 }, P3[0]))}
  <path d="M34 150h18M30 162h22M36 174h16" stroke="${LIGHT}" stroke-width="${SW.line}" stroke-linecap="round"/>
  ${person(p1)}
  ${wclock(166, 112, 20, c, d, { wedge: 30 })}
  ${text(166, 152, "1분 안에", 3, MID)}
  ${panel(Object.assign({ c:d, t, n:2, label:"핼스테드 — 필요한 만큼", floor:1 }, P3[1]))}
  ${holding(p2, glove, 1, { one:"L", R:"down" })}
  ${wclock(372, 112, 20, c, d, { wedge: 250 })}
  ${text(372, 152, "천천히, 층층이", 3, MID)}
  ${panel(Object.assign({ c:d, t, n:3, label:"긴 수련 — 지켜보며 배운다", floor:1 }, P3[2]))}
  ${holding(p3, prop.paper, 1)}
  ${person(p4)}
  ${bubble({ x:446, y:52, w:134, h:32, lines:["몇 년이고 지켜본다"], c:d, lvl:2, to:{ x:m4.x-16, y:m4.y-2 } })}</svg>`; },

 /* 18 — 템플릿 C: 점선 상자(문손잡이 위에서 기다리는 바이러스) → 세포 프레임(설명서를 넘기고 빌린 톱니가 돈다) → 새 바이러스
    리더선 콜아웃 2: 설명서(바이러스의 것) · 기계(세포의 것) */
 virus:(c,t,d)=>`<svg viewBox="0 0 640 280" fill="none">
  <rect x="24" y="52" width="160" height="150" rx="10" fill="none" stroke="${MID}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  <rect x="52" y="112" width="14" height="46" rx="3" fill="${t}" stroke="${d}" stroke-width="${SW.line}"/>
  <rect x="62" y="126" width="46" height="11" rx="5.5" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
  ${virus(100, 100, 18, c, d)}
  ${text(104, 224, "혼자서는 — 기다릴 뿐", 3, MID)}
  ${arrow({ x1:190, y1:128, x2:218, y2:128, c:d })}
  ${panel({ x:224, y:40, w:236, h:184, c:d, label:"세포 — 빌려 쓰는 공장" })}
  ${virus(268, 128, 18, c, d)}
  ${arrow({ x1:296, y1:128, x2:318, y2:128, c:d, dash:1 })}
  ${gear(350, 118, 20, d, t)}${gear(390, 150, 13, d, t, 7)}
  <path d="M338 190h80" stroke="${LIGHT}" stroke-width="${SW.line}" stroke-linecap="round" stroke-dasharray="2 5"/>
  ${virus(430, 108, 9, c, d, 0)}${virus(436, 168, 9, c, d, 0)}
  ${callout({ x:268, y:128, tx:250, ty:26, text:"설명서만 바이러스의 것", c:d, anchor:"end" })}
  ${callout({ x:350, y:118, tx:362, ty:26, text:"기계는 세포에서 빌린 것", c:d, anchor:"start" })}
  ${arrow({ x1:466, y1:128, x2:498, y2:128, c:d })}
  ${virus(536, 96, 14, c, d, 0)}${virus(586, 128, 14, c, d, 0)}${virus(540, 164, 14, c, d, 0)}
  ${text(560, 224, "새 바이러스", 3, MID)}</svg>`,

 /* 19 — 템플릿 A: 1854 브로드가(점이 펌프 둘레에 모인다, 점선 원) / 손잡이를 뗀 뒤(빈 지도, 손잡이 없는 펌프)
    왼쪽 스노는 지도를 가리키고, 오른쪽 사람은 어깨를 으쓱한다 — 아무 일도 없다 */
 wall:(c,t,d)=>{
  const p1 = Object.assign({ x:84, y:FLOOR, s:1, c, pose:"point", face:"flat", brow:"one", look:3 }, CAST.snow);
  const p2 = Object.assign({ x:426, y:FLOOR, s:1, c:d, pose:"shrug", face:"meh", brow:"low", head:-5 }, CAST.council);
  const m2 = anchors(p2).mouth;
  const dots = [[-10,-8],[8,-12],[-4,10],[12,6],[-16,4],[4,-2,2.8],[16,-4,2.8],[-8,-18,2.8],[10,16,2.8],[-22,-14,2.6],[24,12,2.6],[-30,20,2.4],[34,-22,2.4],[-40,-32,2.2],[44,30,2.2]];
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"1854 브로드가 — 점이 모이는 곳" }, PA))}
  ${floorSet(PA, d, t)}
  ${streetMap(154, 58, 124, 132, c, d, dots, 30)}
  ${person(p1)}
  ${panel(Object.assign({ c:d, t, n:2, label:"손잡이를 뗀 뒤 — 아무 일도 없다" }, PB))}
  ${floorSet(PB, d, t)}
  ${streetMap(488, 138, 110, 56, c, d, [], 0)}
  ${person(p2)}
  ${bubble({ x:478, y:80, w:124, h:46, lines:["아무 일도","없잖아?"], c:d, to:{ x:m2.x+20, y:m2.y } })}
  ${note({ x:300, y:78, w:40, h:40, lines:["손잡이","제거"], c:d, tint:t })}
  ${arrow({ x1:302, y1:132, x2:338, y2:132, c:d })}</svg>`; },

 /* 20 — 템플릿 B: 30시간 당직(훈장) → 17시간 뒤(실수 곡선, 취기 수준) → 짧은 근무 + 확인된 인계(적고 말하고 되읽는다) */
 burnout:(c,t,d)=>{
  const s = .85, y = FLOOR;
  const p1 = Object.assign({ x:90, y, s, c, pose:"up", face:"grin", brow:"up" }, CAST.resident);
  const p2 = Object.assign({ x:282, y, s, c, pose:"down", face:"worry", brow:"down", head:8, look:-3 }, CAST.tired);
  const p3 = Object.assign({ x:478, y, s, c:d, face:"smile", look:3 }, CAST.giver);
  const p4 = Object.assign({ x:574, y, s, c, pose:"open", flip:1, face:"glad", brow:"up" }, CAST.taker);
  const m3 = anchors(p3).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"30시간 당직 — 훈장처럼", floor:1 }, P3[0]))}
  ${person(p1)}
  ${medal(98, 158, c, d)}
  ${tag({ x:152, y:64, text:"30시간 연속", c:d })}
  ${panel(Object.assign({ c:d, t, n:2, label:"17시간 뒤 — 취기 수준", floor:1 }, P3[1]))}
  ${person(p2)}
  ${errChart(322, 78, 78, 96, c, d, "17h")}
  ${panel(Object.assign({ c:d, t, n:3, label:"짧은 근무 + 확인된 인계", floor:1 }, P3[2]))}
  ${holding(p3, prop.paper, 1)}
  ${person(p4)}
  ${bubble({ x:440, y:52, w:150, h:32, lines:["적고, 말하고, 되읽는다"], c:d, lvl:2, to:{ x:m3.x+16, y:m3.y-2 } })}</svg>`; },
};

/* 장면 캡션 1줄: build.js 가 figcaption 앞머리에 '<b>Figure N</b> 캡션 — (units 의 fig 설명)' 으로 찍는다 */
const SCENECAP = {
 clock: "한 번에 도는 바늘, 하루에 한 칸 가는 바늘",
 surgery: "빠른 손에서 느린 손, 그리고 긴 수련으로",
 virus: "혼자서는 기다리고, 세포 안에서는 만든다",
 wall: "점이 모인 지도, 점이 사라진 지도",
 burnout: "훈장에서 설계 문제로",
};

/* 비네트 캡션: KB 제목을 되풀이하지 않고 도해가 가리키는 사실 하나를 적는다 */
const VIGCAP = {
 "16": "눈에서 시상하부로 곧장 가는 빛 신호",
 "17": "간호사의 손을 지키려던 장갑",
 "18": "항생제가 노리는 것은 세포벽뿐",
 "19": "세균을 보기 전에 물길을 끊은 존 스노",
 "20": "도슨·리드의 보고 · 1997",
};

const STRIP = {
 "16":["hourglass","brain","sunrise","takeoff","balance"],
 "17":["hourglass","loop","heartbeat","shield","pair"],
 "18":["letters","nope","gear","ask","tag"],
 "19":["map","scope","shield","coin","nope"],
 "20":["nova","warn","hourglass","handshake","wrench"]
};

/* ── 비네트(240×150 → 45mm): 인물 없이 소품 도해 1개 — 글자는 lvl "v"(칩) · "vs"(라벨) 만, SVG 안 제목 없음 ── */
/* 손 모양(손가락 위) — 비네트 17 의 손/장갑 공용 */
const handShape = (x, y, s, fill, extra = "") => `<g transform="translate(${x} ${y}) scale(${s})">
  ${[[-7, 12], [-2, 15], [3, 14], [8, 11]].map(([fx, l]) => `<path d="M${fx} -2v${-l}" stroke="${INK}" stroke-width="7.3" stroke-linecap="round"/><path d="M${fx} -2v${-l}" stroke="${fill}" stroke-width="5.5" stroke-linecap="round"/>`).join("")}
  <path d="M-10 0l-8-8" stroke="${INK}" stroke-width="7.3" stroke-linecap="round"/><path d="M-10 0l-8-8" stroke="${fill}" stroke-width="5.5" stroke-linecap="round"/>
  <rect x="-11" y="-4" width="22" height="18" rx="5" fill="${fill}" stroke="${INK}" stroke-width="1.8"/>${extra}</g>`;
const VIG = {
 /* 16 — 눈 → 시상하부의 시계(SCN): 빛 정보가 곧장 이어진다 */
 "16":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <path d="M100 28c22-14 52-10 68 6 16 4 26 22 18 40-2 18-22 30-40 26-14 10-40 6-50-8-18-2-30-22-22-38-2-16 10-26 26-26z" fill="${t}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>
  <path d="M132 30c-6 18-4 40 8 60M110 44c14 6 28 4 40-6M108 76c14-2 28 2 40 12" stroke="${d}" stroke-width="${SW.hair}" stroke-linecap="round"/>
  <path d="M126 100q-6 12 2 22" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
  ${prop.clock(112, 84, .9, c)}
  <path d="M20 84s10-14 24-14 24 14 24 14-10 14-24 14-24-14-24-14z" fill="#fff" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>
  <circle cx="44" cy="84" r="6" fill="${c}"/>
  ${arrow({ x1:72, y1:84, x2:94, y2:84, c:d, dash:1 })}
  ${text(44, 122, "눈", "vs", MID)}
  ${tag({ x:150, y:134, text:"SCN · 시교차상핵", c:d, lvl:"v" })}</svg>`,
 /* 17 — 소독액에 상한 손 → 얇은 고무장갑 */
 "17":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${handShape(62, 82, 2, "#F5DCC6", [[-6, 2], [4, 6], [-2, 9], [7, -1], [-8, 8]].map(([dx, dy]) => `<circle cx="${dx}" cy="${dy}" r="1.6" fill="${c}"/>`).join(""))}
  ${arrow({ x1:100, y1:86, x2:132, y2:86, c:d })}
  ${handShape(178, 82, 2, "#fff", `<rect x="-13" y="12" width="26" height="8" rx="2" fill="${t}" stroke="${INK}" stroke-width="1.8"/>`)}
  ${text(62, 138, "소독액에 상한 손", "vs", MID)}
  ${text(178, 138, "얇은 고무장갑", "vs", MID)}
  ${tag({ x:120, y:24, text:"장갑의 시작", c:d, lvl:"v" })}</svg>`,
 /* 18 — 항생제(알약)는 세포벽이 있는 세균에는 듣고, 세포벽이 없는 바이러스에는 듣지 않는다 */
 "18":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <rect x="24" y="66" width="56" height="28" rx="14" fill="${t}" stroke="${d}" stroke-width="${SW.line}"/>
  <rect x="30" y="72" width="44" height="16" rx="8" fill="#fff" stroke="${d}" stroke-width="${SW.hair}"/>
  <circle cx="44" cy="80" r="2.2" fill="${d}"/><circle cx="54" cy="80" r="2.2" fill="${d}"/><circle cx="64" cy="80" r="2.2" fill="${d}"/>
  <g transform="translate(120 80)"><rect x="-16" y="-8" width="32" height="16" rx="8" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/><path d="M-16 0a8 8 0 0 1 8-8h8v16h-8a8 8 0 0 1-8-8z" fill="${c}"/></g>
  ${arrow({ x1:100, y1:80, x2:86, y2:80, c:d })}
  ${arrow({ x1:140, y1:80, x2:154, y2:80, c:d })}
  ${virus(188, 80, 17, c, d, 0)}
  <path d="M70 52l5 5 9-10" stroke="${c}" stroke-width="${SW.bold}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M160 46l12 12M172 46l-12 12" stroke="${MID}" stroke-width="${SW.bold}" stroke-linecap="round"/>
  ${tag({ x:52, y:24, text:"세균", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:188, y:24, text:"바이러스", c:d, lvl:"v" })}
  ${text(52, 136, "세포벽 있음", "vs", MID)}
  ${text(188, 136, "세포벽 없음", "vs", MID)}</svg>`,
 /* 19 — 브로드가 펌프: 손잡이가 있던 자리(점선)와 떼어 낸 손잡이 */
 "19":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  <g transform="translate(84 118)">
   <rect x="-26" y="-8" width="52" height="8" rx="2" fill="${t}" stroke="${d}" stroke-width="${SW.line}"/>
   <rect x="-11" y="-64" width="22" height="56" rx="3" fill="${t}" stroke="${d}" stroke-width="${SW.line}"/>
   <rect x="-15" y="-70" width="30" height="8" rx="3" fill="#fff" stroke="${d}" stroke-width="${SW.line}"/>
   <path d="M-11 -50h-12q-6 0-6 6v10" stroke="${d}" stroke-width="${SW.line}" stroke-linecap="round"/>
   <circle cx="10" cy="-66" r="3" fill="${d}"/>
   <path d="M10 -66l32-24" stroke="${MID}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
   <circle cx="42" cy="-90" r="4" fill="none" stroke="${MID}" stroke-width="${SW.hair}" stroke-dasharray="3 2"/></g>
  <g transform="translate(176 96) rotate(-12)">
   <path d="M-30 0h60" stroke="${d}" stroke-width="10" stroke-linecap="round"/><path d="M-30 0h60" stroke="#fff" stroke-width="6.5" stroke-linecap="round"/>
   <circle cx="30" cy="0" r="6" fill="${c}" stroke="${d}" stroke-width="${SW.line}"/></g>
  <path d="M136 118h74" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-linecap="round"/>
  ${tag({ x:176, y:38, text:"1854", c:d, lvl:"v" })}
  ${text(84, 140, "브로드가 펌프", "vs", MID)}
  ${text(180, 140, "뗀 손잡이", "vs", MID)}</svg>`,
 /* 20 — 깨어 있은 17시간 ≈ 혈중알코올농도 0.05% */
 "20":(c,t,d)=>`<svg viewBox="0 0 240 150" fill="none">
  ${prop.clock(60, 70, 1.9, c)}
  ${text(120, 78, "≈", "v", d)}
  <g transform="translate(180 70)">
   <path d="M-20 -32h40l-5 60h-30z" fill="#fff" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>
   <path d="M-17 -4h34l-3 32h-28z" fill="${t}"/>
   <path d="M-17 -4h34" stroke="${c}" stroke-width="${SW.line}" stroke-linecap="round"/></g>
  ${tag({ x:60, y:128, text:"17시간 각성", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:180, y:128, text:"알코올 0.05%", c:d, lvl:"v" })}</svg>`,
};

module.exports = { icons, scenes, STRIP, VIG, VIGCAP, SCENECAP };
