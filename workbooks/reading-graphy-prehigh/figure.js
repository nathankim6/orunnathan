/* ═══ 인물 작화 시스템 (교과서 삽화 작가 스타일 · 플랫 벡터 + 잉크 외곽선 + 2톤 셀 셰이딩) ═══
   좌표계: 발밑 중앙 원점, 키 150(4.4등신).
   앵커 상수: 머리 중심 -134 · 머리 반폭 17 · 턱 -115 · 목 -122~-108 · 어깨 y -104 x ±21
              허리 -62 x ±17 · 무릎 -34 · 발목 -8
   레이어(뒤→앞): 바닥 그림자 → 뒤팔+뒤손 → 뒷머리 → 다리 → 신발 → 목 → 몸통 → 몸통 그늘 → 칼라
                 → 앞팔 → held 소품 → 앞손 → 머리(턱) → 귀 → 앞머리 → 모자 챙 → 얼굴
   person({x,y,s,c,pose,hair,face,brow,look,hairc,legc,flip,skin,top,glasses,held,arms,head})
     pose  : down hold point think up wave cheer open shrug write carry  (arms:{L,R} 로 양팔 독립 지정 가능 — 이름 또는 {pts,hand,front,wrap,ang})
     legs  : stand step walk sit  (pose 가 point/open 이면 자동 step). stand 는 contrapposto: 왼발 뒤꿈치 8° 들림 + 상체 2°
     hair  : short bob long bun pony twin curly wavy buzz cap
     face  : smile glad laugh flat worry oh grin meh   brow: soft low up down one none
     head  : 머리 기울기(도, 목 기준) — 생각하는 인물 5°
     hold  : 소품을 양옆에서 잡는다 — 손바닥은 소품 뒤, 손등·손가락 3선·엄지가 소품 앞면에 걸친다 (wrap). holding() 이 소품 폭에 맞춰 손목을 잡는다
     skin  : light tan brown
     top   : tee(=crew) shirt hoodie sweater apron   sleeve: long(소매 밴드) short(팔뚝 노출)
     shoec : 신발색(기본 SHOE 갈색, 밑창 하이라이트 · 좌우 미러)   tilt: 기본 서기(stand) 상체 기울기 2° (contrapposto) */

const INK = "#3A2E27";            // 따뜻한 갈색 잉크 외곽선 (인물·소품 공용, 검정 아님)
const LW  = 1.8;                  // paint-order:stroke 로 절반(0.9)만 보인다 → s=1 에서 0.25mm
const HL  = LW / 2;               // 튜브(팔·다리) 잉크선 두께 계산용

/* ── 색 도우미 ── */
const hex = c => { const m = c.replace("#", ""); const n = m.length === 3 ? m.split("").map(x => x + x).join("") : m;
  return [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16)); };
const toHex = a => "#" + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, k) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * k)); };
const shade = c => mix(c, "#1F2438", .24);          // 색상 유지 셀 그늘 (남색 쪽으로 24%)
const light = c => mix(c, "#FFFFFF", .35);

const SKIN = {
  light: ["#F5DCC6", "#E3B99C", "#C98D6B"],
  tan:   ["#E2B48F", "#C79067", "#A66E48"],
  brown: ["#B07B55", "#8E5E3E", "#6B4430"],
  /* 구 API 호환 */ a: "#F5DCC6", b: "#E3B99C",
};
const HAIRC = ["#2B2926", "#3A2E2A", "#6B3A20", "#8A4B25", "#B8742F", "#7C7C82"];
const LEGC  = ["#4B556B", "#8C7A5B", "#5B6F8E", "#6E6E75"];
const SHOE  = "#6E5A4B";          // 신발 기본색 (검정 슬래브 금지)
const lerp  = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

