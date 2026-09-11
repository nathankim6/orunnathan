import React from 'react';
import ProblemItem from './ProblemItem';
import ProblemCommentBox from './ProblemCommentBox';
import { useProblemComments } from '@/hooks/useProblemComments';
import type { Difficulty } from '@/lib/reportStats';

type ProblemType = {
  id: string;
  name: string;
  category: string;
  questionType: 'objective' | 'subjective';
  difficulty: Difficulty;
  isVariant?: boolean;
  points?: number;
  isKiller?: boolean;
};

/**
 * 문항 목록 — md 이상·인쇄에서 두 단.
 *
 * 28행짜리 표를 한 단으로 두면 화면 두 장을 잡아먹는다. 반으로 나눠 두 단으로
 * 놓고 단마다 머리글을 반복한다. 요약 띠(전체·객관식·…)는 뺐다 — 같은 숫자가
 * 위 모듈들에 이미 있다. 문항별 코멘트 입력은 그대로 붙어 있다(캡처에서는 숨김).
 */
const Head: React.FC = () => (
  <div className="grid items-center gap-x-2.5 border-b border-[hsl(var(--ink)/0.13)] pb-1.5" style={{ gridTemplateColumns: '24px 30px minmax(0, 1fr) auto' }}>
    {['번호', '유형', '세부유형', '난도'].map((h, i) => (
      <span key={h} className={`ig-col-l ${i === 3 ? 'text-right' : ''}`} style={{ marginTop: 0, fontSize: 10 }}>{h}</span>
    ))}
  </div>
);

const ProblemList: React.FC<{ problemTypes: ProblemType[]; reportId?: string; showKillerBadge?: boolean }> = ({ problemTypes, reportId, showKillerBadge = false }) => {
  const { comments, upsert, addPhoto, removePhoto } = useProblemComments(reportId);
  const list = problemTypes || [];
  if (list.length === 0) {
    return <div className="py-8 text-center text-[13px] text-[hsl(var(--ink-soft))]">등록된 문항이 없습니다.</div>;
  }
  const half = Math.ceil(list.length / 2);
  const columns = list.length > 8 ? [list.slice(0, half), list.slice(half)] : [list];

  return (
    <div className={`grid gap-x-8 gap-y-6 ${columns.length === 2 ? 'grid-cols-1 md:grid-cols-2 print:grid-cols-2' : 'grid-cols-1'}`}>
      {columns.map((col, ci) => (
        <div key={ci} className="min-w-0">
          <Head />
          <div className="divide-y divide-[hsl(var(--ink)/0.08)]">
            {col.map((problem, i) => {
              const index = ci * half + i;
              return (
                <div key={problem.id ?? index} style={{ breakInside: 'avoid' }}>
                  <ProblemItem problem={problem} index={index} showKillerBadge={showKillerBadge} />
                  {reportId && (
                    <ProblemCommentBox
                      problemId={problem.id}
                      comment={comments[problem.id]}
                      onSave={(pid, text) => upsert(pid, { comment: text })}
                      onAddPhoto={addPhoto}
                      onRemovePhoto={removePhoto}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProblemList;
