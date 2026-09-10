import * as THREE from 'three';

/**
 * 리포트 전 섹션에 쓰는 three.js 효과 엔진.
 *
 * 왜 렌더러를 하나만 쓰나
 * ----------------------
 * 섹션마다 <canvas> 를 따로 두면 WebGL 컨텍스트가 그만큼 늘어난다. 브라우저는
 * 보통 8~16개까지만 살려 두고 그 뒤로는 오래된 것부터 강제로 잃게 만든다.
 * 리포트에는 효과 자리가 열 곳이 넘으므로 그 방식으로는 화면이 깨진다.
 *
 * 그래서 화면 전체를 덮는 캔버스 하나에 렌더러 하나만 두고, 매 프레임
 * 구역(scissor)을 옮겨 가며 자리마다 다른 장면을 그린다. 컨텍스트는 언제나
 * 하나다. 자리를 스무 개로 늘려도 마찬가지다.
 *
 * 자리는 그냥 빈 <div> 다. 그 div 의 화면 좌표를 매 프레임 읽어 그 사각형에만
 * 그린다. 나머지는 투명하게 비워 두므로 리포트 글자를 가리지 않는다.
 *
 * 인쇄·PDF
 * --------
 * 이 캔버스는 화면 위에 떠 있는 한 장이고 capture-hide 라 캡처에 들어가지
 * 않는다. 리포트를 내려받으면 지금처럼 흰 종이 그대로다.
 */

export type FxKind = 'sweep' | 'field' | 'ring' | 'bars' | 'ember' | 'orbit' | 'flow';

export interface FxOptions {
  /** 주 색 (css 색 문자열) */
  tone?: string;
  /** 보조 색 */
  tone2?: string;
  /** 0~1 값 — ring 의 채움, ember 의 세기 */
  value?: number;
  /** 여러 값 0~1 — bars 의 높이 */
  values?: number[];
  /** 값마다 다른 색 — bars, orbit */
  colors?: string[];
  /** 개수 — orbit, flow */
  count?: number;
  /** 전체 밝기 배수 (기본 1) */
  gain?: number;
}

interface Effect {
  scene: THREE.Scene;
  camera: THREE.Camera;
  /** aspect 는 자리 크기가 바뀔 때마다 들어온다 */
  layout: (aspect: number) => void;
  update: (dt: number, hover: number) => void;
  dispose: () => void;
}

interface Slot {
  el: HTMLElement;
  effect: Effect;
  visible: boolean;
  hover: number;
  aspect: number;
}

/** 부드러운 둥근 점 — 모든 효과가 이 하나를 나눠 쓴다. */
let dotTexture: THREE.Texture | null = null;
const getDot = (): THREE.Texture => {
  if (dotTexture) return dotTexture;
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(255,255,255,0.7)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  dotTexture = new THREE.CanvasTexture(canvas);
  return dotTexture;
};

const color = (c: string | undefined, fallback: string) => new THREE.Color(c || fallback);

/**
 * 점 재료.
 *
 * 직교 카메라에서는 sizeAttenuation 을 켜면 안 된다. 거리로 크기를 줄이는데
 * 직교에서는 그 값이 의미가 없어 점이 1픽셀도 안 되게 작아진다(그래서 아무것도
 * 안 보인다). 픽셀 크기로 고정하는 편이 맞다.
 */
const pointsMaterial = (size: number, tex: THREE.Texture) =>
  new THREE.PointsMaterial({
    size,
    map: tex,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: false,
  });

/* ────────────────────────────────────────────────────────────────
   효과들. 모두 같은 모양의 객체를 돌려준다.
   자리는 대개 가로로 길고 낮으므로 직교 카메라를 기본으로 쓴다.
   ──────────────────────────────────────────────────────────────── */

