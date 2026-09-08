import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  MoreVertical, 
  Trash2, 
  Eye, 
  Brain,
  Zap,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSavedExams, SavedExam } from '@/hooks/use-saved-exams';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface SavedExamItemProps {
  exam: SavedExam;
  onView: (exam: SavedExam) => void;
}

export const SavedExamItem = ({ exam, onView }: SavedExamItemProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteExam } = useSavedExams();

  const handleDelete = async () => {
    await deleteExam(exam.id);
    setShowDeleteDialog(false);
  };

  const totalQuestions = exam.question_configs.reduce(
    (sum, config) => sum + config.questionTypes.reduce((s, qt) => s + (qt.count || 0), 0),
    0
  );

  const hasAnalysis = !!exam.analysis_result;
  const hasGeneratedQuestions = !!exam.generated_questions;

  return (
    <>
      <Card 
        className="group relative overflow-hidden bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={() => onView(exam)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        <div className="relative z-10 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-slate-800 mb-1 truncate group-hover:text-indigo-600 transition-colors">
                {exam.title}
              </h3>
              {exam.description && (
                <p className="text-sm text-slate-500 line-clamp-1">
                  {exam.description}
                </p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-100 h-8 w-8 p-0"
                >
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-slate-200 shadow-lg">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(exam);
                  }}
                  className="text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  보기
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium">
              <FileText className="w-3 h-3 mr-1" />
              {totalQuestions}문제
            </Badge>
            
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium">
              {exam.question_configs.length}개 카테고리
            </Badge>

            {hasAnalysis && (
              <Badge className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100">
                <Brain className="w-3 h-3 mr-1" />
                분석완료
              </Badge>
            )}

            {hasGeneratedQuestions && (
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100">
                <Zap className="w-3 h-3 mr-1" />
                생성완료
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-slate-400">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(exam.updated_at), 'MM월 dd일 HH:mm', { locale: ko })}
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
              열기
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border-slate-200" onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800">시험 삭제</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              '{exam.title}' 시험을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-800">
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