/* 채움 + 잉크 외곽선 속성 묶음 */
const O = (fill, w = LW) => `fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke"`;
const L = (col, w) => `stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;

/* ── 관절 튜브: 점 3개(어깨→팔꿈치→손목)를 라운드 스트로크 2겹으로 ── */
function tube(pts, w, fill) {
  const d = "M" + pts.map(p => p.join(" ")).join(" L");
  return `<path d="${d}" ${L(INK, w + LW)}/><path d="${d}" ${L(fill, w)}/>`;
}

/* ── 포즈 사전: 어깨(±21,-104) → 팔꿈치 → 손목 ── */
const DOWN_L = [[-21, -104], [-25, -83], [-24, -61]];
const DOWN_R = [[21, -104], [25, -83], [24, -61]];
const ARMS = {
  down:  { L: DOWN_L, R: DOWN_R, hand: "fist" },
  hold:  { L: [[-21, -104], [-33, -91], [-24, -76]], R: [[21, -104], [33, -91], [24, -76]], hand: "grip", front: 1, wrap: 1, ang: { L: -12, R: 192 } },
  carry: { L: [[-21, -104], [-33, -91], [-24, -76]], R: [[21, -104], [33, -91], [24, -76]], hand: "grip", front: 1, wrap: 1, ang: { L: -12, R: 192 } },
  point: { L: DOWN_L, R: [[21, -104], [38, -95], [57, -106]], hand: "point" },
  think: { L: DOWN_L, R: [[21, -104], [40, -82], [14, -112]], hand: "fist" },   /* 팔꿈치를 바깥으로 — 팔뚝이 옆 갈래 머리(bob/long) 옆으로 보인다 */
  up:    { L: DOWN_L, R: [[21, -104], [37, -119], [33, -145]], hand: "open" },
  wave:  { L: DOWN_L, R: [[21, -104], [37, -119], [33, -145]], hand: "open" },
  cheer: { L: [[-21, -104], [-37, -119], [-33, -145]], R: [[21, -104], [37, -119], [33, -145]], hand: "open" },
  open:  { L: DOWN_L, R: [[21, -104], [37, -92], [53, -81]], hand: "open" },
  shrug: { L: [[-21, -104], [-35, -90], [-41, -75]], R: [[21, -104], [35, -90], [41, -75]], hand: "open" },
  write: { L: [[-21, -104], [-24, -84], [-7, -77]], R: [[21, -104], [27, -86], [9, -79]], hand: "grip", front: 1 },
};
/* 엉덩이(±9,-62) → 무릎 → 발목 */
const LEGS = {
  stand: { L: [[-9, -62], [-13, -35], [-15, -8]], R: [[9, -62], [10, -35], [10, -8]], foot: [[-15, -8, -1, 8], [10, -8, 1]] },
  step:  { L: [[-9, -62], [-16, -35], [-22, -8]], R: [[9, -62], [13, -36], [14, -8]], foot: [[-22, -8, -1], [14, -8, 1]] },
  walk:  { L: [[-9, -62], [-7, -36], [-18, -8]], R: [[9, -62], [16, -38], [13, -9]], foot: [[-18, -8, -1], [13, -9, 1]] },
  sit:   { L: [[-9, -62], [-22, -58], [-24, -14]], R: [[9, -62], [22, -58], [24, -14]], foot: [[-24, -8, -1], [24, -8, 1]], sit: 1 },
};

/* ── 손 4형 (손목 원점, +x 가 손가락 방향) ── */
function hand(type, sk, sg = -1) {
  const [a, b] = sk;
  switch (type) {
    case "open":   /* 벌린 손: 손바닥 + 엄지 + 손가락 4개(라운드 튜브) */
      return `<rect x="-6" y="-6" width="11" height="12.5" rx="4" ${O(a)}/>
        ${[-4.2, -1.2, 1.8, 4.6].map((y, i) => { const l = [5, 6, 5.5, 4][i];
          return `<path d="M3 ${y} h${l}" ${L(INK, 3.4 + LW)}/><path d="M3 ${y} h${l}" ${L(a, 3.4)}/>`; }).join("")}
        <circle cx="-3.5" cy="-7" r="2.6" ${O(a)}/>`;
    case "point":  /* 가리키는 손: 검지를 길게 */
      return `<circle r="5.6" ${O(a)}/>
        <path d="M2.5-3 l11.5-3.8 q2.6-.9 3.2 1.2 t-1.6 2.6 l-11.1 3.7z" ${O(a)}/>
        <circle cx="-1.8" cy="-5" r="2.3" ${O(a)}/>
        <path d="M-1 2.5 q3 2 6 .5" ${L(b, 1.1)}/>`;
    case "grip":   /* 쥔 손(펜 등): 마디선 2 */
      return `<rect x="-6" y="-6" width="12" height="12.5" rx="4" ${O(a)}/>
        <path d="M-1.5-6v4M2.5-6v4" ${L(b, 1.1)}/>
        <circle cx="-5" cy="2" r="2.4" ${O(a)}/>`;
    case "wrap_under": /* 소품을 옆에서 잡는 손 — 소품 뒤에 놓이는 손바닥 */
      return `<rect x="-7" y="-6.5" width="13" height="13" rx="4.5" ${O(a)}/>`;
    case "wrap_over":  /* 소품 앞면에 걸치는 손등 + 손가락 3선 + 엄지 (sg: 엄지 방향 ±1) */
      return `<rect x="0" y="-6.5" width="12.5" height="13" rx="4.2" ${O(a)}/>
        <path d="M4-3.3h6.3M4 0h6.8M4 3.3h6.3" ${L(b, 1.1)}/>
        <path d="M1.5 ${5 * sg} q4 .5 7.5 ${4 * sg}" ${L(INK, 3.6 + LW)}/><path d="M1.5 ${5 * sg} q4 .5 7.5 ${4 * sg}" ${L(a, 3.6)}/>`;
    case "cup_under":  /* 소품을 아래에서 받쳐 든 손 — 손바닥은 소품 뒤·아랫변 밑 (손목 원점, +x = 소품 쪽) */
      return `<rect x="-9.5" y="-6.5" width="13.5" height="13" rx="4.5" ${O(a)}/>`;
    case "cup_over":   /* 받쳐 든 손의 손가락 끝 3 + 엄지 — 소품 아랫변 위로 2–3px 만 걸친다 */
      return `${[-4, 0, 4].map(y => `<path d="M-2.5 ${y} h5" ${L(INK, 3.4 + LW)}/><path d="M-2.5 ${y} h5" ${L(a, 3.4)}/>`).join("")}
        <path d="M-5 ${6.5 * sg} L1.5 ${5.5 * sg}" ${L(INK, 3.6 + LW)}/><path d="M-5 ${6.5 * sg} L1.5 ${5.5 * sg}" ${L(a, 3.6)}/>`;
    default: /* fist: 느슨하게 쥔 손 */
      return `<circle r="5.6" ${O(a)}/><circle cx="-3" cy="-3.8" r="2.3" ${O(a)}/>
        <path d="M-.5 -1 q3 -2 5.5 -.5" ${L(b, 1.1)}/>`;
  }
}
/* 팔 튜브 2폭: 상완 wu · 전완 wf (한 단 가늘게). 잉크 외곽을 두 마디 먼저, 채움을 나중에 겹쳐 팔꿈치 이음매가 없다 */
function tube2(pts, wu, wf, fill) {
  const [s, e, w] = pts, d1 = `M${s[0]} ${s[1]} L${e[0]} ${e[1]}`, d2 = `M${e[0]} ${e[1]} L${w[0]} ${w[1]}`;
  return `<path d="${d1}" ${L(INK, wu + LW)}/><path d="${d2}" ${L(INK, wf + LW)}/><path d="${d1}" ${L(fill, wu)}/><path d="${d2}" ${L(fill, wf)}/>`;
}
/* 팔: 상완 12 · 전완 11. 긴소매 = 옷색 튜브 + 손목 쪽 소매 밴드(shade) · 반소매 = 살색 튜브 + 위팔만 옷색 */
const ARM_W = [12, 11];
function arm(pts, col, sk, sleeve) {
  const [s, e, w] = pts, [wu, wf] = ARM_W;
  if (sleeve === "short") return tube2(pts, wu, wf, sk[0]) + tube([s, lerp(s, e, .55)], wu + 2, col);
  const a = lerp(e, w, .74), b = lerp(e, w, .94);
  return tube2(pts, wu, wf, col) + `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" ${L(shade(col), wf)} stroke-linecap="butt"/>`;
}
function handAt(pts, type, sk, fixAng = null, sg = -1) {
  const [ex, ey] = pts[1], [wx, wy] = pts[2];
  const ang = fixAng === null ? Math.atan2(wy - ey, wx - ex) * 180 / Math.PI : fixAng;
  return `<g transform="translate(${wx} ${wy}) rotate(${(+ang).toFixed(1)})">${hand(type, sk, sg)}</g>`;
}
/* rot: 발끝을 축으로 뒤꿈치를 든다 (contrapposto 의 자유 다리) */
function shoe(x, y, dir, col = SHOE, rot = 0) {
  return `<g transform="translate(${x} ${y}) scale(${dir} 1)${rot ? ` rotate(${rot} 12 2)` : ""}">
    <path d="M-8 -5 h12 q7 0 8.5 5 l.5 4 q0 1.5-1.5 1.5 h-22 q-2 0-2-2 v-3 q0-5.5 4.5-5.5z" ${O(col)}/>
    <path d="M-9.5 2.5 h20" ${L(light(col), 1.1)}/>
    <path d="M-3 -4.5 q3 3 6 0" ${L(shade(col), 1)}/></g>`;
}

