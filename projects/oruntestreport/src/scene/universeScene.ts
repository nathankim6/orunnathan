import * as THREE from 'three';

/**
 * ORUN UNIVERSE — 앱 전체 배경 무대 (리포트 화면 제외)
 *
 * orunaistudio 의 시네마 장면(orunScene.js · cinematicEffects.ts)에서 별밭·성운·
 * 은하 원반·유성·카메라 리그를 들어내고, 이 앱에 맞게 가볍게 줄였다.
 *
 * 구성 (뒤에서 앞으로)
 *   1. 하늘 — 화면 전체 성운/오로라 색면 (domain-warped fbm)
 *   2. 별밭 — 원·중·근 세 겹 점 구름, 흑체 색, 파레토 밝기, 반짝임, 밝은 별의 회절 스파이크
 *   3. 나선 은하 — 점 2만여 개 + 팔의 확산광 시트(먼지 띠 포함) + 팽대부 광채
 *   4. 유성 — 십수 초마다 한 줄
 *   5. 근접 먼지 — 카메라 시차를 만드는 작은 입자
 *
 * 규칙
 *   - 셰이더 출력은 표시값(display-referred)이다. 색 관리는 끄고, 톤매핑도 하지 않는다.
 *   - prefers-reduced-motion 이면 한 프레임만 그리고 멈춘다(정적 별밭).
 *   - 탭이 가려지면 멈춘다. 모바일과 긴 스크롤 뒤에서는 30fps 로 낮춘다.
 *   - dispose() 는 geometry · material · renderer 를 모두 해제한다.
 */

THREE.ColorManagement.enabled = false;

export type UniverseVariant = 'cinema' | 'subtle';

export interface UniverseSceneHandle {
  setPaused(paused: boolean): void;
  setVariant(variant: UniverseVariant): void;
  dispose(): void;
}

export interface UniverseSceneOptions {
  variant?: UniverseVariant;
  onReady?: () => void;
}

/* ───────────────────────── 유틸 ───────────────────────── */

/** universe.css 의 `--u-*` 토큰("H S% L%")을 three 색으로 */
function tokenColor(name: string, fallback: string): THREE.Color {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const m = raw.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
    if (m) return new THREE.Color().setHSL(Number(m[1]) / 360, Number(m[2]) / 100, Number(m[3]) / 100);
  } catch {
    /* SSR 등 — 폴백 사용 */
  }
  return new THREE.Color(fallback);
}

function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  const rnd = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
  let spare: number | null = null;
  const gauss = () => {
    if (spare !== null) { const v = spare; spare = null; return v; }
    const u = Math.max(1e-7, rnd());
    const t = 2 * Math.PI * rnd();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(t);
    return r * Math.cos(t);
  };
  return { rnd, gauss };
}

/** 흑체 온도 → 정규화 RGB (색조만 싣고 밝기는 따로) */
function blackbody(kelvin: number): [number, number, number] {
  const t = kelvin / 100;
  let r: number, g: number, b: number;
  if (t <= 66) { r = 255; g = 99.4708025861 * Math.log(t) - 161.1195681661; }
  else { r = 329.698727446 * Math.pow(t - 60, -0.1332047592); g = 288.1221695283 * Math.pow(t - 60, -0.0755148492); }
  if (t >= 66) b = 255;
  else if (t <= 19) b = 0;
  else b = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  r = Math.min(255, Math.max(0, r)) / 255;
  g = Math.min(255, Math.max(0, g)) / 255;
  b = Math.min(255, Math.max(0, b)) / 255;
  const m = Math.max(r, g, b) || 1;
  return [r / m, g / m, b / m];
}

const CLASSES: Array<[number, number, number]> = [
  [0.03, 11000, 28000], [0.085, 7600, 10500], [0.14, 6100, 7500],
  [0.205, 5300, 6000], [0.315, 3900, 5200], [0.225, 2700, 3800],
];

const NOISE_GLSL = /* glsl */ `
  float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float n = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { n += a * vnoise(p); p = mat2(0.8, 0.6, -0.6, 0.8) * p * 2.03 + 3.7; a *= 0.5; }
    return n;
  }
`;

function additive(uniforms: Record<string, THREE.IUniform>, vertexShader: string, fragmentShader: string, extra: Partial<THREE.ShaderMaterialParameters> = {}) {
  return new THREE.ShaderMaterial({
    uniforms, vertexShader, fragmentShader,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true,
    ...extra,
  });
}

/* ───────────────────────── 1. 하늘(성운) ───────────────────────── */

