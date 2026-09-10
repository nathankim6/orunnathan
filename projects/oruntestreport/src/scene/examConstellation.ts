import * as THREE from 'three';

/**
 * 이번 시험을 3차원 능선으로 그린다.
 *
 * 읽는 법
 * -------
 * - 가로(왼→오른쪽)는 문항 번호 순서. 1번이 왼쪽 끝, 마지막 문항이 오른쪽 끝.
 * - 세로는 난도. 높이 솟을수록 어려운 문항이다.
 * - 앞뒤(깊이)는 완만한 물결 — 정보가 아니라 입체감을 위한 것이다.
 * - 굵고 둥근 테를 두른 점은 킬러 문항.
 * - 점을 잇는 선은 시험을 처음부터 끝까지 따라간 자취다.
 *
 * 그래서 한눈에 "어려운 문항이 앞쪽에 몰렸는지, 뒤로 갈수록 가팔라지는지"가
 * 보인다. 막대그래프로는 난도 분포만 보이고 순서가 안 보인다.
 *
 * PDF 로 뽑을 때
 * -------------
 * preserveDrawingBuffer 를 켜 둔다. 이걸 끄면 캡처 시점에 캔버스가 비어 있어
 * 리포트에 검은 네모가 찍힌다.
 */

export interface ConstellationNode {
  number: number;
  name: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  questionType: 'objective' | 'subjective';
  isKiller?: boolean;
}

export interface ConstellationColors {
  easy: string;
  medium: string;
  hard: string;
  very_hard: string;
  line: string;
  base: string;
}

export interface ConstellationHandle {
  dispose: () => void;
  /** 캡처 직전에 한 프레임 강제로 그려 캔버스를 채운다 */
  renderNow: () => void;
}

/** 능선이 차지하는 가로 폭(장면 단위). 카메라가 이 값에 맞춰 물러난다. */
const CONTENT_WIDTH = 150;
/** 바닥선부터 가장 높은 점까지 — 세로로도 화면을 채우려고 카메라 거리에 쓴다. */
const CONTENT_HEIGHT = 52;
/** 점은 중심에서 빛이 번져 나가므로 계산한 거리보다 조금 더 물러나야 안 잘린다. */
const FIT_MARGIN = 1.2;

const DIFF_HEIGHT: Record<ConstellationNode['difficulty'], number> = {
  easy: -13,
  medium: -2,
  hard: 10,
  very_hard: 21,
};

