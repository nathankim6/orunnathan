import React from 'react';
import IgHead from '@/components/ig/IgHead';
import IgDevices from '@/components/ig/IgDevices';
import IgQr from '@/components/ig/IgQr';
import { coarseShares, type Problem, type ReportStats } from '@/lib/reportStats';

/**
 * 온라인으로 보기 — 기기 목업과 학생 제출 QR.
 *
 * 레퍼런스 "VECTOR ACCESSORIES / ELECTRONIC DEVICES" 다. 기기 화면 안에는 이
 * 리포트의 데이터가 작게 다시 그려지고, 아래 QR 은 이 시험의 학생 오답 제출
 * 주소다. 저장된 리포트(id 가 있는 경우)에서만 그린다 — 주소가 없으면 QR 도 없다.
 */
const IgLabel: React.FC<{ en: string; ko: string }> = ({ en, ko }) => (
  <div className="min-w-0 text-center">
    <span className="ig-col-l block" style={{ marginTop: 0 }}>{en}</span>
    <span className="block text-[11.5px] font-bold text-[hsl(var(--ink))]" style={{ wordBreak: 'keep-all' }}>{ko}</span>
  </div>
);

const OnlineSection: React.FC<{ stats: ReportStats; problems?: Problem[]; reportId?: string; className?: string }> = ({
  stats, problems, reportId, className = '',
}) => {
  if (!reportId) return null;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const submitUrl = `${origin}/submit/${reportId}`;
  const cats = coarseShares(problems).map((c) => ({ tone: c.tone, count: c.count }));

  return (
    <section className={`ig-module ${className}`}>
      <IgHead title="온라인으로" title2="보기" sub={['ON EVERY', 'SCREEN']} />
      <div className="mx-auto w-full" style={{ maxWidth: 640 }}>
      <IgDevices className="mt-5" categories={cats} problems={problems} byDifficulty={stats.byType.all} />
      <div className="mt-2 grid grid-cols-4 gap-2">
        <IgLabel en="Computer" ko="출제 유형" />
        <IgLabel en="Laptop" ko="문항 지도" />
        <IgLabel en="Tablet" ko="난도 분포" />
        <IgLabel en="Phone" ko="오답 제출" />
      </div>
      </div>

      <div className="ig-rule-soft mt-4" />
      <div className="mt-4 flex items-center gap-4">
        <IgQr text={submitUrl} size={84} />
        <div className="min-w-0">
          <span className="ig-col-l block" style={{ marginTop: 0, color: 'hsl(var(--ig-coral))' }}>Student submit · 학생 오답 제출</span>
          <p className="mt-1 text-[12.5px] leading-[1.7] text-[hsl(var(--ink))]" style={{ wordBreak: 'keep-all' }}>
            스마트폰 카메라로 QR 을 찍으면 이 시험의 오답을 제출할 수 있습니다. 제출 결과는 담당 강사가 문항별로 확인합니다.
          </p>
          <p className="ig-condensed mt-1 text-[11px] font-medium text-[hsl(var(--ink)/0.55)]" style={{ overflowWrap: 'anywhere' }}>{submitUrl}</p>
        </div>
      </div>
    </section>
  );
};

export default OnlineSection;
