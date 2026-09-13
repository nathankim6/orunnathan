import React from 'react';

/**
 * 색 견본 띠 — 제호 아래의 팔레트 줄.
 *
 * 레퍼런스 제목 밑에 있는 작은 색 사각형 줄이다. 여기서는 장식이 아니라 색 약속
 * (난도 넷 + 문항 유형 둘)을 미리 보여 주는 범례로 쓴다. 라벨은 대문자 영문.
 */
const IgSwatchStrip: React.FC<{ items: { tone: string; label: string }[]; className?: string }> = ({ items, className = '' }) => (
  <div className={`flex flex-wrap items-end gap-x-3 gap-y-2 ${className}`} role="list" aria-label="색 약속">
    {items.map((it) => (
      <span key={it.label} role="listitem" className="flex flex-col items-start gap-1">
        <span className="ig-print-color block" style={{ width: 22, height: 14, background: `hsl(var(${it.tone}))` }} />
        <span className="ig-condensed text-[9px] font-semibold uppercase tracking-[0.1em] leading-none text-[hsl(var(--ink)/0.55)] whitespace-nowrap">{it.label}</span>
      </span>
    ))}
  </div>
);

export default IgSwatchStrip;
