import React from 'react';
import IgHead from '@/components/ig/IgHead';
import { iconFor } from '@/components/ig/iconFor';
import type { ExamFeature } from '@/integrations/supabase/reportService';

const TONES = ['--ig-coral', '--ig-teal', '--ig-navy', '--ig-sand', '--ig-slate'];

/**
 * 한눈에 보는 출제 특징.
 *
 * 레퍼런스의 번호 원(01~04) 어법이다. 채운 번호 원, 제목 앞 키워드 아이콘,
 * 제목, 설명을 세로로 쌓고 항목 사이는 가는 선. 클로버·허브 원은 두지 않는다
 * (한글 제목 20자를 원 둘레에 놓을 수 없고, 허브는 데이터가 없다).
 */
const ExamFeaturesSection: React.FC<{ features?: ExamFeature[]; className?: string }> = ({ features, className = '' }) => {
  const items = (features || []).filter((f) => f.title?.trim() || f.detail?.trim());
  if (items.length === 0) return null;

  return (
    <section className={`ig-module ${className}`}>
      <IgHead title="한눈에 보는" title2="출제 특징" big={items.length} sub={['KEY', 'FINDINGS']} />
      <div className="mt-5">
        {items.map((feature, index) => {
          const tone = TONES[index % TONES.length];
          return (
            <article
              key={index}
              className="ig-feature grid items-start gap-3 py-4 first:pt-1 last:pb-0"
              style={{ gridTemplateColumns: '36px 1fr', borderTop: index === 0 ? 0 : '1px solid hsl(var(--ink) / 0.13)' }}
            >
              <span className="ig-num h-9 w-9 text-[15px] ig-print-color" style={{ background: `hsl(var(${tone}))` }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <div className="flex items-start gap-2">
                  <span className="mt-[2px] flex-none" style={{ color: `hsl(var(${tone}))` }}>
                    {iconFor(feature.title, { className: 'w-[18px] h-[18px]' })}
                  </span>
                  <h3 className="font-display text-[15px] font-bold leading-[1.5] text-[hsl(var(--ink))]" style={{ wordBreak: 'keep-all' }}>
                    {feature.title}
                  </h3>
                </div>
                {feature.detail?.trim() && <p className="ig-col-b rp-prose" style={{ fontSize: 12.5 }}>{feature.detail}</p>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ExamFeaturesSection;