/* ── 몸통 / 목 / 칼라 ── */
const TORSO = `M-23 -96 c0-8 4-11 10-13 l13-3 l13 3 c6 2 10 5 10 13 l-4 34 h-38z`;
const TORSO_SHADE = `M13 -108 c6 2 10 5 10 12 l-4 34 h-8 l2-32 c0-6-2-10-5-12z M-19 -66 h38 l-.6 4 h-38z`;
const NECK = `M-6 -123 h12 v15 q-6 4-12 0z`;
/* 상의 5종: 목선 + 디테일. 몸통 색(c) 위에 얹는다 — 흰 칼라·shade 디테일·light 끈 */
const TOP = {
  tee:     c => `<path d="M-8 -108 q8 8 16 0" ${L(INK, 1.4)}/>
                 <path d="M6 -95 h9 v8 q-4.5 2-9 0z" ${L(shade(c), 1)}/>`,                      /* 가슴 주머니 */
  shirt:   c => `<path d="M-9 -110 l9 10 l-2-12z" ${O("#fff")}/><path d="M9 -110 l-9 10 l2-12z" ${O("#fff")}/>
                 <path d="M0 -100 v36" ${L(shade(c), 1)}/><circle cx="0" cy="-92" r="1.3" fill="${shade(c)}"/><circle cx="0" cy="-80" r="1.3" fill="${shade(c)}"/>
                 <path d="M6 -94 h9 v9 h-9z" ${L(shade(c), 1)}/>`,
  hoodie:  c => `<path d="M-16 -108 q1-11 16-11 t16 11 q-8 6-16 6 t-16-6z" ${O(shade(c))}/>
                 <path d="M-4 -104 v12 M4 -104 v12" ${L(light(c), 1.2)}/>
                 <path d="M-13 -77 h26 v12 q-13 3-26 0z" ${O(shade(c), 1)}/>`,                 /* 캥거루 주머니 */
  sweater: c => `<path d="M-8 -110 l8 9 l8-9 l-3-3 h-10z" fill="#fff"/><path d="M-8 -110 l8 9 l8-9" ${L(INK, 1.3)}/>
                 <path d="M-19 -68 h38" ${L(shade(c), 1.2)}/>`,                                  /* V넥 + 밑단 리브 */
  apron:   c => `<path d="M-8 -108 q8 8 16 0" ${L(INK, 1.4)}/>
                 <path d="M-13 -94 h26 v32 h-26z" ${O(light(c), 1)}/><path d="M-13 -94 l-6-8 M13 -94 l6-8" ${L(shade(c), 1.3)}/>`,
};
TOP.crew = TOP.tee;

