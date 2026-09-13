import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface CategoryEvaluation {
  category: string;
  evaluation: string;
}

interface OverallEvaluationProps {
  evaluations: CategoryEvaluation[];
  onEvaluationChange: (category: string, value: string) => void;
  selectedCategories?: string[];
  isHighSchool?: boolean;
  gptLoading?: boolean;
  /** category 를 인자로 받아 해당 항목만 AI 첨삭 */
  onGptEnhance?: (category?: string) => void;
}

export const STRATEGY_CATEGORY = '출제 특징';
export const SUMMARY_CATEGORY = '종합의견';

const FIELDS: Array<{ category: string; label: string; hint: string; placeholder: string }> = [
  {
    category: STRATEGY_CATEGORY,
    label: '1. 출제 특징',
    hint: '이번 시험의 지문 활용, 원문 변형, 선택지 구성과 배점상의 특징을 설명합니다.',
    placeholder:
      '예) 어법 3문항과 내용일치 2문항을 복수정답형으로 구성하고, 각 문항에 3.8점을 배정했습니다.',
  },
  {
    category: SUMMARY_CATEGORY,
    label: '2. 담당강사 코멘트',
    hint: '이번 시험의 난이도와 출제 경향, 대비 방안을 학부모님께 전하는 한 단락으로 작성합니다.',
    placeholder: '학부모님께 전할 종합의견을 작성하세요.',
  },
];

const OverallEvaluation: React.FC<OverallEvaluationProps> = ({
  evaluations,
  onEvaluationChange,
  gptLoading = false,
  onGptEnhance,
}) => {
  const valueOf = (category: string) => {
    const found = evaluations.find((e) => e.category === category);
    if (found) return found.evaluation || '';
    // 구버전 '종합 평가' 데이터는 종합의견 칸에 표시
    if (category === SUMMARY_CATEGORY) {
      return evaluations.find((e) => e.category === '종합 평가')?.evaluation || '';
    }
    return '';
  };

  return (
    <div className="space-y-6 w-full">
      {FIELDS.map((field) => (
        <div key={field.category} className="space-y-2 w-full">
          <label
            htmlFor={`eval-${field.category}`}
            className="block text-sm font-semibold text-[hsl(var(--ink))]"
          >
            {field.label}
          </label>
          <div className="relative">
            <Textarea
              id={`eval-${field.category}`}
              value={valueOf(field.category)}
              onChange={(e) => onEvaluationChange(field.category, e.target.value)}
              placeholder={field.placeholder}
              className="min-h-[150px] w-full pr-32 text-[14px] leading-[1.7]"
              style={{ wordBreak: 'keep-all' }}
            />
            {onGptEnhance && (
              <Button
                type="button"
                onClick={() => onGptEnhance(field.category)}
                disabled={gptLoading}
                className="glass-cta absolute top-3 right-3 font-bold tracking-[0.05em]"
                size="sm"
              >
                {gptLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-[hsl(var(--ink))] border-t-transparent mr-2" />
                    첨삭 중
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    AI 첨삭
                  </>
                )}
              </Button>
            )}
          </div>
          <p className="text-[12px] text-[hsl(var(--ink-soft))] break-keep">※ {field.hint}</p>
        </div>
      ))}
    </div>
  );
};

export default OverallEvaluation;
