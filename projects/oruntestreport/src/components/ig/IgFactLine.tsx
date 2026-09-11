import React from 'react';

/**
 * 팩트 라인 — 가로선 위에 점 여러 개.
 *
 * 레퍼런스 "LINE GRAPH / FACT LINE" 의 어법이다. 점 크기가 값이고, 위에 이름,
 * 아래에 값. 가로선은 실제 div 로 긋는다(가상 요소는 캡처에서 빠진다).
 * 항목이 둘 미만이면 그리지 않는다.
 */
const IgFactLine: React.FC<{
  items: { top: string; bottom: string; value: number; tone?: string }[];
  className?: string;
}> = ({ items, className = '' }) => {
  const list = (items || []).filter((it) => Number.isFinite(it.value));
  if (list.length < 2) return null;
  const max = Math.max(1, ...list.map((it) => it.value));
  return (
    <div className={`relative ${className}`}>
      <div aria-hidden className="absolute left-0 right-0" style={{ top: '50%', height: 1, background: 'hsl(var(--ink) / 0.2)' }} />
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${list.length}, minmax(0, 1fr))` }}>
        {list.map((it, i) => {
          const d = 10 + (it.value / max) * 14;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5 min-w-0">
              <span className="ig-condensed text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--ink-soft))] whitespace-nowrap">{it.top}</span>
              <span
                className="rounded-full ig-print-color"
                style={{ width: d, height: d, background: `hsl(var(${it.tone ?? '--ig-coral'}))`, border: '2px solid hsl(var(--paper))', boxSizing: 'content-box' }}
              />
              <span className="ig-condensed text-[13px] font-semibold text-[hsl(var(--ink))] whitespace-nowrap">{it.bottom}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IgFactLine;
