/* Unit 8 삽화 — 정치·법·역사 · 정돈된 도해 (디자인 시스템 A, Unit 1 기준 구현)
   장면 viewBox 640×280 · 비네트 240×150 · 아이콘 64×64
   구도 템플릿: A 2패널 비교(x 20/350 w 270 h 228, 노트 y 84 · 화살 y 124) · B 3패널 순서(칩 1–3, s .85)
                C 단일 도해(프레임 204–600 × 40–224 + 리더선 콜아웃 ≤2) · D 인물 대화
   장면 캡션은 SVG 안에 두지 않고 SCENECAP → figcaption 앞머리 한 줄로 찍는다 (그림 안 글자는 패널 라벨·풍선·콜아웃뿐)
   색: accent(c) · deep(d) · tint(t) + 잉크/회색 2단 + 흰색. 이 유닛은 노랑을 쓰지 않는다.
   레슨별 구도
   36 thrift  A 2패널 — 한 집이 아낄 때(가게 계산대에 동전이 있다) / 모두가 아낄 때(같은 자리가 점선 빈 원)
   37 camera  B 3패널 — 방(기자를 거쳐) → 라디오(전파가 부엌으로 곧장) → 카메라(수천 개 화면)
   38 arthur  A 2패널 — 1136년 이전(점선 조각들) / 1136년 이후(한 권 위에 쌓인 층)
   39 harvest C 단일 — 평균 키 막대 2개 + 사람 수 점 3개·9개, 콜아웃 2
   40 letters A 2패널 — 항구의 한 장면(점선 궤적) / 편지가 만든 통로(열세 곳을 잇는 선) */
const K = require("../kit.js");
const { person, holding, anchors, bubble, thought, note, panel, arrow, callout, tag, text, prop, ground, floorBand, mix, INK, MID, LIGHT, PAPER, SW, DASH } = K;

/* ── 레슨 아이콘: 선화 stroke 3 round · 라이브 48×48(패딩 8) · 면 채움은 accent 30% 한 곳
      다섯 개 모두 '물건 하나 + 바닥선 M10 56h44' 계열 ── */
