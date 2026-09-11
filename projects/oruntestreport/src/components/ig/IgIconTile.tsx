import React from 'react';

/**
 * 색 정사각 타일 안의 흰 아이콘.
 *
 * 레퍼런스 "USEFUL ICONS" 줄의 메일·@·사람·전화 타일이다. 아이콘은 lucide 로 넣고
 * 타일 색은 토큰으로 준다. 옆이나 아래에 짧은 라벨과 값을 붙일 수 있다.
 */
const IgIconTile: React.FC<{
  icon: React.ReactNode;
  tone?: string;
  label?: string;
  value?: string;
  size?: number;
  /** 라벨 위치 */
  layout?: 'below' | 'right';
  className?: string;
}> = ({ icon, tone = '--ig-navy', label, value, size = 52, layout = 'right', className = '' }) => (
  <div className={`flex ${layout === 'below' ? 'flex-col items-center text-center' : 'items-center'} gap-3 ${className}`}>
    <span
      className="flex flex-none items-center justify-center text-[hsl(var(--paper))]"
      style={{ width: size, height: size, background: `hsl(var(${tone}))` }}
    >
      {icon}
    </span>
    {(label || value) && (
      <span className="min-w-0">
        {label && <span className="ig-col-l block" style={{ marginTop: 0 }}>{label}</span>}
        {value && (
          <span className="block font-display text-[14px] font-bold leading-snug text-[hsl(var(--ink))]" style={{ wordBreak: 'keep-all' }}>
            {value}
          </span>
        )}
      </span>
    )}
  </div>
);

export default IgIconTile;