/** 가로로 흐르는 빛 띠 — 섹션 머리에 얹는다. */
const makeSweep = (o: FxOptions): Effect => {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 3;
  const tex = getDot();
  const tone = color(o.tone, '#7aa7d9');

  const bands = [0, 1, 2].map((i) => {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: tex,
        color: tone,
        transparent: true,
        opacity: (0.3 - i * 0.08) * (o.gain ?? 1),
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    s.userData.speed = 0.16 + i * 0.05;
    s.userData.offset = i * 0.42;
    scene.add(s);
    return s;
  });

  let t = 0;
  return {
    scene,
    camera,
    layout: () => {
      // 직교 화면이 가로로 길게 늘어나므로 x 를 작게 잡아야 가는 띠가 된다
      bands.forEach((s, i) => s.scale.set(0.62 - i * 0.14, 2.8, 1));
    },
    update: (dt, hover) => {
      t += dt;
      bands.forEach((s) => {
        const p = ((t * s.userData.speed + s.userData.offset) % 1.6) - 0.3;
        s.position.x = p * 2 - 1;
        s.position.y = 0;
        (s.material as THREE.SpriteMaterial).opacity =
          (0.3 * (1 + hover * 0.8)) * Math.sin(Math.min(1, Math.max(0, p / 1.3)) * Math.PI) * (o.gain ?? 1);
      });
    },
    dispose: () => bands.forEach((s) => s.material.dispose()),
  };
};

/** 천천히 떠다니는 입자 — 카드 뒤 은은한 바탕. */
const makeField = (o: FxOptions): Effect => {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 3;
  const n = o.count ?? 90;
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const seed = new Float32Array(n * 2);
  const tone = color(o.tone, '#7aa7d9');
  const tone2 = color(o.tone2, '#ffffff');
  for (let i = 0; i < n; i += 1) {
    pos[i * 3] = (Math.random() - 0.5) * 2.4;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 2.4;
    pos[i * 3 + 2] = 0;
    const c = Math.random() > 0.7 ? tone2 : tone;
    const dim = (0.25 + Math.random() * 0.6) * (o.gain ?? 1);
    col[i * 3] = c.r * dim;
    col[i * 3 + 1] = c.g * dim;
    col[i * 3 + 2] = c.b * dim;
    seed[i * 2] = Math.random() * Math.PI * 2;
    seed[i * 2 + 1] = 0.1 + Math.random() * 0.35;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = pointsMaterial(5, getDot());
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let t = 0;
  const base = pos.slice();
  return {
    scene,
    camera,
    layout: () => {},
    update: (dt, hover) => {
      t += dt;
      const a = geo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < n; i += 1) {
        const ph = seed[i * 2];
        const sp = seed[i * 2 + 1];
        a.array[i * 3] = base[i * 3] + Math.sin(t * sp + ph) * 0.07;
        a.array[i * 3 + 1] = base[i * 3 + 1] + Math.cos(t * sp * 0.8 + ph) * 0.07;
      }
      a.needsUpdate = true;
      mat.size = 5 * (1 + hover * 0.5);
    },
    dispose: () => {
      geo.dispose();
      mat.dispose();
    },
  };
};

/** 비율만큼 채워진 3차원 고리 — 도넛 대신. */
const makeRing = (o: FxOptions): Effect => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0.9, 4.4);
  camera.lookAt(0, 0, 0);
  const group = new THREE.Group();
  group.rotation.x = -0.5;
  scene.add(group);

  const value = Math.max(0.02, Math.min(1, o.value ?? 0.5));
  const tone = color(o.tone, '#3f6f86');
  const tone2 = color(o.tone2, '#b08d4a');
  const gain = o.gain ?? 1;

  const track = new THREE.Mesh(
    new THREE.TorusGeometry(1.15, 0.055, 12, 120),
    new THREE.MeshBasicMaterial({ color: tone2, transparent: true, opacity: 0.16 * gain }),
  );
  group.add(track);

  const arc = new THREE.Mesh(
    new THREE.TorusGeometry(1.15, 0.085, 14, Math.max(12, Math.round(120 * value)), Math.PI * 2 * value),
    new THREE.MeshBasicMaterial({ color: tone, transparent: true, opacity: 0.95 * gain, blending: THREE.AdditiveBlending }),
  );
  arc.rotation.z = Math.PI / 2;
  group.add(arc);

  // 고리를 따라 도는 작은 빛
  const bead = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: getDot(), color: tone, transparent: true, opacity: 0.9 * gain, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  bead.scale.set(0.5, 0.5, 1);
  group.add(bead);

  let t = 0;
  return {
    scene,
    camera,
    layout: (aspect) => {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    },
    update: (dt, hover) => {
      t += dt;
      group.rotation.y = Math.sin(t * 0.25) * 0.5 + hover * 0.25;
      const a = Math.PI / 2 + t * 0.6;
      bead.position.set(Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0);
    },
    dispose: () => {
      track.geometry.dispose();
      (track.material as THREE.Material).dispose();
      arc.geometry.dispose();
      (arc.material as THREE.Material).dispose();
      bead.material.dispose();
    },
  };
};

