import React from 'react';
import IgHead from '@/components/ig/IgHead';
import type { KillerProblem } from '@/integrations/supabase/reportService';

interface KillerTop5SectionProps {
  items?: KillerProblem[];
}

/**
 * 등급을 가른 문항.
 *
 * 레퍼런스의 순위 열 어법이다. 색이 채워진 번호 원, 문항 번호 칩, 제목,
 * 배점. 그 아래 설명 한 문단. 줄과 줄은 가는 가로선으로만 나눈다.
 * 배점이 큰 문항일수록 원이 진해져, 어느 문항이 무거웠는지 훑기만 해도
 * 보인다.
 */
const KillerTop5Section: React.FC<KillerTop5SectionProps> = ({ items }) => {
  const list = (items || []).filter((it) => it.number?.trim() || it.title?.trim() || it.reason?.trim());
  if (list.length === 0) return null;

  const totalPoints = list.reduce((sum, it) => sum + (Number(it.points) || 0), 0);
  const maxPoints = Math.max(1, ...list.map((it) => Number(it.points) || 0));

  return (
    <section className="ig-module">
      <IgHead title="등급을 가른 문항" title2={`TOP ${list.length}`} sub={['WHERE', 'IT SPLIT']} />

      <p className="ig-lede">
        이 {list.length}문항이 가져간 배점은 모두 {totalPoints.toFixed(1)}점입니다. 점수 차이는 대개 여기에서
        갈립니다.
      </p>

      <ol className="mt-6 divide-y divide-[hsl(var(--ink)/0.1)]">
        {list.map((item, index) => {
          const pts = Number(item.points) || 0;
          const weight = 0.35 + (pts / maxPoints) * 0.65;
          return (
            <li key={index} className="flex items-start gap-4 py-4 first:pt-0">
              <span
                className="ig-num h-9 w-9 text-[15px] mt-0.5"
                style={{ background: `hsl(var(--ig-coral) / ${weight.toFixed(2)})` }}
              >
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {item.number?.trim() && <span className="ig-chip">Q.{item.number}</span>}
                  {item.title?.trim() && (
                    <h3
                      className="font-display text-[14.5px] md:text-[15.5px] font-bold leading-[1.45] text-[hsl(var(--ink))]"
                      style={{ wordBreak: 'keep-all' }}
                    >
                      {item.title}
                    </h3>
                  )}
                  {pts > 0 && <span className="ig-chip ig-chip-ghost">{pts}점</span>}
                </div>

                {item.reason?.trim() && <p className="ig-col-b rp-prose">{item.reason}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default KillerTop5Section;