function makeSky(colors: { violet: THREE.Color; cool: THREE.Color; warm: THREE.Color; hot: THREE.Color }) {
  const uniforms = {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uIntensity: { value: 1 },
    uPointer: { value: new THREE.Vector2() },
    uViolet: { value: colors.violet },
    uCool: { value: colors.cool },
    uWarm: { value: colors.warm },
    uHot: { value: colors.hot },
  };
  const material = additive(uniforms,
    /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`,
    /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime, uAspect, uIntensity;
      uniform vec2 uPointer;
      uniform vec3 uViolet, uCool, uWarm, uHot;
      ${NOISE_GLSL}
      void main() {
        vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) + uPointer * 0.03;
        vec2 q = p * 2.4 + vec2(uTime * 0.009, -uTime * 0.004);
        float warp = fbm(q + fbm(q * 1.4));
        float filament = pow(max(0.0, 1.0 - abs(fbm(q * 3.0 + warp) * 2.0 - 1.0)), 5.0);
        /* 왼쪽 위에서 오른쪽 아래로 흐르는 성운 띠 */
        float band = exp(-pow((p.y + 0.06 - p.x * 0.38 + warp * 0.24) * 3.2, 2.0));
        float cloud = pow(warp, 2.2) * band;
        float voids = smoothstep(0.2, 0.7, fbm(q * 1.7 + 8.0));
        vec3 tint = mix(uViolet, uCool, smoothstep(-0.6, 0.7, p.x + p.y * 0.5));
        vec3 col = tint * (cloud * 0.4 + filament * cloud * 0.26) * voids;
        /* 은하 부근의 따뜻한 빛무리 */
        vec2 g = (p - vec2(0.42, -0.2)) * vec2(1.0, 1.55);
        float warmGlow = exp(-dot(g, g) * 2.6) * (0.5 + 0.5 * fbm(q * 1.2 + 4.0));
        col += uWarm * warmGlow * 0.2;
        /* 왼쪽 위의 차가운 오로라 커튼 */
        vec2 a = (p - vec2(-0.5, 0.32)) * vec2(1.4, 1.0);
        float curtain = pow(max(0.0, 1.0 - abs(fbm(q * 2.2 + vec2(0.0, uTime * 0.02)) * 2.0 - 1.0)), 3.0);
        col += uHot * exp(-dot(a, a) * 1.8) * curtain * 0.18;
        float edge = 0.45 + 0.55 * smoothstep(0.0, 0.3, vUv.y) * (1.0 - smoothstep(0.82, 1.0, vUv.y));
        gl_FragColor = vec4(col * uIntensity * edge, 1.0);
      }
    `,
    { depthTest: false },
  );
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -100;
  return { mesh, uniforms };
}

/* ───────────────────────── 2. 별밭 ───────────────────────── */

interface StarLayerConfig {
  count: number; radius: number; alpha: number; fClamp: number; k: number;
  bandFrac: number; bandWidth: number; order: number; bright?: boolean; parent?: number;
}

