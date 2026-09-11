import React from 'react';

/**
 * 큰 색 원 안의 백분율.
 *
 * 레퍼런스 "THREE OPTIONS" 의 80% / 65% / 50% 원이다. 색을 가득 채운 원 안에
 * 숫자를 크게 두고, 테두리를 따라 흰 호가 값만큼 돈다. 그래서 숫자를 못 읽어도
 * 호의 길이로 크기를 가늠할 수 있다. 원 아래에는 대문자 라벨 한 줄.
 *
 * SVG 에 width·height 를 함께 준다. viewBox 만 있으면 캡처에서 부풀어 나온다.
 */
const IgPctCircle: React.FC<{
  /** 0~100 */
  value: number;
  label: string;
  /** 팔레트 토큰 이름, 예: '--ig-coral' */
  tone?: string;
  /** 지름 (px) */
  size?: number;
  /** 라벨 아래 작은 설명 */
  caption?: string;
  className?: string;
}> = ({ value, label, tone = '--ig-coral', size = 104, caption, className = '' }) => {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const R = 44;
  const C = 2 * Math.PI * R;
  const len = (v / 100) * C;

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: size, height: size, display: 'block' }}
        role="img"
        aria-label={`${label} ${v}%`}
      >
        <circle cx="50" cy="50" r="48" fill={`hsl(var(${tone}))`} />
        {/* 테두리 호 — 값만큼만 흰색 */}
        <circle cx="50" cy="50" r={R} fill="none" stroke="hsl(0 0% 100% / 0.28)" strokeWidth="3" />
        <circle
          cx="50" cy="50" r={R} fill="none"
          stroke="hsl(0 0% 100%)" strokeWidth="3"
          strokeDasharray={`${len} ${C - len}`}
          strokeLinecap="butt"
          transform="rotate(-90 50 50)"
        />
        <text
          x="50" y="50" textAnchor="middle" dominantBaseline="central"
          fontFamily="'Oswald', 'Noto Sans KR', sans-serif" fontWeight="700"
          fontSize="30" fill="hsl(0 0% 100%)" letterSpacing="-0.02em"
        >
          {v}
          <tspan fontSize="14" dy="-10" dx="1">%</tspan>
        </text>
      </svg>
      <span className="ig-col-l mt-3" style={{ marginTop: 12 }}>{label}</span>
      {caption && <span className="ig-stat-c" style={{ marginTop: 4, whiteSpace: 'normal' }}>{caption}</span>}
    </div>
  );
};

export default IgPctCircle;
