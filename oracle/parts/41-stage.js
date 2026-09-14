  // ==================================================================
  //  STAGE — three.js 무대. 레퍼런스(JARVIS 다이얼)처럼 가운데 큰 원형 코어에 선생님 이름이 뜨고,
  //  눈금 링·호(arc) 링이 돌고, 받침대와 바닥 링·빛기둥이 선다. 다른 선생님은 뒤쪽에 작게 선다.
  //  힉스 필드(바닥 입자장)는 데이터가 흐를 때 그 자리가 밝아지고 학습이 끝나면 파동이 퍼진다.
  //  WebGL 이 없으면 null 을 돌려주고 앱은 2D 로 간다.
  //  makeStage(canvas, opts) → { addTeacher, removeTeacher, updateTeacher, setProfile, setLevel, fx:{...}, focus, pick, anchor, resize, setBackdrop, ... }
  //  + 그래프(spec §3.4 · §5.7): setGraph({nodes, edges}) · clearGraph · graph · pickNode(x, y) · focusNode(id) · setNodeFilter(kinds) · nodeScreen(id) · hoverNode(id) · onNode({onSelect,onHover,onOpen}) · fx.link(a, b) · running 게터
  // ==================================================================
  function makeStage(canvas, opts) {
    opts = opts || {};
    if (typeof THREE === "undefined" || !THREE.WebGLRenderer) return null;
    const calm = !!opts.reducedMotion, lowEnd = !!opts.lowEnd;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance", stencil: false }); } catch (e) { return null; }
    if (!renderer.getContext || !renderer.getContext()) return null;
    const DPR = Math.min(window.devicePixelRatio || 1, lowEnd ? 1 : 1.5);
    renderer.setPixelRatio(DPR);
    renderer.setClearColor(0x030812, 1);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030812, 0.022);
    let W = canvas.clientWidth || window.innerWidth, H = canvas.clientHeight || window.innerHeight;
    renderer.setSize(W, H, false);
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 200);
    let post = null;
    if (!lowEnd) {
      try {
        post = makePost(THREE, renderer, W, H, { msaa: 0, threshold: 0.70, knee: 0.35, bloomIntensity: 0.9, bloomRadius: 1.3, mipWeight: 0.9, streakIntensity: 0.26, streakGate: 1.5, streakDecay: 0.09, streakTint: 0x8fd6ff, streakDesat: 0.2,
          exposure: 1.0, caAmount: 0.0016, lift: 0.004, grainAmount: 0.010, grainShadow: 0.7, grainChroma: 0.1, grainScale: 1.4, vignetteAmount: 0.34, vignetteRadius: 1.0, vignetteSoft: 0.5, saturation: 1.06 });
        if (!post.isHDR) { post.uniforms.exposure.value = 0.95; post.uniforms.threshold.value = 0.5; post.uniforms.knee.value = 0.25; if (post.uniforms.streakGate) post.uniforms.streakGate.value = 0.7; }
      } catch (e) { post = null; }
    }
    if (!post) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputEncoding = THREE.sRGBEncoding; }
    const TAIL = "\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n";   // #include 는 줄 머리에 있어야 한다 — 앞에 줄바꿈을 둔다
    const FONT_KO = "'Noto Sans KR', 'Noto Sans', sans-serif", FONT_EN = "'Orbitron', 'Noto Sans KR', sans-serif";

    // ---- 트윈 ----
    const tweens = [];
    const ease = { out: t => 1 - Math.pow(1 - t, 3), inout: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, elastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * 2.094) + 1, lin: t => t };
    function tween(dur, fn, e, done, key) {
      if (key) for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i].key === key) tweens.splice(i, 1);
      tweens.push({ t: 0, dur: Math.max(0.001, dur), fn, e: e || ease.out, done, key });
    }
    function runTweens(dt) { for (let i = tweens.length - 1; i >= 0; i--) { const tw = tweens[i]; tw.t += dt; const k = Math.min(1, tw.t / tw.dur); tw.fn(tw.e(k), k); if (k >= 1) { tweens.splice(i, 1); if (tw.done) tw.done(); } } }
    const clock = { t: 0 };
    const rnd = (a, b) => a + Math.random() * (b - a);

    // ---- 힉스 필드 ----
    const EXN = 8;
    const fieldUni = { uTime: { value: 0 }, uPx: { value: (lowEnd ? 2.0 : 2.5) * DPR }, uEx: { value: Array.from({ length: EXN }, () => new THREE.Vector4(0, 0, 0, 1)) }, uWave: { value: new THREE.Vector4(0, 0, 0, 0) },
      uCol: { value: new THREE.Color(0x1a5f95) }, uHot: { value: new THREE.Color(0x7fd8ff) }, uAmp: { value: 1 } };
    (function () {
      const NX = lowEnd ? 140 : 210, NZ = lowEnd ? 84 : 126, SX = 48, SZ = 30;
      const pos = new Float32Array(NX * NZ * 3), seed = new Float32Array(NX * NZ);
      let i = 0, j = 0;
      for (let z = 0; z < NZ; z++) for (let x = 0; x < NX; x++) { pos[i++] = -SX / 2 + (x / (NX - 1)) * SX + rnd(-0.05, 0.05); pos[i++] = 0; pos[i++] = -SZ / 2 + (z / (NZ - 1)) * SZ + rnd(-0.05, 0.05); seed[j++] = Math.random(); }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
      const m = new THREE.ShaderMaterial({ uniforms: fieldUni, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: `uniform float uTime; uniform float uPx; uniform float uAmp; uniform vec4 uEx[${EXN}]; uniform vec4 uWave; attribute float aSeed; varying float vB; varying float vHot;
          void main(){ vec3 p = position;
            float h = sin(p.x*0.35 + uTime*0.5)*cos(p.z*0.31 - uTime*0.4)*0.08 + sin(length(p.xz)*0.8 - uTime*0.8)*0.035;
            float hot = 0.0;
            for (int i = 0; i < ${EXN}; i++) { float d = distance(p.xz, uEx[i].xy); float g = exp(-d*d/(uEx[i].w*uEx[i].w)) * uEx[i].z; h += g * (0.2 + 0.14*sin(d*3.2 - uTime*4.5)); hot += g; }
            float dw = distance(p.xz, uWave.xy); float ring = exp(-pow((dw - uWave.z)*2.4, 2.0)) * uWave.w; h += ring*0.35; hot += ring*0.7;
            p.y += h * uAmp; vB = clamp(0.2 + h*1.4 + aSeed*0.12, 0.0, 1.0); vHot = clamp(hot, 0.0, 1.0);
            vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = uPx * (1.0 + 0.8*vHot) * clamp(16.0 / -mv.z, 0.25, 3.0); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform vec3 uCol; uniform vec3 uHot; varying float vB; varying float vHot;
          void main(){ vec2 c = gl_PointCoord - 0.5; float r = dot(c, c); if (r > 0.25) discard; float a = smoothstep(0.25, 0.02, r);
            vec3 col = mix(uCol, uHot, vHot) * (0.3 + 1.3*vB + 0.7*vHot); gl_FragColor = vec4(col * a, a * (0.5 + 0.45*vB));
            ${TAIL} }` });
      const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts);
      const grid = new THREE.GridHelper(64, 64, 0x0c3a5c, 0x081f3a); grid.position.y = -0.02; grid.material.transparent = true; grid.material.opacity = 0.32; grid.material.depthWrite = false; scene.add(grid);
    })();
    const exSlot = (i) => fieldUni.uEx.value[i % EXN];

    // ---- 셰이더 ----
    const V2 = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
    const TEX_FS = `uniform sampler2D tMap; uniform vec3 uColor; uniform float uGlow; uniform float uAlpha; varying vec2 vUv;
      void main(){ vec4 t = texture2D(tMap, vUv); float a = t.a * uAlpha; gl_FragColor = vec4(uColor * t.rgb * (1.1 + uGlow*1.4) * a, a); ${TAIL} }`;
    const FLOOR_FS = `uniform vec3 uColor; uniform float uTime; uniform float uSegs; uniform float uGap; uniform float uOff; uniform float uGlow; uniform float uAlpha; varying vec2 vUv;
      float hash(float n){ return fract(sin(n*127.1)*43758.5453); }
      void main(){ vec2 c = vUv - 0.5; float r = length(c) * 2.0; float ang = atan(c.y, c.x) / 6.2831853 + 0.5; float s = ang * uSegs + uOff; float seg = floor(s), f = fract(s);
        float on = uSegs < 1.0 ? 1.0 : step(uGap, f) * step(0.12, hash(seg + uSegs)); float edge = smoothstep(0.80, 0.86, r) * (1.0 - smoothstep(0.93, 0.99, r));   // 얇은 바닥 링
        float a = on * edge * uAlpha; vec3 col = uColor * (0.9 + uGlow * 1.5) * (0.8 + 0.2*sin(uTime*2.0 + seg)); gl_FragColor = vec4(col * a, a); ${TAIL} }`;
    const CORE_VS = `varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = -mv.xyz; vP = position; gl_Position = projectionMatrix * mv; }`;
    const CORE_FS = `uniform vec3 uColor; uniform float uTime; uniform float uPulse; uniform float uBusy; uniform float uEnergy; varying vec3 vN; varying vec3 vV; varying vec3 vP;
      float h3(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
      float vn(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f); float a = h3(i), b = h3(i + vec3(1,0,0)), c = h3(i + vec3(0,1,0)), d = h3(i + vec3(1,1,0)); float e = h3(i + vec3(0,0,1)), g = h3(i + vec3(1,0,1)), k = h3(i + vec3(0,1,1)), l = h3(i + vec3(1,1,1));
        return mix(mix(mix(a,b,f.x), mix(c,d,f.x), f.y), mix(mix(e,g,f.x), mix(k,l,f.x), f.y), f.z); }
      void main(){ float fr = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.4); float t = uTime * (0.4 + 1.2*uBusy);
        float n = vn(vP*3.0 + t*0.6)*0.6 + vn(vP*7.0 - t*0.9)*0.4; float veins = smoothstep(0.55, 0.85, n); float band = 0.5 + 0.5*sin(vP.y*40.0 + t*4.0);
        vec3 base = uColor * (0.05 + 0.2*n); vec3 emis = uColor * (fr*1.4 + veins*(0.6 + uEnergy*1.2) + band*0.05 + uPulse*1.2 + uBusy*0.3);
        gl_FragColor = vec4(base + emis, 1.0); ${TAIL} }`;
    const COL_FS = `uniform vec3 uColor; uniform float uTime; uniform float uOn; varying vec2 vUv;
      void main(){ float v = vUv.y; float fade = pow(1.0 - v, 1.8) * smoothstep(0.0, 0.05, v); float stripes = 0.7 + 0.3*sin(v*50.0 - uTime*3.0);
        float a = fade * (0.08 + 0.28*uOn) * stripes; gl_FragColor = vec4(uColor * a * 1.4, a); ${TAIL} }`;
    const PT_VS = `uniform float uTime; uniform float uT0; uniform float uDur; uniform vec3 uFrom; uniform vec3 uTo; uniform float uPx; uniform float uMode; attribute vec3 aDir; attribute float aSeed; varying float vA;
      void main(){ float t = clamp((uTime - uT0 - aSeed*0.6*uDur) / (uDur*0.55), 0.0, 1.0); float e = 1.0 - pow(1.0 - t, 3.0); vec3 p;
        if (uMode < 0.5) { p = mix(uFrom, uTo, e) + aDir * sin(t*3.1416) * (0.4 + aSeed*0.5); } else { p = uTo + aDir * e * (1.2 + aSeed*1.8); p.y += e*e*0.6; }
        vA = (uMode < 0.5) ? smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.85, 1.0, t)) : (1.0 - e);
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = uPx * (0.6 + aSeed*0.9) * clamp(14.0 / -mv.z, 0.3, 3.0); gl_Position = projectionMatrix * mv; }`;
    const PT_FS = `uniform vec3 uColor; varying float vA; void main(){ vec2 c = gl_PointCoord - 0.5; float r = dot(c,c); if (r > 0.25) discard; float a = smoothstep(0.25, 0.03, r) * vA; gl_FragColor = vec4(uColor * a * 2.2, a);
      ${TAIL} }`;
    const WAVE_FS = `uniform vec3 uColor; uniform float uP; varying vec2 vUv;
      void main(){ vec2 q = vUv*2.0 - 1.0; float r = length(q), ang = atan(q.y, q.x); float ring = 1.0 - smoothstep(0.0, 0.10 + 0.25*uP, abs(r - (0.15 + 0.85*uP))); float flash = smoothstep(0.0, 1.0, 1.0 - r) * (1.0 - uP) * 0.3;
        float a = (ring*1.8 + flash) * (1.0 - uP) * (1.0 - uP); a *= 0.75 + 0.25*sin(ang*24.0 + uP*10.0); if (a < 0.002) discard; gl_FragColor = vec4(uColor * a, a); ${TAIL} }`;

    // ---- 충격파 · 배경 ----
    const waveGeo = new THREE.PlaneGeometry(2, 2);
    const waves = Array.from({ length: 3 }, () => { const m = new THREE.Mesh(waveGeo, new THREE.ShaderMaterial({ uniforms: { uColor: { value: new THREE.Color(0x5fc8ff) }, uP: { value: 1 } }, vertexShader: V2, fragmentShader: WAVE_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.y = 0.03; m.visible = false; scene.add(m); return m; });
    let waveIdx = 0;
    function shockwave(x, z, color) { const m = waves[waveIdx++ % waves.length]; m.position.set(x, 0.03, z); m.material.uniforms.uColor.value.copy(color); m.visible = true; tween(2.0, (e) => { const sc = 0.5 + 14 * e; m.scale.set(sc, sc, 1); m.material.uniforms.uP.value = e; }, ease.out, () => { m.visible = false; }, "wave:" + m.id); }
    let backdrop = null;
    function setBackdrop(el, dim) {
      if (backdrop) { scene.remove(backdrop); if (backdrop.material.uniforms.tMap.value) backdrop.material.uniforms.tMap.value.dispose(); backdrop.material.dispose(); backdrop.geometry.dispose(); backdrop = null; }
      if (!el) return;
      const tex = el.tagName === "VIDEO" ? new THREE.VideoTexture(el) : new THREE.Texture(el);
      tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = false; if (el.tagName !== "VIDEO") tex.needsUpdate = true;
      if (!post) tex.encoding = THREE.sRGBEncoding;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ uniforms: { tMap: { value: tex }, uDim: { value: dim === undefined ? 0.35 : dim } }, depthTest: false, depthWrite: false, vertexShader: V2,
        fragmentShader: `uniform sampler2D tMap; uniform float uDim; varying vec2 vUv; void main(){ vec3 c = texture2D(tMap, vUv).rgb; float m = 1.0 - smoothstep(0.12, 0.72, length((vUv - 0.5) * vec2(1.0, 1.25)) * 1.3); c = c * c * uDim * m * 0.75; gl_FragColor = vec4(c, 1.0);
          ${TAIL} }` }));
      m.renderOrder = -100; m.frustumCulled = false;
      m.onBeforeRender = function () { const d = 60; m.position.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(d)); m.quaternion.copy(camera.quaternion); const h = 2 * d * Math.tan(camera.fov * Math.PI / 360); m.scale.set(h * camera.aspect, h, 1); };
      scene.add(m); backdrop = m;
    }
    function setBackdropDim(v) { if (backdrop) backdrop.material.uniforms.uDim.value = v; }
    scene.add(new THREE.HemisphereLight(0x7fbfff, 0x02040a, 0.4));
    const key = new THREE.DirectionalLight(0x9fd0ff, 0.5); key.position.set(4, 8, 6); scene.add(key);

    // ---- 다이얼 텍스처 (캔버스로 또렷하게 그린다 — 레퍼런스의 눈금·호·글자) ----
    function ringCanvas(draw) { const cv = document.createElement("canvas"); cv.width = cv.height = 1024; const ctx = cv.getContext("2d"); ctx.translate(512, 512); draw(ctx); const tex = new THREE.CanvasTexture(cv); tex.minFilter = THREE.LinearMipMapLinearFilter; tex.generateMipmaps = true; tex.anisotropy = 4; return tex; }
    const texTicks = ringCanvas((ctx) => {          // 바깥 눈금 링
      ctx.strokeStyle = "#fff"; ctx.lineCap = "round";
      for (let i = 0; i < 180; i++) { const a = i / 180 * Math.PI * 2, big = i % 15 === 0, mid = i % 5 === 0; ctx.lineWidth = big ? 5 : mid ? 3 : 1.6; ctx.globalAlpha = big ? 1 : mid ? 0.8 : 0.5; const r0 = 470, r1 = big ? 430 : mid ? 446 : 456; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke(); }
      ctx.globalAlpha = 0.55; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 486, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 0.9; ctx.fillStyle = "#fff"; ctx.font = "700 22px " + FONT_EN; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; ctx.save(); ctx.translate(Math.cos(a) * 404, Math.sin(a) * 404); ctx.rotate(a + Math.PI / 2); ctx.fillText(String(i * 30).padStart(3, "0"), 0, 0); ctx.restore(); }
    });
    const texArcs = ringCanvas((ctx) => {           // 굵은 호 링 (틈이 있다)
      ctx.strokeStyle = "#fff"; ctx.lineCap = "butt";
      const segs = [[0, 0.16, 26], [0.2, 0.31, 14], [0.34, 0.62, 26], [0.66, 0.74, 14], [0.78, 0.98, 26]];
      segs.forEach(([a, b, w]) => { ctx.lineWidth = w; ctx.globalAlpha = w > 20 ? 0.95 : 0.6; ctx.beginPath(); ctx.arc(0, 0, 360, a * Math.PI * 2, b * Math.PI * 2); ctx.stroke(); });
      ctx.globalAlpha = 0.35; ctx.lineWidth = 3; ctx.setLineDash([6, 10]); ctx.beginPath(); ctx.arc(0, 0, 330, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    });
    const texInner = ringCanvas((ctx) => {          // 안쪽 얇은 링 + 브래킷
      ctx.strokeStyle = "#fff"; ctx.globalAlpha = 0.9; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 300, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 10; ctx.globalAlpha = 1; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; ctx.beginPath(); ctx.arc(0, 0, 312, a - 0.12, a + 0.12); ctx.stroke(); }
      ctx.globalAlpha = 0.5; ctx.lineWidth = 2; for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 282, Math.sin(a) * 282); ctx.lineTo(Math.cos(a) * 290, Math.sin(a) * 290); ctx.stroke(); }
    });
    function discTexture() {                         // 가운데 원판: 빛무리와 안쪽 링 (더하기 합성)
      return ringCanvas((ctx) => {
        const g = ctx.createRadialGradient(0, 0, 40, 0, 0, 270); g.addColorStop(0, "rgba(255,255,255,0.30)"); g.addColorStop(0.55, "rgba(255,255,255,0.16)"); g.addColorStop(0.95, "rgba(255,255,255,0.05)"); g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 270, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 236, 0, Math.PI * 2); ctx.stroke();
      });
    }
    // 이름표 — 원판과 달리 보통 합성으로 그려서, 어두운 받침이 뒤의 코어 빛을 가리고 글자가 읽힌다
    function plateTexture(t) {
      return ringCanvas((ctx) => {
        const name = t.name || "ORACLE"; const en = /^[A-Za-z0-9 .'-]+$/.test(name);
        const bg = ctx.createRadialGradient(0, -10, 40, 0, -10, 230); bg.addColorStop(0, "rgba(2,7,18,0.86)"); bg.addColorStop(0.7, "rgba(2,7,18,0.74)"); bg.addColorStop(1, "rgba(2,7,18,0)");
        ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(0, -10, 232, 178, 0, 0, Math.PI * 2); ctx.fill();
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
        ctx.font = (en ? "800 " : "700 ") + (name.length > 6 ? 84 : 108) + "px " + (en ? FONT_EN : FONT_KO);
        ctx.strokeStyle = "rgba(1,4,12,0.9)"; ctx.lineWidth = 10; ctx.strokeText(name, 0, -18);
        ctx.shadowColor = "rgba(160,225,255,0.9)"; ctx.shadowBlur = 10; ctx.fillStyle = "#ffffff"; ctx.fillText(name, 0, -18);
        ctx.shadowBlur = 0; ctx.fillStyle = "#dff3ff"; ctx.font = "600 30px " + FONT_EN; ctx.fillText((t.sub || "").toUpperCase(), 0, 66);
        ctx.globalAlpha = 0.85; ctx.font = "500 22px " + FONT_EN; ctx.fillText(t.tag || "ALWAYS LEARNING", 0, 112);
        ctx.globalAlpha = 0.75; ctx.font = "500 26px " + FONT_KO; ctx.fillText(t.school || "", 0, -104);
      });
    }
    const PLATE_FS = `uniform sampler2D tMap; uniform vec3 uColor; uniform float uAlpha; varying vec2 vUv;
      void main(){ vec4 t = texture2D(tMap, vUv); gl_FragColor = vec4(uColor * t.rgb, t.a * uAlpha); ${TAIL} }`;
    const planeGeo = new THREE.PlaneGeometry(1, 1);
    const pedGeo = new THREE.CylinderGeometry(1.15, 1.35, 0.26, 56);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x0a1a30, metalness: 0.75, roughness: 0.35, emissive: 0x06142a });
    const floorGeo = new THREE.PlaneGeometry(2, 2);
    const coreGeo = new THREE.IcosahedronGeometry(0.66, 3);
    const colGeo = new THREE.CylinderGeometry(0.42, 1.0, 2.2, 32, 1, true);
    const shardGeo = new THREE.TetrahedronGeometry(0.06, 0);
    const barGeo = new THREE.BoxGeometry(0.16, 1, 0.16); barGeo.translate(0, 0.5, 0);
    const DIAL_Y = 2.05;

    // ---- 선생님 ----
    const teachers = new Map(); const order = []; let selectedId = null;
    function texPlane(tex, size, uni, extra) {
      const m = new THREE.Mesh(planeGeo, new THREE.ShaderMaterial({ uniforms: { tMap: { value: tex }, uColor: uni.uColor, uGlow: uni.uGlow, uAlpha: { value: 1 } }, vertexShader: V2, fragmentShader: TEX_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      m.scale.set(size, size, 1); Object.assign(m, extra || {}); return m;
    }
    function floorRing(uni, radius, segs, gap, speed) {
      const m = new THREE.Mesh(floorGeo, new THREE.ShaderMaterial({ uniforms: { uColor: uni.uColor, uTime: uni.uTime, uSegs: { value: segs }, uGap: { value: gap }, uOff: { value: Math.random() * 9 }, uGlow: uni.uGlow, uAlpha: { value: 0.6 } }, vertexShader: V2, fragmentShader: FLOOR_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2; m.position.y = 0.28; m.scale.set(radius, radius, 1); m.userData.speed = speed; return m;
    }
    function addTeacher(t) {
      if (teachers.has(t.id)) { updateTeacher(t); return; }
      const color = new THREE.Color(t.color || "#5fc8ff"); const hex = "#" + color.getHexString();
      const group = new THREE.Group();
      const uni = { uColor: { value: color }, uTime: { value: 0 }, uPulse: { value: 0 }, uBusy: { value: 0 }, uGlow: { value: 0 }, uOn: { value: 0.3 }, uEnergy: { value: 0 } };
      // 받침대·바닥 링·빛기둥
      const ped = new THREE.Mesh(pedGeo, pedMat); ped.position.y = 0.13; group.add(ped);
      const glowDisc = new THREE.Mesh(floorGeo, new THREE.ShaderMaterial({ uniforms: { uColor: uni.uColor, uOn: uni.uOn }, vertexShader: V2, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        fragmentShader: `uniform vec3 uColor; uniform float uOn; varying vec2 vUv; void main(){ float r = length(vUv - 0.5) * 2.0; float a = (1.0 - smoothstep(0.55, 1.0, r)) * (0.25 + 0.35*uOn); gl_FragColor = vec4(uColor * a * 1.2, a);
          ${TAIL} }` })); glowDisc.rotation.x = -Math.PI / 2; glowDisc.position.y = 0.27; glowDisc.scale.set(1.25, 1.25, 1); group.add(glowDisc);
      const rings = [floorRing(uni, 1.45, 0, 0, 0), floorRing(uni, 2.0, 12, 0.35, 0.25), floorRing(uni, 2.7, 24, 0.5, -0.12)]; rings.forEach(r => group.add(r));
      const col = new THREE.Mesh(colGeo, new THREE.ShaderMaterial({ uniforms: { uColor: uni.uColor, uTime: uni.uTime, uOn: uni.uOn }, vertexShader: V2, fragmentShader: COL_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); col.position.y = 1.35; group.add(col);
      // 다이얼 (카메라를 향한다)
      const dial = new THREE.Group(); dial.position.y = DIAL_Y; group.add(dial);
      const ticks = texPlane(texTicks, 4.2, uni, { userData: { speed: 0.06 } }), arcs = texPlane(texArcs, 4.2, uni, { userData: { speed: -0.22 } }), inner = texPlane(texInner, 4.2, uni, { userData: { speed: 0.11 } });
      const disc = texPlane(discTexture(), 4.2, uni, { userData: { speed: 0 } }); disc.material.uniforms.uColor = { value: new THREE.Color(0xffffff).lerp(color, 0.35) }; disc.material.depthTest = false; disc.renderOrder = 5;
      const plate = new THREE.Mesh(planeGeo, new THREE.ShaderMaterial({ uniforms: { tMap: { value: plateTexture(t) }, uColor: { value: new THREE.Color(0xffffff).lerp(color, 0.22) }, uAlpha: { value: 1 } }, vertexShader: V2, fragmentShader: PLATE_FS, transparent: true, depthWrite: false, depthTest: false, blending: THREE.NormalBlending, side: THREE.DoubleSide }));
      plate.scale.set(4.2, 4.2, 1); plate.renderOrder = 6; plate.userData.speed = 0;
      ticks.position.z = -0.12; arcs.position.z = -0.06; inner.position.z = 0.0; disc.position.z = 0.05; plate.position.z = 0.09;
      [ticks, arcs, inner, disc, plate].forEach(m => dial.add(m));
      const core = new THREE.Mesh(coreGeo, new THREE.ShaderMaterial({ uniforms: { uColor: uni.uColor, uTime: uni.uTime, uPulse: uni.uPulse, uBusy: uni.uBusy, uEnergy: uni.uEnergy }, vertexShader: CORE_VS, fragmentShader: CORE_FS })); core.position.z = -1.25; core.scale.setScalar(0.74); dial.add(core);
      const scan = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.012, 8, 96), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, toneMapped: false })); scan.rotation.x = Math.PI / 2; scan.position.y = 1.0; group.add(scan);
      // 지식 파편·헤일로 (다이얼 둘레)
      const SH = 120; const shards = new THREE.InstancedMesh(shardGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, toneMapped: false }), SH); shards.count = 0; shards.frustumCulled = false; shards.position.y = DIAL_Y; group.add(shards);
      const shardData = Array.from({ length: SH }, (_, i) => ({ r: rnd(2.3, 3.0), a: rnd(0, 6.28), y: rnd(-0.5, 0.5), s: rnd(0.3, 0.9) * (i % 3 ? 1 : -1), ph: rnd(0, 6.28) }));
      const HN = 1400; const hPos = new Float32Array(HN * 3), hSeed = new Float32Array(HN);
      for (let i = 0; i < HN; i++) { const th = rnd(0, 6.283), r = rnd(2.2, 3.1); hPos[i * 3] = Math.cos(th) * r; hPos[i * 3 + 1] = rnd(-0.9, 0.9); hPos[i * 3 + 2] = Math.sin(th) * r * 0.35; hSeed[i] = Math.random(); }
      const hg = new THREE.BufferGeometry(); hg.setAttribute("position", new THREE.BufferAttribute(hPos, 3)); hg.setAttribute("aSeed", new THREE.BufferAttribute(hSeed, 1)); hg.setDrawRange(0, 0);
      const halo = new THREE.Points(hg, new THREE.ShaderMaterial({ uniforms: { uColor: uni.uColor, uTime: uni.uTime, uPx: { value: 2.2 * DPR } }, vertexShader: `uniform float uTime; uniform float uPx; attribute float aSeed; varying float vA;
        void main(){ vec3 p = position; float a = uTime*(0.12 + aSeed*0.15); float c = cos(a), s = sin(a); p.xz = mat2(c, -s, s, c) * p.xz; p.y += sin(uTime*1.3 + aSeed*6.28)*0.05; vA = 0.35 + 0.65*(0.5+0.5*sin(uTime*2.0 + aSeed*12.0));
          vec4 mv = modelViewMatrix * vec4(p,1.0); gl_PointSize = uPx * (0.5 + aSeed) * clamp(14.0 / -mv.z, 0.3, 3.0); gl_Position = projectionMatrix * mv; }`, fragmentShader: PT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      halo.position.y = DIAL_Y; halo.frustumCulled = false; group.add(halo);
      const constel = new THREE.Group(); constel.position.y = DIAL_Y; group.add(constel);
      const bars = new THREE.Group(); bars.position.set(0, 0.28, 1.9); group.add(bars);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(2.4, 8, 8), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = DIAL_Y; hit.userData.teacherId = t.id; group.add(hit);
      group.position.set(0, -8, 0);
      scene.add(group);
      const rig = { id: t.id, group, uni, dial, core, col, rings, layers: [ticks, arcs, inner, disc, plate], disc, plate, scan, shards, shardData, halo, hg, constel, bars, hit, hex, color, level: 0, busy: 0, hover: 0, phase: Math.random() * 6.28, slot: order.length, scale: 1, targetScale: 1, dim: 0 };
      teachers.set(t.id, rig); order.push(t.id);
      rig.layers.forEach(m => m.scale.setScalar(0.01));
      tween(1.3, (e) => { rig.layers.forEach(m => m.scale.setScalar(0.01 + 4.2 * e)); uni.uPulse.value = (1 - e) * 1.5; }, ease.elastic);
      layout();
      setLevel(t.id, t.level || 0, true);
      return rig;
    }
    function updateTeacher(t) {
      const rig = teachers.get(t.id); if (!rig) return;
      if (t.color) { rig.color.set(t.color); rig.hex = "#" + rig.color.getHexString(); rig.scan.material.color.copy(rig.color); rig.shards.material.color.copy(rig.color); rig.disc.material.uniforms.uColor.value.set(0xffffff).lerp(rig.color, 0.35); rig.plate.material.uniforms.uColor.value.set(0xffffff).lerp(rig.color, 0.22);
        [rig.constel, rig.bars].forEach(g => g.traverse(o => { if (o.material && o.material.color && !o.material.map && !(o.material.color.getHex() === 0xf5c518)) o.material.color.copy(rig.color); })); }
      const old = rig.plate.material.uniforms.tMap.value; rig.plate.material.uniforms.tMap.value = plateTexture(t); old.dispose();
    }
    function removeTeacher(id) {
      const rig = teachers.get(id); if (!rig) return;
      if (graphSt.teacherId === id) clearGraph();
      teachers.delete(id); const i = order.indexOf(id); if (i >= 0) order.splice(i, 1); exSlot(rig.slot).z = 0; if (selectedId === id) selectedId = null;
      tween(0.7, (e) => { rig.group.position.y = -8 * e; rig.group.scale.setScalar(rig.scale * (1 - e * 0.6)); }, ease.inout, () => {
        scene.remove(rig.group); rig.shards.dispose();
        rig.group.traverse(o => { if (o.material) { if (o.material.map) o.material.map.dispose(); if (o.material.uniforms && o.material.uniforms.tMap && (o === rig.disc || o === rig.plate)) o.material.uniforms.tMap.value.dispose(); o.material.dispose(); } if (o.geometry && ![planeGeo, pedGeo, floorGeo, coreGeo, colGeo, shardGeo, barGeo].includes(o.geometry)) o.geometry.dispose(); });
      });
      for (let s = order.length; s < EXN; s++) fieldUni.uEx.value[s].z = 0;   // 빈 자리의 필드 흥분점을 끈다
      order.forEach((tid, i) => { const r = teachers.get(tid); if (r) r.slot = i; });
      layout();
    }
    // 배치: 선택된 선생님은 가운데 크게, 나머지는 뒤쪽에 작게
    function layout() {
      const others = order.filter(id => id !== selectedId);
      order.forEach((id) => {
        const rig = teachers.get(id); if (!rig) return;
        let target, sc;
        if (selectedId && id === selectedId) { target = new THREE.Vector3(0, 0, 0); sc = 1; }
        else if (selectedId) { const k = others.indexOf(id), side = k % 2 === 0 ? -1 : 1, row = Math.floor(k / 2); target = new THREE.Vector3(side * (5.2 + row * 1.6), 0, -2.6 - row * 1.2); sc = 0.55; }
        else { const n = order.length, k = order.indexOf(id); const spread = Math.min(3.0, 0.9 + n * 0.4), a = n === 1 ? 0 : (-spread / 2 + (k / (n - 1)) * spread), R = n <= 1 ? 0 : 5.2 + n * 0.4; target = new THREE.Vector3(Math.sin(a) * R, 0, -Math.cos(a) * R + (n <= 1 ? 0 : R * 0.72)); sc = n <= 1 ? 1 : 0.8; }
        const from = rig.group.position.clone(), s0 = rig.scale;
        rig.targetScale = sc;
        tween(1.1, (e) => { rig.group.position.lerpVectors(from, target, e); rig.scale = s0 + (sc - s0) * e; rig.group.scale.setScalar(rig.scale); }, ease.inout, null, "pos:" + id);
        const d0 = rig.dim, d1 = selectedId && id !== selectedId ? 0.55 : 0;
        tween(0.8, (e) => { rig.dim = d0 + (d1 - d0) * e; rig.layers.forEach(m => { m.material.uniforms.uAlpha.value = 1 - rig.dim * 0.7; }); }, ease.out, null, "dim:" + id);
      });
    }
    function setLevel(id, level, silent) {
      const rig = teachers.get(id); if (!rig) return;
      const from = rig.level, to = Math.max(0, level);
      const apply = (v) => { rig.level = v; rig.shards.count = Math.min(120, Math.round(4 + v * 0.8)); rig.hg.setDrawRange(0, Math.min(1400, Math.round(v * 9))); rig.uni.uOn.value = Math.min(1, 0.3 + v / 60); rig.uni.uEnergy.value = Math.min(1, v / 120); };
      if (silent) apply(to); else tween(1.6, (e) => apply(from + (to - from) * e), ease.out, null, "lvl:" + id);
    }
    function makeLabel(text, sub, colorHex) {
      const cv = document.createElement("canvas"); cv.width = 512; cv.height = 160; const ctx = cv.getContext("2d");
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.shadowColor = colorHex; ctx.shadowBlur = 16; ctx.fillStyle = "#eaf6ff";
      ctx.font = "600 44px " + FONT_KO; ctx.fillText(text, 256, 56); ctx.shadowBlur = 0; ctx.fillStyle = colorHex; ctx.font = "500 26px " + FONT_EN; ctx.fillText(sub || "", 256, 112);
      const tex = new THREE.CanvasTexture(cv); tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false; if (!post) tex.encoding = THREE.sRGBEncoding;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false })); sp.scale.set(1.05, 0.33, 1); sp.renderOrder = 10; return sp;
    }
    function clearGroup(g, keepGeos) { while (g.children.length) { const c = g.children.pop(); if (c.material) { if (c.material.map) c.material.map.dispose(); c.material.dispose(); } if (c.geometry && !keepGeos.includes(c.geometry)) c.geometry.dispose(); } }
    // 프로파일 → 성좌 (다이얼 둘레의 노드·실)
    function setProfile(id, prof) {
      const rig = teachers.get(id); if (!rig) return;
      const g = rig.constel; clearGroup(g, []);
      if (!prof || !prof.nodes || !prof.nodes.length) return;
      const nodes = prof.nodes.slice(0, 10), R = 2.75, pts = [];
      nodes.forEach((n, i) => {
        const a = (i / nodes.length) * Math.PI * 2 + 0.6; const p = new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R * 0.62, 0.15); pts.push(p);
        const s = 0.05 + Math.sqrt(Math.max(0, n.share || 0)) * 0.2;
        const m = new THREE.Mesh(new THREE.SphereGeometry(s, 10, 10), new THREE.MeshBasicMaterial({ color: n.color || rig.color, transparent: true, opacity: 0.95, toneMapped: false })); m.position.copy(p); m.scale.setScalar(0.001); g.add(m);
        tween(0.9 + i * 0.08, (e) => m.scale.setScalar(Math.max(0.001, e)), ease.elastic);
        const lb = makeLabel(n.label, Math.round((n.share || 0) * 100) + "%", rig.hex); lb.position.copy(p).add(new THREE.Vector3(0, s + 0.22, 0)); g.add(lb);
      });
      const ep = []; (prof.edges || []).forEach(([i, j, w]) => { if (pts[i] && pts[j] && w > 0) ep.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z); });
      const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(ep), 3));
      const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: rig.color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, toneMapped: false })); g.add(lines);
      tween(1.4, (e) => { lines.material.opacity = 0.4 * e; });
    }
    // ---- 이펙트 ----
    const bursts = [];
    function spawnParticles(rig, mode, fromWorld) {
      const N = mode === 0 ? 260 : 320; const dir = new Float32Array(N * 3), seed = new Float32Array(N), pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) { const v = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize(); dir[i * 3] = v.x; dir[i * 3 + 1] = v.y; dir[i * 3 + 2] = v.z; seed[i] = Math.random(); }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aDir", new THREE.BufferAttribute(dir, 3)); g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
      const to = rig.group.position.clone().add(new THREE.Vector3(0, DIAL_Y * rig.scale, 0)); const from = fromWorld ? fromWorld.clone() : to.clone().add(new THREE.Vector3(0, 6, 4)); const dur = mode === 0 ? 1.6 : 1.3;
      const m = new THREE.ShaderMaterial({ uniforms: { uTime: { value: clock.t }, uT0: { value: clock.t }, uDur: { value: dur }, uFrom: { value: from }, uTo: { value: to }, uPx: { value: 3.0 * DPR }, uMode: { value: mode }, uColor: { value: rig.color } }, vertexShader: PT_VS, fragmentShader: PT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      const p = new THREE.Points(g, m); p.frustumCulled = false; scene.add(p); bursts.push({ p, until: clock.t + dur + 0.2 });
    }
    function screenToWorld(x, y, depth) { const v = new THREE.Vector3((x / W) * 2 - 1, -(y / H) * 2 + 1, 0.5).unproject(camera); const d = v.sub(camera.position).normalize(); return camera.position.clone().add(d.multiplyScalar(depth || 9)); }
    const fx = {
      ingest(id, sx, sy) { const rig = teachers.get(id); if (!rig) return; spawnParticles(rig, 0, (sx !== undefined && sy !== undefined) ? screenToWorld(sx, sy, 8) : null); const s0 = rig.uni.uPulse.value; tween(0.5, (e) => { rig.uni.uPulse.value = s0 + e * 0.9; }, ease.out, () => tween(1.4, (e) => { rig.uni.uPulse.value = 0.9 * (1 - e); })); const ex = exSlot(rig.slot); tween(0.4, (e) => { ex.z = Math.max(ex.z, e * 0.9); }); },
      thinking(id, on) { const rig = teachers.get(id); if (!rig) return; const from = rig.busy, to = on ? 1 : 0; tween(0.8, (e) => { rig.busy = from + (to - from) * e; rig.uni.uBusy.value = rig.busy; rig.uni.uGlow.value = Math.max(rig.hover, rig.busy); }, ease.out, null, "busy:" + id); if (on) rig.scan.material.opacity = 0.9; else tween(0.6, (e) => { rig.scan.material.opacity = 0.9 * (1 - e); }); const ex = exSlot(rig.slot); const z0 = ex.z; tween(0.8, (e) => { ex.z = z0 + (to * 0.8 - z0) * e; ex.w = 3.0; }, ease.out, null, "ex:" + id); },
      learned(id, o) { const rig = teachers.get(id); if (!rig) return; o = o || {}; spawnParticles(rig, 1); shockwave(rig.group.position.x, rig.group.position.z, rig.color); const w = fieldUni.uWave.value; w.x = rig.group.position.x; w.y = rig.group.position.z; tween(2.6, (e, k) => { w.z = k * 22; w.w = (1 - k) * 0.6; }, ease.out, null, "wave");
        tween(0.3, (e) => { rig.uni.uPulse.value = 1.8 * e; }, ease.out, () => tween(1.8, (e) => { rig.uni.uPulse.value = 1.8 * (1 - e); })); rig.spinBoost = 6; tween(2.4, (e) => { rig.spinBoost = 6 - 5 * e; }); if (o.level !== undefined) setLevel(id, o.level); if (o.profile) setProfile(id, o.profile); },
      predict(id, bars) { const rig = teachers.get(id); if (!rig) return; const g = rig.bars; clearGroup(g, [barGeo]);
        (bars || []).slice(0, 6).forEach((b, i, arr) => { const x = (i - (arr.length - 1) / 2) * 0.42; const m = new THREE.Mesh(barGeo, new THREE.MeshBasicMaterial({ color: i < 3 ? new THREE.Color(0xf5c518) : rig.color, transparent: true, opacity: 0.75, toneMapped: false })); m.position.set(x, 0, 0); m.scale.y = 0.001; g.add(m);
          const h = 0.15 + Math.max(0, Math.min(1, b.value || 0)) * 1.6; tween(0.9 + i * 0.07, (e) => { m.scale.y = Math.max(0.001, h * e); }, ease.elastic); const lb = makeLabel(b.label || "", Math.round((b.value || 0) * 100) + "%", rig.hex); lb.scale.set(0.9, 0.28, 1); lb.position.set(x, h + 0.3, 0); g.add(lb); }); },
      highlight(id, on) { const rig = teachers.get(id); if (!rig) return; const from = rig.hover, to = on ? 1 : 0; tween(0.35, (e) => { rig.hover = from + (to - from) * e; rig.uni.uGlow.value = Math.max(rig.hover, rig.busy); }, ease.out, null, "hover:" + id); },
    };
    // ---- 그래프 (spec §3.4 · §5.7) ----
    // 선택된 선생님의 리그(rig.group) 아래에 붙는다 — 문항은 THREE.Points 하나(속성 버퍼), 시험 · 지문 · 프린트 · 예측 · 모의고사 · 메모는 종류별 InstancedMesh,
    // 간선은 LineSegments 하나. 색은 선생님 색, 프린트 지문 · 적중은 금색. 궤도 배치: 시험 링 3.6 → 지문 · 프린트 링 5.2(프린트 지문 4.6) → 문항은 매칭 지문 주위 산개
    // (매칭 없으면 시험 링 바깥 4.3) → 메모 · 예측 · 모의고사는 이어진 노드 옆. 궤도면은 뒤로 갈수록 높아지게 기울어져 있어 다이얼을 감싸는 원반으로 보인다.
    const GOLD = new THREE.Color(0xf5c518);
    const G_KINDS = ["exam", "passage", "handout", "note", "prediction", "mock"];
    const G_GEO = { exam: new THREE.TorusGeometry(0.26, 0.035, 8, 40), passage: new THREE.SphereGeometry(0.15, 12, 10), handout: new THREE.SphereGeometry(0.21, 14, 12), note: new THREE.OctahedronGeometry(0.17, 0), prediction: new THREE.CylinderGeometry(0.25, 0.25, 0.08, 6), mock: new THREE.CylinderGeometry(0.2, 0.2, 0.08, 6) };
    const G_ROT = { exam: new THREE.Euler(Math.PI / 2 - 0.28, 0, 0), prediction: new THREE.Euler(0.3, 0, 0), mock: new THREE.Euler(0.3, 0, 0) };
    const G_Y0 = 1.6, G_TC = new THREE.Vector3(0, 1.15, 0);   // 궤도 기준 높이 · 선생님 중심(빛기둥 가운데)
    const orbit = (r, a, dy) => new THREE.Vector3(Math.cos(a) * r, G_Y0 + Math.sin(a) * r * 0.3 + (dy || 0), Math.sin(a) * r * -0.58);
    const hash01 = (i, s) => { const x = Math.sin(i * 12.9898 + (s || 0) * 78.233) * 43758.5453; return x - Math.floor(x); };
    const G_PT_VS = `uniform float uTime; uniform float uPx; attribute vec3 aColor; attribute float aSize; attribute float aAlpha; varying vec3 vC; varying float vA;
      void main(){ vC = aColor; vA = aAlpha * (0.72 + 0.28*sin(uTime*1.7 + position.x*3.1 + position.z*2.3)); vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = uPx * aSize * clamp(14.0 / -mv.z, 0.3, 3.0); gl_Position = projectionMatrix * mv; }`;
    const G_PT_FS = `varying vec3 vC; varying float vA; void main(){ vec2 c = gl_PointCoord - 0.5; float r = dot(c, c); if (r > 0.25) discard; float a = smoothstep(0.25, 0.04, r) * vA; if (a < 0.003) discard; gl_FragColor = vec4(vC * a * 1.6, a); ${TAIL} }`;
    const graphSt = { nodes: [], edges: [], byId: new Map(), adj: new Map(), teacherId: null, rig: null, group: null, objs: [], pts: null, ptsAttr: null, lines: null, filter: null, focus: null, focusSet: null, hover: null, marker: null, focusMark: null, links: [], sig: "" };
    const nodeHandlers = {};
    function disposeObj(o) { if (o.material) { if (o.material.map) o.material.map.dispose(); if (o.material.uniforms && o.material.uniforms.tMap && o.material.uniforms.tMap.value) o.material.uniforms.tMap.value.dispose(); o.material.dispose(); } if (o.geometry && !Object.values(G_GEO).includes(o.geometry)) o.geometry.dispose(); if (o.dispose && o.isInstancedMesh) o.dispose(); }
    function clearGraphObjects() {
      if (graphSt.group) { [...graphSt.group.children].forEach(o => { graphSt.group.remove(o); disposeObj(o); }); if (graphSt.group.parent) graphSt.group.parent.remove(graphSt.group); }
      graphSt.group = null; graphSt.objs = []; graphSt.pts = null; graphSt.ptsAttr = null; graphSt.lines = null; graphSt.marker = null; graphSt.focusMark = null;
    }
    function clearGraph() { clearGraphObjects(); graphSt.nodes = []; graphSt.edges = []; graphSt.byId.clear(); graphSt.adj.clear(); graphSt.teacherId = null; graphSt.rig = null; graphSt.focus = null; graphSt.focusSet = null; graphSt.hover = null; graphSt.sig = ""; }
    function graphTeacherOf(nodes, edges) {
      const cnt = new Map(); nodes.forEach(n => { if (n.teacherId) cnt.set(n.teacherId, (cnt.get(n.teacherId) || 0) + 1); });
      edges.forEach(e => { if (e[2] === "owner" && teachers.has(e[1])) cnt.set(e[1], (cnt.get(e[1]) || 0) + 0.5); });
      let best = null, bn = 0; cnt.forEach((v, k) => { if (v > bn) { bn = v; best = k; } });
      if (best && !teachers.has(best)) { const alt = [...cnt.keys()].find(k => teachers.has(k)); if (alt) best = alt; }
      return best;
    }
    // 배치 — 궤도. 결정적(같은 그래프면 같은 자리)이라 다시 그려도 노드가 튀지 않는다.
    function layoutGraph() {
      const ns = graphSt.nodes, adj = graphSt.adj, byId = graphSt.byId;
      const of = (k) => ns.filter(n => n.kind === k);
      const nb = (n, kinds) => { const out = []; (adj.get(n.id) || []).forEach(([b, k]) => { const m = byId.get(b); if (m && m.pos && (!kinds || kinds.includes(k))) out.push(m); }); return out; };
      const exams = of("exam"); exams.forEach((n, i) => { n.ang = Math.PI / 6 + (i / Math.max(1, exams.length)) * Math.PI * 2; n.pos = orbit(3.6, n.ang, 0); });
      // 지문 · 프린트 링 — 프린트마다 그 지문을 모아 두고(자료 순), 나머지 지문은 뒤에
      const hs = of("handout"), ps = of("passage"), used = new Set(), ring = [];
      hs.forEach(h => { ring.push(h); (adj.get(h.id) || []).forEach(([b, k]) => { const m = byId.get(b); if (m && m.kind === "passage" && !used.has(m.id) && (k === "from" || k === "hit")) { used.add(m.id); ring.push(m); } }); });
      ps.forEach(p => { if (!used.has(p.id)) ring.push(p); });
      ring.forEach((n, i) => { n.ang = Math.PI / 6 + 0.35 + (i / Math.max(1, ring.length)) * Math.PI * 2; n.pos = orbit(n.kind === "passage" && n.hit ? 4.6 : 5.2, n.ang, n.kind === "handout" ? 0.25 : 0); });
      // 문항 — 매칭 지문 주위 산개, 없으면 소속 시험 링 바깥
      let qi = 0;
      of("question").forEach(n => {
        const i = ++qi; const p = nb(n, ["match"])[0], e = nb(n, ["belongs"])[0];
        if (p) { const a = hash01(i, 1) * Math.PI * 2, r = 0.32 + hash01(i, 2) * 0.45; n.pos = p.pos.clone().add(new THREE.Vector3(Math.cos(a) * r, (hash01(i, 3) - 0.5) * 0.5, Math.sin(a) * r * 0.7)); }
        else if (e) n.pos = orbit(4.3, e.ang + (hash01(i, 4) - 0.5) * 0.7, (hash01(i, 5) - 0.5) * 0.5);
        else n.pos = orbit(4.3, hash01(i, 6) * Math.PI * 2, (hash01(i, 7) - 0.5) * 0.5);
      });
      // 메모 · 예측 · 모의고사 — 이어진 노드 옆 (두 번 돌아 메모→메모도 붙는다), 이어진 것이 없으면 안쪽 링
      const rest = ns.filter(n => n.kind === "note" || n.kind === "prediction" || n.kind === "mock");
      for (let pass = 0; pass < 2; pass++) rest.forEach((n, i) => {
        if (n.pos) return;
        const cand = nb(n).filter(m => m.kind !== "question").concat(nb(n).filter(m => m.kind === "question"))[0];
        if (cand) { const k = (adj.get(cand.id) || []).length; const a = Math.atan2(cand.pos.z, cand.pos.x) + (hash01(i + 11, k) - 0.5) * 1.2; const out = new THREE.Vector3(Math.cos(a) * 0.6, 0.38 + hash01(i, 9) * 0.25, Math.sin(a) * 0.5); n.pos = cand.pos.clone().add(out); }
        else if (pass === 1) n.pos = orbit(2.5, Math.PI / 6 + 0.9 + i * 0.75, 0.7);
      });
      ns.forEach(n => { if (!n.pos) n.pos = orbit(2.5, hash01(n.idx, 8) * Math.PI * 2, 0.7); });
    }
    const nodeVisible = (n) => (!graphSt.filter || graphSt.filter.has(n.kind)) && (!graphSt.focusSet || graphSt.focusSet.has(n.id));
    const nodeScale = (n) => 0.8 + 0.1 * Math.min(6, +n.size || 1);
    function nodeColor(n, out) { out.copy(n.hit ? GOLD : graphSt.rig.color); if (n.kind === "passage" && !n.hit && n.pUse > 0) out.lerp(GOLD, Math.min(0.6, n.pUse)); return out; }
    // 화면 객체를 (다시) 만든다 — 필터 · 포커스가 바뀌면 통째로 다시 만든다 (≤ 수천 노드라 싸다)
    function buildGraphObjects() {
      clearGraphObjects();
      const rig = graphSt.rig; if (!rig || !graphSt.nodes.length) return;
      const group = new THREE.Group(); group.name = "graph"; group.scale.setScalar(0.9); rig.group.add(group); graphSt.group = group;
      const col = new THREE.Color(), mat4b = new THREE.Matrix4(), qb = new THREE.Quaternion(), sb = new THREE.Vector3();
      G_KINDS.forEach(kind => {
        const list = graphSt.nodes.filter(n => n.kind === kind && nodeVisible(n)); if (!list.length) return;
        const mesh = new THREE.InstancedMesh(G_GEO[kind], new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: kind === "exam" ? 0.95 : 0.88, toneMapped: false }), list.length);
        mesh.frustumCulled = false; mesh.userData.kind = kind;
        list.forEach((n, i) => { n.inst = i; qb.setFromEuler(G_ROT[kind] || new THREE.Euler()); sb.setScalar(nodeScale(n)); mat4b.compose(n.pos, qb, sb); mesh.setMatrixAt(i, mat4b); mesh.setColorAt(i, nodeColor(n, col)); });
        mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        group.add(mesh); graphSt.objs.push(mesh);
      });
      const qs = graphSt.nodes.filter(n => n.kind === "question" && nodeVisible(n));
      if (qs.length) {
        const pos = new Float32Array(qs.length * 3), c = new Float32Array(qs.length * 3), sz = new Float32Array(qs.length), al = new Float32Array(qs.length);
        qs.forEach((n, i) => { n.inst = i; pos[i * 3] = n.pos.x; pos[i * 3 + 1] = n.pos.y; pos[i * 3 + 2] = n.pos.z; nodeColor(n, col); c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b; sz[i] = n.hit ? 1.35 : 1; al[i] = 1; });
        const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aColor", new THREE.BufferAttribute(c, 3)); g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1)); g.setAttribute("aAlpha", new THREE.BufferAttribute(al, 1));
        const pts = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: { uTime: { value: clock.t }, uPx: { value: 4.2 * DPR } }, vertexShader: G_PT_VS, fragmentShader: G_PT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        pts.frustumCulled = false; group.add(pts); graphSt.pts = pts; graphSt.ptsAttr = { sz, al };
      }
      // 이름표 — 시험 · 프린트 · 예측 · 모의고사만 (최대 24)
      let nl = 0;
      graphSt.nodes.forEach(n => { if (nl >= 24 || !nodeVisible(n) || !["exam", "handout", "prediction", "mock"].includes(n.kind)) return; nl++; const lb = makeLabel(String(n.label || "").slice(0, 22), n.sub ? String(n.sub).slice(0, 26) : "", n.hit ? "#f5c518" : rig.hex); lb.scale.set(0.9, 0.28, 1); lb.position.copy(n.pos).add(new THREE.Vector3(0, 0.42, 0)); group.add(lb); });
      // 호버 · 포커스 표식
      const mk = (r, op) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 8, 40), new THREE.MeshBasicMaterial({ color: rig.color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false })); m.visible = false; m.frustumCulled = false; group.add(m); return m; };
      graphSt.marker = mk(0.42, 0.9); graphSt.focusMark = mk(0.55, 0.7);
      const lines = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false }));
      lines.frustumCulled = false; group.add(lines); graphSt.lines = lines;
      rebuildEdges();
      rig.group.updateMatrixWorld(true);
    }
    // 간선 — 200개를 넘으면 문항에 닿지 않는 간선 + 호버/포커스 노드의 이웃만
    function rebuildEdges() {
      const L = graphSt.lines; if (!L) return;
      const sparse = graphSt.edges.length > 200, hot = new Set([graphSt.hover, graphSt.focus].filter(Boolean));
      const vis = (id) => { if (id === graphSt.teacherId) return true; const n = graphSt.byId.get(id); return !!(n && nodeVisible(n)); };
      const at = (id) => id === graphSt.teacherId ? G_TC : graphSt.byId.get(id).pos;
      const pos = [], col = [], c = new THREE.Color();
      graphSt.edges.forEach(([a, b, k]) => {
        if (!vis(a) || !vis(b)) return;
        const na = graphSt.byId.get(a), nbb = graphSt.byId.get(b);
        if (sparse && ((na && na.kind === "question") || (nbb && nbb.kind === "question")) && !hot.has(a) && !hot.has(b)) return;
        const pa = at(a), pb = at(b); pos.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
        if (k === "hit") c.copy(GOLD); else c.copy(graphSt.rig.color).multiplyScalar(k === "owner" ? 0.35 : 0.7);
        if (hot.size && !hot.has(a) && !hot.has(b)) c.multiplyScalar(0.45);
        col.push(c.r, c.g, c.b, c.r, c.g, c.b);
      });
      L.geometry.dispose(); L.geometry = new THREE.BufferGeometry();
      L.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3)); L.geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(col), 3));
    }
    function setGraph(g) {
      g = g || {}; const raw = Array.isArray(g.nodes) ? g.nodes : [], rawE = Array.isArray(g.edges) ? g.edges : [];
      clearGraph();
      const seen = new Set();
      raw.forEach((n, i) => { if (!n || !n.id || seen.has(n.id)) return; seen.add(n.id); const kind = n.kind === "source" ? "passage" : n.kind; if (!G_KINDS.includes(kind) && kind !== "question") return;
        graphSt.nodes.push({ id: n.id, kind, label: n.label || "", sub: n.sub || "", size: +n.size || 1, teacherId: n.teacherId || null, hit: !!n.hit, pUse: +n.pUse || 0, noteKind: n.noteKind || "", idx: i, pos: null, inst: -1 }); });
      graphSt.nodes.forEach(n => graphSt.byId.set(n.id, n));
      graphSt.teacherId = graphTeacherOf(graphSt.nodes, rawE);
      rawE.forEach(e => { if (!Array.isArray(e) || e.length < 2) return; const [a, b, k] = e; const okA = graphSt.byId.has(a) || a === graphSt.teacherId, okB = graphSt.byId.has(b) || b === graphSt.teacherId; if (!okA || !okB || a === b) return; graphSt.edges.push([a, b, k || "link"]); });
      const add = (a, b, k) => { if (!graphSt.adj.has(a)) graphSt.adj.set(a, []); graphSt.adj.get(a).push([b, k]); };
      graphSt.edges.forEach(([a, b, k]) => { add(a, b, k); add(b, a, k); });
      graphSt.rig = graphSt.teacherId ? teachers.get(graphSt.teacherId) || null : null;
      layoutGraph();
      buildGraphObjects();
    }
    function graph() { return { nodes: graphSt.nodes.map(n => ({ id: n.id, kind: n.kind, label: n.label, sub: n.sub, size: n.size, teacherId: n.teacherId, hit: n.hit, pUse: n.pUse })), edges: graphSt.edges.map(e => e.slice()), teacherId: graphSt.teacherId, rendered: !!graphSt.group }; }
    const gW = new THREE.Vector3();
    function nodeWorld(id) {
      if (id === graphSt.teacherId || (!graphSt.byId.has(id) && teachers.has(id))) { const rig = teachers.get(id); if (!rig) return null; return gW.copy(G_TC).multiplyScalar(rig.scale).add(rig.group.position); }
      const n = graphSt.byId.get(id); if (!n || !graphSt.group) return null; return graphSt.group.localToWorld(gW.copy(n.pos));
    }
    function nodeScreen(id) {
      const w = nodeWorld(id); if (!w) return null;
      const n = graphSt.byId.get(id); const p = w.clone().project(camera);
      return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H, visible: p.z < 1 && Math.abs(p.x) < 1.05 && Math.abs(p.y) < 1.05 && (!n || nodeVisible(n)) };
    }
    // pickNode(x, y) → { id, kind, … } | null — 클라이언트 좌표. 문항은 가장 가까운 점(8px), 다른 노드는 12px, 그 다음 선생님(기존 pick)
    function pickNode(x, y, nodesOnly) {
      const r = canvas.getBoundingClientRect(); const cx = x - r.left, cy = y - r.top;
      let best = null, bd = Infinity;
      if (graphSt.group) {
        const mw = graphSt.group.matrixWorld;
        graphSt.nodes.forEach(n => { if (!nodeVisible(n)) return; const p = gW.copy(n.pos).applyMatrix4(mw).project(camera); if (p.z >= 1) return; const sx = (p.x + 1) / 2 * W, sy = (1 - p.y) / 2 * H; const d = Math.hypot(sx - cx, sy - cy) - (n.kind === "question" ? 8 : 12); if (d < 0 && d < bd) { bd = d; best = n; } });
      }
      if (best) return { id: best.id, kind: best.kind, label: best.label, sub: best.sub, teacherId: best.teacherId, hit: best.hit };
      if (nodesOnly) return null;
      const tid = pick(x, y); return tid ? { id: tid, kind: "teacher", teacherId: tid } : null;
    }
    function hoverNode(id) {
      id = id && graphSt.byId.has(id) ? id : null; if (id === graphSt.hover) return;
      graphSt.hover = id; if (graphSt.marker) { const n = id ? graphSt.byId.get(id) : null; graphSt.marker.visible = !!n; if (n) graphSt.marker.position.copy(n.pos); }
      if (graphSt.edges.length > 200 || graphSt.focus) rebuildEdges();
    }
    function focusNode(id) {
      id = id && (graphSt.byId.has(id) || id === graphSt.teacherId) ? id : null;
      graphSt.focus = id;
      if (!id) graphSt.focusSet = null;
      else { const seen = new Set([id]); let fr = [id]; for (let h = 0; h < 2; h++) { const nx = []; fr.forEach(a => (graphSt.adj.get(a) || []).forEach(([b]) => { if (!seen.has(b)) { seen.add(b); nx.push(b); } })); fr = nx; } graphSt.focusSet = seen; }
      buildGraphObjects();
      if (graphSt.focusMark) { const n = id ? graphSt.byId.get(id) : null; graphSt.focusMark.visible = !!n; if (n) graphSt.focusMark.position.copy(n.pos); }
      const w = id ? nodeWorld(id) : null;
      if (w) { cam.tTarget.set(0, DIAL_Y - 0.15, 0).lerp(w, 0.4); cam.tDist = 9.8; } else { cam.tTarget.set(0, DIAL_Y - 0.15, 0); cam.tDist = 11.5; }
      cam.idle = 0;
    }
    function setNodeFilter(kinds) { graphSt.filter = Array.isArray(kinds) && kinds.length ? new Set(kinds) : null; buildGraphObjects(); if (graphSt.focusMark && graphSt.focus && graphSt.byId.has(graphSt.focus)) { graphSt.focusMark.visible = true; graphSt.focusMark.position.copy(graphSt.byId.get(graphSt.focus).pos); } }
    // fx.link(a, b) — 두 노드 사이에 선이 0.8초에 걸쳐 자라고 1.2초 머문 뒤 사라진다
    function fxLink(a, b) {
      const pa = nodeWorld(a); if (!pa) return; const A = pa.clone(); const pb = nodeWorld(b); if (!pb) return; const B = pb.clone();
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array([A.x, A.y, A.z, A.x, A.y, A.z]), 3));
      const color = (graphSt.rig ? graphSt.rig.color : new THREE.Color(0x5fc8ff)).clone().lerp(new THREE.Color(0xffffff), 0.35);
      const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, toneMapped: false, depthWrite: false })); line.frustumCulled = false; scene.add(line); graphSt.links.push(line);
      const arr = g.attributes.position.array;
      tween(calm ? 0.2 : 0.8, (e) => { arr[3] = A.x + (B.x - A.x) * e; arr[4] = A.y + (B.y - A.y) * e; arr[5] = A.z + (B.z - A.z) * e; g.attributes.position.needsUpdate = true; }, ease.out, () => {
        tween(1.2, (e) => { line.material.opacity = 1 - e; }, ease.lin, () => { scene.remove(line); g.dispose(); line.material.dispose(); const i = graphSt.links.indexOf(line); if (i >= 0) graphSt.links.splice(i, 1); });
      });
      const nb = graphSt.byId.get(b); if (nb && graphSt.marker) { graphSt.marker.visible = true; graphSt.marker.position.copy(nb.pos); graphSt.marker.scale.setScalar(0.3); tween(0.8, (e) => { graphSt.marker.scale.setScalar(0.3 + 0.7 * e); }, ease.elastic, () => { if (graphSt.hover !== b) graphSt.marker.visible = false; }); }
    }
    fx.link = fxLink;
    function graphFrame(dt) {
      if (!graphSt.group) return;
      const t = clock.t;
      if (graphSt.pts) graphSt.pts.material.uniforms.uTime.value = t;
      if (graphSt.marker && graphSt.marker.visible) { graphSt.marker.rotation.y = t * 1.2; graphSt.marker.rotation.x = Math.PI / 2 - 0.3 + Math.sin(t * 2) * 0.1; }
      if (graphSt.focusMark && graphSt.focusMark.visible) { const s = 1 + 0.12 * Math.sin(t * 3); graphSt.focusMark.scale.setScalar(s); graphSt.focusMark.rotation.x = Math.PI / 2 - 0.3; graphSt.focusMark.rotation.z = -t * 0.8; }
    }

    // ---- 카메라 ----
    const cam = { theta: 0, phi: 1.30, dist: 11.5, target: new THREE.Vector3(0, DIAL_Y - 0.15, 0), auto: false, idle: 0, tTarget: new THREE.Vector3(0, DIAL_Y - 0.15, 0), tDist: 11.5, tTheta: 0, tPhi: 1.30 };
    function applyCam() { cam.target.lerp(cam.tTarget, 0.08); cam.dist += (cam.tDist - cam.dist) * 0.08; cam.theta += (cam.tTheta - cam.theta) * 0.1; cam.phi += (cam.tPhi - cam.phi) * 0.1; const s = Math.sin(cam.phi); camera.position.set(cam.target.x + Math.sin(cam.theta) * s * cam.dist, cam.target.y + Math.cos(cam.phi) * cam.dist, cam.target.z + Math.cos(cam.theta) * s * cam.dist); camera.lookAt(cam.target); }
    let drag = null, moved = 0, hoverId = null;
    const onDown = (e) => { if (e.button !== undefined && e.button !== 0) return; drag = { x: e.clientX, y: e.clientY, th: cam.tTheta, ph: cam.tPhi }; moved = 0; cam.idle = 0; };
    const onMove = (e) => { if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy); cam.tTheta = Math.max(-0.9, Math.min(0.9, drag.th - dx * 0.005)); cam.tPhi = Math.max(1.05, Math.min(1.48, drag.ph + dy * 0.004)); cam.idle = 0; }
      let nid = null;
      if (graphSt.group && !drag) { const n = pickNode(e.clientX, e.clientY, true); if (n) nid = n.id; }
      if (nid !== graphSt.hover) { hoverNode(nid); if (nodeHandlers.onHover) nodeHandlers.onHover(nid ? pickInfo(nid) : null); }
      const id = nid ? null : pick(e.clientX, e.clientY); if (id !== hoverId) { if (hoverId) fx.highlight(hoverId, false); hoverId = id; if (id) fx.highlight(id, true); if (opts.onHover) opts.onHover(id); }
      canvas.style.cursor = (id || nid) ? "pointer" : (drag ? "grabbing" : "grab"); };
    const pickInfo = (id) => { const n = graphSt.byId.get(id); return n ? { id: n.id, kind: n.kind, label: n.label, sub: n.sub, teacherId: n.teacherId, hit: n.hit } : (teachers.has(id) ? { id, kind: "teacher", teacherId: id } : null); };
    const onUp = (e) => { if (drag && moved < 6) { const n = graphSt.group ? pickNode(e.clientX, e.clientY, true) : null; if (n) { if (nodeHandlers.onSelect) nodeHandlers.onSelect(n); } else { const id = pick(e.clientX, e.clientY); if (opts.onSelect) opts.onSelect(id); } } drag = null; };
    const onDbl = (e) => { const n = pickNode(e.clientX, e.clientY); if (n && nodeHandlers.onOpen) nodeHandlers.onOpen(n); };
    const onWheel = (e) => { e.preventDefault(); cam.tDist = Math.max(7.5, Math.min(18, cam.tDist + e.deltaY * 0.012)); cam.idle = 0; };
    canvas.addEventListener("pointerdown", onDown); window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp); canvas.addEventListener("dblclick", onDbl); canvas.addEventListener("wheel", onWheel, { passive: false }); canvas.style.cursor = "grab";
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    function pick(x, y) { const r = canvas.getBoundingClientRect(); ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); const hits = ray.intersectObjects([...teachers.values()].map(t => t.hit), false); return hits.length ? hits[0].object.userData.teacherId : null; }
    function focus(id) { selectedId = id && teachers.has(id) ? id : null; layout(); cam.tTheta = 0; cam.idle = 0; }
    const tmpV = new THREE.Vector3();
    function anchor(id) { const rig = teachers.get(id); if (!rig) return null; tmpV.copy(rig.group.position).add(new THREE.Vector3(0, (DIAL_Y + 2.3) * rig.scale, 0)).project(camera); return { x: (tmpV.x + 1) / 2 * W, y: (1 - tmpV.y) / 2 * H, visible: tmpV.z < 1 && Math.abs(tmpV.x) < 1.2 && Math.abs(tmpV.y) < 1.2 }; }
    // ---- 프레임 ----
    const mat4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v3 = new THREE.Vector3(), sc = new THREE.Vector3(), eul = new THREE.Euler();
    let last = performance.now(), raf = 0, running = true, visible = true, ema = 16, work = 8, slowFrames = 0, degraded = false;
    function degrade() {
      if (degraded) return; degraded = true;
      if (post) { try { post.dispose(); } catch (e) {} post = null; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputEncoding = THREE.sRGBEncoding; }
      renderer.setPixelRatio(1); fieldUni.uPx.value = 2.0; resize();
      teachers.forEach(rig => { rig.halo.material.uniforms.uPx.value = 2.2; [rig.constel, rig.bars].forEach(g => g.traverse(o => { if (o.isSprite && o.material.map) { o.material.map.encoding = THREE.sRGBEncoding; o.material.map.needsUpdate = true; } })); });
      if (opts.onDegrade) opts.onDegrade();
    }
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!running || !visible) { last = now; return; }
      const rawDt = (now - last) / 1000; let dt = Math.min(0.05, rawDt); last = now;
      ema = ema * 0.9 + Math.min(200, rawDt * 1000) * 0.1;
      if (work > 26) { if (++slowFrames > 120) degrade(); } else slowFrames = 0;      // 그리는 데 실제로 걸린 시간으로만 판단한다 (30Hz 화면에서 억울하게 강등되지 않게)
      if (calm) dt *= 0.35;
      clock.t += dt; fieldUni.uTime.value = clock.t; runTweens(dt); cam.idle += dt;
      if (!drag && cam.idle > 12 && !calm) cam.tTheta = Math.sin(clock.t * 0.08) * 0.25;
      applyCam();
      teachers.forEach((rig) => {
        const t = clock.t + rig.phase; rig.uni.uTime.value = t;
        const face = Math.atan2(camera.position.x - rig.group.position.x, camera.position.z - rig.group.position.z);
        let dy = face - rig.dial.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); rig.dial.rotation.y += dy * 0.08; rig.dial.rotation.x = -0.06;
        rig.dial.position.y = DIAL_Y + Math.sin(t * 0.8) * 0.05;
        const spin = (1 + rig.busy * 2.5 + (rig.spinBoost || 0)) * (calm ? 0.2 : 1);
        rig.layers.forEach(m => { m.rotation.z += dt * m.userData.speed * spin; });
        rig.rings.forEach(r => { r.rotation.z += dt * r.userData.speed * spin; });
        rig.core.rotation.y = t * 0.25; rig.core.rotation.x = Math.sin(t * 0.3) * 0.15;
        if (rig.scan.material.opacity > 0.01) { rig.scan.position.y = DIAL_Y + Math.sin(t * 3.0) * 2.0; rig.scan.scale.setScalar(1 + 0.05 * Math.cos(t * 3.0)); }
        const n = rig.shards.count;
        for (let i = 0; i < n; i++) { const d = rig.shardData[i]; const a = d.a + t * d.s * (0.3 + rig.busy); v3.set(Math.cos(a) * d.r, d.y + Math.sin(t * 1.1 + d.ph) * 0.1, Math.sin(a) * d.r * 0.35); eul.set(t * d.s, a, d.ph); q.setFromEuler(eul); sc.setScalar(0.7 + 0.5 * Math.sin(t * 2 + d.ph)); mat4.compose(v3, q, sc); rig.shards.setMatrixAt(i, mat4); }
        if (n) rig.shards.instanceMatrix.needsUpdate = true;
        rig.shards.rotation.y = rig.dial.rotation.y; rig.halo.rotation.y = rig.dial.rotation.y; rig.constel.rotation.y = rig.dial.rotation.y;
        if (!calm && Math.random() < 0.003) { const g0 = rig.uni.uGlow.value; rig.uni.uGlow.value = 1.6; tween(0.12, (e) => { rig.uni.uGlow.value = 1.6 - (1.6 - g0) * e; }); }
        const ex = exSlot(rig.slot); ex.x = rig.group.position.x; ex.y = rig.group.position.z; if (ex.w < 1) ex.w = 2.8;
        if (!rig.busy && ex.z > 0.12) ex.z = Math.max(0.12, ex.z - dt * 0.4); else if (!rig.busy && ex.z < 0.12) ex.z = Math.min(0.12, ex.z + dt * 0.2);
      });
      graphFrame(dt);
      for (let i = bursts.length - 1; i >= 0; i--) { const b = bursts[i]; b.p.material.uniforms.uTime.value = clock.t; if (clock.t > b.until) { scene.remove(b.p); b.p.geometry.dispose(); b.p.material.dispose(); bursts.splice(i, 1); } }
      const t0 = performance.now();
      if (post) post.render(scene, camera, calm ? 0 : clock.t); else renderer.render(scene, camera);
      work = work * 0.9 + Math.min(200, performance.now() - t0) * 0.1;
      if (opts.onFrame) opts.onFrame();
    }
    raf = requestAnimationFrame(frame);
    let rzT = 0;
    function resize() { W = canvas.clientWidth || window.innerWidth; H = canvas.clientHeight || window.innerHeight; camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H, false); clearTimeout(rzT); rzT = setTimeout(() => { if (post) post.setSize(W, H); }, 180); }
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => { visible = !document.hidden; last = performance.now(); });
    canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); running = false; }, false);
    canvas.addEventListener("webglcontextrestored", () => { resize(); running = true; }, false);
    return { ok: true, addTeacher, removeTeacher, updateTeacher, setProfile, setLevel, fx, focus, pick, anchor, resize, setBackdrop, setBackdropDim, degrade, fps: () => Math.round(1000 / Math.max(1, ema)),
      // 그래프 (§5.7)
      setGraph, clearGraph, graph, pickNode: (x, y) => pickNode(x, y, false), focusNode, setNodeFilter, nodeScreen, hoverNode,
      onNode(h) { Object.assign(nodeHandlers, h || {}); },     // { onSelect(node), onHover(node|null), onOpen(node) } — 노드 클릭 · 호버 · 더블클릭 (선생님 클릭은 opts.onSelect 그대로)
      get running() { return running; },
      debug() { return { cam: camera.position.toArray().map(v => +v.toFixed(2)), rigs: [...teachers.values()].map(r => r.group.position.toArray().map(v => +v.toFixed(2))), t: +clock.t.toFixed(1), tweens: tweens.length, selected: selectedId, graph: { nodes: graphSt.nodes.length, edges: graphSt.edges.length, rendered: !!graphSt.group, focus: graphSt.focus, hover: graphSt.hover, filter: graphSt.filter ? [...graphSt.filter] : null } }; },
      teachers: () => [...teachers.keys()], pause() { running = false; }, resume() { running = true; last = performance.now(); },
      dispose() { cancelAnimationFrame(raf); clearGraph(); graphSt.links.splice(0).forEach(l => { scene.remove(l); l.geometry.dispose(); l.material.dispose(); }); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); canvas.removeEventListener("dblclick", onDbl); renderer.dispose(); if (post) post.dispose(); } };
  }
