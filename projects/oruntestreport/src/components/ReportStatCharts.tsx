import React from 'react';
import FxStage from '@/components/FxStage';
import { Card } from "@/components/ui/card";
import QuestionTypePieChart from "@/components/QuestionTypePieChart";
import ProblemTypeBarChart from "@/components/ProblemTypeBarChart";
import DifficultyBarChart from "@/components/DifficultyBarChart";
import ReportSectionHead from "@/components/ReportSectionHead";
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

const SectionHeader: React.FC<{
  numeral: string;
  kicker: string;
  title: string;
  tone?: string;
}> = ({ kicker, title, tone = '--c1' }) => (
  <ReportSectionHead kicker={kicker} title={title} tone={tone} />
);

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

  return (
    <>
      <section className="report-section">
        <SectionHeader
          numeral="I"
        kicker="구성 비율"
          title="객관식 · 서답형 비율과 난이도"
          tone="--c2"
        />

        <div className="bento-grid text-left bg-[hsl(var(--paper-warm))] border border-[hsl(var(--border))] rounded-3xl p-4 md:p-5 shadow-[0_2px_12px_-6px_hsl(var(--ink)/0.04)]">
          {/* 객/서 비율 */}
          <Card className="md:col-span-3 bento-tile border-0 shadow-none">
            <div className="flex items-baseline justify-between mb-5 pl-2">
              <div className="flex items-center gap-2">
                <span className="editorial-kicker tracking-[0.32em] text-[11px] font-bold" style={{ color: 'hsl(var(--c1-deep))' }}>
                  문항 유형
                </span>
                <div className="h-px w-8" style={{ background: 'hsl(var(--c1) / 0.4)' }} />
              </div>
              <span className="font-display text-[hsl(var(--ink))] text-base font-semibold">
                객관식 · 서답형
              </span>
            </div>

            <div className="flex flex-col items-center gap-4 pl-2">
              <div className="w-full h-[368px] print:h-[200px]">
                <QuestionTypePieChart
                  objectivePercentage={stats.objectivePercentage}
                  subjectivePercentage={stats.subjectivePercentage}
                  themeColors={themeColors}
                />
              </div>
            </div>
          </Card>

          {/* 난이도 */}
          <Card className="md:col-span-3 bento-tile border-0 shadow-none">
            <div className="flex items-baseline justify-between mb-5 pr-2">
              <span className="font-display text-[hsl(var(--ink))] text-base font-semibold">
                난이도 분포
              </span>
              <div className="flex items-center gap-2">
                <div className="h-px w-8" style={{ background: 'hsl(var(--c4) / 0.4)' }} />
                <span className="editorial-kicker tracking-[0.32em] text-[11px] font-bold" style={{ color: 'hsl(var(--c4-deep))' }}>
                  난이도
                </span>
              </div>
            </div>
            <div className="h-[368px] pr-2">
              <DifficultyBarChart
                difficulty={stats.difficulty}
                themeColors={themeColors}
              />
            </div>
          </Card>
        </div>

        {/* 같은 수치를 입체로 한 번 더 — 화면에서만 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-3 md:mt-4">
          <FxStage
            kind="ring"
            options={{
              value: stats.objectivePercentage / 100,
              tone: 'hsl(220, 24%, 62%)',
              tone2: 'hsl(42, 40%, 60%)',
            }}
            height={136}
            label="객관식 비중"
            readout={`${Math.round(stats.objectivePercentage)}%`}
          />
          <FxStage
            kind="bars"
            options={{
              values: [
                stats.difficulty.easy / 100,
                stats.difficulty.medium / 100,
                stats.difficulty.hard / 100,
                stats.difficulty.very_hard / 100,
              ],
              colors: [
                'hsl(188, 40%, 52%)',
                'hsl(214, 30%, 60%)',
                'hsl(30, 52%, 58%)',
                'hsl(8, 52%, 56%)',
              ],
            }}
            height={136}
            label="난도 분포"
            readout={`최상 ${Math.round(stats.difficulty.very_hard)}%`}
          />
        </div>
      </section>

      <section className="report-section">
        <SectionHeader
          numeral="III"
        kicker="유형별 분석"
          title="출제 유형 분석"
          tone="--c3"
        />

        {/* 소분류 하나가 점 하나 */}
        <FxStage
          kind="orbit"
          options={{
            count: new Set(stats.problemTypes.map((p) => p.name)).size,
            tone: 'hsl(20, 42%, 58%)',
            tone2: 'hsl(214, 24%, 58%)',
          }}
          height={112}
          label="출제 유형"
          readout={`${new Set(stats.problemTypes.map((p) => p.name)).size}종 · ${stats.problemTypes.length}문항`}
          className="mb-3 md:mb-4"
        />

        <Card className="bento-tile bg-[hsl(var(--paper-warm))] border border-[hsl(var(--border))] p-5 rounded-2xl text-left shadow-[0_1px_2px_-1px_hsl(var(--ink)/0.05)]">
          <ProblemTypeBarChart
            problemTypes={stats.problemTypes}
            themeColors={themeColors}
            showMainCategoriesOnly={false}
            isHighSchool={isHighSchool}
            analysisType={analysisType}
            reportId={reportId}
            banner={banner}
          />
        </Card>
      </section>
    </>
  );
};

export default ReportStatCharts;