function makeStars(rng: ReturnType<typeof makeRng>, compact: boolean, hero: THREE.Color) {
  const { rnd, gauss } = rng;
  const uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uExposure: { value: 1 },
    uTwinkle: { value: 0.5 },
    uCoreSigma: { value: 0.72 },
    uWing: { value: 0.014 },
  };

  /* 은하수 띠 — 화면을 비스듬히 가로지르는 과밀 대원 */
  const bandNormal = new THREE.Vector3(0.36, 0.86, 0.36).normalize();
  const bandU = new THREE.Vector3().crossVectors(bandNormal, new THREE.Vector3(1, 0, 0)).normalize();
  const bandV = new THREE.Vector3().crossVectors(bandNormal, bandU).normalize();
  const dir = new THREE.Vector3();
  const sampleDir = (bandFrac: number, bandWidth: number) => {
    if (rnd() < bandFrac) {
      let lat = gauss() * bandWidth * (rnd() < 0.55 ? 0.55 : 1.7);
      lat = Math.max(-1.4, Math.min(1.4, lat));
      const az = rnd() * Math.PI * 2;
      const cl = Math.cos(lat), sl = Math.sin(lat);
      dir.set(0, 0, 0).addScaledVector(bandU, cl * Math.cos(az)).addScaledVector(bandV, cl * Math.sin(az)).addScaledVector(bandNormal, sl);
    } else {
      const z = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(Math.max(0, 1 - z * z));
      dir.set(s * Math.cos(th), z, s * Math.sin(th));
    }
    return dir;
  };
  const sampleTemp = () => {
    const u = rnd();
    let acc = 0;
    for (let i = 0; i < CLASSES.length; i++) {
      acc += CLASSES[i][0];
      if (u <= acc || i === CLASSES.length - 1) return CLASSES[i][1] + rnd() * (CLASSES[i][2] - CLASSES[i][1]);
    }
    return 5500;
  };

  const vertexShader = /* glsl */ `
    attribute vec3 aColor; attribute vec4 aParam;
    uniform float uTime, uPixelRatio, uTwinkle;
    varying vec3 vCol; varying float vAmp; varying float vSize;
    void main() {
      float small = smoothstep(40.0, 4.0, aParam.x);
      float tw = 1.0 - uTwinkle * small * (0.5 + 0.5 * sin(uTime * aParam.w + aParam.z));
      vAmp = aParam.y * tw;
      vCol = aColor;
      vSize = clamp(aParam.x * uPixelRatio, 1.0, 72.0);
      gl_PointSize = vSize;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const fragmentShader = /* glsl */ `
    precision highp float;
    uniform float uExposure, uCoreSigma, uWing, uPixelRatio;
    varying vec3 vCol; varying float vAmp; varying float vSize;
    void main() {
      vec2 d = (gl_PointCoord - 0.5) * vSize;
      float r2 = dot(d, d);
      float s = uCoreSigma * uPixelRatio;
      float core = exp(-r2 / (2.0 * s * s));
      /* 센서를 넘긴 별만 번진다 — 밝기에 비례해 흰 심이 커진다 */
      float hw = clamp((vAmp - 0.55) * 0.55, 0.0, 1.0);
      float sh = 1.9 * uPixelRatio;
      float inner = 0.075 * hw * exp(-r2 / (2.0 * sh * sh));
      float wing = uWing * 3.0 * hw / (1.0 + pow(r2 / (sh * sh), 1.5));
      float hs = max(1.5, vSize * 0.16);
      float halo = 0.05 * hw * exp(-r2 / (2.0 * hs * hs));
      float a = vAmp * (core + inner + wing + halo);
      /* 밝은 별의 회절 스파이크 — 끝으로 갈수록 푸르게 */
      float sp = 0.0;
      if (vAmp > 1.2) {
        vec2 q = abs(d);
        float len = vSize * 0.46;
        float w = 0.75 * uPixelRatio;
        float armX = exp(-(q.y * q.y) / (2.0 * w * w)) * pow(max(0.0, 1.0 - q.x / len), 3.0);
        float armY = exp(-(q.x * q.x) / (2.0 * w * w)) * pow(max(0.0, 1.0 - q.y / len), 3.0);
        sp = (armX + armY) * (vAmp - 1.2) * 0.1;
      }
      vec3 c = vCol * a + mix(vCol, vec3(0.75, 0.84, 1.0), 0.45) * sp;
      gl_FragColor = vec4(c * uExposure, 1.0);
    }
  `;

  const heroDir = new THREE.Vector3(0.62, 0.3, -0.72).normalize();
  const build = (cfg: StarLayerConfig) => {
    const N = cfg.count;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const par = new Float32Array(N * 4);
    const parent = cfg.parent || 16000;
    for (let i = 0; i < N; i++) {
      let d = sampleDir(cfg.bandFrac, cfg.bandWidth);
      if (cfg.bright && i === 0) d = dir.copy(heroDir);
      const rr = cfg.radius * (0.92 + rnd() * 0.16);
      pos[i * 3] = d.x * rr; pos[i * 3 + 1] = d.y * rr; pos[i * 3 + 2] = d.z * rr;

      let amp: number, size: number, sat: number;
      if (cfg.bright) {
        /* 같은 파레토 법칙의 꼭대기 — 등급 사다리가 이어진다 */
        const f = Math.pow((i + 0.5) / parent, -cfg.alpha);
        const nf = Math.min(1, Math.max(0, (Math.log(f) - Math.log(cfg.fClamp)) / (Math.log(Math.pow(0.5 / parent, -cfg.alpha)) - Math.log(cfg.fClamp))));
        amp = Math.min(3.4, Math.max(0.9, cfg.k * f * 0.55));
        size = 16 + 48 * Math.pow(nf, 1.25);
        sat = 0.55 + 0.3 * nf;
      } else {
        const u = Math.max(1e-6, rnd());
        let f = Math.pow(u, -cfg.alpha);
        if (f > cfg.fClamp) f = cfg.fClamp;
        amp = cfg.k * f;
        size = 2.8 + 2.0 * Math.sqrt(f);
        sat = Math.min(1, 0.17 + 0.3 * Math.sqrt(f));
      }
      let c: [number, number, number];
      if (cfg.bright && i === 0) {
        const m = Math.max(hero.r, hero.g, hero.b) || 1;
        c = [hero.r / m, hero.g / m, hero.b / m];
        sat = 0.5; amp = 3.4; size = 74;
      } else {
        c = blackbody(sampleTemp());
      }
      col[i * 3] = 1 + (c[0] - 1) * sat;
      col[i * 3 + 1] = 1 + (c[1] - 1) * sat;
      col[i * 3 + 2] = 1 + (c[2] - 1) * sat;
      par[i * 4] = size;
      par[i * 4 + 1] = amp;
      par[i * 4 + 2] = rnd() * Math.PI * 2;
      par[i * 4 + 3] = 0.6 + rnd() * 2.2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geometry.setAttribute('aParam', new THREE.BufferAttribute(par, 4));
    const points = new THREE.Points(geometry, additive(uniforms, vertexShader, fragmentShader));
    points.frustumCulled = false;
    points.renderOrder = cfg.order;
    return points;
  };

  const K = 0.085, ALPHA = 0.62, KNEE = 9;
  const far = build({ count: compact ? 4200 : 9000, radius: 1700, alpha: ALPHA, fClamp: KNEE, k: K * 0.8, bandFrac: 0.6, bandWidth: 0.13, order: -94 });
  const mid = build({ count: compact ? 1600 : 3600, radius: 900, alpha: ALPHA, fClamp: KNEE, k: K, bandFrac: 0.42, bandWidth: 0.22, order: -93 });
  const bright = build({ count: compact ? 70 : 150, radius: 460, alpha: ALPHA, fClamp: KNEE, k: K, bandFrac: 0.7, bandWidth: 0.4, order: -92, bright: true, parent: 16000 });

  const root = new THREE.Object3D();
  const gFar = new THREE.Object3D(); gFar.add(far);
  const gMid = new THREE.Object3D(); gMid.add(mid);
  const gNear = new THREE.Object3D(); gNear.add(bright);
  root.add(gFar, gMid, gNear);

  return {
    object: root,
    uniforms,
    update(t: number) {
      gFar.rotation.y = t * 0.00055; gFar.rotation.x = t * 0.00019;
      gMid.rotation.y = t * 0.0013; gMid.rotation.z = t * 0.00036;
      gNear.rotation.y = t * 0.00235; gNear.rotation.x = -t * 0.0005;
    },
    dispose() { [far, mid, bright].forEach((p) => { p.geometry.dispose(); (p.material as THREE.Material).dispose(); }); },
  };
}

/* ───────────────────────── 3. 나선 은하 ───────────────────────── */

function makeGalaxy(rng: ReturnType<typeof makeRng>, compact: boolean) {
  const { rnd, gauss } = rng;
  const PITCH = 0.33, ARM_W = 0.105, SCALE_LEN = 0.285;
  const INVB = 1 / PITCH;
  const armPhase = (r: number) => { const la = Math.log(Math.max(r, 0.03)); return -la * INVB + 0.3 * Math.sin(la * 1.9 + 0.7) + 0.17 * Math.sin(la * 3.7 + 2.1); };
  const armWidth = (r: number) => ARM_W * (0.3 + r * 1.05);
  const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const lumDraw = (maxL: number) => Math.min(Math.pow(rnd(), -0.78), maxL);

  const discN = compact ? 9000 : 17000;
  const clusterN = compact ? 2200 : 4200;
  const bulgeN = compact ? 3200 : 6000;
  const haloN = compact ? 900 : 1800;
  const NTOT = discN + clusterN + bulgeN + haloN;
  const pos = new Float32Array(NTOT * 3);
  const col = new Float32Array(NTOT * 3);
  const lst = new Float32Array(NTOT * 3);
  let n = 0;
  const push = (x: number, y: number, z: number, r: number, g: number, b: number, lum: number, size: number, type: number) => {
    const i = n * 3;
    pos[i] = x; pos[i + 1] = y; pos[i + 2] = z;
    col[i] = r; col[i + 1] = g; col[i + 2] = b;
    lst[i] = lum; lst[i + 1] = size; lst[i + 2] = type;
    n++;
  };

  /* 원반 — 팔에 젊은 청백색, 그 사이에 늙은 황백색, 드문 적색 거성 */
  for (let i = 0; i < discN; i++) {
    let r: number;
    do { r = -SCALE_LEN * Math.log(1 - rnd()); } while (r > 1.06 || r < 0.015);
    const armP = 0.62 * smooth(0.05, 0.22, r) * (1 - 0.45 * smooth(0.7, 1.05, r));
    let th: number, inArm = false;
    if (rnd() < armP) {
      const w = armWidth(r);
      const pre = armPhase(r) + (rnd() < 0.5 ? 0 : Math.PI);
      th = pre + (gauss() * w * 0.8) / Math.max(r, 0.05);
      inArm = true;
    } else {
      th = rnd() * Math.PI * 2;
    }
    const young = inArm && rnd() < 0.55;
    const hz = (0.01 + 0.023 * r) * (young ? 0.42 : 1);
    const y = -hz * Math.log(1 - rnd() * 0.999) * (rnd() < 0.5 ? 1 : -1);
    const u = rnd();
    let cr: number, cg: number, cb: number, L: number, sz = 1;
    if (young) { const t = rnd(); cr = 0.56 + 0.3 * t; cg = 0.72 + 0.22 * t; cb = 1; L = lumDraw(90) * 1.5; }
    else if (u < 0.013) { cr = 1; cg = 0.6 + 0.16 * rnd(); cb = 0.3 + 0.16 * rnd(); L = 8 + lumDraw(160) * 2.2; sz = 1.15; }
    else { const q = rnd(); cr = 1; cg = 0.845 + 0.1 * q; cb = 0.66 + 0.2 * q; L = lumDraw(60); }
    const mg = 1 - 0.1 * Math.exp(-r * 3);
    push(r * Math.cos(th), y, r * Math.sin(th), cr, cg * mg, cb * mg * mg, L, sz, 0);
  }
  /* 팔 위의 성단과 분홍 HII 영역 */
  const nAss = compact ? 300 : 600;
  const per = Math.floor(clusterN / nAss);
  for (let a = 0; a < nAss; a++) {
    const r = 0.1 + Math.pow(rnd(), 0.62) * 0.86;
    const w = armWidth(r);
    const pre = armPhase(r) + (rnd() < 0.5 ? 0 : Math.PI);
    const th = pre + (0.62 * w * (0.45 + 0.9 * rnd()) + gauss() * w * 0.34) / r;
    const cx = r * Math.cos(th), cz = r * Math.sin(th), cy = (rnd() - 0.5) * 0.016;
    const rad = 0.012 + Math.pow(rnd(), 1.5) * 0.055;
    const strength = 0.11 + Math.pow(rnd(), 2.8) * 0.8;
    const nb = rnd() < 0.55 ? 1 + ((rnd() * 3.2) | 0) : 0;
    for (let b = 0; b < nb; b++) {
      push(cx + gauss() * rad * 0.75, cy + gauss() * 0.004, cz + gauss() * rad * 0.75, 1, 0.34 + 0.16 * rnd(), 0.4 + 0.2 * rnd(), (9 + 26 * rnd()) * strength, 1.8 + 3.6 * Math.pow(rnd(), 1.7), 1);
    }
    for (let s = 0; s < per - nb; s++) {
      const d = Math.pow(rnd(), 0.55) * rad, ph = rnd() * Math.PI * 2;
      const u = rnd();
      let cr: number, cg: number, cb: number, L: number;
      if (u < 0.055) { cr = 0.56 + 0.14 * rnd(); cg = 0.68 + 0.12 * rnd(); cb = 1; L = 9 + lumDraw(150) * 1.3; }
      else if (u < 0.075) { cr = 1; cg = 0.52; cb = 0.3; L = 8 + lumDraw(90); }
      else { cr = 0.54 + 0.26 * rnd(); cg = 0.7 + 0.2 * rnd(); cb = 1; L = lumDraw(70) * 1.4; }
      push(cx + Math.cos(ph) * d, cy + gauss() * 0.006, cz + Math.sin(ph) * d, cr, cg, cb, L * strength, 1, 0);
    }
  }
  /* 팽대부 */
  for (let i = 0; i < bulgeN; i++) {
    const r = 0.052 * Math.pow(-Math.log(1 - rnd() * 0.99999), 2.6);
    if (r > 0.42) { i--; continue; }
    const ct = rnd() * 2 - 1, st = Math.sqrt(1 - ct * ct), ph = rnd() * Math.PI * 2;
    const u = rnd();
    if (u < 0.02) push(r * st * Math.cos(ph), r * ct * 0.58, r * st * Math.sin(ph), 1, 0.585 + 0.13 * rnd(), 0.29 + 0.13 * rnd(), 10 + lumDraw(180) * 2, 1.12, 0);
    else { const q = rnd(); push(r * st * Math.cos(ph), r * ct * 0.58, r * st * Math.sin(ph), 1, 0.795 + 0.09 * q, 0.575 + 0.16 * q, lumDraw(55), 1, 0); }
  }
  /* 헤일로 */
  for (let i = 0; i < haloN; i++) {
    const r = Math.min(2.4, 0.18 * Math.pow(rnd(), -0.42));
    const ct = rnd() * 2 - 1, st = Math.sqrt(1 - ct * ct), ph = rnd() * Math.PI * 2;
    const q = rnd();
    push(r * st * Math.cos(ph), r * ct * 0.82, r * st * Math.sin(ph), 1, 0.8 + 0.1 * q, 0.6 + 0.16 * q, lumDraw(45) * 0.55, 1, 0);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, n * 3), 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(col.subarray(0, n * 3), 3));
  geometry.setAttribute('aLST', new THREE.BufferAttribute(lst.subarray(0, n * 3), 3));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2.6);

  const uniforms = {
    uTime: { value: 0 },
    uSpin: { value: 0.014 },
    uPixelH: { value: 400 },
    uSizeScale: { value: 0.0085 },
    uBright: { value: 0.1 },
  };
  const ROT = 'float omega(float r) { return uSpin * (0.62 + 1.05 * exp(-r * 4.5)); }';
  const points = new THREE.Points(geometry, additive(uniforms,
    /* glsl */ `
      uniform float uTime, uSpin, uPixelH, uSizeScale, uBright;
      attribute vec3 aColor; attribute vec3 aLST;
      varying vec3 vCol; varying float vSat; varying float vType;
      ${ROT}
      void main() {
        vec3 p = position;
        float r = length(p.xz);
        float a = omega(r) * uTime;
        float c = cos(a), s = sin(a);
        p = vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float dist = max(-mv.z, 1e-4);
        float lum = aLST.x;
        float sz = uSizeScale * aLST.y * pow(lum, 0.34) * (uPixelH / dist);
        float minS = mix(1.15, 1.7, aLST.z);
        float shrink = min(1.0, sz / minS);
        gl_PointSize = clamp(sz, minS, 40.0);
        float f = shrink * shrink;
        vCol = aColor * (lum * uBright * f);
        vSat = clamp(lum * uBright * 0.55, 0.0, 1.6);
        vType = aLST.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    /* glsl */ `
      precision highp float;
      varying vec3 vCol; varying float vSat; varying float vType;
      void main() {
        vec2 q = gl_PointCoord * 2.0 - 1.0;
        float d2 = dot(q, q);
        if (d2 > 1.0) discard;
        vec3 col;
        if (vType > 0.5) {
          float a = exp(-d2 * 5.0) + 0.18 * exp(-d2 * 1.1);
          col = vCol * a * 0.105;
        } else {
          float d = sqrt(d2);
          float core = exp(-d2 * 11.0);
          float halo = exp(-d * 3.0) * 0.17;
          col = vCol * (core + halo);
          col += vCol * core * core * vSat * 1.1;
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  ));
  points.frustumCulled = false;
  points.renderOrder = 12;

  /* 팔의 확산광 시트 — 별로 못 그린 미해상 빛 + 먼지 띠 */
  const sheetU = {
    uTime: uniforms.uTime, uSpin: uniforms.uSpin,
    uAmp: { value: 0.95 }, uInvB: { value: INVB }, uArmW: { value: ARM_W },
  };
  const sheetGeo = new THREE.PlaneGeometry(2.2, 2.2, 1, 1);
  sheetGeo.rotateX(-Math.PI / 2);
  const sheet = new THREE.Mesh(sheetGeo, additive(sheetU,
    /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime, uSpin, uAmp, uInvB, uArmW;
      ${NOISE_GLSL}
      ${ROT}
      float armPhase(float r) { float la = log(max(r, 0.03)); return -la * uInvB + 0.30 * sin(la * 1.9 + 0.7) + 0.17 * sin(la * 3.7 + 2.1); }
      void main() {
        vec2 p = vec2(vUv.x - 0.5, 0.5 - vUv.y) * 2.2;
        float r = length(p);
        if (r > 1.04) discard;
        float a = -omega(r) * uTime;
        float c = cos(a), s = sin(a);
        p = vec2(p.x * c - p.y * s, p.x * s + p.y * c);
        float w = uArmW * (0.30 + r * 1.05);
        float d = atan(p.y, p.x) - armPhase(r);
        d = mod(d + 1.5707963, 3.1415927) - 1.5707963;
        float ad = d * r;
        float f = fbm(p * 1.3 + vec2(2.5, -1.5));
        float az = fbm(p * 0.85 + vec2(-7.0, 3.0));
        float g = fbm(p * 7.0 + vec2(6.0, 1.0));
        float g2 = fbm(p * 17.0 + vec2(-2.0, 4.5));
        float sd = ad + (f - 0.5) * w * 1.7 + (g - 0.5) * w * 0.55;
        float arm = exp(-(sd * sd) / (w * w * 1.2)) * (0.42 + 1.2 * az);
        arm *= 0.46 + 1.7 * max(0.0, g - 0.36) + 1.3 * max(0.0, g2 - 0.52);
        float sd2 = ad - 1.3 * w + (f - 0.5) * w * 1.8;
        arm += 0.3 * exp(-(sd2 * sd2) / (w * w * 0.4)) * max(0.0, g - 0.42) * 2.4;
        /* 먼지 띠 — 팔 안쪽 가장자리를 따라 어둡게 */
        float ld = ad + 0.62 * w + (f - 0.5) * w * 1.3;
        float lane = exp(-(ld * ld) / (w * w * 0.3)) * smoothstep(0.06, 0.3, r) * (1.0 - smoothstep(0.7, 1.0, r)) * (0.3 + 1.4 * g);
        float mottle = 0.52 + 0.16 * g + 0.38 * g2;
        float inter = 0.02 + 0.13 * g2 + 0.06 * g;
        float prof = exp(-r / 0.285) * (1.0 - smoothstep(0.46 + 0.22 * az, 1.06, r));
        float I = prof * (inter + 2.3 * arm) * mottle * max(0.0, 1.0 - 0.75 * lane);
        vec3 warm = vec3(1.0, 0.86, 0.68), blue = vec3(0.62, 0.78, 1.0);
        float young = clamp(arm * 1.05 * smoothstep(0.06, 0.28, r) * (0.55 + 0.9 * g), 0.0, 1.0);
        vec3 kol = mix(warm, blue, young);
        kol = mix(kol, vec3(1.0, 0.88, 0.70), exp(-r * 7.0));
        kol = mix(kol, vec3(0.72, 0.84, 1.0), smoothstep(0.22, 0.95, r) * 0.4);
        kol += vec3(0.42, -0.02, 0.05) * clamp(arm - 0.4, 0.0, 1.2) * max(g2 - 0.5, 0.0) * 3.0;
        gl_FragColor = vec4(kol * I * uAmp, 1.0);
      }
    `,
    { side: THREE.DoubleSide },
  ));
  sheet.position.y = -0.0015;
  sheet.renderOrder = 10;

  /* 팽대부 광채 — 시선을 향하는 빌보드, 세르식 프로파일 */
  const glowU = { uSize: { value: 0.52 }, uAmp: { value: 0.42 }, uRe: { value: 0.105 } };
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), additive(glowU,
    /* glsl */ `
      uniform float uSize; varying vec2 vP;
      void main() { vP = position.xy; vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); mv.xy += position.xy * uSize; gl_Position = projectionMatrix * mv; }
    `,
    /* glsl */ `
      precision highp float;
      uniform float uAmp, uRe; varying vec2 vP;
      void main() {
        float r = length(vP);
        if (r > 1.0) discard;
        float I = exp(-7.67 * (pow(max(r, 0.002) / uRe, 0.357) - 1.0));
        I += 9.0 * exp(-r * r * 900.0);
        I *= 1.0 - smoothstep(0.7, 1.0, r);
        vec3 kol = mix(vec3(1.0, 0.95, 0.86), vec3(1.0, 0.74, 0.44), smoothstep(0.01, 0.42, r));
        gl_FragColor = vec4(kol * I * uAmp, 1.0);
      }
    `,
  ));
  glow.frustumCulled = false;
  glow.renderOrder = 11;

  const inner = new THREE.Object3D();
  inner.add(sheet, points, glow);
  const group = new THREE.Group();
  group.add(inner);

  return {
    group,
    uniforms,
    sheetU,
    glowU,
    setScale(R: number) { inner.scale.setScalar(R); uniforms.uSizeScale.value = 0.0085 * R; glowU.uSize.value = 0.52 * R; },
    update(t: number) { uniforms.uTime.value = t; },
    dispose() {
      geometry.dispose(); (points.material as THREE.Material).dispose();
      sheetGeo.dispose(); (sheet.material as THREE.Material).dispose();
      glow.geometry.dispose(); (glow.material as THREE.Material).dispose();
    },
  };
}