const IC = c => `stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
 /* 저금통 — 동전 하나가 위에서 들어간다 */
 thrift:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M13 32h38v12a5 5 0 0 1-5 5H18a5 5 0 0 1-5-5z" fill="${c}" opacity=".3"/>
  <path d="M13 32h38v12a5 5 0 0 1-5 5H18a5 5 0 0 1-5-5z" ${IC(c)}/>
  <rect x="11" y="24" width="42" height="8" rx="3" ${IC(c)}/>
  <path d="M26 28h12" ${IC(c)}/>
  <circle cx="32" cy="14" r="5" ${IC(c)}/>
  <path d="M10 56h44" ${IC(c)}/></svg>`,
 /* 삼각대 카메라 — 렌즈가 옆을 본다 */
 camera:(c)=>`<svg viewBox="0 0 64 64">
  <rect x="12" y="17" width="29" height="20" rx="4" fill="${c}" opacity=".3"/>
  <rect x="12" y="17" width="29" height="20" rx="4" ${IC(c)}/>
  <path d="M41 23l11-6v20l-11-6z" ${IC(c)}/>
  <path d="M19 13h8" ${IC(c)}/>
  <path d="M26 37v8M26 45l-11 9M26 45l11 9" ${IC(c)}/>
  <path d="M10 56h44" ${IC(c)}/></svg>`,
 /* 책 위에 얹힌 왕관 — 조립된 왕 */
 arthur:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M17 33L20 16l7 8 5-11 5 11 7-8 3 17z" fill="${c}" opacity=".3"/>
  <path d="M17 33L20 16l7 8 5-11 5 11 7-8 3 17z" ${IC(c)}/>
  <path d="M14 36h36v13H14z" ${IC(c)}/>
  <path d="M32 36v13" ${IC(c)}/>
  <path d="M10 56h44" ${IC(c)}/></svg>`,
 /* 곳간 — 저장할 수 있게 된 수확 */
 harvest:(c)=>`<svg viewBox="0 0 64 64">
  <path d="M14 29l18-13 18 13v20H14z" fill="${c}" opacity=".3"/>
  <path d="M14 29l18-13 18 13v20H14z" ${IC(c)}/>
  <path d="M26 49V38h12v11" ${IC(c)}/>
  <path d="M32 16V9" ${IC(c)}/>
  <path d="M10 56h44" ${IC(c)}/></svg>`,
 /* 편지 한 통과 뻗어 나간 세 갈래 */
 letters:(c)=>`<svg viewBox="0 0 64 64">
  <rect x="10" y="30" width="28" height="20" rx="3" fill="${c}" opacity=".3"/>
  <rect x="10" y="30" width="28" height="20" rx="3" ${IC(c)}/>
  <path d="M10 33l14 10 14-10" ${IC(c)}/>
  <path d="M38 34l7-11M38 37h9M38 42l5 3" ${IC(c)}/>
  <circle cx="48" cy="18" r="3.5" ${IC(c)}/><circle cx="50" cy="34" r="3.5" ${IC(c)}/><circle cx="46" cy="47" r="3.5" ${IC(c)}/>
  <path d="M10 56h44" ${IC(c)}/></svg>`,
};

/* ── 유닛 캐스팅: 한 배너 안에서 top·hair·skin 이 겹치지 않게 ── */
const CAST = {
 saver:    { hair:"bob",   hairc:"#6B3A20", skin:"light", top:"tee" },
 shopkeep: { hair:"bun",   hairc:"#2B2926", skin:"tan",   top:"sweater" },
 speaker:  { hair:"short", hairc:"#2B2926", skin:"light", top:"shirt" },
 reporter: { hair:"curly", hairc:"#3A2E2A", skin:"brown", top:"hoodie", sleeve:"short" },
 broadcast:{ hair:"wavy",  hairc:"#7C7C82", skin:"light", top:"sweater", glasses:1 },
 oncam:    { hair:"buzz",  hairc:"#2B2926", skin:"tan",   top:"shirt" },
 scholar:  { hair:"bun",   hairc:"#8A4B25", skin:"light", top:"sweater" },
 writer:   { hair:"short", hairc:"#3A2E2A", skin:"tan",   top:"shirt" },
 farmer:   { hair:"pony",  hairc:"#2B2926", skin:"tan",   top:"tee", sleeve:"short" },
 crowd:    { hair:"twin",  hairc:"#3A2E2A", skin:"brown", top:"hoodie", sleeve:"short" },
 adams:    { hair:"short", hairc:"#7C7C82", skin:"light", top:"shirt", glasses:1 },
};

/* 패널: y 18 · h 228 (라벨 기준선 264). 장면 캡션은 SVG 안이 아니라 SCENECAP → figcaption 앞머리 */
const P3 = [{ x:20, y:18, w:186, h:228 }, { x:227, y:18, w:186, h:228 }, { x:434, y:18, w:186, h:228 }];
const PA = { x:20, y:18, w:270, h:228 }, PB = { x:350, y:18, w:270, h:228 };   // 패널 사이 60 (노트 40 + 여백 10·10)
const FLOOR = 236;                                   // 인물 발밑 바닥선 (패널 바닥 246 − 10)
const BAND = 204;                                    // 벽/바닥 경계
const DESK = 192;                                    // 상판 윗선

/* 방(패널 + 바닥 띠 + 바닥선) 한 벌 */
const room = (P, c, t, d, n, label) => `${panel(Object.assign({ c:d, t, n, label }, P))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, P))}
  ${ground({ x1:P.x+14, x2:P.x+P.w-14, y:FLOOR, c:d, w:SW.hair })}`;

/* 소품 공통: 흰 바탕 + 잉크 외곽 1.8 (kit.prop 과 같은 선) */
const OP = (fill, w = 1.8) => `fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const LN = (col, w) => `stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
const shadow = (x, w) => `<ellipse cx="${x}" cy="${FLOOR + 2}" rx="${w / 2}" ry="4" fill="${INK}" opacity=".08"/>`;

/* ── 36 소품 ── */
/* 저금통 (드는 소품): 뚜껑 + 투입구 + 앞면 동전 */
const jar = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-16-8h32v25q0 9-9 9h-14q-9 0-9-9z" ${OP(PAPER)}/>
  ${[22, 16.5, 11].map(cy => `<ellipse cx="0" cy="${cy}" rx="11.5" ry="3.6" ${OP(c, 1.5)}/>`).join("")}
  <path d="M-16-8h32" ${LN(INK, 1.8)}/>
  <rect x="-11" y="-17" width="22" height="10" rx="2.5" ${OP(PAPER)}/>
  <rect x="-6" y="-14.5" width="12" height="4.5" rx="2" fill="${INK}"/></g>`;
