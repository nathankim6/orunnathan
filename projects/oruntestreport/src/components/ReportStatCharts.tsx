import React from 'react';
import ProblemTypeBarChart from "@/components/ProblemTypeBarChart";
import IgHead from "@/components/ig/IgHead";
import IgDonut from "@/components/ig/IgDonut";
import IgBars from "@/components/ig/IgBars";
import type { BannerTheme } from "@/lib/logoColor";

interface ReportStatChartsProps {
  stats: {
    objectivePercentage: number;
    subjectivePercentage: number;
    problemTypes: Array<{
      id: string;
      name: string;
      category: string;
      questionType: 'objective' | 'subjective';
      difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
      isVariant?: boolean;
      points?: number;
      isKiller?: boolean;
    }>;
    difficulty: {
      easy: number;
      medium: number;
      hard: number;
      very_hard: number;
    };
  };
  themeColors: any;
  analysisType?: 'simple' | 'detailed';
  reportId?: string;
  banner?: BannerTheme;
}

/**
 * 구성 비율과 난이도.
 *
 * 왼쪽은 납작한 도넛 하나에 객관식·서답형 둘, 오른쪽은 난도 네 줄을 가로
 * 막대로 편다. 둘 다 같은 모듈 안에 두어 "무엇이 몇 문항인가"와 "그게 얼마나
 * 어려웠나"를 한 번에 읽게 한다. 입체나 그림자는 쓰지 않는다.
 */
const ReportStatCharts: React.FC<ReportStatChartsProps> = ({
  stats,
  themeColors,
  analysisType = 'detailed',
  reportId,
  banner,
}) => {
  const isHighSchool = stats.problemTypes.some(
    (p) =>
      p.category === '부교재(모의고사)' ||
      p.category === '단어장' ||
      p.category === '교과서' ||
      p.category === '핸드아웃' ||
      p.category === '부교재' ||
      p.category === '모의고사' ||
      p.category === '워크북'
  );

  const total = stats.problemTypes.length;
  const objectiveCount = stats.problemTypes.filter((p) => p.questionType === 'objective').length;

  return (
    <>
      <section className="ig-module">
        <IgHead title="문항 구성과 난이도" sub={['SHOW OFF', 'YOUR DATA']} />

        <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-10">
          {/* 객관식 · 서답형 */}
          <div>
            <span className="ig-leg-l block">문항 유형</span>
            <IgDonut
              className="mt-4"
              centerCap="전체"
              centerValue={`${total}`}
              segments={[
                { label: '객관식', value: stats.objectivePercentage, color: 'hsl(var(--ig-navy))' },
                { label: '서답형', value: stats.subjectivePercentage, color: 'hsl(var(--ig-coral))' },
              ]}
            />
            <p className="ig-lede">
              전체 {total}문항 가운데 객관식이 {objectiveCount}문항, 서답형이 {total - objectiveCount}문항입니다.
            </p>
          </div>

          {/* 난이도 */}
          <div className="md:border-l md:border-[hsl(var(--ink)/0.1)] md:pl-10">
            <span className="ig-leg-l block">난이도 분포</span>
            <IgBars
              className="mt-5"
              rows={[
                { label: '쉬움', value: stats.difficulty.easy, color: 'hsl(var(--ig-teal))' },
                { label: '보통', value: stats.difficulty.medium, color: 'hsl(var(--ig-slate))' },
                { label: '어려움', value: stats.difficulty.hard, color: 'hsl(var(--ig-sand))' },
                { label: '매우 어려움', value: stats.difficulty.very_hard, color: 'hsl(var(--ig-coral))' },
              ]}
            />
            <div className="ig-rule-soft mt-6" />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="ig-stat">
                  <span className="ig-stat-n ig-stat-n-sm" style={{ color: 'hsl(var(--ig-coral))' }}>
                    {Math.round(stats.difficulty.very_hard)}
                  </span>
                  <span className="ig-stat-u">%</span>
                </div>
                <span className="ig-stat-c block">매우 어려움 비중</span>
              </div>
              <div>
                <div className="ig-stat">
                  <span className="ig-stat-n ig-stat-n-sm">
                    {Math.round(stats.difficulty.hard + stats.difficulty.very_hard)}
                  </span>
                  <span className="ig-stat-u">%</span>
                </div>
                <span className="ig-stat-c block">어려움 이상</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ig-module">
        <IgHead title="출제 유형 분석" sub={['ANALYZE', 'THE DATA']} />

        <div className="mt-6">
          <ProblemTypeBarChart
            problemTypes={stats.problemTypes}
            themeColors={themeColors}
            showMainCategoriesOnly={false}
            isHighSchool={isHighSchool}
            analysisType={analysisType}
            reportId={reportId}
            banner={banner}
          />
        </div>
      </section>
    </>
  );
};

export default ReportStatCharts;
