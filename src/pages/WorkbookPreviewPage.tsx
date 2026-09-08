import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { WorkbookPreview } from "@/components/question/WorkbookPreview";
import { generateWorkbook } from "@/utils/workbookGenerator";
import { useToast } from "@/hooks/use-toast";

const WorkbookPreviewPage = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get data from sessionStorage
    const storedTitle = localStorage.getItem('workbook_title');
    const storedQuestions = localStorage.getItem('workbook_questions');
    
    if (storedTitle) setTitle(storedTitle);
    if (storedQuestions) {
      try {
        setQuestions(JSON.parse(storedQuestions));
      } catch (e) {
        console.error('Failed to parse questions:', e);
      }
    }
  }, []);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await generateWorkbook(questions, title);
      toast({
        title: "다운로드 완료",
        description: "문제집이 다운로드되었습니다.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "다운로드 실패",
        description: "문제집 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!title || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-700 mb-2">데이터 없음</h1>
          <p className="text-slate-500">문제집 데이터를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200">
      {/* Toolbar - Hidden on print */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-semibold text-slate-800 truncate">{title}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              인쇄
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={isGenerating}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? "생성 중..." : "Word 다운로드"}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="pt-20 pb-8 print:pt-0 print:pb-0">
        <div className="max-w-[220mm] mx-auto">
          <WorkbookPreview
            ref={previewRef}
            title={title}
            questions={questions}
          />
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkbookPreviewPage;
