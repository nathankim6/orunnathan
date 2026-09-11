import React from 'react';
import IgHead from '@/components/ig/IgHead';

interface DifficultProblemsExplanationProps {
  explanation?: string;
  hasDifficultProblems: boolean;
  themeColors: any;
}

/**
 * 시험 특징 · 킬러 문항 서술.
 *
 * 글 한 덩어리뿐인 구간이라 장식을 얹으면 오히려 읽기 힘들어진다.
 * 제목과 괘선, 그리고 왼쪽 굵은 선 하나로 문단을 붙들어 둔다.
 */
const DifficultProblemsExplanation: React.FC<DifficultProblemsExplanationProps> = ({
  explanation,
  hasDifficultProblems,
}) => {
  if (!hasDifficultProblems || !explanation) return null;

  return (
    <section className="ig-module">
      <IgHead title="시험 특징 & 킬러 문항" sub={['IN', 'DETAIL']} />

      <div className="mt-6 border-l-[3px] border-[hsl(var(--ig-coral))] pl-5">
        <p
          className="text-[13px] md:text-[14px] leading-[1.9] text-[hsl(var(--ink))] whitespace-pre-wrap rp-prose"
          style={{ wordBreak: 'keep-all' }}
        >
          {explanation}
        </p>
      </div>
    </section>
  );
};

export default DifficultProblemsExplanation;