/** 값만큼 솟은 3차원 막대들 — 분포용. */
const makeBars = (o: FxOptions): Effect => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(0, 1.2, 6.6);
  camera.lookAt(0, 0.1, 0);
  const group = new THREE.Group();
  group.rotation.x = -0.16;
  scene.add(group);

  const values = (o.values && o.values.length > 0 ? o.values : [0.3, 0.6, 0.45, 0.2]).map((v) =>
    Math.max(0.04, Math.min(1, v)),
  );
  const gain = o.gain ?? 1;
  // 판이 가로로 길어 막대가 가운데 몰려 보였다. 넓게 펴고 굵게 만든다.
  const span = 5;
  const step = values.length > 1 ? span / (values.length - 1) : 0;

  const bars = values.map((v, i) => {
    const h = 0.3 + v * 2;
    const geo = new THREE.BoxGeometry(0.5, h, 0.5);
    const mat = new THREE.MeshBasicMaterial({
      color: color(o.colors?.[i], '#5f87a8'),
      transparent: true,
      opacity: 0.82 * gain,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(-span / 2 + i * step, h / 2 - 0.9, 0);
    mesh.userData.h = h;
    group.add(mesh);

    // 막대 머리에 얹는 빛
    const cap = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: getDot(), color: mat.color, transparent: true, opacity: 0.75 * gain, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    cap.scale.set(0.95, 0.95, 1);
    cap.position.set(mesh.position.x, h - 0.9, 0);
    group.add(cap);
    return { mesh, cap };
  });

  let t = 0;
  return {
    scene,
    camera,
    layout: (aspect) => {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    },
    update: (dt, hover) => {
      t += dt;
      group.rotation.y = Math.sin(t * 0.22) * 0.24 + hover * 0.14;
      bars.forEach((b, i) => {
        const pulse = 1 + Math.sin(t * 1.4 + i * 0.9) * 0.06;
        b.cap.scale.set(0.95 * pulse, 0.95 * pulse, 1);
      });
    },
    dispose: () =>
      bars.forEach((b) => {
        b.mesh.geometry.dispose();
        (b.mesh.material as THREE.Material).dispose();
        b.cap.material.dispose();
      }),
  };
};

/** 위로 피어오르는 불티 — 값이 클수록 세다. 킬러·상위난도 표시에. */
const makeEmber = (o: FxOptions): Effect => {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 3;
  const strength = Math.max(0.05, Math.min(1, o.value ?? 0.5));
  const n = Math.max(30, Math.round((o.count ?? 70) * (0.5 + strength * 0.8)));
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const life = new Float32Array(n * 2); // [진행도, 속도]
  const tone = color(o.tone, '#c2603f');
  const gain = o.gain ?? 1;
  for (let i = 0; i < n; i += 1) {
    pos[i * 3] = (Math.random() - 0.5) * 2.2;
    pos[i * 3 + 1] = -1 + Math.random() * 2;
    const dim = (0.45 + Math.random() * 0.85) * gain;
    col[i * 3] = tone.r * dim;
    col[i * 3 + 1] = tone.g * dim;
    col[i * 3 + 2] = tone.b * dim;
    life[i * 2] = Math.random();
    life[i * 2 + 1] = 0.12 + Math.random() * 0.22 * (0.5 + strength);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = pointsMaterial(7, getDot());
  scene.add(new THREE.Points(geo, mat));

  return {
    scene,
    camera,
    layout: () => {},
    update: (dt, hover) => {
      const a = geo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < n; i += 1) {
        let y = a.array[i * 3 + 1] + life[i * 2 + 1] * dt * (1 + hover);
        let x = a.array[i * 3] + Math.sin(y * 3 + life[i * 2] * 6) * 0.004;
        if (y > 1.15) {
          y = -1.15;
          x = (Math.random() - 0.5) * 2.2;
        }
        a.array[i * 3] = x;
        a.array[i * 3 + 1] = y;
      }
      a.needsUpdate = true;
    },
    dispose: () => {
      geo.dispose();
      mat.dispose();
    },
  };
};

/** 개수만큼 도는 점들 — 유형 수 같은 "몇 가지" 를 보여 준다. */
const makeOrbit = (o: FxOptions): Effect => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
  camera.position.set(0, 0.5, 4.2);
  camera.lookAt(0, 0, 0);
  const group = new THREE.Group();
  group.rotation.x = -0.42;
  scene.add(group);

  const n = Math.max(3, Math.min(28, o.count ?? 8));
  const gain = o.gain ?? 1;
  const beads = Array.from({ length: n }, (_, i) => {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getDot(),
        color: color(o.colors?.[i % (o.colors?.length || 1)], o.tone || '#6f93b8'),
        transparent: true,
        opacity: 0.85 * gain,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    s.scale.set(0.34, 0.34, 1);
    s.userData.r = 0.75 + (i % 3) * 0.42;
    s.userData.a = (i / n) * Math.PI * 2;
    s.userData.sp = 0.28 + (i % 3) * 0.11;
    group.add(s);
    return s;
  });

  // 궤도 자국
  const rings = [0.75, 1.17, 1.59].map((r) => {
    const g = new THREE.BufferGeometry().setFromPoints(
      Array.from({ length: 97 }, (_, i) => {
        const a = (i / 96) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0);
      }),
    );
    const line = new THREE.Line(
      g,
      new THREE.LineBasicMaterial({ color: color(o.tone2, '#8fb0c8'), transparent: true, opacity: 0.12 * gain }),
    );
    group.add(line);
    return { g, line };
  });

  let t = 0;
  return {
    scene,
    camera,
    layout: (aspect) => {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    },
    update: (dt, hover) => {
      t += dt;
      group.rotation.z = t * 0.05;
      group.rotation.y = Math.sin(t * 0.2) * 0.3;
      beads.forEach((s) => {
        const a = s.userData.a + t * s.userData.sp;
        s.position.set(Math.cos(a) * s.userData.r, Math.sin(a) * s.userData.r, 0);
        const k = 0.34 * (1 + hover * 0.6);
        s.scale.set(k, k, 1);
      });
    },
    dispose: () => {
      beads.forEach((s) => s.material.dispose());
      rings.forEach((r) => {
        r.g.dispose();
        (r.line.material as THREE.Material).dispose();
      });
    },
  };
};

