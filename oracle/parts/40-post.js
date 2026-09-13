  // ==================================================================
  //  POST — 블룸·스트릭·그레인 합성 (ORUN STUDIO 랜딩의 모듈을 그대로 가져왔다)
  // ==================================================================
  /* ===== module: post ===== */
  function makePost(THREE, renderer, width, height, opts) {
    opts = opts || {};
    var LEVELS = 5;   // recomputed in allocate()
    var W = Math.max(2, Math.floor(width || 2));
    var H = Math.max(2, Math.floor(height || 2));
    var PR = renderer.getPixelRatio ? renderer.getPixelRatio() : 1;
  
    // ---------- HDR buffer type -------------------------------------------
    var caps = renderer.capabilities;
    var hdrType = THREE.HalfFloatType;
    try {
      if (caps.isWebGL2) {
        if (!renderer.extensions.get('EXT_color_buffer_half_float') &&
            !renderer.extensions.get('EXT_color_buffer_float')) hdrType = THREE.UnsignedByteType;
      } else {
        if (!renderer.extensions.get('OES_texture_half_float')) hdrType = THREE.UnsignedByteType;
      }
    } catch (e) { hdrType = THREE.UnsignedByteType; }
  
    function mkRT(w, h, depth) {
      var rt = new THREE.WebGLRenderTarget(Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h)), {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: hdrType,
        depthBuffer: !!depth,
        stencilBuffer: false
      });
      rt.texture.generateMipmaps = false;
      rt.texture.wrapS = rt.texture.wrapT = THREE.ClampToEdgeWrapping;
      return rt;
    }
  
    function mkSceneRT(w, h) {
      var samples = (opts.msaa === undefined) ? 4 : opts.msaa;
      if (caps.isWebGL2 && samples > 0 && THREE.WebGLMultisampleRenderTarget) {
        try {
          var rt = new THREE.WebGLMultisampleRenderTarget(Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h)), {
            minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat, type: hdrType, depthBuffer: true, stencilBuffer: false
          });
          rt.samples = samples;
          rt.texture.generateMipmaps = false;
          return rt;
        } catch (e) { /* fall through */ }
      }
      return mkRT(w, h, true);
    }
  
    // ---------- fullscreen triangle ---------------------------------------
    var quadGeo = new THREE.BufferGeometry();
    quadGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1,-1,0, 3,-1,0, -1,3,0]), 3));
    quadGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0,0, 2,0, 0,2]), 2));
    var quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var quadMesh = new THREE.Mesh(quadGeo, null);
    quadMesh.frustumCulled = false;
    var quadScene = new THREE.Scene();
    quadScene.add(quadMesh);
  
    function blit(mat, target) {
      quadMesh.material = mat;
      renderer.setRenderTarget(target || null);
      renderer.render(quadScene, quadCam);
    }
  
    var VERT = [
      'varying vec2 vUv;',
      'void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }'
    ].join('\n');
  
    function mkMat(frag, uniforms) {
      return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: VERT,
        fragmentShader: frag,
        depthTest: false, depthWrite: false, blending: THREE.NoBlending, transparent: false
      });
    }
  
    // ---------- 1. bright pass (soft knee) --------------------------------
    var brightMat = mkMat([
      'uniform sampler2D tSrc;',
      'uniform vec2 texel;',            // texel size of the SOURCE
      'uniform float threshold;',
      'uniform float knee;',
      'uniform float clampMax;',
      'varying vec2 vUv;',
      'void main(){',
      '  vec3 c = texture2D(tSrc, vUv + texel*vec2(-1.0,-1.0)).rgb;',
      '  c += texture2D(tSrc, vUv + texel*vec2( 1.0,-1.0)).rgb;',
      '  c += texture2D(tSrc, vUv + texel*vec2(-1.0, 1.0)).rgb;',
      '  c += texture2D(tSrc, vUv + texel*vec2( 1.0, 1.0)).rgb;',
      '  c *= 0.25;',
      '  c = min(c, vec3(clampMax));',
      '  float br = max(c.r, max(c.g, c.b));',
      '  float sf = clamp(br - threshold + knee, 0.0, 2.0*knee);',
      '  sf = sf*sf/(4.0*knee + 1e-5);',
      '  float w = max(sf, br - threshold) / max(br, 1e-5);',
      '  gl_FragColor = vec4(c*w, 1.0);',
      '}'
    ].join('\n'), {
      tSrc: { value: null },
      texel: { value: new THREE.Vector2() },
      threshold: { value: opts.threshold !== undefined ? opts.threshold : 1.15 },
      knee: { value: opts.knee !== undefined ? opts.knee : 0.35 },
      clampMax: { value: opts.clampMax !== undefined ? opts.clampMax : 48.0 }
    });
  
    // ---------- 2a. downsample (4-tap box) --------------------------------
    var downMat = mkMat([
      'uniform sampler2D tSrc;',
      'uniform vec2 texel;',
      'varying vec2 vUv;',
      'void main(){',
      '  vec3 c = texture2D(tSrc, vUv + texel*vec2(-1.0,-1.0)).rgb;',
      '  c += texture2D(tSrc, vUv + texel*vec2( 1.0,-1.0)).rgb;',
      '  c += texture2D(tSrc, vUv + texel*vec2(-1.0, 1.0)).rgb;',
      '  c += texture2D(tSrc, vUv + texel*vec2( 1.0, 1.0)).rgb;',
      '  gl_FragColor = vec4(c*0.25, 1.0);',
      '}'
    ].join('\n'), { tSrc: { value: null }, texel: { value: new THREE.Vector2() } });
  
    // ---------- 2b. separable gaussian (9 tap) ----------------------------
    var blurMat = mkMat([
      'uniform sampler2D tSrc;',
      'uniform vec2 dir;',
      'varying vec2 vUv;',
      'void main(){',
      '  vec3 c = texture2D(tSrc, vUv).rgb * 0.2270270;',
      '  c += (texture2D(tSrc, vUv + dir).rgb        + texture2D(tSrc, vUv - dir).rgb)        * 0.1945946;',
      '  c += (texture2D(tSrc, vUv + dir*2.0).rgb    + texture2D(tSrc, vUv - dir*2.0).rgb)    * 0.1216216;',
      '  c += (texture2D(tSrc, vUv + dir*3.0).rgb    + texture2D(tSrc, vUv - dir*3.0).rgb)    * 0.0540541;',
      '  c += (texture2D(tSrc, vUv + dir*4.0).rgb    + texture2D(tSrc, vUv - dir*4.0).rgb)    * 0.0162162;',
      '  gl_FragColor = vec4(c, 1.0);',
      '}'
    ].join('\n'), { tSrc: { value: null }, dir: { value: new THREE.Vector2() } });
  
    // ---------- 2c. tent upsample + combine -------------------------------
    var upMat = mkMat([
      'uniform sampler2D tSmall;',
      'uniform sampler2D tBig;',
      'uniform vec2 texelSmall;',
      'uniform float radius;',
      'uniform float weight;',
      'varying vec2 vUv;',
      'vec3 tent(sampler2D t, vec2 uv, vec2 tx){',
      '  vec3 s = texture2D(t, uv + tx*vec2(-1.0,-1.0)).rgb;',
      '  s += texture2D(t, uv + tx*vec2( 0.0,-1.0)).rgb * 2.0;',
      '  s += texture2D(t, uv + tx*vec2( 1.0,-1.0)).rgb;',
      '  s += texture2D(t, uv + tx*vec2(-1.0, 0.0)).rgb * 2.0;',
      '  s += texture2D(t, uv).rgb * 4.0;',
      '  s += texture2D(t, uv + tx*vec2( 1.0, 0.0)).rgb * 2.0;',
      '  s += texture2D(t, uv + tx*vec2(-1.0, 1.0)).rgb;',
      '  s += texture2D(t, uv + tx*vec2( 0.0, 1.0)).rgb * 2.0;',
      '  s += texture2D(t, uv + tx*vec2( 1.0, 1.0)).rgb;',
      '  return s * 0.0625;',
      '}',
      'void main(){',
      '  vec3 big = texture2D(tBig, vUv).rgb;',
      '  vec3 up  = tent(tSmall, vUv, texelSmall*radius);',
      '  gl_FragColor = vec4(big + up*weight, 1.0);',
      '}'
    ].join('\n'), {
      tSmall: { value: null }, tBig: { value: null },
      texelSmall: { value: new THREE.Vector2() },
      radius: { value: opts.bloomRadius !== undefined ? opts.bloomRadius : 1.25 },
      weight: { value: opts.mipWeight !== undefined ? opts.mipWeight : 0.82 }
    });
  
    // ---------- 3. anamorphic horizontal streak ---------------------------
    var streakMat = mkMat([
      'uniform sampler2D tSrc;',
      'uniform vec2 texel;',
      'uniform float uStep;',
      'uniform float decay;',
      'uniform float gate;',
      'varying vec2 vUv;',
      'void main(){',
      '  vec3 sum = vec3(0.0);',
      '  float wsum = 0.0;',
      '  for(int i=-7; i<=7; i++){',
      '    float fi = float(i);',
      '    float w = exp(-abs(fi)*uStep*decay);',
      '    sum += max(texture2D(tSrc, vUv + vec2(texel.x*uStep*fi, 0.0)).rgb - gate, vec3(0.0)) * w;',
      '    wsum += w;',
      '  }',
      '  gl_FragColor = vec4(sum/wsum, 1.0);',
      '}'
    ].join('\n'), {
      tSrc: { value: null },
      texel: { value: new THREE.Vector2() },
      uStep: { value: 1.0 },
      gate: { value: 0.0 },
      decay: { value: opts.streakDecay !== undefined ? opts.streakDecay : 0.052 }
    });
  
    // ---------- 4. composite / grade --------------------------------------
    var compMat = mkMat([
      'uniform sampler2D tScene;',
      'uniform sampler2D tBloom;',
      'uniform sampler2D tStreak;',
      'uniform vec2  resolution;',
      'uniform float exposure;',
      'uniform float bloomIntensity;',
      'uniform float streakIntensity;',
      'uniform vec3  streakTint;',
      'uniform float streakDesat;',
      'uniform float caAmount;',
      'uniform float grainAmount;',
      'uniform float grainShadow;',
      'uniform float grainChroma;',
      'uniform float grainScale;',
      'uniform float vignetteAmount;',
      'uniform float vignetteRadius;',
      'uniform float vignetteSoft;',
      'uniform float saturation;',
      'uniform float lift;',
      'uniform float time;',
      'varying vec2 vUv;',
  
      'const mat3 ACESIn = mat3(',
      ' 0.59719, 0.07600, 0.02840,',
      ' 0.35458, 0.90834, 0.13383,',
      ' 0.04823, 0.01566, 0.83777);',
      'const mat3 ACESOut = mat3(',
      '  1.60475, -0.10208, -0.00327,',
      ' -0.53108,  1.10813, -0.07276,',
      ' -0.07367, -0.00605,  1.07602);',
      'vec3 rrt(vec3 v){',
      '  vec3 a = v*(v + 0.0245786) - 0.000090537;',
      '  vec3 b = v*(0.983729*v + 0.4329510) + 0.238081;',
      '  return a/b;',
      '}',
      'vec3 aces(vec3 c){ c = ACESIn*c; c = rrt(c); c = ACESOut*c; return clamp(c, 0.0, 1.0); }',
      'vec3 toSRGB(vec3 c){',
      '  return mix(c*12.92, 1.055*pow(max(c, vec3(1e-5)), vec3(1.0/2.4)) - 0.055, step(vec3(0.0031308), c));',
      '}',
      'float hash12(vec2 p){',
      '  vec3 p3 = fract(vec3(p.xyx) * 0.1031);',
      '  p3 += dot(p3, p3.yzx + 33.33);',
      '  return fract((p3.x + p3.y) * p3.z);',
      '}',
  
      'void main(){',
      '  vec2 uv = vUv;',
      '  vec2 d  = uv - 0.5;',
      '  float r2 = dot(d, d);',
      '  vec2 off = d * caAmount * r2;',
  
      '  vec3 sc;',
      '  sc.r = texture2D(tScene, uv + off).r;',
      '  sc.g = texture2D(tScene, uv).g;',
      '  sc.b = texture2D(tScene, uv - off).b;',
  
      '  vec3 bl;',
      '  bl.r = texture2D(tBloom, uv + off*2.4).r;',
      '  bl.g = texture2D(tBloom, uv).g;',
      '  bl.b = texture2D(tBloom, uv - off*2.4).b;',
  
      '  vec3 st = texture2D(tStreak, uv).rgb;',
      '  st = mix(st, vec3(dot(st, vec3(0.2126,0.7152,0.0722))), streakDesat) * streakTint;',
  
      '  vec3 hdr = sc + bl*bloomIntensity + st*streakIntensity;',
      '  hdr *= exposure;',
  
      '  float aspect = resolution.x / max(resolution.y, 1.0);',
      '  float rv = length(d * vec2(aspect, 1.0));',
      '  float vig = smoothstep(vignetteRadius, vignetteRadius - vignetteSoft, rv);',
      '  hdr *= mix(1.0, vig, vignetteAmount);',
  
      '  vec3 c = aces(hdr);',
      '  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));',
      '  c = mix(vec3(l), c, saturation);',
      '  c = toSRGB(clamp(c, 0.0, 1.0));',
      '  c += lift * (1.0 - smoothstep(0.0, 0.25, l));',
  
      '  vec2 gp = floor(gl_FragCoord.xy / max(1.0, grainScale)) * grainScale;',
      '  float n1 = hash12(gp + vec2(time*53.17, time*29.71));',
      '  float n2 = hash12(gp + vec2(time*17.93 + 13.7, time*91.37 + 7.1));',
      '  float g  = n1 + n2 - 1.0;',
      '  float cr = hash12(gp*1.13 + vec2(time*41.3 + 5.1, time*67.9)) - 0.5;',
      '  float cb = hash12(gp*0.87 + vec2(time*73.1, time*23.9 + 19.3)) - 0.5;',
      '  vec3 gv = mix(vec3(g), vec3(g + cr, g, g + cb), grainChroma);',
      '  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));',
      '  float sw = mix(1.0, 1.0 - smoothstep(0.0, 0.85, lum), grainShadow);',
      '  sw *= smoothstep(0.0, 0.014, lum);',
      '  c += gv * grainAmount * sw;',
  
      '  float dn = hash12(gl_FragCoord.xy * 1.7 + 3.71) + hash12(gl_FragCoord.xy * 2.3 + 11.3) - 1.0;',
      '  c += dn * (1.0/255.0);',
  
      '  gl_FragColor = vec4(max(c, vec3(0.0)), 1.0);',
      '}'
    ].join('\n'), {
      tScene: { value: null }, tBloom: { value: null }, tStreak: { value: null },
      resolution: { value: new THREE.Vector2(W, H) },
      exposure: { value: opts.exposure !== undefined ? opts.exposure : 1.0 },
      bloomIntensity: { value: opts.bloomIntensity !== undefined ? opts.bloomIntensity : 0.42 },
      streakIntensity: { value: opts.streakIntensity !== undefined ? opts.streakIntensity : 0.85 },
      streakTint: { value: new THREE.Color(opts.streakTint || 0x9cc0ff) },
      streakDesat: { value: opts.streakDesat !== undefined ? opts.streakDesat : 0.72 },
      caAmount: { value: opts.caAmount !== undefined ? opts.caAmount : 0.0065 },
      grainAmount: { value: opts.grainAmount !== undefined ? opts.grainAmount : 0.028 },
      grainShadow: { value: opts.grainShadow !== undefined ? opts.grainShadow : 0.8 },
      grainChroma: { value: opts.grainChroma !== undefined ? opts.grainChroma : 0.35 },
      grainScale: { value: opts.grainScale !== undefined ? opts.grainScale : 1.0 },
      vignetteAmount: { value: opts.vignetteAmount !== undefined ? opts.vignetteAmount : 0.62 },
      vignetteRadius: { value: opts.vignetteRadius !== undefined ? opts.vignetteRadius : 0.92 },
      vignetteSoft: { value: opts.vignetteSoft !== undefined ? opts.vignetteSoft : 0.78 },
      saturation: { value: opts.saturation !== undefined ? opts.saturation : 1.04 },
      lift: { value: opts.lift !== undefined ? opts.lift : 0.0 },
      time: { value: 0 }
    });
  
    // ---------- render targets --------------------------------------------
    var rtScene = null, rtBright = null, A = [], B = [], sA = null, sB = null;
  
    function allocate(w, h) {
      var pw = Math.max(2, Math.floor(w * PR));
      var ph = Math.max(2, Math.floor(h * PR));
      var maxLv = opts.levels || 6;
      LEVELS = 1;
      while (LEVELS < maxLv && Math.min(pw, ph) / Math.pow(2, LEVELS + 1) >= 4) LEVELS++;
      rtScene = mkSceneRT(pw, ph);
      rtBright = mkRT(pw / 2, ph / 2, false);
      A = []; B = [];
      for (var i = 0; i < LEVELS; i++) {
        var s = Math.pow(2, i + 1);
        A.push(mkRT(pw / s, ph / s, false));
        B.push(mkRT(pw / s, ph / s, false));
      }
      sA = mkRT(pw / 4, ph / 4, false);
      sB = mkRT(pw / 4, ph / 4, false);
      compMat.uniforms.resolution.value.set(pw, ph);
    }
  
    function freeAll() {
      if (rtScene) rtScene.dispose();
      if (rtBright) rtBright.dispose();
      for (var i = 0; i < A.length; i++) { A[i].dispose(); B[i].dispose(); }
      if (sA) sA.dispose();
      if (sB) sB.dispose();
      A = []; B = [];
    }
  
    allocate(W, H);
  
    var _t = 0;
    var streakGate = { value: opts.streakGate !== undefined ? opts.streakGate : 1.6 };
  
    // ---------- public render ---------------------------------------------
    function render(scene, camera, tSec) {
      var prevTarget = renderer.getRenderTarget();
      var prevAutoClear = renderer.autoClear;
      renderer.autoClear = true;
  
      // 0. scene -> HDR
      renderer.setRenderTarget(rtScene);
      renderer.render(scene, camera);
  
      // 1. bright pass (half res, soft knee)
      brightMat.uniforms.tSrc.value = rtScene.texture;
      brightMat.uniforms.texel.value.set(1 / rtScene.width, 1 / rtScene.height);
      blit(brightMat, rtBright);
  
      // 2. level 0 blur
      blurMat.uniforms.tSrc.value = rtBright.texture;
      blurMat.uniforms.dir.value.set(1 / A[0].width, 0);
      blit(blurMat, B[0]);
      blurMat.uniforms.tSrc.value = B[0].texture;
      blurMat.uniforms.dir.value.set(0, 1 / A[0].height);
      blit(blurMat, A[0]);
  
      // 3. progressive downsample + blur
      for (var i = 1; i < LEVELS; i++) {
        downMat.uniforms.tSrc.value = A[i - 1].texture;
        downMat.uniforms.texel.value.set(1 / A[i - 1].width, 1 / A[i - 1].height);
        blit(downMat, A[i]);
  
        blurMat.uniforms.tSrc.value = A[i].texture;
        blurMat.uniforms.dir.value.set(1 / A[i].width, 0);
        blit(blurMat, B[i]);
        blurMat.uniforms.tSrc.value = B[i].texture;
        blurMat.uniforms.dir.value.set(0, 1 / A[i].height);
        blit(blurMat, A[i]);
      }
  
      // 4. tent upsample-combine, coarse -> fine
      var cur = A[LEVELS - 1];
      for (var j = LEVELS - 2; j >= 0; j--) {
        upMat.uniforms.tSmall.value = cur.texture;
        upMat.uniforms.tBig.value = A[j].texture;
        upMat.uniforms.texelSmall.value.set(1 / cur.width, 1 / cur.height);
        blit(upMat, B[j]);
        cur = B[j];
      }
      var bloomTex = cur.texture;
  
      // 5. anamorphic streak: 3 exponential horizontal passes
      streakMat.uniforms.tSrc.value = rtBright.texture;
      streakMat.uniforms.texel.value.set(1 / sA.width, 1 / sA.height);
      streakMat.uniforms.uStep.value = 1.0;
      streakMat.uniforms.gate.value = streakGate.value;
      blit(streakMat, sA);
      streakMat.uniforms.gate.value = 0.0;
      streakMat.uniforms.tSrc.value = sA.texture;
      streakMat.uniforms.uStep.value = 4.0;
      blit(streakMat, sB);
      streakMat.uniforms.tSrc.value = sB.texture;
      streakMat.uniforms.uStep.value = 14.0;
      blit(streakMat, sA);
      // soft vertical falloff: a real anamorphic flare is a lens, not a scanline
      blurMat.uniforms.tSrc.value = sA.texture;
      blurMat.uniforms.dir.value.set(0, 0.5 / sA.height);
      blit(blurMat, sB);
  
      // 6. composite to screen (or to whatever target was bound)
      /* 그레인 시계는 벽시계여야 한다. 프레임당 1/60 을 더하면 15fps 짜리 기계에서
         그레인이 authored 속도의 1/4 로 기어가 '더러운 오버레이'로 읽힌다.
         호출자가 초 단위 t 를 주면 그걸 쓰고, 없으면 성능시계로 떨어진다. */
      _t = (tSec !== undefined) ? tSec : (performance.now() / 1000);
      compMat.uniforms.time.value = _t;
      compMat.uniforms.tScene.value = rtScene.texture;
      compMat.uniforms.tBloom.value = bloomTex;
      compMat.uniforms.tStreak.value = sB.texture;
      blit(compMat, prevTarget);
  
      renderer.setRenderTarget(prevTarget);
      renderer.autoClear = prevAutoClear;
    }
  
    function setSize(w, h) {
      W = Math.max(2, Math.floor(w));
      H = Math.max(2, Math.floor(h));
      PR = renderer.getPixelRatio ? renderer.getPixelRatio() : 1;
      freeAll();
      allocate(W, H);
    }
  
    function dispose() {
      freeAll();
      quadGeo.dispose();
      brightMat.dispose(); downMat.dispose(); blurMat.dispose();
      upMat.dispose(); streakMat.dispose(); compMat.dispose();
    }
  
    var uniforms = {
      // bloom
      threshold: brightMat.uniforms.threshold,
      knee: brightMat.uniforms.knee,
      clampMax: brightMat.uniforms.clampMax,
      bloomIntensity: compMat.uniforms.bloomIntensity,
      bloomRadius: upMat.uniforms.radius,
      mipWeight: upMat.uniforms.weight,
      // streak
      streakIntensity: compMat.uniforms.streakIntensity,
      streakTint: compMat.uniforms.streakTint,
      streakDesat: compMat.uniforms.streakDesat,
      streakDecay: streakMat.uniforms.decay,
      streakGate: streakGate,
      // grade
      exposure: compMat.uniforms.exposure,
      caAmount: compMat.uniforms.caAmount,
      grainAmount: compMat.uniforms.grainAmount,
      grainShadow: compMat.uniforms.grainShadow,
      grainChroma: compMat.uniforms.grainChroma,
      vignetteAmount: compMat.uniforms.vignetteAmount,
      vignetteRadius: compMat.uniforms.vignetteRadius,
      vignetteSoft: compMat.uniforms.vignetteSoft,
      saturation: compMat.uniforms.saturation,
      lift: compMat.uniforms.lift,
      time: compMat.uniforms.time
    };
  
    return {
      render: render,
      setSize: setSize,
      dispose: dispose,
      uniforms: uniforms,
      /* 구형 안드로이드 WebGL1 등에서는 HDR 타깃을 못 잡아 UnsignedByte 로 떨어지고
         장면이 1.0 에서 클리핑된다 — 그러면 threshold 0.92 / streakGate 1.55 가
         아무것도 잡지 못해 블룸과 스트릭이 통째로 사라진다. 호출자가 알아야 한다. */
      hdrType: hdrType,
      isHDR: hdrType !== THREE.UnsignedByteType,
      get sceneTarget() { return rtScene; }
    };
  }
  
