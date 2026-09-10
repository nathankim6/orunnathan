import * as THREE from 'three';

/**
 * 리포트 뒤에 깔리는 시네마틱 배경.
 *
 * 무엇을 그리나
 * -------------
 * 깊이가 다른 별 무리 세 겹과, 그 사이에 떠 있는 커다랗고 흐린 빛 덩어리
 * 몇 개. 겹마다 움직이는 속도가 달라서 마우스를 움직이거나 스크롤할 때
 * 가까운 겹이 더 많이 밀린다. 그 시차 하나가 화면에 깊이를 만든다.
 *
 * 왜 이렇게 절제하나
 * ------------------
 * 이 뒤에 성적 리포트가 놓인다. 배경이 화려하면 글을 읽을 수 없다.
 * 그래서 색은 학교 배너색 한 가지에서만 가져오고, 밝기는 낮게 유지하며,
 * 리포트가 놓이는 가운데는 오히려 어둡게 눌러 둔다(비네트).
 *
 * 지켜야 할 것
 * -----------
 * - prefers-reduced-motion 이면 움직이지 않는다.
 * - 탭이 가려지거나 화면 밖으로 나가면 렌더를 멈춘다(노트북 배터리).
 * - WebGL 이 없으면 조용히 아무것도 하지 않는다. 배경일 뿐이다.
 */

export interface BackdropOptions {
  /** 별과 빛 덩어리에 섞을 강조색 (예: '#2f4a7a') */
  accent?: string;
  /** 바탕색 */
  base?: string;
}

export interface BackdropHandle {
  /** 마우스·스크롤을 반영할 목표값을 바깥에서 넣어 준다 */
  setPointer: (x: number, y: number) => void;
  setScroll: (progress: number) => void;
  dispose: () => void;
}

/** 별 하나를 그릴 둥근 점 텍스처 — 가장자리를 부드럽게 흐린다. */
const makeDotTexture = (): THREE.Texture => {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

/** 겹 하나 — count 개의 점을 깊이 z 근처에 흩뿌린다. */
const makeLayer = (
  count: number,
  spread: number,
  depth: number,
  size: number,
  color: THREE.Color,
  texture: THREE.Texture,
): THREE.Points => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const tint = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.62;
    positions[i * 3 + 2] = depth + (Math.random() - 0.5) * spread * 0.25;

    // 대부분은 흰빛, 일부만 강조색 — 전부 물들이면 배경이 시끄러워진다.
    tint.set(color);
    const white = Math.random();
    tint.lerp(new THREE.Color(0xffffff), white > 0.35 ? 0.75 : 0.15);
    const dim = 0.35 + Math.random() * 0.65;
    colors[i * 3] = tint.r * dim;
    colors[i * 3 + 1] = tint.g * dim;
    colors[i * 3 + 2] = tint.b * dim;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size,
    map: texture,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
};

/** 멀리 떠 있는 흐린 빛 덩어리 — 깊이를 만드는 값싼 방법 */
const makeGlow = (color: THREE.Color, texture: THREE.Texture, scale: number): THREE.Sprite => {
  const material = new THREE.SpriteMaterial({
    map: texture,
    color,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(scale, scale, 1);
  return sprite;
};

export const createCinematicBackdrop = (
  canvas: HTMLCanvasElement,
  options: BackdropOptions = {},
): BackdropHandle | null => {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'low-power',
    });
  } catch {
    return null; // WebGL 이 없으면 배경 없이 간다.
  }

  const accent = new THREE.Color(options.accent || '#2f4a7a');
  const base = new THREE.Color(options.base || '#05070d');

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(base, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(base.getHex(), 0.0016);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 2000);
  camera.position.set(0, 0, 260);

  const dot = makeDotTexture();

  // 겹마다 밀도 · 크기 · 깊이를 달리해 시차가 생기게 한다.
  const layers = [
    { points: makeLayer(1100, 900, -520, 2.4, accent, dot), parallax: 0.10, drift: 0.0009 },
    { points: makeLayer(700, 620, -260, 3.4, accent, dot), parallax: 0.26, drift: 0.0016 },
    { points: makeLayer(320, 380, -60, 5.0, accent, dot), parallax: 0.55, drift: 0.0026 },
  ];
  layers.forEach((l) => scene.add(l.points));

  const glows = [
    { sprite: makeGlow(accent, dot, 620), at: new THREE.Vector3(-210, 120, -430), parallax: 0.16 },
    { sprite: makeGlow(accent, dot, 480), at: new THREE.Vector3(240, -140, -320), parallax: 0.22 },
    { sprite: makeGlow(new THREE.Color(0xffffff), dot, 300), at: new THREE.Vector3(60, 180, -200), parallax: 0.3 },
  ];
  glows.forEach((g) => {
    g.sprite.position.copy(g.at);
    g.sprite.material.opacity = g.sprite.material.opacity * 0.9;
    scene.add(g.sprite);
  });

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  /** 마우스·스크롤은 목표값으로 두고 매 프레임 조금씩 따라가게 한다(끌리는 느낌). */
  const target = { x: 0, y: 0, scroll: 0 };
  const current = { x: 0, y: 0, scroll: 0 };

  let raf = 0;
  let running = true;
  let time = 0;

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  };

  const frame = () => {
    if (!running) return;
    raf = requestAnimationFrame(frame);

    const ease = reduceMotion ? 1 : 0.045;
    current.x += (target.x - current.x) * ease;
    current.y += (target.y - current.y) * ease;
    current.scroll += (target.scroll - current.scroll) * (reduceMotion ? 1 : 0.06);
    if (!reduceMotion) time += 1;

    layers.forEach((l) => {
      l.points.position.x = current.x * 90 * l.parallax;
      l.points.position.y = current.y * -60 * l.parallax - current.scroll * 130 * l.parallax;
      l.points.rotation.z = time * l.drift * 0.12;
    });
    glows.forEach((g) => {
      g.sprite.position.x = g.at.x + current.x * 70 * g.parallax;
      g.sprite.position.y = g.at.y + current.y * -46 * g.parallax - current.scroll * 100 * g.parallax;
    });

    // 카메라도 아주 조금 흔들어 준다 — 손으로 든 카메라처럼.
    camera.position.x = current.x * 14;
    camera.position.y = current.y * -9;
    camera.lookAt(0, 0, -200);

    renderer.render(scene, camera);
  };

  const onVisibility = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!running) {
      running = true;
      frame();
    }
  };

  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibility);
  frame();

  return {
    setPointer: (x, y) => {
      target.x = x;
      target.y = y;
    },
    setScroll: (progress) => {
      target.scroll = progress;
    },
    dispose: () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      layers.forEach((l) => {
        l.points.geometry.dispose();
        (l.points.material as THREE.Material).dispose();
      });
      glows.forEach((g) => g.sprite.material.dispose());
      dot.dispose();
      renderer.dispose();
    },
  };
};
