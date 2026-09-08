
import { Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  onStopGeneration?: () => void;
}

export const GenerateButton = ({ onClick, isLoading, onStopGeneration }: GenerateButtonProps) => {
  const handleClick = () => {
    if (isLoading && onStopGeneration) {
      onStopGeneration();
    } else {
      onClick();
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={`
        flex-1 h-10 rounded-lg font-medium text-[13px] transition-all duration-200 shadow-sm
        ${isLoading 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-slate-800 hover:bg-slate-900 text-white'
        }
      `}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <Square className="w-4 h-4" />
            <span>생성 중단</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>문제 생성하기</span>
          </>
        )}
      </div>
    </Button>
  );
};
