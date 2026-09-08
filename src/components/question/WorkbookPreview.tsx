import { forwardRef } from "react";

interface WorkbookPreviewProps {
  title: string;
  questions: string[];
}

export const WorkbookPreview = forwardRef<HTMLDivElement, WorkbookPreviewProps>(
  ({ title, questions }, ref) => {
    // Parse question content to extract question, answer, explanation
    const parseQuestion = (content: string) => {
      const lines = content.split('\n');
      let question = content;
      let answer = '';
      let explanation = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('정답:') || line.includes('답:') || line.includes('Answer:')) {
          question = lines.slice(0, i).join('\n');
          answer = line.replace(/정답:|답:|Answer:/g, '').trim();
        }
        if (line.includes('해설:') || line.includes('설명:') || line.includes('Explanation:')) {
          explanation = lines.slice(i).join('\n').replace(/해설:|설명:|Explanation:/g, '').trim();
        }
      }
      
      return { question: question.trim(), answer, explanation };
    };

    const parsedQuestions = questions.map((q, i) => ({
      number: i + 1,
      ...parseQuestion(q)
    }));

    // Split questions into pages (4 questions per page in 2 columns = 2 per column)
    const questionsPerPage = 4;
    const pages: typeof parsedQuestions[] = [];
    for (let i = 0; i < parsedQuestions.length; i += questionsPerPage) {
      pages.push(parsedQuestions.slice(i, i + questionsPerPage));
    }

    return (
      <div ref={ref} className="bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        {/* Title Page */}
        <div 
          className="relative bg-gradient-to-br from-amber-50 to-yellow-50 flex flex-col items-center justify-center"
          style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            padding: '20mm',
            pageBreakAfter: 'always'
          }}
        >
          {/* Decorative Border */}
          <div className="absolute inset-4 border-2 border-amber-300 rounded-lg" />
          <div className="absolute inset-6 border border-amber-200 rounded-lg" />
          
          {/* Corner Decorations */}
          <div className="absolute top-8 left-8 w-16 h-16 border-l-4 border-t-4 border-amber-400 rounded-tl-lg" />
          <div className="absolute top-8 right-8 w-16 h-16 border-r-4 border-t-4 border-amber-400 rounded-tr-lg" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-l-4 border-b-4 border-amber-400 rounded-bl-lg" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-r-4 border-b-4 border-amber-400 rounded-br-lg" />
          
          {/* Title Content */}
          <div className="text-center z-10">
            <div className="mb-8">
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4" />
              <span className="text-amber-600 text-sm tracking-[0.3em] uppercase">Workbook</span>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-4" />
            </div>
            
            <h1 className="text-3xl font-bold text-amber-900 mb-6 leading-relaxed">
              {title}
            </h1>
            
            <div className="w-32 h-0.5 bg-amber-300 mx-auto mb-6" />
            
            <p className="text-amber-700 text-sm">
              총 {questions.length}문제
            </p>
          </div>
          
          {/* Bottom Pattern */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-200" />
            <div className="w-2 h-2 rounded-full bg-amber-300" />
          </div>
        </div>

        {/* Question Pages */}
        {pages.map((pageQuestions, pageIndex) => (
          <div
            key={pageIndex}
            className="relative bg-white"
            style={{ 
              width: '210mm', 
              minHeight: '297mm', 
              padding: '15mm 12mm',
              pageBreakAfter: 'always'
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-amber-200">
              <span className="text-amber-600 text-xs font-medium">{title}</span>
              <span className="text-amber-500 text-xs">문제</span>
            </div>
            
            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6" style={{ fontSize: '8pt' }}>
              {pageQuestions.map((q, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-gradient-to-br from-amber-50/50 to-transparent rounded-lg border border-amber-100"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold">
                      {q.number}
                    </span>
                  </div>
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-xs">
                    {q.question}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer */}
            <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center pt-3 border-t border-amber-100">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-amber-300" />
                <div className="w-1 h-1 rounded-full bg-amber-200" />
                <div className="w-1 h-1 rounded-full bg-amber-300" />
              </div>
              <span className="text-amber-500 text-xs">{pageIndex + 1}</span>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-amber-300" />
                <div className="w-1 h-1 rounded-full bg-amber-200" />
                <div className="w-1 h-1 rounded-full bg-amber-300" />
              </div>
            </div>
          </div>
        ))}

        {/* Answer & Explanation Section */}
        <div
          className="relative bg-gradient-to-br from-slate-50 to-white"
          style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            padding: '15mm 12mm',
            pageBreakAfter: 'always'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-3 mb-6 border-b-2 border-amber-300">
            <span className="text-amber-800 font-bold text-sm">정답 및 해설</span>
            <span className="text-amber-600 text-xs">{title}</span>
          </div>
          
          {/* Two Column Answer Layout */}
          <div className="grid grid-cols-2 gap-4" style={{ fontSize: '8pt' }}>
            {parsedQuestions.map((q, idx) => (
              <div key={idx} className="p-2 border-b border-amber-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-amber-700">{q.number}.</span>
                  <span className="font-semibold text-amber-900">
                    {q.answer || '정답 확인 필요'}
                  </span>
                </div>
                {q.explanation && (
                  <p className="text-gray-600 text-xs leading-relaxed pl-4">
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

WorkbookPreview.displayName = "WorkbookPreview";