/* ── 머리(턱 있음) · 귀 ── */
const HEAD = `M-17 -134 q-1-19 17-19 t17 19 q0 10-6 15 q-5 4-11 4 t-11-4 q-6-5-6-15z`;
const EARS = a => `<path d="M-17 -137 q-4 0-4 4.5 t4 4.5z" ${O(a)}/><path d="M17 -137 q4 0 4 4.5 t-4 4.5z" ${O(a)}/>`;

/* ── 머리카락 10종: {back, front, extra} ── 두개골(반경 17~19)보다 +3 볼륨, 하이라이트 1개 ── */
const HAIR = {
  short: {
    front: (h, hl) => `<path d="M-20 -134 c-1-17 8-25 20-25 s21 8 20 25 c-2-6-4-10-7-12 c-4 3-9 4-14 3 c-6-1-11-3-15-6 c-3 3-4 7-4 15z" ${O(h)}/>
      <path d="M-11 -150 q9-6 20-3" ${L(hl, 1.6)}/>`,
  },
  buzz: {
    front: (h, hl) => `<path d="M-19 -136 c-1-15 7-22 19-22 s20 7 19 22 c-3-5-6-8-9-9 c-6 2-14 2-20 0 c-4 1-7 4-9 9z" ${O(h)}/>`,
  },
  bob: {
    back: (h, hl) => `<path d="M-21 -140 q0-16 21-16 t21 16 v28 q0 8-8 8 h-26 q-8 0-8-8z" ${O(h)}/>`,
    front: (h, hl) => `<path d="M-20 -134 c-1-17 8-25 20-25 s21 8 20 25 l-1 6 c-1-9-4-14-7-17 c-8 5-18 5-26 0 c-3 3-5 8-5 15z" ${O(h)}/>
      <path d="M-21 -130 q-3 12-1 24 q1 5 5 6 l3 0 q-4-14-2-30z" ${O(h)}/>
      <path d="M21 -130 q3 12 1 24 q-1 5-5 6 l-3 0 q4-14 2-30z" ${O(h)}/>
      <path d="M-10 -151 q9-6 20-3" ${L(hl, 1.6)}/>`,
  },
  long: {
    back: (h, hl) => `<path d="M-22 -140 q0-16 22-16 t22 16 v44 q0 12-10 12 h-24 q-10 0-10-12z" ${O(h)}/>`,
    front: (h, hl) => `<path d="M-20 -134 c-1-17 8-25 20-25 s21 8 20 25 l-2 4 c0-9-3-15-6-18 c-8 6-18 6-26 1 c-3 4-4 9-4 14z" ${O(h)}/>
      <path d="M-20 -130 q-4 14-2 30 q1 4 4 5 l3 0 q-4-16-2-32z" ${O(h)}/>
      <path d="M20 -130 q4 14 2 30 q-1 4-4 5 l-3 0 q4-16 2-32z" ${O(h)}/>
      <path d="M-10 -151 q9-6 20-3" ${L(hl, 1.6)}/>`,
  },
  wavy: {
    back: (h, hl) => `<path d="M-22 -140 q0-16 22-16 t22 16 v20 q3 8-2 14 q4 8-2 14 q-3 4-8 4 h-20 q-5 0-8-4 q-6-6-2-14 q-5-6-2-14z" ${O(h)}/>`,
    front: (h, hl) => `<path d="M-20 -134 c-1-17 8-25 20-25 s21 8 20 25 l-2 4 c0-9-3-15-6-18 c-4 4-8 5-13 3 c-5 2-10 1-13-2 c-3 4-4 9-4 14z" ${O(h)}/>
      <path d="M-20 -130 q-5 10-1 20 q-4 8 1 16 l4 0 q-3-9 0-16 q-3-10 0-20z" ${O(h)}/>
      <path d="M20 -130 q5 10 1 20 q4 8-1 16 l-4 0 q3-9 0-16 q3-10 0-20z" ${O(h)}/>
      <path d="M-10 -151 q9-6 20-3" ${L(hl, 1.6)}/>`,
  },
  bun: {
    back: (h, hl) => `<circle cx="7" cy="-160" r="8.5" ${O(h)}/><path d="M3 -166 q6-2 9 3" ${L(hl, 1.4)}/>`,
    front: (h, hl) => `<path d="M-20 -134 c-1-17 8-25 20-25 s21 8 20 25 c-2-6-4-9-6-11 c-7 3-16 4-24 1 c-4 2-7 5-10 10z" ${O(h)}/>
      <path d="M-12 -150 q10-5 22 0" ${L(hl, 1.6)}/><path d="M-4 -153 q6 3 10-1" ${L(INK, 1.1)}/>`,
    extra: 24,
  },
  pony: {
    back: (h, hl) => `<path d="M12 -150 q20 2 18 24 q-1 18-10 30 q-3-2-4-6 q6-10 6-22 q-1-12-12-16z" ${O(h)}/>`,
    front: (h, hl) => `<path d="M-20 -134 c-1-17 8-25 20-25 s21 8 20 25 c-2-6-4-9-6-11 c-7 3-16 4-24 1 c-4 2-7 5-10 10z" ${O(h)}/>
      <path d="M-11 -151 q9-5 20-2" ${L(hl, 1.6)}/><path d="M12 -149 q3 3 6 0" ${L(INK, 1.1)}/>`,
    extra: 6,
  },
  twin: {
    back: (h, hl) => `<path d="M-19 -134 q-10 4-12 22 q-1 12 4 20 q3-2 4-6 q-3-8-1-16 q2-12 8-16z" ${O(h)}/>
      <path d="M19 -134 q10 4 12 22 q1 12-4 20 q-3-2-4-6 q3-8 1-16 q-2-12-8-16z" ${O(h)}/>`,
    front: (h, hl) => `<path d="M-20 -134 c-1-17 8-25 20-25 s21 8 20 25 l-1 5 c0-9-3-14-6-17 c-8 5-18 5-26 0 c-3 3-5 7-6 12z" ${O(h)}/>
      <path d="M-11 -151 q9-5 20-2" ${L(hl, 1.6)}/>`,
  },
  curly: {
    back: (h, hl) => `<path d="M-24 -136 q-2-22 24-22 t24 22 q4 5 0 10 q4 6-1 11 q3 6-4 8 h-38 q-7-2-4-8 q-5-5-1-11 q-4-5 0-10z" ${O(h)}/>`,
    front: (h, hl) => `<path d="M-22 -134 c-2-19 10-27 22-27 s24 8 22 27 c-2-5-5-7-8-4 c-2-6-6-7-9-2 c-3-6-7-6-10 0 c-3-5-7-5-9 1 c-3-4-6-3-8 5z" ${O(h)}/>
      <circle cx="-22" cy="-138" r="4" ${O(h)}/><circle cx="22" cy="-138" r="4" ${O(h)}/><circle cx="-14" cy="-153" r="4" ${O(h)}/><circle cx="14" cy="-153" r="4" ${O(h)}/><circle cx="0" cy="-158" r="4" ${O(h)}/>
      <path d="M-13 -151 q8-7 17-4" ${L(hl, 1.6)}/>`,
  },
  cap: {
    front: (h, hl) => `<path d="M-20 -134 c-1-17 8-25 20-25 s21 8 20 25 c-2-6-4-10-7-12 c-4 3-9 4-14 3 c-6-1-11-3-15-6 c-3 3-4 7-4 15z" ${O(h)}/>`,
    hat: (h, hl, capc) => `<path d="M-21 -140 a21 19 0 0 1 42 0 q-21 5-42 0z" ${O(capc)}/>
      <path d="M-22 -141 h34 q12 0 14 6 l-48 1z" ${O(shade(capc))}/>
      <path d="M-2 -158 q10-1 16 5" ${L(light(capc), 1.6)}/>`,
    extra: 4,
  },
};