/* ───────────────────────── 4. 유성 · 5. 먼지 ───────────────────────── */

function makeMeteors(count: number) {
  const clock = { value: 0 };
  const meteors: THREE.Mesh[] = [];
  const direction = new THREE.Vector3(150, -68, 0);
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const material = additive({ uTime: clock, uPhase: { value: i * 7.3 } },
      /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      /* glsl */ `
        precision highp float;
        varying vec2 vUv; uniform float uTime, uPhase;
        void main() {
          float age = mod(uTime + uPhase + 2.0, 19.0);
          float envelope = smoothstep(0.0, 0.25, age) * (1.0 - smoothstep(1.2, 2.2, age));
          float line = exp(-pow((vUv.y - 0.5) * 20.0, 2.0)) * pow(vUv.x, 3.0);
          gl_FragColor = vec4(mix(vec3(0.24, 0.5, 1.0), vec3(0.95, 0.97, 1.0), vUv.x) * line * envelope * 0.9, 1.0);
        }
      `,
      { depthTest: false },
    );
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(120, 5), material);
    mesh.renderOrder = -90;
    mesh.userData.origin = new THREE.Vector3(-420 + i * 300, 280 + i * 60, -900 - i * 120);
    mesh.visible = false;
    group.add(mesh);
    meteors.push(mesh);
  }
  return {
    group,
    update(t: number, camera: THREE.Camera, enabled: boolean) {
      clock.value = t;
      meteors.forEach((meteor, i) => {
        const age = (t + i * 7.3 + 2) % 19;
        meteor.visible = enabled && age < 2.2;
        if (!meteor.visible) return;
        meteor.position.copy(meteor.userData.origin as THREE.Vector3).addScaledVector(direction, age);
        meteor.quaternion.copy(camera.quaternion);
        meteor.rotateZ(-0.42);
      });
    },
    dispose() { meteors.forEach((m) => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); }); },
  };
}

