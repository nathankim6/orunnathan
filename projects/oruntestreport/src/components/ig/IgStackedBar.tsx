import React from 'react';

export interface StackSegment {
  key: string;
  value: number;
  /** 팔레트 토큰 이름, 예: '--ig-coral' */
  tone: string;
  /** 조각 안 글자 */
  label?: string;
  /** 0~1 — 순위 농도 같은 용도 */
  alpha?: number;
}

/**
 * 누적 막대 한 줄.
 *
 * 레퍼런스 "Option 01/02/03" 가로 누적 막대의 어법이다. 왼쪽에 대문자 영문과
 * 한글 라벨, 막대, 오른쪽 끝에 값. 조각 안 글자는 조각이 충분히 넓을 때만
 * 넣는다(좁은 조각에 글자를 욱여넣으면 캡처에서 잘린 글자가 남는다).
 * 값 0 조각은 그리지 않는다.
 */
const IgStackedBar: React.FC<{
  segments: StackSegment[];
  /** 없으면 조각 합 */
  total?: number;
  height?: number;
  label?: string;
  labelEn?: string;
  readout?: string;
  /** 조각 안 값(숫자) 표시 */
  showValues?: boolean;
  /** 조각 안 글자를 넣을 최소 폭(px) — 막대 폭 추정치 기준 */
  minLabelPx?: number;
  /** 막대의 대략 실제 폭(px) — 라벨 표시 판단에만 쓴다 */
  approxWidth?: number;
  className?: string;
}> = ({
  segments, total, height = 15, label, labelEn, readout,
  showValues = false, minLabelPx = 26, approxWidth = 420, className = '',
}) => {
  const live = segments.filter((s) => (s.value || 0) > 0);
  const sum = live.reduce((s, x) => s + x.value, 0);
  const denom = total && total > 0 ? total : sum || 1;

  return (
    <div className={className}>
      {(label || labelEn || readout) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="flex items-baseline gap-2 min-w-0">
            {labelEn && <span className="ig-col-l" style={{ marginTop: 0 }}>{labelEn}</span>}
            {label && <span className="text-[12px] font-bold text-[hsl(var(--ink))]" style={{ wordBreak: 'keep-all' }}>{label}</span>}
          </span>
          {readout && <span className="ig-leg-n text-right" style={{ minWidth: 0 }}>{readout}</span>}
        </div>
      )}
      <div className="flex w-full overflow-hidden ig-print-color" style={{ height, background: 'hsl(var(--ink) / 0.06)' }}>
        {live.map((s) => {
          const frac = s.value / denom;
          const px = frac * approxWidth;
          const text = s.label ?? (showValues ? String(s.value) : undefined);
          return (
            <div
              key={s.key}
              title={`${s.label ?? s.key} ${s.value}`}
              className="flex items-center justify-center overflow-hidden"
              style={{
                width: `${Math.max(0, Math.min(100, frac * 100))}%`,
                background: `hsl(var(${s.tone}) / ${s.alpha ?? 1})`,
                flex: 'none',
              }}
            >
              {text && px >= minLabelPx && (
                <span className="ig-condensed whitespace-nowrap text-[10px] font-semibold leading-none text-[hsl(var(--paper))]">
                  {text}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IgStackedBar;
