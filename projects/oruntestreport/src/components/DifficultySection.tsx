import React from 'react';
import IgHead from '@/components/ig/IgHead';
import IgRibbon from '@/components/ig/IgRibbon';
import IgPctCircle from '@/components/ig/IgPctCircle';
import { DIFFICULTIES, DIFF_LABEL, DIFF_LABEL_EN, DIFF_TONE, type ReportStats } from '@/lib/reportStats';

/**
 * 난이도 분포 — 세로 리본 넷과 큰 색 원 하나.
 *
 * 리본은 난도 네 단의 비율, 아래 원은 "어려움 이상" 비율이다. 이 원이 페이지에서
 * 50% 가 나오는 유일한 자리다. 같은 숫자를 두 곳에 두지 않는다.
 */
const DifficultySection: React.FC<{ stats: ReportStats; className?: string }> = ({ stats, className = '' }) => {
  if (stats.total === 0 || stats.fromForm) return null;
  return (
    <section className={`ig-module ${className}`}>
      <IgHead title="난이도" title2="분포" sub={['HOW', 'HARD']} />
      <div className="mt-4 grid grid-cols-4 gap-3">
        {DIFFICULTIES.map((d) => (
          <IgRibbon
            key={d}
            value={stats.byDifficulty[d].pct}
            count={stats.byDifficulty[d].count}
            label={DIFF_LABEL[d]}
            labelEn={DIFF_LABEL_EN[d]}
            tone={DIFF_TONE[d]}
          />
        ))}
      </div>
      <div className="ig-rule-soft mt-2" />
      <div className="mt-5 flex justify-center">
        <IgPctCircle
          value={stats.hardPlusPct}
          label="어려움 이상"
          tone="--ig-sand"
          size={96}
          caption={`${stats.hardPlus}문항 / ${stats.total}`}
        />
      </div>
    </section>
  );
};

export default DifficultySection;
