import React from 'react';

/**
 * 색 헤더 띠 + 본문 카드.
 *
 * 레퍼런스 "MODERN TIMELINE" 의 색 띠 카드다. 위에 색을 가득 채운 얇은 띠(왼쪽
 * 영문·한글 제목, 오른쪽 작은 칩), 아래에 옅은 바탕의 본문. 본문이 없으면
 * 띠만 그린다(타임라인 헤더로 쓸 때).
 */
const IgHeaderCard: React.FC<{
  /** 팔레트 토큰 이름 */
  tone: string;
  title: string;
  titleEn?: string;
  chip?: string;
  children?: React.ReactNode;
  className?: string;
}> = ({ tone, title, titleEn, chip, children, className = '' }) => (
  <div className={`ig-hcard min-w-0 ${className}`}>
    <div
      className="flex items-center justify-between gap-2 ig-print-color"
      style={{ height: 26, padding: '0 10px', background: `hsl(var(${tone}))`, color: 'hsl(var(--paper))' }}
    >
      <span className="flex items-baseline gap-1.5 min-w-0">
        {titleEn && (
          <span className="ig-condensed text-[10px] font-semibold tracking-[0.1em] uppercase opacity-90 whitespace-nowrap">
            {titleEn}
          </span>
        )}
        {titleEn && <span className="opacity-60 text-[10px]">·</span>}
        <span className="text-[12px] font-bold whitespace-nowrap">{title}</span>
      </span>
      {chip && (
        <span
          className="ig-chip"
          style={{ background: 'hsl(var(--paper) / 0.18)', color: 'hsl(var(--paper))', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {chip}
        </span>
      )}
    </div>
    {children !== undefined && children !== null && (
      <div
        className="text-[12.5px] leading-[1.8] text-[hsl(var(--ink))]"
        style={{
          padding: '10px 12px',
          background: `hsl(var(${tone}) / 0.06)`,
          border: `1px solid hsl(var(${tone}) / 0.25)`,
          borderTop: 0,
          overflowWrap: 'anywhere',
          wordBreak: 'normal',
        }}
      >
        {children}
      </div>
    )}
  </div>
);

export default IgHeaderCard;
