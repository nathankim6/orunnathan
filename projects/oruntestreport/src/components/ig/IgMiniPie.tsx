import React from 'react';

/**
 * 범례용 작은 파이.
 *
 * 레퍼런스 범례의 "15% TABLETS" 앞에 붙은 조그만 파이다. 회색 원 위에 값만큼
 * 색 부채꼴이 찬다. 점 대신 쓰면 숫자를 읽기 전에 크기가 먼저 보인다.
 */
const IgMiniPie: React.FC<{ fraction: number; color: string; size?: number; className?: string }> = ({
  fraction, color, size = 16, className = '',
}) => {
  const f = Math.max(0, Math.min(1, Number.isFinite(fraction) ? fraction : 0));
  const a = f * 2 * Math.PI;
  const x = 50 + 48 * Math.sin(a);
  const y = 50 - 48 * Math.cos(a);
  const large = f > 0.5 ? 1 : 0;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ width: size, height: size, display: 'block', flex: 'none' }} aria-hidden="true" className={className}>
      <circle cx="50" cy="50" r="48" fill="hsl(var(--ink) / 0.12)" />
      {f >= 0.999 ? (
        <circle cx="50" cy="50" r="48" fill={color} />
      ) : f > 0 ? (
        <path d={`M50,50 L50,2 A48,48 0 ${large} 1 ${x.toFixed(2)},${y.toFixed(2)} Z`} fill={color} />
      ) : null}
    </svg>
  );
};

export default IgMiniPie;
