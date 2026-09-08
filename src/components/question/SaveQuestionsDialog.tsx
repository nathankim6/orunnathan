import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuestionsStorage } from "@/hooks/use-questions-storage";

interface SaveQuestionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questions: any[];
}

export const SaveQuestionsDialog = ({
  isOpen,
  onClose,
  questions,
}: SaveQuestionsDialogProps) => {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { saveQuestions } = useQuestionsStorage();

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    setIsSaving(true);
    const success = await saveQuestions(title, questions);
    setIsSaving(false);

    if (success) {
      setTitle("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>문제 저장</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              placeholder="예: 2025년 1월 고1 모의고사"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim()) {
                  handleSave();
                }
              }}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            {questions.length}개의 문제가 저장됩니다.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || isSaving}>
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