Object.assign(jar, { hw: 16, hh: 26 });
/* 시장 판매대: 줄무늬 차양 + 기둥 2 + 상판 + 다리 2 */
const stall = (x, w, c, d, t) => {
  const x0 = x - 6, W = w + 12, n = 5, u = W / n;             // 차양: 물결 아랫단 5칸(색 번갈아)
  const teeth = Array.from({ length: n }, (_, k) =>
    `<path d="M${(x0 + k * u).toFixed(1)} 126h${u.toFixed(1)}v14a${(u / 2).toFixed(1)} 7 0 0 1-${u.toFixed(1)} 0z" fill="${k % 2 ? PAPER : c}"/>`).join("");
  return `${shadow(x + w / 2, w + 6)}
  <path d="M${x + 12} 152V180M${x + w - 12} 152V180" ${LN(INK, SW.line)}/>
  ${teeth}
  <path d="M${x0} 126h${W}v14${Array.from({ length: n }, () => `a${(u / 2).toFixed(1)} 7 0 0 1-${u.toFixed(1)} 0`).join("")}z" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <rect x="${x + 4}" y="186" width="${w - 8}" height="50" ${OP(PAPER)}/>
  <path d="M${x + 8} 203h${w - 16}M${x + 8} 220h${w - 16}" ${LN(d, SW.hair)}/>
  <rect x="${x - 5}" y="179" width="${w + 10}" height="8" rx="2.5" fill="${mix(t, d, .18)}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
};
/* 계산대 위 동전: 채워진 것(소득) / 점선 빈 자리(사라진 소득) */
const coinRow = (x, w, c, gone) => [26, 50, 74].map(dx => { const cx = x + dx, b = 176, h = 12;
  return gone
   ? `<ellipse cx="${cx}" cy="${b}" rx="10" ry="3.8" fill="none" stroke="${LIGHT}" stroke-width="${SW.hair}" stroke-dasharray="4 3.5"/>`
   : `<path d="M${cx - 10} ${b - h}v${h}a10 3.8 0 0 0 20 0v-${h}z" ${OP(c)}/>
      <ellipse cx="${cx}" cy="${b - h}" rx="10" ry="3.8" ${OP(mix(c, "#ffffff", .32))}/>
      <path d="M${cx - 10} ${b - 8}a10 3.8 0 0 0 20 0M${cx - 10} ${b - 4}a10 3.8 0 0 0 20 0" ${LN(INK, 1.2)} opacity=".55"/>`; }).join("");

/* ── 37 소품 ── */
/* 스탠드 마이크 */
const micStand = (x, s, c) => `<g transform="translate(${x} ${FLOOR}) scale(${s})">
  <ellipse cx="0" cy="2" rx="20" ry="4.5" fill="${INK}" opacity=".08"/>
  <path d="M-16 0h32" ${LN(INK, SW.bold)}/>
  <path d="M0 0V-72" ${LN(INK, SW.line)}/>
  <rect x="-10" y="-102" width="20" height="32" rx="10" ${OP(c)}/>
  <path d="M-6-95h12M-6-88h12M-6-81h12" ${LN("#fff", 1.5)}/></g>`;
/* 부엌 창 (벽에 걸리는 것) */
const kwindow = (x, y, w, h, d, t) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" ${OP(PAPER)}/>
  <rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" fill="${mix(t, "#ffffff", .35)}"/>
  <path d="M${x + w / 2} ${y + 5}V${y + h - 5}M${x + 5} ${y + h / 2}H${x + w - 5}" ${LN(d, SW.line)}/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="none" stroke="${INK}" stroke-width="1.8"/>
  <path d="M${x - 6} ${y + h + 4}h${w + 12}" ${LN(INK, 2.4)}/>`;
/* 전파 호 3개 (마이크 오른쪽으로) */
const waveArcs = (cx, cy, c) => [14, 22, 30].map((r, i) =>
  `<path d="M${(cx + r * .56).toFixed(1)} ${(cy - r * .83).toFixed(1)}A${r} ${r} 0 0 1 ${(cx + r * .56).toFixed(1)} ${(cy + r * .83).toFixed(1)}" ${LN(c, (2.4 - i * .35).toFixed(2))} opacity="${(.95 - i * .2).toFixed(2)}"/>`).join("");
/* 라디오 수신기 (탁자 위) */
const radioSet = (x, y, s, c, d) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-15-16l-7-13M9-16l7-13" ${LN(INK, 1.8)}/>
  <rect x="-24" y="-16" width="48" height="32" rx="4" ${OP(PAPER)}/>
  <circle cx="-11" cy="0" r="9" ${OP(c, 1.6)}/>
  <path d="M4-8h15M4 0h15M4 8h15" ${LN(d, 2)}/></g>`;
/* 작은 탁자 */
const table = (x, w, d, t) => `${shadow(x + w / 2, w - 6)}
  <path d="M${x + 8} 206V${FLOOR}M${x + w - 8} 206V${FLOOR}" ${LN(d, SW.line)}/>
  <rect x="${x}" y="200" width="${w}" height="6" rx="2" fill="${mix(t, d, .18)}" stroke="${d}" stroke-width="${SW.line}" stroke-linejoin="round"/>`;
/* 삼각대 카메라 (렌즈가 왼쪽을 본다) */
const camRig = (x, s, c, d) => `<g transform="translate(${x} ${FLOOR}) scale(${s})">
  <ellipse cx="0" cy="2" rx="26" ry="4" fill="${INK}" opacity=".08"/>
  <path d="M2-46L-18 0M2-46L18 0M2-46L4 0" ${LN(INK, SW.line)}/>
  <path d="M-26-70l-13-7v22l13-7z" ${OP(c)}/>
  <rect x="-26" y="-80" width="46" height="34" rx="4" ${OP(PAPER)}/>
  <circle cx="9" cy="-71" r="4.5" fill="${c}"/>
  <path d="M-16-71h12" ${LN(d, 2.2)}/></g>`;
/* 화면 격자 (수천 대의 화면) */
const screens = (x0, y0, cols, rows, c, d) => {
  let s = "";
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const gx = x0 + k * 38, gy = y0 + r * 28;
    s += `<rect x="${gx}" y="${gy}" width="30" height="20" rx="3" fill="${PAPER}" stroke="${d}" stroke-width="${SW.hair}"/>
      <rect x="${gx + 4}" y="${gy + 4}" width="22" height="12" rx="1.5" fill="${c}" opacity="${(.8 - (r * cols + k) * .08).toFixed(2)}"/>`;
  }
  return s;
};

/* ── 38 소품 ── */
/* 흩어진 조각: 점선 테두리 종이 + 흐린 글줄 2 */
const scrap = (x, y, rot, w = 48) => `<g transform="translate(${x} ${y}) rotate(${rot})">
  <rect x="${-w / 2}" y="-11" width="${w}" height="22" rx="3" fill="${PAPER}" stroke="${MID}" stroke-width="${SW.hair}" stroke-dasharray="${DASH}"/>
  <path d="M${-w / 2 + 8}-3h${w - 22}M${-w / 2 + 8} 4h${w - 30}" ${LN(LIGHT, 2.6)}/></g>`;
/* 쌓인 책 한 층 */
const layer = (x, y, w, h, fill, ln) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5" ${OP(fill)}/>
  <path d="M${x + 11} ${y + 3.5}V${y + h - 3.5}" ${LN(ln, 1.6)} opacity=".85"/>
  <path d="M${x + w - 11} ${y + 5}h6M${x + w - 11} ${y + h / 2}h6M${x + w - 11} ${y + h - 5}h6" ${LN(ln, 1.2)} opacity=".7"/>`;

/* ── 39 소품 ── */
/* 곡식 단 (드는 소품): 이삭 셋 + 묶은 띠 */
const head39 = (dx, dy, rot, c) => `<g transform="translate(${dx} ${dy}) rotate(${rot})">
  <path d="M0-15q8 8 0 20q-8-12 0-20z" ${OP(PAPER)}/>
  <path d="M0-11v14M-4.5-6.5L0-9.5M4.5-6.5L0-9.5M-4.5-1L0-4M4.5-1L0-4" ${LN(c, 1.4)}/></g>`;
const sheaf = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M0 20L-16-10M0 20L0-14M0 20L16-10" ${LN(INK, 2.2)}/>
  ${head39(-16, -12, -18, c)}${head39(0, -16, 0, c)}${head39(16, -12, 18, c)}
  <rect x="-15" y="7" width="30" height="13" rx="3" ${OP(c)}/>
  <path d="M-15 13.5h30" ${LN("#fff", 1.3)} opacity=".55"/></g>`;
Object.assign(sheaf, { hw: 18, hh: 20 });

/* ── 40 소품 ── */
/* 차 상자 */
const crate = (x, y, s, rot, c, d) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <rect x="-16" y="-12" width="32" height="24" rx="2" ${OP(PAPER)}/>
  <path d="M-16-5h32M-16 5h32" ${LN(d, 1.5)}/>
  <rect x="-7" y="-5" width="14" height="10" fill="${c}" opacity=".55"/>
  <path d="M-7-5h14v10h-14z" ${LN(d, 1.3)}/></g>`;
/* 편지 봉투 */
const envelope = (x, y, s, c, d) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-13" y="-9" width="26" height="18" rx="2.5" ${OP(PAPER)}/>
  <path d="M-13-7L0 3L13-7" ${LN(d, 1.8)}/></g>`;

const scenes = {
 /* 36 — 템플릿 A: 한 집이 아낄 때(계산대에 동전) / 모두가 아낄 때(같은 자리가 점선 빈 원) */
 thrift:(c,t,d)=>{
  const p1 = Object.assign({ x:84, y:FLOOR, s:1, c, face:"glad", brow:"up", look:2 }, CAST.saver);
  const p2 = Object.assign({ x:414, y:FLOOR, s:1, c:d, pose:"shrug", face:"worry", brow:"down", head:-4, look:-2 }, CAST.shopkeep);
  const m1 = anchors(p1).mouth, m2 = anchors(p2).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(PA, c, t, d, 1, "한 집이 아낄 때 — 현명하다")}
  ${stall(176, 100, c, d, t)}
  ${coinRow(176, 100, c, 0)}
  ${holding(p1, jar, 1)}
  ${bubble({ x:132, y:70, w:130, h:44, lines:["조금씩 아껴 두자"], c:d, lvl:2, to:{ x:m1.x+20, y:m1.y } })}
  ${room(PB, c, t, d, 2, "모두가 아낄 때 — 소득이 사라진다")}
  ${stall(506, 100, c, d, t)}
  ${coinRow(506, 100, c, 1)}
  ${person(p2)}
  ${bubble({ x:462, y:70, w:130, h:44, lines:["오늘도 손님이 없네"], c:d, lvl:2, to:{ x:m2.x+20, y:m2.y } })}
  ${note({ x:300, y:84, w:40, h:28, lines:["모두"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 37 — 템플릿 B: 방(기자를 거쳐) → 라디오(부엌으로 곧장) → 카메라(수천 개 화면) */
 camera:(c,t,d)=>{
  const s = .85, y = FLOOR;
  const gesture = { L:{ pts:[[-21,-104],[-36,-93],[-46,-80]], hand:"open" }, R:"down" };
  const p1 = Object.assign({ x:100, y, s, c, arms:gesture, face:"smile", brow:"soft", look:-3 }, CAST.speaker);
  const p2 = Object.assign({ x:172, y, s, c:d, flip:1, face:"flat", brow:"low", head:6 }, CAST.reporter);
  const p3 = Object.assign({ x:268, y, s, c, face:"smile", brow:"soft", look:3, head:-3 }, CAST.broadcast);
  const p4 = Object.assign({ x:478, y, s, c:d, pose:"wave", face:"grin", brow:"up", look:2 }, CAST.oncam);
  const m1 = anchors(p1).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(P3[0], c, t, d, 1, "방 — 기자를 거쳐")}
  ${person(p1)}
  ${holding(p2, prop.paper, .95, { one:"L", R:"down" })}
  ${bubble({ x:24, y:66, w:112, h:32, lines:["오늘 말씀드립니다"], c:d, lvl:2, to:{ x:m1.x-24, y:m1.y } })}
  ${room(P3[1], c, t, d, 2, "라디오 — 부엌으로 곧장")}
  ${kwindow(330, 40, 72, 54, d, t)}
  ${micStand(314, s, c)}
  ${waveArcs(328, 163, c)}
  ${table(344, 50, d, t)}
  ${radioSet(369, 186, .8, c, d)}
  ${person(p3)}
  ${room(P3[2], c, t, d, 3, "카메라 — 수천 개 화면으로")}
  ${screens(474, 34, 3, 2, c, d)}
  ${arrow({ x1:574, y1:162, x2:566, y2:92, c:d, dash:1 })}
  ${camRig(566, s, c, d)}
  ${person(p4)}</svg>`; },

 /* 38 — 템플릿 A: 흩어진 점선 조각 / 한 권 위에 쌓인 층 (사이 노트 = 1136) */
 arthur:(c,t,d)=>{
  const p1 = Object.assign({ x:84, y:FLOOR, s:1, c, pose:"think", face:"meh", brow:"low", head:5, look:3 }, CAST.scholar);
  const p2 = Object.assign({ x:404, y:FLOOR, s:1, c:d, face:"grin", brow:"up", look:2, capc:c }, CAST.writer);
  const m2 = anchors(p2).mouth;
  return `<svg viewBox="0 0 640 280" fill="none">
  ${room(PA, c, t, d, 1, "1136년 이전 — 흩어진 조각")}
  ${scrap(198, 116, -11)}${scrap(256, 134, 7)}${scrap(200, 164, 12)}${scrap(258, 190, -6)}${scrap(212, 212, 4)}
  ${person(p1)}
  ${thought({ x:118, y:44, w:122, h:40, lines:["조각뿐이잖아"], c:d, side:"l", lvl:2 })}
  ${room(PB, c, t, d, 2, "1136년 이후 — 한 권과 그 위의 층")}
  ${shadow(550, 118)}
  ${layer(494, 206, 112, 30, c, "#fff")}
  ${layer(501, 184, 98, 22, mix(t, d, .30), d)}
  ${layer(507, 164, 86, 20, t, d)}
  ${layer(513, 146, 74, 18, PAPER, d)}
  ${holding(p2, prop.book, 1.15)}
  ${bubble({ x:452, y:74, w:130, h:42, lines:["이건 역사입니다"], c:d, lvl:2, to:{ x:m2.x+20, y:m2.y } })}
  ${note({ x:300, y:84, w:40, h:28, lines:["1136"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },

 /* 39 — 템플릿 C: 평균 키 막대 2개 + 사람 수 점 3개·9개 (리더선 콜아웃 2) */
 harvest:(c,t,d)=>{
  const p = Object.assign({ x:86, y:232, s:1, c, face:"meh", brow:"low", look:3, head:-4, capc:d }, CAST.farmer);
  const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="8" fill="${d}"/>`;
  const bar = (x, top) => `<rect x="${x - 18}" y="${top}" width="36" height="${200 - top}" rx="3" ${OP(c)}/>`;
  const grid = [];
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) grid.push(dot(500 + k * 24, 136 + r * 24));
  return `<svg viewBox="0 0 640 280" fill="none">
  ${holding(p, sheaf, 1)}
  ${text(86, 258, "농부가 된 뒤", 2, d)}
  ${arrow({ x1:150, y1:140, x2:192, y2:140, c:d, dash:1 })}
  ${panel({ x:204, y:40, w:396, h:184, c:d })}
  ${ground({ x1:222, x2:582, y:200, c:d, w:SW.hair })}
  ${bar(254, 76)}${dot(312, 184)}${dot(336, 184)}${dot(324, 160)}
  ${arrow({ x1:360, y1:152, x2:404, y2:152, c:d })}
  ${bar(448, 106)}${grid.join("")}
  ${text(298, 217, "모으던 때", 3, MID)}
  ${text(500, 217, "농사짓던 때", 3, MID)}
  ${callout({ x:448, y:106, tx:448, ty:26, text:"평균 키는 낮아졌다", c:d })}
  ${callout({ x:566, y:126, tx:590, ty:26, text:"사람 수는 늘었다", c:d })}</svg>`; },

 /* 40 — 템플릿 A: 항구의 한 장면(점선 궤적) / 편지가 만든 통로(열세 곳을 잇는 선) */
 letters:(c,t,d)=>{
  const p1 = Object.assign({ x:88, y:FLOOR, s:1, c, pose:"point", face:"laugh", brow:"up", look:3 }, CAST.crowd);
  const p2 = Object.assign({ x:404, y:FLOOR, s:1, c:d, face:"smile", brow:"soft", look:2, head:4 }, CAST.adams);
  const m1 = anchors(p1).mouth;
  const NX = 536, NY = 130, NR = 56;
  const spoke = i => { const a = (-90 + i * 30) * Math.PI / 180; return { x: NX + NR * Math.cos(a), y: NY + NR * Math.sin(a) }; };
  const net = Array.from({ length: 12 }, (_, i) => spoke(i));
  return `<svg viewBox="0 0 640 280" fill="none">
  ${panel(Object.assign({ c:d, t, n:1, label:"장면 하나 — 하룻밤이면 끝난다" }, PA))}
  ${floorBand(Object.assign({ top:BAND, t, line:0 }, PA))}
  ${ground({ x1:34, x2:172, y:FLOOR, c:d, w:SW.hair })}
  <path d="M176 206H290V236A10 10 0 0 1 280 246H176z" fill="${mix(t, d, .24)}"/>
  <path d="M290 206H176V246" ${LN(d, SW.line)}/>
  ${crate(256, 224, .78, -8, c, d)}
  <path d="M184 216q14-4 28 0t30-2M184 228q14-4 28 0t30-2M184 240q14-4 28 0t30-2" ${LN(d, SW.hair)} opacity=".75"/>
  ${crate(158, 226, .85, 0, c, d)}${crate(158, 205, .85, -3, c, d)}
  ${arrow({ x1:174, y1:188, x2:236, y2:204, c:d, dash:1, curve:-50 })}
  ${crate(216, 164, .82, 16, c, d)}
  ${person(p1)}
  ${bubble({ x:136, y:68, w:110, h:44, lines:["오늘 밤이다!"], c:d, lvl:2, to:{ x:m1.x+20, y:m1.y } })}
  ${room(PB, c, t, d, 2, "편지 — 통로가 먼저 생긴다")}
  ${net.map(n=>`<path d="M${NX} ${NY}L${n.x.toFixed(1)} ${n.y.toFixed(1)}" ${LN(c, SW.hair)}/>`).join("")}
  ${net.map(n=>`<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="6" fill="${d}"/>`).join("")}
  <circle cx="${NX}" cy="${NY}" r="13" ${OP(c)}/><circle cx="${NX}" cy="${NY}" r="6" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/>
  ${envelope(NX + NR * .32, NY - NR * .55, .8, c, d)}
  ${envelope(NX - NR * .55, NY + NR * .32, .8, c, d)}
  ${holding(p2, prop.paper, 1.05)}
  ${note({ x:300, y:84, w:40, h:28, lines:["1772"], c:d, tint:t })}
  ${arrow({ x1:302, y1:124, x2:338, y2:124, c:d })}</svg>`; },
};

