import React from 'react';
import IgHead from '@/components/ig/IgHead';
import teacherIcon from '@/assets/teacher-icon.png';
import type { BannerTheme } from '@/lib/logoColor';

interface CategoryEvaluation {
  category: string;
  evaluation: string;
}

interface TeacherCommentProps {
  teacherPhoto?: string;
  teacher: string;
  overallEvaluation?: string;
  themeColors: any;
  isHighSchool?: boolean;
  banner?: BannerTheme;
}

/**
 * 담당 강사 코멘트.
 *
 * 보고서에서 학부모가 가장 오래 읽는 자리다. 그래서 여기만큼은 도표를 빼고
 * 글에 자리를 내준다. 왼쪽에 강사, 오른쪽에 글. 항목은 대문자 라벨과 가는
 * 선으로만 나눈다.
 */
const TeacherComment: React.FC<TeacherCommentProps> = ({
  teacherPhoto,
  teacher,
  overallEvaluation,
}) => {
  const ORDER = ['수준별 학습 전략', '종합의견'];

  let evaluationCategories: CategoryEvaluation[] = [];
  try {
    if (overallEvaluation) {
      const parsed: CategoryEvaluation[] = JSON.parse(overallEvaluation);
      evaluationCategories = parsed
        // 구버전 '종합 평가' 데이터는 '종합의견'으로 매핑
        .map((item) => ({
          ...item,
          category: item.category === '종합 평가' ? '종합의견' : item.category,
        }))
        .filter((item) => item.evaluation?.trim() !== '' && ORDER.includes(item.category))
        .sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category));
    }
  } catch (e) {
    if (overallEvaluation && overallEvaluation.trim() !== '') {
      evaluationCategories = [{ category: '종합의견', evaluation: overallEvaluation }];
    }
  }

  if (evaluationCategories.length === 0) {
    evaluationCategories = [
      {
        category: '종합의견',
        evaluation:
          '문제 난이도는 평이했으며, 기본 개념을 잘 이해하고 있다면 충분히 해결할 수 있는 문제들로 구성되어 있습니다.',
      },
    ];
  }

  return (
    <section className="ig-module">
      <IgHead title="담당 강사 코멘트" sub={["TEACHER'S", 'NOTE']} />

      <div className="mt-6 flex flex-col gap-6 md:flex-row md:gap-9">
        <div className="flex flex-none items-center gap-3.5 md:w-[124px] md:flex-col md:items-start">
          <img
            src={teacherPhoto || teacherIcon}
            alt={teacher || '담당 강사'}
            className="h-16 w-16 md:h-[76px] md:w-[76px] flex-none object-cover"
            style={{ borderRadius: 2, background: 'hsl(var(--ink) / 0.05)' }}
          />
          <div className="min-w-0">
            <span className="ig-leg-l block">담당 강사</span>
            <p className="mt-1 font-display text-[15px] font-bold leading-tight text-[hsl(var(--ink))]">
              {teacher || 'ORUN ENGLISH'}
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          {evaluationCategories.map((item, i) => (
            <div key={i}>
              <span className="ig-leg-l block" style={{ color: 'hsl(var(--ig-coral))' }}>
                {item.category}
              </span>
              <div className="ig-rule-soft" />
              <p
                className="mt-3 whitespace-pre-wrap text-[13px] md:text-[14px] leading-[1.9] text-[hsl(var(--ink))] rp-prose"
                style={{ wordBreak: 'keep-all' }}
              >
                {item.evaluation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeacherComment;
