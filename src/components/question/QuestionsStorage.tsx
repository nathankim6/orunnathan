import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Trash2, Download, Calendar, Search, BookOpen } from "lucide-react";
import { useQuestionsStorage, StoredQuestions } from "@/hooks/use-questions-storage";
import { generateWordDocument } from "@/utils/wordDocumentGenerator";
import { downloadTextFile, generateTextFile } from "@/utils/textFileGenerator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { WorkbookDialog } from "./WorkbookDialog";

interface QuestionsStorageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionsStorage = ({ isOpen, onClose }: QuestionsStorageProps) => {
  const { storedQuestions, loading, deleteQuestions } = useQuestionsStorage();
  const [searchQuery, setSearchQuery] = useState("");
  const [workbookItem, setWorkbookItem] = useState<StoredQuestions | null>(null);
  const { toast } = useToast();

  const filteredQuestions = storedQuestions.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadWord = async (item: StoredQuestions) => {
    try {
      const questions = item.questions.map((q, idx) => ({
        id: q.id || `${idx}`,
        content: q.content,
        questionNumber: idx + 1,
      }));

      await generateWordDocument(questions);
      toast({
        title: "다운로드 완료",
        description: "Word 파일이 다운로드되었습니다.",
      });
    } catch (error) {
      console.error("Word 다운로드 실패:", error);
      toast({
        title: "다운로드 실패",
        description: "Word 파일 다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadText = (item: StoredQuestions) => {
    try {
      const questions = item.questions.map((q, idx) => ({
        id: q.id || `${idx}`,
        content: q.content,
        questionNumber: idx + 1,
      }));

      const textContent = generateTextFile(questions);
      const fileName = `${item.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.txt`;
      downloadTextFile(textContent, fileName);

      toast({
        title: "다운로드 완료",
        description: "텍스트 파일이 다운로드되었습니다.",
      });
    } catch (error) {
      console.error("텍스트 다운로드 실패:", error);
      toast({
        title: "다운로드 실패",
        description: "텍스트 파일 다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">문제 저장소</DialogTitle>
          <div className="flex items-center gap-2 mt-2 px-1 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
            <span className="text-sm text-amber-700 dark:text-amber-300">
              ⚠️ 저장된 문제는 생성일로부터 3일 후 자동으로 삭제됩니다.
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="제목으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[500px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "검색 결과가 없습니다." : "저장된 문제가 없습니다."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(item.created_at), "yyyy-MM-dd HH:mm")}</span>
                          <span>•</span>
                          <span>{item.questions.length}개 문제</span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadText(item)}
                          title="텍스트 다운로드"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          텍스트
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadWord(item)}
                          title="Word 다운로드"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Word
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setWorkbookItem(item)}
                          title="문제집 생성"
                          className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          <BookOpen className="w-4 h-4 mr-1" />
                          문제집
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm("정말 삭제하시겠습니까?")) {
                              deleteQuestions(item.id);
                            }
                          }}
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>

      <WorkbookDialog
        isOpen={!!workbookItem}
        onClose={() => setWorkbookItem(null)}
        questions={workbookItem?.questions.map((q: any, idx: number) => ({
          id: q.id || `${idx}`,
          content: q.content,
          questionNumber: idx + 1,
        }))}
      />
    </Dialog>
  );
};