/* 장면 캡션 1줄: build.js 가 figcaption 앞머리에 '<b>Figure N</b> 캡션 — (units 의 fig 설명)' 으로 찍는다 */
const SCENECAP = {
 thrift: "한 집의 절약은 옳고, 모두의 절약은 소득을 지운다",
 camera: "가까워질수록 가운데 서 있던 것이 사라진다",
 arthur: "흩어진 조각이 한 권이 되고, 그 위에 층이 쌓였다",
 harvest: "사람 수는 늘고, 평균 키는 낮아졌다",
 letters: "장면은 하룻밤, 통로는 여러 해",
};

/* 비네트 캡션: KB 제목을 되풀이하지 않고 도해가 가리키는 사실 하나를 적는다 */
const VIGCAP = {
 "36": "구성의 오류 · 케인스 1936",
 "37": "근거가 된 조사에는 한계가 있다",
 "38": "원탁과 성배는 나중에 더해졌다",
 "39": "문자는 곡물 장부에서 시작되었다",
 "40": "한 해 만에 매사추세츠로 퍼졌다",
};

const STRIP = {
 "36":["coin","loop","wilt","tag","balance"],
 "37":["quote","cable","frame","zipper","nope"],
 "38":["quote","openbook","globe","palette","tag"],
 "39":["frame","ruler","sprout","nope","dome"],
 "40":["fire","nova","letters","quote","cable"]
};

