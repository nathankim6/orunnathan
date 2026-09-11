
import { getCategoryAccent } from '@/utils/chartPalette';
import React, { useMemo } from 'react';
import { ChartPie } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateChartData } from "@/utils/chartDataUtils";
import ProblemTypeEmptyState from "./ProblemTypeEmptyState";
import ProblemTypeCard from "./ProblemTypeCard";
import ProblemList from "./ProblemList";
import SubcategoryBreakdown from "./SubcategoryBreakdown";
import type { BannerTheme } from "@/lib/logoColor";

type ProblemType = {
 id: string;
 name: string;
 category: string;
 questionType: 'objective' | 'subjective';
 difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
};

const romanRank = (n: number): string => {
 const map: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III' };
 return map[n] || String(n);
};

type ProblemTypeBarChartProps = {
 problemTypes: ProblemType[];
 themeColors: {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  light: string;
  vibrant: string;
  pastel: string;
  accent2: string;
  highlight: string;
 };
 showMainCategoriesOnly?: boolean;
 isHighSchool?: boolean;
 analysisType?: 'simple' | 'detailed';
 reportId?: string;
 banner?: BannerTheme;
};

const ProblemTypeBarChart: React.FC<ProblemTypeBarChartProps> = ({
 problemTypes,
 themeColors,
 showMainCategoriesOnly = false,
 isHighSchool = false,
 analysisType = 'detailed',
 reportId,
 banner,
}) => {
 const b = banner || {
   from: 'hsl(var(--ink))',
   mid: 'hsl(222 47% 16%)',
   to: 'hsl(var(--ink))',
   accent: 'hsl(var(--gold))',
 };
 // Calculate the chart data by main categories - different logic for middle vs high school
 const chartData = useMemo(() => {
 return calculateChartData(problemTypes, isHighSchool);
 }, [problemTypes, isHighSchool]);

 // Calculate subcategory data for detailed analysis
 const subcategoryData = useMemo(() => {
 const subcategoryCounts: { [key: string]: number } = {};
 problemTypes.forEach(problem => {
 subcategoryCounts[problem.name] = (subcategoryCounts[problem.name] || 0) + 1;
 });
 
 return Object.entries(subcategoryCounts).map(([name, count]) => ({
 name,
 value: count,
 percentage: ((count / problemTypes.length) * 100).toFixed(1)
 })).sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
 }, [problemTypes]);

 // Get the total count of problems
 const totalProblems = problemTypes.length;
 
 if (problemTypes.length === 0) {
 return <ProblemTypeEmptyState />;
 }
 
 return (
 <Card className="bg-transparent rounded-none overflow-hidden border-0 shadow-none relative">
 {/* 상단 헤더색 액센트 라인 */}
 <div
 className="absolute top-0 left-0 right-0 h-[3px]"
 style={{ background: `linear-gradient(90deg, ${b.from}, ${b.accent}, ${b.to})` }}
 />

 {/* 헤더색 테마 헤더 */}
  <CardHeader
  className="border-0 pb-3 pt-0 px-0 relative"
  style={{ background: 'hsl(var(--paper))' }}
  >
  <div className="flex items-end justify-between gap-4">
  <div className="rp-head">
  <span className="rp-glyph" style={{ ['--tone' as never]: 'var(--c2)' }}>
  <ChartPie size={15} />
  </span>
  <div className="flex flex-col gap-1">
  <span className="rp-label">유형 · 분포</span>
  <CardTitle className="font-display text-[17px] md:text-[19px] font-semibold text-[hsl(var(--ink))] tracking-[-0.025em] leading-none">
  문제 유형 분포
  </CardTitle>
  </div>
  </div>

  {/* 우측 수치 */}
  <div className="text-right shrink-0">
  <div className="rp-label">총 문항수</div>
  <div className="rp-metric justify-end mt-1.5">
  <span className="rp-metric-num rp-metric-num-sm">{totalProblems}</span>
  <span className="rp-metric-unit">문항</span>
  </div>
  </div>
  </div>

  {/* 헤더 아래 구분선 — 흰 면 위에서는 가는 선 하나면 충분하다 */}
  <div className="mt-4 h-px w-full" style={{ background: 'hsl(var(--ink) / 0.08)' }} />
 </CardHeader>

 <CardContent className="p-7 bg-[hsl(var(--paper))]">
 {/* 대분류별 통계 */}
 <div className="mb-8">
 <div className="flex items-baseline justify-between mb-3">
 <div className="flex items-center gap-3">
 <span className="font-display text-[hsl(var(--gold-deep))] text-sm">i.</span>
 <h4 className="editorial-kicker text-[hsl(var(--ink))] tracking-[0.28em]">대분류별 통계</h4>
 </div>
 <span className="editorial-kicker text-[hsl(var(--ink-soft)/0.6)] text-[10px] tracking-[0.28em]">대분류</span>
 </div>
 <div className="flex items-center gap-2 mb-5">
 <div className="h-px w-8 bg-[hsl(var(--gold))]" />
 <div className="h-px flex-1 bg-[hsl(var(--ink)/0.08)]" />
 </div>

  {/* 전체 구성 스택 바 + 범례 */}
  <div className="mb-5">
  <div className="flex h-4 w-full overflow-hidden">
  {chartData.map((item, i) => (
  <div
  key={`stack-${i}`}
  title={`${item.name} · ${item.percentage}%`}
  style={{ width: `${item.percentage}%`, background: getCategoryAccent(i).bar }}
  />
  ))}
  </div>
  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
  {chartData.map((item, i) => (
  <div key={`legend-${i}`} className="flex items-center gap-1.5">
  <span className="h-2.5 w-2.5 rounded-full" style={{ background: getCategoryAccent(i).bar }} />
  <span className="text-[12px] font-semibold text-[hsl(var(--ink))]">{item.name}</span>
  <span className="text-[11px] font-medium tabular-nums text-[hsl(var(--ink-soft)/0.8)]">{item.percentage}%</span>
  </div>
  ))}
  </div>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
 {chartData.map((item, index) => (
 <div
 key={index}
 className="animate-fade-in"
 style={{
 animation: `fade-in-up 0.5s ease-out forwards ${0.1 + index * 0.1}s`,
 opacity: 0
 }}
 >
 <ProblemTypeCard
 item={item}
 index={index}
 themeColors={themeColors}
 />
 </div>
 ))}
 </div>
 </div>

 {/* 소분류별 통계 */}
 {analysisType === 'detailed' && (
 <div className="mb-8">
 <div className="flex items-baseline justify-between mb-3">
 <div className="flex items-center gap-3">
 <span className="font-display text-[hsl(var(--gold-deep))] text-sm">ii.</span>
 <h4 className="editorial-kicker text-[hsl(var(--ink))] tracking-[0.28em]">소분류별 통계</h4>
 </div>
 <span className="editorial-kicker text-[hsl(var(--ink-soft)/0.6)] text-[10px] tracking-[0.28em]">소분류</span>
 </div>
 <div className="flex items-center gap-2 mb-5">
 <div className="h-px w-8 bg-[hsl(var(--gold))]" />
 <div className="h-px flex-1 bg-[hsl(var(--ink)/0.08)]" />
 </div>

  <SubcategoryBreakdown data={subcategoryData} total={totalProblems} />
 </div>
 )}

 {/* 문항 목록 */}
 {analysisType === 'detailed' && (
 <div>
 <div className="flex items-baseline justify-between mb-3">
 <div className="flex items-center gap-3">
 <span className="font-display text-[hsl(var(--gold-deep))] text-sm">iii.</span>
 <h4 className="editorial-kicker text-[hsl(var(--ink))] tracking-[0.28em]">문항 목록</h4>
 </div>
 
 </div>
 <div className="flex items-center gap-2 mb-5">
 <div className="h-px w-8 bg-[hsl(var(--gold))]" />
 <div className="h-px flex-1 bg-[hsl(var(--ink)/0.08)]" />
 </div>

 <ProblemList
 problemTypes={problemTypes}
 themeColors={themeColors}
 reportId={reportId}
 />
 </div>
 )}
 </CardContent>
 </Card>
 );
};

export default ProblemTypeBarChart;