const makeDotTexture = (ring: boolean): THREE.Texture => {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const c = size / 2;
    const g = ctx.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.28, 'rgba(255,255,255,0.92)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.22)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    if (ring) {
      // 킬러 문항 표시 — 바깥에 가는 테를 두른다.
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = size * 0.045;
      ctx.beginPath();
      ctx.arc(c, c, size * 0.38, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

export const createExamConstellation = (
  canvas: HTMLCanvasElement,
  nodes: ConstellationNode[],
  colors: ConstellationColors,
  onHover: (node: ConstellationNode | null, screen: { x: number; y: number }) => void,
): ConstellationHandle | null => {
  if (nodes.length === 0) return null;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      // 캡처(html-to-image)가 캔버스를 읽으려면 그린 내용이 남아 있어야 한다.
      preserveDrawingBuffer: true,
    });
  } catch {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(new THREE.Color(colors.base), 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 2, 0.1, 800);
  camera.position.set(0, 2, 120); // z 는 resize 가 화면 비율에 맞춰 다시 정한다

  const group = new THREE.Group();
  scene.add(group);

  // ── 자리 계산 ─────────────────────────────────────────────────
  const n = nodes.length;
  const points: THREE.Vector3[] = nodes.map((node, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x = (t - 0.5) * CONTENT_WIDTH;
    const y = DIFF_HEIGHT[node.difficulty] ?? 0;
    const z = Math.sin(t * Math.PI * 2.2) * 15;
    return new THREE.Vector3(x, y, z);
  });

  // ── 문항을 잇는 자취 ──────────────────────────────────────────
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.35);
  const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(Math.max(64, n * 8)));
  const line = new THREE.Line(
    lineGeo,
    new THREE.LineBasicMaterial({ color: new THREE.Color(colors.line), transparent: true, opacity: 0.42 }),
  );
  group.add(line);

  // ── 바닥에 드리우는 그림자선 — 높이를 읽기 쉽게 한다 ─────────────
  const floorGeo = new THREE.BufferGeometry().setFromPoints(
    points.map((p) => new THREE.Vector3(p.x, DIFF_HEIGHT.easy - 9, p.z)),
  );
  group.add(
    new THREE.Line(
      floorGeo,
      new THREE.LineBasicMaterial({ color: new THREE.Color(colors.line), transparent: true, opacity: 0.14 }),
    ),
  );

  // 각 문항에서 바닥으로 내리는 가는 기둥
  const stemPositions: number[] = [];
  points.forEach((p) => {
    stemPositions.push(p.x, p.y, p.z, p.x, DIFF_HEIGHT.easy - 9, p.z);
  });
  const stemGeo = new THREE.BufferGeometry();
  stemGeo.setAttribute('position', new THREE.Float32BufferAttribute(stemPositions, 3));
  group.add(
    new THREE.LineSegments(
      stemGeo,
      new THREE.LineBasicMaterial({ color: new THREE.Color(colors.line), transparent: true, opacity: 0.16 }),
    ),
  );

  // ── 문항 점 ───────────────────────────────────────────────────
  const plainTex = makeDotTexture(false);
  const killerTex = makeDotTexture(true);
  const sprites: THREE.Sprite[] = nodes.map((node, i) => {
    const color = new THREE.Color(colors[node.difficulty] ?? colors.medium);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: node.isKiller ? killerTex : plainTex,
        color,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    const size = node.isKiller ? 11 : node.difficulty === 'very_hard' ? 9 : 7;
    sprite.scale.set(size, size, 1);
    sprite.position.copy(points[i]);
    sprite.userData.index = i;
    group.add(sprite);
    return sprite;
  });

  // ── 조작 ──────────────────────────────────────────────────────
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const rot = { target: 0, current: 0, tilt: 0, tiltTarget: 0 };
  let dragging = false;
  let dragX = 0;
  let dragY = 0;
  let autoSpin = !reduceMotion;
  let hoveredIndex = -1;

  const raycaster = new THREE.Raycaster();
  raycaster.params.Sprite = { threshold: 0 } as never;
  const pointer = new THREE.Vector2();
  let lastPointer = { x: 0, y: 0 };

  const onPointerDown = (e: PointerEvent) => {
    dragging = true;
    autoSpin = false;
    dragX = e.clientX;
    dragY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onPointerUp = (e: PointerEvent) => {
    dragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    lastPointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (dragging) {
      rot.target += (e.clientX - dragX) * 0.006;
      rot.tiltTarget = THREE.MathUtils.clamp(rot.tiltTarget + (e.clientY - dragY) * 0.004, -0.5, 0.5);
      dragX = e.clientX;
      dragY = e.clientY;
    }
  };
  const onPointerLeave = () => {
    pointer.set(999, 999);
    if (hoveredIndex !== -1) {
      hoveredIndex = -1;
      onHover(null, lastPointer);
    }
    if (!reduceMotion) autoSpin = true;
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);

  /**
   * 화면 비율이 바뀌어도 능선이 화면을 고르게 채우도록 카메라를 물린다.
   * 가로가 좁은 휴대폰에서는 더 멀리, 넓은 화면에서는 가까이 붙는다.
   */
  const resize = () => {
    const w = canvas.clientWidth || 800;
    const h = canvas.clientHeight || 320;
    renderer.setSize(w, h, false);
    const aspect = w / Math.max(1, h);
    camera.aspect = aspect;

    const half = Math.tan((camera.fov * Math.PI) / 360);
    const forHeight = CONTENT_HEIGHT / 2 / half;
    const forWidth = CONTENT_WIDTH / 2 / (half * aspect);
    camera.position.z = Math.max(forHeight, forWidth) * FIT_MARGIN;
    camera.updateProjectionMatrix();
  };

  let raf = 0;
  let running = true;

  const draw = () => {
    if (autoSpin) rot.target += 0.0016;
    rot.current += (rot.target - rot.current) * 0.08;
    rot.tilt += (rot.tiltTarget - rot.tilt) * 0.08;
    // 자동 회전은 좌우로 살짝 흔드는 정도까지만 — 한 바퀴 돌면 번호 순서가 뒤집힌다.
    const swing = autoSpin ? Math.sin(rot.current) * 0.34 : rot.current;
    group.rotation.y = swing;
    group.rotation.x = rot.tilt;

    // 짚어 본 문항 찾기
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(sprites, false);
    const next = hits.length > 0 ? (hits[0].object.userData.index as number) : -1;
    if (next !== hoveredIndex) {
      hoveredIndex = next;
      onHover(next >= 0 ? nodes[next] : null, lastPointer);
      canvas.style.cursor = next >= 0 ? 'pointer' : dragging ? 'grabbing' : 'grab';
    }
    sprites.forEach((s, i) => {
      const base = nodes[i].isKiller ? 11 : nodes[i].difficulty === 'very_hard' ? 9 : 7;
      const want = i === hoveredIndex ? base * 1.5 : base;
      const now = s.scale.x + (want - s.scale.x) * 0.2;
      s.scale.set(now, now, 1);
    });

    renderer.render(scene, camera);
  };

  const frame = () => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    draw();
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
    renderNow: () => {
      resize();
      draw();
    },
    dispose: () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      sprites.forEach((s) => s.material.dispose());
      plainTex.dispose();
      killerTex.dispose();
      lineGeo.dispose();
      floorGeo.dispose();
      stemGeo.dispose();
      renderer.dispose();
    },
  };
};
