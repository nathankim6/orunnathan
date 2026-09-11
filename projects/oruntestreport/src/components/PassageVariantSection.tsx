import React from 'react';
import { ArrowRight } from 'lucide-react';
import IgHead from '@/components/ig/IgHead';
import type { PassageVariant } from '@/integrations/supabase/reportService';

interface PassageVariantSectionProps {
  items: PassageVariant[];
}

/**
 * 원문 대조 · 지문 변형 분석.
 *
 * 왼쪽이 교재 원문, 오른쪽이 시험지 문장이다. 가운데 화살표 하나로 방향을
 * 준다. 좁은 화면에서는 두 칸이 위아래로 쌓이므로, 칸마다 대문자 라벨을
 * 붙여 어느 쪽이 원문인지 잃지 않게 한다. 바뀐 쪽에만 옅은 바탕을 깐다.
 */
const PassageVariantSection: React.FC<PassageVariantSectionProps> = ({ items }) => {
  const list = (items || []).filter((v) => v && (v.originalText || v.examText || v.changeDetail));
  if (list.length === 0) return null;

  return (
    <section className="ig-module">
      <IgHead title="원문 대조 · 지문 변형" sub={['SOURCE', 'VS EXAM']} />

      <p className="ig-lede">
        시험 범위 원문과 실제 출제 문장을 문장 단위로 대조해, 변형된 지점과 그 함정을 정리했습니다. 모두
        {' '}
        {list.length}건입니다.
      </p>

      <div className="mt-6 divide-y divide-[hsl(var(--ink)/0.1)]">
        {list.map((v, idx) => (
          <article key={idx} className="py-5 first:pt-0">
            <header className="flex flex-wrap items-center gap-2">
              {v.number && <span className="ig-chip">{v.number}</span>}
              {v.variantType && (
                <span
                  className="ig-chip"
                  style={{ background: `hsl(var(--ig-sand))`, color: 'hsl(var(--ink))' }}
                >
                  {v.variantType}
                </span>
              )}
              {v.source && (
                <span className="ig-leg-l truncate pdf-capture-nowrap">{v.source}</span>
              )}
            </header>

            <div className="mt-3.5 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-3">
              <div className="border-t-2 border-[hsl(var(--ink)/0.2)] pt-2.5">
                <span className="ig-leg-l block">Original · 원문</span>
                <p className="mt-1.5 text-[12.5px] leading-[1.8] text-[hsl(var(--ink-soft))] break-keep">
                  {v.originalText}
                </p>
              </div>

              <div className="hidden md:flex items-center justify-center px-1">
                <ArrowRight className="h-4 w-4 text-[hsl(var(--ink)/0.3)]" />
              </div>

              <div
                className="border-t-2 pt-2.5 px-2.5 pb-2.5 -mx-2.5"
                style={{
                  borderColor: 'hsl(var(--ig-coral))',
                  background: 'hsl(var(--ig-coral) / 0.05)',
                }}
              >
                <span className="ig-leg-l block" style={{ color: 'hsl(var(--ig-coral))' }}>
                  Exam · 출제 문장
                </span>
                <p className="mt-1.5 text-[12.5px] leading-[1.8] text-[hsl(var(--ink))] break-keep">
                  {v.examText}
                </p>
              </div>
            </div>

            {(v.changeDetail || v.impact) && (
              <div className="mt-3.5 space-y-1.5">
                {v.changeDetail && (
                  <p className="text-[12.5px] leading-[1.8] text-[hsl(var(--ink-soft))] break-keep">
                    <strong className="text-[hsl(var(--ink))]">변형 내용 </strong>
                    {v.changeDetail}
                  </p>
                )}
                {v.impact && (
                  <p className="text-[12.5px] leading-[1.8] text-[hsl(var(--ink-soft))] break-keep">
                    <strong className="text-[hsl(var(--ink))]">학습 포인트 </strong>
                    {v.impact}
                  </p>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default PassageVariantSection;
