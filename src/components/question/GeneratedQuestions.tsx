
import { GeneratedQuestion } from "../GeneratedQuestion";
import { Button } from "@/components/ui/button";
import { Book, BookOpen } from "lucide-react";
import { useState } from "react";
import { VocabularyModal } from "../VocabularyModal";
import { DownloadButton } from "./DownloadButton";
import { QuizBookDialog } from "../quiz-book/QuizBookDialog";

interface Question {
  id: string;
  content: string;
  questionNumber: number;
  originalText?: string;
  type?: string;
  passageTitle?: string;
}

interface GeneratedQuestionsProps {
  questions: Question[];
  onRefresh?: (questionId: string, newContent: string) => void;
}

export const GeneratedQuestions = ({ questions, onRefresh }: GeneratedQuestionsProps) => {
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [isQuizBookOpen, setIsQuizBookOpen] = useState(false);
  
  const sortedQuestions = [...questions].sort((a, b) => {
    if (!a.content && !b.content) return 0;
    if (!a.content) return 1;
    if (!b.content) return -1;
    return a.questionNumber - b.questionNumber;
  });

  const getAllVocabularyContent = () => {
    const vocabQuestions = sortedQuestions
      .filter(question => 
        question.content.includes('| 표제어 |') || 
        question.content.includes('동의어') || 
        question.content.includes('반의어') ||
        question.content.includes('vocabulary')
      )
      .map((question, index) => {
        const content = question.content;
        const tableStart = content.indexOf('|');
        const tableContent = tableStart !== -1 ? content.substring(tableStart) : content;
        return `문제 ${index + 1}\n${tableContent}`;
      });

    return vocabQuestions.join('\n\n');
  };

  const handleRefresh = (questionId: string, newContent: string) => {
    if (onRefresh) {
      onRefresh(questionId, newContent);
    }
  };

  const handleVerified = (results: Array<{ id: string; content: string }>) => {
    // Apply all verified changes
    results.forEach(result => {
      if (onRefresh) {
        onRefresh(result.id, result.content);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative group/qcontainer rounded-2xl p-[1px] bg-gradient-to-br from-indigo-200/60 via-white to-violet-200/50 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_60px_-30px_rgba(99,102,241,0.25)]">
        {/* Inner surface */}
        <div className="relative space-y-0 rounded-[15px] bg-gradient-to-b from-white via-white to-slate-50/70 p-7 overflow-hidden">
          {/* Top accent hairline */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent" />
          {/* Soft corner glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-200/40 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-gradient-to-tr from-violet-200/30 to-transparent blur-3xl" />
          {/* Subtle dot texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'radial-gradient(circle at center, hsl(238 60% 40%) 0.5px, transparent 0.5px)',
              backgroundSize: '14px 14px',
            }}
          />


        
        {sortedQuestions.map((question, index) => {
          const isLoading = !question.content || question.content.trim() === '';
          
          return (
            <div key={question.id} className="relative">
              {/* Dynamic loading effect for each question */}
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-indigo-50/50 to-purple-50/30 rounded-lg animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[slide-in-right_2s_ease-in-out_infinite]" />
                  <div className="flex items-center justify-center h-32">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`transition-all duration-500 ${isLoading ? 'opacity-30 scale-98' : 'opacity-100 scale-100 animate-fade-in'}`}>
                {question.passageTitle && (
                  <div className="text-[11px] text-slate-400 font-medium px-1 mb-0.5 tracking-wide">
                    📄 {question.passageTitle}
                  </div>
                )}
                <GeneratedQuestion 
                  content={question.content}
                  questionNumber={index + 1}
                  originalText={question.originalText}
                  showVocabButton={false}
                  onRefresh={(newContent) => handleRefresh(question.id, newContent)}
                  questionType={question.type}
                />
              </div>
            </div>
          );
        })}
        </div>
      </div>


      {sortedQuestions.length > 0 && (
        <div className="space-y-3">
          <DownloadButton 
            questions={sortedQuestions.map((q, index) => ({
              ...q,
              questionNumber: index + 1
            }))} 
            onVerified={handleVerified} 
          />
          
          {/* 문제집 생성 버튼 */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setIsQuizBookOpen(true)}
              className="max-w-md w-full relative group overflow-hidden transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-50"
            >
              <div className="relative flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <span className="font-semibold tracking-wide text-amber-700">
                  문제집 생성으로 보내기
                </span>
              </div>
            </Button>
          </div>
        </div>
      )}
      
      <VocabularyModal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
        content={getAllVocabularyContent()}
      />

      <QuizBookDialog
        open={isQuizBookOpen}
        onOpenChange={setIsQuizBookOpen}
        initialQuestions={sortedQuestions.map((q, index) => {
          const questionNumber = index + 1;
          const content = q.content.trim();
          const hasNumber = /^\d+\./.test(content);
          const titleMeta = q.passageTitle ? `<!--TITLE:${q.passageTitle}-->` : '';
          const text = hasNumber ? `${titleMeta}${content}` : `${titleMeta}${questionNumber}. ${content}`;
          return text;
        })}
      />
    </div>
  );
};
