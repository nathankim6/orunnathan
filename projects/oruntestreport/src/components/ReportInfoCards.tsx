import React from 'react';
import { School, GraduationCap, ClipboardList, UserRound, BookOpenText } from 'lucide-react';

interface ReportInfoCardsProps {
  reportData: {
    school: string;
    grade: string;
    examScope: string;
    teacher: string;
    examInfo?: string;
  };
  themeColors: any;
}

/**
 * 시험 기본 정보.
 *
 * 레퍼런스의 아이콘 열 어법이다. 아이콘 하나, 그 아래 대문자 라벨, 다시
 * 그 아래 값. 칸끼리는 가는 세로선으로만 나눈다. 카드로 띄우면 네 덩어리가
 * 따로 놀지만, 한 줄로 묶어 두면 시험 한 건의 신상으로 읽힌다.
 */
const Field: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}> = ({ icon, label, value, tone }) => (
  <div className="px-3 py-1 first:pl-0 last:pr-0">
    <span className="block" style={{ color: `hsl(var(${tone}))` }}>
      {icon}
    </span>
    <span className="ig-col-l block">{label}</span>
    <p
      className="mt-1.5 font-display font-semibold leading-snug text-[hsl(var(--ink))] text-[14px] md:text-[16px]"
      style={{ wordBreak: 'keep-all' }}
    >
      {value}
    </p>
  </div>
);

const ReportInfoCards: React.FC<ReportInfoCardsProps> = ({ reportData }) => {
  const examInfo = reportData.examInfo || '미지정';

  return (
    <section className="ig-module">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[hsl(var(--ink)/0.1)] gap-y-5">
        <Field
          icon={<School className="w-5 h-5" />}
          label="School"
          value={reportData.school}
          tone="--ig-navy"
        />
        <Field
          icon={<GraduationCap className="w-5 h-5" />}
          label="Grade"
          value={reportData.grade}
          tone="--ig-teal"
        />
        <Field
          icon={<ClipboardList className="w-5 h-5" />}
          label="Exam"
          value={examInfo}
          tone="--ig-coral"
        />
        <Field
          icon={<UserRound className="w-5 h-5" />}
          label="Teacher"
          value={reportData.teacher}
          tone="--ig-sand"
        />
      </div>

      <div className="ig-rule-soft mt-5" />

      <div className="mt-4 flex items-start gap-3">
        <BookOpenText className="w-5 h-5 flex-none text-[hsl(var(--ig-slate))]" />
        <div className="min-w-0">
          <span className="ig-col-l block" style={{ marginTop: 0 }}>
            Exam Scope
          </span>
          <p
            className="mt-1.5 font-display font-semibold leading-snug text-[hsl(var(--ink))] text-[14px] md:text-[16px]"
            style={{ wordBreak: 'keep-all' }}
          >
            {reportData.examScope}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReportInfoCards;