/** 왼쪽에서 오른쪽으로 흐르는 입자 — 원문에서 시험지로 옮겨 가는 흐름. */
const makeFlow = (o: FxOptions): Effect => {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 3;
  const n = o.count ?? 110;
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const sp = new Float32Array(n);
  const tone = color(o.tone, '#6f93b8');
  const tone2 = color(o.tone2, '#c2a15f');
  const gain = o.gain ?? 1;
  for (let i = 0; i < n; i += 1) {
    pos[i * 3] = Math.random() * 2.4 - 1.2;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
    const mix = Math.random();
    const c = tone.clone().lerp(tone2, mix);
    const dim = (0.3 + Math.random() * 0.7) * gain;
    col[i * 3] = c.r * dim;
    col[i * 3 + 1] = c.g * dim;
    col[i * 3 + 2] = c.b * dim;
    sp[i] = 0.2 + Math.random() * 0.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = pointsMaterial(6, getDot());
  scene.add(new THREE.Points(geo, mat));

  let t = 0;
  return {
    scene,
    camera,
    layout: () => {},
    update: (dt, hover) => {
      t += dt;
      const a = geo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < n; i += 1) {
        let x = a.array[i * 3] + sp[i] * dt * (1 + hover * 1.2);
        if (x > 1.25) x = -1.25;
        a.array[i * 3] = x;
        a.array[i * 3 + 1] += Math.sin(t * 0.7 + i) * 0.0008;
      }
      a.needsUpdate = true;
    },
    dispose: () => {
      geo.dispose();
      mat.dispose();
    },
  };
};

