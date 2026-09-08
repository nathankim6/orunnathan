import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, BookOpen, Loader2, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";

interface WorkbookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questions?: Array<{ id: string; content: string; questionNumber: number }>;
}

export const WorkbookDialog = ({ isOpen, onClose, questions }: WorkbookDialogProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<string[]>([]);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      toast({
        title: "파일 형식 오류",
        description: "Word 문서(.docx) 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsParsingFile(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      // Parse questions from the text - split by question numbers
      const questionPattern = /(?:^|\n)(\d+)[.\)]\s*/g;
      const parts = text.split(questionPattern).filter(Boolean);
      
      const extractedQuestions: string[] = [];
      for (let i = 0; i < parts.length - 1; i += 2) {
        const number = parts[i];
        const content = parts[i + 1]?.trim();
        if (content) {
          extractedQuestions.push(`${number}. ${content}`);
        }
      }

      if (extractedQuestions.length === 0) {
        // Try alternative parsing - by line breaks with content
        const lines = text.split('\n').filter(line => line.trim());
        setParsedQuestions(lines);
      } else {
        setParsedQuestions(extractedQuestions);
      }

      toast({
        title: "파일 업로드 완료",
        description: `${extractedQuestions.length || '여러'} 문제를 추출했습니다.`,
      });
    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        title: "파일 파싱 오류",
        description: "Word 파일을 읽는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleOpenPreview = () => {
    if (!title.trim()) {
      toast({
        title: "제목 필요",
        description: "문제집 제목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Use provided questions or parsed questions from file
    const questionsToUse = questions?.map(q => q.content) || parsedQuestions;

    if (questionsToUse.length === 0) {
      toast({
        title: "문제 없음",
        description: "생성된 문제가 없거나 파일을 업로드해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Store data in sessionStorage for the new window
    localStorage.setItem('workbook_title', title.trim());
    localStorage.setItem('workbook_questions', JSON.stringify(questionsToUse));
    
    // Open preview in new window
    const previewWindow = window.open('/workbook-preview', '_blank', 'width=900,height=1000');
    
    if (!previewWindow) {
      toast({
        title: "팝업 차단",
        description: "팝업이 차단되었습니다. 팝업을 허용해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setTitle("");
    setUploadedFile(null);
    setParsedQuestions([]);
    onClose();
  };

  const questionCount = questions?.length || parsedQuestions.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-800">
            <BookOpen className="w-5 h-5" />
            전문 문제집 제작
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="workbookTitle" className="text-sm font-medium">
              문제집 제목
            </Label>
            <Input
              id="workbookTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2025학년도 수능특강 변형문제"
              className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
            />
          </div>

          {/* File Upload Section */}
          {!questions || questions.length === 0 ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Word 파일 업로드</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-colors"
              >
                {isParsingFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                    <span className="text-sm text-amber-700">파일 분석 중...</span>
                  </div>
                ) : uploadedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">{uploadedFile.name}</span>
                    <span className="text-xs text-amber-600">{parsedQuestions.length}개 문제 추출됨</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-amber-400" />
                    <span className="text-sm text-muted-foreground">
                      클릭하여 Word 파일 업로드
                    </span>
                    <span className="text-xs text-muted-foreground">
                      .docx 파일만 지원
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <FileText className="w-5 h-5" />
                <span className="font-medium">현재 생성된 문제 사용</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                {questions.length}개의 문제가 문제집에 포함됩니다.
              </p>
            </div>
          )}

          {/* Preview Info */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-amber-800 text-sm">문제집 설정</h4>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• A4 용지, 2단 레이아웃</li>
              <li>• Noto Sans KR, 폰트 크기 8pt</li>
              <li>• 골드 & 아이보리 프리미엄 디자인</li>
              <li>• 정답 및 해설 별도 섹션</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button
            onClick={handleOpenPreview}
            disabled={!title.trim() || questionCount === 0}
            className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white"
          >
            <Eye className="w-4 h-4 mr-2" />
            미리보기 열기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
