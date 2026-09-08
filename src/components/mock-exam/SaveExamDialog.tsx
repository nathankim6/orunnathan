import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, FileText, Brain, Zap } from 'lucide-react';
import { useSavedExams } from '@/hooks/use-saved-exams';
import type { QuestionTypeConfig, AnalysisResult } from './MockExamGenerator';

interface SaveExamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questionConfigs: QuestionTypeConfig[];
  analysisResult?: AnalysisResult;
  generatedQuestions?: any;
}

export const SaveExamDialog = ({ 
  isOpen, 
  onClose, 
  questionConfigs, 
  analysisResult, 
  generatedQuestions 
}: SaveExamDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const { saveExam } = useSavedExams();

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    const success = await saveExam(
      title,
      description,
      questionConfigs,
      analysisResult,
      generatedQuestions
    );

    if (success) {
      setTitle('');
      setDescription('');
      onClose();
    }
    setSaving(false);
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md bg-white border border-slate-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Save className="w-4 h-4 text-white" />
            </div>
            모의고사 저장
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-700 font-medium">
              제목 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="모의고사 제목을 입력하세요"
              className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-medium">
              설명 <span className="text-slate-400 text-sm font-normal">(선택)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="모의고사에 대한 설명을 입력하세요"
              rows={3}
              className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>

          {/* Preview info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">포함될 내용</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>문제 유형 설정 ({questionConfigs.length}개 카테고리)</span>
              </div>
              {analysisResult && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Brain className="w-4 h-4 text-blue-500" />
                  <span>GPT 분석 결과</span>
                </div>
              )}
              {generatedQuestions && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span>생성된 문제들</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={saving}
              className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-md"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
