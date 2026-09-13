import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { UniverseSceneHandle, UniverseVariant } from '@/scene/universeScene';
import { isUniversePaused, prefersReducedMotion, subscribeUniverseMotion } from './motion';

export type LetterboxMode = 'hold' | 'intro' | 'none';

interface UniverseStageProps {
  /** cinema: 랜딩·목록·작성 화면. subtle: 학생 채점(모바일) 화면 */
  variant?: UniverseVariant;
  /** hold: 스크롤 전까지 레터박스 유지. intro: 첫 1.3초만. none: 없음 */
  letterbox?: LetterboxMode;
}

/**
 * WebGL 이 뜨기 전(또는 없을 때) 보이는 정적 별밭 — 640px 타일 SVG.
 * 시드 고정이라 새로고침해도 같은 하늘이다.
 */
function makeStarTile(seed = 20260913): string {
  let s = seed >>> 0;
  const rnd = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
  const parts: string[] = [];
  for (let i = 0; i < 170; i++) {
    const x = (rnd() * 640).toFixed(1);
    const y = (rnd() * 640).toFixed(1);
    const bright = rnd();
    const r = bright > 0.96 ? 1.6 : bright > 0.8 ? 1.05 : 0.65;
    const a = (0.25 + bright * 0.7).toFixed(2);
    const warm = rnd() > 0.82;
    const fill = warm ? 'rgb(255,222,170)' : bright > 0.9 ? 'rgb(214,230,255)' : 'rgb(236,242,250)';
    parts.push(`<circle cx='${x}' cy='${y}' r='${r}' fill='${fill}' opacity='${a}'/>`);
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='640'>${parts.join('')}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

/**
 * 앱 전체(리포트 제외)에 깔리는 은하 무대.
 *
 * - position: fixed · pointer-events: none — 클릭을 가리지 않는다.
 * - capture-hide / print:hidden / data-capture-hide — PDF·인쇄·이미지 캡처에서 빠진다.
 *   (리포트 라우트에서는 아예 마운트되지 않고, .report-container 밖에 있다.)
 * - three.js 는 동적 import — 리포트 라우트는 비용을 내지 않는다.
 * - prefers-reduced-motion 이면 장면은 한 프레임만 그리고 멈춘다.
 */
const UniverseStage: React.FC<UniverseStageProps> = ({ variant = 'cinema', letterbox = 'intro' }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<UniverseSceneHandle | null>(null);
  const variantRef = useRef<UniverseVariant>(variant);
  variantRef.current = variant;
  const starTile = useMemo(() => makeStarTile(), []);

  /* 문서 플래그 — 우주 모드 on/off (리포트 라우트로 가면 정리된다) */
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.classList.add('u-universe');
    return () => {
      html.classList.remove('u-universe', 'u-scrolled', 'u-intro-done');
      html.removeAttribute('data-letterbox');
      html.style.removeProperty('--u-mx');
      html.style.removeProperty('--u-my');
    };
  }, []);

  /* 레터박스 모드 */
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.dataset.letterbox = letterbox;
    html.classList.remove('u-intro-done');
    if (letterbox !== 'intro') return;
    const timer = window.setTimeout(() => html.classList.add('u-intro-done'), 1300);
    return () => window.clearTimeout(timer);
  }, [letterbox]);

  /* 스크롤 플래그 + 포인터 시차(CSS 변수) */
  useEffect(() => {
    const html = document.documentElement;
    const onScroll = () => html.classList.toggle('u-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    let raf = 0;
    let nx = 0;
    let ny = 0;
    const flush = () => {
      raf = 0;
      html.style.setProperty('--u-mx', nx.toFixed(3));
      html.style.setProperty('--u-my', ny.toFixed(3));
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || prefersReducedMotion() || isUniversePaused()) return;
      nx = Math.max(-0.5, Math.min(0.5, e.clientX / window.innerWidth - 0.5));
      ny = Math.max(-0.5, Math.min(0.5, e.clientY / window.innerHeight - 0.5));
      if (!raf) raf = requestAnimationFrame(flush);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* three.js 장면 — 지연 로드 */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    import('@/scene/universeScene')
      .then(({ mountUniverseScene }) => {
        if (cancelled) return;
        const handle = mountUniverseScene(canvas, {
          variant: variantRef.current,
          onReady: () => rootRef.current?.setAttribute('data-ready', ''),
        });
        if (!handle) return;
        handleRef.current = handle;
        handle.setPaused(isUniversePaused());
      })
      .catch(() => {
        /* WebGL 불가 — 정적 별밭이 남는다 */
      });

    const unsubscribe = subscribeUniverseMotion((paused) => handleRef.current?.setPaused(paused));
    return () => {
      cancelled = true;
      unsubscribe();
      handleRef.current?.dispose();
      handleRef.current = null;
      rootRef.current?.removeAttribute('data-ready');
    };
  }, []);

  useEffect(() => {
    handleRef.current?.setVariant(variant);
  }, [variant]);

  return (
    <>
      <div
        ref={rootRef}
        className="u-stage capture-hide print:hidden"
        data-variant={variant}
        data-capture-hide
        aria-hidden="true"
      >
        <div className="u-stage-fallback" style={{ '--u-startile': starTile } as React.CSSProperties} />
        <canvas ref={canvasRef} className="u-stage-canvas" />
        <div className="u-vignette" />
        <div className="u-grain" />
      </div>
      <div className="u-letterbox u-letterbox--top capture-hide print:hidden" data-capture-hide aria-hidden="true" />
      <div className="u-letterbox u-letterbox--bottom capture-hide print:hidden" data-capture-hide aria-hidden="true" />
    </>
  );
};

export default UniverseStage;