/* ── 표정 ── */
const MOUTH = {
  smile: `<path d="M-5.5 6 q5.5 6 11 0" ${L(INK, 1.8)}/>`,
  glad:  `<path d="M-6 5 q6 8 12 0 q-6 2.5-12 0z" ${O("#7A2E2A", 1.6)}/>`,
  laugh: `<path d="M-7 4 q7 11 14 0z" ${O("#7A2E2A", 1.6)}/><path d="M-4.5 4.6 h9 v2.2 q-4.5 1.2-9 0z" fill="#fff"/>`,
  flat:  `<path d="M-4.5 6.5 h9" ${L(INK, 1.8)}/>`,
  meh:   `<path d="M-4 7.5 q4-3.6 8 0" ${L(INK, 1.8)}/>`,          /* 작은 ㅅ — '밋밋한데…' (flat 은 화난 얼굴로 읽힌다) */
  worry: `<path d="M-5 8 q5-5 10 0" ${L(INK, 1.8)}/>`,
  oh:    `<ellipse cx="0" cy="7" rx="3" ry="3.8" ${O("#7A2E2A", 1.6)}/>`,
  grin:  `<path d="M-6 6 q6 5 12 0" ${L(INK, 1.8)}/><circle cx="7" cy="5.5" r="1.1" fill="${INK}"/>`,
};
const BROW = {
  none: ``,
  soft: `<path d="M-9.5-8.5 q3.5-1.6 7-.4 M2.5-8.9 q3.5-1.2 7 .4" ${L(INK, 1.7)}/>`,
  low:  `<path d="M-9.5-7.2 q3.5-1 7-.2 M2.5-7.4 q3.5-.8 7 .2" ${L(INK, 1.7)}/>`,   /* 살짝 내린 눈썹 (meh 용) */
  up:   `<path d="M-10-8 q4-3.5 8-1.5 M2-9.5 q4-2 8 1.5" ${L(INK, 1.7)}/>`,
  down: `<path d="M-10-10.5 q4 2 8 .8 M2-9.7 q4-1.2 8-1" ${L(INK, 1.7)}/>`,
  one:  `<path d="M-9.5-8 q3.5-1.2 7-.2 M2-11 q4-2.5 8 0" ${L(INK, 1.7)}/>`,
};
const EYES = `<circle cx="-6" cy="-2" r="2.5" fill="${INK}"/><circle cx="6" cy="-2" r="2.5" fill="${INK}"/>
  <circle cx="-6.8" cy="-2.9" r=".9" fill="#fff"/><circle cx="5.2" cy="-2.9" r=".9" fill="#fff"/>`;
