import React, { useEffect, useRef } from 'react';
import type { BackdropHandle } from '@/scene/cinematicBackdrop';

/**
 * 리포트 뒤에 까는 시네마틱 배경.
 *
 * 화면에서만 보이고 PDF·인쇄에는 들어가지 않는다(capture-hide). 리포트는
 * 흰 종이로 남아야 학부모님이 인쇄해서 보실 수 있다. 배경은 화면으로 볼 때의
 * 인상만 담당한다.
 */
const CinematicBackdrop: React.FC<{ accent?: string }> = ({ accent }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<BackdropHandle | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let handle: BackdropHandle | null = null;
    let cancelled = false;

    // three.js 는 이 화면에서만 쓰므로 여기서 내려받는다.
    // 다른 화면을 여는 사람은 그 무게를 지지 않는다.
    void import('@/scene/cinematicBackdrop').then(({ createCinematicBackdrop }) => {
      if (cancelled) return;
      handle = createCinematicBackdrop(canvas, { accent });
      handleRef.current = handle;
    });

    const onMove = (e: PointerEvent) => {
      handle?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    const onScroll = () => {
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
      handle?.setScroll(window.scrollY / max);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      cancelled = true;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      handle?.dispose();
      handleRef.current = null;
    };
  }, [accent]);

  return (
    <div className="cinema-backdrop capture-hide print:hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="cinema-backdrop-canvas" />
      {/* 가운데를 눌러 두는 비네트 — 리포트가 놓이는 자리를 어둡게 해 글이 뜬다 */}
      <div className="cinema-backdrop-vignette" />
    </div>
  );
};

export default CinematicBackdrop;
