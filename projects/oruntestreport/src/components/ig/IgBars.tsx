import React from 'react';

export interface BarRow {
  label: string;
  /** 0~100 */
  value: number;
  color: string;
  /** 오른쪽 끝에 붙일 표기. 없으면 값에 % 를 붙인다. */
  readout?: string;
}

/**
 * 가로 막대 줄.
 *
 * 레퍼런스처럼 라벨을 막대 위가 아니라 왼쪽에 두고, 값은 오른쪽 끝에
 * 붙인다. 눈이 왼쪽 라벨 → 막대 길이 → 오른쪽 숫자 순으로 한 줄에
 * 세 번 읽힌다. 막대는 채우기만 하고 테두리나 그림자를 두지 않는다.
 */
const IgBars: React.FC<{
  rows: BarRow[];
  /** 가장 긴 막대를 100% 로 볼지, 값 자체를 % 로 볼지 */
  scale?: 'absolute' | 'max';
  className?: string;
}> = ({ rows, scale = 'absolute', className = '' }) => {
  const max = scale === 'max' ? Math.max(1, ...rows.map((r) => r.value)) : 100;

  return (
    <div className={`space-y-2.5 ${className}`}>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="ig-leg-l w-[84px] md:w-[104px] flex-none">{r.label}</span>
          <div className="ig-bar flex-1">
            <i style={{ width: `${Math.max(0, Math.min(100, (r.value / max) * 100))}%`, background: r.color }} />
          </div>
          <span className="ig-leg-n text-right" style={{ minWidth: 52 }}>
            {r.readout ?? `${Math.round(r.value)}%`}
          </span>
        </div>
      ))}
    </div>
  );
};

export default IgBars;
