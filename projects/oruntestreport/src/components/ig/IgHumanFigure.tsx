import React, { useId } from 'react';

/**
 * 사람 픽토그램 — 몸이 값만큼 아래에서 위로 찬다.
 *
 * 레퍼런스 "HUMAN ALWAYS / INFOGRAPHICS USEFUL" 의 32% / 68% 사람이다. 회색
 * 실루엣 위에 같은 실루엣을 clipPath 로 값만큼만 색칠한다. 오른쪽 세로 괄호가
 * 찬 높이를 가리킨다. clipPath id 는 useId 로 — 한 페이지에 둘 이상 놓인다.
 */
const IgHumanFigure: React.FC<{
  /** 0~100 */
  pct: number;
  /** 팔레트 토큰 이름 */
  tone: string;
  height?: number;
  className?: string;
}> = ({ pct, tone, height = 132, className = '' }) => {
  const id = useId().replace(/:/g, '');
  const v = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
  const H = 150;
  const y0 = H - (v / 100) * H;
  const body = (fill: string) => (
    <g fill={fill}>
      <circle cx="30" cy="15" r="13" />
      <path d="M12 34 Q12 30 16 30 H44 Q48 30 48 34 V84 H40 V146 Q40 149 37 149 H33 Q31 149 31 146 V96 H29 V146 Q29 149 27 149 H23 Q20 149 20 146 V84 H12 Z" />
    </g>
  );
  return (
    <svg
      viewBox={`0 0 66 ${H}`}
      width={Math.round((66 / H) * height)}
      height={height}
      style={{ width: Math.round((66 / H) * height), height, display: 'block', flex: 'none' }}
      role="img"
      aria-label={`${Math.round(v)}%`}
      className={className}
    >
      <defs>
        <clipPath id={`hf-${id}`}>
          <rect x="0" y={y0} width="60" height={H - y0} />
        </clipPath>
      </defs>
      {body('hsl(var(--ink) / 0.14)')}
      <g clipPath={`url(#hf-${id})`}>{body(`hsl(var(${tone}))`)}</g>
      {/* 찬 높이 괄호 */}
      {v > 0 && (
        <g stroke={`hsl(var(${tone}))`} strokeWidth="1.5" fill="none">
          <path d={`M58 ${y0.toFixed(1)} h4 V${H - 1} h-4`} />
          <path d={`M62 ${((y0 + H) / 2).toFixed(1)} h3`} />
        </g>
      )}
    </svg>
  );
};

export default IgHumanFigure;
