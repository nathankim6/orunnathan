import React, { useState } from 'react';
import { Wrench } from "lucide-react";
import { QuizBookDialog } from "@/components/quiz-book/QuizBookDialog";
import storageIcon from "@/assets/icons/storage-icon.png";
import mockExamIcon from "@/assets/icons/mock-exam-icon.png";
import quizBookIcon from "@/assets/icons/quiz-book-icon.png";
import vocabBookIcon from "@/assets/icons/vocab-book-icon.png";
import bugReportIcon from "@/assets/icons/bug-report-icon.png";

interface ActionButtonsProps {
  openVocabModal: () => void;
  onGenerate?: () => void;
  isLoading?: boolean;
  difficulty?: string;
  complexity?: string;
  onDifficultyChange?: (level: string) => void;
  onComplexityChange?: (level: string) => void;
  onStopGeneration?: () => void;
  handleDownloadDoc?: () => void;
  openStorageModal?: () => void;
}

const toolItems = [
  {
    id: 'storage',
    icon: storageIcon,
    title: '문제 저장소',
    color: 'blue',
    isExternal: false,
  },
  {
    id: 'mockExam',
    icon: mockExamIcon,
    title: '동형모의고사',
    color: 'orange',
    isExternal: false,
  },
  {
    id: 'quizBook',
    icon: quizBookIcon,
    title: '문제집 생성',
    color: 'emerald',
    isExternal: false,
  },
  {
    id: 'vocabBook',
    icon: vocabBookIcon,
    title: '단어장제작기',
    color: 'cyan',
    href: 'https://vocabbook-60.lovable.app/',
    isExternal: true,
  },
  {
    id: 'bugReport',
    icon: bugReportIcon,
    title: '버그리포트',
    color: 'rose',
    href: 'https://vocal-sherbet-9f540f.netlify.app/',
    isExternal: true,
  },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; hover: string; border: string }> = {
    blue: { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', border: 'hover:border-blue-300' },
    orange: { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', border: 'hover:border-orange-300' },
    cyan: { bg: 'bg-cyan-50', hover: 'hover:bg-cyan-100', border: 'hover:border-cyan-300' },
    rose: { bg: 'bg-rose-50', hover: 'hover:bg-rose-100', border: 'hover:border-rose-300' },
    emerald: { bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', border: 'hover:border-emerald-300' },
  };
  return colors[color] || colors.blue;
};

export const ActionButtons = ({
  openVocabModal,
  openStorageModal
}: ActionButtonsProps) => {
  const [isQuizBookOpen, setIsQuizBookOpen] = useState(false);

  const handleClick = (id: string) => {
    if (id === 'storage' && openStorageModal) {
      openStorageModal();
    } else if (id === 'mockExam') {
      openVocabModal();
    } else if (id === 'quizBook') {
      setIsQuizBookOpen(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-md border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_-4px_rgba(15,23,42,0.06)] overflow-hidden">
        {/* Navy title bar */}
        <div className="flex items-center justify-between px-4 h-10 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-indigo-400 rounded-sm" />
            <Wrench className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[12px] font-semibold tracking-wide text-slate-100 uppercase">
              Toolbox
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400 tabular-nums">
            {toolItems.length.toString().padStart(2, '0')} modules
          </span>
        </div>

        {/* Compact Grid */}
        <div className="p-3 grid grid-cols-2 gap-2 bg-slate-50/40">
          {toolItems.map((item) => {
            const colors = getColorClasses(item.color);

            const content = (
              <div className={`group flex flex-col items-center gap-2 p-3 rounded-md border border-slate-200 ${colors.border} bg-white hover:bg-slate-50 transition-all duration-150 cursor-pointer hover:shadow-sm`}>
                <div className={`w-11 h-11 rounded-md ${colors.bg} ${colors.hover} flex items-center justify-center transition-colors overflow-hidden`}>
                  <img src={item.icon} alt={item.title} className="w-8 h-8 object-contain" />
                </div>
                <span className="text-xs font-medium text-slate-700 text-center leading-tight font-sans">{item.title}</span>
              </div>
            );

            if (item.isExternal && item.href) {
              return (
                <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" className="block">
                  {content}
                </a>
              );
            }

            return (
              <button key={item.id} onClick={() => handleClick(item.id)} className="block w-full text-left">
                {content}
              </button>
            );
          })}
        </div>
      </div>

      <QuizBookDialog open={isQuizBookOpen} onOpenChange={setIsQuizBookOpen} />
    </>
  );
};
