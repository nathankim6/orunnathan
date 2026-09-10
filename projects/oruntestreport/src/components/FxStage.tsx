import React, { useEffect, useMemo, useRef } from 'react';
import type { FxKind, FxOptions } from '@/scene/reportFx';

/**
 * 섹션마다 하나씩 놓는 3차원 효과 자리.
 *
 * 왜 어두운 판 위에 얹나
 * ----------------------
 * 효과는 빛을 더하는 방식(가산 혼합)으로 그린다. 흰 카드 위에 빛을 더하면
 * 그대로 흰색이라 아무것도 안 보인다. 어두운 판을 깔아야 빛이 보인다.
 * 흰 종이에 필름 한 컷이 끼워진 모양이 되는데, 난도 능선과 같은 결이다.
 *
 * 화면에서만 보이고 인쇄·PDF 에는 들어가지 않는다.
 */
const FxStage: React.FC<{
  kind: FxKind;
  options?: FxOptions;
  /** 판 높이 — 얇은 띠는 44, 보통은 120 안팎 */
  height?: number;
  /** 왼쪽에 작게 얹는 설명 */
  label?: string;
  /** 오른쪽에 작게 얹는 값 */
  readout?: string;
  className?: string;
}> = ({ kind, options, height = 64, label, readout, className = '' }) => {
  const slotRef = useRef<HTMLDivElement>(null);
  // 옵션 객체는 렌더마다 새로 만들어지므로 내용으로 비교한다.
  const key = useMemo(() => JSON.stringify(options ?? {}), [options]);

  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;
    let off: (() => void) | null = null;
    let cancelled = false;

    // three.js 는 리포트 화면에서만 내려받는다.
    void import('@/scene/reportFx').then(({ registerFx }) => {
      if (cancelled || !slotRef.current) return;
      off = registerFx(slotRef.current, kind, options ?? {});
    });

    return () => {
      cancelled = true;
      off?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, key]);

  return (
    <div
      className={`fx-stage capture-hide print:hidden ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      <div ref={slotRef} className="fx-stage-slot" />
      {label && <span className="fx-stage-label">{label}</span>}
      {readout && <span className="fx-stage-readout">{readout}</span>}
    </div>
  );
};

export default FxStage;
