import { useState, useEffect } from "react";
import { useQuestionContext } from "./QuestionContext";
import { useToast } from "@/hooks/use-toast";
import { DifficultySelector } from "./difficulty-selector/DifficultySelector";
import { GenerateButton } from "./buttons/GenerateButton";
import { ClearButton } from "./buttons/ClearButton";
import { Button } from "@/components/ui/button";
import { Settings2, PlayCircle } from "lucide-react";
import { LoadingProgress } from "../LoadingProgress";

interface ActionButtonsProps {
  onGenerate: () => void;
  onContinueGeneration?: () => void;
  isLoading: boolean;
  difficulty?: string;
  onDifficultyChange?: (level: string) => void;
  complexity?: string;
  onComplexityChange?: (level: string) => void;
  onStopGeneration?: () => void;
  handleDownloadDoc?: () => void;
  progress?: {
    current: number;
    total: number;
  };
  generationStats?: {
    hasGenerated: boolean;
    hasUngenerated: boolean;
    totalQuestions: number;
    generatedCount: number;
  };
}

export const ActionButtons = ({
  onGenerate,
  onContinueGeneration,
  isLoading,
  difficulty = "1",
  onDifficultyChange,
  complexity = "수능",
  onComplexityChange,
  onStopGeneration,
  handleDownloadDoc,
  progress,
  generationStats
}: ActionButtonsProps) => {
  const [localDifficulty, setLocalDifficulty] = useState(difficulty);
  const [localComplexity, setLocalComplexity] = useState(complexity);
  const {
    selectedTypes,
    onRemoveType
  } = useQuestionContext();
  const {
    toast
  } = useToast();
  const [hasHancomApiKey, setHasHancomApiKey] = useState(false);

  useEffect(() => {
    setLocalDifficulty(difficulty);
  }, [difficulty]);

  useEffect(() => {
    setLocalComplexity(complexity);
  }, [complexity]);

  useEffect(() => {
    const apiKey = localStorage.getItem("hancom_api_key");
    setHasHancomApiKey(!!apiKey);
  }, []);

  const handleClearAll = () => {
    if (isLoading && onStopGeneration) {
      onStopGeneration();
    }

    selectedTypes.forEach(typeEntry => {
      onRemoveType(typeEntry.type.id);
    });
    toast({
      title: "초기화 완료",
      description: "모든 문제 유형과 생성된 문제가 삭제되었습니다."
    });
  };

  const handleSliderChange = (value: number[]) => {
    const newDifficulty = String(value[0]) as "1" | "2" | "3";
    setLocalDifficulty(newDifficulty);
    onDifficultyChange?.(newDifficulty);
  };

  const handleComplexityChange = (level: string) => {
    setLocalComplexity(level);
    onComplexityChange?.(level);
  };

  return (
    <div className="space-y-4">
      {/* Settings Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <Settings2 className="w-4 h-4 text-slate-500" />
          <span className="text-[13px] font-medium text-slate-700">난이도 설정</span>
        </div>
        <div className="p-4">
          <DifficultySelector 
            localDifficulty={localDifficulty} 
            onDifficultyChange={handleSliderChange} 
            complexity={localComplexity} 
            onComplexityChange={handleComplexityChange} 
          />
        </div>
      </div>

      {/* Action Buttons Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-3">
          <GenerateButton onClick={onGenerate} isLoading={isLoading} onStopGeneration={onStopGeneration} />
          
          {!isLoading && generationStats?.hasGenerated && generationStats?.hasUngenerated && onContinueGeneration && (
            <Button
              onClick={onContinueGeneration}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all duration-200"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              이어서 생성 ({generationStats.generatedCount}/{generationStats.totalQuestions})
            </Button>
          )}
          
          <ClearButton onClick={handleClearAll} />
        </div>
        
        {isLoading && progress && progress.total > 0 && (
          <div className="mt-4">
            <LoadingProgress current={progress.current} total={progress.total} onStop={onStopGeneration} />
          </div>
        )}
      </div>
    </div>
  );
};
