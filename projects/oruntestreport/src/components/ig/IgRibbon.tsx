import React from 'react';

/**
 * 세로 리본(북마크) 위의 백분율.
 *
 * 레퍼런스 "OPTION ELEMENTS / ICONS & BARS" 의 73% / 84% / 68% 리본이다. 위에 숫자를
 * 크게, 그 아래 색 리본이 값만큼 길게 내려오고 끝이 제비꼬리로 파인다. 리본 안에는
 * 라벨을 세로로 쌓지 않고, 리본 아래에 대문자 라벨을 둔다.
 *
 * clip-path 로 제비꼬리를 만든다. html-to-image 는 clip-path 를 그대로 옮긴다.
 */
const IgRibbon: React.FC<{
  /** 0~100 */
  value: number;
  label: string;
  tone?: string;
  /** 리본 폭 (px) */
  width?: number;
  /** 값 100 일 때 리본 길이 (px) */
  maxHeight?: number;
  /** 리본 안에 넣을 작은 글 (예: "2문항") */
  inner?: string;
  className?: string;
}> = ({ value, label, tone = '--ig-coral', width = 64, maxHeight = 150, inner, className = '' }) => {
  const v = Math.max(0, Math.min(100, value));
  const h = Math.max(34, Math.round((v / 100) * maxHeight));
  return (
    <div className={`flex flex-col items-center ${className}`} style={{ width }}>
      <span className="ig-stat-n ig-stat-n-sm" style={{ color: `hsl(var(${tone}))` }}>
        {Math.round(v)}%
      </span>
      <div
        className="mt-2 flex items-start justify-center pt-2"
        style={{
          width: width - 14,
          height: h,
          background: `hsl(var(${tone}))`,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 10px), 0 100%)',
        }}
      >
        {inner && (
          <span className="ig-condensed text-[11px] font-semibold tracking-[0.08em] text-[hsl(var(--paper))]">
            {inner}
          </span>
        )}
      </div>
      <span className="ig-col-l mt-3 text-center" style={{ marginTop: 10 }}>{label}</span>
    </div>
  );
};

export default IgRibbon;