const BUILDERS: Record<FxKind, (o: FxOptions) => Effect> = {
  sweep: makeSweep,
  field: makeField,
  ring: makeRing,
  bars: makeBars,
  ember: makeEmber,
  orbit: makeOrbit,
  flow: makeFlow,
};

/* ────────────────────────────────────────────────────────────────
   엔진 — 캔버스 한 장, 렌더러 하나, 자리 여러 개
   ──────────────────────────────────────────────────────────────── */

let renderer: THREE.WebGLRenderer | null = null;
let canvas: HTMLCanvasElement | null = null;
let slots: Slot[] = [];
let raf = 0;
let last = 0;
let observer: IntersectionObserver | null = null;
let reduceMotion = false;
let failed = false;

const start = (): boolean => {
  if (renderer) return true;
  if (failed) return false;
  reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  canvas = document.createElement('canvas');
  canvas.className = 'report-fx capture-hide print:hidden';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    failed = true;
    canvas.remove();
    canvas = null;
    return false;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearAlpha(0);
  renderer.autoClear = false;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const slot = slots.find((s) => s.el === e.target);
        if (slot) slot.visible = e.isIntersecting;
      });
    },
    { rootMargin: '120px' },
  );

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibility);
  resize();
  last = performance.now();
  raf = requestAnimationFrame(frame);
  return true;
};

const stop = () => {
  cancelAnimationFrame(raf);
  raf = 0;
  window.removeEventListener('resize', resize);
  document.removeEventListener('visibilitychange', onVisibility);
  observer?.disconnect();
  observer = null;
  renderer?.dispose();
  renderer = null;
  canvas?.remove();
  canvas = null;
};

const resize = () => {
  if (!renderer) return;
  renderer.setSize(window.innerWidth, window.innerHeight, false);
};

const onVisibility = () => {
  if (document.hidden) {
    cancelAnimationFrame(raf);
    raf = 0;
  } else if (renderer && !raf) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
};

const frame = (now: number) => {
  if (!renderer) return;
  raf = requestAnimationFrame(frame);
  // 탭을 오래 가려 두었다가 돌아오면 dt 가 커져 입자가 튄다. 한 프레임 몫으로 자른다.
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  renderer.setScissorTest(false);
  renderer.clear(true, true, false);
  renderer.setScissorTest(true);

  const vh = window.innerHeight;
  for (const slot of slots) {
    if (!slot.visible) continue;
    const r = slot.el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    if (r.bottom < 0 || r.top > vh) continue;

    const aspect = r.width / r.height;
    if (Math.abs(aspect - slot.aspect) > 0.01) {
      slot.aspect = aspect;
      slot.effect.layout(aspect);
    }
    if (!reduceMotion) slot.effect.update(dt, slot.hover);

    renderer.setViewport(r.left, vh - r.bottom, r.width, r.height);
    renderer.setScissor(r.left, vh - r.bottom, r.width, r.height);
    renderer.render(slot.effect.scene, slot.effect.camera);
  }
  renderer.setScissorTest(false);
};

/**
 * 자리를 하나 등록한다. 돌려주는 함수를 부르면 등록이 풀린다.
 * WebGL 을 쓸 수 없으면 null 을 돌려주고 아무 일도 하지 않는다.
 */
export const registerFx = (el: HTMLElement, kind: FxKind, options: FxOptions = {}): (() => void) | null => {
  if (!start()) return null;
  const effect = BUILDERS[kind](options);
  const slot: Slot = { el, effect, visible: true, hover: 0, aspect: 0 };
  slots.push(slot);
  observer?.observe(el);

  const enter = () => {
    slot.hover = 1;
  };
  const leave = () => {
    slot.hover = 0;
  };
  el.addEventListener('pointerenter', enter);
  el.addEventListener('pointerleave', leave);

  return () => {
    el.removeEventListener('pointerenter', enter);
    el.removeEventListener('pointerleave', leave);
    observer?.unobserve(el);
    slots = slots.filter((s) => s !== slot);
    effect.dispose();
    if (slots.length === 0) stop();
  };
};