/* ── 비네트(240×150 → 45mm): 인물 없이 소품 도해 1개 — 글자는 lvl "v"(칩) · "vs"(라벨) 만, SVG 안 제목 없음 ── */
const VIG = {
 /* 36 — 도는 고리 vs 멎은 고리: 한 집이 아끼면 돈이 돌고, 모두가 아끼면 돌 돈이 없다 */
 "36":(c,t,d)=>{
  const R = Math.PI / 180;
  const ring = (cx, cy, r, col, dash) => {
   const a0 = -100, a1 = 150;
   const P = a => [cx + r * Math.cos(a * R), cy + r * Math.sin(a * R)];
   const [sx, sy] = P(a0), [ex, ey] = P(a1);
   const tx = -Math.sin(a1 * R), ty = Math.cos(a1 * R), nx = -ty, ny = tx;
   return `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)}A${r} ${r} 0 1 1 ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${col}" stroke-width="${SW.bold}" fill="none" stroke-linecap="round"${dash ? ` stroke-dasharray="${DASH}"` : ""}/>`
    + (dash ? "" : `<path d="M${(ex + tx * 13).toFixed(1)} ${(ey + ty * 13).toFixed(1)}L${(ex + nx * 7).toFixed(1)} ${(ey + ny * 7).toFixed(1)}L${(ex - nx * 7).toFixed(1)} ${(ey - ny * 7).toFixed(1)}z" fill="${col}"/>`);
  };
  const coins = (cx, cy, col, gone) => gone
   ? `<ellipse cx="${cx}" cy="${cy + 6}" rx="15" ry="5" fill="none" stroke="${LIGHT}" stroke-width="${SW.line}" stroke-dasharray="4 3.5"/>`
   : `<path d="M${cx - 15} ${cy - 6}v14a15 5 0 0 0 30 0v-14z" ${OP(col)}/>
      <ellipse cx="${cx}" cy="${cy - 6}" rx="15" ry="5" ${OP(mix(col, "#ffffff", .32))}/>
      <path d="M${cx - 15} ${cy}a15 5 0 0 0 30 0M${cx - 15} ${cy + 5}a15 5 0 0 0 30 0" ${LN(INK, 1.4)} opacity=".5"/>`;
  return `<svg viewBox="0 0 240 150" fill="none">
  ${ring(62, 80, 32, c, 0)}${coins(62, 78, c, 0)}
  ${ring(178, 80, 32, LIGHT, 1)}${coins(178, 78, LIGHT, 1)}
  ${arrow({ x1:104, y1:80, x2:136, y2:80, c:d })}
  ${tag({ x:62, y:22, text:"한 집", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:178, y:22, text:"모든 집", c:d, lvl:"v" })}
  ${text(62, 142, "돈이 돈다", "vs", MID)}
  ${text(178, 142, "돈이 멎는다", "vs", MID)}</svg>`; },
 /* 37 — 같은 토론, 다른 승자: 라디오 위에는 왼쪽 후보에 ✓, 텔레비전 위에는 오른쪽 후보에 ✓ */
 "37":(c,t,d)=>{
  const cand = (x, y, filled, on) => `<circle cx="${x}" cy="${y}" r="11" ${OP(filled ? c : PAPER)}/>`
   + (on ? `<path d="M${x - 5} ${y}l3.6 4 7.2-8.4" ${LN(filled ? "#fff" : d, 2.8)}/>` : "");
  return `<svg viewBox="0 0 240 150" fill="none">
  ${cand(44, 20, 1, 1)}${cand(80, 20, 0, 0)}
  ${cand(160, 20, 1, 0)}${cand(196, 20, 0, 1)}
  <path d="M34 44l-7-10M90 44l7-10" ${LN(INK, 1.8)}/>
  <rect x="24" y="42" width="76" height="44" rx="5" ${OP(PAPER)}/>
  <circle cx="44" cy="64" r="11" ${OP(c, 1.6)}/>
  <path d="M62 55h24M62 64h24M62 73h24" ${LN(d, 2.4)}/>
  <rect x="140" y="38" width="80" height="50" rx="5" ${OP(PAPER)}/>
  <rect x="147" y="45" width="66" height="36" rx="2.5" fill="${c}" opacity=".85"/>
  <path d="M180 88v6M166 96h28" ${LN(INK, 2.2)}/>
  ${text(62, 114, "라디오 청취자", "vs", MID)}
  ${text(180, 114, "시청자", "vs", MID)}
  ${tag({ x:120, y:134, text:"1960년 토론", c:d, lvl:"v" })}</svg>`; },
 /* 38 — 같은 책 두 권: 1136년 표지에는 왕관 하나, 뒤의 책에는 원탁과 성배가 더해졌다 */
 "38":(c,t,d)=>{
  const crown = (x, y, s, col, fill) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-13 8L-10-9L-4-1L0-12L4-1L10-9L13 8z" fill="${fill}" stroke="${col}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M-13 12h26" ${LN(col, 2.6)}/></g>`;
  const table38 = (x, y, col) => `<g transform="translate(${x} ${y})">
    <ellipse cx="0" cy="0" rx="11" ry="7.5" fill="none" stroke="${col}" stroke-width="2.6"/>
    <rect x="-16" y="-2.5" width="4.5" height="5.5" rx="1.2" fill="${col}"/><rect x="11.5" y="-2.5" width="4.5" height="5.5" rx="1.2" fill="${col}"/>
    <rect x="-2.8" y="-13.5" width="5.5" height="4.5" rx="1.2" fill="${col}"/><rect x="-2.8" y="9" width="5.5" height="4.5" rx="1.2" fill="${col}"/></g>`;
  const grail = (x, y, col) => `<g transform="translate(${x} ${y})">
    <path d="M-8-11h16l-2 8q-6 5-12 0zM0-3v9M-7 6h14" ${LN(col, 2.5)}/></g>`;
  const book = (x, fill, ln) => `<rect x="${x - 34}" y="44" width="68" height="76" rx="4" ${OP(fill)}/>
    <path d="M${x - 25} 49V115" ${LN(ln, 1.8)} opacity=".8"/>`;
  return `<svg viewBox="0 0 240 150" fill="none">
  ${book(62, PAPER, d)}${crown(68, 82, 1.6, d, PAPER)}
  ${book(178, d, "#fff")}${crown(184, 64, 1.1, "#fff", d)}
  ${table38(174, 98, "#fff")}${grail(203, 98, "#fff")}
  ${arrow({ x1:100, y1:82, x2:140, y2:82, c:d })}
  ${tag({ x:62, y:22, text:"1136", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:178, y:22, text:"12–15세기", c:d, lvl:"v" })}
  ${text(62, 140, "왕 한 사람", "vs", MID)}
  ${text(178, 140, "덧붙은 층들", "vs", MID)}</svg>`; },
 /* 39 — 점토판: 곡물 이삭과 소, 그 옆의 수량 빗금 (시도 법도 아니다) */
 "39":(c,t,d)=>{
  const ear = (x, y, rot, col) => `<g transform="translate(${x} ${y}) rotate(${rot})">
    <path d="M0-11q6 6 0 15q-6-9 0-15z" ${OP(PAPER, 1.6)}/><path d="M0-8v10" ${LN(col, 1.3)}/></g>`;
  return `<svg viewBox="0 0 240 150" fill="none">
  <rect x="30" y="20" width="150" height="88" rx="9" ${OP(PAPER)}/>
  <path d="M38 64h134" ${LN(LIGHT, SW.hair)}/>
  <g><path d="M56 54L44 36M56 54L56 34M56 54L68 36" ${LN(INK, 2)}/>
   ${ear(44, 34, -18, c)}${ear(56, 31, 0, c)}${ear(68, 34, 18, c)}</g>
  ${[0,1,2,3,4,5].map(i=>`<path d="M${88+i*14} 34v20" ${LN(c, SW.line)}/>`).join("")}
  <g transform="translate(56 87)">
   <path d="M-12-10q-6-5-2-9t8 5M12-10q6-5 2-9t-8 5" ${LN(INK, 2)}/>
   <path d="M-11-9h22v9q0 9-11 9t-11-9z" ${OP(PAPER)}/>
   <circle cx="-5" cy="-3" r="1.8" fill="${INK}"/><circle cx="5" cy="-3" r="1.8" fill="${INK}"/>
   <path d="M-6 2h12v3q0 4-6 4t-6-4z" fill="${c}"/></g>
  ${[0,1,2,3].map(i=>`<path d="M${88+i*14} 78v20" ${LN(c, SW.line)}/>`).join("")}
  ${text(206, 48, "곡물", "vs", MID)}
  ${text(206, 92, "가축", "vs", MID)}
  ${tag({ x:120, y:130, text:"회계 기록", c:d, lvl:"v" })}</svg>`; },
 /* 40 — 위원회 한 곳에서 이듬해 여러 곳으로: 같은 점 하나가 선으로 이어진 망이 된다 */
 "40":(c,t,d)=>{
  const NX = 172, NY = 82, NR = 36;
  const pts = Array.from({ length: 10 }, (_, i) => { const a = (-90 + i * 36) * Math.PI / 180; return { x: NX + NR * Math.cos(a), y: NY + NR * Math.sin(a) }; });
  return `<svg viewBox="0 0 240 150" fill="none">
  <circle cx="52" cy="82" r="14" ${OP(c)}/><circle cx="52" cy="82" r="6.5" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/>
  ${arrow({ x1:76, y1:82, x2:118, y2:82, c:d })}
  ${pts.map(p=>`<path d="M${NX} ${NY}L${p.x.toFixed(1)} ${p.y.toFixed(1)}" ${LN(c, SW.hair)}/>`).join("")}
  ${pts.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5.5" fill="${d}"/>`).join("")}
  <circle cx="${NX}" cy="${NY}" r="12" ${OP(c)}/><circle cx="${NX}" cy="${NY}" r="5.5" fill="none" stroke="#fff" stroke-width="1.5" opacity=".8"/>
  ${tag({ x:52, y:22, text:"1772", c:d, fill:"#fff", lvl:"v" })}
  ${tag({ x:172, y:22, text:"1773", c:d, lvl:"v" })}
  ${text(52, 140, "위원회 한 곳", "vs", MID)}
  ${text(172, 140, "100곳 넘게", "vs", MID)}</svg>`; },
};

module.exports = { icons, scenes, STRIP, VIG, SCENECAP, VIGCAP };
