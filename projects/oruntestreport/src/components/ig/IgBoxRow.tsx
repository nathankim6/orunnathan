import React from 'react';

/**
 * 백분율 머리 상자 줄.
 *
 * 레퍼런스의 "32% 15% 24% 17% 12%" 줄이다. 위에 큰 백분율, 그 아래 색을 채운
 * 상자 안에 라벨, 상자 밑에 작은 값. 항목 수만큼 같은 폭의 칸을 만든다.
 */
const IgBoxRow: React.FC<{
  items: { label: string; pct: number; tone: string; value?: string }[];
  className?: string;
}> = ({ items, className = '' }) => {
  if (items.length === 0) return null;
  return (
    <div className={`grid gap-2 ${className}`} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((it) => (
        <div key={it.label} className="min-w-0 text-center">
          <span className="ig-condensed block text-[22px] font-bold leading-none tabular-nums" style={{ color: `hsl(var(${it.tone}))` }}>
            {Math.round(it.pct)}<span className="text-[12px] font-semibold">%</span>
          </span>
          <span
            className="ig-print-color mt-1.5 flex h-[28px] items-center justify-center px-1 text-[10.5px] font-bold text-[hsl(var(--paper))]"
            style={{ background: `hsl(var(${it.tone}))`, wordBreak: 'keep-all', overflow: 'hidden' }}
            title={it.label}
          >
            <span className="truncate">{it.label}</span>
          </span>
          {it.value && <span className="ig-condensed mt-1 block text-[11px] font-medium text-[hsl(var(--ink)/0.6)] whitespace-nowrap">{it.value}</span>}
        </div>
      ))}
    </div>
  );
};

export default IgBoxRow;
