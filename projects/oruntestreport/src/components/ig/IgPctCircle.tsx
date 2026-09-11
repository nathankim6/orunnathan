import React from 'react';

/**
 * 큰 색 원 안의 백분율.
 *
 * 레퍼런스 "THREE OPTIONS" 의 80% / 65% / 50% 원이다. 색을 가득 채운 원 안에
 * 숫자를 크게 두고, 테두리를 따라 흰 호가 값만큼 돈다. 페이지에 하나만 쓴다.
 * 같은 숫자를 두 자리에 두지 않는다.
 *
 * SVG 에 width·height 를 함께 주고 폭은 CSS 로만 제한한다.
 */
const IgPctCircle: React.FC<{
  /** 0~100 */
  value: number;
  label: string;
  /** 팔레트 토큰 이름 */
  tone?: string;
  /** 지름 (px) */
  size?: number;
  /** 라벨 아래 작은 설명 */
  caption?: string;
  className?: string;
}> = ({ value, label, tone = '--ig-coral', size = 96, caption, className = '' }) => {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const R = 44;
  const C = 2 * Math.PI * R;
  const len = (v / 100) * C;

  return (
    <div className={`flex flex-col items-center text-center ${className}`} style={{ width: '100%', maxWidth: size + 40 }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', maxWidth: size, height: 'auto', display: 'block' }}
        role="img"
        aria-label={`${label} ${v}%`}
      >
        <circle cx="50" cy="50" r="48" fill={`hsl(var(${tone}))`} />
        <circle cx="50" cy="50" r={R} fill="none" stroke="hsl(var(--paper) / 0.28)" strokeWidth="3" />
        {v > 0 && (
          <circle cx="50" cy="50" r={R} fill="none" stroke="hsl(var(--paper))" strokeWidth="3"
                  strokeDasharray={`${len} ${C - len}`} transform="rotate(-90 50 50)" />
        )}
        <text x="50" y="50" dy="0.35em" textAnchor="middle"
              fontFamily="Oswald, 'Noto Sans KR', sans-serif" fontWeight="700"
              fontSize="30" fill="hsl(var(--paper))" letterSpacing="-0.02em">
          {v}
          <tspan fontSize="14" dy="-10" dx="1">%</tspan>
        </text>
      </svg>
      <span className="ig-col-l" style={{ marginTop: 12, color: 'hsl(var(--ink))' }}>{label}</span>
      {caption && <span className="ig-stat-c" style={{ marginTop: 4, whiteSpace: 'normal' }}>{caption}</span>}
    </div>
  );
};

export default IgPctCircle;