const GLASSES = `<circle cx="-6" cy="-2" r="5.6" ${L(INK, 1.5)}/><circle cx="6" cy="-2" r="5.6" ${L(INK, 1.5)}/>
  <path d="M-.4-2.5 h.8 M-11.6-3 l-5-1.5 M11.6-3 l5-1.5" ${L(INK, 1.5)}/>`;

/* ── 앵커: 소품·풍선 배치는 항상 여기서 계산한다 ── */
function anchors(o = {}) {
  const { x = 0, y = 0, s = 1, flip = 0, pose = "down", hair = "short" } = o;
  const P = ARMS[pose] || ARMS.down, ex = (HAIR[hair] || {}).extra || 3;
  const w = ([px, py]) => ({ x: x + (flip ? -px : px) * s, y: y + py * s });
  const a = o.arms || {};
  const Lp = a.L?.pts || ARMS[a.L]?.L || P.L, Rp = a.R?.pts || ARMS[a.R]?.R || P.R;
  return { wristL: w(Lp[2]), wristR: w(Rp[2]), chin: w([0, -115]), mouth: w([0, -128]),
           headTop: w([0, -153 - ex]), shoulderR: w([21, -104]), shoulderL: w([-21, -104]),
           hip: w([0, -62]), hands: w([0, -77]), eye: w([0, -136]) };
}

