import React from 'react';
import IgHead from '@/components/ig/IgHead';
import IgDonut from '@/components/ig/IgDonut';
import type { ReportStats } from '@/lib/reportStats';

/** 문항 유형 — 객관식·서답형 도넛 하나. 숫자는 범례가 말한다. */
const TypeDonutSection: React.FC<{ stats: ReportStats; className?: string }> = ({ stats, className = '' }) => {
  if (stats.total === 0) return null;
  return (
    <section className={`ig-module ${className}`}>
      <IgHead title="문항" title2="유형" sub={['TYPE', 'MIX']} />
      <IgDonut
        className="mt-5"
        size={150}
        thickness={15}
        iso
        legend="below"
        centerCap="전체"
        centerValue={stats.total}
        countLabel={(s) => `${s.value}문항`}
        segments={[
          { label: '객관식', value: stats.objective, color: 'hsl(var(--ig-navy))' },
          { label: '서답형', value: stats.subjective, color: 'hsl(var(--ig-coral))' },
        ]}
      />
    </section>
  );
};

export default TypeDonutSection;
