import React from 'react';
import IgHead from '@/components/ig/IgHead';
import IgHeaderCard from '@/components/ig/IgHeaderCard';
import IgIllustration from '@/components/ig/IgIllustration';
import type { PassageVariant } from '@/integrations/supabase/reportService';

/**
 * 원문 대조 · 지문 변형 — MODERN TIMELINE.
 *
 * 가운데 세로선 위에 번호 원, 왼쪽에 원문(슬레이트 띠), 오른쪽에 출제 문장
 * (코랄 띠). 둘째 항목부터는 좌우를 바꿔 지그재그로 내려간다. 좁은 화면에서는
 * 항상 원문이 먼저. 건수가 0 이면 모듈을 그리지 않는다.
 */
const PassageVariantSection: React.FC<{ items: PassageVariant[]; className?: string }> = ({ items, className = '' }) => {
  const list = (items || []).filter((v) => v && (v.originalText || v.examText || v.changeDetail));
  if (list.length === 0) return null;

  return (
    <section className={`ig-module ${className} ${list.length >= 3 ? 'ig-module-tall' : ''}`}>
      <IgHead title="원문 대조" title2="지문 변형 분석" big={list.length} bigUnit="건" sub={['SOURCE', 'VS EXAM']} aside={<IgIllustration kind="reading" size={92} className="hidden sm:block print:block" />} />
      <p className="ig-lede">시험 범위 원문과 실제 출제 문장을 문장 단위로 대조해, 변형된 지점과 그 함정을 정리했습니다.</p>

      <div className="mt-4">
        {list.map((v, idx) => {
          const swap = idx % 2 === 1;
          const original = (
            <IgHeaderCard tone="--ig-slate" titleEn="Original" title="원문" chip={v.source || undefined}>
              {v.originalText}
            </IgHeaderCard>
          );
          const exam = (
            <IgHeaderCard tone="--ig-coral" titleEn="Exam" title="출제 문장" chip={v.variantType || undefined}>
              {v.examText}
            </IgHeaderCard>
          );
          return (
            <article key={idx} style={{ breakInside: 'avoid', paddingBlock: 14 }}>
              {/* 세 칸의 order 를 전부 명시한다. 하나라도 비우면 기본값 0 인 칸이
                  가운데 40px 칸으로 밀려 들어가 한 글자 폭으로 찌그러진다. */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_40px_1fr] print:grid-cols-[1fr_40px_1fr] gap-3 md:gap-0 print:gap-0 items-stretch">
                <div className={`min-w-0 ${swap ? 'md:order-3 print:order-3' : 'md:order-1 print:order-1'}`}>{original}</div>
                <div className="hidden md:flex print:flex flex-col items-center md:order-2 print:order-2">
                  <span className="ig-num h-[34px] w-[34px] text-[11px] ig-print-color" style={{ background: 'hsl(var(--ig-navy))' }}>
                    {v.number ? `Q.${v.number}` : `${idx + 1}`}
                  </span>
                  <span aria-hidden className="flex-1 w-0 mt-1" style={{ borderLeft: '2px solid hsl(var(--ink) / 0.14)' }} />
                </div>
                <div className={`min-w-0 ${swap ? 'md:order-1 print:order-1' : 'md:order-3 print:order-3'}`}>{exam}</div>
              </div>

              {(v.changeDetail || v.impact) && (
                <div className="mt-3 space-y-1.5">
                  {v.changeDetail && (
                    <p className="text-[12.5px] leading-[1.8] text-[hsl(var(--ink-soft))]" style={{ wordBreak: 'keep-all', overflowWrap: 'anywhere' }}>
                      <strong className="text-[hsl(var(--ink))]">변형 내용 </strong>{v.changeDetail}
                    </p>
                  )}
                  {v.impact && (
                    <p className="text-[12.5px] leading-[1.8] text-[hsl(var(--ink-soft))]" style={{ wordBreak: 'keep-all', overflowWrap: 'anywhere' }}>
                      <strong className="text-[hsl(var(--ink))]">학습 포인트 </strong>{v.impact}
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default PassageVariantSection;
