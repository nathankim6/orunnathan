import React from 'react';
import ReportSectionHead from '@/components/ReportSectionHead';
import type { ExamFeature } from '@/integrations/supabase/reportService';

interface ExamFeaturesSectionProps {
  features?: ExamFeature[];
}

/** 한눈에 보는 출제 특징 — 리포트 표시용 */
const ExamFeaturesSection: React.FC<ExamFeaturesSectionProps> = ({ features }) => {
  const items = (features || []).filter((f) => f.title?.trim() || f.detail?.trim());
  if (items.length === 0) return null;

  return (
    <section className="report-section">
      <ReportSectionHead kicker="OVERVIEW" title="한눈에 보는 출제 특징" tone="--c1" />

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((feature, index) => (
          <article
            key={index}
            className="relative overflow-hidden rounded-2xl border border-[hsl(var(--ink)/0.1)] bg-[hsl(var(--paper-warm))] p-5 shadow-[0_6px_24px_-16px_hsl(var(--ink)/0.2)]"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-[hsl(var(--c1))]" />
            <div className="flex items-start gap-3 pl-2">
              <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[hsl(var(--c1)/0.14)] text-[12px] font-bold tabular-nums text-[hsl(var(--c1-deep))]">
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3
                  className="text-[15px] font-semibold leading-[1.5] text-[hsl(var(--ink))]"
                  style={{ wordBreak: 'keep-all' }}
                >
                  {feature.title}
                </h3>
                {feature.detail?.trim() && (
                  <p
                    className="mt-1.5 text-[13.5px] leading-[1.75] text-[hsl(var(--ink-soft))] rp-prose"
                    style={{ wordBreak: 'keep-all' }}
                  >
                    {feature.detail}
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ExamFeaturesSection;
