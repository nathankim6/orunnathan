import React from 'react';
import IgHead from '@/components/ig/IgHead';
import IgTimeline from '@/components/ig/IgTimeline';
import type { TierEntry } from '@/lib/reportStats';

/** 수준별 학습 전략 — 상/중/하위권을 세로 타임라인으로. */
const LevelStrategySection: React.FC<{ tiers: TierEntry[]; className?: string }> = ({ tiers, className = '' }) => {
  if (!tiers || tiers.length === 0) return null;
  return (
    <section className={`ig-module ${className}`}>
      <IgHead title="수준별" title2="학습 전략" sub={['BY', 'LEVEL']} />
      <div className="mt-4 flex flex-wrap gap-2">
        {tiers.map((t) => (
          <span key={t.label} className="ig-chip ig-print-color" style={{ background: `hsl(var(${t.tone}))`, textTransform: 'none', letterSpacing: 0 }}>
            {t.label}
          </span>
        ))}
      </div>
      <IgTimeline className="mt-5" entries={tiers.map((t) => ({ label: t.label, labelEn: t.labelEn, body: t.body, tone: t.tone }))} />
    </section>
  );
};

export default LevelStrategySection;
