import React from 'react';
import { UserRound } from 'lucide-react';
import IgHead from '@/components/ig/IgHead';
import IgIllustration from '@/components/ig/IgIllustration';

/**
 * 담당 강사 종합의견.
 *
 * 학부모가 가장 오래 읽는 자리다. 도표를 빼고 글에 자리를 내준다. 강사 글은
 * 손대지 않는다(첫 문장 강조·자르기 금지). 수준별 전략을 타임라인으로 나누지
 * 못했을 때는 그 문단도 여기 위에 그대로 둔다.
 */
const TeacherOverallSection: React.FC<{
  teacher: string;
  teacherPhoto?: string;
  overall?: string;
  /** 타임라인으로 못 나눈 수준별 전략 원문 */
  strategyFallback?: string;
  className?: string;
}> = ({ teacher, teacherPhoto, overall, strategyFallback, className = '' }) => {
  const body = overall?.trim()
    || '문제 난이도는 평이했으며, 기본 개념을 잘 이해하고 있다면 충분히 해결할 수 있는 문제들로 구성되어 있습니다.';
  return (
    <section className={`ig-module ${className}`}>
      <IgHead title="담당 강사" title2="종합의견" sub={["TEACHER'S", 'NOTE']} aside={<IgIllustration kind="feedback" size={92} className="hidden sm:block print:block" />} />

      <div className="mt-5 flex items-center gap-4">
        {teacherPhoto ? (
          <img src={teacherPhoto} alt={teacher || '담당 강사'} className="h-[76px] w-[76px] flex-none object-cover" style={{ borderRadius: 2 }} decoding="sync" />
        ) : (
          <span className="flex h-[76px] w-[76px] flex-none items-center justify-center" style={{ background: 'hsl(var(--ink) / 0.06)', borderRadius: 2 }}>
            <UserRound className="w-8 h-8 text-[hsl(var(--ink)/0.35)]" strokeWidth={1.5} />
          </span>
        )}
        <div className="min-w-0">
          <span className="ig-col-l block" style={{ marginTop: 0 }}>담당 강사</span>
          <p className="mt-1 font-display text-[16px] font-bold leading-tight text-[hsl(var(--ink))]">{teacher || 'ORUN ENGLISH'}</p>
        </div>
      </div>

      <div className="ig-rule-soft mt-4" />

      {strategyFallback && (
        <div className="mt-4">
          <span className="ig-col-l block" style={{ color: 'hsl(var(--ig-coral))' }}>수준별 학습 전략</span>
          <p className="mt-2 whitespace-pre-wrap text-[14px] leading-[1.9] text-[hsl(var(--ink))] rp-prose" style={{ wordBreak: 'keep-all', maxWidth: '40em' }}>
            {strategyFallback}
          </p>
          <div className="ig-rule-soft mt-4" />
        </div>
      )}

      <span className="ig-col-l block mt-4" style={{ color: 'hsl(var(--ig-coral))' }}>종합의견</span>
      <p className="mt-2 whitespace-pre-wrap text-[14px] leading-[1.9] text-[hsl(var(--ink))] rp-prose" style={{ wordBreak: 'keep-all', maxWidth: '40em' }}>
        {body}
      </p>
    </section>
  );
};

export default TeacherOverallSection;
