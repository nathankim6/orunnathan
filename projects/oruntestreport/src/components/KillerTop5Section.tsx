import React from 'react';
import FxStage from '@/components/FxStage';
import ReportSectionHead from '@/components/ReportSectionHead';
import type { KillerProblem } from '@/integrations/supabase/reportService';

interface KillerTop5SectionProps {
  items?: KillerProblem[];
}

/** 등급을 가른 문항 TOP 5 — 리포트 표시용 */
const KillerTop5Section: React.FC<KillerTop5SectionProps> = ({ items }) => {
  const list = (items || []).filter((it) => it.number?.trim() || it.title?.trim() || it.reason?.trim());
  if (list.length === 0) return null;

  // 불티의 세기는 이 문항들이 가져간 배점 합으로 정한다 — 숫자가 그림이 된다.
  const killerPoints = list.reduce((sum, it) => sum + (Number(it.points) || 0), 0);

  return (
    <section className="report-section">
      <ReportSectionHead kicker="KILLER" title={`등급을 가른 문항 TOP ${list.length}`} tone="--c2" />

      <FxStage
        kind="ember"
        options={{ value: Math.min(1, killerPoints / 40), tone: 'hsl(8, 54%, 54%)', count: 100 }}
        height={64}
        label="KILLER"
        readout={`${list.length}문항 · ${killerPoints.toFixed(1)}점`}
        className="mb-4"
      />

      <ol className="space-y-3">
        {list.map((item, index) => (
          <li
            key={index}
            className="relative overflow-hidden rounded-2xl border border-[hsl(var(--ink)/0.1)] bg-[hsl(var(--card))] shadow-[0_6px_24px_-16px_hsl(var(--ink)/0.2)]"
          >
            <div className="h-1 w-full bg-[hsl(var(--c2))]" />
            <div className="flex items-start gap-4 p-5">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[hsl(var(--c2)/0.14)] font-display text-[17px] font-semibold tabular-nums text-[hsl(var(--c2-deep))]">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {item.number?.trim() && (
                    <span className="inline-flex items-center rounded-full bg-[hsl(var(--ink))] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--paper))]">
                      Q.{item.number}
                    </span>
                  )}
                  {item.title?.trim() && (
                    <h3
                      className="text-[15px] font-semibold leading-[1.45] text-[hsl(var(--ink))]"
                      style={{ wordBreak: 'keep-all' }}
                    >
                      {item.title}
                    </h3>
                  )}
                  {typeof item.points === 'number' && item.points > 0 && (
                    <span className="inline-flex items-center rounded-full border border-[hsl(var(--ink)/0.15)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[hsl(var(--ink-soft))]">
                      {item.points}점
                    </span>
                  )}
                </div>

                {item.reason?.trim() && (
                  <p
                    className="mt-2 text-[13.5px] leading-[1.75] text-[hsl(var(--ink-soft))] rp-prose"
                    style={{ wordBreak: 'keep-all' }}
                  >
                    {item.reason}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default KillerTop5Section;
