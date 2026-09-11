import React from 'react';
import IgHead from '@/components/ig/IgHead';
import IgStackedBar from '@/components/ig/IgStackedBar';
import IgFactLine from '@/components/ig/IgFactLine';
import type { KillerProblem } from '@/integrations/supabase/reportService';

const RANK_ALPHA = [1, 0.85, 0.7, 0.55, 0.4];

/**
 * 등급을 가른 문항.
 *
 * 위에 100점 누적 막대(이 문항들이 가져간 배점), 그 아래 팩트 라인(문항마다
 * 배점 점), 그 아래 순위 목록. 번호 원의 농도는 순위다(배점이 아니다 — 1위가
 * 2위보다 배점이 작아도 1위가 진하다). 배점은 팩트 라인 한 자리에만 적는다.
 */
const KillerTop5Section: React.FC<{ items?: KillerProblem[]; className?: string }> = ({ items, className = '' }) => {
  const list = (items || []).filter((it) => it.number?.trim() || it.title?.trim() || it.reason?.trim());
  if (list.length === 0) return null;

  const pointsOk = list.every((it) => typeof it.points === 'number' && Number.isFinite(it.points) && it.points > 0);
  const sum = pointsOk ? list.reduce((s, it) => s + (it.points as number), 0) : 0;
  const barOk = pointsOk && sum <= 100;

  return (
    <section className={`ig-module ${className}`}>
      <IgHead title="등급을 가른" title2={`문항 TOP ${list.length}`} big={list.length} sub={['WHERE', 'IT', 'SPLIT']} />

      {pointsOk && (
        <p className="ig-lede">이 {list.length}문항이 가져간 배점은 모두 {sum.toFixed(1)}점입니다. 점수 차이는 대개 여기에서 갈립니다.</p>
      )}

      {barOk && (
        <IgStackedBar
          className="mt-4"
          total={100}
          height={18}
          labelEn={`이 ${list.length}문항 ${sum.toFixed(1)}점`}
          readout="100점"
          approxWidth={420}
          segments={list.map((it, i) => ({
            key: `${it.number}-${i}`,
            value: it.points as number,
            tone: '--ig-coral',
            alpha: RANK_ALPHA[i] ?? 0.35,
            label: it.number ? `Q.${it.number}` : undefined,
          }))}
        />
      )}

      {pointsOk && (
        <IgFactLine
          className="mt-5"
          items={list.map((it) => ({ top: it.number ? `Q.${it.number}` : '—', bottom: `${it.points}점`, value: it.points as number }))}
        />
      )}

      <ol className="mt-5">
        {list.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0"
            style={{ borderTop: index === 0 ? 0 : '1px solid hsl(var(--ink) / 0.13)', breakInside: 'avoid' }}
          >
            <span className="ig-num h-7 w-7 text-[13px] mt-0.5 ig-print-color" style={{ background: `hsl(var(--ig-coral) / ${RANK_ALPHA[index] ?? 0.35})` }}>
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {item.number?.trim() && <span className="ig-chip">Q.{item.number}</span>}
                {item.title?.trim() && (
                  <h3 className="font-display text-[15px] font-bold leading-[1.45] text-[hsl(var(--ink))]" style={{ wordBreak: 'keep-all' }}>
                    {item.title}
                  </h3>
                )}
              </div>
              {item.reason?.trim() && <p className="ig-col-b rp-prose" style={{ fontSize: 12.5 }}>{item.reason}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default KillerTop5Section;
