import React from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  /** css 색 문자열 */
  color: string;
}

/**
 * 납작한 도넛.
 *
 * 입체도 그림자도 쓰지 않는다. 굵은 고리를 조각으로 나누고 조각 사이를
 * 조금 띄운다. 가운데에는 작은 설명과 큰 숫자 하나만 둔다. 나머지 값은
 * 오른쪽 범례에서 점·숫자·라벨 순으로 읽는다.
 *
 * 조각은 stroke-dasharray 로 그린다. 원 둘레를 100 으로 잡아 두면 값이
 * 곧 길이가 되어, 계산이 눈에 보이는 그대로가 된다.
 */
const IgDonut: React.FC<{
  segments: DonutSegment[];
  centerCap?: string;
  centerValue?: string;
  /** 고리 굵기 (지름 100 기준) */
  thickness?: number;
  /** 조각 사이 틈 */
  gap?: number;
  /**
   * 아이소메트릭 흉내. 같은 고리를 아래로 조금 밀어 진하게 한 번 더 그려 두께를
   * 만든다. 레퍼런스 "ISOMETRIC VIEWS" 의 납작한 원반이다. WebGL 이 아니다.
   */
  iso?: boolean;
  className?: string;
}> = ({ segments, centerCap, centerValue, thickness = 13, gap = 1.1, iso = false, className = '' }) => {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
  const R = 50 - thickness / 2;
  const C = 2 * Math.PI * R;

  let acc = 0;
  const arcs = segments.map((seg) => {
    const frac = (seg.value || 0) / total;
    const len = Math.max(0, frac * C - gap);
    const arc = { ...seg, len, offset: -acc * C, rest: C - len };
    acc += frac;
    return arc;
  });

  return (
    <div className={`flex items-center gap-5 md:gap-7 ${className}`}>
      <div className="relative flex-none" style={{ width: 'clamp(132px, 22vw, 186px)' }}>
        <svg viewBox={iso ? '0 0 100 106' : '0 0 100 100'} width="100" height={iso ? 106 : 100}
             preserveAspectRatio="xMidYMid meet"
             style={{ width: '100%', height: 'auto', display: 'block' }}
             role="img" aria-hidden="true">
          {iso && (
            <g transform="translate(0 5)">
              {arcs.map((a, i) => (
                <circle
                  key={`iso-${i}`}
                  cx="50" cy="50" r={R} fill="none"
                  stroke={a.color} strokeWidth={thickness}
                  strokeDasharray={`${a.len} ${a.rest}`} strokeDashoffset={a.offset}
                  transform="rotate(-90 50 50)"
                />
              ))}
              {/* 옆면을 어둡게 — 같은 호 위에 반투명 먹을 한 겹 */}
              {arcs.map((a, i) => (
                <circle
                  key={`iso-shade-${i}`}
                  cx="50" cy="50" r={R} fill="none"
                  stroke="hsl(var(--ink) / 0.32)" strokeWidth={thickness}
                  strokeDasharray={`${a.len} ${a.rest}`} strokeDashoffset={a.offset}
                  transform="rotate(-90 50 50)"
                />
              ))}
            </g>
          )}
          <circle cx="50" cy="50" r={R} fill="none" stroke="hsl(var(--ink) / 0.06)" strokeWidth={thickness} />
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={a.color}
              strokeWidth={thickness}
              strokeDasharray={`${a.len} ${a.rest}`}
              strokeDashoffset={a.offset}
              transform="rotate(-90 50 50)"
            />
          ))}
        </svg>
        {(centerCap || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerCap && <span className="ig-stat-c" style={{ marginTop: 0 }}>{centerCap}</span>}
            {centerValue && (
              <span className="ig-stat-n ig-stat-n-sm" style={{ marginTop: 4 }}>
                {centerValue}
              </span>
            )}
          </div>
        )}
      </div>

      <ul className="min-w-0 flex-1 space-y-2.5">
        {segments.map((seg, i) => (
          <li key={i} className="ig-leg">
            <span className="ig-leg-dot" style={{ background: seg.color }} />
            <span className="ig-leg-n">{Math.round(((seg.value || 0) / total) * 100)}%</span>
            <span className="ig-leg-l">{seg.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IgDonut;
