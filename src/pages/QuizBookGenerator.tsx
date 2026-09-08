import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Printer, BookOpen, ArrowLeft } from "lucide-react";

interface ParsedQuestion {
  number: number;
  content: string;
  answer: string;
  explanation: string;
}

const parseQuestions = (text: string): ParsedQuestion[] => {
  const questions: ParsedQuestion[] = [];
  
  // Clean passage title prefixes like [Title] before splitting
  const cleanedText = text
    .replace(/^\[([^\]]*)\]\s*(?=\d+\.)/gm, '')
    .replace(/^(\d+\.\s*)\[([^\]]*)\]\s*/gm, '$1');
  
  // Split by question numbers like "1.", "2.", etc.
  const questionBlocks = cleanedText.split(/(?=^\d+\.\s)/m).filter(block => block.trim());
  
  questionBlocks.forEach((block, index) => {
    const lines = block.trim();
    
    // Extract answer
    const answerMatch = lines.match(/\[정답\]\s*([^\n\[]+)/);
    const answer = answerMatch ? answerMatch[1].trim() : "";
    
    // Extract explanation
    const explanationMatch = lines.match(/\[해설\]\s*([\s\S]*?)(?=\[|$)/);
    const explanation = explanationMatch ? explanationMatch[1].trim() : "";
    
    // Extract content (everything before [정답])
    const contentMatch = lines.match(/^([\s\S]*?)(?=\[정답\])/);
    const content = contentMatch ? contentMatch[1].trim() : lines;
    
    if (content) {
      questions.push({
        number: index + 1,
        content,
        answer,
        explanation
      });
    }
  });
  
  return questions;
};

export default function QuizBookGenerator() {
  const [inputText, setInputText] = useState("");
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [title, setTitle] = useState("ORUN WRITING");
  const [unitTitle, setUnitTitle] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    const parsed = parseQuestions(inputText);
    setQuestions(parsed);
    setIsGenerated(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    setIsGenerated(false);
    setQuestions([]);
  };

  // Group questions into pages (2 per page - one per column)
  const pages: ParsedQuestion[][] = [];
  for (let i = 0; i < questions.length; i += 2) {
    pages.push(questions.slice(i, i + 2));
  }

  const totalPages = pages.length;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Screen-only controls */}
      <div className="print:hidden p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => window.close()} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              닫기
            </Button>
            <h1 className="text-2xl font-bold text-slate-800">문제집 생성기</h1>
          </div>
          
          {!isGenerated ? (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    문서 제목 (헤더)
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ORUN WRITING"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unit 제목 (선택사항)
                  </label>
                  <Input
                    value={unitTitle}
                    onChange={(e) => setUnitTitle(e.target.value)}
                    placeholder="예: Internet and Customer Power"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  생성된 문제를 붙여넣기 하세요
                </label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="문제를 여기에 붙여넣기..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={!inputText.trim()}
                className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white"
              >
                <BookOpen className="w-4 h-4" />
                문제집 생성
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack}>
                  다시 입력
                </Button>
                <Button onClick={handlePrint} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                  <Printer className="w-4 h-4" />
                  PDF로 저장 / 인쇄
                </Button>
              </div>
              <p className="text-sm text-slate-600">
                * 인쇄 설정에서 "PDF로 저장"을 선택하면 PDF 파일로 저장할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Printable content */}
      {isGenerated && (
        <div ref={printRef} className="print:block">
          {pages.map((pageQuestions, pageIndex) => (
            <div 
              key={pageIndex}
              className="quiz-page bg-white mx-auto my-4 print:my-0 print:mx-0 shadow-xl print:shadow-none relative"
              style={{
                width: "210mm",
                height: "297mm",
                padding: "8mm 10mm",
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: "8pt",
                lineHeight: "1.5",
                pageBreakAfter: "always",
                boxSizing: "border-box"
              }}
            >
              {/* Header */}
              <header 
                className="flex items-center justify-between mb-3"
                style={{ 
                  borderBottom: "1px solid #000",
                  paddingBottom: "4px"
                }}
              >
                <div 
                  style={{ 
                    fontFamily: "'Times New Roman', serif",
                    fontSize: "10pt",
                    fontStyle: "italic",
                    fontWeight: "400",
                    color: "#000"
                  }}
                >
                  {title}
                </div>
                <div style={{ fontSize: "9pt", color: "#000" }}>
                  {pageIndex + 1} / {totalPages}
                </div>
              </header>

              {/* Two-column layout */}
              <div 
                className="grid h-full"
                style={{ 
                  gridTemplateColumns: "1fr 1fr",
                  columnGap: "6mm",
                  height: "calc(100% - 20mm)"
                }}
              >
                {/* Left Column */}
                <div className="column-left" style={{ borderRight: "1px solid #e5e5e5", paddingRight: "5mm" }}>
                  {pageQuestions[0] && (
                    <QuestionBlock 
                      question={pageQuestions[0]} 
                      unitNumber={pageQuestions[0].number}
                      unitTitle={unitTitle}
                    />
                  )}
                </div>

                {/* Right Column */}
                <div className="column-right" style={{ paddingLeft: "1mm" }}>
                  {pageQuestions[1] && (
                    <QuestionBlock 
                      question={pageQuestions[1]} 
                      unitNumber={pageQuestions[1].number}
                      unitTitle={unitTitle}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
        
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .quiz-page {
            page-break-after: always;
            position: relative;
          }
          
          .quiz-page:last-child {
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}

// Separate component for each question block
function QuestionBlock({ 
  question, 
  unitNumber, 
  unitTitle 
}: { 
  question: ParsedQuestion; 
  unitNumber: number;
  unitTitle: string;
}) {
  return (
    <article className="question-block h-full flex flex-col">
      {/* Unit Header */}
      <div 
        className="unit-header mb-3"
        style={{
          backgroundColor: "#f59e0b",
          color: "#fff",
          padding: "4px 10px",
          fontSize: "9pt",
          fontWeight: "600"
        }}
      >
        Unit {unitNumber} {unitTitle && <span className="font-normal ml-2">{unitTitle}</span>}
      </div>
      
      {/* Question content */}
      <div 
        className="question-content flex-1"
        style={{ 
          fontSize: "8pt",
          color: "#000",
          lineHeight: "1.7"
        }}
      >
        {/* Parse and render content with special formatting */}
        <QuestionContent content={question.content} />
      </div>
      
      {/* Answer Box */}
      {question.answer && (
        <div 
          className="answer-box mt-3"
          style={{ 
            border: "1px solid #f59e0b",
            borderRadius: "0",
            padding: "8px 10px",
            backgroundColor: "#fffbeb"
          }}
        >
          <div 
            style={{ 
              fontSize: "7pt",
              color: "#92400e",
              fontWeight: "600",
              marginBottom: "4px"
            }}
          >
            [보기]
          </div>
          <div 
            style={{ 
              fontSize: "8pt",
              color: "#78350f",
              fontStyle: "italic"
            }}
          >
            {question.answer}
          </div>
        </div>
      )}
      
      {/* Explanation if needed */}
      {question.explanation && (
        <div 
          className="explanation mt-2"
          style={{
            fontSize: "7pt",
            color: "#6b7280",
            borderTop: "1px dashed #d1d5db",
            paddingTop: "6px"
          }}
        >
          <span style={{ fontWeight: "600", color: "#374151" }}>[해설]</span> {question.explanation}
        </div>
      )}
    </article>
  );
}

// Component to handle special text formatting
function QuestionContent({ content }: { content: string }) {
  // Remove leading question number
  let cleanContent = content.replace(/^\d+\.\s*/, '');
  
  // Split into paragraphs
  const paragraphs = cleanContent.split('\n\n').filter(p => p.trim());
  
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, idx) => {
        // Check if it's a passage (usually longer text)
        const isPassage = paragraph.length > 200;
        
        // Check for Korean instruction text
        const hasKoreanInstruction = /[가-힣]+/.test(paragraph) && paragraph.length < 100;
        
        // Check for word bank (contains slashes)
        const isWordBank = paragraph.includes(' / ') && paragraph.length < 300;
        
        if (isWordBank) {
          return (
            <div 
              key={idx}
              style={{
                backgroundColor: "#fef3c7",
                border: "1px solid #fcd34d",
                padding: "6px 10px",
                fontSize: "8pt",
                fontStyle: "italic"
              }}
            >
              <span style={{ fontWeight: "600", marginRight: "4px" }}>[보기]</span>
              {paragraph}
            </div>
          );
        }
        
        if (hasKoreanInstruction) {
          return (
            <div 
              key={idx}
              style={{
                fontSize: "8pt",
                fontWeight: "500",
                color: "#1f2937",
                marginTop: "8px",
                marginBottom: "4px"
              }}
            >
              {formatTextWithHighlights(paragraph)}
            </div>
          );
        }
        
        return (
          <p 
            key={idx}
            style={{
              fontSize: isPassage ? "8pt" : "8pt",
              color: "#000",
              textAlign: "justify",
              textIndent: isPassage ? "1em" : "0"
            }}
          >
            {formatTextWithHighlights(paragraph)}
          </p>
        );
      })}
    </div>
  );
}

// Function to format text with underlines, blanks, etc.
function formatTextWithHighlights(text: string) {
  // Split by underlined text markers (assuming format like _underlined_ or __blank__)
  const parts = text.split(/(\([A-Za-z가-힣]\)|\([①②③④⑤]\)|_{2,}|\[.+?\])/g);
  
  return parts.map((part, idx) => {
    // Check for (A), (B), etc.
    if (/^\([A-Za-z]\)$/.test(part)) {
      return (
        <span 
          key={idx} 
          style={{ 
            color: "#dc2626",
            fontWeight: "600"
          }}
        >
          {part}
        </span>
      );
    }
    
    // Check for blanks
    if (/^_{2,}$/.test(part)) {
      return (
        <span 
          key={idx} 
          style={{ 
            display: "inline-block",
            width: "60px",
            borderBottom: "1px solid #000",
            margin: "0 2px"
          }}
        >
          &nbsp;
        </span>
      );
    }
    
    // Check for bracketed content
    if (/^\[.+?\]$/.test(part)) {
      return (
        <span 
          key={idx} 
          style={{ 
            backgroundColor: "#fef9c3",
            padding: "0 4px",
            fontWeight: "500"
          }}
        >
          {part}
        </span>
      );
    }
    
    return part;
  });
}
