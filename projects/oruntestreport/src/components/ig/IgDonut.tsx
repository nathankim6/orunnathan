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
 * 입체도 그림자도 쓰지 않는다. 굵은 고리를 조각으로 나누고 조각 사이를 조금
 * 띄운다. 가운데에는 작은 설명과 큰 숫자 하나만 둔다. 값은 범례에서 점·숫자·
 * 라벨 순으로 읽는다. 값 0 인 조각은 그리지 않는다(빈 요소가 캡처에서 1px
 * 선으로 남는다).
 *
 * `iso` 는 같은 고리를 아래로 조금 밀어 진하게 한 번 더 그려 두께를 낸다.
 * 여기까지만 허용한다. 타원으로 눕히거나 압출하면 조각 비율이 왜곡된다.
 *
 * SVG 에 width·height 를 함께 준다. viewBox 만 있으면 캡처에서 부풀어 나온다.
 */
const IgDonut: React.FC<{
  segments: DonutSegment[];
  centerCap?: string;
  centerValue?: string | number;
  /** 고리 굵기 (지름 100 기준) */
  thickness?: number;
  /** 조각 사이 틈 */
  gap?: number;
  iso?: boolean;
  /** 도넛 지름 (px) — 폭에 따라 흔들리지 않게 px 로 고정 */
  size?: number;
  legend?: 'right' | 'below';
  /** 범례 셋째 칸 — 예: seg => `${seg.value}문항` */
  countLabel?: (seg: DonutSegment) => string;
  className?: string;
}> = ({
  segments, centerCap, centerValue, thickness = 15, gap = 1.1, iso = false,
  size = 150, legend = 'right', countLabel, className = '',
}) => {
  const live = segments.filter((s) => (s.value || 0) > 0);
  const total = live.reduce((s, x) => s + x.value, 0) || 1;
  const R = 50 - thickness / 2;
  const C = 2 * Math.PI * R;

  let acc = 0;
  const arcs = live.map((seg) => {
    const frac = seg.value / total;
    const len = Math.max(0, frac * C - (live.length > 1 ? gap : 0));
    const arc = { ...seg, len, offset: -acc * C, rest: C - len };
    acc += frac;
    return arc;
  });
  const H = iso ? 106 : 100;

  const ring = (
    <div className="relative flex-none" style={{ width: size }}>
      <svg
        viewBox={`0 0 100 ${H}`}
        width="100"
        height={H}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-hidden="true"
      >
        {iso && (
          <g transform="translate(0 4)">
            {arcs.map((a, i) => (
              <circle key={`iso-${i}`} cx="50" cy="50" r={R} fill="none"
                      stroke={a.color} strokeWidth={thickness}
                      strokeDasharray={`${a.len} ${a.rest}`} strokeDashoffset={a.offset}
                      transform="rotate(-90 50 50)" />
            ))}
            {arcs.map((a, i) => (
              <circle key={`iso-shade-${i}`} cx="50" cy="50" r={R} fill="none"
                      stroke="hsl(var(--ink) / 0.32)" strokeWidth={thickness}
                      strokeDasharray={`${a.len} ${a.rest}`} strokeDashoffset={a.offset}
                      transform="rotate(-90 50 50)" />
            ))}
          </g>
        )}
        <circle cx="50" cy="50" r={R} fill="none" stroke="hsl(var(--ink) / 0.06)" strokeWidth={thickness} />
        {arcs.map((a, i) => (
          <circle key={i} cx="50" cy="50" r={R} fill="none"
                  stroke={a.color} strokeWidth={thickness}
                  strokeDasharray={`${a.len} ${a.rest}`} strokeDashoffset={a.offset}
                  transform="rotate(-90 50 50)" />
        ))}
      </svg>
      {(centerCap || centerValue !== undefined) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: iso ? 6 : 0 }}>
          {centerCap && <span className="ig-stat-c" style={{ marginTop: 0 }}>{centerCap}</span>}
          {centerValue !== undefined && (
            <span className="ig-stat-n ig-stat-n-sm" style={{ marginTop: 4 }}>{centerValue}</span>
          )}
        </div>
      )}
    </div>
  );

  const list = (
    <ul className={`min-w-0 ${legend === 'below' ? 'mt-4 w-full' : 'flex-1'} space-y-2.5`}>
      {live.map((seg, i) => (
        <li key={i} className="ig-leg">
          <span className="ig-leg-dot" style={{ background: seg.color }} />
          <span className="ig-leg-n">{Math.round((seg.value / total) * 100)}%</span>
          <span className="ig-leg-l">{seg.label}</span>
          {countLabel && (
            <span className="ig-condensed text-[12px] font-semibold text-[hsl(var(--ink-soft))] ml-auto whitespace-nowrap">
              {countLabel(seg)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );

  return legend === 'below' ? (
    <div className={`flex flex-col items-center ${className}`}>
      {ring}
      {list}
    </div>
  ) : (
    <div className={`flex items-center gap-5 md:gap-7 print:gap-7 ${className}`}>
      {ring}
      {list}
    </div>
  );
};

export default IgDonut;