function makeMotes(rng: ReturnType<typeof makeRng>, count: number) {
  const { rnd } = rng;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions.set([(rnd() - 0.5) * 560, (rnd() - 0.5) * 340, -40 - rnd() * 420], i * 3);
    seeds.set([rnd(), rnd(), rnd()], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
  const uniforms = { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uAmp: { value: 1 } };
  const points = new THREE.Points(geometry, additive(uniforms,
    /* glsl */ `
      attribute vec3 aSeed; uniform float uTime, uPixelRatio; varying float vFade;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * (0.08 + aSeed.x * 0.1) + aSeed.z * 20.0) * 6.0;
        p.x += cos(uTime * (0.06 + aSeed.y * 0.08) + aSeed.z * 13.0) * 8.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vFade = 0.35 + 0.65 * aSeed.y;
        gl_PointSize = clamp((1.6 + aSeed.y * 2.2) * uPixelRatio * 260.0 / max(40.0, -mv.z), 1.0, 6.0 * uPixelRatio);
        gl_Position = projectionMatrix * mv;
      }
    `,
    /* glsl */ `
      precision highp float;
      uniform float uAmp; varying float vFade;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        if (r > 1.0) discard;
        float a = exp(-r * r * 6.0);
        gl_FragColor = vec4(vec3(0.55, 0.7, 1.0) * a * vFade * 0.35 * uAmp, 1.0);
      }
    `,
  ));
  points.frustumCulled = false;
  points.renderOrder = 20;
  return { points, uniforms, dispose() { geometry.dispose(); (points.material as THREE.Material).dispose(); } };
}

/* ───────────────────────── 조립 ───────────────────────── */

export function mountUniverseScene(canvas: HTMLCanvasElement, options: UniverseSceneOptions = {}): UniverseSceneHandle | null {
  const events = new AbortController();
  const compact = window.matchMedia('(max-width: 720px), (pointer: coarse)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let RM = reduced.matches;
  let variant: UniverseVariant = options.variant ?? 'cinema';
  let disposed = false, paused = false, dirty = true, running = true, ready = false;
  let visible = !document.hidden;
  let raf = 0, T = 0, last = 0, lastPaint = 0;
  let W = window.innerWidth, H = window.innerHeight;
  let DPR = Math.min(compact ? 1.25 : 1.5, window.devicePixelRatio || 1);

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false });
  } catch {
    return null;
  }
  if (!renderer.getContext()) { renderer.dispose(); return null; }

  renderer.setPixelRatio(DPR);
  renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.autoClear = true;
  renderer.setClearColor(tokenColor('--u-void', '#03060e'), 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, W / H, 1, 5000);
  const rng = makeRng(20260913);

  const gold = tokenColor('--u-gold', '#f5c518');
  const sky = makeSky({
    violet: new THREE.Color(0.19, 0.12, 0.56),
    cool: new THREE.Color(0.055, 0.46, 0.63),
    warm: new THREE.Color(0.62, 0.4, 0.14),
    hot: new THREE.Color(0.2, 0.7, 0.8),
  });
  scene.add(sky.mesh);
  const stars = makeStars(rng, compact, gold);
  scene.add(stars.object);
  const galaxy = makeGalaxy(rng, compact);
  galaxy.setScale(170);
  galaxy.group.rotation.set(-1.02, 0.12, 0.38);
  scene.add(galaxy.group);
  const meteors = makeMeteors(compact ? 2 : 3);
  scene.add(meteors.group);
  const motes = makeMotes(rng, compact ? 140 : 320);
  scene.add(motes.points);

  /* 변형: 시네마(랜딩·목록·작성) / 서브틀(학생 채점 모바일) */
  const level = { exposure: 1, sky: 1, galaxy: 1, twinkle: 0.5, meteors: true };
  const placeGalaxy = () => {
    const aspect = W / Math.max(1, H);
    const t = THREE.MathUtils.clamp((aspect - 0.6) / 0.9, 0, 1);
    const subtle = variant === 'subtle';
    /* 세로 화면에서는 제목 뒤가 아니라 오른쪽 위 모서리에서 엿보이도록 밀어 둔다 */
    galaxy.group.position.set(
      THREE.MathUtils.lerp(118, 250, t),
      THREE.MathUtils.lerp(215, -70, t) + (subtle ? 70 : 0),
      THREE.MathUtils.lerp(-900, -600, t) - (subtle ? 220 : 0),
    );
    galaxy.group.scale.setScalar(THREE.MathUtils.lerp(0.78, 1, t) * (subtle ? 0.8 : 1));
  };
  const applyVariant = () => {
    const cinema = variant === 'cinema';
    level.exposure = cinema ? 1 : 0.62;
    level.sky = cinema ? 1 : 0.5;
    level.galaxy = cinema ? 1 : 0.55;
    level.twinkle = cinema ? 0.5 : 0.3;
    level.meteors = cinema;
    galaxy.uniforms.uBright.value = 0.1 * level.galaxy;
    galaxy.sheetU.uAmp.value = 0.95 * level.galaxy;
    galaxy.glowU.uAmp.value = 0.42 * level.galaxy;
    motes.uniforms.uAmp.value = cinema ? 1 : 0.5;
    placeGalaxy();
    dirty = true;
  };
  applyVariant();

  /* 카메라 리그 — 포인터 시차 + 느린 표류 + 스크롤 돌리 + 미세 손떨림 */
  const pt = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  let scroll = window.scrollY / Math.max(1, window.innerHeight);
  const lookTarget = new THREE.Vector3();
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || RM || paused) return;
    pt.x = e.clientX / window.innerWidth - 0.5;
    pt.y = e.clientY / window.innerHeight - 0.5;
  }, { passive: true, signal: events.signal });
  window.addEventListener('scroll', () => { scroll = window.scrollY / Math.max(1, window.innerHeight); dirty = true; }, { passive: true, signal: events.signal });
  reduced.addEventListener('change', () => { RM = reduced.matches; dirty = true; if (RM) { cur.x = cur.y = pt.x = pt.y = 0; } }, { signal: events.signal });
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; dirty = true; }, { signal: events.signal });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); running = false; }, { signal: events.signal });
  canvas.addEventListener('webglcontextrestored', () => { resize(); running = true; dirty = true; }, { signal: events.signal });

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    DPR = Math.min(compact ? 1.25 : 1.5, window.devicePixelRatio || 1);
    renderer.setPixelRatio(DPR);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    sky.uniforms.uAspect.value = W / H;
    stars.uniforms.uPixelRatio.value = DPR;
    motes.uniforms.uPixelRatio.value = DPR;
    galaxy.uniforms.uPixelH.value = H * DPR * 0.5;
    placeGalaxy();
    dirty = true;
  }
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 120);
  }, { signal: events.signal });
  resize();

  function frame(ms: number) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    const still = RM || paused;
    if (!running || !visible || (still && !dirty)) { last = ms; return; }
    const budget = compact || scroll > 1.2 ? 1000 / 30 : 0;
    if (budget && ms - lastPaint < budget) return;
    lastPaint = ms;
    dirty = false;
    if (!last) last = ms;
    if (!still) T += Math.min(0.05, (ms - last) / 1000);
    last = ms;

    const t = T;
    const s = RM ? 0 : Math.min(2, scroll);
    if (!still) {
      cur.x += (pt.x - cur.x) * 0.035;
      cur.y += (pt.y - cur.y) * 0.035;
    }
    const drift = t * 0.011;
    const jx = RM ? 0 : Math.sin(t * 0.37) * 0.9 + Math.sin(t * 0.91 + 1.7) * 0.45;
    const jy = RM ? 0 : Math.sin(t * 0.43 + 2.1) * 0.7 + Math.sin(t * 1.13) * 0.3;
    camera.position.set(cur.x * 16 + jx * 0.3, -cur.y * 10 + jy * 0.3, 0);
    lookTarget.set(
      Math.sin(drift) * 26 + cur.x * 40 + jx,
      Math.cos(drift * 0.7) * 12 - cur.y * 30 + jy - s * 46,
      -600,
    );
    camera.lookAt(lookTarget);
    stars.object.position.copy(camera.position);

    const fade = 1 - 0.3 * Math.min(1, s);
    sky.uniforms.uTime.value = RM ? 0 : t;
    sky.uniforms.uPointer.value.set(cur.x, cur.y);
    sky.uniforms.uIntensity.value = level.sky * fade;
    stars.uniforms.uTime.value = RM ? 0 : t;
    stars.uniforms.uTwinkle.value = RM ? 0 : level.twinkle;
    stars.uniforms.uExposure.value = level.exposure * fade;
    motes.uniforms.uTime.value = RM ? 0 : t;
    if (!still) { stars.update(t); galaxy.update(t); }
    meteors.update(RM ? 0 : t, camera, !still && level.meteors);

    renderer.render(scene, camera);
    if (!ready) { ready = true; options.onReady?.(); }
  }
  raf = requestAnimationFrame(frame);

  return {
    setPaused(value: boolean) { paused = value; dirty = true; },
    setVariant(next: UniverseVariant) { if (next !== variant) { variant = next; applyVariant(); } },
    dispose() {
      if (disposed) return;
      disposed = true;
      events.abort();
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      stars.dispose(); galaxy.dispose(); meteors.dispose(); motes.dispose();
      sky.mesh.geometry.dispose(); (sky.mesh.material as THREE.Material).dispose();
      renderer.dispose();
    },
  };
}