function figure(o = {}) {
  const { x = 0, y = 0, s = 1, c = "#5B57A6", pose = "down", hair = "short", face = "smile",
          brow = "soft", look = 0, hairc = "#3A3330", flip = 0, skin = "light", top = "tee",
          glasses = 0, held = "", capc = "", sleeve = "long", shoec = SHOE, tilt = 2, head = 0 } = o;
  let { legc } = o; if (!legc || legc === "#414A5E") legc = LEGC[0];
  const sk = Array.isArray(skin) ? skin : (SKIN[skin] || SKIN.light);
  const P = ARMS[pose] || ARMS.down;
  const A = o.arms || {};
  /* 팔 사양: 이름(ARMS 키) 또는 {pts,hand,front,wrap,ang} 객체 */
  const spec = side => { const a = A[side]; if (a && typeof a === "object") return a;
    const E = ARMS[a] || P; return { pts: E[side], hand: E.hand, front: E.front, wrap: E.wrap, ang: E.ang ? E.ang[side] : null }; };
  const SL = spec("L"), SR = spec("R");
  const Lp = SL.pts, Rp = SR.pts;
  const legs = LEGS[o.legs] || LEGS[(pose === "point" || pose === "open" || pose === "shrug") ? "step" : "stand"];
  const hr = HAIR[hair] || HAIR.short;
  const hl = mix(hairc, "#fff", .35);
  const front = !!(P.front || SL.front);                  // 두 팔 모두 앞 레이어(들기)
  /* wrap 손(소품 잡기): 손바닥은 소품 뒤(under), 손등·손가락·엄지는 소품 앞(over). hand:"cup" 이면 아래에서 받쳐 든 손(손가락 끝만 앞) */
  const handOf = (S, side) => {
    if (S.wrap) { const sg = side === "L" ? -1 : 1, ang = S.ang ?? (side === "L" ? -12 : 192), k = S.hand === "cup" ? "cup" : "wrap";
      return { under: handAt(S.pts, k + "_under", sk, ang, sg), over: handAt(S.pts, k + "_over", sk, ang, sg) }; }
    const h = handAt(S.pts, S.hand, sk, S.ang ?? null); return { under: "", over: h };
  };
  const HL = handOf(SL, "L"), HR = handOf(SR, "R");
  const tL = arm(Lp, front ? c : shade(c), sk, sleeve), tR = arm(Rp, c, sk, sleeve);
  /* 손목이 턱(−115)보다 위로 올라간 팔(think 등)은 머리·머리카락 뒤에 묻히지 않도록 머리 그룹 뒤(맨 위 레이어)에 그린다 */
  const raisedL = Lp[2][1] < -115 && !SL.wrap, raisedR = Rp[2][1] < -115 && !SR.wrap;
  const rot = (legs === LEGS.stand && tilt) ? ` transform="rotate(${-tilt} 0 -62)"` : "";   /* contrapposto: 상체를 엉덩이 기준 2° */
  const hrot = head ? ` transform="rotate(${head} 0 -118)"` : "";                            /* 머리 기울기: 목 기준 */
  const capcol = capc || shade(c);
  const b = BROW[brow === "none" && face !== "flat" ? "soft" : brow] ?? BROW.soft;
  return `<g data-fig="1" transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
   <ellipse cx="2" cy="2" rx="28" ry="5" fill="${INK}" opacity=".10"/>
   ${tube(legs.L, 15, legc)}${tube(legs.R, 15, shade(legc))}
   ${legs.foot.map(([fx, fy, d, r]) => shoe(fx, fy, d, shoec, r || 0)).join("")}
   <g${rot}>
   ${front ? "" : tL + HL.under + HL.over}
   ${hr.back ? `<g${hrot}>${hr.back(hairc, hl)}</g>` : ""}
   <path d="${NECK}" ${O(sk[1])}/>
   <path d="${TORSO}" ${O(c)}/>
   <path d="${TORSO_SHADE}" fill="${shade(c)}"/>
   ${(TOP[top] || TOP.tee)(c)}
   ${front && !raisedL ? tL : ""}${raisedR ? "" : tR}
   ${front && !raisedL ? HL.under : ""}${raisedR ? "" : HR.under}
   ${held}
   ${front && !raisedL ? HL.over : ""}${raisedR ? "" : HR.over}
   <g${hrot}>
   <path d="${HEAD}" ${O(sk[0])}/>
   <path d="M-11 -118 q11 6 22 0 q-5 5-11 5 t-11-5z" fill="${sk[1]}"/>
   ${EARS(sk[0])}
   ${hr.front ? hr.front(hairc, hl) : ""}
   ${hr.hat ? hr.hat(hairc, hl, capcol) : ""}
   <g transform="translate(${look} -134)">
     ${b}${EYES}${glasses ? GLASSES : ""}
     <circle cx="-10.5" cy="3.5" r="3" fill="#E8897A" opacity=".35"/><circle cx="10.5" cy="3.5" r="3" fill="#E8897A" opacity=".35"/>
     ${MOUTH[face] || MOUTH.smile}
   </g>
   </g>
   ${raisedL ? tL + HL.under + HL.over : ""}${raisedR ? tR + HR.under + HR.over : ""}
   </g>
  </g>`;
}
module.exports = { figure, anchors, ARMS, INK, SKIN, HAIRC, LEGC, SHOE, TOP, mix, shade, light, LW };
