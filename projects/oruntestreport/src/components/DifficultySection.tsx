import React from 'react';
import IgHead from '@/components/ig/IgHead';
import IgRibbon from '@/components/ig/IgRibbon';
import IgPctCircle from '@/components/ig/IgPctCircle';
import { DIFFICULTIES, DIFF_LABEL, DIFF_LABEL_EN, DIFF_TONE, type ReportStats } from '@/lib/reportStats';

/**
 * 난이도 — 세로 리본 넷과 큰 색 원 하나.
 *
 * 리본은 난도 네 단의 비율(레퍼런스 "ICONS & BARS" 의 73% / 84% / 68% 리본),
 * 원은 "어려움 이상" 비율이다. 같은 숫자를 두 자리에 두지 않는다 — 50% 는
 * 원에만 있다. 유형 안의 난도(눕힌 파이)는 사람 그림 모듈이 맡는다.
 */
const DifficultySection: React.FC<{ stats: ReportStats; className?: string }> = ({ stats, className = '' }) => {
  if (stats.total === 0 || stats.fromForm) return null;
  return (
    <section className={`ig-module ${className}`}>
      <IgHead title="난이도" title2="분포" sub={['HOW', 'HARD']} />
      <div className="mt-4 grid grid-cols-4 gap-3">
        {DIFFICULTIES.map((d) => (
          <IgRibbon key={d} value={stats.byDifficulty[d].pct} count={stats.byDifficulty[d].count} label={DIFF_LABEL[d]} labelEn={DIFF_LABEL_EN[d]} tone={DIFF_TONE[d]} maxHeight={96} />
        ))}
      </div>

      <div className="ig-rule-soft mt-2" />
      <div className="mt-5 flex items-center gap-5">
        <IgPctCircle value={stats.hardPlusPct} label="어려움 이상" tone="--ig-sand" size={92} caption={`${stats.hardPlus}문항 / ${stats.total}`} />
        <p className="ig-lede min-w-0 flex-1" style={{ marginTop: 0 }}>
          어려움과 매우 어려움을 합친 비율입니다. 상위권도 시간을 써야 하는 문항이 {stats.hardPlus}문항이었습니다.
        </p>
      </div>

    </section>
  );
};

export default DifficultySection;
