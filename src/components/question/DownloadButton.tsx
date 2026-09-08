import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, MessageSquare, FileText, ShieldCheck, Loader2, FileType } from "lucide-react";
import { generateWordDocument, generateWordDocumentWithComments, generateWordDocumentWithEndnotes } from "@/utils/wordDocumentGenerator";
import { generateHwpxDocument } from "@/utils/hwpxDocumentGenerator";
import { useToast } from "@/hooks/use-toast";
import { verifyAllQuestions, VerificationResult } from "@/lib/questionVerifier";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";


interface Question {
  id: string;
  content: string;
  questionNumber: number;
  passageTitle?: string;
}

interface DownloadButtonProps {
  questions: Question[];
  onVerified?: (results: Array<{ id: string; content: string }>) => void;
}

type SaveType = "basic" | "endnotes" | "comments" | "hwpx";

export const DownloadButton = ({ questions, onVerified }: DownloadButtonProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("문제");
  const [selectedSaveType, setSelectedSaveType] = useState<SaveType>("basic");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verifyTotal, setVerifyTotal] = useState(0);
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  

  const handleMenuItemClick = (saveType: SaveType) => {
    setSelectedSaveType(saveType);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsDialogOpen(false);
    const title = documentTitle.trim() || "문제";
    
    try {
      switch (selectedSaveType) {
        case "basic":
          await generateWordDocument(questions, false, title);
          break;
        case "endnotes":
          await generateWordDocumentWithEndnotes(questions, title);
          break;
        case "comments":
          await generateWordDocumentWithComments(questions, title);
          break;
        case "hwpx":
          await generateHwpxDocument(questions, title);
          break;
      }
      toast({
        title: "저장 완료",
        description: "Word 파일이 다운로드되었습니다.",
      });
    } catch (error) {
      console.error("Word 파일 저장 실패:", error);
      toast({
        title: "저장 실패",
        description: "Word 파일 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleVerify = async () => {
    const claudeApiKey = localStorage.getItem("claude_api_key");
    
    if (!claudeApiKey) {
      toast({
        title: "API 키 필요",
        description: "Claude API 키를 설정해주세요.",
        variant: "destructive",
      });
      return;
    }

    const validQuestions = questions.filter(q => q.content && q.content.trim() !== "");
    
    if (validQuestions.length === 0) {
      toast({
        title: "검증할 문제 없음",
        description: "검증할 문제가 없습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    setVerifyProgress(0);
    setVerifyTotal(validQuestions.length);

    try {
      const results = await verifyAllQuestions(
        validQuestions,
        claudeApiKey,
        (current, total) => {
          setVerifyProgress(current);
          setVerifyTotal(total);
        }
      );

      const changedResults = results.filter(r => r.hasChanges);
      
      if (changedResults.length > 0) {
        // Show results dialog
        setVerificationResults(changedResults);
        setIsResultDialogOpen(true);
        
        if (onVerified) {
          const updates = changedResults.map(r => ({
            id: r.questionId,
            content: r.verified,
          }));
          onVerified(updates);
        }
      } else {
        toast({
          title: "검증 완료",
          description: "모든 문제가 정상입니다. 수정 사항이 없습니다.",
        });
      }
    } catch (error) {
      console.error("문제 검증 실패:", error);
      toast({
        title: "검증 실패",
        description: "문제 검증 중 오류가 발생했습니다. API 키를 확인해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
      setVerifyProgress(0);
      setVerifyTotal(0);
    }
  };

  return (
    <>
      <div className="flex justify-center mt-8 gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="max-w-md w-full relative group overflow-hidden transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl border-[#9b87f5]/30 hover:border-[#9b87f5]/50"
            >
              <div className="relative flex items-center justify-center gap-2">
                <FileDown className="w-5 h-5" />
                <span className="font-semibold tracking-wide">
                  Word 파일로 저장
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            <DropdownMenuItem onClick={() => handleMenuItemClick("basic")} className="cursor-pointer">
              <FileDown className="w-4 h-4 mr-2" />
              문제+정답해설(기본)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMenuItemClick("endnotes")} className="cursor-pointer">
              <FileText className="w-4 h-4 mr-2" />
              문제+정답해설(미주)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMenuItemClick("comments")} className="cursor-pointer">
              <MessageSquare className="w-4 h-4 mr-2" />
              교사용(해설 오른쪽)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMenuItemClick("hwpx")} className="cursor-pointer">
              <FileType className="w-4 h-4 mr-2" />
              한컴 HWPX (베타 · 텍스트)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          onClick={handleVerify}
          disabled={isVerifying || questions.length === 0}
          className="relative group overflow-hidden transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-50"
        >
          <div className="relative flex items-center justify-center gap-2">
            {isVerifying ? (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            )}
            <span className="font-semibold tracking-wide text-emerald-700">
              {isVerifying ? `검증 중 (${verifyProgress}/${verifyTotal})` : "문제검증"}
            </span>
          </div>
        </Button>
      </div>

      {isVerifying && (
        <div className="mt-4 px-4">
          <Progress value={(verifyProgress / verifyTotal) * 100} className="h-2" />
          <p className="text-center text-sm text-muted-foreground mt-2">
            Claude Sonnet 4.5로 문제를 검증하고 있습니다...
          </p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>문제지 제목 설정</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="documentTitle">머릿말에 표시될 제목</Label>
              <Input
                id="documentTitle"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="예: 2024 기말고사"
              />
              <p className="text-xs text-muted-foreground">
                머릿말에 "{documentTitle || "문제"}" 로 표시됩니다
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification Results Dialog - only closeable via button */}
      <Dialog open={isResultDialogOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] bg-white dark:bg-slate-900" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
              문제 검증 결과 ({verificationResults.length}건 수정됨)
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {verificationResults.map((result) => (
                <div key={result.questionId} className="border rounded-lg p-4 bg-muted/30">
                  <div className="font-semibold text-lg mb-3 text-primary">
                    문제 {result.questionNumber}번
                  </div>
                  
                  {result.errors.length > 0 ? (
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <div className="font-medium text-amber-800 mb-2">발견된 오류:</div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
                          {result.errors.map((error, errorIndex) => (
                            <li key={errorIndex}>{error}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
                        <div className="font-medium text-emerald-800 mb-2">수정 완료</div>
                        <p className="text-sm text-emerald-700">
                          위 오류가 자동으로 수정되어 적용되었습니다.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-700">
                        형식 또는 내용이 일부 수정되었습니다.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setIsResultDialogOpen(false)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
};
