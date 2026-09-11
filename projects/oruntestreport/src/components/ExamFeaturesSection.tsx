import React from 'react';
import IgHead from '@/components/ig/IgHead';
import type { ExamFeature } from '@/integrations/supabase/reportService';

interface ExamFeaturesSectionProps {
  features?: ExamFeature[];
}

const TONES = ['--ig-coral', '--ig-teal', '--ig-navy', '--ig-sand', '--ig-slate'];

/**
 * 한눈에 보는 출제 특징.
 *
 * 레퍼런스의 번호 열 어법이다. 큰 번호 한 자리, 그 아래 대문자 라벨 대신
 * 특징 제목, 다시 그 아래 설명. 상자를 두르지 않고 위에 굵은 색 선을 한 줄
 * 그어 칸을 나눈다. 선 색만 바뀌어도 네 칸이 서로 구분된다.
 */
const ExamFeaturesSection: React.FC<ExamFeaturesSectionProps> = ({ features }) => {
  const items = (features || []).filter((f) => f.title?.trim() || f.detail?.trim());
  if (items.length === 0) return null;

  return (
    <section className="ig-module">
      <IgHead title="한눈에 보는 출제 특징" sub={['KEY', 'FINDINGS']} />

      <div className="mt-6 grid gap-x-7 gap-y-7 md:grid-cols-2">
        {items.map((feature, index) => {
          const tone = TONES[index % TONES.length];
          return (
            <article key={index}>
              <div className="h-[3px] w-full" style={{ background: `hsl(var(${tone}))` }} />
              <div className="mt-3.5 flex items-start gap-3.5">
                <span
                  className="ig-stat-n ig-stat-n-sm"
                  style={{ color: `hsl(var(${tone}))`, lineHeight: 0.8 }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3
                    className="font-display text-[14.5px] md:text-[15.5px] font-bold leading-[1.5] text-[hsl(var(--ink))]"
                    style={{ wordBreak: 'keep-all' }}
                  >
                    {feature.title}
                  </h3>
                  {feature.detail?.trim() && <p className="ig-col-b rp-prose">{feature.detail}</p>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ExamFeaturesSection;
