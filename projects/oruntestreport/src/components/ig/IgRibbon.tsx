import React from 'react';

/**
 * 세로 리본(북마크) 위의 백분율.
 *
 * 레퍼런스 "OPTION ELEMENTS / ICONS & BARS" 의 73% / 84% / 68% 리본이다.
 * 위에 % 를 크게(리본 밖 — 흑백 인쇄에서도 읽히게), 그 아래 색 리본이 값만큼
 * 길게 내려오고 끝이 제비꼬리로 파인다. 리본 아래 라벨 y 는 최대 높이 기준으로
 * 고정해, 리본 네 개의 라벨 줄이 맞고 모듈 높이가 예측된다.
 *
 * 한 리본 = SVG 한 장. clip-path 대신 polygon 이라 캡처·인쇄에서 그대로 찍힌다.
 */
const IgRibbon: React.FC<{
  /** 0~100 */
  value: number;
  count?: number;
  /** 쉬움 */
  label: string;
  /** EASY */
  labelEn?: string;
  /** 팔레트 토큰 이름 */
  tone: string;
  /** 값 100 일 때 리본 길이(뷰박스 단위) */
  maxHeight?: number;
  className?: string;
}> = ({ value, count, label, labelEn, tone, maxHeight = 120, className = '' }) => {
  const v = Math.max(0, Math.min(100, value));
  const h = Math.max(30, Math.round((v / 100) * maxHeight));
  const top = 32;
  const W = 64;
  const H = top + maxHeight + 40;
  const x0 = 10, x1 = 54, mid = 32;
  const points = `${x0},${top} ${x1},${top} ${x1},${top + h} ${mid},${top + h - 10} ${x0},${top + h}`;
  const inner = count !== undefined ? `${count}문항` : undefined;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: 'auto', display: 'block' }}
      className={className}
      role="img"
      aria-label={`${label} ${Math.round(v)}%${inner ? ` ${inner}` : ''}`}
    >
      <text x={mid} y={22} textAnchor="middle" fontFamily="Oswald, 'Noto Sans KR', sans-serif"
            fontWeight="700" fontSize="22" fill="hsl(var(--ink))">
        {Math.round(v)}%
      </text>
      <polygon points={points} fill={`hsl(var(${tone}))`} />
      {inner && h >= 30 && (
        <text x={mid} y={top + 16} textAnchor="middle" fontFamily="Oswald, 'Noto Sans KR', sans-serif"
              fontWeight="500" fontSize="10.5" fill="hsl(var(--paper))">
          {inner}
        </text>
      )}
      {labelEn && (
        <text x={mid} y={top + maxHeight + 18} textAnchor="middle" fontFamily="Oswald, 'Noto Sans KR', sans-serif"
              fontWeight="600" fontSize="10" letterSpacing="0.1em" fill="hsl(var(--ink) / 0.55)">
          {labelEn}
        </text>
      )}
      <text x={mid} y={top + maxHeight + 32} textAnchor="middle" fontFamily="'Noto Sans KR', sans-serif"
            fontWeight="700" fontSize="11" fill="hsl(var(--ink))">
        {label}
      </text>
    </svg>
  );
};

export default IgRibbon;
